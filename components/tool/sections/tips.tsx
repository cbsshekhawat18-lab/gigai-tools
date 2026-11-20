import * as React from "react";

import type { AccentKey } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";

export interface TipsSectionProps {
  items: string[];
  /** Tool accent; falls back to the platform default when omitted. */
  accent?: AccentKey;
  className?: string;
}

/**
 * Tips & best practices, a lightweight, scannable list of short pointers.
 * Server component: pure render. Renders nothing when empty.
 */
export function TipsSection({ items, accent, className }: TipsSectionProps) {
  if (!items || items.length === 0) return null;

  const style = accentStyle(accent);

  return (
    <section className={cn("py-10 sm:py-14", className)}>
      <Container>
        <SectionHeading
          title="Get the most out of it"
        />
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((tip, index) => (
            <li
              key={`${index}-${tip.slice(0, 24)}`}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  style.soft,
                )}
              >
                <Icon name="Lightbulb" size={16} />
              </span>
              <p className="pt-1 text-sm leading-relaxed text-foreground">
                {tip}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
