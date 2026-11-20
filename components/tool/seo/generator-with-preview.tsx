"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  CodePane,
  CopyButton,
  DownloadButton,
  ErrorBanner,
  ExamplesMenu,
  ShortcutsHelp,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarSpacer,
  useHistory,
  useShareState,
  useShortcuts,
  type Example,
  type ShortcutHint,
} from "@/components/tool/dev";

/**
 * The workhorse shell for SEO *generators* (meta tags, Open Graph, JSON-LD
 * schema, robots.txt, sitemaps, hreflang…). Left column is a form (supplied as
 * `children` / the `form` slot) driven by your own state `T`; the right column
 * shows the live generated CODE (read-only CodePane) plus an optional live
 * PREVIEW slot (SERP snippet, social card, etc.). The toolbar wires
 * Copy / Download / Reset / Share / Undo / Redo / Examples and keyboard
 * shortcuts, so a real generator is ~40–80 lines: manage `value`, pass a
 * `code` string, and render a preview.
 *
 * State is fully controlled by the parent (so the form and the generated code
 * stay in lockstep). This component owns undo/redo *for the value*, share-link
 * encode/decode, and the chrome; it never parses your data.
 */

/** Props for {@link GeneratorWithPreview}. */
export interface GeneratorWithPreviewProps<T> {
  /** Current form state (controlled). */
  value: T;
  /** Update form state. Every change becomes an undo step (coalesced). */
  onChange: (value: T) => void;
  /** The value to reset to (Reset button + `mod+shift+backspace`). */
  initialValue: T;
  /** The generated output string (code). You compute it from `value`. */
  code: string;
  /** Language hint for the output pane label, e.g. "HTML", "JSON-LD". */
  language?: string;
  /** The form UI (left column). */
  form: React.ReactNode;
  /** Optional live preview UI (right column, below the code). */
  preview?: React.ReactNode;
  /** Label above the preview slot. Default "Live preview". */
  previewLabel?: React.ReactNode;
  /** Suggested download filename. Default "output.txt". */
  downloadName?: string;
  /** Output MIME. Default "text/plain;charset=utf-8". */
  downloadMime?: string;
  /** Non-blocking error/warning surfaced above the panes. */
  error?: string | null;
  /**
   * Ready-made presets. Picking one calls `onChange(value)` (an undo step).
   * Values are `T`, so a preset restores the whole form at once.
   */
  examples?: ReadonlyArray<Example<T>>;
  /**
   * Serialize `value` for the share link (e.g. `JSON.stringify`). Provide this
   * plus `deserialize` to enable the Share button + inbound `#s=` restore.
   */
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T | null;
  /** Extra shortcut hints appended to the help dialog. */
  extraShortcuts?: ShortcutHint[];
  /** Extra toolbar controls (rendered right-aligned before the help button). */
  toolbarExtras?: React.ReactNode;
  /** Stats/badges row rendered under the toolbar. */
  stats?: React.ReactNode;
  className?: string;
}

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+c", description: "Copy output" },
  { combo: "mod+s", description: "Download output" },
  { combo: "mod+z", description: "Undo" },
  { combo: "mod+shift+z", description: "Redo" },
  { combo: "mod+shift+backspace", description: "Reset the form" },
];

export function GeneratorWithPreview<T>({
  value,
  onChange,
  initialValue,
  code,
  language = "Code",
  form,
  preview,
  previewLabel = "Live preview",
  downloadName = "output.txt",
  downloadMime = "text/plain;charset=utf-8",
  error,
  examples = [],
  serialize,
  deserialize,
  extraShortcuts = [],
  toolbarExtras,
  stats,
  className,
}: GeneratorWithPreviewProps<T>) {
  // Own the undo history for the value. The parent's `value` mirrors
  // `history.state`; changes flow parent → us on `onChange`, and undo/redo flow
  // us → parent via the same callback.
  const history = useHistory<T>(value);
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  // Keep our history in sync when the parent pushes a new value (e.g. a preset
  // handled outside, or a controlled reset). We compare by reference identity.
  React.useEffect(() => {
    if (!Object.is(value, history.state)) history.set(value);
    // Only react to external `value` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Propagate our history's current state up to the parent.
  React.useEffect(() => {
    if (!Object.is(history.state, value)) onChangeRef.current(history.state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.state]);

  const { copyShareLink, justCopied: linkCopied, shareError } = useShareState({
    onInit: (raw) => {
      if (!deserialize) return;
      const restored = deserialize(raw);
      if (restored !== null) history.replace(restored);
    },
  });

  const reset = React.useCallback(() => {
    history.set(initialValue);
  }, [history, initialValue]);

  const copyRef = React.useRef<HTMLButtonElement>(null);
  const downloadRef = React.useRef<HTMLButtonElement>(null);

  useShortcuts(
    {
      "mod+z": () => history.canUndo && history.undo(),
      "mod+shift+z": () => history.canRedo && history.redo(),
      "mod+shift+backspace": reset,
      "mod+s": () => downloadRef.current?.click(),
    },
    { allowInInputs: true },
  );

  const canShare = serialize !== undefined;
  const allShortcuts = React.useMemo(
    () => [...SHORTCUTS, ...extraShortcuts],
    [extraShortcuts],
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Toolbar>
        <ToolbarGroup>
          <CopyButton ref={copyRef} getValue={() => code} disabled={!code} />
          <DownloadButton
            ref={downloadRef}
            filename={downloadName}
            getValue={() => code}
            mime={downloadMime}
            disabled={!code}
          />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <ToolbarButton
            icon="Undo2"
            label="Undo"
            kbd="mod+z"
            onClick={history.undo}
            disabled={!history.canUndo}
          />
          <ToolbarButton
            icon="Redo2"
            label="Redo"
            kbd="mod+shift+z"
            onClick={history.redo}
            disabled={!history.canRedo}
          />
          <ToolbarButton
            icon="RotateCcw"
            label="Reset"
            variant="destructive"
            onClick={reset}
          />
        </ToolbarGroup>
        {canShare && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              icon={linkCopied ? "Check" : "Link"}
              label={linkCopied ? "Copied!" : "Share"}
              variant={linkCopied ? "active" : "default"}
              onClick={() => void copyShareLink(serialize!(history.state))}
            />
          </>
        )}
        {examples.length > 0 && (
          <>
            <ToolbarDivider />
            <ExamplesMenu<T>
              examples={examples}
              onPick={(v) => history.set(v)}
              label="Presets"
              heading="Load a preset"
            />
          </>
        )}
        <ToolbarSpacer />
        {toolbarExtras}
        <ShortcutsHelp shortcuts={allShortcuts} />
      </Toolbar>

      <ErrorBanner error={error ?? shareError} />

      {stats && <div className="flex flex-wrap items-center gap-2">{stats}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: form */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">{form}</div>

        {/* Right: code + preview */}
        <div className="flex min-w-0 flex-col gap-4">
          <CodePane
            value={code}
            readOnly
            label={`${language} output`}
            placeholder="Fill in the form to generate output."
            lineNumbers
            minHeight={200}
          />
          {preview && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 text-sm font-medium text-muted-foreground">
                {previewLabel}
              </div>
              {preview}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
