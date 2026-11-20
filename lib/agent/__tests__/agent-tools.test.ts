/**
 * Agent registry + runTool tests.
 *
 * Three layers: (1) the registry is well-formed and every declared tool has
 * a live executor, (2) the browser and server id spaces cannot drift into
 * each other (the server manifest is read from backend/app/v1/engines.json, the
 * same file the API validates against), (3) golden runs through runTool on
 * representative tools assert real output properties, not just "no throw".
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { BROWSER_TOOLS } from "@/lib/agent/registry";
import { runTool, type AgentFile } from "@/lib/agent/run-tool";
import { ENGINES_MANIFEST } from "@/lib/engines-manifest";

const ENGINES: Record<string, unknown> = JSON.parse(
  readFileSync(ENGINES_MANIFEST, "utf8"),
);

async function fixturePdf(pages: number): Promise<AgentFile> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([200, 200]);
  return { name: `fixture-${pages}.pdf`, blob: new Blob([await doc.save() as BlobPart]) };
}

async function loadedPages(file: AgentFile): Promise<number> {
  const { PDFDocument } = await import("pdf-lib");
  return (await PDFDocument.load(await file.blob.arrayBuffer())).getPageCount();
}

describe("registry shape", () => {
  it("has unique, prefixed ids and complete entries", () => {
    const ids = BROWSER_TOOLS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const tool of BROWSER_TOOLS) {
      expect(tool.id).toMatch(/^browser\.[a-z0-9-]+$/);
      expect(tool.runsIn).toBe("browser");
      expect(tool.description.length).toBeGreaterThan(20);
      expect(tool.exampleCalls.length).toBeGreaterThanOrEqual(2);
      expect(tool.inputs.type).toBe("object");
      expect(["files", "text", "report"]).toContain(tool.outputs.kind);
    }
  });

  it("declares a meaningful first batch", () => {
    expect(BROWSER_TOOLS.length).toBeGreaterThanOrEqual(15);
  });

  it("every registry entry has a live executor", async () => {
    for (const tool of BROWSER_TOOLS) {
      const result = await runTool(tool.id, {}, []);
      // Any error is fine except "this tool does not exist".
      expect(result.error?.code, tool.id).not.toBe("unknown_tool");
    }
  });
});

describe("drift against the server manifest", () => {
  it("server engine ids never enter the browser namespace", () => {
    for (const id of Object.keys(ENGINES)) {
      expect(id.startsWith("browser.")).toBe(false);
    }
  });

  it("browser ids never shadow a server engine", () => {
    const serverIds = new Set(Object.keys(ENGINES));
    for (const tool of BROWSER_TOOLS) {
      expect(serverIds.has(tool.id)).toBe(false);
    }
  });
});

describe("runTool golden runs", () => {
  it("format-json pretty-prints and minifies", async () => {
    const pretty = await runTool("browser.format-json", { text: '{"b":1,"a":2}', indent: 2 });
    expect(pretty.ok).toBe(true);
    expect(pretty.outputText).toContain('\n  "b": 1');
    const min = await runTool("browser.format-json", { text: '{ "a" : 1 }', indent: 0 });
    expect(min.outputText).toBe('{"a":1}');
    expect(min.metrics.durationMs).toBeGreaterThanOrEqual(0);
    expect(min.metrics.bytesOut).toBeGreaterThan(0);
  });

  it("format-json reports invalid input as an error", async () => {
    const r = await runTool("browser.format-json", { text: "{nope" });
    expect(r.ok).toBe(false);
    expect(r.error?.code).toBe("invalid_input");
  });

  it("csv-to-json and back round-trips", async () => {
    const json = await runTool("browser.csv-to-json", { text: "name,count\nalpha,3" });
    expect(json.ok).toBe(true);
    expect(JSON.parse(json.outputText!)[0].name).toBe("alpha");
    const csv = await runTool("browser.json-to-csv", { text: '[{"name":"alpha","count":3}]' });
    expect(csv.ok).toBe(true);
    expect(csv.outputText).toMatch(/^name,count/);
  });

  it("merge-pdf combines page counts", async () => {
    const r = await runTool("browser.merge-pdf", {}, [await fixturePdf(1), await fixturePdf(2)]);
    expect(r.ok).toBe(true);
    expect(await loadedPages(r.outputFiles![0]!)).toBe(3);
  });

  it("split-pdf extracts the named range", async () => {
    const r = await runTool("browser.split-pdf", { pages: "1-2,4" }, [await fixturePdf(5)]);
    expect(r.ok).toBe(true);
    expect(await loadedPages(r.outputFiles![0]!)).toBe(3);
  });

  it("delete-pdf-pages refuses to empty the document", async () => {
    const r = await runTool("browser.delete-pdf-pages", { pages: "1-2" }, [await fixturePdf(2)]);
    expect(r.ok).toBe(false);
    expect(r.error?.code).toBe("invalid_option");
  });

  it("subtitles convert to VTT and shift", async () => {
    const srt = "1\n00:00:01,000 --> 00:00:02,000\nHello\n";
    const vtt = await runTool("browser.convert-subtitles", { text: srt, format: "vtt" });
    expect(vtt.ok).toBe(true);
    expect(vtt.outputText).toMatch(/^WEBVTT/);
    expect(vtt.outputText).toContain("00:00:01.000");
    const shifted = await runTool("browser.shift-subtitles", { text: srt, delta_ms: 500 });
    expect(shifted.outputText).toContain("00:00:01,500");
  });

  it("generate-qr-svg emits a structurally valid code", async () => {
    const r = await runTool("browser.generate-qr-svg", { text: "https://gigai.tools" });
    expect(r.ok).toBe(true);
    expect(r.outputText).toMatch(/^<svg/);
    // A QR matrix is square with an odd module count of at least 21.
    const rects = (r.outputText!.match(/<rect x=/g) ?? []).length;
    expect(rects).toBeGreaterThan(100);
  });

  it("dom-required tools answer cleanly in a DOM-less runtime", async () => {
    const png = { name: "x.png", blob: new Blob([new Uint8Array([137, 80, 78, 71])]) };
    const r = await runTool("browser.convert-image", { format: "webp" }, [png]);
    expect(r.ok).toBe(false);
    expect(r.error?.code).toBe("dom_required");
  });

  it("server ids without a key are refused with guidance", async () => {
    const r = await runTool("ocr-pdf", { langs: "eng" }, []);
    expect(r.ok).toBe(false);
    expect(r.error?.code).toBe("key_required");
  });

  it("enforces per-tool byte limits", async () => {
    const big = { name: "big.txt", blob: new Blob([new Uint8Array(11 * 1024 * 1024)]) };
    const r = await runTool("browser.format-json", {}, [big]);
    expect(r.ok).toBe(false);
    expect(r.error?.code).toBe("file_too_large");
  });
});

describe("agent catalogue route", () => {
  it("composes both halves without drift", async () => {
    const { GET } = await import("@/app/agent-catalog.json/route");
    const body = JSON.parse(await GET().text());
    expect(body.browser.length).toBe(BROWSER_TOOLS.length);
    expect(body.server.length).toBe(Object.keys(ENGINES).length);
    const ids = [...body.browser, ...body.server].map((t: { id: string }) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const tool of body.server) {
      expect(tool.runsIn).toBe("server");
      expect(tool.constraints.files).toMatch(/^(none|one|many)$/);
    }
  });
});
