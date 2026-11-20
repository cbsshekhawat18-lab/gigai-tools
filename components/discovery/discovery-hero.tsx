import * as React from "react";

import type { AccentKey, BreadcrumbItem, IconName } from "@/types";
import { cn } from "@/lib/utils";
import { accentStyle } from "@/lib/design";
import { Icon } from "@/lib/icons";
import { Container } from "@/components/shared/container";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Badge } from "@/components/ui/badge";

export interface DiscoveryHeroProps {
  breadcrumb: BreadcrumbItem[];
  icon: IconName;
  accent: AccentKey;
  eyebrow?: string;
  title: string;
  description: React.ReactNode;
  /** Optional secondary paragraph under the lead description. */
  longDescription?: React.ReactNode;
  /** Small stat badge, e.g. "12 tools". */
  badge?: { icon: IconName; label: string };
  /** Optional actions row (buttons, chips). */
  children?: React.ReactNode;
}

/**
 * Shared hero band for every discovery micro-site (collections, use-cases,
 * file-type, workflows). Mirrors the category-landing hero, a soft accent
 * gradient wash, an icon chip, breadcrumb, title and lead copy, so the whole
 * discovery surface feels like one premium system. Pure server component.
 */
export function DiscoveryHero({
  breadcrumb,
  icon,
  accent,
  eyebrow,
  title,
  description,
  longDescription,
  badge,
  children,
}: DiscoveryHeroProps) {
  const a = accentStyle(accent);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 -top-32 h-72 bg-gradient-to-br opacity-20 blur-3xl",
          a.gradient,
        )}
      />
      <Container className="relative py-12 sm:py-16">
        <Breadcrumb items={breadcrumb} />

        <div className="mt-8 flex max-w-3xl flex-col gap-5">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-2xl border",
                a.soft,
                a.border,
              )}
            >
              <Icon name={icon} size={24} />
            </span>
            {badge ? (
              <Badge variant="outline" className={cn("gap-1.5", a.text)}>
                <Icon name={badge.icon} size={13} />
                {badge.label}
              </Badge>
            ) : null}
          </div>

          {eyebrow ? (
            <span className={cn("text-sm font-semibold uppercase tracking-wider", a.text)}>
              {eyebrow}
            </span>
          ) : null}

          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h1>

          <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
            {description}
          </p>

          {longDescription ? (
            <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
              {longDescription}
            </p>
          ) : null}

          {children ? (
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
              {children}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
