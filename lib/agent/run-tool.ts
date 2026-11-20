/**
 * runTool - the uniform executor over the agent tool registry.
 *
 * Browser tools run right here by calling the same engine functions the tool
 * pages use (lazily imported, so this module stays light). Server tool ids
 * (any id without the "browser." prefix) are routed through the public jobs
 * API with the caller's key. Every path returns the same result shape, so
 * planners (Smart Assist, Ask-mode agents, Site Audit fix links) never care
 * where a tool ran.
 */

import { BROWSER_TOOLS, getBrowserTool } from "./registry";

export interface AgentFile {
  name: string;
  blob: Blob;
}

export interface RunToolResult {
  ok: boolean;
  /** File outputs, when the tool produces files. */
  outputFiles?: AgentFile[];
  /** Text output, when the tool produces text (formatted JSON, SVG, CSV...). */
  outputText?: string;
  /** Structured report, for validate-style tools. */
  report?: Record<string, unknown>;
  metrics: { durationMs: number; bytesIn: number; bytesOut: number };
  warnings: string[];
  error?: { code: string; message: string };
}

type Executor = (
  input: Record<string, unknown>,
  files: AgentFile[],
) => Promise<Omit<RunToolResult, "metrics" | "warnings"> & { warnings?: string[] }>;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
};

function renamed(original: string, mime?: string): string {
  const ext = mime ? MIME_EXT[mime] : undefined;
  return ext ? original.replace(/\.[^.]+$/, "") + "." + ext : original;
}

function fail(code: string, message: string) {
  return { ok: false as const, error: { code, message } };
}

function textOf(input: Record<string, unknown>, files: AgentFile[]): Promise<string> {
  if (typeof input.text === "string") return Promise.resolve(input.text);
  if (files[0]) return files[0].blob.text();
  return Promise.reject(new Error("Provide 'text' or one input file."));
}

/** "1-3,7" -> sorted unique 1-based page numbers, validated against total. */
function parsePages(spec: string, total: number): number[] {
  const out = new Set<number>();
  for (const part of spec.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw new Error(`'${part}' is not a page or range like 2 or 4-7.`);
    const a = Number(m[1]);
    const b = Number(m[2] ?? m[1]);
    if (a < 1 || b > total || a > b) throw new Error(`Range '${part}' is outside this ${total}-page document.`);
    for (let p = a; p <= b; p++) out.add(p);
  }
  if (!out.size) throw new Error("The 'pages' option selected no pages.");
  return [...out].sort((x, y) => x - y);
}

async function pdfPageCount(f: AgentFile): Promise<number> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(await f.blob.arrayBuffer(), { updateMetadata: false });
  return doc.getPageCount();
}

function toPdfInput(f: AgentFile) {
  const file = f.blob instanceof File ? f.blob : new File([f.blob], f.name, { type: "application/pdf" });
  return { file, name: f.name };
}

