"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

/** Props for {@link ErrorBanner}. */
export interface ErrorBannerProps {
  /** Error message. When null/empty the banner renders nothing. */
  error?: string | null;
  /** Optional 1-based location surfaced as "line L, col C". */
  line?: number | null;
  col?: number | null;
  /** Shows a "Jump to line" affordance when provided (with `line`). */
  onJumpToLine?: (line: number) => void;
  /** Optional dismiss handler; shows a close button when set. */
  onDismiss?: () => void;
  /** "error" (destructive) or "warning". Default "error". */
  variant?: "error" | "warning";
  className?: string;
}

/**
 * An inline, accessible error/warning banner for tool failures. Optionally
 * shows a parse location and a "Jump to line" button that scrolls the offending
 * line into view in the associated editor.
 */
export function ErrorBanner({
  error,
  line = null,
  col = null,
  onJumpToLine,
  onDismiss,
  variant = "error",
  className,
}: ErrorBannerProps) {
  if (!error) return null;

  const isWarning = variant === "warning";

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
        isWarning
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-destructive/40 bg-destructive/10 text-destructive",
        className,
      )}
    >
      <Icon
        name={isWarning ? "TriangleAlert" : "CircleAlert"}
        size={16}
        className="mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="break-words font-medium">{error}</p>
        {line != null && (
          <p className="mt-0.5 text-sm opacity-80">
            Line {line}
            {col != null ? `, column ${col}` : ""}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {line != null && onJumpToLine && (
          <button
            type="button"
            onClick={() => onJumpToLine(line)}
            className="rounded px-2 py-0.5 text-sm font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-current"
          >
            Jump to line
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error" title="Dismiss error"
            className="rounded p-0.5 opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current"
          >
            <Icon name="X" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
