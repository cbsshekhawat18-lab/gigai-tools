/**
 * GigAI Smart Assist, the RUNNER (executes a plan's inline steps).
 *
 * A tiny, purpose-built sequential executor for the linear "one file → run the
 * plan → get the output" flow. It threads each step's output into the next step
 * (a real pipeline) using the headless {@link getAssistOperation} adapters, so
 * all work happens in existing engines. Not a React hook: the UI calls it with
 * a progress callback. Files never leave the browser.
 */

import { getAssistOperation } from "@/lib/assist/operations";
import type {
  AssistAsset,
  AssistProgress,
  AssistRunResult,
  AssistStep,
} from "@/lib/assist/types";

/** Build the initial working asset from an uploaded file. */
export function toAssistAsset(file: File, kind: AssistAsset["kind"]): AssistAsset {
  return {
    blob: file,
    name: file.name,
    kind,
    meta: { size: file.size, mime: file.type || "" },
  };
}

/**
 * Run `steps` in order over `asset`, feeding each step's output into the next.
 * Progress is reported across the whole pipeline (0..1). Throws with a friendly
 * message if a step's operation is unknown or an engine call fails, the caller
 * surfaces it and the file is untouched.
 */
export async function runPlan(
  asset: AssistAsset,
  steps: AssistStep[],
  onProgress?: AssistProgress,
): Promise<AssistRunResult> {
  if (steps.length === 0) throw new Error("There's nothing to run for this file.");
  const originalSize = asset.blob.size;
  let current = asset;

  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i]!;
    const op = getAssistOperation(step.operationId);
    if (!op) throw new Error(`Step "${step.label}" isn't available.`);
    if (!op.accepts.includes(current.kind)) {
      throw new Error(`"${step.label}" can't run on this file.`);
    }
    const base = i / steps.length;
    const span = 1 / steps.length;
    const result = await op.run(current, step.params, (f, s) =>
      onProgress?.(base + f * span, s ?? step.label),
    );
    current = {
      blob: result.blob,
      name: result.name ?? current.name,
      // If an op changed the asset kind (e.g. image → PDF), reflect it so a
      // subsequent step validates against the new kind.
      kind: result.meta?.mime === "application/pdf" ? "pdf" : current.kind,
      meta: { ...current.meta, ...result.meta, size: result.blob.size },
    };
  }

  onProgress?.(1, "Ready");
  return {
    blob: current.blob,
    name: current.name,
    meta: current.meta,
    originalSize,
    finalSize: current.blob.size,
  };
}
