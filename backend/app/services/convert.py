"""Ephemeral document conversion via LibreOffice (headless).

This is the *only* place in the codebase that touches user file **content**, and
it does so under a strict, privacy-first contract:

- Every request gets its own ``tempfile.TemporaryDirectory``.
- The upload is written there, converted with ``soffice --headless``, and the
  result is streamed back to the caller.
- The temp directory (upload **and** output) is deleted immediately after the
  response is sent — see :func:`app.api.convert` which schedules the cleanup on a
  Starlette ``BackgroundTask``.
- **Nothing** is persisted: no database rows, no object storage, no logging of
  filenames or bytes. Only coarse, content-free telemetry (durations, sizes,
  error classes) is ever emitted.

LibreOffice is single-instance per user profile, so each invocation is pinned to
an isolated ``-env:UserInstallation`` inside the request's temp dir. That keeps
concurrent conversions from stomping on a shared profile lock.
"""

from __future__ import annotations

import asyncio
import logging
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Final

logger = logging.getLogger("app.services.convert")

# ── Conversion contract ───────────────────────────────────────────────────────

# Wall-clock ceiling for a single LibreOffice invocation. Complex documents can
# take a while to lay out; beyond this we give up rather than pin a worker.
CONVERT_TIMEOUT_SECONDS: Final[int] = 120

# LibreOffice binary candidates, in preference order. ``soffice`` is the real
# executable; ``libreoffice`` is the Debian wrapper. Resolved lazily + cached.
_SOFFICE_CANDIDATES: Final[tuple[str, ...]] = ("soffice", "libreoffice")

# ``--convert-to`` filter strings. The bare extension works, but naming the
# export filter explicitly makes the output format deterministic across LO
# versions (e.g. modern DOCX rather than legacy DOC).
_DOCX_FILTER: Final[str] = "docx:MS Word 2007 XML"
_PDF_FILTER: Final[str] = "pdf:writer_pdf_Export"


@dataclass(frozen=True, slots=True)
class ConversionResult:
    """A finished conversion, ready to stream back to the client.

    ``path`` lives inside a caller-owned temp directory; the caller is
    responsible for deleting that directory once the file has been served.
    """

    path: Path
    filename: str
    media_type: str
    input_bytes: int
    output_bytes: int
    duration_seconds: float


class ConversionError(RuntimeError):
    """A conversion failed for a *client-attributable* reason.

    Carries an HTTP-ish ``status_code`` and a safe, user-facing ``detail`` that
    never echoes file content. The API layer maps this straight to an
    ``HTTPException``.
    """

    def __init__(self, detail: str, *, status_code: int = 422) -> None:
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code


def soffice_binary() -> str | None:
    """Return the resolved LibreOffice binary path, or ``None`` if unavailable.

    Kept as a plain function (not cached) so container health checks can probe
    availability at runtime without stale state.
    """
    for candidate in _SOFFICE_CANDIDATES:
        resolved = shutil.which(candidate)
        if resolved:
            return resolved
    return None


def _run_soffice(
    *,
    source: Path,
    out_dir: Path,
    profile_dir: Path,
    convert_filter: str,
) -> None:
    """Invoke LibreOffice headless to convert ``source`` into ``out_dir``.

    Runs the blocking subprocess to completion. Raises :class:`ConversionError`
    with a safe message on missing binary, timeout, or non-zero exit.
    """
    binary = soffice_binary()
    if binary is None:
        # Server misconfiguration, not the user's fault → 503.
        raise ConversionError(
            "The document conversion engine is temporarily unavailable. "
            "Please try again shortly.",
            status_code=503,
        )

    # ``file://`` URI keeps LibreOffice from re-interpreting odd characters in
    # the (already-sanitised) path as CLI options.
    command = [
        binary,
        "--headless",
        "--nologo",
        "--nofirststartwizard",
        "--norestore",
        "--nolockcheck",
        f"-env:UserInstallation=file://{profile_dir}",
        "--convert-to",
        convert_filter,
        "--outdir",
        str(out_dir),
        str(source),
    ]

    try:
        completed = subprocess.run(  # noqa: S603 - args are fully controlled
            command,
            capture_output=True,
            timeout=CONVERT_TIMEOUT_SECONDS,
            check=False,
            cwd=str(out_dir),
        )
    except subprocess.TimeoutExpired as exc:
        logger.warning("libreoffice conversion timed out after %ss", CONVERT_TIMEOUT_SECONDS)
        raise ConversionError(
            "The document took too long to convert and was cancelled. "
            "Try a smaller or simpler file.",
            status_code=504,
        ) from exc
    except OSError as exc:  # pragma: no cover - environment failure
        logger.error("failed to launch libreoffice: %s", exc.__class__.__name__)
        raise ConversionError(
            "The document conversion engine is temporarily unavailable. "
            "Please try again shortly.",
            status_code=503,
        ) from exc

    if completed.returncode != 0:
        # stderr can contain the *path*, so we log only the return code and a
        # trimmed, content-free hint — never the raw output verbatim.
        logger.warning("libreoffice exited with code %s", completed.returncode)
        raise ConversionError(
            "This file could not be converted. It may be corrupted, "
            "password-protected, or in an unsupported format.",
            status_code=422,
        )


