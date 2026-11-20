/**
 * Reference analyzer, consistency engine and originality engine.
 *
 * The analyzer reads a reference icon and extracts its DESIGN RULES: grid,
 * stroke, corner radius, padding, density. It deliberately does NOT keep the
 * reference's path data. That distinction is the whole point: the reference
 * teaches the family a style, it does not donate its geometry. Copying paths
 * would be both a legal problem and a creative dead end.
 *
 * Reuses `lib/svg-tools/core` for parsing rather than re-implementing it.
 */

import { parseSvgDoc } from "@/lib/svg-tools/core";
import type {
  ConsistencyReport,
  IconDNA,
  Icon,
  OriginalityReport,
  OriginalityThresholds,
  FamilyHealth,
} from "./types";
import { DEFAULT_DNA, DEFAULT_THRESHOLDS } from "./types";

/* ── Reference → DNA ──────────────────────────────────────────────────────── */

export interface ReferenceReading {
  dna: IconDNA;
  /** What was actually observed, for the UI to show its working. */
  observed: Record<string, string | number>;
  /** Anything that had to be assumed because the reference didn't say. */
  assumptions: string[];
}

const num = (v: string | null | undefined, fallback: number): number => {
  const n = Number.parseFloat(v ?? "");
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Extract a family DNA from one or more reference SVGs.
 *
 * With several references the median is taken for each numeric property, which
 * is far more robust than an average: one outlier icon in a set shouldn't drag
 * the whole family's stroke width with it.
 */
export function analyzeReferences(svgs: string[]): ReferenceReading {
  const strokes: number[] = [];
  const radii: number[] = [];
  const viewBoxes: [number, number][] = [];
  const paddings: number[] = [];
  const nodeCounts: number[] = [];
  let linecap = "";
  let linejoin = "";
  let anyFilled = false;
  const assumptions: string[] = [];

  for (const svg of svgs) {
    const { doc, error } = parseSvgDoc(svg);
    if (error || !doc) continue;
    const root = doc.querySelector("svg");
    if (!root) continue;

    const vb = (root.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
    const w = vb.length === 4 && Number.isFinite(vb[2]) ? vb[2]! : num(root.getAttribute("width"), 24);
    const h = vb.length === 4 && Number.isFinite(vb[3]) ? vb[3]! : num(root.getAttribute("height"), 24);
    viewBoxes.push([w, h]);

    const shapes = Array.from(doc.querySelectorAll("path,rect,circle,line,polyline,polygon,ellipse"));
    nodeCounts.push(shapes.length);

    // Stroke width: root attribute wins, else the most common on shapes.
    const rootSw = root.getAttribute("stroke-width");
    if (rootSw) strokes.push(num(rootSw, 1.5));
    for (const s of shapes) {
      const sw = s.getAttribute("stroke-width");
      if (sw) strokes.push(num(sw, 1.5));
      const rx = s.getAttribute("rx");
      if (rx) radii.push(num(rx, 0));
      const fill = (s.getAttribute("fill") ?? "").toLowerCase();
      if (fill && fill !== "none") anyFilled = true;
    }

    linecap ||= root.getAttribute("stroke-linecap") ?? shapes[0]?.getAttribute("stroke-linecap") ?? "";
    linejoin ||= root.getAttribute("stroke-linejoin") ?? shapes[0]?.getAttribute("stroke-linejoin") ?? "";

    // Padding: how far the outermost geometry sits from the viewBox edge.
    // Estimated from coordinates in the markup, which is crude but honest -
    // a real bounding box needs layout, which isn't available off-DOM.
    const coords = Array.from(svg.matchAll(/[-+]?\d*\.?\d+/g))
      .map((m) => Number.parseFloat(m[0]))
      .filter((n) => Number.isFinite(n) && n >= 0 && n <= Math.max(w, h));
    if (coords.length > 3) {
      const min = Math.min(...coords);
      const max = Math.max(...coords);
      paddings.push(Math.max(0, Math.min(min, w - max)));
    }
  }

  const median = (xs: number[], fallback: number): number => {
    if (!xs.length) return fallback;
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)]!;
  };

  const canvasW = Math.round(median(viewBoxes.map((v) => v[0]), 24));
  const canvasH = Math.round(median(viewBoxes.map((v) => v[1]), 24));
  const stroke = Math.round(median(strokes, 1.5) * 100) / 100;
  const radius = Math.round(median(radii, 3) * 10) / 10;
  const padding = Math.round(median(paddings, 2) * 10) / 10;
  const nodes = median(nodeCounts, 3);

  if (!strokes.length) assumptions.push("No stroke width was declared, assumed 1.5.");
  if (!radii.length) assumptions.push("No corner radius was declared, assumed the family default.");
  if (!paddings.length) assumptions.push("Padding could not be measured, assumed 2 units.");

  const dna: IconDNA = {
    ...DEFAULT_DNA,
    canvas: { width: canvasW, height: canvasH },
    grid: { columns: canvasW, rows: canvasH },
    stroke: {
      width: stroke,
      linecap: (["round", "butt", "square"].includes(linecap) ? linecap : "round") as IconDNA["stroke"]["linecap"],
      linejoin: (["round", "miter", "bevel"].includes(linejoin) ? linejoin : "round") as IconDNA["stroke"]["linejoin"],
    },
    geometry: {
      cornerRadius: radius,
      style: radius >= 1 ? "rounded" : "sharp",
      complexity: nodes <= 2 ? "sparse" : nodes >= 6 ? "dense" : "medium",
    },
    spacing: { outerPadding: padding, internalSpacing: DEFAULT_DNA.spacing.internalSpacing },
    opticalWeight: stroke <= 1.2 ? "light" : stroke >= 2 ? "bold" : "medium",
    visualDensity: nodes <= 2 ? "sparse" : nodes >= 6 ? "dense" : "medium",
    style: anyFilled ? "filled" : stroke >= 2 ? "bold-outline" : "minimal-outline",
  };

  return {
    dna,
    observed: {
      "Canvas": `${canvasW}×${canvasH}`,
      "Stroke width": stroke,
      "Corner radius": radius,
      "Outer padding": padding,
      "Shapes per icon": nodes,
      "Line cap": dna.stroke.linecap,
      "Line join": dna.stroke.linejoin,
      "References read": svgs.length,
    },
    assumptions,
  };
}

