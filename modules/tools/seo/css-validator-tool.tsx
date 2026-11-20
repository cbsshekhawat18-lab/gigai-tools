"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import {
  PasteAnalyze,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import { cssBasicValidate, type ValidationIssue } from "@/lib/seo-tools/validate";

/**
 * CSS Validator, the paste-first structural linter for the "Validators" group.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype: the user pastes a stylesheet and
 * the engine's {@link cssBasicValidate} does the authoritative structural pass -
 * balanced braces, unclosed/empty blocks, unterminated comments and strings. On
 * top of that single source of truth we derive display-only stats (a lightweight
 * second read that never contradicts the engine), attach actionable fix guidance
 * per issue kind, and shape everything into a grouped, scored {@link AnalysisReport}
 * with line-numbered findings. Nothing is fetched or uploaded; a static export has
 * no server, so this is honestly paste-first and runs entirely in the browser.
 */

/* ------------------------------ display stats ----------------------------- */

interface CssStats {
  lines: number;
  bytes: number;
  /** Total `{` characters outside comments/strings. */
  openBraces: number;
  /** Total `}` characters outside comments/strings. */
  closeBraces: number;
  /** Rough top-level rule-block count (best-effort, display only). */
  rules: number;
}

/**
 * Derive at-a-glance counts for the summary strip. This is a separate,
 * comment/string-aware read kept strictly for display: the pass/fail verdict is
 * owned entirely by {@link cssBasicValidate}, so these numbers never gate results.
 */
function collectStats(css: string): CssStats {
  const bytes =
    typeof TextEncoder !== "undefined" ? new TextEncoder().encode(css).length : css.length;
  const lines = css ? css.split("\n").length : 0;

  let open = 0;
  let close = 0;
  let depth = 0;
  let rules = 0;
  let inString: string | null = null;
  let inComment = false;

  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    const next = css[i + 1];
    if (inComment) {
      if (ch === "*" && next === "/") {
        inComment = false;
        i += 1;
      }
      continue;
    }
    if (inString) {
      if (ch === "\\") i += 1;
      else if (ch === inString) inString = null;
      continue;
    }
    if (ch === "/" && next === "*") {
      inComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === "{") {
      open += 1;
      if (depth === 0) rules += 1;
      depth += 1;
    } else if (ch === "}") {
      close += 1;
      if (depth > 0) depth -= 1;
    }
  }

  return { lines, bytes, openBraces: open, closeBraces: close, rules };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* -------------------------------- summary UI ------------------------------ */

/** One label/value stat chip in the summary strip. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-muted/20 px-3 py-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

/** Verdict line + at-a-glance stats shown above the checklist. */
function Summary({
  stats,
  ok,
  errorCount,
  warnCount,
}: {
  stats: CssStats;
  ok: boolean;
  errorCount: number;
  warnCount: number;
}) {
  const line = ok
    ? warnCount
      ? `Structurally valid. No errors, ${warnCount} thing${warnCount === 1 ? "" : "s"} worth cleaning up.`
      : "Structurally valid, braces balanced and all blocks closed."
    : `Not valid: ${errorCount} structural error${errorCount === 1 ? "" : "s"} to fix.`;

  const braceValue =
    stats.openBraces === stats.closeBraces
      ? `${stats.openBraces} balanced`
      : `${stats.openBraces} { / ${stats.closeBraces} }`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground">{line}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Braces" value={braceValue} />
        <Stat label="Top rules" value={stats.rules.toLocaleString()} />
        <Stat label="Lines" value={stats.lines.toLocaleString()} />
        <Stat label="Size" value={formatBytes(stats.bytes)} />
      </div>
    </div>
  );
}

/* ----------------------------- issue → check ------------------------------ */

/** Map an engine issue severity to a PasteAnalyze check status. */
function toCheckStatus(severity: ValidationIssue["severity"]): CheckItem["status"] {
  return severity === "error" ? "fail" : severity === "warning" ? "warn" : "info";
}

/** Assign each issue to a report group based on its message. */
function groupFor(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("comment")) return "Comments & strings";
  if (m.includes("string")) return "Comments & strings";
  if (m.includes("brace") || m.includes("block") || m.includes("}") || m.includes("{"))
    return "Braces & blocks";
  return "Structure";
}

/**
 * Actionable, human fix guidance keyed off the issue message. Only attached to
 * error/warning rows. A clean stylesheet needs none.
 */
