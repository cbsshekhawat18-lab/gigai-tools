/**
 * GigAI Tools: video operations (ffmpeg command builders + runners).
 *
 * Every operation returns a uniform `OpResult`:
 *   { ok: true, blob, outName }  |  { ok: false, error }
 * so tool UIs never have to try/catch; they branch on `ok`.
 *
 * All heavy work funnels through `lib/video-tools/ffmpeg.ts` (lazy WASM core,
 * single-threaded, self-hosted). Inputs are read to bytes with `@ffmpeg/util`'s
 * `fetchFile`, which is also lazy-imported here.
 *
 * Codec choices favor broad playback: H.264 + AAC in MP4, VP9 + Opus in WebM.
 * Honest limits: this is WASM ffmpeg: slower than native and memory-bound.
 * Keep inputs loosely under a few hundred MB and always show progress.
 *
 * Client-only.
 */

import { run, guessMime, type ProgressFn, type FfmpegInput } from "./ffmpeg";

/** Uniform result shape for every operation. */
export type OpResult =
  | { ok: true; blob: Blob; outName: string }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Read a File/Blob into ffmpeg-ready bytes (lazy `@ffmpeg/util`). */
async function toInput(file: Blob, name: string): Promise<FfmpegInput> {
  const { fetchFile } = await import("@ffmpeg/util");
  return { name, data: await fetchFile(file) };
}

/** Lowercased extension of a filename (no dot), or "" if none. */
function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/** Best-effort original name from a File; falls back to a generic label. */
function nameOf(file: Blob, fallback: string): string {
  const n = (file as File).name;
  return typeof n === "string" && n.length > 0 ? n : fallback;
}

/** Strip extension and sanitize to a safe base for output filenames. */
function baseName(name: string): string {
  const noExt = name.replace(/\.[^.]+$/, "");
  const cleaned = noExt.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return cleaned || "video";
}

/** Wrap a `run()` call into an OpResult, converting throws into errors. */
async function execute(
  args: string[],
  input: FfmpegInput | FfmpegInput[],
  outName: string,
  onProgress?: ProgressFn,
): Promise<OpResult> {
  try {
    const blob = await run(args, input, outName, onProgress, guessMime(outName));
    return { ok: true, blob, outName };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Video processing failed.";
    return { ok: false, error: message };
  }
}

/** Even-dimension enforcement filter (H.264/VP9 require even width & height). */
const EVEN_SCALE = "scale=trunc(iw/2)*2:trunc(ih/2)*2";

/** Video/audio codec args for a target container extension. */
function codecArgs(ext: string): string[] {
  switch (ext) {
    case "webm":
      return ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "32", "-c:a", "libopus"];
    case "mkv":
    case "mov":
    case "mp4":
      return ["-c:v", "libx264", "-preset", "medium", "-crf", "23", "-c:a", "aac", "-pixel_format", "yuv420p"];
    default:
      return ["-c:v", "libx264", "-preset", "medium", "-crf", "23", "-c:a", "aac"];
  }
}

// ---------------------------------------------------------------------------
// Compress
// ---------------------------------------------------------------------------

export interface CompressOptions {
  /** x264/x265 CRF: lower = better quality/bigger file. Sensible range 18–32. */
  crf?: number;
  /** Convenience alias: "high" | "medium" | "low" maps to a CRF. */
  quality?: "high" | "medium" | "low";
  /** x264 preset (speed/size tradeoff). Default "medium". */
  preset?: "ultrafast" | "veryfast" | "fast" | "medium" | "slow" | "slower";
}

function crfFromQuality(q?: "high" | "medium" | "low"): number {
  if (q === "high") return 20;
  if (q === "low") return 30;
  return 25; // medium / default
}

