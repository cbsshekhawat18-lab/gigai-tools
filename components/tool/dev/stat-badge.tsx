"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

const statBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium tabular-nums whitespace-nowrap",
  {
    variants: {
      tone: {
        default: "border-border bg-muted/50 text-muted-foreground",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
        danger: "border-destructive/30 bg-destructive/10 text-destructive",
        info: "border-primary/30 bg-primary/10 text-primary",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

/** Props for {@link StatBadge}. */
export interface StatBadgeProps
  extends VariantProps<typeof statBadgeVariants> {
  /** Muted label, e.g. "Size". */
  label?: React.ReactNode;
  /** Emphasized value, e.g. "12.4 KB". */
  value: React.ReactNode;
  /** Optional leading lucide icon name. */
  icon?: string;
  className?: string;
  title?: string;
}

/**
 * A small pill for surfacing counts, sizes, ratios, and timing (e.g.
 * "Minified −64%", "Parsed in 3ms"). Compose several in a flex row.
 */
export function StatBadge({ label, value, icon, tone, className, title }: StatBadgeProps) {
  return (
    <span className={cn(statBadgeVariants({ tone }), className)} title={title}>
      {icon && <Icon name={icon} size={12} />}
      {label != null && <span className="opacity-70">{label}</span>}
      <span className="font-semibold">{value}</span>
    </span>
  );
}
