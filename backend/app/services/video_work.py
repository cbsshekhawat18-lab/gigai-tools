"""Video → Work — the multimodal understanding step.

This is the ONLY part of the pipeline that is not in the browser, and the only
place on the whole platform that talks to a hosted language model. It exists
because the product's core promise — turning a vague client sentence into a
developer-grade requirement with acceptance criteria — is not something regex
or heuristics can do honestly.

WHAT IS SENT: a timestamped transcript and a handful of already-selected JPEG
frames. WHAT IS NOT SENT: the video. The browser decodes, transcribes and
scores frames locally; only the evidence travels.

WHAT IS KEPT: nothing. The request is held in memory for the duration of the
call and discarded with the response. No database, no object storage, no
logging of transcript or frame content — the same doctrine as the ephemeral
document converters in ``app.services.convert``.

The model is constrained by a JSON schema (structured outputs), so the response
is validated at the API layer and the model retries on mismatch rather than us
parsing prose and hoping.
"""

from __future__ import annotations

import base64
import binascii
import logging
import re
from typing import Any, Final

from app.core.config import settings

logger = logging.getLogger("app.services.video_work")

# ── Limits ────────────────────────────────────────────────────────────────────

#: Frames sent per analysis. Each full-resolution frame costs meaningful input
#: tokens, and past roughly this many the marginal frame is another shot of the
#: same screen. The browser already de-duplicates by perceptual hash.
MAX_FRAMES: Final[int] = 18

#: Groq's vision endpoint accepts 5 images, but the binding constraint is the
#: free tier's 8k tokens/minute, counting input AND reserved output together.
#:
#: MEASURED FROM LIVE REQUESTS, by differencing real 413 responses:
#:     3 frames -> 11,329 tokens
#:     2 frames ->  8,906 tokens      => ~2,423 tokens PER REAL FRAME
#: One frame plus the ~1k prompt and a 3k output budget lands near 6.5k, which
#: fits. Two does not.
#:
#: A synthetic flat-colour JPEG measured only ~780 tokens and led me astray —
#: do not re-tune this against generated test images; use a real video frame or
#: read the figure straight out of a 413.
#: 0 since 2026-08-21: every production analyze failure (413 over-budget,
#: json_validate_failed) traced to the single attached frame, and the findings
#: come from the transcript. Clients see max_frames=0 in /status and stop
#: uploading frames entirely; screenshots still attach client-side by timestamp.
GROQ_MAX_FRAMES: Final[int] = 0

#: Groq is OpenAI-compatible; httpx is already a dependency, so no extra SDK.
GROQ_ENDPOINT: Final[str] = "https://api.groq.com/openai/v1/chat/completions"

#: Output budget for Groq. THIS IS A RATE-LIMIT FIGURE, NOT A QUALITY KNOB.
#: Groq's free tier meters ~8,000 tokens per minute and counts the RESERVED
#: output (`max_tokens`) against it alongside the input. A 16k reservation made
#: every request 21k tokens and therefore permanently impossible, whatever the
#: actual prompt size. Measured costs: transcript ~220 tokens, each image ~780,
#: compact instructions ~1,200 — so ~4k input leaves ~3k for findings and lands
#: safely inside the ceiling. Sized by test, not by guess.
#:
#: DO NOT lower this to buy TPM headroom: at 2,000 the model ran out of budget
#: mid-object and Groq rejected the whole call with `json_validate_failed` and
#: an empty `failed_generation`. Cut GROQ_MAX_FRAMES instead — frames are the
#: only lever that moves input tokens (image cost is flat per image).
GROQ_MAX_TOKENS: Final[int] = 3000

#: The free tier's whole per-minute allowance, input + reserved output.
GROQ_TOKEN_CEILING: Final[int] = 8000

#: Headroom for tokenisation drift, so we never sit exactly on the limit.
#: RAISED 600 -> 1500 on 2026-08-21: a live 413 measured the chars/4 estimate
#: ~850 tokens LOW on a real 2-minute transcript (est ~7.4k, Groq counted
#: 8,251). 1,500 covers that drift with room to spare.
GROQ_TOKEN_MARGIN: Final[int] = 1500

#: Output budget below which qwen's REASONING starves with an image in play:
#: measured live 2026-08-21 - a ~3.1k budget plus one frame produced
#: json_validate_failed with an EMPTY failed_generation. Under this, drop the
#: frame instead: text-only with a generous budget beats an image plus a
#: starved answer.
GROQ_HEALTHY_OUTPUT_WITH_FRAME: Final[int] = 3500

#: Measured cost of one real video frame (see the note on GROQ_MAX_FRAMES).
GROQ_TOKENS_PER_FRAME: Final[int] = 2423

