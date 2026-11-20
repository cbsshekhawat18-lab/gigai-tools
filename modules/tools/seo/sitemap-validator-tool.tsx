"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  PasteAnalyze,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import { validateSitemap, CHANGE_FREQS } from "@/lib/seo-tools/sitemap";

/**
 * Sitemap Validator: the paste-first checker for the "Sitemaps" group.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype: the user pastes a sitemap.xml
 * (or a <sitemapindex>), and we validate it entirely in the browser. The engine's
 * {@link validateSitemap} does the authoritative well-formedness + protocol pass;
 * on top of it we parse the document a second time (native DOMParser) to surface
 * richer, per-entry detail, HTTPS coverage, entry count vs the 50,000 limit, and
 * a compact preview of the first locations found: shaped into a grouped, scored
 * {@link AnalysisReport}. Nothing is fetched or uploaded; a static export has no
 * server to crawl from, so this is honestly paste-first.
 */

const MAX_URLS = 50000;
const WARN_URLS = 45000;
const VALID_FREQS = new Set<string>(CHANGE_FREQS);

/* ------------------------------ secondary parse --------------------------- */

interface EntryStats {
  /** "urlset" | "sitemapindex" | other root name | null when unparsable. */
  root: string | null;
  isIndex: boolean;
  total: number;
  https: number;
  nonHttps: number;
  /** First few locations, for the preview panel. */
  sampleLocs: string[];
  badFreqs: string[];
  badPriorities: string[];
  bytes: number;
}

/**
 * Parse the pasted XML a second time to derive display-only stats. Kept separate
 * from the engine's pass/fail logic so we never contradict {@link validateSitemap}:
 * on any parse failure we return zeros and let the engine own the error message.
 */
