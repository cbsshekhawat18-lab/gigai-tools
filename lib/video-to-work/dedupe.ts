/**
 * Stage 4 - merge duplicates. One LLM grouping pass over the validated
 * candidates, then a code-side merge. The grouping is VALIDATED: if the model
 * returns anything that doesn't cover every input ID exactly once, we fall
 * back to no merging rather than silently losing tickets.
 */

import type { ChatFn, Ticket, TicketOccurrence, ValidatedCandidate } from "./types";
import { buildDedupeUserMessage, DEDUPE_SYSTEM_PROMPT } from "./prompts";

/** Parse and validate the grouping reply. Null = malformed, caller falls back. */
export function parseGrouping(reply: string, ids: string[]): string[][] | null {
  let text = reply.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) text = fenced[1]!.trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end <= start) return null;
  let data: unknown;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!Array.isArray(data)) return null;
  const groups: string[][] = [];
  for (const g of data) {
    if (!Array.isArray(g) || g.some((x) => typeof x !== "string")) return null;
    groups.push(g as string[]);
  }
  // Exactly-once coverage check - the load-bearing validation.
  const seen = new Set<string>();
  for (const g of groups) {
    for (const id of g) {
      if (seen.has(id)) return null;
      seen.add(id);
    }
  }
  if (seen.size !== ids.length) return null;
  for (const id of ids) if (!seen.has(id)) return null;
  return groups;
}

/** Overlap fraction of two time ranges relative to the shorter one. */
function overlapFraction(a: TicketOccurrence, b: TicketOccurrence): number {
  const inter = Math.min(a.endSec, b.endSec) - Math.max(a.startSec, b.startSec);
  if (inter <= 0) return 0;
  const shorter = Math.min(a.endSec - a.startSec, b.endSec - b.startSec) || 1;
  return inter / shorter;
}

/** Merge one group of candidates into a ticket-shaped draft (pure). */
export function mergeGroup(
  members: ValidatedCandidate[],
): Omit<Ticket, "confidence" | "needsReview" | "dismissed"> {
  const byConfidence = [...members].sort((a, b) => b.modelConfidence - a.modelConfidence);
  const lead = byConfidence[0]!;

  const occurrences: TicketOccurrence[] = [];
  const sorted = members
    .map((m) => ({
      startSec: m.startSec,
      endSec: m.endSec,
      quote: m.quote,
      segmentIds: m.segmentIds,
      matchQuality: m.matchQuality,
    }))
    .sort((a, b) => a.startSec - b.startSec);
  for (const occ of sorted) {
    // Occurrences overlapping >80% in time are the extraction-window
    // duplicates, not genuine repetition - keep one.
    if (occurrences.some((kept) => overlapFraction(kept, occ) > 0.8)) continue;
    occurrences.push(occ);
  }

  const order = { high: 0, medium: 1, low: 2 } as const;
  let priority: Ticket["priority"] = null;
  let prioritySignal: string | null = null;
  for (const m of members) {
    if (m.priority && (priority === null || order[m.priority] < order[priority])) {
      priority = m.priority;
      prioritySignal = m.prioritySignal;
    }
  }

  return {
    id: lead.id,
    title: lead.title,
    type: lead.type,
    occurrences,
    speakerId: lead.speakerId,
    priority,
    prioritySignal,
    modelConfidence: lead.modelConfidence,
  };
}

export interface DedupeResult {
  merged: Omit<Ticket, "confidence" | "needsReview" | "dismissed">[];
  mergedByDedupe: number;
  /** True when the model's grouping was malformed and no merging happened. */
  fellBack: boolean;
}

export async function mergeDuplicates(
  candidates: ValidatedCandidate[],
  chat: ChatFn,
): Promise<DedupeResult> {
  if (candidates.length <= 1) {
    return { merged: candidates.map((c) => mergeGroup([c])), mergedByDedupe: 0, fellBack: false };
  }
  const ids = candidates.map((c) => c.id);
  let groups: string[][] | null = null;
  try {
    const reply = await chat(DEDUPE_SYSTEM_PROMPT, buildDedupeUserMessage(candidates));
    groups = parseGrouping(reply, ids);
  } catch {
    groups = null;
  }
  const fellBack = groups === null;
  const finalGroups = groups ?? ids.map((id) => [id]);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const merged = finalGroups.map((g) =>
    mergeGroup(g.map((id) => byId.get(id)!).filter(Boolean)),
  );
  return {
    merged,
    mergedByDedupe: candidates.length - merged.length,
    fellBack,
  };
}
