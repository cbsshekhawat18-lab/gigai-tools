"use client";

/**
 * PDF to HTML, reconstruct clean, semantic HTML from a PDF, in the browser.
 *
 * Drop / paste a PDF, and pdf.js walks every page's text layer while the engine
 * groups the items into reading-order paragraphs wrapped in per-page <section>
 * elements. The result is shown two ways, a rendered preview and a raw source
 * view, and can be copied or downloaded as a self-contained.html file.
 * Password-protected PDFs are decrypted locally.
 *
 * Reuse, not reinvention:
 *  - `pdfToHtml` (lib/document-tools/convert): the pdf.js reconstruction
 *  - `DocumentDropzone` (components/tool/document), the type-detecting input
 *   - dev harness `CopyButton`, `SegmentedControl`, `StatBadge`, `download`
 *
 * Honest boundary (surfaced in the UI, not just config): this rebuilds an
 * EXISTING text layer into reading-order paragraphs. NOT pixel-perfect layout,
 * columns, tables, fonts or images. Scanned / image-only PDFs come back empty
 * and need OCR first.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import type { WorkspaceToolData } from "@/types";

import { Button } from "@/components/ui/button";
import {
  CopyButton,
  SegmentedControl,
  StatBadge,
  download,
} from "@/components/tool/dev";
import {
  DocumentDropzone,
  type DetectedFile,
} from "@/components/tool/document";
import { type DocumentKind, textStats } from "@/lib/document-tools";
import { pdfToHtml } from "@/lib/document-tools/convert";

const ACCEPT: readonly DocumentKind[] = ["pdf"] as const;

type Phase = "idle" | "converting" | "done" | "error" | "password";
type View = "preview" | "source";

const VIEWS: ReadonlyArray<{ value: View; label: string }> = [
  { value: "preview", label: "Preview" },
  { value: "source", label: "Source" },
];

/** Swap a filename's extension for .html. */
function toHtmlName(pdfName: string): string {
  return pdfName.replace(/\.pdf$/i, "") + ".html";
}

/**
 * Pull the per-page <section>…</section> blocks out of the full document the
 * engine returns, for the rendered preview (we don't want to nest a whole
 * <!doctype html> document inside the page). If none are found, fall back to the
 * body inner HTML, then to the raw string.
 */
function extractSections(fullHtml: string): string {
  const sections = fullHtml.match(/<section[\s\S]*?<\/section>/gi);
  if (sections && sections.length > 0) return sections.join("\n");
  const body = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(fullHtml);
  return body?.[1]?.trim() ?? fullHtml;
}

/** Count how many <section> (i.e. pages) the reconstruction produced. */
function countPages(fullHtml: string): number {
  const matches = fullHtml.match(/<section[\s>]/gi);
  return matches ? matches.length : 0;
}