const EXECUTORS: Record<string, Executor> = {
  "browser.format-json": async (input, files) => {
    const { formatJson } = await import("@/lib/dev/json");
    const r = formatJson(await textOf(input, files), (input.indent as number) ?? 2);
    return r.ok ? { ok: true, outputText: r.result } : fail("invalid_input", r.error.message);
  },

  "browser.sort-json-keys": async (input, files) => {
    const { sortJsonKeys } = await import("@/lib/dev/json");
    const r = sortJsonKeys(await textOf(input, files), (input.indent as number) ?? 2);
    return r.ok ? { ok: true, outputText: r.result } : fail("invalid_input", r.error.message);
  },

  "browser.validate-json": async (input, files) => {
    const { validateJson } = await import("@/lib/dev/json");
    const report = validateJson(await textOf(input, files));
    return { ok: true, report: report as unknown as Record<string, unknown> };
  },

  "browser.csv-to-json": async (input, files) => {
    const { csvToJson } = await import("@/lib/document-tools/csv");
    const r = await csvToJson(await textOf(input, files), { pretty: true });
    return r.ok ? { ok: true, outputText: r.result } : fail("invalid_input", String(r.error));
  },

  "browser.json-to-csv": async (input, files) => {
    const { jsonToCsv } = await import("@/lib/document-tools/csv");
    const r = await jsonToCsv(await textOf(input, files));
    return r.ok ? { ok: true, outputText: r.result } : fail("invalid_input", String(r.error));
  },

  "browser.convert-subtitles": async (input, files) => {
    const { parseSubtitles, serialise } = await import("@/lib/subtitles");
    const { cues } = parseSubtitles(await textOf(input, files));
    if (!cues.length) return fail("invalid_input", "No subtitle cues found.");
    return { ok: true, outputText: serialise(cues, input.format as "srt" | "vtt") };
  },

  "browser.shift-subtitles": async (input, files) => {
    const { parseSubtitles, serialise, shiftCues } = await import("@/lib/subtitles");
    const { cues, format } = parseSubtitles(await textOf(input, files));
    if (!cues.length) return fail("invalid_input", "No subtitle cues found.");
    return { ok: true, outputText: serialise(shiftCues(cues, input.delta_ms as number), format) };
  },

  "browser.generate-qr-svg": async (input) => {
    const { buildMatrix } = await import("@/lib/qr/matrix");
    const matrix = buildMatrix(String(input.text ?? ""));
    const px = (input.module_px as number) ?? 8;
    const quiet = 4;
    const n = matrix.length;
    const size = (n + quiet * 2) * px;
    const rects = matrix
      .flatMap((row, y) =>
        row.map((on, x) =>
          on ? `<rect x="${(x + quiet) * px}" y="${(y + quiet) * px}" width="${px}" height="${px}"/>` : "",
        ),
      )
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#000">${rects}</g></svg>`;
    return { ok: true, outputText: svg };
  },

  "browser.merge-pdf": async (_input, files) => {
    if (files.length < 2) return fail("needs_two_inputs", "Pass at least 2 PDF files.");
    const { mergePdfs } = await import("@/lib/pdf/ops");
    const out = await mergePdfs(files.map(toPdfInput));
    return { ok: true, outputFiles: [{ name: out.name, blob: out.blob }] };
  },

  "browser.split-pdf": async (input, files) => {
    if (!files[0]) return fail("invalid_input", "Pass one PDF file.");
    const { extractPages } = await import("@/lib/pdf/ops");
    const total = await pdfPageCount(files[0]);
    const pages = parsePages(String(input.pages), total);
    const out = await extractPages(toPdfInput(files[0]), pages);
    return { ok: true, outputFiles: [{ name: out.name, blob: out.blob }] };
  },

  "browser.delete-pdf-pages": async (input, files) => {
    if (!files[0]) return fail("invalid_input", "Pass one PDF file.");
    const { deletePages } = await import("@/lib/pdf/ops");
    const total = await pdfPageCount(files[0]);
    const pages = parsePages(String(input.pages), total);
    if (pages.length >= total) return fail("invalid_option", "Deleting every page would leave an empty document.");
    const out = await deletePages(toPdfInput(files[0]), pages);
    return { ok: true, outputFiles: [{ name: out.name, blob: out.blob }] };
  },

  /* Canvas engine tools - guarded, browser only. */
  "browser.compress-image": async (input, files) => {
    if (typeof document === "undefined") return fail("dom_required", "This tool needs a browser.");
    if (!files[0]) return fail("invalid_input", "Pass one image file.");
    const { loadImageFile } = await import("@/lib/image/engine");
    const { compressPro } = await import("@/lib/image/pro");
    const img = await loadImageFile(toPdfInput(files[0]).file);
    const r = await compressPro(img, { quality: ((input.quality as number) ?? 75) / 100 });
    return { ok: true, outputFiles: [{ name: renamed(files[0].name, r.format), blob: r.blob }] };
  },

  "browser.compress-to-target-size": async (input, files) => {
    if (typeof document === "undefined") return fail("dom_required", "This tool needs a browser.");
    if (!files[0]) return fail("invalid_input", "Pass one file.");
    const file = toPdfInput(files[0]).file;
    const [{ detectFile }, { adapterFor }, { fitToTarget }] = await Promise.all([
      import("@/lib/file-intel/detect"),
      import("@/lib/file-intel/adapters"),
      import("@/lib/file-intel/target-size"),
    ]);
    const detected = await detectFile(file);
    const adapter = adapterFor(detected.kind);
    if (!adapter) return fail("invalid_input", `No size-fitting support for ${detected.label}.`);
    const probe = await adapter.probe(file);
    if (!probe.ok) return fail("invalid_input", probe.reason);
    const result = await fitToTarget(file, adapter, probe.info, {
      targetBytes: (input.target_kb as number) * 1024,
    });
    return {
      ok: true,
      outputFiles: [{ name: result.name, blob: result.blob }],
      warnings: result.outcome === "best-effort"
        ? [`Best effort: ${Math.ceil(result.size / 1024)} KB is the smallest the quality floor allows.`]
        : [],
    };
  },

  "browser.convert-image": async (input, files) => {
    if (typeof document === "undefined") return fail("dom_required", "This tool needs a browser.");
    if (!files[0]) return fail("invalid_input", "Pass one image file.");
    const { loadImageFile } = await import("@/lib/image/engine");
    const { convertPro } = await import("@/lib/image/pro");
    const img = await loadImageFile(toPdfInput(files[0]).file);
    const mime = `image/${input.format === "jpg" ? "jpeg" : String(input.format)}`;
    const r = await convertPro(img, { format: mime } as Parameters<typeof convertPro>[1]);
    return { ok: true, outputFiles: [{ name: renamed(files[0].name, r.format), blob: r.blob }] };
  },

  "browser.resize-image": async (input, files) => {
    if (typeof document === "undefined") return fail("dom_required", "This tool needs a browser.");
    if (!files[0]) return fail("invalid_input", "Pass one image file.");
    const { loadImageFile } = await import("@/lib/image/engine");
    const { resizePro } = await import("@/lib/image/pro");
    if (!input.width && !input.height) return fail("invalid_option", "Give a width, a height, or both.");
    const img = await loadImageFile(toPdfInput(files[0]).file);
    const width = (input.width as number) ?? Math.round((input.height as number) * (img.width / img.height));
    const height = (input.height as number) ?? Math.round((input.width as number) * (img.height / img.width));
    const r = await resizePro(img, { width, height });
    return { ok: true, outputFiles: [{ name: renamed(files[0].name, r.format), blob: r.blob }] };
  },

  "browser.crop-image": async (input, files) => {
    if (typeof document === "undefined") return fail("dom_required", "This tool needs a browser.");
    if (!files[0]) return fail("invalid_input", "Pass one image file.");
    const { loadImageFile, cropImage } = await import("@/lib/image/engine");
    const img = await loadImageFile(toPdfInput(files[0]).file);
    const r = await cropImage(img, {
      x: (input.left as number) ?? 0,
      y: (input.top as number) ?? 0,
      width: input.width as number,
      height: input.height as number,
    });
    return { ok: true, outputFiles: [{ name: renamed(files[0].name, r.format), blob: r.blob }] };
  },
};

