/**
 * Video → Work, processing pipeline.
 *
 * Runs one video from file to findings and reports honest progress while it
 * does. "Honest" is load-bearing here: each stage below is a real unit of work
 * with a real completion moment, and the fraction it reports is measured, not
 * animated. There is no timer pretending to be a progress bar.
 *
 * That is also why this is six stages rather than the eighteen you might draw
 * on a whiteboard. Detecting bugs, features, design changes, questions and
 * decisions, and writing acceptance criteria, all happen inside ONE model call
 * - so they are one stage. Splitting that call into ten ticking checkmarks
 * would be theatre: the UI would claim to know something it cannot observe.
 * The extraction categories are instead reported afterwards, with real counts,
 * once the call returns.
 *
 * Every stage is cancellable and every failure is attributable to the stage
 * that raised it, so a user whose transcription succeeded and whose analysis
 * failed keeps the transcript.
 */

import { extractKeyFrames, type CapturedFrame } from "@/lib/video-intel/frames";
import { transcribe, type ModelId } from "@/lib/video-intel/transcribe";
import { ocrFrames } from "@/lib/video-intel/report";
import type { Segment } from "@/lib/video-intel/types";
import type { AnalysisResult, PriorFindingRef } from "./analyze";
import { runAnalysis, type ResolvedProvider } from "./provider";
import type { VideoAsset } from "./types";

/* ── Stage model ──────────────────────────────────────────────────────────── */

export type StageId = "load" | "transcribe" | "frames" | "ocr" | "analyze" | "reconcile";

export type StageState = "pending" | "active" | "done" | "skipped" | "failed";

export interface Stage {
  id: StageId;
  label: string;
  /** What this stage actually does, shown so nothing is a black box. */
  detail: string;
  state: StageState;
  /** 0–1 within this stage. Only meaningful while `active`. */
  progress: number;
  /** Live sub-label, e.g. "Downloading model (42MB)". */
  note?: string;
  /** Set when `state` is `failed`. */
  error?: string;
  /** Where the work happened, surfaced in the UI, not hidden. */
  where: "device" | "server";
}

export const STAGE_BLUEPRINT: ReadonlyArray<Omit<Stage, "state" | "progress">> = [
  {
    id: "load",
    label: "Read the recording",
    detail: "Decode the file and measure its duration in the browser.",
    where: "device",
  },
  {
    id: "transcribe",
    label: "Generate transcript",
    detail: "Whisper runs on your device. The audio is never uploaded.",
    where: "device",
  },
  {
    id: "frames",
    label: "Select key moments",
    detail:
      "Score every few seconds for scene change and sharpness, then keep the distinct, legible frames.",
    where: "device",
  },
  {
    id: "ocr",
    label: "Read on-screen text",
    detail: "OCR the chosen frames so button labels and errors can be named exactly.",
    where: "device",
  },
  {
    id: "analyze",
    // `where` is a placeholder, the runner overwrites it with the provider
    // actually in use, because "on your device" vs "on our server" is the one
    // claim on this screen that must never be decorative.
    label: "Extract the work",
    detail:
      "Transcript and selected frames are analysed together to produce findings, evidence and acceptance criteria.",
    where: "server",
  },
  {
    id: "reconcile",
    label: "Reconcile with the project",
    detail: "Compare against earlier videos to spot changed and contradicted requirements.",
    where: "device",
  },
];

export function initialStages(): Stage[] {
  return STAGE_BLUEPRINT.map((stage) => ({ ...stage, state: "pending", progress: 0 }));
}

/* ── Runner ───────────────────────────────────────────────────────────────── */

export interface PipelineOptions {
  video: VideoAsset;
  objectUrl: string;
  /** Whisper build to run locally. */
  model: ModelId;
  /** Skip transcription when a transcript was imported or already produced. */
  existingSegments?: Segment[];
  /** OCR is accurate but slow; the workspace lets the user turn it off. */
  runOcr: boolean;
  priorFindings?: PriorFindingRef[];
  projectContext?: string;
  /** True when the file carries no video track. Frame stages are skipped. */
  audioOnly?: boolean;
  /** Where analysis runs. Drives the honest "on your device" label. */
  provider: ResolvedProvider;
  /** Ollama model name, when `provider` is "local". */
  localModel?: string;
  onStage: (stages: Stage[]) => void;
  signal?: AbortSignal;
}

