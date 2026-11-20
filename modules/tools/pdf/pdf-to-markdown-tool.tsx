"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { pdfToMarkdown, type PdfToMarkdownResult } from "@/lib/pdf/markdown";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";

const OPTIONS = [
  { key: "detectHeadings", label: "Detect headings", hint: "Larger text becomes #, ## or ###" },
  { key: "keepEmphasis", label: "Keep bold & italic", hint: "Carried across as ** and _" },
  { key: "detectLists", label: "Detect lists", hint: "Bullets and 1. 2. 3. become list items" },
  { key: "pageBreaks", label: "Mark page breaks", hint: "Insert --- between pages" },
] as const;

type OptionKey = (typeof OPTIONS)[number]["key"];

/**
 * PDF to Markdown: structure inferred from typography, honestly labelled.
 *
 * The result panel leads with what was inferred (heading count, word count) and
 * calls out pages that yielded no text, because that is the signature of a scan
 * and the single most common reason someone thinks the tool "didn't work".
 */
export default function PdfToMarkdownTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);
  const [opts, setOpts] = React.useState<Record<OptionKey, boolean>>({
    detectHeadings: true,
    keepEmphasis: true,
    detectLists: true,
    pageBreaks: true,
  });
  const optsRef = React.useRef(opts);
  React.useEffect(() => {
    optsRef.current = opts;
  }, [opts]);

  const resultRef = React.useRef<PdfToMarkdownResult | null>(null);
  const [result, setResult] = React.useState<PdfToMarkdownResult | null>(null);
  const [copied, setCopied] = React.useState(false);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    zipName: "markdown-gigai",
    process: async (files: PdfInput[], onProgress): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) throw new Error("Add a PDF to convert to Markdown.");

      const res = await pdfToMarkdown(input, {
        ...optsRef.current,
        onProgress: (fraction, status) => onProgress({ value: fraction, label: status }),
      });

      if (res.markdown.trim().length === 0) {
        throw new Error(
          "No text could be read from this PDF. It's almost certainly a scan: pages saved as images have no text layer. Run it through OCR PDF first, then convert.",
        );
      }

      resultRef.current = res;
      return [
        {
          name: input.name.replace(/\.pdf$/i, "") + ".md",
          blob: new Blob([res.markdown], { type: "text/markdown;charset=utf-8" }),
          size: new Blob([res.markdown]).size,
        },
      ];
    },
  });

  React.useEffect(() => {
    if (state.phase === "done") setResult(resultRef.current);
    else if (state.phase === "idle" || state.phase === "ready") {
      setResult(null);
      resultRef.current = null;
      setCopied(false);
    }
  }, [state.phase]);

  const copy = React.useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [result]);

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="FileCode2"
      dropHint="Select one PDF to turn into Markdown"
      processLabel="Convert to Markdown"
      resultHint="Text is read in your browser: the PDF is never uploaded."
      // Shown with the finished file: `children` unmount when processing ends,
      // so a preview rendered there would never be seen.
      resultExtra={result ? (
        <div className={cn("flex flex-col gap-3 rounded-xl border p-4", style.border, style.soft)}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <Icon name="FileCode2" size={16} className={style.text} />
              {result.words.toLocaleString()} words · {result.headings} heading
              {result.headings === 1 ? "" : "s"} detected
            </span>
            <button
              type="button"
              onClick={copy}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors",
                style.border,
                "hover:bg-muted/50",
              )}
            >
              <Icon name={copied ? "Check" : "Copy"} size={14} />
              {copied ? "Copied" : "Copy Markdown"}
            </button>
          </div>

          {result.emptyPages.length > 0 ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong className="font-medium">
                No text on page{result.emptyPages.length === 1 ? "" : "s"}{" "}
                {result.emptyPages.slice(0, 8).join(", ")}
                {result.emptyPages.length > 8 ? "…" : ""}.
              </strong>{" "}
              Those pages are images; run the file through OCR PDF first to
              recover their words.
            </p>
          ) : null}

          <pre className="max-h-80 overflow-auto rounded-lg border border-border bg-background p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
            {result.markdown.slice(0, 4000)}
            {result.markdown.length > 4000 ? "\n\n… download the file for the rest" : ""}
          </pre>
        </div>
      ) : null}
    >
      <PdfFileList
        files={state.files}
        onRemove={state.removeFile}
        accent={tool.accent}
        label="PDF to convert"
        showPageCounts
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">What to infer</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {OPTIONS.map((o) => (
            <label
              key={o.key}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                opts[o.key] ? cn(style.border, style.soft) : "border-border hover:bg-muted/40",
              )}
            >
              <input
                type="checkbox"
                checked={opts[o.key]}
                onChange={(e) => setOpts((p) => ({ ...p, [o.key]: e.target.checked }))}
                className={cn("mt-0.5 size-4 shrink-0 accent-current", style.text)}
              />
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-foreground">{o.label}</span>
                <span className="text-xs text-muted-foreground">{o.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
        <Icon name="Info" size={16} className={cn("mt-0.5 shrink-0", style.text)} />
        <span className="text-muted-foreground">
          A PDF stores positioned glyphs, not structure, so headings and lists
          are <em>inferred</em> from type size and line prefixes. It gets ordinary
          documents right and can misread heavily designed pages. Check the
          preview before you rely on it.
        </span>
      </div>

    </PdfWorkspace>
  );
}
