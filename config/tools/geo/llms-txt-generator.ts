import type { Tool } from "@/types";

/**
 * llms.txt Generator — deliberately the contrarian page in the studio. Google
 * has said its AI search doesn't use llms.txt; saying so plainly while still
 * shipping a good generator is the honest-broker position that earns citation.
 */
const llmsTxtGenerator: Tool = {
  slug: "llms-txt-generator",
  title: "llms.txt Generator",
  description:
    "Generate a spec-shaped llms.txt from your sitemap or URL list, with an honest answer to the question every other generator dodges: Google has said its AI search doesn't use llms.txt. Here's who it actually helps, and a good file in ten seconds if you want one.",
  category: "geo-tools",
  group: "Generators",
  icon: "FileText",
  accent: "sky",
  status: "live",
  createdAt: "2026-08-22",

  h1: "llms.txt Generator (And an Honest Answer About Whether It Does Anything)",
  tagline:
    "Paste your sitemap.xml or a list of URLs and get a valid, well-structured llms.txt in seconds: an H1, a one-line summary blockquote, and your pages grouped into readable sections. But first, the thing most llms.txt tools won't tell you: Google stated in 2026 that llms.txt is not used by its AI search, and there is no public evidence that OpenAI, Anthropic or Perplexity read it for ranking either. It's cheap and harmless, some agents do fetch it, and it is not the lever it's marketed as.",
  longDescription:
    "llms.txt is a proposed convention: a Markdown file at your domain root that gives language models a curated map of your site, a name, a one-sentence summary, and grouped links with short notes. The idea is sensible and the format is pleasant. The marketing around it has run far ahead of the evidence. Google has publicly said llms.txt plays no role in its AI search systems. None of the major AI companies have documented using it as a ranking or retrieval input, and the sites that rank well in AI answers overwhelmingly do so without one. What llms.txt genuinely does help with: agents and tools that fetch it deliberately (some coding assistants, some documentation crawlers, some internal RAG pipelines pointed at your docs), and your own clarity, the exercise of writing one sentence describing your site and picking the twenty pages that matter is worth doing regardless of who reads the output. So this generator does the job properly and tells you the truth on the same page. Paste a sitemap and it parses the XML, groups URLs by first path segment into readable sections, humanizes the slugs into titles, and caps each section so a 300-URL sitemap becomes a file a model would actually read rather than a wall of links. Write your summary, and you have a correct file. Ship it if you want the coverage. Just don't expect it to move rankings, and be suspicious of anyone who tells you it will.",

  ctaText: "Generate llms.txt",

  keywords: [
    "llms.txt generator",
    "llms txt file",
    "does llms.txt work",
    "llms.txt seo",
    "create llms.txt",
    "llms.txt example",
    "llmstxt spec",
    "llms full txt",
    "ai crawler file",
    "llms.txt google",
  ],

  seo: {
    title: "llms.txt Generator + An Honest Answer On Whether It Works | GigAI Tools",
    description:
      "Free llms.txt generator from your sitemap or URL list: plus the truth: Google says its AI search doesn't use llms.txt. Who it actually helps, and a valid file in seconds.",
  },

  features: [
    {
      icon: "ScrollText",
      title: "Honest guidance on the page itself",
      description:
        "What the evidence supports and what it doesn't, stated plainly next to the generator. You'll leave knowing whether you actually need this file: including if the answer is no.",
    },
    {
      icon: "FileCode2",
      title: "Paste sitemap.xml directly",
      description:
        "The XML is parsed automatically: no converting to a list first. Plain URL lists work too, one per line.",
    },
    {
      icon: "FolderTree",
      title: "Automatic sectioning",
      description:
        "URLs are grouped by first path segment (/docs, /blog, /guides) with slugs humanized into titles, so a large sitemap becomes a readable document instead of a link dump.",
    },
    {
      icon: "Ruler",
      title: "Spec-shaped output",
      description:
        "H1 name, blockquote summary, optional detail paragraph, then H2 sections of `- [title](url): note` links, matching the llmstxt.org convention.",
    },
    {
      icon: "Scissors",
      title: "Sensible caps",
      description:
        "Sections are capped at 25 links so the file stays within the length a model will actually consume. A 300-URL sitemap becomes a curated map, not a sitemap in Markdown.",
    },
    {
      icon: "ShieldCheck",
      title: "Entirely in your browser",
      description:
        "Your sitemap and URLs never leave your device. The file is generated locally and downloaded directly.",
    },
  ],

  benefits: [
    {
      title: "Decide with the evidence, not the hype",
      description:
        "Most llms.txt content is written by people selling llms.txt services. Knowing that Google has ruled it out for AI search saves you from treating a nice-to-have as a priority.",
    },
    {
      title: "Get the real benefit cheaply",
      description:
        "If you want the coverage for agents that do fetch it, the cost should be five minutes, not a project. Paste, write one sentence, download.",
    },
    {
      title: "The exercise clarifies your site",
      description:
        "Summarizing your site in one sentence and choosing the twenty pages that matter is genuinely useful thinking, and it feeds directly into your meta descriptions and entity consistency.",
    },
    {
      title: "A file you won't be embarrassed by",
      description:
        "Auto-generated llms.txt files that dump every URL unsectioned are worse than none. Grouping and caps produce something a model could actually use.",
    },
  ],

  howTo: [
    {
      title: "Enter your site name and one-line summary",
      description:
        "The summary becomes the blockquote: the single line an agent reads first. Say what the site is and who it's for, concretely.",
    },
    {
      title: "Paste your sitemap.xml or URL list",
      description:
        "Raw XML is detected and parsed automatically. Plain URLs work one per line. Everything stays in your browser.",
    },
    {
      title: "Review the generated sections",
      description:
        "URLs are grouped by path segment with humanized titles. Edit your inputs until the grouping reflects how you'd describe the site.",
    },
    {
      title: "Download and deploy",
      description:
        "Place it at https://yourdomain.com/llms.txt. It's a static Markdown file: no server logic required.",
    },
    {
      title: "Keep expectations calibrated",
      description:
        "Don't measure this file's impact on rankings. There's no evidence to expect any. Spend the effort you saved on crawler access, rendering and citable content.",
    },
  ],

  formats: {
    input: ["XML", "URL list", "TXT"],
    output: ["llms.txt", "MD"],
  },

  useCases: [
    {
      audience: "Documentation site owner",
      title: "The case where it genuinely helps",
      description:
        "Coding assistants and doc-focused agents do fetch llms.txt when pointed at a docs domain. If your product has developer docs, this is the strongest real use case.",
    },
    {
      audience: "SEO specialist",
      title: "Answer the client question with evidence",
      description:
        "\"Do we need llms.txt?\" comes up in every AI-SEO conversation. Now you have a sourced answer and a five-minute implementation if they want it anyway.",
    },
    {
      audience: "Developer",
      title: "Generate rather than hand-write",
      description:
        "Turning a sitemap into grouped Markdown by hand is tedious and gets stale. Regenerate in seconds whenever the sitemap changes.",
    },
    {
      audience: "Internal RAG builder",
      title: "A curated entry point for your own pipeline",
      description:
        "If you're building retrieval over your own site, llms.txt is a decent hand-curated index of what matters: regardless of what external crawlers do with it.",
    },
  ],

  troubleshooting: [
    {
      problem: "I added llms.txt and nothing changed.",
      solution:
        "That's the expected outcome, and it's why this page says so up front. Google has stated its AI search doesn't use the file, and no major AI operator documents it as a ranking input. If AI visibility is the goal, crawler access, JavaScript-free rendering and citable content are where the measurable gains are: run the GEO Audit for a prioritized list.",
    },
    {
      problem: "My sitemap didn't parse.",
      solution:
        "Paste the raw XML contents (view-source of sitemap.xml), not the sitemap URL. If yours is a sitemap index pointing to child sitemaps, paste one child sitemap's contents: the index only contains links to other files, not page URLs.",
    },
    {
      problem: "The generated sections don't match how I think about my site.",
      solution:
        "Grouping follows your URL structure, so the output is a mirror of your information architecture. If the grouping looks wrong, that's worth noticing about the site itself. For full control, paste a hand-picked URL list instead of the whole sitemap.",
    },
    {
      problem: "Should I include every page?",
      solution:
        "No. The point of llms.txt is curation: a map, not an index. You already have a sitemap for completeness. Include the pages you'd show someone who asked what your site is. The 25-per-section cap enforces that discipline.",
    },
  ],

  tips: [
    "Write the summary line as if answering \"what is this site?\" in one sentence to a stranger. That line does more work than the entire link list.",
    "Keep it short. A curated 30-link file is more useful to a model than a 300-link dump, and far more likely to be read in full.",
    "There's a proposed llms-full.txt convention that inlines whole page contents. It's even less established: do the basic file first, if at all.",
    "Add notes after links (`- [Setup guide](/docs/setup): install and configure in 5 minutes`), the note is where the useful signal is.",
    "Deploy it as a plain static file at the domain root. No headers, no negotiation, no dynamic generation needed.",
  ],

  security:
    "Generation happens entirely in your browser. Your sitemap, URLs and descriptions are never uploaded, logged or stored: the download comes straight from your own device.",

  faq: [
    {
      question: "Does llms.txt actually do anything?",
      answer:
        "Less than its marketing suggests. Google stated in 2026 that llms.txt is not used by its AI search systems, and neither OpenAI, Anthropic nor Perplexity documents it as a retrieval or ranking input. What does read it: some agents and developer tools that fetch it deliberately, and internal RAG pipelines pointed at documentation. It's cheap, harmless and occasionally useful: just not a ranking lever.",
    },
    {
      question: "Should I create one anyway?",
      answer:
        "If it takes five minutes, sure: the downside is zero and the agent-coverage case is real, particularly for documentation sites. What you shouldn't do is prioritize it over crawler access, JavaScript-free rendering or citable content, all of which have direct, measurable effects on whether AI systems can use your site at all.",
    },
    {
      question: "What is llms.txt supposed to be?",
      answer:
        "A Markdown file at your domain root proposed by the llmstxt.org convention: an H1 with your site name, a blockquote summarizing what the site is, an optional detail paragraph, and H2 sections containing links with short notes. Think of it as a curated map for a machine reader: the opposite of a sitemap, which aims for completeness.",
    },
    {
      question: "How is llms.txt different from robots.txt?",
      answer:
        "Completely different jobs and completely different standing. Robots.txt is a decades-old standard (RFC 9309) that all major crawlers obey and that genuinely controls access: blocking GPTBot there stops it crawling. Llms.txt is a young convention that suggests content and grants nothing. Ignoring it has no consequence. If you only do one, do robots.txt properly.",
    },
    {
      question: "Where do I put the file?",
      answer:
        "At your domain root: https://yourdomain.com/llms.txt, served as a static file with a text or Markdown content type. Each subdomain would need its own, exactly like robots.txt.",
    },
    {
      question: "Why does this tool tell me its own output might not matter?",
      answer:
        "Because being the tool that tells you the truth is worth more than the pageview from pretending. The whole GEO Studio is built on showing the evidence behind every claim: a generator that hyped llms.txt while our citability scorer publishes its formulas would be incoherent. Take the file if you want it. Take the honesty either way.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: sitemap.xml auto-parsing, URL-list input, automatic sectioning by path segment with humanized titles, 25-link section caps, spec-shaped Markdown output, and on-page honest guidance about llms.txt's actual standing.",
    },
  ],

  relatedTools: [
    "ai-crawler-access-checker",
    "geo-audit",
    "xml-sitemap-generator",
    "ai-schema-checker",
  ],

  notFor: [
    {
      text: "It won't improve your rankings in AI search. Google has said llms.txt isn't used there, and this page says so rather than selling you the opposite.",
    },
    {
      text: "It doesn't generate an XML sitemap. Use the XML Sitemap Generator for the file crawlers actually depend on.",
      toolSlug: "xml-sitemap-generator",
    },
  ],
};

export default llmsTxtGenerator;
