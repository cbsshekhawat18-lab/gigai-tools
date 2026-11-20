"use client";

/**
 * Audio Format Converter: the universal "any-to-any" hub of the audio toolkit.
 *
 * Composes the shared {@link AudioWorkspace} (dropzone → options → run →
 * progress → result + download + reset) with a target-format picker and a
 * per-format quality control, then hands the file to the engine's
 * {@link convertAudio} router:
 *
 *   • WAV / MP3 targets   → native decode + native WAV / lamejs MP3. NO ffmpeg
 *                           download, so those routes are fast and lightweight.
 *   • OGG/FLAC/M4A/AAC     → decode natively, then the shared on-demand codec
 *                           transcodes (its 31 MB core loads only for these
 *                           targets, once per session).
 *
 * The options slot decodes the source once to paint a real waveform and expose
 * duration / sample-rate / channels, then offers a format grid plus a bitrate
 * picker that appears only for lossy targets (MP3 / AAC). Honest by design:
 * lossless targets preserve every decoded sample, lossy targets discard some
 * detail, surround folds to stereo, and nothing is ever uploaded.
 *
 * TS strict + noUncheckedIndexedAccess clean; dark-mode, responsive, a11y AA.
 */

import * as React from "react";

import type { Tool, WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";

import {
  AudioWorkspace,
  Waveform,
  decodeAudio,
  formatBytes,
  formatDuration,
  describeAudio,
  type AudioMeta,
  type AudioRunHooks,
  type AudioRunResult,
} from "@/components/tool/audio";
import {
  convertAudio,
  detectFormat,
  isNativeFormat,
  MP3_BITRATES,
  type AudioFormat,
} from "@/lib/audio-tools/convert";

/** The six targets this tool can produce, with UI metadata. */
interface TargetSpec {
  format: AudioFormat;
  label: string;
  /** Whether the format discards detail (exposes a bitrate). */
  lossy: boolean;
  /** One honest one-liner for the picker card. */
  hint: string;
}

const TARGETS = [
  { format: "mp3", label: "MP3", lossy: true, hint: "Plays everywhere" },
  { format: "wav", label: "WAV", lossy: false, hint: "Lossless, uncompressed" },
  { format: "flac", label: "FLAC", lossy: false, hint: "Lossless, compressed" },
  { format: "ogg", label: "OGG", lossy: true, hint: "Open, web-friendly" },
  { format: "m4a", label: "M4A", lossy: true, hint: "Apple / AAC container" },
  { format: "aac", label: "AAC", lossy: true, hint: "Efficient, modern" },
] as const satisfies readonly TargetSpec[];

/** Guaranteed-present default target spec (TARGETS is a non-empty literal). */
const DEFAULT_TARGET_SPEC: TargetSpec = TARGETS[0];

const DEFAULT_TARGET: AudioFormat = "mp3";
const DEFAULT_BITRATE = 192;

/** One honest quality line per bitrate. */
const BITRATE_HINTS: Record<number, string> = {
  96: "Smallest: fine for speech",
  128: "Small, great for podcasts",
  160: "Lean, still clean",
  192: "Balanced default",
  256: "High quality",
  320: "Near-transparent",
};

/** Source extension, lowercased, for display. */
function sourceExt(file: File): string {
  const m = /\.([^.]+)$/.exec(file.name);
  return m && m[1] ? m[1].toLowerCase() : "";
}

/** Live conversion options shared with the run handler via a ref. */
interface ConvertState {
  target: AudioFormat;
  bitrate: number;
}

/**
 * Options slot: decode the file once for the waveform, then host the target
 * picker + conditional bitrate control. Kept in its own component keyed on the
 * file so the decoded buffer and picked target reset cleanly on a fresh drop.
 */
function ConvertControls({
  tool,
  file,
  meta,
  busy,
  onStateChange,
}: {
  tool: Tool;
  file: File;
  meta: AudioMeta;
  busy: boolean;
  onStateChange: (state: ConvertState) => void;
}) {
  const style = accentStyle(tool.accent);

  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);
  const [target, setTarget] = React.useState<AudioFormat>(DEFAULT_TARGET);
  const [bitrate, setBitrate] = React.useState<number>(DEFAULT_BITRATE);

  const ext = sourceExt(file);
  const sourceFmt = detectFormat(file);
  const activeTarget = TARGETS.find((t) => t.format === target) ?? DEFAULT_TARGET_SPEC;
  const showBitrate = activeTarget.lossy;
  const targetIsNative = isNativeFormat(target);

  // Decode the dropped file once for the waveform preview.
  React.useEffect(() => {
    let cancelled = false;
    setBuffer(null);
    setDecodeError(null);
    decodeAudio(file)
      .then((b) => {
        if (!cancelled) setBuffer(b);
      })
      .catch((err) => {
        if (!cancelled) {
          setDecodeError(
            err instanceof Error
              ? err.message
              : "Couldn't decode that audio in the browser.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  // Publish the live options up to the run handler.
  React.useEffect(() => {
    onStateChange({ target, bitrate });
  }, [target, bitrate, onStateChange]);

  return (
    <div className="flex flex-col gap-5">
      {/* Source summary */}
      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center sm:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">Source</dt>
          <dd className="text-sm font-semibold uppercase text-foreground">
            {ext || sourceFmt || "audio"}
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

      {/* Waveform preview */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon name="AudioLines" size={15} className={style.text} />
          <span>Source preview</span>
        </div>
        {decodeError ? (
          <p
            role="alert"
            className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            <Icon name="CircleAlert" size={14} className="shrink-0" />
            {decodeError}
          </p>
        ) : buffer ? (
          <Waveform buffer={buffer} height={96} aria-label="Source audio waveform" />
        ) : (
          <div
            className="flex h-[96px] items-center justify-center rounded-md bg-muted/40 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <Icon name="LoaderCircle" size={16} className="mr-2 animate-spin" />
            Decoding waveform…
          </div>
        )}
      </div>

      {/* Target format picker */}
      <fieldset className="flex flex-col gap-3" disabled={busy}>
        <legend className="flex items-center justify-between gap-3 pb-1">
          <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
            <Icon name="RefreshCw" size={15} className={style.text} />
            Convert to
          </span>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold uppercase",
              style.soft,
            )}
          >
            {activeTarget.label}
          </span>
        </legend>
        <div
          role="radiogroup"
          aria-label="Target format"
          className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        >
          {TARGETS.map((t) => {
            const active = t.format === target;
            return (
              <button
                key={t.format}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={busy}
                onClick={() => setTarget(t.format)}
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
                <span className="flex w-full items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold uppercase",
                      active ? style.text : "text-foreground",
                    )}
                  >
                    {t.label}
                  </span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      t.lossy
                        ? "bg-muted text-muted-foreground"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {t.lossy ? "Lossy" : "Lossless"}
                  </span>
                </span>
                <span className="text-[11px] leading-tight text-muted-foreground">
                  {t.hint}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Bitrate picker - only for lossy targets */}
      {showBitrate && (
        <fieldset className="flex flex-col gap-3" disabled={busy}>
          <legend className="flex items-center justify-between gap-3 pb-1">
            <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
              <Icon name="SlidersHorizontal" size={15} className={style.text} />
              {activeTarget.label} bitrate
            </span>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                style.soft,
              )}
            >
              {bitrate} kbps
            </span>
          </legend>
          <div
            role="radiogroup"
            aria-label={`${activeTarget.label} bitrate`}
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
      )}

      {/* Native vs. on-demand codec honesty */}
      <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
        <Icon
          name={targetIsNative ? "Zap" : "Cpu"}
          size={14}
          className={cn("mt-0.5 shrink-0", style.text)}
        />
        <span>
          {targetIsNative ? (
            <>
              Native path: converting to {activeTarget.label} decodes with the Web
              Audio API and encodes in-browser - no heavyweight codec download.{" "}
              {activeTarget.lossy
                ? "Encoding is lossy, so higher bitrates keep more detail. "
                : "Every decoded sample is preserved with no added loss. "}
              Nothing is uploaded.
            </>
          ) : (
            <>
              {activeTarget.label} decodes natively, then a one-time on-demand
              codec (loaded only for exotic targets) handles the encode. It
              downloads once per session; the conversion itself runs on your
              device.{" "}
              {activeTarget.lossy
                ? "This target is lossy, so pick a higher bitrate to keep more detail. "
                : "This target is lossless. No samples are discarded. "}
              Nothing is uploaded.
            </>
          )}
        </span>
      </p>
    </div>
  );
}

export default function AudioFormatConverterTool({ tool }: { tool: WorkspaceToolData }) {
  // Live options, updated by the options slot and read at run time. A ref keeps
  // the workspace's onRun identity stable.
  const stateRef = React.useRef<ConvertState>({
    target: DEFAULT_TARGET,
    bitrate: DEFAULT_BITRATE,
  });
  const setState = React.useCallback((state: ConvertState) => {
    stateRef.current = state;
  }, []);

  const handleRun = React.useCallback(
    async (
      file: File,
      _meta: AudioMeta,
      hooks: AudioRunHooks,
    ): Promise<AudioRunResult> => {
      const { target, bitrate } = stateRef.current;

      // WAV/MP3 stay native (no codec). Exotic targets load the shared core
      // once; flag it so the UI can show the one-time download note.
      const exotic = !isNativeFormat(target);
      if (exotic) hooks.onEngineLoading(true);

      const blob = await convertAudio(
        file,
        target,
        { bitrate },
        (p) => {
          // Any reported progress means work started → codec is loaded.
          if (exotic) hooks.onEngineLoading(false);
          hooks.onProgress(Math.min(Math.max(p, 0), 1));
        },
      );

      hooks.onEngineLoading(false);
      if (hooks.signal.aborted) throw new DOMException("Aborted", "AbortError");

      const base = file.name.replace(/\.[^.]+$/, "") || "audio";
      return { blob, filename: `${base}-gigai.${target}` };
    },
    [],
  );

  return (
    <AudioWorkspace
      onRun={handleRun}
      runLabel="Convert audio"
      runIcon="RefreshCw"
      resultTitle="Converted audio"
      progressLabel="Converting…"
      softMaxMB={300}
    >
      {(args) => (
        <ConvertControls
          key={args.file.name + args.file.size}
          tool={tool}
          file={args.file}
          meta={args.meta}
          busy={args.busy}
          onStateChange={setState}
        />
      )}
    </AudioWorkspace>
  );
}
