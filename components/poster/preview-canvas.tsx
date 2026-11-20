"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { renderPoster, zoneRect, type RenderFonts } from "@/lib/poster/render";
import type { SupporterState, Zones } from "@/lib/poster/types";

export interface PreviewCanvasProps {
  banner: HTMLImageElement | null;
  /** Canvas pixel size; the element scales to its container via CSS. */
  size: { w: number; h: number };
  zones: Zones;
  supporter: SupporterState;
  photo: HTMLImageElement | null;
  labels: { name: string; area: string };
  fonts: RenderFonts;
  accent: string;
  /** When given (and a photo is set) the visitor can drag to pan. Deltas are
   *  fractions of the first photo slot's box, matching SupporterState. */
  onPan?: (dx: number, dy: number) => void;
  className?: string;
  label?: string;
}

/** One canvas, one render call per change. Used for the live preview, the
 *  thumbnails and the owner's slot editor - never three renderers. */
export function PreviewCanvas({ banner, size, zones, supporter, photo, labels, fonts, accent, onPan, className, label }: PreviewCanvasProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const drag = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderPoster({
      ctx, width: size.w, height: size.h, banner, zones, photo,
      photoSize: photo ? { w: photo.naturalWidth, h: photo.naturalHeight } : null,
      supporter, labels, fonts, accent,
    });
  }, [banner, size.w, size.h, zones, photo, supporter, labels, fonts, accent]);

  const first = zones.photos[0];
  const pannable = Boolean(onPan && photo && first);

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current || !onPan || !first) return;
    const el = e.currentTarget;
    const scale = el.width / el.getBoundingClientRect().width;
    const zr = zoneRect(first, el.width, el.height);
    onPan(((e.clientX - drag.current.x) * scale) / zr.w, ((e.clientY - drag.current.y) * scale) / zr.h);
    drag.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className={cn("block h-auto w-full", pannable && "cursor-grab touch-none active:cursor-grabbing", className)}
      style={{ aspectRatio: `${size.w} / ${size.h}` }}
      onPointerDown={pannable ? (e) => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); } : undefined}
      onPointerMove={pannable ? move : undefined}
      onPointerUp={pannable ? () => { drag.current = null; } : undefined}
      onPointerCancel={pannable ? () => { drag.current = null; } : undefined}
    />
  );
}
