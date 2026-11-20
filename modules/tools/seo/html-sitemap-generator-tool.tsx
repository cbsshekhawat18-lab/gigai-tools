"use client";

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import {
  CodePane,
  Field,
  SegmentedControl,
  StatBadge,
  Toggle,
  type Example,
} from "@/components/tool/dev";
import { CheckList, GeneratorWithPreview, type CheckItem } from "@/components/tool/seo";
import { generateHtmlSitemap } from "@/lib/seo-tools/sitemap";

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

/** Emit only the semantic <ul>, or a complete standalone HTML page. */
type OutputMode = "fragment" | "page";

/** The full, undo-tracked form state. */
interface SitemapState {
  /** Raw textarea: one URL per line, `#` comments and blanks ignored. */
  urls: string;
  /** Whether to wrap the list in a full, styled HTML document. */
  mode: OutputMode;
  /** Page <title> / heading, used only in "page" mode. */
  pageTitle: string;
  /** Whether to prefix each link label with the full path for clarity. */
  showFullPath: boolean;
}

const INITIAL: SitemapState = {
  urls: "",
  mode: "fragment",
  pageTitle: "Sitemap",
  showFullPath: false,
};

/* -------------------------------------------------------------------------- */
/*  Parsing                                                                   */
/* -------------------------------------------------------------------------- */

interface ParseResult {
  /** Cleaned, valid absolute URLs, in input order, de-duplicated. */
  urls: string[];
  /** Lines that could not be parsed into an absolute http(s) URL. */
  invalidLines: { line: number; text: string }[];
  /** Distinct duplicate URLs (first occurrence kept, rest reported). */
  duplicates: string[];
  /** Count of parsed URLs that are not HTTPS. */
  nonHttps: number;
  /** Distinct top-level path segments (e.g. "blog", "docs"). */
  sections: string[];
  /** Deepest path nesting seen (number of segments). */
  maxDepth: number;
}

/**
 * Parse the raw textarea into a de-duplicated list of absolute http(s) URLs.
 * Blank lines and `#` comments are ignored. Invalid lines and duplicates are
 * surfaced for the validation panel rather than silently dropped.
 */
function parseUrls(raw: string): ParseResult {
  const urls: string[] = [];
  const invalidLines: ParseResult["invalidLines"] = [];
  const duplicates: string[] = [];
  const seen = new Set<string>();
  const sections = new Set<string>();
  let nonHttps = 0;
  let maxDepth = 0;

  const lines = raw.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    let parsed: URL | null = null;
    try {
      parsed = new URL(trimmed);
    } catch {
      parsed = null;
    }
    if (!parsed || !/^https?:$/.test(parsed.protocol)) {
      invalidLines.push({ line: idx + 1, text: trimmed });
      return;
    }

    if (seen.has(trimmed)) {
      if (!duplicates.includes(trimmed)) duplicates.push(trimmed);
      return;
    }
    seen.add(trimmed);

    if (parsed.protocol !== "https:") nonHttps += 1;

    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length > maxDepth) maxDepth = segments.length;
    const first = segments[0];
    if (first) sections.add(first);

    urls.push(trimmed);
  });

  return {
    urls,
    invalidLines,
    duplicates,
    nonHttps,
    sections: [...sections],
    maxDepth,
  };
}

/* -------------------------------------------------------------------------- */
/*  Output                                                                    */
/* -------------------------------------------------------------------------- */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * When `showFullPath` is on, rewrite the plain-segment anchor labels produced
 * by `generateHtmlSitemap` to the full pathname of each URL, so links read as
 * `/blog/2026/guide` instead of just `guide`. The engine escapes the href, so
 * we match on the escaped href to find each anchor.
 */
