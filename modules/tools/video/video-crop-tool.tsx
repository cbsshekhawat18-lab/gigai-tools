"use client";

/**
 * Video Cropper, in-browser reframing tool.
 *
 * Drop a clip → see it in a live player → drag/resize a crop box over the
 * picture (or snap to an aspect preset) → cut just that rectangle with a
 * self-hosted FFmpeg WebAssembly core → preview + download. Everything runs on
 * the user's device; the ~31 MB wasm core is only fetched on the first crop.
 *
 * The crop box is held in NORMALISED coordinates ([0..1] of the frame) so it's
 * resolution-independent and survives layout resizes. Only at run time is it
 * multiplied by the source's real pixel dimensions and handed to
 * {@link crop}, which itself snaps width/height to the even values the encoder
 * requires. {@link VideoWorkspace} owns file/probe/busy/progress/abort/error/
 * result; this module supplies the options UI (player + crop box) and `onRun`.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  VideoWorkspace,
  VideoPlayer,
  type VideoMeta,
  type VideoWorkspaceRenderArgs,
} from "@/components/tool/video";
import { crop } from "@/lib/video-tools/operations";

/** Clamp a value into [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** A crop rectangle in normalised frame coordinates: each field in [0..1]. */
interface NormRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The full frame: the default crop (no cropping). */
const FULL_RECT: NormRect = { x: 0, y: 0, w: 1, h: 1 };

/** Which part of the box a pointer drag is manipulating. */
type Handle =
  | "move"
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

interface Preset {
  id: string;
  label: string;
  /** Target width:height, or null for free-form. */
  ratio: number | null;
}

