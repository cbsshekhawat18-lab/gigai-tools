import type { Tool } from "@/types";

/**
 * Meta Tag Analyzer, the paste-first counterpart to the Meta Tag Generator.
 * Paste a page's raw HTML and it extracts and audits every SEO-relevant tag in
 * the `<head>`: title, description, canonical, robots, viewport, charset,
 * Open Graph and Twitter Card: scoring length, flagging what's missing or
 * duplicated, and showing exactly how the page will look in Google and on
 * social. Everything runs on the pasted markup, in the browser, via the native
 * `DOMParser`. All copy below is unique to *auditing* existing tags (not
 * generating new ones) so the page ranks on its own intent.
 */
const metaTagAnalyzer: Tool = {
  slug: "meta-tag-analyzer",
  title: "Meta Tag Analyzer",
  description:
    "Paste a page's HTML to audit its title, description, canonical, robots, Open Graph and Twitter Card tags: with a length score, missing/duplicate checks and a live search & social preview, 100% in your browser.",
  category: "seo-tools",
  group: "Meta Tags",
  icon: "ScanSearch",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Meta Tag Analyzer, Audit Your SEO, Open Graph & Twitter Tags",
  tagline:
    "Paste a page's HTML and get an instant, honest audit of every meta tag that matters, title and description length, canonical, robots, viewport, charset, Open Graph and Twitter Card, scored, prioritised, and shown exactly as Google and social networks will render it.",
  longDescription:
    "The GigAI Meta Tag Analyzer reads the `<head>` of any page you paste and turns it into a clear, prioritised report card. It extracts the `<title>`, meta description, canonical link, robots directive, viewport, charset, language, keywords and favicon, plus the full Open Graph and Twitter Card blocks, then checks each against current best practice: is the title in the 50–60 character sweet spot or will it be truncated? Is the description present and the right length? Is there exactly one title and one description, or has a template accidentally emitted duplicates? Is the page quietly set to `noindex`? Does it have the og:title and og:image needed for a rich share card? Each check comes back as pass, warning or fail with a plain-English fix, and the whole page rolls up into a 0–100 score and letter grade so you know at a glance whether the head is ship-ready. To make the abstract concrete, the analyzer also renders a pixel-accurate Google snippet and faithful social cards from the tags it found, so you can *see* the truncation or the missing image rather than just read about it. Because it works on markup you paste (using the browser's own parser, with no network calls) it happily audits staging pages, password-protected sites, competitor HTML you copied, or a template you haven't shipped yet, and nothing you paste ever leaves your machine.",

  ctaText: "Analyze meta tags",

  keywords: [
    "meta tag analyzer",
    "meta tag checker",
    "seo meta tag audit",
    "check meta tags",
    "og tag analyzer",
    "html head audit",
    "analyze meta tags",
    "website meta tag report",
    "seo head inspection",
  ],

  seo: {
    title: "Meta Tag Analyzer: Audit SEO, Open Graph & Twitter Tags | GigAI Tools",
    description:
      "Free meta tag analyzer: paste your HTML to audit title, description, canonical, robots, Open Graph and Twitter Card tags. Get a length score, missing/duplicate checks and a live preview. Nothing is uploaded.",
  },

  features: [
    {
      icon: "ScanSearch",
      title: "Full head extraction",
      description:
        "Pulls the title, description, canonical, robots, viewport, charset, language, keywords, favicon and every Open Graph and Twitter Card property out of the HTML you paste: in one pass, with the native parser.",
    },
    {
      icon: "Ruler",
      title: "Length scoring you can trust",
      description:
        "Grades your title against the 50–60 character window and description against 150–160, telling you precisely when copy is too short to earn clicks or long enough to be truncated in search.",
    },
    {
      icon: "TriangleAlert",
      title: "Missing & duplicate detection",
      description:
        "Flags an absent description, missing viewport or charset, a stray noindex, and (the sneaky ones) more than one <title> or duplicate meta description that a template accidentally emitted.",
    },
    {
      icon: "Share2",
      title: "Social card audit",
      description:
        "Checks for the og:title and og:image a rich Facebook/LinkedIn preview needs and whether a twitter:card type is set, so shared links never render as a plain, image-less box.",
    },
    {
      icon: "Eye",
      title: "Live search & social preview",
      description:
        "Rebuilds a pixel-accurate Google snippet and Facebook/X/LinkedIn cards from the tags it found, so you see the real truncation or the missing image instead of guessing from raw markup.",
    },
    {
      icon: "ListChecks",
      title: "Scored, prioritised report",
      description:
        "Every check is pass, warn or fail with a specific fix, rolled into a 0–100 score and letter grade, copy or export the whole report to hand to a developer or drop into a ticket.",
    },
  ],

  benefits: [
    {
      title: "Find the SEO tag problems you can't see",
      description:
        "A duplicate title, a template-injected noindex or a missing canonical won't show in the browser, but they quietly wreck rankings, the analyzer surfaces them from the raw HTML in seconds.",
    },
    {
      title: "Audit any page, even ones you can't fetch",
      description:
        "Because it works on pasted markup, you can check a staging build, a login-gated page, a competitor's head you copied, or a template that isn't live yet. No crawler and no server required.",
    },
    {
      title: "Turn a report into an action list",
      description:
        "Each finding comes with a concrete fix and a severity, so instead of a vague 'improve SEO' you get an ordered checklist a developer can clear in one sitting.",
    },
    {
      title: "Private by design",
      description:
        "The HTML you paste is parsed locally in your browser and never uploaded, so confidential staging pages, client work and internal tools stay entirely on your machine.",
    },
  ],

  howTo: [
    {
      title: "Grab the page's HTML",
      description:
        "Open the page, view source (or right-click → View Page Source / Ctrl+U) and copy it, or just copy the <head> section. You can also copy rendered HTML from your framework or CMS.",
    },
    {
      title: "Paste it into the analyzer",
      description:
        "Drop the HTML into the input pane. The audit runs automatically and debounced as you paste, entirely in your browser, or click Load sample to see a worked example first.",
    },
    {
      title: "Read the score and checks",
      description:
        "Scan the 0–100 score and grade, then work down the pass/warn/fail checklist. Each row explains what was found and how to fix anything flagged.",
    },
    {
      title: "Confirm with the live preview",
      description:
        "Check the reconstructed Google snippet and social cards to see the real-world impact, a truncated title, a missing description or an absent share image.",
    },
    {
      title: "Fix and re-paste",
      description:
        "Apply the fixes in your template, paste the updated HTML back in, and watch the score climb to confirm every issue is resolved before you ship.",
    },
  ],

  formats: {
    input: ["HTML", "Page source"],
    output: ["Audit report", "Score"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Audit a page before and after a change",
      description:
        "Paste the current head, capture the baseline score and issues, then re-paste after the dev fix to prove the title length, canonical and social tags are all correct now.",
    },
    {
      audience: "Frontend developer",
      title: "Sanity-check a template's rendered head",
      description:
        "Copy the rendered HTML from your framework and confirm the template isn't emitting a duplicate title, dropping the viewport, or leaving og:image empty across the whole site.",
    },
    {
      audience: "Content lead / marketer",
      title: "Verify a new post's snippet and share card",
      description:
        "Before promoting a post, paste its HTML to confirm the description isn't truncated and that the Open Graph image and title will produce a clean social preview.",
    },
    {
      audience: "Agency / freelancer",
      title: "Run a quick meta audit for a client",
      description:
        "Paste each key page's source, export the scored report, and deliver a prioritised, developer-ready list of exactly which tags to fix and why.",
    },
  ],

  troubleshooting: [
    {
      problem: "The analyzer shows fewer tags than I expected.",
      solution:
        "It reads the HTML you paste, not the live, JavaScript-rendered DOM. If your meta tags are injected client-side (e.g. by a SPA at runtime), copy the rendered source from your browser's Elements/DOM inspector rather than the initial View Source, so the runtime-added tags are included.",
    },
    {
      problem: "It says no meta tags found, but the page clearly has them.",
      solution:
        "Make sure you pasted the HTML source and not the rendered page text. You need the actual markup containing <title>, <meta> and <link> elements: copy from View Page Source or your DevTools, not by selecting and copying the visible page.",
    },
    {
      problem: "My Open Graph image is fine but the preview here is blank.",
      solution:
        "The preview loads the exact og:image URL from your HTML. If it's a relative path, a localhost URL or a private/staging host, your browser can't fetch it here. The tag can still be correct. Use a fully-qualified, publicly reachable https image URL for production.",
    },
    {
      problem: "The score seems low even though the tags look okay.",
      solution:
        "Open each check row, the score weights title/description length, a present canonical, viewport, charset, a non-noindex robots directive, and the social tags. A warn (e.g. a slightly long title or a missing canonical) lowers the score even when nothing is outright broken.",
    },
  ],

  tips: [
    "Audit the rendered head from DevTools for SPAs, the initial HTML source often lacks tags your JavaScript injects at runtime.",
    "Watch for two <title> tags: a layout and a page component both emitting one is a common, invisible duplicate that this tool catches.",
    "A missing canonical is a warning, not an error, but adding one on every page prevents duplicate-content dilution from query strings and www variants.",
    "If a page you want indexed scores a hard fail on robots, search for a stray noindex in the template or a CMS setting before anything else.",
    "Re-paste after every fix. Watching the score climb is the fastest way to confirm you actually resolved each flagged issue.",
  ],

  security:
    "The Meta Tag Analyzer parses the HTML you paste locally in your browser with its native DOMParser: nothing is uploaded, stored or logged. That makes it safe to audit staging builds, login-gated pages, unreleased templates or confidential client markup. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What does a meta tag analyzer actually check?",
      answer:
        "It extracts and audits the SEO-critical tags in your page's <head>: the title and meta description (including their length), the canonical link, robots directive, viewport, charset and language, plus the Open Graph and Twitter Card tags used for social sharing. Each is checked for presence, correctness and length, then scored and explained with a fix.",
    },
    {
      question: "Can it analyze a live URL for me?",
      answer:
        "No, and that's deliberate. Fetching a live URL requires a server and runs into CORS and privacy limits, so this tool is paste-first: it audits the HTML you paste, entirely in your browser. Open the page, view its source, copy it, and paste it here. The upside is you can audit pages a crawler could never reach, like staging or login-gated builds.",
    },
    {
      question: "How do I get my page's HTML to paste?",
      answer:
        "In any browser, right-click the page and choose 'View Page Source' (or press Ctrl+U / Cmd+Option+U), then select all and copy. For pages whose tags are added by JavaScript, copy the rendered HTML from the Elements/DOM panel in DevTools instead so the runtime-injected tags are included. You can paste the whole document or just the <head>.",
    },
    {
      question: "What's the ideal title and description length?",
      answer:
        "Google truncates by rendered pixel width, but as a reliable rule keep titles to roughly 50–60 characters and descriptions to 150–160. The analyzer measures your actual lengths and warns when a title is too short to earn clicks or long enough to be cut off, and shows the truncation in a live Google snippet preview.",
    },
    {
      question: "Why does it flag duplicate title or description tags?",
      answer:
        "Search engines expect exactly one <title> and one meta description per page. Frameworks and CMS templates sometimes emit two (a layout and a page component both setting a title, for example) which is invisible in the browser but confuses crawlers. The analyzer counts them and flags any duplicates so you can remove the extra.",
    },
    {
      question: "What does a 'noindex' warning mean?",
      answer:
        "A robots meta of noindex tells search engines not to index the page, so it won't appear in results. That's correct for admin, thank-you or staging pages, but a hard problem if a page you want ranked is accidentally set to noindex, often by a leftover template default or CMS toggle. The analyzer surfaces it as a fail so you can catch it fast.",
    },
    {
      question: "Does it check Open Graph and Twitter Card tags?",
      answer:
        "Yes. It verifies the og:title and og:image a rich Facebook/LinkedIn preview needs and whether a twitter:card type is set, then reconstructs the actual share cards so you can see whether a link will render with an image and headline or fall back to a plain box.",
    },
    {
      question: "Is my HTML sent to a server?",
      answer:
        "No. All parsing, scoring and previewing happen in your browser using its native DOMParser: nothing you paste is uploaded, stored or logged. It's safe to audit confidential, internal or unreleased pages, and closing the tab erases everything.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: paste-HTML meta audit covering title, description, canonical, robots, viewport, charset, Open Graph and Twitter Card, with a 0–100 score, grouped checklist and copy/export.",
    },
    {
      date: "2026-06-24",
      change:
        "Added duplicate <title> and meta-description detection, per-check fix guidance, and a live Google snippet plus Facebook/X/LinkedIn card preview reconstructed from the found tags.",
    },
    {
      date: "2026-06-30",
      change:
        "Added an extracted-tags summary panel, language/favicon/keywords extraction, and a real-world sample so you can see a full audit in one click.",
    },
  ],

  relatedTools: [
    "meta-tag-generator",
    "google-serp-preview",
    "open-graph-generator",
    "schema-generator",
    "json-formatter",
  ],
};

export default metaTagAnalyzer;
