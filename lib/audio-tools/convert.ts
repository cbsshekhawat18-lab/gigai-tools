/**
 * GigAI Tools, audio format conversion.
 *
 * The router that picks the cheapest path per target:
 *   • wav / mp3  → native (Web Audio decode + native WAV / lamejs MP3), NO
 *     ffmpeg download.
 *   • ogg/flac/m4a/aac → decode natively to a WAV, then transcode with the
 *     shared ffmpeg.wasm engine (its 31 MB core loads only here).
 *
 * Client-only.
 */

import { decodeFile } from "./context";
import { encodeMp3, encodeViaFfmpeg, encodeWav } from "./encode";
import type { ProgressFn } from "@/lib/video-tools/ffmpeg";

/** Formats this engine can produce. */
export type AudioFormat = "wav" | "mp3" | "ogg" | "flac" | "m4a" | "aac";

/** Formats handled entirely by native code (no ffmpeg core download). */
const NATIVE_FORMATS = new Set<AudioFormat>(["wav", "mp3"]);

/** Whether producing `format` avoids the ffmpeg.wasm download. */
export function isNativeFormat(format: AudioFormat): boolean {
  return NATIVE_FORMATS.has(format);
}

/**
 * Best-effort detect a file's audio format from its MIME type, then extension.
 * Returns a normalised {@link AudioFormat} or `null` when unrecognised (the
 * decode step can still succeed for anything the browser understands).
 */
export function detectFormat(file: File): AudioFormat | null {
  const type = file.type.toLowerCase();
  const byMime: Array<[string, AudioFormat]> = [
    ["audio/wav", "wav"],
    ["audio/x-wav", "wav"],
    ["audio/mpeg", "mp3"],
    ["audio/mp3", "mp3"],
    ["audio/ogg", "ogg"],
    ["audio/flac", "flac"],
    ["audio/x-flac", "flac"],
    ["audio/mp4", "m4a"],
    ["audio/aac", "aac"],
    ["audio/aacp", "aac"],
  ];
  for (const [mime, fmt] of byMime) if (type.includes(mime)) return fmt;

  const ext = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
  const byExt: Record<string, AudioFormat> = {
    wav: "wav",
    wave: "wav",
    mp3: "mp3",
    ogg: "ogg",
    oga: "ogg",
    flac: "flac",
    m4a: "m4a",
    aac: "aac",
  };
  return byExt[ext] ?? null;
}

/** MP3 bitrate presets (kbps) for the convert UI; 192 is a safe default. */
export const MP3_BITRATES = [96, 128, 160, 192, 256, 320] as const;

/**
 * Convert any browser-decodable audio file to `targetFormat`, returning the
 * encoded {@link Blob}.
 *
 * WAV/MP3 stay fully native. OGG/FLAC/M4A/AAC decode natively then transcode
 * through ffmpeg.wasm. `onProgress` reports 0..1 (encode and, for the ffmpeg
 * path, core download + transcode).
 *
 * @param opts.bitrate MP3 bitrate in kbps (ignored for other targets).
 */
export async function convertAudio(
  file: File,
  targetFormat: AudioFormat,
  opts: { bitrate?: number } = {},
  onProgress?: ProgressFn,
): Promise<Blob> {
  const buffer = await decodeFile(file);

  if (targetFormat === "wav") return encodeWav(buffer);
  if (targetFormat === "mp3") return encodeMp3(buffer, { bitrate: opts.bitrate }, onProgress);

  // Exotic target: hand ffmpeg a lossless native WAV to transcode from.
  const wav = encodeWav(buffer);
  return encodeViaFfmpeg(wav, targetFormat, onProgress);
}
