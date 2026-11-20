"use client";

/**
 * Document Comparer: the flagship Document tool.
 *
 * Upload two documents (PDF / DOCX / DOC / RTF / TXT / MD), extract the plain
 * text from each ENTIRELY in the browser, and render a color-coded diff:
 * removals struck through in red, additions highlighted in green, unchanged text
 * neutral, with a live added/removed tally and a line- vs. word-mode toggle.
 *
 * Reuse, not reinvention:
 *  - `extractText` (lib/document-tools/diff), pdf.js / Mammoth / RTF / UTF-8
 *  - `compareDocuments`(lib/document-tools/diff), the single `computeDiff` engine
 *  - `DocumentDropzone`(components/tool/document): the type-detecting file input
 *   - dev harness `download`, `CopyButton`, `StatBadge`, `Toggle`
 *
 * Everything is client-side; nothing is uploaded. Honest boundary: this diffs
 * TEXT, not layout, surfaced in the UI, not just the config copy.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { Button } from "@/components/ui/button";
import { CopyButton, StatBadge, download } from "@/components/tool/dev";
import {
  DocumentDropzone,
  type DetectedFile,
} from "@/components/tool/document";
import { type DocumentKind } from "@/lib/document-tools";
import {
  extractText,
  compareDocuments,
  type DiffMode,
  type DiffResult,
} from "@/lib/document-tools/diff";

/** Formats we can extract text from and therefore compare. */
const ACCEPT: readonly DocumentKind[] = ["pdf", "docx", "txt", "md"] as const;

/** Which slot a dropped file belongs to. */
type Slot = "a" | "b";

/** Overall state of the comparison flow. */
type Phase = "idle" | "comparing" | "done" | "error";

/** A tiny built-in example so the tool works with one click. */
const EXAMPLE_A = `Project Phoenix, Statement of Work

1. Scope
The vendor will design and build the marketing site.
2. Timeline
Delivery is due within 8 weeks of signing.
3. Payment
50% on signing, 50% on delivery.
4. Support
30 days of bug fixes are included after launch.`;

const EXAMPLE_B = `Project Phoenix, Statement of Work

1. Scope
The vendor will design, build and host the marketing site.
2. Timeline
Delivery is due within 6 weeks of signing.
3. Payment
40% on signing, 60% on delivery.
4. Support
90 days of bug fixes are included after launch.
5. Confidentiality
Both parties agree to keep project details private.`;

/** Serialise a diff to a plain-text redline (+ additions / − removals). */
function diffToText(diff: DiffResult): string {
  const out: string[] = [];
  for (const part of diff.parts) {
    const lines = part.value.replace(/\n$/, "").split("\n");
    const prefix = part.type === "added" ? "+ " : part.type === "removed" ? "- " : "  ";
    for (const line of lines) out.push(prefix + line);
  }
  return out.join("\n");
}

