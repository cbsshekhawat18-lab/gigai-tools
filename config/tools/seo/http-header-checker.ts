import type { Tool } from "@/types";

/**
 * HTTP Header Checker, the paste-first response-header inspector.
 *
 * Paste the raw HTTP response headers (from `curl -I`, `curl -sD -`, DevTools →
 * Network → Headers, or any proxy log) and it parses them into a clean table
 * and reads the story they tell: the status line and any redirect chain,
 * whether caching and compression are set up well, which security headers are
 * present or missing (with a graded score), and which cookies, CORS and content
 * signals are in play. Everything runs on the pasted text via the native
 * parser. No network call, so it works on staging, internal and gated URLs.
 * All copy below is unique to *inspecting raw response headers* (not generating
 * meta tags, not checking SSL certificates) so the page ranks on its own intent.
 */
const httpHeaderChecker: Tool = {
  slug: "http-header-checker",
  title: "HTTP Header Checker",
  description:
    "Paste raw HTTP response headers to parse them into a clean table and get instant notes on status, redirects, caching, compression, cookies, CORS and a graded security-header report, 100% in your browser.",
  category: "seo-tools",
  group: "Headers & Security",
  icon: "Server",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "HTTP Header Checker, Parse & Analyze Response Headers",
  tagline:
    "Paste the raw HTTP response headers from curl or DevTools and get an instant, honest read: a clean parsed table, the status line and redirect chain, caching and compression notes, cookie and CORS flags, and a graded security-header report, all computed locally in your browser.",
  longDescription:
    "The GigAI HTTP Header Checker takes the raw response headers you paste, exactly as `curl -I`, `curl -sD -` or your browser's DevTools print them, and turns a wall of text into something you can actually reason about. It reads the HTTP status line and code, folds duplicate headers, and lays every field out in a sorted, copy-friendly table with the value fully visible. Then it interprets what those headers mean for real: it flags a redirect (301, 302, 307, 308) and reads the `Location` target, checks whether caching is configured sensibly through `Cache-Control`, `ETag`, `Expires` and `Age`, confirms whether responses are compressed with gzip, Brotli or Zstandard via `Content-Encoding`, surfaces the `Set-Cookie` flags that matter (`Secure`, `HttpOnly`, `SameSite`), and reports the CORS and content-type signals crawlers and browsers act on. On top of that it runs the same security-header audit trusted by security teams, HSTS, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy, and rolls the result into a 0–100 score and A–F grade with a plain-English fix for every gap. Because it works purely on text you paste, using the browser's own parsing with no network request, it happily inspects headers from a staging box, an internal service, a login-gated page, or a competitor's response you captured, and nothing you paste ever leaves your machine.",

  ctaText: "Check HTTP headers",

  keywords: [
    "http header checker",
    "response header checker",
    "http headers analyzer",
    "security headers checker",
    "check http headers online",
    "curl headers parser",
    "cache-control checker",
    "content-encoding checker",
    "http status header tool",
    "set-cookie analyzer",
    "cors headers checker",
  ],

  seo: {
    title: "HTTP Header Checker: Parse & Analyze Response Headers | GigAI Tools",
    description:
      "Free HTTP header checker: paste raw response headers to get a parsed table plus notes on status, redirects, caching, compression, cookies, CORS and a graded security-header report. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Table2",
      title: "Clean parsed header table",
      description:
        "Every header is parsed, duplicate fields are folded, and the result is laid out in a sorted, copy-friendly table with the full value visible. No more squinting at a wrapped terminal dump.",
    },
    {
      icon: "Route",
      title: "Status & redirect reading",
      description:
        "The HTTP status line and code are surfaced up front, and any 301/302/307/308 redirect is flagged with its Location target so you can trace where a URL actually resolves.",
    },
    {
      icon: "DatabaseZap",
      title: "Caching & compression notes",
      description:
        "Cache-Control, ETag, Expires, Age and Vary are read for cacheability, and Content-Encoding is checked for gzip, Brotli or Zstandard so you know whether responses ship compressed.",
    },
    {
      icon: "ShieldCheck",
      title: "Graded security-header audit",
      description:
        "HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy are each evaluated and rolled into a 0–100 score and A–F grade with a fix for every gap.",
    },
    {
      icon: "Cookie",
      title: "Cookie, CORS & content flags",
      description:
        "Set-Cookie is inspected for Secure, HttpOnly and SameSite. CORS and content-type signals are surfaced so you can spot a leaky cookie or a misconfigured cross-origin response fast.",
    },
    {
      icon: "Copy",
      title: "Copy, download & sample",
      description:
        "Copy the full report as text, download it, or load a realistic sample to see the tool in action, and paste from your clipboard with one click or drop a saved headers file.",
    },
  ],

  benefits: [
    {
      title: "Understand a response in seconds",
      description:
        "Instead of scanning a raw header dump line by line, you get a table plus a prioritised read of what those headers actually do (status, caching, compression, security and cookies) at a glance.",
    },
    {
      title: "Catch the misconfiguration before users do",
      description:
        "A missing nosniff, a cookie without HttpOnly, an uncompressed response or an accidental noindex redirect all jump out immediately, so you fix them before they cost you rankings, speed or safety.",
    },
    {
      title: "Works on headers you can't fetch",
      description:
        "Because it analyzes text you paste, it handles staging boxes, internal services, VPN-only endpoints and password-gated pages that a public online checker simply can't reach.",
    },
    {
      title: "Private by design",
      description:
        "All parsing and grading happen locally in your browser with no network request, so confidential headers, internal hostnames and session cookies never leave your machine.",
    },
  ],

  howTo: [
    {
      title: "Capture the raw headers",
      description:
        "Run `curl -sSI https://example.com` (or `curl -sD - -o /dev/null https://example.com` to include the status line), or in DevTools open Network → click the request → Headers → view the raw response headers.",
    },
    {
      title: "Paste them in",
      description:
        "Paste the raw block into the input, an optional leading HTTP status line is understood, blank lines are ignored, and duplicate headers are folded automatically.",
    },
    {
      title: "Read the parsed report",
      description:
        "See the status and any redirect, the sorted header table, the caching/compression/cookie/CORS notes and the graded security-header audit, each with a plain-English explanation.",
    },
    {
      title: "Fix and re-check",
      description:
        "Apply the suggested fixes on your server or CDN, capture the headers again, and paste them back to confirm the score went up and the warnings cleared.",
    },
  ],

  formats: {
    input: ["Raw HTTP headers", "curl -I output", "Text"],
    output: ["Report", "Text", "Table"],
  },

  useCases: [
    {
      audience: "Backend / DevOps engineer",
      title: "Verify a deploy's headers",
      description:
        "After changing an nginx, Apache or CDN config, capture the live response headers and confirm caching, compression and security directives are set exactly as intended before promoting the release.",
    },
    {
      audience: "Security engineer",
      title: "Grade a site's security posture",
      description:
        "Paste a response's headers to get an instant HSTS/CSP/X-Frame-Options audit with a letter grade and remediation notes: ideal for a quick pass during a review or pentest write-up.",
    },
    {
      audience: "SEO / performance specialist",
      title: "Debug caching, compression & redirects",
      description:
        "Confirm pages are gzip/Brotli compressed, that Cache-Control is CDN-friendly, and that a redirect chain resolves in one hop to the canonical URL rather than bouncing through several statuses.",
    },
    {
      audience: "Frontend developer",
      title: "Diagnose a CORS or cookie issue",
      description:
        "Inspect the Access-Control-* and Set-Cookie headers on a failing request to see whether a missing CORS header or a wrong SameSite flag is behind the browser error.",
    },
  ],

  troubleshooting: [
    {
      problem: "It only shows request headers, not response headers.",
      solution:
        "Make sure you copied the *response* side. With curl, `-I` (or `-D -`) prints response headers. In DevTools use the response headers panel, not the request headers section above it. This tool analyzes what the server sent back.",
    },
    {
      problem: "My redirect target isn't showing.",
      solution:
        "A single `curl -I` shows only the first hop. Use `curl -sIL https://example.com` to follow redirects, then paste the final response's headers, or paste each hop's block to inspect the chain step by step.",
    },
    {
      problem: "Can it just fetch the headers from a URL for me?",
      solution:
        "No, and that's deliberate. Browsers block cross-origin header reads (CORS) and we run no server to proxy the request, so live-fetching isn't possible here. Capture the headers with curl or DevTools and paste them, which also lets you inspect URLs a public checker can't reach.",
    },
    {
      problem: "A duplicate header looks merged.",
      solution:
        "Per the HTTP spec, repeated headers with the same name are folded into one comma-separated value, so `Set-Cookie: a` and `Set-Cookie: b` appear as `a, b`. The individual cookie flags are still read correctly for the cookie notes.",
    },
  ],

  tips: [
    "Use `curl -sD - -o /dev/null https://example.com` to grab the status line plus every response header without downloading the body.",
    "Add `includeSubDomains` and `preload` to your HSTS header, and aim for a max-age of at least six months, to earn the strongest grade.",
    "Prefer a strong Content-Security-Policy over the deprecated X-XSS-Protection header: modern browsers ignore the latter.",
    "Always ship `X-Content-Type-Options: nosniff`. It's a one-line header that shuts down a whole class of MIME-sniffing attacks.",
    "Check that HTML responses are Brotli or gzip compressed via Content-Encoding. Uncompressed HTML is one of the most common, easily-fixed speed regressions.",
  ],

  security:
    "Every header is parsed and graded locally in your browser using its native parser: nothing you paste is uploaded, stored or logged. Confidential response headers, internal hostnames, session cookies and Authorization-related values stay entirely on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "How do I get my HTTP response headers to paste in?",
      answer:
        "The quickest way is curl: run `curl -sSI https://example.com` to print the response headers, or `curl -sD - -o /dev/null https://example.com` to include the status line without downloading the page body. In a browser, open DevTools (F12), go to the Network tab, reload, click the document request, and copy the raw response headers from the Headers panel. Paste that block here.",
    },
    {
      question: "Can this tool fetch headers from a live URL automatically?",
      answer:
        "No, by design. Browsers block reading another site's response headers across origins (the CORS policy), and we deliberately run no server to fetch on your behalf, so there's nothing to leak your queries to. You paste the raw headers instead, which is more private and, unlike a hosted checker, also works on staging, internal, VPN-only and password-protected endpoints.",
    },
    {
      question: "Which security headers does it check and grade?",
      answer:
        "It evaluates Strict-Transport-Security (HSTS), Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy, and notes the deprecated X-XSS-Protection. Each is marked good, warning or fail with specific advice, and the weighted result becomes a 0–100 score and an A–F grade so you can track your posture over time.",
    },
    {
      question: "How can I tell if my responses are being cached and compressed?",
      answer:
        "Look at the notes: Content-Encoding tells you whether the response is compressed with gzip, Brotli (br) or Zstandard (zstd). Cache-Control, ETag, Expires, Age and Vary together describe cacheability, a public, long-lived Cache-Control with a validator like ETag is CDN-friendly, while no-store or missing directives mean the response won't be cached. The tool surfaces each of these and explains what it implies.",
    },
    {
      question: "What do Secure, HttpOnly and SameSite mean on a Set-Cookie header?",
      answer:
        "Secure means the cookie is only sent over HTTPS. HttpOnly hides it from JavaScript to blunt XSS-based theft, and SameSite (Lax, Strict or None) controls whether the cookie rides along on cross-site requests, which matters for CSRF protection. The checker flags cookies missing these attributes so you can harden session and auth cookies.",
    },
    {
      question: "Does the order of the headers I paste matter?",
      answer:
        "No. The parser is order-independent and case-insensitive: it lowercases header names for lookup, folds repeated headers into one value, ignores blank lines, and understands an optional leading HTTP status line. Paste them in whatever order curl or DevTools gave you and the report will be the same.",
    },
    {
      question: "Why would a header say 301 or 302 and what should I do?",
      answer:
        "Those status codes mean the URL redirects: 301 and 308 are permanent, 302 and 307 are temporary. The tool reads the Location header so you can see the target. For SEO and speed, prefer a single 301 straight to the canonical HTTPS URL rather than a chain (for example http → https → www → trailing-slash), since each extra hop adds latency and dilutes signals.",
    },
    {
      question: "Are the headers I paste sent anywhere?",
      answer:
        "No. All parsing, note-generation and security grading run entirely in your browser with its native APIs and no network request. Nothing you paste is uploaded, stored or logged, so it's safe to analyze internal hostnames, session cookies and confidential response headers, close the tab and every trace is gone.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, raw response-header parsing into a table, status/redirect reading, caching, compression, cookie and CORS notes, and a graded HSTS/CSP/X-Frame-Options security audit.",
    },
    {
      date: "2026-06-25",
      change:
        "Added Brotli/Zstandard detection to the compression note, Set-Cookie flag inspection (Secure/HttpOnly/SameSite), and copy/download of the full report as text.",
    },
    {
      date: "2026-06-30",
      change:
        "Added a realistic sample loader, keyboard-driven clipboard paste, drag-and-drop of a saved headers file, and refined the redirect-chain wording.",
    },
  ],

  relatedTools: [
    "security-header-checker",
    "ssl-checker",
    "meta-tag-analyzer",
    "robots-txt-validator",
    "url-parser",
    "json-formatter",
  ],
};

export default httpHeaderChecker;
