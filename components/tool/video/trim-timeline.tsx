"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";

import { captureFrame, formatDuration } from "./media-utils";

/** A trim selection, in seconds. */
export interface TrimRange {
  start: number;
  end: number;
}

/** Props for {@link TrimTimeline}. */
export interface TrimTimelineProps {
  /** Total clip duration in seconds. */
  duration: number;
  /** Current selection. */
  value: TrimRange;
  onChange: (range: TrimRange) => void;
  /**
   * Source blob used to render filmstrip thumbnails behind the track. Omit to
   * render a plain track (still fully functional).
   */
  source?: Blob | null;
  /** Optional playhead position (seconds): draws a marker on the track. */
  playhead?: number;
  /** Seek callback when the user clicks the track body. */
  onSeek?: (seconds: number) => void;
  /** Minimum selectable span in seconds. Default 0.1. */
  minSpan?: number;
  /** Number of filmstrip thumbnails to render. Default 10. */
  thumbnails?: number;
  disabled?: boolean;
  className?: string;
}

type DragTarget = "start" | "end" | null;

/**
 * A dual-handle range over the clip's timeline for trim / split tools. Drag
 * either handle (mouse, touch, or keyboard) to bound the selection; the region
 * outside the selection dims. When a `source` blob is provided it lazily paints
 * a filmstrip of native `<video>` frames behind the track (no ffmpeg). Clicking
 * the track seeks. Handles are focusable and respond to ←/→ (±1s, ±0.1s with
 * Shift) and Home/End.
 */
