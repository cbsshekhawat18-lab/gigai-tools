/**
 * The pipeline orchestrator: stages 2-5 (stage 1, speaker tagging, is
 * interactive and happens in the UI before this runs).
 *
 *   extractCandidates()  [LLM, chunked]
 *   validateVerbatim()   [pure - the guarantee]
 *   mergeDuplicates()    [LLM grouping + code merge]
 *   computeConfidence()  [pure]
 *
 * Everything the pipeline dropped and why lands in droppedCandidates for the
 * ?debug=1 panel - tuning this without visibility is guesswork.
 */

import type {
  ChatFn,
  DroppedCandidate,
  ExtractionResult,
  Speaker,
  Ticket,
  TranscriptSegment,
  ValidatedCandidate,
} from "./types";
import { extractCandidates } from "./extract";
import { buildTranscriptIndex, validateVerbatim } from "./verbatim";
import { mergeDuplicates } from "./dedupe";
import { computeConfidence } from "./confidence";

export interface RunOptions {
  chat: ChatFn;
  onProgress?: (label: string, done: number, total: number) => void;
  signal?: AbortSignal;
}

export async function extractTickets(
  segments: TranscriptSegment[],
  speakers: Speaker[],
  options: RunOptions,
): Promise<ExtractionResult> {
  const roleBySpeaker = new Map(speakers.map((s) => [s.id, s.role]));
  const clientIds = speakers.filter((s) => s.role === "client").map((s) => s.id);
  const internalIds = speakers.filter((s) => s.role === "internal").map((s) => s.id);
  // Client-side extraction scope: with nobody tagged client (single unknown
  // speaker), every speaker is in scope and confidence.ts caps the scores.
  const scopeIds = clientIds.length > 0 ? clientIds : speakers.map((s) => s.id);

  const raw = await extractCandidates(segments, {
    chat: options.chat,
    clientSpeakerIds: scopeIds,
    internalSpeakerIds: internalIds,
    onProgress: (done, total) => options.onProgress?.("Reading the transcript", done, total),
    signal: options.signal,
  });

  // Stage 3 - verbatim validation, plus code-side speaker attribution check.
  const index = buildTranscriptIndex(segments);
  const segById = new Map(segments.map((s) => [s.id, s]));
  const dropped: DroppedCandidate[] = [];
  const validated: ValidatedCandidate[] = [];
  let droppedForSpeaker = 0;

  raw.forEach((cand, i) => {
    const match = validateVerbatim(cand.quote, index);
    if (!match.ok) {
      dropped.push({ title: cand.title, claimedQuote: cand.quote, reason: match.reason });
      return;
    }
    // The MATCHED span decides attribution - the model's claim is not trusted.
    const speakerIds = match.segmentIds
      .map((id) => segById.get(id)?.speakerId)
      .filter((s): s is string => Boolean(s));
    const speakerId = speakerIds[0] ?? speakers[0]?.id ?? "speaker-untagged";
    if (speakerIds.some((id) => roleBySpeaker.get(id) === "internal")) {
      droppedForSpeaker += 1;
      dropped.push({ title: cand.title, claimedQuote: cand.quote, reason: "internal-speaker" });
      return;
    }
    validated.push({
      id: `c${i + 1}`,
      title: cand.title,
      type: cand.type,
      quote: match.quote,
      startSec: match.startSec,
      endSec: match.endSec,
      segmentIds: match.segmentIds,
      matchQuality: match.matchQuality,
      speakerId,
      priority: cand.priority,
      prioritySignal: cand.prioritySignal,
      modelConfidence: cand.confidence,
    });
  });

  options.onProgress?.("Merging repeated requests", 0, 1);
  const { merged, mergedByDedupe } = await mergeDuplicates(validated, options.chat);
  options.onProgress?.("Merging repeated requests", 1, 1);

  const qualityRank = { exact: 0, normalized: 1, snapped: 2 } as const;
  const tickets: Ticket[] = merged.map((draft) => {
    const worst = draft.occurrences.reduce<keyof typeof qualityRank>(
      (acc, o) => (qualityRank[o.matchQuality] > qualityRank[acc] ? o.matchQuality : acc),
      "exact",
    );
    const shortest = Math.min(
      ...draft.occurrences.map((o) => o.quote.split(/\s+/).length),
    );
    const { confidence, needsReview } = computeConfidence({
      modelConfidence: draft.modelConfidence,
      matchQuality: worst,
      speakerRole: roleBySpeaker.get(draft.speakerId) ?? "unknown",
      occurrenceCount: draft.occurrences.length,
      shortestQuoteWords: Number.isFinite(shortest) ? shortest : 0,
    });
    return { ...draft, confidence, needsReview, dismissed: false };
  });

  tickets.sort((a, b) => (a.occurrences[0]?.startSec ?? 0) - (b.occurrences[0]?.startSec ?? 0));

  return {
    tickets,
    speakers,
    droppedCandidates: dropped,
    stats: {
      candidatesExtracted: raw.length,
      droppedForVerbatim: dropped.filter((d) => d.reason !== "internal-speaker").length,
      droppedForSpeaker,
      mergedByDedupe,
      finalCount: tickets.length,
    },
  };
}
