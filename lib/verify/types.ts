/**
 * GigAI Verify, the evidence model.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE: a signal is a piece of evidence, not a
 * verdict. Every signal carries how strong it is, how reliable its *kind* is,
 * and what else could innocently explain it. The classifier reads those fields;
 * it never reads a module's opinion directly. That separation is what stops one
 * over-confident detector deciding the answer, and it is why "no evidence found"
 * can never quietly become "evidence of absence".
 *
 * What we can honestly detect in a browser, and what we cannot:
 *
 *   CAN   provenance (C2PA), explicit generator fingerprints in metadata,
 *         camera evidence, editing-software evidence, structural and
 *         compression characteristics, document internals, text statistics.
 *   CANNOT look at a photo with no metadata and know whether a model made it.
 *
 * So `ai-generated` is only ever reached from provenance or a declared
 * generator. Pixels alone return `inconclusive`, which is the truthful answer.
 */

/** The four outcomes. Nothing is forced into human-or-AI. */
export type Classification =
  | "likely-human"
  | "likely-ai"
  | "likely-mixed"
  | "inconclusive";

/** Deliberately coarse. A percentage would imply calibration we do not have. */
export type Confidence = "low" | "moderate" | "high";

/** How much weight a signal's *category* can ever carry. */
export type Reliability = "strong" | "moderate" | "weak";

/** Which way a signal points. */
export type Direction = "human" | "ai" | "edited" | "neutral";

export type SignalCategory =
  | "provenance"
  | "metadata"
  | "structure"
  | "compression"
  | "content"
  | "document";

export interface Signal {
  id: string;
  category: SignalCategory;
  /** Short headline, e.g. "Camera information present". */
  title: string;
  /** What was actually observed, facts only, no interpretation. */
  finding: string;
  direction: Direction;
  reliability: Reliability;
  /** 0–1 internal weight. Never shown as a percentage to the user. */
  weight: number;
  /** The raw values behind the finding, for the technical view. */
  evidence?: Record<string, string | number | boolean>;
  /**
   * The innocent explanation. REQUIRED for anything not neutral, if a finding
   * has no alternative explanation worth stating, it is almost certainly being
   * over-claimed.
   */
  alternative?: string;
  /** Which module produced it. */
  module: string;
}

export interface ModuleRun {
  module: string;
  ok: boolean;
  /** Why it couldn't run, shown in the partial-analysis notice. */
  reason?: string;
}

export interface VerifyFileInfo {
  name: string;
  size: number;
  mime: string;
  label: string;
  kind: string;
  /** SHA-256, so a user can prove which file was analysed. */
  hash: string;
  width?: number;
  height?: number;
  pages?: number;
  duration?: number;
}

export interface TimelineEvent {
  label: string;
  detail?: string;
  /** ISO date when the evidence carried one. Never invented. */
  when?: string;
}

export interface VerificationResult {
  file: VerifyFileInfo;
  analysedAt: string;
  classification: Classification;
  confidence: Confidence;
  /** One-paragraph plain-English assessment. */
  summary: string;
  signals: Signal[];
  supporting: Signal[];
  conflicting: Signal[];
  neutral: Signal[];
  timeline: TimelineEvent[];
  /** "What we found" bullets. */
  found: { ok: boolean | null; text: string }[];
  /** "What we cannot know", adapts to the file type. */
  limitations: string[];
  modulesRun: ModuleRun[];
  /** Extra artefacts, e.g. an ELA data URL for images. */
  ela?: { originalUrl: string; elaUrl: string };
  /** Extracted text, when a text pipeline ran (never sent anywhere). */
  textStats?: TextStats;
}

export interface TextStats {
  words: number;
  sentences: number;
  /** Standard deviation of sentence length, "burstiness". */
  burstiness: number;
  meanSentenceLength: number;
  /** Unique words / total words. */
  lexicalDiversity: number;
  /** Most repeated 3-word phrase and its count. */
  topPhrase?: { phrase: string; count: number };
}

/* ── Display metadata ─────────────────────────────────────────────────────── */

export const CLASSIFICATION_META: Record<
  Classification,
  { label: string; dot: string; text: string; blurb: string }
> = {
  "likely-human": {
    label: "Likely Human",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    blurb: "The available evidence is more consistent with human-created content.",
  },
  "likely-ai": {
    label: "Likely AI-Generated",
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-400",
    blurb: "Multiple signals are consistent with synthetic or AI-generated content.",
  },
  "likely-mixed": {
    label: "Likely AI-Assisted / Mixed",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    blurb: "The evidence suggests AI involvement alongside human creation or editing.",
  },
  inconclusive: {
    label: "Inconclusive",
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    blurb: "There is not enough evidence, or the evidence conflicts, so no meaningful classification can be made.",
  },
};

export const RELIABILITY_LABEL: Record<Reliability, string> = {
  strong: "Strong evidence",
  moderate: "Moderate evidence",
  weak: "Weak evidence",
};

/** The disclaimer. Shown on every result and included in every export. */
export const VERIFY_DISCLAIMER =
  "GigAI Verify provides technical signals and file-analysis evidence. It does not determine authenticity, authorship, intent, or whether content is AI-generated with certainty. Results should not be used as the sole basis for legal, employment, financial, academic or other high-impact decisions.";
