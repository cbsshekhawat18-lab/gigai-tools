/**
 * GigAI Workspace, IMAGE WORKSPACE.
 *
 * Chains real client-side image tools on one or many uploaded images without
 * leaving the page. Every operation is backed by the EXISTING engine in
 * `lib/image/engine.ts` (compress / resize / crop / convert)
 * - nothing here re-implements pixel work. Each engine call is dynamic-imported
 * INSIDE `Operation.run` so the initial bundle stays small (the WASM codecs
 * only load the first time an op actually runs).
 *
 * The framework passes each op an `Asset` carrying a `currentBlob`. The engine,
 * however, decodes from a `File`, so every op wraps the blob into a File,
 * `loadImageFile`s it, runs the transform, then releases the decoded bitmap and
 * the result's preview URL (the store mints its own URL for the returned blob).
 *
 * Honest scope, surfaced in the UI:
 *   • Everything runs on-device; big images are memory- and CPU-bound.
 *
 * Mounted as a next/dynamic({ ssr:false }) client island from the server page.
 * This module never imports @/lib/registry, @/lib/search, or @/config/tools.
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
import type { LoadedImage, ProcessResult } from "@/lib/image/engine";

/* ── Accepted input ──────────────────────────────────────────────────────── */

const ACCEPT_EXT = ".png,.jpg,.jpeg,.webp";
const ACCEPT_MIMES = ["image/png", "image/jpeg", "image/webp"];

/* ── Shared engine plumbing ──────────────────────────────────────────────────
 * The engine decodes from a File and returns a ProcessResult with its OWN
 * object URL. We only want the encoded blob + dimensions; the store makes its
 * own preview URL for the asset. So we always release the LoadedImage and the
 * ProcessResult after reading the blob, to avoid leaking bitmaps / URLs.
 */

/** Decode an asset's current blob into the engine's LoadedImage shape. */
async function decode(asset: Asset): Promise<{
  img: LoadedImage;
  release: () => void;
  engine: typeof import("@/lib/image/engine");
}> {
  const engine = await import("@/lib/image/engine");
  const file = new File([asset.currentBlob], asset.name, {
    type: asset.currentBlob.type || asset.meta.mime || "image/png",
  });
  const img = await engine.loadImageFile(file);
  return {
    img,
    engine,
    release: () => engine.releaseImage(img),
  };
}

/** Convert an engine ProcessResult into an OperationResult, then release it. */
function toOp(
  engine: typeof import("@/lib/image/engine"),
  result: ProcessResult,
  name?: string,
): OperationResult {
  const out: OperationResult = {
    blob: result.blob,
    meta: {
      size: result.size,
      width: result.width,
      height: result.height,
      mime: result.format,
    },
    ...(name ? { name } : {}),
  };
  engine.releaseResult(result);
  return out;
}

