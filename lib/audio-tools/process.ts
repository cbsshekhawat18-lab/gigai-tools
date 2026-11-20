/**
 * GigAI Tools, audio editing operations (Web Audio API, native).
 *
 * Every operation here works purely on {@link AudioBuffer}s in memory: no
 * upload, no WASM, no encoding until the caller explicitly serialises the
 * result (see./encode.ts). Functions are pure. They return NEW buffers and
 * never mutate their inputs, so tools can chain them freely.
 *
 * Client-only (all rely on the shared AudioContext helpers).
 */

import { concatBuffers, createBuffer, secondsToFrame, sliceBuffer } from "./context";

/** Convert decibels to a linear gain factor (0 dB → 1.0, +6 dB → ~2.0). */
export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

/** Convert a linear amplitude to decibels (guarding log(0)). */
export function gainToDb(gain: number): number {
  return 20 * Math.log10(Math.max(gain, 1e-8));
}

/**
 * Keep only `[startSec, endSec)` of `buffer` (a "trim"/crop). Returns a new
 * buffer; the original is untouched.
 */
export function trim(buffer: AudioBuffer, startSec: number, endSec: number): AudioBuffer {
  return sliceBuffer(buffer, startSec, endSec);
}

/**
 * Remove the region `[startSec, endSec)` and stitch the head and tail together
 * (the inverse of {@link trim}). Returns a new buffer.
 */
export function cut(buffer: AudioBuffer, startSec: number, endSec: number): AudioBuffer {
  const head = sliceBuffer(buffer, 0, startSec);
  const tail = sliceBuffer(buffer, endSec, buffer.duration);
  return concatBuffers([head, tail]);
}

/** Join/merge buffers sequentially into one (alias of {@link concatBuffers}). */
export function merge(buffers: AudioBuffer[]): AudioBuffer {
  return concatBuffers(buffers);
}

/**
 * Apply a fixed gain (in dB) to every sample, hard-clamped to [-1, 1] to avoid
 * digital overflow. Positive dB boosts, negative attenuates. New buffer out.
 */
export function boost(buffer: AudioBuffer, gainDb: number): AudioBuffer {
  const gain = dbToGain(gainDb);
  const out = createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = out.getChannelData(ch);
    for (let i = 0; i < src.length; i++) {
      dst[i] = Math.max(-1, Math.min(1, src[i]! * gain));
    }
  }
  return out;
}

/** Alias for {@link boost} expressed as an absolute gain-in-dB "set volume". */
export const setVolume = boost;

/**
 * Change playback speed by `factor` (2 = twice as fast / half as long).
 *
 * Two genuinely different engines, because they answer different questions:
 *
 * - **Default (`preservePitch` off)**, a linear resample. Pitch rises and falls
 *   with speed, exactly like a tape or a record. Cheap, and often the effect
 *   people actually want.
 * - **`preservePitch: true`**, real WSOLA time-stretching (see./timestretch).
 *   Duration changes while pitch stays put, which is what anyone speeding up
 *   speech is after.
 *
 * Historical note worth keeping: this used to route "preserve pitch" through
 * `AudioBufferSourceNode.playbackRate` in an OfflineAudioContext. That is *also*
 * a resample (it shifts pitch by exactly the same ratio as the linear path) so
 * the option silently did nothing for the one thing it promised. Web Audio has
 * no time-stretch primitive; it has to be implemented, and now it is.
 */
export async function changeSpeed(
  buffer: AudioBuffer,
  factor: number,
  opts: { preservePitch?: boolean } = {},
): Promise<AudioBuffer> {
  const f = Math.max(0.25, Math.min(4, factor));
  const outLength = Math.max(1, Math.round(buffer.length / f));

  if (opts.preservePitch) {
    const { stretchChannels } = await import("./timestretch");
    const channels: Float32Array[] = [];
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      channels.push(buffer.getChannelData(ch));
    }
    const stretched = stretchChannels(channels, f, buffer.sampleRate);
    const out = createBuffer(buffer.numberOfChannels, outLength, buffer.sampleRate);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      // stretchChannels returns exactly outLength frames; copy defensively.
      out.getChannelData(ch).set(stretched[ch]!.subarray(0, outLength));
    }
    return out;
  }

  // Fast linear resample, pitch shifts with speed (classic behaviour).
  const out = createBuffer(buffer.numberOfChannels, outLength, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = out.getChannelData(ch);
    for (let i = 0; i < outLength; i++) {
      const pos = i * f;
      const idx = Math.floor(pos);
      const frac = pos - idx;
      const a = src[idx] ?? 0;
      const b = src[idx + 1] ?? a;
      dst[i] = a + (b - a) * frac; // linear interpolation
    }
  }
  return out;
}

