/**
 * GigAI Workspace: click-to-pick file tile.
 *
 * Category-agnostic: the caller passes `accept` and a callback. Used both as the
 * big empty-state target and as the compact "add files" tile in the sidebar.
 *
 * NOTE: file DROPPING is handled globally by `useFileDrop` at the WINDOW level
 * (so the whole page is a drop target and a stray drop never navigates the tab
 * away). This tile therefore only handles CLICK-to-browse. It must NOT add its
 * own `onDrop`, or a drop landing on the tile would be added twice.
 */

"use client";

import { useRef } from "react";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface FileDropzoneProps {
  /** Input `accept`, e.g. "image/*". */
  accept: string;
  /** Called with the dropped/picked files. */
  onFiles: (files: FileList | File[]) => void;
  /** Compact variant for the sidebar tile. */
  compact?: boolean;
  /** Lucide icon name for the affordance. */
  icon?: string;
  /** Primary label. */
  label?: string;
  /** Secondary hint. */
  hint?: string;
  className?: string;
}

export function FileDropzone({
  accept,
  onFiles,
  compact = false,
  icon = "Upload",
  label = "Drop files or click to browse",
  hint,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-center transition-colors",
          "hover:border-primary/50 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact ? "px-3 py-4" : "px-6 py-12",
          className,
        )}
        aria-label={label}
      >
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105",
            compact ? "size-8" : "size-12",
          )}
        >
          <Icon name={icon} size={compact ? 16 : 24} />
        </span>
        <span className={cn("font-medium text-foreground", compact ? "text-xs" : "text-sm")}>
          {label}
        </span>
        {hint && !compact && <span className="text-xs text-muted-foreground">{hint}</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}
