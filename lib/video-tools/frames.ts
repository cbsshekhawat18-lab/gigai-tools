/**
 * GigAI Tools, instant frame / thumbnail extraction (NO ffmpeg).
 *
 * Grabbing a still is a `<video>` seek + a `<canvas>.drawImage` away, which is
 * orders of magnitude faster (and lighter) than spinning up the WASM core. Use
 * this for thumbnails, posters and frame grids; reserve ffmpeg for real
 * transcoding.
 *
 * Client-only: needs the DOM (HTMLVideoElement / HTMLCanvasElement).
 */

/** A single extracted frame. */
export interface ExtractedFrame {
  /** Source timestamp of the frame, in seconds. */
  time: number;
  /** Encoded image bytes. */
  blob: Blob;
  /** Object URL for immediate preview, caller should revokeObjectURL later. */
  url: string;
  width: number;
  height: number;
}

/** Output image format for grabbed frames. */
export type FrameFormat = "png" | "jpeg";

export interface FrameOptions {
  /** Image encoding (default "png"; use "jpeg" for smaller thumbnails). */
  format?: FrameFormat;
  /** JPEG quality 0..1 (ignored for png; default 0.92). */
  quality?: number;
  /** Downscale so the longest side is at most this many px (keeps aspect). */
  maxSize?: number;
}

const MIME: Record<FrameFormat, string> = { png: "image/png", jpeg: "image/jpeg" };

/**
 * Load a File/Blob into a detached, muted `<video>` ready for frame seeking.
 * Resolves once metadata (and enough data to draw) is available.
 */
function createVideoElement(file: Blob): Promise<{ video: HTMLVideoElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    // Some browsers need these to decode frames off-DOM without user gesture.
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const cleanup = () => {
      video.onloadeddata = null;
      video.onerror = null;
    };
    video.onloadeddata = () => {
      cleanup();
      resolve({ video, url });
    };
    video.onerror = () => {
      cleanup();
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode this video. The format may be unsupported by your browser."));
    };
    video.src = url;
  });
}

/** Seek the video to `time` (clamped to its duration) and await the frame. */
function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const duration = Number.isFinite(video.duration) ? video.duration : time;
    // Nudge just inside the end so the last frame is actually decodable.
    const target = Math.min(Math.max(0, time), Math.max(0, duration - 0.001));
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      reject(new Error("Failed to seek to the requested time."));
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = target;
  });
}

/** Compute drawn dimensions, honoring an optional longest-side cap. */
function fitSize(w: number, h: number, maxSize?: number): { w: number; h: number } {
  if (!maxSize || maxSize <= 0) return { w, h };
  const longest = Math.max(w, h);
  if (longest <= maxSize) return { w, h };
  const scale = maxSize / longest;
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

/** Draw the video's current frame to a Blob at the given options. */
function drawFrame(video: HTMLVideoElement, opts: FrameOptions): Promise<{ blob: Blob; width: number; height: number }> {
  const format = opts.format ?? "png";
  const srcW = video.videoWidth || 1;
  const srcH = video.videoHeight || 1;
  const { w, h } = fitSize(srcW, srcH, opts.maxSize);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("No 2D canvas context available."));
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(video, 0, 0, w, h);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve({ blob, width: w, height: h }) : reject(new Error("Failed to encode frame."))),
      MIME[format],
      format === "jpeg" ? (opts.quality ?? 0.92) : undefined,
    );
  });
}

/**
 * Grab a single frame at `timeSec` seconds. Fast; no ffmpeg.
 */
export async function thumbnailAt(file: Blob, timeSec: number, opts: FrameOptions = {}): Promise<ExtractedFrame> {
  const { video, url } = await createVideoElement(file);
  try {
    await seekTo(video, timeSec);
    const { blob, width, height } = await drawFrame(video, opts);
    return { time: timeSec, blob, url: URL.createObjectURL(blob), width, height };
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
  }
}

/**
 * A "poster" still for a video, a representative frame near the start (default
 * 1 s in, or 10% of the way through for very short clips).
 */
export async function posterFromVideo(file: Blob, opts: FrameOptions = {}): Promise<ExtractedFrame> {
  const { video, url } = await createVideoElement(file);
  try {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const at = duration > 0 ? Math.min(1, duration * 0.1) : 0;
    await seekTo(video, at);
    const { blob, width, height } = await drawFrame(video, opts);
    return { time: at, blob, url: URL.createObjectURL(blob), width, height };
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
  }
}

export interface ExtractFramesOptions extends FrameOptions {
  /** Sample this many frames per second across the whole clip. */
  fps?: number;
  /** Explicit list of timestamps (seconds) to grab. Overrides `fps`. */
  times?: number[];
  /** Progress reporter, 0..1. */
  onProgress?: (fraction: number) => void;
}

/**
 * Extract multiple frames, either at an explicit list of `times`, or evenly at
 * a given `fps` across the whole clip. Seeks are serialized (one decode at a
 * time) for reliability across browsers. NO ffmpeg.
 */
export async function extractFrames(file: Blob, options: ExtractFramesOptions): Promise<ExtractedFrame[]> {
  const { video, url } = await createVideoElement(file);
  try {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;

    let times: number[];
    if (options.times && options.times.length > 0) {
      times = options.times;
    } else {
      const fps = options.fps && options.fps > 0 ? options.fps : 1;
      const step = 1 / fps;
      times = [];
      for (let t = 0; t < Math.max(step, duration); t += step) times.push(t);
    }

    const frames: ExtractedFrame[] = [];
    for (let i = 0; i < times.length; i++) {
      const t = times[i] ?? 0;
      await seekTo(video, t);
      const { blob, width, height } = await drawFrame(video, options);
      frames.push({ time: t, blob, url: URL.createObjectURL(blob), width, height });
      options.onProgress?.((i + 1) / times.length);
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
  }
}
