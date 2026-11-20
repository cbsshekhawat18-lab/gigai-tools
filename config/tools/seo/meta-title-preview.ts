import type { Tool } from "@/types";

/**
 * Meta Title Preview, a focused, single-purpose tool for the one field that
 * most often decides a click: the page title. Type a title and a brand and see
 * a live Google desktop + mobile result render, with the final "Title | Brand"
 * assembled the way Google shows it and a pixel-width truncation warning
 * measured exactly like Google (rendered width, not character count). Every
 * line of copy is unique to title-tag optimisation and brand suffixing so this
 * page ranks on its own intent, distinct from the broader SERP preview and
 * meta-tag generator tools.
 */
const metaTitlePreview: Tool = {
  slug: "meta-title-preview",
  title: "Meta Title Preview",
  description:
    "Type a page title and your brand and see a live Google title preview, desktop and mobile, with exact character and pixel limits and a truncation warning. 100% in your browser.",
  category: "seo-tools",
  group: "Meta Tags",
  icon: "Type",
  accent: "violet",
  status: "live",
  featured: false,
  createdAt: "2026-06-21",

  h1: "Meta Title Preview, See Your Title Tag in Google Before You Publish",
  tagline:
    "Type your page title and brand once and watch the exact Google title render for desktop and mobile in real time. We assemble the final “Title | Brand” string the way Google does and warn you the instant it would be truncated, measured by rendered pixel width, exactly like Google, never a rough character count. Everything runs on your device.",
  longDescription:
    "The GigAI Meta Title Preview zooms in on the single most clicked-on element of a search result, the title tag, and shows you precisely how it will read in Google before you ship it. Type your page title, add your brand, and choose how the two join (a pipe, a dash, an em dash, or no brand at all), and a faithful Google result renders instantly for both desktop and mobile: favicon chip, breadcrumb URL, the blue clickable title and a sample description underneath. Because Google clips titles by rendered pixel width and not character count, we measure your assembled title on a canvas in Google's own font and size (~20px Arial on desktop, tighter on mobile) and flag the exact point where the ellipsis lands, which is why a 55-character title full of wide letters like W and M can truncate while a 62-character one of thin i's and l's fits. You get a live character count, a pixel readout against the desktop and mobile budgets, and green/amber/red guidance, plus a length coach that also warns when a title is too short to earn the click or when the brand suffix is eating the budget your keywords need. Front-load detection nudges your primary keyword ahead of the brand so it survives truncation on mobile. Copy the final title, copy a ready-to-paste `<title>` tag, download it, share a link that reopens your exact setup, or step through undo/redo. All keyboard-driven. Everything is computed locally with the browser's own canvas and parser, so draft titles, unpublished pages and client work never leave your machine.",

  ctaText: "Preview my title",

  keywords: [
    "meta title preview",
    "title tag preview",
    "google title preview",
    "title tag length checker",
    "seo title preview",
    "title tag character limit",
    "title pixel width checker",
    "title pixel checker",
    "title tag checker",
    "title tag optimizer",
    "title tag tester",
    "meta title checker",
    "page title preview",
    "title tag generator",
    "meta title length",
    "brand suffix title",
    "title truncation checker",
  ],

  seo: {
    title: "Meta Title Preview, Title Tag Checker & Pixel Optimizer | GigAI Tools",
    description:
      "Free meta title preview: type a title and brand and see the exact Google title render on desktop and mobile with pixel-width truncation warnings and a copy-ready <title> tag. 100% in-browser.",
  },

  features: [
    {
      icon: "Type",
      title: "Live Google title, desktop & mobile",
      description:
        "Your assembled title renders inside a faithful Google result (favicon, breadcrumb and blue link) for both desktop and mobile at once, so you see the real clickable headline a searcher meets.",
    },
    {
      icon: "Ruler",
      title: "Pixel-width truncation, like Google",
      description:
        "Titles are measured on a canvas in Google's font and size, so we flag the exact pixel where the ellipsis appears. Not an arbitrary character count that gets wide and narrow letters wrong.",
    },
    {
      icon: "Split",
      title: "Smart brand suffixing",
      description:
        "Add your brand and pick the separator (pipe, hyphen, en dash, em dash or none) and we assemble the final “Title | Brand” string exactly as it will appear, counting the suffix against your budget.",
    },
    {
      icon: "Gauge",
      title: "Length & pixel coaching",
      description:
        "A green/amber/red readout shows whether your title sits in the ~50–60 character / ~600px sweet spot, is too short to earn clicks, or risks truncation on desktop or the narrower mobile result.",
    },
    {
      icon: "MoveLeft",
      title: "Keyword front-load check",
      description:
        "We spot when your primary keyword sits behind the brand and nudge you to lead with it, so the words that win the click survive when Google clips the tail on mobile.",
    },
    {
      icon: "Copy",
      title: "Copy title, copy <title>, share",
      description:
        "Copy the finished title text, copy a ready-to-paste <title> tag, download it, share a link that reopens your exact title and brand, or step back through undo/redo: all keyboard-driven.",
    },
  ],

  benefits: [
    {
      title: "Stop losing clicks to a chopped title",
      description:
        "A title that ends in “…” mid-word looks broken and buries your keyword. Seeing the cut-off before you publish lets you trim, reorder or shorten the brand so the whole promise stays visible.",
    },
    {
      title: "Trust pixels, not a character count",
      description:
        "Character counters are a proxy Google never uses. Measuring rendered width means you'll never ship a “safe” 58-character title that Google still clips because it's packed with wide letters.",
    },
    {
      title: "Get the brand suffix right",
      description:
        "Appending your brand is good for recognition but eats budget. The tool shows precisely how much room “ | YourBrand” costs so you can keep it, shorten it, or drop it on long titles.",
    },
    {
      title: "Private by design",
      description:
        "Every measurement and preview is computed in your browser, so draft titles, staging pages and client work are never uploaded, logged or seen by anyone.",
    },
  ],

  howTo: [
    {
      title: "Type your page title",
      description:
        "Enter the title for the page you're optimizing. Watch the live character and pixel readouts and the desktop/mobile preview update on every keystroke.",
    },
    {
      title: "Add your brand and separator",
      description:
        "Type your brand name and choose how it joins the title: pipe, hyphen, en dash, em dash, or leave it off. The final assembled title is what gets measured and previewed.",
    },
    {
      title: "Read the truncation warnings",
      description:
        "Amber means you're near the limit. Red means Google would truncate on that surface. Trim words, shorten the brand or front-load your keyword until desktop and mobile both go green.",
    },
    {
      title: "Copy the title or the <title> tag",
      description:
        "Copy the finished title text or a paste-ready <title> tag, download it, or share a link that reopens the tool with your exact title and brand pre-filled for a teammate.",
    },
  ],

  formats: {
    input: ["Text"],
    output: ["HTML", "TXT"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Dial a title in to fit both surfaces",
      description:
        "Draft several title variants, watch the pixel warnings on desktop and mobile, and pick the one that keeps the target keyword and brand fully visible everywhere.",
    },
    {
      audience: "Content writer",
      title: "Write a headline that survives truncation",
      description:
        "See in real time whether your title reads as a complete, compelling headline in the result rather than trailing off into an ellipsis that kills the click.",
    },
    {
      audience: "Frontend developer",
      title: "Generate a correct <title> tag",
      description:
        "Assemble “Title | Brand” with the right separator and copy a clean, escaped <title> tag straight into your template or head component, instead of hand-writing it.",
    },
    {
      audience: "Marketing agency",
      title: "Standardise title patterns across a site",
      description:
        "Lock a consistent brand suffix and separator, preview each page's title against the same pixel budget, and share links so clients can review the exact snippet.",
    },
  ],

  troubleshooting: [
    {
      problem: "My title is under 60 characters but the preview shows it truncated.",
      solution:
        "Google truncates by pixel width, not character count. Titles full of wide letters (W, M, capitals) hit the ~600px desktop limit sooner than the “60 chars” rule implies. Trim a word, shorten the brand, or swap in narrower phrasing until the title reads “fits”.",
    },
    {
      problem: "Google shows a different title than the one I set.",
      solution:
        "Google sometimes rewrites titles using your H1, brand or on-page text when it judges them a better match. This tool previews the title you provide. Make your <title> concise, unique and clearly relevant to the page's main heading so Google is more likely to honour it.",
    },
    {
      problem: "The brand suffix is pushing my title over the limit.",
      solution:
        "Shorten the brand (many sites use just the primary word), switch to a thinner separator, or drop the brand on long titles. The preview shows exactly how many pixels the suffix costs so you can decide per page.",
    },
    {
      problem: "My keyword gets cut off on mobile but not desktop.",
      solution:
        "Mobile results truncate at a narrower width, so front-load your primary keyword ahead of the brand and any filler. The front-load check will confirm the keyword now leads and survives the narrower mobile budget.",
    },
  ],

  tips: [
    "Front-load your primary keyword before the brand so it survives truncation on narrow mobile results.",
    "Watch the pixel readout, not just the character count, wide letters eat the budget faster.",
    "Keep the brand suffix short (often just the main word) to leave room for the keywords that win the click.",
    "Check the mobile preview too: it truncates at a different width, and most searches happen there.",
    "Aim for roughly 50–60 characters, but treat the green/amber/red pixel status as the real test.",
  ],

  security:
    "Every measurement, title assembly and preview happens entirely in your browser using its native canvas and encoders. Nothing you type is uploaded, stored or logged. We deliberately fetch no live URLs, so draft titles, unpublished pages and client work never leave your device. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is a meta title (title tag) and why does it matter?",
      answer:
        "The meta title, set with the HTML <title> tag, is the clickable blue headline Google shows for your page in search results and the label browsers put on the tab. It's one of the strongest on-page ranking signals and the single biggest driver of whether someone clicks your result, so getting its wording and length right directly affects your traffic.",
    },
    {
      question: "How long should a title tag be?",
      answer:
        "Aim for roughly 50–60 characters, or under about 600 pixels on desktop. But length in characters is only a guide: Google truncates by rendered pixel width, so this tool measures the real width of your specific letters. Green means you're in the sweet spot, amber means you're near the edge, and red means Google would clip your title with an ellipsis.",
    },
    {
      question: "Why does Google cut off my title if it's under 60 characters?",
      answer:
        "Because Google truncates by pixel width, not character count. The “60 characters” figure is a rough average. A title packed with wide letters like W, M and capitals can exceed the ~600-pixel desktop limit at 55 characters, while a title of thin letters like i, l and t can fit at 65. This tool measures actual rendered width, so it catches truncation a character counter would miss.",
    },
    {
      question: "Should I add my brand name to the title?",
      answer:
        "Usually yes: appending “ | Brand” (or with a dash) builds recognition and trust in the result. But the brand costs pixels, so keep it short and put it last, after your keyword. This tool assembles the final “Title | Brand” string for you, counts the suffix against your budget, and lets you switch the separator or drop the brand on titles that run long.",
    },
    {
      question: "What separator should I use between the title and brand?",
      answer:
        "A pipe (|), a hyphen (-), an en dash (–) or an em dash (; ) are all common and Google treats them the same for ranking. Pick one and use it consistently across your site. The em and en dashes look a touch more editorial. The pipe is compact. This tool lets you preview each so you can see which reads best and fits your pixel budget.",
    },
    {
      question: "Does the meta title also set the browser tab and social title?",
      answer:
        "The <title> tag sets the search result headline and the browser tab label. Social platforms use Open Graph (og:title) and Twitter Card tags instead, which can differ from the <title>. This tool focuses on the search title. For social share cards, generate og:title and twitter:title with the meta tag generator so each surface reads well.",
    },
    {
      question: "Will Google use exactly the title I preview here?",
      answer:
        "Not always. Google may rewrite a title using your H1, brand or on-page text when it judges that a better match for the query. Your <title> is a strong signal, not a guarantee. This tool previews the title you intend. Keeping it concise, unique and clearly relevant to the page's main heading makes Google far more likely to honour it.",
    },
    {
      question: "Is my title data uploaded anywhere?",
      answer:
        "No. All measuring, assembling and previewing happen locally in your browser. No title or brand is ever sent to a server, logged or stored, so you can safely preview unpublished, staging or client pages. When you close the tab, nothing remains.",
    },
  ],

  changelog: [
    {
      date: "2026-06-21",
      change:
        "Initial release, live desktop + mobile Google title preview with canvas-measured pixel-width truncation, brand suffixing, length/pixel guidance, copy title / copy <title> / download / share and undo/redo.",
    },
    {
      date: "2026-06-27",
      change:
        "Added the keyword front-load check, per-separator brand assembly (pipe / hyphen / en dash / em dash / none) and keyboard shortcuts with an in-tool helper.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the pixel-width model and mobile budgets and improved the amber/red thresholds to better match observed Google title truncation.",
    },
  ],

  relatedTools: [
    "meta-tag-generator",
    "google-serp-preview",
    "meta-tag-analyzer",
    "url-slug-generator",
    "json-formatter",
  ],
};

export default metaTitlePreview;
