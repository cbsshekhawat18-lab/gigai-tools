"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { ImageToolProps } from "@/components/tool/types";
import { urlDecode, parseUrl, type UrlParts } from "@/lib/dev/encode";
import {
  CodePane,
  CopyButton,
  ErrorBanner,
  StatBadge,
  Field,
  SegmentedControl,
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

/**
 * A rich sample: a real-looking tracking link whose query string is heavily
 * percent-encoded (spaces as +/%20, an ampersand-in-value, a UTF-8 check mark,
 * an accented word, and a fragment) so the decode + parse table both light up.
 */
const SAMPLE_URL =
  "https://shop.example.com/caf%C3%A9/search?q=black%20%26%20white%20coffee&utm_source=news%20letter&tag=%E2%9C%93new&page=2#reviews";

type Mode = "component" | "uri";

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Load the sample URL" },
  { combo: "mod+shift+c", description: "Copy the decoded output" },
  { combo: "mod+backspace", description: "Clear the input" },
  { combo: "mod+shift+m", description: "Toggle component / whole-URI mode" },
];

/** Ordered structural components we surface in the parsed table. */
const COMPONENTS: { key: keyof UrlParts; label: string; hint: string }[] = [
  { key: "protocol", label: "Protocol", hint: "Scheme, e.g. https:" },
  { key: "hostname", label: "Host", hint: "Domain without the port" },
  { key: "port", label: "Port", hint: "Explicit port, if any" },
  { key: "pathname", label: "Path", hint: "Path after the host" },
  { key: "hash", label: "Fragment", hint: "Everything after #" },
  { key: "origin", label: "Origin", hint: "Scheme + host + port" },
];

/** Safely decode a single value in the chosen mode; falls back to the raw text. */
function decodeValue(value: string, mode: Mode): { text: string; failed: boolean } {
  const r = urlDecode(value, { component: mode === "component" });
  if (r.ok) return { text: r.result, failed: false };
  return { text: value, failed: true };
}

