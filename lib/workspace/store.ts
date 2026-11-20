/**
 * GigAI Workspace, the client store (a React hook).
 *
 * `useWorkspace(category)` owns the entire session model: the loaded assets, the
 * current selection, the ordered pipeline of steps, and the apply/undo/redo/
 * download machinery. It is engine-agnostic. Every real operation comes from
 * the `category.operations` catalog.
 *
 * PERSISTENCE (honest limits): blobs are large and can't be JSON-stringified, so
 * we DON'T try to survive a refresh with the files intact. Instead we persist a
 * SLIM record to localStorage under the category id: the STEP LIST (operation
 * ids + params) and UI settings. On reload the pipeline is restored, and the UI
 * tells the user to re-add their files to re-run it. This is the "simplest
 * robust" recovery: no IndexedDB blob store to corrupt, no silent data loss.
 * Per-asset undo/redo is in-memory only (blob history) and does NOT persist.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Asset,
  OperationParams,
  PersistedStep,
  ProgressFn,
  WorkspaceCategory,
  WorkspaceOutput,
  WorkspaceStep,
} from "./types";

/** localStorage key for a category's persisted pipeline. */
function storageKey(categoryId: string): string {
  return `gigai:workspace:${categoryId}:v1`;
}

/** Small non-crypto id, fine for client-only instance ids. */
function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Revoke an object URL, swallowing double-revoke errors. */
function revoke(url: string | undefined): void {
  if (!url) return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    /* already revoked */
  }
}

/** Live progress for the currently-running apply. */
export interface RunProgress {
  /** 0..1 overall (across all targeted assets). */
  fraction: number;
  /** Human status line, e.g. "Compressing photo.jpg…". */
  status: string;
}

/** Everything a workspace UI needs. Returned by `useWorkspace`. */
export interface WorkspaceStore {
  // ── State ────────────────────────────────────────────────
  category: WorkspaceCategory;
  assets: Asset[];
  /** Ids of currently-selected assets (empty = none). */
  selectedIds: string[];
  /** The primary selected asset (first selected), or null. */
  activeAsset: Asset | null;
  /** The ordered pipeline of configured steps. */
  steps: WorkspaceStep[];
  /** True while an apply is running. */
  busy: boolean;
  /** Live progress while `busy`, else null. */
  progress: RunProgress | null;
  /** Last error message (cleared on the next action), or null. */
  error: string | null;

  // ── File management ──────────────────────────────────────
  addFiles: (files: FileList | File[]) => Promise<void>;
  removeAsset: (id: string) => void;
  clearAssets: () => void;
  /** Select a single asset (replaces selection). */
  selectAsset: (id: string) => void;
  /** Toggle an asset in a multi-selection. */
  toggleAsset: (id: string) => void;
  selectAll: () => void;

  // ── Pipeline ─────────────────────────────────────────────
  addStep: (operationId: string) => void;
  removeStep: (stepId: string) => void;
  updateStepParams: (stepId: string, params: OperationParams) => void;
  moveStep: (stepId: string, dir: -1 | 1) => void;
  clearSteps: () => void;

  /** Run one step's operation on the target assets (selection, or all). */
  applyStep: (stepId: string, target?: "selected" | "all") => Promise<void>;
  /** Run every step in order across the target assets (the full pipeline). */
  runPipeline: (target?: "selected" | "all") => Promise<void>;

  // ── Undo / redo (per active asset) ───────────────────────
  undo: (assetId?: string) => void;
  redo: (assetId?: string) => void;
  canUndo: (assetId?: string) => boolean;
  canRedo: (assetId?: string) => boolean;
  /** Revert an asset (or the active one) to its original import. */
  resetAsset: (assetId?: string) => void;

  // ── Download ─────────────────────────────────────────────
  downloadOne: (assetId: string) => void;
  downloadAll: () => Promise<void>;
}

