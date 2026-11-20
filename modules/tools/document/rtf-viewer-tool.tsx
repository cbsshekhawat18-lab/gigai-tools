"use client";

/**
 * RTF Viewer: open and read Rich Text Format documents in the browser.
 *
 * Drop an .rtf file or paste raw RTF markup, and the tool renders the readable,
 * formatted text (bold / italic / underline + paragraphs) and exports it as
 * clean HTML or plain UTF-8 text. Everything is client-side; nothing uploaded.
 *
 * Reuse, not reinvention. This composes the platform's existing pieces:
 *  - `rtfToHtml` / `rtfToText` / `isRtf` (lib/document-tools/rtf): the single
 *      dependency-free RTF parser used across the platform. No parsing code is
 *      duplicated here.
 *  - `FileDropZone` (dev harness). Drop / click / paste file input, wired with
 *      a custom `.rtf` accept because RTF isn't a first-class DocumentKind.
 *  - `CopyButton`, `StatBadge`, `download` (dev harness): actions + stats.
 *
 * Honest boundary (surfaced in the UI, not just the config): this is a reader,
 * not a full RTF renderer. Tables, images, fonts, colors and exotic control
 * words are dropped in favour of clean, readable text + basic inline styling.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import type { WorkspaceToolData } from "@/types";

import { Button } from "@/components/ui/button";
import { CopyButton, StatBadge, download } from "@/components/tool/dev";
import { FileDropZone } from "@/components/tool/dev";
import { isRtf, rtfToHtml, rtfToText } from "@/lib/document-tools/rtf";

/** Which pane of the result is showing. */
type View = "preview" | "source";

/** A parsed, ready-to-view RTF document. */
interface Parsed {
  /** Original file name (for the download basenames), or a paste default. */
  name: string;
  /** Byte size of the raw RTF, for the stat badge. */
  bytes: number;
  /** The raw RTF markup. */
  raw: string;
  /** Rendered, sanitised-by-construction HTML body. */
  html: string;
  /** Formatting-stripped plain text. */
  text: string;
}

/** A tiny built-in RTF sample so the tool works with a single click. */
const SAMPLE_RTF = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Helvetica;}}
\\f0\\fs24
{\\b Project Aurora \\'96 Kickoff Notes}\\par
\\par
This document was authored in {\\i Rich Text Format}. The viewer preserves \\b bold\\b0 , \\i italic\\i0  and \\ul underlined\\ulnone  runs, plus real paragraph breaks.\\par
\\par
{\\b Agenda}\\par
1. Scope and goals\\par
2. Timeline and milestones\\par
3. Owners and next steps\\par
\\par
Everything renders {\\i entirely in your browser} \\'97 nothing is uploaded.\\par}`;

/** Turn a base filename into a safe basename (no extension, no path). */
function baseName(name: string): string {
  const noPath = name.split(/[\\/]/).pop() ?? name;
  const dot = noPath.lastIndexOf(".");
  return dot > 0 ? noPath.slice(0, dot) : noPath;
}

/** Count non-empty paragraphs in the parsed plain text. */
function paragraphCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n+/).filter((line) => line.trim() !== "").length;
}

