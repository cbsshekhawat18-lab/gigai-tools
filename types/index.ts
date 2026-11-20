/**
 * GigAI Tools — shared domain types.
 *
 * This file is the single source of truth for the platform's data shapes.
 * Config files (config/*.ts) and the FastAPI schemas mirror these contracts,
 * so adding a tool is a matter of adding one typed object to the registry.
 */
import type { ComponentType } from "react";

/** A lucide-react icon name, resolved at render time via `lib/icons`. */
export type IconName = string;

/* ── SEO ──────────────────────────────────────────────────────────────────── */

export interface SeoMeta {
  title: string;
  description: string;
  keywords?: string[];
  /** Absolute or root-relative OG image. Falls back to the site default. */
  ogImage?: string;
  /** Root-relative canonical path, e.g. "/category/pdf-tools". */
  canonical?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/* ── Categories ───────────────────────────────────────────────────────────── */

/** A single best-practice lesson shown in a category's Learning Center block. */
export interface CategoryLearningLesson {
  /** lucide icon name for the lesson chip. */
  icon: IconName;
  title: string;
  description: string;
}

/**
 * "Learning Center" content for a category landing — a short, curated set of
 * best-practices/lessons. Optional and generic, so it works for any category.
 */
export interface CategoryLearning {
  /** Small uppercase kicker (defaults to "Learn"). */
  eyebrow?: string;
  /** Section title (e.g. "SEO best practices"). */
  title: string;
  /** One-line supporting sentence under the title. */
  description?: string;
  lessons: CategoryLearningLesson[];
}

export interface Category {
  /** URL slug, e.g. "pdf-tools". */
  slug: string;
  name: string;
  description: string;
  /** lucide icon name */
  icon: IconName;
  /** Tailwind accent token key (see design system): e.g. "sky", "violet". */
  accent: AccentKey;
  featured?: boolean;
  seo?: Partial<SeoMeta>;

  // ── Premium micro-site content (optional; enriches the category landing) ────
  /** 1–2 paragraph SEO body used in the hero + long meta context. */
  longDescription?: string;
  /**
   * Optional "Learning Center" / best-practices block for the category landing.
   * Backward-compatible: categories that omit it render exactly as before. When
   * present, the landing renders an extra content section with these lessons.
   */
  learningCenter?: CategoryLearning;
  /** Short lead-in paragraph shown above the tool grid. */
  intro?: string;
  /** Category-specific FAQ (also emitted as FAQPage JSON-LD). */
  faq?: FaqItem[];
  /** Slugs of the tools to spotlight in "Popular tools" (in order). */
  popularSlugs?: string[];
  /** Slugs of related categories to cross-link (in order). */
  relatedCategories?: string[];
  /**
   * Blog tag/category used to pull "Guides & articles" for this landing.
   * Falls back to the category slug when omitted.
   */
  guidesTag?: string;
}

/* ── Tools ────────────────────────────────────────────────────────────────── */

export type ToolStatus = "live" | "beta" | "coming-soon";

/** Which client-side image engine drives a tool's workspace. */
export type ProcessorKey =
  | "compress"
  | "resize"
  | "crop"
  | "convert"
  | "upscale";

export interface ToolFeature {
  icon: IconName;
  title: string;
  description: string;
}

export interface HowToStep {
  title: string;
  description: string;
}

export interface ToolBenefit {
  title: string;
  description: string;
}

/** A "who it's for" use-case card (professional / student / business, etc.). */
export interface ToolUseCase {
  audience: string;
  title: string;
  description: string;
}

/** A troubleshooting / common-problem entry. */
export interface ToolTroubleshootItem {
  problem: string;
  solution: string;
}

export interface ToolFormats {
  input: string[];
  output: string[];
}

/**
 * The slim subset of a {@link Tool} needed to render a {@link ToolCard} (title,
 * blurb, icon, accent, status flags + the fields the illustration bridge reads).
 * A full `Tool` is assignable to this, so server code can pass registry entries
 * directly — and client islands (personalized homepage rails) can carry a
 * registry-free `Record<slug, ToolCardData>` lookup without bundling the ~250
 * full tool configs (FAQs, long descriptions, SEO copy).
 */
export interface ToolCardData {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: IconName;
  group?: string;
  accent?: AccentKey;
  status?: ToolStatus;
  isNew?: boolean;
  popular?: boolean;
  illustration?: string;
}

/**
 * What an interactive workspace module (`modules/tools/**`) receives as its
 * `tool` prop. Workspaces are client components mounted from the server tool
 * page, so this prop is serialised into every tool page's RSC payload — it
 * must stay a slim projection (see `toWorkspaceToolData`), never the full
 * `Tool` with its SEO/FAQ/how-to copy. Extend this type (and the projector)
 * if a workspace legitimately needs another field.
 */
export interface WorkspaceToolData extends ToolCardData {
  ctaText?: string;
  relatedTools?: string[];
}

/**
 * The Tool Registry entry. This is ALL a new tool needs — everything else
 * (routes, metadata, JSON-LD, breadcrumbs, related tools, cards) is generated.
 */
export interface Tool {
  slug: string;
  title: string;
  description: string;
  /** Category slug (must exist in config/categories). */
  category: string;
  /**
   * Optional sub-category label within the category, e.g. "Meta Tags",
   * "Schema", "Sitemaps", "SEO Preview", "URL Tools", "Validators",
   * "Headers & Security", "Content". When a category's tools set this, its
   * landing page renders an "All <Category> categories" grouped view (sections
   * per group). Backward-compatible: categories whose tools omit it are
   * unaffected.
   */
  group?: string;
  /** lucide icon name */
  icon: IconName;
  keywords?: string[];

