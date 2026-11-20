"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { SegmentedControl } from "@/components/tool/dev";
import { sanitizeSvg } from "./svg-preview";

/** The six preview backdrops from the spec. */
export type CompareBackground =
  | "transparent"
  | "checker"
  | "white"
  | "black"
  | "vscode-dark"
  | "vscode-light";

const BACKGROUNDS: ReadonlyArray<{ id: CompareBackground; label: string }> = [
  { id: "transparent", label: "Transparent" },
  { id: "checker", label: "Checkerboard" },
  { id: "white", label: "White" },
  { id: "black", label: "Black" },
  { id: "vscode-dark", label: "VS Code Dark" },
  { id: "vscode-light", label: "VS Code Light" },
];

/** Inline style for a backdrop. */
function bgStyle(bg: CompareBackground): React.CSSProperties {
  switch (bg) {
    case "white":
      return { background: "#ffffff" };
    case "black":
      return { background: "#000000" };
    case "vscode-dark":
      return { background: "#1e1e1e" };
    case "vscode-light":
      return { background: "#f3f3f3" };
    case "checker":
      return {
        backgroundImage:
          "conic-gradient(var(--svg-checker-a,#e5e7eb) 0 25%, transparent 0 50%, var(--svg-checker-a,#e5e7eb) 0 75%, transparent 0)",
        backgroundSize: "20px 20px",
        backgroundColor: "var(--svg-checker-b,#f9fafb)",
      };
    case "transparent":
    default:
      return {};
  }
}

/** A sanitized, size-to-fit SVG surface. */
function SvgSurface({ svg, ariaLabel }: { svg: string; ariaLabel: string }) {
  const html = React.useMemo(() => (svg ? sanitizeSvg(svg) : ""), [svg]);
  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden p-4 [&>svg]:h-auto [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:max-w-full"
      aria-label={ariaLabel}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export interface SvgCompareProps {
  original: string;
  optimized: string;
  className?: string;
  minHeight?: number;
}

/**
 * Before/After SVG comparison: a draggable split slider or a side-by-side view,
 * over any of six backdrops. Both inputs are DOMPurify-sanitized before render.
 */
export function SvgCompare({ original, optimized, className, minHeight = 320 }: SvgCompareProps) {
  const [view, setView] = React.useState<"split" | "side">("split");
  const [bg, setBg] = React.useState<CompareBackground>("checker");
  const [pos, setPos] = React.useState(50); // slider %, left = original
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const updateFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const style = bgStyle(bg);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl<"split" | "side">
          value={view}
          onChange={setView}
          ariaLabel="Comparison view"
         
          options={[
            { value: "split", label: "Split", icon: "Columns2" },
            { value: "side", label: "Side by side", icon: "LayoutGrid" },
          ]}
        />
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBg(b.id)}
              aria-pressed={bg === b.id}
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                bg === b.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {view === "side" ? (
        <div className="grid grid-cols-2 gap-2" style={{ minHeight }}>
          {[
            { label: "Before", svg: original },
            { label: "After", svg: optimized },
          ].map((pane) => (
            <div key={pane.label} className="relative overflow-hidden rounded-xl border border-border" style={style}>
              <span className="absolute left-2 top-2 z-10 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur">
                {pane.label}
              </span>
              <SvgSurface svg={pane.svg} ariaLabel={`${pane.label} SVG`} />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative select-none overflow-hidden rounded-xl border border-border"
          style={{ ...style, minHeight }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* After (base, full) */}
          <div className="absolute inset-0">
            <SvgSurface svg={optimized} ariaLabel="Optimized SVG" />
          </div>
          {/* Before (overlay, clipped to the left of the handle) */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <div className="absolute inset-0" style={style} />
            <SvgSurface svg={original} ariaLabel="Original SVG" />
          </div>

          {/* Labels */}
          <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur">
            Before
          </span>
          <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur">
            After
          </span>

          {/* Handle */}
          <div
            className="absolute inset-y-0 z-20 flex cursor-ew-resize items-center justify-center"
            style={{ left: `${pos}%`, transform: "translateX(-50%)", touchAction: "none" }}
            onPointerDown={onPointerDown}
          >
            <div className="h-full w-0.5 bg-primary/80" />
            <div className="absolute flex size-9 items-center justify-center rounded-full border-2 border-primary bg-background shadow">
              <Icon name="ChevronsLeftRight" size={14} className="text-primary" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
