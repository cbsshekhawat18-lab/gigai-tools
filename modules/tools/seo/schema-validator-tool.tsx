"use client";

import * as React from "react";

import type { Tool, WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  PasteAnalyze,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import { validateJsonLd, type JsonLdValidation } from "@/lib/seo-tools/schema";

/**
 * Schema Validator, the paste-first structured-data checker for the
 * "Validators" group.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype. The user pastes one of three
 * things and we handle all of them in the browser:
 *   1. raw JSON-LD (an object or an array of nodes),
 *   2. a single `<script type="application/ld+json">` block, or
 *  3. an entire page's HTML, from which we extract every JSON-LD script.
 *
 * Each detected block is validated with the engine's {@link validateJsonLd}
 * (schema.org required = error, recommended = warning, nested typed nodes walked
 * with dotted paths). We shape the results into a grouped, scored
 * {@link AnalysisReport} with one group per block, a detected-@type badge, precise
 * parse errors, and a page-level summary. Nothing is fetched or uploaded, a
 * static export has no server to crawl, so this is honestly paste-first.
 */

/* -------------------------------------------------------------------------- */
/*  Block extraction                                                          */
/* -------------------------------------------------------------------------- */

interface RawBlock {
  /** The JSON text of the block, ready to hand to validateJsonLd. */
  json: string;
  /** Where it came from, for the block heading. */
  source: "json" | "script";
  /** 1-based index of this block among those found (script order). */
  index: number;
}

/** Does the input look like HTML (contains a tag) rather than bare JSON? */
function looksLikeHtml(input: string): boolean {
  const t = input.trimStart();
  if (t.startsWith("{") || t.startsWith("[")) return false;
  return /<[a-z!][\s\S]*>/i.test(input);
}

/**
 * Pull every `<script type="application/ld+json">…</script>` block out of an
 * HTML string using the browser's native DOMParser (no regex HTML parsing). Falls
 * back to a tolerant regex only if DOMParser is unavailable (SSR safety; this is
 * a client component, but we never assume the global exists).
 */
function extractFromHtml(html: string): string[] {
  const out: string[] = [];

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach((s) => {
      const txt = s.textContent?.trim();
      if (txt) out.push(txt);
    });
    if (out.length > 0) return out;
    // No typed script found via the parser, fall through to the regex, which
    // also catches type attributes with odd casing/whitespace.
  }

  const re =
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const body = (m[1] ?? "").trim();
    if (body) out.push(body);
  }
  return out;
}

/** Strip a single wrapping `<script …>…</script>` if the user pasted just one. */
function unwrapSingleScript(input: string): string | null {
  const m = input
    .trim()
    .match(
      /^<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>\s*$/i,
    );
  return m ? (m[1] ?? "").trim() : null;
}

/**
 * Turn arbitrary pasted input into the list of JSON-LD blocks to validate.
 * Ordering of detection: single script wrapper → full HTML page → raw JSON.
 */
function toBlocks(input: string): RawBlock[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const single = unwrapSingleScript(trimmed);
  if (single !== null) {
    return [{ json: single, source: "script", index: 1 }];
  }

  if (looksLikeHtml(trimmed)) {
    const found = extractFromHtml(trimmed);
    return found.map((json, i) => ({ json, source: "script", index: i + 1 }));
  }

  // Bare JSON, a single object or an array of nodes. We keep it as ONE block so
  // validateJsonLd can report array-level context; it already walks each node.
  return [{ json: trimmed, source: "json", index: 1 }];
}

/* -------------------------------------------------------------------------- */
/*  Per-block reporting                                                        */
/* -------------------------------------------------------------------------- */

/** Human title for a block, e.g. "Block 2, Product, Offer". */
function blockTitle(block: RawBlock, result: JsonLdValidation): string {
  const types = result.types.length ? result.types.join(", ") : "unknown type";
  const noun = block.source === "script" ? "Block" : "JSON-LD";
  return `${noun} ${block.index}, ${types}`;
}

/** A schema.org @type "chip" row rendered as the group's lead info line. */
function TypeBadges({ types }: { types: string[] }) {
  if (types.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      {types.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-foreground"
        >
          <Icon name="Braces" size={11} />
          {t}
        </span>
      ))}
    </div>
  );
}

