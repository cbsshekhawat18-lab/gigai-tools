"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { svgToCss, svgToDataUri, type CssOptions } from "@/lib/svg-tools/convert";
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

/** Render the SVG as a background-image or a recolorable CSS mask. */
type Mode = "background" | "mask";

/** All user-tunable conversion options for one run. */
interface Settings {
  selector: string;
  mode: Mode;
}

const DEFAULT_SETTINGS: Settings = {
  selector: ".icon",
  mode: "background",
};

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

/** Turn an arbitrary selector into a safe .css download filename stem. */
function fileBaseName(selector: string): string {
  const cleaned = selector.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned.length > 0 ? cleaned : "icon";
}

/** Curated samples so the empty state is one click from a real result. */
const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Menu icon",
    description: "Monochrome: great for mask mode",
    icon: "Menu",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  },
  {
    label: "Chevron",
    description: "A tiny stroked glyph",
    icon: "ChevronDown",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  },
  {
    label: "Checkerboard pattern",
    description: "Full-color: best in background mode",
    icon: "Grid2x2",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#eef2ff"/><rect width="20" height="20" fill="#6366f1"/><rect x="20" y="20" width="20" height="20" fill="#6366f1"/></svg>',
  },
];

/**
 * SVG to CSS, turns raw SVG into a paste-ready CSS rule that renders the
 * artwork as a `background-image` or a recolorable `mask`, using a compact
 * URL-optimized `data:` URI. It drives `lib/svg-tools/convert`'s `svgToCss`
 * from a compact options panel and renders the result in three synced surfaces:
 * an editable SVG source pane, a live sanitised preview of the artwork
 * ({@link SvgWorkspace}), and a read-only generated-CSS pane with its own
 * copy/download. A size readout compares the URL-optimized data URI against
 * base64. Undo/redo, shortcuts, examples and a shareable link round out a
 * desktop-grade experience: all in the browser.
 */
export default function SvgToCssTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const svg = useHistory<string>("");
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [dismissedError, setDismissedError] = React.useState(false);

  const share = useShareState({
    onInit: (value) => svg.reset(value),
  });

  const setField = React.useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Convert on every source/option change. Pure + synchronous, so no effect.
  const conversion = React.useMemo(() => {
    const source = svg.state.trim();
    if (source.length === 0) {
      return { code: "", error: null as string | null, uriBytes: 0, base64Bytes: 0 };
    }
    const opts: CssOptions = {
      selector: settings.selector,
      mode: settings.mode,
    };
    const result = svgToCss(svg.state, opts);
    if (!result.ok) {
      return { code: "", error: result.error.message, uriBytes: 0, base64Bytes: 0 };
    }
    // Size comparison: URL-optimized (what we emit) vs classic base64.
    const urlUri = svgToDataUri(svg.state, { encoding: "url-optimized" });
    const b64Uri = svgToDataUri(svg.state, { encoding: "base64" });
    return {
      code: result.result,
      error: null as string | null,
      uriBytes: urlUri.ok ? utf8Bytes(urlUri.result) : 0,
      base64Bytes: b64Uri.ok ? utf8Bytes(b64Uri.result) : 0,
    };
  }, [svg.state, settings]);

  React.useEffect(() => {
    setDismissedError(false);
  }, [conversion.error]);

  const filename = `${fileBaseName(settings.selector)}.css`;
  const savedPct =
    conversion.base64Bytes > 0
      ? Math.max(0, Math.round((1 - conversion.uriBytes / conversion.base64Bytes) * 100))
      : 0;

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
      <Field label="Selector">
        <input
          type="text"
          value={settings.selector}
          onChange={(e) => setField("selector", e.target.value)}
          spellCheck={false}
          aria-label="CSS selector"
          placeholder=".icon"
          className="h-8 w-52 rounded-md border border-border bg-background px-2.5 font-mono text-sm text-foreground outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>
      <Field label="Mode" hint="mask recolors via background-color">
        <SegmentedControl<Mode>
          value={settings.mode}
          onChange={(v) => setField("mode", v)}
          ariaLabel="Output mode"
          size="sm"
          options={[
            { value: "background", label: "Background", icon: "Image" },
            { value: "mask", label: "Mask", icon: "Palette" },
          ]}
        />
      </Field>
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
        emptyLabel="Your icon preview appears here"
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
              CSS rule{" "}
              <span className="font-mono text-xs text-muted-foreground">
                {settings.mode === "mask" ? "mask" : "background"}
              </span>
            </span>
            <ToolbarDivider />
            <CopyButton getValue={() => conversion.code} label="Copy CSS" />
            <DownloadButton
              filename={filename}
              getValue={() => conversion.code}
              mime="text/css;charset=utf-8"
              label="Download"
            />
            <ToolbarSpacer />
            {conversion.code ? (
              <>
                <StatBadge
                  label="Data URI"
                  value={formatBytes(conversion.uriBytes)}
                  icon="Link"
                  tone="info"
                />
                <StatBadge
                  label="vs base64"
                  value={savedPct > 0 ? `−${savedPct}%` : "smaller"}
                  icon="TrendingDown"
                  tone={savedPct > 0 ? "success" : "default"}
                />
              </>
            ) : null}
          </Toolbar>

          <CodePane
            value={
              conversion.code ||
              (conversion.error
                ? "/* Fix the SVG above to generate a CSS rule. */"
                : "/* The generated CSS rule will appear here. */")
            }
            readOnly
            label={`${filename}, generated`}
            lineNumbers
            wrap
            minHeight={220}
            ariaLabel="Generated CSS rule"
          />

          <p className="px-1 text-xs text-muted-foreground">
            {settings.mode === "mask" ? (
              <>
                Mask mode paints the shape with{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">
                  background-color: currentColor
                </code>
                , so the icon inherits your text color - change{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">color</code>{" "}
                on hover or in dark mode and it follows.
              </>
            ) : (
              <>
                Background mode renders the SVG&rsquo;s own colors. To recolor with
                CSS instead, switch to <strong className="font-medium text-foreground">Mask</strong>.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
