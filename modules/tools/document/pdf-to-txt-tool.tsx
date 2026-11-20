"use client";

/**
 * PDF to TXT, extract a PDF's plain-text layer, entirely in the browser.
 *
 * Drop / paste a PDF, and pdf.js walks every page's text layer and concatenates
 * it into clean UTF-8 plain text shown live in a preview pane you can read,
 * copy and download as .txt. Password-protected PDFs are decrypted locally.
 *
 * Reuse, not reinvention:
 *  - `pdfToText` (lib/document-tools/convert), the pdf.js text extractor
 *  - `DocumentDropzone` (components/tool/document), the type-detecting input
 *   - dev harness `CopyButton`, `StatBadge`, `download`
 *
 * Honest boundary (surfaced in the UI, not just config): this reads an EXISTING
 * text layer. Scanned / image-only PDFs have none and come back empty: those
 * need the OCR PDF tool first.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import type { WorkspaceToolData } from "@/types";

import { Button } from "@/components/ui/button";
import { CopyButton, StatBadge, download } from "@/components/tool/dev";
import {
  DocumentDropzone,
  type DetectedFile,
} from "@/components/tool/document";
import { type DocumentKind, textStats } from "@/lib/document-tools";
import { pdfToText } from "@/lib/document-tools/convert";

const ACCEPT: readonly DocumentKind[] = ["pdf"] as const;

type Phase = "idle" | "extracting" | "done" | "error" | "password";

/** Number of page separators ("\n\n") → page count. */
function countPages(text: string): number {
  if (text.trim() === "") return 0;
  return text.split("\n\n").length;
}

/** Swap a filename's extension for .txt. */
function toTxtName(pdfName: string): string {
  return pdfName.replace(/\.pdf$/i, "") + ".txt";
}

export default function PdfToTxtTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [file, setFile] = React.useState<DetectedFile | null>(null);
  const [text, setText] = React.useState<string>("");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState<string>("");
  const [needsPassword, setNeedsPassword] = React.useState(false);

  const stats = React.useMemo(() => textStats(text), [text]);
  const pageCount = React.useMemo(() => countPages(text), [text]);
  const outName = file ? toTxtName(file.file.name) : "extracted.txt";

  const extract = React.useCallback(
    async (target: DetectedFile, pwd?: string) => {
      setPhase("extracting");
      setError(null);
      try {
        const res = await pdfToText(target.file, pwd ? { password: pwd } : {});
        if (!res.ok) {
          // A password-related failure reveals the password field instead of
          // showing a hard error, so the user can retry inline.
          if (/password/i.test(res.error)) {
            setNeedsPassword(true);
            setPhase("password");
            setError(pwd ? res.error : null);
            return;
          }
          throw new Error(res.error);
        }
        setText(res.result);
        setNeedsPassword(false);
        setPhase("done");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't extract text from this PDF.");
        setPhase("error");
      }
    },
    [],
  );

  const onFile = React.useCallback(
    (detected: DetectedFile) => {
      setFile(detected);
      setText("");
      setPassword("");
      setNeedsPassword(false);
      setError(null);
      void extract(detected);
    },
    [extract],
  );

  const reset = React.useCallback(() => {
    setFile(null);
    setText("");
    setPassword("");
    setNeedsPassword(false);
    setError(null);
    setPhase("idle");
  }, []);

  const submitPassword = React.useCallback(() => {
    if (file && password.trim()) void extract(file, password.trim());
  }, [file, password, extract]);

  const empty = phase === "done" && text.trim() === "";

  return (
    <div className="flex flex-col gap-6">
      {/* ── Input ─────────────────────────────────────────────────────────── */}
      {!file ? (
        <DocumentDropzone
          accept={ACCEPT}
          onFile={onFile}
          icon="FileUp"
          label="Drop a PDF, click to browse, or paste"
          hint="Extracts every page's text. Nothing is uploaded"
        />
      ) : (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3",
            style.border,
          )}
        >
          <span
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-white",
              style.solid,
            )}
            aria-hidden
          >
            <Icon name="FileText" size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {file.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.file.size)}
              {pageCount > 0 && ` · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="RotateCcw" size={15} />
            New PDF
          </button>
        </div>
      )}

      {/* ── Password prompt ───────────────────────────────────────────────── */}
      {needsPassword && (
        <div
          className={cn(
            "flex flex-col gap-3 rounded-xl border bg-card p-4",
            style.border,
          )}
        >
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon name="Lock" size={16} className={style.text} />
            This PDF is password-protected
          </p>
          <p className="text-xs text-muted-foreground">
            Enter its open password to extract the text. The password stays in your
            browser and is never uploaded.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitPassword();
              }}
              placeholder="PDF password"
              aria-label="PDF password"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              type="button"
              onClick={submitPassword}
              disabled={!password.trim() || phase === "extracting"}
            >
              {phase === "extracting" ? (
                <Icon name="LoaderCircle" size={16} className="animate-spin" />
              ) : (
                <Icon name="Unlock" size={16} />
              )}
              Unlock &amp; extract
            </Button>
          </div>
        </div>
      )}

      {/* ── Extracting status ─────────────────────────────────────────────── */}
      {phase === "extracting" && !needsPassword && (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="LoaderCircle" size={15} className="animate-spin" />
          Reading the text layer…
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
      {phase === "done" && (
        <div className={cn("overflow-hidden rounded-xl border bg-card", style.border)}>
          {/* Header: stats + actions */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="FileText" size={16} className={style.text} />
              Extracted text
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <StatBadge icon="Type" label="Words" value={stats.words} />
              <StatBadge icon="Hash" label="Chars" value={stats.characters} />
              <StatBadge icon="AlignLeft" label="Lines" value={stats.lines} />
              <StatBadge icon="Files" label="Pages" value={pageCount} />
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <CopyButton getValue={() => text} label="Copy text" disabled={!text} />
              <button
                type="button"
                onClick={() =>
                  download(outName, text, "text/plain;charset=utf-8")
                }
                disabled={!text}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <Icon name="Download" size={15} />
                Download .txt
              </button>
            </div>
          </div>

          {/* The extracted text */}
          {empty ? (
            <div className="flex flex-col items-start gap-2 px-4 py-6 text-sm">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <Icon name="ImageOff" size={18} className="text-amber-500" />
                No text found in this PDF
              </p>
              <p className="text-muted-foreground">
                This PDF has no text layer to read, it&apos;s almost certainly a
                scan or made of page images. Run it through the{" "}
                <span className="font-medium text-foreground">OCR PDF</span> tool
                first to recognise the characters, then extract the text here.
              </p>
            </div>
          ) : (
            <textarea
              readOnly
              value={text}
              aria-label="Extracted plain text"
              spellCheck={false}
              className="block max-h-[32rem] min-h-[16rem] w-full resize-y border-0 bg-transparent p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none"
            />
          )}
        </div>
      )}

      {/* ── Honest boundary note ──────────────────────────────────────────── */}
      <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          This reads a PDF&apos;s <strong className="font-medium text-foreground">existing text layer</strong>,
          so it recovers the words and reading order. Not the original columns,
          tables or fonts. A scanned or image-only PDF has no text to extract until
          it&apos;s run through OCR first. Everything happens in your browser, your
          file is never uploaded.
        </span>
      </p>
    </div>
  );
}
