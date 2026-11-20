"use client";

/**
 * QR Studio: download menu.
 *
 * Pick a format (PNG / SVG / PDF / JPG / WEBP / EPS, plus transparent PNG/SVG)
 * and a size (256 → 4096 or custom), then export via `lib/qr/export`
 * (`downloadQr`). Also copies the PNG to the clipboard where supported. Honest
 * about each format (tooltip notes) and disabled when there's no payload.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { exportStyleFor } from "@/lib/export-styles";
import type { QRStyleConfig } from "@/lib/qr/style";
import { downloadQr, exportQr, QR_SIZES, type QrDownloadFormat } from "@/lib/qr/export";
import { NumberStepper, Toolbar, ToolbarButton, ToolbarSpacer } from "@/components/tool/dev";

interface FormatMeta {
  value: QrDownloadFormat;
  label: string;
  icon: string;
  note: string;
  /** Vector formats ignore the pixel-size control. */
  vector?: boolean;
}

const FORMATS: ReadonlyArray<FormatMeta> = [
  { value: "png", label: "PNG", icon: "Image", note: "Best all-round raster. Crisp, widely supported." },
  { value: "svg", label: "SVG", icon: "PenTool", note: "Vector: infinitely scalable, perfect for print & web.", vector: true },
  { value: "pdf", label: "PDF", icon: "FileText", note: "Print-ready page with the QR centred." },
  { value: "jpeg", label: "JPG", icon: "Image", note: "Smaller file; no transparency." },
  { value: "webp", label: "WEBP", icon: "Image", note: "Modern raster, smaller than PNG at similar quality." },
  { value: "eps", label: "EPS", icon: "Layers", note: "Vector PostScript for pro print. Plain matrix only. No gradients/logo/frame.", vector: true },
  { value: "png-transparent", label: "PNG · clear", icon: "SquareDashed", note: "Transparent background PNG." },
  { value: "svg-transparent", label: "SVG · clear", icon: "SquareDashed", note: "Transparent background SVG.", vector: true },
];

/** Props for {@link DownloadMenu}. */
export interface DownloadMenuProps {
  payload: string;
  style: QRStyleConfig;
  /** Base file name (no extension). Default "qr-code". */
  filename?: string;
}

/** The format + size + download surface. */
export function DownloadMenu({ payload, style, filename = "qr-code" }: DownloadMenuProps) {
  const [format, setFormat] = React.useState<QrDownloadFormat>("png");
  const [sizeChoice, setSizeChoice] = React.useState<number | "custom">(1024);
  const [customSize, setCustomSize] = React.useState(1200);
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const meta = FORMATS.find((f) => f.value === format)!;
  const size = sizeChoice === "custom" ? customSize : sizeChoice;
  const disabled = !payload;

  const doDownload = React.useCallback(async () => {
    if (!payload) return;
    setBusy(true);
    setError(null);
    try {
      await downloadQr(payload, style, size, format, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }, [payload, style, size, format, filename]);

  const doCopy = React.useCallback(async () => {
    if (!payload) return;
    setError(null);
    try {
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
        throw new Error("This browser can't copy images. Use Download instead.");
      }
      const blob = await exportQr(payload, style, size, "png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Copy failed.");
    }
  }, [payload, style, size]);

  return (
    <div className="flex flex-col gap-3">
      {/* Format grid */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {FORMATS.map((f) => {
          const active = f.value === format;
          /* Per-format identity (PNG sky, SVG fuchsia, PDF red…) when active. */
          const st = exportStyleFor(f.value.replace("-transparent", ""));
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFormat(f.value)}
              aria-pressed={active}
              title={f.note}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? cn(st.border, st.chip)
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon name={f.icon} size={14} className="shrink-0" />
              <span className="truncate">{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Format note */}
      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Icon name="Info" size={12} className="mt-0.5 shrink-0 text-primary" />
        {meta.note}
      </p>

      {/* Size */}
      <div className={cn("flex flex-col gap-2", meta.vector && "opacity-60")}>
        <span className="text-sm font-medium text-muted-foreground">
          {meta.vector ? "Size (nominal, vector scales freely)" : "Resolution"}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {QR_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSizeChoice(s)}
              aria-pressed={sizeChoice === s}
              className={cn(
                "rounded-md border px-2.5 py-1 text-sm font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                sizeChoice === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSizeChoice("custom")}
            aria-pressed={sizeChoice === "custom"}
            className={cn(
              "rounded-md border px-2.5 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              sizeChoice === "custom" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            Custom
          </button>
          {sizeChoice === "custom" && (
            <NumberStepper value={customSize} onChange={setCustomSize} min={64} max={8192} step={64} ariaLabel="Custom size in pixels" />
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
          <Icon name="TriangleAlert" size={13} /> {error}
        </p>
      )}

      {/* Actions */}
      <Toolbar>
        <ToolbarButton
          icon="Download"
          label={busy ? "Exporting…" : `Download ${meta.label}`}
          variant="primary"
          loading={busy}
          disabled={disabled}
          onClick={() => void doDownload()}
        />
        <ToolbarButton
          icon={copied ? "Check" : "Clipboard"}
          label={copied ? "Copied!" : "Copy PNG"}
          variant={copied ? "active" : "default"}
          disabled={disabled}
          onClick={() => void doCopy()}
        />
        <ToolbarSpacer />
        <span className="px-2 text-[11px] text-muted-foreground">
          {size.toLocaleString()}px · {meta.label}
        </span>
      </Toolbar>
    </div>
  );
}
