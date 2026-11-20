/**
 * GigAI Workspace: inline progress bar for the running apply/pipeline.
 */

"use client";

import { cn } from "@/lib/utils";
import type { RunProgress } from "@/lib/workspace/store";

export interface ProgressBarProps {
  progress: RunProgress | null;
  className?: string;
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  if (!progress) return null;
  const pct = Math.round(Math.min(1, Math.max(0, progress.fraction)) * 100);
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={progress.status ?? "Processing"}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span aria-live="polite" className="min-w-0 max-w-[50%] truncate text-xs text-muted-foreground">
        {progress.status}
      </span>
      <span className="tabular-nums text-xs font-medium text-foreground">{pct}%</span>
    </div>
  );
}
