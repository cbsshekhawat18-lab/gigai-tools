/**
 * GigAI Tools, in-browser audio engine core (Web Audio API).
 *
 * Zero-dependency, zero-upload primitives shared by every audio tool. Decoding,
 * buffer surgery (slice/concat), offline rendering and a native PCM WAV encoder
 * all ride on the browser's own `AudioContext` / `OfflineAudioContext`. No
 * WASM, no workers, no network. This is the fast path; ffmpeg.wasm is only ever
 * touched for exotic container/codec conversions (see ./convert.ts).
 *
 * Client-only: every symbol here touches `AudioContext`, so import it from
 * browser code (event handlers / effects), never at module top-level on the
 * server.
 */

/** A lazily-created, resumable shared AudioContext for decoding/playback. */
let sharedCtx: AudioContext | null = null;

/**
 * Return a shared, resumed {@link AudioContext}, creating it on first use.
 *
 * Browsers start contexts `suspended` until a user gesture; callers inside a
 * click/tap handler get an already-running context. We reuse one instance
 * because browsers cap the number of live contexts.
 */
export function getAudioContext(): AudioContext {
  if (sharedCtx && sharedCtx.state !== "closed") return sharedCtx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) throw new Error("Web Audio API is not supported in this browser.");
  sharedCtx = new Ctor();
  return sharedCtx;
}

/**
 * Decode any browser-supported audio file into an {@link AudioBuffer}.
 *
 * Uses `decodeAudioData`, so the set of accepted inputs is whatever the browser
 * can natively decode (typically WAV/MP3/AAC/M4A/OGG/FLAC on modern engines).
 * Rejects with a friendly message when the codec/container isn't supported -
 * callers can fall back to the ffmpeg path for those.
 */
export async function decodeFile(file: Blob): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  try {
    // decodeAudioData detaches the ArrayBuffer, so it must not be reused after.
    return await ctx.decodeAudioData(arrayBuffer);
  } catch {
    throw new Error(
      "Couldn't decode this audio, the format may be unsupported by your browser. Try converting it first.",
    );
  }
}

/**
 * Create an empty {@link AudioBuffer} matching a template's channel count and
 * sample rate, sized to `length` frames. Handy for building outputs.
 */
export function createBuffer(
  channels: number,
  length: number,
  sampleRate: number,
): AudioBuffer {
  const ctx = getAudioContext();
  return ctx.createBuffer(Math.max(1, channels), Math.max(1, length), sampleRate);
}

/** Clamp a second-offset to `[0, buffer.duration]` and convert to a frame index. */
export function secondsToFrame(buffer: AudioBuffer, seconds: number): number {
  const clamped = Math.min(Math.max(seconds, 0), buffer.duration);
  return Math.round(clamped * buffer.sampleRate);
}

/**
 * Extract `[startSec, endSec)` of `buffer` into a new {@link AudioBuffer},
 * copying every channel. Out-of-range/inverted ranges are clamped; an empty or
 * inverted range yields a 1-frame silent buffer (never zero-length, which some
 * engines reject).
 */
export function sliceBuffer(
  buffer: AudioBuffer,
  startSec: number,
  endSec: number,
): AudioBuffer {
  const startFrame = secondsToFrame(buffer, startSec);
  const endFrame = secondsToFrame(buffer, endSec);
  const length = Math.max(1, endFrame - startFrame);
  const out = createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const src = buffer.getChannelData(ch);
    const dst = out.getChannelData(ch);
    // subarray is a view (no copy); set() copies into the output channel.
    dst.set(src.subarray(startFrame, startFrame + length));
  }
  return out;
}

/**
 * Concatenate buffers end-to-end into a single {@link AudioBuffer}.
 *
 * The output channel count is the MAX across inputs (mono inputs are laid into
 * every output channel so they stay centred, not silent on one side). All
 * inputs are assumed to share a sample rate; the first buffer's rate wins.
 */
export function concatBuffers(buffers: AudioBuffer[]): AudioBuffer {
  if (buffers.length === 0) throw new Error("No audio to join.");
  const first = buffers[0]!;
  const sampleRate = first.sampleRate;
  let totalLength = 0;
  let channels = 1;
  for (const b of buffers) {
    totalLength += b.length;
    channels = Math.max(channels, b.numberOfChannels);
  }
  const out = createBuffer(channels, totalLength, sampleRate);
  let offset = 0;
  for (const b of buffers) {
    for (let ch = 0; ch < channels; ch++) {
      // Mono source (1 channel) feeds all output channels; else copy matching
      // channel, falling back to channel 0 when the source has fewer.
      const srcCh = b.numberOfChannels === 1 ? 0 : Math.min(ch, b.numberOfChannels - 1);
      out.getChannelData(ch).set(b.getChannelData(srcCh), offset);
    }
    offset += b.length;
  }
  return out;
}

/**
 * Render a graph offline. The `build` callback wires nodes into the supplied
 * {@link OfflineAudioContext} and returns the final node to connect to the
 * destination. Resolves with the fully rendered {@link AudioBuffer}.
 *
 * @param channels    output channel count
 * @param length      output length in frames
 * @param sampleRate  output sample rate (Hz)
 * @param build       wires the graph, returns the terminal node
 */
export async function renderOffline(
  channels: number,
  length: number,
  sampleRate: number,
  build: (ctx: OfflineAudioContext) => AudioNode,
): Promise<AudioBuffer> {
  const OfflineCtor =
    window.OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;
  if (!OfflineCtor) throw new Error("OfflineAudioContext is not supported in this browser.");
  const ctx = new OfflineCtor(Math.max(1, channels), Math.max(1, length), sampleRate);
  const node = build(ctx);
  node.connect(ctx.destination);
  return ctx.startRendering();
}

/**
 * Encode an {@link AudioBuffer} to a 16-bit PCM WAV {@link Blob}: a native,
 * dependency-free encoder. Interleaves channels and writes a canonical 44-byte
 * RIFF/WAVE header. Lossless within 16-bit depth; ubiquitous compatibility.
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string): void => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  // RIFF/WAVE header.
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
  view.setUint16(34, 8 * bytesPerSample, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // Cache channel views so we don't call getChannelData() per frame.
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) channelData.push(buffer.getChannelData(ch));

  // Interleave + convert float [-1,1] to signed 16-bit.
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch]![i]!));
      // Asymmetric scaling keeps full-scale negative at exactly -32768.
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}
