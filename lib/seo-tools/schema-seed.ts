/**
 * GigAI SEO tools, shared "read a page's existing structured data / meta"
 * helpers. A tiny, dependency-free reader used by every URL-first generator
 * (the schema hub, the per-type schema generators, and the OG/Twitter/meta
 * generators) so "fetch a URL → pre-fill the form" behaves consistently and no
 * tool re-implements JSON-LD/meta parsing. Pure functions, no DOM required.
 */

export type J = Record<string, unknown>;

export const isObj = (v: unknown): v is J => typeof v === "object" && v !== null && !Array.isArray(v);

/** Coerce a JSON value to a trimmed string ("" for anything non-scalar). */
export const g = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

export const firstOf = (v: unknown): unknown => (Array.isArray(v) ? v[0] : v);

/** First non-empty string among the given keys of a node. */
export const pick = (node: J, ...keys: string[]): string => {
  for (const k of keys) {
    const v = g(node[k]);
    if (v) return v;
  }
  return "";
};

/** Name of a value that may be a string, an object with `.name`, or an array. */
export const nameOf = (v: unknown): string => {
  const f = firstOf(v);
  return typeof f === "string" ? f : isObj(f) ? g(f.name) : "";
};

/** URL of a value that may be a string, an object with `.url`/`@id`, or array. */
export const urlOf = (v: unknown): string => {
  const f = firstOf(v);
  return typeof f === "string" ? f : isObj(f) ? g(f.url) || g(f["@id"]) : "";
};

/** URL of an image value (string | {url|contentUrl} | array). */
export const imgOf = (v: unknown): string => {
  const f = firstOf(v);
  return typeof f === "string" ? f : isObj(f) ? g(f.url) || g(f.contentUrl) : "";
};

/** ISO datetime → yyyy-mm-dd. */
export const dateOnly = (v: unknown): string => {
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(g(v));
  return m ? m[1]! : "";
};

/** ISO datetime → yyyy-mm-ddThh:mm (for datetime-local inputs). */
export const isoLocal = (v: unknown): string => {
  const m = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}))?/.exec(g(v));
  return m ? (m[2] ? `${m[1]}T${m[2]}` : m[1]!) : "";
};

/** Strip a schema.org enum URL prefix, e.g. https://schema.org/InStock → InStock. */
export const stripEnum = (v: unknown): string => g(v).replace(/^https?:\/\/schema\.org\//i, "");

/** Coerce a value to a string[] (array of strings, or names/text of objects). */
export const listOf = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x : isObj(x) ? g(x.name) || g(x.text) || g(x.url) : "")).filter(Boolean);
  const one = g(v);
  return one ? [one] : [];
};

/** ISO 8601 duration (PT#H#M#S) → total seconds (0 if unparseable). */
export const parseIsoDuration = (v: unknown): number => {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(g(v));
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
};

export const offersOf = (node: J): J | null => {
  const o = firstOf(node.offers);
  return isObj(o) ? o : null;
};

export const ratingOf = (node: J): J | null => (isObj(node.aggregateRating) ? node.aggregateRating : null);

/** Flatten @graph / arrays into a flat list of typed nodes. */
export function collectSchemaNodes(v: unknown, out: J[]): void {
  if (Array.isArray(v)) {
    for (const x of v) collectSchemaNodes(x, out);
    return;
  }
  if (!isObj(v)) return;
  if (Array.isArray(v["@graph"])) for (const x of v["@graph"]) collectSchemaNodes(x, out);
  if (v["@type"]) out.push(v);
}

/** Pull every JSON-LD block out of raw HTML (no DOM needed). */
export function extractJsonLdNodes(html: string): J[] {
  const out: J[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      collectSchemaNodes(JSON.parse(m[1]!.trim()), out);
    } catch {
      /* skip invalid block */
    }
  }
  return out;
}

/** First JSON-LD node whose @type matches any of `types` (case-insensitive). */
export function findJsonLdNode(html: string, types: string[]): J | null {
  const want = new Set(types.map((t) => t.toLowerCase()));
  for (const node of extractJsonLdNodes(html)) {
    const t = node["@type"];
    for (const x of Array.isArray(t) ? t : [t]) {
      if (typeof x === "string" && want.has(x.toLowerCase())) return node;
    }
  }
  return null;
}

export const decodeEntities = (s: string): string =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'");

/** Read one meta tag's content regardless of attribute order. */
export function metaContent(html: string, key: string, attr: "name" | "property"): string {
  const tag = new RegExp(`<meta[^>]*\\b${attr}=["']${key}["'][^>]*>`, "i").exec(html)?.[0];
  if (!tag) return "";
  const c = /\bcontent=["']([^"']*)["']/i.exec(tag);
  return c ? decodeEntities(c[1]!) : "";
}

/** Read the canonical link href from raw HTML. */
export function canonicalOf(html: string): string {
  const tag = /<link[^>]*\brel=["']canonical["'][^>]*>/i.exec(html)?.[0];
  if (!tag) return "";
  const h = /\bhref=["']([^"']*)["']/i.exec(tag);
  return h ? h[1]! : "";
}

/** Normalised page metadata for the OG/Twitter/meta generators. */
export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  ogUrl: string;
  ogSiteName: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
  twitterCreator: string;
}

/** Extract normalised title/description/OG/Twitter meta from raw HTML. */
export function extractPageMeta(html: string): PageMeta {
  const titleTag = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const rawTitle = titleTag ? decodeEntities(titleTag[1]!.trim()) : "";
  const og = (k: string) => metaContent(html, `og:${k}`, "property");
  const tw = (k: string) => metaContent(html, `twitter:${k}`, "name");
  return {
    title: og("title") || rawTitle,
    description: og("description") || metaContent(html, "description", "name"),
    canonical: canonicalOf(html),
    ogTitle: og("title") || rawTitle,
    ogDescription: og("description") || metaContent(html, "description", "name"),
    ogImage: og("image"),
    ogType: og("type"),
    ogUrl: og("url") || canonicalOf(html),
    ogSiteName: og("site_name"),
    twitterCard: tw("card"),
    twitterTitle: tw("title") || og("title") || rawTitle,
    twitterDescription: tw("description") || og("description") || metaContent(html, "description", "name"),
    twitterImage: tw("image") || og("image"),
    twitterSite: tw("site"),
    twitterCreator: tw("creator"),
  };
}
