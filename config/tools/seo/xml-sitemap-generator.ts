import type { Tool } from "@/types";

/**
 * XML Sitemap Generator: the flagship of the GigAI "Sitemaps" SEO group.
 * Turns a plain list of URLs into a spec-valid `<urlset>` sitemap.xml, with
 * per-URL changefreq / priority / lastmod overrides, sane defaults, live
 * validation against the 50,000-URL protocol limit, and one-click
 * download of sitemap.xml, all client-side, nothing uploaded.
 *
 * Every line of copy here is written uniquely for sitemap generation intent
 * (Google Search Console submission, crawl-budget, indexing) so the page
 * ranks independently from the meta / robots / schema siblings.
 */
const xmlSitemapGenerator: Tool = {
  slug: "xml-sitemap-generator",
  title: "XML Sitemap Generator",
  description:
    "Turn a list of URLs into a valid sitemap.xml with per-URL changefreq, priority and lastmod, validated against the 50,000-URL limit and ready to submit to Google. 100% in your browser.",
  category: "seo-tools",
  group: "Sitemaps",
  icon: "Network",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "XML Sitemap Generator, Build a Valid sitemap.xml Online",
  tagline:
    "Paste your URLs, set changefreq, priority and lastmod, and get a spec-valid sitemap.xml you can download and submit to Google Search Console in seconds. Validated live, generated entirely in your browser. No crawl, no upload, no signup.",
  longDescription:
    "The GigAI XML Sitemap Generator converts a plain list of page URLs (one per line, pasted or dropped from a.txt file) into a sitemaps.org-compliant <urlset> document that search engines can read. Set site-wide defaults for change frequency, priority and last-modified date, then override any single URL when a page needs its own values. As you type, the tool validates the result against the protocol: it flags non-HTTPS locations, priorities outside the 0.0–1.0 range, invalid changefreq keywords, duplicate URLs, and warns before you cross the 50,000-URL / 50 MB ceiling that forces a sitemap index. XML special characters in your URLs (&, ?, =) are escaped automatically so the output is always well-formed. When it looks right, copy it or download sitemap.xml, drop it at your domain root, and submit the URL in Google Search Console or reference it from robots.txt. Unlike crawler-based generators that spider your live site on a server (and often cap free plans at 500 pages), this runs 100% in your browser from the URLs you already have, so there is no page limit we impose, nothing is uploaded, and your unpublished or staging URLs never leave your machine.",

  ctaText: "Generate sitemap.xml",

  keywords: [
    "xml sitemap generator",
    "sitemap.xml generator",
    "create sitemap online",
    "generate xml sitemap",
    "sitemap generator free",
    "google sitemap generator",
    "url list to sitemap",
    "sitemap changefreq priority",
    "seo sitemap tool",
    "submit sitemap to google",
  ],

  seo: {
    title: "XML Sitemap Generator, Create a Valid sitemap.xml Free | GigAI Tools",
    description:
      "Free online XML sitemap generator: paste your URLs, set changefreq, priority and lastmod, validate against the 50,000-URL limit, and download sitemap.xml for Google Search Console. 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "ListOrdered",
      title: "URL list → valid <urlset>",
      description:
        "Paste or drop one URL per line and get a sitemaps.org 0.9 <urlset> document with escaped locations and consistent indentation, ready to save as sitemap.xml.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Defaults plus per-URL overrides",
      description:
        "Set a site-wide changefreq, priority and lastmod, then override individual URLs inline (e.g. url | daily | 1.0 | 2026-06-30) when a page needs its own values.",
    },
    {
      icon: "ShieldCheck",
      title: "Live protocol validation",
      description:
        "As you type we flag non-HTTPS URLs, out-of-range priorities, invalid changefreq keywords, duplicates, and warn before you hit the 50,000-URL limit that forces a sitemap index.",
    },
    {
      icon: "Calendar",
      title: "Smart lastmod handling",
      description:
        "Use today's date, a fixed date, or per-URL W3C dates. Values are emitted in the ISO 8601 form Google expects, so lastmod is never silently ignored.",
    },
    {
      icon: "Download",
      title: "Copy or download sitemap.xml",
      description:
        "One click copies the XML to your clipboard or downloads a correctly-named sitemap.xml. Drop it at your site root and submit it in Search Console.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "No crawler, no server, no page cap. Your URLs, including staging and unpublished pages, are turned into XML locally and never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Get indexed faster",
      description:
        "A clean sitemap tells Google exactly which URLs to crawl and how often, helping new and updated pages get discovered without waiting on organic crawl.",
    },
    {
      title: "No arbitrary page limits",
      description:
        "Crawler-based generators cap free plans at a few hundred URLs. Because you supply the list, you can build a sitemap of thousands of pages in one pass.",
    },
    {
      title: "Ship well-formed XML every time",
      description:
        "Automatic escaping and live validation mean the file you download parses cleanly in Search Console. No 'could not read your sitemap' errors.",
    },
    {
      title: "Keep unpublished URLs private",
      description:
        "Since nothing is crawled or uploaded, you can safely generate a sitemap that includes staging, pre-launch or internal URLs without exposing them.",
    },
  ],

  howTo: [
    {
      title: "Paste your URLs",
      description:
        "Enter one absolute URL per line, or drop a .txt file. To override a single URL, append pipe-separated values: url | changefreq | priority | lastmod.",
    },
    {
      title: "Set site-wide defaults",
      description:
        "Choose a default changefreq and priority, and pick how lastmod is filled, today's date, a fixed date, or leave it off. Overrides always win.",
    },
    {
      title: "Review validation",
      description:
        "Watch the live status: URL count, HTTPS coverage, duplicates, and any priority or changefreq warnings. Fix flagged rows before you export.",
    },
    {
      title: "Copy or download sitemap.xml",
      description:
        "Copy the XML or download sitemap.xml, upload it to your domain root (e.g. https://example.com/sitemap.xml), and submit that URL in Google Search Console.",
    },
    {
      title: "Reference it from robots.txt",
      description:
        "Add a Sitemap: https://example.com/sitemap.xml line to robots.txt so every crawler finds it automatically, not just Google.",
    },
  ],

  formats: {
    input: ["TXT", "URL list"],
    output: ["XML"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Submit a new site to Search Console",
      description:
        "Export your CMS's URL list, paste it in, set homepage priority to 1.0 and section pages to 0.8, and hand Google a complete map on launch day.",
    },
    {
      audience: "Web developer",
      title: "Regenerate after a URL migration",
      description:
        "After changing your URL structure, drop the new canonical URLs here to produce a fresh sitemap.xml that reflects the moved pages and their new lastmod.",
    },
    {
      audience: "Content / marketing",
      title: "Prioritise cornerstone content",
      description:
        "Give pillar articles a higher priority and weekly changefreq while leaving evergreen pages monthly, so crawl attention lands where it matters.",
    },
    {
      audience: "Agency / freelancer",
      title: "Build sitemaps for client sites privately",
      description:
        "Generate sitemaps for multiple client domains, including pre-launch staging URLs, without any of them touching a third-party server.",
    },
  ],

  troubleshooting: [
    {
      problem: "Search Console says 'Couldn't fetch' or 'Sitemap could not be read'.",
      solution:
        "Confirm the file is actually reachable at the URL you submitted (open it in a browser), is served as XML/text, and lives at or above the path of the URLs it lists. A sitemap at /blog/sitemap.xml may only include /blog/ URLs.",
    },
    {
      problem: "My lastmod dates are being ignored.",
      solution:
        "Google trusts lastmod only when it's accurate and in W3C/ISO 8601 form (YYYY-MM-DD or full timestamp). Don't set every URL to 'today' on each build, inflated dates get discounted. Use real modification dates per URL.",
    },
    {
      problem: "The tool warns I have too many URLs.",
      solution:
        "A single sitemap allows up to 50,000 URLs and 50 MB uncompressed. Split large sites into multiple sitemap files and list them in a sitemap index (a <sitemapindex> of <sitemap> entries), then submit the index.",
    },
    {
      problem: "Priority doesn't seem to change my rankings.",
      solution:
        "That's expected. Priority and changefreq are hints about relative importance and crawl frequency within your own site. They are not ranking factors and Google largely treats priority as advisory. Focus them on guiding crawl budget, not on SEO scores.",
    },
  ],

  tips: [
    "List only canonical, indexable URLs, exclude noindex, redirected, and parameter-duplicate pages so you don't send crawlers mixed signals.",
    "Use absolute HTTPS URLs (https://example.com/page): relative paths and http:// entries are flagged and can be rejected.",
    "Set lastmod from your real content-updated timestamp. Accurate dates help Google recrawl changed pages sooner.",
    "Add 'Sitemap: https://example.com/sitemap.xml' to robots.txt so Bing and other crawlers discover it too, not just Google.",
    "Over 50,000 URLs? Split into several sitemaps and submit a sitemap index instead of one giant file.",
  ],

  security:
    "Your URLs are turned into XML entirely in your browser. There is no crawler and no upload. Nothing is stored, logged or transmitted, so you can safely generate sitemaps that include staging, pre-launch or internal URLs. Close the tab and every trace is gone.",

  faq: [
    {
      question: "How do I create an XML sitemap from a list of URLs?",
      answer:
        "Paste your URLs into the input, one absolute URL per line. Optionally set a default change frequency, priority and lastmod, then copy the generated XML or download sitemap.xml. The whole file is built in your browser from the list you provide. No crawling required.",
    },
    {
      question: "Is there a limit on how many URLs I can add?",
      answer:
        "The sitemaps.org protocol allows up to 50,000 URLs (and 50 MB uncompressed) per sitemap file, and the tool warns you as you approach it. We impose no additional cap of our own. For larger sites, split the URLs across multiple sitemaps and reference them from a sitemap index.",
    },
    {
      question: "What do changefreq and priority actually do?",
      answer:
        "changefreq (always, hourly, daily, weekly, monthly, yearly, never) hints how often a page changes, and priority (0.0–1.0) hints its importance relative to your other URLs. They guide crawling and are advisory only. Neither is a direct Google ranking factor, and Google may ignore them if they don't match observed behaviour.",
    },
    {
      question: "How do I set a different changefreq or priority for one URL?",
      answer:
        "Append pipe-separated overrides after the URL on its line: https://example.com/blog | daily | 1.0 | 2026-06-30. Any field you omit falls back to the site-wide default. This lets you give cornerstone pages their own values without a separate form per URL.",
    },
    {
      question: "How do I submit my sitemap to Google?",
      answer:
        "Upload the downloaded sitemap.xml to your domain root (e.g. https://example.com/sitemap.xml), then open Google Search Console, go to Sitemaps, enter the sitemap URL and click Submit. Also add a 'Sitemap:' line to robots.txt so other search engines discover it automatically.",
    },
    {
      question: "Does this tool crawl my website?",
      answer:
        "No. It does not spider your site or make any network request. You supply the URLs and it generates the XML locally in your browser. That is why there is no page limit imposed by us and why nothing you paste (including unpublished URLs) is ever uploaded.",
    },
    {
      question: "What lastmod format should I use?",
      answer:
        "Use W3C Datetime / ISO 8601: either a date (2026-06-30) or a full timestamp (2026-06-30T14:20:00+00:00). Set it from the page's real last-modified time. Accurate lastmod helps search engines recrawl updated pages sooner, whereas dates that are always 'now' get discounted.",
    },
    {
      question: "Do I need a sitemap if I have only a few pages?",
      answer:
        "Small, well-linked sites are usually crawled fine without one, but a sitemap still helps by explicitly listing canonical URLs and their lastmod. It becomes important for new sites with few backlinks, large sites, or pages that aren't well linked internally.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, URL-list to valid <urlset> sitemap.xml, site-wide changefreq/priority/lastmod defaults, per-URL pipe overrides, live validation, copy and download.",
    },
    {
      date: "2026-06-24",
      change:
        "Added duplicate-URL detection, HTTPS coverage stats, and a warning as you approach the 50,000-URL protocol limit, plus drag-and-drop .txt import.",
    },
    {
      date: "2026-06-30",
      change:
        "Added lastmod modes (today / fixed date / off), keyboard shortcuts, shareable links and ready-made example URL sets.",
    },
  ],

  relatedTools: [
    "robots-txt-generator",
    "meta-tag-generator",
    "schema-markup-generator",
    "url-encoder",
    "url-decoder",
  ],
};

export default xmlSitemapGenerator;
