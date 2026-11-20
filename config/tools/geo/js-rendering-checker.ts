import type { Tool } from "@/types";

/**
 * JS Rendering Checker — "what does a crawler that doesn't run JavaScript
 * see?" Raw-HTML analysis always; exact raw-vs-rendered diff when the user
 * pastes the DevTools DOM alongside.
 */
const jsRenderingChecker: Tool = {
  slug: "js-rendering-checker",
  title: "JS Rendering Checker",
  description:
    "See your page the way AI crawlers see it: without JavaScript. Fetch the raw HTML, count the words that survive, detect client-rendering framework markers, and diff against the rendered DOM to list exactly which content is invisible to GPTBot, ClaudeBot and PerplexityBot.",
  category: "geo-tools",
  group: "AI Readability",
  icon: "MonitorOff",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-08-22",
  serverSide: true,

  h1: "JS Rendering Checker: What Do AI Crawlers See Without JavaScript?",
  tagline:
    "Most AI crawlers do not execute JavaScript. Content your framework injects client-side simply doesn't exist for GPTBot, ClaudeBot, PerplexityBot or the on-demand fetchers reading links your users share. This checker fetches your page's raw HTML (byte-for-byte what those crawlers receive) counts the words that survive, flags the framework markers that reveal client-side rendering, and, when you paste the rendered DOM alongside, produces the exact list of content only a JavaScript-running browser ever sees.",
  longDescription:
    "Googlebot renders JavaScript. Almost nobody else does. OpenAI, Anthropic and Perplexity's crawlers read the raw HTML response and move on, which means a React SPA whose <div id=\"root\"> fills in client-side can rank in Google while being an empty page to every AI system: invisible not by policy but by architecture. The JS Rendering Checker makes that gap measurable. Fetch a URL and it analyzes the raw HTML exactly as served: how many words of real content exist before any script runs, which framework fingerprints are present (Next.js flight data, __NUXT__ payloads, empty SPA mount points, Angular version markers. Each quoted as evidence), how much prose is trapped inside serialized JSON data islands where browsers will unpack it but crawlers won't, and whether a meta robots tag is quietly excluding you from the search indexes AI answers retrieve through. Then the optional second step turns estimate into proof: copy document.documentElement.outerHTML from your live page's DevTools console, paste it beside the raw fetch, and the checker diffs the two: reporting what percentage of your rendered content is invisible to AI crawlers and listing the invisible passages sentence by sentence. We built this because our own FAQ answers failed the test. It's the tool we needed, made public.",

  ctaText: "Check your rendering",

  keywords: [
    "js rendering checker",
    "javascript seo ai crawlers",
    "do ai crawlers run javascript",
    "gptbot javascript rendering",
    "raw html vs rendered dom",
    "spa seo ai",
    "client side rendering seo problem",
    "ai crawler sees empty page",
    "react seo ai crawlers",
    "no javascript content test",
  ],

  seo: {
    title: "JS Rendering Checker: See Your Page as AI Crawlers Do | GigAI Tools",
    description:
      "Free test: how much of your page exists without JavaScript? Fetch the raw HTML AI crawlers receive, detect client-rendering markers, and diff against the rendered DOM. No signup.",
  },

  features: [
    {
      icon: "FileCode2",
      title: "The raw HTML, exactly as a crawler receives it",
      description:
        "Fetched with no JavaScript execution, no rendering, no tricks: byte-for-byte what GPTBot, ClaudeBot and PerplexityBot get, with the surviving word count front and center.",
    },
    {
      icon: "Fingerprint",
      title: "Framework fingerprints with quoted evidence",
      description:
        "Next.js Pages and App Router payloads, Nuxt, SvelteKit, Remix, Angular, Astro islands, empty React mount points, WordPress asset paths. Each detection names the marker it found, and says whether that pattern implies client rendering.",
    },
    {
      icon: "Braces",
      title: "Data-island detection",
      description:
        "Prose trapped in __NEXT_DATA__ and similar serialized JSON is counted separately: the browser turns it into your page, a crawler sees script soup. The word estimate quantifies what's locked up.",
    },
    {
      icon: "GitCompareArrows",
      title: "The exact raw-vs-rendered diff",
      description:
        "Paste the rendered DOM (one DevTools command, shown in the tool) next to the fetched raw HTML and get the precise invisible percentage plus the missing passages, listed sentence by sentence.",
    },
    {
      icon: "SearchX",
      title: "Catches the quiet excluders",
      description:
        "A noindex or nosnippet meta robots tag also removes you from the search indexes AI answers retrieve through: flagged whenever present, because it silently overrides everything else you fix.",
    },
    {
      icon: "ShieldCheck",
      title: "Private by architecture",
      description:
        "URL fetches go through a stateless proxy (fetch, return, discard). Pasted HTML (including internal or staging pages) is analyzed entirely in your browser and never uploaded.",
    },
  ],

  benefits: [
    {
      title: "Find out if your architecture is your SEO problem",
      description:
        "No amount of content optimization helps a page whose content doesn't exist in the HTML. This is the two-minute test that tells you whether to fix words or fix rendering.",
    },
    {
      title: "Evidence you can hand to engineering",
      description:
        "\"AI can't see our site\" starts arguments. \"The raw HTML contains 12 words and here's the diff\" ends them. The report quotes markers and lists invisible passages: a ticket, not a vibe.",
    },
    {
      title: "Know before you migrate",
      description:
        "Comparing a prototype's raw HTML against the current site's is the cheapest possible rendering-strategy review, before the migration ships the regression.",
    },
    {
      title: "Works where crawlers can't reach",
      description:
        "Paste mode analyzes staging, localhost and authenticated pages without anything leaving your browser.",
    },
  ],

  howTo: [
    {
      title: "Fetch your page's raw HTML",
      description:
        "Enter the URL. The proxy fetches it without executing anything and fills the raw pane. This alone yields the word count, framework markers and data-island estimate.",
    },
    {
      title: "Read the verdict",
      description:
        "Words visible without JavaScript, each rendering signal with its evidence, and any meta robots problem, scored 0–100.",
    },
    {
      title: "Optionally: paste the rendered DOM",
      description:
        "On the live page, run copy(document.documentElement.outerHTML) in the DevTools console and paste into the second box.",
    },
    {
      title: "Read the exact diff",
      description:
        "The invisible percentage plus every sentence that exists only after hydration: the precise content AI systems never see.",
    },
    {
      title: "Fix and re-check",
      description:
        "Server-render, pre-render or statically generate the invisible content, then re-run until the diff approaches zero.",
    },
  ],

  formats: {
    input: ["URL", "HTML"],
    output: ["Report"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Diagnose the invisible-content gap",
      description:
        "A site that ranks in Google but never appears in AI answers is the classic symptom. This test confirms or eliminates rendering as the cause in one fetch.",
    },
    {
      audience: "Frontend developer",
      title: "Verify SSR actually ships content",
      description:
        "Frameworks make it easy to believe you're server-rendering while a layout-level 'use client' quietly hollows the HTML. The raw fetch is ground truth.",
    },
    {
      audience: "Content lead",
      title: "Check the pages that matter",
      description:
        "FAQ accordions, tabbed specs, load-more sections: interactive patterns often hide their content client-side. Test the money pages, not just the homepage.",
    },
    {
      audience: "Agency",
      title: "Audit a client's stack in minutes",
      description:
        "The framework fingerprints tell you what you're dealing with before anyone opens the repo, and the diff quantifies how much is at stake.",
    },
  ],

  troubleshooting: [
    {
      problem: "The fetch failed for my URL.",
      solution:
        "Some sites block automated fetches at the firewall (worth noting: that may be blocking AI crawlers too). Fall back to paste: open the page, View Source (Ctrl/Cmd-U), copy everything into the raw pane. That's the same bytes a crawler gets.",
    },
    {
      problem: "My word count is high but the page still doesn't appear in AI answers.",
      solution:
        "Rendering is necessary, not sufficient. Run the full GEO Audit: crawler access (robots.txt/Cloudflare) and content citability are the other usual suspects, and the audit checks all of them in one pass.",
    },
    {
      problem: "The diff flags dynamic content like prices and stock levels.",
      solution:
        "Correct behavior. Those ARE invisible to AI crawlers. Decide whether that matters per content type: a live stock ticker probably doesn't. Your product description and FAQ answers absolutely do.",
    },
    {
      problem: "I use Next.js App Router with server components. Why is it flagged?",
      solution:
        "The flight-data marker indicates the framework, and the checker pairs it with the actual visible word count. If your words are high, the flag reads as informational: the framework is present but server-rendering is doing its job. The word count is the verdict. The marker is context.",
    },
  ],

  tips: [
    "Googlebot renders JavaScript. GPTBot, ClaudeBot, PerplexityBot and the user-fetch bots don't. 'It's fine in Google' proves nothing about AI visibility.",
    "Server-side rendering, static generation and pre-rendering all pass this test: the fix isn't abandoning your framework, it's making it emit HTML.",
    "Check View Source, not DevTools Elements: Elements shows the rendered DOM (after JavaScript), which is exactly the misleading view this tool exists to correct.",
    "Content inside <noscript> is a fallback for humans, not a fix: treat it as a signal that someone knew about the problem.",
    "The pages users most often paste into ChatGPT (docs, pricing, comparisons) are the ones where ChatGPT-User hitting empty HTML hurts most. Test those first.",
  ],

  security:
    "URL fetches pass through our stateless proxy: fetched, returned to your browser, discarded. No URLs or content are stored. Pasted HTML (raw or rendered) never leaves your browser at all, so staging and internal pages are safe to test.",

  faq: [
    {
      question: "Do AI crawlers execute JavaScript?",
      answer:
        "As a rule, no. OpenAI's GPTBot/OAI-SearchBot/ChatGPT-User, Anthropic's ClaudeBot family and PerplexityBot fetch the raw HTML response and parse it as-is. Googlebot is the notable exception (it renders pages in a headless Chromium) which is why a client-rendered site can look healthy in Google Search while being effectively blank to every AI system. This checker shows you the blank.",
    },
    {
      question: "How do I see what my page looks like without JavaScript?",
      answer:
        "Three ways, in increasing rigor: View Source in your browser (Ctrl/Cmd-U) shows the raw HTML. This tool fetches it and MEASURES it, word count, framework markers, trapped-content estimate, and pasting the rendered DOM alongside produces the exact sentence-level diff of what only exists after hydration.",
    },
    {
      question: "What percentage of my page being invisible is acceptable?",
      answer:
        "For the content you want cited: zero. Chrome UI, cookie banners and personalization being client-only is normal and harmless. The tool's diff lists the actual invisible passages, so judge by what's IN the list, not just the percentage: 4% invisible is a disaster if the 4% is your FAQ answers.",
    },
    {
      question: "My site is a React/Vue/Angular SPA. Am I invisible to AI?",
      answer:
        "Not necessarily. It depends on whether the framework emits content as HTML. Next.js/Nuxt/SvelteKit in SSR or SSG mode pass this test. The same frameworks in pure client mode fail it. That's why the checker leads with the measured word count and treats framework markers as evidence, not verdicts.",
    },
    {
      question: "Why does the tool ask me to paste the rendered DOM instead of rendering the page itself?",
      answer:
        "Honesty about architecture: rendering someone else's page with all its scripts requires a headless browser we deliberately don't run (this platform is browser-first and stateless). Your own browser has already done the rendering perfectly: one console command copies the result, and the diff you get is exact rather than simulated.",
    },
    {
      question: "Does content in JSON-LD or data attributes count as visible?",
      answer:
        "JSON-LD is machine-readable by design and crawlers do parse it, but it describes the page, it isn't the content. Prose trapped in framework data islands (__NEXT_DATA__ and friends) is counted separately by the checker: some crawlers salvage obvious strings from it, none do so reliably, and you shouldn't build on 'maybe'.",
    },
    {
      question: "Is this the same as Google's mobile-friendly or rich-results test?",
      answer:
        "No. Those tools render your page with Googlebot's JavaScript execution and check Google-specific features. This checker deliberately does NOT render, because the crawlers it models don't. It's the view Google's tools can't show you: your page as the non-rendering majority of AI crawlers experience it.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: raw-HTML fetch + analysis (visible words, framework fingerprints with quoted markers, data-island prose estimate, meta-robots flags), optional rendered-DOM paste with sentence-level invisibility diff, staging-safe paste mode.",
    },
  ],

  relatedTools: [
    "geo-audit",
    "ai-crawler-access-checker",
    "content-citability-scorer",
    "retrieval-chunk-preview",
  ],

  notFor: [
    {
      text: "It doesn't render your page or execute its JavaScript: that's the point. For the rendered view, your own browser plus one console command supplies it exactly.",
    },
    {
      text: "It doesn't validate HTML syntax. The HTML Validator does that.",
      toolSlug: "html-validator",
    },
  ],
};

export default jsRenderingChecker;
