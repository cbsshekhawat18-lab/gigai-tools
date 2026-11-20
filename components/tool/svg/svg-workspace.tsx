"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  CodePane,
  CopyButton,
  DownloadButton,
  FileDropZone,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  useFileDrop,
} from "@/components/tool/dev";
import {
  SvgPreview,
  type PreviewBackground,
  type PreviewZoom,
  type SvgPreviewProps,
} from "./svg-preview";

/** Props for {@link SvgWorkspace}. */
export interface SvgWorkspaceProps {
  /** SVG source shown in the editor. */
  input: string;
  onInputChange: (value: string) => void;
  /**
   * SVG to preview and export. Defaults to `input`, pass a transformed result
   * (optimized/converted) to preview the OUTPUT while editing the source.
   */
  output?: string;
  /** Label above the input editor. Default "SVG source". */
  inputLabel?: React.ReactNode;
  /** Placeholder for the empty editor. */
  placeholder?: string;
  /** Filename used by the download action. Default "image.svg". */
  filename?: string;
  /** Import file picker accept list. Default ".svg,image/svg+xml". */
  accept?: string;
  /** Option controls rendered in a strip beneath the toolbar. */
  options?: React.ReactNode;
  /** Stat badges / extra nodes shown at the far right of the toolbar. */
  toolbarExtra?: React.ReactNode;
  /** Copy the OUTPUT (default) or the raw INPUT. Default "output". */
  copyTarget?: "input" | "output";
  /** Called when Reset is pressed. Reset button hidden when omitted. */
  onReset?: () => void;
  /** Called when Share is pressed. Share button hidden when omitted. */
  onShare?: () => void;
  /** True for 1.5s after a successful share (drives the Share button state). */
  shareJustCopied?: boolean;
  /** Preview background (controlled). */
  previewBackground?: PreviewBackground;
  onPreviewBackgroundChange?: (bg: PreviewBackground) => void;
  /** Preview zoom (controlled). */
  previewZoom?: PreviewZoom;
  onPreviewZoomChange?: (zoom: PreviewZoom) => void;
  /** Skip preview sanitising (only when the SVG is already trusted). */
  unsafeSkipSanitize?: boolean;
  /** Extra controls appended inside the preview control strip. */
  previewToolbarExtra?: SvgPreviewProps["toolbarExtra"];
  /** Stack panes vertically instead of side-by-side. Default false. */
  stacked?: boolean;
  /** Message shown in the preview when the SVG is empty. */
  emptyLabel?: React.ReactNode;
  className?: string;
}

/**
 * The code↔preview split shell for SVG transform/convert/format tools. Left: an
 * editable SVG {@link CodePane} with drag/drop/paste import. Right: a live
 * {@link SvgPreview} of the output. A shared toolbar wires import, copy,
 * download, reset and share. Drop this in and a full optimize/convert/format
 * tool is a few dozen lines.
 */
export function SvgWorkspace({
  input,
  onInputChange,
  output,
  inputLabel = "SVG source",
  placeholder = "Paste SVG markup, drop a .svg file, or import…",
  filename = "image.svg",
  accept = ".svg,image/svg+xml",
  options,
  toolbarExtra,
  copyTarget = "output",
  onReset,
  onShare,
  shareJustCopied = false,
  previewBackground,
  onPreviewBackgroundChange,
  previewZoom,
  onPreviewZoomChange,
  unsafeSkipSanitize = false,
  previewToolbarExtra,
  stacked = false,
  emptyLabel,
  className,
}: SvgWorkspaceProps) {
  const preview = output ?? input;
  const copyValue = copyTarget === "input" ? input : preview;

  const inputRef = React.useRef<HTMLInputElement>(null);

  const importFiles = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      file
        .text()
        .then((text) => onInputChange(text))
        .catch(() => undefined);
    },
    [onInputChange],
  );

  // Whole-workspace drag/paste import so users can drop onto either pane.
  const { isDragging, dropProps } = useFileDrop({ onFiles: importFiles });

  const openPicker = () => inputRef.current?.click();

  return (
    <div className={cn("flex flex-col gap-3", className)} {...dropProps}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length) importFiles(files);
          e.target.value = "";
        }}
      />

      <Toolbar>
        <ToolbarButton icon="FolderOpen" label="Import" onClick={openPicker} />
        <ToolbarDivider />
        <CopyButton
          getValue={() => copyValue}
          label={copyTarget === "input" ? "Copy source" : "Copy SVG"}
        />
        <DownloadButton
          filename={filename}
          getValue={() => preview}
          mime="image/svg+xml;charset=utf-8"
          label="Download"
        />
        <ToolbarSpacer />
        {onShare && (
          <ToolbarButton
            icon={shareJustCopied ? "Check" : "Link2"}
            label={shareJustCopied ? "Link copied" : "Share"}
            variant={shareJustCopied ? "active" : "default"}
            onClick={onShare}
          />
        )}
        {onReset && (
          <ToolbarButton
            icon="RotateCcw"
            label="Reset"
            variant="destructive"
            onClick={onReset}
            disabled={input.length === 0}
          />
        )}
        {toolbarExtra}
      </Toolbar>

      {options && (
        <div className="rounded-lg border border-border bg-card/60 p-3">{options}</div>
      )}

      {input.trim().length === 0 ? (
        <FileDropZone
          onFiles={importFiles}
          accept={accept}
          label="Drop an SVG, click to browse, or paste"
          hint="Everything runs in your browser, files never leave your device."
          icon="FileImage"
        />
      ) : (
        <div
          className={cn(
            "grid gap-3",
            stacked ? "grid-cols-1" : "lg:grid-cols-2",
            isDragging && "rounded-lg outline-2 outline-dashed outline-primary/60",
          )}
        >
          <CodePane
            value={input}
            onChange={onInputChange}
            label={inputLabel}
            placeholder={placeholder}
            onDropText={onInputChange}
            lineNumbers
            wrap={false}
            minHeight={280}
            ariaLabel="SVG source editor"
          />
          <SvgPreview
            svg={preview}
            background={previewBackground}
            onBackgroundChange={onPreviewBackgroundChange}
            zoom={previewZoom}
            onZoomChange={onPreviewZoomChange}
            unsafeSkipSanitize={unsafeSkipSanitize}
            toolbarExtra={previewToolbarExtra}
            minHeight={280}
            emptyLabel={emptyLabel}
          />
        </div>
      )}
    </div>
  );
}
