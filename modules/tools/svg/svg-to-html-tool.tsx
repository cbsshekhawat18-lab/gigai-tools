"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { svgToHtml, type HtmlOptions } from "@/lib/svg-tools/convert";
import { utf8Bytes } from "@/lib/svg-tools/core";
import {
  CodePane,
  CopyButton,
  DownloadButton,
  ErrorBanner,
  ExamplesMenu,
  Field,
  SegmentedControl,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
} from "@/components/tool/dev";
import { SvgWorkspace } from "@/components/tool/svg";

/** Inline <svg> block or a self-contained data-URI <img>. */
type Mode = "inline" | "img-datauri";

/** Human-readable byte size, e.g. 1.2 KB. */
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const unit = units[i] ?? "KB";
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}

/** Curated samples so the empty state is one click from a real result. */
const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Arrow icon",
    description: "A simple stroked line icon",
    icon: "ArrowRight",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  },
  {
    label: "Filled logo mark",
    description: "Solid fill + fill-rule",
    icon: "Hexagon",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="#f97316"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 2l12 7v14l-12 7L4 23V9l12-7zm0 5.2L9 11.3v9.4l7 4.1 7-4.1v-9.4L16 7.2z"/></svg>',
  },
  {
    label: "Gradient badge",
    description: "Uses defs, linearGradient & rounded rect",
    icon: "Sparkles",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fb923c"/><stop offset="1" stop-color="#ef4444"/></linearGradient></defs><rect x="4" y="4" width="40" height="40" rx="12" fill="url(#g)"/><path d="M24 14l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff"/></svg>',
  },
];

/**
 * SVG to HTML, the embed-ready converter. It drives `lib/svg-tools/convert`'s
 * `svgToHtml` from a compact options strip and renders the result in three
 * synced surfaces: an editable SVG source pane, a live sanitised preview of the
 * artwork ({@link SvgWorkspace}), and a read-only generated-HTML pane with its
 * own copy/download. Undo/redo, keyboard shortcuts, examples and a shareable
 * link round out a desktop-grade experience, all in the browser.
 */
export default function SvgToHtmlTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const svg = useHistory<string>("");
  const [mode, setMode] = React.useState<Mode>("inline");
  const [alt, setAlt] = React.useState<string>("");
  const [dismissedError, setDismissedError] = React.useState(false);

  const share = useShareState({
    onInit: (value) => svg.reset(value),
  });

  // Convert on every source/option change. Pure + synchronous, so no effect.
  const conversion = React.useMemo(() => {
    const source = svg.state.trim();
    if (source.length === 0) {
      return { code: "", error: null as string | null };
    }
    const opts: HtmlOptions = { mode, alt: alt.trim() };
    const result = svgToHtml(svg.state, opts);
    if (!result.ok) return { code: "", error: result.error.message };
    return { code: result.result, error: null };
  }, [svg.state, mode, alt]);

  React.useEffect(() => {
    setDismissedError(false);
  }, [conversion.error]);

  const filename = mode === "inline" ? "svg-inline.html" : "svg-img.html";
  const codeBytes = conversion.code ? utf8Bytes(conversion.code) : 0;
  const codeLines = conversion.code ? conversion.code.split("\n").length : 0;

  const onShare = React.useCallback(() => {
    if (svg.state.trim().length === 0) return;
    void share.copyShareLink(svg.state);
  }, [share, svg.state]);

  useShortcuts({
    "mod+z": (e) => {
      e.preventDefault();
      svg.undo();
    },
    "mod+shift+z": (e) => {
      e.preventDefault();
      svg.redo();
    },
    escape: () => setDismissedError(true),
  });

  const options = (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
      <Field label="Embed mode" hint="How the SVG lives in your HTML">
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          ariaLabel="Embed mode"
          size="sm"
          options={[
            { value: "inline", label: "Inline <svg>", icon: "Code2" },
            { value: "img-datauri", label: "<img> data URI", icon: "Image" },
          ]}
        />
      </Field>
      {mode === "img-datauri" ? (
        <Field label="Alt text" hint="Baked into the <img> tag for a11y">
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            spellCheck={false}
            aria-label="Image alt text"
            placeholder="Company logo"
            className="h-8 w-56 rounded-md border border-border bg-background px-2.5 text-sm text-foreground outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>
      ) : null}
    </div>
  );

  const workspaceExtra = (
    <>
      <ExamplesMenu
        examples={EXAMPLES}
        onPick={(value) => svg.reset(value)}
        heading="Load a sample SVG"
      />
      <ToolbarDivider />
      <ToolbarButton
        icon="Undo2"
        label="Undo"
        onClick={svg.undo}
        disabled={!svg.canUndo}
      />
      <ToolbarButton
        icon="Redo2"
        label="Redo"
        onClick={svg.redo}
        disabled={!svg.canRedo}
      />
    </>
  );

  const showError = conversion.error != null && !dismissedError;

  return (
    <div className="flex flex-col gap-4">
      <SvgWorkspace
        input={svg.state}
        onInputChange={svg.set}
        inputLabel="SVG source"
        placeholder='Paste SVG markup, drop a.svg file, or load a sample, e.g. <svg viewBox="0 0 24 24">…</svg>'
        filename="source.svg"
        copyTarget="input"
        options={options}
        toolbarExtra={workspaceExtra}
        onReset={() => svg.reset("")}
        onShare={onShare}
        shareJustCopied={share.justCopied}
        emptyLabel="Your SVG preview appears here"
      />

      {svg.state.trim().length > 0 && (
        <div className="flex flex-col gap-2">
          {showError ? (
            <ErrorBanner
              error={conversion.error}
              onDismiss={() => setDismissedError(true)}
            />
          ) : null}

          <Toolbar>
            <span className="px-1 text-sm font-medium text-foreground">
              {mode === "inline" ? "Inline SVG" : "Data-URI <img>"} HTML
            </span>
            <ToolbarDivider />
            <CopyButton getValue={() => conversion.code} label="Copy HTML" />
            <DownloadButton
              filename={filename}
              getValue={() => conversion.code}
              mime="text/html;charset=utf-8"
              label="Download"
            />
            <ToolbarSpacer />
            {conversion.code ? (
              <>
                <StatBadge
                  label="Mode"
                  value={mode === "inline" ? "inline" : "data-uri"}
                  icon={mode === "inline" ? "Code2" : "Image"}
                  tone="info"
                />
                <StatBadge
                  label="Lines"
                  value={String(codeLines)}
                  icon="AlignLeft"
                />
                <StatBadge
                  label="Size"
                  value={formatBytes(codeBytes)}
                  icon="Scale"
                />
              </>
            ) : null}
          </Toolbar>

          <CodePane
            value={
              conversion.code ||
              (conversion.error
                ? "<!-- Fix the SVG above to generate HTML. -->"
                : "<!-- The generated HTML will appear here. -->")
            }
            readOnly
            label={mode === "inline" ? "Inline SVG, generated" : "Data-URI <img>, generated"}
            lineNumbers
            wrap={mode === "img-datauri"}
            minHeight={220}
            ariaLabel="Generated HTML"
          />
        </div>
      )}
    </div>
  );
}
