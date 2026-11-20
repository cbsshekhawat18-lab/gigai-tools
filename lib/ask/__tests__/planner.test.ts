/** Ask GigAI planner tests: validation, mismatch rejection, heuristics, parsing. */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { BROWSER_TOOLS } from "@/lib/agent/registry";
import {
  buildPlanPrompt, heuristicPlan, parseModelPlan, validatePlan,
  type Catalogue, type FileMeta,
} from "@/lib/ask/planner";
import { ENGINES_MANIFEST } from "@/lib/engines-manifest";

const ENGINES = JSON.parse(
  readFileSync(ENGINES_MANIFEST, "utf8"),
) as Record<string, { name: string; description: string; options_schema: Record<string, unknown> }>;

const catalogue: Catalogue = {
  browser: BROWSER_TOOLS,
  server: Object.entries(ENGINES).map(([id, e]) => ({
    id, name: e.name, description: e.description, inputs: e.options_schema, constraints: {},
  })),
};

const img: FileMeta = { name: "photo.jpg", type: "image/jpeg", size: 2_000_000, width: 4000, height: 3000 };
const pdf: FileMeta = { name: "report.pdf", type: "application/pdf", size: 500_000 };

describe("validatePlan", () => {
  it("accepts a valid mixed browser/server plan", () => {
    const r = validatePlan({ steps: [
      { toolId: "browser.resize-image", input: { width: 800 }, why: "resize" },
      { toolId: "compress-image", input: { target_kb: 150 }, why: "fit budget" },
    ] }, catalogue);
    expect(r.ok).toBe(true);
  });

  it("rejects tools that are not in the catalogue", () => {
    const r = validatePlan({ steps: [{ toolId: "make-it-pop", input: {}, why: "?" }] }, catalogue);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("not in the catalogue");
  });

  it("rejects unknown options, wrong types, bad enums and range breaks", () => {
    const cases: [Record<string, unknown>, string][] = [
      [{ steps: [{ toolId: "browser.format-json", input: { text: "x", sparkle: true }, why: "w" }] }, "no option 'sparkle'"],
      [{ steps: [{ toolId: "browser.resize-image", input: { width: "800" }, why: "w" }] }, "must be an integer"],
      [{ toolId: "none" }, "steps array"],
      [{ steps: [{ toolId: "browser.convert-image", input: { format: "bmp" }, why: "w" }] }, "one of"],
      [{ steps: [{ toolId: "browser.resize-image", input: { width: 999999 }, why: "w" }] }, "above"],
      [{ steps: [{ toolId: "generate-qr", input: {}, why: "w" }] }, "requires option 'text'"],
    ];
    for (const [plan, fragment] of cases) {
      const r = validatePlan(plan, catalogue);
      expect(r.ok, JSON.stringify(plan)).toBe(false);
      if (!r.ok) expect(r.error).toContain(fragment);
    }
  });

  it("caps plans at six steps", () => {
    const step = { toolId: "browser.format-json", input: { text: "{}" }, why: "w" };
    const r = validatePlan({ steps: Array(7).fill(step) }, catalogue);
    expect(r.ok).toBe(false);
  });
});

describe("heuristicPlan", () => {
  it("plans resize -> convert -> compress-to-target from one sentence", () => {
    const plan = heuristicPlan("resize to 800 wide, convert to webp, under 150kb", [img], catalogue);
    expect(plan.steps.map((s) => s.toolId)).toEqual([
      "browser.resize-image", "browser.convert-image", "browser.compress-to-target-size",
    ]);
    expect(plan.steps[2]!.input.target_kb).toBe(150);
    expect(validatePlan(plan, catalogue).ok).toBe(true);
  });

  it("plans pdf intents: rotate, extract pages, ocr, watermark", () => {
    expect(heuristicPlan("rotate this 90 degrees", [pdf], catalogue).steps[0]!.toolId).toBe("rotate-pdf");
    const split = heuristicPlan("extract pages 1-3,7 into a new pdf", [pdf], catalogue);
    expect(split.steps[0]).toMatchObject({ toolId: "browser.split-pdf", input: { pages: "1-3,7" } });
    expect(heuristicPlan("this is scanned, make the text readable", [pdf], catalogue).steps[0]!.toolId).toBe("ocr-pdf");
    const wm = heuristicPlan("watermark with DRAFT", [pdf], catalogue);
    expect(wm.steps[0]).toMatchObject({ toolId: "watermark-pdf", input: { text: "DRAFT" } });
  });

  it("plans data conversions and a qr without files", () => {
    const csv = heuristicPlan("turn this into csv", [{ name: "d.json", type: "application/json", size: 100 }], catalogue);
    expect(csv.steps[0]!.toolId).toBe("browser.json-to-csv");
    const qr = heuristicPlan("make a qr code for https://gigai.tools", [], catalogue);
    expect(qr.steps[0]).toMatchObject({ toolId: "browser.generate-qr-svg", input: { text: "https://gigai.tools" } });
  });

  it("returns an empty plan rather than guessing", () => {
    const plan = heuristicPlan("write me a poem about clouds", [img], catalogue);
    expect(plan.steps).toEqual([]);
  });

  it("every heuristic plan validates against the catalogue", () => {
    const goals: [string, FileMeta[]][] = [
      ["compress this", [img]],
      ["1200x630 png please", [img]],
      ["merge these", [pdf, { ...pdf, name: "b.pdf" }]],
      ["minify", [{ name: "app.js", type: "text/javascript", size: 100 }]],
      ["redact the aadhaar numbers", [{ name: "list.txt", type: "text/plain", size: 100 }]],
    ];
    for (const [goal, files] of goals) {
      const plan = heuristicPlan(goal, files, catalogue);
      if (plan.steps.length) {
        expect(validatePlan(plan, catalogue).ok, goal).toBe(true);
      }
    }
  });
});

describe("model plumbing", () => {
  it("prompt carries metadata and catalogue but never contents", () => {
    const prompt = buildPlanPrompt("shrink it", [img], catalogue);
    expect(prompt).toContain('"name":"photo.jpg"');
    expect(prompt).toContain("browser.resize-image");
    expect(prompt).not.toContain("base64");
  });

  it("parses JSON out of fenced and noisy model answers", () => {
    const noisy = 'Sure! Here is the plan:\n```json\n{"steps":[{"toolId":"browser.format-json","input":{"text":"{}"},"why":"tidy"}]}\n```\nHope that helps!';
    const parsed = parseModelPlan(noisy);
    expect(validatePlan(parsed, catalogue).ok).toBe(true);
    expect(parseModelPlan("no json here at all")).toBeNull();
  });
});