/** Re-encode H.264 with a CRF to shrink file size. Container kept as MP4. */
export async function compress(file: Blob, opts: CompressOptions = {}, onProgress?: ProgressFn): Promise<OpResult> {
  const src = nameOf(file, "input.mp4");
  const inName = `in.${extOf(src) || "mp4"}`;
  const outName = `${baseName(src)}-compressed.mp4`;
  const crf = opts.crf ?? crfFromQuality(opts.quality);
  const preset = opts.preset ?? "medium";
  const input = await toInput(file, inName);
  const args = [
    "-i", inName,
    "-c:v", "libx264",
    "-preset", preset,
    "-crf", String(crf),
    "-vf", EVEN_SCALE,
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    outName,
  ];
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Convert format
// ---------------------------------------------------------------------------

/** Transcode into a different container/codec set (mp4, webm, mkv, mov…). */
export async function convertFormat(file: Blob, targetExt: string, onProgress?: ProgressFn): Promise<OpResult> {
  const ext = targetExt.replace(/^\./, "").toLowerCase();
  const src = nameOf(file, "input");
  const inName = `in.${extOf(src) || "mp4"}`;
  const outName = `${baseName(src)}.${ext}`;
  const input = await toInput(file, inName);
  const args = ["-i", inName, ...codecArgs(ext), "-vf", EVEN_SCALE, "-movflags", "+faststart", outName];
  // +faststart only valid for mp4/mov; harmless elsewhere but drop for webm/mkv.
  if (ext === "webm" || ext === "mkv") args.splice(args.indexOf("-movflags"), 2);
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Trim
// ---------------------------------------------------------------------------

/**
 * Keep the segment from `startSec` to `endSec`. Re-encodes (accurate cuts) for
 * MP4; uses the same codec family as the source container.
 */
export async function trim(file: Blob, startSec: number, endSec: number, onProgress?: ProgressFn): Promise<OpResult> {
  if (endSec <= startSec) return { ok: false, error: "End time must be after start time." };
  const src = nameOf(file, "input.mp4");
  const ext = extOf(src) || "mp4";
  const inName = `in.${ext}`;
  const outName = `${baseName(src)}-trimmed.${ext}`;
  const duration = endSec - startSec;
  const input = await toInput(file, inName);
  const args = [
    "-ss", String(startSec),
    "-i", inName,
    "-t", String(duration),
    ...codecArgs(ext),
    outName,
  ];
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Merge (concat)
// ---------------------------------------------------------------------------

/**
 * Concatenate clips in order. Because sources may differ in codec/resolution,
 * we normalize each to a common H.264/AAC 30fps baseline via the concat filter,
 * which is robust (vs. the fragile demuxer concat that needs identical codecs).
 */
export async function merge(files: Blob[], onProgress?: ProgressFn): Promise<OpResult> {
  if (files.length < 2) return { ok: false, error: "Select at least two videos to merge." };
  const inputs: FfmpegInput[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (!f) continue;
    inputs.push(await toInput(f, `in${i}.${extOf(nameOf(f, "v.mp4")) || "mp4"}`));
  }
  const outName = "merged.mp4";

  // Build: -i in0 -i in1 ... -filter_complex "[0:v]...[0:a]...concat=n=N:v=1:a=1"
  const args: string[] = [];
  for (const inp of inputs) args.push("-i", inp.name);

  const n = inputs.length;
  let filter = "";
  const labels: string[] = [];
  for (let i = 0; i < n; i++) {
    // Normalize video to 1280x720 (pad to keep aspect) + reset PTS; audio to
    // stereo 44.1k. This makes concat safe across mismatched inputs.
    filter += `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p[v${i}];`;
    filter += `[${i}:a]aformat=sample_rates=44100:channel_layouts=stereo,asetpts=PTS-STARTPTS[a${i}];`;
    labels.push(`[v${i}][a${i}]`);
  }
  filter += `${labels.join("")}concat=n=${n}:v=1:a=1[outv][outa]`;

  args.push(
    "-filter_complex", filter,
    "-map", "[outv]",
    "-map", "[outa]",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "23",
    "-c:a", "aac",
    "-movflags", "+faststart",
    outName,
  );
  return execute(args, inputs, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Split
// ---------------------------------------------------------------------------

export interface SplitOptions {
  /** Cut into consecutive chunks of this many seconds each. */
  everySec?: number;
  /** Or explicit [start, end] ranges (seconds) to extract. */
  ranges?: Array<[number, number]>;
}

export interface SplitResult {
  ok: boolean;
  /** One OpResult per produced segment (only present when ok). */
  segments?: Array<{ blob: Blob; outName: string }>;
  error?: string;
}

/**
 * Split a video into multiple files, either fixed-length chunks (`everySec`)
 * or explicit `ranges`. Returns all segments (each re-encoded for clean cuts).
 * Unlike single-output ops this returns a `SplitResult` with a segment array.
 */
export async function split(file: Blob, opts: SplitOptions, onProgress?: ProgressFn): Promise<SplitResult> {
  const src = nameOf(file, "input.mp4");
  const ext = extOf(src) || "mp4";
  const inName = `in.${ext}`;
  const base = baseName(src);

  let ranges: Array<[number, number]>;
  if (opts.ranges && opts.ranges.length > 0) {
    ranges = opts.ranges;
  } else if (opts.everySec && opts.everySec > 0) {
    // We need the duration to chunk. Probe it cheaply via a <video>.
    const { getMetadata } = await import("./probe");
    const meta = await getMetadata(file);
    const dur = meta.durationSec;
    if (!dur || dur <= 0) return { ok: false, error: "Could not determine video duration for splitting." };
    ranges = [];
    for (let t = 0; t < dur; t += opts.everySec) ranges.push([t, Math.min(t + opts.everySec, dur)]);
  } else {
    return { ok: false, error: "Provide either a chunk length or explicit ranges." };
  }

  const input = await toInput(file, inName);
  const segments: Array<{ blob: Blob; outName: string }> = [];
  try {
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      if (!range) continue;
      const [start, end] = range;
      const outName = `${base}-part${i + 1}.${ext}`;
      const args = ["-ss", String(start), "-i", inName, "-t", String(end - start), ...codecArgs(ext), outName];
      const blob = await run(args, input, outName, (p) => onProgress?.((i + p) / ranges.length), guessMime(outName));
      segments.push({ blob, outName });
    }
    return { ok: true, segments };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Splitting failed." };
  }
}

// ---------------------------------------------------------------------------
// Crop
// ---------------------------------------------------------------------------

export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Crop a rectangular region (pixels). */
export async function crop(file: Blob, rect: CropRect, onProgress?: ProgressFn): Promise<OpResult> {
  const src = nameOf(file, "input.mp4");
  const ext = extOf(src) || "mp4";
  const inName = `in.${ext}`;
  const outName = `${baseName(src)}-cropped.${ext}`;
  const input = await toInput(file, inName);
  const w = Math.max(2, Math.round(rect.w / 2) * 2);
  const h = Math.max(2, Math.round(rect.h / 2) * 2);
  const args = [
    "-i", inName,
    "-vf", `crop=${w}:${h}:${Math.round(rect.x)}:${Math.round(rect.y)}`,
    ...codecArgs(ext),
    outName,
  ];
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Rotate
// ---------------------------------------------------------------------------

/** Rotate by 90/180/270 degrees (clockwise). Other values snap to nearest. */
export async function rotate(file: Blob, deg: number, onProgress?: ProgressFn): Promise<OpResult> {
  const src = nameOf(file, "input.mp4");
  const ext = extOf(src) || "mp4";
  const inName = `in.${ext}`;
  const outName = `${baseName(src)}-rotated.${ext}`;
  const input = await toInput(file, inName);

  const norm = ((Math.round(deg / 90) * 90) % 360 + 360) % 360;
  let vf: string;
  if (norm === 90) vf = "transpose=1";
  else if (norm === 180) vf = "transpose=2,transpose=2";
  else if (norm === 270) vf = "transpose=2";
  else vf = "null"; // 0° - pass-through re-encode

  const args = ["-i", inName, "-vf", vf, ...codecArgs(ext), outName];
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Change speed
// ---------------------------------------------------------------------------

/**
 * Speed the clip up or down by `factor` (e.g. 2 = 2× faster, 0.5 = half speed).
 * Adjusts both video (setpts) and audio (atempo, chained to cover 0.5–100×).
 */
export async function changeSpeed(file: Blob, factor: number, onProgress?: ProgressFn): Promise<OpResult> {
  if (!(factor > 0)) return { ok: false, error: "Speed factor must be greater than 0." };
  const src = nameOf(file, "input.mp4");
  const ext = extOf(src) || "mp4";
  const inName = `in.${ext}`;
  const outName = `${baseName(src)}-${factor}x.${ext}`;
  const input = await toInput(file, inName);

  // atempo accepts 0.5–2.0 per instance; chain to reach the requested factor.
  const atempo = buildAtempoChain(factor);
  const args = [
    "-i", inName,
    "-filter_complex",
    `[0:v]setpts=${(1 / factor).toFixed(6)}*PTS[v];[0:a]${atempo}[a]`,
    "-map", "[v]",
    "-map", "[a]",
    ...codecArgs(ext),
    outName,
  ];
  return execute(args, input, outName, onProgress);
}

/** Decompose a tempo factor into a chain of atempo filters within [0.5,2]. */
function buildAtempoChain(factor: number): string {
  const parts: number[] = [];
  let remaining = factor;
  while (remaining > 2.0) {
    parts.push(2.0);
    remaining /= 2.0;
  }
  while (remaining < 0.5) {
    parts.push(0.5);
    remaining /= 0.5;
  }
  parts.push(remaining);
  return parts.map((p) => `atempo=${p.toFixed(6)}`).join(",");
}

// ---------------------------------------------------------------------------
// Loop
// ---------------------------------------------------------------------------

/** Repeat the whole video `count` extra times (count=1 → plays twice total). */
export async function loopVideo(file: Blob, count: number, onProgress?: ProgressFn): Promise<OpResult> {
  const times = Math.max(1, Math.round(count));
  const src = nameOf(file, "input.mp4");
  const ext = extOf(src) || "mp4";
  const inName = `in.${ext}`;
  const outName = `${baseName(src)}-looped.${ext}`;
  const input = await toInput(file, inName);
  // -stream_loop N repeats the input N additional times; re-encode for safety.
  const args = ["-stream_loop", String(times), "-i", inName, ...codecArgs(ext), "-movflags", "+faststart", outName];
  if (ext === "webm" || ext === "mkv") args.splice(args.indexOf("-movflags"), 2);
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Reverse
// ---------------------------------------------------------------------------

/** Play the video (and audio) backwards. Memory-heavy: warn on long clips. */
export async function reverse(file: Blob, onProgress?: ProgressFn): Promise<OpResult> {
  const src = nameOf(file, "input.mp4");
  const ext = extOf(src) || "mp4";
  const inName = `in.${ext}`;
  const outName = `${baseName(src)}-reversed.${ext}`;
  const input = await toInput(file, inName);
  const args = [
    "-i", inName,
    "-vf", "reverse",
    "-af", "areverse",
    ...codecArgs(ext),
    outName,
  ];
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Mute
// ---------------------------------------------------------------------------

/** Remove the audio track (fast. Video stream is copied, not re-encoded). */
export async function mute(file: Blob, onProgress?: ProgressFn): Promise<OpResult> {
  const src = nameOf(file, "input.mp4");
  const ext = extOf(src) || "mp4";
  const inName = `in.${ext}`;
  const outName = `${baseName(src)}-muted.${ext}`;
  const input = await toInput(file, inName);
  const args = ["-i", inName, "-c:v", "copy", "-an", outName];
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Extract audio
// ---------------------------------------------------------------------------

export type AudioFormat = "mp3" | "wav" | "aac" | "m4a" | "ogg";

/** Rip the audio track out to a standalone audio file. */
export async function extractAudio(file: Blob, opts: { format?: AudioFormat } = {}, onProgress?: ProgressFn): Promise<OpResult> {
  const format = opts.format ?? "mp3";
  const src = nameOf(file, "input.mp4");
  const inName = `in.${extOf(src) || "mp4"}`;
  const outName = `${baseName(src)}.${format}`;
  const input = await toInput(file, inName);

  const codec: Record<AudioFormat, string[]> = {
    mp3: ["-c:a", "libmp3lame", "-q:a", "2"],
    wav: ["-c:a", "pcm_s16le"],
    aac: ["-c:a", "aac", "-b:a", "192k"],
    m4a: ["-c:a", "aac", "-b:a", "192k"],
    ogg: ["-c:a", "libvorbis", "-q:a", "5"],
  };
  const args = ["-i", inName, "-vn", ...codec[format], outName];
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// To GIF
// ---------------------------------------------------------------------------

export interface GifOptions {
  fps?: number;
  width?: number;
  startSec?: number;
  durationSec?: number;
}

/**
 * Convert a clip to an optimized GIF using a two-pass palette (palettegen +
 * paletteuse) for markedly better color than naive conversion. Done in one
 * command via split/filter_complex so we stay within a single `run()`.
 */
export async function toGif(file: Blob, opts: GifOptions = {}, onProgress?: ProgressFn): Promise<OpResult> {
  const fps = opts.fps ?? 12;
  const width = opts.width ?? 480;
  const src = nameOf(file, "input.mp4");
  const inName = `in.${extOf(src) || "mp4"}`;
  const outName = `${baseName(src)}.gif`;
  const input = await toInput(file, inName);

  const pre: string[] = [];
  if (opts.startSec && opts.startSec > 0) pre.push("-ss", String(opts.startSec));
  const post: string[] = [];
  if (opts.durationSec && opts.durationSec > 0) post.push("-t", String(opts.durationSec));

  const filter =
    `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];` +
    `[s0]palettegen[p];[s1][p]paletteuse`;

  const args = [...pre, "-i", inName, ...post, "-filter_complex", filter, "-loop", "0", outName];
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// GIF → video
// ---------------------------------------------------------------------------

/** Convert an animated GIF into a real video (mp4/webm): smaller & smoother. */
export async function gifToVideo(file: Blob, opts: { format?: "mp4" | "webm" } = {}, onProgress?: ProgressFn): Promise<OpResult> {
  const format = opts.format ?? "mp4";
  const src = nameOf(file, "input.gif");
  const inName = "in.gif";
  const outName = `${baseName(src)}.${format}`;
  const input = await toInput(file, inName);
  const args = ["-i", inName, "-movflags", "+faststart", "-vf", EVEN_SCALE, ...codecArgs(format), outName];
  if (format === "webm") args.splice(args.indexOf("-movflags"), 2);
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Resize
// ---------------------------------------------------------------------------

export interface ResizeOptions {
  w?: number;
  h?: number;
  /** "contain" (letterbox), "cover" (crop), or "stretch". Default "contain". */
  fit?: "contain" | "cover" | "stretch";
}

/** Resize to target dimensions with a chosen fit strategy. */
export async function resize(file: Blob, opts: ResizeOptions, onProgress?: ProgressFn): Promise<OpResult> {
  const src = nameOf(file, "input.mp4");
  const ext = extOf(src) || "mp4";
  const inName = `in.${ext}`;
  const outName = `${baseName(src)}-resized.${ext}`;
  const input = await toInput(file, inName);

  const w = opts.w && opts.w > 0 ? Math.round(opts.w / 2) * 2 : -2;
  const h = opts.h && opts.h > 0 ? Math.round(opts.h / 2) * 2 : -2;
  const fit = opts.fit ?? "contain";

  let vf: string;
  if (w === -2 || h === -2 || fit === "stretch") {
    vf = `scale=${w}:${h}`;
  } else if (fit === "cover") {
    vf = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`;
  } else {
    // contain: fit inside, pad to exact size.
    vf = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1`;
  }

  const args = ["-i", inName, "-vf", vf, ...codecArgs(ext), outName];
  return execute(args, input, outName, onProgress);
}

// ---------------------------------------------------------------------------
// Watermark
// ---------------------------------------------------------------------------

export type WatermarkPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

export interface WatermarkOptions {
  /** Text watermark (drawtext). Provide this OR `imageData`. */
  text?: string;
  /** Image (logo) watermark as raw bytes + a filename hint for its extension. */
  imageData?: { data: Uint8Array; name: string };
  position?: WatermarkPosition;
  /** 0..1 opacity (default 0.5). */
  opacity?: number;
  /** Text size in px (text mode only, default 24). */
  fontSize?: number;
  /** Text color (text mode only, default "white"). */
  color?: string;
}

/** overlay/drawtext coordinate expression for a corner/center position. */
function positionExpr(pos: WatermarkPosition, pad = 16): { x: string; y: string } {
  switch (pos) {
    case "top-left":
      return { x: `${pad}`, y: `${pad}` };
    case "top-right":
      return { x: `W-w-${pad}`, y: `${pad}` };
    case "bottom-left":
      return { x: `${pad}`, y: `H-h-${pad}` };
    case "center":
      return { x: `(W-w)/2`, y: `(H-h)/2` };
    case "bottom-right":
    default:
      return { x: `W-w-${pad}`, y: `H-h-${pad}` };
  }
}

/**
 * Overlay a text or image watermark. For text, `drawtext` uses the position
 * corner; for image, a second input is overlaid at the same corner with the
 * given opacity.
 */
export async function watermark(file: Blob, opts: WatermarkOptions, onProgress?: ProgressFn): Promise<OpResult> {
  const src = nameOf(file, "input.mp4");
  const ext = extOf(src) || "mp4";
  const inName = `in.${ext}`;
  const outName = `${baseName(src)}-watermarked.${ext}`;
  const opacity = Math.min(1, Math.max(0, opts.opacity ?? 0.5));
  const pos = opts.position ?? "bottom-right";
  const { x, y } = positionExpr(pos);

  if (opts.imageData) {
    const logoName = `logo.${extOf(opts.imageData.name) || "png"}`;
    const inputs: FfmpegInput[] = [
      await toInput(file, inName),
      { name: logoName, data: opts.imageData.data },
    ];
    // Apply opacity to the logo, then overlay at the chosen corner.
    const filter = `[1:v]format=rgba,colorchannelmixer=aa=${opacity}[wm];[0:v][wm]overlay=${x}:${y}`;
    const args = ["-i", inName, "-i", logoName, "-filter_complex", filter, ...codecArgs(ext), outName];
    return execute(args, inputs, outName, onProgress);
  }

  // Text watermark. Escape characters special to the filtergraph.
  const text = (opts.text ?? "GigAI Tools").replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "’");
  const size = opts.fontSize ?? 24;
  const color = opts.color ?? "white";
  const draw =
    `drawtext=text='${text}':x=${x}:y=${y}:fontsize=${size}:` +
    `fontcolor=${color}@${opacity}:box=1:boxcolor=black@${(opacity * 0.4).toFixed(2)}:boxborderw=6`;
  const input = await toInput(file, inName);
  const args = ["-i", inName, "-vf", draw, ...codecArgs(ext), outName];
  return execute(args, input, outName, onProgress);
}
