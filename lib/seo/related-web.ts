import "server-only";

import type { AccentKey, IconName, Tool, Category, BlogPost } from "@/types";
import { ROUTES } from "@/config/constants";
import {
  getAllTools,
  getToolBySlug,
  getToolsByCategory,
  getCategoryBySlug,
  isLiveTool,
} from "@/lib/registry";
import {
  getComparisonsForTool,
  getAllComparisons,
} from "@/lib/content";
import { PROBLEMS, type ProblemSolution } from "@/config/problems";
import { GLOSSARY, type GlossaryTerm } from "@/config/glossary";
import { CONTEXT_PAGES, type ContextPage } from "@/config/contexts";
import {
  inferFileTypes,
  getWorkflows,
  getWorkflowsForTool,
  getUseCases,
  getRecommendedTools,
  getAllFileTypes,
  type Workflow,
} from "@/lib/discovery";
import type { Comparison } from "@/types/content";

/**
 * lib/seo/related-web: the AUTOMATIC INTERNAL-LINKING ENGINE.
 *
 * `getRelatedWeb(input)` takes a description of the current entity (a tool, a
 * category, a blog post, or a hub) and returns a SLIM, deduped bundle of
 * cross-links, the "related web" that every page renders identically via the
 * <RelatedWeb> server component. This is the backbone of the topical-authority
 * + pages-per-session goals: one consistent web of links between tools,
 * categories, blog posts, comparisons, workflows, file-type hubs, use-case hubs
 * and task hubs.
 *
 * SERVER-ONLY. It imports the full registry + discovery + content layers, so it
 * must only run at build time (server components / route handlers). It returns
 * LINKS ONLY, `{ label, href }` objects, never heavy payloads, so the caller
 * ships almost nothing to the client. Every relation degrades gracefully: when
 * a relation is absent, its field is simply omitted or an empty array.
 */

/* ── Public shapes ────────────────────────────────────────────────────────── */

/** A single cross-link. `icon`/`accent` are optional presentation hints. */
export interface RelatedLink {
  label: string;
  href: string;
  icon?: IconName;
  accent?: AccentKey;
}

/**
 * The slim bundle every page renders. All fields are optional/possibly-empty so
 * the <RelatedWeb> component can drop any section that has no links.
 */
export interface RelatedWeb {
  /** Same-category + shared-tag/keyword tools, excluding self (≤5). */
  tools: RelatedLink[];
  /** Tag/keyword-matched blog posts (≤5). */
  blogs: RelatedLink[];
  /** The entity's category + its relatedCategories (≤3). */
  categories: RelatedLink[];
  /** Head-to-head format comparisons (≤2). */
  comparisons: RelatedLink[];
  /** The single best-matching guided workflow. */
  workflow?: RelatedLink;
  /** File-type hubs from the tool's fileTypes/formats (≤2). */
  fileHubs: RelatedLink[];
  /** The best-matching audience use-case hub. */
  useCaseHub?: RelatedLink;
  /** Task hubs matched by tag/keyword (≤2). */
  taskHubs: RelatedLink[];
  /** Problem/solution pages this entity helps solve (≤3). */
  problems: RelatedLink[];
  /** Glossary definitions related to this entity (≤2). */
  glossary: RelatedLink[];
  /** "For [platform]" destination pages this entity serves (≤3). */
  contexts: RelatedLink[];
  /** Always present: the Learn hub. */
  learnHref: RelatedLink;
  /** Always present: the home page. */
  home: RelatedLink;
}

/**
 * Input variants, a discriminated union on `kind`. A caller passes whichever
 * one matches the page it is rendering; blog posts are passed with their
 * pre-loaded post object + the full post list (blog is async/filesystem, so the
 * engine never touches the filesystem itself).
 */
