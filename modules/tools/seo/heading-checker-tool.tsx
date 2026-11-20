"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  PasteAnalyze,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import { headingOutline, type HeadingNode } from "@/lib/seo-tools/content";

/**
 * Heading Checker, the paste-first structural auditor.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype: the user pastes a page's HTML,
 * `headingOutline` (native DOMParser, in-browser) extracts the H1–H6 tree and
 * flags structural faults, and we shape that into a grouped {@link AnalysisReport}.
 * On top of the raw issues we add: a rendered, indented outline tree; per-level
 * counts; a derived structure score; and per-issue fix guidance. Nothing is
 * uploaded. Everything runs on the pasted markup.
 */

/* ------------------------------ outline tree ------------------------------ */

/** One row of the indented H1–H6 outline. Empty headings read as "(empty)". */
function OutlineRow({ node, skipped }: { node: HeadingNode; skipped: boolean }) {
  // Indent by level so H1 sits flush-left and deeper headings step inward.
  const indent = Math.max(0, node.level - 1) * 18;
  const empty = node.text.length === 0;
  return (
    <div
      className="flex items-baseline gap-2 border-b border-border/50 py-1.5 last:border-0"
      style={{ paddingLeft: indent }}
    >
      <span
        className={
          "shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold " +
          (node.level === 1
            ? "bg-blue-500/15 text-blue-600 dark:text-blue-300"
            : "bg-muted text-muted-foreground")
        }
      >
        H{node.level}
      </span>
      <span
        className={
          "min-w-0 break-words text-sm " +
          (empty ? "italic text-rose-500" : "text-foreground")
        }
      >
        {empty ? "(empty heading)" : node.text}
      </span>
      {node.id ? (
        <span className="ml-1 shrink-0 font-mono text-[11px] text-muted-foreground">
          #{node.id}
        </span>
      ) : null}
      {skipped ? (
        <span
          className="ml-1 inline-flex shrink-0 items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-300"
          title="This heading skips a level from the previous one"
        >
          <Icon name="CornerDownRight" size={11} />
          skip
        </span>
      ) : null}
    </div>
  );
}

