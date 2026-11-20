"use client";

/**
 * QR Studio, live preview.
 *
 * Renders the current payload + {@link QRStyleConfig} to a canvas via
 * `lib/qr/render`, inside one of four framing contexts, Desktop, Mobile, Dark,
 * Print, with a zoom control. A real-time SCAN-TEST badge (from
 * `lib/qr/validate`) reports scannable ✓ / at-risk ⚠ and the contrast ratio, so
 * the user always knows whether their beautiful code will actually scan.
 *
 * The render is async and guarded by a run token so rapid edits never paint a
 * stale frame. Errors are surfaced honestly rather than hidden.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import type { QRStyleConfig } from "@/lib/qr/style";
import { renderToCanvas } from "@/lib/qr/render";
import { scanTest, type QRScanReport } from "@/lib/qr/validate";
import { SegmentedControl, StatBadge } from "@/components/tool/dev";
import { Slider } from "./primitives";

/** Preview framing contexts. */
type PreviewMode = "desktop" | "mobile" | "dark" | "print";

const MODE_OPTIONS = [
  { value: "desktop" as const, label: "Desktop", icon: "Monitor" },
  { value: "mobile" as const, label: "Mobile", icon: "Smartphone" },
  { value: "dark" as const, label: "Dark", icon: "Moon" },
  { value: "print" as const, label: "Print", icon: "Printer" },
];

/** Props for {@link QrPreview}. */
export interface QrPreviewProps {
  payload: string;
  style: QRStyleConfig;
  /** Render resolution (px). Default 512, preview only. */
  renderSize?: number;
}

/**
 * A live, framed, zoomable QR preview with an integrated scan-test verdict.
 * Owns only view state (mode, zoom); the payload/style come from the studio.
 */
export function QrPreview({ payload, style, renderSize = 640 }: QrPreviewProps) {
  const [mode, setMode] = React.useState<PreviewMode>("desktop");
  const [zoom, setZoom] = React.useState(100);
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [rendering, setRendering] = React.useState(false);

  const report: QRScanReport = React.useMemo(() => scanTest(style, payload), [style, payload]);

  const runToken = React.useRef(0);
  React.useEffect(() => {
    const token = ++runToken.current;
    if (!payload) {
      setDataUrl(null);
      setError(null);
      setRendering(false);
      return;
    }
    setRendering(true);
    let cancelled = false;
    void (async () => {
      try {
        const canvas = await renderToCanvas(payload, style, renderSize);
        if (cancelled || token !== runToken.current) return;
        setDataUrl(canvas.toDataURL("image/png"));
        setError(null);
      } catch (err) {
        if (cancelled || token !== runToken.current) return;
        setError(err instanceof Error ? err.message : "Could not render the QR code.");
        setDataUrl(null);
      } finally {
        if (!cancelled && token === runToken.current) setRendering(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payload, style, renderSize]);

  const zoomScale = zoom / 100;

  return (
    <div className="flex flex-col gap-3">
      {/* Mode + verdict header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl<PreviewMode> value={mode} onChange={setMode} ariaLabel="Preview mode" options={MODE_OPTIONS} />
        <ScanVerdict report={report} hasPayload={Boolean(payload)} rendering={rendering} />
      </div>

      {/* Stage */}
      <div
        className={cn(
          "relative grid min-h-[20rem] place-items-center overflow-hidden rounded-xl border p-6 transition-colors",
          mode === "dark"
            ? "border-neutral-800 bg-neutral-950"
            : mode === "print"
              ? "border-neutral-300 bg-white"
              : "border-border bg-[repeating-conic-gradient(theme(colors.muted.DEFAULT)_0_25%,transparent_0_50%)] bg-[length:20px_20px]",
        )}
      >
        {payload && dataUrl ? (
          <QrFrame mode={mode}>
            <div style={{ transform: `scale(${zoomScale})`, transformOrigin: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt="QR code preview"
                className="block h-auto w-full"
                style={{ imageRendering: "auto", maxWidth: mode === "mobile" ? "220px" : "300px" }}
              />
            </div>
          </QrFrame>
        ) : error ? (
          <div className="flex max-w-sm flex-col items-center gap-2 text-center">
            <Icon name="TriangleAlert" size={30} className="text-destructive" />
            <p className="text-sm font-medium text-destructive">Couldn&apos;t render this code</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <Icon name="QrCode" size={40} className="text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Your live QR code appears here as you fill in the form.</p>
          </div>
        )}

        {rendering && payload && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
            <Icon name="LoaderCircle" size={12} className="animate-spin" /> Rendering
          </span>
        )}
      </div>

      {/* Zoom */}
      <div className="px-1">
        <Slider label="Zoom" value={zoom} onChange={setZoom} min={40} max={200} step={10} format={(v) => `${v}%`} />
      </div>

      {/* Contrast + issues */}
      {payload && report.issues.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {report.issues.map((issue, i) => (
            <li
              key={i}
              className={cn(
                "flex items-start gap-2 rounded-md border px-3 py-2 text-sm leading-relaxed",
                issue.level === "error" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-warning/40 bg-warning/10 text-warning",
              )}
            >
              <Icon name={issue.level === "error" ? "OctagonAlert" : "TriangleAlert"} size={14} className="mt-0.5 shrink-0" />
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ────────────────────────── scan verdict badge ────────────────────────── */

function ScanVerdict({ report, hasPayload, rendering }: { report: QRScanReport; hasPayload: boolean; rendering: boolean }) {
  if (!hasPayload) {
    return <StatBadge label="Scan test" value="—" tone="default" title="Add content to run the scan test" />;
  }
  const tone = report.scannable ? (report.issues.length ? "warning" : "success") : "danger";
  const value = report.scannable ? (report.issues.length ? "At risk" : "Scannable") : "Will fail";
  const icon = report.scannable ? (report.issues.length ? "TriangleAlert" : "CircleCheck") : "OctagonX";
  return (
    <div className="flex items-center gap-1.5">
      <StatBadge icon={icon} label="Scan test" value={value} tone={tone} title="Live scannability verdict" />
      <StatBadge icon="Contrast" value={`${report.contrast}:1`} tone={report.contrast >= 3 ? "default" : "warning"} title="Foreground/background contrast ratio" />
      {rendering && <span className="sr-only">Rendering preview</span>}
    </div>
  );
}

/* ────────────────────────── device frames ────────────────────────── */

/** Wraps the QR in a device/context chrome to make the preview feel real. */
function QrFrame({ mode, children }: { mode: PreviewMode; children: React.ReactNode }) {
  if (mode === "mobile") {
    return (
      <div className="rounded-[2rem] border-[6px] border-neutral-800 bg-white p-4 shadow-xl dark:border-neutral-700">
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-neutral-300" />
        {children}
        <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wide text-neutral-400">Point your camera</p>
      </div>
    );
  }
  if (mode === "print") {
    return <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 shadow-sm">{children}</div>;
  }
  if (mode === "dark") {
    return <div className="rounded-xl bg-neutral-900 p-6 shadow-2xl ring-1 ring-white/10">{children}</div>;
  }
  return <div className="rounded-xl bg-white p-6 shadow-lg ring-1 ring-black/5">{children}</div>;
}
