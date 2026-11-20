/**
 * GigAI Tools, SVG format converters.
 *
 * Turn a raw SVG string into framework components (React / React Native / Vue),
 * embeddable HTML/CSS, or a data URI (and back). All pure string transforms -
 * no network, no DOM required (a tiny hand-rolled attribute mapper keeps this
 * SSR-safe and deterministic). JSX attribute casing, `{...props}` spreading,
 * and className/style handling match what svgr produces for the common cases.
 */

import { type SvgResult, ok, fail, escapeAttr, toBase64, fromBase64, hasDom, parseSvgDoc } from "./core";

/* ------------------------------- React ------------------------------------ */

export interface ReactOptions {
  /** Emit TypeScript (typed props) instead of plain JS (default true). */
  typescript?: boolean;
  /** Component name (default "SvgIcon"). Sanitized to a valid identifier. */
  componentName?: string;
  /** Wrap the export in React.memo (default false). */
  memo?: boolean;
  /** forwardRef the SVG ref (default false). */
  forwardRef?: boolean;
  /** Emit react-native-svg components instead of DOM SVG (default false). */
  native?: boolean;
  /** Spread `{...props}` onto the root <svg> (default true). */
  spreadProps?: boolean;
}

/** SVG attribute -> JSX camelCase (only the ones that actually differ). */
const JSX_ATTR_MAP: Record<string, string> = {
  class: "className",
  "clip-path": "clipPath",
  "clip-rule": "clipRule",
  "fill-opacity": "fillOpacity",
  "fill-rule": "fillRule",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-opacity": "strokeOpacity",
  "stroke-miterlimit": "strokeMiterlimit",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "text-anchor": "textAnchor",
  "xlink:href": "xlinkHref",
  "xml:space": "xmlSpace",
  "color-interpolation-filters": "colorInterpolationFilters",
  "flood-color": "floodColor",
  "flood-opacity": "floodOpacity",
  offset: "offset",
};

/** react-native-svg tag names for the elements RN actually supports. */
const RN_TAG_MAP: Record<string, string> = {
  svg: "Svg",
  path: "Path",
  g: "G",
  circle: "Circle",
  rect: "Rect",
  ellipse: "Ellipse",
  line: "Line",
  polygon: "Polygon",
  polyline: "Polyline",
  text: "Text",
  tspan: "TSpan",
  defs: "Defs",
  lineargradient: "LinearGradient",
  radialgradient: "RadialGradient",
  stop: "Stop",
  clippath: "ClipPath",
  mask: "Mask",
  use: "Use",
  symbol: "Symbol",
};

/** Convert an SVG string into React component source code. */
export function svgToReact(svg: string, options: ReactOptions = {}): SvgResult<string> {
  const input = svg.trim();
  if (!input) return fail("Paste an SVG to convert.");
  const inner = extractSvgInner(input);
  if (!inner) return fail("Could not find an <svg> element.");

  const name = sanitizeComponentName(options.componentName ?? "SvgIcon");
  const ts = options.typescript ?? true;
  const memo = options.memo ?? false;
  const fwd = options.forwardRef ?? false;
  const native = options.native ?? false;
  const spread = options.spreadProps ?? true;

  const jsx = toJsx(inner.openTag, inner.body, { native, spread, indent: 2 });

  const propsType = ts ? (native ? "SvgProps" : "React.SVGProps<SVGSVGElement>") : "";
  const propsParam = ts ? `props: ${propsType}` : "props";
  const refType = ts ? "SVGSVGElement" : "";

  let component: string;
  if (fwd) {
    const sig = ts ? `React.forwardRef<${refType}, ${propsType}>((props, ref)` : "React.forwardRef((props, ref)";
    component = `const ${name} = ${sig} => (\n${indentBlock(replaceRef(jsx), 2)}\n));`;
  } else {
    component = `function ${name}(${propsParam}) {\n  return (\n${indentBlock(jsx, 4)}\n  );\n}`;
  }

  // Build imports. React Native pulls the used <Svg>/<Path>/… components (and
  // the SvgProps type in TS) from react-native-svg; the web build only needs
  // React when emitting TS/forwardRef.
  let rnImport = "";
  if (native) {
    const named = collectRnImports(jsx);
    const typeImport = ts ? ", type SvgProps" : "";
    const namedClause = named ? `{ ${named}${typeImport} }` : ts ? `{ type SvgProps }` : "";
    rnImport = `import Svg${namedClause ? `, ${namedClause}` : ""} from "react-native-svg";\n`;
  }
  // React is needed for typed props (React.SVGProps) and for forwardRef/memo.
  const reactImport = ts || fwd || memo ? `import * as React from "react";\n` : "";

  const header = native ? rnImport + reactImport : reactImport;
  const exportLine = memo ? `\nexport default React.memo(${name});` : `\nexport default ${name};`;
  const body = `${header ? header + "\n" : ""}${component}${exportLine}\n`;
  return ok(body);
}