export type RelatedWebInput =
  | { kind: "tool"; tool: Tool; allPosts?: BlogPost[] }
  | { kind: "category"; category: Category; allPosts?: BlogPost[] }
  | { kind: "blog"; post: BlogPost; allPosts?: BlogPost[] }
  | {
      kind: "hub";
      /** Free-form title used to seed matching (e.g. "Compress files", "PDF"). */
      title: string;
      /** Optional category slug the hub belongs to. */
      category?: string;
      /** Optional tags/keywords that describe the hub. */
      tags?: string[];
      /** Optional file types the hub concerns (e.g. ["pdf"]). */
      fileTypes?: string[];
      /** Problem slugs to exclude from the problems rail (e.g. self + siblings). */
      excludeProblems?: string[];
      /** Glossary slugs to exclude from the definitions rail (e.g. self). */
      excludeGlossary?: string[];
      allPosts?: BlogPost[];
    };

/* ── Static task-hub catalogue ────────────────────────────────────────────── */

/**
 * The 13 task hubs shipped this build. Each is matched to an entity by the
 * `match` tokens against its tags/keywords/slug/category. Slugs are fixed; the
 * route is `/tasks/<slug>` (the task-hub surface owns that route).
 */
interface TaskHub {
  slug: string;
  label: string;
  icon: IconName;
  accent: AccentKey;
  /** Lower-case tokens that signal a match against tags/keywords/slug/category. */
  match: string[];
}

const TASK_HUBS: TaskHub[] = [
  { slug: "compress-files", label: "Compress files", icon: "Minimize2", accent: "sky", match: ["compress", "compressor", "shrink", "reduce", "optimize-size", "smaller"] },
  { slug: "convert-files", label: "Convert files", icon: "Repeat", accent: "violet", match: ["convert", "converter", "to-", "-to-", "transcode"] },
  { slug: "edit-pdf", label: "Edit PDF", icon: "FileText", accent: "rose", match: ["pdf", "pdf-tools", "annotate", "sign", "watermark"] },
  { slug: "create-qr-codes", label: "Create QR codes", icon: "QrCode", accent: "indigo", match: ["qr", "qr-tools", "qr-code", "vcard", "wifi"] },
  { slug: "resize-images", label: "Resize images", icon: "Scaling", accent: "sky", match: ["resize", "resizer", "scale", "dimensions"] },
  { slug: "optimize-svg", label: "Optimize SVG", icon: "PenTool", accent: "orange", match: ["svg", "svg-tools", "optimize", "minify", "vector"] },
  { slug: "generate-meta-tags", label: "Generate meta tags", icon: "Tags", accent: "emerald", match: ["meta", "meta-tag", "seo", "open-graph", "og", "twitter-card"] },
  { slug: "format-json", label: "Format JSON", icon: "Braces", accent: "violet", match: ["json", "format", "formatter", "beautify", "prettify"] },
  { slug: "generate-passwords", label: "Generate passwords", icon: "KeyRound", accent: "amber", match: ["password", "passphrase", "secret", "random", "generator-security"] },
  { slug: "merge-documents", label: "Merge documents", icon: "Combine", accent: "rose", match: ["merge", "combine", "join", "concat"] },
  { slug: "split-documents", label: "Split documents", icon: "Split", accent: "cyan", match: ["split", "extract-pages", "separate", "divide"] },
  { slug: "crop-images", label: "Crop images", icon: "Crop", accent: "indigo", match: ["crop", "trim-image", "cutout"] },
  { slug: "rotate-images", label: "Rotate images", icon: "RotateCw", accent: "cyan", match: ["rotate", "flip", "orientation"] },
];

/* ── Internal helpers ─────────────────────────────────────────────────────── */

/** Lower-case token bag describing a tool (slug + category + tags + keywords). */
function toolTokens(tool: Tool): Set<string> {
  return new Set(
    [tool.slug, tool.category, tool.group ?? "", ...(tool.tags ?? []), ...(tool.keywords ?? [])]
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean),
  );
}

/** Lower-case token bag from arbitrary strings. */
function tokensFrom(...parts: (string | undefined)[]): Set<string> {
  return new Set(
    parts
      .filter((p): p is string => Boolean(p))
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean),
  );
}

