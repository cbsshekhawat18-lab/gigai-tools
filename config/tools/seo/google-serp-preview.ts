import type { Tool } from "@/types";

/**
 * Google SERP Preview: the SEO suite's flagship. It renders a pixel-accurate
 * Google desktop + mobile search result from a title, URL and meta description
 * (or from pasted page HTML we parse client-side), with live pixel/length
 * warnings measured the way Google actually truncates, by rendered width, not
 * character count. All copy is unique to SERP snippet previewing and written to
 * rank for the exact queries people search when their titles get cut off in
 * Google.
 */
const googleSerpPreview: Tool = {
  slug: "google-serp-preview",
  title: "Google SERP Preview",
  category: "seo-tools",
  group: "SEO Preview",
  icon: "Search",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  description:
    "Preview exactly how your page appears in Google search (desktop and mobile) as you type your title, URL and meta description, with live pixel-width truncation warnings. Nothing is uploaded.",

  h1: "Google SERP Preview: See Your Search Snippet Before You Publish",
  tagline:
    "Type a title, URL and meta description and watch a pixel-accurate Google result render for desktop and mobile in real time. We warn you the moment Google would truncate your snippet, measured by rendered pixel width, exactly like Google, not a rough character count. Everything runs in your browser.",
  longDescription:
    "The GigAI Google SERP Preview shows you the single thing meta-tag fields never do: how your page will actually look in Google's search results, before you ship it. Type a title, paste your URL and write a meta description, and a faithful Google snippet renders instantly (favicon and breadcrumb row, the blue clickable title, the grey description) for both a desktop result and a mobile result side by side. Because Google cuts titles and descriptions off by rendered pixel width, not character count, we measure your text on a canvas using Google's own fonts and sizes (Arial, ~20px titles / 14px descriptions on desktop, tighter on mobile) and flag the exact point where the ellipsis would appear. That's why a 55-character title full of wide letters like W and M can truncate while a 62-character one full of i's and l's fits fine. A character counter would get both wrong. You also get a live length and pixel readout with green/amber/red guidance, a paste-first mode that extracts the title, description and canonical straight out of any page's HTML using the browser's native parser, one-click copy of an optimized meta block, and shareable links that reopen your exact snippet. Nothing you type is ever uploaded, the whole preview is computed on your device, so you can safely preview unpublished pages, internal URLs and client work with no server in the loop.",

  ctaText: "Preview my snippet",

  /* Title-tag intents ("meta title preview", "title tag length checker")
     deliberately live on meta-title-preview. Keep these two pages from
     cannibalizing each other. This page owns snippet + description intents. */
  keywords: [
    "google serp preview",
    "serp preview tool",
    "google search preview",
    "meta description preview",
    "meta description checker",
    "meta description length checker",
    "meta description length",
    "meta description tester",
    "serp snippet preview",
    "serp snippet optimizer",
    "pixel width serp",
    "google result preview",
    "search snippet simulator",
  ],

  seo: {
    title: "Google SERP Preview, Pixel-Accurate Search Snippet Tool | GigAI Tools",
    description:
      "Free Google SERP preview tool. See your title, URL and meta description as a real desktop + mobile search result with live pixel-width truncation warnings. 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "Ruler",
      title: "Pixel-width truncation, like Google",
      description:
        "Titles and descriptions are measured on a canvas in Google's fonts and sizes, so we warn you at the exact pixel where the ellipsis lands. Not at an arbitrary character count that gets wide and narrow letters wrong.",
    },
    {
      icon: "Smartphone",
      title: "Desktop and mobile at once",
      description:
        "See a full-width desktop result and a narrower mobile result side by side, because Google truncates them at different widths, a title that fits on desktop can still get cut on a phone.",
    },
    {
      icon: "Zap",
      title: "Live as you type",
      description:
        "Every keystroke re-renders the snippet and updates the length, pixel and status readouts instantly, so you can dial a title in to fit without a preview button in the loop.",
    },
    {
      icon: "ClipboardPaste",
      title: "Paste-first HTML extraction",
      description:
        "Have an existing page? Paste its HTML and we pull the title, meta description and canonical URL out of it with the browser's native parser. No live fetch, and an honest note about why we don't run one.",
    },
    {
      icon: "Gauge",
      title: "Length & pixel guidance",
      description:
        "A green/amber/red readout tells you at a glance whether your title (aim ~50–60 chars) and description (~150–160 chars) sit in the sweet spot, are a little short, or risk truncation.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Every measurement and preview is computed on your device. No title, URL or unpublished page is ever uploaded, logged or seen, safe for internal and client work.",
    },
  ],

  benefits: [
    {
      title: "Stop losing clicks to truncated titles",
      description:
        "A snippet that ends in '…' mid-word looks broken and buries your keyword. Seeing the cut-off before you publish lets you front-load what matters and keep the whole promise visible.",
    },
    {
      title: "Trust pixels, not character counts",
      description:
        "Character counters are a rough proxy Google doesn't use. Measuring actual rendered width means you'll never ship a 'safe' 58-character title that Google still clips because it's full of wide letters.",
    },
    {
      title: "Preview unpublished and client pages privately",
      description:
        "Because it's all client-side, you can preview drafts, staging URLs and client work without exposing anything to a third-party server.",
    },
    {
      title: "Write once, check both surfaces",
      description:
        "Over half of Google searches are mobile. Previewing desktop and mobile together means your snippet works everywhere, not just on the screen you happened to write it on.",
    },
  ],

  howTo: [
    {
      title: "Enter title, URL and description",
      description:
        "Type your page title, paste the full URL, and write the meta description in the fields on the left, or load a sample to see how it works.",
    },
    {
      title: "Or paste your page HTML",
      description:
        "Switch to 'Extract from HTML', paste an existing page's source, and we'll pull the title, description and canonical URL straight into the fields for you.",
    },
    {
      title: "Read the live warnings",
      description:
        "Watch the desktop and mobile previews and the length/pixel readouts. Amber means you're near the limit. Red means Google would truncate. Trim until both go green.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy an optimized title + meta description block, download it, or share a link that reopens the tool with your exact snippet pre-filled for a teammate.",
    },
  ],

  formats: {
    input: ["Text", "HTML"],
    output: ["HTML", "TXT"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Optimize a page's snippet before launch",
      description:
        "Draft the title and description, watch the pixel warnings, and front-load the target keyword so the full, compelling snippet shows on both desktop and mobile.",
    },
    {
      audience: "Content writer",
      title: "Write meta that doesn't get cut",
      description:
        "See in real time whether your description reads as a complete thought in the result, instead of trailing off into an ellipsis that kills the click.",
    },
    {
      audience: "Web developer",
      title: "Verify tags on an existing page",
      description:
        "Paste a page's HTML to confirm the title, description and canonical the browser actually sees, and preview how they'll render in search.",
    },
    {
      audience: "Marketing agency",
      title: "Review client snippets privately",
      description:
        "Preview and tune snippets for client pages entirely in-browser, then share a link so the client sees the exact result without any tool account.",
    },
  ],

  troubleshooting: [
    {
      problem: "My title is under 60 characters but the preview still shows it truncated.",
      solution:
        "Google truncates by pixel width, not character count. Titles full of wide letters (W, M, m, capitals) hit the ~600px desktop limit sooner than the '60 chars' rule implies. Trim a few words or swap in narrower phrasing until the title reads 'fits'.",
    },
    {
      problem: "Google shows a different title than the one I set.",
      solution:
        "Google sometimes rewrites titles using your H1, brand name or on-page text when it judges them a better match. This tool previews the title you provide. If Google is overriding it, make your <title> concise, unique and clearly relevant to the page's main heading.",
    },
    {
      problem: "Pasting my URL didn't fetch the page.",
      solution:
        "By design we never fetch live URLs. A browser can't fetch arbitrary sites (CORS blocks it) and we deliberately run no server, for privacy. To pull real tags, use 'Extract from HTML' and paste the page source (View Source / right-click → View Page Source).",
    },
    {
      problem: "My description doesn't appear in the real result.",
      solution:
        "Google frequently generates its own snippet from page content when it better matches the query, so your meta description is a strong suggestion, not a guarantee. Keep it accurate and compelling. This preview shows your intended snippet.",
    },
  ],

  tips: [
    "Front-load your primary keyword in the title so it survives truncation on narrow mobile results.",
    "Watch the pixel readout, not just the character count, wide letters eat the budget faster.",
    "Write descriptions as a complete, click-worthy sentence that still makes sense if the last few words are cut.",
    "Check the mobile preview too: it truncates at a different width, and most searches happen there.",
    "Use 'Extract from HTML' on a live page to confirm the tags the browser actually renders, then tune them here.",
  ],

  security:
    "Every preview, measurement and HTML extraction happens entirely in your browser. Nothing is uploaded to any server. We deliberately do not fetch live URLs, so your titles, descriptions and unpublished or internal pages never leave your device, are never logged, and are never seen by anyone. Close the tab and every trace is gone.",

  faq: [
    {
      question: "How accurate is this Google SERP preview?",
      answer:
        "Very. Instead of counting characters, we measure your title and description on an HTML canvas using the same fonts and sizes Google renders (Arial, ~20px titles and 14px descriptions on desktop, tighter on mobile) and truncate at Google's approximate pixel budgets. That matches how Google actually clips snippets far more closely than a character counter, because wide and narrow letters take different amounts of space.",
    },
    {
      question: "Why does Google cut off my title if it's under 60 characters?",
      answer:
        "Because Google truncates by pixel width, not character count. The common '60 characters' figure is only a rough average. A title packed with wide letters (W, M, capitals) can exceed the ~600-pixel desktop limit at 55 characters, while a title of thin letters (i, l, t) can fit at 65. This tool measures the real width, so it catches truncation a character counter misses.",
    },
    {
      question: "Can I paste a URL and have it load the page automatically?",
      answer:
        "No, and that's intentional. Browsers can't fetch arbitrary third-party pages (CORS blocks it), and we deliberately run no server so your data stays private. Instead, use the 'Extract from HTML' mode: open the page, view its source, paste it in, and we'll parse out the title, meta description and canonical URL client-side with the browser's native parser.",
    },
    {
      question: "What are the ideal title and meta description lengths?",
      answer:
        "Aim for a title of roughly 50–60 characters (under about 600px) and a meta description of roughly 150–160 characters (under about 920–990px). Those are guidelines: the pixel readout in this tool is the real test. Green means you're in the sweet spot, amber means you're near the edge, and red means Google would truncate your snippet.",
    },
    {
      question: "Does the preview show desktop and mobile differently?",
      answer:
        "Yes. Google uses different widths and font sizes on desktop and mobile, so a snippet that fits one can truncate on the other. The tool renders both so you can confirm your title and description work on every surface, important because most searches now happen on mobile.",
    },
    {
      question: "Will Google use exactly the title and description I preview here?",
      answer:
        "Not always. Google may rewrite a title using your H1, brand or on-page text, and it frequently generates its own snippet description from page content when that better matches the query. Your meta tags are strong signals, not guarantees. This tool previews the snippet you intend. Keeping tags concise, unique and relevant makes Google more likely to honour them.",
    },
    {
      question: "Is my data uploaded anywhere?",
      answer:
        "No. All rendering, measuring and HTML parsing happen locally in your browser. No title, URL, description or pasted HTML is ever sent to a server, logged or stored, so you can safely preview unpublished, staging or client pages. When you close the tab, nothing remains.",
    },
    {
      question: "Can I add a favicon and date to the preview?",
      answer:
        "The preview renders the modern Google layout with a favicon chip and breadcrumb row automatically from your URL, and mirrors the description exactly as you write it. The focus is a faithful, distraction-free snippet so you can judge titles and descriptions the way a searcher will actually see them.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: live desktop + mobile Google snippet preview with canvas-measured pixel-width truncation, length/pixel guidance, HTML extraction, copy/download/share, undo/redo and samples.",
    },
    {
      date: "2026-06-25",
      change:
        "Added the 'Extract from HTML' paste mode (title, meta description and canonical parsed client-side) and keyboard shortcuts with an in-tool helper.",
    },
    {
      date: "2026-07-01",
      change:
        "Refined the pixel-width model and mobile budgets, and improved the amber/red guidance thresholds to better match observed Google truncation.",
    },
  ],

  relatedTools: [
    "meta-tag-generator",
    "meta-tag-analyzer",
    "open-graph-preview",
    "url-slug-generator",
    "url-encoder",
  ],
};

export default googleSerpPreview;
