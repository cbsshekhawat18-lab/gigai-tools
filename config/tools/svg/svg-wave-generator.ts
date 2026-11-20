import type { Tool } from "@/types";

/**
 * SVG Wave Generator, the "Generate" tool for section dividers. It stacks
 * several deterministic wave paths (from the SVG engine's makeWave) into a
 * single layered divider: sliders for height, amplitude, wave count and layers,
 * per-layer colors or a two-stop gradient, and a flip toggle so the divider
 * sits at the top or bottom of a section. A seeded re-roll walks a reproducible
 * seed for endless silhouettes, and the whole thing renders live and exports as
 * a clean, full-bleed SVG (or PNG) computed entirely in the browser. Copy is
 * written for the exact queries developers type when they want "that curved SVG
 * shape divider between two colored sections" without hand-writing bezier paths.
 */
const svgWaveGenerator: Tool = {
  slug: "svg-wave-generator",
  title: "SVG Wave Generator",
  description:
    "Generate layered SVG wave dividers for section transitions: sliders for height, amplitude, wave count and layers, per-layer colors or a gradient, and a flip toggle, then copy the SVG or download SVG/PNG. 100% in your browser.",
  category: "svg-tools",
  group: "Generate",
  icon: "Waves",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-20",

  h1: "SVG Wave Generator: Layered Section Dividers, Free",
  tagline:
    "Drag a few sliders and watch a smooth, layered wave divider take shape between your sections. Stack layers, tune the amplitude, flip it top or bottom, drop in a gradient, and copy the SVG or export a PNG. Every wave is generated from a seed you can reproduce, entirely in your browser.",
  longDescription:
    "The GigAI SVG Wave Generator builds the curved SVG shape dividers that sit between two colored sections on almost every modern landing page, the soft crests that turn a hard rectangular seam into a designed transition. Instead of hand-writing bezier paths or pulling a one-off snippet from a paste bin, you drive it with sliders: height sets how tall the divider band is, amplitude controls how deep the crests dip, wave count sets how many crests span the width, and the layer stepper stacks two or three offset waves in tints of your color for the layered, parallax look. A flip toggle mirrors the whole divider so it reads correctly whether it caps the top or the bottom of a section, and a seeded re-roll advances a reproducible seed for a fresh silhouette on demand. Because every path is deterministic, the divider you approve in review regenerates byte-for-byte later, copy the markup, download a full-bleed SVG that stretches edge-to-edge with preserveAspectRatio, or rasterise a PNG for tools that won't take vectors. Fill each layer with a flat color or a two-stop gradient, preview it on a checkerboard, light or dark surface, and undo/redo back to an earlier shape. Nothing is uploaded, the geometry, the gradient and the PNG rasteriser all run locally, so it works offline and never sees your brand colors or where the divider is headed.",

  ctaText: "Generate a wave",

  keywords: [
    "svg wave generator",
    "wave generator",
    "svg section divider",
    "svg shape divider",
    "layered wave svg",
    "css wave divider",
    "svg wave background",
    "section transition svg",
    "wavy divider generator",
    "svg wave maker",
    "curved divider svg",
    "svg wave png",
  ],

  seo: {
    title: "SVG Wave Generator, Layered Section Dividers (SVG + PNG) | GigAI Tools",
    description:
      "Free SVG wave generator. Build layered section-divider waves with height, amplitude, wave-count and layer sliders, per-layer colors or a gradient, and a flip toggle, then copy the SVG or download SVG/PNG. 100% in your browser.",
  },

  features: [
    {
      icon: "Waves",
      title: "Layered, stackable waves",
      description:
        "Stack up to four offset wave paths in tints of your color for the parallax, layered look, or keep it to a single clean crest. The layer stepper redraws the whole divider instantly.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Height, amplitude & wave count",
      description:
        "Height sets the band depth, amplitude controls how far the crests dip, and wave count (1–12) sets how many crests span the full width, every change re-draws the smooth quadratic path live.",
    },
    {
      icon: "FlipVertical2",
      title: "Flip for top or bottom",
      description:
        "One toggle mirrors the divider vertically so it reads correctly whether it caps the bottom of a hero or the top of the next section. No manual transform maths.",
    },
    {
      icon: "Dices",
      title: "Seeded re-roll you can reproduce",
      description:
        "Re-roll walks a deterministic seed for a fresh crest pattern on demand. The same seed plus settings always regenerate the identical divider, so a shape you like is never a one-time accident.",
    },
    {
      icon: "Palette",
      title: "Solid tints or a gradient",
      description:
        "Fill with a flat brand color (layers auto-tinted) or a diagonal two-stop gradient using native color pickers. Gradients are emitted as real SVG <linearGradient> defs, not flattened rasters.",
    },
    {
      icon: "FileCode",
      title: "Full-bleed, scalable SVG",
      description:
        "Output is a clean, edge-to-edge SVG with a proper viewBox and preserveAspectRatio, ready to drop above or below any section, paste into React, or use as a CSS background.",
    },
  ],

  benefits: [
    {
      title: "Ship the section-divider look in seconds",
      description:
        "Skip the pen tool and the paste-bin snippets. Get the smooth curved divider that separates colored sections on modern landing pages with a few sliders: then paste the SVG straight into your build.",
    },
    {
      title: "Reproducible, not throwaway",
      description:
        "Every divider comes from a seed, so the shape you approved in design review regenerates byte-for-byte later. Share the settings and a teammate gets the exact same wave.",
    },
    {
      title: "One divider, every format",
      description:
        "Copy the markup for code, download a full-bleed SVG that stretches to any width, or export a PNG for tools that can't read vectors, all from the same wave.",
    },
    {
      title: "Private and offline",
      description:
        "The geometry, the gradient and the PNG rasteriser all run on your device. Your brand colors and where the divider is going never leave the tab.",
    },
  ],

  howTo: [
    {
      title: "Shape it with the sliders",
      description:
        "Set height for how tall the divider band is, amplitude for how deep the crests dip, and wave count for how many crests span the width. The preview redraws live.",
    },
    {
      title: "Stack layers and flip it",
      description:
        "Add one or two extra layers for the parallax look. They auto-tint from your color. Toggle flip so the divider reads correctly at the top or bottom of a section.",
    },
    {
      title: "Re-roll and pick a fill",
      description:
        "Hit Re-roll for a fresh crest pattern, then choose a solid color or a two-stop gradient. Preview it on checkerboard, light or dark to check it against your real background.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the SVG markup, download a full-bleed .svg, or export a .png. Everything is generated locally in your browser.",
    },
  ],

  formats: {
    input: [],
    output: ["SVG", "PNG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Section transitions in the layout",
      description:
        "Drop a full-bleed wave divider between a colored hero and the next white section so the seam reads as designed. Copy the SVG, set it to width:100%, and it stretches edge-to-edge at any breakpoint.",
    },
    {
      audience: "Product designer",
      title: "On-brand divider system",
      description:
        "Tune amplitude and layer tints to the brand palette, approve the shape in review, and hand off reproducible SVGs the engineers can drop in unchanged. No PNG round-trips or redlines.",
    },
    {
      audience: "Content & social",
      title: "Header and banner accents",
      description:
        "Export a PNG wave to cap an email header, a slide or a story where a vector isn't accepted, without opening a design app or paying for stock dividers.",
    },
    {
      audience: "Indie hacker",
      title: "Make a bare landing page feel built",
      description:
        "Add a couple of layered waves between sections to give a plain single-column page rhythm and polish: free, reproducible, and yours to tweak until it's right.",
    },
  ],

  troubleshooting: [
    {
      problem: "The wave doesn't stretch across my full section width.",
      solution:
        "The SVG is authored full-bleed with preserveAspectRatio set to stretch on the x-axis. Make sure the element has width:100% and display:block (SVGs are inline by default, which can leave a sliver of whitespace under them).",
    },
    {
      problem: "The divider is upside down relative to my section.",
      solution:
        "Use the Flip toggle to mirror it vertically. A divider that caps the bottom of a section needs the opposite orientation to one at the top: flip until the filled side sits against the section it belongs to.",
    },
    {
      problem: "My gradient shows as a flat color in another app.",
      solution:
        "Some tools flatten or drop SVG <linearGradient> defs on paste. If the destination can't render gradients, export the PNG instead, it bakes the gradient into pixels, or keep the fill solid for maximum compatibility.",
    },
    {
      problem: "I re-rolled past a wave I liked and can't get it back.",
      solution:
        "Use Undo (Ctrl/Cmd+Z) to step back through every shape this session, then Redo to move forward. Once you land on the one you want, copy or download it immediately to lock it in.",
    },
  ],

  tips: [
    "For a subtle, professional divider keep amplitude around 30–50% and wave count to 2–4: big amplitudes read as decorative rather than structural.",
    "Stack two or three layers in tints of one color for the layered/parallax look. A single layer is cleaner for a crisp brand seam.",
    "Prefer the SVG over the PNG wherever the target accepts it. It's smaller, stays razor-sharp at any width, and re-colorable in code.",
    "Set width:100% and display:block on the SVG so it spans the full section with no whitespace gap beneath it.",
    "Found the perfect divider? Note the settings, the same seed and sliders always regenerate it exactly.",
  ],

  security:
    "Every wave divider is generated in your browser from a deterministic seed, the geometry, the gradient and the PNG rasterisation all run locally on your device. Nothing is uploaded, stored or logged, so your brand colors and where the divider is headed stay private. It works offline, and closing the tab leaves no trace.",

  faq: [
    {
      question: "What is an SVG wave divider and why use one?",
      answer:
        "A wave divider is a curved SVG shape placed between two page sections so the seam is a soft, designed transition instead of a hard rectangular line. As an SVG it's a single scalable path: tiny in bytes, crisp at any width, and re-colorable in code, which makes it ideal for section transitions, hero footers and banner accents.",
    },
    {
      question: "How do I make the wave span my full section width?",
      answer:
        "The generated SVG is authored full-bleed with a viewBox and preserveAspectRatio that stretches horizontally, so it fills any container. Set width:100% and display:block on the element. SVGs are inline by default, which can otherwise leave a small whitespace gap beneath the divider.",
    },
    {
      question: "What do the amplitude and wave-count sliders do?",
      answer:
        "Amplitude controls how deep the crests dip relative to the band height. Low is a gentle ripple, high is a dramatic swell. Wave count sets how many crests span the full width (1–12), so a low count gives long, lazy curves and a high count gives a tighter, busier ripple. Height sets the overall depth of the divider band.",
    },
    {
      question: "Can I stack multiple layers?",
      answer:
        "Yes. The layer stepper stacks up to four offset wave paths, each auto-tinted from your base color, for the layered parallax look you see on many SaaS pages. Keep it to a single layer for a clean, crisp brand seam, or add layers for depth.",
    },
    {
      question: "How do I flip the wave for the top vs bottom of a section?",
      answer:
        "Use the Flip toggle, which mirrors the divider vertically via an SVG transform. A wave that caps the bottom of a hero needs the opposite orientation to one at the top of the next section, so flip until the filled side sits against the section it belongs to.",
    },
    {
      question: "Can I download the wave as PNG as well as SVG?",
      answer:
        "Yes. Copy the SVG markup or download a full-bleed.svg for the web and code, or export a.png for tools that don't accept vectors: decks, Canva, email headers. The PNG is rasterised locally on the browser canvas. Nothing is uploaded.",
    },
    {
      question: "Are the waves random, and can I reproduce one?",
      answer:
        "They're generated from a seed, so they're reproducible rather than truly random. Re-roll advances the seed for a fresh crest pattern, but the same seed plus the same slider settings always regenerate the identical divider, so an approved shape can be recreated byte-for-byte and shared as settings.",
    },
    {
      question: "Is anything uploaded to a server?",
      answer:
        "No. The wave geometry, the gradient and the PNG rasterisation are all computed in your browser. Nothing you generate is sent anywhere, stored or logged, so it's private by design and works offline: close the tab and there's nothing left behind.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release: seeded wave-divider generator with height, amplitude, wave-count and layer controls, solid/gradient fill, flip toggle, live preview, re-roll, and SVG + PNG export.",
    },
    {
      date: "2026-06-25",
      change:
        "Added undo/redo across shapes and colors, keyboard shortcuts (re-roll, copy, download, undo/redo), and one-click preset dividers to start from.",
    },
    {
      date: "2026-06-30",
      change:
        "Added multi-layer stacking with auto-tinted layers and checkerboard/light/dark preview surfaces to check dividers against real section backgrounds.",
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

export default svgWaveGenerator;
