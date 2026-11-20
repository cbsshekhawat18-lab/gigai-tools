import type { Tool } from "@/types";

/**
 * SVG Path Editor, the "View & Edit" tool focused on a single, misunderstood
 * primitive: the `<path d="…">` attribute. Paste or type a d-string and get a
 * live, auto-fitted outline with anchor nodes and bezier control handles, a
 * command-by-command breakdown (M/L/C/Q/A/Z with their coordinates), geometry
 * facts (length, bounding box, subpaths) from the path engine, and one-click
 * normalisation between absolute and relative coordinates. Every string of copy
 * here is written for the *path-editing* search intent: deliberately distinct
 * from the viewer, optimizer and converter siblings.
 */
const svgPathEditor: Tool = {
  slug: "svg-path-editor",
  title: "SVG Path Editor",
  description:
    "Edit an SVG path d-string with a live outline preview, anchor and control-point overlays, a command-by-command breakdown, and one-click absolute/relative normalisation: all in your browser, nothing uploaded.",
  category: "svg-tools",
  group: "View & Edit",
  icon: "Spline",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-21",

  h1: "SVG Path Editor, Edit & Understand the <path> d Attribute Online",
  tagline:
    "Paste an SVG path, watch it draw live with every anchor and bezier handle exposed, read a plain-English breakdown of each command, and flip the whole thing between absolute and relative coordinates with one click. 100% client-side.",
  longDescription:
    "The GigAI SVG Path Editor turns the most cryptic part of any SVG: the `d` attribute. Into something you can actually see and reason about. Paste a path string (or the whole `<path>` element, or a full SVG. We extract the first path for you), and it renders instantly as an auto-fitted outline with on-path anchor nodes, off-path bezier control handles drawn with connector lines, and clear green start / red end markers so you always know the drawing direction. Alongside the canvas, a scrollable command breakdown lists every M, L, H, V, C, S, Q, T, A and Z in order with its raw coordinates, so you can trace exactly how the shape is built and jump to the segment you need to change. A geometry panel powered by our path engine reports the total outline length (exact, using the browser's own `getTotalLength` when available), the axis-aligned bounding box, the subpath count and a histogram of how many of each command the path uses. The single most useful action lives one click away: normalise the entire path to all-absolute or all-relative coordinates, invaluable when you're hand-authoring icons, diffing two versions of a logo, or preparing a path for animation where consistent command casing matters. The `d` string stays fully editable in a synced code pane with undo/redo, and you can copy the cleaned-up result or download it as a ready-to-use SVG. Because everything runs locally with the native DOM and a dependency-free parser, no path, logo or unreleased icon ever leaves your machine.",

  ctaText: "Edit a path",

  keywords: [
    "svg path editor",
    "edit svg path",
    "svg d attribute editor",
    "svg path d string",
    "svg bezier editor",
    "svg path normalizer",
    "absolute relative svg path",
    "svg path commands",
    "svg path length",
    "svg path bounding box",
    "online svg path tool",
  ],

  seo: {
    title:
      "SVG Path Editor, Edit, Visualize & Normalize the d Attribute | GigAI Tools",
    description:
      "Free online SVG path editor: paste a d-string to see a live outline with anchor and control points, a command-by-command breakdown, length and bounding-box stats, and one-click absolute/relative normalisation. Runs entirely in your browser.",
  },

  features: [
    {
      icon: "Spline",
      title: "Live outline with handles",
      description:
        "Your path draws instantly on a checkerboard, light or dark canvas, with anchor nodes, bezier control handles and connector lines, plus green start and red end markers that reveal the drawing direction.",
    },
    {
      icon: "ListOrdered",
      title: "Command-by-command breakdown",
      description:
        "Every M, L, C, S, Q, T, A, H, V and Z is listed in order with its exact coordinates, so you can read how the shape is constructed and pinpoint the segment you want to edit.",
    },
    {
      icon: "Ruler",
      title: "Real geometry facts",
      description:
        "The path engine reports total outline length (exact via the browser's getTotalLength when possible), the axis-aligned bounding box, subpath count and a per-command histogram.",
    },
    {
      icon: "Repeat",
      title: "Absolute ↔ relative in one click",
      description:
        "Normalise the whole d-string to all-uppercase absolute or all-lowercase relative commands, perfect for hand-authoring, cleaner diffs, or prepping a path for animation.",
    },
    {
      icon: "Code",
      title: "Synced, editable code pane",
      description:
        "Edit the raw d-string beside the preview and watch every anchor, handle and stat update live, with undo and redo so experimenting is always safe.",
    },
    {
      icon: "ShieldCheck",
      title: "Entirely in your browser",
      description:
        "Parsing, rendering and normalising all run on your device with the native DOM and a dependency-free parser. No path is uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Demystify any path string",
      description:
        "Instead of staring at a wall of numbers, see the shape draw, trace each command, and know instantly which coordinate maps to which point on screen.",
    },
    {
      title: "Hand-author icons with confidence",
      description:
        "Tweak a control point, add a segment, or fix a stray coordinate and watch the outline respond live. No editor round-trip, no exporting, no guesswork.",
    },
    {
      title: "Get clean, consistent paths",
      description:
        "Normalising to absolute or relative removes the mixed-case, mixed-origin mess that makes paths hard to read, diff and animate, giving you a tidy canonical form.",
    },
    {
      title: "Private by default",
      description:
        "Because it runs locally, you can open logos, unreleased icon sets and client artwork with zero risk of anything leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste your path",
      description:
        "Drop in a bare d-string, a whole <path> element, or an entire SVG (the editor extracts the first path) or load a built-in sample to try it instantly.",
    },
    {
      title: "See it and read it",
      description:
        "The outline draws with anchors and handles while the command breakdown lists every segment in order. Toggle the point overlay and background to inspect closely.",
    },
    {
      title: "Edit or normalise",
      description:
        "Adjust the d-string in the code pane and watch the preview update, or click Absolute / Relative to rewrite the whole path into a consistent coordinate system.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the finished d-string for your markup, or download it as a ready-to-use SVG file. Undo and redo keep every experiment reversible.",
    },
  ],

  formats: {
    input: ["SVG", "TXT"],
    output: ["SVG", "TXT"],
  },

  useCases: [
    {
      audience: "Icon designer",
      title: "Fix a wonky curve by hand",
      description:
        "See exactly which control handle is pulling a bezier out of shape, nudge its coordinate in the code pane, and confirm the outline snaps back, without reopening a vector editor.",
    },
    {
      audience: "Frontend developer",
      title: "Prep a path for animation",
      description:
        "Normalise a path to all-absolute commands so it has a stable, predictable command list before wiring it up to a stroke-dashoffset or morph animation.",
    },
    {
      audience: "Design-systems engineer",
      title: "Make two logos diff-able",
      description:
        "Run both versions of a mark through Relative normalisation so their d-strings share a canonical form, turning a noisy git diff into a readable one.",
    },
    {
      audience: "Educator / learner",
      title: "Learn how paths actually work",
      description:
        "Load a sample and step through the command breakdown to see how M starts a subpath, C draws a cubic bezier, and Z closes it, with the shape drawing as you read.",
    },
  ],

  faq: [
    {
      question: "Is my SVG path uploaded to a server?",
      answer:
        "No. Parsing, rendering, the command breakdown and normalisation all happen locally in your browser using the native DOM and a dependency-free parser. Your path never leaves your device, so it is safe to edit confidential logos, unreleased icons and client work.",
    },
    {
      question: "What is the d attribute in an SVG path?",
      answer:
        "The d attribute is the string that defines a path's shape. It is a sequence of commands, M (move to), L (line to), C (cubic bezier), Q (quadratic bezier), A (arc), Z (close) and their relative lowercase forms, each followed by coordinates. This editor draws that string live and lists every command so it stops being cryptic.",
    },
    {
      question: "What's the difference between absolute and relative path commands?",
      answer:
        "Uppercase commands (M, L, C…) use absolute coordinates measured from the SVG's origin, while lowercase commands (m, l, c…) use coordinates relative to the current point. This tool converts a whole path either way with one click, which is handy for readability, cleaner diffs, and animation setups that expect consistent commands.",
    },
    {
      question: "Can I paste a whole <path> element or a full SVG?",
      answer:
        "Yes. Paste a bare d-string, an entire <path …/> element, or a complete <svg> document, the editor pulls out the first path's d attribute automatically. You can also drop an.svg file onto the canvas.",
    },
    {
      question: "How is the path length calculated?",
      answer:
        "When your browser can measure it, the editor uses the native getTotalLength on a real path element for an exact result, and flags it as exact. In rare cases where that isn't available, it falls back to a curve-flattening estimator. The bounding box and subpath count are derived from the same geometry pass.",
    },
    {
      question: "Does normalising change how my path looks?",
      answer:
        "No. Converting between absolute and relative commands rewrites the coordinates but produces the same rendered shape. It is a lossless change of notation. Coordinates are rounded to a sensible precision, which can shift a rendered pixel imperceptibly but never alters the geometry you see.",
    },
    {
      question: "Can I edit anchor points by dragging them on the canvas?",
      answer:
        "The canvas is a live, auto-fitting visualiser that shows anchors and bezier handles so you can see precisely what each coordinate does. The editing itself happens in the synced code pane, where you change the d-string and the overlay updates instantly. This keeps the exact numbers under your control, which matters for icon work.",
    },
    {
      question: "Why does my path preview look empty or clipped?",
      answer:
        "Usually the d-string has a syntax error (a command missing a coordinate, or a stray letter) which the breakdown panel will flag with the offending command. Fix that and the outline redraws. The canvas auto-fits any valid path, so scale is never the problem.",
    },
  ],

  tips: [
    "Paste a full SVG and the editor grabs the first path automatically. No need to hand-extract the d attribute.",
    "Normalise to Absolute before animating: a consistent, uppercase command list is far easier to reason about for stroke and morph effects.",
    "Watch the green start and red end markers to understand a path's direction. It decides how dash and draw-on animations flow.",
    "Toggle the point overlay off to judge the pure outline, then back on to grab the exact anchor or handle you need to change.",
    "A high command count on a simple shape usually means redundant nodes. Simplify by hand here, then shrink further in the SVG Optimizer.",
  ],

  troubleshooting: [
    {
      problem: "The breakdown flags a command error and the preview won't draw.",
      solution:
        "A command is missing coordinates or an unexpected letter slipped in. The breakdown names the failing command: check that each M/L has 2 numbers, C has 6, Q has 4 and A has 7, then the outline redraws automatically.",
    },
    {
      problem: "After normalising, my numbers look slightly different.",
      solution:
        "Normalisation rounds coordinates to a sensible precision to keep the string clean, so long decimals get trimmed. The rendered shape is unchanged. If you need maximum precision, keep your original and use normalisation only for readability.",
    },
    {
      problem: "Arc (A/a) segments don't show control handles.",
      solution:
        "Arcs are defined by radii and flags rather than bezier control points, so there are no handles to show: only the endpoint anchor. The outline still renders the arc correctly. Edit its rx, ry, rotation and flags directly in the code pane.",
    },
    {
      problem: "I pasted a full SVG but only one shape appears.",
      solution:
        "This editor focuses on a single path's d-string, so it extracts the first <path>. To inspect an entire multi-element SVG, use the SVG Viewer. Come back here to edit an individual path.",
    },
  ],

  security:
    "Your path and any SVG you paste or drop are parsed, rendered and normalised entirely in your browser using the native DOM and a dependency-free parser. Nothing is uploaded to any server. The preview additionally strips scripts, foreignObject, on* handlers and javascript: URLs, so opening an unknown SVG can't execute code. Nothing is stored, logged or transmitted. Close the tab and every trace is gone.",

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release, live auto-fitting outline with anchor and control-point overlays, a command-by-command breakdown, length/bounding-box/subpath geometry, and one-click absolute/relative normalisation.",
    },
    {
      date: "2026-06-26",
      change:
        "Added paste-a-whole-SVG path extraction, drag-drop import, undo/redo on the code pane, curated sample paths, keyboard shortcuts with an in-tool reference, and copy/download of the finished d-string.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the geometry panel with an exact/estimated length badge, improved dark-mode contrast for AA compliance, and polished the empty and error states.",
    },
  ],

  relatedTools: [
    "svg-viewer",
    "svg-editor",
    "svg-optimizer",
    "svg-to-react",
  ],
};

export default svgPathEditor;
