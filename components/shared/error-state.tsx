"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** When provided, renders a "Try again" button that calls this handler. */
  retry?: () => void;
  className?: string;
}

/**
 * Inline error surface with an optional retry action. Client component so it
 * can wire up the retry handler (used by error boundaries and async panels).
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn’t load this content. Please try again in a moment.",
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <Icon name="TriangleAlert" size={26} />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-md text-pretty text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {retry ? (
        <Button variant="outline" onClick={retry} className="mt-2">
          <Icon name="RotateCcw" size={16} />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
