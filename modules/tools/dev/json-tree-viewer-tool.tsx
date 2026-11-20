"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { safeParse } from "@/lib/dev/json";
import {
  CodePane,
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

/** A compact, realistic sample that shows off nesting, arrays, and mixed types. */
const SAMPLE_JSON = JSON.stringify(
  {
    id: "order_8f2a",
    createdAt: "2026-06-24T14:03:00Z",
    total: 129.9,
    paid: true,
    coupon: null,
    customer: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      vip: true,
      addresses: [
        { type: "billing", city: "London", zip: "EC1A" },
        { type: "shipping", city: "Cambridge", zip: "CB2" },
      ],
    },
    items: [
      { sku: "KB-01", name: "Mechanical keyboard", qty: 1, price: 99.0, tags: ["input", "usb-c"] },
      { sku: "MP-77", name: "Desk mat", qty: 2, price: 15.45, tags: [] },
    ],
    meta: { source: "web", experiments: { checkoutV2: true, retries: 3 } },
  },
  null,
  2,
);

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Load the sample JSON" },
  { combo: "mod+f", description: "Focus the search box" },
  { combo: "enter", description: "Jump to next match (in search)" },
  { combo: "shift+enter", description: "Jump to previous match (in search)" },
  { combo: "mod+e", description: "Expand every node" },
  { combo: "mod+shift+e", description: "Collapse to the root" },
  { combo: "mod+backspace", description: "Clear the input" },
];

/** The JSON value types we badge and color. */
type JsonKind = "object" | "array" | "string" | "number" | "boolean" | "null";

function kindOf(value: unknown): JsonKind {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  const t = typeof value;
  if (t === "object") return "object";
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  return "string";
}

/** Per-type color for the value/badge, tuned for light and dark. */
const KIND_COLOR: Record<JsonKind, string> = {
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-sky-600 dark:text-sky-400",
  boolean: "text-amber-600 dark:text-amber-400",
  null: "text-rose-500 dark:text-rose-400",
  object: "text-muted-foreground",
  array: "text-muted-foreground",
};

const KIND_LABEL: Record<JsonKind, string> = {
  string: "str",
  number: "num",
  boolean: "bool",
  null: "null",
  object: "obj",
  array: "arr",
};

/** One flattened, renderable row of the tree. Flattening enables lazy render. */
interface Row {
  /** Stable id = the JSONPath, unique per node. */
  path: string;
  /** The object key or array index label ("root" for the top). */
  keyLabel: string;
  /** Whether keyLabel came from an array index (rendered dimmer). */
  isIndex: boolean;
  value: unknown;
  kind: JsonKind;
  depth: number;
  /** Container child count, for the length badge. */
  childCount: number;
  /** True if this node has children (expandable). */
  expandable: boolean;
}

const ROOT_PATH = "$";

