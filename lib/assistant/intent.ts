import type { Tool } from "@/types";
import { ROUTES } from "@/config/constants";
import { toolDifficulty, toolEstTime } from "@/lib/tool-meta";
import { searchAll } from "@/lib/search";
import {
  getToolBySlug,
  getCategoryBySlug,
  getAllCategories,
  getPopularTools,
  getRecentTools as getRecentlyAddedTools,
  isLiveTool,
} from "@/lib/registry";
import { TRENDING_SEARCHES } from "@/config/constants";
import {
  getRecommendedTools,
  getWorkflowsForTool,
  getWorkflowBySlug,
  getWorkflowStepTools,
  getWorkflows,
  getToolsByFileType,
  getAllFileTypes,
  getCollections,
  getUseCases,
  type Workflow,
} from "@/lib/discovery";
import {
  getHowTosForTool,
  getComparisonsForTool,
  getAllHowTos,
  getAllComparisons,
} from "@/lib/content";
import { INTENT_MAP } from "@/lib/assistant/intent-map";
import type {
  AssistantContext,
  AssistantResult,
  Difficulty,
  EverythingKind,
  EverythingResult,
  IntentRule,
  LinkRec,
  Processing,
  ToolRec,
  WorkflowRec,
} from "@/lib/assistant/types";

/**
 * lib/assistant/intent, the GigAI Assistant INTENT ENGINE.
 *
 * Deterministic, local, private "product expert" that maps a natural-language
 * problem to REAL tools/pages. No LLM, no network. Every returned slug is
 * validated against the registry (getToolBySlug), so the assistant can never
 * hallucinate a tool or page that does not exist.
 *
 * Resolution order in `resolveIntent`:
 *   (a) a file extension in the query      ⇒ file-type intent (file-type hub)
 *   (b) an INTENT_MAP rule                 ⇒ curated intent
 *   (c) fuzzy searchAll fallback           ⇒ search intent
 * The chosen primary tool is then enriched with recommendations, workflows,
 * how-to guides, comparisons and (optionally) blog posts for SEO cross-linking.
 *
 * This module imports the registry/discovery/content layers, so it MUST be
 * lazy-loaded by the UI (dynamic import on first open). Never bundled into the
 * initial page. It contains no React and no server-only imports (blog data is
 * injected via AssistantContext rather than imported).
 */

/* ────────────────────────────────────────────────────────────────────────────
 * TOOL ENRICHMENT
 * ──────────────────────────────────────────────────────────────────────────── */

/** Known AI-model-backed tools (in addition to processor: upscale). */
const AI_TOOL_SLUGS = new Set(["image-upscaler"]);

/** Where a tool runs, drives the privacy/upload hint chip. */
function processingOf(tool: Tool): Processing {
  if (tool.processor === "upscale") return "AI";
  if (AI_TOOL_SLUGS.has(tool.slug)) return "AI";
  if (tool.serverSide) return "Server";
  return "Browser";
}

// Difficulty + est-time derivations live in `lib/tool-meta` (shared with the
// tool page's "at a glance" strip so both surfaces always agree).
function difficultyOf(tool: Tool): Difficulty {
  return toolDifficulty(tool);
}

function estTimeOf(tool: Tool): string {
  return toolEstTime(tool);
}

/**
 * Build a `ToolRec` from a live tool. `why` prefers a rule's expert note, else
 * a templated one-liner derived from the tool's own copy. Never LLM-generated.
 */
function toToolRec(tool: Tool, why?: string): ToolRec {
  return {
    slug: tool.slug,
    title: tool.title,
    category: tool.category,
    href: ROUTES.tool(tool.slug),
    why: why ?? defaultWhy(tool),
    estTime: estTimeOf(tool),
    difficulty: difficultyOf(tool),
    processing: processingOf(tool),
    related: getRecommendedTools(tool, 4).map((t) => t.slug),
  };
}

/** A short, templated reason a tool fits: trimmed from its own description. */
function defaultWhy(tool: Tool): string {
  const first = tool.description.split(/(?<=[.!?])\s/)[0]?.trim() ?? tool.description;
  return first.length > 120 ? `${first.slice(0, 117).trimEnd()}…` : first;
}

