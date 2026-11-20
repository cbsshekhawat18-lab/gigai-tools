"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import {
  AudioWorkspace,
  AudioPlayer,
  formatBytes,
  formatDuration,
  describeAudio,
  type AudioMeta,
} from "@/components/tool/audio";
import { convertAudio, detectFormat } from "@/lib/audio-tools/convert";

/**
 * Audio to MP3, a beginner-first take on the shared "Convert" job. It composes
 * the {@link AudioWorkspace} (dropzone → options → run → progress → result +
 * download + reset) with two things the flagship mp3-converter deliberately does
 * differently:
 *
 *   • a built-in {@link AudioPlayer} so the user can HEAR the source before
 *  committing: the "did I pick the right take?" check; and
 *   • plain-language QUALITY choices (Email-small … Best MP3) instead of a raw
 *     bitrate grid, with the real kbps kept visible for the curious.
 *
 * The engine underneath is the same native-first router: WAV/MP3 encode with
 * lamejs and no ffmpeg download; M4A/AAC/OGG/FLAC/WEBM decode natively and finish
 * via the on-demand codec (loaded once per session). Honest by design. MP3 is
 * lossy and nothing is uploaded. TS strict + noUncheckedIndexedAccess clean.
 */

/** Plain-language quality steps → real CBR bitrate. Ordered small→large. */
interface QualityChoice {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly bitrate: number;
  readonly icon: string;
}

/** The balanced middle option, also the guaranteed non-undefined fallback. */
const BALANCED: QualityChoice = {
  id: "balanced",
  label: "Balanced (recommended)",
  hint: "A safe default for almost anything",
  bitrate: 192,
  icon: "Scale",
};

const QUALITY_CHOICES: readonly QualityChoice[] = [
  {
    id: "email",
    label: "Small enough to email",
    hint: "Great for voice memos & speech",
    bitrate: 128,
    icon: "Mail",
  },
  BALANCED,
  {
    id: "best",
    label: "Best MP3 quality",
    hint: "As close to the original as MP3 gets",
    bitrate: 320,
    icon: "Sparkles",
  },
] as const;

const DEFAULT_QUALITY_ID = BALANCED.id;

/** Source extension, lowercased, for display + the native/exotic note. */
function sourceExt(file: File): string {
  const m = /\.([^.]+)$/.exec(file.name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

export default function AudioToMp3Tool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [qualityId, setQualityId] = React.useState<string>(DEFAULT_QUALITY_ID);

  // Resolve the active quality → bitrate. Falls back to the balanced default so
  // onRun can never read an undefined bitrate under noUncheckedIndexedAccess.
  const active = QUALITY_CHOICES.find((q) => q.id === qualityId) ?? BALANCED;
  // Keep the resolved bitrate in a ref so onRun always reads the latest choice
  // without being recreated (workspace calls the stable onRun once per run).
  const bitrateRef = React.useRef<number>(active.bitrate);
  bitrateRef.current = active.bitrate;

  return (
    <AudioWorkspace
      runLabel="Make an MP3"
      runIcon="FileAudio"
      resultTitle="Your MP3"
      progressLabel="Making your MP3…"
      softMaxMB={300}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // WAV/MP3 stay native (no codec download). Anything else decodes natively
        // then finishes via the on-demand codec: flag it for the one-time note.
        const fmt = detectFormat(file);
        const isExotic = fmt !== "wav" && fmt !== "mp3";
        if (isExotic) onEngineLoading(true);

        const blob = await convertAudio(
          file,
          "mp3",
          { bitrate: bitrateRef.current },
          (p) => {
            // First reported progress means work started → codec is loaded.
            if (isExotic) onEngineLoading(false);
            onProgress(p);
          },
        );

        onEngineLoading(false);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const base = file.name.replace(/\.[^.]+$/, "") || "audio";
        return { blob, filename: `${base}.mp3` };
      }}
    >
      {({ file, meta, busy }) => {
        const ext = sourceExt(file);
        const fmt = detectFormat(file);
        const isExotic = fmt !== null && fmt !== "wav" && fmt !== "mp3";

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
                <dt className="text-xs text-muted-foreground">Length</dt>
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

            {/* Hear it first - the "is this the right take?" check */}
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                <Icon name="Play" size={15} className={style.text} />
                Listen before you convert
              </span>
              <AudioPlayer blob={file} waveHeight={72} />
            </div>

            {/* Plain-language quality picker */}
            <fieldset className="flex flex-col gap-3" disabled={busy}>
              <legend className="flex items-center justify-between gap-3 pb-1">
                <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                  <Icon name="Sparkles" size={15} className={style.text} />
                  How good should the MP3 be?
                </span>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                    style.soft,
                  )}
                >
                  {active.bitrate} kbps
                </span>
              </legend>
              <div
                role="radiogroup"
                aria-label="MP3 quality"
                className="flex flex-col gap-2"
              >
                {QUALITY_CHOICES.map((q) => {
                  const selected = q.id === active.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={busy}
                      onClick={() => setQualityId(q.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        style.ring,
                        selected
                          ? cn(style.border, style.soft)
                          : "border-border bg-background hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                          selected ? style.soft : "bg-muted/60 text-muted-foreground",
                        )}
                        aria-hidden="true"
                      >
                        <Icon name={q.icon} size={16} className={selected ? style.text : ""} />
                      </span>
                      <span className="flex flex-1 flex-col gap-0.5">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            selected ? style.text : "text-foreground",
                          )}
                        >
                          {q.label}
                        </span>
                        <span className="text-[11px] leading-tight text-muted-foreground">
                          {q.hint}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                        {q.bitrate} kbps
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

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
                    This {(ext || fmt || "file").toUpperCase()} is read in your browser, then
                    a small on-demand codec (loaded only for less common files) finishes the
                    MP3. It downloads once per session and runs on your device; nothing is
                    uploaded.
                  </>
                ) : (
                  <>
                    This converts entirely in your browser. No engine to download. MP3 is a
                    lossy format, so a higher quality keeps more detail. Nothing is uploaded.
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