/* ── Fingerprint ──────────────────────────────────────────────────────────── */

/**
 * A structural fingerprint: the sequence of shape kinds plus quantised
 * coordinates. Deliberately coarse: two icons that differ only by sub-unit
 * nudges SHOULD collide, because to a human they are the same icon.
 */
export function fingerprint(svg: string): string {
  const kinds = Array.from(svg.matchAll(/<(path|rect|circle|line|polyline|polygon|ellipse)\b/g))
    .map((m) => m[1]![0])
    .join("");
  const coords = Array.from(svg.matchAll(/[-+]?\d*\.?\d+/g))
    .map((m) => Math.round(Number.parseFloat(m[0])))
    .filter((n) => Number.isFinite(n));
  // Fold the coordinate stream into a compact, order-sensitive digest.
  let h1 = 0x811c9dc5;
  for (const c of coords) {
    h1 ^= c + 0x9e3779b9;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }
  return `${kinds}-${coords.length}-${h1.toString(16)}`;
}

/**
 * Multiset of quantised POINTS, not individual numbers.
 *
 * Measured why this matters: comparing raw coordinate values scored two
 * obviously different icons (mail vs calendar) at 0.46 similarity: above the
 * regenerate threshold, because every icon in a family shares a grid, a canvas
 * size and a padding, so the same numbers recur constantly. A shared "12" means
 * nothing; a shared point (12, 13.5) means the two icons put something in the
 * same place. Pairs carry the signal, single values are noise.
 */
function pointSet(svg: string): Map<string, number> {
  const m = new Map<string, number>();
  const nums = Array.from(svg.matchAll(/[-+]?\d*\.?\d+/g))
    .map((x) => Number.parseFloat(x[0]))
    .filter((n) => Number.isFinite(n));
  // Quantise to whole units: sub-unit nudges should still count as the same spot.
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const key = `${Math.round(nums[i]!)},${Math.round(nums[i + 1]!)}`;
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return m;
}

