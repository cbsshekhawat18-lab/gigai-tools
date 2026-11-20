/**
 * GigAI Smart Assist, STEP 6: FILE HEALTH REPORT.
 *
 * `buildHealthReport(analysis)` turns a {@link FileAnalysis} into a scored,
 * human-readable checklist (type, size, quality, metadata/privacy, format
 * efficiency, structure, compatibility). Pure and deterministic. No engines,
 * no network. Every "warn" is actionable and maps to something an existing tool
 * can fix, which the planner then offers.
 */

import { FAMILY_LABEL } from "@/lib/assist/kinds";
import type { FileAnalysis, HealthCheck, HealthReport, HealthStatus } from "@/lib/assist/types";

/** Soft "this is getting large" thresholds per family, in bytes. */
const LARGE_THRESHOLDS: Partial<Record<FileAnalysis["family"], number>> = {
  image: 5 * 1024 * 1024,
  pdf: 10 * 1024 * 1024,
  svg: 1 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  document: 15 * 1024 * 1024,
  spreadsheet: 15 * 1024 * 1024,
  presentation: 25 * 1024 * 1024,
  data: 10 * 1024 * 1024,
  code: 5 * 1024 * 1024,
  text: 10 * 1024 * 1024,
};

/** Per-status score weight (starts at 100). */
const WEIGHT: Record<HealthStatus, number> = { good: 0, info: -4, warn: -14 };

function grade(score: number): HealthReport["grade"] {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 55) return "Fair";
  return "Needs work";
}

/**
 * Build the report. Order matters: the most important checks lead.
 */
export function buildHealthReport(a: FileAnalysis): HealthReport {
  const checks: HealthCheck[] = [];
  const add = (
    id: string,
    status: HealthStatus,
    label: string,
    detail: string,
    icon: string,
  ) => checks.push({ id, status, label, detail, icon });

  // ── Corruption gate ──────────────────────────────────────
  if (a.corrupt) {
    add("integrity", "warn", "File integrity", a.warnings[0] ?? "This file couldn't be read. It may be damaged.", "TriangleAlert");
  } else {
    add("integrity", "good", "File integrity", "Opened and read successfully.", "CircleCheck");
  }

  // ── Recognised type ──────────────────────────────────────
  if (a.family === "unknown") {
    add("type", "info", "File type", `Unrecognised type${a.ext ? ` (.${a.ext})`: ""}, basic details only.`, "FileQuestion");
  } else {
    const dims = a.width && a.height ? ` · ${a.width}×${a.height}` : "";
    add("type", "good", "File type", `${(a.mime || `.${a.ext}`)}${dims}`, "FileCheck2");
  }

  // ── Size + compression potential ─────────────────────────
  const largeAt = LARGE_THRESHOLDS[a.family];
  if (largeAt && a.size > largeAt) {
    add("size", "warn", "File size", `${a.sizeLabel} is on the large side; it can be compressed to send or upload faster.`, "Weight");
  } else if (a.family === "image" && a.width && a.width > 3000) {
    add("size", "info", "File size", `${a.sizeLabel}. Large dimensions leave plenty of room to shrink.`, "Weight");
  } else {
    add("size", "good", "File size", `${a.sizeLabel}, a sensible size.`, "Weight");
  }

  // ── Image quality / dimensions ───────────────────────────
  if (a.family === "image" && a.width && a.height) {
    if (Math.max(a.width, a.height) < 400) {
      add("dimensions", "info", "Resolution", `${a.width}×${a.height} is small; it may look soft if enlarged.`, "Ruler");
    } else if (Math.max(a.width, a.height) > 4000) {
      add("dimensions", "info", "Resolution", `${a.width}×${a.height} is very high: larger than most web or print uses need.`, "Ruler");
    } else {
      add("dimensions", "good", "Resolution", `${a.width}×${a.height}${a.aspectRatio ? ` (${a.aspectRatio})`: ""}, a versatile size.`, "Ruler");
    }
  }

  // ── Transparency ─────────────────────────────────────────
  if (a.family === "image" && a.hasAlpha !== undefined) {
    add(
      "transparency",
      "good",
      "Transparency",
      a.hasAlpha ? "Has a transparent background (alpha channel)." : "Solid background, no transparency.",
      "Layers",
    );
  }

  // ── Privacy / hidden metadata ────────────────────────────
  if (a.hasExif) {
    add("metadata", "warn", "Hidden metadata", "Contains EXIF data that can include camera, date and GPS location, worth removing before sharing.", "ShieldAlert");
  } else if (a.family === "image") {
    add("metadata", "good", "Hidden metadata", "No obvious location/camera metadata detected.", "ShieldCheck");
  }

  // ── Format efficiency ────────────────────────────────────
  if (a.family === "image" && (a.ext === "png" || a.mime === "image/png") && a.looksLikeGraphic === false) {
    add("format", "info", "Format efficiency", "This is a PNG photo: converting to WebP or JPG usually makes it much smaller with no visible loss.", "Sparkle");
  } else if (a.family === "image" && a.animated) {
    add("format", "info", "Format", "Animated image: converting to MP4/WebM can cut the size dramatically.", "Sparkle");
  }

  // ── PDF specifics ────────────────────────────────────────
  if (a.family === "pdf") {
    if (a.encrypted) {
      add("security", "warn", "Security", "Password-protected, unlock it before editing or compressing.", "Lock");
    } else if (a.pageCount) {
      add("pages", "good", "Pages", `${a.pageCount} page${a.pageCount === 1 ? "" : "s"}.`, "Files");
    }
  }

  // ── Structured data validity ─────────────────────────────
  if (a.valid === false) {
    add("validity", "warn", "Structure", a.validationError ?? "Has a syntax error that will break parsers.", "TriangleAlert");
  } else if (a.valid === true) {
    add("validity", "good", "Structure", "Well-formed and valid.", "CircleCheck");
  }
  if (a.minified) {
    add("readability", "info", "Readability", "Minified, format/beautify it to read or edit comfortably.", "AlignLeft");
  }

  // ── Privacy (always true, it's the product promise) ─────
  add("privacy", "good", "Privacy", "Processed entirely in your browser: nothing is uploaded.", "ShieldCheck");

  // ── Score ────────────────────────────────────────────────
  let score = 100;
  for (const c of checks) score += WEIGHT[c.status];
  if (a.corrupt) score = Math.min(score, 40);
  score = Math.max(0, Math.min(100, Math.round(score)));

  const warnCount = checks.filter((c) => c.status === "warn").length;
  const label = FAMILY_LABEL[a.family];
  const summary = a.corrupt
    ? `This ${label} appears damaged.`
    : warnCount === 0
      ? `This ${label} looks healthy and ready to use.`
      : `This ${label} is usable. ${warnCount} thing${warnCount === 1 ? "" : "s"} could be improved.`;

  return { score, grade: grade(score), summary, checks };
}