#: Floor for the output budget. Below roughly this, qwen3.6 — which reasons
#: before answering — runs out mid-object and Groq rejects the whole call with
#: `json_validate_failed: max completion tokens reached`.
GROQ_MIN_OUTPUT_TOKENS: Final[int] = 2500

#: Longest edge (px) a frame may have when the free tier is serving.
#:
#: MEASURED, and it corrected an assumption: image token cost on this model is
#: FLAT (~769) regardless of resolution — a 320x176 frame and an 800x450 frame
#: both cost 781 tokens in an otherwise-empty request. So this saves the
#: visitor upload bandwidth and nothing else; do NOT expect it to buy token
#: headroom. Frame COUNT is the only lever that moves tokens.
GROQ_MAX_FRAME_PX: Final[int] = 800

#: Transcript ceiling. Roughly an hour of dense speech; beyond it we trim from
#: the middle and say so in the prompt rather than silently dropping the end.
MAX_TRANSCRIPT_CHARS: Final[int] = 120_000

#: Individual frames above this decoded size are skipped — a browser should
#: never produce one, so it signals a malformed request rather than a big video.
MAX_FRAME_BYTES: Final[int] = 4 * 1024 * 1024

_DATA_URL_RE: Final[re.Pattern[str]] = re.compile(
    r"^data:(image/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$"
)

# ── Output contract ───────────────────────────────────────────────────────────

_FINDING_TYPES: Final[list[str]] = [
    "BUG",
    "FEATURE",
    "DESIGN_CHANGE",
    "CONTENT_CHANGE",
    "TASK",
    "QUESTION",
    "DECISION",
    "REQUIREMENT",
    "REFERENCE",
]

_PRIORITIES: Final[list[str]] = ["critical", "high", "medium", "low"]


def _obj(properties: dict[str, Any]) -> dict[str, Any]:
    """A closed object schema with every key required.

    Structured outputs demand ``additionalProperties: false`` and an exhaustive
    ``required`` list, and forbid the numeric/length constraints you would
    otherwise reach for — so bounds live in the field descriptions instead.
    """
    return {
        "type": "object",
        "properties": properties,
        "required": list(properties),
        "additionalProperties": False,
    }


def _strings(description: str) -> dict[str, Any]:
    return {"type": "array", "items": {"type": "string"}, "description": description}


ANALYSIS_SCHEMA: Final[dict[str, Any]] = _obj(
    {
        "findings": {
            "type": "array",
            "description": (
                "Every distinct piece of work the client asked for or revealed. "
                "One finding per actionable item — do not merge two requests into "
                "one, and do not split a single request into several."
            ),
            "items": _obj(
                {
                    "id": {
                        "type": "string",
                        "description": (
                            "Stable ticket id: the type prefix plus a zero-padded "
                            "counter, e.g. BUG-001, FEATURE-002, DESIGN-003."
                        ),
                    },
                    "type": {"type": "string", "enum": _FINDING_TYPES},
                    "title": {
                        "type": "string",
                        "description": (
                            "One line a developer could paste into a ticket. State the "
                            "problem or the change, not the conversation around it."
                        ),
                    },
                    "priority": {"type": "string", "enum": _PRIORITIES},
                    "confidence": {
                        "type": "integer",
                        "description": (
                            "0-100: how certain you are this is what the client actually "
                            "meant. Be honest and use the low end freely. A vague "
                            "sentence like 'this looks weird' with no visible referent "
                            "is under 50, not 80."
                        ),
                    },
                    "area": {
                        "type": "string",
                        "description": (
                            "The part of the product this touches, in the client's own "
                            "vocabulary where possible: Checkout, Homepage, Login, "
                            "Mobile, Dashboard. Used to group work; keep it short and "
                            "reuse the same label across related findings."
                        ),
                    },
                    "description": {
                        "type": "string",
                        "description": "What needs to happen, in plain developer language.",
                    },
                    "observed": {
                        "type": "string",
                        "description": (
                            "For a bug: what actually happens, as demonstrated in the "
                            "video. Empty string when not applicable."
                        ),
                    },
                    "expected": {
                        "type": "string",
                        "description": (
                            "For a bug: what the client expected instead. Empty string "
                            "when not applicable."
                        ),
                    },
                    "steps_to_reproduce": _strings(
                        "Concrete steps, only when the video actually shows them. "
                        "Empty array if the client described a problem without "
                        "demonstrating it — do not invent a reproduction."
                    ),
                    "client_statement": {
                        "type": "string",
                        "description": (
                            "The client's own words, quoted verbatim from the "
                            "transcript. Never paraphrase here — this is the evidence "
                            "the developer checks your interpretation against."
                        ),
                    },
                    "interpretation": {
                        "type": "string",
                        "description": (
                            "Your reading of that statement as an implementable change. "
                            "This is where 'make it smaller and move it down' becomes "
                            "'reduce the CTA's dimensions and place it below the "
                            "content block'. Write it as a proposal, not a fact."
                        ),
                    },
                    "timestamp_ms": {
                        "type": "integer",
                        "description": (
                            "Milliseconds into the video where the client says this. "
                            "Must match a real transcript segment start."
                        ),
                    },
                    "frame_time_ms": {
                        "type": "integer",
                        "description": (
                            "time_ms of the supplied frame that best evidences this "
                            "finding, or -1 when no supplied frame shows it. Only use "
                            "a timestamp that appears in the frames you were given."
                        ),
                    },
                    "acceptance_criteria": _strings(
                        "Testable, observable pass conditions. 'Clicking Checkout "
                        "navigates to /checkout' — not 'checkout works'. Each one "
                        "must be something a person could verify in a browser."
                    ),
                    "dependencies": _strings(
                        "Ids of other findings that must land first. Empty array when "
                        "the work is independent."
                    ),
                    "needs_confirmation": {
                        "type": "boolean",
                        "description": (
                            "True whenever the client's intent is ambiguous, the "
                            "referent is unclear, or you inferred a detail they did not "
                            "state. Prefer true when in doubt — a developer building "
                            "the wrong thing costs far more than one extra question."
                        ),
                    },
                }
            ),
        },
        "summary": _obj(
            {
                "overview": {
                    "type": "string",
                    "description": (
                        "Two to four sentences a project manager could read instead of "
                        "watching the video."
                    ),
                },
                "what_client_wants": _strings("The headline asks, in priority order."),
                "what_is_broken": _strings("Defects demonstrated or described."),
                "risks": _strings(
                    "Ambiguities, contradictions and missing information that could "
                    "cause the wrong thing to be built."
                ),
                "recommended_order": _strings(
                    "Finding ids in a sensible implementation order, respecting "
                    "dependencies and priority."
                ),
            }
        ),
    }
)

