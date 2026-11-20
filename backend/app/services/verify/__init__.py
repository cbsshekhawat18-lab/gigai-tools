"""GigAI Verify engine — orchestration (v2).

    request → collect → enrich → correlate → contradict → cover → fuse → respond

PRIVACY CONTRACT, identical to the other ephemeral endpoints on this platform:
submitted content lives in memory for one request and is discarded with the
response. Nothing is written to a database, object storage or disk; no submitted
text, URL or image byte is ever logged.

THE MODEL IS NEVER THE DECIDER. Heuristics, provenance parsing and the
model-assisted reading all produce the same ``Signal`` shape and all pass
through the same ``fusion.fuse()``. Model signals carry an ``llm.`` id prefix
which keeps them out of the hard-evidence test, so a model observation can
contribute to an outcome but can never reach HIGH confidence on its own.
"""

from __future__ import annotations

import hashlib
import logging
import re
from datetime import datetime, timezone
from typing import Final

from app.schemas.verify import (
    AnalysisRecord,
    AnalyzeRequest,
    AnalyzeResponse,
    AskResponse,
    Classification,
    ContentKind,
    EvidenceItem,
    EvidenceKind,
    KnowledgeCitation,
    Signal,
    SignalDirection,
    SignalFamily,
)
from app.services.verify import fusion, knowledge, llm, provenance, text as text_analysis, vision
from app.services.verify.enrich import enrich_all

logger = logging.getLogger("app.services.verify")

ENGINE_VERSION: Final[str] = "2.0.0"
DETECTOR_SET_VERSION: Final[str] = "2.0.0"
FUSION_VERSION: Final[str] = "2.0.0"

#: Below this, style measurement is dominated by sampling noise (§17).
MIN_RELIABLE_CHARS: Final[int] = 400

_KNOWN_CMS: Final[re.Pattern[str]] = re.compile(
    r"wordpress|drupal|joomla|ghost|hugo|jekyll|gatsby|next\.js|nuxt|squarespace|wix|"
    r"webflow|shopify|blogger|medium|substack|contentful|sanity|craft ?cms|typo3|hubspot",
    re.I,
)

_AI_PUBLISHING_TOOLS: Final[re.Pattern[str]] = re.compile(
    r"jasper|copy\.?ai|writesonic|article ?forge|byword|koala ?writer|surfer ?seo|"
    r"frase|rytr|neuroflash|contentbot|autoblogging",
    re.I,
)

#: Marks of machine translation or paraphrasing, which rewrite exactly the
#: surface features stylometry measures (§18).
_TRANSLATIONESE: Final[tuple[re.Pattern[str], ...]] = (
    re.compile(r"\bthe\s+(?:said|aforementioned)\s+\w+", re.I),
    re.compile(r"\bin\s+the\s+case\s+(?:when|where)\b", re.I),
    re.compile(r"\bit\s+is\s+necessary\s+to\s+\w+", re.I),
    re.compile(r"\bas\s+for\s+the\b", re.I),
)


def status_max_chars() -> int:
    return text_analysis.MAX_TEXT_CHARS


def knowledge_version() -> str:
    return knowledge.KNOWLEDGE_VERSION


# ── Metadata signals ──────────────────────────────────────────────────────────


