import type { Tool } from "@/types";

// ── Audit (the hero) ─────────────────────────────────────────────────────────
import geoAudit from "./geo-audit";

// ── Crawler Access ───────────────────────────────────────────────────────────
import aiCrawlerAccessChecker from "./ai-crawler-access-checker";
import aiRobotsTxtGenerator from "./ai-robots-txt-generator";
import aiCrawlerLogAnalyzer from "./ai-crawler-log-analyzer";

// ── AI Readability ───────────────────────────────────────────────────────────
import jsRenderingChecker from "./js-rendering-checker";

// ── Content ──────────────────────────────────────────────────────────────────
import contentCitabilityScorer from "./content-citability-scorer";
import retrievalChunkPreview from "./retrieval-chunk-preview";
import answerSnippetChecker from "./answer-snippet-checker";
import entityConsistencyChecker from "./entity-consistency-checker";

// ── Generators ───────────────────────────────────────────────────────────────
import llmsTxtGenerator from "./llms-txt-generator";
import aiSchemaChecker from "./ai-schema-checker";

/**
 * GEO Studio — the free technical layer under AI visibility.
 *
 * The hero is the audit (one URL, one report); the other ten are the component
 * tools each of its findings links to. Order here drives the category landing
 * and internal linking, so it runs audit → access → readability → content →
 * generators, which is also the order the problems should be fixed in.
 */
export const GEO_TOOLS: Tool[] = [
  geoAudit,
  aiCrawlerAccessChecker,
  aiRobotsTxtGenerator,
  aiCrawlerLogAnalyzer,
  jsRenderingChecker,
  contentCitabilityScorer,
  retrievalChunkPreview,
  answerSnippetChecker,
  entityConsistencyChecker,
  llmsTxtGenerator,
  aiSchemaChecker,
];
