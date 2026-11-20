"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import {
  cropImage,
  formatBytes,
  type LoadedImage,
  type ProcessResult,
} from "@/lib/image/engine";
import { Label } from "@/components/ui/label";
import { useImageTool } from "@/hooks/use-image-tool";
import { ToolWorkspace } from "@/components/tool/tool-workspace";
import type { ImageToolProps } from "@/components/tool/types";

/** A crop rectangle in SOURCE-image pixel coordinates. */
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Aspect presets. `ratio` is width / height; `null` = free-form. */
const RATIOS: { id: string; label: string; ratio: number | null }[] = [
  { id: "free", label: "Free", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
];

/** The eight resize handles plus the body ("move"). */
type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "move";
const CORNER_HANDLES: Exclude<Handle, "move">[] = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
];

/** Strip a file extension so we can append our own suffix. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/** File extension for the output, derived from the source MIME type. */
function extFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/jpeg") return "jpg";
  return "png";
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * A centred crop rectangle that fills as much of the image as the ratio allows.
 * For free-form we default to an inset 80% box.
 */
function defaultRect(imgW: number, imgH: number, ratio: number | null): Rect {
  if (ratio == null) {
    const width = Math.round(imgW * 0.8);
    const height = Math.round(imgH * 0.8);
    return {
      x: Math.round((imgW - width) / 2),
      y: Math.round((imgH - height) / 2),
      width,
      height,
    };
  }
  // Largest ratio-locked box that fits inside the image.
  let width = imgW;
  let height = width / ratio;
  if (height > imgH) {
    height = imgH;
    width = height * ratio;
  }
  width = Math.round(width);
  height = Math.round(height);
  return {
    x: Math.round((imgW - width) / 2),
    y: Math.round((imgH - height) / 2),
    width,
    height,
  };
}

/** Human label for a resize handle, for screen readers. */
const HANDLE_LABEL: Record<Exclude<Handle, "move">, string> = {
  nw: "top-left",
  n: "top",
  ne: "top-right",
  e: "right",
  se: "bottom-right",
  s: "bottom",
  sw: "left corner",
  w: "left",
};

/** Positioning classes for each handle over the selection box. */
const HANDLE_POS: Record<Exclude<Handle, "move">, string> = {
  nw: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
  n: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize",
  ne: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
  e: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
  se: "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
  s: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize",
  sw: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
  w: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
};

const MIN_CROP = 16; // minimum crop dimension, in source pixels

/**
 * Apply a drag delta (in source pixels) to a rect from a given handle, honouring
 * an optional locked ratio and clamping to the image bounds.
 */
function resizeRect(
  rect: Rect,
  handle: Handle,
  dx: number,
  dy: number,
  imgW: number,
  imgH: number,
  ratio: number | null,
): Rect {
  if (handle === "move") {
    return {
      ...rect,
      x: clamp(rect.x + dx, 0, imgW - rect.width),
      y: clamp(rect.y + dy, 0, imgH - rect.height),
    };
  }

  let { x, y, width, height } = rect;
  const right = x + width;
  const bottom = y + height;
  const west = handle.includes("w");
  const east = handle.includes("e");
  const north = handle.includes("n");
  const south = handle.includes("s");

  if (west) {
    const nx = clamp(x + dx, 0, right - MIN_CROP);
    width = right - nx;
    x = nx;
  }
  if (east) {
    width = clamp(width + dx, MIN_CROP, imgW - x);
  }
  if (north) {
    const ny = clamp(y + dy, 0, bottom - MIN_CROP);
    height = bottom - ny;
    y = ny;
  }
  if (south) {
    height = clamp(height + dy, MIN_CROP, imgH - y);
  }

  // Re-impose a locked ratio by adjusting the free dimension, anchored on the
  // side(s) opposite the handle being dragged.
  if (ratio != null) {
    if (north || south) {
      // Height changed → derive width.
      let w = height * ratio;
      w = clamp(w, MIN_CROP, imgW);
      height = w / ratio;
      if (west) x = clamp(right - w, 0, imgW - w);
      else if (!east) x = clamp(x + (width - w) / 2, 0, imgW - w);
      width = w;
    } else {
      // Width changed → derive height.
      let h = width / ratio;
      h = clamp(h, MIN_CROP, imgH);
      width = h * ratio;
      if (north) y = clamp(bottom - h, 0, imgH - h);
      else if (!south) y = clamp(y + (height - h) / 2, 0, imgH - h);
      height = h;
    }
    // Final bounds safety after ratio correction.
    width = Math.min(width, imgW - x);
    height = Math.min(height, imgH - y);
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(Math.max(MIN_CROP, width)),
    height: Math.round(Math.max(MIN_CROP, height)),
  };
}

