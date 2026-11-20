"""Server-side text stylometry for GigAI Verify.

A deliberate port of the extension's local heuristics
(``GigAI Verify/src/analysis/text.ts``). Keeping the two in step matters: a user
who switches from local to GigAI analysis should see the same signals plus more,
not a different set that silently contradicts the first.

WHAT THIS IS: a transparent, explainable heuristic layer. Every signal traces to
something checkable — a measured ratio, a matched phrase, a repeated opener.

WHAT THIS IS NOT: a classifier, and there is no accuracy claim attached to it.
Prose style is weak evidence of authorship. Careful human editors and lightly
prompted models occupy the same stylistic region, and non-native English writers
trip several of these signals for reasons that have nothing to do with AI. That
is why the thresholds abstain rather than guess, and why only *hard* evidence
lifts confidence above moderate (see ``fusion.py``).
"""

from __future__ import annotations

import re
import statistics
from typing import Final

from app.schemas.verify import (
    EvidenceItem,
    EvidenceKind,
    Signal,
    SignalDirection,
    SignalFamily,
)

# ── Limits ────────────────────────────────────────────────────────────────────

#: Longest text analysed in one pass. Beyond this we sample (see ``sample``).
MAX_TEXT_CHARS: Final[int] = 200_000

#: Below this, style signals are noise and we say so instead of reporting them.
MIN_RELIABLE_CHARS: Final[int] = 400

_ABBREVIATIONS: Final[re.Pattern[str]] = re.compile(
    r"\b(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|etc|e\.g|i\.e|approx|fig|no|vol|op|cf|al)\.$",
    re.IGNORECASE,
)

# ── Lexicons ──────────────────────────────────────────────────────────────────

#: Over-represented in assistant-register prose. None of these is "an AI word" —
#: they are ordinary English and a single hit means nothing. The signal is
#: DENSITY, which is what the thresholds below measure.
AI_LEXICON: Final[tuple[str, ...]] = (
    "delve", "tapestry", "testament", "realm", "landscape", "pivotal",
    "underscore", "underscores", "multifaceted", "nuanced", "intricate",
    "meticulous", "meticulously", "seamless", "seamlessly", "robust",
    "leverage", "leveraging", "harness", "harnessing", "foster", "fostering",
    "elevate", "embark", "unlock", "unlocking", "crucial", "vital",
    "paramount", "myriad", "plethora", "holistic", "transformative",
    "groundbreaking", "cutting-edge", "game-changer", "ever-evolving",
    "fast-paced", "noteworthy", "commendable", "invaluable", "indispensable",
)

AI_CONNECTIVES: Final[tuple[str, ...]] = (
    "furthermore", "moreover", "additionally", "consequently", "notably",
    "importantly", "ultimately", "in conclusion", "in summary", "to summarize",
    "to sum up", "overall", "that said", "in essence", "first and foremost",
)

AI_PHRASES: Final[tuple[str, ...]] = (
    "it's important to note", "it is important to note", "it's worth noting",
    "it is worth noting", "in today's fast-paced", "in today's digital",
    "in the ever-evolving", "plays a crucial role", "plays a vital role",
    "a wide range of", "when it comes to", "navigate the complexities",
    "we will explore", "this article will", "in this article",
    "let us explore", "sheds light on", "paving the way",
)

#: Not stylometry — a confession. An assistant talking about itself, or chat
#: scaffolding that was never edited out. Treated as hard evidence in fusion.
AI_DISCLOSURE: Final[tuple[str, ...]] = (
    "as an ai language model", "as an ai model", "as a large language model",
    "i'm an ai", "i am an ai", "as of my last knowledge update",
    "i cannot browse the internet", "i don't have access to real-time",
    "i do not have access to real-time", "here's a draft", "here is a draft",
    "certainly! here", "sure! here", "i hope this helps", "feel free to ask",
    "regenerate response", "[insert ", "as requested, here",
)

HUMAN_MARKERS: Final[tuple[str, ...]] = (
    "i remember", "in my experience", "my friend", "my wife", "my husband",
    "my mum", "my mom", "my dad", "last week", "yesterday", "honestly",
    "frankly", "to be fair", "i reckon", "i guess", "turns out", "no idea why",
)


# ── Tokenisation ──────────────────────────────────────────────────────────────


