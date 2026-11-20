"use client";

import * as React from "react";
import DOMPurify from "dompurify";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
} from "@/components/tool/dev";

/* ────────────────────────────────────────────────────────────────────────────
 * SVG sanitiser
 * A preview may render arbitrary user SVG via dangerouslySetInnerHTML, so the
 * string is run through DOMPurify's SVG profile (svg + svgFilters) first. That
 * removes every executable vector, <script>, <foreignObject>, event handler
 * attributes (on*), javascript: URLs, <animate>/<set> attribute smuggling and
 * <use> references, via a real parser rather than bypassable regexes. All tool
 * modules mount client-side only (ssr:false), so DOMPurify always has a DOM.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Sanitise an SVG string for safe inline preview with DOMPurify
 * (SVG + SVG-filter profiles). Returns clean markup as a string.
 */
export function sanitizeSvg(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Dimension parsing
 * ──────────────────────────────────────────────────────────────────────────── */

/** Intrinsic dimensions of an SVG, derived from width/height or viewBox. */
export interface SvgDimensions {
  /** Rendered width in px (from width attr or viewBox), null if unknown. */
  width: number | null;
  /** Rendered height in px (from height attr or viewBox), null if unknown. */
  height: number | null;
  /** viewBox as [minX, minY, w, h] when present. */
  viewBox: [number, number, number, number] | null;
}

function parseLength(value: string | null): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Extract intrinsic dimensions from an SVG string using the platform DOMParser,
 * falling back to a regex scan when parsing fails. Returns nulls when unknown.
 */
export function readSvgDimensions(svg: string): SvgDimensions {
  const empty: SvgDimensions = { width: null, height: null, viewBox: null };
  if (!svg.trim()) return empty;

  let root: SVGElement | null = null;
  if (typeof window !== "undefined" && "DOMParser" in window) {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const el = doc.querySelector("svg");
      if (el && !doc.querySelector("parsererror")) root = el as unknown as SVGElement;
    } catch {
      root = null;
    }
  }

  let width: number | null = null;
  let height: number | null = null;
  let viewBox: [number, number, number, number] | null = null;

  if (root) {
    width = parseLength(root.getAttribute("width"));
    height = parseLength(root.getAttribute("height"));
    const vb = root.getAttribute("viewBox");
    if (vb) {
      const parts = vb.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
      if (parts.length === 4) {
        viewBox = [parts[0]!, parts[1]!, parts[2]!, parts[3]!];
      }
    }
  } else {
    // Fallback: regex the opening <svg> tag.
    const open = /<svg\b[^>]*>/i.exec(svg)?.[0] ?? "";
    width = parseLength(/\bwidth\s*=\s*["']?([\d.]+)/i.exec(open)?.[1] ?? null);
    height = parseLength(/\bheight\s*=\s*["']?([\d.]+)/i.exec(open)?.[1] ?? null);
    const vb = /\bviewBox\s*=\s*["']([^"']+)["']/i.exec(open)?.[1];
    if (vb) {
      const parts = vb.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
      if (parts.length === 4) viewBox = [parts[0]!, parts[1]!, parts[2]!, parts[3]!];
    }
  }

  if (width == null && viewBox) width = viewBox[2];
  if (height == null && viewBox) height = viewBox[3];

  return { width, height, viewBox };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Preview surface controls
 * ──────────────────────────────────────────────────────────────────────────── */

/** Backdrop behind the rendered SVG. */
export type PreviewBackground = "checker" | "light" | "dark";

/** Zoom presets: "fit" scales to the container, others are absolute %. */
export type PreviewZoom = "fit" | 0.5 | 1 | 2;

const ZOOM_CYCLE: PreviewZoom[] = ["fit", 0.5, 1, 2];

function zoomLabel(z: PreviewZoom): string {
  return z === "fit" ? "Fit" : `${z * 100}%`;
}

const BG_CYCLE: PreviewBackground[] = ["checker", "light", "dark"];

const BG_META: Record<PreviewBackground, { icon: string; label: string }> = {
  checker: { icon: "Grid2x2", label: "Transparent" },
  light: { icon: "Sun", label: "Light" },
  dark: { icon: "Moon", label: "Dark" },
};

/** Props for {@link SvgPreview}. */
export interface SvgPreviewProps {
  /** SVG source to render. Empty string shows the empty state. */
  svg: string;
  /** Controlled background; falls back to internal state when omitted. */
  background?: PreviewBackground;
  onBackgroundChange?: (bg: PreviewBackground) => void;
  /** Controlled zoom; falls back to internal state when omitted. Default "fit". */
  zoom?: PreviewZoom;
  onZoomChange?: (zoom: PreviewZoom) => void;
  /** Hide the built-in control strip (background/zoom/dimension readout). */
  hideControls?: boolean;
  /** Extra controls appended to the right of the control strip. */
  toolbarExtra?: React.ReactNode;
  /** Skip the DOMPurify sanitiser (only for already-trusted SVG). */
  unsafeSkipSanitize?: boolean;
  /** Min height of the canvas area in px. Default 220. */
  minHeight?: number;
  /** Message shown when `svg` is empty. */
  emptyLabel?: React.ReactNode;
  className?: string;
  /** Accessible label for the rendered graphic. */
  ariaLabel?: string;
}

const CHECKER_LIGHT =
  "repeating-conic-gradient(var(--svg-checker-a) 0% 25%, var(--svg-checker-b) 0% 50%) 50% / 20px 20px";

/**
 * The workhorse SVG preview. Renders an SVG string in a sandboxed surface with a
 * checkerboard transparency backdrop, a light/dark background toggle, fit/50/100/
 * 200% zoom, and a live dimension readout. User SVG is sanitised with DOMPurify
 * before it is inlined. Background and zoom can be controlled or left
 * uncontrolled.
 */
export function SvgPreview({
  svg,
  background: bgProp,
  onBackgroundChange,
  zoom: zoomProp,
  onZoomChange,
  hideControls = false,
  toolbarExtra,
  unsafeSkipSanitize = false,
  minHeight = 220,
  emptyLabel = "Nothing to preview yet",
  className,
  ariaLabel = "SVG preview",
}: SvgPreviewProps) {
  const [bgState, setBgState] = React.useState<PreviewBackground>("checker");
  const [zoomState, setZoomState] = React.useState<PreviewZoom>("fit");
  const background = bgProp ?? bgState;
  const zoom = zoomProp ?? zoomState;

  const setBackground = (bg: PreviewBackground) => {
    onBackgroundChange?.(bg);
    if (bgProp === undefined) setBgState(bg);
  };
  const setZoom = (z: PreviewZoom) => {
    onZoomChange?.(z);
    if (zoomProp === undefined) setZoomState(z);
  };

  const clean = React.useMemo(
    () => (unsafeSkipSanitize ? svg : sanitizeSvg(svg)),
    [svg, unsafeSkipSanitize],
  );
  const dims = React.useMemo(() => readSvgDimensions(svg), [svg]);
  const hasContent = clean.trim().length > 0;

  const cycleBg = () =>
    setBackground(BG_CYCLE[(BG_CYCLE.indexOf(background) + 1) % BG_CYCLE.length]!);
  const cycleZoom = () =>
    setZoom(ZOOM_CYCLE[(ZOOM_CYCLE.indexOf(zoom) + 1) % ZOOM_CYCLE.length]!);

  const surfaceStyle: React.CSSProperties =
    background === "checker"
      ? {
          background: CHECKER_LIGHT,
          // Checker tile colors adapt to the current theme via CSS vars set below.
        }
      : background === "light"
        ? { background: "#ffffff" }
        : { background: "#0b0b0f" };

  // Zoom → transform. "fit" lets the inner SVG use max-width/height; absolute
  // zoom scales from the natural size.
  const scaleStyle: React.CSSProperties =
    zoom === "fit"
      ? {}
      : { transform: `scale(${zoom})`, transformOrigin: "center center" };

  const dimText =
    dims.width != null && dims.height != null
      ? `${trimNum(dims.width)} × ${trimNum(dims.height)}`
      : dims.viewBox
        ? `${trimNum(dims.viewBox[2])} × ${trimNum(dims.viewBox[3])}`
        : "—";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        className,
      )}
      style={
        {
          "--svg-checker-a": "rgb(0 0 0 / 0.06)",
          "--svg-checker-b": "transparent",
        } as React.CSSProperties
      }
    >
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 dark:[--svg-checker-a:rgb(255_255_255_/_0.08)]"
        style={{ minHeight, ...surfaceStyle }}
      >
        {hasContent ? (
          <div
            role="img"
            aria-label={ariaLabel}
            className={cn(
              "grid place-items-center transition-transform",
              // In fit mode, constrain the inner SVG; the [&>svg] selectors reach
              // the injected root element.
              zoom === "fit" &&
                "[&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:w-auto",
            )}
            style={scaleStyle}
            dangerouslySetInnerHTML={{ __html: clean }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
            <Icon name="ImageOff" size={28} className="opacity-60" />
            <p className="text-sm">{emptyLabel}</p>
          </div>
        )}
      </div>

      {!hideControls && (
        <Toolbar className="rounded-none border-x-0 border-b-0 bg-muted/40">
          <ToolbarButton
            icon={BG_META[background].icon}
            label={BG_META[background].label}
            onClick={cycleBg}
            labelMode="responsive"
          />
          <ToolbarDivider />
          <ToolbarButton
            icon="ZoomIn"
            label={zoomLabel(zoom)}
            onClick={cycleZoom}
            labelMode="always"
          />
          <ToolbarSpacer />
          <span className="inline-flex items-center gap-1.5 px-2 font-mono text-sm tabular-nums text-muted-foreground">
            <Icon name="Ruler" size={13} />
            {dimText}
          </span>
          {toolbarExtra}
        </Toolbar>
      )}
    </div>
  );
}

/** Format a number without trailing zeros for the dimension readout. */
function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}
