"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  CopyButton,
  DownloadButton,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  download,
} from "@/components/tool/dev";
import {
  SvgPreview,
  readSvgDimensions,
  type PreviewBackground,
  type PreviewZoom,
} from "./svg-preview";

/* ────────────────────────────────────────────────────────────────────────────
 * SVG → PNG rasterisation (fully in-browser)
 * Loads the SVG as an <img> via a blob URL, paints it to a <canvas> at the
 * requested pixel size, and resolves a PNG blob. No network, no libraries.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Render an SVG string to a PNG Blob at the given pixel dimensions. */
export async function svgToPng(
  svg: string,
  width: number,
  height: number,
  background?: string,
): Promise<Blob> {
  if (typeof window === "undefined") throw new Error("PNG export needs a browser.");
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (out) => (out ? resolve(out) : reject(new Error("PNG encoding failed."))),
        "image/png",
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load SVG for rasterisation."));
    img.src = url;
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────────────────── */

/** Props for {@link GeneratorCanvas}. */
export interface GeneratorCanvasProps {
  /** The generated SVG markup to preview and export. */
  svg: string;
  /** Controls panel content (sliders, color pickers, selects…). */
  controls: React.ReactNode;
  /** Heading above the controls panel. Default "Controls". */
  controlsTitle?: React.ReactNode;
  /** Base filename (without extension). Default "graphic". */
  filename?: string;
  /** PNG export multiplier applied to the SVG's intrinsic size. Default 2. */
  pngScale?: number;
  /**
   * Explicit PNG pixel size. When omitted, uses the SVG's intrinsic dimensions
   * (or 1024² as a fallback) times `pngScale`.
   */
  pngSize?: { width: number; height: number };
  /** Solid background painted behind the PNG (e.g. "#fff"); omit for transparent. */
  pngBackground?: string;
  /** Extra actions appended to the toolbar (e.g. a Randomise button). */
  toolbarExtra?: React.ReactNode;
  /** Reset handler; button hidden when omitted. */
  onReset?: () => void;
  /** Randomise handler; a dice button is shown when provided. */
  onRandomize?: () => void;
  /** Preview background (controlled). */
  previewBackground?: PreviewBackground;
  onPreviewBackgroundChange?: (bg: PreviewBackground) => void;
  /** Preview zoom (controlled). */
  previewZoom?: PreviewZoom;
  onPreviewZoomChange?: (zoom: PreviewZoom) => void;
  /** Place the controls panel on the right instead of the left. Default false. */
  controlsRight?: boolean;
  /** Min height of the preview surface in px. Default 360. */
  previewMinHeight?: number;
  className?: string;
}

/**
 * The shell for SVG generators (blobs, waves, patterns, gradients, shapes,
 * placeholders): a scrollable controls panel beside a big live {@link SvgPreview},
 * with copy, SVG download, and one-click PNG export (rasterised in-browser at a
 * configurable scale). Optional Randomise/Reset actions. Generated SVG is trusted
 * (skips the preview sanitiser) so gradients/filters render intact.
 */
export function GeneratorCanvas({
  svg,
  controls,
  controlsTitle = "Controls",
  filename = "graphic",
  pngScale = 2,
  pngSize,
  pngBackground,
  toolbarExtra,
  onReset,
  onRandomize,
  previewBackground,
  onPreviewBackgroundChange,
  previewZoom,
  onPreviewZoomChange,
  controlsRight = false,
  previewMinHeight = 360,
  className,
}: GeneratorCanvasProps) {
  const [exporting, setExporting] = React.useState(false);
  const [pngError, setPngError] = React.useState<string | null>(null);

  const dims = React.useMemo(() => readSvgDimensions(svg), [svg]);

  const pngDims = React.useMemo(() => {
    if (pngSize) return pngSize;
    const w = (dims.width ?? 1024) * pngScale;
    const h = (dims.height ?? 1024) * pngScale;
    return { width: Math.round(w), height: Math.round(h) };
  }, [pngSize, dims.width, dims.height, pngScale]);

  const exportPng = React.useCallback(async () => {
    if (!svg.trim()) return;
    setExporting(true);
    setPngError(null);
    try {
      const blob = await svgToPng(svg, pngDims.width, pngDims.height, pngBackground);
      download(`${filename}.png`, blob, "image/png");
    } catch (err) {
      setPngError(err instanceof Error ? err.message : "PNG export failed.");
    } finally {
      setExporting(false);
    }
  }, [svg, pngDims.width, pngDims.height, pngBackground, filename]);

  const controlsPanel = (
    <aside
      className="flex w-full flex-col gap-4 overflow-y-auto rounded-lg border border-border bg-card p-4 lg:max-h-[640px] lg:w-80 lg:shrink-0"
      aria-label={typeof controlsTitle === "string" ? controlsTitle : "Controls"}
    >
      {controlsTitle && (
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon name="SlidersHorizontal" size={15} className="text-muted-foreground" />
          {controlsTitle}
        </h3>
      )}
      <div className="flex flex-col gap-4">{controls}</div>
    </aside>
  );

  const dimText =
    dims.width != null && dims.height != null
      ? `${round(dims.width)} × ${round(dims.height)}`
      : "—";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className={cn(
          "flex flex-col gap-4 lg:flex-row",
          controlsRight && "lg:flex-row-reverse",
        )}
      >
        {controlsPanel}

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <SvgPreview
            svg={svg}
            unsafeSkipSanitize
            background={previewBackground}
            onBackgroundChange={onPreviewBackgroundChange}
            zoom={previewZoom}
            onZoomChange={onPreviewZoomChange}
            minHeight={previewMinHeight}
            emptyLabel="Adjust the controls to generate a graphic"
            className="flex-1"
          />

          <Toolbar>
            <CopyButton getValue={() => svg} label="Copy SVG" />
            <DownloadButton
              filename={`${filename}.svg`}
              getValue={() => svg}
              mime="image/svg+xml;charset=utf-8"
              label="SVG"
              icon="FileCode"
            />
            <ToolbarButton
              icon="FileImage"
              label="PNG"
              onClick={exportPng}
              loading={exporting}
              disabled={!svg.trim()}
            />
            <ToolbarDivider />
            <StatBadge label="Size" value={dimText} icon="Ruler" />
            <ToolbarSpacer />
            {onRandomize && (
              <ToolbarButton icon="Dices" label="Randomize" onClick={onRandomize} />
            )}
            {onReset && (
              <ToolbarButton
                icon="RotateCcw"
                label="Reset"
                variant="destructive"
                onClick={onReset}
              />
            )}
            {toolbarExtra}
          </Toolbar>

          {pngError && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <Icon name="TriangleAlert" size={15} />
              {pngError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function round(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}
