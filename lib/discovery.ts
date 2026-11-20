import type { AccentKey, IconName, Tool } from "@/types";
import { ROUTES } from "@/config/constants";
import {
  getAllTools,
  getToolBySlug,
  getToolsByCategory,
  getPopularTools,
  getRecentTools,
  isLiveTool,
} from "@/lib/registry";

/**
 * lib/discovery, the platform's DISCOVERY DATA layer.
 *
 * Everything here is DERIVED from the registry, so it auto-scales as tools are
 * added: file-type facets, curated + auto collections, audience use-cases,
 * guided multi-tool workflows and smart recommendations all fall out of the
 * same ~249 tool configs with zero per-tool wiring required.
 *
 * SERVER-SAFE. These functions import the registry (all tool configs), so they
 * must only be called from server components / build-time code, never bundled
 * into a client island. Client islands should receive slim, pre-computed props.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * FILE TYPES
 * ──────────────────────────────────────────────────────────────────────────── */

/** A file-type facet: an extension and the tools that touch it. */
export interface FileTypeFacet {
  /** dot-less, lower-case extension, e.g. "pdf", "png", "csv". */
  type: string;
  /** How many tools work with this type. */
  count: number;
  /** The tools, in registry order. */
  tools: Tool[];
}

/**
 * Known extensions we recognise inside slugs/keywords. Ordered longest-first so
 * "jpeg" wins over "jpg" and "webm" over "web". Kept intentionally broad -
 * unknown tokens are simply ignored.
 */
const KNOWN_EXTENSIONS = [
  // documents
  "pdf", "docx", "doc", "rtf", "txt", "md", "markdown", "epub", "html", "htm",
  // spreadsheets / data
  "csv", "xlsx", "xls", "json", "jsonld", "yaml", "yml", "xml", "sql", "tsv",
  // slides
  "pptx", "ppt",
  // images
  "png", "jpeg", "jpg", "webp", "gif", "svg", "bmp", "tiff", "ico", "heic", "avif",
  // video
  "mp4", "webm", "mov", "mkv", "avi", "m4v", "flv",
  // audio
  "mp3", "wav", "flac", "aac", "ogg", "m4a", "opus", "wma", "aiff",
  // code / web
  "css", "js", "ts", "jsx", "tsx", "vue",
] as const;

/** Alias map, normalise equivalent tokens to one canonical extension. */
const EXTENSION_ALIASES: Record<string, string> = {
  jpeg: "jpg",
  htm: "html",
  markdown: "md",
  yml: "yaml",
  m4v: "mp4",
  docx: "docx",
};

/**
 * Category-level fallbacks: when a tool's slug/keywords reveal no explicit
 * extension, seed it from the category's dominant file type so it still shows
 * up in the right file-type facets (e.g. a generic PDF tool ⇒ ["pdf"]).
 */
const CATEGORY_DEFAULT_TYPES: Record<string, string[]> = {
  "pdf-tools": ["pdf"],
  "svg-tools": ["svg"],
  "qr-tools": ["png", "svg"],
  "image-tools": ["png", "jpg"],
  "video-tools": ["mp4"],
  "audio-tools": ["mp3", "wav"],
  "document-tools": ["csv", "pdf"],
};

function canonicalExt(ext: string): string {
  return EXTENSION_ALIASES[ext] ?? ext;
}

/**
 * Derive the file extensions a tool works with from its explicit `fileTypes`,
 * else from tokens in its slug + keywords, else from a category default.
 * Deterministic and order-stable. Always returns lower-case, dot-less, unique.
 */
export function inferFileTypes(tool: Tool): string[] {
  // 1. Explicit wins.
  if (tool.fileTypes && tool.fileTypes.length > 0) {
    return dedupe(tool.fileTypes.map((t) => canonicalExt(t.toLowerCase())));
  }

  const found: string[] = [];
  const haystackTokens = tokenize(
    [tool.slug, ...(tool.keywords ?? [])].join(" ").toLowerCase(),
  );
  const tokenSet = new Set(haystackTokens);

  for (const ext of KNOWN_EXTENSIONS) {
    if (tokenSet.has(ext)) found.push(canonicalExt(ext));
  }

  // 2. Category fallback when nothing explicit surfaced.
  if (found.length === 0) {
    const fallback = CATEGORY_DEFAULT_TYPES[tool.category];
    if (fallback) found.push(...fallback);
  }

  return dedupe(found);
}

