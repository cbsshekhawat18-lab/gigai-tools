/**
 * GigAI Workspace, the DEVELOPER WORKSPACE (client island).
 *
 * A code SCRATCHPAD that chains developer transforms on ONE text buffer. Paste
 * code in, or drop / open a text file (.json / .js / .ts / .css / .html / .yaml
 * /.xml /.md …). The whole page is a drop target via the shared window-level
 * drop guard, so a stray drop never navigates the tab away. A left rail lists
 * the operations, the centre is an editable monospace buffer, the right panel
 * holds each operation's options, and a bottom bar runs / undoes / copies /
 * downloads.
 *
 * Unlike the per-file image/PDF pipeline, developer work is a sequence of pure
 * TEXT → TEXT transforms on a single buffer, so this screen intentionally does
 * NOT mount the generic <WorkspaceShell> (built around a per-file <img> preview
 * + asset pipeline). Instead it adapts the same visual language: a left rail,
 * a centre canvas, a right options panel, a bottom action bar, undo/redo -
 * around ONE working buffer.
 *
 * REUSE, DON'T REIMPLEMENT. Every transform calls an existing client-side
 * engine, dynamic-imported INSIDE the handler so the heavy deps (prettier,
 * terser, csso, js-yaml, spark-md5) never weigh on the initial bundle:
 *   • Format/Beautify → formatCode / formatXml       (lib/dev/format)
 *   • Minify          → minifyJs / minifyCss / minifyHtml / minifyJson
 *                                                     (lib/dev/minify, lib/dev/json)
 *   • JSON ↔ YAML     → jsonToYaml / yamlToJson       (lib/dev/yaml)
 *   • JSON → TS types → jsonToTypeScript              (lib/dev/jsonToTs)
 *   • Encode/Decode   → base64Encode/Decode, urlEncode/Decode (lib/dev/encode)
 *   • Hash            → hashText                        (lib/dev/hash)
 *   • Escape/Unescape → local, dependency-free string-literal transforms.
 *
 * HONEST LIMITS (surfaced in the UI, never faked):
 *  • It operates on TEXT, not binary files, dropping an image/pdf won't work.
 *   • Everything runs in your browser; nothing is uploaded.
 *   • Prettier / terser load a WASM-free but sizeable module the first time you
 *     use them, so the first Format/Minify is slower than later ones.
 *   • Hashing REPLACES the buffer with the digest (it's one-way, not reversible
 *  by Unescape/undo of the source, but the undo history restores the text).
 *   • Undo/redo lives in memory; a page reload starts fresh.
 */

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { useFileDrop } from "@/lib/workspace/use-file-drop";
import { Button } from "@/components/ui/button";
import { DropOverlay } from "@/components/workspace/drop-overlay";

/* ── Types ──────────────────────────────────────────────────────────────── */

/** The catalogue of transforms the left rail offers. */
type OpId =
  | "format"
  | "minify"
  | "yaml"
  | "jsonToTs"
  | "encode"
  | "hash"
  | "escape";

/** Languages Prettier / our formatter handle here. */
type FormatLang = "json" | "js" | "ts" | "css" | "html" | "yaml" | "markdown" | "xml";
/** Languages the minifier handles. */
type MinifyLang = "js" | "css" | "html" | "json";
/** Direction of a JSON ↔ YAML conversion. */
type YamlDir = "jsonToYaml" | "yamlToJson";
/** Encode/decode variants. */
type EncodeVariant = "base64Encode" | "base64Decode" | "urlEncode" | "urlDecode";
/** Hash algorithms (mirrors lib/dev/hash HashAlgo). */
type HashAlgo = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
/** Escape/unescape direction. */
type EscapeDir = "escape" | "unescape";

/** All per-operation options, held in one object so the right panel is simple. */
interface Options {
  formatLang: FormatLang;
  indent: number;
  minifyLang: MinifyLang;
  yamlDir: YamlDir;
  rootName: string;
  encodeVariant: EncodeVariant;
  hashAlgo: HashAlgo;
  escapeDir: EscapeDir;
}

const DEFAULT_OPTIONS: Options = {
  formatLang: "json",
  indent: 2,
  minifyLang: "js",
  yamlDir: "jsonToYaml",
  rootName: "Root",
  encodeVariant: "base64Encode",
  hashAlgo: "SHA-256",
  escapeDir: "escape",
};

