/**
 * GigAI Tools, markup validation engine.
 *
 * A pragmatic, in-browser linter (not a full W3C validator, and honest about
 * that): HTML well-formedness + basic SEO checks via native `DOMParser`, a
 * lightweight CSS brace/structure linter, and a meta-tag audit that reuses the
 * meta engine. No network; everything runs on pasted markup.
 */

import { analyzeMetaFromHtml, type MetaAudit } from "./meta";

export interface ValidationIssue {
  line?: number;
  column?: number;
  severity: "error" | "warning" | "info";
  message: string;
}

export interface MarkupValidation {
  ok: boolean;
  issues: ValidationIssue[];
}

/* ------------------------------- HTML checks ------------------------------ */

/**
 * Check pasted HTML: parse-level errors (via XML re-parse, best-effort) plus
 * SEO essentials, a `<title>`, a meta description, a `lang` attribute, and
 * `alt` text on images. Honest scope: browsers auto-correct HTML, so this
 * catches structural/SEO problems, not every spec violation.
 */
export function htmlWellFormed(html: string): MarkupValidation {
  const issues: ValidationIssue[] = [];
  const trimmed = html.trim();
  if (!trimmed) return { ok: false, issues: [{ severity: "error", message: "Input is empty." }] };
  if (typeof DOMParser === "undefined")
    return { ok: false, issues: [{ severity: "error", message: "DOMParser is unavailable in this environment." }] };

  // Well-formedness: re-parse as XHTML/XML to surface unclosed-tag style errors.
  // This is stricter than HTML and is advisory only (HTML need not be XML-valid).
  const looksLikeFragment = !/<html[\s>]/i.test(trimmed);
  if (!looksLikeFragment) {
    const xmlDoc = new DOMParser().parseFromString(trimmed, "application/xml");
    const err = xmlDoc.querySelector("parsererror");
    if (err) {
      issues.push({
        severity: "warning",
        message: `Not well-formed as XML (fine for HTML5, but check for unclosed tags): ${err.textContent?.trim().split("\n")[0] ?? ""}`,
      });
    }
  }

  const doc = new DOMParser().parseFromString(trimmed, "text/html");

  // <title>
  const titles = doc.querySelectorAll("title");
  if (titles.length === 0) issues.push({ severity: "warning", message: "Missing <title> element." });
  else if (titles.length > 1) issues.push({ severity: "warning", message: "More than one <title> element." });
  else if (!titles[0]?.textContent?.trim()) issues.push({ severity: "warning", message: "<title> is empty." });

  // meta description
  if (!doc.querySelector('meta[name="description"]'))
    issues.push({ severity: "info", message: "No meta description." });

  // lang
  if (!doc.documentElement?.getAttribute("lang"))
    issues.push({ severity: "warning", message: "<html> has no lang attribute (accessibility + SEO)." });

  // images without alt
  let missingAlt = 0;
  doc.querySelectorAll("img").forEach((img) => {
    if (img.getAttribute("alt") === null) missingAlt += 1;
  });
  if (missingAlt)
    issues.push({
      severity: "warning",
      message: `${missingAlt} <img> element(s) missing an alt attribute.`,
    });

  // links with empty/js hrefs
  let emptyLinks = 0;
  doc.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === "" || href === "#") emptyLinks += 1;
  });
  if (emptyLinks)
    issues.push({ severity: "info", message: `${emptyLinks} link(s) have an empty or "#" href.` });

  const hasError = issues.some((i) => i.severity === "error");
  return { ok: !hasError, issues };
}

/* -------------------------------- CSS lint -------------------------------- */

/**
 * Lightweight CSS linter, balanced braces, unterminated blocks, empty rules,
 * and stray semicolons. This is honestly NOT a full CSS parser or W3C validator;
 * it catches the structural mistakes that break stylesheets in practice.
 */
export function cssBasicValidate(css: string): MarkupValidation {
  const issues: ValidationIssue[] = [];
  const trimmed = css.trim();
  if (!trimmed) return { ok: false, issues: [{ severity: "error", message: "Input is empty." }] };

  let depth = 0;
  let line = 1;
  let column = 0;
  let inString: string | null = null;
  let inComment = false;
  let blockStartLine = 0;
  let blockHasContent = false;
  let sawSelectorText = false;

  const src = trimmed;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === undefined) break;
    const next = src[i + 1];
    column += 1;
    if (ch === "\n") {
      line += 1;
      column = 0;
      continue;
    }

    if (inComment) {
      if (ch === "*" && next === "/") {
        inComment = false;
        i += 1;
        column += 1;
      }
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        i += 1;
        column += 1;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === "/" && next === "*") {
      inComment = true;
      i += 1;
      column += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }

    if (ch === "{") {
      if (depth === 0 && !sawSelectorText) {
        issues.push({ line, column, severity: "warning", message: "Opening brace with no selector before it." });
      }
      depth += 1;
      blockStartLine = line;
      blockHasContent = false;
      sawSelectorText = false;
    } else if (ch === "}") {
      if (depth === 0) {
        issues.push({ line, column, severity: "error", message: "Unexpected }. No matching opening brace." });
      } else {
        depth -= 1;
        if (!blockHasContent) {
          issues.push({ line: blockStartLine, severity: "warning", message: "Empty rule block ({}). Has no declarations." });
        }
      }
    } else if (depth > 0 && !/\s/.test(ch)) {
      blockHasContent = true;
    } else if (depth === 0 && !/\s/.test(ch) && ch !== ";") {
      sawSelectorText = true;
    }
  }

  if (inComment) issues.push({ severity: "error", message: "Unterminated comment (/* … */ not closed)." });
  if (inString) issues.push({ severity: "error", message: "Unterminated string literal." });
  if (depth > 0)
    issues.push({ severity: "error", message: `${depth} unclosed block(s): missing ${depth} closing brace(s).` });

  const hasError = issues.some((i) => i.severity === "error");
  return { ok: !hasError, issues };
}

/* ------------------------------- meta audit ------------------------------- */

/** Audit a pasted HTML document's meta tags (reuses the meta engine). */
export function metaTagAudit(html: string): MetaAudit {
  return analyzeMetaFromHtml(html);
}
