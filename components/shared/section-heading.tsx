import * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  /** Small uppercase kicker above the title. */
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** Optional trailing action (e.g. a "View all" link/button). */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Standardized section header: eyebrow + title + description, with an optional
 * action rendered on the trailing edge (only meaningful for left alignment).
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-2", centered && "items-center")}>
        {eyebrow ? (
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "max-w-2xl text-pretty text-base text-muted-foreground",
              centered && "mx-auto",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className={cn("shrink-0", centered && "mt-2")}>{action}</div>
      ) : null}
    </div>
  );
}