/** Is `key` a plain identifier that can use dot-notation in a JSONPath? */
function isIdentifier(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

/** Extend a parent JSONPath with an object key. */
function childPathForKey(parent: string, key: string): string {
  return isIdentifier(key)
    ? `${parent}.${key}`
    : `${parent}[${JSON.stringify(key)}]`;
}

/**
 * Walk the value depth-first, emitting a Row for every node whose ancestors are
 * all expanded. Because we stop descending into collapsed containers, children
 * of a collapsed node cost nothing; this is what keeps large JSON responsive.
 */
function flatten(
  root: unknown,
  expanded: ReadonlySet<string>,
  forceOpen: ReadonlySet<string> | null,
): Row[] {
  const rows: Row[] = [];

  const visit = (
    value: unknown,
    path: string,
    keyLabel: string,
    isIndex: boolean,
    depth: number,
  ) => {
    const kind = kindOf(value);
    const isContainer = kind === "object" || kind === "array";
    const childCount = isContainer
      ? Array.isArray(value)
        ? value.length
        : Object.keys(value as Record<string, unknown>).length
      : 0;
    const expandable = isContainer && childCount > 0;

    rows.push({
      path,
      keyLabel,
      isIndex,
      value,
      kind,
      depth,
      childCount,
      expandable,
    });

    if (!expandable) return;
    const isOpen = forceOpen ? forceOpen.has(path) : expanded.has(path);
    if (!isOpen) return;

    if (Array.isArray(value)) {
      value.forEach((child, i) => {
        visit(child, `${path}[${i}]`, String(i), true, depth + 1);
      });
    } else {
      for (const [k, child] of Object.entries(value as Record<string, unknown>)) {
        visit(child, childPathForKey(path, k), k, false, depth + 1);
      }
    }
  };

  visit(root, ROOT_PATH, "root", false, 0);
  return rows;
}

/** Collect every expandable container path (for expand-all). */
function allContainerPaths(root: unknown): Set<string> {
  const out = new Set<string>();
  const walk = (value: unknown, path: string) => {
    const kind = kindOf(value);
    if (kind === "array") {
      out.add(path);
      (value as unknown[]).forEach((c, i) => walk(c, `${path}[${i}]`));
    } else if (kind === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length) out.add(path);
      for (const [k, c] of entries) walk(c, childPathForKey(path, k));
    }
  };
  walk(root, ROOT_PATH);
  return out;
}

/** A one-line, non-recursive preview of a collapsed container's contents. */
function previewOf(value: unknown, kind: JsonKind): string {
  if (kind === "array") {
    const arr = value as unknown[];
    return arr.length ? `[ ${arr.length} item${arr.length === 1 ? "" : "s"} ]` : "[ ]";
  }
  const keys = Object.keys(value as Record<string, unknown>);
  if (!keys.length) return "{ }";
  const shown = keys.slice(0, 4).join(", ");
  return `{ ${shown}${keys.length > 4 ? ", …" : ""} }`;
}

/** Render a scalar leaf value as its JSON text. */
function scalarText(value: unknown, kind: JsonKind): string {
  if (kind === "string") return JSON.stringify(value);
  return String(value);
}