export default function UrlDecoderTool({ tool }: ImageToolProps) {
  const accent = accentStyle(tool.accent);
  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<Mode>("component");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const share = useShareState({ onInit: (v) => setInput(v) });

  const trimmed = input.trim();

  // ── Live decode ───────────────────────────────────────────────────────────
  const decoded = React.useMemo(
    () => (trimmed ? urlDecode(trimmed, { component: mode === "component" }) : null),
    [trimmed, mode],
  );
  const decodeError = decoded && !decoded.ok ? decoded.error.message : null;
  const decodedText = decoded && decoded.ok ? decoded.result : "";

  // ── URL parse (only when the input is an absolute URL) ─────────────────────
  const parsed = React.useMemo(() => (trimmed ? parseUrl(trimmed) : null), [trimmed]);
  const parts = parsed && parsed.ok ? parsed.parts : null;

  const loadSample = React.useCallback(() => {
    setInput(SAMPLE_URL);
    inputRef.current?.focus();
  }, []);

  const clearAll = React.useCallback(() => {
    setInput("");
    inputRef.current?.focus();
  }, []);

  const copyDecoded = React.useCallback(() => {
    if (decodedText) void navigator.clipboard.writeText(decodedText).catch(() => undefined);
  }, [decodedText]);

  const doShare = React.useCallback(() => {
    if (trimmed) void share.copyShareLink(trimmed);
  }, [trimmed, share]);

  const onFiles = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    file
      .text()
      .then((t) => setInput(t.trim()))
      .catch(() => undefined);
  }, []);

  const { isDragging, dropProps } = useFileDrop({ onFiles, paste: false });

  useShortcuts({
    "mod+enter": () => loadSample(),
    "mod+backspace": () => clearAll(),
    "mod+shift+c": () => copyDecoded(),
    "mod+shift+m": () => setMode((m) => (m === "component" ? "uri" : "component")),
  });

  const doubleEncoded = decodedText.includes("%") && /%[0-9A-Fa-f]{2}/.test(decodedText);

  return (
    <div className="flex flex-col gap-4" {...dropProps}>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton icon="Sparkles" label="Sample URL" kbd="mod+enter" onClick={loadSample} />
        <ToolbarDivider />
        <CopyButton
          label="Copy decoded"
          kbd="mod+shift+c"
          getValue={() => decodedText}
          disabled={!decodedText}
        />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Link copied!" : "Share link"}
          variant={share.justCopied ? "active" : "default"}
          onClick={doShare}
          disabled={!trimmed}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Clear"
          kbd="mod+backspace"
          variant="destructive"
          onClick={clearAll}
          disabled={!input}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && <ErrorBanner error={share.shareError} variant="warning" />}

      {/* ── Mode toggle ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Field label="Decode mode" hint="How reserved characters (& = ? /) are treated">
          <SegmentedControl<Mode>
            value={mode}
            onChange={setMode}
            size="sm"
            ariaLabel="Decode mode"
            options={[
              { value: "component", label: "Component", icon: "Braces" },
              { value: "uri", label: "Whole URI", icon: "Link" },
            ]}
          />
        </Field>
        <p className="max-w-md text-xs text-muted-foreground">
          {mode === "component" ? (
            <>
              <span className="font-medium text-foreground">decodeURIComponent</span> - unescapes
              reserved characters too. Best for a single value pulled from a query string.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">decodeURI</span> - preserves a link&apos;s
              structure (leaves <code className="font-mono">? &amp; = /</code> encoded). Best for a
              whole URL.
            </>
          )}
        </p>
      </div>

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <div className="relative">
        <CodePane
          ref={inputRef}
          id="url-input"
          value={input}
          onChange={setInput}
          label="Encoded text or URL"
          placeholder="Paste a percent-encoded string or a full URL here…"
          onDropText={(t) => setInput(t.trim())}
          lineNumbers={false}
          wrap
          showStats
          minHeight={110}
          maxHeight={220}
          fontSize={13}
          ariaLabel="Encoded URL input"
          errorLine={decodeError ? 1 : null}
        />
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Upload" size={16} /> Drop a .txt file
            </span>
          </div>
        )}
      </div>

      {decodeError && <ErrorBanner error={decodeError} />}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!input && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              accent.soft,
            )}
          >
            <Icon name="Link2" size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Paste encoded text to decode it instantly
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              The plain-text result appears below, and a full link is broken into its host, path and
              decoded query parameters, all in your browser, nothing uploaded.
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
            <Icon name="Sparkles" size={14} /> Try a sample URL
          </button>
        </div>
      )}

      {/* ── Decoded output ──────────────────────────────────────────────── */}
      {trimmed && !decodeError && (
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className={cn("flex size-6 items-center justify-center rounded", accent.soft)}>
                <Icon name="TextCursorInput" size={14} className={accent.text} />
              </span>
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold leading-tight", accent.text)}>Decoded text</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Percent-encoding reversed to plain UTF-8
                </p>
              </div>
            </div>
            <CopyButton label="Copy" value={decodedText} labelMode="responsive" />
          </div>
          <CodePane
            value={decodedText}
            readOnly
            wrap
            showWrapToggle={false}
            showStats={false}
            minHeight={72}
            maxHeight={220}
            fontSize={13}
            ariaLabel="Decoded output"
            className="rounded-none border-0 shadow-none"
          />
        </div>
      )}

      {/* ── Status strip ────────────────────────────────────────────────── */}
      {trimmed && !decodeError && (
        <div className="flex flex-wrap items-center gap-2">
          {parts ? (
            <StatBadge tone="success" icon="CircleCheck" label="Input" value="Valid URL" />
          ) : (
            <StatBadge tone="info" icon="Info" label="Input" value="Plain encoded text" />
          )}
          {parts && (
            <StatBadge
              icon="ListTree"
              label="Query params"
              value={parts.params.length}
              tone={parts.params.length > 0 ? "default" : "info"}
            />
          )}
          {doubleEncoded && (
            <StatBadge
              tone="warning"
              icon="TriangleAlert"
              label="Note"
              value="Looks double-encoded"
              title="The decoded text still contains %XX sequences, decode again to peel off another layer."
            />
          )}
        </div>
      )}

      {/* ── URL component table ─────────────────────────────────────────── */}
      {parts && (
        <div className="overflow-hidden rounded-lg border border-border bg-card/60">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
            <span className="flex size-6 items-center justify-center rounded bg-sky-500/10">
              <Icon name="Table2" size={14} className="text-sky-600 dark:text-sky-400" />
            </span>
            URL components
          </div>
          <div className="divide-y divide-border">
            {COMPONENTS.map(({ key, label, hint }) => {
              const raw = String(parts[key] ?? "");
              if (!raw) return null;
              return (
                <ComponentRow key={String(key)} label={label} hint={hint} value={raw} />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Query parameter table ───────────────────────────────────────── */}
      {parts && parts.params.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card/60">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
            <span className="flex size-6 items-center justify-center rounded bg-teal-500/10">
              <Icon name="ListTree" size={14} className="text-teal-600 dark:text-teal-400" />
            </span>
            Query parameters
            <span className="text-xs font-normal text-muted-foreground">
              ({parts.params.length} decoded)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Key</th>
                  <th className="px-3 py-2 font-medium">Value (decoded)</th>
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parts.params.map(([key, value], i) => {
                  const dKey = decodeValue(key, "component");
                  return (
                    <tr key={`${key}-${i}`} className="align-top">
                      <td className="px-3 py-2 font-mono text-xs font-medium text-foreground break-all">
                        {dKey.text || <span className="text-muted-foreground">(empty)</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground break-all">
                        {value || <span className="italic">(empty)</span>}
                      </td>
                      <td className="px-3 py-2">
                        <CopyButton label="Copy" value={value} labelMode="icon" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Your URL and everything in it (paths, tokens and query values) are decoded and parsed
          entirely in this browser tab. Nothing is uploaded, stored or logged.
        </span>
      </p>
    </div>
  );
}

/** One labelled, copyable structural component row. */
function ComponentRow({
  label,
  hint,
  value,
}: {
  label: string;
  hint: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 px-3 py-2">
      <div className="w-24 shrink-0 pt-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" title={hint}>
          {label}
        </p>
      </div>
      <code className="min-w-0 flex-1 break-all font-mono text-xs text-foreground">{value}</code>
      <div className="shrink-0">
        <CopyButton label="Copy" value={value} labelMode="icon" />
      </div>
    </div>
  );
}
