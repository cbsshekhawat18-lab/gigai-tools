/**
 * Video Intelligence, smart frame extraction.
 *
 * Picks frames worth putting in a report instead of sampling on a timer. Three
 * measurable signals decide, all computed from pixels in a canvas:
 *
 *  1. SCENE CHANGE: mean absolute difference against the previous frame's
 *      luma histogram. A slide flip or cut scores high; a talking head barely
 *      moves. This is what "meaningful frame" actually reduces to.
 *  2. SHARPNESS, variance of the Laplacian. Motion-blurred and out-of-focus
 *      frames have low variance and are rejected outright.
 *  3. DUPLICATE, a 64-bit average hash (aHash). Frames within a small Hamming
 *      distance of one already kept are dropped, so a static slide held for two
 *      minutes contributes one image, not forty.
 *
 * NOTE ON SCOPE: this identifies frames that are sharp, distinct and visually
 * eventful. It does NOT know a chart from a whiteboard; recognising *what* is
 * in a frame needs a vision model we don't run. The UI says "detected" and
 * shows the scores rather than claiming comprehension.
 *
 * Everything runs on a <video> + <canvas> in the browser; no ffmpeg needed for
 * frame grabs, and no bytes leave the device.
 */

/** Analysis resolution, small enough to be fast, big enough to be meaningful. */
const SAMPLE_W = 160;
const SAMPLE_H = 90;
/** Below this Laplacian variance a frame reads as blurry. */
const SHARPNESS_FLOOR = 12;
/**
 * aHash Hamming distance at or under which two frames count as duplicates.
 * Raised from 6 after a real report shipped four near-identical shots of the
 * same keyboard: handheld footage jitters enough to clear a tight threshold.
 */
const DUPLICATE_DISTANCE = 10;
/**
 * Minimum luma standard deviation. A frame of a dim keyboard or an unlit wall is
 * sharp and "changed a lot" (the camera moved) yet carries no information, so it
 * would otherwise outrank the slide someone actually wants in the report.
 */
const CONTRAST_FLOOR = 18;

export interface FrameCandidate {
  timeMs: number;
  /** 0–1: how much changed since the previous sampled frame. */
  sceneChange: number;
  /** Variance of the Laplacian; higher is sharper. */
  sharpness: number;
  /** Standard deviation of luma: how much tonal information the frame carries. */
  contrast: number;
  /** 64-bit average hash, as a bit string. */
  hash: string;
  /** Combined pick score, scene change weighted by sharpness. */
  score: number;
}

export interface CapturedFrame extends FrameCandidate {
  /** Full-resolution JPEG data URL, for the report. */
  dataUrl: string;
  width: number;
  height: number;
  /** Text found on this frame by OCR, if it was run. */
  ocrText?: string;
}

export interface ExtractOptions {
  /** How often to sample while scanning, in ms. */
  intervalMs?: number;
  /** Maximum frames to keep. */
  maxFrames?: number;
  /** Always capture at these times (chapter starts), regardless of score. */
  forcedTimes?: number[];
  /** Longest edge of the captured JPEG. */
  captureWidth?: number;
  onProgress?: (fraction: number, label: string) => void;
  signal?: AbortSignal;
}

const DEFAULTS: Required<Omit<ExtractOptions, "onProgress" | "signal" | "forcedTimes">> = {
  intervalMs: 2000,
  maxFrames: 24,
  captureWidth: 1280,
};

/** Grayscale luma from RGBA pixels: the basis for every metric here. */
function toLuma(data: Uint8ClampedArray): Float32Array {
  const luma = new Float32Array(data.length / 4);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    luma[p] = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
  }
  return luma;
}

/** Standard deviation of luma, flat/dark frames score near zero. */
function contrastOf(luma: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < luma.length; i += 1) sum += luma[i]!;
  const mean = sum / luma.length;
  let variance = 0;
  for (let i = 0; i < luma.length; i += 1) variance += (luma[i]! - mean) ** 2;
  return Math.sqrt(variance / luma.length);
}

/** Mean absolute difference between two luma frames, normalised to 0–1. */
function meanAbsDiff(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i]! - b[i]!);
  return sum / a.length / 255;
}

/**
 * Variance of the Laplacian, the standard focus measure. A sharp edge produces
 * a large second derivative; a blurred one flattens it out.
 */
function laplacianVariance(luma: Float32Array, w: number, h: number): number {
  const values: number[] = [];
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const i = y * w + x;
      const lap =
        -4 * luma[i]! + luma[i - 1]! + luma[i + 1]! + luma[i - w]! + luma[i + w]!;
      values.push(lap);
    }
  }
  if (values.length === 0) return 0;
  const mean = values.reduce((n, v) => n + v, 0) / values.length;
  return values.reduce((n, v) => n + (v - mean) ** 2, 0) / values.length;
}

/** 64-bit average hash: 8×8 luma, each bit set when above the mean. */
function averageHash(luma: Float32Array, w: number, h: number): string {
  const cells: number[] = [];
  const cw = w / 8;
  const ch = h / 8;
  for (let by = 0; by < 8; by += 1) {
    for (let bx = 0; bx < 8; bx += 1) {
      let sum = 0;
      let count = 0;
      for (let y = Math.floor(by * ch); y < Math.floor((by + 1) * ch); y += 1) {
        for (let x = Math.floor(bx * cw); x < Math.floor((bx + 1) * cw); x += 1) {
          sum += luma[y * w + x] ?? 0;
          count += 1;
        }
      }
      cells.push(count > 0 ? sum / count : 0);
    }
  }
  const mean = cells.reduce((n, v) => n + v, 0) / cells.length;
  return cells.map((v) => (v > mean ? "1" : "0")).join("");
}