/** The clipboard text for a node: raw string, or pretty JSON for containers. */
function copyableValue(value: unknown, kind: JsonKind): string {
  if (kind === "string") return value as string;
  if (kind === "object" || kind === "array") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/** Highlight every case-insensitive occurrence of `term` within `text`. */
function highlight(text: string, term: string): React.ReactNode {
  if (!term) return text;
  const lower = text.toLowerCase();
  const q = term.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  let n = 0;
  while (i < text.length) {
    const at = lower.indexOf(q, i);
    if (at === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (at > i) parts.push(text.slice(i, at));
    parts.push(
      <mark
        key={`h${n}`}
        className="rounded-sm bg-amber-300/70 px-0.5 text-foreground dark:bg-amber-500/40"
      >
        {text.slice(at, at + term.length)}
      </mark>,
    );
    n += 1;
    i = at + term.length;
  }
  return parts.length ? parts : text;
}

/** Does a row's key or (scalar) value contain the search term? */
function rowMatches(row: Row, q: string): boolean {
  if (!q) return false;
  const lq = q.toLowerCase();
  if (!row.isIndex && row.keyLabel.toLowerCase().includes(lq)) return true;
  if (row.kind !== "object" && row.kind !== "array") {
    return scalarText(row.value, row.kind).toLowerCase().includes(lq);
  }
  return false;
}

export default function JsonTreeViewerTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);

  const [raw, setRaw] = React.useState("");
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set([ROOT_PATH]));
  const [query, setQuery] = React.useState("");
  const [activeMatch, setActiveMatch] = React.useState(0);
  const [copiedPath, setCopiedPath] = React.useState<string | null>(null);
  const [showInput, setShowInput] = React.useState(true);

  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const treeRef = React.useRef<HTMLDivElement>(null);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const share = useShareState({ onInit: (v) => setRaw(v) });

  const trimmed = raw.trim();
  const parsed = React.useMemo(() => (trimmed ? safeParse(trimmed) : null), [trimmed]);
  const value = parsed?.ok ? parsed.value : undefined;
  const hasData = parsed?.ok === true;
  const errorMsg = parsed && parsed.ok === false ? parsed.error.message : null;
  const errorLine = parsed && parsed.ok === false ? parsed.error.line ?? null : null;

  // When search is active we force-open the ancestors of every match so hits
  // are always visible; otherwise we honour the user's manual expand/collapse.
  const q = query.trim();
  const forceOpen = React.useMemo<Set<string> | null>(() => {
    if (!q || !hasData) return null;
    const rows = flatten(value, expanded, allContainerPaths(value));
    const open = new Set<string>([ROOT_PATH]);
    for (const r of rows) {
      if (rowMatches(r, q)) {
        // Open every ancestor container along this row's path.
        for (const anc of ancestorsOf(r.path)) open.add(anc);
      }
    }
    return open;
  }, [q, hasData, value, expanded]);

  const rows = React.useMemo<Row[]>(
    () => (hasData ? flatten(value, expanded, forceOpen) : []),
    [hasData, value, expanded, forceOpen],
  );

  // Indices (into `rows`) of the visible matches, for next/prev navigation.
  const matchIndices = React.useMemo<number[]>(() => {
    if (!q) return [];
    const out: number[] = [];
    rows.forEach((r, i) => {
      if (rowMatches(r, q)) out.push(i);
    });
    return out;
  }, [rows, q]);

  const matchCount = matchIndices.length;

  // Keep the active match index in range whenever the match set changes.
  React.useEffect(() => {
    setActiveMatch((m) => (matchCount === 0 ? 0 : Math.min(m, matchCount - 1)));
  }, [matchCount]);

  const totalNodes = React.useMemo(() => (hasData ? countNodes(value) : 0), [hasData, value]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const loadSample = React.useCallback(() => {
    setRaw(SAMPLE_JSON);
    setExpanded(new Set([ROOT_PATH]));
    setQuery("");
    setShowInput(false);
  }, []);

  const clearAll = React.useCallback(() => {
    setRaw("");
    setExpanded(new Set([ROOT_PATH]));
    setQuery("");
    setShowInput(true);
    inputRef.current?.focus();
  }, []);

  const expandAll = React.useCallback(() => {
    if (hasData) setExpanded(allContainerPaths(value));
  }, [hasData, value]);

  const collapseAll = React.useCallback(() => {
    setExpanded(new Set([ROOT_PATH]));
  }, []);

  const toggle = React.useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const flashCopied = React.useCallback((path: string) => {
    setCopiedPath(path);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedPath(null), 1400);
  }, []);

  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const copyValue = React.useCallback(
    (row: Row) => {
      void navigator.clipboard
        .writeText(copyableValue(row.value, row.kind))
        .then(() => flashCopied(`${row.path}::val`))
        .catch(() => undefined);
    },
    [flashCopied],
  );

  const copyPath = React.useCallback(
    (row: Row) => {
      void navigator.clipboard
        .writeText(row.path)
        .then(() => flashCopied(`${row.path}::path`))
        .catch(() => undefined);
    },
    [flashCopied],
  );

  const goToMatch = React.useCallback(
    (dir: 1 | -1) => {
      if (matchCount === 0) return;
      setActiveMatch((m) => (m + dir + matchCount) % matchCount);
    },
    [matchCount],
  );

  const doShare = React.useCallback(() => {
    if (trimmed) void share.copyShareLink(trimmed);
  }, [trimmed, share]);

  const onFiles = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    file
      .text()
      .then((t) => {
        setRaw(t);
        setShowInput(false);
      })
      .catch(() => undefined);
  }, []);

  const { isDragging, dropProps } = useFileDrop({ onFiles, paste: false });

  useShortcuts({
    "mod+enter": () => loadSample(),
    "mod+backspace": () => clearAll(),
    "mod+f": (e) => {
      e.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    },
    "mod+e": (e) => {
      e.preventDefault();
      expandAll();
    },
    "mod+shift+e": (e) => {
      e.preventDefault();
      collapseAll();
    },
  });

  // Scroll the active match into view as it changes.
  React.useEffect(() => {
    if (matchCount === 0) return;
    const rowIdx = matchIndices[activeMatch];
    if (rowIdx === undefined) return;
    const row = rows[rowIdx];
    if (!row) return;
    const el = treeRef.current?.querySelector<HTMLElement>(
      `[data-row-path="${cssEscape(row.path)}"]`,
    );
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeMatch, matchIndices, matchCount, rows]);

  const activeRowPath =
    matchCount > 0 ? rows[matchIndices[activeMatch] ?? -1]?.path ?? null : null;

  return (
    <div className="flex flex-col gap-4" {...dropProps}>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton
          icon={showInput ? "PanelTopClose" : "PanelTopOpen"}
          label={showInput ? "Hide input" : "Edit input"}
          labelMode="responsive"
          onClick={() => setShowInput((s) => !s)}
        />
        <ToolbarButton icon="Sparkles" label="Sample" kbd="mod+enter" onClick={loadSample} />
        <ToolbarDivider />
        <ToolbarButton
          icon="ChevronsDownUp"
          label="Expand all"
          kbd="mod+e"
          labelMode="responsive"
          onClick={expandAll}
          disabled={!hasData}
        />
        <ToolbarButton
          icon="ChevronsUpDown"
          label="Collapse all"
          kbd="mod+shift+e"
          labelMode="responsive"
          onClick={collapseAll}
          disabled={!hasData}
        />
        <ToolbarDivider />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Link copied!" : "Share"}
          variant={share.justCopied ? "active" : "default"}
          labelMode="responsive"
          onClick={doShare}
          disabled={!trimmed}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Clear"
          kbd="mod+backspace"
          variant="destructive"
          labelMode="responsive"
          onClick={clearAll}
          disabled={!raw}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && <ErrorBanner error={share.shareError} variant="warning" />}

      {/* ── Input pane (collapsible) ────────────────────────────────────── */}
      {showInput && (
        <div className="relative">
          <CodePane
            ref={inputRef}
            id="json-tree-input"
            value={raw}
            onChange={setRaw}
            label="JSON input"
            placeholder='Paste JSON here, e.g. {"hello": "world", "items": [1, 2, 3]}'
            onDropText={(t) => setRaw(t)}
            lineNumbers
            wrap={false}
            showWrapToggle
            minHeight={120}
            maxHeight={260}
            fontSize={13}
            ariaLabel="JSON input"
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
      )}

      {errorMsg && <ErrorBanner error={errorMsg} line={errorLine ?? undefined} />}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!raw && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <span
            className={cn("flex size-12 items-center justify-center rounded-full", accent.soft)}
          >
            <Icon name="ListTree" size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Paste JSON to explore it as an interactive tree
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Expand only what you need, search keys and values, and copy any value or its
              JSONPath: all in your browser, nothing uploaded.
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
            <Icon name="Sparkles" size={14} /> Load sample JSON
          </button>
        </div>
      )}

      {/* ── Tree explorer ───────────────────────────────────────────────── */}
      {hasData && (
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
          {/* Search + stats bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Icon
                name="Search"
                size={15}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveMatch(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goToMatch(e.shiftKey ? -1 : 1);
                  } else if (e.key === "Escape") {
                    setQuery("");
                  }
                }}
                placeholder="Search keys and values…"
                aria-label="Search keys and values"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/20"
              />
            </div>

            {q && (
              <div className="flex items-center gap-1" aria-live="polite">
                <span className="tabular-nums text-xs text-muted-foreground">
                  {matchCount === 0 ? "No matches" : `${activeMatch + 1} / ${matchCount}`}
                </span>
                <button
                  type="button"
                  onClick={() => goToMatch(-1)}
                  disabled={matchCount === 0}
                  aria-label="Previous match"
                  className="rounded p-1 text-muted-foreground outline-none transition-colors hover:text-foreground disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon name="ChevronUp" size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => goToMatch(1)}
                  disabled={matchCount === 0}
                  aria-label="Next match"
                  className="rounded p-1 text-muted-foreground outline-none transition-colors hover:text-foreground disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon name="ChevronDown" size={15} />
                </button>
              </div>
            )}

            <ToolbarSpacer />
            <StatBadge icon="Boxes" label="nodes" value={totalNodes} />
            <StatBadge
              icon={kindOf(value) === "array" ? "Brackets" : "Braces"}
              label="root"
              value={kindOf(value)}
              tone="info"
            />
          </div>

          {/* The tree itself */}
          <div
            ref={treeRef}
            role="tree"
            aria-label="JSON tree"
            className="max-h-[560px] overflow-auto px-1.5 py-1.5 font-mono text-[13px] leading-relaxed"
          >
            {rows.map((row) => (
              <TreeRow
                key={row.path}
                row={row}
                isOpen={(forceOpen ?? expanded).has(row.path)}
                onToggle={toggle}
                onCopyValue={copyValue}
                onCopyPath={copyPath}
                query={q}
                isActiveMatch={row.path === activeRowPath}
                isSearchHit={q ? rowMatches(row, q) : false}
                copiedValue={copiedPath === `${row.path}::val`}
                copiedPath={copiedPath === `${row.path}::path`}
                accentText={accent.text}
              />
            ))}
          </div>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Your JSON is parsed, searched, and explored entirely in this browser tab; nothing is
          uploaded. It&apos;s safe to inspect real production responses and other sensitive
          payloads here.
        </span>
      </p>
    </div>
  );
}

