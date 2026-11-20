"use client";

import * as React from "react";

import type { ImageToolProps } from "@/components/tool/types";
import {
  CodePane,
  Field,
  NumberStepper,
  SegmentedControl,
  StatBadge,
  Toggle,
  type Example,
} from "@/components/tool/dev";
import { GeneratorWithPreview } from "@/components/tool/seo";
import { Icon } from "@/lib/icons";
import { slugify, type SlugifyOptions } from "@/lib/seo-tools/url";

/* -------------------------------------------------------------------------- */
/*  State                                                                     */
/* -------------------------------------------------------------------------- */

type Mode = "single" | "batch";
type Separator = "-" | "_";

/** The full, undo-tracked form state. */
interface SlugState {
  /** Slugify one title (single) or one-per-line list (batch). */
  mode: Mode;
  /** The text to slugify (single title, or newline-separated list). */
  text: string;
  /** Word separator. */
  separator: Separator;
  /** Lowercase the result. */
  lower: boolean;
  /** Strict mode: keep only [A-Za-z0-9] + separator. */
  strict: boolean;
  /** Enforce a maximum length. */
  limitLength: boolean;
  /** The maximum length when `limitLength` is on. */
  maxLen: number;
}

const INITIAL: SlugState = {
  mode: "single",
  text: "",
  separator: "-",
  lower: true,
  strict: true,
  limitLength: false,
  maxLen: 60,
};

/* -------------------------------------------------------------------------- */
/*  Slug logic                                                                */
/* -------------------------------------------------------------------------- */

/** Build the {@link SlugifyOptions} that correspond to the current state. */
function optionsFor(state: SlugState): SlugifyOptions {
  return {
    sep: state.separator,
    lower: state.lower,
    strict: state.strict,
    ...(state.limitLength && state.maxLen > 0 ? { maxLen: state.maxLen } : {}),
  };
}

interface BatchRow {
  /** The original input line. */
  input: string;
  /** The resulting slug (already de-duplicated). */
  slug: string;
  /** 1-based line number in the input. */
  line: number;
}

interface SlugResult {
  /** The generated output (single slug, or newline-joined batch slugs). */
  code: string;
  /** Batch rows (empty in single mode). */
  rows: BatchRow[];
  /** Number of non-empty input lines considered. */
  lineCount: number;
  /** Number of lines that produced an empty slug. */
  emptyCount: number;
  /** Number of de-duplication suffixes added in batch mode. */
  dedupedCount: number;
}

/**
 * Compute the slug output for the current state. In single mode this is one
 * slug for the whole text; in batch mode each non-empty line becomes its own
 * slug and identical results are de-duplicated with numeric suffixes so no two
 * URLs collide.
 */
function computeSlugs(state: SlugState): SlugResult {
  const opts = optionsFor(state);

  if (state.mode === "single") {
    const slug = slugify(state.text, opts);
    const hasText = state.text.trim().length > 0;
    return {
      code: slug,
      rows: [],
      lineCount: hasText ? 1 : 0,
      emptyCount: hasText && slug === "" ? 1 : 0,
      dedupedCount: 0,
    };
  }

  // Batch mode: one slug per non-empty line, de-duplicated.
  const rows: BatchRow[] = [];
  const seen = new Map<string, number>();
  let emptyCount = 0;
  let dedupedCount = 0;

  state.text.split(/\r?\n/).forEach((raw, idx) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    let slug = slugify(trimmed, opts);
    if (slug === "") {
      emptyCount += 1;
      rows.push({ input: trimmed, slug: "", line: idx + 1 });
      return;
    }

    const prior = seen.get(slug);
    if (prior === undefined) {
      seen.set(slug, 1);
    } else {
      const next = prior + 1;
      seen.set(slug, next);
      slug = `${slug}${state.separator}${next}`;
      seen.set(slug, 1);
      dedupedCount += 1;
    }

    rows.push({ input: trimmed, slug, line: idx + 1 });
  });

  return {
    code: rows.map((r) => r.slug).join("\n"),
    rows,
    lineCount: rows.length,
    emptyCount,
    dedupedCount,
  };
}

/** Count how many characters of the input actually changed vs. the slug. */
function changedChars(input: string, slug: string): number {
  const a = input.trim();
  if (!a) return 0;
  let diff = Math.abs(a.length - slug.length);
  const len = Math.min(a.length, slug.length);
  for (let i = 0; i < len; i += 1) {
    if (a[i] !== slug[i]) diff += 1;
  }
  return diff;
}

