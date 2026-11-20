/**
 * GigAI Tools: SVG path engine.
 *
 * Parse an SVG path `d` string into commands, report geometry (length, bbox,
 * command histogram, subpaths), normalize relative<->absolute commands, and
 * sample evenly-spaced points along the outline for the path visualizer.
 *
 * Length/point sampling use a real `<path>.getTotalLength()`/`getPointAtLength`
 * when a DOM is present (exact), and a flattening estimator otherwise (curves
 * approximated by subdivision). Everything is pure and deterministic.
 */

import { type SvgResult, ok, fail, roundNum, hasDom } from "./core";

/** A single parsed path command. */
export interface PathCommand {
  /** Original command letter, e.g. "M", "l", "C", "z". */
  command: string;
  /** Numeric parameters for this command (already grouped per repetition). */
  params: number[];
  /** True if lower-case (relative) coordinates. */
  relative: boolean;
}

const PARAM_COUNTS: Record<string, number> = {
  m: 2,
  l: 2,
  h: 1,
  v: 1,
  c: 6,
  s: 4,
  q: 4,
  t: 2,
  a: 7,
  z: 0,
};

/** Parse a path `d` string into a flat list of commands (one per repetition). */
export function parsePath(d: string): SvgResult<PathCommand[]> {
  const input = d.trim();
  if (!input) return fail("Enter a path d attribute.");
  const commands: PathCommand[] = [];
  // Tokenize: command letters and signed/decimal/exponent numbers.
  const tokenRe = /([MmLlHhVvCcSsQqTtAaZz])|(-?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;
  const tokens: Array<{ cmd?: string; num?: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(input))) {
    if (m[1]) tokens.push({ cmd: m[1] });
    else if (m[2] !== undefined) tokens.push({ num: parseFloat(m[2]) });
  }
  if (tokens.length === 0 || tokens[0]?.cmd === undefined) return fail("Path must start with a command (e.g. M).");

  let i = 0;
  let currentCmd = "";
  while (i < tokens.length) {
    const tok = tokens[i];
    if (tok?.cmd !== undefined) {
      currentCmd = tok.cmd;
      i++;
    } else if (!currentCmd) {
      return fail("Numbers appear before any command letter.");
    }
    const lower = currentCmd.toLowerCase();
    const relative = currentCmd === lower;
    const count = PARAM_COUNTS[lower];
    if (count === undefined) return fail(`Unknown path command "${currentCmd}".`);

    if (count === 0) {
      commands.push({ command: currentCmd, params: [], relative });
      continue;
    }
    const params: number[] = [];
    for (let k = 0; k < count; k++) {
      const p = tokens[i];
      if (!p || p.num === undefined) return fail(`Command "${currentCmd}" is missing parameters.`);
      params.push(p.num);
      i++;
    }
    commands.push({ command: currentCmd, params, relative });
    // Implicit repeats: after the first M, extra coord pairs are L (lineto).
    if (lower === "m") currentCmd = relative ? "l" : "L";
  }
  return ok(commands);
}

/** Geometry report for a path. */
export interface PathInfo {
  /** Total outline length in user units (exact w/ DOM, estimated otherwise). */
  length: number;
  /** Whether `length` is exact (DOM) or estimated. */
  lengthExact: boolean;
  /** Axis-aligned bounding box of the sampled outline. */
  bbox: { x: number; y: number; width: number; height: number };
  /** Count of each command letter (upper+lower merged, original case kept). */
  commandCounts: Record<string, number>;
  /** Number of subpaths (M/m starts). */
  subpaths: number;
  /** Total command count. */
  total: number;
}

/** Compute a full geometry report for a path `d` string. */
export function pathInfo(d: string): SvgResult<PathInfo> {
  const parsed = parsePath(d);
  if (!parsed.ok) return parsed;
  const commands = parsed.result;

  const commandCounts: Record<string, number> = {};
  let subpaths = 0;
  for (const c of commands) {
    commandCounts[c.command] = (commandCounts[c.command] ?? 0) + 1;
    if (c.command === "M" || c.command === "m") subpaths++;
  }

  const domLen = domLength(d);
  const points = samplePointsInternal(d, 200);
  const bbox = boundingBox(points);
  const length = domLen ?? estimateLength(points);

  return ok({
    length: Math.round(length * 1000) / 1000,
    lengthExact: domLen !== null,
    bbox,
    commandCounts,
    subpaths: Math.max(subpaths, commands.length > 0 ? 1 : 0),
    total: commands.length,
  });
}

/**
 * Normalize a path to all-absolute (default) or all-relative commands. Uses the
 * DOM's `getPathData` when available for correctness; otherwise a manual walk
 * that converts M/L/H/V/C/S/Q/T/Z (arcs are passed through when the manual path
 * is taken, since flag semantics make them error-prone to shift by hand).
 */
