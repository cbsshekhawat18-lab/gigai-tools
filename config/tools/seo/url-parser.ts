import type { Tool } from "@/types";

/**
 * URL Parser: the flagship of the GigAI "URL Tools" SEO group.
 * Paste any URL and get a full structured breakdown: protocol, host, port,
 * path segments, every query parameter, hash, origin and derived domain parts
 * - plus a live re-assembled URL so you can confirm the components round-trip.
 * Powered by lib/seo-tools/url.parseUrl on top of the native URL API, so it
 * matches exactly how browsers and servers see the address.
 *
 * All copy is written uniquely for URL-parsing / query-string-inspection
 * intent (debugging redirects, reading tracking params, auditing canonicals)
 * so the page ranks independently from the encoder / UTM / sitemap siblings.
 */
const urlParser: Tool = {
  slug: "url-parser",
  title: "URL Parser",
  description:
    "Paste any URL and instantly break it into protocol, host, port, path, every query parameter, hash and origin, with a live rebuilt URL to confirm the parts. 100% in your browser.",
  category: "seo-tools",
  group: "URL Tools",
  icon: "Link2",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "URL Parser, Break a URL Into Its Components Online",
  tagline:
    "Paste a link and see it decomposed the way a browser does (scheme, host, port, path segments, decoded query parameters, fragment and origin) then watch it rebuild live so you can verify every part. Runs entirely in your browser: no request is ever made to the URL.",
  longDescription:
    "The GigAI URL Parser takes any absolute URL and splits it into the exact components defined by the WHATWG URL standard (the same parsing engine browsers use) so what you see here is what your code, your CDN and Googlebot see. Paste a link (or drop one in) and get a clean, labelled breakdown: protocol/scheme, optional userinfo, hostname, port, the full pathname plus its individual segments, the raw query string, and the hash fragment, alongside derived values like origin, the registrable domain, subdomain and TLD, and whether the connection is secure. Every query parameter is listed in a table with keys and automatically percent-decoded values, so a messy ?utm_source=news&ref=a%2Fb&q=hello%20world becomes readable at a glance, invaluable for auditing tracking tags, debugging redirect chains, spotting duplicate or leaking parameters, and confirming canonical URLs. The rebuilt URL updates as you edit, letting you confirm the components round-trip and that no encoding is lost. Because parsing happens locally with the native URL API and TextEncoder, nothing is fetched or uploaded. You can safely inspect staging links, signed URLs and internal endpoints. When you need to go further, jump to the URL Encoder / Decoder for component encoding or the UTM Campaign Builder to construct tagged links.",

  ctaText: "Parse a URL",

  keywords: [
    "url parser",
    "parse url online",
    "url component breakdown",
    "query string parser",
    "parse query parameters",
    "url structure analyzer",
    "extract url parameters",
    "url decoder query string",
    "get domain from url",
    "url origin host path",
    "inspect utm parameters",
    "whatwg url parser",
  ],

  seo: {
    title: "URL Parser, Break a URL Into Components & Query Params Free | GigAI Tools",
    description:
      "Free online URL parser: paste a URL to see protocol, host, port, path segments, decoded query parameters, hash and origin: with a live rebuilt URL. 100% in-browser, nothing is fetched.",
  },

  features: [
    {
      icon: "Link2",
      title: "Full component breakdown",
      description:
        "Scheme, userinfo, hostname, port, pathname, search and hash: every part of the URL laid out in a labelled table using the browser's own WHATWG parser.",
    },
    {
      icon: "Table",
      title: "Decoded query-parameter table",
      description:
        "Each ?key=value pair is listed separately with its value percent-decoded, so tracking tags and encoded arguments become instantly readable.",
    },
    {
      icon: "GitFork",
      title: "Path segments split out",
      description:
        "The pathname is broken into its individual segments so you can see route structure, slugs and locale prefixes at a glance.",
    },
    {
      icon: "Globe",
      title: "Derived domain intelligence",
      description:
        "Origin, registrable domain, subdomain and TLD are computed for you, plus flags for HTTPS and IP-literal hosts.",
    },
    {
      icon: "RefreshCw",
      title: "Live rebuilt URL",
      description:
        "The normalised URL is reassembled from the parsed parts as you edit, so you can confirm everything round-trips with no encoding lost.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Parsing uses the native URL API locally. No request is made to the address you paste, so staging, signed and internal URLs stay private.",
    },
  ],

  benefits: [
    {
      title: "Debug links in seconds",
      description:
        "Stop squinting at a wall of query string. A structured table shows exactly which parameters are present, duplicated or double-encoded.",
    },
    {
      title: "Audit tracking and canonicals",
      description:
        "See every utm_* and ref parameter decoded, and confirm the origin and path of a canonical or redirect target match what you expect.",
    },
    {
      title: "Match how machines read URLs",
      description:
        "Because it uses the same standard as browsers and Node, the breakdown reflects how your code, server and search crawlers actually interpret the address.",
    },
    {
      title: "Keep private URLs private",
      description:
        "Nothing is fetched or uploaded, so signed download links, staging hosts and internal API URLs never leave your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste your URL",
      description:
        "Drop an absolute URL like https://example.com/path?query=1#section into the input. Include a scheme (https://) so it parses as an absolute address.",
    },
    {
      title: "Read the breakdown",
      description:
        "Review the components table (protocol, host, port, path, search, hash, origin) and the derived domain, subdomain and TLD.",
    },
    {
      title: "Inspect the parameters",
      description:
        "Scan the query-parameter table for each decoded key and value. Spot duplicates, empty values or unexpected tracking tags.",
    },
    {
      title: "Confirm the rebuilt URL",
      description:
        "Check the live rebuilt URL to verify the components round-trip cleanly, then copy the JSON or download the breakdown.",
    },
  ],

  formats: {
    input: ["URL", "Text"],
    output: ["JSON"],
  },

  useCases: [
    {
      audience: "Web developer",
      title: "Debug a redirect or callback URL",
      description:
        "Paste a long OAuth or redirect URL to read every query parameter and confirm the state, code and redirect_uri values are exactly what you expect.",
    },
    {
      audience: "SEO specialist",
      title: "Audit tracking parameters and canonicals",
      description:
        "Decode a shared campaign link to check its utm_* tags, and verify a canonical URL's origin and path match the intended page.",
    },
    {
      audience: "Data / analytics",
      title: "Extract and read query strings",
      description:
        "Turn a captured request URL into a clean key/value table of decoded parameters, ready to reason about or paste into a spec.",
    },
    {
      audience: "QA / support",
      title: "Compare two links component-by-component",
      description:
        "Parse a working and a broken URL side by side to pinpoint the differing segment, missing parameter or wrong host causing the issue.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says 'that isn't a valid absolute URL'.",
      solution:
        "The URL API needs a scheme. Add https:// (or the correct protocol) to the front, bare hosts like example.com/path or protocol-relative //example.com won't parse until you prefix a scheme.",
    },
    {
      problem: "A parameter value shows odd characters or spaces.",
      solution:
        "That's the decoded value, %20 becomes a space and %2F becomes /. The parser shows the human-readable form. Use the URL Encoder if you need the percent-encoded version back.",
    },
    {
      problem: "Two parameters have the same key.",
      solution:
        "That's valid. A query string can repeat a key (?id=1&id=2). Every occurrence is listed in order so you can see duplicates, which often cause servers to pick only the first or last value.",
    },
    {
      problem: "The domain / subdomain looks wrong for a multi-part TLD.",
      solution:
        "Domain detection is a best-effort split on the last two labels, so it can misjudge multi-part suffixes like .co.uk. Trust the hostname field for the exact host. Treat domain/subdomain as a convenience hint.",
    },
  ],

  tips: [
    "Always include the scheme (https://). The parser needs it to treat the input as an absolute URL.",
    "Watch for double-encoding: if a decoded value still contains % sequences, the URL was encoded twice.",
    "Repeated query keys are shown in order: the server usually keeps only the first or last, so remove accidental duplicates.",
    "Use the rebuilt URL to confirm nothing changed after normalisation. The URL API may lowercase the host and drop default ports.",
    "For IP-literal or localhost hosts the domain/subdomain fields are skipped by design: rely on the hostname and port instead.",
  ],

  security:
    "Every URL you paste is parsed entirely in your browser with the native URL API. No request is ever made to the address and nothing is uploaded, stored or logged. That means you can safely inspect signed download links, staging hosts, internal endpoints and tokens. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What does a URL parser do?",
      answer:
        "It splits a URL into its standard parts (protocol, host, port, path, query string and fragment) and lists each query parameter separately with its value decoded. This makes long or messy URLs readable and easy to debug, without you having to mentally parse them.",
    },
    {
      question: "How do I extract the query parameters from a URL?",
      answer:
        "Paste the full URL and read the query-parameter table: each key and its percent-decoded value is listed on its own row, in the order they appear. Repeated keys are preserved so you can spot duplicates that servers may collapse.",
    },
    {
      question: "Does this tool send a request to the URL?",
      answer:
        "No. It never fetches the URL or makes any network request. Parsing happens locally in your browser using the native URL API, which is why you can safely inspect signed, staging or internal links: nothing you paste leaves your machine.",
    },
    {
      question: "Why do I get an 'invalid URL' error?",
      answer:
        "The parser follows the WHATWG URL standard, which requires an absolute URL with a scheme. Prefix the address with https:// (or the correct protocol). Bare hosts (example.com/x), relative paths (/x) and protocol-relative URLs (//example.com) are rejected until a scheme is added.",
    },
    {
      question: "What's the difference between host, hostname and origin?",
      answer:
        "Hostname is just the domain or IP (example.com). Host adds the port when it's non-default (example.com:8080). Origin is the scheme plus host (https://example.com:8080) and is what browsers use for same-origin security decisions.",
    },
    {
      question: "How does it get the domain, subdomain and TLD?",
      answer:
        "It splits the hostname on dots as a best-effort heuristic: the last label is treated as the TLD, the last two as the registrable domain, and anything before that as the subdomain. It doesn't use a public suffix list, so multi-part suffixes like.co.uk may not split perfectly. The exact hostname field is always authoritative.",
    },
    {
      question: "Why are my parameter values different from the URL?",
      answer:
        "The table shows decoded values: percent-encoded sequences like %20, %2F and %26 are turned back into space, / and &. That's the real value your application receives. If you need the encoded form again, use the URL Encoder / Decoder tool.",
    },
    {
      question: "Can it handle userinfo, ports and hash fragments?",
      answer:
        "Yes. Username and password (if present), the port, and the #fragment are all extracted and shown. Path segments are also split out individually so you can read the route structure of the pathname clearly.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, full WHATWG component breakdown, decoded query-parameter table, path segments, derived domain/subdomain/TLD and a live rebuilt URL.",
    },
    {
      date: "2026-06-26",
      change:
        "Added duplicate-parameter detection, HTTPS and IP-literal flags, copy-per-value buttons, JSON export and keyboard shortcuts.",
    },
    {
      date: "2026-06-30",
      change:
        "Added shareable links, ready-made example URLs (redirect, tracking, deep link) and clearer errors for protocol-relative and bare-host input.",
    },
  ],

  relatedTools: [
    "url-encoder",
    "url-decoder",
    "utm-campaign-builder",
    "meta-tag-analyzer",
    "json-formatter",
  ],
};

export default urlParser;
