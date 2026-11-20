/**
 * GigAI Workspace, VIDEO WORKSPACE.
 *
 * Chains real client-side video tools on one or many uploaded clips without
 * leaving the page. Every operation is backed by the EXISTING engine in
 * `lib/video-tools/operations.ts` (convertFormat / trim / compress / mute /
 * extractAudio), which funnels all work through the self-hosted SINGLE-THREADED
 * `@ffmpeg/ffmpeg` WASM core (`lib/video-tools/ffmpeg.ts`). Nothing here
 * re-implements muxing/encoding.
 *
 * Each engine call is dynamic-imported INSIDE `Operation.run` so the initial
 * bundle stays small. The ~30 MB ffmpeg core is only fetched the first time an
 * op actually runs. The engine returns a uniform `OpResult`
 * (`{ ok, blob, outName }`), which we map to the framework's `OperationResult`.
 *
 * Honest scope, surfaced prominently in the UI:
 *   • The FIRST operation downloads & initialises the ffmpeg WASM core (~30 MB),
 *     so it is slow to start; every op after that reuses the loaded core and is
 *     fast.
 *   • ffmpeg.wasm is single-threaded and far slower than native; very large /
 *     long videos are memory-bound in the browser tab.
 *
 * Custom preview: a native `<video controls>` player (images can't show video),
 * supplied via `WorkspaceCategory.renderPreview`; sidebar thumbnails fall back
 * to the "Video" icon via `thumbIcon`.
 *
 * Mounted as a next/dynamic({ ssr:false }) client island from the server page.
 * This module never imports @/lib/registry, @/lib/search, or @/config/tools.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import type {
  Asset,
  Operation,
  OperationParams,
  OperationResult,
  ParamControlsProps,
  WorkspaceCategory,
} from "@/lib/workspace/types";
import type { OpResult } from "@/lib/video-tools/operations";

/* ── Accepted input ──────────────────────────────────────────────────────── */

const ACCEPT_EXT = ".mp4,.webm,.mov,.mkv,.avi,.m4v";
// The store matches "video/*" as a prefix (else exact). We add explicit types
// for containers some browsers report with a non-"video/" or empty MIME.
const ACCEPT_MIMES = [
  "video/*",
  "video/x-matroska",
  "video/x-msvideo",
  "video/quicktime",
];

/* ── Shared engine plumbing ──────────────────────────────────────────────────
 * The engine reads its input from a Blob/File and returns an `OpResult`. We wrap
 * the asset's `currentBlob` back into a File (so the engine can recover a sane
 * source filename/extension for its output naming), run the op, and translate
 * the uniform result into the framework's `OperationResult`. A failed OpResult
 * becomes a thrown Error, which the store surfaces on the step.
 */

/** Rebuild a named File from an asset's current blob (drives engine naming). */
function asFile(asset: Asset): File {
  return new File([asset.currentBlob], asset.name, {
    type: asset.currentBlob.type || asset.meta.mime || "video/mp4",
  });
}

/** Turn a uniform engine OpResult into an OperationResult (or throw on error). */
function toOp(result: OpResult, mime?: string): OperationResult {
  if (!result.ok) throw new Error(result.error);
  return {
    blob: result.blob,
    name: result.outName,
    meta: {
      size: result.blob.size,
      mime: mime ?? result.blob.type,
    },
  };
}

/* ── Small controlled param widgets (no external UI deps) ─────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

const numberInputCls =
  "h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

function SegChoice<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-md border border-input p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** MM:SS from seconds (best-effort, NaN-safe). */
function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Probe an asset's duration (fast DOM `<video>` path, no ffmpeg) for controls
 * that need it. Returns 0 until known; re-probes when the asset changes.
 */
