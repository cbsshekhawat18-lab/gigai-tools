/**
 * GigAI GEO engine: the GEO Audit composer.
 *
 * One URL in, one report out. The client module fetches the page, the site's
 * robots.txt and llms.txt through the stateless proxy, then this PURE function
 * turns those three responses into a sectioned report: crawler access,
 * machine readability, citability, retrieval chunks, answer snippets, schema
 * and entity signals. Every finding names the GigAI tool that fixes it, the
 * audit is the front door; the ten component tools are the repair bay.
 */

import { AI_CRAWLERS, ROLE_LABELS } from "./crawlers";
import { parseRobotsForMatch, verdictFor, cloudflareSignals } from "./robots-match";
import { analyzeHtml, type GeoDocument } from "./html";
import { chunkDocument } from "./chunks";
import { scoreCitability, citabilityInputFromDoc } from "./citability";
import { judgeOpening, isQuestionHeading } from "./text";

export interface AuditFetches {
  url: string;
  page: { html: string; headers: Record<string, string>; status: number; finalUrl: string };
  /** null = robots.txt fetch failed entirely; a 404 body should be passed as "". */
  robotsTxt: string | null;
  robotsHeaders?: Record<string, string>;
  /** true / false / null = couldn't check. */
  llmsTxtFound: boolean | null;
  /** False when the proxy returned bodies without response headers. */
  headersAvailable?: boolean;
}

export type AuditStatus = "pass" | "warn" | "fail" | "info";

export interface AuditFinding {
  status: AuditStatus;
  label: string;
  detail?: string;
  fix?: string;
  /** Slug of the GigAI tool that digs into / fixes this finding. */
  toolSlug?: string;
  toolLabel?: string;
}

export interface AuditSection {
  id: string;
  title: string;
  /** Slug of the component tool this whole section deep-dives into. */
  toolSlug: string;
  score: number;
  findings: AuditFinding[];
}

