"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import {
  hashText,
  hashFile,
  hmac,
  HASH_ALGOS,
  type HashAlgo,
  type HmacAlgo,
} from "@/lib/dev/hash";
import {
  CodePane,
  CopyButton,
  ErrorBanner,
  Field,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  ShortcutsHelp,
  useShortcuts,
  useShareState,
  useFileDrop,
  type ShortcutHint,
} from "@/components/tool/dev";

/** A short, memorable demo string with widely-published reference digests. */
const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog";

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Load the sample text" },
  { combo: "mod+shift+u", description: "Toggle uppercase hex" },
  { combo: "mod+shift+h", description: "Toggle HMAC mode" },
  { combo: "mod+backspace", description: "Clear everything" },
];

/** Per-algorithm color tint so the five digests are easy to tell apart. */
const ALGO_TINT: Record<HashAlgo, { text: string; chip: string }> = {
  MD5: {
    text: "text-rose-600 dark:text-rose-400",
    chip: "bg-rose-500/10",
  },
  "SHA-1": {
    text: "text-amber-600 dark:text-amber-400",
    chip: "bg-amber-500/10",
  },
  "SHA-256": {
    text: "text-cyan-600 dark:text-cyan-400",
    chip: "bg-cyan-500/10",
  },
  "SHA-384": {
    text: "text-teal-600 dark:text-teal-400",
    chip: "bg-teal-500/10",
  },
  "SHA-512": {
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-500/10",
  },
};

/** Bit-length label per algorithm, shown as a subtle hint. */
const ALGO_BITS: Record<HashAlgo, string> = {
  MD5: "128-bit",
  "SHA-1": "160-bit",
  "SHA-256": "256-bit",
  "SHA-384": "384-bit",
  "SHA-512": "512-bit",
};

/** Algorithms available in HMAC mode (Web Crypto omits HMAC-MD5). */
const HMAC_ALGOS: HmacAlgo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

/** The set of algorithms to render given the current mode. */
function activeAlgos(hmacMode: boolean): HashAlgo[] {
  return hmacMode ? (HMAC_ALGOS as HashAlgo[]) : HASH_ALGOS;
}

/** A computed row: either a hex digest, an in-flight state, or an error. */
type DigestState =
  | { status: "empty" }
  | { status: "computing" }
  | { status: "done"; hex: string }
  | { status: "error"; message: string };

type DigestMap = Record<string, DigestState>;

interface Source {
  kind: "text" | "file";
  /** For text: the raw string. For file: the File object. */
  text: string;
  file: File | null;
}

const EMPTY_SOURCE: Source = { kind: "text", text: "", file: null };

