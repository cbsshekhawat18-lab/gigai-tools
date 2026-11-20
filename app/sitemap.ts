import { readFileSync } from "node:fs";

import type { MetadataRoute } from "next";

import { CATEGORIES } from "@/config/categories";
import { PAGINATION, ROUTES } from "@/config/constants";
import { absoluteUrl } from "@/lib/utils";
import { lastModifiedFor, lastModifiedForPrefix } from "@/lib/seo/lastmod";
import { getAllCategories, getAllPosts, getPaginatedPosts } from "@/lib/blog";
import { getAllTools, getToolsByCategory, CATEGORY_MIN_INDEXED } from "@/lib/registry";
import { getAllComparisonSlugs, getAllHowToSlugs } from "@/lib/content";
import {
  getAllFileTypes,
  FILE_TYPE_MIN_INDEXED,
  getCollections,
  getUseCases,
} from "@/lib/discovery";
import { TASK_HUBS } from "@/config/tasks";
import { PROBLEMS } from "@/config/problems";
import { GLOSSARY } from "@/config/glossary";
import { CONTEXT_PAGES } from "@/config/contexts";
import { ENGINES_MANIFEST } from "@/lib/engines-manifest";

export const dynamic = "force-static";

/** Static, always-present routes with their relative priority. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: ROUTES.home, priority: 1.0, changeFrequency: "daily" },
  // GigAI Smart Assist: the orchestration hub (upload → goal → done).
  { path: ROUTES.assist, priority: 0.9, changeFrequency: "weekly" },
  // Discovery hubs: high-value navigational landing pages.
  { path: ROUTES.collections, priority: 0.7, changeFrequency: "weekly" },
  { path: ROUTES.useCases, priority: 0.7, changeFrequency: "weekly" },
  { path: ROUTES.tasks, priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.solve, priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.glossary, priority: 0.6, changeFrequency: "weekly" },
  { path: ROUTES.forIndex, priority: 0.7, changeFrequency: "weekly" },
  { path: "/image-size-cheat-sheet", priority: 0.7, changeFrequency: "weekly" },
  { path: ROUTES.workflows, priority: 0.7, changeFrequency: "weekly" },
  { path: ROUTES.learn, priority: 0.7, changeFrequency: "weekly" },
  // GigAI Workspaces: hub + all nine live workspaces.
  { path: ROUTES.workspaces, priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.workspace("image"), priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.workspace("pdf"), priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.workspace("svg"), priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.workspace("audio"), priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.workspace("video"), priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.workspace("document"), priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.workspace("developer"), priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.workspace("qr"), priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.workspace("seo"), priority: 0.8, changeFrequency: "weekly" },
  // Long-form SEO content hubs.
  { path: ROUTES.compare, priority: 0.7, changeFrequency: "weekly" },
  { path: ROUTES.howToIndex, priority: 0.7, changeFrequency: "weekly" },
  { path: ROUTES.blog, priority: 0.7, changeFrequency: "weekly" },
  { path: ROUTES.changelog, priority: 0.5, changeFrequency: "weekly" },
  // /search is noindex (thin, query-driven): intentionally omitted here.
  { path: ROUTES.extension, priority: 0.7, changeFrequency: "weekly" },
  // NOTE: ROUTES.verifyTool (/gigai-verify) is NOT listed here; it is a
  // registered tool and is already emitted by the TOOLS loop below.
  { path: ROUTES.verify, priority: 0.8, changeFrequency: "weekly" },
  { path: ROUTES.verifyExtension, priority: 0.7, changeFrequency: "weekly" },
  { path: ROUTES.about, priority: 0.5, changeFrequency: "monthly" },
  { path: ROUTES.openSource, priority: 0.5, changeFrequency: "monthly" },
  { path: ROUTES.contact, priority: 0.4, changeFrequency: "monthly" },
  { path: ROUTES.privacy, priority: 0.3, changeFrequency: "yearly" },
  { path: ROUTES.terms, priority: 0.3, changeFrequency: "yearly" },
  { path: ROUTES.editorial, priority: 0.4, changeFrequency: "yearly" },
  { path: ROUTES.aiPolicy, priority: 0.4, changeFrequency: "yearly" },
  { path: ROUTES.cookies, priority: 0.3, changeFrequency: "yearly" },
  { path: ROUTES.disclaimer, priority: 0.3, changeFrequency: "yearly" },
  { path: ROUTES.dmca, priority: 0.3, changeFrequency: "yearly" },
  { path: ROUTES.accessibility, priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Real per-section dates, NOT the build time. See lib/seo/lastmod.ts: a
  // sitemap that claims every URL changed on every deploy trains Google to
  // ignore lastmod and forces needless re-evaluation of already-indexed pages.
  const staticDate = lastModifiedFor("app/page.tsx", "config/constants.ts");
  const toolsDate = lastModifiedForPrefix("config/tools");
  const categoriesDate = lastModifiedFor("config/categories.ts");
  const discoveryDate = lastModifiedFor("lib/discovery.ts");
  const contentDate = lastModifiedForPrefix("config/comparisons");
  const howToDate = lastModifiedForPrefix("config/howtos");
  const tasksDate = lastModifiedFor("config/tasks.ts");
  const problemsDate = lastModifiedFor("config/problems.ts");
  const glossaryDate = lastModifiedFor("config/glossary.ts");
  const contextsDate = lastModifiedFor("config/contexts.ts");

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: staticDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Developer API pages. Dashboard and verify are functional session pages
  // and stay out of the index on purpose.
  const developersDate = lastModifiedForPrefix("app/developers");
  const developerEntries: MetadataRoute.Sitemap = [
    { path: "/developers", priority: 0.7 },
    { path: "/developers/docs", priority: 0.6 },
    { path: "/developers/docs/jobs", priority: 0.5 },
    { path: "/developers/docs/tools", priority: 0.6 },
    { path: "/developers/docs/webhooks", priority: 0.5 },
    { path: "/developers/docs/sdks", priority: 0.6 },
    { path: "/developers/docs/mcp", priority: 0.6 },
    { path: "/developers/docs/api", priority: 0.6 },
    { path: "/developers/docs/recipes", priority: 0.6 },
    { path: "/developers/builder", priority: 0.5 },
    { path: "/site-audit", priority: 0.8 },
    { path: "/ask-file", priority: 0.8 },
    { path: "/ask", priority: 0.8 },
    { path: "/developers/signup", priority: 0.4 },
    { path: "/developers/login", priority: 0.4 },
    { path: "/developers/errors", priority: 0.5 },
    { path: "/developers/rate-limits", priority: 0.5 },
  ].map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: developersDate,
    changeFrequency: "weekly",
    priority: route.priority,
  }));

  const engineDocsEntries: MetadataRoute.Sitemap = Object.keys(
    JSON.parse(
      readFileSync(ENGINES_MANIFEST, "utf8"),
    ) as Record<string, unknown>,
  ).map((slug) => ({
    url: absoluteUrl(`/developers/tools/${slug}`),
    lastModified: developersDate,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // The tool pages are the primary landing/ranking pages, highest priority.
  const toolEntries: MetadataRoute.Sitemap = getAllTools()
    .filter((tool) => tool.status === "live")
    .map((tool) => ({
      url: absoluteUrl(ROUTES.tool(tool.slug)),
      lastModified: toolsDate,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.filter(
    // Thin-content guard: keep near-empty categories out of the index.
    (category) => getToolsByCategory(category.slug).length >= CATEGORY_MIN_INDEXED,
  ).map((category) => ({
    url: absoluteUrl(ROUTES.category(category.slug)),
    lastModified: categoriesDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Posts carry genuine dates in their frontmatter - the most accurate signal
  // on the site, and the only section where lastmod truly varies per URL.
  const allPosts = await getAllPosts();
  const blogEntries: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: absoluteUrl(ROUTES.blogPost(post.slug)),
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Blog taxonomy + pagination, indexable (index,follow, self-canonical), so
  // they must be discoverable here. Categories come from the same aggregator
  // the category route uses; page count mirrors app/blog/page/[page]'s
  // generateStaticParams (pages 2..N. Page 1 is /blog itself). Tags are
  // intentionally omitted: /blog/tag/* is noindexed.
  const blogCategoryEntries: MetadataRoute.Sitemap = (await getAllCategories())
    // Mirrors the noindex threshold in app/blog/category/[slug]/page.tsx.
    .filter((c) => c.count >= 3)
    .map((c) => ({
    url: absoluteUrl(`${ROUTES.blog}/category/${c.slug}`),
    lastModified: discoveryDate,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const { totalPages: blogTotalPages } = await getPaginatedPosts(1, PAGINATION.blogPerPage);
  const blogPageEntries: MetadataRoute.Sitemap = [];
  for (let p = 2; p <= blogTotalPages; p++) {
    blogPageEntries.push({
      url: absoluteUrl(`${ROUTES.blog}/page/${p}`),
      lastModified: discoveryDate,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  // Discovery detail pages, curated collections, audience use-cases, guided
  // workflows and file-type hubs. All derived from lib/discovery, so they stay
  // in sync with the routes' own generateStaticParams.
  const collectionEntries: MetadataRoute.Sitemap = getCollections()
    // noindexed list-variant collections stay out of the sitemap too.
    .filter((c) => !c.noindex)
    .map((c) => ({
    url: absoluteUrl(ROUTES.collection(c.slug)),
    lastModified: discoveryDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const useCaseEntries: MetadataRoute.Sitemap = getUseCases().map((u) => ({
    url: absoluteUrl(ROUTES.forUseCase(u.slug)),
    lastModified: discoveryDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // P2 audit 2026-08-21: workflow detail pages are noindexed (thin) - the
  // /workflows index stays in the sitemap, the five detail pages do not.
  const workflowEntries: MetadataRoute.Sitemap = [];

  const fileTypeEntries: MetadataRoute.Sitemap = getAllFileTypes()
    // Thin-content guard: keep near-empty long-tail file hubs out of the index.
    .filter((facet) => facet.count >= FILE_TYPE_MIN_INDEXED)
    .map((facet) => ({
      url: absoluteUrl(`/tools/file/${facet.type}`),
      lastModified: discoveryDate,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  // Long-form SEO content: comparison + how-to detail pages. Derived from the
  // same aggregators the routes' generateStaticParams use, so they stay in sync.
  const comparisonEntries: MetadataRoute.Sitemap = getAllComparisonSlugs().map((slug) => ({
    url: absoluteUrl(ROUTES.comparison(slug)),
    lastModified: contentDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const howToEntries: MetadataRoute.Sitemap = getAllHowToSlugs().map((slug) => ({
    url: absoluteUrl(ROUTES.howTo(slug)),
    lastModified: howToDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Task hubs, job-to-be-done intent pages. High value, small in number (13).
  const taskEntries: MetadataRoute.Sitemap = TASK_HUBS.map((task) => ({
    url: absoluteUrl(ROUTES.task(task.slug)),
    lastModified: tasksDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Problem/solution pages, the user-intent database. High-value long-tail
  // landing pages that route real problems to existing tools.
  const problemEntries: MetadataRoute.Sitemap = PROBLEMS.map((problem) => ({
    url: absoluteUrl(ROUTES.solveProblem(problem.slug)),
    lastModified: problemsDate,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Glossary: definitional "what is X" pages. Informational long-tail.
  const glossaryEntries: MetadataRoute.Sitemap = GLOSSARY.map((term) => ({
    url: absoluteUrl(ROUTES.glossaryTerm(term.slug)),
    lastModified: glossaryDate,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // "For [context]", destination-specific transactional pages.
  const contextEntries: MetadataRoute.Sitemap = CONTEXT_PAGES.map((c) => ({
    url: absoluteUrl(ROUTES.forContext(c.slug)),
    lastModified: contextsDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...developerEntries,
    ...engineDocsEntries,
    ...toolEntries,
    ...categoryEntries,
    ...collectionEntries,
    ...useCaseEntries,
    ...taskEntries,
    ...problemEntries,
    ...glossaryEntries,
    ...contextEntries,
    ...workflowEntries,
    ...fileTypeEntries,
    ...comparisonEntries,
    ...howToEntries,
    ...blogEntries,
    ...blogCategoryEntries,
    ...blogPageEntries,
  ];
}