/* ────────────────────────────────────────────────────────────────────────────
 * SLUG VALIDATION (no hallucination)
 * ──────────────────────────────────────────────────────────────────────────── */

/** Resolve slugs to live tools, in order, dropping anything that doesn't exist. */
function validTools(slugs: readonly string[]): Tool[] {
  const seen = new Set<string>();
  const out: Tool[] = [];
  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    const tool = getToolBySlug(slug);
    if (!tool || !isLiveTool(tool)) continue; // hallucination / coming-soon guard
    seen.add(slug);
    out.push(tool);
  }
  return out;
}

/** Build validated `ToolRec[]` for alternatives, excluding the primary slug. */
function altRecs(slugs: readonly string[], excludeSlug: string, limit = 4): ToolRec[] {
  return validTools(slugs.filter((s) => s !== excludeSlug))
    .slice(0, limit)
    .map((t) => toToolRec(t));
}

/* ────────────────────────────────────────────────────────────────────────────
 * WORKFLOW / LINK ENRICHMENT
 * ──────────────────────────────────────────────────────────────────────────── */

function toWorkflowRec(workflow: Workflow): WorkflowRec {
  return {
    slug: workflow.slug,
    title: workflow.title,
    href: ROUTES.workflow(workflow.slug),
    steps: getWorkflowStepTools(workflow).map(({ tool }) => ({
      slug: tool.slug,
      title: tool.title,
      href: ROUTES.tool(tool.slug),
    })),
  };
}

/** How-to guides for a tool → LinkRec[], validated (guides always have a title). */
function guideLinks(toolSlug: string, limit = 3): LinkRec[] {
  return getHowTosForTool(toolSlug, limit).map((h) => ({
    title: h.title,
    href: ROUTES.howTo(h.slug),
    icon: h.icon ?? "BookOpen",
    description: h.description,
  }));
}

/** Comparisons for a tool → LinkRec[]. */
function comparisonLinks(toolSlug: string, limit = 3): LinkRec[] {
  return getComparisonsForTool(toolSlug, limit).map((c) => ({
    title: c.title,
    href: ROUTES.comparison(c.slug),
    icon: c.icon ?? "GitCompare",
    description: c.description,
  }));
}

/**
 * Blog links for a tool; from INJECTED context only (lib/blog is server-only +
 * async, so the engine never imports it). Matches posts whose `tool` is this
 * slug, else posts tagged with the tool's category. Empty when no context.
 */
function blogLinks(tool: Tool, ctx: AssistantContext | undefined, limit = 3): LinkRec[] {
  const posts = ctx?.posts;
  if (!posts || posts.length === 0) return [];
  const direct = posts.filter((p) => p.tool === tool.slug);
  const byCategory = posts.filter(
    (p) => p.tool !== tool.slug && (p.tags?.includes(tool.category) || p.category === tool.category),
  );
  return [...direct, ...byCategory].slice(0, limit).map((p) => ({
    title: p.title,
    href: ROUTES.blogPost(p.slug),
    icon: "Newspaper",
    description: p.description,
  }));
}

/** Choose the best workflow for a tool: explicit rule slug, else first for tool. */
function workflowFor(tool: Tool, ruleWorkflow?: string): WorkflowRec | undefined {
  if (ruleWorkflow) {
    const w = getWorkflowBySlug(ruleWorkflow);
    if (w) return toWorkflowRec(w);
  }
  const [first] = getWorkflowsForTool(tool);
  return first ? toWorkflowRec(first) : undefined;
}

