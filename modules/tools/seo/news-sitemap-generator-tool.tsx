"use client";

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import {
  CodePane,
  Field,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import { CheckList, GeneratorWithPreview, type CheckItem } from "@/components/tool/seo";
import { generateNewsSitemap, type NewsEntry } from "@/lib/seo-tools/sitemap";
import {
  entriesToArticleLines,
  extractPageTitle,
  parseSitemapXml,
  parseUrlList,
  type SitemapImportEntry,
} from "@/lib/seo-tools/sitemap-import";
import { proxyFetchText } from "@/lib/api";
import { Icon } from "@/lib/icons";
import { Button } from "@/components/ui/button";

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The full, undo-tracked form state. Articles are entered as raw lines:
 *   url | title | publicationDate | publicationName? | language?
 * Publication name and language fall back to the site-wide defaults.
 */
interface NewsState {
  /** One article per line (pipe-separated fields). */
  articles: string;
  /** Default publication name: must match Google Publisher Center exactly. */
  publicationName: string;
  /** Default language code (e.g. en, en-GB, es). */
  language: string;
}

const INITIAL: NewsState = {
  articles: "",
  publicationName: "The Example Times",
  language: "en",
};

/* -------------------------------------------------------------------------- */
/*  Parsing                                                                   */
/* -------------------------------------------------------------------------- */

/** Google News only crawls articles published in the last ~48 hours. */
const RECENCY_MS = 48 * 60 * 60 * 1000;
/** A News sitemap may contain at most 1,000 URLs. */
const NEWS_URL_LIMIT = 1000;

interface ParsedRow {
  entry: NewsEntry;
  line: number;
  /** Parsed publication date, if it was a valid date; null if unparseable. */
  date: Date | null;
  /** True when the raw date string carried an explicit timezone. */
  hasTimezone: boolean;
  isHttps: boolean;
  /** Field-level problems that still produced an (imperfect) entry. */
  missing: string[];
}

interface ParseResult {
  rows: ParsedRow[];
  invalidLines: { line: number; text: string; reason: string }[];
  duplicates: string[];
}

/** A value is considered to have a timezone if it ends in Z or ±HH:MM. */
function hasExplicitTimezone(value: string): boolean {
  return /(?:Z|[+-]\d{2}:?\d{2})$/.test(value.trim());
}

/**
 * Parse the raw textarea into news entries. Each non-empty, non-comment line is:
 *   url | title | publicationDate | publicationName? | language?
 * Missing publication name / language fall back to the site-wide defaults.
 */
function parseArticles(state: NewsState): ParseResult {
  const rows: ParsedRow[] = [];
  const invalidLines: ParseResult["invalidLines"] = [];
  const duplicates: string[] = [];
  const seen = new Set<string>();

  const defaultName = state.publicationName.trim();
  const defaultLang = state.language.trim();

  state.articles.split(/\r?\n/).forEach((raw, idx) => {
    const lineNo = idx + 1;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const parts = trimmed.split("|").map((p) => p.trim());
    const loc = parts[0] ?? "";

    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(loc);
    } catch {
      parsedUrl = null;
    }
    if (!parsedUrl || !/^https?:$/.test(parsedUrl.protocol)) {
      invalidLines.push({
        line: lineNo,
        text: loc || trimmed,
        reason: "Not an absolute http(s) URL",
      });
      return;
    }

    const title = parts[1] ?? "";
    const dateRaw = parts[2] ?? "";
    const pubName = parts[3] ? parts[3] : defaultName;
    const lang = parts[4] ? parts[4] : defaultLang;

    if (seen.has(loc)) {
      if (!duplicates.includes(loc)) duplicates.push(loc);
    } else {
      seen.add(loc);
    }

    const missing: string[] = [];
    if (!title) missing.push("title");
    if (!dateRaw) missing.push("publication date");
    if (!pubName) missing.push("publication name");
    if (!lang) missing.push("language");

    let date: Date | null = null;
    if (dateRaw) {
      const d = new Date(dateRaw);
      date = Number.isNaN(d.getTime()) ? null : d;
    }

    rows.push({
      entry: {
        loc,
        publicationName: pubName,
        publicationLanguage: lang,
        title,
        publicationDate: dateRaw,
      },
      line: lineNo,
      date,
      hasTimezone: hasExplicitTimezone(dateRaw),
      isHttps: parsedUrl.protocol === "https:",
      missing,
    });
  });

  return { rows, invalidLines, duplicates };
}

