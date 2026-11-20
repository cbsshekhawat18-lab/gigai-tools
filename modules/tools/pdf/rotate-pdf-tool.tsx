"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import { rotatePages } from "@/lib/pdf/ops";
import type { RotationSpec } from "@/lib/pdf/types";
import type { ImageToolProps } from "@/components/tool/types";
import {
  usePdfTool,
  type NamedBlob,
  type PdfInput,
} from "@/components/tool/pdf/use-pdf-tool";
import { PdfWorkspace } from "@/components/tool/pdf/pdf-workspace";
import { PdfPageGrid } from "@/components/tool/pdf/pdf-page-grid";
import { Button } from "@/components/ui/button";

/** The quarter-turns the "rotate all" control offers. */
const QUARTER_TURNS = [90, 180, 270] as const;

/** Normalise any degree value into the 0/90/180/270 range. */
function norm(deg: number): number {
  return ((Math.round(deg / 90) * 90) % 360 + 360) % 360;
}

/**
 * Rotate PDF, mirrors the Merge PDF reference, but for a single document with
 * page-level control.
 *
 * A `usePdfTool` queue (accept application/pdf, single file) feeds a
 * `PdfPageGrid` whose `rotations` map holds the *delta* to apply to each page
 * (0/90/180/270 clockwise, live-previewed on the thumbnails). A "rotate all"
 * control adds the same turn to every page. On run we hand the non-zero deltas
 * to the engine's `rotatePages` as a `RotationSpec[]`, which writes the new
 * `/Rotate` value into the file with pdf-lib, so the orientation is saved, not
 * just previewed.
 */
export default function RotatePdfTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  // Per-page rotation delta (1-based page → 0/90/180/270 clockwise).
  const [rotations, setRotations] = React.useState<Record<number, number>>({});
  // Number of pages, learned from the grid's rotation callback (so "rotate all"
  // can reach pages the user hasn't individually touched yet).
  const [pageCount, setPageCount] = React.useState(0);

  // Keep the freshest map available to the async processor.
  const rotationsRef = React.useRef(rotations);
  React.useEffect(() => {
    rotationsRef.current = rotations;
  }, [rotations]);

  const state = usePdfTool({
    slug: tool.slug,
    accept: "application/pdf",
    multiple: false,
    zipName: "rotated-gigai",
    process: async (files: PdfInput[]): Promise<NamedBlob[]> => {
      const input = files[0];
      if (!input) {
        throw new Error("Add a PDF to rotate. Drop in a file and try again.");
      }

      // Turn the delta map into per-page rotation specs, dropping no-op pages.
      const specs: RotationSpec[] = Object.entries(rotationsRef.current)
        .map(([page, degrees]) => ({ page: Number(page), degrees: norm(degrees) }))
        .filter((spec) => spec.degrees !== 0);

      if (specs.length === 0) {
        throw new Error(
          "No pages are rotated yet. Turn at least one page, or use Rotate all, then try again.",
        );
      }

      const rotated = await rotatePages(input, specs);
      return [{ name: rotated.name, blob: rotated.blob, size: rotated.size }];
    },
  });

  // The single queued file, if any. Drives the grid + resets rotation state.
  const file = state.files[0];
  const fileId = file?.id;

  // When the file changes (reset / new upload), start rotations fresh.
  React.useEffect(() => {
    setRotations({});
    setPageCount(0);
  }, [fileId]);

  /** Add the same quarter-turn to every known page. */
  const rotateAll = React.useCallback(
    (turn: number) => {
      setRotations((prev) => {
        const next: Record<number, number> = { ...prev };
        // Bump every page we know about; if the count isn't learned yet, fall
        // back to the pages already present in the map.
        const last = Math.max(pageCount, ...Object.keys(prev).map(Number), 0);
        for (let p = 1; p <= last; p += 1) {
          next[p] = norm((next[p] ?? 0) + turn);
        }
        return next;
      });
    },
    [pageCount],
  );

  const rotatedPages = Object.values(rotations).filter(
    (deg) => norm(deg) !== 0,
  ).length;
  const hasRotation = rotatedPages > 0;

  return (
    <PdfWorkspace
      state={state}
      accent={tool.accent}
      accept="application/pdf"
      multiple={false}
      dropIcon="RotateCw"
      dropHint="Select a single PDF to rotate its pages"
      processLabel="Rotate PDF"
      resultHint="The new orientation is written into the file, entirely in your browser."
    >
      {file ? (
        <div className="flex flex-col gap-5">
          {/* ── Rotate-all controls ─────────────────────────────────────── */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Icon name="RefreshCw" size={16} className={style.text} />
              <h3 className="text-sm font-medium text-foreground">
                Rotate all pages
              </h3>
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Rotate every page"
            >
              {QUARTER_TURNS.map((turn) => (
                <Button
                  key={turn}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => rotateAll(turn)}
                  aria-label={`Rotate all pages ${turn} degrees clockwise`}
                >
                  <Icon name="RotateCw" size={15} />
                  {turn}°
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRotations({})}
                disabled={!hasRotation}
                aria-label="Reset all rotations"
              >
                <Icon name="Undo2" size={15} />
                Reset turns
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Turns are clockwise and stack: click again to keep rotating. Use a
              page&rsquo;s own control below to rotate just that page.
            </p>
          </div>

          {/* ── Per-page grid with live preview ─────────────────────────── */}
          <PdfPageGrid
            file={file.file}
            onLoaded={(pages) => setPageCount(pages.length)}
            rotations={rotations}
            onRotateChange={(next) => {
              // Learn the page count from the highest page the grid reports.
              const maxPage = Math.max(0, ...Object.keys(next).map(Number));
              setPageCount((current) => Math.max(current, maxPage));
              setRotations(next);
            }}
            accent={tool.accent}
          />

          {/* ── Running summary ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Icon
                name={hasRotation ? "RotateCw" : "Info"}
                size={16}
                className={style.text}
              />
              {hasRotation
                ? `${rotatedPages} page${rotatedPages === 1 ? "" : "s"} rotated · ${formatBytes(
                    file.size,
                  )}, ready to save`
                : "Rotate at least one page to continue."}
            </span>
            {hasRotation ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  style.soft,
                )}
              >
                <Icon name="Eye" size={13} />
                Preview is live
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </PdfWorkspace>
  );
}
