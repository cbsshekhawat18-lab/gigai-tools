"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { computeDiff, type DiffMode, type DiffPart } from "@/lib/dev/textdiff";
import {
  CodePane,
  CopyButton,
  ErrorBanner,
  StatBadge,
  Field,
  SegmentedControl,
  Toggle,
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

/** A small, relatable sample so the empty state is one click from a real diff. */
const SAMPLE_ORIGINAL = `function greet(name) {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}`;

const SAMPLE_CHANGED = `function greet(name, greeting = "Hello") {
  const message = \`\${greeting}, \${name}!\`;
  console.info(message);
  return message;
}`;

type View = "unified" | "split";

const MODE_OPTIONS: ReadonlyArray<{ value: DiffMode; label: string; icon: string }> = [
  { value: "lines", label: "Line", icon: "Rows3" },
  { value: "words", label: "Word", icon: "WholeWord" },
  { value: "chars", label: "Char", icon: "Baseline" },
];

const VIEW_OPTIONS: ReadonlyArray<{ value: View; label: string; icon: string }> = [
  { value: "unified", label: "Unified", icon: "AlignJustify" },
  { value: "split", label: "Split", icon: "Columns2" },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Recompute the diff" },
  { combo: "mod+shift+x", description: "Swap original and changed" },
  { combo: "mod+shift+c", description: "Copy the diff as text" },
  { combo: "mod+backspace", description: "Clear both inputs" },
];

const MODE_NOUN: Record<DiffMode, string> = {
  lines: "lines",
  words: "words",
  chars: "chars",
};

interface DiffState {
  parts: DiffPart[];
  added: number;
  removed: number;
  mode: DiffMode;
}

/** Normalise a side for diffing when ignore-whitespace / ignore-case are on. */
function normalise(text: string, ignoreWs: boolean, ignoreCase: boolean): string {
  let out = text;
  if (ignoreWs) {
    // Collapse runs of whitespace and trim each line so re-indentation and
    // trailing spaces don't register as changes, while keeping line structure.
    out = out
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .join("\n");
  }
  if (ignoreCase) out = out.toLowerCase();
  return out;
}

/** Split diff parts into aligned left/right rows for the side-by-side view. */
interface SplitRow {
  left: string | null;
  right: string | null;
  type: "equal" | "added" | "removed" | "changed";
}

function toLineChunks(value: string): string[] {
  const withoutTrailing = value.endsWith("\n") ? value.slice(0, -1) : value;
  return withoutTrailing.length === 0 && value.length === 0 ? [] : withoutTrailing.split("\n");
}

function buildSplitRows(parts: DiffPart[]): SplitRow[] {
  // Only meaningful for line-mode; caller guards. Pair adjacent removed+added
  // blocks so a modified line shows old on the left and new on the right.
  const rows: SplitRow[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (part.type === "equal") {
      for (const line of toLineChunks(part.value)) {
        rows.push({ left: line, right: line, type: "equal" });
      }
      continue;
    }
    if (part.type === "removed") {
      const next = parts[i + 1];
      const removedLines = toLineChunks(part.value);
      if (next && next.type === "added") {
        const addedLines = toLineChunks(next.value);
        const max = Math.max(removedLines.length, addedLines.length);
        for (let r = 0; r < max; r++) {
          const l = removedLines[r] ?? null;
          const rt = addedLines[r] ?? null;
          rows.push({
            left: l,
            right: rt,
            type: l !== null && rt !== null ? "changed" : l !== null ? "removed" : "added",
          });
        }
        i++; // consumed the paired added block
      } else {
        for (const line of removedLines) rows.push({ left: line, right: null, type: "removed" });
      }
      continue;
    }
    // Lone added block
    for (const line of toLineChunks(part.value)) {
      rows.push({ left: null, right: line, type: "added" });
    }
  }
  return rows;
}

export default function DiffCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  const accent = accentStyle(tool.accent);
  const [original, setOriginal] = React.useState("");
  const [changed, setChanged] = React.useState("");
  const [mode, setMode] = React.useState<DiffMode>("lines");
  const [view, setView] = React.useState<View>("split");
  const [ignoreWs, setIgnoreWs] = React.useState(false);
  const [ignoreCase, setIgnoreCase] = React.useState(false);
  const [diff, setDiff] = React.useState<DiffState | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [computing, setComputing] = React.useState(false);
  const [runToken, setRunToken] = React.useState(0);

  const leftRef = React.useRef<HTMLTextAreaElement>(null);

  const share = useShareState({
    onInit: (v) => {
      try {
        const s = JSON.parse(v) as { o?: unknown; c?: unknown };
        if (typeof s.o === "string") setOriginal(s.o);
        if (typeof s.c === "string") setChanged(s.c);
      } catch {
        // Malformed share payload, ignore and start blank.
      }
    },
  });

  const hasInput = original.length > 0 || changed.length > 0;

  // Live, debounced, cancellable diff. Splitting normalisation out keeps the
  // engine call pure text-in/text-out.
  React.useEffect(() => {
    if (!hasInput) {
      setDiff(null);
      setError(null);
      setComputing(false);
      return;
    }
    let cancelled = false;
    setComputing(true);
    const a = normalise(original, ignoreWs, ignoreCase);
    const b = normalise(changed, ignoreWs, ignoreCase);
    const id = window.setTimeout(() => {
      computeDiff(a, b, { mode })
        .then((res) => {
          if (cancelled) return;
          setDiff({ parts: res.parts, added: res.stats.added, removed: res.stats.removed, mode });
          setError(null);
          setComputing(false);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : "Could not compute the diff.");
          setComputing(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [original, changed, mode, ignoreWs, ignoreCase, hasInput, runToken]);

  const loadSample = React.useCallback(() => {
    setOriginal(SAMPLE_ORIGINAL);
    setChanged(SAMPLE_CHANGED);
    leftRef.current?.focus();
  }, []);

  const clearAll = React.useCallback(() => {
    setOriginal("");
    setChanged("");
    setDiff(null);
    setError(null);
    leftRef.current?.focus();
  }, []);

  const swap = React.useCallback(() => {
    setOriginal((o) => {
      setChanged(o);
      return changed;
    });
  }, [changed]);

  // Plain-text rendering of the diff for copy/clipboard, in unified +/-/space form.
  const diffText = React.useCallback((): string => {
    if (!diff) return "";
    const lines: string[] = [];
    for (const part of diff.parts) {
      const sign = part.type === "added" ? "+" : part.type === "removed" ? "-" : " ";
      if (diff.mode === "lines") {
        for (const line of toLineChunks(part.value)) lines.push(`${sign} ${line}`);
      } else {
        const tag = part.type === "added" ? "[+" : part.type === "removed" ? "[-" : "";
        const close = part.type === "equal" ? "" : part.type === "added" ? "+]" : "-]";
        lines.push(`${tag}${part.value}${close}`);
      }
    }
    return diff.mode === "lines" ? lines.join("\n") : lines.join("");
  }, [diff]);

  const doShare = React.useCallback(() => {
    if (hasInput) void share.copyShareLink(JSON.stringify({ o: original, c: changed }));
  }, [hasInput, share, original, changed]);

  const onFilesLeft = React.useCallback((files: File[]) => {
    files[0]?.text().then(setOriginal).catch(() => undefined);
  }, []);
  const onFilesRight = React.useCallback((files: File[]) => {
    files[0]?.text().then(setChanged).catch(() => undefined);
  }, []);

  const leftDrop = useFileDrop({ onFiles: onFilesLeft, paste: false });
  const rightDrop = useFileDrop({ onFiles: onFilesRight, paste: false });

  useShortcuts({
    "mod+enter": () => setRunToken((t) => t + 1),
    "mod+shift+x": () => swap(),
    "mod+backspace": () => clearAll(),
    "mod+shift+c": () => {
      const out = diffText();
      if (out) void navigator.clipboard.writeText(out).catch(() => undefined);
    },
  });

  const noun = MODE_NOUN[mode];
  const identical = diff !== null && diff.added === 0 && diff.removed === 0;
  const splitDisabled = mode !== "lines";
  const effectiveView: View = splitDisabled ? "unified" : view;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton icon="Sparkles" label="Sample" kbd="mod+enter" onClick={loadSample} />
        <ToolbarButton
          icon="ArrowLeftRight"
          label="Swap sides"
          kbd="mod+shift+x"
          onClick={swap}
          disabled={!hasInput}
        />
        <ToolbarDivider />
        <CopyButton
          label="Copy diff"
          kbd="mod+shift+c"
          getValue={diffText}
          disabled={!diff}
        />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Link copied!" : "Share link"}
          variant={share.justCopied ? "active" : "default"}
          onClick={doShare}
          disabled={!hasInput}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Clear"
          kbd="mod+backspace"
          variant="destructive"
          onClick={clearAll}
          disabled={!hasInput}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && <ErrorBanner error={share.shareError} variant="warning" />}

      {/* ── Options ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 rounded-lg border border-border bg-card/60 px-3 py-2.5">
        <Field label="Granularity">
          <SegmentedControl<DiffMode>
            value={mode}
            onChange={setMode}
            size="sm"
            ariaLabel="Diff granularity"
            options={MODE_OPTIONS}
          />
        </Field>
        <Field label="View" hint={splitDisabled ? "Split is available in Line mode" : undefined}>
          <SegmentedControl<View>
            value={effectiveView}
            onChange={setView}
            size="sm"
            ariaLabel="Diff view"
            options={
              splitDisabled
                ? VIEW_OPTIONS.map((o) =>
                    o.value === "split" ? { ...o, label: "Split ·" } : o,
                  )
                : VIEW_OPTIONS
            }
          />
        </Field>
        <Field label="Ignore whitespace">
          <Toggle checked={ignoreWs} onChange={setIgnoreWs} label="On" />
        </Field>
        <Field label="Ignore case">
          <Toggle checked={ignoreCase} onChange={setIgnoreCase} label="On" />
        </Field>
      </div>

      {/* ── Inputs ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative" {...leftDrop.dropProps}>
          <CodePane
            ref={leftRef}
            id="diff-original"
            value={original}
            onChange={setOriginal}
            label="Original"
            placeholder="Paste the original text or code here…"
            onDropText={setOriginal}
            lineNumbers
            showStats
            minHeight={200}
            maxHeight={360}
            fontSize={13}
            ariaLabel="Original text"
          />
          {leftDrop.isDragging && <DropOverlay />}
        </div>
        <div className="relative" {...rightDrop.dropProps}>
          <CodePane
            id="diff-changed"
            value={changed}
            onChange={setChanged}
            label="Changed"
            placeholder="Paste the changed version here…"
            onDropText={setChanged}
            lineNumbers
            showStats
            minHeight={200}
            maxHeight={360}
            fontSize={13}
            ariaLabel="Changed text"
          />
          {rightDrop.isDragging && <DropOverlay />}
        </div>
      </div>

      {error && <ErrorBanner error={error} />}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!hasInput && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <span className={cn("flex size-12 items-center justify-center rounded-full", accent.soft)}>
            <Icon name="GitCompare" size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Paste two versions to see exactly what changed
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every added and removed line, word or character is highlighted the moment you stop
              typing: comparison runs entirely in your browser and nothing is uploaded.
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
            <Icon name="Sparkles" size={14} /> Try a sample comparison
          </button>
        </div>
      )}

      {/* ── Diff output ─────────────────────────────────────────────────── */}
      {hasInput && (
        <div className="flex flex-col gap-3">
          {/* Status strip */}
          <div className="flex flex-wrap items-center gap-2">
            {computing && !diff ? (
              <StatBadge icon="LoaderCircle" value="Comparing…" />
            ) : identical ? (
              <StatBadge tone="success" icon="CircleCheck" value="Identical" />
            ) : diff ? (
              <>
                <StatBadge
                  tone="success"
                  icon="Plus"
                  label={`Added ${noun}`}
                  value={diff.added}
                />
                <StatBadge
                  tone="danger"
                  icon="Minus"
                  label={`Removed ${noun}`}
                  value={diff.removed}
                />
                <StatBadge icon="GitCompare" label="Mode" value={mode} />
              </>
            ) : null}
            {computing && diff && <StatBadge icon="LoaderCircle" value="Updating…" />}
          </div>

          {diff && !identical && (
            <div
              aria-label="Diff result"
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              {effectiveView === "split" && diff.mode === "lines" ? (
                <SplitDiff rows={buildSplitRows(diff.parts)} />
              ) : (
                <UnifiedDiff parts={diff.parts} mode={diff.mode} />
              )}
            </div>
          )}

          {diff && identical && (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-foreground">
              <Icon name="CircleCheck" size={16} className="text-success" />
              The two versions are identical
              {(ignoreWs || ignoreCase) && (
                <span className="text-muted-foreground">
                  {" "}
                  after ignoring{" "}
                  {[ignoreWs && "whitespace", ignoreCase && "case"].filter(Boolean).join(" and ")}
                </span>
              )}
              .
            </div>
          )}
        </div>
      )}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Both versions are compared entirely in this browser tab; nothing is uploaded. Share
          links encode the text in the URL, so copy the diff instead when the content is sensitive.
        </span>
      </p>
    </div>
  );
}

function DropOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
      <span className="flex items-center gap-2 text-sm font-medium text-primary">
        <Icon name="Upload" size={16} /> Drop a text file
      </span>
    </div>
  );
}

/** Inline / unified diff rendering (works for every granularity). */
function UnifiedDiff({ parts, mode }: { parts: DiffPart[]; mode: DiffMode }) {
  if (mode === "lines") {
    // Render one row per line with a +/- gutter for a familiar patch look.
    const rows: { type: DiffPart["type"]; text: string }[] = [];
    for (const part of parts) {
      for (const line of toLineChunks(part.value)) rows.push({ type: part.type, text: line });
    }
    return (
      <div className="max-h-[520px] overflow-auto font-mono text-[12.5px] leading-relaxed">
        {rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2 px-3 py-0.5",
              row.type === "added" && "bg-success/10 text-foreground",
              row.type === "removed" && "bg-destructive/10 text-foreground",
            )}
          >
            <span
              className={cn(
                "w-4 shrink-0 select-none text-center",
                row.type === "added" && "text-success",
                row.type === "removed" && "text-destructive",
                row.type === "equal" && "text-muted-foreground/40",
              )}
              aria-hidden
            >
              {row.type === "added" ? "+" : row.type === "removed" ? "-" : ""}
            </span>
            <span
              className={cn(
                "whitespace-pre-wrap break-words",
                row.type === "removed" && "line-through decoration-destructive/40",
              )}
            >
              {row.text || " "}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Word / character: a single flowing block with inline highlights.
  return (
    <div className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words px-3 py-2.5 font-mono text-[12.5px] leading-relaxed">
      {parts.map((part, i) => {
        if (part.type === "equal") return <span key={i}>{part.value}</span>;
        return (
          <span
            key={i}
            className={cn(
              "rounded-sm",
              part.type === "added" && "bg-success/20 text-foreground",
              part.type === "removed" &&
                "bg-destructive/20 text-foreground line-through decoration-destructive/50",
            )}
          >
            {part.value}
          </span>
        );
      })}
    </div>
  );
}

/** Side-by-side line diff. */
function SplitDiff({ rows }: { rows: SplitRow[] }) {
  return (
    <div className="max-h-[520px] overflow-auto">
      <div className="grid grid-cols-2 divide-x divide-border font-mono text-[12.5px] leading-relaxed">
        {/* Column headers */}
        <div className="sticky top-0 z-10 border-b border-border bg-muted/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
          Original
        </div>
        <div className="sticky top-0 z-10 border-b border-border bg-muted/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
          Changed
        </div>
        {rows.map((row, i) => (
          <React.Fragment key={i}>
            <SplitCell
              text={row.left}
              side="left"
              tone={
                row.type === "removed" || row.type === "changed"
                  ? "removed"
                  : row.type === "added"
                    ? "empty"
                    : "equal"
              }
            />
            <SplitCell
              text={row.right}
              side="right"
              tone={
                row.type === "added" || row.type === "changed"
                  ? "added"
                  : row.type === "removed"
                    ? "empty"
                    : "equal"
              }
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function SplitCell({
  text,
  tone,
  side,
}: {
  text: string | null;
  tone: "added" | "removed" | "equal" | "empty";
  side: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex gap-2 px-3 py-0.5",
        tone === "added" && "bg-success/10",
        tone === "removed" && "bg-destructive/10",
        tone === "empty" && "bg-muted/30",
      )}
    >
      <span
        className={cn(
          "w-3 shrink-0 select-none text-center",
          tone === "added" && "text-success",
          tone === "removed" && "text-destructive",
          (tone === "equal" || tone === "empty") && "text-muted-foreground/30",
        )}
        aria-hidden
      >
        {tone === "added" ? "+" : tone === "removed" ? "-" : ""}
      </span>
      <span
        className={cn(
          "min-w-0 whitespace-pre-wrap break-words",
          tone === "removed" && "line-through decoration-destructive/40",
        )}
      >
        {text === null ? (
          <span className="select-none text-muted-foreground/30" aria-label={`no ${side} line`}>
            {" "}
          </span>
        ) : (
          text || " "
        )}
      </span>
    </div>
  );
}
