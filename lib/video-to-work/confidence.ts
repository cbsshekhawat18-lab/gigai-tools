/**
 * Stage 5 - computed confidence. Pure, no LLM, no network.
 *
 * Model self-reported confidence is not trustworthy on its own: it never saw
 * whether its quote actually matched the transcript, who said it, or whether
 * the request was repeated. Those verifiable facts adjust the score, and the
 * result decides which section of the UI the ticket lands in.
 */

import type { MatchQuality, SpeakerRole } from "./types";

export const NEEDS_REVIEW_BELOW = 0.7;

const MATCH_QUALITY_FACTOR: Record<MatchQuality, number> = {
  exact: 1.0,
  normalized: 0.97,
  snapped: 0.85,
};

const SPEAKER_FACTOR: Record<SpeakerRole, number> = {
  client: 1.0,
  unknown: 0.6,
  // Internal-speaker candidates are dropped before scoring; the factor exists
  // so the type is total and a future caller can't forget the case.
  internal: 0,
};

export interface ConfidenceInput {
  modelConfidence: number;
  /** The WORST match quality across the ticket's occurrences. */
  matchQuality: MatchQuality;
  speakerRole: SpeakerRole;
  occurrenceCount: number;
  /** Word count of the shortest occurrence quote. */
  shortestQuoteWords: number;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function computeConfidence(input: ConfidenceInput): {
  confidence: number;
  needsReview: boolean;
} {
  const repetitionBoost = input.occurrenceCount >= 2 ? 1.15 : 1.0;
  const lengthFactor = input.shortestQuoteWords < 8 ? 0.9 : 1.0;
  const confidence = clamp01(
    clamp01(input.modelConfidence) *
      MATCH_QUALITY_FACTOR[input.matchQuality] *
      SPEAKER_FACTOR[input.speakerRole] *
      repetitionBoost *
      lengthFactor,
  );
  return { confidence, needsReview: confidence < NEEDS_REVIEW_BELOW };
}
