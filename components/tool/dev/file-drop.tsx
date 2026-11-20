"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { recentFilesFor, recentFilesVersion, rememberFiles, subscribeRecentFiles } from "@/lib/recent-files";
import { getSampleFile, sampleKindFor, SAMPLE_LABEL } from "@/lib/samples";

/** Options for {@link useFileDrop}. */
export interface UseFileDropOptions {
  /** Called with dropped/selected/pasted files. */
  onFiles: (files: File[]) => void;
  /** Also listen for window-level paste (files or images). Default true. */
  paste?: boolean;
  /** Disable all handling. */
  disabled?: boolean;
}

/** Return shape of {@link useFileDrop}. */
export interface FileDropState {
  /** True while a drag is hovering the tracked element. */
  isDragging: boolean;
  /** Spread onto the drop target to wire drag events. */
  dropProps: {
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

function extractFiles(list: FileList | null | undefined): File[] {
  if (!list) return [];
  return Array.from(list);
}

/**
 * Drag-and-drop + paste-to-import for files/images. Returns `isDragging` and a
 * `dropProps` object to spread onto any element. When `paste` is enabled,
 * pasting a file or image anywhere on the page (outside a text field) imports it.
 */
export function useFileDrop({
  onFiles,
  paste = true,
  disabled = false,
}: UseFileDropOptions): FileDropState {
  const [isDragging, setIsDragging] = React.useState(false);
  const depth = React.useRef(0);
  const onFilesRef = React.useRef(onFiles);
  onFilesRef.current = onFiles;

  const dropProps = React.useMemo(
    () => ({
      onDragOver: (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
      },
      onDragEnter: (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        depth.current += 1;
        setIsDragging(true);
      },
      onDragLeave: (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setIsDragging(false);
      },
      onDrop: (e: React.DragEvent) => {
        if (disabled) return;
        e.preventDefault();
        depth.current = 0;
        setIsDragging(false);
        const files = extractFiles(e.dataTransfer.files);
        if (files.length) onFilesRef.current(files);
      },
    }),
    [disabled],
  );

  React.useEffect(() => {
    if (!paste || disabled) return;
    const handler = (e: ClipboardEvent) => {
      const target = e.target;
      // Don't hijack paste inside editable fields.
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        // Still allow image paste from clipboard items even in editors.
        const imgs = Array.from(e.clipboardData?.items ?? []).filter((it) =>
          it.type.startsWith("image/"),
        );
        if (imgs.length === 0) return;
      }
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        onFilesRef.current(files);
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [paste, disabled]);

  return { isDragging, dropProps };
}

/** Props for {@link FileDropZone}. */
export interface FileDropZoneProps {
  onFiles: (files: File[]) => void;
  /** `accept` attribute for the file picker, e.g. ".json,application/json". */
  accept?: string;
  /** Allow selecting multiple files. Default false. */
  multiple?: boolean;
  /** Enable paste-to-import. Default true. */
  paste?: boolean;
  disabled?: boolean;
  /** Main prompt text. */
  label?: React.ReactNode;
  /** Secondary hint text. */
  hint?: React.ReactNode;
  /** Lucide icon name. Default "Upload". */
  icon?: string;
  /** Per-file size ceiling in megabytes. Default 100. */
  maxSizeMb?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A click/drag/paste drop zone with a drag overlay. Clicking (or pressing
 * Enter/Space) opens the native file picker. Renders `children` if provided,
 * otherwise a default icon + prompt.
 */
export function FileDropZone({
  onFiles,
  accept,
  multiple = false,
  paste = true,
  disabled = false,
  label = "Drop a file, click to browse, or paste",
  hint,
  icon = "Upload",
  maxSizeMb = 100,
  className,
  children,
}: FileDropZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = React.useState<string | null>(null);
  const [sampleBusy, setSampleBusy] = React.useState(false);

  // Session-only hand-off from the previous tool run (lib/recent-files).
  React.useSyncExternalStore(subscribeRecentFiles, recentFilesVersion, recentFilesVersion);
  const previousFiles = recentFilesFor(accept);

  // "Try a sample": kind inferred from `accept`, generated on-device at click
  // time (lib/samples). Null for kinds without a sensible sample (video/audio),
  // so the empty state is never promising something it can't deliver.
  const sampleKind = sampleKindFor(accept);

  // Enforce the per-file size cap before handing files up.
  const handleFiles = React.useCallback(
    (files: File[]) => {
      const maxBytes = maxSizeMb * 1024 * 1024;
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
      if (accepted.length) {
        rememberFiles(accepted); // session-only hand-off to the next tool
        onFiles(accepted);
      }
    },
    [maxSizeMb, onFiles],
  );

  const { isDragging, dropProps } = useFileDrop({
    onFiles: handleFiles,
    paste,
    disabled,
  });

  const open = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-label={typeof label === "string" ? label : "Upload a file"}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      {...dropProps}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center outline-none transition-colors",
        "hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDragging && "border-primary bg-primary/10",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const files = extractFiles(e.target.files);
          if (files.length) handleFiles(files);
          e.target.value = "";
        }}
      />
      {children ?? (
        <>
          <Icon
            name={icon}
            size={24}
            className={cn("text-muted-foreground", isDragging && "text-primary")}
          />
          <p className="text-sm font-medium text-foreground">{label}</p>
          {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
        </>
      )}
      {sampleKind && !disabled ? (
        <button
          type="button"
          disabled={sampleBusy}
          onClick={(event) => {
            event.stopPropagation(); // don't open the file picker
            setSampleBusy(true);
            void getSampleFile(sampleKind)
              .then((file) => handleFiles([file]))
              .catch(() => {})
              .finally(() => setSampleBusy(false));
          }}
          className={cn(
            "mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors",
            "hover:border-transparent hover:bg-muted hover:text-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:opacity-60",
          )}
        >
          <Icon
            name={sampleBusy ? "LoaderCircle" : "FlaskConical"}
            size={13}
            className={sampleBusy ? "animate-spin" : undefined}
          />
          {SAMPLE_LABEL[sampleKind]}
        </button>
      ) : null}
      {/* One-click hand-off from the previous tool run this session (never
          persisted) - how the "Continue your workflow" chips carry files. */}
      {previousFiles.length > 0 && !disabled ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation(); // don't open the file picker
            handleFiles(previousFiles);
          }}
          className={cn(
            "mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium outline-none transition-colors",
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
          className="flex items-center gap-1.5 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={13} />
          {sizeError}
        </p>
      )}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-lg bg-primary/5">
          <span className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow">
            <Icon name="Download" size={15} />
            Drop to import
          </span>
        </div>
      )}
    </div>
  );
}
