/**
 * Worker client for the GigAI Fit image encoder.
 *
 * Falls back to the main-thread engine whenever the worker can't be used -
 * an older browser without OffscreenCanvas, a blocked worker, or a per-encode
 * failure. The fallback is the existing, shipped `lib/image/engine.ts` path, so
 * the worst case is exactly today's behaviour rather than a broken tool.
 *
 * One worker is kept alive for the whole search: a target-size run is 6–8
 * encodes back to back, and spawning a worker per encode would spend more time
 * starting threads than encoding.
 */

import type { EncodeRequest, EncodeResponse } from "./encode.worker";

export interface EncodeParams {
  blob: Blob;
  width: number;
  height: number;
  quality: number;
  format: "image/jpeg" | "image/webp";
}

export interface EncodeOutput {
  blob: Blob;
  width: number;
  height: number;
  /** True when the work happened off the main thread. */
  offThread: boolean;
}

let worker: Worker | null = null;
let workerBroken = false;
let nextId = 1;

/** True when this browser can run the off-thread path at all. */
export function canUseWorker(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof createImageBitmap === "function"
  );
}

function getWorker(): Worker | null {
  if (workerBroken || !canUseWorker()) return null;
  if (worker) return worker;
  try {
    // `new URL(..., import.meta.url)` is what lets the bundler emit the worker
    // as its own chunk. A bare string path would not survive the static export.
    worker = new Worker(new URL("./encode.worker.ts", import.meta.url));
    worker.onerror = () => {
      workerBroken = true;
      worker?.terminate();
      worker = null;
    };
    return worker;
  } catch {
    workerBroken = true;
    return null;
  }
}

/** Release the worker: called when a Fit workspace resets. */
export function releaseEncoder(): void {
  worker?.terminate();
  worker = null;
}

/**
 * Encode off the main thread, falling back to the shared image engine.
 *
 * The fallback path needs a decoded `LoadedImage`, which the caller already
 * holds, so it is passed in rather than re-decoded.
 */
export async function encodeOffThread(
  params: EncodeParams,
  fallback: () => Promise<EncodeOutput>,
): Promise<EncodeOutput> {
  const w = getWorker();
  if (!w) return fallback();

  const id = nextId++;

  try {
    const result = await new Promise<EncodeResponse>((resolve, reject) => {
      // A wedged worker must not hang the tool forever. 60s is far beyond any
      // realistic single encode; hitting it means something is genuinely wrong.
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("The image encoder timed out."));
      }, 60_000);

      const onMessage = (event: MessageEvent<EncodeResponse>) => {
        if (event.data.id !== id) return; // not our request
        cleanup();
        resolve(event.data);
      };
      const onError = () => {
        cleanup();
        reject(new Error("The image encoder failed."));
      };
      function cleanup() {
        clearTimeout(timer);
        w!.removeEventListener("message", onMessage);
        w!.removeEventListener("error", onError);
      }

      w.addEventListener("message", onMessage);
      w.addEventListener("error", onError);

      const request: EncodeRequest = {
        id,
        blob: params.blob,
        width: params.width,
        height: params.height,
        quality: params.quality,
        format: params.format,
      };
      w.postMessage(request);
    });

    if (!result.ok || !result.bytes) throw new Error(result.error ?? "Encoding failed.");

    return {
      blob: new Blob([result.bytes], { type: result.type ?? params.format }),
      width: result.width ?? params.width,
      height: result.height ?? params.height,
      offThread: true,
    };
  } catch {
    // Any worker problem drops to the proven path rather than failing the run.
    workerBroken = true;
    releaseEncoder();
    return fallback();
  }
}
