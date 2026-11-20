import type { Tool } from "@/types";

/**
 * Meta Tag Generator: the flagship of the Website & SEO suite. It turns a
 * short form (title, description, keywords, author, robots, viewport,
 * canonical + Open Graph + Twitter Card) into a paste-ready block of `<head>`
 * markup, and pairs it with a pixel-accurate Google SERP snippet and faithful
 * Facebook / X / LinkedIn share-card previews, all rendered live, entirely in
 * the browser. Every line of copy below is unique to meta-tag generation and
 * social-preview optimisation so the page ranks on its own merits rather than
 * competing with the analyzer, schema or sitemap tools.
 */
const metaTagGenerator: Tool = {
  slug: "meta-tag-generator",
  title: "Meta Tag Generator",
  description:
    "Generate perfect SEO meta tags, Open Graph and Twitter Card markup with a live Google snippet and social-card preview, copy the ready-to-paste <head> code, 100% in your browser.",
  category: "seo-tools",
  group: "Meta Tags",
  icon: "Tags",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",

  h1: "Meta Tag Generator: SEO, Open Graph & Twitter Card Tags",
  tagline:
    "Type your title, description and social details once and get clean, standards-compliant meta, Open Graph and Twitter Card tags: with a live Google result and share-card preview so you see exactly how the page looks before you ship it.",
  longDescription:
    "The GigAI Meta Tag Generator builds the complete `<head>` block a modern page needs for search and social, `<title>`, meta description, keywords, author, robots, viewport, charset and canonical, plus a full Open Graph object and a Twitter Card, from one compact form. What lifts it above the usual generators is the feedback loop: as you type, a pixel-accurate Google SERP snippet shows whether your title and description fit or get truncated, and faithful Facebook, X (Twitter) and LinkedIn cards render your Open Graph image, title and description exactly as each network will crop and label them. Length coaching flags a title that is too short to earn clicks or a description that will be cut off, so you tune the copy before it ever reaches a crawler. The generated markup is properly HTML-escaped and ordered, ready to paste straight into your template, and you can copy it, download it as an HTML snippet, share a link that reopens the form pre-filled, or undo/redo your way back. Because everything runs locally with the browser's own parser and encoders, nothing you type (draft copy, unpublished URLs, campaign details) is ever uploaded, logged or seen by anyone.",

  ctaText: "Generate meta tags",

  keywords: [
    "meta tag generator",
    "seo meta tags",
    "html meta tags",
    "generate meta tags",
    "google snippet preview",
    "meta title generator",
    "meta tags for website",
    "create meta tags online",
    "head tags generator",
  ],

  seo: {
    title: "Meta Tag Generator, SEO, Open Graph & Twitter Cards | GigAI Tools",
    description:
      "Free meta tag generator: create SEO title, description, Open Graph and Twitter Card tags with a live Google snippet and social-card preview. Copy or download the <head> code: nothing is uploaded.",
  },

  features: [
    {
      icon: "Tags",
      title: "Complete <head> in one form",
      description:
        "Title, description, keywords, author, robots, viewport, charset and canonical (plus full Open Graph and Twitter Card blocks) generated together as one clean, ordered, paste-ready snippet.",
    },
    {
      icon: "Search",
      title: "Live Google SERP preview",
      description:
        "A pixel-accurate desktop and mobile search snippet renders as you type, using the same Arial widths Google truncates by, so you see whether your title and description actually fit.",
    },
    {
      icon: "Share2",
      title: "Real Facebook, X & LinkedIn cards",
      description:
        "Switch between platforms to see how your Open Graph image, title and description are cropped and labelled on each network, including the summary vs. large-image Twitter layouts.",
    },
    {
      icon: "Ruler",
      title: "Title & description length coaching",
      description:
        "Live length scoring warns when a title is too short to earn clicks or a description will be truncated, guiding you to the 50–60 and 150–160 character sweet spots.",
    },
    {
      icon: "ShieldCheck",
      title: "Safe, escaped, valid markup",
      description:
        "Every attribute value is HTML-escaped, so quotes, ampersands and angle brackets in your copy can't break the tag or open an injection hole in your template.",
    },
    {
      icon: "Copy",
      title: "Copy, download, share, undo",
      description:
        "Copy the tags, download them as an.html snippet, share a link that reopens the form pre-filled, load a preset, or step back and forth through undo/redo: all keyboard-driven.",
    },
  ],

  benefits: [
    {
      title: "Win the click in search results",
      description:
        "Seeing the real SERP snippet as you write means you craft a title and description that fit the pixel budget and read as a compelling result. Not one Google chops mid-sentence.",
    },
    {
      title: "Ship share cards that don't look broken",
      description:
        "The faithful Facebook, X and LinkedIn previews catch a missing image, a cropped headline or a wrong card type before you publish, so links look intentional everywhere.",
    },
    {
      title: "Correct tags without memorising the spec",
      description:
        "You fill in plain fields. The tool emits the exact og:*, twitter:* and meta syntax with the right property vs. name attributes. No more copying a half-right Stack Overflow snippet.",
    },
    {
      title: "Private by design",
      description:
        "Everything is generated locally in your browser, so unpublished URLs, draft headlines and campaign details never leave your machine or hit a server.",
    },
  ],

  howTo: [
    {
      title: "Enter your page basics",
      description:
        "Fill in the title, meta description and (optionally) keywords, author, robots, viewport and canonical URL. Watch the live length meters keep you in the ideal range.",
    },
    {
      title: "Add Open Graph & Twitter details",
      description:
        "Set the social title, description, image URL, site name and Twitter card type. Leave a field blank to omit its tag: nothing is invented for you.",
    },
    {
      title: "Check the live previews",
      description:
        "Read the Google snippet and flip between the Facebook, X and LinkedIn cards to confirm your page looks right in search and on social before you ship.",
    },
    {
      title: "Copy or download the tags",
      description:
        "Copy the generated <head> block to your clipboard, download it as an .html snippet, or share a link that reopens the form exactly as you left it.",
    },
  ],

  formats: {
    input: ["Form fields"],
    output: ["HTML", "Meta tags"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Optimize a landing page's snippet",
      description:
        "Draft several title and description variants and watch the SERP preview to pick the one that fits the pixel budget and reads best, before handing markup to the dev team.",
    },
    {
      audience: "Frontend developer",
      title: "Scaffold a page's <head>",
      description:
        "Generate a correct, escaped meta + Open Graph + Twitter block in seconds and paste it into your template or framework head component, instead of hand-writing property attributes.",
    },
    {
      audience: "Marketer / content lead",
      title: "Perfect a share card before a campaign",
      description:
        "Preview exactly how a blog post or launch page will look when shared on Facebook, X and LinkedIn, and fix a cropped image or truncated headline ahead of time.",
    },
    {
      audience: "Agency / freelancer",
      title: "Deliver clean tags to a client",
      description:
        "Produce consistent, standards-compliant meta markup across every client page and share a pre-filled link so anyone can review or tweak the copy.",
    },
  ],

  troubleshooting: [
    {
      problem: "My Open Graph image doesn't show in the preview.",
      solution:
        "The preview loads the image URL directly, so it must be a fully-qualified, publicly reachable https URL (not a localhost or relative path). Facebook and LinkedIn also require the real image to be at least 200×200px: use a 1200×630 image for the large card.",
    },
    {
      problem: "The tags look right but the social card is still wrong live.",
      solution:
        "Networks cache Open Graph data aggressively. After you deploy the new tags, re-scrape the URL with Facebook's Sharing Debugger or LinkedIn's Post Inspector to force a fresh fetch. The tags are correct, the platform is showing a cached copy.",
    },
    {
      problem: "My title or description is flagged as too long.",
      solution:
        "Google truncates by rendered pixel width, not character count. Aim for roughly 50–60 characters for the title and 150–160 for the description. Front-load the important words so the meaning survives even if the tail is cut.",
    },
    {
      problem: "Should I still add a keywords meta tag?",
      solution:
        "Google ignores meta keywords for ranking and has for years, so it's optional. The generator includes it if you fill it in (some internal search and a few smaller engines still read it), but title, description and quality content matter far more.",
    },
  ],

  tips: [
    "Set a canonical URL on every page to consolidate ranking signals and avoid duplicate-content dilution across query-string and www variants.",
    "Use a 1200×630 Open Graph image for a crisp large card on Facebook, LinkedIn and X's summary_large_image layout.",
    "Give your og:image an og:image:alt, it's both an accessibility win and a hint some platforms surface.",
    "Front-load the primary keyword and your brand in the title. The tail is what gets truncated in search results.",
    "Leave the robots field blank for normal pages (it defaults to index,follow) and only set noindex where you genuinely want a page kept out of search.",
  ],

  security:
    "Every meta, Open Graph and Twitter tag is generated locally in your browser using its native encoders. Nothing you type is ever uploaded, stored or logged. Draft titles, unpublished URLs and campaign details stay on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "What meta tags does every page actually need for SEO?",
      answer:
        "At minimum: a unique <title>, a compelling meta description, a responsive viewport (width=device-width, initial-scale=1), a UTF-8 charset, and a canonical link. For strong social sharing add Open Graph (og:title, og:description, og:image, og:url) and a Twitter Card. This generator produces all of them from one form and only emits the fields you fill in.",
    },
    {
      question: "How long should my title and meta description be?",
      answer:
        "Google truncates by pixel width, but as a reliable guide keep titles to about 50–60 characters and descriptions to about 150–160. The live SERP preview here measures the real rendered width and warns you before your copy gets cut off, so you can trust what you see rather than counting characters.",
    },
    {
      question: "What's the difference between Open Graph and Twitter Card tags?",
      answer:
        "Open Graph (og:*) is the shared standard used by Facebook, LinkedIn, Slack, Discord and most platforms to build a link preview. Twitter Cards (twitter:*) are X's own tags that let you pick a layout (summary or summary_large_image) and set the posting account. X falls back to Open Graph when Twitter tags are missing, but adding both gives you full control everywhere. The generator outputs both.",
    },
    {
      question: "Does the meta keywords tag still help ranking?",
      answer:
        "No. Google confirmed years ago that it ignores the meta keywords tag for ranking, and stuffing it can look spammy. It's included here only because you asked for it and a few niche engines or internal site searches still read it, but your title, description and page content are what matter for SEO.",
    },
    {
      question: "Why does my share preview look different from the live post?",
      answer:
        "Social networks cache Open Graph data. If you updated your tags but the old preview still appears when you share, the platform is serving a cached copy. Run the URL through Facebook's Sharing Debugger or LinkedIn's Post Inspector to force a re-scrape. The tags this tool generates are correct. The network just needs to fetch them again.",
    },
    {
      question: "Is a canonical tag necessary and what does it do?",
      answer:
        "A canonical link (<link rel=\"canonical\">) tells search engines which URL is the authoritative version of a page, consolidating ranking signals and preventing duplicate-content problems from query strings, tracking parameters or www/non-www variants. It's optional but highly recommended, and setting it here adds the tag for you.",
    },
    {
      question: "Are my inputs sent to a server?",
      answer:
        "No. All tag generation, escaping and previewing happen entirely in your browser with its native encoders and parser. Nothing you type is uploaded, stored or logged, so it's safe to draft tags for unpublished pages, internal URLs or confidential campaigns: close the tab and every trace is gone.",
    },
    {
      question: "Can I copy and reuse the generated tags anywhere?",
      answer:
        "Yes. Paste them into any HTML template, a static site, or a framework's head component (Next.js Metadata, Nuxt, plain <head>, etc.). Every attribute value is HTML-escaped, so special characters in your copy won't break the markup. You can copy the block, download it as an .html snippet, or share a pre-filled link.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, meta, Open Graph and Twitter Card generation from one form, live pixel-accurate Google SERP snippet, Facebook/X/LinkedIn card previews, copy/download/share and undo/redo.",
    },
    {
      date: "2026-06-23",
      change:
        "Added live title/description length coaching, HTML-escaping of all attribute values, and curated presets (blog article, product page, SaaS landing).",
    },
    {
      date: "2026-06-30",
      change:
        "Added keyboard shortcuts with an in-tool helper and refined the mobile SERP truncation model to match Google's current rendering.",
    },
  ],

  relatedTools: [
    "meta-tag-analyzer",
    "open-graph-generator",
    "serp-snippet-preview",
    "json-formatter",
    "url-encoder",
    "url-decoder",
  ],
};

export default metaTagGenerator;
