/**
 * GigAI Tools: meta-tag engine.
 *
 * Builds `<meta>`, Open Graph and Twitter Card markup from structured input,
 * and (the honest, paste-first counterpart) analyzes a pasted HTML document
 * (via native `DOMParser`) into an extracted, scored audit. No network: to
 * inspect a *live* URL you would need a server we deliberately do not run, so
 * this operates on markup the user already has.
 *
 * All emitters HTML-escape attribute values so generated tags are safe to paste.
 */

/* --------------------------------- escaping ------------------------------- */

/** Escape a string for use inside a double-quoted HTML attribute. */
export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------------------------------- meta builder ----------------------------- */

export interface MetaTagInput {
  title?: string;
  description?: string;
  keywords?: string | string[];
  robots?: string;
  canonical?: string;
  viewport?: string;
  author?: string;
  charset?: string;
  themeColor?: string;
  language?: string;
  /** Arbitrary extra `<meta name=… content=…>` pairs. */
  extra?: Record<string, string>;
}

/**
 * Build a block of `<meta>` (and `<title>`/`<link rel=canonical>`) tags.
 * Only fields you supply are emitted; nothing is invented.
 */
export function buildMetaTags(input: MetaTagInput): string {
  const lines: string[] = [];
  if (input.charset) lines.push(`<meta charset="${escapeHtmlAttr(input.charset)}">`);
  if (input.viewport)
    lines.push(`<meta name="viewport" content="${escapeHtmlAttr(input.viewport)}">`);
  if (input.title) lines.push(`<title>${escapeHtmlAttr(input.title)}</title>`);
  if (input.description)
    lines.push(`<meta name="description" content="${escapeHtmlAttr(input.description)}">`);
  if (input.keywords) {
    const kw = Array.isArray(input.keywords) ? input.keywords.join(", ") : input.keywords;
    if (kw.trim()) lines.push(`<meta name="keywords" content="${escapeHtmlAttr(kw)}">`);
  }
  if (input.author)
    lines.push(`<meta name="author" content="${escapeHtmlAttr(input.author)}">`);
  if (input.robots)
    lines.push(`<meta name="robots" content="${escapeHtmlAttr(input.robots)}">`);
  if (input.themeColor)
    lines.push(`<meta name="theme-color" content="${escapeHtmlAttr(input.themeColor)}">`);
  if (input.language)
    lines.push(`<meta http-equiv="content-language" content="${escapeHtmlAttr(input.language)}">`);
  if (input.canonical)
    lines.push(`<link rel="canonical" href="${escapeHtmlAttr(input.canonical)}">`);
  if (input.extra) {
    for (const [name, content] of Object.entries(input.extra)) {
      if (name && content)
        lines.push(`<meta name="${escapeHtmlAttr(name)}" content="${escapeHtmlAttr(content)}">`);
    }
  }
  return lines.join("\n");
}

/* --------------------------------- OpenGraph ------------------------------ */

export interface OpenGraphInput {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: string | number;
  imageHeight?: string | number;
  siteName?: string;
  locale?: string;
  /** Extra `og:*` properties keyed without the `og:` prefix. */
  extra?: Record<string, string>;
}

export function buildOpenGraph(input: OpenGraphInput): string {
  const pairs: [string, string | undefined][] = [
    ["og:title", input.title],
    ["og:description", input.description],
    ["og:type", input.type ?? (input.title ? "website" : undefined)],
    ["og:url", input.url],
    ["og:image", input.image],
    ["og:image:alt", input.imageAlt],
    ["og:image:width", input.imageWidth !== undefined ? String(input.imageWidth) : undefined],
    ["og:image:height", input.imageHeight !== undefined ? String(input.imageHeight) : undefined],
    ["og:site_name", input.siteName],
    ["og:locale", input.locale],
  ];
  if (input.extra) {
    for (const [k, v] of Object.entries(input.extra)) pairs.push([`og:${k}`, v]);
  }
  return pairs
    .filter((p): p is [string, string] => Boolean(p[1]))
    .map(([property, content]) => `<meta property="${property}" content="${escapeHtmlAttr(content)}">`)
    .join("\n");
}

/* ------------------------------- Twitter Card ----------------------------- */

export interface TwitterCardInput {
  card?: "summary" | "summary_large_image" | "app" | "player";
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  site?: string;
  creator?: string;
}

export function buildTwitterCard(input: TwitterCardInput): string {
  const pairs: [string, string | undefined][] = [
    ["twitter:card", input.card ?? (input.image ? "summary_large_image" : "summary")],
    ["twitter:title", input.title],
    ["twitter:description", input.description],
    ["twitter:image", input.image],
    ["twitter:image:alt", input.imageAlt],
    ["twitter:site", input.site],
    ["twitter:creator", input.creator],
  ];
  return pairs
    .filter((p): p is [string, string] => Boolean(p[1]))
    .map(([name, content]) => `<meta name="${name}" content="${escapeHtmlAttr(content)}">`)
    .join("\n");
}

