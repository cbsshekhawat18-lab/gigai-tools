"use client";

/**
 * QR Studio, customization panel.
 *
 * Every visual knob for a {@link QRStyleConfig}, grouped into collapsible
 * sections: Colors (fg/bg/transparent/gradient), Shape (dot + eye styles, eye
 * color), Layout (margin, corner radius, error correction) and Frame (CTA
 * label). Controlled: it renders `style` and calls `onChange(patch)` with a
 * partial update. Debouncing is the studio's job, not the panel's.
 */

import * as React from "react";

import { Icon } from "@/lib/icons";
import type {
  QRStyleConfig,
  QRDotStyle,
  QREyeFrameStyle,
  QREyeDotStyle,
  QRErrorCorrection,
  QRGradient,
} from "@/lib/qr/style";
import { SegmentedControl, Toggle } from "@/components/tool/dev";
import { ChipPicker, ColorControl, Section, Slider, type ChipOption } from "./primitives";

/* ────────────────────────── dot/eye style previews ────────────────────────── */

/** A tiny SVG showing how a dot style looks (3 modules). */
function DotPreview({ style }: { style: QRDotStyle }) {
  const rx =
    style === "dots" ? 5 : style === "rounded" || style === "extra-rounded" ? 3.5 : style === "classy" || style === "classy-rounded" ? 2.5 : 0.5;
  return (
    <svg viewBox="0 0 34 12" width="34" height="12" fill="currentColor" aria-hidden>
      <rect x="0" y="1" width="10" height="10" rx={rx} />
      <rect x="12" y="1" width="10" height="10" rx={rx} />
      <rect x="24" y="1" width="10" height="10" rx={rx} />
    </svg>
  );
}

/** A tiny SVG of a finder-eye frame + centre. */
function EyePreview({ frame, dot }: { frame: QREyeFrameStyle; dot: QREyeDotStyle }) {
  const frameR = frame === "circle" || frame === "dot" ? 9 : frame === "rounded" || frame === "extra-rounded" ? 5 : 1;
  const dotR = dot === "circle" || dot === "dot" ? 5 : dot === "rounded" ? 2.5 : 0.5;
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden fill="none">
      <rect x="1.5" y="1.5" width="17" height="17" rx={frameR} stroke="currentColor" strokeWidth="2.5" />
      <rect x="7" y="7" width="6" height="6" rx={dotR} fill="currentColor" />
    </svg>
  );
}

const DOT_OPTIONS: ReadonlyArray<ChipOption<QRDotStyle>> = [
  { value: "square", label: "Square", preview: <DotPreview style="square" /> },
  { value: "rounded", label: "Rounded", preview: <DotPreview style="rounded" /> },
  { value: "extra-rounded", label: "Smooth", preview: <DotPreview style="extra-rounded" /> },
  { value: "dots", label: "Dots", preview: <DotPreview style="dots" /> },
  { value: "classy", label: "Classy", preview: <DotPreview style="classy" /> },
  { value: "classy-rounded", label: "Classy+", preview: <DotPreview style="classy-rounded" /> },
];

const EYE_FRAME_OPTIONS: ReadonlyArray<ChipOption<QREyeFrameStyle>> = [
  { value: "square", label: "Square", preview: <EyePreview frame="square" dot="square" /> },
  { value: "rounded", label: "Rounded", preview: <EyePreview frame="rounded" dot="square" /> },
  { value: "circle", label: "Circle", preview: <EyePreview frame="circle" dot="square" /> },
];

const EYE_DOT_OPTIONS: ReadonlyArray<ChipOption<QREyeDotStyle>> = [
  { value: "square", label: "Square", preview: <EyePreview frame="square" dot="square" /> },
  { value: "rounded", label: "Rounded", preview: <EyePreview frame="square" dot="rounded" /> },
  { value: "circle", label: "Circle", preview: <EyePreview frame="square" dot="circle" /> },
];

