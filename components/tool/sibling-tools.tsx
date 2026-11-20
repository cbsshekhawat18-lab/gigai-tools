import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { getToolBySlug, isLiveTool } from "@/lib/registry";
import { siblingsFor } from "@/config/tool-siblings";

/**
 * "Which tool do you need?", server-rendered disambiguation for tools with
 * near-duplicate siblings (config/tool-siblings). One honest line per sibling
 * about when IT is the better pick, so lookalike pages read as deliberate
 * variants instead of confusing duplicates. Renders nothing when the tool has
 * no curated siblings (mount unconditionally).
 */
export function SiblingTools({ slug, className }: { slug: string; className?: string }) {
  const choices = siblingsFor(slug)
    .map((c) => ({ ...c, tool: getToolBySlug(c.slug) }))
    .filter((c) => c.tool && isLiveTool(c.tool));

  if (choices.length === 0) return null;

  return (
    <aside
      aria-label="Similar tools and when to use them"
      className={cn("rounded-xl border border-border bg-muted/30 p-4", className)}
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon name="GitBranch" size={13} className="text-primary" />
        Looking for something slightly different?
      </p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {choices.map(({ tool, when }) => {
          const style = accentStyle(tool!.accent);
          return (
            <li key={tool!.slug}>
              <Link
                href={`/${tool!.slug}`}
                className="group flex items-start gap-3 rounded-lg border border-transparent min-h-11 px-2 py-1.5 outline-none transition-colors hover:border-border hover:bg-background focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                    style.soft,
                  )}
                >
                  <Icon name={tool!.icon} size={14} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                    {tool!.title}
                    <Icon
                      name="ArrowRight"
                      size={12}
                      className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">
                    {when}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