/* ------------------------------- title/desc score ------------------------- */

export interface LengthScore {
  value: string;
  length: number;
  /** 0–100 sub-score for this single field. */
  score: number;
  status: "good" | "warn" | "bad" | "empty";
  message: string;
}

export interface TitleDescriptionScore {
  title: LengthScore;
  description: LengthScore;
  /** Combined 0–100 score (average of the two fields). */
  score: number;
}

const TITLE_MIN = 30;
const TITLE_IDEAL_MIN = 50;
const TITLE_IDEAL_MAX = 60;
const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_IDEAL_MIN = 150;
const DESC_IDEAL_MAX = 160;
const DESC_MAX = 165;

function scoreTitle(title: string): LengthScore {
  const value = title.trim();
  const length = value.length;
  if (!length)
    return { value, length, score: 0, status: "empty", message: "Title is empty." };
  if (length >= TITLE_IDEAL_MIN && length <= TITLE_IDEAL_MAX)
    return { value, length, score: 100, status: "good", message: "Title length is ideal (50–60 chars)." };
  if (length >= TITLE_MIN && length <= TITLE_MAX)
    return {
      value,
      length,
      score: 80,
      status: "warn",
      message: length < TITLE_IDEAL_MIN ? "Title is a little short." : "Title is a little long.",
    };
  return {
    value,
    length,
    score: length < TITLE_MIN ? 40 : 30,
    status: "bad",
    message:
      length < TITLE_MIN
        ? "Title is too short. Aim for 50–60 characters."
        : "Title is too long and may be truncated in search results.",
  };
}

function scoreDescription(desc: string): LengthScore {
  const value = desc.trim();
  const length = value.length;
  if (!length)
    return { value, length, score: 0, status: "empty", message: "Meta description is empty." };
  if (length >= DESC_IDEAL_MIN && length <= DESC_IDEAL_MAX)
    return { value, length, score: 100, status: "good", message: "Description length is ideal (150–160 chars)." };
  if (length >= DESC_MIN && length <= DESC_MAX)
    return {
      value,
      length,
      score: 80,
      status: "warn",
      message: length < DESC_IDEAL_MIN ? "Description is a little short." : "Description is a little long.",
    };
  return {
    value,
    length,
    score: length < DESC_MIN ? 40 : 30,
    status: "bad",
    message:
      length < DESC_MIN
        ? "Description is too short. Aim for 150–160 characters."
        : "Description is too long and may be truncated.",
  };
}

/** Score a title/description pair for search-result presentation. */
export function titleDescriptionScore(title: string, description: string): TitleDescriptionScore {
  const t = scoreTitle(title);
  const d = scoreDescription(description);
  return { title: t, description: d, score: Math.round((t.score + d.score) / 2) };
}

/* --------------------------------- analysis ------------------------------- */

export interface ExtractedMeta {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
  author?: string;
  keywords?: string;
  language?: string;
  favicon?: string;
  og: Record<string, string>;
  twitter: Record<string, string>;
  /** Every `<meta name=… content=…>` pair, in document order. */
  namedMeta: Record<string, string>;
}

export interface MetaAuditItem {
  id: string;
  label: string;
  status: "good" | "warn" | "bad";
  message: string;
}

export interface MetaAudit {
  extracted: ExtractedMeta;
  items: MetaAuditItem[];
  /** Overall 0–100 audit score. */
  score: number;
  titleScore: TitleDescriptionScore;
}

/** Whether `DOMParser` is available in this runtime (browser vs. SSR). */
function hasDomParser(): boolean {
  return typeof DOMParser !== "undefined";
}

