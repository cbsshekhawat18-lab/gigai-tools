/**
 * Video → Work ticket extraction: the verbatim-quote contract.
 *
 * Spec: specs/video-to-work-extraction.md. The load-bearing rule: a ticket has
 * NO single `timestamp` or `quote` field - repetition is the norm in client
 * feedback, so everything goes through `occurrences[]`, and every occurrence's
 * quote is a code-verified span of the transcript (see verbatim.ts), never the
 * model's paraphrase.
 */

export type TicketType = "bug" | "feature" | "design" | "question" | "out-of-scope";
export type SpeakerRole = "client" | "internal" | "unknown";
export type MatchQuality = "exact" | "normalized" | "snapped";

export interface TranscriptSegment {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
  speakerId: string;
}

export interface Speaker {
  id: string;
  role: SpeakerRole;
  /** User-editable display name. */
  label: string;
  talkTimeSec: number;
  /** 3 representative lines, for the role-tagging UI. */
  sampleQuotes: string[];
}

export interface TicketOccurrence {
  startSec: number;
  endSec: number;
  /** MUST be a real span of the transcript (validated, raw transcript text). */
  quote: string;
  segmentIds: string[];
  matchQuality: MatchQuality;
  screenshotDataUrl?: string;
}

export interface Ticket {
  id: string;
  /** Ours, imperative, <= 70 chars. */
  title: string;
  type: TicketType;
  /** >= 1, sorted by startSec. */
  occurrences: TicketOccurrence[];
  speakerId: string;
  /** null unless the client signalled it in words. */
  priority: "high" | "medium" | "low" | null;
  /** The words that justified priority, or null. */
  prioritySignal: string | null;
  /** 0-1, COMPUTED (confidence.ts), not model-reported. */
  confidence: number;
  /** What the model claimed, kept for debugging. */
  modelConfidence: number;
  /** confidence < 0.7 */
  needsReview: boolean;
  dismissed: boolean;
}

export interface DroppedCandidate {
  title: string;
  claimedQuote: string;
  reason: "no-verbatim-match" | "internal-speaker" | "empty-quote" | "too-short";
}

export interface ExtractionResult {
  tickets: Ticket[];
  speakers: Speaker[];
  /** For the ?debug=1 panel. */
  droppedCandidates: DroppedCandidate[];
  stats: {
    candidatesExtracted: number;
    droppedForVerbatim: number;
    droppedForSpeaker: number;
    mergedByDedupe: number;
    finalCount: number;
  };
}

/** What the extraction model returns per item, before any validation. */
export interface RawCandidate {
  title: string;
  quote: string;
  segmentIds: string[];
  type: TicketType;
  priority: "high" | "medium" | "low" | null;
  prioritySignal: string | null;
  confidence: number;
}

/** A candidate that survived verbatim validation, pre-dedupe. */
export interface ValidatedCandidate {
  id: string;
  title: string;
  type: TicketType;
  quote: string;
  startSec: number;
  endSec: number;
  segmentIds: string[];
  matchQuality: MatchQuality;
  speakerId: string;
  priority: "high" | "medium" | "low" | null;
  prioritySignal: string | null;
  modelConfidence: number;
}

/** One LLM call: system prompt + user message in, raw text out. Temperature 0. */
export type ChatFn = (system: string, user: string) => Promise<string>;
