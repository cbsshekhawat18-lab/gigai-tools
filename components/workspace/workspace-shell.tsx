/**
 * GigAI Workspace, <WorkspaceShell>, the premium desktop-app layout.
 *
 * A single reusable shell that any category (Image, PDF, future kinds) mounts by
 * passing its `WorkspaceCategory` config. It wires up `useWorkspace(category)`
 * and lays out four regions like a real editor:
 *
 *  LEFT: files list (thumbnails, add-files dropzone) + the pipeline steps.
 *  CENTER, the active asset's live preview + the selected step's controls + Apply.
 *  RIGHT: operation options / presets + quick actions (undo, redo, reset, run all).
 *  BOTTOM: progress + per-file downloads + Download-all (ZIP).
 *
 * This is a CLIENT island (mounted via next/dynamic ssr:false from the server
 * workspace page). It must NEVER import @/lib/registry, @/lib/search, or
 * @/config/tools. All heavy engines are dynamic-imported inside operation.run,
 * not here, so this component stays light.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/image/engine";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/workspace/store";
import { useFileDrop } from "@/lib/workspace/use-file-drop";
import type { WorkspaceCategory } from "@/lib/workspace/types";
import { FileDropzone } from "./file-dropzone";
import { DropOverlay } from "./drop-overlay";
import { AssetThumb } from "./asset-thumb";
import { StepList } from "./step-list";
import { OperationPicker } from "./operation-picker";
import { DownloadBar } from "./download-bar";

export interface WorkspaceShellProps {
  /** The category config: operations + accepted file types. */
  category: WorkspaceCategory;
  /**
   * Optional sample/starter action for the empty state (e.g. "Load a sample").
   * When provided, a secondary button invokes it.
   */
  onLoadSample?: () => void;
  className?: string;
}

