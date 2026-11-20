import type { Tool } from "@/types";

/**
 * SVG Editor, the "View & Edit" workbench of the SVG suite. It pairs a live,
 * line-numbered source editor with an instant checkerboard preview and a
 * one-click Format / Optimize / Minify bar, plus a live element inspector that
 * counts tags, lists colors and flags gradients/filters/animation as you type.
 * Every string below is written for the intent "edit SVG code with live
 * preview", deliberately distinct from the optimizer (batch minify), the
 * viewer (open & inspect) and the converter siblings, so this page owns its own
 * search intent and never claims capabilities the client-side engine lacks.
 */
const svgEditor: Tool = {
  slug: "svg-editor",
  title: "SVG Editor",
  description:
    "Edit SVG code with an instant live preview: type in the source pane and watch it render, then Format, Optimize or Minify in one click. A live inspector counts elements, colors and features, all in your browser, nothing uploaded.",
  category: "svg-tools",
  group: "View & Edit",
  icon: "PenTool",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-22",

  h1: "SVG Editor, Edit SVG Code Online with Live Preview",
  tagline:
    "A desktop-grade SVG code editor: type or paste markup and see it render instantly on a transparency-aware canvas, then pretty-print, optimize with SVGO or minify in a single click. A live inspector shows every element, color and feature as you edit: 100% client-side, never uploaded.",
  longDescription:
    "The GigAI SVG Editor is a hands-on workbench for people who edit SVG by hand: swapping a fill, nudging a path, adding a viewBox, or hand-tuning an icon that a design tool got almost right. Unlike a viewer that only shows you a file, this is a two-way editor: the left pane is a real, line-numbered code editor and the right pane is a live checkerboard preview that redraws the moment you stop typing, so you always see exactly what your markup produces. When your source needs cleanup, a single click runs the same three transforms you'd otherwise wire into a build: Format pretty-prints the markup with consistent indentation so nested groups and defs are readable. Optimize runs SVGO's full browser pipeline to collapse groups, round coordinates and strip editor cruft, and Minify strips it to the smallest one-line form for shipping. A live element inspector sits beneath the canvas, updating as you type: it counts every tag (paths, rects, circles, groups, gradients, filters), lists the distinct colors used across fills, strokes and gradient stops, surfaces the viewBox and byte size, and flags whether the file carries gradients, filters or animation, so you can spot a missing viewBox or a stray hard-coded color without leaving the editor. Real undo/redo, copy, download, PNG-free source export, curated starter SVGs and keyboard shortcuts round out a genuine editing loop, not a one-shot converter. Because everything (parsing, rendering, optimizing and analysis) happens locally in your browser using the native DOMParser and SVGO's browser build, brand marks, unreleased logos and client work never leave your machine. It is the fastest path from 'this SVG is close but not quite right' to clean, shippable markup.",

  ctaText: "Edit an SVG",

  keywords: [
    "svg editor",
    "edit svg code",
    "svg code editor online",
    "svg live preview",
    "edit svg online",
    "svg source editor",
    "svg markup editor",
    "format svg",
    "online svg editor free",
    "hand edit svg",
    "svg editor with preview",
  ],

  seo: {
    title: "SVG Editor, Edit SVG Code Online with Live Preview | GigAI Tools",
    description:
      "Free online SVG code editor with an instant live preview. Type or paste SVG markup, Format, Optimize with SVGO or Minify in one click, and inspect every element, color and feature live. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "SplitSquareHorizontal",
      title: "Live code ↔ preview editing",
      description:
        "A real line-numbered source editor beside a checkerboard canvas that redraws the instant you stop typing, so every attribute change, path tweak or color swap shows up immediately.",
    },
    {
      icon: "Sparkles",
      title: "Format, Optimize & Minify in one click",
      description:
        "Pretty-print for readable nested markup, run SVGO's full browser pipeline to shrink and clean, or minify to a single shipping line, each transform lands as one undoable step.",
    },
    {
      icon: "ScanSearch",
      title: "Live element inspector",
      description:
        "As you edit, see a running count of every tag, the distinct colors in fills/strokes/gradients, the viewBox, byte size, and flags for gradients, filters and animation.",
    },
    {
      icon: "Palette",
      title: "Color & feature at a glance",
      description:
        "Distinct-color swatches make it obvious when an icon still hard-codes a hex it should inherit via currentColor, and feature flags reveal hidden gradients or animation.",
    },
    {
      icon: "Undo2",
      title: "Undo / redo, copy, download",
      description:
        "A full editing loop: undo and redo every edit and transform, copy the source, download the.svg, load a starter, and reset, with keyboard shortcuts for all of it.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Editing, rendering, optimizing and analysis all run on your device. No SVG is uploaded, stored or logged, and the preview strips scripts and on* handlers so unknown markup can't execute.",
    },
  ],

  benefits: [
    {
      title: "See the change as you make it",
      description:
        "Hand-editing SVG blind is error-prone. With the preview redrawing live, you catch a broken path, a wrong fill or a clipped viewBox the moment it happens instead of after you ship.",
    },
    {
      title: "Clean up without leaving the editor",
      description:
        "Format to read the structure, Optimize to shrink it, Minify to ship it. You don't bounce between a viewer, a prettifier and an optimizer, and every step is undoable.",
    },
    {
      title: "Understand a file while you fix it",
      description:
        "The inspector answers 'what's in here?' inline (element counts, colors, viewBox and features) so quick fixes like adding a viewBox or swapping a color are informed, not guesses.",
    },
    {
      title: "Private by design",
      description:
        "Because it runs locally, you can edit logos, unreleased icon sets and client exports with zero risk of anything leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Load your SVG",
      description:
        "Paste markup into the source pane, drop a .svg file onto the workspace, or load a curated starter to begin from something real.",
    },
    {
      title: "Edit with live preview",
      description:
        "Change fills, paths, the viewBox or any attribute in the code pane and watch the checkerboard preview redraw. The inspector updates counts, colors and flags as you type.",
    },
    {
      title: "Format, Optimize or Minify",
      description:
        "Click Format to pretty-print, Optimize to run SVGO's cleanup, or Minify to shrink to one line. Each is a single undoable step you can revert instantly.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the finished markup to your clipboard, download it as a .svg, or share a link that reopens the editor with your source pre-loaded.",
    },
  ],

  formats: {
    input: ["SVG", "TXT"],
    output: ["SVG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Hand-tune an icon",
      description:
        "Paste an icon, swap a hard-coded fill for currentColor, add a missing viewBox, then Optimize, all while the preview confirms it still renders exactly as intended.",
    },
    {
      audience: "UI / Icon designer",
      title: "Fix a design-tool export",
      description:
        "Format a messy Figma export to read its structure, delete a stray hidden layer or wrong transform, and watch the canvas update before you hand it off.",
    },
    {
      audience: "Design-systems engineer",
      title: "Normalize markup by hand",
      description:
        "Edit an icon's viewBox, stroke-width and color conventions to match the system, using the inspector to verify element counts and colors line up with the rest of the set.",
    },
    {
      audience: "Educator / Learner",
      title: "Learn SVG interactively",
      description:
        "Type paths, shapes and gradients and see each change render immediately: the fastest way to build an intuition for how SVG markup maps to what appears on screen.",
    },
  ],

  troubleshooting: [
    {
      problem: "My edit made the preview go blank.",
      solution:
        "You likely left the markup temporarily invalid, an unclosed tag or a broken attribute. The editor flags a parse issue. Fix the tag and the preview redraws. Undo (Ctrl/Cmd+Z) reverts to the last working state.",
    },
    {
      problem: "The graphic renders but is clipped or the wrong size.",
      solution:
        "Check the inspector's viewBox field. If it says Missing, add a viewBox matching your artwork bounds. That defines the coordinate space that lets the SVG scale to its container.",
    },
    {
      problem: "Optimize changed my curves slightly.",
      solution:
        "SVGO rounds coordinates to a default precision. For smooth gradients or tiny icons that need more decimals, use the dedicated SVG Optimizer where you can raise precision, then paste the result back here.",
    },
    {
      problem: "My animation isn't playing in the preview.",
      solution:
        "SMIL and CSS animation render live, but JavaScript-driven animation is stripped for safety before rendering. The inspector still flags that animation is present so you know it exists in the source.",
    },
  ],

  tips: [
    "Format first to read a messy export's structure, then edit: nested groups and defs are far easier to navigate indented.",
    "Watch the inspector's colors strip: a lone hex where you expect currentColor is a hint your icon won't inherit text color.",
    "Missing viewBox in the inspector is the #1 reason an SVG won't scale: add one before you copy it out.",
    "Optimize is undoable. Run it, glance at the preview, and Ctrl/Cmd+Z if a curve looks off.",
    "Minify only as the last step before shipping. Keep the formatted version while you're still editing.",
  ],

  security:
    "Your SVG is edited, rendered, optimized and analyzed entirely in your browser using the native DOMParser and SVGO's browser build. It is never uploaded to any server. The live preview additionally strips <script>, <foreignObject>, inline on* handlers and javascript: URLs before rendering, so editing an unknown SVG can't execute code. Nothing is stored, logged or transmitted. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. Editing, previewing, optimizing and analysis all happen locally in your browser using its native DOMParser and SVGO's browser build. Your markup never leaves your device, so there is nothing for us to store, log or see. It is safe to edit confidential logos, unreleased icons and client work.",
    },
    {
      question: "How does the live preview work?",
      answer:
        "As you type in the source pane, the editor parses your markup and re-renders it on the checkerboard canvas after a brief pause, so you always see exactly what your code produces. If the markup is momentarily invalid (say, mid-edit), the preview holds and a parse issue is flagged until you fix the tag.",
    },
    {
      question: "What's the difference between Format, Optimize and Minify?",
      answer:
        "Format pretty-prints your SVG with consistent indentation so it's readable while you edit. Optimize runs SVGO's full browser pipeline to collapse groups, round coordinates and strip editor cruft, shrinking the file while keeping it readable-ish. Minify strips everything to the smallest single-line form for shipping. Each is one undoable step.",
    },
    {
      question: "Can I edit the SVG's paths and shapes directly?",
      answer:
        "Yes. This is a code editor, so you edit the raw path data, shapes, transforms, gradients and any attribute by hand, and the preview redraws live. For a visual path editor with draggable anchor points, use the dedicated SVG Path tool. This editor is about full-source control with an instant render.",
    },
    {
      question: "What does the inspector show me?",
      answer:
        "It counts every element by tag (paths, rects, circles, groups, gradients, filters and more), totals the node count, lists the distinct colors used in fills, strokes and gradient stops, surfaces the viewBox, reports the byte size, and flags whether the file uses gradients, filters or animation, a live picture of what you're editing.",
    },
    {
      question: "Why did my edit break the preview?",
      answer:
        "Almost always an invalid intermediate state: an unclosed tag, a missing quote, or a malformed attribute while you're mid-edit. The editor flags the parse problem and the preview waits for valid markup. Finish the tag and it redraws. Undo reverts to the last good state.",
    },
    {
      question: "Does it run scripts inside an SVG?",
      answer:
        "No. Before rendering, the preview strips <script>, <foreignObject>, inline on* event handlers and javascript: URLs. You can safely open and edit an SVG from an untrusted source to see and change what it looks like without it executing any code in your browser.",
    },
    {
      question: "Can I undo an Optimize or Minify?",
      answer:
        "Yes. Every transform (Format, Optimize and Minify) lands as a single step in the undo history, so Ctrl/Cmd+Z restores your previous markup instantly. That makes it safe to try an aggressive cleanup and back it out if a curve or gradient looks off in the preview.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release, live code↔preview editing on a checkerboard/light/dark canvas, one-click Format / Optimize (SVGO) / Minify, a live element/color/feature/viewBox/byte-size inspector, undo/redo, copy, download and curated starter SVGs.",
    },
    {
      date: "2026-06-27",
      change:
        "Added drag-drop and paste import, keyboard shortcuts with an in-tool reference, shareable deep links, and a parse-error indicator that holds the preview on invalid intermediate markup.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved the color extractor for gradient stops, tightened dark-mode contrast to AA, and made each Format/Optimize/Minify transform a single undoable step.",
    },
  ],

  relatedTools: [
    "svg-viewer",
    "svg-optimizer",
    "svg-minifier",
    "svg-to-react",
    "json-formatter",
  ],
};

export default svgEditor;
