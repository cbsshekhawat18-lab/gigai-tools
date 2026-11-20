/**
 * Deterministic fix generation - real code the user can paste, built from
 * the page's own extracted data. No model involved: every branch here is a
 * template filled with evidence the checks collected. Findings without a
 * generator simply carry no fix (the guidance link still explains them).
 */

import { AI_CRAWLERS } from "./checks.mjs";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/** Deterministic meta-description draft: the page's own first paragraph,
 * cut at a word boundary near 155 chars. */
export function descriptionDraft(firstParagraph, title) {
  const source = (firstParagraph || title || "").replace(/\s+/g, " ").trim();
  if (!source) return null;
  if (source.length <= 155) return source;
  const cut = source.slice(0, 155);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "") + ".";
}

const GENERATORS = {
  "missing-description": (f) => {
    const draft = descriptionDraft(f.data?.firstParagraph, f.data?.title);
    if (!draft) return null;
    return {
      language: "html",
      code: `<meta name="description" content="${esc(draft)}">`,
      note: "Drafted from the page's own first paragraph - rewrite in your voice if you can.",
    };
  },

  "missing-canonical": (f) => ({
    language: "html",
    code: `<link rel="canonical" href="${esc(f.data?.url ?? f.page)}">`,
    note: "Points the page at itself; change the href if another URL is the true original.",
  }),

  "missing-viewport": () => ({
    language: "html",
    code: `<meta name="viewport" content="width=device-width, initial-scale=1">`,
  }),

  "missing-lang": () => ({
    language: "html",
    code: `<html lang="en">`,
    note: "Swap en for the page's real language code.",
  }),

  "incomplete-og": (f) => ({
    language: "html",
    code: [
      `<meta property="og:title" content="${esc(f.data?.title ?? "")}">`,
      `<meta property="og:description" content="${esc(f.data?.description ?? descriptionDraft(f.data?.firstParagraph, f.data?.title) ?? "")}">`,
      `<meta property="og:url" content="${esc(f.data?.url ?? f.page)}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:image" content="https://YOUR-DOMAIN/og-image.png">`,
    ].join("\n"),
    note: "og:image needs a real 1200x630 image URL - the rest is filled from the page.",
  }),

  "missing-twitter-card": (f) => ({
    language: "html",
    code: `<meta name="twitter:card" content="summary_large_image">`,
    note: `Pairs with the Open Graph tags on ${f.page}.`,
  }),

  "no-structured-data": (f) => ({
    language: "html",
    code: `<script type="application/ld+json">
${JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: f.data?.title ?? "Page title",
        description: f.data?.description ?? descriptionDraft(f.data?.firstParagraph, f.data?.title) ?? "Page description",
        url: f.data?.url ?? f.page,
      },
      null,
      2,
    )}
</script>`,
    note: "A minimal WebPage scaffold filled from the page. Upgrade @type (Article, Product, FAQPage...) to match the content.",
  }),

  "ai-crawlers-blocked": (f) => ({
    language: "robots.txt",
    code: (f.data?.blocked ?? AI_CRAWLERS).map((bot) => `User-agent: ${bot}\nAllow: /`).join("\n\n"),
    note: "Only if you WANT AI answer engines to read and cite the site - blocking them is a legitimate choice too.",
  }),

  "missing-robots": (f) => ({
    language: "robots.txt",
    code: `User-agent: *\nAllow: /\n\nSitemap: ${f.data?.origin ?? ""}/sitemap.xml`,
    note: "A permissive baseline - tighten per directory as needed.",
  }),

  "missing-sitemap": (f) => {
    const urls = (f.data?.pages ?? []).slice(0, 25);
    if (!urls.length) return null;
    return {
      language: "xml",
      code: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join("\n")}
</urlset>`,
      note: `Seeded with the ${urls.length} pages this audit found - generate the full list from your build.`,
    };
  },
};

/** Attach a concrete fix to every finding that has a generator. */
export function withFixes(findings) {
  return findings.map((f) => {
    const gen = GENERATORS[f.id];
    if (!gen) return f;
    const fix = gen(f);
    return fix ? { ...f, fix } : f;
  });
}
