"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { FixWithTool } from "@/components/tool/fix-with-tool";
import { PasteAnalyze, type AnalysisReport, type CheckItem } from "@/components/tool/seo";
import type { FetchedPage } from "@/lib/seo-tools/fetch-url";
import { AI_CRAWLERS, ROLE_LABELS, type AiCrawler } from "@/lib/geo/crawlers";
import {
  parseRobotsForMatch,
  verdictFor,
  cloudflareSignals,
  type CrawlerVerdict,
} from "@/lib/geo/robots-match";

/**
 * AI Crawler Access Checker — the GEO Studio flagship.
 *
 * Paste a robots.txt (or fetch it by URL) and get a per-crawler verdict for
 * every AI bot that matters, computed with real RFC 9309 matching: user-agent
 * group selection by specificity, wildcard paths, longest-match precedence,
 * Allow beating Disallow on ties. Every verdict quotes the exact line that
 * decided it. When the file was fetched by URL, the response headers are used
 * to detect Cloudflare — whose firewall-level AI-bot blocking (on by default
 * for new zones) applies REGARDLESS of what robots.txt says.
 */

/** One bot's verdict row, with the deciding rule quoted as evidence. */
function VerdictDetail({ crawler, verdict }: { crawler: AiCrawler; verdict: CrawlerVerdict }) {
  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="text-muted-foreground">
        <span className="font-medium text-foreground">{ROLE_LABELS[crawler.role]}.</span> {crawler.does}
      </div>
      {verdict.decidedBy ? (
        <div className="font-mono text-[11px]">
          <span className="text-muted-foreground">line {verdict.decidedBy.line}:</span>{" "}
          <span className="text-foreground">{verdict.decidedBy.raw}</span>
          {verdict.agentLine && (
            <span className="text-muted-foreground"> (under {verdict.agentLine.raw})</span>
          )}
        </div>
      ) : (
        <div className="font-mono text-[11px] text-muted-foreground">
          {verdict.via === "none" || verdict.via === "wildcard"
            ? "No rule names this bot: crawling defaults to allowed."
            : `Matched ${verdict.agentLine?.raw ?? "a group"} with no blocking rule.`}
        </div>
      )}
      {verdict.status === "blocked" && (
        <div className="text-muted-foreground">
          <span className="font-medium text-destructive">What this costs:</span> {crawler.blockCost}
        </div>
      )}
    </div>
  );
}

