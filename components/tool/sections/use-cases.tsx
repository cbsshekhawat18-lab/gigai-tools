import * as React from "react";

import type { AccentKey, ToolUseCase } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";

export interface UseCasesSectionProps {
  items: ToolUseCase[];
  /** Tool accent; falls back to the platform default when omitted. */
  accent?: AccentKey;
  className?: string;
}

/** Lucide icon per common audience keyword, best-effort, with a safe default. */
function audienceIcon(audience: string): string {
  const key = audience.toLowerCase();
  if (key.includes("student") || key.includes("teacher") || key.includes("academ")) {
    return "GraduationCap";
  }
  if (key.includes("business") || key.includes("enterprise") || key.includes("team")) {
    return "Building2";
  }
  if (key.includes("professional") || key.includes("freelanc") || key.includes("designer")) {
    return "Briefcase";
  }
  if (key.includes("legal") || key.includes("lawyer") || key.includes("contract")) {
    return "Scale";
  }
  if (key.includes("develop") || key.includes("engineer")) {
    return "Code";
  }
  return "Users";
}

/**
 * "Who it's for": audience-oriented use-case cards. Server component: pure
 * render, so it can live in the static page shell. Renders nothing when empty.
 */
export function UseCasesSection({
  items,
  accent,
  className,
}: UseCasesSectionProps) {
  if (!items || items.length === 0) return null;

  const style = accentStyle(accent);

  return (
    <section className={cn("py-10 sm:py-14", className)}>
      <Container>
        <SectionHeading
          title="Built for the way you work"
          description="From quick one-off fixes to daily workflows, see how people put this tool to use."
        />
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                    style.soft,
                    style.border,
                  )}
                >
                  <Icon name={audienceIcon(item.audience)} size={22} />
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    style.text,
                  )}
                >
                  {item.audience}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
