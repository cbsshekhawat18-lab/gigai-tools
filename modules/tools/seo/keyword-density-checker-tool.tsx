"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  CodePane,
  Field,
  SegmentedControl,
  Toggle,
  NumberStepper,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarSpacer,
  ErrorBanner,
  useShortcuts,
  type SegmentOption,
} from "@/components/tool/dev";
import {
  keywordDensity,
  readingTime,
  type KeywordEntry,
} from "@/lib/seo-tools/content";

/**
 * Keyword Density Checker, the paste-first, live-tuned content analyzer.
 *
 * Deliberately a bespoke two-column layout (not the stock <PasteAnalyze>) so the
 * analysis options, phrase length (1/2/3-word n-grams), stopword filtering,
 * minimum word length and how many terms to show, re-run the density
 * calculation *live* as you change them, which the internally-stateful
 * <PasteAnalyze> shell can't do. The engine (`keywordDensity`, native tokeniser,
 * no network) does the counting; this component adds HTML stripping, a ranked
 * density table with an inline bar, an over-optimisation (keyword-stuffing)
 * meter, live word/unique/reading-time stats, and CSV / Markdown copy + export.
 * Everything runs in the browser. Nothing is uploaded.
 */

/* -------------------------------------------------------------------------- */
/*  Options                                                                   */
/* -------------------------------------------------------------------------- */

/** n-gram size as a segmented string value (kept as string for the control). */
type NGram = "1" | "2" | "3";

interface Options {
  /** Phrase length: 1 = single words, 2 = bigrams, 3 = trigrams. */
  ngram: NGram;
  /** Remove common English stopwords before counting. */
  filterStopwords: boolean;
  /** Ignore single words shorter than this (n=1 only). */
  minLength: number;
  /** How many ranked terms to display. */
  top: number;
}

const DEFAULT_OPTIONS: Options = {
  ngram: "1",
  filterStopwords: true,
  minLength: 3,
  top: 25,
};

const NGRAM_OPTIONS: ReadonlyArray<SegmentOption<NGram>> = [
  { value: "1", label: "1 word" },
  { value: "2", label: "2 words" },
  { value: "3", label: "3 words" },
];

/**
 * Density above this share (percent of counted terms) reads as over-optimized.
 * A guideline, not a hard rule, surfaced as a warning, never a hard error.
 */
const STUFFING_WARN = 3.5;
/** Below the warn line but worth a glance. */
const STUFFING_WATCH = 2.5;

/* -------------------------------------------------------------------------- */
/*  HTML → text                                                               */
/* -------------------------------------------------------------------------- */

/** Does this input look like HTML (so we should strip tags before counting)? */
function looksLikeHtml(input: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(input);
}

/**
 * Extract visible text from an HTML string using the native DOMParser: drop
 * <script>/<style>/<noscript>, then read the body's textContent. Falls back to
 * the raw input if parsing is unavailable or yields nothing.
 */
function htmlToText(input: string): string {
  if (typeof DOMParser === "undefined") return input;
  try {
    const doc = new DOMParser().parseFromString(input, "text/html");
    doc.querySelectorAll("script, style, noscript, template").forEach((el) => el.remove());
    const text = (doc.body?.textContent ?? "").replace(/\s+/g, " ").trim();
    return text || input;
  } catch {
    return input;
  }
}

/* -------------------------------------------------------------------------- */
/*  Sample                                                                    */
/* -------------------------------------------------------------------------- */

const SAMPLE_TEXT = `Cold brew coffee is coffee brewed with cold water over many hours instead of hot water in minutes. Because cold brew coffee never touches heat, the cold brew method extracts fewer bitter compounds, so cold brew coffee tastes smoother and less acidic than iced coffee made from a hot brew.

Making cold brew coffee at home is simple. Coarsely grind your coffee beans, combine the coffee grounds with cold water in a jar, and steep the cold brew in the fridge for twelve to eighteen hours. Strain the coffee grounds, and you have a cold brew concentrate you can dilute with water, milk or ice.

Cold brew coffee keeps in the fridge for up to two weeks, which makes cold brew a convenient coffee to batch. Whether you prefer your cold brew black or as a creamy iced coffee, learning how to make cold brew coffee at home saves money over buying cold brew at a coffee shop every day.`;

