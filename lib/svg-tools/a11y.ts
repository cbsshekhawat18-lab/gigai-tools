/**
 * GigAI Tools, SVG accessibility checks + auto-fixes for the Optimize workspace.
 *
 * Inspects an SVG for the common accessibility gaps (missing title/description,
 * missing role, non-focusable/focusable issues, decorative SVGs that still
 * expose noise) and can auto-apply the safe fixes. DOM-based via `core.ts`,
 * with a graceful no-op when there's no DOM.
 */

import { parseSvgDoc, serialize, hasDom } from "./core";

export type A11yFixId = "add-title" | "mark-decorative" | "add-role" | "remove-focusable";

export interface A11yIssue {
  id: string;
  severity: "warning" | "info";
  title: string;
  detail?: string;
  fix?: A11yFixId;
}

export interface A11yReport {
  /** 0–100 accessibility score. */
  score: number;
  issues: A11yIssue[];
  passed: string[];
}

/** Analyse an SVG's accessibility. Never throws. */
export function analyzeA11y(svg: string): A11yReport {
  const issues: A11yIssue[] = [];
  const passed: string[] = [];
  if (!svg.trim() || !hasDom()) return { score: 100, issues, passed };

  try {
    const { doc, error } = parseSvgDoc(svg);
    if (error) return { score: 100, issues, passed };
    const root = doc.documentElement;

    const role = root.getAttribute("role");
    const ariaLabel = root.getAttribute("aria-label");
    const ariaLabelledby = root.getAttribute("aria-labelledby");
    const ariaHidden = root.getAttribute("aria-hidden") === "true";
    const title = root.querySelector("title");
    const desc = root.querySelector("desc");
    const focusable = root.getAttribute("focusable");

    if (ariaHidden) {
      // Decorative and correctly hidden, that's valid; nothing else required.
      passed.push("Marked decorative (aria-hidden)");
      return { score: 100, issues, passed };
    }

    // Title / accessible name
    if (!title && !ariaLabel && !ariaLabelledby) {
      issues.push({
        id: "no-title",
        severity: "warning",
        title: "No accessible name: screen readers announce nothing.",
        detail: "Add a <title>, or mark it decorative if it carries no meaning.",
        fix: "add-title",
      });
    } else passed.push("Has an accessible name");

    // Role
    if (!role) {
      issues.push({
        id: "no-role",
        severity: "info",
        title: 'Missing role="img": assistive tech may treat it as a group.',
        fix: "add-role",
      });
    } else passed.push('Has role="img"');

    // Description (nice-to-have)
    if (title && !desc) {
      issues.push({ id: "no-desc", severity: "info", title: "Has a title but no <desc>: a longer description helps complex art." });
    }

    // Focusable quirk (IE/Edge legacy), SVGs shouldn't be in the tab order unless interactive.
    if (focusable === null && (root.querySelector("a") || root.querySelector("[onclick]"))) {
      passed.push("Interactive: focus is expected");
    } else if (focusable === "true") {
      issues.push({
        id: "focusable",
        severity: "info",
        title: 'focusable="true" puts a non-interactive icon in the tab order.',
        fix: "remove-focusable",
      });
    }
  } catch {
    /* parse failed. No findings */
  }

  let score = 100;
  for (const i of issues) score -= i.severity === "warning" ? 20 : 8;
  return { score: Math.max(0, Math.min(100, score)), issues, passed };
}

/** Apply an accessibility auto-fix to the SVG string. Returns the SVG unchanged on failure. */
export function applyA11yFix(svg: string, fix: A11yFixId, name = "Icon"): string {
  if (!hasDom()) return svg;
  try {
    const { doc, error } = parseSvgDoc(svg);
    if (error) return svg;
    const root = doc.documentElement;
    switch (fix) {
      case "add-title": {
        root.setAttribute("role", "img");
        if (!root.querySelector("title")) {
          const t = doc.createElementNS("http://www.w3.org/2000/svg", "title");
          t.textContent = name;
          root.insertBefore(t, root.firstChild);
        }
        break;
      }
      case "mark-decorative": {
        root.setAttribute("aria-hidden", "true");
        root.setAttribute("focusable", "false");
        break;
      }
      case "add-role":
        root.setAttribute("role", "img");
        break;
      case "remove-focusable":
        root.removeAttribute("focusable");
        break;
    }
    return serialize(root);
  } catch {
    return svg;
  }
}
