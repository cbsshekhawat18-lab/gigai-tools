"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { safeParse } from "@/lib/dev/json";
import {
  CodePane,
  CopyButton,
  ErrorBanner,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  Field,
  Toggle,
  ShortcutsHelp,
  useShortcuts,
  useShareState,
  useFileDrop,
  type ShortcutHint,
} from "@/components/tool/dev";

// ── Sample pair: an "order + whitespace + volatile field" change that a text
// diff would badly over-report, but structurally is just three real changes. ──
const SAMPLE_LEFT = `{
  "id": "usr_8a1",
  "name": "Ada Lovelace",
  "active": true,
  "roles": ["admin", "editor"],
  "profile": { "city": "London", "verified": false },
  "updatedAt": "2026-06-01T10:00:00Z"
}`;

const SAMPLE_RIGHT = `{
  "name": "Ada Lovelace",
  "roles": ["admin", "owner"],
  "active": true,
  "id": "usr_8a1",
  "profile": { "verified": true, "city": "London", "tier": "pro" },
  "updatedAt": "2026-06-30T14:22:00Z"
}`;

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Load the sample pair" },
  { combo: "mod+shift+c", description: "Copy the diff report" },
  { combo: "mod+backspace", description: "Clear both documents" },
  { combo: "mod+shift+x", description: "Swap left and right" },
];

type ChangeKind = "added" | "removed" | "changed" | "unchanged";

interface DiffEntry {
  path: string;
  kind: ChangeKind;
  /** Present for removed/changed. */
  left?: unknown;
  /** Present for added/changed. */
  right?: unknown;
}

interface DiffOptions {
  ignoreKeyOrder: boolean;
  ignoreWhitespace: boolean;
  ignoreKeys: ReadonlySet<string>;
}

interface DiffSummary {
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Build a readable child path segment, using bracket notation for arrays. */
function joinPath(base: string, key: string | number): string {
  if (typeof key === "number") return `${base}[${key}]`;
  const safe = /^[A-Za-z_$][\w$]*$/.test(key);
  if (!base) return safe ? key : `["${key}"]`;
  return safe ? `${base}.${key}` : `${base}["${key}"]`;
}

/** Normalise a leaf value for equality, honouring the whitespace option. */
function normalizeLeaf(v: unknown, opts: DiffOptions): unknown {
  if (opts.ignoreWhitespace && typeof v === "string") {
    return v.replace(/\s+/g, " ").trim();
  }
  return v;
}

function leafEqual(a: unknown, b: unknown, opts: DiffOptions): boolean {
  return Object.is(normalizeLeaf(a, opts), normalizeLeaf(b, opts));
}

/**
 * Recursively compare two parsed JSON values by path. Object keys are matched by
 * name (order-insensitive by construction); arrays are matched by index; ignored
 * keys are skipped at every level. Emits one entry per differing (or, if asked,
 * unchanged) leaf/path.
 */
function diffValues(
  path: string,
  left: unknown,
  right: unknown,
  opts: DiffOptions,
  out: DiffEntry[],
): void {
  // Both objects → compare by union of keys (minus ignored).
  if (isPlainObject(left) && isPlainObject(right)) {
    const keys = new Set<string>([...Object.keys(left), ...Object.keys(right)]);
    for (const key of keys) {
      if (opts.ignoreKeys.has(key)) continue;
      const hasL = Object.prototype.hasOwnProperty.call(left, key);
      const hasR = Object.prototype.hasOwnProperty.call(right, key);
      const child = joinPath(path, key);
      if (hasL && !hasR) {
        out.push({ path: child, kind: "removed", left: left[key] });
      } else if (!hasL && hasR) {
        out.push({ path: child, kind: "added", right: right[key] });
      } else {
        diffValues(child, left[key], right[key], opts, out);
      }
    }
    return;
  }

  // Both arrays → compare by index.
  if (Array.isArray(left) && Array.isArray(right)) {
    const max = Math.max(left.length, right.length);
    for (let i = 0; i < max; i += 1) {
      const inL = i < left.length;
      const inR = i < right.length;
      const child = joinPath(path, i);
      if (inL && !inR) {
        out.push({ path: child, kind: "removed", left: left[i] });
      } else if (!inL && inR) {
        out.push({ path: child, kind: "added", right: right[i] });
      } else {
        diffValues(child, left[i], right[i], opts, out);
      }
    }
    return;
  }

  // Mismatched container shapes, or two leaves.
  const bothLeaf = !isPlainObject(left) && !Array.isArray(left) && !isPlainObject(right) && !Array.isArray(right);
  if (bothLeaf ? leafEqual(left, right, opts) : deepEqual(left, right, opts)) {
    out.push({ path: path || "(root)", kind: "unchanged", left, right });
  } else {
    out.push({ path: path || "(root)", kind: "changed", left, right });
  }
}

/** Structural deep-equality used for mismatched-container comparisons. */
function deepEqual(a: unknown, b: unknown, opts: DiffOptions): boolean {
  if (isPlainObject(a) && isPlainObject(b)) {
    const ak = Object.keys(a).filter((k) => !opts.ignoreKeys.has(k));
    const bk = Object.keys(b).filter((k) => !opts.ignoreKeys.has(k));
    if (ak.length !== bk.length) return false;
    return ak.every(
      (k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k], opts),
    );
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((x, i) => deepEqual(x, b[i], opts));
  }
  if (isPlainObject(a) !== isPlainObject(b) || Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }
  return leafEqual(a, b, opts);
}