/** Reverse every channel in place-of-copy (returns a new reversed buffer). */
export function reverse(buffer: AudioBuffer): AudioBuffer {
  const out = createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = out.getChannelData(ch);
    const n = src.length;
    for (let i = 0; i < n; i++) dst[i] = src[n - 1 - i]!;
  }
  return out;
}

/**
 * Fade shapes. `t` runs 0→1 across the fade; the returned gain is linear
 * amplitude.
 *
 * Why this is a choice and not a constant: a *linear amplitude* ramp is not a
 * linear ramp to the ear. Loudness tracks amplitude logarithmically, so a linear
 * fade-out seems to hang near full volume and then drop off a cliff at the very
 * end. The curved shapes below spend more of their time in the range the ear
 * actually resolves, which is why they sound like a fade and linear sounds like
 * an edit.
 */
export type FadeCurve = "linear" | "equalPower" | "exponential";

/** Gain at position `t` (0→1) for a fade-IN of the given curve. */
function fadeGain(t: number, curve: FadeCurve): number {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  switch (curve) {
    case "linear":
      return x;
    case "exponential":
      // t², a gentle start and a decisive finish; the classic music fade-out.
      return x * x;
    case "equalPower":
    default:
      // sin(πt/2): constant perceived power, the smoothest general-purpose
      // shape and the one used for crossfades.
      return Math.sin((Math.PI / 2) * x);
  }
}

/**
 * Apply a fade-in over the first `inSec` and/or a fade-out over the last
 * `outSec` seconds. Oversized fades are clamped to the buffer, and overlapping
 * in/out fades simply multiply.
 *
 * Defaults to an equal-power curve because it is what people mean by "fade";
 * pass `curve: "linear"` for the old ramp.
 */
export function fade(
  buffer: AudioBuffer,
  opts: { inSec?: number; outSec?: number; curve?: FadeCurve },
): AudioBuffer {
  const sr = buffer.sampleRate;
  const n = buffer.length;
  const curve = opts.curve ?? "equalPower";
  const inFrames = Math.min(n, Math.max(0, Math.round((opts.inSec ?? 0) * sr)));
  const outFrames = Math.min(n, Math.max(0, Math.round((opts.outSec ?? 0) * sr)));
  const out = createBuffer(buffer.numberOfChannels, n, sr);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = out.getChannelData(ch);
    for (let i = 0; i < n; i++) {
      let g = 1;
      if (inFrames > 0 && i < inFrames) g *= fadeGain(i / inFrames, curve);
      // Mirror the same curve for the out-fade so both ends match in shape.
      if (outFrames > 0 && i >= n - outFrames) g *= fadeGain((n - 1 - i) / outFrames, curve);
      dst[i] = src[i]! * g;
    }
  }
  return out;
}

/**
 * Join buffers with a short equal-power crossfade at every splice.
 *
 * Butt-joining two unrelated waveforms almost always steps the signal
 * discontinuously, and a step is a click. A crossfade of even a few milliseconds
 * removes it while being far too short to hear as a fade. Used by
 * {@link removeSilence}, where every removed gap creates a splice.
 */
export function concatCrossfaded(buffers: AudioBuffer[], fadeSec = 0.006): AudioBuffer {
  const usable = buffers.filter((b) => b.length > 0);
  if (usable.length === 0) throw new Error("No audio to join.");
  if (usable.length === 1) return usable[0]!;

  const sr = usable[0]!.sampleRate;
  const shortest = usable.reduce((m, b) => Math.min(m, b.length), Infinity);
  // Never crossfade more than a third of the shortest piece.
  const overlap = Math.max(0, Math.min(Math.round(fadeSec * sr), Math.floor(shortest / 3)));
  if (overlap === 0) return concatBuffers(usable);

  let channels = 1;
  let total = 0;
  for (const b of usable) {
    channels = Math.max(channels, b.numberOfChannels);
    total += b.length;
  }
  const outLength = Math.max(1, total - overlap * (usable.length - 1));
  const out = createBuffer(channels, outLength, sr);

  // Read channel `ch` from a buffer, folding mono up to every output channel.
  const readChannel = (b: AudioBuffer, ch: number): Float32Array =>
    b.getChannelData(b.numberOfChannels === 1 ? 0 : Math.min(ch, b.numberOfChannels - 1));

  for (let ch = 0; ch < channels; ch++) {
    const dst = out.getChannelData(ch);
    let writePos = 0;
    for (let bi = 0; bi < usable.length; bi++) {
      const src = readChannel(usable[bi]!, ch);
      if (bi === 0) {
        dst.set(src, 0);
        writePos = src.length;
        continue;
      }
      // Overlap this piece's head onto the tail already written.
      const start = writePos - overlap;
      for (let i = 0; i < overlap; i++) {
        const t = (i + 1) / (overlap + 1);
        const fadeOut = Math.cos((Math.PI / 2) * t); // outgoing tail
        const fadeIn = Math.sin((Math.PI / 2) * t); // incoming head
        dst[start + i] = dst[start + i]! * fadeOut + src[i]! * fadeIn;
      }
      const rest = src.subarray(overlap);
      dst.set(rest, writePos);
      writePos += rest.length;
    }
  }
  return out;
}

