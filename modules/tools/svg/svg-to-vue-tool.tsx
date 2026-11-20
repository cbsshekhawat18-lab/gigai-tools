"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { svgToVue, type VueOptions } from "@/lib/svg-tools/convert";
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

/** Emit a typed <script setup lang="ts"> or a plain JavaScript block. */
type Lang = "ts" | "js";

/** All user-tunable conversion options for one run. */
interface Settings {
  name: string;
  lang: Lang;
}

const DEFAULT_SETTINGS: Settings = {
  name: "SvgIcon",
  lang: "ts",
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

/** Sanitise a user-typed name to a valid PascalCase identifier for the filename. */
function fileBaseName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9]/g, "");
  const base = /^[A-Za-z]/.test(cleaned) ? cleaned : `Svg${cleaned}`;
  return base.length > 0 ? base : "SvgIcon";
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
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="#10b981"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 2l12 7v14l-12 7L4 23V9l12-7zm0 5.2L9 11.3v9.4l7 4.1 7-4.1v-9.4L16 7.2z"/></svg>',
  },
  {
    label: "Gradient badge",
    description: "Uses defs, linearGradient & class",
    icon: "Sparkles",
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#059669"/></linearGradient></defs><rect class="bg" x="4" y="4" width="40" height="40" rx="12" fill="url(#g)"/><path d="M24 14l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff"/></svg>',
  },
];

/**
 * SVG to Vue, turns raw SVG into a Vue 3 Single-File Component. It drives
 * `lib/svg-tools/convert`'s `svgToVue` from a compact options panel and renders
 * the result in three synced surfaces: an editable SVG source pane, a live
 * sanitised preview of the artwork ({@link SvgWorkspace}), and a read-only
 * generated-SFC pane with its own copy/download. Undo/redo, keyboard shortcuts,
 * examples and a shareable link round out a desktop-grade experience, all in
 * the browser.
 */
export default function SvgToVueTool({ tool }: { tool: WorkspaceToolData }) {
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
      return { code: "", error: null as string | null };
    }
    const opts: VueOptions = {
      name: settings.name,
      ts: settings.lang === "ts",
    };
    const result = svgToVue(svg.state, opts);
    if (!result.ok) return { code: "", error: result.error.message };
    return { code: result.result, error: null };
  }, [svg.state, settings]);

  React.useEffect(() => {
    setDismissedError(false);
  }, [conversion.error]);

  const filename = `${fileBaseName(settings.name)}.vue`;
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
      <Field label="Component name">
        <input
          type="text"
          value={settings.name}
          onChange={(e) => setField("name", e.target.value)}
          spellCheck={false}
          aria-label="Component name"
          placeholder="SvgIcon"
          className="h-8 w-44 rounded-md border border-border bg-background px-2.5 font-mono text-sm text-foreground outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>
      <Field label="Script" hint="<script setup> language">
        <SegmentedControl<Lang>
          value={settings.lang}
          onChange={(v) => setField("lang", v)}
          ariaLabel="Script setup language"
          size="sm"
          options={[
            { value: "ts", label: "TypeScript", icon: "FileType2" },
            { value: "js", label: "JavaScript", icon: "FileCode2" },
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
              Vue SFC{" "}
              <span className="font-mono text-xs text-muted-foreground">
                {settings.lang === "ts" ? "lang=\"ts\"" : "lang=\"js\""}
              </span>
            </span>
            <ToolbarDivider />
            <CopyButton getValue={() => conversion.code} label="Copy component" />
            <DownloadButton
              filename={filename}
              getValue={() => conversion.code}
              mime="text/plain;charset=utf-8"
              label="Download"
            />
            <ToolbarSpacer />
            {conversion.code ? (
              <>
                <StatBadge
                  label="File"
                  value={filename}
                  icon="FileCode2"
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
                ? "<!-- Fix the SVG above to generate a component. -->"
                : "<!-- The generated Vue SFC will appear here. -->")
            }
            readOnly
            label={`${fileBaseName(settings.name)}.vue, generated`}
            lineNumbers
            wrap={false}
            minHeight={260}
            ariaLabel="Generated Vue Single-File Component"
          />
        </div>
      )}
    </div>
  );
}
