"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import { describeCron, nextCronRuns } from "@/lib/dev/cron";
import {
  CopyButton,
  ErrorBanner,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  SegmentedControl,
  ShortcutsHelp,
  useShortcuts,
  useShareState,
  useFileDrop,
  type ShortcutHint,
} from "@/components/tool/dev";

/**
 * Cron Expression Generator.
 *
 * Two-way editor: a five-field visual builder (every / every-N / range / list,
 * plus one-click presets) composes a standard cron expression; a live English
 * description (cronstrue) and next-5-runs preview (cron-parser) confirm it. The
 * expression is also editable directly, and any change reverse-parses into the
 * builder controls. All computation is client-side.
 */

// ── Field model ────────────────────────────────────────────────────────────

type FieldKey = "minute" | "hour" | "dom" | "month" | "dow";
type Mode = "every" | "everyN" | "range" | "list";

interface FieldState {
  mode: Mode;
  /** step for everyN */
  step: number;
  /** range from/to */
  from: number;
  to: number;
  /** list, comma-joined values as entered */
  list: string;
}

interface FieldMeta {
  key: FieldKey;
  label: string;
  short: string;
  min: number;
  max: number;
  icon: string;
  /** optional value → name labels (months, weekdays) */
  names?: readonly string[];
}

const FIELDS: readonly FieldMeta[] = [
  { key: "minute", label: "Minute", short: "min", min: 0, max: 59, icon: "Clock" },
  { key: "hour", label: "Hour", short: "hr", min: 0, max: 23, icon: "Clock3" },
  { key: "dom", label: "Day of month", short: "day", min: 1, max: 31, icon: "CalendarDays" },
  {
    key: "month",
    label: "Month",
    short: "mon",
    min: 1,
    max: 12,
    icon: "Calendar",
    names: ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  {
    key: "dow",
    label: "Day of week",
    short: "wday",
    min: 0,
    max: 6,
    icon: "CalendarRange",
    names: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
];

const FIELD_BY_KEY: Record<FieldKey, FieldMeta> = FIELDS.reduce(
  (acc, f) => {
    acc[f.key] = f;
    return acc;
  },
  {} as Record<FieldKey, FieldMeta>,
);

const FIELD_ORDER: readonly FieldKey[] = ["minute", "hour", "dom", "month", "dow"];

function defaultField(meta: FieldMeta): FieldState {
  return { mode: "every", step: meta.min <= 0 ? 5 : 1, from: meta.min, to: meta.max, list: String(meta.min) };
}

type Model = Record<FieldKey, FieldState>;

function defaultModel(): Model {
  return {
    minute: defaultField(FIELD_BY_KEY.minute),
    hour: defaultField(FIELD_BY_KEY.hour),
    dom: defaultField(FIELD_BY_KEY.dom),
    month: defaultField(FIELD_BY_KEY.month),
    dow: defaultField(FIELD_BY_KEY.dow),
  };
}

// ── Model → cron field token ───────────────────────────────────────────────

function clampInt(n: number, meta: FieldMeta): number {
  if (!Number.isFinite(n)) return meta.min;
  return Math.min(meta.max, Math.max(meta.min, Math.round(n)));
}

function fieldToken(meta: FieldMeta, s: FieldState): string {
  switch (s.mode) {
    case "every":
      return "*";
    case "everyN": {
      const step = Math.max(1, Math.round(s.step));
      return `*/${step}`;
    }
    case "range": {
      const from = clampInt(s.from, meta);
      const to = clampInt(s.to, meta);
      return `${from}-${to}`;
    }
    case "list": {
      const parts = s.list
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      return parts.length ? parts.join(",") : "*";
    }
    default:
      return "*";
  }
}

function modelToExpr(model: Model): string {
  return FIELD_ORDER.map((k) => fieldToken(FIELD_BY_KEY[k], model[k])).join(" ");
}

// ── cron token → model (reverse parse) ─────────────────────────────────────

/** Parse a single cron field token back into a FieldState (best-effort). */
function tokenToField(meta: FieldMeta, token: string): FieldState {
  const base = defaultField(meta);
  const t = token.trim();
  if (t === "" || t === "*" || t === "?") return { ...base, mode: "every" };

  // */N  or  start/N  → treat as everyN with step N
  const stepMatch = /^(\*|\d+)\/(\d+)$/.exec(t);
  if (stepMatch) {
    const step = Number(stepMatch[2]);
    return { ...base, mode: "everyN", step: Number.isFinite(step) && step > 0 ? step : base.step };
  }

  // a-b  → range
  const rangeMatch = /^(\d+)-(\d+)$/.exec(t);
  if (rangeMatch) {
    const from = clampInt(Number(rangeMatch[1]), meta);
    const to = clampInt(Number(rangeMatch[2]), meta);
    return { ...base, mode: "range", from, to };
  }

  // single number → list of one
  if (/^\d+$/.test(t)) {
    return { ...base, mode: "list", list: String(clampInt(Number(t), meta)) };
  }

  // comma list (numbers, ranges, steps) → list mode preserving raw
  if (t.includes(",")) {
    return { ...base, mode: "list", list: t };
  }

  // anything else (names like MON, complex mixes) → list mode, raw preserved
  return { ...base, mode: "list", list: t };
}

/**
 * Reverse-parse a full expression into a Model. Returns null when the field
 * count isn't 5 (we still let the raw expression drive description/preview, but
 * the builder only reflects standard 5-field input).
 */
function exprToModel(expr: string): Model | null {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const model = defaultModel();
  FIELD_ORDER.forEach((k, i) => {
    model[k] = tokenToField(FIELD_BY_KEY[k], parts[i] ?? "*");
  });
  return model;
}

// ── Presets ────────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  expr: string;
  icon: string;
  hint: string;
}

const PRESETS: readonly Preset[] = [
  { label: "Every minute", expr: "* * * * *", icon: "Infinity", hint: "Runs 60× an hour" },
  { label: "Every 5 min", expr: "*/5 * * * *", icon: "Timer", hint: "At :00, :05, :10…" },
  { label: "Every 15 min", expr: "*/15 * * * *", icon: "Timer", hint: "At :00, :15, :30, :45" },
  { label: "Every 30 min", expr: "*/30 * * * *", icon: "Timer", hint: "At :00 and :30" },
  { label: "Hourly", expr: "0 * * * *", icon: "Clock3", hint: "Top of every hour" },
  { label: "Daily midnight", expr: "0 0 * * *", icon: "MoonStar", hint: "00:00 every day" },
  { label: "Nightly 02:30", expr: "30 2 * * *", icon: "MoonStar", hint: "02:30 every night" },
  { label: "Weekdays 9am", expr: "0 9 * * 1-5", icon: "Briefcase", hint: "09:00 Mon–Fri" },
  { label: "Weekly (Sun)", expr: "0 0 * * 0", icon: "CalendarRange", hint: "Sunday 00:00" },
  { label: "Monthly (1st)", expr: "0 0 1 * *", icon: "CalendarDays", hint: "1st at 00:00" },
];

const MODE_OPTIONS: ReadonlyArray<{ value: Mode; label: string }> = [
  { value: "every", label: "Every" },
  { value: "everyN", label: "Every N" },
  { value: "range", label: "Range" },
  { value: "list", label: "List" },
];

const SHORTCUTS: ShortcutHint[] = [
  { combo: "mod+enter", description: "Refresh the run-time preview" },
  { combo: "mod+shift+c", description: "Copy the cron expression" },
  { combo: "mod+backspace", description: "Reset the builder" },
];

const RUN_TZ = "UTC";

/** Format an ISO run time for display (UTC, readable). */
function formatRun(iso: string): { date: string; time: string; relative: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: "", relative: "" };
  const date = d.toLocaleDateString(undefined, {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString(undefined, {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  let relative = rtf.format(diffSec, "second");
  for (const [unit, secs] of units) {
    if (Math.abs(diffSec) >= secs) {
      relative = rtf.format(Math.round(diffSec / secs), unit);
      break;
    }
  }
  return { date, time, relative };
}

export default function CronGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const accent = accentStyle(tool.accent);

  const [model, setModel] = React.useState<Model>(defaultModel);
  const [expr, setExpr] = React.useState<string>(() => modelToExpr(defaultModel()));
  const [open, setOpen] = React.useState<FieldKey | null>("minute");

  // Live async results (description + runs) for the current expression.
  const [desc, setDesc] = React.useState<string | null>(null);
  const [runs, setRuns] = React.useState<string[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [nonce, setNonce] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const share = useShareState({ onInit: (v) => applyExpr(v) });

  // Apply a raw expression string: update the text field and reverse-parse the
  // builder when it's a standard 5-field expression.
  const applyExpr = React.useCallback((raw: string) => {
    const next = raw.trim();
    setExpr(next);
    const parsed = exprToModel(next);
    if (parsed) setModel(parsed);
  }, []);

  // Update the builder model AND recompose the expression from it.
  const updateField = React.useCallback((key: FieldKey, patch: Partial<FieldState>) => {
    setModel((prev) => {
      const nextModel: Model = { ...prev, [key]: { ...prev[key], ...patch } };
      setExpr(modelToExpr(nextModel));
      return nextModel;
    });
  }, []);

  const applyPreset = React.useCallback(
    (preset: Preset) => {
      applyExpr(preset.expr);
    },
    [applyExpr],
  );

  const reset = React.useCallback(() => {
    const fresh = defaultModel();
    setModel(fresh);
    setExpr(modelToExpr(fresh));
    setOpen("minute");
    inputRef.current?.focus();
  }, []);

  // ── Live description + run preview (debounced, cancel-safe) ───────────────
  React.useEffect(() => {
    const trimmed = expr.trim();
    if (!trimmed) {
      setDesc(null);
      setRuns(null);
      setError(null);
      setPending(false);
      return;
    }
    let cancelled = false;
    setPending(true);
    const id = window.setTimeout(() => {
      void Promise.all([describeCron(trimmed), nextCronRuns(trimmed, 5, { tz: RUN_TZ })]).then(
        ([d, r]) => {
          if (cancelled) return;
          setPending(false);
          if (!d.ok) {
            setError(d.error.message);
            setDesc(null);
            setRuns(null);
            return;
          }
          setDesc(d.value);
          if (r.ok) {
            setRuns(r.value);
            setError(null);
          } else {
            setRuns(null);
            setError(r.error.message);
          }
        },
      );
    }, 160);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
      setPending(false);
    };
  }, [expr, nonce]);

  const onFiles = React.useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      file
        .text()
        .then((t) => applyExpr(t.split(/\r?\n/)[0]?.trim() ?? ""))
        .catch(() => undefined);
    },
    [applyExpr],
  );

  const { isDragging, dropProps } = useFileDrop({ onFiles, paste: false });

  const doShare = React.useCallback(() => {
    const trimmed = expr.trim();
    if (trimmed) void share.copyShareLink(trimmed);
  }, [expr, share]);

  useShortcuts({
    "mod+enter": () => setNonce((n) => n + 1),
    "mod+backspace": () => reset(),
    "mod+shift+c": () => {
      const t = expr.trim();
      if (t) void navigator.clipboard.writeText(t).catch(() => undefined);
    },
  });

  // Day-of-month + day-of-week both restricted → OR-match warning.
  const domRestricted = model.dom.mode !== "every";
  const dowRestricted = model.dow.mode !== "every";
  const bothDayFieldsSet = domRestricted && dowRestricted;

  const isFiveField = expr.trim().split(/\s+/).length === 5 && expr.trim() !== "";
  const parts = expr.trim() ? expr.trim().split(/\s+/) : [];

  return (
    <div className="flex flex-col gap-4" {...dropProps}>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <Toolbar>
        <ToolbarButton
          icon="RotateCcw"
          label="Refresh runs"
          kbd="mod+enter"
          onClick={() => setNonce((n) => n + 1)}
        />
        <ToolbarDivider />
        <CopyButton label="Copy cron" kbd="mod+shift+c" value={expr.trim()} disabled={!expr.trim()} />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Link copied!" : "Share link"}
          variant={share.justCopied ? "active" : "default"}
          onClick={doShare}
          disabled={!expr.trim()}
        />
        <ToolbarSpacer />
        <ToolbarButton
          icon="Trash2"
          label="Reset"
          kbd="mod+backspace"
          variant="destructive"
          onClick={reset}
        />
        <ShortcutsHelp shortcuts={SHORTCUTS} />
      </Toolbar>

      {share.shareError && <ErrorBanner error={share.shareError} variant="warning" />}

      {/* ── Presets ─────────────────────────────────────────────────────── */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Icon name="Sparkles" size={13} /> Presets
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => {
            const active = expr.trim() === preset.expr;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                title={`${preset.expr}: ${preset.hint}`}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? cn(accent.soft, accent.border, "shadow-sm")
                    : "border-border bg-card text-foreground hover:bg-accent",
                )}
              >
                <Icon name={preset.icon} size={13} className={active ? undefined : "text-muted-foreground"} />
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Expression bar (editable + reverse-parses) ──────────────────── */}
      <div className="relative">
        <label
          htmlFor="cron-expr"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Cron expression
        </label>
        <div
          className={cn(
            "flex items-stretch overflow-hidden rounded-lg border bg-card shadow-sm transition-colors",
            error ? "border-destructive/50" : "border-border focus-within:border-ring/60",
          )}
        >
          <input
            id="cron-expr"
            ref={inputRef}
            value={expr}
            onChange={(e) => applyExpr(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            placeholder="* * * * *"
            aria-label="Cron expression: edit directly or build below"
            aria-invalid={error ? true : undefined}
            className="min-w-0 flex-1 bg-transparent px-3.5 py-3 font-mono text-lg tracking-wide text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-xl"
          />
          <div className="flex items-center gap-1 pr-2">
            <CopyButton value={expr.trim()} label="Copy" labelMode="icon" disabled={!expr.trim()} />
          </div>
        </div>

        {/* Per-token legend under the expression */}
        {isFiveField && (
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {FIELD_ORDER.map((k, i) => {
              const meta = FIELD_BY_KEY[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setOpen((cur) => (cur === k ? null : k))}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-md border px-1 py-1.5 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    open === k ? cn(accent.border, accent.soft) : "border-border bg-muted/30 hover:bg-accent",
                  )}
                >
                  <span className="font-mono text-sm font-semibold text-foreground">{parts[i] ?? "*"}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{meta.short}</span>
                </button>
              );
            })}
          </div>
        )}

        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 text-sm font-medium text-primary">
              <Icon name="Upload" size={16} /> Drop a file to load its first line
            </span>
          </div>
        )}
      </div>

      {error && <ErrorBanner error={error} />}

      {bothDayFieldsSet && !error && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          <Icon name="TriangleAlert" size={15} className="mt-0.5 shrink-0" />
          <span>
            Both <span className="font-medium">day-of-month</span> and{" "}
            <span className="font-medium">day-of-week</span> are restricted. Standard cron runs the job when{" "}
            <em>either</em> matches (an OR), not both. Leave one as <code className="font-mono">*</code> unless you
            want that union.
          </span>
        </div>
      )}

      {/* ── Description + run preview ────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Description */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <span className={cn("flex size-6 items-center justify-center rounded", accent.soft)}>
              <Icon name="Languages" size={14} />
            </span>
            <p className="text-sm font-semibold text-foreground">In plain English</p>
          </div>
          <div className="flex min-h-[64px] items-center px-4 py-3">
            {desc ? (
              <p className="text-base leading-relaxed text-foreground">{desc}</p>
            ) : pending ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="LoaderCircle" size={14} className="animate-spin" /> Describing…
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                A plain-language description of your schedule appears here.
              </p>
            )}
          </div>
        </div>

        {/* Next runs */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className={cn("flex size-6 items-center justify-center rounded", accent.soft)}>
                <Icon name="CalendarClock" size={14} />
              </span>
              <p className="text-sm font-semibold text-foreground">Next 5 runs</p>
            </div>
            <StatBadge icon="Globe" value={RUN_TZ} title="Run times are evaluated in UTC" />
          </div>
          <div className="min-h-[64px] px-2 py-2">
            {runs && runs.length > 0 ? (
              <ol className="flex flex-col">
                {runs.map((iso, idx) => {
                  const f = formatRun(iso);
                  return (
                    <li
                      key={iso + idx}
                      className="flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50"
                    >
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate text-sm text-foreground">
                          {f.date} <span className="font-mono font-medium">{f.time}</span>
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{f.relative}</span>
                    </li>
                  );
                })}
              </ol>
            ) : pending ? (
              <p className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                <Icon name="LoaderCircle" size={14} className="animate-spin" /> Computing run times…
              </p>
            ) : (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                Upcoming run times appear here once the expression is valid.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Visual builder ──────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <Icon name="SlidersHorizontal" size={15} className="text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Field builder</p>
          {!isFiveField && expr.trim() !== "" && (
            <StatBadge tone="warning" icon="Info" value="Non-standard field count" className="ml-auto" />
          )}
        </div>
        <div className="divide-y divide-border">
          {FIELDS.map((meta) => (
            <FieldRow
              key={meta.key}
              meta={meta}
              state={model[meta.key]}
              token={fieldToken(meta, model[meta.key])}
              expanded={open === meta.key}
              accentText={accent.text}
              onToggle={() => setOpen((cur) => (cur === meta.key ? null : meta.key))}
              onChange={(patch) => updateField(meta.key, patch)}
            />
          ))}
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Icon name="Lock" size={13} className="mt-0.5 shrink-0" />
        <span>
          Every expression is built, described and previewed entirely in this browser tab with cronstrue and
          cron-parser. Nothing is uploaded. Cron has no timezone of its own; run times above are shown in UTC, so
          offset them for a server that runs in local time.
        </span>
      </p>
    </div>
  );
}

// ── One builder row ─────────────────────────────────────────────────────────

function FieldRow({
  meta,
  state,
  token,
  expanded,
  accentText,
  onToggle,
  onChange,
}: {
  meta: FieldMeta;
  state: FieldState;
  token: string;
  expanded: boolean;
  accentText: string;
  onToggle: () => void;
  onChange: (patch: Partial<FieldState>) => void;
}) {
  const rowId = `cron-field-${meta.key}`;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`${rowId}-panel`}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <Icon name={meta.icon} size={16} className="shrink-0 text-muted-foreground" />
        <span className="w-28 shrink-0 text-sm font-medium text-foreground">{meta.label}</span>
        <span className={cn("min-w-0 flex-1 truncate font-mono text-sm font-semibold", accentText)}>{token}</span>
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{summarise(meta, state, token)}</span>
        <Icon
          name="ChevronDown"
          size={16}
          className={cn("shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <div id={`${rowId}-panel`} className="flex flex-col gap-3 border-t border-border bg-muted/20 px-3 py-3">
          <SegmentedControl<Mode>
            value={state.mode}
            onChange={(mode) => onChange({ mode })}
            options={MODE_OPTIONS}
            ariaLabel={`${meta.label} rule`}
            size="sm"
          />

          {state.mode === "every" && (
            <p className="text-xs text-muted-foreground">
              Matches every {meta.label.toLowerCase()} ({meta.min}–{meta.max}).
            </p>
          )}

          {state.mode === "everyN" && (
            <label className="flex flex-wrap items-center gap-2 text-sm text-foreground">
              Every
              <input
                type="number"
                min={1}
                max={meta.max}
                value={state.step}
                onChange={(e) => onChange({ step: Math.max(1, Math.round(e.target.valueAsNumber || 1)) })}
                aria-label={`${meta.label} step`}
                className="h-8 w-20 rounded-md border border-border bg-background px-2 text-center font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              {unitName(meta)}(s) → <code className="font-mono text-muted-foreground">{token}</code>
            </label>
          )}

          {state.mode === "range" && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
              From
              <ValuePicker meta={meta} value={state.from} onChange={(from) => onChange({ from })} labelSuffix="from" />
              to
              <ValuePicker meta={meta} value={state.to} onChange={(to) => onChange({ to })} labelSuffix="to" />
            </div>
          )}

          {state.mode === "list" && (
            <label className="flex flex-col gap-1.5 text-sm text-foreground">
              <span className="text-xs text-muted-foreground">
                Comma-separated values{meta.names ? " (numbers)" : ""}, e.g.{" "}
                <code className="font-mono">{meta.min},{Math.min(meta.max, meta.min + 2)}</code>
              </span>
              <input
                type="text"
                value={state.list}
                onChange={(e) => onChange({ list: e.target.value })}
                inputMode="numeric"
                spellCheck={false}
                aria-label={`${meta.label} list`}
                placeholder={`${meta.min},${Math.min(meta.max, meta.min + 2)}`}
                className="h-8 w-full max-w-xs rounded-md border border-border bg-background px-2.5 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          )}

          {meta.names && (
            <p className="text-[11px] text-muted-foreground">
              {meta.key === "dow" ? "0 = Sunday … 6 = Saturday" : "1 = January … 12 = December"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** A native select over a field's numeric range, showing names when available. */
function ValuePicker({
  meta,
  value,
  onChange,
  labelSuffix,
}: {
  meta: FieldMeta;
  value: number;
  onChange: (v: number) => void;
  labelSuffix: string;
}) {
  const opts: number[] = [];
  for (let v = meta.min; v <= meta.max; v++) opts.push(v);
  return (
    <select
      aria-label={`${meta.label} ${labelSuffix}`}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-8 rounded-md border border-border bg-background px-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {opts.map((v) => (
        <option key={v} value={v}>
          {valueLabel(meta, v)}
        </option>
      ))}
    </select>
  );
}

// ── Small label helpers ─────────────────────────────────────────────────────

function unitName(meta: FieldMeta): string {
  switch (meta.key) {
    case "minute":
      return "minute";
    case "hour":
      return "hour";
    case "dom":
      return "day";
    case "month":
      return "month";
    case "dow":
      return "day";
    default:
      return "unit";
  }
}

function valueLabel(meta: FieldMeta, v: number): string {
  if (meta.key === "month") {
    const name = meta.names?.[v];
    return name ? `${v} (${name})` : String(v);
  }
  if (meta.key === "dow") {
    const name = meta.names?.[v];
    return name ? `${v} (${name})` : String(v);
  }
  return String(v);
}

/** A short right-aligned hint for a collapsed field row. */
function summarise(meta: FieldMeta, state: FieldState, token: string): string {
  switch (state.mode) {
    case "every":
      return `every ${unitName(meta)}`;
    case "everyN":
      return `every ${Math.max(1, Math.round(state.step))} ${unitName(meta)}s`;
    case "range":
      return `${valueLabel(meta, clampInt(state.from, meta))}–${valueLabel(meta, clampInt(state.to, meta))}`;
    case "list":
      return token === "*" ? `every ${unitName(meta)}` : token;
    default:
      return token;
  }
}
