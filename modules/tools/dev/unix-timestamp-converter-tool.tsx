"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import {
  fromUnix,
  nowUnix,
  parseFlexible,
  type UnixBreakdown,
} from "@/lib/dev/time";
import {
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
  useFileDrop,
  type ShortcutHint,
} from "@/components/tool/dev";

/** A stable, real-world sample: 2026-06-24T13:45:00Z in epoch milliseconds. */
const SAMPLE_INPUT = "1782740700000";

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Snap the current epoch into the input" },
  { combo: "mod+shift+c", description: "Copy the full conversion summary" },
  { combo: "mod+backspace", description: "Clear the input" },
];

/** Human label for how `parseFlexible` read the input. */
const INTERPRETATION_LABEL: Record<
  "unix-seconds" | "unix-milliseconds" | "date-string",
  string
> = {
  "unix-seconds": "Unix seconds",
  "unix-milliseconds": "Unix milliseconds",
  "date-string": "Date string",
};

type Conversion =
  | { ok: true; epochMs: number; interpretedAs: keyof typeof INTERPRETATION_LABEL; breakdown: UnixBreakdown }
  | { ok: false; error: string }
  | null;

/** The browser's resolved IANA timezone (for an honest "local" label). */
function localZoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "your local zone";
  } catch {
    return "your local zone";
  }
}

