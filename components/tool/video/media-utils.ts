"use client";

/**
 * Small, dependency-free helpers shared across the video UI. Everything here is
 * client-only: it touches `document`, `URL`, and `<video>`. No ffmpeg, no image
 * engine. Probing a clip only needs the browser's own media pipeline, which is
 * instant compared to spinning up the 31 MB wasm core.
 */

/** Metadata read straight off a decoded `<video>` element. */
export interface VideoMeta {
  /** Duration in seconds (may be `Infinity` for some live/streamed sources). */
  duration: number;
  /** Intrinsic pixel width. */
  width: number;
  /** Intrinsic pixel height. */
  height: number;
  /** width / height, or 0 when unknown. */
  aspectRatio: number;
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
 * Format seconds as a clock. Under an hour → `m:ss`; an hour or more → `h:mm:ss`.
 * Pass `showMs` for a trailing `.mmm` (handy on trim handles).
 */
export function formatDuration(seconds: number, showMs = false): string {
  if (!Number.isFinite(seconds) || seconds < 0) return showMs ? "0:00.000" : "0:00";
  const whole = Math.floor(seconds);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const base =
    h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  if (!showMs) return base;
  const ms = Math.round((seconds - whole) * 1000);
  return `${base}.${String(ms).padStart(3, "0")}`;
}

/** Signed percentage-change label, e.g. -64 -> "−64%", 12 -> "+12%". */
export function formatDelta(before: number, after: number): string {
  if (before <= 0) return "—";
  const pct = Math.round(((after - before) / before) * 100);
  if (pct === 0) return "0%";
  // Use a real minus sign for the reduction case so it reads as a saving.
  return pct < 0 ? `−${Math.abs(pct)}%` : `+${pct}%`;
}

/**
 * Probe a video File/Blob for duration + dimensions using an off-DOM `<video>`.
 * Resolves once metadata is available; rejects if the browser can't decode it.
 * The temporary object URL is always revoked.
 */
/**
 * GIFs are images, not videos: a <video> element refuses them, which used to
 * make GIF-to-Video reject its own input format. Probe them as images instead.
 * Chromium's ImageDecoder gives real frame timing; elsewhere we fall back to
 * dimensions with duration 0 (the converter reads timing from the file itself).
 */
async function probeGif(source: Blob): Promise<VideoMeta> {
  // Preferred: ImageDecoder (Chromium) — exact frame count + durations.
  interface GifFrame {
    image: {
      displayWidth: number;
      displayHeight: number;
      duration: number | null;
      close(): void;
    };
  }
  interface GifDecoder {
    tracks: { ready: Promise<void>; selectedTrack: { frameCount: number } | null };
    decode(opts: { frameIndex: number }): Promise<GifFrame>;
    close?(): void;
  }
  interface GifDecoderCtor {
    new (init: { data: ArrayBuffer; type: string }): GifDecoder;
    isTypeSupported?(type: string): Promise<boolean>;
  }
  try {
    const ID = (globalThis as unknown as { ImageDecoder?: GifDecoderCtor }).ImageDecoder;
    if (ID && (await ID.isTypeSupported?.("image/gif"))) {
      const decoder = new ID({ data: await source.arrayBuffer(), type: "image/gif" });
      await decoder.tracks.ready;
      const track = decoder.tracks.selectedTrack;
      const frames = track?.frameCount ?? 1;
      const first = await decoder.decode({ frameIndex: 0 });
      const { displayWidth: width, displayHeight: height, duration } = first.image;
      first.image.close();
      // duration is per-frame in microseconds; approximate total from frame 0.
      const total = duration ? (duration / 1e6) * frames : 0;
      decoder.close?.();
      return {
        duration: total,
        width,
        height,
        aspectRatio: height > 0 ? width / height : 0,
      };
    }
  } catch {
    /* fall through to the <img> path */
  }
  const bitmap = await createImageBitmap(source);
  const meta: VideoMeta = {
    duration: 0,
    width: bitmap.width,
    height: bitmap.height,
    aspectRatio: bitmap.height > 0 ? bitmap.width / bitmap.height : 0,
  };
  bitmap.close();
  return meta;
}

export function probeVideo(source: Blob): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Video probing requires a browser environment."));
      return;
    }
    if (
      source.type === "image/gif" ||
      (source instanceof File && /\.gif$/i.test(source.name))
    ) {
      probeGif(source).then(resolve, reject);
      return;
    }
    const url = URL.createObjectURL(source);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const meta: VideoMeta = {
        duration: video.duration,
        width,
        height,
        aspectRatio: height > 0 ? width / height : 0,
      };
      cleanup();
      resolve(meta);
    };
    video.onerror = () => {
      cleanup();
      reject(
        new Error(
          "Couldn't read that file; it may be a codec your browser can't decode.",
        ),
      );
    };

    video.src = url;
  });
}

/**
 * Grab a single frame as a data URL by seeking a `<video>` and painting it to a
 * canvas. No ffmpeg needed. `maxWidth` scales the thumbnail down for cheap
 * timeline scrubbing. Resolves `null` if the frame can't be drawn (e.g. tainted
 * or undecodable), so callers can fall back gracefully.
 */
export function captureFrame(
  source: Blob,
  timeSeconds: number,
  maxWidth = 160,
): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }
    const url = URL.createObjectURL(source);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.crossOrigin = "anonymous";

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
    };
    const fail = () => {
      cleanup();
      resolve(null);
    };

    video.onloadedmetadata = () => {
      const t = Math.min(Math.max(timeSeconds, 0), Math.max(video.duration - 0.05, 0));
      video.currentTime = Number.isFinite(t) ? t : 0;
    };
    video.onseeked = () => {
      try {
        const scale = video.videoWidth > 0 ? Math.min(1, maxWidth / video.videoWidth) : 1;
        const w = Math.max(1, Math.round(video.videoWidth * scale));
        const h = Math.max(1, Math.round(video.videoHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return fail();
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        cleanup();
        resolve(dataUrl);
      } catch {
        fail();
      }
    };
    video.onerror = fail;

    video.src = url;
  });
}
