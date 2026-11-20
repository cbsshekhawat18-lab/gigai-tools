import type { Tool } from "@/types";

/**
 * SVG Gradient Generator, the "Generate" tool for designing linear, radial and
 * conic gradients and exporting them as both a scalable SVG (a real
 * <linearGradient>/<radialGradient> painting a rect) and a ready-to-paste CSS
 * background declaration. Add and drag color stops, tune the angle, switch
 * gradient type, and watch a big live preview update instantly. Everything is
 * computed in the browser via the deterministic makeGradient engine, copy the
 * SVG, copy the CSS, download the .svg or rasterise a PNG, all locally. Copy is
 * written for the exact queries people type when they want "an SVG gradient
 * background" or "a CSS gradient I can also use as SVG" without hand-editing
 * defs or reaching for a design app.
 */
const svgGradientGenerator: Tool = {
  slug: "svg-gradient-generator",
  title: "SVG Gradient Generator",
  description:
    "Design linear, radial and conic gradients with draggable color stops and an angle dial, then export a scalable SVG and a ready-to-paste CSS background side by side. Live preview, copy, download SVG/PNG: 100% in your browser.",
  category: "svg-tools",
  group: "Generate",
  icon: "Blend",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "SVG Gradient Generator: SVG + CSS Gradients, Free",
  tagline:
    "Build a gradient with as many color stops as you like, pick linear, radial or conic, dial in the angle, and copy the result as a clean SVG or a CSS background, with a big live preview and PNG export, all in your browser.",
  longDescription:
    "The GigAI SVG Gradient Generator is a desktop-grade color studio for the two things designers and developers actually need from a gradient: a resolution-independent SVG and a copy-paste CSS declaration, generated from the same controls so they always match. Add stops, drag them along the track, pick each color, and set the offset by hand for pixel-perfect placement. Switch between a linear gradient with a full 360° angle dial, a radial gradient that blooms from the centre, or a true CSS conic sweep. The SVG output is a proper <defs> with a real <linearGradient> or <radialGradient> painting a rect inside a clean viewBox, so it scales forever, stays editable, and drops straight into a hero section, an <img>, a Figma frame or a mask. Alongside it, the CSS panel emits the equivalent linear-gradient(), radial-gradient() or conic-gradient() background you can paste into a stylesheet or Tailwind arbitrary value. Preview on a checkerboard, light or dark surface, reroll a fresh palette when you want inspiration, and undo/redo through every stop and color you've tried. Nothing is uploaded, the gradient maths, the CSS string and the PNG rasteriser all run locally, so it works offline and never sees your brand colors.",

  ctaText: "Generate a gradient",

  keywords: [
    "svg gradient generator",
    "gradient generator",
    "css gradient generator",
    "linear gradient svg",
    "radial gradient svg",
    "conic gradient generator",
    "svg gradient background",
    "gradient maker",
    "svg linearGradient",
    "gradient to svg",
    "svg gradient css",
    "background gradient generator",
  ],

  seo: {
    title: "SVG Gradient Generator: SVG + CSS Gradients Online | GigAI Tools",
    description:
      "Free SVG gradient generator. Design linear, radial or conic gradients with draggable color stops and an angle dial, then copy a scalable SVG and a matching CSS background, or download SVG/PNG. 100% in your browser.",
  },

  features: [
    {
      icon: "Blend",
      title: "SVG and CSS from one design",
      description:
        "Every change updates a scalable SVG gradient and a matching CSS background declaration at the same time, so the vector you paste into markup and the linear-gradient() you paste into styles are always in sync.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Linear, radial & conic",
      description:
        "Switch gradient type in one click: a linear gradient with a full 360° angle dial, a centre-bloom radial, or a true CSS conic sweep (with an SVG linear fallback where SVG has no native conic).",
    },
    {
      icon: "Palette",
      title: "Unlimited draggable stops",
      description:
        "Add as many color stops as you need, drag them along the track to reposition, type an exact offset, and pick each color with a native swatch. No capping you at two ends.",
    },
    {
      icon: "FileCode",
      title: "Clean, editable output",
      description:
        "The SVG is a proper <defs> with a real <linearGradient>/<radialGradient> painting a rect in a tidy viewBox: resolution-independent, tiny, and still hand-editable after you paste it.",
    },
    {
      icon: "Dices",
      title: "Reroll a fresh palette",
      description:
        "Out of ideas? Reroll generates a new harmonious set of stops to start from, then fine-tune by hand. Undo steps back to a palette you liked better.",
    },
    {
      icon: "FileImage",
      title: "PNG export & live preview",
      description:
        "A big preview on checkerboard, light or dark updates as you drag, and one click rasterises a PNG at 2× on the browser canvas for tools that won't take an SVG or CSS.",
    },
  ],

  benefits: [
    {
      title: "Never hand-write gradient defs again",
      description:
        "Skip fiddling with x1/y1/x2/y2, stop-color and offset attributes. Design visually and copy a correct <linearGradient> or <radialGradient> that just works when you paste it.",
    },
    {
      title: "One design, both worlds",
      description:
        "Get the SVG for markup, masks and Figma and the CSS for stylesheets and Tailwind from the same set of stops. No drift between what your vector shows and what your CSS renders.",
    },
    {
      title: "Every format on tap",
      description:
        "Copy the SVG, copy the CSS, download a crisp.svg that scales forever, or export a transparent-ready PNG for decks and email, all from the gradient you just built.",
    },
    {
      title: "Private and offline",
      description:
        "The gradient maths, the CSS string and the PNG rasteriser all run on your device. Your brand colors and where the gradient is headed never leave the tab.",
    },
  ],

  howTo: [
    {
      title: "Pick a gradient type",
      description:
        "Choose linear, radial or conic. For linear, use the angle dial to point the gradient in any direction across the frame.",
    },
    {
      title: "Set your color stops",
      description:
        "Add stops, drag them along the track to place them, type an exact offset for precision, and pick each color with the swatch. Remove any stop you don't need.",
    },
    {
      title: "Check it in context",
      description:
        "Preview the gradient on checkerboard, light or dark to see it against your real background, and reroll for a fresh palette if you want a new starting point.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the SVG for markup or the CSS for styles, download a scalable.svg, or export a PNG at 2×. Everything is generated locally in your browser.",
    },
  ],

  formats: {
    input: [],
    output: ["SVG", "CSS", "PNG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Hero & button backgrounds",
      description:
        "Design a gradient once, then copy the CSS for a stylesheet or Tailwind arbitrary value and the matching SVG for an inline vector or mask. No drift between the two.",
    },
    {
      audience: "Product designer",
      title: "On-brand section fills",
      description:
        "Tune multi-stop gradients to the brand palette and hand off a clean, editable SVG the engineers can drop in unchanged, plus the CSS equivalent for quick prototypes.",
    },
    {
      audience: "Illustrator & motion designer",
      title: "Gradient fills for artwork",
      description:
        "Export a real <linearGradient> or <radialGradient> to reference from paths and shapes in your SVG artwork, keeping the fill resolution-independent and re-colorable.",
    },
    {
      audience: "Content & social",
      title: "Deck and post backgrounds",
      description:
        "Rasterise a gradient to PNG at 2× for a slide, a story background or an email header where a vector or CSS isn't accepted, without opening a design app.",
    },
  ],

  troubleshooting: [
    {
      problem: "My conic gradient shows as linear in the SVG.",
      solution:
        "SVG has no native conic gradient, so the tool emits a true conic-gradient() in the CSS panel and a linear <linearGradient> fallback in the SVG. Use the CSS for browsers, or export the PNG to bake the conic sweep into pixels for tools that can't render it.",
    },
    {
      problem: "The gradient direction looks different in CSS vs SVG.",
      solution:
        "CSS and SVG measure angles differently, but the tool maps the angle dial to both so they render the same. If you edit the exported code by hand, keep the CSS angle and the SVG x1/y1/x2/y2 vector consistent, or re-copy from the tool.",
    },
    {
      problem: "A color stop won't move where I want it.",
      solution:
        "Stops can't cross past their neighbours' positions while dragging. Type an exact offset in the stop's number field instead, or reorder by adjusting offsets, then fine-tune with the track.",
    },
    {
      problem: "The PNG looks soft when scaled up.",
      solution:
        "PNG is raster and only holds the pixels you exported. Prefer the SVG or CSS wherever the target accepts it, both are resolution-independent, or export the PNG at a larger size before using it.",
    },
  ],

  tips: [
    "Two or three stops read as a clean gradient. Add more only for sunset-style multi-hue blends, since every extra stop is another band to balance.",
    "For subtle depth, pick two shades of the same hue rather than two different colors. It looks intentional instead of loud.",
    "Prefer the SVG or CSS over the PNG wherever the target accepts it: both are tiny, sharp at any size, and re-colorable later.",
    "Use the radial type for spotlight and glow effects behind a card or avatar, and linear for full-width hero and button fills.",
    "Copy the CSS straight into a Tailwind arbitrary value like bg-[…] when you want the gradient in a utility-first stylesheet.",
  ],

  security:
    "Every gradient is generated in your browser, the SVG defs, the CSS declaration and the PNG rasterisation all run locally on your device. Nothing is uploaded, stored or logged, so your brand colors and where the gradient is headed stay private. It works offline, and closing the tab leaves no trace.",

  faq: [
    {
      question: "Does this generate both an SVG and CSS gradient?",
      answer:
        "Yes, that's the point. The same color stops and angle produce a scalable SVG (a real <linearGradient> or <radialGradient> painting a rect) and a matching CSS background declaration side by side, so the vector you paste into markup and the linear-gradient() you paste into styles always look identical. Copy whichever you need, or both.",
    },
    {
      question: "What gradient types are supported?",
      answer:
        "Linear, radial and conic. Linear gives you a full 360° angle dial to point the gradient in any direction. Radial blooms from the centre outward. Conic emits a true CSS conic-gradient(). Because SVG has no native conic gradient, the SVG output uses a linear fallback, and you can export a PNG to bake the conic sweep into pixels.",
    },
    {
      question: "Can I add more than two color stops?",
      answer:
        "Yes. Add as many stops as you like, drag each along the track to position it, type an exact offset for precision, and pick its color with a native swatch. Remove any stop you don't need. There's no cap at two ends, so multi-hue and sunset-style gradients are easy.",
    },
    {
      question: "How do I use the SVG gradient on a shape or path?",
      answer:
        "The exported SVG defines a gradient with an id inside <defs>. Copy the <defs> into your SVG, then reference it from any element with fill=\"url(#g)\" (or stroke). Keeping it as SVG means the fill stays resolution-independent and re-colorable in code, which is ideal for icons, illustrations and masks.",
    },
    {
      question: "Why does my conic gradient look different in the SVG?",
      answer:
        "SVG has no native conic gradient in the spec, so the tool gives you a genuine conic-gradient() in the CSS panel for browsers and a linear <linearGradient> approximation in the SVG for compatibility. If you specifically need the conic look outside CSS, export the PNG, which rasterises the true sweep into pixels.",
    },
    {
      question: "Can I download the gradient as PNG?",
      answer:
        "Yes. Copy the SVG or CSS, download a scalable.svg for the web and code, or export a PNG at 2× for tools that won't take a vector or a CSS background, decks, Canva, email headers. The PNG is rasterised locally on the browser canvas. Nothing is uploaded.",
    },
    {
      question: "Is anything uploaded to a server?",
      answer:
        "No. The gradient geometry, the CSS string and the PNG rasterisation are all computed in your browser. Nothing you generate is sent anywhere, stored or logged, so it's private by design and works offline, close the tab and there's nothing left behind.",
    },
    {
      question: "Is it free to use commercially?",
      answer:
        "Yes. A gradient is plain color data with no licence attached. Use the SVG, CSS or PNG freely in commercial products, client work and open-source projects. There's no watermark, sign-up or attribution requirement.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, linear/radial/conic gradient generator with unlimited draggable color stops, angle dial, live SVG + CSS output, and SVG/PNG export.",
    },
    {
      date: "2026-06-26",
      change:
        "Added undo/redo across stops and colors, keyboard shortcuts (reroll, copy SVG/CSS, undo/redo), and a reroll that seeds a harmonious starting palette.",
    },
    {
      date: "2026-07-01",
      change:
        "Added checkerboard/light/dark preview surfaces and a Tailwind-friendly CSS copy so gradients can drop straight into arbitrary utility values.",
    },
  ],

  relatedTools: [
    "svg-blob-generator",
    "svg-pattern-generator",
    "svg-wave-generator",
    "svg-optimizer",
    "svg-to-react",
  ],
};

export default svgGradientGenerator;
