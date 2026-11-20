/**
 * Video Intelligence, in-browser speech recognition.
 *
 * Whisper runs on the user's own machine via transformers.js (ONNX Runtime Web,
 * WebGPU where available, WASM otherwise). Audio never leaves the device, which
 * is the whole reason we do it this way rather than calling a hosted API.
 *
 * HONEST LIMITS, surfaced in the UI rather than buried here:
 *   • The model is a one-off download (~40MB tiny / ~150MB base) fetched from
 *     the Hugging Face CDN and then cached by the browser.
 *   • Throughput is roughly 3-10× realtime on WebGPU and well under realtime on
 *     WASM, so this is honest for clips, not for three-hour recordings. The UI
 *     warns above MAX_COMFORTABLE_MS instead of letting someone start a job that
 *     will run for an hour.
 *   • Whisper does not do speaker diarisation. Speakers are assigned by the user
 *  (or left unassigned). We never invent "Speaker 1 / Speaker 2" labels the
 *     model has no basis for.
 */

import type { Segment } from "./types";

/** Whisper's required input rate. Everything is resampled to this. */
const TARGET_SAMPLE_RATE = 16000;

/** Above this, warn before starting, see the limits note above. */
export const MAX_COMFORTABLE_MS = 20 * 60 * 1000;

export type ModelId = "Xenova/whisper-tiny.en" | "Xenova/whisper-base" | "Xenova/whisper-small";

export interface ModelChoice {
  id: ModelId;
  label: string;
  /** Approximate download in MB, shown before the user commits to it. */
  sizeMb: number;
  note: string;
  /** English-only models are faster but cannot transcribe other languages. */
  englishOnly: boolean;
}

export const MODELS: readonly ModelChoice[] = [
  {
    id: "Xenova/whisper-tiny.en",
    label: "Fast (English)",
    sizeMb: 42,
    note: "Quickest and smallest. Good for clear speech in English.",
    englishOnly: true,
  },
  {
    id: "Xenova/whisper-base",
    label: "Balanced (multilingual)",
    sizeMb: 145,
    note: "Better accuracy and handles ~99 languages. Recommended.",
    englishOnly: false,
  },
  {
    id: "Xenova/whisper-small",
    label: "Accurate (multilingual)",
    sizeMb: 490,
    note: "Best accuracy, much slower and a large download. Short clips only.",
    englishOnly: false,
  },
] as const;

export interface TranscribeProgress {
  /** 0–1 where known, else null for indeterminate work. */
  value: number | null;
  label: string;
  stage: "decoding" | "downloading-model" | "transcribing";
}

export interface TranscribeOptions {
  model?: ModelId;
  /** ISO code, or "auto". Ignored by English-only models. */
  language?: string;
  onProgress?: (progress: TranscribeProgress) => void;
  signal?: AbortSignal;
}

export interface TranscribeResult {
  segments: Segment[];
  model: ModelId;
  language: string;
  durationMs: number;
}

/* ── audio decoding ──────────────────────────────────────────────────────── */

/**
 * Decode any media file the browser understands into mono 16kHz PCM.
 *
 * Uses OfflineAudioContext, which handles resampling and downmixing natively -
 * far faster and smaller than routing every file through ffmpeg.wasm. Container
 * formats the browser can't decode (MKV, AVI, some MOV) throw, and the caller
 * falls back to ffmpeg extraction.
 */
export async function decodeToPcm(file: Blob): Promise<{ pcm: Float32Array; durationMs: number }> {
  const bytes = await file.arrayBuffer();

  const Ctx: typeof AudioContext =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) throw new Error("This browser has no Web Audio support, so audio can't be read.");

  // A short-lived context purely to decode; the offline pass does the resample.
  const probe = new Ctx();
  let decoded: AudioBuffer;
  try {
    decoded = await probe.decodeAudioData(bytes.slice(0));
  } finally {
    void probe.close();
  }

  const frames = Math.ceil((decoded.duration * TARGET_SAMPLE_RATE) | 0) || 1;
  const offline = new OfflineAudioContext(1, frames, TARGET_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start(0);
  const rendered = await offline.startRendering();

  return {
    pcm: rendered.getChannelData(0),
    durationMs: Math.round(decoded.duration * 1000),
  };
}

/**
 * Extract a WAV track with ffmpeg.wasm, for containers Web Audio can't open.
 * Lazy-imported so the ~30MB ffmpeg core only loads when it's genuinely needed.
 */
async function extractAudioWithFfmpeg(
  file: File,
  onProgress?: (fraction: number, status?: string) => void,
): Promise<Blob> {
  const { run } = await import("@/lib/video-tools/ffmpeg");
  // Keep the original extension: ffmpeg picks its demuxer from the filename.
  const ext = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? "bin";
  const data = new Uint8Array(await file.arrayBuffer());

  return run(
    // -vn drops video; mono at Whisper's rate so no resampling is needed later.
    ["-i", `input.${ext}`, "-vn", "-ac", "1", "-ar", String(TARGET_SAMPLE_RATE), "output.wav"],
    { name: `input.${ext}`, data },
    "output.wav",
    onProgress,
    "audio/wav",
  );
}

/** Decode via Web Audio, transparently falling back to ffmpeg on failure. */
export async function toPcm(
  file: File,
  onProgress?: (progress: TranscribeProgress) => void,
): Promise<{ pcm: Float32Array; durationMs: number }> {
  onProgress?.({ value: null, label: "Reading audio…", stage: "decoding" });
  try {
    return await decodeToPcm(file);
  } catch {
    onProgress?.({
      value: null,
      label: "Unusual container, extracting audio…",
      stage: "decoding",
    });
    const wav = await extractAudioWithFfmpeg(file, (fraction) =>
      onProgress?.({ value: fraction, label: "Extracting audio…", stage: "decoding" }),
    );
    return decodeToPcm(wav);
  }
}

