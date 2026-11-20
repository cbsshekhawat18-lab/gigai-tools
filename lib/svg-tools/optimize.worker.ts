/**
 * SVG optimize Web Worker: keeps SVGO (a ~780 KB engine that can chew on
 * multi-MB SVGs) off the main thread so the UI never freezes. It runs the exact
 * same `runOptimize` used by the main-thread fallback, so output is identical.
 * SVGO is pure JS (no DOM), so it runs fine in a worker.
 */
import { runOptimize, type EngineOptions, type OptimizeResult } from "./svgo-engine";

export interface OptimizeWorkRequest {
  id: number;
  svg: string;
  opts: EngineOptions;
}

export interface OptimizeWorkResponse {
  id: number;
  result: OptimizeResult;
}

self.onmessage = async (event: MessageEvent<OptimizeWorkRequest>) => {
  const { id, svg, opts } = event.data;
  let result: OptimizeResult;
  try {
    result = await runOptimize(svg, opts);
  } catch (err) {
    result = { ok: false, data: "", engine: "fallback", error: err instanceof Error ? err.message : String(err) };
  }
  const response: OptimizeWorkResponse = { id, result };
  (self as unknown as Worker).postMessage(response);
};