const PRESETS: Preset[] = [
  { id: "free", label: "Free-form", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
];

/** Smallest box side (normalised) to keep the crop draggable and valid. */
const MIN_SIZE = 0.05;

/**
 * Build the largest centred normalised box of the given pixel aspect ratio that
 * fits inside a frame of `frameW × frameH` real pixels.
 */
function centeredRect(targetRatio: number, frameW: number, frameH: number): NormRect {
  if (frameW <= 0 || frameH <= 0) return FULL_RECT;
  const frameRatio = frameW / frameH;
  let w = 1;
  let h = 1;
  if (targetRatio > frameRatio) {
    // Target is wider than the frame → full width, shorter height.
    w = 1;
    h = frameRatio / targetRatio;
  } else {
    // Target is taller → full height, narrower width.
    h = 1;
    w = targetRatio / frameRatio;
  }
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

/**
 * The options slot: a scrubbable preview with a draggable/resizable crop box
 * overlaid on it, plus aspect presets. Holds the (per-file) crop rect that the
 * workspace deliberately doesn't own, and publishes it up on every change.
 */
function CropControls({
  file,
  meta,
  busy,
  onRectChange,
}: VideoWorkspaceRenderArgs & {
  onRectChange: (rect: NormRect) => void;
}) {
  const frameW = meta.width > 0 ? meta.width : 0;
  const frameH = meta.height > 0 ? meta.height : 0;
  const hasDims = frameW > 0 && frameH > 0;

  const [src, setSrc] = React.useState<string>("");
  const [rect, setRect] = React.useState<NormRect>(FULL_RECT);
  const [presetId, setPresetId] = React.useState<string>("free");

  const stageRef = React.useRef<HTMLDivElement | null>(null);
  // Live pointer-drag bookkeeping; a ref so the window listeners stay stable.
  const dragRef = React.useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    orig: NormRect;
  } | null>(null);

  // Object URL for the preview player; revoked on file change/unmount.
  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Publish the current crop up to the run handler whenever it changes.
  React.useEffect(() => {
    onRectChange(rect);
  }, [rect, onRectChange]);

  // Apply an aspect preset: centre a maximal box of that ratio (or reset to
  // full frame for free-form).
  const applyPreset = React.useCallback(
    (preset: Preset) => {
      setPresetId(preset.id);
      if (preset.ratio === null) {
        setRect(FULL_RECT);
      } else if (hasDims) {
        setRect(centeredRect(preset.ratio, frameW, frameH));
      }
    },
    [hasDims, frameW, frameH],
  );

  // ---- pointer drag: move / resize the box, honouring a locked ratio -------

  const activePreset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]!;
  const lockedRatio = activePreset.ratio; // px ratio the box must keep, or null

  const onPointerDown = React.useCallback(
    (handle: Handle) => (e: React.PointerEvent) => {
      if (busy || !hasDims) return;
      e.preventDefault();
      e.stopPropagation();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      dragRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        orig: rect,
      };
    },
    [busy, hasDims, rect],
  );

  React.useEffect(() => {
    if (!hasDims) return;

    // Convert a locked *pixel* ratio into the *normalised* ratio for this
    // frame, since normalised space is stretched by the frame's own aspect.
    const frameRatio = frameW / frameH;

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      const stage = stageRef.current;
      if (!drag || !stage) return;
      const bounds = stage.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;

      const dx = (e.clientX - drag.startX) / bounds.width;
      const dy = (e.clientY - drag.startY) / bounds.height;
      const o = drag.orig;

      if (drag.handle === "move") {
        const x = clamp(o.x + dx, 0, 1 - o.w);
        const y = clamp(o.y + dy, 0, 1 - o.h);
        setRect({ x, y, w: o.w, h: o.h });
        return;
      }

      // Resize. Work out new edges from the original ones, per handle.
      let left = o.x;
      let top = o.y;
      let right = o.x + o.w;
      let bottom = o.y + o.h;
      const h = drag.handle;

      if (h.includes("w")) left = clamp(o.x + dx, 0, right - MIN_SIZE);
      if (h.includes("e")) right = clamp(o.x + o.w + dx, left + MIN_SIZE, 1);
      if (h.includes("n")) top = clamp(o.y + dy, 0, bottom - MIN_SIZE);
      if (h.includes("s")) bottom = clamp(o.y + o.h + dy, top + MIN_SIZE, 1);

      let nx = left;
      let ny = top;
      let nw = right - left;
      let nh = bottom - top;

      if (lockedRatio !== null) {
        // Keep the pixel ratio: normalised target = lockedRatio / frameRatio.
        const targetNorm = lockedRatio / frameRatio;
        // Drive height from width, then re-anchor to the dragged corner/edge.
        nh = nw / targetNorm;
        // Anchor vertically toward the fixed edge.
        if (h.includes("n")) {
          ny = bottom - nh;
        } else if (h.includes("s")) {
          ny = top;
        } else {
          // Pure-horizontal handle: keep the box vertically centred on its origin.
          ny = clamp(o.y + (o.h - nh) / 2, 0, 1 - nh);
        }
        // If the ratio-driven box overflows vertically, drive width from height.
        if (ny < 0 || ny + nh > 1 || nh < MIN_SIZE) {
          nh = clamp(nh, MIN_SIZE, 1);
          nw = nh * targetNorm;
          if (h.includes("w")) nx = right - nw;
          else if (h.includes("e")) nx = left;
          else nx = clamp(o.x + (o.w - nw) / 2, 0, 1 - nw);
          ny = clamp(ny, 0, 1 - nh);
        }
        nx = clamp(nx, 0, 1 - nw);
        ny = clamp(ny, 0, 1 - nh);
      }

      setRect({ x: nx, y: ny, w: nw, h: nh });
    };

    const onUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [hasDims, frameW, frameH, lockedRatio]);

  // Real-pixel crop the run will request (after even-snapping mirrors ops.crop).
  const pxW = hasDims ? Math.max(2, Math.round((rect.w * frameW) / 2) * 2) : 0;
  const pxH = hasDims ? Math.max(2, Math.round((rect.h * frameH) / 2) * 2) : 0;
  const pxX = hasDims ? Math.round(rect.x * frameW) : 0;
  const pxY = hasDims ? Math.round(rect.y * frameH) : 0;
  const isFull =
    Math.abs(rect.x) < 0.001 &&
    Math.abs(rect.y) < 0.001 &&
    Math.abs(rect.w - 1) < 0.001 &&
    Math.abs(rect.h - 1) < 0.001;

  const aspectRatio =
    hasDims ? `${frameW} / ${frameH}` : undefined;

  // Handle definitions for the eight resize grips.
  const edgeHandles: { h: Handle; cls: string; cursor: string }[] = [
    { h: "n", cls: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-ns-resize" },
    { h: "s", cls: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", cursor: "cursor-ns-resize" },
    { h: "e", cls: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
    { h: "w", cls: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-ew-resize" },
    { h: "nw", cls: "top-0 left-0 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-nwse-resize" },
    { h: "ne", cls: "top-0 right-0 translate-x-1/2 -translate-y-1/2", cursor: "cursor-nesw-resize" },
    { h: "sw", cls: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2", cursor: "cursor-nesw-resize" },
    { h: "se", cls: "bottom-0 right-0 translate-x-1/2 translate-y-1/2", cursor: "cursor-nwse-resize" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Preset row */}
      <div
        role="group"
        aria-label="Crop aspect ratio"
        className="flex flex-wrap items-center gap-2"
      >
        <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Icon name="LayoutGrid" size={15} className="text-primary" />
          Aspect
        </span>
        {PRESETS.map((preset) => {
          const active = preset.id === presetId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              disabled={busy || (!hasDims && preset.ratio !== null)}
              aria-pressed={active}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Preview stage with the crop overlay layered on top of the player. */}
      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-black/80">
        {src ? (
          <VideoPlayer
            src={src}
            aspectRatio={aspectRatio}
            className="w-full"
          />
        ) : null}

        {/* Overlay: sits over the video. pointer-events only on the box/handles
            so the player's own controls stay usable outside the crop region. */}
        {hasDims ? (
          <div
            ref={stageRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            {/* Four dim panels masking everything outside the crop box. */}
            <div
              className="absolute inset-x-0 top-0 bg-black/55"
              style={{ height: `${rect.y * 100}%` }}
            />
            <div
              className="absolute inset-x-0 bottom-0 bg-black/55"
              style={{ height: `${(1 - rect.y - rect.h) * 100}%` }}
            />
            <div
              className="absolute bg-black/55"
              style={{
                top: `${rect.y * 100}%`,
                height: `${rect.h * 100}%`,
                left: 0,
                width: `${rect.x * 100}%`,
              }}
            />
            <div
              className="absolute bg-black/55"
              style={{
                top: `${rect.y * 100}%`,
                height: `${rect.h * 100}%`,
                right: 0,
                width: `${(1 - rect.x - rect.w) * 100}%`,
              }}
            />

            {/* The crop box itself. */}
            <div
              onPointerDown={onPointerDown("move")}
              className={cn(
                "pointer-events-auto absolute box-border border-2 border-primary",
                "shadow-[0_0_0_1px_rgba(0,0,0,0.5)]",
                busy ? "cursor-not-allowed" : "cursor-move",
              )}
              style={{
                left: `${rect.x * 100}%`,
                top: `${rect.y * 100}%`,
                width: `${rect.w * 100}%`,
                height: `${rect.h * 100}%`,
              }}
            >
              {/* Rule-of-thirds guides. */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/3 top-0 h-full w-px bg-white/25" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-white/25" />
                <div className="absolute top-1/3 left-0 h-px w-full bg-white/25" />
                <div className="absolute top-2/3 left-0 h-px w-full bg-white/25" />
              </div>

              {/* Resize grips. */}
              {!busy &&
                edgeHandles.map((grip) => (
                  <span
                    key={grip.h}
                    onPointerDown={onPointerDown(grip.h)}
                    className={cn(
                      "pointer-events-auto absolute h-3 w-3 rounded-full border border-primary bg-background",
                      grip.cls,
                      grip.cursor,
                    )}
                  />
                ))}
            </div>
          </div>
        ) : null}
      </div>

      {!hasDims ? (
        <p className="text-xs text-muted-foreground">
          Reading the video&rsquo;s dimensions&hellip; the crop box appears once
          the frame size is known.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Drag the box to move it, or pull a handle to resize. Pick an aspect
          above to lock the ratio, or Free-form for any rectangle.
        </p>
      )}

      {/* Crop summary - mirrors the real-pixel region that will be cut. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs tabular-nums">
        {hasDims ? (
          <>
            <span className="text-muted-foreground">
              Crop{" "}
              <span className="font-semibold text-primary">
                {pxW} × {pxH}
              </span>{" "}
              px
            </span>
            <span className="text-muted-foreground">
              Offset{" "}
              <span className="font-medium text-foreground">
                {pxX}, {pxY}
              </span>
            </span>
            <span className="text-muted-foreground">
              Source{" "}
              <span className="font-medium text-foreground">
                {frameW} × {frameH}
              </span>
            </span>
            {isFull ? (
              <span className="text-amber-600 dark:text-amber-500">
                Whole frame selected, drag in to crop.
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-muted-foreground">Preparing crop&hellip;</span>
        )}
      </div>
    </div>
  );
}

/**
 * Video Cropper tool. Composes the {@link VideoWorkspace} scaffold with a crop
 * overlay and the `crop` operation. TS-strict clean; dark-mode, responsive and
 * a11y-minded; honest about in-browser FFmpeg's speed/size limits.
 */
export default function VideoCropTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;
  // The live normalised crop, updated by the options slot and read at run time.
  const rectRef = React.useRef<NormRect>(FULL_RECT);
  const setRect = React.useCallback((rect: NormRect) => {
    rectRef.current = rect;
  }, []);

  const handleRun = React.useCallback(
    async (
      file: File,
      meta: VideoMeta,
      hooks: {
        onProgress: (p: number) => void;
        onEngineLoading: (loading: boolean) => void;
        signal: AbortSignal;
      },
    ): Promise<{ blob: Blob; filename?: string; kind?: "video" }> => {
      const frameW = meta.width > 0 ? meta.width : 0;
      const frameH = meta.height > 0 ? meta.height : 0;

      if (!(frameW > 0 && frameH > 0)) {
        throw new Error(
          "Couldn't read this video's dimensions, so there's nothing to crop against. Try a mainstream format like MP4 or WebM.",
        );
      }

      const r = rectRef.current;
      // Convert normalised → source pixels. ops.crop snaps w/h to even values
      // and clamps offsets internally, but we bound them here for safety.
      const w = Math.round(r.w * frameW);
      const h = Math.round(r.h * frameH);
      const x = Math.round(r.x * frameW);
      const y = Math.round(r.y * frameH);

      const safeW = clamp(w, 2, frameW);
      const safeH = clamp(h, 2, frameH);
      const safeX = clamp(x, 0, frameW - safeW);
      const safeY = clamp(y, 0, frameH - safeH);

      if (safeW >= frameW && safeH >= frameH) {
        throw new Error(
          "The crop box covers the whole frame: drag an edge in (or pick an aspect preset) to crop something out.",
        );
      }

      // First crop of a session pays the one-time engine download.
      hooks.onEngineLoading(true);
      const result = await crop(
        file,
        { x: safeX, y: safeY, w: safeW, h: safeH },
        (fraction) => {
          // The engine has loaded and started emitting real progress.
          hooks.onEngineLoading(false);
          hooks.onProgress(clamp(fraction, 0, 1));
        },
      );

      if (hooks.signal.aborted) {
        // Workspace ignores the return when aborted; keep the shape valid.
        return { blob: new Blob(), kind: "video" };
      }

      if (!result.ok) {
        throw new Error(result.error);
      }

      return { blob: result.blob, filename: result.outName, kind: "video" };
    },
    [],
  );

  return (
    <div className={cn("flex flex-col gap-4")}>
      <VideoWorkspace
        onRun={handleRun}
        runLabel="Crop video"
        runIcon="Crop"
        resultTitle="Cropped video"
        accept="video/*"
        softMaxMB={500}
        progressLabel="Cropping"
      >
        {(args) => (
          <CropControls
            key={args.file.name + args.file.size}
            {...args}
            onRectChange={setRect}
          />
        )}
      </VideoWorkspace>
    </div>
  );
}