function fixFor(message: string): string | undefined {
  const m = message.toLowerCase();
  if (m.includes("unclosed block"))
    return "Add the missing closing brace(s). Work top-down: the first rule that opens with { but never closes is usually the culprit, and fixing it often resolves the whole count.";
  if (m.includes("unexpected }"))
    return "Remove the stray closing brace, or add the matching opening { and selector it was meant to close. This often appears after deleting a rule but leaving its final }.";
  if (m.includes("empty rule"))
    return "Delete the empty {} rule, or add the declarations it was meant to hold. Empty rules are harmless but add noise and confuse future editors.";
  if (m.includes("no selector"))
    return "Put a selector (or at-rule) before the opening brace, e.g. `.card {`. A { with nothing before it usually means a selector line was accidentally deleted.";
  if (m.includes("unterminated comment"))
    return "Close the comment with */. An open /* makes the browser (and this linter) treat everything after it as a comment, which is why later rules seem to vanish.";
  if (m.includes("unterminated string"))
    return "Close the string with a matching quote. An open ' or \" swallows the rest of the file as string content and desyncs brace counting.";
  return undefined;
}

/* -------------------------------- analysis -------------------------------- */

/** Turn a pasted CSS string into the structured report PasteAnalyze renders. */
function analyzeCss(css: string): AnalysisReport {
  const result = cssBasicValidate(css);
  const stats = collectStats(css);

  const checks: CheckItem[] = result.issues.map((issue, i) => {
    const status = toCheckStatus(issue.severity);
    const loc =
      issue.line !== undefined
        ? issue.column !== undefined
          ? `Line ${issue.line}, col ${issue.column}`
          : `Line ${issue.line}`
        : "Whole file";
    const fix = status === "pass" ? undefined : fixFor(issue.message);
    return {
      id: `issue-${i}`,
      status,
      label: (
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span>{issue.message}</span>
          <span className="font-mono text-[11px] text-muted-foreground">{loc}</span>
        </span>
      ),
      ...(fix ? { fix } : {}),
      group: groupFor(issue.message),
    };
  });

  const errorCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const ok = result.ok && errorCount === 0;

  // When there are no errors, add explicit "pass" rows so a clean sheet doesn't
  // render as an empty checklist; it should feel affirmatively validated.
  if (ok) {
    checks.unshift({
      id: "braces-ok",
      status: "pass",
      label: "Braces are balanced and every block is closed",
      detail: `${stats.openBraces} opening and ${stats.closeBraces} closing brace${stats.openBraces === 1 ? "" : "s"} matched.`,
      group: "Braces & blocks",
    });
    checks.unshift({
      id: "comments-ok",
      status: "pass",
      label: "Comments and strings are terminated",
      detail: "No open /* … */ comment or unclosed quote was found.",
      group: "Comments & strings",
    });
  }

  // Score: a clean sheet starts at 100 and loses a little per warning; an
  // invalid sheet is capped and drops sharply per structural error.
  const score = ok
    ? Math.max(80, 100 - warnCount * 5)
    : Math.max(0, 55 - errorCount * 18 - warnCount * 4);

  return {
    score,
    summary: (
      <Summary stats={stats} ok={ok} errorCount={errorCount} warnCount={warnCount} />
    ),
    checks,
  };
}

/* ----------------------------------- tool --------------------------------- */

const SAMPLE_CSS = `/* Design tokens */
:root {
  --brand: #6d28d9;
  --radius: 12px;
}

.button {
  background: var(--brand);
  color: #fff;
  border-radius: var(--radius);
  padding: 0.75rem 1.25rem;
/* <-- this rule is never closed: missing } here */

.card {
  border: 1px solid #e5e7eb;
  border-radius: var(--radius);
}

.spacer {}

.tooltip::before {
  content: "{";
  color: var(--brand);
}
`;

export default function CssValidatorTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeCss}
        inputLabel="Paste your CSS"
        placeholder={".button {\n  color: #fff;\n  background: #6d28d9;\n}"}
        sample={SAMPLE_CSS}
        emptyTitle="Paste CSS to structurally validate it"
        emptyHint="Paste a stylesheet, a single rule, or a whole compiled bundle, or drag a.css file onto the box. It's linted locally in your browser, so nothing is uploaded. Safe for proprietary themes and unreleased tokens. This is a fast structural checker (balanced braces, closed blocks, terminated comments and strings). Not a full W3C property-and-value validator. Load the sample to see it catch a missing brace."
        emptyIcon="Paintbrush"
        accept=".css,.txt"
      />
    </section>
  );
}
