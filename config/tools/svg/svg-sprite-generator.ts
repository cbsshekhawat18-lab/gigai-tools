import type { Tool } from "@/types";

/**
 * SVG Sprite Generator: the "Generate" tool that folds a pile of individual
 * icon SVGs into a single `<symbol>` sprite sheet. Drop or paste as many SVGs
 * as you like, name each one (the id becomes the `<use href="#…">` handle),
 * reorder or remove them, and the tool stitches every icon's inner markup and
 * viewBox into one hidden `<svg>` full of `<symbol>` blocks: plus a ready
 * `<use>` usage snippet for every symbol. One HTTP request instead of dozens,
 * one file to cache, icons re-colorable with `currentColor`. Everything runs
 * on `generate.makeSprite` in the browser: no upload, no build step, no CLI.
 * Copy is written for the exact phrases developers search when they want to
 * "combine SVGs into one sprite" without wiring up svg-sprite or gulp.
 */
const svgSpriteGenerator: Tool = {
  slug: "svg-sprite-generator",
  title: "SVG Sprite Generator",
  description:
    "Combine multiple SVG icons into one <symbol> sprite sheet, with a ready <use> snippet for each icon. Drop your SVGs, name them, download the sprite. 100% in your browser, no build step.",
  category: "svg-tools",
  group: "Generate",
  icon: "LayoutGrid",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-21",

  h1: "SVG Sprite Generator, Combine SVGs into One Sprite Sheet",
  tagline:
    "Drop a folder of icons, name each one, and watch them stitch into a single <symbol> sprite sheet with copy-paste <use> snippets. One request, one cached file, icons that inherit currentColor, generated entirely in your browser.",
  longDescription:
    "The GigAI SVG Sprite Generator turns a scattered set of individual icon files into a single, cache-friendly sprite sheet the way build tools like svg-sprite or gulp-svgstore do, but with no install, no config and no CLI. Drop or paste as many SVGs as you like. Each icon's inner markup and its original viewBox are lifted into a `<symbol id=\"…\">` inside one hidden wrapper `<svg style=\"display:none\">`. The id comes from the file name (or whatever you rename it to), sanitised to a valid, unique token so `home.svg` and `home-2.svg` never collide. Reference any icon anywhere on the page with a tiny `<use href=\"#id\">`, the tool writes that snippet for every symbol so you can paste and go. Because a sprite ships as one element in the DOM (or one cached file), the browser makes a single request instead of one per icon, symbols de-duplicate automatically, and icons drawn with `currentColor` inherit their color from CSS. Live preview renders the whole set on a checkerboard, light or dark surface. Copy the sprite markup, download a standalone `.svg` sprite for `<use href=\"sprite.svg#id\">`, reorder and rename icons, and undo/redo your way back. Nothing is uploaded, parsing, id sanitising and stitching all happen locally, so it works offline and never sees your icons.",

  ctaText: "Build a sprite",

  keywords: [
    "svg sprite generator",
    "svg sprite sheet",
    "combine svg files",
    "svg symbol sprite",
    "svg use sprite",
    "merge svg icons",
    "svg icon sprite",
    "create svg sprite online",
    "svgstore alternative",
    "svg symbol generator",
    "inline svg sprite",
    "svg sprite from files",
  ],

  seo: {
    title: "SVG Sprite Generator: Combine SVGs into a <symbol> Sprite | GigAI Tools",
    description:
      "Free SVG sprite generator. Merge multiple SVG icons into one <symbol> sprite sheet with copy-paste <use> snippets, rename and reorder icons, then copy or download the sprite. 100% in your browser, no build step.",
  },

  features: [
    {
      icon: "LayoutGrid",
      title: "Many icons, one sprite",
      description:
        "Drop or paste any number of SVGs and each becomes a <symbol> inside a single hidden <svg>. The whole set renders as one element and downloads as one file.",
    },
    {
      icon: "Tags",
      title: "Smart, collision-free ids",
      description:
        "Each icon's id is derived from its file name and sanitised to a valid lowercase token. Duplicates are auto-suffixed (home, home-1) so nothing clobbers anything.",
    },
    {
      icon: "ClipboardCheck",
      title: "Ready-made <use> snippets",
      description:
        "For every symbol the tool writes the exact <use href=\"#id\"> markup you paste into your HTML. No guessing the reference syntax or the viewBox.",
    },
    {
      icon: "ArrowUpDown",
      title: "Rename & reorder inline",
      description:
        "Rename any icon to control its id, drag the order to control symbol sequence, and remove the ones you don't need: the sprite and snippets update live.",
    },
    {
      icon: "Palette",
      title: "currentColor-friendly",
      description:
        "Icons authored with currentColor inherit their color from CSS, so one sprite recolors per context (hover, dark mode, brand accent) with a single fill rule.",
    },
    {
      icon: "Undo2",
      title: "Live preview, undo & redo",
      description:
        "See every symbol laid out on checkerboard, light or dark as you edit, with full undo/redo across adds, renames, reorders and removals this session.",
    },
  ],

  benefits: [
    {
      title: "One request instead of dozens",
      description:
        "A sprite sheet collapses many icon requests into a single inline element or cached file, cutting HTTP overhead and letting the browser reuse symbols across the whole page.",
    },
    {
      title: "No build tool, no CLI",
      description:
        "Get the svg-sprite / gulp-svgstore result without installing anything. Drop your files, get a sprite and snippets you can paste straight into any framework or plain HTML.",
    },
    {
      title: "Recolor from CSS",
      description:
        "Because symbols keep their markup, icons drawn with currentColor take their color from the surrounding text, one sprite, infinite themes, no re-export.",
    },
    {
      title: "Private and offline",
      description:
        "Parsing, id sanitising and stitching all run on your device. Your icons and their names never leave the tab, so it works offline and leaves nothing behind.",
    },
  ],

  howTo: [
    {
      title: "Add your SVGs",
      description:
        "Drop a folder of icons, click to browse, or paste SVG markup. Each file is parsed and added to the list with an id taken from its name.",
    },
    {
      title: "Name and order them",
      description:
        "Rename an icon to set its <use> id, reorder to control symbol sequence, and remove any you don't want. Ids are sanitised and de-duplicated automatically.",
    },
    {
      title: "Check the preview",
      description:
        "See every symbol rendered together on a checkerboard, light or dark surface to confirm they line up and read at size.",
    },
    {
      title: "Copy the sprite & snippets",
      description:
        "Copy the sprite markup to inline it, or grab the per-icon <use> snippets to reference symbols. The snippets match the ids you set.",
    },
    {
      title: "Download the sprite file",
      description:
        "Download a standalone sprite.svg to serve and reference with <use href=\"sprite.svg#id\">. Everything is generated in your browser.",
    },
  ],

  formats: {
    input: ["SVG"],
    output: ["SVG"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Bundle a UI icon set",
      description:
        "Fold the twenty icons your app actually uses into one sprite, reference each with <use>, and drop a pile of network requests to a single cached file.",
    },
    {
      audience: "Design systems engineer",
      title: "Ship a versioned icon sprite",
      description:
        "Turn an approved icon export into a named, currentColor-ready sprite that consumers pull with stable <use href=\"#id\"> handles across every product surface.",
    },
    {
      audience: "Email & CMS author",
      title: "Inline a small icon library",
      description:
        "Paste a handful of SVGs, get one inline sprite plus snippets, and reuse the same symbols throughout a template without re-embedding markup each time.",
    },
    {
      audience: "Open-source maintainer",
      title: "Generate a demo sprite fast",
      description:
        "Skip wiring svg-sprite into the docs build: drop the icons, copy the sprite, and paste a working <use> example straight into the README or Storybook.",
    },
  ],

  troubleshooting: [
    {
      problem: "My icon shows up blank when I <use> it.",
      solution:
        "The most common cause is a missing or wrong viewBox on the source SVG, so the symbol has no coordinate space. Make sure each source has a viewBox. The tool preserves it, but it can't invent one. Also confirm the <use href=\"#id\"> id matches the symbol id exactly.",
    },
    {
      problem: "I renamed two icons the same thing.",
      solution:
        "Ids are sanitised and de-duplicated automatically: the second gets a numeric suffix (icon, icon-1). Rename one of them if you want a specific, readable handle instead of the auto-suffixed one.",
    },
    {
      problem: "The icon won't change color with CSS.",
      solution:
        "Recoloring only works if the source uses fill=\"currentColor\" (or no fill) rather than a hard-coded hex. Run the icons through the SVG Color Editor to switch fills to currentColor before building the sprite.",
    },
    {
      problem: "A file was rejected on import.",
      solution:
        "Only valid <svg> markup is accepted, a file whose contents aren't a real SVG element is skipped. Open it to confirm it starts with <svg …> and isn't an image with an.svg extension.",
    },
  ],

  tips: [
    "Name icons the way you'll reference them, the file name becomes the id, so home.svg gives you <use href=\"#home\">.",
    "Author or convert icons to fill=\"currentColor\" first so one sprite recolors per context from CSS.",
    "Keep every source's viewBox intact. It's what lets a single <use> scale each symbol correctly.",
    "For an external sprite, download sprite.svg and reference it as <use href=\"sprite.svg#id\"> to cache it once across pages.",
    "Optimize each icon in the SVG Optimizer before spriting to keep the combined file lean.",
  ],

  security:
    "Every sprite is built in your browser, parsing each SVG, sanitising ids and stitching the <symbol> markup all run locally on your device. Your icons, their file names and where the sprite is headed never leave the tab. Nothing is uploaded, stored or logged, it works offline, and closing the tab leaves no trace.",

  faq: [
    {
      question: "What is an SVG sprite and why use one?",
      answer:
        "An SVG sprite is a single SVG that holds many icons as <symbol> blocks, each referenced elsewhere with a tiny <use href=\"#id\">. Instead of one request or one inline blob per icon, the browser loads or renders the set once and reuses the symbols across the page. That means fewer HTTP requests, better caching, less duplicated markup, and icons that stay crisp and re-colorable.",
    },
    {
      question: "How do I reference an icon from the sprite?",
      answer:
        "Give the <use> element the symbol's id: <svg><use href=\"#home\"></use></svg>. If you inline the sprite in the page, that's all you need. If you serve the sprite as a separate file, reference it as <use href=\"sprite.svg#home\">. The tool writes the exact snippet for every symbol so you can copy and paste it.",
    },
    {
      question: "How are the icon ids chosen?",
      answer:
        "Each id comes from the icon's file name (or whatever you rename it to), lowercased and sanitised to a valid token, spaces and punctuation become hyphens. If two icons would end up with the same id, the tool auto-suffixes the later one (home, home-1) so references never collide.",
    },
    {
      question: "Can I inline the sprite or serve it as a file?",
      answer:
        "Both. Copy the sprite markup and paste it once near the top of your <body> to inline it, then reference symbols with <use href=\"#id\">. Or download sprite.svg, serve it, and reference it with <use href=\"sprite.svg#id\"> so it's cached once and shared across pages.",
    },
    {
      question: "Will my icons still be re-colorable?",
      answer:
        "Yes, if the source SVGs use fill=\"currentColor\" (or leave fill unset). Symbols keep their markup, so a currentColor icon inherits color from the surrounding text: perfect for hover states, dark mode and brand accents. Icons with hard-coded hex fills keep those colors. Convert them first with the SVG Color Editor if you want CSS control.",
    },
    {
      question: "Does this replace svg-sprite or gulp-svgstore?",
      answer:
        "For quick, one-off or ad-hoc sprites, yes. You get the same <symbol> output with no install, config or build step. For an automated pipeline that rebuilds on every commit you'll still want a build-tool plugin, but this is ideal for prototyping, small sites, docs and generating a sprite to check into a repo.",
    },
    {
      question: "Is my SVG uploaded to a server?",
      answer:
        "No. Every icon is parsed and stitched into the sprite entirely in your browser. Nothing you drop in is sent anywhere, stored or logged, so it's private by design and works offline, close the tab and there's nothing left behind.",
    },
    {
      question: "Is it free to use commercially?",
      answer:
        "Yes. The sprite is just your own icons recombined: there's no licence attached by the tool, no watermark, sign-up or attribution requirement. Use the output freely in commercial products, client work and open-source projects.",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release: drop multiple SVGs, build a <symbol> sprite with sanitised unique ids, live preview, and copy/download of the sprite plus per-icon <use> snippets.",
    },
    {
      date: "2026-06-26",
      change:
        "Added inline rename and reorder for icons, per-symbol usage snippets, undo/redo across all edits, and keyboard shortcuts for copy, download and reset.",
    },
    {
      date: "2026-06-30",
      change:
        "Added checkerboard/light/dark preview surfaces, a standalone sprite.svg download for external <use href=\"sprite.svg#id\">, and clearer handling of files with missing viewBoxes.",
    },
  ],

  relatedTools: [
    "svg-optimizer",
    "svg-color-editor",
    "svg-to-react",
    "svg-viewer",
    "image-compressor",
  ],
};

export default svgSpriteGenerator;