/* ------------------------------- Vue -------------------------------------- */

export interface VueOptions {
  /** Use <script setup lang="ts"> (default true). */
  ts?: boolean;
  /** Component display name for the SFC (default "SvgIcon"). */
  name?: string;
}

/** Convert an SVG string into a Vue 3 SFC (`<template>` + `<script setup>`). */
export function svgToVue(svg: string, options: VueOptions = {}): SvgResult<string> {
  const input = svg.trim();
  if (!input) return fail("Paste an SVG to convert.");
  const inner = extractSvgInner(input);
  if (!inner) return fail("Could not find an <svg> element.");
  const ts = options.ts ?? true;
  // Vue keeps kebab-case attributes; just forward attrs via v-bind="$attrs".
  const openTag = inner.openTag.replace(/>$/, ' v-bind="$attrs">');
  const template = `<template>\n  ${openTag}${inner.body ? "\n" + indentBlock(inner.body, 4) + "\n  " : ""}</svg>\n</template>`;
  const script = ts
    ? `\n\n<script setup lang="ts">\n// ${sanitizeComponentName(options.name ?? "SvgIcon")}: attributes pass through via $attrs\n</script>\n`
    : `\n\n<script setup>\n</script>\n`;
  return ok(template + script);
}

/* ------------------------------- HTML ------------------------------------- */

export interface HtmlOptions {
  /** "inline" embeds the raw <svg>; "img-datauri" emits <img src="data:...">. */
  mode?: "inline" | "img-datauri";
  /** alt text for the img mode (default ""). */
  alt?: string;
}

/** Wrap an SVG for direct HTML embedding, inline or as a data-URI <img>. */
export function svgToHtml(svg: string, options: HtmlOptions = {}): SvgResult<string> {
  const input = svg.trim();
  if (!input) return fail("Paste an SVG to convert.");
  const mode = options.mode ?? "inline";
  if (mode === "inline") return ok(input);
  const uri = svgToDataUri(input, { encoding: "url-optimized" });
  if (!uri.ok) return uri;
  return ok(`<img src="${escapeAttr(uri.result)}" alt="${escapeAttr(options.alt ?? "")}" />`);
}

/* ------------------------------- CSS -------------------------------------- */

export interface CssOptions {
  /** CSS selector to attach the rule to (default ".icon"). */
  selector?: string;
  /** background-image or mask (mask lets you recolor via background-color). */
  mode?: "background" | "mask";
}

/** Emit a CSS rule that renders the SVG as a background or mask image. */
export function svgToCss(svg: string, options: CssOptions = {}): SvgResult<string> {
  const input = svg.trim();
  if (!input) return fail("Paste an SVG to convert.");
  const selector = options.selector?.trim() || ".icon";
  const mode = options.mode ?? "background";
  const uri = svgToDataUri(input, { encoding: "url-optimized" });
  if (!uri.ok) return uri;
  const url = `url("${uri.result}")`;
  if (mode === "mask") {
    return ok(
      `${selector} {\n` +
        `  -webkit-mask: ${url} no-repeat center / contain;\n` +
        `  mask: ${url} no-repeat center / contain;\n` +
        `  background-color: currentColor;\n` +
        `}`,
    );
  }
  return ok(`${selector} {\n  background: ${url} no-repeat center / contain;\n}`);
}

