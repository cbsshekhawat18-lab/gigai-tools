# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright 2026 Chandrabhan Shekhawat, Gigai Kripa Services.
# AGPL-3.0, not Apache-2.0, because this module uses PyMuPDF. See LICENSE here.
"""PDF text repair: fix lossy-CMap Devanagari via render + OCR (hybrid).

Why this exists: many Indian government PDFs (electoral rolls above all) embed
fonts whose ToUnicode map is broken, so EVERY text-layer extractor - pdf.js,
PyMuPDF, pdfminer alike - emits Devanagari with the vowel signs (matras)
destroyed. The glyphs still RENDER correctly, so OCR of the rendered page
recovers the true text. Measured on a real Jaipur Nagar Nigam roll: text layer
0% matras; Tesseract `hin` at 2.0x render reads names at 92-97% confidence.

Hybrid merge, because OCR misreads what the text layer gets right: the text
layer keeps ASCII exactly (serials, EPIC IDs, ages, punctuation - OCR turned
one ID into Devanagari digits), and OCR replaces only runs of words that
contain Devanagari.

Privacy contract (matches the platform rule for server-side steps): the upload
is written to a private temp file, processed, and deleted in a `finally`; the
result is held in memory only, returned once, and purged on fetch or after a
short TTL. Nothing is logged beyond page counts and nothing is stored.
"""

from __future__ import annotations

import os
import re
import subprocess
import tempfile
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

import pymupdf

MAX_PAGES = 120
SCALE = 2.0  # accuracy drops measurably below this; hin+eng adds 55% time for nothing
# psm 11 (sparse text): on multi-column layouts with photos, psm 6's block
# segmentation glues words across lines into tall boxes; 11 recovered more
# words with half the tall-box artifacts on the reference roll.
MIN_CONF = 40.0

# Unicode script blocks -> default Tesseract traineddata. Detection works on
# DAMAGED text because a broken ToUnicode map garbles characters within the
# same block - the script itself always survives. Users can override (Urdu vs
# Arabic, Traditional vs Simplified) via the `langs` field.
SCRIPTS: list[tuple[str, list[tuple[int, int]], str]] = [
    ("devanagari", [(0x0900, 0x097F)], "hin"),
    ("bengali", [(0x0980, 0x09FF)], "ben"),
    ("gurmukhi", [(0x0A00, 0x0A7F)], "pan"),
    ("gujarati", [(0x0A80, 0x0AFF)], "guj"),
    ("oriya", [(0x0B00, 0x0B7F)], "ori"),
    ("tamil", [(0x0B80, 0x0BFF)], "tam"),
    ("telugu", [(0x0C00, 0x0C7F)], "tel"),
    ("kannada", [(0x0C80, 0x0CFF)], "kan"),
    ("malayalam", [(0x0D00, 0x0D7F)], "mal"),
    ("thai", [(0x0E00, 0x0E7F)], "tha"),
    ("arabic", [(0x0600, 0x06FF), (0x0750, 0x077F)], "ara"),
    ("hebrew", [(0x0590, 0x05FF)], "heb"),
    ("greek", [(0x0370, 0x03FF)], "ell"),
    ("cyrillic", [(0x0400, 0x04FF)], "rus"),
    ("kana", [(0x3040, 0x30FF)], "jpn"),
    ("hangul", [(0xAC00, 0xD7AF), (0x1100, 0x11FF)], "kor"),
    ("cjk", [(0x4E00, 0x9FFF)], "chi_sim"),
]
LANG_RE = re.compile(r"^[a-z_]{3,8}(\+[a-z_]{3,8}){0,3}$")


def installed_langs() -> set[str]:
    try:
        out = subprocess.run(["tesseract", "--list-langs"], capture_output=True, timeout=10)
        return {l.strip() for l in out.stdout.decode().splitlines()[1:] if l.strip()}
    except Exception:
        return set()


def detect_langs(doc: "pymupdf.Document") -> list[str]:
    """Rank non-Latin scripts present in the text layer, most glyphs first."""
    counts = {name: 0 for name, _, _ in SCRIPTS}
    for page in doc:
        for ch in page.get_text():
            cp = ord(ch)
            for name, ranges, _ in SCRIPTS:
                if any(a <= cp <= b for a, b in ranges):
                    counts[name] += 1
                    break
    ranked = sorted(
        ((n, c) for n, c in counts.items() if c >= 50), key=lambda x: -x[1]
    )
    langs = [next(l for n2, _, l in SCRIPTS if n2 == n) for n, _ in ranked]
    return langs[:2]
