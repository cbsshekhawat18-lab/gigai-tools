/**
 * GigAI Tools, lightweight video metadata probe.
 *
 * The fast path uses a throwaway `<video>` element to read duration and pixel
 * dimensions (no ffmpeg, near-instant). Codec / bitrate aren't exposed by the
 * HTMLMediaElement API, so those are best-effort and only attempted through
 * ffmpeg when the caller explicitly opts in (`deep: true`): since that pulls
 * the ~31 MB WASM core.
 *
 * Client-only: needs the DOM.
 */

export interface VideoMetadata {
  /** Duration in seconds (NaN-safe; 0 if the browser couldn't determine it). */
  durationSec: number;
  /** Intrinsic pixel width. */
  width: number;
  /** Intrinsic pixel height. */
  height: number;
  /** width / height (0 if height is 0). */
  aspectRatio: number;
  /** "16:9"-style simplified ratio label, best-effort. */
  aspectLabel: string;
  /** File size in bytes. */
  sizeBytes: number;
  /** MIME type reported by the File/Blob (may be empty). */
  mimeType: string;
  /** Whether the browser reports an audio track (best-effort, may be undefined). */
  hasAudio?: boolean;
  /** Deep fields, only present when `deep: true` and ffmpeg parsed them. */
  videoCodec?: string;
  audioCodec?: string;
  /** Overall bitrate in bits/sec, if derivable. */
  bitrate?: number;
  /** Frame rate (fps), if ffmpeg reported it. */
  fps?: number;
}

/** Greatest common divisor for aspect-ratio simplification. */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Best-effort "W:H" label from pixel dimensions. */
function aspectLabelOf(w: number, h: number): string {
  if (w <= 0 || h <= 0) return "—";
  const g = gcd(w, h) || 1;
  const rw = w / g;
  const rh = h / g;
  // Collapse absurd ratios (odd encodes) to a decimal fallback.
  if (rw > 64 || rh > 64) return `${(w / h).toFixed(2)}:1`;
  return `${rw}:${rh}`;
}

/**
 * Detect an audio track without decoding, best-effort across browsers using
 * the non-standard `mozHasAudio` / `webkitAudioDecodedByteCount` hints. Returns
 * `undefined` when it genuinely can't tell.
 */
function detectAudio(video: HTMLVideoElement): boolean | undefined {
  const v = video as HTMLVideoElement & {
    mozHasAudio?: boolean;
    webkitAudioDecodedByteCount?: number;
    audioTracks?: { length: number };
  };
  if (typeof v.mozHasAudio === "boolean") return v.mozHasAudio;
  if (typeof v.webkitAudioDecodedByteCount === "number") return v.webkitAudioDecodedByteCount > 0;
  if (v.audioTracks && typeof v.audioTracks.length === "number") return v.audioTracks.length > 0;
  return undefined;
}

/**
 * Read basic metadata via a temporary `<video>` element. Fast, no ffmpeg.
 *
 * Pass `{ deep: true }` to additionally attempt codec/bitrate/fps extraction by
 * running ffmpeg (loads the WASM core). Deep parsing is best-effort: if it
 * fails, the basic fields are still returned.
 */
export async function getMetadata(file: File | Blob, options: { deep?: boolean } = {}): Promise<VideoMetadata> {
  const base = await readBasicMetadata(file);
  if (!options.deep) return base;
  try {
    const deep = await readDeepMetadata(file);
    return { ...base, ...deep };
  } catch {
    // Deep probe is optional. Never fail the whole call over it.
    return base;
  }
}

/** The instant, DOM-only path. */
function readBasicMetadata(file: File | Blob): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    const finish = () => {
      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      const durationSec = Number.isFinite(video.duration) ? video.duration : 0;
      const meta: VideoMetadata = {
        durationSec,
        width,
        height,
        aspectRatio: height > 0 ? width / height : 0,
        aspectLabel: aspectLabelOf(width, height),
        sizeBytes: file.size,
        mimeType: file.type || "",
        hasAudio: detectAudio(video),
      };
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
      resolve(meta);
    };

    video.onloadedmetadata = finish;
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this video's metadata. The format may be unsupported by your browser."));
    };
    video.src = url;
  });
}

/**
 * Best-effort deep probe via ffmpeg. ffmpeg has no JSON info mode in this build,
 * so we parse the stderr banner it prints when given no output. We capture logs,
 * run `-i <file>` (which "fails" by design with no output specified), then mine
 * the standard "Stream #0:0 Video: h264 ... 1920x1080 ... 30 fps" lines.
 */
async function readDeepMetadata(file: File | Blob): Promise<Partial<VideoMetadata>> {
  const [{ loadFfmpeg }, { fetchFile }] = await Promise.all([
    import("./ffmpeg"),
    import("@ffmpeg/util"),
  ]);
  const ff = await loadFfmpeg();

  const logs: string[] = [];
  const collect = (e: { message: string }) => logs.push(e.message);
  ff.on("log", collect);

  const inName = `probe_${Date.now()}.bin`;
  try {
    await ff.writeFile(inName, await fetchFile(file));
    // No output file → ffmpeg prints the stream banner then exits non-zero.
    // We deliberately ignore the exit code and parse the captured log.
    await ff.exec(["-i", inName]).catch(() => 1);
  } finally {
    ff.off("log", collect);
    try {
      await ff.deleteFile(inName);
    } catch {
      /* ignore */
    }
  }

  return parseFfmpegBanner(logs.join("\n"));
}

/** Parse ffmpeg's human-readable stream banner into structured fields. */
export function parseFfmpegBanner(text: string): Partial<VideoMetadata> {
  const out: Partial<VideoMetadata> = {};

  const videoLine = /Stream #\d+:\d+.*Video:\s*([a-zA-Z0-9_]+)/.exec(text);
  if (videoLine?.[1]) out.videoCodec = videoLine[1];

  const audioLine = /Stream #\d+:\d+.*Audio:\s*([a-zA-Z0-9_]+)/.exec(text);
  if (audioLine?.[1]) out.audioCodec = audioLine[1];

  const fpsMatch = /([\d.]+)\s*fps/.exec(text);
  if (fpsMatch?.[1]) {
    const fps = Number.parseFloat(fpsMatch[1]);
    if (Number.isFinite(fps)) out.fps = fps;
  }

  const bitrateMatch = /bitrate:\s*([\d]+)\s*kb\/s/.exec(text);
  if (bitrateMatch?.[1]) {
    const kb = Number.parseInt(bitrateMatch[1], 10);
    if (Number.isFinite(kb)) out.bitrate = kb * 1000;
  }

  return out;
}
