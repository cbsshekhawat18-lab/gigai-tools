/**
 * Stage 2 - candidate extraction. Chunks the transcript into overlapping
 * windows (long transcripts make models silently drop items from the middle),
 * runs the extraction prompt per window with a small concurrency cap, and
 * parses the JSON. Duplicates across window overlaps are EXPECTED - stage 4
 * merges them.
 */

import type { ChatFn, RawCandidate, TicketType, TranscriptSegment } from "./types";
import { buildExtractionSystemPrompt, buildExtractionUserMessage } from "./prompts";

const WINDOW_SEC = 300;
const OVERLAP_SEC = 30;
const CONCURRENCY = 3;

/**
 * Split segments into ~5-minute windows with ~30s overlap. Segments are never
 * split: a window is a contiguous run of whole segments. The next window
 * starts at the first segment whose start falls inside the previous window's
 * last 30 seconds, so anything said across the boundary is seen twice rather
 * than never.
 */
export function chunkSegments(segments: TranscriptSegment[]): TranscriptSegment[][] {
  if (segments.length === 0) return [];
  const windows: TranscriptSegment[][] = [];
  let startIdx = 0;
  for (;;) {
    const windowStart = segments[startIdx]!.startSec;
    const windowEnd = windowStart + WINDOW_SEC;
    let endIdx = startIdx;
    while (endIdx + 1 < segments.length && segments[endIdx + 1]!.startSec < windowEnd) {
      endIdx += 1;
    }
    windows.push(segments.slice(startIdx, endIdx + 1));
    if (endIdx >= segments.length - 1) break;
    // First segment starting inside the overlap region, but always advance.
    let next = endIdx + 1;
    for (let i = startIdx + 1; i <= endIdx; i += 1) {
      if (segments[i]!.startSec >= windowEnd - OVERLAP_SEC) {
        next = i;
        break;
      }
    }
    startIdx = Math.max(next, startIdx + 1);
  }
  return windows;
}

const TICKET_TYPES: ReadonlySet<string> = new Set([
  "bug",
  "feature",
  "design",
  "question",
  "out-of-scope",
]);
const PRIORITIES: ReadonlySet<string> = new Set(["high", "medium", "low"]);

/** Parse the model's reply into shape-checked candidates; junk items are skipped. */
export function parseCandidates(reply: string): RawCandidate[] {
  let text = reply.trim();
  // Models fence JSON despite instructions; strip defensively.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) text = fenced[1]!.trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end <= start) return [];
  let data: unknown;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: RawCandidate[] = [];
  for (const item of data) {
    if (typeof item !== "object" || item === null) continue;
    const o = item as Record<string, unknown>;
    if (typeof o.title !== "string" || typeof o.quote !== "string") continue;
    const type = typeof o.type === "string" && TICKET_TYPES.has(o.type) ? o.type : "feature";
    const priority =
      typeof o.priority === "string" && PRIORITIES.has(o.priority)
        ? (o.priority as "high" | "medium" | "low")
        : null;
    out.push({
      title: o.title.slice(0, 70),
      quote: o.quote,
      segmentIds: Array.isArray(o.segmentIds)
        ? o.segmentIds.filter((s): s is string => typeof s === "string")
        : [],
      type: type as TicketType,
      priority,
      prioritySignal:
        priority !== null && typeof o.prioritySignal === "string" ? o.prioritySignal : null,
      confidence:
        typeof o.confidence === "number" ? Math.min(1, Math.max(0, o.confidence)) : 0.5,
    });
  }
  return out;
}

export interface ExtractOptions {
  chat: ChatFn;
  clientSpeakerIds: string[];
  internalSpeakerIds: string[];
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}

/** Run extraction over every window with a concurrency cap of 3. */
export async function extractCandidates(
  segments: TranscriptSegment[],
  options: ExtractOptions,
): Promise<RawCandidate[]> {
  const windows = chunkSegments(segments);
  const system = buildExtractionSystemPrompt(
    options.clientSpeakerIds,
    options.internalSpeakerIds,
  );
  const results: RawCandidate[][] = new Array(windows.length);
  let next = 0;
  let done = 0;

  async function worker(): Promise<void> {
    for (;;) {
      if (options.signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      const i = next;
      if (i >= windows.length) return;
      next += 1;
      const reply = await options.chat(system, buildExtractionUserMessage(windows[i]!));
      results[i] = parseCandidates(reply);
      done += 1;
      options.onProgress?.(done, windows.length);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, windows.length) }, () => worker()),
  );
  return results.flat();
}
