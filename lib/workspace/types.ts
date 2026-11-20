/**
 * GigAI Workspace, engine-agnostic framework types.
 *
 * A "workspace" lets a user drop MULTIPLE files, then chain a pipeline of
 * operations across them without leaving the page (Figma/Canva feel). This file
 * defines the shapes the store, the shell, and each category config (Image, PDF,
 * future kinds) all agree on. Nothing here is category-specific: an operation is
 * just a pure-ish async `run(asset, params)` that returns a new blob, so Image
 * and PDF reuse the exact same store and shell.
 *
 * PROCESSING IS REAL. Operations call the existing client-side engines
 * (`lib/image/engine.ts`, `lib/pdf/*`). Files are never uploaded. Blobs live in
 * memory; only slim metadata + the step list persist (see the store) so a
 * refresh recovers the *pipeline* even though the files must be re-added. This
 * limit is surfaced honestly in the UI.
 */

import type { ComponentType, ReactNode } from "react";

/**
 * PascalCase lucide icon name, resolved through `@/lib/icons` <Icon>. Kept as a
 * `string` alias (mirroring `Operation.icon`) since the Icon component itself
 * takes `name: string` and falls back safely on unknown names.
 */
export type IconName = string;

/** What kind of files a workspace accepts / an asset carries. */
export type AssetKind = "image" | "pdf" | "svg" | "audio" | "video" | "document" | "text";

/** Per-asset metadata the previews and step controls read. Category-extensible. */
export interface AssetMeta {
  /** Byte size of the CURRENT blob (kept in sync on every step). */
  size: number;
  /** Image pixel width (images only). */
  width?: number;
  /** Image pixel height (images only). */
  height?: number;
  /** Page count (pdf only). */
  pageCount?: number;
  /** MIME type of the current blob, e.g. "image/webp" / "application/pdf". */
  mime?: string;
}

/**
 * A file loaded into the workspace. `originalBlob` is the pristine import;
 * `currentBlob` is the working copy after any applied steps. `history` holds
 * prior `currentBlob` snapshots for per-asset undo (session-only, in memory).
 * `previewUrl` is an object URL for the current blob, the store mints and
 * revokes it, so consumers must never revoke it themselves.
 */
export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  originalBlob: Blob;
  currentBlob: Blob;
  /** Object URL for `currentBlob`; managed by the store. */
  previewUrl: string;
  meta: AssetMeta;
  /** Snapshots of prior `currentBlob`s (oldest → newest) for undo. */
  history: Blob[];
  /** Redo stack: blobs popped by undo, ready to reapply. */
  future: Blob[];
}

/** Progress signal an operation may emit during a long run. `0..1`. */
export type ProgressFn = (fraction: number, status?: string) => void;

/** The result an operation returns: a new blob + any changed metadata. */
export interface OperationResult {
  blob: Blob;
  /** Partial metadata to merge (e.g. new width/height, pageCount). */
  meta?: Partial<AssetMeta>;
  /** Optional new display name (e.g. after a format conversion). */
  name?: string;
}

/**
 * Props handed to an operation's parameter UI. The controls are fully
 * controlled: they render from `params` and call `onChange` with the next
 * params object. `asset` is provided so controls can seed sensible defaults
 * (e.g. resize prefilled to the current dimensions).
 */
export interface ParamControlsProps<P = OperationParams> {
  params: P;
  onChange: (next: P) => void;
  /** The primary selected asset (for context-aware defaults); may be null. */
  asset: Asset | null;
}

/** Free-form params bag. Each operation narrows this to its own shape. */
export type OperationParams = Record<string, unknown>;

/**
 * A single workspace operation (one "tool" in the pipeline). `run` is the ONLY
 * place real processing happens; it must dynamic-import heavy engines INSIDE the
 * call so the initial bundle stays small. Keep `run` pure w.r.t. the store: take
 * an asset + params, return a new blob. Never mutate the asset.
 */
export interface Operation<P extends OperationParams = OperationParams> {
  /** Stable id, unique within a category (e.g. "image.compress"). */
  id: string;
  /** Short human label, e.g. "Compress". */
  label: string;
  /** One-line description shown in the operation picker. */
  description: string;
  /** PascalCase lucide icon name (rendered via @/lib/icons Icon). */
  icon: string;
  /** Which asset kinds this op can run on. */
  accepts: AssetKind[];
  /** Starting params when the op is added to the pipeline. */
  defaultParams: P;
  /**
   * Do the work. MUST NOT mutate `asset`. Dynamic-import engines inside.
   * `onProgress` is optional to call.
   */
  run: (asset: Asset, params: P, onProgress?: ProgressFn) => Promise<OperationResult>;
  /** Optional controls for tuning params before Apply. */
  ParamControls?: ComponentType<ParamControlsProps<P>>;
}

/**
 * A configured operation instance sitting in the pipeline. Distinct from
 * `Operation` (the definition): this pairs an op id with the params the user
 * set. The store persists a slim form of these to localStorage so the pipeline
 * recovers after a refresh.
 */
export interface WorkspaceStep {
  /** Instance id (unique per step, not per operation kind). */
  id: string;
  /** The `Operation.id` this step runs. */
  operationId: string;
  /** Current params for this step. */
  params: OperationParams;
}

/** The slim, JSON-safe shape of a step persisted to localStorage. */
export interface PersistedStep {
  id: string;
  operationId: string;
  params: OperationParams;
}

/**
 * A category config plugged into the shell: the operation catalog + which file
 * types this workspace accepts. Image, PDF and future kinds each export one.
 */
export interface WorkspaceCategory {
  /** Stable id, e.g. "image" / "pdf". Used as the localStorage namespace. */
  id: string;
  /** Human title, e.g. "Image Workspace". */
  title: string;
  /** The asset kind produced from accepted files. */
  kind: AssetKind;
  /** `accept` attribute for the file input, e.g. "image/*". */
  accept: string;
  /** MIME prefixes/types allowed on drop (validated before load). */
  acceptMimes: string[];
  /** The operations available in this workspace. */
  operations: Operation[];
  /**
   * Turn an imported File into an Asset (reads dimensions / page count). Runs
   * client-side; may dynamic-import an engine to probe metadata.
   */
  createAsset: (file: File, id: string) => Promise<Asset>;
  /** Default download extension for a processed asset, e.g. "png"/"pdf". */
  defaultExt: string;
  /**
   * OPTIONAL custom CENTER preview for the active asset. When provided, the
   * shell renders this instead of the default `<img src={asset.previewUrl}>`.
   * Use for kinds an `<img>` can't show (audio/video/document/text): e.g. an
   * `<audio>`/`<video controls src={asset.previewUrl}>` or a document icon
   * card. The shell still renders the filename/size/dimensions caption below
   * it, so return just the media element. Omit for image/svg (they render as
   * `<img>` fine).
   */
  renderPreview?: (asset: Asset) => ReactNode;
  /**
   * OPTIONAL sidebar thumbnail fallback icon (PascalCase lucide name) for kinds
   * whose `previewUrl` isn't a raster an `<img>` can show. When set, non
   * image/svg assets render this icon tile in the files list instead of a
   * broken `<img>`. If omitted, a sensible kind-based default icon is used.
   */
  thumbIcon?: IconName;
}

/** A finished output ready to download (single) or bundle (ZIP). */
export interface WorkspaceOutput {
  name: string;
  blob: Blob;
}
