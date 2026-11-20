import type { Tool } from "@/types";

/**
 * UTM Builder: the campaign-URL workhorse of the URL Tools group. It turns a
 * destination URL plus the five UTM dimensions (source, medium, campaign, term,
 * content) into a single clean, correctly-encoded tracking link, and shows the
 * exact parameter table Google Analytics / GA4 will read, live, in the
 * browser. Every line of copy below is unique to campaign tagging and UTM
 * hygiene so the page ranks on its own merits rather than competing with the
 * meta, schema, sitemap or URL-encoder tools.
 */
const utmBuilder: Tool = {
  slug: "utm-builder",
  title: "UTM Builder",
  description:
    "Build clean, correctly-encoded UTM campaign URLs from a form: set source, medium, campaign, term and content, see the live parameter table GA4 reads, then copy or download the tracking link. 100% in your browser.",
  category: "seo-tools",
  group: "URL Tools",
  icon: "Tag",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "UTM Builder, Campaign URL & Tracking Link Generator",
  tagline:
    "Tag any link with UTM parameters the right way: fill in source, medium and campaign, watch the encoded URL and its parameter breakdown build live, and copy a tracking link that shows up cleanly in Google Analytics 4. No spreadsheet, no server, no leaked drafts.",
  longDescription:
    "The GigAI UTM Builder assembles a Google Analytics-ready campaign URL from one compact form, utm_source, utm_medium and utm_campaign (the three GA4 requires), plus the optional utm_term and utm_content for paid-keyword and A/B attribution. Instead of hand-editing query strings and hoping you escaped the spaces, it uses the browser's native URL engine to merge your tags into the destination link, preserving any parameters the URL already carries and percent-encoding every value correctly. As you type, a live parameter table shows exactly what each utm_* key resolves to, so you can confirm the attribution before you ever paste the link into an email, an ad or a social post. Casing and consistency are where most teams lose their reporting ('Facebook', 'facebook' and 'FaceBook' fragment into three sources) so the builder offers optional lowercasing and space-to-underscore normalisation to keep your channels tidy, along with curated presets for the common source/medium pairs (newsletter, Facebook CPC, Google organic and more). When the link is ready you can copy it, download it, or share a pre-filled builder link with a teammate. Because everything runs locally, unpublished landing-page URLs, internal campaign names and client details never leave your machine or touch a server.",

  ctaText: "Build my campaign URL",

  keywords: [
    "utm builder",
    "utm generator",
    "utm parameter builder",
    "google analytics utm builder",
    "ga4 campaign url builder",
    "utm link generator",
    "url campaign tracking",
    "utm_source utm_medium utm_campaign",
    "utm code generator",
    "campaign tagging tool",
  ],

  seo: {
    title: "UTM Builder: Campaign URL & Tracking Link Generator | GigAI Tools",
    description:
      "Free UTM builder: create clean, correctly-encoded Google Analytics campaign URLs with source, medium, campaign, term and content. Live parameter table, copy or download. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Tag",
      title: "All five UTM dimensions in one form",
      description:
        "Set utm_source, utm_medium and utm_campaign (the trio GA4 needs) plus optional utm_term and utm_content: the builder emits only the parameters you fill in, in canonical order.",
    },
    {
      icon: "Table",
      title: "Live parameter table",
      description:
        "See each utm_* key resolve to its exact encoded value as you type, so you can verify the attribution the way Google Analytics will read it before you ever ship the link.",
    },
    {
      icon: "Wand2",
      title: "Consistency normalisation",
      description:
        "Optional lowercasing and space-to-underscore cleanup stop 'Facebook', 'facebook' and 'Face Book' from fragmenting into three channels and wrecking your campaign reports.",
    },
    {
      icon: "Link2",
      title: "Preserves existing query strings",
      description:
        "The browser's native URL engine merges your tags into the destination without clobbering parameters it already carries, your links stay intact, just tagged.",
    },
    {
      icon: "Sparkles",
      title: "Curated channel presets",
      description:
        "One click loads the common source/medium pairs (newsletter/email, Facebook/cpc, Google/organic, X/social) so you start from a correct template instead of a blank field.",
    },
    {
      icon: "Copy",
      title: "Copy, download, share, undo",
      description:
        "Copy the finished URL, download it as a text file, share a link that reopens the builder pre-filled, or step back and forth through undo/redo, all keyboard-driven.",
    },
  ],

  benefits: [
    {
      title: "Trustworthy campaign attribution",
      description:
        "Consistent, correctly-encoded tags mean every click lands in the right source, medium and campaign in GA4, so your channel reports actually reflect what drove the traffic.",
    },
    {
      title: "No more broken tracking links",
      description:
        "Hand-editing query strings drops ampersands, double-adds a '?', or leaves raw spaces. The builder assembles a valid, escaped URL every time so links don't 404 or lose their tags.",
    },
    {
      title: "Faster campaign setup",
      description:
        "Presets and a live table turn a fiddly, error-prone spreadsheet task into a few seconds of form-filling, whether you're tagging one launch email or a whole ad set.",
    },
    {
      title: "Private by design",
      description:
        "Every URL is built locally in your browser, so unpublished landing pages, internal campaign names and client links never leave your device or hit a server.",
    },
  ],

  howTo: [
    {
      title: "Paste your destination URL",
      description:
        "Enter the full landing-page URL you want to track, including its scheme (https://). Any parameters already on the URL are preserved when the UTM tags are added.",
    },
    {
      title: "Fill in source, medium and campaign",
      description:
        "Set utm_source (where the traffic comes from), utm_medium (the channel type) and utm_campaign (the campaign name). These three are required for Google Analytics attribution.",
    },
    {
      title: "Add term and content if you need them",
      description:
        "Use utm_term for the paid keyword and utm_content to distinguish two links in the same campaign (e.g. two buttons or an A/B variant). Leave them blank to omit them.",
    },
    {
      title: "Check the live URL and table",
      description:
        "Read the assembled tracking URL and the parameter breakdown to confirm the tags and encoding are exactly what you expect before you use the link.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the finished link to your clipboard, download it as a .txt file, or share a pre-filled builder link so a teammate can review or reuse the setup.",
    },
  ],

  formats: {
    input: ["Form fields", "URL"],
    output: ["URL", "Text"],
  },

  useCases: [
    {
      audience: "Marketer / growth",
      title: "Tag a newsletter or launch email",
      description:
        "Build a consistent utm_source=newsletter / utm_medium=email link for a campaign blast so every click is attributed to the right email in GA4, not lumped into 'direct'.",
    },
    {
      audience: "Paid-media / PPC specialist",
      title: "Track ad creatives and keywords",
      description:
        "Use utm_content to distinguish creatives and utm_term for target keywords across a Facebook or Google ad set, so you can compare performance link by link.",
    },
    {
      audience: "Social media manager",
      title: "Attribute traffic per platform and post",
      description:
        "Give each platform its own source and each post its own campaign so your social reporting shows which channel and which post actually drove sign-ups.",
    },
    {
      audience: "Agency / freelancer",
      title: "Standardise tagging across a client",
      description:
        "Lock in lowercase, underscore-normalised tags and share a pre-filled builder link so everyone on the account produces identical, non-fragmenting UTM conventions.",
    },
  ],

  troubleshooting: [
    {
      problem: "My link says it isn't a valid absolute URL.",
      solution:
        "The destination must be a complete URL with a scheme. Start it with https:// (or http://). A bare 'example.com/page' or a relative '/page' can't be tagged because the builder can't tell the host from the path.",
    },
    {
      problem: "My source shows up split into two in Google Analytics.",
      solution:
        "UTM values are case-sensitive, so 'Facebook' and 'facebook' report as different sources. Turn on the lowercase normalisation option and keep a single house style so a channel never fragments across reports.",
    },
    {
      problem: "My destination URL already had a ?utm_source on it.",
      solution:
        "The builder updates existing utm_* parameters in place rather than duplicating them, so the value you type wins. If you want to keep the URL's original tags, remove them from the field or clear that input before building.",
    },
    {
      problem: "Do I need utm_term and utm_content?",
      solution:
        "No: only source, medium and campaign are required for attribution. utm_term is conventionally the paid keyword and utm_content distinguishes two otherwise-identical links (A/B or two buttons). Leave them blank and the builder simply omits them.",
    },
  ],

  tips: [
    "Pick one house style (lowercase, underscores for spaces) and apply it to every tag so channels never fragment across your reports.",
    "Keep utm_medium to a small controlled set (email, cpc, social, organic, referral, affiliate) so GA4's default channel grouping classifies your traffic correctly.",
    "Put the descriptive detail in utm_campaign (e.g. 'summer_sale_2026') and reserve utm_content for distinguishing near-identical links in the same campaign.",
    "Never add UTM tags to internal links between pages of your own site. They overwrite the original session's source and corrupt your attribution.",
    "Save a shared, pre-filled builder link as your team's tagging template so newcomers start from the correct conventions instead of a blank form.",
  ],

  security:
    "Every campaign URL is assembled locally in your browser using its native URL engine and encoders: nothing you type is ever uploaded, stored or logged. Unpublished landing pages, internal campaign names and client links stay on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "What is a UTM parameter and what does each one mean?",
      answer:
        "UTM parameters are tags added to a URL's query string that tell Google Analytics where a visit came from. The five are utm_source (the specific referrer, e.g. newsletter or facebook), utm_medium (the channel type, e.g. email or cpc), utm_campaign (the campaign name), utm_term (usually the paid keyword) and utm_content (to distinguish two otherwise-identical links). This builder produces all five and omits any you leave blank.",
    },
    {
      question: "Which UTM parameters are actually required?",
      answer:
        "For Google Analytics to attribute a click, you need at least utm_source, utm_medium and utm_campaign: the builder treats those three as required and won't produce a link until they're filled in. utm_term and utm_content are optional and used for keyword and creative-level detail.",
    },
    {
      question: "Are UTM values case-sensitive?",
      answer:
        "Yes. 'Email' and 'email' are treated as two different mediums, and mixed casing is the single most common cause of fragmented, unreliable campaign reports. Adopt one convention (lowercase with underscores is the usual choice) and use the builder's normalisation option to enforce it automatically.",
    },
    {
      question: "Does the builder keep the query parameters my URL already has?",
      answer:
        "Yes. It uses the browser's native URL engine, so any existing query parameters on your destination are preserved and the utm_* tags are merged in alongside them. If the URL already contains a utm_* parameter, the value you enter updates it in place rather than duplicating it.",
    },
    {
      question: "Should I add UTM tags to links inside my own website?",
      answer:
        "No. UTM tags are for inbound links from outside your site (emails, ads, social, partners). Adding them to internal navigation restarts the session and overwrites the visitor's real source with your internal tag, which corrupts your attribution. Tag only the entry links that bring people in.",
    },
    {
      question: "What's the difference between utm_term and utm_content?",
      answer:
        "utm_term is conventionally the paid-search keyword you bid on, while utm_content is for distinguishing two links that would otherwise be identical, for example a text link versus a button in the same email, or the A and B versions of an ad. Both are optional. Use them when you need that extra layer of reporting granularity.",
    },
    {
      question: "Is my campaign data sent to a server?",
      answer:
        "No. All URL assembly, encoding and preview happen entirely in your browser with its native engine. Nothing you type is uploaded, stored or logged, so it's safe to build links for unpublished landing pages, confidential campaigns or internal client work, close the tab and every trace is gone.",
    },
    {
      question: "Can I use these links anywhere, not just Google Analytics?",
      answer:
        "Yes. UTM parameters are a plain query-string convention that most analytics platforms understand, and any tool that reads a URL's query string can pick them up. The builder just produces a correctly-encoded standard URL, so you can paste it into email, ads, social posts, QR codes or any link field.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, build UTM campaign URLs from source, medium, campaign, term and content with a live parameter table, existing-query preservation, copy/download/share and undo/redo.",
    },
    {
      date: "2026-06-24",
      change:
        "Added lowercase and space-to-underscore normalisation options and curated channel presets (newsletter, Facebook CPC, Google organic, X social).",
    },
    {
      date: "2026-06-30",
      change:
        "Added keyboard shortcuts with an in-tool helper and a per-parameter copy control in the parameter table.",
    },
  ],

  relatedTools: [
    "url-encoder",
    "url-decoder",
    "meta-tag-generator",
    "google-serp-preview",
    "json-formatter",
  ],
};

export default utmBuilder;
