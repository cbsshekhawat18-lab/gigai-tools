import type { Tool } from "@/types";

/**
 * News Sitemap Generator, the Google-News member of the GigAI "Sitemaps" SEO
 * group. Turns a list of recent news articles into a spec-valid Google News
 * sitemap (`<urlset xmlns:news>`) with per-article publication name, language,
 * title and publication date, plus the strict News-specific validation Google
 * enforces: the 48-hour recency window, the 1,000-URL cap, and W3C dates.
 *
 * All copy is written uniquely for News-sitemap intent (Google News eligibility,
 * Publisher Center, "Top stories", the 2-day window) so the page ranks
 * independently from the general XML-sitemap, robots and schema siblings.
 */
const newsSitemapGenerator: Tool = {
  slug: "news-sitemap-generator",
  title: "News Sitemap Generator",
  description:
    "Build a valid Google News sitemap from your recent articles (with publication name, language, title and W3C publication date) and get warned about the 48-hour recency window and 1,000-URL cap. 100% in your browser.",
  category: "seo-tools",
  group: "Sitemaps",
  icon: "Newspaper",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "News Sitemap Generator: Create a Google News sitemap.xml",
  tagline:
    "Enter your last two days of articles and get a spec-valid Google News sitemap (publication name, language, title and publication date wrapped in <news:news>) validated live against Google's 48-hour window and 1,000-URL limit, and generated entirely in your browser.",
  longDescription:
    "The GigAI News Sitemap Generator converts a list of recently published articles into a Google News-compliant <urlset> that carries the news: namespace Google requires for News indexing. For each article you supply its URL, the publication name exactly as it appears in Google Publisher Center, the language code, the headline, and the publication date, and the tool wraps them in the correct <news:news> / <news:publication> / <news:publication_date> / <news:title> structure with all XML special characters escaped. A News sitemap is not a normal sitemap: Google only reads articles published in the last 48 hours, caps the file at 1,000 URLs, and expects W3C-format dates with a timezone. The tool checks all of this as you type. It flags articles older than two days that Google will ignore, warns as you approach 1,000 URLs, catches malformed or timezone-less dates, missing publication names or language codes, and non-HTTPS locations. When it's clean, copy the XML or download news-sitemap.xml, drop it at your site root, and submit it in Search Console (your site must already be accepted in Google News / Publisher Center). Unlike crawler-based tools that spider your site on a server, this runs 100% in your browser from the articles you paste, so nothing is uploaded, embargoed or unpublished stories never leave your machine, and there is no page cap beyond Google's own.",

  ctaText: "Generate news sitemap",

  keywords: [
    "news sitemap generator",
    "google news sitemap",
    "news sitemap xml",
    "create google news sitemap",
    "news sitemap generator free",
    "google news publisher sitemap",
    "news:news sitemap tag",
    "news sitemap validator",
    "google news indexing",
    "publication date sitemap",
    "top stories sitemap",
    "news xml sitemap online",
  ],

  seo: {
    title: "News Sitemap Generator: Create a Google News sitemap.xml Free | GigAI Tools",
    description:
      "Free Google News sitemap generator: add your recent articles with publication name, language, title and date, validate against the 48-hour window and 1,000-URL limit, and download news-sitemap.xml. 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "Newspaper",
      title: "Article list → valid news: sitemap",
      description:
        "Add each recent article and get a sitemaps.org 0.9 <urlset> with the Google news:0.9 namespace, correct <news:news> blocks and escaped values, ready to save as news-sitemap.xml.",
    },
    {
      icon: "Clock",
      title: "48-hour window enforcement",
      description:
        "Google only crawls articles published in the last two days. The tool flags anything older than 48 hours so you don't submit stale URLs Google will silently drop.",
    },
    {
      icon: "ShieldCheck",
      title: "News-specific validation",
      description:
        "Live checks for missing publication name or language, malformed or timezone-less dates, non-HTTPS URLs, duplicates, and the 1,000-URL News limit: before you export.",
    },
    {
      icon: "CalendarClock",
      title: "W3C / ISO 8601 date handling",
      description:
        "Publication dates are emitted in the RFC 3339 form Google expects (with a timezone), so <news:publication_date> is never rejected or ignored.",
    },
    {
      icon: "Languages",
      title: "Per-article publication & language",
      description:
        "Set a default publication name and language once, then override per article, ideal for multi-brand or multilingual news networks on one domain.",
    },
    {
      icon: "Download",
      title: "100% in your browser",
      description:
        "No crawler, no server, no upload. Copy the XML or download news-sitemap.xml locally, embargoed and unpublished drafts you're staging never leave your machine.",
    },
  ],

  benefits: [
    {
      title: "Get into Top Stories faster",
      description:
        "A correct News sitemap tells Google exactly which fresh articles to crawl, helping breaking stories reach Top Stories and the News tab while they're still timely.",
    },
    {
      title: "Stop wasting crawl on stale URLs",
      description:
        "By enforcing the 48-hour window and 1,000-URL cap up front, you only ever submit articles Google will actually index. No silently-dropped, expired entries.",
    },
    {
      title: "Ship XML Google won't reject",
      description:
        "Correct news: namespace, escaped fields and timezone-aware dates mean the file validates in Search Console instead of erroring on a missing tag or bad date.",
    },
    {
      title: "Keep embargoed stories private",
      description:
        "Because nothing is crawled or uploaded, you can build and preview a sitemap that includes pre-publish or embargoed URLs without exposing them to a third party.",
    },
  ],

  howTo: [
    {
      title: "Set your publication defaults",
      description:
        "Enter the publication name exactly as it appears in Google Publisher Center and its language code (e.g. en, en-GB, es). These apply to every article unless overridden.",
    },
    {
      title: "Add your last 48 hours of articles",
      description:
        "For each article add its URL, headline and publication date (with a timezone). Override the publication name or language per row for multi-brand or multilingual feeds.",
    },
    {
      title: "Review the live validation",
      description:
        "Watch for articles older than 48 hours, missing fields, bad dates, duplicates and the 1,000-URL limit. Fix any flagged rows before exporting.",
    },
    {
      title: "Copy or download news-sitemap.xml",
      description:
        "Copy the XML or download news-sitemap.xml, upload it to your domain root, and submit that URL in Google Search Console under Sitemaps.",
    },
    {
      title: "Keep it fresh",
      description:
        "Regenerate on each publish so the sitemap always reflects only the last two days. Reference it from robots.txt so crawlers rediscover it automatically.",
    },
  ],

  formats: {
    input: ["Article list", "Form fields"],
    output: ["XML"],
  },

  useCases: [
    {
      audience: "News SEO / publisher",
      title: "Feed breaking stories to Google News",
      description:
        "After each publish, regenerate the sitemap with only the newest articles so Google discovers breaking coverage inside its 48-hour crawl window.",
    },
    {
      audience: "Multi-brand network",
      title: "One domain, several publications",
      description:
        "Override the publication name per article to serve multiple titles that share a single news domain from one correctly-tagged News sitemap.",
    },
    {
      audience: "Multilingual newsroom",
      title: "Language-specific article feeds",
      description:
        "Set the language per article (en, fr, de, es) so Google associates each story with the right News edition and audience.",
    },
    {
      audience: "Developer",
      title: "Prototype before wiring automation",
      description:
        "Hand-build a valid News sitemap to confirm the exact tag structure and date format your CMS should emit before you automate generation.",
    },
  ],

  troubleshooting: [
    {
      problem: "Search Console reports my News sitemap has errors or no articles.",
      solution:
        "Google reads only articles published in the last 48 hours. If every URL is older than two days the sitemap looks empty. Regenerate with genuinely recent articles, and confirm your site is accepted in Google News / Publisher Center first.",
    },
    {
      problem: "The publication_date is being rejected.",
      solution:
        "Use the complete W3C / RFC 3339 form with a timezone: 2026-07-01T09:30:00+00:00 (or a date like 2026-07-01). A timezone-less or non-standard date is flagged and can be refused by Google.",
    },
    {
      problem: "My publication name doesn't match, so articles aren't grouped.",
      solution:
        "The <news:name> must match your publication's name in Google Publisher Center exactly: same spelling, casing and spacing. Set it as the default and only override when an article truly belongs to a different title.",
    },
    {
      problem: "I have more than 1,000 fresh articles.",
      solution:
        "A News sitemap allows at most 1,000 URLs. Split into multiple News sitemaps and reference them from a sitemap index, or trim to your most important recent stories.",
    },
  ],

  tips: [
    "List only articles from the last 48 hours: anything older is ignored by Google News and just clutters the file.",
    "Match <news:name> to your Google Publisher Center name exactly. A mismatch stops articles being attributed to your publication.",
    "Always include a timezone in the publication date (…+00:00) so Google reads the freshness correctly across regions.",
    "Regenerate the sitemap on every publish and keep it under 1,000 URLs so it stays inside both Google limits.",
    "Add a 'Sitemap: https://example.com/news-sitemap.xml' line to robots.txt so crawlers rediscover it automatically.",
  ],

  security:
    "Your articles are turned into a News sitemap entirely in your browser. There is no crawler and no upload. Nothing is stored, logged or transmitted, so you can safely build sitemaps that include embargoed, pre-publish or internal URLs. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is a Google News sitemap and how is it different from a normal sitemap?",
      answer:
        "A News sitemap uses the news: namespace and adds a <news:news> block to each URL with the publication name, language, title and publication date. Unlike a regular sitemap it covers only articles published in the last 48 hours, is capped at 1,000 URLs, and is meant to help Google News discover fresh stories quickly.",
    },
    {
      question: "How do I create a Google News sitemap?",
      answer:
        "Set your publication name and language, add each recent article's URL, headline and publication date, then copy or download news-sitemap.xml. This tool builds the whole file in your browser with the correct news: tags and escaping. No crawling or coding required.",
    },
    {
      question: "Why do you enforce a 48-hour window?",
      answer:
        "Google only crawls News-sitemap articles published within roughly the last two days. Older entries are ignored. The tool flags anything past that window so you don't submit stale URLs that Google will silently drop, keeping the sitemap focused on genuinely fresh coverage.",
    },
    {
      question: "How many articles can a News sitemap contain?",
      answer:
        "A Google News sitemap is limited to 1,000 URLs. The tool warns as you approach that cap. If you publish more fresh articles than that, split them across multiple News sitemaps and reference them from a sitemap index.",
    },
    {
      question: "What date format does <news:publication_date> need?",
      answer:
        "Use W3C Datetime / RFC 3339: either a date (2026-07-01) or, preferably, a full timestamp with a timezone (2026-07-01T09:30:00+00:00). Timezone-aware timestamps let Google judge freshness accurately, and malformed dates can cause the article to be rejected.",
    },
    {
      question: "Does having a News sitemap get me into Google News?",
      answer:
        "No. Your site must first be accepted into Google News, typically via Google Publisher Center. A News sitemap then helps Google discover your fresh articles faster, but it does not by itself grant News inclusion or guarantee Top Stories placement.",
    },
    {
      question: "Does this tool crawl my website?",
      answer:
        "No. It never spiders your site or makes a network request. You supply the article details and it generates the XML locally in your browser, which is why embargoed or unpublished URLs you paste are never uploaded and there is no crawler page limit.",
    },
    {
      question: "Can one News sitemap cover multiple publications or languages?",
      answer:
        "Yes. Set a default publication name and language, then override them per article. This lets a single news domain serve several titles or multiple language editions from one correctly-tagged News sitemap.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, article list to valid Google News <urlset> with news: namespace, default publication name/language, per-article overrides, copy and download.",
    },
    {
      date: "2026-06-26",
      change:
        "Added the 48-hour recency check, 1,000-URL limit warning, W3C date validation, duplicate and HTTPS detection, and a live validation panel.",
    },
    {
      date: "2026-07-01",
      change:
        "Added keyboard shortcuts, shareable links and ready-made example article sets (breaking news, multilingual, multi-brand).",
    },
  ],

  relatedTools: [
    "xml-sitemap-generator",
    "article-schema-generator",
    "meta-tag-generator",
    "google-serp-preview",
  ],
};

export default newsSitemapGenerator;
