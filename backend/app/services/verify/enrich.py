"""Signal enrichment — the honesty layer.

Attaches to each raw detector finding the three things a measurement cannot know
about itself:

    reliability              how much this KIND of observation is worth at all
    alternative_explanations the innocent readings of the same observation
    independence_group       what it shares its blind spots with

Mirrors ``GigAI Verify/src/analysis/detectors/enrich.ts``; keep the two in step
so the extension and the engine never disagree about what a signal is worth.

Every entry's ``alternatives`` list answers "how could this be wrong?", and
clients render it directly beneath the finding. An empty list would assert that
an observation has no innocent explanation, which is almost never true — so the
default below is deliberately not empty.

Note how little the stylometric signals are trusted: all ``low`` reliability,
and nearly all sharing one of the ``stylometry-*`` groups, so a document that
trips six of them still cannot outweigh one verified provenance record. That is
the main defence against false positives on human writing (§55).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Final

from app.schemas.verify import (
    Signal,
    SignalDirection,
    SignalFamily,
    SignalReliability,
    SignalStrength,
)

# ── Reusable innocent explanations ────────────────────────────────────────────

STRIPPED_METADATA: Final[str] = (
    "Most social platforms and CDNs strip metadata on upload, so its absence is "
    "expected for a large share of ordinary files."
)
FORMAL_REGISTER: Final[str] = (
    "Academic, legal, corporate and technical writing conventionally use this register."
)
NON_NATIVE: Final[str] = (
    "Writers working in a second language often produce these patterns for reasons "
    "unrelated to AI."
)
HOUSE_STYLE: Final[str] = (
    "A publication style guide or CMS template can impose this on human writing."
)
EDITING: Final[str] = (
    "A person polishing an AI draft — or an AI tool polishing human writing — "
    "produces the same result."
)
METADATA_EDITABLE: Final[str] = (
    "This field is trivially editable and can be set to anything by whoever last "
    "wrote the file."
)
TEMPLATING: Final[str] = (
    "Template-generated content (product listings, reports, documentation) shows "
    "this without any AI involvement."
)

_STYLE_DEFAULT: Final[tuple[str, ...]] = (FORMAL_REGISTER, NON_NATIVE, EDITING)


@dataclass(frozen=True, slots=True)
class Enrichment:
    reliability: SignalReliability
    independence_group: str
    alternatives: tuple[str, ...]
    strength: SignalStrength | None = None
    family: SignalFamily | None = field(default=None)


#: Keyed by the detector's signal id. Independence groups are the load-bearing
#: column: every signal that works by counting words shares `stylometry-lexical`,
#: so vocabulary, phrasing and connective density collapse into one line of
#: evidence rather than three.
ENRICHMENT: Final[dict[str, Enrichment]] = {
    # ── text: lexical (one line of evidence) ──
    "text.ai-vocabulary": Enrichment(
        SignalReliability.LOW,
        "stylometry-lexical",
        (
            *_STYLE_DEFAULT,
            "These are ordinary English words; marketing, consulting and SEO writing "
            "use them heavily without any AI involvement.",
        ),
    ),
    "text.ai-phrasing": Enrichment(
        SignalReliability.LOW, "stylometry-lexical", (*_STYLE_DEFAULT, HOUSE_STYLE)
    ),
    "text.connective-scaffolding": Enrichment(
        SignalReliability.LOW,
        "stylometry-lexical",
        (
            *_STYLE_DEFAULT,
            "Academic and argumentative writing is taught to use exactly these connectives.",
        ),
    ),
    "text.low-diversity": Enrichment(
        SignalReliability.LOW,
        "stylometry-lexical",
        (
            TEMPLATING,
            "Technical and instructional writing repeats terminology deliberately, "
            "because substituting synonyms would be ambiguous.",
        ),
    ),
    # ── text: rhythm and shape (a second, distinct line) ──
    "text.uniform-sentences": Enrichment(
        SignalReliability.LOW,
        "stylometry-rhythm",
        (
            HOUSE_STYLE,
            "Copy edited to a readability target is deliberately even.",
            "Machine translation of human writing produces the same flattening.",
        ),
    ),
    "text.varied-sentences": Enrichment(
        SignalReliability.LOW,
        "stylometry-rhythm",
        ("Models can be prompted to vary sentence length, so this does not rule out generation.",),
    ),
    "text.uniform-paragraphs": Enrichment(
        SignalReliability.LOW, "stylometry-shape", (TEMPLATING, HOUSE_STYLE),
        family=SignalFamily.STRUCTURE,
    ),
    "text.repeated-openers": Enrichment(
        SignalReliability.LOW,
        "stylometry-shape",
        (
            "Listicles, recipes, documentation and step-by-step guides repeat openers by design.",
            HOUSE_STYLE,
        ),
        family=SignalFamily.STRUCTURE,
    ),
    "text.triads": Enrichment(
        SignalReliability.LOW,
        "stylometry-rhythm",
        ("The rule of three is a standard rhetorical device taught in every writing course.", *_STYLE_DEFAULT),
    ),
    # ── text: register and voice ──
    "text.no-contractions": Enrichment(
        SignalReliability.LOW,
        "stylometry-register",
        (FORMAL_REGISTER, NON_NATIVE, "Many style guides prohibit contractions outright."),
    ),
    "text.conversational-register": Enrichment(
        SignalReliability.LOW,
        "stylometry-register",
        ("Models readily produce a conversational register on request.",),
    ),
    "text.personal-voice": Enrichment(
        SignalReliability.LOW,
        "stylometry-voice",
        ("First-person anecdotes are easy to generate and are a staple of generated marketing copy.",),
    ),
    "text.human-roughness": Enrichment(
        SignalReliability.LOW,
        "stylometry-voice",
        ("Typos can be introduced deliberately, and text pasted through several tools picks up spacing artefacts.",),
        family=SignalFamily.EDITING,
    ),
    "text.low-specificity": Enrichment(
        SignalReliability.LOW,
        "stylometry-content",
        ("Opinion pieces, overviews and introductory explainers are legitimately short on figures.",),
    ),
    "text.high-specificity": Enrichment(
        SignalReliability.LOW,
        "stylometry-content",
        ("A model given source material produces dense, specific text just as readily.",),
    ),
    # ── the one text signal that is evidence of record ──
    "text.ai-disclosure": Enrichment(
        SignalReliability.HIGH,
        "ai-self-disclosure",
        (
            "The text may be quoting or discussing an AI assistant rather than being "
            "written by one — check whether the phrase sits inside a quotation.",
        ),
        strength=SignalStrength.STRONG,
        family=SignalFamily.METADATA,
    ),
    # ── page / document metadata ──
    "metadata.ai-generator": Enrichment(
        SignalReliability.HIGH,
        "declared-generator",
        (
            "The tool may have been used only to publish or format content a person wrote.",
            METADATA_EDITABLE,
        ),
        strength=SignalStrength.STRONG,
    ),
    "metadata.cms-generator": Enrichment(SignalReliability.MEDIUM, "declared-generator", ()),
    "metadata.named-author": Enrichment(
        SignalReliability.LOW,
        "attribution",
        (METADATA_EDITABLE, "A named author routinely publishes AI-assisted work under their own byline."),
    ),
    "metadata.no-author": Enrichment(
        SignalReliability.LOW,
        "attribution",
        ("Corporate, documentation and news-wire pages frequently carry no byline.",),
    ),
    # ── image provenance ──
    "provenance.c2pa-ai": Enrichment(
        SignalReliability.HIGH,
        "c2pa-manifest",
        (
            "The manifest signature was not cryptographically verified, so a forged or "
            "altered manifest would look the same.",
            "A manifest can mark an image AI-involved when only a minor generative edit was applied.",
        ),
        strength=SignalStrength.STRONG,
    ),
    "provenance.c2pa-camera": Enrichment(
        SignalReliability.HIGH,
        "c2pa-manifest",
        (
            "The manifest signature was not cryptographically verified.",
            "A camera capture can still have been heavily edited afterwards.",
        ),
        strength=SignalStrength.STRONG,
    ),
    "provenance.c2pa-present": Enrichment(SignalReliability.HIGH, "c2pa-manifest", ()),
    "provenance.camera-exif": Enrichment(
        SignalReliability.HIGH,
        "camera-metadata",
        (
            "EXIF fields are editable and can be copied onto a generated image.",
            "A photograph of an AI-generated image on a screen carries genuine camera EXIF.",
        ),
    ),
    "image.ai-tool-metadata": Enrichment(
        SignalReliability.HIGH,
        "embedded-generator-fields",
        (
            METADATA_EDITABLE,
            "The tool may have been used to edit or upscale an existing photograph.",
        ),
        strength=SignalStrength.STRONG,
    ),
    "image.editor-software": Enrichment(
        SignalReliability.MEDIUM,
        "editor-metadata",
        ("Modern editors include generative features, so an editing step does not establish human origin.",),
        family=SignalFamily.EDITING,
    ),
    "image.no-metadata": Enrichment(
        SignalReliability.MEDIUM, "metadata-absence", (STRIPPED_METADATA,)
    ),
}

#: Never silently trusted.
DEFAULT_ENRICHMENT: Final[Enrichment] = Enrichment(
    SignalReliability.LOW,
    "uncategorised",
    (
        "This signal has no catalogued alternative explanations yet; treat it as weak "
        "supporting evidence only.",
    ),
)

#: strength x reliability → weight. Moving up a reliability row matters more than
#: moving up a strength column: a very distinctive observation made by an
#: unreliable method is still an unreliable observation.
_WEIGHT: Final[dict[SignalReliability, dict[SignalStrength, float]]] = {
    SignalReliability.LOW: {
        SignalStrength.WEAK: 0.08,
        SignalStrength.MODERATE: 0.16,
        SignalStrength.STRONG: 0.26,
    },
    SignalReliability.MEDIUM: {
        SignalStrength.WEAK: 0.18,
        SignalStrength.MODERATE: 0.34,
        SignalStrength.STRONG: 0.52,
    },
    SignalReliability.HIGH: {
        SignalStrength.WEAK: 0.32,
        SignalStrength.MODERATE: 0.60,
        SignalStrength.STRONG: 0.92,
    },
}


def _strength_from_weight(weight: float) -> SignalStrength:
    if weight >= 0.7:
        return SignalStrength.STRONG
    if weight >= 0.35:
        return SignalStrength.MODERATE
    return SignalStrength.WEAK


def enrich(signal: Signal) -> Signal:
    """Attach reliability, independence and alternative explanations.

    Weight is RECOMPUTED from strength x reliability rather than kept from the
    detector, so a low-reliability heuristic can never carry the pull of a
    cryptographic manifest just because its author wrote a big number.
    """
    entry = ENRICHMENT.get(signal.id, DEFAULT_ENRICHMENT)
    strength = entry.strength or _strength_from_weight(signal.weight)

    signal.strength = strength
    signal.reliability = entry.reliability
    signal.independence_group = entry.independence_group
    signal.alternative_explanations = list(entry.alternatives)
    if entry.family is not None:
        signal.family = entry.family

    signal.weight = (
        0.0
        if signal.direction is SignalDirection.NEUTRAL
        else _WEIGHT[entry.reliability][strength]
    )
    return signal


def enrich_all(signals: list[Signal]) -> list[Signal]:
    return [enrich(signal) for signal in signals]
