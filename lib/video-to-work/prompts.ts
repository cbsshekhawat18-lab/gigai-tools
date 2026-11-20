/**
 * The extraction and dedupe prompts, verbatim from the spec
 * (specs/video-to-work-extraction.md §5 and §7). Do not "improve" the wording
 * here without updating the spec: the verbatim-quote guarantee is enforced in
 * code (verbatim.ts), but the prompt is what makes the model cooperate often
 * enough for the pipeline to be useful.
 */

import type { TranscriptSegment, ValidatedCandidate } from "./types";

export const EXTRACTION_SYSTEM_PROMPT = `You extract actionable work items from a transcript of a client giving feedback
on software.

You will receive numbered transcript segments with timestamps and speaker IDs.
Extract only requests, complaints, and questions made by the CLIENT speaker(s)
listed below. Ignore everything said by INTERNAL speakers.

CLIENT SPEAKERS: {{clientSpeakerIds}}
INTERNAL SPEAKERS: {{internalSpeakerIds}}

For each item, return an object with these fields:

  title          An imperative summary you write yourself. Under 70 characters.
                 "Fix invisible buy button on mobile" — not "Button issue".

  quote          THE CLIENT'S EXACT WORDS, COPIED CHARACTER FOR CHARACTER FROM
                 THE TRANSCRIPT. This is the most important field. Do not
                 rewrite, do not clean up grammar, do not remove filler words,
                 do not merge two separate sentences into one quote. Copy a
                 contiguous span of the transcript text. If you cannot find a
                 contiguous span that captures the request, do not emit the item
                 at all. A dropped item is fine; an invented quote is not.

  segmentIds     The IDs of the segments the quote spans.

  type           One of: bug, feature, design, question, out-of-scope.
                 bug         = something is broken or behaves wrongly
                 feature     = something new is being asked for
                 design      = visual or layout change to something that works
                 question    = the client wants information, not work
                 out-of-scope= a request that isn't software work at all

  priority       "high", "medium", "low", or null.
                 Use null unless the client explicitly signalled urgency. Do not
                 infer priority from how serious the issue sounds to you. If the
                 client did not say it was urgent, it is null.

  prioritySignal The exact words that justified the priority, or null.

  confidence     0 to 1. How confident you are that this is a real, distinct,
                 actionable request from the client.

Rules:

1. If the client mentions the same issue more than once, emit it each time it
   occurs. Do not merge them. A later step handles merging.
2. Do not emit an item for agreement, thanks, greetings, or small talk.
3. Do not emit an item for something the client explicitly withdrew or said was
   fine after all.
4. Do not invent work that the client implied but did not ask for.
5. When the client is vague ("this section feels off"), still emit it, with the
   vague quote and a low confidence. Do not sharpen it into something specific.

Return ONLY a JSON array. No prose, no markdown fences.`;

export function buildExtractionSystemPrompt(
  clientSpeakerIds: string[],
  internalSpeakerIds: string[],
): string {
  return EXTRACTION_SYSTEM_PROMPT.replace(
    "{{clientSpeakerIds}}",
    clientSpeakerIds.join(", ") || "(none tagged)",
  ).replace("{{internalSpeakerIds}}", internalSpeakerIds.join(", ") || "(none tagged)");
}

function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/**
 * User message: one line per segment, ID inline so the model can fill
 * `segmentIds`, exactly the spec's format:
 * `[00:04:12 - 00:04:19] (SPEAKER_01) seg_84: so the thing is …`
 */
export function buildExtractionUserMessage(segments: TranscriptSegment[]): string {
  return segments
    .map(
      (s) =>
        `[${clock(s.startSec)} - ${clock(s.endSec)}] (${s.speakerId}) ${s.id}: ${s.text.trim()}`,
    )
    .join("\n");
}

export const DEDUPE_SYSTEM_PROMPT = `You are given candidate work items extracted from one client feedback session.
The client often repeats themselves, and overlapping extraction windows produce
exact duplicates.

Group items that describe THE SAME underlying request. Two items about the same
UI element but different problems are NOT the same request. Two items with
different wording about the same problem ARE the same request.

Return ONLY a JSON array of arrays of IDs, e.g. [["c1","c7"],["c2"],["c3","c4","c9"]].
Every input ID must appear exactly once.`;

/** Dedupe input: only what the model needs, nothing it could overfit on. */
export function buildDedupeUserMessage(candidates: ValidatedCandidate[]): string {
  return JSON.stringify(
    candidates.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      quote: c.quote,
      startSec: c.startSec,
    })),
  );
}
