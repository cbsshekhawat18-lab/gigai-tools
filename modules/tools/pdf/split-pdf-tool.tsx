"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes, getPageCount } from "@/lib/pdf/core";
import { splitByRanges, splitToPages } from "@/lib/pdf/ops";
import type { PageRange } from "@/lib/pdf/types";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfPageGrid } from "@/components/tool/pdf/pdf-page-grid";

/** The three ways to divide a document. */
type SplitMode = "pages" | "ranges" | "every";

/** Default chunk size for "every N pages". */
const DEFAULT_CHUNK = 2;

/**
 * Turn a page total into consecutive N-page ranges: 7 pages by 3 gives
 * 1-3, 4-6, 7-7. The tail is short rather than dropped, because losing the
 * last pages of a split silently would be the worst possible failure here.
 */
function chunkRanges(pageCount: number, size: number): PageRange[] {
  const ranges: PageRange[] = [];
  for (let from = 1; from <= pageCount; from += size) {
    ranges.push({ from, to: Math.min(from + size - 1, pageCount) });
  }
  return ranges;
}

/**
 * Parse a human-typed range string like "1-3, 4-8, 10" into inclusive 1-based
 * `PageRange`s. Tolerant of spaces and en-dashes; a bare number "5" becomes
 * {from:5,to:5}. Returns the parsed ranges plus the first invalid token (if
 * any) so the UI can explain exactly what to fix. No silent dropping.
 */
function parseRanges(input: string): { ranges: PageRange[]; invalid: string | null } {
  const tokens = input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const ranges: PageRange[] = [];
  for (const token of tokens) {
    const cleaned = token.replace(/[–-]/g, "-");
    const match = /^(\d+)\s*(?:-\s*(\d+))?$/.exec(cleaned);
    if (!match) {
      return { ranges: [], invalid: token };
    }
    const from = Number(match[1]);
    const to = match[2] !== undefined ? Number(match[2]) : from;
    if (from < 1 || to < 1) {
      return { ranges: [], invalid: token };
    }
    ranges.push({ from: Math.min(from, to), to: Math.max(from, to) });
  }
  return { ranges, invalid: null };
}

/**
 * Split PDF, divides one PDF into many smaller documents, entirely in the
 * browser with pdf-lib.
 *
 * A single file is queued through `usePdfTool` (accept application/pdf, single).
 * Its pages render as thumbnails in `PdfPageGrid` for reference. Two modes drive
 * the engine call: "every page" → `splitToPages` (one single-page file per
 * page), and "custom ranges" → `splitByRanges` (one file per parsed range). The
 * multiple outputs surface in `PdfWorkspace`, which offers a Download-all ZIP.
 */
