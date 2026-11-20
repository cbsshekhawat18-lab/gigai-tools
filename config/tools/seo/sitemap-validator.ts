import type { Tool } from "@/types";

/**
 * Sitemap Validator, the paste-first checker of the GigAI "Sitemaps" group.
 * You paste a sitemap.xml (or sitemap-index) and it validates well-formedness
 * plus the sitemaps.org protocol rules: every <url> has a <loc>, the ≤50,000-URL
 * / 50 MB ceiling, HTTPS locations, and valid changefreq / priority values.
 *
 * Copy is written uniquely for sitemap-validation / debugging intent (Search
 * Console "couldn't fetch", "could not read your sitemap") so the page ranks
 * independently from the sitemap-generator, robots and schema siblings. Because
 * a static export can't crawl a live URL, this is paste-first and honest about
 * it; the value is a rigorous, private, in-browser lint of XML you already have.
 */
const sitemapValidator: Tool = {
  slug: "sitemap-validator",
  title: "Sitemap Validator",
  description:
    "Paste your sitemap.xml and validate it instantly: well-formed XML, every <url> has a <loc>, the 50,000-URL limit, HTTPS locations and valid changefreq/priority. Catches the errors that make Google reject a sitemap. 100% in your browser.",
  category: "seo-tools",
  group: "Sitemaps",
  icon: "FileCheck2",
  accent: "cyan",
  status: "live",
  featured: false,
  createdAt: "2026-06-22",

  h1: "Sitemap Validator. Check Your sitemap.xml Against Google's Rules",
  tagline:
    "Paste your sitemap XML and get an instant, line-by-line verdict: is it well-formed, does every entry have a <loc>, is it under the 50,000-URL limit, are the URLs HTTPS, and are your changefreq and priority values valid? Every check runs in your browser. Nothing is crawled, uploaded or stored.",
  longDescription:
    "The GigAI Sitemap Validator lints a pasted sitemap.xml, or a <sitemapindex> of child sitemaps, against the sitemaps.org protocol and Google's documented requirements, so you can fix a sitemap before Search Console flags it. It parses the XML with the browser's native parser and first checks that the document is well-formed. A single unescaped ampersand, unclosed tag or stray character is the most common reason Search Console reports \"Sitemap could not be read\", and the validator points straight at it. It then walks every entry and confirms the structural rules: each <url> carries exactly one non-empty <loc>, the file stays within the 50,000-URL and 50 MB uncompressed ceiling that forces a sitemap index, locations use HTTPS, and any changefreq is one of the seven allowed keywords while every priority is a number between 0.0 and 1.0. Results come back as a scored checklist of passes, warnings and hard errors, each written so you know exactly what to change. Unlike online validators that fetch your live URL on their own server, this tool never leaves your browser, so you can validate a staging, pre-launch or internal sitemap without exposing a single URL, and there is no rate limit or sign-in. It does not crawl the site behind the sitemap or verify that each URL returns 200. It validates the sitemap document itself, which is precisely the layer that causes most \"invalid sitemap\" rejections.",

  ctaText: "Validate sitemap.xml",

  keywords: [
    "sitemap validator",
    "validate sitemap xml",
    "sitemap.xml validator",
    "xml sitemap checker",
    "check sitemap online",
    "sitemap error checker",
    "google sitemap validator",
    "sitemap could not be read",
    "sitemap well-formed xml",
    "sitemap 50000 url limit",
    "changefreq priority validator",
    "sitemapindex validator",
  ],

  seo: {
    title: "Sitemap Validator. Check & Debug Your sitemap.xml Free | GigAI Tools",
    description:
      "Free online sitemap validator: paste your sitemap.xml to check XML well-formedness, missing <loc>, the 50,000-URL limit, HTTPS locations and valid changefreq/priority. Fix the errors Google rejects. 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "FileCheck2",
      title: "Well-formedness first",
      description:
        "Parses your sitemap with the browser's native XML parser and pinpoints the exact reason it isn't well-formed, the No. 1 cause of Search Console's \"could not be read\" error.",
    },
    {
      icon: "Link2",
      title: "Every <url> needs a <loc>",
      description:
        "Walks every entry and flags any <url> (or <sitemap> in an index) that is missing a non-empty <loc>, which silently drops URLs from indexing.",
    },
    {
      icon: "ShieldCheck",
      title: "HTTPS & protocol checks",
      description:
        "Confirms locations use https://, changefreq is one of the seven valid keywords, and every priority is a number between 0.0 and 1.0: surfaced per offending URL.",
    },
    {
      icon: "Gauge",
      title: "50,000-URL / 50 MB limit",
      description:
        "Counts entries and warns as you near (then hard-fails past) the protocol ceiling that requires splitting into multiple files behind a sitemap index.",
    },
    {
      icon: "ListTree",
      title: "Handles sitemap indexes",
      description:
        "Detects a <sitemapindex> and validates its <sitemap> children too, so you can check the index that ties your split sitemaps together.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "No fetch, no upload, no account. Paste a staging or pre-launch sitemap and validate it privately: nothing you paste is transmitted, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Fix rejections before they cost you",
      description:
        "Catch the well-formedness and structural errors that make Search Console report \"Sitemap could not be read\" or \"has errors\": before you submit and wait days for a re-crawl.",
    },
    {
      title: "Know exactly what to change",
      description:
        "Every warning and error names the rule and, where possible, the offending URL, so you're not left guessing why a validator just said \"invalid\".",
    },
    {
      title: "Validate private sitemaps safely",
      description:
        "Because nothing is fetched or uploaded, you can lint staging, internal or pre-launch sitemaps without any URL touching a third-party server.",
    },
    {
      title: "No limits, no sign-in",
      description:
        "Paste as many sitemaps as you like with no rate limit, quota or login: a server-side crawler-validator can't offer that for free.",
    },
  ],

  howTo: [
    {
      title: "Open your sitemap.xml",
      description:
        "Visit your sitemap in a browser (e.g. https://example.com/sitemap.xml), select all and copy, or open the file locally and copy its contents.",
    },
    {
      title: "Paste it in",
      description:
        "Paste the XML into the input, or drop a.xml file. It's parsed locally the moment you stop typing: nothing is uploaded.",
    },
    {
      title: "Read the checklist",
      description:
        "Review the scored report: well-formedness, missing <loc>, URL count vs the 50,000 limit, HTTPS coverage, and any invalid changefreq or priority values.",
    },
    {
      title: "Fix and re-paste",
      description:
        "Edit the flagged lines in your sitemap, paste the corrected XML back in, and confirm every check is green before you re-submit in Search Console.",
    },
  ],

  formats: {
    input: ["XML", "sitemap.xml"],
    output: ["Validation report"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Debug a rejected sitemap",
      description:
        "Search Console says the sitemap has errors or couldn't be read. Paste it here to find the exact malformed line, missing <loc> or over-limit count that's the cause.",
    },
    {
      audience: "Web developer",
      title: "Verify a generated sitemap in CI",
      description:
        "Before shipping, paste the sitemap your build produces to confirm it's well-formed and within limits, catching an unescaped & or template bug before it goes live.",
    },
    {
      audience: "Agency / freelancer",
      title: "Audit a client's existing sitemap",
      description:
        "Grab a prospect or client's live sitemap, paste it, and produce a quick, private list of protocol issues to fix: without their URLs leaving your machine.",
    },
    {
      audience: "Content / marketing",
      title: "Sanity-check after a big publish",
      description:
        "After a bulk import or migration, paste the new sitemap to make sure every entry has a <loc> and you haven't blown past the 50,000-URL ceiling.",
    },
  ],

  troubleshooting: [
    {
      problem: "The validator says my XML is not well-formed, but it looks fine.",
      solution:
        "Look for unescaped special characters inside <loc>, raw &, <, > and \" must be written as &amp;, &lt;, &gt; and &quot;. A single unescaped ampersand in a URL query string is the most common culprit. Unclosed tags and a stray BOM or leading whitespace before the XML declaration also break parsing.",
    },
    {
      problem: "Can it validate my sitemap from just the URL?",
      solution:
        "No. This tool runs entirely in your browser and can't fetch remote URLs (a static site has no server to crawl from, and cross-origin fetches are blocked). Open the sitemap in a browser tab, copy the XML, and paste it here. The upside is that staging and private sitemaps never leave your machine.",
    },
    {
      problem: "It warns that my URLs aren't HTTPS.",
      solution:
        "Search engines expect canonical URLs to be served over HTTPS. Update your sitemap to list the https:// version of each URL, and make sure those pages actually resolve on HTTPS without redirect chains.",
    },
    {
      problem: "It flags an invalid changefreq or priority.",
      solution:
        "changefreq must be exactly one of always, hourly, daily, weekly, monthly, yearly or never (lowercase). priority must be a decimal from 0.0 to 1.0. Remove or correct any value outside those. Both fields are advisory hints, not ranking factors.",
    },
  ],

  tips: [
    "This checks the sitemap document, not the pages. It won't tell you if a listed URL returns 404 or is noindex. Pair it with a live crawl for that.",
    "Escape URLs before they go in the sitemap: & becomes &amp;. Most \"not well-formed\" failures are a raw ampersand in a query string.",
    "Over 50,000 URLs or 50 MB? Split into several sitemaps and validate the <sitemapindex> that lists them, then submit only the index.",
    "Keep lastmod in W3C / ISO 8601 form (YYYY-MM-DD or a full timestamp). This tool won't reject other formats but Search Console may ignore them.",
    "Validate the exact bytes Search Console fetches: copy from the live sitemap URL, not from a pre-minified source file, so you catch server-side escaping issues.",
  ],

  security:
    "Your sitemap is parsed and validated entirely in your browser using the native XML parser. There is no crawler and no upload. Nothing you paste is stored, logged or transmitted, so you can safely validate staging, pre-launch or internal sitemaps whose URLs shouldn't be public. Close the tab and every trace is gone.",

  faq: [
    {
      question: "How do I validate my sitemap.xml?",
      answer:
        "Open your sitemap in a browser (for example https://example.com/sitemap.xml), copy the XML, and paste it into the input above. The validator checks it in your browser for well-formedness, missing <loc> tags, the 50,000-URL limit, HTTPS locations and valid changefreq/priority, then returns a scored pass/warn/fail checklist.",
    },
    {
      question: "Why does Google say my sitemap 'could not be read'?",
      answer:
        "That message almost always means the XML isn't well-formed: commonly an unescaped ampersand (& instead of &amp;) in a URL, an unclosed tag, or unexpected characters before the XML declaration. Paste the sitemap here and the validator points at the exact parse error so you can fix it.",
    },
    {
      question: "Can this validator fetch my sitemap from a URL?",
      answer:
        "No. It runs 100% in your browser with no server, so it can't crawl a remote URL and doesn't make any network request. You paste the XML instead. The trade-off is total privacy (staging and internal sitemaps never leave your machine) and no rate limits or sign-in.",
    },
    {
      question: "What's the maximum number of URLs a sitemap can have?",
      answer:
        "A single sitemap file may contain at most 50,000 URLs and be no larger than 50 MB uncompressed. The validator counts your entries and hard-fails above 50,000. For more URLs, split them across multiple sitemap files and list those in a <sitemapindex>.",
    },
    {
      question: "Does it validate a sitemap index?",
      answer:
        "Yes. If the root element is <sitemapindex>, the validator switches to index mode and checks each <sitemap> child for a valid <loc>, so you can confirm the index that ties your split sitemaps together is correct.",
    },
    {
      question: "Does it check whether the URLs in my sitemap actually work?",
      answer:
        "No. It validates the sitemap document itself (structure, encoding, limits, allowed values), not the pages it lists. It won't tell you if a URL returns 404, redirects, or is set to noindex. Use a crawler for that. Use this to make sure the sitemap file itself is valid.",
    },
    {
      question: "Do changefreq and priority have to be present or valid?",
      answer:
        "They're optional. If present, changefreq must be one of always, hourly, daily, weekly, monthly, yearly or never, and priority must be a decimal between 0.0 and 1.0. The validator warns on invalid values. Both are advisory hints to crawlers, not ranking factors, and Google may ignore them.",
    },
    {
      question: "Is it safe to paste a private or staging sitemap?",
      answer:
        "Yes. Everything happens locally in your browser. No fetch, no upload, no storage or logging. Because none of the URLs are transmitted anywhere, you can validate pre-launch, internal or client sitemaps without exposing them.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release, paste-first sitemap.xml validation: well-formedness, missing <loc>, 50,000-URL limit, HTTPS and changefreq/priority checks with a scored checklist.",
    },
    {
      date: "2026-06-27",
      change:
        "Added <sitemapindex> detection and child-sitemap validation, HTTPS coverage stats, and per-URL messages for invalid changefreq/priority values.",
    },
    {
      date: "2026-06-30",
      change:
        "Added drag-and-drop .xml import, a realistic sample sitemap, entry-count and file-size stats, and clearer fix guidance on each failing check.",
    },
  ],

  relatedTools: [
    "xml-sitemap-generator",
    "robots-txt-generator",
    "meta-tag-analyzer",
    "url-encoder",
  ],
};

export default sitemapValidator;
