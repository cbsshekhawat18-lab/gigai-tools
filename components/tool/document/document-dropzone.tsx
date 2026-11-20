"use client";

/**
 * <DocumentDropzone>, drag / drop / click / paste a document, with automatic
 * type detection and friendly states.
 *
 * Thin, opinionated wrapper over the shared {@link FileDropZone} that adds
 * document-family awareness: it derives the `accept` string from a list of
 * allowed {@link DocumentKind}s, classifies each dropped file, and rejects
 * anything outside the allow-list with a clear inline message rather than
 * silently passing it through. On success it renders a compact "file accepted"
 * chip (icon + name + kind + size) with a clear-to-replace affordance.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { formatBytes } from "@/lib/pdf/core";
import { FileDropZone } from "@/components/tool/dev";
import {
  type DocumentKind,
  detectFileKind,
  acceptForKinds,
  KIND_LABELS,
  KIND_ICONS,
} from "@/lib/document-tools";

/** A file paired with the kind we classified it as. */
export interface DetectedFile {
  file: File;
  kind: DocumentKind;
}

/** Props for {@link DocumentDropzone}. */
export interface DocumentDropzoneProps {
  /** Called with the first accepted file + its detected kind. */
  onFile: (detected: DetectedFile) => void;
  /**
   * Allowed document families. Drives the picker's `accept` filter and the
   * client-side rejection message. Omit to accept any recognised document.
   */
  accept?: readonly DocumentKind[];
  /** Allow selecting several files; then `onFile` fires once per accepted file. */
  multiple?: boolean;
  /** Enable paste-to-import. Default true. */
  paste?: boolean;
  disabled?: boolean;
  /** Main prompt. Sensible default derived from `accept`. */
  label?: React.ReactNode;
  /** Secondary hint. Defaults to the human list of accepted formats. */
  hint?: React.ReactNode;
  /** Drop-zone icon. Default "FileUp". */
  icon?: string;
  /** Per-file size ceiling in megabytes. Default 100. */
  maxSizeMb?: number;
  /** The currently-selected file to show as a chip (controlled). */
  selected?: DetectedFile | null;
  /** Called when the user clears the selected file. */
  onClear?: () => void;
  className?: string;
}

/** Human list like "PDF document, CSV spreadsheet or Excel workbook". */
function describeKinds(kinds: readonly DocumentKind[]): string {
  const labels = kinds.map((k) => KIND_LABELS[k]);
  if (labels.length <= 1) return labels[0] ?? "any document";
  return `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
}

/** A document-aware drop zone with type detection and friendly states. */
export function DocumentDropzone({
  onFile,
  accept,
  multiple = false,
  paste = true,
  disabled = false,
  label,
  hint,
  icon = "FileUp",
  maxSizeMb = 100,
  selected,
  onClear,
  className,
}: DocumentDropzoneProps) {
  const [rejected, setRejected] = React.useState<string | null>(null);

  const acceptAttr = accept && accept.length ? acceptForKinds(accept) : undefined;
  const allow = React.useMemo(
    () => (accept ? new Set(accept) : null),
    [accept],
  );

  const handleFiles = React.useCallback(
    (files: File[]) => {
      setRejected(null);
      const good: DetectedFile[] = [];
      const bad: string[] = [];
      for (const file of files) {
        const kind = detectFileKind(file);
        if (allow && (kind === "unknown" || !allow.has(kind))) {
          bad.push(file.name);
          continue;
        }
        good.push({ file, kind });
        if (!multiple) break;
      }
      if (good.length === 0 && bad.length > 0) {
        setRejected(
          accept
            ? `Unsupported file. Please use ${describeKinds(accept)}.`
            : "That file type isn't supported here.",
        );
        return;
      }
      for (const item of good) onFile(item);
    },
    [allow, multiple, accept, onFile],
  );

  // Selected-file chip view (single-file mode with a selection).
  if (selected && !multiple) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-border bg-card p-3",
          className,
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name={KIND_ICONS[selected.kind]} size={20} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {selected.file.name}
          </span>
          <span className="text-sm text-muted-foreground">
            {KIND_LABELS[selected.kind]} · {formatBytes(selected.file.size)}
          </span>
        </span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove file" title="Remove file"
            className="rounded-md p-1.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <FileDropZone
        onFiles={handleFiles}
        accept={acceptAttr}
        multiple={multiple}
        paste={paste}
        disabled={disabled}
        icon={icon}
        maxSizeMb={maxSizeMb}
        label={
          label ??
          (multiple
            ? "Drop files, click to browse, or paste"
            : "Drop a file, click to browse, or paste")
        }
        hint={hint ?? (accept ? `Accepts ${describeKinds(accept)}` : undefined)}
      />
      {rejected && (
        <p
          role="alert"
          className="flex items-center gap-1.5 text-sm text-destructive"
        >
          <Icon name="CircleAlert" size={13} />
          {rejected}
        </p>
      )}
    </div>
  );
}