/** Swap a filename's extension, preserving the base name. */
function withExt(name: string, ext: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${ext}`;
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
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-foreground">
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
    <div className="inline-flex rounded-md border border-input p-0.5">
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
 * real, delegated to the engine. Controls are fully controlled: they render
 * from `params` and emit the next params object via `onChange`.
 */

/* Crop -------------------------------------------------------------------- */

type CropParams = OperationParams & {
  /** Percentages 0–100 of the current image, so it survives earlier resizes. */
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const crop: Operation<CropParams> = {
  id: "image.crop",
  label: "Crop",
  description: "Trim edges by percentage from each side",
  icon: "Crop",
  accepts: ["image"],
  defaultParams: { top: 0, right: 0, bottom: 0, left: 0 },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Decoding…");
    const { img, engine, release } = await decode(asset);
    try {
      const left = Math.round((clampPct(params.left) / 100) * img.width);
      const right = Math.round((clampPct(params.right) / 100) * img.width);
      const top = Math.round((clampPct(params.top) / 100) * img.height);
      const bottom = Math.round((clampPct(params.bottom) / 100) * img.height);
      const width = Math.max(1, img.width - left - right);
      const height = Math.max(1, img.height - top - bottom);
      onProgress?.(0.5, "Cropping…");
      const result = await engine.cropImage(img, { x: left, y: top, width, height });
      onProgress?.(1, "Done");
      return toOp(engine, result);
    } finally {
      release();
    }
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<CropParams>) => (
    <div className="grid grid-cols-2 gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Field key={side} label={`${cap(side)} · ${params[side]}%`}>
          <Range
            value={params[side]}
            min={0}
            max={90}
            onChange={(v) => onChange({ ...params, [side]: v })}
            suffix="%"
          />
        </Field>
      ))}
    </div>
  ),
};

/* Resize ------------------------------------------------------------------ */

type ResizeMode = "percent" | "dimensions";

type ResizeParams = OperationParams & {
  mode: ResizeMode;
  percent: number;
  width: number;
  height: number;
  keepAspect: boolean;
};

const resize: Operation<ResizeParams> = {
  id: "image.resize",
  label: "Resize",
  description: "Scale by percent or to exact width × height",
  icon: "Maximize2",
  accepts: ["image"],
  defaultParams: { mode: "percent", percent: 50, width: 0, height: 0, keepAspect: true },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Decoding…");
    const { img, engine, release } = await decode(asset);
    try {
      let width: number;
      let height: number;
      if (params.mode === "percent") {
        const p = Math.max(1, params.percent) / 100;
        width = img.width * p;
        height = img.height * p;
      } else {
        const targetW = params.width > 0 ? params.width : img.width;
        const targetH = params.height > 0 ? params.height : img.height;
        if (params.keepAspect) {
          // Fit within the box, preserving aspect ratio.
          const scale = Math.min(targetW / img.width, targetH / img.height);
          width = img.width * scale;
          height = img.height * scale;
        } else {
          width = targetW;
          height = targetH;
        }
      }
      onProgress?.(0.5, "Resampling…");
      const result = await engine.resizeImage(img, {
        width: Math.max(1, Math.round(width)),
        height: Math.max(1, Math.round(height)),
      });
      onProgress?.(1, "Done");
      return toOp(engine, result);
    } finally {
      release();
    }
  },
  ParamControls: ({ params, onChange, asset }: ParamControlsProps<ResizeParams>) => {
    const w = asset?.meta.width;
    const h = asset?.meta.height;
    return (
      <div className="space-y-2.5">
        <SegChoice<ResizeMode>
          value={params.mode}
          onChange={(mode) => onChange({ ...params, mode })}
          options={[
            { value: "percent", label: "By percent" },
            { value: "dimensions", label: "By size" },
          ]}
        />
        {params.mode === "percent" ? (
          <Field label={`Scale · ${params.percent}%`}>
            <Range
              value={params.percent}
              min={1}
              max={400}
              onChange={(percent) => onChange({ ...params, percent })}
              suffix="%"
            />
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Width (px)">
              <input
                type="number"
                min={1}
                className={numberInputCls}
                placeholder={w ? String(w) : "auto"}
                value={params.width || ""}
                onChange={(e) => onChange({ ...params, width: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Height (px)">
              <input
                type="number"
                min={1}
                className={numberInputCls}
                placeholder={h ? String(h) : "auto"}
                value={params.height || ""}
                onChange={(e) => onChange({ ...params, height: Number(e.target.value) || 0 })}
              />
            </Field>
            <label className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={params.keepAspect}
                onChange={(e) => onChange({ ...params, keepAspect: e.target.checked })}
                className="size-3.5 accent-primary"
              />
              Keep aspect ratio (fit within box)
            </label>
          </div>
        )}
      </div>
    );
  },
};

/* Compress ---------------------------------------------------------------- */

type CompressFormat = "image/jpeg" | "image/webp";

type CompressParams = OperationParams & {
  quality: number;
  format: CompressFormat;
};

const compress: Operation<CompressParams> = {
  id: "image.compress",
  label: "Compress",
  description: "Shrink file size with MozJPEG / WebP",
  icon: "FileArchive",
  accepts: ["image"],
  defaultParams: { quality: 75, format: "image/jpeg" },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Decoding…");
    const { img, engine, release } = await decode(asset);
    try {
      onProgress?.(0.5, "Compressing…");
      const result = await engine.compressImage(img, {
        quality: params.quality / 100,
        format: params.format,
      });
      onProgress?.(1, "Done");
      const ext = params.format === "image/webp" ? "webp" : "jpg";
      return toOp(engine, result, withExt(asset.name, ext));
    } finally {
      release();
    }
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<CompressParams>) => (
    <div className="space-y-2.5">
      <Field label={`Quality · ${params.quality}`}>
        <Range
          value={params.quality}
          min={5}
          max={100}
          onChange={(quality) => onChange({ ...params, quality })}
        />
      </Field>
      <SegChoice<CompressFormat>
        value={params.format}
        onChange={(format) => onChange({ ...params, format })}
        options={[
          { value: "image/jpeg", label: "JPEG" },
          { value: "image/webp", label: "WebP" },
        ]}
      />
      <p className="text-[11px] text-muted-foreground">
        JPEG flattens transparency onto white; WebP keeps it.
      </p>
    </div>
  ),
};

/* Convert ----------------------------------------------------------------- */

type ConvertFormat = "image/png" | "image/jpeg" | "image/webp";

type ConvertParams = OperationParams & {
  format: ConvertFormat;
  quality: number;
};

const convert: Operation<ConvertParams> = {
  id: "image.convert",
  label: "Convert",
  description: "Change format to WebP, PNG, or JPG",
  icon: "RefreshCw",
  accepts: ["image"],
  defaultParams: { format: "image/webp", quality: 92 },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Decoding…");
    const { img, engine, release } = await decode(asset);
    try {
      onProgress?.(0.5, "Converting…");
      const result = await engine.convertFormat(img, {
        format: params.format,
        quality: params.quality / 100,
      });
      onProgress?.(1, "Done");
      const ext =
        params.format === "image/png" ? "png" : params.format === "image/webp" ? "webp" : "jpg";
      return toOp(engine, result, withExt(asset.name, ext));
    } finally {
      release();
    }
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<ConvertParams>) => (
    <div className="space-y-2.5">
      <Field label="Target format">
        <SegChoice<ConvertFormat>
          value={params.format}
          onChange={(format) => onChange({ ...params, format })}
          options={[
            { value: "image/webp", label: "WebP" },
            { value: "image/png", label: "PNG" },
            { value: "image/jpeg", label: "JPG" },
          ]}
        />
      </Field>
      {params.format !== "image/png" && (
        <Field label={`Quality · ${params.quality}`}>
          <Range
            value={params.quality}
            min={5}
            max={100}
            onChange={(quality) => onChange({ ...params, quality })}
          />
        </Field>
      )}
      <p className="text-[11px] text-muted-foreground">
        PNG is lossless (no quality setting). Converting to JPG flattens transparency onto
        white.
      </p>
    </div>
  ),
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(90, Math.max(0, n));
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Category config ─────────────────────────────────────────────────────── */

/**
 * Erase each op's specific param type to the catalog's `Operation` shape. This
 * is sound: the store only ever calls `run`/`ParamControls` with the SAME
 * step's params object it got from `defaultParams`, so the concrete op always
 * receives params of the exact type it defined. (`run` is contravariant in its
 * params, so a direct widening cast isn't allowed: hence `unknown`.)
 */
function asOp<P extends OperationParams>(op: Operation<P>): Operation {
  return op as unknown as Operation;
}

const OPERATIONS: Operation[] = [
  asOp(crop),
  asOp(resize),
  asOp(compress),
  asOp(convert),
];

/**
 * Build the Image WorkspaceCategory. `createAsset` probes real pixel dimensions
 * via the engine (dynamic-imported) so previews and resize defaults are exact.
 */
function createImageCategory(): WorkspaceCategory {
  return {
    id: "image",
    title: "Image Workspace",
    kind: "image",
    accept: ACCEPT_EXT,
    acceptMimes: ACCEPT_MIMES,
    operations: OPERATIONS,
    defaultExt: "png",
    createAsset: async (file, id): Promise<Asset> => {
      const engine = await import("@/lib/image/engine");
      // Probe true dimensions; release the bitmap immediately after reading them.
      let width: number | undefined;
      let height: number | undefined;
      try {
        const probe = await engine.loadImageFile(file);
        width = probe.width;
        height = probe.height;
        engine.releaseImage(probe);
      } catch {
        /* Unreadable image: leave dimensions undefined, still let it load. */
      }
      const previewUrl = URL.createObjectURL(file);
      return {
        id,
        name: file.name,
        kind: "image",
        originalBlob: file,
        currentBlob: file,
        previewUrl,
        meta: {
          size: file.size,
          mime: file.type || "image/png",
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

export default function ImageWorkspace() {
  const category = useMemo(createImageCategory, []);

  return (
    <div className="space-y-4">
      <WorkspaceShell category={category} />
      <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
        <Icon name="ShieldCheck" size={14} className="mt-0.5 text-primary" />
        <span>
          Every image is processed entirely in your browser. Nothing is uploaded. Chain a
          pipeline like <strong className="text-foreground">Crop → Resize → Compress →
          Convert to WebP</strong>, run it across all your images at once, then
          download them as a ZIP. Very large images are bound by your device&apos;s memory.
        </span>
      </p>
    </div>
  );
}
