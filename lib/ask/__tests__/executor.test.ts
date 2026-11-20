/** Execution loop tests: verification, single-correction, honest stops. */

import { describe, expect, it } from "vitest";

import type { RunToolResult } from "@/lib/agent/run-tool";
import { defaultCorrector, executePlan, verifyResult } from "@/lib/ask/executor";
import type { Plan } from "@/lib/ask/planner";

const blobOf = (kb: number, name = "out.webp") => ({ name, blob: new Blob([new Uint8Array(kb * 1024)]) });
const okResult = (kb: number, name?: string): RunToolResult => ({
  ok: true, outputFiles: [blobOf(kb, name)],
  metrics: { durationMs: 5, bytesIn: 0, bytesOut: kb * 1024 }, warnings: [],
});

describe("verifyResult", () => {
  it("passes when the size target is met and fails when missed", () => {
    const step = { toolId: "compress-image", input: { target_kb: 150 }, why: "" };
    expect(verifyResult(step, okResult(140)).ok).toBe(true);
    const miss = verifyResult(step, okResult(200));
    expect(miss.ok).toBe(false);
    expect(miss.reason).toContain("200 KB");
  });

  it("checks declared formats against the produced filename", () => {
    const step = { toolId: "browser.convert-image", input: { format: "webp" }, why: "" };
    expect(verifyResult(step, okResult(10, "photo.webp")).ok).toBe(true);
    expect(verifyResult(step, okResult(10, "photo.png")).ok).toBe(false);
  });

  it("rejects failed steps and empty outputs", () => {
    expect(verifyResult({ toolId: "x", input: {}, why: "" }, {
      ok: false, error: { code: "boom", message: "died" },
      metrics: { durationMs: 1, bytesIn: 0, bytesOut: 0 }, warnings: [],
    }).reason).toBe("died");
    expect(verifyResult({ toolId: "x", input: {}, why: "" }, okResult(0)).ok).toBe(false);
  });
});

describe("executePlan - the fixture-over-target loop", () => {
  it("misses the target, corrects once, then succeeds", async () => {
    const plan: Plan = {
      source: "heuristic",
      steps: [{ toolId: "browser.compress-image", input: { quality: 75, target_kb: 150 }, why: "shrink" }],
    };
    const calls: string[] = [];
    const report = await executePlan(plan, [blobOf(500, "in.jpg")], {
      runToolImpl: async (id, input) => {
        calls.push(id);
        // First attempt lands over target; the corrective server step fits.
        return id === "compress-image" && input.target_kb === 150 ? okResult(140) : okResult(200);
      },
    });
    expect(calls).toEqual(["browser.compress-image", "compress-image"]);
    expect(report.ok).toBe(true);
    expect(report.outcomes[0]!.verification.ok).toBe(false);
    expect(report.outcomes[0]!.correction?.verification.ok).toBe(true);
    expect(report.outputs[0]!.blob.size).toBe(140 * 1024);
  });

  it("stops honestly when the single correction also misses", async () => {
    const plan: Plan = {
      source: "heuristic",
      steps: [
        { toolId: "browser.compress-image", input: { target_kb: 10 }, why: "impossible" },
        { toolId: "browser.convert-image", input: { format: "webp" }, why: "never reached" },
      ],
    };
    let calls = 0;
    const report = await executePlan(plan, [blobOf(500, "in.jpg")], {
      runToolImpl: async () => {
        calls++;
        return okResult(300); // everything comes back over target
      },
    });
    expect(report.ok).toBe(false);
    expect(calls).toBe(2); // step + one correction, second planned step never runs
    expect(report.outcomes.length).toBe(1);
  });

  it("chains real pure tools end to end", async () => {
    const plan: Plan = {
      source: "heuristic",
      steps: [
        { toolId: "browser.csv-to-json", input: { text: "a,b\n1,2" }, why: "parse" },
        { toolId: "browser.format-json", input: { indent: 0 }, why: "minify" },
      ],
    };
    const report = await executePlan(plan, []);
    expect(report.ok).toBe(true);
    expect(await report.outputs[0]!.blob.text()).toBe('[{"a":"1","b":"2"}]');
    expect(report.totalMs).toBeGreaterThanOrEqual(0);
  });
});

describe("defaultCorrector", () => {
  it("escalates a missed target to the server engine, once", () => {
    const fix = defaultCorrector({ toolId: "browser.compress-image", input: { target_kb: 150 }, why: "" }, "over");
    expect(fix).toMatchObject({ toolId: "compress-image", input: { target_kb: 150 } });
  });

  it("gives up when no sensible correction exists", () => {
    expect(defaultCorrector({ toolId: "browser.format-json", input: {}, why: "" }, "?")).toBeNull();
  });
});
