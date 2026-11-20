/**
 * Video Intelligence, analysis engine.
 *
 * Everything in this file is DETERMINISTIC and model-free: term statistics,
 * surface-form pattern matching and arithmetic. That is a deliberate boundary.
 * Anything requiring a language model, real people/company recognition,
 * sentiment, abstractive summary: is NOT faked here with heuristics dressed up
 * as AI. What this produces is defensible: a keyword really is statistically
 * significant, an email really is an email.
 *
 * Pure functions over plain data, so it unit-tests directly and can run inside a
 * Web Worker without touching the DOM.
 */

import type {
  Analytics,
  EntityHit,
  EntityType,
  GraphEdge,
  Keyword,
  Segment,
  SpeakerStats,
  Transcript,
} from "./types";
import { countWords } from "./types";

/**
 * Function words carry no topical signal, so they'd otherwise dominate every
 * term ranking. Kept deliberately small, the IDF term already suppresses words
 * that appear everywhere, so this only needs to catch the very highest frequency
 * cases that would still rank in a short recording.
 */
const STOPWORDS = new Set(
  ("a about above after again all also am an and any are as at be because been before being below between both but by " +
    "can cannot could did do does doing down during each few for from further had has have having he her here hers him " +
    "his how i if in into is it its just me more most my no nor not now of off on once only or other otherwise our out " +
    "over own same she should so some such than that the their them then there these they this those through to too " +
    "under until up very was we were what when where which while who whom why will with would you your yours " +
    "actually basically really literally okay ok yeah yes right like know think going get got kind sort thing things " +
    "gonna wanna lot bit maybe probably definitely something anything everything nothing someone anyone everyone")
    .split(" ")
    .filter(Boolean),
);

/** Split text into lowercase word tokens, dropping punctuation. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[-']+|[-']+$/g, ""))
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

/**
 * Rank terms by TF-IDF, treating each segment as a document.
 *
 * A term that appears often in a few segments (a topic) outranks one sprinkled
 * evenly throughout (a verbal tic), which is exactly the distinction a naive
 * frequency count gets wrong.
 */
export function extractKeywords(segments: Segment[], limit = 40): Keyword[] {
  if (segments.length === 0) return [];

  const docFreq = new Map<string, number>();
  const termCount = new Map<string, number>();
  const termTimes = new Map<string, number[]>();

  for (const segment of segments) {
    const tokens = tokenize(segment.text);
    const seen = new Set<string>();
    for (const token of tokens) {
      termCount.set(token, (termCount.get(token) ?? 0) + 1);
      if (!seen.has(token)) {
        seen.add(token);
        docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
        const times = termTimes.get(token);
        if (times) times.push(segment.start);
        else termTimes.set(token, [segment.start]);
      }
    }
  }

  const total = segments.length;
  const keywords: Keyword[] = [];
  for (const [term, count] of termCount) {
    // Single mentions are noise in anything longer than a soundbite.
    if (count < 2 && total > 8) continue;
    const df = docFreq.get(term) ?? 1;
    const idf = Math.log(1 + total / df);
    keywords.push({
      term,
      score: count * idf,
      count,
      times: termTimes.get(term) ?? [],
    });
  }

  return keywords.sort((a, b) => b.score - a.score || b.count - a.count).slice(0, limit);
}

/**
 * Surface-form entity patterns.
 *
 * Ordered most-specific first: `extractEntities` claims each character span
 * once, so a URL containing digits can't also be reported as a bare number.
 */
const PATTERNS: ReadonlyArray<{ type: EntityType; re: RegExp }> = [
  { type: "email", re: /\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g },
  { type: "url", re: /\bhttps?:\/\/[^\s<>"')]+|\bwww\.[\w-]+(?:\.[\w-]+)+[^\s<>"')]*/gi },
  {
    type: "money",
    re: /(?:[$€£¥₹]\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:k|m|bn|billion|million|thousand))?)|(?:\b\d[\d,]*(?:\.\d+)?\s?(?:dollars?|euros?|pounds?|rupees?|yen|usd|eur|gbp)\b)/gi,
  },
  // Two alternatives on purpose: a trailing \b after "%" never matches (both
  // "%" and the following space are non-word chars), so the symbol form must
  // end the pattern and only the spelled-out form carries the boundary.
  { type: "percent", re: /\b\d+(?:\.\d+)?\s?%|\b\d+(?:\.\d+)?\s?per\s?cent\b/gi },
  {
    type: "date",
    re: /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?|\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:,?\s+\d{4})?)\b/gi,
  },
  { type: "time", re: /\b\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)?\b/gi },
  // Require 7+ digits so ordinary counts can't masquerade as phone numbers.
  { type: "phone", re: /(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}(?:[\s.-]?\d{2,4})?/g },
  { type: "hashtag", re: /#[\p{L}\p{N}_]{2,}/gu },
  { type: "mention", re: /@[\p{L}\p{N}_.]{2,}/gu },
  { type: "acronym", re: /\b[A-Z]{2,6}(?:s)?\b/g },
  { type: "number", re: /\b\d[\d,]*(?:\.\d+)?\b/g },
];