/** Map a Tool to a RelatedLink. */
function toolLink(tool: Tool): RelatedLink {
  const cat = getCategoryBySlug(tool.category);
  return {
    label: tool.title,
    href: ROUTES.tool(tool.slug),
    icon: tool.icon,
    accent: tool.accent ?? cat?.accent,
  };
}

/** Map a Category to a RelatedLink. */
function categoryLink(cat: Category): RelatedLink {
  return { label: cat.name, href: ROUTES.category(cat.slug), icon: cat.icon, accent: cat.accent };
}

/** Map a BlogPost to a RelatedLink. */
function blogLink(post: BlogPost): RelatedLink {
  return { label: post.title, href: ROUTES.blogPost(post.slug), icon: "Newspaper" };
}

/** Map a Comparison to a RelatedLink. */
function comparisonLink(c: Comparison): RelatedLink {
  return {
    label: `${c.a} vs ${c.b}`,
    href: ROUTES.comparison(c.slug),
    icon: c.icon ?? "GitCompareArrows",
    accent: c.accent,
  };
}

/** Map a Workflow to a RelatedLink. */
function workflowLink(w: Workflow): RelatedLink {
  return { label: w.title, href: ROUTES.workflow(w.slug), icon: w.icon, accent: w.accent };
}

/** File types that actually have a generated hub page, gate links on this so a
 *  comparison side like `jpeg`/`hex`/`rgb` never links to a non-existent hub. */
const VALID_FILE_HUBS = new Set(getAllFileTypes().map((f) => f.type));

/** File-type hub link, `/tools/file/<type>`. Private on purpose: everything
 *  goes through {@link fileHubLinks}, which applies the VALID_FILE_HUBS gate.
 *  Three of the four call sites used to skip it, shipping 11 dead links to
 *  hubs that were never generated (/tools/file/jpeg, /tools/file/ilovepdf...).
 *  Filtering inside the mapper makes that class of bug unrepresentable. */
function fileHubLink(type: string): RelatedLink {
  return { label: `${type.toUpperCase()} tools`, href: `/tools/file/${type}`, icon: "FileType2" };
}

/** Map file types to hub links, dropping any type with no generated hub. */
function fileHubLinks(types: string[]): RelatedLink[] {
  return types.filter((t) => VALID_FILE_HUBS.has(t)).map(fileHubLink);
}

/** Task-hub link. The route is `/task/<slug>` (singular), matching ROUTES.task. */
function taskHubLink(hub: TaskHub): RelatedLink {
  return { label: hub.label, href: `/task/${hub.slug}`, icon: hub.icon, accent: hub.accent };
}

/** Problem/solution link, `/solve/<slug>`. */
function problemLink(p: ProblemSolution): RelatedLink {
  return { label: p.problem, href: ROUTES.solveProblem(p.slug), icon: p.icon, accent: p.accent };
}

/**
 * Problems this entity helps solve (≤limit). A problem scores highest when a
 * specific tool actually solves it (its `primaryTool`/`tools` list), then by
 * tag overlap with the entity's token bag, so, e.g., the Compress PDF tool
 * page surfaces "My PDF is too large" and "Email attachment too large", and a
 * task hub surfaces the problems its tools address. This is the REVERSE of the
 * `/solve` → tool links: it feeds link equity back to the problem pages.
 */
