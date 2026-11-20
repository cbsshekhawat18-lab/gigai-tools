"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import {
  PasteAnalyze,
  gradeForScore,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import {
  extractMetaFromHtml,
  titleDescriptionScore,
  type ExtractedMeta,
} from "@/lib/seo-tools/meta";

/**
 * Meta Tag Validator: the "Validators" group's rulebook-driven checker.
 *
 * Unlike the Meta Tag Analyzer (which *audits* a page and reconstructs its live
 * preview), the Validator holds pasted HTML up against an explicit rulebook and
 * returns a strict, letter-graded pass / warn / fail verdict per rule, grouped
 * into **Foundations**, **Length**, **Social** and **Conflicts**. Each rule
 * carries a plain-English reason and the exact markup to fix it. The whole page
 * earns a weighted A–F grade.
 *
 * The rulebook lives here (not in the engine): the engine gives us a faithful,
 * native-DOMParser extraction of the tags, and this module decides what
 * conformance means. Nothing is uploaded: everything runs on the pasted markup.
 */

/* ------------------------------- rule engine ------------------------------ */

type RuleStatus = "pass" | "warn" | "fail";

interface Rule {
  id: string;
  group: "Foundations" | "Length" | "Social" | "Conflicts";
  label: string;
  status: RuleStatus;
  detail: string;
  /** Copy-paste markup or instruction shown only on warn/fail. */
  fix?: string;
  /**
   * How heavily this rule pulls the grade. Foundations rules weigh more than a
   * social nicety. Default 1.
   */
  weight?: number;
}

/**
 * DOM-level facts the rulebook needs that a single `ExtractedMeta` can't carry
 * - element *counts* for duplicate detection. Extracted with the same native
 * parser, guarded for SSR.
 */
interface DomFacts {
  titleCount: number;
  descriptionCount: number;
  canonicalCount: number;
  charsetCount: number;
  parsed: boolean;
}

