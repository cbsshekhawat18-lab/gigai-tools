/**
 * GigAI Smart Assist: shared types for the ORCHESTRATION layer.
 *
 * Smart Assist is the "brain" that sits on top of the existing 248+ browser
 * tools. It does NOT re-implement any tool. The flow it models is:
 *
 *   upload → ANALYSE the file → understand the GOAL → build a PLAN →
 *   RUN existing engines → verify → HEALTH REPORT → recommend next steps.
 *
 * These types are the contracts every stage agrees on. They are pure data -
 * no React, no network. Nothing here is "AI": planning is deterministic and
 * reuses the local intent engine (`lib/assistant`); processing reuses the
 * existing client-side engines (`lib/image`, `lib/pdf`, …). Files never leave
 * the browser.
 */

import type { AssetKind, AssetMeta } from "@/lib/workspace/types";

export type { AssetKind, AssetMeta };

/* ── File families ─────────────────────────────────────────────────────────
 * A broader grouping than the workspace `AssetKind`: it covers every input the
 * assistant can ANALYSE (archives, data, code…), even ones it can't yet PROCESS
 * inline. `assetKind` on the analysis is set only when a workspace engine can
 * act on the file.
 */
export type FileFamily =
  | "image"
  | "pdf"
  | "svg"
  | "audio"
  | "video"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "data"
  | "code"
  | "text"
  | "font"
  | "unknown";

/* ── STEP 1, File analysis ────────────────────────────────────────────────*/

/**
 * The full, on-device analysis of one uploaded file. Every field is optional
 * except the always-known basics, a stage only reads what applies to the
 * detected family. Populated by `lib/assist/analyze.analyzeFile`.
 */
export interface FileAnalysis {
  /** Original filename. */
  name: string;
  /** Lower-case extension without the dot (e.g. "png"), or "" if none. */
  ext: string;
  /** Browser/detected MIME type; may be "" for unknown types. */
  mime: string;
  family: FileFamily;
  /** Workspace asset kind when a client engine can process this file. */
  assetKind?: AssetKind;
  /** Byte size of the file. */
  size: number;
  /** Human size, e.g. "2.4 MB". */
  sizeLabel: string;

  // ── Raster / video geometry ──────────────────────────────
  width?: number;
  height?: number;
  megapixels?: number;
  /** Simplified aspect ratio label, e.g. "16:9". */
  aspectRatio?: string;
  orientation?: "landscape" | "portrait" | "square";
  /** True when the image has a real alpha channel (transparency). */
  hasAlpha?: boolean;
  /** True for animated GIF / animated WebP. */
  animated?: boolean;
  /** Cheap "flat graphic (logo) vs photo" hint (e.g. PNG-vs-JPG guidance). */
  looksLikeGraphic?: boolean;

  // ── PDF ──────────────────────────────────────────────────
  pageCount?: number;
  /** True when the PDF is password / permissions encrypted. */
  encrypted?: boolean;

  // ── Audio / video ────────────────────────────────────────
  durationSec?: number;

  // ── Privacy metadata ─────────────────────────────────────
  /** JPEG carrying an EXIF block (may hold GPS/camera/date: a privacy note). */
  hasExif?: boolean;

  // ── Text / data / code ───────────────────────────────────
  lineCount?: number;
  encoding?: string;
  /** True when the source looks minified (very long lines, few newlines). */
  minified?: boolean;
  /** JSON/XML/SVG well-formedness when checkable; undefined = not checked. */
  valid?: boolean;
  validationError?: string;

  // ── Health ───────────────────────────────────────────────
  /** True when the file could not be decoded/opened (likely corrupt). */
  corrupt?: boolean;
  /** Plain-language notes surfaced to the user. */
  warnings: string[];
}

/* ── STEP 6, File Health Report ───────────────────────────────────────────*/

export type HealthStatus = "good" | "warn" | "info";

/** One line item in the health report. */
export interface HealthCheck {
  id: string;
  label: string;
  status: HealthStatus;
  /** One short sentence, plain language. */
  detail: string;
  /** lucide icon name. */
  icon: string;
}

