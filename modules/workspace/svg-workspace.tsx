/**
 * GigAI Workspace, SVG WORKSPACE.
 *
 * Chains real client-side SVG tools on one or many uploaded SVGs without leaving
 * the page. Every operation is backed by the EXISTING engines in `lib/svg-tools`
 * - nothing here re-implements SVG work. Each engine call is dynamic-imported
 * INSIDE `Operation.run` so the initial bundle stays small (SVGO's browser build
 * and the canvas rasterizer only load the first time an op actually runs).
 *
 * SVG operations work on TEXT, not pixels: an asset carries an SVG `currentBlob`,
 * so every op reads `blob.text()`, transforms the string via an engine, then
 * writes a new blob. Optimize/Minify/Prettify/Data-URI stay SVG (or text);
 * Convert → PNG/JPG rasterizes via an offscreen canvas.
 *
 * Honest scope, surfaced in the UI:
 *   • SVGO loads its browser build the first time Optimize/Minify runs → slower;
 *     if it can't load, a dependency-free fallback optimizer is used.
 *  • Rasterizing to PNG/JPG loses vector scalability. The output is a fixed-
 *     resolution bitmap. JPG also flattens transparency onto white.
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

/* ── Accepted input ──────────────────────────────────────────────────────── */

const ACCEPT_EXT = ".svg,image/svg+xml";
const ACCEPT_MIMES = ["image/svg+xml"];

/* ── Shared plumbing ──────────────────────────────────────────────────────────
 * SVG engines operate on strings. Every op reads the asset's current blob as
 * text, transforms it, then returns a new blob. We never revoke the asset's
 * previewUrl (the store owns it). We only mint blobs.
 */

/** Read an asset's current blob as an SVG source string. */
async function readSvg(asset: Asset): Promise<string> {
  return asset.currentBlob.text();
}

/** Wrap a transformed SVG string into an OperationResult (image/svg+xml blob). */
function svgResult(svg: string, name?: string): OperationResult {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  return {
    blob,
    meta: { size: blob.size, mime: "image/svg+xml" },
    ...(name ? { name } : {}),
  };
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

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 accent-primary"
      />
      {label}
    </label>
  );
}

/* ── Operations ──────────────────────────────────────────────────────────────
 * Each Operation defines its own params type, controls, and `run`. All work is
 * real, delegated to the lib/svg-tools engines. Controls are fully controlled:
 * they render from `params` and emit the next params object via `onChange`.
 */

/* Optimize (SVGO) --------------------------------------------------------- */

type OptimizeParams = OperationParams & {
  precision: number;
  multipass: boolean;
  removeIds: boolean;
  removeTitle: boolean;
  removeDimensions: boolean;
};

const optimize: Operation<OptimizeParams> = {
  id: "svg.optimize",
  label: "Optimize",
  description: "Shrink with SVGO, strip metadata, round coords, drop cruft",
  icon: "Sparkles",
  accepts: ["svg"],
  defaultParams: {
    precision: 3,
    multipass: true,
    removeIds: false,
    removeTitle: false,
    removeDimensions: false,
  },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Reading SVG…");
    const src = await readSvg(asset);
    const { optimizeSvg } = await import("@/lib/svg-tools/optimize");
    onProgress?.(0.5, "Optimizing (SVGO)…");
    const res = await optimizeSvg(src, {
      precision: params.precision,
      multipass: params.multipass,
      removeIds: params.removeIds,
      removeTitle: params.removeTitle,
      removeDimensions: params.removeDimensions,
    });
    if (!res.ok) throw new Error(res.error.message);
    onProgress?.(1, "Done");
    return svgResult(res.result);
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<OptimizeParams>) => (
    <div className="space-y-2.5">
      <Field label={`Coordinate precision · ${params.precision}`}>
        <Range
          value={params.precision}
          min={0}
          max={6}
          onChange={(precision) => onChange({ ...params, precision })}
        />
      </Field>
      <div className="space-y-1.5">
        <Toggle
          checked={params.multipass}
          label="Multipass (run until stable)"
          onChange={(multipass) => onChange({ ...params, multipass })}
        />
        <Toggle
          checked={params.removeIds}
          label="Remove unused id attributes"
          onChange={(removeIds) => onChange({ ...params, removeIds })}
        />
        <Toggle
          checked={params.removeTitle}
          label="Remove <title>/<desc> (hurts a11y)"
          onChange={(removeTitle) => onChange({ ...params, removeTitle })}
        />
        <Toggle
          checked={params.removeDimensions}
          label="Strip width/height (scale fluidly)"
          onChange={(removeDimensions) => onChange({ ...params, removeDimensions })}
        />
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Uses SVGO&apos;s browser build (loads once, so the first run is slower). If it
        can&apos;t load, a dependency-free optimizer strips comments, metadata, editor
        namespaces and rounds coordinates instead.
      </p>
    </div>
  ),
};