def _metadata_signals(request: AnalyzeRequest) -> list[Signal]:
    """What the page or document declares about itself.

    Weak evidence about authorship, weighted to say so: a byline is trivially
    forged and a CMS string describes the publishing system, not the writer. The
    exception is a generator naming a generative tool outright — a declaration.
    """
    signals: list[Signal] = []
    generator = request.metadata.get("generator", "")

    tool = provenance.match_ai_tool(generator) or (
        generator if _AI_PUBLISHING_TOOLS.search(generator) else None
    )

    if tool:
        signals.append(
            Signal(
                id="metadata.ai-generator",
                family=SignalFamily.METADATA,
                label="Page declares an AI writing tool",
                detail=(
                    f"The page's own generator metadata names {tool.strip()}, which "
                    "produces content automatically."
                ),
                direction=SignalDirection.AI,
                weight=0.9,
                evidence=[
                    EvidenceItem(kind=EvidenceKind.VALUE, label="generator", value=generator)
                ],
            )
        )
    elif generator and _KNOWN_CMS.search(generator):
        signals.append(
            Signal(
                id="metadata.cms-generator",
                family=SignalFamily.METADATA,
                label="Published through a standard CMS",
                detail=(
                    f"Built with {generator.strip()}. This identifies the publishing "
                    "system only — it says nothing about who or what wrote the text."
                ),
                direction=SignalDirection.NEUTRAL,
                weight=0.0,
                evidence=[
                    EvidenceItem(kind=EvidenceKind.VALUE, label="generator", value=generator)
                ],
            )
        )

    if request.author:
        signals.append(
            Signal(
                id="metadata.named-author",
                family=SignalFamily.METADATA,
                label="Named author in metadata",
                detail=(
                    f"The content is attributed to {request.author}. Attribution is easy "
                    "to fake, so this counts only lightly."
                ),
                direction=SignalDirection.HUMAN,
                weight=0.2,
                evidence=[
                    EvidenceItem(kind=EvidenceKind.VALUE, label="Author", value=request.author)
                ],
            )
        )
    elif request.kind is ContentKind.PAGE and len(request.text) > 1200:
        signals.append(
            Signal(
                id="metadata.no-author",
                family=SignalFamily.METADATA,
                label="No author attribution",
                detail=(
                    "A substantial article with no byline anywhere in its metadata. Common "
                    "on bulk-published content, but also on plenty of legitimate pages."
                ),
                direction=SignalDirection.AI,
                weight=0.15,
                evidence=[
                    EvidenceItem(kind=EvidenceKind.ABSENCE, label="Author", value="Not declared")
                ],
            )
        )

    return signals


def _transformation_suspected(body: str) -> bool:
    sample = body[:20_000]
    if len((sample.split())) < 200:
        return False
    hits = sum(len(pattern.findall(sample)) for pattern in _TRANSLATIONESE)
    return hits >= 3


# ── Collection ────────────────────────────────────────────────────────────────


class _Collected:
    __slots__ = ("signals", "analysed", "unavailable", "limitations", "too_short", "score", "detectors")

    def __init__(self) -> None:
        self.signals: list[Signal] = []
        self.analysed: list[str] = []
        self.unavailable: list[str] = []
        self.limitations: list[str] = []
        self.too_short: bool = False
        self.score: float = 0.0
        self.detectors: list[str] = []


