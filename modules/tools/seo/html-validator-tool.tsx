"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  PasteAnalyze,
  gradeForScore,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import { htmlWellFormed, type ValidationIssue } from "@/lib/seo-tools/validate";
import { analyzeMetaFromHtml } from "@/lib/seo-tools/meta";
import { headingOutline, type HeadingNode } from "@/lib/seo-tools/content";

/**
 * HTML Validator, the paste-first checker for the "Validators" group.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype. The user pastes HTML (a full
 * document or a fragment) and we validate it entirely in the browser by
 * composing three engine passes:
 *  1. `htmlWellFormed`, structural + a couple of SEO/a11y issues (native DOMParser).
 *  2. `analyzeMetaFromHtml`, the on-page SEO essentials (title/description/lang…).
 *  3. `headingOutline`, the h1–h6 tree + structural heading issues.
 * We shape those into a grouped, scored {@link AnalysisReport} with a concrete
 * fix on every warning, a summary strip, and a rendered outline. Nothing is
 * fetched or uploaded; a static export has no server to crawl, so this is
 * honestly paste-first.
 */

/* ------------------------------ document stats ---------------------------- */

interface DocStats {
  isFragment: boolean;
  bytes: number;
  imgTotal: number;
  imgMissingAlt: number;
  headingTotal: number;
  h1Count: number;
}