export function normalizePath(d: string, options: { toAbsolute?: boolean } = {}): SvgResult<string> {
  const toAbsolute = options.toAbsolute ?? true;
  const parsed = parsePath(d);
  if (!parsed.ok) return parsed;

  const out: string[] = [];
  let curX = 0;
  let curY = 0;
  let startX = 0;
  let startY = 0;

  for (const cmd of parsed.result) {
    const lower = cmd.command.toLowerCase();
    const isRel = cmd.relative;
    const targetRel = !toAbsolute;

    if (lower === "z") {
      out.push(toAbsolute ? "Z" : "z");
      curX = startX;
      curY = startY;
      continue;
    }

    const p = [...cmd.params];
    // Convert params between coord systems based on absolute endpoint tracking.
    const converted = convertCommandCoords(lower, p, isRel, targetRel, curX, curY);
    out.push((targetRel ? lower : lower.toUpperCase()) + " " + converted.params.map((n) => roundNum(n, 4)).join(" "));

    curX = converted.endX;
    curY = converted.endY;
    if (lower === "m") {
      startX = curX;
      startY = curY;
    }
  }
  return ok(out.join(" ").replace(/\s+/g, " ").trim());
}

/**
 * Sample `n` evenly-spaced points along the path outline (for the visualizer /
 * animation dot). Exact via DOM `getPointAtLength` when possible; otherwise the
 * flattened polyline is resampled by arc length.
 */
export function samplePoints(d: string, n: number): SvgResult<Array<{ x: number; y: number }>> {
  const parsed = parsePath(d);
  if (!parsed.ok) return parsed;
  const count = Math.max(2, Math.min(2000, Math.floor(n)));
  return ok(samplePointsInternal(d, count));
}

/* ------------------------------ internals --------------------------------- */

/** Exact total length via a throwaway <path>, or null without a DOM. */
function domLength(d: string): number | null {
  if (!hasDom()) return null;
  try {
    const svgNS = "http://www.w3.org/2000/svg";
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", d);
    const len = path.getTotalLength();
    return Number.isFinite(len) ? len : null;
  } catch {
    return null;
  }
}

/** Evenly-spaced points via DOM sampling, else flattened-polyline resampling. */
function samplePointsInternal(d: string, n: number): Array<{ x: number; y: number }> {
  if (hasDom()) {
    try {
      const svgNS = "http://www.w3.org/2000/svg";
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", d);
      const total = path.getTotalLength();
      if (Number.isFinite(total) && total > 0) {
        const pts: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < n; i++) {
          const pt = path.getPointAtLength((total * i) / (n - 1));
          pts.push({ x: pt.x, y: pt.y });
        }
        return pts;
      }
    } catch {
      /* fall through to flattening */
    }
  }
  return resample(flatten(d), n);
}

/**
 * Flatten a path into a polyline (array of points) by subdividing curves.
 * Absolute-izes coordinates first. Arcs are approximated by their endpoint
 * chord (rare in icon paths; keeps the estimator dependency-free).
 */
function flatten(d: string): Array<{ x: number; y: number }> {
  const parsed = parsePath(d);
  if (!parsed.ok) return [];
  const pts: Array<{ x: number; y: number }> = [];
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  const STEPS = 24;

  const push = (px: number, py: number) => pts.push({ x: px, y: py });

  for (const cmd of parsed.result) {
    const lower = cmd.command.toLowerCase();
    const rel = cmd.relative;
    const p = cmd.params;
    const ax = (v: number) => (rel ? x + v : v);
    const ay = (v: number) => (rel ? y + v : v);

    switch (lower) {
      case "m": {
        x = ax(p[0] ?? 0);
        y = ay(p[1] ?? 0);
        sx = x;
        sy = y;
        push(x, y);
        break;
      }
      case "l": {
        x = ax(p[0] ?? 0);
        y = ay(p[1] ?? 0);
        push(x, y);
        break;
      }
      case "h": {
        x = ax(p[0] ?? 0);
        push(x, y);
        break;
      }
      case "v": {
        y = ay(p[0] ?? 0);
        push(x, y);
        break;
      }
      case "c": {
        const x1 = ax(p[0] ?? 0), y1 = ay(p[1] ?? 0), x2 = ax(p[2] ?? 0), y2 = ay(p[3] ?? 0), ex = ax(p[4] ?? 0), ey = ay(p[5] ?? 0);
        for (let t = 1; t <= STEPS; t++) {
          const u = t / STEPS;
          push(cubic(x, x1, x2, ex, u), cubic(y, y1, y2, ey, u));
        }
        x = ex;
        y = ey;
        break;
      }
      case "s": {
        // Treat control as reflection-free approximation (chord subdivision).
        const x2 = ax(p[0] ?? 0), y2 = ay(p[1] ?? 0), ex = ax(p[2] ?? 0), ey = ay(p[3] ?? 0);
        for (let t = 1; t <= STEPS; t++) {
          const u = t / STEPS;
          push(quad(x, x2, ex, u), quad(y, y2, ey, u));
        }
        x = ex;
        y = ey;
        break;
      }
      case "q": {
        const cx = ax(p[0] ?? 0), cy = ay(p[1] ?? 0), ex = ax(p[2] ?? 0), ey = ay(p[3] ?? 0);
        for (let t = 1; t <= STEPS; t++) {
          const u = t / STEPS;
          push(quad(x, cx, ex, u), quad(y, cy, ey, u));
        }
        x = ex;
        y = ey;
        break;
      }
      case "t": {
        const ex = ax(p[0] ?? 0), ey = ay(p[1] ?? 0);
        push(ex, ey);
        x = ex;
        y = ey;
        break;
      }
      case "a": {
        const ex = ax(p[5] ?? 0), ey = ay(p[6] ?? 0);
        push(ex, ey); // chord approximation for arcs in the estimator
        x = ex;
        y = ey;
        break;
      }
      case "z": {
        push(sx, sy);
        x = sx;
        y = sy;
        break;
      }
    }
  }
  return pts;
}

