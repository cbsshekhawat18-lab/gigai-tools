"use client";

import Link from "next/link";

import type { ToolCardData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { ROUTES } from "@/config/constants";
import { categoryBySlug } from "@/config/categories";
import { accentStyle } from "@/lib/design";
import { toolIllustrationSvg } from "@/lib/qr/tool-illustration";
import { Badge } from "@/components/ui/badge";

export interface ToolCardProps {
  tool: ToolCardData;
  className?: string;
}

/**
 * The canonical tool tile used across the home page, category pages, search and
 * related-tool rails. Accent + icon are derived from the tool's category, so a
 * new registry entry renders correctly with zero extra work.
 *
 * Live tools link to their route; `coming-soon`/non-live tools render as a
 * tasteful, non-interactive card marked `aria-disabled`.
 */
export function ToolCard({ tool, className }: ToolCardProps) {
  const category = categoryBySlug(tool.category);
  const accent = accentStyle(category?.accent);
  const status = tool.status ?? "live";
  const isLive = status === "live";

  // Optional generated branded artwork (QR tools / opted-in tools). Null for
  // every other tool, so their card is byte-for-byte unchanged. Accent follows
  // tool → category, matching the tool page.
  const cardArt = toolIllustrationSvg(
    tool,
    "card",
    tool.accent ?? category?.accent,
  );

  const body = (
    <div
      className={cn(
        "group relative flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground transition-colors duration-150",
        isLive
          ? "hover:border-foreground/20 hover:bg-muted/40"
          : "cursor-default opacity-80",
        className,
      )}
    >
      {/* Branded illustration banner (QR / opted-in tools only). Deterministic
          inline SVG with no user input - safe to inject. */}
      {cardArt ? (
        // Card art renders at its native 400x300, uncropped - the user saw the
        // slim 400x160 variant and chose the original look (2026-09-04). Do
        // not re-crop or shrink this without asking: the 16:6 slice attempt
        // cut compositions mid-element and both dense variants were rejected.
        <div
          aria-hidden="true"
          className="relative -mx-5 -mt-5 mb-1 overflow-hidden rounded-t-2xl border-b border-border/60 [&>svg]:h-auto [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: cardArt }}
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-lg ring-1 ring-inset ring-border/50",
            accent.soft,
          )}
        >
          <Icon name={tool.icon} size={22} />
        </span>

        {/* ONE status badge, fixed priority: lifecycle beats novelty beats
            popularity (UI-upgrade spec, phase 0 bug 6). */}
        <div className="flex items-center justify-end">
          {status === "coming-soon" ? (
            <Badge variant="outline">Soon</Badge>
          ) : status === "beta" ? (
            <Badge variant="outline">Beta</Badge>
          ) : tool.isNew ? (
            <Badge variant="success">New</Badge>
          ) : tool.popular ? (
            <Badge variant="secondary">Popular</Badge>
          ) : null}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-1.5">
        <h3
          className={cn(
            "font-semibold leading-snug tracking-tight",
            isLive && "transition-colors group-hover:text-foreground",
          )}
        >
          {tool.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {tool.description}
        </p>
      </div>

      {category ? (
        <div className="relative flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", accent.solid)} aria-hidden="true" />
          {category.name}
        </div>
      ) : null}
    </div>
  );

  if (isLive) {
    return (
      <Link
        href={ROUTES.tool(tool.slug)}
        aria-label={`Open ${tool.title}`}
        className={cn(
          "block h-full rounded-2xl outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {body}
      </Link>
    );
  }

  return (
    <div
      aria-disabled="true"
      aria-label={`${tool.title}, coming soon`}
      className="h-full"
    >
      {body}
    </div>
  );
}
