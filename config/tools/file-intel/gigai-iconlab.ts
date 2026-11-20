import type { Tool } from "@/types";

/**
 * GigAI IconLab, an icon SYSTEM builder, not an icon generator.
 *
 * CLAIM DISCIPLINE, same as everywhere on this platform:
 *  • Never "guaranteed copyright-free" or "legally unique". The screening
 *  compares against this family and the supplied references, nothing more,
 *    and the copy says exactly that.
 *  • Honest about where AI sits: the DRAWING is always the deterministic
 *  renderer working from the family DNA; that is the consistency guarantee.
 *    For concepts outside the 98-concept vocabulary, AI proposes the
 *    ARRANGEMENT (which primitives, where), disclosed in the UI, with only the
 *    typed concept name sent to the server. Never files, never the family.
 *  • The vocabulary-first order is a product rule: the built-in concepts always
 *    win, so the common path stays free, instant and offline.
 */
const gigaiIconLab: Tool = {
  slug: "icon-lab",
  title: "GigAI IconLab",
  description:
    "Build your own icon system, define a family's design language once, then keep adding icons that match it, months apart. AI helps with unusual concepts. The drawing is always deterministic.",
  category: "file-intelligence",
  icon: "Shapes",
  accent: "orange",
  processor: "convert",
  status: "live",
  featured: true,
  serverSide: false,
  createdAt: "2026-08-12",

  h1: "GigAI IconLab, Build Your Own Icon System",
  tagline: "Start with one icon. Create an entire family.",
  ctaText: "Build an icon family",
  titleNoun: "GigAI IconLab",
  featuresHeading: "What GigAI IconLab does",

  longDescription:
    "Designing one icon is easy. Designing two hundred that look like they belong together is the actual job, and it is where most icon sets fall apart, the stroke drifts by a quarter unit, corners get rounder over time, the icon someone added in March sits half a pixel off the grid the January icons used. GigAI IconLab solves that by making the family, not the icon, the thing you create. You define a design language once (grid size, stroke width, corner radius, padding, optical weight) and that becomes the family's DNA. Every icon you generate afterwards is drawn from it. Not adjusted towards it, not checked against it afterwards: drawn from it, by a deterministic renderer that has no way to produce an off-grid shape. Come back in six months, open the family, add another icon, and it matches the first one exactly, because the same DNA produced both. You can teach a family its style from icons you already have: drop in a few SVGs and IconLab reads their design rules (grid, stroke, corners, padding, density) and builds the DNA from what it measures. It deliberately does not copy their shapes. A reference teaches a style. It does not donate geometry. Every generated icon is screened against the rest of the family and against your references, and anything too close is automatically redrawn rather than quietly accepted. Ninety-eight interface concepts are built in: mail, calendar, terminal, wallet, fingerprint, and the rest of what a product actually needs, and those are composed by hand and drawn offline, free, instantly. Ask for something outside that set and AI steps in for exactly one job: proposing the arrangement of primitives. Only the concept name you typed is sent to our server (never a file, never your family) and the same deterministic renderer draws the result to your DNA, then the same originality screening judges it. When the set is ready, export it as a real developer package: SVG sources, PNGs at eight sizes, typed React components, Vue SFCs, an SVG sprite, JSON metadata including the family DNA, TypeScript definitions, a generated README and a LICENSE: as one ZIP. Everything else runs in your browser and families are stored on your own device. Move a family to another machine by exporting it as a file.",

  keywords: [
    "icon system builder",
    "create icon set",
    "consistent icon family",
    "svg icon generator",
    "custom icon set",
    "icon design system",
    "make matching icons",
    "export icon package react",
    "svg sprite generator",
  ],

  tags: ["icons", "svg", "design-system", "flagship", "developer"],
  fileTypes: ["svg", "png", "json", "zip"],
  audiences: ["designers", "developers", "product-teams"],

  seo: {
    title: "GigAI IconLab, Build a Consistent Icon System (Free, In-Browser)",
    description:
      "Define your icon family's design language once, then generate matching icons forever. Export SVG, PNG, React, Vue, sprite and TypeScript as one package. Free, nothing uploaded.",
  },

  features: [
    {
      icon: "Dna",
      title: "One design language, reused forever",
      description:
        "Grid, stroke, corner radius, padding and optical weight are stored as the family's DNA. Every icon is drawn from it, so icon #200 matches icon #1 without you adjusting anything.",
    },
    {
      icon: "Ruler",
      title: "On-grid by construction, not by correction",
      description:
        "Icons are composed from primitives and rendered to the family's grid, so an off-grid shape isn't something the tool can produce. Nothing needs snapping back afterwards.",
    },
    {
      icon: "ScanSearch",
      title: "Learns a style from icons you already have",
      description:
        "Drop in a few SVGs and it measures their design rules to build the DNA. It reads the style and never copies the shapes, a reference teaches, it doesn't donate geometry.",
    },
    {
      icon: "Copy",
      title: "Catches near-duplicates and redraws them",
      description:
        "Every icon is compared against the rest of the family and your references. Anything too close is automatically varied and re-checked rather than quietly accepted.",
    },
    {
      icon: "Package",
      title: "A real developer package, not a folder of SVGs",
      description:
        "SVG, PNG at eight sizes, typed React components, Vue SFCs, an SVG sprite, JSON metadata with the DNA, TypeScript definitions, a README and a LICENSE, one ZIP.",
    },
    {
      icon: "Sparkles",
      title: "AI for the long tail, disclosed",
      description:
        "98 concepts are built in and drawn offline. For anything else, AI proposes the arrangement, only the concept name you type is sent, and the same renderer and screening handle the rest.",
    },
    {
      icon: "CloudOff",
      title: "Your families stay on your device",
      description:
        "Families are stored locally and never uploaded. The one thing that can leave is a typed concept name, when the AI composer handles a concept outside the built-in set, said plainly in the workspace.",
    },
  ],

  benefits: [
    {
      title: "The set still matches in six months",
      description:
        "The usual failure is drift: icons added later stop matching the originals. Storing the design language rather than re-deciding it each time removes that failure entirely.",
    },
    {
      title: "You stop configuring and start naming",
      description:
        "After the family exists, adding an icon is typing a word. No stroke width, no grid, no corner radius: the family already answered those.",
    },
    {
      title: "Hand developers something they can install",
      description:
        "Typed components, a sprite, metadata and a README, versioned with the family. Not a zip of loose files someone has to wire up.",
    },
  ],

  howTo: [
    {
      title: "Create a family",
      description:
        "Name it and set the design language, or upload a few SVGs you already like and let IconLab measure the rules from them.",
    },
    {
      title: "Add icons by name",
      description:
        "Type a concept and generate. Style is inherited from the family, so there's nothing else to configure. Category buttons add a whole set at once.",
    },
    {
      title: "Check the family health",
      description:
        "Style, naming and originality are scored across the whole set, so drift shows up as a number rather than a nagging feeling.",
    },
    {
      title: "Export the package",
      description:
        "One ZIP with SVG, PNG, React, Vue, sprite, JSON, TypeScript, README and LICENSE, versioned to match the family.",
    },
  ],

  formats: {
    input: ["SVG", "JSON"],
    output: ["SVG", "PNG", "React", "Vue", "Sprite", "JSON", "TypeScript", "ZIP"],
  },

  useCases: [
    {
      audience: "Product teams",
      title: "An in-house icon set that stays consistent",
      description:
        "Define the language once and let anyone add icons later without a design review to check the stroke width matched.",
    },
    {
      audience: "Developers",
      title: "Typed components straight into the app",
      description:
        "Export React or Vue components with the family's DNA baked in, plus a sprite and TypeScript names for autocomplete.",
    },
    {
      audience: "Designers",
      title: "Auditing a set you inherited",
      description:
        "Import existing SVGs and see how consistent they actually are, stroke, grid and naming scored across the whole set.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says there's no composition for my concept",
      solution:
        "Ninety-eight concepts are built in, plus a wide alias set, \"billing\" finds the card icon, \"cli\" finds the terminal. Outside that, the AI composer proposes an arrangement. Seeing this message means it was offline or couldn't produce one. Try a nearer everyday word, or draw the icon yourself and import the SVG into the family.",
    },
    {
      problem: "An icon was rejected as too similar",
      solution:
        "That means the family already contains something very close, often the same concept under a different name, like \"mail\" and \"email\". IconLab varies the composition and retries automatically. If it still can't clear, it stops and says so rather than adding a near-duplicate you'd have to find later.",
    },
    {
      problem: "My family disappeared",
      solution:
        "Families are stored in this browser, so clearing site data or using a different browser or device won't show them. Use Save family to export a JSON file and Import family to restore it anywhere. That file is also how you share a family with a colleague.",
    },
    {
      problem: "The exported PNGs look soft",
      solution:
        "PNGs are rasterised from the SVG at fixed sizes. Icons designed on a 24px grid are sharpest at 24, 48 and 96. If you need a size in between, use the SVG, it's the source, and it scales perfectly.",
    },
  ],

  tips: [
    "Set the design language once at family creation, That is all there is to it, and every later icon inherits it.",
    "Uploading three or four reference SVGs gives a better DNA than one, because the median is taken rather than a single opinion.",
    "Export the family JSON as a backup before clearing browser data.",
    "Ship the SVG and sprite to production. The PNGs are for places that can't take vectors.",
  ],

  security:
    "Families, icons and versions are stored locally in this browser and are never uploaded, so an unreleased product's icon set doesn't leave your machine. Reference SVGs you upload are parsed to measure their design rules and are not retained. The one network exception is disclosed in the workspace: a concept outside the 98 built-in ones sends the typed concept name, nothing else, to our server, which proposes an arrangement and forgets the request. Generated SVG always comes from a fixed set of primitives drawn by our own renderer. AI proposals are validated twice (server and browser) against that contract before rendering, and never contain markup. Package paths are built from sanitised slugs so nothing you type can escape the archive. Because storage is local, clearing site data removes your families: use Save family to keep a copy.",

  faq: [
    {
      question: "How does it keep 200 icons consistent?",
      answer:
        "By never deciding the style twice. The family stores its design language (grid, stroke, corner radius, padding, optical weight) and every icon is drawn from that same record by a deterministic renderer. It isn't a check applied afterwards. There is no path by which an icon can be produced off-style.",
    },
    {
      question: "Does it copy the reference icons I upload?",
      answer:
        "No. References are measured, not reused. IconLab reads their grid, stroke width, corner radius, padding and density to build the family DNA, then discards the geometry. The reference teaches a style. The shapes it produces are composed independently.",
    },
    {
      question: "Are the icons guaranteed to be original?",
      answer:
        "No tool can promise that, and this one doesn't. Every icon is screened against the others in your family and against the references you supplied, and anything too similar is redrawn automatically. That is a duplicate check against a known set. Not a search of every icon that exists, and not legal clearance. Check anything you intend to ship commercially.",
    },
    {
      question: "Is this AI?",
      answer:
        "The drawing never is. Icons are rendered deterministically from your family's DNA, which is precisely why they stay consistent. A model emitting raw path data is what makes generated icon sets drift. AI has exactly one job here: when you ask for a concept outside the 98 built-in ones, it proposes which primitives to use and where. That proposal is validated, drawn by the same renderer, and screened by the same originality engine. The workspace tells you when AI arranged an icon, and only the concept name you typed was sent to do it.",
    },
    {
      question: "Which concepts can it draw?",
      answer:
        "Ninety-eight core interface concepts are built in (navigation, communication, business, files, developer, security and media) plus a wide alias set, so \"billing\" resolves to the card icon and \"cli\" to the terminal. Those draw offline and free. Concepts outside the set go to the AI composer, which proposes an arrangement from the same primitives. Only the concept name is sent, and the result is screened like everything else. If neither route produces something you like, import your own SVG into the family.",
    },
    {
      question: "Where are my families stored?",
      answer:
        "In this browser, on your device. There are no accounts, and your files and family never leave it. The single exception is small and stated in the workspace: when the AI composer handles a concept outside the built-in set, the concept name you typed is sent to our server, used to compose an arrangement, and forgotten. Export a family as a JSON file to move it, back it up, or share it, importing creates a copy rather than overwriting anything.",
    },
  ],

  changelog: [
    { date: "2026-08-12", change: "AI composer added for concepts beyond the built-in set (arrangement only, name-only sent, disclosed) + per-icon favorite/reject with family memory." },
    { date: "2026-08-12", change: "Vocabulary expanded to 98 hand-composed concepts. Similarity thresholds recalibrated across 4,753 pairs." },
    { date: "2026-08-12", change: "GigAI IconLab released: family DNA, deterministic renderer, originality screening and package export." },
  ],

  relatedTools: ["svg-optimizer", "svg-to-png", "png-to-svg", "gigai-fit"],
};

export default gigaiIconLab;