/* Minify / Prettify ------------------------------------------------------- */

type FormatMode = "minify" | "prettify";

type FormatParams = OperationParams & {
  mode: FormatMode;
  indent: number;
};

const format: Operation<FormatParams> = {
  id: "svg.format",
  label: "Minify / Prettify",
  description: "Collapse to one line, or re-indent for readability",
  icon: "AlignLeft",
  accepts: ["svg"],
  defaultParams: { mode: "minify", indent: 2 },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Reading SVG…");
    const src = await readSvg(asset);
    const engine = await import("@/lib/svg-tools/optimize");
    onProgress?.(0.5, params.mode === "minify" ? "Minifying…" : "Prettifying…");
    const res =
      params.mode === "minify"
        ? await engine.minifySvg(src)
        : await engine.prettifySvg(src, params.indent);
    if (!res.ok) throw new Error(res.error.message);
    onProgress?.(1, "Done");
    return svgResult(res.result);
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<FormatParams>) => (
    <div className="space-y-2.5">
      <SegChoice<FormatMode>
        value={params.mode}
        onChange={(mode) => onChange({ ...params, mode })}
        options={[
          { value: "minify", label: "Minify" },
          { value: "prettify", label: "Prettify" },
        ]}
      />
      {params.mode === "prettify" && (
        <Field label={`Indent · ${params.indent} spaces`}>
          <Range
            value={params.indent}
            min={1}
            max={8}
            onChange={(indent) => onChange({ ...params, indent })}
          />
        </Field>
      )}
      <p className="text-[11px] text-muted-foreground">
        Minify collapses whitespace for the smallest byte size; Prettify re-indents for
        editing. Neither removes drawing data.
      </p>
    </div>
  ),
};

/* Convert → PNG / JPG (rasterize) ----------------------------------------- */

type RasterType = "image/png" | "image/jpeg";

type RasterParams = OperationParams & {
  type: RasterType;
  scale: number;
  quality: number;
};

const rasterize: Operation<RasterParams> = {
  id: "svg.rasterize",
  label: "Convert to PNG / JPG",
  description: "Render the SVG to a bitmap at a chosen scale",
  icon: "Image",
  accepts: ["svg"],
  defaultParams: { type: "image/png", scale: 2, quality: 92 },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Reading SVG…");
    const src = await readSvg(asset);
    const { svgToRaster } = await import("@/lib/svg-tools/raster");
    onProgress?.(0.5, "Rasterizing…");
    const blob = await svgToRaster(src, params.type, {
      scale: params.scale,
      quality: params.quality / 100,
    });
    onProgress?.(1, "Done");
    const ext = params.type === "image/png" ? "png" : "jpg";
    // The output is a raster blob; the shell still previews it via <img>
    // (RASTER_KINDS includes "svg"), and downloads carry the new extension.
    return {
      blob,
      meta: { size: blob.size, mime: params.type },
      name: withExt(asset.name, ext),
    };
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<RasterParams>) => (
    <div className="space-y-2.5">
      <SegChoice<RasterType>
        value={params.type}
        onChange={(type) => onChange({ ...params, type })}
        options={[
          { value: "image/png", label: "PNG" },
          { value: "image/jpeg", label: "JPG" },
        ]}
      />
      <Field label={`Scale · ${params.scale}× intrinsic size`}>
        <Range
          value={params.scale}
          min={1}
          max={8}
          onChange={(scale) => onChange({ ...params, scale })}
          suffix="×"
        />
      </Field>
      {params.type === "image/jpeg" && (
        <Field label={`Quality · ${params.quality}`}>
          <Range
            value={params.quality}
            min={5}
            max={100}
            onChange={(quality) => onChange({ ...params, quality })}
          />
        </Field>
      )}
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Rasterizing loses vector scalability. The result is a fixed-resolution bitmap.
        Higher scale = sharper but larger. JPG flattens transparency onto white; PNG keeps
        it. Sizing comes from the SVG&apos;s width/height or viewBox (512px if it declares
        neither).
      </p>
    </div>
  ),
};

