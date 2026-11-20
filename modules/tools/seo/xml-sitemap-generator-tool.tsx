"use client";

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import {
  CodePane,
  Field,
  SegmentedControl,
  SelectField,
  StatBadge,
  type Example,
  type SelectOption,
} from "@/components/tool/dev";
import { CheckList, GeneratorWithPreview, type CheckItem } from "@/components/tool/seo";
import {
  CHANGE_FREQS,
  generateXmlSitemap,
  validateSitemap,
  type ChangeFreq,
  type SitemapUrl,
} from "@/lib/seo-tools/sitemap";

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

/** How the site-wide `lastmod` is filled in. */
type LastmodMode = "off" | "today" | "fixed";

/** The full, undo-tracked form state. */
interface SitemapState {
  /** Raw textarea: one URL per line, optional `| freq | priority | lastmod`. */
  urls: string;
  /** Default change frequency ("" = omit). */
  changefreq: ChangeFreq | "";
  /** Default priority ("" = omit). */
  priority: string;
  /** Where the default lastmod comes from. */
  lastmodMode: LastmodMode;
  /** The fixed date used when `lastmodMode === "fixed"` (YYYY-MM-DD). */
  lastmodFixed: string;
}

const PRIORITY_OPTIONS: ReadonlyArray<SelectOption<string>> = [
  { value: "", label: "- none -" },
  { value: "1.0", label: "1.0 (highest)" },
  { value: "0.9", label: "0.9" },
  { value: "0.8", label: "0.8 (default)" },
  { value: "0.7", label: "0.7" },
  { value: "0.6", label: "0.6" },
  { value: "0.5", label: "0.5 (medium)" },
  { value: "0.3", label: "0.3" },
  { value: "0.1", label: "0.1 (lowest)" },
];

const FREQ_OPTIONS: ReadonlyArray<SelectOption<ChangeFreq | "">> = [
  { value: "", label: "- none -" },
  ...CHANGE_FREQS.map((f) => ({ value: f, label: f })),
];

/** Today's date as YYYY-MM-DD (local). */
function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const INITIAL: SitemapState = {
  urls: "",
  changefreq: "weekly",
  priority: "0.8",
  lastmodMode: "off",
  lastmodFixed: todayIso(),
};

/* -------------------------------------------------------------------------- */
/*  Parsing                                                                   */
/* -------------------------------------------------------------------------- */

const VALID_FREQS = new Set<string>(CHANGE_FREQS);

interface ParsedRow {
  url: SitemapUrl;
  /** 1-based line number in the input, for error messaging. */
  line: number;
}

interface ParseResult {
  rows: ParsedRow[];
  /** Lines that could not be parsed into a URL. */
  invalidLines: { line: number; text: string; reason: string }[];
  /** Distinct duplicate `loc` values (first occurrence excluded). */
  duplicates: string[];
  nonHttps: number;
}

/**
 * Parse the raw textarea into sitemap URLs. Each non-empty line is one URL,
 * with optional pipe-separated overrides: `loc | changefreq | priority | lastmod`.
 * Blank lines and `#` comments are ignored. Defaults are applied here so the
 * generated XML and the validation both see the same resolved values.
 */
