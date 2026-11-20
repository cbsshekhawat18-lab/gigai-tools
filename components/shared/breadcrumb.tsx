import * as React from "react";
import Link from "next/link";

import type { BreadcrumbItem } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Accessible breadcrumb trail. The final item is rendered as the current page
 * (aria-current) and is not a link.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("w-full", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.href}-${index}`} className="flex items-center gap-1.5">
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-foreground"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="-mx-1.5 -my-2.5 inline-flex min-h-11 min-w-11 items-center px-1.5 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.label}
                </Link>
              )}

              {!isLast ? (
                <Icon
                  name="ChevronRight"
                  size={16}
                  className="text-muted-foreground/80"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
