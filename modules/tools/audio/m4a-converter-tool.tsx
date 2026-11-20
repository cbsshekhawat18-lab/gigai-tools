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
 * M4A Converter, the Apple-friendly "Convert" tool of the audio toolkit.
 * Composes the shared {@link AudioWorkspace} (dropzone → options → run →
 * progress → result + download + reset) with an output-container picker and
 * hands the file to the engine's {@link convertAudio} router with an "m4a" or
 * "aac" target.
 *
 * Every input decodes natively with the Web Audio API and is rendered to a
 * lossless WAV; the shared on-demand WebAssembly codec then transcodes that WAV
 * to AAC and (for .m4a) muxes it into an MP4 container. That codec's core loads
 * once per session and only when you convert, so this ALWAYS flags the engine-
 * loading state. Honest by design: AAC is lossy, re-encoding a compressed
 * source can only lose a little more, and nothing is ever uploaded. TS strict +
 * noUncheckedIndexedAccess clean.
 */

/** The two things this tool can emit, an Apple.m4a or a raw.aac stream. */
type OutputFormat = "m4a" | "aac";

interface OutputOption {
  readonly value: OutputFormat;
  readonly ext: string;
  readonly label: string;
  readonly hint: string;
  readonly icon: string;
}

const M4A_OUTPUT: OutputOption = {
  value: "m4a",
  ext: "m4a",
  label: "M4A container",
  hint: "Best for iPhone, Mac & iTunes",
  icon: "Apple",
};

const AAC_OUTPUT: OutputOption = {
  value: "aac",
  ext: "aac",
  label: "Raw AAC stream",
  hint: "Bare elementary stream",
  icon: "AudioLines",
};

const OUTPUTS: readonly OutputOption[] = [M4A_OUTPUT, AAC_OUTPUT];

/** Source extension, lowercased, for display. */
function sourceExt(file: File): string {
  const m = /\.([^.]+)$/.exec(file.name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

export default function M4aConverterTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [output, setOutput] = React.useState<OutputFormat>("m4a");

  return (
    <AudioWorkspace
      runLabel="Convert to M4A"
      runIcon="FileAudio"
      resultTitle="Your M4A"
      progressLabel="Transcoding to AAC…"
      softMaxMB={300}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // M4A/AAC always route through the on-demand codec (decode natively →
        // WAV → AAC/MP4). Flag the one-time per-session load up front.
        onEngineLoading(true);

        const blob = await convertAudio(
          file,
          output,
          {},
          (p) => {
            // Any reported progress means the transcode has begun → codec loaded.
            onEngineLoading(false);
            onProgress(p);
          },
        );

        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const base = file.name.replace(/\.[^.]+$/, "") || "audio";
        const chosen = output === "aac" ? AAC_OUTPUT : M4A_OUTPUT;
        return { blob, filename: `${base}-gigai.${chosen.ext}` };
      }}
    >
      {({ file, meta, busy }) => {
        const ext = sourceExt(file);
        const fmt = detectFormat(file);
        const alreadyM4a = fmt === "m4a" || fmt === "aac";

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

            {/* Output-format picker */}
            <fieldset className="flex flex-col gap-3" disabled={busy}>
              <legend className="flex items-center justify-between gap-3 pb-1">
                <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                  <Icon name="Layers" size={15} className={style.text} />
                  Output format
                </span>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold uppercase tabular-nums",
                    style.soft,
                  )}
                >
                  .{output}
                </span>
              </legend>
              <div
                role="radiogroup"
                aria-label="Output format"
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {OUTPUTS.map((opt) => {
                  const active = opt.value === output;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={busy}
                      onClick={() => setOutput(opt.value)}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        style.ring,
                        active
                          ? cn(style.border, style.soft)
                          : "border-border bg-background hover:bg-muted/50",
                      )}
                    >
                      <Icon
                        name={opt.icon}
                        size={18}
                        className={cn(
                          "mt-0.5 shrink-0",
                          active ? style.text : "text-muted-foreground",
                        )}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            active ? style.text : "text-foreground",
                          )}
                        >
                          {opt.label}
                          <span className="ml-1.5 font-normal uppercase text-muted-foreground">
                            .{opt.ext}
                          </span>
                        </span>
                        <span className="text-[11px] leading-tight text-muted-foreground">
                          {opt.hint}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Already-AAC note */}
            {alreadyM4a && (
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
                <span>
                  This file already holds AAC audio. Re-encoding is useful to
                  standardise the container or switch between .m4a and .aac, but
                  it can&rsquo;t improve quality: decoding and re-encoding a
                  compressed source can only lose a little more detail.
                </span>
              </p>
            )}

            {/* On-demand codec honesty */}
            <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              <Icon
                name="Cpu"
                size={14}
                className={cn("mt-0.5 shrink-0", style.text)}
              />
              <span>
                This {(ext || fmt || "file").toUpperCase()} decodes natively with
                the Web Audio API, then an on-demand codec transcodes it to AAC
                {output === "m4a" ? " and muxes it into an .m4a" : " as a raw .aac stream"}.
                The codec loads once per session; the transcode itself runs on
                your device. AAC is lossy, so convert from a lossless source for
                the cleanest result. Nothing is uploaded.
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
