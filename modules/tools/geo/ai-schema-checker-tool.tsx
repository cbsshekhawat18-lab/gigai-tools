"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { FixWithTool } from "@/components/tool/fix-with-tool";
import { PasteAnalyze, type AnalysisReport, type CheckItem } from "@/components/tool/seo";
import { analyzeHtml } from "@/lib/geo/html";

/**
 * AI Schema Checker — audits a page's JSON-LD against the schema types AI
 * retrieval actually leans on, and routes every gap to the existing GigAI
 * generator that fixes it. Deliberately a CHECKER, not another generator:
 * the SEO Studio already has 13 schema generators; duplicating them would
 * help nobody. This tool answers "which of them does THIS page need?"
 */

interface WantedType {
  type: string;
  why: string;
  /** Existing GigAI generator that produces it. */
  toolSlug: string;
  toolLabel: string;
  /** Required properties whose absence makes the block near-useless. */
  required: string[];
  /** Applies to every page vs only matching content. */
  scope: "site" | "content";
}

const WANTED: WantedType[] = [
  {
    type: "Organization",
    why: "The entity anchor: tells retrieval systems WHO is behind the site (name, logo, URL and profiles) so mentions of your brand resolve to one entity.",
    toolSlug: "organization-schema-generator",
    toolLabel: "Organization Schema Generator",
    required: ["name", "url"],
    scope: "site",
  },
  {
    type: "WebSite",
    why: "Names the site itself and its search endpoint. The cheapest identity signal a site can emit.",
    toolSlug: "schema-generator",
    toolLabel: "Schema Generator",
    required: ["name", "url"],
    scope: "site",
  },
  {
    type: "FAQPage",
    why: "Question–answer pairs in machine-readable form: exactly the shape AI assistants lift answers from.",
    toolSlug: "faq-schema-generator",
    toolLabel: "FAQ Schema Generator",
    required: ["mainEntity"],
    scope: "content",
  },
  {
    type: "HowTo",
    why: "Step sequences with explicit ordering: retrieval systems reproduce them as numbered instructions.",
    toolSlug: "schema-generator",
    toolLabel: "Schema Generator",
    required: ["name", "step"],
    scope: "content",
  },
  {
    type: "SoftwareApplication",
    why: "For tools/apps: category, price and platform in machine-readable form, so 'free X tool' queries can match you on facts.",
    toolSlug: "software-schema-generator",
    toolLabel: "Software Schema Generator",
    required: ["name"],
    scope: "content",
  },
  {
    type: "Article",
    why: "Authorship and dates: provenance signals AI answers use when choosing which source to cite.",
    toolSlug: "article-schema-generator",
    toolLabel: "Article Schema Generator",
    required: ["headline"],
    scope: "content",
  },
  {
    type: "BreadcrumbList",
    why: "Tells retrieval where the page sits in the site's hierarchy: context that survives even when only this page is retrieved.",
    toolSlug: "breadcrumb-schema-generator",
    toolLabel: "Breadcrumb Schema Generator",
    required: ["itemListElement"],
    scope: "site",
  },
];