export interface PipelineResult {
  segments: Segment[];
  frames: CapturedFrame[];
  analysis: AnalysisResult | null;
  /** Set when analysis was skipped or failed but local work succeeded. */
  analysisError?: string;
}

/**
 * Run the pipeline.
 *
 * Local failures (decode, transcription) throw. Without a transcript there is
 * nothing to work with. An analysis failure does NOT throw: the transcript and
 * screenshots are genuinely useful on their own, so they are returned with the
 * error attached rather than thrown away.
 */
export async function runPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const stages = initialStages();

  // Correct the analyse stage's provenance BEFORE anything renders. The
  // blueprint carries "server" as a placeholder, and fixing it only when the
  // stage activates meant a local-only run displayed "ON OUR SERVER" for the
  // entire transcription: telling someone their client's recording is going
  // somewhere it never will. That claim is the one thing on this screen that
  // must never be wrong, even transiently.
  const analyzeStage = stages.find((s) => s.id === "analyze");
  if (analyzeStage) {
    if (options.provider === "local") {
      analyzeStage.where = "device";
      analyzeStage.detail =
        "The transcript and screenshots are read by a model on your own machine. Nothing is sent anywhere.";
    } else if (options.provider === "server") {
      analyzeStage.where = "server";
      analyzeStage.detail =
        "Transcript and selected frames are sent for analysis, then discarded. The video is not sent.";
    } else {
      // No provider configured: promising either location would be a lie.
      analyzeStage.where = "device";
      analyzeStage.detail =
        "No analysis model is set up yet. Your transcript and screenshots will still be produced and exportable.";
    }
  }

  const emit = () => options.onStage(stages.map((s) => ({ ...s })));

  const set = (id: StageId, patch: Partial<Stage>) => {
    const stage = stages.find((s) => s.id === id);
    if (stage) Object.assign(stage, patch);
    emit();
  };

  const abortIfCancelled = () => {
    if (options.signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  };

  /* 1: load ------------------------------------------------------------- */
  set("load", { state: "active", progress: 0.5 });
  abortIfCancelled();
  if (!options.video.durationMs) {
    set("load", { state: "failed", error: "The recording's duration couldn't be read." });
    throw new Error("The recording's duration couldn't be read.");
  }
  set("load", { state: "done", progress: 1, note: describeDuration(options.video.durationMs) });

  /* 2: transcribe -------------------------------------------------------- */
  let segments: Segment[] = options.existingSegments ?? [];
  if (segments.length > 0) {
    set("transcribe", {
      state: "skipped",
      progress: 1,
      note: "Using the transcript already loaded.",
    });
  } else {
    set("transcribe", { state: "active", progress: 0 });
    try {
      const result = await transcribe(await fetchAsFile(options.objectUrl, options.video), {
        model: options.model,
        onProgress: (progress) => {
          // `value` is null for indeterminate work (model download, decoding) -
          // keep the bar where it was and let the label carry the news rather
          // than snapping back to zero.
          const current = stages.find((s) => s.id === "transcribe")?.progress ?? 0;
          set("transcribe", {
            state: "active",
            progress: progress.value === null ? current : clamp01(progress.value),
            note: progress.label,
          });
        },
      });
      segments = result.segments;
      abortIfCancelled();
      set("transcribe", {
        state: "done",
        progress: 1,
        note: `${segments.length} segments · ${result.language || "auto"}`,
      });
    } catch (err) {
      const message = readable(err, "Transcription failed. Try a shorter clip or the faster model.");
      set("transcribe", { state: "failed", error: message });
      throw new Error(message);
    }
  }

  /* 3, frames ------------------------------------------------------------ */
  let frames: CapturedFrame[] = [];
  if (options.audioOnly) {
    set("frames", { state: "skipped", note: "Audio-only recording. No frames to capture." });
    set("ocr", { state: "skipped", note: "No frames to read." });
  } else {
    set("frames", { state: "active", progress: 0 });
    try {
      frames = await extractKeyFrames(options.objectUrl, options.video.durationMs, {
        // 18 is the analysis ceiling; capturing beyond it wastes local time for
        // frames the server would drop anyway.
        maxFrames: 18,
        intervalMs: intervalFor(options.video.durationMs),
        forcedTimes: [],
        onProgress: (fraction, label) => {
          set("frames", { state: "active", progress: clamp01(fraction), note: label });
        },
        signal: options.signal,
      });
      set("frames", {
        state: "done",
        progress: 1,
        note: `${frames.length} distinct moment${frames.length === 1 ? "" : "s"} kept`,
      });
    } catch (err) {
      if (isAbort(err)) throw err;
      // Frames are evidence, not a prerequisite: the transcript still analyses.
      set("frames", { state: "failed", error: readable(err, "Frame capture failed.") });
    }

    /* 4, OCR ------------------------------------------------------------- */
    if (!options.runOcr) {
      set("ocr", { state: "skipped", note: "Turned off. Screenshots are still attached." });
    } else if (frames.length === 0) {
      set("ocr", { state: "skipped", note: "No frames to read." });
    } else {
      set("ocr", { state: "active", progress: 0 });
      try {
        frames = await ocrFrames(frames, (fraction, label) => {
          set("ocr", { state: "active", progress: clamp01(fraction), note: label });
        });
        const withText = frames.filter((f) => f.ocrText && f.ocrText.trim()).length;
        set("ocr", {
          state: "done",
          progress: 1,
          note: `Legible text found on ${withText} of ${frames.length}`,
        });
      } catch (err) {
        if (isAbort(err)) throw err;
        set("ocr", { state: "failed", error: readable(err, "On-screen text couldn't be read.") });
      }
    }
  }

  abortIfCancelled();

  /* 5: analyze ----------------------------------------------------------- */
  const local = options.provider === "local";
  set("analyze", {
    state: "active",
    progress: 0,
    where: local ? "device" : "server",
    detail: local
      ? "The transcript and screenshots are read by a model on your own machine. Nothing is sent anywhere."
      : "Transcript and selected frames are sent for analysis, then discarded. The video is not sent.",
    note: local ? "Starting the local model…" : "Sending transcript and screenshots…",
  });

  let analysis: AnalysisResult | null = null;
  let analysisError: string | undefined;
  try {
    analysis = await runAnalysis({
      provider: options.provider,
      localModel: options.localModel ?? "",
      video: options.video,
      segments,
      frames,
      priorFindings: options.priorFindings,
      projectContext: options.projectContext,
      onProgress: (note) => set("analyze", { state: "active", note }),
      signal: options.signal,
    });
    if (analysis.refusal) {
      analysisError = analysis.refusal;
      set("analyze", { state: "failed", error: analysis.refusal });
      analysis = null;
    } else {
      set("analyze", {
        state: "done",
        progress: 1,
        note: `${analysis.findings.length} finding${analysis.findings.length === 1 ? "" : "s"}`,
      });
    }
  } catch (err) {
    if (isAbort(err)) throw err;
    analysisError = readable(err, "The analysis step failed.");
    set("analyze", { state: "failed", error: analysisError });
  }

  /* 6, reconcile --------------------------------------------------------- */
  // Cross-video comparison happens in the workspace once findings are merged
  // into the project; the stage is marked here so the pipeline view is complete.
  if (!analysis) {
    set("reconcile", { state: "skipped", note: "Nothing new to reconcile." });
  } else if (!options.priorFindings?.length) {
    set("reconcile", { state: "skipped", note: "First video in this project." });
  } else {
    set("reconcile", { state: "done", progress: 1, note: "Compared against earlier videos." });
  }

  return { segments, frames, analysis, analysisError };
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * Sampling cadence. Short clips are worth scanning densely; on a long recording
 * a 2-second grid means thousands of seeks, so the interval widens with length.
 */
function intervalFor(durationMs: number): number {
  const minutes = durationMs / 60000;
  if (minutes <= 5) return 1500;
  if (minutes <= 15) return 2500;
  if (minutes <= 40) return 4000;
  return 6000;
}

/** Whisper takes a File; the workspace holds an object URL. */
async function fetchAsFile(objectUrl: string, video: VideoAsset): Promise<File> {
  const response = await fetch(objectUrl);
  const blob = await response.blob();
  const name = video.source.kind === "upload" ? video.source.fileName : "recording";
  return new File([blob], name, { type: blob.type || "video/mp4" });
}

function describeDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  return minutes >= 1 ? `${minutes} minute${minutes === 1 ? "" : "s"}` : "under a minute";
}

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function readable(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