export interface HealthReport {
  /** 0–100 overall health. */
  score: number;
  grade: "Excellent" | "Good" | "Fair" | "Needs work";
  /** One-line summary of the file's state. */
  summary: string;
  checks: HealthCheck[];
}

/* ── STEP 4, Plan ─────────────────────────────────────────────────────────*/

/** A single inline step in the plan, bound to an assist operation + its params. */
export interface AssistStep {
  /** id of an operation in `lib/assist/operations`. */
  operationId: string;
  /** Human label, e.g. "Compress to under 2 MB". */
  label: string;
  /** Params passed to the operation. */
  params: Record<string, unknown>;
  /** Short, jargon-free note on what this does / why. */
  note?: string;
}

/** A contextual next-step recommendation (STEP 5). Never promotional. */
export interface AssistRecommendation {
  title: string;
  href: string;
  icon: string;
  description?: string;
}

/** A tool the plan can hand off to (existing route. Never a new tool). */
export interface AssistToolRef {
  slug: string;
  title: string;
  href: string;
  why: string;
}

/** A resolved existing workflow that fits the goal. */
export interface AssistWorkflowRef {
  slug: string;
  title: string;
  href: string;
  steps: { title: string; href: string }[];
}

/**
 * The plan Smart Assist proposes for (analysis + goal). When `canRunInline` is
 * true, `steps` run entirely in the browser via existing engines. Otherwise the
 * plan hands off to `primaryTool` (an existing tool): still zero-thinking for
 * the user, and always honest about why.
 */
export interface AssistPlan {
  /** The user's goal, echoed (or synthesised from the file when omitted). */
  goal: string;
  /** Plain-language description of what will happen. */
  summary: string;
  /** Inline pipeline (empty when we can't/shouldn't run it here). */
  steps: AssistStep[];
  /** True when `steps` can run in-browser right now. */
  canRunInline: boolean;
  /** The exact existing tool to open (fallback, or "open the full tool"). */
  primaryTool?: AssistToolRef;
  /** An existing guided workflow that fits, when one does. */
  workflow?: AssistWorkflowRef;
  /** Contextual next steps after the result. */
  recommendations: AssistRecommendation[];
  /** Why inline isn't available (shown when `canRunInline` is false). */
  blockedReason?: string;
}

/* ── Execution ─────────────────────────────────────────────────────────────*/

/** A minimal working file the operations + runner act on (never uploaded). */
export interface AssistAsset {
  blob: Blob;
  name: string;
  kind: AssetKind;
  meta: AssetMeta;
}

/** The result an operation returns: a new blob + any changed metadata/name. */
export interface AssistOpResult {
  blob: Blob;
  meta?: Partial<AssetMeta>;
  name?: string;
}

/** Progress callback for a running step. `0..1`. */
export type AssistProgress = (fraction: number, status?: string) => void;

/**
 * One headless assist operation: a THIN wrapper over an existing engine. The
 * heavy lifting always lives in `lib/image` / `lib/pdf` / …; an operation just
 * adapts params and returns a blob. Engines are dynamic-imported INSIDE `run`
 * so nothing heavy enters the initial bundle.
 */
export interface AssistOperation {
  id: string;
  label: string;
  /** Asset kinds this operation can act on. */
  accepts: AssetKind[];
  run: (
    asset: AssistAsset,
    params: Record<string, unknown>,
    onProgress?: AssistProgress,
  ) => Promise<AssistOpResult>;
}

/** The final output of running a plan. */
export interface AssistRunResult {
  blob: Blob;
  name: string;
  meta: AssetMeta;
  originalSize: number;
  finalSize: number;
}

/* ── STEP 7: History ──────────────────────────────────────────────────────*/

/** A local record of a completed (or opened) assist, for the history rail. */
export interface AssistHistoryEntry {
  id: string;
  /** Epoch ms. */
  at: number;
  goal: string;
  fileName: string;
  family: FileFamily;
  /** Short human summary of what was done. */
  summary: string;
  pinned?: boolean;
}
