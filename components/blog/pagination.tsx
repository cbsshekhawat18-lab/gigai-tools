import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

export interface PaginationProps {
  /** Current page (1-based). */
  page: number;
  totalPages: number;
  /**
   * Base path for pages. Page 1 links to `basePath`; page N links to
   * `${basePath}/page/${N}`. Override with `hrefFor` for a different scheme.
   */
  basePath?: string;
  /** Custom URL builder for a page number (overrides `basePath`). */
  hrefFor?: (page: number) => string;
  className?: string;
}

type Slot = number | "ellipsis";

/** WordPress-style window: first, last, current ±1, with ellipses for gaps. */
function buildSlots(page: number, total: number): Slot[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const slots: Slot[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);

  if (start > 2) slots.push("ellipsis");
  for (let p = start; p <= end; p++) slots.push(p);
  if (end < total - 1) slots.push("ellipsis");

  slots.push(total);
  return slots;
}

const itemBase =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Pagination({
  page,
  totalPages,
  basePath = "/blog",
  hrefFor,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (p: number) =>
    hrefFor ? hrefFor(p) : p <= 1 ? basePath : `${basePath}/page/${p}`;

  const slots = buildSlots(page, totalPages);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className={cn("flex justify-center", className)}>
      <ul className="flex flex-wrap items-center gap-1.5">
        {/* Previous */}
        <li>
          {hasPrev ? (
            <Link
              href={href(page - 1)}
              rel="prev"
              aria-label="Previous page"
              className={cn(itemBase, "border-border bg-card text-foreground hover:bg-accent")}
            >
              <Icon name="ChevronLeft" size={16} />
            </Link>
          ) : (
            <span
              aria-disabled
              className={cn(itemBase, "border-border bg-muted/40 text-muted-foreground opacity-50")}
            >
              <Icon name="ChevronLeft" size={16} />
            </span>
          )}
        </li>

        {slots.map((slot, i) =>
          slot === "ellipsis" ? (
            <li key={`e-${i}`} aria-hidden className="px-1 text-muted-foreground">
              &hellip;
            </li>
          ) : (
            <li key={slot}>
              {slot === page ? (
                <span
                  aria-current="page"
                  className={cn(
                    itemBase,
                    "border-primary bg-primary tabular-nums text-primary-foreground",
                  )}
                >
                  {slot}
                </span>
              ) : (
                <Link
                  href={href(slot)}
                  aria-label={`Page ${slot}`}
                  className={cn(
                    itemBase,
                    "border-border bg-card tabular-nums text-foreground hover:bg-accent",
                  )}
                >
                  {slot}
                </Link>
              )}
            </li>
          ),
        )}

        {/* Next */}
        <li>
          {hasNext ? (
            <Link
              href={href(page + 1)}
              rel="next"
              aria-label="Next page"
              className={cn(itemBase, "border-border bg-card text-foreground hover:bg-accent")}
            >
              <Icon name="ChevronRight" size={16} />
            </Link>
          ) : (
            <span
              aria-disabled
              className={cn(itemBase, "border-border bg-muted/40 text-muted-foreground opacity-50")}
            >
              <Icon name="ChevronRight" size={16} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
