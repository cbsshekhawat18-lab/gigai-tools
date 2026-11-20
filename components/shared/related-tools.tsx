import type { Tool } from "@/types";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/shared/section-heading";
import { ToolGrid } from "@/components/shared/tool-grid";

export interface RelatedToolsProps {
  tools: Tool[];
  title?: string;
  className?: string;
}

/**
 * "Related tools" rail shown at the bottom of a tool page. Renders nothing when
 * there are no related tools so callers can drop it in unconditionally.
 */
export function RelatedTools({
  tools,
  title = "Related tools",
  className,
}: RelatedToolsProps) {
  if (tools.length === 0) return null;

  return (
    <section className={cn("space-y-6", className)} aria-label={title}>
      <SectionHeading title={title} />
      <ToolGrid tools={tools} columns={3} />
    </section>
  );
}
