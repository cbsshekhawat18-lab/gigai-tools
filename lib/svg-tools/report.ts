/**
 * GigAI Tools: plain-English optimization report.
 *
 * Diffs the BEFORE and AFTER SVG (structure + counts) and describes what
 * changed in words a non-technical user understands. Never raw SVGO plugin
 * names. Drives the "Optimization report" card in the workspace.
 */

import { computeMetrics } from "./analyze";
import { utf8Bytes } from "./core";

export interface ReportLine {
  /** Icon hint the UI can map to a lucide icon. */
  kind: "remove" | "merge" | "round" | "convert" | "clean";
  text: string;
}

export interface OptimizationReport {
  lines: ReportLine[];
  reductionPct: number;
  savedBytes: number;
}

/** Count occurrences of a global regex without allocating the matches array. */
function count(re: RegExp, s: string): number {
  const m = s.match(re);
  return m ? m.length : 0;
}

/**
 * Build the report from the original and optimized SVG strings. Pure and
 * SSR-safe (delegates to `computeMetrics`).
 */
export function buildReport(before: string, after: string): OptimizationReport {
  const lines: ReportLine[] = [];
  const beforeBytes = utf8Bytes(before);
  const afterBytes = utf8Bytes(after);
  const savedBytes = beforeBytes - afterBytes;
  const reductionPct = beforeBytes === 0 ? 0 : Math.round((savedBytes / beforeBytes) * 100);

  const mb = computeMetrics(before);
  const ma = computeMetrics(after);

  // Comments
  const commentsBefore = count(/<!--/g, before);
  if (commentsBefore > count(/<!--/g, after)) {
    lines.push({ kind: "remove", text: "Removed comments" });
  }

  // Metadata / editor cruft
  const metaBefore = /<metadata|sodipodi:|inkscape:|xmlns:(dc|cc|rdf)/i.test(before);
  const metaAfter = /<metadata|sodipodi:|inkscape:|xmlns:(dc|cc|rdf)/i.test(after);
  if (metaBefore && !metaAfter) lines.push({ kind: "remove", text: "Removed editor metadata" });

  // IDs
  const idsBefore = count(/\sid=/gi, before);
  const idsAfter = count(/\sid=/gi, after);
  if (idsBefore - idsAfter > 0) {
    lines.push({ kind: "clean", text: `Removed ${idsBefore - idsAfter} unused ID${idsBefore - idsAfter > 1 ? "s" : ""}` });
  }

  // Paths merged
  if (mb.pathCount - ma.pathCount > 0) {
    lines.push({ kind: "merge", text: `Merged ${mb.pathCount - ma.pathCount} path${mb.pathCount - ma.pathCount > 1 ? "s" : ""}` });
  }

  // Decimal precision
  if (mb.decimalPrecision > ma.decimalPrecision && ma.decimalPrecision >= 0) {
    lines.push({ kind: "round", text: `Rounded coordinates to ${ma.decimalPrecision} decimal${ma.decimalPrecision === 1 ? "" : "s"}` });
  }

  // Hidden / empty elements removed (net element drop beyond path merges)
  const elemDrop = mb.elementCount - ma.elementCount - Math.max(0, mb.pathCount - ma.pathCount);
  if (elemDrop > 0) {
    lines.push({ kind: "clean", text: `Removed ${elemDrop} hidden or empty element${elemDrop > 1 ? "s" : ""}` });
  }

  // Styles converted / removed
  const styleBefore = /<style[\s>]/i.test(before);
  const styleAfter = /<style[\s>]/i.test(after);
  if (styleBefore && !styleAfter) lines.push({ kind: "convert", text: "Converted styles to attributes" });

  // Transforms simplified
  const trBefore = count(/transform=/gi, before);
  const trAfter = count(/transform=/gi, after);
  if (trBefore - trAfter > 0) lines.push({ kind: "convert", text: "Simplified transforms" });

  // Gradients / defs cleaned
  if (mb.gradientCount - ma.gradientCount > 0) {
    lines.push({ kind: "clean", text: `Removed ${mb.gradientCount - ma.gradientCount} unused gradient${mb.gradientCount - ma.gradientCount > 1 ? "s" : ""}` });
  }

  // Always end with the headline reduction if anything shrank.
  if (savedBytes > 0) {
    lines.push({ kind: "round", text: `Estimated reduction: ${reductionPct}%` });
  } else if (lines.length === 0) {
    lines.push({ kind: "clean", text: "Already well-optimized. No meaningful changes to make." });
  }

  return { lines, reductionPct, savedBytes };
}
