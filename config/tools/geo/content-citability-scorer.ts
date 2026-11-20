import type { Tool } from "@/types";

/**
 * Content Citability Scorer — the credibility differentiator of the studio.
 * Scores on the published GEO-study factors and SHOWS the arithmetic for every
 * sub-score. The category is full of black-box scores; this one isn't.
 */
const contentCitabilityScorer: Tool = {
  slug: "content-citability-scorer",
  title: "Content Citability Scorer",
  description:
    "Score any page or draft on the factors a published study (KDD 2024) measured as increasing AI citation: fact density, source citations, quotability, answer-first openings, question headings and self-containment. Every sub-score shows its formula and what it counted.",
  category: "geo-tools",
  group: "Content",
  icon: "Quote",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-08-22",
  serverSide: true,

  h1: "Content Citability Scorer: Would an AI Actually Quote This?",
  tagline:
    "Paste content or fetch a URL and get six sub-scores for the factors that measurably increase how often generative engines cite a source. Three come from the peer-reviewed GEO study (Aggarwal et al., KDD 2024) that tested content edits across 10,000 queries. Three come from how retrieval systems select passages. Every single sub-score displays its formula, the numbers it counted and the evidence it counted them from, because a score you can't check is a score you can't act on.",
  longDescription:
    "The AI-visibility category has a credibility problem: dozens of tools output a confident number with no stated basis, which makes the number useless the moment you disagree with it. This scorer takes the opposite approach. Fact density is statistics per 100 words, and it lists the statistics it found. Quotability is the share of sentences that are complete, standalone, liftable claims of 8–40 words, and it shows you three of them. Source citations counts outbound reference links per 500 words. Those three factors aren't invented: the GEO study from Princeton, Georgia Tech, IIT Delhi and the Allen Institute measured which content edits actually increased visibility in generative-engine answers, and adding statistics, quotations and cited sources were the top performers. The other three sub-scores are structural, reflecting how retrieval works rather than what the study measured: whether the page opens with a direct answer in 40 words or fewer, whether section headings are phrased the way people ask questions, and whether sections stand alone instead of leaning on 'as mentioned above'. Each sub-score carries a weight, the overall is their weighted mean, and the whole calculation is printed on the page. Paste plain prose, Markdown or full HTML, or fetch a live URL: analysis runs in your browser either way.",

  ctaText: "Score my content",

  keywords: [
    "content citability score",
    "ai citation optimization",
    "geo content score",
    "will ai cite my content",
    "generative engine optimization content",
    "llm content optimization checker",
    "ai seo content analysis",
    "fact density checker",
    "quotability score",
    "geo study factors",
  ],

  seo: {
    title: "Content Citability Scorer: Will AI Cite Your Page? | GigAI Tools",
    description:
      "Free scorer using published GEO-study factors: fact density, citations, quotability, answer-first openings, question headings, self-containment. Every formula shown. No signup.",
  },

  features: [
    {
      icon: "FlaskConical",
      title: "Grounded in a published study, cited on the page",
      description:
        "Three sub-scores implement factors the KDD 2024 GEO paper measured across 10,000 queries. The paper is linked from every row that uses it, so you can read the source rather than trust the tool.",
    },
    {
      icon: "Sigma",
      title: "The formula, printed next to the score",
      description:
        "\"Statistics per 100 words ÷ 2 × 100, capped at 100\". Every sub-score states its arithmetic, its target and the raw counts it used. Nothing is hidden behind a proprietary model.",
    },
    {
      icon: "ListChecks",
      title: "Counted evidence, not adjectives",
      description:
        "It shows the statistics it found, the quotable sentences it identified, the sections that failed self-containment and the exact phrase that failed them.",
    },
    {
      icon: "Target",
      title: "Advice tied to the specific gap",
      description:
        "Below-target rows explain what to change and why that change is the one the evidence supports, not generic 'write better content' filler.",
    },
    {
      icon: "FileText",
      title: "Prose, Markdown or full HTML",
      description:
        "Paste a draft before publishing, or fetch a live URL to score heading structure and outbound citations too. The tool says plainly which factors it can't measure in plain-text mode.",
    },
    {
      icon: "ShieldCheck",
      title: "Unpublished drafts stay private",
      description:
        "Scoring runs entirely in your browser. Nothing you paste is uploaded, logged or stored, so embargoed and internal content is safe to test.",
    },
  ],

  benefits: [
    {
      title: "Edit with a target instead of a feeling",
      description:
        "\"Add statistics\" is advice. \"You have 0.4 statistics per 100 words, target is 2\" is a task. The counted numbers convert vague optimization into a finite editing job.",
    },
    {
      title: "A score you can defend to a client",
      description:
        "When someone asks why the score is 61, you can show the six formulas and the counted inputs. Black-box scores collapse under that question. This one is designed for it.",
    },
    {
      title: "Catch the writing habits that kill retrieval",
      description:
        "Throat-clearing intros, label-style headings and 'as mentioned above' feel like normal prose and are quietly fatal once a page is read as isolated fragments.",
    },
    {
      title: "Score before you publish",
      description:
        "The highest-leverage moment is the draft. Paste it, fix the two lowest sub-scores, ship a page that was citable on day one.",
    },
  ],

  howTo: [
    {
      title: "Paste content or fetch a URL",
      description:
        "Plain prose, Markdown or full page HTML all work. Fetching a URL enables the outbound-citation and heading factors, which plain text can't provide.",
    },
    {
      title: "Read the overall score and its verdict",
      description:
        "A weighted mean of six sub-scores, with a one-line summary of what the number means in practice.",
    },
    {
      title: "Open each sub-score",
      description:
        "Every row shows its formula, its counted inputs and its evidence. Start with the lowest-scoring row that carries the highest weight.",
    },
    {
      title: "Apply the specific advice",
      description:
        "Add real numbers, link the sources you're paraphrasing, rewrite the opening to answer in 40 words, name the subject instead of writing 'it'.",
    },
    {
      title: "Re-score the edit",
      description:
        "Paste the revision. The sub-scores move as the counts move, so you can see exactly what your edit bought.",
    },
  ],

  formats: {
    input: ["URL", "TXT", "MD", "HTML"],
    output: ["Report", "Share link"],
  },

  useCases: [
    {
      audience: "Content writer",
      title: "Make a draft quotable before it ships",
      description:
        "The quotability sub-score identifies whether your sentences are liftable claims or subordinate clauses that only work in context: the difference between being quoted and being skimmed.",
    },
    {
      audience: "SEO specialist",
      title: "Audit a page that ranks but never gets cited",
      description:
        "Traditional SEO can rank thin, hedged content. Generative engines quote specific claims. This scorer measures the gap between the two.",
    },
    {
      audience: "Documentation lead",
      title: "Make docs answerable",
      description:
        "Docs that assume the reader arrived at page one fail hard when a model retrieves section seven alone. Self-containment scoring finds those sections.",
    },
    {
      audience: "Agency",
      title: "Prove the value of an edit",
      description:
        "Score before and after: the counted deltas (statistics added, quotable sentences created) are a deliverable a client can verify themselves.",
    },
  ],

  troubleshooting: [
    {
      problem: "My source-citation score says 50 and I definitely have links.",
      solution:
        "Plain-text mode can't see links, so that factor is scored neutrally at 50 and says so in its row. Fetch the URL or paste full HTML to measure real outbound citations.",
    },
    {
      problem: "The scorer says my headings aren't questions, but they're fine headings.",
      solution:
        "They may well be good headings for a human reader. The factor measures a specific retrieval behavior: queries are questions, and question-phrased headings match them literally. It's weighted lowest of the six for exactly this reason: treat it as a suggestion, not a mandate.",
    },
    {
      problem: "My fact density is low but the topic doesn't have numbers.",
      solution:
        "Some topics genuinely resist quantification, and the score will reflect that honestly rather than pretend otherwise. Look for the specifics you do have: versions, dates, durations, thresholds, limits, counts. If there are truly none, prioritize the quotability and self-containment factors instead.",
    },
    {
      problem: "Two similar pages score differently and I don't see why.",
      solution:
        "Open the sub-scores and compare their counted inputs: the arithmetic is visible on both, so the difference is always locatable. That's the whole reason the formulas are printed.",
    },
  ],

  tips: [
    "The two highest-weighted factors are fact density and quotability: a single paragraph of concrete numbers usually moves the overall score more than a full rewrite.",
    "One claim per sentence, 8–40 words, no leading pronoun: that shape is what makes a sentence liftable verbatim by a model.",
    "Link outward to primary sources (specs, standards, papers, benchmark pages). The GEO study found citing sources among the highest-lift edits, and outbound links cost you nothing.",
    "Delete 'as mentioned above' everywhere. Retrieved fragments have no above, and the phrase converts a good section into an unusable one.",
    "Score the page you most want cited, not your homepage. Homepages are rarely retrieved as answers to anything.",
  ],

  security:
    "All scoring runs in your browser. Pasted content is never uploaded, logged or stored. URL fetches use a stateless proxy that fetches, returns and discards. Draft and embargoed content is safe here.",

  faq: [
    {
      question: "What actually makes content more likely to be cited by AI?",
      answer:
        "The peer-reviewed evidence points at three things: concrete statistics, quotable self-contained statements, and cited sources. The GEO study (Aggarwal et al., KDD 2024) tested content modifications across 10,000 queries and found adding statistics, quotations and source citations produced the largest visibility gains: up to roughly 30–40% in their benchmark. This tool scores exactly those, plus three structural factors that determine whether a passage survives retrieval at all.",
    },
    {
      question: "Which study is this based on?",
      answer:
        "\"GEO: Generative Engine Optimization\" by Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan and Deshpande. Princeton, Georgia Tech, IIT Delhi and the Allen Institute for AI, published at KDD 2024. It's linked from every sub-score that implements one of its factors, so you can check our reading of it against the paper.",
    },
    {
      question: "Why does this tool show its formulas when others don't?",
      answer:
        "Because a score without a method is unfalsifiable, and unfalsifiable scores are why this category has a credibility problem. If we can't state a factor as a one-line formula with counted inputs, we don't score it. The practical benefit: when a sub-score seems wrong, you can see precisely which count drove it and decide for yourself.",
    },
    {
      question: "What's a good citability score?",
      answer:
        "Above 70 means the page gives a model plenty to work with. Above 85 is genuinely strong. Below 40 usually means low fact density plus context-dependent prose: the model can retrieve the page but has almost nothing safe to quote. Treat the sub-scores as the real output. The overall number is just a summary of them.",
    },
    {
      question: "Does a high score guarantee AI will cite me?",
      answer:
        "No, and any tool claiming otherwise is selling something. Citation also depends on competition, query demand, your site's authority and model behavior nobody controls. What a high score means is narrower and still valuable: nothing about the content itself is preventing citation.",
    },
    {
      question: "Can I score content that isn't published yet?",
      answer:
        "Yes: that's the best time. Paste the draft. Everything runs in your browser with nothing uploaded, so unpublished, embargoed and internal content is safe. Only the heading and outbound-link factors need HTML, and Markdown headings work for the heading factor.",
    },
    {
      question: "How is this different from a readability score?",
      answer:
        "Readability scores (Flesch, Gunning Fog) measure how easily a human reads a sentence. This measures whether a machine can extract a defensible claim from it. They diverge sharply: a highly readable paragraph of hedged generalities scores well on readability and terribly here, because there's nothing in it to quote.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: six weighted sub-scores (fact density, source citations, quotability, opening answer, question headings, self-containment) with per-row formulas, counted inputs and quoted evidence. Plain-text / Markdown / HTML / URL input. Methodology section citing the KDD 2024 GEO study.",
    },
  ],

  relatedTools: [
    "retrieval-chunk-preview",
    "answer-snippet-checker",
    "geo-audit",
    "js-rendering-checker",
  ],

  notFor: [
    {
      text: "It doesn't measure keyword density or traditional on-page SEO: use the Keyword Density Checker for that.",
      toolSlug: "keyword-density-checker",
    },
    {
      text: "It doesn't track whether AI assistants actually cite you. It scores whether the content gives them something citable.",
    },
  ],
};

export default contentCitabilityScorer;
