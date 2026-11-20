/**
 * GigAI Tools: sitemap engine.
 *
 * Generates XML sitemaps (standard, image, video, news) and an HTML sitemap
 * (nested list) from a list of URLs, and validates a pasted sitemap XML via the
 * native `DOMParser`. Pure and dependency-free; XML values are escaped so
 * generated markup is always well-formed. No network. You supply the URLs.
 */

export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export const CHANGE_FREQS: ChangeFreq[] = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: ChangeFreq;
  /** 0.0–1.0 */
  priority?: number | string;
}

export interface SitemapDefaults {
  lastmod?: string;
  changefreq?: ChangeFreq;
  priority?: number | string;
}

/** Escape a value for inclusion in XML text/attributes. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

function priorityStr(p: number | string | undefined): string | undefined {
  if (p === undefined) return undefined;
  const n = typeof p === "string" ? Number(p) : p;
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.min(1, n)).toFixed(1);
}

/** Normalize a raw URL list (strings or objects) into {@link SitemapUrl}s. */
function normalizeUrls(urls: (string | SitemapUrl)[], defaults?: SitemapDefaults): SitemapUrl[] {
  return urls.map((u) => {
    const base = typeof u === "string" ? { loc: u } : u;
    return {
      loc: base.loc,
      lastmod: base.lastmod ?? defaults?.lastmod,
      changefreq: base.changefreq ?? defaults?.changefreq,
      priority: base.priority ?? defaults?.priority,
    };
  });
}

