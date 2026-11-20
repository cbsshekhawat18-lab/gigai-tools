"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Field,
  NumberStepper,
  StatBadge,
  type Example,
} from "@/components/tool/dev";
import { GeneratorWithPreview } from "@/components/tool/seo";
import { charCount, readingTime, keywordDensity } from "@/lib/seo-tools/content";

/**
 * Word Counter, the Content group's live writing dashboard.
 *
 * A single controlled text field (`WordState`) drives every readout: full
 * character/line/paragraph/sentence statistics (`lib/seo-tools/content.ts`),
 * reading + speaking time at an adjustable pace, a keyword frequency breakdown,
 * and platform length gauges. `<GeneratorWithPreview>` owns the toolbar,
 * undo/redo, share links, presets and shortcuts; this module owns only the
 * data and how it renders. Everything runs in the browser: nothing typed or
 * pasted here is ever uploaded. The "code" pane holds a plain-text stats
 * summary you can copy or download alongside your text.
 */

/* --------------------------------- state ---------------------------------- */

interface WordState {
  text: string;
  /** Reading pace, words per minute. */
  wpm: number;
}

const INITIAL: WordState = {
  text: "",
  wpm: 225,
};

/** Slower pace for reading aloud (presentations, scripts, voiceover). */
const SPEAKING_WPM = 130;

/* -------------------------------- samples --------------------------------- */

const SAMPLE = `The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once, which is why designers and typographers reach for it when they want to preview a typeface.

Good writing is rewriting. A first draft exists to be cut, tightened and reshaped until every sentence earns its place. Count your words, watch your paragraphs, and trim anything that repeats an idea you have already made. Shorter is almost always clearer.`;

const EXAMPLES: ReadonlyArray<Example<WordState>> = [
  {
    label: "Tweet / X post",
    description: "A short post to check against the 280-character limit",
    icon: "Twitter",
    value: {
      ...INITIAL,
      text: "Shipping is a feature. A polished thing that never launches helps no one: a rough thing in real hands teaches you what to build next. Ship, learn, refine, repeat.",
    },
  },
  {
    label: "Meta description",
    description: "A snippet sized for the ~160-character search limit",
    icon: "Search",
    value: {
      ...INITIAL,
      text: "Count words, characters, sentences, paragraphs and reading time live as you type, with a keyword breakdown and platform limits, all private, in your browser.",
    },
  },
  {
    label: "Blog paragraph",
    description: "A longer passage for reading-time and keyword analysis",
    icon: "FileText",
    value: {
      ...INITIAL,
      text: SAMPLE,
    },
  },
];

/* ------------------------------- length caps ------------------------------ */

interface LimitSpec {
  id: string;
  label: string;
  /** The metric this limit applies to. */
  kind: "chars" | "words";
  max: number;
  hint: string;
}

const LIMITS: readonly LimitSpec[] = [
  { id: "tweet", label: "X post", kind: "chars", max: 280, hint: "280 characters" },
  { id: "title", label: "SEO title", kind: "chars", max: 60, hint: "≈60 characters" },
  { id: "meta", label: "Meta description", kind: "chars", max: 160, hint: "≈160 characters" },
  { id: "gbp", label: "Google Business post", kind: "chars", max: 1500, hint: "1,500 characters" },
  { id: "sms", label: "SMS segment", kind: "chars", max: 160, hint: "160 characters" },
];

/* ------------------------------ stat summary ------------------------------ */

const nf = new Intl.NumberFormat("en-US");

/** Build a plain-text stats summary for the copy/download pane. */
function buildSummary(s: WordState): string {
  const c = charCount(s.text);
  const read = readingTime(s.text, { wpm: s.wpm });
  const speak = readingTime(s.text, { wpm: SPEAKING_WPM });
  const kw = keywordDensity(s.text, { top: 10 });

  const lines: string[] = [
    "Word Counter: statistics",
    "",
    `Words:                  ${nf.format(c.words)}`,
    `Characters (spaces):    ${nf.format(c.withSpaces)}`,
    `Characters (no spaces): ${nf.format(c.withoutSpaces)}`,
    `Sentences:              ${nf.format(c.sentences)}`,
    `Paragraphs:             ${nf.format(c.paragraphs)}`,
    `Lines:                  ${nf.format(c.lines)}`,
    `UTF-8 bytes:            ${nf.format(c.bytes)}`,
    "",
    `Reading time (${s.wpm} wpm): ${read.text}`,
    `Speaking time (${SPEAKING_WPM} wpm): ${speak.text}`,
  ];

  if (kw.entries.length > 0) {
    lines.push("", "Top keywords:");
    for (const e of kw.entries) {
      lines.push(` ${e.term}: ${e.count} (${e.density.toFixed(1)}%)`);
    }
  }

  return lines.join("\n");
}

/* ------------------------------ small pieces ------------------------------ */

