import type { Tool } from "@/types";

/**
 * Word Counter, the Content group's live writing dashboard. As you type or
 * paste, it counts words, characters (with and without spaces), sentences,
 * paragraphs, lines and UTF-8 bytes, estimates reading and speaking time at an
 * adjustable pace, and surfaces the most-used keywords so you can spot padding
 * and repetition. Everything below is unique to counting, length-limits and
 * readability so the page earns its ranking on its own terms. Not by echoing
 * the meta, keyword-density or content-analysis tools it links to.
 */
const wordCounter: Tool = {
  slug: "word-counter",
  title: "Word Counter",
  description:
    "Count words, characters, sentences, paragraphs and reading time live as you type or paste, with a keyword breakdown and platform length limits. 100% in your browser.",
  category: "seo-tools",
  group: "Content",
  icon: "Hash",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Word Counter: Live Word, Character & Reading-Time Counter",
  tagline:
    "Paste or type and watch words, characters, sentences, paragraphs and reading time update on every keystroke, plus a keyword frequency breakdown and the platform limits that actually matter, all computed privately in your browser.",
  longDescription:
    "The GigAI Word Counter is a real-time writing dashboard, not a one-shot box. The moment you type or paste, it reports words, characters with and without spaces, sentences, paragraphs, lines and the exact UTF-8 byte size, then converts your word count into an estimated reading time and a slower speaking time using a pace you can dial in for your audience. A live keyword breakdown ranks the terms you lean on most (with real percentages) so you can catch accidental repetition, thin filler or a keyword you have stuffed one too many times. Built-in length gauges show at a glance whether your text fits a tweet, an SEO title, a meta description, a Google Business post or an SMS, turning abstract counts into a clear pass or fail for the channel you are writing for. Because it all runs on the browser's own text engine, there is no upload, no account and no waiting: unpublished drafts, client copy, essays under a strict limit and confidential notes never leave your machine. Copy a formatted summary, download it, load a sample to explore, or clear and start again. The counts are always live, always private and always instant.",

  ctaText: "Count my words",

  keywords: [
    "word counter",
    "count words online",
    "words to characters",
    "sentence counter",
    "paragraph counter",
    "word count tool",
    "essay word count",
  ],

  seo: {
    title: "Word Counter, Live Word, Character & Reading-Time Tool | GigAI Tools",
    description:
      "Free live word counter: count words, characters, sentences, paragraphs, reading time and keyword frequency as you type. Check tweet, title and meta limits. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Hash",
      title: "Every count, live on each keystroke",
      description:
        "Words, characters with and without spaces, sentences, paragraphs, lines and UTF-8 bytes all recalculate instantly as you type or paste. No button, no lag, no round-trip.",
    },
    {
      icon: "Clock",
      title: "Reading & speaking time",
      description:
        "Your word count becomes an estimated silent reading time and a slower spoken time, with an adjustable words-per-minute pace so the estimate fits your audience and delivery.",
    },
    {
      icon: "ListOrdered",
      title: "Keyword frequency breakdown",
      description:
        "See the terms you use most, with counts and real percentages, so you can catch unintended repetition, filler words or an over-stuffed keyword before anyone else does.",
    },
    {
      icon: "Ruler",
      title: "Platform length gauges",
      description:
        "Live meters show whether your text clears the limits for an X post, SEO title, meta description, Google Business post or SMS: a clear pass or fail instead of raw numbers.",
    },
    {
      icon: "Type",
      title: "Counts letters, digits and emoji correctly",
      description:
        "Unicode-aware counting treats accented letters, non-Latin scripts and emoji as single characters, and measures real UTF-8 byte size, the length that database and API limits use.",
    },
    {
      icon: "Copy",
      title: "Copy, download, sample & reset",
      description:
        "Copy a clean stats summary, download your text, load a sample to explore the tool, or clear everything with a keystroke. The whole workspace is keyboard-driven.",
    },
  ],

  benefits: [
    {
      title: "Hit any limit with confidence",
      description:
        "Whether it is a 280-character post, a 60-character title, an essay's word ceiling or a strict abstract, the live gauges tell you exactly where you stand so you never over- or under-shoot.",
    },
    {
      title: "Tighten writing as you go",
      description:
        "Watching sentence and paragraph counts and the keyword breakdown update in real time nudges you toward shorter sentences, less repetition and cleaner, more readable prose.",
    },
    {
      title: "Plan content and scripts by time",
      description:
        "Reading and speaking estimates turn a word count into minutes, so you can size a blog post, a talk or a video script to the slot you actually have.",
    },
    {
      title: "Private by design",
      description:
        "Every count happens locally in your browser, so drafts, client copy and confidential notes never touch a server. Close the tab and nothing is left behind.",
    },
  ],

  howTo: [
    {
      title: "Type or paste your text",
      description:
        "Drop in a draft, an essay, a caption or a whole article. Counting starts on the first character. There is nothing to submit.",
    },
    {
      title: "Read the live stats",
      description:
        "Watch words, characters, sentences, paragraphs, bytes and reading time update on every keystroke, and scan the keyword breakdown for repetition.",
    },
    {
      title: "Check the limits that matter",
      description:
        "Glance at the platform gauges to confirm your text fits a post, title, description or SMS, and adjust the reading pace to match your audience.",
    },
    {
      title: "Copy, download or reset",
      description:
        "Copy a formatted stats summary or your text, download it as a file, or clear the workspace and start fresh, all from the keyboard.",
    },
  ],

  formats: {
    input: ["Plain text", "Pasted content"],
    output: ["Statistics", "Keyword list", "Text"],
  },

  useCases: [
    {
      audience: "Student / academic",
      title: "Stay inside an essay or abstract limit",
      description:
        "Track your word count live against a strict assignment or journal limit, and trim sentences and paragraphs until the piece fits without cutting the argument.",
    },
    {
      audience: "SEO writer / marketer",
      title: "Fit titles, descriptions and posts",
      description:
        "Confirm a title lands near 60 characters, a meta description near 155, and a social post inside its cap, with the keyword breakdown flagging accidental over-repetition.",
    },
    {
      audience: "Editor / content lead",
      title: "Size a script or article by time",
      description:
        "Use the reading and speaking estimates to fit a blog post, newsletter or video script to the minutes you have, then tighten sentence and paragraph counts for flow.",
    },
    {
      audience: "Developer / product writer",
      title: "Respect byte and field limits",
      description:
        "Check real UTF-8 byte size and character counts before saving copy to a database column, an API field or a UI string with a hard length cap.",
    },
  ],

  troubleshooting: [
    {
      problem: "My word count differs from Microsoft Word or Google Docs.",
      solution:
        "Different tools split words slightly differently, hyphenated terms, numbers, URLs and apostrophes are edge cases with no single standard. This counter treats a run of letters, digits and internal apostrophes as one word, which matches most SEO and web contexts. Expect a small difference of a few words on long documents.",
    },
    {
      problem: "The character count looks higher than I expected.",
      solution:
        "The default character count includes spaces, punctuation and line breaks, the same total a tweet or SMS limit uses. Switch to the without-spaces figure if you only want visible letters and symbols, and note that emoji and some non-Latin characters take multiple bytes even though they count as one character.",
    },
    {
      problem: "Reading time seems too fast or too slow.",
      solution:
        "Reading time is words divided by a pace you can change. The default 225 words per minute reflects average adult silent reading. Lower it for dense technical copy or a spoken delivery, and raise it for skimmable content. The speaking estimate already uses a slower pace to reflect talking aloud.",
    },
    {
      problem: "Sentences or paragraphs are counted oddly.",
      solution:
        "Sentences are split on . ! and ? so abbreviations like \"e.g.\" or a decimal can nudge the count, and paragraphs are separated by blank lines rather than single line breaks. Add a blank line between paragraphs for the cleanest paragraph count.",
    },
  ],

  tips: [
    "Use the without-spaces character count when a platform's limit ignores whitespace, and the with-spaces count for tweets, SMS and most field limits.",
    "Lower the words-per-minute pace for technical or legal copy, dense text reads slower than a casual blog post.",
    "Watch the keyword breakdown: a term that suddenly tops the list often means you are repeating yourself and can vary the wording.",
    "Separate paragraphs with a blank line so the paragraph count and reading flow both stay accurate.",
    "Check the byte size, not just the character count, before saving copy into a database column or API field with a strict limit.",
  ],

  security:
    "Every word, character, sentence and keyword is counted locally in your browser using its native text engine: nothing you type or paste is ever uploaded, stored or logged. Drafts, essays, client copy and confidential notes stay entirely on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "How does the tool count a word?",
      answer:
        "A word is a run of letters or digits, including internal apostrophes, so \"don't\" and \"web3\" each count as one word. Punctuation and standalone symbols are not words. This matches how most SEO and web tools count, which can differ by a few words from a word processor on long documents because there is no universal rule for hyphens, URLs and numbers.",
    },
    {
      question: "What's the difference between characters with and without spaces?",
      answer:
        "Characters with spaces counts every visible character plus spaces, tabs and line breaks, the figure tweet, SMS and most form limits use. Characters without spaces counts only the non-whitespace characters, which is handy when a limit ignores spacing. The tool shows both live so you can use whichever the platform requires.",
    },
    {
      question: "Is my text uploaded or stored anywhere?",
      answer:
        "No. All counting happens entirely in your browser with its own text engine. Nothing you type or paste is sent to a server, saved or logged, so it is safe for unpublished drafts, confidential documents, client work and anything under an NDA. Closing or refreshing the tab clears the text for good.",
    },
    {
      question: "How is reading time calculated?",
      answer:
        "Reading time is your word count divided by a reading pace, shown as minutes and seconds. The default is 225 words per minute, a common average for adult silent reading, and you can adjust it to suit dense or skimmable content. The separate speaking estimate uses a slower pace to reflect reading aloud, which is useful for scripts and presentations.",
    },
    {
      question: "Can I use it to stay within a tweet, title or meta description limit?",
      answer:
        "Yes. The live length gauges show whether your text fits an X post (280 characters), an SEO title (~60), a meta description (~160), a Google Business post or an SMS segment (160). Each gauge turns from safe to over-limit as you cross the threshold, so you can trim in place instead of guessing.",
    },
    {
      question: "Does it count characters correctly for emoji and other languages?",
      answer:
        "Yes. Counting is Unicode-aware, so an emoji or an accented or non-Latin character counts as a single character rather than the multiple code units it may occupy internally. The tool also reports the real UTF-8 byte size separately, because emoji and many non-Latin letters take several bytes, the length that database and API limits actually measure.",
    },
    {
      question: "What does the keyword breakdown show?",
      answer:
        "It lists the words you use most often, each with a count and a percentage of the total, after filtering out common stop words like \"the\" and \"and\". It is a quick way to spot unintended repetition, filler, or a keyword you have used so much it reads as stuffing: helpful for both readability and SEO.",
    },
    {
      question: "Do I need to click a button to get the count?",
      answer:
        "No. The counter is fully live: every statistic updates on each keystroke and the instant you paste, so there is nothing to submit and no waiting. You can copy a formatted summary of the stats, download your text, load a sample or reset the workspace whenever you like.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: live word, character, sentence, paragraph, line and byte counts with reading-time estimation and a copy/download/reset workspace.",
    },
    {
      date: "2026-06-24",
      change:
        "Added the keyword frequency breakdown, an adjustable reading pace with a separate speaking-time estimate, and Unicode-aware character counting.",
    },
    {
      date: "2026-06-30",
      change:
        "Added live platform length gauges (X, SEO title, meta description, Google Business, SMS), a loadable sample and keyboard shortcuts.",
    },
  ],

  relatedTools: [
    "keyword-density-checker",
    "meta-tag-generator",
    "reading-time-calculator",
    "text-case-converter",
    "url-encoder",
  ],
};

export default wordCounter;
