import type { AccentKey, IconName } from "@/types";
import { CATEGORIES } from "@/config/categories";
import { ROUTES } from "@/config/constants";
import {
  getPopularTools,
  getRecentTools,
  getToolBySlug,
  getToolsByCategory,
  isLiveTool, CATEGORY_MIN_INDEXED } from "@/lib/registry";

/**
 * Slim navigation data, computed on the SERVER (this module imports the full
 * registry) and passed as plain props into the client `<Header>` / `<Footer>`.
 *
 * CRITICAL (CWV): client layout components must NEVER import `@/lib/registry`,
 * `@/lib/search` or `@/config/tools`, or they'd bundle all ~249 tool configs.
 * This builder is the boundary: it reduces the registry to tiny, serialisable
 * arrays (slug/title/icon/href only) so the header/footer stay lightweight.
 */

/** A single tool link, stripped to only what the nav needs to render. */
export interface NavTool {
  slug: string;
  title: string;
  icon: IconName;
  href: string;
}

/** A category with its icon, live count and a handful of top tools. */
export interface NavCategory {
  slug: string;
  name: string;
  description: string;
  icon: IconName;
  accent: AccentKey;
  href: string;
  count: number;
  /** Top tools to spotlight (popular slugs first, then registry order). */
  tools: NavTool[];
}

/** Everything the header + footer need, all slim and static-serialisable. */
export interface NavData {
  categories: NavCategory[];
  popular: NavTool[];
  recent: NavTool[];
  totalTools: number;
}

function toNavTool(tool: {
  slug: string;
  title: string;
  icon: IconName;
}): NavTool {
  return {
    slug: tool.slug,
    title: tool.title,
    icon: tool.icon,
    href: ROUTES.tool(tool.slug),
  };
}

/**
 * ALL live tools for a category, ordered curated-popular-first (from
 * `popularSlugs`, de-duplicated + validated) then the remaining live tools in
 * registry order. `buildNavData` truncates this for the nav (see below);
 * `count` always reports the full length so the numbers stay honest.
 */
function liveToolsForCategory(categorySlug: string): NavTool[] {
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  const seen = new Set<string>();
  const out: NavTool[] = [];

  for (const slug of category?.popularSlugs ?? []) {
    if (seen.has(slug)) continue;
    const tool = getToolBySlug(slug);
    if (tool && tool.category === categorySlug && isLiveTool(tool)) {
      seen.add(slug);
      out.push(toNavTool(tool));
    }
  }

  for (const tool of getToolsByCategory(categorySlug)) {
    if (seen.has(tool.slug) || !isLiveTool(tool)) continue;
    seen.add(tool.slug);
    out.push(toNavTool(tool));
  }

  return out;
}

/**
 * Build the slim nav data from the registry. Call this ONCE in the server
 * `app/layout.tsx` and thread the result into `<Header>` and `<Footer>`.
 * Counts are LIVE-only and always the FULL number; `tools` is capped at
 * `toolsPerCategory` (popular-first). NavData is serialised into the RSC
 * payload of EVERY exported page, so a full mega-menu (~700 tools) costs
 * ~140 KB per page: the nav shows the top slice and "See all N" links
 * carry users (and crawlers) to the category pages, which list everything.
 *
 * @param popularLimit      how many global popular tools to include
 * @param recentLimit       how many recently-added tools to include
 * @param toolsPerCategory  how many tool links each category carries in the nav
 */
export function buildNavData({
  popularLimit = 6,
  recentLimit = 6,
  // User decision 2026-07-31: the mega-menu shows EVERY tool per category
  // (panel scrolls internally). Payload cost accepted knowingly.
  toolsPerCategory = 999,
}: {
  popularLimit?: number;
  recentLimit?: number;
  toolsPerCategory?: number;
} = {}): NavData {
  const categories: NavCategory[] = CATEGORIES.map((category) => {
    const allTools = liveToolsForCategory(category.slug);
    return {
      slug: category.slug,
      name: category.name,
      description: category.description,
      icon: category.icon,
      accent: category.accent,
      href: ROUTES.category(category.slug),
      count: allTools.length,
      tools: allTools.slice(0, toolsPerCategory),
    };
  }).filter((category) => category.count >= CATEGORY_MIN_INDEXED);

  return {
    categories,
    popular: getPopularTools(popularLimit).map(toNavTool),
    recent: getRecentTools(recentLimit).map(toNavTool),
    totalTools: categories.reduce((sum, c) => sum + c.count, 0),
  };
}