/* -------------------------------------------------------------------------- */
/*  Examples                                                                  */
/* -------------------------------------------------------------------------- */

const EXAMPLES: ReadonlyArray<Example<SlugState>> = [
  {
    label: "Blog headline",
    description: "A wordy title into a tidy permalink",
    icon: "PenLine",
    value: {
      ...INITIAL,
      mode: "single",
      text: "10 Proven Ways to Speed Up Your WordPress Site in 2026!",
      limitLength: true,
      maxLen: 50,
    },
  },
  {
    label: "Accents & symbols",
    description: "Transliterate café, naïve, Straße, R&D",
    icon: "Languages",
    value: {
      ...INITIAL,
      mode: "single",
      text: "Crème Brûlée & Naïve Straße, R&D @ 100% Off",
    },
  },
  {
    label: "Batch product list",
    description: "One slug per line, auto de-duplicated",
    icon: "ListOrdered",
    value: {
      ...INITIAL,
      mode: "batch",
      text: [
        "Wireless Noise-Cancelling Headphones",
        "Wireless Noise-Cancelling Headphones",
        "USB-C to HDMI Adapter (4K@60Hz)",
        "Men's Running Shoes, Size 10",
        "Café Blend Coffee, 1kg",
      ].join("\n"),
    },
  },
  {
    label: "Underscore file names",
    description: "Non-strict underscores for slugs like paths",
    icon: "FileCode",
    value: {
      ...INITIAL,
      mode: "batch",
      separator: "_",
      strict: false,
      text: ["Report v1.2 Final", "Q3 2026 Summary", "read_me.first"].join("\n"),
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function SlugGeneratorTool(_props: ImageToolProps) {
  const [state, setState] = React.useState<SlugState>(INITIAL);

  const set = React.useCallback(
    <K extends keyof SlugState>(key: K, value: SlugState[K]) => {
      setState((s) => ({ ...s, [key]: value }));
    },
    [],
  );

  const { code, preview, stats, error } = React.useMemo(() => {
    const result = computeSlugs(state);

    const hardError =
      state.limitLength && state.maxLen <= 0
        ? "Set a maximum length of at least 1 character, or turn off the length limit."
        : null;

    /* ------------------------------- preview ----------------------------- */

    let previewNode: React.ReactNode;

    if (result.lineCount === 0) {
      previewNode = (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-10 text-center">
          <Icon name="Type" size={22} className="text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {state.mode === "single" ? "Type a title above" : "Paste a list above"}
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            {state.mode === "single"
              ? "Your clean URL slug appears here as you type."
              : "Each non-empty line becomes its own slug, de-duplicated so no two URLs collide."}
          </p>
        </div>
      );
    } else if (state.mode === "single") {
      const slug = result.code;
      previewNode = (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Example URL
            </p>
            <p className="break-all font-mono text-sm text-foreground">
              <span className="text-muted-foreground">https://example.com/</span>
              {slug ? (
                <span className="font-semibold text-primary">{slug}</span>
              ) : (
                <span className="italic text-destructive">(empty slug)</span>
              )}
            </p>
          </div>
          {slug === "" && (
            <p className="text-xs text-destructive">
              The input contained no characters that survive the current rules. Turn off
              strict mode, or add a letter or digit.
            </p>
          )}
        </div>
      );
    } else {
      previewNode = (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Input</th>
                <th className="py-2 pl-3 font-medium">Slug</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.line} className="border-b border-border/60 align-top">
                  <td className="max-w-[16rem] truncate py-2 pr-3 text-muted-foreground" title={row.input}>
                    {row.input}
                  </td>
                  <td className="py-2 pl-3 font-mono">
                    {row.slug ? (
                      <span className="break-all text-foreground">{row.slug}</span>
                    ) : (
                      <span className="italic text-destructive">(empty)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    /* -------------------------------- stats ------------------------------ */

    const outLen = state.mode === "single" ? result.code.length : 0;
    const singleWords =
      state.mode === "single" && result.code
        ? result.code.split(state.separator).filter(Boolean).length
        : 0;
    const changed =
      state.mode === "single" ? changedChars(state.text, result.code) : 0;

    const statNodes =
      state.mode === "single" ? (
        <>
          <StatBadge
            label="Length"
            value={outLen}
            icon="Ruler"
            tone={outLen === 0 ? "default" : "info"}
          />
          <StatBadge label="Words" value={singleWords} icon="Type" />
          {changed > 0 && (
            <StatBadge label="Changed" value={changed} icon="Wand2" tone="warning" />
          )}
        </>
      ) : (
        <>
          <StatBadge
            label="Slugs"
            value={result.lineCount}
            icon="ListOrdered"
            tone={result.lineCount ? "info" : "default"}
          />
          {result.dedupedCount > 0 && (
            <StatBadge
              label="De-duped"
              value={result.dedupedCount}
              icon="Copy"
              tone="warning"
            />
          )}
          {result.emptyCount > 0 && (
            <StatBadge
              label="Empty"
              value={result.emptyCount}
              icon="TriangleAlert"
              tone="danger"
            />
          )}
        </>
      );

    return { code: result.code, preview: previewNode, stats: statNodes, error: hardError };
  }, [state]);

  /* --------------------------------- form -------------------------------- */

  const form = (
    <div className="flex flex-col gap-4">
      <Field label="Mode" hint="Slugify a single title, or one slug per line for a whole list.">
        <SegmentedControl<Mode>
          value={state.mode}
          onChange={(v) => set("mode", v)}
          ariaLabel="Slug mode"
          options={[
            { value: "single", label: "Single", icon: "Type" },
            { value: "batch", label: "Batch", icon: "ListOrdered" },
          ]}
        />
      </Field>

      <Field
        label={state.mode === "single" ? "Text to slugify" : "One title per line"}
        htmlFor="slug-input"
        hint={
          state.mode === "single"
            ? "Enter a title, headline or any text."
            : "Blank lines are ignored. Repeated slugs are suffixed automatically."
        }
      >
        <CodePane
          id="slug-input"
          value={state.text}
          onChange={(v) => set("text", v)}
          onDropText={(t) => set("text", state.text ? `${state.text}\n${t}` : t)}
          label={undefined}
          placeholder={
            state.mode === "single"
              ? "How to Bake the Perfect Sourdough Loaf"
              : "First Product Title\nSecond Product Title\nCafé Blend Coffee, 1kg"
          }
          minHeight={state.mode === "single" ? 90 : 200}
          maxHeight={420}
          lineNumbers={state.mode === "batch"}
          ariaLabel={state.mode === "single" ? "Text to slugify" : "Titles to slugify, one per line"}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Separator" hint="Hyphens are preferred by search engines.">
          <SegmentedControl<Separator>
            value={state.separator}
            onChange={(v) => set("separator", v)}
            ariaLabel="Word separator"
            options={[
              { value: "-", label: "Hyphen -" },
              { value: "_", label: "Underscore _" },
            ]}
          />
        </Field>

        <Field label="Options" hint="Case and character strictness.">
          <div className="flex flex-col gap-2 pt-1">
            <Toggle
              checked={state.lower}
              onChange={(v) => set("lower", v)}
              label="Lowercase"
            />
            <Toggle
              checked={state.strict}
              onChange={(v) => set("strict", v)}
              label="Strict (a–z, 0–9 only)"
            />
          </div>
        </Field>
      </div>

      <Field
        label="Maximum length"
        hint="Truncates on a clean word boundary. Off = no limit."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Toggle
            checked={state.limitLength}
            onChange={(v) => set("limitLength", v)}
            label="Limit length"
          />
          {state.limitLength && (
            <NumberStepper
              value={state.maxLen}
              onChange={(v) => set("maxLen", v)}
              min={1}
              max={200}
              step={5}
              ariaLabel="Maximum slug length"
            />
          )}
        </div>
      </Field>
    </div>
  );

  return (
    <GeneratorWithPreview<SlugState>
      value={state}
      onChange={setState}
      initialValue={INITIAL}
      code={code}
      language={state.mode === "batch" ? "Slugs" : "Slug"}
      form={form}
      preview={preview}
      previewLabel="Preview"
      downloadName={state.mode === "batch" ? "slugs.txt" : "slug.txt"}
      downloadMime="text/plain;charset=utf-8"
      error={error}
      examples={EXAMPLES}
      serialize={(v) => JSON.stringify(v)}
      deserialize={(raw) => {
        try {
          const parsed = JSON.parse(raw) as Partial<SlugState>;
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
