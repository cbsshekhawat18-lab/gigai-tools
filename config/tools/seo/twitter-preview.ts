import type { Tool } from "@/types";

/**
 * Twitter (X) Card Preview, a live preview of the share card a page produces on
 * X/Twitter. Type twitter:title, description, image and card type (or paste the
 * page HTML and we extract the tags client-side), and see a pixel-faithful
 * summary / summary_large_image card render in real time, with a warnings audit
 * that catches the exact mistakes that make cards fall back to a bare link.
 * Every word of copy is unique to Twitter Card previewing and written to rank
 * for the queries people search when their tweets show no image.
 */
const twitterPreview: Tool = {
  slug: "twitter-preview",
  title: "Twitter (X) Card Preview",
  category: "seo-tools",
  group: "SEO Preview",
  icon: "Twitter",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-22",

  description:
    "Preview exactly how your page will look when shared on X (Twitter), summary and large-image cards, as you type your title, description and image, or paste your page's HTML. Live warnings catch broken cards before you post. Nothing is uploaded.",

  h1: "Twitter (X) Card Preview, See Your Share Card Before You Post",
  tagline:
    "Enter your twitter:title, description, image and card type (or paste a page's HTML) and watch a pixel-faithful X (Twitter) card render instantly, with a live audit that flags the exact tag mistakes that make cards collapse into a plain link. Everything runs in your browser.",
  longDescription:
    "The GigAI Twitter (X) Card Preview shows you the one thing a tags editor never can: how your link will actually look in someone's timeline, before you post it. Type a twitter:title, description and image URL and pick a card type, and a faithful X card renders instantly, the large hero image of a summary_large_image card, or the compact square-thumbnail summary card, with the title, description and source domain laid out the way X presents them. Because X derives cards from Open Graph tags too, our warnings audit checks the real failure modes: a summary_large_image card declared with no twitter:image, a title long enough to be clipped, a description that gets cut in the compact layout, a relative or non-HTTPS image URL that X will refuse to crawl, and a missing twitter:card that leaves X guessing. You can work from fields or switch to paste-first mode: drop in a page's full HTML and we pull twitter:title, twitter:description, twitter:image and twitter:card straight out of it with the browser's native parser, and fall back to the og:* equivalents exactly as X does when the twitter:* tags are absent. You also get one-click copy of a clean, ready-to-paste twitter:card meta block, download and shareable links that reopen your exact card for a teammate, plus undo/redo and samples. Nothing you enter is ever uploaded, the whole preview and audit run on your device, so you can safely preview unpublished pages, staging URLs and client work with no server, no login and no card-validator queue.",

  ctaText: "Preview my card",

  keywords: [
    "twitter card preview",
    "x card preview",
    "summary large image preview",
    "twitter:image not showing",
    "og image twitter preview",
    "twitter card tags",
    "x share preview",
    "twitter meta tags",
    "twitter card checker",
  ],

  seo: {
    title: "Twitter (X) Card Preview, Live Share Card Tester | GigAI Tools",
    description:
      "Free Twitter (X) card preview tool. See your summary or large-image card render live from twitter:* tags or pasted HTML, with warnings that catch broken cards. 100% in-browser, no uploads.",
  },

  features: [
    {
      icon: "Image",
      title: "Both card layouts, pixel-faithful",
      description:
        "See your link as a compact summary card and as a full-width summary_large_image card, laid out the way X actually crops the image, title, description and source domain.",
    },
    {
      icon: "TriangleAlert",
      title: "A warnings audit that catches broken cards",
      description:
        "We flag the real failure modes: a large-image card with no image, a title or description that will be clipped, a relative or non-HTTPS image URL X can't crawl, and a missing twitter:card tag.",
    },
    {
      icon: "ClipboardPaste",
      title: "Paste-first HTML extraction",
      description:
        "Have an existing page? Paste its HTML and we pull twitter:title, twitter:description, twitter:image and twitter:card with the browser's native parser, and fall back to og:* tags exactly as X does.",
    },
    {
      icon: "Zap",
      title: "Live as you type",
      description:
        "Every keystroke re-renders the card and re-runs the audit instantly, so you can dial in a title, swap an image or change the card type without a preview button in the loop.",
    },
    {
      icon: "Code2",
      title: "Copy a clean meta block",
      description:
        "One click copies a tidy, ready-to-paste twitter:card <meta> block (with sensible og:* fallbacks) that you can drop straight into your page <head>.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Every preview, audit and HTML extraction is computed on your device. No title, image URL or unpublished page is ever uploaded, logged or seen: safe for internal and client work.",
    },
  ],

  benefits: [
    {
      title: "Stop posting links that show no image",
      description:
        "A tweet that collapses to a bare blue link gets scrolled past. Seeing the card before you post, and getting told exactly why an image is missing, means your link lands with a full, clickable card every time.",
    },
    {
      title: "Fix cards without X's validator queue",
      description:
        "X retired its public Card Validator, and its cache can lag for hours. This tool previews and audits your tags instantly and locally, so you're not guessing or waiting on a third-party checker.",
    },
    {
      title: "Preview unpublished and client pages privately",
      description:
        "Because it's all client-side, you can preview drafts, staging URLs and client work without exposing anything, or the client's brand, to a third-party server.",
    },
    {
      title: "Get the OG fallbacks right",
      description:
        "X reads og:title, og:description and og:image when the twitter:* tags are missing. The tool mirrors that fallback so you can see the card X will actually build, not an idealised one.",
    },
  ],

  howTo: [
    {
      title: "Enter your card details",
      description:
        "Type your twitter:title, description and image URL, and choose the card type, summary or summary_large_image, in the fields on the left. Or load a sample to see how it works.",
    },
    {
      title: "Or paste your page HTML",
      description:
        "Switch to 'Extract from HTML', paste an existing page's source, and we'll pull the twitter:* tags (or their og:* fallbacks) straight into the fields for you.",
    },
    {
      title: "Read the live card and warnings",
      description:
        "Watch the card render on the right and check the warnings panel. Resolve every warning (a missing image, a clipped title, a non-HTTPS URL) until the card looks the way you want.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy a clean twitter:card meta block, download it, or share a link that reopens the tool with your exact card pre-filled for a teammate to review.",
    },
  ],

  formats: {
    input: ["Text", "HTML"],
    output: ["HTML", "Meta tags"],
  },

  useCases: [
    {
      audience: "Social media manager",
      title: "Check a link before it goes in a scheduled post",
      description:
        "Confirm the headline, image and card type render the way you want in the timeline, so a campaign link never posts as a bare, image-less URL.",
    },
    {
      audience: "SEO specialist",
      title: "Audit a page's social tags",
      description:
        "Paste a page's HTML to see the twitter:* tags (and og:* fallbacks) X will actually use, and fix the exact ones the warnings flag.",
    },
    {
      audience: "Web developer",
      title: "Verify tags on staging before launch",
      description:
        "Preview the card for an unpublished or staging page entirely in-browser. No need to deploy first just to see how X will render the share.",
    },
    {
      audience: "Marketing agency",
      title: "Review client share cards privately",
      description:
        "Tune a client's card in-browser, then share a link so they see the exact preview without a tool account or exposing the page to a server.",
    },
  ],

  troubleshooting: [
    {
      problem: "My twitter:image is set but the card shows no image.",
      solution:
        "X only crawls absolute, publicly reachable HTTPS image URLs. A relative path (/img/hero.png), an http:// URL, or an image behind auth or a robots.txt block will be dropped. Use a full https://… URL to a public file, the warnings panel flags relative and non-HTTPS URLs for exactly this reason.",
    },
    {
      problem: "I set summary_large_image but the card looks small.",
      solution:
        "A summary_large_image card only renders large when a valid twitter:image (or og:image) is present. With no image X falls back to the compact summary layout. Add a public HTTPS image at least 300px wide (ideally 1200×628) to get the big hero card.",
    },
    {
      problem: "X still shows an old title or image after I updated the tags.",
      solution:
        "X caches card data and can take hours to refresh after you change tags. This tool always previews your current tags locally, so use it to confirm the tags are correct. The live card on X will catch up once its cache expires or the URL is re-scraped.",
    },
    {
      problem: "The preview here doesn't exactly match what I see on X.",
      solution:
        "X periodically tweaks card styling, and it may pull from og:* tags or on-page content when twitter:* tags are missing. This tool renders the standard summary and large-image layouts from the tags you provide (mirroring the og:* fallback). Treat it as a faithful, tag-driven preview rather than a byte-for-byte screenshot.",
    },
  ],

  tips: [
    "Always set an absolute HTTPS twitter:image: relative and http:// URLs are the number-one reason cards show no image.",
    "For summary_large_image, use a ~1200×628 (1.91:1) image so X doesn't crop faces or text out of the hero.",
    "Keep twitter:title punchy: X clips long titles, and a front-loaded headline survives the cut.",
    "You don't need to duplicate every tag. If og:title/description/image are set, X will use them, and this tool shows that fallback.",
    "Set twitter:card explicitly rather than relying on inference, so X never guesses the wrong layout.",
  ],

  security:
    "Every preview, audit and HTML extraction happens entirely in your browser. Nothing is uploaded to any server. We deliberately do not fetch live URLs or images, so your titles, descriptions, image URLs and unpublished or internal pages never leave your device, are never logged, and are never seen by anyone. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Why is my Twitter (X) card not showing an image?",
      answer:
        "The most common causes are an image URL that isn't an absolute HTTPS link (relative paths and http:// URLs are dropped), an image blocked by robots.txt or behind authentication, or a summary_large_image card declared with no twitter:image at all. This tool's warnings panel checks each of those: enter your tags and it tells you exactly which one is breaking the card.",
    },
    {
      question: "What's the difference between summary and summary_large_image?",
      answer:
        "A 'summary' card shows a small square thumbnail next to the title and description, good for text-first links. A 'summary_large_image' card shows a full-width hero image above the title and description, giving links far more presence in the timeline. Large-image only renders large when a valid image is present. Otherwise X falls back to the compact summary layout, which the tool previews so you can see the real result.",
    },
    {
      question: "Does X still read Open Graph (og:) tags?",
      answer:
        "Yes. When the twitter:* tags are missing, X falls back to og:title, og:description and og:image, and to a small extent infers the card type. This tool mirrors that fallback, so if you paste HTML that only has og:* tags, you'll still see the card X will build. Not an empty preview.",
    },
    {
      question: "Can I paste a URL and have it load the page automatically?",
      answer:
        "No, and that's intentional. Browsers can't fetch arbitrary third-party pages or images (CORS blocks it), and we deliberately run no server so your data stays private. Instead, use the 'Extract from HTML' mode: open the page, view its source, paste it in, and we parse out the twitter:* and og:* tags client-side with the browser's native parser.",
    },
    {
      question: "What image size should I use for a Twitter (X) card?",
      answer:
        "For a summary_large_image card, use roughly 1200×628 pixels (a 1.91:1 ratio) so nothing important gets cropped, keep the file under 5MB, and host it at an absolute HTTPS URL. For a summary card, a square image of at least 144×144 works, since X shows it as a small thumbnail. The image must be publicly reachable for X to crawl it.",
    },
    {
      question: "Is there still a Twitter Card Validator?",
      answer:
        "X retired its public Card Validator, so there's no official live checker anymore, and card caches can lag for hours. This tool fills that gap by previewing and auditing your tags instantly and entirely in your browser. You don't have to deploy a page or wait on a third-party validator to see how your card will look.",
    },
    {
      question: "Is my data uploaded anywhere?",
      answer:
        "No. All rendering, auditing and HTML parsing happen locally in your browser. No title, description, image URL or pasted HTML is ever sent to a server, logged or stored, so you can safely preview unpublished, staging or client pages. When you close the tab, nothing remains.",
    },
    {
      question: "Which meta tags does this tool output?",
      answer:
        "Copy produces a clean twitter:card meta block (twitter:card, twitter:title, twitter:description and twitter:image) plus sensible og: fallbacks where they help. Paste it straight into your page <head>, and X (and other networks that read Open Graph) will build the card you previewed.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release: live summary + summary_large_image card preview, a tag warnings audit, field and HTML-extract input modes, copy/download/share, undo/redo and samples.",
    },
    {
      date: "2026-06-28",
      change:
        "Added og:* fallback mirroring in the HTML extractor and tightened the image URL audit to flag relative and non-HTTPS twitter:image values.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined card cropping and truncation to better match X's current layout, and improved the warnings copy with concrete fixes.",
    },
  ],

  relatedTools: [
    "open-graph-preview",
    "meta-tag-generator",
    "google-serp-preview",
    "meta-tag-analyzer",
    "url-encoder",
  ],
};

export default twitterPreview;
