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
 * JSON-LD Validator: the paste-first structured-data linter for the
 * "Validators" group.
 *
 * Its sibling, the Schema Validator, is built for auditing a *whole page*: paste
 * raw HTML and every `<script type="application/ld+json">` block is extracted and
 * scored. This tool is deliberately scoped to a *single* piece of markup, a raw
 * JSON-LD object, an array / `@graph`, or one script tag copied from View Source
 * - and adds the thing that config promises the page will rank for: a clean,
 * re-formatted copy of the JSON, so it doubles as a JSON-LD beautifier.
 *
 * All parsing and validation runs on the engine's {@link validateJsonLd} in the
 * browser (schema.org required = error, recommended = warning). Nothing is
 * fetched or uploaded.
 */

/* -------------------------------------------------------------------------- */
/*  Input handling                                                             */
/* -------------------------------------------------------------------------- */

/** Strip a single wrapping `<script …>…</script>` so users can paste the tag. */
function unwrapScript(input: string): string {
  const m = input
    .trim()
    .match(
      /^<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>\s*$/i,
    );
  return m ? (m[1] ?? "").trim() : input.trim();
}

/** Pretty-print the parsed JSON at 2-space indent, or null if it won't parse. */
function reformat(json: string): string | null {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Reporting                                                                  */
/* -------------------------------------------------------------------------- */

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

function PathLabel({ path, fallback }: { path?: string; fallback: string }) {
  if (!path) return <>{fallback}</>;
  return <code className="font-mono text-xs">{path}</code>;
}

/** Concrete fix line for a validation error. */
function fixForError(message: string, path?: string): string {
  if (path === "@type" || message.includes('Missing "@type"')) {
    return 'Add a "@type" to this node (e.g. "@type": "Article"). Without it, search engines can\'t tell what the block describes.';
  }
  if (message.includes("must be an object")) {
    return "Each JSON-LD node must be a plain object with @type and @context. Not a string, number or bare array element.";
  }
  return "This property is required for that @type. Add it and the rich result becomes eligible again.";
}

/** Build the report from one validation result + the re-formatted copy. */
function toReport(result: JsonLdValidation, formatted: string | null): AnalysisReport {
  const checks: CheckItem[] = [];
  const infoGroup = "Structure";

  // Detected @type(s): the lead info row.
  checks.push({
    id: "types",
    status: result.types.length > 0 ? "info" : "warn",
    label:
      result.types.length > 0
        ? "Detected schema.org type(s)"
        : "No @type detected",
    detail:
      result.types.length > 0 ? (
        <TypeBadges types={result.types} />
      ) : (
        'Add a top-level "@type" so this markup describes a recognised schema.org entity.'
      ),
    group: infoGroup,
  });

  // Errors: parse failures + missing required properties.
  for (const e of result.errors) {
    const isParse =
      e.message.startsWith("Invalid JSON") ||
      e.message.includes("must be an object") ||
      e.message === "Input is empty.";
    checks.push({
      id: `err-${e.path ?? e.message.slice(0, 24)}`,
      status: "fail",
      label: isParse ? (
        "Could not parse this JSON-LD"
      ) : (
        <PathLabel path={e.path} fallback="Required property missing" />
      ),
      detail: e.message,
      fix: isParse
        ? "Fix the JSON syntax: a trailing comma or a curly/“smart” quote pasted from a document is the usual cause. Straighten the quotes, drop the trailing comma, then re-validate."
        : fixForError(e.message, e.path),
      group: isParse ? "JSON syntax" : "Required properties",
    });
  }

  // Warnings: missing @context + recommended properties.
  for (const w of result.warnings) {
    checks.push({
      id: `warn-${w.path ?? w.message.slice(0, 24)}`,
      status: "warn",
      label: <PathLabel path={w.path} fallback="Recommended property missing" />,
      detail: w.message,
      fix:
        w.path === "@context"
          ? 'Add "@context": "https://schema.org" at the top so the vocabulary is unambiguous.'
          : "Optional, but adding it materially improves rich-result eligibility, Google favours complete markup.",
      group: w.path === "@context" ? "Structure" : "Recommended properties",
    });
  }

  // Clean-pass summary rows.
  if (result.errors.length === 0 && result.warnings.length === 0) {
    checks.push({
      id: "ok",
      status: "pass",
      label: "Valid, all required and recommended properties present",
      detail: result.types.length
        ? `Ready to publish as ${result.types.join(", ")}.`
        : "Ready to publish.",
      group: infoGroup,
    });
  } else if (result.errors.length === 0) {
    checks.push({
      id: "req-ok",
      status: "pass",
      label: "All required properties present",
      detail: "Valid markup: the warnings above are recommended-only.",
      group: infoGroup,
    });
  }

  // Formatter output, the distinct value this page promises.
  if (formatted !== null) {
    checks.push({
      id: "formatted",
      status: "info",
      label: "Re-formatted JSON-LD (copy or download the report to keep it)",
      detail: (
        <pre className="mt-1 max-h-72 overflow-auto rounded-lg border border-border bg-muted/30 p-3 font-mono text-xs leading-relaxed text-foreground">
          {formatted}
        </pre>
      ),
      group: "Formatted output",
    });
  }

  const errors = result.errors.length;
  const warnings = result.warnings.length;
  const score =
    errors > 0
      ? Math.max(0, 55 - errors * 18 - warnings * 4)
      : Math.max(80, 100 - warnings * 6);

  const summary =
    errors > 0
      ? `${errors} error${errors === 1 ? "" : "s"} to fix before this markup is eligible for rich results.`
      : warnings > 0
        ? `Valid: ${warnings} recommended ${warnings === 1 ? "property" : "properties"} would strengthen it.`
        : "Valid: required and recommended checks all pass.";

  return { score, summary: <p className="text-sm text-foreground">{summary}</p>, checks };
}

/** Turn the pasted string into the structured report. */
function analyzeJsonLd(input: string): AnalysisReport {
  const json = unwrapScript(input);
  const result = validateJsonLd(json);
  return toReport(result, reformat(json));
}

/* -------------------------------------------------------------------------- */
/*  Tool                                                                       */
/* -------------------------------------------------------------------------- */

const SAMPLE = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Aurora Wireless Headphones",
  "image": "https://example.com/img/aurora.jpg",
  "offers": {
    "@type": "Offer",
    "price": "129.00",
    "priceCurrency": "USD"
  }
}
</script>`;

export default function JsonLdValidatorTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeJsonLd}
        inputLabel="Paste JSON-LD or a single <script type=&quot;application/ld+json&quot;> block"
        placeholder={
          '{\n "@context": "https://schema.org",\n "@type": "Article",\n "headline": "…"\n}\n\n, or paste the whole <script type="application/ld+json"> tag -'
        }
        sample={SAMPLE}
        emptyTitle="Paste JSON-LD to validate it"
        emptyHint={`Drop in a raw JSON-LD object, an array / @graph of nodes, or a single <script type="application/ld+json"> block copied from View Source; the wrapper is stripped for you. The JSON is parsed and every node graded against schema.org's required and recommended properties locally in your browser; nothing is uploaded. Once it parses, you get a clean, re-formatted copy back, so this doubles as a JSON-LD beautifier. To validate straight from a live URL you'd need a server we deliberately don't run, so paste the markup instead.`}
        emptyIcon="Braces"
        accept=".json,.jsonld,.html,.htm,.txt"
      />
    </section>
  );
}
