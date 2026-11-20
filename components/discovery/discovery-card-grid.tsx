import Link from "next/link";

import type { AccentKey, IconName } from "@/types";
import { cn } from "@/lib/utils";
import { accentStyle } from "@/lib/design";
import { Icon } from "@/lib/icons";

export interface DiscoveryCardItem {
  href: string;
  icon: IconName;
  accent: AccentKey;
  title: string;
  description: string;
  /** Small trailing meta, e.g. "12 tools" or "6 steps". */
  meta?: string;
}

export interface DiscoveryCardGridProps {
  items: DiscoveryCardItem[];
  columns?: 2 | 3;
  className?: string;
}

const COLUMN_CLASSES: Record<NonNullable<DiscoveryCardGridProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

/**
 * A grid of navigational cards (a collection, a use-case, a workflow…), each an
 * accent-tinted tile linking to its micro-site. Shared by every discovery index
 * page so they stay visually identical and DRY. Pure server component.
 */
export function DiscoveryCardGrid({
  items,
  columns = 3,
  className,
}: DiscoveryCardGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:gap-5",
        COLUMN_CLASSES[columns],
        className,
      )}
    >
      {items.map((item) => {
        const a = accentStyle(item.accent);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-transparent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-[0.06]",
                  a.gradient,
                )}
              />
              <span
                className={cn(
                  "relative flex size-11 items-center justify-center rounded-xl ring-1 ring-inset ring-border/50",
                  a.soft,
                )}
              >
                <Icon name={item.icon} size={22} />
              </span>
              <span className="relative flex items-center gap-1.5 font-semibold leading-snug tracking-tight text-foreground">
                {item.title}
                <Icon
                  name="ArrowRight"
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="relative line-clamp-2 text-sm text-muted-foreground">
                {item.description}
              </span>
              {item.meta ? (
                <span className={cn("relative mt-auto pt-1 text-sm font-medium tabular-nums", a.text)}>
                  {item.meta}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
