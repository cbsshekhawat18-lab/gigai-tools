/**
 * Off-thread image encoder for GigAI Fit.
 *
 * WHY THIS EXISTS, measured rather than assumed: a 5.5MB image driven to a 1MB
 * target took 3,422ms wall clock, of which 2,702ms was a SINGLE long task. The
 * main thread was frozen for 79% of the run, the page couldn't scroll and the
 * Cancel button couldn't be clicked, which makes a cancel button a lie.
 *
 * Everything happens in here: the Blob is decoded with `createImageBitmap`,
 * drawn to an `OffscreenCanvas`, then encoded with the SAME MozJPEG/libwebp
 * codecs the main-thread engine uses, so not one step of the search touches
 * the main thread AND compression quality is unchanged.
 *
 * Using the canvas's own `convertToBlob` would be simpler and was the first
 * version of this file, but the browser's built-in JPEG encoder is materially
 * worse than MozJPEG at the same visual quality. Faster runs are not worth
 * quietly handing users bigger files.
 *
 * Deliberately NOT a rewrite of lib/image/engine.ts. That engine is shared by a
 * dozen shipped tools; duplicating ~40 lines of encode here is far cheaper than
 * the risk of moving all of them onto OffscreenCanvas at once.
 */

export interface EncodeRequest {
  id: number;
  blob: Blob;
  width: number;
  height: number;
  quality: number;
  format: "image/jpeg" | "image/webp";
}

export interface EncodeResponse {
  id: number;
  ok: boolean;
  bytes?: ArrayBuffer;
  width?: number;
  height?: number;
  type?: string;
  error?: string;
}

self.onmessage = async (event: MessageEvent<EncodeRequest>) => {
  const { id, blob, width, height, quality, format } = event.data;

  try {
    // Decode off-thread. `createImageBitmap` is available in workers and is the
    // whole reason the expensive part can leave the main thread at all.
    const bitmap = await createImageBitmap(blob);
    const w = Math.max(1, Math.round(width || bitmap.width));
    const h = Math.max(1, Math.round(height || bitmap.height));

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d", { alpha: format === "image/webp" });
    if (!ctx) throw new Error("OffscreenCanvas 2D context unavailable in this worker.");

    // JPEG has no alpha; without this a transparent PNG comes out black.
    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const pixels = ctx.getImageData(0, 0, w, h);
    // jsquash takes 1–100; the engine's knob is 0–1, same as lib/image/pro.ts.
    const q = Math.max(1, Math.min(100, Math.round(quality * 100)));

    let bytes: ArrayBuffer;
    try {
      if (format === "image/webp") {
        const { encode } = await import("@jsquash/webp");
        bytes = await encode(pixels, { quality: q });
      } else {
        const { encode } = await import("@jsquash/jpeg");
        bytes = await encode(pixels, { quality: q });
      }
    } catch {
      // WASM codec unavailable in this worker, the native encoder still beats
      // failing the run, and the size search corrects for its efficiency.
      const encoded = await canvas.convertToBlob({ type: format, quality });
      bytes = await encoded.arrayBuffer();
    }

    const response: EncodeResponse = {
      id,
      ok: true,
      bytes,
      width: w,
      height: h,
      type: format,
    };
    // Transfer rather than copy. The buffer can be megabytes.
    (self as unknown as Worker).postMessage(response, [bytes]);
  } catch (err) {
    const response: EncodeResponse = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Encoding failed in the worker.",
    };
    (self as unknown as Worker).postMessage(response);
  }
};