/** Human-readable byte size. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i] ?? "KB"}`;
}

/** Normalise a hex string for comparison: strip whitespace, lowercase. */
function normaliseHex(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

export default function HashGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const accent = accentStyle(tool.accent);

  const [source, setSource] = React.useState<Source>(EMPTY_SOURCE);
  const [uppercase, setUppercase] = React.useState(false);
  const [hmacMode, setHmacMode] = React.useState(false);
  const [hmacKey, setHmacKey] = React.useState("");
  const [showKey, setShowKey] = React.useState(false);
  const [expected, setExpected] = React.useState("");
  const [digests, setDigests] = React.useState<DigestMap>({});
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Share only the text input (files can't travel in a URL).
  const share = useShareState({
    onInit: (v) => setSource({ kind: "text", text: v, file: null }),
  });

  const algos = React.useMemo(() => activeAlgos(hmacMode), [hmacMode]);
  const hasInput =
    source.kind === "file" ? source.file !== null : source.text.length > 0;

  // ── Core: recompute all active digests whenever inputs change ─────────────
  React.useEffect(() => {
    if (!hasInput) {
      setDigests({});
      return;
    }
    // HMAC needs a key; without one, show a prompt rather than compute.
    if (hmacMode && hmacKey.length === 0) {
      setDigests({});
      return;
    }

    let cancelled = false;
    setDigests((prev) => {
      const next: DigestMap = {};
      for (const algo of algos) {
        next[algo] =
          prev[algo]?.status === "done"
            ? prev[algo]
            : { status: "computing" };
      }
      return next;
    });

    const compute = async (algo: HashAlgo): Promise<DigestState> => {
      try {
        if (hmacMode) {
          // HMAC only applies to text; files fall back to a keyed hash of bytes
          // is out of scope, HMAC mode targets the text field.
          const hex = await hmac(source.text, hmacKey, algo as HmacAlgo);
          return { status: "done", hex };
        }
        if (source.kind === "file" && source.file) {
          const hex = await hashFile(source.file, algo);
          return { status: "done", hex };
        }
        const hex = await hashText(source.text, algo);
        return { status: "done", hex };
      } catch (err) {
        return {
          status: "error",
          message: err instanceof Error ? err.message : "Failed to hash",
        };
      }
    };

    void Promise.all(
      algos.map(async (algo) => {
        const result = await compute(algo);
        if (!cancelled) {
          setDigests((prev) => ({ ...prev, [algo]: result }));
        }
      }),
    );

    return () => {
      cancelled = true;
    };
  }, [algos, source, hmacMode, hmacKey, hasInput]);

  // ── Verify: does the expected value match any computed digest? ────────────
  const verifyResult = React.useMemo<
    | { state: "idle" }
    | { state: "match"; algo: string }
    | { state: "mismatch" }
  >(() => {
    const wanted = normaliseHex(expected);
    if (wanted.length === 0) return { state: "idle" };
    for (const algo of algos) {
      const d = digests[algo];
      if (d?.status === "done" && normaliseHex(d.hex) === wanted) {
        return { state: "match", algo };
      }
    }
    return { state: "mismatch" };
  }, [expected, digests, algos]);

  // ── Derived: apply the uppercase toggle at render time ────────────────────
  const displayHex = React.useCallback(
    (hex: string) => (uppercase ? hex.toUpperCase() : hex),
    [uppercase],
  );

  // ── Actions ───────────────────────────────────────────────────────────────
  const loadSample = React.useCallback(() => {
    setSource({ kind: "text", text: SAMPLE_TEXT, file: null });
    setExpected("");
    inputRef.current?.focus();
  }, []);

  const clearAll = React.useCallback(() => {
    setSource(EMPTY_SOURCE);
    setExpected("");
    setHmacKey("");
    setDigests({});
    inputRef.current?.focus();
  }, []);

  const copyAll = React.useCallback(() => {
    const lines = algos
      .map((algo) => {
        const d = digests[algo];
        if (d?.status !== "done") return null;
        return `${algo}: ${displayHex(d.hex)}`;
      })
      .filter((l): l is string => l !== null);
    return lines.join("\n");
  }, [algos, digests, displayHex]);

  const doShare = React.useCallback(() => {
    if (source.kind === "text" && source.text) {
      void share.copyShareLink(source.text);
    }
  }, [source, share]);

  const onFiles = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setSource({ kind: "file", text: "", file });
  }, []);

  const { isDragging, dropProps } = useFileDrop({ onFiles, paste: false });

  useShortcuts({
    "mod+enter": () => loadSample(),
    "mod+backspace": () => clearAll(),
    "mod+shift+u": () => setUppercase((u) => !u),
    "mod+shift+h": () => setHmacMode((h) => !h),
  });

  const anyDone = algos.some((a) => digests[a]?.status === "done");
  const fileHmacWarning = hmacMode && source.kind === "file";

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
          icon="KeySquare"
          label="HMAC mode"
          kbd="mod+shift+h"
          variant={hmacMode ? "active" : "default"}
          aria-pressed={hmacMode}
          onClick={() => setHmacMode((h) => !h)}
        />
        <ToolbarButton
          icon="CaseUpper"
          label="Uppercase"
          kbd="mod+shift+u"
          variant={uppercase ? "active" : "default"}
          aria-pressed={uppercase}
          onClick={() => setUppercase((u) => !u)}
        />
        <ToolbarDivider />
        <CopyButton
          label="Copy all"
          getValue={copyAll}
          disabled={!anyDone}
        />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Link copied!" : "Share"}
          variant={share.justCopied ? "active" : "default"}
          onClick={doShare}
          disabled={source.kind !== "text" || !source.text}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Clear"
          kbd="mod+backspace"
          variant="destructive"
          onClick={clearAll}
          disabled={!hasInput && !expected && !hmacKey}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && (
        <ErrorBanner error={share.shareError} variant="warning" />
      )}

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <div className="relative">
        {source.kind === "file" && source.file ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md",
                  accent.soft,
                )}
              >
                <Icon name="FileText" size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {source.file.name || "Dropped file"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(source.file.size)} · hashed locally
                </p>
              </div>
            </div>
            <ToolbarButton
              icon="X"
              label="Remove"
              labelMode="responsive"
              onClick={() =>
                setSource({ kind: "text", text: "", file: null })
              }
            />
          </div>
        ) : (
          <CodePane
            ref={inputRef}
            id="hash-input"
            value={source.text}
            onChange={(t) => setSource({ kind: "text", text: t, file: null })}
            label="Text to hash"
            placeholder="Type or paste text, or drag a file anywhere onto this panel…"
            onDropText={(t) =>
              setSource({ kind: "text", text: t, file: null })
            }
            lineNumbers={false}
            wrap
            showStats
            minHeight={120}
            maxHeight={240}
            fontSize={13}
            ariaLabel="Text to hash"
          />
        )}
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Upload" size={16} /> Drop a file to hash it
            </span>
          </div>
        )}
      </div>

      {/* ── HMAC key field ──────────────────────────────────────────────── */}
      {hmacMode && (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <Field label="HMAC secret key" htmlFor="hmac-key">
            <div className="relative">
              <input
                id="hmac-key"
                type={showKey ? "text" : "password"}
                value={hmacKey}
                onChange={(e) => setHmacKey(e.target.value)}
                placeholder="Enter the shared secret key…"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/20"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                aria-label={showKey ? "Hide key" : "Show key"}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon name={showKey ? "EyeOff" : "Eye"} size={15} />
              </button>
            </div>
          </Field>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Icon name="KeyRound" size={12} className="mt-0.5 shrink-0" />
            HMAC signs your text with this key via Web Crypto. MD5 is omitted  -
            Web Crypto has no HMAC-MD5. The key never leaves your browser.
          </p>
          {fileHmacWarning && (
            <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
              <Icon name="TriangleAlert" size={12} className="mt-0.5 shrink-0" />
              HMAC mode signs the text field. Switch off HMAC to fingerprint the
              dropped file, or paste the file&apos;s contents as text to sign it.
            </p>
          )}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!hasInput && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              accent.soft,
            )}
          >
            <Icon name="Fingerprint" size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Enter text or drop a file to fingerprint it
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              MD5, SHA-1, SHA-256, SHA-384 and SHA-512 are computed together,
              live and entirely in your browser; nothing is uploaded.
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

      {/* ── Digest rows ─────────────────────────────────────────────────── */}
      {hasInput && (!hmacMode || hmacKey.length > 0) && (
        <div className="flex flex-col gap-2">
          {algos.map((algo) => {
            const state = digests[algo] ?? { status: "empty" };
            const tint = ALGO_TINT[algo];
            const matched =
              verifyResult.state === "match" && verifyResult.algo === algo;
            return (
              <div
                key={algo}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border bg-card p-3 transition-colors sm:flex-row sm:items-center",
                  matched
                    ? "border-emerald-500/50 ring-1 ring-emerald-500/30"
                    : "border-border",
                )}
              >
                <div className="flex w-full items-center gap-2 sm:w-40 sm:shrink-0">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded",
                      tint.chip,
                    )}
                  >
                    <Icon name="Hash" size={14} className={tint.text} />
                  </span>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-semibold leading-tight", tint.text)}>
                      {hmacMode ? `HMAC-${algo}` : algo}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {ALGO_BITS[algo]}
                    </p>
                  </div>
                  {matched && (
                    <Icon
                      name="CircleCheck"
                      size={16}
                      className="ml-auto text-emerald-500 sm:ml-0"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {state.status === "computing" && (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Icon name="LoaderCircle" size={14} className="animate-spin" />
                      Computing…
                    </span>
                  )}
                  {state.status === "error" && (
                    <span className="text-sm text-destructive">{state.message}</span>
                  )}
                  {state.status === "done" && (
                    <code className="block break-all font-mono text-xs text-foreground sm:text-[13px]">
                      {displayHex(state.hex)}
                    </code>
                  )}
                  {state.status === "empty" && (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <CopyButton
                    label="Copy"
                    labelMode="responsive"
                    value={state.status === "done" ? displayHex(state.hex) : ""}
                    disabled={state.status !== "done"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Verify against expected checksum ────────────────────────────── */}
      {hasInput && (
        <div className="rounded-lg border border-border bg-card/60 p-3">
          <Field
            label="Verify against an expected hash"
            htmlFor="expected-hash"
            hint="Paste a checksum from a download page or .sha file to confirm a match"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                id="expected-hash"
                type="text"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                placeholder="e.g. 9e107d9d372bb6826bd81d3542a419d6"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/20"
              />
              <div aria-live="polite" className="shrink-0">
                {verifyResult.state === "match" && (
                  <StatBadge
                    tone="success"
                    icon="CircleCheck"
                    value={`Matches ${hmacMode ? "HMAC-" : ""}${verifyResult.algo}`}
                  />
                )}
                {verifyResult.state === "mismatch" && (
                  <StatBadge tone="danger" icon="CircleX" value="No match" />
                )}
                {verifyResult.state === "idle" && (
                  <span className="text-xs text-muted-foreground">
                    Awaiting a value
                  </span>
                )}
              </div>
            </div>
          </Field>
        </div>
      )}

      {/* ── Footer note ─────────────────────────────────────────────────── */}
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Hashing and HMAC signing run entirely in this browser tab with the Web
          Crypto API (MD5 via an in-browser library). Your text, keys and files
          are never uploaded. MD5 and SHA-1 are unsafe against deliberate
          collisions; use SHA-256 or stronger for security-sensitive work.
        </span>
      </p>
    </div>
  );
}
