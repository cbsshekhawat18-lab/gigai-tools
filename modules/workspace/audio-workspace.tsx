/**
 * GigAI Workspace, AUDIO WORKSPACE.
 *
 * Chains real client-side audio tools on one or many uploaded clips without
 * leaving the page. Every operation is backed by the EXISTING engine in
 * `lib/audio-tools/*` (Web Audio API + lamejs, no upload). Each engine call is
 * dynamic-imported INSIDE `Operation.run` so the initial bundle stays small (the
 * decode/encode primitives, and lamejs for MP3, only load the first time an op
 * actually runs).
 *
 * SHELL-BASED workspace, exactly like `image-workspace.tsx`: we build a
 * `WorkspaceCategory` and render `<WorkspaceShell category={cat}/>`. The
 * whole-page drop guard, pipeline, undo/redo, and download all come for free.
 *
 * The framework passes each op an `Asset` carrying a `currentBlob`. Audio ops
 * decode that blob to an `AudioBuffer`, run the pure engine transform, then
 * re-encode to a `Blob`. To avoid a silent lossy round-trip surprise, an op that
 * doesn't itself change the format re-encodes back to the SAME family: WAV in →
 * WAV out (lossless), otherwise MP3 out (lamejs). Convert is the one op that
 * deliberately changes format.
 *
 * Honest scope, surfaced in the UI:
 *  • Decoding/encoding is CPU-bound and all on-device: long clips are slow.
 *   • MP3 output uses lamejs (re-encoding is lossy); WAV output is lossless but
 *     large. OGG/FLAC/M4A/AAC route through ffmpeg.wasm (a ~31 MB core loads the
 *     first time you target one of them).
 *
 * Mounted as a next/dynamic({ ssr:false }) client island. This module never
 * imports @/lib/registry, @/lib/search, or @/config/tools.
 */

"use client";

import { useMemo } from "react";
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
import type { AudioFormat } from "@/lib/audio-tools/convert";

/* ── Accepted input ──────────────────────────────────────────────────────── */

const ACCEPT_EXT = "audio/*";
// The store matches "audio/*" as a PREFIX (an entry must end in "/*"); a bare
// "audio/" would require an exact type === "audio/" and reject every real file.
// Explicit types cover containers some browsers report with a non-"audio/" MIME.
const ACCEPT_MIMES = ["audio/*", "audio/x-wav", "audio/x-m4a", "application/ogg"];

/* ── Shared engine plumbing ──────────────────────────────────────────────────
 * Ops decode the asset's current blob to an AudioBuffer, transform it with the
 * pure `lib/audio-tools/process` functions, then serialise back to a Blob.
 * `serialise` keeps the round-trip honest: WAV stays lossless WAV; everything
 * else becomes MP3 (lamejs) so we never claim to preserve a format we can't
 * re-emit natively. The `convert` op below is the exception; it picks the
 * target format itself.
 */

/** Is the asset currently a WAV? (drives lossless-preserving re-encode.) */
function isWav(asset: Asset): boolean {
  const mime = (asset.currentBlob.type || asset.meta.mime || "").toLowerCase();
  return mime.includes("wav");
}

