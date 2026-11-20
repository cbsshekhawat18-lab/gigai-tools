/**
 * GigAI Tools: code export for the SVG Optimize workspace.
 *
 * One entry point (`exportAs`) that turns an optimized SVG into any of ten
 * developer-ready formats. React / React-Native / Vue / HTML / data-URI reuse
 * the existing converters in `convert.ts`; Angular and Svelte are generated
 * here. Everything is pure and SSR-safe.
 */

import { svgToReact, svgToVue, svgToHtml, svgToDataUri } from "./convert";
import { ok, fail, type SvgResult } from "./core";

export type ExportFormatId =
  | "svg"
  | "jsx"
  | "react"
  | "react-native"
  | "vue"
  | "angular"
  | "svelte"
  | "data-uri"
  | "base64"
  | "inline-html";

export interface ExportFormat {
  id: ExportFormatId;
  label: string;
  /** File extension used for the download. */
  ext: string;
  /** MIME for the download. */
  mime: string;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  { id: "svg", label: "SVG", ext: "svg", mime: "image/svg+xml;charset=utf-8" },
  { id: "jsx", label: "JSX", ext: "jsx", mime: "text/plain;charset=utf-8" },
  { id: "react", label: "React (TS)", ext: "tsx", mime: "text/plain;charset=utf-8" },
  { id: "react-native", label: "React Native", ext: "tsx", mime: "text/plain;charset=utf-8" },
  { id: "vue", label: "Vue", ext: "vue", mime: "text/plain;charset=utf-8" },
  { id: "angular", label: "Angular", ext: "ts", mime: "text/plain;charset=utf-8" },
  { id: "svelte", label: "Svelte", ext: "svelte", mime: "text/plain;charset=utf-8" },
  { id: "data-uri", label: "Data URI", ext: "txt", mime: "text/plain;charset=utf-8" },
  { id: "base64", label: "Base64", ext: "txt", mime: "text/plain;charset=utf-8" },
  { id: "inline-html", label: "Inline HTML", ext: "html", mime: "text/html;charset=utf-8" },
];

/** Sanitize a user-supplied name into a valid PascalCase identifier. */
export function toComponentName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9]+/g, " ").trim();
  if (!cleaned) return "SvgIcon";
  const pascal = cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return /^[A-Za-z]/.test(pascal) ? pascal : `Svg${pascal}`;
}

/** kebab-case a PascalCase component name (for Angular selectors / filenames). */
export function toKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

/** Escape a string so it is safe inside a JS template literal. */
function escapeTemplate(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

/** Angular standalone component wrapping the SVG. */
function svgToAngular(svg: string, componentName: string): SvgResult<string> {
  const name = toComponentName(componentName);
  const selector = `${toKebab(name)}-icon`.replace(/-icon-icon$/, "-icon");
  const template = escapeTemplate(svg.trim());
  return ok(
    `import { Component } from "@angular/core";

@Component({
  selector: "${selector}",
  standalone: true,
  template: \`
${template}
\`,
})
export class ${name}Component {}
`,
  );
}

/** Svelte component wrapping the SVG (markup only, valid in every Svelte 4/5 setup). */
function svgToSvelte(svg: string, componentName: string): SvgResult<string> {
  const name = toComponentName(componentName);
  return ok(`<!-- ${name}.svelte -->
${svg.trim()}
`);
}

/**
 * Convert an optimized SVG into the requested export format.
 * `componentName` is used by the component formats (React/Vue/Angular/Svelte).
 */
export function exportAs(svg: string, format: ExportFormatId, componentName = "SvgIcon"): SvgResult<string> {
  const input = svg.trim();
  if (!input) return fail("Nothing to export yet.");
  const name = toComponentName(componentName);

  switch (format) {
    case "svg":
      return ok(input);
    case "jsx":
      return svgToReact(input, { typescript: false, componentName: name });
    case "react":
      return svgToReact(input, { typescript: true, componentName: name });
    case "react-native":
      return svgToReact(input, { typescript: true, componentName: name, native: true });
    case "vue":
      return svgToVue(input, { ts: true, name });
    case "angular":
      return svgToAngular(input, name);
    case "svelte":
      return svgToSvelte(input, name);
    case "data-uri":
      return svgToDataUri(input, { encoding: "url-optimized" });
    case "base64":
      return svgToDataUri(input, { encoding: "base64" });
    case "inline-html":
      return svgToHtml(input, { mode: "inline" });
    default:
      return fail("Unknown export format.");
  }
}

/** Suggested download filename for a format. */
export function exportFilename(format: ExportFormatId, componentName = "SvgIcon"): string {
  const f = EXPORT_FORMATS.find((x) => x.id === format);
  const ext = f?.ext ?? "txt";
  const name = toComponentName(componentName);
  if (format === "svg") return "optimized.svg";
  if (format === "vue" || format === "svelte" || format === "react" || format === "jsx" || format === "react-native") {
    return `${name}.${ext}`;
  }
  if (format === "angular") return `${toKebab(name)}.component.ts`;
  return `${toKebab(name)}.${ext}`;
}