# ── Prompt ────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT: Final[str] = """\
You turn a client's screen recording into work a developer can pick up without \
watching the video. You are given the transcript with timestamps, and a set of \
frames chosen from the video because something visually changed at that moment.

Read both. The transcript tells you what was asked for; the frames tell you what \
was on screen while it was asked. Neither alone is enough — "make this bigger" is \
meaningless without the frame showing what "this" is, and a screenshot of a form \
is meaningless without the sentence explaining what is wrong with it.

What you produce is a ticket queue, not a summary. Every finding must be \
actionable, evidenced, and traceable back to a moment in the video.

HOW TO READ THE EVIDENCE

- Frames are labelled with their timestamp. Match a finding to the frame whose \
timestamp is nearest the moment it is discussed, and only when that frame \
actually shows the thing being discussed.
- Read on-screen text in the frames: error messages, button labels, field names, \
URLs, prices, menu items. Naming the exact label a client is pointing at is the \
difference between a useful ticket and a vague one.
- Watch for demonstration without narration. A client who silently clicks a button \
that does nothing has reported a bug just as surely as one who says so.
- Watch for narration without demonstration. A client describing a problem they \
are not currently showing is still a finding, but with no steps to reproduce.

TRANSLATING CLIENT LANGUAGE

Clients describe outcomes and feelings; developers need changes and criteria. \
Bridging that gap is the main job. "It looks cramped" becomes a spacing change \
with a named element. "It's confusing" becomes a specific copy or flow change. \
But the bridge is where you can go wrong, so it is separated in the output: \
`client_statement` is what they actually said, quoted exactly, and \
`interpretation` is your reading of it. A developer must always be able to see \
both and judge for themselves.

THE RULE THAT MATTERS MOST

Never present an uncertain reading as a settled requirement. If the client said \
"move it down" and three things on screen could plausibly be "it", say so: set \
`needs_confirmation` to true, put your best reading in `interpretation`, and \
score `confidence` honestly — below 50 when you are genuinely guessing. An \
over-confident requirement gets built wrong, and that is the single most \
expensive failure this tool can cause. Under-claiming costs a clarifying \
question; over-claiming costs a sprint.

Similarly: do not invent steps to reproduce that were not demonstrated, do not \
attribute a statement to the client that is not in the transcript, and do not \
manufacture findings to look thorough. A recording with three real requests \
should yield three findings, not eight.

ACCEPTANCE CRITERIA

Write criteria a person can check in a browser. "Clicking Checkout navigates to \
/checkout", "the button remains reachable by keyboard", "no console error is \
produced". Never "checkout works", "looks better", "is fixed". If a finding is a \
question rather than a change, its criteria are empty.

PRIORITY

Judge by impact on the client's users, not by how emphatically it was said. A \
broken checkout is critical whether or not the client raised their voice; a \
colour preference is low even if they mentioned it three times.\
"""


