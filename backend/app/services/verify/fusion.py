"""Evidence fusion (v2) — correlation, contradiction, coverage, classification.

Mirrors ``GigAI Verify/src/analysis/core/`` so the extension and the engine never
disagree about how the same evidence should be read.

DESIGN RULES, in priority order:

1. **Abstain before guessing (§41).** Thin or contradictory evidence resolves to
   INCONCLUSIVE, not to whichever side is 0.1 ahead. A detector that always
   answers is a detector that is often wrong.
2. **No scores escape.** Weights are internal; ``Confidence`` is all that gets
   out.
3. **Heuristics cannot earn HIGH.** Only high-reliability evidence of *record* —
   a manifest, a generator tag, an assistant's own words — lifts the ceiling.
4. **Mixed evidence is an answer.** A model draft a person edited is
   AI_ASSISTED: a finding, not a failure to decide.
5. **False positives are the costly error (§55).** Calling human work
   AI-generated has real consequences; returning INCONCLUSIVE on AI content
   costs one unanswered question. ``AI_ASYMMETRY`` encodes that trade.
"""

from __future__ import annotations

from typing import Final

from app.schemas.verify import (
    Classification,
    Confidence,
    Contradiction,
    CoverageGrade,
    CoverageReport,
    Signal,
    SignalDirection,
    SignalFamily,
    SignalReliability,
)

DISCLAIMER: Final[str] = (
    "AI detection is probabilistic and can produce false positives and false "
    "negatives. This is evidence, not proof of authorship."
)

# ── Thresholds ────────────────────────────────────────────────────────────────

#: CALIBRATION NOTE. Classification and confidence answer different questions:
#: classification is "which way does the evidence lean", confidence is "how much
#: should you trust that". Thresholds high enough to force INCONCLUSIVE on any
#: style-only evidence collapse the two and make confidence redundant. So these
#: admit a lean on style alone, and the confidence ceilings keep it honest — such
#: a result lands at LOW with "no verifiable provenance" in its summary.
MIN_MASS_FOR_VERDICT: Final[float] = 0.40
MIN_MASS_FOR_MODERATE: Final[float] = 1.1

#: Just below one strong high-reliability signal (0.92), so a single verified
#: provenance record can carry HIGH on its own — it is the strongest evidence
#: available, and demanding corroboration before believing it is the wrong
#: caution.
MIN_MASS_FOR_HIGH: Final[float] = 0.85

MIXED_SIDE_THRESHOLD: Final[float] = 0.4
DECISIVE_MARGIN: Final[float] = 0.35

#: Extra margin the AI side must clear. The false-positive control: raising this
#: trades recall on AI content for safety on human content, which is the correct
#: trade for this product.
AI_ASYMMETRY: Final[float] = 0.25

COVERAGE_FLOOR_FOR_MODERATE: Final[float] = 0.3
COVERAGE_FLOOR_FOR_HIGH: Final[float] = 0.55

#: Weight retained by the 2nd, 3rd, … signal in a correlated group. Steep on
#: purpose: a five-detector ensemble sharing one method must not out-weigh a
#: single independent high-reliability signal.
REDUNDANCY_DISCOUNT: Final[tuple[float, ...]] = (1.0, 0.25, 0.12, 0.06)

HEADLINE: Final[dict[Classification, str]] = {
    Classification.AI_GENERATED: "Likely AI-Generated",
    Classification.HUMAN_GENERATED: "Likely Human-Generated",
    Classification.AI_ASSISTED: "Likely AI-Assisted",
    Classification.INCONCLUSIVE: "Inconclusive",
}

DESCRIPTION: Final[dict[Classification, str]] = {
    Classification.AI_GENERATED: "The available evidence is more consistent with AI-generated content.",
    Classification.HUMAN_GENERATED: "The available evidence is more consistent with human-created content.",
    Classification.AI_ASSISTED: "Evidence suggests AI involvement alongside human editing or contribution.",
    Classification.INCONCLUSIVE: "There isn't enough reliable evidence to determine the origin.",
}


# ── Correlation ───────────────────────────────────────────────────────────────


