"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { svgToDataUri } from "@/lib/svg-tools/convert";
import { optimizeSvg } from "@/lib/svg-tools/optimize";
import { utf8Bytes, escapeAttr } from "@/lib/svg-tools/core";
import {
  CodePane,
  CopyButton,
  DownloadButton,
  ErrorBanner,
  ExamplesMenu,
  Field,
  SegmentedControl,
  StatBadge,
  Toggle,
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

/** URL-optimized (smallest, CSS-friendly) or classic base64 encoding. */
type Encoding = "url" | "base64";
/** What snippet to wrap the data URI in for the output pane. */
type OutputMode = "css" | "img" | "raw";

/** All user-tunable options for one encode. */
interface Settings {
  encoding: Encoding;
  output: OutputMode;
  optimize: boolean;
  selector: string;
}

const DEFAULT_SETTINGS: Settings = {
  encoding: "url",
  output: "css",
  optimize: true,
  selector: ".icon",
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

/** Sanitise a user selector; fall back to a sensible default. */
function safeSelector(raw: string): string {
  const s = raw.trim();
  return s.length > 0 ? s : ".icon";
}

/** Wrap a bare data: URI in the requested snippet. */
function wrapOutput(uri: string, settings: Settings): string {
  if (settings.output === "raw") return uri;
  if (settings.output === "img") {
    return `<img src="${escapeAttr(uri)}" alt="" />`;
  }
  // css
  return `${safeSelector(settings.selector)} {\n  background-image: url("${uri}");\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: contain;\n}`;
}

/** Curated samples so the empty state is one click from a real result. */
const EXAMPLES: ReadonlyArray<Example> = [
  {
    label: "Chevron icon",
    description: "Tiny stroked glyph, ideal for a CSS background",
    icon: "ChevronRight",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 4 10 8 6 12"/></svg>',
  },
  {
    label: "Check badge",
    description: "Solid fill mark",
    icon: "CircleCheck",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#059669"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14l-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7z"/></svg>',
  },
  {
    label: "Wave background",
    description: "Gradient tile, see base64 vs URL size",
    icon: "Waves",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#14b8a6"/></linearGradient></defs><path fill="url(#w)" d="M0 20c20-16 40-16 60 0s40 16 60 0v20H0z"/></svg>',
  },
];

/**
 * SVG to Data URI, encodes SVG as a `data:` URI in the browser. It drives
 * `lib/svg-tools/convert`'s {@link svgToDataUri} from an options panel and
 * renders three synced surfaces: an editable SVG source pane with a live
 * sanitised preview ({@link SvgWorkspace}), and a read-only output pane
 * (CSS rule, `<img>` tag, or raw URI) with copy/download. A live size
 * comparison shows the original SVG next to the encoded payload and pits
 * URL-encoding against base64 so the smaller one is obvious. An optional
 * in-browser cleanup pass (SVGO, via {@link optimizeSvg}) shrinks the input
 * before encoding. Undo/redo, shortcuts, examples and a share link round it
 * out, all client-side.
 */
export default function SvgToDataUriTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const svg = useHistory<string>("");
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [dismissedError, setDismissedError] = React.useState(false);
  const [cleaned, setCleaned] = React.useState<string | null>(null);

  const share = useShareState({
    onInit: (value) => svg.reset(value),
  });

  const setField = React.useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Optional cleanup pass runs async (SVGO lazy-loads). Recompute when the
  // source or the optimize toggle changes; null means "use the raw source".
  React.useEffect(() => {
    let alive = true;
    const source = svg.state.trim();
    if (!settings.optimize || source.length === 0) {
      setCleaned(null);
      return () => {
        alive = false;
      };
    }
    void optimizeSvg(svg.state, { pretty: false }).then((r) => {
      if (!alive) return;
      setCleaned(r.ok ? r.result : null);
    });
    return () => {
      alive = false;
    };
  }, [svg.state, settings.optimize]);

  /** The SVG bytes we actually encode (cleaned when available, else raw). */
  const encodedSource = React.useMemo(() => {
    if (svg.state.trim().length === 0) return "";
    return settings.optimize && cleaned != null ? cleaned : svg.state;
  }, [svg.state, settings.optimize, cleaned]);

  // Encode both ways so we can always show the size comparison, and wrap the
  // chosen one into the output snippet.
  const result = React.useMemo(() => {
    if (encodedSource.trim().length === 0) {
      return { output: "", uri: "", urlBytes: 0, base64Bytes: 0, error: null as string | null };
    }
    const urlRes = svgToDataUri(encodedSource, { encoding: "url-optimized" });
    const b64Res = svgToDataUri(encodedSource, { encoding: "base64" });
    if (!urlRes.ok) return { output: "", uri: "", urlBytes: 0, base64Bytes: 0, error: urlRes.error.message };
    if (!b64Res.ok) return { output: "", uri: "", urlBytes: 0, base64Bytes: 0, error: b64Res.error.message };

    const chosen = settings.encoding === "url" ? urlRes.result : b64Res.result;
    return {
      output: wrapOutput(chosen, settings),
      uri: chosen,
      urlBytes: utf8Bytes(urlRes.result),
      base64Bytes: utf8Bytes(b64Res.result),
      error: null,
    };
  }, [encodedSource, settings]);

  React.useEffect(() => {
    setDismissedError(false);
  }, [result.error]);

  const originalBytes = svg.state.trim().length > 0 ? utf8Bytes(svg.state) : 0;
  const chosenBytes = settings.encoding === "url" ? result.urlBytes : result.base64Bytes;
  const smaller: Encoding | null =
    result.urlBytes > 0 && result.base64Bytes > 0
      ? result.urlBytes <= result.base64Bytes
        ? "url"
        : "base64"
      : null;

  const downloadName =
    settings.output === "css" ? "svg-data-uri.css" : settings.output === "img" ? "svg-data-uri.html" : "svg-data-uri.txt";
  const downloadMime =
    settings.output === "css"
      ? "text/css;charset=utf-8"
      : settings.output === "img"
      ? "text/html;charset=utf-8"
      : "text/plain;charset=utf-8";

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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <Field label="Encoding">
          <SegmentedControl<Encoding>
            value={settings.encoding}
            onChange={(v) => setField("encoding", v)}
            ariaLabel="Data URI encoding"
            size="sm"
            options={[
              { value: "url", label: "URL-encoded", icon: "Link" },
              { value: "base64", label: "Base64", icon: "Binary" },
            ]}
          />
        </Field>
        <Field label="Output as">
          <SegmentedControl<OutputMode>
            value={settings.output}
            onChange={(v) => setField("output", v)}
            ariaLabel="Output snippet"
            size="sm"
            options={[
              { value: "css", label: "CSS", icon: "Braces" },
              { value: "img", label: "<img>", icon: "Image" },
              { value: "raw", label: "Raw URI", icon: "Link2" },
            ]}
          />
        </Field>
        {settings.output === "css" ? (
          <Field label="CSS selector" hint="Where the background is applied">
            <input
              type="text"
              value={settings.selector}
              onChange={(e) => setField("selector", e.target.value)}
              spellCheck={false}
              aria-label="CSS selector"
              placeholder=".icon"
              className="h-8 w-40 rounded-md border border-border bg-background px-2.5 font-mono text-sm text-foreground outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/60 pt-3">
        <Toggle
          checked={settings.optimize}
          onChange={(v) => setField("optimize", v)}
          label="Clean up before encoding"
        />
        <p className="text-xs text-muted-foreground">
          Strips editor metadata and whitespace, usually the biggest size win.
        </p>
      </div>
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
      <ToolbarButton icon="Undo2" label="Undo" onClick={svg.undo} disabled={!svg.canUndo} />
      <ToolbarButton icon="Redo2" label="Redo" onClick={svg.redo} disabled={!svg.canRedo} />
    </>
  );

  const showError = result.error != null && !dismissedError;
  const outputLabel =
    settings.output === "css" ? "CSS rule" : settings.output === "img" ? "HTML <img>" : "Raw data URI";

  const outputLines = result.output ? result.output.split("\n").length : 0;

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
        emptyLabel="Your encoded artwork previews here"
      />

      {svg.state.trim().length > 0 && (
        <div className="flex flex-col gap-2">
          {showError ? (
            <ErrorBanner error={result.error} onDismiss={() => setDismissedError(true)} />
          ) : null}

          <Toolbar>
            <span className="px-1 text-sm font-medium text-foreground">{outputLabel}</span>
            <ToolbarDivider />
            <CopyButton getValue={() => result.output} label="Copy snippet" />
            {result.uri ? <CopyButton getValue={() => result.uri} label="Copy raw URI" /> : null}
            <DownloadButton
              filename={downloadName}
              getValue={() => result.output}
              mime={downloadMime}
              label="Download"
            />
            <ToolbarSpacer />
            {result.uri ? (
              <>
                <StatBadge
                  label="Original"
                  value={formatBytes(originalBytes)}
                  icon="FileCode2"
                />
                <StatBadge
                  label="Encoded"
                  value={formatBytes(chosenBytes)}
                  icon="Scale"
                  tone={chosenBytes <= originalBytes ? "success" : "default"}
                />
                <StatBadge
                  label="URL"
                  value={formatBytes(result.urlBytes)}
                  icon="Link"
                  tone={smaller === "url" ? "success" : "default"}
                />
                <StatBadge
                  label="Base64"
                  value={formatBytes(result.base64Bytes)}
                  icon="Binary"
                  tone={smaller === "base64" ? "success" : "default"}
                />
              </>
            ) : null}
          </Toolbar>

          <CodePane
            value={
              result.output ||
              (result.error
                ? "/* Fix the SVG above to generate a data URI. */"
                : "/* The encoded data URI snippet will appear here. */")
            }
            readOnly
            label={`${outputLabel}, ${settings.encoding === "url" ? "URL-encoded" : "base64"}`}
            lineNumbers={settings.output === "css"}
            wrap
            minHeight={200}
            maxHeight={420}
            ariaLabel="Generated data URI output"
          />

          {result.uri ? (
            <p className="px-1 text-xs text-muted-foreground">
              {smaller === "url"
                ? "URL-encoding is smaller here: the usual case for SVG."
                : smaller === "base64"
                ? "Base64 is smaller here, worth switching for this artwork."
                : null}
              {" "}
              {outputLines > 1 ? `${outputLines} lines · ` : ""}
              {formatBytes(chosenBytes)} on the wire.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
