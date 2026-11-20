/**
 * GigAI Tools, content-analysis engine.
 *
 * Word/character counts, reading time, keyword density (n-grams with stopword
 * filtering) and a heading outline extracted from pasted HTML (via native
 * `DOMParser`). Pure, dependency-free, Unicode-aware where practical, no
 * network.
 */

/** Split text into words using a Unicode-aware boundary. */
function words(text: string): string[] {
  const matches = text
    .toLowerCase()
    .match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu);
  return matches ?? [];
}

/** Count words in a block of text. */
export function wordCount(text: string): number {
  return words(text).length;
}

/* -------------------------------- charCount ------------------------------- */

export interface CharCounts {
  withSpaces: number;
  withoutSpaces: number;
  /** UTF-8 byte length. */
  bytes: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  words: number;
}

/** Detailed character/line/paragraph/sentence statistics for a text. */
export function charCount(text: string): CharCounts {
  const withSpaces = [...text].length;
  const withoutSpaces = [...text.replace(/\s/g, "")].length;
  const bytes = new TextEncoder().encode(text).length;
  const lines = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean).length;
  const sentences = (text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [])
    .map((s) => s.trim())
    .filter(Boolean).length;
  return {
    withSpaces,
    withoutSpaces,
    bytes,
    lines,
    paragraphs,
    sentences,
    words: wordCount(text),
  };
}

/* ------------------------------- readingTime ------------------------------ */

export interface ReadingTime {
  words: number;
  minutes: number;
  /** Whole minutes + seconds, for a "3 min 20 sec" style label. */
  totalSeconds: number;
  text: string;
}

/** Estimate reading time. Default 225 wpm (average adult silent reading). */
export function readingTime(text: string, options: { wpm?: number } = {}): ReadingTime {
  const wpm = options.wpm && options.wpm > 0 ? options.wpm : 225;
  const count = wordCount(text);
  const minutes = count / wpm;
  const totalSeconds = Math.round(minutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  let label: string;
  if (totalSeconds < 60) label = `${totalSeconds} sec read`;
  else if (secs === 0) label = `${mins} min read`;
  else label = `${mins} min ${secs} sec read`;
  return { words: count, minutes, totalSeconds, text: label };
}

/* ----------------------------- keywordDensity ----------------------------- */

/** A compact English stopword list (used by default; override via options). */
export const DEFAULT_STOPWORDS = new Set<string>([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can", "could",
  "did", "do", "does", "for", "from", "had", "has", "have", "he", "her", "his",
  "how", "i", "if", "in", "into", "is", "it", "its", "may", "me", "might", "must",
  "my", "no", "not", "of", "on", "or", "our", "she", "should", "so", "than", "that",
  "the", "their", "them", "then", "there", "these", "they", "this", "to", "up", "us",
  "was", "we", "were", "what", "when", "which", "who", "will", "with", "would",
  "you", "your", "about", "would", "just",
]);

export interface KeywordEntry {
  term: string;
  count: number;
  /** Share of total n-grams, as a percentage (0–100). */
  density: number;
}

export interface KeywordDensityResult {
  totalWords: number;
  /** Number of n-grams considered (after stopword filtering, for n=1). */
  totalTerms: number;
  n: number;
  entries: KeywordEntry[];
}

export interface KeywordDensityOptions {
  /** n-gram size (1 = single words, 2 = bigrams, …). Default 1. */
  n?: number;
  /** Custom stopword set; pass `null` to disable filtering. Default English list. */
  stopwords?: Set<string> | null;
  /** Max number of terms to return. Default 25. */
  top?: number;
  /** Ignore terms shorter than this many characters (n=1 only). Default 2. */
  minLength?: number;
}

/** Compute keyword density (top n-grams with counts and percentages). */
export function keywordDensity(
  text: string,
  options: KeywordDensityOptions = {},
): KeywordDensityResult {
  const n = Math.max(1, Math.floor(options.n ?? 1));
  const stopwords = options.stopwords === undefined ? DEFAULT_STOPWORDS : options.stopwords;
  const top = options.top ?? 25;
  const minLength = options.minLength ?? 2;

  const allWords = words(text);
  const totalWords = allWords.length;
  const counts = new Map<string, number>();

  if (n === 1) {
    const kept = allWords.filter(
      (w) => w.length >= minLength && !(stopwords && stopwords.has(w)),
    );
    for (const w of kept) counts.set(w, (counts.get(w) ?? 0) + 1);
    const totalTerms = kept.length;
    return finish(counts, totalTerms, totalWords, n, top);
  }

  // n-grams: drop grams that are entirely stopwords.
  let totalTerms = 0;
  for (let i = 0; i + n <= allWords.length; i += 1) {
    const gram = allWords.slice(i, i + n);
    if (stopwords && gram.every((w) => stopwords.has(w))) continue;
    const key = gram.join(" ");
    counts.set(key, (counts.get(key) ?? 0) + 1);
    totalTerms += 1;
  }
  return finish(counts, totalTerms, totalWords, n, top);
}

function finish(
  counts: Map<string, number>,
  totalTerms: number,
  totalWords: number,
  n: number,
  top: number,
): KeywordDensityResult {
  const entries: KeywordEntry[] = [...counts.entries()]
    .map(([term, count]) => ({
      term,
      count,
      density: totalTerms ? (count / totalTerms) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, top);
  return { totalWords, totalTerms, n, entries };
}

/* ------------------------------ headingOutline ---------------------------- */

export interface HeadingNode {
  level: number;
  text: string;
  /** The element's `id`, when present (useful for anchor links). */
  id?: string;
}

export interface HeadingOutline {
  headings: HeadingNode[];
  issues: string[];
  /** Convenience counts per level (`{h1: 1, h2: 3, …}`). */
  counts: Record<string, number>;
}

/**
 * Extract an h1–h6 outline from pasted HTML and flag structural issues:
 * missing h1, multiple h1s, and skipped heading levels (e.g. h2 → h4).
 */
export function headingOutline(html: string): HeadingOutline {
  const headings: HeadingNode[] = [];
  const issues: string[] = [];
  const counts: Record<string, number> = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };

  if (typeof DOMParser === "undefined") {
    return { headings, issues: ["DOMParser is unavailable in this environment."], counts };
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
    const level = Number(el.tagName.slice(1));
    const text = (el.textContent ?? "").trim();
    const id = el.getAttribute("id") ?? undefined;
    headings.push({ level, text, id });
    const key = `h${level}`;
    counts[key] = (counts[key] ?? 0) + 1;
  });

  if (headings.length === 0) {
    issues.push("No headings found.");
    return { headings, issues, counts };
  }

  if ((counts["h1"] ?? 0) === 0) issues.push("No H1 found. Every page should have exactly one H1.");
  if ((counts["h1"] ?? 0) > 1) issues.push(`Multiple H1s found (${counts["h1"]}). Use a single H1 per page.`);

  let prev = 0;
  headings.forEach((h, i) => {
    if (i === 0 && h.level !== 1) {
      issues.push(`First heading is an H${h.level}; pages usually start with an H1.`);
    }
    if (prev && h.level > prev + 1) {
      issues.push(`Heading level skips from H${prev} to H${h.level} at "${h.text.slice(0, 40) || "(empty)"}".`);
    }
    if (!h.text) issues.push(`An H${h.level} has no text content.`);
    prev = h.level;
  });

  return { headings, issues, counts };
}