function withFullPathLabels(fragment: string, urls: string[]): string {
  let out = fragment;
  for (const u of urls) {
    let path = "/";
    try {
      const parsed = new URL(u);
      path = parsed.pathname === "" ? "/" : parsed.pathname;
    } catch {
      path = u;
    }
    const escapedHref = escapeHtml(u);
    const anchorOpen = `<a href="${escapedHref}">`;
    const start = out.indexOf(anchorOpen);
    if (start === -1) continue;
    const labelStart = start + anchorOpen.length;
    const labelEnd = out.indexOf("</a>", labelStart);
    if (labelEnd === -1) continue;
    out = out.slice(0, labelStart) + escapeHtml(path) + out.slice(labelEnd);
  }
  return out;
}

const PAGE_STYLES = `    :root { color-scheme: light dark; }
    body {
      font: 16px/1.6 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.25rem; color: #1e293b;
    }
    h1 { font-size: 1.6rem; margin: 0 0 1.5rem; }
    ul.html-sitemap, ul.html-sitemap ul { list-style: none; margin: 0; padding-left: 1.25rem; }
    ul.html-sitemap { padding-left: 0; }
    ul.html-sitemap li { margin: 0.3rem 0; position: relative; }
    ul.html-sitemap ul { border-left: 1px solid #e2e8f0; margin-left: 0.35rem; }
    ul.html-sitemap a { color: #0369a1; text-decoration: none; }
    ul.html-sitemap a:hover { text-decoration: underline; }
    @media (prefers-color-scheme: dark) {
      body { color: #e2e8f0; background: #0f172a; }
      ul.html-sitemap ul { border-left-color: #334155; }
      ul.html-sitemap a { color: #38bdf8; }
    }`;

