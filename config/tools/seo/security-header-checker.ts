import type { Tool } from "@/types";

/**
 * Security Header Checker: the paste-first HTTP security-header auditor.
 *
 * You paste a raw response-header block (curl -I, DevTools → Network → Headers,
 * or any header dump) and the tool grades the page's defensive posture: HSTS,
 * Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
 * Referrer-Policy and Permissions-Policy each get an individual pass / warn /
 * fail verdict, a plain-English explanation of the risk, and a copy-ready fix.
 * The whole audit runs on the pasted text in the browser. No request leaves
 * the machine, so it works on staging, intranet and auth-gated endpoints too.
 *
 * Every line of copy below is specific to HTTP security headers so the page
 * ranks on its own intent rather than colliding with the meta, schema or
 * sitemap tools in the suite.
 */
const securityHeaderChecker: Tool = {
  slug: "security-header-checker",
  title: "Security Header Checker",
  description:
    "Paste your HTTP response headers and get an instant A–F security grade with per-header pass/warn/fail verdicts and copy-ready fixes for HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy, 100% in your browser.",
  category: "seo-tools",
  group: "Headers & Security",
  icon: "ShieldCheck",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "HTTP Security Header Checker, Grade CSP, HSTS & More",
  tagline:
    "Paste your response headers and see a clear A–F security grade with a per-header breakdown: every missing or weak HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy flagged with a copy-ready fix.",
  longDescription:
    "The GigAI Security Header Checker turns a raw block of HTTP response headers into an actionable security report. Paste the output of `curl -I https://yoursite.com`, copy the Response Headers straight from your browser's DevTools Network panel, or drop a saved header dump, and the tool parses it with the same case-insensitive folding real clients use: then scores the six headers that most affect a site's defensive posture. Strict-Transport-Security is checked for an adequate max-age and includeSubDomains. Content-Security-Policy is inspected for a default-src fallback and risky `unsafe-inline` / `unsafe-eval` allowances. X-Frame-Options and CSP frame-ancestors are read for clickjacking cover. X-Content-Type-Options is verified as `nosniff`, and Referrer-Policy and Permissions-Policy are checked for sane, privacy-preserving values. Each header earns a pass, warn or fail with a one-line explanation of the real-world risk and a fix you can copy straight into Nginx, Apache, Cloudflare, a CDN rule or a framework middleware. A weighted 0–100 score rolls up into a familiar A–F grade so you can track hardening over time and prove progress to a client or auditor. Because everything is computed locally in your browser from the text you paste, nothing is uploaded, logged or fetched, which means it works perfectly on staging URLs, internal tools and login-gated pages that a public online scanner can never reach.",

  ctaText: "Check my headers",

  keywords: [
    "security header checker",
    "http security headers",
    "csp checker",
    "content security policy checker",
    "hsts checker",
    "check security headers",
    "http header security scan",
    "x-frame-options checker",
    "referrer-policy checker",
    "permissions-policy checker",
    "security headers grade",
    "web security headers analyzer",
  ],

  seo: {
    title: "Security Header Checker, Grade HTTP Headers (CSP, HSTS) | GigAI Tools",
    description:
      "Free HTTP security header checker: paste your response headers for an instant A–F grade with pass/warn/fail on CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy. Plus copy-ready fixes. Nothing is uploaded.",
  },

  features: [
    {
      icon: "ShieldCheck",
      title: "A–F grade across six headers",
      description:
        "A weighted 0–100 score and letter grade summarise your posture at a glance, built from HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy.",
    },
    {
      icon: "ListChecks",
      title: "Per-header pass / warn / fail",
      description:
        "Every header gets its own verdict with the exact value found, so you see precisely which control is missing, weak or already solid. Not just a single number.",
    },
    {
      icon: "Wrench",
      title: "Copy-ready fixes",
      description:
        "Each warning and failure comes with a ready-to-paste header line you can drop into Nginx, Apache, Cloudflare, a CDN rule or framework middleware. No spec-hunting.",
    },
    {
      icon: "ScanSearch",
      title: "Smart header parsing",
      description:
        "Understands curl -I output, DevTools Response Headers and raw dumps, folding duplicate headers and ignoring the status line exactly like a real HTTP client.",
    },
    {
      icon: "Lock",
      title: "Deep CSP & HSTS inspection",
      description:
        "Goes beyond presence: flags a short HSTS max-age or missing includeSubDomains, and warns when a CSP relies on unsafe-inline / unsafe-eval or has no default-src fallback.",
    },
    {
      icon: "Copy",
      title: "Copy or export the report",
      description:
        "Copy the full audit to your clipboard or export it as a text file to attach to a ticket, a pentest remediation list or a client hardening report.",
    },
  ],

  benefits: [
    {
      title: "Fix the headers that actually stop attacks",
      description:
        "Instead of a vague 'add security headers', you get the specific missing control and the exact line to add, closing clickjacking, MIME-sniffing and mixed-content gaps that a plain audit glosses over.",
    },
    {
      title: "Audit private and pre-launch pages",
      description:
        "Because it works on pasted text, you can grade staging environments, internal dashboards and authenticated routes that a public online scanner can never reach.",
    },
    {
      title: "Prove hardening progress",
      description:
        "The repeatable A–F grade lets you snapshot before-and-after states, so you can show a client, manager or auditor that a change moved the needle.",
    },
    {
      title: "Private by design",
      description:
        "Your headers may reveal server software, tokens or internal hostnames. Here they never leave the browser: nothing is uploaded, fetched or logged.",
    },
  ],

  howTo: [
    {
      title: "Grab your response headers",
      description:
        "Run `curl -sI https://yoursite.com`, or open DevTools → Network, click the document request, and copy everything under Response Headers.",
    },
    {
      title: "Paste them in",
      description:
        "Drop the raw header block into the input. A leading status line like `HTTP/2 200` is fine, it's detected and skipped automatically.",
    },
    {
      title: "Read the grade and breakdown",
      description:
        "See your A–F grade, then scan the per-header list to find every missing, weak or passing control with a clear explanation of the risk.",
    },
    {
      title: "Copy the fixes and re-check",
      description:
        "Copy each suggested header line into your server or CDN config, redeploy, then paste the new headers back in to confirm the grade improved.",
    },
  ],

  formats: {
    input: ["HTTP headers", "Text"],
    output: ["Security report", "Text"],
  },

  useCases: [
    {
      audience: "Security engineer",
      title: "Triage a site's header posture fast",
      description:
        "Paste headers from any environment and get a prioritised list of missing controls with fixes, turning a fuzzy 'harden the headers' ticket into concrete, copy-ready changes.",
    },
    {
      audience: "DevOps / SRE",
      title: "Verify a CDN or reverse-proxy change",
      description:
        "After adding headers at Nginx, Cloudflare or a load balancer, confirm they arrive correctly on the response and that HSTS and CSP are actually strong, not just present.",
    },
    {
      audience: "Web developer",
      title: "Ship a hardened <head> and server config",
      description:
        "Check your app's responses before launch so clickjacking, MIME-sniffing and downgrade attacks are covered, and the CSP doesn't quietly rely on unsafe-inline.",
    },
    {
      audience: "Agency / freelancer",
      title: "Add a security check to your handover",
      description:
        "Grade a client's headers, export the report, and deliver a short remediation list that demonstrates due diligence and adds value beyond the build.",
    },
  ],

  troubleshooting: [
    {
      problem: "Can it scan my live URL directly?",
      solution:
        "No, and that's deliberate. Fetching another site's headers from the browser is blocked by CORS, and doing it server-side would mean sending your URL to us. Instead you paste the headers (from curl or DevTools), which also lets you audit staging and login-gated pages a public scanner can't see.",
    },
    {
      problem: "My CSP is present but still flagged as a warning.",
      solution:
        "The checker looks past mere presence. A warn usually means your policy allows `unsafe-inline` or `unsafe-eval` (which reopens the XSS hole CSP is meant to close) or lacks a `default-src` fallback. Move inline scripts to nonces or hashes and add a restrictive default-src to earn a pass.",
    },
    {
      problem: "HSTS is set but doesn't pass.",
      solution:
        "A common cause is a max-age shorter than the recommended six months (15552000 seconds) or a missing `includeSubDomains`. Use `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` once you're confident every subdomain is HTTPS-only.",
    },
    {
      problem: "I pasted headers but nothing was recognised.",
      solution:
        "Make sure each header is on its own line in `Name: value` form. Copying from a formatted table can merge cells: grab the raw text (curl -I is the most reliable source) and re-paste. Blank lines and a leading HTTP status line are handled for you.",
    },
  ],

  tips: [
    "Prefer a CSP with `frame-ancestors 'none'` over X-Frame-Options for modern browsers, but keep X-Frame-Options too for older ones.",
    "Only add `preload` to HSTS once every subdomain is HTTPS-only. Preloading a broken subdomain is hard to undo.",
    "Set `X-Content-Type-Options: nosniff` everywhere, it's a one-line header that stops a whole class of content-type confusion attacks.",
    "Start a CSP in report-only mode (`Content-Security-Policy-Report-Only`) to catch violations before you enforce and risk breaking the page.",
    "`Referrer-Policy: strict-origin-when-cross-origin` is a strong default that keeps analytics working while not leaking full URLs to third parties.",
  ],

  security:
    "Every check runs locally in your browser on the text you paste. Your headers are never uploaded, fetched or logged. That matters because response headers can expose server versions, internal hostnames, session cookies or CSP report endpoints. Here they stay on your device, so it's safe to audit staging, intranet and authenticated pages, and closing the tab erases everything.",

  faq: [
    {
      question: "Which HTTP security headers does this tool check?",
      answer:
        "It grades the six headers with the biggest impact on a site's defensive posture: Strict-Transport-Security (HSTS), Content-Security-Policy (CSP), X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy. It also comments on the legacy X-XSS-Protection header, noting that a modern CSP is the correct replacement.",
    },
    {
      question: "How is the security grade calculated?",
      answer:
        "Each header carries a weight reflecting its importance: HSTS and CSP count double, the others once. A passing header earns full weight, a warning earns half, and a missing or misconfigured critical header earns none. The weighted total becomes a 0–100 score, which maps to an A–F grade (A is 90+, F is under 40).",
    },
    {
      question: "Why can't it just check my URL automatically?",
      answer:
        "Two reasons. Browsers block reading another origin's response headers via CORS, so a purely client-side tool can't fetch them. Doing it server-side would require sending your URL to our servers, which breaks our privacy promise. Pasting the headers keeps everything local and, as a bonus, lets you audit staging, internal and login-only pages a public scanner can't reach.",
    },
    {
      question: "Where do I get my response headers to paste?",
      answer:
        "The quickest way is `curl -sI https://yoursite.com` in a terminal. In a browser, open DevTools (F12) → Network tab, reload the page, click the top document request, and copy everything listed under 'Response Headers'. Either source pastes in directly. A leading `HTTP/2 200` status line is detected and ignored.",
    },
    {
      question: "Is a strong Content-Security-Policy really necessary?",
      answer:
        "It's the single most effective header against cross-site scripting and data injection, because it controls exactly which scripts, styles and resources a page may load. A good CSP sets a restrictive `default-src`, avoids `unsafe-inline` and `unsafe-eval`, and uses nonces or hashes for the scripts you do need. This checker flags policies that are present but weakened by those unsafe allowances.",
    },
    {
      question: "Do security headers affect SEO?",
      answer:
        "Indirectly but meaningfully. HTTPS (which HSTS enforces) is a confirmed ranking signal, and a hacked or defaced site, the kind these headers help prevent, can be flagged by Google Safe Browsing and dropped from results. Strong headers also protect Core Web Vitals and user trust, both of which support long-term search performance.",
    },
    {
      question: "What's the difference between X-Frame-Options and CSP frame-ancestors?",
      answer:
        "Both stop clickjacking by controlling who can embed your page in a frame. X-Frame-Options (DENY or SAMEORIGIN) is the older, simpler header. CSP's `frame-ancestors` directive is more flexible and is what modern browsers prefer. Best practice is to set frame-ancestors in your CSP and keep X-Frame-Options as a fallback for legacy clients. This tool checks for either.",
    },
    {
      question: "Are my pasted headers stored or sent anywhere?",
      answer:
        "No. Parsing, scoring and fix generation all happen in your browser using native APIs. Nothing is transmitted, stored server-side or logged, so headers that expose server software, internal hostnames or tokens stay entirely on your machine. Closing the tab removes every trace.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release. Paste response headers for an A–F security grade with per-header pass/warn/fail on HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy, each with a copy-ready fix.",
    },
    {
      date: "2026-06-25",
      change:
        "Deepened CSP inspection (unsafe-inline / unsafe-eval and missing default-src detection) and HSTS checks (max-age threshold, includeSubDomains), plus a parsed-headers summary and copyable fix snippets.",
    },
    {
      date: "2026-06-30",
      change:
        "Added report copy/export, a real-world sample header set, and clearer risk explanations for every verdict.",
    },
  ],

  relatedTools: [
    "http-header-checker",
    "meta-tag-analyzer",
    "robots-txt-validator",
    "json-formatter",
    "url-parser",
  ],
};

export default securityHeaderChecker;
