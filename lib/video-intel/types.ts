/**
 * Video Intelligence, core data model.
 *
 * Deliberately built ON TOP of the existing `Cue` shape from lib/subtitles.ts
 * rather than beside it: a Segment is a Cue plus speaker/confidence, so SRT and
 * VTT import/export reuse the parser and serialiser we already ship instead of
 * growing a second, drifting copy.
 *
 * Everything here is plain data (no DOM, no model, no network) so the
 * analysis engine can be unit-tested and run inside a Web Worker unchanged.
 */

import type { Cue } from "@/lib/subtitles";

/** A stretch of speech: a subtitle cue plus who said it and how sure we are. */
export interface Segment extends Cue {
  id: string;
  /** Id of the owning Speaker, if diarisation or manual labelling assigned one. */
  speakerId?: string;
  /** 0–1 model confidence, when the source provides it. */
  confidence?: number;
}

/** A named voice. Color is an accent key so it matches the site palette. */
export interface Speaker {
  id: string;
  label: string;
  /** Index into the workspace's accent rotation: resolved at render time. */
  colorIndex: number;
}

/** A detected section of the recording. */
export interface Chapter {
  id: string;
  start: number;
  end: number;
  title: string;
  /** Segments falling inside this chapter, in order. */
  segmentIds: string[];
  keywords: string[];
  /** Distinct speakers heard in this chapter. */
  speakerIds: string[];
}

/** A user-placed marker on the timeline. */
export interface Bookmark {
  id: string;
  time: number;
  label: string;
  note?: string;
}

/** A note attached to a segment. */
export interface Comment {
  id: string;
  segmentId: string;
  body: string;
  createdAt: number;
}

/**
 * Entity categories we can detect HONESTLY without a language model.
 *
 * People / companies / products are deliberately ABSENT: recognising those is
 * named-entity recognition, which needs a model we don't ship. Promising them
 * from regex would mean labelling "Monday" as a person. Everything listed here
 * is decidable from surface form alone.
 */
export type EntityType =
  | "email"
  | "url"
  | "phone"
  | "date"
  | "time"
  | "money"
  | "percent"
  | "number"
  | "hashtag"
  | "mention"
  | "acronym";

/** One distinct entity value plus every timestamp it was said at. */
export interface EntityHit {
  type: EntityType;
  value: string;
  count: number;
  /** Start times (ms) of the segments containing it: all clickable. */
  times: number[];
}

/** A statistically significant term, scored by TF-IDF across segments. */
export interface Keyword {
  term: string;
  score: number;
  count: number;
  times: number[];
}

/** An edge in the co-occurrence graph: two terms said close together. */
export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

/** Per-speaker talk statistics. */
export interface SpeakerStats {
  speakerId: string;
  /** Total speaking time in ms. */
  speakingMs: number;
  words: number;
  segments: number;
  /** Words per minute across that speaker's own speaking time. */
  wordsPerMinute: number;
  /** Share of total speaking time, 0–1. */
  share: number;
}

/** Whole-recording analytics. Every field is computed, never estimated by a model. */
export interface Analytics {
  durationMs: number;
  words: number;
  characters: number;
  /** Minutes to read the transcript at 220 wpm. */
  readingMinutes: number;
  /** Speech time / duration, 0–1. */
  speechRatio: number;
  /** 1 − speechRatio. */
  silenceRatio: number;
  wordsPerMinute: number;
  speakers: SpeakerStats[];
  /** Mean model confidence, 0–1, or null when the source carried none. */
  meanConfidence: number | null;
}

/** Where a transcript came from, drives what we claim about it in the UI. */
export type TranscriptSource =
  /** Produced here by Whisper running in the browser. */
  | { kind: "transcribed"; model: string; language: string }
  /** Imported from an existing SRT/VTT/TXT the user already had. */
  | { kind: "imported"; format: "srt" | "vtt" | "txt" }
  /** Typed or pasted by hand. */
  | { kind: "manual" };

/** The complete workspace document. Serialisable; this is what export saves. */
export interface Transcript {
  segments: Segment[];
  speakers: Speaker[];
  chapters: Chapter[];
  bookmarks: Bookmark[];
  comments: Comment[];
  durationMs: number;
  source: TranscriptSource;
  /** Display name of the media this came from. */
  mediaName: string;
}

/* ── Conversions to/from the shared Cue type ─────────────────────────────── */

/** Widen Cues (from lib/subtitles' SRT/VTT parser) into Segments. */
export function cuesToSegments(cues: Cue[]): Segment[] {
  return cues.map((cue, i) => ({ ...cue, id: `s${i}` }));
}

/** Narrow Segments back to Cues so lib/subtitles can serialise SRT/VTT. */
export function segmentsToCues(segments: Segment[]): Cue[] {
  return segments.map(({ start, end, text }) => ({ start, end, text }));
}

/** An empty document, so the UI never has to null-check the whole shape. */
export function emptyTranscript(mediaName = ""): Transcript {
  return {
    segments: [],
    speakers: [],
    chapters: [],
    bookmarks: [],
    comments: [],
    durationMs: 0,
    source: { kind: "manual" },
    mediaName,
  };
}

/** Total words across every segment. Shared by analytics, chapters and exports. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** `H:MM:SS` / `M:SS` for display; `ms` is clamped at zero. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}
