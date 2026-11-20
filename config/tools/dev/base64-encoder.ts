import type { Tool } from "@/types";

/**
 * Base64 Encoder: a client-side, Unicode-safe Base64 encoder for text *and*
 * files. All copy is unique to encoding (the decode direction lives in the
 * sibling `base64-decoder` tool). Encoding runs entirely in the browser via
 * TextEncoder + btoa (never a naive btoa over a UTF-16 string), so emoji,
 * accents and CJK survive intact, files are turned into a proper data URL /
 * raw Base64, and nothing is ever uploaded.
 */
const base64Encoder: Tool = {
  slug: "base64-encoder",
  title: "Base64 Encoder",
  description:
    "Encode text or any file to Base64 instantly: Unicode-safe, with a URL-safe toggle and one-click data URLs. Runs entirely in your browser, nothing uploaded.",
  category: "developer-tools",
  icon: "Binary",
  accent: "indigo",
  status: "live",
  createdAt: "2026-06-20",

  h1: "Base64 Encoder: Text & Files, Unicode-Safe",
  tagline:
    "Type or paste text, or drop in a file, and get correct Base64 the instant you do. Emoji and accents encode without mojibake, files become ready-to-embed data URLs, and there's a URL-safe switch for tokens and query strings. 100% in your browser. No uploads, no limits.",
  longDescription:
    "The GigAI Base64 Encoder converts text and files to Base64 the moment you enter them. No 'Encode' button to hunt for. Under the hood it encodes through the browser's TextEncoder before btoa, so it's genuinely UTF-8 correct: emoji, curly quotes, accented characters and CJK all round-trip cleanly, unlike naive tools that call btoa on a raw string and choke on anything outside Latin-1. Drop in an image, PDF, font or any binary and you instantly get both its raw Base64 and a copy-paste `data:` URL you can paste straight into CSS, an <img> src or a JSON payload. Flip the URL-safe toggle to swap +/ for -_ and drop padding for JWT segments, query parameters and URL slugs. Everything happens locally in a Web Worker-free, dependency-light path, your text and files never leave the tab.",

  ctaText: "Encode to Base64",

  keywords: [
    "base64 encode",
    "base64 encoder",
    "text to base64",
    "file to base64",
    "image to base64",
    "base64 data url generator",
    "url-safe base64",
    "utf-8 base64 encode",
    "encode base64 online",
    "base64 converter",
  ],

  seo: {
    title: "Base64 Encoder, Encode Text & Files to Base64 Free | GigAI Tools",
    description:
      "Free Base64 encoder for text and files. Unicode-safe UTF-8 encoding, URL-safe mode, and instant data URLs for images and fonts: all in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Zap",
      title: "Instant, live encoding",
      description:
        "Base64 appears as you type or the moment a file lands: there's no button to press and no page reload. Edit the input and the output updates in the same keystroke.",
    },
    {
      icon: "Languages",
      title: "Genuinely Unicode-safe",
      description:
        "Text is encoded through UTF-8 first, so emoji, accents, smart quotes and CJK characters produce correct Base64. Tools that call btoa directly break on all of these. This one doesn't.",
    },
    {
      icon: "FileUp",
      title: "Files become data URLs",
      description:
        "Drag in an image, PDF or font and get both the raw Base64 and a ready-to-embed data: URL. Paste it straight into CSS background-image, an <img> src or a JSON body.",
    },
    {
      icon: "Link2",
      title: "URL-safe toggle",
      description:
        "One switch swaps + and / for - and _ and strips = padding, giving you Base64URL that's safe to drop into JWT segments, query strings and URL paths.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, in-browser",
      description:
        "Your text and files are encoded locally with the Web platform's own APIs. Nothing is uploaded, stored or logged, close the tab and it's gone.",
    },
    {
      icon: "Keyboard",
      title: "Keyboard-first workflow",
      description:
        "Paste, copy, share, undo and redo are all one shortcut away, with an on-screen cheat sheet. Fewer clicks than any encoder you've used before.",
    },
  ],

  benefits: [
    {
      title: "Correct output, every character",
      description:
        "Because encoding goes through UTF-8, the Base64 you copy will decode back to exactly what you put in. No '?' boxes, no garbled emoji, no silent data loss.",
    },
    {
      title: "One tool for text and binaries",
      description:
        "Switch between a text pane and a file drop zone in the same workspace. Encode a config snippet now and an SVG icon the next minute without leaving the page.",
    },
    {
      title: "Private by design",
      description:
        "Everything runs in your browser tab using native APIs. Sensitive tokens, keys and documents never touch a server, so there's nothing for anyone to intercept.",
    },
    {
      title: "Free, unlimited, no account",
      description:
        "Encode as much as you like. No sign-up, no daily quota, no watermark. The only real limit is your device's memory when encoding very large files.",
    },
  ],

  howTo: [
    {
      title: "Choose text or file",
      description:
        "Use the Text tab to type or paste content, or switch to the File tab and drop a file in. You can also just drag a file anywhere onto the workspace.",
    },
    {
      title: "Enter your input",
      description:
        "Type, paste (Ctrl/Cmd+V), import a text file, or drop a binary file. The Base64 output updates instantly beside it.",
    },
    {
      title: "Pick standard or URL-safe",
      description:
        "Leave the toggle off for classic Base64, or turn on URL-safe to get -_ characters and no padding for tokens and query strings.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the Base64 (or the data: URL for files) with one click, download it as a .txt file, or generate a shareable link that reopens your input.",
    },
  ],

  formats: {
    input: ["Text", "Any file (image, PDF, font, binary)"],
    output: ["Base64", "Base64URL", "Data URL"],
  },

  useCases: [
    {
      audience: "Developer",
      title: "Embed assets without a request",
      description:
        "Turn a small icon or web font into a data: URL and inline it in CSS or HTML, cutting a network round-trip and avoiding CORS headaches for tiny assets.",
    },
    {
      audience: "API engineer",
      title: "Build request payloads by hand",
      description:
        "Base64-encode a binary attachment or credential to drop into a JSON body or an Authorization header while testing an endpoint in curl or Postman.",
    },
    {
      audience: "Security & QA",
      title: "Craft and inspect tokens",
      description:
        "Use URL-safe mode to assemble JWT-style segments or encode test fixtures, then hand the value straight to the Base64 decoder to confirm it round-trips.",
    },
    {
      audience: "Content & email",
      title: "Inline images in templates",
      description:
        "Convert a logo to a data URL so it renders in email clients and static templates that can't reliably load external image files.",
    },
  ],

  troubleshooting: [
    {
      problem: "My emoji or accented text comes out as gibberish elsewhere.",
      solution:
        "The output here is UTF-8 correct. Make sure whatever decodes it also treats the bytes as UTF-8. A decoder that assumes Latin-1 will mangle multi-byte characters. Our Base64 decoder handles this automatically.",
    },
    {
      problem: "My URL-safe Base64 is rejected as invalid Base64.",
      solution:
        "URL-safe output intentionally uses - and _ and omits = padding. Decode it in URL-safe mode (or add padding back), feeding it to a strict standard-Base64 parser will fail by design.",
    },
    {
      problem: "A large file is slow to encode or freezes briefly.",
      solution:
        "Very large files are held entirely in memory while they encode. Try a smaller file, close other heavy tabs, or use a desktop browser with more available RAM.",
    },
    {
      problem: "I want the raw bytes, not a data: URL, for my file.",
      solution:
        "The file result gives you both. The data: URL is shown for embedding, and the raw Base64 (everything after the comma) is available to copy separately for API payloads.",
    },
  ],

  tips: [
    "Drop a file anywhere on the workspace. You don't have to be on the File tab first. The tool switches for you.",
    "Turn on URL-safe before building JWT segments or query-string values so you never have to hand-edit + / = characters.",
    "For embedding an image in CSS or HTML, copy the full data: URL. For an API body, copy just the Base64 after the comma.",
    "Use the Share button to send a teammate a link that reopens with your exact input already loaded.",
    "Base64 grows data by roughly a third, expect the output to be about 33% larger than the original bytes.",
  ],

  security:
    "Every byte is encoded locally in your browser using the platform's TextEncoder and FileReader APIs. Your text and files are never uploaded, stored, logged or shared: nothing leaves your device, and closing the tab discards it all.",

  faq: [
    {
      question: "Is my text or file uploaded to encode it?",
      answer:
        "No. Encoding happens entirely in your browser with native Web APIs. Your input never leaves your device, so there's nothing for us to receive, store or see, it's fully private.",
    },
    {
      question: "What makes this 'Unicode-safe' when other encoders aren't?",
      answer:
        "We encode text to UTF-8 bytes with TextEncoder before running Base64. Simpler tools call btoa directly on a JavaScript string, which is UTF-16 and throws or corrupts on any character outside Latin-1, emoji, accents and CJK all break. Here they encode correctly.",
    },
    {
      question: "How do I encode an image or PDF to Base64?",
      answer:
        "Switch to the File tab and drop your file in (or drag it anywhere onto the tool). You'll get its raw Base64 plus a ready-to-use data: URL you can paste into CSS, an <img> tag or a JSON payload.",
    },
    {
      question: "What is URL-safe Base64 and when should I use it?",
      answer:
        "URL-safe Base64 (Base64URL) replaces + and / with - and _ and drops = padding, so the result is safe inside URLs, query strings and JWT segments. Turn on the URL-safe toggle whenever the value will live in a URL or token.",
    },
    {
      question: "What's a data URL and why would I want one?",
      answer:
        "A data URL embeds a file's bytes inline, like data:image/png;base64,.... You can paste it directly where a URL is expected (CSS background-image, an image src or a template) to render an asset without a separate network request.",
    },
    {
      question: "How do I decode Base64 back to the original?",
      answer:
        "Use our Base64 Decoder, linked right inside this tool. It reverses standard and URL-safe Base64 back to Unicode text, and it treats the bytes as UTF-8 so your emoji and accents return exactly as they were.",
    },
    {
      question: "Is there a size limit on what I can encode?",
      answer:
        "There's no artificial cap. The practical limit is your device's memory, because the whole input and its Base64 output are held in the browser while encoding. Very large files may be slow on low-memory devices.",
    },
    {
      question: "Does Base64 encoding compress or secure my data?",
      answer:
        "No. Base64 is an encoding, not encryption or compression. It makes binary data safe to transport as text and actually grows it by about a third. Anyone can decode it, so never treat Base64 as a way to hide secrets.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Launched the Base64 Encoder with live text encoding, drag-and-drop file support, URL-safe mode, data URLs, copy/download/share and keyboard shortcuts.",
    },
    {
      date: "2026-06-25",
      change:
        "Added instant data: URL generation for files and a one-click switch to copy just the raw Base64 without the MIME prefix.",
    },
    {
      date: "2026-06-29",
      change:
        "Improved large-file handling with chunked byte processing and clearer error messages for unreadable files.",
    },
  ],

  relatedTools: [
    "base64-decoder",
    "url-encoder",
    "jwt-decoder",
    "hash-generator",
  ],
};

export default base64Encoder;
