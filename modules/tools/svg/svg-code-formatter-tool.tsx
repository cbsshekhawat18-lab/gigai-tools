"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { cn } from "@/lib/utils";
import {
  Field,
  SegmentedControl,
  ToolbarButton,
  ExamplesMenu,
  ShortcutsHelp,
  StatBadge,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";
import { SvgWorkspace } from "@/components/tool/svg";
import { prettifySvg } from "@/lib/svg-tools/optimize";

/** Indent unit choices. Spaces map to a width; "tab" reflows with a tab char. */
type IndentUnit = "2" | "4" | "tab";

const INDENT_OPTIONS = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tabs" },
] as const satisfies ReadonlyArray<{ value: IndentUnit; label: string }>;

const DEFAULT_INDENT: IndentUnit = "2";

/** Human-readable byte size, e.g. 1.2 KB. */
function formatBytes(n: number): string {
  if (n < 1024) return `${Math.max(0, Math.round(n))} B`;
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

/** UTF-8 byte length (matches the engine's utf8Bytes for display parity). */
function utf8Bytes(input: string): number {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(input).length;
  return unescape(encodeURIComponent(input)).length;
}

/**
 * SVGO's prettify pass indents with spaces only. To honor a "Tabs" choice we
 * convert the leading run of spaces on each line to tabs after formatting.
 * `spacesPerLevel` is the width prettify used so we can group them correctly.
 */
function retabLeadingIndent(svg: string, spacesPerLevel: number): string {
  const per = Math.max(1, spacesPerLevel);
  return svg
    .split("\n")
    .map((line) => {
      const match = /^( +)/.exec(line);
      if (!match) return line;
      const spaces = match[1] ?? "";
      const levels = Math.floor(spaces.length / per);
      const remainder = spaces.length - levels * per;
      return "\t".repeat(levels) + " ".repeat(remainder) + line.slice(spaces.length);
    })
    .join("\n");
}

/** Curated sample SVGs so the empty state is one click from a real result. */
const EXAMPLES: ReadonlyArray<Example<string>> = [
  {
    label: "Minified one-liner",
    description: "A single-line icon expanded into a readable tree",
    value: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`,
  },
  {
    label: "Gradient card",
    description: "Nested defs, gradient and shapes to indent",
    value: `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#4338ca"/></linearGradient></defs><rect x="10" y="10" width="140" height="140" rx="28" fill="url(#g)"/><circle cx="80" cy="80" r="34" fill="#ffffff" fill-opacity="0.9"/><path d="M64 80 76 92 100 66" fill="none" stroke="#4338ca" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    label: "Group-nested badge",
    description: "Multiple nesting levels and a title to preserve",
    value: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><title>Shield badge</title><g id="badge"><g id="frame"><path d="M60 8 100 24 100 60C100 88 82 104 60 112C38 104 20 88 20 60L20 24Z" fill="#4f46e5"/></g><g id="mark"><path d="M44 60 54 72 78 44" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g></g></svg>`,
  },
];

/** Keyboard shortcuts advertised in the help dialog. */
const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+z", description: "Undo" },
  { combo: "mod+shift+z", description: "Redo" },
  { combo: "mod+1", description: "Indent with 2 spaces" },
  { combo: "mod+2", description: "Indent with 4 spaces" },
  { combo: "mod+0", description: "Indent with tabs" },
  { combo: "mod+shift+backspace", description: "Clear input" },
];

/**
 * SVG Code Formatter, a clean-code pass for SVG source. It composes
 * {@link SvgWorkspace} (editable source, live checkerboard preview of the
 * FORMATTED output, import/copy/download/reset/share toolbar, options slot) with
 * the `prettifySvg` engine, which re-indents markup without dropping data.
 *
 * Formatting is async (SVGO's browser build lazy-loads, with a dependency-free
 * indenter fallback), so a guarded effect re-runs it whenever the debounced
 * input or indent unit changes. Tabs are honored by post-converting the leading
 * space run per line. `useHistory` gives real undo/redo, `useShareState`
 * produces deep links, and `useShortcuts` wires the keyboard. Everything runs in
 * the browser; nothing is uploaded.
 */
export default function SvgCodeFormatterTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 300 });
  const input = history.state;

  const [indent, setIndent] = React.useState<IndentUnit>(DEFAULT_INDENT);
  const [output, setOutput] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  // Re-format whenever the source or the indent unit changes. A monotonic run
  // id guards against a slow run overwriting a newer result.
  const runIdRef = React.useRef(0);
  React.useEffect(() => {
    const source = input.trim();
    if (!source) {
      setOutput("");
      setError(null);
      setBusy(false);
      return;
    }

    const runId = ++runIdRef.current;
    setBusy(true);

    // Prettify always indents with spaces; the width we ask for is the width we
    // re-tab against when the user chose tabs.
    const spacesPerLevel = indent === "4" ? 4 : 2;

    prettifySvg(input, spacesPerLevel)
      .then((result) => {
        if (runId !== runIdRef.current) return;
        if (result.ok) {
          const formatted =
            indent === "tab"
              ? retabLeadingIndent(result.result, 2)
              : result.result;
          setOutput(formatted);
          setError(null);
        } else {
          setOutput("");
          setError(result.error.message);
        }
      })
      .catch(() => {
        if (runId !== runIdRef.current) return;
        setOutput("");
        setError("Couldn't format this SVG. Check that it's valid markup.");
      })
      .finally(() => {
        if (runId === runIdRef.current) setBusy(false);
      });
    // For tabs we always ask prettify for 2-space indent, then re-tab.
     
  }, [input, indent]);

  const reset = React.useCallback(() => {
    history.reset("");
    setIndent(DEFAULT_INDENT);
  }, [history]);

  const handleShare = React.useCallback(() => {
    if (input) void share.copyShareLink(input);
  }, [input, share]);

  useShortcuts(
    {
      "mod+z": (e) => {
        e.preventDefault();
        history.undo();
      },
      "mod+shift+z": (e) => {
        e.preventDefault();
        history.redo();
      },
      "mod+y": (e) => {
        e.preventDefault();
        history.redo();
      },
      "mod+1": (e) => {
        e.preventDefault();
        setIndent("2");
      },
      "mod+2": (e) => {
        e.preventDefault();
        setIndent("4");
      },
      "mod+0": (e) => {
        e.preventDefault();
        setIndent("tab");
      },
      "mod+shift+backspace": (e) => {
        e.preventDefault();
        history.reset("");
      },
    },
    { allowInInputs: true },
  );

  const inBytes = input.trim() ? utf8Bytes(input) : 0;
  const outBytes = output ? utf8Bytes(output) : 0;
  const lineCount = output ? output.split("\n").length : 0;

  const optionControls = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <Field label="Indentation" hint="Match your project's style">
          <SegmentedControl<IndentUnit>
            value={indent}
            onChange={setIndent}
            options={INDENT_OPTIONS}
            ariaLabel="Indent unit"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        {output ? (
          <>
            <StatBadge
              label="Input"
              value={formatBytes(inBytes)}
              icon="FileInput"
              tone="default"
            />
            <StatBadge
              label="Formatted"
              value={formatBytes(outBytes)}
              icon="FileOutput"
              tone="info"
            />
            <StatBadge
              label="Lines"
              value={String(lineCount)}
              icon="AlignLeft"
              tone="default"
            />
            <StatBadge
              value="Whitespace-only · data preserved"
              icon="ShieldCheck"
              tone="success"
            />
          </>
        ) : (
          <span
            className={cn(
              "text-xs",
              error ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {error
              ? error
              : busy
                ? "Formatting…"
                : "Add an SVG to format it into clean, indented source."}
          </span>
        )}
      </div>
    </div>
  );

  const toolbarExtra = (
    <>
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
      <ExamplesMenu examples={EXAMPLES} onPick={(value) => history.set(value)} />
      <ShortcutsHelp shortcuts={SHORTCUTS} />
      {busy && input.trim() && (
        <StatBadge value="Formatting…" icon="Loader" tone="info" />
      )}
    </>
  );

  return (
    <SvgWorkspace
      input={input}
      onInputChange={(v) => history.set(v)}
      output={error ? input : output || input}
      inputLabel="SVG source"
      placeholder="Paste minified or messy SVG markup, drop a .svg file, or load a sample…"
      filename="formatted.svg"
      copyTarget="output"
      options={optionControls}
      toolbarExtra={toolbarExtra}
      onReset={reset}
      onShare={handleShare}
      shareJustCopied={share.justCopied}
      emptyLabel="Formatted SVG preview appears here"
    />
  );
}
