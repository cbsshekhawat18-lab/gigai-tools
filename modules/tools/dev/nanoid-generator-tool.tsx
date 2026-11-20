"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import {
  generateNanoIds,
  NANOID_ALPHABETS,
  type NanoIdPreset,
} from "@/lib/dev/nanoid";
import {
  download,
  Field,
  SegmentedControl,
  NumberStepper,
  ShortcutsHelp,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  useShortcuts,
  type ShortcutHint,
} from "@/components/tool/dev";

/** Alphabet options exposed in the picker: the presets plus a Custom mode. */
type AlphabetKey = NanoIdPreset | "custom";

/** nanoid's built-in URL-safe alphabet (A–Z, a–z, 0–9, '-', '_'). */
const URL_SAFE_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

const ALPHABET_META: Record<
  Exclude<AlphabetKey, "custom">,
  { label: string; icon: string; note: string }
> = {
  default: {
    label: "URL-safe",
    icon: "Link",
    note: "The 64-character URL-safe set (A–Z, a–z, 0–9, '-', '_'). The default, safe in URLs, filenames and keys with no encoding.",
  },
  alphanumeric: {
    label: "Alphanumeric",
    icon: "CaseSensitive",
    note: "62 characters (A–Z, a–z, 0–9) with no '-' or '_', maximum portability across filesystems and CLIs.",
  },
  lowercase: {
    label: "Lowercase",
    icon: "CaseLower",
    note: "26 lowercase letters. Compact and case-insensitive, good for slugs and codes people type by hand.",
  },
  hex: {
    label: "Hex",
    icon: "Hash",
    note: "16 hexadecimal characters (0–9, a–f). Familiar and case-insensitive, but needs more length for the same entropy.",
  },
  numeric: {
    label: "Numeric",
    icon: "Binary",
    note: "10 digits only. Great for human-friendly short codes, but small alphabets collide fast, so watch the odds.",
  },
};

const PRESET_ORDER: AlphabetKey[] = [
  "default",
  "alphanumeric",
  "lowercase",
  "hex",
  "numeric",
  "custom",
];

const MAX_COUNT = 1000;
const MIN_SIZE = 2;
const MAX_SIZE = 64;

/** Remove duplicate characters, preserving first-seen order. */
function dedupe(alphabet: string): string {
  const seen = new Set<string>();
  let out = "";
  for (const ch of alphabet) {
    if (!seen.has(ch)) {
      seen.add(ch);
      out += ch;
    }
  }
  return out;
}

/**
 * Estimate the probability of at least one collision among `count` IDs of
 * `size` characters drawn from an alphabet of `alphabetSize` symbols, using the
 * birthday-paradox approximation 1 − e^(−k(k−1)/(2N)). Returns a human string.
 */
function collisionOdds(
  alphabetSize: number,
  size: number,
  count: number,
): string {
  if (alphabetSize < 1 || size < 1 || count < 2) return "Negligible";
  // N = total space = alphabetSize^size. Work in logs to avoid overflow.
  const lnN = size * Math.log(alphabetSize);
  const k = count;
  // Exponent = k(k−1)/(2N); ln of it = ln(k(k−1)/2) − lnN.
  const lnPairs = Math.log((k * (k - 1)) / 2);
  const lnExponent = lnPairs - lnN;
  // If exponent is astronomically small, probability ≈ exponent.
  if (lnExponent < -40) {
    // p ≈ e^lnExponent. Express as "1 in X" where X = e^(−lnExponent).
    const lnX = -lnExponent;
    const exp10 = lnX / Math.LN10;
    return `~1 in 10^${Math.round(exp10)}`;
  }
  const exponent = Math.exp(lnExponent);
  const p = 1 - Math.exp(-exponent);
  if (p < 1e-9) {
    const exp10 = -Math.log10(p);
    return `~1 in 10^${Math.round(exp10)}`;
  }
  if (p < 0.0001) return `~${(p * 100).toExponential(1)}%`;
  if (p > 0.9999) return "Almost certain";
  return `~${(p * 100).toPrecision(3)}%`;
}

/** Tone for the collision badge, derived from the alphabet size + length. */
function oddsTone(
  alphabetSize: number,
  size: number,
  count: number,
): "success" | "warning" | "danger" {
  if (alphabetSize < 1 || size < 1) return "danger";
  const lnN = size * Math.log(alphabetSize);
  const lnExponent = Math.log((count * (count - 1)) / 2) - lnN;
  const p = 1 - Math.exp(-Math.exp(lnExponent));
  if (p < 1e-6) return "success";
  if (p < 0.01) return "warning";
  return "danger";
}

/** Escape a value for a single CSV cell (RFC 4180). */
function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * NanoID Generator, a custom-layout generator for compact, URL-safe,
 * cryptographically-strong IDs. Size slider (2–64), five alphabet presets plus
 * a custom alphabet, bulk 1–1,000, per-row + bulk copy, TXT/CSV export, session
 * history, and a real-time birthday-paradox collision-probability estimate.
 * Generation is async (nanoid is dynamic-imported), so a request token guards
 * against out-of-order updates when options change rapidly.
 */
