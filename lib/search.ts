import type { SearchResult } from "@/types";
import { ROUTES } from "@/config/constants";
import { CATEGORIES } from "@/config/categories";
import { TOOLS } from "@/config/tools";
import { PROBLEMS } from "@/config/problems";
import { GLOSSARY } from "@/config/glossary";
import { CONTEXT_PAGES } from "@/config/contexts";
import { isLiveTool } from "@/lib/registry";
import {
  buildSearchIndex,
  INTENT_SYNONYMS,
  type SearchIndexEntry,
} from "@/lib/search-index-data";
import { getUseCaseBySlug, getUseCases } from "@/lib/discovery";

/**
 * Lightweight, synchronous, client-safe search over the static registry.
 * Ranks title/name matches ahead of description/keyword matches so the most
 * relevant result surfaces first. No index or network, instant as you type.
 *
 * Two layers live here:
 *  - `searchAll` / `getSearchSuggestions`: the original, tiny, client-facing
 *    API used by the search-bar island (lazy-loaded on first keystroke).
 *  - `searchTools`: an INTENT-AWARE, filterable search over the slim index
 *    from `lib/search-index-data`, with fuzzy matching + synonym expansion.
 *    Both are bundled here so the existing lazy-load (`import("@/lib/search")`)
 *    keeps working and nothing new is forced into client First Load.
 */

const DEFAULT_LIMIT = 8;

/** Relevance tiers (lower = better). Used to sort matches. */
const RANK = {
  titleStartsWith: 0,
  titleIncludes: 1,
  keywordIncludes: 2,
  descriptionIncludes: 3,
} as const;

interface Scored {
  result: SearchResult;
  rank: number;
}

/** Score a piece of text against the query; returns null when there's no hit. */
function scoreText(query: string, opts: {
  title: string;
  description: string;
  keywords?: string[];
}): number | null {
  const title = opts.title.toLowerCase();
  const description = opts.description.toLowerCase();

  if (title.startsWith(query)) return RANK.titleStartsWith;
  if (title.includes(query)) return RANK.titleIncludes;

  const keywordHit = opts.keywords?.some((k) => k.toLowerCase().includes(query));
  if (keywordHit) return RANK.keywordIncludes;

  if (description.includes(query)) return RANK.descriptionIncludes;

  return null;
}

/**
 * Filler words stripped from natural-language queries so "i want to convert
 * pdf to word online free" matches exactly like "pdf to word". Deliberately
 * does NOT include "to" (load-bearing in conversions: "pdf to word") or verbs
 * like convert/compress/merge (they appear in tool titles and keywords).
 */
const QUERY_STOPWORDS = new Set([
  "i", "want", "need", "wanna", "how", "do", "does", "can", "please", "help",
  "me", "my", "a", "an", "the", "tool", "tools", "online", "free", "for",
  "with", "using", "best", "way", "is", "there",
]);

/** Normalise a query: lowercase, strip punctuation + filler words. Falls back
 * to the raw query when stripping would empty it (e.g. the query IS "free"). */
function normalizeQuery(raw: string): string {
  const q = raw.trim().toLowerCase();
  const kept = q
    .split(/[^a-z0-9.+-]+/)
    .filter((w) => w && !QUERY_STOPWORDS.has(w))
    .join(" ");
  return kept || q;
}

/**
 * Search tools + categories. Case-insensitive, natural-language tolerant;
 * returns up to `limit` results, tools ranked ahead of categories at the same
 * relevance tier.
 */
