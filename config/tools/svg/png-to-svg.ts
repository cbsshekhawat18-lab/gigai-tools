import type { Tool } from "@/types";

/**
 * PNG to SVG: the vectorizer of the SVG suite. It traces a raster image
 * (PNG, JPG, WebP, GIF, BMP) into scalable SVG paths with imagetracerjs,
 * entirely in the browser. Every string below is written for the searcher who
 * has a flat logo or icon PNG and wants clean vector paths, and is honest that
 * this is a color-quantizing tracer, not an AI vectorizer, so photos come out
 * heavy.
 */
const pngToSvg: Tool = {
  slug: "png-to-svg",
  title: "PNG to SVG",
  category: "svg-tools",
  group: "Convert",
  icon: "Shapes",
  accent: "orange",
  status: "live",
  createdAt: "2026-06-21",

  description:
    "Convert PNG, JPG or WebP to SVG in your browser: trace a raster image into clean, scalable vector paths with adjustable colors and detail, then copy or download the SVG. Nothing is uploaded.",

  h1: "PNG to SVG Converter: Trace Raster Images to Vectors",
  tagline:
    "Drop a PNG, JPG or WebP and watch it become editable SVG paths, tune colors and detail, compare raster and vector side by side, then copy or download. Best on flat logos and icons, 100% in your browser.",
  longDescription:
    "The GigAI PNG to SVG converter turns a raster image into scalable vector paths using imagetracerjs, a color-quantizing edge tracer that runs entirely on your device. Drop a PNG, JPG, WebP, GIF or BMP and it reads the pixels onto a canvas, quantizes them to a palette you control, and outlines each color region as an SVG <path>, the result renders live beside the original so you can judge fidelity before you keep it. Real controls steer the trace: a mode preset (Flat, Poster, Photo or Sketch) sets the baseline, a color count slider decides how many shades survive, and the workspace reports the path count and file size so you always know what you're shipping. This is the honest kind of tracer: on flat art (brand marks, monochrome icons, pixel sprites, simple illustrations) it produces small, clean, infinitely scalable SVGs that beat any upscaled PNG. On photographs it will faithfully emit thousands of paths and a large file, because it is a deterministic tracer and not an AI that redraws your image. When the shape matters more than the pixels, it's the fastest path from a flattened export to a resolution-independent vector you can drop into a component, restyle with CSS, or feed into the SVG Optimizer. Because every step happens in your browser, your artwork (unreleased logos, client assets, private icons) is never uploaded, stored or logged.",

  ctaText: "Convert PNG to SVG",

  keywords: [
    "png to svg",
    "convert png to svg",
    "jpg to svg",
    "image to svg",
    "raster to vector",
    "png to svg converter",
    "vectorize png",
    "trace image to svg",
    "png to vector",
    "logo png to svg",
    "webp to svg",
    "image tracer online",
  ],

  seo: {
    title: "PNG to SVG, Convert & Trace Raster Images to Vectors Online | GigAI Tools",
    description:
      "Free online PNG to SVG converter. Drop a PNG, JPG or WebP and trace it into scalable SVG paths with adjustable colors and detail, side by side with the original, 100% in your browser, no uploads.",
  },

  formats: {
    input: ["PNG", "JPG", "WebP", "GIF", "BMP"],
    output: ["SVG"],
  },

  features: [
    {
      icon: "Shapes",
      title: "Real path tracing, in your browser",
      description:
        "imagetracerjs quantizes your image to a palette and outlines each color region as an SVG <path>. It runs on-device with the browser's canvas. No server, no upload, no queue.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Mode presets that steer quality",
      description:
        "Flat for logos and icons, Poster for a bold reduced look, Photo for maximum color fidelity, Sketch for fine detail. Each preset tunes the tracer's color count, thresholds and path culling for you.",
    },
    {
      icon: "Palette",
      title: "Color count you control",
      description:
        "Slide from a crisp 2-color trace up to 64 shades. Fewer colors means fewer, cleaner paths and a smaller file. More colors captures gradients and shading at the cost of size.",
    },
    {
      icon: "Columns2",
      title: "Raster and vector, side by side",
      description:
        "Your original image sits next to the traced SVG on a checkerboard so you can judge fidelity at a glance, zoom in to confirm an edge held, or spot where a soft gradient turned blocky.",
    },
    {
      icon: "Gauge",
      title: "Path count & size readout",
      description:
        "Live badges report how many paths the trace produced and the resulting SVG size, so you know instantly whether you got a lean logo or a heavy photo trace before you download.",
    },
    {
      icon: "Download",
      title: "Copy, download & hand off",
      description:
        "Copy the SVG markup to your clipboard or download it as a .svg file. Send the result straight to the SVG Optimizer to squeeze it further, or paste it into SVG to React.",
    },
  ],

  benefits: [
    {
      title: "Rescue art that only exists as a PNG",
      description:
        "When the source vector is lost and all you have is a flattened logo or icon PNG, tracing recovers a scalable, restyleable SVG, sharp at any size instead of blurry when you scale it up.",
    },
    {
      title: "Ship resolution-independent assets",
      description:
        "A traced logo mark stays crisp on retina screens, print and favicons alike, and can be recolored with CSS. One vector replaces a folder of @1x/@2x/@3x PNG exports.",
    },
    {
      title: "Know exactly what you're getting",
      description:
        "The path count and size readout plus the side-by-side preview mean no surprises. You see whether the trace is a clean 12-path logo or a 4,000-path photo before it ever leaves the tool.",
    },
    {
      title: "Private by design",
      description:
        "Tracing runs locally in your browser. Unreleased brand marks, client artwork and internal icons never leave your machine. Nothing is uploaded, stored or logged.",
    },
  ],

  howTo: [
    {
      title: "Add your image",
      description:
        "Drop a PNG, JPG, WebP, GIF or BMP onto the drop zone, click to browse, or paste an image from your clipboard. It loads instantly and stays on your device.",
    },
    {
      title: "Pick a mode and colors",
      description:
        "Choose Flat, Poster, Photo or Sketch, then dial the color count. Flat with a low color count is the sweet spot for logos and icons. Raise colors only when you need to capture shading.",
    },
    {
      title: "Compare the trace to the original",
      description:
        "The raster and the traced SVG sit side by side. Zoom in to confirm edges held and colors read correctly, and adjust the controls until the vector looks right.",
    },
    {
      title: "Copy or download the SVG",
      description:
        "Copy the markup or download a .svg file. For the leanest result, run it through the SVG Optimizer afterward to merge points and trim precision.",
    },
  ],

  useCases: [
    {
      audience: "Brand & design",
      title: "Recover a logo with no source file",
      description:
        "A client sends a logo as a PNG and the original vector is gone. Trace it in Flat mode with a low color count to get clean, scalable paths you can refine and reuse across print and web.",
    },
    {
      audience: "Frontend developer",
      title: "Turn an icon PNG into an inline SVG",
      description:
        "Vectorize a small monochrome icon, then send it to SVG to React or SVG to Data URI so it lives inline in your components and inherits currentColor instead of loading a bitmap.",
    },
    {
      audience: "Game / pixel artist",
      title: "Vectorize sprites for crisp scaling",
      description:
        "Trace flat pixel art or sprite sheets so they scale to any resolution without the fuzz of a bitmap upscale, keeping hard edges where they belong.",
    },
    {
      audience: "Maker / hobbyist",
      title: "Prep art for cutting or engraving",
      description:
        "Convert a simple bitmap into vector outlines suitable as a starting point for laser cutters, vinyl plotters or CNC toolpaths, then clean the paths in a vector editor.",
    },
  ],

  tips: [
    "Flat mode with 2–8 colors is the sweet spot for logos, icons and monochrome art. It yields the fewest, cleanest paths and the smallest file.",
    "Start the image as large and sharp as you can. Tracing a tiny or blurry PNG bakes its jaggies into the paths. A crisp source traces cleaner.",
    "Photos are honest but heavy, expect thousands of paths and a big file. If you must trace one, lower the color count and accept a posterized look.",
    "After tracing, run the SVG through the SVG Optimizer to merge points, round coordinates and drop the file size further.",
    "If edges look ragged, try Poster (bolder regions) or drop the color count. If fine detail is lost, try Sketch or raise colors slightly.",
  ],

  troubleshooting: [
    {
      problem: "The SVG file is huge and full of thousands of paths.",
      solution:
        "That's the signature of tracing a photograph or a heavily-shaded image, every color region becomes a path. Lower the color count, switch to Flat or Poster mode, and run the output through the SVG Optimizer. For photos, a raster format is usually the right call.",
    },
    {
      problem: "The traced edges look jagged or the colors are muddy.",
      solution:
        "Trace quality follows the source. Use the largest, sharpest version of the image you have, and pick a color count that matches the art, too few muddies gradients, too many fragments flat regions into noise.",
    },
    {
      problem: "My image won't load or nothing appears.",
      solution:
        "The input must be a raster image the browser can decode (PNG, JPG, WebP, GIF or BMP). SVGs and PDFs aren't raster inputs. Very large images can exhaust memory while tracing, downscale first if the tab stalls.",
    },
    {
      problem: "Fine text or thin lines disappeared in the trace.",
      solution:
        "The tracer culls tiny regions to keep the path count sane. Try Sketch mode or a higher color count to preserve detail, or trace a larger source so small features occupy more pixels.",
    },
  ],

  security:
    "Every step (decoding your image, quantizing its colors and tracing the paths) runs entirely in your browser using its native canvas. Your image is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely vectorize unreleased logos, client artwork or internal icons. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my image uploaded to a server?",
      answer:
        "No. Decoding, color quantization and tracing all happen in your browser on a canvas. Your image never leaves your device, so there's nothing for us to store, log or see, it's safe to convert confidential logos or unreleased artwork.",
    },
    {
      question: "Does PNG to SVG work well on photographs?",
      answer:
        "Not really, and we're upfront about it. This is a color-quantizing tracer, not an AI vectorizer. On flat art (logos, icons, pixel art) it produces clean, small, scalable SVGs. On photos it faithfully emits thousands of paths and a large file. For photographic images, a raster format is almost always the better choice.",
    },
    {
      question: "What image formats can I convert?",
      answer:
        "Any raster image your browser can decode: PNG, JPG/JPEG, WebP, GIF and BMP. Transparency in PNG and WebP is preserved as un-traced (transparent) regions. SVG and PDF are not raster inputs.",
    },
    {
      question: "How do I get the cleanest, smallest SVG?",
      answer:
        "Start from a large, sharp image, use Flat mode with a low color count (2–8 for most logos), and then run the result through the SVG Optimizer to merge points and round coordinates. Fewer colors means fewer paths and a smaller file.",
    },
    {
      question: "What do the Flat, Poster, Photo and Sketch modes do?",
      answer:
        "Each is a preset that tunes the tracer. Flat favors few colors and smooth edges for logos and icons. Poster gives a bold, reduced-palette look. Photo keeps many colors for fidelity (large file). Sketch raises detail and thresholds to capture fine features and thin lines.",
    },
    {
      question: "Can I edit the SVG after tracing?",
      answer:
        "Yes. The output is standard SVG markup: copy it into any vector editor (Figma, Illustrator, Inkscape) to refine the paths, or send it to SVG to React or SVG to Data URI to use it in code. Tracing gives you a starting vector, not a hand-drawn one.",
    },
    {
      question: "Will the trace match my image exactly?",
      answer:
        "It's an approximation. The tracer groups pixels into a limited palette and outlines each region, so soft gradients become bands and anti-aliased edges become polylines. On flat art the difference is negligible. On complex images you'll see the tradeoff, which the side-by-side preview makes obvious.",
    },
    {
      question: "Is this a real vectorizer or just an embedded bitmap?",
      answer:
        "It's a real vectorizer. The output is genuine SVG <path> geometry, not a PNG wrapped in an <image> tag. That means it scales cleanly and can be recolored with CSS. (If you only want an embedded bitmap, our SVG tools that emit an <image> data URI do that instead.)",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release, in-browser PNG/JPG/WebP tracing to SVG with Flat/Poster/Photo/Sketch modes, adjustable color count, side-by-side raster/vector preview, path-count and size readout, and copy/download.",
    },
    {
      date: "2026-06-26",
      change:
        "Added paste-to-import, sample images for a one-click first result, and a clearer honest-limits note distinguishing flat-art tracing from photo tracing.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved large-image handling and error messages, and surfaced a quick hand-off to the SVG Optimizer for shrinking the traced output.",
    },
  ],

  relatedTools: [
    "eps-to-png",
    "svg-optimizer",
    "svg-to-react",
    "svg-viewer",
    "image-compressor",
  ],
};

export default pngToSvg;