function matchProblems(
  tokens: Set<string>,
  limit: number,
  opts: { toolSlug?: string; toolSlugs?: Set<string>; exclude?: Set<string> } = {},
): RelatedLink[] {
  const scored = PROBLEMS.filter((p) => !opts.exclude?.has(p.slug))
    .map((p) => {
      let score = 0;
      if (opts.toolSlug) {
        if (p.primaryTool === opts.toolSlug) score += 6;
        else if (p.tools.includes(opts.toolSlug)) score += 4;
      }
      if (opts.toolSlugs) {
        if (opts.toolSlugs.has(p.primaryTool)) score += 3;
        else if (p.tools.some((s) => opts.toolSlugs!.has(s))) score += 2;
      }
      for (const t of tokensFrom(...p.tags)) if (tokens.has(t)) score += 1;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.problem.localeCompare(b.p.problem));
  return scored.slice(0, limit).map((x) => problemLink(x.p));
}

/** Glossary-term link, `/glossary/<slug>`. */
function glossaryLink(t: GlossaryTerm): RelatedLink {
  return { label: `What is ${t.term}?`, href: ROUTES.glossaryTerm(t.slug), icon: t.icon, accent: "sky" };
}

/**
 * Glossary definitions related to an entity (≤limit). A term scores highest when
 * it explicitly lists this tool in `relatedTools`, then by tag overlap, so the
 * WebP tool surfaces "What is WebP?" and the compressor surfaces "Image
 * compression". Feeds link equity to the informational /glossary layer.
 */
function matchGlossary(
  tokens: Set<string>,
  limit: number,
  opts: { toolSlug?: string; toolSlugs?: Set<string>; exclude?: Set<string> } = {},
): RelatedLink[] {
  const scored = GLOSSARY.filter((t) => !opts.exclude?.has(t.slug)).map((t) => {
    let score = 0;
    if (opts.toolSlug && t.relatedTools.includes(opts.toolSlug)) score += 5;
    if (opts.toolSlugs && t.relatedTools.some((s) => opts.toolSlugs!.has(s))) score += 2;
    for (const tok of tokensFrom(...t.keywords, ...(t.aliases ?? []))) if (tokens.has(tok)) score += 1;
    return { t, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.t.term.localeCompare(b.t.term));
  return scored.slice(0, limit).map((x) => glossaryLink(x.t));
}

/** "For [context]" link, `/for/<slug>`. */
function contextLink(c: ContextPage): RelatedLink {
  return { label: c.h1, href: ROUTES.forContext(c.slug), icon: c.icon, accent: c.accent };
}

/**
 * "For [platform]" destination pages an entity serves (≤limit). Matched when the
 * page lists this tool in its `tools`/`primaryTool`. Mostly image tools, so
 * non-image entities simply get an empty rail (hidden). Feeds link equity to the
 * transactional /for layer.
 */
function matchContexts(
  limit: number,
  opts: { toolSlug?: string; toolSlugs?: Set<string> },
): RelatedLink[] {
  const scored = CONTEXT_PAGES.map((c) => {
    let score = 0;
    if (opts.toolSlug) {
      if (c.primaryTool === opts.toolSlug) score += 4;
      else if (c.tools.includes(opts.toolSlug)) score += 2;
    }
    if (opts.toolSlugs && c.tools.some((s) => opts.toolSlugs!.has(s))) score += 1;
    return { c, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.c.destination.localeCompare(b.c.destination));
  return scored.slice(0, limit).map((x) => contextLink(x.c));
}

/**
 * Comparisons whose sides (`a`/`b`) match any of the given format tokens: the
 * format-based fallback when a tool declares no explicit related comparisons.
 */
function comparisonsForFormats(formats: string[], limit: number): Comparison[] {
  if (formats.length === 0) return [];
  const wanted = new Set(formats.map((f) => f.toLowerCase()));
  return getAllComparisons()
    .filter((c) => wanted.has(c.a.toLowerCase()) || wanted.has(c.b.toLowerCase()))
    .slice(0, limit);
}

/** Task hubs whose match tokens intersect the entity's token bag (≤limit). */
function matchTaskHubs(tokens: Set<string>, limit: number): RelatedLink[] {
  const hits: { hub: TaskHub; score: number }[] = [];
  for (const hub of TASK_HUBS) {
    let score = 0;
    for (const m of hub.match) {
      // token-set membership OR substring for hyphenated signals like "-to-".
      if (tokens.has(m)) score += 2;
      else if (m.includes("-") && [...tokens].some((t) => m.includes(t) || t.includes(m))) score += 1;
    }
    if (score > 0) hits.push({ hub, score });
  }
  return hits
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(({ hub }) => taskHubLink(hub));
}

/**
 * Blog posts matched to a token bag by tag/keyword/category overlap, newest
 * kept (the caller passes an already-newest-first list). Never returns the
 * excluded slug. Slim: title + href only.
 */
function matchBlogs(
  allPosts: BlogPost[],
  tokens: Set<string>,
  limit: number,
  excludeSlug?: string,
): RelatedLink[] {
  const scored = allPosts
    .filter((p) => p.slug !== excludeSlug)
    .map((p) => {
      const bag = tokensFrom(p.category, ...(p.tags ?? []), p.tool);
      let score = 0;
      for (const t of bag) if (tokens.has(t)) score += 1;
      return { post: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || Date.parse(b.post.date) - Date.parse(a.post.date));
  return scored.slice(0, limit).map((x) => blogLink(x.post));
}

/** Dedupe links by href, preserving order. */
function dedupeLinks(links: RelatedLink[]): RelatedLink[] {
  const seen = new Set<string>();
  const out: RelatedLink[] = [];
  for (const l of links) {
    if (seen.has(l.href)) continue;
    seen.add(l.href);
    out.push(l);
  }
  return out;
}

/** The two constant links present on every bundle. */
const LEARN_LINK: RelatedLink = { label: "Learn", href: ROUTES.learn, icon: "GraduationCap" };
const HOME_LINK: RelatedLink = { label: "All tools", href: ROUTES.home, icon: "LayoutGrid" };

/** Related categories for a category slug: itself + declared relatedCategories. */
function relatedCategoryLinks(slug: string | undefined, limit: number): RelatedLink[] {
  if (!slug) return [];
  const self = getCategoryBySlug(slug);
  if (!self) return [];
  const out: RelatedLink[] = [categoryLink(self)];
  for (const rel of self.relatedCategories ?? []) {
    const c = getCategoryBySlug(rel);
    if (c) out.push(categoryLink(c));
  }
  return dedupeLinks(out).slice(0, limit);
}

/**
 * Best-matching audience use-case hub for a set of audience keys, the first
 * use-case whose `audience` is in the set. Returns undefined when none match.
 */
function caseHubFor(audiences: string[] | undefined): RelatedLink | undefined {
  if (!audiences || audiences.length === 0) return undefined;
  const wanted = new Set(audiences.map((a) => a.toLowerCase()));
  const match = getUseCases().find((u) => wanted.has(u.audience.toLowerCase()));
  return match
    ? { label: match.title, href: ROUTES.forUseCase(match.slug), icon: match.icon, accent: match.accent }
    : undefined;
}

/* ── Entry point ──────────────────────────────────────────────────────────── */

/**
 * Build the related-web bundle for any entity. Pure + deterministic; every
 * relation degrades to an empty array / omitted field when absent.
 */
export function getRelatedWeb(input: RelatedWebInput): RelatedWeb {
  const allPosts = input.allPosts ?? [];

  if (input.kind === "tool") {
    return relatedWebForTool(input.tool, allPosts);
  }
  if (input.kind === "category") {
    return relatedWebForCategory(input.category, allPosts);
  }
  if (input.kind === "blog") {
    return relatedWebForBlog(input.post, allPosts);
  }
  return relatedWebForHub(input, allPosts);
}

/* ── Per-kind builders ────────────────────────────────────────────────────── */

function relatedWebForTool(tool: Tool, allPosts: BlogPost[]): RelatedWeb {
  const tokens = toolTokens(tool);
  const fileTypes = inferFileTypes(tool);
  const formats = dedupeStrings([
    ...fileTypes,
    ...(tool.formats?.input ?? []),
    ...(tool.formats?.output ?? []),
  ]);

  // Tools: the discovery recommender (relatedTools → next-step → scored).
  const tools = getRecommendedTools(tool, 5).map(toolLink);

  // Comparisons: explicit-for-tool first, then format-based fallback.
  const cmp = getComparisonsForTool(tool.slug, 2);
  const comparisons = dedupeLinks(
    (cmp.length > 0 ? cmp : comparisonsForFormats(formats, 2)).map(comparisonLink),
  ).slice(0, 2);

  // Workflow: the first workflow that includes this tool.
  const workflow = getWorkflowsForTool(tool)[0];

  const fileHubs = dedupeLinks(
    fileHubLinks(fileTypes).slice(0, 2),
  ).slice(0, 2);
  const useCaseHub = caseHubFor(tool.audiences);

  return {
    tools,
    blogs: matchBlogs(allPosts, tokens, 5),
    categories: relatedCategoryLinks(tool.category, 3),
    comparisons,
    ...(workflow ? { workflow: workflowLink(workflow) } : {}),
    fileHubs,
    ...(useCaseHub ? { useCaseHub } : {}),
    taskHubs: matchTaskHubs(tokens, 2),
    problems: matchProblems(tokens, 3, { toolSlug: tool.slug }),
    glossary: matchGlossary(tokens, 2, { toolSlug: tool.slug }),
    contexts: matchContexts(3, { toolSlug: tool.slug }),
    learnHref: LEARN_LINK,
    home: HOME_LINK,
  };
}

function relatedWebForCategory(category: Category, allPosts: BlogPost[]): RelatedWeb {
  const catTools = getToolsByCategory(category.slug);
  const tokens = tokensFrom(
    category.slug,
    category.name,
    category.guidesTag,
    ...(category.seo?.keywords ?? []),
  );

  // Tools: category members (a slim sample of 5).
  const tools = catTools.slice(0, 5).map(toolLink);

  // File types: the dominant types across the category's tools.
  const typeCounts = new Map<string, number>();
  for (const t of catTools) for (const ft of inferFileTypes(t)) typeCounts.set(ft, (typeCounts.get(ft) ?? 0) + 1);
  const topTypes = [...typeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);

  // Comparisons: format-based against the dominant types.
  const comparisons = dedupeLinks(comparisonsForFormats(topTypes, 2).map(comparisonLink)).slice(0, 2);

  // Workflow: the first workflow whose steps touch a category tool.
  const catSlugs = new Set(catTools.map((t) => t.slug));
  const workflow = getWorkflows().find((w) => w.steps.some((s) => catSlugs.has(s.toolSlug)));

  // Use-case hub: first use-case whose members overlap the category.
  const useCaseHub = firstUseCaseForTools(catSlugs);

  return {
    tools,
    blogs: matchBlogs(allPosts, tokens, 5),
    categories: relatedCategoryLinks(category.slug, 3),
    comparisons,
    ...(workflow ? { workflow: workflowLink(workflow) } : {}),
    fileHubs: dedupeLinks(fileHubLinks(topTypes)).slice(0, 2),
    ...(useCaseHub ? { useCaseHub } : {}),
    taskHubs: matchTaskHubs(tokens, 2),
    problems: matchProblems(tokens, 3, { toolSlugs: catSlugs }),
    glossary: matchGlossary(tokens, 2, { toolSlugs: catSlugs }),
    contexts: matchContexts(3, { toolSlugs: catSlugs }),
    learnHref: LEARN_LINK,
    home: HOME_LINK,
  };
}

function relatedWebForBlog(post: BlogPost, allPosts: BlogPost[]): RelatedWeb {
  const tokens = tokensFrom(post.category, post.tool, ...(post.tags ?? []));

  // Tools: the supported tool (if any) first, then its recommendations, then
  // tag-matched tools from the whole registry, deduped, capped at 5.
  const found = post.tool ? getToolBySlug(post.tool) : undefined;
  const primary = found && isLiveTool(found) ? found : undefined;
  const toolLinks = dedupeLinks([
    ...(primary ? [toolLink(primary), ...getRecommendedTools(primary, 4).map(toolLink)] : []),
    ...tagMatchedTools(tokens, 5, primary?.slug),
  ]).slice(0, 5);

  // Category of the primary tool drives the category rail; else blog category.
  const catSlug = primary?.category;
  const comparisons = primary
    ? dedupeLinks(
        (() => {
          const c = getComparisonsForTool(primary.slug, 2);
          const formats = dedupeStrings([
            ...inferFileTypes(primary),
            ...(primary.formats?.input ?? []),
            ...(primary.formats?.output ?? []),
          ]);
          return (c.length > 0 ? c : comparisonsForFormats(formats, 2)).map(comparisonLink);
        })(),
      ).slice(0, 2)
    : dedupeLinks(comparisonsForFormats([...tokens], 2).map(comparisonLink)).slice(0, 2);

  const workflow = primary ? getWorkflowsForTool(primary)[0] : undefined;
  const fileHubs = primary
    ? dedupeLinks(fileHubLinks(inferFileTypes(primary))).slice(0, 2)
    : [];
  const useCaseHub = primary ? caseHubFor(primary.audiences) : undefined;

  return {
    tools: toolLinks,
    blogs: matchBlogs(allPosts, tokens, 5, post.slug),
    categories: relatedCategoryLinks(catSlug, 3),
    comparisons,
    ...(workflow ? { workflow: workflowLink(workflow) } : {}),
    fileHubs,
    ...(useCaseHub ? { useCaseHub } : {}),
    taskHubs: matchTaskHubs(tokens, 2),
    problems: matchProblems(tokens, 3, primary ? { toolSlug: primary.slug } : {}),
    glossary: matchGlossary(tokens, 2, primary ? { toolSlug: primary.slug } : {}),
    contexts: matchContexts(3, primary ? { toolSlug: primary.slug } : {}),
    learnHref: LEARN_LINK,
    home: HOME_LINK,
  };
}

function relatedWebForHub(
  hub: Extract<RelatedWebInput, { kind: "hub" }>,
  allPosts: BlogPost[],
): RelatedWeb {
  const tokens = tokensFrom(hub.title, hub.category, ...(hub.tags ?? []), ...(hub.fileTypes ?? []));

  // Tools: tag-matched across the whole registry (or category members first).
  const tools = tagMatchedTools(tokens, 5).slice(0, 5);

  const fileTypes = hub.fileTypes ?? [];
  const comparisons = dedupeLinks(comparisonsForFormats(fileTypes, 2).map(comparisonLink)).slice(0, 2);

  // Workflow: first workflow whose title/steps resonate with the hub tokens.
  const workflow = getWorkflows().find((w) => {
    const wt = tokensFrom(w.title, w.slug);
    return [...wt].some((t) => tokens.has(t));
  });

  return {
    tools,
    blogs: matchBlogs(allPosts, tokens, 5),
    categories: relatedCategoryLinks(hub.category, 3),
    comparisons,
    ...(workflow ? { workflow: workflowLink(workflow) } : {}),
    fileHubs: dedupeLinks(fileHubLinks(fileTypes)).slice(0, 2),
    taskHubs: matchTaskHubs(tokens, 2),
    problems: matchProblems(tokens, 3, {
      exclude: hub.excludeProblems ? new Set(hub.excludeProblems) : undefined,
    }),
    glossary: matchGlossary(tokens, 2, {
      exclude: hub.excludeGlossary ? new Set(hub.excludeGlossary) : undefined,
    }),
    contexts: matchContexts(3, {}),
    learnHref: LEARN_LINK,
    home: HOME_LINK,
  };
}

/* ── Shared scoring helpers ───────────────────────────────────────────────── */

/** Tools scored by token overlap against a bag (≤limit), excluding a slug. */
function tagMatchedTools(tokens: Set<string>, limit: number, excludeSlug?: string): RelatedLink[] {
  const scored = getAllTools()
    .filter((t) => t.slug !== excludeSlug && isLiveTool(t))
    .map((t) => {
      let score = 0;
      for (const tok of toolTokens(t)) if (tokens.has(tok)) score += 1;
      return { tool: t, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title));
  return scored.slice(0, limit).map((x) => toolLink(x.tool));
}

/** The first use-case whose member tools overlap the given slug set. */
function firstUseCaseForTools(slugs: Set<string>): RelatedLink | undefined {
  const match = getUseCases().find((u) => u.toolSlugs.some((s) => slugs.has(s)));
  return match
    ? { label: match.title, href: ROUTES.forUseCase(match.slug), icon: match.icon, accent: match.accent }
    : undefined;
}

function dedupeStrings(items: string[]): string[] {
  return [...new Set(items.map((s) => s.toLowerCase()))];
}