JOB_TTL_SECONDS = 20 * 60
# One OCR at a time: OCR is CPU-heavy and shares the server with Video -> Work.
_OCR_GATE = threading.Semaphore(1)


@dataclass
class RepairJob:
    id: str
    status: str = "queued"  # queued | running | done | error
    error: str | None = None
    page: int = 0
    pages: int = 0
    result: dict[str, Any] | None = None
    langs: str = ""
    created: float = field(default_factory=time.time)


_JOBS: dict[str, RepairJob] = {}
_JOBS_LOCK = threading.Lock()


def _purge_stale() -> None:
    now = time.time()
    with _JOBS_LOCK:
        for jid in [j for j, job in _JOBS.items() if now - job.created > JOB_TTL_SECONDS]:
            _JOBS.pop(jid, None)


def tesseract_available() -> bool:
    return len(installed_langs()) > 1


def _script_ranges(langs: list[str]) -> list[tuple[int, int]]:
    ranges: list[tuple[int, int]] = []
    for _, rs, lang in SCRIPTS:
        if lang in langs:
            ranges.extend(rs)
    return ranges


def _has_script(s: str, ranges: list[tuple[int, int]]) -> bool:
    return any(any(a <= ord(ch) <= b for a, b in ranges) for ch in s)


def _ocr_words(png: bytes, langs: str) -> list[tuple[float, float, float, float, str]]:
    """Tesseract TSV -> [(x0, y0, x1, y1, text)] in PIXEL coords."""
    env = dict(os.environ, OMP_THREAD_LIMIT="2")
    proc = subprocess.run(
        ["tesseract", "stdin", "stdout", "-l", langs, "--psm", "11", "tsv"],
        input=png, capture_output=True, timeout=180, env=env,
    )
    words: list[tuple[float, float, float, float, str]] = []
    for row in proc.stdout.decode("utf-8", "replace").split("\n")[1:]:
        c = row.split("\t")
        if len(c) != 12 or not c[11].strip():
            continue
        try:
            conf = float(c[10])
            left, top, w, h = float(c[6]), float(c[7]), float(c[8]), float(c[9])
        except ValueError:
            continue
        if conf >= MIN_CONF:
            # ZWNJ/ZWJ are OCR artifacts here - real joiner semantics never
            # survive the render+recognise round trip anyway.
            text = c[11].strip().replace("\u200c", "").replace("\u200d", "")
            if text:
                words.append((left, top, left + w, top + h, text))
    return words


