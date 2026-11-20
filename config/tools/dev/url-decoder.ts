import type { Tool } from "@/types";

/**
 * URL Decoder, decodes percent-encoded text and, when the input is a URL,
 * explodes it into a live component table (protocol, host, port, path, each
 * query parameter decoded, hash). Copy is unique to this tool: the emphasis is
 * on turning an unreadable `%E2%9C%93?utm_source%3D…` string back into plain
 * text, and on reading a messy query string as a clean, per-parameter table.
 * Nothing here is shared with the Base64 or JWT tools' SEO copy.
 */
const urlDecoder: Tool = {
  slug: "url-decoder",
  title: "URL Decoder",
  description:
    "Decode percent-encoded (URL-encoded) text back to plain, readable characters, and when you paste a full link, see it broken down into protocol, host, port, path, decoded query parameters and hash. 100% in-browser. Nothing is uploaded.",
  category: "developer-tools",
  icon: "Link2",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "URL Decoder: Decode Percent-Encoding & Parse Query Strings",
  tagline:
    "Paste an ugly %E2%9C%93-riddled URL and get plain text instantly, plus a live table that splits any link into its host, path, hash and every decoded query parameter. Nothing leaves your tab.",
  longDescription:
    "Web addresses can only carry a limited set of ASCII characters, so anything else (spaces, accents, emoji, ampersands, slashes inside a value) gets 'percent-encoded' into sequences like %20, %C3%A9 or %26. That keeps links transportable but makes them unreadable to humans and easy to copy wrong. This URL Decoder reverses that encoding: paste any percent-encoded string and it decodes back to the original UTF-8 text as you type. When what you paste is a complete URL, it goes further and parses the link with the browser's native URL engine, laying out the protocol, host, port, path, fragment and, most usefully, every query parameter as its own decoded key/value row, so a tangled ?utm_source%3Dnewsletter%26q%3Dblack%2Bcoffee becomes a clean table you can actually read. You choose whether to decode as a component (decodeURIComponent, which unescapes reserved characters like & = ? /) or as a whole URI (decodeURI, which preserves structure), the two behave differently and picking wrong is a classic source of mangled output. Everything runs locally in JavaScript: there is no server round-trip, no logging and no account, so you can safely decode links that contain tokens, tracking IDs or private query values without them ever leaving your device.",

  ctaText: "Decode URL",

  keywords: [
    "url decoder",
    "url decode online",
    "decode url",
    "percent decoding",
    "decodeuricomponent online",
    "url parameter decoder",
    "decode query string",
    "unescape url",
    "url component parser",
    "decode utm parameters",
    "online url unescape",
  ],

  seo: {
    title: "URL Decoder: Decode Percent-Encoding & Parse Query Strings | GigAI Tools",
    description:
      "Free online URL decoder. Paste percent-encoded text to decode it back to plain characters, or paste a full link to break it into protocol, host, path and every decoded query parameter, all in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Zap",
      title: "Live decoding as you type",
      description:
        "There's no decode button. Paste or type a percent-encoded string and the plain-text result appears instantly, with each keystroke re-decoded so you can experiment and see the effect in real time.",
    },
    {
      icon: "Table2",
      title: "Full URL component table",
      description:
        "When your input is a real URL, it's parsed with the browser's native URL API into a labelled table: protocol, host, hostname, port, path, origin and hash: each copyable on its own.",
    },
    {
      icon: "ListTree",
      title: "Per-parameter query breakdown",
      description:
        "The query string is split into individual key/value rows with both the raw and decoded value shown, repeats preserved, so a wall of &-joined tracking params becomes something you can actually read.",
    },
    {
      icon: "ToggleRight",
      title: "Component vs. whole-URI mode",
      description:
        "Switch between decodeURIComponent (unescapes reserved characters like & = ? /) and decodeURI (preserves URL structure), the right choice for pasted values versus whole links, explained inline.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Decoding and parsing run entirely client-side. Links containing tokens, session IDs or private query values are never transmitted, stored or logged, safe to decode real production URLs.",
    },
    {
      icon: "Copy",
      title: "Copy, share & import",
      description:
        "Copy the decoded text or any single component, share a deep link that reopens the exact URL you're inspecting, or drag a .txt file of links straight onto the input.",
    },
  ],

  benefits: [
    {
      title: "Read encoded links at a glance",
      description:
        "Stop mentally translating %20 and %C3%A9. Turn an unreadable, percent-riddled address back into the plain text it stands for so you can see what a link actually points to.",
    },
    {
      title: "Audit tracking & UTM parameters",
      description:
        "The query table makes every utm_source, utm_campaign and redirect target its own decoded row, so you can verify exactly what an analytics or ad link is carrying before you ship it.",
    },
    {
      title: "Safe for private URLs",
      description:
        "Because nothing is uploaded, you can decode links that embed access tokens, signed-URL signatures or personal query values without leaking them to a third-party server.",
    },
    {
      title: "No sign-up, no limits",
      description:
        "It's a single web page, decode as many URLs as you like on any device, with no daily cap, no watermark and no account wall between you and the answer.",
    },
  ],

  howTo: [
    {
      title: "Paste your encoded text or URL",
      description:
        "Drop a percent-encoded string or a whole link into the input. Paste it, drag a.txt file onto the pane, or load the sample to see how it works. Decoding starts instantly.",
    },
    {
      title: "Read the decoded output",
      description:
        "The plain-text result appears immediately. If a value contained %20, %26 or UTF-8 sequences like %C3%A9, you'll see the real spaces, ampersands and accented characters restored.",
    },
    {
      title: "Explore the URL component table",
      description:
        "If your input is a valid URL, a table breaks it into protocol, host, port, path and hash, plus one decoded row per query parameter, copy any single piece with a click.",
    },
    {
      title: "Pick the right decode mode",
      description:
        "Use component mode for a single pasted value, or whole-URI mode when you want to preserve a full link's structure. The tool explains the difference so you don't mangle the result.",
    },
    {
      title: "Copy or share",
      description:
        "Copy the decoded text or any component, or generate a share link that reopens the exact URL you're inspecting, the link travels in the URL fragment, so it stays local.",
    },
  ],

  formats: {
    input: ["URL", "Percent-encoded text", "Query string", ".txt"],
    output: ["Plain text", "Parsed components", "Key/value table"],
  },

  useCases: [
    {
      audience: "Backend & API developers",
      title: "Debug callback and redirect URLs",
      description:
        "Decode an OAuth redirect_uri or webhook callback to see the real path and query it encodes, and confirm a double-encoded parameter isn't breaking your router before you blame the client.",
    },
    {
      audience: "Marketers & growth teams",
      title: "Verify UTM & campaign links",
      description:
        "Paste a tracking link and read every utm_* parameter as its own decoded row, so you can confirm the source, medium and campaign are spelled exactly right before a send goes out.",
    },
    {
      audience: "QA & support engineers",
      title: "Reproduce bugs from raw URLs",
      description:
        "When a bug report includes an unreadable encoded link, decode it to recover the exact page and parameters the user hit, turning a copy-pasted mess into a reproducible test case.",
    },
    {
      audience: "Security researchers",
      title: "Inspect suspicious links locally",
      description:
        "Decode a possibly-malicious percent-encoded URL to reveal its true destination and payload parameters without visiting it, and without sending the link to any remote service.",
    },
  ],

  faq: [
    {
      question: "What does a URL decoder do?",
      answer:
        "URLs can only contain a limited set of characters, so anything else is 'percent-encoded' into sequences like %20 for a space or %C3%A9 for é. A URL decoder reverses that: it reads the percent-encoded string and reconstructs the original UTF-8 text. This tool decodes as you type, and when the input is a full URL it also parses the link into its protocol, host, path, query parameters and fragment.",
    },
    {
      question: "What's the difference between component and whole-URI decoding?",
      answer:
        "decodeURIComponent (component mode) unescapes every reserved character, including & = ? / and #, so it's right for a single value you pulled out of a query string. decodeURI (whole-URI mode) leaves those structural characters encoded so a complete link stays syntactically intact. Decode a whole URL with component mode and you can accidentally merge the query into the path. Decode a lone value with whole-URI mode and reserved characters stay escaped. This tool lets you pick, and defaults to component mode.",
    },
    {
      question: "Is it safe to decode private or tokenised URLs here?",
      answer:
        "Yes. All decoding and parsing happen inside your browser tab in JavaScript: the URL, its tokens and its query values are never uploaded, stored or logged by us. That local-only design is exactly why it's safe to decode links containing access tokens, signed-URL signatures or personal parameters that you wouldn't want to send to a server.",
    },
    {
      question: "Why does my decoded output still contain % characters?",
      answer:
        "That usually means the input was double-encoded, encoded twice, so one pass of decoding only removes the outer layer and reveals another %25 or %2520. Decode it a second time to fully recover the text. If a stray % remains that isn't part of a valid %XX pair, the string wasn't validly encoded and the tool will flag the invalid percent-encoding.",
    },
    {
      question: "Can it parse the query string into separate parameters?",
      answer:
        "Yes. When your input is a valid absolute URL, the tool uses the browser's URLSearchParams to split the query into individual key/value pairs, decode each one, and show them as a table with repeats preserved in order. That turns a long &-joined query into a clean, readable list you can copy field by field.",
    },
    {
      question: "Why doesn't my URL show a component table?",
      answer:
        "The table only appears for a valid absolute URL: one with a scheme like https://. A bare path such as /search?q=x or a relative link has no host or protocol for the parser to resolve, so only the plain-text decode is shown. Add the scheme and host (for example https://example.com/…) to get the full breakdown.",
    },
    {
      question: "Does it handle emoji and non-Latin characters?",
      answer:
        "Yes. Percent-encoding stores non-ASCII characters as their UTF-8 bytes (for example a check mark ✓ becomes %E2%9C%93). The decoder reassembles those byte sequences and decodes them back to the correct Unicode character, so emoji, accented letters and non-Latin scripts all come out correctly.",
    },
    {
      question: "What's the difference between URL decoding and Base64 decoding?",
      answer:
        "They solve different problems. URL (percent) encoding makes text safe to place inside a URL by escaping special characters. Base64 encodes arbitrary binary data as a compact ASCII string. A value can be both (Base64 first, then percent-encoded to travel in a URL) in which case you URL-decode here, then Base64-decode the result with our Base64 tool.",
    },
  ],

  tips: [
    "If decoded output still has % sequences, the input was probably double-encoded, decode it again to peel off the second layer.",
    "Use component mode for a single value copied out of a query string, and whole-URI mode when you want to keep a full link's structure intact.",
    "The component table only appears for absolute URLs. Add https:// to a bare path to unlock the full breakdown.",
    "Use the share link to hand a teammate the exact URL you're inspecting. It travels in the page fragment, so it never touches a server.",
    "Reading a tracking link? Scan the query table top-to-bottom to confirm each utm_* value is spelled correctly before the campaign goes live.",
  ],

  troubleshooting: [
    {
      problem: "'Input contains an invalid percent-encoding' error.",
      solution:
        "A lone % that isn't followed by two hex digits (like a literal 50% in text) breaks decoding. Encode the stray percent as %25, or remove it, then decode again. This also happens if part of a %XX pair was lost when copying.",
    },
    {
      problem: "No component table appears for my link.",
      solution:
        "The table needs a valid absolute URL. A relative path or a query string on its own has no scheme or host to parse. Prefix it with the scheme and host (e.g. https://example.com) and the breakdown will appear.",
    },
    {
      problem: "The decoded value merged my query into the path.",
      solution:
        "You likely decoded a whole URL in component mode, which unescapes the reserved ? & = / characters that hold a link together. Switch to whole-URI mode to decode a complete link while preserving its structure.",
    },
    {
      problem: "Accented or emoji characters come out as garbled symbols.",
      solution:
        "That's a sign the original bytes weren't valid UTF-8 or were partially copied. Re-copy the whole encoded string in one piece. The decoder handles UTF-8 percent sequences correctly when they're complete.",
    },
  ],

  security:
    "Your URL and everything in it (paths, tokens, tracking IDs and query values) are decoded and parsed entirely in your browser with JavaScript and the native URL API. Nothing is uploaded, stored, or logged on our servers, which is precisely why it's safe to decode real, private links here. Treat any URL that embeds a credential as sensitive and clear it when you're done.",

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: live percent-decoding, native URL parsing into a protocol/host/port/path/hash component table, and a decoded per-parameter query breakdown.",
    },
    {
      date: "2026-06-28",
      change:
        "Added a component vs. whole-URI decode toggle with inline guidance, per-component copy buttons, and drag-and-drop / paste import of .txt files.",
    },
    {
      date: "2026-07-01",
      change:
        "Introduced shareable deep links that carry the URL in the page fragment, a sample-link empty state, and keyboard shortcuts with an in-app reference.",
    },
  ],

  relatedTools: ["base64-encoder", "json-formatter", "jwt-decoder", "uuid-generator"],
};

export default urlDecoder;
