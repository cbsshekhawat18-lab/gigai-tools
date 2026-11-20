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

/**
 * Indent style. We map the choice to the numeric `indent` that
 * {@link prettifySvg} accepts; "tab" is modelled as a single unit and the
 * result is post-processed so leading indentation uses real tab characters.
 */
type IndentStyle = "2" | "4" | "tab";

const INDENT_OPTIONS: ReadonlyArray<{ value: IndentStyle; label: string }> = [
  { value: "2", label: "2 spaces" },
  { value: "4", label: "4 spaces" },
  { value: "tab", label: "Tabs" },
];

/** UTF-8 byte length of a string (matches the engine's `utf8Bytes`). */
function utf8Length(input: string): number {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(input).length;
  return input.length;
}

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

/** Count lines in a string (0 for empty). */
function lineCount(input: string): number {
  if (!input) return 0;
  return input.split("\n").length;
}

/**
 * Convert the leading two-space indentation SVGO emits into tab characters,
 * one tab per two-space step. Only touches the run of leading whitespace on
 * each line, so spaces inside attributes or text are never disturbed.
 */
function spacesToTabs(source: string): string {
  return source
    .split("\n")
    .map((line) => {
      const match = /^( +)/.exec(line);
      if (!match) return line;
      const leading = match[1] ?? "";
      const tabs = "\t".repeat(Math.floor(leading.length / 2));
      const remainder = " ".repeat(leading.length % 2);
      return tabs + remainder + line.slice(leading.length);
    })
    .join("\n");
}

/** Curated sample SVGs so the empty state is one click from a real result. */
const EXAMPLES: ReadonlyArray<Example<string>> = [
  {
    label: "Minified icon (one line)",
    description: "A crammed single-line SVG to expand",
    value: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.9 5.8h6.1l-4.9 3.6 1.9 5.8-4.9-3.6-4.9 3.6 1.9-5.8L4 8.8h6.1z"/></svg>`,
  },
  {
    label: "Gradient badge (compact)",
    description: "Nested defs & gradient to indent",
    value: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#818cf8"/><stop offset="1" stop-color="#4338ca"/></linearGradient></defs><rect x="8" y="8" width="104" height="104" rx="24" fill="url(#g)"/><path d="M40 62 54 76 82 44" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    label: "Grouped logo (deep nesting)",
    description: "Multiple groups & clip-path to reveal",
    value: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><g clip-path="url(#c)"><g fill="#4f46e5"><rect x="8" y="8" width="48" height="48" rx="12"/></g><g fill="#fff"><path d="M22 32h20M32 22v20"/></g></g><defs><clipPath id="c"><rect width="64" height="64"/></clipPath></defs></svg>`,
  },
];

/** Keyboard shortcuts advertised in the help dialog (mod combos also fire in the editor). */
const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+z", description: "Undo" },
  { combo: "mod+shift+z", description: "Redo" },
  { combo: "mod+b", description: "Reset indent to 2 spaces" },
  { combo: "mod+shift+backspace", description: "Clear input" },
];

/**
 * SVG Prettifier, the readability companion to the Optimizer. It composes
 * {@link SvgWorkspace} (editable source, live checkerboard preview of the
 * OUTPUT, import/copy/download/reset/share toolbar, options slot) with the
 * `prettifySvg` engine.
 *
 * Formatting is async (SVGO's browser build lazy-loads, with a dependency-free
 * indenter fallback), so an effect re-runs it whenever the debounced input or
 * the indent style changes and stores the result, guarded by a monotonic run
 * id against races. `useHistory` gives real undo/redo on the source,
 * `useShareState` produces deep links, and `useShortcuts` wires the keyboard.
 * Everything runs in the browser; nothing is uploaded.
 */
export default function SvgPrettifierTool({ tool }: { tool: WorkspaceToolData }) {
  void tool;

  const history = useHistory<string>("", { debounceMs: 300 });
  const input = history.state;

  const [indent, setIndent] = React.useState<IndentStyle>("2");
  const [output, setOutput] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const share = useShareState({
    onInit: (value) => history.reset(value),
  });

  // Re-format whenever the source or indent changes. A monotonic run id makes
  // sure a slow async run can never overwrite a newer result.
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

    // Tabs are formatted at a 2-space base and then post-processed to tabs.
    const indentWidth = indent === "4" ? 4 : 2;

    prettifySvg(input, indentWidth)
      .then((result) => {
        if (runId !== runIdRef.current) return;
        if (result.ok) {
          setOutput(indent === "tab" ? spacesToTabs(result.result) : result.result);
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
  }, [input, indent]);

  const reset = React.useCallback(() => {
    history.reset("");
    setIndent("2");
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
      "mod+b": (e) => {
        e.preventDefault();
        setIndent("2");
      },
      "mod+shift+backspace": (e) => {
        e.preventDefault();
        history.reset("");
      },
    },
    { allowInInputs: true },
  );

  const hasInput = input.trim().length > 0;
  const showStats = hasInput && !error && output.length > 0;
  const beforeBytes = utf8Length(input);
  const afterBytes = utf8Length(output);
  const beforeLines = lineCount(input.trim());
  const afterLines = lineCount(output);

  const optionControls = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-6">
        <Field label="Indentation" hint="Match your project's style">
          <SegmentedControl<IndentStyle>
            value={indent}
            onChange={setIndent}
            options={INDENT_OPTIONS}
            ariaLabel="Indentation width"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        {showStats ? (
          <>
            <StatBadge
              label="Lines"
              value={`${beforeLines} → ${afterLines}`}
              icon="AlignLeft"
              tone="info"
            />
            <StatBadge
              label="Size"
              value={`${formatBytes(beforeBytes)} → ${formatBytes(afterBytes)}`}
              icon="FileText"
              tone="default"
            />
            <StatBadge
              label="Note"
              value="Readable, not smaller"
              icon="Info"
              tone="default"
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
                : "Add an SVG to beautify it into readable source."}
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
      {busy && hasInput && (
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
      placeholder="Paste minified or single-line SVG, drop a .svg file, or load a sample…"
      filename="prettified.svg"
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
