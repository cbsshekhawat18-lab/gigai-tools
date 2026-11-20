/**
 * GigAI Tools, local-first USAGE ENGINE.
 *
 * The foundation of the dynamic, personalized product experience. Like
 * `lib/personalization` this is *purely local* to the visitor's browser
 * (localStorage). No account, no server, no cross-user tracking. It records
 * what THIS browser does (tool opens, executions, downloads, shares) and turns
 * that into two behavioural signals used across the homepage, workspace and
 * recommendations:
 *
 *  • Popularity: a weighted score (opens 30% · executions 40% · downloads
 *                   20% · shares 5% · favorite 5%) over a time window.
 *  • Trending: sudden growth: today's activity vs the 30-day daily average.
 *
 * Because the platform is a static export there is no cross-user analytics; each
 * visitor's homepage is personalised from *their own* history, and editorial
 * fallbacks (registry `popular`/`isNew` flags) cover a fresh browser. This is
 * the privacy-first architecture: nothing about behaviour ever leaves the device.
 *
 * Storage is compact and self-pruning: per-tool lifetime totals + a rolling
 * 35-day window of per-day counts, capped to the most-recently-active tools.
 * Safe to import from server and client bundles (every call guards `window`).
 */

import { isFavorite } from "@/lib/personalization";

/* ── Storage + tuning ────────────────────────────────────────────────────── */

export const USAGE_KEY = "gt:usage" as const;
export const USAGE_EVENT = "gt:usage" as const;

/** Events we count. Index into the `Counts` tuple below. */
export type UsageEvent = "open" | "exec" | "download" | "share";
const EVENT_INDEX: Record<UsageEvent, 0 | 1 | 2 | 3> = {
  open: 0,
  exec: 1,
  download: 2,
  share: 3,
};

/** [opens, executions, downloads, shares]. */
type Counts = [number, number, number, number];

interface ToolStat {
  /** Lifetime totals (never pruned), powers "All time" popularity. */
  t: Counts;
  /** Per-day counts, keyed YYYYMMDD, retained for `DAY_WINDOW` days. */
  d: Record<string, Counts>;
  /** Epoch ms of last activity (for capping least-recent tools). */
  last: number;
}

type UsageMap = Record<string, ToolStat>;

/** Popularity weights (sum to 1). Mirrors the product spec. */
const W = { open: 0.3, exec: 0.4, download: 0.2, share: 0.05, favorite: 0.05 };

/** Rolling window of per-day data kept in storage. */
const DAY_WINDOW = 35;
/** Cap tracked tools so storage stays bounded (drop least-recently-active). */
const MAX_TOOLS = 300;

export type PopularityWindow = "today" | "week" | "month" | "all";

/* ── Date helpers (local calendar day) ───────────────────────────────────── */

function dayKey(d = new Date()): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** The last `n` day keys, newest first (index 0 = today). */
function recentDayKeys(n: number): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}

function zero(): Counts {
  return [0, 0, 0, 0];
}
function addInto(a: Counts, b: Counts | undefined): Counts {
  if (!b) return a;
  a[0] += b[0];
  a[1] += b[1];
  a[2] += b[2];
  a[3] += b[3];
  return a;
}
function sum(c: Counts): number {
  return c[0] + c[1] + c[2] + c[3];
}

/* ── Event plumbing (mirrors personalization) ────────────────────────────── */

function emit(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(USAGE_EVENT));
  } catch {
    /* non-fatal */
  }
}

/* ── Low-level read/write (malformed/quota tolerant) ─────────────────────── */

function isCounts(v: unknown): v is Counts {
  return (
    Array.isArray(v) &&
    v.length === 4 &&
    v.every((n) => typeof n === "number" && Number.isFinite(n))
  );
}

function read(): UsageMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(USAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: UsageMap = {};
    for (const [slug, val] of Object.entries(parsed as Record<string, unknown>)) {
      if (!slug || !val || typeof val !== "object") continue;
      const v = val as Partial<ToolStat>;
      if (!isCounts(v.t)) continue;
      const days: Record<string, Counts> = {};
      if (v.d && typeof v.d === "object") {
        for (const [dk, dc] of Object.entries(v.d)) {
          if (isCounts(dc)) days[dk] = dc;
        }
      }
      out[slug] = {
        t: v.t,
        d: days,
        last: typeof v.last === "number" ? v.last : 0,
      };
    }
    return out;
  } catch {
    return {};
  }
}

/** Drop expired day buckets and, if over cap, the least-recently-active tools. */
function prune(map: UsageMap): UsageMap {
  const keep = new Set(recentDayKeys(DAY_WINDOW));
  for (const stat of Object.values(map)) {
    for (const dk of Object.keys(stat.d)) {
      if (!keep.has(dk)) delete stat.d[dk];
    }
  }
  const slugs = Object.keys(map);
  if (slugs.length > MAX_TOOLS) {
    slugs
      .sort((a, b) => (map[a]!.last ?? 0) - (map[b]!.last ?? 0))
      .slice(0, slugs.length - MAX_TOOLS)
      .forEach((s) => delete map[s]);
  }
  return map;
}

