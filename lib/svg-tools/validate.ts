/**
 * GigAI Tools: SVG validator & analyzer.
 *
 * `validateSvg` runs a pragmatic linter over pasted SVG: XML well-formedness
 * (via DOMParser), presence of `xmlns`/`viewBox`, dimension sanity, and
 * SECURITY warnings for `<script>`, event handlers, `<foreignObject>`, and
 * external references: the vectors that make SVG a stored-XSS risk. It is an
 * advisory linter, not a sanitizer; it says so.
 *
 * `analyzeSvg` reports composition: element histogram, colors used, whether the
 * SVG animates (SMIL/CSS), and its byte size. Both are DOM-based when possible
 * with a regex fallback so they never hard-fail during SSR.
 */

import { type SvgResult, ok, fail, hasDom, parseSvgDoc, utf8Bytes } from "./core";

export interface ValidationMessage {
  severity: "error" | "warning" | "info";
  message: string;
}

export interface SvgValidation {
  ok: boolean;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
}

/** Validate an SVG string: well-formedness, required attrs, and security. */
export function validateSvg(svg: string): SvgValidation {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const input = svg.trim();

  if (!input) return { ok: false, errors: [{ severity: "error", message: "Input is empty." }], warnings };
  if (!/<svg[\s>]/i.test(input)) {
    return { ok: false, errors: [{ severity: "error", message: "No <svg> element found." }], warnings };
  }

  // Well-formedness (DOM path preferred).
  if (hasDom()) {
    const { doc, error } = parseSvgDoc(input);
    if (error) errors.push({ severity: "error", message: `Not well-formed: ${error}` });
    else {
      const root = doc.documentElement;
      if (root.nodeName.toLowerCase() !== "svg") {
        warnings.push({ severity: "warning", message: `Root element is <${root.nodeName}>, expected <svg>.` });
      }
      if (!root.getAttribute("xmlns")) {
        warnings.push({ severity: "warning", message: 'Missing xmlns="http://www.w3.org/2000/svg" (required for standalone files).' });
      }
      if (!root.getAttribute("viewBox")) {
        warnings.push({ severity: "warning", message: "Missing viewBox. The SVG will not scale responsively." });
      }
      checkDimensions(root.getAttribute("width"), root.getAttribute("height"), warnings);
    }
  } else {
    // Fallback: XML re-parse is unavailable; do a light bracket-balance check.
    if (!/<\/svg>/i.test(input)) errors.push({ severity: "error", message: "No closing </svg> tag found." });
    if (!/xmlns\s*=/.test(input)) warnings.push({ severity: "warning", message: "Missing xmlns declaration." });
    if (!/viewBox\s*=/i.test(input)) warnings.push({ severity: "warning", message: "Missing viewBox. The SVG will not scale responsively." });
  }

  // Security scan (regex. Works with or without DOM; conservative).
  if (/<script[\s>]/i.test(input)) {
    warnings.push({ severity: "warning", message: "Contains <script>: a stored-XSS risk if rendered inline. Strip before embedding untrusted SVG." });
  }
  if (/\son\w+\s*=/i.test(input)) {
    warnings.push({ severity: "warning", message: "Contains inline event handlers (onload/onclick…), remove before embedding untrusted SVG." });
  }
  if (/<foreignObject[\s>]/i.test(input)) {
    warnings.push({ severity: "warning", message: "Contains <foreignObject>. Can embed arbitrary HTML. Treat as untrusted." });
  }
  if (/javascript:/i.test(input)) {
    warnings.push({ severity: "warning", message: 'Contains a "javascript:" URL: potential script execution.' });
  }
  if (/xlink:href\s*=\s*["']https?:/i.test(input) || /\shref\s*=\s*["']https?:/i.test(input)) {
    warnings.push({ severity: "info", message: "References an external URL, may leak requests or break offline." });
  }

  return { ok: errors.length === 0, errors, warnings };
}

/** Warn about zero/huge/percentage dimensions. */
function checkDimensions(width: string | null, height: string | null, warnings: ValidationMessage[]): void {
  const parse = (v: string | null) => (v && !v.includes("%") ? parseFloat(v) : null);
  const w = parse(width);
  const h = parse(height);
  if (w !== null && (w <= 0 || w > 100000)) warnings.push({ severity: "warning", message: `Unusual width: ${width}.` });
  if (h !== null && (h <= 0 || h > 100000)) warnings.push({ severity: "warning", message: `Unusual height: ${height}.` });
}

/* -------------------------------- analyze --------------------------------- */

export interface SvgAnalysis {
  /** Byte size of the SVG (UTF-8). */
  bytes: number;
  /** Count of each element tag name. */
  elementCounts: Record<string, number>;
  /** Total element count. */
  totalElements: number;
  /** Distinct colors referenced (hex/rgb/named in fill/stroke/stop-color). */
  colors: string[];
  /** True if the SVG has SMIL (<animate…>) or CSS `@keyframes`/animation. */
  hasAnimation: boolean;
  /** True if it declares/uses gradients. */
  hasGradients: boolean;
  /** True if it uses filters. */
  hasFilters: boolean;
  /** viewBox string if present. */
  viewBox: string | null;
}

/** Report composition metrics for an SVG string. DOM-preferred, regex fallback. */
export function analyzeSvg(svg: string): SvgResult<SvgAnalysis> {
  const input = svg.trim();
  if (!input) return fail("Paste an SVG to analyze.");
  if (!/<svg[\s>]/i.test(input)) return fail("No <svg> element found.");

  const bytes = utf8Bytes(input);
  const elementCounts: Record<string, number> = {};
  const colors = new Set<string>();

  if (hasDom()) {
    const { doc, error } = parseSvgDoc(input);
    if (error) return fail(`Not well-formed: ${error}`);
    const root = doc.documentElement;
    const all = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const el of all) {
      const tag = el.nodeName.toLowerCase();
      elementCounts[tag] = (elementCounts[tag] ?? 0) + 1;
      for (const attr of ["fill", "stroke", "stop-color", "flood-color"]) {
        const v = el.getAttribute(attr);
        if (v && v !== "none" && !v.startsWith("url(")) colors.add(v.trim().toLowerCase());
      }
      const style = el.getAttribute("style");
      if (style) for (const c of extractColorsFromStyle(style)) colors.add(c);
    }
    const total = all.length;
    return ok({
      bytes,
      elementCounts,
      totalElements: total,
      colors: Array.from(colors).sort(),
      hasAnimation: Boolean(root.querySelector("animate, animateTransform, animateMotion, set")) || /@keyframes|animation\s*:/i.test(input),
      hasGradients: Boolean(root.querySelector("linearGradient, radialGradient")),
      hasFilters: Boolean(root.querySelector("filter")),
      viewBox: root.getAttribute("viewBox"),
    });
  }

  // Regex fallback.
  const tagRe = /<([a-zA-Z][\w:-]*)/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(input))) {
    const tag = m[1]!.toLowerCase();
    elementCounts[tag] = (elementCounts[tag] ?? 0) + 1;
  }
  const colorRe = /(?:fill|stroke|stop-color|flood-color)\s*[:=]\s*["']?(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)/g;
  while ((m = colorRe.exec(input))) {
    const c = m[1]!.toLowerCase();
    if (c !== "none") colors.add(c);
  }
  const total = Object.values(elementCounts).reduce((a, b) => a + b, 0);
  return ok({
    bytes,
    elementCounts,
    totalElements: total,
    colors: Array.from(colors).sort(),
    hasAnimation: /<animate|<set[\s>]|@keyframes|animation\s*:/i.test(input),
    hasGradients: /<(?:linear|radial)Gradient/i.test(input),
    hasFilters: /<filter[\s>]/i.test(input),
    viewBox: /\bviewBox\s*=\s*["']([^"']+)["']/i.exec(input)?.[1] ?? null,
  });
}

/** Pull color values out of an inline style string. */
function extractColorsFromStyle(style: string): string[] {
  const out: string[] = [];
  const re = /(?:fill|stroke|stop-color|flood-color)\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(style))) {
    const c = m[1]!.trim().toLowerCase();
    if (c !== "none") out.push(c);
  }
  return out;
}
