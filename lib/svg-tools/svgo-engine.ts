/**
 * GigAI Tools, SVGO engine layer.
 *
 * A thin, typed wrapper around SVGO's browser build (`svgo/dist/svgo.browser.js`)
 * that powers the premium Optimize workspace. It:
 *   • enumerates SVGO's built-in plugins at runtime (name + description) and
 *     groups them into human categories for the plugin panel,
 *   • builds SVGO configs for the four modes (Smart / Safe / Max / Custom),
 *   • runs optimization with a graceful fallback to the dependency-free
 *     optimizer in `optimize.ts` when SVGO can't load.
 *
 * Pure config/registry logic lives here so it can be shared by the main thread
 * and the optimize Web Worker. No DOM access at module scope.
 */

import { fallbackOptimize, type OptimizeOptions } from "./optimize";
import type { SvgKind } from "./analyze";

/* ─────────────────────────── plugin registry ─────────────────────────────── */

/** Human-facing plugin groups shown in the Advanced panel. */
export type PluginCategory =
  | "Cleanup"
  | "Path Optimization"
  | "Metadata"
  | "IDs"
  | "Styling"
  | "Shapes"
  | "Precision"
  | "Performance";

export const PLUGIN_CATEGORIES: PluginCategory[] = [
  "Cleanup",
  "Path Optimization",
  "Metadata",
  "IDs",
  "Styling",
  "Shapes",
  "Precision",
  "Performance",
];

/** One SVGO plugin as surfaced to the UI. */
export interface PluginInfo {
  name: string;
  description: string;
  category: PluginCategory;
  /** Whether SVGO's `preset-default` enables it (our "recommended" baseline). */
  inPreset: boolean;
}

/**
 * Map SVGO plugin names → our category. Names not listed fall back to a
 * heuristic (see `categorize`). Kept as data so the UI never hardcodes plugins.
 */
const CATEGORY_BY_NAME: Record<string, PluginCategory> = {
  // Cleanup
  cleanupAttrs: "Cleanup",
  cleanupEnableBackground: "Cleanup",
  removeComments: "Cleanup",
  removeDoctype: "Cleanup",
  removeXMLProcInst: "Cleanup",
  removeEmptyAttrs: "Cleanup",
  removeEmptyContainers: "Cleanup",
  removeEmptyText: "Cleanup",
  removeUselessDefs: "Cleanup",
  removeUnknownsAndDefaults: "Cleanup",
  removeNonInheritableGroupAttrs: "Cleanup",
  removeUselessStrokeAndFill: "Cleanup",
  removeDeprecatedAttrs: "Cleanup",
  removeEditorsNSData: "Cleanup",
  removeXMLNS: "Cleanup",
  // Metadata
  removeMetadata: "Metadata",
  removeTitle: "Metadata",
  removeDesc: "Metadata",
  // IDs
  cleanupIds: "IDs",
  prefixIds: "IDs",
  removeElementsByAttr: "IDs",
  // Path
  convertPathData: "Path Optimization",
  mergePaths: "Path Optimization",
  reusePaths: "Path Optimization",
  removeOffCanvasPaths: "Path Optimization",
  // Styling
  inlineStyles: "Styling",
  minifyStyles: "Styling",
  convertColors: "Styling",
  convertStyleToAttrs: "Styling",
  removeStyleElement: "Styling",
  removeScriptElement: "Styling",
  removeScripts: "Styling",
  // Shapes
  convertShapeToPath: "Shapes",
  convertEllipseToCircle: "Shapes",
  mergeStyles: "Shapes",
  // Precision
  cleanupNumericValues: "Precision",
  cleanupListOfValues: "Precision",
  convertTransform: "Precision",
  // Performance
  collapseGroups: "Performance",
  moveElemsAttrsToGroup: "Performance",
  moveGroupAttrsToElems: "Performance",
  removeHiddenElems: "Performance",
  removeViewBox: "Performance",
  removeDimensions: "Performance",
  removeRasterImages: "Performance",
  removeXlink: "Performance",
  sortAttrs: "Performance",
  sortDefsChildren: "Performance",
  addAttributesToSVGElement: "Performance",
  addClassesToSVGElement: "Performance",
};

/** Best-effort category for a plugin name not in the explicit map. */
function categorize(name: string): PluginCategory {
  const known = CATEGORY_BY_NAME[name];
  if (known) return known;
  const n = name.toLowerCase();
  if (n.includes("path")) return "Path Optimization";
  if (n.includes("id")) return "IDs";
  if (n.includes("style") || n.includes("color")) return "Styling";
  if (n.includes("shape") || n.includes("circle") || n.includes("ellipse")) return "Shapes";
  if (n.includes("numeric") || n.includes("transform") || n.includes("precision")) return "Precision";
  if (n.includes("meta") || n.includes("title") || n.includes("desc") || n.includes("comment")) return "Metadata";
  if (n.includes("sort") || n.includes("collapse") || n.includes("move") || n.includes("hidden")) return "Performance";
  return "Cleanup";
}