function summarize(entries: readonly DiffEntry[]): DiffSummary {
  const s: DiffSummary = { added: 0, removed: 0, changed: 0, unchanged: 0 };
  for (const e of entries) s[e.kind] += 1;
  return s;
}

/** Compact one-line preview of any JSON value for the diff rows. */
function preview(value: unknown): string {
  try {
    const s = JSON.stringify(value);
    if (s === undefined) return String(value);
    return s.length > 120 ? `${s.slice(0, 117)}…` : s;
  } catch {
    return String(value);
  }
}

const KIND_META: Record<
  Exclude<ChangeKind, "unchanged">,
  { icon: string; label: string; text: string; soft: string; border: string }
> = {
  added: {
    icon: "Plus",
    label: "Added",
    text: "text-emerald-600 dark:text-emerald-400",
    soft: "bg-emerald-500/10",
    border: "border-l-emerald-500",
  },
  removed: {
    icon: "Minus",
    label: "Removed",
    text: "text-rose-600 dark:text-rose-400",
    soft: "bg-rose-500/10",
    border: "border-l-rose-500",
  },
  changed: {
    icon: "PencilLine",
    label: "Changed",
    text: "text-amber-600 dark:text-amber-400",
    soft: "bg-amber-500/10",
    border: "border-l-amber-500",
  },
};

interface ShareShape {
  l: string;
  r: string;
  o?: { ko?: boolean; ws?: boolean; ik?: string };
}