function analyzeRobots(text: string, fetched?: FetchedPage): AnalysisReport {
  const parsed = parseRobotsForMatch(text);
  const checks: CheckItem[] = [];

  // ── Per-crawler verdicts ───────────────────────────────────────────────────
  const verdicts = AI_CRAWLERS.map((c) => ({ crawler: c, verdict: verdictFor(parsed, c.token) }));
  let keyTotal = 0;
  let keyAllowed = 0;
  for (const { crawler, verdict } of verdicts) {
    if (crawler.keyForVisibility) {
      keyTotal++;
      if (verdict.status !== "blocked") keyAllowed++;
    }
    const blocked = verdict.status === "blocked";
    const explicit = verdict.status === "allowed" && verdict.via !== "none";
    checks.push({
      id: crawler.id,
      status: blocked ? (crawler.keyForVisibility ? "fail" : "warn") : "pass",
      label: (
        <span>
          <span className="font-mono">{crawler.token}</span>
          <span className="text-muted-foreground"> · {crawler.operator} · </span>
          {blocked ? "Blocked" : explicit ? "Allowed" : "Allowed (unspecified)"}
        </span>
      ),
      detail: <VerdictDetail crawler={crawler} verdict={verdict} />,
      fix: blocked ? (
        <span>
          If this block isn&apos;t deliberate, remove the rule or add an explicit{" "}
          <span className="font-mono">Allow</span> group for this bot.
          <FixWithTool
            prompt="Generate a correct policy with"
            tools={[{ slug: "ai-robots-txt-generator", label: "AI Robots.txt Generator", icon: "Bot", why: "Per-bot toggles with a plain-language explanation of each choice" }]}
          />
        </span>
      ) : undefined,
      group: `${crawler.operator}`,
    });
  }

  // ── Cloudflare: the part robots.txt can't tell you ────────────────────────
  const cf = cloudflareSignals(parsed, fetched?.headers);
  if (fetched) {
    if (cf.behindCloudflare || cf.managedRobots) {
      checks.push({
        status: cf.managedRobots ? "fail" : "warn",
        label: cf.managedRobots
          ? "Cloudflare managed rules detected inside this robots.txt"
          : "This site is served through Cloudflare",
        detail: cf.managedRobots
          ? `The file contains ${parsed.contentSignals.length ? `Content-Signal lines (${parsed.contentSignals.map((s) => s.value).join("; ")})` : "Cloudflare managed-section markers"}. Cloudflare injects these ABOVE your own rules, so bots can be disallowed even though your source file allows them.`
          : `Response evidence: ${fetched.headers["server"] ? `server: ${fetched.headers["server"]}` : "cf-cache-status header present"}. Cloudflare's "AI bots" firewall setting blocks AI crawlers before they ever read robots.txt — and it is ON by default for newer zones. A clean robots.txt does not mean AI bots get through.`,
        fix: "In the Cloudflare dashboard open Security → Bots and check the “AI bots” / “Block AI training bots” toggle, plus the managed robots.txt feature, and set them to match the policy you actually want.",
        group: "Beyond robots.txt",
      });
    } else if (fetched.headersAvailable) {
      checks.push({
        status: "pass",
        label: "No Cloudflare interception detected",
        detail: "Response headers don't indicate Cloudflare, so the robots.txt you see is the policy bots get (unless another WAF/CDN filters by user-agent).",
        group: "Beyond robots.txt",
      });
    } else {
      // The text proxy can't expose response headers. Reporting "no Cloudflare"
      // from an empty header map would be a false negative on the single most
      // important check in this tool, so say the check didn't run.
      checks.push({
        status: "info",
        label: "Firewall-level blocking couldn't be checked on this fetch",
        detail:
          "This deployment's proxy returns the file body without response headers, so the Cloudflare check could not run. The file itself was still checked for Cloudflare's managed-section markers and Content-Signal lines, and none were found. To rule out firewall blocking, open your CDN dashboard: for Cloudflare that's Security then Bots, where the AI-bots setting blocks crawlers before robots.txt is read.",
        group: "Beyond robots.txt",
      });
    }
  } else {
    checks.push({
      status: "info",
      label: "Pasted text can't reveal firewall-level blocking",
      detail:
        "CDNs (especially Cloudflare, which now blocks AI crawlers by default on new zones) can reject AI bots at the network edge no matter what robots.txt says. Fetch your file by URL above and we'll check the response headers for Cloudflare evidence too.",
      group: "Beyond robots.txt",
    });
  }

  // ── Score: visibility-critical bots dominate ───────────────────────────────
  let score = keyTotal ? Math.round((keyAllowed / keyTotal) * 100) : 100;
  if (cf.managedRobots) score = Math.min(score, 55);
  const blockedKey = keyTotal - keyAllowed;

  const summary =
    blockedKey === 0 && !cf.managedRobots
      ? "Every visibility-critical AI crawler can read this site (per robots.txt)."
      : blockedKey === 0 && cf.managedRobots
        ? "Your own rules are fine, but Cloudflare-managed rules are overriding them."
        : `${blockedKey} of ${keyTotal} visibility-critical AI crawlers are blocked.`;

  return { score, summary, checks };
}

const SAMPLE = `# robots.txt — a typical "we blocked AI without deciding to" file
User-agent: *
Disallow: /admin/
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: PerplexityBot
Disallow: /private/

Sitemap: https://example.com/sitemap.xml
`;

/** "example.com" or any page URL → that origin's /robots.txt. */
function toRobotsUrl(url: string): string {
  try {
    const u = new URL(url);
    if (!/robots\.txt$/i.test(u.pathname)) return `${u.origin}/robots.txt`;
    return url;
  } catch {
    return url;
  }
}

export default function AiCrawlerAccessCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeRobots}
        fetchable
        transformFetchUrl={toRobotsUrl}
        shareSlug="ai-crawler-access-checker"
        shareLabel="AI crawler access report"
        urlPlaceholder="https://example.com/robots.txt (or just the domain)"
        inputLabel="Enter your robots.txt URL to fetch it, or paste the file"
        placeholder={"User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /"}
        sample={SAMPLE}
        emptyTitle="Which AI crawlers can read your site?"
        emptyHint={
          <span>
            Enter your robots.txt URL (we fetch it statelessly and also inspect the response headers for
            Cloudflare evidence), or paste the file. Each of the {AI_CRAWLERS.length} AI crawler tokens gets a
            verdict computed with real RFC&nbsp;9309 matching (group specificity, wildcards, longest-match, Allow
            beating Disallow on ties) and quotes the exact line that decided it. Nothing you paste leaves your
            browser. <Icon name="Bot" size={12} className="inline align-[-2px]" />
          </span>
        }
        emptyIcon="Bot"
        accept=".txt,text/plain"
      />
    </section>
  );
}
