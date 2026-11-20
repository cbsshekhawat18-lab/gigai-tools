import type { Tool } from "@/types";

/**
 * Retrieval Chunk Preview — the genuinely novel tool in the set. Nobody else
 * shows a page's chunks in isolation. It teaches the core GEO mental shift
 * better than any explainer: your page is read as fragments, not as a page.
 */
const retrievalChunkPreview: Tool = {
  slug: "retrieval-chunk-preview",
  title: "Retrieval Chunk Preview",
  description:
    "See your page the way a RAG system does: split into retrieval chunks and read one at a time, with no surrounding context. Flags every fragment that collapses alone: pronoun openers, 'as mentioned above', sections that never name their subject.",
  category: "geo-tools",
  group: "Content",
  icon: "Puzzle",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-08-22",
  serverSide: true,

  h1: "Retrieval Chunk Preview: Your Page Isn't Read as a Page",
  tagline:
    "When an AI answers using your site, it never sees your page. A retrieval system slices it into chunks and hands the model one fragment: without your heading hierarchy, without the paragraph before it, without the context that made it make sense. This tool performs that exact slicing and shows every chunk alone, flagging the ones that stop meaning anything the moment they're separated from the rest.",
  longDescription:
    "This is the single most useful thing you can look at to understand Generative Engine Optimization, and no other free tool shows it. Retrieval-augmented generation splits documents before it stores them: first by heading section, then (when a section exceeds the embedding window) into token windows of roughly 300 tokens with a small overlap. The model receiving your content sees one of those windows at a time. A paragraph that opens 'It also supports transparency, which is why designers prefer it' is perfectly clear on your page and completely meaningless as a retrieved chunk: there is no 'it', and the sentence names nothing. The preview reproduces the standard chunking (heading-first, then ~300-token windows with ~45-token overlap), renders each chunk in its own bordered card exactly as a model receives it, and flags four specific failure modes: opening with a pronoun that has no antecedent in the chunk, referencing text that isn't there ('as mentioned above', 'see below', 'as we discussed'), never naming a concrete subject at all, and being mostly navigation or link boilerplate. It also flags the chunks that lost their heading to window splitting (the ones arriving with zero context) which is why long sections are riskier than most writers realize. The output is a single blunt sentence: how many of your chunks would be incomprehensible if retrieved alone.",

  ctaText: "Preview my chunks",

  keywords: [
    "retrieval chunk preview",
    "rag chunking tool",
    "how ai chunks my page",
    "content chunking seo",
    "llm retrieval chunks",
    "self contained content ai",
    "rag content optimization",
    "chunk level seo",
    "ai reads page fragments",
    "semantic chunking checker",
  ],

  seo: {
    title: "Retrieval Chunk Preview: See Your Page as RAG Fragments | GigAI Tools",
    description:
      "Free tool: split any page the way a RAG system does and read every chunk in isolation. Flags pronoun openers, back-references and context-dependent fragments. In-browser.",
  },

  features: [
    {
      icon: "SquareSplitHorizontal",
      title: "Real RAG chunking, not a word-count split",
      description:
        "Heading sections first, then ~300-token windows with ~45-token overlap when a section runs long: the defaults mainstream retrieval pipelines actually use.",
    },
    {
      icon: "Eye",
      title: "Every chunk rendered in isolation",
      description:
        "Each fragment gets its own card with nothing around it, so you read it the way the model does. This is the part that changes how people write.",
    },
    {
      icon: "TriangleAlert",
      title: "Four specific failure modes, with the phrase quoted",
      description:
        "Pronoun openers with no antecedent, back-references to absent text, chunks that never name a subject, and link-heavy boilerplate. Each flagged with the exact words that triggered it.",
    },
    {
      icon: "Unlink",
      title: "Flags chunks that lost their heading",
      description:
        "Only the first window of a long section keeps its heading. Later windows arrive with zero context. The tool counts them, which is the strongest argument for shorter sections you'll ever see.",
    },
    {
      icon: "Gauge",
      title: "One blunt verdict",
      description:
        "\"4 of your 11 chunks would be incomprehensible if retrieved alone.\" No jargon, no dial to interpret: a number you can act on immediately.",
    },
    {
      icon: "ShieldCheck",
      title: "Drafts and internal docs stay private",
      description:
        "Chunking and judging run entirely in your browser. Paste unpublished content freely. Nothing is uploaded or stored.",
    },
  ],

  benefits: [
    {
      title: "Teaches the mental shift in ten seconds",
      description:
        "Reading your own paragraph stripped of its context does more to change your writing than any amount of GEO advice. That's the whole product.",
    },
    {
      title: "Finds the failures no proofreader catches",
      description:
        "Every flagged chunk reads perfectly well in place: that's precisely why these problems survive editing and only appear when the page is fragmented.",
    },
    {
      title: "Explains why some pages never get cited",
      description:
        "A page can be accurate, well-ranked and thoroughly ignored by AI because none of its fragments stand up alone. This shows that directly.",
    },
    {
      title: "Section-length guidance backed by evidence",
      description:
        "Instead of an arbitrary 'keep sections short' rule, you see exactly which of your sections got split and which fragments lost their heading.",
    },
  ],

  howTo: [
    {
      title: "Paste content or fetch a URL",
      description:
        "Markdown headings and full HTML both work. The tool uses your real heading structure to split the way a retrieval system would.",
    },
    {
      title: "Read the verdict line",
      description:
        "How many chunks the page produced, and how many of them fail when read alone.",
    },
    {
      title: "Scroll the chunk cards",
      description:
        "Read each one as if it were all you had. Failing chunks are outlined in red with their flags and the exact triggering phrase listed underneath.",
    },
    {
      title: "Fix the fragments, not the page",
      description:
        "Name the subject again instead of 'it'. Delete 'as mentioned above'. Split long sections so each window keeps a heading. Restate context at the start of each section.",
    },
    {
      title: "Re-run to confirm",
      description:
        "Paste the revision. The failing count should drop. Aim for zero on the pages you most want cited.",
    },
  ],

  formats: {
    input: ["URL", "TXT", "MD", "HTML"],
    output: ["Report", "Share link"],
  },

  useCases: [
    {
      audience: "Content writer",
      title: "See why your best paragraph gets ignored",
      description:
        "Chunk your strongest article. The paragraphs you're proudest of are often the ones that lean hardest on the sentence before them.",
    },
    {
      audience: "Documentation lead",
      title: "Make reference docs retrievable",
      description:
        "Docs are written assuming linear reading and retrieved non-linearly. Every 'as described above' in your docs is a broken chunk waiting to be served to a user.",
    },
    {
      audience: "SEO specialist",
      title: "Explain GEO to a client in one screenshot",
      description:
        "A red-flagged chunk card showing their own copy stripped of context communicates more than any deck. It's the most shareable artifact in the studio.",
    },
    {
      audience: "AI engineer",
      title: "Sanity-check content before ingesting it",
      description:
        "Building a RAG pipeline over a knowledge base? Preview how the source content chunks before you discover the problem in answer quality.",
    },
  ],

  troubleshooting: [
    {
      problem: "All my chunks fail and I don't understand why.",
      solution:
        "Read the flags on the first two or three cards: the pattern is usually a single habit repeated (pronoun openers, or a section that never restates its subject). Fixing that one habit typically clears most of the chunks at once.",
    },
    {
      problem: "A chunk is flagged 'too thin' but it's a deliberate short section.",
      solution:
        "Short is fine for a human skimming and weak for retrieval: under about 25 words there isn't enough to answer anything, so it will rarely be selected. Either merge it into a neighboring section or expand it into a complete standalone statement.",
    },
    {
      problem: "My chunks look different from what my RAG pipeline produces.",
      solution:
        "Chunking parameters vary by system (window size, overlap, whether headings are prepended). This uses common defaults (~300 tokens with ~45 overlap, heading-aware) so treat it as representative rather than byte-identical to any one vendor. The failure modes it flags are parameter-independent.",
    },
    {
      problem: "The tool says a chunk 'never names its subject' but the heading does.",
      solution:
        "Chunks that keep their heading are judged with it. If you're seeing that flag, the chunk is a later window from a long section. It lost the heading in splitting, which is exactly the risk the tool is surfacing. Shorten the section.",
    },
  ],

  tips: [
    "Write every section as if it will be read alone, because it will be. That single habit fixes most chunk failures before they exist.",
    "Restate the subject at the start of each section: 'WebP compresses…' beats 'It compresses…' even when the heading says WebP.",
    "Keep sections under roughly 300 tokens (about 220 words) so each one stays a single chunk and keeps its heading.",
    "Search your content for 'as mentioned', 'above', 'below', 'previously' and 'as we discussed'. Each hit is a chunk that will fail.",
    "Link lists and 'related posts' blocks become boilerplate chunks that compete with your real content for retrieval. Keep them out of the main content area.",
  ],

  security:
    "Chunking and judging happen entirely in your browser: pasted content is never uploaded, logged or stored. URL fetches use a stateless proxy that fetches, returns and discards.",

  faq: [
    {
      question: "How does AI actually read my page?",
      answer:
        "Not as a page. Retrieval-augmented systems split documents into chunks before storing them (typically by heading section, then into token windows of a few hundred tokens with a small overlap) and embed each chunk separately. When someone asks a question, the system retrieves the handful of chunks whose embeddings match and hands only those to the model. Your page's structure, your introduction and the paragraph above the retrieved one are all absent.",
    },
    {
      question: "What makes a chunk fail?",
      answer:
        "Four things, all invisible when reading the page normally: opening with a pronoun whose antecedent lives in a different chunk. Referencing text that isn't present ('as mentioned above', 'see the table below'). Never naming a concrete subject, so the chunk is about nothing identifiable, and being mostly navigation or link text rather than prose. Any of these makes the fragment unusable as an answer, no matter how good the page is.",
    },
    {
      question: "What chunk size do real systems use?",
      answer:
        "It varies, but a few hundred tokens with roughly 10–20% overlap is the mainstream default, and heading-aware splitting is common. This tool uses ~300 tokens with ~45 tokens of overlap. The exact numbers matter less than the consequence: sections longer than the window get split, and every window after the first loses its heading.",
    },
    {
      question: "Why does losing the heading matter so much?",
      answer:
        "Because the heading is usually the only place the subject is named. A second window from a long section arrives as unattributed prose: the model can't tell what product, page or topic it describes, so it's less likely to be retrieved and much less likely to be quoted safely. Keeping sections short enough to stay a single chunk is the cheapest fix in GEO.",
    },
    {
      question: "Is this the same as an SEO content audit?",
      answer:
        "No. An SEO audit evaluates the page as a document: keywords, structure, links, meta. This evaluates the page as a set of independent fragments, which is how retrieval treats it. Content can pass every SEO check and still produce chunks that mean nothing alone.",
    },
    {
      question: "Does fixing my chunks hurt readability for humans?",
      answer:
        "Generally no. It improves it. Naming subjects instead of using pronouns, avoiding 'as mentioned above' and keeping sections self-contained are standard technical-writing advice, because humans skim and jump too. The chunk view just makes the cost of ignoring that advice measurable.",
    },
    {
      question: "Can I use this on content for my own RAG system?",
      answer:
        "Yes, and it's a good pre-ingestion check. If a chunk is incomprehensible to you here, it will be incomprehensible to your model when retrieved, and you'll spend far longer debugging that as an answer-quality problem than as a content problem.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: heading-aware chunking with ~300-token windows and overlap, per-chunk isolation cards, four standalone-failure flags with quoted evidence, lost-heading detection for split sections, Markdown/HTML/URL input.",
    },
  ],

  relatedTools: [
    "content-citability-scorer",
    "answer-snippet-checker",
    "geo-audit",
    "js-rendering-checker",
  ],

  notFor: [
    {
      text: "It doesn't score content quality overall: the Citability Scorer measures fact density, quotability and sources.",
      toolSlug: "content-citability-scorer",
    },
    {
      text: "It isn't tied to one vendor's chunking parameters. It models the common defaults so the failure modes it finds apply broadly.",
    },
  ],
};

export default retrievalChunkPreview;
