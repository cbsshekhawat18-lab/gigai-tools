import type { Tool } from "@/types";

/**
 * AI Crawler Access Checker — the GEO Studio's link-magnet flagship.
 * Correct RFC 9309 matching + the Cloudflare default-blocking detection
 * nobody else surfaces. Pairs with the AI Robots.txt Generator (check → fix).
 */
const aiCrawlerAccessChecker: Tool = {
  slug: "ai-crawler-access-checker",
  title: "AI Crawler Access Checker",
  description:
    "Check whether GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Bingbot and every other AI crawler can read your site. Real RFC 9309 robots.txt matching with the deciding rule quoted, plus Cloudflare default-blocking detection. Free, instant, no signup.",
  category: "geo-tools",
  group: "Crawler Access",
  icon: "Bot",
  accent: "amber",
  status: "live",
  featured: true,
  createdAt: "2026-08-22",
  serverSide: true,

  h1: "AI Crawler Access Checker: Is Your Site Blocking GPTBot, ClaudeBot & Perplexity?",
  tagline:
    "Enter your domain or paste your robots.txt, and all 15 AI crawler tokens get a verdict: allowed, blocked, or unspecified. Each one is computed the way crawlers actually compute it, following RFC 9309 for group specificity, wildcards, longest-match precedence and Allow beating Disallow on ties, and each verdict quotes the exact line that decided it. It also detects Cloudflare, which now blocks AI crawlers by default regardless of what your file says.",
  longDescription:
    "Most robots.txt checkers get the matching wrong: they treat the file as a list instead of user-agent groups, ignore wildcard patterns, and miss that Allow beats Disallow on a specificity tie. This checker implements the Robots Exclusion Protocol properly: consecutive User-agent lines share a group, duplicate groups merge, the most specific agent match wins, path rules support * and $, and the longest matching rule decides. It then applies that to every AI crawler token across OpenAI (GPTBot, OAI-SearchBot, ChatGPT-User), Anthropic (ClaudeBot, Claude-SearchBot, Claude-User), Perplexity (PerplexityBot, Perplexity-User), Google (Googlebot, Google-Extended), Microsoft (Bingbot, which is the index ChatGPT Search retrieves through), Apple (Applebot-Extended), Meta (meta-externalagent), ByteDance (Bytespider) and Common Crawl (CCBot). Every verdict quotes the matching rule and its line number, explains what the bot does, and states plainly what blocking it costs you. And because robots.txt stopped being the whole story in 2025: when you fetch by URL, the response headers are inspected for Cloudflare, whose 'AI bots' firewall setting now blocks AI crawlers by default on new zones, and whose managed robots.txt feature injects Disallow rules above your own. Thousands of sites are blocked without anyone having edited anything. This is the free tool that tells you if you're one of them.",

  ctaText: "Check AI crawler access",

  keywords: [
    "ai crawler access checker",
    "is gptbot blocked",
    "check if chatgpt can crawl my site",
    "gptbot robots.txt",
    "claudebot robots.txt",
    "perplexitybot blocked",
    "ai bots robots.txt checker",
    "cloudflare blocking ai crawlers",
    "oai-searchbot allow",
    "block ai crawlers check",
    "google-extended robots.txt",
    "ai crawler user agents",
  ],

  seo: {
    title: "AI Crawler Access Checker: Is GPTBot Blocked? Free Test | GigAI Tools",
    description:
      "Free checker: can GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot & Bingbot crawl your site? Proper RFC 9309 robots.txt matching + Cloudflare default-blocking detection. No signup.",
  },

  features: [
    {
      icon: "ListChecks",
      title: "15 AI crawler tokens, one verdict each",
      description:
        "OpenAI, Anthropic, Perplexity, Google, Microsoft, Apple, Meta, ByteDance and Common Crawl. Every token that decides your AI visibility, grouped by operator with its role labeled: training, search index, or on-demand user fetch.",
    },
    {
      icon: "Scale",
      title: "Matching that follows the actual spec",
      description:
        "RFC 9309 as crawlers implement it: user-agent groups merged by token, exact match beating prefix beating *, wildcard paths (* and $), longest-match precedence, Allow winning ties. Most online checkers get at least one of these wrong.",
    },
    {
      icon: "FileSearch",
      title: "The deciding line, quoted",
      description:
        "No verdict without evidence: each bot's result shows the exact robots.txt line (with line number) that decided it, or states that no rule names the bot and crawling defaults to allowed.",
    },
    {
      icon: "CloudOff",
      title: "Cloudflare detection: the check that matters most in 2026",
      description:
        "Cloudflare blocks AI crawlers by default on new zones and can inject a managed robots.txt above yours. Fetch by URL and the response headers plus in-file markers (Content-Signal lines, managed-section comments) are checked, with the exact dashboard setting named.",
    },
    {
      icon: "MessageCircleWarning",
      title: "What each block actually costs",
      description:
        "Blocking OAI-SearchBot is not like blocking GPTBot. Every blocked verdict explains the concrete consequence: lost ChatGPT Search citations, dead link-reading, missing training presence, so you decide with the trade-off in view.",
    },
    {
      icon: "ShieldCheck",
      title: "Stateless and private",
      description:
        "Pasted files never leave your browser. URL fetches go through a stateless proxy that fetches, returns and stores nothing. Either way there's no account and no log of what you checked.",
    },
  ],

  benefits: [
    {
      title: "Find the block you didn't know you had",
      description:
        "Agencies, CDN defaults, WordPress plugins and copy-pasted robots.txt templates block AI crawlers silently. The most common finding this tool produces is a Disallow someone shipped without deciding to.",
    },
    {
      title: "Verify what your robots.txt REALLY says",
      description:
        "A file that looks permissive can block through group precedence, and one that looks blocking can allow through a longer Allow rule. The spec-correct matcher shows the truth, not the appearance.",
    },
    {
      title: "Distinguish policy from accident",
      description:
        "Blocking training bots while allowing search and user-fetch bots is a coherent, popular policy. The per-role labels let you check your file implements the policy you chose, not one a template chose for you.",
    },
    {
      title: "Check any site, not just yours",
      description:
        "Curious how competitors or publishers handle AI crawlers? Enter any domain: the checker fetches its public robots.txt and shows its policy with the same rigor.",
    },
  ],

  howTo: [
    {
      title: "Enter your domain or robots.txt URL",
      description:
        "Type example.com and the checker fetches https://example.com/robots.txt automatically. Or paste the file's contents to analyze a draft or staging copy privately.",
    },
    {
      title: "Read the per-bot verdicts",
      description:
        "Each of the 15 tokens shows Allowed, Blocked or Allowed (unspecified), grouped by operator, with the deciding rule quoted and the bot's role explained.",
    },
    {
      title: "Check the 'Beyond robots.txt' section",
      description:
        "If the site is behind Cloudflare, the checker says so from response evidence and tells you which dashboard toggles (Security → Bots → AI bots. Managed robots.txt) can override your file.",
    },
    {
      title: "Fix what's wrong",
      description:
        "Every blocked verdict links to the AI Robots.txt Generator, which builds a correct per-bot policy with plain-language explanations of each choice.",
    },
    {
      title: "Re-check after deploying",
      description:
        "Paste the new file or re-fetch the URL. The share link reproduces the report so a teammate can verify the same evidence.",
    },
  ],

  formats: {
    input: ["URL", "robots.txt", "TXT"],
    output: ["Report", "Share link"],
  },

  useCases: [
    {
      audience: "Site owner",
      title: "\"Why doesn't ChatGPT know my site?\"",
      description:
        "The first question of AI-era SEO. In ten seconds you know whether the answer is a robots.txt rule, a Cloudflare default, or neither, before you spend a cent on visibility tooling.",
    },
    {
      audience: "SEO specialist",
      title: "Add AI access to every technical audit",
      description:
        "Crawl access used to mean Googlebot. Now an audit that doesn't check OAI-SearchBot and PerplexityBot misses the fastest-growing referral channel. One URL per client, evidence included.",
    },
    {
      audience: "Publisher / legal",
      title: "Verify the blocking policy actually blocks",
      description:
        "If your organization decided to block AI training, verify the file implements it: correct tokens, correct rules, no wildcard-group loopholes, and that the search bots you still want are not caught in the blast radius.",
    },
    {
      audience: "Developer",
      title: "Debug a robots.txt that isn't doing what it looks like",
      description:
        "Group precedence and longest-match rules produce surprising outcomes. Paste the file, see which group each bot actually obeys and which rule wins for the path.",
    },
  ],

  troubleshooting: [
    {
      problem: "The checker says a bot is allowed, but that bot never visits my site.",
      solution:
        "robots.txt permission is necessary, not sufficient. Check the Cloudflare warning (firewall blocking happens before robots.txt is read), then confirm with real evidence: drop your server access log into the AI Crawler Log Analyzer to see who actually arrives.",
    },
    {
      problem: "My robots.txt allows everything but the tool flags Cloudflare.",
      solution:
        "That's the point of the flag. Cloudflare's 'AI bots' setting (Security → Bots) blocks AI crawlers at the network edge regardless of robots.txt, and it's enabled by default for zones created since mid-2025. Only the dashboard shows its state: the flag tells you to go look.",
    },
    {
      problem: "A bot shows 'Allowed (unspecified)': is that bad?",
      solution:
        "No rule names it and no wildcard group restricts it, so crawling defaults to allowed under the protocol. It's fine. Adding an explicit Allow group only helps as documentation of intent.",
    },
    {
      problem: "I blocked Bytespider but it still shows up in my logs.",
      solution:
        "Bytespider has a documented history of ignoring robots.txt. The file is a request that well-behaved crawlers honor. Enforcement against a misbehaving one needs a firewall rule or your CDN's bot management.",
    },
  ],

  tips: [
    "Blocking Google-Extended does NOT remove you from Google Search or AI Overviews: it's a usage-control token for Gemini training, not a crawler. Blocking Googlebot removes you from everything. Almost never do that.",
    "ChatGPT Search retrieves through Bing's index: blocking Bingbot silently removes you from ChatGPT Search results even with every OpenAI bot allowed.",
    "The popular 'block AI' copy-paste templates predate OAI-SearchBot and Claude-SearchBot: sites using them often block training AND search citations without realizing the second part.",
    "Check the file at your domain root, not a copy: CDNs and plugins can rewrite robots.txt at serve time, and Cloudflare's managed feature injects rules your repo never contained.",
    "robots.txt is per-subdomain: blog.example.com has its own file, and a policy on www does nothing for it.",
  ],

  security:
    "Pasted robots.txt files are parsed entirely in your browser and never uploaded. URL mode fetches the public file through our stateless proxy. It fetches, returns and stores nothing, and the checked URLs are not logged. Check drafts and staging files freely.",

  faq: [
    {
      question: "How do I check if GPTBot is blocked on my site?",
      answer:
        "Enter your domain above: the checker fetches your robots.txt and computes GPTBot's verdict with real RFC 9309 matching: it finds the user-agent group GPTBot obeys (exact token match first, then prefix, then *), applies the group's Allow/Disallow rules with wildcard and longest-match precedence, and quotes the exact line that decided the result. It does the same simultaneously for 14 other AI crawler tokens.",
    },
    {
      question: "Which AI crawlers should I allow?",
      answer:
        "For visibility, the high-stakes tokens are the search-index and user-fetch bots: OAI-SearchBot and ChatGPT-User (ChatGPT), Claude-SearchBot and Claude-User, PerplexityBot, Googlebot and Bingbot. Blocking these removes you from AI answers that cite sources and drive traffic. Training bots (GPTBot, ClaudeBot, meta-externalagent, CCBot, Bytespider) are a genuine policy choice: allowing them builds model familiarity with your brand. Blocking them asserts content control. The checker labels each bot's role so you can apply your policy precisely.",
    },
    {
      question: "Why is Cloudflare relevant to a robots.txt check?",
      answer:
        "Because since 2025 Cloudflare blocks AI crawlers at the firewall by default for new zones, and offers a managed robots.txt that injects its own rules above yours. Both act regardless of the file you wrote: a perfectly permissive robots.txt can coexist with a total AI block. When you fetch by URL, this checker inspects response headers (server: cloudflare, cf-cache-status) and the file for managed-section markers and Content-Signal lines, and warns you with the exact settings to review.",
    },
    {
      question: "What's the difference between GPTBot, OAI-SearchBot and ChatGPT-User?",
      answer:
        "Three different jobs. GPTBot crawls pages as training data for future OpenAI models. OAI-SearchBot builds the retrieval index behind ChatGPT Search. Its citations link to your pages and send traffic. ChatGPT-User fetches a page live when a user asks ChatGPT about it or pastes your link. Many sites want to block the first and would be hurt badly by blocking the other two. Treating 'OpenAI' as one bot is the most common policy mistake this checker surfaces.",
    },
    {
      question: "Does blocking AI crawlers in robots.txt actually work?",
      answer:
        "For the major operators, yes. OpenAI, Anthropic, Google, Microsoft, Apple and Perplexity document compliance with robots.txt, and server-log studies bear it out. Bytespider is the notable exception with a history of ignoring the file. And remember robots.txt only governs crawling: it can't remove content already in a training set, and it doesn't stop a model from knowing about you via other sites.",
    },
    {
      question: "Is 'Allowed (unspecified)' different from 'Allowed'?",
      answer:
        "Functionally no: the bot may crawl in both cases. 'Allowed' means a rule or named group explicitly permits it; 'unspecified' means no rule mentions the bot and no wildcard group restricts it, so the protocol's default (allow) applies. The distinction matters only for reading intent: unspecified means nobody made a decision.",
    },
    {
      question: "Can I test a robots.txt before deploying it?",
      answer:
        "Yes: paste the draft directly instead of fetching. Parsing happens in your browser, nothing is uploaded, so unreleased and staging files stay private. The verdicts are identical to URL mode except for the Cloudflare header check, which needs a live response.",
    },
    {
      question: "How is this different from GigAI's Robots.txt Validator?",
      answer:
        "The Robots.txt Validator lints a file for syntax and structural mistakes (site-wide Disallow, unknown directives, missing sitemap): file health, any crawler. This checker answers a different question: for each specific AI crawler token, may it fetch, and which line says so, plus the Cloudflare layer. Run the validator to fix the file's grammar. Run this to audit its AI policy.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: RFC 9309 matcher (group merging, specificity, wildcards, Allow-wins-ties), 15 AI crawler tokens across 9 operators with per-role block-cost explanations, Cloudflare header + managed-robots.txt + Content-Signal detection, URL fetch with automatic /robots.txt resolution, shareable reports.",
    },
  ],

  relatedTools: [
    "ai-robots-txt-generator",
    "ai-crawler-log-analyzer",
    "geo-audit",
    "robots-txt-validator",
  ],

  notFor: [
    {
      text: "It doesn't lint general robots.txt syntax (unknown directives, missing sitemap): that's the Robots.txt Validator's job.",
      toolSlug: "robots-txt-validator",
    },
    {
      text: "It can't see Cloudflare's dashboard state. It detects that you're behind Cloudflare and tells you which settings to check, but only your dashboard shows whether the AI-bots toggle is on.",
    },
  ],
};

export default aiCrawlerAccessChecker;
