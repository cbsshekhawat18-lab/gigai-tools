"use client";

/**
 * WAV Converter, the "Convert to lossless" companion to the MP3 Converter in the
 * GigAI Audio Toolkit.
 *
 * Drop any audio the browser can decode → it decodes natively with the Web Audio
 * API (no upload, no WASM for the common case) and paints a real waveform → pick
 * the sample rate, 16- or 24-bit depth and mono/stereo → the tool resamples/folds
 * offline in the tab and encodes an uncompressed PCM WAV → preview → download.
 *
 * The {@link AudioWorkspace} scaffold owns the file/probe/busy/progress/abort/
 * error/result plumbing; this module supplies the options slot (waveform + WAV
 * settings) and the `onRun` conversion function. Honest by design: WAV is
 * uncompressed (not "better" than the source), decoding a lossy MP3 can't restore
 * discarded detail, and everything is memory-bound because it runs on your device.
 *
 * TS strict + noUncheckedIndexedAccess clean; dark-mode, responsive, a11y AA.
 */

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import {
  AudioWorkspace,
  Waveform,
  AudioPlayer,
  decodeAudio,
  formatBytes,
  formatDuration,
  describeAudio,
  type AudioMeta,
  type AudioRunHooks,
  type AudioRunResult,
} from "@/components/tool/audio";
import { encodeWav } from "@/lib/audio-tools/encode";
import { renderOffline } from "@/lib/audio-tools/context";

/** "keep" preserves the source rate; the rest resample offline. */
type RateChoice = "keep" | 22050 | 44100 | 48000 | 96000;
type BitDepth = 16 | 24;
type ChannelChoice = "keep" | "mono";

interface WavState {
  rate: RateChoice;
  depth: BitDepth;
  channels: ChannelChoice;
}

const RATE_OPTIONS: ReadonlyArray<{ value: RateChoice; label: string; hint: string }> = [
  { value: "keep", label: "Keep source", hint: "No resample" },
  { value: 22050, label: "22.05 kHz", hint: "Lightweight voice" },
  { value: 44100, label: "44.1 kHz", hint: "CD / streaming" },
  { value: 48000, label: "48 kHz", hint: "Video / DAW" },
  { value: 96000, label: "96 kHz", hint: "High-res" },
];

const DEFAULT_STATE: WavState = { rate: "keep", depth: 16, channels: "keep" };

/** Clamp a float sample into [-1, 1]. */
function clampSample(v: number): number {
  return v < -1 ? -1 : v > 1 ? 1 : v;
}

/**
 * Native 24-bit PCM WAV encoder: the engine's {@link encodeWav} is 16-bit only,
 * so we write the 24-bit variant here. Interleaves channels and writes a
 * canonical 44-byte RIFF/WAVE header with a 24-bit sample width.
 */
function encodeWav24(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 3; // 24-bit
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string): void => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM fmt chunk size
  view.setUint16(20, 1, true); // audio format = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 8 * bytesPerSample, true); // bits per sample = 24
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) channelData.push(buffer.getChannelData(ch));

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = clampSample(channelData[ch]![i]!);
      // Full-scale range for signed 24-bit is [-0x800000, 0x7fffff].
      const int = s < 0 ? Math.round(s * 0x800000) : Math.round(s * 0x7fffff);
      // Little-endian 24-bit: low, mid, high byte.
      view.setUint8(offset, int & 0xff);
      view.setUint8(offset + 1, (int >> 8) & 0xff);
      view.setUint8(offset + 2, (int >> 16) & 0xff);
      offset += 3;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

/**
 * Re-render `buffer` to a target sample rate and/or channel count using an
 * OfflineAudioContext (the browser's own high-quality resampler). Returns the
 * source buffer untouched when neither changes, so we never resample needlessly.
 */
async function conformBuffer(
  buffer: AudioBuffer,
  targetRate: number,
  targetChannels: number,
): Promise<AudioBuffer> {
  if (buffer.sampleRate === targetRate && buffer.numberOfChannels === targetChannels) {
    return buffer;
  }
  const ratio = targetRate / buffer.sampleRate;
  const length = Math.max(1, Math.round(buffer.length * ratio));
  return renderOffline(targetChannels, length, targetRate, (ctx) => {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.start();
    return src; // OfflineAudioContext down/up-mixes to its channel count.
  });
}

/**
 * Options slot: decode the file, draw a static waveform, and expose the WAV spec
 * controls. Keyed on the file so the decoded buffer and any preview reset on a
 * fresh drop. Live selections/spec are published up via `onStateChange`.
 */
