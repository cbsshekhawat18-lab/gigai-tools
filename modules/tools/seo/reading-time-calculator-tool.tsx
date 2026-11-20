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
import { charCount, readingTime } from "@/lib/seo-tools/content";

/**
 * Reading Time Calculator. Paste text, pick a pace, read the estimate.
 *
 * A single controlled state (`RtState`: the text + a words-per-minute value)
 * drives every output in lockstep: a live "X min read" estimate, a full
 * word/sentence/paragraph/character breakdown, and a copyable badge + report
 * (the `code` string). `<GeneratorWithPreview>` owns the toolbar, undo/redo,
 * share links, presets and shortcuts; this module owns the data shape and how
 * it renders. Everything runs in the browser. Nothing pasted is uploaded.
 */

/* --------------------------------- state ---------------------------------- */

interface RtState {
  text: string;
  wpm: number;
}

const DEFAULT_WPM = 238;

const INITIAL: RtState = {
  text: "",
  wpm: DEFAULT_WPM,
};

/* -------------------------------- presets --------------------------------- */

/** Research-backed reading-speed presets (words per minute). */
const PACE_PRESETS: ReadonlyArray<{
  label: string;
  wpm: number;
  icon: string;
  hint: string;
}> = [
  { label: "Silent", wpm: 238, icon: "BookOpen", hint: "Average adult silent reading" },
  { label: "Aloud", wpm: 150, icon: "Mic", hint: "Reading out loud" },
  { label: "Narration", wpm: 130, icon: "Podcast", hint: "Podcast / voiceover pace" },
  { label: "Speed", wpm: 400, icon: "Zap", hint: "Trained speed reading" },
];

const WPM_MIN = 50;
const WPM_MAX = 1000;

const SAMPLE_TEXT = `The best writing respects the reader's time. Before you publish, it helps to know exactly how long a piece takes to read. Not as a vanity metric, but as a promise you make at the top of the page.

Reading time is a simple idea with a surprising amount of nuance. Divide the word count by a reading speed and you get minutes. But which speed? A casual blog reader skims at one pace, someone studying a technical document reads far more slowly, and a narrator speaking the same words aloud is slower still.

That is why this calculator lets you choose. Paste your draft, pick the pace that matches your audience, and watch the estimate update as you edit. Trim a paragraph and the number drops; add an example and it climbs. When it lands where you want it, copy the badge and ship.`;

const EXAMPLES: ReadonlyArray<Example<RtState>> = [
  {
    label: "Blog post",
    description: "A short article at the default silent pace",
    icon: "FileText",
    value: { text: SAMPLE_TEXT, wpm: 238 },
  },
  {
    label: "Podcast script",
    description: "Same text timed for reading aloud",
    icon: "Mic",
    value: { text: SAMPLE_TEXT, wpm: 150 },
  },
  {
    label: "Speed reader",
    description: "Estimate at a trained speed-reading pace",
    icon: "Zap",
    value: { text: SAMPLE_TEXT, wpm: 400 },
  },
];

/* ------------------------------ computation ------------------------------- */

interface Derived {
  rt: ReturnType<typeof readingTime>;
  counts: ReturnType<typeof charCount>;
}

function compute(state: RtState): Derived {
  return {
    rt: readingTime(state.text, { wpm: state.wpm }),
    counts: charCount(state.text),
  };
}

/** A precise "1:23" clock string from a total number of seconds. */
function clock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** The copyable badge + downloadable report string. */
function generateCode(state: RtState, d: Derived): string {
  if (!state.text.trim()) return "";
  const lines = [
    d.rt.text,
    "",
    `Reading time   ${clock(d.rt.totalSeconds)} (${d.rt.totalSeconds}s) at ${state.wpm} wpm`,
    `Words          ${d.counts.words.toLocaleString()}`,
    `Sentences      ${d.counts.sentences.toLocaleString()}`,
    `Paragraphs     ${d.counts.paragraphs.toLocaleString()}`,
    `Characters     ${d.counts.withSpaces.toLocaleString()} (${d.counts.withoutSpaces.toLocaleString()} without spaces)`,
  ];
  return lines.join("\n");
}

/* ------------------------------- small UI --------------------------------- */

const textareaClass =
  "w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

