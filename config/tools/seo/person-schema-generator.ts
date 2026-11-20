import type { Tool } from "@/types";

/**
 * Person Schema Generator, a dedicated, single-type structured-data builder for
 * the schema.org Person type. It produces valid JSON-LD for an individual
 * (author, founder, speaker, doctor, freelancer, public figure) from a focused
 * form: name, job title, employer (worksFor → Organization), contact details,
 * a bio and a repeatable list of sameAs profile URLs. It runs entirely on
 * `lib/seo-tools/schema.ts` in the browser, with a live required/recommended
 * validity check and a copy-ready `<script type="application/ld+json">` block.
 * Copy is unique to Person markup and written to rank for author/knowledge-panel
 * and E-E-A-T intent, distinct from the multi-type Schema Markup Generator hub.
 */
const personSchemaGenerator: Tool = {
  slug: "person-schema-generator",
  title: "Person Schema Generator",
  description:
    "Generate valid Person JSON-LD structured data (name, job title, employer, bio and sameAs profile links) with a live validity check and a copy-ready script tag. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "User",
  accent: "violet",
  status: "live",
  createdAt: "2026-06-20",

  h1: "Person Schema Generator, JSON-LD Structured Data for People & Authors",
  tagline:
    "Describe a person once (name, job title, employer, bio and their sameAs profile links) and get valid schema.org Person JSON-LD instantly. We check the properties Google leans on for author signals and knowledge panels, then hand you the exact <script> tag to paste. Nothing leaves your browser.",
  longDescription:
    "The GigAI Person Schema Generator builds schema.org Person markup as JSON-LD, the format Google recommends, so you can describe the human behind a page, an article author, a company founder, a conference speaker, a doctor, a freelancer or a public figure: in a way search engines actually parse. Rather than burying Person inside a generic schema builder, this tool focuses on exactly one type: a tailored form collects the name, job title, employer (emitted as a nested Organization via worksFor), a profile image, email, telephone, a short bio and an unlimited list of sameAs profile URLs, LinkedIn, X/Twitter, GitHub, Wikipedia, a personal site, an ORCID or a Crunchbase page. As you type, clean JSON-LD regenerates live with empty fields stripped, and a validity check grades your markup against the required name and the recommended properties that strengthen author identity and knowledge-panel eligibility. Person markup is a cornerstone of E-E-A-T: pairing an Article's author with a well-linked Person entity, and pointing sameAs at authoritative profiles, helps Google connect a byline to a real, reputable identity. When you are done, copy the ready-to-paste `<script type=\"application/ld+json\">` block, download the raw JSON, or share a link that reopens the tool pre-filled for a colleague. Because generation and validation run entirely on your device with the browser's own JSON engine, names, private emails, phone numbers and unpublished bios never leave your machine. There is nothing for us to store, log or see.",

  ctaText: "Generate Person schema",

  keywords: [
    "person schema generator",
    "person json-ld generator",
    "schema.org person markup",
    "author schema generator",
    "sameas schema generator",
    "structured data for authors",
    "person structured data",
    "worksfor schema",
    "e-e-a-t author markup",
    "json-ld person tool",
    "author json-ld",
  ],

  seo: {
    title:
      "Person Schema Generator, Free Person JSON-LD & Author Markup | GigAI Tools",
    description:
      "Free Person schema generator: build valid schema.org Person JSON-LD with name, job title, worksFor employer, bio and sameAs profile links. Live validity check, copy-ready script tag, 100% in your browser.",
  },

  features: [
    {
      icon: "User",
      title: "One focused Person form",
      description:
        "A single tailored form for the schema.org Person type (name, job title, employer, image, contact and bio) with no unrelated fields to wade through, unlike a generic schema builder.",
    },
    {
      icon: "Link2",
      title: "Unlimited sameAs profile links",
      description:
        "Add every profile that proves identity (LinkedIn, X/Twitter, GitHub, Wikipedia, ORCID, a personal site) as a repeatable list, and the tool recognises each platform so you can spot gaps at a glance.",
    },
    {
      icon: "Building2",
      title: "Employer as a nested Organization",
      description:
        "Type an employer once and worksFor is emitted as a proper nested Organization object, exactly the shape Google expects rather than a bare string.",
    },
    {
      icon: "ShieldCheck",
      title: "Live validity & E-E-A-T check",
      description:
        "Every field is graded against Person's required and recommended properties, so you instantly see whether your markup is complete enough to support author and knowledge-panel signals.",
    },
    {
      icon: "Sparkles",
      title: "Real-world presets",
      description:
        "Load a fully-populated example for common roles (article author, startup founder, freelancer, speaker) then swap in your own values field by field.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with the browser's native JSON engine on your device. Names, emails, phone numbers and bios are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Give your authors a real identity in Search",
      description:
        "A Person entity linked from your Article author, with sameAs pointing at authoritative profiles, helps Google connect a byline to a verifiable person, the backbone of credible E-E-A-T author signals.",
    },
    {
      title: "Support knowledge-panel eligibility",
      description:
        "Well-structured Person markup with name, job title, image and sameAs is one of the signals that can help a public figure or brand founder qualify for an entity in Google's knowledge graph.",
    },
    {
      title: "Ship valid markup without hand-writing JSON",
      description:
        "The live check flags a missing name as an error and thin sameAs coverage as a warning, so you fix problems in the tool instead of shipping structured data that silently does nothing.",
    },
    {
      title: "Safe for private contact details",
      description:
        "Because everything runs locally, you can build markup containing a private email, phone number or an unpublished bio without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Enter the person's core details",
      description:
        "Type the full name (the only required field), then add a job title, employer, profile image URL and a short bio. Load a preset first if you want a realistic starting point.",
    },
    {
      title: "Add sameAs profile links",
      description:
        "Paste every profile that identifies the person, LinkedIn, X/Twitter, GitHub, Wikipedia, ORCID, a personal site. The more authoritative and consistent the set, the stronger the identity signal.",
    },
    {
      title: "Read the validity check",
      description:
        "Watch the required/recommended report: green means valid, warnings point to recommended fields (like a job title, image or richer sameAs) that strengthen author signals.",
    },
    {
      title: "Copy the script tag & paste it",
      description:
        "Copy the `<script type=\"application/ld+json\">` block (or download the JSON) and paste it into the page that describes the person, usually an author bio, About or team page.",
    },
    {
      title: "Confirm in Google's Rich Results Test",
      description:
        "Run the same markup through Google's Rich Results Test or the Schema Markup Validator to confirm it parses cleanly before you publish.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "SEO specialist / content team",
      title: "Give every author an entity",
      description:
        "Generate Person markup for each byline and link it from your Article schema's author, so Google can attribute expertise consistently across the whole blog.",
    },
    {
      audience: "Founder / startup marketer",
      title: "Structure the founder & About page",
      description:
        "Build Person markup with job title, worksFor and sameAs for the leadership team so the company's key people are described as first-class entities.",
    },
    {
      audience: "Freelancer / consultant",
      title: "Mark up your personal site",
      description:
        "Describe yourself with a Person block (role, skills bio and every professional profile) to reinforce who you are across search and social.",
    },
    {
      audience: "Publisher / journalist",
      title: "Reinforce E-E-A-T for expert content",
      description:
        "Attach richly-linked Person markup to expert reviewers and staff writers so authoritative content carries verifiable authorship signals.",
    },
  ],

  troubleshooting: [
    {
      problem: "The check shows an error because the name is empty.",
      solution:
        "name is the only strictly required property for a Person. Enter the person's full name and the error clears: without it the markup describes nobody and won't be used.",
    },
    {
      problem: "It warns that sameAs is thin or missing.",
      solution:
        "sameAs is optional but it is the property that ties a Person to a verifiable identity. Add two or more authoritative profiles (LinkedIn, X, Wikipedia, GitHub, ORCID): coverage across trusted platforms is what makes the entity credible.",
    },
    {
      problem: "My employer shows up as plain text, not an Organization.",
      solution:
        "The generator automatically wraps the employer you type in a nested Organization object under worksFor, which is the correct schema.org shape. You don't need to format it yourself.",
    },
    {
      problem: "Google's test flags something this tool didn't.",
      solution:
        "This tool is a pragmatic linter for Person's required/recommended properties, not a full schema.org shape validator. Always confirm with Google's Rich Results Test, which layers Google-specific eligibility rules on top of valid JSON-LD.",
    },
  ],

  tips: [
    "Link the Person from where it's used: reference the same @id or URL from your Article's author so the byline and the entity are the same thing.",
    "Prioritise authoritative sameAs profiles, Wikipedia, LinkedIn, official brand and verified social accounts carry more identity weight than a random link list.",
    "Keep the job title specific ('Senior Cardiologist' beats 'Doctor'): precise roles read as stronger expertise signals.",
    "Use an absolute, publicly-reachable image URL for the person's photo. Relative paths and login-gated images can't be fetched by crawlers.",
    "Only mark up a real, named individual. Person is for people, not brands or products. Use Organization markup for the company itself.",
  ],

  security:
    "Your Person markup is generated and validated entirely in your browser using its native JSON engine: nothing is uploaded to any server. Names, private emails, phone numbers and unpublished bios are never stored, logged or transmitted, so you can safely build markup containing personal or non-public details. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is Person schema and when should I use it?",
      answer:
        "Person schema is schema.org structured data that describes an individual, their name, role, employer, image and the profiles that identify them. Use it for article authors, company founders and leadership, conference speakers, doctors and professionals, freelancers, and public figures. It helps search engines understand who a person is and connect them to the content they create.",
    },
    {
      question: "How does Person markup help SEO and E-E-A-T?",
      answer:
        "Google evaluates Experience, Expertise, Authoritativeness and Trust (E-E-A-T), and authorship is a big part of that. A Person entity linked from your Article's author, with sameAs pointing at authoritative profiles, helps Google connect a byline to a real, verifiable person with a track record: a signal that supports credibility, especially for expert and YMYL content.",
    },
    {
      question: "What is the sameAs property and what should I put in it?",
      answer:
        "sameAs is a list of URLs that point to the same person elsewhere on the web: LinkedIn, X/Twitter, GitHub, a Wikipedia page, an ORCID, a personal website, a Crunchbase profile. It's how you tell search engines 'this Person is the same identity as these accounts.' Prioritise authoritative, verified profiles. A strong, consistent sameAs set is one of the clearest identity signals you can provide.",
    },
    {
      question: "Will Person schema get me a knowledge panel?",
      answer:
        "No tool can guarantee a knowledge panel, Google decides based on entity notability, corroborating sources and its own rules. But complete Person markup (name, job title, image and a rich sameAs set) is one of the structured signals that can help a genuinely notable person or founder become an entity in Google's knowledge graph over time.",
    },
    {
      question: "How do I connect a Person to an article author?",
      answer:
        "In your Article/BlogPosting JSON-LD, set the author to a Person object (or reference one by @id/url) that matches this markup. The cleanest pattern is to give the Person a stable url or @id and reuse it as the author across every article they write, so Google sees one consistent identity rather than many disconnected bylines.",
    },
    {
      question: "Where do I put the generated script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the page that describes the person, typically an author bio page, an About page, a team page or a personal homepage. In a CMS, add it via a custom-HTML block, a theme template or a plugin field. The `<head>` or `<body>` both work for Google.",
    },
    {
      question: "Does Person markup produce a visible rich result?",
      answer:
        "Person on its own doesn't create a standalone rich snippet the way FAQ or Product can. Its value is as an identity and E-E-A-T signal, feeding author attribution, supporting knowledge-graph understanding and reinforcing who created a page, rather than changing how a single result looks in the SERP.",
    },
    {
      question: "Is my data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Names, emails, phone numbers and bios never leave your device. There is nothing for us to upload, store or log. It is safe to build markup containing private or unpublished personal details.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release: dedicated Person JSON-LD generator with name, job title, worksFor employer, image, contact and bio, a repeatable sameAs list, live required/recommended validity check, copy-ready script tag, download, presets, undo/redo and share links.",
    },
    {
      date: "2026-06-27",
      change:
        "Added platform recognition for sameAs links (LinkedIn, X, GitHub, Wikipedia, ORCID and more) and role-based presets for authors, founders, freelancers and speakers.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the validity report with an E-E-A-T oriented sameAs coverage hint and a minified-output toggle.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "organization-schema-generator",
    "article-schema-generator",
    "breadcrumb-schema-generator",
    "json-formatter",
  ],
};

export default personSchemaGenerator;
