"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  CodePane,
  ErrorBanner,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarSpacer,
  useShortcuts,
} from "@/components/tool/dev";
import {
  CheckList,
  ScorePanel,
  gradeForScore,
  type CheckItem,
  type Grade,
} from "./report";
import { ShareReport } from "./share-report";
import { fetchPage, headersToText, normalizeUrl, urlFetchEnabled, type FetchedPage } from "@/lib/seo-tools/fetch-url";

/**
 * The workhorse for SEO *analyzers / validators* (meta-tag analyzer, JSON-LD
 * validator, robots.txt & sitemap checkers, header/security checkers). The user
 * pastes HTML / raw headers / a sitemap / robots.txt / JSON-LD, or drops a
 * file, and a debounced `analyze` runs entirely in the browser, producing a
 * structured {@link AnalysisReport} rendered as a ScorePanel + grouped
 * CheckList. It ships an honest empty state, a one-click sample, and copy/export
 * of the report as text.
 *
 * These tools are deliberately PASTE-FIRST: live-fetching a URL needs a server
 * we don't run (privacy + CORS). The empty state says so plainly.
 */

/** The structured result an `analyze` function returns. */
export interface AnalysisReport {
  /** 0–100 score. Omit to hide the score dial (pure checklist). */
  score?: number;
  /** Letter grade; auto-derived from `score` when omitted. */
  grade?: Grade;
  /** One-line verdict shown next to the score. */
  summary?: React.ReactNode;
  /** The individual checks. */
  checks: CheckItem[];
}

/** Props for {@link PasteAnalyze}. */
export interface PasteAnalyzeProps {
  /**
   * Analyze the pasted input. Runs debounced on every change. Pure + sync or
   * async; return a report or throw to surface an error banner.
   *
   * When the input came from the URL bar, the full fetched response (headers,
   * status, final URL) is passed as the optional second argument so analyzers
   * can use response evidence (e.g. detecting Cloudflare). It is undefined for
   * pasted/typed input. Existing single-argument analyzers are unaffected.
   */
  analyze: (input: string, fetched?: FetchedPage) => AnalysisReport | Promise<AnalysisReport>;
  /** Label above the input pane, e.g. "Paste your page's HTML". */
  inputLabel?: React.ReactNode;
  /** Placeholder for the empty input. */
  placeholder?: string;
  /** A ready-to-analyze sample loaded by the "Load sample" button. */
  sample?: string;
  /** Headline for the empty state. */
  emptyTitle?: React.ReactNode;
  /** Body copy for the empty state (explain what to paste + the no-server note). */
  emptyHint?: React.ReactNode;
  /** Icon for the empty state. Default "ClipboardType". */
  emptyIcon?: string;
  /** Group check rows under their `group` label. Default true. */
  grouped?: boolean;
  /** Debounce before analyzing, in ms. Default 300. */
  debounceMs?: number;
  /** Guard: refuse to analyze past this many chars. Default 2,000,000. */
  maxInputLength?: number;
  /** File `accept` for drag/drop hint (informational). */
  accept?: string;
  /**
   * When true (and a fetch proxy is configured), show a URL bar above the input
   * so the user can enter a page URL and we fetch + analyse it. No HTML to
   * paste. Only enable for tools whose input is a fetchable page/file body
   * (HTML analyzers, robots.txt / sitemap checkers), not raw JSON-LD snippets.
   */
  fetchable?: boolean;
  /** Placeholder for the URL bar (when `fetchable`). */
  urlPlaceholder?: string;
  /**
   * Rewrite the user's URL before fetching (e.g. a robots.txt checker turning
   * "example.com" into "https://example.com/robots.txt"). Receives the
   * normalized https URL; return the URL to actually fetch.
   */
  transformFetchUrl?: (url: string) => string;
  /**
   * What the fetched URL populates into the input: the page BODY ("html" -
   * default; also right for sitemap.xml / robots.txt) or the response HEADERS
   * ("headers", for header/cache checkers, formatted as a raw header block).
   */
  fetchInto?: "html" | "headers";
  /**
   * The tool's own route slug (e.g. "meta-tag-analyzer"). When set AND the report
   * came from a fetched URL, a "Share this report" bar appears with a deep-link
   * (`/slug?url=…`) that reproduces the report for whoever opens it. Opening such
   * a link auto-fetches and re-runs. Only meaningful for `fetchable` tools.
   */
  shareSlug?: string;
  /** Human label for the shared report, e.g. "Meta tag report". */
  shareLabel?: string;
  /** Extra shortcut hints for the help dialog (unused chrome hook). */
  className?: string;
}