function analyze(input: string, fetched?: { finalUrl: string }): AnalysisReport {
  const doc = analyzeHtml(input, fetched?.finalUrl);
  const checks: CheckItem[] = [];
  const present = new Set(doc.jsonLdTypes);

  if (doc.invalidJsonLdBlocks > 0) {
    checks.push({
      status: "fail",
      label: `${doc.invalidJsonLdBlocks} JSON-LD block${doc.invalidJsonLdBlocks === 1 ? "" : "s"} failed to parse`,
      detail: "Broken JSON is worse than no JSON: parsers skip the whole block silently.",
      fix: (
        <span>
          Validate and repair the block.
          <FixWithTool tools={[{ slug: "jsonld-validator", label: "JSON-LD Validator", icon: "Braces", why: "Pinpoints the syntax error" }]} />
        </span>
      ),
      group: "Validity",
    });
  }

  // Per-type presence + required-property audit.
  let score = 100;
  for (const w of WANTED) {
    if (present.has(w.type)) {
      const objs = doc.jsonLd.filter((o) => {
        const t = (o as Record<string, unknown>)["@type"];
        return t === w.type || (Array.isArray(t) && t.includes(w.type));
      });
      const missingProps = w.required.filter(
        (p) => !objs.some((o) => (o as Record<string, unknown>)[p] !== undefined),
      );
      checks.push({
        status: missingProps.length ? "warn" : "pass",
        label: `${w.type} present${missingProps.length ? `, but missing ${missingProps.join(", ")}` : ""}`,
        detail: w.why,
        fix: missingProps.length ? `Add the missing propert${missingProps.length === 1 ? "y" : "ies"} (${missingProps.join(", ")}): without them the block carries almost no signal.` : undefined,
        group: w.scope === "site" ? "Site identity" : "Content types",
      });
      if (missingProps.length) score -= 5;
    } else {
      const relevant = w.scope === "site";
      checks.push({
        status: relevant ? "warn" : "info",
        label: `No ${w.type}`,
        detail: `${w.why}${w.scope === "content" ? " Only add it when the page really contains this content type — schema describing content that isn't on the page hurts trust." : ""}`,
        fix: (
          <span>
            Generate it (only if it matches the page&apos;s real content):
            <FixWithTool tools={[{ slug: w.toolSlug, label: w.toolLabel, icon: "Braces", why: `Produces valid ${w.type} JSON-LD` }]} />
          </span>
        ),
        group: w.scope === "site" ? "Site identity" : "Content types",
      });
      if (relevant) score -= 15;
    }
  }

  const extra = Array.from(new Set(doc.jsonLdTypes)).filter((t) => !WANTED.some((w) => w.type === t));
  if (extra.length) {
    checks.push({
      status: "info",
      label: `Also present: ${extra.join(", ")}`,
      detail: "Fine to keep. These just aren't among the types AI retrieval leans on most.",
      group: "Validity",
    });
  }
  if (doc.jsonLdTypes.length === 0 && doc.invalidJsonLdBlocks === 0) {
    score = 15;
  }
  score = Math.max(0, Math.min(100, score - doc.invalidJsonLdBlocks * 15));

  return {
    score,
    summary:
      doc.jsonLdTypes.length === 0
        ? "No structured data at all. This page's identity is left entirely to inference."
        : `Found ${new Set(doc.jsonLdTypes).size} distinct JSON-LD types across ${doc.jsonLd.length} objects.`,
    checks,
  };
}

const SAMPLE = `<!doctype html>
<html><head>
<title>Acme PDF Compressor — free online</title>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"SoftwareApplication","name":"Acme PDF Compressor","applicationCategory":"UtilitiesApplication","offers":{"@type":"Offer","price":"0"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Is it free?","acceptedAnswer":{"@type":"Answer","text":"Yes, with no page limit."}}]}
</script>
</head><body><main><h1>Compress PDFs</h1><p>Shrink a PDF up to 95% in your browser.</p></main></body></html>`;

export default function AiSchemaCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyze}
        fetchable
        shareSlug="ai-schema-checker"
        shareLabel="AI schema report"
        urlPlaceholder="https://example.com/page: we'll fetch and audit its JSON-LD"
        inputLabel="Paste the page's HTML, or fetch a URL"
        placeholder="Paste full page HTML (View Source → copy)…"
        sample={SAMPLE}
        emptyTitle="Is your identity machine-readable?"
        emptyHint="Structured data is how a page states what it IS without making the machine guess. This checker reads your JSON-LD and audits it against the seven types AI retrieval leans on (Organization, WebSite, FAQPage, HowTo, SoftwareApplication, Article, BreadcrumbList), verifies each type's load-bearing properties, and links every gap to the GigAI generator that fills it. Runs entirely in your browser."
        emptyIcon="Braces"
        accept=".html,.htm,text/html"
      />
    </section>
  );
}