/** Route a server engine through the public jobs API with the caller's key. */
async function runServerTool(
  id: string,
  input: Record<string, unknown>,
  files: AgentFile[],
  apiKey: string,
): Promise<Omit<RunToolResult, "metrics" | "warnings">> {
  const tasks: Record<string, Record<string, unknown>> = {};
  const names: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const buf = new Uint8Array(await files[i]!.blob.arrayBuffer());
    let bin = "";
    for (let j = 0; j < buf.length; j += 0x8000) {
      bin += String.fromCharCode(...buf.subarray(j, j + 0x8000));
    }
    tasks[`in${i}`] = { operation: "import/base64", file: btoa(bin), filename: files[i]!.name };
    names.push(`in${i}`);
  }
  tasks.work = { operation: id, ...(names.length ? { input: names } : {}), ...input };
  tasks.out = { operation: "export/url", input: ["work"] };

  const headers = { authorization: `Bearer ${apiKey}`, "content-type": "application/json" };
  const created = await fetch("/v1/jobs", {
    method: "POST",
    headers,
    body: JSON.stringify({ tag: "agent", retention_s: 900, tasks }),
  }).then((r) => r.json());
  if (!created.id) {
    const err = (created.detail ?? created).error ?? {};
    return fail(err.code ?? "server_error", err.message ?? "The server tool failed to start.");
  }
  let job = created;
  while (!["finished", "error", "cancelled"].includes(job.status)) {
    job = await fetch(`/v1/jobs/${created.id}/wait`, { headers }).then((r) => r.json());
  }
  if (job.status !== "finished") {
    const failedTask = (job.tasks as { error?: { code: string; message: string } }[]).find((t) => t.error);
    return fail(failedTask?.error?.code ?? "job_failed", failedTask?.error?.message ?? "The job did not finish.");
  }
  const exportTask = (job.tasks as { operation: string; result?: { files: { filename: string; url: string }[] } }[])
    .find((t) => t.operation === "export/url");
  const outputFiles: AgentFile[] = [];
  for (const f of exportTask?.result?.files ?? []) {
    const blob = await fetch(f.url).then((r) => r.blob());
    outputFiles.push({ name: f.filename, blob });
  }
  return { ok: true, outputFiles };
}

export async function runTool(
  id: string,
  input: Record<string, unknown> = {},
  files: AgentFile[] = [],
  opts: { apiKey?: string } = {},
): Promise<RunToolResult> {
  const started = Date.now();
  const bytesIn = files.reduce((n, f) => n + f.blob.size, 0);
  const warnings: string[] = [];

  let core: Omit<RunToolResult, "metrics" | "warnings"> & { warnings?: string[] };
  try {
    if (id.startsWith("browser.")) {
      const spec = getBrowserTool(id);
      const exec = EXECUTORS[id];
      if (!spec || !exec) {
        core = fail("unknown_tool", `No browser tool '${id}'. ${BROWSER_TOOLS.length} are registered.`);
      } else if (spec.constraints.maxBytes && bytesIn > spec.constraints.maxBytes) {
        core = fail("file_too_large", `Inputs exceed ${spec.constraints.maxBytes} bytes for ${id}.`);
      } else {
        core = await exec(input, files);
      }
    } else if (opts.apiKey) {
      core = await runServerTool(id, input, files, opts.apiKey);
    } else {
      core = fail("key_required", `'${id}' runs on the server - pass an API key.`);
    }
  } catch (err) {
    core = fail("tool_failed", err instanceof Error ? err.message : "The tool failed unexpectedly.");
  }

  const bytesOut =
    (core.outputFiles?.reduce((n, f) => n + f.blob.size, 0) ?? 0) +
    (core.outputText ? new Blob([core.outputText]).size : 0);
  return {
    ...core,
    warnings: [...warnings, ...(core.warnings ?? [])],
    metrics: { durationMs: Date.now() - started, bytesIn, bytesOut },
  };
}
