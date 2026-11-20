import type { Tool } from "@/types";

/**
 * Character Counter, a live, platform-aware text counter for the Content
 * group. It counts characters (with and without spaces), words, sentences,
 * lines, paragraphs and UTF-8 bytes as you type, then measures your text
 * against the real limits that matter in SEO and social: the meta title and
 * description sweet spots, an X/Twitter post, and a single-segment SMS. Every
 * line of copy below is specific to character counting and limit-fitting so the
 * page ranks on its own intent rather than overlapping the word counter, meta
 * generator or SERP preview tools.
 */
const characterCounter: Tool = {
  slug: "character-counter",
  title: "Character Counter",
  description:
    "Count characters with and without spaces, plus words, bytes and lines, and check your text live against Twitter/X, meta title, meta description and SMS limits, 100% in your browser.",
  category: "seo-tools",
  group: "Content",
  icon: "Baseline",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-18",

  h1: "Character Counter, Live Count with Twitter, Meta & SMS Limits",
  tagline:
    "Paste or type and instantly see characters with and without spaces, words, sentences, lines, paragraphs and UTF-8 bytes, each measured live against the real limits for X posts, SEO titles and descriptions, and SMS.",
  longDescription:
    "The GigAI Character Counter is the counter you keep open in a second tab while you write. As you type or paste, it counts characters both with and without spaces, plus words, sentences, lines, paragraphs and true UTF-8 byte length, and, crucially, checks that text against the limits people actually hit: the 50–60 character SEO title window, the 150–160 character meta description window, a 280-character X/Twitter post, and the 160-character single-segment SMS boundary. Each limit shows a live remaining count and flips to over-budget the moment you cross it, so you trim to fit before you paste into a CMS, an ad platform or a tweet composer. Because it counts by Unicode code points and encodes to real bytes, emoji, accented letters and non-Latin scripts are counted the way the destination platform will see them. No more surprise truncation because a database column counts bytes while your editor counted glyphs. You can load a sample, clear it, copy the report, download a stats summary, undo and redo, and set your own custom limit for whatever field you're filling. Everything runs locally in your browser with its native text encoder, so drafts, private notes and unpublished copy never leave your device.",

  ctaText: "Count characters",

  keywords: [
    "character counter",
    "count characters",
    "characters with spaces",
    "characters without spaces",
    "letter counter",
    "twitter character counter",
    "meta title length checker",
    "sms character counter",
    "byte counter",
    "text length checker",
    "online character count",
  ],

  seo: {
    title: "Character Counter, Live Count, Twitter/Meta/SMS Limits | GigAI Tools",
    description:
      "Free character counter: count characters with and without spaces, words, bytes and lines, and check your text live against Twitter/X, SEO title, meta description and SMS limits. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Baseline",
      title: "Characters with and without spaces",
      description:
        "The two counts writers actually need, side by side and updating on every keystroke: plus words, sentences, lines and paragraphs so you never open a second tool to check.",
    },
    {
      icon: "Ruler",
      title: "Live platform-limit meters",
      description:
        "Bars for SEO title (50–60), meta description (150–160), X/Twitter (280) and SMS (160) show remaining characters and turn red the instant you go over budget.",
    },
    {
      icon: "Binary",
      title: "True UTF-8 byte count",
      description:
        "Counts real encoded bytes, so an emoji or an accented letter is measured the way a database column or SMS gateway will actually see it. Not as a single glyph.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Custom limit for any field",
      description:
        "Set your own target (an ad headline, a bio, a product title, a form field) and get the same live remaining count and over-limit warning as the built-in presets.",
    },
    {
      icon: "Globe",
      title: "Unicode & emoji aware",
      description:
        "Code-point counting means emoji, combined characters and non-Latin scripts are tallied correctly, so multilingual copy fits its target instead of being silently cut.",
    },
    {
      icon: "Copy",
      title: "Copy, download, undo & samples",
      description:
        "Copy a plain-text stats report, download it as a.txt summary, load a sample to explore, clear in one click, and step back and forth with undo/redo, all keyboard-driven.",
    },
  ],

  benefits: [
    {
      title: "Fit any field on the first paste",
      description:
        "Watching the remaining count for the exact platform you're targeting means your title, description, tweet or SMS is already in-budget before you leave the editor. No back-and-forth truncation.",
    },
    {
      title: "Avoid the byte-vs-character trap",
      description:
        "A field that looks fine by character count can overflow a byte-limited column or split an SMS into two segments. The live byte count catches that before it costs you.",
    },
    {
      title: "Count everything in one place",
      description:
        "Characters, words, sentences, lines, paragraphs and bytes update together, so you stop juggling separate counters for social, SEO and messaging copy.",
    },
    {
      title: "Private by design",
      description:
        "All counting happens locally in your browser with its native encoders, drafts, private notes and confidential copy are never uploaded, stored or logged.",
    },
  ],

  howTo: [
    {
      title: "Type or paste your text",
      description:
        "Drop in a title, description, tweet, message or any block of text. The counts and limit meters update live on every keystroke. No button to press.",
    },
    {
      title: "Read the counts",
      description:
        "See characters with spaces, characters without spaces, words, sentences, lines, paragraphs and UTF-8 bytes at a glance in the stats panel.",
    },
    {
      title: "Check against the limits",
      description:
        "Watch the SEO title, meta description, X/Twitter and SMS meters. Each shows how many characters remain and turns red when you exceed it.",
    },
    {
      title: "Set a custom target (optional)",
      description:
        "Enter your own character limit for whatever field you're filling to get a matching remaining-count meter and over-limit warning.",
    },
    {
      title: "Copy, download or clear",
      description:
        "Copy the stats report, download it as a.txt summary, or clear the text and start again: undo and redo are one shortcut away.",
    },
  ],

  formats: {
    input: ["Plain text"],
    output: ["Character count", "Statistics"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Fit a title tag and meta description",
      description:
        "Draft the title and description against the 50–60 and 150–160 character meters so they display in full in the search snippet instead of being cut off.",
    },
    {
      audience: "Social media manager",
      title: "Trim a post to the 280 limit",
      description:
        "Write and tighten an X/Twitter post with a live remaining count, including correct counting for emoji and links so it posts without surprise truncation.",
    },
    {
      audience: "Developer",
      title: "Check a value against a byte-limited field",
      description:
        "Confirm a username, slug or database value fits its byte budget: the true UTF-8 byte count reveals overflow that a plain character count would hide.",
    },
    {
      audience: "Support / SMS marketer",
      title: "Keep a message to one SMS segment",
      description:
        "Watch the 160-character SMS meter so a notification or campaign stays a single segment instead of splitting into two and costing extra.",
    },
  ],

  troubleshooting: [
    {
      problem: "My emoji counts as more than one character.",
      solution:
        "This tool counts by Unicode code points, so most emoji count as one, but some emoji (flags, skin-tone and multi-part sequences) are built from several code points and legitimately count as more. That reflects how many platforms actually measure them. Check the byte count too, since SMS and some fields count bytes.",
    },
    {
      problem: "The character count differs from another counter.",
      solution:
        "Counters disagree on how they treat trailing whitespace, line breaks and combined characters. This tool counts every code point including spaces and newlines for 'with spaces', and encodes to real UTF-8 for bytes. If a platform reports a different number it's usually counting bytes or stripping whitespace: the byte and without-spaces figures here let you match either.",
    },
    {
      problem: "My SMS shows as over 160 but the text looks short.",
      solution:
        "SMS segments are limited by encoding, not glyphs: any non-GSM character (many emoji and some punctuation) can push the message into UCS-2, which caps a single segment at 70 characters. Use the byte count as a guide and keep messages plain-ASCII to stay in one 160-character segment.",
    },
  ],

  tips: [
    "Aim titles for 50–60 characters and descriptions for 150–160 so they display in full in Google's snippet on desktop.",
    "Watch the byte count, not just the character count, whenever a field is stored in a byte-limited database column.",
    "Keep SMS to plain ASCII to stay within one 160-character segment. A single emoji can halve your limit.",
    "Front-load the important words so meaning survives even if a platform truncates the tail.",
    "Set a custom limit for one-off fields like ad headlines or bios to get the same live over-limit warning.",
  ],

  security:
    "Every character, word and byte is counted locally in your browser using its native text encoder. Nothing you type is ever uploaded, stored or logged. Drafts, private notes and unpublished copy stay on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "How do I count characters with and without spaces?",
      answer:
        "Just type or paste your text and this tool shows both counts at once: 'with spaces' counts every character including spaces, tabs and line breaks, while 'without spaces' counts only the non-whitespace characters. Both update live on every keystroke, so you never press a button or reload.",
    },
    {
      question: "What is the character limit for a Twitter/X post?",
      answer:
        "A standard X/Twitter post allows 280 characters. This counter shows a live remaining count against 280 and turns red the moment you exceed it. Note that links are counted by the platform as a fixed length and some multi-part emoji count as several characters, which the byte view here helps you anticipate.",
    },
    {
      question: "How long should an SEO title and meta description be?",
      answer:
        "As a reliable guide, keep title tags to about 50–60 characters and meta descriptions to about 150–160 so they show in full in Google's snippet. Google truncates by pixel width rather than exact characters, so these are targets: the built-in meters keep you in the safe range, and our SERP preview tool shows the pixel-accurate result.",
    },
    {
      question: "Why does the byte count differ from the character count?",
      answer:
        "Characters are counted as Unicode code points, but bytes reflect UTF-8 encoding: plain ASCII letters are one byte each, accented and non-Latin characters take two to four bytes, and many emoji take four or more. Fields with byte limits (database columns, some APIs, SMS gateways) care about the byte count, which is why it's shown alongside the character count.",
    },
    {
      question: "Does the counter handle emoji and non-English text correctly?",
      answer:
        "Yes. It counts by Unicode code points rather than UTF-16 units, so most emoji and non-Latin scripts are tallied the way destination platforms see them, and it reports true UTF-8 bytes for byte-limited fields. Some emoji are sequences of several code points and will legitimately count as more than one. That mirrors how many platforms measure them.",
    },
    {
      question: "Can I set my own custom character limit?",
      answer:
        "Yes. Enter any target number and you'll get a live remaining-count meter and over-limit warning for it, exactly like the built-in Twitter, SEO title, meta description and SMS presets. It's ideal for one-off fields like ad headlines, social bios, product titles or form inputs with their own maximum.",
    },
    {
      question: "Is my text sent to a server?",
      answer:
        "No. All counting and encoding happen entirely in your browser with its native text encoder. Nothing you type is uploaded, stored or logged. It's safe to count characters in unpublished copy, private notes or confidential drafts. Close the tab and every trace is gone.",
    },
    {
      question: "What's the difference between this and the word counter?",
      answer:
        "This tool leads with character-level limits: characters with and without spaces, bytes, and platform caps like Twitter, SMS and meta fields, which is what you need when a field has a hard character maximum. The word counter focuses on word count, reading time and keyword density for long-form content. Use whichever matches the limit you're writing against.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, live characters with/without spaces, words, sentences, lines, paragraphs and UTF-8 bytes, with Twitter/X, SEO title, meta description and SMS limit meters.",
    },
    {
      date: "2026-06-24",
      change:
        "Added a custom-limit field, a copyable/downloadable stats report, sample loading and undo/redo.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined Unicode code-point counting for emoji and combined characters and added keyboard shortcuts with an in-tool helper.",
    },
  ],

  relatedTools: [
    "word-counter",
    "meta-tag-generator",
    "google-serp-preview",
    "keyword-density-checker",
    "url-encoder",
  ],
};

export default characterCounter;
