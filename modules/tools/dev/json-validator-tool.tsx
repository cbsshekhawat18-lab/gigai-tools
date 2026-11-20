"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { safeParse, type JsonError } from "@/lib/dev/json";
import {
  CodePane,
  CopyButton,
  ErrorBanner,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  ShortcutsHelp,
  useShortcuts,
  useShareState,
  useFileDrop,
  type ShortcutHint,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────── */
/* Sample & shortcuts                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

/** A deliberately-broken sample: single quotes, trailing comma, a comment and
 *  an unquoted key, every problem Auto-fix repairs, so the demo is instructive. */
const SAMPLE = `{
 // a lenient JSONC-style config. Try Auto-fix
 'name': 'gigai-tools',
 version: "1.0.0",
 "tags": ["json", "validator", "linter",],
 "nested": { "depth": { "here": true } },
}`;

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Load the sample document" },
  { combo: "mod+shift+f", description: "Run lenient Auto-fix" },
  { combo: "mod+shift+c", description: "Copy the JSON" },
  { combo: "mod+backspace", description: "Clear the editor" },
  { combo: "esc", description: "Dismiss the error banner" },
];

/* ────────────────────────────────────────────────────────────────────────── */
/* Byte helpers                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

const ENCODER = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
function byteLength(s: string): number {
  if (ENCODER) return ENCODER.encode(s).length;
  return unescape(encodeURIComponent(s)).length;
}
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

/* ────────────────────────────────────────────────────────────────────────── */
/* Structure profiling (only runs on valid JSON)                                */
/* ────────────────────────────────────────────────────────────────────────── */

interface Stats {
  keys: number;
  depth: number;
  objects: number;
  arrays: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
  bytes: number;
}

/** Recursively profile a parsed JSON value: counts, depth and value types. */
function profile(value: unknown): Omit<Stats, "bytes"> {
  const acc = {
    keys: 0,
    depth: 0,
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0,
  };

  const walk = (node: unknown, depth: number): void => {
    if (depth > acc.depth) acc.depth = depth;
    if (node === null) {
      acc.nulls += 1;
      return;
    }
    if (Array.isArray(node)) {
      acc.arrays += 1;
      for (const item of node) walk(item, depth + 1);
      return;
    }
    switch (typeof node) {
      case "object": {
        acc.objects += 1;
        const entries = Object.keys(node as Record<string, unknown>);
        acc.keys += entries.length;
        for (const key of entries) {
          walk((node as Record<string, unknown>)[key], depth + 1);
        }
        return;
      }
      case "string":
        acc.strings += 1;
        return;
      case "number":
        acc.numbers += 1;
        return;
      case "boolean":
        acc.booleans += 1;
        return;
      default:
        return;
    }
  };

  walk(value, value !== null && typeof value === "object" ? 1 : 0);
  return acc;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Plain-English diagnosis of the first syntax error                            */
/* ────────────────────────────────────────────────────────────────────────── */

interface Diagnosis {
  /** Short label for the badge, e.g. "Trailing comma". */
  kind: string;
  /** One-line human explanation of the RFC rule broken. */
  explanation: string;
  /** Suggested lucide icon for the badge. */
  icon: string;
}

/** Inspect the raw source around the error offset (and whole doc) to name the
 *  most likely cause. Best-effort and conservative: falls back to a generic
 *  syntax label rather than guessing wrong. */
function diagnose(src: string, err: JsonError): Diagnosis | null {
  const pos =
    err.position != null
      ? err.position
      : err.line != null && err.column != null
        ? lineColToOffset(src, err.line, err.column)
        : null;

  // Look at a small window around the failure point.
  const around =
    pos != null ? src.slice(Math.max(0, pos - 24), pos + 1) : src;

  // Trailing comma: a comma followed only by whitespace then a closer.
  if (/,\s*[}\]]/.test(pos != null ? src.slice(Math.max(0, pos - 8), pos + 8) : src)) {
    return {
      kind: "Trailing comma",
      explanation:
        "A comma appears before a closing } or ]. JSON forbids a comma after the last element, remove it.",
      icon: "Comma",
    };
  }
  // Comments. Check the whole document, they're a common JSONC leftover.
  if (/\/\/[^\n]*/.test(src) || /\/\*[\s\S]*?\*\//.test(src)) {
    return {
      kind: "Comment",
      explanation:
        "JSON (RFC 8259) has no comments. Strip // line and /* block */ comments: that's JSONC, not JSON.",
      icon: "MessageSquareOff",
    };
  }
  // Single quotes near the error.
  if (around.includes("'")) {
    return {
      kind: "Single quote",
      explanation:
        "Strings and keys must use double quotes \" in JSON, never single quotes ' . Auto-fix can convert these.",
      icon: "Quote",
    };
  }
  // NaN / Infinity / undefined literals.
  const badLiteral = /\b(NaN|Infinity|-Infinity|undefined)\b/.exec(src);
  if (badLiteral && badLiteral[1]) {
    return {
      kind: `${badLiteral[1]} literal`,
      explanation: `${badLiteral[1]} is not valid JSON, only numbers, strings, true, false and null are allowed. Use a string or null instead.`,
      icon: "Ban",
    };
  }
  // Unquoted key: an identifier directly followed by a colon.
  if (/[{,]\s*[A-Za-z_$][\w$]*\s*:/.test(pos != null ? src.slice(Math.max(0, pos - 20), pos + 4) : src)) {
    return {
      kind: "Unquoted key",
      explanation:
        "Object keys must be wrapped in double quotes in JSON. Quote the property name, e.g. \"name\": … .",
      icon: "KeyRound",
    };
  }
  if (/Unexpected end of (JSON|data|input)/i.test(err.message)) {
    return {
      kind: "Unexpected end",
      explanation:
        "The document ended early: you're likely missing a closing }, ] or \". Check the end of the file.",
      icon: "FileWarning",
    };
  }
  return null;
}

