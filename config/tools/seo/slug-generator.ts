import type { Tool } from "@/types";

/**
 * Slug Generator, turns arbitrary text (titles, headlines, product names,
 * pasted lists) into clean, URL-safe slugs entirely in the browser. It is a
 * generator-with-preview tool: type or paste text and watch the slug build
 * live, with full control over the separator, case, strictness, max length and
 * ASCII transliteration, plus a batch mode that slugifies one line at a time.
 * Every line of copy below is unique to slug generation and URL hygiene so the
 * page ranks on its own terms rather than overlapping the URL-encoder,
 * meta-tag or sitemap tools.
 */
const slugGenerator: Tool = {
  slug: "slug-generator",
  title: "Slug Generator",
  description:
    "Turn any title or text into a clean, SEO-friendly URL slug: pick the separator, case, length and transliteration, and slugify a whole list at once. Copy or download the results, 100% in your browser.",
  category: "seo-tools",
  group: "URL Tools",
  icon: "Type",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "Slug Generator, Clean, SEO-Friendly URL Slugs from Any Text",
  tagline:
    "Paste a title, headline or a whole list and get tidy, lowercase, hyphenated URL slugs (accents transliterated, punctuation stripped, length capped) with a live preview and batch mode so you can slugify one line or a thousand.",
  longDescription:
    "The GigAI Slug Generator converts messy human text into the short, readable, URL-safe strings that make up the path of a good web address. It handles the details that trip up hand-written slugs: accented and non-ASCII characters are transliterated to their closest ASCII form (café → cafe, naïve → naive, ß → ss), symbols like &, @ and % expand to words (and, at, percent), whitespace and repeated punctuation collapse into a single separator, and stray hyphens are trimmed from both ends. You control every rule. Choose a hyphen or underscore separator, keep or drop letter case, switch strict mode on to allow only [a–z0–9] plus the separator, and cap the length so a slug truncates cleanly on a word boundary instead of mid-word. A live preview shows the exact slug as you type, and batch mode slugifies each line of a pasted list independently, deduplicating identical results with numeric suffixes so no two URLs collide. Everything runs locally with the browser's own Unicode normalizer, so unpublished titles, internal page names and draft URLs never leave your machine. Copy a single slug, download the whole batch as a text file, share a pre-filled link, or undo and redo your way through variations.",

  ctaText: "Generate a slug",

  keywords: [
    "slug generator",
    "url slug generator",
    "seo slug generator",
    "text to slug",
    "permalink generator",
    "url friendly text",
    "title to slug",
    "slugify online",
    "make url slug",
    "clean url generator",
    "bulk slug generator",
    "transliterate url slug",
  ],

  seo: {
    title: "Slug Generator, Clean, SEO-Friendly URL Slugs | GigAI Tools",
    description:
      "Free slug generator: convert any title or text into a clean URL slug with your choice of separator, case, length and transliteration. Batch-slugify a list, copy or download. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Type",
      title: "Live text-to-slug as you type",
      description:
        "Type or paste a title and the slug builds instantly beneath it: trimmed, collapsed and formatted with your chosen rules, so you see the final URL path before you copy it.",
    },
    {
      icon: "Languages",
      title: "Accent & symbol transliteration",
      description:
        "Non-ASCII letters are folded to their closest ASCII form via Unicode normalization, and symbols like &, @, % and currency signs expand to readable words. No broken, percent-encoded URLs.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Full control over every rule",
      description:
        "Pick a hyphen or underscore separator, keep or lowercase the case, toggle strict mode to allow only letters, digits and the separator, and set a max length that cuts on a clean word boundary.",
    },
    {
      icon: "ListOrdered",
      title: "Batch mode for whole lists",
      description:
        "Switch to batch mode and each line of a pasted list becomes its own slug, with identical results automatically de-duplicated using numeric suffixes so two pages never share a URL.",
    },
    {
      icon: "Copy",
      title: "Copy, download, share & undo",
      description:
        "Copy a single slug or the entire batch, download the results as a.txt file, share a link that reopens the tool pre-filled, or step back and forth through undo/redo: all keyboard-driven.",
    },
    {
      icon: "ShieldCheck",
      title: "100% local, nothing uploaded",
      description:
        "Slugs are generated in your browser with its native string tools. Draft titles, internal page names and unpublished URLs never touch a server or get logged anywhere.",
    },
  ],

  benefits: [
    {
      title: "Ship URLs that read well and rank",
      description:
        "Short, hyphenated, keyword-bearing slugs are easier for people to read and share and give search engines a clean signal about the page, far better than ?id=1042 or a title crammed with %20s.",
    },
    {
      title: "Kill an entire class of URL bugs",
      description:
        "Transliteration and strict mode remove the accented characters, spaces and symbols that turn into ugly percent-encoding, break links in emails, or 404 when copied between systems.",
    },
    {
      title: "Slugify a migration in one paste",
      description:
        "Batch mode turns a spreadsheet column of titles into a ready list of slugs in seconds, with automatic de-duplication, so a site migration or bulk import doesn't create colliding URLs.",
    },
    {
      title: "Private by design",
      description:
        "Everything runs locally in your browser, so you can slugify confidential titles, internal tools and unreleased product names without anything being uploaded, stored or logged.",
    },
  ],

  howTo: [
    {
      title: "Enter or paste your text",
      description:
        "Type a single title in Single mode, or switch to Batch mode and paste a list with one title per line. The slug preview updates as you go.",
    },
    {
      title: "Tune the slug rules",
      description:
        "Choose a hyphen or underscore separator, decide whether to lowercase, turn strict mode on or off, and optionally set a maximum length to keep URLs short.",
    },
    {
      title: "Check the live result",
      description:
        "Read the generated slug (or the full batch list) and confirm accents, symbols and length look right. Duplicate batch results are suffixed -2, -3 automatically.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the slug or the whole list to your clipboard, download it as a .txt file, or share a link that reopens the tool exactly as you left it.",
    },
  ],

  formats: {
    input: ["Plain text", "List (one per line)"],
    output: ["URL slug", "Text"],
  },

  useCases: [
    {
      audience: "Content editor / blogger",
      title: "Set a post's permalink",
      description:
        "Turn a working headline into the clean permalink slug your CMS should use, capping the length so the URL stays short and the primary keywords lead.",
    },
    {
      audience: "Developer",
      title: "Generate slugs for a static site",
      description:
        "Feed page titles through the tool to produce consistent, strict, lowercase slugs for file names and route paths, matching the same rules across your whole build.",
    },
    {
      audience: "SEO specialist",
      title: "Clean up a URL structure",
      description:
        "Rewrite noisy, parameter-heavy or accented URLs into readable keyword slugs and export the batch to hand off as a redirect map.",
    },
    {
      audience: "Store / catalogue manager",
      title: "Slugify a product list",
      description:
        "Paste a column of product names and get a de-duplicated set of URL slugs for category and product pages, ready to import without collisions.",
    },
  ],

  troubleshooting: [
    {
      problem: "My slug came out empty.",
      solution:
        "That happens when the input is only characters strict mode removes, for example an all-emoji or all-symbol title. Turn strict mode off to keep more characters, or add at least one letter or digit to the text.",
    },
    {
      problem: "An accented or non-Latin word disappeared.",
      solution:
        "Transliteration maps common Latin accents (é, ü, ñ, ß …) to ASCII, but scripts without an ASCII equivalent (e.g. Chinese, Arabic, emoji) can't be folded and are dropped in strict mode. Provide a romanised version of those words, or turn strict mode off to preserve what the browser can normalize.",
    },
    {
      problem: "Two rows in my batch produced the same URL.",
      solution:
        "They won't collide, batch mode appends -2, -3 and so on to repeated slugs so every line stays unique. If you'd rather keep exact duplicates, that de-duplication only applies in batch mode. Slugify the lines individually to opt out.",
    },
    {
      problem: "My max length cut the slug shorter than expected.",
      solution:
        "To avoid a word being sliced in half, the length cap trims back to the last full separator boundary within the limit. Raise the max length, or lower it precisely, if you need the slug to reach closer to the exact character count.",
    },
  ],

  tips: [
    "Keep slugs short and front-load the primary keyword, the first few words carry the most SEO and readability value.",
    "Prefer hyphens over underscores: search engines treat hyphens as word separators, while underscores can join words together.",
    "Set a max length of around 60 characters for tidy, shareable URLs that don't wrap awkwardly in messages or search results.",
    "Once a page is published, avoid changing its slug, if you must, set up a 301 redirect from the old URL so links and rankings survive.",
    "Use strict, lowercase slugs to sidestep case-sensitivity and encoding issues across servers, CDNs and copy-paste.",
  ],

  security:
    "Every slug is generated locally in your browser using its native Unicode normalizer and string functions. Nothing you type is uploaded, stored or logged. Draft titles, internal page names and unpublished URLs stay on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "What is a URL slug?",
      answer:
        "A slug is the human-readable part of a URL that identifies a specific page, usually the last segment of the path, for example, 'clean-url-slugs' in example.com/blog/clean-url-slugs. A good slug is short, lowercase, hyphen-separated and made of real words, which helps both people and search engines understand what the page is about.",
    },
    {
      question: "How do I make a slug SEO-friendly?",
      answer:
        "Keep it short, use lowercase letters, separate words with hyphens, include your main keyword near the start, and strip stop words and punctuation. This tool applies all of that automatically: it transliterates accents, removes symbols, collapses spaces into your chosen separator and can cap the length on a clean word boundary.",
    },
    {
      question: "Should I use hyphens or underscores in a slug?",
      answer:
        "Hyphens. Google treats a hyphen as a word separator, so 'red-shoes' reads as two words, whereas 'red_shoes' can be read as one. Underscores are supported here if a system requires them, but hyphens are the safer default for SEO and readability.",
    },
    {
      question: "How does the tool handle accented and non-English characters?",
      answer:
        "It transliterates common accented Latin letters to their closest ASCII equivalent (café → cafe, naïve → naive, Straße → strasse) using a character map plus Unicode NFKD normalization, and expands symbols like & and % into words. Scripts with no ASCII equivalent are dropped in strict mode, so provide a romanised version of those words if you need them in the slug.",
    },
    {
      question: "Can I generate many slugs at once?",
      answer:
        "Yes. Switch to Batch mode and paste a list with one title per line: each line becomes its own slug using the same rules, and identical results are automatically de-duplicated with numeric suffixes so no two URLs collide. You can then copy or download the whole list.",
    },
    {
      question: "What's the difference between strict mode being on and off?",
      answer:
        "With strict mode on, the slug keeps only a–z, 0–9 and the separator, the safest, most portable form. With it off, a few extra URL-safe characters (like. _ ~) are allowed to survive, which is useful when you need to preserve, say, a version number or file-style name in the slug.",
    },
    {
      question: "Is there a recommended maximum length for a slug?",
      answer:
        "There's no hard limit, but shorter is better for readability and sharing: around 3–5 words or roughly 60 characters is a common target. Set the max length here and the slug will truncate on the last full word before the limit, so it never ends mid-word.",
    },
    {
      question: "Is anything I type sent to a server?",
      answer:
        "No. All slug generation, transliteration and de-duplication happen entirely in your browser with native JavaScript, so nothing you enter is uploaded, stored or logged. It's safe to slugify unpublished titles, internal page names or confidential product names: close the tab and every trace is gone.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, live text-to-slug with separator, case, strict-mode and max-length controls, ASCII transliteration, copy/download/share and undo/redo.",
    },
    {
      date: "2026-06-26",
      change:
        "Added Batch mode: slugify a pasted list line by line with automatic numeric-suffix de-duplication of repeated slugs.",
    },
    {
      date: "2026-06-30",
      change:
        "Added curated examples, live slug stats (length, words, changed characters) and keyboard shortcuts with an in-tool helper.",
    },
  ],

  relatedTools: [
    "url-encoder",
    "url-decoder",
    "meta-tag-generator",
    "xml-sitemap-generator",
    "json-formatter",
  ],
};

export default slugGenerator;
