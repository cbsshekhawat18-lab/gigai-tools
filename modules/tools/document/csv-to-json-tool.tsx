"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import {
  Field,
  SegmentedControl,
  Toggle,
  TransformTool,
  type RunResult,
} from "@/components/tool/dev";
import { csvToJson, parseCsv } from "@/lib/document-tools/csv";

/** Shape of the emitted JSON. */
type Shape = "objects" | "arrays";

/** Options driving the live CSV → JSON conversion. */
interface CsvJsonOptions {
  /** "objects" keys rows by the header row; "arrays" emits positional arrays. */
  shape: Shape;
  /** Convert obvious numbers / booleans / blanks to real JSON values. */
  inferTypes: boolean;
  /** Pretty-print (2-space indent) vs. single-line minified. */
  pretty: boolean;
}

/** UTF-8 byte length, the real on-the-wire size of the JSON payload. */
const ENCODER = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
function byteLength(s: string): number {
  if (ENCODER) return ENCODER.encode(s).length;
  return unescape(encodeURIComponent(s)).length;
}

/** Human-readable byte size, e.g. 1.2 KB. */
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const unit = units[i] ?? "KB";
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

/**
 * Coerce a single CSV string cell into a real JSON scalar. Deliberately
 * conservative: only fully-numeric tokens that survive a round-trip become
 * numbers (so `007` and `1e2`-style ambiguities that would lose fidelity stay
 * strings), only literal `true`/`false` become booleans, and an empty cell
 * becomes `null`. Everything else is left as the original string.
 */
function inferValue(raw: string): string | number | boolean | null {
  if (raw === "") return null;
  const lower = raw.toLowerCase();
  if (lower === "true") return true;
  if (lower === "false") return false;
  // Strict number: no leading zeros (except a lone "0"), optional sign/decimal.
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(raw)) {
    const n = Number(raw);
    if (Number.isFinite(n) && String(n) === raw) return n;
  }
  return raw;
}

/** Apply {@link inferValue} across every cell of the parsed data. */
function inferData(
  data: Array<Record<string, string>> | string[][],
): unknown {
  return data.map((row) => {
    if (Array.isArray(row)) {
      return row.map(inferValue);
    }
    const out: Record<string, string | number | boolean | null> = {};
    for (const key of Object.keys(row)) {
      out[key] = inferValue(row[key] ?? "");
    }
    return out;
  });
}

/**
 * Run the conversion. When type inference is off we reuse the document engine's
 * `csvToJson` verbatim (papaparse under the hood, values kept as strings). When
 * it is on, we parse with the same engine and post-process each cell through
 * `inferValue`, then serialise, so both paths share one parser and only the
 * typing differs.
 */
async function convert(
  csv: string,
  opts: CsvJsonOptions,
): Promise<
  | { ok: true; json: string; rows: number; cols: number }
  | { ok: false; error: string }
