"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

export interface ResultSuccessProps {
  /** Headline, e.g. "Your image is ready". */
  title: string;
  /** Supporting line. Defaults to the local-processing privacy reassurance. */
  detail?: React.ReactNode;
  /** Extra content on the right (badges, stats). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * The shared success header for tool done-states: an animated check (pops in,
 * calm under reduced motion:.gigai-pop in globals.css), the outcome headline
 * and the privacy reassurance. Keeps every tool's "it worked" moment
 * consistent instead of each shell rolling its own.
 */
export function ResultSuccess({ title, detail, children, className }: ResultSuccessProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="gigai-pop flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
        <Icon name="CircleCheck" size={24} />
      </span>
      <div className="flex min-w-0 flex-col">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">
          {detail ?? "Processed locally, nothing left your device."}
        </p>
      </div>
      {children ? <div className="ml-auto shrink-0">{children}</div> : null}
    </div>
  );
}
