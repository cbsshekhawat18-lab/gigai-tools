/**
 * GigAI IconLab: the family model.
 *
 * THE CORE IDEA: an icon is never a standalone asset. It belongs to a family,
 * and the family owns the design language (its "DNA"). Analyse once, store the
 * DNA, and every future icon is rendered to that same DNA, which is what makes
 * icon #500 match icon #1 without re-analysing anything.
 *
 * WHERE THIS RUNS: entirely in the browser. Families live in IndexedDB, exactly
 * like the rest of GigAI. There are no accounts on this platform, so a family
 * belongs to a browser and moves between machines as an exported JSON file. The
 * storage layer sits behind an interface (see storage.ts) so a server-backed
 * adapter can be dropped in later without touching the engine or the UI.
 */

/* ── Icon DNA ─────────────────────────────────────────────────────────────── */

export type GeometryStyle = "rounded" | "sharp" | "mixed";
export type IconStyle = "minimal-outline" | "bold-outline" | "filled" | "duotone";
export type Weight = "light" | "medium" | "bold";
export type Density = "sparse" | "medium" | "dense";

/**
 * The complete, reusable design language of a family.
 *
 * Every field here is something the renderer actually consumes. This is not a
 * settings blob. If a value is in the DNA, changing it changes the drawing.
 */
export interface IconDNA {
  canvas: { width: number; height: number };
  grid: { columns: number; rows: number };
  stroke: {
    width: number;
    linecap: "round" | "butt" | "square";
    linejoin: "round" | "miter" | "bevel";
  };
  geometry: {
    cornerRadius: number;
    style: GeometryStyle;
    complexity: Density;
  };
  spacing: { outerPadding: number; internalSpacing: number };
  opticalWeight: Weight;
  visualDensity: Density;
  symmetry: "balanced" | "vertical" | "horizontal" | "asymmetric";
  style: IconStyle;
  colorMode: "currentColor" | "fixed";
}

export const DEFAULT_DNA: IconDNA = {
  canvas: { width: 24, height: 24 },
  grid: { columns: 24, rows: 24 },
  stroke: { width: 1.5, linecap: "round", linejoin: "round" },
  geometry: { cornerRadius: 3, style: "rounded", complexity: "medium" },
  spacing: { outerPadding: 2, internalSpacing: 2 },
  opticalWeight: "medium",
  visualDensity: "medium",
  symmetry: "balanced",
  style: "minimal-outline",
  colorMode: "currentColor",
};

/* ── Family ───────────────────────────────────────────────────────────────── */

export type FamilyStatus = "active" | "archived";

/**
 * Long-term context for a family. Separate from the DNA on purpose: the DNA is
 * authoritative and machine-readable, while memory records the human judgements
 * ("too thick", "prefer squarer corners") that inform, but never silently
 * override. It.
 */
export interface FamilyMemory {
  /** Free-text corrections the user gave, newest first. */
  corrections: { note: string; at: string }[];
  /** Concepts the user rejected, so a rerun can vary them. */
  rejected: { concept: string; reason?: string; at: string }[];
  /** Naming convention observed from accepted icons, e.g. "kebab-case". */
  namingConvention?: string;
}

export interface IconFamily {
  id: string;
  name: string;
  description: string;
  slug: string;
  /** Short human-quotable code, e.g. FAM_8F72A91. */
  familyCode: string;
  status: FamilyStatus;
  /** Current semantic version, e.g. "1.2.0". */
  version: string;
  iconCount: number;
  /** When on, every new icon is rendered strictly to this DNA. */
  styleLocked: boolean;
  dna: IconDNA;
  memory: FamilyMemory;
  /** Categories the user has defined for this family. */
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

/** A frozen snapshot of a family at a point in time. Never mutated. */
export interface FamilyVersion {
  id: string;
  familyId: string;
  version: string;
  /** Icon ids present at this version. */
  iconIds: string[];
  dna: IconDNA;
  changelog: string;
  createdAt: string;
}

/* ── Icons ────────────────────────────────────────────────────────────────── */

export type IconStatus = "draft" | "approved" | "rejected";

export interface Icon {
  id: string;
  familyId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  svg: string;
  /** The DNA this icon was rendered against, so history stays truthful. */
  dnaSnapshot: IconDNA;
  /** Structural fingerprint used for duplicate detection. */
  fingerprint: string;
  originalityScore: number;
  consistencyScore: number;
  version: string;
  status: IconStatus;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ── Scoring ──────────────────────────────────────────────────────────────── */

export interface ConsistencyReport {
  grid: number;
  stroke: number;
  corners: number;
  opticalWeight: number;
  geometry: number;
  padding: number;
  overall: number;
  fits: boolean;
  notes: string[];
}

export type OriginalityVerdict = "approved" | "review" | "regenerate";

export interface OriginalityReport {
  score: number;
  verdict: OriginalityVerdict;
  /** Closest match found, if any. */
  nearest?: { name: string; similarity: number; source: "family" | "reference" };
  checked: number;
  notes: string[];
}

/**
 * Thresholds are configurable rather than hard-coded, because the right cut-off
 * depends on the similarity measure and on how tight the family is. A tightly
 * constrained family legitimately produces icons that resemble each other.
 */
export interface OriginalityThresholds {
  approveBelow: number;
  regenerateAbove: number;
  maxRegenerations: number;
}

/**
 * CALIBRATED FROM MEASUREMENT, not guessed.
 *
 * Across all 630 distinct pairs in the built-in vocabulary the similarity
 * measure produced: median 0.15, 90th 0.32, 95th 0.36, 99th 0.43, max 0.53
 * (download/upload, which genuinely share a tray and differ only in arrow
 * direction). Known duplicates score exactly 1.0.
 *
 * So distinct icons live below ~0.55 and duplicates sit at 1.0, leaving a wide
 * empty band between. The first draft used 0.15/0.30, which flagged 90 of those
 * 630 legitimate pairs as collisions: the engine would have cried wolf on
 * roughly one icon in seven. These values sit in the empty band instead.
 *
 * Re-run the calibration if the vocabulary or the measure changes.
 */
export const DEFAULT_THRESHOLDS: OriginalityThresholds = {
  approveBelow: 0.55,
  regenerateAbove: 0.8,
  maxRegenerations: 3,
};

/* ── Family health ────────────────────────────────────────────────────────── */

export interface FamilyHealth {
  overall: number;
  styleConsistency: number;
  geometryConsistency: number;
  strokeConsistency: number;
  gridConsistency: number;
  namingConsistency: number;
  originality: number;
  issues: string[];
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** PascalCase, for React/Vue component names. */
export function pascalCase(input: string): string {
  return slugify(input)
    .split("-")
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase() + p.slice(1))
    .join("");
}

/** Short random id. Not a UUID. These are local, and short reads better. */
export function shortId(prefix = ""): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return prefix ? `${prefix}_${hex}` : hex;
}

/** Bump a semver string. */
export function bumpVersion(version: string, kind: "major" | "minor" | "patch"): string {
  const [major = 1, minor = 0, patch = 0] = version.split(".").map((n) => Number.parseInt(n, 10) || 0);
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}