export function TrimTimeline({
  duration,
  value,
  onChange,
  source = null,
  playhead,
  onSeek,
  minSpan = 0.1,
  thumbnails = 10,
  disabled = false,
  className,
}: TrimTimelineProps) {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = React.useState<DragTarget>(null);
  const [frames, setFrames] = React.useState<(string | null)[]>([]);

  const safeDuration = duration > 0 && Number.isFinite(duration) ? duration : 0;

  // Lazily render the filmstrip when a source + duration are available.
  React.useEffect(() => {
    if (!source || safeDuration <= 0 || thumbnails <= 0) {
      setFrames([]);
      return;
    }
    let cancelled = false;
    const count = thumbnails;
    setFrames(new Array(count).fill(null));
    (async () => {
      for (let i = 0; i < count; i++) {
        const t = (safeDuration * (i + 0.5)) / count;
        // Sequential to avoid spinning up many <video> elements at once.
         
        const frame = await captureFrame(source, t, 120);
        if (cancelled) return;
        setFrames((prev) => {
          const next = prev.slice();
          next[i] = frame;
          return next;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, safeDuration, thumbnails]);

  const posFromClientX = React.useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track || safeDuration <= 0) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      return Math.min(Math.max(ratio, 0), 1) * safeDuration;
    },
    [safeDuration],
  );

  const applyDrag = React.useCallback(
    (target: DragTarget, seconds: number) => {
      if (target === "start") {
        onChange({ start: Math.min(seconds, value.end - minSpan), end: value.end });
      } else if (target === "end") {
        onChange({ start: value.start, end: Math.max(seconds, value.start + minSpan) });
      }
    },
    [onChange, value.start, value.end, minSpan],
  );

  React.useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => applyDrag(drag, posFromClientX(e.clientX));
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, applyDrag, posFromClientX]);

  const startPct = safeDuration > 0 ? (value.start / safeDuration) * 100 : 0;
  const endPct = safeDuration > 0 ? (value.end / safeDuration) * 100 : 100;
  const headPct =
    playhead != null && safeDuration > 0
      ? Math.min(Math.max((playhead / safeDuration) * 100, 0), 100)
      : null;

  const handleKey = (target: "start" | "end") => (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 1;
    let next: number | null = null;
    const cur = target === "start" ? value.start : value.end;
    if (e.key === "ArrowRight") next = cur + step;
    else if (e.key === "ArrowLeft") next = cur - step;
    else if (e.key === "Home") next = target === "start" ? 0 : value.start + minSpan;
    else if (e.key === "End") next = target === "start" ? value.end - minSpan : safeDuration;
    if (next == null) return;
    e.preventDefault();
    applyDrag(target, Math.min(Math.max(next, 0), safeDuration));
  };

  return (
    <div className={cn("select-none", className)}>
      <div
        ref={trackRef}
        onPointerDown={(e) => {
          if (disabled || drag) return;
          // Click on the track body seeks (handles stop propagation).
          onSeek?.(posFromClientX(e.clientX));
        }}
        className={cn(
          "relative h-16 w-full overflow-hidden rounded-lg border border-border bg-muted",
          onSeek && !disabled && "cursor-pointer",
          disabled && "opacity-50",
        )}
      >
        {/* Filmstrip */}
        {frames.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex">
            {frames.map((f, i) => (
              <div
                key={i}
                className="h-full flex-1 border-r border-black/20 bg-cover bg-center last:border-r-0"
                style={f ? { backgroundImage: `url(${f})` } : undefined}
              />
            ))}
          </div>
        )}

        {/* Dim outside selection */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 bg-background/70"
          style={{ width: `${startPct}%` }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 bg-background/70"
          style={{ width: `${100 - endPct}%` }}
        />

        {/* Selection outline */}
        <div
          className="pointer-events-none absolute inset-y-0 border-y-2 border-primary"
          style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
        />

        {/* Playhead */}
        {headPct != null && (
          <div
            className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.4)]"
            style={{ left: `${headPct}%` }}
          />
        )}

        {/* Start handle */}
        <Handle
          side="start"
          leftPct={startPct}
          seconds={value.start}
          disabled={disabled}
          onPointerDown={(e) => {
            if (disabled) return;
            e.stopPropagation();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            setDrag("start");
          }}
          onKeyDown={handleKey("start")}
          ariaMin={0}
          ariaMax={value.end - minSpan}
          duration={safeDuration}
        />
        {/* End handle */}
        <Handle
          side="end"
          leftPct={endPct}
          seconds={value.end}
          disabled={disabled}
          onPointerDown={(e) => {
            if (disabled) return;
            e.stopPropagation();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            setDrag("end");
          }}
          onKeyDown={handleKey("end")}
          ariaMin={value.start + minSpan}
          ariaMax={safeDuration}
          duration={safeDuration}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs tabular-nums text-muted-foreground">
        <span className="flex items-center gap-1">
          <Icon name="Scissors" size={12} />
          {formatDuration(value.start, true)}
        </span>
        <span className="font-medium text-foreground">
          {formatDuration(Math.max(value.end - value.start, 0), true)} selected
        </span>
        <span>{formatDuration(value.end, true)}</span>
      </div>
    </div>
  );
}

interface HandleProps {
  side: "start" | "end";
  leftPct: number;
  seconds: number;
  duration: number;
  disabled: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  ariaMin: number;
  ariaMax: number;
}

function Handle({
  side,
  leftPct,
  seconds,
  duration,
  disabled,
  onPointerDown,
  onKeyDown,
  ariaMin,
  ariaMax,
}: HandleProps) {
  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={side === "start" ? "Trim start" : "Trim end"}
      aria-valuemin={Math.round(ariaMin * 10) / 10}
      aria-valuemax={Math.round(ariaMax * 10) / 10}
      aria-valuenow={Math.round(seconds * 10) / 10}
      aria-valuetext={formatDuration(seconds, true)}
      aria-orientation="horizontal"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      style={{ left: `${leftPct}%` }}
      className={cn(
        "group absolute inset-y-0 z-10 flex w-4 -translate-x-1/2 cursor-ew-resize touch-none items-center justify-center outline-none",
        "focus-visible:z-20",
      )}
    >
      <span
        className={cn(
          "flex h-full w-2 items-center justify-center rounded-sm bg-primary shadow transition-transform group-hover:scale-x-125 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-background",
        )}
      >
        <Icon
          name="GripVertical"
          size={12}
          className="text-primary-foreground/80"
        />
      </span>
      {/* void - duration referenced to keep API explicit for future ticks */}
      <span className="sr-only">
        {formatDuration(seconds, true)} of {formatDuration(duration)}
      </span>
    </div>
  );
}
