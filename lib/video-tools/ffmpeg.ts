/**
 * GigAI Tools, in-browser video engine (ffmpeg.wasm bootstrap).
 *
 * A single, lazily-loaded FFmpeg instance shared by every video tool. The heavy
 * `@ffmpeg/ffmpeg` package and its ~31 MB WASM core are pulled in ONLY the first
 * time a tool actually runs (never at page load) via `import()` and a
 * same-origin `toBlobURL()` fetch of the self-hosted core in `public/ffmpeg/`.
 *
 * SINGLE-THREADED core only: no `core-mt`, no `SharedArrayBuffer`, so the site
 * needs no cross-origin-isolation / COEP headers (which would break AdSense).
 *
 * Client-only: this touches Workers and Blob URLs and must run in a browser.
 * Honest limits: ffmpeg.wasm is far slower than native and memory-bound. Keep
 * inputs loose-capped (a few hundred MB at most) and always surface progress.
 */

// Types are import-time-only (erased at build), so they don't pull the runtime
// bundle in. The concrete class is loaded lazily inside `loadFfmpeg()`.
import type { FFmpeg } from "@ffmpeg/ffmpeg";

/** Progress reporter: `fraction` is 0..1, best-effort (ffmpeg estimates it). */
export type ProgressFn = (fraction: number, status?: string) => void;

/** A named binary input to stage into ffmpeg's virtual filesystem. */
export interface FfmpegInput {
  /** Filename inside ffmpeg's MEMFS (e.g. "in.mp4"); also drives extension. */
  name: string;
  /** Raw bytes of the file. */
  data: Uint8Array;
}

/** Self-hosted, same-origin core assets (no CDN, no cross-origin isolation). */
const CORE_JS_URL = "/ffmpeg/ffmpeg-core.js";
const CORE_WASM_URL = "/ffmpeg/ffmpeg-core.wasm";

// Module-level singletons. `instance` is the loaded FFmpeg; `loadPromise`
// dedupes concurrent first-load calls so we only fetch the core once.
let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

/** True once the core is fully loaded and ready to `run()`. */
export function isLoaded(): boolean {
  return instance !== null && instance.loaded;
}

/**
 * Load (or return the already-loaded) shared FFmpeg singleton.
 *
 * The optional `onProgress` reports download progress of the ~31 MB WASM core
 * (0..1) on the very first load; on subsequent calls it resolves immediately.
 */
export async function loadFfmpeg(onProgress?: ProgressFn): Promise<FFmpeg> {
  if (instance && instance.loaded) return instance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    // Lazy runtime imports. This is where the heavy code actually lands.
    const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
      import("@ffmpeg/ffmpeg"),
      import("@ffmpeg/util"),
    ]);

    const ff = new FFmpeg();

    // toBlobURL streams the same-origin asset and (when Content-Length is
    // present) reports 0..1 download progress for the big WASM file.
    onProgress?.(0, "Downloading video engine…");
    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(CORE_JS_URL, "text/javascript"),
      toBlobURL(CORE_WASM_URL, "application/wasm", true, (e) => {
        if (e.total > 0) onProgress?.(e.received / e.total, "Downloading video engine…");
      }),
    ]);

    onProgress?.(1, "Starting video engine…");
    // No `classWorkerURL` / `workerLoadURL`: the worker is bundled by the
    // package. No `mt` core → no SharedArrayBuffer requirement.
    await ff.load({ coreURL, wasmURL });

    instance = ff;
    return ff;
  })();

  try {
    return await loadPromise;
  } catch (err) {
    // Reset so a later retry can attempt a fresh load.
    loadPromise = null;
    instance = null;
    throw err;
  }
}

/**
 * Stage one or more inputs, execute an ffmpeg command, read back a single
 * output file, then clean the virtual filesystem: returning the result Blob.
 *
 * @param args     ffmpeg CLI args (input/output filenames must match those
 *                 staged from `input` and the given `outName`).
 * @param input    One `{ name, data }` or an array of them (e.g. for concat).
 * @param outName  Output filename produced by `args` (read back as the Blob).
 * @param onProgress 0..1 transcode progress, wired from ffmpeg's estimate.
 * @param mimeType Optional MIME for the returned Blob (inferred from ext else).
 */
export async function run(
  args: string[],
  input: FfmpegInput | FfmpegInput[],
  outName: string,
  onProgress?: ProgressFn,
  mimeType?: string,
): Promise<Blob> {
  const ff = await loadFfmpeg(onProgress);
  const inputs = Array.isArray(input) ? input : [input];

  // Bridge ffmpeg's progress events to the caller. `progress` is 0..1 but can
  // briefly exceed 1 or report NaN, clamp defensively.
  const handler = (e: { progress: number; time: number }) => {
    const p = Number.isFinite(e.progress) ? Math.min(1, Math.max(0, e.progress)) : 0;
    onProgress?.(p, "Processing…");
  };
  ff.on("progress", handler);

  const written: string[] = [];
  try {
    for (const f of inputs) {
      await ff.writeFile(f.name, f.data);
      written.push(f.name);
    }

    const code = await ff.exec(args);
    if (code !== 0) throw new Error(`ffmpeg exited with code ${code}.`);

    const data = await ff.readFile(outName);
    // readFile returns Uint8Array for binary reads (no encoding passed).
    if (typeof data === "string") {
      throw new Error("Unexpected text output from ffmpeg.");
    }

    onProgress?.(1, "Done.");
    // Copy into a fresh, non-resizable ArrayBuffer so the Blob owns its bytes
    // independent of ffmpeg's heap (which we free below via deleteFile).
    const bytes = new Uint8Array(data.byteLength);
    bytes.set(data);
    return new Blob([bytes], { type: mimeType ?? guessMime(outName) });
  } finally {
    ff.off("progress", handler);
    // Best-effort cleanup. Never let teardown mask the real error/result.
    for (const name of [...written, outName]) {
      try {
        await ff.deleteFile(name);
      } catch {
        /* file may not exist (e.g. exec failed before output): ignore. */
      }
    }
  }
}

/** Guess an output MIME from a filename extension (loose, best-effort). */
function guessMime(name: string): string {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  const map: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    mkv: "video/x-matroska",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    gif: "image/gif",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    aac: "audio/aac",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };
  return map[ext] ?? "application/octet-stream";
}

/** Exposed for tools that build custom pipelines and need MIME inference. */
export { guessMime };