export interface GeoAuditResult {
  url: string;
  overall: number;
  summary: string;
  sections: AuditSection[];
  /** The parsed document, exposed for the UI's readouts. */
  doc: GeoDocument;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Compose the audit from the three fetched artifacts. */
export function composeGeoAudit(f: AuditFetches): GeoAuditResult {
  const doc = analyzeHtml(f.page.html, f.page.finalUrl);
  const sections: AuditSection[] = [];

  // ── 1. Crawler access ─────────────────────────────────────────────────────
  {
    const findings: AuditFinding[] = [];
    let score = 100;
    if (f.robotsTxt === null) {
      findings.push({
        status: "warn",
        label: "Couldn't fetch robots.txt",
        detail: "The file may not exist (which allows all crawlers) or the fetch was blocked.",
        toolSlug: "ai-crawler-access-checker",
        toolLabel: "AI Crawler Access Checker",
      });
      score = 70;
    } else {
      const parsed = parseRobotsForMatch(f.robotsTxt);
      const key = AI_CRAWLERS.filter((c) => c.keyForVisibility);
      const blocked = key.filter((c) => verdictFor(parsed, c.token).status === "blocked");
      const trainingBlocked = AI_CRAWLERS.filter(
        (c) => !c.keyForVisibility && verdictFor(parsed, c.token).status === "blocked",
      );
      if (blocked.length === 0) {
        findings.push({
          status: "pass",
          label: `All ${key.length} visibility-critical AI crawlers are allowed`,
          detail: key.map((c) => c.token).join(", "),
        });
      } else {
        for (const c of blocked) {
          const v = verdictFor(parsed, c.token);
          findings.push({
            status: "fail",
            label: `${c.token} (${c.operator}) is blocked`,
            detail: `${ROLE_LABELS[c.role]}. Rule: ${v.decidedBy?.raw ?? "group disallow"} (line ${v.decidedBy?.line ?? "?"}). ${c.blockCost}`,
            fix: "If this block isn't deliberate, remove or override the rule.",
            toolSlug: "ai-robots-txt-generator",
            toolLabel: "AI Robots.txt Generator",
          });
        }
        score -= blocked.length * Math.round(60 / key.length);
      }
      if (trainingBlocked.length) {
        findings.push({
          status: "info",
          label: `${trainingBlocked.length} training crawler${trainingBlocked.length === 1 ? " is" : "s are"} blocked (${trainingBlocked.map((c) => c.token).join(", ")})`,
          detail:
            "Blocking training bots is a legitimate policy choice. It trades future model familiarity for content control. Just make sure it's a choice, not a default someone else made.",
        });
      }
      const cf = cloudflareSignals(parsed, f.robotsHeaders ?? f.page.headers);
      if (!f.headersAvailable && !cf.managedRobots) {
        // No response headers on this deployment, so absence of a Cloudflare
        // signal proves nothing. Say so rather than implying a clean result.
        findings.push({
          status: "info",
          label: "Firewall-level AI blocking couldn't be checked",
          detail:
            "This deployment's fetch proxy returns page bodies without response headers, so the Cloudflare check could not run. robots.txt itself showed no managed-section markers. Check your CDN dashboard directly: Cloudflare blocks AI crawlers at Security then Bots, before robots.txt is ever read.",
          toolSlug: "ai-crawler-access-checker",
          toolLabel: "AI Crawler Access Checker",
        });
      }
      if (cf.behindCloudflare || cf.managedRobots) {
        findings.push({
          status: cf.managedRobots ? "fail" : "warn",
          label: cf.managedRobots
            ? "Cloudflare is injecting a managed robots.txt section"
            : "Site is behind Cloudflare: robots.txt isn't the whole story",
          detail: cf.managedRobots
            ? "Cloudflare's managed robots.txt / Content-Signal rules are layered on top of your file and can disallow AI crawlers you meant to allow."
            : "Cloudflare's 'AI bots' setting blocks AI crawlers at the firewall regardless of robots.txt, and newer accounts have it ON by default. Check Security → Bots → AI bots in the Cloudflare dashboard.",
          fix: "In the Cloudflare dashboard, review Security → Bots (AI bots blocking) and the managed robots.txt toggle so the firewall matches your robots.txt policy.",
          toolSlug: "ai-crawler-access-checker",
          toolLabel: "AI Crawler Access Checker",
        });
        if (cf.managedRobots) score -= 25;
      }
    }
    sections.push({
      id: "crawler-access",
      title: "Can AI crawlers reach the site?",
      toolSlug: "ai-crawler-access-checker",
      score: clamp(score),
      findings,
    });
  }

  // ── 2. Machine readability (JS rendering) ─────────────────────────────────
  {
    const findings: AuditFinding[] = [];
    let score = 100;
    const clientFrameworks = doc.frameworks.filter((fr) => fr.clientRendered);
    if (doc.visibleWords < 100) {
      findings.push({
        status: "fail",
        label: `Only ${doc.visibleWords} words are visible in the raw HTML`,
        detail:
          "Most AI crawlers don't execute JavaScript. What isn't in the raw HTML doesn't exist for them.",
        fix: "Server-render or pre-render the main content.",
        toolSlug: "js-rendering-checker",
        toolLabel: "JS Rendering Checker",
      });
      score -= 50;
    } else {
      findings.push({
        status: "pass",
        label: `${doc.visibleWords} words of content are visible without JavaScript`,
      });
    }
    if (clientFrameworks.length) {
      const worst = clientFrameworks[0];
      findings.push({
        status: doc.visibleWords < 100 ? "fail" : "warn",
        label: `Client-rendering signals detected: ${clientFrameworks.map((fr) => fr.name).join(", ")}`,
        detail: `Evidence: ${worst?.marker ?? "framework marker"}. ${doc.dataIslandWords > 50 ? `~${doc.dataIslandWords} words of content sit inside serialized JS data rather than HTML.` : ""}`,
        toolSlug: "js-rendering-checker",
        toolLabel: "JS Rendering Checker",
      });
      if (doc.visibleWords >= 100) score -= 15;
    }
    if (doc.metaRobots && /noindex|nosnippet/i.test(doc.metaRobots)) {
      findings.push({
        status: "fail",
        label: `meta robots is "${doc.metaRobots}"`,
        detail: "noindex/nosnippet also removes you from AI answers that retrieve via search indexes.",
      });
      score -= 30;
    }
    sections.push({
      id: "rendering",
      title: "Is the content readable without JavaScript?",
      toolSlug: "js-rendering-checker",
      score: clamp(score),
      findings,
    });
  }

  // ── 3. Citability ─────────────────────────────────────────────────────────
  const cit = scoreCitability(citabilityInputFromDoc(doc));
  sections.push({
    id: "citability",
    title: "Is there anything worth citing?",
    toolSlug: "content-citability-scorer",
    score: cit.overall,
    findings: cit.subs.map((s) => ({
      status: s.score >= 70 ? ("pass" as const) : s.score >= 40 ? ("warn" as const) : ("fail" as const),
      label: `${s.label}: ${s.score}/100`,
      detail: s.counted,
      fix: s.advice || undefined,
      toolSlug: "content-citability-scorer",
      toolLabel: "Citability Scorer",
    })),
  });

  // ── 4. Retrieval chunks ───────────────────────────────────────────────────
  const chunks = chunkDocument(doc);
  sections.push({
    id: "chunks",
    title: "Do the fragments survive retrieval?",
    toolSlug: "retrieval-chunk-preview",
    score: chunks.total ? clamp(((chunks.total - chunks.failing) / chunks.total) * 100) : 50,
    findings: [
      {
        status: chunks.failing === 0 ? "pass" : chunks.failing / Math.max(1, chunks.total) > 0.4 ? "fail" : "warn",
        label: chunks.verdict,
        detail: chunks.total
          ? `The page splits into ${chunks.total} retrieval-sized chunks; a RAG system quotes them one at a time, without the rest of the page.`
          : undefined,
        fix: chunks.failing ? "Open the Chunk Preview to see each failing fragment in isolation with its exact reason." : undefined,
        toolSlug: "retrieval-chunk-preview",
        toolLabel: "Retrieval Chunk Preview",
      },
    ],
  });

  // ── 5. Answer snippets ────────────────────────────────────────────────────
  {
    const h2s = doc.headings.filter((h) => h.level === 2 && h.sectionText.trim());
    const judged = h2s.map((h) => ({ h, verdict: judgeOpening(h.firstParagraph || h.sectionText) }));
    const failing = judged.filter((j) => !j.verdict.pass);
    const questions = h2s.filter((h) => isQuestionHeading(h.text)).length;
    const findings: AuditFinding[] = [];
    if (h2s.length === 0) {
      findings.push({
        status: "warn",
        label: "No H2 sections found",
        detail: "Without section structure, retrieval systems can only match against the page as a whole.",
      });
    } else {
      findings.push({
        status: failing.length === 0 ? "pass" : failing.length > h2s.length / 2 ? "fail" : "warn",
        label: `${h2s.length - failing.length} of ${h2s.length} H2 sections open with a direct answer`,
        detail: `${questions} of ${h2s.length} H2s are phrased as questions. ${failing.length ? `Sections failing: ${failing.slice(0, 3).map((j) => `"${j.h.text}"`).join(", ")}${failing.length > 3 ? "…" : ""}.` : ""}`,
        fix: failing.length ? "Rewrite each section to answer in its first 40 words. The Answer Snippet Checker shows every failure with a rewrite target." : undefined,
        toolSlug: "answer-snippet-checker",
        toolLabel: "Answer Snippet Checker",
      });
    }
    sections.push({
      id: "snippets",
      title: "Does each section answer first?",
      toolSlug: "answer-snippet-checker",
      score: h2s.length ? clamp(((h2s.length - failing.length) / h2s.length) * 100) : 50,
      findings,
    });
  }

  // ── 6. Structured data + entity signals ───────────────────────────────────
  {
    const findings: AuditFinding[] = [];
    let score = 100;
    const wanted = ["Organization", "WebSite", "FAQPage", "SoftwareApplication", "HowTo", "Article", "BreadcrumbList", "Product"];
    const present = wanted.filter((t) => doc.jsonLdTypes.includes(t));
    if (doc.jsonLdTypes.length === 0) {
      findings.push({
        status: "warn",
        label: "No JSON-LD structured data found",
        detail: "Schema is machine-readable identity: it tells retrieval systems what this page IS without inference.",
        fix: "Add the types that match the page's actual content.",
        toolSlug: "ai-schema-checker",
        toolLabel: "AI Schema Checker",
      });
      score -= 40;
    } else {
      findings.push({
        status: "pass",
        label: `JSON-LD present: ${Array.from(new Set(doc.jsonLdTypes)).slice(0, 8).join(", ")}`,
        detail: present.length ? `Includes ${present.length} of the types AI retrieval leans on.` : undefined,
        toolSlug: "ai-schema-checker",
        toolLabel: "AI Schema Checker",
      });
    }
    if (f.llmsTxtFound === true) {
      findings.push({ status: "pass", label: "llms.txt exists", detail: "Optional, but present and costs nothing." });
    } else if (f.llmsTxtFound === false) {
      findings.push({
        status: "info",
        label: "No llms.txt",
        detail:
          "Honest note: Google has said its AI search doesn't use llms.txt, so this is optional. Some agents and smaller engines do read it.",
        toolSlug: "llms-txt-generator",
        toolLabel: "llms.txt Generator",
      });
    }
    if (!doc.title) {
      findings.push({ status: "fail", label: "Page has no <title>", detail: "The single strongest entity naming signal is missing." });
      score -= 20;
    }
    if (!doc.metaDescription) {
      findings.push({ status: "warn", label: "No meta description", detail: "Retrieval previews fall back to arbitrary page text." });
      score -= 10;
    }
    sections.push({
      id: "entity",
      title: "Is the identity machine-readable?",
      toolSlug: "ai-schema-checker",
      score: clamp(score),
      findings,
    });
  }

  const overall = clamp(sections.reduce((n, s) => n + s.score, 0) / sections.length);
  const summary =
    overall >= 85
      ? "This page is in strong shape for AI retrieval and citation."
      : overall >= 65
        ? "Solid foundation with specific, fixable gaps, work through the failing findings below."
        : overall >= 40
          ? "AI systems can reach this page but will struggle to use it. The sections below say exactly why."
          : "This page is close to invisible to AI systems today. Start with crawler access and rendering.";

  return { url: f.page.finalUrl || f.url, overall, summary, sections, doc };
}