async def _collect(request: AnalyzeRequest, use_model: bool) -> _Collected:
    collected = _Collected()

    # ── image ────────────────────────────────────────────────────────────────
    if request.kind is ContentKind.IMAGE:
        collected.analysed = ["File metadata", "Container structure"]
        collected.unavailable = ["Visual pixel analysis", "C2PA signature validation"]
        collected.limitations.append(
            "Only the file's metadata and container were examined — the image itself was "
            "not visually analysed."
        )
        collected.detectors.append("image.provenance")

        if not request.image_url:
            collected.limitations.append("No image address was supplied, so nothing could be read.")
            collected.too_short = True
            return collected

        try:
            data = await provenance.fetch_image(request.image_url)
        except provenance.FetchError as exc:
            collected.limitations.append(str(exc))
            collected.too_short = True
            return collected

        parsed = provenance.parse(data)
        collected.signals = provenance.to_signals(parsed)

        # Container + metadata is the floor for an image we could actually fetch.
        collected.score = 0.35
        if parsed.exif.has_camera_fields or parsed.exif.software:
            collected.analysed.append("EXIF")
            collected.score += 0.25
        if parsed.c2pa.present:
            collected.analysed.append("C2PA Content Credentials")
            collected.score += 0.3

        # The `model.visual` slot the extension declares but cannot serve in a
        # browser. Reports observable rendering artefacts, never a verdict —
        # see vision.py for why that distinction is the whole design.
        if use_model:
            visual = vision.inspect(data)
            if visual:
                collected.signals.extend(visual)
                collected.analysed.append("Model-assisted visual inspection")
                collected.detectors.append("model.visual")
                collected.score = min(1.0, collected.score + 0.2)

                # Visual coverage is genuinely served now, so it stops counting
                # as unexamined and the "not visually analysed" caveat is
                # replaced by one describing what the inspection is worth.
                collected.unavailable = [
                    item for item in collected.unavailable if item != "Visual pixel analysis"
                ]
                collected.limitations = [
                    line for line in collected.limitations if "not visually analysed" not in line
                ]
                collected.limitations.append(
                    "Visual inspection is one vision model's impression of the pixels, rated "
                    "low reliability. It has no established accuracy for distinguishing "
                    "generated images and cannot on its own support a confident result."
                )

        return collected

    # ── video ────────────────────────────────────────────────────────────────
    if request.kind is ContentKind.VIDEO:
        transcript = (request.transcript or "").strip()
        collected.analysed = ["Title", "Description", "Page metadata"]
        collected.unavailable = ["Video frames", "Audio track"]
        collected.limitations.append(
            "Analysis is based on text and metadata only — the video frames and audio "
            "were not examined."
        )
        collected.detectors.append("video.context")

        if len(transcript) > MIN_RELIABLE_CHARS:
            collected.analysed.insert(0, "Transcript")
            collected.score = 0.35
            signals, _, _ = text_analysis.analyze(transcript)
            # Spoken language is legitimately more repetitive and less punctuated
            # than prose; signals keyed on written convention would fire spuriously.
            spoken_unsafe = {
                "text.no-contractions",
                "text.uniform-paragraphs",
                "text.human-roughness",
            }
            for signal in signals:
                if signal.id in spoken_unsafe:
                    continue
                signal.id = f"video.{signal.id}"
                signal.detail = f"{signal.detail} (Measured on the transcript.)"
                collected.signals.append(signal)
        else:
            collected.unavailable.insert(0, "Transcript")
            collected.score = 0.12
            collected.limitations.append(
                "No usable transcript was available, so the analysis is limited to the "
                "title, description and page metadata."
            )
            collected.too_short = not request.text.strip()

        collected.signals.extend(_metadata_signals(request))
        return collected

    # ── text-bearing kinds ───────────────────────────────────────────────────
    body = request.text.strip()
    is_selection = request.kind is ContentKind.SELECTION

    collected.analysed = ["Selected text"] if is_selection else ["Text", "Metadata"]
    collected.unavailable = ["Provenance records"]
    collected.detectors.append("text.stylometry")

    if len(body) < MIN_RELIABLE_CHARS:
        collected.too_short = True
        collected.score = 0.1
        collected.limitations.append(
            "The submitted text is too short for style analysis to be meaningful."
        )
        return collected

    signals, _word_count, was_sampled = text_analysis.analyze(body)
    collected.signals.extend(signals)
    collected.score = min(1.0, 0.4 + len(body) / 6000)

    if not is_selection:
        collected.signals.extend(_metadata_signals(request))
        collected.detectors.append("page.metadata")

    if was_sampled:
        collected.limitations.append(
            "This document is long, so the opening, middle and closing sections were "
            "sampled rather than the entire text."
        )

    # ── model pass (deep mode, or whenever a model is configured) ────────────
    if use_model:
        model_signals = llm.extract_signals(body)
        if model_signals:
            collected.signals.extend(model_signals)
            collected.analysed.append("Model-assisted reading")
            collected.detectors.append("llm.observations")

    return collected


# ── Public API ────────────────────────────────────────────────────────────────


