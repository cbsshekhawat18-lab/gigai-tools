"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { sanitizeSvg } from "./svg-preview";

const SIZES = [16, 20, 24, 32, 48, 64, 96, 128, 256] as const;

/** Preview surfaces mimicking real destinations. */
const SURFACES: ReadonlyArray<{ id: string; label: string; style: React.CSSProperties; dark?: boolean }> = [
  { id: "white", label: "White", style: { background: "#ffffff" } },
  { id: "dark", label: "Dark", style: { background: "#0b0b0f" }, dark: true },
  {
    id: "checker",
    label: "Transparent",
    style: {
      backgroundImage: "conic-gradient(#e5e7eb 0 25%, transparent 0 50%, #e5e7eb 0 75%, transparent 0)",
      backgroundSize: "16px 16px",
      backgroundColor: "#f9fafb",
    },
  },
  { id: "vscode", label: "VS Code", style: { background: "#1e1e1e" }, dark: true },
  { id: "github", label: "GitHub", style: { background: "#0d1117" }, dark: true },
  { id: "macos", label: "macOS", style: { background: "linear-gradient(160deg,#3a6ea5,#c86dd7)" }, dark: true },
  { id: "windows", label: "Windows", style: { background: "#0078d4" }, dark: true },
];

export interface SvgIconPreviewProps {
  svg: string;
  className?: string;
}

/**
 * Renders the (optimized) SVG at nine icon sizes across several real-world
 * backdrops, so you can confirm it stays crisp everywhere before shipping.
 */
export function SvgIconPreview({ svg, className }: SvgIconPreviewProps) {
  const [surface, setSurface] = React.useState<string>("white");
  const html = React.useMemo(() => (svg ? sanitizeSvg(svg) : ""), [svg]);
  const active = SURFACES.find((s) => s.id === surface) ?? SURFACES[0]!;

  if (!svg.trim()) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Icon preview</span>
        <div className="ml-auto flex flex-wrap gap-1">
          {SURFACES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSurface(s.id)}
              aria-pressed={surface === s.id}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors",
                surface === s.id ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 overflow-x-auto rounded-xl border border-border p-4" style={active.style}>
        {SIZES.map((size) => (
          <div key={size} className="flex shrink-0 flex-col items-center gap-1.5">
            <div
              style={{ width: size, height: size }}
              className="flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <span className={cn("text-[9px] tabular-nums", active.dark ? "text-white/60" : "text-black/50")}>{size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