function write(map: UsageMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USAGE_KEY, JSON.stringify(prune(map)));
    emit();
  } catch {
    /* storage unavailable / quota, non-fatal */
  }
}

/* ── Recording ───────────────────────────────────────────────────────────── */

/** Record one usage event for a tool. The atom every tracker calls. */
export function recordUsage(slug: string, event: UsageEvent, count = 1): void {
  const s = slug.trim();
  if (!s || count <= 0) return;
  const map = read();
  const stat: ToolStat = map[s] ?? { t: zero(), d: {}, last: 0 };
  const i = EVENT_INDEX[event];
  const dk = dayKey();
  const day: Counts = stat.d[dk] ?? zero();
  day[i] += count;
  stat.d[dk] = day;
  stat.t[i] += count;
  stat.last = Date.now();
  map[s] = stat;
  write(map);
}

export const recordOpen = (slug: string) => recordUsage(slug, "open");
export const recordExecution = (slug: string) => recordUsage(slug, "exec");
export const recordDownload = (slug: string) => recordUsage(slug, "download");
export const recordShare = (slug: string) => recordUsage(slug, "share");

/* ── Scoring ─────────────────────────────────────────────────────────────── */

function weightedScore(c: Counts, fav: boolean): number {
  return (
    c[0] * W.open +
    c[1] * W.exec +
    c[2] * W.download +
    c[3] * W.share +
    (fav ? W.favorite : 0)
  );
}

/** Counts for a tool within a popularity window. */
function windowCounts(stat: ToolStat, window: PopularityWindow): Counts {
  if (window === "all") return stat.t;
  const days = window === "today" ? 1 : window === "week" ? 7 : 30;
  const acc = zero();
  for (const dk of recentDayKeys(days)) addInto(acc, stat.d[dk]);
  return acc;
}

export interface ScoredTool {
  slug: string;
  score: number;
}

/** Most-used tools for this browser in `window`, highest score first. */
export function getPopular(
  window: PopularityWindow = "all",
  limit = 12,
): ScoredTool[] {
  const map = read();
  const scored: ScoredTool[] = [];
  for (const [slug, stat] of Object.entries(map)) {
    const score = weightedScore(windowCounts(stat, window), isFavorite(slug));
    if (score > 0) scored.push({ slug, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/** Just the slugs, for the common case. */
export function getPopularSlugs(
  window: PopularityWindow = "all",
  limit = 12,
): string[] {
  return getPopular(window, limit).map((s) => s.slug);
}

export interface TrendingTool {
  slug: string;
  /** Growth of today's activity vs the 30-day daily average, as a percentage. */
  growth: number;
}

/**
 * Tools whose usage TODAY is surging vs their own 30-day average. This is
 * deliberately different from popularity: a rarely-used tool opened a lot today
 * trends; an always-popular tool with flat usage does not.
 */
export function getTrending(limit = 8): TrendingTool[] {
  const map = read();
  const monthKeys = recentDayKeys(30);
  const todayK = dayKey();
  const out: TrendingTool[] = [];
  for (const [slug, stat] of Object.entries(map)) {
    const today = sum(stat.d[todayK] ?? zero());
    if (today < 1) continue;
    let total30 = 0;
    for (const dk of monthKeys) total30 += sum(stat.d[dk] ?? zero());
    // Average over the prior 30 days (exclude today so a first-use spikes).
    const avgPrior = Math.max((total30 - today) / 29, 0.25);
    const growth = (today / avgPrior - 1) * 100;
    if (growth > 0) out.push({ slug, growth: Math.round(growth) });
  }
  out.sort((a, b) => b.growth - a.growth);
  return out.slice(0, limit);
}

/* ── Aggregate stats (for the workspace dashboard) ───────────────────────── */

export interface UsageSummary {
  toolsUsed: number;
  opens: number;
  executions: number;
  downloads: number;
  shares: number;
}

export function getUsageSummary(): UsageSummary {
  const map = read();
  const total = zero();
  let toolsUsed = 0;
  for (const stat of Object.values(map)) {
    if (sum(stat.t) > 0) toolsUsed++;
    addInto(total, stat.t);
  }
  return {
    toolsUsed,
    opens: total[0],
    executions: total[1],
    downloads: total[2],
    shares: total[3],
  };
}

/** Lifetime counts for a single tool, or all zeros. */
export function getToolCounts(slug: string): Counts {
  return read()[slug.trim()]?.t ?? zero();
}

export function clearUsage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(USAGE_KEY);
    emit();
  } catch {
    /* non-fatal */
  }
}

/** Export the raw usage map (for the workspace "export my data" control). */
export function exportUsage(): UsageMap {
  return read();
}

/* ── Subscription (for hooks/use-usage) ──────────────────────────────────── */

export function subscribeUsage(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onLocal = () => handler();
  const onStorage = (e: StorageEvent) => {
    if (e.key === USAGE_KEY) handler();
  };
  window.addEventListener(USAGE_EVENT, onLocal);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(USAGE_EVENT, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}
