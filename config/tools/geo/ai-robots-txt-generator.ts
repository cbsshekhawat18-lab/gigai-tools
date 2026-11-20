import type { Tool } from "@/types";

/**
 * AI Robots.txt Generator — the "fix" half of check → fix with the AI Crawler
 * Access Checker. Per-bot toggles, honest presets, plain-language costs.
 */
const aiRobotsTxtGenerator: Tool = {
  slug: "ai-robots-txt-generator",
  title: "AI Robots.txt Generator",
  description:
    "Generate a correct robots.txt policy for every AI crawler (GPTBot, ClaudeBot, OAI-SearchBot, PerplexityBot and 11 more) with per-bot allow/block toggles and a plain-language line on what each choice costs. Free, in your browser.",
  category: "geo-tools",
  group: "Crawler Access",
  icon: "FileCog",
  accent: "amber",
  status: "live",
  createdAt: "2026-08-22",

  h1: "AI Robots.txt Generator: Allow or Block Every AI Crawler, Deliberately",
  tagline:
    "Fifteen AI crawler tokens, one toggle each, grouped by operator and labeled by what the bot actually does: model training, AI search indexing, or on-demand user fetching. Flip a toggle and read exactly what that block costs before you ship it. Three presets cover the sane policies: maximum AI visibility, visible-but-not-trained-on, and block-AI-keep-search. Output is a clean block to merge into your robots.txt, or a complete file.",
  longDescription:
    "Most sites' AI crawler policy was written by a template: a copy-pasted 'block AI' snippet from 2023 that predates OAI-SearchBot and Claude-SearchBot and therefore blocks AI search citations along with training, or nothing at all, which is also a policy, just not a chosen one. This generator makes the choice explicit and per-bot. Every token is listed under its operator with its role stated (GPTBot trains models. OAI-SearchBot builds the index ChatGPT Search cites from. ChatGPT-User fetches links users share: three different decisions, not one), and the moment you set a bot to Block, the tool shows the concrete cost in plain language: lost citations, dead link-reading, missing training presence. The 'no training' preset implements the most popular deliberate policy correctly: it blocks GPTBot, ClaudeBot, meta-externalagent, Bytespider, CCBot and the Google-Extended and Applebot-Extended control tokens, while keeping every search-index and user-fetch bot allowed, so you stay citable in ChatGPT Search, Claude, Perplexity, Google and Bing while opting out of model training. The 'block AI' preset deliberately keeps Googlebot and Bingbot allowed, because blocking those removes you from ordinary search: a mistake that turns a content-policy decision into a traffic catastrophe. Output is commented, spec-correct (one User-agent group per token, Allow: / or Disallow: /), and ready to paste.",

  ctaText: "Generate your AI policy",

  keywords: [
    "ai robots.txt generator",
    "block ai crawlers robots.txt",
    "gptbot disallow",
    "block chatgpt from website",
    "allow ai crawlers",
    "claudebot robots.txt block",
    "robots.txt block ai training",
    "google-extended disallow",
    "ai bots robots txt template",
    "opt out ai training robots",
  ],

  seo: {
    title: "AI Robots.txt Generator: Allow/Block GPTBot, ClaudeBot & More | GigAI Tools",
    description:
      "Free generator: build a correct robots.txt policy for 15 AI crawlers with per-bot toggles, honest cost explanations and presets (no-training, block-AI, full visibility). In-browser.",
  },

  features: [
    {
      icon: "ToggleRight",
      title: "One toggle per bot, grouped by operator",
      description:
        "OpenAI's three tokens, Anthropic's three, Perplexity's two, plus Google, Microsoft, Apple, Meta, ByteDance and Common Crawl. Each with its own switch, because 'AI' is not one decision.",
    },
    {
      icon: "MessageCircleWarning",
      title: "The cost of every block, before you ship it",
      description:
        "Set a bot to Block and the row immediately shows what you lose: ChatGPT Search citations for OAI-SearchBot, link-reading for ChatGPT-User, the Common Crawl corpus for CCBot. No silent foot-guns.",
    },
    {
      icon: "Layers",
      title: "Three honest presets",
      description:
        "Maximum AI visibility (allow all), visible-but-not-trained-on (block training tokens, keep search and user-fetch), and block-AI-keep-search (which still allows Googlebot and Bingbot, because removing yourself from search is never the intent).",
    },
    {
      icon: "FileCode",
      title: "Spec-correct output",
      description:
        "One User-agent group per token with an explicit Allow: / or Disallow: /, optional explanatory comments, optional complete-file mode with a * group and Sitemap line. Nothing a parser could misread.",
    },
    {
      icon: "GitCompareArrows",
      title: "Pairs with the Access Checker",
      description:
        "Generate, deploy, then verify with the AI Crawler Access Checker, which quotes your new rules back to you with full RFC 9309 matching. Check → fix → check.",
    },
    {
      icon: "ShieldCheck",
      title: "Runs entirely in your browser",
      description:
        "The policy you configure is generated locally and never uploaded. Share links encode your toggle state in the URL fragment, which never reaches a server.",
    },
  ],

  benefits: [
    {
      title: "Turn a default into a decision",
      description:
        "Whatever your stance on AI training, it should be yours. Per-bot toggles with stated costs replace the 2023 template someone else wrote with a policy you actually chose.",
    },
    {
      title: "Stop blocking your own citations",
      description:
        "The most damaging pattern in the wild is blocking OAI-SearchBot or Bingbot while trying to block training. The role labels and preset logic make that mistake hard to commit.",
    },
    {
      title: "Explain the policy to anyone",
      description:
        "The generated comments document what each group does, so the next developer (or lawyer) reading your robots.txt understands the policy without archaeology.",
    },
    {
      title: "Merge-friendly output",
      description:
        "By default you get just the AI block, ready to append to your existing file without touching your current rules. Full-file mode exists when you're starting fresh.",
    },
  ],

  howTo: [
    {
      title: "Start from a preset",
      description:
        "Pick the policy closest to your intent: full visibility, no-training, or block-AI. Presets set all 15 toggles at once, correctly.",
    },
    {
      title: "Adjust individual bots",
      description:
        "Flip any toggle. Blocked bots show the plain-language cost immediately, so every deviation from the preset is an informed one.",
    },
    {
      title: "Choose block or full file",
      description:
        "Keep the default merge block for an existing robots.txt, or enable full-file mode to add a User-agent: * group and your Sitemap URL.",
    },
    {
      title: "Copy or download robots.txt",
      description:
        "Deploy it at your domain root (https://example.com/robots.txt). Each subdomain needs its own file.",
    },
    {
      title: "Verify with the Access Checker",
      description:
        "Fetch your live file with the AI Crawler Access Checker to confirm every verdict matches your intent, and to catch a CDN rewriting your file.",
    },
  ],

  formats: {
    input: ["Toggles"],
    output: ["robots.txt", "TXT"],
  },

  useCases: [
    {
      audience: "Site owner",
      title: "Opt out of training, stay citable",
      description:
        "The no-training preset is the policy most owners actually want: models can't train on your content, but ChatGPT Search, Claude, Perplexity and Bing can still cite and link you.",
    },
    {
      audience: "Publisher",
      title: "Implement an editorial AI policy precisely",
      description:
        "When the organization decides its stance on AI use of content, this turns the memo into correct directives: with documentation comments legal can read.",
    },
    {
      audience: "Developer",
      title: "Stop hand-writing bot groups",
      description:
        "Fifteen user-agent groups typed by hand is fifteen chances for a typo that silently does nothing. Generate them, paste once, done.",
    },
    {
      audience: "Agency",
      title: "A defensible default for every client",
      description:
        "Ship each client a deliberate AI policy with the trade-offs documented in the file itself, instead of whatever their theme's robots.txt happened to contain.",
    },
  ],

  troubleshooting: [
    {
      problem: "I deployed the file but AI bots still fetch my site.",
      solution:
        "Confirm the live file at yourdomain.com/robots.txt matches what you generated (CDNs and plugins can rewrite it), give crawlers up to 24 hours to re-read it, and remember Bytespider has a history of ignoring robots.txt entirely: blocking it reliably requires a firewall rule.",
    },
    {
      problem: "I blocked AI training but my content still shows up in AI answers.",
      solution:
        "Two different mechanisms. AI answers that cite you come from search indexes and live fetching (OAI-SearchBot, PerplexityBot, Bingbot…), which the no-training preset deliberately allows. And robots.txt can't remove content from models that already trained on it. It only governs future crawling.",
    },
    {
      problem: "Should the AI block go before or after my existing rules?",
      solution:
        "Order doesn't matter to compliant parsers. Each crawler obeys the most specific group naming it, wherever it sits in the file. Put the block wherever reads best. Just don't duplicate a token in two groups with contradictory rules.",
    },
    {
      problem: "Cloudflare shows different robots.txt content than my file.",
      solution:
        "Cloudflare's managed robots.txt feature injects its own section above yours. Disable it in the dashboard if you want your generated policy to be the whole policy: otherwise Cloudflare's Disallows apply for the tokens it lists.",
    },
  ],

  tips: [
    "Google-Extended and Applebot-Extended are control tokens, not crawlers: they govern how Googlebot's and Applebot's crawls may be used for AI. Blocking them doesn't reduce crawl traffic, and doesn't affect your search rankings.",
    "Never block Googlebot or Bingbot to 'block AI'. That removes you from ordinary search. Bing's index also powers ChatGPT Search, so a Bingbot block silently costs you ChatGPT citations too.",
    "robots.txt is public. Your AI policy is readable by anyone at /robots.txt. Which is fine, and also why a well-commented file is worth generating.",
    "Re-visit the policy quarterly: new tokens appear (OAI-SearchBot and Claude-SearchBot didn't exist when most 'block AI' templates were written), and this generator's list is kept current.",
    "Blocking a bot doesn't un-train existing models. The decision affects future crawls only: make it for the future, not as a retraction.",
  ],

  security:
    "The generator runs entirely in your browser: toggle state and output never leave your device, and share links keep the configuration in the URL fragment, which browsers don't send to servers. There is nothing to log and nobody logging it.",

  faq: [
    {
      question: "How do I block AI crawlers in robots.txt?",
      answer:
        "Add a User-agent group per bot with a site-wide disallow: e.g. 'User-agent: GPTBot' followed by 'Disallow: /'. This generator produces those groups correctly for all 15 AI tokens, but the real work is deciding WHICH to block: blocking training bots (GPTBot, ClaudeBot, CCBot…) is a content-control policy. Blocking search and user-fetch bots (OAI-SearchBot, PerplexityBot, ChatGPT-User…) removes you from AI answers and their referral traffic. The toggles keep those decisions separate.",
    },
    {
      question: "What's the recommended setting?",
      answer:
        "For most sites that want to be found: allow everything, or use the no-training preset if unrestricted model training bothers you. The no-training preset keeps every citation channel open (ChatGPT Search, Claude, Perplexity, Google, Bing) while blocking the training-only tokens. There's no neutral answer on training itself. It trades future model familiarity with your brand against content control, and the tool states that trade-off rather than deciding it for you.",
    },
    {
      question: "Does blocking GPTBot remove my site from ChatGPT?",
      answer:
        "Not from ChatGPT Search. That retrieves through OAI-SearchBot and Bing's index, both separate tokens. Blocking GPTBot only stops your pages being used to train future OpenAI models. This is the single most misunderstood distinction in AI crawler policy, and the reason this generator lists OpenAI as three toggles, not one.",
    },
    {
      question: "Will blocking AI training bots hurt my Google rankings?",
      answer:
        "No. GPTBot, ClaudeBot, CCBot, meta-externalagent and Bytespider have nothing to do with Google Search. Google-Extended is a training/grounding control token whose blocking Google explicitly states does not affect Search rankings or inclusion in AI Overviews. Only blocking Googlebot itself affects your rankings.",
    },
    {
      question: "Do AI companies actually respect these rules?",
      answer:
        "The major operators (OpenAI, Anthropic, Google, Microsoft, Apple, Meta, Perplexity) document robots.txt compliance for these tokens, and independent log analyses generally confirm it. Bytespider (ByteDance) is the documented exception. Robots.txt is a protocol built on good faith. For a bot acting in bad faith you need firewall enforcement, which is your CDN's job, not this file's.",
    },
    {
      question: "Should I use the complete-file mode or just the AI block?",
      answer:
        "If you already have a robots.txt with crawl rules and a sitemap, generate just the AI block and append it. Your existing rules stay untouched. Use complete-file mode only for a fresh file: it adds the User-agent: * catch-all group and a Sitemap line so the file is valid on its own.",
    },
    {
      question: "How is this different from GigAI's general Robots.txt Generator?",
      answer:
        "The general generator builds arbitrary crawl rules (path disallows, crawl delays, custom groups) for any crawler. This one solves exactly one problem well: a correct, current, deliberately-chosen policy for the AI crawler tokens, with each bot's role and block-cost explained. Use both: general rules from that tool, AI policy from this one.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: 15 AI tokens with per-bot toggles and block-cost explanations, three presets (visibility / no-training / block-AI-keep-search), merge-block and complete-file output modes, commented spec-correct generation, shareable configuration links.",
    },
  ],

  relatedTools: [
    "ai-crawler-access-checker",
    "robots-txt-generator",
    "ai-crawler-log-analyzer",
    "geo-audit",
  ],

  notFor: [
    {
      text: "It doesn't build general crawl rules (path disallows, crawl-delay, custom groups): that's the Robots.txt Generator.",
      toolSlug: "robots-txt-generator",
    },
    {
      text: "It can't enforce anything against bots that ignore robots.txt. Enforcement lives in your firewall or CDN bot management.",
    },
  ],
};

export default aiRobotsTxtGenerator;
