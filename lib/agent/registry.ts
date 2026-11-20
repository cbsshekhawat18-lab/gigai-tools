/**
 * Agent tool registry - the browser half of the shared toolset.
 *
 * Server engines stay declared in backend/app/v1/engines.json (the manifest that
 * already generates the MCP list, /v1/tools, the OpenAPI check and the docs).
 * This file declares the BROWSER-runnable tools: each entry binds to a real
 * engine-layer function that already powers a shipped tool page - no entry
 * may promise a capability that is not imported and executed in run-tool.ts.
 *
 * Consumers: runTool() (client executor), Smart Assist planning, the Site
 * Audit fix links, and the internal agent catalogue. Server tools are NOT
 * duplicated here - fetch them live from /v1/tools (SERVER_CATALOG_URL) so
 * the two halves can never drift; a test asserts the id spaces stay disjoint.
 */

export type ToolRunsIn = "browser" | "server";

export interface ToolIOSchema {
  type: "object";
  properties?: Record<
    string,
    {
      type?: string;
      enum?: (string | number)[];
      minimum?: number;
      maximum?: number;
      description?: string;
    }
  >;
  required?: string[];
  additionalProperties?: boolean;
}

export interface AgentToolSpec {
  id: string;
  name: string;
  category: string;
  /** One sentence, written for an agent deciding whether to call it. */
  description: string;
  runsIn: ToolRunsIn;
  inputs: ToolIOSchema;
  /** What comes back: files, text, or a report object. */
  outputs: { kind: "files" | "text" | "report"; description: string };
  constraints: { maxBytes?: number; formats?: string[]; files?: "none" | "one" | "many" };
  /** Relative cost for planners: none = pure sync, low = ms, medium = CPU-bound seconds. */
  costHint: "none" | "low" | "medium";
  /** Needs a real DOM/canvas - excluded from Node test runs, guarded at runtime. */
  domRequired?: boolean;
  exampleCalls: { input: Record<string, unknown>; note: string }[];
}

/** Where the server half of the catalogue lives - same origin, no key needed. */
export const SERVER_CATALOG_URL = "/v1/tools";

const text = { type: "string" as const };
const int = (min: number, max: number) => ({ type: "integer", minimum: min, maximum: max });

