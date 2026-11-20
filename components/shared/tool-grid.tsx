import type { ToolCardData } from "@/types";
import { cn, toToolCardData } from "@/lib/utils";
import { ToolCard } from "@/components/shared/tool-card";
import { EmptyState } from "@/components/shared/empty-state";

export interface ToolGridProps {
  tools: ToolCardData[];
  className?: string;
  /** Max columns at the widest breakpoint (mobile always stacks). */
  columns?: 2 | 3 | 4;
  /** Message shown when `tools` is empty. */
  emptyMessage?: string;
}

const COLUMN_CLASSES: Record<NonNullable<ToolGridProps["columns"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

/**
 * Responsive grid of {@link ToolCard}. Falls back to an {@link EmptyState}
 * when there are no tools to show (e.g. an empty category or search).
 */
export function ToolGrid({
  tools,
  className,
  columns = 4,
  emptyMessage = "No tools to show here yet.",
}: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <EmptyState
        icon="SearchX"
        title="Nothing here yet"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:gap-5", COLUMN_CLASSES[columns], className)}>
      {/* Re-project defensively: callers often hold full registry Tools, which
          structurally pass as ToolCardData but would serialise their SEO/FAQ
          copy into the RSC payload when this grid renders on the server. */}
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={toToolCardData(tool)} />
      ))}
    </div>
  );
}