def correlate(signals: list[Signal]) -> tuple[list[Signal], int]:
    """Collapse signals that are not independent, before anything counts them.

    Three detectors sharing a model family are one piece of evidence observed
    three times — and they share their blind spots, so counting them separately
    manufactures agreement out of redundancy. Returns the adjusted signals and
    the number of genuinely independent lines of evidence.
    """
    groups: dict[str, list[Signal]] = {}
    for signal in signals:
        key = (
            f"neutral:{signal.id}"
            if signal.direction is SignalDirection.NEUTRAL
            else signal.independence_group
        )
        groups.setdefault(key, []).append(signal)

    independent = 0
    for key, members in groups.items():
        members.sort(key=lambda s: s.weight, reverse=True)
        if not key.startswith("neutral:"):
            independent += 1
        for index, signal in enumerate(members):
            factor = REDUNDANCY_DISCOUNT[min(index, len(REDUNDANCY_DISCOUNT) - 1)]
            signal.weight *= factor

    return signals, independent


# ── Contradiction ─────────────────────────────────────────────────────────────

MIN_WEIGHT_TO_CONFLICT: Final[float] = 0.15


def find_contradictions(signals: list[Signal]) -> list[Contradiction]:
    """Surface genuine disagreement rather than averaging it away.

    A manifest declaring AI generation alongside camera EXIF is the most
    informative thing a file can contain; resolving it to a winner discards the
    finding.
    """
    weighty = [s for s in signals if s.weight >= MIN_WEIGHT_TO_CONFLICT]
    found: list[Contradiction] = []

    provenance_ai = [
        s for s in weighty
        if s.family is SignalFamily.PROVENANCE and s.direction is SignalDirection.AI
    ]
    provenance_human = [
        s for s in weighty
        if s.family is SignalFamily.PROVENANCE and s.direction is SignalDirection.HUMAN
    ]
    if provenance_ai and provenance_human:
        found.append(
            Contradiction(
                summary="The file carries provenance records pointing in both directions.",
                ai_side=[s.label for s in provenance_ai],
                human_side=[s.label for s in provenance_human],
                interpretation=(
                    "This usually means a real capture was edited with generative tools, or "
                    "a generated image passed through software that wrote camera-style "
                    "metadata. It can also mean one record was altered. The file has more "
                    "than one origin story attached to it."
                ),
            )
        )

    metadata_ai = [
        s for s in weighty
        if s.family is SignalFamily.METADATA and s.direction is SignalDirection.AI
    ]
    text_human = [
        s for s in weighty
        if s.family is SignalFamily.STYLOMETRY and s.direction is SignalDirection.HUMAN
    ]
    if metadata_ai and text_human:
        found.append(
            Contradiction(
                summary="Metadata names an AI tool, but the writing reads as human.",
                ai_side=[s.label for s in metadata_ai],
                human_side=[s.label for s in text_human],
                interpretation=(
                    "Consistent with a person substantially rewriting a generated draft, or "
                    "with a platform that stamps its own generator string regardless of who "
                    "wrote the words."
                ),
            )
        )

    return found


# ── Coverage ──────────────────────────────────────────────────────────────────


def build_coverage(analysed: list[str], unavailable: list[str], score: float) -> CoverageReport:
    """What the run examined, and what it did not.

    Feeds the confidence stage directly — this is the mechanism that stops a
    transcript-only check producing the same confidence as a full one.
    """
    if score >= 0.85:
        grade = CoverageGrade.COMPREHENSIVE
    elif score >= 0.6:
        grade = CoverageGrade.GOOD
    elif score >= 0.3:
        grade = CoverageGrade.PARTIAL
    else:
        grade = CoverageGrade.MINIMAL

    if not analysed:
        statement = "Nothing could be analysed on this content."
    else:
        statement = f"Analysis based on {_prose(analysed)}."
        if unavailable:
            statement += f" Not examined: {_prose(unavailable)}."

    return CoverageReport(
        grade=grade,
        score=max(0.0, min(1.0, score)),
        analysed=analysed,
        unavailable=unavailable,
        statement=statement,
    )