/* Convert → data-URI ------------------------------------------------------ */

type DataUriEncoding = "url-optimized" | "base64";

type DataUriParams = OperationParams & {
  encoding: DataUriEncoding;
};

const toDataUri: Operation<DataUriParams> = {
  id: "svg.dataUri",
  label: "Convert to data-URI",
  description: "Encode as a data: URI (CSS-ready), output as a text file",
  icon: "Link",
  accepts: ["svg"],
  defaultParams: { encoding: "url-optimized" },
  run: async (asset, params, onProgress) => {
    onProgress?.(0.1, "Reading SVG…");
    const src = await readSvg(asset);
    const { svgToDataUri } = await import("@/lib/svg-tools/convert");
    onProgress?.(0.6, "Encoding…");
    const res = svgToDataUri(src, { encoding: params.encoding });
    if (!res.ok) throw new Error(res.error.message);
    onProgress?.(1, "Done");
    const blob = new Blob([res.result], { type: "text/plain" });
    return {
      blob,
      meta: { size: blob.size, mime: "text/plain" },
      name: withExt(asset.name, "datauri.txt"),
    };
  },
  ParamControls: ({ params, onChange }: ParamControlsProps<DataUriParams>) => (
    <div className="space-y-2.5">
      <SegChoice<DataUriEncoding>
        value={params.encoding}
        onChange={(encoding) => onChange({ ...params, encoding })}
        options={[
          { value: "url-optimized", label: "URL-optimized" },
          { value: "base64", label: "Base64" },
        ]}
      />
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        URL-optimized is smaller and CSS-friendly (best for <code>background: url(…)</code>);
        Base64 is the classic, universally-compatible form. The step&apos;s output is the
        data-URI <em>text</em>, not a rendered image. Download it as a <code>.txt</code>{" "}
        and paste it into your stylesheet. Tip: Optimize first for a shorter URI.
      </p>
    </div>
  ),
};

/* ── Category config ─────────────────────────────────────────────────────── */

/**
 * Erase each op's specific param type to the catalog's `Operation` shape. This
 * is sound: the store only ever calls `run`/`ParamControls` with the SAME
 * step's params object it got from `defaultParams`, so the concrete op always
 * receives params of the exact type it defined. (`run` is contravariant in its
 * params, so a direct widening cast isn't allowed, hence `unknown`.)
 */
function asOp<P extends OperationParams>(op: Operation<P>): Operation {
  return op as unknown as Operation;
}

const OPERATIONS: Operation[] = [
  asOp(optimize),
  asOp(format),
  asOp(rasterize),
  asOp(toDataUri),
];

/**
 * Build the SVG WorkspaceCategory. `createAsset` reads the SVG source to record
 * its byte size and mime; the previewUrl is a normal object URL, which `<img>`
 * renders directly (svg is a RASTER_KIND in the shell's thumbnail logic).
 */
function createSvgCategory(): WorkspaceCategory {
  return {
    id: "svg",
    title: "SVG Workspace",
    kind: "svg",
    accept: ACCEPT_EXT,
    acceptMimes: ACCEPT_MIMES,
    operations: OPERATIONS,
    defaultExt: "svg",
    createAsset: async (file, id): Promise<Asset> => {
      const previewUrl = URL.createObjectURL(file);
      return {
        id,
        name: file.name,
        kind: "svg",
        originalBlob: file,
        currentBlob: file,
        previewUrl,
        meta: {
          size: file.size,
          mime: file.type || "image/svg+xml",
        },
        history: [],
        future: [],
      };
    },
  };
}

/* ── Component (default export) ──────────────────────────────────────────── */

export default function SvgWorkspace() {
  const category = useMemo(createSvgCategory, []);

  return (
    <div className="space-y-4">
      <WorkspaceShell category={category} />
      <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
        <Icon name="ShieldCheck" size={14} className="mt-0.5 text-primary" />
        <span>
          Every SVG is processed entirely in your browser. Nothing is uploaded. Chain a
          pipeline like{" "}
          <strong className="text-foreground">
            Optimize → Minify → Convert to data-URI
          </strong>{" "}
          (or Optimize → Convert to PNG), run it across all your files at once, then download
          them as a ZIP. Optimize loads SVGO&apos;s browser build the first time (slower run,
          dependency-free fallback if it can&apos;t load); rasterizing to PNG/JPG loses vector
          scalability.
        </span>
      </p>
    </div>
  );
}
