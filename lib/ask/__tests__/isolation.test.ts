/**
 * Network isolation: Tier-1 planning plus a browser-only pipeline must
 * complete with the network hard-down. Any fetch during the run is a bug.
 */

import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BROWSER_TOOLS } from "@/lib/agent/registry";
import { executePlan } from "@/lib/ask/executor";
import { heuristicPlan, validatePlan, type Catalogue } from "@/lib/ask/planner";
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

describe("network isolation", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("plans and runs a browser-only pipeline with fetch disabled", async () => {
    const trap = vi.fn(() => {
      throw new Error("network call during an on-device run");
    });
    vi.stubGlobal("fetch", trap);

    const plan = heuristicPlan(
      "make a qr code for https://gigai.tools",
      [],
      catalogue,
    );
    expect(validatePlan(plan, catalogue).ok).toBe(true);
    expect(plan.steps.every((s) => s.toolId.startsWith("browser."))).toBe(true);

    const report = await executePlan(plan, []);
    expect(report.ok).toBe(true);
    expect(report.outputs[0]!.name).toBe("output.svg");
    expect(trap).not.toHaveBeenCalled();
  });
});
