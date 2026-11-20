import type { Tool } from "@/types";

/**
 * SVG Viewer, the flagship "View & Edit" tool of the SVG suite. Open, paste or
 * drop an SVG and get a premium, desktop-grade viewer: a checkerboard/light/dark
 * canvas, fit/50/100/200% zoom, live dimensions, a source-code pane, and a full
 * composition report (elements, colors, gradients/filters/animation, viewBox,
 * byte size) powered by `analyzeSvg`. Every character of this copy is unique to
 * *viewing and inspecting* SVG, deliberately distinct from the optimizer,
 * converter and generator siblings so each page ranks for its own intent.
 */
const svgViewer: Tool = {
  slug: "svg-viewer",
  title: "SVG Viewer",
  description:
    "Open, paste or drop an SVG to view it on a checkerboard, light or dark canvas with zoom, live dimensions, a source-code pane and a full element/color report: 100% in your browser, nothing uploaded.",
  category: "svg-tools",
  group: "View & Edit",
  icon: "Eye",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "SVG Viewer, Open, Inspect & Preview SVG Files Online",
  tagline:
    "Drop an.svg file, paste markup, or load a sample and see it rendered on a transparency-aware canvas, with zoom, live dimensions, the raw source, and a full breakdown of every element, color and feature inside. All client-side, nothing uploaded.",
  longDescription:
    "The GigAI SVG Viewer is a desktop-grade way to open and inspect SVG files without launching a heavyweight editor. Drag a.svg onto the canvas, paste markup from your clipboard, or load a built-in sample, and it renders instantly on a checkerboard backdrop that reveals true transparency, with one-click light and dark backgrounds so you can judge how the graphic looks against real surfaces. Fit-to-screen and 50/100/200% zoom let you scrutinise hairline strokes and alignment, while a live dimensions readout shows the intrinsic width, height and viewBox. Below the canvas, a composition panel built on our analyzer counts every element by tag (paths, rects, circles, groups, gradients, filters), lists the distinct colors referenced in fills, strokes and gradient stops, flags whether the file carries animation, gradients or filter effects, surfaces the viewBox, and reports the exact byte size. A synced source-code pane lets you read and lightly edit the markup and watch the preview update live. Because everything runs locally in your browser using the native DOMParser (no server, no upload, no account) you can safely open logos, icons and design exports that contain brand assets or client work. It is the fastest path from 'what is inside this SVG?' to a clear, trustworthy answer, and it links straight to our optimizer and React/Data-URI converters when you are ready to ship the file.",

  ctaText: "Open an SVG",

  keywords: [
    "svg viewer",
    "open svg file",
    "view svg online",
    "svg preview",
    "svg inspector",
    "render svg",
    "svg code viewer",
    "svg dimensions",
    "read svg file",
    "svg element counter",
    "preview svg dark background",
    "svg viewbox checker",
  ],

  seo: {
    title: "SVG Viewer, Open, Preview & Inspect SVG Files Online | GigAI Tools",
    description:
      "Free online SVG viewer: open, paste or drop an SVG to preview it on a checkerboard, light or dark canvas with zoom, live dimensions, source code and a full element, color and viewBox report. 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "Grid2x2",
      title: "Transparency-true canvas",
      description:
        "A checkerboard backdrop reveals real transparency, and one-click light and dark backgrounds show exactly how the graphic reads against white, dark UI or a printed page.",
    },
    {
      icon: "Search",
      title: "Zoom & live dimensions",
      description:
        "Fit-to-screen plus 50/100/200% zoom to inspect hairline strokes and alignment, with a live readout of the SVG's intrinsic width, height and viewBox.",
    },
    {
      icon: "ListTree",
      title: "Full composition report",
      description:
        "See every element counted by tag (paths, rects, circles, groups, gradients, filters) the total node count, and the exact byte size, so you know precisely what is inside.",
    },
    {
      icon: "Palette",
      title: "Colors & feature flags",
      description:
        "Extracts the distinct colors used in fills, strokes and gradient stops, and flags whether the file carries animation, gradients or filter effects at a glance.",
    },
    {
      icon: "Code",
      title: "Source-code pane",
      description:
        "Read the raw markup beside the preview, lightly edit it, and watch the canvas redraw live: perfect for spotting a stray transform, missing viewBox or oversized path.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Rendering and analysis use the browser's native DOMParser on your device. No SVG is ever uploaded, stored or logged. Open confidential brand and client files safely.",
    },
  ],

  benefits: [
    {
      title: "Understand any SVG in seconds",
      description:
        "Instead of squinting at raw XML, get a rendered preview plus a plain report of elements, colors and features, the fastest way to answer 'what is this file?'",
    },
    {
      title: "Catch problems before you ship",
      description:
        "A missing viewBox that breaks scaling, an accidental filter that bloats the file, or a hidden animation all surface immediately, so bad SVGs never reach production.",
    },
    {
      title: "Judge it against real backgrounds",
      description:
        "The checkerboard reveals transparency and the light/dark toggle shows the graphic on the surfaces it will actually live on, so contrast and halos are obvious.",
    },
    {
      title: "Private by design",
      description:
        "Because it runs locally, you can open logos, unreleased icon sets and client exports with zero risk of anything leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Open your SVG",
      description:
        "Drop an .svg file onto the canvas, paste markup into the source pane, click to browse, or load a built-in sample to try it instantly.",
    },
    {
      title: "Preview & zoom",
      description:
        "Toggle the checkerboard, light or dark background and use Fit or 50/100/200% zoom to inspect the graphic. The dimensions readout updates live.",
    },
    {
      title: "Read the report",
      description:
        "Scan the composition panel for element counts, colors, viewBox, feature flags and byte size to understand exactly what the file contains.",
    },
    {
      title: "Copy, download or optimize",
      description:
        "Copy the source, download the.svg, or jump to the SVG Optimizer to shrink it, then to the React or Data-URI converter when you are ready to ship.",
    },
  ],

  formats: {
    input: ["SVG", "TXT"],
    output: ["SVG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Inspect an icon before importing",
      description:
        "Open an icon exported from Figma to confirm it has a viewBox, no stray width/height, and no rogue filters before you inline it or convert it to a component.",
    },
    {
      audience: "Designer",
      title: "Check transparency and edges",
      description:
        "View a logo on the checkerboard to spot unwanted background fills or anti-alias halos, then flip to a dark canvas to verify it works in a dark UI.",
    },
    {
      audience: "Design-systems engineer",
      title: "Audit an icon set",
      description:
        "Paste each icon to compare element counts, colors and byte sizes, catching outliers that are far heavier or use hard-coded colors that should be currentColor.",
    },
    {
      audience: "Support / QA",
      title: "Open a file a client sent",
      description:
        "Quickly render an SVG someone emailed to confirm it displays correctly and read its dimensions, without trusting an unknown desktop app or uploading it anywhere.",
    },
  ],

  troubleshooting: [
    {
      problem: "My SVG renders blank or clipped.",
      solution:
        "Check the composition panel for a viewBox. If it is missing, the graphic has no defined coordinate space and may render at 0×0 or clip. Add a viewBox matching your artwork bounds, or open it in the SVG Optimizer which can preserve/add one.",
    },
    {
      problem: "It looks different here than in my design tool.",
      solution:
        "Browsers render standard SVG. Some editors add proprietary namespaces, embedded fonts or effects that browsers ignore. Flatten text to paths and remove editor-specific metadata (the Optimizer does this) for consistent cross-browser rendering.",
    },
    {
      problem: "The colors panel is empty but the image has color.",
      solution:
        "Colors defined only in a <style> block, via CSS classes, or through url(#gradient) references may not appear in the fill/stroke color list. The gradients flag will still light up. Open the source pane to read the <style> or <defs> directly.",
    },
    {
      problem: "Animation isn't playing.",
      solution:
        "SMIL (<animate>) and CSS keyframes render in the live preview, but the report will flag animation so you know it is present. If it appears static, the animation may be JavaScript-driven, which the sandboxed preview strips for safety.",
    },
  ],

  tips: [
    "Flip to the dark background to catch light-colored strokes or halos that vanish on white.",
    "Watch the element count, an icon with hundreds of nodes is a prime candidate for the SVG Optimizer.",
    "No viewBox in the report is the #1 cause of SVGs that won't scale responsively. Add one before shipping.",
    "Use the source pane to swap hard-coded colors for currentColor so an icon inherits text color in your UI.",
    "Big byte size with only a few shapes usually means embedded raster data or excessive path precision: optimize it.",
  ],

  security:
    "Your SVG is rendered and analyzed entirely in your browser using the native DOMParser. It is never uploaded to any server. The live preview additionally strips scripts, foreignObject, on* handlers and javascript: URLs before rendering, so opening an unknown SVG can't execute code. Nothing is stored, logged or transmitted. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. Opening, previewing and analyzing all happen locally in your browser using its native DOMParser. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to view confidential logos, unreleased icons and client work.",
    },
    {
      question: "How do I open an SVG file?",
      answer:
        "Drag the .svg file directly onto the canvas, click to browse and pick it, or open the file in a text editor and paste its markup into the source pane. The graphic renders instantly and its report appears below.",
    },
    {
      question: "Why does my SVG show a transparent checkerboard background?",
      answer:
        "The checkerboard is the viewer's way of showing you real transparency. Those squares are not part of your image. It makes it obvious which areas are see-through. Toggle the light or dark background to preview the graphic on an opaque surface instead.",
    },
    {
      question: "What does the element and color report tell me?",
      answer:
        "It counts every element by tag (paths, rects, circles, groups, gradients, filters and more), totals the node count, lists the distinct colors used in fills, strokes and gradient stops, flags whether the file uses animation, gradients or filters, shows the viewBox, and reports the exact byte size, a complete picture of what the SVG contains.",
    },
    {
      question: "Why is my SVG rendering blank?",
      answer:
        "The most common cause is a missing viewBox, which leaves the graphic with no coordinate space so it renders at zero size or clips. Check the report for the viewBox field. If it is absent, add one matching your artwork bounds, or run the file through the SVG Optimizer which can preserve it.",
    },
    {
      question: "Can I edit the SVG here?",
      answer:
        "Yes. The source-code pane is editable. Tweak the markup and the preview and report update live, which is ideal for quick fixes like adding a viewBox, swapping a color for currentColor, or removing a stray attribute. For heavy transformations, use the dedicated optimizer and converter tools.",
    },
    {
      question: "Does the viewer run scripts inside an SVG?",
      answer:
        "No. Before rendering, the preview strips <script>, <foreignObject>, inline on* event handlers and javascript: URLs. This means you can safely open an SVG from an untrusted source to see what it looks like without it executing any code in your browser.",
    },
    {
      question: "Can it open large or complex SVGs?",
      answer:
        "Yes. Illustrations with thousands of nodes render fine, though very large files naturally use more memory. If a graphic feels heavy, the element count and byte size in the report will tell you why, usually excessive path precision or embedded raster data, and the Optimizer can slim it down.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, checkerboard/light/dark canvas, fit/50/100/200% zoom, live dimensions, editable source pane with live redraw, and a full element/color/feature/viewBox/byte-size report.",
    },
    {
      date: "2026-06-24",
      change:
        "Added drag-drop and paste import, keyboard shortcuts with an in-tool reference, undo/redo on the source pane, curated sample SVGs, and a one-click hand-off to the SVG Optimizer.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved the color extractor for gradient stops, added a distinct-colors swatch strip, and refined the empty state and dark-mode contrast for AA compliance.",
    },
  ],

  relatedTools: [
    "svg-optimizer",
    "svg-minifier",
    "svg-to-react",
    "svg-to-data-uri",
    "image-compressor",
  ],
};

export default svgViewer;