/** A transform's outcome, either new buffer text, or a positioned error. */
type RunResult =
  | { ok: true; text: string; note?: string }
  | { ok: false; message: string; line?: number; column?: number };

interface OpMeta {
  id: OpId;
  icon: string;
  label: string;
  hint: string;
}

const OPERATIONS: OpMeta[] = [
  { id: "format", icon: "Sparkles", label: "Format / Beautify", hint: "Prettier + XML pretty-print" },
  { id: "minify", icon: "Minimize2", label: "Minify", hint: "terser · csso · JSON · HTML" },
  { id: "yaml", icon: "ArrowRightLeft", label: "JSON ↔ YAML", hint: "Convert between formats" },
  { id: "jsonToTs", icon: "Braces", label: "JSON → TS types", hint: "Infer TypeScript interfaces" },
  { id: "encode", icon: "Binary", label: "Encode / Decode", hint: "Base64 · URL" },
  { id: "hash", icon: "Hash", label: "Hash", hint: "MD5 · SHA-1/256/384/512" },
  { id: "escape", icon: "Quote", label: "Escape / Unescape", hint: "String-literal escaping" },
];

/* ── Helpers ────────────────────────────────────────────────────────────── */

/** File extensions we treat as editable text. */
const TEXT_EXT =
  /\.(txt|json|jsonc|json5|js|jsx|mjs|cjs|ts|tsx|css|scss|less|html?|xml|svg|ya?ml|md|markdown|csv|tsv|toml|ini|env|sql|sh|py|rb|go|rs|java|c|h|cpp|toml)$/i;

function looksLikeText(file: File): boolean {
  if (file.type.startsWith("text/")) return true;
  if (/(json|javascript|xml|yaml|html|css|markdown|typescript)/i.test(file.type)) return true;
  return TEXT_EXT.test(file.name);
}

/** Guess a good default Format language from a filename. */
function langFromName(name: string): FormatLang | null {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  const ext = m?.[1]?.toLowerCase();
  switch (ext) {
    case "json":
    case "jsonc":
    case "json5":
      return "json";
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "js";
    case "ts":
    case "tsx":
      return "ts";
    case "css":
    case "scss":
    case "less":
      return "css";
    case "html":
    case "htm":
      return "html";
    case "xml":
    case "svg":
      return "xml";
    case "yaml":
    case "yml":
      return "yaml";
    case "md":
    case "markdown":
      return "markdown";
    default:
      return null;
  }
}

