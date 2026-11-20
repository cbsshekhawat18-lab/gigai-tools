import type { Category, Tool } from "@/types";
import { CATEGORIES } from "@/config/categories";
import { TOOLS } from "@/config/tools";

/**
 * The registry is the read layer over the static config (config/tools.ts,
 * config/categories.ts). Every route, card, listing and piece of SEO derives
 * its data from these pure functions. Add a tool to the config and it appears
 * everywhere automatically.
 */

/* ── Tools ────────────────────────────────────────────────────────────────── */

/**
 * THE live-status guard. A tool is only linkable when it's live, "coming-soon"
 * / "beta" entries have no built page, so any link to them 404s. Every place
 * that turns a tool slug into a link must filter through this.
 */
export function isLiveTool(tool: Pick<Tool, "status">): boolean {
  return (tool.status ?? "live") === "live";
}

/** All registered tools, in registry (authoring) order. */
export function getAllTools(): Tool[] {
  return TOOLS;
}

/** Look up a single tool by its slug. */
export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

/** All LIVE tools belonging to a category (by category slug), in registry order.
 *  "coming-soon" tools have no built page, so surfacing them in category grids /
 *  related rails / CTAs would produce 404 links. */
export function getToolsByCategory(categorySlug: string): Tool[] {
  return TOOLS.filter(
    (tool) => tool.category === categorySlug && isLiveTool(tool),
  );
}

/**
 * A category with fewer than this many LIVE tools is treated as thin: its page
 * still renders (no 404) but is noindexed and excluded from the sitemap. Guards
 * near-empty categories (e.g. a single-tool "AI" or "Business" bucket).
 */
export const CATEGORY_MIN_INDEXED = 3;

/** Featured LIVE tools (`featured: true`), optionally capped. */
export function getFeaturedTools(limit?: number): Tool[] {
  const featured = TOOLS.filter((tool) => tool.featured && isLiveTool(tool));
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

/** Popular LIVE tools (`popular: true`), optionally capped. */
export function getPopularTools(limit?: number): Tool[] {
  const popular = TOOLS.filter((tool) => tool.popular && isLiveTool(tool));
  return typeof limit === "number" ? popular.slice(0, limit) : popular;
}

/**
 * Most recently added LIVE tools, newest first (sorted by `createdAt` desc).
 * Tools without a date sort last but are still included.
 */
export function getRecentTools(limit?: number): Tool[] {
  const sorted = TOOLS.filter(isLiveTool).sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
    return bTime - aTime;
  });
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

/**
 * Related tools for a given tool:
 *  1. If the tool declares `relatedTools` slugs, resolve those (in order).
 *  2. Otherwise fall back to same-category siblings, excluding the tool itself.
 */
export function getRelatedTools(tool: Tool, limit = 6): Tool[] {
  let related: Tool[];

  if (tool.relatedTools && tool.relatedTools.length > 0) {
    related = tool.relatedTools
      .map((slug) => getToolBySlug(slug))
      .filter((t): t is Tool => t !== undefined && t.slug !== tool.slug && isLiveTool(t));
  } else {
    related = TOOLS.filter(
      (t) => t.category === tool.category && t.slug !== tool.slug && isLiveTool(t),
    );
  }

  return related.slice(0, limit);
}

/** Number of LIVE tools (excludes coming-soon / beta placeholders). */
export function getTotalToolCount(): number {
  return TOOLS.filter(isLiveTool).length;
}

/**
 * The count we ADVERTISE in copy, rounded down to the nearest ten, "260+".
 *
 * Rounding down matters: the claim stays true between releases as tools are
 * added, and it can never overstate the library. Every marketing string that
 * quotes a number must come from here; a test asserts they all agree, because
 * the site previously drifted to saying 240+, 248, 249 and 250+ in five
 * different places at once.
 */
export function advertisedToolCount(): string {
  return `${Math.floor(getTotalToolCount() / 10) * 10}+`;
}

/* ── Categories ───────────────────────────────────────────────────────────── */

/** All categories, in config order. */
export function getAllCategories(): Category[] {
  return CATEGORIES;
}

/**
 * Categories that are allowed to be linked and indexed: at least
 * CATEGORY_MIN_INDEXED live tools. Every navigation surface (homepage grid,
 * header/footer nav, /about, /learn, 404) must list categories through this,
 * so an empty or near-empty category can never be reachable by a link even if
 * someone forgets it exists. The category page itself stays rendered (no 404)
 * but noindexes and drops out of the sitemap via the same threshold.
 */
export function getIndexableCategories(): Category[] {
  return CATEGORIES.filter(
    (category) => getToolsByCategory(category.slug).length >= CATEGORY_MIN_INDEXED,
  );
}

/** Number of categories that contain at least one live tool. */
export function getLiveCategoryCount(): number {
  return CATEGORIES.filter((c) =>
    TOOLS.some((t) => t.category === c.slug && isLiveTool(t)),
  ).length;
}

/** Look up a single category by its slug. */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

/** How many tools belong to a category. */
export function getToolCountByCategory(categorySlug: string): number {
  return getToolsByCategory(categorySlug).length;
}
