/**
 * Ask GigAI - the planner (PR 1).
 *
 * A plan is a validated sequence of tool calls from the agent catalogue:
 *   { steps: [{ toolId, input, why }] }
 *
 * Three sources can produce one, in trust order:
 *  1. the deterministic heuristic planner (Tier 1 "On-device": no model,
 *     no download, always available - also the fallback for every tier),
 *  2. a free-cloud model via POST /v1/agent/plan (Tier 2),
 *  3. the visitor's own key, browser-direct (Tier 3).
 * Whatever the source, the SAME validator gates the plan against the
 * catalogue: unknown tools, unknown options, wrong types and over-long
 * plans are rejected - a model can propose, only the registry disposes.
 *
 * Only file METADATA (name, type, size, dimensions) ever reaches a model.
 */

import type { AgentToolSpec, ToolIOSchema } from "@/lib/agent/registry";

export interface FileMeta {
  name: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
}

export interface PlanStep {
  toolId: string;
  input: Record<string, unknown>;
  why: string;
}

export interface Plan {
  steps: PlanStep[];
  source: "heuristic" | "model";
}

/** Catalogue shape as served by /agent-catalog.json. */
export interface Catalogue {
  browser: AgentToolSpec[];
  server: {
    id: string;
    name: string;
    description: string;
    inputs: ToolIOSchema | Record<string, unknown>;
    constraints: { formats?: string[]; files?: string };
  }[];
}

export const MAX_STEPS = 6;

/* ------------------------------ validation ------------------------------ */

function schemaOf(catalogue: Catalogue, toolId: string): ToolIOSchema | null {
  const browser = catalogue.browser.find((t) => t.id === toolId);
  if (browser) return browser.inputs;
  const server = catalogue.server.find((t) => t.id === toolId);
  return server ? (server.inputs as ToolIOSchema) : null;
}

export function validatePlan(
  plan: unknown,
  catalogue: Catalogue,
): { ok: true; plan: Plan } | { ok: false; error: string } {
  if (typeof plan !== "object" || plan === null || !Array.isArray((plan as Plan).steps)) {
    return { ok: false, error: "A plan must be an object with a steps array." };
  }
  const steps = (plan as Plan).steps;
  if (!steps.length) return { ok: false, error: "The plan has no steps." };
  if (steps.length > MAX_STEPS) return { ok: false, error: `Plans are capped at ${MAX_STEPS} steps.` };

  for (const [i, step] of steps.entries()) {
    if (typeof step?.toolId !== "string" || typeof step?.why !== "string" || typeof step?.input !== "object" || step.input === null) {
      return { ok: false, error: `Step ${i + 1} needs toolId, input and why.` };
    }
    const schema = schemaOf(catalogue, step.toolId);
    if (!schema) return { ok: false, error: `Step ${i + 1}: '${step.toolId}' is not in the catalogue.` };
    const props = schema.properties ?? {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(step.input)) {
        if (!(key in props)) return { ok: false, error: `Step ${i + 1}: '${step.toolId}' has no option '${key}'.` };
      }
    }
    for (const [key, spec] of Object.entries(props)) {
      const value = (step.input as Record<string, unknown>)[key];
      if (value === undefined) {
        if (schema.required?.includes(key)) {
          return { ok: false, error: `Step ${i + 1}: '${step.toolId}' requires option '${key}'.` };
        }
        continue;
      }
      if (spec.type === "integer" && (!Number.isInteger(value) || typeof value !== "number")) {
        return { ok: false, error: `Step ${i + 1}: option '${key}' must be an integer.` };
      }
      if (spec.type === "string" && typeof value !== "string") {
        return { ok: false, error: `Step ${i + 1}: option '${key}' must be a string.` };
      }
      if (spec.enum && !spec.enum.includes(value as string | number)) {
        return { ok: false, error: `Step ${i + 1}: option '${key}' must be one of ${spec.enum.join(", ")}.` };
      }
      if (typeof value === "number") {
        if (spec.minimum !== undefined && value < spec.minimum) {
          return { ok: false, error: `Step ${i + 1}: option '${key}' is below ${spec.minimum}.` };
        }
        if (spec.maximum !== undefined && value > spec.maximum) {
          return { ok: false, error: `Step ${i + 1}: option '${key}' is above ${spec.maximum}.` };
        }
      }
    }
  }
  return { ok: true, plan: { steps: steps.map((s) => ({ toolId: s.toolId, input: s.input, why: s.why })), source: "model" } };
}

/* -------------------------- heuristic planner --------------------------- */

