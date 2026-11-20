"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { formatJson, minifyJson, sortJsonKeys } from "@/lib/dev/json";
import {
  Field,
  SegmentedControl,
  TransformTool,
  type RunResult,
} from "@/components/tool/dev";

/** What the user wants done to their JSON. */
type Mode = "beautify" | "minify" | "sort";

/** Indentation choices for beautify / sort output. */
type Indent = "2" | "4" | "tab";

/** Options driving the live transform. */
interface JsonOptions {
  mode: Mode;
  indent: Indent;
}

/** Byte length of a UTF-8 string, using the platform TextEncoder. */
const ENCODER = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
function byteLength(s: string): number {
  if (ENCODER) return ENCODER.encode(s).length;
  // Fallback (SSR / very old engines): count UTF-8 bytes manually.
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

/** Map the indent choice onto the engine's `number | "\t"` argument. */
function indentArg(indent: Indent): number | "\t" {
  if (indent === "tab") return "\t";
  return indent === "4" ? 4 : 2;
}

/** Curated sample documents so the empty state is one click from useful. */
const EXAMPLES = [
  {
    label: "API response",
    description: "A realistic nested object with an array",
    value: JSON.stringify({
      id: "usr_8f2c",
      name: "Ada Lovelace",
      active: true,
      roles: ["admin", "editor"],
      profile: { location: "London", joined: "1843-01-01", followers: 1024 },
      settings: { theme: "dark", notifications: { email: true, sms: false } },
    }),
  },
  {
    label: "Minified blob",
    description: "Compact JSON to beautify",
    value:
      '{"items":[{"sku":"A-100","qty":2,"price":19.99},{"sku":"B-250","qty":1,"price":4.5}],"currency":"USD","total":44.48}',
  },
  {
    label: "Broken JSON",
    description: "Has a trailing comma: try fixing it",
    value: '{\n  "name": "example",\n  "tags": ["a", "b",],\n}',
  },
  {
    label: "Config file",
    description: "A tsconfig-style object",
    value: JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        strict: true,
        paths: { "@/*": ["./*"] },
      },
      include: ["src", "types"],
      exclude: ["node_modules"],
    }),
  },
] as const;

const EXTRA_SHORTCUTS = [
  { combo: "esc", description: "Dismiss the error banner" },
];

/**
 * JSON Formatter, the flagship developer tool. It composes the `TransformTool`
 * harness (dual editors, toolbar, drag-drop/paste import, copy/download/share,
 * undo/redo, error banner with jump-to-line, keyboard shortcuts) and drives it
 * with the pure `lib/dev/json` engine.
 *
 * The transform is a single `run` that switches on the current mode: Beautify
 * pretty-prints at the chosen indent, Minify collapses to one line, and Sort
 * keys canonicalises for clean diffs. On failure the engine returns a precise
 * line/column, which we hand to the harness so the error banner can offer a
 * one-click jump straight to the offending character. Byte-size stats (input,
 * output and % saved) render as badges so minify savings are visible at a
 * glance. Everything runs live, in the browser, with nothing uploaded.
 */
export default function JsonFormatterTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [mode, setMode] = React.useState<Mode>("beautify");
  const [indent, setIndent] = React.useState<Indent>("2");

  const options = React.useMemo<JsonOptions>(
    () => ({ mode, indent }),
    [mode, indent],
  );

  const run = React.useCallback(
    (input: string, opts: JsonOptions): RunResult => {
      const source = input;
      const result =
        opts.mode === "minify"
          ? minifyJson(source)
          : opts.mode === "sort"
            ? sortJsonKeys(source, indentArg(opts.indent))
            : formatJson(source, indentArg(opts.indent));

      if (!result.ok) {
        const { message, line, column } = result.error;
        return {
          ok: false,
          error: message,
          ...(line != null ? { errorLine: line } : {}),
          ...(column != null ? { errorCol: column } : {}),
        };
      }

      const inBytes = byteLength(source);
      const outBytes = byteLength(result.result);
      const delta = inBytes - outBytes;
      const savedPct = inBytes > 0 ? Math.round((delta / inBytes) * 100) : 0;

      const stats: NonNullable<RunResult["stats"]> = [
        { label: "In", value: formatBytes(inBytes), icon: "FileInput", tone: "default" },
        {
          label: "Out",
          value: formatBytes(outBytes),
          icon: "FileOutput",
          tone: "info",
        },
        { label: "Valid", value: "JSON", icon: "CircleCheck", tone: "success" },
      ];

      // Only show a savings badge when minifying actually shrank the payload.
      if (opts.mode === "minify" && delta > 0) {
        stats.push({
          label: "Saved",
          value: `${formatBytes(delta)} · ${savedPct}%`,
          icon: "TrendingDown",
          tone: "success",
        });
      }

      return { ok: true, output: result.result, stats };
    },
    [],
  );

  const indentDisabled = mode === "minify";

  const optionControls = (
    <>
      <Field label="Mode">
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          ariaLabel="JSON transform mode"
          size="sm"
          options={[
            { value: "beautify", label: "Beautify", icon: "AlignLeft" },
            { value: "minify", label: "Minify", icon: "Minimize2" },
            { value: "sort", label: "Sort keys", icon: "ArrowDownAZ" },
          ]}
        />
      </Field>
      <Field label="Indent" hint="Used for Beautify and Sort keys">
        <SegmentedControl<Indent>
          value={indent}
          onChange={setIndent}
          ariaLabel="Indentation size"
          size="sm"
          className={indentDisabled ? "opacity-40" : undefined}
          options={[
            { value: "2", label: "2" },
            { value: "4", label: "4" },
            { value: "tab", label: "Tab" },
          ]}
        />
      </Field>
    </>
  );

  return (
    <TransformTool<JsonOptions>
      run={run}
      options={options}
      inputLabel="JSON input"
      outputLabel={
        mode === "minify" ? "Minified" : mode === "sort" ? "Sorted" : "Beautified"
      }
      inputPlaceholder='Paste JSON here, drop a.json file, or load a sample, e.g. {"hello":"world"}'
      downloadName={mode === "minify" ? "output.min.json" : "output.json"}
      downloadMime="application/json;charset=utf-8"
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
