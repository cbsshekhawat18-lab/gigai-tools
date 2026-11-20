"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  getPopularSlugs,
  getTrending,
  getUsageSummary,
  recordUsage,
  subscribeUsage,
  type PopularityWindow,
  type TrendingTool,
  type UsageEvent,
  type UsageSummary,
} from "@/lib/usage/store";

/**
 * React bindings for the local-first usage engine (`lib/usage/store`). Reads go
 * through `useSyncExternalStore`, so every component stays in sync across tabs
 * and hydration with no flicker: the server snapshot is always empty (nothing is
 * personalised until the client reads localStorage) and the client snapshot
 * updates the instant any usage event fires.
 */

/* ── Stable-snapshot plumbing (useSyncExternalStore requires referential
 *    stability when the underlying data is unchanged) ─────────────────────── */

const EMPTY_SLUGS: string[] = [];
const EMPTY_TRENDING: TrendingTool[] = [];
const EMPTY_SUMMARY: UsageSummary = {
  toolsUsed: 0,
  opens: 0,
  executions: 0,
  downloads: 0,
  shares: 0,
};

/** Cache the last value per cache-key so unchanged reads are referentially equal. */
const cache = new Map<string, { sig: string; value: unknown }>();

function stable<T>(cacheKey: string, read: () => T, empty: T): T {
  const value = read();
  const sig = JSON.stringify(value);
  const prev = cache.get(cacheKey);
  if (prev && prev.sig === sig) return prev.value as T;
  cache.set(cacheKey, { sig, value });
  // Avoid churn when the value is logically empty.
  return sig === JSON.stringify(empty) ? empty : value;
}

/** Most-used tools for this browser, highest first. Empty on the server. */
export function usePopularSlugs(
  window: PopularityWindow = "all",
  limit = 12,
): string[] {
  const key = `pop:${window}:${limit}`;
  const getSnapshot = useCallback(
    () => stable(key, () => getPopularSlugs(window, limit), EMPTY_SLUGS),
    [key, window, limit],
  );
  return useSyncExternalStore(subscribeUsage, getSnapshot, () => EMPTY_SLUGS);
}

/** Tools surging today vs their 30-day average. Empty on the server. */
export function useTrending(limit = 8): TrendingTool[] {
  const key = `trend:${limit}`;
  const getSnapshot = useCallback(
    () => stable(key, () => getTrending(limit), EMPTY_TRENDING),
    [key, limit],
  );
  return useSyncExternalStore(subscribeUsage, getSnapshot, () => EMPTY_TRENDING);
}

/** Aggregate lifetime stats for the workspace dashboard. */
export function useUsageSummary(): UsageSummary {
  const getSnapshot = useCallback(
    () => stable("summary", getUsageSummary, EMPTY_SUMMARY),
    [],
  );
  return useSyncExternalStore(subscribeUsage, getSnapshot, () => EMPTY_SUMMARY);
}

/** Stable callbacks a tool/tracker uses to record behaviour. */
export function useRecordUsage() {
  return {
    record: useCallback((slug: string, event: UsageEvent) => recordUsage(slug, event), []),
    open: useCallback((slug: string) => recordUsage(slug, "open"), []),
    exec: useCallback((slug: string) => recordUsage(slug, "exec"), []),
    download: useCallback((slug: string) => recordUsage(slug, "download"), []),
    share: useCallback((slug: string) => recordUsage(slug, "share"), []),
  };
}
