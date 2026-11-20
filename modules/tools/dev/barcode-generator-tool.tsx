"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { WorkspaceToolData } from "@/types";
import {
  barcodeToDataUrl,
  SUPPORTED_BARCODE_FORMATS,
  type BarcodeFormat,
  type BarcodeOptions,
} from "@/lib/dev/barcode";
import {
  download,
  Field,
  NumberStepper,
  SelectField,
  ShortcutsHelp,
  StatBadge,
  Toggle,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
  useShareState,
  useShortcuts,
  type ShortcutHint,
} from "@/components/tool/dev";

/** Human-readable labels + a valid sample per symbology (for the picker + empty state). */
const FORMAT_META: Record<
  BarcodeFormat,
  { label: string; sample: string; hint: string }
> = {
  CODE128: {
    label: "CODE128 (any ASCII)",
    sample: "GigAI-TOOLS-2026",
    hint: "Compact, encodes any ASCII, letters, digits and symbols.",
  },
  CODE39: {
    label: "CODE39 (A–Z, 0–9)",
    sample: "GIGAI39",
    hint: "A–Z, 0–9 and - . space $ / + %. Widely supported by older scanners.",
  },
  EAN13: {
    label: "EAN-13 (retail)",
    sample: "978020137962",
    hint: "12–13 digits. Give 12 and the check digit is computed for you.",
  },
  EAN8: {
    label: "EAN-8 (small retail)",
    sample: "9638507",
    hint: "7–8 digits. For very small retail packages.",
  },
  UPC: {
    label: "UPC-A (US retail)",
    sample: "03600029145",
    hint: "11–12 digits. Give 11 and the check digit is computed for you.",
  },
  ITF14: {
    label: "ITF-14 (shipping cartons)",
    sample: "1540014128876",
    hint: "13–14 digits. Used on shipping cases and pallets.",
  },
  MSI: {
    label: "MSI (inventory)",
    sample: "1234567",
    hint: "Digits only. Legacy inventory and warehouse control.",
  },
  pharmacode: {
    label: "Pharmacode (pharma)",
    sample: "1234",
    hint: "A single number from 3 to 131070. Bars only, no text.",
  },
  codabar: {
    label: "Codabar (libraries, blood banks)",
    sample: "A40156B",
    hint: "Digits and - $ : / . + with optional A–D start/stop letters.",
  },
};

interface BarcodeState {
  format: BarcodeFormat;
  value: string;
  width: number;
  height: number;
  displayValue: boolean;
  fontSize: number;
}

const DEFAULT_STATE: BarcodeState = {
  format: "CODE128",
  value: FORMAT_META.CODE128.sample,
  width: 2,
  height: 100,
  displayValue: true,
  fontSize: 20,
};

/**
 * Render a barcode to a standalone SVG string via JsBarcode's SVG renderer.
 * Dynamic-imported so the library stays out of the shared bundle. Mirrors the
 * PNG path in `@/lib/dev/barcode`, but the SVG element namespace makes JsBarcode
 * emit vector output for print-quality, resolution-independent export.
 */