export function searchAll(query: string, limit = DEFAULT_LIMIT): SearchResult[] {
  const q = normalizeQuery(query);
  if (!q) return [];

  const scored: Scored[] = [];

  for (const tool of TOOLS) {
    if (!isLiveTool(tool)) continue; // coming-soon tools have no page to link
    const rank = scoreText(q, {
      title: tool.title,
      description: tool.description,
      keywords: tool.keywords,
    });
    if (rank === null) continue;
    scored.push({
      rank,
      result: {
        kind: "tool",
        slug: tool.slug,
        title: tool.title,
        description: tool.description,
        href: ROUTES.tool(tool.slug),
        icon: tool.icon,
        category: tool.category,
      },
    });
  }

  for (const category of CATEGORIES) {
    const rank = scoreText(q, {
      title: category.name,
      description: category.description,
    });
    if (rank === null) continue;
    // Bias categories slightly below tools at the same tier.
    scored.push({
      rank: rank + 0.5,
      result: {
        kind: "category",
        slug: category.slug,
        title: category.name,
        description: category.description,
        href: ROUTES.category(category.slug),
        icon: category.icon,
      },
    });
  }

  // Problem/solution pages, so a problem-phrased query ("email attachment too
  // large", "pdf too large") surfaces the /solve landing page that routes to the
  // right tool. Matched on the problem phrasing + label + keywords/tags, and
  // biased just below tools so tool-name queries still lead with the tool.
  for (const problem of PROBLEMS) {
    const problemKeywords = [...problem.keywords, ...problem.tags, problem.label];
    let rank = scoreText(q, {
      title: problem.problem,
      description: problem.intro,
      keywords: problemKeywords,
    });
    // Multi-word intent fallback: if every query word appears somewhere in the
    // problem's text, treat it as a (weaker) match. Lets reordered/natural
    // phrasings like "make my pdf smaller" or "reduce pdf file size" reach the
    // right /solve page even when that exact phrase isn't a listed keyword.
    if (rank === null) {
      const words = q.split(/[^a-z0-9]+/i).filter(Boolean);
      if (words.length > 1) {
        const haystack = [problem.problem, problem.intro, ...problemKeywords]
          .join(" ")
          .toLowerCase();
        if (words.every((w) => haystack.includes(w))) {
          rank = RANK.descriptionIncludes + 0.5;
        }
      }
    }
    if (rank === null) continue;
    scored.push({
      rank: rank + 0.25,
      result: {
        kind: "article",
        slug: problem.slug,
        title: problem.problem,
        description: problem.intro,
        href: ROUTES.solveProblem(problem.slug),
        icon: problem.icon,
      },
    });
  }

  // Glossary terms, so a definitional query ("what is webp", "svg meaning")
  // surfaces the /glossary page. Matched on the term, its aliases and keywords;
  // biased below tools + problems so it never outranks an actual tool/fix.
  for (const term of GLOSSARY) {
    const rank = scoreText(q, {
      title: term.term,
      description: term.definition,
      keywords: [...(term.aliases ?? []), ...term.keywords, `what is ${term.term}`],
    });
    if (rank === null) continue;
    scored.push({
      rank: rank + 0.4,
      result: {
        kind: "article",
        slug: term.slug,
        title: `What is ${term.term}?`,
        description: term.definition,
        href: ROUTES.glossaryTerm(term.slug),
        icon: term.icon,
      },
    });
  }

  // "For [context]" pages, so "image size for shopify" / "linkedin banner"
  // surfaces the destination guide. Matched on the destination + keywords.
  for (const ctx of CONTEXT_PAGES) {
    const rank = scoreText(q, {
      title: `${ctx.h1} (${ctx.destination})`,
      description: ctx.intro,
      keywords: [...ctx.keywords, ctx.destination, ctx.label],
    });
    if (rank === null) continue;
    scored.push({
      rank: rank + 0.35,
      result: {
        kind: "article",
        slug: ctx.slug,
        title: ctx.h1,
        description: ctx.intro,
        href: ROUTES.forContext(ctx.slug),
        icon: ctx.icon,
      },
    });
  }

  return scored
    .sort((a, b) => a.rank - b.rank || a.result.title.localeCompare(b.result.title))
    .slice(0, limit)
    .map((s) => s.result);
}

/**
 * Autocomplete suggestions, a de-duplicated list of matching titles/names for
 * the query, useful for a suggestion dropdown.
 */
export function getSearchSuggestions(query: string, limit = DEFAULT_LIMIT): string[] {
  const q = normalizeQuery(query);
  if (!q) return [];

  const seen = new Set<string>();
  const suggestions: string[] = [];

  for (const result of searchAll(query, limit * 2)) {
    const key = result.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(result.title);
    if (suggestions.length >= limit) break;
  }

  return suggestions;
}

/* ────────────────────────────────────────────────────────────────────────────
 * INTENT-AWARE, FILTERABLE TOOL SEARCH
 * ──────────────────────────────────────────────────────────────────────────── */

/** Filters that narrow an intent-aware search. All optional (AND-combined). */
export interface SearchFilters {
  /** Restrict to a category slug (e.g. "image-tools"). */
  category?: string;
  /** Restrict to tools that touch this file type (e.g. "png", "pdf"). */
  fileType?: string;
  /**
   * Restrict to a use-case/audience by matching that use-case's tool set.
   * Accepts a use-case slug (e.g. "for-developers") or audience key
   * (e.g. "developers"). Resolved lazily to avoid a hard discovery import.
   */
  useCase?: string;
}

/** A ranked tool hit from `searchTools`. */
export interface ToolSearchResult extends SearchResult {
  kind: "tool";
  /** Lower is better; exposed so callers can merge/sort across sources. */
  score: number;
}

/** Memoised slim index: built once per module load, reused every query. */
let INDEX: SearchIndexEntry[] | null = null;
function index(): SearchIndexEntry[] {
  return (INDEX ??= buildSearchIndex());
}

/** Split a string into lower-case alphanumeric tokens. */
function terms(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean);
}

