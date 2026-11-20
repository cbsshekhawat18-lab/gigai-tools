"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { jsonToTypeScript } from "@/lib/dev/jsonToTs";
import {
  Field,
  SegmentedControl,
  Toggle,
  TransformTool,
  type RunResult,
} from "@/components/tool/dev";

/** Emit named interfaces or a tree of type aliases. */
type OutputMode = "interface" | "type";

/** All knobs driving the post-processing of the engine's output. */
interface TsOptions {
  mode: OutputMode;
  rootName: string;
  readonly: boolean;
  exportKeyword: boolean;
  optionalFromNull: boolean;
  prefix: string;
  suffix: string;
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

/** True for a JS identifier the generator would leave unquoted. */
function isSafeIdentifier(name: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

/** PascalCase a user-supplied token (root name / affix) for a type name. */
function sanitizeName(raw: string, fallback: string): string {
  const parts = raw
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return fallback;
  const joined = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  return /^[A-Za-z_$]/.test(joined) ? joined : fallback;
}

/** Collect every declared type name from the engine's interface output. */
function collectTypeNames(code: string): string[] {
  const names = new Set<string>();
  const re = /^(?:export\s+)?interface\s+([A-Za-z_$][\w$]*)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const name = m[1];
    if (name) names.add(name);
  }
  const aliasRe = /^(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*=/gm;
  while ((m = aliasRe.exec(code)) !== null) {
    const name = m[1];
    if (name) names.add(name);
  }
  return [...names];
}

/**
 * Rename every declared type by applying a prefix/suffix, rewriting both the
 * declarations and every reference to them. References are matched as whole
 * identifiers so we never touch a same-named property key.
 */
function applyAffixes(code: string, prefix: string, suffix: string): string {
  if (!prefix && !suffix) return code;
  const names = collectTypeNames(code);
  if (names.length === 0) return code;
  // Rename longest-first so a name that's a substring of another isn't
  // partially rewritten.
  const sorted = names.sort((a, b) => b.length - a.length);
  let out = code;
  for (const name of sorted) {
    const renamed = `${prefix}${name}${suffix}`;
    if (renamed === name) continue;
    out = out.replace(new RegExp(`\\b${name}\\b`, "g"), renamed);
  }
  return out;
}

/** Convert `export interface X {...}` blocks into `export type X = {...}`. */
function interfacesToTypes(code: string): string {
  return code.replace(
    /^(export\s+)?interface\s+([A-Za-z_$][\w$]*)\s*\{/gm,
    (_match, exp: string | undefined, name: string) =>
      `${exp ?? ""}type ${name} = {`,
  );
}

/** Add a `readonly` modifier to every property line inside a body. */
function makeReadonly(code: string): string {
  return code.replace(
    /^(\s+)("[^"]*"|[A-Za-z_$][\w$]*)(\??:)/gm,
    (_m, indent: string, key: string, tail: string) =>
      `${indent}readonly ${key}${tail}`,
  );
}

/** Strip the leading `export ` from every declaration. */
function dropExport(code: string): string {
  return code.replace(/^export\s+/gm, "");
}

/**
 * Make any property whose type includes `| null` optional (add `?`) and drop
 * the `| null` member, i.e. treat a nullable field as an optional field.
 */
function optionalFromNull(code: string): string {
  return code.replace(
    /^(\s+)("[^"]*"|[A-Za-z_$][\w$]*)(\??):\s*(.+);$/gm,
    (match, indent: string, key: string, _opt: string, type: string) => {
      const members = type.split("|").map((t) => t.trim());
      if (!members.includes("null")) return match;
      const kept = members.filter((t) => t !== "null");
      const nextType = kept.length > 0 ? kept.join(" | ") : "unknown";
      return `${indent}${key}?: ${nextType};`;
    },
  );
}

/** Curated samples so the empty state is one click from useful. */
const EXAMPLES = [
  {
    label: "API response",
    description: "A nested user object with roles and settings",
    value: JSON.stringify({
      id: "usr_8f2c",
      name: "Ada Lovelace",
      active: true,
      roles: ["admin", "editor"],
      profile: { location: "London", followers: 1024, bio: null },
      settings: { theme: "dark", notifications: { email: true, sms: false } },
    }),
  },
  {
    label: "Mixed array",
    description: "Records with varying fields, see union merging shine",
    value: JSON.stringify([
      { id: 1, title: "First", published: true, views: 240 },
      { id: 2, title: "Second", tags: ["news"] },
      { id: 3, title: "Third", published: false, views: null },
    ]),
  },
  {
    label: "Config file",
    description: "A tsconfig-style nested object",
    value: JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        strict: true,
        paths: { "@/*": ["./*"] },
      },
      include: ["src", "types"],
      exclude: ["node_modules"],
    }),
  },
  {
    label: "Broken JSON",
    description: "Has a trailing comma. Try fixing it",
    value: '{\n  "name": "example",\n  "tags": ["a", "b",],\n}',
  },
] as const;

const EXTRA_SHORTCUTS = [
  { combo: "esc", description: "Dismiss the error banner" },
];

