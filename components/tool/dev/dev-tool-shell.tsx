"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { CodePane } from "./code-pane";
import { CopyButton } from "./copy-button";
import { DownloadButton } from "./download-button";
import { ErrorBanner } from "./error-banner";
import { Example, ExamplesMenu } from "./examples-menu";
import { FileDropZone, useFileDrop } from "./file-drop";
import { ShortcutHint, ShortcutsHelp } from "./shortcuts-help";
import { StatBadge } from "./stat-badge";
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarSpacer,
} from "./toolbar";
import { useHistory } from "./use-history";
import { useShareState } from "./use-share-state";
import { useShortcuts } from "./use-shortcuts";

/** Result returned by a {@link TransformTool} `run` function. */
export interface RunResult {
  ok: boolean;
  /** Output text on success. */
  output?: string;
  /** Human-readable message on failure. */
  error?: string;
  /** 1-based error line for the banner + editor highlight. */
  errorLine?: number;
  /** 1-based error column. */
  errorCol?: number;
  /** Extra badges to show for this run (e.g. size delta, timing). */
  stats?: Array<{
    label?: React.ReactNode;
    value: React.ReactNode;
    tone?: "default" | "success" | "warning" | "danger" | "info";
    icon?: string;
  }>;
}

/** Props for {@link TransformTool}. */
export interface TransformToolProps<O = void> {
  /**
   * The transform. Called (debounced) whenever input or options change. Return
   * `{ ok, output }` or `{ ok: false, error }`. May be async; stale runs are
   * discarded automatically.
   */
  run: (input: string, options: O) => RunResult | Promise<RunResult>;
  /** Current tool options; changing this re-runs the transform. */
  options?: O;
  /** Initial input (overridden by a shared `#s=` link if present). */
  initialInput?: string;
  /** Labels for the two panes. */
  inputLabel?: React.ReactNode;
  outputLabel?: React.ReactNode;
  inputPlaceholder?: string;
  /** Suggested download filename for the output. Default "output.txt". */
  downloadName?: string;
  /** Output MIME for download. Default "text/plain;charset=utf-8". */
  downloadMime?: string;
  /** Sample inputs for the Examples menu. */
  examples?: ReadonlyArray<Example<string>>;
  /** Debounce before running, in ms. Default 250. */
  debounceMs?: number;
  /** Show line numbers in both panes. Default true. */
  lineNumbers?: boolean;
  /** Refuse to run past this many chars, showing a guard message. Default 2,000,000. */
  maxInputLength?: number;
  /** Tool-specific option controls rendered in the toolbar. */
  optionControls?: React.ReactNode;
  /** Extra shortcut hints appended to the built-in ones in the help dialog. */
  extraShortcuts?: ShortcutHint[];
  className?: string;
}

const BUILTIN_SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Run now" },
  { combo: "mod+z", description: "Undo" },
  { combo: "mod+shift+z", description: "Redo" },
  { combo: "mod+s", description: "Download output" },
  { combo: "mod+k", description: "Clear input" },
];

/**
 * The opinionated shell for input → output developer tools (formatters,
 * encoders, converters, minifiers). Handles the whole desktop-app chrome -
 * dual editor panes, toolbar (Copy / Download / Paste / Clear / Import / Share /
 * Undo / Redo / Shortcuts + an option-controls slot), debounced + cancellable
 * live runs, big-input guard, error banner with jump-to-line, stat badges,
 * examples, shareable URL state, and undo history, so a real tool is ~40-80
 * lines: just supply `run` and (optionally) `options` + `optionControls`.
 */