function buildFullPage(fragment: string, title: string): string {
  const safeTitle = escapeHtml(title.trim() || "Sitemap");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <style>
${PAGE_STYLES}
  </style>
</head>
<body>
  <h1>${safeTitle}</h1>
${fragment
    .split("\n")
    .map((l) => (l ? `  ${l}` : l))
    .join("\n")}
</body>
</html>`;
}

/* -------------------------------------------------------------------------- */
/*  Examples                                                                  */
/* -------------------------------------------------------------------------- */

const EXAMPLES: ReadonlyArray<Example<SitemapState>> = [
  {
    label: "Small marketing site",
    description: "Homepage, product, pricing, blog, contact",
    icon: "Globe",
    value: {
      urls: [
        "https://example.com/",
        "https://example.com/product",
        "https://example.com/pricing",
        "https://example.com/about",
        "https://example.com/contact",
      ].join("\n"),
      mode: "fragment",
      pageTitle: "Sitemap",
      showFullPath: false,
    },
  },
  {
    label: "Multi-section site",
    description: "Nested blog, docs and product pages",
    icon: "FolderTree",
    value: {
      urls: [
        "https://example.com/",
        "https://example.com/blog",
        "https://example.com/blog/2026/html-sitemaps",
        "https://example.com/blog/2026/internal-linking",
        "https://example.com/docs",
        "https://example.com/docs/getting-started",
        "https://example.com/docs/api/authentication",
        "https://example.com/product/pricing",
        "https://example.com/product/features",
      ].join("\n"),
      mode: "page",
      pageTitle: "Example.com, Site Index",
      showFullPath: false,
    },
  },
  {
    label: "Docs full page",
    description: "Standalone sitemap.html with full paths",
    icon: "FileCode",
    value: {
      urls: [
        "https://docs.example.com/",
        "https://docs.example.com/guides/install",
        "https://docs.example.com/guides/configuration",
        "https://docs.example.com/reference/cli",
        "https://docs.example.com/reference/api/rest",
        "https://docs.example.com/reference/api/webhooks",
      ].join("\n"),
      mode: "page",
      pageTitle: "Documentation Sitemap",
      showFullPath: true,
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function HtmlSitemapGeneratorTool(_props: ImageToolProps) {
  const [state, setState] = React.useState<SitemapState>(INITIAL);

  const set = React.useCallback(
    <K extends keyof SitemapState>(key: K, value: SitemapState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
    },
    [],
  );

  const { code, fragment, checks, stats, error } = React.useMemo(() => {
    const parsed = parseUrls(state.urls);

    let frag = parsed.urls.length ? generateHtmlSitemap(parsed.urls) : "";
    if (frag && state.showFullPath) {
      frag = withFullPathLabels(frag, parsed.urls);
    }

    const outputCode =
      state.mode === "page" && frag ? buildFullPage(frag, state.pageTitle) : frag;

    const total = parsed.urls.length;
    const httpsCount = total - parsed.nonHttps;

    const checkItems: CheckItem[] = [];

    if (total === 0) {
      checkItems.push({
        status: "info",
        label: "No URLs yet",
        detail: "Paste one absolute URL per line to build your sitemap page.",
      });
    } else {
      checkItems.push({
        status: "pass",
        label: `${total} URL${total === 1 ? "" : "s"} in the sitemap`,
        detail: "Each becomes one linked <li> in the nested list.",
      });
    }

    if (total > 0) {
      checkItems.push({
        status: "pass",
        label: `${parsed.sections.length} top-level section${parsed.sections.length === 1 ? "" : "s"}`,
        detail: parsed.sections.length
          ? parsed.sections.slice(0, 6).join(", ") +
            (parsed.sections.length > 6 ? ", …" : "")
          : "All URLs sit at the site root.",
      });
    }

    if (parsed.invalidLines.length) {
      const preview = parsed.invalidLines
        .slice(0, 4)
        .map((l) => `line ${l.line}: ${l.text || "(empty)"}`)
        .join("; ");
      checkItems.push({
        status: "fail",
        label: `${parsed.invalidLines.length} line${parsed.invalidLines.length === 1 ? "" : "s"} skipped as invalid`,
        detail: preview + (parsed.invalidLines.length > 4 ? "; …" : ""),
        fix: "Every line must be an absolute URL like https://example.com/page. Fix or remove flagged lines, or prefix with # to comment them out.",
      });
    }

    if (total > 0 && parsed.nonHttps > 0) {
      checkItems.push({
        status: "warn",
        label: `${parsed.nonHttps} URL${parsed.nonHttps === 1 ? " is" : "s are"} not HTTPS`,
        detail: `${httpsCount}/${total} URLs use https://.`,
        fix: "Prefer HTTPS canonical URLs so your sitemap page links to the secure version of each page.",
      });
    } else if (total > 0) {
      checkItems.push({ status: "pass", label: "All URLs use HTTPS" });
    }

    if (parsed.duplicates.length) {
      checkItems.push({
        status: "warn",
        label: `${parsed.duplicates.length} duplicate URL${parsed.duplicates.length === 1 ? "" : "s"} removed`,
        detail:
          parsed.duplicates.slice(0, 3).join(", ") +
          (parsed.duplicates.length > 3 ? ", …" : ""),
        fix: "Each URL is listed once. Duplicates in your input were collapsed into a single link.",
      });
    }

    if (parsed.maxDepth > 4) {
      checkItems.push({
        status: "warn",
        label: `Deep nesting (${parsed.maxDepth} levels)`,
        detail: "Very deep trees are harder for visitors to scan.",
        fix: "Consider splitting the sitemap by top-level section so each page stays shallow and readable.",
      });
    }

    const bytes = outputCode ? new TextEncoder().encode(outputCode).length : 0;

    const statNodes = (
      <>
        <StatBadge label="URLs" value={total} icon="List" tone={total ? "info" : "default"} />
        <StatBadge
          label="Sections"
          value={parsed.sections.length}
          icon="FolderTree"
          tone={total ? "info" : "default"}
        />
        <StatBadge
          label="HTTPS"
          value={total ? `${httpsCount}/${total}` : "0/0"}
          icon="ShieldCheck"
          tone={total === 0 ? "default" : parsed.nonHttps ? "warning" : "success"}
        />
        {parsed.duplicates.length > 0 && (
          <StatBadge label="Duplicates" value={parsed.duplicates.length} icon="Copy" tone="warning" />
        )}
        {parsed.invalidLines.length > 0 && (
          <StatBadge label="Skipped" value={parsed.invalidLines.length} icon="TriangleAlert" tone="danger" />
        )}
        <StatBadge
          label="Size"
          value={bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`}
          icon="FileCode"
        />
      </>
    );

    // Only invalid lines with zero valid URLs is a hard, blocking error.
    const hardError =
      total === 0 && parsed.invalidLines.length > 0
        ? "None of the lines are valid absolute URLs. Each line must look like https://example.com/page."
        : null;

    return {
      code: outputCode,
      fragment: frag,
      checks: checkItems,
      stats: statNodes,
      error: hardError,
    };
  }, [state]);

  /* --------------------------------- form -------------------------------- */

  const form = (
    <div className="flex flex-col gap-4">
      <Field
        label="URLs: one per line"
        htmlFor="html-sitemap-urls"
        hint="Absolute URLs only (https://example.com/page). Lines starting with # are ignored. They are grouped by path automatically."
      >
        <CodePane
          id="html-sitemap-urls"
          value={state.urls}
          onChange={(v) => set("urls", v)}
          onDropText={(text) => set("urls", state.urls ? `${state.urls}\n${text}` : text)}
          label={undefined}
          placeholder={
            "https://example.com/\nhttps://example.com/blog\nhttps://example.com/blog/2026/html-sitemaps\nhttps://example.com/docs/getting-started"
          }
          minHeight={220}
          maxHeight={420}
          lineNumbers
          ariaLabel="Sitemap URLs, one per line"
        />
      </Field>

      <Field label="Output" hint="Embed just the list, or export a complete standalone page.">
        <SegmentedControl<OutputMode>
          value={state.mode}
          onChange={(v) => set("mode", v)}
          ariaLabel="Output mode"
          options={[
            { value: "fragment", label: "Fragment (<ul>)", icon: "Code" },
            { value: "page", label: "Full HTML page", icon: "FileCode" },
          ]}
        />
      </Field>

      {state.mode === "page" && (
        <Field
          label="Page title"
          htmlFor="html-sitemap-title"
          hint="Used as the document <title> and the page heading."
        >
          <input
            id="html-sitemap-title"
            type="text"
            value={state.pageTitle}
            onChange={(e) => set("pageTitle", e.target.value)}
            placeholder="Sitemap"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>
      )}

      <Field
        label="Link labels"
        hint="Show the full path (/blog/2026/guide) instead of just the last segment (guide)."
      >
        <Toggle
          checked={state.showFullPath}
          onChange={(v) => set("showFullPath", v)}
          label="Use full path as link text"
        />
      </Field>
    </div>
  );

  /* -------------------------------- preview ------------------------------ */

  const preview = (
    <div className="flex flex-col gap-4">
      {fragment ? (
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Rendered
          </div>
          <div
            className="html-sitemap-preview max-h-[320px] overflow-auto text-sm [&_a]:text-primary [&_a:hover]:underline [&_ul]:list-none [&_ul]:pl-4 [&_li]:my-1"
            // The fragment is built locally from user-pasted URLs and every
            // href/label is HTML-escaped by the engine (and by our full-path
            // relabelling), so there is no untrusted markup to inject.
            dangerouslySetInnerHTML={{ __html: fragment }}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Paste some URLs to see the rendered sitemap tree here.
        </div>
      )}
      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Checks
        </div>
        <CheckList items={checks} />
      </div>
    </div>
  );

  return (
    <GeneratorWithPreview<SitemapState>
      value={state}
      onChange={setState}
      initialValue={INITIAL}
      code={code}
      language="HTML"
      form={form}
      preview={preview}
      previewLabel="Preview & checks"
      downloadName={state.mode === "page" ? "sitemap.html" : "sitemap-fragment.html"}
      downloadMime="text/html;charset=utf-8"
      error={error}
      examples={EXAMPLES}
      serialize={(v) => JSON.stringify(v)}
      deserialize={(raw) => {
        try {
          const parsed = JSON.parse(raw) as Partial<SitemapState>;
          if (typeof parsed !== "object" || parsed === null) return null;
          return { ...INITIAL, ...parsed };
        } catch {
          return null;
        }
      }}
      stats={stats}
    />
  );
}
