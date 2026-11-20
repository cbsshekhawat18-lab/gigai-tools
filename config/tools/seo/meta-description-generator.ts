import type { Tool } from "@/types";

/**
 * Meta Description Generator, a focused writing workspace for the single most
 * click-critical line of markup on any page: the `<meta name="description">`.
 * It pairs a distraction-free editor with a live character + pixel meter and a
 * pixel-accurate Google SERP snippet, plus intent-based templates you can drop
 * in and rewrite. Every line of copy below is unique to *description writing*
 * (not tag generation, analysis or previews) so the page ranks on its own
 * merits rather than cannibalising its sibling tools.
 */
const metaDescriptionGenerator: Tool = {
  slug: "meta-description-generator",
  title: "Meta Description Generator",
  description:
    "Write a click-worthy SEO meta description with a live character + pixel meter, a real Google snippet preview and ready-to-edit templates, copy the tag, 100% in your browser.",
  category: "seo-tools",
  group: "Meta Tags",
  icon: "Text",
  accent: "violet",
  status: "live",
  createdAt: "2026-06-19",

  h1: "Meta Description Generator: Write Descriptions Google Won't Cut Off",
  tagline:
    "Draft the meta description that wins the click. A live character and pixel meter shows exactly where Google truncates, a real search snippet renders as you type, and intent-based templates give you a proven first line to rewrite in your own voice.",
  longDescription:
    "The GigAI Meta Description Generator is built for one job and does it exceptionally well: helping you write the ~155-character summary Google shows under your title in search results. Instead of guessing at character counts, you get a live dual meter (characters and estimated rendered pixel width) that turns amber as you approach the limit and red once your copy will be clipped with an ellipsis, measured the way Google actually truncates rather than by a naïve character cap. A pixel-accurate desktop and mobile SERP preview renders your title, URL and description together, so you see the finished result and can tune the sentence until the meaning survives even if the tail gets cut. To get you moving fast, a library of intent-based templates (blog post, product page, category, local business, homepage, comparison, how-to and more) drops a strong, on-pattern first draft into the editor for you to personalise, and a keyword field highlights whether your target term actually appears. When you're happy, copy the finished `<meta name=\"description\">` tag, copy just the raw text, download an HTML snippet, share a link that reopens your draft, or step back through undo/redo. Everything runs locally with the browser's own encoders, so unpublished copy, internal URLs and draft campaigns never leave your device.",

  ctaText: "Write a meta description",

  keywords: [
    "meta description generator",
    "meta description writer",
    "seo description generator",
    "meta description character counter",
    "meta description pixel width",
    "google snippet description",
    "meta description examples",
    "meta description templates",
    "how long should a meta description be",
    "write meta description",
    "meta description tag generator",
  ],

  seo: {
    title: "Meta Description Generator, Length Meter & SERP Preview | GigAI Tools",
    description:
      "Free meta description generator with a live character + pixel meter, real Google snippet preview and intent-based templates. Write descriptions Google won't truncate. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Ruler",
      title: "Live character + pixel meter",
      description:
        "A dual readout counts characters and estimates rendered pixel width the way Google truncates, shifting from green to amber to red so you know the exact moment your copy will be cut with an ellipsis.",
    },
    {
      icon: "Search",
      title: "Pixel-accurate SERP preview",
      description:
        "Your title, URL and description render as a real desktop and mobile Google result as you type, so you judge the finished snippet, not a raw character count, before you ship it.",
    },
    {
      icon: "LayoutTemplate",
      title: "Intent-based templates",
      description:
        "Drop in a proven first draft for a blog post, product, category, local business, homepage, comparison or how-to page, then rewrite it in your own voice. No blank-page paralysis.",
    },
    {
      icon: "Target",
      title: "Target keyword check",
      description:
        "Enter the keyword you want to rank for and the tool flags whether it actually appears in your description, nudging you to work it in naturally without stuffing.",
    },
    {
      icon: "Copy",
      title: "Copy the tag or the text",
      description:
        "Copy a ready-to-paste <meta name=\"description\"> tag, copy just the raw sentence for a CMS field, download an HTML snippet, or share a pre-filled link, all keyboard-driven.",
    },
    {
      icon: "ShieldCheck",
      title: "Private and offline-capable",
      description:
        "Escaping and previewing happen entirely in your browser, so draft copy, unpublished URLs and confidential campaigns never touch a server or get logged anywhere.",
    },
  ],

  benefits: [
    {
      title: "Earn the click, not just the ranking",
      description:
        "Ranking gets you onto the page. A sharp, benefit-led description is what makes someone choose your result over the nine others. Seeing the live snippet helps you write for the human, not the crawler.",
    },
    {
      title: "Never get truncated again",
      description:
        "The pixel meter is measured against Google's real limits, so you stop losing your call-to-action to an ellipsis and start front-loading the words that matter.",
    },
    {
      title: "Go from blank page to draft in seconds",
      description:
        "Intent templates give you a strong, on-pattern opening line to react to and refine, which is far faster than staring at an empty box hoping for the perfect sentence.",
    },
    {
      title: "Stays completely private",
      description:
        "Because everything runs locally in your browser, you can safely draft descriptions for unreleased products, internal tools or embargoed campaigns without anything leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Start from a template or blank",
      description:
        "Pick the template that matches your page (blog post, product, category, local business and more) to drop in a first draft, or start typing from scratch in the editor.",
    },
    {
      title: "Write to the meter",
      description:
        "Craft your sentence while the character and pixel meter keeps you inside Google's limit. Aim for roughly 150–160 characters and front-load your primary keyword and hook.",
    },
    {
      title: "Check the live snippet",
      description:
        "Add your page title and URL and read the desktop and mobile SERP preview to confirm the whole result reads well and nothing important gets clipped.",
    },
    {
      title: "Copy or download the result",
      description:
        "Copy the ready-to-paste meta tag, copy just the text for your CMS, download an HTML snippet, or share a link that reopens your draft exactly as you left it.",
    },
  ],

  formats: {
    input: ["Text", "Template"],
    output: ["HTML", "Meta tag", "Plain text"],
  },

  useCases: [
    {
      audience: "Content writer / blogger",
      title: "Give every post a description that converts",
      description:
        "Start from the blog-post template, weave in the article's promise and primary keyword, and confirm it fits the snippet, so each post earns clicks instead of inheriting a truncated first paragraph.",
    },
    {
      audience: "E-commerce / SEO manager",
      title: "Ship product & category descriptions at scale",
      description:
        "Use the product and category templates to produce consistent, benefit-led descriptions across a catalogue, checking each one stays within the pixel budget before it goes live.",
    },
    {
      audience: "Local business owner",
      title: "Nail a location-rich description",
      description:
        "The local-business template helps you fit your service, city and a call-to-action into the snippet, so searchers see exactly why to call you before they click.",
    },
    {
      audience: "Agency / freelancer",
      title: "Draft and hand off polished copy",
      description:
        "Write client descriptions that fit Google's limits, then share a pre-filled link so anyone can review, tweak or approve the wording without installing anything.",
    },
  ],

  troubleshooting: [
    {
      problem: "Google is showing a different description than the one I wrote.",
      solution:
        "Google frequently rewrites descriptions to better match a specific query, especially for long-tail searches. Your tag is still a strong signal. Make it a compelling, self-contained summary of the page's main intent, and Google is more likely to use it verbatim for your core keywords.",
    },
    {
      problem: "My description is flagged red even though the character count looks fine.",
      solution:
        "Google truncates by rendered pixel width, not characters, and capital letters and wide characters (W, M, m) take more space. The pixel meter reflects this, so trust it over a raw count, shorten the sentence or swap wide words to bring it back under budget.",
    },
    {
      problem: "Should every page have a unique meta description?",
      solution:
        "Ideally yes, duplicate descriptions across many pages weaken each snippet and can trigger Google to ignore them entirely. For very large, templated sites it's fine to auto-generate descriptions from page data, but keep each one distinct and relevant to that page.",
    },
    {
      problem: "Do I need a description on pages I don't want in search?",
      solution:
        "No. If a page is set to noindex it won't appear in results, so its description is irrelevant there. Spend your effort on the pages you do want ranking. This tool is for crafting those money snippets.",
    },
  ],

  tips: [
    "Front-load your primary keyword and the main benefit: the end of a long description is the first thing Google clips.",
    "Write a self-contained sentence that still makes sense if the last few words are cut, so a truncated snippet never reads as broken.",
    "Include a soft call-to-action (Learn how, Compare, Get started) to lift click-through without sounding like an ad.",
    "Match the searcher's intent: answer what they're looking for in the first eight words, not your brand's tagline.",
    "Keep each page's description unique, reusing one across a section dilutes every snippet and invites Google to rewrite them.",
  ],

  security:
    "Your draft never leaves your browser. The meta description is escaped and previewed locally using the browser's own encoders. Nothing you type is uploaded, stored or logged. Draft copy for unpublished pages, internal URLs and confidential campaigns stays on your device, and closing the tab erases it completely.",

  faq: [
    {
      question: "How long should a meta description be?",
      answer:
        "Aim for roughly 150–160 characters, or about 920 pixels wide on desktop. Google truncates by rendered pixel width rather than a hard character count, so this tool's pixel meter is the reliable guide. It warns you the moment your copy will be cut with an ellipsis, which is more accurate than counting characters alone.",
    },
    {
      question: "Does the meta description affect SEO rankings?",
      answer:
        "Not directly. Google has said the meta description is not a ranking factor. But it heavily influences click-through rate, and a higher CTR from a compelling snippet can indirectly help performance. Think of it as ad copy for your organic result: it wins the click that ranking alone can't.",
    },
    {
      question: "Why does Google sometimes ignore my meta description?",
      answer:
        "Google rewrites descriptions when it thinks a passage from the page better matches the searcher's specific query. This is common for long-tail searches. Writing a clear, self-contained summary of the page's primary intent makes Google far more likely to use your description verbatim for your core keywords.",
    },
    {
      question: "Should I include my target keyword in the description?",
      answer:
        "Yes, once and naturally. Keywords in the description aren't a ranking signal, but Google bolds terms that match the query, which draws the eye and can lift click-through. Use the keyword field here to confirm your term appears, just avoid stuffing, which reads as spam and hurts clicks.",
    },
    {
      question: "What makes a good meta description?",
      answer:
        "The best descriptions match search intent in the first few words, are unique to the page, front-load the primary keyword and main benefit, fit within Google's pixel limit, and include a light call-to-action. Start from a template here, then rewrite it in your brand's voice while the live snippet confirms it fits.",
    },
    {
      question: "Can I leave the meta description blank?",
      answer:
        "You can. Google will auto-generate one from your page content. But that leaves the most persuasive line of your search result to chance. Writing your own gives you control over the pitch, so it's worth doing for any page you actually want to rank and earn clicks.",
    },
    {
      question: "How is this different from your Meta Tag Generator?",
      answer:
        "The Meta Tag Generator builds the whole <head> block: title, Open Graph, Twitter Cards and more. This tool is a focused writing environment for the single meta description line, with templates, a pixel meter and a live snippet tuned specifically for crafting that sentence. Use this to write the copy, then the full generator to assemble the complete tag set.",
    },
    {
      question: "Is my description sent to a server?",
      answer:
        "No. All measuring, escaping and previewing happen entirely in your browser using its native encoders: nothing you type is uploaded, stored or logged. It's safe to draft descriptions for unpublished pages, internal URLs or confidential campaigns, and closing the tab removes every trace.",
    },
  ],

  changelog: [
    {
      date: "2026-06-19",
      change:
        "Initial release, focused description editor with a live character + pixel meter, pixel-accurate desktop/mobile SERP preview, copy tag / copy text / download / share and undo-redo.",
    },
    {
      date: "2026-06-25",
      change:
        "Added intent-based templates (blog, product, category, local business, homepage, comparison, how-to) and a target-keyword presence check.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the pixel-width model to match Google's current desktop and mobile truncation, and added keyboard shortcuts with an in-tool helper.",
    },
  ],

  relatedTools: [
    "meta-tag-generator",
    "google-serp-preview",
    "meta-tag-analyzer",
    "json-formatter",
    "url-encoder",
  ],
};

export default metaDescriptionGenerator;
