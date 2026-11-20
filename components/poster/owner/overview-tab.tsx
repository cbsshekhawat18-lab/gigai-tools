"use client";

import * as React from "react";

import { DashTable, Td, Th } from "@/components/devdash/shell";
import { Bars } from "@/components/devdash/sparkline";
import { posterApi } from "@/lib/poster/api";
import { bannerRows, dayBars, dayLabel, fillDays } from "@/lib/poster/stats";
import type { PageStats, PosterPage } from "@/lib/poster/types";
import { cn } from "@/lib/utils";

const RANGES: { id: PageStats["range"]; label: string }[] = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "all", label: "All time" },
];
const TILES: { key: keyof PageStats["totals"]; label: string }[] = [
  { key: "visit", label: "Visits" },
  { key: "download", label: "Posters downloaded" },
  { key: "share", label: "WhatsApp shares" },
  { key: "copy", label: "Link copies" },
];

/** Counters for a range, downloads per day, and which design gets used. */
export function OverviewTab({ page }: { page: PosterPage }) {
  const [range, setRange] = React.useState<PageStats["range"]>("7");
  const [stats, setStats] = React.useState<PageStats | null>(null);

  React.useEffect(() => {
    let alive = true;
    setStats(null);
    void posterApi.stats(page.id, range).then((r) => {
      if (alive && r.ok) setStats(r.data);
    });
    return () => {
      alive = false;
    };
  }, [page.id, range]);

  const days = stats ? fillDays(stats) : [];
  const first = days[0];
  const last = days[days.length - 1];
  const rows = stats ? bannerRows(stats, page) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded border border-border p-0.5" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              aria-pressed={range === r.id}
              className={cn("rounded px-3 py-1 text-sm", range === r.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {r.label}
            </button>
          ))}
        </div>
        {page.status !== "live" ? <p className="text-xs text-muted-foreground">Counting starts once the page is live.</p> : null}
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TILES.map((t) => (
          <div key={t.key} className="rounded border border-border bg-card p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {stats ? stats.totals[t.key] : <span className="inline-block h-7 w-12 animate-pulse rounded bg-muted" />}
            </dd>
          </div>
        ))}
      </dl>

      <div className="rounded border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Downloads per day</p>
        {stats ? (
          <Bars bars={dayBars(days)} label="Poster downloads per day" empty="No downloads in this range yet." width={640} height={96} />
        ) : (
          <div className="mt-1 h-24 animate-pulse rounded bg-muted" />
        )}
        {first && last ? (
          <p className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{dayLabel(first.day)}</span>
            <span>{dayLabel(last.day)}</span>
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Which design gets used</h3>
        {rows.length ? (
          <div className="mt-2">
            <DashTable head={<><Th>Design</Th><Th>Downloads</Th><Th>Shares</Th></>}>
              {rows.map((r) => (
                <tr key={r.banner_id}>
                  <Td>
                    <span className="flex items-center gap-3">
                      {r.preview_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.preview_url} alt="" className="h-12 w-10 rounded bg-muted object-cover" />
                      ) : (
                        <span className="h-12 w-10 rounded bg-muted" />
                      )}
                      <span>{r.index ? `Design ${r.index}` : "Deleted design"}</span>
                    </span>
                  </Td>
                  <Td className="tabular-nums">{r.downloads}</Td>
                  <Td className="tabular-nums">{r.shares}</Td>
                </tr>
              ))}
            </DashTable>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No designs yet.</p>
        )}
      </div>
    </div>
  );
}
