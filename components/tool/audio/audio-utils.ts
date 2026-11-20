"use client";

/**
 * Small, dependency-free helpers shared across the audio UI. Everything here is
 * client-only: it touches `window`, `AudioContext`, and `<audio>`. No ffmpeg, no
 * MP3 encoder, probing / decoding / drawing a clip only needs the browser's own
 * Web Audio pipeline, which is instant and never loads the 31 MB wasm core.
 *
 * The heavier engine (trim/merge/normalize/encode, exotic conversions) lives in
 * `lib/audio-tools`; these are just the presentational primitives the shared
 * components need to render a dropzone, waveform, player, recorder, and result.
 */

/** Metadata read from a decoded audio file. */
export interface AudioMeta {
  /** Duration in seconds. */
  duration: number;
  /** Sample rate in Hz, e.g. 44100. */
  sampleRate: number;
  /** Channel count (1 = mono, 2 = stereo, …). */
  channels: number;
}

/** Reuse a single lazily-created AudioContext for decode/probe work. */
let sharedCtx: AudioContext | null = null;

/**
 * Return a shared {@link AudioContext}, creating it on first use. Handles the
 * webkit-prefixed constructor and returns `null` outside the browser.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedCtx && sharedCtx.state !== "closed") return sharedCtx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  sharedCtx = new Ctor();
  return sharedCtx;
}

/** True when the browser exposes an AudioContext we can decode with. */
export function isAudioSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.AudioContext ??
      (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext,
  );
}

/**
 * Decode an audio File/Blob into an {@link AudioBuffer} via the Web Audio API.
 * Works for any format the browser can natively decode (WAV, MP3, most
 * OGG/M4A/FLAC depending on the browser). Rejects on undecodable input so the
 * caller can suggest the exotic-conversion path.
 */
export async function decodeAudio(source: Blob): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  if (!ctx) throw new Error("Web Audio isn't available in this environment.");
  const arrayBuffer = await source.arrayBuffer();
  try {
    // `decodeAudioData` copies the buffer, so passing a slice is safe.
    return await ctx.decodeAudioData(arrayBuffer.slice(0));
  } catch {
    throw new Error(
      "Couldn't decode that audio: your browser may not support this format. Try converting it first.",
    );
  }
}

/** Read duration / sample rate / channels from a File without keeping the buffer. */
export async function probeAudio(source: Blob): Promise<AudioMeta> {
  const buffer = await decodeAudio(source);
  return {
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    channels: buffer.numberOfChannels,
  };
}

/**
 * A compact min/max envelope for a waveform. Each of the `length` buckets holds
 * the minimum and maximum sample seen in that slice of the signal, so the
 * rendered waveform keeps its true dynamic shape at any width.
 */
export interface Peaks {
  /** Per-bucket minimums, range [-1, 1]. */
  min: Float32Array;
  /** Per-bucket maximums, range [-1, 1]. */
  max: Float32Array;
  /** Number of buckets (== canvas columns you plan to draw). */
  length: number;
}

/**
 * Compute a min/max peak envelope from an {@link AudioBuffer}, mixing all
 * channels down to mono. `buckets` is the horizontal resolution, pass the pixel
 * width you intend to draw at. Cheap enough to run synchronously for typical
 * clips; large files still complete in a few ms because it's a single pass.
 */
export function computePeaks(buffer: AudioBuffer, buckets: number): Peaks {
  const width = Math.max(1, Math.floor(buckets));
  const min = new Float32Array(width);
  const max = new Float32Array(width);
  const channels = buffer.numberOfChannels;
  const frames = buffer.length;
  if (frames === 0) return { min, max, length: width };

  const step = frames / width;
  const data: Float32Array[] = [];
  for (let c = 0; c < channels; c++) data.push(buffer.getChannelData(c));

  for (let i = 0; i < width; i++) {
    const start = Math.floor(i * step);
    const end = Math.min(frames, Math.floor((i + 1) * step));
    let lo = Infinity;
    let hi = -Infinity;
    for (let j = start; j < end; j++) {
      let sum = 0;
      for (let c = 0; c < channels; c++) sum += data[c]![j]!;
      const v = sum / channels;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    // Guard empty buckets (step < 1) so we never emit ±Infinity.
    min[i] = Number.isFinite(lo) ? lo : 0;
    max[i] = Number.isFinite(hi) ? hi : 0;
  }
  return { min, max, length: width };
}

/** Human-readable byte size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / Math.pow(1024, exponent);
  const unit = units[exponent] ?? "B";
  const formatted = exponent === 0 ? String(Math.round(value)) : value.toFixed(1);
  return `${formatted} ${unit}`;
}

/**
 * Format seconds as a clock. Under an hour → `m:ss`; an hour or more →
 * `h:mm:ss`. Pass `showMs` for a trailing `.mmm` (handy on selection handles).
 */
export function formatDuration(seconds: number, showMs = false): string {
  if (!Number.isFinite(seconds) || seconds < 0) return showMs ? "0:00.000" : "0:00";
  const whole = Math.floor(seconds);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const base = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  if (!showMs) return base;
  const ms = Math.round((seconds - whole) * 1000);
  return `${base}.${String(ms).padStart(3, "0")}`;
}

/** Signed percentage-change label, e.g. -64 -> "−64%", 12 -> "+12%". */
export function formatDelta(before: number, after: number): string {
  if (before <= 0) return "—";
  const pct = Math.round(((after - before) / before) * 100);
  if (pct === 0) return "0%";
  return pct < 0 ? `−${Math.abs(pct)}%` : `+${pct}%`;
}

/** Describe an AudioBuffer's channel layout, e.g. "Stereo · 44.1 kHz". */
export function describeAudio(meta: {
  channels: number;
  sampleRate: number;
}): string {
  const layout =
    meta.channels === 1
      ? "Mono"
      : meta.channels === 2
        ? "Stereo"
        : `${meta.channels} ch`;
  const khz = (meta.sampleRate / 1000).toFixed(1).replace(/\.0$/, "");
  return `${layout} · ${khz} kHz`;
}
