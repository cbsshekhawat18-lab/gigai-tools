/**
 * Video → Work, the analysis client.
 *
 * The one place in this tool that talks to a server. It posts a transcript and
 * a handful of already-chosen frames to `/api/video-work/analyze` and gets back
 * structured findings. The video itself stays in the browser. This sends the
 * evidence, not the media.
 *
 * That trade is stated in the UI, not buried here: transcription and frame
 * selection are local, understanding is not, because turning "this looks weird"
 * into a requirement with acceptance criteria needs a language model and there
 * is no honest way to fake it. Everything sent is analysed and discarded; the
 * server writes nothing to disk.
 *
 * The wire format is snake_case to match the FastAPI schema; the mapping to the
 * camelCase domain model lives here so nothing downstream deals in two shapes.
 */

import { API } from "@/config/constants";
import type { CapturedFrame } from "@/lib/video-intel/frames";
import type { Segment } from "@/lib/video-intel/types";
import type {
  Finding,
  FindingType,
  Priority,
  ProjectSummary,
  VideoAsset,
} from "./types";
import { FINDING_TYPES, PRIORITIES, implementationOrder } from "./types";

/* ── Wire types ───────────────────────────────────────────────────────────── */

/**
 * The raw shape a provider returns, before clamping.
 *
 * Exported so every provider (our server, or the user's local Ollama) goes
 * through the same `mapAnalysisPayload` below. A provider adapter is transport
 * only; none of them get to skip the sanity checks.
 */
export interface WireFinding {
  id: string;
  type: string;
  title: string;
  priority: string;
  confidence: number;
  area: string;
  description: string;
  observed: string;
  expected: string;
  steps_to_reproduce: string[];
  client_statement: string;
  interpretation: string;
  timestamp_ms: number;
  frame_time_ms: number;
  acceptance_criteria: string[];
  dependencies: string[];
  needs_confirmation: boolean;
}

export interface WirePayload {
  findings: WireFinding[];
  summary?: {
    overview?: string;
    what_client_wants?: string[];
    what_is_broken?: string[];
    risks?: string[];
    recommended_order?: string[];
  };
}

interface WireResponse extends WirePayload {
  model: string;
  refusal: string | null;
}

export interface AnalysisStatus {
  configured: boolean;
  model: string;
  /** "anthropic" | "groq" | "". Lets the UI name the tier honestly. */
  provider: string;
  /** True when the hosted tier is a shared free allowance, not paid capacity. */
  freeTier: boolean;
  maxFrames: number;
  /** Longest edge (px) to downscale frames to before upload. 0 = untouched. */
  maxFramePx: number;
  /** True when the server can retrieve Loom/YouTube/Vimeo links. */
  fetchEnabled: boolean;
  maxFetchMinutes: number;
  maxFetchMb: number;
}

export interface AnalysisResult {
  findings: Finding[];
  summary: ProjectSummary;
  model: string;
  /** Set when the model declined; findings will be empty. */
  refusal: string | null;
}

/**
 * Confidence bar for a small hosted model (Groq's free tier).
 *
 * Measured, not guessed: on a real run `qwen3.6-27b` returned 100/90/100/100 -
 * including 90% with `needs_confirmation: false` for "make it smaller and move
 * it down a bit", which is the textbook ambiguous request our own prompt uses
 * as its example. The model does not calibrate, so its own flag cannot be
 * trusted to protect the rule that matters.
 *
 * We do NOT rewrite its scores. We require near-certainty before treating its
 * reading as settled, which means most free-tier findings surface as "needs
 * confirmation": the correct outcome for a 27B model interpreting vague client
 * speech, and the honest one.
 */
export const FREE_TIER_CONFIDENCE_FLOOR = 95;

/** Prior findings passed as context so a follow-up video amends the project. */
export interface PriorFindingRef {
  id: string;
  type: FindingType;
  title: string;
  area: string;
  videoLabel: string;
}

/* ── Capability probe ─────────────────────────────────────────────────────── */

let cachedStatus: AnalysisStatus | null = null;

/**
 * Ask whether analysis is available before the user commits to a long local
 * transcription. A static export of this site can be served with no backend at
 * all, so "is the brain plugged in" is a real question with a real answer.
 */