/** A dotted-path code label for a property issue. */
function PathLabel({ path, fallback }: { path?: string; fallback: string }) {
  if (!path) return <>{fallback}</>;
  return <code className="font-mono text-xs">{path}</code>;
}

/**
 * Fix guidance for a validation issue. Required-property errors get a concrete
 * "add it" line; the two structural errors get tailored copy.
 */
function fixForError(message: string, path?: string): string {
  if (path === "@type" || message.includes('Missing "@type"')) {
    return 'Add a "@type" to this node (e.g. "@type": "Article"). Without it, search engines can\'t tell what the block describes.';
  }
  if (message.includes("must be an object")) {
    return "Each JSON-LD node must be a plain object with @type and @context. Not a string, number or bare array element.";
  }
  return "This property is required for that @type. Add it above and the rich result becomes eligible again.";
}

/** Turn one block's validation result into grouped CheckItems. */
function checksForBlock(block: RawBlock, result: JsonLdValidation): CheckItem[] {
  const group = blockTitle(block, result);
  const items: CheckItem[] = [];

  // Lead info row: the detected @type chips (or a note when none).
  items.push({
    id: `${block.index}-types`,
    status: "info",
    label:
      result.types.length > 0
        ? "Detected schema.org type(s)"
        : "No @type detected in this block",
    detail:
      result.types.length > 0 ? (
        <TypeBadges types={result.types} />
      ) : (
        "Add a top-level \"@type\" so this block describes a recognised schema.org entity."
      ),
    group,
  });

  // Errors, parse failures and missing required properties.
  for (const e of result.errors) {
    const isParse =
      e.message.startsWith("Invalid JSON") ||
      e.message.includes("must be an object") ||
      e.message === "Input is empty.";
    items.push({
      id: `${block.index}-err-${e.path ?? e.message.slice(0, 24)}`,
      status: "fail",
      label: isParse ? (
        "Could not validate this block"
      ) : (
        <PathLabel path={e.path} fallback="Required property missing" />
      ),
      detail: e.message,
      fix: isParse
        ? "Fix the JSON syntax: a trailing comma or a smart/curly quote pasted from a doc is the usual cause. Run it through the JSON Formatter, then re-validate."
        : fixForError(e.message, e.path),
      group,
    });
  }

  // Warnings, missing @context and missing recommended properties.
  for (const w of result.warnings) {
    items.push({
      id: `${block.index}-warn-${w.path ?? w.message.slice(0, 24)}`,
      status: "warn",
      label: <PathLabel path={w.path} fallback="Recommended property missing" />,
      detail: w.message,
      fix:
        w.path === "@context"
          ? 'Add "@context": "https://schema.org" at the top of the block so the vocabulary is unambiguous.'
          : "Optional, but adding it materially improves rich-result eligibility, Google favours complete markup.",
      group,
    });
  }

  // A clean pass summary when there's nothing to flag beyond the type row.
  if (result.errors.length === 0 && result.warnings.length === 0) {
    items.push({
      id: `${block.index}-ok`,
      status: "pass",
      label: "Valid: all required and recommended properties present",
      detail: result.types.length
        ? `Ready to publish as ${result.types.join(", ")}.`
        : "Ready to publish.",
      group,
    });
  } else if (result.errors.length === 0) {
    items.push({
      id: `${block.index}-req-ok`,
      status: "pass",
      label: "All required properties present",
      detail: "Valid markup. The warnings above are recommended-only.",
      group,
    });
  }

  return items;
}

/* -------------------------------------------------------------------------- */
/*  Page-level analysis                                                        */
/* -------------------------------------------------------------------------- */

/** Score one block: required errors weigh most; recommended warnings shave a little. */
function scoreBlock(result: JsonLdValidation): number {
  if (result.errors.length > 0) {
    return Math.max(0, 55 - result.errors.length * 18 - result.warnings.length * 4);
  }
  return Math.max(80, 100 - result.warnings.length * 6);
}

