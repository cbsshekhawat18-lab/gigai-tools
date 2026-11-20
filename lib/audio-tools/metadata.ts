/**
 * GigAI Tools: audio metadata probe.
 *
 * Decodes a file to read exact duration/sample-rate/channels, and combines that
 * with file size/type for a rounded picture (including an honest, ESTIMATED
 * average bitrate: computed from bytes/duration, not read from the container).
 *
 * Client-only.
 */

import { decodeFile } from "./context";

export interface AudioMetadata {
  /** Duration in seconds (exact, from the decoded buffer). */
  duration: number;
  /** Sample rate in Hz. */
  sampleRate: number;
  /** Channel count (1 = mono, 2 = stereo, …). */
  channels: number;
  /**
   * ESTIMATED average bitrate in kbps (fileBytes*8 / duration / 1000). This is
   * an approximation for compressed formats and meaningless for raw WAV; treat
   * it as a ballpark, not a container-reported value.
   */
  bitrateEstimate: number;
  /** File size in bytes. */
  size: number;
  /** File MIME type (may be empty if the OS didn't set one). */
  type: string;
  /** Original file name. */
  name: string;
}

/** Format seconds as `m:ss` (or `h:mm:ss` past an hour) for UI display. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

/**
 * Probe a file for its audio metadata. Decodes via the Web Audio API (so it
 * only works for browser-decodable formats) and derives the bitrate estimate
 * from size and duration.
 */
export async function getAudioMetadata(file: File): Promise<AudioMetadata> {
  const buffer = await decodeFile(file);
  const duration = buffer.duration;
  const bitrateEstimate =
    duration > 0 ? Math.round((file.size * 8) / duration / 1000) : 0;
  return {
    duration,
    sampleRate: buffer.sampleRate,
    channels: buffer.numberOfChannels,
    bitrateEstimate,
    size: file.size,
    type: file.type,
    name: file.name,
  };
}