/** Find the peak absolute amplitude across all channels (0..1+). */
function peakAmplitude(buffer: AudioBuffer): number {
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    for (let i = 0; i < src.length; i++) {
      const a = Math.abs(src[i]!);
      if (a > peak) peak = a;
    }
  }
  return peak;
}

/** Compute the RMS amplitude across all channels (0..1). */
function rmsAmplitude(buffer: AudioBuffer): number {
  let sumSquares = 0;
  let count = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    for (let i = 0; i < src.length; i++) {
      sumSquares += src[i]! * src[i]!;
    }
    count += src.length;
  }
  return count === 0 ? 0 : Math.sqrt(sumSquares / count);
}

/**
 * Normalise loudness to `targetDb` (default −1 dBFS) by a single gain factor.
 *
 * `mode: "peak"` (default) scales so the loudest sample hits the target; RMS
 * mode scales average energy to the target (perceived-loudness style), then
 * hard-limits to avoid clipping the peaks. Returns a new buffer.
 */
export function normalize(
  buffer: AudioBuffer,
  opts: { targetDb?: number; mode?: "peak" | "rms" } = {},
): AudioBuffer {
  const targetDb = opts.targetDb ?? -1;
  const target = dbToGain(targetDb);
  const mode = opts.mode ?? "peak";
  const current = mode === "rms" ? rmsAmplitude(buffer) : peakAmplitude(buffer);
  if (current <= 1e-8) return buffer; // silence - nothing to normalise
  const gain = target / current;
  // boost() already hard-clamps, which doubles as the RMS-mode limiter.
  return boost(buffer, gainToDb(gain));
}

/** Window length for RMS loudness analysis. 20 ms ≈ one speech pitch period. */
const RMS_WINDOW_SEC = 0.02;

/** Options shared by {@link detectSilence} and {@link removeSilence}. */
export interface SilenceOptions {
  /** Level below which audio counts as silence, in dBFS. Default −50. */
  thresholdDb?: number;
  /** Only gaps at least this long are treated as silence. Default 0.3 s. */
  minSilenceSec?: number;
  /**
   * Breathing room kept on each side of a loud segment, in seconds.
   *
   * Speech does not start at full volume, a word ramps up over a few tens of
   * milliseconds. Cutting exactly where the meter crosses the threshold shears
   * that onset off and makes every sentence start abruptly. Default 0.05 s.
   */
  padSec?: number;
}

/**
 * Detect the parts worth keeping: contiguous spans louder than `thresholdDb`,
 * with gaps shorter than `minSilenceSec` treated as part of the speech rather
 * than as silence. Returns `[start, end]` second ranges.
 *
 * Loudness is measured as **RMS over short windows**, not sample by sample. A
 * single sample is a terrible loudness estimate: every waveform passes through
 * zero on every cycle, so instantaneous amplitude says almost nothing about
 * whether sound is present, and a lone click in an otherwise silent passage
 * would keep the whole gap. Windowed RMS is what a level meter shows and what
 * people are picturing when they set a threshold.
 *
 * Exposed separately so tools can preview the cuts before applying them.
 */