/** Assemble the enriched result around a resolved primary tool. */
function enrich(
  query: string,
  intentType: AssistantResult["intentType"],
  primaryTool: Tool,
  opts: {
    answer: string;
    why?: string;
    alternativeSlugs: readonly string[];
    ruleWorkflow?: string;
    ctx?: AssistantContext;
  },
): AssistantResult {
  const primary = toToolRec(primaryTool, opts.why);
  // Alternatives: rule-provided first, topped up with smart recommendations.
  const recommendedSlugs = getRecommendedTools(primaryTool, 6).map((t) => t.slug);
  const alternatives = altRecs(
    [...opts.alternativeSlugs, ...recommendedSlugs],
    primaryTool.slug,
  );

  const result: AssistantResult = {
    query,
    intentType,
    answer: opts.answer,
    primary,
    alternatives,
    guides: guideLinks(primaryTool.slug),
    blogs: blogLinks(primaryTool, opts.ctx),
    comparisons: comparisonLinks(primaryTool.slug),
  };

  const workflow = workflowFor(primaryTool, opts.ruleWorkflow);
  if (workflow) result.workflow = workflow;
  return result;
}

/* ────────────────────────────────────────────────────────────────────────────
 * FILE-TYPE DETECTION  (resolution step a)
 * ──────────────────────────────────────────────────────────────────────────── */

/** Extensions we detect standalone in a query, longest-first (jpeg before jpg). */
const QUERY_EXTENSIONS = [
  "jpeg", "markdown", "docx", "webp", "html", "json", "yaml", "tiff", "flac",
  "webm", "opus", "aiff", "epub",
  "pdf", "png", "jpg", "gif", "svg", "bmp", "ico", "heic", "avif",
  "csv", "xlsx", "xls", "xml", "sql", "tsv", "txt", "rtf", "doc",
  "mp4", "mov", "mkv", "avi", "m4v", "flv",
  "mp3", "wav", "aac", "ogg", "m4a", "wma",
  "ppt", "pptx", "md",
] as const;

/**
 * Detect a standalone file-extension token in the query (word-boundary aware, so
 * "pdf" matches but "sportfishing" does not). Returns the first match, or null.
 * Skipped when the query looks like a conversion ("x to y") so those hit the
 * richer INTENT_MAP rules instead of a generic file-type hub.
 */
function detectFileType(tokens: Set<string>): string | null {
  for (const ext of QUERY_EXTENSIONS) {
    if (tokens.has(ext)) return ext;
  }
  return null;
}

/**
 * Rank a tool's relevance to a file-type hub (LOWER = better). Rewards the
 * extension appearing at the start of the slug, then anywhere in the slug, then
 * in keywords, then falls back to popularity so the hub always leads with a
 * sensible, on-topic tool rather than registry order.
 */
function fileTypeRank(tool: Tool, ext: string): number {
  const slug = tool.slug;
  if (slug.startsWith(`${ext}-`) || slug.startsWith(`${ext}2`)) return 0;
  if (slug.includes(`-${ext}-`) || slug.endsWith(`-${ext}`) || slug.includes(ext)) return 1;
  if ((tool.keywords ?? []).some((k) => k.toLowerCase() === ext)) return 2;
  return tool.popular ? 3 : 4;
}

