"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Field, StatBadge, type Example } from "@/components/tool/dev";
import { GeneratorWithPreview } from "@/components/tool/seo";
import { charCount, type CharCounts } from "@/lib/seo-tools/content";

/**
 * Character Counter, a live, platform-aware counter.
 *
 * A single controlled form (`CounterState` = the raw text plus a custom limit)
 * drives every output: a plain-text stats report (the `code` handed to
 * `<GeneratorWithPreview>` for copy/download/share), a stats grid, and a set of
 * live limit meters (Twitter/X, SEO title, meta description, SMS + a custom
 * target). `<GeneratorWithPreview>` owns the toolbar, undo/redo, share links,
 * presets and shortcuts; this module owns the data and how it renders. All
 * counting runs in the browser via `charCount` (native `TextEncoder`) -
 * nothing typed here is ever uploaded.
 */

/* --------------------------------- state ---------------------------------- */

interface CounterState {
  text: string;
  /** User-defined custom limit; 0 or empty disables the custom meter. */
  customLimit: string;
}

const INITIAL: CounterState = { text: "", customLimit: "" };

/* -------------------------------- limits ---------------------------------- */

interface LimitSpec {
  id: string;
  label: string;
  icon: string;
  /** The character budget. */
  max: number;
  /** Lower bound of the "ideal" band (for SEO fields); optional. */
  idealMin?: number;
  hint: string;
}

const LIMITS: readonly LimitSpec[] = [
  {
    id: "title",
    label: "SEO title",
    icon: "Search",
    max: 60,
    idealMin: 50,
    hint: "Titles display best in Google at 50–60 characters.",
  },
  {
    id: "description",
    label: "Meta description",
    icon: "AlignLeft",
    max: 160,
    idealMin: 150,
    hint: "Descriptions display best at 150–160 characters.",
  },
  {
    id: "twitter",
    label: "X / Twitter post",
    icon: "Twitter",
    max: 280,
    hint: "A standard post allows 280 characters.",
  },
  {
    id: "sms",
    label: "SMS segment",
    icon: "MessageSquare",
    max: 160,
    hint: "A single GSM-7 SMS segment holds 160 characters.",
  },
];

/* -------------------------------- presets --------------------------------- */

const EXAMPLES: ReadonlyArray<Example<CounterState>> = [
  {
    label: "SEO title",
    description: "A title tag to fit the 50–60 window",
    icon: "Search",
    value: {
      text: "Character Counter: Live Count with Twitter, Meta & SMS Limits",
      customLimit: "",
    },
  },
  {
    label: "Meta description",
    description: "A description to fit the 150–160 window",
    icon: "AlignLeft",
    value: {
      text: "Count characters with and without spaces, plus words, bytes and lines, and check your text live against Twitter/X, SEO title, meta description and SMS limits.",
      customLimit: "",
    },
  },
  {
    label: "Tweet with emoji",
    description: "Test Unicode & byte counting",
    icon: "Twitter",
    value: {
      text: "Just shipped our new character counter ✨, counts with/without spaces, words, and true UTF-8 bytes, with live limits for X, SEO titles, meta descriptions and SMS. Try it free 🚀",
      customLimit: "280",
    },
  },
  {
    label: "SMS message",
    description: "Keep it to one 160-char segment",
    icon: "MessageSquare",
    value: {
      text: "Your order #4821 has shipped and will arrive Tuesday. Track it at example.com/track or reply HELP for support. Thanks for shopping with us!",
      customLimit: "160",
    },
  },
];

/* ------------------------------ derived data ------------------------------ */

interface Meter {
  spec: LimitSpec | { id: string; label: string; icon: string; max: number; hint: string };
  used: number;
  remaining: number;
  pct: number;
  over: boolean;
  /** true when a value sits in the SEO "ideal" band. */
  ideal: boolean;
}

