"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import { generate as generateUuids, type UuidVersion } from "@/lib/dev/ids";
import type { ImageToolProps } from "@/components/tool/types";
import {
  download,
  Field,
  NumberStepper,
  SegmentedControl,
  ShortcutsHelp,
  StatBadge,
  Toggle,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  useShortcuts,
  type ShortcutHint,
} from "@/components/tool/dev";

/** Selectable UUID version (mirrors `UuidVersion` but keyed for the control). */
type VersionKey = "v4" | "v7" | "nil";

const VERSION_MAP: Record<VersionKey, UuidVersion> = {
  v4: 4,
  v7: 7,
  nil: "nil",
};

const VERSION_META: Record<VersionKey, { title: string; note: string }> = {
  v4: {
    title: "Version 4, random",
    note: "122 cryptographically-random bits. The universal default for API keys' cousins, correlation IDs and general uniqueness.",
  },
  v7: {
    title: "Version 7: time-ordered",
    note: "A 48-bit millisecond timestamp then random bits, so IDs sort by creation time, ideal as a database primary key. Note: this reveals creation time and ordering, so don't rely on it as a secret.",
  },
  nil: {
    title: "Nil UUID",
    note: "The all-zero placeholder (00000000-…-000000000000). Use it as an 'unset' default or a test sentinel.",
  },
};

const MAX_COUNT = 1000;

/** Apply live formatting (case + hyphens) to a canonical lowercase UUID. */
function formatUuid(uuid: string, upper: boolean, hyphens: boolean): string {
  let out = uuid;
  if (!hyphens) out = out.replace(/-/g, "");
  if (upper) out = out.toUpperCase();
  return out;
}

/** Escape a value for a single CSV cell (RFC 4180). */
function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * UUID Generator: v4 / v7 / nil, bulk 1–1,000, with live uppercase and hyphen
 * formatting, per-row + bulk copy, TXT/CSV export, regenerate, and session
 * history. The random base batch is generated once per "regenerate"; the
 * displayed strings are derived so toggling formatting is instant and does not
 * mint new values.
 */
