/**
 * GigAI Tools, SERP & social-preview engine.
 *
 * Pixel-aware truncation models for Google desktop/mobile search snippets, plus
 * data models for the Open Graph (Facebook/LinkedIn) and Twitter card previews.
 * Pure, dependency-free. Google truncates by *rendered pixel width*, not
 * character count, so we approximate per-character widths for the fonts Google
 * uses, accurate enough to warn before a real truncation.
 */

export type SerpDevice = "desktop" | "mobile";

/** Google's approximate pixel budgets (Arial-ish, at Google's sizes). */
const SERP_LIMITS: Record<SerpDevice, { title: number; desc: number }> = {
  // Title ~20px, description ~14px.
  desktop: { title: 580, desc: 990 },
  mobile: { title: 495, desc: 920 },
};

/**
 * Per-character pixel widths at ~20px (title). Description widths are derived by
 * scaling. Values approximate Arial metrics; unlisted characters fall back to
 * an average. This is a heuristic, and documented as such.
 */
const TITLE_CHAR_WIDTH: Record<string, number> = {
  " ": 5, "!": 5, i: 4, j: 4, l: 4, I: 5, ".": 5, ",": 5, "'": 4, ":": 5, ";": 5, "|": 5,
  f: 5, t: 6, r: 6, "(": 6, ")": 6, "[": 6, "]": 6, "-": 7,
  m: 16, w: 15, M: 17, W: 17, "@": 20,
};
const TITLE_AVG_WIDTH = 11;
const DESC_SCALE = 0.7; // description font is ~14/20 of the title font.

function measure(text: string, scale: number): number {
  let width = 0;
  for (const ch of text) width += (TITLE_CHAR_WIDTH[ch] ?? TITLE_AVG_WIDTH) * scale;
  return width;
}

export interface TruncationResult {
  /** The (possibly) shortened text as it would render. */
  display: string;
  truncated: boolean;
  /** Estimated rendered width in pixels. */
  pixels: number;
  /** The pixel budget for this field/device. */
  limit: number;
}

/** Truncate `text` to fit `limitPx`, appending an ellipsis when cut. */
function truncateToPixels(text: string, limitPx: number, scale: number): TruncationResult {
  const clean = text.replace(/\s+/g, " ").trim();
  const full = measure(clean, scale);
  if (full <= limitPx) return { display: clean, truncated: false, pixels: Math.round(full), limit: limitPx };

  const ellipsisWidth = measure("…", scale);
  const budget = limitPx - ellipsisWidth;
  let width = 0;
  let cut = clean.length;
  for (let i = 0; i < clean.length; i += 1) {
    const w = (TITLE_CHAR_WIDTH[clean[i] ?? ""] ?? TITLE_AVG_WIDTH) * scale;
    if (width + w > budget) {
      cut = i;
      break;
    }
    width += w;
  }
  // Prefer cutting on a word boundary.
  let sliced = clean.slice(0, cut);
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace > budget * 0.5) sliced = sliced.slice(0, lastSpace);
  sliced = sliced.replace(/[\s.,;:]+$/, "");
  return {
    display: `${sliced}…`,
    truncated: true,
    pixels: Math.round(measure(sliced, scale) + ellipsisWidth),
    limit: limitPx,
  };
}

export interface SerpInput {
  title: string;
  url: string;
  desc: string;
  device?: SerpDevice;
}

export interface SerpSnippet {
  device: SerpDevice;
  title: TruncationResult;
  description: TruncationResult;
  /** The URL rendered as a Google breadcrumb (scheme dropped, path chevroned). */
  displayUrl: string;
}

/** Format a URL the way Google shows it (breadcrumb style). */
export function formatDisplayUrl(url: string): string {
  try {
    const u = new URL(url);
    const segments = u.pathname.split("/").filter(Boolean);
    const crumb = segments.length ? ` › ${segments.join(" › ")}` : "";
    return `${u.hostname}${crumb}`;
  } catch {
    return url;
  }
}

/**
 * Produce a pixel-aware Google SERP snippet preview for one device. Both title
 * and description are truncated to Google's approximate pixel budgets.
 */
export function serpSnippet(input: SerpInput): SerpSnippet {
  const device = input.device ?? "desktop";
  const limits = SERP_LIMITS[device];
  return {
    device,
    title: truncateToPixels(input.title, limits.title, 1),
    description: truncateToPixels(input.desc, limits.desc, DESC_SCALE),
    displayUrl: formatDisplayUrl(input.url),
  };
}

/** Convenience: both desktop and mobile snippets at once. */
export function serpSnippets(input: Omit<SerpInput, "device">): Record<SerpDevice, SerpSnippet> {
  return {
    desktop: serpSnippet({ ...input, device: "desktop" }),
    mobile: serpSnippet({ ...input, device: "mobile" }),
  };
}

/* ------------------------------ social models ----------------------------- */

export interface OgPreviewInput {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string;
}

export interface OgPreviewModel {
  title: string;
  description: string;
  image?: string;
  /** Uppercased domain, as Facebook/LinkedIn cards show it. */
  domain: string;
  siteName?: string;
  /** Whether an image is present (drives large-card vs. text-only layout). */
  hasImage: boolean;
  warnings: string[];
}

function domainOf(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Build the data model a UI needs to render an Open Graph share card. */
export function ogModel(input: OgPreviewInput): OgPreviewModel {
  const warnings: string[] = [];
  if (!input.title) warnings.push("Missing og:title. The card will fall back to the page <title>.");
  if (!input.image) warnings.push("Missing og:image. The share will render as a small text-only card.");
  if (!input.description) warnings.push("Missing og:description.");
  if (input.title && input.title.length > 88)
    warnings.push("og:title is long and may be clipped (~88 chars shown).");
  if (input.description && input.description.length > 200)
    warnings.push("og:description is long and may be clipped (~200 chars shown).");
  return {
    title: input.title ?? "",
    description: input.description ?? "",
    image: input.image,
    domain: domainOf(input.url).toUpperCase(),
    siteName: input.siteName,
    hasImage: Boolean(input.image),
    warnings,
  };
}

export interface TwitterPreviewInput {
  card?: "summary" | "summary_large_image";
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  site?: string;
}

export interface TwitterPreviewModel {
  card: "summary" | "summary_large_image";
  title: string;
  description: string;
  image?: string;
  domain: string;
  site?: string;
  /** True when the large-image layout should be used. */
  large: boolean;
  warnings: string[];
}

/** Build the data model a UI needs to render a Twitter (X) card preview. */
export function twitterModel(input: TwitterPreviewInput): TwitterPreviewModel {
  const warnings: string[] = [];
  const card = input.card ?? (input.image ? "summary_large_image" : "summary");
  if (!input.title) warnings.push("Missing twitter:title (falls back to og:title / page title).");
  if (card === "summary_large_image" && !input.image)
    warnings.push("summary_large_image card set but no twitter:image provided.");
  if (input.title && input.title.length > 70)
    warnings.push("twitter:title over ~70 chars may be truncated.");
  return {
    card,
    title: input.title ?? "",
    description: input.description ?? "",
    image: input.image,
    domain: domainOf(input.url),
    site: input.site,
    large: card === "summary_large_image",
    warnings,
  };
}
