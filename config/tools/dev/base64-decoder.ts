import type { Tool } from "@/types";

/**
 * Base64 Decoder: a client-side, Unicode-safe Base64 *decoder* for text and
 * binary payloads. All copy here is unique to the decode direction (the encode
 * direction lives in the sibling `base64-encoder` tool). Decoding runs entirely
 * in the browser: bytes are recovered with atob, then re-interpreted as UTF-8
 * via TextDecoder so emoji, accents and CJK come back intact. Standard and
 * URL-safe (Base64URL) input are auto-detected, and when the decoded bytes turn
 * out to be a binary file (PNG, PDF, ZIP, …) the tool sniffs the type and
 * offers a proper download instead of dumping unreadable characters.
 */
const base64Decoder: Tool = {
  slug: "base64-decoder",
  title: "Base64 Decoder",
  description:
    "Decode Base64 back to text or a file instantly: Unicode-safe, auto-detects URL-safe input, sniffs binary data and offers a download. Runs fully in your browser, nothing uploaded.",
  category: "developer-tools",
  icon: "FileOutput",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-22",

  h1: "Base64 Decoder, Decode to Text or File, Unicode-Safe",
  tagline:
    "Paste Base64 and get the original back the instant you do. Standard and URL-safe input are detected for you, UTF-8 text decodes without mojibake, and when the payload is really a PNG, PDF or ZIP the tool recognises it and hands you a download. 100% in your browser. No uploads, no limits.",
  longDescription:
    "The GigAI Base64 Decoder turns Base64 back into whatever it originally was: the moment you paste it, with no 'Decode' button to find. It recovers the raw bytes with the browser's atob and then decodes them as UTF-8 through TextDecoder, so text that was encoded correctly comes back exactly as it went in: emoji, curly quotes, accented characters and CJK all survive instead of turning into � boxes. It auto-detects the alphabet, transparently accepting both classic Base64 (with + / and = padding) and URL-safe Base64URL (with - _ and no padding), including JWT segments and data-URL payloads you paste in whole. When the decoded bytes clearly aren't text (a PNG, JPEG, GIF, PDF, ZIP, GZIP or WebP) the decoder sniffs the file's magic-number signature, tells you the detected type, and offers a one-click download with the right extension instead of flooding the pane with control characters. Invalid input never fails silently: you get a precise, plain-English error pointing at what's wrong. Everything happens locally in a dependency-light path, your Base64 and its decoded contents never leave the tab.",

  ctaText: "Decode Base64",

  keywords: [
    "base64 decode",
    "base64 decoder",
    "base64 to text",
    "base64 to file",
    "base64 to image",
    "decode base64 online",
    "url-safe base64 decode",
    "base64url decoder",
    "utf-8 base64 decode",
    "data url decoder",
    "base64 to pdf",
    "decode jwt payload base64",
  ],

  seo: {
    title: "Base64 Decoder, Decode Base64 to Text or File Free | GigAI Tools",
    description:
      "Free Base64 decoder. Unicode-safe UTF-8 decoding, auto-detects URL-safe Base64URL, sniffs binary files (PNG, PDF, ZIP) and offers a download, all in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Zap",
      title: "Instant, live decoding",
      description:
        "The original text appears as you paste or type: there's no button to press and no reload. Edit the Base64 and the output updates in the same keystroke.",
    },
    {
      icon: "WandSparkles",
      title: "Auto-detects URL-safe input",
      description:
        "Standard Base64 and URL-safe Base64URL are recognised automatically. Paste a JWT segment, a data-URL payload or a padded blob, the decoder normalises - _ and missing padding for you.",
    },
    {
      icon: "Languages",
      title: "Genuinely Unicode-safe",
      description:
        "Bytes are decoded as UTF-8 with TextDecoder, so emoji, accents, smart quotes and CJK return exactly as they were. Tools that assume Latin-1 mangle every multi-byte character. This one doesn't.",
    },
    {
      icon: "FileDown",
      title: "Detects binary, offers a download",
      description:
        "When the bytes are really a PNG, JPEG, GIF, PDF, ZIP, GZIP or WebP, the decoder sniffs the signature, shows the detected type and gives you a one-click download with the correct extension.",
    },
    {
      icon: "ShieldAlert",
      title: "Precise, honest errors",
      description:
        "Malformed input never fails silently. You get a clear, specific message (bad characters, wrong padding, truncated data) so you know exactly what to fix.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, in-browser",
      description:
        "Your Base64 and its decoded contents are processed locally with the Web platform's own APIs. Nothing is uploaded, stored or logged, close the tab and it's gone.",
    },
  ],

  benefits: [
    {
      title: "Reads what other decoders reject",
      description:
        "URL-safe segments, unpadded strings, whole data: URLs and stray whitespace all decode here without hand-editing. You spend zero time massaging input into a 'valid' shape.",
    },
    {
      title: "Text and binary in one place",
      description:
        "The same paste box handles a config snippet, a JWT payload and an encoded PNG. Text renders inline. Binaries become a labelled, downloadable file. No guessing which tool to use.",
    },
    {
      title: "Round-trips without data loss",
      description:
        "Because decoding goes through UTF-8, whatever you decode matches what was originally encoded. No dropped emoji, no garbled accents, no silent corruption.",
    },
    {
      title: "Private, free and unlimited",
      description:
        "Everything runs in your browser tab with native APIs. Decode secrets, tokens and documents with no upload, no sign-up, no quota and no watermark.",
    },
  ],

  howTo: [
    {
      title: "Paste your Base64",
      description:
        "Paste (Ctrl/Cmd+V) or type the Base64 into the input pane. You can also drop a.txt file containing Base64, or paste a full data: URL, the decoder handles it.",
    },
    {
      title: "Let it auto-detect the format",
      description:
        "Standard and URL-safe Base64URL are recognised automatically, so you don't have to know or set the alphabet. Missing padding is added for you.",
    },
    {
      title: "Read the text or grab the file",
      description:
        "If the payload is text it appears instantly in the output pane. If it's binary, the tool shows the detected type and a download button with the right extension.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the decoded text with one click, download binary output as a file, or generate a shareable link that reopens with your exact input already loaded.",
    },
  ],

  formats: {
    input: ["Base64", "Base64URL", "Data URL", "TXT"],
    output: ["Text (UTF-8)", "Binary file (PNG, JPEG, GIF, PDF, ZIP, …)"],
  },

  useCases: [
    {
      audience: "Developer",
      title: "Inspect an encoded payload fast",
      description:
        "Drop in the Base64 from a config value, environment variable or API response to see the plain text it hides: without writing a throwaway script or opening a REPL.",
    },
    {
      audience: "API & backend engineer",
      title: "Recover an attachment or credential",
      description:
        "Decode a Base64 field from a JSON body or header. If it's a file, download it directly. If it's a token or string, read it as UTF-8 text on the spot.",
    },
    {
      audience: "Security & QA",
      title: "Read JWT and token internals",
      description:
        "Paste a URL-safe JWT segment to reveal its JSON claims, or decode encoded test fixtures to confirm they round-trip cleanly with the Base64 encoder.",
    },
    {
      audience: "Designer & content",
      title: "Turn a data URL back into an image",
      description:
        "Paste a data:image/png;base64,… string and the decoder recognises the PNG, letting you download the original image file for editing or reuse.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says my input isn't valid Base64.",
      solution:
        "Base64 only uses A–Z, a–z, 0–9 and + / (or - _ for URL-safe), plus optional = padding. Stray quotes, commas or a copied 'base64,' prefix without the data: scheme can break it: remove anything that isn't part of the encoded value and try again.",
    },
    {
      problem: "My decoded text has strange � characters.",
      solution:
        "Those replacement characters mean the bytes aren't valid UTF-8: often the data was encoded from Latin-1 or is actually binary. If it's a file, the decoder will usually detect it and offer a download instead. Otherwise the source encoding wasn't UTF-8.",
    },
    {
      problem: "I pasted a data URL and got binary, not text.",
      solution:
        "That's expected, a data:image/... or data:application/pdf URL contains binary bytes. The decoder strips the data-URL prefix, detects the file type and gives you a download rather than showing unreadable characters.",
    },
    {
      problem: "The output looks truncated or wrong length.",
      solution:
        "Base64 must be a multiple of four characters (padding aside). If part of the string was cut off during copy, the tail bytes can be lost, re-copy the complete value, including any = padding, and decode again.",
    },
  ],

  tips: [
    "You don't need to know whether input is standard or URL-safe: paste it and the decoder figures out the alphabet and padding for you.",
    "Pasting a whole data: URL works. The decoder removes the data:<mime>;base64, prefix before decoding and uses the MIME hint for the download.",
    "For binary results, use the Download button: copying control characters into another app rarely does what you want.",
    "To decode a JWT's claims, paste just the middle segment (between the dots). It's URL-safe Base64 and decodes to the payload JSON.",
    "Use the Share button to send a teammate a link that reopens the decoder with your exact Base64 already loaded.",
  ],

  security:
    "Every byte is decoded locally in your browser using the platform's atob and TextDecoder APIs. Your Base64 and the text or file it decodes to are never uploaded, stored, logged or shared, nothing leaves your device, and closing the tab discards it all.",

  faq: [
    {
      question: "Is my Base64 uploaded to decode it?",
      answer:
        "No. Decoding happens entirely in your browser with native Web APIs. Your input never leaves your device, so there's nothing for us to receive, store or see: it's fully private, which matters when you're decoding tokens or credentials.",
    },
    {
      question: "Do I have to tell it whether the Base64 is URL-safe?",
      answer:
        "No. The decoder auto-detects the alphabet. It transparently accepts standard Base64 (+ / with = padding) and URL-safe Base64URL (- _ with no padding), normalising the characters and restoring missing padding before decoding.",
    },
    {
      question: "How do I decode Base64 into an image or PDF?",
      answer:
        "Just paste the Base64 (or a full data: URL). When the decoded bytes are a known binary type (PNG, JPEG, GIF, WebP, PDF, ZIP or GZIP) the decoder sniffs the file signature, shows the detected type and gives you a download button with the correct extension.",
    },
    {
      question: "Why does my decoded text have � replacement characters?",
      answer:
        "Those appear when the decoded bytes aren't valid UTF-8 text. Usually because the original data was binary or was encoded from a non-UTF-8 charset like Latin-1. For real files the tool offers a download instead. For text, it means the source wasn't UTF-8.",
    },
    {
      question: "Can I decode a JWT here?",
      answer:
        "You can decode any of its Base64URL segments to read the raw JSON. Paste the middle segment to see the payload claims. For a full header/payload/signature breakdown with expiry checks, use our dedicated JWT Decoder, linked from this tool.",
    },
    {
      question: "What's the difference between this and the Base64 Encoder?",
      answer:
        "This tool goes Base64 → original (text or file). The Base64 Encoder goes the other way, turning text or files into Base64. They're a matched pair, and each links to the other so you can round-trip a value in seconds.",
    },
    {
      question: "Is there a size limit on what I can decode?",
      answer:
        "There's no artificial cap. The practical limit is your device's memory, because the whole input and its decoded output are held in the browser. Very large payloads may be slow on low-memory devices.",
    },
    {
      question: "Does decoding Base64 reveal a hidden or secret value?",
      answer:
        "Base64 is an encoding, not encryption. Anyone can decode it. Decoding simply reverses the transport encoding. It doesn't 'crack' anything. Never treat Base64 as a way to protect secrets, and treat any credential you decode as live.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Launched the Base64 Decoder with live decoding, automatic standard/URL-safe detection, UTF-8 text output, copy/share and keyboard shortcuts.",
    },
    {
      date: "2026-06-26",
      change:
        "Added binary detection via magic-number sniffing (PNG, JPEG, GIF, WebP, PDF, ZIP, GZIP) with one-click download and correct file extensions.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved data: URL handling, the MIME prefix is stripped automatically and used as a hint, plus clearer, more specific error messages for malformed input.",
    },
  ],

  relatedTools: [
    "base64-encoder",
    "jwt-decoder",
    "json-formatter",
    "yaml-formatter",
  ],
};

export default base64Decoder;
