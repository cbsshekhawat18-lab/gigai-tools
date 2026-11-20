import type { Tool } from "@/types";

/**
 * URL Encoder: a client-side percent-encoding tool with two distinct modes
 * (encodeURIComponent for values, encodeURI for whole URLs) and a per-line
 * batch mode. All copy is unique to encoding; the reverse lives in the sibling
 * `url-decoder`. Everything runs locally via the browser's own encoding
 * primitives, so query strings, tokens and paths never leave the tab.
 */
const urlEncoder: Tool = {
  slug: "url-encoder",
  title: "URL Encoder",
  description:
    "Percent-encode text and URLs instantly: pick component mode for query values or full-URL mode to preserve structure, with a per-line batch switch. 100% in your browser, nothing uploaded.",
  category: "developer-tools",
  icon: "Link",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-18",

  h1: "URL Encoder, Percent-Encode Text & URLs Online",
  tagline:
    "Type or paste text and watch it turn into correct percent-encoding as you go. Switch between component mode for query-string values and full-URL mode that keeps:/?#& intact, encode a whole list line-by-line, and copy the result in a click. Unicode-safe and 100% in your browser: nothing is ever uploaded.",
  longDescription:
    "The GigAI URL Encoder converts text to percent-encoding the instant you type. There is no 'Encode' button to reach for. It exposes the two encoders the web platform actually uses, because they are not interchangeable: component mode (encodeURIComponent) escapes reserved characters like & = ? / # and space so a value is safe to drop into a single query parameter or path segment, while full-URL mode (encodeURI) leaves those structural characters alone so an already-assembled address stays a valid, clickable link. Both are Unicode-correct, emoji, accents, curly quotes and CJK are encoded through UTF-8 into their proper %E2%9C%93-style byte sequences rather than being mangled or dropped. Turn on batch mode to encode a whole newline-separated list at once, one encoded line out for each line in, which is ideal for building UTM values, escaping a column of search terms or preparing bulk redirect targets. Copy, download, share a reopenable link, and undo/redo are all one shortcut away, and every keystroke stays on your device. No request is ever made.",

  ctaText: "Encode URL",

  keywords: [
    "url encode",
    "url encoder",
    "percent encoding",
    "encodeuricomponent online",
    "encode query string",
    "escape url",
    "uri encoder",
    "url encode online",
    "encode special characters url",
    "utf-8 url encoding",
    "batch url encode",
    "encodeuri vs encodeuricomponent",
  ],

  seo: {
    title: "URL Encoder, Percent-Encode Text & URLs Online Free | GigAI Tools",
    description:
      "Free online URL encoder. Percent-encode text with encodeURIComponent or preserve URL structure with encodeURI, batch-encode line by line, Unicode-safe, all in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Zap",
      title: "Live, instant encoding",
      description:
        "The percent-encoded output appears in the same keystroke you type. No button to press, no reload. Edit the input and the result rewrites itself immediately.",
    },
    {
      icon: "SplitSquareHorizontal",
      title: "Component vs full-URL mode",
      description:
        "Choose encodeURIComponent to escape reserved characters for a query value or path segment, or encodeURI to keep :/?#& intact so an assembled URL stays valid. The difference is one clearly-labelled toggle.",
    },
    {
      icon: "Languages",
      title: "Unicode-safe by default",
      description:
        "Text is encoded through UTF-8, so emoji, accents, smart quotes and CJK become correct %XX byte sequences instead of being stripped or corrupted: exactly what a server will decode back.",
    },
    {
      icon: "ListOrdered",
      title: "Batch (per-line) mode",
      description:
        "Flip on batch mode to encode a newline-separated list in one pass, one encoded line out per line in. Perfect for UTM values, bulk redirects or a column of search terms.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, in-browser",
      description:
        "Encoding uses the browser's native encodeURIComponent / encodeURI. Nothing is uploaded, stored or logged, your URLs and query values never leave the tab.",
    },
    {
      icon: "Keyboard",
      title: "Keyboard-first workflow",
      description:
        "Copy, download, share, undo and redo are all one shortcut away with an on-screen cheat sheet, so you touch the mouse less than with any other encoder.",
    },
  ],

  benefits: [
    {
      title: "The right encoder, every time",
      description:
        "Encoding a value and encoding a whole URL are different jobs: using the wrong one double-escapes an ampersand or breaks a link. Both modes sit side by side so you always pick correctly.",
    },
    {
      title: "Output that round-trips exactly",
      description:
        "Because everything goes through UTF-8, what you encode here decodes back byte-for-byte on the server or in the sibling decoder. No dropped characters, no mojibake.",
    },
    {
      title: "Bulk work without a spreadsheet",
      description:
        "Batch mode turns a list into an encoded list in one go, so preparing dozens of query values or redirect targets takes seconds instead of manual, error-prone escaping.",
    },
    {
      title: "Free, unlimited, no account",
      description:
        "Encode as much as you like with no sign-up, quota or watermark. Everything is client-side, so there is no server cost to pass on to you.",
    },
  ],

  howTo: [
    {
      title: "Pick your encoding mode",
      description:
        "Choose Component to escape a single value (query parameter or path segment) or Full URL to encode an assembled address while keeping its structure intact.",
    },
    {
      title: "Type, paste or import",
      description:
        "Enter text directly, paste with Ctrl/Cmd+V, or drop a text file onto the workspace. The percent-encoded output updates live beside your input.",
    },
    {
      title: "Turn on batch mode if needed",
      description:
        "Enable batch to treat each line separately. Every input line is encoded independently and returned on its own line, preserving order.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the result with one click, download it as a .txt file, or generate a shareable link that reopens the tool with your exact input.",
    },
  ],

  formats: {
    input: ["Text", "URL", "Newline-separated list", "TXT file"],
    output: ["Percent-encoded text", "Encoded URL", "Encoded list"],
  },

  useCases: [
    {
      audience: "Web developer",
      title: "Build safe query strings",
      description:
        "Encode a search term, filter value or redirect target in component mode before concatenating it into a URL, so an & or space in the value can't break the query string.",
    },
    {
      audience: "Marketer & analyst",
      title: "Prepare UTM and tracking links",
      description:
        "Batch-encode a column of campaign names or landing-page paths so every UTM parameter is properly escaped and your links resolve and track correctly.",
    },
    {
      audience: "API engineer",
      title: "Escape path and header values",
      description:
        "Percent-encode an identifier, filename or token that goes into a REST path or Location header while testing an endpoint in curl or Postman.",
    },
    {
      audience: "QA & support",
      title: "Reproduce and inspect encoded links",
      description:
        "Encode a value the way the app does to reproduce a bug, then hand the string to the URL decoder to confirm exactly what the server will receive.",
    },
  ],

  troubleshooting: [
    {
      problem: "My whole URL got escaped and the :// and ? are now %3A etc.",
      solution:
        "You encoded a full address in Component mode, which escapes reserved characters. Switch to Full URL mode (encodeURI) to encode an already-assembled URL while leaving its structure intact.",
    },
    {
      problem: "An & or = in my value was left unescaped.",
      solution:
        "Full URL mode preserves reserved characters on purpose. To escape a single query value or path segment, use Component mode (encodeURIComponent), which escapes & = ? / # and space.",
    },
    {
      problem: "My batch output has a blank line where I had an empty line.",
      solution:
        "That's expected, batch mode preserves line count and order, so an empty input line encodes to an empty output line. Remove blank lines from the input if you don't want them in the result.",
    },
    {
      problem: "My text looks double-encoded (%2520 instead of %20).",
      solution:
        "Your input was already percent-encoded before you pasted it, so encoding it again escaped the % signs. Decode it once with the URL decoder first, then encode the original text.",
    },
  ],

  tips: [
    "Use Component mode for anything that goes inside a single query value or path segment, and Full URL mode only for an address you've already assembled.",
    "Space becomes %20 in both modes here. If you specifically need the form-style + for a query, replace spaces after encoding.",
    "Turn on batch mode to encode a whole list at once: one encoded line out per input line, in order.",
    "Press Ctrl/Cmd+Enter to force a re-run, and use the Share button to send a teammate a link that reopens with your input.",
    "If a value looks double-encoded, decode it once first with the sibling URL Decoder, then encode the clean original.",
  ],

  security:
    "Every character is percent-encoded locally in your browser using the platform's own encodeURIComponent and encodeURI functions. Your text, URLs and query values are never uploaded, stored, logged or shared, nothing leaves your device, and closing the tab discards it all.",

  faq: [
    {
      question: "Is my text or URL uploaded to encode it?",
      answer:
        "No. Encoding happens entirely in your browser with native JavaScript functions. Your input never leaves your device, so there is nothing for us to receive, store or see. It is fully private.",
    },
    {
      question: "What's the difference between component and full-URL mode?",
      answer:
        "Component mode uses encodeURIComponent, which escapes reserved characters like & = ? / # and space so a single value is safe inside a query parameter or path segment. Full-URL mode uses encodeURI, which leaves those structural characters alone so an already-assembled URL stays valid and clickable. Use component for values, full-URL for whole addresses.",
    },
    {
      question: "How do I encode spaces in a URL?",
      answer:
        "Both modes here encode a space as %20, which is valid everywhere in a URL. Some form submissions use + for a space inside a query string. If you specifically need that form, encode first and then replace %20 (or the space) with + in the query portion.",
    },
    {
      question: "Is the encoder Unicode-safe for emoji and accents?",
      answer:
        "Yes. Text is encoded through UTF-8 before percent-encoding, so emoji, accented letters, smart quotes and CJK characters produce correct multi-byte %XX sequences that a server decodes back exactly as you entered them.",
    },
    {
      question: "Can I encode many lines or a whole list at once?",
      answer:
        "Turn on batch mode and each line of your input is encoded independently, returned on its own line in the same order. It's ideal for building UTM values, escaping a column of terms, or preparing bulk redirect targets.",
    },
    {
      question: "How do I decode a percent-encoded string back?",
      answer:
        "Use our URL Decoder, linked right inside this tool. It reverses both component and full-URL percent-encoding back to readable Unicode text, treating the bytes as UTF-8 so your emoji and accents return intact.",
    },
    {
      question: "Why does my output look double-encoded?",
      answer:
        "If the input was already percent-encoded, encoding it again escapes the % signs themselves (turning %20 into %2520). Decode the string once with the URL Decoder first, then encode the original clean text.",
    },
    {
      question: "Does URL encoding secure or hide my data?",
      answer:
        "No. Percent-encoding is a transport format, not encryption. It only makes characters safe to place in a URL. Anyone can decode it instantly, so never treat an encoded value as a way to hide a secret.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Launched the URL Encoder with live encoding, component vs full-URL modes, Unicode-safe UTF-8 output, copy/download/share and keyboard shortcuts.",
    },
    {
      date: "2026-06-24",
      change:
        "Added batch (per-line) mode to encode newline-separated lists in one pass while preserving order and line count.",
    },
    {
      date: "2026-06-30",
      change:
        "Added an inline reserved-character legend and a one-click link to the sibling URL Decoder for round-trip checks.",
    },
  ],

  relatedTools: ["url-decoder", "base64-encoder", "jwt-decoder", "json-formatter"],
};

export default urlEncoder;