/** Phone candidates must really carry 7+ digits; the regex alone is too eager. */
function isPlausible(type: EntityType, value: string): boolean {
  if (type === "phone") return (value.match(/\d/g) ?? []).length >= 7;
  // Bare numbers are only interesting when they're substantial.
  if (type === "number") return (value.match(/\d/g) ?? []).length >= 3;
  if (type === "acronym") return !STOPWORDS.has(value.toLowerCase());
  return true;
}

/**
 * Pull every detectable entity out of the transcript, de-duplicated by value
 * with the timestamps of every segment it occurred in.
 *
 * Each character span is claimed by at most one pattern (first match wins, in
 * PATTERNS order), so results don't double-count.
 */
export function extractEntities(segments: Segment[]): EntityHit[] {
  const hits = new Map<string, EntityHit>();

  for (const segment of segments) {
    const claimed: Array<[number, number]> = [];
    for (const { type, re } of PATTERNS) {
      re.lastIndex = 0;
      for (const match of segment.text.matchAll(re)) {
        const start = match.index ?? 0;
        const end = start + match[0].length;
        const overlaps = claimed.some(([s, e]) => start < e && end > s);
        if (overlaps) continue;

        const value = match[0].trim();
        if (!isPlausible(type, value)) continue;
        claimed.push([start, end]);

        const key = `${type}:${value.toLowerCase()}`;
        const existing = hits.get(key);
        if (existing) {
          existing.count += 1;
          if (!existing.times.includes(segment.start)) existing.times.push(segment.start);
        } else {
          hits.set(key, { type, value, count: 1, times: [segment.start] });
        }
      }
    }
  }

  return [...hits.values()].sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/**
 * Co-occurrence graph: terms sharing a segment are related, weighted by how
 * often. Not semantic understanding: it's "these get talked about together",
 * which is a real, explainable signal and is labelled as such in the UI.
 */
export function buildGraph(segments: Segment[], keywords: Keyword[], limit = 60): GraphEdge[] {
  const top = new Set(keywords.slice(0, 24).map((k) => k.term));
  if (top.size < 2) return [];

  const weights = new Map<string, number>();
  for (const segment of segments) {
    const present = [...new Set(tokenize(segment.text).filter((t) => top.has(t)))].sort();
    for (let i = 0; i < present.length; i += 1) {
      for (let j = i + 1; j < present.length; j += 1) {
        const key = `${present[i]} ${present[j]}`;
        weights.set(key, (weights.get(key) ?? 0) + 1);
      }
    }
  }

  return [...weights.entries()]
    .map(([key, weight]) => {
      const [source = "", target = ""] = key.split(" ");
      return { source, target, weight };
    })
    .filter((edge) => edge.weight > 1)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

/** Per-speaker talk time, word count and pace. */
export function computeSpeakerStats(segments: Segment[]): SpeakerStats[] {
  const byId = new Map<string, SpeakerStats>();
  let totalSpeaking = 0;

  for (const segment of segments) {
    const id = segment.speakerId ?? "unassigned";
    const ms = Math.max(0, segment.end - segment.start);
    totalSpeaking += ms;

    const entry = byId.get(id) ?? {
      speakerId: id,
      speakingMs: 0,
      words: 0,
      segments: 0,
      wordsPerMinute: 0,
      share: 0,
    };
    entry.speakingMs += ms;
    entry.words += countWords(segment.text);
    entry.segments += 1;
    byId.set(id, entry);
  }

  for (const entry of byId.values()) {
    const minutes = entry.speakingMs / 60000;
    entry.wordsPerMinute = minutes > 0 ? Math.round(entry.words / minutes) : 0;
    entry.share = totalSpeaking > 0 ? entry.speakingMs / totalSpeaking : 0;
  }

  return [...byId.values()].sort((a, b) => b.speakingMs - a.speakingMs);
}

/** Whole-recording analytics. Every number here is measured, not inferred. */
export function computeAnalytics(transcript: Transcript): Analytics {
  const { segments, durationMs } = transcript;

  let words = 0;
  let characters = 0;
  let speechMs = 0;
  let confidenceSum = 0;
  let confidenceCount = 0;

  for (const segment of segments) {
    words += countWords(segment.text);
    characters += segment.text.length;
    speechMs += Math.max(0, segment.end - segment.start);
    if (typeof segment.confidence === "number") {
      confidenceSum += segment.confidence;
      confidenceCount += 1;
    }
  }

  const effectiveDuration = durationMs > 0 ? durationMs : speechMs;
  const speechRatio = effectiveDuration > 0 ? Math.min(1, speechMs / effectiveDuration) : 0;
  const minutes = effectiveDuration / 60000;

  return {
    durationMs: effectiveDuration,
    words,
    characters,
    readingMinutes: words > 0 ? Math.max(1, Math.round(words / 220)) : 0,
    speechRatio,
    silenceRatio: 1 - speechRatio,
    wordsPerMinute: minutes > 0 ? Math.round(words / minutes) : 0,
    speakers: computeSpeakerStats(segments),
    meanConfidence: confidenceCount > 0 ? confidenceSum / confidenceCount : null,
  };
}