function collectStats(html: string, headings: HeadingNode[], h1Count: number): DocStats {
  const trimmed = html.trim();
  const bytes =
    typeof TextEncoder !== "undefined" ? new TextEncoder().encode(trimmed).length : trimmed.length;
  const isFragment = !/<html[\s>]/i.test(trimmed);

  let imgTotal = 0;
  let imgMissingAlt = 0;
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(trimmed, "text/html");
    doc.querySelectorAll("img").forEach((img) => {
      imgTotal += 1;
      if (img.getAttribute("alt") === null) imgMissingAlt += 1;
    });
  }

  return {
    isFragment,
    bytes,
    imgTotal,
    imgMissingAlt,
    headingTotal: headings.length,
    h1Count,
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* --------------------------- fix copy by keyword -------------------------- */

/**
 * Actionable fix copy for the well-formedness / SEO issues emitted by
 * `htmlWellFormed`, keyed by a stable substring of the engine message. Only
 * attached to warn/fail rows.
 */
const WELLFORMED_FIXES: ReadonlyArray<{ match: string; fix: string }> = [
  {
    match: "Not well-formed as XML",
    fix: "Look for unclosed or mis-nested tags. Note that valid HTML5 void elements (<br>, <img>, <meta>) and unescaped ampersands trip strict XML parsing but render fine. This is advisory, not a hard failure.",
  },
  {
    match: "Missing <title>",
    fix: "Add a single, unique <title> in the <head>, front-load your primary keyword and keep it to about 50–60 characters.",
  },
  {
    match: "More than one <title>",
    fix: "Keep exactly one <title>. A layout and a page component both emitting one is the usual cause, remove the duplicate.",
  },
  {
    match: "<title> is empty",
    fix: "Put descriptive text inside the <title> element. An empty title gives search engines nothing to show in results.",
  },
  {
    match: "No meta description",
    fix: 'Add <meta name="description" content="…"> of about 150–160 characters that summarises the page and earns the click.',
  },
  {
    match: "no lang attribute",
    fix: 'Add a language to the root element: <html lang="en">. It improves accessibility, translation and international SEO.',
  },
  {
    match: "missing an alt attribute",
    fix: 'Add an alt attribute to every meaningful <img> (use alt="" for purely decorative images) for accessibility and image SEO.',
  },
  {
    match: 'empty or "#" href',
    fix: 'Point each link at a real destination, or use a <button> for JS-only actions. Empty and "#" hrefs confuse crawlers and keyboard users.',
  },
];

function fixForWellFormed(message: string): string | undefined {
  return WELLFORMED_FIXES.find((f) => message.includes(f.match))?.fix;
}

function severityToStatus(sev: ValidationIssue["severity"]): CheckItem["status"] {
  return sev === "error" ? "fail" : sev === "warning" ? "warn" : "info";
}

/* ------------------------------ outline render ---------------------------- */

/** Render the h1–h6 heading tree with indentation and level badges. */
function OutlineTree({ headings }: { headings: HeadingNode[] }) {
  if (!headings.length) return null;
  return (
    <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon name="ListTree" size={13} />
        Heading outline
      </div>
      <ul className="flex flex-col gap-1">
        {headings.map((h, i) => (
          <li
            key={i}
            className="flex min-w-0 items-baseline gap-2 text-sm"
            style={{ paddingLeft: `${(h.level - 1) * 14}px` }}
          >
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
              H{h.level}
            </span>
            <span
              className={
                h.text
                  ? "min-w-0 break-words text-foreground"
                  : "italic text-muted-foreground"
              }
            >
              {h.text || "(empty heading)"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------- summary UI ------------------------------ */

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

function verdict(score: number, fails: number, warns: number): string {
  if (score >= 90) return "Excellent. The markup is essentially ship-ready.";
  if (score >= 75) return `Good: ${warns} thing${warns === 1 ? "" : "s"} to tidy up.`;
  if (score >= 60) return fails ? "Fair, a couple of real issues to fix." : "Fair: clear the warnings.";
  if (score >= 40) return "Needs work, several structural or SEO issues.";
  return "Poor, the essential structure and tags need real fixing.";
}

function Summary({
  stats,
  score,
  fails,
  warns,
}: {
  stats: DocStats;
  score: number;
  fails: number;
  warns: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground">{verdict(score, fails, warns)}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Input" value={stats.isFragment ? "Fragment" : "Document"} />
        <Stat label="Headings" value={`${stats.headingTotal} (${stats.h1Count} H1)`} />
        <Stat
          label="Images w/ alt"
          value={
            stats.imgTotal ? `${stats.imgTotal - stats.imgMissingAlt}/${stats.imgTotal}` : "0/0"
          }
        />
        <Stat label="Size" value={formatBytes(stats.bytes)} />
      </div>
    </div>
  );
}

/* -------------------------------- analysis -------------------------------- */

/** Turn pasted HTML into the structured report PasteAnalyze renders. */
function analyzeHtml(html: string): AnalysisReport {
  const trimmed = html.trim();

  // Engine pass 1: well-formedness + a few structural SEO/a11y issues.
  const wf = htmlWellFormed(trimmed);

  // Hard-empty gate: htmlWellFormed reports an error for empty input.
  const emptyError = wf.issues.find(
    (i) => i.severity === "error" && i.message === "Input is empty.",
  );
  if (emptyError) {
    return {
      score: 0,
      grade: "F",
      summary: "Nothing to validate yet: paste some HTML.",
      checks: [
        { id: "empty", status: "fail", label: "Input is empty", group: "Structure" },
      ],
    };
  }

  // Engine pass 3: heading outline (pass 2 is analyzeMetaFromHtml below).
  const outline = headingOutline(trimmed);
  const h1Count = outline.counts["h1"] ?? 0;
  const stats = collectStats(trimmed, outline.headings, h1Count);

  const checks: CheckItem[] = [];

  /* --- Structure group: well-formedness --- */
  const wfStructuralMessages = new Set<string>();
  wf.issues.forEach((issue) => {
    // Route the well-formedness "structure" issue; the rest (title/desc/lang/alt/links)
    // are handled by dedicated groups below to avoid duplication.
    if (issue.message.includes("Not well-formed as XML")) {
      wfStructuralMessages.add(issue.message);
      checks.push({
        id: "wellformed",
        status: severityToStatus(issue.severity),
        label: "Not well-formed as XML",
        detail: issue.message.replace(/^Not well-formed as XML[^:]*:\s*/, "") || undefined,
        ...(fixForWellFormed(issue.message) ? { fix: fixForWellFormed(issue.message) } : {}),
        group: "Structure",
      });
    }
  });
  if (!wfStructuralMessages.size) {
    checks.push({
      id: "wellformed",
      status: "pass",
      label: stats.isFragment
        ? "Fragment parsed cleanly"
        : "Well-formed. No unclosed-tag warnings",
      detail: stats.isFragment
        ? "Strict well-formedness is checked on full documents. This fragment parsed without structural errors."
        : "A strict XML re-parse found no unclosed or mis-nested tags.",
      group: "Structure",
    });
  }

  /* --- SEO group: title / description / lang, from the meta engine --- */
  const meta = analyzeMetaFromHtml(trimmed);
  const SEO_IDS = new Set(["title", "description", "lang", "canonical", "charset"]);
  meta.items
    .filter((it) => SEO_IDS.has(it.id))
    .forEach((it) => {
      const status: CheckItem["status"] =
        it.status === "good" ? "pass" : it.status === "warn" ? "warn" : "fail";
      const fix = status === "pass" ? undefined : fixForWellFormed(it.message) ?? metaFix(it.id);
      checks.push({
        id: `seo-${it.id}`,
        status,
        label: it.label,
        detail: it.message,
        ...(fix ? { fix } : {}),
        group: "On-page SEO",
      });
    });

  /* --- Accessibility group: image alt + empty links (from wf issues) --- */
  const altIssue = wf.issues.find((i) => i.message.includes("missing an alt attribute"));
  if (altIssue) {
    checks.push({
      id: "img-alt",
      status: "warn",
      label: altIssue.message,
      detail: stats.imgTotal
        ? `${stats.imgTotal - stats.imgMissingAlt} of ${stats.imgTotal} images have an alt attribute.`
        : undefined,
      fix: fixForWellFormed(altIssue.message),
      group: "Accessibility",
    });
  } else if (stats.imgTotal > 0) {
    checks.push({
      id: "img-alt",
      status: "pass",
      label: `All ${stats.imgTotal} image${stats.imgTotal === 1 ? "" : "s"} have an alt attribute`,
      group: "Accessibility",
    });
  }

  const linkIssue = wf.issues.find((i) => i.message.includes('empty or "#" href'));
  if (linkIssue) {
    checks.push({
      id: "empty-links",
      status: "warn",
      label: linkIssue.message,
      fix: fixForWellFormed(linkIssue.message),
      group: "Accessibility",
    });
  }

  /* --- Outline group: heading structure --- */
  if (outline.headings.length === 0) {
    checks.push({
      id: "headings",
      status: "warn",
      label: "No headings found",
      detail: "A page with no h1–h6 headings has no document outline for users or search engines.",
      fix: "Add a single H1 for the page's main topic, then structure sections with H2s and H3s.",
      group: "Heading outline",
    });
  } else {
    // Each engine-flagged heading issue becomes its own warn row.
    outline.issues.forEach((msg, i) => {
      checks.push({
        id: `heading-issue-${i}`,
        status: "warn",
        label: msg,
        fix: headingFix(msg),
        group: "Heading outline",
      });
    });
    if (!outline.issues.length) {
      checks.push({
        id: "headings",
        status: "pass",
        label: "Clean heading hierarchy",
        detail: `A single H1 with no skipped levels across ${outline.headings.length} heading${outline.headings.length === 1 ? "" : "s"}.`,
        group: "Heading outline",
      });
    }
    // Always show the rendered outline as a reference row.
    checks.push({
      id: "outline",
      status: "info",
      label: "Document outline",
      detail: <OutlineTree headings={outline.headings} />,
      group: "Heading outline",
    });
  }

  /* --- Scoring --- */
  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const score =
    fails > 0
      ? Math.max(0, 55 - fails * 15 - warns * 5)
      : Math.max(60, 100 - warns * 8);

  return {
    score,
    grade: gradeForScore(score),
    summary: <Summary stats={stats} score={score} fails={fails} warns={warns} />,
    checks,
  };
}

/** Fix copy for meta-engine SEO ids not covered by the well-formedness matcher. */
function metaFix(id: string): string | undefined {
  switch (id) {
    case "canonical":
      return 'Add <link rel="canonical" href="…"> pointing at this page\'s authoritative URL to consolidate ranking signals.';
    case "charset":
      return 'Declare the encoding near the top of <head>: <meta charset="UTF-8">.';
    default:
      return undefined;
  }
}

/** Fix copy for a heading-outline issue message. */
function headingFix(message: string): string | undefined {
  if (message.includes("No H1")) return "Add exactly one H1 that names the page's main topic.";
  if (message.includes("Multiple H1s"))
    return "Demote the extra H1s to H2 so the page has a single top-level heading.";
  if (message.includes("skips"))
    return "Insert the missing intermediate level (or promote the deeper heading) so levels step down one at a time.";
  if (message.includes("no text content"))
    return "Remove the empty heading or give it meaningful text: empty headings confuse screen readers.";
  if (message.includes("First heading is"))
    return "Start the document with an H1. Deeper levels should follow it.";
  return undefined;
}

/* ----------------------------------- tool --------------------------------- */

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bright Coffee Roasters, Small-Batch Beans, Shipped Fresh</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>Bright Coffee Roasters</h1>
  <h3>Our Story</h3>
  <p>We roast in small batches every morning.</p>
  <h2>Shop the Roasts</h2>
  <img src="/beans.jpg">
  <img src="/roastery.jpg" alt="Our roastery at sunrise">
  <h4></h4>
  <a href="#">Learn more</a>
</body>
</html>`;

export default function HtmlValidatorTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeHtml}
        inputLabel="Paste your HTML"
        placeholder={"<!doctype html>\n<html lang=\"en\">\n  <head><title>Example</title></head>\n  <body><h1>Hello</h1></body>\n</html>"}
        sample={SAMPLE_HTML}
        emptyTitle="Paste HTML to validate its structure and SEO"
        emptyHint="View a page's source (Ctrl+U / Cmd+Option+U), copy it, and paste it here: a full document or just a fragment. Everything is parsed locally in your browser with native DOMParser, so nothing is uploaded. To validate a live URL you'd need a server we deliberately don't run, so paste the markup instead: staging, login-gated and unreleased pages all work. This is a fast structural + SEO linter, not a full W3C conformance checker."
        emptyIcon="CodeXml"
        accept=".html,.htm"
      />
    </section>
  );
}
