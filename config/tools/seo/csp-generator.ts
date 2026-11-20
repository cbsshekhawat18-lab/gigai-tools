import type { Tool } from "@/types";

/**
 * CSP Generator: a friendly, per-directive builder for the
 * `Content-Security-Policy` HTTP header. You describe, in plain toggles and
 * source lists, where scripts, styles, images, fonts, frames and connections
 * are allowed to come from; the tool assembles a correct, deduplicated policy
 * string, explains every directive in prose, and grades how strict the result
 * actually is with a live strictness meter. All copy below is unique to
 * Content-Security-Policy authoring so the page ranks on its own merits rather
 * than competing with the security-header checker or the HTTP-header tools.
 */
const cspGenerator: Tool = {
  slug: "csp-generator",
  title: "CSP Generator",
  description:
    "Build a correct Content-Security-Policy header from a friendly per-directive form (script, style, img, connect, font and frame sources) with a plain-English explanation and a live strictness meter. 100% in your browser.",
  category: "seo-tools",
  group: "Headers & Security",
  icon: "ShieldPlus",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Content-Security-Policy Generator: Build a CSP Header Directive by Directive",
  tagline:
    "Set where scripts, styles, images, fonts, frames and API calls are allowed to load from, and get a clean, ready-to-ship Content-Security-Policy header: with an explanation of every directive and a strictness score so you know exactly how much XSS protection you're getting.",
  longDescription:
    "The GigAI CSP Generator turns the browser's strictest, and most fiddly, security header into a form anyone can drive. Instead of hand-writing `default-src 'self'; script-src 'self' https://cdn.example.com; …` and hoping the quoting is right, you fill in each directive from its own row: pick the trusted keyword sources (self, none, unsafe-inline, unsafe-eval, strict-dynamic), add the hosts and CDNs you actually use, and flag the common extras like `upgrade-insecure-requests` and `frame-ancestors`. As you type, the tool assembles the header value with correctly quoted keyword tokens, plain host tokens left untouched, and empty directives dropped, then shows the finished `Content-Security-Policy: …` line ready to paste into Nginx, Apache, a `<meta http-equiv>` tag or your framework's headers config. A live strictness meter reads the policy back and tells you, in plain terms, why it scores the way it does, an `unsafe-inline` in `script-src` drags it down, a missing `default-src` fallback is flagged, and a wildcard `*` is called out as effectively no protection at all. Every directive comes with a one-line explanation of what it controls, so you learn the model while you build. Because the whole thing runs locally with no network calls, your internal hostnames, CDN URLs and API endpoints never leave the tab. You can safely draft a policy for a private staging environment and copy, download or reset it entirely offline.",

  ctaText: "Build my CSP header",

  keywords: [
    "csp generator",
    "content security policy generator",
    "content-security-policy header",
    "csp header generator",
    "build csp policy",
    "script-src generator",
    "default-src csp",
    "frame-ancestors",
    "upgrade-insecure-requests",
    "csp meta tag",
    "prevent xss header",
    "csp nonce",
  ],

  seo: {
    title: "CSP Generator, Build a Content-Security-Policy Header | GigAI Tools",
    description:
      "Free Content-Security-Policy generator: build a CSP header directive by directive (script-src, style-src, img-src, connect-src, frame-ancestors) with a plain-English explanation and a live strictness score. Nothing is uploaded.",
  },

  features: [
    {
      icon: "SlidersHorizontal",
      title: "Per-directive form, not a text box",
      description:
        "Each directive: default-src, script-src, style-src, img-src, connect-src, font-src, frame-src, frame-ancestors and more. Gets its own row with keyword toggles and a host list, so you build a policy without memorising the grammar.",
    },
    {
      icon: "Quote",
      title: "Correct quoting, automatically",
      description:
        "Keyword sources like 'self', 'none', 'unsafe-inline' and nonce-/sha256- tokens are single-quoted for you. Hostnames and schemes are left exactly as typed. No more policies silently broken by a missing quote.",
    },
    {
      icon: "Gauge",
      title: "Live strictness meter",
      description:
        "A running score reads your finished policy back and explains it: unsafe-inline and unsafe-eval cost points, a wildcard * is called out, and a missing default-src fallback is flagged, so you see how much protection you actually have.",
    },
    {
      icon: "BookOpen",
      title: "Every directive explained",
      description:
        "Each row carries a one-line description of what the directive controls and which resources it governs, turning the builder into a working reference for the CSP model as you go.",
    },
    {
      icon: "ToggleRight",
      title: "Common extras as one-click flags",
      description:
        "Toggle upgrade-insecure-requests and block-all-mixed-content, and choose whether to emit the policy as a header value or as a <meta http-equiv> tag for pages you can't set headers on.",
    },
    {
      icon: "Copy",
      title: "Copy, download, reset & undo",
      description:
        "Copy the header line, download it as a.txt snippet, load a curated starter policy, reset to blank, or step back and forth through undo/redo, all keyboard-driven and fully offline.",
    },
  ],

  benefits: [
    {
      title: "Ship a real XSS defence, not a broken string",
      description:
        "The generator emits valid, correctly-quoted CSP syntax and warns about the weak spots, so the policy you deploy actually mitigates cross-site scripting instead of being ignored by the browser as malformed.",
    },
    {
      title: "Understand the header while you build it",
      description:
        "Inline explanations and the strictness readout mean you leave knowing what script-src, connect-src and frame-ancestors each do. Not just with a pasted snippet you're afraid to touch.",
    },
    {
      title: "Tighten gradually, safely",
      description:
        "Start from a permissive baseline, watch the meter climb as you replace unsafe-inline with nonces and trim wildcards, and land on a strict policy without locking yourself out of your own assets.",
    },
    {
      title: "Private by design",
      description:
        "Everything runs locally in your browser, so internal hostnames, CDN URLs and staging endpoints in your policy are never uploaded, logged or seen by anyone.",
    },
  ],

  howTo: [
    {
      title: "Start from a baseline",
      description:
        "Load a starter policy (strict, self-only, or a typical app with a CDN) or begin from blank. The default-src row sets the fallback for everything you don't override.",
    },
    {
      title: "Fill in each directive",
      description:
        "For script-src, style-src, img-src, connect-src and the rest, toggle the keyword sources you need and add your real hostnames and CDNs, one per line. Leave a directive empty to omit it.",
    },
    {
      title: "Add the common flags",
      description:
        "Turn on upgrade-insecure-requests to auto-promote http references to https, set frame-ancestors to control who can iframe your page, and enable block-all-mixed-content if you need it.",
    },
    {
      title: "Read the strictness meter",
      description:
        "Check the score and its notes. Replace unsafe-inline with a nonce or hash where you can, and remove any wildcard * that the meter flags as effectively no protection.",
    },
    {
      title: "Copy or download the header",
      description:
        "Copy the finished Content-Security-Policy line into your server config or framework, or switch to the <meta> output for pages where you can't set HTTP headers. Download it as a snippet for your infra repo.",
    },
  ],

  formats: {
    input: ["Form fields"],
    output: ["HTTP header", "CSP", "Meta tag"],
  },

  useCases: [
    {
      audience: "Frontend / full-stack developer",
      title: "Lock down a single-page app",
      description:
        "Enumerate your API origins in connect-src, your CDN in script-src and style-src, and your image hosts in img-src, then paste the generated header into your reverse proxy or framework config in one go.",
    },
    {
      audience: "DevOps / platform engineer",
      title: "Standardise a policy across services",
      description:
        "Build one strict baseline policy with a default-src 'self' fallback and explicit allowlists, download it, and reuse the same header value across every service behind your gateway.",
    },
    {
      audience: "Security engineer",
      title: "Audit and tighten an existing policy",
      description:
        "Recreate a live policy in the form, watch the strictness meter explain each weakness, and drive the score up by swapping unsafe-inline for nonces and trimming wildcard sources before rollout.",
    },
    {
      audience: "Site owner on shared hosting",
      title: "Add CSP without server access",
      description:
        "Switch to the <meta http-equiv=\"Content-Security-Policy\"> output and drop the generated tag straight into your page head when you can't set real HTTP response headers.",
    },
  ],

  troubleshooting: [
    {
      problem: "My inline scripts or styles stopped working after adding the CSP.",
      solution:
        "That's CSP doing its job. Inline <script> and style attributes are blocked unless you allow them. Either move the code into external files listed in script-src/style-src, or add a per-request nonce (script-src 'nonce-…') or a sha256- hash of the exact inline block. Using 'unsafe-inline' works but the strictness meter will (rightly) penalise it.",
    },
    {
      problem: "My fonts, images or API calls are being blocked.",
      solution:
        "Each resource type has its own directive that falls back to default-src. Add the font host to font-src, image hosts to img-src, and every API/websocket origin your page fetches to connect-src. The browser console names the blocked URL and the directive that blocked it. Add that exact origin to the matching row.",
    },
    {
      problem: "The frame-ancestors setting isn't stopping my page being framed.",
      solution:
        "frame-ancestors is only enforced when the policy is delivered as a real HTTP response header. It is ignored inside a <meta> tag. If you need clickjacking protection on a page you can't set headers for, you'll also need X-Frame-Options at the server. Otherwise switch to header output.",
    },
    {
      problem: "The meta-tag version behaves differently from the header.",
      solution:
        "A <meta http-equiv> CSP applies only to the document it's in, must appear early in <head> before any resource it governs, and can't use the report-only mode or frame-ancestors/sandbox directives. For a full-strength policy, deliver it as a response header wherever you can.",
    },
  ],

  tips: [
    "Always set a default-src, it's the fallback every fetch directive inherits from, so 'default-src 'self'' quietly protects resource types you forgot to list.",
    "Prefer a per-request nonce or a sha256- hash over 'unsafe-inline' for scripts. It's the single biggest jump in real XSS protection and the strictness meter rewards it.",
    "Use frame-ancestors 'none' (or 'self') as the modern replacement for X-Frame-Options to control who can iframe your page.",
    "Add upgrade-insecure-requests so any lingering http:// references are fetched over https:// without you rewriting every URL.",
    "Roll out with Content-Security-Policy-Report-Only first to collect violations without breaking anything, then flip to the enforcing header once the reports are clean.",
  ],

  security:
    "Every part of your Content-Security-Policy is assembled locally in your browser: nothing you type is uploaded, stored or logged. Internal hostnames, CDN URLs, API endpoints and staging origins stay on your device, so you can safely draft a policy for a private or unreleased environment, and closing the tab erases it completely.",

  faq: [
    {
      question: "What is a Content-Security-Policy and why do I need one?",
      answer:
        "A Content-Security-Policy (CSP) is an HTTP response header that tells the browser which sources of scripts, styles, images, fonts, frames and network connections are trusted for your page. Anything not on the allowlist is blocked, which makes it one of the strongest defences against cross-site scripting (XSS) and data-injection attacks. This generator builds that header for you from a simple per-directive form.",
    },
    {
      question: "What's the difference between default-src and the other -src directives?",
      answer:
        "default-src is the fallback: any fetch directive you don't explicitly set (script-src, style-src, img-src, font-src, connect-src, media-src, and more) inherits its value from default-src. So a good policy sets a restrictive default-src (often 'self') and then loosens only the specific directives that genuinely need extra sources. A handful of directives (like frame-ancestors, base-uri and form-action) do not fall back to default-src and must be set on their own.",
    },
    {
      question: "How do I allow inline scripts or styles safely?",
      answer:
        "The safest way is a nonce or a hash rather than 'unsafe-inline'. Add script-src 'nonce-RANDOM' and put the same random value on each trusted inline <script nonce=\"RANDOM\">, generating a fresh nonce per request. Alternatively, use a sha256-/sha384-/sha512- hash of the exact inline content. 'unsafe-inline' works but re-opens the XSS hole CSP is meant to close, which is why the strictness meter marks it down.",
    },
    {
      question: "Can I use a CSP without access to server headers?",
      answer:
        "Yes, switch this tool to the <meta http-equiv=\"Content-Security-Policy\"> output and place the tag high in your page's <head>, before any resource it needs to govern. Note that a meta-tag CSP can't use report-only mode or the frame-ancestors and sandbox directives. For a full-strength policy, deliver it as an HTTP response header instead.",
    },
    {
      question: "What does 'unsafe-inline' or a wildcard * actually do to my security?",
      answer:
        "'unsafe-inline' lets any inline script or style run, and a wildcard * in a source list allows resources from any origin: both effectively disable the protection that directive was providing. The strictness meter flags them explicitly because a policy full of * and unsafe-inline can look thorough while providing almost no real defence against injected scripts.",
    },
    {
      question: "How do I stop other sites from putting my page in an iframe?",
      answer:
        "Set frame-ancestors 'none' to forbid all framing, or frame-ancestors 'self' to allow only your own origin. This is the modern, more flexible replacement for the X-Frame-Options header. Remember that frame-ancestors is only enforced when the CSP is sent as a real response header, not from a <meta> tag.",
    },
    {
      question: "Will this generator break my site the moment I deploy the policy?",
      answer:
        "A CSP only blocks what isn't on your allowlist, so the risk is legitimate resources you forgot to list. Deploy the policy in Content-Security-Policy-Report-Only mode first: the browser reports violations without blocking anything, letting you spot every missing source. Once the reports are clean, switch to the enforcing Content-Security-Policy header this tool generates.",
    },
    {
      question: "Are my hostnames and URLs sent anywhere?",
      answer:
        "No. The entire policy is assembled in your browser with no network requests. Your internal domains, CDN hosts, API origins and staging URLs never leave the tab (nothing is uploaded, stored or logged) so it's safe to build a policy for a private or pre-launch environment.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, per-directive CSP builder for default/script/style/img/connect/font/frame/frame-ancestors, auto-quoted keyword sources, header output, copy/download/reset and undo/redo.",
    },
    {
      date: "2026-06-24",
      change:
        "Added the live strictness meter with plain-English notes (unsafe-inline, unsafe-eval, wildcard * and missing default-src detection) plus per-directive explanations.",
    },
    {
      date: "2026-06-30",
      change:
        "Added upgrade-insecure-requests / block-all-mixed-content flags, a <meta http-equiv> output mode, and curated starter policies (strict, self-only, app-with-CDN).",
    },
  ],

  relatedTools: [
    "security-header-checker",
    "http-header-checker",
    "robots-txt-generator",
    "url-encoder",
  ],
};

export default cspGenerator;