def _merge_page(page: pymupdf.Page, langs: str, ranges: list[tuple[int, int]]) -> list[dict[str, Any]]:
    """Text-layer words with target-script runs replaced by OCR at the same spot."""
    height = page.rect.height
    layer = page.get_text("words")  # (x0, y0, x1, y1, text, block, line, word)
    if not layer:
        # Image-only page (a scan): there is no text layer to repair, so
        # full-page OCR is the only text there is. Coords come back in pixels
        # at SCALE; convert to page points like the repair path does.
        png = page.get_pixmap(matrix=pymupdf.Matrix(SCALE, SCALE), colorspace="gray").tobytes("png")
        return [
            _token(o[0] / SCALE, o[1] / SCALE, o[3] / SCALE, o[4], height)
            for o in _ocr_words(png, langs)
        ]
    if not any(_has_script(w[4], ranges) for w in layer):
        # Text layer present and nothing to repair - no render, no OCR.
        return [_token(w[0], w[1], w[3], w[4], height) for w in layer]

    png = page.get_pixmap(matrix=pymupdf.Matrix(SCALE, SCALE), colorspace="gray").tobytes("png")
    ocr = _ocr_words(png, langs)
    # Drop segmentation artifacts: a word box much taller than the median has
    # been glued across lines and would satisfy the y-test for several runs.
    heights = sorted(o[3] - o[1] for o in ocr)
    med_h = heights[len(heights) // 2] if heights else 0
    if med_h:
        ocr = [o for o in ocr if o[3] - o[1] <= 2.0 * med_h]

    # Group the text layer into lines (y-overlap), keeping x order.
    lines: list[list[tuple[float, float, float, float, str]]] = []
    for w in sorted(layer, key=lambda w: (w[1], w[0])):
        placed = lines[-1] if lines else None
        if placed and min(placed[0][3], w[3]) - max(placed[0][1], w[1]) > 0.5 * (w[3] - w[1]):
            placed.append(w)
        else:
            lines.append([w])

    tokens: list[dict[str, Any]] = []
    for line in sorted(lines, key=lambda l: l[0][1]):
        line.sort(key=lambda w: w[0])
        run: list[tuple[float, float, float, float, str]] = []

        def flush_run() -> None:
            if not run:
                return
            x0 = run[0][0]
            x1 = max(w[2] for w in run)
            y0 = min(w[1] for w in run)
            y1 = max(w[3] for w in run)
            # Match by the OCR word's CENTER falling inside the run's band -
            # a leaked tall box has its centre between lines and matches nothing.
            band0, band1 = (y0 - 1) * SCALE, (y1 + 1) * SCALE
            hits = sorted(
                (
                    o
                    for o in ocr
                    if band0 <= (o[1] + o[3]) / 2 <= band1
                    and o[2] > (x0 - 2) * SCALE
                    and o[0] < (x1 + 2) * SCALE
                ),
                key=lambda o: o[0],
            )
            text = " ".join(o[4] for o in hits).strip()
            # An OCR word can glue the neighbouring label through its colon
            # ("नाम:पुष्कर" spanning the boundary): if the replacement carries a
            # colon the original run never had, keep what follows the last one.
            if text and ":" in text and not any(":" in w[4] for w in run):
                text = text.rsplit(":", 1)[-1].strip()
            if not text:
                text = " ".join(w[4] for w in run)  # OCR missed: keep damaged text
            tokens.append(_token(x0, y0, y1, text, height))
            run.clear()

        for w in line:
            if _has_script(w[4], ranges):
                # A wide horizontal jump is a column gutter, never a word gap:
                # joining across it fuses neighbouring records into one token.
                if run and w[0] - run[-1][2] > max(12.0, (w[3] - w[1]) * 0.8):
                    flush_run()
                run.append(w)
            else:
                flush_run()
                tokens.append(_token(w[0], w[1], w[3], w[4], height))
        flush_run()
    return tokens


def _token(x0: float, y0: float, y1: float, text: str, page_h: float) -> dict[str, Any]:
    # pdf.js-shaped: bottom-origin baseline y, so the browser engine is agnostic
    # to which extractor produced the tokens.
    return {"str": text, "x": round(x0, 1), "y": round(page_h - y1, 1), "h": round(y1 - y0, 1)}


def _run(job: RepairJob, path: str, langs_req: str) -> None:
    try:
        with _OCR_GATE:
            job.status = "running"
            doc = pymupdf.open(path)
            try:
                job.pages = min(len(doc), MAX_PAGES)
                if langs_req and langs_req != "auto":
                    langs = [l for l in langs_req.split("+") if l]
                else:
                    langs = detect_langs(doc) or ["eng"]
                have = installed_langs()
                langs = [l for l in langs if l in have] or ["eng"]
                lang_str = "+".join(langs)
                ranges = _script_ranges(langs)
                if not ranges:
                    # Latin-script languages: repair every alphabetic run.
                    ranges = [(0x0041, 0x024F)]
                job.langs = lang_str
                pages = []
                for i in range(job.pages):
                    job.page = i + 1
                    page = doc[i]
                    pages.append(
                        {
                            "width": round(page.rect.width, 1),
                            "height": round(page.rect.height, 1),
                            "tokens": _merge_page(page, lang_str, ranges),
                        }
                    )
                job.result = {"pages": pages, "langs": lang_str}
                job.status = "done"
            finally:
                doc.close()
    except Exception as exc:  # noqa: BLE001 - surfaced to the client verbatim-ish
        job.status = "error"
        job.error = str(exc)[:300]
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


def start_job(pdf_bytes: bytes, langs: str = "auto") -> RepairJob:
    _purge_stale()
    if langs != "auto" and not LANG_RE.match(langs):
        raise ValueError("invalid langs")
    fd, path = tempfile.mkstemp(suffix=".pdf", prefix="repair-")
    with os.fdopen(fd, "wb") as fh:
        fh.write(pdf_bytes)
    job = RepairJob(id=uuid.uuid4().hex)
    with _JOBS_LOCK:
        _JOBS[job.id] = job
    threading.Thread(target=_run, args=(job, path, langs), daemon=True).start()
    return job


def get_job(job_id: str) -> RepairJob | None:
    _purge_stale()
    with _JOBS_LOCK:
        return _JOBS.get(job_id)


def take_result(job_id: str) -> dict[str, Any] | None:
    """Return the result once and purge it - nothing lingers server-side."""
    with _JOBS_LOCK:
        job = _JOBS.get(job_id)
        if job and job.result is not None:
            result, job.result = job.result, None
            _JOBS.pop(job_id, None)
            return result
    return None
