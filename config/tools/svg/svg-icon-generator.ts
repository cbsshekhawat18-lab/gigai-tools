import type { Tool } from "@/types";

/**
 * SVG Icon Generator: the "Generate" tool that turns a messy pile of SVGs into
 * one consistent icon set (uniform viewBox, size, stroke and currentColor) and
 * can also build simple geometric icons from presets. Two modes:
 *
 *  • Normalize; paste or drop several SVGs and force them all onto the same
 *    viewBox and export size, retint fixed colors to `currentColor` so they
 *    inherit from CSS, unify stroke width, and preview the whole batch as a
 *    tidy grid. Export a single `<symbol>` sprite or grab each cleaned icon.
 *  • Build: pick a shape (star, hexagon, gear, heart…) and dial sides,
 *    rotation and fill to mint a brand-new icon from scratch.
 *
 * Everything is deterministic and runs in the browser: no upload, no account,
 * no icon-font build step. Copy is written for the exact things people search
 * when their icon set "looks inconsistent" and they want everything on a common
 * grid that recolors from a single CSS `color`.
 */
const svgIconGenerator: Tool = {
  slug: "svg-icon-generator",
  title: "SVG Icon Generator",
  description:
    "Normalize a batch of SVGs into one consistent icon set (uniform viewBox, size, stroke and currentColor) then export a sprite or each cleaned icon. Or build simple icons from shape presets. 100% in your browser.",
  category: "svg-tools",
  group: "Generate",
  icon: "Sparkle",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-22",

  h1: "SVG Icon Generator, Build & Normalize a Consistent Icon Set",
  tagline:
    "Drop in a pile of mismatched SVGs and pull out one clean, consistent icon set: same viewBox, same size, one currentColor that recolors from CSS. Or build a fresh icon from a shape preset. Everything runs in your browser, nothing is uploaded.",
  longDescription:
    "The GigAI SVG Icon Generator fixes the single most annoying thing about hand-collected icons: they never match. One is 20×20, the next is 512×512, one is hard-coded #333, another is a blue stroke, and a third refuses to recolor from CSS. Paste or drop your SVGs and the tool forces the whole batch onto one shared viewBox and export size, rewrites fixed fills and strokes to `currentColor` so every icon inherits its color from a single CSS `color` property, and unifies stroke width across the set: then shows you the entire collection on a live grid so you can eyeball consistency at a glance. When you like what you see, export a single `<symbol>` sprite you reference with `<use href=\"#id\">`, or download the cleaned SVGs to drop straight into your components. Need a shape that doesn't exist yet? Switch to Build mode and mint a fresh icon from a geometric preset (star, hexagon, gear, heart, burst, triangle or polygon) with controls for sides, rotation, radius and a solid or gradient fill. Because the normaliser and the shape geometry are pure and deterministic, the same input and settings always produce the same output, so a set you approve regenerates byte-for-byte later. Nothing is uploaded, parsing, retinting, the grid preview and the sprite are all computed locally, so it works offline and never sees your brand marks.",

  ctaText: "Build my icon set",

  keywords: [
    "svg icon generator",
    "icon set generator",
    "normalize svg icons",
    "consistent icon set",
    "svg currentcolor converter",
    "unify svg viewbox",
    "svg icon maker",
    "make svg icons match",
    "icon normalizer",
    "generate svg icons",
  ],

  seo: {
    title:
      "SVG Icon Generator, Normalize & Build a Consistent Icon Set | GigAI Tools",
    description:
      "Free SVG icon generator. Normalize a batch of SVGs to one viewBox, size, stroke and currentColor, preview them as a grid, and export a <symbol> sprite, or build icons from shape presets. 100% in your browser.",
  },

  features: [
    {
      icon: "Ruler",
      title: "One viewBox & size for the whole set",
      description:
        "Force every icon onto a single shared viewBox and export size (16, 20, 24, 32, 48…) so a set collected from a dozen sources finally lines up on the same grid.",
    },
    {
      icon: "PaintBucket",
      title: "Retint to currentColor",
      description:
        "Rewrite hard-coded fills and strokes to `currentColor` so each icon inherits its color from CSS, one `color` property recolors the entire set, including hover and dark mode.",
    },
    {
      icon: "LayoutGrid",
      title: "Live grid preview of the batch",
      description:
        "See every icon at once on a checkerboard, light or dark grid. Spot the one that's off-size, mis-colored or clipped before you ship, not after.",
    },
    {
      icon: "Package",
      title: "Export a <symbol> sprite",
      description:
        "Combine the cleaned icons into a single SVG sprite of `<symbol>`s with a copy-paste `<use href=\"#id\">` snippet: one request, cached, referenced anywhere on the page.",
    },
    {
      icon: "Shapes",
      title: "Build icons from shape presets",
      description:
        "No source SVG? Mint one from a geometric preset (star, hexagon, gear, heart, burst, triangle, polygon) with sides, rotation, radius and solid or gradient fill.",
    },
    {
      icon: "Sparkle",
      title: "Deterministic, copy, download, export",
      description:
        "Same input, same output, always. Copy the markup, download the sprite or SVG, or rasterise a transparent PNG, all generated locally with undo/redo and shortcuts.",
    },
  ],

  benefits: [
    {
      title: "A set that actually looks like a set",
      description:
        "Stop shipping icons that are three sizes and four colors. One click puts every mark on the same grid and the same currentColor, so your UI reads as intentional instead of scavenged.",
    },
    {
      title: "Recolor everything from one CSS property",
      description:
        "Once fills are currentColor, a single `color` on a parent restyles the whole set (active states, hover, dark mode) with zero per-icon edits and no icon font to rebuild.",
    },
    {
      title: "One sprite instead of many requests",
      description:
        "Ship a single `<symbol>` sprite and reference each glyph with `<use>`. Fewer network round-trips, browser-cached, and every icon stays crisp, scalable SVG.",
    },
    {
      title: "Private, offline, reproducible",
      description:
        "Parsing, retinting and the sprite are computed in your browser from deterministic rules. Nothing is uploaded, and the same set regenerates identically whenever you need it.",
    },
  ],

  howTo: [
    {
      title: "Choose Normalize or Build",
      description:
        "Normalize takes a batch of existing SVGs and makes them consistent. Build mints a new icon from a shape preset. Switch modes anytime with the toggle.",
    },
    {
      title: "Add your icons (Normalize)",
      description:
        "Paste one or more SVGs, separated by blank lines, or drop.svg files. Each becomes an entry in the set. The grid preview updates live.",
    },
    {
      title: "Set the shared grid",
      description:
        "Pick the export size and viewBox, toggle currentColor retinting, and unify stroke width. Every icon in the batch snaps to the same settings.",
    },
    {
      title: "Preview & pick a format",
      description:
        "Check the grid on light/dark/checkerboard. When it looks right, export a <symbol> sprite, copy the markup, or download the cleaned SVG / PNG.",
    },
    {
      title: "Or build from a preset",
      description:
        "In Build mode pick a shape, dial sides, rotation and fill, and download the fresh icon, already on the same clean grid as the rest of your set.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG", "PNG"],
  },

  useCases: [
    {
      audience: "Design systems engineer",
      title: "Unify a scavenged icon set",
      description:
        "Icons pulled from Figma, a UI kit and three npm packages never match. Normalize them all to a 24×24 viewBox and currentColor so the whole library recolors from one token.",
    },
    {
      audience: "Frontend developer",
      title: "Ship a single SVG sprite",
      description:
        "Bundle your cleaned icons into one `<symbol>` sprite and reference them with `<use>`, fewer requests, cache-friendly, and no icon-font pipeline to maintain.",
    },
    {
      audience: "Product designer",
      title: "Sanity-check consistency",
      description:
        "Drop the whole set onto the grid preview to catch the icon that's the wrong weight, off-size or a stray hex before it reaches a component and a review.",
    },
    {
      audience: "Indie hacker",
      title: "Mint a quick brand glyph",
      description:
        "Need a star, gear or hexagon mark right now? Build one from a preset with a gradient fill and download the SVG. No vector editor, no stock licence.",
    },
  ],

  troubleshooting: [
    {
      problem: "One icon didn't switch to currentColor.",
      solution:
        "Colors set inside a <style> block, on a gradient stop, or via a CSS class aren't rewritten, the retint targets inline fill/stroke attributes. Move the color to a fill/stroke attribute, or leave that icon's color intentional and recolor it in CSS.",
    },
    {
      problem: "An icon looks clipped or off-centre in the grid.",
      solution:
        "Its original artwork extends past the viewBox you chose, or it had no viewBox to begin with. Give the source SVG a correct viewBox that tightly bounds its paths, then re-normalize, the tool re-fits it to the shared grid.",
    },
    {
      problem: "My stroked icon got heavier or lighter than the rest.",
      solution:
        "Unifying stroke width sets every icon to the same value, which changes any that were drawn at a different weight. Turn stroke unification off to keep each icon's original weight, or pick a width that matches most of the set.",
    },
    {
      problem: "The sprite icons don't show when I use <use>.",
      solution:
        "The sprite `<svg>` is display:none by design, inline it once in your page (or reference it by URL) and each `<use href=\"#id\">` pulls its symbol. Make sure the id in href matches the symbol id and that the sprite is present in the DOM.",
    },
  ],

  tips: [
    "Pick your viewBox first: 24×24 is the safest default for UI icons. Match whatever your existing components already assume.",
    "Leave retinting on for line/glyph icons, but turn it off for multi-color logos you don't want flattened to one color.",
    "Separate multiple pasted SVGs with a blank line so each is read as its own entry in the set.",
    "Prefer the sprite for many icons on one page and standalone SVGs when you import icons individually into components.",
    "In Build mode, a 6-point star at ~40% inner radius reads as a classic 'spark'. A hexagon with rotation 0 makes a clean badge base.",
  ],

  security:
    "Every icon is parsed, retinted and laid out in your browser, the normaliser, the grid preview, the sprite builder and the shape geometry all run locally on your device. Nothing is uploaded, stored or logged, so your brand marks and unreleased icons stay private. It works offline, and closing the tab leaves no trace.",

  faq: [
    {
      question: "What does 'normalize' actually change in my SVGs?",
      answer:
        "It forces every icon onto one shared viewBox and export size, rewrites inline fill and stroke colors to `currentColor` so they inherit from CSS, and optionally unifies stroke width across the batch. The paths themselves aren't redrawn, the tool changes the wrapper and color attributes so a set collected from many sources lines up on the same grid and recolors from a single CSS property.",
    },
    {
      question: "Why convert colors to currentColor?",
      answer:
        "`currentColor` makes an SVG inherit its color from the CSS `color` of its container. Once your icons use it, a single `color` value restyles the whole set (hover states, active nav items, dark mode) with no per-icon edits. It's the standard way modern icon libraries stay themeable without an icon font.",
    },
    {
      question: "Can I turn several SVGs into one sprite?",
      answer:
        "Yes. In Normalize mode, add multiple SVGs and export a `<symbol>` sprite: one SVG containing a `<symbol>` per icon, plus a copy-paste `<use href=\"#id\">` snippet. Inline the sprite once in your page and reference any glyph by id: one cached request instead of many, and every icon stays scalable SVG.",
    },
    {
      question: "How do I add multiple icons at once?",
      answer:
        "Paste your SVGs into the source pane separated by a blank line, or drop several .svg files. Each `<svg>…</svg>` block becomes its own entry in the set and appears in the grid preview, so you can normalize a whole batch in one pass rather than one icon at a time.",
    },
    {
      question: "Can I build an icon from scratch here?",
      answer:
        "Yes: switch to Build mode and pick a geometric preset (star, hexagon, gear, heart, burst, triangle or polygon). Controls for sides, rotation, radius and a solid or gradient fill let you shape it, and the result comes out on the same clean viewBox as your normalized set, ready to download as SVG or PNG.",
    },
    {
      question: "Will this work for multi-color logos?",
      answer:
        "It can, but retinting to currentColor flattens every color to one, which you usually don't want for a multi-color mark. Turn retinting off to preserve the original colors, and still use the tool to unify the viewBox and export size. For single-color line and glyph icons, retinting is exactly what you want.",
    },
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. Parsing, color rewriting, the grid preview, the sprite builder and the shape geometry all run in your browser. Nothing you paste or drop is sent anywhere, stored or logged, so it's private by design and works offline, close the tab and there's nothing left behind.",
    },
    {
      question: "Is it free for commercial use?",
      answer:
        "Yes. The normalized icons and the shapes you build are plain SVG with no licence attached from us. Use them freely in commercial products, client work and open source. There's no watermark, sign-up or attribution requirement. (Your source icons keep whatever licence they already had.)",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release: batch SVG normaliser (shared viewBox, export size, currentColor retint, stroke unification) with a live grid preview and standalone/sprite export.",
    },
    {
      date: "2026-06-27",
      change:
        "Added Build mode: mint icons from geometric shape presets (star, hexagon, gear, heart, burst, triangle, polygon) with sides, rotation, radius and gradient fill.",
    },
    {
      date: "2026-07-01",
      change:
        "Added <symbol> sprite export with a copy-paste <use> snippet, undo/redo across settings, keyboard shortcuts, and checkerboard/light/dark grid surfaces.",
    },
  ],

  relatedTools: [
    "svg-optimizer",
    "svg-to-react",
    "svg-blob-generator",
    "svg-viewer",
    "image-compressor",
  ],
};

export default svgIconGenerator;
