"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  PasteAnalyze,
  SerpPreview,
  SocialCardPreview,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import {
  analyzeMetaFromHtml,
  type ExtractedMeta,
  type MetaAuditItem,
} from "@/lib/seo-tools/meta";

/**
 * Meta Tag Analyzer, the paste-first auditor.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype: the user pastes a page's HTML,
 * `analyzeMetaFromHtml` (native DOMParser, in-browser) extracts and scores every
 * SEO-relevant tag, and we shape that into a grouped {@link AnalysisReport}. On
 * top of the core audit we add per-check fix guidance, an "Extracted tags"
 * summary of the raw values found, and, reconstructed live from those tags, a
 * pixel-accurate Google snippet and Facebook/X/LinkedIn share cards. Nothing is
 * uploaded; everything runs on the pasted markup.
 */

/* ----------------------------- status mapping ----------------------------- */

/** Map an engine audit status to a PasteAnalyze check status. */
function toCheckStatus(status: MetaAuditItem["status"]): CheckItem["status"] {
  return status === "good" ? "pass" : status === "warn" ? "warn" : "fail";
}

/**
 * Actionable, per-check fix copy keyed by the engine audit `id`. Only shown on
 * warn/fail rows: a passing check needs no fix.
 */
const FIX_BY_ID: Record<string, string> = {
  title:
    "Add a single, unique <title> in the 50–60 character range that front-loads your primary keyword and brand.",
  description:
    "Add one <meta name=\"description\"> of about 150–160 characters that summarises the page and earns the click.",
  "dup-title":
    "Keep exactly one <title>. A layout and a page component both emitting one is the usual cause, remove the duplicate.",
  "dup-desc":
    "Emit a single <meta name=\"description\">. Remove the duplicate your template or CMS is adding.",
  canonical:
    "Add <link rel=\"canonical\" href=\"…\"> pointing at this page's authoritative URL to consolidate ranking signals.",
  viewport:
    "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> so the page is mobile-friendly.",
  charset: "Declare the encoding near the top of <head>: <meta charset=\"UTF-8\">.",
  robots:
    "If this page should rank, remove the noindex. Check your template default and CMS visibility settings.",
  og: "Add og:title and og:image (ideally 1200×630) so shared links render a rich card instead of a plain box.",
  twitter:
    "Add <meta name=\"twitter:card\" content=\"summary_large_image\"> (plus twitter:title/description) for a proper X card.",
};

/* -------------------------- extracted-tags summary ------------------------ */

/** One label/value row in the extracted-tags panel; omitted when empty. */
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

/** A compact table of the raw tag values pulled out of the pasted HTML. */
function ExtractedTags({ meta }: { meta: ExtractedMeta }) {
  const og = meta.og;
  const tw = meta.twitter;
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
      <TagRow label="Favicon" value={meta.favicon} />
      <TagRow label="og:title" value={og["title"]} />
      <TagRow label="og:image" value={og["image"]} />
      <TagRow label="og:type" value={og["type"]} />
      <TagRow label="og:url" value={og["url"]} />
      <TagRow label="og:site_name" value={og["site_name"]} />
      <TagRow label="twitter:card" value={tw["card"]} />
      <TagRow label="twitter:site" value={tw["site"]} />
    </div>
  );
}

/* ------------------------------ live previews ----------------------------- */

/** Reconstruct the Google + social preview from the tags actually found. */
function ReconstructedPreview({ meta }: { meta: ExtractedMeta }) {
  const title = meta.og["title"] || meta.title || "Untitled page";
  const description =
    meta.og["description"] ||
    meta.description ||
    "No meta description was found on this page.";
  const url = meta.og["url"] || meta.canonical || "https://example.com/page";
  const image = meta.og["image"] || undefined;
  const siteName = meta.og["site_name"] || undefined;
  const card = meta.twitter["card"] === "summary" ? "summary" : "summary_large_image";

  return (
    <div className="mt-1 flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="Search" size={13} />
          Google result (from the tags found)
        </div>
        <SerpPreview title={title} url={url} description={description} />
      </div>
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="Share2" size={13} />
          Social share card
        </div>
        <SocialCardPreview
          title={title}
          description={description}
          url={url}
          image={image}
          siteName={siteName}
          card={card}
        />
      </div>
    </div>
  );
}