/** A single big number with a caption, for the preview stat grid. */
function StatCell({
  value,
  label,
  hint,
}: {
  value: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5" title={hint}>
      <div className="text-lg font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

/* --------------------------------- tool ----------------------------------- */

export default function ReadingTimeCalculatorTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<RtState>(INITIAL);

  const setText = React.useCallback(
    (text: string) => setState((prev) => ({ ...prev, text })),
    [],
  );
  const setWpm = React.useCallback(
    (wpm: number) =>
      setState((prev) => ({
        ...prev,
        wpm: Number.isFinite(wpm) ? Math.min(WPM_MAX, Math.max(WPM_MIN, Math.round(wpm))) : prev.wpm,
      })),
    [],
  );

  const derived = React.useMemo(() => compute(state), [state]);
  const code = React.useMemo(() => generateCode(state, derived), [state, derived]);

  const hasText = state.text.trim().length > 0;
  const activePreset = PACE_PRESETS.find((p) => p.wpm === state.wpm);

  const stats = (
    <>
      <StatBadge
        icon="Timer"
        label="Read"
        value={hasText ? derived.rt.text.replace(" read", "") : "—"}
        tone={hasText ? "info" : "default"}
      />
      <StatBadge label="Words" value={derived.counts.words.toLocaleString()} />
      <StatBadge label="WPM" value={state.wpm} />
    </>
  );

  const form = (
    <div className="flex flex-col gap-3">
      <Field
        label="Your text"
        htmlFor="rt-text"
        hint="Paste an article, blog draft, script or any block of copy."
      >
        <textarea
          id="rt-text"
          value={state.text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste or type your text here to estimate how long it takes to read…"
          className={textareaClass}
          spellCheck
          aria-describedby="rt-live"
        />
      </Field>

      <div className="mt-1 flex items-center gap-2 border-b border-border pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon name="SlidersHorizontal" size={13} />
        Reading pace
      </div>

      <Field
        label="Words per minute"
        htmlFor="rt-wpm"
        hint="The reading speed used for the estimate. Slower for reading aloud, faster for skimming."
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            id="rt-wpm"
            type="range"
            min={WPM_MIN}
            max={WPM_MAX}
            step={1}
            value={state.wpm}
            onChange={(e) => setWpm(e.target.valueAsNumber)}
            aria-label="Words per minute"
            className="h-2 flex-1 min-w-[8rem] cursor-pointer accent-cyan-500"
          />
          <NumberStepper
            value={state.wpm}
            onChange={setWpm}
            min={WPM_MIN}
            max={WPM_MAX}
            step={10}
            ariaLabel="Words per minute value"
          />
        </div>
      </Field>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Reading-pace presets">
        {PACE_PRESETS.map((p) => {
          const active = state.wpm === p.wpm;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => setWpm(p.wpm)}
              aria-pressed={active}
              title={`${p.hint}: ${p.wpm} wpm`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon name={p.icon} size={13} />
              {p.label}
              <span className="tabular-nums opacity-60">{p.wpm}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const preview = (
    <div className="flex flex-col gap-4" id="rt-live" aria-live="polite">
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border border-border bg-gradient-to-br from-cyan-500/10 to-transparent px-5 py-4",
          !hasText && "opacity-70",
        )}
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300">
          <Icon name="Timer" size={22} />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold tabular-nums text-foreground">
            {hasText ? derived.rt.text : "0 sec read"}
          </div>
          <div className="text-xs text-muted-foreground">
            {hasText ? (
              <>
                {clock(derived.rt.totalSeconds)} at {state.wpm} wpm
                {activePreset ? ` · ${activePreset.hint}` : ""}
              </>
            ) : (
              "Paste some text to see the estimate"
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="BarChart3" size={13} />
          Content breakdown
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <StatCell value={derived.counts.words.toLocaleString()} label="Words" />
          <StatCell value={derived.counts.sentences.toLocaleString()} label="Sentences" />
          <StatCell value={derived.counts.paragraphs.toLocaleString()} label="Paragraphs" />
          <StatCell
            value={derived.counts.withSpaces.toLocaleString()}
            label="Characters"
            hint="Including spaces"
          />
          <StatCell
            value={derived.counts.withoutSpaces.toLocaleString()}
            label="No spaces"
            hint="Characters excluding whitespace"
          />
          <StatCell
            value={derived.counts.bytes.toLocaleString()}
            label="Bytes (UTF-8)"
            hint="UTF-8 encoded byte length"
          />
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Reading time is an estimate: word count ÷ {state.wpm} words per minute. Real speed
        varies with the reader and topic: pick a pace that matches your audience.
      </p>
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<RtState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={code}
        language="Reading-time report"
        form={form}
        preview={preview}
        previewLabel="Live estimate & stats"
        downloadName="reading-time.txt"
        downloadMime="text/plain;charset=utf-8"
        examples={EXAMPLES}
        stats={stats}
        error={
          state.text.length > 0 && !hasText
            ? "Your text is only whitespace. Add some words to estimate a reading time."
            : null
        }
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<RtState>;
            if (!parsed || typeof parsed !== "object") return null;
            return {
              text: typeof parsed.text === "string" ? parsed.text : "",
              wpm:
                typeof parsed.wpm === "number" && Number.isFinite(parsed.wpm)
                  ? Math.min(WPM_MAX, Math.max(WPM_MIN, Math.round(parsed.wpm)))
                  : DEFAULT_WPM,
            };
          } catch {
            return null;
          }
        }}
      />
    </section>
  );
}
