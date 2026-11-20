"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { yamlToJson, jsonToYaml } from "@/lib/dev/yaml";
import {
  Field,
  SegmentedControl,
  Toggle,
  TransformTool,
  type RunResult,
} from "@/components/tool/dev";

/** What the user wants done with their input. */
type Mode = "format" | "yaml-to-json" | "json-to-yaml";

/** Indentation choices for the output. */
type Indent = "2" | "4" | "8";

/** Options driving the live transform. */
interface YamlOptions {
  mode: Mode;
  indent: Indent;
  sortKeys: boolean;
  flow: boolean;
}

/** Byte length of a UTF-8 string, using the platform TextEncoder. */
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

function indentNumber(indent: Indent): number {
  return indent === "8" ? 8 : indent === "4" ? 4 : 2;
}

/** Pull a 1-based line/column out of a js-yaml `YAMLException`, when present. */
function yamlErrorLoc(err: unknown): {
  message: string;
  line?: number;
  column?: number;
} {
  const message = err instanceof Error ? err.message : String(err);
  const mark = (err as { mark?: { line?: number; column?: number } })?.mark;
  if (mark && typeof mark.line === "number") {
    return {
      message,
      line: mark.line + 1,
      column: typeof mark.column === "number" ? mark.column + 1 : undefined,
    };
  }
  return { message };
}

/**
 * YAML → YAML formatter. js-yaml is dynamic-imported so it never weighs on the
 * shared bundle. We load the document, then re-dump it with the chosen indent,
 * optional recursive key sorting, and flow (collapsed) or block style. Returns
 * a positioned error, never throws.
 */
async function formatYaml(
  src: string,
  opts: { indent: number; sortKeys: boolean; flow: boolean },
): Promise<
  | { ok: true; result: string }
  | { ok: false; error: { message: string; line?: number; column?: number } }
> {
  try {
    const yaml = await import("js-yaml");
    const value = yaml.load(src);
    const result = yaml.dump(value ?? null, {
      indent: Math.max(1, Math.min(10, opts.indent)),
      sortKeys: opts.sortKeys,
      // flowLevel 0 collapses the whole document to flow style; -1 keeps block.
      flowLevel: opts.flow ? 0 : -1,
      noRefs: true,
      lineWidth: opts.flow ? Infinity : -1,
    });
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: yamlErrorLoc(err) };
  }
}

