import type { Tool } from "@/types";

/**
 * Hash Generator, a multi-algorithm checksum + HMAC workbench that runs entirely
 * in the browser. Copy is written to stand on its own for search: the emphasis is
 * on computing MD5/SHA-1/SHA-2 side-by-side, HMAC signing with a key, and
 * verifying a file or string against an expected checksum, none of it uploaded.
 * No sentence here is reused from the other dev tools' SEO copy.
 */
const hashGenerator: Tool = {
  slug: "hash-generator",
  title: "Hash Generator",
  description:
    "Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 checksums of any text or file at once, generate HMAC signatures with your own key, and verify a download against its expected hash, all in your browser, nothing uploaded.",
  category: "developer-tools",
  icon: "Fingerprint",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-18",

  h1: "Hash Generator, MD5, SHA-256 & SHA-512 Checksums Online",
  tagline:
    "Paste text or drop a file to get every common hash at once (MD5, SHA-1, SHA-256, SHA-384 and SHA-512) plus keyed HMAC signing and one-click checksum verification, computed locally with Web Crypto.",
  longDescription:
    "A cryptographic hash turns any input (a password, a config string, a multi-gigabyte ISO) into a short, fixed-length fingerprint. Change a single byte and the fingerprint changes completely, which is why hashes are the standard way to verify that a download arrived intact, that two files are identical, or that a message hasn't been tampered with. This Hash Generator computes MD5, SHA-1, SHA-256, SHA-384 and SHA-512 for the same input simultaneously, so you never have to re-run the tool once per algorithm, and each digest gets its own copy button. Type or paste text and the hashes update live. Drag in a file and it is streamed through the hash in chunks so even large files stay within memory instead of loading all at once. Switch to HMAC mode to sign a message with a secret key using HMAC-SHA256 and friends: the exact primitive behind webhook signatures and API request signing. And when you just want to confirm a checksum, paste the expected value into the verify field and the tool tells you instantly, with a color-coded badge, whether it matches any of the computed digests. Everything runs client-side through the browser's native Web Crypto API (MD5 via a small in-browser library, since Web Crypto omits it). No input, key or file is ever transmitted, stored or logged.",

  ctaText: "Generate hashes",

  keywords: [
    "hash generator",
    "md5 hash generator",
    "sha256 generator",
    "sha512 hash",
    "online checksum tool",
    "hmac generator",
    "sha1 hash online",
    "file hash calculator",
    "verify checksum online",
    "compute md5 sha256",
    "message digest generator",
    "hmac sha256 signature",
  ],

  seo: {
    title: "Hash Generator: MD5, SHA-256, SHA-512 & HMAC Online | GigAI Tools",
    description:
      "Free online hash generator. Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 of text or files at once, create HMAC signatures with your key, and verify checksums: 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Layers",
      title: "Every algorithm at once",
      description:
        "One input, five digests. MD5, SHA-1, SHA-256, SHA-384 and SHA-512 are computed together and shown in a stacked list, each with its own copy button. No re-running the tool per algorithm.",
    },
    {
      icon: "FileUp",
      title: "Hash files, even large ones",
      description:
        "Drag a file onto the pane to fingerprint it. Files are read in 8 MiB chunks so multi-gigabyte inputs stay within memory, and the result matches the checksums published on release pages.",
    },
    {
      icon: "KeySquare",
      title: "HMAC keyed signing",
      description:
        "Flip on HMAC mode, enter a secret key, and the tool signs your message with HMAC-SHA256 (or SHA-1/384/512) via Web Crypto: the same construction used for webhook and API request signatures.",
    },
    {
      icon: "ShieldCheck",
      title: "One-click checksum verify",
      description:
        "Paste an expected hash into the verify field and a live badge tells you whether it matches any computed digest (case-insensitive) so confirming a download's integrity takes one paste.",
    },
    {
      icon: "CaseUpper",
      title: "Uppercase toggle",
      description:
        "Switch every digest between lowercase and uppercase hex in one click, to match whatever format a vendor, checksum file or verification script expects.",
    },
    {
      icon: "Lock",
      title: "Fully client-side",
      description:
        "All hashing and HMAC signing happen inside your browser tab with the native Web Crypto API. Your text, keys and files are never uploaded, cached or logged anywhere.",
    },
  ],

  benefits: [
    {
      title: "Verify downloads with confidence",
      description:
        "Drop an installer or ISO in, compare its SHA-256 against the value on the project's release page, and know instantly whether the file is authentic and uncorrupted before you run it.",
    },
    {
      title: "Sign requests without a script",
      description:
        "Generate an HMAC-SHA256 signature for a webhook payload or API request on the spot, so you can test integrations and debug signature mismatches without writing throwaway code.",
    },
    {
      title: "Safe for secrets and private files",
      description:
        "Because nothing leaves your browser, you can hash sensitive files, tokens or HMAC keys here without worrying that a server logged your input or kept a copy.",
    },
    {
      title: "No installs, no limits",
      description:
        "It's one web page that works on any device. No OpenSSL command to remember, no per-day cap, no account. Hash as many strings and files as you want.",
    },
  ],

  howTo: [
    {
      title: "Enter your input",
      description:
        "Type or paste text into the input pane, or drag a file onto it. Digests recompute live for text. For a file, the hash appears as soon as it finishes reading.",
    },
    {
      title: "Read all the hashes",
      description:
        "MD5, SHA-1, SHA-256, SHA-384 and SHA-512 appear stacked together. Copy any one with its button, or flip the uppercase toggle to match your target format.",
    },
    {
      title: "Sign with HMAC (optional)",
      description:
        "Turn on HMAC mode and enter a secret key to produce keyed HMAC signatures instead of plain digests. MD5 is skipped, since Web Crypto has no MD5-HMAC.",
    },
    {
      title: "Verify against an expected hash",
      description:
        "Paste the checksum you were given into the verify field. A match/no-match badge lights up the moment it agrees with any computed digest, ignoring case and whitespace.",
    },
  ],

  formats: {
    input: ["Text", "UTF-8 string", "Any file", "Drag & drop", "Paste"],
    output: ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512", "HMAC", "Hex"],
  },

  useCases: [
    {
      audience: "DevOps & release engineers",
      title: "Check release artifact integrity",
      description:
        "Confirm that a binary, container layer or build artifact matches the SHA-256 in your release notes before you promote it, catching a corrupted or swapped file early.",
    },
    {
      audience: "Backend developers",
      title: "Build and debug HMAC signatures",
      description:
        "Reproduce the exact HMAC-SHA256 signature your API or webhook expects, and diff it against what your code produces to find why a 'signature invalid' error keeps firing.",
    },
    {
      audience: "Security & IT teams",
      title: "Fingerprint files for incident response",
      description:
        "Compute a file's MD5 and SHA-256 to look it up in threat-intelligence databases or to prove two collected samples are byte-for-byte identical.",
    },
    {
      audience: "Anyone downloading software",
      title: "Confirm a download is genuine",
      description:
        "Paste the checksum from a project's website and drop the file you downloaded. A green badge means it's intact and unmodified, a red one means download it again.",
    },
  ],

  faq: [
    {
      question: "What's the difference between MD5, SHA-1 and SHA-256?",
      answer:
        "They're all hash functions that turn input into a fixed-length fingerprint, but they differ in length and security. MD5 (128-bit) and SHA-1 (160-bit) are fast and still fine for non-security checks like detecting accidental corruption, but both are broken for security use because attackers can craft collisions. SHA-256, SHA-384 and SHA-512 (part of the SHA-2 family) are the modern standard for anything security-sensitive. This tool shows all of them so you can pick whichever a given system asks for.",
    },
    {
      question: "Is it safe to hash sensitive text or files here?",
      answer:
        "Yes. Every hash and HMAC is computed inside your own browser using the Web Crypto API (with a small in-browser library for MD5, which Web Crypto doesn't provide). Your input, your HMAC key and any file you drop are never uploaded, cached on a server or logged. That local-only design is exactly why it's safe to hash private files and secrets here.",
    },
    {
      question: "How do I verify a file's checksum?",
      answer:
        "Drag the file onto the input to compute its hashes, then paste the expected checksum from the source (a release page, a.sha256 file, an email) into the verify field. The tool compares your value against all five computed digests, ignoring case and surrounding whitespace, and shows a match or no-match badge. If it doesn't match, the file was altered or corrupted in transit, re-download it.",
    },
    {
      question: "What is an HMAC and when do I need one?",
      answer:
        "An HMAC (hash-based message authentication code) combines a hash function with a secret key, so only someone who knows the key can produce or verify the signature. It's the standard way services sign webhook payloads and API requests so the receiver can confirm the message is authentic and unmodified. Turn on HMAC mode, enter the shared key, and this tool produces the HMAC-SHA256/1/384/512 signature for your message.",
    },
    {
      question: "Can it hash very large files?",
      answer:
        "Yes. Files are read in 8 MiB chunks rather than all at once, so multi-gigabyte inputs are handled without exhausting memory. MD5 truly streams chunk by chunk. The SHA algorithms use the browser's native digest, which reads the file buffer once: a Web Crypto platform limitation, not a bug. Hashing a large file takes a moment while the browser reads it.",
    },
    {
      question: "Why isn't MD5 available in HMAC mode?",
      answer:
        "HMAC signing here uses the browser's Web Crypto API, which implements HMAC over SHA-1, SHA-256, SHA-384 and SHA-512 but deliberately omits MD5. Since HMAC-MD5 is both insecure and unsupported natively, HMAC mode offers only the SHA variants. Plain MD5 hashing (without a key) is still available in the default mode.",
    },
    {
      question: "Are uppercase and lowercase hashes different?",
      answer:
        "No: hex digests are the same value whether written in upper- or lowercase. Only the presentation differs. Some tools and checksum files publish uppercase hex, so the uppercase toggle lets you match their format exactly. The verify field compares case-insensitively, so a checksum in either case will still match correctly.",
    },
    {
      question: "Do the same text and file produce the same hash everywhere?",
      answer:
        "For a file, yes: dropping it here gives the identical digest that OpenSSL, sha256sum or any other correct tool produces. For text, the hash depends on the exact bytes: this tool encodes your text as UTF-8, so it matches command-line tools that also use UTF-8, but a different encoding or a stray trailing newline will change the result.",
    },
  ],

  tips: [
    "Use SHA-256 or stronger for anything security-related. Keep MD5 and SHA-1 only for quick, non-security integrity checks where speed matters and collisions don't.",
    "When a checksum won't match, hash the file rather than pasted text. Copying text can silently add or strip a trailing newline and change the digest.",
    "For HMAC signatures, make sure the key is the raw secret, byte for byte. A Base64-wrapped or newline-padded key will produce a different, 'invalid' signature.",
    "Toggle uppercase to match vendor checksum files exactly, but remember the verify field already ignores case, so you rarely need to.",
    "To compare two files, hash the first, copy its SHA-256, then hash the second and paste that value into verify for an instant identical/different answer.",
  ],

  troubleshooting: [
    {
      problem: "My computed hash doesn't match the one on the download page.",
      solution:
        "Confirm you're comparing the same algorithm (a SHA-256 value won't match a SHA-512 line), that you hashed the file and not a copied snippet of text, and that the download completed fully. A mismatch on a fully downloaded file means it was corrupted or tampered with: re-download from the source.",
    },
    {
      problem: "HMAC signature comes out different from my server's.",
      solution:
        "Check that the key is byte-identical (no trailing newline, no Base64 wrapping), that both sides sign the exact same message bytes, and that you're using the same SHA variant. Even one differing byte in key or message changes the whole signature.",
    },
    {
      problem: "A large file seems to hang while hashing.",
      solution:
        "Big files take time to read from disk. The SHA algorithms read the buffer once before producing a digest. Give it a few seconds and avoid switching tabs mid-read. If the file is enormous, MD5 (which streams) will begin returning fastest.",
    },
    {
      problem: "The hash of my text doesn't match a command-line tool.",
      solution:
        "The most common cause is a trailing newline: 'echo foo' adds one, 'printf foo' doesn't. This tool hashes exactly the characters in the input box as UTF-8. Remove or match the newline and the digests will agree.",
    },
  ],

  security:
    "Every digest, HMAC and comparison is computed entirely inside your browser tab using the native Web Crypto API, with a small in-browser library for MD5, which Web Crypto omits. Your text, your HMAC secret key and any file you drop in are never uploaded, cached, or logged on our servers. That local-only design is what makes it safe to fingerprint private files and hash sensitive strings here. Note that MD5 and SHA-1 are unsafe against deliberate collisions. Use SHA-256 or stronger for security-sensitive work.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: simultaneous MD5, SHA-1, SHA-256, SHA-384 and SHA-512 for text and dropped files, each with its own copy button and an uppercase toggle.",
    },
    {
      date: "2026-06-24",
      change:
        "Added HMAC mode with a secret-key field (HMAC-SHA1/256/384/512) and chunked file reading so large files hash without exhausting memory.",
    },
    {
      date: "2026-06-30",
      change:
        "Added the checksum verify field with a live match/no-match badge, paste and share support, and keyboard shortcuts with an in-app reference.",
    },
  ],

  relatedTools: [
    "base64-encoder",
    "jwt-decoder",
    "uuid-generator",
    "json-formatter",
  ],
};

export default hashGenerator;
