/**
 * Ambient declarations for the heavy, browser-only SVG libraries that ship no
 * TypeScript types. Only the surface the SVG engine touches is declared; both
 * are lazy-imported (never at module scope) so they stay out of the initial
 * bundle. See lib/svg-tools/optimize.ts and lib/svg-tools/raster.ts.
 */

declare module "svgo/dist/svgo.browser.js" {
  /** SVGO's optimize entry point (browser build). */
  export function optimize(svg: string, config?: Record<string, unknown>): { data: string };
}

declare module "imagetracerjs" {
  interface ImageDataLike {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }
  /** Trace an ImageData object to an SVG string. */
  export function imagedataToSVG(imageData: ImageDataLike, options?: Record<string, number | boolean | string>): string;
  const _default: { imagedataToSVG: typeof imagedataToSVG };
  export default _default;
}