/** Curated sample documents so the empty state is one click from useful. */
const EXAMPLES = [
  {
    label: "Kubernetes Deployment",
    description: "A manifest to re-indent, sort or convert to JSON",
    value: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.27
          ports:
            - containerPort: 80
`,
  },
  {
    label: "GitHub Actions",
    description: "A CI workflow with quoted 'on' key",
    value: `name: CI
"on":
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
`,
  },
  {
    label: "docker-compose",
    description: "Messy indentation to clean up",
    value: `services:
   web:
      image: nginx
      ports:
        - "8080:80"
   db:
      image: postgres:16
      environment:
          POSTGRES_PASSWORD: secret
`,
  },
  {
    label: "Broken YAML",
    description: "Has a tab-indented line. Try fixing it",
    value: "server:\n\tport: 8080\n  host: localhost\n",
  },
] as const;

const EXTRA_SHORTCUTS = [{ combo: "esc", description: "Dismiss the error banner" }];

/**
 * YAML Formatter & Converter. It composes the `TransformTool` harness (dual
 * editors, toolbar, drag-drop/paste import, copy/download/share, undo/redo,
 * error banner with jump-to-line, keyboard shortcuts) and drives it with the
 * `lib/dev/yaml` conversion engine plus a small js-yaml re-dump for the format
 * mode.
 *
 * `run` switches on the current mode: Format re-indents/sorts/re-styles YAML,
 * YAML → JSON emits pretty JSON, and JSON → YAML produces clean block YAML. On
 * failure each path returns a precise line/column (from a YAMLException mark or
 * JSON.parse), handed to the harness so the banner can jump straight to it.
 * Document stats render as badges. Everything runs live, in the browser.
 */
export default function YamlFormatterTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [mode, setMode] = React.useState<Mode>("format");
  const [indent, setIndent] = React.useState<Indent>("2");
  const [sortKeys, setSortKeys] = React.useState(false);
  const [flow, setFlow] = React.useState(false);

  const options = React.useMemo<YamlOptions>(
    () => ({ mode, indent, sortKeys, flow }),
    [mode, indent, sortKeys, flow],
  );

  const run = React.useCallback(
    async (input: string, o: YamlOptions): Promise<RunResult> => {
      const source = input;
      const indentN = indentNumber(o.indent);

      let result:
        | { ok: true; result: string }
        | {
            ok: false;
            error: { message: string; line?: number; column?: number };
          };

      if (o.mode === "yaml-to-json") {
        result = await yamlToJson(source, { indent: indentN });
      } else if (o.mode === "json-to-yaml") {
        result = await jsonToYaml(source, { indent: indentN });
      } else {
        result = await formatYaml(source, {
          indent: indentN,
          sortKeys: o.sortKeys,
          flow: o.flow,
        });
      }

      if (!result.ok) {
        const { message, line, column } = result.error;
        return {
          ok: false,
          error: message,
          ...(line != null ? { errorLine: line } : {}),
          ...(column != null ? { errorCol: column } : {}),
        };
      }

      const output = result.result;
      const inBytes = byteLength(source);
      const outBytes = byteLength(output);
      const outLines = output ? output.replace(/\n$/, "").split("\n").length : 0;

      const isJsonOut = o.mode === "yaml-to-json";
      const stats: NonNullable<RunResult["stats"]> = [
        { label: "In", value: formatBytes(inBytes), icon: "FileInput", tone: "default" },
        { label: "Out", value: formatBytes(outBytes), icon: "FileOutput", tone: "info" },
        { label: "Lines", value: outLines, icon: "Rows3", tone: "default" },
        {
          label: "Valid",
          value: isJsonOut ? "JSON" : "YAML",
          icon: "CircleCheck",
          tone: "success",
        },
      ];

      return { ok: true, output, stats };
    },
    [],
  );

  const isConvert = mode !== "format";
  const isJsonInput = mode === "json-to-yaml";
  const isJsonOutput = mode === "yaml-to-json";

  const optionControls = (
    <>
      <Field label="Mode">
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          ariaLabel="YAML transform mode"
          size="sm"
          options={[
            { value: "format", label: "Format", icon: "AlignLeft" },
            { value: "yaml-to-json", label: "YAML → JSON", icon: "ArrowRight" },
            { value: "json-to-yaml", label: "JSON → YAML", icon: "ArrowLeft" },
          ]}
        />
      </Field>
      <Field label="Indent">
        <SegmentedControl<Indent>
          value={indent}
          onChange={setIndent}
          ariaLabel="Indentation size"
          size="sm"
          options={[
            { value: "2", label: "2" },
            { value: "4", label: "4" },
            { value: "8", label: "8" },
          ]}
        />
      </Field>
      <Field
        label="Sort keys"
        hint={isConvert ? "Format mode only" : "Alphabetise mapping keys"}
      >
        <Toggle
          checked={sortKeys}
          onChange={setSortKeys}
          disabled={isConvert}
          label="Sort"
        />
      </Field>
      <Field label="Flow style" hint={isConvert ? "Format mode only" : "Collapse to inline"}>
        <Toggle
          checked={flow}
          onChange={setFlow}
          disabled={isConvert}
          label="Flow"
        />
      </Field>
    </>
  );

  return (
    <TransformTool<YamlOptions>
      run={run}
      options={options}
      inputLabel={isJsonInput ? "JSON input" : "YAML input"}
      outputLabel={
        mode === "yaml-to-json"
          ? "JSON"
          : mode === "json-to-yaml"
            ? "YAML"
            : "Formatted YAML"
      }
      inputPlaceholder={
        isJsonInput
          ? 'Paste JSON here to convert to YAML: e.g. {"name":"web","port":80}'
          : "Paste YAML here, drop a.yml/.yaml file, or load a sample, e.g. name: web"
      }
      downloadName={isJsonOutput ? "output.json" : "output.yaml"}
      downloadMime={
        isJsonOutput
          ? "application/json;charset=utf-8"
          : "text/yaml;charset=utf-8"
      }
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
