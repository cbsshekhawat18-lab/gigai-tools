import type { Tool } from "@/types";

/**
 * SVG Shape Generator: the geometric counterpart to the blob generator in the
 * "Generate" group. Where the blob makes organic, seeded silhouettes, this tool
 * makes crisp, mathematically-exact shapes: regular polygons, multi-point stars,
 * mechanical gears, hearts, sunbursts, hexagons and badges. Every shape is
 * parametric, sides/points, outer radius, inner radius, rotation and fill are
 * pure numbers, so the output is a single tidy <path> that scales forever and is
 * fully reproducible. Live big-canvas preview, copy the markup, download a
 * scalable SVG or export a transparent PNG. Copy targets the exact searches
 * people run when they want "a 5-point star SVG", "a gear icon", "a hexagon
 * shape" or "a heart shape" without launching a vector editor.
 */
const svgShapeGenerator: Tool = {
  slug: "svg-shape-generator",
  title: "SVG Shape Generator",
  description:
    "Generate crisp geometric SVG shapes (polygons, stars, gears, hearts, sunbursts, hexagons and badges) with controls for sides/points, radius, inner radius and rotation, plus solid or gradient fill. Copy the SVG or download SVG/PNG, 100% in your browser.",
  category: "svg-tools",
  group: "Generate",
  icon: "Hexagon",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-20",

  h1: "SVG Shape Generator, Polygons, Stars, Gears & Badges, Free",
  tagline:
    "Pick a shape, dial in the sides, radius and rotation, and watch an exact geometric path draw itself. Copy the SVG or export a transparent PNG. Every shape is pure math, resolution-independent, and generated entirely in your browser.",
  longDescription:
    "The GigAI SVG Shape Generator builds precise geometric vector shapes from a handful of numbers. Choose a type, a regular polygon, an n-point star, a mechanical gear, a heart, a radiating sunburst, a hexagon or a triangle: then set how many sides or points it has, how big its outer radius is, how deep the inner notches cut (for stars and gears), and how far it's rotated. Because the geometry is computed from trigonometry rather than hand-drawn, the result is a single, clean <path> inside a square viewBox: tiny in bytes, perfectly symmetrical, and sharp at any scale from a 16px favicon to a wall-sized banner. Fill it with a flat brand color or a two-stop diagonal gradient emitted as a real SVG <linearGradient>, preview it on a checkerboard, light or dark surface, and step backwards and forwards through every shape you've tried with full undo/redo. When you're happy, copy the markup straight into React, a CSS mask or Figma, download a scalable.svg, or rasterise a transparent.png at 2× for tools that won't take vectors. Everything runs locally: the geometry, the gradient and the PNG rasteriser all execute in your browser, so it works offline and never sees your colors or where the shape is going.",

  ctaText: "Generate a shape",

  keywords: [
    "svg shape generator",
    "polygon svg generator",
    "star svg generator",
    "svg star shape",
    "gear svg generator",
    "hexagon svg generator",
    "heart svg shape",
    "svg badge shape",
    "geometric shape maker",
    "regular polygon svg",
    "n-point star svg",
    "svg shape png",
  ],

  seo: {
    title:
      "SVG Shape Generator, Polygons, Stars, Gears, Hexagons (SVG + PNG) | GigAI Tools",
    description:
      "Free SVG shape generator. Create exact geometric shapes (polygons, stars, gears, hearts, sunbursts, hexagons) with controls for sides/points, radius, inner radius and rotation, plus solid or gradient fill. Copy the SVG or download SVG/PNG. 100% in your browser.",
  },

  features: [
    {
      icon: "Shapes",
      title: "Seven parametric shape types",
      description:
        "Polygon, star, gear, heart, sunburst, hexagon and triangle: each drawn from trigonometry, so every edge is exact and every shape is perfectly symmetrical.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Sides, radius, notch & rotation",
      description:
        "Dial the number of sides or points (3–60), the outer radius, the inner-radius depth for stars and gears, and the rotation angle. The path redraws the instant you drag.",
    },
    {
      icon: "Palette",
      title: "Solid or two-stop gradient",
      description:
        "Fill with a flat brand color or a diagonal two-stop gradient using native color pickers. The gradient ships as a real SVG <linearGradient>, not a baked-in raster.",
    },
    {
      icon: "FileCode",
      title: "Clean, scalable SVG output",
      description:
        "Output is one tidy <path> inside a square viewBox: resolution-independent, tiny, and ready to paste into React, a CSS mask, Figma or a plain <img>.",
    },
    {
      icon: "FileImage",
      title: "Transparent PNG export",
      description:
        "Rasterise the shape to a transparent PNG at 2× in one click for decks, Canva or email that won't take vectors, all on the browser canvas, nothing uploaded.",
    },
    {
      icon: "Undo2",
      title: "Undo, redo, presets & live preview",
      description:
        "A big preview on checkerboard, light or dark updates as you drag, with one-click shape presets and full undo/redo through every shape and color this session.",
    },
  ],

  benefits: [
    {
      title: "Exact shapes without a vector editor",
      description:
        "Get a mathematically perfect pentagon, six-point star or hex badge from a few sliders instead of fighting the pen tool in Illustrator, then paste the SVG straight into your build.",
    },
    {
      title: "One path, every format",
      description:
        "Copy the markup for code, download a crisp SVG that scales from favicon to billboard, or export a transparent PNG for tools that can't read vectors, all from the same shape.",
    },
    {
      title: "Reproducible by design",
      description:
        "The geometry is pure math with no randomness, so the same settings always regenerate the identical path. Note the numbers and any teammate rebuilds the exact shape.",
    },
    {
      title: "Private and offline",
      description:
        "The geometry, the gradient and the PNG rasteriser all run on your device. Your brand colors and where the shape is headed never leave the tab.",
    },
  ],

  howTo: [
    {
      title: "Choose a shape type",
      description:
        "Pick polygon, star, gear, heart, sunburst, hexagon or triangle. Start from a preset if you want a proven look to tweak.",
    },
    {
      title: "Dial in the geometry",
      description:
        "Set the sides or points, the outer radius, the inner-radius notch depth (for stars and gears) and the rotation. The preview redraws live.",
    },
    {
      title: "Pick a fill",
      description:
        "Choose a solid color or switch to gradient and set two stops. Preview it on checkerboard, light or dark to check it against your real background.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the SVG markup, download a scalable .svg, or export a transparent .png at 2×. Everything is generated locally in your browser.",
    },
  ],

  formats: {
    input: [],
    output: ["SVG", "PNG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Icons, bullets & badges",
      description:
        "Generate a hexagon badge, a star rating glyph or a gear settings icon as a clean inline <path>, drop it into a component, and recolor it in CSS. No icon-font dependency.",
    },
    {
      audience: "Product designer",
      title: "Section shapes & decoration",
      description:
        "Build the geometric accents (sunbursts behind a headline, polygon confetti, a heart for a like state) tuned to the brand palette and handed off as reproducible SVGs.",
    },
    {
      audience: "Content & social",
      title: "Deck and post graphics",
      description:
        "Export a transparent PNG star or badge for a slide, a story sticker or an email header where a vector isn't accepted, without opening a design app or buying stock shapes.",
    },
    {
      audience: "Indie hacker",
      title: "Logo marks & favicons",
      description:
        "Prototype a simple geometric logo mark from a rotated polygon or star, download the SVG, and shrink it to a crisp favicon, free and yours to keep iterating.",
    },
  ],

  troubleshooting: [
    {
      problem: "My star looks like a plain polygon with no points.",
      solution:
        "The inner radius is set too close to the outer radius, so the notches disappear. Lower the inner-radius slider to make the points sharper and more distinct.",
    },
    {
      problem: "The sides/points slider doesn't change my hexagon or triangle.",
      solution:
        "Hexagon and triangle are fixed at 6 and 3 sides by definition, so the sides control is ignored for them. Switch to the polygon type to get an arbitrary side count.",
    },
    {
      problem: "My gradient shows as a flat color in another app.",
      solution:
        "Some tools flatten or drop SVG <linearGradient> defs on paste. If the destination can't render gradients, export the PNG instead, it bakes the gradient into pixels, or keep the fill solid for maximum compatibility.",
    },
    {
      problem: "The PNG looks soft when I scale it up.",
      solution:
        "PNG is raster, so it only has the pixels you exported. Raise the size before exporting, or better, use the SVG: it's resolution-independent and stays crisp at any scale.",
    },
  ],

  tips: [
    "For a classic five-point star, use the star type with an inner radius around 40–50% of the outer.",
    "Rotate a polygon or star by half a step (e.g. 36° on a pentagon) to flip whether it points up or sits flat.",
    "Gears read best with 8–12 teeth and a shallow inner-radius notch. Too many teeth turns to noise at small sizes.",
    "Prefer the SVG over the PNG wherever the target accepts it, it's smaller, sharper at any size, and re-colorable in code.",
    "Found the perfect shape? Note the sides, radius and rotation, the same numbers always regenerate it exactly.",
  ],

  security:
    "Every shape is computed in your browser from pure geometry: the path, the gradient and the PNG rasterisation all run locally on your device. Nothing is uploaded, stored or logged, so your brand colors and where the shape is headed stay private. It works offline, and closing the tab leaves no trace.",

  faq: [
    {
      question: "What shapes can the SVG shape generator make?",
      answer:
        "Seven parametric types: a regular polygon with any number of sides, an n-point star, a mechanical gear, a heart, a radiating sunburst, a hexagon and a triangle. Each is drawn from trigonometry, so the edges are exact and the shape is perfectly symmetrical, and you control the sides or points, the outer radius, the inner-radius notch depth, the rotation and the fill.",
    },
    {
      question: "How do I make a 5-point star SVG?",
      answer:
        "Choose the star type and set the points to 5. Then adjust the inner radius to control how sharp the points are, around 40–50% of the outer radius gives the classic star look, while a higher inner radius makes it stubbier. Rotate it if you want it to point straight up. Copy the resulting <path> or download the SVG.",
    },
    {
      question: "Why doesn't the sides slider affect the hexagon or triangle?",
      answer:
        "A hexagon has six sides and a triangle has three by definition, so those types keep a fixed side count and ignore the sides control. If you want an arbitrary number of sides (a pentagon, heptagon, octagon and so on) pick the polygon type instead and set the sides to whatever you like.",
    },
    {
      question: "Can I download the shape as PNG as well as SVG?",
      answer:
        "Yes. Copy the SVG markup or download a scalable.svg for the web and code, or export a transparent.png at 2× for tools that don't accept vectors, decks, Canva, email headers. The PNG is rasterised locally on the browser canvas. Nothing is uploaded.",
    },
    {
      question: "Are the shapes reproducible?",
      answer:
        "Completely. Unlike the blob generator there's no randomness here. Every shape is pure math derived from the settings you choose. The same shape type, sides, radius, inner radius, rotation and fill always regenerate the identical path, so a shape you approve in review can be rebuilt byte-for-byte by anyone with the same numbers.",
    },
    {
      question: "Can I add a gradient fill?",
      answer:
        "Yes, switch the fill to gradient and pick two colors. The tool emits a real SVG <linearGradient> in the output, so it stays editable and resolution-independent. If a destination app flattens gradients on paste, export the PNG instead, which bakes the colors into pixels.",
    },
    {
      question: "Is anything uploaded to a server?",
      answer:
        "No. The geometry, the gradient and the PNG rasterisation are all computed in your browser. Nothing you generate is sent anywhere, stored or logged, so it's private by design and works offline: close the tab and there's nothing left behind.",
    },
    {
      question: "Is it free to use commercially?",
      answer:
        "Yes. The shapes you generate are plain geometry with no licence attached: use them freely in commercial products, client work and open-source projects. There's no watermark, sign-up or attribution requirement.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, parametric shape generator with polygon, star, gear, heart, sunburst, hexagon and triangle types, sides/radius/inner-radius/rotation controls, solid/gradient fill, live preview and SVG + PNG export.",
    },
    {
      date: "2026-06-26",
      change:
        "Added undo/redo across shapes and colors, keyboard shortcuts (copy, download, undo/redo, reset), and one-click shape presets to start from.",
    },
    {
      date: "2026-07-01",
      change:
        "Added checkerboard/light/dark preview surfaces and refined the rotation handling so polygons and stars snap cleanly to point-up.",
    },
  ],

  relatedTools: [
    "svg-blob-generator",
    "svg-pattern-generator",
    "svg-gradient-generator",
    "svg-optimizer",
    "svg-to-react",
    "image-compressor",
  ],
};

export default svgShapeGenerator;