export default function DocumentComparerTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [fileA, setFileA] = React.useState<DetectedFile | null>(null);
  const [fileB, setFileB] = React.useState<DetectedFile | null>(null);
  const [mode, setMode] = React.useState<DiffMode>("lines");

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [status, setStatus] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [diff, setDiff] = React.useState<DiffResult | null>(null);
  /** Whether the comparison found any difference at all (for the empty notice). */
  const [identical, setIdentical] = React.useState(false);

  const bothReady = fileA != null && fileB != null;

  const setFile = React.useCallback((slot: Slot, detected: DetectedFile) => {
    if (slot === "a") setFileA(detected);
    else setFileB(detected);
    // A new file invalidates any previous result.
    setPhase("idle");
    setDiff(null);
    setError(null);
  }, []);

  const clearFile = React.useCallback((slot: Slot) => {
    if (slot === "a") setFileA(null);
    else setFileB(null);
    setPhase("idle");
    setDiff(null);
    setError(null);
  }, []);

  const loadExample = React.useCallback(() => {
    const a = new File([EXAMPLE_A], "statement-of-work-v1.txt", {
      type: "text/plain",
    });
    const b = new File([EXAMPLE_B], "statement-of-work-v2.txt", {
      type: "text/plain",
    });
    setFileA({ file: a, kind: "txt" });
    setFileB({ file: b, kind: "txt" });
    setPhase("idle");
    setDiff(null);
    setError(null);
  }, []);

  const resetAll = React.useCallback(() => {
    setFileA(null);
    setFileB(null);
    setDiff(null);
    setError(null);
    setPhase("idle");
    setStatus("");
    setIdentical(false);
  }, []);

  const run = React.useCallback(
    async (nextMode?: DiffMode) => {
      if (!fileA || !fileB) return;
      const useMode = nextMode ?? mode;
      setPhase("comparing");
      setError(null);
      setIdentical(false);
      try {
        setStatus("Reading the first document…");
        const a = await extractText(fileA.file);
        if (!a.ok) throw new Error(`Couldn't read the first document: ${a.error}`);

        setStatus("Reading the second document…");
        const b = await extractText(fileB.file);
        if (!b.ok) throw new Error(`Couldn't read the second document: ${b.error}`);

        if (a.result.trim() === "" && b.result.trim() === "") {
          throw new Error(
            "Neither document contained any extractable text. Scanned or image-only PDFs must be run through OCR first.",
          );
        }

        setStatus("Comparing…");
        const compared = await compareDocuments(a.result, b.result, {
          mode: useMode,
        });
        if (!compared.ok) throw new Error(compared.error);

        const { added, removed } = compared.result.stats;
        setIdentical(added === 0 && removed === 0);
        setDiff(compared.result);
        setPhase("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Comparison failed.");
        setPhase("error");
      }
    },
    [fileA, fileB, mode],
  );

  // Changing mode after a result exists re-runs the comparison in the new mode.
  const changeMode = React.useCallback(
    (next: DiffMode) => {
      setMode(next);
      if (phase === "done" || phase === "error") void run(next);
    },
    [phase, run],
  );

  const diffText = React.useMemo(() => (diff ? diffToText(diff) : ""), [diff]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input: two document slots ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SlotCard
          label="Original"
          hint="The baseline version"
          badgeText="A"
          style={style}
          selected={fileA}
          onFile={(d) => setFile("a", d)}
          onClear={() => clearFile("a")}
        />
        <SlotCard
          label="Revision"
          hint="The changed or newer version"
          badgeText="B"
          style={style}
          selected={fileB}
          onFile={(d) => setFile("b", d)}
          onClear={() => clearFile("b")}
        />
      </div>

      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <ModeToggle mode={mode} onChange={changeMode} style={style} />

        <Button
          type="button"
          onClick={() => void run()}
          disabled={!bothReady || phase === "comparing"}
          className="gap-2"
        >
          {phase === "comparing" ? (
            <>
              <Icon name="LoaderCircle" size={16} className="animate-spin" />
              Comparing…
            </>
          ) : (
            <>
              <Icon name="GitCompare" size={16} />
              Compare documents
            </>
          )}
        </Button>

        <button
          type="button"
          onClick={loadExample}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="Sparkles" size={15} />
          Try an example
        </button>

        {(fileA || fileB || diff) && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="RotateCcw" size={15} />
            Reset
          </button>
        )}
      </div>

      {/* ── Comparing status ──────────────────────────────────────────────── */}
      {phase === "comparing" && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Icon name="LoaderCircle" size={15} className="animate-spin" />
          {status || "Working…"}
        </p>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {phase === "error" && error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* ── Result ────────────────────────────────────────────────────────── */}
      {phase === "done" && diff && (
        <ResultPanel
          diff={diff}
          diffText={diffText}
          identical={identical}
          mode={mode}
          style={style}
        />
      )}

      {/* ── Honest boundary note ──────────────────────────────────────────── */}
      <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          This compares the <strong className="font-medium text-foreground">text</strong> of
          two documents, not their visual layout. Fonts, images, tables and page
          breaks aren&apos;t diffed, and a scanned or image-only PDF has no text to
          extract until it&apos;s run through OCR first. Everything happens in your
          browser: neither file is uploaded.
        </span>
      </p>
    </div>
  );
}

