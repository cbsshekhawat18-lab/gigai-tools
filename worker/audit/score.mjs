/**
 * Transparent scoring. Two 0-100 scores computed as 100 minus weighted
 * penalties, averaged per page so a 25-page site is not punished 25x for a
 * sitewide template issue. The exact weight table ships in the result so
 * the UI can show users precisely why they lost points.
 */

/** finding id -> { seo, ai } penalty weights (per page where it appears). */
export const WEIGHTS = {
  "page-status": { seo: 25, ai: 25 },
  "missing-title": { seo: 15, ai: 8 },
  "long-title": { seo: 3, ai: 0 },
  "short-title": { seo: 3, ai: 0 },
  "missing-description": { seo: 8, ai: 4 },
  "long-description": { seo: 2, ai: 0 },
  "missing-canonical": { seo: 6, ai: 2 },
  "missing-viewport": { seo: 6, ai: 0 },
  "missing-lang": { seo: 2, ai: 2 },
  "noindexed": { seo: 0, ai: 0 },
  "incomplete-og": { seo: 5, ai: 2 },
  "missing-twitter-card": { seo: 2, ai: 0 },
  "missing-h1": { seo: 6, ai: 5 },
  "multiple-h1": { seo: 2, ai: 1 },
  "heading-jump": { seo: 2, ai: 2 },
  "missing-alt": { seo: 4, ai: 2 },
  "broken-jsonld": { seo: 10, ai: 12 },
  "no-structured-data": { seo: 6, ai: 12 },
  "js-dependent-content": { seo: 10, ai: 18 },
  "no-visible-dates": { seo: 0, ai: 4 },
  // site-level (counted once, not per page)
  "missing-robots": { seo: 5, ai: 6 },
  "ai-crawlers-blocked": { seo: 0, ai: 15 },
  "missing-sitemap": { seo: 6, ai: 4 },
  "not-https": { seo: 20, ai: 10 },
};

const SITE_LEVEL = new Set(["missing-robots", "ai-crawlers-blocked", "missing-sitemap", "not-https"]);

export function computeScores(findings, pageCount) {
  const pages = Math.max(1, pageCount);
  let seoPenalty = 0;
  let aiPenalty = 0;
  for (const f of findings) {
    const w = WEIGHTS[f.id];
    if (!w) continue;
    const divisor = SITE_LEVEL.has(f.id) ? 1 : pages;
    seoPenalty += w.seo / divisor;
    aiPenalty += w.ai / divisor;
  }
  return {
    seo: Math.max(0, Math.round(100 - seoPenalty)),
    aiVisibility: Math.max(0, Math.round(100 - aiPenalty)),
    formula: "100 minus weighted penalties; page findings divided by pages audited, site findings counted once",
    weights: WEIGHTS,
  };
}