def _prior_findings_block(prior: list[Any]) -> str:
    """Context so a follow-up video amends the project instead of duplicating it."""
    if not prior:
        return ""
    lines = [
        f"- {item.id} [{item.type.value}] {item.title}"
        + (f" (area: {item.area})" if item.area else "")
        + (f" — from {item.video_label}" if item.video_label else "")
        for item in prior
    ]
    return (
        "\n\nFINDINGS ALREADY EXTRACTED FROM EARLIER VIDEOS IN THIS PROJECT\n\n"
        + "\n".join(lines)
        + "\n\nThis video is a later conversation in the same project. If it revisits "
        "one of the items above, do not restate it unchanged — report what is new: a "
        "changed requirement, a reversal, a clarification, or a confirmation that it "
        "is done. If it contradicts an earlier item, say so explicitly in the finding "
        "description and set `needs_confirmation` to true; the user, not you, decides "
        "which version wins. Only report items above as unchanged if the client "
        "explicitly re-raises them."
    )


def _format_transcript(segments: list[Any]) -> str:
    """Timestamped lines, trimmed from the middle when a recording is very long."""
    if not segments:
        return (
            "(No speech was detected in this recording. Work from the frames alone, "
            "and say so in the summary.)"
        )

    lines = [f"[{_clock(s.start)}] {s.text.strip()}" for s in segments if s.text.strip()]
    text = "\n".join(lines)
    if len(text) <= MAX_TRANSCRIPT_CHARS:
        return text

    # Keep the opening and the close — where requirements and decisions cluster —
    # and mark the gap so the model never treats the transcript as complete.
    half = MAX_TRANSCRIPT_CHARS // 2
    head, tail = text[:half], text[-half:]
    return (
        f"{head}\n\n[... a middle section of this transcript was omitted because the "
        f"recording is very long. Do not assume it contained nothing; note in `risks` "
        f"that part of the recording was not analysed. ...]\n\n{tail}"
    )


def _clock(ms: int) -> str:
    total = max(0, ms) // 1000
    return f"{total // 3600:02d}:{(total % 3600) // 60:02d}:{total % 60:02d}"


def _decode_frame(data_url: str) -> tuple[str, str] | None:
    """Validate a frame data URL, returning ``(media_type, base64_payload)``.

    Rejects anything that isn't a plain base64 image data URL — this is the one
    place browser-supplied bytes enter the service, so it is strict rather than
    forgiving.
    """
    match = _DATA_URL_RE.match(data_url.strip())
    if not match:
        return None
    media_type, payload = match.group(1), re.sub(r"\s+", "", match.group(2))
    if media_type == "image/jpg":
        media_type = "image/jpeg"
    try:
        decoded = base64.b64decode(payload, validate=True)
    except (binascii.Error, ValueError):
        return None
    if not decoded or len(decoded) > MAX_FRAME_BYTES:
        return None
    return media_type, payload


def build_content_blocks(request: Any) -> list[dict[str, Any]]:
    """Assemble the user turn: instructions, transcript, then labelled frames.

    Frames are interleaved with their timestamp captions so the model can tie an
    image to a moment in the transcript — an unlabelled wall of screenshots is
    the fastest way to get evidence attached to the wrong finding.
    """
    header = (
        f"CLIENT VIDEO: {request.video_label or request.video_name or 'Untitled recording'}\n"
        f"DURATION: {_clock(request.duration_ms)}\n"
    )
    if request.project_context.strip():
        header += f"\nPROJECT CONTEXT FROM THE USER:\n{request.project_context.strip()}\n"
    header += _prior_findings_block(request.prior_findings)

    blocks: list[dict[str, Any]] = [
        {
            "type": "text",
            "text": f"{header}\n\nTRANSCRIPT\n\n{_format_transcript(request.segments)}",
        }
    ]

    kept = 0
    skipped = 0
    for frame in request.frames[:MAX_FRAMES]:
        decoded = _decode_frame(frame.data_url)
        if decoded is None:
            skipped += 1
            continue
        media_type, payload = decoded
        caption = f"Frame at {_clock(frame.time_ms)} (time_ms: {frame.time_ms})"
        if frame.ocr_text and frame.ocr_text.strip():
            caption += f"\nText read from this frame by OCR: {frame.ocr_text.strip()}"
        blocks.append({"type": "text", "text": caption})
        blocks.append(
            {
                "type": "image",
                "source": {"type": "base64", "media_type": media_type, "data": payload},
            }
        )
        kept += 1

    if skipped:
        logger.warning("video_work: skipped %d malformed frame(s)", skipped)

    closing = (
        "Produce the findings and summary now."
        if kept
        else (
            "No usable frames accompanied this recording, so you are working from the "
            "transcript alone. Set frame_time_ms to -1 on every finding, and note the "
            "absence of visual evidence in `risks`."
        )
    )
    blocks.append({"type": "text", "text": closing})
    return blocks