def split_sentences(text: str) -> list[str]:
    """Split into sentences, tolerating abbreviations and decimals."""
    rough = re.split(r'(?<=[.!?…])["\'”’)\]]*\s+', text)
    sentences: list[str] = []
    buffer = ""

    for piece in rough:
        buffer = f"{buffer} {piece}" if buffer else piece
        trimmed = buffer.rstrip()
        if _ABBREVIATIONS.search(trimmed) or re.search(r"\b\d+\.$", trimmed):
            continue
        if trimmed:
            sentences.append(trimmed)
        buffer = ""

    if buffer.strip():
        sentences.append(buffer.strip())

    return [s for s in sentences if len(s.split()) >= 3]


def split_paragraphs(text: str) -> list[str]:
    return [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]


def words(text: str) -> list[str]:
    return re.findall(r"[a-z][a-z'’-]*", text.lower())


def sample(text: str, limit: int = MAX_TEXT_CHARS) -> tuple[str, bool]:
    """Keep a long document analysable without decapitating it.

    Naive truncation discards the conclusion, which is where several of the
    strongest signals live. We keep the opening, a middle slice and the ending.
    """
    if len(text) <= limit:
        return text, False

    head = int(limit * 0.45)
    middle = int(limit * 0.2)
    tail = limit - head - middle
    mid_start = len(text) // 2 - middle // 2

    return (
        "\n\n".join(
            [text[:head], text[mid_start : mid_start + middle], text[len(text) - tail :]]
        ),
        True,
    )


# ── Helpers ───────────────────────────────────────────────────────────────────


def _count(haystack: str, needles: tuple[str, ...]) -> tuple[list[str], int]:
    lowered = haystack.lower()
    hits: list[str] = []
    total = 0
    for needle in needles:
        pattern = (
            rf"\b{re.escape(needle)}" if needle[0].isalpha() else re.escape(needle)
        )
        found = re.findall(pattern, lowered)
        if found:
            hits.append(needle)
            total += len(found)
    return hits, total


