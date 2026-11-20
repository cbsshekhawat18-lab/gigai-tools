/**
 * GigAI File Intelligence, shared vocabulary for GigAI Fit and GigAI Verify.
 *
 * This layer owns NO compression or parsing of its own. Every medium is handled
 * by the studio engine that already exists and is already tested:
 *
 *   images     lib/image/engine.ts        (compressImage / resizeImage)
 *   PDFs       lib/pdf/convert.ts         (compressPdf)
 *   video      lib/video-tools/operations (compress, CRF-based)
 *   audio      lib/audio-tools/convert.ts (convertAudio, bitrate)
 *
 * What this layer adds is the part none of them have: a single way to describe a
 * file, a single search that drives any of those engines towards a byte target,
 * and a single honest vocabulary for reporting what the search cost in quality.
 */

/** The five families GigAI Fit and GigAI Verify understand. */
export type FileKind = "image" | "pdf" | "video" | "audio" | "document" | "unknown";

/** What we could learn about the input before touching it. */
export interface SourceInfo {
  kind: FileKind;
  /** Best-guess MIME, from magic bytes where we could read them. */
  mime: string;
  /** Human label, e.g. "JPG Image", "MP4 Video". */
  label: string;
  bytes: number;
  /** Pixel dimensions, for image and video. */
  width?: number;
  height?: number;
  /** Seconds, for audio and video. */
  duration?: number;
  /** Pages, for PDF. */
  pages?: number;
  /** kbps, for audio and video where we can read it. */
  bitrate?: number;
  /** Object URL for a preview; the caller MUST revoke it. */
  previewUrl?: string;
}

/**
 * One encode attempt made by an adapter during the search.
 *
 * `knob` is the value the engine chose, always in [0, 1] and always monotonic:
 * 0 means "smallest file this adapter will produce", 1 means "largest / best".
 * Keeping every adapter on the same scale is what lets one binary search drive
 * images, PDFs, video and audio without knowing anything about codecs.
 */
export interface FitAttempt {
  blob: Blob;
  size: number;
  knob: number;
  /** What this attempt actually did, in user words: "quality 62%, 2560×1920". */
  summary: string;
  /** Structured facts for the before/after table. */
  facts: FitFacts;
}

/** Measurable properties of an output, used for the before/after comparison. */
export interface FitFacts {
  width?: number;
  height?: number;
  /** 0–1 encoder quality, where the medium has one. */
  quality?: number;
  /** kbps, for audio/video. */
  bitrate?: number;
  /** Output MIME, when the adapter changed format. */
  mime?: string;
}

/** Why an adapter refused a file, in words a user can act on. */
export interface FitUnavailable {
  ok: false;
  /** Plain-English reason. Never "something went wrong". */
  reason: string;
  /** The next thing the user could actually do. */
  suggestion?: string;
}

export type FitProbe = ({ ok: true } & { info: SourceInfo }) | FitUnavailable;

/** Progress reported while a single encode runs. */
export type FitStage = (note: string, fraction?: number) => void;

/**
 * A medium-specific driver for the Target Size Engine.
 *
 * The contract that makes the search valid: `encode` MUST be monotonic in
 * `knob`, a higher knob must never produce a smaller file. Every adapter here
 * satisfies that because it maps knob onto exactly one encoder parameter
 * (quality, CRF, bitrate, raster scale) that is itself monotonic.
 */
export interface FitAdapter {
  kind: FileKind;
  /** Inspect without processing. Cheap; runs the moment a file is dropped. */
  probe(file: File): Promise<FitProbe>;
  /** Produce one candidate at the given knob. */
  encode(
    file: File,
    knob: number,
    ctx: { info: SourceInfo; stage: FitStage; signal?: AbortSignal },
  ): Promise<FitAttempt>;
  /**
   * How many encodes the search may run. Images are cheap (8 is nothing);
   * video is minutes per encode, so the budget is far smaller and the engine
   * leans on a size estimate rather than brute search.
   */
  maxAttempts: number;
  /** Rough cost of one encode: drives the UI's expectation-setting copy. */
  speed: "fast" | "slow";
  /** Shown before the run so the user knows what will be traded away. */
  strategy: string;
}

/** How the search ended. Every outcome is reported honestly to the user. */
export type FitOutcome =
  | "hit"          // landed at or under the target
  | "best-effort"  // floor reached; this is the smallest sensible output
  | "already-small"// the original was already under target; nothing done
  | "grew";        // every attempt was larger than the original (rare, reported)

export interface FitResult {
  outcome: FitOutcome;
  blob: Blob;
  size: number;
  targetBytes: number;
  source: SourceInfo;
  facts: FitFacts;
  /** Encodes actually performed: shown in the technical detail panel. */
  attempts: { knob: number; size: number }[];
  /** Plain-English description of what changed, e.g. "Resolution reduced …". */
  changed: string[];
  /** Suggested output filename. */
  name: string;
}

/** Quality verdict shown beside the result. */
export type QualityBand = "excellent" | "noticeable" | "heavy";

export interface QualityVerdict {
  band: QualityBand;
  label: string;
  detail: string;
}

/* ── Size helpers ─────────────────────────────────────────────────────────── */

export const KB = 1024;
export const MB = 1024 * KB;
export const GB = 1024 * MB;

/** Parse "2", "2 MB", "500kb", "1.5 gb" into bytes. Returns null if unusable. */
export function parseSize(input: string, unit: "KB" | "MB" | "GB"): number | null {
  const value = Number.parseFloat(input.replace(/,/g, "").trim());
  if (!Number.isFinite(value) || value <= 0) return null;
  const mult = unit === "KB" ? KB : unit === "GB" ? GB : MB;
  return Math.round(value * mult);
}

/** Bytes → a short human string ("1.96 MB"). */
export function formatSize(bytes: number): string {
  if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(0)} KB`;
  return `${bytes} B`;
}

/** Percentage saved, floored at 0 so a grown file never reads as a saving. */
export function reductionPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.max(0, ((before - after) / before) * 100);
}
