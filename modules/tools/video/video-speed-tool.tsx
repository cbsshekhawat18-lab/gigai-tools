"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";

import { VideoWorkspace } from "@/components/tool/video/video-workspace";
import {
  formatDuration,
  type VideoMeta,
} from "@/components/tool/video/media-utils";
import { getMetadata } from "@/lib/video-tools/probe";
import { run, guessMime } from "@/lib/video-tools/ffmpeg";

/**
 * Video Speed Changer: re-times a clip in the browser via the shared FFmpeg
 * (WebAssembly) core. A single speed control (0.25×–4×, with presets) plus a
 * three-way audio mode drives a custom `filter_complex` pipeline built here on
 * top of the low-level {@link run} so we can honestly support all three audio
 * behaviours AND silent sources: the packaged `operations.changeSpeed` always
 * expects an audio track and always preserves pitch, so it can't cover the
 * "let pitch change" or "no audio track" cases.
 *
 * {@link VideoWorkspace} owns the dropzone, first-run engine-loading note,
 * determinate progress, preview, download and reset. This component is just the
 * options form + `onRun`. Nothing is uploaded; WASM ffmpeg is single-threaded
 * and memory-bound, so the copy stays honest about size and speed.
 */

/** Speed bounds. Slider maps to these via a log scale so 1× sits centre-ish. */
const SPEED_MIN = 0.25;
const SPEED_MAX = 4;
const SPEED_DEFAULT = 1;

/** Slider resolution (integer steps mapped through a log curve). */
const SLIDER_STEPS = 100;

/** How the audio track is handled during the re-time. */
type AudioMode = "pitch" | "shift" | "none";

const AUDIO_MODES: ReadonlyArray<{
  value: AudioMode;
  label: string;
  hint: string;
  icon: string;
}> = [
  {
    value: "pitch",
    label: "Keep audio (natural pitch)",
    hint: "Voices still sound like themselves, best for talks & tutorials.",
    icon: "AudioLines",
  },
  {
    value: "shift",
    label: "Let pitch change with speed",
    hint: "Classic sped-up (chipmunk) or slowed-down effect.",
    icon: "Waves",
  },
  {
    value: "none",
    label: "Remove audio",
    hint: "Silent output, ideal for a music-ready time-lapse.",
    icon: "VolumeX",
  },
];

/** Quick-pick presets shown as buttons above the slider. */
const PRESETS: ReadonlyArray<{ factor: number; label: string }> = [
  { factor: 0.5, label: "0.5×" },
  { factor: 1, label: "1×" },
  { factor: 1.5, label: "1.5×" },
  { factor: 2, label: "2×" },
  { factor: 3, label: "3×" },
];

/** Map slider position (0..SLIDER_STEPS) → speed factor on a log scale. */
function sliderToSpeed(pos: number): number {
  const t = pos / SLIDER_STEPS; // 0..1
  const ln = Math.log(SPEED_MIN) + t * (Math.log(SPEED_MAX) - Math.log(SPEED_MIN));
  return Math.exp(ln);
}

/** Map a speed factor → nearest slider position (inverse of sliderToSpeed). */
function speedToSlider(speed: number): number {
  const clamped = Math.min(SPEED_MAX, Math.max(SPEED_MIN, speed));
  const t =
    (Math.log(clamped) - Math.log(SPEED_MIN)) /
    (Math.log(SPEED_MAX) - Math.log(SPEED_MIN));
  return Math.round(t * SLIDER_STEPS);
}

/** Round a raw speed to a friendly step (0.05 granularity). */
function snapSpeed(raw: number): number {
  return Math.round(raw * 20) / 20;
}

/** Lowercased extension (no dot) of a filename, or a fallback. */
function extOf(name: string, fallback: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
  return ext || fallback;
}

/** Strip extension and sanitise to a safe output base. */
function baseName(name: string): string {
  const noExt = name.replace(/\.[^.]+$/, "");
  const cleaned = noExt.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned || "video";
}

