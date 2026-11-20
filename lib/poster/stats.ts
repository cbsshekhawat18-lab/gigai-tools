import type { PageStats, PosterPage } from "./types";

type Day = PageStats["by_day"][number];

const ZERO = { visits: 0, downloads: 0, shares: 0, copies: 0 };

const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

/** Every day in the range, oldest first, zero-filled where nothing happened (the API only returns active days). */
export function fillDays(stats: PageStats, today: Date = new Date()): Day[] {
  const have = new Map(stats.by_day.map((d) => [d.day, d]));
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  let count: number;
  if (stats.range === "all") {
    const first = stats.by_day[0]?.day;
    count = first ? Math.min(365, Math.round((end.getTime() - Date.parse(`${first}T00:00:00Z`)) / 86_400_000) + 1) : 0;
  } else {
    count = Number(stats.range);
  }
  const out: Day[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const day = isoDay(new Date(end.getTime() - i * 86_400_000));
    out.push(have.get(day) ?? { day, ...ZERO });
  }
  return out;
}

/** "9 Sep" from "2026-09-09". */
export function dayLabel(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? day : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export interface Bar {
  key: string;
  value: number;
  title: string;
}

/** Downloads per day as chart bars; the tooltip carries every counter for that day. */
export function dayBars(days: Day[]): Bar[] {
  return days.map((d) => ({
    key: d.day,
    value: d.downloads,
    title: `${dayLabel(d.day)}: ${d.downloads} downloads · ${d.visits} visits · ${d.shares} shares · ${d.copies} link copies`,
  }));
}

export interface BannerRow {
  banner_id: string;
  index: number; // 1-based position in the page; 0 = design since deleted
  preview_url: string | null;
  downloads: number;
  shares: number;
}

/** Per-design rows in the page's order; deleted designs that still hold counters trail with no thumbnail. */
export function bannerRows(stats: PageStats, page: PosterPage): BannerRow[] {
  const counts = new Map(stats.by_banner.map((b) => [b.banner_id, b]));
  const rows: BannerRow[] = page.banners.map((b, i) => ({
    banner_id: b.id,
    index: i + 1,
    preview_url: b.preview_url,
    downloads: counts.get(b.id)?.downloads ?? 0,
    shares: counts.get(b.id)?.shares ?? 0,
  }));
  const known = new Set(page.banners.map((b) => b.id));
  for (const b of stats.by_banner) {
    if (!known.has(b.banner_id)) rows.push({ banner_id: b.banner_id, index: 0, preview_url: null, downloads: b.downloads, shares: b.shares });
  }
  return rows;
}
