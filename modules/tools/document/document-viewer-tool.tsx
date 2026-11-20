"use client";

/**
 * Document Viewer, the universal, catch-all viewer.
 *
 * Drop ANY supported document and it auto-detects the format and renders the
 * matching in-browser preview. It is pure composition of the shared engine:
 *
 *  - `<DocumentDropzone>` (components/tool/document), type-detecting file input
 *  - `<DocumentPreview>` (components/tool/document): the universal per-kind
 *     viewer (pdf.js / papaparse / SheetJS / marked / epub.js / image), each
 *     dependency lazy-loaded only when its format is shown.
 *  - `rtfToHtml` (lib/document-tools/rtf). RTF has no native preview kind, so
 *     we honestly normalise it to HTML through the shared engine and preview the
 *     result as an HTML document. No duplicated viewer code lives here.
 *
 * Honest boundary, surfaced in the UI (not just the config): this is a VIEWER,
 * not an editor or converter. It shows the file and lets you download the
 * original as-is; scanned/image-only PDFs display as page images with no
 * selectable text, and legacy binary formats (.doc/.ppt) aren't previewable.
 * Everything runs in the browser: nothing is uploaded.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { formatBytes } from "@/lib/pdf/core";
import type { WorkspaceToolData } from "@/types";

import { Button } from "@/components/ui/button";
import { download } from "@/components/tool/dev";
import {
  DocumentDropzone,
  DocumentPreview,
  type DetectedFile,
} from "@/components/tool/document";
import {
  type DocumentKind,
  KIND_LABELS,
  KIND_ICONS,
} from "@/lib/document-tools";
import { rtfToHtml, isRtf } from "@/lib/document-tools/rtf";

/**
 * Kinds `<DocumentPreview>` renders natively. RTF is handled separately (it has
 * no native kind), so it's not in this accept set but is still welcomed below.
 */
const NATIVE_KINDS: readonly DocumentKind[] = [
  "pdf",
  "csv",
  "xlsx",
  "txt",
  "md",
  "html",
  "json",
  "epub",
  "image",
] as const;

/** What the viewer is currently showing. */
type ViewState =
  | { phase: "idle" }
  | { phase: "preparing"; name: string }
  | { phase: "ready"; file: File; kind: DocumentKind; original: File }
  | { phase: "error"; message: string };

/** Formats a compact "PDF · CSV · XLSX …" support string for the empty state. */
const SUPPORTED_LABEL =
  "PDF, CSV, Excel, text, Markdown, JSON, EPUB, RTF and images";

/** A tiny built-in Markdown sample so the tool works with a single click. */
const EXAMPLE_MD = `# GigAI Document Viewer

Drop **any** supported file here and it renders instantly, right in your
browser, with _nothing uploaded_.

## What it opens

- \`PDF\` - paged, crisp pages
- \`CSV\` / \`XLSX\` - scrollable grids
- \`MD\` - rendered Markdown (this file!)
- \`EPUB\` - reflowing e-book
- \`RTF\`, \`JSON\`, images and more

> This is a **viewer**, not an editor - it shows the file and lets you
> download the original as-is.
`;

