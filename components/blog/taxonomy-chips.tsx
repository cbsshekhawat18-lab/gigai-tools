import Link from "next/link";

import { cn, slugify } from "@/lib/utils";

export interface TaxonomyItem {
  /** Display label, e.g. "PDF Tools". */
  label: string;
  /** URL slug. Derived from the label when omitted. */
  slug?: string;
  /** Optional post count shown as a subtle badge. */
  count?: number;
}

export interface TaxonomyChipsProps {
  items: TaxonomyItem[];
  /** Slug of the active chip (highlighted). */
  activeSlug?: string;
  /** Base path: each chip links to `${base}/${slug}`. */
  base: string;
  /**
   * Optional "all" chip. Pass its label to enable it; it is active when
   * `activeSlug` is empty/undefined.
   */
  allLabel?: string;
  /**
   * Where the "all" chip links. Required with `allLabel`, `base` alone
   * (e.g. "/blog/tag") is not a routable page.
   */
  allHref?: string;
  className?: string;
}

const chipBase =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const chipActive = "border-primary bg-primary text-primary-foreground";
const chipIdle =
  "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground";

/**
 * A horizontal row of category/tag filter chips. The active chip is styled as
 * the current filter; an optional leading "All" chip clears the filter. Pure
 * links. No client state.
 */
export function TaxonomyChips({
  items,
  activeSlug,
  base,
  allLabel,
  allHref,
  className,
}: TaxonomyChipsProps) {
  if (items.length === 0 && !allLabel) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {allLabel && allHref ? (
        <li>
          <Link
            href={allHref}
            aria-current={!activeSlug ? "page" : undefined}
            className={cn(chipBase, !activeSlug ? chipActive : chipIdle)}
          >
            {allLabel}
          </Link>
        </li>
      ) : null}

      {items.map((item) => {
        const slug = item.slug ?? slugify(item.label);
        const isActive = slug === activeSlug;
        return (
          <li key={slug}>
            <Link
              href={`${base}/${slug}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(chipBase, isActive ? chipActive : chipIdle)}
            >
              {item.label}
              {typeof item.count === "number" ? (
                <span
                  className={cn(
                    "tabular-nums text-xs",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground/70",
                  )}
                >
                  {item.count}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