/**
 * File-type hubs with fewer than this many matching tools are treated as
 * thin content: still rendered (so links never 404) but noindexed and excluded
 * from the sitemap. Guards against auto-generated near-empty long-tail hubs
 * (e.g. a single-tool "TSX tools" page).
 */
export const FILE_TYPE_MIN_INDEXED = 3;

/** All file types across the registry (live tools only), most-supported first. */
export function getAllFileTypes(): FileTypeFacet[] {
  const map = new Map<string, Tool[]>();
  for (const tool of getAllTools().filter(isLiveTool)) {
    for (const type of inferFileTypes(tool)) {
      const list = map.get(type) ?? [];
      list.push(tool);
      map.set(type, list);
    }
  }
  return [...map.entries()]
    .map(([type, tools]) => ({ type, count: tools.length, tools }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
}

/** Every tool that works with a given file type (dot-less, case-insensitive). */
export function getToolsByFileType(type: string): Tool[] {
  const target = canonicalExt(type.trim().toLowerCase().replace(/^\./, ""));
  if (!target) return [];
  return getAllTools().filter(
    (tool) => isLiveTool(tool) && inferFileTypes(tool).includes(target),
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * COLLECTIONS
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * A collection groups tools under a browsable theme. Members are resolved
 * either from an explicit `toolSlugs` list (curated) or a `filter` predicate
 * (auto). `getCollectionTools` handles both.
 */
export interface Collection {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  accent: AccentKey;
  /** Curated, ordered member slugs. Missing slugs are skipped safely. */
  toolSlugs?: string[];
  /** Auto membership predicate (used when `toolSlugs` is absent). */
  filter?: (tool: Tool) => boolean;
  /** Cap on how many tools the collection surfaces (auto collections). */
  limit?: number;
  /**
   * P2 audit 2026-08-21: time-variant list collections (new-tools, trending)
   * overlap most-popular by 83-88% - classic near-duplicates. They stay
   * browsable but are noindexed and excluded from the sitemap; most-popular
   * is the one canonical "greatest hits" page.
   */
  noindex?: boolean;
}

const COLLECTIONS: Collection[] = [
  // ── Auto / dynamic ─────────────────────────────────────────────────────────
  {
    slug: "most-popular",
    title: "Most Popular",
    description: "The tools people reach for most, a fast start if you're new.",
    icon: "Flame",
    accent: "orange",
    filter: (t) => t.popular === true,
    limit: 24,
  },
  {
    slug: "new-tools",
    title: "New Tools",
    description: "The latest additions to the platform, freshly shipped.",
    icon: "Sparkles",
    accent: "emerald",
    filter: (t) => t.isNew === true,
    limit: 24,
    noindex: true,
  },
  {
    slug: "trending",
    title: "Trending",
    description: "Popular and recently added, what's hot right now.",
    icon: "TrendingUp",
    accent: "rose",
    filter: (t) => t.popular === true || t.isNew === true,
    limit: 24,
    noindex: true,
  },

  // ── Audience essentials ────────────────────────────────────────────────────
  {
    slug: "student-essentials",
    title: "Student Essentials",
    description: "Convert, compress and format everything an assignment throws at you.",
    icon: "GraduationCap",
    accent: "sky",
    toolSlugs: [
      "compress-pdf", "merge-pdf", "split-pdf", "pdf-to-word", "word-to-pdf",
      "jpg-to-pdf", "markdown-to-pdf", "word-counter", "image-compressor",
      "pdf-to-jpg", "ocr-pdf", "character-counter",
    ],
  },
  {
    slug: "business-essentials",
    title: "Business Essentials",
    description: "Documents, invoices and QR codes to run the day-to-day.",
    icon: "Briefcase",
    accent: "amber",
    toolSlugs: [
      "merge-pdf", "compress-pdf", "pdf-password-protect",
      "document-signature", "excel-to-pdf", "csv-to-excel", "qr-code-generator",
      "vcard-qr-code-generator", "document-watermark", "pdf-to-excel",
    ],
  },
  {
    slug: "developer-favorites",
    title: "Developer Favorites",
    description: "Format, validate, encode and generate, the daily dev toolbox.",
    icon: "Code2",
    accent: "violet",
    toolSlugs: [
      "json-formatter", "base64-encoder", "jwt-decoder", "uuid-generator",
      "hash-generator", "regex-tester", "url-encoder", "sql-formatter",
      "json-to-typescript", "diff-checker", "cron-generator", "svg-to-react",
    ],
  },
  {
    slug: "designer",
    title: "Designer Toolkit",
    description: "Optimize images and vectors, generate assets, keep everything crisp.",
    icon: "PenTool",
    accent: "orange",
    toolSlugs: [
      "svg-optimizer", "svg-to-react", "image-compressor",
      "image-resizer", "crop-image", "webp-converter", "svg-blob-generator",
      "svg-gradient-generator", "png-to-svg", "svg-wave-generator", "svg-color-editor",
    ],
  },
  {
    slug: "marketing",
    title: "Marketing Toolkit",
    description: "SEO markup, social previews and campaign QR codes that convert.",
    icon: "Megaphone",
    accent: "emerald",
    toolSlugs: [
      "meta-tag-generator", "open-graph-generator", "google-serp-preview",
      "twitter-card-generator", "utm-builder", "campaign-url-builder",
      "qr-code-generator", "bulk-qr-code-generator", "schema-generator",
      "keyword-density-checker", "image-compressor",
    ],
  },
  {
    slug: "content-creation",
    title: "Content Creation",
    description: "Trim clips, make GIFs, master audio and prep thumbnails.",
    icon: "Clapperboard",
    accent: "cyan",
    toolSlugs: [
      "video-trimmer", "video-to-gif", "video-compressor", "video-thumbnail-generator",
      "audio-trimmer", "audio-normalizer", "extract-audio", "ringtone-maker",
      "crop-image", "image-resizer",
    ],
  },
  {
    slug: "productivity",
    title: "Productivity",
    description: "Fast everyday utilities that get a task done and out of your way.",
    icon: "Zap",
    accent: "indigo",
    toolSlugs: [
      "merge-pdf", "compress-pdf", "image-compressor", "qr-code-generator",
      "word-counter", "csv-to-json", "json-formatter", "password-generator",
      "document-comparer", "unix-timestamp-converter",
    ],
  },

  // ── Domain collections (map to categories, curated highlights) ─────────────
  {
    slug: "image-editing",
    title: "Image Editing",
    description: "Compress, convert, resize, crop and clean up any image.",
    icon: "Image",
    accent: "sky",
    filter: (t) => t.category === "image-tools",
  },
  {
    slug: "pdf-management",
    title: "PDF Management",
    description: "Merge, split, compress, convert and secure your PDFs.",
    icon: "FileText",
    accent: "rose",
    filter: (t) => t.category === "pdf-tools",
  },
  {
    slug: "website-seo",
    title: "Website & SEO",
    description: "Meta tags, schema, sitemaps and search/social previews.",
    icon: "Search",
    accent: "emerald",
    filter: (t) => t.category === "seo-tools",
  },
  {
    slug: "qr-codes",
    title: "QR Codes",
    description: "Design, brand, batch and decode QR codes for anything.",
    icon: "QrCode",
    accent: "indigo",
    filter: (t) => t.category === "qr-tools",
  },
  {
    slug: "video-editing",
    title: "Video Editing",
    description: "Trim, convert, compress and grab audio from video.",
    icon: "Video",
    accent: "cyan",
    filter: (t) => t.category === "video-tools",
  },
  {
    slug: "audio-editing",
    title: "Audio Editing",
    description: "Trim, convert, record, merge and master audio.",
    icon: "AudioLines",
    accent: "rose",
    filter: (t) => t.category === "audio-tools",
  },
];

/** All collections, in curated order. */
export function getCollections(): Collection[] {
  return COLLECTIONS;
}

/** Look up a single collection by slug. */
export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

/**
 * Resolve a collection's member tools. Curated `toolSlugs` are resolved in
 * order (missing/non-live slugs skipped); auto collections apply their
 * `filter` over live tools only. Both respect an optional `limit`.
 */
export function getCollectionTools(collection: Collection): Tool[] {
  let tools: Tool[];

  if (collection.toolSlugs && collection.toolSlugs.length > 0) {
    tools = collection.toolSlugs
      .map((slug) => getToolBySlug(slug))
      .filter((t): t is Tool => t !== undefined && isLiveTool(t));
  } else if (collection.filter) {
    const matches = collection.filter;
    tools = getAllTools().filter((t) => isLiveTool(t) && matches(t));
  } else {
    tools = [];
  }

  return typeof collection.limit === "number"
    ? tools.slice(0, collection.limit)
    : tools;
}

/* ────────────────────────────────────────────────────────────────────────────
 * USE-CASES (audiences)
 * ──────────────────────────────────────────────────────────────────────────── */

/** An audience-centric journey: "tools for X". */
export interface UseCase {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  accent: AccentKey;
  /** Audience key (matches `Tool.audiences` entries). */
  audience: string;
  /** Curated, ordered member slugs. */
  toolSlugs: string[];
}

const USE_CASES: UseCase[] = [
  {
    slug: "for-students",
    title: "Tools for Students",
    description: "Everything to turn notes, readings and assignments into polished, submittable work.",
    icon: "GraduationCap",
    accent: "sky",
    audience: "students",
    toolSlugs: [
      "compress-pdf", "merge-pdf", "split-pdf", "pdf-to-word", "word-to-pdf",
      "jpg-to-pdf", "markdown-to-pdf", "word-counter", "ocr-pdf", "pdf-to-jpg",
    ],
  },
  {
    slug: "for-teachers",
    title: "Tools for Teachers",
    description: "Build handouts, mark up documents and share resources with a scan.",
    icon: "BookOpen",
    accent: "amber",
    audience: "teachers",
    toolSlugs: [
      "merge-pdf", "compress-pdf", "document-watermark", "document-page-number",
      "excel-to-pdf", "markdown-to-pdf", "qr-code-generator", "pdf-password-protect",
      "jpg-to-pdf", "document-signature",
    ],
  },
  {
    slug: "for-developers",
    title: "Tools for Developers",
    description: "Format, validate, encode, generate and diff, without leaving the browser.",
    icon: "Code2",
    accent: "violet",
    audience: "developers",
    toolSlugs: [
      "json-formatter", "base64-encoder", "jwt-decoder", "uuid-generator",
      "hash-generator", "regex-tester", "sql-formatter", "diff-checker",
      "json-to-typescript", "svg-to-react",
    ],
  },
  {
    slug: "for-designers",
    title: "Tools for Designers",
    description: "Keep vectors tiny, images crisp and assets export-ready.",
    icon: "PenTool",
    accent: "orange",
    audience: "designers",
    toolSlugs: [
      "svg-optimizer", "svg-to-react", "image-compressor",
      "image-resizer", "crop-image", "webp-converter", "svg-blob-generator",
      "svg-gradient-generator", "png-to-svg",
    ],
  },
  {
    slug: "for-business",
    title: "Tools for Business",
    description: "Invoices, secure documents and QR codes to run operations.",
    icon: "Briefcase",
    accent: "amber",
    audience: "business",
    toolSlugs: [
      "merge-pdf", "compress-pdf", "pdf-password-protect",
      "document-signature", "excel-to-pdf", "csv-to-excel", "vcard-qr-code-generator",
      "document-watermark", "qr-code-generator",
    ],
  },
  {
    slug: "for-marketers",
    title: "Tools for Marketers",
    description: "SEO markup, social cards and trackable campaign links & codes.",
    icon: "Megaphone",
    accent: "emerald",
    audience: "marketing",
    toolSlugs: [
      "meta-tag-generator", "open-graph-generator", "google-serp-preview",
      "twitter-card-generator", "utm-builder", "campaign-url-builder",
      "bulk-qr-code-generator", "schema-generator", "keyword-density-checker",
      "qr-code-generator",
    ],
  },
  {
    slug: "for-social-media",
    title: "Tools for Social Media",
    description: "Resize, crop, preview and package posts for every platform.",
    icon: "Share2",
    accent: "rose",
    audience: "social-media",
    toolSlugs: [
      "image-resizer", "crop-image", "open-graph-preview", "twitter-preview",
      "instagram-qr-code-generator", "video-to-gif", "video-trimmer",
      "image-compressor", "video-thumbnail-generator",
    ],
  },
  {
    slug: "for-content-creators",
    title: "Tools for Content Creators",
    description: "Trim, convert and master video & audio, then prep the thumbnail.",
    icon: "Clapperboard",
    accent: "cyan",
    audience: "content-creators",
    toolSlugs: [
      "video-trimmer", "video-compressor", "video-to-gif", "video-thumbnail-generator",
      "extract-audio", "audio-trimmer", "audio-normalizer", "ringtone-maker",
      "crop-image", "image-resizer",
    ],
  },
  {
    slug: "for-photographers",
    title: "Tools for Photographers",
    description: "Compress, convert, resize and watermark shots without quality loss you don't choose.",
    icon: "Camera",
    accent: "indigo",
    audience: "photographers",
    toolSlugs: [
      "image-compressor", "image-resizer", "crop-image", "webp-converter",
      "png-to-jpg", "jpg-to-png", "image-upscaler",
      "jpg-to-pdf", "pdf-to-jpg",
    ],
  },
];

/** All audience use-cases, in curated order. */
export function getUseCases(): UseCase[] {
  return USE_CASES;
}

/** Look up a single use-case by slug. */
export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}

/** Resolve a use-case's member tools (curated order, missing/non-live slugs skipped). */
export function getUseCaseTools(useCase: UseCase): Tool[] {
  return useCase.toolSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is Tool => t !== undefined && isLiveTool(t));
}

/* ────────────────────────────────────────────────────────────────────────────
 * WORKFLOWS (guided multi-tool journeys)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface WorkflowStep {
  toolSlug: string;
  /** What this step accomplishes in the journey. */
  label: string;
}

export interface Workflow {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  accent: AccentKey;
  steps: WorkflowStep[];
}

const WORKFLOWS: Workflow[] = [
  {
    slug: "create-website",
    title: "Launch a search-ready website",
    description:
      "Generate every piece of markup a new page needs (meta tags, social cards, schema, robots and sitemap) then preview how it looks in Google.",
    icon: "Globe",
    accent: "emerald",
    steps: [
      { toolSlug: "meta-tag-generator", label: "Write your title & meta description" },
      { toolSlug: "open-graph-generator", label: "Design the social share card" },
      { toolSlug: "schema-generator", label: "Add JSON-LD structured data" },
      { toolSlug: "robots-txt-generator", label: "Set crawl rules with robots.txt" },
      { toolSlug: "xml-sitemap-generator", label: "Ship an XML sitemap" },
      { toolSlug: "google-serp-preview", label: "Preview your Google snippet" },
    ],
  },
  {
    slug: "optimize-images",
    title: "Optimize images for the web",
    description:
      "Take a heavy source image and make it fast: crop, resize, compress and convert to a modern format.",
    icon: "Image",
    accent: "sky",
    steps: [
      { toolSlug: "crop-image", label: "Crop to the framing you want" },
      { toolSlug: "image-resizer", label: "Resize to target dimensions" },
      { toolSlug: "webp-converter", label: "Convert to lightweight WebP" },
      { toolSlug: "image-compressor", label: "Compress to the smallest good size" },
    ],
  },
  {
    slug: "publish-a-pdf",
    title: "Assemble & publish a PDF",
    description:
      "Turn loose files into one clean, shareable PDF: convert sources, merge, compress, secure and page-number the result.",
    icon: "FileText",
    accent: "rose",
    steps: [
      { toolSlug: "jpg-to-pdf", label: "Convert images/scans to PDF pages" },
      { toolSlug: "merge-pdf", label: "Merge everything into one document" },
      { toolSlug: "document-page-number", label: "Add page numbers" },
      { toolSlug: "compress-pdf", label: "Compress for easy sharing" },
      { toolSlug: "pdf-password-protect", label: "Protect it with a password" },
    ],
  },
  {
    slug: "make-a-qr-campaign",
    title: "Run a QR code campaign",
    description:
      "Build trackable, on-brand QR codes at scale: craft a link with UTM tags, brand a code, batch-generate the set and confirm it scans.",
    icon: "QrCode",
    accent: "indigo",
    steps: [
      { toolSlug: "utm-builder", label: "Build a trackable campaign URL" },
      { toolSlug: "qr-code-with-logo", label: "Brand a QR code with your logo" },
      { toolSlug: "bulk-qr-code-generator", label: "Batch-generate the full set" },
      { toolSlug: "qr-code-scanner", label: "Scan-test before you print" },
    ],
  },
  {
    slug: "get-cited-by-ai",
    title: "Get your page cited by AI",
    description:
      "Work the AI-visibility stack in the order that matters: confirm crawlers can reach you, confirm they can read you without JavaScript, then make the content worth quoting.",
    icon: "Radar",
    accent: "orange",
    steps: [
      { toolSlug: "geo-audit", label: "Audit the page end to end" },
      { toolSlug: "ai-crawler-access-checker", label: "Check AI crawlers aren't blocked" },
      { toolSlug: "js-rendering-checker", label: "Confirm content exists without JavaScript" },
      { toolSlug: "content-citability-scorer", label: "Score what's actually citable" },
      { toolSlug: "retrieval-chunk-preview", label: "Check the fragments survive alone" },
      { toolSlug: "answer-snippet-checker", label: "Make every section answer first" },
    ],
  },
  {
    slug: "produce-a-video-clip",
    title: "Produce a shareable video clip",
    description:
      "Cut a highlight and prep it for every surface: trim, compress, grab a thumbnail, and export a GIF version for chat and social.",
    icon: "Clapperboard",
    accent: "cyan",
    steps: [
      { toolSlug: "video-trimmer", label: "Trim to the highlight" },
      { toolSlug: "video-compressor", label: "Compress for fast upload" },
      { toolSlug: "video-thumbnail-generator", label: "Grab a thumbnail frame" },
      { toolSlug: "video-to-gif", label: "Export a GIF version" },
      { toolSlug: "extract-audio", label: "Pull the audio track (optional)" },
    ],
  },
];

/** All workflows, in curated order. */
export function getWorkflows(): Workflow[] {
  return WORKFLOWS;
}

/** Look up a single workflow by slug. */
export function getWorkflowBySlug(slug: string): Workflow | undefined {
  return WORKFLOWS.find((w) => w.slug === slug);
}

/** Resolve a workflow's steps to `{ step, tool }` pairs (missing/non-live tools dropped). */
export function getWorkflowStepTools(
  workflow: Workflow,
): { step: WorkflowStep; tool: Tool }[] {
  return workflow.steps
    .map((step) => {
      const tool = getToolBySlug(step.toolSlug);
      return tool && isLiveTool(tool) ? { step, tool } : null;
    })
    .filter((x): x is { step: WorkflowStep; tool: Tool } => x !== null);
}

/** Workflows that include the given tool as any step. */
export function getWorkflowsForTool(tool: Tool): Workflow[] {
  return WORKFLOWS.filter((w) => w.steps.some((s) => s.toolSlug === tool.slug));
}

/* ────────────────────────────────────────────────────────────────────────────
 * RECOMMENDATIONS
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Explicit "next step" pairs: the tool you likely want AFTER this one. Higher
 * signal than category siblings. Keyed by slug ⇒ ordered follow-up slugs.
 */
const NEXT_STEP_PAIRS: Record<string, string[]> = {
  "compress-pdf": ["merge-pdf", "split-pdf", "pdf-password-protect", "pdf-to-word"],
  "merge-pdf": ["compress-pdf", "split-pdf", "document-page-number", "pdf-password-protect"],
  "split-pdf": ["merge-pdf", "extract-pdf-pages", "compress-pdf", "reorder-pdf-pages"],
  "pdf-to-word": ["word-to-pdf", "compress-pdf", "pdf-to-excel", "ocr-pdf"],
  "word-to-pdf": ["compress-pdf", "merge-pdf", "pdf-password-protect"],
  "jpg-to-pdf": ["merge-pdf", "compress-pdf", "pdf-to-jpg"],
  "png-to-jpg": ["image-compressor", "image-resizer", "crop-image", "webp-converter"],
  "jpg-to-png": ["image-compressor", "webp-converter"],
  "webp-converter": ["image-compressor", "image-resizer", "png-to-jpg"],
  "image-compressor": ["image-resizer", "crop-image", "webp-converter", "png-to-jpg"],
  "image-resizer": ["image-compressor", "crop-image", "webp-converter"],
  "crop-image": ["image-resizer", "image-compressor", "png-to-jpg"],
  "meta-tag-generator": ["open-graph-generator", "google-serp-preview", "schema-generator"],
  "open-graph-generator": ["twitter-card-generator", "open-graph-preview", "meta-tag-generator"],
  "schema-generator": ["rich-results-preview", "schema-validator", "meta-tag-generator"],
  "robots-txt-generator": ["xml-sitemap-generator", "robots-txt-validator"],
  "xml-sitemap-generator": ["robots-txt-generator", "sitemap-validator", "html-sitemap-generator"],
  "video-trimmer": ["video-compressor", "video-to-gif", "extract-audio", "video-thumbnail-generator"],
  "video-compressor": ["video-trimmer", "video-converter", "video-to-gif"],
  "video-to-gif": ["video-trimmer", "video-compressor"],
  "audio-trimmer": ["audio-normalizer", "mp3-converter", "ringtone-maker", "audio-merger"],
  "extract-audio": ["audio-trimmer", "mp3-converter", "audio-normalizer"],
  "csv-to-json": ["json-formatter", "json-to-csv", "csv-to-excel"],
  "json-formatter": ["json-validator", "json-to-csv", "json-to-typescript"],
  "svg-optimizer": ["svg-to-react", "svg-minifier", "svg-to-data-uri"],
  "qr-code-generator": ["qr-code-with-logo", "bulk-qr-code-generator", "qr-code-scanner"],
};

/** Overlap of two string arrays (case-insensitive), as a count. */
function overlapCount(a: string[] | undefined, b: string[] | undefined): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const set = new Set(b.map((x) => x.toLowerCase()));
  let n = 0;
  for (const x of a) if (set.has(x.toLowerCase())) n++;
  return n;
}

