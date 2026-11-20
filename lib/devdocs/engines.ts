import { readFileSync } from "node:fs";
import { ENGINES_MANIFEST } from "@/lib/engines-manifest";

/**
 * Build-time bridge to the API's engine manifest - the same file the server
 * validates against and the worker dispatches from. Everything the docs,
 * tool-page API sections and request builder render comes from here, so
 * adding an engine to the manifest adds it everywhere with no manual step.
 * Server components only (uses fs).
 */

export type OptionSpec = {
  type?: string;
  enum?: (string | number)[];
  minimum?: number;
  maximum?: number;
};

export type Engine = {
  slug: string;
  name: string;
  category: string;
  description: string;
  input_formats: string[];
  output_formats: string[];
  multi_input?: boolean;
  no_input?: boolean;
  max_input_bytes: number;
  timeout_s: number;
  engine: string;
  options_schema: { properties?: Record<string, OptionSpec>; required?: string[] };
};

let cache: Engine[] | null = null;

export function getEngines(): Engine[] {
  if (!cache) {
    const file = ENGINES_MANIFEST;
    const raw = JSON.parse(readFileSync(file, "utf8")) as Record<string, Omit<Engine, "slug">>;
    cache = Object.entries(raw).map(([slug, spec]) => ({ slug, ...spec }));
  }
  return cache;
}

export function getEngine(slug: string): Engine | undefined {
  return getEngines().find((e) => e.slug === slug);
}

/**
 * API engine slug -> site tool slug, for "Try in browser" links and the
 * tool-page API section. Only listed when a matching web tool exists.
 */
export const ENGINE_TO_SITE_TOOL: Record<string, string> = {
  "merge-pdf": "merge-pdf",
  "split-pdf": "split-pdf",
  "rotate-pdf": "rotate-pdf",
  "convert-image": "webp-converter",
  "resize-image": "image-resizer",
  "compress-image": "image-compressor",
  "optimize-svg": "svg-optimizer",
  "markdown-to-html": "markdown-preview",
  "generate-qr": "qr-code-generator",
  "crop-image": "crop-image",
  "format-json": "json-formatter",
  "json-to-csv": "json-to-csv",
  "csv-to-json": "csv-to-json",
  "convert-subtitles": "subtitle-converter",
  "svg-to-png": "svg-to-png",
  "pdf-to-jpg": "pdf-to-jpg",
  "delete-pdf-pages": "delete-pdf-pages",
  // The rest (pdf-to-text, watermark, page numbers, rotate/flip/grayscale/
  // blur image, yaml, minifiers, html-to-markdown, image-to-pdf) have no
  // dedicated web tool page yet - API only.
};

/** Reverse map: site tool slug -> engine, for the tool-page API section. */
export function engineForSiteTool(toolSlug: string): Engine | undefined {
  const entry = Object.entries(ENGINE_TO_SITE_TOOL).find(([, site]) => site === toolSlug);
  return entry ? getEngine(entry[0]) : undefined;
}

/** Realistic example value for an option, from its schema. */
export function exampleValue(name: string, spec: OptionSpec): string | number | boolean {
  if (spec.enum && spec.enum.length > 0) return spec.enum[0]!;
  if (name === "text") return "https://example.com";
  if (name === "pages") return "1-3";
  if (name === "title") return "Report";
  if (spec.type === "integer") return spec.minimum ?? 1;
  if (spec.type === "boolean") return true;
  return "value";
}