export default function DocumentViewerTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);
  const [state, setState] = React.useState<ViewState>({ phase: "idle" });

  /**
   * Accept a dropped/pasted file. RTF is normalised to HTML via the shared
   * engine; everything else is previewed by its detected kind. The ORIGINAL
   * file is always retained so the download stays byte-for-byte faithful.
   */
  const openFile = React.useCallback(async (detected: DetectedFile) => {
    const { file } = detected;
    const isRtfName = /\.rtf$/i.test(file.name);

    // RTF has no native preview kind: convert to HTML honestly and preview that.
    if (detected.kind === "unknown" && isRtfName) {
      setState({ phase: "preparing", name: file.name });
      try {
        const raw = await file.text();
        if (!isRtf(raw)) throw new Error("This doesn't look like a valid RTF file.");
        const html = rtfToHtml(raw);
        const htmlFile = new File([html], file.name.replace(/\.rtf$/i, ".html"), {
          type: "text/html",
        });
        setState({ phase: "ready", file: htmlFile, kind: "html", original: file });
      } catch (err) {
        setState({
          phase: "error",
          message:
            err instanceof Error
              ? err.message
              : "Couldn't read that RTF file.",
        });
      }
      return;
    }

    // Everything the universal preview can render natively.
    setState({
      phase: "ready",
      file,
      kind: detected.kind,
      original: file,
    });
  }, []);

  const loadExample = React.useCallback(() => {
    const file = new File([EXAMPLE_MD], "welcome.md", { type: "text/markdown" });
    void openFile({ file, kind: "md" });
  }, [openFile]);

  const reset = React.useCallback(() => setState({ phase: "idle" }), []);

  const ready = state.phase === "ready" ? state : null;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Empty / drop state ────────────────────────────────────────────── */}
      {state.phase !== "ready" && (
        <div className="flex flex-col gap-4">
          <DocumentDropzone
            accept={NATIVE_KINDS}
            multiple={false}
            onFile={(d) => void openFile(d)}
            icon="Eye"
            label="Drop a document, click to browse, or paste one"
            hint={SUPPORTED_LABEL}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadExample}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="Sparkles" size={15} />
              Try an example
            </button>
          </div>

          {state.phase === "preparing" && (
            <p
              role="status"
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Icon name="LoaderCircle" size={15} className="animate-spin" />
              Opening {state.name}…
            </p>
          )}

          {state.phase === "error" && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
            >
              <Icon name="CircleAlert" size={16} className="mt-0.5 shrink-0" />
              <span>{state.message}</span>
            </p>
          )}

          {/* Supported-format chips */}
          <FormatChips style={style} />
        </div>
      )}

      {/* ── Ready: preview + actions ──────────────────────────────────────── */}
      {ready && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-lg text-white",
                  style.solid,
                )}
                aria-hidden
              >
                <Icon name={KIND_ICONS[ready.kind] ?? "File"} size={16} />
              </span>
              <span className="truncate">{ready.original.name}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {KIND_LABELS[ready.kind]} · {formatBytes(ready.original.size)}
            </span>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  download(
                    ready.original.name,
                    ready.original,
                    ready.original.type || "application/octet-stream",
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon name="Download" size={15} />
                Download original
              </button>
              <Button type="button" variant="outline" onClick={reset} className="gap-1.5">
                <Icon name="RotateCcw" size={15} />
                Open another
              </Button>
            </div>
          </div>

          {/* The universal, lazy, per-kind preview. */}
          <DocumentPreview
            file={ready.file}
            kind={ready.kind}
            height={560}
            downloadable={false}
          />
        </div>
      )}

      {/* ── Honest boundary note ──────────────────────────────────────────── */}
      <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <Icon name="Info" size={14} className={cn("mt-0.5 shrink-0", style.text)} />
        <span>
          This is a{" "}
          <strong className="font-medium text-foreground">viewer</strong>, not an
          editor or converter. It shows the file and lets you download the
          original as-is. Scanned or image-only PDFs display as page images with
          no selectable text, and legacy binary formats like{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">.doc</code>{" "}
          or <code className="rounded bg-muted px-1 py-0.5 text-[11px]">.ppt</code>{" "}
          aren&apos;t previewable here. Everything happens in your browser  -
          nothing is uploaded.
        </span>
      </p>
    </div>
  );
}

/* ── Supported-format chips for the empty state ───────────────────────────── */

const CHIP_KINDS: DocumentKind[] = [
  "pdf",
  "csv",
  "xlsx",
  "txt",
  "md",
  "json",
  "epub",
  "image",
];

function FormatChips({ style }: { style: ReturnType<typeof accentStyle> }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Renders in your browser
      </span>
      <ul className="flex flex-wrap gap-1.5" aria-label="Supported formats">
        {CHIP_KINDS.map((kind) => (
          <li
            key={kind}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground",
            )}
          >
            <Icon name={KIND_ICONS[kind]} size={13} className={style.text} />
            {KIND_LABELS[kind]}
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
          <Icon name="FileType" size={13} className={style.text} />
          RTF
        </li>
      </ul>
    </div>
  );
}
