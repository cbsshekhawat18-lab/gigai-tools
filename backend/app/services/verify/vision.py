"""Model-assisted visual inspection for GigAI Verify.

WHAT THIS FILLS. The extension declares a `model.visual` detector slot that
declines locally, because there is no trained classifier in a browser bundle and
a hand-rolled frequency heuristic would fire on every screenshot and compressed
photo. This is the server-side implementation of that slot.

WHAT IT IS NOT: an AI-image classifier. There is no trained synthetic-image
detector here either. What runs is a vision model asked to report *observable
rendering artefacts* — the six-fingered hand, text that dissolves into
pseudo-glyphs, jewellery that merges into skin, a background that changes
geometry mid-object. Those are things a model can genuinely see and describe.

WHY THAT DISTINCTION MATTERS. Asking a vision model "is this AI-generated?"
produces a fluent, confident answer with no established relationship to the
truth — it will call a real photograph synthetic because the lighting is unusual
and miss a generated one that happens to look mundane. Asking it "what do you
observe about hands, text and edges?" produces observations a human can check
against the image themselves. The first is a guess wearing a lab coat; the
second is evidence.

SO EVERY SIGNAL FROM HERE IS:
  • LOW reliability — a model's visual impression, rated as such
  • carried in one `independenceGroup`, because one model looking once is one
    line of evidence however many artefacts it lists
  • outside the hard-evidence test, so it can never on its own produce HIGH
    confidence or override a C2PA manifest

Privacy: the image bytes are held in memory for one request and discarded with
the response. Nothing is stored, and no image content is logged.
"""

from __future__ import annotations

import base64
import json
import logging
from typing import Any, Final

from app.core.config import settings
from app.schemas.verify import (
    EvidenceItem,
    EvidenceKind,
    Signal,
    SignalDirection,
    SignalFamily,
    SignalReliability,
    SignalStrength,
)

logger = logging.getLogger("app.services.verify.vision")

#: Largest image sent to the model. Above this it is downscaled by the caller.
MAX_IMAGE_BYTES: Final[int] = 5 * 1024 * 1024

_SUPPORTED_MEDIA: Final[dict[bytes, str]] = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG": "image/png",
    b"RIFF": "image/webp",
    b"GIF8": "image/gif",
}

_SYSTEM_PROMPT: Final[str] = """\
You are the visual inspection stage of GigAI Verify.

Your job is NARROW and you must not exceed it:

- You DO report specific, observable rendering artefacts in the image, and say \
exactly where in the frame each one is.
- You DO NOT decide whether the image is AI-generated. A separate deterministic \
stage weighs your observations against provenance and metadata. Never state or \
imply a verdict.
- You DO NOT estimate percentages, probabilities or scores.
- You DO NOT guess. If the image is ordinary, return an empty list. An empty \
list is a correct and useful answer, and the common one.

Artefacts worth reporting when you can actually see them:
  • hands, fingers or limbs with wrong counts, joints or fusions
  • text or signage that dissolves into letter-like shapes that are not letters
  • jewellery, straps, glasses or hair that merge into skin or change course
  • edges of an object that continue incorrectly behind another object
  • repeated or mirrored texture where it should be irregular
  • lighting or shadows inconsistent between parts of the same scene
  • anatomically impossible reflections, or reflections that disagree

Things that are NOT artefacts and must NOT be reported:
  • unusual but plausible lighting, colour grading or styling
  • shallow depth of field, bokeh, motion blur, film grain, noise
  • heavy compression, low resolution, upscaling softness
  • the image being a screenshot, illustration, render, or painting
  • the subject being unusual, striking or beautiful

For each observation set `confidence_in_observation` to how clearly you can \
SEE the artefact — not how AI-generated you think the image is.
"""

_OBSERVATION_SCHEMA: Final[dict[str, Any]] = {
    "type": "object",
    "properties": {
        "artefacts": {
            "type": "array",
            "description": (
                "Observable rendering artefacts. Empty if the image shows none, "
                "which is the normal case for ordinary photographs."
            ),
            "items": {
                "type": "object",
                "properties": {
                    "what": {
                        "type": "string",
                        "description": "The artefact, in plain language. Max 12 words.",
                    },
                    "where": {
                        "type": "string",
                        "description": (
                            "Where in the frame, so a person can look at the same place. "
                            "E.g. 'left hand, lower third'."
                        ),
                    },
                    "confidence_in_observation": {
                        "type": "string",
                        "enum": ["clear", "possible"],
                        "description": "How clearly the artefact is visible. Not a verdict.",
                    },
                },
                "required": ["what", "where", "confidence_in_observation"],
                "additionalProperties": False,
            },
        },
        "image_description": {
            "type": "string",
            "description": "One neutral sentence describing what the image shows.",
        },
    },
    "required": ["artefacts", "image_description"],
    "additionalProperties": False,
}