const SIZE_RE = /(?:under|below|max|to|less than|<)\s*(\d+(?:\.\d+)?)\s*(kb|mb)\b/i;
const DIM_RE = /(\d{2,5})\s*[x×]\s*(\d{2,5})/;
const WIDTH_RE = /(?:width|wide)\D{0,4}(\d{2,5})|(\d{2,5})\s*(?:px)?\s*wide/i;
const ROTATE_RE = /rotate\D{0,8}(90|180|270)/i;
const PAGES_RE = /pages?\s+([\d,\s-]+\d)/i;

const isImage = (f: FileMeta) => /image\//.test(f.type) || /\.(png|jpe?g|webp|gif|avif)$/i.test(f.name);
const isPdf = (f: FileMeta) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);

/**
 * Deterministic goal parser. Covers the catalogue's common intents; anything
 * it cannot map produces an empty plan so callers show honest guidance
 * instead of a wrong guess.
 */
export function heuristicPlan(goal: string, files: FileMeta[], catalogue: Catalogue): Plan {
  const g = goal.toLowerCase();
  const steps: PlanStep[] = [];
  const has = (id: string) => schemaOf(catalogue, id) !== null;
  const push = (toolId: string, input: Record<string, unknown>, why: string) => {
    if (has(toolId) && steps.length < MAX_STEPS) steps.push({ toolId, input, why });
  };
  const file = files[0];

  // --- images ---
  if (file && isImage(file)) {
    const dim = goal.match(DIM_RE);
    const width = goal.match(WIDTH_RE);
    if (dim) push("browser.resize-image", { width: Number(dim[1]), height: Number(dim[2]) }, `Resize to ${dim[1]}x${dim[2]}.`);
    else if (width) {
      const w = Number(width[1] ?? width[2]);
      push("browser.resize-image", { width: w }, `Resize to ${w}px wide, keeping the aspect ratio.`);
    }
    const fmt = g.match(/\b(?:to|into|as)\s+(webp|png|jpe?g|avif)\b/);
    if (fmt) {
      const format = fmt[1] === "jpg" ? "jpeg" : fmt[1] === "jpeg" ? "jpeg" : fmt[1]!;
      if (format === "avif") push("convert-image", { format: "avif" }, "Convert to AVIF (server engine - AVIF encoding needs it).");
      else push("browser.convert-image", { format }, `Convert to ${format.toUpperCase()}.`);
    }
    const size = goal.match(SIZE_RE);
    if (size) {
      const kb = Math.round(Number(size[1]) * (size[2]!.toLowerCase() === "mb" ? 1024 : 1));
      push("browser.compress-to-target-size", { target_kb: kb },
        `Fit under ${kb} KB on this device - the engine searches for the highest quality that fits.`);
    } else if (/\bcompress|smaller|shrink|reduce\b/.test(g) && !size) {
      push("browser.compress-image", { quality: 75 }, "Compress at quality 75.");
    }
    if (/\bgr[ae]yscale|black.?and.?white\b/.test(g)) push("grayscale-image", {}, "Convert to grayscale (server engine).");
    if (/\bpdf\b/.test(g)) push("image-to-pdf", {}, "Wrap the image into a PDF (server engine).");
  }

  // --- pdf ---
  if (file && isPdf(file)) {
    if (/\bmerge|combine|join\b/.test(g) && files.length > 1) {
      push("browser.merge-pdf", {}, `Merge the ${files.length} PDFs in order.`);
    }
    const rot = goal.match(ROTATE_RE);
    if (rot) push("rotate-pdf", { angle: Number(rot[1]) }, `Rotate every page ${rot[1]} degrees (server engine).`);
    const pages = goal.match(PAGES_RE);
    if (/\bsplit|extract\b/.test(g) && pages) {
      push("browser.split-pdf", { pages: pages[1]!.replace(/\s/g, "") }, `Extract pages ${pages[1]}.`);
    }
    if (/\bdelete|remove\b/.test(g) && pages) {
      push("browser.delete-pdf-pages", { pages: pages[1]!.replace(/\s/g, "") }, `Delete pages ${pages[1]}.`);
    }
    if (/\bocr|scanned|extract text|readable\b/.test(g)) {
      push("ocr-pdf", {}, "OCR the pages to text (server engine, 33 languages, auto-detected).");
    } else if (/\btext\b/.test(g) && !steps.length) {
      push("pdf-to-text", {}, "Extract the text layer (server engine).");
    }
    if (/\bwatermark\b/.test(g)) {
      const text = goal.match(/watermark\s+(?:with\s+)?["']?([\w -]{2,30})["']?/i)?.[1] ?? "CONFIDENTIAL";
      push("watermark-pdf", { text }, `Stamp "${text}" across every page (server engine).`);
    }
    if (/\bpage numbers?\b/.test(g)) push("add-page-numbers", {}, "Add page numbers (server engine).");
    if (/\bjpg|jpeg|image|png\b/.test(g) && /\bto|into|as\b/.test(g)) {
      push("pdf-to-jpg", { pages: "1-20" }, "Render the pages to images (server engine).");
    }
  }

  // --- data / text ---
  if (file && /\.(json|csv|ya?ml|md|html|txt|srt|vtt)$/i.test(file.name)) {
    if (/\bcsv\b/.test(g) && /\.json$/i.test(file.name)) push("browser.json-to-csv", {}, "Convert the JSON array to CSV.");
    if (/\bjson\b/.test(g) && /\.csv$/i.test(file.name)) push("browser.csv-to-json", {}, "Convert the CSV to JSON.");
    if (/\byaml\b/.test(g) && /\.json$/i.test(file.name)) push("json-to-yaml", {}, "Convert to YAML (server engine).");
    if (/\bformat|pretty\b/.test(g) && /\.json$/i.test(file.name)) push("browser.format-json", {}, "Pretty-print the JSON.");
    if (/\bminify\b/.test(g)) {
      if (/\.css$/i.test(file.name)) push("minify-css", {}, "Minify the stylesheet (server engine).");
      else if (/\.js$/i.test(file.name)) push("minify-js", {}, "Minify the script (server engine).");
      else if (/\.html$/i.test(file.name)) push("minify-html", {}, "Minify the page (server engine).");
      else if (/\.json$/i.test(file.name)) push("browser.format-json", { indent: 0 }, "Minify the JSON.");
    }
    if (/\bsrt\b/.test(g)) push("browser.convert-subtitles", { format: "srt" }, "Convert subtitles to SRT.");
    if (/\bvtt\b/.test(g)) push("browser.convert-subtitles", { format: "vtt" }, "Convert subtitles to VTT.");
    if (/\bredact|pii|aadhaar|mask\b/.test(g)) push("redact-pii", {}, "Redact Indian identifiers, checksum-validated (server engine).");
    if (/\bmarkdown|md\b/.test(g) && /\.html$/i.test(file.name)) push("html-to-markdown", {}, "Convert the HTML to Markdown (server engine).");
    if (/\bhtml\b/.test(g) && /\.md$/i.test(file.name)) push("markdown-to-html", {}, "Render the Markdown to HTML (server engine).");
  }

  // --- no file: qr ---
  if (!file && /\bqr\b/.test(g)) {
    const payload = goal.match(/(?:for|of|to)\s+(\S+)$/)?.[1] ?? goal.replace(/.*qr( code)?( for| of)?/i, "").trim();
    if (payload) push("browser.generate-qr-svg", { text: payload }, `QR code for "${payload}".`);
  }

  return { steps, source: "heuristic" };
}

/* ------------------------- model prompt + parse ------------------------- */

/** The planning prompt: goal + metadata + a compact catalogue. No contents. */
export function buildPlanPrompt(goal: string, files: FileMeta[], catalogue: Catalogue): string {
  const tools = [
    ...catalogue.browser.map((t) => ({ id: t.id, desc: t.description, inputs: t.inputs })),
    ...catalogue.server.map((t) => ({ id: t.id, desc: t.description, inputs: t.inputs })),
  ];
  return `You plan file-processing pipelines using ONLY the tools listed. Answer with pure JSON, no prose:
{"steps":[{"toolId":"...","input":{...},"why":"one sentence"}]}
Rules: at most ${MAX_STEPS} steps; every toolId and every input option must exist in the catalogue exactly as listed; steps run in order, each consuming the previous output.

Goal: ${goal}
Files (metadata only): ${JSON.stringify(files)}
Catalogue: ${JSON.stringify(tools)}`;
}

/** Pull the first JSON object out of a model answer (fences, prose, etc). */
export function parseModelPlan(text: string): unknown | null {
  const cleaned = text.replace(/```(?:json)?/g, "");
  const start = cleaned.indexOf("{");
  if (start === -1) return null;
  for (let end = cleaned.length; end > start; end--) {
    try {
      return JSON.parse(cleaned.slice(start, end));
    } catch {
      /* keep shrinking */
    }
  }
  return null;
}
