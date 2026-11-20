/**
 * GigAI GEO engine: the content citability scorer.
 *
 * Scores content on the factors the GEO study (Aggarwal et al., "GEO:
 * Generative Engine Optimization", KDD 2024 — the Princeton / Georgia Tech /
 * IIT Delhi paper) measured as increasing the chance of being cited by
 * generative engines: statistics, quotable statements, citations/sources,
 * plus the retrieval-era structural factors (answer-first openings, question
 * headings, self-contained sections).
 *
 * THE DIFFERENTIATOR: every sub-score carries its formula and the counted
 * evidence. Competing tools output "73/100" with no basis; this one shows the
 * arithmetic, the same promise as GigAI Verify, applied to content.
 *
 * Pure functions. No network, no DOM (callers pass a GeoDocument or raw text).
 */

import type { GeoDocument } from "./html";
import {
  countWords,
  factDensity,
  containmentIssues,
  isQuestionHeading,
  judgeOpening,
  quotability,
  splitSentences,
} from "./text";

export const GEO_STUDY_URL = "https://dl.acm.org/doi/10.1145/3637528.3671900";
export const GEO_STUDY_CITATION =
  "Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan, Deshpande. \"GEO: Generative Engine Optimization\", KDD 2024 (Princeton / Georgia Tech / IIT Delhi / Allen Institute).";

export interface SubScore {
  key: string;
  label: string;
  /** 0–100. */
  score: number;
  /** Relative weight in the overall score. */
  weight: number;
  /** The formula, stated plainly, e.g. "facts per 100 words ÷ 3 × 100, capped at 100". */
  formula: string;
  /** What was actually counted, e.g. "14 statistics in 700 words = 2.0 per 100". */
  counted: string;
  /** Example evidence strings (quoted from the content). */
  evidence: string[];
  /** What to change (only when below target). */
  advice: string;
  /** Where the factor comes from. */
  source: "geo-study" | "retrieval-structure";
}