/* -------------------------------------------------------------------------- */
/*  Examples                                                                  */
/* -------------------------------------------------------------------------- */

/** An ISO timestamp `hoursAgo` hours before now, with a +00:00 timezone. */
function isoHoursAgo(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  // Emit as YYYY-MM-DDTHH:MM:SS+00:00 in UTC.
  return `${d.toISOString().replace(/\.\d{3}Z$/, "")}+00:00`;
}

const EXAMPLES: ReadonlyArray<Example<NewsState>> = [
  {
    label: "Breaking news",
    description: "A few fresh stories from one publication",
    icon: "Newspaper",
    value: {
      publicationName: "The Example Times",
      language: "en",
      articles: [
        `https://news.example.com/2026/markets-rally | Markets rally on rate news | ${isoHoursAgo(2)}`,
        `https://news.example.com/2026/election-update | Election update: turnout climbs | ${isoHoursAgo(6)}`,
        `https://news.example.com/2026/tech-launch | Major tech launch draws crowds | ${isoHoursAgo(20)}`,
      ].join("\n"),
    },
  },
  {
    label: "Multilingual newsroom",
    description: "Same domain, per-article language override",
    icon: "Languages",
    value: {
      publicationName: "Example Global",
      language: "en",
      articles: [
        `https://example.com/en/summit | Leaders meet at annual summit | ${isoHoursAgo(3)}`,
        `https://example.com/fr/sommet | Les dirigeants au sommet annuel | ${isoHoursAgo(3)} | Example Global | fr`,
        `https://example.com/es/cumbre | Líderes en la cumbre anual | ${isoHoursAgo(4)} | Example Global | es`,
      ].join("\n"),
    },
  },
  {
    label: "Multi-brand network",
    description: "Per-article publication name override",
    icon: "Building2",
    value: {
      publicationName: "City Herald",
      language: "en",
      articles: [
        `https://media.example.com/herald/city-budget | City passes new budget | ${isoHoursAgo(5)}`,
        `https://media.example.com/sport/derby-preview | Derby preview: form guide | ${isoHoursAgo(8)} | Example Sport`,
        `https://media.example.com/biz/quarterly | Quarterly results beat forecasts | ${isoHoursAgo(12)} | Example Business`,
      ].join("\n"),
    },
  },
];

