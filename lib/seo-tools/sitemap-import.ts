/**
 * Client-side sitemap import, parse an existing XML sitemap (pasted or
 * proxy-fetched) into `{ url, lastmod }` entries so generator tools can
 * auto-fill their article/URL lists instead of making users retype them.
 *
 * Pure browser: DOMParser only, no dependencies, nothing uploaded.
 */

export interface SitemapImportEntry {
  url: string;
  lastmod?: string;
}

export type SitemapParseResult =
  | { kind: "urlset"; entries: SitemapImportEntry[] }
  | { kind: "index"; childSitemaps: string[] }
  | { kind: "error"; message: string };

/** Parse sitemap XML. Handles <urlset> (entries) and <sitemapindex> (children). */
export function parseSitemapXml(xml: string): SitemapParseResult {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) {
    return { kind: "error", message: "That doesn't parse as XML. Paste the raw sitemap file contents." };
  }
  const root = doc.documentElement?.localName;
  if (root === "sitemapindex") {
    const childSitemaps = Array.from(doc.getElementsByTagName("*"))
      .filter((el) => el.localName === "loc" && el.parentElement?.localName === "sitemap")
      .map((el) => el.textContent?.trim() ?? "")
      .filter(Boolean);
    return { kind: "index", childSitemaps };
  }
  if (root !== "urlset") {
    return { kind: "error", message: `Expected a <urlset> sitemap, found <${root ?? "?"}>.` };
  }
  const entries: SitemapImportEntry[] = [];
  for (const urlEl of Array.from(doc.getElementsByTagName("*"))) {
    if (urlEl.localName !== "url") continue;
    let loc = "";
    let lastmod: string | undefined;
    for (const child of Array.from(urlEl.children)) {
      if (child.localName === "loc") loc = child.textContent?.trim() ?? "";
      if (child.localName === "lastmod") lastmod = child.textContent?.trim() || undefined;
    }
    if (loc) entries.push({ url: loc, lastmod });
  }
  return { kind: "urlset", entries };
}

/** Fallback: treat pasted plain text as one URL per line. */
export function parseUrlList(text: string): SitemapImportEntry[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^https?:\/\//i.test(l))
    .map((url) => ({ url }));
}

/** Extract a page title from fetched HTML, og:title first, then <title>. */
export function extractPageTitle(html: string): string {
  const og = /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i.exec(html)
    ?? /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i.exec(html);
  if (og?.[1]) return decodeEntities(og[1]).trim();
  const t = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return t?.[1] ? decodeEntities(t[1]).replace(/\s+/g, " ").trim() : "";
}

function decodeEntities(s: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = s;
  return el.value;
}

/** Format entries as the generators' pipe-separated article lines. */
export function entriesToArticleLines(
  entries: SitemapImportEntry[],
  titles?: Map<string, string>,
): string {
  return entries
    .map((e) => {
      const title = titles?.get(e.url) ?? "";
      const date = e.lastmod ?? "";
      return `${e.url} | ${title} | ${date}`;
    })
    .join("\n");
}