/** SVGO browser-build surface we touch. */
interface SvgoBrowser {
  optimize: (svg: string, config: Record<string, unknown>) => { data: string };
  VERSION: string;
  builtinPlugins: ReadonlyArray<{ name: string; description?: string; isPreset?: boolean }>;
}

let svgoPromise: Promise<SvgoBrowser | null> | null = null;

/** Lazy-load SVGO's browser build once; resolves null if unavailable. */
export async function loadSvgo(): Promise<SvgoBrowser | null> {
  if (!svgoPromise) {
    svgoPromise = (async () => {
      try {
        const mod = (await import("svgo/dist/svgo.browser.js")) as unknown as Partial<SvgoBrowser> & {
          default?: Partial<SvgoBrowser>;
        };
        const optimize = mod.optimize ?? mod.default?.optimize;
        if (!optimize) return null;
        return {
          optimize,
          VERSION: mod.VERSION ?? mod.default?.VERSION ?? "4",
          builtinPlugins: mod.builtinPlugins ?? mod.default?.builtinPlugins ?? [],
        };
      } catch {
        return null;
      }
    })();
  }
  return svgoPromise;
}

let registryCache: PluginInfo[] | null = null;

/**
 * The full plugin registry (name, description, category, inPreset), sorted by
 * category then name. Enumerated from SVGO's `builtinPlugins`; presets are
 * excluded. Returns [] if SVGO can't load (Advanced panel then hides).
 */
export async function getPluginRegistry(): Promise<PluginInfo[]> {
  if (registryCache) return registryCache;
  const svgo = await loadSvgo();
  if (!svgo) return [];
  const preset = new Set(PRESET_DEFAULT_PLUGINS);
  const list: PluginInfo[] = [];
  for (const p of svgo.builtinPlugins) {
    if (!p?.name || p.isPreset || p.name === "preset-default") continue;
    list.push({
      name: p.name,
      description: (p.description ?? "").trim() || "SVGO optimization plugin.",
      category: categorize(p.name),
      inPreset: preset.has(p.name),
    });
  }
  list.sort((a, b) => {
    const ci = PLUGIN_CATEGORIES.indexOf(a.category) - PLUGIN_CATEGORIES.indexOf(b.category);
    return ci !== 0 ? ci : a.name.localeCompare(b.name);
  });
  registryCache = list;
  return list;
}

/** Plugins enabled by SVGO's `preset-default` (v4), our "recommended" set. */
export const PRESET_DEFAULT_PLUGINS: string[] = [
  "removeDoctype",
  "removeXMLProcInst",
  "removeComments",
  "removeMetadata",
  "removeEditorsNSData",
  "cleanupAttrs",
  "mergeStyles",
  "inlineStyles",
  "minifyStyles",
  "cleanupIds",
  "removeUselessDefs",
  "cleanupNumericValues",
  "convertColors",
  "removeUnknownsAndDefaults",
  "removeNonInheritableGroupAttrs",
  "removeUselessStrokeAndFill",
  "cleanupEnableBackground",
  "removeHiddenElems",
  "removeEmptyText",
  "convertShapeToPath",
  "convertEllipseToCircle",
  "moveElemsAttrsToGroup",
  "moveGroupAttrsToElems",
  "collapseGroups",
  "convertPathData",
  "convertTransform",
  "removeEmptyAttrs",
  "removeEmptyContainers",
  "mergePaths",
  "removeUnusedNS",
  "sortDefsChildren",
  "removeDesc",
];

/* ───────────────────────────── optimize modes ────────────────────────────── */

export type OptimizeMode = "smart" | "safe" | "max" | "custom";

/** Per-plugin on/off overrides for Custom mode (name → enabled). */
export type CustomPlugins = Record<string, boolean>;

export interface EngineOptions {
  mode: OptimizeMode;
  /** Decimal precision for coordinates/paths. */
  precision: number;
  /** Prettify output instead of minifying. */
  pretty: boolean;
  /** Multipass. */
  multipass: boolean;
  /** Custom-mode per-plugin toggles (ignored unless mode === "custom"). */
  custom?: CustomPlugins;
  /** For Smart mode: the detected kind, so we can tune the profile. */
  kind?: SvgKind;
}

/**
 * Build an SVGO config for a mode. Safe/Smart/Max use `preset-default` with
 * tuned overrides; Custom builds an explicit plugin list from the toggles.
 */
