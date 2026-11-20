/**
 * Video Intelligence: chapter detection.
 *
 * HONEST SCOPE: this is structural segmentation, not semantic topic detection.
 * It splits on evidence actually present in the transcript: long pauses and
 * speaker handovers, and titles each chapter from its own highest-scoring
 * terms. That is a real, explainable signal and the UI calls them "detected
 * sections" rather than implying a model read the content and understood it.
 *
 * Pure functions over plain data: no DOM, no model, no network.
 */

import type { Chapter, Segment } from "./types";
import { extractKeywords } from "./analyze";

export interface ChapterOptions {
  /** A gap at least this long (ms) ends a chapter. */
  pauseMs?: number;
  /** Start a new chapter when the speaker changes. */
  splitOnSpeaker?: boolean;
  /** Never emit a chapter shorter than this (ms), prevents confetti. */
  minChapterMs?: number;
  /** Force a split once a chapter runs longer than this (ms). */
  maxChapterMs?: number;
}

const DEFAULTS: Required<ChapterOptions> = {
  pauseMs: 2500,
  splitOnSpeaker: true,
  minChapterMs: 20000,
  maxChapterMs: 300000,
};

/** Title a chapter from its own top terms, falling back to its opening words. */
function titleFor(segments: Segment[]): { title: string; keywords: string[] } {
  const keywords = extractKeywords(segments, 4).map((k) => k.term);
  if (keywords.length >= 2) {
    const title = keywords
      .slice(0, 3)
      .map((term) => term.charAt(0).toUpperCase() + term.slice(1))
      .join(" · ");
    return { title, keywords };
  }

  // Too little signal to rank terms, quote the opening instead of inventing.
  const opening = (segments[0]?.text ?? "").trim().split(/\s+/).slice(0, 7).join(" ");
  return { title: opening ? `${opening}…` : "Section", keywords };
}

/**
 * Group segments into chapters at pause and speaker boundaries.
 *
 * Boundaries are proposed first, then merged forward until each chapter clears
 * `minChapterMs`, otherwise a conversation with frequent short handovers would
 * produce dozens of two-second "chapters" that help nobody.
 */
export function detectChapters(segments: Segment[], options: ChapterOptions = {}): Chapter[] {
  const opts = { ...DEFAULTS, ...options };
  if (segments.length === 0) return [];

  const groups: Segment[][] = [];
  let current: Segment[] = [];

  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i]!;
    const previous = segments[i - 1];

    if (previous && current.length > 0) {
      const gap = segment.start - previous.end;
      const speakerChanged =
        opts.splitOnSpeaker &&
        segment.speakerId !== undefined &&
        previous.speakerId !== undefined &&
        segment.speakerId !== previous.speakerId;
      const runningMs = previous.end - (current[0]?.start ?? previous.end);

      const shouldSplit =
        gap >= opts.pauseMs || speakerChanged || runningMs >= opts.maxChapterMs;

      // Only honour a split if the chapter we'd close is long enough to stand
      // alone; otherwise keep absorbing so short exchanges stay together.
      if (shouldSplit && runningMs >= opts.minChapterMs) {
        groups.push(current);
        current = [];
      }
    }
    current.push(segment);
  }
  if (current.length > 0) groups.push(current);

  return groups.map((group, index) => {
    const first = group[0]!;
    const last = group[group.length - 1]!;
    const { title, keywords } = titleFor(group);
    return {
      id: `c${index}`,
      start: first.start,
      end: last.end,
      title,
      segmentIds: group.map((s) => s.id),
      keywords,
      speakerIds: [
        ...new Set(group.map((s) => s.speakerId).filter((id): id is string => Boolean(id))),
      ],
    };
  });
}