/* ------------------------------ Data URI ---------------------------------- */

export interface DataUriOptions {
  /** base64 = classic; url-optimized = smaller, CSS-friendly percent encoding. */
  encoding?: "base64" | "url-optimized";
}

/**
 * Encode an SVG string as a `data:` URI. `url-optimized` yields a smaller,
 * un-base64'd payload with minimal percent-encoding (best for CSS `url()`),
 * following the well-known "optimizing SVGs in data URIs" recipe.
 */
export function svgToDataUri(svg: string, options: DataUriOptions = {}): SvgResult<string> {
  const input = svg.trim();
  if (!input) return fail("Paste an SVG to convert.");
  const encoding = options.encoding ?? "url-optimized";
  if (encoding === "base64") {
    return ok(`data:image/svg+xml;base64,${toBase64(input)}`);
  }
  // url-optimized: single-quote attributes, then percent-encode only the
  // characters that break inside a double-quoted CSS url("...").
  const singleQuoted = input.replace(/"/g, "'");
  const encoded = singleQuoted
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/&/g, "%26")
    .replace(/\{/g, "%7B")
    .replace(/\}/g, "%7D")
    .replace(/\r?\n/g, "")
    .trim();
  return ok(`data:image/svg+xml,${encoded}`);
}

/** Decode a `data:image/svg+xml` URI (base64 or url-encoded) back to raw SVG. */
export function dataUriToSvg(uri: string): SvgResult<string> {
  const input = uri.trim();
  const match = /^data:image\/svg\+xml(;charset=[^,;]+)?(;base64)?,(.*)$/is.exec(input);
  if (!match) return fail("Not an SVG data URI (expected data:image/svg+xml,...).");
  const isBase64 = Boolean(match[2]);
  const payload = match[3] ?? "";
  try {
    const raw = isBase64 ? fromBase64(payload) : decodeURIComponent(payload);
    if (!raw.includes("<svg")) return fail("Decoded payload is not an SVG.");
    return ok(raw);
  } catch {
    return fail("Failed to decode the data URI payload.");
  }
}

/* ------------------------------ internals --------------------------------- */

/** A valid JS identifier, PascalCase-ish, from arbitrary user text. */
function sanitizeComponentName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9_$]/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const pascal = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  const safe = pascal || "SvgIcon";
  return /^[A-Za-z_$]/.test(safe) ? safe : `Svg${safe}`;
}

/** Split an SVG string into its `<svg ...>` open tag and inner body. */
function extractSvgInner(svg: string): { openTag: string; body: string } | null {
  const open = /<svg\b[^>]*>/i.exec(svg);
  if (!open) return null;
  const openTag = open[0];
  const closeIdx = svg.lastIndexOf("</svg>");
  if (closeIdx === -1) return null;
  const body = svg.slice(open.index + openTag.length, closeIdx).trim();
  return { openTag, body };
}

/**
 * Rewrite an SVG fragment (open tag + body) into JSX. Camel-cases attributes,
 * converts inline `style="a:b"` to object syntax, drops XML-only cruft, and -
 * for React Native, renames tags. `spread` injects `{...props}` on the root.
 */
function toJsx(
  openTag: string,
  body: string,
  opts: { native: boolean; spread: boolean; indent: number },
): string {
  const rootTag = opts.native ? "Svg" : "svg";
  const rootAttrs = jsxAttrs(openTag, opts.native);
  const spread = opts.spread ? ` {...props}` : "";
  const open = `<${rootTag}${rootAttrs}${spread}>`;
  const close = `</${rootTag}>`;
  const jsxBody = rewriteFragment(body, opts.native);
  return jsxBody ? `${open}\n${indentBlock(jsxBody, opts.indent)}\n${close}` : `${open}${close}`;
}