def active_provider() -> str:
    """Which hosted backend will serve an analysis: "anthropic", "groq" or "".

    Anthropic wins when both are set — it is the paid, higher-quality path, so a
    deployment that has bought it should not silently fall back to a free tier.
    """
    if settings.anthropic_api_key:
        return "anthropic"
    if settings.groq_api_key:
        return "groq"
    return ""


def analysis_available() -> bool:
    """True when some hosted provider is configured."""
    return active_provider() != ""


def groq_output_budget(frame_count: int, transcript_chars: int) -> int:
    """Output tokens to reserve, given what this request actually contains.

    A FIXED budget is wrong in both directions on an 8k/min ceiling. At three
    frames, reserving 3k made the request impossible; at zero frames — an
    audio-only voice note — that same 3k was too SMALL, and the model (which
    reasons before answering) hit the cap mid-object and had the whole call
    rejected. Sizing from the real payload fixes both: an audio-only recording
    gets a generous budget precisely because it spends nothing on images.
    """
    estimated_input = (
        (len(SYSTEM_PROMPT) + len(_schema_instruction())) // 4
        + frame_count * GROQ_TOKENS_PER_FRAME
        + transcript_chars // 4
        + 200  # captions, headers, and the closing instruction
    )
    available = GROQ_TOKEN_CEILING - GROQ_TOKEN_MARGIN - estimated_input
    return max(GROQ_MIN_OUTPUT_TOKENS, min(GROQ_MAX_TOKENS * 2, available))


def max_frame_px_for(provider: str) -> int:
    """Longest edge a frame may have for this provider. 0 = no limit."""
    return GROQ_MAX_FRAME_PX if provider == "groq" else 0


def max_frames_for(provider: str) -> int:
    """Frames the active provider can actually take.

    Groq's vision endpoint hard-caps at 5 images per request, and its free tier
    meters tokens per minute — images are expensive in tokens, so we send fewer
    still and leave room for the transcript.
    """
    return GROQ_MAX_FRAMES if provider == "groq" else MAX_FRAMES


def analyze(request: Any) -> dict[str, Any]:
    """Run the understanding step and return validated findings.

    Raises ``RuntimeError`` with a message safe to show a user. Nothing from the
    request is persisted or logged.
    """
    provider = active_provider()
    if not provider:
        raise RuntimeError(
            "Video analysis is not configured on this server. The transcript and "
            "screenshots produced in your browser are still available to export."
        )

    if provider == "groq":
        return _analyze_groq(request)

    try:
        import anthropic
    except ImportError as exc:  # pragma: no cover - deployment guard
        raise RuntimeError("Video analysis is unavailable on this server.") from exc

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key, timeout=600.0)
    content = build_content_blocks(request)

    params: dict[str, Any] = {
        "model": settings.video_work_model,
        "max_tokens": 32_000,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": content}],
        # Adaptive thinking: matching a vague sentence to the right on-screen
        # element is exactly the multi-step reasoning this is for.
        "thinking": {"type": "adaptive"},
        "output_config": {
            "effort": "high",
            "format": {"type": "json_schema", "schema": ANALYSIS_SCHEMA},
        },
    }

    # Safety classifiers can decline a request; routing the retry by refusal
    # category recovers it server-side instead of handing the user a dead end.
    fallback_params = {
        **params,
        "betas": ["server-side-fallback-2026-07-01"],
        "fallbacks": "default",
    }

    try:
        message = _stream(client, fallback_params)
    except Exception as exc:  # noqa: BLE001 - degrade rather than fail the request
        if not _is_beta_rejection(exc):
            raise RuntimeError(_readable_error(exc)) from exc
        logger.info("video_work: server-side fallbacks unavailable; retrying without")
        try:
            message = _stream(client, params)
        except Exception as inner:  # noqa: BLE001
            raise RuntimeError(_readable_error(inner)) from inner

    # Check the stop reason BEFORE touching content — a refusal returns HTTP 200
    # with empty or partial content, and indexing it blindly would crash here.
    if message.stop_reason == "refusal":
        category = getattr(getattr(message, "stop_details", None), "category", None)
        return {
            "findings": [],
            "summary": {
                "overview": "",
                "what_client_wants": [],
                "what_is_broken": [],
                "risks": [],
                "recommended_order": [],
            },
            "model": message.model,
            "refusal": (
                "The analysis model declined to process this recording"
                + (f" ({category})" if category else "")
                + ". Your transcript and screenshots are unaffected and still exportable."
            ),
        }

    parsed = _first_json(message)
    if parsed is None:
        raise RuntimeError(
            "The analysis returned no structured result. Try again, or export the "
            "transcript and screenshots as they are."
        )

    parsed["model"] = message.model
    parsed["refusal"] = None
    return parsed


