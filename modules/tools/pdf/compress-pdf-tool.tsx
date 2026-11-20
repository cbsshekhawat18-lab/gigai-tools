"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { compressPdf } from "@/lib/pdf/convert";
import { warmPdfRaster } from "@/lib/engine-preload";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";

/** The three compression levels the engine's `compressPdf` accepts. */
type Level = "low" | "medium" | "high";

/** Copy for each level. What the user is choosing between. */
const LEVELS: ReadonlyArray<{
  value: Level;
  label: string;
  hint: string;
  icon: string;
}> = [
  { value: "low", label: "Low", hint: "Sharpest pages · modest saving", icon: "Feather" },
  { value: "medium", label: "Medium", hint: "Balanced quality & size", icon: "Scale" },
  { value: "high", label: "High", hint: "Smallest file · softer pages", icon: "Minimize2" },
];

/**
 * Compress PDF, a single-file tool that shrinks a PDF entirely in the browser.
 *
 * It queues one PDF through `usePdfTool` (accept application/pdf, single), lets
 * the user pick a Low/Medium/High level, then re-encodes each page as a JPEG
 * with the engine's `compressPdf`. The level lives in component state and is
 * read through a ref inside `process` so the current choice is always used.
 * Because the result metadata (original vs compressed size + % saved) is the
 * whole point, we cache the source size and surface the delta prominently.
 */
export default function CompressPdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [level, setLevel] = React.useState<Level>("medium");
  // Read the freshest level inside the async processor without re-binding it.
  const levelRef = React.useRef<Level>(level);
  React.useEffect(() => {
    levelRef.current = level;
  }, [level]);

  // Remember the size of the file we actually compressed so the "done" screen
  // can show a true before/after even after the queue is otherwise untouched.
  const [originalSize, setOriginalSize] = React.useState<number | null>(null);

  const state = usePdfTool({
    slug: tool.slug,
    warm: warmPdfRaster,
    accept: "application/pdf",
    multiple: false,
    process: async (
      files: PdfInput[],
      onProgress,
    ): Promise<NamedBlob[]> => {
      const source = files[0];
      if (!source) {
        throw new Error("Add a PDF to compress, then try again.");
      }
      setOriginalSize(source.size);
      const compressed = await compressPdf(source, {
        level: levelRef.current,
        onProgress: (fraction, status) =>
          onProgress({ value: fraction, label: status }),
      });
      return [{ name: compressed.name, blob: compressed.blob, size: compressed.size }];
    },
  });

  const source = state.files[0];
  const result = state.results[0];

  // Prefer the cached original (survives into the "done" phase); fall back to
  // the queued file's size while the user is still on the ready screen.
  const before = originalSize ?? source?.size ?? null;
  const after = result?.size ?? null;
  const savedBytes = before !== null && after !== null ? before - after : null;
  const savedPct =
    before !== null && after !== null && before > 0
      ? Math.round(((before - after) / before) * 100)
      : null;
  const unchanged = savedPct !== null && savedPct <= 0;

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="FileArchive"
      dropHint="Select one PDF to shrink, scans and image-heavy files compress most"
      processLabel="Compress PDF"
      resultHint="Recompressed in your browser. Nothing is uploaded."
    >
      <PdfFileList
        files={state.files}
        onRemove={state.removeFile}
        accent={tool.accent}
        label="File to compress"
      />

      {/* ── Compression level control ──────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-foreground">
          Compression level
        </legend>
        <div
          role="radiogroup"
          aria-label="Compression level"
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {LEVELS.map((option) => {
            const active = level === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setLevel(option.value)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  style.ring,
                  active
                    ? cn("bg-card", style.border, style.text)
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50",
                )}
              >
                <span className="flex w-full items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon
                      name={option.icon}
                      size={16}
                      className={active ? style.text : "text-muted-foreground"}
                    />
                    {option.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full border",
                      active ? style.border : "border-muted-foreground/40",
                    )}
                  >
                    {active ? (
                      <span className={cn("size-2 rounded-full", style.solid)} />
                    ) : null}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {option.hint}
                </span>
              </button>
            );
          })}
        </div>
        <p className="inline-flex items-start gap-2 text-xs text-muted-foreground">
          <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
          Compression re-encodes each page as an image, so text becomes part of
          the page and isn&apos;t selectable afterwards. It works best on scanned or
          image-heavy PDFs.
        </p>
      </fieldset>

      {/* ── Estimated saving readout (only meaningful after a run) ──────────── */}
      {before !== null && after !== null ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Original</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatBytes(before)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Compressed</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatBytes(after)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                {unchanged ? "Result" : "Saved"}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  unchanged ? "text-muted-foreground" : style.text,
                )}
              >
                {unchanged
                  ? "Unchanged"
                  : `${savedPct}% · ${formatBytes(Math.max(0, savedBytes ?? 0))}`}
              </span>
            </div>
          </div>
          {unchanged ? (
            <p className="inline-flex items-start gap-2 text-xs text-muted-foreground">
              <Icon
                name="ShieldAlert"
                size={14}
                className={cn("mt-0.5 shrink-0", style.text)}
              />
              This PDF was already smaller than the recompressed version, so we
              returned your original file untouched.
            </p>
          ) : null}
        </div>
      ) : null}
    </PdfWorkspace>
  );
}
