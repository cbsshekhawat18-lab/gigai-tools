"use client";

import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import {
  CodePane,
  CopyButton,
  ErrorBanner,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  ShortcutsHelp,
  useShortcuts,
  useShareState,
  useHistory,
  useFileDrop,
  type ShortcutHint,
} from "@/components/tool/dev";

/* -------------------------------------------------------------------------- */
/*  Shortcuts                                                                   */
/* -------------------------------------------------------------------------- */

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Load the sample" },
  { combo: "mod+shift+c", description: "Copy the decoded text" },
  { combo: "mod+shift+v", description: "Paste from clipboard" },
  { combo: "mod+z", description: "Undo input change" },
  { combo: "mod+shift+z", description: "Redo input change" },
  { combo: "mod+backspace", description: "Clear the input" },
];

/**
 * A friendly sample: "Base64 is not encryption! ☕ Grüße, 日本語" encoded to
 * standard Base64. Decoding it demonstrates clean Unicode round-tripping.
 */
const SAMPLE =
  "QmFzZTY0IGlzIG5vdCBlbmNyeXB0aW9uISDimJUgR3LDvMOfZSwg5pel5pys6Kqe";

/* -------------------------------------------------------------------------- */
/*  Pure decode + detection helpers                                            */
/* -------------------------------------------------------------------------- */

/** Everything we learn about a decode attempt in one pass. */
type Decoded =
  | {
      ok: true;
      /** Recovered raw bytes. */
      bytes: Uint8Array;
      /** UTF-8 text (best effort; may contain replacement chars if binary). */
      text: string;
      /** True when the alphabet contained URL-safe chars or lacked padding. */
      urlSafe: boolean;
      /** Detected binary file signature, if any. */
      file: DetectedFile | null;
      /** Fraction of bytes that look like readable text (0..1). */
      textiness: number;
      /** MIME hint parsed from a pasted data: URL, if present. */
      dataUrlMime: string | null;
    }
  | { ok: false; error: string };

interface DetectedFile {
  mime: string;
  ext: string;
  label: string;
}

/** Strip a `data:<mime>;base64,` prefix, returning the payload + mime hint. */
function stripDataUrl(input: string): { payload: string; mime: string | null } {
  const match = /^\s*data:([^;,]*)(;base64)?,/i.exec(input);
  if (match) {
    const comma = input.indexOf(",");
    return { payload: input.slice(comma + 1), mime: match[1] || null };
  }
  return { payload: input, mime: null };
}

/**
 * Detect whether the input uses the URL-safe alphabet. `-`/`_` are a definite
 * tell; absence of padding on a non-multiple-of-4 length is a softer one.
 */
function looksUrlSafe(cleaned: string): boolean {
  if (/[-_]/.test(cleaned)) return true;
  if (/[+/]/.test(cleaned)) return false;
  // No alphabet-distinguishing chars: fall back to padding heuristic.
  return cleaned.length % 4 !== 0 && !cleaned.includes("=");
}

