/**
 * GigAI Tools — long-form SEO content types.
 *
 * These are the data contracts for the topic-cluster content surface:
 *  - `Comparison` powers the "X vs Y" pages at /compare/[slug].
 *  - `HowTo` powers the step-by-step guides at /how-to/[slug].
 *
 * Both mirror the tool-registry pattern: one typed default-export file per
 * entry under config/comparisons/ and config/howtos/, aggregated into a single
 * array and read through pure helpers in lib/content. Adding a page is a matter
 * of dropping one typed object in — routes, metadata, JSON-LD, breadcrumbs,
 * sitemap entries and cross-links are all generated.
 *
 * Re-exported from types/index.ts, so consumers import from "@/types".
 */
import type { AccentKey, FaqItem, SeoMeta } from "@/types";

/* ── Comparisons ("X vs Y") ───────────────────────────────────────────────── */

/**
 * A single row of the side-by-side comparison table: one attribute, evaluated
 * for each side. Keep `a`/`b` short — a phrase or one sentence — so the table
 * stays scannable across breakpoints.
 */
export interface ComparisonDimension {
  /** The attribute being compared, e.g. "Compression" or "Transparency". */
  label: string;
  /** How side A handles this dimension. */
  a: string;
  /** How side B handles this dimension. */
  b: string;
}

/**
 * A head-to-head comparison page. Answers a real "X vs Y — which should I use?"
 * search with a genuine verdict, a scannable table, and clear "choose A / choose
 * B" guidance that routes the reader to the right converter tool.
 */
export interface Comparison {
  /** URL slug, e.g. "png-vs-jpg". Unique across all comparisons. */
  slug: string;
  /** Short label for side A, e.g. "PNG". */
  a: string;
  /** Short label for side B, e.g. "JPG". */
  b: string;
  /** H1 / card title, e.g. "PNG vs JPG: Which Image Format Should You Use?". */
  title: string;
  /** One-sentence summary used on the index card and as meta fallback. */
  description: string;
  /** Per-page SEO overrides (title/description/canonical/OG…). */
  seo?: Partial<SeoMeta>;
  /** Accent token for the hero + accents; defaults applied by the route. */
  accent?: AccentKey;
  /** lucide icon name for the hero chip + index card. */
  icon?: string;
  /** 1–3 paragraph intro (each string is one paragraph) framing the choice. */
  intro: string[];
  /** The side-by-side table rows. Order defines the table's row order. */
  dimensions: ComparisonDimension[];
  /** Bullet reasons to choose A. */
  whenA: string[];
  /** Bullet reasons to choose B. */
  whenB: string[];
  /** The honest bottom-line recommendation (1–2 sentences). */
  verdict: string;
  /** Slugs of the tools that action this comparison (e.g. the converters). */
  relatedToolSlugs: string[];
  /** Page FAQ — also emitted as FAQPage JSON-LD. */
  faq: FaqItem[];
  /** Optional cross-links to related comparison pages (by slug). */
  relatedComparisonSlugs?: string[];
}

/* ── How-to guides ────────────────────────────────────────────────────────── */

/** One numbered step in a how-to guide. */
export interface HowToGuideStep {
  /** Imperative step heading, e.g. "Upload your PDF". */
  title: string;
  /** 1–3 sentence explanation of the step. */
  body: string;
}

/**
 * A step-by-step how-to guide targeting a "how to <task>" search. Each guide is
 * anchored to a single tool (`toolSlug`) with an embedded CTA, so the guide both
 * ranks and converts.
 */
export interface HowTo {
  /** URL slug, e.g. "how-to-compress-a-pdf". Unique across all guides. */
  slug: string;
  /** H1 / card title, e.g. "How to Compress a PDF (Free, In Your Browser)". */
  title: string;
  /** One-sentence summary used on the index card and as meta fallback. */
  description: string;
  /** Per-page SEO overrides. */
  seo?: Partial<SeoMeta>;
  /** Accent token for the hero + accents; defaults applied by the route. */
  accent?: AccentKey;
  /** lucide icon name for the hero chip + index card. */
  icon?: string;
  /** 1–3 paragraph intro (each string is one paragraph). */
  intro: string[];
  /** The tool this guide teaches — powers the embedded CTA + related links. */
  toolSlug: string;
  /** The numbered steps, in order. */
  steps: HowToGuideStep[];
  /** Extra tips / best-practices shown after the steps. */
  tips: string[];
  /** Page FAQ — also emitted as FAQPage JSON-LD. */
  faq: FaqItem[];
  /** Additional related tools (beyond `toolSlug`) to cross-link. */
  relatedToolSlugs: string[];
  /** Optional cross-links to related how-to guides (by slug). */
  relatedHowToSlugs?: string[];
}
