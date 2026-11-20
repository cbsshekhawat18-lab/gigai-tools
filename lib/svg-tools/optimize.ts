/**
 * GigAI Tools, SVG optimizer.
 *
 * `optimizeSvg` runs SVGO's browser build (lazy-imported) for best-in-class
 * minification, and falls back to a dependency-free optimizer when SVGO cannot
 * load (offline chunk, exotic runtime). The fallback is honest about its
 * limits: it strips comments/metadata/editor namespaces, collapses whitespace,
 * drops empty groups, and rounds coordinates. It does NOT merge paths or run
 * SVGO's full plugin set. `minifySvg`/`prettifySvg` are thin wrappers, and
 * `sizeReport` quantifies the win (with a gzip estimate).
 */

import {
  type SvgResult,
  ok,
  fail,
  errMessage,
  roundNumbersInString,
  hasDom,
  parseSvgDoc,
  serialize,
  utf8Bytes,
} from "./core";

/** Options accepted by {@link optimizeSvg}. Mirrors the useful SVGO knobs. */
export interface OptimizeOptions {
  /** Decimal places for coordinates/paths (default 3). */
  precision?: number;
  /** Run SVGO's multipass (default true). */
  multipass?: boolean;
  /** Keep the `viewBox` attribute (default true, removing it breaks scaling). */
  keepViewBox?: boolean;
  /** Remove `id` attributes (default false: ids may be referenced). */
  removeIds?: boolean;
  /** Remove `<title>`/`<desc>` metadata (default false, a11y). */
  removeTitle?: boolean;
  /** Prettify the output with indentation instead of minifying (default false). */
  pretty?: boolean;
  /** Strip `width`/`height` so the SVG scales fluidly (default false). */
  removeDimensions?: boolean;
}

const DEFAULTS: Required<OptimizeOptions> = {
  precision: 3,
  multipass: true,
  keepViewBox: true,
  removeIds: false,
  removeTitle: false,
  pretty: false,
  removeDimensions: false,
};

/** SVGO's browser entry point, typed just enough for our call. */
type SvgoOptimize = (
  svg: string,
  config: Record<string, unknown>,
) => { data: string };

/**
 * Optimize an SVG string. Tries SVGO first; on any load/exec failure it uses
 * the built-in fallback so the tool never hard-fails offline. Empty input is a
 * typed error.
 */
export async function optimizeSvg(svg: string, options: OptimizeOptions = {}): Promise<SvgResult<string>> {
  const opts = { ...DEFAULTS, ...options };
  const input = svg.trim();
  if (!input) return fail("Paste an SVG to optimize.");
  if (!/<svg[\s>]/i.test(input)) return fail("Input does not contain an <svg> element.");

  try {
    const svgo = await loadSvgo();
    if (svgo) {
      const config = buildSvgoConfig(opts);
      const { data } = svgo(input, config);
      if (data && data.includes("<svg")) return ok(data);
    }
  } catch {
    // fall through to the dependency-free optimizer
  }

  try {
    return ok(fallbackOptimize(input, opts));
  } catch (err) {
    return fail(`Optimize failed: ${errMessage(err)}`);
  }
}

/** Minify: optimize with pretty=false. Thin wrapper over {@link optimizeSvg}. */
export async function minifySvg(svg: string, options: OptimizeOptions = {}): Promise<SvgResult<string>> {
  return optimizeSvg(svg, { ...options, pretty: false });
}

/**
 * Prettify: re-indent an SVG for readability. Uses SVGO's prettify path when
 * available, otherwise a dependency-free indenter. Does not remove data.
 */
export async function prettifySvg(svg: string, indent = 2): Promise<SvgResult<string>> {
  const input = svg.trim();
  if (!input) return fail("Paste an SVG to format.");
  try {
    const svgo = await loadSvgo();
    if (svgo) {
      const { data } = svgo(input, {
        multipass: false,
        js2svg: { pretty: true, indent },
        plugins: [{ name: "removeComments" }],
      });
      if (data && data.includes("<svg")) return ok(data);
    }
  } catch {
    /* fall through */
  }
  try {
    return ok(indentSvg(input, indent));
  } catch (err) {
    return fail(`Format failed: ${errMessage(err)}`);
  }
}

/** Byte/size deltas between two SVG strings, with a gzip estimate. */
export interface SizeReport {
  bytesBefore: number;
  bytesAfter: number;
  savedBytes: number;
  /** Percent saved, 0–100, one decimal. Negative if output grew. */
  savedPct: number;
  /** Rough gzipped size of the optimized output (see {@link estimateGzip}). */
  gzipEstimate: number;
  gzipBefore: number;
}