/* -------------------------------------------------------------------------- */
/*  Export helpers                                                            */
/* -------------------------------------------------------------------------- */

/** Escape a value for a CSV cell (quote + double inner quotes when needed). */
function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(entries: readonly KeywordEntry[]): string {
  const rows = ["term,count,density_percent"];
  for (const e of entries) {
    rows.push(`${csvCell(e.term)},${e.count},${e.density.toFixed(2)}`);
  }
  return rows.join("\n") + "\n";
}

function toMarkdown(entries: readonly KeywordEntry[], label: string): string {
  const rows = [`| # | ${label} | Count | Density |`, "| --- | --- | ---: | ---: |"];
  entries.forEach((e, i) => {
    const term = e.term.replace(/\|/g, "\\|");
    rows.push(`| ${i + 1} | ${term} | ${e.count} | ${e.density.toFixed(2)}% |`);
  });
  return rows.join("\n") + "\n";
}

/** Trigger a client-side download of `text`. */
function downloadText(text: string, filename: string, mime: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/* -------------------------------------------------------------------------- */
/*  Density table                                                             */
/* -------------------------------------------------------------------------- */

/** Tone for a term's density relative to the stuffing thresholds. */
function densityTone(density: number): "ok" | "watch" | "high" {
  if (density >= STUFFING_WARN) return "high";
  if (density >= STUFFING_WATCH) return "watch";
  return "ok";
}

function DensityTable({
  entries,
  termLabel,
  maxDensity,
}: {
  entries: readonly KeywordEntry[];
  termLabel: string;
  maxDensity: number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="w-8 px-3 py-2 font-medium tabular-nums">
              #
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              {termLabel}
            </th>
            <th scope="col" className="w-16 px-3 py-2 text-right font-medium">
              Count
            </th>
            <th scope="col" className="w-40 px-3 py-2 font-medium">
              Density
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const tone = densityTone(e.density);
            const barPct = maxDensity > 0 ? (e.density / maxDensity) * 100 : 0;
            const barColor =
              tone === "high"
                ? "bg-destructive"
                : tone === "watch"
                  ? "bg-warning"
                  : "bg-primary";
            const textColor =
              tone === "high"
                ? "text-destructive"
                : tone === "watch"
                  ? "text-warning"
                  : "text-foreground";
            return (
              <tr
                key={e.term}
                className="border-b border-border/60 last:border-0 hover:bg-muted/30"
              >
                <td className="px-3 py-2 text-xs tabular-nums text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-1.5 break-words font-mono text-[13px]">
                    {e.term}
                    {tone === "high" && (
                      <Icon
                        name="TriangleAlert"
                        size={13}
                        className="text-destructive"
                        aria-label="Possible keyword stuffing"
                      />
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {e.count}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <span
                        className={`block h-full rounded-full ${barColor}`}
                        style={{ width: `${Math.max(barPct, 3)}%` }}
                      />
                    </span>
                    <span className={`w-12 text-right text-xs tabular-nums ${textColor}`}>
                      {e.density.toFixed(2)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                              */
/* -------------------------------------------------------------------------- */

function EmptyState({ onSample }: { onSample: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon name="ChartColumnBig" size={22} />
      </span>
      <h3 className="text-sm font-semibold text-foreground">
        Paste content to analyze its keyword density
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Drop in article text or a full page&rsquo;s HTML. Tags are stripped automatically. Everything is
        counted locally in your browser, so nothing is uploaded. To check a live URL you&rsquo;d need a
        server we deliberately don&rsquo;t run, so paste the copy instead; drafts and gated pages work too.
      </p>
      <button
        type="button"
        onClick={onSample}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon name="FlaskConical" size={14} />
        Try a sample
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function KeywordDensityCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  const [input, setInput] = React.useState("");
  const [opts, setOpts] = React.useState<Options>(DEFAULT_OPTIONS);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const setOpt = React.useCallback(
    <K extends keyof Options>(key: K, value: Options[K]) => {
      setOpts((o) => ({ ...o, [key]: value }));
    },
    [],
  );

  /* Derived analysis, recomputed on input OR any option change. */
  const analysis = React.useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const isHtml = looksLikeHtml(input);
    const text = isHtml ? htmlToText(input) : input;

    const n = Number(opts.ngram);
    const result = keywordDensity(text, {
      n,
      stopwords: opts.filterStopwords ? undefined : null,
      top: opts.top,
      minLength: opts.minLength,
    });

    const rt = readingTime(text);
    const uniqueTerms = result.entries.length;
    const maxDensity = result.entries.reduce((m, e) => Math.max(m, e.density), 0);
    const stuffed = result.entries.filter((e) => e.density >= STUFFING_WARN);

    return { isHtml, result, rt, uniqueTerms, maxDensity, stuffed };
  }, [input, opts]);

  const termLabel =
    opts.ngram === "1" ? "Keyword" : opts.ngram === "2" ? "2-word phrase" : "3-word phrase";

  /* --------------------------------- actions ----------------------------- */

  const loadSample = React.useCallback(() => {
    setInput(SAMPLE_TEXT);
    setOpts(DEFAULT_OPTIONS);
  }, []);

  const clear = React.useCallback(() => {
    setInput("");
    inputRef.current?.focus();
  }, []);

  const paste = React.useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInput(text);
    } catch {
      inputRef.current?.focus();
    }
  }, []);

  // Memoized so the `[]` fallback can't mint a new array every render
  // (it feeds the useCallback dependency arrays below).
  const entries = React.useMemo(
    () => analysis?.result.entries ?? [],
    [analysis],
  );

  const copyCsv = React.useCallback(async () => {
    if (!entries.length) return;
    try {
      await navigator.clipboard.writeText(toCsv(entries));
    } catch {
      /* clipboard blocked, no-op */
    }
  }, [entries]);

  const copyMarkdown = React.useCallback(async () => {
    if (!entries.length) return;
    try {
      await navigator.clipboard.writeText(toMarkdown(entries, termLabel));
    } catch {
      /* clipboard blocked: no-op */
    }
  }, [entries, termLabel]);

  const exportCsv = React.useCallback(() => {
    if (!entries.length) return;
    downloadText(toCsv(entries), "keyword-density.csv", "text/csv;charset=utf-8");
  }, [entries]);

  useShortcuts(
    {
      "mod+k": clear,
    },
    { allowInInputs: true },
  );

  /* ---------------------------------- render ----------------------------- */

  return (
    <section aria-label={tool.title} className="grid gap-4 lg:grid-cols-2">
      {/* Input + options column */}
      <div className="flex min-w-0 flex-col gap-3">
        <Toolbar>
          <ToolbarGroup>
            <ToolbarButton icon="ClipboardPaste" label="Paste" onClick={paste} />
            <ToolbarButton icon="FlaskConical" label="Load sample" onClick={loadSample} />
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
          onChange={setInput}
          onDropText={setInput}
          label={
            <span className="flex items-center gap-2">
              Paste text or HTML
              {analysis?.isHtml && (
                <span className="text-[10px] uppercase tracking-wide opacity-70">
                  HTML detected: tags stripped
                </span>
              )}
            </span>
          }
          placeholder="Paste your article, page copy, or full HTML here…"
          lineNumbers
          minHeight={320}
          maxHeight={620}
          ariaLabel="Content to analyze"
        />

        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <Field label="Phrase length" hint="Single words or 2- / 3-word phrases (n-grams).">
              <SegmentedControl<NGram>
                value={opts.ngram}
                onChange={(v) => setOpt("ngram", v)}
                options={NGRAM_OPTIONS}
                ariaLabel="Phrase length"
              />
            </Field>

            <Field label="Show top" hint="How many ranked terms to list.">
              <NumberStepper
                value={opts.top}
                onChange={(v) => setOpt("top", v)}
                min={5}
                max={100}
                step={5}
                ariaLabel="Number of terms to show"
              />
            </Field>

            {opts.ngram === "1" && (
              <Field label="Min length" hint="Ignore single words shorter than this.">
                <NumberStepper
                  value={opts.minLength}
                  onChange={(v) => setOpt("minLength", v)}
                  min={1}
                  max={12}
                  ariaLabel="Minimum word length"
                />
              </Field>
            )}

            <div className="pb-1">
              <Toggle
                checked={opts.filterStopwords}
                onChange={(v) => setOpt("filterStopwords", v)}
                label="Filter stopwords"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report column */}
      <div className="flex min-w-0 flex-col gap-3">
        <Toolbar>
          <span className="px-1.5 text-sm font-medium text-foreground">Density report</span>
          <ToolbarSpacer />
          <ToolbarGroup>
            <ToolbarButton
              icon="Copy"
              label="Copy CSV"
              onClick={copyCsv}
              disabled={!entries.length}
            />
            <ToolbarButton
              icon="Hash"
              label="Copy Markdown"
              onClick={copyMarkdown}
              disabled={!entries.length}
            />
            <ToolbarDivider />
            <ToolbarButton
              icon="Download"
              label="Export CSV"
              onClick={exportCsv}
              disabled={!entries.length}
            />
          </ToolbarGroup>
        </Toolbar>

        {analysis ? (
          <div className="flex flex-col gap-4">
            {/* Live stats */}
            <div className="flex flex-wrap gap-1.5">
              <StatBadge
                label="Words"
                value={analysis.result.totalWords.toLocaleString()}
                icon="Type"
                tone="info"
              />
              <StatBadge
                label="Counted terms"
                value={analysis.result.totalTerms.toLocaleString()}
                icon="ListOrdered"
              />
              <StatBadge label="Unique" value={analysis.uniqueTerms.toLocaleString()} icon="Hash" />
              <StatBadge label="Reading time" value={analysis.rt.text} icon="Clock" />
              {analysis.stuffed.length > 0 && (
                <StatBadge
                  label="Over-optimized"
                  value={analysis.stuffed.length}
                  icon="TriangleAlert"
                  tone="danger"
                />
              )}
            </div>

            {/* Stuffing verdict */}
            {analysis.result.totalTerms === 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                <Icon name="Info" size={16} className="mt-0.5 shrink-0" />
                <span>
                  No terms left to rank after filtering. Try lowering the minimum length or turning
                  off stopword filtering.
                </span>
              </div>
            ) : analysis.stuffed.length > 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
                <span>
                  {analysis.stuffed.length === 1
                    ? "One term is"
                    : `${analysis.stuffed.length} terms are`}{" "}
                  above ~{STUFFING_WARN}% density, which can read as keyword stuffing. Vary the
                  phrasing with synonyms and related terms.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
                <Icon name="CircleCheckBig" size={16} className="mt-0.5 shrink-0" />
                <span>
                  No single {opts.ngram === "1" ? "keyword" : "phrase"} is over-used - your top term
                  sits at {analysis.maxDensity.toFixed(2)}%, within a natural range.
                </span>
              </div>
            )}

            {entries.length > 0 && (
              <DensityTable
                entries={entries}
                termLabel={termLabel}
                maxDensity={analysis.maxDensity}
              />
            )}

            <p className="text-xs text-muted-foreground">
              Density is each term&rsquo;s share of all {analysis.result.totalTerms.toLocaleString()}{" "}
              counted terms. There&rsquo;s no ideal number. Aim for copy that reads naturally, not a
              target percentage.
            </p>
          </div>
        ) : (
          <>
            <ErrorBanner error={null} />
            <EmptyState onSample={loadSample} />
          </>
        )}
      </div>
    </section>
  );
}
