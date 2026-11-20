"use client";

import * as React from "react";

import type { AccentKey } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { fileMatchesAccept } from "@/lib/file-accept";
import { recentFilesFor, recentFilesVersion, subscribeRecentFiles } from "@/lib/recent-files";
import { getSampleFile, sampleKindFor, SAMPLE_LABEL } from "@/lib/samples";

export interface DropUploaderProps {
  /** Called with the dropped/browsed files. */
  onFiles: (files: File[]) => void;
  /** Accept string forwarded to the hidden <input>, e.g. "image/*". */
  accept?: string;
  /** Helper text under the prompt (e.g. "PNG, JPG, WebP or GIF"). */
  hint?: string;
  /** Per-tool accent used for the drag-over highlight. */
  accent?: AccentKey;
  /** Allow selecting more than one file. */
  multiple?: boolean;
  /** Lucide icon shown in the prompt. Defaults to "ImageUp". */
  icon?: string;
  /**
   * Show the "or paste with Ctrl/Cmd+V" affordance. Image tools handle paste
   * themselves (in `useImageTool`, including raw clipboard bitmaps); other
   * tools enable `pasteFiles` so the uploader handles it. Default true.
   */
  showPaste?: boolean;
  /**
   * Let the uploader itself handle window-level paste of FILES from the
   * clipboard (e.g. a PDF copied in the OS file manager). Off by default -
   * image tools already run their own paste handler in `useImageTool`, and
   * enabling both would ingest the file twice.
   */
  pasteFiles?: boolean;
  /** Accessible label for the drop zone. */
  label?: string;
  /** Per-file size ceiling in megabytes. Default 100. */
  maxSizeMb?: number;
  className?: string;
}

/**
 * The zero-state uploader for the tool workspace: drag & drop, click-to-browse
 * and keyboard activation, plus a "paste" affordance (the paste handler itself
 * lives in `useImageTool`). Purely presentational. It hands files up via
 * `onFiles` and never uploads or processes anything.
 */
export function DropUploader({
  onFiles,
  accept = "image/*",
  hint,
  accent,
  multiple = false,
  icon = "ImageUp",
  showPaste = true,
  pasteFiles = false,
  label,
  maxSizeMb = 100,
  className,
}: DropUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dragDepth = React.useRef(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [sizeError, setSizeError] = React.useState<string | null>(null);
  const [sampleBusy, setSampleBusy] = React.useState(false);
  const style = accentStyle(accent);
  const sampleKind = sampleKindFor(accept);

  // Session-only hand-off from the previous tool run (lib/recent-files):
  // offers a one-click "Reuse" of the file the user just worked with.
  React.useSyncExternalStore(subscribeRecentFiles, recentFilesVersion, recentFilesVersion);
  const previousFiles = recentFilesFor(accept);

  const openPicker = React.useCallback(() => inputRef.current?.click(), []);

  const emit = React.useCallback(
    (list: FileList | File[] | null) => {
      if (!list || list.length === 0) return;
      const maxBytes = maxSizeMb * 1024 * 1024;
      const files = Array.from(list);
      const accepted = files.filter((f) => f.size <= maxBytes);
      if (accepted.length === files.length) {
        setSizeError(null);
      } else if (accepted.length === 0) {
        setSizeError(
          `That file is larger than the ${maxSizeMb} MB limit. Please choose a smaller file.`,
        );
      } else {
        setSizeError(
          `Some files were over the ${maxSizeMb} MB limit and were skipped.`,
        );
      }
      if (accepted.length) onFiles(accepted);
    },
    [maxSizeMb, onFiles],
  );

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    emit(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  // Uploader-managed paste (non-image tools): accept FILES from the clipboard,
  // e.g. a PDF copied in the OS file manager. Only files matching `accept` are
  // taken, so ordinary text pastes into inputs are never hijacked.
  React.useEffect(() => {
    if (!pasteFiles || typeof window === "undefined") return;
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
        fileMatchesAccept(f, accept),
      );
      if (files.length === 0) return;
      event.preventDefault();
      emit(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pasteFiles, accept, emit]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={
        label ??
        (showPaste
          ? "Upload a file, drag and drop, click to browse, or paste from your clipboard"
          : "Upload a file, drag and drop, or click to browse")
      }
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center outline-none transition-colors",
        "cursor-pointer hover:bg-muted/40",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        style.ring,
        isDragging
          ? cn("bg-muted/50", style.border)
          : "border-border bg-card hover:border-muted-foreground/40",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors",
          "group-hover:bg-muted/70",
          isDragging && style.soft,
        )}
      >
        <Icon name={icon} size={28} />
      </span>

      <div className="space-y-1.5">
        <p className="text-base font-medium text-foreground">
          <span className={style.text}>Click to upload</span> or drag and drop
        </p>
        <p className="text-sm text-muted-foreground">
          {hint ?? "PNG, JPG, WebP, GIF or BMP"}
        </p>
      </div>

      {showPaste || pasteFiles ? (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon name="Clipboard" size={13} />
          or paste {pasteFiles ? "a copied file" : "an image"} with
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground">
            Ctrl / Cmd + V
          </kbd>
        </p>
      ) : null}

      {/* One-click hand-off from the previous tool run this session - this is
          how the "Continue your workflow" chips carry the file forward. */}
      {previousFiles.length > 0 ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation(); // don't open the file picker
            onFiles(previousFiles);
          }}
          className={cn(
            "inline-flex max-w-full items-center gap-1.5 min-h-11 rounded-full border px-4 text-xs font-medium outline-none transition-colors",
            "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <Icon name="History" size={13} className="shrink-0 text-primary" />
          <span className="truncate">
            Reuse{" "}
            {previousFiles.length === 1
              ? previousFiles[0]!.name
              : `previous files (${previousFiles.length})`}
          </span>
        </button>
      ) : null}

      {sizeError && (
        <p
          role="alert"
          className="inline-flex items-center gap-1.5 text-xs text-destructive"
        >
          <Icon name="CircleAlert" size={13} />
          {sizeError}
        </p>
      )}

      {/* "Try a sample" - kind inferred from `accept`; generated on-device at
          click time (lib/samples). Absent on tools it doesn't fit. */}
      {sampleKind ? (
        <button
          type="button"
          disabled={sampleBusy}
          onClick={(event) => {
            event.stopPropagation(); // don't open the file picker
            setSampleBusy(true);
            void getSampleFile(sampleKind)
              .then((file) => onFiles([file]))
              .catch(() => {})
              .finally(() => setSampleBusy(false));
          }}
          className={cn(
            "inline-flex items-center gap-1.5 min-h-11 rounded-full border border-border bg-background px-4 text-xs font-medium text-muted-foreground outline-none transition-colors",
            "hover:border-transparent hover:bg-muted hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:opacity-60",
          )}
        >
          <Icon name={sampleBusy ? "LoaderCircle" : "FlaskConical"} size={13} className={sampleBusy ? "animate-spin" : undefined} />
          {SAMPLE_LABEL[sampleKind]}
        </button>
      ) : null}

      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon name="ShieldCheck" size={13} className={style.text} />
        Files never leave your device; everything runs in your browser.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          emit(event.target.files);
          // Reset so re-selecting the same file re-fires onChange.
          event.target.value = "";
        }}
      />
    </div>
  );
}