/** UTF-8 byte length (matches on-the-wire size shown in the status bar). */
function byteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** Trigger a browser download for text without leaking the object URL. */
function downloadText(text: string, name: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Escape a string into a JS/JSON string-literal body (no surrounding quotes). */
function escapeLiteral(src: string): string {
  // JSON.stringify handles quotes, backslashes, control chars, unicode safely;
  // strip the wrapping quotes to yield just the escaped body.
  const json = JSON.stringify(src);
  return json.slice(1, -1);
}

/** Reverse escapeLiteral: interpret backslash escapes back into raw text. */
function unescapeLiteral(src: string): string {
  // JSON.parse decodes \n \t \uXXXX \" \\ etc. for us. The source is a literal
  // BODY (no surrounding quotes), so before wrapping we must:
  //   • escape any raw (unescaped) double-quotes so they don't close the string,
  //   • escape raw control chars (newlines/tabs) that are illegal inside a JSON
  //  string: a user pasting a real newline still means "a newline".
  // A backslash counts as escaped only if preceded by an even run of backslashes.
  const prepared = src
    .replace(/(?<!\\)((?:\\\\)*)"/g, '$1\\"')
    .replace(/(?<!\\)((?:\\\\)*)\n/g, "$1\\n")
    .replace(/(?<!\\)((?:\\\\)*)\r/g, "$1\\r")
    .replace(/(?<!\\)((?:\\\\)*)\t/g, "$1\\t");
  return JSON.parse(`"${prepared}"`) as string;
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function DeveloperWorkspace() {
  const [buffer, setBuffer] = React.useState("");
  const [history, setHistory] = React.useState<string[]>([]);
  const [future, setFuture] = React.useState<string[]>([]);

  const [activeOp, setActiveOp] = React.useState<OpId>("format");
  const [opts, setOpts] = React.useState<Options>(DEFAULT_OPTIONS);

  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<{ message: string; line?: number; column?: number } | null>(null);
  const [copied, setCopied] = React.useState(false);

  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const setOption = React.useCallback(<K extends keyof Options>(key: K, value: Options[K]) => {
    setOpts((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Replace the buffer, pushing the old text onto the undo stack. */
  const commit = React.useCallback((next: string) => {
    setBuffer((prev) => {
      setHistory((h) => [...h, prev]);
      return next;
    });
    setFuture([]);
  }, []);

  /* ── File input (drop / open) ─────────────────────────────────────────── */

  const loadFile = React.useCallback(
    async (file: File) => {
      if (!looksLikeText(file)) {
        setError({
          message: `"${file.name}" doesn't look like a text file. This workspace edits text, not binary files.`,
        });
        return;
      }
      // 20 MB soft ceiling: beyond this the tab gets sluggish; be honest.
      if (file.size > 20 * 1024 * 1024) {
        setError({ message: "That file is over 20 MB: too large to edit smoothly in the browser." });
        return;
      }
      setBusy(true);
      setError(null);
      setStatus("Reading file…");
      try {
        const text = await file.text();
        commit(text);
        setFileName(file.name);
        const lang = langFromName(file.name);
        if (lang) {
          setActiveOp("format");
          setOpts((prev) => ({
            ...prev,
            formatLang: lang,
            ...(lang === "js" || lang === "css" || lang === "html" || lang === "json"
              ? { minifyLang: lang as MinifyLang }
              : {}),
          }));
        }
      } catch {
        setError({ message: "Couldn't read that file as text." });
      } finally {
        setBusy(false);
        setStatus(null);
      }
    },
    [commit],
  );

  const { isDragging } = useFileDrop((files) => {
    const first = files[0];
    if (first) void loadFile(first);
  });

  /* ── Transform runners (each reuses an existing engine) ───────────────── */

  const runFormat = React.useCallback(async (): Promise<RunResult> => {
    if (opts.formatLang === "xml") {
      const { formatXml } = await import("@/lib/dev/format");
      const res = await formatXml(buffer, { indent: opts.indent });
      return res.ok ? { ok: true, text: res.result } : { ok: false, ...res.error };
    }
    const { formatCode } = await import("@/lib/dev/format");
    const res = await formatCode(buffer, opts.formatLang, { tabWidth: opts.indent });
    return res.ok ? { ok: true, text: res.result } : { ok: false, ...res.error };
  }, [buffer, opts.formatLang, opts.indent]);

  const runMinify = React.useCallback(async (): Promise<RunResult> => {
    if (opts.minifyLang === "json") {
      const { minifyJson } = await import("@/lib/dev/json");
      const res = minifyJson(buffer);
      return res.ok ? { ok: true, text: res.result } : { ok: false, ...res.error };
    }
    const mod = await import("@/lib/dev/minify");
    const res =
      opts.minifyLang === "js"
        ? await mod.minifyJs(buffer)
        : opts.minifyLang === "css"
          ? await mod.minifyCss(buffer)
          : await mod.minifyHtml(buffer);
    if (!res.ok) return { ok: false, ...res.error };
    return {
      ok: true,
      text: res.result,
      note: `${formatBytes(res.stats.before)} → ${formatBytes(res.stats.after)} (−${res.stats.savedPct}%)`,
    };
  }, [buffer, opts.minifyLang]);

  const runYaml = React.useCallback(async (): Promise<RunResult> => {
    const mod = await import("@/lib/dev/yaml");
    const res =
      opts.yamlDir === "jsonToYaml"
        ? await mod.jsonToYaml(buffer, { indent: opts.indent })
        : await mod.yamlToJson(buffer, { indent: opts.indent });
    return res.ok ? { ok: true, text: res.result } : { ok: false, ...res.error };
  }, [buffer, opts.yamlDir, opts.indent]);

  const runJsonToTs = React.useCallback(async (): Promise<RunResult> => {
    const { jsonToTypeScript } = await import("@/lib/dev/jsonToTs");
    const res = jsonToTypeScript(buffer, opts.rootName || "Root");
    return res.ok ? { ok: true, text: res.code } : { ok: false, ...res.error };
  }, [buffer, opts.rootName]);

  const runEncode = React.useCallback(async (): Promise<RunResult> => {
    const mod = await import("@/lib/dev/encode");
    const res =
      opts.encodeVariant === "base64Encode"
        ? mod.base64Encode(buffer)
        : opts.encodeVariant === "base64Decode"
          ? mod.base64Decode(buffer)
          : opts.encodeVariant === "urlEncode"
            ? mod.urlEncode(buffer)
            : mod.urlDecode(buffer);
    return res.ok ? { ok: true, text: res.result } : { ok: false, message: res.error.message };
  }, [buffer, opts.encodeVariant]);

  const runHash = React.useCallback(async (): Promise<RunResult> => {
    const { hashText } = await import("@/lib/dev/hash");
    const digest = await hashText(buffer, opts.hashAlgo);
    return { ok: true, text: digest, note: `${opts.hashAlgo} · one-way (undo restores the source)` };
  }, [buffer, opts.hashAlgo]);

  const runEscape = React.useCallback(async (): Promise<RunResult> => {
    try {
      const text = opts.escapeDir === "escape" ? escapeLiteral(buffer) : unescapeLiteral(buffer);
      return { ok: true, text };
    } catch {
      return { ok: false, message: "That text isn't a valid escaped string literal." };
    }
  }, [buffer, opts.escapeDir]);

  const RUNNERS: Record<OpId, () => Promise<RunResult>> = {
    format: runFormat,
    minify: runMinify,
    yaml: runYaml,
    jsonToTs: runJsonToTs,
    encode: runEncode,
    hash: runHash,
    escape: runEscape,
  };

  const run = React.useCallback(async () => {
    if (busy) return;
    if (buffer.trim() === "") {
      setError({ message: "The buffer is empty: paste some code or open a file first." });
      return;
    }
    setBusy(true);
    setError(null);
    setStatus(`Running ${OPERATIONS.find((o) => o.id === activeOp)?.label ?? "transform"}…`);
    try {
      const result = await RUNNERS[activeOp]();
      if (result.ok) {
        commit(result.text);
        setStatus(result.note ?? "Done");
        // Clear a transient "Done" note shortly after.
        window.setTimeout(() => setStatus((s) => (s === (result.note ?? "Done") ? null : s)), 2400);
      } else {
        setError({ message: result.message, line: result.line, column: result.column });
        setStatus(null);
      }
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : "That transform failed." });
      setStatus(null);
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, buffer, activeOp, commit, runFormat, runMinify, runYaml, runJsonToTs, runEncode, runHash, runEscape]);

  /* ── History ──────────────────────────────────────────────────────────── */

  const undo = React.useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1]!;
      setBuffer((cur) => {
        setFuture((f) => [cur, ...f]);
        return prev;
      });
      setError(null);
      return h.slice(0, -1);
    });
  }, []);

  const redo = React.useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0]!;
      setBuffer((cur) => {
        setHistory((h) => [...h, cur]);
        return next;
      });
      setError(null);
      return f.slice(1);
    });
  }, []);

  const clearAll = React.useCallback(() => {
    setBuffer("");
    setHistory([]);
    setFuture([]);
    setFileName(null);
    setError(null);
    setStatus(null);
  }, []);

  const copy = React.useCallback(async () => {
    if (!buffer) return;
    try {
      await navigator.clipboard.writeText(buffer);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError({ message: "Clipboard access was blocked by the browser." });
    }
  }, [buffer]);

  // Keyboard: ⌘/Ctrl+Enter runs, ⌘/Ctrl+Z undo, ⇧⌘/Ctrl+Z redo.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "Enter") {
        e.preventDefault();
        void run();
      } else if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, undo, redo]);

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;
  const lines = buffer === "" ? 0 : buffer.split("\n").length;
  const bytes = byteLength(buffer);
  const activeMeta = OPERATIONS.find((o) => o.id === activeOp)!;

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className="relative flex h-[min(82vh,940px)] min-h-[600px] w-full flex-col overflow-hidden max-md:h-auto max-md:min-h-0 max-md:overflow-visible rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <DropOverlay show={isDragging} label="Drop a text file to load it" />

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon name="Code2" size={16} />
          </span>
          <h2 className="truncate text-sm font-semibold">Developer Workspace</h2>
          {fileName ? (
            <span className="hidden truncate text-xs text-muted-foreground sm:inline">· {fileName}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={!canUndo || busy}
            onClick={undo}
            aria-label="Undo"
            title="Undo (⌘Z)"
          >
            <Icon name="Undo2" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canRedo || busy}
            onClick={redo}
            aria-label="Redo"
            title="Redo (⇧⌘Z)"
          >
            <Icon name="Redo2" size={16} />
          </Button>
          <div className="mx-1 h-5 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon"
            disabled={!buffer}
            onClick={copy}
            aria-label="Copy"
            title="Copy to clipboard"
          >
            <Icon name={copied ? "Check" : "Copy"} size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!buffer}
            onClick={() => downloadText(buffer, fileName ?? "buffer.txt")}
            aria-label="Download"
            title="Download buffer"
          >
            <Icon name="Download" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!buffer || busy}
            onClick={clearAll}
            aria-label="Clear"
            title="Clear buffer"
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </header>

      {/* ── Body: rail · editor · options ────────────────────────── */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(200px,240px)_1fr_minmax(220px,280px)] max-lg:grid-cols-[minmax(180px,210px)_1fr] max-md:grid-cols-1">
        {/* LEFT: operations rail */}
        <aside className="flex min-h-0 flex-col gap-1.5 overflow-y-auto border-r border-border p-3 max-md:border-r-0 max-md:border-b">
          <h3 className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Operations
          </h3>
          {OPERATIONS.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => {
                setActiveOp(op.id);
                setError(null);
              }}
              aria-pressed={activeOp === op.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                activeOp === op.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md",
                  activeOp === op.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon name={op.icon} size={16} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium">{op.label}</span>
                <span className="truncate text-[11px] text-muted-foreground">{op.hint}</span>
              </span>
            </button>
          ))}

          <div className="mt-auto flex flex-col gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="FilePlus" size={15} />
              Open a file
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,.js,.jsx,.ts,.tsx,.css,.scss,.less,.html,.htm,.xml,.svg,.yaml,.yml,.md,.markdown,.csv,.sql,text/*,application/json,application/xml"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void loadFile(f);
                e.target.value = "";
              }}
            />
            <p className="rounded-lg border border-dashed border-border p-2.5 text-[11px] leading-relaxed text-muted-foreground">
              Operates on <strong>text</strong>, not binary files. Everything runs in your browser - nothing is uploaded.
            </p>
          </div>
        </aside>

        {/* CENTER: editable code buffer */}
        <main className="flex min-h-0 flex-col overflow-hidden bg-muted/20 max-md:min-h-[320px]">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Icon name="FileCode" size={13} />
              Working buffer
            </span>
            <span className="tabular-nums">
              {lines} line{lines === 1 ? "" : "s"} · {formatBytes(bytes)}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
            spellCheck={false}
            placeholder="Paste code here, or drop / open a .json / .js / .ts / .css / .html / .yaml / .xml / .md file…"
            className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </main>

        {/* RIGHT: options panel */}
        <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-l border-border p-3 max-lg:hidden max-md:flex max-md:border-l-0 max-md:border-t">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon name={activeMeta.icon} size={15} />
            </span>
            <h3 className="text-sm font-semibold">{activeMeta.label}</h3>
          </div>

          <OptionsPanel op={activeOp} opts={opts} setOption={setOption} />

          <section className="mt-auto flex flex-col gap-2 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Good to know</h4>
            <p className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
              {activeOp === "format"
                ? "Prettier loads on first use, so the first format is slower. XML uses a dependency-free pretty printer."
                : activeOp === "minify"
                  ? "Byte savings are shown after each run. JS mangles/compresses via terser. CSS via csso."
                  : activeOp === "yaml"
                    ? "Only the first YAML document in a multi-doc stream is read. Comments aren't preserved."
                    : activeOp === "jsonToTs"
                      ? "Deterministic inference from a sample value. Empty arrays become unknown[]. Nullable fields become optional."
                      : activeOp === "encode"
                        ? "Base64 is Unicode-safe (UTF-8). URL uses encode/decodeURIComponent."
                        : activeOp === "hash"
                          ? "Hashing is one-way and replaces the buffer with the digest, undo restores your source."
                          : "Escape turns text into a JSON/JS string-literal body. Unescape reverses it."}
            </p>
          </section>
        </aside>
      </div>

      {/* ── Bottom action bar ────────────────────────────────────── */}
      <footer className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          {busy ? (
            <span className="flex items-center gap-2 text-foreground">
              <Icon name="LoaderCircle" size={14} className="animate-spin" />
              {status ?? "Working…"}
            </span>
          ) : error ? (
            <span className="flex items-center gap-2 truncate text-destructive">
              <Icon name="TriangleAlert" size={14} />
              <span className="truncate">
                {error.message}
                {error.line ? ` (line ${error.line}${error.column ? `, col ${error.column}` : ""})` : ""}
              </span>
            </span>
          ) : status ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Icon name="Check" size={14} />
              {status}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {buffer ? `${lines} line${lines === 1 ? "" : "s"} · ${formatBytes(bytes)}` : "Ready. Paste or open a file."}
            </span>
          )}
        </div>
        <Button disabled={busy || !buffer} onClick={() => void run()}>
          {busy ? (
            <Icon name="LoaderCircle" size={15} className="animate-spin" />
          ) : (
            <Icon name="Play" size={15} />
          )}
          Run {activeMeta.label}
        </Button>
      </footer>
    </div>
  );
}

