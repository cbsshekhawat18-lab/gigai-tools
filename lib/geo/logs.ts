/**
 * GigAI GEO engine: AI crawler log analysis.
 *
 * Parses web-server access logs (nginx/Apache "combined" and "common" formats)
 * ENTIRELY in the browser and reports which AI crawlers actually visited,
 * when, and what they fetched. The client-only architecture is not marketing
 * here: access logs contain visitor IP addresses, so they must never be
 * uploaded anywhere — and this parser never even RETAINS the IP column.
 *
 * Pure functions, line-streaming, no network.
 */

import { AI_CRAWLERS, crawlerForUserAgent, type AiCrawler } from "./crawlers";

export interface BotStats {
  crawler: AiCrawler;
  hits: number;
  firstSeen?: Date;
  lastSeen?: Date;
  /** path → hit count, capped to the busiest paths. */
  topPaths: { path: string; hits: number }[];
  /** HTTP status → count (did the bot actually get content?). */
  statuses: Record<string, number>;
  /** ISO day (yyyy-mm-dd) → hits, for the trend view. */
  byDay: Record<string, number>;
}

export interface LogReport {
  totalLines: number;
  parsedLines: number;
  /** Lines that belonged to any AI crawler. */
  aiHits: number;
  bots: BotStats[];
  /** Date range covered by the log. */
  from?: Date;
  to?: Date;
  /** Bots from the directory that never appeared. */
  neverSeen: AiCrawler[];
  /** Paths (from an optional site URL list) that NO AI crawler ever fetched. */
  neverFetched?: string[];
}

/**
 * Combined/common log format:
 * ip - user [10/Oct/2024:13:55:36 +0000] "GET /path HTTP/1.1" 200 2326 "referer" "user-agent"
 * The IP is matched but deliberately discarded, never stored, never shown.
 */
const LOG_LINE =
  /^\S+ \S+ \S+ \[([^\]]+)\] "(\S+) (\S+)[^"]*" (\d{3}) \S+(?: "[^"]*" "([^"]*)")?/;

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/** Parse the CLF timestamp `10/Oct/2024:13:55:36 +0000`. */
function parseClfDate(s: string): Date | undefined {
  const m = s.match(/^(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})/);
  if (!m) return undefined;
  const month = MONTHS[m[2] ?? ""];
  if (month === undefined) return undefined;
  return new Date(Date.UTC(Number(m[3]), month, Number(m[1]), Number(m[4]), Number(m[5]), Number(m[6])));
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Analyze a raw access-log text. `siteUrls` (optional) enables never-fetched. */
export function analyzeAccessLog(text: string, siteUrls?: string[]): LogReport {
  const stats = new Map<string, BotStats & { pathCounts: Map<string, number> }>();
  const fetchedPaths = new Set<string>();
  let totalLines = 0;
  let parsedLines = 0;
  let aiHits = 0;
  let from: Date | undefined;
  let to: Date | undefined;

  let start = 0;
  const len = text.length;
  while (start < len) {
    let end = text.indexOf("\n", start);
    if (end === -1) end = len;
    const line = text.slice(start, end);
    start = end + 1;
    if (!line.trim()) continue;
    totalLines++;

    const m = line.match(LOG_LINE);
    if (!m) continue;
    parsedLines++;
    const [, dateStr, , rawPath, status, ua] = m;
    if (!ua || !status) continue;

    const date = dateStr ? parseClfDate(dateStr) : undefined;
    if (date) {
      if (!from || date < from) from = date;
      if (!to || date > to) to = date;
    }

    const crawler = crawlerForUserAgent(ua);
    if (!crawler) continue;
    aiHits++;

    const path = (rawPath ?? "").split("?")[0] || "/";
    fetchedPaths.add(path);

    let s = stats.get(crawler.id);
    if (!s) {
      s = {
        crawler,
        hits: 0,
        topPaths: [],
        statuses: {},
        byDay: {},
        pathCounts: new Map(),
      };
      stats.set(crawler.id, s);
    }
    s.hits++;
    if (date) {
      if (!s.firstSeen || date < s.firstSeen) s.firstSeen = date;
      if (!s.lastSeen || date > s.lastSeen) s.lastSeen = date;
      const day = isoDay(date);
      s.byDay[day] = (s.byDay[day] ?? 0) + 1;
    }
    s.statuses[status] = (s.statuses[status] ?? 0) + 1;
    s.pathCounts.set(path, (s.pathCounts.get(path) ?? 0) + 1);
  }

  const bots: BotStats[] = Array.from(stats.values())
    .map((s) => ({
      crawler: s.crawler,
      hits: s.hits,
      firstSeen: s.firstSeen,
      lastSeen: s.lastSeen,
      statuses: s.statuses,
      byDay: s.byDay,
      topPaths: Array.from(s.pathCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, hits]) => ({ path, hits })),
    }))
    .sort((a, b) => b.hits - a.hits);

  const seenIds = new Set(bots.map((b) => b.crawler.id));
  const neverSeen = AI_CRAWLERS.filter((c) => c.role !== "control-token" && !seenIds.has(c.id));

  let neverFetched: string[] | undefined;
  if (siteUrls && siteUrls.length) {
    neverFetched = [];
    for (const u of siteUrls) {
      let path = u.trim();
      try {
        if (/^https?:\/\//i.test(path)) path = new URL(path).pathname;
      } catch {
        continue;
      }
      if (!path.startsWith("/")) path = `/${path}`;
      if (!fetchedPaths.has(path) && !fetchedPaths.has(path.replace(/\/$/, "")) && !fetchedPaths.has(`${path}/`)) {
        neverFetched.push(path);
      }
    }
  }

  return { totalLines, parsedLines, aiHits, bots, from, to, neverSeen, neverFetched };
}
