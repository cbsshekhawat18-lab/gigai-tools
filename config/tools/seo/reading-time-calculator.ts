import type { Tool } from "@/types";

/**
 * Reading Time Calculator. Paste any draft, blog post or script and get an
 * accurate reading-time estimate at an adjustable words-per-minute pace, plus a
 * full breakdown of words, sentences, paragraphs and characters. Every stat is
 * computed live in the browser from the same content engine that powers the
 * word-counter and keyword-density tools, so nothing you paste is ever
 * uploaded. All copy below is unique to reading-time estimation and content
 * pacing so this page ranks on its own terms.
 */
const readingTimeCalculator: Tool = {
  slug: "reading-time-calculator",
  title: "Reading Time Calculator",
  description:
    "Paste any text to estimate reading time at an adjustable words-per-minute pace, with live word, sentence, paragraph and character stats, 100% in your browser.",
  category: "seo-tools",
  group: "Content",
  icon: "Timer",
  accent: "cyan",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",

  h1: "Reading Time Calculator: Estimate How Long Your Content Takes to Read",
  tagline:
    "Paste an article, blog post or script and instantly see how long it takes to read at any words-per-minute pace: with a live word, sentence, paragraph and character breakdown you can copy or download.",
  longDescription:
    "The GigAI Reading Time Calculator turns a block of pasted text into a precise, adjustable reading-time estimate and a full content breakdown in real time. Reading speed isn't one number: a skim-friendly listicle, a dense technical spec and an audiobook script are all read at very different paces, so the WPM (words-per-minute) control lets you model slow, average and fast readers, and snap to research-backed presets for silent reading, reading aloud, speed reading and podcast narration. Alongside the headline “X min read” label you get the raw word count, sentence and paragraph counts, characters with and without spaces, and a live-updating estimate you can copy as a badge string or download for your CMS. Because the estimate is what most blogs, Medium and news sites show at the top of an article, getting it right helps set reader expectations, improves the on-page experience that search engines increasingly reward, and lets writers hit a target length for a newsletter slot or a spoken segment. Everything runs locally in your browser using its native text engine, draft posts, unpublished scripts and client copy never leave your machine, are never logged, and vanish the moment you close the tab.",

  ctaText: "Calculate reading time",

  keywords: [
    "reading time calculator",
    "reading time estimator",
    "how long to read",
    "words per minute calculator",
    "estimate reading time",
    "article reading time",
    "blog reading time",
    "reading speed calculator",
    "time to read text",
    "word count reading time",
    "speech time calculator",
    "reading time badge",
  ],

  seo: {
    title: "Reading Time Calculator: Estimate Time to Read Any Text | GigAI Tools",
    description:
      "Free reading time calculator: paste text to estimate how long it takes to read at any words-per-minute pace, with live word, sentence and character stats. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Timer",
      title: "Instant, accurate reading time",
      description:
        "Paste your text and get a clean “X min read” estimate the moment you stop typing, calculated from a Unicode-aware word count, the same label blogs and news sites show above an article.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Adjustable words-per-minute",
      description:
        "Drag the WPM slider or type an exact value to model slow, average and fast readers. The estimate and every derived stat recalculate live so you can see the impact immediately.",
    },
    {
      icon: "Zap",
      title: "Research-backed pace presets",
      description:
        "One click snaps the pace to silent reading (238 wpm), reading aloud (150 wpm), speed reading (400 wpm) or podcast narration (130 wpm). No need to remember the numbers.",
    },
    {
      icon: "BarChart3",
      title: "Full content breakdown",
      description:
        "See words, sentences, paragraphs, and characters with and without spaces in a live stat grid, so the reading time comes with the context to trust and act on it.",
    },
    {
      icon: "Copy",
      title: "Copy the badge, download the report",
      description:
        "Copy a ready-to-use “5 min read” badge string for your CMS, or download the full stat report as a text file, both keyboard-driven with copy, download and reset shortcuts.",
    },
    {
      icon: "ShieldCheck",
      title: "Private, offline-capable, no limits",
      description:
        "Everything is computed in your browser with its native text engine. There's no upload, no server, no length cap you'll realistically hit, and no account. Paste freely.",
    },
  ],

  benefits: [
    {
      title: "Set reader expectations up front",
      description:
        "A visible “X min read” badge tells visitors what they're committing to, which lifts completion rates and reduces bounces, and this tool gives you the exact number to publish.",
    },
    {
      title: "Hit a target length with confidence",
      description:
        "Writing to a newsletter slot, a two-minute spoken segment or a 7-minute long-read? Adjust the WPM to your medium and trim or expand until the estimate lands where you want it.",
    },
    {
      title: "Trust the number, whatever the language",
      description:
        "The word count is Unicode-aware and handles contractions, hyphens and non-Latin scripts, so your estimate is consistent instead of drifting between tools that split text differently.",
    },
    {
      title: "Private by design",
      description:
        "Unpublished drafts, client scripts and confidential copy are analyzed locally and never uploaded, logged or seen by anyone: close the tab and every trace is gone.",
    },
  ],

  howTo: [
    {
      title: "Paste your text",
      description:
        "Drop in an article, blog draft, script or any block of copy. The word, sentence, paragraph and character counts appear instantly as you type or paste.",
    },
    {
      title: "Set the reading pace",
      description:
        "Use the WPM slider or a preset to match your audience and medium, silent reading, reading aloud, speed reading or narration. The estimate updates live.",
    },
    {
      title: "Read the estimate and stats",
      description:
        "See the headline “X min read” label alongside the full breakdown so you understand exactly what drives the number and can adjust your copy accordingly.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the badge string straight into your CMS, download the full report as a text file, or reset and start again, all available from the toolbar and keyboard.",
    },
  ],

  formats: {
    input: ["Plain text", "Article", "Script"],
    output: ["Reading time", "Text stats"],
  },

  useCases: [
    {
      audience: "Content writer / blogger",
      title: "Add a reading-time badge to a post",
      description:
        "Calculate the “X min read” label for a finished article at your site's standard pace, then paste the badge string into your CMS so readers know the time commitment.",
    },
    {
      audience: "Editor / content lead",
      title: "Trim a piece to a target length",
      description:
        "Set the reading time you want for a slot or format, then edit and re-paste until the estimate lands there: using the word and sentence counts to guide the cuts.",
    },
    {
      audience: "Podcaster / video scriptwriter",
      title: "Time a spoken script",
      description:
        "Switch to the reading-aloud or narration preset to estimate how long a script will run when spoken, so a segment fits its slot before you hit record.",
    },
    {
      audience: "Student / speaker",
      title: "Fit a talk or essay to a limit",
      description:
        "Check that a speech fits a strict minute limit at a natural speaking pace, or confirm an essay meets a length requirement, without guessing from word count alone.",
    },
  ],

  troubleshooting: [
    {
      problem: "My estimate looks higher or lower than another site's badge.",
      solution:
        "Different sites assume different reading speeds. Medium uses roughly 265 wpm, many blogs use 200–250, and reading aloud is far slower at ~130–150. Match the WPM here to the source's assumption and the numbers will line up.",
    },
    {
      problem: "The word count differs from my word processor.",
      solution:
        "Word processors and tools disagree on what counts as a word, how they treat hyphenates, contractions, numbers and pasted markup. This tool uses a Unicode-aware boundary that counts contractions as one word. Small differences on the same text are normal and don't meaningfully change the reading time.",
    },
    {
      problem: "I pasted HTML and the count seems off.",
      solution:
        "This calculator measures the raw text you paste, including any HTML tags and attributes as words. For an accurate estimate paste the visible copy only, or strip the markup first. The goal is to count what a human actually reads.",
    },
  ],

  tips: [
    "Pick one WPM for your whole site (250 is a common all-purpose default) so every article's badge is consistent and comparable.",
    "For anything meant to be spoken (a podcast, a talk, a voiceover) use ~130–150 wpm. People read aloud far slower than they read silently.",
    "A visible reading-time badge tends to help completion. Add it near the title so readers see it before they start.",
    "Front-load value: if a long read is unavoidable, make the first minute count so the estimate doesn't scare readers off.",
    "Use the sentence and paragraph counts as a readability sanity check, very long sentences or huge paragraphs slow real readers below the average pace.",
  ],

  security:
    "Every calculation (word count, reading time and the full stat breakdown) runs locally in your browser using its native text engine. Nothing you paste is uploaded, stored or logged, so drafts, unpublished scripts and client copy stay entirely on your device and disappear when you close the tab.",

  faq: [
    {
      question: "How is reading time calculated?",
      answer:
        "Reading time is the word count divided by a reading speed in words per minute (WPM). This tool counts the words in your pasted text with a Unicode-aware boundary, divides by the WPM you choose, and formats the result as a friendly “X min read” (dropping to seconds for very short text). Change the WPM and the estimate recalculates instantly.",
    },
    {
      question: "What is a good words-per-minute value to use?",
      answer:
        "For silent reading, the average adult reads roughly 200–260 wpm, so 238–250 is a solid default and close to what many blogs and Medium assume. Reading aloud or narration is much slower at about 130–150 wpm, while trained speed readers hit 400+ wpm. Pick the pace that matches your audience and whether the text is read silently or spoken.",
    },
    {
      question: "How accurate is the estimate?",
      answer:
        "It's an estimate, not a guarantee: real reading speed varies with the reader, the topic's difficulty and how carefully they read. The word count itself is precise and consistent, so if you use a realistic WPM for your audience the result is a reliable guide for setting expectations and hitting a target length.",
    },
    {
      question: "Can I use this to estimate how long a speech or script takes?",
      answer:
        "Yes. Switch to the reading-aloud (~150 wpm) or narration (~130 wpm) preset, or type your own speaking pace, and the estimate becomes an approximate spoken-duration figure. It's a great way to check that a talk, voiceover or podcast segment fits its time slot before recording.",
    },
    {
      question: "Does pasted HTML or markdown affect the count?",
      answer:
        "The tool counts the raw text you paste, so HTML tags, markdown symbols and attributes are counted as words too. For an accurate reading estimate, paste the visible copy a human actually reads rather than the source markup, or strip the tags first.",
    },
    {
      question: "Why does my count differ from Word or Google Docs?",
      answer:
        "Word processors and calculators define a “word” slightly differently, especially around hyphenated terms, contractions, numbers and punctuation. This tool treats a contraction like “don't” as one word. Minor differences on identical text are expected and have a negligible effect on the reading time.",
    },
    {
      question: "Is there a length limit on the text I can paste?",
      answer:
        "There's no practical limit for normal content: whole articles, long reports and book chapters all analyze instantly in the browser. Because everything runs locally there's no upload size cap to worry about. Extremely large pastes are only bounded by your device's memory.",
    },
    {
      question: "Is my text sent to a server?",
      answer:
        "No. All counting and reading-time calculation happen entirely in your browser with its native text engine. Nothing you paste is uploaded, stored or logged, so it's safe to analyze unpublished drafts, internal scripts or confidential copy, and closing the tab erases everything.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: live reading-time estimate with an adjustable WPM control, research-backed pace presets, and a full word/sentence/paragraph/character breakdown.",
    },
    {
      date: "2026-06-24",
      change:
        "Added a copyable “X min read” badge string, a downloadable stat report, sample text, and copy/download/reset keyboard shortcuts.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the WPM presets to match current reading-speed research and improved the seconds-vs-minutes formatting for very short passages.",
    },
  ],

  relatedTools: [
    "word-counter",
    "keyword-density-checker",
    "meta-tag-generator",
    "json-formatter",
  ],
};

export default readingTimeCalculator;