export default function UuidGeneratorTool({ tool }: ImageToolProps) {
  const style = accentStyle(tool.accent);

  const [version, setVersion] = React.useState<VersionKey>("v4");
  const [count, setCount] = React.useState(1);
  const [upper, setUpper] = React.useState(false);
  const [hyphens, setHyphens] = React.useState(true);
  const [exportFmt, setExportFmt] = React.useState<"txt" | "csv">("txt");

  /** Canonical (lowercase, hyphenated) base batch: random source of truth. */
  const [base, setBase] = React.useState<string[]>([]);
  const [history, setHistory] = React.useState<string[][]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [copiedRow, setCopiedRow] = React.useState<number | null>(null);

  const regenerate = React.useCallback(
    (ver: VersionKey, n: number) => {
      try {
        const batch = generateUuids(n, VERSION_MAP[ver]);
        setBase((prev) => {
          if (prev.length > 0) setHistory((h) => [prev, ...h].slice(0, 20));
          return batch;
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [],
  );

  // Generate an initial sample on mount so the tool is never empty.
  React.useEffect(() => {
    regenerate("v4", 1);
    // Mount-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate whenever the version or count changes (these need new values).
  const firstRun = React.useRef(true);
  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    regenerate(version, count);
    // Formatting toggles intentionally excluded. They reformat live below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, count]);

  /** The displayed strings, derived live from the base batch + formatting. */
  const formatted = React.useMemo(
    () => base.map((u) => formatUuid(u, upper, hyphens)),
    [base, upper, hyphens],
  );

  const allText = React.useMemo(() => formatted.join("\n"), [formatted]);

  const copyAll = React.useCallback(async () => {
    if (!allText) return;
    try {
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      setError(
        "Couldn't access the clipboard. Use a per-row copy or export instead.",
      );
    }
  }, [allText]);

  const copyRow = React.useCallback(async (index: number, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedRow(index);
      window.setTimeout(
        () => setCopiedRow((c) => (c === index ? null : c)),
        1500,
      );
    } catch {
      setError(
        "Couldn't access the clipboard. Use the TXT or CSV export instead.",
      );
    }
  }, []);

  const doExport = React.useCallback(() => {
    if (formatted.length === 0) return;
    if (exportFmt === "csv") {
      const rows = ["uuid", ...formatted.map(csvCell)].join("\r\n");
      download("uuids-gigai.csv", rows, "text/csv;charset=utf-8");
    } else {
      download("uuids-gigai.txt", allText, "text/plain;charset=utf-8");
    }
  }, [formatted, exportFmt, allText]);

  const restore = React.useCallback((batch: string[]) => {
    setBase((prev) => {
      if (prev.length > 0) setHistory((h) => [prev, ...h].slice(0, 20));
      return batch;
    });
  }, []);

  useShortcuts({
    "mod+enter": () => regenerate(version, count),
    "mod+c": () => void copyAll(),
    "mod+s": doExport,
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+enter", description: "Generate a fresh batch" },
    { combo: "mod+c", description: "Copy all UUIDs" },
    { combo: "mod+s", description: "Export TXT / CSV" },
  ];

  const meta = VERSION_META[version];
  const isBulk = formatted.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Options panel */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <Field label="Version" htmlFor="uuid-version">
            <SegmentedControl<VersionKey>
              value={version}
              onChange={setVersion}
              ariaLabel="UUID version"
              options={[
                { value: "v4", label: "v4", icon: "Shuffle" },
                { value: "v7", label: "v7", icon: "Clock" },
                { value: "nil", label: "Nil", icon: "CircleSlash" },
              ]}
            />
          </Field>

          <Field
            label="How many"
            htmlFor="uuid-count"
            hint={`Generate 1 to ${MAX_COUNT.toLocaleString()} at once.`}
          >
            <NumberStepper
              id="uuid-count"
              value={count}
              onChange={setCount}
              min={1}
              max={MAX_COUNT}
              step={1}
              ariaLabel="Number of UUIDs to generate"
            />
          </Field>

          <Field label="Formatting" htmlFor="uuid-upper">
            <div className="flex h-8 items-center gap-4">
              <Toggle
                id="uuid-upper"
                checked={upper}
                onChange={setUpper}
                label="Uppercase"
              />
              <Toggle
                id="uuid-hyphens"
                checked={hyphens}
                onChange={setHyphens}
                label="Hyphens"
              />
            </div>
          </Field>

          <Field label="Export as" htmlFor="uuid-export">
            <SegmentedControl<"txt" | "csv">
              value={exportFmt}
              onChange={setExportFmt}
              size="sm"
              ariaLabel="Export format"
              options={[
                { value: "txt", label: "TXT" },
                { value: "csv", label: "CSV" },
              ]}
            />
          </Field>
        </div>

        {/* Honest, version-specific explainer */}
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Icon
            name="Info"
            size={14}
            className={cn("mt-0.5 shrink-0", style.text)}
          />
          <span>
            <span className="font-medium text-foreground">{meta.title}.</span>{" "}
            {meta.note}
          </span>
        </p>
      </div>

      {/* Action toolbar */}
      <Toolbar>
        <ToolbarButton
          icon="RefreshCw"
          label={base.length > 0 ? "Regenerate" : "Generate"}
          kbd="mod+enter"
          variant="primary"
          onClick={() => regenerate(version, count)}
        />
        <ToolbarDivider />
        <ToolbarButton
          icon={copiedAll ? "Check" : "Copy"}
          label={copiedAll ? "Copied!" : isBulk ? "Copy all" : "Copy"}
          kbd="mod+c"
          variant={copiedAll ? "active" : "default"}
          onClick={() => void copyAll()}
          disabled={formatted.length === 0}
        />
        <ToolbarButton
          icon="Download"
          label={`Export ${exportFmt.toUpperCase()}`}
          kbd="mod+s"
          onClick={doExport}
          disabled={formatted.length === 0}
        />
        <ToolbarSpacer />
        <ShortcutsHelp shortcuts={shortcuts} />
      </Toolbar>

      {/* Error surface */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
          <span className="min-w-0 flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="shrink-0 rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="X" size={14} />
          </button>
        </div>
      )}

      {/* Output */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {formatted.length > 0
              ? `${formatted.length.toLocaleString()} ${
                  formatted.length === 1 ? "UUID" : "UUIDs"
                }`
              : "Output"}
          </span>
          <StatBadge
            value={version === "nil" ? "nil" : version}
            icon={version === "v7" ? "Clock" : version === "nil" ? "CircleSlash" : "Shuffle"}
            tone="info"
            title="Selected UUID version"
          />
        </div>

        <div className="p-3">
          {formatted.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Icon
                name="Fingerprint"
                size={28}
                className={cn("opacity-60", style.text)}
              />
              <p className="text-sm text-muted-foreground">
                No UUID yet. Here&apos;s what one looks like:
              </p>
              <code className="rounded bg-muted/60 px-2 py-1 font-mono text-xs text-foreground">
                3f2504e0-4f89-41d3-9a0c-0305e82c3301
              </code>
              <button
                type="button"
                onClick={() => regenerate(version, count)}
                className={cn(
                  "mt-1 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  style.soft,
                )}
              >
                <Icon name="Sparkles" size={14} />
                Generate one
              </button>
            </div>
          ) : (
            <ul className="flex max-h-[26rem] flex-col gap-1 overflow-y-auto">
              {formatted.map((uuid, i) => (
                <li key={`${i}-${uuid}`}>
                  <div className="group flex items-center gap-3 rounded-md bg-muted/40 px-2.5 py-1.5 hover:bg-muted/70">
                    {isBulk && (
                      <span className="w-10 shrink-0 select-none text-right font-mono text-[11px] tabular-nums text-muted-foreground/70">
                        {i + 1}
                      </span>
                    )}
                    <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                      {uuid}
                    </code>
                    <button
                      type="button"
                      onClick={() => void copyRow(i, uuid)}
                      aria-label={
                        copiedRow === i ? "Copied" : `Copy UUID ${i + 1}`
                      }
                      className="shrink-0 rounded p-1 text-muted-foreground opacity-0 outline-none transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                    >
                      <Icon name={copiedRow === i ? "Check" : "Copy"} size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Session history */}
      {history.length > 0 && (
        <details className="rounded-lg border border-border bg-card/40">
          <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-muted-foreground">
            Previous batches ({history.length})
          </summary>
          <ul className="max-h-56 space-y-1 overflow-y-auto border-t border-border p-2">
            {history.map((batch, i) => {
              const first = batch[0] ?? "";
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => restore(batch)}
                    className="flex w-full items-center gap-3 rounded-md px-2.5 py-1.5 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon
                      name="RotateCcw"
                      size={13}
                      className="shrink-0 text-muted-foreground"
                    />
                    <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
                      {formatUuid(first, upper, hyphens)}
                    </code>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
                      {batch.length === 1
                        ? "1 UUID"
                        : `${batch.length.toLocaleString()} UUIDs`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}
