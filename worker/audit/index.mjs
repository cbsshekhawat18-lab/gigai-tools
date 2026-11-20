/**
 * Audit orchestrator: crawl -> analyze -> check -> attach deterministic
 * fixes -> score. Rules-only (PR one); the guidance-retrieval and free-tier
 * LLM polish layers bolt on in PR two without changing this shape.
 *
 * The returned result is the ONLY thing persisted - findings, evidence
 * snippets and scores. Raw crawled HTML never leaves this function.
 */

import { crawl } from "./crawler.mjs";
import { analyzePage, pageChecks, siteChecks } from "./checks.mjs";
import { withFixes } from "./fixes.mjs";
import { computeScores } from "./score.mjs";
import { withGuidance } from "./retrieve.mjs";
import { polishFindings } from "./llm.mjs";

export async function runAudit(url, { maxPages = 25, budgetMs = 60_000, onProgress, db } = {}) {
  const crawled = await crawl(url, { maxPages, budgetMs, onProgress });
  if (!crawled.pages.length) {
    throw new Error("No crawlable HTML pages found at that URL.");
  }

  const findings = [];
  const pageSummaries = [];
  for (const page of crawled.pages) {
    const analysis = analyzePage(page);
    findings.push(...pageChecks(page, analysis));
    pageSummaries.push({
      url: page.url,
      status: page.status,
      title: analysis.title,
      truncated: page.truncated,
    });
  }
  findings.push(...siteChecks(crawled));

  let fixed = withGuidance(withFixes(findings));
  const order = { critical: 0, warning: 1, info: 2 };
  fixed.sort((a, b) => order[a.severity] - order[b.severity] || a.id.localeCompare(b.id));

  // Optional free-tier polish: identical structure without it, and any
  // quota/provider failure degrades silently back to rules-only.
  let mode = "rules-only";
  if (db) {
    try {
      ({ findings: fixed, mode } = await polishFindings(db, fixed));
    } catch (err) {
      console.error("llm polish skipped:", err.message);
    }
  }

  return {
    url: crawled.startUrl,
    audited_at: new Date().toISOString(),
    pages: pageSummaries,
    out_of_budget: crawled.outOfBudget,
    scores: computeScores(fixed, crawled.pages.length),
    summary: {
      critical: fixed.filter((f) => f.severity === "critical").length,
      warning: fixed.filter((f) => f.severity === "warning").length,
      info: fixed.filter((f) => f.severity === "info").length,
      fixable: fixed.filter((f) => f.fix).length,
    },
    findings: fixed,
    mode,
  };
}