function collectStats(xml: string): EntryStats {
  const bytes =
    typeof TextEncoder !== "undefined" ? new TextEncoder().encode(xml).length : xml.length;
  const empty: EntryStats = {
    root: null,
    isIndex: false,
    total: 0,
    https: 0,
    nonHttps: 0,
    sampleLocs: [],
    badFreqs: [],
    badPriorities: [],
    bytes,
  };

  if (typeof DOMParser === "undefined") return empty;

  const doc = new DOMParser().parseFromString(xml.trim(), "application/xml");
  if (doc.querySelector("parsererror")) return empty;

  const root = doc.documentElement?.nodeName ?? null;
  const isIndex = root === "sitemapindex";
  const nodes = isIndex ? doc.querySelectorAll("sitemap") : doc.querySelectorAll("url");

  let https = 0;
  let nonHttps = 0;
  const sampleLocs: string[] = [];
  const badFreqs: string[] = [];
  const badPriorities: string[] = [];

  nodes.forEach((node) => {
    const loc = node.querySelector("loc")?.textContent?.trim() ?? "";
    if (loc) {
      if (/^https:\/\//i.test(loc)) https += 1;
      else nonHttps += 1;
      if (sampleLocs.length < 6) sampleLocs.push(loc);
    }
    if (!isIndex) {
      const freq = node.querySelector("changefreq")?.textContent?.trim();
      if (freq && !VALID_FREQS.has(freq) && badFreqs.length < 5) badFreqs.push(freq);
      const pr = node.querySelector("priority")?.textContent?.trim();
      if (pr) {
        const n = Number(pr);
        if ((!Number.isFinite(n) || n < 0 || n > 1) && badPriorities.length < 5) {
          badPriorities.push(pr);
        }
      }
    }
  });

  return {
    root,
    isIndex,
    total: nodes.length,
    https,
    nonHttps,
    sampleLocs,
    badFreqs,
    badPriorities,
    bytes,
  };
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

/** Verdict + at-a-glance stats shown above the checklist. */
function Summary({ stats, ok, errorCount }: { stats: EntryStats; ok: boolean; errorCount: number }) {
  const kind = stats.isIndex ? "sitemap index" : "sitemap";
  const line = ok
    ? `Valid ${kind}, ${stats.total.toLocaleString()} ${stats.isIndex ? "child sitemap" : "URL"}${stats.total === 1 ? "" : "s"}, no errors.`
    : `Not valid yet, ${errorCount} error${errorCount === 1 ? "" : "s"} to fix.`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground">{line}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          label={stats.isIndex ? "Child sitemaps" : "URLs"}
          value={stats.total.toLocaleString()}
        />
        <Stat
          label="HTTPS"
          value={stats.total ? `${stats.https}/${stats.total}` : "0/0"}
        />
        <Stat label="Root" value={stats.root ? `<${stats.root}>` : "—"} />
        <Stat label="Size" value={formatBytes(stats.bytes)} />
      </div>
    </div>
  );
}

/** Compact list of the first locations found, for quick eyeballing. */
function LocPreview({ locs, isIndex }: { locs: string[]; isIndex: boolean }) {
  if (!locs.length) return null;
  return (
    <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon name={isIndex ? "ListTree" : "Link2"} size={13} />
        {isIndex ? "Child sitemaps found" : "First locations found"}
      </div>
      <ul className="flex flex-col gap-1">
        {locs.map((loc, i) => (
          <li key={i} className="min-w-0 break-all font-mono text-xs text-foreground">
            {loc}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------- analysis -------------------------------- */

/** Turn a pasted sitemap XML string into the structured report PasteAnalyze renders. */
function analyzeSitemap(xml: string): AnalysisReport {
  const trimmed = xml.trim();
  const result = validateSitemap(trimmed);
  const stats = collectStats(trimmed);

  const checks: CheckItem[] = [];
  const parseErr = result.errors.find((e) => e.startsWith("XML is not well-formed"));

  // 1. Well-formedness, the gate everything else depends on.
  if (parseErr) {
    checks.push({
      id: "wellformed",
      status: "fail",
      label: "XML is not well-formed",
      detail: parseErr.replace(/^XML is not well-formed:\s*/, ""),
      fix: "Escape special characters inside <loc>, & becomes &amp;, < becomes &lt;. A raw ampersand in a URL query string is the most common cause. Also check for unclosed tags and remove any characters (or a BOM) before the <?xml...?> declaration.",
      group: "Structure",
    });
    // Nothing else is meaningful once parsing fails.
    return {
      score: 0,
      grade: "F",
      summary: "The sitemap could not be parsed, fix the XML, then re-check.",
      checks,
    };
  }

  checks.push({
    id: "wellformed",
    status: "pass",
    label: "XML is well-formed",
    detail: "The document parses cleanly with the browser's native XML parser.",
    group: "Structure",
  });

  // 2. Root element.
  if (stats.root === "urlset" || stats.root === "sitemapindex") {
    checks.push({
      id: "root",
      status: "pass",
      label:
        stats.root === "sitemapindex"
          ? "Root is <sitemapindex>, validating as an index"
          : "Root is <urlset>",
      group: "Structure",
    });
  } else {
    checks.push({
      id: "root",
      status: "warn",
      label: `Root element is <${stats.root ?? "?"}>`,
      detail: "Expected <urlset> for a sitemap or <sitemapindex> for an index.",
      fix: "Wrap entries in <urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"> … </urlset> (or <sitemapindex> for an index of sitemaps).",
      group: "Structure",
    });
  }

  // 3. Entry count.
  if (stats.total === 0) {
    checks.push({
      id: "count",
      status: "fail",
      label: "No URL entries found",
      detail: stats.isIndex
        ? "The <sitemapindex> has no <sitemap> children."
        : "The <urlset> has no <url> children.",
      fix: stats.isIndex
        ? "Add one <sitemap><loc>…</loc></sitemap> entry per child sitemap."
        : "Add one <url><loc>…</loc></url> entry per page.",
      group: "Entries",
    });
  } else if (stats.total > MAX_URLS) {
    checks.push({
      id: "count",
      status: "fail",
      label: `Over the 50,000-entry limit (${stats.total.toLocaleString()})`,
      detail: "A single sitemap may contain at most 50,000 URLs and 50 MB uncompressed.",
      fix: "Split the URLs across multiple sitemap files and list them in a <sitemapindex>, then submit the index instead.",
      group: "Entries",
    });
  } else {
    checks.push({
      id: "count",
      status: "pass",
      label: `${stats.total.toLocaleString()} ${stats.isIndex ? "child sitemap" : "URL"}${stats.total === 1 ? "" : "s"}: within the 50,000 limit`,
      ...(stats.total > WARN_URLS
        ? { detail: "Approaching the 50,000-entry ceiling: plan to split soon." }
        : {}),
      group: "Entries",
    });
  }

  // 4. Size ceiling (50 MB uncompressed).
  if (stats.bytes > 50 * 1024 * 1024) {
    checks.push({
      id: "size",
      status: "fail",
      label: `File is ${formatBytes(stats.bytes)}: over the 50 MB limit`,
      detail: "Sitemaps must be 50 MB or smaller uncompressed.",
      fix: "Split into multiple smaller sitemaps behind a sitemap index.",
      group: "Entries",
    });
  }

  // 5. Missing <loc>, pull from the engine's authoritative error.
  const missingLoc = result.errors.find((e) => e.includes("missing a <loc>"));
  if (missingLoc) {
    checks.push({
      id: "loc",
      status: "fail",
      label: missingLoc,
      detail: stats.isIndex
        ? "Every <sitemap> must contain exactly one non-empty <loc>."
        : "Every <url> must contain exactly one non-empty <loc>.",
      fix: "Add a <loc>https://example.com/page</loc> to each entry that lacks one. Empty or whitespace-only <loc> tags count as missing.",
      group: "Entries",
    });
  } else if (stats.total > 0) {
    checks.push({
      id: "loc",
      status: "pass",
      label: "Every entry has a <loc>",
      group: "Entries",
    });
  }

  // 6. HTTPS coverage.
  if (stats.total > 0) {
    if (stats.nonHttps > 0) {
      checks.push({
        id: "https",
        status: "warn",
        label: `${stats.nonHttps} location${stats.nonHttps === 1 ? " is" : "s are"} not HTTPS`,
        detail: `${stats.https}/${stats.total} locations use https://.`,
        fix: "List the https:// version of each URL. Search engines expect canonical URLs to be served securely.",
        group: "Locations",
      });
    } else {
      checks.push({
        id: "https",
        status: "pass",
        label: "All locations use HTTPS",
        group: "Locations",
      });
    }
  }

  // 7. changefreq / priority validity (only meaningful for a urlset).
  if (!stats.isIndex && stats.total > 0) {
    if (stats.badFreqs.length) {
      checks.push({
        id: "changefreq",
        status: "warn",
        label: `Invalid changefreq value${stats.badFreqs.length === 1 ? "" : "s"}`,
        detail: `Found: ${stats.badFreqs.join(", ")}.`,
        fix: "changefreq must be exactly one of: always, hourly, daily, weekly, monthly, yearly, never (lowercase).",
        group: "Optional fields",
      });
    }
    if (stats.badPriorities.length) {
      checks.push({
        id: "priority",
        status: "warn",
        label: `Priority value${stats.badPriorities.length === 1 ? "" : "s"} out of range`,
        detail: `Found: ${stats.badPriorities.join(", ")}.`,
        fix: "priority must be a decimal between 0.0 and 1.0 (e.g. 0.8).",
        group: "Optional fields",
      });
    }
    if (!stats.badFreqs.length && !stats.badPriorities.length) {
      checks.push({
        id: "optional",
        status: "pass",
        label: "changefreq and priority values are valid",
        detail: "Where present, both fields use allowed values.",
        group: "Optional fields",
      });
    }
  }

  // 8. Any remaining engine warnings not already surfaced (defensive).
  const surfaced = new Set([
    "not HTTPS",
    'Invalid changefreq',
    "must be between 0.0 and 1.0",
    "Root element is",
    "Approaching",
  ]);
  for (const w of result.warnings) {
    if ([...surfaced].some((s) => w.includes(s))) continue;
    checks.push({ id: `w-${w.slice(0, 16)}`, status: "warn", label: w, group: "Notes" });
  }

  // 9. Reference preview of the locations found.
  if (stats.sampleLocs.length) {
    checks.push({
      id: "preview",
      status: "info",
      label: "Locations found",
      detail: <LocPreview locs={stats.sampleLocs} isIndex={stats.isIndex} />,
      group: "Reference",
    });
  }

  const errorCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const ok = result.ok && errorCount === 0;

  // Score: start at 100, subtract for each error/warning, floor at 0.
  const score = ok
    ? Math.max(80, 100 - warnCount * 6)
    : Math.max(0, 60 - errorCount * 20 - warnCount * 5);

  return {
    score,
    summary: <Summary stats={stats} ok={ok} errorCount={errorCount} />,
    checks,
  };
}

/* ----------------------------------- tool --------------------------------- */

const SAMPLE_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-06-28</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/pricing</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://example.com/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://example.com/blog/sitemaps-explained?ref=nav&amp;utm=guide</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://example.com/contact</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

export default function SitemapValidatorTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeSitemap}
        fetchable
        shareSlug="sitemap-validator"
        shareLabel="Sitemap report"
        urlPlaceholder="https://example.com/sitemap.xml"
        inputLabel="Enter a sitemap URL to fetch & validate, or paste the XML"
        placeholder={"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url><loc>https://example.com/</loc></url>\n</urlset>"}
        sample={SAMPLE_SITEMAP}
        emptyTitle="Paste a sitemap to validate it"
        emptyHint="Open your sitemap in a browser (e.g. https://example.com/sitemap.xml), copy the XML, and paste it here. It's parsed locally in your browser: nothing is uploaded. To validate straight from a URL you'd need a server we deliberately don't run, so paste the XML instead. Works on staging, internal and pre-launch sitemaps too. Handles both <urlset> sitemaps and <sitemapindex> indexes."
        emptyIcon="FileCheck2"
        accept=".xml,.txt"
      />
    </section>
  );
}