function buildMeters(chars: number, customLimit: number): Meter[] {
  const meters: Meter[] = LIMITS.map((spec) => {
    const remaining = spec.max - chars;
    const over = chars > spec.max;
    const ideal =
      spec.idealMin !== undefined && chars >= spec.idealMin && chars <= spec.max;
    return {
      spec,
      used: chars,
      remaining,
      pct: Math.min(100, spec.max ? (chars / spec.max) * 100 : 0),
      over,
      ideal,
    };
  });
  if (customLimit > 0) {
    meters.push({
      spec: {
        id: "custom",
        label: "Custom limit",
        icon: "SlidersHorizontal",
        max: customLimit,
        hint: "Your own target for whatever field you're filling.",
      },
      used: chars,
      remaining: customLimit - chars,
      pct: Math.min(100, (chars / customLimit) * 100),
      over: chars > customLimit,
      ideal: false,
    });
  }
  return meters;
}

/** A copyable/downloadable plain-text stats report. */
function buildReport(text: string, counts: CharCounts, meters: Meter[]): string {
  if (!text) return "";
  const lines: string[] = [
    "CHARACTER COUNT REPORT",
    "======================",
    "",
    `Characters (with spaces):    ${counts.withSpaces}`,
    `Characters (without spaces): ${counts.withoutSpaces}`,
    `Words:                       ${counts.words}`,
    `Sentences:                   ${counts.sentences}`,
    `Lines:                       ${counts.lines}`,
    `Paragraphs:                  ${counts.paragraphs}`,
    `UTF-8 bytes:                 ${counts.bytes}`,
    "",
    "PLATFORM LIMITS",
    "---------------",
  ];
  for (const m of meters) {
    const status = m.over
      ? `OVER by ${Math.abs(m.remaining)}`
      : `${m.remaining} left`;
    lines.push(
      `${m.spec.label.padEnd(18)} ${counts.withSpaces}/${m.spec.max}  (${status})`,
    );
  }
  return lines.join("\n");
}

/* ------------------------------- UI pieces -------------------------------- */

function StatCell({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div
      className="rounded-lg border border-border bg-muted/30 px-3 py-2.5"
      title={hint}
    >
      <div className="text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
        {value.toLocaleString()}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function MeterRow({ meter }: { meter: Meter }) {
  const barColor = meter.over
    ? "bg-destructive"
    : meter.ideal
      ? "bg-success"
      : "bg-primary";
  const remainClass = meter.over
    ? "text-destructive"
    : meter.ideal
      ? "text-success"
      : "text-muted-foreground";
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span
          className="flex items-center gap-1.5 font-medium text-foreground"
          title={meter.spec.hint}
        >
          <Icon name={meter.spec.icon} size={13} />
          {meter.spec.label}
        </span>
        <span className={cn("tabular-nums", remainClass)}>
          {meter.over ? (
            <>over by {Math.abs(meter.remaining).toLocaleString()}</>
          ) : (
            <>{meter.remaining.toLocaleString()} left</>
          )}
          <span className="ml-1.5 text-muted-foreground/70">
            {meter.used.toLocaleString()}/{meter.spec.max.toLocaleString()}
          </span>
        </span>
      </div>
      <div
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(meter.pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${meter.spec.label} usage`}
      >
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${meter.pct}%` }}
        />
      </div>
    </div>
  );
}

/* --------------------------------- tool ----------------------------------- */

const inputClass =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring";

