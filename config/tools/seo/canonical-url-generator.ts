import type { Tool } from "@/types";

/**
 * Canonical URL Generator: a focused member of the Meta Tags group. It takes a
 * page URL, normalises it into a clean, deterministic canonical form (lowercased
 * host, tidy path, sorted/stripped tracking parameters, no default port or
 * fragment) and emits a paste-ready `<link rel="canonical">` tag plus the
 * matching HTTP `Link` header and framework snippets. Every line of copy here is
 * unique to canonicalization and duplicate-content control so the page ranks on
 * its own merits rather than overlapping the meta-tag generator or analyzer.
 */
const canonicalUrlGenerator: Tool = {
  slug: "canonical-url-generator",
  title: "Canonical URL Generator",
  description:
    "Build a clean rel=canonical tag from any URL: normalise the host, path and query, strip tracking parameters, and copy the ready-to-paste <link> tag, HTTP header and framework snippets, 100% in your browser.",
  category: "seo-tools",
  group: "Meta Tags",
  icon: "Link",
  accent: "sky",
  status: "live",
  featured: false,
  createdAt: "2026-06-20",

  h1: "Canonical URL Generator, Clean rel=canonical Tags",
  tagline:
    "Paste a page URL and get a normalised, self-referencing rel=canonical tag with the tracking noise removed, plus the HTTP Link header and Next.js, WordPress and plain-HTML snippets, previewed live and generated entirely in your browser.",
  longDescription:
    "The GigAI Canonical URL Generator turns any page address into a single, authoritative canonical URL and the exact `<link rel=\"canonical\">` tag search engines expect. Duplicate-content problems almost always come from the same page being reachable at many URLs, http vs https, www vs bare domain, trailing slashes, uppercased paths, and a long tail of ?utm_*, ?fbclid, ?gclid and session parameters. This tool normalises all of that in one pass: it forces a consistent scheme and host casing, tidies the path, drops the default port and the fragment, and lets you sort or strip query parameters so tracking junk never becomes your canonical. It shows a clear before/after diff of what changed and why, then hands you the canonical link tag, the equivalent HTTP `Link: <…>; rel=\"canonical\"` header, and copy-paste snippets for Next.js metadata, a WordPress/PHP head and a raw HTML `<head>`. Because canonicalization is a subtle art, the tool also explains when a self-referencing canonical is right, when to point elsewhere (paginated series, syndicated content, filtered listings), and the mistakes that make Google ignore your hint. Everything runs locally with the browser's native URL parser, so unpublished URLs, staging hosts and internal campaign links never leave your machine, are never logged, and vanish when you close the tab.",

  ctaText: "Generate canonical tag",

  keywords: [
    "canonical url generator",
    "rel canonical generator",
    "canonical tag generator",
    "self referencing canonical",
    "canonical link generator",
    "duplicate content fix",
    "url canonicalization tool",
    "canonical url normalizer",
    "strip utm parameters",
    "canonical http header",
    "seo canonical tag",
    "canonicalize url",
  ],

  seo: {
    title: "Canonical URL Generator, Clean rel=canonical Tags | GigAI Tools",
    description:
      "Free canonical URL generator: normalise any URL, strip UTM and tracking params, and copy the rel=canonical <link> tag, HTTP Link header and framework snippets. Runs entirely in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Link",
      title: "Ready-to-paste canonical tag",
      description:
        "Enter a URL and get a correct, escaped `<link rel=\"canonical\" href=\"…\">` tag plus the matching HTTP Link header, copy either, or download the snippet.",
    },
    {
      icon: "Wand2",
      title: "Smart URL normalisation",
      description:
        "Lowercases the host, enforces a consistent scheme, tidies the path, drops the default port and the #fragment, and optionally sorts query keys, one deterministic canonical every time.",
    },
    {
      icon: "Filter",
      title: "Strip tracking parameters",
      description:
        "Remove utm_*, gclid, fbclid, mc_cid, ref and other analytics junk in one click so a shared, tagged link never becomes the URL you tell Google to index.",
    },
    {
      icon: "GitCompareArrows",
      title: "Before / after diff",
      description:
        "See exactly what normalisation changed (scheme, host casing, trailing slash, removed params) so you can trust the canonical instead of guessing what the tool did.",
    },
    {
      icon: "Code2",
      title: "Framework snippets",
      description:
        "Copy the canonical for a raw HTML `<head>`, a Next.js `metadata.alternates.canonical`, or a WordPress/PHP head. Not just the bare tag.",
    },
    {
      icon: "ShieldCheck",
      title: "Escaped, valid, private",
      description:
        "The href is properly attribute-escaped so query strings can't break the tag, and every URL is parsed locally: nothing you paste is uploaded or logged.",
    },
  ],

  benefits: [
    {
      title: "Kill duplicate-content dilution",
      description:
        "Point every variant of a page (www/non-www, http/https, tracked, trailing-slash) at one canonical so ranking signals consolidate instead of splitting across near-identical URLs.",
    },
    {
      title: "Stop tracking links from being indexed",
      description:
        "A canonical built from the clean URL means a viral ?utm_source=twitter share or a ?gclid ad click never becomes the version Google stores and shows in results.",
    },
    {
      title: "Get the tag right without the footguns",
      description:
        "Self-referencing, absolute, single-canonical, matching host: the tool bakes in the rules that make Google respect your hint, so a subtle mistake doesn't get it silently ignored.",
    },
    {
      title: "Private by design",
      description:
        "URLs are parsed and normalised entirely in your browser, so staging hosts, unpublished slugs and internal campaign links never touch a server.",
    },
  ],

  howTo: [
    {
      title: "Paste the page URL",
      description:
        "Drop in the absolute URL of the page you're canonicalizing, include the https:// scheme. A sample loads if you just want to see it work.",
    },
    {
      title: "Choose your normalisation",
      description:
        "Toggle host lowercasing, trailing-slash handling, fragment removal, query sorting and tracking-parameter stripping until the canonical reads exactly how you want it stored.",
    },
    {
      title: "Review the before / after",
      description:
        "Check the diff to confirm the changes are intentional, and read the removed-parameter list so nothing important gets dropped.",
    },
    {
      title: "Copy the tag or a snippet",
      description:
        "Copy the `<link rel=\"canonical\">` tag, the HTTP Link header, or a framework snippet, or download it, and drop it into every URL variant of the page.",
    },
  ],

  formats: {
    input: ["URL"],
    output: ["HTML", "Meta tags", "HTTP header"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Consolidate a page's URL variants",
      description:
        "Generate one canonical for a page that's live at www and bare domain, with and without a trailing slash, and roll it out across all variants to merge their ranking signals.",
    },
    {
      audience: "E-commerce manager",
      title: "Canonicalize filtered & sorted listings",
      description:
        "Strip ?color=, ?sort= and pagination params to point faceted product-listing URLs at the clean category page, so thin filter combinations don't compete in search.",
    },
    {
      audience: "Frontend developer",
      title: "Wire canonicals into the template",
      description:
        "Copy the Next.js metadata or plain-`<head>` snippet and add a self-referencing canonical to every page in one place, instead of hand-writing link tags per route.",
    },
    {
      audience: "Content marketer",
      title: "Clean up shared, tracked links",
      description:
        "Turn a campaign URL full of utm_* and fbclid parameters into the clean canonical so the article ranks under one address no matter how it was shared.",
    },
  ],

  troubleshooting: [
    {
      problem: "Google says my canonical is ignored and it picked a different URL.",
      solution:
        "Google treats rel=canonical as a hint, not a command. It's most often ignored when the canonical points to a page with different content, isn't reachable (returns a redirect or 404), conflicts with your sitemap or hreflang, or the page is also blocked in robots.txt. Make the canonical absolute, self-consistent and serving 200, and keep it in agreement with your other signals.",
    },
    {
      problem: "Should the canonical be absolute or can it be relative?",
      solution:
        "Always use an absolute URL with the scheme and host (https://example.com/page). Google technically resolves relative canonicals, but relative hrefs are a classic source of the tag resolving to the wrong address. This generator always outputs an absolute URL.",
    },
    {
      problem: "I stripped a query parameter but the pages are actually different.",
      solution:
        "Only strip parameters that don't change the main content (tracking, sorting, session IDs). If ?id= or ?product= selects genuinely different content, keep it, canonicalizing distinct pages to one URL tells Google to drop the others from search.",
    },
    {
      problem: "Do I still need a canonical if I already 301-redirect the variants?",
      solution:
        "If every duplicate 301-redirects to one URL, a canonical is largely redundant for those, but you should still add a self-referencing canonical on the destination page. Canonicals and redirects solve overlapping but not identical problems. The self-referencing tag protects against parameters and mirrors you didn't redirect.",
    },
  ],

  tips: [
    "Add a self-referencing canonical to every indexable page, it's the simplest defense against parameter and mirror duplicates you didn't anticipate.",
    "Only one canonical per page: a second rel=canonical (or one in both the head and the HTTP header that disagree) makes Google ignore both.",
    "Keep the canonical in agreement with your sitemap, internal links and hreflang: mixed signals are the top reason a canonical gets overridden.",
    "For paginated series, self-canonicalize each page (page 2 → page 2), don't point them all at page 1. That hides the deeper pages from search.",
    "Canonicalize to the https, non-tracked, lowercase-host version and use it consistently everywhere, including in your og:url.",
  ],

  security:
    "Every URL you paste is parsed and normalised locally in your browser with its native URL engine. Nothing is uploaded, stored or logged. Staging hosts, unpublished slugs and internal campaign links stay on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "What is a canonical URL and why does it matter for SEO?",
      answer:
        "A canonical URL is the single address you designate as the authoritative version of a page. When the same or very similar content is reachable at multiple URLs (http/https, www/non-www, trailing slashes, tracking parameters) search engines can split ranking signals or index the wrong one. The rel=canonical tag tells them which URL to consolidate on, protecting you from duplicate-content dilution.",
    },
    {
      question: "What is a self-referencing canonical and should I use one?",
      answer:
        "A self-referencing canonical is a rel=canonical tag on a page that points to that page's own clean URL. Yes, it's a recommended best practice on every indexable page. It anchors the page to one preferred address and automatically neutralises duplicates created by tracking parameters, session IDs or mirror hosts that you didn't explicitly handle.",
    },
    {
      question: "How do I write the canonical tag correctly?",
      answer:
        "Place a single <link rel=\"canonical\" href=\"https://example.com/page\"> in the page's <head>, using an absolute URL with scheme and host. Use exactly one canonical per page, make sure it returns HTTP 200, and keep it consistent with your sitemap and internal links. This generator outputs the tag in that exact, escaped form plus the equivalent HTTP Link header.",
    },
    {
      question: "Should I remove UTM and other tracking parameters from the canonical?",
      answer:
        "Yes. Tracking parameters like utm_source, gclid and fbclid don't change the page's content, so they shouldn't appear in your canonical: otherwise a shared, tagged link can become the URL Google indexes. This tool strips common tracking parameters (with a one-click toggle) while leaving content-defining parameters in place.",
    },
    {
      question: "What's the difference between a canonical tag and a 301 redirect?",
      answer:
        "A 301 redirect actually moves users and crawlers from one URL to another and is the strongest signal for permanently consolidating URLs. A canonical is a hint that keeps all URLs accessible but tells search engines which one to index. Useful when you can't or don't want to redirect (e.g. parameterised or syndicated pages). Use redirects for true moves and canonicals for duplicate variants you must keep live.",
    },
    {
      question: "Can a canonical point to a different domain?",
      answer:
        "Yes. A cross-domain canonical is valid and is the correct tool for syndicated content: the site republishing an article can point its canonical at the original publisher's URL so ranking credit flows to the source. Just make sure the target is a near-identical page and returns 200. Google is stricter about honoring cross-domain canonicals.",
    },
    {
      question: "Why is Google ignoring my canonical tag?",
      answer:
        "Common reasons: the canonical points to a page with meaningfully different content, it isn't self-consistent (multiple conflicting canonicals), the target redirects or 404s, the page is blocked in robots.txt, or your sitemap/hreflang disagree. Google treats canonicals as a strong hint, not a directive: remove the conflicts above and it will usually respect your choice.",
    },
    {
      question: "Is my URL data sent to a server?",
      answer:
        "No. All parsing, normalisation and tag generation happen entirely in your browser using its native URL API. Nothing you paste is uploaded, stored or logged, so it's safe to canonicalize URLs for unpublished pages, staging environments or confidential campaigns: close the tab and every trace is gone.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, rel=canonical tag generation with host/scheme/path normalisation, trailing-slash and fragment handling, tracking-parameter stripping, HTTP Link header and framework snippets.",
    },
    {
      date: "2026-06-25",
      change:
        "Added a before/after normalisation diff, a removed-parameters list, and query-key sorting for deterministic canonicals.",
    },
    {
      date: "2026-06-30",
      change:
        "Added copy/download shortcuts, curated examples (tracked link, www variant, faceted listing) and refined the self-referencing canonical guidance.",
    },
  ],

  relatedTools: [
    "meta-tag-generator",
    "meta-tag-analyzer",
    "url-encoder",
    "json-formatter",
  ],
};

export default canonicalUrlGenerator;