async function barcodeToSvg(
  value: string,
  opts: BarcodeOptions & { fontSize?: number },
): Promise<{ ok: true; svg: string } | { ok: false; error: string }> {
  try {
    const mod = await import("jsbarcode");
    const JsBarcode = (mod as { default?: unknown }).default ?? mod;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let valid = true;
    (JsBarcode as (el: SVGElement, v: string, o: unknown) => void)(svg, value, {
      format: opts.format ?? "CODE128",
      width: opts.width ?? 2,
      height: opts.height ?? 100,
      displayValue: opts.displayValue ?? true,
      fontSize: opts.fontSize ?? 20,
      lineColor: opts.lineColor ?? "#000000",
      background: opts.background ?? "#ffffff",
      margin: opts.margin ?? 10,
      valid: (isValid: boolean) => {
        valid = isValid;
      },
    });
    if (!valid) {
      return { ok: false, error: `"${value}" is not valid for ${opts.format}.` };
    }
    return { ok: true, svg: new XMLSerializer().serializeToString(svg) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Serialize the current options into a shareable string. */
function encodeState(s: BarcodeState): string {
  return JSON.stringify(s);
}

/** Parse a shared options string back into partial state (defensive). */
function decodeState(raw: string): Partial<BarcodeState> | null {
  try {
    const p = JSON.parse(raw) as Partial<BarcodeState>;
    if (typeof p !== "object" || p === null) return null;
    return p;
  } catch {
    return null;
  }
}

/**
 * Barcode Generator: a client-side 1D barcode studio. Nine symbologies render
 * live as you type, each value is validated against its format's real rules
 * (digit counts, allowed characters, pharmacode range), and results export as
 * a crisp PNG or a resolution-independent SVG. PNG + validation reuse the
 * shared engine (`@/lib/dev/barcode`); the SVG path uses JsBarcode's vector
 * renderer for print-quality output. Everything runs locally. No uploads.
 */
export default function BarcodeGeneratorTool({ tool }: { tool: WorkspaceToolData }) {
  const style = accentStyle(tool.accent);

  const [state, setState] = React.useState<BarcodeState>(DEFAULT_STATE);
  const { format, value, width, height, displayValue, fontSize } = state;

  const [pngUrl, setPngUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const share = useShareState({
    onInit: (raw) => {
      const parsed = decodeState(raw);
      if (parsed) setState((prev) => ({ ...prev, ...parsed }));
    },
  });

  const patch = React.useCallback(
    <K extends keyof BarcodeState>(key: K, val: BarcodeState[K]) =>
      setState((prev) => ({ ...prev, [key]: val })),
    [],
  );

  /** When the format changes, drop in that format's valid sample if the value is empty. */
  const onFormatChange = React.useCallback((next: BarcodeFormat) => {
    setState((prev) => ({
      ...prev,
      format: next,
      value: prev.value.trim() === "" ? FORMAT_META[next].sample : prev.value,
    }));
  }, []);

  // Live render (PNG + validation) whenever value or options change, debounced.
  React.useEffect(() => {
    let cancelled = false;
    setBusy(true);
    const id = window.setTimeout(async () => {
      const res = await barcodeToDataUrl(value, {
        format,
        width,
        height,
        displayValue,
        margin: 10,
      });
      if (cancelled) return;
      if (res.ok) {
        setPngUrl(res.result);
        setError(null);
      } else {
        setPngUrl(null);
        setError(res.error.message);
      }
      setBusy(false);
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [value, format, width, height, displayValue]);

  const meta = FORMAT_META[format];
  const hasValue = value.trim().length > 0;
  const ready = pngUrl !== null && !error;

  const baseName = React.useMemo(
    () =>
      `barcode-${format.toLowerCase()}-${
        value.replace(/[^a-z0-9]/gi, "").slice(0, 24) || "output"
      }`,
    [format, value],
  );

  const downloadPng = React.useCallback(() => {
    if (!pngUrl) return;
    const bin = atob(pngUrl.split(",")[1] ?? "");
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    download(`${baseName}.png`, bytes, "image/png");
  }, [pngUrl, baseName]);

  const downloadSvg = React.useCallback(async () => {
    const res = await barcodeToSvg(value, {
      format,
      width,
      height,
      displayValue,
      fontSize,
      margin: 10,
    });
    if (res.ok) {
      download(`${baseName}.svg`, res.svg, "image/svg+xml;charset=utf-8");
      setError(null);
    } else {
      setError(res.error);
    }
  }, [value, format, width, height, displayValue, fontSize, baseName]);

  const copyImage = React.useCallback(async () => {
    if (!pngUrl) return;
    try {
      const blob = await (await fetch(pngUrl)).blob();
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
        throw new Error("Image clipboard isn't supported in this browser.");
      }
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Download the PNG instead.`
          : "Couldn't copy the image. Download the PNG instead.",
      );
    }
  }, [pngUrl]);

  useShortcuts({
    "mod+c": () => void copyImage(),
    "mod+s": downloadPng,
    "mod+shift+s": () => void downloadSvg(),
  });

  const shortcuts: ShortcutHint[] = [
    { combo: "mod+c", description: "Copy barcode image" },
    { combo: "mod+s", description: "Download PNG" },
    { combo: "mod+shift+s", description: "Download SVG" },
  ];

  const formatOptions = SUPPORTED_BARCODE_FORMATS.map((f) => ({
    value: f,
    label: FORMAT_META[f].label,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Value + options panel */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Symbology" htmlFor="bc-format">
            <SelectField<BarcodeFormat>
              value={format}
              onChange={onFormatChange}
              options={formatOptions}
              ariaLabel="Barcode format"
            />
          </Field>

          <Field label="Value to encode" htmlFor="bc-value" hint={meta.hint}>
            <input
              id="bc-value"
              type="text"
              value={value}
              onChange={(e) => patch("value", e.target.value)}
              placeholder={meta.sample}
              spellCheck={false}
              autoComplete="off"
              className={cn(
                "h-8 w-full rounded-md border border-border bg-background px-2.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:ring-2",
                style.ring,
              )}
            />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-4">
          <Field label="Bar width" htmlFor="bc-width" hint="Thicker = easier to scan">
            <NumberStepper
              id="bc-width"
              value={width}
              onChange={(v) => patch("width", v)}
              min={1}
              max={6}
              step={1}
              ariaLabel="Bar width in pixels"
            />
          </Field>

          <Field label="Height" htmlFor="bc-height">
            <NumberStepper
              id="bc-height"
              value={height}
              onChange={(v) => patch("height", v)}
              min={20}
              max={300}
              step={10}
              ariaLabel="Barcode height in pixels"
            />
          </Field>

          <Field label="Font size" htmlFor="bc-font">
            <NumberStepper
              id="bc-font"
              value={fontSize}
              onChange={(v) => patch("fontSize", v)}
              min={8}
              max={40}
              step={2}
              ariaLabel="Human-readable text font size"
              disabled={!displayValue}
            />
          </Field>

          <Field label="Human-readable text" htmlFor="bc-showvalue">
            <div className="flex h-8 items-center">
              <Toggle
                id="bc-showvalue"
                checked={displayValue}
                onChange={(v) => patch("displayValue", v)}
                label="Show value"
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Action toolbar */}
      <Toolbar>
        <ToolbarButton
          icon={copied ? "Check" : "Copy"}
          label={copied ? "Copied!" : "Copy image"}
          kbd="mod+c"
          variant={copied ? "active" : "default"}
          onClick={() => void copyImage()}
          disabled={!ready}
        />
        <ToolbarDivider />
        <ToolbarButton
          icon="Download"
          label="PNG"
          kbd="mod+s"
          variant="primary"
          onClick={downloadPng}
          disabled={!ready}
        />
        <ToolbarButton
          icon="Download"
          label="SVG"
          kbd="mod+shift+s"
          onClick={() => void downloadSvg()}
          disabled={!hasValue}
        />
        <ToolbarButton
          icon={share.justCopied ? "Check" : "Link"}
          label={share.justCopied ? "Copied!" : "Share"}
          variant={share.justCopied ? "active" : "default"}
          onClick={() => void share.copyShareLink(encodeState(state))}
          disabled={!share.canShare(encodeState(state))}
        />
        <ToolbarSpacer />
        <ShortcutsHelp shortcuts={shortcuts} />
      </Toolbar>

      {/* Error surface */}
      {(error ?? share.shareError) && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />
          <span className="min-w-0 flex-1">{error ?? share.shareError}</span>
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
            Barcode preview
          </span>
          <div className="flex items-center gap-2">
            {busy && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Icon name="Loader" size={12} className="animate-spin" />
                Rendering
              </span>
            )}
            <StatBadge
              value={format}
              icon="ScanBarcode"
              tone={ready ? "success" : error ? "danger" : "info"}
              title="Selected symbology"
            />
          </div>
        </div>

        <div className="p-4">
          {ready && pngUrl ? (
            <figure className="flex flex-col items-center gap-3">
              <div className="flex max-w-full justify-center overflow-x-auto rounded-md bg-white p-4">
                {/* Data-URL image; next/image can't handle dynamic data URLs in static export. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pngUrl}
                  alt={`${format} barcode encoding ${value}`}
                  className="max-h-72"
                />
              </div>
              <figcaption className="text-center text-xs text-muted-foreground">
                Scannable {format} barcode. Export SVG for print-quality output at
                any size.
              </figcaption>
            </figure>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Icon
                name="ScanBarcode"
                size={30}
                className={cn("opacity-60", style.text)}
              />
              <p className="max-w-sm text-sm text-muted-foreground">
                {error
                  ? "Fix the value above to render a scannable barcode."
                  : "Enter a value to encode. Here's a valid sample for this format:"}
              </p>
              {!error && (
                <button
                  type="button"
                  onClick={() => patch("value", meta.sample)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    style.soft,
                  )}
                >
                  <Icon name="Sparkles" size={14} />
                  {meta.sample}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
