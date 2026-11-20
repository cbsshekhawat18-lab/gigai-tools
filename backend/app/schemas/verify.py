"""Schemas for the GigAI Verify engine (v2).

Mirrors the browser extension's contract in
``GigAI Verify/src/analysis/core/types.ts``. Field names match on both sides —
change one, change the other.

FOUR PRODUCT RULES ARE ENCODED IN THE TYPES RATHER THAN LEFT TO PROSE:

1. **No numeric score is representable.** ``Confidence`` is a three-value enum.
   "97.43% AI" cannot be expressed by this API.
2. **Every signal states how it could be wrong.** ``alternative_explanations``
   is part of the shape, and clients render it beside the finding.
3. **Every signal declares what it shares blind spots with.**
   ``independence_group`` lets the fusion stage collapse correlated evidence so
   three detectors sharing a method count once, not three times.
4. **Every result states what was examined.** ``CoverageReport`` is mandatory,
   so a transcript-only video check cannot be rendered as a complete one.

Privacy contract, as with the other ephemeral endpoints:

    receive → analyse → respond → forget

Submitted content is held in memory for one request and discarded with the
response. Nothing is written to a database, object storage or disk, and no
submitted text is ever logged.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Classification(str, Enum):
    """The four — and only four — outcomes."""

    AI_GENERATED = "AI_GENERATED"
    HUMAN_GENERATED = "HUMAN_GENERATED"
    AI_ASSISTED = "AI_ASSISTED"
    INCONCLUSIVE = "INCONCLUSIVE"


class Confidence(str, Enum):
    """Deliberately coarse. AI detection does not support finer than this."""

    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"


class CoverageGrade(str, Enum):
    MINIMAL = "MINIMAL"
    PARTIAL = "PARTIAL"
    GOOD = "GOOD"
    COMPREHENSIVE = "COMPREHENSIVE"


class ContentKind(str, Enum):
    PAGE = "page"
    SELECTION = "selection"
    IMAGE = "image"
    VIDEO = "video"
    PDF = "pdf"
    DOCUMENT = "document"
    AUDIO = "audio"
    CODE = "code"
    DATA = "data"
    TEXT = "text"


class SignalDirection(str, Enum):
    """``CONFLICTING`` is first-class: evidence that disagrees with itself is a
    finding, not an error state, and flattening it would discard information."""

    AI = "supports_ai"
    HUMAN = "supports_human"
    MIXED = "supports_mixed"
    NEUTRAL = "neutral"
    CONFLICTING = "conflicting"


class SignalFamily(str, Enum):
    """Evidence category. Named ``SignalFamily`` for continuity with the
    detectors that construct it; the wire field is ``category``."""

    STYLOMETRY = "text"
    STRUCTURE = "structural"
    METADATA = "metadata"
    PROVENANCE = "provenance"
    MEDIA = "image"
    EDITING = "editing"
    DETECTOR = "detector"
    AUDIO = "audio"
    VIDEO = "video"
    DOCUMENT = "document"


class SignalStrength(str, Enum):
    WEAK = "weak"
    MODERATE = "moderate"
    STRONG = "strong"


class SignalReliability(str, Enum):
    """How much this KIND of observation is worth — a property of the method,
    not of this instance."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class EvidenceKind(str, Enum):
    EXCERPT = "excerpt"
    VALUE = "value"
    ABSENCE = "absence"
    MEASUREMENT = "measurement"


# ── Building blocks ───────────────────────────────────────────────────────────


class EvidenceItem(BaseModel):
    """A concrete, checkable observation. Never prose, never inferred."""

    model_config = ConfigDict(extra="forbid")

    kind: EvidenceKind
    label: str = Field(max_length=200)
    value: str = Field(max_length=2000)


class Signal(BaseModel):
    """One measured signal contributing to the outcome.

    Serialised with camelCase aliases so it drops straight into the extension's
    ``EvidenceSignal``; construct it with the Python names.
    """

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str = Field(max_length=80)
    #: Kept as `family` in Python so the detector modules construct it unchanged;
    #: serialised as `category` to match the extension's EvidenceSignal.
    family: SignalFamily = Field(
        default=SignalFamily.DETECTOR, serialization_alias="category"
    )
    #: Short, user-facing. Aliased to `title` on the wire.
    label: str = Field(max_length=160, serialization_alias="title")
    #: What was measured, in human terms. Aliased to `finding` on the wire.
    detail: str = Field(max_length=800, serialization_alias="finding")
    direction: SignalDirection
    strength: SignalStrength = SignalStrength.MODERATE
    reliability: SignalReliability = SignalReliability.LOW
    #: Internal 0..1 weight. NEVER rendered as a number by any client.
    weight: float = Field(ge=0.0, le=1.0)
    evidence: list[EvidenceItem] = Field(default_factory=list, max_length=12)
    #: Innocent readings of the same observation. Rendered beside the finding.
    alternative_explanations: list[str] = Field(
        default_factory=list,
        serialization_alias="alternativeExplanations",
        max_length=8,
    )
    #: Signals sharing this key are NOT independent and are collapsed in fusion.
    independence_group: str = Field(
        default="uncategorised", serialization_alias="independenceGroup", max_length=80
    )
    detector_id: str = Field(default="engine", serialization_alias="detectorId", max_length=80)
    detector_version: str = Field(
        default="2.0.0", serialization_alias="detectorVersion", max_length=20
    )


