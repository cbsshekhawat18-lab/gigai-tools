/**
 * GigAI Tools: audio encoders.
 *
 * WAV is written natively (see ./context). MP3 is encoded in-browser with
 * `@breezystack/lamejs`, lazily imported so its code never lands until an MP3
 * export actually runs. Exotic containers/codecs (OGG/FLAC/M4A/AAC) are routed
 * through the SHARED ffmpeg.wasm engine (lib/video-tools/ffmpeg.ts), its 31 MB
 * core downloads only for those conversions, never for WAV/MP3.
 *
 * Client-only.
 */

import { audioBufferToWavBlob } from "./context";
import type { ProgressFn } from "@/lib/video-tools/ffmpeg";

/** Native, dependency-free 16-bit PCM WAV encode. */
export function encodeWav(buffer: AudioBuffer): Blob {
  return audioBufferToWavBlob(buffer);
}

/** Convert a Float32 sample buffer to Int16 PCM (lamejs wants signed 16-bit). */
function floatToInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]!));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/**
 * Encode an {@link AudioBuffer} to MP3 via lamejs (lazy-imported).
 *
 * Handles mono and stereo (extra channels beyond 2 are dropped. MP3 is ≤2ch).
 * Samples are fed in 1152-frame blocks (one MPEG frame) so memory stays flat on
 * long files. `onProgress` reports 0..1 across the encode.
 *
 * @param opts.bitrate CBR bitrate in kbps (default 192).
 */
export async function encodeMp3(
  buffer: AudioBuffer,
  opts: { bitrate?: number } = {},
  onProgress?: ProgressFn,
): Promise<Blob> {
  const bitrate = opts.bitrate ?? 192;
  const { Mp3Encoder } = await import("@breezystack/lamejs");

  const channels = Math.min(2, buffer.numberOfChannels);
  const sampleRate = buffer.sampleRate;
  const encoder = new Mp3Encoder(channels, sampleRate, bitrate);

  const left = floatToInt16(buffer.getChannelData(0));
  const right = channels > 1 ? floatToInt16(buffer.getChannelData(1)) : undefined;

  const BLOCK = 1152; // one MPEG frame of samples
  const chunks: Uint8Array[] = [];
  const total = left.length;

  for (let i = 0; i < total; i += BLOCK) {
    const leftChunk = left.subarray(i, i + BLOCK);
    const rightChunk = right ? right.subarray(i, i + BLOCK) : undefined;
    const mp3buf = rightChunk
      ? encoder.encodeBuffer(leftChunk, rightChunk)
      : encoder.encodeBuffer(leftChunk);
    if (mp3buf.length > 0) chunks.push(mp3buf);
    if (onProgress && (i & 0x3ffff) === 0) onProgress(i / total, "Encoding MP3…");
  }

  const tail = encoder.flush();
  if (tail.length > 0) chunks.push(tail);
  onProgress?.(1, "Done.");

  return new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
}

/** Map an exotic target extension to a Blob MIME type. */
function mimeForExt(ext: string): string {
  const map: Record<string, string> = {
    ogg: "audio/ogg",
    flac: "audio/flac",
    m4a: "audio/mp4",
    aac: "audio/aac",
    mp3: "audio/mpeg",
    wav: "audio/wav",
  };
  return map[ext] ?? "application/octet-stream";
}

/**
 * Encode an exotic format via the shared ffmpeg.wasm engine. Takes an already-
 * serialised input Blob (typically a WAV from {@link encodeWav}) and transcodes
 * it to `targetExt` (ogg/flac/m4a/aac). Loads the ffmpeg core on first use.
 *
 * `onProgress` covers both the one-time core download and the transcode.
 */
export async function encodeViaFfmpeg(
  inputBlob: Blob,
  targetExt: "ogg" | "flac" | "m4a" | "aac",
  onProgress?: ProgressFn,
): Promise<Blob> {
  const { run } = await import("@/lib/video-tools/ffmpeg");
  const inputData = new Uint8Array(await inputBlob.arrayBuffer());
  const outName = `out.${targetExt}`;

  // Codec choices: OGG→libvorbis, FLAC→flac, M4A/AAC→aac. `-vn` guards against
  // any stray video stream. ffmpeg picks sane defaults for the rest.
  const codecArgs: Record<string, string[]> = {
    ogg: ["-c:a", "libvorbis"],
    flac: ["-c:a", "flac"],
    m4a: ["-c:a", "aac", "-b:a", "192k"],
    aac: ["-c:a", "aac", "-b:a", "192k"],
  };
  const args = ["-i", "in.wav", "-vn", ...(codecArgs[targetExt] ?? []), outName];

  return run(args, { name: "in.wav", data: inputData }, outName, onProgress, mimeForExt(targetExt));
}