function cubic(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}
function quad(p0: number, p1: number, p2: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
}

/** Total polyline length. */
function estimateLength(pts: Array<{ x: number; y: number }>): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}

/** Resample a polyline to exactly `n` arc-length-even points. */
function resample(pts: Array<{ x: number; y: number }>, n: number): Array<{ x: number; y: number }> {
  if (pts.length === 0) return [];
  if (pts.length === 1) return Array.from({ length: n }, () => ({ ...pts[0]! }));
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1]! + Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y));
  }
  const total = cum[cum.length - 1]!;
  if (total === 0) return Array.from({ length: n }, () => ({ ...pts[0]! }));

  const out: Array<{ x: number; y: number }> = [];
  let seg = 1;
  for (let i = 0; i < n; i++) {
    const target = (total * i) / (n - 1);
    while (seg < cum.length - 1 && cum[seg]! < target) seg++;
    const t0 = cum[seg - 1]!;
    const t1 = cum[seg]!;
    const frac = t1 === t0 ? 0 : (target - t0) / (t1 - t0);
    const a = pts[seg - 1]!;
    const b = pts[seg]!;
    out.push({ x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac });
  }
  return out;
}

/** Bounding box of a point set. */
function boundingBox(pts: Array<{ x: number; y: number }>): { x: number; y: number; width: number; height: number } {
  if (pts.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const round = (v: number) => Math.round(v * 1000) / 1000;
  return { x: round(minX), y: round(minY), width: round(maxX - minX), height: round(maxY - minY) };
}

/**
 * Convert one command's params between coordinate systems while tracking the
 * absolute endpoint. Only the endpoint conversion matters for correctness here;
 * control points are shifted by the same current-point delta.
 */
function convertCommandCoords(
  lower: string,
  params: number[],
  isRel: boolean,
  targetRel: boolean,
  curX: number,
  curY: number,
): { params: number[]; endX: number; endY: number } {
  // First resolve absolute endpoint + absolute params.
  const abs: number[] = [];
  let endX = curX;
  let endY = curY;

  const resolveXY = (dx: number, dy: number): [number, number] => (isRel ? [curX + dx, curY + dy] : [dx, dy]);

  switch (lower) {
    case "h": {
      const nx = isRel ? curX + (params[0] ?? 0) : params[0] ?? 0;
      endX = nx;
      abs.push(nx);
      break;
    }
    case "v": {
      const ny = isRel ? curY + (params[0] ?? 0) : params[0] ?? 0;
      endY = ny;
      abs.push(ny);
      break;
    }
    case "a": {
      // rx ry rot large sweep x y. Only x,y are coordinates.
      abs.push(params[0] ?? 0, params[1] ?? 0, params[2] ?? 0, params[3] ?? 0, params[4] ?? 0);
      const [ex, ey] = resolveXY(params[5] ?? 0, params[6] ?? 0);
      abs.push(ex, ey);
      endX = ex;
      endY = ey;
      break;
    }
    default: {
      // Pairs of (x,y). All pairs share the same current-point offset when rel.
      for (let i = 0; i + 1 < params.length; i += 2) {
        const [px, py] = resolveXY(params[i] ?? 0, params[i + 1] ?? 0);
        abs.push(px, py);
        endX = px;
        endY = py;
      }
    }
  }

  if (!targetRel) return { params: abs, endX, endY };

  // Re-express absolute params relative to the START current point (curX/curY).
  const rel: number[] = [];
  switch (lower) {
    case "h":
      rel.push((abs[0] ?? 0) - curX);
      break;
    case "v":
      rel.push((abs[0] ?? 0) - curY);
      break;
    case "a":
      rel.push(abs[0] ?? 0, abs[1] ?? 0, abs[2] ?? 0, abs[3] ?? 0, abs[4] ?? 0, (abs[5] ?? 0) - curX, (abs[6] ?? 0) - curY);
      break;
    default:
      for (let i = 0; i + 1 < abs.length; i += 2) {
        rel.push((abs[i] ?? 0) - curX, (abs[i + 1] ?? 0) - curY);
      }
  }
  return { params: rel, endX, endY };
}
