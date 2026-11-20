import type { Tool } from "@/types";

/**
 * SVG Color Editor, the recolor workbench of the "View & Edit" group. It scans
 * an SVG for every distinct color used in fills, strokes, gradient stops and
 * inline styles, lists them as clickable swatches, and lets you remap each one
 * to a new value with a color picker or hex field while the preview updates
 * live. Every string below is written for the intent "change the colors of an
 * SVG / recolor an SVG icon online": deliberately distinct from the optimizer
 * (minify), the editor (edit raw code) and the viewer (open & inspect), so this
 * page owns its own search intent and never claims capabilities the client-side
 * engine lacks.
 */
const svgColorEditor: Tool = {
  slug: "svg-color-editor",
  title: "SVG Color Editor",
  description:
    "Detect every color in an SVG and recolor it live: fills, strokes and gradient stops become clickable swatches you can remap with a picker or hex, with an instant preview. Bulk-replace, swap to currentColor and export, all in your browser, nothing uploaded.",
  category: "svg-tools",
  group: "View & Edit",
  icon: "Palette",
  accent: "rose",
  status: "live",
  createdAt: "2026-06-24",

  h1: "SVG Color Editor, Recolor SVG Online with Live Swatches",
  tagline:
    "Paste or drop an SVG and every color it uses (fills, strokes, gradient stops and inline styles) is pulled into a swatch list you can recolor with a picker or a hex field. The preview updates as you type, so you can rebrand an icon, retheme an illustration or convert a mark to currentColor in seconds. 100% client-side, never uploaded.",
  longDescription:
    "The GigAI SVG Color Editor turns the tedious job of recoloring vector art into a point-and-click task. Under the hood it parses your SVG the way a browser does, walking every element to collect the colors that actually paint pixels, fill and stroke attributes, gradient stop-colors, flood-colors and colors buried in inline style attributes, and de-duplicates them into a clean swatch list. Each swatch shows the original token, how many times it appears, and where it's used, so you always know what a change will touch. Click a swatch to open a native color picker or type a hex value, and the tool rewrites every matching occurrence in place while the checkerboard preview re-renders instantly. Because the remap is token-based rather than a blind find-and-replace, it respects the exact color strings in your file and won't corrupt IDs, class names or unrelated markup. Beyond one-at-a-time edits you can shuffle a palette for quick exploration, swap every color to currentColor so an icon inherits its parent's text color, invert or desaturate the whole set, and reset any swatch (or all of them) back to the original in one click. Full undo/redo means you can experiment fearlessly. When you're happy, copy the recolored SVG, download it as a.svg, or export a PNG rendered right in your browser. Nothing is uploaded: brand palettes, unreleased logos and internal icon sets are parsed and recolored entirely on your device, and close the tab and every trace is gone.",

  ctaText: "Recolor SVG",

  keywords: [
    "svg color editor",
    "recolor svg",
    "change svg color online",
    "svg color changer",
    "edit svg colors",
    "svg color replacer",
    "replace color in svg",
    "svg palette editor",
    "svg to currentcolor",
    "recolor svg icon",
    "svg fill color changer",
    "change svg stroke color",
  ],

  seo: {
    title: "SVG Color Editor: Recolor SVG & Change Colors Online | GigAI Tools",
    description:
      "Free online SVG color editor. Detect every fill, stroke and gradient-stop color in an SVG, remap each with a picker or hex, and preview live, bulk-replace, swap to currentColor and export PNG. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Palette",
      title: "Every color, auto-detected",
      description:
        "Parses the whole document to find each distinct color that paints a pixel (fills, strokes, gradient stops, flood-colors and colors hidden in inline styles) and lists them as clean, de-duplicated swatches.",
    },
    {
      icon: "Pipette",
      title: "Pick or type a new value",
      description:
        "Click a swatch for a native color picker or type any hex, rgb or named color into the field. Every matching occurrence is rewritten in place and the preview updates the moment you change it.",
    },
    {
      icon: "Eye",
      title: "Live checkerboard preview",
      description:
        "The recolored SVG renders live on a transparency-aware checkerboard beside the swatches, so you can judge the new palette against real transparency instead of guessing from hex codes.",
    },
    {
      icon: "Replace",
      title: "Palette-wide actions",
      description:
        "Shuffle for quick exploration, swap the whole file to currentColor so an icon inherits text color, invert or desaturate every swatch, and reset a single color or the entire palette in one click.",
    },
    {
      icon: "Hash",
      title: "Token-accurate remap",
      description:
        "Colors are replaced by exact token, not blind find-and-replace, so IDs, class names, path data and unrelated markup are never corrupted, only the color values you chose actually change.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Parsing, recoloring and PNG export all run on your device. Brand palettes, unreleased logos and internal icon sets are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Rebrand an icon set in minutes",
      description:
        "Point a whole icon or logo at your new brand palette by remapping a handful of swatches, instead of hunting through markup for every fill and stroke by hand.",
    },
    {
      title: "Ship theme-ready, currentColor icons",
      description:
        "Convert a multi-color mark to currentColor in one click so it inherits the surrounding text color and works in both light and dark mode without a second export.",
    },
    {
      title: "Explore palettes without fear",
      description:
        "Shuffle, invert and desaturate to try directions fast, with full undo/redo and per-swatch reset. Nothing is destructive until you copy or download.",
    },
    {
      title: "No design tool, no upload",
      description:
        "Get precise, per-color control without opening Illustrator or Figma, and without sending a confidential logo to a third-party recoloring service.",
    },
  ],

  howTo: [
    {
      title: "Add your SVG",
      description:
        "Paste markup, drop a .svg file anywhere on the workspace, or load a sample. The tool immediately lists every color it detects as a swatch.",
    },
    {
      title: "Remap the colors",
      description:
        "Click any swatch to open a picker or type a new hex value. Every matching occurrence updates and the preview re-renders as you go.",
    },
    {
      title: "Try palette actions (optional)",
      description:
        "Shuffle for ideas, swap the whole file to currentColor, invert or desaturate: then fine-tune individual swatches, undoing anything you don't like.",
    },
    {
      title: "Copy, download or export PNG",
      description:
        "Copy the recolored SVG, download it as a.svg, or export a PNG rendered in your browser. Reset any swatch, or all of them, back to the original at any time.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG", "PNG"],
  },

  useCases: [
    {
      audience: "Brand / Marketing designer",
      title: "Recolor a logo to a new palette",
      description:
        "Drop in an exported logo and remap each brand color to the updated palette, checking the result on the checkerboard before handing the SVG back to the team.",
    },
    {
      audience: "Frontend developer",
      title: "Convert an icon to currentColor",
      description:
        "Take a two- or three-color icon and swap every color to currentColor so it inherits text color and looks right in both light and dark themes with a single asset.",
    },
    {
      audience: "UI / Product designer",
      title: "Theme an illustration",
      description:
        "Retint a spot illustration to match a feature's accent color by remapping its dominant fills, without reopening the source file in a heavy design tool.",
    },
    {
      audience: "Design systems engineer",
      title: "Normalize stray colors",
      description:
        "Spot off-palette one-off colors an export slipped in, the swatch list surfaces every value with its usage count, and snap them onto your token colors.",
    },
  ],

  troubleshooting: [
    {
      problem: "A gradient didn't change when I edited a swatch.",
      solution:
        "Gradients are painted through their stop-colors, so edit the gradient stop swatches (they appear in the list) rather than the shape's fill, which is a url(#id) reference and carries no color of its own.",
    },
    {
      problem: "My color shows once in the list but the shape has many parts.",
      solution:
        "That's expected. Identical colors are de-duplicated into a single swatch, and its count reflects how many places use it. Editing that one swatch recolors every occurrence at once.",
    },
    {
      problem: "Swapping to currentColor made the icon disappear.",
      solution:
        "currentColor inherits the parent's text color, so on a same-colored background the icon becomes invisible. Set a color on the surrounding element (or the preview shows it fine on the checkerboard). This is how theme-ready icons are meant to work.",
    },
    {
      problem: "No swatches appeared after I pasted my SVG.",
      solution:
        "The file may only use url(#…) gradient fills, inherit colors, or not be well-formed SVG. Check that it starts with an <svg> tag. If it's all gradient references, edit the gradient stops, which do carry colors.",
    },
  ],

  tips: [
    "Watch the usage count on each swatch: the highest-count color is usually the one that defines the artwork's overall look.",
    "Swap to currentColor for anything you'll inline in a themed UI so one asset works in light and dark mode.",
    "Use Shuffle to explore palette directions fast, then reset and dial in the two or three swatches that matter by hand.",
    "Recolor before converting to a React component or a data-URI so the embedded markup already carries your final palette.",
    "Reset a single swatch instead of the whole palette when only one experiment went wrong. The per-swatch reset keeps the rest of your edits.",
  ],

  security:
    "Your SVG is parsed and recolored entirely in your browser. It is never uploaded to any server. Color detection, remapping and PNG export all run locally, so nothing is stored, logged or transmitted and you can safely recolor unreleased logos, brand marks and internal icon sets. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. Parsing, color detection, recoloring and PNG export all happen locally in your browser. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to recolor confidential logos and brand assets.",
    },
    {
      question: "How does it find the colors in my SVG?",
      answer:
        "It parses the SVG the way a browser does and walks every element, collecting colors from fill and stroke attributes, gradient stop-colors and flood-colors, and any colors set in inline style attributes. Identical values are de-duplicated into a single swatch with a usage count.",
    },
    {
      question: "Why doesn't editing a shape's color change its gradient?",
      answer:
        "When a shape is filled with a gradient, its fill is a url(#id) reference that has no color of its own: the color lives in the gradient's stops. Those stop-colors appear as their own swatches, so edit them to recolor a gradient.",
    },
    {
      question: "What is 'swap to currentColor' and when should I use it?",
      answer:
        "currentColor is a special value that makes an SVG inherit the text color of its parent element. Swapping every color to currentColor turns a mark into a single theme-ready asset that automatically works in light and dark mode, ideal for icons you inline in a UI.",
    },
    {
      question: "Will recoloring change anything else in my file?",
      answer:
        "No. Colors are remapped by exact token, not a blind text find-and-replace, so IDs, class names, path coordinates and unrelated markup are left untouched, only the color values you picked are rewritten.",
    },
    {
      question: "Can I use any color format, not just hex?",
      answer:
        "Yes. You can enter hex (#rgb, #rrggbb, #rrggbbaa), rgb()/rgba() or CSS named colors, plus special values like currentColor, none and transparent where they make sense. The picker outputs hex. The field accepts the rest.",
    },
    {
      question: "Can I export the result as a PNG?",
      answer:
        "Yes. Alongside copy and download-as-SVG, you can export a PNG rendered entirely in your browser at a scale you choose, so you get a raster of the recolored artwork without any upload.",
    },
    {
      question: "Can I undo a recolor?",
      answer:
        "Yes. Every change is a step in a full undo/redo history, and you can reset an individual swatch or the entire palette back to the original at any time, so experimenting with Shuffle, invert or desaturate is always safe.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, automatic color detection across fills, strokes, gradient stops and inline styles, per-swatch picker/hex remap with a live checkerboard preview, copy, download, PNG export, undo/redo and shareable links.",
    },
    {
      date: "2026-06-29",
      change:
        "Added palette-wide actions (shuffle, swap-to-currentColor, invert and desaturate) plus per-swatch and full-palette reset and usage counts on every swatch.",
    },
  ],

  relatedTools: [
    "svg-editor",
    "svg-optimizer",
    "svg-to-react",
    "svg-viewer",
    "image-compressor",
  ],
};

export default svgColorEditor;
