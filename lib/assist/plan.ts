/**
 * GigAI Smart Assist, STEPS 2-5: the PLANNER (the "brain").
 *
 * `buildPlan(analysis, goal)` turns the analysed file + a plain-language goal
 * into a concrete {@link AssistPlan}: what we'll do, the inline pipeline that
 * does it (existing engines), and contextual next-step recommendations.
 *
 * It is DETERMINISTIC and reuses the existing local intent engine
 * (`lib/assistant/intent.resolveIntent`) to understand the goal and to source
 * validated, real recommendations, so it never hallucinates a tool or route.
 * There is NO LLM and no "AI" language (STEP 10); technology stays invisible.
 *
 * IMPORTANT (perf / CWV): this module imports the registry (via resolveIntent),
 * so the UI MUST dynamic-import it on first use. Never bundle it into a page.
 */

import { ROUTES } from "@/config/constants";
import { resolveIntent } from "@/lib/assistant/intent";
import { FAMILY_LABEL, workspaceSlugFor } from "@/lib/assist/kinds";
import type {
  AssistPlan,
  AssistRecommendation,
  AssistStep,
  AssistToolRef,
  AssistWorkflowRef,
  FileAnalysis,
} from "@/lib/assist/types";
import type { AssistantResult } from "@/lib/assistant/types";

/* ── Goal parsing helpers ──────────────────────────────────────────────────*/

/** Parse an explicit target size from the goal, in bytes, or null. */
function parseTargetBytes(goal: string): number | null {
  const m = goal.match(/(\d+(?:\.\d+)?)\s*(kb|mb|gb|k|m|g)\b/i);
  if (!m) return null;
  const n = parseFloat(m[1]!);
  const unit = m[2]!.toLowerCase();
  const mult = unit.startsWith("g") ? 1024 ** 3 : unit.startsWith("m") ? 1024 ** 2 : 1024;
  return Math.round(n * mult);
}

/** Parse explicit "1080x1080" / "1920 by 1080" dimensions, or null. */
function parseDimensions(goal: string): { width: number; height: number } | null {
  const m = goal.match(/(\d{2,5})\s*(?:x|×|by)\s*(\d{2,5})/i);
  if (!m) return null;
  return { width: parseInt(m[1]!, 10), height: parseInt(m[2]!, 10) };
}

/** Compact, worldwide platform image presets (client-safe, no region framing). */
const PLATFORM_PRESETS: { keys: string[]; width: number; height: number; label: string }[] = [
  { keys: ["instagram story", "insta story", "ig story"], width: 1080, height: 1920, label: "Instagram story (9:16)" },
  { keys: ["instagram", "insta", "ig"], width: 1080, height: 1080, label: "Instagram square (1:1)" },
  { keys: ["linkedin"], width: 1200, height: 627, label: "LinkedIn post (1.91:1)" },
  { keys: ["facebook", "fb"], width: 1200, height: 630, label: "Facebook post (1.91:1)" },
  { keys: ["twitter", "x post", " x "], width: 1600, height: 900, label: "Twitter/X post (16:9)" },
  { keys: ["youtube thumbnail", "youtube"], width: 1280, height: 720, label: "YouTube thumbnail (16:9)" },
  { keys: ["pinterest"], width: 1000, height: 1500, label: "Pinterest pin (2:3)" },
  { keys: ["tiktok"], width: 1080, height: 1920, label: "TikTok (9:16)" },
  { keys: ["passport", "id photo", "visa photo"], width: 413, height: 531, label: "passport photo (35×45 mm @ 300 DPI)" },
];

function detectPlatform(goal: string) {
  for (const p of PLATFORM_PRESETS) {
    if (p.keys.some((k) => goal.includes(k))) return p;
  }
  return null;
}

/** Keyword groups (all lower-case) for intent detection. */
const KW = {
  smaller: ["compress", "reduce", "shrink", "smaller", "too big", "too large", "optimi", "lighter", "under ", "less than", "email", "upload", "portal", "attach"],
  resize: ["resize", "resiz", "dimension", "scale", "px", "pixels", "fit "],
  convert: ["convert", "change format", "turn into", "to png", "to jpg", "to jpeg", "to webp", ".png", ".jpg", ".jpeg", ".webp"],
  toPdf: ["to pdf", "make a pdf", "into a pdf", "as pdf", "pdf from"],
  extractText: ["extract text", "get the text", "copy text", "read text", "ocr"],
};

function hasAny(goal: string, list: string[]): boolean {
  return list.some((k) => goal.includes(k));
}

/** Which output format for "convert": read from the goal, default WebP. */
function convertTarget(goal: string): "image/png" | "image/jpeg" | "image/webp" {
  if (/\bpng\b/.test(goal)) return "image/png";
  if (/\bjpe?g\b/.test(goal)) return "image/jpeg";
  return "image/webp";
}

/* ── resolveIntent → plan pieces ───────────────────────────────────────────*/