async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """Run a verification and return the fused result."""
    use_model = llm.model_available() and (
        request.analysis_mode == "deep" or request.kind is not ContentKind.IMAGE
    )

    collected = await _collect(request, use_model)

    signals = enrich_all(fusion.dedupe(collected.signals))
    signals, independent_groups = fusion.correlate(signals)
    contradictions = fusion.find_contradictions(signals)
    coverage = fusion.build_coverage(collected.analysed, collected.unavailable, collected.score)

    fused = fusion.fuse(
        signals,
        coverage=coverage,
        contradictions=contradictions,
        independent_groups=independent_groups,
        insufficient_sample=collected.too_short,
        transformation_suspected=_transformation_suspected(request.text),
    )

    limitations = [*collected.limitations, *fused.notes, fusion.DISCLAIMER]

    content_hash = (
        hashlib.sha256(request.text.encode("utf-8")).hexdigest() if request.text else None
    )

    knowledge_docs = knowledge.retrieve([signal.id for signal in signals])

    return AnalyzeResponse(
        classification=fused.classification,
        confidence=fused.confidence,
        headline=fused.headline,
        summary=fused.summary,
        signals=fusion.rank(signals),
        contradictions=contradictions,
        coverage=coverage,
        limitations=_dedupe_lines(limitations),
        record=AnalysisRecord(
            analysis_id=(content_hash or "")[:24] or "unhashed",
            timestamp=datetime.now(timezone.utc).isoformat(),
            content_hash=content_hash,
            engine_version=ENGINE_VERSION,
            detector_set_version=DETECTOR_SET_VERSION,
            fusion_version=FUSION_VERSION,
            knowledge_version=knowledge.KNOWLEDGE_VERSION,
            detectors_run=collected.detectors,
            knowledge_used=[doc.id for doc in knowledge_docs],
        ),
        citations=[
            KnowledgeCitation(**citation) for citation in knowledge.citations(knowledge_docs)
        ],
        model=llm.active_model() if use_model else None,
        knowledge_version=knowledge.KNOWLEDGE_VERSION,
    )


def ask(question: str, signals: list[Signal], classification: Classification) -> AskResponse:
    """Answer a follow-up strictly from evidence already collected."""
    if not signals:
        return AskResponse(
            answer=(
                "There is no evidence attached to this check, so there is nothing to "
                "answer from. Run a check first."
            ),
            cited_signal_ids=[],
        )

    # Retrieval is keyed on signals that ACTUALLY exist (§33), so no knowledge
    # document can introduce a finding the detectors did not make.
    documents = knowledge.retrieve([signal.id for signal in signals])
    reference = knowledge.as_reference_block(documents)

    result = llm.answer(question, signals, classification, reference)
    if result is not None:
        answer_text, cited = result
        return AskResponse(answer=answer_text, cited_signal_ids=cited)

    return _deterministic_answer(signals, classification)


def _deterministic_answer(signals: list[Signal], classification: Classification) -> AskResponse:
    """Fallback when no model is configured.

    Summarises the evidence rather than interpreting the question. Less fluent
    than the model path and completely incapable of inventing anything, which is
    the right trade when the alternative is silence.
    """
    ranked = fusion.rank(signals)
    ai = [s for s in ranked if s.direction is SignalDirection.AI]
    human = [s for s in ranked if s.direction is SignalDirection.HUMAN]

    lines = [f"Reading: {fusion.label_for(classification)}."]
    if ai:
        lines.append("Pointing toward AI:")
        lines.extend(f"• {s.label} — {s.detail}" for s in ai[:4])
    if human:
        lines.append("Pointing toward human:")
        lines.extend(f"• {s.label} — {s.detail}" for s in human[:4])
    if not fusion.has_hard_evidence(signals):
        lines.append(
            "None of this is proof. No verifiable provenance record was found, so the "
            "result rests on statistical patterns that produce both false positives and "
            "false negatives."
        )

    return AskResponse(answer="\n".join(lines), cited_signal_ids=[s.id for s in ranked[:6]])


def _dedupe_lines(lines: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for line in lines:
        key = line.strip()
        if key and key not in seen:
            seen.add(key)
            out.append(key)
    return out
