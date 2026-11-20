"use client";

import * as React from "react";

import type { Tool, WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { accentStyle } from "@/lib/design";
import {
  PasteAnalyze,
  gradeForScore,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import {
  validateJsonLd,
  type JsonLdValidation,
  type ValidationIssue,
} from "@/lib/seo-tools/schema";

/**
 * Rich Results Preview, the paste-first structured-data auditor.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype: the user pastes JSON-LD or a
 * whole HTML page, we extract every `application/ld+json` block (via native
 * DOMParser when the input is HTML), validate each with `validateJsonLd`, detect
 * the schema.org `@type`s present, and map them to the concrete Google
 * rich-result features they're eligible for. Nothing is uploaded, parsing and
 * validation run entirely on the pasted text.
 *
 * Honest scope: this is a client-side required/recommended linter and
 * eligibility guide, NOT Google's live Rich Results Test (which fetches a URL
 * from Google's servers and applies Google's private eligibility rules).
 */

/* -------------------------------------------------------------------------- */
/*  Rich-result feature catalogue                                             */
/* -------------------------------------------------------------------------- */

/** A detected schema type mapped to the Google rich result it can earn. */
interface RichResultFeature {
  /** Human name of the Google rich-result feature. */
  feature: string;
  /** What the enhanced listing looks like in Search. */
  detail: string;
  icon: string;
}

/**
 * schema.org `@type` → the Google rich-result feature it's eligible for.
 * Only types Google actually renders an enhancement for are listed; other valid
 * types are still detected and reported, just without a feature promise.
 */
const FEATURE_BY_TYPE: Record<string, RichResultFeature> = {
  FAQPage: {
    feature: "FAQ rich result",
    detail: "An expandable list of questions and answers directly under your result.",
    icon: "MessageCircleQuestion",
  },
  Product: {
    feature: "Product snippet",
    detail: "Price, availability and star ratings shown beside the listing.",
    icon: "Package",
  },
  Offer: {
    feature: "Price & availability",
    detail: "The price and in-stock status that power the product snippet.",
    icon: "Tag",
  },
  AggregateRating: {
    feature: "Star ratings",
    detail: "The review stars and count shown in Search and shopping surfaces.",
    icon: "Star",
  },
  Review: {
    feature: "Review snippet",
    detail: "A rating and reviewer excerpt attached to the result.",
    icon: "MessageSquareQuote",
  },
  BreadcrumbList: {
    feature: "Breadcrumb trail",
    detail: "A navigational path shown in place of the raw URL.",
    icon: "ChevronRight",
  },
  Event: {
    feature: "Event listing",
    detail: "Event name, dates and venue surfaced in Search and Google events.",
    icon: "CalendarDays",
  },
  Recipe: {
    feature: "Recipe card",
    detail: "Photo, rating, cook time and calories in a rich recipe card.",
    icon: "ChefHat",
  },
  VideoObject: {
    feature: "Video result",
    detail: "A thumbnail, duration and key moments for the video.",
    icon: "Video",
  },
  Article: {
    feature: "Article enhancement",
    detail: "Headline, image and publisher treatment for news and articles.",
    icon: "FileText",
  },
  BlogPosting: {
    feature: "Article enhancement",
    detail: "Headline, image and author treatment for blog posts.",
    icon: "FileText",
  },
  NewsArticle: {
    feature: "Top stories eligibility",
    detail: "Article markup that can qualify for news and Top Stories surfaces.",
    icon: "Newspaper",
  },
  Organization: {
    feature: "Knowledge panel signals",
    detail: "Logo, name and social profiles that feed brand knowledge panels.",
    icon: "Building2",
  },
  LocalBusiness: {
    feature: "Local business info",
    detail: "Address, hours and phone that strengthen local and map results.",
    icon: "Store",
  },
  Person: {
    feature: "Person / profile signals",
    detail: "Name, role and profiles that feed people knowledge panels.",
    icon: "User",
  },
  SoftwareApplication: {
    feature: "App rich result",
    detail: "Rating, price and platform for an app or software listing.",
    icon: "AppWindow",
  },
};

/* -------------------------------------------------------------------------- */
/*  JSON-LD extraction                                                        */
/* -------------------------------------------------------------------------- */

/** One parsed JSON-LD payload plus where it came from. */
interface Block {
  /** 1-based index for labelling when there are several. */
  index: number;
  /** The raw JSON string of this block. */
  raw: string;
}

/** Does the input look like HTML rather than a bare JSON object/array? */
function looksLikeHtml(input: string): boolean {
  const t = input.trimStart();
  if (t.startsWith("{") || t.startsWith("[")) return false;
  return /<\s*(script|html|head|body|!doctype)/i.test(t) || /<[a-z][\s\S]*>/i.test(t);
}

/**
 * Pull every `application/ld+json` block out of an HTML string using the
 * browser's native DOMParser (no network, no eval). Returns the raw inner text
 * of each matching script tag.
 */
function extractLdJsonFromHtml(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const scripts = Array.from(
    doc.querySelectorAll('script[type="application/ld+json"]'),
  );
  return scripts
    .map((s) => (s.textContent ?? "").trim())
    .filter((t) => t.length > 0);
}

/**
 * Normalise raw pasted input into a list of JSON-LD blocks to validate.
 * - HTML → every ld+json script inside it.
 * - Bare JSON → a single block (the JSON itself).
 */
function toBlocks(input: string): Block[] {
  const trimmed = input.trim();
  if (looksLikeHtml(trimmed)) {
    return extractLdJsonFromHtml(trimmed).map((raw, i) => ({ index: i + 1, raw }));
  }
  return [{ index: 1, raw: trimmed }];
}

/* -------------------------------------------------------------------------- */
/*  Report building                                                           */
/* -------------------------------------------------------------------------- */

/** Turn a validator issue into a stable check-item id. */
function issueId(kind: "err" | "warn", blockIndex: number, issue: ValidationIssue): string {
  return `${kind}-${blockIndex}-${issue.path ?? issue.message}`;
}

/** A code-styled label for a property path, or a fallback string. */
function pathLabel(issue: ValidationIssue, fallback: string): React.ReactNode {
  return issue.path ? (
    <code className="font-mono text-xs">{issue.path}</code>
  ) : (
    fallback
  );
}

/** Prefix a group name with the block number when several blocks exist. */
function groupName(base: string, blockIndex: number, multi: boolean): string {
  return multi ? `Block ${blockIndex}, ${base}` : base;
}

/** Deduplicate + sort detected types for the eligibility summary. */
function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

/** Build the checks for a single validated block. */
function blockChecks(
  block: Block,
  v: JsonLdValidation,
  multi: boolean,
): { checks: CheckItem[]; hardError: boolean } {
  const checks: CheckItem[] = [];

  // A parse failure (no types detected + an error) is a hard, block-level fail.
  const parseFailed = v.types.length === 0 && v.errors.length > 0;
  if (parseFailed) {
    checks.push({
      id: `parse-${block.index}`,
      status: "fail",
      label: multi ? `Block ${block.index}: couldn't parse` : "Couldn't parse this markup",
      detail: v.errors[0]?.message ?? "The input is not valid JSON-LD.",
      fix: "Structured data must be valid JSON. Check for trailing commas, single quotes or unquoted keys, or paste the whole HTML page and let the tool extract the script.",
      group: groupName("Errors", block.index, multi),
    });
    return { checks, hardError: true };
  }

  for (const e of v.errors) {
    checks.push({
      id: issueId("err", block.index, e),
      status: "fail",
      label: pathLabel(e, "Required property missing"),
      detail: e.message,
      fix: "This property is required for a valid rich result: add it to the node named in the path above.",
      group: groupName("Required errors", block.index, multi),
    });
  }

  for (const w of v.warnings) {
    checks.push({
      id: issueId("warn", block.index, w),
      status: "warn",
      label: pathLabel(w, "Recommended property missing"),
      detail: w.message,
      fix: "Optional, but adding it improves your rich-result eligibility and how richly Google can display the page.",
      group: groupName("Recommended", block.index, multi),
    });
  }

  // Eligibility rows: one per detected type that maps to a Google feature.
  const eligible: string[] = [];
  const notGraded: string[] = [];
  for (const t of uniqueSorted(v.types)) {
    const feat = FEATURE_BY_TYPE[t];
    if (!feat) {
      notGraded.push(t);
      continue;
    }
    eligible.push(t);
    // Whether THIS block is valid governs whether the feature is truly unlocked.
    const unlocked = v.ok;
    checks.push({
      id: `feat-${block.index}-${t}`,
      status: unlocked ? "pass" : "info",
      label: (
        <span className="inline-flex items-center gap-1.5">
          <Icon name={feat.icon} size={13} />
          {feat.feature}
          <code className="font-mono text-[11px] text-muted-foreground">({t})</code>
        </span>
      ),
      detail: unlocked
        ? feat.detail
        : `${feat.detail} Fix the required error(s) above to make ${t} eligible.`,
      group: groupName("Rich-result eligibility", block.index, multi),
    });
  }

  if (notGraded.length > 0) {
    checks.push({
      id: `ungraded-${block.index}`,
      status: "info",
      label: "Other schema types detected",
      detail: `${notGraded.join(", ")}. Valid schema.org, but this tool has no rich-result rules for ${notGraded.length === 1 ? "it" : "them"}, so no eligibility is claimed.`,
      group: groupName("Rich-result eligibility", block.index, multi),
    });
  }

  if (eligible.length === 0 && notGraded.length === 0 && v.types.length === 0 && v.errors.length === 0) {
    // Parsed to an object with no @type at all (validateJsonLd emits an @type error,
    // so this branch is a safety net only).
    checks.push({
      id: `notype-${block.index}`,
      status: "warn",
      label: "No schema type found",
      detail: "The JSON parsed but no @type was present, so no rich result can be earned.",
      group: groupName("Required errors", block.index, multi),
    });
  }

  return { checks, hardError: false };
}

/** One-line verdict shown beside the score dial. */
function verdict(
  score: number,
  totalErrors: number,
  eligibleCount: number,
  blockCount: number,
): string {
  if (blockCount === 0) return "No JSON-LD found in what you pasted.";
  if (totalErrors > 0) {
    return `${totalErrors} required ${totalErrors === 1 ? "property is" : "properties are"} missing, fix these to become eligible.`;
  }
  if (score >= 90) {
    return eligibleCount > 0
      ? `Excellent, valid and eligible for ${eligibleCount} rich ${eligibleCount === 1 ? "result" : "results"}.`
      : "Excellent, valid structured data.";
  }
  if (score >= 75) return "Good, valid, with a few recommended properties worth adding.";
  return "Valid required properties, but several recommended ones are missing.";
}

/** Turn pasted input into the structured report PasteAnalyze renders. */
function analyze(input: string): AnalysisReport {
  const blocks = toBlocks(input);

  if (blocks.length === 0) {
    // HTML with no ld+json script inside it.
    return {
      score: 0,
      summary: "No JSON-LD found.",
      checks: [
        {
          id: "no-blocks",
          status: "fail",
          label: "No JSON-LD structured data found",
          detail:
            "The HTML you pasted has no <script type=\"application/ld+json\"> blocks. This tool checks JSON-LD, if the page uses Microdata or RDFa, convert it to JSON-LD (Google's recommended format) and paste that.",
          group: "Errors",
        },
      ],
    };
  }

  const multi = blocks.length > 1;
  const allChecks: CheckItem[] = [];
  const allTypes: string[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let anyHardError = false;
  let eligibleTypes: string[] = [];

  for (const block of blocks) {
    const v = validateJsonLd(block.raw);
    const { checks, hardError } = blockChecks(block, v, multi);
    allChecks.push(...checks);
    allTypes.push(...v.types);
    totalErrors += v.errors.length;
    totalWarnings += v.warnings.length;
    anyHardError = anyHardError || hardError;
    if (v.ok) {
      for (const t of v.types) if (FEATURE_BY_TYPE[t]) eligibleTypes.push(t);
    }
  }

  eligibleTypes = uniqueSorted(eligibleTypes);
  const detected = uniqueSorted(allTypes);

  // A "detected types" info row up top for orientation.
  const summaryChecks: CheckItem[] = [];
  if (detected.length > 0) {
    summaryChecks.push({
      id: "detected",
      status: "info",
      label: `${detected.length} schema ${detected.length === 1 ? "type" : "types"} detected across ${blocks.length} ${blocks.length === 1 ? "block" : "blocks"}`,
      detail: (
        <span className="flex flex-wrap gap-1.5">
          {detected.map((t) => (
            <code
              key={t}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground"
            >
              {t}
            </code>
          ))}
        </span>
      ),
      group: "Detected types",
    });
  }

  // Score: hard parse errors and missing-required errors dominate; recommended
  // warnings shave a little. No detected type at all = 0.
  const errPenalty = totalErrors * 20 + (anyHardError ? 30 : 0);
  const warnPenalty = totalWarnings * 5;
  const raw = 100 - errPenalty - warnPenalty;
  const score = detected.length === 0 && !anyHardError ? 0 : Math.max(0, Math.min(100, raw));

  return {
    score,
    grade: gradeForScore(score),
    summary: verdict(score, totalErrors, eligibleTypes.length, blocks.length),
    checks: [...summaryChecks, ...allChecks],
  };
}

/* -------------------------------------------------------------------------- */
/*  Sample                                                                    */
/* -------------------------------------------------------------------------- */

const SAMPLE = `[
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Aurora Wireless Headphones",
    "image": "https://example.com/aurora.jpg",
    "description": "Over-ear ANC headphones with 40-hour battery life.",
    "brand": { "@type": "Brand", "name": "Aurora" },
    "offers": {
      "@type": "Offer",
      "price": "129.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.6",
      "reviewCount": "215"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" },
      { "@type": "ListItem", "position": 2, "name": "Audio", "item": "https://example.com/audio" }
    ]
  }
]`;

/* -------------------------------------------------------------------------- */
/*  Tool                                                                      */
/* -------------------------------------------------------------------------- */

export default function RichResultsPreviewTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent ?? "violet");

  return (
    <section aria-label={tool.title} className="flex flex-col gap-3">
      <PasteAnalyze
        analyze={analyze}
        inputLabel="Paste JSON-LD or a page's HTML"
        placeholder='Paste your <script type="application/ld+json"> block, a raw JSON-LD object/array, or the whole page HTML…'
        sample={SAMPLE}
        emptyTitle="Paste structured data to preview its rich results"
        emptyHint="Paste JSON-LD, or the full HTML of a page (the tool extracts every ld+json script for you). Everything is parsed and validated locally in your browser: nothing is uploaded. To test a live URL you'd need a server we deliberately don't run, so paste the markup instead. Works on staging, login-gated and unpublished pages too."
        emptyIcon="Sparkles"
        accept=".json,.html,.htm,.txt"
      />
      <p className="flex items-start gap-1.5 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="Info" size={13} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          This is a pragmatic client-side check of required and recommended
          properties, not Google&rsquo;s live test. Always confirm final
          eligibility with{" "}
          <a
            href="https://search.google.com/test/rich-results"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("font-medium underline underline-offset-2", style.text)}
          >
            Google&rsquo;s Rich Results Test
          </a>{" "}
          before you rely on a rich result.
        </span>
      </p>
    </section>
  );
}
