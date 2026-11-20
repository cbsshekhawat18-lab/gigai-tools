import type { Tool } from "@/types";

/**
 * AI Crawler Log Analyzer — the tool where "client-side only" is architecture,
 * not marketing: access logs contain visitor IPs. The parser discards the IP
 * column outright and nothing is ever uploaded.
 */
const aiCrawlerLogAnalyzer: Tool = {
  slug: "ai-crawler-log-analyzer",
  title: "AI Crawler Log Analyzer",
  description:
    "Drop a server access log and see which AI crawlers actually visit: per-bot hit counts, first and last seen, most-fetched pages, status-code health, daily trend, and the pages no AI crawler has ever touched. Parsed in your browser: logs contain visitor IPs and never leave your device.",
  category: "geo-tools",
  group: "Crawler Access",
  icon: "ScrollText",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-08-22",

  h1: "AI Crawler Log Analyzer: Are the Bots Actually Reading Your Site?",
  tagline:
    "Every GEO article tells you to allow AI crawlers. None of them can tell you whether the crawlers came. Your server's access log can, and it's the only source that knows. Drop an nginx or Apache log here and get per-bot visit counts, last-seen timestamps, the pages each crawler reads most, the HTTP statuses they received, and a daily trend: for GPTBot, ClaudeBot, OAI-SearchBot, PerplexityBot, Bingbot and every other AI token. Parsed entirely in this browser tab, because access logs contain your visitors' IP addresses.",
  longDescription:
    "robots.txt tells you what crawlers are permitted to do. Logs tell you what they did. That gap is where most AI-visibility work goes wrong: a site can have a permissive robots.txt, a clean rendering setup and zero AI crawler traffic, because a firewall rule, a CDN, a WAF or a bot-management default is silently rejecting them upstream. This analyzer reads standard nginx and Apache combined/common-format logs and reports what actually happened, showing which of the tracked AI crawlers appeared, how many requests each made, when each was first and last seen, the paths each fetched most, the distribution of HTTP status codes they received (a bot getting 403s is worse than a bot not visiting), and a per-day activity trend so you can see whether crawling is growing, flat or stopped. It also inverts the question: paste your page URLs or sitemap and it lists the pages no AI crawler has ever fetched, which is usually a more actionable list than the ones they have. If zero AI hits appear, it says so bluntly and explains the three likely causes. The privacy architecture here is not a marketing line: access logs contain visitor IP addresses, so the file is read in your browser, the parser discards the IP column at parse time rather than storing it, and nothing is ever uploaded to any server.",

  ctaText: "Analyze my log",

  keywords: [
    "ai crawler log analyzer",
    "gptbot in server logs",
    "check ai bot traffic",
    "are ai crawlers visiting my site",
    "claudebot log analysis",
    "perplexitybot server logs",
    "ai crawler traffic analysis",
    "nginx log ai bots",
    "access log bot analyzer",
    "openai crawler logs",
  ],

  seo: {
    title: "AI Crawler Log Analyzer: Do GPTBot & ClaudeBot Visit You? | GigAI Tools",
    description:
      "Free in-browser access-log analyzer for AI crawlers: per-bot hits, last seen, top pages, status codes, daily trend, never-fetched pages. Logs contain IPs. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Lock",
      title: "Client-side because logs contain IP addresses",
      description:
        "The file is read in this tab and the parser discards the IP column outright. It is never stored, displayed or transmitted. This is the one tool where 'no upload' is a legal and ethical requirement, not a feature.",
    },
    {
      icon: "ChartColumn",
      title: "Per-bot activity with first and last seen",
      description:
        "Every AI crawler that appeared, with request counts, the date range it was active, and a daily trend chart showing whether its interest is growing or has stopped.",
    },
    {
      icon: "FileSearch",
      title: "What each crawler actually reads",
      description:
        "The top paths per bot, which reveal what a crawler thinks your site is about, and often that it's spending its budget on pages you don't care about.",
    },
    {
      icon: "TriangleAlert",
      title: "Status-code health per bot",
      description:
        "A crawler receiving 403s or 404s is being turned away, which looks like traffic in a naive count. The 2xx/3xx success rate per bot separates 'visited' from 'served'.",
    },
    {
      icon: "SearchX",
      title: "Pages that have NEVER been fetched",
      description:
        "Paste your URL list or sitemap and get the inverse report: the pages no AI crawler has ever touched. Usually the most actionable output in the whole tool.",
    },
    {
      icon: "MessageCircleWarning",
      title: "A blunt warning on zero hits",
      description:
        "If no AI crawler appears at all, the tool says so plainly and names the three likely causes: log window, robots/firewall blocking, or a CDN answering bots before your origin ever sees them.",
    },
  ],

  benefits: [
    {
      title: "Replace assumption with evidence",
      description:
        "Allowing crawlers in robots.txt is a permission, not an outcome. Logs are the only proof that permission turned into visits.",
    },
    {
      title: "Catch upstream blocking that robots.txt can't show",
      description:
        "A permissive file plus zero hits points straight at a firewall, WAF or CDN rule: a diagnosis you cannot reach any other way.",
    },
    {
      title: "Find the pages AI has never seen",
      description:
        "Crawl coverage is uneven and heavily skewed to whatever is well-linked. The never-fetched list tells you where internal linking or sitemap work will pay off.",
    },
    {
      title: "Handle sensitive data correctly",
      description:
        "Uploading raw access logs to a third-party service means uploading your visitors' IP addresses. This tool makes that impossible by design.",
    },
  ],

  howTo: [
    {
      title: "Export a log",
      description:
        "Typically /var/log/nginx/access.log or /var/log/apache2/access.log. Gunzip rotated files first (gunzip access.log.1.gz). A month of data gives the most useful trend.",
    },
    {
      title: "Drop it in",
      description:
        "The file is read locally in this tab. Nothing uploads. The parser drops the IP column as it reads. Files up to 200 MB are handled.",
    },
    {
      title: "Read the verdict and per-bot cards",
      description:
        "Total AI requests, how many distinct crawlers, the log's date range, then a card per bot with counts, dates, top paths, statuses and daily trend.",
    },
    {
      title: "Optionally add your page URLs",
      description:
        "Paste your sitemap URLs or paths into the box at the bottom to get the never-fetched list.",
    },
    {
      title: "Act on the gaps",
      description:
        "No hits at all: check crawler access and your CDN. Hits with poor status codes: check what's rejecting them. Never-fetched pages: improve internal linking and sitemap coverage.",
    },
  ],

  formats: {
    input: ["LOG", "TXT"],
    output: ["Report"],
  },

  useCases: [
    {
      audience: "Site owner",
      title: "Settle the question definitively",
      description:
        "\"Is ChatGPT reading my site?\" has exactly one authoritative answer, and it's in your access log. Ten seconds to find out.",
    },
    {
      audience: "DevOps / SRE",
      title: "Diagnose upstream bot blocking",
      description:
        "When robots.txt is clean but crawlers never arrive, the log proves the blocking is happening above the application, and the status codes narrow down where.",
    },
    {
      audience: "SEO specialist",
      title: "Measure crawl coverage, not just permission",
      description:
        "Per-bot top paths plus the never-fetched list turn AI crawl budget from an abstraction into a specific list of neglected URLs.",
    },
    {
      audience: "Publisher",
      title: "Verify a blocking policy is being honored",
      description:
        "If you deliberately blocked training crawlers, the log shows whether they stopped: including whether Bytespider, which has a history of ignoring robots.txt, actually complied.",
    },
  ],

  troubleshooting: [
    {
      problem: "Only a fraction of my lines were parsed.",
      solution:
        "The parser expects the nginx/Apache combined or common log format. Custom log_format directives that reorder or omit fields won't match. Either export in the default format or configure a matching one. The report tells you what proportion matched so you know how much you're missing.",
    },
    {
      problem: "Zero AI crawler hits, but my robots.txt allows everything.",
      solution:
        "Three usual causes: the log window predates AI crawling on your site. A firewall, WAF or Cloudflare's AI-bots setting is rejecting them before your origin, or a CDN is serving them from cache so requests never reach the origin log. Check the crawler access checker for the Cloudflare signal, then look at CDN-level logs.",
    },
    {
      problem: "A bot has thousands of hits but a low success rate.",
      solution:
        "It's being turned away, not served. Look at which statuses dominate: 403 usually means a WAF or bot rule, 404 means it's crawling URLs that no longer exist (often stale sitemap entries), 429 means rate limiting. Fix the cause, or the visits are worthless.",
    },
    {
      problem: "My log file is compressed.",
      solution:
        "Gunzip it first (gunzip access.log.2.gz): compressed logs aren't parsed, and the tool will tell you so rather than failing silently. Concatenating several days into one file before dropping it gives a better trend.",
    },
  ],

  tips: [
    "A month of logs is the sweet spot: enough to see a trend, small enough to parse instantly.",
    "User-agent strings can be spoofed. High-confidence verification means reverse-DNS checking the IP against the operator's documented ranges. This tool identifies by user-agent, which is right for measuring interest, not for security decisions.",
    "Compare bots against each other rather than against an absolute target: if Bingbot visits 6,000 times and OAI-SearchBot 12, the ratio is the finding.",
    "If you're behind a CDN, origin logs undercount badly: cached responses never reach your server. Pull CDN logs for the true picture.",
    "Run this after changing robots.txt: crawlers re-read the file within about a day, so a week later the log shows whether your change had the effect you intended.",
  ],

  security:
    "Access logs contain your visitors' IP addresses, which is exactly why this tool never uploads them. The file is read in your browser, the IP field is discarded during parsing rather than stored, and no request carrying log data is ever made. Close the tab and nothing remains.",

  faq: [
    {
      question: "How do I know if AI crawlers are visiting my website?",
      answer:
        "Check your server's access log for their user-agent strings: that's the only authoritative source. Drop an nginx or Apache log here and you'll see every AI crawler that appeared, how many requests it made, when it was last seen and which pages it fetched. Analytics tools like GA4 won't show this, because bots don't execute JavaScript.",
    },
    {
      question: "Why can't I just use Google Analytics for this?",
      answer:
        "GA4 and similar tools work by running JavaScript in a visitor's browser. AI crawlers don't execute JavaScript, so they are structurally invisible to analytics. Server logs record every HTTP request regardless of what the client runs, which makes them the only complete record of bot traffic.",
    },
    {
      question: "Why does this tool refuse to upload my log?",
      answer:
        "Because access logs contain the IP addresses of every human who visited your site: personal data under GDPR and similar regimes. Uploading them to a third-party analyzer means disclosing your visitors' data to that third party. This tool parses in your browser and discards the IP column at parse time, so the question never arises.",
    },
    {
      question: "What does it mean if no AI crawlers appear in my log?",
      answer:
        "Three possibilities worth checking in order. First, your log window may predate AI crawling of your site: try a longer period. Second, something may be blocking them: check robots.txt with the AI Crawler Access Checker and, critically, check whether Cloudflare's AI-bots firewall setting is on. Third, if you use a CDN, crawler requests may be served from edge cache and never reach the origin log at all.",
    },
    {
      question: "How often should AI crawlers visit?",
      answer:
        "There's no universal target. It scales with your site's size, update frequency and authority. What matters more than the absolute number is the pattern: is your most important content being fetched, are the search-index bots (OAI-SearchBot, Claude-SearchBot, PerplexityBot, Bingbot) present at all, and is the trend flat, growing or stopped? The tool surfaces all three.",
    },
    {
      question: "Can crawlers fake their user-agent?",
      answer:
        "Yes. Anyone can send any user-agent string. For measuring genuine crawler interest that rarely matters, and this tool identifies by user-agent accordingly. If you need certainty (for a security or blocking decision), verify with reverse DNS against the operator's published IP ranges. Each crawler's documentation covers the method.",
    },
    {
      question: "What log formats work?",
      answer:
        "The nginx and Apache combined and common formats, which are the defaults on both servers. The report tells you what percentage of lines it successfully parsed, so a custom log_format is obvious immediately rather than producing a quietly incomplete picture.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: in-browser combined/common log parsing with IP discarded at parse time, per-bot hit counts, first/last seen, top paths, status-code health, 30-day trend bars, never-fetched page detection from a pasted URL list, and blunt zero-hit diagnosis.",
    },
  ],

  relatedTools: [
    "ai-crawler-access-checker",
    "ai-robots-txt-generator",
    "geo-audit",
    "js-rendering-checker",
  ],

  notFor: [
    {
      text: "It doesn't analyze human traffic, referrers or conversions. It looks only for AI crawler user-agents.",
    },
    {
      text: "It can't verify a crawler's identity cryptographically. User-agent matching measures interest, not authenticity.",
    },
  ],
};

export default aiCrawlerLogAnalyzer;