/** Render the whole outline as an indented tree with per-level count badges. */
function OutlineTree({
  headings,
  counts,
}: {
  headings: HeadingNode[];
  counts: Record<string, number>;
}) {
  // Recompute the "skips a level while descending" flag per row so the tree can
  // highlight the exact offending heading (mirrors the engine's issue logic).
  let prev = 0;
  const skipFlags = headings.map((h) => {
    const skipped = prev > 0 && h.level > prev + 1;
    prev = h.level;
    return skipped;
  });

  const levels = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div className="mt-1 flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {levels.map((lvl) => {
          const n = counts[`h${lvl}`] ?? 0;
          return (
            <span
              key={lvl}
              className={
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium " +
                (n > 0
                  ? "border-border bg-muted/40 text-foreground"
                  : "border-border/50 bg-transparent text-muted-foreground/60")
              }
            >
              H{lvl}
              <span className="font-mono">{n}</span>
            </span>
          );
        })}
      </div>
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        {headings.map((h, i) => (
          <OutlineRow key={i} node={h} skipped={skipFlags[i] ?? false} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- analysis -------------------------------- */

/**
 * Classify an engine issue string into a check status and attach a fix. The
 * engine returns human-readable issues; we key severity and remediation off
 * recognisable phrases so the report stays actionable without re-parsing HTML.
 */
function classifyIssue(issue: string): { status: CheckItem["status"]; fix?: string } {
  if (issue.startsWith("No headings")) {
    return {
      status: "fail",
      fix: "Add real <h1>–<h6> elements. Text styled to look like a heading with CSS is invisible to crawlers and screen readers. Use genuine heading tags.",
    };
  }
  if (issue.startsWith("No H1")) {
    return {
      status: "fail",
      fix: "Add a single <h1> that names the page's main topic. It's the strongest on-page heading signal for both SEO and accessibility.",
    };
  }
  if (issue.startsWith("Multiple H1")) {
    return {
      status: "fail",
      fix: "Keep exactly one <h1> per page. A shared header or hero component is usually emitting a second one: demote it to an <h2> or remove it.",
    };
  }
  if (issue.startsWith("First heading is")) {
    return {
      status: "warn",
      fix: "Start the document with an <h1>. Opening on a lower level leaves the outline without a clear top-level anchor.",
    };
  }
  if (issue.includes("skips")) {
    return {
      status: "warn",
      fix: "Don't jump more than one level while descending (e.g. H2 → H4). Insert the missing intermediate level or demote the deeper heading so the outline stays navigable.",
    };
  }
  if (issue.includes("no text")) {
    return {
      status: "warn",
      fix: "Add text to the heading or remove the empty tag. An empty heading gives screen readers a meaningless stop and adds a hollow node to the outline.",
    };
  }
  return { status: "warn" };
}

/** One-line verdict shown beside the score dial. */
function verdict(score: number, hasHeadings: boolean): string {
  if (!hasHeadings) return "No headings found. This page has no outline to audit.";
  if (score >= 90) return "Excellent, a clean, well-nested heading outline.";
  if (score >= 75) return "Good: a couple of small structural tweaks remain.";
  if (score >= 50) return "Fair: the outline has issues worth fixing.";
  return "Needs work. The heading structure has real problems.";
}

/**
 * Score the outline 0–100. Start at 100 and subtract weighted penalties per
 * issue class so the number tracks how badly the structure is broken.
 */
function scoreOutline(issues: string[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.startsWith("No headings")) score -= 100;
    else if (issue.startsWith("No H1")) score -= 30;
    else if (issue.startsWith("Multiple H1")) score -= 25;
    else if (issue.startsWith("First heading is")) score -= 10;
    else if (issue.includes("skips")) score -= 12;
    else if (issue.includes("no text")) score -= 8;
    else score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

/** Turn pasted HTML into the structured report PasteAnalyze renders. */
function analyzeHtml(html: string): AnalysisReport {
  const outline = headingOutline(html);
  const hasHeadings = outline.headings.length > 0;
  const total = outline.headings.length;

  // Guard: DOMParser unavailable (non-browser). Surface honestly.
  if (outline.issues.some((i) => i.includes("DOMParser is unavailable"))) {
    return {
      score: 0,
      summary: "This tool needs a browser environment to parse HTML.",
      checks: [
        {
          id: "no-domparser",
          status: "fail",
          label: "DOMParser is unavailable",
          detail: "Heading parsing relies on the browser's native DOMParser. Open this tool in a browser tab.",
          group: "Structure",
        },
      ],
    };
  }

  const score = scoreOutline(outline.issues);

  const issueChecks: CheckItem[] = outline.issues.map((issue, i) => {
    const { status, fix } = classifyIssue(issue);
    return {
      id: `issue-${i}`,
      status,
      label: issue,
      ...(fix ? { fix } : {}),
      group: "Structure",
    };
  });

  // When the outline is clean, say so explicitly rather than showing nothing.
  const structureChecks: CheckItem[] = hasHeadings
    ? issueChecks.length === 0
      ? [
          {
            id: "clean",
            status: "pass",
            label: "No structural issues found",
            detail:
              "Exactly one H1, no skipped levels, and every heading has text. This is a well-formed outline.",
            group: "Structure",
          },
        ]
      : issueChecks
    : issueChecks;

  // Reference group: the rendered outline tree + a summary line.
  const outlineChecks: CheckItem[] = hasHeadings
    ? [
        {
          id: "outline",
          status: "info",
          label: `Heading outline (${total} heading${total === 1 ? "" : "s"})`,
          detail: <OutlineTree headings={outline.headings} counts={outline.counts} />,
          group: "Outline",
        },
      ]
    : [];

  return {
    score,
    summary: verdict(score, hasHeadings),
    checks: [...structureChecks, ...outlineChecks],
  };
}

/* ----------------------------------- tool --------------------------------- */

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
<head>
  <title>Composting at Home, A Beginner's Guide</title>
</head>
<body>
  <header>
    <h1>GreenHouse Blog</h1>
  </header>

  <main>
    <h1 id="top">Composting at Home: A Complete Beginner's Guide</h1>

    <h2 id="why">Why Compost?</h2>
    <h3>Cutting Household Waste</h3>
    <h3>Feeding Your Soil</h3>

    <h2 id="getting-started">Getting Started</h2>
    <h4>Choosing a Bin</h4>

    <h2 id="troubleshooting">Troubleshooting Smells and Pests</h2>
    <h3></h3>
    <h3>Balancing Greens and Browns</h3>
  </main>
</body>
</html>`;

export default function HeadingCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeHtml}
        fetchable
        shareSlug="heading-checker"
        shareLabel="Heading structure report"
        inputLabel="Enter a URL to fetch & audit, or paste the HTML"
        placeholder="…or paste your full page source or the section with your headings here"
        sample={SAMPLE_HTML}
        emptyTitle="Enter a URL (or paste HTML) to audit its heading structure"
        emptyHint="Type a page's URL and we'll fetch and audit its headings. Prefer local, or auditing a staging/JS-rendered page? Paste the source instead: parsed in your browser, nothing stored."
        emptyIcon="ListTree"
        accept=".html,.htm"
      />
    </section>
  );
}