/** Build a file-type intent result: the file-type hub + tools for that type. */
function fileTypeResult(query: string, ext: string, ctx?: AssistantContext): AssistantResult | null {
  const tools = getToolsByFileType(ext);
  if (tools.length === 0) return null;

  // Prefer a tool whose slug/keywords centre on this extension (so "csv" leads
  // with a CSV tool, not whatever happens to sort first in registry order).
  const ranked = [...tools].sort((a, b) => fileTypeRank(a, ext) - fileTypeRank(b, ext));
  const [primaryTool, ...rest] = ranked;
  if (!primaryTool) return null;

  const label = ext.toUpperCase();
  const answer = `${tools.length} tool${tools.length === 1 ? "" : "s"} work with ${label} files. Here's the best place to start.`;

  return enrich(query, "file-type", primaryTool, {
    answer,
    why: `Handles ${label} files directly.`,
    alternativeSlugs: rest.map((t) => t.slug),
    ctx,
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * INTENT-MAP MATCHING  (resolution step b)
 * ──────────────────────────────────────────────────────────────────────────── */

interface RuleMatch {
  rule: IntentRule;
  score: number;
}

/**
 * Score a rule against a normalised query. Two ways a pattern can hit:
 *  - contiguous substring (highest signal, "pdf too big" literally appears);
 *  - all of a phrase's words present as query tokens, order-independent, so
 *    "my pdf is too big" and "combine several pdfs" still match "pdf too big" /
 *    "combine pdf" despite the filler words.
 * Longer/more-specific patterns win via length-weighted scoring. Plurals are
 * folded (a trailing "s" is optional) so "pdfs" matches "pdf". Returns null when
 * nothing matches.
 */
function scoreRule(rule: IntentRule, q: string, tokens: Set<string>): number | null {
  let score = 0;
  let matched = false;

  for (const pattern of rule.patterns) {
    if (q.includes(pattern)) {
      // Exact contiguous match, the strongest signal.
      matched = true;
      score += pattern.length + (pattern.includes(" ") ? 8 : 0);
      continue;
    }
    const words = pattern.split(" ");
    if (words.length > 1 && words.every((w) => hasToken(tokens, w))) {
      // All phrase words present (order-independent), strong, filler-tolerant.
      matched = true;
      score += pattern.length + 3;
    } else if (words.length === 1 && hasToken(tokens, pattern)) {
      matched = true;
      score += pattern.length;
    }
  }
  return matched ? score : null;
}

/** Token membership with simple singular/plural folding ("pdfs" ⇒ "pdf"). */
function hasToken(tokens: Set<string>, word: string): boolean {
  if (tokens.has(word)) return true;
  if (word.length >= 3 && tokens.has(`${word}s`)) return true;
  if (word.endsWith("s") && word.length >= 4 && tokens.has(word.slice(0, -1))) return true;
  return false;
}

/** Best-matching rule for the query, or null. Ties break on map order. */
function matchRule(q: string, tokens: Set<string>): RuleMatch | null {
  let best: RuleMatch | null = null;
  for (const rule of INTENT_MAP) {
    const score = scoreRule(rule, q, tokens);
    if (score === null) continue;
    if (!best || score > best.score) best = { rule, score };
  }
  return best;
}

/** Build the intent result for a matched rule, validating its primary slug. */
function ruleResult(query: string, match: RuleMatch, ctx?: AssistantContext): AssistantResult | null {
  const primaryTool = getToolBySlug(match.rule.tool);
  // Hallucination guard: rule points at a dead or not-yet-built (404) slug.
  if (!primaryTool || !isLiveTool(primaryTool)) return null;

  const answer =
    match.rule.note ??
    `${primaryTool.title} is the right tool for that.`;

  const opts: Parameters<typeof enrich>[3] = {
    answer,
    why: match.rule.note,
    alternativeSlugs: match.rule.related ?? [],
    ctx,
  };
  if (match.rule.workflow) opts.ruleWorkflow = match.rule.workflow;

  return enrich(query, "intent", primaryTool, opts);
}

/* ────────────────────────────────────────────────────────────────────────────
 * SEARCH FALLBACK  (resolution step c)
 * ──────────────────────────────────────────────────────────────────────────── */

function searchResult(query: string, ctx?: AssistantContext): AssistantResult {
  const hits = searchAll(query, 8);
  const toolHit = hits.find((h) => h.kind === "tool" && getToolBySlug(h.slug));

  if (toolHit) {
    const primaryTool = getToolBySlug(toolHit.slug);
    if (primaryTool) {
      const otherToolSlugs = hits
        .filter((h) => h.kind === "tool" && h.slug !== primaryTool.slug)
        .map((h) => h.slug);
      return enrich(query, "search", primaryTool, {
        answer: `Closest match for "${query}": ${primaryTool.title}.`,
        alternativeSlugs: otherToolSlugs,
        ctx,
      });
    }
  }

  // Nothing usable, empty, honest result with popular suggestions upstream.
  return {
    query,
    intentType: "none",
    answer: `No exact match for "${query}". Try one of the popular tasks below.`,
    alternatives: [],
    guides: [],
    blogs: [],
    comparisons: [],
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * PUBLIC: resolveIntent
 * ──────────────────────────────────────────────────────────────────────────── */

/** Lower-case, collapse whitespace. */
function normalize(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Split into lower-case alphanumeric tokens. */
function tokenize(q: string): Set<string> {
  return new Set(q.split(/[^a-z0-9]+/i).filter(Boolean));
}

/** True when the query reads like a conversion ("x to y"), prefer INTENT_MAP. */
function looksLikeConversion(q: string): boolean {
  return / to /.test(q) || /2/.test(q);
}

/**
 * Resolve a natural-language query into a full, enriched AssistantResult.
 * Deterministic and never hallucinates: every slug is validated. Pass an
 * `AssistantContext` (with slim blog posts) to enrich the `blogs` links.
 */
export function resolveIntent(query: string, ctx?: AssistantContext): AssistantResult {
  const q = normalize(query);
  if (!q) {
    return {
      query: "",
      intentType: "none",
      answer: "Tell me what you're trying to do and I'll point you at the right tool.",
      alternatives: [],
      guides: [],
      blogs: [],
      comparisons: [],
    };
  }

  const tokens = tokenize(q);

  // (b-priority) Curated intent rules: try first when the query is a task/phrase
  // or a conversion, since those are higher-signal than a bare file-type hub.
  const ruleMatch = matchRule(q, tokens);

  // (a) File-extension intent, but only when NO strong rule matched, so that
  // e.g. "png to svg" hits the vectorize rule rather than the generic png hub.
  if (!ruleMatch || (!looksLikeConversion(q) && ruleMatch.score < 6)) {
    const ext = detectFileType(tokens);
    if (ext) {
      const ft = fileTypeResult(q, ext, ctx);
      if (ft) return ft;
    }
  }

  // (b) Curated intent rule.
  if (ruleMatch) {
    const res = ruleResult(q, ruleMatch, ctx);
    if (res) return res;
  }

  // (c) Fuzzy search fallback.
  return searchResult(q, ctx);
}

/* ────────────────────────────────────────────────────────────────────────────
 * PUBLIC: searchEverything  (command center)
 * ──────────────────────────────────────────────────────────────────────────── */

/** Cheap relevance score for a title/description against the query (lower=better). */
function everythingScore(query: string, title: string, description: string): number | null {
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  if (t.startsWith(query)) return 0;
  if (t.includes(query)) return 1;
  if (d.includes(query)) return 3;
  // token overlap
  const qTokens = query.split(/[^a-z0-9]+/i).filter(Boolean);
  if (qTokens.length > 1 && qTokens.every((tok) => t.includes(tok) || d.includes(tok))) return 2;
  return null;
}

/** Icon per everything-kind, used when the source item has no icon of its own. */
const KIND_ICON: Record<EverythingKind, string> = {
  tool: "Wrench",
  category: "LayoutGrid",
  collection: "Layers",
  workflow: "Workflow",
  "use-case": "Users",
  guide: "BookOpen",
  comparison: "GitCompare",
  blog: "Newspaper",
  "file-type": "FileType",
};

/**
 * Mixed, typed search across EVERY surface, tools, categories, collections,
 * workflows, use-cases, how-to guides, comparisons, file-types and (if injected)
 * blog posts. Powers the command center. Every result carries a validated href.
 * Deterministic; LOWER score = better.
 */
export function searchEverything(
  query: string,
  ctx?: AssistantContext,
  limit = 20,
): EverythingResult[] {
  const q = normalize(query);
  if (!q) return [];

  const out: EverythingResult[] = [];
  const push = (
    kind: EverythingKind,
    title: string,
    description: string,
    href: string,
    icon: string | undefined,
    bias: number,
  ) => {
    const s = everythingScore(q, title, description);
    if (s === null) return;
    out.push({ kind, title, description, href, icon: icon ?? KIND_ICON[kind], score: s + bias });
  };

  // Tools (via the validated fuzzy search, already registry-backed).
  for (const hit of searchAll(q, limit)) {
    if (hit.kind === "tool") push("tool", hit.title, hit.description, hit.href, hit.icon, 0);
  }

  // Categories.
  for (const c of getAllCategories()) {
    push("category", c.name, c.description, ROUTES.category(c.slug), c.icon, 0.5);
  }

  // Collections.
  for (const c of getCollections()) {
    push("collection", c.title, c.description, ROUTES.collection(c.slug), c.icon, 0.6);
  }

  // Use-cases (audiences).
  for (const u of getUseCases()) {
    push("use-case", u.title, u.description, ROUTES.forUseCase(u.slug), u.icon, 0.6);
  }

  // Workflows.
  for (const w of getWorkflows()) {
    push("workflow", w.title, w.description, ROUTES.workflow(w.slug), w.icon, 0.6);
  }

  // How-to guides.
  for (const h of getAllHowTos()) {
    push("guide", h.title, h.description, ROUTES.howTo(h.slug), h.icon, 0.7);
  }

  // Comparisons.
  for (const c of getAllComparisons()) {
    push("comparison", c.title, c.description, ROUTES.comparison(c.slug), c.icon, 0.7);
  }

  // File-type hubs.
  for (const f of getAllFileTypes()) {
    const label = f.type.toUpperCase();
    push(
      "file-type",
      `${label} tools`,
      `${f.count} tools that work with ${label} files`,
      ROUTES.search + `?type=${f.type}`,
      "FileType",
      0.8,
    );
  }

  // Blog posts (injected only).
  for (const p of ctx?.posts ?? []) {
    push("blog", p.title, p.description ?? "", ROUTES.blogPost(p.slug), "Newspaper", 0.9);
  }

  return out
    .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

/* ────────────────────────────────────────────────────────────────────────────
 * PUBLIC: empty-state constants
 * ──────────────────────────────────────────────────────────────────────────── */

/** Real, task-oriented example queries for the assistant's empty state. */
export const EXAMPLE_QUERIES: readonly string[] = [
  "my pdf is too big",
  "remove the background from a photo",
  "combine several pdfs into one",
  "make an image smaller for instagram",
  "convert png to jpg",
  "vectorize a logo to svg",
  "format this json",
  "generate a qr code for my website",
  "my qr code won't scan",
  "compress a video",
  "turn a video into a gif",
  "extract the audio from a video",
  "convert csv to json",
  "add a password to a pdf",
  "generate meta tags for seo",
] as const;

/** Real, popular "how do I…" questions for the assistant's empty state. */
export const POPULAR_QUESTIONS: readonly { q: string; slug: string }[] = [
  { q: "How do I shrink a PDF under the email limit?", slug: "compress-pdf" },
  { q: "How do I merge PDFs in the right order?", slug: "merge-pdf" },
  { q: "How do I resize an image for Instagram?", slug: "image-resizer" },
  { q: "How do I make a QR code that actually scans?", slug: "qr-code-generator" },
  { q: "How do I turn a video into a GIF?", slug: "video-to-gif" },
  { q: "How do I extract audio from a video?", slug: "extract-audio" },
  { q: "How do I convert a PDF to an editable Word doc?", slug: "pdf-to-word" },
].filter((item) => isValidToolSlug(item.slug)); // validate slugs (live only)

/* ────────────────────────────────────────────────────────────────────────────
 * PUBLIC: small helpers (used by the UI for validation / deep links)
 * ──────────────────────────────────────────────────────────────────────────── */

/** True when a slug is a real, live tool. Cheap public hallucination guard. */
export function isValidToolSlug(slug: string): boolean {
  const tool = getToolBySlug(slug);
  return tool !== undefined && isLiveTool(tool);
}

/** Resolve a category slug to a display name, or undefined if it doesn't exist. */
export function categoryName(slug: string): string | undefined {
  return getCategoryBySlug(slug)?.name;
}

/* ────────────────────────────────────────────────────────────────────────────
 * PUBLIC: command-center support (slim tool cards + discovery)
 *
 * The command center runs in a client bundle, so it must never import the
 * registry. These helpers live in the (lazy-loaded) engine and hand back tiny,
 * registry-free cards the UI can render for its personalization rails
 * (recent / pinned / favorites) and its discovery empty-state (trending /
 * popular / new). Every card is validated: unknown slugs are dropped, so the
 * command center can never render a dead link.
 * ──────────────────────────────────────────────────────────────────────────── */

/** A slim, registry-free tool card for the command center's rails. */
export interface ToolCard {
  slug: string;
  title: string;
  /** Category display name (e.g. "PDF Tools"), for the row's subtitle. */
  category: string;
  /** lucide icon name. */
  icon: string;
  /** Canonical tool route. */
  href: string;
  /** Tint key, resolved from the tool's category. */
  accent?: string;
}

function toToolCard(tool: Tool): ToolCard {
  const category = getCategoryBySlug(tool.category);
  const card: ToolCard = {
    slug: tool.slug,
    title: tool.title,
    category: category?.name ?? tool.category,
    icon: tool.icon,
    href: ROUTES.tool(tool.slug),
  };
  if (category?.accent) card.accent = category.accent;
  return card;
}

/**
 * Resolve an ordered list of slugs (recent / pinned / favorite, from the
 * browser-local personalization store) into validated slim cards. Unknown or
 * duplicate slugs are dropped, preserving order.
 */
export function resolveToolCards(slugs: readonly string[], limit = 12): ToolCard[] {
  return validTools(slugs).slice(0, limit).map(toToolCard);
}

/** Discovery rails for the command center's empty state, all registry-backed. */
export interface Discovery {
  /** Trending searches (curated queries), validated & de-duped. */
  trending: readonly string[];
  /** Globally popular tools as cards. */
  popular: ToolCard[];
  /** Most recently ADDED tools as cards (the "New" rail). */
  fresh: ToolCard[];
}

/** Build the discovery empty-state payload (trending / popular / new). */
export function getDiscovery(limit = 6): Discovery {
  return {
    trending: TRENDING_SEARCHES,
    popular: getPopularTools(limit).map(toToolCard),
    fresh: getRecentlyAddedTools(limit).map(toToolCard),
  };
}

/* ============================================================================
 * === PUBLIC API =============================================================
 * ============================================================================
 *
 * From lib/assistant/types.ts (types):
 *  IntentRule, { patterns; tool; related?; workflow?; note? }
 *  IntentType: "file-type" | "intent" | "search" | "none"
 *  Processing, "Browser" | "Server" | "AI"
 *  Difficulty, "Easy" | "Medium"
 *  ToolRec, { slug; title; category; href; why; estTime; difficulty; processing; related }
 *  WorkflowRec, { slug; title; href; steps: {slug;title;href}[] }
 *  LinkRec, { title; href; icon; description? }
 *  AssistantResult, { query; intentType; answer; primary?; alternatives; workflow?; guides; blogs; comparisons }
 *  EverythingKind, "tool"|"category"|"collection"|"workflow"|"use-case"|"guide"|"comparison"|"blog"|"file-type"
 *  EverythingResult: { kind; title; description; href; icon; score }
 *  AssistantContext, { posts?: Pick<BlogPost,"slug"|"title"|"description"|"tool"|"tags"|"category">[] }
 *
 * From lib/assistant/intent-map.ts (data):
 *  INTENT_MAP: IntentRule[], curated problem→tool rules
 *
 * From lib/assistant/intent.ts (this module):
 *   resolveIntent(query: string, ctx?: AssistantContext): AssistantResult
 *   searchEverything(query: string, ctx?: AssistantContext, limit = 20): EverythingResult[]
 *   isValidToolSlug(slug: string): boolean
 *   categoryName(slug: string): string | undefined
 *   resolveToolCards(slugs: readonly string[], limit = 12): ToolCard[]
 *   getDiscovery(limit = 6): Discovery   // { trending, popular, fresh }
 *   EXAMPLE_QUERIES: readonly string[]
 *   POPULAR_QUESTIONS: readonly { q: string; slug: string }[]
 *   ToolCard, Discovery                  // slim, registry-free card types
 * ==========================================================================*/