/** A single, memoised tree row, key, badges, value, and hover actions. */
const TreeRow = React.memo(function TreeRow({
  row,
  isOpen,
  onToggle,
  onCopyValue,
  onCopyPath,
  query,
  isActiveMatch,
  isSearchHit,
  copiedValue,
  copiedPath,
  accentText,
}: {
  row: Row;
  isOpen: boolean;
  onToggle: (path: string) => void;
  onCopyValue: (row: Row) => void;
  onCopyPath: (row: Row) => void;
  query: string;
  isActiveMatch: boolean;
  isSearchHit: boolean;
  copiedValue: boolean;
  copiedPath: boolean;
  accentText: string;
}) {
  const isRoot = row.path === ROOT_PATH;
  const showKey = !isRoot;

  return (
    <div
      data-row-path={row.path}
      role="treeitem"
      aria-selected={isActiveMatch}
      aria-expanded={row.expandable ? isOpen : undefined}
      className={cn(
        "group flex items-start gap-1 rounded px-1 py-[3px] transition-colors hover:bg-muted/60",
        isActiveMatch && "bg-amber-400/15 ring-1 ring-amber-400/50",
      )}
      style={{ paddingLeft: `${row.depth * 16 + 4}px` }}
    >
      {/* Caret / spacer */}
      {row.expandable ? (
        <button
          type="button"
          onClick={() => onToggle(row.path)}
          aria-label={isOpen ? "Collapse" : "Expand"}
          className="mt-[3px] shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon
            name="ChevronRight"
            size={14}
            className={cn("transition-transform", isOpen && "rotate-90")}
          />
        </button>
      ) : (
        <span className="mt-[3px] w-[14px] shrink-0" aria-hidden />
      )}

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5">
        {/* Key or index */}
        {showKey && (
          <span
            className={cn(
              "shrink-0 font-medium",
              row.isIndex ? "text-muted-foreground/70" : accentText,
            )}
          >
            {row.isIndex ? (
              <>[{row.keyLabel}]</>
            ) : (
              <>{query && !row.isIndex ? highlight(row.keyLabel, query) : row.keyLabel}:</>
            )}
          </span>
        )}
        {isRoot && <span className="shrink-0 text-muted-foreground/70">root</span>}

        {/* Value */}
        {row.expandable || row.kind === "object" || row.kind === "array" ? (
          <span
            className={cn("min-w-0 cursor-pointer truncate text-muted-foreground", KIND_COLOR[row.kind])}
            onClick={() => row.expandable && onToggle(row.path)}
            title={isOpen ? "" : previewOf(row.value, row.kind)}
          >
            {isOpen && row.expandable ? (row.kind === "array" ? "[" : "{") : previewOf(row.value, row.kind)}
          </span>
        ) : (
          <span
            className={cn("min-w-0 break-all", KIND_COLOR[row.kind])}
            title={scalarText(row.value, row.kind)}
          >
            {query ? highlight(scalarText(row.value, row.kind), query) : scalarText(row.value, row.kind)}
          </span>
        )}

        {/* Type + length badges */}
        <span className="shrink-0 rounded bg-muted px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {KIND_LABEL[row.kind]}
        </span>
        {(row.kind === "object" || row.kind === "array") && (
          <span className="shrink-0 rounded bg-muted px-1 text-[10px] tabular-nums text-muted-foreground">
            {row.childCount}
          </span>
        )}
        {isSearchHit && !isActiveMatch && (
          <span className="shrink-0 rounded bg-amber-400/20 px-1 text-[10px] text-amber-700 dark:text-amber-300">
            match
          </span>
        )}
      </div>

      {/* Hover actions: copy value + copy path */}
      <div
        className={cn(
          "ml-auto flex shrink-0 items-center gap-0.5 pl-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
          (copiedValue || copiedPath) && "opacity-100",
        )}
      >
        <button
          type="button"
          onClick={() => onCopyValue(row)}
          aria-label="Copy value"
          title="Copy value"
          className="rounded p-1 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name={copiedValue ? "Check" : "Copy"} size={13} />
        </button>
        <button
          type="button"
          onClick={() => onCopyPath(row)}
          aria-label="Copy JSONPath"
          title={`Copy path, ${row.path}`}
          className="rounded p-1 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name={copiedPath ? "Check" : "Route"} size={13} />
        </button>
      </div>
    </div>
  );
});

