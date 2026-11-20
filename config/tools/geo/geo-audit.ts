import type { Tool } from "@/types";

/**
 * GigAI GEO Audit — the hero of the GEO Studio. One URL in, one sectioned
 * report out, every finding linking to the component tool that fixes it.
 * The audit is the front door; the ten component tools are the repair bay.
 */
const geoAudit: Tool = {
  slug: "geo-audit",
  title: "GigAI GEO Audit",
  titleNoun: "GEO audit",
  description:
    "One URL in, one AI-visibility report out: crawler access with Cloudflare detection, JS rendering, citability scored with published methodology, retrieval chunks, answer snippets and schema. Each finding linked to the free tool that fixes it.",
  category: "geo-tools",
  group: "Audit",
  icon: "Radar",
  accent: "orange",
  status: "live",
  featured: true,
  createdAt: "2026-08-22",
  serverSide: true,

  h1: "GEO Audit: Test Any Page's AI Visibility Free",
  tagline:
    "Enter one URL and get a complete AI-visibility report in about ten seconds, free and with no signup. It checks whether AI crawlers can reach the page, whether the content exists without JavaScript, whether there is anything a model could actually cite, whether the fragments survive retrieval, and whether the identity is machine-readable. Findings are ordered worst-first, and each one links to the free tool that fixes it.",
  longDescription:
    "The GigAI GEO Audit answers the question the 200-dashboard AI-visibility industry charges $99+/month to monitor: is there anything technically stopping AI systems from finding, reading and citing this page? It makes three stateless fetches (your page, your robots.txt, your llms.txt), then runs every analysis in your browser. Crawler access is computed with real RFC 9309 robots.txt matching for 14 AI crawler tokens. GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Googlebot, Google-Extended, Bingbot, Applebot-Extended, meta-externalagent, Bytespider and CCBot, and quotes the exact rule line behind each verdict, plus a Cloudflare check, because Cloudflare now blocks AI crawlers at the firewall by default on new zones regardless of robots.txt. Rendering analysis counts the words a JavaScript-free crawler actually receives and spots client-rendering framework markers. Citability is scored with the factors the published GEO study (Aggarwal et al., KDD 2024) measured as increasing AI citation, with every formula shown. The chunk section slices the page the way a RAG pipeline does and reports how many fragments fail standalone. The result is not a score to subscribe to: it's a repair list, and every line of it links to a free GigAI tool that does the repair.",

  ctaText: "Run a free GEO audit",

  keywords: [
    "geo audit",
    "ai visibility checker",
    "ai seo audit",
    "generative engine optimization audit",
    "check ai visibility free",
    "llm seo checker",
    "is my site visible to chatgpt",
    "ai search optimization test",
    "geo score",
    "ai citability audit",
  ],

  seo: {
    title: "Free GEO Audit: Test Your Page's AI Visibility | GigAI Tools",
    description:
      "One URL, one AI-visibility report: AI crawler access (with Cloudflare detection), JS rendering, citability with published methodology, retrieval chunks and schema. Free, no signup.",
  },

  features: [
    {
      icon: "Bot",
      title: "14 AI crawler verdicts with the deciding line quoted",
      description:
        "Real RFC 9309 robots.txt matching (group specificity, wildcards, longest-match, Allow beating Disallow on ties) for every OpenAI, Anthropic, Perplexity, Google, Microsoft, Apple, Meta, ByteDance and Common Crawl token.",
    },
    {
      icon: "CloudOff",
      title: "Catches the Cloudflare block robots.txt can't show",
      description:
        "Cloudflare now blocks AI crawlers by default on new zones and can inject managed robots.txt rules above yours. The audit reads the response headers and the file itself for both signals and tells you the exact dashboard setting to check.",
    },
    {
      icon: "MonitorOff",
      title: "What a no-JavaScript crawler actually sees",
      description:
        "Counts the words in the raw HTML, detects client-rendering framework markers (Next.js flight data, empty SPA shells, Nuxt payloads) and estimates how much content is trapped in serialized JS.",
    },
    {
      icon: "Quote",
      title: "Citability scored with published methodology",
      description:
        "Fact density, source citations and quotability (the factors the KDD 2024 GEO study measured) plus answer-first openings, question headings and self-containment. Every sub-score shows its formula.",
    },
    {
      icon: "Puzzle",
      title: "Retrieval chunk survival",
      description:
        "The page is sliced the way a RAG system slices it (heading sections, then ~300-token windows). You get the count of fragments that would be incomprehensible retrieved alone.",
    },
    {
      icon: "Wrench",
      title: "Every finding links to its fix",
      description:
        "This is a repair list, not a subscription hook. Each failing check links to the free GigAI tool that digs deeper or generates the fix: robots policy, schema, snippets, chunks.",
    },
  ],

  benefits: [
    {
      title: "Answer the question before buying the dashboard",
      description:
        "AI-visibility monitoring platforms track how often you're cited over months. None of that matters if GPTBot is blocked or your content only exists after hydration. The audit settles the technical layer for free, first.",
    },
    {
      title: "Evidence, not a verdict",
      description:
        "Every verdict quotes its source: the robots.txt line, the framework marker, the counted statistics, the failing chunk. You can check our work. Which is exactly what makes the report trustworthy enough to act on.",
    },
    {
      title: "Severity-ordered, so you fix the right thing first",
      description:
        "Sections are ordered worst-first. A perfect citability score is irrelevant while crawlers are firewalled out. The report never lets polish hide a foundation problem.",
    },
    {
      title: "Shareable deep link",
      description:
        "Every report has a URL that reproduces it live: send it to a client, a developer or a skeptical boss, and they see the same evidence, not a screenshot.",
    },
  ],

  howTo: [
    {
      title: "Enter any page URL",
      description:
        "Your homepage, a key article, a product page: the audit works per-page, because that's how retrieval works. Audit the pages you want cited.",
    },
    {
      title: "Watch the three fetches",
      description:
        "The page, robots.txt and llms.txt are fetched statelessly through our proxy (fetched, analyzed, discarded). Everything else runs in your browser.",
    },
    {
      title: "Read the report worst-first",
      description:
        "Six sections, each scored 0–100 and sorted by severity: crawler access, rendering, citability, chunks, answer snippets, machine-readable identity.",
    },
    {
      title: "Open the linked tool for each failing finding",
      description:
        "Each finding names its fix and links the component tool: generate a correct AI robots policy, see the exact failing chunks, get per-section rewrite targets.",
    },
    {
      title: "Re-run after you ship",
      description:
        "The audit is stateless and unlimited. Fix, redeploy, re-run: the score moves when the evidence moves.",
    },
  ],

  formats: {
    input: ["URL"],
    output: ["Report", "Share link"],
  },

  useCases: [
    {
      audience: "SEO / marketing lead",
      title: "The pre-dashboard sanity check",
      description:
        "Before committing to a paid AI-visibility platform, confirm the technical layer is clean. A $99/month dashboard can't fix a robots.txt block. A free audit finds it in ten seconds.",
    },
    {
      audience: "Content team",
      title: "Audit the money pages",
      description:
        "Run the guide or landing page you most want cited by ChatGPT and Perplexity. The citability and snippet sections give per-section rewrite targets, not vague advice.",
    },
    {
      audience: "Developer",
      title: "Verify a framework migration",
      description:
        "Moved to a new framework or rendering strategy? The rendering section shows exactly how many words survive without JavaScript, with the framework markers it found as evidence.",
    },
    {
      audience: "Agency",
      title: "A client-ready report with receipts",
      description:
        "The share link reproduces the full report live. Every claim in it is backed by a quoted rule, a counted number or a listed fragment: the kind of audit a client can't dismiss.",
    },
  ],

  troubleshooting: [
    {
      problem: "The audit says it couldn't fetch my page.",
      solution:
        "Some sites block all automated requests at the firewall (which, note, may also be blocking AI crawlers: that's a finding in itself). Use the component tools in paste mode: paste your robots.txt into the AI Crawler Access Checker and your page HTML into the citability and chunk tools.",
    },
    {
      problem: "My crawler-access section is perfect but AI tools still can't read my site.",
      solution:
        "robots.txt is a request, not a gate. Check the Cloudflare finding in the report: the 'AI bots' firewall setting blocks crawlers before they ever read robots.txt, and it defaults ON for new Cloudflare zones. The audit flags Cloudflare from response headers, but only the dashboard shows the toggle's state.",
    },
    {
      problem: "Why does my score differ from my AI-visibility platform's score?",
      solution:
        "Different question. Monitoring platforms measure how often you appear in AI answers (outcome). This audit measures whether anything technically prevents you from appearing (mechanism), with the arithmetic shown. Fix the mechanisms. The outcome metrics follow.",
    },
    {
      problem: "The rendering section flags my site but it looks fine in Google.",
      solution:
        "Googlebot renders JavaScript. Most AI crawlers don't. A page can rank in Google while being nearly empty to GPTBot, ClaudeBot and PerplexityBot. That gap is precisely what this section measures.",
    },
  ],

  tips: [
    "Audit individual pages, not just the homepage. Retrieval is per-page, and your most-citable page is usually a specific guide, not the front door.",
    "Fix sections in the order the report shows them: access before rendering, rendering before content. Polishing citability on a page crawlers can't read is wasted work.",
    "Re-run the audit from the share link after deploying fixes. The diff between two runs is your changelog of real progress.",
    "A blocked training bot (GPTBot, ClaudeBot) can be a deliberate policy: the audit marks those as informational, not failures. Make sure it's your policy and not a CDN default.",
    "Pair the audit with your server logs in the AI Crawler Log Analyzer: the audit says whether bots CAN read you. The logs say whether they DO.",
  ],

  security:
    "The page, robots.txt and llms.txt are fetched through our stateless proxy: it fetches, returns the content for analysis, and stores nothing, no URLs logged, no results kept. All scoring runs in your browser. The share link encodes only the audited URL itself.",

  faq: [
    {
      question: "What is a GEO audit?",
      answer:
        "A GEO (Generative Engine Optimization) audit checks whether AI systems (ChatGPT, Claude, Perplexity, Gemini and the search indexes they retrieve through) can find, read and cite a page. This one checks six layers: AI crawler access in robots.txt (with the deciding rule quoted), Cloudflare firewall signals, JavaScript-free readability, content citability, retrieval chunk survival, and machine-readable identity via structured data.",
    },
    {
      question: "How is this different from AI visibility monitoring tools?",
      answer:
        "Monitoring platforms (Profound, Peec, Otterly and ~200 others) track how often your brand appears in AI answers over time: an outcome metric, priced monthly. This audit checks the technical layer underneath: whether anything prevents you from appearing at all. It's the free check to run before, or instead of, paying for monitoring.",
    },
    {
      question: "Which AI crawlers does the audit check?",
      answer:
        "Fifteen tokens across nine operators: GPTBot, OAI-SearchBot and ChatGPT-User (OpenAI). ClaudeBot, Claude-SearchBot and Claude-User (Anthropic). PerplexityBot and Perplexity-User. Googlebot and Google-Extended. Bingbot (which ChatGPT Search retrieves through). Applebot-Extended. Meta-externalagent. Bytespider, and CCBot (Common Crawl). Each gets an allowed/blocked/unspecified verdict with the matching robots.txt line quoted.",
    },
    {
      question: "Why does the audit check Cloudflare?",
      answer:
        "Because Cloudflare changed its defaults: new zones block AI crawlers at the firewall, and a managed robots.txt feature can inject Disallow rules above your own. Thousands of sites are blocking AI without anyone having edited a file. The audit detects Cloudflare from response headers and managed-section markers in robots.txt, and points you to the exact dashboard settings to review.",
    },
    {
      question: "What methodology does the citability score use?",
      answer:
        "The three content factors (fact density, source citations, quotability) come from the GEO study (Aggarwal et al., KDD 2024, from Princeton, Georgia Tech and IIT Delhi) which measured which content edits increased visibility in generative-engine answers across 10,000 queries. Three structural factors (answer-first openings, question headings, self-containment) reflect how retrieval systems select passages. Every sub-score displays its formula and its counted evidence.",
    },
    {
      question: "Does a good GEO score guarantee AI systems will cite me?",
      answer:
        "No, and be suspicious of any tool that promises that. Citation depends on competition, query demand and model behavior nobody controls. What the audit guarantees is narrower and more useful: it finds the technical and structural problems that make citation impossible or unlikely, and each one is fixable with the linked tool.",
    },
    {
      question: "Is the audit really free? What's the catch?",
      answer:
        "Free, no account, no usage cap, no trial that expires. The audit exists because we needed it for our own site and because people who run it discover the other 270+ free GigAI tools. That's the whole model.",
    },
    {
      question: "Can I audit a staging or local site?",
      answer:
        "The URL fetch needs a publicly reachable page. For staging or localhost, use the component tools in paste mode: paste robots.txt into the crawler checker and page HTML into the citability, chunk and snippet tools. Every analysis works on pasted input in your browser.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: six-section audit (crawler access with RFC 9309 matching + Cloudflare detection, JS rendering, GEO-study citability, retrieval chunks, answer snippets, schema/identity), severity ordering, per-finding tool links, shareable deep-link reports.",
    },
  ],

  relatedTools: [
    "ai-crawler-access-checker",
    "js-rendering-checker",
    "content-citability-scorer",
    "retrieval-chunk-preview",
  ],

  notFor: [
    {
      text: "It does not monitor how often AI assistants mention your brand over time: that's outcome tracking, which needs continuous paid API querying. This audit checks the technical layer that makes mentions possible.",
    },
    {
      text: "It audits one page per run, not a whole site crawl. Run it on each page you want cited.",
    },
  ],
};

export default geoAudit;
