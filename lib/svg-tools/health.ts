/**
 * GigAI Tools, SVG health score for the Optimize workspace.
 *
 * Produces a 0–100 score plus a list of plain-English issues, each optionally
 * carrying a `fix` id the UI can run as a one-click quick-fix. DOM-based checks
 * (duplicate ids, unused defs/gradients/clipPaths, broken references, empty
 * groups, hidden elements) run via `parseSvgDoc`; when no DOM is available it
 * degrades to the metric-derived checks only.
 */

import { parseSvgDoc, hasDom } from "./core";
import type { SvgMetrics } from "./analyze";

/** Quick-fix identifiers the workspace maps to concrete optimize actions. */
export type QuickFixId =
  | "metadata"
  | "ids"
  | "precision"
  | "empty-groups"
  | "hidden"
  | "styles"
  | "all";

export interface HealthIssue {
  id: string;
  severity: "warning" | "info";
  /** Plain-English one-liner. */
  title: string;
  /** Optional extra context. */
  detail?: string;
  /** If set, the UI can offer a one-click fix. */
  fix?: QuickFixId;
}

export interface HealthReport {
  /** 0–100; higher is healthier. */
  score: number;
  issues: HealthIssue[];
  /** Checks that passed (shown as green ticks). */
  passed: string[];
}

/** Weight subtracted from 100 per issue, by id-prefix. */
const WEIGHT: Record<string, number> = {
  "missing-viewbox": 14,
  "broken-ref": 12,
  "duplicate-id": 10,
  "raster-image": 10,
  "large-filters": 8,
  "large-masks": 6,
  "unused-defs": 6,
  "unused-gradient": 5,
  "unused-clippath": 5,
  metadata: 4,
  "empty-groups": 4,
  hidden: 4,
  precision: 5,
  "unused-styles": 4,
};

const REF_ATTRS = ["fill", "stroke", "clip-path", "mask", "filter", "marker-start", "marker-mid", "marker-end"];

