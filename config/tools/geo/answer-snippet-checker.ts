import type { Tool } from "@/types";

/** Answer Snippet Checker — does each H2 section open with a self-contained answer? */
const answerSnippetChecker: Tool = {
  slug: "answer-snippet-checker",
  title: "Answer Snippet Checker",
  description:
    "Check whether every section of your page opens with a self-contained answer in 40 words or fewer. Flags throat-clearing intros, buried answers and openings that depend on missing context, with a rewrite target for each failure.",
  category: "geo-tools",
  group: "Content",
  icon: "MessageSquareText",
  accent: "emerald",
  status: "live",
  createdAt: "2026-08-22",
  serverSide: true,

  h1: "Answer Snippet Checker: Does Every Section Answer First?",
  tagline:
    "Retrieval systems judge a passage mostly on how it opens. A section that spends two sentences warming up loses to one that answers immediately: even when the warm-up section is better written. This checker takes every H2 on your page and holds its opening to one standard: a complete, self-contained answer in 40 words or fewer, with no throat-clearing and no dependence on the rest of the page. Every failure gets the reason and a concrete rewrite target.",
  longDescription:
    "The inverted pyramid was always good practice. Retrieval made it structural. When a generative engine considers your section as a candidate answer, the opening carries most of the signal. It is what gets embedded most heavily, what gets shown in a preview, and what determines whether the model trusts the passage enough to quote it. Content that opens with 'In today's fast-moving digital landscape…' has spent its most valuable real estate on nothing. This checker extracts every H2 section (falling back to H3s, and supporting Markdown ## headings as well as HTML), takes each section's first sentences, and applies three tests: is the answer complete within 40 words, does it start with a throat-clearing phrase from a list of the usual offenders, and is it self-contained, free of leading pronouns and back-references like 'as mentioned above' that only resolve if the reader has the rest of the page. Failures show the actual opening text, the specific reasons it failed, and a rewrite target phrased against that section's own heading. It also judges the page's own opening, since that's the snippet for the page as a whole, and flags headings that aren't phrased as questions, because retrieval matches queries against headings and a label-style heading matches nothing anyone types.",

  ctaText: "Check my sections",

  keywords: [
    "answer snippet checker",
    "answer first content",
    "featured snippet optimization",
    "ai answer optimization",
    "40 word answer seo",
    "direct answer content checker",
    "section opening seo",
    "inverted pyramid content tool",
    "ai overview optimization",
    "question heading checker",
  ],

  seo: {
    title: "Answer Snippet Checker: Does Your Content Answer First? | GigAI Tools",
    description:
      "Free checker: does each H2 section open with a self-contained answer under 40 words? Flags buried answers, throat-clearing and context-dependent openings. In-browser.",
  },

  features: [
    {
      icon: "Timer",
      title: "The 40-word standard, measured",
      description:
        "Each section's first sentences are counted, not eyeballed. You see the exact word count to the first complete thought and how far over the line it fell.",
    },
    {
      icon: "Wind",
      title: "Throat-clearing detection",
      description:
        "\"In this article\", \"Before we dive in\", \"In today's digital age\", \"Have you ever\": the phrases that delay every answer are flagged by pattern, with the opening quoted back.",
    },
    {
      icon: "Unlink",
      title: "Self-containment on the opening",
      description:
        "An opening that begins with 'It' or leans on 'as mentioned above' fails, because a retrieved section arrives without whatever it was referring to.",
    },
    {
      icon: "PenLine",
      title: "A rewrite target per failure",
      description:
        "Not just 'this failed': one or two sentences, under 40 words, that answer this specific heading completely even if nothing else from the page is shown.",
    },
    {
      icon: "CircleHelp",
      title: "Question-phrasing check on headings",
      description:
        "Retrieval matches queries against headings. Sections whose headings aren't phrased the way people ask get a note, so heading and opening get fixed together.",
    },
    {
      icon: "FileText",
      title: "Markdown or HTML, drafts included",
      description:
        "Works on ## Markdown headings, full page HTML, or a fetched URL, so you can check a draft before it ever ships.",
    },
  ],

  benefits: [
    {
      title: "Fix the highest-leverage 40 words on the page",
      description:
        "Section openings are disproportionately weighted in retrieval. Rewriting them is a small edit with an outsized effect compared to reworking whole articles.",
    },
    {
      title: "Break the throat-clearing habit visibly",
      description:
        "Most writers don't notice their own warm-up sentences. Seeing five sections flagged for the same pattern fixes the habit permanently, not just this page.",
    },
    {
      title: "Serve skimming humans at the same time",
      description:
        "Answer-first sections help readers who jump straight to the heading they need. This is one of the rare optimizations with no human cost.",
    },
    {
      title: "Turn vague feedback into a checklist",
      description:
        "\"Get to the point faster\" is unactionable. A list of five headings with word counts and rewrite targets is a morning's work.",
    },
  ],

  howTo: [
    {
      title: "Paste your content or fetch a URL",
      description:
        "Markdown with ## headings, full HTML, or a live page. The checker finds H2 sections (or H3s when there are no H2s).",
    },
    {
      title: "Read the page-level opening verdict",
      description:
        "The page's own first sentences are judged too: that's the snippet for the page as a whole.",
    },
    {
      title: "Work through the failing sections",
      description:
        "Each shows its actual opening, its word count, the specific reasons it failed, and a rewrite target tied to its heading.",
    },
    {
      title: "Rewrite openings, then elaborate",
      description:
        "Lead with the complete answer in under 40 words, then add the nuance, caveats and detail underneath. Nothing is lost: it's reordered.",
    },
    {
      title: "Re-check until every section passes",
      description:
        "Paste the revision. Aim for all sections passing on the pages you most want cited.",
    },
  ],

  formats: {
    input: ["URL", "TXT", "MD", "HTML"],
    output: ["Report", "Share link"],
  },

  useCases: [
    {
      audience: "Content writer",
      title: "Audit your own warm-up habit",
      description:
        "Run a published article you're proud of. The count of sections that bury their answer is usually higher than any writer expects.",
    },
    {
      audience: "SEO specialist",
      title: "Optimize for AI answers and featured snippets at once",
      description:
        "The same standard (a direct, self-contained answer in about 40 words) drives Google featured snippets and generative-engine citation. One edit, two channels.",
    },
    {
      audience: "Documentation lead",
      title: "Make every doc section answerable",
      description:
        "Users and models both arrive mid-document via search. Sections that open with setup instead of the answer fail both.",
    },
    {
      audience: "Editor",
      title: "Give writers a mechanical standard",
      description:
        "Instead of subjective 'tighten this', hand back a report with word counts and specific failing phrases: feedback nobody argues with.",
    },
  ],

  troubleshooting: [
    {
      problem: "No sections were found in my content.",
      solution:
        "The checker looks for H2 (then H3) headings in HTML, or ## Markdown headings. If your content uses bold text or styled divs as pseudo-headings, they aren't detected, and, more importantly, retrieval systems don't detect them either. Use real heading tags.",
    },
    {
      problem: "A section is flagged but the answer genuinely needs more than 40 words.",
      solution:
        "The 40-word test applies to the opening, not the section. Lead with the shortest true answer (even a partial one with the caveat named) then use the remaining paragraphs for the full explanation. If a topic truly can't be opened in 40 words, that's usually a sign the section covers two questions and should be split.",
    },
    {
      problem: "My opening is short but still fails.",
      solution:
        "Read the listed reasons: it likely starts with a throat-clearing phrase, or begins with a pronoun or back-reference. Length is only one of the three tests, because a 12-word opening that says 'As we saw earlier, it does this too' answers nothing on its own.",
    },
    {
      problem: "The heading-phrasing note appears on headings I like.",
      solution:
        "It's a note, not a failure: the section can still pass. Question-phrased headings match how people search, but a well-known term as a heading is often the right call. Use judgment. The checker never blocks on it.",
    },
  ],

  tips: [
    "Write the answer first, then the setup. If the setup turns out to be unnecessary once the answer is at the top (and it usually does) delete it.",
    "One heading, one question. Sections covering two questions can't open with one direct answer, and they chunk badly too.",
    "Put the specific number in the opening: '20 minutes for a typical 50-page PDF' beats 'it depends on the file' and gives a model something to quote.",
    "The same 40-word discipline wins Google featured snippets, so this edit pays off in classic search whether or not AI citation follows.",
    "Check your FAQ page especially: FAQ answers that open with 'Yes, and…' or 'It depends' are the most commonly retrieved and most commonly useless fragments on any site.",
  ],

  security:
    "Everything runs in your browser: pasted drafts are never uploaded, logged or stored. URL fetches use a stateless proxy that fetches, returns and discards.",

  faq: [
    {
      question: "Why 40 words?",
      answer:
        "It approximates the length of a passage a generative engine or featured snippet will reproduce in full, and it's short enough to force a genuine answer rather than a preamble. The exact threshold matters less than the discipline: if you can't state the answer in about two sentences, the section usually needs splitting.",
    },
    {
      question: "Does the opening really matter more than the rest of the section?",
      answer:
        "For retrieval, yes, disproportionately. The opening dominates what gets embedded and previewed, and it's what a model reads first when deciding whether the passage answers the question. The rest of the section still matters for depth and trust, but it never gets evaluated if the opening doesn't earn it.",
    },
    {
      question: "What counts as throat-clearing?",
      answer:
        "Openings that delay the answer without adding information: 'In this article we'll explore…', 'Before we dive in…', 'In today's fast-paced digital world…', 'Have you ever wondered…', 'As you may know…'. They're conversational habits from writing for a reader who has already committed to the page, but retrieval decides whether to show the passage at all, so those words are spent for nothing.",
    },
    {
      question: "Is this the same as optimizing for featured snippets?",
      answer:
        "Largely the same technique, wider payoff. Google's featured snippets and generative-engine citations both reward a direct, self-contained answer near the top of a clearly-labeled section. Optimizing for one improves the other. This checker just applies the standard uniformly across every section rather than a single target query.",
    },
    {
      question: "Should every heading be a question?",
      answer:
        "Not necessarily, which is why it's a note rather than a failure. Question-phrased headings match how people actually search and pair naturally with answer-first openings, so aiming for roughly half is a reasonable target. But a widely-understood term as a heading is often clearer, and clarity wins.",
    },
    {
      question: "How is this different from the Citability Scorer?",
      answer:
        "The Citability Scorer evaluates the whole page across six factors including fact density and quotability, and includes an opening check as one of them. This tool does one thing exhaustively: it judges every section's opening individually and hands you a per-section rewrite target. Use the scorer to decide what to work on. Use this to do that work.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: per-section opening judgment (40-word completeness, throat-clearing patterns, self-containment), page-level opening verdict, question-phrasing notes on headings, rewrite targets tied to each heading, Markdown/HTML/URL input.",
    },
  ],

  relatedTools: [
    "content-citability-scorer",
    "retrieval-chunk-preview",
    "geo-audit",
    "meta-description-generator",
  ],

  notFor: [
    {
      text: "It doesn't score the whole page's content quality: the Citability Scorer covers fact density, sources and quotability.",
      toolSlug: "content-citability-scorer",
    },
    {
      text: "It doesn't rewrite the copy for you. It gives a measured target so you write the sentence yourself.",
    },
  ],
};

export default answerSnippetChecker;