function WavControls({
  file,
  meta,
  busy,
  style,
  onStateChange,
}: {
  file: File;
  meta: AudioMeta;
  busy: boolean;
  style: ReturnType<typeof accentStyle>;
  onStateChange: (state: WavState) => void;
}) {
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null);
  const [decodeError, setDecodeError] = React.useState<string | null>(null);
  const [rate, setRate] = React.useState<RateChoice>(DEFAULT_STATE.rate);
  const [depth, setDepth] = React.useState<BitDepth>(DEFAULT_STATE.depth);
  const [channels, setChannels] = React.useState<ChannelChoice>(DEFAULT_STATE.channels);

  // Preview of the conformed/encoded result, built on demand.
  const [preview, setPreview] = React.useState<{ buffer: AudioBuffer; blob: Blob } | null>(
    null,
  );
  const [previewBusy, setPreviewBusy] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setBuffer(null);
    setDecodeError(null);
    setPreview(null);
    decodeAudio(file)
      .then((b) => {
        if (!cancelled) setBuffer(b);
      })
      .catch((err) => {
        if (!cancelled) {
          setDecodeError(
            err instanceof Error ? err.message : "Couldn't decode that audio in the browser.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  React.useEffect(() => {
    onStateChange({ rate, depth, channels });
  }, [rate, depth, channels, onStateChange]);

  // Any spec change invalidates a stale preview.
  React.useEffect(() => {
    setPreview(null);
  }, [rate, depth, channels]);

  const sourceRate = meta.sampleRate > 0 ? meta.sampleRate : buffer?.sampleRate ?? 44100;
  const outRate = rate === "keep" ? sourceRate : rate;
  const outChannels = channels === "mono" ? 1 : Math.min(2, meta.channels || 1);

  // Estimated uncompressed WAV size for the current spec (44-byte header + PCM).
  const estBytes =
    44 + Math.round(meta.duration * outRate) * outChannels * (depth === 24 ? 3 : 2);

  const makePreview = React.useCallback(() => {
    if (!buffer) return;
    setPreviewBusy(true);
    void (async () => {
      try {
        const targetRate = rate === "keep" ? buffer.sampleRate : rate;
        const targetChannels = channels === "mono" ? 1 : buffer.numberOfChannels;
        const conformed = await conformBuffer(buffer, targetRate, targetChannels);
        const blob = depth === 24 ? encodeWav24(conformed) : encodeWav(conformed);
        setPreview({ buffer: conformed, blob });
      } catch {
        // Non-fatal: leave the preview empty; the real run surfaces errors.
        setPreview(null);
      } finally {
        setPreviewBusy(false);
      }
    })();
  }, [buffer, rate, depth, channels]);

  const disabled = busy || !buffer;

  return (
    <div className="flex flex-col gap-5">
      {/* Source summary */}
      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-center sm:grid-cols-4">
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
          <dt className="text-xs text-muted-foreground">Sample rate</dt>
          <dd className="text-sm font-semibold tabular-nums text-foreground">
            {(sourceRate / 1000).toFixed(sourceRate % 1000 === 0 ? 0 : 2)} kHz
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

      {/* Waveform preview of the source */}
      <div>
        {decodeError ? (
          <p
            role="alert"
            className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            <Icon name="CircleAlert" size={14} className="shrink-0" />
            {decodeError}
          </p>
        ) : buffer ? (
          <Waveform buffer={buffer} height={96} aria-label="Source waveform preview" />
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

      {/* Sample rate */}
      <fieldset className="flex flex-col gap-3" disabled={busy}>
        <legend className="flex items-center justify-between gap-3 pb-1">
          <span className="flex items-center gap-2 text-sm font-medium leading-none text-foreground">
            <Icon name="AudioWaveform" size={15} className={style.text} />
            Sample rate
          </span>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
              style.soft,
            )}
          >
            {outRate.toLocaleString()} Hz
          </span>
        </legend>
        <div role="radiogroup" aria-label="Sample rate" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {RATE_OPTIONS.map((opt) => {
            const active = rate === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={busy}
                onClick={() => setRate(opt.value)}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  style.ring,
                  active ? cn(style.border, style.soft) : "border-border bg-background hover:bg-muted/50",
                )}
              >
                <span className={cn("text-sm font-semibold", active ? style.text : "text-foreground")}>
                  {opt.label}
                </span>
                <span className="text-[11px] leading-tight text-muted-foreground">{opt.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Bit depth + channels */}
      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-2" disabled={busy}>
          <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
            <Icon name="SlidersHorizontal" size={15} className={style.text} />
            Bit depth
          </legend>
          <div role="radiogroup" aria-label="Bit depth" className="flex gap-2">
            {([16, 24] as const).map((d) => {
              const active = depth === d;
              return (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={busy}
                  onClick={() => setDepth(d)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-semibold outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    style.ring,
                    active
                      ? cn(style.border, style.soft, style.text)
                      : "border-border bg-background text-foreground hover:bg-muted/50",
                  )}
                >
                  {d}-bit
                </button>
              );
            })}
          </div>
          <p className="text-[11px] leading-tight text-muted-foreground">
            16-bit = widest compatibility. 24-bit = editing headroom, larger file.
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-2" disabled={busy}>
          <legend className="mb-1 flex items-center gap-2 text-sm font-medium leading-none text-foreground">
            <Icon name="AudioLines" size={15} className={style.text} />
            Channels
          </legend>
          <div role="radiogroup" aria-label="Channels" className="flex gap-2">
            {(
              [
                { key: "keep", label: meta.channels > 1 ? "Stereo" : "Mono" },
                { key: "mono", label: "Force mono" },
              ] as const
            ).map((opt) => {
              const active = channels === opt.key;
              const isNoop = opt.key === "mono" && meta.channels <= 1;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={busy || isNoop}
                  onClick={() => setChannels(opt.key)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-semibold outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    style.ring,
                    active
                      ? cn(style.border, style.soft, style.text)
                      : "border-border bg-background text-foreground hover:bg-muted/50",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] leading-tight text-muted-foreground">
            {meta.channels > 1
              ? "Fold to mono to roughly halve the size."
              : "Source is already mono."}
          </p>
        </fieldset>
      </div>

      {/* Estimated output + preview */}
      <div className="flex flex-col gap-3">
        <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
          <Icon name="Gauge" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
          <span>
            Estimated WAV size:{" "}
            <span className="font-semibold tabular-nums text-foreground">{formatBytes(estBytes)}</span>{" "}
            ({outRate.toLocaleString()} Hz · {depth}-bit · {outChannels > 1 ? "stereo" : "mono"}).
            WAV is uncompressed, so it&apos;s usually much larger than a lossy source, and it can&rsquo;t
            add quality a lossy encoder already discarded.
          </span>
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">Preview result</span>
          <button
            type="button"
            onClick={makePreview}
            disabled={disabled || previewBusy}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon
              name={previewBusy ? "LoaderCircle" : "PlayCircle"}
              size={14}
              className={previewBusy ? "animate-spin" : ""}
            />
            {preview ? "Refresh preview" : "Preview WAV"}
          </button>
        </div>
        {preview ? (
          <AudioPlayer blob={preview.blob} buffer={preview.buffer} waveHeight={72} />
        ) : (
          <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
            Pick your settings and press &ldquo;Preview WAV&rdquo; to hear the converted result
            before you download.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * WAV Converter tool. Composes {@link AudioWorkspace} with the WAV-spec options
 * slot and a native decode → offline resample/fold → PCM WAV encode pipeline. No
 * ffmpeg for the common case; 16-bit uses the engine's {@link encodeWav}, 24-bit
 * uses the local {@link encodeWav24}.
 */
export default function WavConverterTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const stateRef = React.useRef<WavState>({ ...DEFAULT_STATE });
  const setState = React.useCallback((state: WavState) => {
    stateRef.current = state;
  }, []);

  const handleRun = React.useCallback(
    async (file: File, _meta: AudioMeta, hooks: AudioRunHooks): Promise<AudioRunResult> => {
      const { rate, depth, channels } = stateRef.current;

      // Native decode, Web Audio handles MP3/M4A/OGG/FLAC/WAV on modern browsers.
      const buffer = await decodeAudio(file);
      if (hooks.signal.aborted) return { blob: new Blob() };
      hooks.onProgress(0.4);

      const targetRate = rate === "keep" ? buffer.sampleRate : rate;
      const targetChannels = channels === "mono" ? 1 : buffer.numberOfChannels;
      const conformed = await conformBuffer(buffer, targetRate, targetChannels);
      if (hooks.signal.aborted) return { blob: new Blob() };
      hooks.onProgress(0.8);

      const blob = depth === 24 ? encodeWav24(conformed) : encodeWav(conformed);
      hooks.onProgress(1);

      const base = file.name.replace(/\.[^.]+$/, "") || "audio";
      return { blob, filename: `${base}-gigai.wav` };
    },
    [],
  );

  return (
    <AudioWorkspace
      onRun={handleRun}
      runLabel="Convert to WAV"
      runIcon="FileAudio"
      resultTitle="Your WAV"
      progressLabel="Encoding WAV…"
      softMaxMB={300}
    >
      {(args) => (
        <WavControls
          key={args.file.name + args.file.size}
          file={args.file}
          meta={args.meta}
          busy={args.busy}
          style={style}
          onStateChange={setState}
        />
      )}
    </AudioWorkspace>
  );
}

// Kept explicit so a future change to the workspace render-arg signature fails
// loudly here rather than silently drifting.
export type { AudioMeta };