export function buildConfig(opts: EngineOptions): Record<string, unknown> {
  const js2svg = opts.pretty ? { pretty: true, indent: 2 } : { pretty: false };
  const base = { multipass: opts.multipass, floatPrecision: opts.precision, js2svg };

  if (opts.mode === "custom") {
    const custom = opts.custom ?? {};
    const plugins = Object.entries(custom)
      .filter(([, on]) => on)
      .map(([name]) => ({ name }));
    return { ...base, plugins };
  }

  // preset-default with per-mode override policy.
  const overrides = presetOverrides(opts.mode, opts.kind);
  const extra = presetExtraPlugins(opts.mode);
  return {
    ...base,
    plugins: [{ name: "preset-default", params: { overrides } }, ...extra],
  };
}

/** Override policy for the preset per mode/kind. `false` disables a plugin. */
function presetOverrides(mode: OptimizeMode, kind?: SvgKind): Record<string, unknown> {
  // Shared: never strip viewBox by default (breaks responsive scaling).
  const o: Record<string, unknown> = { removeViewBox: false };

  if (mode === "safe") {
    // Conservative: keep ids, titles/descs (a11y), don't touch hidden elems.
    o.cleanupIds = false;
    o.removeTitle = false;
    o.removeDesc = false;
    o.removeHiddenElems = false;
    return o;
  }

  if (mode === "smart") {
    // Tune to the detected artwork type.
    if (kind === "animated") {
      // Preserve anything animations/ids might reference.
      o.cleanupIds = false;
      o.removeHiddenElems = false;
      o.removeUselessDefs = false;
    }
    if (kind === "icon" || kind === "logo") {
      // Icons/logos: keep titles for a11y, allow id cleanup.
      o.removeTitle = false;
      o.removeDesc = false;
    }
    // illustration / complex: leave preset defaults (best all-round).
    return o;
  }

  // max: strip everything that isn't load-bearing.
  o.removeTitle = true;
  o.removeDesc = { removeAny: true };
  return o;
}

/** Extra (non-preset) plugins to append per mode. */
function presetExtraPlugins(mode: OptimizeMode): Array<{ name: string }> {
  if (mode === "max") {
    return [
      { name: "removeDimensions" }, // rely on viewBox → fluid scaling
      { name: "removeScriptElement" },
      { name: "removeStyleElement" },
      { name: "reusePaths" },
      { name: "sortAttrs" },
    ];
  }
  return [];
}

/* ───────────────────────────── run optimize ──────────────────────────────── */

export interface OptimizeResult {
  ok: boolean;
  data: string;
  /** Which engine produced it. */
  engine: "svgo" | "fallback";
  error?: string;
}

/**
 * Optimize an SVG with the given engine options. Tries SVGO; on any failure
 * uses the dependency-free fallback so the tool never hard-fails. Pure w.r.t.
 * inputs, safe to call from a Web Worker.
 */
export async function runOptimize(svg: string, opts: EngineOptions): Promise<OptimizeResult> {
  const input = svg.trim();
  if (!input) return { ok: false, data: "", engine: "fallback", error: "Empty input." };
  if (!/<svg[\s>]/i.test(input)) {
    return { ok: false, data: "", engine: "fallback", error: "No <svg> element found." };
  }
  try {
    const svgo = await loadSvgo();
    if (svgo) {
      const { data } = svgo.optimize(input, buildConfig(opts));
      if (data && data.includes("<svg")) return { ok: true, data, engine: "svgo" };
    }
  } catch (err) {
    // fall through to fallback; keep the reason for debugging
    const message = err instanceof Error ? err.message : String(err);
    try {
      const data = fallbackOptimize(input, toFallbackOptions(opts));
      return { ok: true, data, engine: "fallback", error: message };
    } catch {
      return { ok: false, data: "", engine: "fallback", error: message };
    }
  }
  // SVGO unavailable → fallback.
  try {
    const data = fallbackOptimize(input, toFallbackOptions(opts));
    return { ok: true, data, engine: "fallback" };
  } catch (err) {
    return { ok: false, data: "", engine: "fallback", error: err instanceof Error ? err.message : String(err) };
  }
}

/** Map engine options onto the simpler fallback optimizer's knobs. */
function toFallbackOptions(opts: EngineOptions): OptimizeOptions {
  const removeTitle = opts.mode === "max" || (opts.mode === "custom" && opts.custom?.removeTitle === true);
  const removeIds = opts.mode === "max" || (opts.mode === "custom" && opts.custom?.cleanupIds === true);
  return {
    precision: opts.precision,
    multipass: opts.multipass,
    pretty: opts.pretty,
    keepViewBox: true,
    removeDimensions: opts.mode === "max",
    removeTitle,
    removeIds,
  };
}