def _prose(items: list[str]) -> str:
    lowered = [item.lower() for item in items]
    if len(lowered) == 1:
        return lowered[0]
    return f"{', '.join(lowered[:-1])} and {lowered[-1]}"


# ── Classification ────────────────────────────────────────────────────────────


def _mass(signals: list[Signal], direction: SignalDirection) -> float:
    return sum(s.weight for s in signals if s.direction is direction)


def has_hard_evidence(signals: list[Signal]) -> bool:
    """Evidence of *record* rather than of *style* — checkable by anyone with the
    same bytes. Only these unlock HIGH confidence."""
    return any(
        s.reliability is SignalReliability.HIGH
        and s.direction is not SignalDirection.NEUTRAL
        and s.family in (SignalFamily.PROVENANCE, SignalFamily.METADATA)
        for s in signals
    )


def _cap(current: Confidence, ceiling: Confidence) -> Confidence:
    order = [Confidence.LOW, Confidence.MODERATE, Confidence.HIGH]
    return current if order.index(current) <= order.index(ceiling) else ceiling


class Fused:
    """Result of fusion. A plain carrier so the API layer stays declarative."""

    __slots__ = ("classification", "confidence", "headline", "summary", "notes")

    def __init__(
        self,
        classification: Classification,
        confidence: Confidence,
        headline: str,
        summary: str,
        notes: list[str],
    ) -> None:
        self.classification = classification
        self.confidence = confidence
        self.headline = headline
        self.summary = summary
        self.notes = notes


def fuse(
    signals: list[Signal],
    *,
    coverage: CoverageReport,
    contradictions: list[Contradiction],
    independent_groups: int,
    insufficient_sample: bool = False,
    transformation_suspected: bool = False,
) -> Fused:
    ai = _mass(signals, SignalDirection.AI)
    human = _mass(signals, SignalDirection.HUMAN)
    mixed = _mass(signals, SignalDirection.MIXED)
    total = ai + human + mixed

    # ── classification ────────────────────────────────────────────────────────
    if insufficient_sample or total < MIN_MASS_FOR_VERDICT:
        classification = Classification.INCONCLUSIVE
    elif mixed >= MIXED_SIDE_THRESHOLD:
        classification = Classification.AI_ASSISTED
    elif contradictions and ai > 0 and human > 0:
        classification = Classification.AI_ASSISTED
    elif ai >= MIXED_SIDE_THRESHOLD and human >= MIXED_SIDE_THRESHOLD:
        classification = Classification.AI_ASSISTED
    elif ai - human >= DECISIVE_MARGIN + AI_ASYMMETRY:
        classification = Classification.AI_GENERATED
    elif human - ai >= DECISIVE_MARGIN:
        classification = Classification.HUMAN_GENERATED
    elif total >= MIN_MASS_FOR_MODERATE:
        classification = Classification.AI_ASSISTED
    else:
        classification = Classification.INCONCLUSIVE

    # ── confidence ────────────────────────────────────────────────────────────
    notes: list[str] = []

    if classification is Classification.INCONCLUSIVE:
        confidence = Confidence.LOW
    else:
        margin = 0.0 if total == 0 else abs(ai - human) / total
        hard = has_hard_evidence(signals)

        if hard and total >= MIN_MASS_FOR_HIGH:
            confidence = Confidence.HIGH
        elif (
            total >= MIN_MASS_FOR_MODERATE
            and independent_groups >= 2
            and (margin >= 0.25 or classification is Classification.AI_ASSISTED)
        ):
            confidence = Confidence.MODERATE
        else:
            confidence = Confidence.LOW

        if not hard:
            confidence = _cap(confidence, Confidence.MODERATE)

            # Coverage caps apply to INFERENCE, not to evidence of record. A
            # file's own declaration does not become less true because we could
            # not also analyse its pixels — coverage is the right brake on a
            # statistical reading and the wrong one on a manifest.
            if coverage.score < COVERAGE_FLOOR_FOR_HIGH:
                confidence = _cap(confidence, Confidence.MODERATE)
            if coverage.score < COVERAGE_FLOOR_FOR_MODERATE:
                confidence = _cap(confidence, Confidence.LOW)
                notes.append(
                    "Only a small part of this content could be examined, so confidence is "
                    "limited regardless of how clear the available signals look."
                )
        if transformation_suspected:
            confidence = _cap(confidence, Confidence.MODERATE)
            notes.append(
                "Confidence reduced: the content shows signs of translation or heavy "
                "paraphrasing, which substantially alters the signals detection relies on."
            )
        if contradictions:
            confidence = _cap(confidence, Confidence.MODERATE)
            notes.append(
                "Confidence reduced: parts of the evidence disagree with each other, which "
                "is reported rather than averaged away."
            )

    return Fused(
        classification=classification,
        confidence=confidence,
        headline=HEADLINE[classification],
        summary=_summary(classification, signals, insufficient_sample),
        notes=notes,
    )


