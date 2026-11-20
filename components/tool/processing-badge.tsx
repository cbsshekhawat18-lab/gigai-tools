import type { Tool } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { toolProcessingBadge } from "@/lib/privacy";

export interface ProcessingBadgeProps {
  tool: Pick<Tool, "slug" | "serverSide" | "processor">;
  /** "chip" = compact inline pill; "banner" = pill + one-line explanation. */
  variant?: "chip" | "banner";
  className?: string;
}

/**
 * The browser-first TRANSPARENCY badge shown on every tool page. Derived from
 * {@link toolProcessingBadge} so the claim always matches how the tool runs.
 * Pure/server component. No client JS.
 */
export function ProcessingBadge({
  tool,
  variant = "chip",
  className,
}: ProcessingBadgeProps) {
  const meta = toolProcessingBadge(tool);

  const pill = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        meta.className,
      )}
    >
      <Icon name={meta.icon} size={13} />
      {meta.label}
    </span>
  );

  if (variant === "chip") {
    return <span className={className} title={meta.detail}>{pill}</span>;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground",
        className,
      )}
    >
      {pill}
      <span>{meta.detail}</span>
    </div>
  );
}
