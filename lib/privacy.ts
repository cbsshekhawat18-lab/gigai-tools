/**
 * Browser-first transparency classification.
 *
 * GigAI Tools is a static export with no application backend, so: with the
 * classification below: every tool is browser-first by architecture: files are
 * processed on the visitor's own device and never uploaded. This module is the
 * single source of truth for the privacy badge shown on every tool page, so the
 * claim on the page always matches how the tool actually runs.
 *
 * Levels (the badge the tool page renders):
 *  🟢 browser, 100% in-browser; files never leave the device.
 *  🟢 browser-ai, 100% in-browser, but the heavy lifting is an AI model that
 *                     also runs ON the device (e.g. image upscaling, OCR)
 *  - still fully private, worth calling out.
 *  🟡 storage: in-browser + persists data in localStorage/IndexedDB.
 *  🟡 hybrid, the FILE never leaves the device, but something derived
 *                     from it (a transcript, a screenshot) may be sent for a
 *                     step the browser cannot do. Not the same promise as
 *                     "browser", so it must not borrow that badge.
 *  🔴 server, requires uploading the file to a server (none today; kept
 *                     so the badge stays honest the day a server tool is added).
 */
import type { Tool } from "@/types";

export type ProcessingLevel = "browser" | "browser-ai" | "storage" | "hybrid" | "optional-upload" | "server";

/** Tools whose core work is an AI model that still runs on-device. */
const ON_DEVICE_AI = new Set(["image-upscaler"]);
const AI_PROCESSORS = new Set(["upscale"]);

/**
 * Tools where the media is handled locally but a DERIVED artefact can be sent.
 *
 * `video-to-work` decodes, transcribes and screenshots the recording in the
 * browser, the video itself genuinely never moves. The analysis step is the
 * exception: with a local Ollama model it stays on the device, and without one
 * the transcript and selected frames go to our server. Both paths are real, so
 * neither the green "never uploaded" badge nor the red "uploads your file" one
 * tells the truth. This set routes such tools to a badge that does.
 */
const HYBRID_ANALYSIS = new Set(["video-to-work"]);

/**
 * Tools that are fully in-browser by DEFAULT but offer one opt-in feature
 * that uploads the file itself. `pdf-to-excel`'s "Fix text" OCR step sends the
 * PDF for server OCR (render + Tesseract, deleted on completion) because a
 * broken embedded font cannot be repaired from the text layer on any device.
 * The default extraction never leaves the browser - but a page carrying that
 * button must not wear the green "never uploaded" badge.
 */
const OPTIONAL_UPLOAD = new Set(["pdf-to-excel"]);

/** Classify where a tool processes the user's data. */
export function toolProcessingLevel(
  tool: Pick<Tool, "slug" | "serverSide" | "processor">,
): ProcessingLevel {
  if (tool.serverSide) return "server";
  if (HYBRID_ANALYSIS.has(tool.slug)) return "hybrid";
  if (OPTIONAL_UPLOAD.has(tool.slug)) return "optional-upload";
  if (ON_DEVICE_AI.has(tool.slug) || (tool.processor && AI_PROCESSORS.has(tool.processor)))
    return "browser-ai";
  return "browser";
}

export interface ProcessingBadgeMeta {
  level: ProcessingLevel;
  /** Emoji signal used in the spec (🟢/🟡/🟠/🔴). */
  emoji: string;
  /** Short badge label. */
  label: string;
  /** One-line explanation shown next to / under the badge. */
  detail: string;
  /** lucide icon name. */
  icon: string;
  /** Tailwind classes (semantic color, theme-aware). */
  className: string;
  /** Dot color class for a compact indicator. */
  dot: string;
}

export const PROCESSING_BADGES: Record<ProcessingLevel, ProcessingBadgeMeta> = {
  browser: {
    level: "browser",
    emoji: "🟢",
    label: "100% browser processing",
    detail: "Everything runs on your device. Your files are never uploaded.",
    icon: "ShieldCheck",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  "browser-ai": {
    level: "browser-ai",
    emoji: "🟢",
    label: "100% browser · on-device AI",
    detail:
      "The AI model runs on your device. Your files stay private and are never uploaded.",
    icon: "ShieldCheck",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  storage: {
    level: "storage",
    emoji: "🟡",
    label: "Browser + local storage",
    detail:
      "Runs in your browser and saves data locally on this device: nothing is uploaded.",
    icon: "Database",
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  "optional-upload": {
    level: "optional-upload",
    emoji: "\ud83d\udfe1",
    label: "Browser processing \u00b7 optional server step",
    detail:
      "Extraction runs on your device and the file is not uploaded - except one optional, clearly-marked feature that sends the PDF to our server, which processes it and deletes it immediately.",
    icon: "ShieldHalf",
    className: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  hybrid: {
    level: "hybrid",
    emoji: "🟡",
    label: "Your file stays local · analysis may be sent",
    detail:
      "The recording is processed on your device and never uploaded. Only the transcript and chosen screenshots are sent for analysis, and not even those if you run a local model.",
    icon: "ShieldHalf",
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  server: {
    level: "server",
    emoji: "🔴",
    label: "Secure cloud processing",
    detail:
      "This tool uploads your file to our server to process it, then deletes it.",
    icon: "Cloud",
    className:
      "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

/** Convenience: the badge metadata for a tool. */
export function toolProcessingBadge(
  tool: Pick<Tool, "slug" | "serverSide" | "processor">,
): ProcessingBadgeMeta {
  return PROCESSING_BADGES[toolProcessingLevel(tool)];
}