const SAMPLE_PLACEHOLDER = [
  "https://news.example.com/2026/story-slug | Your headline here | 2026-07-01T09:30:00+00:00",
  "https://news.example.com/2026/other | Another headline | 2026-07-01T11:00:00+00:00 | Other Title | en-GB",
  "# url | title | publication date (with timezone) | publication name? | language?",
].join("\n");

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function NewsSitemapGeneratorTool(_props: ImageToolProps) {
  const [state, setState] = React.useState<NewsState>(INITIAL);

  const set = React.useCallback(<K extends keyof NewsState>(key: K, value: NewsState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const { code, checks, stats, error } = React.useMemo(() => {
    const parsed = parseArticles(state);
    const xml = parsed.rows.length
      ? generateNewsSitemap(parsed.rows.map((r) => r.entry))
      : "";

    const total = parsed.rows.length;
    const now = Date.now();

    const stale = parsed.rows.filter((r) => r.date !== null && now - r.date.getTime() > RECENCY_MS);
    const badDates = parsed.rows.filter((r) => r.entry.publicationDate !== "" && r.date === null);
    const noTz = parsed.rows.filter((r) => r.date !== null && !r.hasTimezone);
    const nonHttps = parsed.rows.filter((r) => !r.isHttps);
    const incomplete = parsed.rows.filter((r) => r.missing.length > 0);

    const checkItems: CheckItem[] = [];

    if (total === 0) {
      checkItems.push({
        status: "info",
        label: "No articles yet",
        detail: "Add one article per line: url | title | publication date | publication name? | language?",
      });
    } else {
      checkItems.push({
        status: "pass",
        label: `${total} article${total === 1 ? "" : "s"} in the sitemap`,
        detail: "Each becomes one <url> with a <news:news> block.",
      });
    }

    // Missing publication defaults are worth surfacing even before articles exist.
    if (!state.publicationName.trim()) {
      checkItems.push({
        status: "fail",
        label: "No default publication name",
        detail: "Google requires <news:name> on every article.",
        fix: "Set the publication name exactly as it appears in Google Publisher Center, or provide it per article as the 4th field.",
      });
    }
    if (!state.language.trim()) {
      checkItems.push({
        status: "fail",
        label: "No default language",
        detail: "Google requires <news:language> on every article.",
        fix: "Set a language code such as en, en-GB or es, or provide it per article as the 5th field.",
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
        fix: "Every line must start with an absolute URL like https://news.example.com/story. Use '#' to comment a line out.",
      });
    }

    if (incomplete.length) {
      const preview = incomplete
        .slice(0, 3)
        .map((r) => `line ${r.line}: missing ${r.missing.join(", ")}`)
        .join("; ");
      checkItems.push({
        status: "fail",
        label: `${incomplete.length} article${incomplete.length === 1 ? "" : "s"} missing required fields`,
        detail: preview + (incomplete.length > 3 ? "; …" : ""),
        fix: "Google News requires a title, publication date, publication name and language on every article.",
      });
    }

    if (badDates.length) {
      checkItems.push({
        status: "fail",
        label: `${badDates.length} unparseable publication date${badDates.length === 1 ? "" : "s"}`,
        detail: `First at line ${badDates[0]?.line}. Dates must be W3C / ISO 8601.`,
        fix: "Use 2026-07-01 or a full timestamp with a timezone, e.g. 2026-07-01T09:30:00+00:00.",
      });
    }

    if (stale.length) {
      checkItems.push({
        status: "warn",
        label: `${stale.length} article${stale.length === 1 ? " is" : "s are"} older than 48 hours`,
        detail: "Google News only crawls articles published in the last two days. These will be ignored.",
        fix: "Remove stale URLs and regenerate with only your most recent articles.",
      });
    } else if (total > 0 && badDates.length === 0) {
      checkItems.push({ status: "pass", label: "All articles are within the 48-hour window" });
    }

    if (noTz.length) {
      checkItems.push({
        status: "warn",
        label: `${noTz.length} date${noTz.length === 1 ? "" : "s"} without a timezone`,
        detail: "A date like 2026-07-01 works, but timestamps should carry a timezone for accurate freshness.",
        fix: "Append a timezone offset, e.g. …T09:30:00+00:00, so Google reads freshness correctly across regions.",
      });
    }

    if (nonHttps.length) {
      checkItems.push({
        status: "warn",
        label: `${nonHttps.length} URL${nonHttps.length === 1 ? " is" : "s are"} not HTTPS`,
        fix: "Serve and list the https:// version of each article.",
      });
    } else if (total > 0) {
      checkItems.push({ status: "pass", label: "All URLs use HTTPS" });
    }

    if (parsed.duplicates.length) {
      checkItems.push({
        status: "warn",
        label: `${parsed.duplicates.length} duplicate URL${parsed.duplicates.length === 1 ? "" : "s"}`,
        detail: parsed.duplicates.slice(0, 3).join(", ") + (parsed.duplicates.length > 3 ? ", …" : ""),
        fix: "List each article URL once.",
      });
    }

    if (total > NEWS_URL_LIMIT) {
      checkItems.push({
        status: "fail",
        label: `Over the 1,000-URL News limit (${total})`,
        detail: "A Google News sitemap may contain at most 1,000 URLs.",
        fix: "Split into multiple News sitemaps and reference them from a <sitemapindex>, or trim to your most important recent stories.",
      });
    } else if (total > 900) {
      checkItems.push({
        status: "warn",
        label: `Approaching the 1,000-URL News limit (${total})`,
        detail: "Plan to split into multiple News sitemaps soon.",
      });
    }

    // Hard, blocking errors surfaced above the panes.
    const hardError =
      total > NEWS_URL_LIMIT
        ? "This News sitemap exceeds the 1,000-URL limit. Split it into multiple News sitemaps and use a sitemap index."
        : !state.publicationName.trim() && total > 0
          ? "Set a default publication name (or provide one per article): <news:name> is required on every article."
          : null;

    const bytes = xml ? new TextEncoder().encode(xml).length : 0;
    const freshCount = total - stale.length - badDates.length;

    const statNodes = (
      <>
        <StatBadge label="Articles" value={total} icon="Newspaper" tone={total ? "info" : "default"} />
        <StatBadge
          label="Fresh"
          value={total ? `${Math.max(0, freshCount)}/${total}` : "0/0"}
          icon="Clock"
          tone={total === 0 ? "default" : stale.length || badDates.length ? "warning" : "success"}
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

    return { code: xml, checks: checkItems, stats: statNodes, error: hardError };
  }, [state]);

  /* ------------------------------ auto-import ----------------------------- */
  // Paste an existing sitemap URL or its raw XML (or a plain URL list) and the
  // articles fill themselves; optionally each page is fetched through the
  // ephemeral same-origin proxy to auto-extract its headline. Fetches are
  // capped and throttled; nothing is stored anywhere.
  const TITLE_FETCH_CAP = 30;
  const [importInput, setImportInput] = React.useState("");
  const [fetchTitles, setFetchTitles] = React.useState(true);
  const [importBusy, setImportBusy] = React.useState<string | null>(null);
  const [importNote, setImportNote] = React.useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const runImport = React.useCallback(async () => {
    const input = importInput.trim();
    if (!input) return;
    setImportNote(null);
    try {
      let entries: SitemapImportEntry[] = [];
      let xml: string | null = null;

      if (input.startsWith("<")) {
        xml = input;
      } else if (/^https?:\/\/\S+$/i.test(input)) {
        setImportBusy("Fetching sitemap…");
        xml = await proxyFetchText(input);
        if (!xml.trimStart().startsWith("<")) {
          throw new Error("That URL didn't return XML: point it at your sitemap.xml.");
        }
      } else {
        entries = parseUrlList(input);
        if (entries.length === 0) {
          throw new Error("Paste a sitemap URL, raw sitemap XML, or a list of article URLs (one per line).");
        }
      }

      if (xml) {
        const parsed = parseSitemapXml(xml);
        if (parsed.kind === "error") throw new Error(parsed.message);
        if (parsed.kind === "index") {
          throw new Error(
            `That's a sitemap index of ${parsed.childSitemaps.length} sitemaps, import one of its children, e.g. ${parsed.childSitemaps[0] ?? ""}`,
          );
        }
        entries = parsed.entries;
      }

      if (entries.length === 0) throw new Error("No URLs found in that sitemap.");
      entries = entries.slice(0, NEWS_URL_LIMIT);

      const titles = new Map<string, string>();
      if (fetchTitles) {
        const targets = entries.slice(0, TITLE_FETCH_CAP);
        let done = 0;
        const queue = [...targets];
        const workers = Array.from({ length: 3 }, async () => {
          for (;;) {
            const next = queue.shift();
            if (!next) return;
            try {
              const title = extractPageTitle(await proxyFetchText(next.url, 10000));
              if (title) titles.set(next.url, title);
            } catch { /* headline stays blank - user fills it in */ }
            done += 1;
            setImportBusy(`Fetching headlines… ${done}/${targets.length}`);
          }
        });
        setImportBusy(`Fetching headlines… 0/${targets.length}`);
        await Promise.all(workers);
      }

      set("articles", entriesToArticleLines(entries, titles));
      const titled = titles.size;
      setImportNote({
        tone: "ok",
        text:
          `Imported ${entries.length} URL${entries.length === 1 ? "" : "s"}` +
          (fetchTitles ? ` · ${titled} headline${titled === 1 ? "" : "s"} auto-filled` : "") +
          (entries.length > TITLE_FETCH_CAP && fetchTitles ? ` (headlines fetched for the first ${TITLE_FETCH_CAP})` : "") +
          " - review dates and fill any blank headlines below.",
      });
    } catch (e) {
      setImportNote({ tone: "err", text: e instanceof Error ? e.message : "Import failed." });
    } finally {
      setImportBusy(null);
    }
  }, [importInput, fetchTitles, set]);

  /* --------------------------------- form -------------------------------- */

  const form = (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon name="Import" size={16} />
          Auto-import from your existing sitemap
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your sitemap URL, its raw XML, or a plain list of article URLs: the
          articles below fill themselves.
        </p>
        <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
          <input
            type="text"
            value={importInput}
            onChange={(e) => setImportInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void runImport(); }}
            placeholder="https://your-site.com/sitemap.xml, or paste the XML itself"
            aria-label="Sitemap URL or XML to import"
            className="h-10 w-full flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button onClick={() => void runImport()} disabled={!importInput.trim() || importBusy !== null}>
            {importBusy ? (
              <>
                <Icon name="LoaderCircle" size={16} className="animate-spin" />
                {importBusy}
              </>
            ) : (
              <>
                <Icon name="Download" size={16} />
                Import
              </>
            )}
          </Button>
        </div>
        <label className="mt-2.5 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={fetchTitles}
            onChange={(e) => setFetchTitles(e.target.checked)}
            className="size-4 accent-primary"
          />
          Also fetch each page's headline (first {TITLE_FETCH_CAP} URLs)
        </label>
        {importNote ? (
          <p
            role="status"
            className={
              importNote.tone === "ok"
                ? "mt-2 text-sm text-foreground"
                : "mt-2 text-sm text-destructive"
            }
          >
            {importNote.text}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Default publication name"
          htmlFor="news-pub"
          hint="Must match your name in Google Publisher Center exactly."
        >
          <input
            id="news-pub"
            type="text"
            value={state.publicationName}
            onChange={(e) => set("publicationName", e.target.value)}
            placeholder="The Example Times"
            className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>

        <Field
          label="Default language"
          htmlFor="news-lang"
          hint="ISO language code: en, en-GB, es, fr, de…"
        >
          <input
            id="news-lang"
            type="text"
            value={state.language}
            onChange={(e) => set("language", e.target.value)}
            placeholder="en"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>
      </div>

      <Field
        label="Articles, one per line"
        htmlFor="news-articles"
        hint="url | title | publication date | publication name? | language?: the last two fall back to the defaults above. Lines starting with # are ignored."
      >
        <CodePane
          id="news-articles"
          value={state.articles}
          onChange={(v) => set("articles", v)}
          onDropText={(text) => set("articles", state.articles ? `${state.articles}\n${text}` : text)}
          label={undefined}
          placeholder={SAMPLE_PLACEHOLDER}
          minHeight={220}
          maxHeight={420}
          lineNumbers
          ariaLabel="News articles, one per line"
        />
      </Field>
    </div>
  );

  /* -------------------------------- preview ------------------------------ */

  const preview = <CheckList items={checks} />;

  return (
    <GeneratorWithPreview<NewsState>
      value={state}
      onChange={setState}
      initialValue={INITIAL}
      code={code}
      language="XML"
      form={form}
      preview={preview}
      previewLabel="Validation"
      downloadName="news-sitemap.xml"
      downloadMime="application/xml;charset=utf-8"
      error={error}
      examples={EXAMPLES}
      serialize={(v) => JSON.stringify(v)}
      deserialize={(raw) => {
        try {
          const parsed = JSON.parse(raw) as Partial<NewsState>;
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
