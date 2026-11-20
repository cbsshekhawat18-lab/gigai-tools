import type { Tool } from "@/types";

/**
 * Campaign URL Builder: a superset of the classic UTM builder. It turns a
 * destination URL plus source / medium / campaign (and optional term, content
 * and any number of custom parameters) into a clean, correctly-encoded tracking
 * link, with channel presets (Google Ads, Meta, LinkedIn, email, newsletter,
 * QR…) that pre-fill the right source/medium pair and a saved-parameters store
 * for the extras your team always appends. A live parameter table, encode/lint
 * checks and one-click copy make it a genuine daily driver. Everything below is
 * unique to campaign/UTM tagging so the page ranks on its own merits rather than
 * competing with the URL-encoder, slug or meta tools.
 */
const campaignUrlBuilder: Tool = {
  slug: "campaign-url-builder",
  title: "Campaign URL Builder",
  description:
    "Build clean, correctly-encoded UTM & campaign tracking URLs with channel presets, custom parameters and a live parameter table, copy the ready-to-share link, 100% in your browser.",
  category: "seo-tools",
  group: "URL Tools",
  icon: "Megaphone",
  accent: "orange",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Campaign URL Builder, UTM & Tracking Link Generator",
  tagline:
    "Add utm_source, utm_medium and utm_campaign, plus any custom parameters your stack needs, to any link, with channel presets and a live, correctly-encoded parameter table, so every click lands in the right row of your analytics.",
  longDescription:
    "The GigAI Campaign URL Builder is a superset of the classic Google UTM builder. Start from a destination URL and add the five canonical UTM parameters (utm_source, utm_medium, utm_campaign, utm_term and utm_content) then go further: attach any number of custom parameters (gclid passthroughs, ad IDs, affiliate refs, ref, mc_cid, your own internal keys) that most builders don't support. Channel presets for Google Ads, Meta (Facebook/Instagram), LinkedIn, X, email, newsletters, affiliates and printed/QR codes pre-fill the correct source and medium pairs so your reports stay consistent across the whole team, and a saved-parameters store keeps the extras you always append one click away. As you type, a live parameter table shows every key and value exactly as it will appear in the URL, each value is percent-encoded with the browser's own encoder so spaces, ampersands and unicode never break the link or split into phantom rows, and lint checks flag the mistakes that quietly wreck attribution: a missing required field, MixedCase that fragments 'Email' and 'email' into two sources, or spaces that should be underscores. Existing query strings on your URL are preserved rather than clobbered. Copy the finished link, download a batch, or share a pre-filled builder link, and because it all runs locally, your unpublished landing pages, promo codes and campaign names never touch a server.",

  ctaText: "Build a campaign URL",

  keywords: [
    "campaign url builder",
    "url builder",
    "google campaign url builder",
    "utm parameter generator",
    "tracking url generator",
    "utm tag generator",
    "campaign tracking link",
    "custom url parameters",
    "ga4 campaign url",
  ],

  seo: {
    title: "Campaign URL Builder: UTM & Tracking Link Generator | GigAI Tools",
    description:
      "Free campaign URL builder: add UTM and custom parameters to any link with channel presets, a live parameter table and correct encoding. Copy the tracking URL: nothing is uploaded.",
  },

  features: [
    {
      icon: "Megaphone",
      title: "Full UTM + custom parameters",
      description:
        "All five canonical UTMs (source, medium, campaign, term, content) plus unlimited custom key/value pairs: gclid, ad IDs, ref, affiliate tags or your own internal keys most builders can't add.",
    },
    {
      icon: "LayoutGrid",
      title: "Channel presets",
      description:
        "One click sets the right source/medium for Google Ads, Meta, LinkedIn, X, email, newsletters, affiliates or QR codes, so your team's reports stay consistent instead of a mess of near-duplicates.",
    },
    {
      icon: "Bookmark",
      title: "Saved parameters",
      description:
        "Store the extra parameters you always append (a fixed ref, a partner ID, a version tag) and drop them into any link with a single click. No retyping, no typos.",
    },
    {
      icon: "Table",
      title: "Live parameter table",
      description:
        "See every key and value exactly as it lands in the URL, correctly percent-encoded, as you type, so a stray space or ampersand can't silently split into a phantom row or break attribution.",
    },
    {
      icon: "ShieldCheck",
      title: "Lint checks that protect attribution",
      description:
        "Warnings catch a missing required field, MixedCase that fragments one source into two, and spaces that should be underscores, the quiet mistakes that scatter your campaign across a dozen rows.",
    },
    {
      icon: "Copy",
      title: "Copy, download, share, undo",
      description:
        "Copy the finished link, download it, share a pre-filled builder link a teammate can open, load a preset, or step through undo/redo, all keyboard-driven and 100% local.",
    },
  ],

  benefits: [
    {
      title: "Attribution you can actually trust",
      description:
        "Consistent, lint-checked tags mean one campaign shows up as one clean row in GA4 or your analytics. Not scattered across 'Email', 'email' and 'e-mail' variants that hide your real numbers.",
    },
    {
      title: "Go beyond plain UTM",
      description:
        "Add the gclid passthroughs, affiliate refs and internal keys real campaigns need, alongside the standard five UTMs, without hand-assembling and re-encoding query strings by hand.",
    },
    {
      title: "Standardise your whole team",
      description:
        "Channel presets and saved parameters encode your naming convention, so every marketer produces links the same way and your reports don't need cleanup before anyone can read them.",
    },
    {
      title: "Private by design",
      description:
        "Every link is built locally in your browser, so unpublished landing pages, promo codes and confidential campaign names never leave your machine or hit a server.",
    },
  ],

  howTo: [
    {
      title: "Paste your destination URL",
      description:
        "Enter the full landing-page URL, including https://. Any existing query parameters are preserved, not overwritten, so deep links keep working.",
    },
    {
      title: "Pick a channel preset (or fill it in)",
      description:
        "Choose Google Ads, Meta, email, newsletter, QR and more to pre-fill the correct source and medium, then set your campaign name and any term/content values.",
    },
    {
      title: "Add custom or saved parameters",
      description:
        "Append any extra key/value pairs your stack needs, and save the ones you reuse so they're one click away next time.",
    },
    {
      title: "Check the parameter table",
      description:
        "Confirm every key and encoded value in the live table and clear any lint warnings so your tags stay clean and consistent.",
    },
    {
      title: "Copy or share the link",
      description:
        "Copy the finished tracking URL, download it, or share a pre-filled builder link so a teammate can review or tweak it.",
    },
  ],

  formats: {
    input: ["URL", "Form fields"],
    output: ["URL", "Tracking link"],
  },

  useCases: [
    {
      audience: "Performance marketer",
      title: "Tag a paid campaign consistently",
      description:
        "Use the Google Ads or Meta preset so every ad link carries the same source/medium and a clean campaign name, keeping paid traffic tidy and comparable in GA4.",
    },
    {
      audience: "Email / lifecycle marketer",
      title: "Track a newsletter blast",
      description:
        "Pick the newsletter preset, set utm_campaign per send, and add a saved content parameter per link block so you can see which CTA in the email actually drove clicks.",
    },
    {
      audience: "Growth / analytics lead",
      title: "Enforce a naming convention",
      description:
        "Encode your team's tagging rules as presets and saved parameters so every link follows the same scheme, eliminating the case and spacing drift that fragments reports.",
    },
    {
      audience: "Agency / freelancer",
      title: "Hand a client ready-to-use links",
      description:
        "Produce clean, correctly-encoded tracking URLs across channels and share a pre-filled builder link so the client can generate consistent links themselves.",
    },
  ],

  troubleshooting: [
    {
      problem: "My campaign shows up as several different sources in analytics.",
      solution:
        "UTM values are case-sensitive: 'Email', 'email' and 'e-mail' are three different sources to GA. Pick one lowercase convention (the presets do this for you) and reuse it everywhere. The lint check flags MixedCase before you copy the link.",
    },
    {
      problem: "My existing query parameters disappeared after tagging.",
      solution:
        "They shouldn't: the builder preserves any parameters already on your URL and only adds or updates the UTM/custom keys. If a value looks off, check that your original URL was a valid absolute link starting with https://.",
    },
    {
      problem: "The link has %20 or %26 in it. Is that broken?",
      solution:
        "No. Those are correct percent-encodings for a space (%20) and an ampersand (%26). Encoding is what keeps a value with spaces or symbols from splitting into extra parameters. The link works and analytics decodes it back to the readable value.",
    },
    {
      problem: "Should I put the campaign name in the URL path or in a UTM?",
      solution:
        "Use utm_campaign, not the path. Changing the path points at a different page (or a 404). UTM parameters ride along on the same destination URL and are read by analytics without affecting which page loads.",
    },
  ],

  tips: [
    "Keep every UTM value lowercase and use underscores instead of spaces ('spring_sale', not 'Spring Sale') so one campaign stays one row.",
    "Reserve utm_medium for the broad channel (cpc, email, social, affiliate) and utm_source for the specific vendor (google, newsletter, partner-name).",
    "Only tag external links you don't control the referrer for. Never tag internal links between your own pages, or you'll overwrite the original session source.",
    "Save the parameters you append on every link (a fixed ref or partner ID) so they're one click away and never mistyped.",
    "Document your naming convention once and encode it as presets so the whole team produces identical tags without thinking about it.",
  ],

  security:
    "Every campaign link is assembled and encoded locally in your browser using its native URL API. Nothing you type is ever uploaded, stored or logged. Unpublished landing pages, promo codes and confidential campaign names stay on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "What is a UTM parameter and do I need all five?",
      answer:
        "UTM parameters are tags appended to a URL that tell analytics where a click came from. Three are required for tracking to work: utm_source (the specific referrer, e.g. newsletter), utm_medium (the channel, e.g. email) and utm_campaign (the initiative, e.g. spring_sale). utm_term and utm_content are optional: term is mainly for paid search keywords, content for A/B distinguishing two links in the same campaign. This builder requires the first three and lets you add the rest as needed.",
    },
    {
      question: "How is this different from Google's Campaign URL Builder?",
      answer:
        "It's a superset. You get the five standard UTMs plus unlimited custom parameters (gclid passthroughs, ad IDs, affiliate refs, internal keys) that Google's tool can't add, channel presets that pre-fill the right source/medium pairs, a saved-parameters store, a live encoded parameter table, and lint checks that catch the case and spacing mistakes that fragment your reports. It also preserves any existing query parameters on your URL and runs entirely offline.",
    },
    {
      question: "Are UTM parameters case-sensitive?",
      answer:
        "Yes, and this trips up almost everyone. To analytics, 'Email' and 'email' are two separate sources, so mixing cases scatters one campaign across several rows and undercounts everything. Pick a single lowercase convention and stick to it, the presets enforce lowercase automatically, and the lint check warns you when a value uses mixed case before you copy the link.",
    },
    {
      question: "Will tagging my URL break existing query parameters?",
      answer:
        "No. The builder parses your destination URL, keeps every parameter that's already there, and only adds or updates the UTM and custom keys you specify. So a deep link like ?variant=blue&size=m keeps working and simply gains your tracking parameters alongside it.",
    },
    {
      question: "Can I add parameters that aren't UTMs, like gclid or a ref?",
      answer:
        "Yes, that's the point of the custom-parameters section. Add any key/value pairs your stack needs (ref, gclid, mc_cid, partner IDs, internal flags) and they're encoded and appended just like the UTMs. Save the ones you reuse so they're a single click next time.",
    },
    {
      question: "Should I tag internal links between my own pages?",
      answer:
        "No. Tagging an internal link resets the visitor's session and overwrites the original traffic source, so it looks like they came from your own site rather than the real channel. Only tag external links (ads, emails, social posts, partner placements) where you want to attribute the incoming click.",
    },
    {
      question: "Why are there % signs in my finished link?",
      answer:
        "Those are percent-encodings, which is correct and necessary. A space becomes %20 and an ampersand becomes %26 so that a value containing spaces or symbols doesn't accidentally split into extra parameters. Analytics decodes them back to the readable value automatically, so the link works exactly as intended.",
    },
    {
      question: "Is anything I enter sent to a server?",
      answer:
        "No. All URL parsing, encoding and link building happen entirely in your browser with its native URL API. Nothing you type is uploaded, stored or logged, so it's safe to build links for unpublished pages, private promo codes or confidential campaigns, close the tab and every trace is gone.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: UTM builder with all five parameters, channel presets, a live encoded parameter table, copy/download/share and undo/redo.",
    },
    {
      date: "2026-06-24",
      change:
        "Added unlimited custom parameters, a saved-parameters store, and lint checks for MixedCase values, spaces and missing required fields.",
    },
    {
      date: "2026-06-30",
      change:
        "Added keyboard shortcuts, existing-query-string preservation, and refined channel presets (added QR/print, affiliate and X).",
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

export default campaignUrlBuilder;
