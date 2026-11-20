"use client";

/**
 * QR Studio: logo panel.
 *
 * Upload a centre logo (PNG/SVG/JPG/WEBP via drag/click/paste), tune its size,
 * margin, protected area (hide background dots), rounding and border, and get an
 * honest, live scannability warning (from `lib/qr/validate`) whenever the logo
 * endangers reliability. Operates on the engine's {@link QRLogo}.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import type { QRLogo, QRStyleConfig } from "@/lib/qr/style";
import { scanTest } from "@/lib/qr/validate";
import { FileDropZone, Toggle } from "@/components/tool/dev";
import { FixWithTool } from "@/components/tool/fix-with-tool";
import { Slider } from "./primitives";

/** Accepted logo image types. */
const ACCEPT = "image/png,image/svg+xml,image/jpeg,image/webp,.png,.svg,.jpg,.jpeg,.webp";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB - keeps the design object light.

/** Props for {@link LogoPanel}. */
export interface LogoPanelProps {
  /** The whole style, needed to run the scannability check in context. */
  style: QRStyleConfig;
  onChange: (patch: Partial<QRStyleConfig>) => void;
  /** Optional payload so the warning reflects the real code density too. */
  payload?: string;
}

/** Read a File into a data URL. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}

/** The logo controls + upload + live reliability warning. */
export function LogoPanel({ style, onChange, payload = "" }: LogoPanelProps) {
  const logo = style.logo;
  const [error, setError] = React.useState<string | null>(null);

  const patchLogo = React.useCallback(
    (p: Partial<QRLogo>) => {
      if (!style.logo) return;
      onChange({ logo: { ...style.logo, ...p } });
    },
    [style.logo, onChange],
  );

  const onFiles = React.useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (!/^image\/(png|svg\+xml|jpeg|webp)$/.test(file.type) && !/\.(png|svg|jpe?g|webp)$/i.test(file.name)) {
        setError("Unsupported file. Use a PNG, SVG, JPG, or WEBP image.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("That image is over 2 MB. Use a smaller logo so the QR stays light.");
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        setError(null);
        onChange({
          logo: {
            dataUrl,
            sizeRatio: style.logo?.sizeRatio ?? 0.25,
            margin: style.logo?.margin ?? 6,
            hideBackgroundDots: style.logo?.hideBackgroundDots ?? true,
            rounded: style.logo?.rounded ?? false,
            border: style.logo?.border ?? false,
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the image.");
      }
    },
    [onChange, style.logo],
  );

  // Live scannability: only surface logo-relevant issues here.
  const report = React.useMemo(() => (logo ? scanTest(style, payload) : null), [logo, style, payload]);
  const logoIssue = report?.issues.find((i) => /logo|error.correction|protected|dots behind/i.test(i.message));

  if (!logo) {
    return (
      <div className="flex flex-col gap-2">
        <FileDropZone
          onFiles={(f) => void onFiles(f)}
          accept={ACCEPT}
          icon="ImagePlus"
          label="Add a centre logo"
          hint="PNG, SVG, JPG, or WEBP, drop, click, or paste"
        />
        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
            <Icon name="TriangleAlert" size={13} /> {error}
          </p>
        )}
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <Icon name="Info" size={12} className="mt-0.5 shrink-0 text-primary" />
          Tip: raise error correction to <span className="font-medium text-foreground">H</span> before adding a logo so the code stays reliable.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Preview + replace/remove */}
      <div className="flex items-center gap-3 rounded-md border border-border bg-muted/20 p-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-[repeating-conic-gradient(#e5e7eb_0_25%,transparent_0_50%)] bg-[length:12px_12px] dark:bg-[repeating-conic-gradient(#374151_0_25%,transparent_0_50%)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo.dataUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">Centre logo</p>
          <p className="text-sm text-muted-foreground">{Math.round((logo.sizeRatio ?? 0.25) * 100)}% of the code</p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-within:ring-2 focus-within:ring-ring">
            <Icon name="RefreshCw" size={12} />
            Replace
            <input type="file" accept={ACCEPT} className="sr-only" onChange={(e) => e.target.files && void onFiles(Array.from(e.target.files))} />
          </label>
          <button
            type="button"
            onClick={() => {
              onChange({ logo: undefined });
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="Trash2" size={12} />
            Remove
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
          <Icon name="TriangleAlert" size={13} /> {error}
        </p>
      )}

      {/* Sliders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Slider label="Logo size" value={Math.round((logo.sizeRatio ?? 0.25) * 100)} onChange={(v) => patchLogo({ sizeRatio: v / 100 })} min={10} max={45} step={1} format={(v) => `${v}%`} />
        <Slider label="Logo margin" value={logo.margin ?? 6} onChange={(v) => patchLogo({ margin: v })} min={0} max={24} step={1} format={(v) => `${v}px`} />
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/20 p-3">
        <label className="flex items-center justify-between gap-3 text-sm text-foreground">
          <span className="flex items-center gap-2">
            <Icon name="ShieldCheck" size={15} className="text-primary" />
            Protected area (clear dots behind logo)
          </span>
          <Toggle checked={logo.hideBackgroundDots ?? true} onChange={(v) => patchLogo({ hideBackgroundDots: v })} label="" />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-foreground">
          <span className="flex items-center gap-2">
            <Icon name="Circle" size={15} className="text-muted-foreground" />
            Rounded logo corners
          </span>
          <Toggle checked={logo.rounded ?? false} onChange={(v) => patchLogo({ rounded: v })} label="" />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-foreground">
          <span className="flex items-center gap-2">
            <Icon name="Square" size={15} className="text-muted-foreground" />
            Border ring around logo
          </span>
          <Toggle checked={logo.border ?? false} onChange={(v) => patchLogo({ border: v })} label="" />
        </label>
      </div>

      {/* Honest live warning + cross-tool guidance to actually fix it */}
      {logoIssue && (
        <div>
          <div
            role="alert"
            className={cn(
              "flex items-start gap-2 rounded-md border px-3 py-2 text-sm leading-relaxed",
              logoIssue.level === "error" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-warning/40 bg-warning/10 text-warning",
            )}
          >
            <Icon name={logoIssue.level === "error" ? "OctagonAlert" : "TriangleAlert"} size={14} className="mt-0.5 shrink-0" />
            <span>{logoIssue.message}</span>
          </div>
          {/(covers|too (much|big)|shrink|footprint)/i.test(logoIssue.message) ? (
            <FixWithTool
              prompt="Prep a cleaner logo with"
              tools={[
                { slug: "image-resizer", label: "Image Resizer", icon: "Maximize2", why: "Resize your logo before adding it" },
                { slug: "image-compressor", label: "Compress Image", icon: "FileArchive", why: "Shrink the logo's file size" },
              ]}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
