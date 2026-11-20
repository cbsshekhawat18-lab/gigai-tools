"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import type { AccentKey } from "@/types";
import { ROUTES } from "@/config/constants";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { useMounted } from "@/hooks/use-mounted";
import { useRecentTools } from "@/hooks/use-personalization";
import {
  getRecentCategories,
  subscribe,
  STORAGE_KEYS,
} from "@/lib/personalization";

/**
 * Slim, registry-free description of a tool: the ONLY shape this island needs
 * to render a chip. A server parent computes a `Record<slug, SlimTool>` from the
 * registry and passes it down, so this client bundle never imports the ~249
 * tool configs.
 */
export interface SlimTool {
  slug: string;
  title: string;
  /** Category display name (e.g. "PDF Tools"). */
  category: string;
  /** lucide icon name. */
  icon: string;
  /** Route to the tool (e.g. "/image-compressor"). */
  href: string;
  /** Optional accent key for a tinted icon chip; falls back to neutral. */
  accent?: AccentKey;
}

/** Slim category descriptor passed by the server parent (registry-free). */
export interface SlimCategory {
  slug: string;
  name: string;
  icon: string;
  accent?: AccentKey;
}

/** Lookup keyed by slug. Accepts a Map or a plain Record. */
export type SlimToolLookup = Record<string, SlimTool> | Map<string, SlimTool>;

function lookup(map: SlimToolLookup, slug: string): SlimTool | undefined {
  return map instanceof Map ? map.get(slug) : map[slug];
}

/* Stable snapshot for useSyncExternalStore: returns the SAME array reference
   when contents are unchanged, so React doesn't loop re-rendering. */
const EMPTY: string[] = [];
let catCache: string[] = EMPTY;
function catSnapshot(): string[] {
  const next = getRecentCategories();
  if (next.length === catCache.length && next.every((v, i) => v === catCache[i]))
    return catCache;
  catCache = next.length ? next : EMPTY;
  return catCache;
}

/* One chip look, shared by tool and category chips. */
const CHIP =
  "inline-flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-2 pr-3 text-sm font-medium text-card-foreground outline-none transition-colors hover:border-transparent hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const CHIP_ICON =
  "inline-flex size-6 items-center justify-center rounded-full ring-1 ring-inset ring-border/50";

export interface RecentlyUsedProps {
  /** Slim tool lookup provided by a server parent (registry-free). */
  tools: SlimToolLookup;
  /**
   * Optional slim category lookup. When given, the categories this browser was
   * last browsing render as "Browse X" chips in the SAME list, after the tools.
   */
  categories?: Record<string, SlimCategory>;
  /** Section heading. */
  title?: string;
  /** Max tool chips to show. */
  limit?: number;
  /** Max category chips to show. */
  categoryLimit?: number;
  /** Show a "Clear" control. */
  clearable?: boolean;
  className?: string;
}

/**
 * "Recently used" rail: the tools this browser opened recently, plus the
 * categories it was browsing, as one labelled list of chips.
 *
 * This deliberately does NOT surface recent *searches*. They were previously a
 * second "Continue where you were" section, but a recent search is almost always
 * the same intent as the recent tool right above it (you search for a tool, then
 * open it), so it rendered a near-duplicate chip that cost an extra click to
 * reach the same page. Recent searches are still recorded, and still surface
 * where they actually belong: the ⌘K command palette (components/layout/
 * command-center.tsx) and the search bar (components/search/search-bar.tsx).
 *
 * The whole block is HIDDEN when there is nothing to show: including during
 * SSR/first paint, so it never causes layout shift or an empty state.
 *
 * Purely local to this browser; nothing is synced or uploaded.
 */
export function RecentlyUsed({
  tools,
  categories,
  title = "Recently used",
  limit = 8,
  categoryLimit = 2,
  clearable = true,
  className,
}: RecentlyUsedProps) {
  const mounted = useMounted();
  const { slugs, remove, clear } = useRecentTools();
  const recentCats = useSyncExternalStore(
    (cb) => subscribe(cb, STORAGE_KEYS.recentCategories),
    catSnapshot,
    () => EMPTY,
  );

  const items = slugs
    .map((slug) => lookup(tools, slug))
    .filter((t): t is SlimTool => Boolean(t))
    .slice(0, limit);

  const cats = categories
    ? recentCats
        .map((slug) => categories[slug])
        .filter((c): c is SlimCategory => Boolean(c))
        .slice(0, categoryLimit)
    : [];

  // Hidden until mounted (no localStorage on the server) and when empty.
  if (!mounted || (items.length === 0 && cats.length === 0)) return null;

  return (
    <section aria-label={title} className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Icon name="History" size={15} />
          {title}
        </h2>
        {clearable && items.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className={cn(
              "rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            Clear
          </button>
        ) : null}
      </div>

      <ul className="flex flex-wrap gap-2">
        {items.map((tool) => {
          const accent = accentStyle(tool.accent);
          return (
            <li
              key={`t:${tool.slug}`}
              className="group/chip relative animate-in fade-in zoom-in-90 duration-200 motion-reduce:animate-none"
            >
              <Link href={tool.href} className={CHIP}>
                <span
                  className={cn(
                    CHIP_ICON,
                    tool.accent ? accent.soft : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon name={tool.icon} size={14} />
                </span>
                <span className="max-w-[12rem] truncate">{tool.title}</span>
              </Link>

              {/* Remove-from-recent affordance (keyboard + pointer). */}
              <button
                type="button"
                onClick={() => remove(tool.slug)}
                aria-label={`Remove ${tool.title} from recently used`}
                className={cn(
                  "absolute -right-1 -top-1 inline-flex size-4 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 outline-none transition-opacity",
                  "group-hover/chip:opacity-100 focus-visible:opacity-100",
                  "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <Icon name="X" size={10} />
              </button>
            </li>
          );
        })}

        {cats.map((cat) => {
          const accent = accentStyle(cat.accent);
          return (
            <li
              key={`c:${cat.slug}`}
              className="animate-in fade-in zoom-in-90 duration-200 motion-reduce:animate-none"
            >
              <Link href={ROUTES.category(cat.slug)} className={CHIP}>
                <span
                  className={cn(
                    CHIP_ICON,
                    cat.accent ? accent.soft : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon name={cat.icon} size={14} />
                </span>
                Browse {cat.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