export default function JsonDiffTool({ tool }: { tool: WorkspaceToolData }) {
  const accent = accentStyle(tool.accent);
  const [left, setLeft] = React.useState("");
  const [right, setRight] = React.useState("");
  const [ignoreKeyOrder, setIgnoreKeyOrder] = React.useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = React.useState(false);
  const [ignoreKeysRaw, setIgnoreKeysRaw] = React.useState("");
  const [showUnchanged, setShowUnchanged] = React.useState(false);

  const leftRef = React.useRef<HTMLTextAreaElement>(null);

  const share = useShareState({
    onInit: (v) => {
      try {
        const s = JSON.parse(v) as ShareShape;
        setLeft(typeof s.l === "string" ? s.l : "");
        setRight(typeof s.r === "string" ? s.r : "");
        if (s.o) {
          if (typeof s.o.ko === "boolean") setIgnoreKeyOrder(s.o.ko);
          if (typeof s.o.ws === "boolean") setIgnoreWhitespace(s.o.ws);
          if (typeof s.o.ik === "string") setIgnoreKeysRaw(s.o.ik);
        }
      } catch {
        /* ignore malformed share payloads */
      }
    },
  });

  const parsedLeft = React.useMemo(() => (left.trim() ? safeParse(left) : null), [left]);
  const parsedRight = React.useMemo(() => (right.trim() ? safeParse(right) : null), [right]);

  const leftError = parsedLeft && !parsedLeft.ok ? parsedLeft.error : null;
  const rightError = parsedRight && !parsedRight.ok ? parsedRight.error : null;

  const ignoreKeys = React.useMemo<ReadonlySet<string>>(
    () =>
      new Set(
        ignoreKeysRaw
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      ),
    [ignoreKeysRaw],
  );

  const options = React.useMemo<DiffOptions>(
    () => ({ ignoreKeyOrder, ignoreWhitespace, ignoreKeys }),
    [ignoreKeyOrder, ignoreWhitespace, ignoreKeys],
  );

  const entries = React.useMemo<DiffEntry[] | null>(() => {
    if (!parsedLeft?.ok || !parsedRight?.ok) return null;
    const out: DiffEntry[] = [];
    diffValues("", parsedLeft.value, parsedRight.value, options, out);
    // Stable, readable ordering: differences first (by path), then unchanged.
    const weight: Record<ChangeKind, number> = { changed: 0, removed: 1, added: 2, unchanged: 3 };
    out.sort((a, b) =>
      weight[a.kind] !== weight[b.kind]
        ? weight[a.kind] - weight[b.kind]
        : a.path.localeCompare(b.path),
    );
    return out;
  }, [parsedLeft, parsedRight, options]);

  const summary = React.useMemo(() => (entries ? summarize(entries) : null), [entries]);
  const identical =
    summary != null && summary.added === 0 && summary.removed === 0 && summary.changed === 0;

  const visibleEntries = React.useMemo(
    () => (entries ? entries.filter((e) => showUnchanged || e.kind !== "unchanged") : []),
    [entries, showUnchanged],
  );

  const report = React.useCallback((): string => {
    if (!entries || !summary) return "";
    const lines: string[] = [
      `JSON Diff, ${summary.added} added, ${summary.removed} removed, ${summary.changed} changed`,
      "",
    ];
    for (const e of entries) {
      if (e.kind === "unchanged") continue;
      if (e.kind === "added") lines.push(`+ ${e.path}: ${preview(e.right)}`);
      else if (e.kind === "removed") lines.push(`- ${e.path}: ${preview(e.left)}`);
      else lines.push(`~ ${e.path}: ${preview(e.left)} -> ${preview(e.right)}`);
    }
    if (lines.length === 2) lines.push("(no differences)");
    return lines.join("\n");
  }, [entries, summary]);

  const loadSample = React.useCallback(() => {
    setLeft(SAMPLE_LEFT);
    setRight(SAMPLE_RIGHT);
    setIgnoreKeyOrder(true);
    leftRef.current?.focus();
  }, []);

  const clearAll = React.useCallback(() => {
    setLeft("");
    setRight("");
    leftRef.current?.focus();
  }, []);

  const swap = React.useCallback(() => {
    setLeft(right);
    setRight(left);
  }, [left, right]);

  const doShare = React.useCallback(() => {
    if (!left && !right) return;
    const payload: ShareShape = {
      l: left,
      r: right,
      o: { ko: ignoreKeyOrder, ws: ignoreWhitespace, ...(ignoreKeysRaw ? { ik: ignoreKeysRaw } : {}) },
    };
    void share.copyShareLink(JSON.stringify(payload));
  }, [left, right, ignoreKeyOrder, ignoreWhitespace, ignoreKeysRaw, share]);

  const leftDrop = useFileDrop({
    onFiles: (files) => {
      const f = files[0];
      if (f) f.text().then((t) => setLeft(t)).catch(() => undefined);
    },
    paste: false,
  });
  const rightDrop = useFileDrop({
    onFiles: (files) => {
      const f = files[0];
      if (f) f.text().then((t) => setRight(t)).catch(() => undefined);
    },
    paste: false,
  });

  useShortcuts({
    "mod+enter": () => loadSample(),
    "mod+backspace": () => clearAll(),
    "mod+shift+x": () => swap(),
    "mod+shift+c": () => {
      const out = report();
      if (out) void navigator.clipboard.writeText(out).catch(() => undefined);
    },
  });

  const bothEmpty = !left.trim() && !right.trim();
  const hasReport = summary != null && (entries?.some((e) => e.kind !== "unchanged") ?? false);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton icon="Sparkles" label="Sample pair" kbd="mod+enter" onClick={loadSample} />
        <ToolbarButton
          icon="ArrowLeftRight"
          label="Swap"
          kbd="mod+shift+x"
          onClick={swap}
          disabled={bothEmpty}
        />
        <ToolbarDivider />
        <CopyButton
          label="Copy diff"
          kbd="mod+shift+c"
          getValue={report}
          disabled={!hasReport}
        />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Link copied!" : "Share link"}
          variant={share.justCopied ? "active" : "default"}
          onClick={doShare}
          disabled={bothEmpty}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Clear"
          kbd="mod+backspace"
          variant="destructive"
          onClick={clearAll}
          disabled={bothEmpty}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && <ErrorBanner error={share.shareError} variant="warning" />}

      {/* ── Options ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-lg border border-border bg-card/60 px-3 py-3">
        <Field label="Key order">
          <Toggle checked={ignoreKeyOrder} onChange={setIgnoreKeyOrder} label="Ignore" />
        </Field>
        <Field label="String whitespace">
          <Toggle checked={ignoreWhitespace} onChange={setIgnoreWhitespace} label="Ignore" />
        </Field>
        <Field label="Ignore keys" hint="Comma-separated (e.g. id, updatedAt)">
          <input
            value={ignoreKeysRaw}
            onChange={(e) => setIgnoreKeysRaw(e.target.value)}
            placeholder="id, updatedAt, _etag"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Keys to ignore"
            className="w-56 max-w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/20"
          />
        </Field>
      </div>

      {/* ── Dual inputs ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative" {...leftDrop.dropProps}>
          <CodePane
            ref={leftRef}
            id="json-diff-left"
            value={left}
            onChange={setLeft}
            label="Original (left)"
            placeholder="Paste the original JSON here…"
            onDropText={setLeft}
            lineNumbers
            wrap={false}
            showWrapToggle
            showStats
            minHeight={220}
            maxHeight={420}
            fontSize={12.5}
            ariaLabel="Original JSON"
            errorLine={leftError?.line ?? null}
          />
          {leftDrop.isDragging && <DropOverlay />}
        </div>
        <div className="relative" {...rightDrop.dropProps}>
          <CodePane
            id="json-diff-right"
            value={right}
            onChange={setRight}
            label="Changed (right)"
            placeholder="Paste the JSON to compare here…"
            onDropText={setRight}
            lineNumbers
            wrap={false}
            showWrapToggle
            showStats
            minHeight={220}
            maxHeight={420}
            fontSize={12.5}
            ariaLabel="Changed JSON"
            errorLine={rightError?.line ?? null}
          />
          {rightDrop.isDragging && <DropOverlay />}
        </div>
      </div>

      {leftError && (
        <ErrorBanner
          error={`Left document: ${leftError.message}`}
          {...(leftError.line != null ? { line: leftError.line } : {})}
          {...(leftError.column != null ? { col: leftError.column } : {})}
        />
      )}
      {rightError && (
        <ErrorBanner
          error={`Right document: ${rightError.message}`}
          {...(rightError.line != null ? { line: rightError.line } : {})}
          {...(rightError.column != null ? { col: rightError.column } : {})}
        />
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {bothEmpty && !leftError && !rightError && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              accent.soft,
            )}
          >
            <Icon name="GitCompareArrows" size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Paste two JSON documents to compare them by structure
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reordered keys and whitespace are ignored, you&apos;ll see only the values
              that were added, removed or changed, each labelled by its path. Everything runs
              in your browser; nothing is uploaded.
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
            <Icon name="Sparkles" size={14} /> Try a sample pair
          </button>
        </div>
      )}

      {/* ── Summary + diff ──────────────────────────────────────────────── */}
      {summary && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {identical ? (
              <StatBadge tone="success" icon="CircleCheck" label="Result" value="Documents are equal" />
            ) : (
              <StatBadge tone="info" icon="GitCompareArrows" label="Result" value="Differences found" />
            )}
            <StatBadge tone="success" icon="Plus" label="Added" value={summary.added} />
            <StatBadge tone="danger" icon="Minus" label="Removed" value={summary.removed} />
            <StatBadge tone="warning" icon="PencilLine" label="Changed" value={summary.changed} />
            <StatBadge icon="Equal" label="Unchanged" value={summary.unchanged} />
            {ignoreKeys.size > 0 && (
              <StatBadge icon="Filter" label="Ignoring" value={`${ignoreKeys.size} key${ignoreKeys.size > 1 ? "s" : ""}`} />
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className={cn("flex size-6 items-center justify-center rounded", accent.soft)}>
                  <Icon name="ListTree" size={14} className={accent.text} />
                </span>
                Unified diff
                <span className="text-xs font-normal text-muted-foreground">
                  {visibleEntries.length} path{visibleEntries.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Toggle
                  checked={showUnchanged}
                  onChange={setShowUnchanged}
                  label="Show unchanged"
                  disabled={summary.unchanged === 0}
                />
                <CopyButton label="Copy" kbd="mod+shift+c" getValue={report} disabled={!hasReport} labelMode="responsive" />
              </div>
            </div>

            {visibleEntries.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                  <Icon name="CircleCheck" size={18} className="text-emerald-600 dark:text-emerald-400" />
                </span>
                <p className="text-sm font-medium text-foreground">
                  {identical ? "No differences. The documents are structurally equal." : "No differences to show."}
                </p>
                {identical && (
                  <p className="text-xs text-muted-foreground">
                    Even if the text differs, every value matched by path
                    {ignoreKeyOrder ? " (key order ignored)" : ""}.
                  </p>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {visibleEntries.map((e) => (
                  <DiffRow key={`${e.kind}:${e.path}`} entry={e} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Both documents are parsed and compared entirely in this browser tab. Nothing is
          uploaded. Arrays are compared by index and numbers by their parsed (64-bit float)
          value, so keep very large integer IDs as strings to compare them exactly.
        </span>
      </p>
    </div>
  );
}

function DropOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
      <span className="flex items-center gap-2 text-sm font-medium text-primary">
        <Icon name="Upload" size={16} /> Drop a .json file
      </span>
    </div>
  );
}

function DiffRow({ entry }: { entry: DiffEntry }) {
  const meta = entry.kind === "unchanged" ? null : KIND_META[entry.kind];
  return (
    <li
      className={cn(
        "flex flex-col gap-1 border-l-2 px-3 py-2 sm:flex-row sm:items-start sm:gap-3",
        meta ? meta.border : "border-l-transparent",
        entry.kind === "unchanged" && "opacity-60",
      )}
    >
      <div className="flex min-w-0 items-center gap-2 sm:w-24 sm:shrink-0">
        {meta ? (
          <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide", meta.text)}>
            <Icon name={meta.icon} size={12} /> {meta.label}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Icon name="Equal" size={12} /> Same
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <code className="block break-all font-mono text-xs font-medium text-foreground">{entry.path}</code>
        <div className="mt-0.5 flex flex-col gap-0.5 font-mono text-xs">
          {(entry.kind === "removed" || entry.kind === "changed") && (
            <span className="break-all text-rose-600 dark:text-rose-400">
              − {preview(entry.left)}
            </span>
          )}
          {(entry.kind === "added" || entry.kind === "changed") && (
            <span className="break-all text-emerald-600 dark:text-emerald-400">
              + {preview(entry.right)}
            </span>
          )}
          {entry.kind === "unchanged" && (
            <span className="break-all text-muted-foreground">{preview(entry.left)}</span>
          )}
        </div>
      </div>
    </li>
  );
}
