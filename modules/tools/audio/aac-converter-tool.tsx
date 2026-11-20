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
import { convertAudio, detectFormat } from "@/lib/audio-tools/convert";

/**
 * AAC Converter: the "Convert" tool that produces AAC (Advanced Audio Coding),
 * the efficient, widely-compatible successor to MP3. Composes the shared
 * {@link AudioWorkspace} (dropzone → options → run → progress → result +
 * download + reset) and hands the file to the engine's {@link convertAudio}
 * router with target `"aac"`.
 *
 * AAC is an EXOTIC target: the file decodes natively via the Web Audio API, then
 * the shared ffmpeg.wasm core (its 31 MB core loads on demand, once per session)
 * transcodes the lossless intermediate to AAC. Because it's always exotic, we
 * flag {@link onEngineLoading} up front so the workspace can surface the one-time
 * codec-loading state, unlike WAV/MP3 targets, there's no native fast path here.
 *
 * Honest by design: AAC is lossy, re-encoding a compressed source can only lose a
 * little more, and nothing is ever uploaded. TS strict + noUncheckedIndexedAccess
 * clean.
 */

/** Source extension, lowercased, for display. */
function sourceExt(file: File): string {
  const m = /\.([^.]+)$/.exec(file.name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

export default function AacConverterTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  return (
    <AudioWorkspace
      runLabel="Convert to AAC"
      runIcon="FileAudio"
      resultTitle="Your AAC"
      progressLabel="Encoding AAC…"
      softMaxMB={300}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // AAC is always an exotic target: decode natively, then the shared
        // ffmpeg core transcodes. Flag the one-time codec load up front.
        onEngineLoading(true);

        const blob = await convertAudio(file, "aac", {}, (p) => {
          // Any reported progress means the codec is loaded and work started.
          onEngineLoading(false);
          onProgress(p);
        });

        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const base = file.name.replace(/\.[^.]+$/, "") || "audio";
        return { blob, filename: `${base}-gigai.aac` };
      }}
    >
      {({ file, meta }) => {
        const ext = sourceExt(file);
        const fmt = detectFormat(file);
        const alreadyAac = fmt === "aac";

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

            {/* What AAC is + target readout */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                <Icon name="FileAudio" size={15} className={style.text} />
                Output format
              </span>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                  style.soft,
                )}
              >
                AAC · high efficiency
              </span>
            </div>

            {/* Already-AAC note */}
            {alreadyAac && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This file is already AAC. Re-encoding is useful to standardise or
                  re-wrap it, but it can&rsquo;t improve quality, a lossy source
                  re-encoded to AAC can only lose a touch more detail, never recover
                  it.
                </span>
              </p>
            )}

            {/* On-demand codec + honesty note */}
            <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <Icon
                name="Cpu"
                size={14}
                className={cn("mt-0.5 shrink-0", style.text)}
              />
              <span>
                This {(ext || fmt || "file").toUpperCase()} decodes natively with the
                Web Audio API, then a one-time on-demand codec (loaded only when you
                convert) encodes it to AAC, a modern, efficient codec that sounds
                cleaner than MP3 at the same size and plays natively on Apple, Android
                and in video apps. The codec downloads once per session; conversion runs
                on your device. AAC is lossy, so start from a lossless source when you
                can. Nothing is uploaded.
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
