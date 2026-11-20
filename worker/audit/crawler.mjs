/**
 * Site Audit crawler. Public http(s) only, SSRF-fenced (same guard as the
 * import fetcher), robots.txt-respecting, same-origin, breadth-first.
 * Hard limits: page cap, 2 MB per page, total time budget. Crawled HTML
 * lives only in memory for the duration of the audit - never persisted.
 */

import robotsParser from "robots-parser";

import { assertPublicHost } from "../net-guard.mjs";

export const AUDIT_UA = "GigAI-SiteAudit/1.0 (+https://gigai.tools/site-audit)";
const PAGE_BYTE_CAP = 2 * 1024 * 1024;
const PAGE_TIMEOUT_MS = 10_000;

/** Fetch one URL with the audit UA, size cap and per-page timeout. */
async function fetchPage(url, accept = "text/html") {
  await assertPublicHost(url);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PAGE_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": AUDIT_UA, accept },
    });
    const reader = resp.body?.getReader();
    let received = 0;
    const parts = [];
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        if (received > PAGE_BYTE_CAP) {
          await reader.cancel();
          break;
        }
        parts.push(value);
      }
    }
    const body = Buffer.concat(parts).toString("utf8");
    return {
      url: resp.url || url,
      status: resp.status,
      contentType: resp.headers.get("content-type") ?? "",
      headers: { xRobotsTag: resp.headers.get("x-robots-tag") ?? null },
      body,
      truncated: received > PAGE_BYTE_CAP,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Extract same-origin, crawlable hrefs from raw HTML. */
export function extractLinks(html, baseUrl) {
  const origin = new URL(baseUrl).origin;
  const found = new Set();
  for (const m of html.matchAll(/<a\s[^>]*href\s*=\s*["']([^"']+)["']/gi)) {
    try {
      const u = new URL(m[1], baseUrl);
      u.hash = "";
      u.search = "";
      if (u.origin === origin && /^https?:$/.test(u.protocol)) {
        const p = u.pathname.toLowerCase();
        if (!/\.(png|jpe?g|gif|webp|svg|ico|css|js|mjs|pdf|zip|mp[34]|woff2?|ttf|xml|txt|webmanifest)$/.test(p)) {
          found.add(u.href);
        }
      }
    } catch {
      /* unparsable href */
    }
  }
  return [...found];
}

/**
 * Crawl a site. onProgress(state) fires after each page. Returns
 * { pages: [{url, status, contentType, headers, body, truncated}],
 *   robotsTxt, robotsUrl, sitemapStatus, startUrl, outOfBudget }.
 */
export async function crawl(startUrl, { maxPages = 25, budgetMs = 60_000, onProgress } = {}) {
  const start = new URL(startUrl);
  if (!/^https?:$/.test(start.protocol)) throw new Error("Only http(s) URLs can be audited.");
  const deadline = Date.now() + budgetMs;

  // robots.txt governs the crawl AND is itself audit evidence.
  let robotsTxt = null;
  let robots = null;
  const robotsUrl = `${start.origin}/robots.txt`;
  try {
    const r = await fetchPage(robotsUrl, "text/plain");
    if (r.status === 200) {
      robotsTxt = r.body.slice(0, 100_000);
      robots = robotsParser(robotsUrl, robotsTxt);
    }
  } catch {
    /* unreachable robots = crawl allowed, finding recorded by checks */
  }

  let sitemapStatus = 0;
  try {
    const s = await fetchPage(`${start.origin}/sitemap.xml`, "application/xml");
    sitemapStatus = s.status;
  } catch {
    /* recorded as missing */
  }

  const queue = [start.href];
  const seen = new Set(queue);
  const pages = [];
  let outOfBudget = false;

  while (queue.length && pages.length < maxPages) {
    if (Date.now() > deadline) {
      outOfBudget = true;
      break;
    }
    const url = queue.shift();
    if (robots && !robots.isAllowed(url, AUDIT_UA) && !robots.isAllowed(url, "*")) continue;
    try {
      const page = await fetchPage(url);
      if (!page.contentType.includes("text/html")) continue;
      pages.push(page);
      onProgress?.({ crawled: pages.length, queued: queue.length, current: url });
      for (const link of extractLinks(page.body, page.url)) {
        if (!seen.has(link) && seen.size < maxPages * 8) {
          seen.add(link);
          queue.push(link);
        }
      }
    } catch {
      pages.push({ url, status: 0, contentType: "", headers: {}, body: "", truncated: false });
    }
  }

  return { pages, robotsTxt, robotsUrl, sitemapStatus, startUrl: start.href, outOfBudget };
}
