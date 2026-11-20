/**
 * GigAI Workspace: the PDF WORKSPACE (client island).
 *
 * A document-level editor: the user drops one or more PDFs, they combine into a
 * single WORKING DOCUMENT, and then they chain page-level tools on it without
 * leaving the page (Figma/Canva feel for PDFs):
 *
 *  • Merge, combining several uploaded PDFs into the working document.
 *  • Reorder, drag pages (or Alt+Arrow) via the shared page grid.
 *  • Rotate, per-page or whole-document rotation from the page grid.
 *  • Delete: select pages and drop them.
 *  • Compress, honest raster recompression (image-heavy/scanned PDFs).
 *  • Download; save the resulting PDF.
 *
 * Unlike the per-file image workspace, PDF work is document-level, so this
 * screen intentionally does NOT mount the generic <WorkspaceShell> (which is
 * built around a single-image <img> preview + per-file pipeline). Instead it
 * adapts the same ideas, a left "sources" rail, a center page canvas, a right
 * tool rail, a bottom action bar, undo/redo: around ONE working document.
 *
 * REUSE, DON'T REIMPLEMENT. Every real operation calls the existing client-side
 * engines, dynamic-imported INSIDE the handler so the initial bundle stays
 * small: mergePdfs / reorderPages / deletePages / rotatePages (lib/pdf/ops),
 * compressPdf (lib/pdf/convert), getPageCount (lib/pdf/core). The visual page
 * management reuses <PdfPageGrid> (components/tool/pdf) which itself renders
 * live thumbnails via renderThumbnails. The source list reuses <PdfFileList>.
 *
 * HONEST LIMITS (surfaced in the UI, never faked):
 *  • Everything runs in your browser, files never leave the device.
 *   • Compression rasterises pages to JPEG, so text stops being selectable;
 *     it mainly shrinks scanned / image-heavy PDFs and can no-op on pure text.
 *   • Very large PDFs are memory- and CPU-bound in the tab and can be slow.
 *   • Reorder/rotate/delete keep a full history in memory (undo/redo); a page
 *     reload starts fresh (blobs are not persisted).
 */

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { formatBytes, getPageCount } from "@/lib/pdf/core";
import { useFileDrop } from "@/lib/workspace/use-file-drop";
import { Button } from "@/components/ui/button";
import { DropOverlay } from "@/components/workspace/drop-overlay";
import { PdfPageGrid } from "@/components/tool/pdf/pdf-page-grid";
import { PdfFileList } from "@/components/tool/pdf/pdf-file-list";
import type { PdfInput as ListPdfInput } from "@/components/tool/pdf/use-pdf-tool";

/* ── Types ──────────────────────────────────────────────────────────────── */

/** A queued source PDF, before it is combined into the working document. */
interface SourcePdf {
  id: string;
  file: File;
  name: string;
  size: number;
}

/** A snapshot of the working document: a File + its page count. */
interface DocSnapshot {
  /** The current working PDF as a File (PdfPageGrid + engines consume a File). */
  file: File;
  /** Byte size of `file`. */
  size: number;
  /** Page count (probed once per snapshot). */
  pages: number;
  /** A short human label describing how this snapshot was produced. */
  label: string;
}

/** Which page-management mode the center grid is in. */
type GridMode = "view" | "reorder" | "rotate" | "delete";

/* ── Helpers ────────────────────────────────────────────────────────────── */

