/**
 * Dispatches SVG optimization to the Web Worker when available, falling back to
 * a synchronous main-thread run (old browsers, worker bootstrap failure, SSR).
 * Mirrors `lib/image/pixel-runner.ts`. Callers get one async function.
 */
import { runOptimize, type EngineOptions, type OptimizeResult } from "./svgo-engine";
import type { OptimizeWorkResponse } from "./optimize.worker";

let worker: Worker | null = null;
let workerBroken = false;
let nextId = 1;
const pending = new Map<number, { resolve: (r: OptimizeResult) => void; reject: (e: Error) => void }>();

function getWorker(): Worker | null {
  if (workerBroken || typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL("./optimize.worker.ts", import.meta.url));
    worker.onmessage = (event: MessageEvent<OptimizeWorkResponse>) => {
      const job = pending.get(event.data.id);
      if (!job) return;
      pending.delete(event.data.id);
      job.resolve(event.data.result);
    };
    worker.onerror = () => {
      workerBroken = true;
      for (const [, job] of pending) job.reject(new Error("optimize worker crashed"));
      pending.clear();
      worker?.terminate();
      worker = null;
    };
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

/**
 * Optimize `svg` with `opts`, off the main thread when possible. Always
 * resolves (never rejects), a worker failure transparently retries on the
 * main thread.
 */
export async function optimizeAsync(svg: string, opts: EngineOptions): Promise<OptimizeResult> {
  const w = getWorker();
  if (!w) return runOptimize(svg, opts);
  const id = nextId++;
  try {
    return await new Promise<OptimizeResult>((resolve, reject) => {
      pending.set(id, { resolve, reject });
      w.postMessage({ id, svg, opts });
    });
  } catch {
    return runOptimize(svg, opts);
  }
}