/** Host of a URL, sans www, for share titles. */
function hostOf(url: string): string {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Serialize a report to plain text for copy/export. */
function reportToText(report: AnalysisReport): string {
  const lines: string[] = [];
  if (report.score != null) {
    const grade = report.grade ?? gradeForScore(report.score);
    lines.push(`Score: ${Math.round(report.score)}/100  (Grade ${grade})`);
  }
  if (report.summary && typeof report.summary === "string") lines.push(report.summary);
  lines.push("");
  const symbol: Record<CheckItem["status"], string> = {
    pass: "[PASS]",
    warn: "[WARN]",
    fail: "[FAIL]",
    info: "[INFO]",
  };
  let currentGroup: string | undefined;
  for (const c of report.checks) {
    if (c.group && c.group !== currentGroup) {
      currentGroup = c.group;
      lines.push(`\n## ${c.group}`);
    }
    const label = typeof c.label === "string" ? c.label : "";
    const detail = typeof c.detail === "string" ? ` - ${c.detail}` : "";
    lines.push(`${symbol[c.status]} ${label}${detail}`);
    if (c.status !== "pass" && typeof c.fix === "string") lines.push(`    Fix: ${c.fix}`);
  }
  return lines.join("\n").trim() + "\n";
}

/** Roll up pass/warn/fail counts for the score panel breakdown. */
function tally(checks: CheckItem[]) {
  const counts = { pass: 0, warn: 0, fail: 0 };
  for (const c of checks) {
    if (c.status === "pass") counts.pass++;
    else if (c.status === "warn") counts.warn++;
    else if (c.status === "fail") counts.fail++;
  }
  return counts;
}

export function PasteAnalyze({
  analyze,
  inputLabel = "Paste to analyze",
  placeholder = "Paste your content here, or drop a file…",
  sample,
  emptyTitle = "Paste something to analyze",
  emptyHint = "Everything runs locally in your browser: nothing is uploaded. To analyze a live URL you'd need a server we deliberately don't run, so paste the source here instead.",
  emptyIcon = "ClipboardType",
  grouped = true,
  debounceMs = 300,
  maxInputLength = 2_000_000,
  accept,
  fetchable = false,
  urlPlaceholder = "https://example.com/page: we'll fetch & analyze it",
  fetchInto = "html",
  transformFetchUrl,
  shareSlug,
  shareLabel = "SEO report",
  className,
}: PasteAnalyzeProps) {
  const [input, setInput] = React.useState("");
  const [report, setReport] = React.useState<AnalysisReport | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [fetching, setFetching] = React.useState(false);
  // The URL that produced the CURRENT input (empty once the user edits/pastes),
  // so a shared deep-link only appears when it can actually reproduce the report.
  const [fetchedUrl, setFetchedUrl] = React.useState("");
  const canFetch = fetchable && urlFetchEnabled();

  // The full fetched response backing the current input (headers/status/URL),
  // handed to `analyze` as evidence. Cleared the moment the input is edited.
  const fetchedPageRef = React.useRef<FetchedPage | undefined>(undefined);

  // Manual edits (paste / drop / typing) invalidate the fetched-URL provenance.
  const setInputManual = React.useCallback((v: string) => {
    setFetchedUrl("");
    fetchedPageRef.current = undefined;
    setInput(v);
  }, []);

  const fetchFromUrl = React.useCallback(
    async (target?: string) => {
      const typed = (target ?? url).trim();
      if (!typed || fetching) return;
      const raw = transformFetchUrl ? transformFetchUrl(normalizeUrl(typed)) : typed;
      setFetching(true);
      setError(null);
      try {
        const page = await fetchPage(raw);
        // Populate the page body, or a raw header block for header checkers.
        fetchedPageRef.current = page;
        setInput(fetchInto === "headers" ? headersToText(page.status, page.headers) : page.html);
        setFetchedUrl(page.finalUrl || raw);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't fetch that URL.");
      } finally {
        setFetching(false);
      }
    },
    [url, fetching, fetchInto, transformFetchUrl],
  );

  // Deep-link: /slug?url=… auto-fetches + analyses so a shared link reproduces
  // exactly what the sender saw. Runs once, only for fetchable tools.
  const deepLinked = React.useRef(false);
  React.useEffect(() => {
    if (!canFetch || deepLinked.current || typeof window === "undefined") return;
    const param = new URLSearchParams(window.location.search).get("url");
    if (param && /^https?:\/\//i.test(param)) {
      deepLinked.current = true;
      setUrl(param);
      void fetchFromUrl(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFetch]);

  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const analyzeRef = React.useRef(analyze);
  analyzeRef.current = analyze;
  const runToken = React.useRef(0);

  const execute = React.useCallback(
    async (value: string) => {
      const token = ++runToken.current;
      const trimmed = value.trim();
      if (!trimmed) {
        setReport(null);
        setError(null);
        setBusy(false);
        return;
      }
      if (value.length > maxInputLength) {
        setReport(null);
        setError(
          `Input is ${value.length.toLocaleString()} characters, above the ${maxInputLength.toLocaleString()} limit for live analysis.`,
        );
        setBusy(false);
        return;
      }
      setBusy(true);
      try {
        const result = await analyzeRef.current(value, fetchedPageRef.current);
        if (token !== runToken.current) return;
        setReport(result);
        setError(null);
      } catch (err) {
        if (token !== runToken.current) return;
        setReport(null);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (token === runToken.current) setBusy(false);
      }
    },
    [maxInputLength],
  );

  React.useEffect(() => {
    const handle = setTimeout(() => void execute(input), debounceMs);
    return () => clearTimeout(handle);
  }, [input, debounceMs, execute]);

  const paste = React.useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputManual(text);
    } catch {
      inputRef.current?.focus();
    }
  }, [setInputManual]);

  const clear = React.useCallback(() => {
    setInputManual("");
    inputRef.current?.focus();
  }, [setInputManual]);

  const loadSample = React.useCallback(() => {
    if (sample) setInputManual(sample);
  }, [sample, setInputManual]);

  const reportText = report ? reportToText(report) : "";

  const copyReport = React.useCallback(async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
    } catch {
      /* clipboard blocked: no-op */
    }
  }, [reportText]);

  const exportReport = React.useCallback(() => {
    if (!reportText || typeof window === "undefined") return;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seo-report.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }, [reportText]);

  useShortcuts(
    {
      "mod+k": clear,
      "mod+enter": () => void execute(input),
    },
    { allowInInputs: true },
  );

  const counts = report ? tally(report.checks) : null;
  const shareLink =
    shareSlug && fetchedUrl && typeof window !== "undefined"
      ? `${window.location.origin}/${shareSlug}?url=${encodeURIComponent(fetchedUrl)}`
      : "";

  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      {/* Input column */}
      <div className="flex min-w-0 flex-col gap-3">
        {canFetch && (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
                <Icon name="Link" size={15} className="shrink-0 text-muted-foreground" />
                <input
                  type="url"
                  inputMode="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void fetchFromUrl();
                    }
                  }}
                  placeholder={urlPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => void fetchFromUrl()}
                disabled={fetching || !url.trim()}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon name={fetching ? "LoaderCircle" : "Search"} size={15} className={fetching ? "animate-spin" : ""} />
                Fetch
              </button>
            </div>
            <p className="flex items-center gap-1.5 px-0.5 text-[11px] text-muted-foreground">
              <Icon name="ShieldCheck" size={12} className="shrink-0 text-primary" />
              Enter a URL and we fetch it on our edge, analyse it in your browser, and store nothing, or paste the source below.
            </p>
          </div>
        )}

        <Toolbar>
          <ToolbarGroup>
            <ToolbarButton icon="ClipboardPaste" label="Paste" onClick={paste} />
            {sample && (
              <ToolbarButton icon="FlaskConical" label="Load sample" onClick={loadSample} />
            )}
          </ToolbarGroup>
          <ToolbarSpacer />
          <ToolbarButton
            icon="Trash2"
            label="Clear"
            kbd="mod+k"
            variant="destructive"
            onClick={clear}
            disabled={!input}
          />
        </Toolbar>

        <CodePane
          ref={inputRef}
          value={input}
          onChange={setInputManual}
          label={
            <span className="flex items-center gap-2">
              {inputLabel}
              {busy && (
                <span className="text-[10px] uppercase tracking-wide opacity-70">analyzing…</span>
              )}
            </span>
          }
          placeholder={placeholder}
          lineNumbers
          onDropText={setInputManual}
          minHeight={320}
          maxHeight={620}
        />
        {accept && (
          <p className="text-sm text-muted-foreground">
            <Icon name="Upload" size={12} className="mr-1 inline" />
            Tip: drag a file ({accept}) onto the editor to load it.
          </p>
        )}
      </div>

      {/* Report column */}
      <div className="flex min-w-0 flex-col gap-3">
        <Toolbar>
          <span className="px-1.5 text-sm font-medium text-foreground">Report</span>
          <ToolbarSpacer />
          <ToolbarGroup>
            <ToolbarButton
              icon="Copy"
              label="Copy report"
              onClick={copyReport}
              disabled={!report}
            />
            <ToolbarDivider />
            <ToolbarButton
              icon="Download"
              label="Export"
              onClick={exportReport}
              disabled={!report}
            />
          </ToolbarGroup>
        </Toolbar>

        <ErrorBanner error={error} />

        {report ? (
          <div className="flex flex-col gap-4">
            {report.score != null && (
              <ScorePanel
                score={report.score}
                grade={report.grade}
                summary={report.summary}
                counts={counts ?? undefined}
              />
            )}
            <CheckList items={report.checks} grouped={grouped} />
            {shareLink ? (
              <ShareReport
                url={shareLink}
                title={`${shareLabel}, ${hostOf(fetchedUrl)}`}
                text={`${shareLabel} for ${hostOf(fetchedUrl)} (via GigAI)`}
                onDownload={exportReport}
                downloadLabel="Download report (.txt)"
              />
            ) : null}
          </div>
        ) : (
          <EmptyState
            title={emptyTitle}
            hint={emptyHint}
            icon={emptyIcon}
            onSample={sample ? loadSample : undefined}
          />
        )}
      </div>
    </div>
  );
}

/** Honest empty state with an optional "try a sample" affordance. */
function EmptyState({
  title,
  hint,
  icon,
  onSample,
}: {
  title: React.ReactNode;
  hint: React.ReactNode;
  icon: string;
  onSample?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>
      {onSample && (
        <button
          type="button"
          onClick={onSample}
          className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="FlaskConical" size={14} />
          Try a sample
        </button>
      )}
    </div>
  );
}
