"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { computePeaks, type Peaks } from "./audio-utils";

/** A normalized selection region, expressed as fractions of the total duration. */
export interface WaveSelection {
  /** Start, 0–1. */
  start: number;
  /** End, 0–1 (always ≥ start). */
  end: number;
}

/** Props for {@link Waveform}. */
export interface WaveformProps {
  /**
   * Source of the envelope. Provide a decoded {@link AudioBuffer} (peaks are
   * computed for you) or a precomputed {@link Peaks} object for large clips.
   */
  buffer?: AudioBuffer | null;
  /** Precomputed envelope; takes precedence over `buffer` when both are set. */
  peaks?: Peaks | null;
  /**
   * Draggable selection region (fractions 0–1). Provide with {@link onSelect}
   * to make the waveform a trim/cut/split editor. Omit for a static display.
   */
  selection?: WaveSelection | null;
  /** Called as the user creates or edits the selection region. */
  onSelect?: (selection: WaveSelection) => void;
  /** Current playback position as a fraction 0–1, draws a playhead. */
  playhead?: number | null;
  /** Seek handler: clicking/tapping the track reports a 0–1 position. */
  onSeek?: (fraction: number) => void;
  /** Waveform stroke color. Default: the theme primary. */
  color?: string;
  /** Height in px. Default 96. */
  height?: number;
  className?: string;
  /** Accessible label for the region. Default "Audio waveform". */
  "aria-label"?: string;
}

type DragMode = "create" | "move" | "start" | "end" | null;

const HANDLE_HIT_PX = 8;

/**
 * A crisp, retina-aware canvas waveform. Renders a decoded buffer (or
 * precomputed peaks) as a symmetric min/max envelope, with an optional draggable
 * selection region for trim / cut / split tools and an optional playhead.
 *
 * Interaction: drag on empty track to create a region; drag the body to move it;
 * drag either edge to resize. When `onSeek` is set (and no selection editing is
 * in play) a plain click seeks. Fully pointer-driven, so it works with mouse,
 * touch, and pen; the region is also keyboard-nudgeable via ←/→ (and Shift for
 * the end edge) when focused.
 */
