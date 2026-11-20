/**
 * Video → Work, local analysis via Ollama.
 *
 * The browser talks straight to a model running on the user's own machine. No
 * server of ours is involved at any point, which makes this the only
 * configuration where the promise is absolute: the video, the transcript, the
 * screenshots and the findings never leave the device. Free forever, works
 * offline, and nothing to meter.
 *
 * WHY THIS WORKS FROM AN HTTPS PAGE: `http://localhost` and `127.0.0.1` are
 * "potentially trustworthy origins" in the mixed-content spec, so browsers do
 * NOT block them the way they block other http:// subresources. The one thing
 * the user must do is let Ollama accept our origin. It allows only localhost
 * callers by default, which is a single environment variable, surfaced in the
 * setup instructions below rather than left as a mystery CORS failure.
 *
 * THE HONEST TRADE, stated in the UI rather than buried: a 7B model reads the
 * same evidence less reliably than a frontier one. Interpretations are rougher
 * and confidence is noisier. That is why `LOCAL_CONFIDENCE_FLOOR` raises the
 * bar for "needs confirmation", same evidence, weaker reader, so more of it
 * deserves a human glance. We do not touch the model's own scores; we change
 * how much certainty we require before calling something settled.
 */

import { ANALYSIS_SCHEMA, SYSTEM_PROMPT, promptClock } from "./contract";
import { mapAnalysisPayload, type AnalysisResult, type PriorFindingRef, type WirePayload } from "./analyze";
import type { CapturedFrame } from "@/lib/video-intel/frames";
import type { Segment } from "@/lib/video-intel/types";
import type { VideoAsset } from "./types";

/** Where Ollama listens by default. */
export const DEFAULT_OLLAMA_HOST = "http://localhost:11434";

/** Vision models we know handle UI screenshots and OCR well, best first. */
export const RECOMMENDED_MODELS: ReadonlyArray<{
  name: string;
  label: string;
  sizeGb: number;
  note: string;
}> = [
  {
    name: "qwen2.5vl:7b",
    label: "Qwen2.5-VL 7B",
    sizeGb: 6,
    note: "The best balance for this job: strong on charts, icons, layouts and on-screen text. Recommended.",
  },
  {
    name: "minicpm-v",
    label: "MiniCPM-V",
    sizeGb: 5.5,
    note: "Excellent OCR, handles high-resolution screenshots well.",
  },
  {
    name: "qwen2.5vl:3b",
    label: "Qwen2.5-VL 3B",
    sizeGb: 3.2,
    note: "For machines with less memory. Noticeably rougher, expect more items flagged for confirmation.",
  },
  {
    name: "qwen2.5vl:72b",
    label: "Qwen2.5-VL 72B",
    sizeGb: 48,
    note: "Closest to frontier quality, but needs a serious GPU.",
  },
];

/**
 * Confidence below which a locally-analysed finding is flagged for review.
 * Higher than the server default of 50: see the note at the top of this file.
 */
export const LOCAL_CONFIDENCE_FLOOR = 70;

/** Frames sent per analysis. Local models degrade fast with many images, and
 *  Ollama loads them all into VRAM at once, so this is well under the server's. */
export const LOCAL_MAX_FRAMES = 8;

/* ── Detection ────────────────────────────────────────────────────────────── */

export interface OllamaStatus {
  reachable: boolean;
  /** Vision-capable models the user already has installed. */
  visionModels: string[];
  /** Every installed model, for the "you have models but none can see" case. */
  allModels: string[];
  /** Set when unreachable: distinguishes "not running" from "blocked by CORS". */
  problem?: "not-running" | "cors" | "unknown";
  hint?: string;
}

/** Model names that indicate vision capability. */
const VISION_HINT = /(vl|vision|llava|minicpm-v|moondream|gemma3|qwen2\.5vl|qwen3-vl)/i;

/**
 * Ask the local Ollama what it has.
 *
 * Distinguishes "not installed / not running" from "running but refusing our
 * origin", because the fixes are completely different and a generic "couldn't
 * connect" would send the user down the wrong path.
 */
