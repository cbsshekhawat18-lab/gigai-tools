import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface LoadingStateProps {
  /** Accessible label announced to screen readers. */
  label?: string;
  /** Number of skeleton cards to render. */
  rows?: number;
  className?: string;
}

/**
 * Skeleton grid placeholder that mirrors the tool-card layout while data loads.
 */
export function LoadingState({
  label = "Loading…",
  rows = 6,
  className,
}: LoadingStateProps) {
  const count = Math.max(1, rows);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      <span className="sr-only">{label}</span>

      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
        >
          <Skeleton className="size-11 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="mt-auto flex gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
