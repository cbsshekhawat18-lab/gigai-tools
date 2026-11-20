import type { Tool } from "@/types";

/**
 * robots.txt Validator & Tester: the flagship of the GigAI "Robots" SEO group.
 *
 * Paste a robots.txt and the tool parses it into User-agent groups, then lints
 * for the mistakes that silently wreck crawling: a bare `Disallow: /` that
 * blocks the whole site, rules that appear before any User-agent, unknown or
 * misspelled directives, a missing Sitemap line, and relative sitemap URLs.
 * Everything runs on `validateRobots` from the in-browser robots engine. No
 * crawl, no upload, no server.
 *
 * Every line of copy here is written uniquely for robots.txt validation intent
 * (blocked pages, "Blocked by robots.txt" in Search Console, crawl budget) so
 * the page ranks independently from the sitemap / meta / schema siblings.
 */
const robotsTxtValidator: Tool = {
  slug: "robots-txt-validator",
  title: "Robots.txt Validator",
  description:
    "Paste your robots.txt to parse it into User-agent groups and catch the mistakes that block Google: a stray Disallow: /, rules before any User-agent, unknown directives and a missing sitemap. 100% in your browser.",
  category: "seo-tools",
  group: "Robots",
  icon: "ShieldQuestion",
  accent: "amber",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "Robots.txt Validator & Tester. Check Your robots.txt Online",
  tagline:
    "Paste your robots.txt and instantly see how crawlers read it: every User-agent group, its Allow and Disallow rules, and a plain-English warning the moment a directive would block your whole site, sit in the wrong place, or go unrecognised. Parsed live and entirely in your browser. No crawl, no upload, no signup.",
  longDescription:
    "The GigAI Robots.txt Validator parses a pasted robots.txt exactly the way search-engine crawlers group it (a run of User-agent lines followed by their Allow, Disallow and Crawl-delay rules) and then lints the result for the errors that quietly cost you traffic. It flags the single most damaging mistake, a lone `Disallow: /` that blocks the entire site from that crawler, and highlights groups that have no rules at all (and therefore allow everything). It catches Allow/Disallow lines that appear before any User-agent, unknown or misspelled directives (a stray `Dissallow` or `User-Agents` does nothing), Crawl-delay values that aren't numbers, and Sitemap lines that use a relative path instead of the absolute URL crawlers require. It also warns when there is no Sitemap directive at all, since that is the simplest way to help engines discover your sitemap.xml. Unlike checkers that fetch your live domain from a server, this reads only the text you paste, so it works on staging files, pre-launch drafts and copies you are editing before you deploy, none of which leave your machine. Paste, read the grouped breakdown and the warnings, fix the flagged lines, and ship a robots.txt you can trust before Google ever sees it.",

  ctaText: "Validate robots.txt",

  keywords: [
    "robots.txt validator",
    "robots.txt tester",
    "robots.txt checker",
    "validate robots.txt",
    "test robots.txt online",
    "robots.txt syntax checker",
    "disallow all robots",
    "blocked by robots.txt",
    "robots.txt disallow rules",
    "crawl budget robots.txt",
    "user-agent disallow",
  ],

  seo: {
    title: "Robots.txt Validator & Tester: Check robots.txt Free | GigAI Tools",
    description:
      "Free online robots.txt validator: paste your file to see how crawlers group it, catch a stray Disallow: /, rules before any User-agent, unknown directives and a missing sitemap. 100% in-browser, no crawl.",
  },

  features: [
    {
      icon: "ListTree",
      title: "Parsed the way crawlers group it",
      description:
        "See every User-agent group with its Allow, Disallow and Crawl-delay rules laid out separately: exactly how Googlebot and Bingbot bucket consecutive User-agent lines into one rule set.",
    },
    {
      icon: "ShieldAlert",
      title: "Catches the site-killing Disallow: /",
      description:
        "The moment a group blocks your whole site with a bare Disallow: /, it's flagged in red, the single most common reason pages vanish from Google after a launch or migration.",
    },
    {
      icon: "SearchX",
      title: "Unknown & misspelled directives",
      description:
        "A stray Dissallow, User-Agents or Noindex does nothing at all. The linter surfaces every directive crawlers won't recognise, with the exact line number.",
    },
    {
      icon: "MapPin",
      title: "Sitemap & absolute-URL checks",
      description:
        "Warns when there's no Sitemap directive to help discovery, and when a Sitemap line uses a relative path instead of the absolute https:// URL the protocol requires.",
    },
    {
      icon: "ScanLine",
      title: "Line-numbered warnings",
      description:
        "Every issue points at the offending line (rules before a User-agent, non-numeric Crawl-delay, empty groups) so you fix the file, not guess at it.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "No crawler, no fetch, no server. Your robots.txt, including staging and pre-launch drafts, is parsed locally and never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Stop accidentally blocking Google",
      description:
        "A single misplaced Disallow: / can deindex an entire site. Validating before you deploy catches it while it's still a one-character fix, not a traffic emergency.",
    },
    {
      title: "Understand what your file actually says",
      description:
        "robots.txt grouping is unintuitive: blank lines start new groups, consecutive User-agents share one. The grouped view shows the real rule set each crawler sees.",
    },
    {
      title: "Fix silent, invisible mistakes",
      description:
        "Misspelled directives and rules before a User-agent don't error: they're simply ignored. The linter makes those silent failures visible before they cost you crawling.",
    },
    {
      title: "Validate drafts privately",
      description:
        "Because nothing is fetched or uploaded, you can check a staging robots.txt or an edit-in-progress that isn't live yet without exposing it to anyone.",
    },
  ],

  howTo: [
    {
      title: "Paste your robots.txt",
      description:
        "Copy the contents of your file (usually at https://example.com/robots.txt) and paste it in, or drop a .txt file. Comments (#) and blank lines are handled just like a crawler handles them.",
    },
    {
      title: "Read the grouped breakdown",
      description:
        "See each User-agent group with its Allow, Disallow and Crawl-delay rules, plus the Sitemap and Host lines pulled out separately: the exact rule set crawlers apply.",
    },
    {
      title: "Review the warnings",
      description:
        "Work through the flagged issues: a site-wide Disallow: /, empty groups, unknown directives, misplaced rules, a missing or relative Sitemap. Each points at a line number.",
    },
    {
      title: "Fix and re-paste",
      description:
        "Correct the flagged lines in your editor and paste again to confirm it's clean. When it validates, deploy the file to your domain root.",
    },
    {
      title: "Confirm in Search Console",
      description:
        "After deploying, use Google Search Console's robots.txt report and URL Inspection to verify important URLs are Allowed and the file is being fetched.",
    },
  ],

  formats: {
    input: ["TXT", "robots.txt"],
    output: ["Report"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Diagnose 'Blocked by robots.txt'",
      description:
        "When Search Console reports pages blocked by robots.txt, paste the file to see which Disallow rule and which User-agent group is catching those URLs.",
    },
    {
      audience: "Web developer",
      title: "Pre-launch safety check",
      description:
        "Staging sites ship with Disallow: / to stay out of the index. Validate before go-live so that block is removed and the production file actually allows crawling.",
    },
    {
      audience: "DevOps / platform",
      title: "Verify a generated robots.txt",
      description:
        "When a framework or CDN emits robots.txt from config, paste the rendered output to confirm the directives, User-agents and sitemap line came out as intended.",
    },
    {
      audience: "Agency / freelancer",
      title: "Audit a client's file fast",
      description:
        "Drop a client's robots.txt in for an instant read on whether crawling is open, over-restricted, or riddled with directives that do nothing.",
    },
  ],

  troubleshooting: [
    {
      problem: "Search Console says my pages are 'Blocked by robots.txt' but I don't see why.",
      solution:
        "Paste the file here and read the grouped view. Remember crawlers match the most specific User-agent group, and a bare Disallow: / in the group that matches Googlebot blocks everything. Also check for a path prefix like Disallow: /blog that catches more URLs than you expected.",
    },
    {
      problem: "I added Noindex: / to robots.txt but the page still ranks.",
      solution:
        "Noindex is not a valid robots.txt directive, the linter flags it as unknown, and crawlers ignore it. To keep a page out of the index, remove any Disallow that blocks it and add a <meta name=\"robots\" content=\"noindex\"> tag (or an X-Robots-Tag header) so the crawler can read the page and see the noindex.",
    },
    {
      problem: "My Sitemap line is being flagged.",
      solution:
        "The Sitemap directive must be an absolute URL, e.g. Sitemap: https://example.com/sitemap.xml, not a relative path like /sitemap.xml. Put it on its own line. It applies site-wide regardless of which User-agent group it sits near.",
    },
    {
      problem: "One of my groups shows a warning that it 'allows everything'.",
      solution:
        "A User-agent group with no Allow or Disallow rules imposes no restrictions, so that crawler can access the whole site. That's often intended, but if you meant to restrict it, add the Disallow rules under that User-agent line.",
    },
  ],

  tips: [
    "robots.txt controls crawling, not indexing. A blocked URL can still appear in results without a snippet. Use a meta robots noindex tag (on a crawlable page) to keep something out of the index.",
    "Blank lines start a new group. Keep each User-agent and its rules together with no empty line between them, or the rules can detach from the agent you intended.",
    "List the Sitemap as an absolute URL on its own line. It's read site-wide and is the easiest way to help every crawler discover your sitemap.xml.",
    "Test the real production file at https://example.com/robots.txt, not a local draft. The file crawlers obey is the one served at your domain root.",
    "Disallow is a prefix match: Disallow: /admin also blocks /administrator. Be precise, and use Allow to carve out exceptions within a blocked path.",
  ],

  security:
    "Your robots.txt is parsed and linted entirely in your browser. There is no crawler and no upload. Nothing is stored, logged or transmitted, so you can safely validate staging, pre-launch or edit-in-progress files. Close the tab and every trace is gone.",

  faq: [
    {
      question: "How do I validate my robots.txt file?",
      answer:
        "Open your file at https://yourdomain.com/robots.txt (or your local draft), copy its contents, and paste them into the tool. It parses the file into User-agent groups and immediately lists every warning (a site-wide Disallow, unknown directives, misplaced rules, a missing sitemap) with line numbers. Fix the flagged lines and paste again to confirm it's clean.",
    },
    {
      question: "What does Disallow: / do?",
      answer:
        "Disallow: / under a User-agent blocks that crawler from your entire site. It's the correct rule for a staging environment you want kept out of search, but on production it deindexes everything that crawler can reach. The validator flags it in red so you never ship it to a live site by accident.",
    },
    {
      question: "Does robots.txt stop a page from being indexed?",
      answer:
        "No. robots.txt only tells crawlers what they may crawl. It does not remove a URL from the index. A page blocked by robots.txt can still appear in Google (usually without a description) if other pages link to it. To keep a page out of the index, let crawlers reach it and add a meta robots noindex tag or an X-Robots-Tag: noindex header.",
    },
    {
      question: "Why is my directive being marked as unknown?",
      answer:
        "Crawlers recognise a fixed set of directives (User-agent, Allow, Disallow, Crawl-delay, Sitemap, Host and a few others). Anything else, including common typos like Dissallow or invalid lines like Noindex, is silently ignored by crawlers and does nothing. The validator surfaces these so you can correct the spelling or remove the line.",
    },
    {
      question: "Where should the Sitemap line go?",
      answer:
        "Anywhere in the file, on its own line, as an absolute URL: Sitemap: https://example.com/sitemap.xml. It is not tied to a User-agent group and applies site-wide. The validator warns if it's missing (so crawlers have to find your sitemap another way) or if it uses a relative path instead of a full URL.",
    },
    {
      question: "How do crawlers group User-agent lines?",
      answer:
        "Consecutive User-agent lines with no blank line between them form a single group that shares the following Allow/Disallow rules. A blank line, or a rule line, ends the run. Each crawler obeys the most specific group that names it, falling back to the User-agent: * group. The grouped breakdown shows exactly how your lines bucket.",
    },
    {
      question: "Can I check a live URL instead of pasting?",
      answer:
        "This tool is paste-first by design: it validates the text you provide entirely in your browser, with no server fetching your domain. That's what lets it work on staging and unpublished files privately. To confirm behaviour on a live URL, deploy the file and use Google Search Console's robots.txt report and URL Inspection tool.",
    },
    {
      question: "Does Crawl-delay work for Google?",
      answer:
        "Googlebot ignores Crawl-delay. You control Google's crawl rate in Search Console instead. Bing, Yandex and some other crawlers do honour it. The validator checks that any Crawl-delay value you set is a valid number, since a non-numeric value is simply discarded.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, paste-first robots.txt parser and linter: User-agent grouping, Allow/Disallow breakdown, site-wide Disallow detection, unknown-directive and missing-sitemap warnings, all in-browser.",
    },
    {
      date: "2026-06-26",
      change:
        "Added line-numbered warnings, relative-sitemap and non-numeric Crawl-delay checks, drag-and-drop .txt import, and a grouped rules view with Sitemap/Host pulled out.",
    },
    {
      date: "2026-06-30",
      change:
        "Added a scored summary, ready-made example files (clean, blocks-everything, messy), keyboard shortcuts and copy of the report.",
    },
  ],

  relatedTools: [
    "xml-sitemap-generator",
    "sitemap-validator",
    "meta-tag-analyzer",
    "canonical-url-generator",
  ],
};

export default robotsTxtValidator;