function toToolRef(res: AssistantResult): AssistToolRef | undefined {
  if (!res.primary) return undefined;
  return {
    slug: res.primary.slug,
    title: res.primary.title,
    href: res.primary.href,
    why: res.primary.why,
  };
}

function toWorkflowRef(res: AssistantResult): AssistWorkflowRef | undefined {
  if (!res.workflow) return undefined;
  return {
    slug: res.workflow.slug,
    title: res.workflow.title,
    href: res.workflow.href,
    steps: res.workflow.steps.map((s) => ({ title: s.title, href: s.href })),
  };
}

/**
 * Contextual next steps (STEP 5) from validated intent-engine output: the
 * alternative tools, then the top guide. Every href is real (registry-backed).
 */
function toRecommendations(res: AssistantResult, limit = 5): AssistRecommendation[] {
  const recs: AssistRecommendation[] = [];
  for (const alt of res.alternatives) {
    recs.push({ title: alt.title, href: alt.href, icon: "Wrench", description: alt.why });
  }
  for (const g of res.guides) {
    recs.push({ title: g.title, href: g.href, icon: g.icon, description: g.description });
  }
  return recs.slice(0, limit);
}

/* ── The planner ───────────────────────────────────────────────────────────*/

/**
 * Build a plan for (analysis + goal). Synchronous & deterministic. When no goal
 * is given, a sensible default is synthesised from the file. When we can't run
 * inline, the plan still hands off to a real, validated tool.
 */
export function buildPlan(analysis: FileAnalysis, rawGoal: string): AssistPlan {
  const goal = rawGoal.trim().toLowerCase();
  const label = FAMILY_LABEL[analysis.family];

  // Understand the goal against the whole platform (validated, no hallucination).
  // Seed an empty goal with a file-appropriate query so recommendations still fit.
  const query = goal || defaultQueryFor(analysis);
  const intent = resolveIntent(query);
  const primaryTool = toToolRef(intent);
  const workflow = toWorkflowRef(intent);
  const recommendations = toRecommendations(intent);

  const base: AssistPlan = {
    goal: rawGoal.trim(),
    summary: "",
    steps: [],
    canRunInline: false,
    recommendations,
    ...(primaryTool ? { primaryTool } : {}),
    ...(workflow ? { workflow } : {}),
  };

  // Damaged / empty files can't be processed, be honest.
  if (analysis.corrupt) {
    return { ...base, summary: `This ${label} couldn't be read, so there's nothing to run.`, blockedReason: "The file appears to be damaged or empty." };
  }

  // ── IMAGE ────────────────────────────────────────────────
  if (analysis.family === "image" && analysis.assetKind === "image") {
    const steps = planImage(analysis, goal);
    if (steps.length) {
      return { ...base, canRunInline: true, steps, summary: describeSteps(steps, label) };
    }
  }

  // ── PDF ──────────────────────────────────────────────────
  if (analysis.family === "pdf" && analysis.assetKind === "pdf") {
    if (analysis.encrypted) {
      return {
        ...base,
        summary: "This PDF is password-protected. Unlock it first, then I can compress or edit it.",
        blockedReason: "Password-protected PDFs must be unlocked before processing.",
      };
    }
    const steps = planPdf(analysis, goal);
    if (steps.length) {
      return { ...base, canRunInline: true, steps, summary: describeSteps(steps, label) };
    }
  }

  // ── DOCUMENT (.docx → PDF inline; other doc goals route) ─
  if (analysis.family === "document" && analysis.assetKind === "document") {
    const steps = planDocument(analysis, goal);
    if (steps.length) {
      return { ...base, canRunInline: true, steps, summary: describeSteps(steps, label) };
    }
  }

  // ── Everything else → route to the exact existing tool ───
  const workspaceSlug = workspaceSlugFor(analysis.family);
  const summary = primaryTool
    ? `The ${primaryTool.title} handles this${goal ? "" : ` ${label}`}. Open it below and your file is ready to go.`
    : `Here's where to work with this ${label}.`;
  const blocked = base.canRunInline ? {} : {
    blockedReason: `${cap(label)} tasks like this run in their dedicated tool rather than here.`,
  };
  // If intent found nothing, still offer the matching workspace as a soft landing.
  const recs = recommendations.length ? recommendations : workspaceSlug
    ? [{ title: `Open the ${label} workspace`, href: ROUTES.workspace(workspaceSlug), icon: "LayoutGrid" }]
    : [{ title: "Browse all tools", href: ROUTES.search, icon: "Search" }];

  return { ...base, summary, recommendations: recs, ...blocked };
}

/** A default goal query when the user didn't type one. */
function defaultQueryFor(a: FileAnalysis): string {
  switch (a.family) {
    case "image": return "compress image";
    case "pdf": return "compress pdf";
    case "svg": return "optimize svg";
    case "audio": return "compress audio";
    case "video": return "compress video";
    case "data": return a.ext === "csv" ? "csv to json" : "format json";
    case "code": return "format code";
    default: return `open ${a.ext || "file"}`;
  }
}

