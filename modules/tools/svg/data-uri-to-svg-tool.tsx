"use client";

import * as React from "react";
import Link from "next/link";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { dataUriToSvg } from "@/lib/svg-tools/convert";
import { utf8Bytes } from "@/lib/svg-tools/core";
import {
  CodePane,
  CopyButton,
  DownloadButton,
  ErrorBanner,
  ExamplesMenu,
  ShortcutsHelp,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  download,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";
import {
  SvgPreview,
  type PreviewBackground,
  type PreviewZoom,
} from "@/components/tool/svg";

/* ────────────────────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────────────────────── */

/** Human-readable byte size, e.g. 1.2 KB. */
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"] as const;
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const unit = units[i] ?? "KB";
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

/**
 * Unwrap the common paste noise around a data URI: a `url("…")` / `url('…')`
 * wrapper and surrounding quotes. The engine's `dataUriToSvg` handles the
 * `;charset`/`;base64` markers itself, so we only strip the outer shell here.
 */
function unwrapUri(raw: string): string {
  let s = raw.trim();
  const urlMatch = /^url\(\s*(['"]?)([\s\S]*?)\1\s*\)$/i.exec(s);
  if (urlMatch && urlMatch[2] != null) s = urlMatch[2].trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** True for the base64 flavour of an SVG data URI (drives the encoding badge). */
function isBase64Uri(uri: string): boolean {
  return /^data:image\/svg\+xml[^,]*;base64,/i.test(uri.trim());
}

/* ────────────────────────────────────────────────────────────────────────────
 * Examples, one click from a real decode.
 * ──────────────────────────────────────────────────────────────────────────── */

const EX_URL_ENCODED =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e11d48' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z'/%3E%3C/svg%3E";

const EX_BASE64 =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzM4YmRmOCIvPjwvc3ZnPg==";

const EX_CSS_WRAPPED =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' rx='10' fill='%23f43f5e'/%3E%3Cpath d='M12 20h16M20 12v16' stroke='%23fff' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E\")";

const EX_CHARSET =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23fb7185'/%3E%3Cstop offset='1' stop-color='%23e11d48'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='4' y='4' width='40' height='40' rx='12' fill='url(%23g)'/%3E%3C/svg%3E";

const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "URL-encoded star",
    description: "Percent-escaped data URI, the CSS-friendly form",
    value: EX_URL_ENCODED,
    icon: "Star",
  },
  {
    label: "Base64 circle",
    description: "The ;base64,PHN2Zy… flavour",
    value: EX_BASE64,
    icon: "Binary",
  },
  {
    label: "CSS url() wrapper",
    description: "Pasted straight from a background-image rule",
    value: EX_CSS_WRAPPED,
    icon: "Braces",
  },
  {
    label: "With ;charset marker",
    description: "A gradient URI carrying charset=utf-8",
    value: EX_CHARSET,
    icon: "Sparkles",
  },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Copy the decoded SVG" },
  { combo: "mod+s", description: "Download the .svg" },
  { combo: "mod+z", description: "Undo edit" },
  { combo: "mod+shift+z", description: "Redo edit" },
  { combo: "mod+backspace", description: "Clear the input" },
  { combo: "esc", description: "Dismiss the error banner" },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Data URI to SVG tool
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Data URI to SVG: decodes a `data:image/svg+xml` URI (base64 or URL-encoded)
 * back into raw SVG using the engine's `dataUriToSvg`. The input URI, a live
 * sanitised {@link SvgPreview} of the decoded graphic, and a read-only source
 * pane are kept in sync; undo/redo, examples, shortcuts, share, copy/download
 * and specific errors make it a desktop-grade decoder: all in the browser.
 */
export default function DataUriToSvgTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 250 });
  const input = history.state;

  const [background, setBackground] =
    React.useState<PreviewBackground>("checker");
  const [zoom, setZoom] = React.useState<PreviewZoom>("fit");
  const [dismissedError, setDismissedError] = React.useState(false);

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  const hasInput = input.trim().length > 0;

  // Decode on every input change. Pure + synchronous, so no effect needed.
  const decoded = React.useMemo(() => {
    if (!hasInput) return { svg: "", error: null as string | null };
    const cleaned = unwrapUri(input);
    const result = dataUriToSvg(cleaned);
    if (!result.ok) return { svg: "", error: result.error.message };
    return { svg: result.result, error: null };
  }, [input, hasInput]);

  React.useEffect(() => {
    setDismissedError(false);
  }, [decoded.error]);

  const svg = decoded.svg;
  const hasSvg = svg.length > 0;
  const svgBytes = hasSvg ? utf8Bytes(svg) : 0;
  const svgLines = hasSvg ? svg.split("\n").length : 0;
  const encodingLabel = React.useMemo(
    () => (hasInput && isBase64Uri(unwrapUri(input)) ? "base64" : "URL-encoded"),
    [input, hasInput],
  );

  const doDownload = React.useCallback(() => {
    if (hasSvg) download("decoded.svg", svg, "image/svg+xml;charset=utf-8");
  }, [hasSvg, svg]);

  const doShare = React.useCallback(() => {
    if (hasInput) void share.copyShareLink(input);
  }, [share, hasInput, input]);

  useShortcuts(
    {
      "mod+enter": (e) => {
        e.preventDefault();
        if (hasSvg) void navigator.clipboard?.writeText(svg).catch(() => undefined);
      },
      "mod+s": (e) => {
        e.preventDefault();
        doDownload();
      },
      "mod+backspace": (e) => {
        e.preventDefault();
        history.set("");
      },
      "mod+z": (e) => {
        e.preventDefault();
        history.undo();
      },
      "mod+shift+z": (e) => {
        e.preventDefault();
        history.redo();
      },
      escape: () => setDismissedError(true),
    },
    { allowInInputs: true },
  );

  const showError = decoded.error != null && !dismissedError;

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <Toolbar>
        <ExamplesMenu
          examples={EXAMPLES}
          onPick={(value) => history.set(value)}
          label="Samples"
          heading="Load a sample data URI"
        />
        <ToolbarDivider />
        <ToolbarButton
          icon="Undo2"
          label="Undo"
          onClick={history.undo}
          disabled={!history.canUndo}
        />
        <ToolbarButton
          icon="Redo2"
          label="Redo"
          onClick={history.redo}
          disabled={!history.canRedo}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link2"}
          label={share.justCopied ? "Link copied!" : "Share"}
          variant={share.justCopied ? "active" : "default"}
          disabled={!hasInput}
          onClick={doShare}
        />
        <ToolbarButton
          icon="RotateCcw"
          label="Clear"
          variant="destructive"
          onClick={() => history.set("")}
          disabled={!hasInput}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && (
        <p className="text-xs text-destructive" role="alert">
          {share.shareError}
        </p>
      )}

      {/* Input: the data URI */}
      <CodePane
        value={input}
        onChange={(v) => history.set(v)}
        onDropText={(text) => history.set(text)}
        label="Data URI"
        placeholder={
          "Paste a data:image/svg+xml URI. Base64 or URL-encoded. You can paste the whole url(\"…\") wrapper too."
        }
        lineNumbers={false}
        wrap
        minHeight={130}
        errorLine={decoded.error ? 1 : null}
        ariaLabel="Data URI input"
      />

      {showError ? (
        <ErrorBanner
          error={decoded.error}
          onDismiss={() => setDismissedError(true)}
        />
      ) : null}

      {hasInput ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {/* Left: live preview of the decoded SVG */}
          <SvgPreview
            svg={svg}
            background={background}
            onBackgroundChange={setBackground}
            zoom={zoom}
            onZoomChange={setZoom}
            minHeight={320}
            ariaLabel="Decoded SVG preview"
            emptyLabel={
              decoded.error
                ? "Fix the data URI to see a preview"
                : "The decoded SVG will preview here"
            }
          />

          {/* Right: decoded source + its own toolbar */}
          <div className="flex min-w-0 flex-col gap-2">
            <Toolbar>
              <span className="px-1 text-sm font-medium text-foreground">
                Decoded SVG
              </span>
              <ToolbarDivider />
              <CopyButton getValue={() => svg} label="Copy SVG" />
              <DownloadButton
                filename="decoded.svg"
                getValue={() => svg}
                mime="image/svg+xml;charset=utf-8"
                label="Download"
                icon="Download"
              />
              <ToolbarSpacer />
              {hasSvg ? (
                <>
                  <StatBadge
                    label="Encoding"
                    value={encodingLabel}
                    icon="Binary"
                    tone="info"
                  />
                  <StatBadge label="Lines" value={String(svgLines)} icon="AlignLeft" />
                  <StatBadge label="Size" value={formatBytes(svgBytes)} icon="Scale" />
                </>
              ) : null}
            </Toolbar>

            <CodePane
              value={
                svg ||
                (decoded.error
                  ? "<!-- Fix the data URI above to decode the SVG. -->"
                  : "<!-- The decoded SVG markup will appear here. -->")
              }
              readOnly
              label="decoded.svg"
              lineNumbers
              wrap={false}
              minHeight={280}
              ariaLabel="Decoded SVG source"
            />
          </div>
        </div>
      ) : null}

      {/* Next-step hint once we have a valid decode */}
      {hasSvg ? (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3",
          )}
        >
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="CircleCheck" size={16} className="text-primary" />
            Decoded successfully - {formatBytes(svgBytes)} of SVG.
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/svg-optimizer"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
            >
              <Icon name="Wand2" size={13} />
              Optimize this SVG
            </Link>
            <Link
              href="/svg-viewer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent/40"
            >
              <Icon name="ScanSearch" size={13} />
              Inspect in Viewer
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