/* -------------------------------- analysis -------------------------------- */

/** One-line verdict shown next to the score dial. */
function verdict(score: number, fails: number): string {
  if (score >= 90) return "Excellent: the head is essentially ship-ready.";
  if (score >= 75) return "Good, a few quick wins remain.";
  if (score >= 60) return fails ? "Fair: some tags need attention." : "Fair: tighten the warnings.";
  if (score >= 40) return "Needs work. Several important tags are missing or off.";
  return "Poor, the essential SEO tags need real fixing.";
}

/** Turn a pasted HTML string into the structured report PasteAnalyze renders. */
function analyzeHtml(html: string): AnalysisReport {
  const audit = analyzeMetaFromHtml(html);

  const auditChecks: CheckItem[] = audit.items.map((it) => {
    const status = toCheckStatus(it.status);
    const fix = status === "pass" ? undefined : FIX_BY_ID[it.id];
    return {
      id: it.id,
      status,
      label: it.label,
      detail: it.message,
      ...(fix ? { fix } : {}),
      group: "Meta audit",
    };
  });

  const fails = auditChecks.filter((c) => c.status === "fail").length;

  // Extra "Extracted tags" group: the raw values found + reconstructed preview.
  // Rendered as info rows so they read as reference, not pass/fail.
  const extraChecks: CheckItem[] = [
    {
      id: "extracted",
      status: "info",
      label: "Tags found in this page",
      detail: <ExtractedTags meta={audit.extracted} />,
      group: "Extracted tags",
    },
    {
      id: "preview",
      status: "info",
      label: "Live search & social preview",
      detail: <ReconstructedPreview meta={audit.extracted} />,
      group: "Extracted tags",
    },
  ];

  return {
    score: audit.score,
    summary: verdict(audit.score, fails),
    checks: [...auditChecks, ...extraChecks],
  };
}

/* ----------------------------------- tool --------------------------------- */

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fathom: Privacy-First Web Analytics Without Cookies</title>
  <meta name="description" content="Fathom is simple, fast, GDPR-compliant website analytics with no cookies and no consent banners. See what matters in one clean dashboard. Start free.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="canonical" href="https://usefathom.example.com/">
  <meta name="keywords" content="web analytics, privacy analytics, cookieless analytics">
  <link rel="icon" href="/favicon.ico">

  <!-- Open Graph -->
  <meta property="og:title" content="Fathom, Privacy-First Web Analytics">
  <meta property="og:description" content="Simple, fast, GDPR-compliant analytics with no cookies and no consent banners.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://usefathom.example.com/">
  <meta property="og:image" content="https://usefathom.example.com/og/home-1200x630.png">
  <meta property="og:site_name" content="Fathom Analytics">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@usefathom">
</head>
<body></body>
</html>`;

export default function MetaTagAnalyzerTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeHtml}
        fetchable
        shareSlug="meta-tag-analyzer"
        shareLabel="Meta tag report"
        inputLabel="Enter a URL to fetch & audit, or paste the HTML"
        placeholder="…or paste your full page source or just the <head> here"
        sample={SAMPLE_HTML}
        emptyTitle="Enter a URL (or paste HTML) to audit its meta tags"
        emptyHint="Type a page's URL and we'll fetch and audit it for you. Prefer to keep it fully local, or auditing a staging/login-gated page? Paste the source instead: everything is parsed in your browser and nothing is stored."
        emptyIcon="ScanSearch"
        accept=".html,.htm"
      />
    </section>
  );
}