export function detectSilence(
  buffer: AudioBuffer,
  opts: SilenceOptions = {},
): Array<[number, number]> {
  const threshold = dbToGain(opts.thresholdDb ?? -50);
  const minSilence = opts.minSilenceSec ?? 0.3;
  const pad = Math.max(0, opts.padSec ?? 0.05);
  const sr = buffer.sampleRate;
  const n = buffer.length;
  if (n === 0) return [];

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) channels.push(buffer.getChannelData(ch));

  // ── Pass 1: RMS per window, loud/quiet per window ──────────────────────────
  const windowFrames = Math.max(1, Math.round(RMS_WINDOW_SEC * sr));
  const windowCount = Math.ceil(n / windowFrames);
  const loud = new Uint8Array(windowCount);

  for (let w = 0; w < windowCount; w++) {
    const from = w * windowFrames;
    const to = Math.min(n, from + windowFrames);
    let sumSquares = 0;
    let count = 0;
    for (const data of channels) {
      for (let i = from; i < to; i++) {
        const v = data[i]!;
        sumSquares += v * v;
      }
      count += to - from;
    }
    const rms = count === 0 ? 0 : Math.sqrt(sumSquares / count);
    loud[w] = rms >= threshold ? 1 : 0;
  }

  // ── Pass 2: group windows into loud spans, bridging short gaps ─────────────
  const minSilenceWindows = Math.max(1, Math.round(minSilence / RMS_WINDOW_SEC));
  const spans: Array<[number, number]> = []; // in window indices
  let spanStart = -1;
  let quietRun = 0;

  for (let w = 0; w < windowCount; w++) {
    if (loud[w]) {
      if (spanStart < 0) spanStart = w;
      quietRun = 0;
    } else if (spanStart >= 0) {
      quietRun++;
      // Only close the span once the gap is genuinely long enough to be silence;
      // shorter dips are the pauses *inside* natural speech.
      if (quietRun >= minSilenceWindows) {
        spans.push([spanStart, w - quietRun + 1]);
        spanStart = -1;
        quietRun = 0;
      }
    }
  }
  if (spanStart >= 0) spans.push([spanStart, windowCount]);
  if (spans.length === 0) return [];

  // ── Pass 3: to seconds, apply padding, then merge anything now overlapping ─
  const totalSec = n / sr;
  const merged: Array<[number, number]> = [];
  for (const [ws, we] of spans) {
    const start = Math.max(0, (ws * windowFrames) / sr - pad);
    const end = Math.min(totalSec, (we * windowFrames) / sr + pad);
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      // Padding closed the gap. This is really one continuous span.
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

/**
 * Remove long silences and rejoin what's left.
 *
 * Every removed gap leaves a splice between two unrelated waveforms, which
 * clicks if you simply butt them together, the single most common complaint
 * about automatic silence removal. Segments are therefore rejoined with a short
 * equal-power crossfade (see {@link concatCrossfaded}), short enough to be
 * inaudible as a fade but long enough to remove the step.
 *
 * Returns the original buffer untouched when there's no qualifying silence.
 */
export function removeSilence(buffer: AudioBuffer, opts: SilenceOptions = {}): AudioBuffer {
  const keep = detectSilence(buffer, opts);
  if (keep.length === 0) return buffer;
  // Nothing was actually cut: hand back the original rather than a re-copy.
  if (keep.length === 1 && keep[0]![0] <= 0 && keep[0]![1] >= buffer.duration) return buffer;
  const segments = keep.map(([s, e]) => sliceBuffer(buffer, s, e));
  return concatCrossfaded(segments);
}

/**
 * Split a buffer into multiple pieces.
 *
 * - `ranges`: explicit `[startSec, endSec]` pairs.
 * - `everySec`: fixed-length chunks (last chunk holds the remainder).
 * - `onSilence`: split on detected silence (uses {@link detectSilence}).
 *
 * Exactly one strategy should be supplied; precedence is ranges → everySec →
 * onSilence. Returns an array of new buffers.
 */
export function split(
  buffer: AudioBuffer,
  opts: {
    ranges?: Array<[number, number]>;
    everySec?: number;
    onSilence?: { thresholdDb?: number; minSilenceSec?: number };
  },
): AudioBuffer[] {
  if (opts.ranges && opts.ranges.length > 0) {
    return opts.ranges.map(([s, e]) => sliceBuffer(buffer, s, e));
  }
  if (opts.everySec && opts.everySec > 0) {
    const out: AudioBuffer[] = [];
    for (let s = 0; s < buffer.duration; s += opts.everySec) {
      out.push(sliceBuffer(buffer, s, Math.min(s + opts.everySec, buffer.duration)));
    }
    return out;
  }
  if (opts.onSilence) {
    return detectSilence(buffer, opts.onSilence).map(([s, e]) => sliceBuffer(buffer, s, e));
  }
  return [buffer];
}

/** Frame-accurate helper re-export for tools that need it alongside process ops. */
export { secondsToFrame };
