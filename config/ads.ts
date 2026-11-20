/**
 * Google AdSense configuration for GigAI Tools.
 *
 * The `adsbygoogle.js` loader is injected exactly ONCE for the whole app
 * (in `app/layout.tsx` via `next/script`). Ad components NEVER inject the
 * loader; they only render an `<ins class="adsbygoogle">` and push a single
 * `adsbygoogle.push({})` (ref-guarded in `components/ads/base-ad.tsx`).
 *
 * Ads are always placed AROUND content. Never over a tool's workspace, its
 * upload/download controls, or on the 404 page. See the placement spec in
 * `components/ads/*` and the per-page wiring.
 *
 * The publisher ID and the four slot IDs come from build-time env
 * (NEXT_PUBLIC_ADSENSE_*), so a fork serves no ads until it sets its own.
 */

/** AdSense publisher ID (the `ca-pub-…` client), from NEXT_PUBLIC_ADSENSE_CLIENT. */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";

/** Master kill-switch: ads render only when a publisher ID is configured. */
export const ADS_ENABLED = ADSENSE_CLIENT.startsWith("ca-pub-");

/** The four ad unit slot IDs provisioned in the AdSense dashboard. */
export const AD_SLOTS = {
  /** Responsive display all-rounder, banner-style, used between sections. */
  display: process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY?.trim() || "",
  /** Native in-article, used inside long-form blog content. */
  inArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE?.trim() || "",
  /** Native in-feed, used inside tool/blog card grids. */
  inFeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED?.trim() || "",
  /** Multiplex / content-recommendation grid, used at page bottoms. */
  multiplex: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MULTIPLEX?.trim() || "",
} as const;

/** A concrete slot key (`display` | `inArticle` | `inFeed` | `multiplex`). */
export type AdSlotKey = keyof typeof AD_SLOTS;

/**
 * The `data-ad-format` values we use:
 * - `auto`        responsive display banner (pairs with `responsive: true`)
 * - `fluid`       native in-article / in-feed unit (needs `layout`/`layoutKey`)
 * - `autorelaxed` multiplex recommendation grid
 * - `rectangle`   fixed rectangle (rarely used; kept for completeness)
 */
export type AdFormat = "auto" | "fluid" | "autorelaxed" | "rectangle";

/**
 * A fully-described ad placement. Named positions in {@link AD_POSITIONS} each
 * resolve to one of these; `BaseAd` also accepts these fields directly.
 */
export interface AdPosition {
  /** Concrete AdSense slot ID (already resolved from {@link AD_SLOTS}). */
  slot: string;
  /** `data-ad-format`. */
  format: AdFormat;
  /** `data-ad-layout` for in-article fluid units (e.g. `"in-article"`). */
  layout?: string;
  /** `data-ad-layout-key` for in-feed fluid units. */
  layoutKey?: string;
  /** `data-full-width-responsive`: set for responsive display banners. */
  responsive?: boolean;
  /** Reserved vertical space (px) to prevent CLS before the ad fills. */
  minHeight: number;
  /** Human-readable label, used for analytics + a11y, not shown verbatim. */
  label: string;
}

/**
 * Named ad positions keyed by placement. Components look these up by key so a
 * placement can be re-tuned in one place. The keys map 1:1 to the placement
 * spec (HOME_*, CATEGORY_*, TOOL_*, BLOG_*, SEARCH_*, plus chrome slots).
 */
export const AD_POSITIONS = {
  /* ── Home ─────────────────────────────────────────────────────────────── */
  // NB: there is deliberately NO ad above/inside the hero.
  HOME_HERO: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 250,
    label: "Home hero",
  },
  HOME_AFTER_POPULAR: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 250,
    label: "Home, after popular tools",
  },
  HOME_AFTER_CATEGORIES: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 250,
    label: "Home: after categories",
  },
  HOME_AFTER_FEATURED: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 250,
    label: "Home, after featured",
  },
  HOME_BEFORE_FOOTER: {
    slot: AD_SLOTS.multiplex,
    format: "autorelaxed",
    minHeight: 400,
    label: "Home, before footer (multiplex)",
  },

  /* ── Category ─────────────────────────────────────────────────────────── */
  CATEGORY_TOP: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 250,
    label: "Category, top",
  },
  CATEGORY_MID: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 250,
    label: "Category, mid-grid",
  },
  CATEGORY_BOTTOM: {
    slot: AD_SLOTS.multiplex,
    format: "autorelaxed",
    minHeight: 400,
    label: "Category: bottom (multiplex)",
  },

  /* ── Tool ─────────────────────────────────────────────────────────────── */
  // Banners sit BELOW the workspace. Never over upload/download/workspace.
  TOOL_TOP: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 250,
    label: "Tool: below workspace",
  },
  TOOL_AFTER_RESULT: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 250,
    label: "Tool: inside done-state, below the result readout",
  },
  TOOL_MIDDLE: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 250,
    label: "Tool: after features",
  },
  TOOL_BOTTOM: {
    slot: AD_SLOTS.multiplex,
    format: "autorelaxed",
    minHeight: 400,
    label: "Tool, after related (multiplex)",
  },

  /* ── Blog post ────────────────────────────────────────────────────────── */
  BLOG_TOP: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 250,
    label: "Blog: under title",
  },
  BLOG_MIDDLE: {
    slot: AD_SLOTS.inArticle,
    format: "fluid",
    layout: "in-article",
    minHeight: 280,
    label: "Blog, in-article",
  },
  BLOG_AFTER: {
    slot: AD_SLOTS.multiplex,
    format: "autorelaxed",
    minHeight: 400,
    label: "Blog: after article (multiplex)",
  },

  /* ── Chrome / shared ──────────────────────────────────────────────────── */
  // NB: NO search-page placements (ads may not run on screens without
  // publisher content, an empty/no-result search screen fails that test) and
  // NO sticky-bottom placement (manual sticky ads are desktop-only and capped
  // at 300px wide by AdSense policy; screen-edge anchors are Auto-ads only).
  SIDEBAR: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 600,
    label: "Sidebar (sticky, desktop-only, ≤300px)",
  },
  HEADER: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 100,
    label: "Header",
  },
  FOOTER: {
    slot: AD_SLOTS.display,
    format: "auto",
    responsive: true,
    minHeight: 100,
    label: "Footer",
  },
  NATIVE_FEED: {
    slot: AD_SLOTS.inFeed,
    format: "fluid",
    layoutKey: "-6t+ed+2i-1n-4w",
    minHeight: 300,
    label: "In-feed native",
  },
} as const satisfies Record<string, AdPosition>;

/** Valid named position keys (`"HOME_HERO"` | `"CATEGORY_TOP"` | …). */
export type AdPositionKey = keyof typeof AD_POSITIONS;