/** Number of differing bits between two hashes. */
export function hammingDistance(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) if (a[i] !== b[i]) d += 1;
  return d;
}

/**
 * Seek and wait for the frame to actually be presented.
 *
 * TWO hang guards (live incident 2026-08-22: "Select key moments" stuck at
 * ~35% forever):
 *  - seeking to (almost) the current position fires NO `seeked` event at all,
 *    so that case resolves immediately;
 *  - any other missed event resolves after a timeout instead of wedging the
 *    whole pipeline - a frame grabbed a moment off-target beats an infinite
 *    spinner every time.
 */
function seekTo(video: HTMLVideoElement, seconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (Math.abs(video.currentTime - seconds) < 0.02 && video.readyState >= 2) {
      resolve();
      return;
    }
    let settled = false;
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      window.clearTimeout(timer);
    };
    const onSeeked = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    const onError = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("The video could not be seeked. It may be corrupt."));
    };
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    }, 5000);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = seconds;
  });
}

/**
 * Scan a video and return the frames worth keeping.
 *
 * Two passes over one <video>: sample on a grid computing metrics, rank, then
 * re-seek to the winners to capture them at full resolution. Sampling small and
 * capturing large keeps the scan fast without compromising report images.
 */
export async function extractKeyFrames(
  src: string,
  durationMs: number,
  options: ExtractOptions = {},
): Promise<CapturedFrame[]> {
  const opts = { ...DEFAULTS, ...options };
  const video = document.createElement("video");
  video.src = src;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("The video could not be read for frame capture."));
  });

  const duration = Number.isFinite(video.duration) ? video.duration : durationMs / 1000;
  if (!duration || duration <= 0) return [];

  const small = document.createElement("canvas");
  small.width = SAMPLE_W;
  small.height = SAMPLE_H;
  const sctx = small.getContext("2d", { willReadFrequently: true });
  if (!sctx) throw new Error("Your browser blocked the canvas needed to read frames.");

  /* Pass 1, measure. */
  const candidates: FrameCandidate[] = [];
  let previous: Float32Array | null = null;
  const stepSeconds = Math.max(0.5, opts.intervalMs / 1000);
  const totalSteps = Math.floor(duration / stepSeconds);

  for (let i = 0; i <= totalSteps; i += 1) {
    if (options.signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const t = Math.min(duration - 0.05, i * stepSeconds);
    await seekTo(video, t);
    sctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H);
    const luma = toLuma(sctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data);

    const sceneChange = previous ? meanAbsDiff(luma, previous) : 1;
    const sharpness = laplacianVariance(luma, SAMPLE_W, SAMPLE_H);
    const contrast = contrastOf(luma);
    candidates.push({
      timeMs: Math.round(t * 1000),
      sceneChange,
      sharpness,
      contrast,
      hash: averageHash(luma, SAMPLE_W, SAMPLE_H),
      // Weight change by BOTH sharpness and tonal range, so neither a blurry cut
      // nor a dark, empty frame can outrank a crisp slide.
      score: sceneChange * Math.min(1, sharpness / 60) * Math.min(1, contrast / 45),
    });
    previous = luma;
    opts.onProgress?.((i / Math.max(1, totalSteps)) * 0.6, "Scanning frames…");
  }

  /* Pick: forced times first, then best-scoring, rejecting blur and dupes. */
  const chosen: FrameCandidate[] = [];
  const accept = (candidate: FrameCandidate, ignoreBlur = false): boolean => {
    if (!ignoreBlur && candidate.sharpness < SHARPNESS_FLOOR) return false;
    if (!ignoreBlur && candidate.contrast < CONTRAST_FLOOR) return false;
    if (chosen.some((k) => hammingDistance(k.hash, candidate.hash) <= DUPLICATE_DISTANCE))
      return false;
    chosen.push(candidate);
    return true;
  };

  for (const time of options.forcedTimes ?? []) {
    const nearest = candidates.reduce((best, c) =>
      Math.abs(c.timeMs - time) < Math.abs(best.timeMs - time) ? c : best,
    );
    // Chapter starts are structurally important, so blur doesn't disqualify
    // them, but a duplicate still does.
    if (nearest) accept(nearest, true);
  }

  for (const candidate of [...candidates].sort((a, b) => b.score - a.score)) {
    if (chosen.length >= opts.maxFrames) break;
    accept(candidate);
  }
  chosen.sort((a, b) => a.timeMs - b.timeMs);

  /* Pass 2: capture the winners at full resolution. */
  const big = document.createElement("canvas");
  const aspect = video.videoHeight / video.videoWidth || 9 / 16;
  big.width = Math.min(opts.captureWidth, video.videoWidth || opts.captureWidth);
  big.height = Math.round(big.width * aspect);
  const bctx = big.getContext("2d");
  if (!bctx) throw new Error("Your browser blocked the canvas needed to capture frames.");

  const captured: CapturedFrame[] = [];
  for (let i = 0; i < chosen.length; i += 1) {
    if (options.signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const frame = chosen[i]!;
    await seekTo(video, frame.timeMs / 1000);
    bctx.drawImage(video, 0, 0, big.width, big.height);
    captured.push({
      ...frame,
      // JPEG at 0.82: visually clean in a report while keeping the embedded
      // data URLs small enough that a 24-image PDF stays manageable.
      dataUrl: big.toDataURL("image/jpeg", 0.82),
      width: big.width,
      height: big.height,
    });
    opts.onProgress?.(0.6 + (i / chosen.length) * 0.4, "Capturing screenshots…");
  }

  video.src = "";
  return captured;
}
