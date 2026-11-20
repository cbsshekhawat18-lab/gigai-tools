import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import GithubSlugger, { slug as githubSlug } from "github-slugger";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import readingTime from "reading-time";

import { slugify } from "@/lib/utils";
import type { BlogPost } from "@/types";

/** A parsed table-of-contents entry (h2/h3) with its anchor id. */
export interface Heading {
  id: string;
  text: string;
  /** 2 for `h2`, 3 for `h3`. */
  level: 2 | 3;
}

/** A category or tag facet with its URL slug and post count. */
export interface Taxonomy {
  name: string;
  slug: string;
  count: number;
}

/** A page of posts for the prerendered blog pagination routes. */
export interface PaginatedPosts {
  posts: BlogPost[];
  page: number;
  totalPages: number;
  total: number;
}

/** Previous/next posts in chronological (newest-first) order. */
export interface AdjacentPosts {
  prev: BlogPost | null;
  next: BlogPost | null;
}

/**
 * Filesystem-backed blog. Reads markdown from content/blog/*.md, parses
 * frontmatter with gray-matter, renders body HTML with remark (+ GFM), and
 * derives reading time. SERVER ONLY, imported by server components and route
 * handlers, never shipped to the client.
 */

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const MD_EXTENSION = /\.mdx?$/;

/** Raw frontmatter shape as authored in markdown files. */
interface Frontmatter {
  title?: string;
  description?: string;
  date?: string;
  updated?: string;
  author?: string;
  cover?: string;
  tags?: string[];
  category?: string;
  /** Slug of the tool this article supports, powers auto "Related articles". */
  tool?: string;
  featured?: boolean;
}

/** List markdown files in the blog directory (empty if the dir is missing). */
async function readBlogFilenames(): Promise<string[]> {
  try {
    const entries = await fs.readdir(BLOG_DIR);
    return entries.filter((name) => MD_EXTENSION.test(name));
  } catch {
    return [];
  }
}

/** Strip the extension to derive a slug from a filename. */
function toSlug(filename: string): string {
  return filename.replace(MD_EXTENSION, "");
}

/** Matches an opening heading tag we want to anchor (h2–h4). */
const HEADING_TAG = /<(h[2-4])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
/** Strips inline HTML tags to recover a heading's plain-text label. */
const HTML_TAG = /<[^>]+>/g;

/** Named HTML entities remark may emit inside heading text. */
const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&nbsp;": " ",
};

/**
 * Decode the HTML entities remark emits inside heading text, named entities
 * plus decimal (`&#38;`) and hex (`&#x26;`) numeric references. Doing this
 * before slugging keeps anchor ids clean (e.g. "A & B" → "a-b", never "a-x26-b").
 */
function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&[a-z]+;/gi, (m) => NAMED_ENTITIES[m.toLowerCase()] ?? m);
}

/** Plain-text label of a heading's inner HTML (tags stripped, entities decoded). */
function headingText(innerHtml: string): string {
  return decodeEntities(innerHtml.replace(HTML_TAG, "")).trim();
}

/**
 * Add `id` attributes to headings in rendered HTML, matching the exact slug
 * algorithm of `rehype-slug` (both use `github-slugger`, so TOC anchors and
 * `extractHeadings` stay in lock-step). A fresh slugger per document keeps
 * duplicate-heading de-duplication (`-1`, `-2`) deterministic. Headings that
 * already carry an `id` are left untouched.
 */
function addHeadingIds(html: string): string {
  const slugger = new GithubSlugger();
  return html.replace(HEADING_TAG, (match, tag: string, attrs: string | undefined, inner: string) => {
    if (attrs && /\sid=/.test(attrs)) return match;
    const id = slugger.slug(headingText(inner));
    return `<${tag}${attrs ?? ""} id="${id}">${inner}</${tag}>`;
  });
}

/** Render markdown to sanitized HTML with GitHub-flavoured extensions. */
async function renderMarkdown(markdown: string): Promise<string> {
  const file = await remark().use(remarkGfm).use(remarkHtml).process(markdown);
  return addHeadingIds(String(file));
}

/** Build a BlogPost from a file's frontmatter + body (HTML optional). */
function toPost(slug: string, data: Frontmatter, content: string, contentHtml?: string): BlogPost {
  const post: BlogPost = {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    author: data.author ?? "Chandrabhan Shekhawat",
    date: data.date ?? new Date().toISOString().slice(0, 10),
    readingTimeMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
  };

  if (data.updated) post.updated = data.updated;
  if (data.cover) post.cover = data.cover;
  if (data.tags) post.tags = data.tags;
  if (data.category) post.category = data.category;
  if (data.tool) post.tool = data.tool;
  if (typeof data.featured === "boolean") post.featured = data.featured;
  if (contentHtml) post.contentHtml = contentHtml;

  return post;
}

/** Parse a single file into a BlogPost (metadata only unless `withHtml`). */
async function loadPost(filename: string, withHtml: boolean): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, filename);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  const frontmatter = data as Frontmatter;
  const contentHtml = withHtml ? await renderMarkdown(content) : undefined;

  return toPost(toSlug(filename), frontmatter, content, contentHtml);
}

/** Newest-first comparator by ISO date. */
function byDateDesc(a: BlogPost, b: BlogPost): number {
  return Date.parse(b.date) - Date.parse(a.date);
}

/* ── Public API ───────────────────────────────────────────────────────────── */

/** All posts (metadata only, no HTML body), sorted newest first. */
export async function getAllPosts(): Promise<BlogPost[]> {
  const filenames = await readBlogFilenames();
  const posts = await Promise.all(filenames.map((name) => loadPost(name, false)));
  return posts.filter((p): p is BlogPost => p !== null).sort(byDateDesc);
}

