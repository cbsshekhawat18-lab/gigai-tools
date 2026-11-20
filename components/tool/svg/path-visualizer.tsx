"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import {
  CodePane,
  StatBadge,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarSpacer,
} from "@/components/tool/dev";
import { type PreviewBackground } from "./svg-preview";

/* ────────────────────────────────────────────────────────────────────────────
 * SVG path-data parser
 * Tokenises a `d` string into absolute-coordinate segments and derives the point
 * cloud we render: on-path anchors, off-path control handles, and the start/end
 * markers. Pure and dependency-free; handles all command letters incl. arcs
 * (arcs are drawn but only their endpoint anchor is surfaced, which is the
 * useful editing point).
 * ──────────────────────────────────────────────────────────────────────────── */

/** A classified point in a parsed path. */
export interface PathPoint {
  x: number;
  y: number;
  /** "anchor" = on-path node; "control" = off-path bezier handle. */
  kind: "anchor" | "control";
  /** The 0-based command index this point belongs to. */
  command: number;
}

/** Result of parsing a `d` string. */
export interface ParsedPath {
  points: PathPoint[];
  /** Axis-aligned bounds of all anchor points, or null when empty. */
  bounds: { minX: number; minY: number; maxX: number; maxY: number } | null;
  /** Number of drawing commands. */
  commandCount: number;
  /** Parse error message, or null when clean. */
  error: string | null;
}

const NUMBER_RE = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

function tokenizeArgs(chunk: string): number[] {
  const out: number[] = [];
  const matches = chunk.match(NUMBER_RE);
  if (matches) for (const m of matches) out.push(Number.parseFloat(m));
  return out;
}

/** Parse an SVG path `d` string into an absolute-coordinate point cloud. */
export function parsePath(d: string): ParsedPath {
  const points: PathPoint[] = [];
  const empty: ParsedPath = { points, bounds: null, commandCount: 0, error: null };
  if (!d.trim()) return empty;

  // Split into [letter, args] command groups.
  const groups: { cmd: string; args: number[] }[] = [];
  const re = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(d)) !== null) {
    groups.push({ cmd: match[1]!, args: tokenizeArgs(match[2]!) });
  }
  if (groups.length === 0) {
    return { ...empty, error: "No valid path commands found." };
  }

  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;
  let commandCount = 0;
  let error: string | null = null;

  const push = (x: number, y: number, kind: PathPoint["kind"]) => {
    if (Number.isFinite(x) && Number.isFinite(y)) {
      points.push({ x, y, kind, command: commandCount });
    }
  };

  try {
    for (const { cmd, args } of groups) {
      const rel = cmd === cmd.toLowerCase();
      const up = cmd.toUpperCase();

      // Consume args in the stride the command needs, repeating for implicit
      // repeats (e.g. "L 1 2 3 4" == two L segments).
      const step = (n: number, fn: (a: number[]) => void) => {
        if (n === 0) {
          fn([]);
          commandCount += 1;
          return;
        }
        if (args.length < n) {
          error = `Command "${cmd}" expects ${n} argument(s).`;
          return;
        }
        for (let i = 0; i + n <= args.length; i += n) {
          fn(args.slice(i, i + n));
          commandCount += 1;
        }
      };

      switch (up) {
        case "M":
          step(2, (a) => {
            cx = rel ? cx + a[0]! : a[0]!;
            cy = rel ? cy + a[1]! : a[1]!;
            startX = cx;
            startY = cy;
            push(cx, cy, "anchor");
          });
          break;
        case "L":
          step(2, (a) => {
            cx = rel ? cx + a[0]! : a[0]!;
            cy = rel ? cy + a[1]! : a[1]!;
            push(cx, cy, "anchor");
          });
          break;
        case "H":
          step(1, (a) => {
            cx = rel ? cx + a[0]! : a[0]!;
            push(cx, cy, "anchor");
          });
          break;
        case "V":
          step(1, (a) => {
            cy = rel ? cy + a[0]! : a[0]!;
            push(cx, cy, "anchor");
          });
          break;
        case "C":
          step(6, (a) => {
            const c1x = rel ? cx + a[0]! : a[0]!;
            const c1y = rel ? cy + a[1]! : a[1]!;
            const c2x = rel ? cx + a[2]! : a[2]!;
            const c2y = rel ? cy + a[3]! : a[3]!;
            cx = rel ? cx + a[4]! : a[4]!;
            cy = rel ? cy + a[5]! : a[5]!;
            push(c1x, c1y, "control");
            push(c2x, c2y, "control");
            push(cx, cy, "anchor");
          });
          break;
        case "S":
          step(4, (a) => {
            const c2x = rel ? cx + a[0]! : a[0]!;
            const c2y = rel ? cy + a[1]! : a[1]!;
            cx = rel ? cx + a[2]! : a[2]!;
            cy = rel ? cy + a[3]! : a[3]!;
            push(c2x, c2y, "control");
            push(cx, cy, "anchor");
          });
          break;
        case "Q":
          step(4, (a) => {
            const c1x = rel ? cx + a[0]! : a[0]!;
            const c1y = rel ? cy + a[1]! : a[1]!;
            cx = rel ? cx + a[2]! : a[2]!;
            cy = rel ? cy + a[3]! : a[3]!;
            push(c1x, c1y, "control");
            push(cx, cy, "anchor");
          });
          break;
        case "T":
          step(2, (a) => {
            cx = rel ? cx + a[0]! : a[0]!;
            cy = rel ? cy + a[1]! : a[1]!;
            push(cx, cy, "anchor");
          });
          break;
        case "A":
          step(7, (a) => {
            // a: rx ry rot large sweep x y; only the endpoint is an anchor.
            cx = rel ? cx + a[5]! : a[5]!;
            cy = rel ? cy + a[6]! : a[6]!;
            push(cx, cy, "anchor");
          });
          break;
        case "Z":
          step(0, () => {
            cx = startX;
            cy = startY;
          });
          break;
        default:
          error = `Unknown command "${cmd}".`;
      }
      if (error) break;
    }
  } catch {
    error = "Failed to parse path data.";
  }

  const anchors = points.filter((p) => p.kind === "anchor");
  let bounds: ParsedPath["bounds"] = null;
  if (anchors.length > 0) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    bounds = { minX, minY, maxX, maxY };
  }

  return { points, bounds, commandCount, error };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────────────────── */