export function TransformTool<O = void>({
  run,
  options,
  initialInput = "",
  inputLabel = "Input",
  outputLabel = "Output",
  inputPlaceholder = "Paste or type here…",
  downloadName = "output.txt",
  downloadMime = "text/plain;charset=utf-8",
  examples = [],
  debounceMs = 250,
  lineNumbers = true,
  maxInputLength = 2_000_000,
  optionControls,
  extraShortcuts = [],
  className,
}: TransformToolProps<O>) {
  const history = useHistory(initialInput);
  const input = history.state;

  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [errorLine, setErrorLine] = React.useState<number | null>(null);
  const [errorCol, setErrorCol] = React.useState<number | null>(null);
  const [stats, setStats] = React.useState<RunResult["stats"]>([]);
  const [busy, setBusy] = React.useState(false);

  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const runToken = React.useRef(0);
  const runRef = React.useRef(run);
  runRef.current = run;

  const { copyShareLink, justCopied: linkCopied, shareError } = useShareState({
    onInit: (value) => history.replace(value),
  });

  const tooBig = input.length > maxInputLength;

  const execute = React.useCallback(
    async (value: string, opts: O) => {
      const token = ++runToken.current;
      if (value.length === 0) {
        setOutput("");
        setError(null);
        setErrorLine(null);
        setErrorCol(null);
        setStats([]);
        setBusy(false);
        return;
      }
      if (value.length > maxInputLength) {
        setOutput("");
        setError(
          `Input is ${value.length.toLocaleString()} characters, above the ${maxInputLength.toLocaleString()} limit for live processing.`,
        );
        setErrorLine(null);
        setStats([]);
        setBusy(false);
        return;
      }

      setBusy(true);
      try {
        const result = await runRef.current(value, opts);
        // Discard if a newer run started meanwhile.
        if (token !== runToken.current) return;
        if (result.ok) {
          setOutput(result.output ?? "");
          setError(null);
          setErrorLine(null);
          setErrorCol(null);
        } else {
          setOutput("");
          setError(result.error ?? "Something went wrong.");
          setErrorLine(result.errorLine ?? null);
          setErrorCol(result.errorCol ?? null);
        }
        setStats(result.stats ?? []);
      } catch (err) {
        if (token !== runToken.current) return;
        setOutput("");
        setError(err instanceof Error ? err.message : String(err));
        setErrorLine(null);
        setStats([]);
      } finally {
        if (token === runToken.current) setBusy(false);
      }
    },
    [maxInputLength],
  );

  // Debounced live run on input/options change.
  React.useEffect(() => {
    const handle = setTimeout(() => {
      void execute(input, options as O);
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [input, options, debounceMs, execute]);

  const runNow = React.useCallback(() => {
    void execute(input, options as O);
  }, [execute, input, options]);

  const clear = React.useCallback(() => {
    history.set("");
    inputRef.current?.focus();
  }, [history]);

  const paste = React.useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) history.set(text);
    } catch {
      inputRef.current?.focus();
    }
  }, [history]);

  const importFiles = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      file
        .text()
        .then((text) => history.set(text))
        .catch(() => setError("Couldn't read that file."));
    },
    [history],
  );

  const { isDragging, dropProps } = useFileDrop({ onFiles: importFiles });

  const jumpToLine = React.useCallback((line: number) => {
    const el = inputRef.current;
    if (!el) return;
    const lines = el.value.split("\n");
    let pos = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
      pos += (lines[i]?.length ?? 0) + 1;
    }
    el.focus();
    el.setSelectionRange(pos, pos);
  }, []);

  useShortcuts({
    "mod+enter": runNow,
    "mod+z": () => history.canUndo && history.undo(),
    "mod+shift+z": () => history.canRedo && history.redo(),
    "mod+k": clear,
  });

  const allShortcuts = React.useMemo(
    () => [...BUILTIN_SHORTCUTS, ...extraShortcuts],
    [extraShortcuts],
  );

  const bannerError = error ?? shareError;

  return (
    <div className={cn("relative flex flex-col gap-3", className)} {...dropProps}>
      <Toolbar>
        <ToolbarGroup>
          <CopyButton getValue={() => output} disabled={!output} />
          <DownloadButton
            filename={downloadName}
            getValue={() => output}
            mime={downloadMime}
            disabled={!output}
          />
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <ToolbarButton icon="ClipboardPaste" label="Paste" onClick={paste} />
          <ToolbarButton
            icon="Trash2"
            label="Clear"
            kbd="mod+k"
            variant="destructive"
            onClick={clear}
            disabled={!input}
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
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <ToolbarButton
            icon={linkCopied ? "Check" : "Link"}
            label={linkCopied ? "Copied" : "Share"}
            variant={linkCopied ? "active" : "default"}
            onClick={() => void copyShareLink(input)}
            disabled={!input}
          />
          {examples.length > 0 && (
            <ExamplesMenu examples={examples} onPick={(value) => history.set(value)} />
          )}
        </ToolbarGroup>

        {optionControls && (
          <>
            <ToolbarSpacer />
            <ToolbarGroup className="gap-2">{optionControls}</ToolbarGroup>
          </>
        )}
        <ToolbarSpacer />
        <ShortcutsHelp shortcuts={allShortcuts} />
      </Toolbar>

      <ErrorBanner
        error={bannerError}
        line={errorLine}
        col={errorCol}
        onJumpToLine={jumpToLine}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <CodePane
          ref={inputRef}
          value={input}
          onChange={(v) => history.set(v)}
          label={inputLabel}
          placeholder={inputPlaceholder}
          lineNumbers={lineNumbers}
          errorLine={errorLine}
          onDropText={(text) => history.set(text)}
        />
        <CodePane
          value={output}
          readOnly
          label={
            <span className="flex items-center gap-2">
              {outputLabel}
              {busy && <span className="text-[10px] uppercase tracking-wide opacity-70">running…</span>}
            </span>
          }
          placeholder="Output appears here."
          lineNumbers={lineNumbers}
        />
      </div>

      {(stats && stats.length > 0) || tooBig ? (
        <div className="flex flex-wrap items-center gap-2">
          {tooBig && (
            <StatBadge tone="warning" icon="TriangleAlert" value="Input too large" />
          )}
          {stats?.map((s, i) => (
            <StatBadge
              key={i}
              label={s.label}
              value={s.value}
              tone={s.tone}
              icon={s.icon}
            />
          ))}
        </div>
      ) : null}

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-xl border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[2px]">
          <FileDropZone
            onFiles={importFiles}
            label="Drop a file to load it as input"
            className="pointer-events-none border-none bg-transparent"
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/*  GeneratorTool                                                            */
/* ------------------------------------------------------------------------- */

/** A generated result: text lines and/or an image data URL. */
export interface GeneratedValue {
  /** Lines of text output (each shown on its own row, individually copyable). */
  text?: string[];
  /** Data URL for image output (QR codes, barcodes). */
  imageUrl?: string;
  /** Alt text for the image. */
  imageAlt?: string;
  /** Raw text for the "copy all" / download action (defaults to text joined). */
  raw?: string;
}

/** Props for {@link GeneratorTool}. */
export interface GeneratorToolProps {
  /** Produce a value from the current options. May be async. */
  generate: () => GeneratedValue | Promise<GeneratedValue>;
  /** Option controls panel (steppers, toggles, selects). */
  options?: React.ReactNode;
  /** Run once on mount. Default true. */
  autoGenerate?: boolean;
  /** Label on the primary action. Default "Generate". */
  actionLabel?: string;
  /** Download filename. Default "output.txt". */
  downloadName?: string;
  downloadMime?: string;
  /** Keep the last N generated results as history. Default 20; 0 disables. */
  historySize?: number;
  /** Heading above the output. */
  outputLabel?: React.ReactNode;
  /**
   * Serialized options string to encode in a shareable link (e.g.
   * `JSON.stringify(opts)`). When provided, a "Share options" button appears and
   * the encoded value is exposed to `onShareInit` on mount so the tool can
   * restore its options from an inbound link.
   */
  shareValue?: string;
  /** Called on mount with any shared options string from the URL. */
  onShareInit?: (value: string) => void;
  className?: string;
}

/**
 * The opinionated shell for output-only generators (UUID, nanoid, password, QR,
 * barcode, hash-from-text). Renders an options panel, a Generate/Regenerate
 * action, a text-or-image output, Copy/Download, an optional Share-options
 * link, and a scrollable history of previously generated values. A real
 * generator is ~40-80 lines: supply `generate` and an `options` panel.
 */
export function GeneratorTool({
  generate,
  options,
  autoGenerate = true,
  actionLabel = "Generate",
  downloadName = "output.txt",
  downloadMime = "text/plain;charset=utf-8",
  historySize = 20,
  outputLabel = "Output",
  shareValue,
  onShareInit,
  className,
}: GeneratorToolProps) {
  const [current, setCurrent] = React.useState<GeneratedValue | null>(null);
  const [past, setPast] = React.useState<GeneratedValue[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const generateRef = React.useRef(generate);
  generateRef.current = generate;

  const rawOf = React.useCallback(
    (v: GeneratedValue) => v.raw ?? v.text?.join("\n") ?? v.imageUrl ?? "",
    [],
  );

  const run = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const value = await generateRef.current();
      setCurrent((prev) => {
        if (prev && historySize > 0) {
          setPast((p) => [prev, ...p].slice(0, historySize));
        }
        return value;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [historySize]);

  React.useEffect(() => {
    if (autoGenerate) void run();
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentRaw = current ? rawOf(current) : "";

  const { copyShareLink, justCopied: linkCopied, shareError } = useShareState({
    onInit: onShareInit,
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {options && (
        <div className="rounded-lg border border-border bg-card/60 p-4">{options}</div>
      )}

      <Toolbar>
        <ToolbarButton
          icon="RefreshCw"
          label={current ? "Regenerate" : actionLabel}
          variant="primary"
          loading={busy}
          onClick={() => void run()}
        />
        <ToolbarDivider />
        <CopyButton getValue={() => currentRaw} disabled={!currentRaw} label="Copy all" />
        <DownloadButton
          filename={downloadName}
          getValue={() => currentRaw}
          mime={downloadMime}
          disabled={!currentRaw}
        />
        {shareValue !== undefined && (
          <ToolbarButton
            icon={linkCopied ? "Check" : "Link"}
            label={linkCopied ? "Copied" : "Share options"}
            variant={linkCopied ? "active" : "default"}
            onClick={() => void copyShareLink(shareValue)}
          />
        )}
      </Toolbar>

      <ErrorBanner error={error ?? shareError} />

      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-muted-foreground">
          {outputLabel}
        </div>
        <div className="p-4">
          {current?.imageUrl ? (
            <div className="flex justify-center">
              {/* Data-URL image (QR/barcode); next/image not usable for dynamic data URLs in static export. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.imageUrl}
                alt={current.imageAlt ?? "Generated image"}
                className="max-h-72 max-w-full rounded-md bg-white p-2"
              />
            </div>
          ) : current?.text && current.text.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {current.text.map((line, i) => (
                <GeneratedRow key={`${i}-${line}`} value={line} />
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing generated yet.
            </p>
          )}
        </div>
      </div>

      {historySize > 0 && past.length > 0 && (
        <details className="rounded-lg border border-border bg-card/40">
          <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-muted-foreground">
            History ({past.length})
          </summary>
          <ul className="max-h-56 overflow-y-auto border-t border-border p-2">
            {past.map((v, i) => (
              <li key={i} className="px-1 py-0.5">
                <GeneratedRow value={rawOf(v)} muted />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/** A single output row with an inline copy affordance. */
function GeneratedRow({ value, muted = false }: { value: string; muted?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  const isImage = value.startsWith("data:image");
  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-3 rounded-md px-2.5 py-1.5",
        muted ? "hover:bg-muted/60" : "bg-muted/40 hover:bg-muted/70",
      )}
    >
      <code
        className={cn(
          "min-w-0 flex-1 truncate font-mono text-sm",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {isImage ? "[image]" : value}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy value"} title={copied ? "Copied" : "Copy value"}
        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 outline-none transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
      >
        <Icon name={copied ? "Check" : "Copy"} size={14} />
      </button>
    </div>
  );
}