const FRAME_OPTIONS: ReadonlyArray<{ value: NonNullable<QRStyleConfig["frame"]>["style"]; label: string; icon: string }> = [
  { value: "none", label: "None", icon: "Square" },
  { value: "square", label: "Square", icon: "SquareDashed" },
  { value: "rounded", label: "Rounded", icon: "SquareRoundCorner" },
  { value: "scan-me", label: "Scan me", icon: "ScanLine" },
  { value: "circle", label: "Circle", icon: "Circle" },
];

const ECL_OPTIONS: ReadonlyArray<{ value: QRErrorCorrection; label: React.ReactNode }> = [
  { value: "L", label: "L" },
  { value: "M", label: "M" },
  { value: "Q", label: "Q" },
  { value: "H", label: "H" },
];

const ECL_NOTE: Record<QRErrorCorrection, string> = {
  L: "Recovers ~7%: densest, for clean on-screen links.",
  M: "Recovers ~15%, the balanced default.",
  Q: "Recovers ~25%: sturdier for print & packaging.",
  H: "Recovers ~30%: use whenever a logo overlaps the code.",
};

const GRADIENT_PRESETS: ReadonlyArray<{ label: string; from: string; to: string }> = [
  { label: "Indigo", from: "#6366f1", to: "#a78bfa" },
  { label: "Ocean", from: "#0ea5e9", to: "#22d3ee" },
  { label: "Sunset", from: "#f97316", to: "#f43f5e" },
  { label: "Forest", from: "#10b981", to: "#2dd4bf" },
];

/* ────────────────────────── panel ────────────────────────── */

/** Props for {@link CustomizationPanel}. */
export interface CustomizationPanelProps {
  style: QRStyleConfig;
  onChange: (patch: Partial<QRStyleConfig>) => void;
}

