/**
 * Ask GigAI - execution loop (PR 2).
 *
 * Runs a validated plan step by step through runTool (browser tools local,
 * server tools via the jobs API). After every step the result is VERIFIED
 * against what the step promised - a size target must actually be met, a
 * format conversion must actually produce that format. On a miss, one
 * corrective step may be proposed (deterministic corrector by default, a
 * model-backed one can be injected) - at most one correction per step,
 * plans stay capped at 6 planned steps.
 */

import type { AgentFile, RunToolResult } from "@/lib/agent/run-tool";
import type { Plan, PlanStep } from "./planner";

export interface StepOutcome {
  step: PlanStep;
  result: RunToolResult;
  verification: { ok: boolean; reason?: string };
  correction?: { step: PlanStep; result: RunToolResult; verification: { ok: boolean; reason?: string } };
}

export interface ExecutionReport {
  ok: boolean;
  outcomes: StepOutcome[];
  outputs: AgentFile[];
  totalMs: number;
}

const EXT_FOR_FORMAT: Record<string, string[]> = {
  webp: ["webp"], png: ["png"], jpeg: ["jpg", "jpeg"], avif: ["avif"],
  srt: ["srt"], vtt: ["vtt"],
};

/**
 * What did this step promise? Derived from its own input, so verification
 * is deterministic and cannot hallucinate expectations.
 */
export function verifyResult(step: PlanStep, result: RunToolResult): { ok: boolean; reason?: string } {
  if (!result.ok) return { ok: false, reason: result.error?.message ?? "The step failed." };

  const target = step.input.target_kb;
  if (typeof target === "number") {
    const bytes = result.outputFiles?.[0]?.blob.size ?? result.metrics.bytesOut;
    if (bytes > target * 1024) {
      return { ok: false, reason: `Output is ${Math.ceil(bytes / 1024)} KB, over the ${target} KB target.` };
    }
  }

  const format = step.input.format;
  if (typeof format === "string" && EXT_FOR_FORMAT[format] && result.outputFiles?.length) {
    const name = result.outputFiles[0]!.name.toLowerCase();
    if (!EXT_FOR_FORMAT[format]!.some((ext) => name.endsWith(`.${ext}`))) {
      return { ok: false, reason: `Output '${result.outputFiles[0]!.name}' is not ${String(format)}.` };
    }
  }

  if (result.outputFiles?.some((f) => f.blob.size === 0)) {
    return { ok: false, reason: "A step produced an empty file." };
  }
  return { ok: true };
}

/**
 * Deterministic corrector: the safe moves for the misses verification can
 * actually detect. Returns null when no sensible correction exists.
 */
export function defaultCorrector(step: PlanStep, reason: string): PlanStep | null {
  if (typeof step.input.target_kb === "number" && step.toolId !== "compress-image") {
    return {
      toolId: "compress-image",
      input: { target_kb: step.input.target_kb },
      why: `Previous step missed the size target (${reason}) - the server engine searches for the exact size.`,
    };
  }
  if (step.toolId === "browser.compress-image") {
    const q = typeof step.input.quality === "number" ? step.input.quality : 75;
    if (q > 30) {
      return { toolId: "browser.compress-image", input: { quality: Math.max(30, q - 25) }, why: `Retry harder: quality ${Math.max(30, q - 25)}.` };
    }
  }
  return null;
}

type RunToolFn = (
  id: string,
  input: Record<string, unknown>,
  files: AgentFile[],
  opts: { apiKey?: string },
) => Promise<RunToolResult>;

/** Text outputs become files so the next step can consume them uniformly. */
function carry(result: RunToolResult, previous: AgentFile[]): AgentFile[] {
  if (result.outputFiles?.length) return result.outputFiles;
  if (result.outputText !== undefined) {
    // Give recognizable text payloads a real name/type instead of .txt.
    const text = result.outputText;
    const [name, type] = text.trimStart().startsWith("<svg")
      ? ["output.svg", "image/svg+xml"]
      : /^\s*[[{]/.test(text)
        ? ["output.json", "application/json"]
        : ["step-output.txt", "text/plain"];
    return [{ name, blob: new Blob([text], { type }) }];
  }
  return previous;
}

export async function executePlan(
  plan: Plan,
  files: AgentFile[],
  opts: {
    apiKey?: string;
    onStep?: (index: number, phase: "run" | "verify" | "correct", outcome?: StepOutcome) => void;
    corrector?: (step: PlanStep, reason: string) => Promise<PlanStep | null> | PlanStep | null;
    runToolImpl?: RunToolFn;
  } = {},
): Promise<ExecutionReport> {
  const run: RunToolFn = opts.runToolImpl ?? (await import("@/lib/agent/run-tool")).runTool;
  const corrector = opts.corrector ?? defaultCorrector;
  const started = Date.now();
  const outcomes: StepOutcome[] = [];
  let current = files;

  for (const [i, step] of plan.steps.entries()) {
    opts.onStep?.(i, "run");
    const result = await run(step.toolId, step.input, current, { apiKey: opts.apiKey });
    opts.onStep?.(i, "verify");
    const verification = verifyResult(step, result);
    const outcome: StepOutcome = { step, result, verification };
    outcomes.push(outcome);

    if (verification.ok) {
      current = carry(result, current);
      opts.onStep?.(i, "run", outcome);
      continue;
    }

    // One correction, then accept whatever state we reach.
    const fix = await corrector(step, verification.reason ?? "verification failed");
    if (fix) {
      opts.onStep?.(i, "correct");
      const fixResult = await run(fix.toolId, fix.input, current, { apiKey: opts.apiKey });
      const fixVerification = verifyResult({ ...fix, input: { ...step.input, ...fix.input } }, fixResult);
      outcome.correction = { step: fix, result: fixResult, verification: fixVerification };
      if (fixVerification.ok) {
        current = carry(fixResult, current);
        continue;
      }
    }
    // Unrecoverable step: stop honestly rather than cascading garbage.
    return { ok: false, outcomes, outputs: current === files ? [] : current, totalMs: Date.now() - started };
  }

  return { ok: true, outcomes, outputs: current === files ? [] : current, totalMs: Date.now() - started };
}
