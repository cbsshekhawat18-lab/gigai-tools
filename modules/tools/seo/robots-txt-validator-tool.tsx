"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  PasteAnalyze,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import {
  validateRobots,
  type ParsedRobotsGroup,
  type RobotsAnalysis,
} from "@/lib/seo-tools/robots";

/**
 * Robots.txt Validator & Tester: the paste-first "Robots" flagship.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype: the user pastes a robots.txt,
 * `validateRobots` (pure, in-browser) parses it into User-agent groups and
 * lints it, and we shape that into a grouped {@link AnalysisReport}. On top of
 * the raw engine errors/warnings we add a derived 0–100 score, per-check fix
 * guidance, and a "Parsed groups" panel that shows the exact rule set each
 * crawler sees, including whether a group blocks the whole site. Nothing is
 * uploaded; everything runs on the pasted text.
 */

/* --------------------------------- scoring -------------------------------- */

/**
 * Derive a 0–100 health score from the engine analysis. `validateRobots`
 * doesn't score, so we do it here: hard errors and site-wide blocks weigh
 * heaviest, ordinary warnings less. Kept deterministic and clamped.
 */
function scoreFor(a: RobotsAnalysis): number {
  let score = 100;
  score -= a.errors.length * 40;
  for (const w of a.warnings) {
    // A whole-site block is the most damaging warning by far.
    score -= /blocks the entire site/i.test(w) ? 35 : 10;
  }
  return Math.max(0, Math.min(100, score));
}

/** One-line verdict shown next to the score dial. */
function verdict(a: RobotsAnalysis, score: number): string {
  if (a.errors.length) return "Invalid. This file has a blocking error to fix.";
  const blocksAll = a.warnings.some((w) => /blocks the entire site/i.test(w));
  if (blocksAll)
    return "Warning, a group blocks your entire site. Confirm that's intended.";
  if (score >= 90) return "Excellent, clean, well-formed robots.txt.";
  if (score >= 70) return "Good: a few advisory warnings remain.";
  if (score >= 50) return "Fair, several directives need attention.";
  return "Needs work: multiple issues could hurt crawling.";
}

/* ---------------------------- warning classifier -------------------------- */

/**
 * Classify an engine warning string into a status + actionable fix. The engine
 * emits human-readable warnings; we key off their wording to attach guidance
 * and, for the site-wide block, escalate its visual weight.
 */
function classifyWarning(w: string): { status: CheckItem["status"]; fix?: string } {
  if (/blocks the entire site/i.test(w)) {
    return {
      status: "fail",
      fix: "If this isn't a staging file, remove the `Disallow: /` under that User-agent. It blocks the whole site from that crawler. To block just part of the site, disallow specific paths instead.",
    };
  }
  if (/no Allow\/Disallow rules/i.test(w)) {
    return {
      status: "warn",
      fix: "An empty group allows everything for that crawler. If you meant to restrict it, add Disallow rules under its User-agent line. Otherwise this is fine.",
    };
  }
  if (/unknown directive/i.test(w)) {
    return {
      status: "warn",
      fix: "Crawlers ignore unrecognised directives. Fix the spelling (e.g. Disallow, not Dissallow) or remove the line. Note: Noindex is not a valid robots.txt directive.",
    };
  }
  if (/before any User-agent/i.test(w)) {
    return {
      status: "warn",
      fix: "Move this Allow/Disallow line beneath a User-agent line. Rules that appear before any User-agent are ambiguous and may be ignored.",
    };
  }
  if (/Sitemap should be an absolute URL/i.test(w)) {
    return {
      status: "warn",
      fix: "Write the sitemap as a full URL: Sitemap: https://example.com/sitemap.xml. Relative paths like /sitemap.xml are not valid here.",
    };
  }
  if (/No Sitemap directive/i.test(w)) {
    return {
      status: "warn",
      fix: "Add a line like Sitemap: https://example.com/sitemap.xml so crawlers can discover your sitemap automatically.",
    };
  }
  if (/not a number/i.test(w)) {
    return {
      status: "warn",
      fix: "Crawl-delay must be a number of seconds, e.g. Crawl-delay: 10. Non-numeric values are discarded.",
    };
  }
  if (/not a valid "directive: value" line/i.test(w)) {
    return {
      status: "warn",
      fix: "Every rule must be in `Directive: value` form. Fix the syntax or comment the line out with #.",
    };
  }
  return { status: "warn" };
}

/* ---------------------------- parsed-groups view -------------------------- */

/** A compact list of the parsed Allow/Disallow rules for one group. */
function RuleLines({ label, paths, tone }: { label: string; paths: string[]; tone: "allow" | "disallow" }) {
  if (paths.length === 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      {paths.map((p, i) => (
        <div key={`${label}-${i}`} className="flex items-baseline gap-2 font-mono text-xs">
          <span
            className={
              tone === "disallow"
                ? "shrink-0 font-medium text-rose-600 dark:text-rose-400"
                : "shrink-0 font-medium text-emerald-600 dark:text-emerald-400"
            }
          >
            {label}:
          </span>
          <span className="min-w-0 break-all text-foreground">{p === "" ? "(empty, allows all)" : p}</span>
        </div>
      ))}
    </div>
  );
}

