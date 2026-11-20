import type { Tool } from "@/types";

/**
 * Twitter Card Generator: a focused Meta Tags workspace for X (Twitter) share
 * cards. It turns a small form (card type, title, description, image, @site,
 * @creator) into a clean block of `twitter:*` meta tags and renders a faithful
 * live X card preview that switches between the summary and summary_large_image
 * layouts. Every line of copy below is written specifically for Twitter Card
 * markup and X link-preview optimisation so the page ranks on its own terms and
 * doesn't cannibalise the meta-tag or Open Graph generators.
 */
const twitterCardGenerator: Tool = {
  slug: "twitter-card-generator",
  title: "Twitter Card Generator",
  description:
    "Generate Twitter Card meta tags for X with a live card preview. Pick summary or large image, set the title, description, image and @handles, then copy the ready-to-paste twitter:* markup. 100% in your browser.",
  category: "seo-tools",
  group: "Meta Tags",
  icon: "Twitter",
  accent: "sky",
  status: "live",
  featured: false,
  createdAt: "2026-06-19",

  h1: "Twitter Card Generator: twitter:* Meta Tags for X, With Live Preview",
  tagline:
    "Fill in your card type, title, description, image and account handles once and get valid Twitter Card meta tags, with a live X card preview that shows exactly how your link unfurls in a summary or large-image layout before you ship it.",
  longDescription:
    "The GigAI Twitter Card Generator builds the exact `twitter:*` meta tags a page needs to unfurl into a rich card when its link is posted on X (formerly Twitter). You choose the card type, `summary` for a compact square-image layout or `summary_large_image` for a full-width hero, and fill in the title, description, image URL, image alt text, and the `@site` and `@creator` handles. As you type, a faithful X card preview renders the result the way X crops and labels it, so you can catch a truncated headline, a missing image or the wrong card type before a single post goes out. The generated markup is properly HTML-escaped and emits only the fields you actually fill in, so you never ship an empty `twitter:image` or a stray attribute. Because X falls back to Open Graph when Twitter tags are absent, the tool is built to complement your `og:*` tags rather than fight them. Use it to add the layout control and posting-account attribution that only Twitter Cards provide. Everything runs locally with the browser's own encoders: draft copy, unpublished URLs and campaign details never leave your machine, and you can copy the tags, download them as an HTML snippet, share a pre-filled link, load a template or undo and redo entirely from the keyboard.",

  ctaText: "Generate Twitter Card tags",

  keywords: [
    "twitter card generator",
    "twitter card meta tags",
    "x card generator",
    "twitter:card",
    "summary_large_image",
    "twitter card validator alternative",
    "twitter meta tags generator",
    "x link preview",
    "twitter image card",
    "twitter card html",
  ],

  seo: {
    title: "Twitter Card Generator, twitter:* Meta Tags for X | GigAI Tools",
    description:
      "Free Twitter Card generator: create summary and summary_large_image twitter:* meta tags with a live X card preview. Copy or download the markup. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Twitter",
      title: "Both card layouts, done right",
      description:
        "Generate summary (compact square) or summary_large_image (full-width hero) cards with the correct twitter:card value and only the tags each layout needs. No guesswork about which fields matter.",
    },
    {
      icon: "Eye",
      title: "Live X card preview",
      description:
        "A faithful X card renders as you type, cropping the image and truncating the title and description the way X does, so you see exactly how your link unfurls before you post it.",
    },
    {
      icon: "AtSign",
      title: "Site & creator attribution",
      description:
        "Add twitter:site and twitter:creator handles so your card credits the publishing account and the author, unlocking the byline and follow prompts X shows on attributed cards.",
    },
    {
      icon: "ShieldCheck",
      title: "Escaped, minimal, valid markup",
      description:
        "Every attribute value is HTML-escaped and empty fields are dropped, so quotes and ampersands in your copy can't break the tag and you never ship a blank twitter:image.",
    },
    {
      icon: "Ruler",
      title: "Length coaching for the card",
      description:
        "Live character counts flag a title or description that X will truncate in the card, guiding you to copy that reads as a complete, clickable thought.",
    },
    {
      icon: "Copy",
      title: "Copy, download, share, undo",
      description:
        "Copy the twitter:* block, download it as an.html snippet, share a link that reopens the form pre-filled, load a template, or step through undo/redo: all keyboard-driven.",
    },
  ],

  benefits: [
    {
      title: "Links that look intentional on X",
      description:
        "Seeing the real card as you write means you catch a cropped headline, a wrong card type or a missing image before you publish, so shared links look polished instead of broken.",
    },
    {
      title: "The right layout for the content",
      description:
        "Toggle between summary and large image to decide which suits the page (a big hero for a launch or article, a compact card for a utility page) and get the exact tags for it.",
    },
    {
      title: "Correct syntax without the spec",
      description:
        "You fill in plain fields. The tool emits the precise twitter:* names and values with the right meta name attributes, so you never copy a half-right snippet that X silently ignores.",
    },
    {
      title: "Private by design",
      description:
        "Everything is generated locally in your browser, so unpublished URLs, draft headlines and campaign details never leave your machine or hit a server.",
    },
  ],

  howTo: [
    {
      title: "Pick your card type",
      description:
        "Choose summary for a compact square-image card or summary_large_image for a full-width hero. The preview switches instantly so you can compare the two layouts.",
    },
    {
      title: "Fill in the card content",
      description:
        "Add the title, description and a public image URL, plus optional image alt text and the @site and @creator handles. Leave a field blank to omit its tag.",
    },
    {
      title: "Check the live preview",
      description:
        "Read the X card preview to confirm the image, title and description are cropped and labelled the way you want before you post the link anywhere.",
    },
    {
      title: "Copy or download the tags",
      description:
        "Copy the twitter:* block to your clipboard, download it as an .html snippet, or share a link that reopens the form exactly as you left it.",
    },
  ],

  formats: {
    input: ["Form fields"],
    output: ["HTML", "Meta tags"],
  },

  useCases: [
    {
      audience: "Social media manager",
      title: "Perfect a card before a launch post",
      description:
        "Preview exactly how a launch or blog URL unfurls on X, tune the title and image, and export the tags for the dev team so the shared link lands looking intentional.",
    },
    {
      audience: "Frontend developer",
      title: "Add twitter:* to a page head",
      description:
        "Generate a correct, escaped Twitter Card block in seconds and paste it into your template or framework head component instead of hand-writing meta name attributes.",
    },
    {
      audience: "Content creator",
      title: "Credit yourself on shared articles",
      description:
        "Set twitter:creator to your handle so your posts and reshares show your byline and follow prompt, turning shared links into an audience-building surface.",
    },
    {
      audience: "Agency / freelancer",
      title: "Deliver consistent cards to clients",
      description:
        "Produce standards-compliant Twitter Card markup across every client page and share a pre-filled link so anyone can review or tweak the copy without a login.",
    },
  ],

  troubleshooting: [
    {
      problem: "My Twitter Card image doesn't show in the preview.",
      solution:
        "The preview loads the image URL directly, so it must be a fully-qualified, publicly reachable https URL. Not a localhost or relative path. For summary_large_image, use an image at least 300×157px (ideally 1200×628, under 5MB, in JPG, PNG, WEBP or GIF).",
    },
    {
      problem: "X shows an old card even though my tags are correct.",
      solution:
        "X caches card data aggressively. The tags this tool generates are correct. X is serving a cached copy. After you deploy the new tags, re-share the URL or wait for the cache to expire so X re-scrapes the page and picks up the change.",
    },
    {
      problem: "Do I still need Open Graph tags if I add Twitter Cards?",
      solution:
        "Twitter Cards give you layout control (summary vs. large image) and account attribution, but X falls back to Open Graph for title, description and image when a twitter:* tag is missing. Keep your og:* tags too. Use this tool to add the twitter:* layer on top, not to replace it.",
    },
    {
      problem: "My title or description is cut off in the card.",
      solution:
        "X truncates card text to fit the layout. Keep the title short and front-load the key words, and keep the description to roughly a sentence or two, the live length counts here flag copy that will be clipped so you can trim it first.",
    },
  ],

  tips: [
    "Use summary_large_image with a 1200×628 image for launches and articles: the full-width hero earns far more attention in the timeline than the small square summary card.",
    "Always add twitter:image:alt: it's an accessibility win and describes the card image for people using screen readers on X.",
    "Set twitter:site to the publishing account and twitter:creator to the author to unlock X's byline and follow attribution on the card.",
    "Front-load the primary message in the title, X clips the tail, so the first few words have to carry the click.",
    "Keep your og:title, og:description and og:image in sync with these fields. X falls back to them, and matching tags avoid a mismatched preview.",
  ],

  security:
    "Every Twitter Card tag is generated locally in your browser using its native encoders: nothing you type is ever uploaded, stored or logged. Draft titles, unpublished URLs and campaign details stay on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "What are Twitter Card meta tags and why do I need them?",
      answer:
        "Twitter Cards are twitter:* meta tags in a page's <head> that tell X how to turn a shared link into a rich card with an image, title and description instead of a bare URL. They let you pick the card layout and credit the posting account and author, control that plain Open Graph tags don't give you. This generator produces the full block from one form and only emits the fields you fill in.",
    },
    {
      question: "What's the difference between summary and summary_large_image?",
      answer:
        "summary renders a compact card with a small square thumbnail beside the title and description, good for utility pages or when you don't have a wide hero image. summary_large_image renders a full-width image above the text, which is far more eye-catching in the timeline and is the right choice for articles, launches and marketing pages. The live preview here lets you flip between the two instantly.",
    },
    {
      question: "Do Twitter Cards still work now that Twitter is X?",
      answer:
        "Yes. The platform rebranded to X, but the underlying card system and the twitter:* meta tag names are unchanged: twitter:card, twitter:title, twitter:image and the rest still control how links unfurl on X. You don't need to rename anything. The tags this tool generates are exactly what X reads today.",
    },
    {
      question: "Do I still need Open Graph tags if I add Twitter Cards?",
      answer:
        "Almost always, yes. X falls back to Open Graph (og:title, og:description, og:image) for any field a twitter:* tag doesn't provide, and other platforms like Facebook, LinkedIn and Slack rely on Open Graph entirely. Use Twitter Cards to add layout control and account attribution on top of a complete Open Graph block rather than as a replacement for it.",
    },
    {
      question: "What image size should a Twitter Card use?",
      answer:
        "For summary_large_image, use an image at least 300×157px (1200×628 is ideal) with an aspect ratio near 2:1, under 5MB, in JPG, PNG, WEBP or GIF. For the summary card, a square image of at least 144×144px works best. The image URL must be a public https address so X (and this preview) can load it.",
    },
    {
      question: "Why does my card look different when I actually post the link?",
      answer:
        "X caches card data. If you updated your tags but an old card still appears, X is serving a cached version. The tags this tool generates are correct, the platform just needs to re-scrape the page. Re-sharing the URL after you deploy, or waiting for the cache to expire, forces X to fetch the fresh tags.",
    },
    {
      question: "What do twitter:site and twitter:creator do?",
      answer:
        "twitter:site is the @handle of the website or publisher that owns the page. Twitter:creator is the @handle of the individual author. Setting them lets X attribute the card to your account and the author, which can surface a byline and a follow prompt on the card. Both are optional: leave them blank and the generator simply omits them.",
    },
    {
      question: "Are my inputs sent to a server?",
      answer:
        "No. All tag generation, escaping and previewing happen entirely in your browser with its native encoders. Nothing you type is uploaded, stored or logged, so it's safe to draft cards for unpublished pages, internal URLs or confidential campaigns, close the tab and every trace is gone.",
    },
  ],

  changelog: [
    {
      date: "2026-06-19",
      change:
        "Initial release: summary and summary_large_image Twitter Card generation from one form, live X card preview, copy/download/share and undo/redo.",
    },
    {
      date: "2026-06-25",
      change:
        "Added live title/description length coaching, twitter:image:alt support, and curated templates (article, product, profile).",
    },
    {
      date: "2026-06-30",
      change:
        "Added keyboard shortcuts with an in-tool helper and refined the large-image card crop to match X's current rendering.",
    },
  ],

  relatedTools: [
    "meta-tag-generator",
    "open-graph-generator",
    "meta-tag-analyzer",
    "serp-snippet-preview",
    "url-encoder",
  ],
};

export default twitterCardGenerator;
