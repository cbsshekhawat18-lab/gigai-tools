import type { Tool } from "@/types";

// ── View & Edit ──────────────────────────────────────────────────────────────
import svgViewer from "./svg-viewer";
import svgEditor from "./svg-editor";

// ── Optimize ─────────────────────────────────────────────────────────────────
import svgOptimizer from "./svg-optimizer";
import svgMinifier from "./svg-minifier";
import svgPrettifier from "./svg-prettifier";
import svgCompressor from "./svg-compressor";
import svgSizeOptimizer from "./svg-size-optimizer";
import svgCodeFormatter from "./svg-code-formatter";
import svgValidator from "./svg-validator";

// ── Convert ──────────────────────────────────────────────────────────────────
import svgToReact from "./svg-to-react";
import svgToVue from "./svg-to-vue";
import svgToHtml from "./svg-to-html";
import svgToCss from "./svg-to-css";
import svgToDataUri from "./svg-to-data-uri";
import dataUriToSvg from "./data-uri-to-svg";
import svgToPng from "./svg-to-png";
import pngToSvg from "./png-to-svg";

// ── Edit (color & path) ─────────────────────────────────────────────────────
import svgColorEditor from "./svg-color-editor";
import svgPathEditor from "./svg-path-editor";
import svgPathVisualizer from "./svg-path-visualizer";

// ── Generate ─────────────────────────────────────────────────────────────────
import svgSpriteGenerator from "./svg-sprite-generator";
import svgIconGenerator from "./svg-icon-generator";
import svgAnimationGenerator from "./svg-animation-generator";
import svgGradientGenerator from "./svg-gradient-generator";
import svgBackgroundGenerator from "./svg-background-generator";
import svgPatternGenerator from "./svg-pattern-generator";
import svgWaveGenerator from "./svg-wave-generator";
import svgBlobGenerator from "./svg-blob-generator";
import svgShapeGenerator from "./svg-shape-generator";
import svgPlaceholderGenerator from "./svg-placeholder-generator";

/**
 * SVG Tools registry.
 *
 * The single source of truth for the SVG suite. Add a tool by dropping a file
 * under `config/tools/svg/<slug>.ts` (each exporting a `Tool` default),
 * importing it here, and listing it below in internal-linking order. Everything
 * else (routes, metadata, JSON-LD, cards, the /svg-tools landing, search,
 * sitemap, and the generated branded illustration) is derived automatically, a
 * SVG tool lives in the `svg-tools` category and its `group` seeds
 * `lib/svg-tools/illustrations`.
 *
 * Set each tool's `group` to a sub-category label: one of:
 *   "Optimize" | "Convert" | "Generate" | "Edit" | "View"
 * so the category landing can render the grouped "All SVG categories" view and
 * the illustration system picks a coherent per-group motif/glyph. The flagship
 * slugs the /svg-tools landing spotlights are:
 *   svg-optimizer, svg-to-react, svg-blob-generator, svg-viewer,
 *   svg-to-data-uri, svg-minifier
 *
 * All 30 SVG tools, in internal-linking order; the master TOOLS registry routes
 * everything the moment a tool is added.
 */
export const SVG_TOOLS: Tool[] = [
  svgViewer,
  svgEditor,
  svgOptimizer,
  svgMinifier,
  svgPrettifier,
  svgCompressor,
  svgSizeOptimizer,
  svgCodeFormatter,
  svgValidator,
  svgToReact,
  svgToVue,
  svgToHtml,
  svgToCss,
  svgToDataUri,
  dataUriToSvg,
  svgToPng,
  pngToSvg,
  svgColorEditor,
  svgPathEditor,
  svgPathVisualizer,
  svgSpriteGenerator,
  svgIconGenerator,
  svgAnimationGenerator,
  svgGradientGenerator,
  svgBackgroundGenerator,
  svgPatternGenerator,
  svgWaveGenerator,
  svgBlobGenerator,
  svgShapeGenerator,
  svgPlaceholderGenerator,
];