export function WorkspaceShell({ category, onLoadSample, className }: WorkspaceShellProps) {
  const ws = useWorkspace(category);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  // Whole-page file drop: drop images ANYWHERE over the workspace to add them
  // (and never let the browser navigate away on a stray drop).
  const { isDragging } = useFileDrop(ws.addFiles);

  // Keep a selected step even as steps change; clear if it's removed.
  useEffect(() => {
    if (activeStepId && !ws.steps.some((s) => s.id === activeStepId)) {
      setActiveStepId(ws.steps[0]?.id ?? null);
    }
  }, [ws.steps, activeStepId]);

  const opById = useMemo(
    () => new Map(category.operations.map((op) => [op.id, op])),
    [category.operations],
  );

  const presentKinds = useMemo(
    () => Array.from(new Set(ws.assets.map((a) => a.kind))),
    [ws.assets],
  );

  const activeStep = ws.steps.find((s) => s.id === activeStepId) ?? null;
  const activeOp = activeStep ? opById.get(activeStep.operationId) ?? null : null;
  const { activeAsset } = ws;

  // Keyboard: Cmd/Ctrl+Z undo, Shift+Cmd/Ctrl+Z redo (when not typing).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) ws.redo();
        else ws.undo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ws]);

  const hasAssets = ws.assets.length > 0;

  return (
    <div
      className={cn(
        "relative flex h-[min(80vh,900px)] min-h-[560px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      <DropOverlay show={isDragging} label={`Drop ${category.title.toLowerCase()} files`} />
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon name="LayoutGrid" size={16} />
          </span>
          <h2 className="text-sm font-semibold">{category.title}</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={!ws.canUndo()}
            onClick={() => ws.undo()}
            aria-label="Undo"
            title="Undo (⌘Z)"
          >
            <Icon name="Undo2" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!ws.canRedo()}
            onClick={() => ws.redo()}
            aria-label="Redo"
            title="Redo (⇧⌘Z)"
          >
            <Icon name="Redo2" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!activeAsset || activeAsset.history.length === 0}
            onClick={() => ws.resetAsset()}
            aria-label="Reset file to original"
            title="Reset to original"
          >
            <Icon name="RotateCcw" size={16} />
          </Button>
          <div className="mx-1 h-5 w-px bg-border" />
          <Button
            size="sm"
            disabled={ws.busy || ws.steps.length === 0 || !hasAssets}
            onClick={() => ws.runPipeline("all")}
          >
            <Icon name="Sparkles" size={15} />
            Run all
          </Button>
        </div>
      </header>

      {/* ── Main three-column body ──────────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(220px,260px)_1fr_minmax(240px,300px)] max-lg:grid-cols-[minmax(200px,240px)_1fr] max-md:grid-cols-1 max-md:overflow-y-auto">
        {/* LEFT: files + pipeline */}
        <aside
          aria-label="Files and pipeline"
          className="flex min-h-0 flex-col gap-4 overflow-y-auto border-r border-border p-3 max-md:border-b max-md:border-r-0"
        >
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Files
              </h3>
              {ws.assets.length > 1 && (
                <button
                  type="button"
                  onClick={ws.selectAll}
                  className="text-[11px] text-primary hover:underline"
                >
                  Select all
                </button>
              )}
            </div>
            <FileDropzone
              accept={category.accept}
              onFiles={ws.addFiles}
              compact
              label="Add files"
              icon="FilePlus"
            />
            <div className="flex flex-col gap-1">
              {ws.assets.map((a) => (
                <AssetThumb
                  key={a.id}
                  asset={a}
                  thumbIcon={category.thumbIcon}
                  selected={ws.selectedIds.includes(a.id)}
                  onSelect={() => ws.selectAsset(a.id)}
                  onToggle={() => ws.toggleAsset(a.id)}
                  onRemove={() => ws.removeAsset(a.id)}
                  onDownload={() => ws.downloadOne(a.id)}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pipeline
            </h3>
            <OperationPicker
              operations={category.operations}
              presentKinds={presentKinds}
              onPick={(opId) => {
                ws.addStep(opId);
              }}
            />
            <StepList
              steps={ws.steps}
              operationsById={opById}
              activeStepId={activeStepId}
              busy={ws.busy}
              onSelect={setActiveStepId}
              onMove={ws.moveStep}
              onRemove={ws.removeStep}
              onApply={(id) => ws.applyStep(id, "selected")}
            />
          </section>
        </aside>

        {/* CENTER: preview + active step controls */}
        <div role="region" aria-label="Preview" className="flex min-h-0 flex-col overflow-hidden bg-muted/20">
          {!hasAssets ? (
            <EmptyState category={category} onFiles={ws.addFiles} onLoadSample={onLoadSample} />
          ) : (
            <>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-6">
                {activeAsset ? (
                  <figure className="flex max-h-full max-w-full flex-col items-center gap-3">
                    {category.renderPreview ? (
                      // Category-supplied preview (audio/video/document/text/…).
                      category.renderPreview(activeAsset)
                    ) : (
                      // Default raster preview: image/svg render fine as <img>.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeAsset.previewUrl}
                        alt={activeAsset.name}
                        className="max-h-[52vh] max-w-full rounded-lg border border-border bg-[repeating-conic-gradient(#8881_0_25%,transparent_0_50%)] bg-[length:20px_20px] object-contain shadow-sm"
                      />
                    )}
                    <figcaption className="text-center text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{activeAsset.name}</span>
                      {" · "}
                      {formatBytes(activeAsset.meta.size)}
                      {activeAsset.meta.width && activeAsset.meta.height
                        ? ` · ${activeAsset.meta.width}×${activeAsset.meta.height}`
                        : activeAsset.meta.pageCount
                          ? ` · ${activeAsset.meta.pageCount} pages`
                          : ""}
                    </figcaption>
                  </figure>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a file to preview it.</p>
                )}
              </div>

              {/* Active step controls + Apply */}
              {activeStep && activeOp && (
                <div className="border-t border-border bg-card px-4 py-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon name={activeOp.icon} size={14} />
                    </span>
                    <span className="text-sm font-medium">{activeOp.label}</span>
                    <span className="text-xs text-muted-foreground">{activeOp.description}</span>
                  </div>
                  {activeOp.ParamControls && (
                    <div className="mb-3">
                      <activeOp.ParamControls
                        params={activeStep.params}
                        onChange={(p) => ws.updateStepParams(activeStep.id, p)}
                        asset={activeAsset}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={ws.busy || !activeAsset}
                      onClick={() => ws.applyStep(activeStep.id, "selected")}
                    >
                      <Icon name="Check" size={15} />
                      Apply to selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={ws.busy || !hasAssets}
                      onClick={() => ws.applyStep(activeStep.id, "all")}
                    >
                      Apply to all
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT: options / quick actions */}
        <aside
          aria-label="Options"
          className="flex min-h-0 flex-col gap-4 overflow-y-auto border-l border-border p-3 max-lg:hidden"
        >
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Selection
            </h3>
            <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
              {ws.selectedIds.length === 0
                ? "Nothing selected. The active file is used by default."
                : `${ws.selectedIds.length} file${ws.selectedIds.length === 1 ? "" : "s"} selected.`}
              <p className="mt-1.5 text-[11px]">
                Tip: ⌘/Ctrl-click a file to multi-select, then Apply to selected.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Quick actions
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              disabled={ws.busy || ws.steps.length === 0 || !hasAssets}
              onClick={() => ws.runPipeline("all")}
            >
              <Icon name="Sparkles" size={15} />
              Run pipeline on all files
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              disabled={ws.steps.length === 0}
              onClick={ws.clearSteps}
            >
              <Icon name="ListX" size={15} />
              Clear pipeline
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              disabled={!hasAssets}
              onClick={ws.clearAssets}
            >
              <Icon name="Trash2" size={15} />
              Remove all files
            </Button>
          </section>

          <section className="mt-auto flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              About this session
            </h3>
            <p className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
              Everything runs in your browser: files never leave your device. Your
              <span className="text-foreground"> pipeline</span> is saved and recovers on refresh;
              the files themselves are in-memory, so you&apos;ll re-add them after a reload.
            </p>
          </section>
        </aside>
      </div>

      {/* ── Bottom: progress + downloads ─────────────────────────── */}
      <footer className="border-t border-border px-4 py-2.5">
        <DownloadBar
          assets={ws.assets}
          busy={ws.busy}
          progress={ws.progress}
          error={ws.error}
          onDownloadAll={ws.downloadAll}
          onDownloadOne={ws.downloadOne}
        />
      </footer>
    </div>
  );
}

/** The rich empty state shown before any file is added. */
function EmptyState({
  category,
  onFiles,
  onLoadSample,
}: {
  category: WorkspaceCategory;
  onFiles: (files: FileList | File[]) => void;
  onLoadSample?: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon name="Workflow" size={30} />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-lg font-semibold">Start a {category.title.toLowerCase()} workflow</h3>
        <p className="text-sm text-muted-foreground">
          Drop your files, chain operations into a pipeline, and run them across everything at
          once, all in your browser.
        </p>
      </div>
      <div className="w-full max-w-md">
        <FileDropzone
          accept={category.accept}
          onFiles={onFiles}
          label="Drop files here or click to browse"
          hint="Nothing is uploaded, processing happens on your device."
        />
      </div>
      {onLoadSample && (
        <Button variant="outline" size="sm" onClick={onLoadSample}>
          <Icon name="Image" size={15} />
          Try a sample
        </Button>
      )}
    </div>
  );
}

/* ===========================================================================
 * === PUBLIC API === (what workspace authors, Image/PDF/etc., build against)
 * ===========================================================================
 *
 * ── The store hook ────────────────────────────────────────────────────────
 *   import { useWorkspace } from "@/lib/workspace/store";
 *   const ws = useWorkspace(category: WorkspaceCategory): WorkspaceStore
 *
 *   WorkspaceStore fields:
 *     State:   category, assets: Asset[], selectedIds: string[],
 *              activeAsset: Asset | null, steps: WorkspaceStep[],
 *              busy: boolean, progress: RunProgress | null, error: string | null
 *     Files:   addFiles(files), removeAsset(id), clearAssets(),
 *              selectAsset(id), toggleAsset(id), selectAll()
 *     Pipeline: addStep(operationId), removeStep(stepId),
 *              updateStepParams(stepId, params), moveStep(stepId, -1|1),
 *              clearSteps(), applyStep(stepId, "selected"|"all"),
 *              runPipeline("selected"|"all")
 *     History: undo(id?), redo(id?), canUndo(id?), canRedo(id?), resetAsset(id?)
 *     Output:  downloadOne(id), downloadAll()   // ZIP via fflate when >1 asset
 *
 *   RunProgress = { fraction: number (0..1), status: string }  (from store.ts)
 *
 * ── The shell ─────────────────────────────────────────────────────────────
 *   import { WorkspaceShell } from "@/components/workspace/workspace-shell";
 *   <WorkspaceShell
 *  category={category} // WorkspaceCategory, REQUIRED
 *      onLoadSample={() => …}    // optional: empty-state "Try a sample" action
 *      className={…}             // optional
 *   />
 *   Renders the full 4-region editor and owns its own useWorkspace(category).
 *   Mount it as a CLIENT island via next/dynamic({ ssr:false }) from the
 *   server workspace page. It never imports @/lib/registry, @/lib/search, or
 *   @/config/tools.
 *
 * ── The shapes a category must supply (from @/lib/workspace/types) ─────────
 *   WorkspaceCategory = {
 *     id: string;                 // localStorage namespace, e.g. "image"
 *     title: string;              // "Image Workspace"
 *     kind: AssetKind;            // "image" | "pdf"
 *     accept: string;             // input accept, e.g. "image/*"
 *  acceptMimes: string[]; // ["image/*"]: validated on drop
 *     operations: Operation[];    // the tool catalog
 *     createAsset(file, id): Promise<Asset>;  // probe metadata → Asset
 *     defaultExt: string;         // "png" / "pdf"
 *     renderPreview?(asset): ReactNode;  // OPTIONAL custom CENTER preview
 *       // (audio/video/document/text). Return just the media element; the shell
 *       // adds the name/size caption. Omit for image/svg (default <img> works).
 *     thumbIcon?: IconName;       // OPTIONAL sidebar-thumbnail fallback icon for
 *       // non image/svg kinds (defaults to a kind-based icon otherwise).
 *   }
 *
 *   Operation<P> = {
 *     id, label, description, icon (lucide name),
 *     accepts: AssetKind[],
 *     defaultParams: P,
 *     run(asset, params, onProgress?): Promise<OperationResult>,  // REAL work;
 *       // dynamic-import the engine INSIDE run; MUST NOT mutate `asset`.
 *     ParamControls?: ComponentType<ParamControlsProps<P>>,       // options UI
 *   }
 *   OperationResult = { blob: Blob; meta?: Partial<AssetMeta>; name?: string }
 *   ParamControlsProps<P> = { params: P; onChange(next: P): void; asset: Asset | null }
 *
 *   Asset = {
 *     id, name, kind: AssetKind,
 *  originalBlob, currentBlob, previewUrl, // store-managed URL, don't revoke
 *     meta: { size, width?, height?, pageCount?, mime? },
 *     history: Blob[], future: Blob[],         // per-asset undo/redo (session)
 *   }
 *   WorkspaceStep = { id, operationId, params }  // a configured pipeline entry
 *
 *   AssetKind = "image" | "pdf" | "svg" | "audio" | "video" | "document" | "text"
 *     (image/svg preview as <img>; others supply category.renderPreview +
 *      category.thumbIcon so the CENTER + sidebar render correctly)
 * =========================================================================== */