/**
 * The interactive crop editor shown in the workspace controls: a scaled preview
 * of the source image with a draggable, resizable, ratio-lockable selection box.
 * Reports the crop rect (in source pixels) back up via `onChange`.
 */
function CropEditor({
  image,
  rect,
  ratioId,
  onRatioChange,
  onChange,
  accentText,
  accentRing,
}: {
  image: LoadedImage;
  rect: Rect;
  ratioId: string;
  onRatioChange: (id: string) => void;
  onChange: (next: Rect) => void;
  accentText: string;
  accentRing: string;
}) {
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  // Live drag session state, held in a ref so listeners read fresh values.
  const drag = React.useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    startRect: Rect;
    scale: number;
  } | null>(null);

  const activeRatio = RATIOS.find((r) => r.id === ratioId)?.ratio ?? null;

  /** Pixels-per-source-pixel of the on-screen preview. */
  const scaleOf = React.useCallback((): number => {
    const stage = stageRef.current;
    if (!stage || image.width === 0) return 1;
    return stage.clientWidth / image.width;
  }, [image.width]);

  const onPointerDown = React.useCallback(
    (handle: Handle) => (event: React.PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      (event.target as Element).setPointerCapture?.(event.pointerId);
      drag.current = {
        handle,
        startX: event.clientX,
        startY: event.clientY,
        startRect: rect,
        scale: scaleOf(),
      };
    },
    [rect, scaleOf],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent) => {
      const session = drag.current;
      if (!session) return;
      const dx = (event.clientX - session.startX) / session.scale;
      const dy = (event.clientY - session.startY) / session.scale;
      onChange(
        resizeRect(
          session.startRect,
          session.handle,
          dx,
          dy,
          image.width,
          image.height,
          activeRatio,
        ),
      );
    },
    [activeRatio, image.height, image.width, onChange],
  );

  const endDrag = React.useCallback((event: React.PointerEvent) => {
    if (!drag.current) return;
    (event.target as Element).releasePointerCapture?.(event.pointerId);
    drag.current = null;
  }, []);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const step = event.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;
      if (event.key === "ArrowLeft") dx = -step;
      else if (event.key === "ArrowRight") dx = step;
      else if (event.key === "ArrowUp") dy = -step;
      else if (event.key === "ArrowDown") dy = step;
      else return;
      event.preventDefault();
      // Alt = resize from the bottom-right corner; otherwise move the box.
      const handle: Handle = event.altKey ? "se" : "move";
      onChange(
        resizeRect(rect, handle, dx, dy, image.width, image.height, activeRatio),
      );
    },
    [activeRatio, image.height, image.width, onChange, rect],
  );

  const scale = scaleOf();
  const box = {
    left: `${(rect.x / image.width) * 100}%`,
    top: `${(rect.y / image.height) * 100}%`,
    width: `${(rect.width / image.width) * 100}%`,
    height: `${(rect.height / image.height) * 100}%`,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Aspect presets */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
          <Icon name="RectangleHorizontal" size={15} className={accentText} />
          Aspect ratio
        </legend>
        <div
          role="radiogroup"
          aria-label="Aspect ratio"
          className="grid grid-cols-4 gap-2"
        >
          {RATIOS.map((r) => {
            const active = r.id === ratioId;
            return (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onRatioChange(r.id)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-center text-sm font-semibold transition-colors outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  accentRing,
                  active
                    ? cn("bg-muted/60", accentText, "border-current")
                    : "border-border text-foreground hover:bg-muted/40",
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Interactive stage */}
      <div
        ref={stageRef}
        className="relative w-full touch-none overflow-hidden rounded-xl border border-border bg-muted/40 select-none"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt="Crop preview"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
        {/* Dimmed overlay outside the selection (four bands). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black/50"
          style={{
            clipPath: `polygon(0% 0%, 0% 100%, ${box.left} 100%, ${box.left} ${box.top}, calc(${box.left} + ${box.width}) ${box.top}, calc(${box.left} + ${box.width}) calc(${box.top} + ${box.height}), ${box.left} calc(${box.top} + ${box.height}), ${box.left} 100%, 100% 100%, 100% 0%)`,
          }}
        />

        {/* Selection box */}
        <div
          role="group"
          aria-label={`Crop selection, ${rect.width} by ${rect.height} pixels. Use arrow keys to move, hold Alt to resize.`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown("move")}
          className={cn(
            "absolute cursor-move outline-none ring-2 ring-white/90 ring-offset-0",
            "focus-visible:ring-4",
            accentRing,
          )}
          style={box}
        >
          {/* Rule-of-thirds guides */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute inset-y-0 left-1/3 w-px bg-white/40" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-white/40" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-white/40" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-white/40" />
          </div>

          {/* Resize handles */}
          {CORNER_HANDLES.map((h) => (
            <button
              key={h}
              type="button"
              aria-label={`Resize from ${HANDLE_LABEL[h]}`}
              onPointerDown={onPointerDown(h)}
              className={cn(
                "absolute size-3 rounded-full border-2 border-background bg-white shadow outline-none",
                "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                accentRing,
                HANDLE_POS[h],
              )}
            />
          ))}
        </div>
      </div>

      {/* Live readout */}
      <dl className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Icon name="ScanEye" size={14} className={accentText} />
          <dt className="sr-only">Crop size</dt>
          <dd className="font-semibold tabular-nums text-foreground">
            {rect.width} × {rect.height} px
          </dd>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <dt className="sr-only">Position</dt>
          <dd className="tabular-nums">
            at {rect.x}, {rect.y}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        Drag the box to move it, pull the handles to resize, or use the arrow
        keys (hold Shift for 10px, Alt to resize). Preview scale{" "}
        {scale > 0 ? `${Math.round(scale * 100)}%` : "—"}.
      </p>
    </div>
  );
}

/**
 * Crop Image, interactive cropper. A draggable/resizable selection box with
 * aspect presets feeds `cropImage`; the result panel reports the exported
 * dimensions, file size and how much of the original area was kept.
 */
export default function CropImageTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [ratioId, setRatioId] = React.useState("free");
  const [rect, setRect] = React.useState<Rect | null>(null);
  const rectRef = React.useRef<Rect | null>(null);

  const setCrop = React.useCallback((next: Rect) => {
    rectRef.current = next;
    setRect(next);
  }, []);

  const state = useImageTool({
    slug: tool.slug,
    accept: "image/*",
    process: (img: LoadedImage): Promise<ProcessResult> => {
      const r =
        rectRef.current ??
        defaultRect(
          img.width,
          img.height,
          RATIOS.find((x) => x.id === ratioId)?.ratio ?? null,
        );
      return cropImage(img, r, { format: img.file.type || "image/png" });
    },
    outputName: (img) =>
      `${baseName(img.file.name)}-cropped-gigai.${extFor(img.file.type)}`,
  });

  // When a new image loads (or the ratio changes with no box yet), seed a
  // sensible centred crop for that image + ratio.
  const image = state.image;
  const imageKey = image?.url ?? null;
  const seededFor = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!image) {
      seededFor.current = null;
      rectRef.current = null;
      setRect(null);
      return;
    }
    if (seededFor.current === imageKey) return;
    seededFor.current = imageKey;
    const ratio = RATIOS.find((x) => x.id === ratioId)?.ratio ?? null;
    setCrop(defaultRect(image.width, image.height, ratio));
  }, [image, imageKey, ratioId, setCrop]);

  // Changing the ratio re-fits the crop box to the new shape.
  const onRatioChange = React.useCallback(
    (id: string) => {
      setRatioId(id);
      if (!image) return;
      const ratio = RATIOS.find((x) => x.id === id)?.ratio ?? null;
      if (ratio == null) return; // Free keeps the current box.
      setCrop(defaultRect(image.width, image.height, ratio));
    },
    [image, setCrop],
  );

  return (
    <ToolWorkspace
      state={state}
      accent={tool.accent}
      processLabel="Crop image"
      formatsHint="JPG, PNG, WebP, GIF or BMP, cropped in your source format"
      controls={
        image && rect ? (
          <>
            <div className="flex items-center justify-between">
              <Label>
                <Icon name="Crop" size={15} className={style.text} />
                Selection
              </Label>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                  style.soft,
                )}
              >
                {rect.width}×{rect.height}
              </span>
            </div>
            <CropEditor
              image={image}
              rect={rect}
              ratioId={ratioId}
              onRatioChange={onRatioChange}
              onChange={setCrop}
              accentText={style.text}
              accentRing={style.ring}
            />
          </>
        ) : null
      }
      resultMeta={(result, img) => {
        const srcArea = img.width * img.height;
        const outArea = result.width * result.height;
        const kept = srcArea > 0 ? Math.round((outArea / srcArea) * 100) : 0;

        return (
          <dl className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Cropped size</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {result.width} × {result.height}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">File size</dt>
              <dd className="text-sm font-semibold tabular-nums text-foreground">
                {formatBytes(result.size)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">Area kept</dt>
              <dd
                className={cn(
                  "inline-flex items-center justify-center gap-1 text-sm font-semibold tabular-nums",
                  style.text,
                )}
              >
                <Icon name="Crop" size={14} />
                {kept}%
              </dd>
            </div>
          </dl>
        );
      }}
    />
  );
}