export default function RtfViewerTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [doc, setDoc] = React.useState<Parsed | null>(null);
  const [view, setView] = React.useState<View>("preview");
  const [error, setError] = React.useState<string | null>(null);

  const [pasteOpen, setPasteOpen] = React.useState(false);
  const [pasteValue, setPasteValue] = React.useState("");

  /** Parse raw RTF into a Parsed doc, or set an error. */
  const ingest = React.useCallback((raw: string, name: string, bytes: number) => {
    if (!isRtf(raw)) {
      setDoc(null);
      setError(
        "That doesn't look like a valid RTF file. Genuine Rich Text Format starts with {\\rtf: a.doc,.docx or plain-text file renamed to.rtf won't parse. Re-save it as real RTF from its editor and try again.",
      );
      return;
    }
    const html = rtfToHtml(raw);
    const text = rtfToText(raw);
    setError(null);
    setView("preview");
    setDoc({ name, bytes, raw, html, text });
  }, []);

  const onFiles = React.useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      try {
        const raw = await file.text();
        ingest(raw, file.name, file.size);
        setPasteOpen(false);
      } catch {
        setDoc(null);
        setError("Couldn't read that file. Please try a different .rtf document.");
      }
    },
    [ingest],
  );

  const applyPaste = React.useCallback(() => {
    const raw = pasteValue;
    if (raw.trim() === "") return;
    ingest(raw, "pasted-document.rtf", new Blob([raw]).size);
  }, [pasteValue, ingest]);

  const loadSample = React.useCallback(() => {
    setPasteOpen(false);
    setPasteValue("");
    ingest(SAMPLE_RTF, "project-aurora-sample.rtf", new Blob([SAMPLE_RTF]).size);
  }, [ingest]);

  const reset = React.useCallback(() => {
    setDoc(null);
    setError(null);
    setPasteValue("");
    setPasteOpen(false);
    setView("preview");
  }, []);

  const stats = React.useMemo(() => {
    if (!doc) return null;
    return {
      characters: doc.text.length,
      words: doc.text.trim() === "" ? 0 : doc.text.trim().split(/\s+/).length,
      paragraphs: paragraphCount(doc.text),
    };
  }, [doc]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input ─────────────────────────────────────────────────────────── */}
      {!doc && (
        <div className="flex flex-col gap-4">
          <FileDropZone
            accept=".rtf,application/rtf,text/rtf"
            onFiles={onFiles}
            icon="FileText"
            label="Drop an .rtf file, click to browse, or paste raw RTF"
            hint="Rich Text Format · parsed entirely in your browser"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPasteOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={pasteOpen}
            >
              <Icon name="ClipboardPaste" size={15} />
              {pasteOpen ? "Hide paste box" : "Paste RTF markup"}
            </button>

            <button
              type="button"
              onClick={loadSample}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="Sparkles" size={15} />
              Try a sample
            </button>
          </div>

          {pasteOpen && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="rtf-paste"
                className="text-sm font-medium text-foreground"
              >
                Paste raw RTF
              </label>
              <textarea
                id="rtf-paste"
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                spellCheck={false}
                rows={6}
                placeholder="{\\rtf1\\ansi ... }"
                className="w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-[13px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div>
                <Button
                  type="button"
                  onClick={applyPaste}
                  disabled={pasteValue.trim() === ""}
                  className="gap-2"
                >
                  <Icon name="Eye" size={16} />
                  Render RTF
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* ── Result ────────────────────────────────────────────────────────── */}
      {doc && stats && (
        <div className={cn("overflow-hidden rounded-xl border bg-card", style.border)}>
          {/* Header: file, stats, view toggle, actions */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
            <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="FileText" size={16} className={cn("shrink-0", style.text)} />
              <span className="truncate" title={doc.name}>
                {doc.name}
              </span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <StatBadge icon="FileText" label="Size" value={formatBytes(doc.bytes)} />
              <StatBadge icon="Type" label="Words" value={stats.words.toLocaleString()} />
              <StatBadge
                icon="Pilcrow"
                label="Paragraphs"
                value={stats.paragraphs.toLocaleString()}
              />
              <StatBadge
                icon="Hash"
                label="Chars"
                value={stats.characters.toLocaleString()}
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ViewToggle view={view} onChange={setView} style={style} />
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon name="RotateCcw" size={15} />
                Reset
              </button>
            </div>
          </div>

          {/* Body: rendered preview or raw source */}
          {view === "preview" ? (
            doc.text.trim() === "" ? (
              <p className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                <Icon name="Info" size={18} className={style.text} />
                This RTF file parsed successfully but contained no readable text  -
                it may be all tables, images or objects, which this reader drops.
              </p>
            ) : (
              <div
                className="rtf-preview max-h-[32rem] overflow-auto px-5 py-4 text-[15px] leading-relaxed text-foreground [&_p]:my-2 [&_strong]:font-semibold"
                aria-label="Rendered RTF document"
                 
                // sanitised by construction inside rtfToHtml (see lib/rtf.ts).
                dangerouslySetInnerHTML={{ __html: doc.html }}
              />
            )
          ) : (
            <div className="max-h-[32rem] overflow-auto p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-muted-foreground">
                {doc.raw}
              </pre>
            </div>
          )}

          {/* Footer: export actions */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/20 px-4 py-3">
            <span className="mr-1 text-xs font-medium text-muted-foreground">
              Export:
            </span>

            <CopyButton getValue={() => doc.html} label="Copy HTML" />
            <button
              type="button"
              onClick={() =>
                download(
                  `${baseName(doc.name)}.html`,
                  wrapHtmlDocument(baseName(doc.name), doc.html),
                  "text/html;charset=utf-8",
                )
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="FileCode2" size={15} />
              Download HTML
            </button>

            <span className="mx-1 h-4 w-px bg-border" aria-hidden />

            <CopyButton getValue={() => doc.text} label="Copy text" />
            <button
              type="button"
              onClick={() =>
                download(
                  `${baseName(doc.name)}.txt`,
                  doc.text,
                  "text/plain;charset=utf-8",
                )
              }
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="FileDown" size={15} />
              Download text
            </button>
          </div>
        </div>
      )}

      {/* ── Honest boundary note ──────────────────────────────────────────── */}
      <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          This is a lightweight{" "}
          <strong className="font-medium text-foreground">reader</strong>, not a
          full RTF renderer. It preserves text plus bold, italic and underline and
          paragraph breaks: the formatting most.rtf files use. Tables, embedded
          images, fonts, colors and tab stops are dropped in favour of clean,
          readable content. Everything runs in your browser; nothing is uploaded.
        </span>
      </p>
    </div>
  );
}

/* ── Preview / source toggle ──────────────────────────────────────────────── */

function ViewToggle({
  view,
  onChange,
  style,
}: {
  view: View;
  onChange: (v: View) => void;
  style: ReturnType<typeof accentStyle>;
}) {
  const options: { value: View; label: string; icon: string }[] = [
    { value: "preview", label: "Preview", icon: "Eye" },
    { value: "source", label: "Source", icon: "Code" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Document view"
      className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5"
    >
      {options.map((opt) => {
        const active = view === opt.value;
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

/** Wrap the sanitised body in a minimal, self-contained HTML document for export. */
function wrapHtmlDocument(title: string, body: string): string {
  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<style>
  body { font: 16px/1.6 -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 46rem; margin: 2rem auto; padding: 0 1rem; color: #1a1a1a; }
  p { margin: 0.75em 0; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}
