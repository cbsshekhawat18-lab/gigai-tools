import * as React from "react";

import type { IconName } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

export interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

export interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const COLUMN_CLASS: Record<NonNullable<FeatureGridProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Responsive grid of "benefit" cells (icon + title + copy). Used on marketing
 * sections and tool pages to explain value props.
 */
export function FeatureGrid({
  features,
  columns = 3,
  className,
}: FeatureGridProps) {
  if (features.length === 0) return null;

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-6",
        COLUMN_CLASS[columns],
        className,
      )}
    >
      {features.map((feature, index) => (
        <li
          key={`${feature.title}-${index}`}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name={feature.icon} size={22} />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {feature.title}
          </h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </li>
      ))}
    </ul>
  );
}