/* ── transcription ───────────────────────────────────────────────────────── */

/** Cached pipeline per model, so a second run doesn't refetch or rebuild it. */
const pipelines = new Map<ModelId, Promise<unknown>>();

type Chunk = { text: string; timestamp: [number, number | null] };

/** Whisper emits seconds; our model is milliseconds throughout. */
function chunksToSegments(chunks: Chunk[], durationMs: number): Segment[] {
  const segments: Segment[] = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i]!;
    const text = chunk.text.trim();
    if (!text) continue;
    const start = Math.max(0, Math.round(chunk.timestamp[0] * 1000));
    // A null end means the final chunk ran to the end of the audio.
    const rawEnd = chunk.timestamp[1];
    const end =
      rawEnd == null
        ? durationMs
        : Math.max(start + 1, Math.round(rawEnd * 1000));
    segments.push({ id: `s${segments.length}`, start, end, text });
  }
  return segments;
}

/**
 * Transcribe a media file entirely on-device.
 *
 * `return_timestamps` is required, without it Whisper returns one undivided
 * blob of text, and every downstream feature here (seeking, chapters, keyword
 * timestamps, captions) depends on knowing when each phrase was said.
 */
export async function transcribe(
  file: File,
  options: TranscribeOptions = {},
): Promise<TranscribeResult> {
  const model = options.model ?? "Xenova/whisper-base";
  const { onProgress, signal } = options;

  const { pcm, durationMs } = await toPcm(file, onProgress);
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");

  // A browser can expose navigator.gpu and still fail to produce an adapter
  // (blocklisted driver, headless, GPU busy). Without this the whole run dies
  // instead of quietly using the backend that does work.
  const buildPipeline = async (device: "webgpu" | "wasm") => {
    const { pipeline } = await import("@huggingface/transformers");
    return pipeline("automatic-speech-recognition", model, {
      device,
      // The library's default weight quantisation for these models is 4-bit
      // (MatMulNBits), which ORT's wasm backend cannot create a session for:
      // "Missing required scale ... DequantizeLinear". WebGPU loads it fine,
      // so only the CPU path pins 8-bit weights. Without this, every
      // no-WebGPU browser (Firefox, Safari) errors after the full download.
      ...(device === "wasm" ? { dtype: "q8" } : {}),
      progress_callback: (report: { status?: string; progress?: number }) => {
        if (report.status === "progress" && typeof report.progress === "number") {
          onProgress?.({
            value: report.progress / 100,
            label: `Downloading the speech model: ${Math.round(report.progress)}%`,
            stage: "downloading-model",
          });
        }
      },
    });
  };

  const gpuOk = await webGpuUsable();
  let pipe = pipelines.get(model);
  if (!pipe) {
    onProgress?.({
      value: null,
      label: "Downloading the speech model (one time)…",
      stage: "downloading-model",
    });
    pipe = (async () => {
      if (!gpuOk) return buildPipeline("wasm");
      try {
        return await buildPipeline("webgpu");
      } catch {
        onProgress?.({
          value: null,
          label: "GPU unavailable, falling back to CPU…",
          stage: "downloading-model",
        });
        return buildPipeline("wasm");
      }
    })();
    pipelines.set(model, pipe);
  }

  const asr = (await pipe) as (
    audio: Float32Array,
    opts: Record<string, unknown>,
  ) => Promise<{ text: string; chunks?: Chunk[] }>;

  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  // Whisper gives no progress during generation, so report the honest expected
  // cost up front: silence for several minutes is what makes people assume a
  // hang. WASM is roughly an order of magnitude slower than WebGPU here.
  const minutes = durationMs / 60000;
  const estimate = Math.max(1, Math.round(minutes * (gpuOk ? 0.4 : 4)));
  onProgress?.({
    value: null,
    label: gpuOk
      ? `Transcribing on your GPU, roughly ${estimate} min for this clip`
      : `Transcribing on CPU (no WebGPU): roughly ${estimate} min. This is slow but working.`,
    stage: "transcribing",
  });

  const isEnglishOnly = MODELS.find((m) => m.id === model)?.englishOnly ?? false;
  const language = options.language && options.language !== "auto" ? options.language : undefined;

  const output = await asr(pcm, {
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
    ...(isEnglishOnly || !language ? {} : { language, task: "transcribe" }),
  });

  const segments = output.chunks?.length
    ? chunksToSegments(output.chunks, durationMs)
    : // No chunk timings came back: keep the text rather than lose it, as one
      // segment spanning the whole clip, so nothing is silently dropped.
      [{ id: "s0", start: 0, end: durationMs, text: output.text.trim() }];

  return { segments, model, language: language ?? "auto", durationMs };
}

/** Whether this browser can realistically run the model at usable speed. */
export function hasWebGpu(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

/**
 * `navigator.gpu` existing is not the same as WebGPU working: some browsers
 * expose it while `requestAdapter()` returns null or never resolves (headless
 * builds, blocklisted drivers, remote desktops). Building the webgpu pipeline
 * in that state hangs the whole run with no error, so probe the adapter with a
 * timeout and treat "no adapter within 3s" as "use the CPU path".
 */
async function webGpuUsable(): Promise<boolean> {
  if (!hasWebGpu()) return false;
  try {
    const gpu = (navigator as Navigator & { gpu: { requestAdapter(): Promise<unknown> } }).gpu;
    const adapter = await Promise.race([
      gpu.requestAdapter(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);
    return adapter != null;
  } catch {
    return false;
  }
}
