import { describe, expect, it } from "vitest";

import { bannerRows, dayBars, dayLabel, fillDays } from "../stats";
import type { PageStats, PosterPage } from "../types";

const stats = (over: Partial<PageStats>): PageStats => ({
  range: "7",
  totals: { visit: 0, download: 0, share: 0, copy: 0 },
  by_day: [],
  by_banner: [],
  ...over,
});
const today = new Date("2026-09-09T13:00:00Z");

describe("fillDays", () => {
  it("returns exactly N zero-filled days ending today, keeping real rows", () => {
    const s = stats({ by_day: [{ day: "2026-09-07", visits: 5, downloads: 2, shares: 1, copies: 0 }] });
    const days = fillDays(s, today);
    expect(days.map((d) => d.day)).toEqual(["2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07", "2026-09-08", "2026-09-09"]);
    expect(days[4]).toMatchObject({ downloads: 2, visits: 5 });
    expect(days[6]).toMatchObject({ downloads: 0, visits: 0 });
  });
  it("all-time spans from the first active day to today and is empty with no data", () => {
    expect(fillDays(stats({ range: "all" }), today)).toEqual([]);
    const s = stats({ range: "all", by_day: [{ day: "2026-09-01", visits: 1, downloads: 1, shares: 0, copies: 0 }] });
    expect(fillDays(s, today)).toHaveLength(9);
  });
});

describe("dayBars / dayLabel", () => {
  it("plots downloads and explains every counter in the title", () => {
    const [bar] = dayBars([{ day: "2026-09-07", visits: 5, downloads: 2, shares: 1, copies: 3 }]);
    expect(bar).toMatchObject({ key: "2026-09-07", value: 2 });
    expect(bar?.title).toBe("7 Sept: 2 downloads · 5 visits · 1 shares · 3 link copies");
    expect(dayLabel("garbage")).toBe("garbage");
  });
});

describe("bannerRows", () => {
  it("keeps the page's design order, zero-fills, and trails deleted designs", () => {
    const page = { banners: [{ id: "b1", preview_url: "/1" }, { id: "b2", preview_url: "/2" }] } as unknown as PosterPage;
    const rows = bannerRows(stats({ by_banner: [{ banner_id: "b2", downloads: 4, shares: 1 }, { banner_id: "gone", downloads: 9, shares: 0 }] }), page);
    expect(rows.map((r) => [r.banner_id, r.index, r.downloads])).toEqual([["b1", 1, 0], ["b2", 2, 4], ["gone", 0, 9]]);
    expect(rows[2]?.preview_url).toBeNull();
  });
});
