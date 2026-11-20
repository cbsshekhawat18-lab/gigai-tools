import type { Tool } from "@/types";

/**
 * Open Graph Preview: the "how does my link look when shared" tool. Two ways
 * in: paste a page's HTML (we parse the og and twitter tags with the browser's
 * native DOMParser) or type the fields yourself. Either way you get a live,
 * pixel-faithful Facebook and LinkedIn share card plus an honest missing-tag
 * audit. Unlike the Open Graph Generator (which builds tags), this tool's job
 * is to *inspect and validate* an existing page's social card. All copy is
 * unique to social-share previewing and written to rank for the queries people
 * search when their shared links come out blank, wrong or image-less.
 */
const openGraphPreview: Tool = {
  slug: "open-graph-preview",
  title: "Open Graph Preview",
  category: "seo-tools",
  group: "SEO Preview",
  icon: "Share2",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  description:
    "Preview exactly how your link unfurls on Facebook and LinkedIn, paste your page's HTML or type the fields, with a live share card and a plain-English audit of every missing or oversized Open Graph tag. Nothing is uploaded.",

  h1: "Open Graph Preview, See Your Facebook & LinkedIn Share Card Before You Post",
  tagline:
    "Paste a page's HTML or fill in the og: fields and watch a faithful Facebook and LinkedIn share card render in real time, while a live audit flags every Open Graph tag that's missing, empty or the wrong size. Everything runs in your browser: your unpublished pages never leave your device.",
  longDescription:
    "The GigAI Open Graph Preview answers the one question a meta-tag editor can't: when someone shares this link, what will they actually see? Paste a page's HTML and we parse its og:title, og:description, og:image, og:url, og:type and og:site_name, plus the twitter:* fallbacks, with the browser's native DOMParser, then reconstruct the exact card Facebook and LinkedIn would build. Prefer to work forward? Switch to Fields mode and type the values. The card and the audit update on every keystroke. Because the two big feed networks crop and label cards differently: Facebook shows a full-bleed 1.91:1 image with a grey domain bar, LinkedIn a white meta bar with a bold title. We render both so you can confirm your link looks right everywhere it's shared. Alongside the preview sits an honest, actionable audit: it warns when og:image is missing (so the share collapses to a bare text card), when og:title or og:description will be clipped, when og:url isn't an absolute canonical, and when your image is too small or the wrong ratio for the large card. You get one-click copy of a clean, ready-to-paste Open Graph block built from your values, a download, and shareable links that reopen your exact card for a teammate. Crucially, we never fetch live URLs (a browser can't fetch arbitrary sites (CORS blocks it) and we deliberately run no server) so everything you paste or type stays on your device, is never logged, and is safe for staging, login-gated and client work. After you deploy, re-scrape the real URL in Facebook's Sharing Debugger or LinkedIn's Post Inspector so the networks pick up your new tags. This tool is how you get them right first.",

  ctaText: "Preview my share card",

  /* Authoring/preview intents only, the validator/checker/debugger family
     ("open graph validator/checker", "og image checker") deliberately lives on
     social-share-inspector so the two pages never cannibalize each other. */
  keywords: [
    "open graph preview",
    "og preview",
    "facebook share preview",
    "linkedin post preview",
    "social share preview",
    "open graph tester",
    "og image preview",
    "og:image ratio",
    "link preview tester",
    "og:image size",
    "facebook link preview",
    "social card preview",
  ],

  seo: {
    title: "Open Graph Preview, Facebook & LinkedIn Share Card Tester | GigAI Tools",
    description:
      "Free Open Graph preview tool. Paste your HTML or type og: fields to see a live Facebook & LinkedIn share card, with a plain-English audit of missing or oversized og tags. 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "ClipboardPaste",
      title: "Paste HTML or type the fields",
      description:
        "Drop a page's source and we parse its Open Graph and Twitter tags with the browser's native parser, or switch to Fields mode and type og:title, og:description, og:image and og:url yourself, the preview follows either way.",
    },
    {
      icon: "Share2",
      title: "Faithful Facebook & LinkedIn cards",
      description:
        "See both feed cards rendered the way each network really builds them, Facebook's full-bleed image with a grey domain bar, LinkedIn's white meta bar with a bold title, so you catch a broken share on the platform that matters.",
    },
    {
      icon: "TriangleAlert",
      title: "Honest missing-tag audit",
      description:
        "A live checklist flags exactly what's wrong: no og:image (card collapses to text), a clipped title, a missing description, a relative or absent og:url: each with a one-line fix.",
    },
    {
      icon: "Image",
      title: "og:image size & ratio check",
      description:
        "Enter your image dimensions and we verify them against the 1200×630 (1.91:1) large-card ideal, warning when the image is too small to render or a near-square that drops to a tiny thumbnail.",
    },
    {
      icon: "Zap",
      title: "Live as you type",
      description:
        "Every edit re-renders the card and re-runs the audit instantly, so you can tune a title to fit or swap an image and see the result without a preview button in the loop.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "All parsing, previewing and validation happen on your device. No HTML, URL or unpublished page is ever uploaded, logged or seen: safe for staging and client work.",
    },
  ],

  benefits: [
    {
      title: "Never post a blank or image-less link again",
      description:
        "A share with no og:image renders as a bare, low-click text card. Seeing the card before you post (and getting told the image is missing) means your link always unfurls rich and clickable.",
    },
    {
      title: "Check the network your audience actually uses",
      description:
        "Facebook and LinkedIn crop and label cards differently, so a share that looks great on one can break on the other. Previewing both means your link works wherever it lands.",
    },
    {
      title: "Diagnose a broken share without guessing",
      description:
        "When a link unfurls wrong, paste its HTML here to see precisely which tag is missing or malformed, instead of trial-and-error re-scraping in a debugger.",
    },
    {
      title: "Preview drafts and client pages privately",
      description:
        "Because it's all client-side, you can preview unpublished, staging and login-gated pages without exposing anything to a third-party server.",
    },
  ],

  howTo: [
    {
      title: "Paste your page HTML",
      description:
        "In Paste mode, view your page source (Ctrl+U / Cmd+Option+U), copy it and paste it in. We pull out the Open Graph and Twitter tags automatically.",
    },
    {
      title: "Or fill in the og: fields",
      description:
        "Switch to Fields mode to type og:title, og:description, og:image, og:url and og:site_name directly, handy when you're planning a page that doesn't exist yet.",
    },
    {
      title: "Read the card and the audit",
      description:
        "Toggle between Facebook and LinkedIn to see how the card renders on each, and scan the audit for any tag that's missing, clipped or the wrong image size.",
    },
    {
      title: "Copy the fixed Open Graph block",
      description:
        "Copy the clean og: tag block the tool generates from your values, paste it into your page's <head>, deploy, then re-scrape the live URL in each network's official debugger.",
    },
  ],

  formats: {
    input: ["HTML", "Text"],
    output: ["HTML", "TXT"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Validate a page's social card before launch",
      description:
        "Paste the built page's HTML to confirm every Open Graph tag is present and correctly sized, so the share card is rich and on-brand the moment it goes live.",
    },
    {
      audience: "Social media manager",
      title: "Fix a link that unfurls wrong",
      description:
        "When a scheduled post's link preview looks broken, paste the page HTML here to pinpoint the missing or malformed tag, then get it corrected before the post publishes.",
    },
    {
      audience: "Web developer",
      title: "Confirm the tags the browser actually sees",
      description:
        "Paste rendered HTML to check the exact og:* values the DOM exposes: catching a template that duplicates, omits or emits a relative og:url.",
    },
    {
      audience: "Content marketer",
      title: "Plan a share card before the page exists",
      description:
        "Use Fields mode to draft og:title, og:description and an image concept, previewing the Facebook and LinkedIn card while the article is still in the outline stage.",
    },
  ],

  troubleshooting: [
    {
      problem: "My shared link shows no image on Facebook.",
      solution:
        "Your page is almost certainly missing a valid og:image, or the image is too small (Facebook needs at least 200×200, ideally 1200×630). Paste your HTML here to confirm the tag is present and absolute (https://…), add or fix it, then re-scrape the URL in Facebook's Sharing Debugger to clear the old cache.",
    },
    {
      problem: "The preview shows a different title than my page <title>.",
      solution:
        "Social networks prefer og:title over the HTML <title> when both exist. This tool mirrors that: if you set an og:title, the card uses it. To change the card headline, edit og:title specifically, not just <title>.",
    },
    {
      problem: "I pasted my URL but nothing loaded.",
      solution:
        "By design we never fetch live URLs. Browsers can't fetch arbitrary sites (CORS blocks it) and we run no server, for privacy. Switch to Paste mode and paste the page's HTML source, or use Fields mode to enter the values manually.",
    },
    {
      problem: "The card looks right here but still wrong when I actually share it.",
      solution:
        "Networks cache the first scrape of a URL aggressively. After deploying your corrected tags, force a fresh scrape in Facebook's Sharing Debugger and LinkedIn's Post Inspector: that's what refreshes the card they show to everyone.",
    },
  ],

  tips: [
    "Always set an explicit og:image: without it, shares collapse to a low-click, image-less text card.",
    "Use a 1200×630 (1.91:1) image for the large card. Near-square images drop to a tiny thumbnail layout.",
    "Make og:url an absolute, canonical URL: networks use it as the card's identity and cache key.",
    "Set og:title separately from your <title> when you want a punchier headline in the feed.",
    "After you fix tags, re-scrape the live URL in each network's debugger. The card is cached from the first visit.",
  ],

  security:
    "Every preview, parse and audit happens entirely in your browser. Nothing is uploaded to any server. We deliberately do not fetch live URLs, so your HTML, Open Graph fields and unpublished or internal pages never leave your device, are never logged, and are never seen by anyone. Close the tab and every trace is gone.",

  faq: [
    {
      question: "How do I preview my Open Graph tags without a live fetch?",
      answer:
        "Two ways, both fully in-browser. In Paste mode, open your page's source (Ctrl+U / Cmd+Option+U), copy it and paste it in. We parse the og:* and twitter:* tags with the browser's native DOMParser and render the card. In Fields mode, type og:title, og:description, og:image and og:url directly. We never fetch the URL itself, so nothing is uploaded.",
    },
    {
      question: "Why does my shared link have no image?",
      answer:
        "The most common cause is a missing or invalid og:image. Networks need an absolute https URL to an image at least 200×200px, and ideally 1200×630 for the large card. Paste your HTML here: if the audit flags 'Missing og:image', add the tag. If it's present but the share is still blank, the network is showing a cached scrape, refresh it in Facebook's Sharing Debugger.",
    },
    {
      question: "What's the difference between this and the Open Graph Generator?",
      answer:
        "The Open Graph Generator helps you *write* tags from scratch as a form. This Open Graph Preview is for *inspecting and validating* an existing page. Paste its real HTML to see exactly what card it produces and which tags are missing or wrong. Use the generator to author, this to verify. You can copy a corrected block from here too.",
    },
    {
      question: "What is the ideal og:image size?",
      answer:
        "1200×630 pixels (a 1.91:1 ratio) is the sweet spot for the large feed card on Facebook and LinkedIn. The minimum that renders at all is 200×200. Below that, networks skip the image. Near-square images render as a small thumbnail card instead of the large one. Enter your dimensions and the tool checks the ratio for you.",
    },
    {
      question: "Do Facebook and LinkedIn use the same Open Graph tags?",
      answer:
        "Largely yes: both read the standard og:title, og:description, og:image, og:url and og:site_name. They differ in how they lay the card out: Facebook shows a full-bleed image with a grey domain bar, LinkedIn a white meta bar with a bold title. That's why this tool renders both, so you can confirm the same tags look right on each.",
    },
    {
      question: "Will the card here look exactly like the real share?",
      answer:
        "It's a faithful reconstruction of each network's current feed card built from your tags, so it's accurate for judging title, description and image. Networks tweak their layouts over time and may fall back to on-page content, so treat it as a high-fidelity preview, and always re-scrape the live URL in the official debugger after deploying.",
    },
    {
      question: "Is my HTML or data uploaded anywhere?",
      answer:
        "No. All parsing, previewing and auditing run locally in your browser. No HTML, URL, field value or image link is ever sent to a server, logged or stored, so you can safely preview unpublished, staging and client pages. When you close the tab, nothing remains.",
    },
    {
      question: "Why does the preview prefer og:title over my <title>?",
      answer:
        "Because the social networks do. When both an og:title and an HTML <title> exist, Facebook and LinkedIn use the og:title for the share card, falling back to <title> only when og:title is absent. This tool mirrors that precedence so the preview matches what you'll actually see in the feed.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, paste-HTML or type-fields modes driving a live Facebook & LinkedIn share card, a missing-tag audit, og:image size check, and copy/download of a clean Open Graph block.",
    },
    {
      date: "2026-06-27",
      change:
        "Added Twitter/X fallback parsing, an image ratio warning against the 1200×630 ideal, keyboard shortcuts and shareable links that reopen your exact card.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the audit copy with per-issue fixes, improved title/description clip thresholds to match the feed, and polished the empty-state guidance.",
    },
  ],

  relatedTools: [
    "open-graph-generator",
    "twitter-card-generator",
    "meta-tag-analyzer",
    "google-serp-preview",
    "url-encoder",
  ],
};

export default openGraphPreview;
