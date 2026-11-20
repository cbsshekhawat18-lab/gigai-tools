/**
 * GigAI Tools, SVG analysis for the Optimize workspace.
 *
 * Builds on `analyzeSvg` (element histogram, colors, feature flags) from
 * `validate.ts` and adds: artwork-kind detection (icon / logo / illustration /
 * complex / animated) used by Smart mode, plus the dedicated metric counters
 * (gradients, masks, clipPaths, filters, patterns, text, images, decimal
 * precision, render complexity) shown in the statistics dashboard.
 *
 * Pure and SSR-safe (delegates DOM work to `analyzeSvg`, which guards `hasDom`).
 */

import { analyzeSvg } from "./validate";
import { utf8Bytes } from "./core";

/** Detected artwork kind, drives Smart mode's optimization profile. */
export type SvgKind = "icon" | "logo" | "illustration" | "complex" | "animated";

export const KIND_LABEL: Record<SvgKind, string> = {
  icon: "Icon",
  logo: "Logo",
  illustration: "Illustration",
  complex: "Complex artwork",
  animated: "Animated SVG",
};

/** Sum the counts of several (lowercased) tag names from an element histogram. */
function countOf(counts: Record<string, number>, ...tags: string[]): number {
  return tags.reduce((sum, t) => sum + (counts[t] ?? 0), 0);
}

/** The full metric set surfaced by the statistics dashboard. */
export interface SvgMetrics {
  bytes: number;
  elementCount: number;
  pathCount: number;
  gradientCount: number;
  maskCount: number;
  clipPathCount: number;
  filterCount: number;
  patternCount: number;
  textCount: number;
  imageCount: number;
  colorCount: number;
  /** Largest number of decimal places found on any coordinate (proxy for precision). */
  decimalPrecision: number;
  hasAnimation: boolean;
  hasGradients: boolean;
  hasFilters: boolean;
  viewBox: string | null;
  /** 0–100 render-cost estimate (higher = heavier to paint). */
  renderComplexity: number;
  /** Human bucket for the complexity number. */
  complexityLabel: "Light" | "Moderate" | "Heavy" | "Very heavy";
}

/** Largest decimal-place count across all numbers in the string (capped scan). */
function maxDecimalPrecision(svg: string): number {
  let max = 0;
  // Match numbers with a fractional part; cap iterations for very large files.
  const re = /\d*\.(\d+)/g;
  let m: RegExpExecArray | null;
  let guard = 0;
  while ((m = re.exec(svg)) !== null) {
    const digits = m[1]?.length ?? 0;
    if (digits > max) max = digits;
    if (++guard > 200_000) break;
  }
  return max;
}

/** Bucket a 0–100 complexity score into a human label. */
function complexityLabel(score: number): SvgMetrics["complexityLabel"] {
  if (score < 25) return "Light";
  if (score < 55) return "Moderate";
  if (score < 80) return "Heavy";
  return "Very heavy";
}

/**
 * Compute every metric for the dashboard. Never throws: returns a zeroed set
 * when the SVG can't be parsed.
 */
export function computeMetrics(svg: string): SvgMetrics {
  const empty: SvgMetrics = {
    bytes: utf8Bytes(svg),
    elementCount: 0,
    pathCount: 0,
    gradientCount: 0,
    maskCount: 0,
    clipPathCount: 0,
    filterCount: 0,
    patternCount: 0,
    textCount: 0,
    imageCount: 0,
    colorCount: 0,
    decimalPrecision: 0,
    hasAnimation: false,
    hasGradients: false,
    hasFilters: false,
    viewBox: null,
    renderComplexity: 0,
    complexityLabel: "Light",
  };

  const res = analyzeSvg(svg);
  if (!res.ok) return empty;
  const a = res.result;
  const c = a.elementCounts;

  const pathCount = countOf(c, "path");
  const gradientCount = countOf(c, "lineargradient", "radialgradient");
  const maskCount = countOf(c, "mask");
  const clipPathCount = countOf(c, "clippath");
  const filterCount = countOf(c, "filter");
  const patternCount = countOf(c, "pattern");
  const textCount = countOf(c, "text", "tspan", "textpath");
  const imageCount = countOf(c, "image");

  // Render-cost heuristic: filters & masks are the most expensive to paint,
  // then gradients & clip-paths, then raw element/path volume.
  const cost =
    filterCount * 14 +
    maskCount * 8 +
    clipPathCount * 5 +
    gradientCount * 3 +
    patternCount * 4 +
    imageCount * 3 +
    Math.min(40, pathCount * 0.4) +
    Math.min(20, a.totalElements * 0.05);
  const renderComplexity = Math.max(0, Math.min(100, Math.round(cost)));

  return {
    bytes: a.bytes ?? utf8Bytes(svg),
    elementCount: a.totalElements,
    pathCount,
    gradientCount,
    maskCount,
    clipPathCount,
    filterCount,
    patternCount,
    textCount,
    imageCount,
    colorCount: a.colors.length,
    decimalPrecision: maxDecimalPrecision(svg),
    hasAnimation: a.hasAnimation,
    hasGradients: a.hasGradients,
    hasFilters: a.hasFilters,
    viewBox: a.viewBox,
    renderComplexity,
    complexityLabel: complexityLabel(renderComplexity),
  };
}

/** Parse the shorter side of a viewBox (used for size-class heuristics). */
function viewBoxMax(viewBox: string | null): number | null {
  if (!viewBox) return null;
  const parts = viewBox.split(/[\s,]+/).map(Number);
  if (parts.length < 4 || parts.some((n) => Number.isNaN(n))) return null;
  return Math.max(parts[2] ?? 0, parts[3] ?? 0);
}

/**
 * Detect the artwork kind from metrics. Order matters: animation wins, then
 * complexity, then icon/logo/illustration by palette + geometry.
 */
export function detectKind(metrics: SvgMetrics): SvgKind {
  if (metrics.hasAnimation) return "animated";

  const vbMax = viewBoxMax(metrics.viewBox);
  const small = vbMax !== null && vbMax <= 64;
  const paths = metrics.pathCount;
  const colors = metrics.colorCount;
  const elements = metrics.elementCount;

  // Very heavy → complex artwork.
  if (elements > 200 || paths > 120 || metrics.renderComplexity >= 70) return "complex";

  // Rich palette / gradients / many shapes → illustration.
  if (colors > 8 || metrics.gradientCount >= 2 || elements > 60) return "illustration";

  // Small canvas + few colors + few paths → icon.
  if (small && colors <= 3 && paths <= 12) return "icon";

  // Otherwise a logo (few colors, flat, moderate detail, maybe text).
  return "logo";
}

/** Convenience: metrics + detected kind in one call. */
export function analyzeForOptimize(svg: string): { metrics: SvgMetrics; kind: SvgKind } {
  const metrics = computeMetrics(svg);
  return { metrics, kind: detectKind(metrics) };
}