export const BROWSER_TOOLS: AgentToolSpec[] = [
  /* ---------- data & text (pure, instant) ---------- */
  {
    id: "browser.format-json",
    name: "Format JSON",
    category: "data",
    description: "Pretty-print JSON text with a chosen indent, or report exactly where it is invalid.",
    runsIn: "browser",
    inputs: {
      type: "object",
      properties: { text, indent: int(0, 8) },
      required: ["text"],
      additionalProperties: false,
    },
    outputs: { kind: "text", description: "The formatted JSON." },
    constraints: { maxBytes: 10 * 1024 * 1024, files: "none" },
    costHint: "none",
    exampleCalls: [
      { input: { text: '{"a":1}', indent: 2 }, note: "Pretty-print with 2 spaces." },
      { input: { text: '{"a":1}', indent: 0 }, note: "indent 0 minifies." },
    ],
  },
  {
    id: "browser.sort-json-keys",
    name: "Sort JSON keys",
    category: "data",
    description: "Recursively sort every object's keys alphabetically for stable diffs.",
    runsIn: "browser",
    inputs: { type: "object", properties: { text, indent: int(0, 8) }, required: ["text"], additionalProperties: false },
    outputs: { kind: "text", description: "The key-sorted JSON." },
    constraints: { maxBytes: 10 * 1024 * 1024, files: "none" },
    costHint: "none",
    exampleCalls: [
      { input: { text: '{"b":2,"a":1}' }, note: "Returns keys a then b." },
      { input: { text: '{"z":{"y":1,"x":2}}', indent: 2 }, note: "Nested objects sort too." },
    ],
  },
  {
    id: "browser.validate-json",
    name: "Validate JSON",
    category: "data",
    description: "Check whether text is valid JSON and point at the line and column when it is not.",
    runsIn: "browser",
    inputs: { type: "object", properties: { text }, required: ["text"], additionalProperties: false },
    outputs: { kind: "report", description: "{ valid, error?, line?, column? }" },
    constraints: { maxBytes: 10 * 1024 * 1024, files: "none" },
    costHint: "none",
    exampleCalls: [
      { input: { text: '{"ok":true}' }, note: "valid: true." },
      { input: { text: "{nope" }, note: "valid: false with a position." },
    ],
  },
  {
    id: "browser.csv-to-json",
    name: "CSV to JSON",
    category: "data",
    description: "Parse CSV text (first row as headers) into a JSON array of row objects.",
    runsIn: "browser",
    inputs: { type: "object", properties: { text }, required: ["text"], additionalProperties: false },
    outputs: { kind: "text", description: "JSON array, one object per row." },
    constraints: { maxBytes: 20 * 1024 * 1024, files: "none" },
    costHint: "low",
    exampleCalls: [
      { input: { text: "a,b\n1,2" }, note: '[{"a":"1","b":"2"}]' },
      { input: { text: "name\nalpha\nbeta" }, note: "Single-column CSV works." },
    ],
  },
  {
    id: "browser.json-to-csv",
    name: "JSON to CSV",
    category: "data",
    description: "Turn a JSON array of flat objects into CSV with a header row.",
    runsIn: "browser",
    inputs: { type: "object", properties: { text }, required: ["text"], additionalProperties: false },
    outputs: { kind: "text", description: "CSV text." },
    constraints: { maxBytes: 20 * 1024 * 1024, files: "none" },
    costHint: "low",
    exampleCalls: [
      { input: { text: '[{"a":1,"b":2}]' }, note: "Header a,b then the row." },
      { input: { text: '[{"x":"hi"}]' }, note: "Strings are quoted as needed." },
    ],
  },
  {
    id: "browser.convert-subtitles",
    name: "Convert subtitles",
    category: "document",
    description: "Convert subtitle text between SRT and VTT, auto-detecting the source format.",
    runsIn: "browser",
    inputs: {
      type: "object",
      properties: { text, format: { type: "string", enum: ["srt", "vtt"] } },
      required: ["text", "format"],
      additionalProperties: false,
    },
    outputs: { kind: "text", description: "The converted subtitle text." },
    constraints: { maxBytes: 5 * 1024 * 1024, files: "none" },
    costHint: "none",
    exampleCalls: [
      { input: { text: "1\n00:00:01,000 --> 00:00:02,000\nHi\n", format: "vtt" }, note: "SRT in, VTT out." },
      { input: { text: "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nHi\n", format: "srt" }, note: "VTT in, SRT out." },
    ],
  },
  {
    id: "browser.shift-subtitles",
    name: "Shift subtitles",
    category: "document",
    description: "Shift every subtitle cue by a positive or negative number of milliseconds.",
    runsIn: "browser",
    inputs: {
      type: "object",
      properties: { text, delta_ms: int(-3_600_000, 3_600_000) },
      required: ["text", "delta_ms"],
      additionalProperties: false,
    },
    outputs: { kind: "text", description: "The shifted subtitles in their original format." },
    constraints: { maxBytes: 5 * 1024 * 1024, files: "none" },
    costHint: "none",
    exampleCalls: [
      { input: { text: "1\n00:00:01,000 --> 00:00:02,000\nHi\n", delta_ms: 500 }, note: "Half a second later." },
      { input: { text: "1\n00:00:05,000 --> 00:00:06,000\nHi\n", delta_ms: -1000 }, note: "One second earlier." },
    ],
  },
  {
    id: "browser.generate-qr-svg",
    name: "Generate QR (SVG)",
    category: "qr",
    description: "Encode text or a URL as a QR code and return it as standalone SVG markup.",
    runsIn: "browser",
    inputs: {
      type: "object",
      properties: { text, module_px: int(2, 40) },
      required: ["text"],
      additionalProperties: false,
    },
    outputs: { kind: "text", description: "SVG markup for the code." },
    constraints: { maxBytes: 2000, files: "none" },
    costHint: "none",
    exampleCalls: [
      { input: { text: "https://gigai.tools" }, note: "Default 8px modules." },
      { input: { text: "WIFI:T:WPA;S:net;P:pass;;", module_px: 10 }, note: "Any payload string works." },
    ],
  },

  /* ---------- pdf (pdf-lib, works in browser and Node) ---------- */
  {
    id: "browser.merge-pdf",
    name: "Merge PDFs",
    category: "pdf",
    description: "Combine the given PDF files into one, in order, entirely on the device.",
    runsIn: "browser",
    inputs: { type: "object", properties: {}, additionalProperties: false },
    outputs: { kind: "files", description: "One merged PDF." },
    constraints: { maxBytes: 100 * 1024 * 1024, formats: ["pdf"], files: "many" },
    costHint: "medium",
    exampleCalls: [
      { input: {}, note: "Pass 2+ PDFs as files; order in = page order out." },
      { input: {}, note: "No options - the files are everything." },
    ],
  },
  {
    id: "browser.split-pdf",
    name: "Split PDF by ranges",
    category: "pdf",
    description: "Extract page ranges like \"1-3,7\" from a PDF into one new document, on the device.",
    runsIn: "browser",
    inputs: { type: "object", properties: { pages: text }, required: ["pages"], additionalProperties: false },
    outputs: { kind: "files", description: "One PDF holding the selected pages." },
    constraints: { maxBytes: 100 * 1024 * 1024, formats: ["pdf"], files: "one" },
    costHint: "medium",
    exampleCalls: [
      { input: { pages: "1-3" }, note: "First three pages." },
      { input: { pages: "2,4-5" }, note: "Ranges and single pages mix." },
    ],
  },
  {
    id: "browser.delete-pdf-pages",
    name: "Delete PDF pages",
    category: "pdf",
    description: "Remove the named pages from a PDF and keep the rest, on the device.",
    runsIn: "browser",
    inputs: { type: "object", properties: { pages: text }, required: ["pages"], additionalProperties: false },
    outputs: { kind: "files", description: "The PDF without those pages." },
    constraints: { maxBytes: 100 * 1024 * 1024, formats: ["pdf"], files: "one" },
    costHint: "medium",
    exampleCalls: [
      { input: { pages: "2,4" }, note: "Drops pages 2 and 4." },
      { input: { pages: "1" }, note: "Refuses to delete every page." },
    ],
  },

  /* ---------- image (canvas engine - browser only) ---------- */
  {
    id: "browser.compress-image",
    name: "Compress image",
    category: "image",
    description: "Recompress an image at a chosen quality using the on-device canvas engine.",
    runsIn: "browser",
    inputs: {
      type: "object",
      properties: { quality: int(1, 100) },
      additionalProperties: false,
    },
    outputs: { kind: "files", description: "The compressed image." },
    constraints: { maxBytes: 50 * 1024 * 1024, formats: ["png", "jpg", "webp"], files: "one" },
    costHint: "medium",
    domRequired: true,
    exampleCalls: [
      { input: { quality: 75 }, note: "Straight quality recompress." },
      { input: { quality: 40 }, note: "Aggressive - visibly smaller files." },
    ],
  },
  {
    id: "browser.compress-to-target-size",
    name: "Compress to target size",
    category: "image",
    description:
      "Fit a file under an exact size budget on-device: binary-searches for the HIGHEST quality that still fits (the GigAI Fit engine). Images, PDFs, video, audio and documents. Reports best-effort honestly when even the quality floor cannot reach the target.",
    runsIn: "browser",
    inputs: {
      type: "object",
      properties: { target_kb: int(1, 512000) },
      required: ["target_kb"],
      additionalProperties: false,
    },
    outputs: { kind: "files", description: "The fitted file, at the best quality that meets the budget." },
    constraints: { maxBytes: 2 * 1024 * 1024 * 1024, files: "one" },
    costHint: "medium",
    domRequired: true,
    exampleCalls: [
      { input: { target_kb: 150 }, note: "Email-attachment budget for a photo." },
      { input: { target_kb: 2048 }, note: "Fit a PDF under a 2 MB upload cap." },
    ],
  },
  {
    id: "browser.convert-image",
    name: "Convert image",
    category: "image",
    description: "Convert an image between PNG, JPEG and WebP on the device.",
    runsIn: "browser",
    inputs: {
      type: "object",
      properties: { format: { type: "string", enum: ["png", "jpeg", "webp"] } },
      required: ["format"],
      additionalProperties: false,
    },
    outputs: { kind: "files", description: "The converted image." },
    constraints: { maxBytes: 50 * 1024 * 1024, formats: ["png", "jpg", "webp", "gif"], files: "one" },
    costHint: "medium",
    domRequired: true,
    exampleCalls: [
      { input: { format: "webp" }, note: "PNG or JPEG in, WebP out." },
      { input: { format: "png" }, note: "Lossless target." },
    ],
  },
  {
    id: "browser.resize-image",
    name: "Resize image",
    category: "image",
    description: "Resize an image by width and/or height, keeping aspect ratio unless both are forced.",
    runsIn: "browser",
    inputs: {
      type: "object",
      properties: { width: int(1, 10000), height: int(1, 10000) },
      additionalProperties: false,
    },
    outputs: { kind: "files", description: "The resized image." },
    constraints: { maxBytes: 50 * 1024 * 1024, formats: ["png", "jpg", "webp"], files: "one" },
    costHint: "medium",
    domRequired: true,
    exampleCalls: [
      { input: { width: 1600 }, note: "Height follows the aspect ratio." },
      { input: { width: 400, height: 400 }, note: "Both set." },
    ],
  },
  {
    id: "browser.crop-image",
    name: "Crop image",
    category: "image",
    description: "Cut a rectangle (left, top, width, height in pixels) out of an image on the device.",
    runsIn: "browser",
    inputs: {
      type: "object",
      properties: { left: int(0, 100000), top: int(0, 100000), width: int(1, 100000), height: int(1, 100000) },
      required: ["width", "height"],
      additionalProperties: false,
    },
    outputs: { kind: "files", description: "The cropped image." },
    constraints: { maxBytes: 50 * 1024 * 1024, formats: ["png", "jpg", "webp"], files: "one" },
    costHint: "medium",
    domRequired: true,
    exampleCalls: [
      { input: { left: 0, top: 0, width: 200, height: 200 }, note: "Top-left square." },
      { input: { width: 100, height: 50 }, note: "left/top default to 0." },
    ],
  },
];

export function getBrowserTool(id: string): AgentToolSpec | undefined {
  return BROWSER_TOOLS.find((t) => t.id === id);
}
