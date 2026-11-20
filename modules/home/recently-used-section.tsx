import { ROUTES } from "@/config/constants";
import { CATEGORIES, categoryBySlug } from "@/config/categories";
import { getAllTools, isLiveTool } from "@/lib/registry";
import { Container } from "@/components/shared/container";
import {
  RecentlyUsed,
  type SlimTool,
  type SlimCategory,
} from "@/components/personalization/recently-used";

/**
 * Server wrapper for the "Recently used" rail. Builds the registry-free
 * {@link SlimTool} lookup once (server-side) and hands it to the client island,
 * so the ~249 tool configs never reach the browser bundle.
 *
 * The island renders NOTHING until it mounts and finds locally-stored recent
 * tools, so this whole block is invisible (no heading, no layout shift) for a
 * first-time visitor, and quietly appears once they've opened a tool or two.
 */
export function RecentlyUsedSection() {
  const lookup: Record<string, SlimTool> = {};
  for (const tool of getAllTools().filter(isLiveTool)) {
    const category = categoryBySlug(tool.category);
    lookup[tool.slug] = {
      slug: tool.slug,
      title: tool.title,
      category: category?.name ?? "",
      icon: tool.icon,
      href: ROUTES.tool(tool.slug),
      accent: tool.accent ?? category?.accent,
    };
  }

  // Slim category lookup for the "Browse X" chips (tiny, registry-free).
  const categoryLookup: Record<string, SlimCategory> = {};
  for (const cat of CATEGORIES) {
    categoryLookup[cat.slug] = {
      slug: cat.slug,
      name: cat.name,
      icon: cat.icon,
      accent: cat.accent,
    };
  }

  // The island renders its <section> only when it has local history to show
  // (otherwise it returns null). `:not(:has(section))` collapses this whole
  // block (padding and all) so a first-time visitor sees no empty gap.
  // Browsers without :has() simply keep the small padding, which is harmless.
  return (
    <div className="py-10 md:py-12 [&:not(:has(section))]:hidden">
      <Container>
        <RecentlyUsed
          tools={lookup}
          categories={categoryLookup}
          title="Pick up where you left off"
          limit={10}
        />
      </Container>
    </div>
  );
}
