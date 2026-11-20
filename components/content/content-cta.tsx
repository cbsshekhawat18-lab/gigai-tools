import Link from "next/link";

import type { Tool } from "@/types";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/constants";
import { categoryBySlug } from "@/config/categories";
import { accentStyle } from "@/lib/design";
import { Icon } from "@/lib/icons";

export interface ContentCtaProps {
  /** The tool this CTA drives the reader to. */
  tool: Tool;
  /** Optional heading override; defaults to a "Try <tool>" line. */
  heading?: string;
  /** Optional supporting line; defaults to the tool's own description. */
  description?: string;
  /** Optional button-label override; defaults to "Open <tool>". */
  ctaLabel?: string;
  className?: string;
}

/**
 * Inline, in-flow call-to-action linking a piece of long-form content to the
 * tool that actions it. Lighter than the full-bleed {@link CTA} band, so it can
 * be embedded mid-article (e.g. between a how-to's steps and its tips) without
 * dominating the page. Accent follows the tool → its category. Server component.
 */
export function ContentCta({
  tool,
  heading,
  description,
  ctaLabel,
  className,
}: ContentCtaProps) {
  const category = categoryBySlug(tool.category);
  const a = accentStyle(tool.accent ?? category?.accent);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-[0.06]",
          a.gradient,
        )}
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-border/50",
              a.soft,
            )}
          >
            <Icon name={tool.icon} size={24} />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-semibold leading-snug tracking-tight text-foreground">
              {heading ?? `Try ${tool.title}`}
            </p>
            <p className="text-pretty text-sm text-muted-foreground">
              {description ?? tool.description}
            </p>
          </div>
        </div>

        <Link
          href={ROUTES.tool(tool.slug)}
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            a.solid,
          )}
        >
          {ctaLabel ?? `Open ${tool.title}`}
          <Icon name="ArrowRight" size={16} />
        </Link>
      </div>
    </div>
  );
}
