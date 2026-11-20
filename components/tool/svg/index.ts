/**
 * SVG-specific shared UI. Built on the dev-tools harness (CodePane, Toolbar,
 * CopyButton, download, options, StatBadge, FileDropZone), these components add
 * the SVG-aware pieces: a sanitised live preview, a code↔preview workspace shell,
 * a path point-cloud visualiser, and a generator canvas with in-browser PNG
 * export. Compose them to build optimize/convert/format/generate tools quickly.
 */

export {
  SvgPreview,
  sanitizeSvg,
  readSvgDimensions,
  type SvgPreviewProps,
  type SvgDimensions,
  type PreviewBackground,
  type PreviewZoom,
} from "./svg-preview";
export {
  SvgWorkspace,
  type SvgWorkspaceProps,
} from "./svg-workspace";
export {
  SvgCompare,
  type SvgCompareProps,
  type CompareBackground,
} from "./svg-compare";
export {
  SvgIconPreview,
  type SvgIconPreviewProps,
} from "./svg-icon-preview";
export {
  PathVisualizer,
  parsePath,
  type PathVisualizerProps,
  type ParsedPath,
  type PathPoint,
} from "./path-visualizer";
export {
  GeneratorCanvas,
  svgToPng,
  type GeneratorCanvasProps,
} from "./generator-canvas";