export async function checkAnalysisStatus(force = false): Promise<AnalysisStatus> {
  if (cachedStatus && !force) return cachedStatus;

  const unavailable: AnalysisStatus = {
    configured: false,
    model: "",
    provider: "",
    freeTier: false,
    maxFrames: 0,
    maxFramePx: 0,
    fetchEnabled: false,
    maxFetchMinutes: 0,
    maxFetchMb: 0,
  };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${API.baseUrl}/video-work/status`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    if (!res.ok) return (cachedStatus = unavailable);

    const data = (await res.json()) as {
      configured?: boolean;
      model?: string;
      provider?: string;
      free_tier?: boolean;
      max_frames?: number;
      max_frame_px?: number;
      fetch_enabled?: boolean;
      max_fetch_minutes?: number;
      max_fetch_mb?: number;
    };
    return (cachedStatus = {
      configured: Boolean(data.configured),
      model: data.model ?? "",
      provider: data.provider ?? "",
      freeTier: Boolean(data.free_tier),
      maxFrames: data.max_frames ?? 0,
      maxFramePx: data.max_frame_px ?? 0,
      fetchEnabled: Boolean(data.fetch_enabled),
      maxFetchMinutes: data.max_fetch_minutes ?? 0,
      maxFetchMb: data.max_fetch_mb ?? 0,
    });
  } catch {
    // Offline, no backend deployed, or blocked, all the same to the caller.
    return (cachedStatus = unavailable);
  }
}

/* ── Analysis ─────────────────────────────────────────────────────────────── */

export interface AnalyzeOptions {
  video: VideoAsset;
  segments: Segment[];
  frames: CapturedFrame[];
  priorFindings?: PriorFindingRef[];
  projectContext?: string;
  signal?: AbortSignal;
}

/**
 * Send one video's evidence for analysis.
 *
 * Throws with a message written for a user, never a stack trace, the caller
 * surfaces it directly in the pipeline's failure state.
 */
export async function analyzeVideo(options: AnalyzeOptions): Promise<AnalysisResult> {
  const { video, segments, frames, priorFindings = [], projectContext = "", signal } = options;

  // Trim to the active provider's budget before uploading. The server truncates
  // anyway, so anything beyond it is bandwidth spent on frames nobody reads.
  // ?? not ||: a server that takes ZERO frames (text-only analysis) must get
  // zero, not the whole capture set uploaded for nothing.
  const budget = cachedStatus?.maxFrames ?? frames.length;
  const trimmed = frames.slice(0, budget);

  // Downscale when the provider asks for it. The browser captures at 1280px,
  // which on a small free tier costs 2-3x the image tokens of an 800px frame -
  // three of them overran the limit and every analysis failed. Shrinking here
  // also spares the visitor the upload.
  const sendFrames = await downscaleFrames(trimmed, cachedStatus?.maxFramePx ?? 0);

  const body = {
    video_name: fileNameOf(video),
    video_label: video.label,
    duration_ms: video.durationMs,
    segments: segments.map((s) => ({
      start: Math.max(0, Math.round(s.start)),
      end: Math.max(0, Math.round(s.end)),
      text: s.text.slice(0, 4000),
    })),
    frames: sendFrames.map((f) => ({
      time_ms: Math.max(0, Math.round(f.timeMs)),
      data_url: f.dataUrl,
      ocr_text: f.ocrText ? f.ocrText.slice(0, 2000) : null,
    })),
    prior_findings: priorFindings.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title.slice(0, 300),
      area: p.area.slice(0, 120),
      video_label: p.videoLabel.slice(0, 200),
    })),
    project_context: projectContext.slice(0, 2000),
  };

  let res: Response;
  try {
    res = await fetch(`${API.baseUrl}/video-work/analyze`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new Error(
      "Couldn't reach the analysis service. Your transcript and screenshots are safe. They were made in your browser and are still exportable.",
    );
  }

  if (!res.ok) {
    throw new Error(await readError(res));
  }

  const data = (await res.json()) as WireResponse;
  return {
    ...mapAnalysisPayload(data, video, {
      confidenceFloor: cachedStatus?.freeTier ? FREE_TIER_CONFIDENCE_FLOOR : undefined,
    }),
    model: data.model,
    refusal: data.refusal ?? null,
  };
}

/**
 * Re-encode frames so the longest edge is at most `maxPx`.
 *
 * Returns the originals untouched when no limit applies, when a frame is
 * already small enough, or if canvas is unavailable: a smaller screenshot is
 * always better than a failed analysis, but a failed *resize* must never cost
 * the finding its evidence.
 */
async function downscaleFrames(
  frames: CapturedFrame[],
  maxPx: number,
): Promise<CapturedFrame[]> {
  if (maxPx <= 0 || frames.length === 0 || typeof document === "undefined") return frames;

  return Promise.all(
    frames.map(async (frame) => {
      if (frame.width <= maxPx && frame.height <= maxPx) return frame;
      try {
        const image = await loadImage(frame.dataUrl);
        const scale = maxPx / Math.max(image.width, image.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return frame;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        return {
          ...frame,
          dataUrl: canvas.toDataURL("image/jpeg", 0.8),
          width: canvas.width,
          height: canvas.height,
        };
      } catch {
        return frame;
      }
    }),
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("frame could not be read"));
    image.src = src;
  });
}

/* ── Mapping ──────────────────────────────────────────────────────────────── */

/**
 * Turn a provider's raw payload into domain findings, defensively.
 *
 * `confidenceFloor` raises the bar at which a finding is marked as needing
 * confirmation. A small local model reads the same evidence less reliably than
 * a frontier one, so more of its output deserves a human glance; that is a
 * property of the reader, not of the client's request, which is why it lives
 * here rather than being baked into the prompt or fudged into the score.
 */
export function mapAnalysisPayload(
  payload: WirePayload,
  video: VideoAsset,
  options: { confidenceFloor?: number } = {},
): { findings: Finding[]; summary: ProjectSummary } {
  const floor = options.confidenceFloor ?? 50;
  const findings = (payload.findings ?? []).map((f) => toFinding(f, video, floor));

  const summary: ProjectSummary = {
    overview: str(payload.summary?.overview).trim(),
    whatClientWants: clean(payload.summary?.what_client_wants),
    whatIsBroken: clean(payload.summary?.what_is_broken),
    risks: clean(payload.summary?.risks),
    recommendedOrder: clean(payload.summary?.recommended_order),
  };

  return { findings, summary: fillSummary(summary, findings) };
}

/**
 * Derive any part of the summary the model left blank.
 *
 * Smaller models spend their output budget on the findings and return the
 * summary keys empty, a real Groq response came back with every field blank,
 * which would leave the Overview tab showing nothing at all despite four solid
 * findings sitting behind it.
 *
 * Everything filled in here is COMPUTED from the findings, never invented: the
 * counts are counts, the broken list is the bug titles, the risks are the items
 * flagged for confirmation. That keeps the "nothing is asserted without
 * evidence" rule intact: a derived sentence is traceable in a way a
 * hallucinated one is not.
 */
export function fillSummary(summary: ProjectSummary, findings: Finding[]): ProjectSummary {
  if (findings.length === 0) return summary;

  const of = (...types: Finding["type"][]) =>
    findings.filter((f) => types.includes(f.type));

  const bugs = of("BUG");
  const wants = of("FEATURE", "REQUIREMENT", "DESIGN_CHANGE", "CONTENT_CHANGE", "TASK");
  const unsure = findings.filter((f) => f.needsConfirmation);
  const questions = of("QUESTION");

  const filled = { ...summary };

  if (!filled.overview) {
    const parts = [
      `${findings.length} item${findings.length === 1 ? "" : "s"} extracted`,
      bugs.length ? `${bugs.length} bug${bugs.length === 1 ? "" : "s"}` : "",
      wants.length ? `${wants.length} change${wants.length === 1 ? "" : "s"} requested` : "",
      questions.length ? `${questions.length} open question${questions.length === 1 ? "" : "s"}` : "",
    ].filter(Boolean);
    filled.overview =
      `${parts.join(" · ")}. This summary was compiled from the findings below ` +
      `because the analysis model did not return one.`;
  }

  if (filled.whatIsBroken.length === 0) filled.whatIsBroken = bugs.map((f) => f.title);
  if (filled.whatClientWants.length === 0) filled.whatClientWants = wants.map((f) => f.title);
  if (filled.risks.length === 0) {
    filled.risks = unsure.map(
      (f) => `${f.id}; “${f.title}” is an uncertain reading (${f.confidence}%); confirm it.`,
    );
  }
  if (filled.recommendedOrder.length === 0) {
    filled.recommendedOrder = implementationOrder(findings).map((f) => f.id);
  }
  return filled;
}

/**
 * Convert one wire finding into the domain model, clamping anything the model
 * could get wrong. The schema constrains shape but not sense: a confidence of
 * 140, a `frame_time_ms` matching no real frame, or a self-dependency are all
 * schema-valid and all wrong, so they are corrected here rather than trusted.
 */
function toFinding(wire: WireFinding, video: VideoAsset, confidenceFloor: number): Finding {
  const confidence = clamp(Math.round(Number(wire.confidence)), 0, 100);
  const needsConfirmation = Boolean(wire.needs_confirmation) || confidence < confidenceFloor;

  return {
    id: str(wire.id).trim() || "ITEM-000",
    type: asType(str(wire.type)),
    title: str(wire.title).trim(),
    priority: asPriority(str(wire.priority)),
    confidence,
    area: str(wire.area).trim(),
    description: str(wire.description).trim(),
    observed: str(wire.observed).trim(),
    expected: str(wire.expected).trim(),
    stepsToReproduce: clean(wire.steps_to_reproduce),
    interpretation: str(wire.interpretation).trim(),
    acceptanceCriteria: clean(wire.acceptance_criteria),
    // A finding depending on itself would deadlock the ordering walk.
    dependencies: clean(wire.dependencies).filter((d) => d !== wire.id),
    evidence: {
      videoId: video.id,
      timestampMs: clamp(Math.round(Number(wire.timestamp_ms)), 0, video.durationMs || Infinity),
      frameTimeMs: nearestFrameTime(Number(wire.frame_time_ms), video.frames),
      clientStatement: str(wire.client_statement).trim(),
    },
    // The AI's own uncertainty is a review signal, not a verdict, either way a
    // human still approves before this becomes work.
    status: needsConfirmation ? "needs-review" : "new",
    needsConfirmation,
  };
}

/**
 * Snap a claimed frame timestamp onto a frame that actually exists.
 *
 * The model is told to cite only timestamps it was given, but a near-miss (an
 * off-by-a-few-ms echo of the caption) would otherwise render as a broken
 * evidence link. Anything not close to a real frame becomes null: an honest
 * "no screenshot" beats a screenshot of the wrong moment.
 */
function nearestFrameTime(claimed: number, frames: CapturedFrame[]): number | null {
  if (!Number.isFinite(claimed) || claimed < 0 || frames.length === 0) return null;
  let best: CapturedFrame | null = null;
  let bestDelta = Infinity;
  for (const frame of frames) {
    const delta = Math.abs(frame.timeMs - claimed);
    if (delta < bestDelta) {
      best = frame;
      bestDelta = delta;
    }
  }
  return best && bestDelta <= 1500 ? best.timeMs : null;
}

function asType(value: string): FindingType {
  const upper = value.trim().toUpperCase() as FindingType;
  return FINDING_TYPES.includes(upper) ? upper : "TASK";
}

function asPriority(value: string): Priority {
  const lower = value.trim().toLowerCase() as Priority;
  return PRIORITIES.includes(lower) ? lower : "medium";
}

/**
 * Coerce whatever a provider sent into a string.
 *
 * A frontier model behind a strict schema always sends the right type. A 7B
 * model running locally sends `null`, a number, or a nested object often
 * enough that trusting the type annotation would crash the workspace on
 * someone's laptop, so the boundary treats every field as unknown.
 */
function str(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function clean(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((v) => str(v).trim()).filter(Boolean);
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function fileNameOf(video: VideoAsset): string {
  return video.source.kind === "upload" ? video.source.fileName : video.source.url;
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string };
    if (data?.detail) return data.detail;
  } catch {
    /* fall through to the generic message */
  }
  if (res.status === 503) {
    return "Analysis isn't available on this server right now. Your transcript and screenshots are still exportable.";
  }
  if (res.status === 413) {
    return "That recording produced too much evidence to analyse at once. Trim the video and try again.";
  }
  return `The analysis failed (${res.status}). Please try again.`;
}
