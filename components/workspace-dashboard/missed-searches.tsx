"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Icon } from "@/lib/icons";
import {
  getNoResultSearches,
  subscribeSearchStats,
} from "@/lib/usage/search-stats";

const EMPTY: string[] = [];
let cache: { sig: string; value: string[] } | null = null;
function snapshot(): string[] {
  const value = getNoResultSearches(8);
  const sig = JSON.stringify(value);
  if (cache && cache.sig === sig) return cache.value;
  cache = { sig, value };
  return value.length === 0 ? EMPTY : value;
}

/**
 * "Searches we couldn't answer": the queries this browser searched for and
 * got ZERO results (recorded by lib/usage/search-stats). A private demand
 * signal: what the platform is missing, in the user's own words. Hidden until
 * a no-result search exists; each row retries via problem-aware /search.
 * Private by design, the list never leaves the device.
 */
export function MissedSearches() {
  const misses = useSyncExternalStore(subscribeSearchStats, snapshot, () => EMPTY);
  if (misses.length === 0) return null;

  return (
    <section aria-label="Searches we couldn't answer" className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Icon name="SearchX" size={18} className="text-primary" />
          Searches we couldn&rsquo;t answer
        </h2>
        <p className="text-sm text-muted-foreground">
          Searches from this device that found nothing: try them again (search
          keeps improving), or tell us what you were after. Stored only in this
          browser.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {misses.map((q) => (
          <li key={q}>
            <Link
              href={`/search?q=${encodeURIComponent(q)}`}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="Search" size={13} className="text-muted-foreground" />
              <span className="max-w-[16rem] truncate">{q}</span>
              <Icon
                name="RotateCcw"
                size={12}
                className="text-muted-foreground transition-transform group-hover:-rotate-45"
              />
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="MessageCircle" size={13} className="text-primary" />
            Request a tool
          </Link>
        </li>
      </ul>
    </section>
  );
}