export default function CharacterCounterTool({ tool }: { tool: WorkspaceToolData }) {
  const [state, setState] = React.useState<CounterState>(INITIAL);

  const counts = React.useMemo(() => charCount(state.text), [state.text]);

  const customLimit = React.useMemo(() => {
    const n = Number.parseInt(state.customLimit, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [state.customLimit]);

  const meters = React.useMemo(
    () => buildMeters(counts.withSpaces, customLimit),
    [counts.withSpaces, customLimit],
  );

  const code = React.useMemo(
    () => buildReport(state.text, counts, meters),
    [state.text, counts, meters],
  );

  const anyOver = meters.some((m) => m.over && state.text.length > 0);

  const stats = (
    <>
      <StatBadge
        label="Chars"
        value={counts.withSpaces.toLocaleString()}
        tone="info"
      />
      <StatBadge
        label="No spaces"
        value={counts.withoutSpaces.toLocaleString()}
        tone="default"
      />
      <StatBadge label="Words" value={counts.words.toLocaleString()} tone="default" />
      <StatBadge
        label="Bytes"
        value={counts.bytes.toLocaleString()}
        tone={anyOver ? "warning" : "default"}
      />
    </>
  );

  const form = (
    <div className="flex flex-col gap-3">
      <Field
        label="Your text"
        htmlFor="cc-text"
        hint="Type or paste anything, counts and limit meters update live."
      >
        <textarea
          id="cc-text"
          value={state.text}
          rows={12}
          placeholder="Type or paste your title, description, tweet, message or any text here…"
          onChange={(e) => setState((s) => ({ ...s, text: e.target.value }))}
          className={cn(
            inputClass,
            "h-auto min-h-[16rem] resize-y py-2 font-mono text-[13px] leading-relaxed",
          )}
          spellCheck
          aria-describedby="cc-live-count"
        />
      </Field>
      <p id="cc-live-count" className="sr-only" aria-live="polite">
        {counts.withSpaces} characters, {counts.words} words.
      </p>

      <Field
        label="Custom limit (optional)"
        htmlFor="cc-custom"
        hint="Add a meter for your own field, an ad headline, bio or product title."
      >
        <div className="flex items-center gap-2">
          <input
            id="cc-custom"
            type="number"
            min={1}
            inputMode="numeric"
            value={state.customLimit}
            placeholder="e.g. 90"
            onChange={(e) =>
              setState((s) => ({ ...s, customLimit: e.target.value }))
            }
            className={cn(inputClass, "max-w-[8rem]")}
          />
          <span className="text-xs text-muted-foreground">characters</span>
        </div>
      </Field>
    </div>
  );

  const preview = (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="Baseline" size={13} />
          Counts
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCell
            label="With spaces"
            value={counts.withSpaces}
            hint="Every character including spaces and line breaks."
          />
          <StatCell
            label="Without spaces"
            value={counts.withoutSpaces}
            hint="Non-whitespace characters only."
          />
          <StatCell label="Words" value={counts.words} />
          <StatCell
            label="UTF-8 bytes"
            value={counts.bytes}
            hint="Real encoded byte length, what byte-limited fields see."
          />
          <StatCell label="Sentences" value={counts.sentences} />
          <StatCell label="Lines" value={counts.lines} />
          <StatCell label="Paragraphs" value={counts.paragraphs} />
          <StatCell
            label="Chars/word"
            value={
              counts.words
                ? Math.round((counts.withoutSpaces / counts.words) * 10) / 10
                : 0
            }
            hint="Average characters per word (excluding spaces)."
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon name="Ruler" size={13} />
          Platform limits
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3.5">
          {meters.map((m) => (
            <MeterRow key={m.spec.id} meter={m} />
          ))}
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Icon name="Info" size={13} className="mt-px shrink-0" />
          Google truncates by pixel width and SMS by encoding, so these are
          reliable targets rather than exact cut-offs: the byte count flags
          non-ASCII text that can shorten an SMS or overflow a byte-limited
          field.
        </p>
      </div>
    </div>
  );

  return (
    <section aria-label={tool.title}>
      <GeneratorWithPreview<CounterState>
        value={state}
        onChange={setState}
        initialValue={INITIAL}
        code={code}
        language="Report"
        form={form}
        preview={preview}
        previewLabel="Live counts & limits"
        downloadName="character-count.txt"
        downloadMime="text/plain;charset=utf-8"
        examples={EXAMPLES}
        stats={stats}
        serialize={(v) => JSON.stringify(v)}
        deserialize={(raw) => {
          try {
            const parsed = JSON.parse(raw) as Partial<CounterState>;
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
