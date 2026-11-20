"use client";

import * as React from "react";

import { loadImage } from "@/lib/poster/export";
import { posterFontFamilies } from "@/lib/poster/fonts";
import { zoneRect } from "@/lib/poster/render";
import { INITIAL_SUPPORTER, themeOf, type Banner, type NameZone, type PhotoZone, type PosterPage, type SupporterState, type Zones } from "@/lib/poster/types";
import { cn } from "@/lib/utils";

import { PreviewCanvas } from "../preview-canvas";
import { btn, btnPrimary } from "./ui";

/**
 * Owner marks where the SUPPORTER's photo and name go on a banner. Shapes are
 * dragged on an SVG overlay whose viewBox is the banner in pixels, so a
 * pointer delta divided by the element size IS the fraction the API stores.
 * "Preview" swaps the overlay for the real renderer with a sample supporter.
 */

type Sel = { kind: "photo"; index: number } | { kind: "name" } | null;

const SAMPLE: SupporterState = { ...INITIAL_SUPPORTER, name: "रमेश शर्मा", area: "कार्यकर्ता" };
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function Range({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  const id = React.useId();
  return (
    <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
      {label} <span className="font-mono text-foreground">{(value * 100).toFixed(1)}%</span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 block w-full accent-primary" />
    </label>
  );
}

export function ZoneEditor({ banner, page, onSave }: { banner: Banner; page: PosterPage; onSave: (z: Zones) => void }) {
  const [zones, setZones] = React.useState<Zones>(() => JSON.parse(JSON.stringify(banner.zones)) as Zones);
  const [sel, setSel] = React.useState<Sel>(banner.zones.photos.length ? { kind: "photo", index: 0 } : null);
  const [preview, setPreview] = React.useState(false);
  const [img, setImg] = React.useState<HTMLImageElement | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const drag = React.useRef<{ x: number; y: number } | null>(null);
  const W = banner.width;
  const H = banner.height;

  React.useEffect(() => {
    loadImage(banner.preview_url).then(setImg).catch(() => undefined);
  }, [banner.preview_url]);

  const patchPhoto = (index: number, fn: (p: PhotoZone) => PhotoZone) =>
    setZones((z) => ({ ...z, photos: z.photos.map((p, i) => (i === index ? fn(p) : p)) }));
  const patchName = (fn: (n: NameZone) => NameZone) => setZones((z) => (z.name ? { ...z, name: fn(z.name) } : z));

  const addPhoto = (shape: PhotoZone["shape"]) => {
    const slot: PhotoZone = shape === "circle"
      ? { shape: "circle", cx: 0.2, cy: 0.16, r: 0.1 }
      : { shape: "box", cx: 0.8, cy: 0.83, w: 0.26, h: 0.27, radius: 0.015 };
    setSel({ kind: "photo", index: zones.photos.length });
    setZones((z) => ({ ...z, photos: [...z.photos, slot] }));
  };

  const setNameStyle = (style: "none" | NameZone["style"]) => {
    if (style === "none") {
      setZones((z) => ({ ...z, name: null }));
      setSel(null);
      return;
    }
    setZones((z) => ({ ...z, name: { style, cx: z.name?.cx ?? 0.33, cy: z.name?.cy ?? 0.95, size: z.name?.size ?? (style === "text" ? 0.04 : 0.024) } }));
    setSel({ kind: "name" });
  };

  const removeSelected = () => {
    if (!sel) return;
    if (sel.kind === "name") setNameStyle("none");
    else {
      setZones((z) => ({ ...z, photos: z.photos.filter((_, i) => i !== sel.index) }));
      setSel(null);
    }
  };

  const onDown = (s: Sel) => (e: React.PointerEvent<SVGElement>) => {
    e.preventDefault();
    setSel(s);
    drag.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!drag.current || !sel || !svg) return;
    const box = svg.getBoundingClientRect();
    const dx = (e.clientX - drag.current.x) / box.width;
    const dy = (e.clientY - drag.current.y) / box.height;
    drag.current = { x: e.clientX, y: e.clientY };
    if (sel.kind === "name") patchName((n) => ({ ...n, cx: clamp01(n.cx + dx), cy: clamp01(n.cy + dy) }));
    else patchPhoto(sel.index, (p) => ({ ...p, cx: clamp01(p.cx + dx), cy: clamp01(p.cy + dy) }));
  };
  const onUp = () => {
    drag.current = null;
  };

  const selectedPhoto = sel?.kind === "photo" ? zones.photos[sel.index] : undefined;
  const stroke = W * 0.006;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
      <div className="relative overflow-hidden rounded-lg bg-muted" style={{ aspectRatio: `${W} / ${H}` }}>
        {preview ? (
          img ? (
            <PreviewCanvas
              banner={img}
              size={{ w: img.naturalWidth, h: img.naturalHeight }}
              zones={zones}
              supporter={SAMPLE}
              photo={null}
              labels={{ name: page.defaults.supporter_label || "समर्थक", area: page.defaults.supporter_area || page.area }}
              fonts={posterFontFamilies}
              accent={themeOf(page).primary}
            />
          ) : null
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.preview_url} alt="" draggable={false} className="absolute inset-0 size-full select-none" />
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full touch-none" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
              {zones.photos.map((p, i) => {
                const r = zoneRect(p, W, H);
                const active = sel?.kind === "photo" && sel.index === i;
                const common = {
                  fill: active ? "rgba(255,103,31,0.28)" : "rgba(255,255,255,0.28)",
                  stroke: active ? "#FF671F" : "#FFFFFF",
                  strokeWidth: stroke,
                  strokeDasharray: active ? undefined : `${W * 0.012} ${W * 0.008}`,
                  style: { cursor: "move" } as React.CSSProperties,
                  onPointerDown: onDown({ kind: "photo", index: i }),
                };
                return p.shape === "circle"
                  ? <circle key={i} cx={r.cx} cy={r.cy} r={r.w / 2} {...common} />
                  : <rect key={i} x={r.cx - r.w / 2} y={r.cy - r.h / 2} width={r.w} height={r.h} rx={r.radius} {...common} />;
              })}
              {zones.name ? (() => {
                const n = zones.name;
                const fs = n.size * W;
                const w = n.style === "text" ? fs * 9 : fs * 7;
                const h = n.style === "text" ? fs * 2.4 : fs * 2.7;
                const active = sel?.kind === "name";
                return (
                  <g onPointerDown={onDown({ kind: "name" })} style={{ cursor: "move" }}>
                    <rect x={n.cx * W - w / 2} y={n.cy * H - h / 2} width={w} height={h} rx={fs * 0.5} fill={active ? "rgba(255,103,31,0.28)" : "rgba(255,255,255,0.4)"} stroke={active ? "#FF671F" : "#FFFFFF"} strokeWidth={stroke * 0.8} />
                    <text x={n.cx * W} y={n.cy * H} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fontWeight={700} fill="#0F172A" style={{ pointerEvents: "none" }}>
                      {n.style === "text" ? "समर्थक" : "नाम / Name"}
                    </text>
                  </g>
                );
              })() : null}
            </svg>
          </>
        )}
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Photo slots</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button type="button" onClick={() => addPhoto("circle")} className={btn} disabled={zones.photos.length >= 3}>+ Circle</button>
            <button type="button" onClick={() => addPhoto("box")} className={btn} disabled={zones.photos.length >= 3}>+ Box</button>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Supporter name</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(["none", "badge", "text"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setNameStyle(s)} className={cn(btn, (zones.name?.style ?? "none") === s && "border-primary bg-primary/10 text-primary")}>
                {s === "none" ? "None" : s === "badge" ? "White pill" : "Plain text"}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Pill floats over the art and appears once a supporter types their name. Plain text sits on a designed band and always shows a default label.</p>
        </div>

        {sel ? (
          <div className="rounded border border-border p-3">
            <p className="font-semibold">{sel.kind === "name" ? "Name label" : `${selectedPhoto?.shape === "circle" ? "Circle" : "Box"} slot ${sel.index + 1}`}</p>
            <div className="mt-2 space-y-2">
              {selectedPhoto?.shape === "circle" ? (
                <Range label="Radius" value={selectedPhoto.r} min={0.03} max={0.5} step={0.002} onChange={(v) => patchPhoto(sel.kind === "photo" ? sel.index : 0, (p) => (p.shape === "circle" ? { ...p, r: v } : p))} />
              ) : null}
              {selectedPhoto?.shape === "box" ? (
                <>
                  <Range label="Width" value={selectedPhoto.w} min={0.05} max={1} step={0.002} onChange={(v) => patchPhoto(sel.kind === "photo" ? sel.index : 0, (p) => (p.shape === "box" ? { ...p, w: v } : p))} />
                  <Range label="Height" value={selectedPhoto.h} min={0.05} max={1} step={0.002} onChange={(v) => patchPhoto(sel.kind === "photo" ? sel.index : 0, (p) => (p.shape === "box" ? { ...p, h: v } : p))} />
                  <Range label="Corner radius" value={selectedPhoto.radius} min={0} max={0.15} step={0.001} onChange={(v) => patchPhoto(sel.kind === "photo" ? sel.index : 0, (p) => (p.shape === "box" ? { ...p, radius: v } : p))} />
                </>
              ) : null}
              {sel.kind === "name" && zones.name ? (
                <Range label="Text size" value={zones.name.size} min={0.01} max={0.08} step={0.001} onChange={(v) => patchName((n) => ({ ...n, size: v }))} />
              ) : null}
            </div>
            <button type="button" onClick={removeSelected} className="mt-3 text-xs text-red-600 hover:underline">Remove</button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Drag a shape to move it. Tap one to resize it.</p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <button type="button" onClick={() => setPreview((v) => !v)} className={cn(btn, preview && "border-primary text-primary")} disabled={!img}>
            {preview ? "Back to editing" : "Preview with sample"}
          </button>
          <button type="button" onClick={() => onSave(zones)} className={btnPrimary}>Save slots</button>
        </div>
      </div>
    </div>
  );
}