function useDuration(asset: Asset | null): number {
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setDuration(0);
    if (!asset) return;
    (async () => {
      try {
        const { getMetadata } = await import("@/lib/video-tools/probe");
        const meta = await getMetadata(asset.currentBlob);
        if (!cancelled) setDuration(meta.durationSec || 0);
      } catch {
        /* leave at 0, the control degrades to raw seconds input. */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [asset]);
  return duration;
}

/* ── Operations ──────────────────────────────────────────────────────────────
 * Each Operation defines its own params type, controls, and `run`. All work is
 * real, delegated to the video engine (dynamic-imported inside `run`). Controls
 * are fully controlled: they render from `params` and emit the next object.
 */

/* Convert format --------------------------------------------------------- */

type ConvertTarget = "mp4" | "webm";

type ConvertParams = OperationParams & { target: ConvertTarget };

const convert: Operation<ConvertParams> = {
  id: "video.convert",
  label: "Convert format",
  description: "Transcode to MP4 (H.264/AAC) or WebM (VP9/Opus)",
  icon: "RefreshCw",
  accepts: ["video"],
  defaultParams: { target: "mp4" },
  run: async (asset, params, onProgress) => {
    const { convertFormat } = await import("@/lib/video-tools/operations");
    const result = await convertFormat(asFile(asset), params.target, onProgress);
    return toOp(result, params.target === "webm" ? "video/webm" : "video/mp4");
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<ConvertParams>) => (
    <div className="space-y-2.5">
      <Field label="Target container">
        <SegChoice<ConvertTarget>
          value={params.target}
          onChange={(target) => onChange({ ...params, target })}
          options={[
            { value: "mp4", label: "MP4 · H.264" },
            { value: "webm", label: "WebM · VP9" },
          ]}
        />
      </Field>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        MP4/H.264 plays almost everywhere; WebM/VP9 is smaller for the web. Both
        re-encode the video, so expect a wait on long clips.
      </p>
    </div>
  ),
};

/* Trim ------------------------------------------------------------------- */

type TrimParams = OperationParams & { start: number; end: number };

const trim: Operation<TrimParams> = {
  id: "video.trim",
  label: "Trim",
  description: "Keep just the segment between a start and end time",
  icon: "Scissors",
  accepts: ["video"],
  defaultParams: { start: 0, end: 0 },
  run: async (asset, params, onProgress) => {
    const { trim: trimOp } = await import("@/lib/video-tools/operations");
    // end=0 means "not set yet": fall back to the real duration so the op is
    // still valid (keeps the whole clip rather than erroring).
    let end = params.end;
    if (!(end > params.start)) {
      const { getMetadata } = await import("@/lib/video-tools/probe");
      const meta = await getMetadata(asset.currentBlob);
      end = meta.durationSec || params.start + 1;
    }
    const result = await trimOp(asFile(asset), Math.max(0, params.start), end, onProgress);
    return toOp(result);
  },
  ParamControls: ({ params, onChange, asset }: ParamControlsProps<TrimParams>) => {
    const duration = useDuration(asset);
    const end = params.end > 0 ? params.end : duration;
    const keeping = Math.max(0, end - params.start);
    return (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start (sec)">
            <input
              type="number"
              min={0}
              step={0.1}
              max={duration || undefined}
              className={numberInputCls}
              value={params.start || 0}
              onChange={(e) =>
                onChange({ ...params, start: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </Field>
          <Field label="End (sec)">
            <input
              type="number"
              min={0}
              step={0.1}
              max={duration || undefined}
              className={numberInputCls}
              placeholder={duration ? String(Math.round(duration)) : "end"}
              value={params.end || ""}
              onChange={(e) =>
                onChange({ ...params, end: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </Field>
        </div>
        <p className="text-[11px] text-muted-foreground tabular-nums">
          {duration > 0 ? (
            <>
              Clip is {fmtTime(duration)} long · keeping{" "}
              <span className="font-medium text-foreground">{fmtTime(keeping)}</span>
              {" "}({fmtTime(params.start)} → {fmtTime(end)}). Leave End blank to cut to the end.
            </>
          ) : (
            "Enter start and end in seconds. Leave End blank to keep to the end of the clip."
          )}
        </p>
      </div>
    );
  },
};

/* Compress --------------------------------------------------------------- */

type CompressQuality = "high" | "medium" | "low";

type CompressParams = OperationParams & { quality: CompressQuality };

const compress: Operation<CompressParams> = {
  id: "video.compress",
  label: "Compress",
  description: "Shrink file size by re-encoding H.264 at a chosen quality",
  icon: "FileArchive",
  accepts: ["video"],
  defaultParams: { quality: "medium" },
  run: async (asset, params, onProgress) => {
    const { compress: compressOp } = await import("@/lib/video-tools/operations");
    const result = await compressOp(asFile(asset), { quality: params.quality }, onProgress);
    return toOp(result, "video/mp4");
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<CompressParams>) => (
    <div className="space-y-2.5">
      <Field label="Quality vs. size">
        <SegChoice<CompressQuality>
          value={params.quality}
          onChange={(quality) => onChange({ ...params, quality })}
          options={[
            { value: "high", label: "High" },
            { value: "medium", label: "Balanced" },
            { value: "low", label: "Smallest" },
          ]}
        />
      </Field>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Outputs MP4 (H.264 + AAC). Lower quality means a smaller file. This
        re-encodes the whole clip, so it is the slowest operation on long videos.
      </p>
    </div>
  ),
};

/* Mute ------------------------------------------------------------------- */

type MuteParams = OperationParams;

const mute: Operation<MuteParams> = {
  id: "video.mute",
  label: "Mute",
  description: "Remove the audio track (video stream is copied, fast)",
  icon: "VolumeX",
  accepts: ["video"],
  defaultParams: {},
  run: async (asset, _params, onProgress) => {
    const { mute: muteOp } = await import("@/lib/video-tools/operations");
    const result = await muteOp(asFile(asset), onProgress);
    return toOp(result);
  },
  ParamControls: () => (
    <p className="text-[11px] leading-relaxed text-muted-foreground">
      Strips the audio and copies the video stream without re-encoding, so this
      is fast (after the one-time engine load). The container format is kept.
    </p>
  ),
};

/* Extract audio ---------------------------------------------------------- */

type AudioTarget = "mp3" | "wav" | "aac" | "m4a" | "ogg";

type ExtractAudioParams = OperationParams & { format: AudioTarget };

const AUDIO_MIME: Record<AudioTarget, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  aac: "audio/aac",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
};

const extractAudio: Operation<ExtractAudioParams> = {
  id: "video.extractAudio",
  label: "Extract audio",
  description: "Rip the audio track out to a standalone MP3/WAV/AAC file",
  icon: "Music",
  accepts: ["video"],
  defaultParams: { format: "mp3" },
  run: async (asset, params, onProgress) => {
    const { extractAudio: extractOp } = await import("@/lib/video-tools/operations");
    const result = await extractOp(asFile(asset), { format: params.format }, onProgress);
    // The framework can't change an asset's `kind` mid-pipeline, so the output
    // stays a "video"-kind asset carrying an audio blob + audio MIME. The
    // `<video controls>` preview still plays audio-only files (as a bare control
    // bar), and the download carries the correct audio extension/MIME.
    return toOp(result, AUDIO_MIME[params.format]);
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<ExtractAudioParams>) => (
    <div className="space-y-2.5">
      <Field label="Audio format">
        <SegChoice<AudioTarget>
          value={params.format}
          onChange={(format) => onChange({ ...params, format })}
          options={[
            { value: "mp3", label: "MP3" },
            { value: "wav", label: "WAV" },
            { value: "aac", label: "AAC" },
            { value: "m4a", label: "M4A" },
            { value: "ogg", label: "OGG" },
          ]}
        />
      </Field>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Produces an audio-only file. MP3 is the most compatible; WAV is
        uncompressed (large). The result stays in the workspace as audio.
      </p>
    </div>
  ),
};

/* ── Category config ─────────────────────────────────────────────────────── */

/**
 * Erase each op's specific param type to the catalog's `Operation` shape, sound
 * because the store only ever calls an op with the SAME step's params object it
 * seeded from that op's `defaultParams`. (`run` is contravariant in its params,
 * so a direct widening cast isn't allowed: hence `unknown`.)
 */
function asOp<P extends OperationParams>(op: Operation<P>): Operation {
  return op as unknown as Operation;
}

const OPERATIONS: Operation[] = [
  asOp(convert),
  asOp(trim),
  asOp(compress),
  asOp(mute),
  asOp(extractAudio),
];

/**
 * Build the Video WorkspaceCategory. `createAsset` probes real duration +
 * dimensions via the fast DOM `<video>` path (no ffmpeg) so the preview and
 * caption are accurate without paying the WASM-core cost up front.
 */
function createVideoCategory(): WorkspaceCategory {
  return {
    id: "video",
    title: "Video Workspace",
    kind: "video",
    accept: ACCEPT_EXT,
    acceptMimes: ACCEPT_MIMES,
    operations: OPERATIONS,
    defaultExt: "mp4",
    thumbIcon: "Video",
    renderPreview: (asset) => (
      <video
        controls
        src={asset.previewUrl}
        className="max-h-[52vh] max-w-full rounded-lg border border-border bg-black"
      />
    ),
    createAsset: async (file, id): Promise<Asset> => {
      // Fast, ffmpeg-free probe for dimensions (duration isn't stored on meta,
      // but width/height give the caption something useful).
      let width: number | undefined;
      let height: number | undefined;
      try {
        const { getMetadata } = await import("@/lib/video-tools/probe");
        const meta = await getMetadata(file);
        if (meta.width > 0) width = meta.width;
        if (meta.height > 0) height = meta.height;
      } catch {
        /* Unreadable by the browser: leave dims undefined, still load it. */
      }
      const previewUrl = URL.createObjectURL(file);
      return {
        id,
        name: file.name,
        kind: "video",
        originalBlob: file,
        currentBlob: file,
        previewUrl,
        meta: {
          size: file.size,
          mime: file.type || "video/mp4",
          ...(width ? { width } : {}),
          ...(height ? { height } : {}),
        },
        history: [],
        future: [],
      };
    },
  };
}

/* ── Component (default export) ──────────────────────────────────────────── */

export default function VideoWorkspace() {
  const category = useMemo(createVideoCategory, []);

  return (
    <div className="space-y-4">
      <WorkspaceShell category={category} />
      <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
        <Icon name="TriangleAlert" size={15} className="mt-0.5 shrink-0 text-amber-500" />
        <span>
          <strong className="text-foreground">First operation is slow:</strong> the
          first time you run a step, the workspace downloads and initialises the
          FFmpeg video engine (a ~30&nbsp;MB WebAssembly core). After that it stays
          loaded and every operation is fast. Everything runs entirely in your
          browser, nothing is uploaded, but because FFmpeg.wasm is
          single-threaded, very large or long videos are bound by your device&apos;s
          memory and can be slow to process. Chain a pipeline like{" "}
          <strong className="text-foreground">
            Trim → Compress → Convert to WebM
          </strong>{" "}
          and run it across all your clips at once, then download them as a ZIP.
        </span>
      </p>
    </div>
  );
}