export default function NanoidGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [size, setSize] = React.useState(21);
  const [count, setCount] = React.useState(1);
  const [alphabetKey, setAlphabetKey] = React.useState<AlphabetKey>("default");
  const [customAlphabet, setCustomAlphabet] = React.useState("");
  const [exportFmt, setExportFmt] = React.useState<"txt" | "csv">("txt");

  const [ids, setIds] = React.useState<string[]>([]);
  const [history, setHistory] = React.useState<
    { ids: string[]; size: number; alphabet: string }[]
  >([]);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [copiedRow, setCopiedRow] = React.useState<number | null>(null);
  const [busy, setBusy] = React.useState(false);

  // Guards against stale async results winning a race.
  const reqRef = React.useRef(0);

  /** The effective alphabet string for the current selection (deduped). */
  const effectiveAlphabet = React.useMemo(() => {
    if (alphabetKey === "custom") return dedupe(customAlphabet);
    if (alphabetKey === "default") return URL_SAFE_ALPHABET;
    return NANOID_ALPHABETS[alphabetKey];
  }, [alphabetKey, customAlphabet]);

  const alphabetSize = effectiveAlphabet.length;

  const regenerate = React.useCallback(async () => {
    const token = ++reqRef.current;
    // Validate the custom alphabet before doing work.
    if (alphabetKey === "custom" && alphabetSize < 1) {
      setError("Enter at least one character for the custom alphabet.");
      setIds([]);
      return;
    }
    setBusy(true);
    try {
      const alphabetArg =
        alphabetKey === "default" ? undefined : effectiveAlphabet;
      const batch = await generateNanoIds(count, size, alphabetArg);
      if (token !== reqRef.current) return; // superseded
      setIds((prev) => {
        if (prev.length > 0) {
          setHistory((h) =>
            [{ ids: prev, size, alphabet: effectiveAlphabet }, ...h].slice(0, 20),
          );
        }
        return batch;
      });
      setError(null);
    } catch (err) {
      if (token !== reqRef.current) return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (token === reqRef.current) setBusy(false);
    }
     
  }, [count, size, alphabetKey, effectiveAlphabet, alphabetSize]);

  // Regenerate live whenever any generating option changes (debounced).
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      void regenerate();
    }, 120);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, count, alphabetKey, effectiveAlphabet]);

  const allText = React.useMemo(() => ids.join("\n"), [ids]);

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
    if (ids.length === 0) return;
    if (exportFmt === "csv") {
      const rows = ["nanoid", ...ids.map(csvCell)].join("\r\n");
      download("nanoids-gigai.csv", rows, "text/csv;charset=utf-8");
    } else {
      download("nanoids-gigai.txt", allText, "text/plain;charset=utf-8");
    }
  }, [ids, exportFmt, allText]);

  const restore = React.useCallback(
    (batch: { ids: string[] }) => {
      setIds((prev) => {
        if (prev.length > 0) {
          setHistory((h) =>
            [{ ids: prev, size, alphabet: effectiveAlphabet }, ...h].slice(0, 20),
          );
        }
        return batch.ids;
      });
    },
    [size, effectiveAlphabet],
  );

  useShortcuts({
    "mod+enter": () => void regenerate(),
    "mod+c": () => void copyAll(),
    "mod+s": doExport,
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+enter", description: "Generate a fresh batch" },
    { combo: "mod+c", description: "Copy all Nano IDs" },
    { combo: "mod+s", description: "Export TXT / CSV" },
  ];

  const isBulk = ids.length > 1;
  const meta =
    alphabetKey === "custom" ? null : ALPHABET_META[alphabetKey];
  const odds = collisionOdds(alphabetSize, size, Math.max(count, 2));
  const tone = oddsTone(alphabetSize, size, Math.max(count, 2));

  return (
    <div className="flex flex-col gap-4">
      {/* Options panel */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="flex flex-col gap-4">
          {/* Length slider */}
          <Field
            label={`Length, ${size} character${size === 1 ? "" : "s"}`}
            htmlFor="nanoid-size"
            hint={`Between ${MIN_SIZE} and ${MAX_SIZE}. 21 matches UUID v4 entropy.`}
          >
            <div className="flex items-center gap-4">
              <input
                id="nanoid-size"
                type="range"
                min={MIN_SIZE}
                max={MAX_SIZE}
                step={1}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                aria-label="Nano ID length"
                className={cn(
                  "h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted outline-none accent-current focus-visible:ring-2 focus-visible:ring-ring",
                  style.text,
                )}
              />
              <NumberStepper
                value={size}
                onChange={setSize}
                min={MIN_SIZE}
                max={MAX_SIZE}
                step={1}
                ariaLabel="Nano ID length (exact)"
              />
            </div>
          </Field>

          {/* Alphabet + count + export */}
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            <Field label="Alphabet" htmlFor="nanoid-alphabet">
              <SegmentedControl<AlphabetKey>
                value={alphabetKey}
                onChange={setAlphabetKey}
                size="sm"
                ariaLabel="Alphabet preset"
                options={PRESET_ORDER.map((k) =>
                  k === "custom"
                    ? { value: k, label: "Custom", icon: "Pencil" }
                    : {
                        value: k,
                        label: ALPHABET_META[k].label,
                        icon: ALPHABET_META[k].icon,
                      },
                )}
              />
            </Field>

            <Field
              label="How many"
              htmlFor="nanoid-count"
              hint={`Generate 1 to ${MAX_COUNT.toLocaleString()} at once.`}
            >
              <NumberStepper
                id="nanoid-count"
                value={count}
                onChange={setCount}
                min={1}
                max={MAX_COUNT}
                step={1}
                ariaLabel="Number of Nano IDs to generate"
              />
            </Field>

            <Field label="Export as" htmlFor="nanoid-export">
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

          {/* Custom alphabet input */}
          {alphabetKey === "custom" && (
            <Field
              label="Custom alphabet"
              htmlFor="nanoid-custom"
              hint={
                alphabetSize > 0
                  ? `${alphabetSize} unique character${
                      alphabetSize === 1 ? "" : "s"
                    } (duplicates are removed).`
                  : "Type the characters your IDs may contain."
              }
            >
              <input
                id="nanoid-custom"
                type="text"
                value={customAlphabet}
                onChange={(e) => setCustomAlphabet(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                placeholder="e.g. 23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
                aria-label="Custom alphabet characters"
                className={cn(
                  "w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm outline-none focus-visible:ring-2",
                  style.ring,
                )}
              />
            </Field>
          )}
        </div>

        {/* Alphabet explainer */}
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Icon
            name="Info"
            size={14}
            className={cn("mt-0.5 shrink-0", style.text)}
          />
          <span>
            {meta ? (
              <>
                <span className="font-medium text-foreground">
                  {meta.label}.
                </span>{" "}
                {meta.note}
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">
                  Custom alphabet.
                </span>{" "}
                IDs use only your characters. Duplicates are removed, and the
                effective size drives the collision estimate: omit look-alikes
                (0/O, 1/l/I) for codes people read aloud.
              </>
            )}
          </span>
        </p>
      </div>

      {/* Action toolbar */}
      <Toolbar>
        <ToolbarButton
          icon="RefreshCw"
          label={ids.length > 0 ? "Regenerate" : "Generate"}
          kbd="mod+enter"
          variant="primary"
          loading={busy}
          onClick={() => void regenerate()}
        />
        <ToolbarDivider />
        <ToolbarButton
          icon={copiedAll ? "Check" : "Copy"}
          label={copiedAll ? "Copied!" : isBulk ? "Copy all" : "Copy"}
          kbd="mod+c"
          variant={copiedAll ? "active" : "default"}
          onClick={() => void copyAll()}
          disabled={ids.length === 0}
        />
        <ToolbarButton
          icon="Download"
          label={`Export ${exportFmt.toUpperCase()}`}
          kbd="mod+s"
          onClick={doExport}
          disabled={ids.length === 0}
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {ids.length > 0
              ? `${ids.length.toLocaleString()} Nano ID${
                  ids.length === 1 ? "" : "s"
                } · ${size} chars`
              : "Output"}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatBadge
              value={`${alphabetSize} symbols`}
              icon="Type"
              tone="info"
              title="Effective alphabet size"
            />
            <StatBadge
              label="Collision"
              value={odds}
              icon="Sigma"
              tone={tone}
              title={`Estimated probability of any collision across ${Math.max(
                count,
                2,
              ).toLocaleString()} IDs (birthday paradox)`}
            />
          </div>
        </div>

        <div className="p-3">
          {ids.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Icon
                name="Hash"
                size={28}
                className={cn("opacity-60", style.text)}
              />
              <p className="text-sm text-muted-foreground">
                No Nano ID yet. Here&apos;s what a default one looks like:
              </p>
              <code className="rounded bg-muted/60 px-2 py-1 font-mono text-xs text-foreground">
                V1StGXR8_Z5jdHi6B-myT
              </code>
              <button
                type="button"
                onClick={() => void regenerate()}
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
              {ids.map((id, i) => (
                <li key={`${i}-${id}`}>
                  <div className="group flex items-center gap-3 rounded-md bg-muted/40 px-2.5 py-1.5 hover:bg-muted/70">
                    {isBulk && (
                      <span className="w-10 shrink-0 select-none text-right font-mono text-[11px] tabular-nums text-muted-foreground/70">
                        {i + 1}
                      </span>
                    )}
                    <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                      {id}
                    </code>
                    <button
                      type="button"
                      onClick={() => void copyRow(i, id)}
                      aria-label={
                        copiedRow === i ? "Copied" : `Copy Nano ID ${i + 1}`
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
              const first = batch.ids[0] ?? "";
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
                      {first}
                    </code>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
                      {batch.ids.length === 1
                        ? "1 ID"
                        : `${batch.ids.length.toLocaleString()} IDs`}
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