/**
 * Cheap subsequence fuzzy test: are all of `needle`'s characters present in
 * `hay`, in order? Catches typos/omissions like "compres" → "compress".
 */
function isSubsequence(needle: string, hay: string): boolean {
  if (needle.length === 0) return true;
  let i = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) {
    if (hay[j] === needle[i]) i++;
  }
  return i === needle.length;
}

/** Expand a query token with its intent synonyms (self included). */
function expandTerm(token: string): string[] {
  const extra = INTENT_SYNONYMS[token];
  return extra ? [token, ...extra] : [token];
}

/**
 * Score one index entry against the (already tokenised, synonym-expanded)
 * query. Returns a match score where LOWER is better, or null for no match.
 */
function scoreEntry(entry: SearchIndexEntry, queryTerms: string[]): number | null {
  const title = entry.title.toLowerCase();
  const description = entry.description.toLowerCase();
  const keywordText = entry.keywords.join(" ").toLowerCase();
  const fileTypeText = entry.fileTypes.join(" ").toLowerCase();
  const titleTerms = terms(entry.title);

  let best = Number.POSITIVE_INFINITY;
  let matchedAny = false;

  for (const raw of queryTerms) {
    // Expand each query term to its synonym set; take the term's best hit.
    let termScore: number | null = null;
    for (const t of expandTerm(raw)) {
      let s: number | null = null;
      if (title.startsWith(t)) s = 0;
      else if (titleTerms.some((w) => w.startsWith(t))) s = 1;
      else if (title.includes(t)) s = 2;
      else if (fileTypeText.split(" ").includes(t)) s = 2.5;
      else if (keywordText.includes(t)) s = 3;
      else if (description.includes(t)) s = 4;
      else if (t.length >= 4 && isSubsequence(t, title)) s = 5; // fuzzy
      else if (t.length >= 4 && isSubsequence(t, keywordText)) s = 6; // fuzzy
      if (s !== null && (termScore === null || s < termScore)) termScore = s;
    }
    if (termScore !== null) {
      matchedAny = true;
      best = Math.min(best, termScore);
    }
  }

  return matchedAny ? best : null;
}

/**
 * Resolve a `useCase` filter (slug or audience key) to a set of tool slugs.
 * Imported lazily from discovery so this module stays lean when the filter is
 * unused. Returns null when it can't resolve (⇒ filter is ignored).
 */
function resolveUseCaseSlugs(useCase: string): Set<string> | null {
  const key = useCase.trim().toLowerCase();
  const match =
    getUseCaseBySlug(key) ??
    getUseCases().find((u) => u.audience.toLowerCase() === key);
  if (!match) return null;
  return new Set(match.toolSlugs);
}

/**
 * Intent-aware, filterable tool search over the slim index.
 *
 *  - Fuzzy: tolerates typos/omissions via subsequence matching.
 *  - Intent: expands synonyms so "compress" surfaces compress-pdf /
 *    image-compressor / video-compressor / audio-compressor, "png" surfaces
 *    every png tool, and "instagram" surfaces resize/crop/thumbnail/qr tools.
 *  - Filterable: narrow by category, fileType and/or useCase (AND-combined).
 *
 * With an empty query but active filters, returns the filtered set (title
 * order) so it doubles as a faceted browse. Deterministic; LOWER score = better.
 */
export function searchTools(
  query: string,
  filters: SearchFilters = {},
  limit = DEFAULT_LIMIT,
): ToolSearchResult[] {
  const q = query.trim().toLowerCase();

  const fileType = filters.fileType?.trim().toLowerCase().replace(/^\./, "");
  const category = filters.category?.trim().toLowerCase();
  const useCaseSlugs = filters.useCase ? resolveUseCaseSlugs(filters.useCase) : null;

  const passesFilters = (entry: SearchIndexEntry): boolean => {
    if (category && entry.category.toLowerCase() !== category) return false;
    if (fileType && !entry.fileTypes.includes(fileType)) return false;
    if (useCaseSlugs && !useCaseSlugs.has(entry.slug)) return false;
    return true;
  };

  const toResult = (entry: SearchIndexEntry, score: number): ToolSearchResult => ({
    kind: "tool",
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    href: entry.href,
    icon: entry.icon,
    category: entry.category,
    score,
  });

  // Empty query + filters ⇒ faceted browse.
  if (!q) {
    if (!category && !fileType && !useCaseSlugs) return [];
    return index()
      .filter(passesFilters)
      .slice(0, limit)
      .map((entry) => toResult(entry, 0));
  }

  const queryTerms = terms(q);
  const scored: { entry: SearchIndexEntry; score: number }[] = [];

  for (const entry of index()) {
    if (!passesFilters(entry)) continue;
    const score = scoreEntry(entry, queryTerms);
    if (score === null) continue;
    scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => a.score - b.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map(({ entry, score }) => toResult(entry, score));
}