export async function checkOllama(host = DEFAULT_OLLAMA_HOST): Promise<OllamaStatus> {
  const base = host.replace(/\/+$/, "");
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${base}/api/tags`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);

    if (!res.ok) {
      return { reachable: false, visionModels: [], allModels: [], problem: "unknown" };
    }

    const data = (await res.json()) as { models?: { name?: string }[] };
    const allModels = (data.models ?? [])
      .map((m) => m.name)
      .filter((n): n is string => typeof n === "string");

    return {
      reachable: true,
      allModels,
      visionModels: allModels.filter((name) => VISION_HINT.test(name)),
    };
  } catch (err) {
    // A CORS rejection and a dead port both surface as TypeError here, so the
    // hint covers both rather than guessing wrong with false confidence.
    const aborted = err instanceof DOMException && err.name === "AbortError";
    return {
      reachable: false,
      visionModels: [],
      allModels: [],
      problem: aborted ? "not-running" : "cors",
      hint: aborted
        ? "Ollama didn't respond. Is it running?"
        : "Couldn't reach Ollama. It may not be running, or it may be refusing requests from this site, see the setup steps.",
    };
  }
}

/** The exact commands to get from nothing to working. Shown in the UI. */
export function setupSteps(origin: string): { label: string; command: string }[] {
  return [
    { label: "Install Ollama", command: "https://ollama.com/download" },
    { label: "Pull a vision model (~6GB, once)", command: "ollama pull qwen2.5vl:7b" },
    {
      label: "Let this site talk to it, then restart Ollama",
      command: `OLLAMA_ORIGINS=${origin} ollama serve`,
    },
  ];
}

/* ── Analysis ─────────────────────────────────────────────────────────────── */

export interface LocalAnalyzeOptions {
  video: VideoAsset;
  segments: Segment[];
  frames: CapturedFrame[];
  model: string;
  host?: string;
  priorFindings?: PriorFindingRef[];
  projectContext?: string;
  onProgress?: (note: string) => void;
  signal?: AbortSignal;
}

/**
 * Run the analysis on the user's own machine.
 *
 * Uses Ollama's native `/api/chat`: images ride as bare base64 strings in the
 * message's `images` array (no data-URL prefix), and `format` takes the JSON
 * schema directly for structured output.
 */
export async function analyzeLocally(options: LocalAnalyzeOptions): Promise<AnalysisResult> {
  // `segments` is read inside buildUserPrompt via `options`, not destructured here.
  const { video, frames, model, host = DEFAULT_OLLAMA_HOST, signal } = options;
  const base = host.replace(/\/+$/, "");

  const kept = frames.slice(0, LOCAL_MAX_FRAMES);
  options.onProgress?.(
    kept.length
      ? `Analysing locally with ${model}, ${kept.length} screenshot${kept.length === 1 ? "" : "s"}`
      : `Analysing locally with ${model}: transcript only`,
  );

  const body = {
    model,
    stream: false,
    format: ANALYSIS_SCHEMA,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt(options, kept),
        // Ollama wants raw base64, not a data URL.
        images: kept.map((f) => f.dataUrl.replace(/^data:image\/[a-z]+;base64,/, "")),
      },
    ],
    options: {
      // Long recordings plus several images need real headroom; the default
      // 2048-token window would silently truncate the transcript.
      num_ctx: 16384,
      // Requirement extraction should be reproducible, not creative.
      temperature: 0.2,
    },
  };

  let res: Response;
  try {
    res = await fetch(`${base}/api/chat`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new Error(
      "Couldn't reach Ollama on your machine. Check it's running, and that OLLAMA_ORIGINS allows this site.",
    );
  }

  if (!res.ok) {
    throw new Error(await localError(res, model));
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const raw = data.message?.content ?? "";
  const parsed = parseJson(raw);
  if (!parsed) {
    throw new Error(
      `${model} didn't return usable structured output. A larger vision model (qwen2.5vl:7b or bigger) is much more reliable here.`,
    );
  }

  return {
    ...mapAnalysisPayload(parsed, video, { confidenceFloor: LOCAL_CONFIDENCE_FLOOR }),
    model: `${model} (local)`,
    refusal: null,
  };
}

/* ── Prompt assembly ──────────────────────────────────────────────────────── */