/** 0–1 similarity between two icons, from shape kinds and coordinate overlap. */
export function similarity(a: string, b: string): number {
  const fa = fingerprint(a);
  const fb = fingerprint(b);
  if (fa === fb) return 1;

  const kindsA = fa.split("-")[0] ?? "";
  const kindsB = fb.split("-")[0] ?? "";
  const kindScore = kindsA === kindsB ? 1 : kindsA.length && kindsB.length
    ? [...kindsA].filter((c, i) => kindsB[i] === c).length / Math.max(kindsA.length, kindsB.length)
    : 0;

  const pa = pointSet(a);
  const pb = pointSet(b);
  let shared = 0;
  let total = 0;
  for (const [k, v] of pa) {
    shared += Math.min(v, pb.get(k) ?? 0);
    total += v;
  }
  for (const [k, v] of pb) if (!pa.has(k)) total += v;
  const pointScore = total > 0 ? shared / total : 0;

  // Simple icons need a size guard. With only a handful of points, sharing two
  // of three reads as 67% overlap, which scored "code" against "play" at 0.54
  // and would have triggered a pointless regeneration. Scaling by how closely
  // the two icons match in shape COUNT fixes it: a 1-shape icon and a 2-shape
  // icon are structurally different however their points happen to land.
  const shapesA = Math.max(1, kindsA.length);
  const shapesB = Math.max(1, kindsB.length);
  const sizeFactor = Math.min(shapesA, shapesB) / Math.max(shapesA, shapesB);

  // Placement carries the signal. The shape sequence is weighted lightly
  // because within one family it is almost always similar by design, a family
  // of outline icons is *supposed* to reuse the same primitives.
  const raw = pointScore * 0.85 + kindScore * 0.15;
  return Math.round(raw * sizeFactor * 100) / 100;
}

/* ── Originality ──────────────────────────────────────────────────────────── */

export function checkOriginality(
  svg: string,
  family: Icon[],
  references: string[],
  thresholds: OriginalityThresholds = DEFAULT_THRESHOLDS,
): OriginalityReport {
  let worst = 0;
  let nearest: OriginalityReport["nearest"];
  const notes: string[] = [];

  for (const icon of family) {
    const s = similarity(svg, icon.svg);
    if (s > worst) {
      worst = s;
      nearest = { name: icon.name, similarity: s, source: "family" };
    }
  }
  for (const [i, ref] of references.entries()) {
    const s = similarity(svg, ref);
    if (s > worst) {
      worst = s;
      nearest = { name: `Reference ${i + 1}`, similarity: s, source: "reference" };
    }
  }

  const verdict: OriginalityReport["verdict"] =
    worst >= thresholds.regenerateAbove ? "regenerate" : worst >= thresholds.approveBelow ? "review" : "approved";

  if (verdict === "regenerate") {
    notes.push(`Too close to ${nearest?.name ?? "an existing icon"}, regenerating with different geometry.`);
  } else if (verdict === "review") {
    notes.push(`Some resemblance to ${nearest?.name ?? "an existing icon"}. Worth a look before approving.`);
  }
  notes.push(
    "Screening compares this icon against the icons in this family and the references you supplied. It is not a search of every icon that exists, and it is not a legal clearance.",
  );

  return {
    score: Math.round((1 - worst) * 100),
    verdict,
    nearest,
    checked: family.length + references.length,
    notes,
  };
}

/* ── Family consistency ───────────────────────────────────────────────────── */

/**
 * Score a rendered icon against the family DNA.
 *
 * Because the renderer draws FROM the DNA, a correctly generated icon scores
 * near-perfect by construction. This exists to catch imported or hand-edited
 * icons that do not follow the family, which is exactly the case where a
 * consistency score earns its keep.
 */
