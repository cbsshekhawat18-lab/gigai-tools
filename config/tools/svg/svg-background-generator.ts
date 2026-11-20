import type { Tool } from "@/types";

/**
 * SVG Background Generator: a "Generate" tool that composes full-bleed hero and
 * section backgrounds as clean, resolution-independent SVG. Pick a style
 * (mesh gradient, dots, grid, waves or blobs), choose the aspect ratio, drive
 * two brand colors plus accent, opacity and density, and re-roll a
 * reproducible seed for a fresh layout. Output is a single tidy SVG plus a
 * ready-to-paste CSS `background` snippet (data-URI), with SVG / CSS copy and
 * SVG + PNG download: all computed in the browser, deterministic, no server.
 * Copy targets the exact phrases people search when they want "an SVG hero
 * background" without opening a design app.
 */
const svgBackgroundGenerator: Tool = {
  slug: "svg-background-generator",
  title: "SVG Background Generator",
  description:
    "Generate full-bleed hero and section backgrounds as clean SVG: mesh gradient, dots, grid, waves or blob styles with your brand colors, opacity and density, plus a reproducible re-roll. Copy the SVG or CSS, download SVG/PNG. 100% in your browser.",
  category: "svg-tools",
  group: "Generate",
  icon: "Wallpaper",
  accent: "indigo",
  status: "live",
  createdAt: "2026-06-20",

  h1: "SVG Background Generator: Hero & Section Backgrounds, Free",
  tagline:
    "Choose a style, set the aspect ratio, drop in your brand colors, and get a full-bleed background as clean, scalable SVG. Re-roll for a fresh layout, then copy the SVG or a ready-to-paste CSS snippet: every layout comes from a seed you can reproduce, entirely in your browser.",
  longDescription:
    "The GigAI SVG Background Generator turns a handful of controls into the full-bleed backgrounds behind modern landing pages, app shells and section dividers: as SVG, so they stay razor-sharp at any viewport and weigh a fraction of a hero image. Pick a style: a soft mesh gradient with blurred color orbs, a subtle dot or grid texture, layered waves, or a scattered blob field. Set the aspect ratio to match where it's going (a wide 16:9 hero, a square social card, a tall mobile splash) then drive two brand colors plus an accent, and tune opacity and density until the texture sits behind your copy instead of fighting it. A seeded layout means the background you approve is never a throwaway: the same seed and settings regenerate the identical SVG byte-for-byte, so you can re-roll freely and always get back to the one you liked. When it's right, copy the SVG markup, copy a ready-to-paste CSS `background-image` snippet (an optimized data-URI you can drop straight into a stylesheet), download a scalable.svg, or export a PNG for tools that can't read vectors. Everything (the geometry, the gradients, the data-URI encoding and the PNG rasterisation) runs locally in your browser, so it works offline and your brand colors never leave the tab.",

  ctaText: "Generate a background",

  keywords: [
    "svg background generator",
    "svg hero background",
    "background generator",
    "css background generator",
    "mesh gradient generator",
    "svg pattern background",
    "waves background svg",
    "dots background svg",
    "grid background svg",
    "section background generator",
    "svg background css",
    "hero background maker",
  ],

  seo: {
    title:
      "SVG Background Generator: Hero & Section Backgrounds (SVG + CSS) | GigAI Tools",
    description:
      "Free SVG background generator. Create full-bleed hero and section backgrounds (mesh gradient, dots, grid, waves or blobs) with your brand colors, opacity and density and a reproducible re-roll, then copy the SVG or CSS and download SVG/PNG. 100% in your browser.",
  },

  features: [
    {
      icon: "LayoutGrid",
      title: "Five background styles",
      description:
        "Switch between a soft mesh gradient, a dot or grid texture, layered waves and a scattered blob field, each redraws instantly against your colors so you can audition the whole set in seconds.",
    },
    {
      icon: "Ratio",
      title: "Aspect ratios that match the slot",
      description:
        "Generate a wide 16:9 hero, a 4:3 or 1:1 card, or a tall 9:16 mobile splash. The viewBox is set to the exact ratio so the background fills its container with no letterboxing.",
    },
    {
      icon: "Palette",
      title: "Two brand colors plus accent",
      description:
        "Native color pickers drive the base gradient and an accent used for orbs, lines and shapes. Everything is emitted as real SVG gradients and fills, not a flattened raster.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Opacity & density that behave",
      description:
        "Dial texture opacity so a grid or dot field sits quietly behind your copy, and set density for how busy the pattern or blob field gets, from a whisper of texture to a bold statement.",
    },
    {
      icon: "Code2",
      title: "Copy SVG or ready-to-paste CSS",
      description:
        "Copy the clean SVG markup for inline use, or copy a CSS background-image snippet. An optimized data-URI you can drop straight into a stylesheet, no external file to host.",
    },
    {
      icon: "Dices",
      title: "Reproducible seeded re-roll",
      description:
        "Re-roll walks a deterministic seed for a fresh layout on demand. The same seed plus settings always regenerate the identical background, so a layout you like is never a one-time accident.",
    },
  ],

  benefits: [
    {
      title: "Ship a hero background in seconds",
      description:
        "Skip the design app and the stock-photo licence. Get a full-bleed, on-brand background (mesh, pattern or waves) and paste the SVG or CSS straight into your build.",
    },
    {
      title: "Lighter and sharper than an image",
      description:
        "An SVG background is a few kilobytes of markup that stays crisp on every display and at every viewport width, instead of a heavy raster hero that blurs on retina or when scaled.",
    },
    {
      title: "Reproducible, not throwaway",
      description:
        "Because every layout comes from a seed, the background you approved in review regenerates byte-for-byte later. Share the settings and a teammate gets the exact same graphic.",
    },
    {
      title: "Private and offline",
      description:
        "The geometry, gradients, CSS data-URI and PNG export all run on your device. Your brand colors and where the background is going never leave the tab.",
    },
  ],

  howTo: [
    {
      title: "Pick a style and ratio",
      description:
        "Choose mesh, dots, grid, waves or blobs, then set the aspect ratio to match the slot: wide hero, square card or tall mobile splash. The preview redraws live.",
    },
    {
      title: "Set your colors",
      description:
        "Drive the two-stop base gradient and an accent color used for orbs, lines and shapes. Preview on checkerboard, light or dark to check it against your real background.",
    },
    {
      title: "Tune opacity & density",
      description:
        "Lower the texture opacity so it sits behind your copy, and set density for how busy the pattern or blob field looks. Re-roll for a fresh layout if you want a different arrangement.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the SVG markup, copy the CSS background-image snippet, download a scalable.svg, or export a.png. Everything is generated locally in your browser.",
    },
  ],

  formats: {
    input: [],
    output: ["SVG", "CSS", "PNG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Full-bleed hero section",
      description:
        "Generate a mesh-gradient or wave hero background, copy the CSS data-URI snippet, and drop it onto your hero section. No image asset to host, and it stays sharp on every display.",
    },
    {
      audience: "Product designer",
      title: "On-brand section dividers",
      description:
        "Produce a subtle dot or grid texture in the brand palette to break up long landing pages, tune the opacity so it reads as quiet texture, and hand off reproducible SVGs the engineers paste in unchanged.",
    },
    {
      audience: "Content & social",
      title: "Card & story backgrounds",
      description:
        "Set a square or 9:16 ratio, generate a colorful blob or mesh background, and export a PNG for a social card, story or slide where a vector isn't accepted. No design app required.",
    },
    {
      audience: "Indie hacker",
      title: "Launch-page polish",
      description:
        "Give a bare landing page a designed feel with a soft mesh or wave background behind your copy: free, reproducible, re-colorable and yours to tweak until it's right.",
    },
  ],

  troubleshooting: [
    {
      problem: "The CSS data-URI snippet is huge or won't paste cleanly.",
      solution:
        "Dense blob and wave layouts produce more markup, which makes the data-URI longer. Lower the density, or download the.svg and reference it as a file instead of inlining it: a file keeps your stylesheet small.",
    },
    {
      problem: "The background overpowers my text.",
      solution:
        "Drop the texture opacity so the pattern or gradient sits behind your copy, pick lower-contrast colors, or reduce density. For heavy hero images, add a semi-transparent overlay in your own CSS on top of the SVG.",
    },
    {
      problem: "The PNG looks soft when I scale it up.",
      solution:
        "PNG is raster and only has the pixels you exported. Prefer the SVG wherever the target accepts it, it's resolution-independent, or increase the aspect-ratio dimensions before exporting the PNG.",
    },
    {
      problem: "I re-rolled past a layout I liked and can't get it back.",
      solution:
        "Use Undo (Ctrl/Cmd+Z) to step back through every layout this session, then Redo to move forward. Once you land on the one you want, copy or download it immediately to lock it in.",
    },
  ],

  tips: [
    "For a hero, keep the mesh style with texture opacity high and density low. It reads as a rich gradient rather than a busy pattern.",
    "Subtle dot and grid textures work best around 8–15% opacity so they sit behind content instead of competing with it.",
    "Prefer the CSS data-URI snippet for a single background. Download the .svg as a file when the same background is reused across many pages.",
    "Match the aspect ratio to the real slot before exporting a PNG so it isn't stretched or cropped in place.",
    "Found the perfect layout? Note the seed and settings. They always regenerate the exact same background.",
  ],

  security:
    "Every background is generated in your browser from a deterministic seed, the geometry, gradients, CSS data-URI encoding and PNG rasterisation all run locally on your device. Nothing is uploaded, stored or logged, so your brand colors and where the background is headed stay private. It works offline, and closing the tab leaves no trace.",

  faq: [
    {
      question: "What is an SVG background and why use one over an image?",
      answer:
        "An SVG background is a full-bleed graphic described as vector markup rather than pixels: a gradient, pattern or set of shapes. Compared with a raster hero image it's a fraction of the size, stays perfectly sharp on every display and at every viewport width, and can be re-colored in code. That makes it ideal for hero sections, section dividers and app shells where you want polish without a heavy download.",
    },
    {
      question: "How do I use the generated background in CSS?",
      answer:
        "Copy the CSS snippet: it's a background-image with an optimized data-URI, so you can paste it straight into a rule (for example on your hero section) with no external file to host. Add background-size: cover and your own positioning. If you'd rather keep the stylesheet small, download the .svg and reference it as a file with url('/bg.svg') instead.",
    },
    {
      question: "What do the styles (mesh, dots, grid, waves, blobs) look like?",
      answer:
        "Mesh is a soft two-color gradient with blurred accent orbs, the classic modern-SaaS look. Dots and grid are subtle repeating textures for quiet section backgrounds. Waves are layered curved bands, great as a hero base or a section transition. Blobs scatter soft organic shapes across the canvas. Switch between them freely, each redraws instantly against your colors.",
    },
    {
      question: "Can I match the background to my hero's exact size?",
      answer:
        "Choose an aspect ratio (16:9 for a wide hero, 1:1 for a card, 9:16 for a mobile splash, and more) and the SVG's viewBox is set to that ratio. Because it's a vector it then scales to fill whatever container you drop it into (with background-size: cover) without letterboxing or blur, so you don't need pixel-perfect dimensions.",
    },
    {
      question: "Are the layouts random, and can I reproduce one?",
      answer:
        "They're generated from a seed, so they're reproducible rather than truly random. Re-roll advances the seed for a fresh arrangement, but the same seed plus the same settings always regenerate the identical background. That means a layout you approve in design review can be recreated byte-for-byte later, and you can share the settings for a teammate to get the exact same graphic.",
    },
    {
      question: "Can I download it as PNG as well as SVG?",
      answer:
        "Yes. Copy the SVG or CSS for the web, download a scalable.svg, or export a.png for tools that don't accept vectors, social cards, decks, email. The PNG is rasterised locally on the browser canvas at your chosen dimensions. Nothing is uploaded.",
    },
    {
      question: "Is my brand color or anything else uploaded to a server?",
      answer:
        "No. The background geometry, the gradients, the CSS data-URI encoding and the PNG rasterisation are all computed in your browser. Nothing you generate is sent anywhere, stored or logged, so it's private by design and works offline, close the tab and there's nothing left behind.",
    },
    {
      question: "Is it free to use commercially?",
      answer:
        "Yes. The backgrounds you generate are plain geometry and gradients with no licence attached. Use them freely in commercial products, client work and open-source projects. There's no watermark, sign-up or attribution requirement.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, mesh, dots, grid, waves and blob styles with aspect-ratio presets, two-color + accent palette, opacity/density controls, seeded re-roll, live preview and SVG + PNG export.",
    },
    {
      date: "2026-06-26",
      change:
        "Added a copy-ready CSS background-image snippet (optimized data-URI), undo/redo across layouts and colors, keyboard shortcuts, and one-click preset backgrounds.",
    },
    {
      date: "2026-07-01",
      change:
        "Tuned mesh blur and wave layering for cleaner output, added checkerboard/light/dark preview surfaces, and reduced data-URI size on dense layouts.",
    },
  ],

  relatedTools: [
    "svg-blob-generator",
    "svg-wave-generator",
    "svg-pattern-generator",
    "svg-gradient-generator",
    "svg-optimizer",
    "image-compressor",
  ],
};

export default svgBackgroundGenerator;