function makeId(): string {
  return `src_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Turn a Blob into a named File (engines return Blobs; the grid wants Files). */
function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: "application/pdf" });
}

/** Accept only PDFs (by MIME or extension, since some browsers omit the MIME). */
function isPdf(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

/** Trigger a browser download for a blob without leaking the object URL. */
function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function PdfWorkspace() {
  // Queued source PDFs (pre-merge).
  const [sources, setSources] = React.useState<SourcePdf[]>([]);
  // The working document + its undo/redo history (in-memory only).
  const [doc, setDoc] = React.useState<DocSnapshot | null>(null);
  const [history, setHistory] = React.useState<DocSnapshot[]>([]);
  const [future, setFuture] = React.useState<DocSnapshot[]>([]);

  const [mode, setMode] = React.useState<GridMode>("view");
  // Transient per-mode selections (reset when a mode's edit is applied).
  const [selectedPages, setSelectedPages] = React.useState<number[]>([]);
  const [order, setOrder] = React.useState<number[]>([]);
  const [rotations, setRotations] = React.useState<Record<number, number>>({});

  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const naturalOrder = React.useMemo(
    () => (doc ? Array.from({ length: doc.pages }, (_, i) => i + 1) : []),
    [doc],
  );

  // Reset transient page state whenever the working document or mode changes.
  React.useEffect(() => {
    setSelectedPages([]);
    setRotations({});
    setOrder(naturalOrder);
  }, [doc, mode, naturalOrder]);

  /** Commit a new working-document snapshot, pushing the old one onto history. */
  const commit = React.useCallback((next: DocSnapshot) => {
    setDoc((prev) => {
      if (prev) setHistory((h) => [...h, prev]);
      return next;
    });
    setFuture([]);
    setMode("view");
  }, []);

  /** Probe a blob's page count and wrap it as a snapshot. */
  const snapshotOf = React.useCallback(
    async (blob: Blob, name: string, label: string): Promise<DocSnapshot> => {
      const file = blobToFile(blob, name);
      const pages = await getPageCount(file);
      return { file, size: file.size, pages, label };
    },
    [],
  );

  /* ── Source queue ─────────────────────────────────────────────────────── */

  const addFiles = React.useCallback((incoming: FileList | File[]) => {
    setError(null);
    const pdfs = Array.from(incoming).filter(isPdf);
    if (pdfs.length === 0) {
      setError("Add PDF files, other formats aren't supported here.");
      return;
    }
    setSources((prev) => [
      ...prev,
      ...pdfs.map((file) => ({ id: makeId(), file, name: file.name, size: file.size })),
    ]);
  }, []);

  const removeSource = React.useCallback((id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const reorderSources = React.useCallback((from: number, to: number) => {
    setSources((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      if (!moved) return prev;
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  /** Combine every queued source (in order) into the working document. */
  const buildDocument = React.useCallback(async () => {
    if (sources.length === 0 || busy) return;
    setBusy(true);
    setError(null);
    setStatus(sources.length === 1 ? "Loading document…" : "Merging documents…");
    try {
      const { mergePdfs } = await import("@/lib/pdf/ops");
      const merged = await mergePdfs(
        sources.map((s) => ({ file: s.file, name: s.name })),
      );
      const name = sources.length === 1 ? merged.name : "workspace.pdf";
      const snap = await snapshotOf(
        merged.blob,
        name,
        sources.length === 1 ? "Loaded" : `Merged ${sources.length} files`,
      );
      // Starting a fresh document clears any prior history.
      setHistory([]);
      setFuture([]);
      setDoc(snap);
      setMode("view");
      setSources([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't build the document.");
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }, [sources, busy, snapshotOf]);

  /* ── Page operations (each reuses an existing engine) ─────────────────── */

  const applyReorder = React.useCallback(async () => {
    if (!doc || busy) return;
    // No-op if the order is unchanged.
    if (order.length === naturalOrder.length && order.every((p, i) => p === naturalOrder[i])) {
      setMode("view");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus("Reordering pages…");
    try {
      const { reorderPages } = await import("@/lib/pdf/ops");
      const out = await reorderPages({ file: doc.file, name: doc.file.name }, order);
      commit(await snapshotOf(out.blob, doc.file.name, "Reordered pages"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reorder failed.");
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }, [doc, busy, order, naturalOrder, commit, snapshotOf]);

  const applyDelete = React.useCallback(async () => {
    if (!doc || busy) return;
    if (selectedPages.length === 0) {
      setError("Select at least one page to delete.");
      return;
    }
    if (selectedPages.length >= doc.pages) {
      setError("You can't delete every page: at least one must remain.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus("Deleting pages…");
    try {
      const { deletePages } = await import("@/lib/pdf/ops");
      const out = await deletePages({ file: doc.file, name: doc.file.name }, selectedPages);
      commit(
        await snapshotOf(
          out.blob,
          doc.file.name,
          `Deleted ${selectedPages.length} page${selectedPages.length === 1 ? "" : "s"}`,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }, [doc, busy, selectedPages, commit, snapshotOf]);

  const applyRotate = React.useCallback(async () => {
    if (!doc || busy) return;
    const specs = Object.entries(rotations)
      .map(([page, deg]) => ({ page: Number(page), degrees: deg }))
      .filter((s) => s.degrees % 360 !== 0);
    if (specs.length === 0) {
      setMode("view");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus("Rotating pages…");
    try {
      const { rotatePages } = await import("@/lib/pdf/ops");
      const out = await rotatePages({ file: doc.file, name: doc.file.name }, specs);
      commit(
        await snapshotOf(
          out.blob,
          doc.file.name,
          `Rotated ${specs.length} page${specs.length === 1 ? "" : "s"}`,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rotate failed.");
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }, [doc, busy, rotations, commit, snapshotOf]);

  /** Rotate the WHOLE document by a quarter turn (a quick, common action). */
  const rotateAll = React.useCallback(
    async (deg: 90 | -90 | 180) => {
      if (!doc || busy) return;
      setBusy(true);
      setError(null);
      setStatus("Rotating document…");
      try {
        const { rotatePages } = await import("@/lib/pdf/ops");
        const out = await rotatePages({ file: doc.file, name: doc.file.name }, deg);
        commit(await snapshotOf(out.blob, doc.file.name, `Rotated document ${deg}°`));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Rotate failed.");
      } finally {
        setBusy(false);
        setStatus(null);
      }
    },
    [doc, busy, commit, snapshotOf],
  );

  const applyCompress = React.useCallback(
    async (level: "low" | "medium" | "high") => {
      if (!doc || busy) return;
      setBusy(true);
      setError(null);
      setStatus("Compressing… (rasterising pages)");
      try {
        const { compressPdf } = await import("@/lib/pdf/convert");
        const out = await compressPdf(
          { file: doc.file, name: doc.file.name },
          {
            level,
            onProgress: (f, s) => setStatus(s ?? `Compressing… ${Math.round(f * 100)}%`),
          },
        );
        const saved = doc.size - out.size;
        const label =
          saved > 0
            ? `Compressed (−${formatBytes(saved)})`
            : "Compressed (already minimal)";
        commit(await snapshotOf(out.blob, doc.file.name, label));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Compression failed.");
      } finally {
        setBusy(false);
        setStatus(null);
      }
    },
    [doc, busy, commit, snapshotOf],
  );

  /* ── History ──────────────────────────────────────────────────────────── */

  const undo = React.useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1]!;
      setDoc((cur) => {
        if (cur) setFuture((f) => [cur, ...f]);
        return prev;
      });
      setMode("view");
      return h.slice(0, -1);
    });
  }, []);

  const redo = React.useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0]!;
      setDoc((cur) => {
        if (cur) setHistory((h) => [...h, cur]);
        return next;
      });
      setMode("view");
      return f.slice(1);
    });
  }, []);

  const startOver = React.useCallback(() => {
    setDoc(null);
    setHistory([]);
    setFuture([]);
    setSources([]);
    setMode("view");
    setError(null);
  }, []);

  // Keyboard: ⌘/Ctrl+Z undo, ⇧⌘/Ctrl+Z redo (ignored while typing in a field).
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const listFiles: ListPdfInput[] = sources.map((s) => ({
    id: s.id,
    file: s.file,
    name: s.name,
    size: s.size,
  }));

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  // Whole-page drag-and-drop: dropping PDFs ANYWHERE over the workspace adds
  // them, merging into the working document if one already exists, otherwise
  // queueing them, and the browser never navigates away on a stray drop.
  const { isDragging } = useFileDrop((files) => {
    if (doc) void mergeIntoDocument(files);
    else addFiles(files);
  });

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className="relative flex h-[min(82vh,940px)] min-h-[600px] w-full flex-col overflow-hidden max-md:h-auto max-md:min-h-0 max-md:overflow-visible rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <DropOverlay show={isDragging} label="Drop PDFs to add" />
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon name="FileStack" size={16} />
          </span>
          <h2 className="truncate text-sm font-semibold">PDF Workspace</h2>
          {doc ? (
            <span className="hidden truncate text-xs text-muted-foreground sm:inline">
              · {doc.pages} page{doc.pages === 1 ? "" : "s"} · {formatBytes(doc.size)}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={!canUndo || busy}
            onClick={undo}
            aria-label="Undo"
            title="Undo (⌘Z)"
          >
            <Icon name="Undo2" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canRedo || busy}
            onClick={redo}
            aria-label="Redo"
            title="Redo (⇧⌘Z)"
          >
            <Icon name="Redo2" size={16} />
          </Button>
          {doc ? (
            <>
              <div className="mx-1 h-5 w-px bg-border" />
              <Button
                variant="ghost"
                size="icon"
                disabled={busy}
                onClick={startOver}
                aria-label="Start over"
                title="Start over"
              >
                <Icon name="RotateCcw" size={16} />
              </Button>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => download(doc.file, "workspace.pdf")}
              >
                <Icon name="Download" size={15} />
                Download
              </Button>
            </>
          ) : null}
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────── */}
      {!doc ? (
        <BuildStage
          files={listFiles}
          dragOver={isDragging}
          busy={busy}
          error={error}
          status={status}
          inputRef={fileInputRef}
          onPick={() => fileInputRef.current?.click()}
          onFiles={addFiles}
          onRemove={removeSource}
          onReorder={reorderSources}
          onBuild={buildDocument}
        />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_minmax(240px,300px)] max-md:grid-cols-1">
          {/* CENTER: page canvas */}
          <main className="flex min-h-0 flex-col overflow-hidden bg-muted/20">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="Info" size={13} />
                <span className="truncate">{doc.label}</span>
              </div>
              {mode !== "view" ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => setMode("view")}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={
                      mode === "reorder"
                        ? applyReorder
                        : mode === "delete"
                          ? applyDelete
                          : applyRotate
                    }
                  >
                    <Icon name="Check" size={15} />
                    {mode === "reorder"
                      ? "Apply order"
                      : mode === "delete"
                        ? `Delete ${selectedPages.length || ""}`.trim()
                        : "Apply rotation"}
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              <PdfPageGrid
                key={`${doc.file.name}:${doc.size}:${mode}`}
                file={doc.file}
                {...(mode === "delete"
                  ? { selected: selectedPages, onSelectChange: setSelectedPages }
                  : {})}
                {...(mode === "rotate"
                  ? { rotations, onRotateChange: setRotations }
                  : {})}
                {...(mode === "reorder"
                  ? { order, onReorder: setOrder }
                  : {})}
              />
            </div>
          </main>

          {/* RIGHT: tool rail */}
          <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-l border-border p-3 max-md:border-l-0 max-md:border-t">
            <ToolRail
              mode={mode}
              busy={busy}
              onMode={setMode}
              onRotateAll={rotateAll}
              onCompress={applyCompress}
              onAddMore={() => fileInputRef.current?.click()}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) {
                  // Adding more to an existing doc merges them straight in.
                  void mergeIntoDocument(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            <section className="mt-auto flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Good to know
              </h3>
              <p className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
                Everything runs in your browser, files never leave your device.
                Undo/redo lives in memory, so a page reload starts fresh.
                Compression rasterises pages (text stops being selectable) and
                mainly shrinks scanned or image-heavy PDFs.
              </p>
            </section>
          </aside>
        </div>
      )}

      {/* ── Bottom status bar ────────────────────────────────────── */}
      <footer className="flex items-center gap-3 border-t border-border px-4 py-2 text-xs">
        {busy ? (
          <span aria-live="polite" className="flex items-center gap-2 text-foreground">
            <Icon name="LoaderCircle" size={14} className="animate-spin" />
            {status ?? "Working…"}
          </span>
        ) : error ? (
          <span role="alert" className="flex items-center gap-2 text-destructive">
            <Icon name="TriangleAlert" size={14} />
            {error}
          </span>
        ) : doc ? (
          <span className="text-muted-foreground">
            Working document · {doc.pages} page{doc.pages === 1 ? "" : "s"} ·{" "}
            {formatBytes(doc.size)}
          </span>
        ) : (
          <span className="text-muted-foreground">
            Add PDFs to start a workspace: nothing is uploaded.
          </span>
        )}
      </footer>
    </div>
  );

  /* Merge additional files into an already-built document (used by "Add more"
   * and by a whole-page drop while a working document exists). */
  async function mergeIntoDocument(incoming: FileList | File[]) {
    if (!doc || busy) return;
    const pdfs = Array.from(incoming).filter(isPdf);
    if (pdfs.length === 0) {
      setError("Add PDF files, other formats aren't supported here.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus("Adding pages…");
    try {
      const { mergePdfs } = await import("@/lib/pdf/ops");
      const out = await mergePdfs([
        { file: doc.file, name: doc.file.name },
        ...pdfs.map((f) => ({ file: f, name: f.name })),
      ]);
      commit(
        await snapshotOf(
          out.blob,
          doc.file.name,
          `Added ${pdfs.length} file${pdfs.length === 1 ? "" : "s"}`,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add those PDFs.");
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }
}

/* ── Build stage (before a working document exists) ─────────────────────── */

function BuildStage({
  files,
  dragOver,
  busy,
  error,
  status,
  inputRef,
  onPick,
  onFiles,
  onRemove,
  onReorder,
  onBuild,
}: {
  files: ListPdfInput[];
  dragOver: boolean;
  busy: boolean;
  error: string | null;
  status: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: () => void;
  onFiles: (files: FileList | File[]) => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onBuild: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto p-8">
      <div className="w-full max-w-xl space-y-5">
        <div className="space-y-1.5 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon name="FileStack" size={28} />
          </div>
          <h3 className="text-lg font-semibold">Start a PDF workflow</h3>
          <p className="text-sm text-muted-foreground">
            Drop one or more PDFs. They combine into a single working document you
            can reorder, rotate, delete pages from, and compress, all here, all
            in your browser.
          </p>
        </div>

        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
          )}
        >
          <Icon name="Upload" size={22} className="text-muted-foreground" />
          <span className="text-sm font-medium">
            Drop PDFs here or click to browse
          </span>
          <span className="text-xs text-muted-foreground">
            Nothing is uploaded, processing happens on your device.
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) onFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={(e) => {
              e.preventDefault();
              onPick();
            }}
          >
            <Icon name="FilePlus" size={15} />
            Choose files
          </Button>
        </label>

        {files.length > 0 ? (
          <PdfFileList
            files={files}
            onRemove={onRemove}
            onReorder={onReorder}
            label="Documents to combine"
          />
        ) : null}

        {error ? (
          <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <Icon name="TriangleAlert" size={15} />
            {error}
          </p>
        ) : null}

        {files.length > 0 ? (
          <Button className="w-full" disabled={busy} onClick={onBuild}>
            {busy ? (
              <>
                <Icon name="LoaderCircle" size={15} className="animate-spin" />
                {status ?? "Working…"}
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={15} />
                {files.length === 1
                  ? "Open in workspace"
                  : `Combine ${files.length} PDFs & open`}
              </>
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/* ── Tool rail (right column, when a document is open) ──────────────────── */

function ToolRail({
  mode,
  busy,
  onMode,
  onRotateAll,
  onCompress,
  onAddMore,
}: {
  mode: GridMode;
  busy: boolean;
  onMode: (m: GridMode) => void;
  onRotateAll: (deg: 90 | -90 | 180) => void;
  onCompress: (level: "low" | "medium" | "high") => void;
  onAddMore: () => void;
}) {
  return (
    <>
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pages
        </h3>
        <ToolButton
          icon="ArrowUpDown"
          label="Reorder pages"
          hint="Drag pages into a new order"
          active={mode === "reorder"}
          disabled={busy}
          onClick={() => onMode(mode === "reorder" ? "view" : "reorder")}
        />
        <ToolButton
          icon="RotateCw"
          label="Rotate pages"
          hint="Turn individual pages"
          active={mode === "rotate"}
          disabled={busy}
          onClick={() => onMode(mode === "rotate" ? "view" : "rotate")}
        />
        <ToolButton
          icon="Trash2"
          label="Delete pages"
          hint="Select pages to remove"
          active={mode === "delete"}
          disabled={busy}
          onClick={() => onMode(mode === "delete" ? "view" : "delete")}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Whole document
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => onRotateAll(-90)}
            title="Rotate all pages left"
          >
            <Icon name="RotateCcw" size={15} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => onRotateAll(180)}
            title="Rotate all pages 180°"
          >
            <Icon name="FlipVertical2" size={15} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => onRotateAll(90)}
            title="Rotate all pages right"
          >
            <Icon name="RotateCw" size={15} />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="justify-start" disabled={busy} onClick={onAddMore}>
          <Icon name="FilePlus" size={15} />
          Add more PDFs
        </Button>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Compress
        </h3>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Rasterises pages to shrink scanned / image-heavy PDFs. Text stops being
          selectable.
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <Button variant="outline" size="sm" disabled={busy} onClick={() => onCompress("low")} title="Best quality, smallest saving">
            Light
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => onCompress("medium")}>
            Balanced
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => onCompress("high")} title="Smallest file, lowest quality">
            Strong
          </Button>
        </div>
      </section>
    </>
  );
}

/** A large, selectable tool button for the right rail. */
function ToolButton({
  icon,
  label,
  hint,
  active,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  hint: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md",
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon name={icon} size={16} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="truncate text-[11px] text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}
