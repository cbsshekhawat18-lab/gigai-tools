"use client";

import type { ToolCardData } from "@/types";
import { Icon } from "@/lib/icons";
import { useRecommendedSlugs } from "@/hooks/use-recommendations";
import { ToolGrid } from "@/components/shared/tool-grid";

export interface RecommendedForYouProps {
  /** Registry-free lookup of every live tool, built server-side. */
  lookup: Record<string, ToolCardData>;
  limit?: number;
  columns?: 2 | 3 | 4;
  /** Heading (defaults to "Recommended for you"). */
  title?: string;
  description?: string;
}

/**
 * "Recommended for you", the next-best-tool rail, driven entirely by the
 * visitor's own local behaviour (see {@link useRecommendedSlugs}). It renders
 * NOTHING until there's enough history to make a confident suggestion, so a
 * first-time visitor never sees an empty or generic block. It simply appears
 * once the product has learned what they use. Private to this browser.
 */
export function RecommendedForYou({
  lookup,
  limit = 8,
  columns = 4,
  title = "Recommended for you",
  description = "Next tools to try, based on what you use, private to this device.",
}: RecommendedForYouProps) {
  const slugs = useRecommendedSlugs(lookup, limit);
  const tools = slugs
    .map((s) => lookup[s])
    .filter((t): t is ToolCardData => Boolean(t));

  if (tools.length < 4) return null;

  return (
    <section aria-label={title} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Icon name="Sparkles" size={18} className="text-primary" />
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ToolGrid tools={tools} columns={columns} />
    </section>
  );
}