/** Page-level verdict shown next to the score dial. */
function Summary({
  blocks,
  errors,
  warnings,
}: {
  blocks: number;
  errors: number;
  warnings: number;
}) {
  const line =
    errors > 0
      ? `${blocks} block${blocks === 1 ? "" : "s"} checked: ${errors} error${
          errors === 1 ? "" : "s"
        } to fix before this markup is eligible.`
      : warnings > 0
        ? `Valid: ${blocks} block${blocks === 1 ? "" : "s"} checked, ${warnings} recommended ${
            warnings === 1 ? "property" : "properties"
          } would strengthen it.`
        : `Valid, all ${blocks} block${blocks === 1 ? "" : "s"} pass required and recommended checks.`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground">{line}</p>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Blocks" value={String(blocks)} />
        <Stat label="Errors" value={String(errors)} tone={errors ? "bad" : "ok"} />
        <Stat label="Warnings" value={String(warnings)} tone={warnings ? "warn" : "ok"} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "ok",
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad";
}) {
  const toneClass =
    tone === "bad"
      ? "text-rose-600 dark:text-rose-400"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : "text-foreground";
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-muted/20 px-3 py-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={`font-mono text-sm ${toneClass}`}>{value}</span>
    </div>
  );
}

/** Empty-state guidance when HTML was pasted but no JSON-LD script was found. */
function noBlocksReport(): AnalysisReport {
  return {
    score: 0,
    grade: "F",
    summary: (
      <p className="text-sm text-foreground">
        No <code className="font-mono text-xs">application/ld+json</code> blocks were
        found in the pasted HTML.
      </p>
    ),
    checks: [
      {
        id: "no-blocks",
        status: "fail",
        label: "No JSON-LD structured data detected",
        detail:
          "The validator looks for <script type=\"application/ld+json\"> blocks. None were present in what you pasted.",
        fix: "If your page uses Microdata or RDFa instead of JSON-LD, convert it (Google recommends JSON-LD). Also make sure you pasted the rendered page source. Not a JS bundle that injects the markup later. To validate a raw object, paste just the JSON-LD without the surrounding HTML.",
        group: "Detection",
      },
    ],
  };
}

/** Turn a pasted string into the structured report PasteAnalyze renders. */
function analyzeSchema(input: string): AnalysisReport {
  const blocks = toBlocks(input);

  if (blocks.length === 0) {
    // Only reached for HTML with no JSON-LD script; bare-JSON always yields a block.
    return noBlocksReport();
  }

  const checks: CheckItem[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let scoreSum = 0;

  for (const block of blocks) {
    const result = validateJsonLd(block.json);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    scoreSum += scoreBlock(result);
    checks.push(...checksForBlock(block, result));
  }

  const score = Math.round(scoreSum / blocks.length);

  return {
    score,
    summary: (
      <Summary blocks={blocks.length} errors={totalErrors} warnings={totalWarnings} />
    ),
    checks,
  };
}

/* -------------------------------------------------------------------------- */
/*  Tool                                                                       */
/* -------------------------------------------------------------------------- */

const SAMPLE = `<!doctype html>
<html lang="en">
<head>
  <title>The Complete Guide to Schema Markup in 2026</title>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "The Complete Guide to Schema Markup in 2026",
    "image": "https://example.com/images/schema-guide.jpg",
    "author": { "@type": "Person", "name": "Jordan Rivera" },
    "datePublished": "2026-06-01"
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Aurora Wireless Headphones",
    "offers": {
      "@type": "Offer",
      "price": "129.00"
    }
  }
  </script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList"
  }
  </script>
</head>
<body></body>
</html>`;

export default function SchemaValidatorTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeSchema}
        inputLabel="Paste JSON-LD, a <script> block, or a full HTML page"
        placeholder={
          '{\n "@context": "https://schema.org",\n "@type": "Article",\n "headline": "…"\n}\n\n, or paste a whole page\'s HTML source -'
        }
        sample={SAMPLE}
        emptyTitle="Paste structured data to validate it"
        emptyHint={`Drop in raw JSON-LD, a single <script type="application/ld+json"> block, an array of nodes, or an entire page's HTML source (Ctrl+U / Cmd+Option+U to view it). Every JSON-LD block is extracted and validated locally in your browser: nothing is uploaded. To validate straight from a live URL you'd need a server we deliberately don't run, so paste the markup instead. Works on staging, gated and unreleased pages too.`}
        emptyIcon="ScanSearch"
        accept=".json,.jsonld,.html,.htm,.txt"
      />
    </section>
  );
}