function readDomFacts(html: string): DomFacts {
  if (typeof DOMParser === "undefined") {
    return {
      titleCount: 0,
      descriptionCount: 0,
      canonicalCount: 0,
      charsetCount: 0,
      parsed: false,
    };
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  return {
    titleCount: doc.querySelectorAll("title").length,
    descriptionCount: doc.querySelectorAll('meta[name="description" i]').length,
    canonicalCount: doc.querySelectorAll('link[rel="canonical" i]').length,
    charsetCount:
      doc.querySelectorAll("meta[charset]").length +
      doc.querySelectorAll('meta[http-equiv="content-type" i]').length,
    parsed: true,
  };
}

/** A robots directive that keeps the page out of the index. */
function isNoindex(robots: string | undefined): boolean {
  return /(^|[\s,])noindex([\s,]|$)/i.test(robots ?? "");
}

/** A viewport that is actually responsive (not a fixed width). */
function isResponsiveViewport(viewport: string | undefined): boolean {
  if (!viewport) return false;
  return /width\s*=\s*device-width/i.test(viewport);
}

/**
 * The rulebook. Produces one {@link Rule} per best-practice check, in the order
 * the report should read (grouped downstream by `group`).
 */
function buildRules(meta: ExtractedMeta, dom: DomFacts): Rule[] {
  const rules: Rule[] = [];
  const add = (r: Rule) => rules.push(r);

  const title = meta.title?.trim() ?? "";
  const description = meta.description?.trim() ?? "";
  const lengths = titleDescriptionScore(title, description);

  /* ---------------------------- Foundations ------------------------------ */

  add({
    id: "f-title",
    group: "Foundations",
    label: "Title tag present",
    weight: 2,
    ...(title
      ? { status: "pass", detail: `Found a <title>: “${title}”.` }
      : {
          status: "fail",
          detail: "No <title> tag was found in the page's <head>.",
          fix: "<title>Your page title, 50–60 characters</title>",
        }),
  });

  add({
    id: "f-description",
    group: "Foundations",
    label: "Meta description present",
    weight: 2,
    ...(description
      ? { status: "pass", detail: "A meta description is set." }
      : {
          status: "fail",
          detail: "No <meta name=\"description\"> was found.",
          fix: '<meta name="description" content="A ~150–160 character summary that earns the click.">',
        }),
  });

  add({
    id: "f-charset",
    group: "Foundations",
    label: "Character encoding declared",
    ...(meta.charset || dom.charsetCount > 0
      ? {
          status: "pass",
          detail: meta.charset ? `Charset declared: ${meta.charset}.` : "A content-type charset is declared.",
        }
      : {
          status: "fail",
          detail: "No character encoding is declared: browsers may guess it wrong.",
          fix: '<meta charset="UTF-8">',
        }),
  });

  add({
    id: "f-viewport",
    group: "Foundations",
    label: "Responsive viewport",
    weight: 2,
    ...(isResponsiveViewport(meta.viewport)
      ? { status: "pass", detail: `Responsive viewport set: ${meta.viewport}.` }
      : meta.viewport
        ? {
            status: "warn",
            detail: `A viewport is set but isn't width=device-width: ${meta.viewport}.`,
            fix: '<meta name="viewport" content="width=device-width, initial-scale=1">',
          }
        : {
            status: "fail",
            detail: "No viewport meta: the page won't be mobile-friendly.",
            fix: '<meta name="viewport" content="width=device-width, initial-scale=1">',
          }),
  });

  add({
    id: "f-canonical",
    group: "Foundations",
    label: "Canonical URL set",
    ...(meta.canonical
      ? { status: "pass", detail: `Canonical points to ${meta.canonical}.` }
      : {
          status: "warn",
          detail: "No <link rel=\"canonical\">: duplicate URLs may split ranking signals.",
          fix: '<link rel="canonical" href="https://example.com/this-page">',
        }),
  });

  add({
    id: "f-robots",
    group: "Foundations",
    label: "Indexable (robots directive)",
    weight: 2,
    ...(isNoindex(meta.robots)
      ? {
          status: "fail",
          detail: `The robots meta contains noindex (${meta.robots}). This page is blocked from search.`,
          fix: "Remove noindex if this page should rank, e.g. <meta name=\"robots\" content=\"index, follow\">.",
        }
      : {
          status: "pass",
          detail: meta.robots
            ? `robots: ${meta.robots}. The page is indexable.`
            : "No robots meta, defaults to index, follow.",
        }),
  });

  /* ------------------------------- Length -------------------------------- */

  const t = lengths.title;
  add({
    id: "l-title",
    group: "Length",
    label: "Title length",
    weight: 1.5,
    status: title ? (t.status === "good" ? "pass" : t.status === "warn" ? "warn" : "fail") : "fail",
    detail: title
      ? `${t.length} characters, ${t.message}`
      : "No title to measure: add one first.",
    ...(title && t.status !== "good"
      ? {
          fix:
            t.length < 50
              ? "Extend the title toward 50–60 characters. Front-load the primary keyword and brand."
              : "Trim the title toward 50–60 characters so Google doesn't truncate it.",
        }
      : {}),
  });

  const d = lengths.description;
  add({
    id: "l-description",
    group: "Length",
    label: "Description length",
    weight: 1.5,
    status: description ? (d.status === "good" ? "pass" : d.status === "warn" ? "warn" : "fail") : "fail",
    detail: description
      ? `${d.length} characters, ${d.message}`
      : "No description to measure. Add one first.",
    ...(description && d.status !== "good"
      ? {
          fix:
            d.length < 150
              ? "Expand the description toward 150–160 characters and make it action-oriented."
              : "Shorten the description toward 150–160 characters so it isn't cut off in the snippet.",
        }
      : {}),
  });

  /* ------------------------------- Social -------------------------------- */

  const ogTitle = meta.og["title"];
  const ogImage = meta.og["image"];
  const ogDesc = meta.og["description"];
  const ogUrl = meta.og["url"];
  const hasAnyOg = Object.keys(meta.og).length > 0;

  add({
    id: "s-og-core",
    group: "Social",
    label: "Open Graph core (og:title + og:image)",
    weight: 1.5,
    ...(ogTitle && ogImage
      ? { status: "pass", detail: "og:title and og:image are both present, links render a rich card." }
      : hasAnyOg
        ? {
            status: "warn",
            detail: `Partial Open Graph, missing ${!ogTitle ? "og:title" : ""}${!ogTitle && !ogImage ? " and " : ""}${!ogImage ? "og:image" : ""}.`,
            fix: '<meta property="og:title" content="…">\n<meta property="og:image" content="https://example.com/og-1200x630.png">',
          }
        : {
            status: "warn",
            detail: "No Open Graph tags. Shared links will show a plain box, not a card.",
            fix: '<meta property="og:title" content="…">\n<meta property="og:description" content="…">\n<meta property="og:image" content="https://example.com/og-1200x630.png">',
          }),
  });

  add({
    id: "s-og-extra",
    group: "Social",
    label: "Open Graph description & URL",
    weight: 0.5,
    ...(ogDesc && ogUrl
      ? { status: "pass", detail: "og:description and og:url are set." }
      : {
          status: "warn",
          detail: `For a complete card, add ${!ogDesc ? "og:description" : ""}${!ogDesc && !ogUrl ? " and " : ""}${!ogUrl ? "og:url" : ""}.`,
          fix: [
            !ogDesc ? '<meta property="og:description" content="…">' : null,
            !ogUrl ? '<meta property="og:url" content="https://example.com/this-page">' : null,
          ]
            .filter(Boolean)
            .join("\n"),
        }),
  });

  const twCard = meta.twitter["card"];
  add({
    id: "s-twitter",
    group: "Social",
    label: "Twitter / X card",
    weight: 1,
    ...(twCard
      ? { status: "pass", detail: `twitter:card = ${twCard}.` }
      : {
          status: "warn",
          detail: "No twitter:card: X will fall back to Open Graph, but you lose layout control.",
          fix: '<meta name="twitter:card" content="summary_large_image">',
        }),
  });

  /* ------------------------------ Conflicts ------------------------------ */

  if (dom.parsed && dom.titleCount > 1) {
    add({
      id: "c-dup-title",
      group: "Conflicts",
      label: "Single <title>",
      weight: 1.5,
      status: "fail",
      detail: `${dom.titleCount} <title> tags found, search engines may pick the wrong one.`,
      fix: "Keep exactly one <title>. A layout and a page component both emitting one is the usual cause.",
    });
  } else if (dom.parsed && dom.titleCount === 1) {
    add({
      id: "c-dup-title",
      group: "Conflicts",
      label: "Single <title>",
      status: "pass",
      detail: "Exactly one <title> tag. No duplication.",
    });
  }

  if (dom.parsed && dom.descriptionCount > 1) {
    add({
      id: "c-dup-desc",
      group: "Conflicts",
      label: "Single meta description",
      weight: 1.5,
      status: "fail",
      detail: `${dom.descriptionCount} meta descriptions found: emit only one.`,
      fix: "Remove the duplicate <meta name=\"description\"> your template or CMS is adding.",
    });
  } else if (dom.parsed && dom.descriptionCount === 1) {
    add({
      id: "c-dup-desc",
      group: "Conflicts",
      label: "Single meta description",
      status: "pass",
      detail: "Exactly one meta description. No duplication.",
    });
  }

  if (dom.parsed && dom.canonicalCount > 1) {
    add({
      id: "c-dup-canonical",
      group: "Conflicts",
      label: "Single canonical",
      status: "warn",
      detail: `${dom.canonicalCount} canonical links found, search engines may ignore all of them.`,
      fix: "Keep exactly one <link rel=\"canonical\"> per page.",
    });
  }

  if (meta.canonical && isNoindex(meta.robots)) {
    add({
      id: "c-canonical-noindex",
      group: "Conflicts",
      label: "Canonical vs. noindex",
      weight: 1.5,
      status: "fail",
      detail:
        "A canonical says “index this URL” while robots says noindex. A direct contradiction that keeps the page out of search.",
      fix: "Decide which you mean: drop the noindex to let the page rank, or remove the canonical if it truly shouldn't be indexed.",
    });
  }

  return rules;
}

/* --------------------------------- scoring -------------------------------- */

const STATUS_WEIGHT: Record<RuleStatus, number> = { pass: 1, warn: 0.5, fail: 0 };

/** Weighted 0–100 conformance score across all rules. */
function scoreRules(rules: Rule[]): number {
  if (rules.length === 0) return 0;
  let earned = 0;
  let total = 0;
  for (const r of rules) {
    const w = r.weight ?? 1;
    total += w;
    earned += w * STATUS_WEIGHT[r.status];
  }
  return total === 0 ? 0 : Math.round((earned / total) * 100);
}

/** One-line verdict tuned to the number of hard failures. */
function verdict(score: number, fails: number): string {
  if (fails === 0 && score >= 90) return "Conformant, the head meets best practices and is ship-ready.";
  if (fails === 0) return "Nearly there. No failures, just a few warnings to polish.";
  if (fails === 1) return "One rule is failing: fix it and re-validate.";
  if (score >= 50) return `${fails} rules are failing: the head needs work before launch.`;
  return `${fails} rules are failing: several essential meta tags are missing or misconfigured.`;
}

/* -------------------------- extracted-tags panel -------------------------- */

/** One label/value row in the extracted-tags reference; omitted when empty. */
function TagRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-1.5 last:border-0 sm:flex-row sm:gap-3">
      <span className="w-32 shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 break-words font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}

/** A compact reference table of the raw tag values pulled from the pasted HTML. */
function ExtractedTags({ meta }: { meta: ExtractedMeta }) {
  const og = meta.og;
  const tw = meta.twitter;
  const anything =
    meta.title ||
    meta.description ||
    meta.canonical ||
    meta.robots ||
    meta.viewport ||
    meta.charset ||
    Object.keys(og).length ||
    Object.keys(tw).length;
  if (!anything) {
    return (
      <p className="mt-1 rounded-lg border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
        No meta tags were found in the pasted markup. Make sure you copied the page&apos;s{" "}
        <code className="font-mono">&lt;head&gt;</code>.
      </p>
    );
  }
  return (
    <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3">
      <TagRow label="Title" value={meta.title} />
      <TagRow label="Description" value={meta.description} />
      <TagRow label="Canonical" value={meta.canonical} />
      <TagRow label="Robots" value={meta.robots} />
      <TagRow label="Viewport" value={meta.viewport} />
      <TagRow label="Charset" value={meta.charset} />
      <TagRow label="Language" value={meta.language} />
      <TagRow label="Keywords" value={meta.keywords} />
      <TagRow label="og:title" value={og["title"]} />
      <TagRow label="og:description" value={og["description"]} />
      <TagRow label="og:image" value={og["image"]} />
      <TagRow label="og:url" value={og["url"]} />
      <TagRow label="og:site_name" value={og["site_name"]} />
      <TagRow label="twitter:card" value={tw["card"]} />
      <TagRow label="twitter:site" value={tw["site"]} />
    </div>
  );
}

/* -------------------------------- fix code -------------------------------- */

/** Render a fix that may contain markup as a copyable code block. */
function FixBlock({ fix }: { fix: string }) {
  const looksLikeCode = fix.includes("<") && fix.includes(">");
  if (!looksLikeCode) return <>{fix}</>;
  return (
    <code className="block whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground">
      {fix}
    </code>
  );
}

/* -------------------------------- analysis -------------------------------- */

/** Turn pasted HTML into the grouped, graded validation report. */
function validateHtml(html: string): AnalysisReport {
  const meta = extractMetaFromHtml(html);
  const dom = readDomFacts(html);
  const rules = buildRules(meta, dom);

  const score = scoreRules(rules);
  const fails = rules.filter((r) => r.status === "fail").length;

  const ruleChecks: CheckItem[] = rules.map((r) => ({
    id: r.id,
    status: r.status,
    label: r.label,
    detail: r.detail,
    group: r.group,
    ...(r.status !== "pass" && r.fix ? { fix: <FixBlock fix={r.fix} /> } : {}),
  }));

  const referenceCheck: CheckItem = {
    id: "extracted",
    status: "info",
    label: "Tags found in this page",
    detail: <ExtractedTags meta={meta} />,
    group: "Extracted tags",
  };

  return {
    score,
    grade: gradeForScore(score),
    summary: verdict(score, fails),
    checks: [...ruleChecks, referenceCheck],
  };
}

/* ----------------------------------- tool --------------------------------- */

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Meta Tag Validator. Check Your SEO Tags Against Best Practices</title>
  <meta name="description" content="Paste your page's HTML and validate its meta tags against SEO best practices: title and description length, canonical, robots, viewport, charset and social completeness.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="https://tools.example.com/meta-tag-validator">

  <!-- Open Graph -->
  <meta property="og:title" content="Meta Tag Validator">
  <meta property="og:description" content="Validate your <head> against SEO best practices, graded pass/fail.">
  <meta property="og:url" content="https://tools.example.com/meta-tag-validator">
  <meta property="og:image" content="https://tools.example.com/og/meta-validator-1200x630.png">
  <meta property="og:site_name" content="GigAI Tools">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@gigaitools">
</head>
<body></body>
</html>`;

export default function MetaTagValidatorTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={validateHtml}
        inputLabel="Paste your page's HTML"
        placeholder="Paste your full page source or just the <head> here…"
        sample={SAMPLE_HTML}
        emptyTitle="Paste a page's HTML to validate its meta tags"
        emptyHint={
          <>
            View the page&apos;s source (Ctrl+U / Cmd+Option+U), copy it, and paste it here.
            Every rule runs locally in your browser with the native parser: nothing is
            uploaded. To validate a live URL you&apos;d need a server we deliberately don&apos;t run,
            so paste the markup instead. This also lets you check staging, internal and
            login-gated pages a URL checker can&apos;t reach.
          </>
        }
        emptyIcon="ListChecks"
        accept=".html,.htm"
      />
    </section>
  );
}