export function Waveform({
  buffer = null,
  peaks: peaksProp = null,
  selection = null,
  onSelect,
  playhead = null,
  onSeek,
  color,
  height = 96,
  className,
  "aria-label": ariaLabel = "Audio waveform",
}: WaveformProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(0);
  const dragRef = React.useRef<{ mode: DragMode; anchor: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const interactive = Boolean(onSelect);

  // Track width so we can rasterize peaks at native pixel resolution.
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(Math.round(w));
    });
    ro.observe(el);
    setWidth(Math.round(el.clientWidth));
    return () => ro.disconnect();
  }, []);

  // Compute (or accept) the envelope at the current pixel width.
  const peaks = React.useMemo<Peaks | null>(() => {
    if (peaksProp) return peaksProp;
    if (buffer && width > 0) return computePeaks(buffer, width);
    return null;
  }, [peaksProp, buffer, width]);

  const onSelectRef = React.useRef(onSelect);
  onSelectRef.current = onSelect;
  const onSeekRef = React.useRef(onSeek);
  onSeekRef.current = onSeek;

  // Paint.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const styles = getComputedStyle(canvas);
    const stroke = color ?? `hsl(${styles.getPropertyValue("--primary").trim() || "220 90% 56%"})`;
    const mid = height / 2;

    // Center line.
    ctx.strokeStyle = "rgba(128,128,128,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(width, mid);
    ctx.stroke();

    if (peaks) {
      const n = peaks.length;
      const colW = width / n;
      const inSel = (i: number) => {
        if (!selection) return true;
        const f = (i + 0.5) / n;
        return f >= selection.start && f <= selection.end;
      };
      for (let i = 0; i < n; i++) {
        const x = i * colW;
        const hi = peaks.max[i] ?? 0;
        const lo = peaks.min[i] ?? 0;
        const yTop = mid - hi * mid * 0.92;
        const yBot = mid - lo * mid * 0.92;
        ctx.strokeStyle = selection && !inSel(i) ? withAlpha(stroke, 0.3) : stroke;
        ctx.lineWidth = Math.max(1, colW - 0.5);
        ctx.beginPath();
        ctx.moveTo(x + colW / 2, Math.min(yTop, mid - 0.5));
        ctx.lineTo(x + colW / 2, Math.max(yBot, mid + 0.5));
        ctx.stroke();
      }
    }
  }, [peaks, width, height, color, selection]);

  // ---- Pointer interaction -------------------------------------------------

  const fractionFromEvent = (clientX: number): number => {
    const el = wrapRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };

  const hitTest = (f: number): DragMode => {
    if (!selection) return "create";
    const px = width;
    const startX = selection.start * px;
    const endX = selection.end * px;
    const x = f * px;
    if (Math.abs(x - startX) <= HANDLE_HIT_PX) return "start";
    if (Math.abs(x - endX) <= HANDLE_HIT_PX) return "end";
    if (x > startX && x < endX) return "move";
    return "create";
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) {
      if (onSeekRef.current) onSeekRef.current(fractionFromEvent(e.clientX));
      return;
    }
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const f = fractionFromEvent(e.clientX);
    const mode = hitTest(f);
    dragRef.current = { mode, anchor: f };
    setDragging(true);
    if (mode === "create") onSelectRef.current?.({ start: f, end: f });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !interactive) return;
    const f = fractionFromEvent(e.clientX);
    const cur = selection ?? { start: drag.anchor, end: drag.anchor };
    let next: WaveSelection;
    if (drag.mode === "create") {
      next = { start: Math.min(drag.anchor, f), end: Math.max(drag.anchor, f) };
    } else if (drag.mode === "start") {
      next = { start: Math.min(f, cur.end), end: cur.end };
    } else if (drag.mode === "end") {
      next = { start: cur.start, end: Math.max(f, cur.start) };
    } else {
      // move, preserve width, clamp to [0,1]
      const w = cur.end - cur.start;
      let start = f - w / 2;
      start = Math.min(1 - w, Math.max(0, start));
      next = { start, end: start + w };
    }
    onSelectRef.current?.(next);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive || !selection) return;
    const stepK = e.altKey ? 0.001 : e.shiftKey ? 0.05 : 0.01;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      // Ctrl/Cmd edits the end edge; otherwise the whole region shifts.
      if (e.metaKey || e.ctrlKey) {
        const end = Math.min(1, Math.max(selection.start, selection.end + dir * stepK));
        onSelect?.({ start: selection.start, end });
      } else {
        const w = selection.end - selection.start;
        let start = selection.start + dir * stepK;
        start = Math.min(1 - w, Math.max(0, start));
        onSelect?.({ start, end: start + w });
      }
    }
  };

  const selStyle = selection
    ? {
        left: `${selection.start * 100}%`,
        width: `${Math.max(0, selection.end - selection.start) * 100}%`,
      }
    : null;

  return (
    <div
      ref={wrapRef}
      role={interactive ? "slider" : onSeek ? "button" : "img"}
      aria-label={ariaLabel}
      tabIndex={interactive ? 0 : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 100 : undefined}
      aria-valuenow={
        interactive && selection
          ? Math.round(((selection.start + selection.end) / 2) * 100)
          : undefined
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      className={cn(
        "relative w-full select-none overflow-hidden rounded-md bg-muted/40 outline-none",
        interactive || onSeek ? "cursor-pointer" : "",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      style={{ height, touchAction: "none" }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Selection region overlay */}
      {selStyle && (
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 border-x-2 border-primary bg-primary/15",
            dragging && "bg-primary/20",
          )}
          style={selStyle}
        >
          <span className="absolute -left-[3px] top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow" />
          <span className="absolute -right-[3px] top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow" />
        </div>
      )}

      {/* Playhead */}
      {playhead != null && Number.isFinite(playhead) && (
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-foreground/80"
          style={{ left: `${Math.min(1, Math.max(0, playhead)) * 100}%` }}
        >
          <span className="absolute -top-0.5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-foreground" />
        </div>
      )}
    </div>
  );
}

/** Blend a CSS color toward transparent. Works for hsl()/rgb()/hex via canvas. */
function withAlpha(color: string, alpha: number): string {
  const c = color.trim();
  if (c.startsWith("hsl(")) return c.replace("hsl(", "hsla(").replace(")", ` / ${alpha})`);
  if (c.startsWith("rgb(")) return c.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  return c;
}