/** Props for {@link PathVisualizer}. */
export interface PathVisualizerProps {
  /** The path `d` string. Controlled; edits flow through `onChange`. */
  d: string;
  /** Change handler; omit to make the visualiser read-only. */
  onChange?: (d: string) => void;
  /** Stroke color of the path outline. Default uses the brand accent. */
  stroke?: string;
  /** Show the editable `d` code pane below the canvas. Default true. */
  editable?: boolean;
  /** Show anchor/control point overlays. Default true. */
  showPoints?: boolean;
  /** Backdrop behind the path. Default "checker". */
  background?: PreviewBackground;
  /** Min height of the canvas in px. Default 260. */
  minHeight?: number;
  className?: string;
}

const CHECKER_BG =
  "repeating-conic-gradient(rgb(0 0 0 / 0.06) 0% 25%, transparent 0% 50%) 50% / 18px 18px";

/**
 * Visualises an SVG path: an auto-fitted outline overlaid with anchor nodes,
 * bezier control handles (with connector lines), and start/end markers. The `d`
 * string is editable inline with live redraw, plus point/command stat badges and
 * a points-overlay toggle. Everything is derived on the client. No libraries.
 */
export function PathVisualizer({
  d,
  onChange,
  stroke = "var(--primary, #6366f1)",
  editable = true,
  showPoints: showPointsProp = true,
  background = "checker",
  minHeight = 260,
  className,
}: PathVisualizerProps) {
  const [showPoints, setShowPoints] = React.useState(showPointsProp);
  const parsed = React.useMemo(() => parsePath(d), [d]);

  // Fit the path into a padded 0..100 viewBox for the overlay geometry.
  const view = React.useMemo(() => {
    const b = parsed.bounds;
    if (!b) return { minX: 0, minY: 0, w: 100, h: 100, scale: 1, pad: 8 };
    const rawW = Math.max(b.maxX - b.minX, 1e-3);
    const rawH = Math.max(b.maxY - b.minY, 1e-3);
    const pad = Math.max(rawW, rawH) * 0.08 + 2;
    return {
      minX: b.minX - pad,
      minY: b.minY - pad,
      w: rawW + pad * 2,
      h: rawH + pad * 2,
      scale: Math.max(rawW, rawH),
      pad,
    };
  }, [parsed.bounds]);

  const viewBox = `${view.minX} ${view.minY} ${view.w} ${view.h}`;
  // Marker/point radius scaled to the viewBox so overlays stay ~constant on screen.
  const r = Math.max(view.w, view.h) * 0.012;
  const strokeW = Math.max(view.w, view.h) * 0.006;

  const anchors = parsed.points.filter((p) => p.kind === "anchor");
  const controls = parsed.points.filter((p) => p.kind === "control");
  const first = anchors[0];
  const last = anchors[anchors.length - 1];

  // Connector lines from each control point to its nearest surrounding anchor.
  const handles = React.useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const c of controls) {
      // Attach to the anchor sharing the same command, or the previous anchor.
      const anchor =
        anchors.find((a) => a.command === c.command) ??
        anchors.filter((a) => a.command <= c.command).at(-1) ??
        anchors[0];
      if (anchor) lines.push({ x1: c.x, y1: c.y, x2: anchor.x, y2: anchor.y });
    }
    return lines;
  }, [controls, anchors]);

  const surfaceStyle: React.CSSProperties =
    background === "checker"
      ? { background: CHECKER_BG }
      : background === "light"
        ? { background: "#ffffff" }
        : { background: "#0b0b0f" };

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div
          className="relative flex items-center justify-center overflow-hidden p-4"
          style={{ minHeight, ...surfaceStyle }}
        >
          {parsed.points.length > 0 ? (
            <svg
              viewBox={viewBox}
              className="h-full max-h-[520px] w-full"
              style={{ minHeight: minHeight - 32 }}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Path outline with anchor and control points"
            >
              {/* Path outline */}
              <path
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeW}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />

              {showPoints && (
                <>
                  {/* Control handles */}
                  {handles.map((h, i) => (
                    <line
                      key={`h${i}`}
                      x1={h.x1}
                      y1={h.y1}
                      x2={h.x2}
                      y2={h.y2}
                      stroke="var(--muted-foreground, #94a3b8)"
                      strokeWidth={strokeW * 0.6}
                      strokeDasharray={`${r} ${r}`}
                      opacity={0.6}
                    />
                  ))}
                  {controls.map((c, i) => (
                    <rect
                      key={`c${i}`}
                      x={c.x - r * 0.8}
                      y={c.y - r * 0.8}
                      width={r * 1.6}
                      height={r * 1.6}
                      fill="var(--card, #fff)"
                      stroke="var(--muted-foreground, #94a3b8)"
                      strokeWidth={strokeW}
                    />
                  ))}
                  {/* Anchor nodes */}
                  {anchors.map((a, i) => (
                    <circle
                      key={`a${i}`}
                      cx={a.x}
                      cy={a.y}
                      r={r}
                      fill="var(--card, #fff)"
                      stroke={stroke}
                      strokeWidth={strokeW}
                    />
                  ))}
                  {/* Start marker (green) */}
                  {first && (
                    <circle
                      cx={first.x}
                      cy={first.y}
                      r={r * 1.4}
                      fill="var(--success, #22c55e)"
                      stroke="var(--card, #fff)"
                      strokeWidth={strokeW}
                    />
                  )}
                  {/* End marker (red) */}
                  {last && last !== first && (
                    <rect
                      x={last.x - r * 1.2}
                      y={last.y - r * 1.2}
                      width={r * 2.4}
                      height={r * 2.4}
                      fill="var(--destructive, #ef4444)"
                      stroke="var(--card, #fff)"
                      strokeWidth={strokeW}
                    />
                  )}
                </>
              )}
            </svg>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
              <Icon name="Spline" size={28} className="opacity-60" />
              <p className="text-sm">
                {parsed.error ?? "Enter path data to visualise it"}
              </p>
            </div>
          )}
        </div>

        <Toolbar className="rounded-none border-x-0 border-b-0 bg-muted/40">
          <ToolbarButton
            icon={showPoints ? "Eye" : "EyeOff"}
            label="Points"
            variant={showPoints ? "active" : "default"}
            onClick={() => setShowPoints((s) => !s)}
            aria-pressed={showPoints}
          />
          <ToolbarDivider />
          <div className="flex flex-wrap items-center gap-1.5">
            <StatBadge label="Commands" value={parsed.commandCount} icon="Command" />
            <StatBadge label="Anchors" value={anchors.length} icon="Dot" />
            {controls.length > 0 && (
              <StatBadge label="Handles" value={controls.length} icon="Move" />
            )}
          </div>
          <ToolbarSpacer />
          {parsed.error && (
            <StatBadge value={parsed.error} tone="danger" icon="TriangleAlert" />
          )}
        </Toolbar>
      </div>

      {editable && onChange && (
        <CodePane
          value={d}
          onChange={onChange}
          label="Path data (d)"
          placeholder="M 10 10 C 20 20, 40 20, 50 10"
          wrap
          minHeight={90}
          maxHeight={200}
          errorLine={parsed.error ? 1 : null}
          ariaLabel="Editable SVG path data"
        />
      )}
    </div>
  );
}
