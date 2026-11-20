import * as React from "react";

import type { AccentKey, ToolTroubleshootItem } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";

export interface TroubleshootingSectionProps {
  items: ToolTroubleshootItem[];
  /** Tool accent; falls back to the platform default when omitted. */
  accent?: AccentKey;
  className?: string;
}

/**
 * Common problems + fixes. Server component: pure render. Each entry pairs a
 * problem (with a warning marker) and its solution (with an accent check).
 * Renders nothing when empty.
 */
export function TroubleshootingSection({
  items,
  accent,
  className,
}: TroubleshootingSectionProps) {
  if (!items || items.length === 0) return null;

  const style = accentStyle(accent);

  return (
    <section className={cn("py-10 sm:py-14", className)}>
      <Container>
        <SectionHeading
          title="Common problems, solved"
          description="Hit a snag? Here are quick fixes for the issues people run into most."
        />
        <ul className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {items.map((item, index) => (
            <li
              key={`${item.problem}-${index}`}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Icon name="TriangleAlert" size={16} />
                </span>
                <h3 className="pt-1 text-base font-semibold text-foreground">
                  {item.problem}
                </h3>
              </div>
              <div className="flex gap-3 border-t border-border pt-4">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    style.soft,
                  )}
                >
                  <Icon name="Check" size={16} />
                </span>
                <p className="pt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.solution}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