def _summary(
    classification: Classification, signals: list[Signal], insufficient_sample: bool
) -> str:
    if insufficient_sample:
        return (
            "There is too little content here to analyse reliably. Short samples do not "
            "carry enough signal to distinguish human writing from generated text."
        )

    counted = [s for s in signals if s.direction is not SignalDirection.NEUTRAL]
    ai = [s for s in counted if s.direction is SignalDirection.AI]
    human = [s for s in counted if s.direction is SignalDirection.HUMAN]
    parts = [DESCRIPTION[classification]]

    if classification is Classification.INCONCLUSIVE:
        parts.append(
            "Nothing in the content, its metadata or its provenance pointed clearly in "
            "either direction."
            if not counted
            else f"The {len(counted)} signal{'' if len(counted) == 1 else 's'} found do not "
            "form a clear enough pattern to support a conclusion."
        )
    elif classification is Classification.AI_ASSISTED:
        parts.append(
            f"Signals point both ways: {len(ai)} toward generated content and {len(human)} "
            "toward human authorship or editing."
        )
    else:
        leading = ai if classification is Classification.AI_GENERATED else human
        opposing = human if classification is Classification.AI_GENERATED else ai
        against = f", against {len(opposing)} pointing the other way" if opposing else ""
        parts.append(
            f"{len(leading)} signal{'' if len(leading) == 1 else 's'} support this reading{against}."
        )

    if classification is not Classification.INCONCLUSIVE and not has_hard_evidence(signals):
        parts.append(
            "No verifiable provenance record was found, so this rests on statistical "
            "patterns rather than on proof."
        )

    return " ".join(parts)


# ── Presentation ──────────────────────────────────────────────────────────────

_CATEGORY_RANK: Final[dict[SignalFamily, int]] = {
    SignalFamily.PROVENANCE: 0,
    SignalFamily.METADATA: 1,
    SignalFamily.DETECTOR: 2,
    SignalFamily.MEDIA: 3,
    SignalFamily.AUDIO: 3,
    SignalFamily.VIDEO: 3,
    SignalFamily.DOCUMENT: 4,
    SignalFamily.EDITING: 5,
    SignalFamily.STRUCTURE: 6,
    SignalFamily.STYLOMETRY: 7,
}

_RELIABILITY_RANK: Final[dict[SignalReliability, int]] = {
    SignalReliability.HIGH: 0,
    SignalReliability.MEDIUM: 1,
    SignalReliability.LOW: 2,
}


def rank(signals: list[Signal]) -> list[Signal]:
    """Most reliable, most decisive evidence first."""
    return sorted(
        signals,
        key=lambda s: (
            s.direction is SignalDirection.NEUTRAL,
            _RELIABILITY_RANK[s.reliability],
            _CATEGORY_RANK.get(s.family, 9),
            -s.weight,
        ),
    )


def dedupe(signals: list[Signal]) -> list[Signal]:
    """Keep the strongest instance of each signal id."""
    best: dict[str, Signal] = {}
    for signal in signals:
        existing = best.get(signal.id)
        if existing is None or signal.weight > existing.weight:
            best[signal.id] = signal
    return list(best.values())


def label_for(classification: Classification) -> str:
    return HEADLINE[classification]