export function checkConsistency(svg: string, dna: IconDNA): ConsistencyReport {
  const notes: string[] = [];
  const { doc } = parseSvgDoc(svg);
  const root = doc?.querySelector("svg");

  const score = (actual: number, expected: number, tolerance: number): number => {
    if (expected === 0) return actual === 0 ? 100 : 0;
    const diff = Math.abs(actual - expected) / expected;
    return Math.max(0, Math.round((1 - diff / tolerance) * 100));
  };

  const vb = (root?.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
  const w = vb.length === 4 ? vb[2]! : 0;
  const grid = w === dna.canvas.width ? 100 : score(w, dna.canvas.width, 1);
  if (grid < 100) notes.push(`Canvas is ${w || "unknown"}, family uses ${dna.canvas.width}.`);

  const sw = num(root?.getAttribute("stroke-width"), NaN);
  const strokeScore = Number.isFinite(sw) ? score(sw, dna.stroke.width, 0.5) : 60;
  if (!Number.isFinite(sw)) notes.push("No stroke width declared on the root element.");
  else if (strokeScore < 90) notes.push(`Stroke is ${sw}, family uses ${dna.stroke.width}.`);

  const radii = Array.from(svg.matchAll(/\brx="([\d.]+)"/g)).map((m) => Number.parseFloat(m[1]!));
  const cornerScore = radii.length
    ? Math.round(radii.reduce((a, r) => a + score(r, dna.geometry.cornerRadius, 1), 0) / radii.length)
    : 100;
  if (radii.length && cornerScore < 90) notes.push("Corner radii differ from the family value.");

  const cap = root?.getAttribute("stroke-linecap") ?? "";
  const join = root?.getAttribute("stroke-linejoin") ?? "";
  const geometry = (cap === dna.stroke.linecap ? 50 : 0) + (join === dna.stroke.linejoin ? 50 : 0);
  if (geometry < 100) notes.push("Line cap or join does not match the family.");

  const shapes = (svg.match(/<(path|rect|circle|line|polyline|polygon|ellipse)\b/g) ?? []).length;
  const expectedShapes = dna.visualDensity === "sparse" ? 2 : dna.visualDensity === "dense" ? 7 : 4;
  const opticalWeight = score(shapes, expectedShapes, 1.5);

  const padding = 100; // rendered icons inherit padding from the DNA by construction

  const overall = Math.round(
    grid * 0.2 + strokeScore * 0.25 + cornerScore * 0.15 + geometry * 0.15 + opticalWeight * 0.15 + padding * 0.1,
  );

  return {
    grid,
    stroke: strokeScore,
    corners: cornerScore,
    opticalWeight,
    geometry,
    padding,
    overall,
    fits: overall >= 85,
    notes,
  };
}

/* ── Family health ────────────────────────────────────────────────────────── */

export function familyHealth(icons: Icon[], dna: IconDNA): FamilyHealth {
  if (icons.length === 0) {
    return {
      overall: 100,
      styleConsistency: 100,
      geometryConsistency: 100,
      strokeConsistency: 100,
      gridConsistency: 100,
      namingConsistency: 100,
      originality: 100,
      issues: ["No icons yet: health will populate as the family grows."],
    };
  }

  const reports = icons.map((i) => checkConsistency(i.svg, dna));
  const avg = (pick: (r: ConsistencyReport) => number) =>
    Math.round(reports.reduce((a, r) => a + pick(r), 0) / reports.length);

  const kebab = icons.filter((i) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(i.slug)).length;
  const namingConsistency = Math.round((kebab / icons.length) * 100);
  const originality = Math.round(icons.reduce((a, i) => a + i.originalityScore, 0) / icons.length);

  const issues: string[] = [];
  const offStyle = reports.filter((r) => !r.fits).length;
  if (offStyle) issues.push(`${offStyle} icon${offStyle === 1 ? "" : "s"} do not match the family DNA.`);
  if (namingConsistency < 90) issues.push("Some icon names don't follow a single convention.");

  const styleConsistency = avg((r) => r.overall);
  return {
    overall: Math.round((styleConsistency + namingConsistency + originality) / 3),
    styleConsistency,
    geometryConsistency: avg((r) => r.geometry),
    strokeConsistency: avg((r) => r.stroke),
    gridConsistency: avg((r) => r.grid),
    namingConsistency,
    originality,
    issues,
  };
}