export default function UnixTimestampConverterTool({ tool }: { tool: WorkspaceToolData }) {
  const accent = accentStyle(tool.accent);
  const [input, setInput] = React.useState("");
  const [nowMs, setNowMs] = React.useState<number>(() => Date.now());
  const inputRef = React.useRef<HTMLInputElement>(null);

  const share = useShareState({ onInit: (v) => setInput(v) });

  // ── Live epoch clock ────────────────────────────────────────────────────
  React.useEffect(() => {
    let raf = 0;
    const tick = () => {
      setNowMs(Date.now());
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const trimmed = input.trim();

  const conversion = React.useMemo<Conversion>(() => {
    if (!trimmed) return null;
    const parsed = parseFlexible(trimmed);
    if (!parsed.ok) return { ok: false, error: parsed.error.message };
    // Anchor the relative phrase to `nowMs` so "ago" stays fresh on each tick.
    const breakdown = fromUnix(parsed.epochMs, "ms", nowMs);
    return {
      ok: true,
      epochMs: parsed.epochMs,
      interpretedAs: parsed.interpretedAs,
      breakdown,
    };
  }, [trimmed, nowMs]);

  const epochSeconds = React.useMemo(() => Math.floor(nowMs / 1000), [nowMs]);
  const localZone = React.useMemo(() => localZoneName(), []);

  const snapNow = React.useCallback(() => {
    setInput(String(nowUnix("s")));
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const clearAll = React.useCallback(() => {
    setInput("");
    inputRef.current?.focus();
  }, []);

  const loadSample = React.useCallback(() => {
    setInput(SAMPLE_INPUT);
    inputRef.current?.focus();
  }, []);

  const summary = React.useCallback(() => {
    if (!conversion || !conversion.ok) return "";
    const b = conversion.breakdown;
    const secs = Math.floor(conversion.epochMs / 1000);
    return [
      `Input:        ${trimmed}`,
      `Interpreted:  ${INTERPRETATION_LABEL[conversion.interpretedAs]}`,
      `ISO 8601:     ${b.iso}`,
      `UTC:          ${b.utc}`,
      `Local:        ${b.local} (${localZone})`,
      `Relative:     ${b.relative}`,
      `Day of week:  ${b.dayOfWeek}`,
      `Epoch (s):    ${secs}`,
      `Epoch (ms):   ${conversion.epochMs}`,
    ].join("\n");
  }, [conversion, trimmed, localZone]);

  const doShare = React.useCallback(() => {
    if (trimmed) void share.copyShareLink(trimmed);
  }, [trimmed, share]);

  const onFiles = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    file
      .text()
      .then((t) => setInput(t.trim().split(/\s+/)[0] ?? ""))
      .catch(() => undefined);
  }, []);

  const { isDragging, dropProps } = useFileDrop({ onFiles, paste: false });

  useShortcuts({
    "mod+enter": () => snapNow(),
    "mod+backspace": () => clearAll(),
    "mod+shift+c": () => {
      const out = summary();
      if (out) void navigator.clipboard.writeText(out).catch(() => undefined);
    },
  });

  const ok = conversion?.ok === true ? conversion : null;
  const errorMsg = conversion && conversion.ok === false ? conversion.error : null;
  const epochSecondsOut = ok ? Math.floor(ok.epochMs / 1000) : null;

  return (
    <div className="flex flex-col gap-4" {...dropProps}>
      {/* ── Live epoch clock ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
          accent.border,
          accent.soft,
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full bg-background/70",
              accent.text,
            )}
          >
            <Icon name="Timer" size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current Unix time
            </p>
            <p className={cn("mt-0.5 flex items-center gap-1.5 text-sm", accent.text)}>
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-current" />
              <span className="text-muted-foreground">live · ticking</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-stretch gap-2">
          <ClockField
            label="seconds"
            value={String(epochSeconds)}
            accentText={accent.text}
          />
          <ClockField
            label="milliseconds"
            value={String(nowMs)}
            accentText={accent.text}
          />
          <button
            type="button"
            onClick={snapNow}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border bg-background/70 px-3 text-sm font-medium outline-none transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring",
              accent.border,
              accent.text,
            )}
          >
            <Icon name="ArrowDownToLine" size={15} />
            <span className="hidden sm:inline">Use now</span>
          </button>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton
          icon="Sparkles"
          label="Sample"
          onClick={loadSample}
        />
        <ToolbarButton
          icon="Clock"
          label="Current epoch"
          kbd="mod+enter"
          onClick={snapNow}
        />
        <ToolbarDivider />
        <CopyButton
          label="Copy summary"
          kbd="mod+shift+c"
          getValue={summary}
          disabled={!ok}
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

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div className="relative">
        <label
          htmlFor="ts-input"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Timestamp or date
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon name="CalendarClock" size={18} />
          </span>
          <input
            ref={inputRef}
            id="ts-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 1782740700, 1782740700000, or 2026-06-24T13:45:00Z"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Unix timestamp or date to convert"
            className={cn(
              "w-full rounded-lg border bg-background py-3 pl-10 pr-3 font-mono text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/30",
              errorMsg ? "border-destructive/60" : "border-border focus-visible:border-ring/60",
            )}
          />
        </div>
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Upload" size={16} /> Drop a file to read its first value
            </span>
          </div>
        )}
      </div>

      {errorMsg && <ErrorBanner error={errorMsg} />}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!input && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              accent.soft,
            )}
          >
            <Icon name="History" size={22} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Enter a timestamp or a date to convert it instantly
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Seconds vs milliseconds is detected for you, and the moment is shown
              as ISO 8601, UTC, your local time and a relative phrase: all in your
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
            <Icon name="Sparkles" size={14} /> Try a sample timestamp
          </button>
        </div>
      )}

      {/* ── Conversion output ────────────────────────────────────────────── */}
      {ok && epochSecondsOut !== null && (
        <>
          {/* Interpretation + weekday strip */}
          <div className="flex flex-wrap items-center gap-2">
            <StatBadge
              tone="info"
              icon="WandSparkles"
              label="Interpreted as"
              value={INTERPRETATION_LABEL[ok.interpretedAs]}
            />
            <StatBadge icon="CalendarDays" label="Weekday" value={ok.breakdown.dayOfWeek} />
            <StatBadge
              tone="default"
              icon="Clock3"
              label="Relative"
              value={ok.breakdown.relative}
            />
          </div>

          {/* Human renderings */}
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultField
              icon="Calendar"
              iconClass="text-cyan-600 dark:text-cyan-400"
              iconBg="bg-cyan-500/10"
              title="ISO 8601"
              hint="Absolute, timezone-safe"
              value={ok.breakdown.iso}
              mono
            />
            <ResultField
              icon="Globe"
              iconClass="text-blue-600 dark:text-blue-400"
              iconBg="bg-blue-500/10"
              title="UTC"
              hint="Coordinated Universal Time"
              value={ok.breakdown.utc}
            />
            <ResultField
              icon="MapPin"
              iconClass="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-500/10"
              title="Local time"
              hint={localZone}
              value={ok.breakdown.local}
            />
            <ResultField
              icon="History"
              iconClass="text-amber-600 dark:text-amber-400"
              iconBg="bg-amber-500/10"
              title="Relative"
              hint="Compared to now"
              value={ok.breakdown.relative}
            />
          </div>

          {/* Epoch values */}
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultField
              icon="Hash"
              iconClass="text-cyan-600 dark:text-cyan-400"
              iconBg="bg-cyan-500/10"
              title="Epoch, seconds"
              hint="10-digit Unix time"
              value={String(epochSecondsOut)}
              mono
            />
            <ResultField
              icon="Hash"
              iconClass="text-teal-600 dark:text-teal-400"
              iconBg="bg-teal-500/10"
              title="Epoch, milliseconds"
              hint="13-digit Unix time"
              value={String(ok.epochMs)}
              mono
            />
          </div>
        </>
      )}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Conversion runs entirely in this browser tab using its native Date and
          Intl engines: nothing is uploaded. &ldquo;Local&rdquo; time reflects
          this device&apos;s timezone
          {localZone !== "your local zone" ? ` (${localZone})` : ""}; the ISO 8601
          and UTC values are absolute and identical everywhere.
        </span>
      </p>
    </div>
  );
}

/** A monospace clock readout tile inside the live-time banner. */
function ClockField({
  label,
  value,
  accentText,
}: {
  label: string;
  value: string;
  accentText: string;
}) {
  return (
    <div className="flex min-w-[8.5rem] items-center justify-between gap-2 rounded-lg border border-border bg-background/70 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn("truncate font-mono text-sm tabular-nums", accentText)}
          title={value}
        >
          {value}
        </p>
      </div>
      <CopyButton label="Copy" value={value} labelMode="icon" />
    </div>
  );
}

/** A labelled, copyable output field for one rendering of the moment. */
function ResultField({
  icon,
  iconClass,
  iconBg,
  title,
  hint,
  value,
  mono = false,
}: {
  icon: string;
  iconClass: string;
  iconBg: string;
  title: string;
  hint: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card/60 p-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <span
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded",
            iconBg,
          )}
        >
          <Icon name={icon} size={15} className={iconClass} />
        </span>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
          </div>
          <p
            className={cn(
              "mt-0.5 break-words text-sm text-foreground",
              mono && "font-mono tabular-nums",
            )}
          >
            {value}
          </p>
        </div>
      </div>
      <CopyButton label="Copy" value={value} labelMode="icon" />
    </div>
  );
}
