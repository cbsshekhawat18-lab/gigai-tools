import type { Tool } from "@/types";

/**
 * Keyword Density Checker, the flagship of the GigAI "Content" SEO group.
 *
 * Paste any article, page copy or full HTML and get a ranked breakdown of the
 * words and phrases you actually use most, as single words, two-word and
 * three-word phrases, each with a raw count and a density percentage, with
 * common stopwords filtered out and over-optimisation (keyword stuffing) flagged
 * live. Runs 100% in the browser; nothing is crawled, uploaded or stored.
 *
 * All copy below is written uniquely for keyword-density / on-page term-frequency
 * intent so the page ranks independently from the meta, schema and sitemap
 * siblings in the toolkit.
 */
const keywordDensityChecker: Tool = {
  slug: "keyword-density-checker",
  title: "Keyword Density Checker",
  description:
    "Paste text or HTML and see your top keywords and 2- & 3-word phrases with counts and density %, stopwords filtered and keyword-stuffing flagged. 100% in your browser, nothing uploaded.",
  category: "seo-tools",
  group: "Content",
  icon: "BarChart3",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "Keyword Density Checker, Analyze On-Page Term Frequency",
  tagline:
    "Paste your content or page HTML and instantly see which words and phrases you use most, each with a count and density percentage. Stopwords are filtered, single words and 2- & 3-word phrases are ranked side by side, and over-optimisation is flagged the moment a term climbs too high: all computed live in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Keyword Density Checker analyzes the real term frequency of a piece of content the way an on-page SEO would. Paste raw text or a full HTML page (the tool strips tags, scripts and styles so only the visible copy is counted) and it tokenises the words, filters a built-in English stopword list, and ranks the results as unigrams (single words), bigrams (two-word phrases) and trigrams (three-word phrases). Each term shows its raw occurrence count and its density: the share of all counted terms it represents, as a percentage. A live meter watches your primary terms and warns when any single keyword crosses roughly 3–4%, the zone where natural writing tips into keyword stuffing that modern search engines discount or penalise. You can toggle stopword filtering on or off, switch between 1-, 2- and 3-word phrases, set a minimum word length, and choose how many terms to show. Copy the full table as CSV or Markdown, or export it, to drop into a content brief or share with a writer. Unlike server-based density tools that fetch and analyze a live URL (and often gate the good features), everything here runs locally from the text you paste, so you can check unpublished drafts, gated pages and client content without any of it leaving your machine.",

  ctaText: "Check keyword density",

  keywords: [
    "keyword density checker",
    "keyword density analyzer",
    "keyword density tool",
    "check keyword density",
    "on-page keyword frequency",
    "keyword frequency counter",
    "word frequency counter",
    "keyword stuffing checker",
    "n-gram analysis seo",
    "bigram trigram phrase analysis",
    "keyword density percentage",
    "seo content analysis tool",
  ],

  seo: {
    title: "Keyword Density Checker, Free On-Page SEO Analyzer | GigAI Tools",
    description:
      "Free keyword density checker: paste text or HTML to see your top keywords and 2- & 3-word phrases with counts and density %, stopwords filtered and keyword stuffing flagged. 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "BarChart3",
      title: "Ranked density table",
      description:
        "Every keyword and phrase, sorted by frequency, with its raw count and density percentage of all counted terms, so you see at a glance what your page is really about.",
    },
    {
      icon: "Layers",
      title: "1-, 2- & 3-word phrases",
      description:
        "Switch between unigrams, bigrams and trigrams to catch not just single keywords but the exact phrases you repeat, the way search engines read topical relevance.",
    },
    {
      icon: "Filter",
      title: "Smart stopword filtering",
      description:
        "A built-in English stopword list hides noise like 'the', 'and' and 'of' so the terms that surface are the ones that carry meaning. Toggle it off for a raw count anytime.",
    },
    {
      icon: "TriangleAlert",
      title: "Keyword-stuffing warnings",
      description:
        "A live meter flags any term that climbs past the natural 3–4% range, the point where repetition reads as over-optimisation to Google rather than helpful content.",
    },
    {
      icon: "CodeXml",
      title: "Text or HTML: tags stripped",
      description:
        "Paste plain copy or a full page's HTML. Scripts, styles and markup are removed automatically so only the visible, readable text is counted.",
    },
    {
      icon: "Download",
      title: "Copy or export CSV / Markdown",
      description:
        "Copy the whole table as CSV or a Markdown table, or download it, to drop straight into a content brief, spreadsheet or writer handoff.",
    },
  ],

  benefits: [
    {
      title: "Write for topical relevance, not repetition",
      description:
        "See whether your target keyword actually appears (and how its supporting phrases cluster) so you cover a topic thoroughly instead of stuffing one exact phrase.",
    },
    {
      title: "Catch over-optimisation before you publish",
      description:
        "The stuffing meter tells you when a term is repeated too often, letting you loosen the copy before an editor, a competitor audit or Google flags it.",
    },
    {
      title: "Benchmark against competing pages",
      description:
        "Paste a top-ranking competitor's copy to see which phrases they lean on, then close the gaps in your own draft with confidence.",
    },
    {
      title: "Keep unpublished drafts private",
      description:
        "Because analysis is 100% local, you can check gated pages, staging drafts and client content without any of it touching a third-party server.",
    },
  ],

  howTo: [
    {
      title: "Paste your content or HTML",
      description:
        "Drop in the article text you're writing, or paste a whole page's HTML, the tool strips tags automatically and counts only the visible copy.",
    },
    {
      title: "Choose phrase length and filters",
      description:
        "Switch between 1-, 2- and 3-word phrases, toggle stopword filtering, and set a minimum word length to tune what counts as a keyword.",
    },
    {
      title: "Read the density table",
      description:
        "Scan the ranked terms and their density percentages. Anything highlighted in red has crossed the over-optimisation threshold and may read as stuffing.",
    },
    {
      title: "Adjust your copy",
      description:
        "If a keyword is missing, weave it in naturally. If one is over-used, vary it with synonyms and related phrases so the density lands in a natural range.",
    },
    {
      title: "Copy or export the results",
      description:
        "Copy the table as CSV or Markdown, or export it, to add to a content brief, share with a writer, or track against future revisions.",
    },
  ],

  formats: {
    input: ["Text", "HTML"],
    output: ["CSV", "Markdown"],
  },

  useCases: [
    {
      audience: "Content writer",
      title: "Check a draft before publishing",
      description:
        "Paste the article you just wrote to confirm your primary keyword appears enough, but not so often it reads as stuffing, and that supporting phrases show up too.",
    },
    {
      audience: "SEO specialist",
      title: "Audit a page against its target term",
      description:
        "Paste an existing page's copy to see whether it actually reinforces the keyword it's meant to rank for, and whether any term is dangerously over-optimized.",
    },
    {
      audience: "Editor / strategist",
      title: "Reverse-engineer a competitor",
      description:
        "Paste the text of a top-ranking page to reveal the exact phrases it emphasises, then brief your writer to cover the same ground more thoroughly.",
    },
    {
      audience: "Agency / freelancer",
      title: "Build data-backed content briefs",
      description:
        "Export the density table as CSV or Markdown to hand writers a concrete list of terms and target frequencies for each client page.",
    },
  ],

  troubleshooting: [
    {
      problem: "My keyword shows a very low density even though I used it a lot.",
      solution:
        "Density is a share of all counted terms, so a longer article naturally dilutes any single word. Check the raw count too, and remember that a keyword appearing a handful of times in thorough copy is healthier than a high percentage on a thin page.",
    },
    {
      problem: "The results are full of words like 'the' and 'and'.",
      solution:
        "Make sure stopword filtering is on (it is by default). If you turned it off for a raw count, switch it back on to surface only the meaningful terms.",
    },
    {
      problem: "My HTML page shows navigation or script text in the results.",
      solution:
        "The tool strips <script> and <style> and removes tags, but visible boilerplate like menus, footers and cookie banners is still real page text and will be counted. Paste just the article body for a content-focused analysis.",
    },
    {
      problem: "A term is flagged red for over-optimisation but reads fine to me.",
      solution:
        "The 3–4% threshold is a guideline, not a hard rule. Short pages can legitimately spike. Use it as a prompt to re-read that sentence, vary the phrasing, and make sure the repetition genuinely serves the reader.",
    },
  ],

  tips: [
    "There's no magic target percentage. Aim for a keyword that reads naturally and appears in the title, an early paragraph and a heading, rather than chasing a specific density.",
    "Watch the 2- and 3-word phrase views: repeating a full exact-match phrase is a bigger stuffing signal than repeating a single common word.",
    "Cover supporting and synonym terms, not just your primary keyword: modern search engines reward topical depth over exact-match repetition.",
    "When analyzing an HTML page, paste only the main content region so menus and footers don't skew the counts.",
    "Compare your draft's table against a top-ranking competitor's to spot phrases you've under- or over-used.",
  ],

  security:
    "Your content is tokenised and analyzed entirely in your browser. There is no crawler and no upload. Nothing you paste is stored, logged or transmitted, so you can safely check unpublished drafts, gated pages and client copy. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is a good keyword density for SEO?",
      answer:
        "There is no official target, but natural, well-written content usually lands a primary keyword somewhere around 1–2% of the text, with related phrases spread throughout. Anything above roughly 3–4% starts to read as repetition, which is why this tool flags it. Focus on covering the topic well and using the keyword where it genuinely fits (title, first paragraph, a heading) rather than hitting a number.",
    },
    {
      question: "How is keyword density calculated?",
      answer:
        "Density is the number of times a term appears divided by the total number of counted terms, expressed as a percentage. This tool tokenises your text into words (and, for phrases, into 2- and 3-word n-grams), optionally removes stopwords, then ranks each term by count and shows its share of the total.",
    },
    {
      question: "Does keyword stuffing still hurt rankings?",
      answer:
        "Yes. Search engines have long discounted or penalised pages that repeat a keyword unnaturally to manipulate rankings. The goal today is helpful, natural content. This checker's over-optimisation warning helps you catch a phrase that's climbed into stuffing territory so you can loosen it before publishing.",
    },
    {
      question: "Can I check the keyword density of a URL?",
      answer:
        "This tool doesn't fetch live URLs. Doing so needs a server we deliberately don't run, for privacy and to avoid CORS issues. Instead, open the page, copy its text or view-source HTML, and paste it here. The upside is that unpublished, staging and login-gated pages work too, and nothing you paste ever leaves your browser.",
    },
    {
      question: "What are 2-word and 3-word phrases (n-grams)?",
      answer:
        "An n-gram is a run of n consecutive words. Bigrams (2 words) and trigrams (3 words) surface the exact phrases you repeat, like 'keyword density checker', which often matter more for relevance and for spotting stuffing than any single word. Use the phrase-length toggle to switch between them.",
    },
    {
      question: "What are stopwords and why filter them?",
      answer:
        "Stopwords are extremely common words like 'the', 'and', 'of' and 'is' that appear in almost every sentence and carry little topical meaning. Filtering them out means the terms that surface are the ones that describe what your page is actually about. You can toggle the filter off to see a raw, unfiltered count.",
    },
    {
      question: "Does it work on HTML, or only plain text?",
      answer:
        "Both. Paste plain copy or a full HTML page: the tool removes <script> and <style> blocks and strips the remaining tags so only the visible text is counted. For the cleanest content analysis, paste just the main article region rather than the whole document.",
    },
    {
      question: "Is my content uploaded anywhere?",
      answer:
        "No. All tokenising, counting and density calculation happens locally in your browser using standard web APIs. Nothing is sent to a server, stored or logged, which is why you can safely analyze confidential drafts and client work.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, ranked keyword density table for 1-, 2- and 3-word phrases with counts and percentages, stopword filtering, and HTML tag stripping.",
    },
    {
      date: "2026-06-26",
      change:
        "Added the over-optimisation (keyword-stuffing) meter, minimum-word-length control, and CSV / Markdown copy and export.",
    },
    {
      date: "2026-06-30",
      change:
        "Added live word / unique-term / reading-time stats, keyboard shortcuts and ready-made sample content.",
    },
  ],

  relatedTools: [
    "meta-tag-generator",
    "meta-description-generator",
    "google-serp-preview",
    "slug-generator",
    "url-encoder",
  ],
};

export default keywordDensityChecker;