/**
 * Smart related tools, richer than same-category siblings. Blends, in priority
 * order: explicit `relatedTools`, curated next-step pairs, then a score built
 * from shared category + shared tags + shared file types. Deterministic.
 */
export function getRecommendedTools(tool: Tool, n = 6): Tool[] {
  const picked = new Map<string, Tool>();
  const add = (t: Tool | undefined) => {
    if (t && isLiveTool(t) && t.slug !== tool.slug && !picked.has(t.slug)) {
      picked.set(t.slug, t);
    }
  };

  // 1. Author-declared related tools (highest intent).
  for (const slug of tool.relatedTools ?? []) add(getToolBySlug(slug));

  // 2. Curated next-step pairs.
  for (const slug of NEXT_STEP_PAIRS[tool.slug] ?? []) add(getToolBySlug(slug));

  // 3. Scored candidates from the whole registry.
  if (picked.size < n) {
    const myTypes = inferFileTypes(tool);
    const scored = getAllTools()
      .filter((t) => t.slug !== tool.slug && !picked.has(t.slug) && isLiveTool(t))
      .map((t) => {
        let score = 0;
        if (t.category === tool.category) score += 2;
        score += overlapCount(tool.tags, t.tags) * 3;
        score += overlapCount(myTypes, inferFileTypes(t)) * 2;
        if (tool.group && t.group === tool.group) score += 2;
        return { tool: t, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title));

    for (const { tool: t } of scored) {
      if (picked.size >= n) break;
      add(t);
    }
  }

  // 4. Last resort: category siblings to fill the quota.
  if (picked.size < n) {
    for (const t of getToolsByCategory(tool.category)) {
      if (picked.size >= n) break;
      add(t);
    }
  }

  return [...picked.values()].slice(0, n);
}

/* ────────────────────────────────────────────────────────────────────────────
 * INTERNAL HELPERS
 * ──────────────────────────────────────────────────────────────────────────── */

/** Split text into alphanumeric tokens (splits "png-to-jpg" ⇒ png, to, jpg). */
function tokenize(text: string): string[] {
  return text.split(/[^a-z0-9]+/i).filter(Boolean);
}

/** Order-stable unique. */
function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

/* Re-exported registry conveniences so discovery pages can pull popular/recent
 * lists from one import without also importing the registry directly. */
export { getPopularTools, getRecentTools };
export { ROUTES };