/** Swap a filename's extension, preserving the base name. */
function withExt(name: string, ext: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${ext}`;
}

/**
 * Decode → transform → re-encode, preserving the format family. Returns an
 * `OperationResult` with the encoded blob, updated size/mime, and a name whose
 * extension matches the emitted format.
 */
async function processBuffer(
  asset: Asset,
  transform: (buffer: AudioBuffer) => AudioBuffer | Promise<AudioBuffer>,
  onProgress?: (fraction: number, status?: string) => void,
): Promise<OperationResult> {
  onProgress?.(0.1, "Decoding…");
  const { decodeFile } = await import("@/lib/audio-tools/context");
  const input = await decodeFile(asset.currentBlob);

  onProgress?.(0.45, "Processing…");
  const output = await transform(input);

  const { encodeWav, encodeMp3 } = await import("@/lib/audio-tools/encode");
  if (isWav(asset)) {
    onProgress?.(0.9, "Encoding WAV…");
    const blob = encodeWav(output);
    onProgress?.(1, "Done");
    return {
      blob,
      meta: { size: blob.size, mime: "audio/wav" },
      name: withExt(asset.name, "wav"),
    };
  }
  onProgress?.(0.6, "Encoding MP3…");
  const blob = await encodeMp3(output, {}, (f) => onProgress?.(0.6 + f * 0.4, "Encoding MP3…"));
  onProgress?.(1, "Done");
  return {
    blob,
    meta: { size: blob.size, mime: "audio/mpeg" },
    name: withExt(asset.name, "mp3"),
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

function Range({
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 cursor-pointer accent-primary"
      />
      <span className="w-14 shrink-0 text-right text-xs tabular-nums text-foreground">
        {value}
        {suffix}
      </span>
    </div>
  );
}

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

/* ── Operations ──────────────────────────────────────────────────────────────
 * Each Operation defines its own params type, controls, and `run`. All work is
 * real, delegated to the audio engine. Controls are fully controlled.
 */

/* Convert format ---------------------------------------------------------- */

type ConvertParams = OperationParams & {
  format: AudioFormat;
  bitrate: number;
};

const convert: Operation<ConvertParams> = {
  id: "audio.convert",
  label: "Convert format",
  description: "Re-encode to MP3, WAV, OGG, FLAC, M4A or AAC",
  icon: "RefreshCw",
  accepts: ["audio"],
  defaultParams: { format: "mp3", bitrate: 192 },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.05, "Preparing…");
    const { convertAudio, isNativeFormat } = await import("@/lib/audio-tools/convert");
    const file = new File([asset.currentBlob], asset.name, {
      type: asset.currentBlob.type || asset.meta.mime || "audio/mpeg",
    });
    if (!isNativeFormat(params.format)) {
      onProgress?.(0.1, "Loading ffmpeg core (first run only)…");
    }
    const blob = await convertAudio(
      file,
      params.format,
      { bitrate: params.bitrate },
      (f, status) => onProgress?.(f, status),
    );
    onProgress?.(1, "Done");
    const mimeByFmt: Record<AudioFormat, string> = {
      wav: "audio/wav",
      mp3: "audio/mpeg",
      ogg: "audio/ogg",
      flac: "audio/flac",
      m4a: "audio/mp4",
      aac: "audio/aac",
    };
    return {
      blob,
      meta: { size: blob.size, mime: mimeByFmt[params.format] },
      name: withExt(asset.name, params.format),
    };
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<ConvertParams>) => (
    <div className="space-y-2.5">
      <Field label="Target format">
        <SegChoice<AudioFormat>
          value={params.format}
          onChange={(format) => onChange({ ...params, format })}
          options={[
            { value: "mp3", label: "MP3" },
            { value: "wav", label: "WAV" },
            { value: "ogg", label: "OGG" },
            { value: "flac", label: "FLAC" },
            { value: "m4a", label: "M4A" },
            { value: "aac", label: "AAC" },
          ]}
        />
      </Field>
      {params.format === "mp3" && (
        <Field label={`MP3 bitrate · ${params.bitrate} kbps`}>
          <SegChoice<string>
            value={String(params.bitrate)}
            onChange={(b) => onChange({ ...params, bitrate: Number(b) })}
            options={[96, 128, 160, 192, 256, 320].map((b) => ({
              value: String(b),
              label: `${b}`,
            }))}
          />
        </Field>
      )}
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        WAV is lossless (large). MP3 uses lamejs (lossy). OGG / FLAC / M4A / AAC load a
        ~31 MB ffmpeg.wasm core the first time, slower on first use.
      </p>
    </div>
  ),
};

/* Trim -------------------------------------------------------------------- */

type TrimParams = OperationParams & {
  /** Seconds to drop from the start. */
  startSec: number;
  /** Seconds to drop from the end. */
  endTrimSec: number;
};

const trim: Operation<TrimParams> = {
  id: "audio.trim",
  label: "Trim",
  description: "Keep the middle, cut seconds off the start and end",
  icon: "Scissors",
  accepts: ["audio"],
  defaultParams: { startSec: 0, endTrimSec: 0 },
  run: async (asset, params, onProgress) => {
    const { trim: trimBuffer } = await import("@/lib/audio-tools/process");
    return processBuffer(
      asset,
      (buffer) => {
        const start = Math.max(0, Math.min(params.startSec, buffer.duration));
        const end = Math.max(start, buffer.duration - Math.max(0, params.endTrimSec));
        return trimBuffer(buffer, start, end);
      },
      onProgress,
    );
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<TrimParams>) => (
    <div className="space-y-2.5">
      <Field label="Trim from start (seconds)">
        <input
          type="number"
          min={0}
          step={0.1}
          className={numberInputCls}
          value={params.startSec || ""}
          placeholder="0"
          onChange={(e) => onChange({ ...params, startSec: Number(e.target.value) || 0 })}
        />
      </Field>
      <Field label="Trim from end (seconds)">
        <input
          type="number"
          min={0}
          step={0.1}
          className={numberInputCls}
          value={params.endTrimSec || ""}
          placeholder="0"
          onChange={(e) => onChange({ ...params, endTrimSec: Number(e.target.value) || 0 })}
        />
      </Field>
      <p className="text-[11px] text-muted-foreground">
        Preview the clip above to find your cut points, then apply.
      </p>
    </div>
  ),
};

/* Normalize --------------------------------------------------------------- */

type NormalizeMode = "peak" | "rms";

type NormalizeParams = OperationParams & {
  targetDb: number;
  mode: NormalizeMode;
};

const normalize: Operation<NormalizeParams> = {
  id: "audio.normalize",
  label: "Normalize",
  description: "Raise the whole clip to a target loudness",
  icon: "AudioWaveform",
  accepts: ["audio"],
  defaultParams: { targetDb: -1, mode: "peak" },
  run: async (asset, params, onProgress) => {
    const { normalize: normalizeBuffer } = await import("@/lib/audio-tools/process");
    return processBuffer(
      asset,
      (buffer) => normalizeBuffer(buffer, { targetDb: params.targetDb, mode: params.mode }),
      onProgress,
    );
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<NormalizeParams>) => (
    <div className="space-y-2.5">
      <Field label={`Target · ${params.targetDb} dBFS`}>
        <Range
          value={params.targetDb}
          min={-12}
          max={0}
          step={0.5}
          onChange={(targetDb) => onChange({ ...params, targetDb })}
          suffix=" dB"
        />
      </Field>
      <SegChoice<NormalizeMode>
        value={params.mode}
        onChange={(mode) => onChange({ ...params, mode })}
        options={[
          { value: "peak", label: "Peak" },
          { value: "rms", label: "RMS (loudness)" },
        ]}
      />
      <p className="text-[11px] text-muted-foreground">
        Peak scales the loudest sample to the target. RMS matches average energy (then
        hard-limits to avoid clipping).
      </p>
    </div>
  ),
};

/* Change volume / gain ---------------------------------------------------- */

type GainParams = OperationParams & {
  gainDb: number;
};

const gain: Operation<GainParams> = {
  id: "audio.gain",
  label: "Change volume",
  description: "Boost or attenuate by a fixed gain (dB)",
  icon: "Volume2",
  accepts: ["audio"],
  defaultParams: { gainDb: 0 },
  run: async (asset, params, onProgress) => {
    const { boost } = await import("@/lib/audio-tools/process");
    return processBuffer(asset, (buffer) => boost(buffer, params.gainDb), onProgress);
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<GainParams>) => (
    <div className="space-y-2.5">
      <Field label={`Gain · ${params.gainDb > 0 ? "+" : ""}${params.gainDb} dB`}>
        <Range
          value={params.gainDb}
          min={-24}
          max={24}
          step={0.5}
          onChange={(gainDb) => onChange({ ...params, gainDb })}
          suffix=" dB"
        />
      </Field>
      <p className="text-[11px] text-muted-foreground">
        Output is hard-clamped to prevent digital overflow, so extreme boosts may clip.
        0 dB leaves the level unchanged.
      </p>
    </div>
  ),
};

/* Fade in / out ----------------------------------------------------------- */

type FadeParams = OperationParams & {
  inSec: number;
  outSec: number;
};

const fade: Operation<FadeParams> = {
  id: "audio.fade",
  label: "Fade in / out",
  description: "Ramp the volume up at the start and down at the end",
  icon: "TrendingUp",
  accepts: ["audio"],
  defaultParams: { inSec: 1, outSec: 1 },
  run: async (asset, params, onProgress) => {
    const { fade: fadeBuffer } = await import("@/lib/audio-tools/process");
    return processBuffer(
      asset,
      (buffer) =>
        fadeBuffer(buffer, {
          inSec: Math.max(0, params.inSec),
          outSec: Math.max(0, params.outSec),
        }),
      onProgress,
    );
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<FadeParams>) => (
    <div className="space-y-2.5">
      <Field label="Fade in (seconds)">
        <input
          type="number"
          min={0}
          step={0.1}
          className={numberInputCls}
          value={params.inSec || ""}
          placeholder="0"
          onChange={(e) => onChange({ ...params, inSec: Number(e.target.value) || 0 })}
        />
      </Field>
      <Field label="Fade out (seconds)">
        <input
          type="number"
          min={0}
          step={0.1}
          className={numberInputCls}
          value={params.outSec || ""}
          placeholder="0"
          onChange={(e) => onChange({ ...params, outSec: Number(e.target.value) || 0 })}
        />
      </Field>
      <p className="text-[11px] text-muted-foreground">
        Linear ramps. Oversized fades are clamped to the clip length.
      </p>
    </div>
  ),
};

/* ── Category config ─────────────────────────────────────────────────────── */

/**
 * Erase each op's specific param type to the catalog's `Operation` shape. Sound
 * because the store only ever calls `run`/`ParamControls` with the same step's
 * params object it seeded from `defaultParams`. (`run` is contravariant in its
 * params, so a direct widening cast isn't allowed, hence `unknown`.)
 */
function asOp<P extends OperationParams>(op: Operation<P>): Operation {
  return op as unknown as Operation;
}

const OPERATIONS: Operation[] = [
  asOp(convert),
  asOp(trim),
  asOp(normalize),
  asOp(gain),
  asOp(fade),
];

/**
 * Build the Audio WorkspaceCategory. `createAsset` probes real duration /
 * sample-rate / channels via the engine (dynamic-imported) so the caption and
 * op defaults are exact; it degrades gracefully if a clip can't be decoded.
 */
function createAudioCategory(): WorkspaceCategory {
  return {
    id: "audio",
    title: "Audio Workspace",
    kind: "audio",
    accept: ACCEPT_EXT,
    acceptMimes: ACCEPT_MIMES,
    operations: OPERATIONS,
    defaultExt: "mp3",
    thumbIcon: "AudioLines",
    renderPreview: (asset) => (
      <audio
        controls
        src={asset.previewUrl}
        className="w-full max-w-md"
        preload="metadata"
      />
    ),
    createAsset: async (file, id): Promise<Asset> => {
      // Probe metadata; degrade gracefully if the browser can't decode it.
      let mime = file.type || "audio/mpeg";
      try {
        const { getAudioMetadata } = await import("@/lib/audio-tools/metadata");
        const meta = await getAudioMetadata(file);
        if (meta.type) mime = meta.type;
      } catch {
        /* Undecodable here (still previewable via <audio>); keep file.type. */
      }
      const previewUrl = URL.createObjectURL(file);
      return {
        id,
        name: file.name,
        kind: "audio",
        originalBlob: file,
        currentBlob: file,
        previewUrl,
        meta: { size: file.size, mime },
        history: [],
        future: [],
      };
    },
  };
}

/* ── Component (default export) ──────────────────────────────────────────── */

export default function AudioWorkspace() {
  const category = useMemo(createAudioCategory, []);

  return (
    <div className="space-y-4">
      <WorkspaceShell category={category} />
      <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
        <Icon name="ShieldCheck" size={14} className="mt-0.5 text-primary" />
        <span>
          Every clip is processed entirely in your browser: nothing is uploaded. Chain a
          pipeline like{" "}
          <strong className="text-foreground">
            Trim → Normalize → Fade in/out → Convert to MP3
          </strong>
          , run it across all your files at once, then download them as a ZIP. Editing ops
          re-encode to MP3 (lossy, via lamejs) unless the input is WAV, which stays
          lossless; converting to OGG / FLAC / M4A / AAC loads an ffmpeg.wasm core the
          first time. Decoding and encoding are CPU-bound, so long clips take longer.
        </span>
      </p>
    </div>
  );
}