export function useWorkspace(category: WorkspaceCategory): WorkspaceStore {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [steps, setSteps] = useState<WorkspaceStep[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<RunProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Always-current mirror of `assets`, read by the async apply/pipeline loops.
  // We must NOT read the live assets through a `setAssets(prev => {...})` updater:
  // React only runs that updater synchronously via its eager-state bail-out, and
  // that optimisation is disabled whenever the fiber already has pending updates
  // (e.g. the setBusy(true)/setError(null) we call right before the loop). That
  // made every operation silently skip. A ref, updated on each render AND after
  // each in-loop commit, is reliable.
  const assetsRef = useRef<Asset[]>(assets);
  assetsRef.current = assets;

  // Track every object URL we mint so we can revoke on unmount / replace.
  const urlsRef = useRef<Set<string>>(new Set());
  // Operation catalog indexed by id for O(1) lookup.
  const opById = useMemo(() => {
    const m = new Map(category.operations.map((op) => [op.id, op]));
    return m;
  }, [category.operations]);

  // ── Restore the persisted pipeline on mount (steps only) ──────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey(category.id));
      if (!raw) return;
      const parsed = JSON.parse(raw) as { steps?: PersistedStep[] };
      const restored: WorkspaceStep[] = (parsed.steps ?? [])
        .filter((s) => opById.has(s.operationId))
        .map((s) => ({ id: s.id, operationId: s.operationId, params: s.params }));
      if (restored.length) setSteps(restored);
    } catch {
      /* corrupt/absent. Start clean */
    }
    // Only on mount for this category.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id]);

  // ── Persist the pipeline whenever it changes (slim, JSON-safe) ────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload = {
        steps: steps.map<PersistedStep>((s) => ({
          id: s.id,
          operationId: s.operationId,
          params: s.params,
        })),
      };
      window.localStorage.setItem(storageKey(category.id), JSON.stringify(payload));
    } catch {
      /* quota / disabled storage, non-fatal */
    }
  }, [steps, category.id]);

  // ── Revoke all URLs on unmount ────────────────────────────────────────
  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      for (const u of urls) revoke(u);
      urls.clear();
    };
  }, []);

  /** Mint + track a preview URL for a blob. */
  const trackUrl = useCallback((blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.add(url);
    return url;
  }, []);

  /** Replace an asset's preview URL, revoking the old one. */
  const swapUrl = useCallback((oldUrl: string, blob: Blob): string => {
    revoke(oldUrl);
    urlsRef.current.delete(oldUrl);
    return trackUrl(blob);
  }, [trackUrl]);

  // ── File management ───────────────────────────────────────────────────
  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const list = Array.from(files);
      const accepted = list.filter((f) =>
        category.acceptMimes.some((m) =>
          m.endsWith("/*") ? f.type.startsWith(m.slice(0, -1)) : f.type === m,
        ),
      );
      if (accepted.length === 0) {
        if (list.length > 0) setError(`Those files aren't supported here. Add ${category.title.toLowerCase()} files.`);
        return;
      }

      const created: Asset[] = [];
      for (const file of accepted) {
        try {
          const asset = await category.createAsset(file, makeId("asset"));
          // Re-mint the preview URL through our tracker so it's revocable.
          revoke(asset.previewUrl);
          const previewUrl = trackUrl(asset.currentBlob);
          created.push({ ...asset, previewUrl });
        } catch (err) {
          setError(err instanceof Error ? err.message : `Couldn't read "${file.name}".`);
        }
      }
      if (created.length === 0) return;

      setAssets((prev) => [...prev, ...created]);
      // Auto-select the first import if nothing is selected yet.
      setSelectedIds((prev) => (prev.length ? prev : created[0] ? [created[0].id] : prev));
    },
    [category, trackUrl],
  );

  const removeAsset = useCallback((id: string) => {
    setAssets((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) {
        revoke(target.previewUrl);
        urlsRef.current.delete(target.previewUrl);
      }
      return prev.filter((a) => a.id !== id);
    });
    setSelectedIds((prev) => prev.filter((s) => s !== id));
  }, []);

  const clearAssets = useCallback(() => {
    setAssets((prev) => {
      for (const a of prev) {
        revoke(a.previewUrl);
        urlsRef.current.delete(a.previewUrl);
      }
      return [];
    });
    setSelectedIds([]);
  }, []);

  const selectAsset = useCallback((id: string) => setSelectedIds([id]), []);
  const toggleAsset = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }, []);
  const selectAll = useCallback(() => {
    setSelectedIds(assetsRef.current.map((a) => a.id));
  }, []);

  const activeAsset = useMemo(() => {
    const firstSelected = selectedIds[0];
    if (firstSelected) return assets.find((a) => a.id === firstSelected) ?? null;
    return assets[0] ?? null;
  }, [assets, selectedIds]);

  // ── Pipeline ──────────────────────────────────────────────────────────
  const addStep = useCallback(
    (operationId: string) => {
      const op = opById.get(operationId);
      if (!op) return;
      setSteps((prev) => [
        ...prev,
        { id: makeId("step"), operationId, params: { ...op.defaultParams } },
      ]);
    },
    [opById],
  );

  const removeStep = useCallback((stepId: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  }, []);

  const updateStepParams = useCallback((stepId: string, params: OperationParams) => {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, params } : s)));
  }, []);

  const moveStep = useCallback((stepId: string, dir: -1 | 1) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === stepId);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = prev.slice();
      const a = copy[idx]!;
      const b = copy[next]!;
      copy[idx] = b;
      copy[next] = a;
      return copy;
    });
  }, []);

  const clearSteps = useCallback(() => setSteps([]), []);

  /** Resolve the asset ids we should act on for a target mode. */
  const targetIds = useCallback(
    (target: "selected" | "all"): string[] => {
      if (target === "all") return assets.map((a) => a.id);
      return selectedIds.length ? selectedIds : activeAsset ? [activeAsset.id] : [];
    },
    [assets, selectedIds, activeAsset],
  );

  /**
   * Apply a single operation (by op id + params) to one asset, returning the
   * updated asset with history pushed. Does NOT touch state, caller commits.
   */
  const runOnAsset = useCallback(
    async (
      asset: Asset,
      operationId: string,
      params: OperationParams,
      onProgress?: ProgressFn,
    ): Promise<Asset> => {
      const op = opById.get(operationId);
      if (!op) throw new Error(`Unknown operation "${operationId}".`);
      if (!op.accepts.includes(asset.kind)) {
        throw new Error(`"${op.label}" can't run on ${asset.kind} files.`);
      }
      const result = await op.run(asset, params, onProgress);
      const previewUrl = swapUrl(asset.previewUrl, result.blob);
      return {
        ...asset,
        name: result.name ?? asset.name,
        currentBlob: result.blob,
        previewUrl,
        meta: { ...asset.meta, ...result.meta, size: result.blob.size },
        history: [...asset.history, asset.currentBlob],
        future: [], // a new edit invalidates the redo stack
      };
    },
    [opById, swapUrl],
  );

  const applyStep = useCallback(
    async (stepId: string, target: "selected" | "all" = "selected") => {
      const step = steps.find((s) => s.id === stepId);
      if (!step || busy) return;
      const ids = targetIds(target);
      if (ids.length === 0) {
        setError("Select a file to apply this to.");
        return;
      }
      const op = opById.get(step.operationId);
      setBusy(true);
      setError(null);
      try {
        for (let i = 0; i < ids.length; i += 1) {
          const id = ids[i]!;
          // Read the freshest copy of the asset from the live ref.
          const current = assetsRef.current.find((a) => a.id === id);
          if (!current || !op || !op.accepts.includes(current.kind)) continue;
          const base = i / ids.length;
          const updated = await runOnAsset(current, step.operationId, step.params, (f, s) =>
            setProgress({
              fraction: base + f / ids.length,
              status: s ?? `${op.label} · ${current.name}`,
            }),
          );
          assetsRef.current = assetsRef.current.map((a) => (a.id === id ? updated : a));
          setAssets((prev) => prev.map((a) => (a.id === id ? updated : a)));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "That operation failed.");
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [steps, busy, targetIds, opById, runOnAsset],
  );

  const runPipeline = useCallback(
    async (target: "selected" | "all" = "all") => {
      if (busy) return;
      if (steps.length === 0) {
        setError("Add at least one step to the pipeline first.");
        return;
      }
      const ids = targetIds(target);
      if (ids.length === 0) {
        setError("Add or select a file first.");
        return;
      }
      setBusy(true);
      setError(null);
      const total = ids.length * steps.length;
      let done = 0;
      try {
        for (const id of ids) {
          // Working asset for this file; reassigned after each step so the next
          // step in the pipeline runs on the previous step's output.
          let current = assetsRef.current.find((a) => a.id === id);
          for (const step of steps) {
            const op = opById.get(step.operationId);
            if (!current || !op || !op.accepts.includes(current.kind)) {
              done += 1;
              continue;
            }
            const base = done / total;
            const stepName = current.name;
            const updated = await runOnAsset(current, step.operationId, step.params, (f, s) =>
              setProgress({
                fraction: base + f / total,
                status: s ?? `${op.label} · ${stepName}`,
              }),
            );
            assetsRef.current = assetsRef.current.map((a) => (a.id === id ? updated : a));
            setAssets((prev) => prev.map((a) => (a.id === id ? updated : a)));
            current = updated;
            done += 1;
            setProgress({ fraction: done / total, status: `${op.label} · ${current.name}` });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "The pipeline failed.");
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [busy, steps, targetIds, opById, runOnAsset],
  );

  // ── Undo / redo (per asset) ───────────────────────────────────────────
  const resolveId = useCallback(
    (assetId?: string) => assetId ?? activeAsset?.id,
    [activeAsset],
  );

  const undo = useCallback(
    (assetId?: string) => {
      const id = resolveId(assetId);
      if (!id) return;
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id !== id || a.history.length === 0) return a;
          const previous = a.history[a.history.length - 1]!;
          const previewUrl = swapUrl(a.previewUrl, previous);
          return {
            ...a,
            currentBlob: previous,
            previewUrl,
            meta: { ...a.meta, size: previous.size },
            history: a.history.slice(0, -1),
            future: [a.currentBlob, ...a.future],
          };
        }),
      );
    },
    [resolveId, swapUrl],
  );

  const redo = useCallback(
    (assetId?: string) => {
      const id = resolveId(assetId);
      if (!id) return;
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id !== id || a.future.length === 0) return a;
          const nextBlob = a.future[0]!;
          const previewUrl = swapUrl(a.previewUrl, nextBlob);
          return {
            ...a,
            currentBlob: nextBlob,
            previewUrl,
            meta: { ...a.meta, size: nextBlob.size },
            history: [...a.history, a.currentBlob],
            future: a.future.slice(1),
          };
        }),
      );
    },
    [resolveId, swapUrl],
  );

  const canUndo = useCallback(
    (assetId?: string) => {
      const id = resolveId(assetId);
      const a = assets.find((x) => x.id === id);
      return !!a && a.history.length > 0;
    },
    [assets, resolveId],
  );

  const canRedo = useCallback(
    (assetId?: string) => {
      const id = resolveId(assetId);
      const a = assets.find((x) => x.id === id);
      return !!a && a.future.length > 0;
    },
    [assets, resolveId],
  );

  const resetAsset = useCallback(
    (assetId?: string) => {
      const id = resolveId(assetId);
      if (!id) return;
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const previewUrl = swapUrl(a.previewUrl, a.originalBlob);
          return {
            ...a,
            currentBlob: a.originalBlob,
            previewUrl,
            meta: { ...a.meta, size: a.originalBlob.size },
            history: [],
            future: [],
          };
        }),
      );
    },
    [resolveId, swapUrl],
  );

  // ── Download ──────────────────────────────────────────────────────────
  const downloadOne = useCallback(
    (assetId: string) => {
      const a = assets.find((x) => x.id === assetId);
      if (!a) return;
      const url = URL.createObjectURL(a.currentBlob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = a.name;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => revoke(url), 1000);
    },
    [assets],
  );

  const downloadAll = useCallback(async () => {
    if (assets.length === 0) return;
    if (assets.length === 1) {
      downloadOne(assets[0]!.id);
      return;
    }
    const outputs: WorkspaceOutput[] = assets.map((a) => ({ name: a.name, blob: a.currentBlob }));
    const { zip } = await import("fflate");
    const used = new Set<string>();
    const entries: Record<string, [Uint8Array, { level: 0 | 6 }]> = {};
    for (const out of outputs) {
      let name = out.name || "file";
      // De-conflict duplicate names with a numeric suffix.
      if (used.has(name)) {
        const dot = name.lastIndexOf(".");
        const base = dot > 0 ? name.slice(0, dot) : name;
        const ext = dot > 0 ? name.slice(dot) : "";
        let i = 2;
        while (used.has(`${base}-${i}${ext}`)) i += 1;
        name = `${base}-${i}${ext}`;
      }
      used.add(name);
      const bytes = new Uint8Array(await out.blob.arrayBuffer());
      // PDFs/images are already compressed, store them (level 0).
      const level: 0 | 6 = /\.(pdf|jpe?g|png|webp|gif|zip)$/i.test(name) ? 0 : 6;
      entries[name] = [bytes, { level }];
    }
    const zipped = await new Promise<Uint8Array>((resolve, reject) => {
      zip(entries, (err, data) => (err ? reject(err) : resolve(data)));
    });
    const copy = new Uint8Array(zipped.byteLength);
    copy.set(zipped);
    const blob = new Blob([copy], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${category.id}-workspace.zip`;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => revoke(url), 1000);
  }, [assets, category.id, downloadOne]);

  return {
    category,
    assets,
    selectedIds,
    activeAsset,
    steps,
    busy,
    progress,
    error,
    addFiles,
    removeAsset,
    clearAssets,
    selectAsset,
    toggleAsset,
    selectAll,
    addStep,
    removeStep,
    updateStepParams,
    moveStep,
    clearSteps,
    applyStep,
    runPipeline,
    undo,
    redo,
    canUndo,
    canRedo,
    resetAsset,
    downloadOne,
    downloadAll,
  };
}