export default function SplitPdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [mode, setMode] = React.useState<SplitMode>("pages");
  const [rangeText, setRangeText] = React.useState("");
  const [chunkText, setChunkText] = React.useState(String(DEFAULT_CHUNK));

  // Keep the freshest settings for the (stable) process callback.
  const modeRef = React.useRef(mode);
  const rangeTextRef = React.useRef(rangeText);
  React.useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  React.useEffect(() => {
    rangeTextRef.current = rangeText;
  }, [rangeText]);
  const chunkTextRef = React.useRef(chunkText);
  React.useEffect(() => {
    chunkTextRef.current = chunkText;
  }, [chunkText]);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    zipName: "split-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const source = files[0];
      if (!source) {
        throw new Error("Upload a PDF to split. Drop a file in and try again.");
      }

      if (modeRef.current === "ranges") {
        const { ranges, invalid } = parseRanges(rangeTextRef.current);
        if (invalid !== null) {
          throw new Error(
            `"${invalid}" isn't a valid range. Use page numbers like 1-3, 4-8 or 10.`,
          );
        }
        if (ranges.length === 0) {
          throw new Error(
            "Add at least one page range, e.g. 1-3, 4-8. Or switch to 'Every page' mode.",
          );
        }
        return splitByRanges(source, ranges);
      }

      if (modeRef.current === "every") {
        const size = Number.parseInt(chunkTextRef.current, 10);
        if (!Number.isFinite(size) || size < 1) {
          throw new Error("Enter how many pages each file should contain, 1 or more.");
        }
        // The page count is read here rather than held in state so the split
        // always reflects the file actually queued, not a stale count.
        const pageCount = await getPageCount(source.file);
        return splitByRanges(source, chunkRanges(pageCount, size));
      }

      return splitToPages(source);
    },
  });

  const source = state.files[0];
  const parsed = React.useMemo(() => parseRanges(rangeText), [rangeText]);
  const chunkSize = Number.parseInt(chunkText, 10);
  const chunkValid = Number.isFinite(chunkSize) && chunkSize >= 1;
  const rangeReady =
    mode === "ranges"
      ? parsed.invalid === null && parsed.ranges.length > 0
      : mode === "every"
        ? chunkValid
        : true;

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="Scissors"
      dropHint="Select one PDF to split into multiple files"
      processLabel={
        mode === "ranges"
          ? `Split into ${parsed.ranges.length || 0} file${parsed.ranges.length === 1 ? "" : "s"}`
          : mode === "every"
            ? `Split every ${chunkValid ? chunkSize : DEFAULT_CHUNK} pages`
            : "Split every page"
      }
      resultHint="Each piece is a separate PDF, built entirely in your browser."
    >
      {source ? (
        <>
          {/* Split-mode selector. */}
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium text-foreground">
              How should we split it?
            </legend>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Split mode">
              {(
                [
                  {
                    value: "pages" as const,
                    icon: "Files",
                    title: "Every page",
                    hint: "One single-page PDF per page",
                  },
                  {
                    value: "every" as const,
                    icon: "Layers",
                    title: "Every N pages",
                    hint: "Fixed-size chunks, e.g. 2 pages each",
                  },
                  {
                    value: "ranges" as const,
                    icon: "SplitSquareHorizontal",
                    title: "Custom ranges",
                    hint: "One PDF per range you define",
                  },
                ]
              ).map((opt) => {
                const active = mode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMode(opt.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      style.ring,
                      active
                        ? cn("ring-2", style.border, style.ring)
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        active ? cn(style.solid, "text-white") : style.soft,
                      )}
                    >
                      <Icon name={opt.icon} size={18} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {opt.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {opt.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Custom-range input, shown only in ranges mode. */}
          {mode === "ranges" ? (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="split-ranges"
                className="text-sm font-medium text-foreground"
              >
                Page ranges
              </label>
              <input
                id="split-ranges"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                value={rangeText}
                onChange={(event) => setRangeText(event.target.value)}
                placeholder="e.g. 1-3, 4-8, 10"
                aria-describedby="split-ranges-hint"
                aria-invalid={parsed.invalid !== null}
                className={cn(
                  "w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                  parsed.invalid !== null
                    ? "border-destructive focus-visible:border-destructive"
                    : cn("border-border", style.border),
                )}
              />
              <p
                id="split-ranges-hint"
                className={cn(
                  "text-xs",
                  parsed.invalid !== null
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {parsed.invalid !== null
                  ? `"${parsed.invalid}" isn't a valid range: use numbers like 1-3, 4-8 or 10.`
                  : parsed.ranges.length > 0
                    ? `${parsed.ranges.length} range${parsed.ranges.length === 1 ? "" : "s"} → ${parsed.ranges.length} file${parsed.ranges.length === 1 ? "" : "s"}. Ranges are inclusive and 1-based.`
                    : "Type comma-separated, 1-based, inclusive ranges. A single number extracts one page."}
              </p>
            </div>
          ) : mode === "every" ? (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="split-chunk"
                className="text-sm font-medium text-foreground"
              >
                Pages per file
              </label>
              <input
                id="split-chunk"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                autoComplete="off"
                value={chunkText}
                onChange={(event) => setChunkText(event.target.value)}
                aria-describedby="split-chunk-hint"
                aria-invalid={!chunkValid}
                className={cn(
                  "w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors sm:max-w-40",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                  chunkValid
                    ? cn("border-border", style.border)
                    : "border-destructive focus-visible:border-destructive",
                )}
              />
              <p
                id="split-chunk-hint"
                className={cn("text-xs", chunkValid ? "text-muted-foreground" : "text-destructive")}
              >
                {chunkValid
                  ? `The document is cut into consecutive ${chunkSize}-page files. If the total doesn't divide evenly the last file is simply shorter. No pages are dropped.`
                  : "Enter a whole number of pages, 1 or more."}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              <Icon name="Info" size={16} className={cn("mt-0.5 shrink-0", style.text)} />
              <span>
                Every page becomes its own single-page PDF. Use{" "}
                <span className="font-medium text-foreground">Every N pages</span>{" "}
                or{" "}
                <span className="font-medium text-foreground">Custom ranges</span>{" "}
                instead if you want to keep sections together.
              </span>
            </div>
          )}

          {/* Source summary + page previews for reference. */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Icon name="FileText" size={16} className={style.text} />
                <span className="max-w-[16rem] truncate font-medium text-foreground">
                  {source.name}
                </span>
                <span className="tabular-nums">· {formatBytes(source.size)}</span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  rangeReady ? style.soft : "bg-muted text-muted-foreground",
                )}
              >
                <Icon name={rangeReady ? "Scissors" : "Info"} size={13} />
                {mode === "pages"
                  ? "Ready to split every page"
                  : rangeReady
                    ? "Ready to split by range"
                    : "Add a range to continue"}
              </span>
            </div>

            <PdfPageGrid file={source.file} accent={tool.accent} />
          </div>
        </>
      ) : null}
    </PdfWorkspace>
  );
}