/** Generate a standard `<urlset>` XML sitemap. */
export function generateXmlSitemap(
  urls: (string | SitemapUrl)[],
  defaults?: SitemapDefaults,
): string {
  const entries = normalizeUrls(urls, defaults)
    .filter((u) => u.loc.trim())
    .map((u) => {
      const parts = [`    <loc>${escapeXml(u.loc.trim())}</loc>`];
      if (u.lastmod) parts.push(`    <lastmod>${escapeXml(u.lastmod)}</lastmod>`);
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
      const pr = priorityStr(u.priority);
      if (pr !== undefined) parts.push(`    <priority>${pr}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

/* ------------------------------ image sitemap ----------------------------- */

export interface ImageEntry {
  loc: string;
  images: { loc: string; title?: string; caption?: string }[];
  lastmod?: string;
}

export function generateImageSitemap(entries: ImageEntry[]): string {
  const body = entries
    .filter((e) => e.loc.trim())
    .map((e) => {
      const imgs = e.images
        .filter((im) => im.loc.trim())
        .map((im) => {
          const p = [`      <image:loc>${escapeXml(im.loc.trim())}</image:loc>`];
          if (im.title) p.push(`      <image:title>${escapeXml(im.title)}</image:title>`);
          if (im.caption) p.push(`      <image:caption>${escapeXml(im.caption)}</image:caption>`);
          return `    <image:image>\n${p.join("\n")}\n    </image:image>`;
        })
        .join("\n");
      const lastmod = e.lastmod ? `\n    <lastmod>${escapeXml(e.lastmod)}</lastmod>` : "";
      return `  <url>\n    <loc>${escapeXml(e.loc.trim())}</loc>${lastmod}\n${imgs}\n  </url>`;
    })
    .join("\n");
  return `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>`;
}

/* ------------------------------ video sitemap ----------------------------- */

export interface VideoEntry {
  loc: string;
  video: {
    thumbnailLoc: string;
    title: string;
    description: string;
    contentLoc?: string;
    playerLoc?: string;
    duration?: number;
    publicationDate?: string;
  };
}

export function generateVideoSitemap(entries: VideoEntry[]): string {
  const body = entries
    .filter((e) => e.loc.trim())
    .map((e) => {
      const v = e.video;
      const p = [
        `      <video:thumbnail_loc>${escapeXml(v.thumbnailLoc)}</video:thumbnail_loc>`,
        `      <video:title>${escapeXml(v.title)}</video:title>`,
        `      <video:description>${escapeXml(v.description)}</video:description>`,
      ];
      if (v.contentLoc) p.push(`      <video:content_loc>${escapeXml(v.contentLoc)}</video:content_loc>`);
      if (v.playerLoc) p.push(`      <video:player_loc>${escapeXml(v.playerLoc)}</video:player_loc>`);
      if (v.duration !== undefined) p.push(`      <video:duration>${Math.max(0, Math.floor(v.duration))}</video:duration>`);
      if (v.publicationDate) p.push(`      <video:publication_date>${escapeXml(v.publicationDate)}</video:publication_date>`);
      return `  <url>\n    <loc>${escapeXml(e.loc.trim())}</loc>\n    <video:video>\n${p.join("\n")}\n    </video:video>\n  </url>`;
    })
    .join("\n");
  return `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${body}\n</urlset>`;
}

/* ------------------------------- news sitemap ----------------------------- */

export interface NewsEntry {
  loc: string;
  publicationName: string;
  publicationLanguage: string;
  title: string;
  publicationDate: string;
}

export function generateNewsSitemap(entries: NewsEntry[]): string {
  const body = entries
    .filter((e) => e.loc.trim())
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeXml(e.loc.trim())}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${escapeXml(
          e.publicationName,
        )}</news:name>\n        <news:language>${escapeXml(
          e.publicationLanguage,
        )}</news:language>\n      </news:publication>\n      <news:publication_date>${escapeXml(
          e.publicationDate,
        )}</news:publication_date>\n      <news:title>${escapeXml(e.title)}</news:title>\n    </news:news>\n  </url>`,
    )
    .join("\n");
  return `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${body}\n</urlset>`;
}

/* ------------------------------- HTML sitemap ----------------------------- */

interface UrlTreeNode {
  segment: string;
  href?: string;
  children: Map<string, UrlTreeNode>;
}

/**
 * Generate a human-facing HTML sitemap: URLs are grouped into a nested `<ul>`
 * tree by their path segments. Returns an HTML fragment (no wrapping document).
 */
export function generateHtmlSitemap(urls: (string | SitemapUrl)[]): string {
  const root: UrlTreeNode = { segment: "", children: new Map() };
  for (const raw of urls) {
    const loc = (typeof raw === "string" ? raw : raw.loc).trim();
    if (!loc) continue;
    let segments: string[];
    try {
      const u = new URL(loc);
      segments = u.pathname.split("/").filter(Boolean);
    } catch {
      segments = loc.split("/").filter(Boolean);
    }
    let node = root;
    if (segments.length === 0) {
      node.href = loc;
      continue;
    }
    segments.forEach((seg, i) => {
      let child = node.children.get(seg);
      if (!child) {
        child = { segment: seg, children: new Map() };
        node.children.set(seg, child);
      }
      if (i === segments.length - 1) child.href = loc;
      node = child;
    });
  }

  const renderNode = (node: UrlTreeNode, depth: number): string => {
    const pad = "  ".repeat(depth);
    const kids = [...node.children.values()]
      .map((c) => renderNode(c, depth + 1))
      .join("\n");
    const label = node.href
      ? `<a href="${escapeXml(node.href)}">${escapeXml(node.segment)}</a>`
      : escapeXml(node.segment);
    const childBlock = kids ? `\n${pad}  <ul>\n${kids}\n${pad}  </ul>\n${pad}` : "";
    return `${pad}<li>${label}${childBlock}</li>`;
  };

  const top = [...root.children.values()].map((c) => renderNode(c, 1)).join("\n");
  const home = root.href ? `  <li><a href="${escapeXml(root.href)}">Home</a></li>\n` : "";
  return `<ul class="html-sitemap">\n${home}${top}\n</ul>`;
}

/* -------------------------------- validation ------------------------------ */

export interface SitemapValidation {
  ok: boolean;
  urlCount: number;
  errors: string[];
  warnings: string[];
}

const MAX_URLS = 50000;
const VALID_FREQS = new Set<string>(CHANGE_FREQS);

/**
 * Validate a pasted sitemap XML string: checks well-formedness (via DOMParser),
 * that every `<url>` has a `<loc>`, the ≤50,000-URL limit, HTTPS locs, and valid
 * `changefreq`/`priority` values. Returns errors + non-blocking warnings.
 */
export function validateSitemap(xml: string): SitemapValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const trimmed = xml.trim();
  if (!trimmed) return { ok: false, urlCount: 0, errors: ["Input is empty."], warnings };
  if (typeof DOMParser === "undefined")
    return { ok: false, urlCount: 0, errors: ["DOMParser is unavailable in this environment."], warnings };

  const doc = new DOMParser().parseFromString(trimmed, "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    return {
      ok: false,
      urlCount: 0,
      errors: [`XML is not well-formed: ${parseError.textContent?.trim() ?? "parse error"}`],
      warnings,
    };
  }

  const rootName = doc.documentElement?.nodeName;
  const isIndex = rootName === "sitemapindex";
  if (rootName !== "urlset" && !isIndex) {
    warnings.push(`Root element is <${rootName}>; expected <urlset> or <sitemapindex>.`);
  }

  const urlNodes = isIndex ? doc.querySelectorAll("sitemap") : doc.querySelectorAll("url");
  const urlCount = urlNodes.length;

  if (urlCount === 0) errors.push("Sitemap contains no URL entries.");
  if (urlCount > MAX_URLS)
    errors.push(`Sitemap has ${urlCount} URLs; the limit is ${MAX_URLS}. Split into multiple sitemaps.`);

  let missingLoc = 0;
  let nonHttps = 0;
  urlNodes.forEach((node) => {
    const loc = node.querySelector("loc")?.textContent?.trim();
    if (!loc) {
      missingLoc += 1;
      return;
    }
    if (!/^https:\/\//i.test(loc)) nonHttps += 1;

    if (!isIndex) {
      const freq = node.querySelector("changefreq")?.textContent?.trim();
      if (freq && !VALID_FREQS.has(freq)) warnings.push(`Invalid changefreq "${freq}" on ${loc}.`);
      const pr = node.querySelector("priority")?.textContent?.trim();
      if (pr) {
        const n = Number(pr);
        if (!Number.isFinite(n) || n < 0 || n > 1)
          warnings.push(`Priority "${pr}" on ${loc} must be between 0.0 and 1.0.`);
      }
    }
  });

  if (missingLoc) errors.push(`${missingLoc} entr${missingLoc === 1 ? "y is" : "ies are"} missing a <loc>.`);
  if (nonHttps) warnings.push(`${nonHttps} URL(s) are not HTTPS.`);

  return { ok: errors.length === 0, urlCount, errors, warnings };
}