def _convert_sync(
    *,
    data: bytes,
    original_name: str,
    source_suffix: str,
    target_suffix: str,
    convert_filter: str,
    media_type: str,
) -> ConversionResult:
    """Blocking conversion pipeline, run inside a worker thread.

    Writes ``data`` to a fresh temp dir, converts it, and returns a
    :class:`ConversionResult` whose ``path`` lives in a **separate** persistent
    temp dir (returned to the caller for cleanup after streaming).
    """
    start = _now()

    # Work dir holds the upload + LibreOffice profile; torn down here.
    # Result dir holds only the converted file; handed to the caller to delete
    # once the response has been streamed.
    result_dir = Path(tempfile.mkdtemp(prefix="gigai-convert-out-"))
    try:
        with tempfile.TemporaryDirectory(prefix="gigai-convert-work-") as work:
            work_dir = Path(work)
            profile_dir = work_dir / "profile"
            profile_dir.mkdir(parents=True, exist_ok=True)

            source = work_dir / f"input{source_suffix}"
            source.write_bytes(data)

            _run_soffice(
                source=source,
                out_dir=work_dir,
                profile_dir=profile_dir,
                convert_filter=convert_filter,
            )

            produced = work_dir / f"input{target_suffix}"
            if not produced.exists():
                # LibreOffice reported success but wrote nothing we can find —
                # treat as an unconvertible input.
                _cleanup_dir(result_dir)
                raise ConversionError(
                    "The conversion produced no output. The file may be empty "
                    "or in an unsupported format.",
                    status_code=422,
                )

            out_name = _output_filename(original_name, target_suffix)
            final_path = result_dir / out_name
            shutil.move(str(produced), str(final_path))

        return ConversionResult(
            path=final_path,
            filename=out_name,
            media_type=media_type,
            input_bytes=len(data),
            output_bytes=final_path.stat().st_size,
            duration_seconds=round(_now() - start, 3),
        )
    except ConversionError:
        _cleanup_dir(result_dir)
        raise
    except Exception:  # pragma: no cover - defensive: never leak the temp dir
        _cleanup_dir(result_dir)
        raise


async def convert_pdf_to_word(*, data: bytes, original_name: str) -> ConversionResult:
    """Convert PDF bytes into an editable ``.docx`` (Writer import of the PDF)."""
    return await asyncio.to_thread(
        _convert_sync,
        data=data,
        original_name=original_name,
        source_suffix=".pdf",
        target_suffix=".docx",
        convert_filter=_DOCX_FILTER,
        media_type=(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ),
    )


async def convert_word_to_pdf(*, data: bytes, original_name: str) -> ConversionResult:
    """Convert a Word document (``.docx`` / ``.doc``) into a ``.pdf``."""
    suffix = ".doc" if original_name.lower().endswith(".doc") else ".docx"
    return await asyncio.to_thread(
        _convert_sync,
        data=data,
        original_name=original_name,
        source_suffix=suffix,
        target_suffix=".pdf",
        convert_filter=_PDF_FILTER,
        media_type="application/pdf",
    )


# ── helpers ───────────────────────────────────────────────────────────────────


def _now() -> float:
    """Monotonic-ish wall clock for coarse duration measurement."""
    import time

    return time.monotonic()


def _output_filename(original_name: str, target_suffix: str) -> str:
    """Derive a safe download filename: original stem + new extension.

    Strips any directory components a client may have smuggled in and falls back
    to ``document`` when the stem is empty, so the response is always sane.
    """
    stem = Path(original_name).stem.strip() or "document"
    # Defence in depth: no path separators survive into the Content-Disposition.
    stem = stem.replace("/", "_").replace("\\", "_").replace("\x00", "")
    return f"{stem}{target_suffix}"


def cleanup_dir(path: Path) -> None:
    """Public cleanup hook for the API's ``BackgroundTask``.

    Recursively removes ``path`` (the result dir) after the file is streamed.
    Best-effort: cleanup failures are logged but never surface to the client.
    """
    _cleanup_dir(path)


def _cleanup_dir(path: Path) -> None:
    try:
        shutil.rmtree(path, ignore_errors=True)
    except Exception:  # pragma: no cover - cleanup must never raise
        logger.warning("failed to remove temp dir")