/** Count every node (containers + leaves) in the value, for the stat badge. */
function countNodes(value: unknown): number {
  let n = 1;
  if (Array.isArray(value)) {
    for (const c of value) n += countNodes(c);
  } else if (value && typeof value === "object") {
    for (const c of Object.values(value as Record<string, unknown>)) n += countNodes(c);
  }
  return n;
}

/**
 * Every ancestor container path of a JSONPath, excluding the node itself.
 * "$.a.b[2].c" → ["$", "$.a", "$.a.b", "$.a.b[2]"]. Parses dot keys, bracketed
 * quoted keys, and numeric array indexes.
 */
function ancestorsOf(path: string): string[] {
  const out: string[] = [];
  let i = 0;
  // Root token.
  if (path.startsWith(ROOT_PATH)) {
    out.push(ROOT_PATH);
    i = ROOT_PATH.length;
  }
  let current = ROOT_PATH;
  while (i < path.length) {
    const ch = path[i];
    if (ch === ".") {
      i += 1;
      let key = "";
      while (i < path.length && path[i] !== "." && path[i] !== "[") {
        key += path[i];
        i += 1;
      }
      current += `.${key}`;
      out.push(current);
    } else if (ch === "[") {
      const close = path.indexOf("]", i);
      if (close === -1) break;
      current += path.slice(i, close + 1);
      out.push(current);
      i = close + 1;
    } else {
      i += 1;
    }
  }
  // Drop the last entry (the node itself); keep only true ancestors.
  out.pop();
  return out;
}

/** Minimal CSS.escape polyfill for the attribute selector (paths are safe-ish). */
function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/["\\\]]/g, "\\$&");
}
