/**
 * Local-first SEARCH ANALYTICS, the search-side companion of the usage engine
 * (`lib/usage/store`). Purely local to this browser (localStorage): no server,
 * no cross-user tracking. Records what THIS visitor searches and whether the
 * search found anything, powering:
 *
 *   • "Popular searches" suggestions in the ⌘K empty state (their own habits);
 *  • a "searches that found nothing" list: a private signal for which tools
 *     this visitor wanted but didn't find (the spec's "most requested new
 *     tools", done locally).
 *
 * Typing noise is handled at record time: recording "json formatter" deletes
 * previously-recorded strict prefixes ("jso", "json", "json f…"), so settled
 * queries win over keystroke artifacts.
 */

export const SEARCH_STATS_KEY = "gt:search-stats" as const;
export const SEARCH_STATS_EVENT = "gt:search-stats" as const;

/** Minimum settled-query length worth recording. */
const MIN_LEN = 3;
/** Cap stored queries; least-recently-seen evicted first. */
const MAX_QUERIES = 120;

interface SearchStat {
  /** Times this query was searched. */
  n: number;
  /** Epoch ms of the most recent search. */
  last: number;
  /** Result count of the most recent search (0 = found nothing). */
  hits: number;
}

type StatsMap = Record<string, SearchStat>;

/* ── plumbing ────────────────────────────────────────────────────────────── */

function emit(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(SEARCH_STATS_EVENT));
  } catch {
    /* non-fatal */
  }
}

function read(): StatsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SEARCH_STATS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: StatsMap = {};
    for (const [q, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!q || !v || typeof v !== "object") continue;
      const s = v as Partial<SearchStat>;
      if (typeof s.n !== "number" || typeof s.last !== "number") continue;
      out[q] = { n: s.n, last: s.last, hits: typeof s.hits === "number" ? s.hits : 0 };
    }
    return out;
  } catch {
    return {};
  }
}

function write(map: StatsMap): void {
  if (typeof window === "undefined") return;
  try {
    const keys = Object.keys(map);
    if (keys.length > MAX_QUERIES) {
      keys
        .sort((a, b) => map[a]!.last - map[b]!.last)
        .slice(0, keys.length - MAX_QUERIES)
        .forEach((k) => delete map[k]);
    }
    window.localStorage.setItem(SEARCH_STATS_KEY, JSON.stringify(map));
    emit();
  } catch {
    /* quota / privacy mode, non-fatal */
  }
}

/* ── recording ───────────────────────────────────────────────────────────── */

/**
 * Record a settled search and how many results it found. Call from a DEBOUNCED
 * observer (the search surfaces already debounce input), not per keystroke.
 */
export function recordSearch(query: string, resultCount: number): void {
  const q = query.trim().toLowerCase();
  if (q.length < MIN_LEN) return;
  const map = read();
  // Sweep keystroke artifacts: strict prefixes of the settled query.
  for (const k of Object.keys(map)) {
    if (k !== q && q.startsWith(k)) delete map[k];
  }
  const prev = map[q];
  map[q] = {
    n: (prev?.n ?? 0) + 1,
    last: Date.now(),
    hits: Math.max(0, resultCount),
  };
  write(map);
}

/* ── reads ───────────────────────────────────────────────────────────────── */

export interface TopSearch {
  query: string;
  count: number;
}

/** This browser's most-repeated searches (that found results), top first. */
export function getTopSearches(limit = 6): TopSearch[] {
  const map = read();
  return Object.entries(map)
    .filter(([, s]) => s.hits > 0 && s.n >= 2)
    .sort((a, b) => b[1].n - a[1].n || b[1].last - a[1].last)
    .slice(0, limit)
    .map(([query, s]) => ({ query, count: s.n }));
}

/** Searches that found NOTHING, a private "missing tools" signal. */
export function getNoResultSearches(limit = 10): string[] {
  const map = read();
  return Object.entries(map)
    .filter(([, s]) => s.hits === 0)
    .sort((a, b) => b[1].last - a[1].last)
    .slice(0, limit)
    .map(([query]) => query);
}

export function clearSearchStats(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SEARCH_STATS_KEY);
    emit();
  } catch {
    /* non-fatal */
  }
}

export function subscribeSearchStats(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === SEARCH_STATS_KEY) handler();
  };
  window.addEventListener(SEARCH_STATS_EVENT, handler);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(SEARCH_STATS_EVENT, handler);
    window.removeEventListener("storage", onStorage);
  };
}
