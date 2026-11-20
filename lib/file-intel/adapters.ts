/**
 * Fit adapters: thin bridges onto the studio engines that already exist.
 *
 * NOTHING here compresses anything itself. Each adapter maps the engine's
 * [0, 1] knob onto exactly one parameter of an existing, tested function:
 *
 *   image → lib/image/engine       compressImage / resizeImage
 *   pdf   → lib/pdf/convert        compressPdf
 *   video → lib/video-tools/ops    compress (CRF)
 *   audio → lib/audio-tools/convert convertAudio (MP3 bitrate)
 *
 * Each mapping is monotonic, which is the one contract fitToTarget relies on.
 */

import type { FitAdapter, FitAttempt, FitProbe, SourceInfo } from "./types";
import { detectFile, extensionOf } from "./detect";
import { encodeOffThread, releaseEncoder } from "./encode-client";

/* ── Image ────────────────────────────────────────────────────────────────── */

/**
 * Knob → quality, plus resolution once quality alone stops paying.
 *
 * Below knob 0.45 the encoder is already into visibly mushy territory, so
 * further shrinking comes from pixels instead of quality, which is both what a
 * human would do and what keeps the image legible at small target sizes.
 */
function imageParams(knob: number, width: number, height: number) {
  const quality = 0.28 + knob * 0.67; // 0.28 … 0.95
  const scale = knob >= 0.45 ? 1 : 0.45 + (knob / 0.45) * 0.55; // 0.45 … 1
  return {
    quality: Math.round(quality * 100) / 100,
    width: Math.max(16, Math.round(width * scale)),
    height: Math.max(16, Math.round(height * scale)),
    scaled: scale < 1,
  };
}

export const imageAdapter: FitAdapter = {
  kind: "image",
  maxAttempts: 8,
  speed: "fast",
  strategy: "Quality first, then resolution once quality alone stops helping.",

  async probe(file: File): Promise<FitProbe> {
    try {
      const { loadImageFile, releaseImage } = await import("@/lib/image/engine");
      const img = await loadImageFile(file);
      const det = await detectFile(file);
      const info: SourceInfo = {
        kind: "image",
        mime: det.mime,
        label: det.label,
        bytes: file.size,
        width: img.width,
        height: img.height,
        previewUrl: img.url,
      };
      // Keep the bitmap alive for encoding; the workspace revokes on reset.
      imageCache.set(file, img);
      void releaseImage;
      return { ok: true, info };
    } catch {
      return {
        ok: false,
        reason: "This image couldn't be decoded by your browser.",
        suggestion: "It may be corrupt, or a format this browser doesn't support. Converting it to JPG or PNG first usually fixes it.",
      };
    }
  },

  async encode(file, knob, { info }): Promise<FitAttempt> {
    const img = imageCache.get(file);
    if (!img) throw new Error("The image was released before encoding, re-add the file and try again.");

    const p = imageParams(knob, info.width ?? img.width, info.height ?? img.height);
    // PNG/other sources are encoded as JPEG: a lossless format cannot be driven
    // to an arbitrary byte target, so the format must change to hit one.
    const format = "image/jpeg" as const;

    // Off the main thread by default. Measured before this existed: one search
    // blocked the main thread for 2.7s of a 3.4s run, which froze the page and
    // made the Cancel button unclickable. The fallback below is the original
    // main-thread path, so an old browser degrades rather than breaks.
    const result = await encodeOffThread(
      { blob: file, width: p.width, height: p.height, quality: p.quality, format },
      async () => {
        const { compressImage, resizeImage } = await import("@/lib/image/engine");
        const r = p.scaled
          ? await resizeImage(img, { width: p.width, height: p.height, format, quality: p.quality })
          : await compressImage(img, { quality: p.quality, format });
        return { blob: r.blob, width: r.width, height: r.height, offThread: false };
      },
    );

    return {
      blob: result.blob,
      size: result.blob.size,
      knob,
      summary: `quality ${Math.round(p.quality * 100)}%${p.scaled ? `, ${result.width}×${result.height}` : ""}`,
      facts: { width: result.width, height: result.height, quality: p.quality, mime: format },
    };
  },
};

