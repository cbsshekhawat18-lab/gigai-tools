import type { Tool } from "@/types";

/**
 * robots.txt Generator: the flagship of the GigAI "Robots" SEO group.
 * Builds a valid robots.txt from structured user-agent groups (allow /
 * disallow rules, crawl-delay) plus sitemap and host directives, with a live
 * output pane, one-click presets (allow all, block all, WordPress, block AI
 * bots) and inline linting that catches the classic "Disallow: /" foot-gun.
 * Everything runs client-side; nothing is crawled or uploaded.
 *
 * Copy is written uniquely for robots.txt / crawl-control search intent so the
 * page ranks on its own rather than cannibalising the sitemap, meta or schema
 * siblings.
 */
const robotsTxtGenerator: Tool = {
  slug: "robots-txt-generator",
  title: "Robots.txt Generator",
  description:
    "Build a valid robots.txt with user-agent groups, allow/disallow rules, crawl-delay, sitemap and host directives, with live output, presets and lint warnings. 100% in your browser.",
  category: "seo-tools",
  group: "Robots",
  icon: "Bot",
  accent: "amber",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "Robots.txt Generator: Create a Valid robots.txt File Online",
  tagline:
    "Add user-agent groups, choose which paths to allow or disallow, set a crawl-delay and point crawlers at your sitemap: then copy or download a spec-correct robots.txt. Linted live, generated entirely in your browser, no signup.",
  longDescription:
    "The GigAI Robots.txt Generator turns a few structured fields into a clean, standards-compliant robots.txt, the file that lives at your domain root and tells search-engine crawlers which parts of your site they may request. Create one or more user-agent groups (target every bot with `*`, or single out Googlebot, Bingbot, GPTBot and friends), add Allow and Disallow path rules, an optional Crawl-delay, one or more Sitemap URLs and an optional Host line. As you edit, the output updates instantly and a live linter watches for the mistakes that quietly de-index sites: a bare `Disallow: /` that blocks everything, a group with no rules, a Sitemap that isn't an absolute URL, or unknown directives. One-click presets get you started fast: Allow all, Block entire site, a WordPress-hardening template, and a block-AI-crawlers preset, and you can still hand-tune every line. When it's right, copy it or download robots.txt, drop it at https://yourdomain.com/robots.txt, and it takes effect on the next crawl. Because the whole thing is generated locally with no server and no crawl, your paths, staging rules and unreleased sections never leave your machine.",

  ctaText: "Generate robots.txt",

  keywords: [
    "robots.txt generator",
    "create robots.txt",
    "robots txt file generator",
    "generate robots.txt online",
    "disallow crawlers",
    "block googlebot",
    "crawl-delay robots.txt",
    "robots.txt sitemap",
    "wordpress robots.txt",
    "block ai crawlers",
    "user-agent robots.txt",
    "robots.txt example",
  ],

  seo: {
    title: "Robots.txt Generator, Create a Valid robots.txt Free | GigAI Tools",
    description:
      "Free robots.txt generator: build user-agent groups with allow/disallow rules, crawl-delay, sitemap and host directives. Live output, presets and lint warnings. Copy or download robots.txt, 100% in-browser.",
  },

  features: [
    {
      icon: "Bot",
      title: "Structured user-agent groups",
      description:
        "Add as many groups as you need, one for every crawler with `*`, or targeted rules for Googlebot, Bingbot, GPTBot and others, each with its own Allow, Disallow and Crawl-delay.",
    },
    {
      icon: "Route",
      title: "Allow & Disallow path rules",
      description:
        "Type the paths you want to block or open, one per line. Wildcards (`*`) and end-anchors (`$`) are passed through untouched so pattern rules like /*.pdf$ work as written.",
    },
    {
      icon: "Network",
      title: "Sitemap & host directives",
      description:
        "List one or more absolute Sitemap URLs so every crawler discovers your sitemap, and optionally add a Host line, both emitted in the correct place, outside the agent groups.",
    },
    {
      icon: "ShieldAlert",
      title: "Live lint & foot-gun warnings",
      description:
        "Inline checks flag a site-wide `Disallow: /`, empty groups, non-absolute sitemap URLs and unknown directives as you type, so you never publish a robots.txt that hides your whole site.",
    },
    {
      icon: "Wand2",
      title: "One-click presets",
      description:
        "Start from Allow all, Block entire site, a WordPress-hardening template or a block-AI-crawlers preset, then fine-tune. No memorising syntax from scratch.",
    },
    {
      icon: "Download",
      title: "Copy, download, share, undo",
      description:
        "Copy the file, download a correctly-named robots.txt, share a link that reopens your rules, load an example, or undo/redo, all keyboard-driven and fully client-side.",
    },
  ],

  benefits: [
    {
      title: "Control crawl budget deliberately",
      description:
        "Keep bots out of search, filter, cart and admin URLs so their limited crawl budget lands on the pages you actually want indexed, without touching a line of server config.",
    },
    {
      title: "Avoid the catastrophic block",
      description:
        "The live linter catches a stray `Disallow: /` before you ship it, so you never accidentally tell Google to drop your entire site from the index.",
    },
    {
      title: "Correct syntax without the spec",
      description:
        "You fill in plain fields and the tool emits the exact directive order and casing crawlers expect. No more debugging why a hand-typed rule is being ignored.",
    },
    {
      title: "Private by design",
      description:
        "Nothing is crawled or uploaded. Staging paths, internal sections and unreleased rules are generated locally and never leave your browser.",
    },
  ],

  howTo: [
    {
      title: "Start from a preset or blank group",
      description:
        "Pick Allow all, Block entire site, WordPress or Block AI crawlers to prefill sensible rules, or begin with an empty `User-agent: *` group and build it up.",
    },
    {
      title: "Add your allow / disallow rules",
      description:
        "For each group, set the user-agent(s) and list the paths to Disallow (block) and Allow (carve back out), one path per line. Add a Crawl-delay only if a bot is hammering your server.",
    },
    {
      title: "Point crawlers at your sitemap",
      description:
        "Add your absolute sitemap URL(s) (e.g. https://example.com/sitemap.xml). Optionally set a Host line for your preferred domain.",
    },
    {
      title: "Review the live lint",
      description:
        "Read the warnings panel: confirm you aren't blocking the whole site, that every group has rules, and that your sitemap URL is absolute. Fix anything flagged.",
    },
    {
      title: "Copy or download robots.txt",
      description:
        "Copy the output or download robots.txt, then upload it to your domain root so it's reachable at https://yourdomain.com/robots.txt. It applies on the next crawl.",
    },
  ],

  formats: {
    input: ["Form fields"],
    output: ["robots.txt", "Text"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Steer crawl budget on a large site",
      description:
        "Block faceted-search, sort and pagination URLs while keeping category and product pages open, so Googlebot spends its budget on pages that can rank.",
    },
    {
      audience: "Web developer",
      title: "Lock down staging & admin paths",
      description:
        "Generate a robots.txt that disallows /wp-admin/, /cart/, /checkout/ and internal tools, and add the sitemap line, in one pass instead of hand-editing the file.",
    },
    {
      audience: "Site owner",
      title: "Keep AI crawlers off your content",
      description:
        "Use the block-AI-crawlers preset to disallow GPTBot, CCBot, ClaudeBot and other model crawlers while leaving Googlebot and Bingbot free to index for search.",
    },
    {
      audience: "Agency / freelancer",
      title: "Ship consistent robots.txt to clients",
      description:
        "Produce a clean, linted robots.txt per client domain (including pre-launch staging rules) and share a pre-filled link so anyone can review it.",
    },
  ],

  troubleshooting: [
    {
      problem: "My whole site disappeared from Google after adding robots.txt.",
      solution:
        "You almost certainly have `Disallow: /` under `User-agent: *`, which blocks every crawler from every path. Remove that line (or scope it to specific folders), re-upload robots.txt, then request re-crawling in Search Console. The linter here flags this before you publish.",
    },
    {
      problem: "A page I disallowed still shows up in search results.",
      solution:
        "robots.txt only blocks crawling, not indexing. A disallowed URL that's linked from elsewhere can still appear (often with no description). To keep a page out of the index, allow crawling and add a `<meta name=\"robots\" content=\"noindex\">` tag or an X-Robots-Tag header instead.",
    },
    {
      problem: "Crawlers seem to ignore my Crawl-delay.",
      solution:
        "Googlebot does not honour Crawl-delay at all. Set the crawl rate in Search Console instead. Bing, Yandex and some others do respect it. Only add Crawl-delay for the bots that use it, and keep the value modest so you don't starve legitimate crawling.",
    },
    {
      problem: "My rules don't seem to match the URLs I expected.",
      solution:
        "robots.txt matching is prefix-based and case-sensitive on the path. `Disallow: /Blog` won't match /blog. Use `*` for wildcards and `$` to anchor the end (e.g. `Disallow: /*.pdf$`). Test your final file with Google's robots.txt Tester after uploading.",
    },
  ],

  tips: [
    "Put robots.txt only at the domain root, https://example.com/robots.txt. A file in a subfolder is ignored, and each subdomain needs its own.",
    "Always include at least one absolute Sitemap: line so every crawler, not just Google, can find your sitemap.",
    "Use robots.txt to manage crawling, and meta robots / X-Robots-Tag to manage indexing. They solve different problems.",
    "Be specific with Disallow paths. A trailing slash matters (/private/ blocks the folder, /private also matches /privateers).",
    "Keep the file small and readable, group related rules, comment sections with `#`, and avoid contradictory Allow/Disallow lines.",
  ],

  security:
    "Your robots.txt is generated entirely in your browser. There is no crawl and no upload. Paths, staging rules and unreleased sections are never stored, logged or transmitted, so you can safely draft rules for internal or pre-launch URLs. Remember that a published robots.txt is itself public, so never rely on it to hide truly sensitive URLs: block those with authentication instead.",

  faq: [
    {
      question: "What is a robots.txt file and where does it go?",
      answer:
        "robots.txt is a plain-text file at your domain root (https://example.com/robots.txt) that tells search-engine crawlers which URLs they may or may not request. It uses User-agent groups with Allow and Disallow rules, plus optional Crawl-delay, Sitemap and Host lines. It must live at the root, a file in a subfolder is ignored, and each subdomain needs its own.",
    },
    {
      question: "How do I block a specific page or folder from crawlers?",
      answer:
        "Add a Disallow rule to the relevant user-agent group: `Disallow: /admin/` blocks that folder, `Disallow: /private-page` blocks that path prefix. Remember matching is prefix-based, so a trailing slash matters. To block everything for all bots you'd use `Disallow: /`, the tool warns you before you do that by accident.",
    },
    {
      question: "Does robots.txt stop a page from being indexed?",
      answer:
        "No: that's the most common misconception. robots.txt only controls crawling. A URL you disallow can still be indexed if other pages link to it, usually shown without a snippet. To keep a page out of the index entirely, allow it to be crawled and add a `noindex` meta robots tag or X-Robots-Tag header, or protect it behind a login.",
    },
    {
      question: "How do I add my sitemap to robots.txt?",
      answer:
        "Add a `Sitemap:` line with the full absolute URL, e.g. `Sitemap: https://example.com/sitemap.xml`. You can list several sitemaps. It sits outside the User-agent groups, so every crawler reads it regardless of the rules. This tool places it correctly and warns if the URL isn't absolute.",
    },
    {
      question: "Can I block ChatGPT and other AI crawlers with robots.txt?",
      answer:
        "Yes, for the AI crawlers that honour it. Add groups that Disallow the relevant user-agents (GPTBot (OpenAI), CCBot (Common Crawl), ClaudeBot, Google-Extended and others) while leaving Googlebot and Bingbot free to index for search. The built-in \"Block AI crawlers\" preset sets this up for you. Note that robots.txt is voluntary, not every scraper obeys it.",
    },
    {
      question: "What's the difference between Allow and Disallow?",
      answer:
        "Disallow blocks a path prefix from being crawled. Allow explicitly permits one, mainly to carve an exception out of a broader Disallow. For example, `Disallow: /wp-admin/` plus `Allow: /wp-admin/admin-ajax.php` blocks the admin folder but keeps one needed endpoint reachable. When rules conflict, most crawlers follow the most specific (longest) matching rule.",
    },
    {
      question: "Does Google obey the Crawl-delay directive?",
      answer:
        "No. Googlebot ignores Crawl-delay entirely. You control Google's crawl rate in Search Console. Bing, Yandex and some other crawlers do respect it. Only add Crawl-delay for the bots that use it, and keep the number small: a large delay can slow legitimate crawling of your important pages.",
    },
    {
      question: "Is my robots.txt sent to a server when I generate it here?",
      answer:
        "No. Every rule is turned into text locally in your browser. There is no crawl and no upload. Nothing you enter is stored, logged or transmitted, so you can safely draft rules for staging or internal paths. Just remember the finished file, once published on your site, is publicly readable by anyone.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, structured user-agent groups with Allow/Disallow/Crawl-delay, Sitemap and Host directives, live output, lint warnings, copy and download robots.txt.",
    },
    {
      date: "2026-06-26",
      change:
        "Added one-click presets (Allow all, Block entire site, WordPress, Block AI crawlers), duplicate-group and empty-group detection, and shareable links.",
    },
    {
      date: "2026-06-30",
      change:
        "Added multi-agent groups per block, keyboard shortcuts with an in-tool helper, and refined lint messaging for wildcard and anchored path rules.",
    },
  ],

  relatedTools: [
    "xml-sitemap-generator",
    "meta-tag-generator",
    "sitemap-validator",
    "url-encoder",
  ],
};

export default robotsTxtGenerator;
