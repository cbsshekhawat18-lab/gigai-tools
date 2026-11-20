import type { ToolCardData } from "@/types";
import { getAllTools, isLiveTool } from "@/lib/registry";
import { toToolCardData } from "@/lib/utils";

/**
 * Build a registry-free `Record<slug, ToolCardData>` for every live tool.
 *
 * Server-only: called once per homepage render and handed to the personalized
 * client islands (Popular / Trending) so they can resolve ANY tool the visitor
 * has used into a card: without the ~250 full tool configs (FAQs, long copy,
 * SEO fields) ever reaching the browser bundle. Pass the SAME instance to every
 * island so React Flight serializes it once.
 */
export function buildHomeCardLookup(): Record<string, ToolCardData> {
  const lookup: Record<string, ToolCardData> = {};
  for (const tool of getAllTools().filter(isLiveTool)) {
    lookup[tool.slug] = toToolCardData(tool);
  }
  return lookup;
}