/** Compute a before/after size report. Pure, no allocation of the SVG itself. */
export function sizeReport(before: string, after: string): SizeReport {
  const bytesBefore = utf8Bytes(before);
  const bytesAfter = utf8Bytes(after);
  const savedBytes = bytesBefore - bytesAfter;
  const savedPct = bytesBefore === 0 ? 0 : Math.round((savedBytes / bytesBefore) * 1000) / 10;
  return {
    bytesBefore,
    bytesAfter,
    savedBytes,
    savedPct,
    gzipEstimate: estimateGzip(after),
    gzipBefore: estimateGzip(before),
  };
}

/* ----------------------------- SVGO integration --------------------------- */

let svgoPromise: Promise<SvgoOptimize | null> | null = null;

/** Lazy-load SVGO's browser build once; resolves null if unavailable. */
async function loadSvgo(): Promise<SvgoOptimize | null> {
  if (!svgoPromise) {
    svgoPromise = (async () => {
      try {
        // Browser-safe build ONLY. The bare "svgo" entry resolves to svgo-node.js
        // which imports `fs/promises` and cannot bundle for the browser, so we
        // never fall back to it. If the browser build fails to load, callers use
        // the dependency-free fallback optimizer instead.
        const mod = (await import(/* webpackIgnore: false */ "svgo/dist/svgo.browser.js")) as {
          optimize?: SvgoOptimize;
          default?: { optimize?: SvgoOptimize };
        };
        return mod.optimize ?? mod.default?.optimize ?? null;
      } catch {
        return null;
      }
    })();
  }
  return svgoPromise;
}

/** Translate our options into an SVGO preset-default override config. */
function buildSvgoConfig(opts: Required<OptimizeOptions>): Record<string, unknown> {
  return {
    multipass: opts.multipass,
    floatPrecision: opts.precision,
    js2svg: opts.pretty ? { pretty: true, indent: 2 } : { pretty: false },
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: opts.keepViewBox ? false : true,
            cleanupIds: opts.removeIds ? {} : false,
            removeTitle: opts.removeTitle,
            removeDesc: opts.removeTitle ? { removeAny: true } : false,
          },
        },
      },
      ...(opts.removeDimensions ? [{ name: "removeDimensions" }] : []),
    ],
  };
}

/* --------------------------- dependency-free path ------------------------- */

/**
 * Zero-dependency optimizer. DOM-based when available (accurate node removal),
 * else a regex-based text cleanup. Applies: comment removal, metadata &
 * editor-namespace stripping (inkscape/sketch/figma/adobe/sodipodi), empty
 * `<g>` collapse, whitespace/newline collapse, and coordinate rounding.
 */
export function fallbackOptimize(svg: string, options: OptimizeOptions = {}): string {
  const opts = { ...DEFAULTS, ...options };
  if (hasDom()) {
    try {
      return fallbackWithDom(svg, opts);
    } catch {
      /* fall back to text cleanup */
    }
  }
  return fallbackTextClean(svg, opts);
}

const EDITOR_NS_PREFIXES = ["inkscape", "sodipodi", "sketch", "figma", "illustrator", "adobe", "krita", "vectornator"];

/** Accurate DOM-based cleanup (client component / jsdom). */
function fallbackWithDom(svg: string, opts: Required<OptimizeOptions>): string {
  const { doc, error } = parseSvgDoc(svg);
  if (error) throw new Error(error);
  const root = doc.documentElement;

  // Remove comments and editor-only elements.
  const walker = doc.createTreeWalker(root, 0x1 | 0x80 /* ELEMENT | COMMENT */);
  const toRemove: Node[] = [];
  let node: Node | null = walker.currentNode;
  while (node) {
    if (node.nodeType === 8 /* comment */) {
      toRemove.push(node);
    } else if (node.nodeType === 1) {
      const el = node as Element;
      const name = el.nodeName.toLowerCase();
      const isEditor = EDITOR_NS_PREFIXES.some((p) => name.startsWith(`${p}:`));
      const isMeta = name === "metadata" || name === "sodipodi:namedview";
      if (isEditor || isMeta) toRemove.push(el);
      else if (opts.removeTitle && (name === "title" || name === "desc")) toRemove.push(el);
    }
    node = walker.nextNode();
  }
  for (const n of toRemove) n.parentNode?.removeChild(n);

  // Strip editor attributes and namespace declarations across all elements.
  const els = root.querySelectorAll("*");
  const scrub = (el: Element) => {
    for (const attr of Array.from(el.attributes)) {
      const an = attr.name.toLowerCase();
      if (EDITOR_NS_PREFIXES.some((p) => an.startsWith(`${p}:`) || an === `xmlns:${p}`)) {
        el.removeAttribute(attr.name);
      } else if (an === "xmlns:dc" || an === "xmlns:cc" || an === "xmlns:rdf") {
        el.removeAttribute(attr.name);
      } else if (opts.removeIds && an === "id") {
        el.removeAttribute(attr.name);
      }
    }
  };
  scrub(root);
  els.forEach(scrub);

  // Remove empty groups (no children, no meaningful attributes).
  root.querySelectorAll("g").forEach((g) => {
    if (g.children.length === 0 && g.attributes.length === 0) g.parentNode?.removeChild(g);
  });

  if (!opts.keepViewBox) root.removeAttribute("viewBox");
  if (opts.removeDimensions) {
    root.removeAttribute("width");
    root.removeAttribute("height");
  }

  let out = serialize(root);
  out = roundNumbersInString(out, opts.precision);
  return opts.pretty ? indentSvg(out, 2) : collapseWhitespace(out);
}