/** Approximate visible text length, for the "empty scan" check + stats. */
function visibleText(sections: string): string {
  return sections
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/* Scoped styling for the rendered preview, deliberately minimal, mirroring
 * that the exported HTML carries no inline styles and inherits site CSS. */
const PREVIEW_CSS = `
.gk-pdfhtml section{padding:0 0 1.25rem;margin:0 0 1.25rem;border-bottom:1px dashed color-mix(in srgb, currentColor 18%, transparent);}
.gk-pdfhtml section:last-child{border-bottom:none;margin-bottom:0;}
.gk-pdfhtml section::before{content:"Page " attr(data-page);display:block;font-size:11px;letter-spacing:.05em;text-transform:uppercase;opacity:.5;margin:0 0 .5rem;font-family:ui-sans-serif,system-ui,sans-serif;}
.gk-pdfhtml p{margin:0 0 .7em;line-height:1.65;}
`;

export default function PdfToHtmlTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [file, setFile] = React.useState<DetectedFile | null>(null);
  const [fullHtml, setFullHtml] = React.useState<string>("");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [view, setView] = React.useState<View>("preview");
  const [error, setError] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState<string>("");
  const [needsPassword, setNeedsPassword] = React.useState(false);

  const sections = React.useMemo(
    () => (fullHtml ? extractSections(fullHtml) : ""),
    [fullHtml],
  );
  const pageCount = React.useMemo(() => countPages(fullHtml), [fullHtml]);
  const plain = React.useMemo(() => visibleText(sections), [sections]);
  const stats = React.useMemo(() => textStats(plain), [plain]);
  const outName = file ? toHtmlName(file.file.name) : "converted.html";
  const empty = phase === "done" && plain === "";

  const convert = React.useCallback(
    async (target: DetectedFile, pwd?: string) => {
      setPhase("converting");
      setError(null);
      try {
        const res = await pdfToHtml(target.file, {
          title: target.file.name.replace(/\.pdf$/i, ""),
          ...(pwd ? { password: pwd } : {}),
        });
        if (!res.ok) {
          // A password failure reveals the inline field instead of a hard error.
          if (/password/i.test(res.error)) {
            setNeedsPassword(true);
            setPhase("password");
            setError(pwd ? res.error : null);
            return;
          }
          throw new Error(res.error);
        }
        setFullHtml(res.result);
        setNeedsPassword(false);
        setPhase("done");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Couldn't convert this PDF to HTML.",
        );
        setPhase("error");
      }
    },
    [],
  );

  const onFile = React.useCallback(
    (detected: DetectedFile) => {
      setFile(detected);
      setFullHtml("");
      setPassword("");
      setNeedsPassword(false);
      setError(null);
      setView("preview");
      void convert(detected);
    },
    [convert],
  );

  const reset = React.useCallback(() => {
    setFile(null);
    setFullHtml("");
    setPassword("");
    setNeedsPassword(false);
    setError(null);
    setPhase("idle");
  }, []);

  const submitPassword = React.useCallback(() => {
    if (file && password.trim()) void convert(file, password.trim());
  }, [file, password, convert]);

  return (
    <div className="flex flex-col gap-6">
      <style>{PREVIEW_CSS}</style>

      {/* ── Input ─────────────────────────────────────────────────────────── */}
      {!file ? (
        <DocumentDropzone
          accept={ACCEPT}
          onFile={onFile}
          icon="FileUp"
          label="Drop a PDF, click to browse, or paste"
          hint="Rebuilds each page's text into semantic HTML: nothing is uploaded"
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
            <Icon name="Code" size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {file.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.file.size)}
              {pageCount > 0 &&
                ` · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`}
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
            Enter its open password to rebuild the HTML. The password stays in
            your browser and is never uploaded.
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
              disabled={!password.trim() || phase === "converting"}
            >
              {phase === "converting" ? (
                <Icon name="LoaderCircle" size={16} className="animate-spin" />
              ) : (
                <Icon name="Unlock" size={16} />
              )}
              Unlock &amp; convert
            </Button>
          </div>
        </div>
      )}

      {/* ── Converting status ─────────────────────────────────────────────── */}
      {phase === "converting" && !needsPassword && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Icon name="LoaderCircle" size={15} className="animate-spin" />
          Reading the text layer and rebuilding HTML…
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
        <div
          className={cn("overflow-hidden rounded-xl border bg-card", style.border)}
        >
          {/* Header: view toggle + stats + actions */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon name="Code" size={16} className={style.text} />
              Rebuilt HTML
            </span>
            {!empty && (
              <SegmentedControl
                value={view}
                onChange={setView}
                options={VIEWS}
                ariaLabel="Result view"
                size="sm"
              />
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              <StatBadge icon="Type" label="Words" value={stats.words} />
              <StatBadge icon="Hash" label="Chars" value={stats.characters} />
              <StatBadge icon="Files" label="Pages" value={pageCount} />
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <CopyButton
                getValue={() => fullHtml}
                label="Copy HTML"
                disabled={!fullHtml}
              />
              <button
                type="button"
                onClick={() =>
                  download(outName, fullHtml, "text/html;charset=utf-8")
                }
                disabled={!fullHtml}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                <Icon name="Download" size={15} />
                Download .html
              </button>
            </div>
          </div>

          {/* Body */}
          {empty ? (
            <div className="flex flex-col items-start gap-2 px-4 py-6 text-sm">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <Icon name="ImageOff" size={18} className="text-amber-500" />
                No text found in this PDF
              </p>
              <p className="text-muted-foreground">
                This PDF has no text layer to rebuild, it&apos;s almost
                certainly a scan or made of page images. Run it through the{" "}
                <span className="font-medium text-foreground">OCR PDF</span> tool
                first to recognise the characters, then convert it to HTML here.
              </p>
            </div>
          ) : view === "preview" ? (
            <div className="max-h-[32rem] overflow-auto p-5">
              <div
                className="gk-pdfhtml mx-auto max-w-[760px] text-[15px] text-foreground"
                 
                dangerouslySetInnerHTML={{ __html: sections }}
              />
            </div>
          ) : (
            <textarea
              readOnly
              value={fullHtml}
              aria-label="Rebuilt HTML source"
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
          This rebuilds a PDF&apos;s{" "}
          <strong className="font-medium text-foreground">
            existing text layer
          </strong>{" "}
          into clean, reading-order paragraphs wrapped in per-page sections. It
          recovers the words and their order, not the original columns, tables,
          fonts or images, and it is not pixel-perfect. A scanned or image-only
          PDF has no text to convert until it&apos;s run through OCR first. Need
          the raw words only, or the styling rebuilt into an editable file? Try{" "}
          <span className="font-medium text-foreground">PDF to TXT</span> or{" "}
          <span className="font-medium text-foreground">PDF to Word</span>.
          Everything happens in your browser. Your file is never uploaded.
        </span>
      </p>
    </div>
  );
}