/** Collect every id referenced via url(#id), href="#id", or attribute refs. */
function collectReferences(svg: string, root: Element): Set<string> {
  const refs = new Set<string>();
  // url(#id) anywhere in the serialized markup (covers style + attributes).
  const urlRe = /url\(\s*["']?#([\w:.-]+)["']?\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(svg)) !== null) if (m[1]) refs.add(m[1]);
  // href / xlink:href = "#id"
  root.querySelectorAll("[href], [xlink\\:href]").forEach((el) => {
    const href = el.getAttribute("href") ?? el.getAttribute("xlink:href");
    if (href && href.startsWith("#")) refs.add(href.slice(1));
  });
  // attribute refs that may be a bare #id
  root.querySelectorAll("*").forEach((el) => {
    for (const a of REF_ATTRS) {
      const v = el.getAttribute(a);
      if (v && v.startsWith("#")) refs.add(v.slice(1));
    }
  });
  return refs;
}

const DEFS_TAGS = new Set([
  "lineargradient",
  "radialgradient",
  "clippath",
  "mask",
  "pattern",
  "filter",
  "symbol",
  "marker",
]);

/**
 * Compute the health report. `metrics` should come from `computeMetrics` so we
 * don't re-parse for the counting checks.
 */
export function computeHealth(svg: string, metrics: SvgMetrics): HealthReport {
  const issues: HealthIssue[] = [];
  const passed: string[] = [];

  // ── metric-derived checks (work without DOM) ──
  if (!metrics.viewBox) {
    issues.push({ id: "missing-viewbox", severity: "warning", title: "Missing viewBox: the SVG won't scale responsively.", detail: "Add a viewBox so the icon stays crisp at any size." });
  } else passed.push("Has a viewBox");

  if (metrics.decimalPrecision > 2) {
    issues.push({ id: "precision", severity: "warning", title: `Coordinates use up to ${metrics.decimalPrecision} decimals, more than needed.`, detail: "Rounding to 1–2 decimals shrinks the file with no visible change.", fix: "precision" });
  } else passed.push("Sensible coordinate precision");

  if (metrics.imageCount > 0) {
    issues.push({ id: "raster-image", severity: "warning", title: `Contains ${metrics.imageCount} embedded raster image${metrics.imageCount > 1 ? "s" : ""}.`, detail: "Embedded PNG/JPEG data bloats an SVG and can't be scaled, export as a true vector where possible." });
  }
  if (metrics.filterCount >= 4) {
    issues.push({ id: "large-filters", severity: "info", title: `${metrics.filterCount} filters: filters are the most expensive part to render.`, detail: "Consider baking heavy effects into the artwork." });
  }
  if (metrics.maskCount >= 4) {
    issues.push({ id: "large-masks", severity: "info", title: `${metrics.maskCount} masks, masks add render cost.`, detail: "Clip-paths are cheaper when a hard edge is enough." });
  }

  // ── DOM checks ──
  if (hasDom()) {
    try {
      const { doc, error } = parseSvgDoc(svg);
      if (!error) {
        const root = doc.documentElement;

        // metadata / editor cruft
        if (root.querySelector("metadata") || /sodipodi:|inkscape:/i.test(svg)) {
          issues.push({ id: "metadata", severity: "info", title: "Editor metadata is present (author, editor namespaces).", detail: "Safe to remove for the web.", fix: "metadata" });
        } else passed.push("No editor metadata");

        // empty groups
        const emptyGroups = Array.from(root.querySelectorAll("g")).filter((g) => g.children.length === 0);
        if (emptyGroups.length > 0) {
          issues.push({ id: "empty-groups", severity: "info", title: `${emptyGroups.length} empty group${emptyGroups.length > 1 ? "s" : ""} that render nothing.`, fix: "empty-groups" });
        }

        // hidden elements
        const hidden = Array.from(root.querySelectorAll("*")).filter((el) => {
          const style = (el.getAttribute("style") ?? "").replace(/\s/g, "");
          return (
            el.getAttribute("display") === "none" ||
            el.getAttribute("visibility") === "hidden" ||
            el.getAttribute("opacity") === "0" ||
            /display:none|visibility:hidden|opacity:0(?:;|$)/.test(style)
          );
        });
        if (hidden.length > 0) {
          issues.push({ id: "hidden", severity: "info", title: `${hidden.length} hidden element${hidden.length > 1 ? "s" : ""} that never show.`, fix: "hidden" });
        }

        // duplicate ids
        const ids = Array.from(root.querySelectorAll("[id]")).map((el) => el.getAttribute("id") ?? "");
        const seen = new Set<string>();
        const dups = new Set<string>();
        for (const id of ids) {
          if (id && seen.has(id)) dups.add(id);
          else seen.add(id);
        }
        if (dups.size > 0) {
          issues.push({ id: "duplicate-id", severity: "warning", title: `${dups.size} duplicate id${dups.size > 1 ? "s" : ""}, references may resolve to the wrong element.`, fix: "ids" });
        }

        // unused defs + broken references
        const refs = collectReferences(svg, root);
        const definedIds = new Set<string>();
        let unusedGrad = 0;
        let unusedClip = 0;
        let unusedOther = 0;
        root.querySelectorAll("[id]").forEach((el) => {
          const id = el.getAttribute("id");
          if (!id) return;
          definedIds.add(id);
          const tag = el.nodeName.toLowerCase();
          if (DEFS_TAGS.has(tag) && !refs.has(id)) {
            if (tag === "lineargradient" || tag === "radialgradient") unusedGrad++;
            else if (tag === "clippath") unusedClip++;
            else unusedOther++;
          }
        });
        if (unusedGrad > 0) issues.push({ id: "unused-gradient", severity: "info", title: `${unusedGrad} unused gradient${unusedGrad > 1 ? "s" : ""} defined but never referenced.`, fix: "all" });
        if (unusedClip > 0) issues.push({ id: "unused-clippath", severity: "info", title: `${unusedClip} unused clip-path${unusedClip > 1 ? "s" : ""}.`, fix: "all" });
        if (unusedOther > 0) issues.push({ id: "unused-defs", severity: "info", title: `${unusedOther} unused definition${unusedOther > 1 ? "s" : ""} (masks/patterns/filters).`, fix: "all" });

        // broken references (referenced id that isn't defined)
        const broken = Array.from(refs).filter((r) => !definedIds.has(r));
        if (broken.length > 0) {
          issues.push({ id: "broken-ref", severity: "warning", title: `${broken.length} broken reference${broken.length > 1 ? "s" : ""} pointing at ids that don't exist.`, detail: `e.g. #${broken[0]}` });
        }

        // inline <style> blocks (potentially unused)
        if (root.querySelector("style")) {
          issues.push({ id: "unused-styles", severity: "info", title: "Inline <style> block present: can often be inlined onto elements.", fix: "styles" });
        }
      }
    } catch {
      /* DOM check failed. Keep metric-derived issues only */
    }
  }

  // ── score ──
  let score = 100;
  for (const issue of issues) {
    const key = Object.keys(WEIGHT).find((k) => issue.id === k || issue.id.startsWith(k));
    score -= key ? WEIGHT[key] ?? 4 : 4;
  }
  score = Math.max(0, Math.min(100, score));

  return { score, issues, passed };
}