/** Parse a pasted HTML string into a structured meta extraction. */
export function extractMetaFromHtml(html: string): ExtractedMeta {
  const og: Record<string, string> = {};
  const twitter: Record<string, string> = {};
  const namedMeta: Record<string, string> = {};
  const result: ExtractedMeta = { og, twitter, namedMeta };
  if (!hasDomParser()) return result;

  const doc = new DOMParser().parseFromString(html, "text/html");

  const titleEl = doc.querySelector("title");
  if (titleEl?.textContent) result.title = titleEl.textContent.trim();

  const htmlLang = doc.documentElement?.getAttribute("lang");
  if (htmlLang) result.language = htmlLang.trim();

  const charsetEl = doc.querySelector("meta[charset]");
  if (charsetEl) result.charset = charsetEl.getAttribute("charset") ?? undefined;

  doc.querySelectorAll("meta").forEach((el) => {
    const name = el.getAttribute("name")?.toLowerCase();
    const property = el.getAttribute("property")?.toLowerCase();
    const content = el.getAttribute("content") ?? "";
    if (property?.startsWith("og:")) {
      og[property.slice(3)] = content;
    } else if (
      (name && name.startsWith("twitter:")) ||
      (property && property.startsWith("twitter:"))
    ) {
      const key = (name ?? property ?? "").slice("twitter:".length);
      twitter[key] = content;
    } else if (name) {
      namedMeta[name] = content;
      if (name === "description") result.description = content.trim();
      if (name === "robots") result.robots = content.trim();
      if (name === "viewport") result.viewport = content.trim();
      if (name === "author") result.author = content.trim();
      if (name === "keywords") result.keywords = content.trim();
    }
  });

  const canonical = doc.querySelector('link[rel="canonical"]');
  if (canonical) result.canonical = canonical.getAttribute("href") ?? undefined;

  const favicon = doc.querySelector('link[rel~="icon"]');
  if (favicon) result.favicon = favicon.getAttribute("href") ?? undefined;

  return result;
}

/**
 * Analyze pasted HTML into a scored SEO meta audit: extracts the tags, checks
 * title/description lengths, canonical, viewport, charset, robots, social
 * cards, and flags missing or duplicate essentials.
 */
export function analyzeMetaFromHtml(html: string): MetaAudit {
  const extracted = extractMetaFromHtml(html);
  const items: MetaAuditItem[] = [];
  const titleScore = titleDescriptionScore(extracted.title ?? "", extracted.description ?? "");

  const push = (id: string, label: string, status: MetaAuditItem["status"], message: string) =>
    items.push({ id, label, status, message });

  // Title.
  push(
    "title",
    "Title tag",
    titleScore.title.status === "empty" ? "bad" : titleScore.title.status === "good" ? "good" : "warn",
    titleScore.title.status === "empty" ? "No <title> found." : `${titleScore.title.length} chars: ${titleScore.title.message}`,
  );

  // Description.
  push(
    "description",
    "Meta description",
    titleScore.description.status === "empty" ? "bad" : titleScore.description.status === "good" ? "good" : "warn",
    titleScore.description.status === "empty"
      ? "No meta description found."
      : `${titleScore.description.length} chars, ${titleScore.description.message}`,
  );

  // Duplicate title/description detection.
  if (hasDomParser()) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (doc.querySelectorAll("title").length > 1)
      push("dup-title", "Duplicate title", "bad", "More than one <title> tag found.");
    if (doc.querySelectorAll('meta[name="description"]').length > 1)
      push("dup-desc", "Duplicate description", "bad", "More than one meta description found.");
  }

  // Canonical.
  push(
    "canonical",
    "Canonical URL",
    extracted.canonical ? "good" : "warn",
    extracted.canonical ? `Canonical set: ${extracted.canonical}` : "No canonical link. Add one to avoid duplicate-content issues.",
  );

  // Viewport.
  push(
    "viewport",
    "Viewport",
    extracted.viewport ? "good" : "bad",
    extracted.viewport ? "Responsive viewport set." : "No viewport meta: the page will not be mobile-friendly.",
  );

  // Charset.
  push(
    "charset",
    "Charset",
    extracted.charset ? "good" : "warn",
    extracted.charset ? `Charset ${extracted.charset}.` : "No charset declared: declare UTF-8.",
  );

  // Robots.
  const blocked = /noindex/i.test(extracted.robots ?? "");
  push(
    "robots",
    "Robots directive",
    blocked ? "bad" : "good",
    blocked ? "Page is set to noindex. Search engines will not index it." : extracted.robots ? `robots: ${extracted.robots}` : "No robots meta (defaults to index,follow).",
  );

  // Open Graph.
  const ogOk = Boolean(extracted.og["title"] && extracted.og["image"]);
  push(
    "og",
    "Open Graph",
    ogOk ? "good" : Object.keys(extracted.og).length ? "warn" : "warn",
    ogOk
      ? "Open Graph title and image present."
      : Object.keys(extracted.og).length
        ? "Partial Open Graph. Add og:title and og:image for rich sharing."
        : "No Open Graph tags. Social shares will look plain.",
  );

  // Twitter card.
  push(
    "twitter",
    "Twitter Card",
    extracted.twitter["card"] ? "good" : "warn",
    extracted.twitter["card"] ? `twitter:card = ${extracted.twitter["card"]}` : "No Twitter Card tags.",
  );

  const weights: Record<MetaAuditItem["status"], number> = { good: 1, warn: 0.5, bad: 0 };
  const score = items.length
    ? Math.round((items.reduce((sum, it) => sum + weights[it.status], 0) / items.length) * 100)
    : 0;

  return { extracted, items, score, titleScore };
}