def _extract_json(text: str) -> dict[str, Any]:
    """Parse a model reply that SHOULD be a JSON object but may carry reasoning
    preamble or markdown fences. Strict parse first; then the outermost
    brace-to-brace slice. Raises ValueError when neither yields an object."""
    import json as _json

    try:
        return _json.loads(text)
    except (ValueError, TypeError):
        pass
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end > start:
        return _json.loads(text[start : end + 1])
    raise ValueError("no JSON object in model reply")


def _analyze_groq(request: Any) -> dict[str, Any]:
    """Analyse via Groq's free tier.

    Groq is OpenAI-compatible, so this is a plain POST with httpx rather than
    another SDK. Two differences from the Anthropic path shape the code:

      1. NO STRICT SCHEMA. Groq offers JSON *mode* (`json_object`), which
         guarantees valid JSON but not that it matches our shape. So the schema
         is described in the prompt and the result is validated defensively —
         `mapAnalysisPayload` on the client already clamps every field, which is
         what makes accepting a looser provider safe.
      2. IMAGE BUDGET. Five images is a hard API cap and the free tier meters
         tokens per minute, so frames are trimmed hard before sending.

    Groq does not train on inputs or outputs — that is account-wide, not
    tier-gated — which is why it is an acceptable free path for client
    recordings where Gemini's free tier would not be.
    """
    import json

    import httpx

    transcript_chars = sum(len(seg.text) for seg in request.segments)
    decodable_frames = sum(
        1 for f in request.frames[:GROQ_MAX_FRAMES] if _decode_frame(f.data_url)
    )

    # Pre-flight: with a frame in play the reasoning model needs a healthy
    # output budget or it dies mid-object. If the frame starves it, send none.
    frames_allowed = decodable_frames
    if frames_allowed and groq_output_budget(
        frames_allowed, transcript_chars
    ) < GROQ_HEALTHY_OUTPUT_WITH_FRAME:
        logger.info(
            "video_work: groq pre-flight dropped %d frame(s) to protect the output budget",
            frames_allowed,
        )
        frames_allowed = 0

    _no_strict = False

    def _set_no_strict() -> None:
        nonlocal _no_strict
        _no_strict = True

    def _attempt(n_frames: int) -> "httpx.Response":
        payload = {
            "model": settings.groq_model,
            **(
                {"reasoning_effort": "low"}
                if settings.groq_model.startswith("openai/gpt-oss")
                else {}
            ),
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT + "\n\n" + _schema_instruction()},
                {"role": "user", "content": _groq_content(request, max_frames=n_frames)},
            ],
            **({} if _no_strict else {"response_format": {"type": "json_object"}}),
            # Requirement extraction should be reproducible, not creative.
            "temperature": 0.2,
            "max_tokens": groq_output_budget(n_frames, transcript_chars),
        }
        with httpx.Client(timeout=300.0) as client:
            return client.post(
                GROQ_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )

    try:
        response = _attempt(frames_allowed)
        # Self-heal once: the two live failure modes (413 over-budget and
        # json_validate_failed with an empty generation) are both cured by
        # freeing the frame's ~2.4k tokens for input headroom and output room.
        if response.status_code == 413 and frames_allowed:
            logger.warning("video_work: groq 413 with a frame - retrying text-only")
            frames_allowed = 0
            response = _attempt(0)
        if response.status_code == 400 and "json_validate_failed" in response.text:
            logger.warning(
                "video_work: groq json_validate_failed - retrying without strict JSON mode"
            )
            frames_allowed = 0
            _set_no_strict()
            response = _attempt(0)
    except httpx.HTTPError as exc:
        logger.warning("video_work: groq transport failure (%s)", type(exc).__name__)
        raise RuntimeError(
            "Couldn't reach the analysis service. Your transcript and screenshots are "
            "still exportable."
        ) from exc

    # Log the provider's own words on every rejection. These paths used to raise
    # silently, so a live 413 produced a user-facing message and NOTHING in
    # journalctl — leaving the actual limit invisible and the cause guesswork.
    # Groq states the exact token figures; they belong in the log.
    if response.status_code >= 400:
        # Composition, not content: counts and byte sizes only. Enough to see
        # WHY a request was too large without ever logging a transcript or a
        # frame — which the privacy doctrine forbids outright.
        shape = (
            f"segments={len(request.segments)} "
            f"transcript_chars={sum(len(s.text) for s in request.segments)} "
            f"frames={len(request.frames[:GROQ_MAX_FRAMES])} "
            f"frame_kb={[len(f.data_url) // 1024 for f in request.frames[:GROQ_MAX_FRAMES]]} "
            f"ocr_chars={[len(f.ocr_text or '') for f in request.frames[:GROQ_MAX_FRAMES]]} "
            f"prompt_chars={len(SYSTEM_PROMPT) + len(_schema_instruction())}"
        )
        logger.warning(
            "video_work: groq %s — %s | %s",
            response.status_code,
            response.text[:300].replace("\n", " "),
            shape,
        )

    if response.status_code == 429:
        raise RuntimeError(
            "The free analysis tier is at its limit right now — it's shared across "
            "everyone using this site. Wait a minute and retry, or run the analysis on "
            "your own machine with Ollama for unlimited use."
        )
    if response.status_code in (401, 403):
        raise RuntimeError("Video analysis is not configured correctly on this server.")
    if response.status_code == 413:
        raise RuntimeError(
            "That recording produced too much evidence for the free tier. Trim the video, "
            "or use Ollama locally, which has no such limit."
        )
    if response.status_code >= 400:
        raise RuntimeError(
            "The analysis could not be completed. Your transcript and screenshots are "
            "still exportable."
        )

    try:
        body = response.json()
        text = body["choices"][0]["message"]["content"]
        parsed = _extract_json(text)
    except (KeyError, IndexError, ValueError, TypeError) as exc:
        raise RuntimeError(
            "The analysis returned no usable result. Try again, or export the transcript "
            "and screenshots as they are."
        ) from exc

    if not isinstance(parsed, dict) or not isinstance(parsed.get("findings"), list):
        raise RuntimeError(
            "The analysis returned an unexpected result. Try again, or run it locally "
            "with Ollama for more reliable output."
        )

    parsed.setdefault(
        "summary",
        {
            "overview": "",
            "what_client_wants": [],
            "what_is_broken": [],
            "risks": [],
            "recommended_order": [],
        },
    )
    # Shape coercion (2026-08-21): gpt-oss-120b sometimes emits overview as a
    # LIST of sentences and the list fields as a single string. Coerce rather
    # than 500 - the content is right, only the container is loose.
    summary = parsed.get("summary")
    if isinstance(summary, dict):
        overview = summary.get("overview", "")
        if isinstance(overview, list):
            summary["overview"] = " ".join(str(x) for x in overview)
        elif not isinstance(overview, str):
            summary["overview"] = str(overview)
        for key in ("what_client_wants", "what_is_broken", "risks", "recommended_order"):
            value = summary.get(key, [])
            if isinstance(value, str):
                summary[key] = [value] if value else []
            elif isinstance(value, list):
                summary[key] = [str(x) for x in value]
            else:
                summary[key] = []
    else:
        parsed["summary"] = {
            "overview": str(summary) if summary else "",
            "what_client_wants": [],
            "what_is_broken": [],
            "risks": [],
            "recommended_order": [],
        }
    parsed["model"] = f"{settings.groq_model} (free tier)"
    parsed["refusal"] = None
    return parsed