/** Decoded bitmaps, keyed by the File they came from. */
const imageCache = new WeakMap<File, Awaited<ReturnType<typeof import("@/lib/image/engine").loadImageFile>>>();

/** Release the cached bitmap for a file (called when the workspace resets). */
export async function releaseImageFor(file: File): Promise<void> {
  releaseEncoder();
  const img = imageCache.get(file);
  if (!img) return;
  const { releaseImage } = await import("@/lib/image/engine");
  releaseImage(img);
  imageCache.delete(file);
}

/* ── PDF ──────────────────────────────────────────────────────────────────── */

/**
 * compressPdf takes three discrete levels, so the knob is quantised onto them.
 * Bisecting a 3-value ladder converges in at most 3 encodes, which is why the
 * attempt budget is small; more would just repeat work.
 */
function pdfLevel(knob: number): "low" | "medium" | "high" {
  if (knob >= 0.66) return "low";      // least aggressive → biggest file
  if (knob >= 0.33) return "medium";
  return "high";                        // most aggressive → smallest file
}

export const pdfAdapter: FitAdapter = {
  kind: "pdf",
  maxAttempts: 3,
  speed: "slow",
  strategy: "Pages are re-rasterised at a lower quality, text stops being selectable.",

  async probe(file: File): Promise<FitProbe> {
    try {
      const { getPageCount } = await import("@/lib/pdf/core");
      const pages = await getPageCount(file);
      return {
        ok: true,
        info: { kind: "pdf", mime: "application/pdf", label: "PDF Document", bytes: file.size, pages },
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      return {
        ok: false,
        reason: /password|encrypt/i.test(msg)
          ? "This PDF is password-protected, so it can't be re-compressed."
          : "This PDF couldn't be opened. It may be damaged.",
        suggestion: /password|encrypt/i.test(msg)
          ? "Remove the password with Unlock PDF first, then come back."
          : "Try rebuilding it with Repair PDF, then compress the result.",
      };
    }
  },

  async encode(file, knob, { stage }): Promise<FitAttempt> {
    const { compressPdf } = await import("@/lib/pdf/convert");
    const { toPdfInput } = await import("@/lib/pdf/types");
    const level = pdfLevel(knob);
    const out = await compressPdf(toPdfInput(file), {
      level,
      onProgress: (f, s) => stage(s ?? `Compressing pages (${level})`, f),
    });
    return {
      blob: out.blob,
      size: out.blob.size,
      knob,
      summary: `${level} compression`,
      facts: { mime: "application/pdf" },
    };
  },
};

/* ── Video ────────────────────────────────────────────────────────────────── */

/** Knob → CRF. Lower CRF = better quality = bigger file, so the map inverts. */
function videoCrf(knob: number): number {
  return Math.round(34 - knob * 14); // knob 0 → CRF 34, knob 1 → CRF 20
}

export const videoAdapter: FitAdapter = {
  kind: "video",
  // Each encode is minutes, so the budget is tight on purpose. Three passes of
  // bisection over CRF gets close enough; more would cost a user ten minutes
  // to gain a few hundred KB.
  maxAttempts: 3,
  speed: "slow",
  strategy: "Re-encoded with H.264 at a higher CRF. Each attempt takes a while.",

  async probe(file: File): Promise<FitProbe> {
    try {
      const { getMetadata } = await import("@/lib/video-tools/probe");
      const meta = await getMetadata(file);
      const det = await detectFile(file);
      return {
        ok: true,
        info: {
          kind: "video",
          mime: det.mime,
          label: det.label,
          bytes: file.size,
          width: meta.width,
          height: meta.height,
          duration: meta.durationSec,
          // probe() reports bitrate in bits/sec when ffmpeg parsed it; otherwise
          // derive kbps from size and duration, which is what the video studio
          // shows for the same file.
          bitrate: meta.bitrate
            ? meta.bitrate / 1000
            : meta.durationSec
              ? (file.size * 8) / meta.durationSec / 1000
              : undefined,
        },
      };
    } catch {
      return {
        ok: false,
        reason: "This browser couldn't read the video's properties locally.",
        suggestion: "The container or codec may be unsupported here. Converting it to MP4 first usually works.",
      };
    }
  },

  async encode(file, knob, { stage, signal }): Promise<FitAttempt> {
    const { compress } = await import("@/lib/video-tools/operations");
    const crf = videoCrf(knob);
    stage(`Re-encoding at CRF ${crf}; this takes a while`, undefined);
    const res = await compress(file, { crf, preset: "veryfast" }, (f) =>
      stage(`Re-encoding at CRF ${crf}`, f),
    );
    if (signal?.aborted) throw Object.assign(new Error("Cancelled"), { name: "Cancelled" });
    if (!res.ok) throw new Error(res.error);
    return {
      blob: res.blob,
      size: res.blob.size,
      knob,
      summary: `CRF ${crf}`,
      facts: { mime: "video/mp4" },
    };
  },
};

/* ── Audio ────────────────────────────────────────────────────────────────── */

const MP3_LADDER = [64, 96, 128, 160, 192, 256, 320];

function audioBitrate(knob: number): number {
  const i = Math.min(MP3_LADDER.length - 1, Math.max(0, Math.round(knob * (MP3_LADDER.length - 1))));
  return MP3_LADDER[i]!;
}

export const audioAdapter: FitAdapter = {
  kind: "audio",
  maxAttempts: 4,
  speed: "fast",
  strategy: "Re-encoded as MP3 at a lower bitrate.",

  async probe(file: File): Promise<FitProbe> {
    try {
      const { getAudioMetadata } = await import("@/lib/audio-tools/metadata");
      const meta = await getAudioMetadata(file);
      const det = await detectFile(file);
      return {
        ok: true,
        info: {
          kind: "audio",
          mime: det.mime,
          label: det.label,
          bytes: file.size,
          duration: meta.duration,
          bitrate: meta.bitrateEstimate || undefined,
        },
      };
    } catch {
      return {
        ok: false,
        reason: "This browser couldn't decode the audio.",
        suggestion: "Converting it to WAV or MP3 first usually makes it readable here.",
      };
    }
  },

  async encode(file, knob, { stage }): Promise<FitAttempt> {
    const { convertAudio } = await import("@/lib/audio-tools/convert");
    const bitrate = audioBitrate(knob);
    const blob = await convertAudio(file, "mp3", { bitrate }, (f) =>
      stage(`Encoding MP3 at ${bitrate} kbps`, f),
    );
    return {
      blob,
      size: blob.size,
      knob,
      summary: `${bitrate} kbps MP3`,
      facts: { bitrate, mime: "audio/mpeg" },
    };
  },
};

/* ── Document ─────────────────────────────────────────────────────────────── */

/**
 * Documents deliberately have NO compression adapter.
 *
 * A .docx is already a ZIP; re-zipping saves almost nothing, and the only real
 * lever is recompressing embedded images, which requires rewriting the package
 * and risks corrupting a file the user cannot easily check. Rather than ship a
 * step that quietly damages documents to save 3%, Fit routes these to the
 * honest alternative: convert to PDF, then compress that.
 */
export const documentAdapter: FitAdapter = {
  kind: "document",
  maxAttempts: 1,
  speed: "fast",
  strategy: "Not compressible directly, convert to PDF first.",

  async probe(file: File): Promise<FitProbe> {
    const ext = extensionOf(file.name).toUpperCase() || "document";
    return {
      ok: false,
      reason: `A ${ext} file is already a compressed package, so there is very little left to squeeze out of it directly.`,
      suggestion: "Convert it to PDF first (Word to PDF, PowerPoint to PDF or Excel to PDF), then bring that PDF back here. A PDF can genuinely be compressed to a target size.",
    };
  },

  async encode(): Promise<FitAttempt> {
    throw new Error("Documents are not compressed directly, convert to PDF first.");
  },
};

/* ── Registry ─────────────────────────────────────────────────────────────── */

export const ADAPTERS: Record<string, FitAdapter> = {
  image: imageAdapter,
  pdf: pdfAdapter,
  video: videoAdapter,
  audio: audioAdapter,
  document: documentAdapter,
};

export function adapterFor(kind: string): FitAdapter | null {
  return ADAPTERS[kind] ?? null;
}