/**
 * JSON → TypeScript. Composes the `TransformTool` harness (dual editors,
 * toolbar, drag-drop/paste import, copy/download/share, undo/redo, error banner
 * with jump-to-line, keyboard shortcuts) and drives it with the pure
 * `lib/dev/jsonToTs` inference engine.
 *
 * The engine emits `export interface` declarations with deep union merging
 * across array elements and optional-from-null already baked in. Everything the
 * user toggles here is a deterministic, text-level post-processing pass over
 * that output, interface↔type, readonly modifiers, export stripping, extra
 * optional-from-null collapsing, and prefix/suffix renaming (which rewrites
 * declarations and references but never property keys). Stats show the input
 * size and the number of generated declarations. All local, nothing uploaded.
 */
export default function JsonToTypeScriptTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const [mode, setMode] = React.useState<OutputMode>("interface");
  const [rootName, setRootName] = React.useState("Root");
  const [readonly, setReadonly] = React.useState(false);
  const [exportKeyword, setExportKeyword] = React.useState(true);
  const [optNull, setOptNull] = React.useState(false);
  const [prefix, setPrefix] = React.useState("");
  const [suffix, setSuffix] = React.useState("");

  const options = React.useMemo<TsOptions>(
    () => ({
      mode,
      rootName,
      readonly,
      exportKeyword,
      optionalFromNull: optNull,
      prefix,
      suffix,
    }),
    [mode, rootName, readonly, exportKeyword, optNull, prefix, suffix],
  );

  const run = React.useCallback(
    (input: string, opts: TsOptions): RunResult => {
      const root = sanitizeName(opts.rootName, "Root");
      const result = jsonToTypeScript(input, root);

      if (!result.ok) {
        const { message, line, column } = result.error;
        return {
          ok: false,
          error: message,
          ...(line != null ? { errorLine: line } : {}),
          ...(column != null ? { errorCol: column } : {}),
        };
      }

      let code = result.code;
      if (opts.optionalFromNull) code = optionalFromNull(code);
      if (opts.readonly) code = makeReadonly(code);
      if (opts.mode === "type") code = interfacesToTypes(code);

      const pre = isSafeIdentifier(opts.prefix + "X") ? opts.prefix : "";
      const suf = isSafeIdentifier("X" + opts.suffix) ? opts.suffix : "";
      code = applyAffixes(code, pre, suf);

      if (!opts.exportKeyword) code = dropExport(code);

      const declCount =
        (code.match(/^(?:export\s+)?(?:interface|type)\s/gm) ?? []).length;

      const stats: NonNullable<RunResult["stats"]> = [
        {
          label: "In",
          value: formatBytes(byteLength(input)),
          icon: "FileInput",
          tone: "default",
        },
        {
          label: opts.mode === "type" ? "Types" : "Interfaces",
          value: declCount,
          icon: "Braces",
          tone: "info",
        },
        { label: "Valid", value: "JSON", icon: "CircleCheck", tone: "success" },
      ];

      return { ok: true, output: code, stats };
    },
    [],
  );

  const optionControls = (
    <>
      <Field label="Output">
        <SegmentedControl<OutputMode>
          value={mode}
          onChange={setMode}
          ariaLabel="Output declaration kind"
          size="sm"
          options={[
            { value: "interface", label: "interface", icon: "Braces" },
            { value: "type", label: "type", icon: "Equal" },
          ]}
        />
      </Field>
      <Field label="Root name" hint="Top-level type name">
        <input
          type="text"
          value={rootName}
          onChange={(e) => setRootName(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Root type name"
          placeholder="Root"
          className="h-8 w-32 rounded-md border border-black/10 bg-white/60 px-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:focus:border-white/20 dark:focus:ring-white/10"
        />
      </Field>
      <Field label="Prefix" hint="Added to every name">
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Type name prefix"
          placeholder="e.g. I"
          className="h-8 w-24 rounded-md border border-black/10 bg-white/60 px-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:focus:border-white/20 dark:focus:ring-white/10"
        />
      </Field>
      <Field label="Suffix" hint="Added to every name">
        <input
          type="text"
          value={suffix}
          onChange={(e) => setSuffix(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Type name suffix"
          placeholder="e.g. DTO"
          className="h-8 w-24 rounded-md border border-black/10 bg-white/60 px-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100 dark:focus:border-white/20 dark:focus:ring-white/10"
        />
      </Field>
      <Field label="Readonly">
        <Toggle checked={readonly} onChange={setReadonly} label="readonly props" />
      </Field>
      <Field label="Export">
        <Toggle
          checked={exportKeyword}
          onChange={setExportKeyword}
          label="export keyword"
        />
      </Field>
      <Field label="Nullable" hint="Treat | null as optional ?">
        <Toggle checked={optNull} onChange={setOptNull} label="optional from null" />
      </Field>
    </>
  );

  return (
    <TransformTool<TsOptions>
      run={run}
      options={options}
      inputLabel="JSON input"
      outputLabel={mode === "type" ? "TypeScript types" : "TypeScript interfaces"}
      inputPlaceholder='Paste JSON here, drop a.json file, or load a sample, e.g. {"id":1,"name":"Ada"}'
      downloadName="types.ts"
      downloadMime="text/plain;charset=utf-8"
      examples={EXAMPLES}
      optionControls={optionControls}
      extraShortcuts={EXTRA_SHORTCUTS}
      lineNumbers
    />
  );
}