def _schema_instruction() -> str:
    """Describe the required shape compactly, for providers without strict schemas.

    Deliberately NOT a dump of ANALYSIS_SCHEMA. That costs roughly 1,500 tokens
    of description text, which is unaffordable against Groq's 8k-per-minute
    ceiling — and largely redundant, since `response_format: json_object`
    already guarantees valid JSON and every field is clamped client-side. What
    the model actually needs is the field list and the few rules that change the
    output's meaning.
    """
    fields = ", ".join(FINDING_FIELDS_ORDER)
    return (
        "Return one JSON object with exactly two keys: \"findings\" (array) and "
        "\"summary\" (object).\n\n"
        f"Each finding has exactly these keys: {fields}.\n"
        "  - type: one of " + "|".join(_FINDING_TYPES) + "\n"
        "  - priority: one of " + "|".join(_PRIORITIES) + "\n"
        "  - confidence: integer 0-100, honest (under 50 when guessing)\n"
        "  - id: TYPE-001 style, e.g. BUG-001, DESIGN-002\n"
        "  - client_statement: the client's words VERBATIM from the transcript\n"
        "  - interpretation: your reading of them, written as a proposal\n"
        "  - timestamp_ms / frame_time_ms: integers; frame_time_ms must be a "
        "time_ms you were given, or -1\n"
        "  - steps_to_reproduce / acceptance_criteria / dependencies: arrays of "
        "strings (empty arrays are fine)\n"
        "  - needs_confirmation: boolean, true whenever the intent was ambiguous\n\n"
        "summary has exactly: overview (string), what_client_wants, "
        "what_is_broken, risks, recommended_order (all arrays of strings).\n\n"
        "Output only that JSON object — no prose, no markdown fence."
    )


#: Field order for the compact instruction above. Mirrors ANALYSIS_SCHEMA and
#: lib/video-work/contract.ts; the test suites pin all three together.
FINDING_FIELDS_ORDER: Final[list[str]] = [
    "id", "type", "title", "priority", "confidence", "area", "description",
    "observed", "expected", "steps_to_reproduce", "client_statement",
    "interpretation", "timestamp_ms", "frame_time_ms", "acceptance_criteria",
    "dependencies", "needs_confirmation",
]


