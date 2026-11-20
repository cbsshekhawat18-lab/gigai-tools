"""Schemas for the ephemeral Video → Work analysis endpoint.

The browser does all the media work — decoding, transcription (Whisper via
transformers.js) and smart frame selection — and sends only the *evidence*:
a timestamped transcript plus a handful of selected JPEG frames. The video
itself never leaves the user's device, which is why this endpoint takes no
file upload at all.

These models mirror `lib/video-work/types.ts` on the frontend. Keep the two in
sync; the JSON schema in ``app.services.video_work`` is what actually
constrains the model's output.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class FindingType(str, Enum):
    """What kind of work a finding represents."""

    BUG = "BUG"
    FEATURE = "FEATURE"
    DESIGN_CHANGE = "DESIGN_CHANGE"
    CONTENT_CHANGE = "CONTENT_CHANGE"
    TASK = "TASK"
    QUESTION = "QUESTION"
    DECISION = "DECISION"
    REQUIREMENT = "REQUIREMENT"
    REFERENCE = "REFERENCE"


class Priority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# ── Request ───────────────────────────────────────────────────────────────────


class TranscriptSegment(BaseModel):
    """One stretch of speech, in milliseconds from the start of the video."""

    start: int = Field(ge=0)
    end: int = Field(ge=0)
    text: str = Field(max_length=4000)


class EvidenceFrame(BaseModel):
    """A frame the browser's scene-change/sharpness scorer chose to keep.

    ``data_url`` is a JPEG data URL. It is decoded, sent to the model as an
    image block, and dropped — never written to disk.
    """

    time_ms: int = Field(ge=0)
    data_url: str
    #: Text found on the frame by in-browser OCR, when it was legible.
    ocr_text: str | None = Field(default=None, max_length=2000)


class PriorFinding(BaseModel):
    """A compact finding from an earlier video in the same project.

    Passed so the model can mark a requirement as *changed* or *contradicted*
    rather than emitting a near-duplicate the user has to reconcile by hand.
    """

    id: str = Field(max_length=40)
    type: FindingType
    title: str = Field(max_length=300)
    area: str = Field(default="", max_length=120)
    video_label: str = Field(default="", max_length=200)


class AnalyzeRequest(BaseModel):
    """Everything needed to turn one video's evidence into developer work."""

    video_name: str = Field(default="", max_length=300)
    video_label: str = Field(default="", max_length=200)
    duration_ms: int = Field(default=0, ge=0)
    segments: list[TranscriptSegment] = Field(default_factory=list)
    frames: list[EvidenceFrame] = Field(default_factory=list)
    prior_findings: list[PriorFinding] = Field(default_factory=list)
    #: Optional free-text context from the user ("this is the checkout rebuild").
    project_context: str = Field(default="", max_length=2000)


# ── Response ──────────────────────────────────────────────────────────────────


class Finding(BaseModel):
    """One piece of extracted work, always carrying its evidence."""

    id: str
    type: FindingType
    title: str
    priority: Priority
    #: 0–100. Anything under the UI's threshold renders as "Needs confirmation".
    confidence: int
    area: str
    description: str
    observed: str
    expected: str
    steps_to_reproduce: list[str]
    #: The client's own words — verbatim, so the developer can judge for themselves.
    client_statement: str
    #: The AI's reading of that statement in developer terms. Never asserted as fact.
    interpretation: str
    timestamp_ms: int
    #: Timestamp of the evidence frame, or -1 when no frame supports this finding.
    frame_time_ms: int
    acceptance_criteria: list[str]
    dependencies: list[str]
    #: True when the request was ambiguous and a human must confirm the reading.
    needs_confirmation: bool


class Summary(BaseModel):
    overview: str
    what_client_wants: list[str]
    what_is_broken: list[str]
    risks: list[str]
    #: Finding ids in the order they should be implemented.
    recommended_order: list[str]


class AnalyzeResponse(BaseModel):
    findings: list[Finding]
    summary: Summary
    model: str
    #: Populated only when the model declined; `findings` is empty in that case.
    refusal: str | None = None


class AnalyzeErrorResponse(BaseModel):
    detail: str


class AnalyzeStatusResponse(BaseModel):
    """Lets the browser check which server capabilities are actually available.

    The frontend is a static export that can be served without this backend, so
    the workspace asks first and shows an honest "analysis isn't configured"
    state instead of failing at the end of a long local transcription. The same
    probe reports whether URL fetching is live, so the URL field can disable
    itself rather than accepting a link it cannot retrieve.
    """

    configured: bool
    model: Literal["claude-opus-5"] | str
    #: "anthropic", "groq" or "" — lets the UI name the tier honestly.
    provider: str = ""
    #: True when the hosted tier is a shared free allowance rather than paid
    #: capacity, so the UI can warn that limits are shared across all visitors.
    free_tier: bool = False
    max_frames: int
    #: Longest edge (px) the client should downscale frames to. 0 = untouched.
    max_frame_px: int = 0
    max_transcript_chars: int
    #: True when yt-dlp is installed and URL fetching is switched on.
    fetch_enabled: bool = False
    max_fetch_minutes: int = 0
    max_fetch_mb: int = 0


# ── URL ingestion ─────────────────────────────────────────────────────────────


class UrlRequest(BaseModel):
    """A share link to inspect or retrieve."""

    url: str = Field(min_length=4, max_length=2048)


class ResolveResponse(BaseModel):
    """What a link turns out to be, without downloading it.

    Returned before any bytes move so the workspace can show what it is about
    to fetch — and so private, expired and over-long links fail immediately
    rather than after a two-minute download.
    """

    title: str
    duration_seconds: int
    #: Which extractor matched — "Loom", "Youtube", "Vimeo", "generic".
    extractor: str
    #: Best-effort size estimate; 0 when the source doesn't report one.
    approx_bytes: int
    is_live: bool