/* ── Family planners ───────────────────────────────────────────────────────*/

function planImage(a: FileAnalysis, goal: string): AssistStep[] {
  const steps: AssistStep[] = [];

  // Convert to a PDF.
  if (hasAny(goal, KW.toPdf)) {
    steps.push({ operationId: "image.toPdf", label: "Turn it into a PDF", params: {}, note: "Places your image on a page-sized PDF." });
    return steps;
  }

  // Platform / passport / explicit-dimension resize.
  const platform = detectPlatform(goal);
  const dims = parseDimensions(goal);
  if (platform) {
    steps.push({
      operationId: "image.resize",
      label: `Resize for ${platform.label}`,
      params: { width: platform.width, height: platform.height, keepAspect: true },
      note: `Fits your image to ${platform.width}×${platform.height}px, the recommended size.`,
    });
    // Passport photos are usually needed as a JPG.
    if (platform.label.startsWith("passport")) {
      steps.push({ operationId: "image.convert", label: "Save as JPG", params: { format: "image/jpeg", quality: 92 }, note: "Most photo uploads expect a JPG." });
    }
    return steps;
  }
  if (dims && hasAny(goal, KW.resize)) {
    steps.push({
      operationId: "image.resize",
      label: `Resize to ${dims.width}×${dims.height}px`,
      params: { width: dims.width, height: dims.height, keepAspect: true },
    });
    return steps;
  }

  // Explicit format conversion.
  if (hasAny(goal, KW.convert)) {
    const format = convertTarget(goal);
    const name = format === "image/png" ? "PNG" : format === "image/jpeg" ? "JPG" : "WebP";
    steps.push({ operationId: "image.convert", label: `Convert to ${name}`, params: { format, quality: 92 }, note: `Re-encodes your image as ${name}.` });
    return steps;
  }

  // Compress to an explicit target size.
  const target = parseTargetBytes(goal);
  if (target) {
    const format = a.hasAlpha ? ("image/webp" as const) : ("image/jpeg" as const);
    steps.push({
      operationId: "image.compressToTarget",
      label: `Compress to under ${humanBytes(target)}`,
      params: { targetBytes: target, format },
      note: "Finds the highest quality that still fits your size limit.",
    });
    return steps;
  }

  // Generic "make it smaller / optimize / email this".
  if (hasAny(goal, KW.smaller) || goal === "") {
    const format = a.hasAlpha ? ("image/webp" as const) : ("image/jpeg" as const);
    steps.push({
      operationId: "image.compress",
      label: "Compress it",
      params: { quality: 72, format },
      note: format === "image/webp" ? "Shrinks the file while keeping transparency (WebP)." : "Shrinks the file with a smart quality setting.",
    });
    return steps;
  }

  return steps;
}

function planPdf(a: FileAnalysis, goal: string): AssistStep[] {
  const steps: AssistStep[] = [];
  const target = parseTargetBytes(goal);
  const wantsSmaller = hasAny(goal, KW.smaller) || goal === "";

  if (target || wantsSmaller) {
    // Choose an aggressiveness from the target vs current size.
    let level: "low" | "medium" | "high" = "medium";
    if (target && a.size > 0) {
      const ratio = target / a.size;
      level = ratio < 0.3 ? "high" : ratio > 0.7 ? "low" : "medium";
    }
    steps.push({
      operationId: "pdf.compress",
      label: target ? `Compress toward ${humanBytes(target)}` : "Compress the PDF",
      params: { level },
      note: "Re-compresses the pages to cut the file size.",
    });
  }
  return steps;
}

/**
 * Document goals that run inline. Today: a Word .docx → PDF (mammoth + jsPDF).
 * Anything else (legacy .doc, .odt, "to word", compress, etc.) returns [] so the
 * plan hands off to the dedicated tool; honest about where higher fidelity is.
 */
function planDocument(a: FileAnalysis, goal: string): AssistStep[] {
  const steps: AssistStep[] = [];
  const wantsPdf = /\bpdf\b/.test(goal) || hasAny(goal, KW.toPdf) || goal.includes("convert");
  if (a.ext === "docx" && wantsPdf) {
    steps.push({
      operationId: "document.wordToPdf",
      label: "Convert your Word document to a PDF",
      params: {},
      note: "Renders your .docx to a PDF right here. For very complex layouts, the full Word to PDF tool can use higher-fidelity conversion.",
    });
  }
  return steps;
}

/* ── Copy helpers ──────────────────────────────────────────────────────────*/

function describeSteps(steps: AssistStep[], label: string): string {
  if (steps.length === 1) return `I'll ${steps[0]!.label.toLowerCase()}, all in your browser.`;
  const list = steps.map((s) => s.label.toLowerCase());
  const last = list.pop();
  return `I'll ${list.join(", ")} and ${last} for your ${label}, all in your browser.`;
}

function humanBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
