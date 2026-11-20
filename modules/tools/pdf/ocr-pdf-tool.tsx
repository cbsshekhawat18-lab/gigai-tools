"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { ocrPdf } from "@/lib/pdf/ocr";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * The languages we offer. `code` is the Tesseract model code; picking the right
 * one is the single biggest lever on accuracy, so each is labelled plainly.
 */
const LANGUAGES: ReadonlyArray<{ code: string; label: string }> = [
  { code: "eng", label: "English" },
  { code: "fra", label: "French (Français)" },
  { code: "deu", label: "German (Deutsch)" },
  { code: "spa", label: "Spanish (Español)" },
  { code: "ita", label: "Italian (Italiano)" },
  { code: "por", label: "Portuguese (Português)" },
  { code: "nld", label: "Dutch (Nederlands)" },
];

/**
 * OCR PDF, mirrors the Merge reference, but for a SINGLE scanned PDF that is
 * recognised into searchable text.
 *
 * A `usePdfTool` queue (accept application/pdf, single file) feeds the engine's
 * `ocrPdf`, which rasterises each page with pdf.js, reads the characters with a
 * tesseract.js worker, and rebuilds the PDF with an invisible text layer. The
 * chosen language lives in component state (read through a ref inside `process`
 * so the current choice is always used) and is passed to `ocrPdf`; the engine's
 * per-page `onProgress` drives the workspace's determinate bar.
 *
 * OCR returns TWO things (a searchable PDF and the raw text) but the shared
 * workspace only offers the PDF download. So we cache the recognised text in
 * state and render a copy-to-clipboard panel below the workspace once done.
 */
export default function OcrPdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [language, setLanguage] = React.useState<string>("eng");
  // Read the freshest language inside the async processor without re-binding it.
  const languageRef = React.useRef(language);
  React.useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // The recognised plain text, surfaced after a run for copy-to-clipboard. It's
  // cleared whenever a fresh run starts so a stale result can't linger.
  const [text, setText] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    zipName: "searchable-pdf-gigai",
    process: async (
      files: PdfInput[],
      onProgress,
    ): Promise<NamedBlob[]> => {
      const source = files[0];
      if (!source) {
        throw new Error("Add a scanned PDF to run OCR on, then try again.");
      }
      setText(null);
      setCopied(false);

      const result = await ocrPdf(source, {
        language: languageRef.current,
        onProgress: (fraction, status) =>
          onProgress({ value: fraction, label: status }),
      });

      const recognised = result.text.trim();
      if (!recognised) {
        throw new Error(
          "No text could be recognised. Try a clearer, higher-resolution scan or confirm the language is correct.",
        );
      }
      setText(recognised);

      const { searchablePdf } = result;
      return [
        {
          name: searchablePdf.name,
          blob: searchablePdf.blob,
          size: searchablePdf.size,
        },
      ];
    },
  });

  const source = state.files[0];
  const activeLanguage =
    LANGUAGES.find((l) => l.code === language)?.label ?? "English";

  const handleCopy = React.useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="flex flex-col gap-6">
      <PdfWorkspace
        state={state}
        accent={tool.accent}
        accept="application/pdf"
        multiple={false}
        dropIcon="ScanText"
        dropHint="Select one scanned or image-only PDF to make searchable"
        processLabel="Run OCR"
        resultHint="Recognition runs in your browser with Tesseract. Nothing is uploaded."
      >
        <PdfFileList
          files={state.files}
          onRemove={state.removeFile}
          accent={tool.accent}
          label="File to recognise"
        />

        {source ? (
          <div className="flex flex-col gap-6">
            {/* ── Language selector ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="ocr-language">
                <Icon name="Languages" size={15} className={style.text} />
                Document language
              </Label>
              <div className="relative">
                <select
                  id="ocr-language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className={cn(
                    "w-full appearance-none rounded-xl border border-border bg-card px-3.5 py-2.5 pr-10 text-sm font-medium text-foreground outline-none transition-colors",
                    "hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    style.ring,
                  )}
                >
                  {LANGUAGES.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Icon
                  name="ChevronDown"
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
              <p className="inline-flex items-start gap-2 text-xs text-muted-foreground">
                <Icon
                  name="Info"
                  size={14}
                  className={cn("mt-0.5 shrink-0", style.text)}
                />
                Pick the language your document is written in. The first time you
                use <span className="font-medium text-foreground">{activeLanguage}</span>,
                its recognition model (a few MB) downloads to your browser and is
                then cached for next time.
              </p>
            </div>

            {/* ── Source summary ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
              <Icon
                name="FileText"
                size={18}
                className={cn("shrink-0", style.text)}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-foreground">
                  {source.name}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatBytes(source.size)} · will be recognised in{" "}
                  {activeLanguage}
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </PdfWorkspace>

      {/* ── Extracted text panel (available once OCR has finished) ──────────── */}
      {state.phase === "done" && text ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  style.soft,
                )}
              >
                <Icon name="ClipboardCheck" size={18} />
              </span>
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-foreground">
                  Extracted text
                </h3>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {wordCount.toLocaleString()} word
                  {wordCount === 1 ? "" : "s"} recognised · {activeLanguage}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopy()}
              aria-label="Copy extracted text to clipboard"
            >
              <Icon name={copied ? "Check" : "Copy"} size={15} />
              {copied ? "Copied" : "Copy text"}
            </Button>
          </div>

          <label htmlFor="ocr-extracted-text" className="sr-only">
            Extracted text from your PDF
          </label>
          <textarea
            id="ocr-extracted-text"
            readOnly
            value={text}
            rows={10}
            spellCheck={false}
            className={cn(
              "w-full resize-y rounded-xl border border-border bg-muted/30 p-3.5 font-mono text-xs leading-relaxed text-foreground outline-none",
              "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              style.ring,
            )}
          />
          <p className="inline-flex items-start gap-2 text-xs text-muted-foreground">
            <Icon
              name="ShieldCheck"
              size={14}
              className={cn("mt-0.5 shrink-0", style.text)}
            />
            This text was read on your device: download the searchable PDF above
            to keep the scan, or copy the text to reuse it elsewhere.
          </p>
        </div>
      ) : null}
    </div>
  );
}
