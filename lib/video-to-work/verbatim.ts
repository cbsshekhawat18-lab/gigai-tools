/**
 * Verbatim validation - the code that makes the "exact words" guarantee real
 * rather than a request the model may ignore. Pure, no LLM, no network.
 *
 * Three tiers: exact substring -> normalized substring -> fuzzy snap
 * (Levenshtein >= 0.92 over word-stepped windows, trigram-prefiltered).
 * Whatever matches, the RETURNED quote is the raw transcript text at that
 * span - never the model's version. No match -> the ticket is dropped.
 */

import { distance } from "fastest-levenshtein";

import type { TranscriptSegment, MatchQuality, DroppedCandidate } from "./types";

export type VerbatimResult =
  | {
      ok: true;
      quote: string;
      startSec: number;
      endSec: number;
      segmentIds: string[];
      matchQuality: MatchQuality;
    }
  | { ok: false; reason: DroppedCandidate["reason"] };

/* ── normalization ────────────────────────────────────────────────────────── */

/** Longest-first so "shouldn't" wins over "n't"-style partial hits. */
const CONTRACTIONS: ReadonlyArray<[RegExp, string]> = [
  [/\bcannot\b/g, "can not"],
  [/\bwon't\b/g, "will not"],
  [/\bshan't\b/g, "shall not"],
  [/\blet's\b/g, "let us"],
  [/\bi'm\b/g, "i am"],
  [/\b(it|that|there|what|who|he|she)'s\b/g, "$1 is"],
  [/\b(i|you|we|they)'ve\b/g, "$1 have"],
  [/\b(i|you|we|they|it|he|she)'ll\b/g, "$1 will"],
  [/\b(i|you|we|they|he|she)'d\b/g, "$1 would"],
  [/\b(you|we|they)'re\b/g, "$1 are"],
  [/\b(is|are|was|were|do|does|did|has|have|had|would|could|should|must|need)n't\b/g, "$1 not"],
  [/\bcan't\b/g, "can not"],
];

/** Normalize one chunk of text into space-joined lowercase words. */
export function normalizeText(input: string): string {
  let t = input.toLowerCase();
  // Unicode quotes/dashes to ASCII first, so contraction regexes see «'».
  t = t.replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"');
  t = t.replace(/[–—―]/g, "-");
  for (const [re, sub] of CONTRACTIONS) t = t.replace(re, sub);
  // Strip punctuation except apostrophes inside words.
  t = t.replace(/[^a-z0-9\s']/g, " ");
  t = t.replace(/(^|\s)'+|'+(\s|$)/g, "$1 $2");
  return t.replace(/\s+/g, " ").trim();
}

/* ── transcript index ─────────────────────────────────────────────────────── */

interface NormWord {
  text: string;
  /** Offsets into the concatenated RAW transcript string. */
  rawStart: number;
  rawEnd: number;
  segIndex: number;
}

export interface TranscriptIndex {
  raw: string;
  segments: TranscriptSegment[];
  /** Raw-string start offset of each segment. */
  segStarts: number[];
  words: NormWord[];
  /** Space-joined normalized words. */
  norm: string;
  /** words[i] starts at norm offset wordNormStart[i]. */
  wordNormStart: number[];
}

/**
 * Build the searchable index once per transcript. Every normalized word keeps
 * the raw span it came from, so any normalized match maps back to raw text.
 * A raw word that normalizes into several words (contractions) yields several
 * norm words sharing one raw span - mapping stays correct in both directions.
 */
export function buildTranscriptIndex(segments: TranscriptSegment[]): TranscriptIndex {
  let raw = "";
  const segStarts: number[] = [];
  const words: NormWord[] = [];

  segments.forEach((seg, segIndex) => {
    if (raw.length > 0) raw += " ";
    segStarts.push(raw.length);
    const segStart = raw.length;
    raw += seg.text;

    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(seg.text)) !== null) {
      const rawStart = segStart + m.index;
      const rawEnd = rawStart + m[0].length;
      const norm = normalizeText(m[0]);
      if (!norm) continue;
      for (const piece of norm.split(" ")) {
        words.push({ text: piece, rawStart, rawEnd, segIndex });
      }
    }
  });

  const wordNormStart: number[] = [];
  let norm = "";
  for (const w of words) {
    wordNormStart.push(norm.length === 0 ? 0 : norm.length + 1);
    norm = norm.length === 0 ? w.text : `${norm} ${w.text}`;
  }

  return { raw, segments, segStarts, words, norm, wordNormStart };
}

/* ── span mapping helpers ─────────────────────────────────────────────────── */

function rawSpanToResult(
  index: TranscriptIndex,
  rawStart: number,
  rawEnd: number,
  matchQuality: MatchQuality,
): VerbatimResult {
  const { segments, segStarts } = index;
  let first = -1;
  let last = -1;
  for (let i = 0; i < segments.length; i += 1) {
    const s = segStarts[i]!;
    const e = s + segments[i]!.text.length;
    if (e > rawStart && s < rawEnd) {
      if (first === -1) first = i;
      last = i;
    }
  }
  if (first === -1) return { ok: false, reason: "no-verbatim-match" };
  return {
    ok: true,
    quote: index.raw.slice(rawStart, rawEnd),
    startSec: segments[first]!.startSec,
    endSec: segments[last]!.endSec,
    segmentIds: segments.slice(first, last + 1).map((s) => s.id),
    matchQuality,
  };
}

/** Map a span of the normalized string back to a raw span via word offsets. */
function normSpanToRaw(
  index: TranscriptIndex,
  normStart: number,
  normEnd: number,
): { rawStart: number; rawEnd: number } | null {
  const { words, wordNormStart } = index;
  let firstWord = -1;
  let lastWord = -1;
  for (let i = 0; i < words.length; i += 1) {
    const ws = wordNormStart[i]!;
    const we = ws + words[i]!.text.length;
    if (we > normStart && ws < normEnd) {
      if (firstWord === -1) firstWord = i;
      lastWord = i;
    }
  }
  if (firstWord === -1) return null;
  return { rawStart: words[firstWord]!.rawStart, rawEnd: words[lastWord]!.rawEnd };
}

/* ── trigram prefilter ────────────────────────────────────────────────────── */

function trigrams(s: string): Set<string> {
  const out = new Set<string>();
  const t = s.replace(/\s+/g, " ");
  for (let i = 0; i + 3 <= t.length; i += 1) out.add(t.slice(i, i + 3));
  return out;
}

/* ── the validator ────────────────────────────────────────────────────────── */

const MIN_WORDS = 4;
const SNAP_THRESHOLD = 0.92;
const PREFILTER_RATIO = 0.5;

/**
 * Validate one claimed quote against the transcript. Accepts a prebuilt index
 * (build it once for a batch) or raw segments.
 */
export function validateVerbatim(
  claimedQuote: string,
  transcript: TranscriptSegment[] | TranscriptIndex,
): VerbatimResult {
  const index = Array.isArray(transcript) ? buildTranscriptIndex(transcript) : transcript;

  const claimed = claimedQuote.trim();
  if (!claimed) return { ok: false, reason: "empty-quote" };
  if (claimed.split(/\s+/).length < MIN_WORDS) return { ok: false, reason: "too-short" };

  // Tier 1 - exact raw substring.
  const exactAt = index.raw.indexOf(claimed);
  if (exactAt !== -1) {
    return rawSpanToResult(index, exactAt, exactAt + claimed.length, "exact");
  }

  // Tier 2 - normalized substring, returned as RAW text.
  const normQuote = normalizeText(claimed);
  if (!normQuote) return { ok: false, reason: "empty-quote" };
  const normAt = index.norm.indexOf(normQuote);
  if (normAt !== -1) {
    const span = normSpanToRaw(index, normAt, normAt + normQuote.length);
    if (span) return rawSpanToResult(index, span.rawStart, span.rawEnd, "normalized");
  }

  // Tier 3 - fuzzy snap: word-stepped windows, length ±25%, trigram-prefiltered.
  const quoteWordCount = normQuote.split(" ").length;
  const minWords = Math.max(1, Math.floor(quoteWordCount * 0.75));
  const maxWords = Math.max(minWords, Math.ceil(quoteWordCount * 1.25));
  const qTris = trigrams(normQuote);
  const needed = Math.ceil(qTris.size * PREFILTER_RATIO);

  let best: { score: number; start: number; end: number } | null = null;
  const { words, wordNormStart, norm } = index;

  for (let len = minWords; len <= maxWords; len += 1) {
    if (len > words.length) break;
    for (let start = 0; start + len <= words.length; start += 1) {
      const ns = wordNormStart[start]!;
      const lastIdx = start + len - 1;
      const ne = wordNormStart[lastIdx]! + words[lastIdx]!.text.length;
      const windowText = norm.slice(ns, ne);

      // Prefilter: shared trigram count before paying for Levenshtein.
      let shared = 0;
      const wTris = trigrams(windowText);
      for (const t of qTris) if (wTris.has(t)) shared += 1;
      if (shared < needed) continue;

      const d = distance(normQuote, windowText);
      const score = 1 - d / Math.max(normQuote.length, windowText.length);
      if (score >= SNAP_THRESHOLD && (!best || score > best.score)) {
        best = { score, start: ns, end: ne };
      }
    }
  }

  if (best) {
    const span = normSpanToRaw(index, best.start, best.end);
    if (span) return rawSpanToResult(index, span.rawStart, span.rawEnd, "snapped");
  }

  return { ok: false, reason: "no-verbatim-match" };
}