/** 1-based (line,column) → 0-based character offset. */
function lineColToOffset(src: string, line: number, column: number): number {
  let currentLine = 1;
  let i = 0;
  while (i < src.length && currentLine < line) {
    if (src[i] === "\n") currentLine += 1;
    i += 1;
  }
  return i + (column - 1);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Lenient auto-fix: repairs the common non-standard patterns, char by char */
/* ────────────────────────────────────────────────────────────────────────── */

interface FixResult {
  text: string;
  changes: string[];
}

/**
 * A small single-pass rewriter that is quote/comment aware. It:
 *  - strips // line and /* block *\/ comments,
 *  - converts single-quoted strings/keys to double-quoted (escaping inner "),
 *  - quotes unquoted identifier keys,
 *  - removes trailing commas before } or ].
 * Everything it does is reported in `changes`. It never touches string contents
 * of already-double-quoted strings, so data is preserved.
 */
function autoFix(src: string): FixResult {
  let out = "";
  const changes: string[] = [];
  let i = 0;
  const n = src.length;
  let lineComments = 0;
  let blockComments = 0;
  let singleToDouble = 0;
  let quotedKeys = 0;

  const lineAt = (idx: number): number => {
    let l = 1;
    for (let k = 0; k < idx && k < src.length; k += 1) if (src[k] === "\n") l += 1;
    return l;
  };

  while (i < n) {
    const ch = src[i] ?? "";

    // Skip // line comments.
    if (ch === "/" && src[i + 1] === "/") {
      const ln = lineAt(i);
      lineComments += 1;
      changes.push(`Line ${ln}: removed // line comment`);
      i += 2;
      while (i < n && src[i] !== "\n") i += 1;
      continue;
    }
    // Skip /* block */ comments.
    if (ch === "/" && src[i + 1] === "*") {
      const ln = lineAt(i);
      blockComments += 1;
      changes.push(`Line ${ln}: removed /* block */ comment`);
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i += 1;
      i += 2;
      continue;
    }
    // Double-quoted string, copy verbatim (handles escapes).
    if (ch === '"') {
      out += ch;
      i += 1;
      while (i < n) {
        const c = src[i];
        out += c;
        if (c === "\\") {
          if (i + 1 < n) {
            out += src[i + 1];
            i += 2;
            continue;
          }
        }
        i += 1;
        if (c === '"') break;
      }
      continue;
    }
    // Single-quoted string → double-quoted.
    if (ch === "'") {
      const ln = lineAt(i);
      singleToDouble += 1;
      let body = "";
      i += 1;
      while (i < n && src[i] !== "'") {
        const c = src[i];
        if (c === "\\" && i + 1 < n) {
          const next = src[i + 1];
          // Preserve escapes; a \' becomes a literal '.
          body += next === "'" ? "'" : `\\${next}`;
          i += 2;
          continue;
        }
        if (c === '"') body += '\\"';
        else body += c;
        i += 1;
      }
      i += 1; // closing '
      out += `"${body}"`;
      changes.push(`Line ${ln}: converted single-quoted string to double quotes`);
      continue;
    }
    // Trailing comma: a comma followed only by whitespace/comments then a closer.
    if (ch === ",") {
      let j = i + 1;
      // peek past whitespace and comments
      while (j < n) {
        const cj = src[j];
        if (cj === " " || cj === "\t" || cj === "\n" || cj === "\r") {
          j += 1;
        } else if (cj === "/" && src[j + 1] === "/") {
          j += 2;
          while (j < n && src[j] !== "\n") j += 1;
        } else if (cj === "/" && src[j + 1] === "*") {
          j += 2;
          while (j < n && !(src[j] === "*" && src[j + 1] === "/")) j += 1;
          j += 2;
        } else {
          break;
        }
      }
      if (src[j] === "}" || src[j] === "]") {
        const ln = lineAt(i);
        changes.push(`Line ${ln}: removed trailing comma before ${src[j]}`);
        i += 1; // drop the comma
        continue;
      }
      out += ch;
      i += 1;
      continue;
    }
    // Unquoted identifier key: after { or , (whitespace-permitting), an
    // identifier directly followed by a colon.
    if (/[A-Za-z_$]/.test(ch)) {
      const prev = lastNonSpace(out);
      if (prev === "{" || prev === ",") {
        let j = i;
        let ident = "";
        while (j < n && /[\w$]/.test(src[j] ?? "")) {
          ident += src[j] ?? "";
          j += 1;
        }
        let k = j;
        while (k < n && (src[k] === " " || src[k] === "\t")) k += 1;
        if (src[k] === ":" && ident) {
          const ln = lineAt(i);
          quotedKeys += 1;
          out += `"${ident}"`;
          changes.push(`Line ${ln}: quoted unquoted key "${ident}"`);
          i = j;
          continue;
        }
      }
    }

    out += ch;
    i += 1;
  }

  // Collapse per-line noise into concise summary lines at the top-of-mind order.
  const summary: string[] = [];
  if (lineComments + blockComments > 0)
    summary.push(`Removed ${lineComments + blockComments} comment(s)`);
  if (singleToDouble > 0)
    summary.push(`Converted ${singleToDouble} single-quoted string(s)`);
  if (quotedKeys > 0) summary.push(`Quoted ${quotedKeys} bare key(s)`);
  const trailing = changes.filter((c) => c.includes("trailing comma")).length;
  if (trailing > 0) summary.push(`Removed ${trailing} trailing comma(s)`);

  return { text: out, changes: summary.length ? summary.concat(changes) : changes };
}

/** Last non-whitespace character already emitted (for key-context detection). */
function lastNonSpace(s: string): string {
  for (let i = s.length - 1; i >= 0; i -= 1) {
    const c = s[i] ?? "";
    if (c !== " " && c !== "\t" && c !== "\n" && c !== "\r") return c;
  }
  return "";
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Component                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export default function JsonValidatorTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);
  const [input, setInput] = React.useState("");
  const [fixReport, setFixReport] = React.useState<string[] | null>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const share = useShareState({ onInit: (v) => setInput(v) });

  const trimmed = input.trim();

  // Live validation (native JSON.parse via the engine's safeParse).
  const result = React.useMemo(
    () => (trimmed ? safeParse(input) : null),
    [trimmed, input],
  );
  const valid = result?.ok === true;
  const err = result && result.ok === false ? result.error : null;

  const stats = React.useMemo<Stats | null>(() => {
    if (!result || !result.ok) return null;
    return { ...profile(result.value), bytes: byteLength(input) };
  }, [result, input]);

  const diagnosis = React.useMemo(
    () => (err ? diagnose(input, err) : null),
    [err, input],
  );

  // The failing line + a caret, reproduced for the error banner region.
  const caret = React.useMemo(() => {
    if (!err || err.line == null || err.column == null) return null;
    const lines = input.split("\n");
    const lineText = lines[err.line - 1];
    if (lineText == null) return null;
    // Expand tabs to keep the caret aligned in the monospace preview.
    const expanded = lineText.replace(/\t/g, "    ");
    const col = Math.max(0, err.column - 1);
    return { line: expanded, caret: `${" ".repeat(col)}^` };
  }, [err, input]);

  React.useEffect(() => {
    // Any edit invalidates a stale fix report.
    setFixReport(null);
    setDismissed(false);
  }, [input]);

  const loadSample = React.useCallback(() => {
    setInput(SAMPLE);
    inputRef.current?.focus();
  }, []);

  const clearAll = React.useCallback(() => {
    setInput("");
    setFixReport(null);
    inputRef.current?.focus();
  }, []);

  const runFix = React.useCallback(() => {
    if (!trimmed) return;
    const { text, changes } = autoFix(input);
    setInput(text);
    // useEffect resets fixReport on input change; set it on the next tick.
    window.setTimeout(() => setFixReport(changes), 0);
    inputRef.current?.focus();
  }, [input, trimmed]);

  const jumpToError = React.useCallback(() => {
    const el = inputRef.current;
    if (!el || !err || err.line == null) return;
    const offset =
      err.column != null
        ? lineColToOffset(input, err.line, err.column)
        : lineColToOffset(input, err.line, 1);
    el.focus();
    el.setSelectionRange(offset, offset);
    // Nudge the caret line into view.
    const approxLineHeight = 20.8;
    el.scrollTop = Math.max(0, (err.line - 3) * approxLineHeight);
  }, [err, input]);

  const doShare = React.useCallback(() => {
    if (trimmed) void share.copyShareLink(input);
  }, [trimmed, input, share]);

  const onFiles = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    file
      .text()
      .then((t) => setInput(t))
      .catch(() => undefined);
  }, []);

  const { isDragging, dropProps } = useFileDrop({ onFiles });

  useShortcuts({
    "mod+enter": () => loadSample(),
    "mod+backspace": () => clearAll(),
    "mod+shift+f": () => runFix(),
    "mod+shift+c": () => {
      if (trimmed) void navigator.clipboard.writeText(input).catch(() => undefined);
    },
    esc: () => setDismissed(true),
  });

  const errorLine = err?.line ?? null;
  const showBanner = err && !dismissed;

  return (
    <div className="flex flex-col gap-4" {...dropProps}>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton
          icon="Sparkles"
          label="Sample"
          kbd="mod+enter"
          onClick={loadSample}
        />
        <ToolbarButton
          icon="Wand2"
          label="Auto-fix"
          kbd="mod+shift+f"
          variant="primary"
          onClick={runFix}
          disabled={!trimmed || valid}
          title={
            valid
              ? "Already valid, nothing to fix"
              : "Repair trailing commas, single quotes, comments and unquoted keys"
          }
        />
        <ToolbarDivider />
        <CopyButton
          label="Copy"
          kbd="mod+shift+c"
          getValue={() => input}
          disabled={!trimmed}
        />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Link copied!" : "Share"}
          variant={share.justCopied ? "active" : "default"}
          onClick={doShare}
          disabled={!trimmed}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Clear"
          kbd="mod+backspace"
          variant="destructive"
          onClick={clearAll}
          disabled={!input}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && <ErrorBanner error={share.shareError} variant="warning" />}

      {/* ── Verdict strip ───────────────────────────────────────────────── */}
      {trimmed && (
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          {valid ? (
            <StatBadge tone="success" icon="CircleCheck" label="Status" value="Valid JSON" />
          ) : (
            <StatBadge tone="danger" icon="CircleX" label="Status" value="Invalid JSON" />
          )}
          {valid && stats && (
            <>
              <StatBadge icon="KeyRound" label="Keys" value={stats.keys} />
              <StatBadge icon="Network" label="Depth" value={stats.depth} />
              <StatBadge icon="Braces" label="Objects" value={stats.objects} />
              <StatBadge icon="Brackets" label="Arrays" value={stats.arrays} />
              <StatBadge icon="Scale" label="Size" value={formatBytes(stats.bytes)} />
            </>
          )}
          {!valid && err?.line != null && err.column != null && (
            <StatBadge
              tone="danger"
              icon="Crosshair"
              label="At"
              value={`line ${err.line}, col ${err.column}`}
            />
          )}
          {!valid && diagnosis && (
            <StatBadge tone="warning" icon={diagnosis.icon} label="Likely" value={diagnosis.kind} />
          )}
        </div>
      )}

      {/* ── Editor ──────────────────────────────────────────────────────── */}
      <div className="relative">
        <CodePane
          ref={inputRef}
          id="json-validator-input"
          value={input}
          onChange={setInput}
          label="JSON input"
          placeholder='Paste JSON here, drop a.json file, or load a sample, e.g. {"hello":"world"}'
          onDropText={(t) => setInput(t)}
          lineNumbers
          wrap={false}
          showWrapToggle
          minHeight={220}
          maxHeight={460}
          fontSize={13}
          ariaLabel="JSON input to validate"
          errorLine={errorLine}
        />
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Upload" size={16} /> Drop a .json or .txt file
            </span>
          </div>
        )}
      </div>

      {/* ── Error banner + caret + diagnosis ────────────────────────────── */}
      {showBanner && err && (
        <div className="flex flex-col gap-2">
          <ErrorBanner
            error={err.message}
            {...(err.line != null ? { line: err.line } : {})}
            {...(err.column != null ? { col: err.column } : {})}
            onJumpToLine={err.line != null ? jumpToError : undefined}
            onDismiss={() => setDismissed(true)}
          />

          {caret && (
            <div className="overflow-x-auto rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <pre className="m-0 font-mono text-xs leading-relaxed text-foreground">
                <span className="select-none text-muted-foreground">
                  {String(err?.line).padStart(4, " ")} │{" "}
                </span>
                {caret.line}
                {"\n"}
                <span className="select-none text-muted-foreground">{"     │ "}</span>
                <span className="font-bold text-destructive">{caret.caret}</span>
              </pre>
            </div>
          )}

          {diagnosis && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-sm">
              <Icon
                name={diagnosis.icon}
                size={16}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />
              <div className="min-w-0">
                <p className="font-medium text-foreground">{diagnosis.kind}</p>
                <p className="mt-0.5 text-muted-foreground">{diagnosis.explanation}</p>
              </div>
              <button
                type="button"
                onClick={runFix}
                className="ml-auto inline-flex shrink-0 items-center gap-1.5 self-center rounded-md border border-amber-500/40 px-2.5 py-1 text-xs font-medium text-amber-700 outline-none transition-colors hover:bg-amber-500/10 focus-visible:ring-2 focus-visible:ring-ring dark:text-amber-300"
              >
                <Icon name="Wand2" size={13} /> Fix it
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Auto-fix report ─────────────────────────────────────────────── */}
      {fixReport && (
        <div className="overflow-hidden rounded-lg border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 px-3 py-2">
            <span className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <Icon name="Wand2" size={15} />
              {fixReport.length > 0
                ? `Auto-fix applied ${fixReport.length} change${fixReport.length === 1 ? "" : "s"}`
                : "Auto-fix ran, nothing to change"}
            </span>
            <button
              type="button"
              onClick={() => setFixReport(null)}
              aria-label="Dismiss auto-fix report"
              className="rounded p-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
          {fixReport.length > 0 && (
            <ul className="max-h-48 overflow-y-auto px-3 py-2 text-xs text-muted-foreground">
              {fixReport.map((c, idx) => (
                <li key={idx} className="flex items-start gap-1.5 py-0.5">
                  <Icon
                    name="Check"
                    size={12}
                    className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          )}
          {valid && fixReport.length > 0 && (
            <p className="border-t border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              The document is now valid JSON.
            </p>
          )}
        </div>
      )}

      {/* ── Type breakdown (valid docs) ─────────────────────────────────── */}
      {valid && stats && (
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-card/60 p-3 sm:grid-cols-4">
          <TypeStat label="Strings" value={stats.strings} icon="Type" />
          <TypeStat label="Numbers" value={stats.numbers} icon="Hash" />
          <TypeStat label="Booleans" value={stats.booleans} icon="ToggleRight" />
          <TypeStat label="Nulls" value={stats.nulls} icon="CircleSlash" />
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!trimmed && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              accent.soft,
            )}
          >
            <Icon name="FileCheck2" size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Paste JSON to validate it instantly
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              We check it against RFC 8259, point a caret at the first error, explain
              what went wrong, and can auto-fix common mistakes, all in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
              accent.border,
              accent.text,
            )}
          >
            <Icon name="Sparkles" size={14} /> Load a broken sample to fix
          </button>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Validation, auto-fixing and profiling run entirely in this browser tab
          using its native JSON engine. Nothing is uploaded. It is safe to validate
          JSON containing tokens, keys or personal data.
        </span>
      </p>
    </div>
  );
}

/** A compact labelled type-count cell for the value-type breakdown. */
function TypeStat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon name={icon} size={14} />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