/** Container-appropriate codec args (mirrors the engine's own defaults). */
function codecArgs(ext: string, withAudio: boolean): string[] {
  const video =
    ext === "webm"
      ? ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "32"]
      : ["-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p"];
  if (!withAudio) return video;
  return [...video, ...(ext === "webm" ? ["-c:a", "libopus"] : ["-c:a", "aac"])];
}

/**
 * Decompose a tempo factor into a chain of `atempo` filters, each within the
 * filter's valid [0.5, 2.0] window, that multiply to `factor`. Pitch-preserving.
 */
function atempoChain(factor: number): string {
  const parts: number[] = [];
  let remaining = factor;
  while (remaining > 2.0) {
    parts.push(2.0);
    remaining /= 2.0;
  }
  while (remaining < 0.5) {
    parts.push(0.5);
    remaining /= 0.5;
  }
  parts.push(remaining);
  return parts.map((p) => `atempo=${p.toFixed(6)}`).join(",");
}

/**
 * Build the ffmpeg args for a speed change.
 *
 * - `pitch`  → atempo chain (preserves pitch).
 * - `shift`  → resample the audio timebase so pitch rides with speed.
 * - `none`   → no audio mapped.
 * If `hasAudio` is false, audio is dropped regardless of mode.
 */
function buildArgs(
  inName: string,
  outName: string,
  ext: string,
  factor: number,
  mode: AudioMode,
  hasAudio: boolean,
): string[] {
  const setpts = `setpts=${(1 / factor).toFixed(6)}*PTS`;
  const wantAudio = mode !== "none" && hasAudio;

  if (!wantAudio) {
    return [
      "-i", inName,
      "-filter_complex", `[0:v]${setpts}[v]`,
      "-map", "[v]",
      "-an",
      ...codecArgs(ext, false),
      outName,
    ];
  }

  // `pitch`: stretch tempo, hold pitch. `shift`: retime the sample clock so the
  // pitch scales with the speed (asetrate → then resample back to 44.1k).
  const audioFilter =
    mode === "pitch"
      ? atempoChain(factor)
      : `asetrate=44100*${factor.toFixed(6)},aresample=44100`;

  return [
    "-i", inName,
    "-filter_complex", `[0:v]${setpts}[v];[0:a]${audioFilter}[a]`,
    "-map", "[v]",
    "-map", "[a]",
    ...codecArgs(ext, true),
    outName,
  ];
}

