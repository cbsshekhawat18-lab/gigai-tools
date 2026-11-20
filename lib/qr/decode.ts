/**
 * GigAI Tools, QR decoding / scanning.
 *
 * Reads QR codes from ImageData, files, pasted images, and a live camera via
 * jsQR (dynamic-imported). All client-side, file/camera bytes never leave the
 * browser. Fallible ops return `{ok,text?|error?}`; the camera helper returns a
 * `stop()` you MUST call to release the device.
 */

/** Result of a decode attempt. */
export type DecodeResult =
  | { ok: true; text: string; location?: DecodeLocation }
  | { ok: false; error: { message: string } };

/** Corner points of a detected QR (image pixel coords), when available. */
export interface DecodeLocation {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

type JsQrFn = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  opts?: { inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth" | "invertFirst" },
) => {
  data: string;
  location: {
    topLeftCorner: { x: number; y: number };
    topRightCorner: { x: number; y: number };
    bottomLeftCorner: { x: number; y: number };
    bottomRightCorner: { x: number; y: number };
  };
} | null;

let jsQrCache: JsQrFn | undefined;

/** Load jsQR once, lazily. */
async function loadJsQr(): Promise<JsQrFn> {
  if (jsQrCache) return jsQrCache;
  const mod = await import("jsqr");
  jsQrCache = (mod.default ?? mod) as unknown as JsQrFn;
  return jsQrCache;
}

/**
 * Decode a QR from raw ImageData. `attemptBoth` inversion is default so
 * dark-on-light AND light-on-dark codes are read.
 */
export async function decodeFromImageData(imageData: ImageData): Promise<DecodeResult> {
  try {
    const jsQR = await loadJsQr();
    const found = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });
    if (!found) return { ok: false, error: { message: "No QR code found in the image." } };
    const l = found.location;
    return {
      ok: true,
      text: found.data,
      location: {
        topLeft: l.topLeftCorner,
        topRight: l.topRightCorner,
        bottomLeft: l.bottomLeftCorner,
        bottomRight: l.bottomRightCorner,
      },
    };
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

/** Draw a source onto a canvas and read back its ImageData. */
function toImageData(
  source: CanvasImageSource,
  width: number,
  height: number,
): ImageData | null {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Decode a QR from an image File/Blob. Handles orientation-agnostic decoding by
 * drawing the bitmap to a canvas. Uses createImageBitmap when available and
 * falls back to an <img> load otherwise.
 */
export async function decodeFromFile(file: Blob): Promise<DecodeResult> {
  try {
    let width: number;
    let height: number;
    let source: CanvasImageSource;
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file);
      source = bitmap;
      width = bitmap.width;
      height = bitmap.height;
    } else {
      const img = await loadImageFromBlob(file);
      source = img;
      width = img.naturalWidth;
      height = img.naturalHeight;
    }
    if (!width || !height) return { ok: false, error: { message: "Could not read image dimensions." } };
    const imageData = toImageData(source, width, height);
    if (!imageData) return { ok: false, error: { message: "Canvas 2D context unavailable." } };
    return decodeFromImageData(imageData);
  } catch (err) {
    return { ok: false, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}

/** Load a Blob into an HTMLImageElement (fallback path). */
function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load the image file."));
    };
    img.src = url;
  });
}

/**
 * Decode a single frame from a playing <video> element (used by the live
 * scanner loop). Non-throwing: returns a failure result when no code is found.
 */
export async function decodeFromVideoFrame(video: HTMLVideoElement): Promise<DecodeResult> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return { ok: false, error: { message: "Camera frame not ready." } };
  const imageData = toImageData(video, width, height);
  if (!imageData) return { ok: false, error: { message: "Canvas 2D context unavailable." } };
  return decodeFromImageData(imageData);
}

/** Handle to a running camera scan; call `stop()` to release the camera. */
export interface CameraScan {
  stop(): void;
}

/** Options for the live camera scanner. */
export interface CameraScanOptions {
  /** "environment" (rear, default) or "user" (front) camera. */
  facingMode?: "environment" | "user";
  /** Called with a failure result (e.g. permission denied) so the UI can react. */
  onError?: (message: string) => void;
  /** Stop scanning automatically after the first successful decode (default true). */
  once?: boolean;
}

/**
 * Start a live camera scan into `video`, invoking `onResult` when a QR is
 * decoded. Requests the camera via getUserMedia, plays it in the element, and
 * runs a requestAnimationFrame decode loop. Returns a handle whose `stop()`
 * cancels the loop and releases all camera tracks, ALWAYS call it on unmount.
 */
export async function startCameraScan(
  video: HTMLVideoElement,
  onResult: (text: string, location?: DecodeLocation) => void,
  options: CameraScanOptions = {},
): Promise<CameraScan> {
  const once = options.once ?? true;
  let stream: MediaStream | null = null;
  let rafId = 0;
  let stopped = false;

  const stop = (): void => {
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
      stream = null;
    }
  };

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera access is not supported in this browser.");
    }
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: options.facingMode ?? "environment" },
      audio: false,
    });
    video.srcObject = stream;
    video.setAttribute("playsinline", "true");
    await video.play();
  } catch (err) {
    stop();
    const message =
      err instanceof DOMException && err.name === "NotAllowedError"
        ? "Camera permission was denied."
        : err instanceof Error
          ? err.message
          : "Could not start the camera.";
    options.onError?.(message);
    return { stop };
  }

  const jsQR = await loadJsQr();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const tick = (): void => {
    if (stopped) return;
    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w && h) {
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(video, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const found = jsQR(imageData.data, w, h, { inversionAttempts: "attemptBoth" });
        if (found) {
          const l = found.location;
          onResult(found.data, {
            topLeft: l.topLeftCorner,
            topRight: l.topRightCorner,
            bottomLeft: l.bottomLeftCorner,
            bottomRight: l.bottomRightCorner,
          });
          if (once) {
            stop();
            return;
          }
        }
      }
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return { stop };
}
