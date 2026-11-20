import type { Tool } from "@/types";

/**
 * AI Schema Checker — deliberately a CHECKER, not a 14th schema generator.
 * The SEO Studio already has 13; this answers "which does THIS page need?"
 * and routes every gap to the existing generator.
 */
const aiSchemaChecker: Tool = {
  slug: "ai-schema-checker",
  title: "AI Schema Checker",
  description:
    "Audit a page's JSON-LD against the seven schema types AI retrieval leans on, verify each one's load-bearing properties, and get every gap routed to the GigAI generator that fills it. A checker, not another generator.",
  category: "geo-tools",
  group: "Generators",
  icon: "Braces",
  accent: "violet",
  status: "live",
  createdAt: "2026-08-22",
  serverSide: true,

  h1: "AI Schema Checker: Is Your Page's Identity Machine-Readable?",
  tagline:
    "Structured data is how a page states what it is instead of making a machine infer it. This checker reads your JSON-LD, audits it against the seven types that matter most for AI retrieval (Organization, WebSite, FAQPage, HowTo, SoftwareApplication, Article and BreadcrumbList) verifies each type actually carries its load-bearing properties, catches blocks that fail to parse at all, and links every gap to the free GigAI generator that fills it.",
  longDescription:
    "There are already thirteen schema generators in the GigAI SEO Studio, and building a fourteenth would help nobody. The question those generators can't answer is which of them this particular page needs, and whether the JSON-LD already on the page is doing its job or merely present. That's what this tool does. It parses every ld+json block (including @graph structures and arrays), counts blocks that fail to parse entirely (a silent failure that makes the whole block invisible, worse than having none) and then audits type by type. Organization and WebSite are treated as site-wide expectations: they're the entity anchors that let a retrieval system resolve a brand mention to one identity, so their absence is flagged as a real gap. FAQPage, HowTo, SoftwareApplication, Article and BreadcrumbList are content-conditional: their absence is informational, because schema describing content that isn't on the page is a liability rather than an asset, and the tool says so instead of nagging you to add everything. For types that are present, the required properties are checked (an Organization without a name or url, a FAQPage without mainEntity, a HowTo without steps) because an empty shell of the right type carries almost no signal. Every finding links to the specific existing generator that produces valid markup for it.",

  ctaText: "Check my schema",

  keywords: [
    "ai schema checker",
    "json-ld checker ai",
    "structured data for ai search",
    "schema for llm seo",
    "organization schema ai",
    "faqpage schema ai citation",
    "json-ld audit tool",
    "schema markup ai overviews",
    "entity schema checker",
    "structured data gaps",
  ],

  seo: {
    title: "AI Schema Checker: Audit JSON-LD for AI Search | GigAI Tools",
    description:
      "Free checker: audit your page's JSON-LD against the 7 schema types AI retrieval uses, verify required properties, catch unparseable blocks. Links every gap to its generator.",
  },

  features: [
    {
      icon: "ScanSearch",
      title: "Audits what's there, not just whether something is there",
      description:
        "Required properties are verified per type: an Organization without name or url, a FAQPage without mainEntity, a HowTo without steps, present but hollow is caught and named.",
    },
    {
      icon: "FileWarning",
      title: "Catches blocks that fail to parse",
      description:
        "Broken JSON is worse than no JSON: parsers skip the entire block silently. Unparseable ld+json is counted and flagged first, with a route to the JSON-LD Validator.",
    },
    {
      icon: "Building2",
      title: "Separates site identity from content types",
      description:
        "Organization and WebSite are flagged as genuine gaps. FAQPage, HowTo and friends are informational, because marking up content the page doesn't contain damages trust rather than helping.",
    },
    {
      icon: "Route",
      title: "Every gap routed to its generator",
      description:
        "No duplicate tooling: each missing type links to the existing GigAI generator that produces it. Organization, FAQ, Article, Breadcrumb, Software and the general Schema Generator.",
    },
    {
      icon: "Network",
      title: "Handles @graph and arrays",
      description:
        "Real-world pages nest types in @graph structures or emit arrays of blocks. Both are parsed and flattened before auditing, so nothing is missed on a WordPress or framework-generated page.",
    },
    {
      icon: "ShieldCheck",
      title: "Paste or fetch, always local",
      description:
        "Fetch a live URL through the stateless proxy or paste HTML for a staging page. Analysis runs entirely in your browser either way.",
    },
  ],

  benefits: [
    {
      title: "Know which schema you actually need",
      description:
        "Thirteen generators is a menu, not a plan. This turns 'which schema should we add?' into a specific, ordered answer for the page in front of you.",
    },
    {
      title: "Find the schema that's silently broken",
      description:
        "A single trailing comma makes a whole JSON-LD block invisible to every parser while looking perfectly fine in the page source. Unparseable blocks are the most common finding here.",
    },
    {
      title: "Avoid over-marking-up",
      description:
        "Adding FAQPage schema to a page with no FAQ risks a manual action and teaches retrieval to distrust you. This tool never pushes types the page doesn't warrant.",
    },
    {
      title: "Strengthen entity resolution",
      description:
        "Organization and WebSite markup is how a model connects a brand mention to a specific entity. Missing it makes every other signal work harder than it should.",
    },
  ],

  howTo: [
    {
      title: "Fetch a URL or paste the page HTML",
      description:
        "URL mode fetches statelessly. Paste mode works for staging and internal pages without anything leaving your browser.",
    },
    {
      title: "Check the validity section first",
      description:
        "Unparseable blocks are reported before anything else: fix those before adding new types, because they represent markup you already wrote that does nothing.",
    },
    {
      title: "Review site identity",
      description:
        "Organization and WebSite should be present sitewide. Missing either is a genuine gap that costs you entity resolution.",
    },
    {
      title: "Review content types",
      description:
        "Add FAQPage, HowTo, SoftwareApplication or Article only where the page genuinely contains that content. Each links to its generator.",
    },
    {
      title: "Generate, deploy, re-check",
      description:
        "Use the linked generator, paste the output into your head, then re-run to confirm the block parses and carries its required properties.",
    },
  ],

  formats: {
    input: ["URL", "HTML"],
    output: ["Report", "Share link"],
  },

  useCases: [
    {
      audience: "SEO specialist",
      title: "Audit schema per page, fast",
      description:
        "A site-wide schema strategy usually leaves individual pages with the wrong types. One fetch per page shows what's present, what's hollow and what's broken.",
    },
    {
      audience: "Developer",
      title: "Verify what your CMS actually emits",
      description:
        "Plugins and framework integrations generate JSON-LD from templates that drift. Checking the rendered output catches the block that stopped including its name field three releases ago.",
    },
    {
      audience: "Content lead",
      title: "Decide what markup a new page needs",
      description:
        "Before publishing a guide or comparison, see which types are warranted and which would be over-claiming.",
    },
    {
      audience: "Agency",
      title: "Turn a schema audit into a work order",
      description:
        "Each finding names a type, a reason and the generator that produces it: a client deliverable that converts directly into tasks.",
    },
  ],

  troubleshooting: [
    {
      problem: "The checker found no JSON-LD but I know my site has schema.",
      solution:
        "Two common causes. If your schema is injected by JavaScript (a tag manager or client-side plugin), it isn't in the raw HTML, which also means most AI crawlers never see it, so this is a real finding, not a false negative. Alternatively you may be using microdata or RDFa attributes instead of JSON-LD. This checker audits JSON-LD, which is the format Google and AI systems prefer.",
    },
    {
      problem: "It says a type is present but missing required properties.",
      solution:
        "The block exists with the right @type but lacks the fields that carry the actual meaning: an Organization with no name, a FAQPage with no mainEntity. Parsers accept it and learn nothing from it. Use the linked generator to produce a complete block.",
    },
    {
      problem: "Should I add every type it lists?",
      solution:
        "No, and the tool deliberately distinguishes. Organization and WebSite belong on every site. The content types belong only on pages that genuinely contain that content. Marking up an FAQ that doesn't exist on the page risks a manual action and undermines trust in your other markup.",
    },
    {
      problem: "My schema validates in Google's Rich Results Test but fails here.",
      solution:
        "Different questions. Google's test checks eligibility for specific rich results and renders JavaScript first. This checks the raw HTML (what non-rendering AI crawlers receive) against the types that matter for AI retrieval. A page can pass there and fail here precisely because the schema is client-injected.",
    },
  ],

  tips: [
    "Organization and WebSite schema belong in a sitewide template, not per-page: they're identity, not content.",
    "Only mark up content that's visibly on the page. Schema describing invisible content is the fastest route to a structured-data manual action.",
    "Emit JSON-LD server-side. Schema injected by a tag manager is invisible to crawlers that don't run JavaScript, which is most AI crawlers.",
    "sameAs links on your Organization block (LinkedIn, GitHub, Crunchbase, Wikipedia) are the cheapest entity-resolution signal there is: pair this with the Entity Consistency Checker.",
    "Re-check after any CMS or plugin update. Generated schema drifts silently and nothing alerts you when it does.",
  ],

  security:
    "Pasted HTML is parsed entirely in your browser and never uploaded. URL fetches use a stateless proxy that fetches, returns and stores nothing.",

  faq: [
    {
      question: "Does schema markup help with AI search?",
      answer:
        "It helps machines resolve what a page is and who published it without inference, which matters for entity resolution and for the search indexes AI answers retrieve through. It is not a magic citation lever: content quality and crawler access matter more. Treat schema as removing ambiguity rather than adding ranking power.",
    },
    {
      question: "Which schema types matter most for AI?",
      answer:
        "Organization and WebSite for identity. They anchor your brand as a resolvable entity. Then the content types that match what the page actually contains: FAQPage for question-answer content (the shape AI answers lift most directly), HowTo for procedures, SoftwareApplication for tools and apps, Article for editorial content with authorship and dates, BreadcrumbList for hierarchy that survives when only one page is retrieved.",
    },
    {
      question: "Why is this a checker instead of another generator?",
      answer:
        "Because GigAI already has thirteen schema generators and a fourteenth would add nothing. The unanswered question was which types a specific page needs and whether the markup it already has is complete and parseable. This tool answers that and hands you straight to the existing generator for anything missing.",
    },
    {
      question: "What happens if my JSON-LD has a syntax error?",
      answer:
        "The entire block is ignored: silently. No warning appears in your page, nothing breaks visually, and every parser skips it as if it were never there. That makes broken JSON-LD strictly worse than absent JSON-LD, which is why unparseable blocks are reported before anything else here.",
    },
    {
      question: "Can I add FAQPage schema to a page without a visible FAQ?",
      answer:
        "You shouldn't. Structured data is supposed to describe content the user can see. Marking up invisible or non-existent content violates search engines' guidelines and risks a manual action. It also teaches retrieval systems that your markup can't be trusted, which costs you on every other type.",
    },
    {
      question: "Does schema need to be server-rendered?",
      answer:
        "For AI crawlers, yes. Most don't execute JavaScript, so JSON-LD injected by a tag manager or a client-side component is invisible to them even though it works fine for Googlebot. If this checker finds no schema on a page you know has some, that mismatch is exactly the finding.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: JSON-LD extraction including @graph and arrays, unparseable-block detection, per-type required-property audit across seven AI-relevant types, site-identity vs content-type severity separation, and per-gap routing to the existing GigAI schema generators.",
    },
  ],

  relatedTools: [
    "geo-audit",
    "jsonld-validator",
    "schema-generator",
    "organization-schema-generator",
  ],

  notFor: [
    {
      text: "It doesn't generate schema markup. It identifies what's missing and links to the generator that makes it.",
      toolSlug: "schema-generator",
    },
    {
      text: "It doesn't validate JSON-LD syntax line by line. The JSON-LD Validator pinpoints syntax errors.",
      toolSlug: "jsonld-validator",
    },
  ],
};

export default aiSchemaChecker;