export interface CitabilityReport {
  overall: number;
  words: number;
  subs: SubScore[];
  summary: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export interface CitabilityInput {
  /** The main prose to score. */
  text: string;
  /** Heading texts + per-section data when available (URL/HTML mode). */
  headings?: { text: string; level: number; firstParagraph: string; sectionText: string }[];
  /** Outbound (external) link count when available. */
  outboundLinks?: number;
  /** First paragraph of the page (falls back to the first sentences of `text`). */
  firstParagraph?: string;
}

/** Build the input from an analyzed document. */
export function citabilityInputFromDoc(doc: GeoDocument): CitabilityInput {
  return {
    text: doc.mainText,
    headings: doc.headings.map((h) => ({
      text: h.text,
      level: h.level,
      firstParagraph: h.firstParagraph,
      sectionText: h.sectionText,
    })),
    outboundLinks: doc.outboundLinks.length,
    firstParagraph: doc.headings[0]?.firstParagraph || splitSentences(doc.mainText).slice(0, 2).join(" "),
  };
}

/** Score the content. Every sub-score explains itself; see {@link SubScore}. */
export function scoreCitability(input: CitabilityInput): CitabilityReport {
  const words = countWords(input.text);
  const subs: SubScore[] = [];

  // ── 1. Fact density (GEO study: "statistics addition" lifted visibility) ──
  const facts = factDensity(input.text);
  subs.push({
    key: "fact-density",
    label: "Fact density",
    score: clamp((facts.per100Words / 2) * 100),
    weight: 2,
    formula: "statistics per 100 words ÷ 2 × 100, capped at 100 (target: ≥ 2 concrete numbers per 100 words)",
    counted: `${facts.count} statistics / numbers in ${facts.words} words = ${facts.per100Words.toFixed(2)} per 100 words`,
    evidence: facts.samples,
    advice:
      facts.per100Words >= 2
        ? ""
        : "Add concrete numbers: measurements, dates, percentages, versions, benchmark results. The GEO study found adding statistics one of the highest-lift edits (~30–40% visibility gain in their benchmark).",
    source: "geo-study",
  });

  // ── 2. Source citations (GEO study: "cite sources" lifted visibility) ─────
  const per500 = words ? ((input.outboundLinks ?? 0) / words) * 500 : 0;
  const linksKnown = input.outboundLinks !== undefined;
  subs.push({
    key: "source-citations",
    label: "Source citations",
    score: linksKnown ? clamp((per500 / 2) * 100) : 50,
    weight: 1.5,
    formula: "outbound reference links per 500 words ÷ 2 × 100, capped (target: ≥ 2 external sources per 500 words)",
    counted: linksKnown
      ? `${input.outboundLinks} outbound links in ${words} words = ${per500.toFixed(2)} per 500 words`
      : "Outbound links can't be counted in plain-text mode. Scored neutrally at 50. Paste HTML or fetch a URL to measure this.",
    evidence: [],
    advice:
      !linksKnown || per500 >= 2
        ? ""
        : "Link outward to specs, standards, research papers and primary data. The GEO study measured citing sources as a top-two visibility improvement. Models treat sourced content as more corroborable.",
    source: "geo-study",
  });

  // ── 3. Quotability (GEO study: "quotation addition" lifted visibility) ────
  const quote = quotability(input.text);
  subs.push({
    key: "quotability",
    label: "Quotability",
    score: clamp((quote.ratio / 0.4) * 100),
    weight: 1.5,
    formula: "self-contained liftable sentences ÷ total sentences ÷ 0.4 × 100 (target: ≥ 40% of sentences quotable)",
    counted: `${quote.quotable} of ${quote.total} sentences are complete, standalone claims of 8–40 words (${Math.round(quote.ratio * 100)}%)`,
    evidence: quote.bestExamples,
    advice:
      quote.ratio >= 0.4
        ? ""
        : "Write more sentences a model could lift verbatim: one complete claim per sentence, 8–40 words, no dangling pronouns, no mid-thought openers.",
    source: "geo-study",
  });

  // ── 4. Opening answer (retrieval: does the page answer in ≤40 words?) ─────
  const opening = judgeOpening(input.firstParagraph ?? splitSentences(input.text).slice(0, 2).join(" "));
  subs.push({
    key: "opening-answer",
    label: "Opening answer",
    score: opening.pass ? 100 : opening.directLength ? 60 : 20,
    weight: 1.5,
    formula:
      "pass = the opening answer (first sentence, or two when the first is under 8 words) is ≤ 40 words, has no throat-clearing opener and is self-contained → 100. Right length but flawed → 60. Buried answer → 20",
    counted: `Opening is ${opening.words} words${opening.fluffOpener ? ". Starts with a throat-clearing phrase" : ""}${opening.selfContained ? "" : ". Depends on missing context"}`,
    evidence: [opening.evidence],
    advice: opening.pass
      ? ""
      : "Open with the answer itself in under 40 words, then elaborate. Retrieval systems judge relevance primarily on opening content. A buried answer is an unretrieved answer.",
    source: "retrieval-structure",
  });

  // ── 5. Heading format (are H2s phrased as the questions people ask?) ──────
  const h2s = (input.headings ?? []).filter((h) => h.level === 2 || h.level === 3);
  const questions = h2s.filter((h) => isQuestionHeading(h.text));
  const headingsKnown = h2s.length > 0;
  subs.push({
    key: "heading-format",
    label: "Question headings",
    score: headingsKnown ? clamp((questions.length / h2s.length / 0.5) * 100) : 40,
    weight: 1,
    formula: "question-phrased H2/H3s ÷ total H2/H3s ÷ 0.5 × 100 (target: ≥ half of section headings match how people ask)",
    counted: headingsKnown
      ? `${questions.length} of ${h2s.length} H2/H3 headings are phrased as questions or how-tos`
      : "No H2/H3 headings found (plain text or unstructured page). Scored 40.",
    evidence: questions.slice(0, 3).map((h) => h.text),
    advice:
      headingsKnown && questions.length / h2s.length >= 0.5
        ? ""
        : "Phrase section headings the way people ask: \"How do I…\", \"What is…\", \"Why does…\". Retrieval matches queries against headings. Label-style headings match nothing.",
    source: "retrieval-structure",
  });

  // ── 6. Self-containment (sections that reference \"above\" fail alone) ────
  const sections = (input.headings ?? []).filter((h) => h.sectionText.trim().length > 0);
  const failingSections = sections.filter((h) => containmentIssues(h.sectionText).length > 0);
  const sectionsKnown = sections.length > 0;
  const containRatio = sectionsKnown ? 1 - failingSections.length / sections.length : null;
  subs.push({
    key: "self-containment",
    label: "Self-containment",
    score: containRatio === null ? clamp((1 - Math.min(1, containmentIssues(input.text).length / 3)) * 100) : clamp(containRatio * 100),
    weight: 1.5,
    formula: "sections free of back-references (\"as mentioned above\", pronoun openers) ÷ total sections × 100",
    counted: sectionsKnown
      ? `${sections.length - failingSections.length} of ${sections.length} sections stand alone`
      : `${containmentIssues(input.text).length} back-reference/anaphora issues found in the text`,
    evidence: failingSections.slice(0, 3).map((h) => `"${h.text}": ${containmentIssues(h.sectionText)[0]?.evidence ?? ""}`),
    advice:
      (containRatio ?? 1) >= 0.9
        ? ""
        : "Make each section readable alone: name the subject again instead of \"it\", and delete \"as mentioned above\", retrieved fragments have no above.",
    source: "retrieval-structure",
  });

  const totalWeight = subs.reduce((n, s) => n + s.weight, 0);
  const overall = clamp(subs.reduce((n, s) => n + s.score * s.weight, 0) / totalWeight);

  const summary =
    overall >= 85
      ? "Highly citable: dense with liftable, sourced, self-contained claims."
      : overall >= 65
        ? "Citable with gaps. The flagged factors below are leaving visibility on the table."
        : overall >= 40
          ? "Weakly citable: models can retrieve this page but have little they can safely quote from it."
          : "Hard to cite: low fact density and dependent prose give a generative engine almost nothing to lift.";

  return { overall, words, subs, summary };
}