/* ── Options panel (right column, per active operation) ─────────────────── */

function OptionsPanel({
  op,
  opts,
  setOption,
}: {
  op: OpId;
  opts: Options;
  setOption: <K extends keyof Options>(key: K, value: Options[K]) => void;
}) {
  switch (op) {
    case "format":
      return (
        <div className="flex flex-col gap-3">
          <Field label="Language">
            <Segmented
              value={opts.formatLang}
              onChange={(v) => setOption("formatLang", v)}
              options={[
                ["json", "JSON"],
                ["js", "JS"],
                ["ts", "TS"],
                ["css", "CSS"],
                ["html", "HTML"],
                ["yaml", "YAML"],
                ["xml", "XML"],
                ["markdown", "MD"],
              ]}
            />
          </Field>
          <IndentField value={opts.indent} onChange={(v) => setOption("indent", v)} />
        </div>
      );
    case "minify":
      return (
        <Field label="Language">
          <Segmented
            value={opts.minifyLang}
            onChange={(v) => setOption("minifyLang", v)}
            options={[
              ["js", "JavaScript"],
              ["css", "CSS"],
              ["html", "HTML"],
              ["json", "JSON"],
            ]}
          />
        </Field>
      );
    case "yaml":
      return (
        <div className="flex flex-col gap-3">
          <Field label="Direction">
            <Segmented
              value={opts.yamlDir}
              onChange={(v) => setOption("yamlDir", v)}
              options={[
                ["jsonToYaml", "JSON → YAML"],
                ["yamlToJson", "YAML → JSON"],
              ]}
            />
          </Field>
          <IndentField value={opts.indent} onChange={(v) => setOption("indent", v)} />
        </div>
      );
    case "jsonToTs":
      return (
        <Field label="Root interface name">
          <input
            type="text"
            value={opts.rootName}
            onChange={(e) => setOption("rootName", e.target.value)}
            placeholder="Root"
            spellCheck={false}
            className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>
      );
    case "encode":
      return (
        <Field label="Operation">
          <Segmented
            value={opts.encodeVariant}
            onChange={(v) => setOption("encodeVariant", v)}
            options={[
              ["base64Encode", "Base64 encode"],
              ["base64Decode", "Base64 decode"],
              ["urlEncode", "URL encode"],
              ["urlDecode", "URL decode"],
            ]}
          />
        </Field>
      );
    case "hash":
      return (
        <Field label="Algorithm">
          <Segmented
            value={opts.hashAlgo}
            onChange={(v) => setOption("hashAlgo", v)}
            options={[
              ["MD5", "MD5"],
              ["SHA-1", "SHA-1"],
              ["SHA-256", "SHA-256"],
              ["SHA-384", "SHA-384"],
              ["SHA-512", "SHA-512"],
            ]}
          />
        </Field>
      );
    case "escape":
      return (
        <Field label="Direction">
          <Segmented
            value={opts.escapeDir}
            onChange={(v) => setOption("escapeDir", v)}
            options={[
              ["escape", "Escape"],
              ["unescape", "Unescape"],
            ]}
          />
        </Field>
      );
  }
}

/* ── Small option controls ──────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function IndentField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Field label="Indent (spaces)">
      <Segmented
        value={String(value)}
        onChange={(v) => onChange(Number(v))}
        options={[
          ["2", "2"],
          ["4", "4"],
          ["8", "8"],
        ]}
      />
    </Field>
  );
}

/** A compact segmented control: a wrapping grid of selectable pills. */
function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([val, label]) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          aria-pressed={value === val}
          className={cn(
            "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === val
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:bg-muted/60",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