/** A single big stat block in the stats grid. */
function StatCell({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon name={icon} size={12} />
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

/** A horizontal usage bar for one platform length limit. */
function LimitBar({ label, used, max, hint }: { label: string; used: number; max: number; hint: string }) {
  const ratio = max > 0 ? used / max : 0;
  const pct = Math.min(100, ratio * 100);
  const over = used > max;
  const near = !over && ratio >= 0.9;
  const remaining = max - used;

  const barColor = over
    ? "bg-destructive"
    : near
      ? "bg-warning"
      : "bg-success";
  const textColor = over
    ? "text-destructive"
    : near
      ? "text-warning"
      : "text-muted-foreground";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className={cn("tabular-nums", textColor)}>
          {over
            ? `${nf.format(Math.abs(remaining))} over`
            : `${nf.format(remaining)} left`}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">
        {nf.format(used)} / {nf.format(max)} · {hint}
      </div>
    </div>
  );
}

/* --------------------------------- tool ----------------------------------- */

export default function WordCounterTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<WordState>(INITIAL);

  const setText = React.useCallback(
    (text: string) => setState((prev) => ({ ...prev, text })),
    [],
  );
  const setWpm = React.useCallback(
    (wpm: number) => setState((prev) => ({ ...prev, wpm })),
    [],
  );

  const counts = React.useMemo(() => charCount(state.text), [state.text]);
  const read = React.useMemo(
    () => readingTime(state.text, { wpm: state.wpm }),
    [state.text, state.wpm],
  );
  const speak = React.useMemo(
    () => readingTime(state.text, { wpm: SPEAKING_WPM }),
    [state.text],
  );
  const keywords = React.useMemo(
    () => keywordDensity(state.text, { top: 12 }),
    [state.text],
  );

  const summary = React.useMemo(() => buildSummary(state), [state]);

  const hasText = state.text.trim().length > 0;

  /* toolbar stats, compact badges in the header. */
  const stats = (
    <>
      <StatBadge label="Words" value={nf.format(counts.words)} tone="info" icon="Hash" />
      <StatBadge label="Chars" value={nf.format(counts.withSpaces)} tone="default" icon="Type" />
      <StatBadge label="Read" value={read.text} tone="default" icon="Clock" />
    </>
  );

  /* left column: the text field the user types into. */
  const form = (
    <div className="flex flex-col gap-3">
      <Field
        label="Your text"
        htmlFor="wc-text"
        hint="Type or paste, every count updates live. Nothing leaves your browser."
      >
        <textarea
          id="wc-text"
          value={state.text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing, or paste a draft, essay, caption or article here…"
          rows={16}
          spellCheck
          aria-label="Text to count"
          className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>

      <Field
        label="Reading pace"
        htmlFor="wc-wpm"
        hint="Words per minute. Lower it for dense copy, raise it for skimmable text."
      >
        <div className="flex items-center gap-3">
          <NumberStepper
            id="wc-wpm"
            value={state.wpm}
            onChange={setWpm}
            min={50}
            max={1000}
            step={25}
            ariaLabel="Reading speed in words per minute"
          />
          <span className="text-xs text-muted-foreground">words / minute</span>
        </div>
      </Field>
    </div>
  );

  /* right column, the live dashboard. */
  const preview = (
    <div className="flex flex-col gap-5">
      {/* headline stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <StatCell icon="Hash" label="Words" value={nf.format(counts.words)} />
        <StatCell
          icon="Type"
          label="Characters"
          value={nf.format(counts.withSpaces)}
          sub={`${nf.format(counts.withoutSpaces)} without spaces`}
        />
        <StatCell icon="Clock" label="Reading time" value={read.text} sub={`${state.wpm} wpm`} />
        <StatCell icon="AlignLeft" label="Sentences" value={nf.format(counts.sentences)} />
        <StatCell icon="Pilcrow" label="Paragraphs" value={nf.format(counts.paragraphs)} />
        <StatCell
          icon="Mic"
          label="Speaking time"
          value={speak.text}
          sub={`${SPEAKING_WPM} wpm`}
        />
      </div>

      {/* secondary counts */}
      <div className="flex flex-wrap gap-2">
        <StatBadge label="Lines" value={nf.format(counts.lines)} tone="default" icon="Rows3" />
        <StatBadge label="UTF-8 bytes" value={nf.format(counts.bytes)} tone="default" icon="Binary" />
        <StatBadge
          label="Avg / sentence"
          value={
            counts.sentences > 0
              ? `${(counts.words / counts.sentences).toFixed(1)} words`
              : "—"
          }
          tone="default"
          icon="Ruler"
        />
      </div>

      {/* platform length gauges */}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="Ruler" size={13} />
          Platform length limits
        </div>
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-background/60 p-3 sm:grid-cols-2">
          {LIMITS.map((l) => (
            <LimitBar
              key={l.id}
              label={l.label}
              used={l.kind === "chars" ? counts.withSpaces : counts.words}
              max={l.max}
              hint={l.hint}
            />
          ))}
        </div>
      </div>

      {/* keyword breakdown */}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="ListOrdered" size={13} />
          Top keywords
        </div>
        {keywords.entries.length > 0 ? (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background/60">
            {keywords.entries.map((e) => (
              <li key={e.term} className="flex items-center gap-3 px-3 py-1.5 text-sm">
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">{e.term}</span>
                <span className="tabular-nums text-xs text-muted-foreground">{e.count}×</span>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${Math.min(100, e.density)}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right tabular-nums text-xs text-muted-foreground">
                  {e.density.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-background/40 px-3 py-4 text-center text-xs text-muted-foreground">
            {hasText
              ? "No keywords yet. Add a few more words to see the breakdown."
              : "Keywords will appear here as you type."}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<WordState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={summary}
        language="Stats"
        form={form}
        preview={preview}
        previewLabel="Live counts & analysis"
        downloadName="word-count-summary.txt"
        downloadMime="text/plain;charset=utf-8"
        examples={EXAMPLES}
        stats={stats}
        toolbarExtras={
          <button
            type="button"
            onClick={() => setState((prev) => ({ ...prev, text: SAMPLE }))}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="FileText" size={13} />
            Load sample
          </button>
        }
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<WordState>;
            if (!parsed || typeof parsed !== "object") return null;
            return { ...INITIAL, ...parsed };
          } catch {
            return null;
          }
        }}
      />
    </section>
  );
}
