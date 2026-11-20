import type { Tool } from "@/types";

/**
 * SVG Path Visualizer, the "View & Edit" tool for the `d` attribute itself.
 * Paste a path string and see the outline auto-fitted on a transparency-aware
 * canvas, overlaid with anchor nodes, bezier control handles + connector lines,
 * and green start / red end markers, alongside a live geometry report: total
 * length (exact via `getTotalLength`), bounding box, subpath count and a
 * per-command histogram from `pathInfo`. Every string of copy here is unique to
 * *reading and debugging path data*, deliberately distinct from the viewer,
 * optimizer and converter siblings so this page owns its own search intent.
 */
const svgPathVisualizer: Tool = {
  slug: "svg-path-visualizer",
  title: "SVG Path Visualizer",
  description:
    "Paste an SVG path d attribute to see its outline drawn with anchor points, bezier control handles and start/end markers, plus a live report of length, bounding box, subpaths and a per-command breakdown, all in your browser.",
  category: "svg-tools",
  group: "View & Edit",
  icon: "Route",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-21",

  h1: "SVG Path Visualizer: Debug the d Attribute with Points & Handles",
  tagline:
    "Paste a path `d` string and watch it come to life: the outline auto-fits the canvas, every anchor and bezier control handle is plotted, the start and end are color-marked, and a live report shows total length, bounding box, subpaths and how many of each command you used. 100% client-side, nothing uploaded.",
  longDescription:
    "The GigAI SVG Path Visualizer turns a raw `d` attribute (that dense run of M, L, C, Q, A and Z commands) into something you can actually see and reason about. Paste or type a path and it is parsed into an absolute-coordinate point cloud, auto-fitted into a padded viewBox, and drawn on a checkerboard, light or dark canvas with a non-scaling stroke so hairlines stay crisp at any size. On top of the outline it overlays round anchor nodes for every on-path point, square handles for bezier control points with dashed connector lines back to their anchors, and unmistakable green start and red end markers so you can immediately tell direction and where a subpath opens and closes. Beside the drawing, a geometry report computes the total outline length, exact, using the browser's native getTotalLength when available and a subdivision estimate otherwise, the axis-aligned bounding box, the number of subpaths, the total command count, and a histogram of how many M/L/C/S/Q/T/A/Z commands the path contains. The `d` string stays fully editable inline: fix a stray coordinate, flip a sweep flag, or trim a redundant command and the canvas and report redraw instantly, with undo/redo, copy, download and shareable-link support wired in. Because everything runs locally using the same path math a browser uses to render SVG (no server, no upload, no account) you can debug logo paths, icon glyphs, animation morph targets and generated geometry with complete privacy. It is the fastest way to answer 'why does this path look wrong?', and it links straight to the SVG Viewer, Optimizer and React converter when the path is finally right.",

  ctaText: "Visualize a path",

  keywords: [
    "svg path visualizer",
    "svg d attribute viewer",
    "visualize svg path",
    "svg path debugger",
    "bezier control points svg",
    "svg path length calculator",
    "svg path preview",
    "parse svg path",
    "svg path commands explained",
    "svg path point editor",
  ],

  seo: {
    title:
      "SVG Path Visualizer, Debug d Attributes with Points & Handles | GigAI Tools",
    description:
      "Free online SVG path visualizer: paste a d attribute to see the outline with anchor points, bezier control handles and start/end markers, plus live length, bounding box, subpath and per-command stats. Editable, undoable, 100% in your browser.",
  },

  features: [
    {
      icon: "Spline",
      title: "Anchors, handles & markers",
      description:
        "Every on-path anchor is a round node, every bezier control point a square handle with a dashed line to its anchor, and the start (green) and end (red) are color-marked so path direction is obvious at a glance.",
    },
    {
      icon: "Ruler",
      title: "Exact length & bounding box",
      description:
        "Reads the true outline length via the browser's getTotalLength (the same math it uses to render) and reports the axis-aligned bounding box, so you know the path's real size, not a guess.",
    },
    {
      icon: "ListOrdered",
      title: "Per-command histogram",
      description:
        "Counts every command letter (M, L, H, V, C, S, Q, T, A, Z) plus subpaths and total commands, revealing at a glance whether a path is heavy on cubics, full of redundant lineto's, or has stray extra subpaths.",
    },
    {
      icon: "Pencil",
      title: "Editable with live redraw",
      description:
        "The `d` string is a live editor: fix a coordinate, flip a sweep flag or delete a command and the outline, points and report all update instantly. No re-parse button, no round-trip.",
    },
    {
      icon: "Frame",
      title: "Auto-fit, zoom & backgrounds",
      description:
        "The path is auto-fitted into a padded viewBox and can be viewed on a transparency checkerboard, light or dark canvas, with a points-overlay toggle for a clean look when you just want the outline.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Parsing, measuring and drawing all happen on your device. No path is ever uploaded, stored or logged. Debug confidential logo and icon geometry with zero risk of it leaving your machine.",
    },
  ],

  benefits: [
    {
      title: "See what the numbers mean",
      description:
        "A wall of M/C/Z coordinates tells you nothing. The plotted anchors and handles show you exactly which control point is dragging a curve the wrong way, so fixes take seconds not minutes.",
    },
    {
      title: "Catch broken geometry instantly",
      description:
        "A path that renders off-screen, doubles back on itself, or has an accidental extra subpath jumps out immediately from the outline, markers and subpath count: long before it reaches production.",
    },
    {
      title: "Measure without a design tool",
      description:
        "Get the true length and bounding box of any path for stroke-dasharray animations, pattern spacing or layout math, without opening Illustrator or Figma.",
    },
    {
      title: "Private by design",
      description:
        "Everything runs locally, so you can paste client logo paths, unreleased icon glyphs and proprietary morph targets knowing nothing is transmitted or retained.",
    },
  ],

  howTo: [
    {
      title: "Paste your path data",
      description:
        "Drop the `d` value from an SVG `<path>` into the editor, or load one of the built-in samples (a heart, star, wave or letterform) to try it instantly.",
    },
    {
      title: "Read the overlay",
      description:
        "Study the anchors, control handles and green/red markers on the canvas, and toggle the points overlay off when you just want to see the clean outline.",
    },
    {
      title: "Check the geometry report",
      description:
        "Scan the length, bounding box, subpath count and per-command histogram to understand the path's size, complexity and structure.",
    },
    {
      title: "Edit, then copy or hand off",
      description:
        "Tweak the `d` string with live redraw and undo/redo, then copy it, download the wrapped .svg, or jump to the SVG Viewer, Optimizer or React converter.",
    },
  ],

  formats: {
    input: ["SVG path d", "TXT"],
    output: ["SVG path d", "SVG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Debug a hand-tuned icon path",
      description:
        "Paste a glyph's `d` to see which anchor sits a pixel off or which cubic overshoots, fix the coordinate inline, and copy the corrected path back into your component.",
    },
    {
      audience: "Motion designer",
      title: "Measure a stroke-dasharray target",
      description:
        "Read the exact outline length to set stroke-dasharray/offset for a 'draw-on' line animation, and confirm two morph targets share the same command sequence.",
    },
    {
      audience: "Design-systems engineer",
      title: "Audit generated geometry",
      description:
        "Check the command histogram and subpath count on machine-generated paths to spot redundant lineto's or stray subpaths that bloat the file before it enters the icon set.",
    },
    {
      audience: "Student / learner",
      title: "Learn how path commands work",
      description:
        "Type an M, add a C, drag numbers around and watch the anchors and control handles move: the fastest way to build intuition for how bezier path data maps to shapes.",
    },
  ],

  troubleshooting: [
    {
      problem: "My path draws nothing or the canvas stays empty.",
      solution:
        "A path must start with a move command (M or m). If the report shows a parse error or zero commands, check that the string begins with M and that command letters aren't missing between coordinate groups. Paste just the `d` value. Not the whole `<path d=\"…\">` tag.",
    },
    {
      problem: "The length shows as an estimate, not exact.",
      solution:
        "Exact length uses the browser's getTotalLength, which needs a DOM. In the live tool it is exact. If you ever see an estimate it means arcs (A) were approximated by their chord: flatten arcs to cubics for a precise measurement, or trust the estimate which is very close for typical paths.",
    },
    {
      problem: "Control handles aren't showing for my curves.",
      solution:
        "Only cubic (C/S) and quadratic (Q) commands have control points. L, H, V, T and A anchors have none by design. If a C looks like a straight line, its control points may coincide with the anchors. The outline is correct, there is simply nothing to drag.",
    },
    {
      problem: "The shape looks squashed or huge.",
      solution:
        "The canvas auto-fits the path into a padded viewBox, so proportions are preserved but absolute scale is normalised for viewing. Read the bounding box in the report for the path's true width and height in user units.",
    },
  ],

  tips: [
    "Watch the start (green) and end (red) markers to confirm path direction. It matters for fills with holes and for animation.",
    "A high line/lineto count with few curves often means a path that could be simplified. Run it through the SVG Optimizer next.",
    "Use the exact length readout directly as your stroke-dasharray and stroke-dashoffset value for pixel-perfect draw-on animations.",
    "Toggle the points overlay off to compare the clean outline against your design, then back on to fix the offending anchor.",
    "More subpaths than you expect usually means a stray M. Check the histogram and remove the accidental move command.",
  ],

  security:
    "Your path data is parsed, measured and drawn entirely in your browser using the same native path math the browser uses to render SVG. It is never uploaded to any server. The outline is rendered as a plain, attribute-only `<path>` with no script execution, so pasting an unknown `d` string can't run code. Nothing is stored, logged or transmitted. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my path data uploaded to a server?",
      answer:
        "No. Parsing, measuring the length and bounding box, and drawing the outline with its anchors and handles all happen locally in your browser. Your path never leaves your device, so there is nothing for us to store, log or see. It is safe to debug confidential logo and icon geometry.",
    },
    {
      question: "What do the different points and markers mean?",
      answer:
        "Round nodes are on-path anchors: the actual points the outline passes through. Square nodes are bezier control handles for cubic (C/S) and quadratic (Q) curves, each joined to its anchor by a dashed line. The green marker is the path's start point and the red marker is its end point, so you can read direction instantly.",
    },
    {
      question: "How is the path length calculated?",
      answer:
        "It uses the browser's native getTotalLength on a real (off-screen) path element (the exact same measurement the browser uses when rendering) so the number matches what you'd get from path.getTotalLength() in code. When a DOM isn't available it falls back to a subdivision estimate that stays very close for typical paths.",
    },
    {
      question: "Can I edit the path here?",
      answer:
        "Yes. The `d` string is fully editable and the canvas, points and geometry report redraw live as you type, with undo and redo. It's ideal for nudging a coordinate, flipping an arc sweep flag, or deleting a redundant command. For heavy cleanup or minification, hand the result to the SVG Optimizer.",
    },
    {
      question: "What's the difference between anchors, control points and subpaths?",
      answer:
        "Anchors are the on-path points the curve passes through. Control points (handles) pull cubic and quadratic curves into shape but don't lie on the path. A subpath is one continuous stroke that begins with a move (M) command. A single `d` can contain several subpaths, which is how shapes get holes and disconnected pieces.",
    },
    {
      question: "Which path commands are supported?",
      answer:
        "All of them: M/m (move), L/l (line), H/h and V/v (horizontal/vertical line), C/c and S/s (cubic bezier), Q/q and T/t (quadratic bezier), A/a (elliptical arc) and Z/z (close). Both absolute (uppercase) and relative (lowercase) forms are parsed, along with implicit repeated commands like 'L 1 2 3 4'.",
    },
    {
      question: "Why should I paste only the d value, not the whole SVG?",
      answer:
        "This tool visualises a single path's `d` attribute, so paste just the coordinate string (the part inside d=\"…\"). If you have a full SVG file with multiple elements, open it in the SVG Viewer instead, which renders the whole graphic and reports every element, color and feature.",
    },
    {
      question: "Can it handle relative commands and arcs?",
      answer:
        "Yes. Relative (lowercase) commands are resolved to absolute coordinates for the overlay, and elliptical arcs (A/a) are drawn correctly with their endpoint shown as an anchor. Arcs don't expose bezier control handles because they're defined by radii and flags rather than control points.",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release, auto-fit path canvas with anchor nodes, bezier control handles and dashed connectors, green/red start-end markers, editable `d` with live redraw, and a length / bounding-box / subpath / per-command report.",
    },
    {
      date: "2026-06-27",
      change:
        "Added exact getTotalLength measurement, curated sample paths (heart, star, wave, letterform), undo/redo, copy/download/share, a points-overlay toggle, and keyboard shortcuts with an in-tool reference.",
    },
    {
      date: "2026-07-02",
      change:
        "Added light/dark canvas backgrounds, a normalize-to-absolute action, refined the command histogram layout, and improved dark-mode contrast and focus styles for AA compliance.",
    },
  ],

  relatedTools: [
    "svg-viewer",
    "svg-optimizer",
    "svg-to-react",
    "svg-blob-generator",
  ],
};

export default svgPathVisualizer;