/** Rewrite all tags/attributes in a fragment string to JSX. */
function rewriteFragment(fragment: string, native: boolean): string {
  if (!fragment) return "";
  // Rewrite each tag; leave text nodes alone.
  let out = fragment.replace(/<(\/?)([a-zA-Z][\w:-]*)((?:\s[^>]*?)?)(\/?)>/g, (_m, slash, tag, attrs, selfClose) => {
    const name = native ? RN_TAG_MAP[tag.toLowerCase()] ?? capitalize(tag) : tag;
    if (slash) return `</${name}>`;
    const converted = attrs ? jsxAttrs(`<x${attrs}>`, native) : "";
    return `<${name}${converted}${selfClose ? " />" : ">"}`;
  });
  // Collapse the ">\n<" style noise into readable multi-line JSX.
  out = out.replace(/>\s*</g, ">\n<");
  return out.trim();
}

/** Extract and camel-case attributes from an open tag string. */
function jsxAttrs(openTag: string, native: boolean): string {
  const attrRe = /([:\w-]+)(?:=("[^"]*"|'[^']*'))?/g;
  // Strip the leading "<tag" and trailing ">".
  const inner = openTag.replace(/^<\S+/, "").replace(/\/?>$/, "");
  const pairs: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(inner))) {
    const rawName = m[1];
    if (!rawName) continue;
    const lower = rawName.toLowerCase();
    // Drop XML-namespace declarations and version noise in JSX.
    if (lower === "xmlns:xlink" && native) continue;
    if (lower.startsWith("xmlns") && native) continue;
    const value = m[2] ? m[2].slice(1, -1) : null;

    if (lower === "style" && value !== null) {
      pairs.push(`style={${styleToObject(value)}}`);
      continue;
    }
    const jsxName = JSX_ATTR_MAP[lower] ?? (lower.includes(":") ? lower.replace(/:(\w)/g, (_s, c) => c.toUpperCase()) : rawName);
    if (value === null) {
      pairs.push(jsxName);
    } else if (/^\{.*\}$/.test(value)) {
      pairs.push(`${jsxName}=${value}`);
    } else {
      pairs.push(`${jsxName}="${value.replace(/"/g, "&quot;")}"`);
    }
  }
  return pairs.length ? " " + pairs.join(" ") : "";
}

/** `"fill:red;stroke:blue"` -> `{{ fill: "red", stroke: "blue" }}` inner. */
function styleToObject(style: string): string {
  const entries = style
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((decl) => {
      const idx = decl.indexOf(":");
      if (idx === -1) return null;
      const prop = decl.slice(0, idx).trim();
      const val = decl.slice(idx + 1).trim();
      const camel = prop.replace(/-([a-z])/g, (_s, c) => c.toUpperCase());
      return `${/^[a-zA-Z_$][\w$]*$/.test(camel) ? camel : `"${camel}"`}: "${val.replace(/"/g, '\\"')}"`;
    })
    .filter(Boolean);
  return `{ ${entries.join(", ")} }`;
}

/** Add `ref={ref}` to the root <svg>/<Svg> of a JSX string (forwardRef). */
function replaceRef(jsx: string): string {
  return jsx.replace(/^(<(?:svg|Svg)\b[^>]*?)(\s*\{\.\.\.props\})?>/, (_m, head, spread) => `${head} ref={ref}${spread ?? ""}>`);
}

/** Collect the set of react-native-svg component names used in a JSX string. */
function collectRnImports(jsx: string): string {
  const used = new Set<string>();
  const re = /<([A-Z]\w*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(jsx))) {
    const name = m[1];
    if (name && name !== "Svg") used.add(name);
  }
  return Array.from(used).sort().join(", ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Indent every line of a block by `spaces`. */
function indentBlock(block: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return block
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n");
}

/**
 * Optional strict validation before conversion (used by UIs that want to warn
 * on malformed input). Returns null when fine, or a message. DOM-only.
 */
export function preflight(svg: string): string | null {
  if (!hasDom()) return null;
  const { error } = parseSvgDoc(svg);
  return error;
}
