import type { Comparison, HowTo, Tool } from "@/types";
import { COMPARISONS } from "@/config/comparisons";
import { HOWTOS } from "@/config/howtos";
import { getToolBySlug, isLiveTool } from "@/lib/registry";

/**
 * The read layer over the long-form content config (config/comparisons/*,
 * config/howtos/*). Every /compare and /how-to route, card and piece of SEO
 * derives its data from these pure functions: add an entry to the config and
 * it appears everywhere automatically, exactly like the tool registry.
 *
 * Server-only: this pulls in the full content + tool registries. Never import
 * from a client component.
 */

/* ── Comparisons ──────────────────────────────────────────────────────────── */

/** All comparisons, in registry (authoring) order. */
export function getAllComparisons(): Comparison[] {
  return COMPARISONS;
}

/** Look up a single comparison by its slug. */
export function getComparisonBySlug(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

/** Every comparison slug, for `generateStaticParams` and the sitemap. */
export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}

/** Resolve a comparison's `relatedToolSlugs` to live Tool objects, in order. */
export function getComparisonTools(comparison: Comparison): Tool[] {
  return resolveTools(comparison.relatedToolSlugs);
}

/**
 * Related comparisons for cross-linking: explicit `relatedComparisonSlugs`
 * when set, otherwise the next few in registry order (wrapping around), never
 * including the comparison itself.
 */
export function getRelatedComparisons(comparison: Comparison, limit = 3): Comparison[] {
  if (comparison.relatedComparisonSlugs && comparison.relatedComparisonSlugs.length > 0) {
    return comparison.relatedComparisonSlugs
      .map((slug) => getComparisonBySlug(slug))
      .filter((c): c is Comparison => c !== undefined && c.slug !== comparison.slug)
      .slice(0, limit);
  }
  return neighbours(COMPARISONS, comparison.slug, limit);
}

/* ── How-to guides ────────────────────────────────────────────────────────── */

/** All how-to guides, in registry (authoring) order. */
export function getAllHowTos(): HowTo[] {
  return HOWTOS;
}

/** Look up a single how-to guide by its slug. */
export function getHowToBySlug(slug: string): HowTo | undefined {
  return HOWTOS.find((h) => h.slug === slug);
}

/** Every how-to slug: for `generateStaticParams` and the sitemap. */
export function getAllHowToSlugs(): string[] {
  return HOWTOS.map((h) => h.slug);
}

/** The primary tool a how-to guide teaches (its embedded-CTA target). */
export function getHowToTool(howto: HowTo): Tool | undefined {
  const tool = getToolBySlug(howto.toolSlug);
  return tool && isLiveTool(tool) ? tool : undefined;
}

/**
 * Related tools for a how-to: the guide's `relatedToolSlugs`, resolved to live
 * Tool objects and de-duplicated against the primary `toolSlug`.
 */
export function getHowToRelatedTools(howto: HowTo): Tool[] {
  return resolveTools(howto.relatedToolSlugs).filter((t) => t.slug !== howto.toolSlug);
}

/**
 * Related how-to guides for cross-linking: explicit `relatedHowToSlugs` when
 * set, otherwise the next few in registry order (wrapping around), never
 * including the guide itself.
 */
export function getRelatedHowTos(howto: HowTo, limit = 3): HowTo[] {
  if (howto.relatedHowToSlugs && howto.relatedHowToSlugs.length > 0) {
    return howto.relatedHowToSlugs
      .map((slug) => getHowToBySlug(slug))
      .filter((h): h is HowTo => h !== undefined && h.slug !== howto.slug)
      .slice(0, limit);
  }
  return neighbours(HOWTOS, howto.slug, limit);
}

/* ── Reverse lookups (tool → content) for topic-cluster cross-linking ─────── */

/**
 * Comparisons whose `relatedToolSlugs` include this tool slug, used to surface
 * "Related comparisons" on a tool page. Registry order, capped at `limit`.
 */
export function getComparisonsForTool(toolSlug: string, limit = 3): Comparison[] {
  return COMPARISONS.filter((c) => c.relatedToolSlugs.includes(toolSlug)).slice(0, limit);
}

/**
 * How-to guides that reference this tool, either as the primary `toolSlug`
 * they teach or in their `relatedToolSlugs`. Guides teaching the tool come
 * first. Registry order within each group, capped at `limit`.
 */
export function getHowTosForTool(toolSlug: string, limit = 3): HowTo[] {
  const primary = HOWTOS.filter((h) => h.toolSlug === toolSlug);
  const secondary = HOWTOS.filter(
    (h) => h.toolSlug !== toolSlug && h.relatedToolSlugs.includes(toolSlug),
  );
  return [...primary, ...secondary].slice(0, limit);
}

/* ── Internal helpers ─────────────────────────────────────────────────────── */

/** Resolve an ordered list of tool slugs to the live Tool objects that exist. */
function resolveTools(slugs: string[]): Tool[] {
  return slugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is Tool => t !== undefined && isLiveTool(t));
}

/** The `limit` entries following `slug` in a registry, wrapping around. */
function neighbours<T extends { slug: string }>(all: T[], slug: string, limit: number): T[] {
  const index = all.findIndex((item) => item.slug === slug);
  if (index === -1) return all.filter((item) => item.slug !== slug).slice(0, limit);
  return [...all.slice(index + 1), ...all.slice(0, index)]
    .filter((item) => item.slug !== slug)
    .slice(0, limit);
}
