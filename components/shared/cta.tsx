import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CtaAction {
  label: string;
  href: string;
}

export interface CTAProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  primary?: CtaAction;
  secondary?: CtaAction;
  className?: string;
}

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Full-width call-to-action band on the primary surface.
 * Renders external links with a native anchor, internal ones with next/link.
 */
export function CTA({
  title,
  description,
  primary,
  secondary,
  className,
}: CTAProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-12 sm:py-14",
        className,
      )}
    >
      {/* Decorative texture */}

      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-3">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="text-pretty text-base text-primary-foreground/85 sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>

        {primary || secondary ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            {primary ? (
              <Button
                asChild
                size="lg"
                className="bg-background text-foreground shadow-sm hover:bg-background/90"
              >
                {isExternal(primary.href) ? (
                  <a
                    href={primary.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {primary.label}
                  </a>
                ) : (
                  <Link href={primary.href}>{primary.label}</Link>
                )}
              </Button>
            ) : null}

            {secondary ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                {isExternal(secondary.href) ? (
                  <a
                    href={secondary.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {secondary.label}
                  </a>
                ) : (
                  <Link href={secondary.href}>{secondary.label}</Link>
                )}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
