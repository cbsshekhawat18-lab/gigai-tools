"use client";

import { useCallback, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  clearVitals,
  getVitalsSummary,
  subscribeVitals,
  type Rating,
  type VitalSummary,
} from "@/lib/vitals/store";

const EMPTY: VitalSummary[] = [];
let cache: { sig: string; value: VitalSummary[] } | null = null;
function snapshot(): VitalSummary[] {
  const value = getVitalsSummary();
  const sig = JSON.stringify(value);
  if (cache && cache.sig === sig) return cache.value;
  cache = { sig, value };
  return value.length === 0 ? EMPTY : value;
}

const RATING_STYLE: Record<Rating, string> = {
  good: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "needs-improvement":
    "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  poor: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const METRIC_LABEL: Record<string, string> = {
  LCP: "Load (LCP)",
  INP: "Responsiveness (INP)",
  CLS: "Stability (CLS)",
  TTFB: "Server (TTFB)",
};

function fmt(name: string, v: number): string {
  if (name === "CLS") return v.toFixed(3);
  return v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${Math.round(v)}ms`;
}

/**
 * "Performance on this device", real-user Core Web Vitals measured locally
 * (P75 of recent samples, Google thresholds). Hidden until at least one metric
 * has samples. Private: the data never leaves the browser.
 */
export function DeviceVitals() {
  const summary = useSyncExternalStore(subscribeVitals, snapshot, () => EMPTY);
  const clear = useCallback(() => clearVitals(), []);
  if (summary.length === 0) return null;

  return (
    <section aria-label="Performance on this device" className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Icon name="Gauge" size={18} className="text-primary" />
            Performance on this device
          </h2>
          <p className="text-sm text-muted-foreground">
            Real Core Web Vitals from your visits (P75): measured and stored locally.
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Clear
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((m) => (
          <div
            key={m.name}
            className={cn("flex flex-col gap-1 rounded-2xl border p-4", RATING_STYLE[m.rating])}
          >
            <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
              {METRIC_LABEL[m.name] ?? m.name}
            </span>
            <span className="text-xl font-bold tabular-nums">{fmt(m.name, m.p75)}</span>
            <span className="text-[11px] font-medium opacity-70">
              {m.samples} sample{m.samples === 1 ? "" : "s"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
