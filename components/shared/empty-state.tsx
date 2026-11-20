import * as React from "react";
import Link from "next/link";

import type { IconName } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface EmptyStateAction {
  label: string;
  href: string;
}

export interface EmptyStateProps {
  /** lucide icon name; defaults to a neutral "search" glyph. */
  icon?: IconName;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: EmptyStateAction;
  className?: string;
}

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Friendly placeholder for zero-result / not-found / coming-soon surfaces.
 */
export function EmptyState({
  icon = "SearchX",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon name={icon} size={26} />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mx-auto max-w-md text-pretty text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Button asChild className="mt-2">
          {isExternal(action.href) ? (
            <a href={action.href} target="_blank" rel="noopener noreferrer">
              {action.label}
            </a>
          ) : (
            <Link href={action.href}>{action.label}</Link>
          )}
        </Button>
      ) : null}
    </div>
  );
}