function buildUserPrompt(options: LocalAnalyzeOptions, frames: CapturedFrame[]): string {
  const { video, segments, priorFindings = [], projectContext = "" } = options;

  const parts: string[] = [
    `CLIENT VIDEO: ${video.label || "Untitled recording"}`,
    `DURATION: ${promptClock(video.durationMs)}`,
  ];

  if (projectContext.trim()) {
    parts.push("", `PROJECT CONTEXT FROM THE USER:`, projectContext.trim());
  }

  if (priorFindings.length > 0) {
    parts.push(
      "",
      "FINDINGS ALREADY EXTRACTED FROM EARLIER VIDEOS IN THIS PROJECT",
      "",
      ...priorFindings.map(
        (p) => `- ${p.id} [${p.type}] ${p.title}${p.area ? ` (area: ${p.area})` : ""}`,
      ),
      "",
      "This video is a later conversation in the same project. Report what is new: a changed requirement, a reversal, or a clarification. If it contradicts an earlier item, say so and set needs_confirmation to true.",
    );
  }

  parts.push("", "TRANSCRIPT", "");
  if (segments.length === 0) {
    parts.push(
      "(No speech was detected. Work from the screenshots alone and say so in the summary.)",
    );
  } else {
    // Local context windows are small, so trim from the middle and say so
    // rather than letting the tail fall off silently.
    const lines = segments
      .filter((s) => s.text.trim())
      .map((s) => `[${promptClock(s.start)}] ${s.text.trim()}`);
    parts.push(trimMiddle(lines.join("\n"), 24_000));
  }

  if (frames.length > 0) {
    parts.push(
      "",
      "SCREENSHOTS (attached in this order)",
      "",
      ...frames.map((f, i) => {
        const ocr = f.ocrText?.trim()
          ? ` - text read from it: ${f.ocrText.trim().replace(/\s+/g, " ").slice(0, 300)}`
          : "";
        return `Image ${i + 1}: taken at ${promptClock(f.timeMs)} (time_ms: ${f.timeMs})${ocr}`;
      }),
      "",
      "Use only these time_ms values for frame_time_ms, or -1 if no screenshot shows the finding.",
    );
  } else {
    parts.push("", "No screenshots accompany this recording. Set frame_time_ms to -1 on every finding.");
  }

  parts.push("", "Produce the findings and summary now, as JSON matching the schema.");
  return parts.join("\n");
}

/** Keep the opening and close, where requirements and decisions cluster. */
function trimMiddle(text: string, max: number): string {
  if (text.length <= max) return text;
  const half = Math.floor(max / 2);
  return `${text.slice(0, half)}\n\n[... middle of the transcript omitted; this recording is long for a local model. Note in risks that part of it was not analysed....]\n\n${text.slice(-half)}`;
}

/* ── Parsing ──────────────────────────────────────────────────────────────── */

/**
 * Read the model's JSON.
 *
 * Ollama's `format` schema usually yields clean JSON, but small models
 * occasionally wrap it in prose or a fenced block, so a brace-matched fallback
 * saves an otherwise-wasted local run.
 */
export function parseJson(raw: string): WirePayload | null {
  const attempt = (text: string): WirePayload | null => {
    try {
      const value = JSON.parse(text);
      return value && typeof value === "object" && Array.isArray(value.findings)
        ? (value as WirePayload)
        : null;
    } catch {
      return null;
    }
  };

  const direct = attempt(raw.trim());
  if (direct) return direct;

  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(raw);
  if (fenced?.[1]) {
    const fromFence = attempt(fenced[1].trim());
    if (fromFence) return fromFence;
  }

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) return attempt(raw.slice(start, end + 1));
  return null;
}

async function localError(res: Response, model: string): Promise<string> {
  let detail = "";
  try {
    const data = (await res.json()) as { error?: string };
    detail = data.error ?? "";
  } catch {
    /* non-JSON body */
  }

  if (res.status === 404 || /not found|no such model|try pulling/i.test(detail)) {
    return `The model “${model}” isn't installed. Run:  ollama pull ${model}`;
  }
  if (/memory|oom|out of/i.test(detail)) {
    return `Your machine ran out of memory loading ${model}. Try a smaller model such as qwen2.5vl:3b, or reduce the number of screenshots.`;
  }
  if (/does not support image|vision|image input/i.test(detail)) {
    return `“${model}” can't read images. Pull a vision model:  ollama pull qwen2.5vl:7b`;
  }
  return detail
    ? `Ollama couldn't complete the analysis: ${detail}`
    : `Ollama returned an error (${res.status}).`;
}
