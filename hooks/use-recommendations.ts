"use client";

import { useMemo } from "react";

import type { ToolCardData } from "@/types";
import { useMounted } from "@/hooks/use-mounted";
import { useFavorites, usePinned, useRecentTools } from "@/hooks/use-personalization";
import { usePopularSlugs } from "@/hooks/use-usage";

/**
 * Local-first "recommend the next best tool" signal.
 *
 * Everything is derived from THIS browser's behaviour (usage engine +
 * favorites/pins/recent) — no server, no cross-user data. The heuristic is
 * category affinity: the tools you actually use reveal which categories you
 * care about, so we surface tools from those same categories that you HAVEN'T
 * opened yet, ranked by that affinity plus editorial signals (`popular`/`isNew`).
 *
 * This is exactly the spec's intent — e.g. using Image Resizer (an image
 * tool) recommends Compress / Crop / WebP — without a hand-maintained map.
 *
 * Returns `[]` until mounted and until there's enough history to be useful, so
 * the calling section hides itself for first-time visitors (no empty state).
 */
export function useRecommendedSlugs(
  lookup: Record<string, ToolCardData>,
  limit = 8,
): string[] {
  const mounted = useMounted();
  const topUsed = usePopularSlugs("all", 30);
  const { slugs: favorites } = useFavorites();
  const { slugs: pinned } = usePinned();
  const { slugs: recent } = useRecentTools();

  return useMemo(() => {
    if (!mounted) return [];
    const used = new Set<string>([...topUsed, ...favorites, ...pinned, ...recent]);
    if (used.size === 0) return [];

    // Weight each category by how strongly the visitor engages with it.
    const catWeight = new Map<string, number>();
    const bump = (slug: string, w: number) => {
      const cat = lookup[slug]?.category;
      if (cat) catWeight.set(cat, (catWeight.get(cat) ?? 0) + w);
    };
    topUsed.forEach((s, i) => bump(s, 30 - i)); // most-used weigh most
    pinned.forEach((s) => bump(s, 6));
    favorites.forEach((s) => bump(s, 5));
    recent.forEach((s, i) => bump(s, Math.max(8 - i, 1)));

    // Score every UNUSED tool by its category affinity + editorial signals.
    const scored: Array<[string, number]> = [];
    for (const [slug, tool] of Object.entries(lookup)) {
      if (used.has(slug)) continue;
      const affinity = catWeight.get(tool.category) ?? 0;
      if (affinity <= 0) continue; // only recommend within engaged categories
      scored.push([slug, affinity + (tool.popular ? 2 : 0) + (tool.isNew ? 1 : 0)]);
    }
    scored.sort((a, b) => b[1] - a[1]);
    return scored.slice(0, limit).map(([slug]) => slug);
  }, [mounted, topUsed, favorites, pinned, recent, lookup, limit]);
}