/** Regex-only cleanup for non-DOM runtimes (SSR safety net). */
function fallbackTextClean(svg: string, opts: Required<OptimizeOptions>): string {
  let out = svg;
  out = out.replace(/<!--[\s\S]*?-->/g, ""); // comments
  out = out.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
  out = out.replace(/<sodipodi:namedview[\s\S]*?(?:\/>|<\/sodipodi:namedview>)/gi, "");
  // Editor-namespaced elements (self-closing or paired).
  for (const p of EDITOR_NS_PREFIXES) {
    out = out.replace(new RegExp(`<${p}:[^>]*?/>`, "gi"), "");
    out = out.replace(new RegExp(`<${p}:[^>]*?>[\\s\\S]*?</${p}:[^>]*?>`, "gi"), "");
    out = out.replace(new RegExp(`\\s${p}:[\\w-]+="[^"]*"`, "gi"), ""); // editor attrs
    out = out.replace(new RegExp(`\\sxmlns:${p}="[^"]*"`, "gi"), ""); // ns decls
  }
  out = out.replace(/\sxmlns:(dc|cc|rdf)="[^"]*"/gi, "");
  if (opts.removeIds) out = out.replace(/\sid="[^"]*"/gi, "");
  out = roundNumbersInString(out, opts.precision);
  return opts.pretty ? out.trim() : collapseWhitespace(out);
}

/** Collapse inter-tag whitespace and runs of spaces without harming text. */
function collapseWhitespace(svg: string): string {
  return svg
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\/>/g, "/>")
    .trim();
}

/**
 * Re-indent a well-formed SVG string. Splits on tag boundaries and tracks
 * depth. Best-effort: keeps text nodes on their parent's line.
 */
function indentSvg(svg: string, indent: number): string {
  const pad = " ".repeat(Math.max(0, indent));
  const tokens = collapseWhitespace(svg).replace(/></g, ">\n<").split("\n");
  let depth = 0;
  const lines: string[] = [];
  for (const raw of tokens) {
    const token = raw.trim();
    if (!token) continue;
    const isClose = /^<\//.test(token);
    const isSelfClose = /\/>$/.test(token) || /^<\?/.test(token) || /^<!/.test(token);
    const isOpen = /^<[^/!?]/.test(token) && !isSelfClose;
    if (isClose) depth = Math.max(0, depth - 1);
    lines.push(pad.repeat(depth) + token);
    if (isOpen && !/<\/[\w:.-]+>$/.test(token)) depth += 1;
  }
  return lines.join("\n");
}

/**
 * Estimate gzipped size without running a compressor. SVG is highly
 * compressible markup; empirically gzip lands around 30–45% of raw. We model
 * it from raw bytes and the ratio of unique characters (proxy for entropy):
 * more repetition -> smaller. Clamped to a sane band. This is an ESTIMATE,
 * clearly labeled in the UI. Not a real gzip.
 */
export function estimateGzip(svg: string): number {
  const bytes = utf8Bytes(svg);
  if (bytes === 0) return 0;
  const unique = new Set(svg).size;
  // Entropy proxy: 0 (very repetitive) .. 1 (all-unique).
  const entropy = Math.min(1, unique / Math.min(svg.length, 96));
  const ratio = 0.28 + entropy * 0.22; // 0.28–0.50
  return Math.max(20, Math.round(bytes * ratio));
}
