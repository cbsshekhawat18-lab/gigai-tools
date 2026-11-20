"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { extractAudio, type AudioFormat } from "@/lib/video-tools/operations";
import { VideoWorkspace } from "@/components/tool/video";

/** The audio formats this tool can rip to, with human-facing guidance. */
interface FormatChoice {
  value: AudioFormat;
  label: string;
  hint: string;
  /** True for lossy codecs: surfaces a small "lossy" chip. */
  lossy: boolean;
}

const FORMATS: FormatChoice[] = [
  { value: "mp3", label: "MP3", hint: "Plays everywhere · small", lossy: true },
  { value: "wav", label: "WAV", hint: "Lossless · edit-ready", lossy: false },
  { value: "aac", label: "AAC", hint: "Great quality-per-byte", lossy: true },
  { value: "m4a", label: "M4A", hint: "Apple-friendly", lossy: true },
  { value: "ogg", label: "OGG", hint: "Small · open format", lossy: true },
];

/** Replace a file's extension with the chosen audio extension. */
function audioName(inputName: string, format: AudioFormat): string {
  const base = inputName.replace(/\.[^.]+$/, "") || "audio";
  return `${base}-gigai.${format}`;
}

/**
 * Extract Audio from Video: flagship of the Video Toolkit's Audio group.
 *
 * Drop a video, pick one of five output formats, and rip its audio track to a
 * standalone file using FFmpeg (WebAssembly) entirely in the browser. The
 * heavy engine is lazy-loaded only when the user presses Extract; the shared
 * {@link VideoWorkspace} owns file probing, the first-run engine-loading note,
 * the live progress bar, the inline audio preview and download, plus error and
 * reset handling, so this component is just a format picker plus a run
 * function that calls `extractAudio`. 100% client-side; nothing is uploaded.
 */
export default function ExtractAudioTool({ tool }: { tool: WorkspaceToolData }) {
  const [format, setFormat] = React.useState<AudioFormat>("mp3");
  const style = accentStyle(tool.accent);

  return (
    <VideoWorkspace
      accept="video/*"
      runLabel="Extract audio"
      runIcon="Music"
      progressLabel="Extracting audio"
      resultTitle="Your audio track"
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // The FFmpeg core loads on first run; flag it so the workspace shows
        // the one-time engine-loading note, then clear it once work begins.
        onEngineLoading(true);
        let started = false;
        const result = await extractAudio(
          file,
          { format },
          (fraction) => {
            if (!started) {
              started = true;
              onEngineLoading(false);
            }
            onProgress(fraction);
          },
        );

        if (signal.aborted) {
          // Return a benign value; the workspace ignores aborted runs.
          return { blob: new Blob(), kind: "audio" as const };
        }

        if (!result.ok) {
          throw new Error(
            /no audio|does not contain|stream/i.test(result.error)
              ? "This video has no audio track to extract. Check that the source actually plays sound."
              : result.error ||
                "Extraction failed. The file may be too large for in-browser processing. Try trimming it first.",
          );
        }

        return {
          blob: result.blob,
          filename: audioName(file.name, format),
          kind: "audio" as const,
        };
      }}
    >
      {({ busy }) => (
        <fieldset className="flex flex-col gap-3" disabled={busy}>
          <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
            <Icon name="FileAudio2" size={15} className={style.text} />
            Output format
          </legend>

          <div
            role="radiogroup"
            aria-label="Audio output format"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {FORMATS.map((f) => {
              const active = format === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`${f.label}, ${f.hint}`}
                  onClick={() => setFormat(f.value)}
                  disabled={busy}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    style.ring,
                    active
                      ? cn("border-transparent", style.soft, style.text)
                      : "border-border bg-card text-foreground hover:bg-muted/60",
                    busy && "cursor-not-allowed opacity-60",
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{f.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                        f.lossy
                          ? "bg-muted text-muted-foreground"
                          : cn(style.soft, style.text),
                      )}
                    >
                      {f.lossy ? "lossy" : "lossless"}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">{f.hint}</span>
                </button>
              );
            })}
          </div>

          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Icon name="Info" size={13} className="mt-0.5 shrink-0" />
            <span>
              Runs FFmpeg in your browser: your video is never uploaded. The
              engine loads once on the first extract; large videos are slower and
              memory-bound, so trim long clips first for the best experience.
            </span>
          </p>
        </fieldset>
      )}
    </VideoWorkspace>
  );
}
