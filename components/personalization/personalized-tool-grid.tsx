"use client";

import type { ToolCardData } from "@/types";
import { useMounted } from "@/hooks/use-mounted";
import { usePopularSlugs, useTrending } from "@/hooks/use-usage";
import { ToolGrid } from "@/components/shared/tool-grid";

export interface PersonalizedToolGridProps {
  /** Registry-free lookup of every live tool, built server-side. */
  lookup: Record<string, ToolCardData>;
  /** Editorial slug order shown on the server + to first-time visitors. */
  fallback: string[];
  /** Which usage signal orders the grid. */
  source: "popular" | "trending";
  limit?: number;
  columns?: 2 | 3 | 4;
}

/**
 * A tool grid that personalizes itself from the visitor's OWN local usage
 * (`lib/usage`), blended with an editorial fallback:
 *
 *   • Server render + first paint + new visitors → the editorial `fallback`
 *     order (deterministic, so there is no hydration mismatch or layout shift).
 *   • Returning visitors → their most-used / trending tools float to the front,
 *     padded with the editorial set to keep the grid full.
 *
 * Everything is local to the browser: nothing about behaviour is uploaded.
 * This is the privacy-first, static-export way to make Popular/Trending feel
 * alive per person instead of hardcoded.
 */
export function PersonalizedToolGrid({
  lookup,
  fallback,
  source,
  limit = 8,
  columns = 4,
}: PersonalizedToolGridProps) {
  const mounted = useMounted();
  // Pull a generous window of personalized slugs so we can dedupe + pad.
  const popular = usePopularSlugs("all", limit * 2);
  const trending = useTrending(limit * 2);
  const personalized = source === "popular" ? popular : trending.map((t) => t.slug);

  // Before mount, render exactly the server output (fallback). No mismatch.
  const orderedSlugs = mounted
    ? dedupe([...personalized, ...fallback]).slice(0, limit)
    : fallback.slice(0, limit);

  const tools = orderedSlugs
    .map((slug) => lookup[slug])
    .filter((t): t is ToolCardData => Boolean(t));

  return <ToolGrid tools={tools} columns={columns} />;
}

function dedupe(slugs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of slugs) {
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}
