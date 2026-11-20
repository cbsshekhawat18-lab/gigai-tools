import type { Tool } from "@/types";

/**
 * Open Graph Generator, a focused sibling to the Meta Tag Generator that does
 * one job exceptionally well: turn a page's title, description, image, URL and
 * og:type into a correct, escaped Open Graph block and show it live as a
 * Facebook and LinkedIn share card. Where the meta-tag flagship covers the whole
 * `<head>`, this tool is the place people land when they specifically want the
 * og:* protocol right, so every line of copy is written for "open graph"
 * search intent, not general meta tags, and it never duplicates the sibling's
 * wording.
 */
const openGraphGenerator: Tool = {
  slug: "open-graph-generator",
  title: "Open Graph Generator",
  description:
    "Build correct Open Graph (og:) meta tags and see a live Facebook and LinkedIn share-card preview as you type, copy the ready-to-paste markup, 100% in your browser.",
  category: "seo-tools",
  group: "Meta Tags",
  icon: "Share2",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Open Graph Generator, og: Tags with a Live Share-Card Preview",
  tagline:
    "Fill in your title, description, image and URL once and get a clean, standards-compliant Open Graph block, with a faithful Facebook and LinkedIn card rendering live so you know exactly how your link will look before you post it.",
  longDescription:
    "The GigAI Open Graph Generator produces the exact `og:` markup a link needs to unfurl into a rich preview on Facebook, LinkedIn, Slack, Discord, WhatsApp, iMessage and every other platform that reads the Open Graph protocol. You enter the essentials: og:title, og:description, og:image and its alt text, og:url, og:type, og:site_name and locale, plus optional image width and height, and the tool emits properly attribute-escaped `<meta property=\"og:*\">` tags in the right order, ready to paste into your `<head>`. What makes it worth bookmarking is the preview: a pixel-faithful Facebook card and LinkedIn card render your title, description and image exactly as those networks crop, truncate and label them, so you catch a missing image, an over-long headline or a wrong og:type before a single person clicks share. Image guidance flags when your dimensions stray from the recommended 1.91:1 (1200×630) ratio that keeps the large card from being letter-boxed, and gentle length hints keep your title and description inside each network's visible window. Everything runs locally with the browser's own encoders, so unpublished URLs, draft headlines and pre-launch campaign copy never leave your machine, and you can copy the block, download it as an HTML snippet, share a link that reopens the form pre-filled, or undo and redo your edits at will.",

  ctaText: "Generate Open Graph tags",

  /* Generation intents only, platform preview keywords ("facebook share
     preview", "linkedin post preview") live on open-graph-preview. */
  keywords: [
    "open graph generator",
    "og tags generator",
    "og meta tags",
    "og tags for website",
    "facebook og tags",
    "og:image generator",
    "social card generator",
    "open graph protocol",
    "generate og tags",
    "link preview generator",
    "og:title og:description",
    "social meta tags",
  ],

  seo: {
    title: "Open Graph Generator, og: Tags + Live Facebook/LinkedIn Preview | GigAI Tools",
    description:
      "Free Open Graph generator: create og:title, og:description, og:image and og:url tags with a live Facebook and LinkedIn share-card preview. Copy or download the markup. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Share2",
      title: "Every og: tag from one form",
      description:
        "og:title, og:description, og:image (+ alt, width, height), og:url, og:type, og:site_name and og:locale: emitted as one clean, correctly-ordered, paste-ready block with only the fields you fill in.",
    },
    {
      icon: "Facebook",
      title: "Live Facebook & LinkedIn cards",
      description:
        "A faithful Facebook card and LinkedIn card render as you type, cropping your image and truncating your title exactly as each network does, so the unfurled link looks intentional everywhere.",
    },
    {
      icon: "Image",
      title: "og:image ratio coaching",
      description:
        "Enter your image dimensions and the tool checks them against the 1.91:1 (1200×630) large-card sweet spot, warning before your hero image gets letter-boxed or shrunk to a tiny thumbnail.",
    },
    {
      icon: "ShieldCheck",
      title: "Escaped, injection-safe markup",
      description:
        "Every property value is HTML-escaped, so quotes, ampersands and angle brackets in your headline or description can't break the tag or open a hole in your template.",
    },
    {
      icon: "Ruler",
      title: "Length hints that match reality",
      description:
        "Live character hints keep og:title and og:description inside the window Facebook and LinkedIn actually display, so your key words survive the crop instead of trailing off.",
    },
    {
      icon: "Copy",
      title: "Copy, download, share, undo",
      description:
        "Copy the og: block, download it as an.html snippet, share a link that reopens the form pre-filled, load a preset, or step through undo/redo, all keyboard-driven and fully local.",
    },
  ],

  benefits: [
    {
      title: "Links that unfurl into rich cards",
      description:
        "Correct og:title, og:description and og:image mean your shared URL becomes a clickable card with an image and headline instead of a bare, ignorable blue link.",
    },
    {
      title: "Catch a broken card before you post",
      description:
        "The live Facebook and LinkedIn previews surface a missing image, a cropped headline or the wrong og:type while you can still fix it. Not after the post is already out.",
    },
    {
      title: "The protocol, right, without reading the spec",
      description:
        "You fill in plain fields and get the exact property=\"og:*\" syntax with correct types and namespacing. No more guessing which tags Facebook actually needs.",
    },
    {
      title: "Private by design",
      description:
        "Tags are generated locally in your browser, so unpublished URLs, draft headlines and pre-launch imagery never touch a server or get logged anywhere.",
    },
  ],

  howTo: [
    {
      title: "Enter the core Open Graph fields",
      description:
        "Add your og:title, og:description and the canonical og:url. These three drive the headline, snippet and destination of the share card.",
    },
    {
      title: "Add your image and its details",
      description:
        "Paste a public https og:image URL, give it descriptive alt text, and optionally set its width and height so the ratio check can guide you to a crisp large card.",
    },
    {
      title: "Pick the og:type and site name",
      description:
        "Choose website, article, product or profile, set og:site_name and locale if relevant, and leave anything blank to omit that tag. Nothing is invented for you.",
    },
    {
      title: "Preview, then copy or download",
      description:
        "Flip between the Facebook and LinkedIn cards to confirm the crop, then copy the og: block, download it as an .html snippet, or share a pre-filled link.",
    },
  ],

  formats: {
    input: ["Form fields"],
    output: ["HTML", "Open Graph tags"],
  },

  useCases: [
    {
      audience: "Content marketer",
      title: "Perfect a post's share card before launch",
      description:
        "Draft the og:title and image for a new blog post or announcement and preview exactly how it unfurls on Facebook and LinkedIn, fixing a cropped headline or off-ratio image ahead of time.",
    },
    {
      audience: "Frontend developer",
      title: "Add correct og: tags to a page",
      description:
        "Generate an escaped, correctly-typed Open Graph block in seconds and paste it into your template or head component instead of hand-writing property attributes and second-guessing the namespace.",
    },
    {
      audience: "Social / community manager",
      title: "Fix an ugly link preview",
      description:
        "When a URL shares as a plain link with no image, use the tool to produce the missing og: tags, hand them to your dev team, and confirm the fix in the live preview.",
    },
    {
      audience: "Agency / freelancer",
      title: "Deliver consistent social markup",
      description:
        "Produce standards-compliant og: tags across every client page and share a pre-filled link so anyone can review or tweak the social copy without touching code.",
    },
  ],

  troubleshooting: [
    {
      problem: "My og:image doesn't appear in the preview.",
      solution:
        "The card loads the image directly, so og:image must be a fully-qualified, publicly reachable https URL. Not a localhost address, a relative path or a private file. Facebook and LinkedIn also ignore images smaller than 200×200px, so use a 1200×630 image for the large card.",
    },
    {
      problem: "The tags are correct but the live share still looks wrong.",
      solution:
        "Facebook and LinkedIn cache Open Graph data aggressively. After you deploy new tags, re-scrape the URL with Facebook's Sharing Debugger or LinkedIn's Post Inspector to force a fresh fetch. Your markup is right, the network is just showing a cached copy.",
    },
    {
      problem: "My image is showing as a small square, not a big banner.",
      solution:
        "That happens when the image is close to square or below the large-card threshold. Use a landscape 1.91:1 image (1200×630 is ideal) and set og:image:width and og:image:height so the platform confidently renders the large layout.",
    },
    {
      problem: "Do I still need Twitter Card tags if I have Open Graph?",
      solution:
        "X (Twitter) falls back to Open Graph when its own twitter:* tags are missing, so your link will still unfurl. Add Twitter Cards only when you want to pick a specific layout or set the posting account, the Meta Tag Generator covers both if you need them together.",
    },
  ],

  tips: [
    "Use a 1200×630px (1.91:1) og:image for a crisp, full-width large card on Facebook and LinkedIn.",
    "Always set og:url to the canonical, absolute URL: it's the identity the network uses to de-duplicate and cache the share.",
    "Give og:image an og:image:alt: it improves accessibility and some platforms surface it as the image caption.",
    "Match og:type to the content (article for posts, product for shop pages, website for everything else) so platforms label the card correctly.",
    "Set og:site_name to your brand so the card shows a tidy source line above the headline.",
  ],

  security:
    "Every Open Graph tag is generated locally in your browser using its native encoders. Nothing you type is ever uploaded, stored or logged. Draft headlines, unpublished URLs and pre-launch image links stay on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "What are Open Graph tags and why do I need them?",
      answer:
        "Open Graph (og:) is a protocol, originally from Facebook, that lets you control how your URL looks when it's shared. Adding og:title, og:description, og:image and og:url turns a bare link into a rich card with a headline, summary and image on Facebook, LinkedIn, Slack, Discord, WhatsApp, iMessage and most other platforms. Without them, networks guess, often badly, so pages with proper og: tags get far more attention when shared.",
    },
    {
      question: "Which Open Graph tags are required?",
      answer:
        "The core four are og:title, og:type, og:image and og:url: those are what the protocol treats as required for a valid object. In practice you'll also want og:description for the snippet and og:site_name for the source line. This generator emits every tag you fill in and leaves out the ones you don't, so you get exactly the object you intend.",
    },
    {
      question: "What image size should I use for og:image?",
      answer:
        "Use a landscape 1200×630px image (a 1.91:1 ratio) for the large card that Facebook and LinkedIn favour. Keep it above 200×200px at minimum, under a few hundred KB for fast fetching, and set og:image:width and og:image:height so platforms can render the large layout immediately. The tool checks your dimensions against this ratio and warns you if they'll cause letter-boxing.",
    },
    {
      question: "Why does LinkedIn or Facebook show an old preview after I updated my tags?",
      answer:
        "Both networks cache Open Graph data, sometimes for days. If the old card still appears, the platform is serving a cached copy rather than re-reading your page. Run the URL through Facebook's Sharing Debugger or LinkedIn's Post Inspector to force a re-scrape. The tags this tool generates are correct. The network just needs to fetch them again.",
    },
    {
      question: "Do Open Graph tags help SEO?",
      answer:
        "Not directly: Google doesn't use og: tags as a ranking factor. But they strongly influence social sharing, and the extra clicks, engagement and referral traffic from good-looking share cards can indirectly support your visibility. Think of Open Graph as click-through optimisation for social, the same way your title and meta description are for search.",
    },
    {
      question: "Does X (Twitter) read Open Graph tags?",
      answer:
        "Yes. X reads Open Graph as a fallback when its own twitter:* Card tags are absent, so a link with good og: tags will still unfurl on X. You only need dedicated Twitter Card tags when you want a specific card layout or to attribute the posting account: otherwise Open Graph alone is enough.",
    },
    {
      question: "Where exactly do I put the generated tags?",
      answer:
        "Paste the block inside the <head> of your HTML, ideally near your other meta tags and before any closing </head>. In a framework, add them to your head component (Next.js Metadata's openGraph field, Nuxt useHead, a plain <head>, etc.). Because they're in <head>, crawlers and social scrapers read them without executing any JavaScript.",
    },
    {
      question: "Are my inputs sent anywhere?",
      answer:
        "No. All tag generation, escaping and previewing happen entirely in your browser with its native encoders. Nothing you type is uploaded, stored or logged, so it's safe to draft Open Graph tags for unpublished pages, internal URLs or confidential campaigns, close the tab and every trace is gone.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: full Open Graph tag generation from one form with live, faithful Facebook and LinkedIn share-card previews, copy/download/share and undo/redo.",
    },
    {
      date: "2026-06-24",
      change:
        "Added og:image ratio coaching against the 1200×630 sweet spot, HTML-escaping of every property value, and curated presets (article, product, profile).",
    },
    {
      date: "2026-06-30",
      change:
        "Added og:image width/height fields, og:locale support, keyboard shortcuts with an in-tool helper, and refined the LinkedIn card crop to match its current rendering.",
    },
  ],

  relatedTools: [
    "meta-tag-generator",
    "meta-tag-analyzer",
    "serp-snippet-preview",
    "url-encoder",
  ],
};

export default openGraphGenerator;