  /**
   * Free-form discovery tags (e.g. "converter", "compress", "social-media",
   * "privacy"). Powers collections, recommendations and intent-aware search.
   * Optional and backward-compatible — when absent, `lib/discovery` infers
   * signal from the slug, keywords and category instead.
   */
  tags?: string[];
  /**
   * File extensions this tool consumes/produces, lower-case & dot-less
   * (e.g. ["pdf"], ["png","jpg"], ["csv","json"]). Optional — when absent,
   * `lib/discovery.inferFileTypes` derives them from the slug/keywords.
   */
  fileTypes?: string[];
  /**
   * Audience keys this tool serves (e.g. ["students","developers"]). These map
   * to the use-case/collection audiences in `lib/discovery`. Optional — when
   * absent, discovery infers audience from the category and tags.
   *
   * NOTE: named `audiences` (not `useCases`) because `useCases` is already the
   * rich `ToolUseCase[]` "who it's for" cards below; keeping them distinct
   * preserves backward compatibility.
   */
  audiences?: string[];

  seo?: Partial<SeoMeta>;
  faq?: FaqItem[];
  /**
   * "What this does not do" (specs/per-tool-geo.md): explicit boundaries with
   * the sibling that DOES do it. Stops AI assistants citing the wrong tool -
   * with 262 adjacent tools, disambiguation is worth as much as description.
   */
  notFor?: { text: string; toolSlug?: string }[];
  /** Version history / release notes shown in the "Changelog" section. */
  changelog?: { date: string; change: string }[];
  /** Slugs of related tools; if omitted, siblings in the same category are used. */
  relatedTools?: string[];
  featuredImage?: string;
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  status?: ToolStatus;
  /** ISO date — powers "Recently Added". */
  createdAt?: string;

  /**
   * Illustration seed for the generated branded SVG artwork
   * (see `lib/qr/illustrations`). When set, the tool page renders a unique
   * hero illustration and the tool card shows matching artwork. Use a content
   * type (e.g. "wifi", "upi", "vcard") or the tool slug — both seed a
   * deterministic, on-brand image. When omitted, tools in the `qr-tools`
   * category fall back to their `slug`; every other category is unaffected.
   */
  illustration?: string;

  // ── Micro-site content (present on fully-built "product" tools) ─────────────
  /** Per-tool accent; overrides the category accent for a distinct identity. */
  accent?: AccentKey;
  /** Which client engine powers the interactive workspace. */
  processor?: ProcessorKey;
  /** SEO H1 (may differ from the shorter registry `title`). */
  h1?: string;
  /** Hero sub-headline. */
  tagline?: string;
  /** 1–2 paragraph intro used on the page + as long meta context. */
  longDescription?: string;
  features?: ToolFeature[];
  /** "Why choose this tool" cards. */
  benefits?: ToolBenefit[];
  howTo?: HowToStep[];
  formats?: ToolFormats;
  /** "Who it's for" cards (professional / student / business use cases). */
  useCases?: ToolUseCase[];
  /** Troubleshooting / common problems + fixes. */
  troubleshooting?: ToolTroubleshootItem[];
  /** Tips & best practices. */
  tips?: string[];
  /** Per-tool privacy & security note (in addition to the platform default). */
  security?: string;
  /** True when the tool processes on the server (ephemerally); default client-side. */
  serverSide?: boolean;
  /** CTA button label override. */
  ctaText?: string;
  /**
   * How the tool is referred to INSIDE generated sentences — "How to use the
   * {x}", "Ready to try the {x}?", "What is the {x}?".
   *
   * Defaults to the lower-cased `title`, which reads correctly for the usual
   * noun-phrase name ("how to use the video compressor"). Set this when the
   * title isn't a noun phrase and the default would produce nonsense — e.g.
   * "Video → Work" would otherwise generate "how to use the video → work".
   */
  titleNoun?: string;
  /** Features section heading override (default derives from the tool name). */
  featuresHeading?: string;
  /** Supported-formats note override (default derives from the tool's own formats). */
  formatsNote?: string;
  /** Closing-CTA description override (default derives from the tool name). */
  ctaNote?: string;

  /**
   * Lazy loader for the tool's interactive UI (client component). Code-split
   * per tool via next/dynamic in components/tool/tool-ui-registry.
   */
  load?: () => Promise<{ default: ComponentType<ToolComponentProps> }>;
}

/** Props every future tool component will receive from ToolLayout. */
export interface ToolComponentProps {
  tool: Tool;
}

/* ── Navigation ───────────────────────────────────────────────────────────── */

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  icon?: IconName;
  description?: string;
  children?: NavItem[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: IconName;
}

/* ── Blog ─────────────────────────────────────────────────────────────────── */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** Rendered HTML (from markdown) — present on detail pages only. */
  contentHtml?: string;
  author: string;
  /** ISO date */
  date: string;
  updated?: string;
  cover?: string;
  tags?: string[];
  category?: string;
  /** Slug of the tool this article supports — powers auto "Related articles". */
  tool?: string;
  readingTimeMinutes?: number;
  featured?: boolean;
  seo?: Partial<SeoMeta>;
}

/* ── Search ───────────────────────────────────────────────────────────────── */

export type SearchResultKind = "tool" | "category" | "article";

export interface SearchResult {
  kind: SearchResultKind;
  slug: string;
  title: string;
  description: string;
  href: string;
  icon: IconName;
  category?: string;
}

/* ── Design tokens (kept in sync with styles/globals.css) ─────────────────── */

export type AccentKey =
  | "sky"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan"
  | "indigo"
  | "orange";

/* ── Long-form SEO content (comparisons + how-to guides) ──────────────────── */

export type {
  Comparison,
  ComparisonDimension,
  HowTo,
  HowToGuideStep,
} from "./content";