/** A single post with rendered `contentHtml`, or null if not found. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const filenames = await readBlogFilenames();
  const match = filenames.find((name) => toSlug(name) === slug);
  if (!match) return null;
  return loadPost(match, true);
}

/** Every post slug, for generateStaticParams and the sitemap. */
export async function getAllPostSlugs(): Promise<string[]> {
  const filenames = await readBlogFilenames();
  return filenames.map(toSlug);
}

/**
 * Related posts for a given post: same category first, then most recent others,
 * always excluding the post itself. Metadata only.
 */
export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const all = (await getAllPosts()).filter((p) => p.slug !== post.slug);

  const sameCategory = post.category
    ? all.filter((p) => p.category === post.category)
    : [];
  const rest = all.filter((p) => !sameCategory.includes(p));

  return [...sameCategory, ...rest].slice(0, limit);
}

/** Featured posts (`featured: true`), newest first, optionally capped. */
export async function getFeaturedPosts(limit?: number): Promise<BlogPost[]> {
  const featured = (await getAllPosts()).filter((p) => p.featured);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

/**
 * Articles that support a given tool (`tool: <slug>` in frontmatter), newest
 * first. Powers the "Guides & articles" section on each tool micro-site.
 * Metadata only. No rendered HTML body.
 */
export async function getPostsByTool(slug: string): Promise<BlogPost[]> {
  return (await getAllPosts()).filter((p) => p.tool === slug);
}

/**
 * Articles for a category landing's "Guides & articles" rail. Matches posts
 * whose `category` equals `tag`, or that carry `tag` in their `tags` list,
 * newest first. `tag` is typically a category slug (or `Category.guidesTag`).
 * Metadata only. No rendered HTML body.
 */
export async function getPostsByCategory(
  tag: string,
  limit?: number,
): Promise<BlogPost[]> {
  const matched = (await getAllPosts()).filter(
    (p) => p.category === tag || (p.tags?.includes(tag) ?? false),
  );
  return typeof limit === "number" ? matched.slice(0, limit) : matched;
}

/* ── Pagination ───────────────────────────────────────────────────────────── */

/**
 * A slice of posts for a prerendered pagination route (`/blog/page/[page]`).
 * `page` is 1-based and clamped to `[1, totalPages]`; an empty blog yields a
 * single empty page so generateStaticParams always has at least one route.
 */
export async function getPaginatedPosts(page: number, perPage = 9): Promise<PaginatedPosts> {
  const all = await getAllPosts();
  const total = all.length;
  const size = Math.max(1, perPage);
  const totalPages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (current - 1) * size;
  return { posts: all.slice(start, start + size), page: current, totalPages, total };
}

/* ── Taxonomies (categories & tags) ───────────────────────────────────────── */

/** Aggregate a taxonomy field into `{name, slug, count}[]`, sorted by count then name. */
function aggregate(posts: BlogPost[], pick: (p: BlogPost) => string[]): Taxonomy[] {
  const byName = new Map<string, number>();
  for (const post of posts) {
    for (const name of pick(post)) {
      const label = name.trim();
      if (label) byName.set(label, (byName.get(label) ?? 0) + 1);
    }
  }
  return [...byName.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** All distinct blog categories with their post counts, most-used first. */
export async function getAllCategories(): Promise<Taxonomy[]> {
  const posts = await getAllPosts();
  return aggregate(posts, (p) => (p.category ? [p.category] : []));
}

/** All distinct blog tags with their post counts, most-used first. */
export async function getAllTags(): Promise<Taxonomy[]> {
  const posts = await getAllPosts();
  return aggregate(posts, (p) => p.tags ?? []);
}

/** Posts in a category, matched by URL-safe slug of the category name, newest first. */
export async function getPostsByCategorySlug(slug: string): Promise<BlogPost[]> {
  return (await getAllPosts()).filter((p) => p.category && slugify(p.category) === slug);
}

/** Posts carrying a tag, matched by URL-safe slug of the tag name, newest first. */
export async function getPostsByTag(slug: string): Promise<BlogPost[]> {
  return (await getAllPosts()).filter((p) => (p.tags ?? []).some((t) => slugify(t) === slug));
}

/* ── Adjacent posts (prev/next) ───────────────────────────────────────────── */

/**
 * The previous and next posts around `slug` in chronological reading order.
 * Lists are newest-first, so `next` is the newer post (earlier in the array)
 * and `prev` is the older one. Either may be null at the ends; both are null
 * if the slug isn't found.
 */
export async function getAdjacentPosts(slug: string): Promise<AdjacentPosts> {
  const all = await getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: all[i + 1] ?? null, next: all[i - 1] ?? null };
}

/* ── Table of contents ────────────────────────────────────────────────────── */

/**
 * Extract h2/h3 headings from rendered `contentHtml` for a table of contents.
 * Prefers the `id` already on the heading (set by the markdown pipeline, which
 * mirrors `rehype-slug`); if one is somehow missing, derives a stable slug from
 * the text so anchors still resolve.
 */
export function extractHeadings(contentHtml: string): Heading[] {
  const headings: Heading[] = [];
  const re = /<(h2|h3)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(contentHtml)) !== null) {
    const tag = match[1]?.toLowerCase();
    const attrs = match[2] ?? "";
    const inner = match[3] ?? "";
    const text = headingText(inner);
    if (!text) continue;
    const idAttr = /\sid=["']([^"']+)["']/.exec(attrs)?.[1];
    const id = idAttr ?? githubSlug(text);
    headings.push({ id, text, level: tag === "h3" ? 3 : 2 });
  }
  return headings;
}