export default function VideoSpeedTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [sliderPos, setSliderPos] = React.useState(speedToSlider(SPEED_DEFAULT));
  const [audioMode, setAudioMode] = React.useState<AudioMode>("pitch");

  const speed = snapSpeed(sliderToSpeed(sliderPos));

  return (
    <VideoWorkspace
      runLabel="Change speed"
      runIcon="Gauge"
      resultTitle="Re-timed video"
      progressLabel="Re-timing"
      softMaxMB={500}
      onRun={async (file, _meta, { onProgress, onEngineLoading, signal }) => {
        // Probe once for an audio track (instant DOM probe) so a silent source
        // re-times cleanly instead of erroring when audio was requested.
        let hasAudio = true;
        try {
          const probed = await getMetadata(file);
          if (probed.hasAudio === false) hasAudio = false;
        } catch {
          // Probe is best-effort; if it fails, assume audio and fall back below.
        }

        const src = file.name || "video.mp4";
        const ext = extOf(src, "mp4");
        const inName = `in.${ext}`;
        const outName = `${baseName(src)}-${String(speed).replace(".", "_")}x.${ext}`;

        const { fetchFile } = await import("@ffmpeg/util");
        const data = await fetchFile(file);

        // First real run loads the ~31MB WASM core once; flag it for the UI.
        onEngineLoading(true);

        const attempt = (withAudio: boolean) =>
          run(
            buildArgs(inName, outName, ext, speed, audioMode, withAudio),
            { name: inName, data },
            outName,
            (p) => {
              // ffmpeg reports progress once running → engine has loaded.
              onEngineLoading(false);
              onProgress(Math.min(1, Math.max(0, p)));
            },
            guessMime(outName),
          );

        let blob: Blob;
        try {
          blob = await attempt(hasAudio);
        } catch (err) {
          // If audio processing was the culprit (e.g. an undetected silent or
          // unusual track), retry once without audio rather than failing hard.
          if (hasAudio && audioMode !== "none") {
            blob = await attempt(false);
          } else {
            throw err;
          }
        } finally {
          onEngineLoading(false);
        }

        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        return { blob, filename: outName, kind: "video" };
      }}
    >
      {({ meta, busy }) => {
        const newDuration =
          meta.duration > 0 && speed > 0 ? meta.duration / speed : 0;
        const slower = speed < 1;

        return (
          <div className="flex flex-col gap-5">
            {/* Presets */}
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Speed presets"
            >
              {PRESETS.map((p) => {
                const active = Math.abs(speed - p.factor) < 0.001;
                return (
                  <button
                    key={p.factor}
                    type="button"
                    disabled={busy}
                    aria-pressed={active}
                    onClick={() => setSliderPos(speedToSlider(p.factor))}
                    className={cn(
                      "inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-semibold tabular-nums outline-none transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      style.ring,
                      active
                        ? cn(style.solid, "border-transparent text-white")
                        : cn("border-border text-foreground hover:bg-muted/50"),
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Speed slider */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="vs-speed"
                  className="flex items-center gap-2 text-sm font-medium leading-none text-foreground"
                >
                  <Icon name="Gauge" size={15} className={style.text} />
                  Playback speed
                </label>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                    style.soft,
                  )}
                >
                  {speed}×
                </span>
              </div>
              <input
                id="vs-speed"
                type="range"
                min={0}
                max={SLIDER_STEPS}
                step={1}
                value={sliderPos}
                disabled={busy}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                aria-label="Playback speed"
                aria-valuetext={`${speed} times`}
                className={cn(
                  "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted outline-none",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  style.ring,
                  "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow",
                  "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-amber-500",
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>0.25× slow-mo</span>
                <span>4× fast-forward</span>
              </div>
            </div>

            {/* Audio mode */}
            <fieldset className="flex flex-col gap-2" disabled={busy}>
              <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
                <Icon name="Music" size={15} className={style.text} />
                Audio
              </legend>
              <div className="flex flex-col gap-2">
                {AUDIO_MODES.map((m) => {
                  const active = audioMode === m.value;
                  return (
                    <label
                      key={m.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                        "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background",
                        busy && "cursor-not-allowed opacity-60",
                        active
                          ? cn(style.border, style.soft)
                          : "border-border hover:bg-muted/40",
                        style.ring,
                      )}
                    >
                      <input
                        type="radio"
                        name="vs-audio-mode"
                        value={m.value}
                        checked={active}
                        disabled={busy}
                        onChange={() => setAudioMode(m.value)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                          active ? style.border : "border-muted-foreground/40",
                        )}
                      >
                        {active && (
                          <span
                            className={cn("size-2 rounded-full", style.solid)}
                          />
                        )}
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Icon
                            name={m.icon}
                            size={14}
                            className={active ? style.text : "text-muted-foreground"}
                          />
                          {m.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.hint}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Duration preview */}
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center sm:grid-cols-3">
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">Original length</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {meta.duration > 0 ? formatDuration(meta.duration) : "—"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">New length</dt>
                <dd className={cn("text-sm font-semibold tabular-nums", style.text)}>
                  {newDuration > 0 ? formatDuration(newDuration) : "—"}
                </dd>
              </div>
              <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
                <dt className="text-xs text-muted-foreground">Change</dt>
                <dd className="text-sm font-semibold tabular-nums text-foreground">
                  {speed === 1 ? "No change" : slower ? `${speed}× slower` : `${speed}× faster`}
                </dd>
              </div>
            </dl>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5 shrink-0" />
              <span>
                Re-timing runs in your browser via FFmpeg (WebAssembly): short
                clips are quick, large ones take real time and are memory-bound.
                Slowing a clip down makes a longer, heavier file. Nothing is
                uploaded.
              </span>
            </p>
          </div>
        );
      }}
    </VideoWorkspace>
  );
}

// Referenced for typing parity with the workspace render args; kept explicit so
// a future refactor of the options signature fails loudly here.
export type { VideoMeta };