def _groq_content(request: Any, max_frames: int = GROQ_MAX_FRAMES) -> list[dict[str, Any]]:
    """Build the OpenAI-style multimodal content array."""
    header = (
        f"CLIENT VIDEO: {request.video_label or request.video_name or 'Untitled recording'}\n"
        f"DURATION: {_clock(request.duration_ms)}\n"
    )
    if request.project_context.strip():
        header += f"\nPROJECT CONTEXT FROM THE USER:\n{request.project_context.strip()}\n"
    header += _prior_findings_block(request.prior_findings)

    parts: list[dict[str, Any]] = [
        {
            "type": "text",
            "text": f"{header}\n\nTRANSCRIPT\n\n{_format_transcript(request.segments)}",
        }
    ]

    kept = 0
    for frame in request.frames[:max_frames]:
        decoded = _decode_frame(frame.data_url)
        if decoded is None:
            continue
        media_type, b64 = decoded
        caption = f"Screenshot at {_clock(frame.time_ms)} (time_ms: {frame.time_ms})"
        if frame.ocr_text and frame.ocr_text.strip():
            caption += f"\nText read from it by OCR: {frame.ocr_text.strip()}"
        parts.append({"type": "text", "text": caption})
        parts.append(
            {"type": "image_url", "image_url": {"url": f"data:{media_type};base64,{b64}"}}
        )
        kept += 1

    parts.append(
        {
            "type": "text",
            "text": (
                "Produce the findings and summary now."
                if kept
                else (
                    "No usable screenshots accompany this recording. Set frame_time_ms to -1 "
                    "on every finding and note the absence of visual evidence in risks."
                )
            ),
        }
    )
    return parts


def _stream(client: Any, params: dict[str, Any]) -> Any:
    """Stream the request. A 32K-token ceiling would time out unstreamed."""
    with client.beta.messages.stream(**params) as stream:
        return stream.get_final_message()


def _first_json(message: Any) -> dict[str, Any] | None:
    """Pull the structured payload out of the response.

    ``parsed_output`` is present when the SDK validated it; otherwise fall back
    to the first text block, which the schema guarantees is the JSON document.
    """
    import json

    parsed = getattr(message, "parsed_output", None)
    if isinstance(parsed, dict):
        return parsed

    for block in message.content:
        if getattr(block, "type", None) == "text":
            try:
                loaded = json.loads(block.text)
            except json.JSONDecodeError:
                continue
            if isinstance(loaded, dict):
                return loaded
    return None


def _is_beta_rejection(exc: Exception) -> bool:
    """True when the failure is the fallbacks beta not being enabled for this key."""
    if getattr(exc, "status_code", None) != 400:
        return False
    text = str(exc).lower()
    return "fallback" in text or "beta" in text


def _readable_error(exc: Exception) -> str:
    """Map SDK failures onto something a user can act on, leaking no internals.

    The distinction that matters is *retryable or not*. Telling someone to try
    again when the account is out of credit sends them round a loop that cannot
    succeed, so the not-retryable cases are named explicitly and the generic
    fallback never promises a retry will help.
    """
    status = getattr(exc, "status_code", None)
    text = str(exc).lower()

    if status == 401 or status == 403:
        return (
            "Video analysis is not configured correctly on this server — the API key was "
            "rejected. Your transcript and screenshots are unaffected and still exportable."
        )
    # A 400 is the API telling us the request or the account is wrong. Retrying
    # changes neither, so say what actually needs doing.
    if status == 400:
        if "credit balance" in text or "billing" in text or "quota" in text:
            return (
                "Video analysis is unavailable: the account behind this server has no API "
                "credit remaining. Transcription and screenshots still ran in your browser "
                "and are exportable — the analysis step needs topping up by the site owner."
            )
        if "data retention" in text or "zero data retention" in text:
            return "Video analysis is unavailable due to this server's data-retention configuration."
        return (
            "The analysis request was rejected. Your transcript and screenshots are "
            "exportable; the analysis step needs attention from the site owner."
        )
    if status == 429:
        return "The analysis service is rate limited right now. Wait a moment and retry."
    if status == 413:
        return (
            "This recording produced too much evidence to analyse in one pass. Trim the "
            "video, or reduce the number of screenshots, and try again."
        )
    if isinstance(status, int) and status >= 500:
        return "The analysis service is temporarily unavailable. Please retry shortly."

    logger.warning("video_work: analysis failed (%s)", type(exc).__name__)
    return (
        "The analysis could not be completed. Your transcript and screenshots are still "
        "exportable."
    )