/** One User-agent group card in the "Parsed groups" panel. */
function GroupCard({ group }: { group: ParsedRobotsGroup }) {
  const blocksAll = group.disallow.some((d) => d.trim() === "/") && !group.allow.some((a) => a.trim() === "/");
  const noRules = group.disallow.length === 0 && group.allow.length === 0;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Icon name="Bot" size={14} className="text-muted-foreground" />
        <span className="font-mono text-xs font-semibold text-foreground">
          {group.userAgents.join(", ") || "*"}
        </span>
        {blocksAll && (
          <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
            Blocks whole site
          </span>
        )}
        {noRules && !blocksAll && (
          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Allows everything
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <RuleLines label="Allow" paths={group.allow} tone="allow" />
        <RuleLines label="Disallow" paths={group.disallow} tone="disallow" />
        {group.crawlDelay !== undefined && (
          <div className="font-mono text-xs text-muted-foreground">Crawl-delay: {group.crawlDelay}</div>
        )}
        {noRules && (
          <div className="font-mono text-xs italic text-muted-foreground">no rules, full access</div>
        )}
      </div>
    </div>
  );
}

/** The full parsed breakdown: every group plus sitemaps/host pulled out. */
function ParsedGroups({ analysis }: { analysis: RobotsAnalysis }) {
  return (
    <div className="mt-1 flex flex-col gap-3">
      {analysis.groups.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          No User-agent groups were found. A robots.txt needs at least one User-agent line.
        </div>
      ) : (
        analysis.groups.map((g, i) => <GroupCard key={i} group={g} />)
      )}

      {(analysis.sitemaps.length > 0 || analysis.host) && (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          {analysis.sitemaps.map((s, i) => (
            <div key={`sm-${i}`} className="flex items-baseline gap-2 font-mono text-xs">
              <span className="shrink-0 font-medium text-sky-600 dark:text-sky-400">Sitemap:</span>
              <span className="min-w-0 break-all text-foreground">{s}</span>
            </div>
          ))}
          {analysis.host && (
            <div className="flex items-baseline gap-2 font-mono text-xs">
              <span className="shrink-0 font-medium text-muted-foreground">Host:</span>
              <span className="min-w-0 break-all text-foreground">{analysis.host}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- analysis -------------------------------- */

/** Turn a pasted robots.txt string into the structured report PasteAnalyze renders. */
function analyzeRobots(text: string): AnalysisReport {
  const a = validateRobots(text);
  const score = scoreFor(a);

  const checks: CheckItem[] = [];

  // Hard errors first.
  for (const e of a.errors) {
    checks.push({
      status: "fail",
      label: e,
      fix: "A robots.txt must contain at least one User-agent line followed by its rules. Start with `User-agent: *`.",
      group: "Issues",
    });
  }

  // Warnings, classified + given fix guidance.
  for (const w of a.warnings) {
    const { status, fix } = classifyWarning(w);
    checks.push({ status, label: w, ...(fix ? { fix } : {}), group: "Issues" });
  }

  // A clean bill of health when there's nothing to flag.
  if (a.errors.length === 0 && a.warnings.length === 0) {
    checks.push({
      status: "pass",
      label: "No issues found. This robots.txt is well-formed.",
      group: "Issues",
    });
  }

  // Structural pass/info rows so the report always has positive signal.
  const totalRules = a.groups.reduce((n, g) => n + g.allow.length + g.disallow.length, 0);
  checks.push({
    status: a.groups.length ? "pass" : "fail",
    label: `${a.groups.length} User-agent group${a.groups.length === 1 ? "" : "s"} parsed`,
    detail:
      a.groups.length > 0
        ? `${totalRules} Allow/Disallow rule${totalRules === 1 ? "" : "s"} across all groups.`
        : "No groups means no crawler-specific rules were found.",
    group: "Structure",
  });

  checks.push({
    status: a.sitemaps.length ? "pass" : "warn",
    label: a.sitemaps.length
      ? `${a.sitemaps.length} Sitemap directive${a.sitemaps.length === 1 ? "" : "s"} found`
      : "No Sitemap directive",
    detail: a.sitemaps.length
      ? a.sitemaps.join(", ")
      : "Add a Sitemap: line so crawlers can discover your sitemap.xml.",
    group: "Structure",
  });

  // The visual parsed breakdown, as an info row.
  checks.push({
    status: "info",
    label: "How crawlers read this file",
    detail: <ParsedGroups analysis={a} />,
    group: "Parsed groups",
  });

  return {
    score,
    summary: verdict(a, score),
    checks,
  };
}

/* ----------------------------------- tool --------------------------------- */

const SAMPLE_ROBOTS = `# robots.txt for example.com
User-agent: *
Disallow: /admin/
Disallow: /cart/
Disallow: /*?sessionid=
Allow: /admin/help/
Crawl-delay: 5

User-agent: Googlebot
Disallow: /internal/

User-agent: AdsBot-Google
Disallow:

Sitemap: https://example.com/sitemap.xml
`;

export default function RobotsTxtValidatorTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeRobots}
        fetchable
        shareSlug="robots-txt-validator"
        shareLabel="Robots.txt report"
        urlPlaceholder="https://example.com/robots.txt"
        inputLabel="Enter a robots.txt URL to fetch & validate, or paste it"
        placeholder={"User-agent: *\nDisallow: /admin/\nSitemap: https://example.com/sitemap.xml"}
        sample={SAMPLE_ROBOTS}
        emptyTitle="Paste a robots.txt to validate it"
        emptyHint="Open your file at https://yourdomain.com/robots.txt, copy everything and paste it here, or drop a.txt file. It's parsed into User-agent groups and linted locally in your browser. Nothing is uploaded. To test a live domain you'd need a server we deliberately don't run, so paste the file instead. Works on staging and pre-launch drafts too."
        emptyIcon="ShieldQuestion"
        accept=".txt,text/plain"
      />
    </section>
  );
}
