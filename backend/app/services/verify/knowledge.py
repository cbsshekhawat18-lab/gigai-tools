"""GigAI Verify — knowledge base and evidence-keyed retrieval.

WHAT THIS IS FOR
----------------
Detectors produce findings. Findings need *interpretation*: "an ELA anomaly was
found" is only useful next to "ELA anomalies are produced by recompression far
more often than by manipulation, and ELA has no established accuracy for
detecting AI generation." That second sentence is what this module supplies.

THE RULE THAT MAKES THIS SAFE (§33)
-----------------------------------
    RAG CAN EXPLAIN EVIDENCE. RAG CANNOT CREATE EVIDENCE.

Retrieval is keyed on signals that were **actually produced by detectors**.
There is no path by which a knowledge document introduces a finding: documents
are selected *by* the evidence, never the other way round. If no detector found
a C2PA manifest, the C2PA documents are never retrieved, and nothing downstream
can mention one.

The interpreter prompt receives these documents as *reference material about
what the evidence means*, explicitly separated from the evidence itself.

SOURCE HIERARCHY (§30)
----------------------
Every document declares its tier. Tier 1 is an official standard, tier 2 primary
research, tier 3 trusted technical documentation, tier 4 reviewed secondary
material. Nothing is admitted from open web scraping — the corpus is small,
hand-curated and versioned, which is the correct trade for a domain where a
wrong "fact" about detection accuracy directly misleads a user.

The corpus is deliberately conservative: most entries exist to explain why a
signal means LESS than it appears to.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Final, Literal

#: Bump when documents change. Travels in the analysis record so a stored result
#: can be traced to the knowledge that produced its explanation (§61).
KNOWLEDGE_VERSION: Final[str] = "1.0.0"

SourceTier = Literal["official", "research", "technical", "secondary"]

ReviewStatus = Literal["approved", "provisional", "deprecated"]


@dataclass(frozen=True, slots=True)
class KnowledgeDocument:
    """One curated fact about what a class of evidence does and does not mean.

    VERSIONING IS NOT BOOKKEEPING HERE (§13). The AI-generation ecosystem moves
    fast enough that a statement true in 2024 can be actively misleading in 2026
    — "no major platform supports Content Credentials" was correct and is now
    wrong. So a document is never silently rewritten: it is superseded, and the
    old one is marked ``deprecated`` with a pointer to what replaced it.

    That matters for reproducibility as much as for accuracy. A stored result
    carries ``knowledge_version``, and explaining why that result said what it
    said requires the documents as they were at the time, not as they are now.
    """

    id: str
    title: str
    topic: str
    source: str
    source_tier: SourceTier
    reliability: Literal["high", "medium", "low"]
    content: str
    #: Signal ids, or id prefixes, this document explains. Retrieval matches here.
    applies_to: tuple[str, ...]
    #: What this document itself does not settle.
    limitations: tuple[str, ...] = field(default=())

    # ── provenance of the knowledge itself (§12, §13) ────────────────────────
    #: Bumped whenever `content` changes materially.
    version: str = "1.0.0"
    #: When this document's claims were last checked against the source.
    reviewed_at: str = "2026-08-12"
    #: `deprecated` documents are excluded from retrieval but never deleted.
    review_status: ReviewStatus = "approved"
    #: Set on a deprecated document to name the entry that replaced it.
    superseded_by: str | None = None


# ── The corpus ────────────────────────────────────────────────────────────────

KNOWLEDGE: Final[tuple[KnowledgeDocument, ...]] = (
    # ── provenance ────────────────────────────────────────────────────────────
    KnowledgeDocument(
        id="c2pa-manifest-meaning",
        title="What a C2PA manifest establishes",
        topic="provenance",
        source="C2PA Technical Specification",
        source_tier="official",
        reliability="high",
        content=(
            "A C2PA manifest is a signed set of assertions attached to a file by the "
            "software that produced or edited it. When the signature validates against a "
            "trusted certificate, the assertions are strong evidence about the file's "
            "history. The `digitalSourceType` assertion using the IPTC vocabulary is the "
            "field that declares origin: `trainedAlgorithmicMedia` means the creator "
            "declared the content AI-generated, `compositeWithTrainedAlgorithmicMedia` "
            "means partly so, and `digitalCapture` means a camera. Crucially, a manifest "
            "records what the producing software CLAIMS. It is not an independent "
            "forensic determination."
        ),
        applies_to=("provenance.c2pa-ai", "provenance.c2pa-camera", "provenance.c2pa-present"),
        limitations=(
            "An unverified signature proves nothing; the manifest could be forged or copied.",
            "Absence of a manifest is not evidence of anything — adoption is still low.",
            "A manifest can mark an image AI-involved when only a trivial generative edit was applied.",
        ),
    ),
    KnowledgeDocument(
        id="c2pa-verification-gap",
        title="Detection versus validation of Content Credentials",
        topic="provenance",
        source="C2PA Trust Model specification",
        source_tier="official",
        reliability="high",
        content=(
            "Detecting the presence of a manifest and validating it are different "
            "operations. Validation requires checking the signature against a certificate "
            "chain and testing that chain against the C2PA trust list, plus verifying that "
            "the asset's hash matches the assertions. A tool that only parses the manifest "
            "structure can report what it says but cannot establish that the claims are "
            "genuine or that the file has not been altered since signing."
        ),
        applies_to=("provenance.c2pa",),
    ),
    KnowledgeDocument(
        id="exif-absence",
        title="Why missing metadata is not evidence of AI generation",
        topic="metadata",
        source="Platform image-processing documentation (Meta, X, Google)",
        source_tier="technical",
        reliability="high",
        content=(
            "Essentially every major social platform, messaging app and CDN strips EXIF and "
            "XMP metadata from uploaded images, for privacy and payload-size reasons. "
            "Screenshots carry no camera metadata by definition. Re-encoding, resizing and "
            "format conversion routinely discard it. As a result the large majority of "
            "images encountered on the web have no metadata regardless of origin, and its "
            "absence carries almost no information about whether content was AI-generated."
        ),
        applies_to=("image.no-metadata", "metadata.no-provenance"),
    ),
    KnowledgeDocument(
        id="exif-forgeability",
        title="EXIF fields are trivially editable",
        topic="metadata",
        source="EXIF 2.32 specification; exiftool documentation",
        source_tier="official",
        reliability="high",
        content=(
            "EXIF is an unsigned metadata block. Any field — camera make, model, lens, "
            "capture timestamp, GPS — can be written or rewritten with freely available "
            "tools. Camera metadata on a file is therefore consistent with a genuine "
            "capture but does not establish one. It is meaningful as corroboration, not "
            "as proof, and it is weaker than a signed provenance record."
        ),
        applies_to=("provenance.camera-exif", "image.editor-software"),
    ),
    KnowledgeDocument(
        id="generator-fields",
        title="Generation parameters embedded by image tools",
        topic="provenance",
        source="Stable Diffusion / ComfyUI / A1111 output format documentation",
        source_tier="technical",
        reliability="high",
        content=(
            "Several image-generation front-ends write their prompt and sampling settings "
            "into the output file: Automatic1111 and ComfyUI use PNG `tEXt`/`iTXt` chunks "
            "with keys such as `parameters`, `prompt` and `workflow`. The presence of a "
            "populated field of this kind is strong evidence that the file was produced by "
            "that pipeline, because ordinary photo and design software has no reason to "
            "write it. It survives only if the file has not been re-encoded."
        ),
        applies_to=("image.ai-tool-metadata",),
        limitations=(
            "The tool may have been used to upscale or edit an existing photograph.",
            "These fields can be copied onto an unrelated file.",
        ),
    ),
    # ── text detection ────────────────────────────────────────────────────────
    KnowledgeDocument(
        id="text-detector-false-positives",
        title="False positives in AI text detection",
        topic="text-detection",
        source=(
            "Liang et al., 'GPT detectors are biased against non-native English writers', "
            "Patterns (2023); OpenAI AI Text Classifier withdrawal notice (2023)"
        ),
        source_tier="research",
        reliability="high",
        content=(
            "Statistical AI-text detection has a well-documented false-positive problem. "
            "Detectors systematically misclassify writing by non-native English speakers as "
            "machine-generated, because both exhibit lower lexical diversity and more "
            "predictable syntax. OpenAI withdrew its own classifier in 2023 citing low "
            "accuracy. Formal registers — academic, legal, technical, corporate — trip the "
            "same measures. Consequently a stylometric signal should never on its own "
            "support a confident claim about a specific author, and any result used to "
            "make an accusation is being misused."
        ),
        applies_to=("text.", "llm.", "code."),
    ),
    KnowledgeDocument(
        id="burstiness-limits",
        title="What sentence-length variance does and does not indicate",
        topic="text-detection",
        source="Perplexity/burstiness literature on machine-generated text detection",
        source_tier="research",
        reliability="medium",
        content=(
            "Sampled language-model output tends toward lower variance in sentence length "
            "and lower perplexity than unedited human writing, which is the basis of the "
            "'burstiness' family of measures. The effect is real in aggregate but weak per "
            "document, and it is erased by ordinary editing: copy edited to a readability "
            "target shows the same low variance. It is also reversible — a model asked to "
            "vary its sentence length will do so. Treat it as a soft population-level "
            "indicator, not a per-document test."
        ),
        applies_to=("text.uniform-sentences", "text.varied-sentences", "text.uniform-paragraphs"),
    ),
    KnowledgeDocument(
        id="paraphrase-evasion",
        title="Paraphrasing and translation defeat text detection",
        topic="text-detection",
        source="Sadasivan et al., 'Can AI-Generated Text be Reliably Detected?' (2023)",
        source_tier="research",
        reliability="high",
        content=(
            "Passing generated text through a paraphrasing model substantially degrades "
            "every known detection approach, including watermarking, because the surface "
            "statistics detectors rely on are exactly what paraphrasing rewrites. "
            "Translation has a similar effect in both directions: it makes generated text "
            "look human and human text look generated. When transformation is suspected, "
            "detection confidence should be reduced rather than the result reported at "
            "face value."
        ),
        applies_to=("text.", "llm."),
    ),
    KnowledgeDocument(
        id="short-text-limits",
        title="Minimum viable sample for text analysis",
        topic="text-detection",
        source="Detection benchmark methodology literature",
        source_tier="research",
        reliability="high",
        content=(
            "Statistical measures over text — vocabulary diversity, sentence-length "
            "variance, token predictability — have variance that scales inversely with "
            "sample size. Below roughly a few hundred words, the measurements are dominated "
            "by sampling noise and a document can appear extreme in either direction by "
            "chance. Reporting a classification for a very short passage is not supportable "
            "regardless of how clear the numbers look."
        ),
        applies_to=("text.", "code."),
    ),
    KnowledgeDocument(
        id="ai-self-disclosure",
        title="Assistant scaffolding left in published text",
        topic="text-detection",
        source="Observed publishing failures; assistant output conventions",
        source_tier="technical",
        reliability="high",
        content=(
            "Phrases such as 'As an AI language model', 'Here is a draft', 'I hope this "
            "helps' and 'Regenerate response' are produced by chat assistants and have no "
            "reason to appear in edited prose. When they survive into published content, "
            "they are close to direct evidence that generated text was pasted in without "
            "review. This is qualitatively different from stylometry: it is an artefact, "
            "not a statistical tendency."
        ),
        applies_to=("text.ai-disclosure",),
        limitations=(
            "The text may be quoting or discussing an assistant rather than being written by one.",
        ),
    ),
    # ── image forensics ───────────────────────────────────────────────────────
    KnowledgeDocument(
        id="ela-limits",
        title="Error Level Analysis is not an AI detector",
        topic="image-forensics",
        source="Image forensics literature; ELA methodology critiques",
        source_tier="research",
        reliability="high",
        content=(
            "Error Level Analysis visualises differences in JPEG compression error across "
            "an image. It was designed to highlight regions saved a different number of "
            "times, and it responds to recompression, resizing, screenshotting and platform "
            "re-encoding at least as strongly as to manipulation. It has no established "
            "relationship to AI generation. ELA output is at best a prompt to look more "
            "closely at a region; it cannot support a claim about origin."
        ),
        applies_to=("image.ela", "image.compression"),
    ),
    KnowledgeDocument(
        id="visual-detector-generalisation",
        title="Why AI-image classifiers degrade outside their training distribution",
        topic="image-forensics",
        source="Synthetic-image detection benchmark literature",
        source_tier="research",
        reliability="high",
        content=(
            "Classifiers trained to spot synthetic images perform well on generators "
            "represented in their training data and markedly worse on newer or unseen ones. "
            "Accuracy also drops sharply after ordinary post-processing — compression, "
            "resizing, screenshotting, social-platform re-encoding — because these remove "
            "the low-level artefacts the classifier keys on. A reported accuracy figure "
            "from a benchmark should not be assumed to transfer to an arbitrary image "
            "found on the web."
        ),
        applies_to=("model.visual", "image."),
    ),
    # ── documents ─────────────────────────────────────────────────────────────
    KnowledgeDocument(
        id="ooxml-revision-metadata",
        title="Revision counters in Office documents",
        topic="document-forensics",
        source="ECMA-376 Office Open XML specification",
        source_tier="official",
        reliability="medium",
        content=(
            "OOXML files store `cp:revision` (a save counter) and `TotalTime` (accumulated "
            "editing minutes) in their document properties. A document authored over time "
            "accumulates both. A revision count of 1 with zero editing time indicates the "
            "file was written and saved in a single operation, which is what conversion, "
            "export and programmatic generation all produce. It is a structural observation "
            "about how the file was written, not about who composed the words."
        ),
        applies_to=("document.no-revision-history", "document.revision-history"),
        limitations=(
            "Format conversion resets both counters regardless of the content's origin.",
            "Some editors never populate these fields.",
        ),
    ),
    KnowledgeDocument(
        id="generator-metadata-meaning",
        title="What a generator or producer field identifies",
        topic="metadata",
        source="Dublin Core; PDF 1.7 specification; HTML meta conventions",
        source_tier="official",
        reliability="medium",
        content=(
            "A `generator` meta tag, a PDF `Producer` entry and an OOXML `Application` "
            "property all identify the software that WROTE THE FILE. They say nothing about "
            "who or what composed the content. A CMS string identifies the publishing "
            "platform. Where the named tool is one whose only function is to generate "
            "content, the field becomes meaningful evidence about origin — but even then it "
            "may reflect a formatting or export step rather than authorship."
        ),
        applies_to=(
            "metadata.ai-generator",
            "metadata.cms-generator",
            "pdf.ai-producer",
            "pdf.producer",
            "document.ai-application",
        ),
    ),
    # ── audio and video ───────────────────────────────────────────────────────
    KnowledgeDocument(
        id="synthetic-speech-detection",
        title="Detecting synthetic speech requires signal analysis",
        topic="audio-forensics",
        source="Speech anti-spoofing (ASVspoof) benchmark literature",
        source_tier="research",
        reliability="high",
        content=(
            "Synthetic and cloned speech is identified from acoustic properties — phase "
            "coherence, spectral artefacts, prosodic regularity — which requires analysing "
            "the waveform with a trained model. Container metadata can name a text-to-speech "
            "tool, which is strong evidence when present, but its absence tells you nothing. "
            "Detection performance also degrades sharply on compressed or telephone-band "
            "audio, and generalises poorly to synthesis systems not represented in training."
        ),
        applies_to=("audio.", "model.speech"),
    ),
    KnowledgeDocument(
        id="transcript-is-not-video",
        title="Transcript analysis does not cover a video",
        topic="video-forensics",
        source="GigAI Verify methodology",
        source_tier="technical",
        reliability="high",
        content=(
            "Analysing a video's transcript examines the script, not the footage. A "
            "human-presented video can have an AI-written script; an AI-generated video can "
            "have a human-written one; and a synthetic presenter reading human words leaves "
            "no trace in the text at all. Transcript-derived findings should be reported as "
            "being about the script, and coverage should reflect that frames and audio were "
            "not examined."
        ),
        applies_to=("video.",),
    ),
    # ── code ──────────────────────────────────────────────────────────────────
    KnowledgeDocument(
        id="code-detection-limits",
        title="Why code authorship detection is especially unreliable",
        topic="code-detection",
        source="Code stylometry and authorship attribution literature",
        source_tier="research",
        reliability="high",
        content=(
            "Source code offers far less authorial signal than prose. Idiomatic solutions "
            "converge: for many tasks there is one obvious implementation that any competent "
            "author produces. Automatic formatters normalise whitespace, ordering and naming "
            "— exactly the features stylometry would use. Linters enforce the consistency "
            "and documentation patterns that make code 'look generated'. And human "
            "developers learned from the same public corpora the models trained on. Strong "
            "claims about code authorship are not supportable from style."
        ),
        applies_to=("code.",),
    ),
    # ── interpretation of the whole ───────────────────────────────────────────
    KnowledgeDocument(
        id="mixed-authorship-is-normal",
        title="AI-assisted content is the common case",
        topic="interpretation",
        source="GigAI Verify methodology",
        source_tier="technical",
        reliability="high",
        content=(
            "Most content that shows AI signals is not wholly machine-generated. A model "
            "draft edited by a person, and human writing polished by a model, are both "
            "ordinary working practices and both produce mixed signals. Evidence pointing "
            "in two directions is usually a correct reading of genuinely mixed authorship "
            "rather than a detector failure, and should be reported as such rather than "
            "resolved to whichever side weighs more."
        ),
        applies_to=("*",),
    ),
    KnowledgeDocument(
        id="correlated-detectors",
        title="Agreement between related detectors is not independent confirmation",
        topic="interpretation",
        source="Ensemble methods literature",
        source_tier="research",
        reliability="high",
        content=(
            "Detectors that share an underlying method or model family also share their "
            "failure modes. If three such detectors agree, that is one piece of evidence "
            "observed three times, not three pieces — and if the shared method is fooled by "
            "some transformation, all three are fooled together. Ensemble confidence must "
            "be computed over independent lines of evidence, not over detector count."
        ),
        applies_to=("*",),
    ),
)


# ── Retrieval ─────────────────────────────────────────────────────────────────


def _matches(document: KnowledgeDocument, signal_id: str) -> bool:
    """Does this document explain this signal?

    An entry in ``applies_to`` matches either exactly or as a prefix, so
    ``"text."`` covers every stylometric signal without listing them.
    """
    for key in document.applies_to:
        if key == "*":
            continue  # universal docs are added separately, see `retrieve`
        if signal_id == key or signal_id.startswith(key):
            return True
    return False


def retrieve(signal_ids: list[str], *, limit: int = 8) -> list[KnowledgeDocument]:
    """Select knowledge for the signals that were ACTUALLY found.

    This is the whole safety property (§33): retrieval is driven by the evidence,
    so a document can never introduce a finding. Passing an empty signal list
    returns only the universal interpretation documents — never anything about
    provenance, images or audio that no detector observed.
    """
    selected: list[KnowledgeDocument] = []
    seen: set[str] = set()

    # Deprecated documents are retained for auditing an older result but must
    # never inform a new one (§13).
    live = [doc for doc in KNOWLEDGE if doc.review_status != "deprecated"]

    for signal_id in signal_ids:
        for document in live:
            if document.id in seen:
                continue
            if _matches(document, signal_id):
                selected.append(document)
                seen.add(document.id)

    # Universal documents describe how to read a body of evidence as a whole and
    # are safe regardless of what was found — they assert nothing about content.
    if signal_ids:
        for document in live:
            if document.id not in seen and "*" in document.applies_to:
                selected.append(document)
                seen.add(document.id)

    # Highest-reliability, most authoritative sources first.
    tier_rank = {"official": 0, "research": 1, "technical": 2, "secondary": 3}
    reliability_rank = {"high": 0, "medium": 1, "low": 2}
    selected.sort(
        key=lambda doc: (reliability_rank[doc.reliability], tier_rank[doc.source_tier])
    )

    return selected[:limit]


def as_reference_block(documents: list[KnowledgeDocument]) -> str:
    """Render retrieved knowledge for the interpreter prompt.

    Framed explicitly as reference material about what evidence MEANS, kept
    separate from the evidence itself, so the model cannot mistake a background
    fact for something observed in this content.
    """
    if not documents:
        return ""

    parts = [
        "REFERENCE MATERIAL — background on what these KINDS of evidence mean.",
        "This is NOT evidence about the content you are describing. Nothing here",
        "was observed in this content. Use it only to explain or qualify the",
        "findings you were given.",
        "",
    ]

    for document in documents:
        parts.append(
            f"[{document.id} v{document.version}] {document.title} "
            f"({document.source_tier}: {document.source})"
        )
        parts.append(document.content)
        if document.limitations:
            parts.append("Caveats: " + " ".join(document.limitations))
        parts.append("")

    return "\n".join(parts)


def citations(documents: list[KnowledgeDocument]) -> list[dict[str, str]]:
    """Attributable citations for the advanced evidence view (§31).

    Returned from the documents that were actually retrieved, so a citation
    always resolves to a real entry in this corpus. Nothing here is generated,
    which is what makes fabricated citations impossible rather than discouraged.
    """
    # Python field names, not the wire aliases — these go into the pydantic
    # constructor, and `serialization_alias` applies on the way out only.
    return [
        {
            "id": doc.id,
            "title": doc.title,
            "source": doc.source,
            "tier": doc.source_tier,
            "version": doc.version,
            "reviewed_at": doc.reviewed_at,
        }
        for doc in documents
    ]


def corpus_report() -> list[dict[str, str]]:
    """Every document with its review state — the audit view for §13/§36."""
    return [
        {
            "id": doc.id,
            "topic": doc.topic,
            "version": doc.version,
            "tier": doc.source_tier,
            "reliability": doc.reliability,
            "status": doc.review_status,
            "reviewedAt": doc.reviewed_at,
            "supersededBy": doc.superseded_by or "",
        }
        for doc in KNOWLEDGE
    ]
