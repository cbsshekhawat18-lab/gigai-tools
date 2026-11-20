/**
 * Site Audit checks - all deterministic, no model anywhere. Each check
 * returns findings: { id, severity, page, message, evidence, data? }.
 * Evidence is a short snippet (<=200 chars) of the page's own markup or
 * text - enough to show the user why, never the whole page.
 */

import { parseHTML } from "linkedom";

export const AI_CRAWLERS = ["GPTBot", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "CCBot"];

const clip = (s, n = 200) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

function finding(id, severity, page, message, evidence = "", data = undefined) {
  return { id, severity, page, message, evidence: clip(evidence), ...(data ? { data } : {}) };
}

/** Parse once per page; every per-page check reads from this. */
export function analyzePage(page) {
  const { document } = parseHTML(page.body || "<html></html>");
  const meta = (name, attr = "name") =>
    document.querySelector(`meta[${attr}="${name}"]`)?.getAttribute("content") ?? null;
  const jsonLd = [];
  for (const el of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      jsonLd.push({ ok: true, data: JSON.parse(el.textContent) });
    } catch (err) {
      jsonLd.push({ ok: false, error: String(err.message).slice(0, 120), raw: clip(el.textContent, 120) });
    }
  }
  const bodyText = clip(document.body?.textContent ?? "", 100_000);
  return {
    url: page.url,
    title: document.querySelector("title")?.textContent?.trim() ?? null,
    metaDescription: meta("description"),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
    viewport: meta("viewport"),
    robotsMeta: meta("robots"),
    lang: document.documentElement?.getAttribute("lang") ?? null,
    og: {
      title: meta("og:title", "property"),
      description: meta("og:description", "property"),
      image: meta("og:image", "property"),
    },
    twitterCard: meta("twitter:card"),
    h1s: [...document.querySelectorAll("h1")].map((h) => clip(h.textContent, 120)),
    headings: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1])),
    images: [...document.querySelectorAll("img")].map((img) => ({
      src: clip(img.getAttribute("src") ?? "", 120),
      alt: img.getAttribute("alt"),
    })),
    jsonLd,
    firstParagraph: clip(
      [...document.querySelectorAll("p")].map((p) => p.textContent?.trim() ?? "").find((t) => t.length > 60) ?? "",
      400,
    ),
    textLength: bodyText.length,
    scriptCount: document.querySelectorAll("script[src]").length,
    hasDates: /\b(20\d{2}-\d{2}-\d{2}|(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2})\b/.test(bodyText),
  };
}