def model_available() -> bool:
    return bool(settings.anthropic_api_key)


def _media_type(data: bytes) -> str | None:
    for magic, media in _SUPPORTED_MEDIA.items():
        if data.startswith(magic):
            return media
    return None


def inspect(data: bytes) -> list[Signal]:
    """Ask the vision model what it can see. Returns [] on any failure.

    Never raises: the caller already has provenance and metadata results, and a
    model outage must degrade the analysis rather than lose it.
    """
    if not model_available():
        return []

    media_type = _media_type(data)
    if media_type is None or len(data) > MAX_IMAGE_BYTES:
        return []

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key, timeout=60.0)
        message = client.messages.create(
            model=settings.verify_model,
            max_tokens=1_500,
            system=_SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": base64.b64encode(data).decode("ascii"),
                            },
                        },
                        {
                            "type": "text",
                            "text": (
                                "Report the observable rendering artefacts in this image, "
                                "if any. Return an empty list if it shows none."
                            ),
                        },
                    ],
                }
            ],
            output_config={"format": {"type": "json_schema", "schema": _OBSERVATION_SCHEMA}},
        )
    except Exception:  # noqa: BLE001 - degrade, and never log image content
        logger.exception("verify: vision model call failed")
        return []

    payload = getattr(message, "parsed_output", None)
    if not isinstance(payload, dict):
        for block in message.content:
            if getattr(block, "type", None) == "text":
                try:
                    payload = json.loads(block.text)
                except json.JSONDecodeError:
                    continue
                break

    if not isinstance(payload, dict):
        return []

    artefacts = payload.get("artefacts")
    if not isinstance(artefacts, list) or not artefacts:
        # Nothing seen. Reported as a neutral row so the user knows the model
        # looked and found nothing, rather than that it never ran.
        return [
            Signal(
                id="model.visual-clean",
                family=SignalFamily.MEDIA,
                label="Visual inspection found no rendering artefacts",
                detail=(
                    "A vision model examined the image for the artefacts image generators "
                    "typically leave — malformed hands, dissolving text, merged edges — and "
                    "reported none. Many generated images show none either, so this is "
                    "context rather than evidence of human origin."
                ),
                direction=SignalDirection.NEUTRAL,
                weight=0.0,
                reliability=SignalReliability.LOW,
                independence_group="model-visual",
                detector_id="model.visual",
                detector_version="1.0.0",
            )
        ]

    clear = [a for a in artefacts if isinstance(a, dict) and a.get("confidence_in_observation") == "clear"]
    considered = clear or [a for a in artefacts if isinstance(a, dict)]

    evidence = [
        EvidenceItem(
            kind=EvidenceKind.EXCERPT,
            label=str(item.get("where", "in frame"))[:120],
            value=str(item.get("what", ""))[:300],
        )
        for item in considered[:4]
    ]

    return [
        Signal(
            id="model.visual-artefacts",
            family=SignalFamily.MEDIA,
            label="Visual rendering artefacts observed",
            detail=(
                f"A vision model reported {len(considered)} rendering "
                f"artefact{'' if len(considered) == 1 else 's'} of the kind image generators "
                "commonly leave. This is a model's visual impression, not a measurement — "
                "look at the places listed and judge for yourself."
            ),
            direction=SignalDirection.AI,
            # Deliberately capped: one model, looking once, at low reliability.
            weight=0.26 if clear else 0.16,
            strength=SignalStrength.STRONG if clear else SignalStrength.MODERATE,
            reliability=SignalReliability.LOW,
            independence_group="model-visual",
            alternative_explanations=[
                "Vision models over-report artefacts on illustrations, renders, composites "
                "and heavily compressed photographs.",
                "Genuine photographs contain odd-looking details all the time; an artefact "
                "is a reason to look closely, not a finding.",
                "This is one model's impression of the pixels, with no established accuracy "
                "for distinguishing generated images.",
            ],
            evidence=evidence,
            detector_id="model.visual",
            detector_version="1.0.0",
        )
    ]