def _excerpt(text: str, phrase: str, span: int = 90) -> str | None:
    index = text.lower().find(phrase.lower())
    if index < 0:
        return None
    start = max(0, index - span // 3)
    return f"…{text[start : start + span].strip()}…"


def _phrase_evidence(text: str, hits: list[str], limit: int = 3) -> list[EvidenceItem]:
    items: list[EvidenceItem] = []
    for phrase in hits[:limit]:
        excerpt = _excerpt(text, phrase)
        if excerpt:
            items.append(
                EvidenceItem(kind=EvidenceKind.EXCERPT, label=f"“{phrase}”", value=excerpt)
            )
    return items


def _rate(count: int, word_count: int) -> float:
    """Per-1000-word rate — the unit every density signal is expressed in."""
    return 0.0 if word_count == 0 else (count / word_count) * 1000


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def _value(label: str, value: str) -> EvidenceItem:
    return EvidenceItem(kind=EvidenceKind.VALUE, label=label, value=value)


# ── Individual signals ────────────────────────────────────────────────────────


def _ai_disclosure(text: str) -> Signal | None:
    hits, _ = _count(text, AI_DISCLOSURE)
    if not hits:
        return None
    return Signal(
        id="text.ai-disclosure",
        label="AI assistant text left in the content",
        detail=(
            "The content contains phrasing only an AI assistant produces — chat "
            "scaffolding or a self-reference that was never edited out."
        ),
        direction=SignalDirection.AI,
        weight=0.95,
        family=SignalFamily.STYLOMETRY,
        evidence=_phrase_evidence(text, hits, 3),
    )


def _sentence_uniformity(sentences: list[str]) -> Signal | None:
    """Burstiness. Human prose swings between short and long; sampling regresses
    toward the mean. Measured as coefficient of variation so it is independent
    of whether the author naturally writes long or short."""
    if len(sentences) < 8:
        return None

    lengths = [len(s.split()) for s in sentences]
    average = statistics.fmean(lengths)
    if average == 0:
        return None
    cv = statistics.pstdev(lengths) / average

    if cv < 0.34:
        return Signal(
            id="text.uniform-sentences",
            label="Unusually even sentence lengths",
            detail=(
                f"Sentence lengths barely vary (average {average:.0f} words). Human "
                "writing usually swings much more between short and long sentences."
            ),
            direction=SignalDirection.AI,
            weight=0.75 if cv < 0.24 else 0.5,
            family=SignalFamily.STYLOMETRY,
            evidence=[
                _value(
                    "Length variation",
                    f"{cv * 100:.0f}% of average (typical human prose: 45–85%)",
                )
            ],
        )

    if cv > 0.95:
        return Signal(
            id="text.varied-sentences",
            label="Strongly varied sentence rhythm",
            detail=(
                "Sentence lengths swing widely, which is more characteristic of "
                "unedited human writing than of generated prose."
            ),
            direction=SignalDirection.HUMAN,
            weight=0.45,
            family=SignalFamily.STYLOMETRY,
            evidence=[_value("Length variation", f"{cv * 100:.0f}% of average")],
        )

    return None


def _paragraph_uniformity(paragraphs: list[str]) -> Signal | None:
    body = [p for p in paragraphs if len(p.split()) > 12]
    if len(body) < 5:
        return None

    lengths = [len(p.split()) for p in body]
    average = statistics.fmean(lengths)
    if average == 0:
        return None
    cv = statistics.pstdev(lengths) / average
    if cv > 0.3:
        return None

    return Signal(
        id="text.uniform-paragraphs",
        label="Uniform paragraph blocks",
        detail=(
            f"Every paragraph runs to roughly the same length (~{average:.0f} words), "
            "a shape typical of generated or heavily templated drafts."
        ),
        direction=SignalDirection.AI,
        weight=0.45,
        family=SignalFamily.STRUCTURE,
        evidence=[_value("Paragraphs measured", f"{len(body)}, varying only {cv * 100:.0f}%")],
    )


def _ai_vocabulary(text: str, word_count: int) -> Signal | None:
    hits, total = _count(text, AI_LEXICON)
    if len(hits) < 3:
        return None
    rate = _rate(total, word_count)
    if rate < 2.5:
        return None

    return Signal(
        id="text.ai-vocabulary",
        label="AI-typical word choices",
        detail=(
            f"{len(hits)} distinct words heavily over-represented in AI-written prose "
            f"appear {total} times."
        ),
        direction=SignalDirection.AI,
        weight=_clamp01(0.25 + rate / 18),
        family=SignalFamily.STYLOMETRY,
        evidence=[_value("Words matched", ", ".join(hits[:10])), *_phrase_evidence(text, hits, 2)],
    )


def _ai_phrasing(text: str, word_count: int) -> Signal | None:
    hits, total = _count(text, AI_PHRASES)
    if len(hits) < 2:
        return None
    return Signal(
        id="text.ai-phrasing",
        label="Formulaic stock phrasing",
        detail=f"{len(hits)} set phrases that recur constantly in generated articles were found.",
        direction=SignalDirection.AI,
        weight=_clamp01(0.3 + _rate(total, word_count) / 10),
        family=SignalFamily.STYLOMETRY,
        evidence=_phrase_evidence(text, hits, 3),
    )


def _connectives(text: str, word_count: int) -> Signal | None:
    hits, total = _count(text, AI_CONNECTIVES)
    if total < 3:
        return None
    rate = _rate(total, word_count)
    if rate < 3:
        return None

    return Signal(
        id="text.connective-scaffolding",
        label="Heavy connective scaffolding",
        detail=(
            f"Linking words such as {', '.join(hits[:3])} appear {total} times — a rate "
            "more typical of generated structure than of edited prose."
        ),
        direction=SignalDirection.AI,
        weight=_clamp01(0.2 + rate / 22),
        family=SignalFamily.STYLOMETRY,
        evidence=[_value("Rate", f"{rate:.1f} per 1,000 words"), *_phrase_evidence(text, hits, 2)],
    )


def _contractions(text: str, word_count: int) -> Signal | None:
    """Register, not authorship — academic and legal writing score identically,
    which is why the weight stays modest and the detail says so."""
    if word_count < 250:
        return None

    found = re.findall(r"\b\w+['’](?:s|t|re|ve|ll|d|m)\b", text, re.IGNORECASE)
    rate = _rate(len(found), word_count)

    if rate < 1.2:
        return Signal(
            id="text.no-contractions",
            label="Consistently formal register",
            detail=(
                "Almost no contractions appear. Common in AI drafts — though also "
                "normal in academic, legal and corporate writing."
            ),
            direction=SignalDirection.AI,
            weight=0.3,
            family=SignalFamily.STYLOMETRY,
            evidence=[_value("Contractions", f"{len(found)} in {word_count:,} words")],
        )

    if rate > 12:
        return Signal(
            id="text.conversational-register",
            label="Conversational, contraction-heavy voice",
            detail=(
                "Frequent contractions and an informal register, more typical of a "
                "person writing in their own voice."
            ),
            direction=SignalDirection.HUMAN,
            weight=0.3,
            family=SignalFamily.STYLOMETRY,
            evidence=[_value("Contractions", f"{len(found)} in {word_count:,} words")],
        )

    return None


def _repeated_openers(sentences: list[str]) -> Signal | None:
    if len(sentences) < 10:
        return None

    openers: dict[str, int] = {}
    for sentence in sentences:
        parts = sentence.strip().split()
        if not parts:
            continue
        key = re.sub(r"[^a-z]", "", parts[0].lower())
        if len(key) < 3:
            continue
        openers[key] = openers.get(key, 0) + 1

    if not openers:
        return None

    opener, count = max(openers.items(), key=lambda item: item[1])
    share = count / len(sentences)
    if share < 0.18 or count < 4:
        return None

    return Signal(
        id="text.repeated-openers",
        label="Repetitive sentence openings",
        detail=(
            f"{count} of {len(sentences)} sentences open with “{opener}”, suggesting a "
            "repeated generation pattern."
        ),
        direction=SignalDirection.AI,
        weight=_clamp01(0.25 + share),
        family=SignalFamily.STRUCTURE,
        evidence=[_value("Most frequent opener", f"“{opener}” — {share * 100:.0f}% of sentences")],
    )


def _triads(text: str, word_count: int) -> Signal | None:
    if word_count < 300:
        return None
    found = re.findall(r"\b[\w-]+,\s+[\w-]+,?\s+and\s+[\w-]+\b", text, re.IGNORECASE)
    rate = _rate(len(found), word_count)
    if rate < 3 or len(found) < 4:
        return None

    return Signal(
        id="text.triads",
        label="Repeated “rule of three” constructions",
        detail=(
            f"{len(found)} balanced three-item lists were found — a cadence generated "
            "copy falls into far more often than human writing."
        ),
        direction=SignalDirection.AI,
        weight=_clamp01(0.2 + rate / 20),
        family=SignalFamily.STYLOMETRY,
        evidence=[
            EvidenceItem(kind=EvidenceKind.EXCERPT, label="Triad", value=match)
            for match in found[:3]
        ],
    )


def _specificity(text: str, word_count: int) -> Signal | None:
    if word_count < 300:
        return None

    numbers = re.findall(r"\b\d[\d,.]*\b", text)
    propers = re.findall(r"(?<![.!?]\s)\b[A-Z][a-z]{2,}\b", text)
    density = _rate(len(numbers) + len(propers), word_count)

    if density < 12:
        return Signal(
            id="text.low-specificity",
            label="Few concrete specifics",
            detail=(
                "The text carries very few numbers, names or dates for its length — "
                "generated overviews stay general where reporting stays specific."
            ),
            direction=SignalDirection.AI,
            weight=0.4,
            family=SignalFamily.STYLOMETRY,
            evidence=[
                _value(
                    "Specifics found",
                    f"{len(numbers)} figures, {len(propers)} proper nouns in {word_count:,} words",
                )
            ],
        )

    if density > 45:
        return Signal(
            id="text.high-specificity",
            label="Dense with verifiable specifics",
            detail="Frequent names, figures and dates — the texture of reported or first-hand writing.",
            direction=SignalDirection.HUMAN,
            weight=0.4,
            family=SignalFamily.STYLOMETRY,
            evidence=[
                _value("Specifics found", f"{len(numbers)} figures, {len(propers)} proper nouns")
            ],
        )

    return None


def _personal_voice(text: str, word_count: int) -> Signal | None:
    hits, _ = _count(text, HUMAN_MARKERS)
    first_person = len(re.findall(r"\b(?:i|my|me|we|our)\b", text, re.IGNORECASE))
    rate = _rate(first_person, word_count)

    # A lived-experience marker is REQUIRED — pronoun density alone is not
    # enough. Found by the extension's benchmark: generated articles use
    # editorial "we" constantly ("in this article we will explore"), and an
    # assistant writes "I" throughout its own scaffolding ("I hope this helps").
    # Both were scoring as human voice and pulling AI text toward a human
    # reading. A phrase implying a life outside the text is what separates a
    # person's voice from a machine's grammatical person.
    if not hits:
        return None
    if len(hits) < 2 and rate < 8:
        return None

    return Signal(
        id="text.personal-voice",
        label="Personal voice and lived detail",
        detail=(
            "First-person framing and conversational asides suggest a person writing "
            "from their own experience."
        ),
        direction=SignalDirection.HUMAN,
        weight=_clamp01(0.25 + len(hits) * 0.08 + rate / 60),
        family=SignalFamily.STYLOMETRY,
        evidence=[_value("First-person usage", f"{rate:.1f} per 1,000 words"), *_phrase_evidence(text, hits, 2)],
    )


def _human_roughness(text: str) -> Signal | None:
    """Note the asymmetry: roughness is evidence of a human hand, but its ABSENCE
    is not evidence of AI — editors and spellcheckers exist. There is deliberately
    no "too clean → AI" signal here."""
    doubled = re.findall(r"\b(\w+)\s+\1\b", text, re.IGNORECASE)
    emphatic = re.findall(r"[!?]{2,}|\.{4,}", text)
    double_spaces = re.findall(r"\S {2,}\S", text)

    total = len(doubled) + len(emphatic) + len(double_spaces)
    if total < 3:
        return None

    evidence: list[EvidenceItem] = []
    if doubled:
        evidence.append(
            EvidenceItem(kind=EvidenceKind.EXCERPT, label="Repeated word", value=", ".join(doubled[:2]))
        )
    if emphatic:
        evidence.append(
            EvidenceItem(
                kind=EvidenceKind.EXCERPT, label="Emphatic punctuation", value=" ".join(emphatic[:3])
            )
        )
    if double_spaces:
        evidence.append(_value("Irregular spacing", f"{len(double_spaces)} occurrences"))

    return Signal(
        id="text.human-roughness",
        label="Unpolished human editing marks",
        detail=(
            "Small irregularities — repeated words, uneven spacing, emphatic punctuation "
            "— that generated drafts rarely contain."
        ),
        direction=SignalDirection.HUMAN,
        weight=_clamp01(0.25 + total * 0.05),
        family=SignalFamily.STYLOMETRY,
        evidence=evidence,
    )


def _lexical_diversity(tokens: list[str]) -> Signal | None:
    """Type–token ratio over a fixed 400-word window, so the score is not a
    function of document length (raw TTR falls as documents grow, which would
    make every long article look repetitive)."""
    window = 400
    if len(tokens) < window:
        return None

    ratios = [
        len(set(tokens[start : start + window])) / window
        for start in range(0, len(tokens) - window + 1, window)
    ]
    if not ratios:
        return None

    ttr = statistics.fmean(ratios)
    if ttr >= 0.42:
        return None

    return Signal(
        id="text.low-diversity",
        label="Narrow vocabulary range",
        detail=(
            f"Only {ttr * 100:.0f}% of words in each 400-word stretch are distinct, "
            "indicating repeated phrasing across the piece."
        ),
        direction=SignalDirection.AI,
        weight=0.45 if ttr < 0.36 else 0.3,
        family=SignalFamily.STYLOMETRY,
        evidence=[_value("Distinct-word ratio", f"{ttr * 100:.0f}% (typical human prose: 45–60%)")],
    )


# ── Entry point ───────────────────────────────────────────────────────────────


def analyze(text: str) -> tuple[list[Signal], int, bool]:
    """Run every text signal.

    Returns ``(signals, word_count, was_sampled)``. Signals that do not fire are
    dropped, so the result lists only what was actually observed rather than a
    wall of "not detected" rows.
    """
    sampled_text, was_sampled = sample(text)
    sentences = split_sentences(sampled_text)
    paragraphs = split_paragraphs(sampled_text)
    tokens = words(sampled_text)
    word_count = len(tokens)

    disclosure = _ai_disclosure(sampled_text)

    candidates = [
        disclosure,
        _sentence_uniformity(sentences),
        _paragraph_uniformity(paragraphs),
        _ai_vocabulary(sampled_text, word_count),
        _ai_phrasing(sampled_text, word_count),
        _connectives(sampled_text, word_count),
        _contractions(sampled_text, word_count),
        _repeated_openers(sentences),
        _triads(sampled_text, word_count),
        _specificity(sampled_text, word_count),
        _personal_voice(sampled_text, word_count),
        _human_roughness(sampled_text),
        _lexical_diversity(tokens),
    ]

    signals = [signal for signal in candidates if signal is not None]

    # When an assistant has disclosed itself, its "I" is not a human voice.
    # Counting personal voice in the same document would let a confession argue
    # against itself.
    if disclosure is not None:
        signals = [s for s in signals if s.id != "text.personal-voice"]

    return signals, word_count, was_sampled
