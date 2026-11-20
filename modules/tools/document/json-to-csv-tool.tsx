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
import { jsonToCsv } from "@/lib/document-tools/csv";

/** Supported CSV field separators. */
type Delimiter = "," | ";" | "\t";

/** Options driving the live JSON → CSV conversion. */
interface JsonCsvOptions {
  /** Flatten nested objects/arrays into dotted, index-suffixed columns. */
  flatten: boolean;
  /** Emit the header (column-name) row. */
  header: boolean;
  /** Field separator. */
  delimiter: Delimiter;
}

/** UTF-8 byte length, the real on-the-wire size of the CSV payload. */
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

/** True for a plain object we should recurse into when flattening. */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Flatten one value into a flat record of dotted keys. Objects recurse with a
 * `parent.child` prefix; arrays recurse with a `parent.0`, `parent.1` index
 * suffix; scalars (and null) land at the current key. When `flatten` is off we
 * keep nested values as compact JSON strings in a single cell instead.
 */
function flattenValue(
  value: unknown,
  prefix: string,
  out: Record<string, unknown>,
  flatten: boolean,
): void {
  if (flatten && isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      out[prefix] = "";
      return;
    }
    for (const key of keys) {
      const next = prefix ? `${prefix}.${key}` : key;
      flattenValue(value[key], next, out, flatten);
    }
    return;
  }
  if (flatten && Array.isArray(value)) {
    if (value.length === 0) {
      out[prefix] = "";
      return;
    }
    value.forEach((item, index) => {
      flattenValue(item, prefix ? `${prefix}.${index}` : String(index), out, flatten);
    });
    return;
  }
  // Leaf: scalar, null, or (flatten off) a nested structure kept as JSON text.
  if (value === null || value === undefined) {
    out[prefix] = "";
  } else if (typeof value === "object") {
    out[prefix] = JSON.stringify(value);
  } else {
    out[prefix] = value as string | number | boolean;
  }
}

/**
 * Turn a parsed JSON array into rows keyed by the *union* of every row's
 * flattened keys, preserving first-seen order so the header is stable. Rows
 * that lack a key get an empty string, so ragged arrays never shift columns.
 * Returns the field order plus one record per row.
 */
function buildRecords(
  data: unknown[],
  flatten: boolean,
): { fields: string[]; records: Array<Record<string, unknown>> } {
  const fields: string[] = [];
  const seen = new Set<string>();
  const records: Array<Record<string, unknown>> = [];

  for (const item of data) {
    const flat: Record<string, unknown> = {};
    if (isPlainObject(item)) {
      flattenValue(item, "", flat, flatten);
    } else {
      // A scalar or (with flatten off) array row, single "value" column.
      flat["value"] = item === null ? "" : (item as unknown);
    }
    for (const key of Object.keys(flat)) {
      if (!seen.has(key)) {
        seen.add(key);
        fields.push(key);
      }
    }
    records.push(flat);
  }

  const normalised = records.map((rec) => {
    const row: Record<string, unknown> = {};
    for (const field of fields) {
      row[field] = field in rec ? rec[field] : "";
    }
    return row;
  });

  return { fields, records: normalised };
}

/**
 * Run the conversion. We parse the JSON, decide between two honest paths, then
 * hand the *already-tabular* data to the document engine's `jsonToCsv`
 * (papaparse `unparse`, RFC-4180 quoting), so the CSV serialisation is shared,
 * not re-implemented, and only the flattening/union-header prep lives here.
 *
 * - Array of objects (the common case): flatten each object, union the keys,
 *   and unparse the normalised records so column names become the header.
 * - Array of arrays: pass through positionally (no keys to flatten).
 */
async function convert(
  jsonText: string,
  opts: JsonCsvOptions,
): Promise<
  | { ok: true; csv: string; rows: number; cols: number }
  | { ok: false; error: string }
> {
  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return { ok: false, error: "That isn't valid JSON: check for a trailing comma or a missing bracket." };
  }
  if (!Array.isArray(data)) {
    return {
      ok: false,
      error: "JSON must be an array of rows. Wrap a single object in an array, [ { … } ].",
    };
  }
  if (data.length === 0) {
    return { ok: true, csv: "", rows: 0, cols: 0 };
  }

  const allArrays = data.every((row) => Array.isArray(row));

  if (allArrays) {
    // Positional rows. No header/flatten step; strip the header row if the
    // user turned the header toggle off (first inner array is treated as it).
    const rows = data as unknown[][];
    const payload = opts.header ? rows : rows.slice(1);
    const res = await jsonToCsv(payload, { delimiter: opts.delimiter });
    if (!res.ok) return { ok: false, error: res.error };
    const cols = rows.reduce((max, r) => Math.max(max, r.length), 0);
    return { ok: true, csv: res.result, rows: payload.length, cols };
  }

  const { fields, records } = buildRecords(data, opts.flatten);

  if (opts.header) {
    const res = await jsonToCsv(records, { delimiter: opts.delimiter });
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, csv: res.result, rows: records.length, cols: fields.length };
  }

  // Headerless: emit ordered value arrays so no key row is written.
  const matrix = records.map((rec) => fields.map((f) => rec[f] ?? ""));
  const res = await jsonToCsv(matrix, { delimiter: opts.delimiter });
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, csv: res.result, rows: matrix.length, cols: fields.length };
}