function parseUrls(state: SitemapState): ParseResult {
  const rows: ParsedRow[] = [];
  const invalidLines: ParseResult["invalidLines"] = [];
  const duplicates: string[] = [];
  const seen = new Set<string>();
  let nonHttps = 0;

  const defaultLastmod =
    state.lastmodMode === "today"
      ? todayIso()
      : state.lastmodMode === "fixed"
        ? state.lastmodFixed.trim()
        : "";

  const lines = state.urls.split(/\r?\n/);
  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const [locRaw, freqRaw, prioRaw, lastmodRaw] = trimmed.split("|").map((p) => p.trim());
    const loc = locRaw ?? "";

    // Best-effort URL validation: accept anything the URL constructor accepts
    // with an http(s) scheme. Anything else is surfaced as an invalid line.
    let parsed: URL | null = null;
    try {
      parsed = new URL(loc);
    } catch {
      parsed = null;
    }
    if (!parsed || !/^https?:$/.test(parsed.protocol)) {
      invalidLines.push({
        line: lineNo,
        text: loc || trimmed,
        reason: "Not an absolute http(s) URL",
      });
      return;
    }

    if (parsed.protocol !== "https:") nonHttps += 1;

    if (seen.has(loc)) {
      if (!duplicates.includes(loc)) duplicates.push(loc);
    } else {
      seen.add(loc);
    }

    // Resolve overrides against the site-wide defaults.
    const freq: ChangeFreq | undefined =
      freqRaw && VALID_FREQS.has(freqRaw)
        ? (freqRaw as ChangeFreq)
        : state.changefreq || undefined;

    const priority = prioRaw !== undefined && prioRaw !== "" ? prioRaw : state.priority || undefined;
    const lastmod = lastmodRaw !== undefined && lastmodRaw !== "" ? lastmodRaw : defaultLastmod || undefined;

    rows.push({
      url: {
        loc,
        ...(freq ? { changefreq: freq } : {}),
        ...(priority ? { priority } : {}),
        ...(lastmod ? { lastmod } : {}),
      },
      line: lineNo,
    });
  });

  return { rows, invalidLines, duplicates, nonHttps };
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
        "https://example.com/blog",
        "https://example.com/contact",
      ].join("\n"),
      changefreq: "weekly",
      priority: "0.8",
      lastmodMode: "off",
      lastmodFixed: todayIso(),
    },
  },
  {
    label: "Per-URL overrides",
    description: "Homepage 1.0/daily, blog weekly, terms yearly",
    icon: "SlidersHorizontal",
    value: {
      urls: [
        "https://example.com/ | daily | 1.0",
        "https://example.com/blog | weekly | 0.7",
        "https://example.com/blog/launch | monthly | 0.6 | 2026-06-30",
        "https://example.com/terms | yearly | 0.3",
      ].join("\n"),
      changefreq: "monthly",
      priority: "0.5",
      lastmodMode: "today",
      lastmodFixed: todayIso(),
    },
  },
  {
    label: "Blog with dated posts",
    description: "Fixed lastmod dates per article",
    icon: "Calendar",
    value: {
      urls: [
        "https://blog.example.com/ | weekly | 0.9",
        "https://blog.example.com/2026/sitemaps-guide | monthly | 0.8 | 2026-06-28",
        "https://blog.example.com/2026/crawl-budget | monthly | 0.8 | 2026-06-15",
        "https://blog.example.com/2026/robots-txt | monthly | 0.7 | 2026-05-30",
      ].join("\n"),
      changefreq: "monthly",
      priority: "0.7",
      lastmodMode: "off",
      lastmodFixed: todayIso(),
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function XmlSitemapGeneratorTool(_props: ImageToolProps) {
  const [state, setState] = React.useState<SitemapState>(INITIAL);

  const set = React.useCallback(<K extends keyof SitemapState>(key: K, value: SitemapState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  // Parse + generate + validate. Derived purely from state.
  const { code, checks, stats, error } = React.useMemo(() => {
    const parsed = parseUrls(state);
    const xml = parsed.rows.length
      ? generateXmlSitemap(parsed.rows.map((r) => r.url))
      : "";

    // Validate the generated XML (well-formedness, loc presence, limits).
    const validation = xml ? validateSitemap(xml) : null;

    const total = parsed.rows.length;
    const httpsCount = total - parsed.nonHttps;

    const checkItems: CheckItem[] = [];

    if (total === 0) {
      checkItems.push({
        status: "info",
        label: "No URLs yet",
        detail: "Paste one absolute URL per line to build your sitemap.",
      });
    } else {
      checkItems.push({
        status: "pass",
        label: `${total} URL${total === 1 ? "" : "s"} in the sitemap`,
        detail: "Each becomes one <url> entry in the <urlset>.",
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
        fix: "Every line must be an absolute URL like https://example.com/page. Fix or remove flagged lines. Use '#' to comment a line out.",
      });
    }

    if (total > 0 && parsed.nonHttps > 0) {
      checkItems.push({
        status: "warn",
        label: `${parsed.nonHttps} URL${parsed.nonHttps === 1 ? " is" : "s are"} not HTTPS`,
        detail: `${httpsCount}/${total} URLs use https://.`,
        fix: "Search engines prefer HTTPS canonical URLs. Serve and list the https:// version of each page.",
      });
    } else if (total > 0) {
      checkItems.push({
        status: "pass",
        label: "All URLs use HTTPS",
      });
    }

    if (parsed.duplicates.length) {
      checkItems.push({
        status: "warn",
        label: `${parsed.duplicates.length} duplicate URL${parsed.duplicates.length === 1 ? "" : "s"}`,
        detail: parsed.duplicates.slice(0, 3).join(", ") + (parsed.duplicates.length > 3 ? ", …" : ""),
        fix: "List each canonical URL once. Duplicate <loc> entries add no value and can waste crawl budget.",
      });
    }

    if (total > 50000) {
      checkItems.push({
        status: "fail",
        label: `Over the 50,000-URL limit (${total})`,
        detail: "A single sitemap may contain at most 50,000 URLs (and 50 MB uncompressed).",
        fix: "Split the URLs into multiple sitemap files and reference them from a <sitemapindex>, then submit the index.",
      });
    } else if (total > 45000) {
      checkItems.push({
        status: "warn",
        label: `Approaching the 50,000-URL limit (${total})`,
        detail: "Plan to split into multiple sitemaps with a sitemap index soon.",
      });
    }

    if (validation) {
      if (validation.ok) {
        checkItems.push({ status: "pass", label: "Output is well-formed, valid sitemap XML" });
      }
      for (const e of validation.errors) checkItems.push({ status: "fail", label: e });
      for (const w of validation.warnings.slice(0, 3))
        checkItems.push({ status: "warn", label: w });
    }

    // Blocking error surfaced above the panes (only for hard failures).
    const hardError =
      total > 50000
        ? "This sitemap exceeds the 50,000-URL protocol limit. Split it into multiple sitemaps and use a sitemap index."
        : null;

    const bytes = xml ? new TextEncoder().encode(xml).length : 0;

    const statNodes = (
      <>
        <StatBadge label="URLs" value={total} icon="ListOrdered" tone={total ? "info" : "default"} />
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
          <StatBadge
            label="Skipped"
            value={parsed.invalidLines.length}
            icon="TriangleAlert"
            tone="danger"
          />
        )}
        <StatBadge
          label="Size"
          value={bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`}
          icon="FileCode"
        />
      </>
    );

    return { code: xml, checks: checkItems, stats: statNodes, error: hardError };
  }, [state]);

  /* --------------------------------- form -------------------------------- */

  const form = (
    <div className="flex flex-col gap-4">
      <Field
        label="URLs, one per line"
        htmlFor="sitemap-urls"
        hint="Optional per-URL overrides: url | changefreq | priority | lastmod. Lines starting with # are ignored."
      >
        <CodePane
          id="sitemap-urls"
          value={state.urls}
          onChange={(v) => set("urls", v)}
          onDropText={(text) =>
            set("urls", state.urls ? `${state.urls}\n${text}` : text)
          }
          label={undefined}
          placeholder={"https://example.com/\nhttps://example.com/pricing | daily | 1.0\nhttps://example.com/blog | weekly | 0.7 | 2026-06-30"}
          minHeight={220}
          maxHeight={420}
          lineNumbers
          ariaLabel="Sitemap URLs, one per line"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Default changefreq" hint="How often, on average, pages change. Advisory only.">
          <SelectField<ChangeFreq | "">
            value={state.changefreq}
            onChange={(v) => set("changefreq", v)}
            options={FREQ_OPTIONS}
            ariaLabel="Default change frequency"
            className="w-full"
          />
        </Field>

        <Field label="Default priority" hint="Importance relative to your other pages (0.0–1.0). Advisory only.">
          <SelectField<string>
            value={state.priority}
            onChange={(v) => set("priority", v)}
            options={PRIORITY_OPTIONS}
            ariaLabel="Default priority"
            className="w-full"
          />
        </Field>
      </div>

      <Field label="Default lastmod" hint="How the last-modified date is filled in when a URL has no per-line override.">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl<LastmodMode>
            value={state.lastmodMode}
            onChange={(v) => set("lastmodMode", v)}
            ariaLabel="Last modified mode"
            options={[
              { value: "off", label: "Off" },
              { value: "today", label: "Today", icon: "CalendarClock" },
              { value: "fixed", label: "Fixed date", icon: "Calendar" },
            ]}
          />
          {state.lastmodMode === "fixed" && (
            <input
              type="date"
              aria-label="Fixed last-modified date"
              value={state.lastmodFixed}
              onChange={(e) => set("lastmodFixed", e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          )}
        </div>
      </Field>
    </div>
  );

  /* -------------------------------- preview ------------------------------ */

  const preview = <CheckList items={checks} />;

  return (
    <GeneratorWithPreview<SitemapState>
      value={state}
      onChange={setState}
      initialValue={INITIAL}
      code={code}
      language="XML"
      form={form}
      preview={preview}
      previewLabel="Validation"
      downloadName="sitemap.xml"
      downloadMime="application/xml;charset=utf-8"
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
