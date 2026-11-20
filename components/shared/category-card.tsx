"use client";

import Link from "next/link";

import type { Category } from "@/types";
import { cn, pluralize } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { ROUTES } from "@/config/constants";
import { accentStyle } from "@/lib/design";

/**
 * Only the fields the card renders. This is a CLIENT component, so whatever a
 * server render site passes as `category` is serialised into the page's RSC
 * payload, and via the root not-found boundary, that payload rides on EVERY
 * exported page. Passing full `Category` objects (longDescription, faq,
 * learningCenter, seo…) cost ~90 KB per page; keep this prop slim.
 */
export type CategoryCardData = Pick<
  Category,
  "slug" | "name" | "description" | "icon" | "accent"
>;

export interface CategoryCardProps {
  category: CategoryCardData;
  /** Number of tools in this category (rendered as "N tools"). */
  count?: number;
  className?: string;
}

/**
 * Category tile for the home grid and category listings. The accent color and
 * quiet hover are driven entirely by the category's `accent` token.
 */
export function CategoryCard({ category, count, className }: CategoryCardProps) {
  const accent = accentStyle(category.accent);

  return (
    <Link
      href={ROUTES.category(category.slug)}
      aria-label={`Browse ${category.name}`}
      className={cn(
        "block h-full rounded-2xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="group relative flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground transition-colors duration-150 hover:border-foreground/20 hover:bg-muted/40">

        <span
          className={cn(
            "relative inline-flex size-12 items-center justify-center rounded-lg ring-1 ring-inset ring-border/50",
            accent.soft,
          )}
        >
          <Icon name={category.icon} size={24} />
        </span>

        <div className="relative flex flex-1 flex-col gap-1.5">
          <h3 className="font-semibold tracking-tight">{category.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {category.description}
          </p>
        </div>

        {typeof count === "number" ? (
          <div className={cn("relative text-xs font-medium", accent.text)}>
            {pluralize(count, "tool")}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