/* ── A single upload slot ─────────────────────────────────────────────────── */

function SlotCard({
  label,
  hint,
  badgeText,
  style,
  selected,
  onFile,
  onClear,
}: {
  label: string;
  hint: string;
  badgeText: string;
  style: ReturnType<typeof accentStyle>;
  selected: DetectedFile | null;
  onFile: (d: DetectedFile) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex size-5 items-center justify-center rounded-md text-[11px] font-bold text-white",
            style.solid,
          )}
          aria-hidden
        >
          {badgeText}
        </span>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">· {hint}</span>
      </div>
      <DocumentDropzone
        accept={ACCEPT}
        onFile={onFile}
        selected={selected}
        onClear={onClear}
        icon="FileUp"
        label={`Drop the ${label.toLowerCase()}, click to browse, or paste`}
        hint="PDF, Word, RTF, text or Markdown"
      />
    </div>
  );
}

/* ── Line / word mode toggle ──────────────────────────────────────────────── */

function ModeToggle({
  mode,
  onChange,
  style,
}: {
  mode: DiffMode;
  onChange: (m: DiffMode) => void;
  style: ReturnType<typeof accentStyle>;
}) {
  const options: { value: DiffMode; label: string; icon: string }[] = [
    { value: "lines", label: "Line", icon: "AlignLeft" },
    { value: "words", label: "Word", icon: "Type" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Comparison granularity"
      className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
    >
      {options.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? cn("bg-background shadow-sm", style.text)
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon name={opt.icon} size={15} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Result: stats + color diff + actions ────────────────────────────────── */

function ResultPanel({
  diff,
  diffText,
  identical,
  mode,
  style,
}: {
  diff: DiffResult;
  diffText: string;
  identical: boolean;
  mode: DiffMode;
  style: ReturnType<typeof accentStyle>;
}) {
  const unit = mode === "words" ? "words" : "lines";
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", style.border)}>
      {/* Header: stats + actions */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon name="GitCompare" size={16} className={style.text} />
          Comparison
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatBadge
            tone="success"
            icon="Plus"
            label="Added"
            value={`${diff.stats.added} ${unit}`}
          />
          <StatBadge
            tone="danger"
            icon="Minus"
            label="Removed"
            value={`${diff.stats.removed} ${unit}`}
          />
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <CopyButton getValue={() => diffText} label="Copy diff" />
          <button
            type="button"
            onClick={() => download("document-comparison.diff", diffText, "text/plain;charset=utf-8")}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="Download" size={15} />
            Download
          </button>
        </div>
      </div>

      {/* The color-coded diff */}
      {identical ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
          <Icon name="CircleCheck" size={18} className="text-emerald-500" />
          The two documents have identical text. No differences found.
        </p>
      ) : (
        <div
          className="max-h-[32rem] overflow-auto p-4 font-mono text-[13px] leading-relaxed"
          aria-label="Color-coded differences"
        >
          <pre className="whitespace-pre-wrap break-words">
            {diff.parts.map((part, i) => (
              <DiffChunk key={i} type={part.type} value={part.value} />
            ))}
          </pre>
        </div>
      )}
    </div>
  );
}

/** One equal/added/removed chunk of the diff, color-coded and a11y-labelled. */
function DiffChunk({
  type,
  value,
}: {
  type: "added" | "removed" | "equal";
  value: string;
}) {
  if (type === "equal") {
    return <span className="text-muted-foreground">{value}</span>;
  }
  if (type === "added") {
    return (
      <span
        className="rounded-sm bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
        aria-label={`Added: ${value}`}
      >
        {value}
      </span>
    );
  }
  return (
    <span
      className="rounded-sm bg-rose-500/15 text-rose-700 line-through decoration-rose-500/50 dark:text-rose-300"
      aria-label={`Removed: ${value}`}
    >
      {value}
    </span>
  );
}
