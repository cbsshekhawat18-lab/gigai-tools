import type { Tool } from "@/types";

/**
 * Social Share Inspector, the deep social-preview DEBUGGER.
 *
 * Distinct from the Meta Tag Analyzer (SEO head audit), Open Graph Preview and
 * Twitter Preview (single-platform card renders): this tool unifies all of them
 * and adds what a debugger needs, live previews across eight platforms, an
 * image validator, the "why is the old preview still cached?" explainer, prioritised
 * diagnostics with cause/impact/fix, structured-data + header analysis, four
 * scores and an exportable report. Paste-first and fully private (see the tool
 * UI + lib/seo-tools/social-inspector).
 */
const socialShareInspector: Tool = {
  slug: "social-share-inspector",
  title: "Social Share Inspector",
  description:
    "See exactly how your page looks when shared on Facebook, LinkedIn, X, WhatsApp, Telegram, Discord, Slack and Teams, and diagnose why the image, title or preview is wrong or out of date. Paste your HTML for a full, private, in-browser report.",
  category: "seo-tools",
  group: "Meta Tags",
  icon: "Radar",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-07-10",

  h1: "Social Share Inspector, Debug Every Social Preview",
  tagline:
    "Not another Open Graph checker. Paste your page's HTML and see precisely how it renders on Facebook, LinkedIn, X (Twitter), WhatsApp, Telegram, Discord, Slack and Microsoft Teams, with an image validator, a cache explainer for stale previews, prioritised fixes, structured-data and header analysis, and a downloadable report. All in your browser.",
  longDescription:
    "The GigAI Social Share Inspector is a debugging tool for anyone whose links don't share the way they should. Paste a page's HTML (or upload the file) and it reconstructs the exact card each major platform will draw (Facebook, LinkedIn, X, WhatsApp, Telegram, Discord, Slack and Teams) using the same Open Graph and Twitter Card fallback logic they do, so you can see the missing image, the truncated title, or the wrong description before you ship. It goes far beyond a tag list: the image inspector loads your og:image and checks it's reachable, served over HTTPS, an absolute URL, big enough (1200×630 is ideal, 200×200 the floor) and not too heavy. The cache explainer answers the question every marketer eventually asks ('I fixed the image, so why does Facebook still show the old one?') by explaining how each platform caches previews and exactly how to force a refresh (Facebook's Sharing Debugger, LinkedIn's Post Inspector, Telegram's @WebpageBot, or a versioned URL). Every problem is presented as a diagnostic with its cause, its real-world impact, a concrete fix, a priority and a difficulty, so a report becomes an ordered to-do list rather than a wall of red. It also validates any JSON-LD structured data, analyzes HTTP response headers you paste (Cache-Control, ETag, security headers), and rolls everything into four scores (social, SEO, image and metadata) that you can export as JSON, CSV or a shareable HTML report. Because it runs on markup you paste, using your browser's own parser, it audits staging builds, login-gated pages and unreleased templates that no crawler could reach, and nothing you paste ever leaves your machine.",

  ctaText: "Inspect social previews",

  /* SOLE owner of the validator/checker/debugger intent family, the
     authoring-side preview tools (open-graph-preview/generator) deliberately
     do NOT carry these, so the pages never cannibalize each other. */
  keywords: [
    "social share inspector",
    "open graph validator",
    "og validator",
    "open graph checker",
    "og checker",
    "open graph debugger",
    "social preview checker",
    "og image checker",
    "facebook share debugger",
    "linkedin post inspector alternative",
    "twitter card validator",
    "why is facebook showing the old image",
    "social media preview tool",
    "link preview checker",
    "share preview debugger",
  ],

  seo: {
    title: "Social Share Inspector. Open Graph Validator & Preview Debugger | GigAI Tools",
    description:
      "Free social share debugger: paste your HTML to preview how links render on Facebook, LinkedIn, X, WhatsApp, Telegram, Discord, Slack & Teams. Validate the og:image, fix stale cached previews, and export a report, 100% in your browser.",
  },

  features: [
    {
      icon: "Eye",
      title: "8 platform previews",
      description:
        "Pixel-faithful cards for Facebook, LinkedIn, X, WhatsApp, Telegram, Discord, Slack and Teams, each built with that platform's own image and fallback rules so you see the real result, not a generic mock.",
    },
    {
      icon: "ImagePlus",
      title: "Share-image inspector",
      description:
        "Loads your og:image and checks it exists, is HTTPS and absolute, meets the 1200×630 recommendation (200×200 minimum), and isn't too heavy, the number-one reason shares render blank.",
    },
    {
      icon: "RefreshCw",
      title: "Cache & stale-preview explainer",
      description:
        "Explains why a platform still shows the old image after you've updated it, and gives the exact refresh path for each network, Sharing Debugger, Post Inspector, @WebpageBot or a versioned URL.",
    },
    {
      icon: "Stethoscope",
      title: "Diagnostics, not just errors",
      description:
        "Every issue comes with its cause, its impact, a concrete fix, a priority and a difficulty, a prioritised action list a developer can clear, instead of a wall of red flags.",
    },
    {
      icon: "Braces",
      title: "Structured data + headers",
      description:
        "Validates JSON-LD schema on the page and, when you paste response headers, analyzes Cache-Control, ETag and security headers, the caching signals behind stale previews.",
    },
    {
      icon: "Download",
      title: "Four scores + exportable report",
      description:
        "Social, SEO, image and metadata scores roll into an overall grade you can export as JSON, CSV or a self-contained HTML report to hand to your team.",
    },
  ],

  benefits: [
    {
      title: "Understand why the wrong image appears",
      description:
        "Between missing tags, relative URLs, non-HTTPS images and platform caches, a broken share has many causes. The inspector pinpoints the exact one and tells you how to fix it.",
    },
    {
      title: "Stop guessing about cached previews",
      description:
        "The most confusing share bug, 'I changed it but Facebook still shows the old one', gets a clear, per-platform explanation and the precise steps to force a refresh.",
    },
    {
      title: "See every platform at once",
      description:
        "Different networks use different images, ratios and character limits. Check all eight in one place instead of posting test links and deleting them.",
    },
    {
      title: "Private by design",
      description:
        "The HTML you paste is parsed locally in your browser and never uploaded, so confidential staging pages, client work and internal tools stay entirely on your machine.",
    },
  ],

  howTo: [
    {
      title: "Get the page's HTML",
      description:
        "Open the page and View Source (Ctrl/Cmd+U), then copy it, or use the one-click 'Grab HTML' bookmarklet for pages whose tags are added by JavaScript. You can also upload an.html file.",
    },
    {
      title: "Paste it in and inspect",
      description:
        "Drop the HTML into the input and the inspector parses it instantly in your browser. No upload, no crawler, no waiting on a server.",
    },
    {
      title: "Flip through the platform previews",
      description:
        "Switch between Facebook, LinkedIn, X, WhatsApp, Telegram, Discord, Slack and Teams to see each card, its warnings and its cache behaviour.",
    },
    {
      title: "Fix the prioritised diagnostics",
      description:
        "Work down the diagnostics from high priority to low. Each explains the cause, the impact and the exact fix: apply them in your template.",
    },
    {
      title: "Re-check, then refresh the caches",
      description:
        "Paste the updated HTML to confirm the scores climb, then use the per-platform refresh steps (Sharing Debugger, Post Inspector, versioned URL) so live shares pick up your changes.",
    },
  ],

  formats: {
    input: ["HTML", "Page source", "HTTP headers"],
    output: ["Report (JSON)", "Report (CSV)", "Report (HTML)"],
  },

  useCases: [
    {
      audience: "Marketer",
      title: "Confirm a campaign link shares perfectly",
      description:
        "Before pushing a launch post, verify the image, headline and description look right on every network your audience uses, and catch a missing twitter:card before it costs clicks.",
    },
    {
      audience: "Developer",
      title: "Debug a broken or blank preview",
      description:
        "A relative og:image, an http:// URL or a duplicate tag can silently break shares. The inspector surfaces the exact cause from the raw HTML in seconds.",
    },
    {
      audience: "SEO specialist",
      title: "Audit social + schema together",
      description:
        "Check Open Graph, Twitter Cards and JSON-LD structured data in one pass, then export a prioritised report for the dev backlog.",
    },
    {
      audience: "Content / social manager",
      title: "Fix a stale cached preview",
      description:
        "When a shared link still shows last month's image, use the cache explainer to understand why and force each platform to re-scrape the updated page.",
    },
  ],

  troubleshooting: [
    {
      problem: "The preview image is blank here but the tag looks correct.",
      solution:
        "The inspector loads the exact og:image URL. If it's a relative path (/img.png), a localhost/staging host, or served over http://, your browser (and the real platforms) can't load it. Use a fully-qualified, public https:// URL and re-check.",
    },
    {
      problem: "It found fewer tags than the page has.",
      solution:
        "It reads the HTML you paste, not the live JavaScript-rendered DOM. If your meta tags are injected client-side, copy the rendered HTML from DevTools (Elements panel) or use the 'Grab HTML' bookmarklet instead of the initial View Source.",
    },
    {
      problem: "I updated my tags but the real platform still shows the old preview.",
      solution:
        "That's a cache, not a tag problem: see the Cache behaviour note on each preview. Re-scrape with Facebook's Sharing Debugger or LinkedIn's Post Inspector, message Telegram's @WebpageBot, or share a URL with a new query parameter to force a fresh unfurl.",
    },
    {
      problem: "Can it inspect a live URL for me?",
      solution:
        "A browser can't fetch another site's HTML or headers directly (cross-origin security blocks it), so the tool is paste-first. Use the one-click 'Grab HTML' bookmarklet or View Source to get the markup. You get the same full analysis, entirely privately.",
    },
  ],

  tips: [
    "Aim for a 1200×630 (1.91:1) og:image: it's the safe size for Facebook, LinkedIn, X and most chat apps.",
    "Always use an absolute, HTTPS og:image URL. Relative or http:// images are the top cause of blank shares.",
    "Set twitter:card to summary_large_image (with twitter:image) so X uses the big card, not the small one.",
    "After changing a share image, re-scrape in each platform's debugger. Caches, not your tags, are usually why old previews persist.",
    "Add og:url (or a canonical) so ?utm_ tracking variants don't create duplicate, fragmented previews.",
  ],

  security:
    "The Social Share Inspector parses the HTML you paste locally with your browser's native DOMParser, and only fetches the og:image you point it at to measure it: nothing you paste is uploaded, stored or logged. That makes it safe for staging builds, login-gated pages and confidential client markup. Close the tab and every trace is gone. (If a future server-side URL fetch is offered, it will be opt-in, clearly labelled, and the fetched page is analyzed and immediately discarded. Never stored.)",

  faq: [
    {
      question: "How is this different from a normal Open Graph checker?",
      answer:
        "Most checkers list your tags or render one Facebook card. The Social Share Inspector is a debugger: it previews eight platforms at once, validates the actual share image, explains why cached previews go stale and how to refresh them, and turns every finding into a prioritised fix with cause, impact and difficulty, plus schema/header analysis and an exportable report.",
    },
    {
      question: "Why does Facebook still show my old image after I changed it?",
      answer:
        "Because Facebook (and LinkedIn, Slack, Teams, WhatsApp…) cache the preview they first scraped for a URL. Updating og:image doesn't refresh their stored copy. Re-scrape the URL in Facebook's Sharing Debugger ('Scrape Again'), use LinkedIn's Post Inspector, or share a versioned URL (add ?v=2) so it's treated as new. The inspector shows the exact steps per platform.",
    },
    {
      question: "Can it check a live URL?",
      answer:
        "Browsers can't fetch another website's HTML or response headers directly, cross-origin security blocks it, so the tool is paste-first, like our other fetch-based SEO tools. Use the one-click 'Grab HTML' bookmarklet or View Source to get the markup and paste it. You get the full analysis, privately, with nothing uploaded.",
    },
    {
      question: "What size should my social share image be?",
      answer:
        "1200×630 pixels (a 1.91:1 ratio) is the reliable choice for Facebook, LinkedIn, X and most chat apps. The minimum most platforms accept is 200×200. Keep it under about 5 MB, serve it over HTTPS, and use an absolute URL. The image inspector checks all of this for you.",
    },
    {
      question: "Which platforms does it preview?",
      answer:
        "Facebook, LinkedIn, X (Twitter), WhatsApp, Telegram, Discord, Slack and Microsoft Teams, each rendered with that platform's own image handling, character limits and fallback behaviour, plus a note on how it caches previews.",
    },
    {
      question: "Does it validate structured data and headers too?",
      answer:
        "Yes. It validates any JSON-LD schema found on the page against Google's expected properties, and when you paste HTTP response headers it analyzes Cache-Control, ETag and security headers, the signals behind stale previews and caching behaviour.",
    },
    {
      question: "Is my HTML sent to a server?",
      answer:
        "No. All parsing, previewing and scoring happen in your browser. The only network request is loading the og:image you ask it to inspect (to measure its size). Nothing you paste is uploaded, stored or logged.",
    },
  ],

  changelog: [
    {
      date: "2026-07-10",
      change:
        "Initial release: paste-HTML social debugger with 8 platform previews (Facebook, LinkedIn, X, WhatsApp, Telegram, Discord, Slack, Teams), image inspector, cache/stale-preview explainer, prioritised diagnostics, JSON-LD + header analysis, four scores and JSON/CSV/HTML report export.",
    },
  ],

  relatedTools: [
    "open-graph-generator",
    "twitter-card-generator",
    "meta-tag-generator",
    "schema-generator",
    "image-resizer",
    "image-compressor",
  ],
};

export default socialShareInspector;