export function pageChecks(page, analysis) {
  const f = [];
  const p = analysis.url;

  if (page.status !== 200) {
    f.push(finding("page-status", "critical", p, `The page answered HTTP ${page.status || "no response"}.`));
    return f; // nothing else is meaningful on a dead page
  }

  if (!analysis.title) f.push(finding("missing-title", "critical", p, "The page has no <title>."));
  else if (analysis.title.length > 65)
    f.push(finding("long-title", "warning", p, `Title is ${analysis.title.length} chars - search results truncate around 60.`, analysis.title));
  else if (analysis.title.length < 15)
    f.push(finding("short-title", "warning", p, "Title is under 15 characters - too little for search intent.", analysis.title));

  if (!analysis.metaDescription)
    f.push(finding("missing-description", "warning", p, "No meta description - search engines will invent a snippet.", "", { firstParagraph: analysis.firstParagraph, title: analysis.title }));
  else if (analysis.metaDescription.length > 165)
    f.push(finding("long-description", "info", p, `Meta description is ${analysis.metaDescription.length} chars - it truncates around 155.`, analysis.metaDescription));

  if (!analysis.canonical)
    f.push(finding("missing-canonical", "warning", p, "No canonical link - duplicate-URL signals can split ranking.", "", { url: p }));

  if (!analysis.viewport)
    f.push(finding("missing-viewport", "warning", p, "No viewport meta - the page is not declared mobile-friendly."));

  if (!analysis.lang)
    f.push(finding("missing-lang", "info", p, "No lang attribute on <html> - declare the page language."));

  if (analysis.robotsMeta && /noindex/i.test(analysis.robotsMeta))
    f.push(finding("noindexed", "info", p, "This page carries a noindex robots meta.", analysis.robotsMeta));

  if (!analysis.og.title || !analysis.og.description || !analysis.og.image)
    f.push(finding("incomplete-og", "warning", p,
      `Open Graph incomplete (${["title", "description", "image"].filter((k) => !analysis.og[k]).join(", ")} missing) - shares render poorly.`,
      "", { title: analysis.title, description: analysis.metaDescription, url: p }));

  if (!analysis.twitterCard)
    f.push(finding("missing-twitter-card", "info", p, "No twitter:card meta - X/Twitter falls back to a bare link.", "", { url: p }));

  if (analysis.h1s.length === 0) f.push(finding("missing-h1", "warning", p, "No <h1> on the page."));
  else if (analysis.h1s.length > 1)
    f.push(finding("multiple-h1", "info", p, `${analysis.h1s.length} <h1> elements - one clear topic heading reads best.`, analysis.h1s.join(" | ")));

  let lastLevel = 0;
  for (const level of analysis.headings) {
    if (lastLevel && level > lastLevel + 1) {
      f.push(finding("heading-jump", "info", p, `Heading level jumps h${lastLevel} to h${level} - screen readers and parsers lose the outline.`));
      break;
    }
    lastLevel = level;
  }

  const noAlt = analysis.images.filter((img) => img.alt === null || img.alt === "");
  if (analysis.images.length && noAlt.length / analysis.images.length > 0.3)
    f.push(finding("missing-alt", "warning", p, `${noAlt.length} of ${analysis.images.length} images have no alt text.`, noAlt.slice(0, 3).map((i) => i.src).join(", ")));

  for (const block of analysis.jsonLd.filter((b) => !b.ok))
    f.push(finding("broken-jsonld", "critical", p, `A JSON-LD block does not parse: ${block.error}`, block.raw));

  if (analysis.jsonLd.length === 0)
    f.push(finding("no-structured-data", "warning", p, "No JSON-LD structured data - rich results and AI answers have nothing to anchor on.", "", { title: analysis.title, description: analysis.metaDescription, url: p }));

  if (analysis.textLength < 200 && analysis.scriptCount > 3)
    f.push(finding("js-dependent-content", "warning", p,
      `Only ${analysis.textLength} chars of text in the raw HTML with ${analysis.scriptCount} scripts - crawlers that skip JavaScript may see an empty page.`));

  if (analysis.textLength > 800 && !analysis.hasDates)
    f.push(finding("no-visible-dates", "info", p, "No visible dates found - dated content is easier for AI systems to cite with confidence."));

  return f;
}

export function siteChecks({ robotsTxt, robotsUrl, sitemapStatus, startUrl, pages }) {
  const f = [];
  const origin = new URL(startUrl).origin;

  if (robotsTxt === null) {
    f.push(finding("missing-robots", "warning", origin, "No robots.txt answered - crawlers get no guidance at all.", "", { origin }));
  } else {
    const blocked = AI_CRAWLERS.filter((bot) => {
      const re = new RegExp(`user-agent:\\s*${bot}[\\s\\S]{0,200}?disallow:\\s*/\\s*$`, "im");
      return re.test(robotsTxt);
    });
    if (blocked.length)
      f.push(finding("ai-crawlers-blocked", "info", robotsUrl,
        `robots.txt fully blocks ${blocked.join(", ")}. Deliberate for some sites - but these crawlers feed AI answers that could cite you.`,
        blocked.map((b) => `User-agent: ${b}`).join("; "), { blocked }));
  }

  if (sitemapStatus !== 200)
    f.push(finding("missing-sitemap", "warning", `${origin}/sitemap.xml`,
      `sitemap.xml answered ${sitemapStatus || "nothing"} - crawl discovery relies on link-following alone.`, "", { origin, pages: pages.map((p) => p.url).slice(0, 25) }));

  if (!startUrl.startsWith("https://"))
    f.push(finding("not-https", "critical", startUrl, "The site was audited over plain http - https is a baseline ranking and trust signal."));

  return f;
}