/** Decode Base64 (standard or URL-safe, padded or not) to raw bytes. Throws on bad input. */
function base64ToBytes(b64: string, urlSafe: boolean): Uint8Array {
  let normalized = b64.replace(/\s+/g, "");
  if (urlSafe) normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  if (pad === 1) {
    // A length of 4n+1 can never be valid Base64.
    throw new Error("length");
  }
  if (pad) normalized += "=".repeat(4 - pad);
  const binary = atob(normalized); // throws on any invalid character
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Magic-number sniffing for common binary formats. */
function sniffFile(bytes: Uint8Array): DetectedFile | null {
  const b = bytes;
  const at = (i: number) => b[i] ?? -1;
  const starts = (sig: number[]) => sig.every((v, i) => at(i) === v);
  if (starts([0x89, 0x50, 0x4e, 0x47]))
    return { mime: "image/png", ext: "png", label: "PNG image" };
  if (starts([0xff, 0xd8, 0xff]))
    return { mime: "image/jpeg", ext: "jpg", label: "JPEG image" };
  if (starts([0x47, 0x49, 0x46, 0x38]))
    return { mime: "image/gif", ext: "gif", label: "GIF image" };
  if (starts([0x25, 0x50, 0x44, 0x46]))
    return { mime: "application/pdf", ext: "pdf", label: "PDF document" };
  if (starts([0x50, 0x4b, 0x03, 0x04]) || starts([0x50, 0x4b, 0x05, 0x06]))
    return { mime: "application/zip", ext: "zip", label: "ZIP archive" };
  if (starts([0x1f, 0x8b]))
    return { mime: "application/gzip", ext: "gz", label: "GZIP archive" };
  // WebP: "RIFF"...."WEBP"
  if (starts([0x52, 0x49, 0x46, 0x46]) && at(8) === 0x57 && at(9) === 0x45 && at(10) === 0x42 && at(11) === 0x50)
    return { mime: "image/webp", ext: "webp", label: "WebP image" };
  if (starts([0x4f, 0x67, 0x67, 0x53]))
    return { mime: "audio/ogg", ext: "ogg", label: "Ogg media" };
  if (starts([0x25, 0x21, 0x50, 0x53]))
    return { mime: "application/postscript", ext: "ps", label: "PostScript" };
  return null;
}

/**
 * Estimate how much of the byte stream is plausibly readable text: printable
 * ASCII, common whitespace, or a valid UTF-8 continuation. Low values signal
 * binary content even when no known signature matched.
 */
function estimateTextiness(bytes: Uint8Array): number {
  if (bytes.length === 0) return 1;
  const sample = bytes.subarray(0, 4096);
  let printable = 0;
  for (let i = 0; i < sample.length; i += 1) {
    const c = sample[i] ?? 0;
    if (c === 9 || c === 10 || c === 13) printable += 1; // tab / LF / CR
    else if (c >= 0x20 && c < 0x7f) printable += 1; // printable ASCII
    else if (c >= 0x80) printable += 1; // assume part of a UTF-8 sequence
    // control chars (0..8, 11..12, 14..31, 127) count against text
  }
  return printable / sample.length;
}

/** Full decode + analysis of the current input. */
function decode(rawInput: string): Decoded {
  const trimmed = rawInput.trim();
  if (!trimmed) return { ok: false, error: "" };

  const { payload, mime: dataUrlMime } = stripDataUrl(trimmed);
  const cleaned = payload.replace(/\s+/g, "");
  if (!cleaned) return { ok: false, error: "There's nothing to decode yet." };

  // Validate the alphabet up front for a precise error before atob runs.
  if (/[^A-Za-z0-9+/=\-_]/.test(cleaned)) {
    const bad = /[^A-Za-z0-9+/=\-_]/.exec(cleaned)?.[0] ?? "";
    const shown = bad === " " ? "a space" : `"${bad}"`;
    return {
      ok: false,
      error: `That isn't valid Base64. It contains ${shown}. Base64 uses only A–Z, a–z, 0–9 and + / = (or - _ for URL-safe).`,
    };
  }

  const urlSafe = looksUrlSafe(cleaned);
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(cleaned, urlSafe);
  } catch (err) {
    const message =
      err instanceof Error && err.message === "length"
        ? "That isn't valid Base64. Its length is off by one character, which can't happen in real Base64. A character was likely dropped or added during copy."
        : "That isn't valid Base64. The padding or length is invalid. Make sure you copied the whole value, including any = at the end.";
    return { ok: false, error: message };
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const file = sniffFile(bytes);
  const textiness = estimateTextiness(bytes);

  return { ok: true, bytes, text, urlSafe, file, textiness, dataUrlMime };
}

/* -------------------------------------------------------------------------- */
/*  Small format helpers                                                       */
/* -------------------------------------------------------------------------- */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

/** Trigger a browser download of raw bytes. */
function downloadBytes(bytes: Uint8Array, mime: string, filename: string): void {
  const buffer = bytes.slice().buffer;
  const blob = new Blob([buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* -------------------------------------------------------------------------- */
/*  Sibling encode link                                                        */
/* -------------------------------------------------------------------------- */

function EncodeLink({ accent }: { accent: ReturnType<typeof accentStyle> }) {
  return (
    <Link
      href="/base64-encoder"
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        "border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        accent.ring,
      )}
    >
      <Icon name="ArrowLeftRight" size={15} className={accent.text} />
      <span>Need the reverse? Open the Base64 Encoder</span>
      <Icon
        name="ArrowRight"
        size={15}
        className="transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Root tool                                                                   */
/* -------------------------------------------------------------------------- */

export default function Base64DecoderTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);

  const history = useHistory<string>("", { debounceMs: 300 });
  const input = history.state;
  const setInput = history.set;

  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const share = useShareState({ onInit: (v) => history.replace(v) });

  const result = React.useMemo(() => decode(input), [input]);

  // A binary result is one that either matched a known signature or reads as
  // mostly non-text. In both cases inline text would be unhelpful.
  const isBinary =
    result.ok && (result.file !== null || result.textiness < 0.7) && result.bytes.length > 0;

  const loadSample = React.useCallback(() => {
    history.replace(SAMPLE);
    inputRef.current?.focus();
  }, [history]);

  const clearAll = React.useCallback(() => {
    history.replace("");
    inputRef.current?.focus();
  }, [history]);

  const pasteFromClipboard = React.useCallback(() => {
    navigator.clipboard
      ?.readText()
      .then((t) => {
        if (t) setInput(t);
        inputRef.current?.focus();
      })
      .catch(() => undefined);
  }, [setInput]);

  const doShare = React.useCallback(() => {
    const trimmed = input.trim();
    if (trimmed) void share.copyShareLink(trimmed);
  }, [input, share]);

  const copyText = React.useCallback(() => {
    if (result.ok && result.text) {
      void navigator.clipboard.writeText(result.text).catch(() => undefined);
    }
  }, [result]);

  const doDownload = React.useCallback(() => {
    if (!result.ok || result.bytes.length === 0) return;
    const mime =
      result.file?.mime ??
      result.dataUrlMime ??
      (isBinary ? "application/octet-stream" : "text/plain;charset=utf-8");
    const ext = result.file?.ext ?? (isBinary ? "bin" : "txt");
    downloadBytes(result.bytes, mime, `decoded.${ext}`);
  }, [result, isBinary]);

  // Drag-drop / paste a .txt file of Base64 into the input.
  const onFiles = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      file
        .text()
        .then((t) => setInput(t.trim()))
        .catch(() => undefined);
    },
    [setInput],
  );
  const { isDragging, dropProps } = useFileDrop({ onFiles, paste: false });

  useShortcuts({
    "mod+enter": () => loadSample(),
    "mod+backspace": () => clearAll(),
    "mod+shift+c": () => copyText(),
    "mod+shift+v": () => pasteFromClipboard(),
    "mod+z": () => history.undo(),
    "mod+shift+z": () => history.redo(),
  });

  const hasInput = input.trim().length > 0;
  const errorMsg = result.ok ? null : result.error || null;

  return (
    <div className="flex flex-col gap-4" {...dropProps}>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton
          icon="Sparkles"
          label="Sample"
          kbd="mod+enter"
          onClick={loadSample}
        />
        <ToolbarButton
          icon="ClipboardPaste"
          label="Paste"
          kbd="mod+shift+v"
          onClick={pasteFromClipboard}
        />
        <ToolbarDivider />
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
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Link copied!" : "Share"}
          variant={share.justCopied ? "active" : "default"}
          onClick={doShare}
          disabled={!hasInput}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Clear"
          kbd="mod+backspace"
          variant="destructive"
          onClick={clearAll}
          disabled={!hasInput}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && <ErrorBanner error={share.shareError} variant="warning" />}

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <div className="relative">
        <CodePane
          ref={inputRef}
          id="b64-input"
          value={input}
          onChange={setInput}
          label="Base64 input"
          placeholder="Paste Base64 here, standard or URL-safe, padded or not. A whole data: URL works too. Decoding is instant."
          onDropText={(t) => setInput(t.trim())}
          lineNumbers={false}
          wrap
          showStats
          minHeight={140}
          maxHeight={260}
          fontSize={13}
          ariaLabel="Base64 input"
          errorLine={errorMsg ? 1 : null}
        />
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Upload" size={16} /> Drop a .txt file of Base64
            </span>
          </div>
        )}
      </div>

      {errorMsg && <ErrorBanner error={errorMsg} />}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!hasInput && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              accent.soft,
            )}
          >
            <Icon name="FileOutput" size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Paste Base64 to decode it instantly
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Text appears below as UTF-8; if the bytes are a file, you&apos;ll get a
              download. URL-safe input is detected automatically, all in your
              browser.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
              accent.border,
              accent.text,
            )}
          >
            <Icon name="Sparkles" size={14} /> Try a sample
          </button>
        </div>
      )}

      {/* ── Decoded output ──────────────────────────────────────────────── */}
      {result.ok && result.bytes.length > 0 && (
        <>
          {/* Status strip */}
          <div className="flex flex-wrap items-center gap-2">
            {isBinary ? (
              <StatBadge
                tone="info"
                icon="FileDown"
                label="Detected"
                value={result.file?.label ?? "Binary data"}
              />
            ) : (
              <StatBadge tone="success" icon="Type" label="Decoded" value="UTF-8 text" />
            )}
            <StatBadge
              icon={result.urlSafe ? "Link2" : "Binary"}
              label="Alphabet"
              value={result.urlSafe ? "URL-safe" : "Standard"}
            />
            <StatBadge icon="HardDrive" label="Bytes" value={formatBytes(result.bytes.length)} />
            {!isBinary && (
              <StatBadge label="Characters" value={result.text.length.toLocaleString()} />
            )}
          </div>

          {isBinary ? (
            /* ── Binary payload → download card ─────────────────────────── */
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-lg",
                    accent.soft,
                  )}
                >
                  <Icon name="FileDown" size={22} className={accent.text} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    This Base64 decodes to a file, not text
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Detected {result.file?.label ?? "binary data"} ·{" "}
                    {result.file?.mime ??
                      result.dataUrlMime ??
                      "application/octet-stream"}{" "}
                    · {formatBytes(result.bytes.length)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={doDownload}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    accent.solid,
                  )}
                >
                  <Icon name="Download" size={16} />
                  Download .{result.file?.ext ?? "bin"}
                </button>
              </div>

              {/* Inline preview for images */}
              {result.file?.mime.startsWith("image/") && (
                <div className="overflow-hidden rounded-lg border border-border bg-[repeating-conic-gradient(theme(colors.muted.DEFAULT)_0_25%,transparent_0_50%)] bg-[length:16px_16px] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:${result.file.mime};base64,${input.trim().replace(/^\s*data:[^,]*,/, "")}`}
                    alt="Decoded image preview"
                    className="mx-auto max-h-72 max-w-full rounded object-contain"
                  />
                </div>
              )}

              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Icon name="Info" size={13} className="mt-0.5 shrink-0" />
                <span>
                  The decoded bytes match a known file signature, so they&apos;re
                  offered as a download instead of unreadable characters. Nothing was
                  uploaded: the file is built locally in your browser.
                </span>
              </p>
            </div>
          ) : (
            /* ── Text payload → editor pane ─────────────────────────────── */
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Decoded text
                </span>
                {result.textiness < 0.99 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                    <Icon name="TriangleAlert" size={12} />
                    Some bytes aren&apos;t valid UTF-8: source may not be UTF-8 text
                  </span>
                )}
                <ToolbarSpacer />
                <CopyButton
                  label="Copy text"
                  kbd="mod+shift+c"
                  getValue={() => result.text}
                  disabled={!result.text}
                />
                <ToolbarButton
                  icon="Download"
                  label="Download"
                  labelMode="responsive"
                  onClick={doDownload}
                />
              </div>
              <CodePane
                value={result.text}
                readOnly
                lineNumbers
                wrap={false}
                showWrapToggle
                showStats
                minHeight={160}
                maxHeight={360}
                fontSize={13}
                ariaLabel="Decoded text output"
              />
            </div>
          )}
        </>
      )}

      {/* ── Footer + sibling link ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
          <span>
            Your Base64 and everything it decodes to are processed entirely in this
            browser tab. Nothing is uploaded. Base64 is encoding, not encryption, so
            treat any decoded credential as live.
          </span>
        </p>
        <EncodeLink accent={accent} />
      </div>
    </div>
  );
}