/** The full styling control surface for a QR design. */
export function CustomizationPanel({ style, onChange }: CustomizationPanelProps) {
  const gradient = style.gradient;
  const frame = style.frame ?? { style: "none" as const };

  const patchFrame = (p: Partial<NonNullable<QRStyleConfig["frame"]>>) =>
    onChange({ frame: { style: frame.style, label: frame.label, color: frame.color, textColor: frame.textColor, ...p } });

  const setGradient = (g: QRGradient | undefined) => onChange({ gradient: g });

  return (
    <div className="flex flex-col gap-3">
      {/* Colors */}
      <Section title="Colors" icon="Palette">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Foreground</span>
              <ColorControl value={style.fgColor} onChange={(v) => onChange({ fgColor: v })} ariaLabel="Foreground color" disabled={Boolean(gradient)} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Background</span>
              <ColorControl value={style.bgColor} onChange={(v) => onChange({ bgColor: v })} ariaLabel="Background color" disabled={style.transparentBg} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Transparent</span>
              <div className="flex h-9 items-center">
                <Toggle checked={Boolean(style.transparentBg)} onChange={(v) => onChange({ transparentBg: v })} label="No background" />
              </div>
            </div>
          </div>

          {/* Gradient */}
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Gradient foreground</span>
              <Toggle
                checked={Boolean(gradient)}
                onChange={(on) => setGradient(on ? { type: "linear", from: style.fgColor, to: "#a78bfa", rotation: 0 } : undefined)}
                label={gradient ? "On" : "Off"}
              />
            </div>
            {gradient && (
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">From</span>
                    <ColorControl value={gradient.from} onChange={(v) => setGradient({ ...gradient, from: v })} ariaLabel="Gradient start" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">To</span>
                    <ColorControl value={gradient.to} onChange={(v) => setGradient({ ...gradient, to: v })} ariaLabel="Gradient end" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <SegmentedControl<"linear" | "radial">
                      value={gradient.type}
                      onChange={(v) => setGradient({ ...gradient, type: v })}
                     
                      ariaLabel="Gradient type"
                      options={[
                        { value: "linear", label: "Linear" },
                        { value: "radial", label: "Radial" },
                      ]}
                    />
                  </div>
                </div>
                {gradient.type === "linear" && (
                  <Slider
                    label="Rotation"
                    value={Math.round(((gradient.rotation ?? 0) * 180) / Math.PI)}
                    onChange={(deg) => setGradient({ ...gradient, rotation: (deg * Math.PI) / 180 })}
                    min={0}
                    max={360}
                    step={5}
                    format={(v) => `${v}°`}
                  />
                )}
                <div className="flex flex-wrap gap-1.5">
                  {GRADIENT_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setGradient({ type: gradient.type, from: p.from, to: p.to, rotation: gradient.rotation })}
                      className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="h-3 w-3 rounded-full" style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Shape */}
      <Section title="Shape & dots" icon="Grid2x2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Dot style</span>
            <ChipPicker<QRDotStyle> value={style.dotStyle} onChange={(v) => onChange({ dotStyle: v })} options={DOT_OPTIONS} ariaLabel="Dot style" columns={3} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Eye frame</span>
              <ChipPicker<QREyeFrameStyle> value={style.eyeFrameStyle} onChange={(v) => onChange({ eyeFrameStyle: v })} options={EYE_FRAME_OPTIONS} ariaLabel="Eye frame style" columns={3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted-foreground">Eye centre</span>
              <ChipPicker<QREyeDotStyle> value={style.eyeDotStyle} onChange={(v) => onChange({ eyeDotStyle: v })} options={EYE_DOT_OPTIONS} ariaLabel="Eye centre style" columns={3} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">Custom eye color</span>
              <span className="text-[11px] text-muted-foreground">Off = matches the modules.</span>
            </div>
            <div className="flex items-center gap-2">
              {style.eyeColor != null ? (
                <ColorControl value={style.eyeColor} onChange={(v) => onChange({ eyeColor: v })} ariaLabel="Eye color" />
              ) : null}
              <Toggle
                checked={style.eyeColor != null}
                onChange={(on) => onChange({ eyeColor: on ? style.fgColor : undefined })}
                label=""
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Layout */}
      <Section title="Layout & reliability" icon="Ruler">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Slider label="Quiet-zone margin" value={style.margin} onChange={(v) => onChange({ margin: v })} min={0} max={48} step={2} format={(v) => `${v}px`} />
            <Slider label="Corner radius" value={style.borderRadius ?? 0} onChange={(v) => onChange({ borderRadius: v })} min={0} max={64} step={2} format={(v) => `${v}px`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Error correction</span>
            <SegmentedControl<QRErrorCorrection> value={style.errorCorrection} onChange={(v) => onChange({ errorCorrection: v })} ariaLabel="Error-correction level" options={ECL_OPTIONS} />
            <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <Icon name="Info" size={12} className="mt-0.5 shrink-0 text-primary" />
              <span>
                <span className="font-medium text-foreground">Level {style.errorCorrection}.</span> {ECL_NOTE[style.errorCorrection]}
              </span>
            </p>
          </div>
        </div>
      </Section>

      {/* Frame */}
      <Section title="Frame & call-to-action" icon="Frame" defaultOpen={false}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-muted-foreground">Frame style</span>
            <div className="flex flex-wrap gap-1.5">
              {FRAME_OPTIONS.map((opt) => {
                const active = frame.style === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => patchFrame({ style: opt.value })}
                    aria-pressed={active}
                    className={
                      "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring " +
                      (active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground")
                    }
                  >
                    <Icon name={opt.icon} size={14} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {frame.style !== "none" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="qr-frame-label" className="text-sm font-medium text-muted-foreground">
                  Label text
                </label>
                <input
                  id="qr-frame-label"
                  type="text"
                  value={frame.label ?? ""}
                  onChange={(e) => patchFrame({ label: e.target.value })}
                  placeholder="SCAN ME"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Frame color</span>
                  <ColorControl value={frame.color ?? style.fgColor} onChange={(v) => patchFrame({ color: v })} ariaLabel="Frame color" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Label color</span>
                  <ColorControl value={frame.textColor ?? style.bgColor} onChange={(v) => patchFrame({ textColor: v })} ariaLabel="Label color" />
                </div>
              </div>
            </>
          )}
        </div>
      </Section>
    </div>
  );
}