/** A small, realistic JSON array for the empty state. */
const SAMPLE_JSON = `[
  {
    "id": 1,
    "name": "Ada Lovelace",
    "role": "Engineer",
    "address": { "city": "London", "country": "UK" },
    "tags": ["founder", "math"]
  },
  {
    "id": 2,
    "name": "Grace Hopper",
    "role": "Architect",
    "address": { "city": "New York", "country": "USA" },
    "tags": ["navy"]
  }
]`;

const EXAMPLES = [
  {
    label: "People (nested)",
    description: "Objects with a nested address and a tags array, flattened to columns",
    value: SAMPLE_JSON,
  },
  {
    label: "Flat records",
    description: "Simple objects, all the same keys",
    value: `[
  { "sku": "A-100", "qty": 12, "in_stock": true },
  { "sku": "B-220", "qty": 0, "in_stock": false },
  { "sku": "C-330", "qty": 7, "in_stock": true }
]`,
  },
  {
    label: "Ragged (different keys)",
    description: "Objects with differing fields, the union becomes the header",
    value: `[
  { "id": 1, "email": "ada@example.com" },
  { "id": 2, "phone": "555-0100" },
  { "id": 3, "email": "grace@example.com", "phone": "555-0199" }
]`,
  },
  {
    label: "Array of arrays",
    description: "Positional rows. No keys to flatten",
    value: `[
  ["city", "country", "population"],
  ["Tokyo", "Japan", 37400068],
  ["Delhi", "India", 28514000]
]`,
  },
] as const;

const EXTRA_SHORTCUTS = [{ combo: "esc", description: "Dismiss the error banner" }];

/**
 * JSON to CSV: composes the `TransformTool` harness (dual editors, toolbar,
 * drag-drop/paste import, copy/download/share, undo/redo, error banner and
 * keyboard shortcuts) with the document engine's `jsonToCsv` (papaparse
 * `unparse`) so the CSV serialisation is shared, not re-implemented. On top it
 * adds honest, in-tool preparation the engine doesn't do: flattening nested
 * objects/arrays into dotted columns and building a union-of-keys header for
 * ragged arrays. It exposes a flatten toggle, a header toggle and a
 * comma/semicolon/tab delimiter switch, and reports row/column counts plus the
 * output size as live badges. Everything runs locally; nothing is uploaded.
 */
export default function JsonToCsvTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [flatten, setFlatten] = React.useState(true);
  const [header, setHeader] = React.useState(true);
  const [delimiter, setDelimiter] = React.useState<Delimiter>(",");

  const options = React.useMemo<JsonCsvOptions>(
    () => ({ flatten, header, delimiter }),
    [flatten, header, delimiter],
  );

  const run = React.useCallback(
    async (input: string, opts: JsonCsvOptions): Promise<RunResult> => {
      const res = await convert(input, opts);
      if (!res.ok) return { ok: false, error: res.error };

      const stats: NonNullable<RunResult["stats"]> = [
        { label: "Rows", value: res.rows.toLocaleString(), icon: "Rows3", tone: "default" },
        { label: "Columns", value: res.cols.toLocaleString(), icon: "Columns3", tone: "default" },
        { label: "CSV size", value: formatBytes(byteLength(res.csv)), icon: "FileSpreadsheet", tone: "info" },
      ];
      if (opts.flatten) {
        stats.push({ label: "Nested", value: "flattened", icon: "ListTree", tone: "success" });
      }

      return { ok: true, output: res.csv, stats };
    },
    [],
  );

  const optionControls = (
    <>
      <Field label="Nested" hint="Flatten objects/arrays into dotted columns (address.city, tags.0)">
        <Toggle
          checked={flatten}
          onChange={setFlatten}
          label={flatten ? "Flatten" : "As JSON"}
        />
      </Field>
      <Field label="Header" hint="Emit column names as the first row">
        <Toggle
          checked={header}
          onChange={setHeader}
          label={header ? "Header" : "Rows only"}
        />
      </Field>
      <Field label="Delimiter" hint="Comma CSV, semicolon (Excel locales) or tab (TSV)">
        <SegmentedControl<Delimiter>
          value={delimiter}
          onChange={setDelimiter}
          ariaLabel="Field delimiter"
          size="sm"
          options={[
            { value: ",", label: "Comma" },
            { value: ";", label: "Semicolon" },
            { value: "\t", label: "Tab" },
          ]}
        />
      </Field>
    </>
  );

  return (
    <TransformTool<JsonCsvOptions>
      run={run}
      options={options}
      inputLabel="JSON input"
      outputLabel="CSV output"
      inputPlaceholder={'Paste a JSON array here, drop a.json file, or load a sample, e.g. [ { "id": 1, "name": "Ada" } ]'}
      downloadName="data.csv"
      downloadMime="text/csv;charset=utf-8"
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
