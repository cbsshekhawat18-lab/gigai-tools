"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import {
  AudioWorkspace,
  formatBytes,
  formatDuration,
  describeAudio,
  type AudioMeta,
} from "@/components/tool/audio";
import { convertAudio, detectFormat, MP3_BITRATES } from "@/lib/audio-tools/convert";

/**
 * MP3 Converter, the flagship "Convert" tool of the audio toolkit. Composes the
 * shared {@link AudioWorkspace} (dropzone → options → run → progress → result +
 * download + reset) with a bitrate picker and hands the file to the engine's
 * {@link convertAudio} router:
 *
 *   • WAV / MP3 sources   → native decode + lamejs encode. NO ffmpeg download,
 *                           so the everyday case is fast and lightweight.
 *   • OGG/FLAC/M4A/AAC…   → decode natively, then the shared ffmpeg.wasm core
 *                           transcodes on demand (its 31 MB core loads only for
 *                           these inputs, and only once per session).
 *
 * This component is just the options form + `onRun`. Honest by design: MP3 is
 * lossy, re-encoding a compressed source can only lose a little more, and nothing
 * is ever uploaded. TS strict + noUncheckedIndexedAccess clean.
 */

/** Bitrate presets come from the engine (96…320). 192 is the safe default. */
const DEFAULT_BITRATE = 192;

/** One honest quality line per bitrate for the picker. */
const BITRATE_HINTS: Record<number, string> = {
  96: "Smallest, fine for speech",
  128: "Small, great for podcasts",
  160: "Lean, still clean",
  192: "Balanced default",
  256: "High quality",
  320: "Near-transparent",
};

function bitrateLabel(kbps: number): string {
  if (kbps >= 320) return "Maximum";
  if (kbps >= 256) return "High";
  if (kbps >= 192) return "Balanced";
  if (kbps >= 128) return "Small";
  return "Smallest";
}

/** Source extension, lowercased, for display + the native/exotic note. */
function sourceExt(file: File): string {
  const m = /\.([^.]+)$/.exec(file.name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

export default function Mp3ConverterTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [bitrate, setBitrate] = React.useState<number>(DEFAULT_BITRATE);

  return (
    <AudioWorkspace
      runLabel="Convert to MP3"
      runIcon="FileAudio"
      resultTitle="Your MP3"
      progressLabel="Encoding MP3…"
      softMaxMB={300}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // WAV/MP3 stay native (no engine). Exotic inputs load the shared ffmpeg
        // core once; flag it so the UI can show the one-time download note.
        const fmt = detectFormat(file);
        const isExotic = fmt !== "wav" && fmt !== "mp3";
        if (isExotic) onEngineLoading(true);

        const blob = await convertAudio(
          file,
          "mp3",
          { bitrate },
          (p) => {
            // Any reported progress means work has started → engine is loaded.
            if (isExotic) onEngineLoading(false);
            onProgress(p);
          },
        );

        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const base = file.name.replace(/\.[^.]+$/, "") || "audio";
        return { blob, filename: `${base}-gigai.mp3` };
      }}
    >
      {({ file, meta, busy }) => {
        const ext = sourceExt(file);
        const fmt = detectFormat(file);
        const isExotic = fmt !== null && fmt !== "wav" && fmt !== "mp3";
        const alreadyMp3 = fmt === "mp3";

        return (
          <div className="flex flex-col gap-5">
            {/* Source summary */}
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center sm:grid-cols-4">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Source</dt>
                <dd className="text-sm font-semibold uppercase text-foreground">
                  {ext || fmt || "audio"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Size</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {formatBytes(file.size)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Duration</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {formatDuration(meta.duration)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Channels</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {meta.channels > 1 ? "Stereo" : "Mono"}
                </dd>
              </div>
            </dl>

            <p className="sr-only">{describeAudio(meta)}</p>

            {/* Bitrate picker */}
            <fieldset className="flex flex-col gap-3" disabled={busy}>
              <legend className="flex items-center justify-between gap-3 pb-1">
                <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                  <Icon name="SlidersHorizontal" size={15} className={style.text} />
                  MP3 bitrate
                </span>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                    style.soft,
                  )}
                >
                  {bitrateLabel(bitrate)} · {bitrate} kbps
                </span>
              </legend>
              <div
                role="radiogroup"
                aria-label="MP3 bitrate"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {MP3_BITRATES.map((kbps) => {
                  const active = kbps === bitrate;
                  return (
                    <button
                      key={kbps}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={busy}
                      onClick={() => setBitrate(kbps)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        style.ring,
                        active
                          ? cn(style.border, style.soft)
                          : "border-border bg-background hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          active ? style.text : "text-foreground",
                        )}
                      >
                        {kbps} kbps
                      </span>
                      <span className="text-[11px] leading-tight text-muted-foreground">
                        {BITRATE_HINTS[kbps] ?? "Constant bitrate"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Already-MP3 note */}
            {alreadyMp3 && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This file is already an MP3. Re-encoding is useful to change the
                  bitrate or standardise the file, but it can&rsquo;t improve quality  -
                  a lower bitrate makes it smaller, a higher one only grows the size.
                </span>
              </p>
            )}

            {/* Native vs. on-demand engine honesty */}
            <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <Icon
                name={isExotic ? "Cpu" : "Zap"}
                size={14}
                className={cn("mt-0.5 shrink-0", style.text)}
              />
              <span>
                {isExotic ? (
                  <>
                    This {(ext || fmt || "file").toUpperCase()} decodes natively, then a
                    one-time on-demand codec (loaded only for exotic inputs) bridges the
                    encode to MP3. It downloads once per session; conversion itself runs
                    on your device. Nothing is uploaded.
                  </>
                ) : (
                  <>
                    Native path: this decodes with the Web Audio API and encodes to MP3
                    in-browser with lamejs. No heavyweight engine download. Encoding is
                    lossy, so higher bitrates preserve more detail. Nothing is uploaded.
                  </>
                )}
              </span>
            </p>
          </div>
        );
      }}
    </AudioWorkspace>
  );
}

// Kept explicit so a future change to the workspace render-arg signature fails
// loudly here rather than silently drifting.
export type { AudioMeta };
