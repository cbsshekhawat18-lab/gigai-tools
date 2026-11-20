"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import {
  formatBytes,
  type VideoMeta,
} from "@/components/tool/video/media-utils";
import { rotate } from "@/lib/video-tools/operations";

/**
 * Video Rotate, turn a sideways or upside-down clip a true quarter-turn and
 * export it with the rotation baked into the pixels. The three choices map
 * 1:1 onto `operations.rotate`'s supported angles (90° clockwise, 180°, 270°
 * = 90° counter-clockwise); we don't expose flip/mirror because the engine op
 * doesn't do it, and faking it would mislabel a rotation.
 *
 * {@link VideoWorkspace} owns the dropzone, first-run engine-loading note,
 * determinate progress, result preview, download and reset. This component is
 * just the options form (a segmented turn picker + a live rotated preview of
 * the source) and the `onRun` that calls the engine. Nothing is uploaded.
 */

/** Supported clockwise angles, matched to `operations.rotate` (0 = no-op, hidden). */
type Angle = 90 | 180 | 270;

interface AngleChoice {
  angle: Angle;
  label: string;
  hint: string;
  icon: string;
}

const CHOICES: readonly AngleChoice[] = [
  { angle: 90, label: "90° right", hint: "Clockwise", icon: "RotateCw" },
  { angle: 180, label: "180°", hint: "Upside down", icon: "FlipVertical2" },
  {
    angle: 270,
    label: "90° left",
    hint: "Counter-clockwise",
    icon: "RotateCcw",
  },
] as const;

/** A 90° or 270° turn swaps the frame's width and height. */
function swapsDimensions(angle: Angle): boolean {
  return angle === 90 || angle === 270;
}

/**
 * Options form rendered inside the workspace once a file is loaded. A real
 * component (not logic inlined in the render prop) so the object-URL
 * memo/effect are legal hooks with sound mount/unmount cleanup.
 */
function RotateOptions({
  file,
  meta,
  busy,
  angle,
  onAngleChange,
  style,
}: {
  file: File;
  meta: VideoMeta;
  busy: boolean;
  angle: Angle;
  onAngleChange: (angle: Angle) => void;
  style: ReturnType<typeof accentStyle>;
}) {
  const src = React.useMemo(() => URL.createObjectURL(file), [file]);
  React.useEffect(() => () => URL.revokeObjectURL(src), [src]);

  const active = CHOICES.find((c) => c.angle === angle) ?? CHOICES[0]!;
  const swaps = swapsDimensions(angle);

  // Source frame dimensions (fall back to a 16:9 box if probe was empty).
  const srcW = meta.width > 0 ? meta.width : 16;
  const srcH = meta.height > 0 ? meta.height : 9;
  const outW = swaps ? srcH : srcW;
  const outH = swaps ? srcW : srcH;

  return (
    <div className="flex flex-col gap-5">
      {/* Turn picker */}
      <fieldset className="flex flex-col gap-3">
        <legend className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
          <Icon name="RotateCw" size={15} className={style.text} />
          Rotation
        </legend>
        <div
          role="radiogroup"
          aria-label="Rotation amount"
          className="grid grid-cols-3 gap-2"
        >
          {CHOICES.map((choice) => {
            const selected = choice.angle === angle;
            return (
              <button
                key={choice.angle}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={busy}
                onClick={() => onAngleChange(choice.angle)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  style.ring,
                  selected
                    ? cn(style.border, style.soft)
                    : "border-border hover:bg-muted/50",
                )}
              >
                <Icon
                  name={choice.icon}
                  size={20}
                  className={selected ? style.text : "text-muted-foreground"}
                />
                <span
                  className={cn(
                    "text-sm font-semibold leading-none",
                    selected ? "text-foreground" : "text-foreground/90",
                  )}
                >
                  {choice.label}
                </span>
                <span className="text-xs leading-none text-muted-foreground">
                  {choice.hint}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Live rotated preview of the source frame */}
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
          <Icon name="Eye" size={15} className={style.text} />
          Preview
          <span className="font-normal text-muted-foreground">
            ({active.label})
          </span>
        </span>
        <div className="flex items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30 p-4">
          {/* The wrapper reserves the OUTPUT aspect; the video inside is
                    rotated by CSS to show the corrected orientation live. */}
          <div
            className="relative w-full max-w-sm"
            style={{ aspectRatio: `${outW} / ${outH}` }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                src={src}
                muted
                playsInline
                preload="metadata"
                aria-label={`Preview rotated ${active.label}`}
                className="max-h-full max-w-full rounded-md shadow-sm transition-transform duration-300 ease-out"
                style={{
                  // Rotate the un-rotated source frame into place. On the
                  // quarter turns the frame's own aspect stays 16:9-ish,
                  // so we size it to the SOURCE ratio then spin it.
                  aspectRatio: `${srcW} / ${srcH}`,
                  width: swaps ? "auto" : "100%",
                  height: swaps ? "100%" : "auto",
                  transform: `rotate(${angle}deg)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dimension row */}
      <dl className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Source</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">
            {meta.width > 0 ? `${srcW}×${srcH}` : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">After rotate</dt>
          <dd className={cn("text-sm font-semibold tabular-nums", style.text)}>
            {meta.width > 0 ? `${outW}×${outH}` : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Size</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">
            {formatBytes(file.size)}
          </dd>
        </div>
      </dl>

      {swaps && (
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
          <span>
            A quarter-turn swaps width and height, so the frame changes shape
            (landscape ↔ portrait), that&apos;s expected.
          </span>
        </p>
      )}

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0" />
        <span>
          The export re-encodes the frames rotated and strips the orientation
          flag, so the fix reads upright in every player. Rotation runs in your
          browser via FFmpeg (WebAssembly): short clips are quick, large ones
          take real time and are memory-bound. Nothing is uploaded.
        </span>
      </p>
    </div>
  );
}

export default function VideoRotateTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [angle, setAngle] = React.useState<Angle>(90);

  return (
    <VideoWorkspace
      runLabel="Rotate video"
      runIcon="RotateCw"
      resultTitle="Rotated video"
      progressLabel="Rotating"
      accept="video/*"
      softMaxMB={500}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // First real run loads the ~31MB WASM core once; flag it for the UI.
        onEngineLoading(true);
        const result = await rotate(file, angle, (p) => {
          // ffmpeg reports progress once it's running → engine has loaded.
          onEngineLoading(false);
          onProgress(p);
        });
        onEngineLoading(false);
        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
        if (!result.ok) throw new Error(result.error);
        return { blob: result.blob, filename: result.outName, kind: "video" };
      }}
    >
      {({ file, meta, busy }) => (
        <RotateOptions
          file={file}
          meta={meta}
          busy={busy}
          angle={angle}
          onAngleChange={setAngle}
          style={style}
        />
      )}
    </VideoWorkspace>
  );
}

// Referenced for typing parity with the workspace render args; kept explicit so
// a future refactor of the options signature fails loudly here.
export type { VideoMeta };