> {
  const header = opts.shape === "objects";

  if (!opts.inferTypes) {
    const res = await csvToJson(csv, { header, pretty: opts.pretty });
    if (!res.ok) return { ok: false, error: res.error };
    // Re-derive counts cheaply from the parse (the string output is authoritative).
    const parsed = await parseCsv(csv, { header });
    const { rows, cols } = countOf(parsed);
    return { ok: true, json: res.result, rows, cols };
  }

  const parsed = await parseCsv(csv, { header });
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const data =
    "records" in parsed.result ? parsed.result.records : parsed.result.rows;
  try {
    const typed = inferData(data);
    const json = JSON.stringify(typed, null, opts.pretty ? 2 : 0);
    const { rows, cols } = countOf(parsed);
    return { ok: true, json, rows, cols };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Derive row and column counts from a parseCsv result. */
function countOf(
  parsed: Awaited<ReturnType<typeof parseCsv>>,
): { rows: number; cols: number } {
  if (!parsed.ok) return { rows: 0, cols: 0 };
  if ("records" in parsed.result) {
    return {
      rows: parsed.result.records.length,
      cols: parsed.result.fields.length,
    };
  }
  return {
    rows: parsed.result.rows.length,
    cols: parsed.result.rows[0]?.length ?? 0,
  };
}

/** A small, realistic CSV for the empty state. */
const SAMPLE_CSV = `id,name,role,active,salary
1,Ada Lovelace,Engineer,true,120000
2,"Grace Hopper, PhD",Architect,true,145000
3,Alan Turing,Researcher,false,110000`;

const EXAMPLES = [
  {
    label: "People (with quotes)",
    description: "Header row, a quoted comma, booleans and numbers",
    value: SAMPLE_CSV,
  },
  {
    label: "Semicolon-separated",
    description: "European-style CSV. The delimiter is auto-detected",
    value: `city;country;population\nTokyo;Japan;37400068\nDelhi;India;28514000\nSao Paulo;Brazil;21650000`,
  },
  {
    label: "Tab-separated (TSV)",
    description: "Tabs between fields, sniffed automatically",
    value: `sku\tqty\tin_stock\nA-100\t12\ttrue\nB-220\t0\tfalse\nC-330\t7\ttrue`,
  },
] as const;

const EXTRA_SHORTCUTS = [{ combo: "esc", description: "Dismiss the error banner" }];

/**
 * CSV to JSON: composes the `TransformTool` harness (dual editors, toolbar,
 * drag-drop/paste import, copy/download/share, undo/redo, error banner and
 * keyboard shortcuts) with the document engine's `csvToJson`/`parseCsv`
 * (papaparse) so the parsing logic is shared, not re-implemented. It exposes a
 * shape switch (array of objects vs. arrays), an opt-in type-inference toggle
 * and a pretty/minified toggle, and reports row/column counts plus the output
 * size as live badges. Everything runs locally: nothing is uploaded.
 */
export default function CsvToJsonTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [shape, setShape] = React.useState<Shape>("objects");
  const [inferTypes, setInferTypes] = React.useState(false);
  const [pretty, setPretty] = React.useState(true);

  const options = React.useMemo<CsvJsonOptions>(
    () => ({ shape, inferTypes, pretty }),
    [shape, inferTypes, pretty],
  );

  const run = React.useCallback(
    async (input: string, opts: CsvJsonOptions): Promise<RunResult> => {
      const res = await convert(input, opts);
      if (!res.ok) return { ok: false, error: res.error };

      const stats: NonNullable<RunResult["stats"]> = [
        { label: "Rows", value: res.rows.toLocaleString(), icon: "Rows3", tone: "default" },
        { label: "Columns", value: res.cols.toLocaleString(), icon: "Columns3", tone: "default" },
        { label: "JSON size", value: formatBytes(byteLength(res.json)), icon: "FileJson", tone: "info" },
      ];
      if (opts.inferTypes) {
        stats.push({ label: "Types", value: "inferred", icon: "WandSparkles", tone: "success" });
      }

      return { ok: true, output: res.json, stats };
    },
    [],
  );

  const optionControls = (
    <>
      <Field label="Shape" hint="Objects keyed by header, or positional arrays">
        <SegmentedControl<Shape>
          value={shape}
          onChange={setShape}
          ariaLabel="Output shape"
          size="sm"
          options={[
            { value: "objects", label: "Objects", icon: "Braces" },
            { value: "arrays", label: "Arrays", icon: "Brackets" },
          ]}
        />
      </Field>
      <Field label="Types" hint="Convert numbers, booleans & blanks (off keeps leading zeros)">
        <Toggle
          checked={inferTypes}
          onChange={setInferTypes}
          label={inferTypes ? "Infer" : "Strings"}
        />
      </Field>
      <Field label="Format" hint="Indented for reading, minified for the wire">
        <Toggle
          checked={pretty}
          onChange={setPretty}
          label={pretty ? "Pretty" : "Minified"}
        />
      </Field>
    </>
  );

  return (
    <TransformTool<CsvJsonOptions>
      run={run}
      options={options}
      inputLabel="CSV input"
      outputLabel="JSON output"
      inputPlaceholder="Paste CSV here, drop a.csv file, or load a sample: e.g. id,name\n1,Ada"
      downloadName="data.json"
      downloadMime="application/json;charset=utf-8"
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