class Contradiction(BaseModel):
    """A detected disagreement between two bodies of evidence."""

    model_config = ConfigDict(extra="forbid")

    summary: str
    ai_side: list[str] = Field(default_factory=list, serialization_alias="aiSide")
    human_side: list[str] = Field(default_factory=list, serialization_alias="humanSide")
    interpretation: str


class CoverageReport(BaseModel):
    """What the run examined, and what it did not."""

    model_config = ConfigDict(extra="forbid")

    grade: CoverageGrade
    #: 0..1, consumed by the confidence stage.
    score: float = Field(ge=0.0, le=1.0)
    analysed: list[str] = Field(default_factory=list)
    unavailable: list[str] = Field(default_factory=list)
    statement: str


class KnowledgeCitation(BaseModel):
    """Attribution for a knowledge document that informed the explanation (§31).

    Emitted only for documents actually retrieved, so a citation always resolves
    to a real corpus entry — fabricated citations are impossible rather than
    merely discouraged.
    """

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: str
    title: str
    source: str
    tier: str
    version: str
    reviewed_at: str = Field(serialization_alias="reviewedAt")


class AnalysisRecord(BaseModel):
    """Enough to reproduce this result exactly (§60)."""

    model_config = ConfigDict(extra="forbid")

    analysis_id: str = Field(serialization_alias="analysisId")
    timestamp: str
    content_hash: str | None = Field(default=None, serialization_alias="contentHash")
    engine_version: str = Field(serialization_alias="engineVersion")
    detector_set_version: str = Field(serialization_alias="detectorSetVersion")
    fusion_version: str = Field(serialization_alias="fusionVersion")
    knowledge_version: str = Field(serialization_alias="knowledgeVersion")
    detectors_run: list[str] = Field(default_factory=list, serialization_alias="detectorsRun")
    knowledge_used: list[str] = Field(default_factory=list, serialization_alias="knowledgeUsed")


# ── Requests ──────────────────────────────────────────────────────────────────


class AnalyzeRequest(BaseModel):
    """Content the caller collected and the user explicitly submitted.

    There is deliberately no field for cookies, form values, credentials or
    browsing history, and the extension's extractor cannot collect them.
    """

    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    kind: ContentKind = ContentKind.PAGE
    text: str = Field(default="", max_length=200_000)
    title: str = Field(default="", max_length=600)
    url: str = Field(default="", max_length=2048)
    author: str | None = Field(default=None, max_length=200)
    metadata: dict[str, str] = Field(default_factory=dict)
    #: Present only for image checks; the engine fetches and parses it.
    image_url: str | None = Field(default=None, alias="imageUrl", max_length=2048)
    transcript: str | None = Field(default=None, max_length=200_000)
    #: `standard` is fast; `deep` runs the model-assisted reading as well (§51).
    analysis_mode: Literal["standard", "deep"] = Field(default="standard", alias="analysisMode")


class AskRequest(BaseModel):
    """A follow-up question, answered strictly against evidence already found.

    Signals are supplied by the caller because analysis is stateless by design —
    there is no stored session to look them up from.
    """

    model_config = ConfigDict(extra="ignore")

    question: str = Field(min_length=1, max_length=1000)
    signals: list[Signal] = Field(default_factory=list, max_length=60)
    classification: Classification = Classification.INCONCLUSIVE


# ── Responses ─────────────────────────────────────────────────────────────────


class AnalyzeResponse(BaseModel):
    """A completed verification.

    The extension consumes ``signals`` and re-fuses them together with its own
    local evidence; the web tool renders the whole response. Either way the
    classification here is arithmetic over signals, never a model's opinion.
    """

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    classification: Classification
    confidence: Confidence
    headline: str
    summary: str
    signals: list[Signal]
    contradictions: list[Contradiction] = Field(default_factory=list)
    coverage: CoverageReport
    limitations: list[str] = Field(default_factory=list)
    record: AnalysisRecord
    #: Sources behind the interpretation, for the advanced evidence view (§31).
    citations: list[KnowledgeCitation] = Field(default_factory=list)
    #: Model that assisted, or None when the run was heuristics-only.
    model: str | None = None
    knowledge_version: str = Field(serialization_alias="knowledgeVersion")


class AskResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    answer: str
    #: Ids of signals the answer relied on. Empty means "nothing supports this".
    cited_signal_ids: list[str] = Field(
        default_factory=list, serialization_alias="citedSignalIds"
    )


class VerifyStatusResponse(BaseModel):
    """Capability probe, called before any content is sent."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    configured: bool
    provider: str = ""
    model: str | None = None
    max_text_chars: int = Field(serialization_alias="maxTextChars")
    engine_version: str = Field(serialization_alias="engineVersion")
    knowledge_version: str = Field(serialization_alias="knowledgeVersion")
    supports_deep: bool = Field(default=True, serialization_alias="supportsDeep")


class VerifyErrorResponse(BaseModel):
    detail: str
