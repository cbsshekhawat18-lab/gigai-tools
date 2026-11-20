import type { Tool } from "@/types";

/** Entity Consistency Checker — do your own profiles agree about you? */
const entityConsistencyChecker: Tool = {
  slug: "entity-consistency-checker",
  title: "Entity Consistency Checker",
  description:
    "Paste your description as it appears on your site, GitHub, LinkedIn, Product Hunt, Crunchbase and G2, and see where your own profiles contradict each other: name-spelling drift, conflicting numbers, conflicting years, profiles too thin to corroborate anything.",
  category: "geo-tools",
  group: "Content",
  icon: "Fingerprint",
  accent: "amber",
  status: "live",
  createdAt: "2026-08-22",

  h1: "Entity Consistency Checker: Do Your Profiles Agree About You?",
  tagline:
    "Language models build confidence in an entity through corroboration: the same name, the same numbers, the same story appearing across independent sources. When your own profiles disagree, that confidence never forms, and a model hedges or omits you rather than stating something it can't verify. Paste your description from each place it appears and this tool diffs the mechanical facts: exact name spelling, every number-with-unit, every year, and any profile too thin to support the others.",
  longDescription:
    "This is the least glamorous and most commonly neglected part of AI visibility. A model deciding whether to describe your product draws on everything it has seen about you, and agreement across independent sources is the strongest signal that a fact is true. Disagreement produces the opposite: three different founding years, a tool count that says 250 in one place and 262 in another, a name written as GigAI on your site and Gigai on Crunchbase. None of those are lies, and every one of them weakens the entity. The checker takes your brand name and your descriptions from up to six sources and compares them mechanically. Name drift finds every letter-identical-but-formatting-different variant of your brand across the sources and lists which source uses which. Number conflicts pair values with their units, so '262 tools' and '250 tools' collide while '262 tools' and '2019' don't. Year conflicts catch founding-date disagreements, the single most commonly contradicted fact in company profiles. Length outliers flag profiles so short they can't corroborate anything, which is its own kind of missing signal. Facts that agree across multiple sources are listed too, because knowing what's already solid tells you what to protect. The scope is deliberately honest: this compares facts a machine can extract with certainty, not semantic positioning, for 'analytics platform' versus 'BI tool' you need to read the sources side by side, which the layout is designed to let you do.",

  ctaText: "Check consistency",

  keywords: [
    "entity consistency checker",
    "brand consistency ai",
    "entity seo tool",
    "nap consistency ai",
    "brand description consistency",
    "entity disambiguation seo",
    "knowledge graph consistency",
    "ai brand entity",
    "company profile consistency",
    "cross platform brand audit",
  ],

  seo: {
    title: "Entity Consistency Checker: Do Your Profiles Agree? | GigAI Tools",
    description:
      "Free checker: paste your brand description from your site, GitHub, LinkedIn, Product Hunt and Crunchbase to find name drift, conflicting numbers and years. In-browser.",
  },

  features: [
    {
      icon: "SpellCheck",
      title: "Name-spelling drift detection",
      description:
        "Finds every variant of your brand name that differs only in capitalization, spacing or punctuation, and names which source uses which: the most common and most invisible entity leak.",
    },
    {
      icon: "Calculator",
      title: "Number conflicts paired with units",
      description:
        "Values are matched by unit, so '262 tools' versus '250 tools' is flagged as a conflict while unrelated numbers aren't. Every conflicting value is listed with the sources that state it.",
    },
    {
      icon: "CalendarClock",
      title: "Year conflicts",
      description:
        "Founding years are the most frequently contradicted fact across company profiles, usually because one profile was written years after another and nobody reconciled them.",
    },
    {
      icon: "FileMinus",
      title: "Thin-profile detection",
      description:
        "A profile of eight words can't corroborate anything the others say. Sources too short to act as evidence are flagged as their own kind of gap.",
    },
    {
      icon: "CircleCheck",
      title: "Agreement, listed too",
      description:
        "Facts stated consistently across multiple sources are surfaced so you know what's already solid, and what not to accidentally change during a rewrite.",
    },
    {
      icon: "ShieldCheck",
      title: "Nothing fetched, nothing uploaded",
      description:
        "The tool reads only what you paste, entirely in your browser. No crawling of your profiles, no accounts connected, nothing stored.",
    },
  ],

  benefits: [
    {
      title: "Fix the signal you didn't know you were sending",
      description:
        "Nobody sets out to publish three different founding years. It happens through time and delegation, and it's invisible until you put the profiles side by side.",
    },
    {
      title: "Make corroboration work for you",
      description:
        "Agreement across independent sources is what turns a mention into a fact a model will state confidently. Consistency is the cheapest way to earn that.",
    },
    {
      title: "Produce an update checklist in one pass",
      description:
        "The output is literally a list of which profiles to edit and what to change: an afternoon of work with a durable effect.",
    },
    {
      title: "Catch stale claims before a customer does",
      description:
        "The conflicting numbers this finds are usually outdated ones. Fixing them protects credibility with humans as much as with models.",
    },
  ],

  howTo: [
    {
      title: "Enter your brand name exactly as you want it written",
      description:
        "This is the canonical spelling everything else is measured against: capitalization included.",
    },
    {
      title: "Paste your description from each source",
      description:
        "Your website's about text, GitHub repo or org description, LinkedIn company page, Product Hunt tagline and description, Crunchbase, G2 or any other listing. Two sources minimum. More is better.",
    },
    {
      title: "Read the inconsistencies",
      description:
        "Name variants with their sources, conflicting number-unit pairs, conflicting years, and profiles too thin to corroborate.",
    },
    {
      title: "Pick the true version and propagate it",
      description:
        "Decide the canonical name, the current numbers and the correct year, then update every profile that disagrees. Consistency matters more than which variant you choose.",
    },
    {
      title: "Re-check and set a reminder",
      description:
        "Re-run after updating, and revisit whenever a number changes: a new count or milestone means every profile is now stale until proven otherwise.",
    },
  ],

  formats: {
    input: ["Text"],
    output: ["Report"],
  },

  useCases: [
    {
      audience: "Founder",
      title: "Audit everything you've written about yourself",
      description:
        "Profiles accumulate over years across platforms nobody revisits. This is the fastest way to see the composite picture a model actually assembles from them.",
    },
    {
      audience: "Marketing lead",
      title: "Enforce messaging consistency mechanically",
      description:
        "Brand guidelines say be consistent. This shows exactly where you aren't, with the offending text quoted from the source that contains it.",
    },
    {
      audience: "SEO specialist",
      title: "Add entity work to the AI-visibility checklist",
      description:
        "Entity consistency is the piece most AI-SEO audits skip because it's manual. Six paste boxes make it a ten-minute deliverable.",
    },
    {
      audience: "Agency",
      title: "Onboarding audit for a new client",
      description:
        "Pulling a client's descriptions from six platforms and diffing them surfaces stale claims and naming drift in the first week, often before anything else is actionable.",
    },
  ],

  troubleshooting: [
    {
      problem: "It flagged a number conflict that isn't really one.",
      solution:
        "Values are matched by their unit word, so genuinely different metrics that share a unit can collide: '50 users' on a pricing tier and '50 users' meaning total customers, for example. Read the quoted evidence. If the two statements mean different things, ignore the flag and consider rewording so a machine can't confuse them either, because it will.",
    },
    {
      problem: "My name isn't detected at all.",
      solution:
        "The brand name box must match how the name appears in your descriptions (allowing for capitalization, spacing and punctuation differences. Those are exactly what it's looking for). If your profiles refer to you only by a product name or abbreviation, run the check once per name variant.",
    },
    {
      problem: "It says my profiles agree but the positioning is completely different.",
      solution:
        "That's the honest limit of the tool, stated on the page: it compares extractable facts (names, numbers, years), not meaning. Semantic drift ('analytics platform' on one profile and 'BI tool' on another) needs a human read, which is why all six descriptions stay visible side by side while you review.",
    },
    {
      problem: "Only two of my platforms have descriptions.",
      solution:
        "Two is enough to run, but the check gets sharper with more. It's also worth noting that having few sources describing you is itself a visibility problem. Models have less to corroborate. Filling out the empty profiles is the fix.",
    },
  ],

  tips: [
    "Pick one canonical name spelling and use it everywhere, including inside prose. Which one you pick matters far less than picking one.",
    "Avoid hard numbers that go stale ('262 tools') in profiles you can't easily update: either commit to updating them all together, or write 'hundreds of tools' where precision isn't the point.",
    "Add sameAs links between your profiles via Organization schema. Consistency plus explicit linkage is what lets a model connect the sources into one entity.",
    "Update every profile in the same sitting. Staggered updates create a window where your sources disagree, which is the exact state this tool exists to eliminate.",
    "Include your Wikipedia or Wikidata entry if you have one: it's disproportionately weighted in entity resolution, and disagreeing with it is expensive.",
  ],

  security:
    "Nothing is fetched and nothing is uploaded: the checker reads only the text you paste and compares it entirely in your browser. No accounts are connected and no profile data is stored.",

  faq: [
    {
      question: "Why does entity consistency matter for AI?",
      answer:
        "Models establish facts through corroboration: the same claim appearing across independent sources. When your website says one thing and your Crunchbase profile says another, neither claim gets corroborated, so a model either hedges, picks one arbitrarily, or omits the detail. Consistency across sources is what converts a mention into a fact the model will state confidently.",
    },
    {
      question: "Which sources should I check?",
      answer:
        "Anywhere a machine can read a description of you: your own site's about and homepage, GitHub organization or repository descriptions, LinkedIn company page, Product Hunt, Crunchbase, G2 or Capterra, and app store listings. Wikipedia or Wikidata if you have an entry. Those carry outsized weight in entity resolution.",
    },
    {
      question: "What exactly does this tool compare?",
      answer:
        "Mechanical facts only, and it says so plainly: exact name spellings including formatting variants, numbers paired with their units, years, and how substantial each profile is. It deliberately doesn't attempt semantic comparison, because a tool that guessed at meaning would produce confident nonsense: that's the read-them-side-by-side part, which the layout supports.",
    },
    {
      question: "Does capitalization of my brand name really matter?",
      answer:
        "It's a weak signal individually and a cumulative one at scale. 'GigAI' and 'Gigai' are both recognizably you to a human, and to a model they're two string variants that each corroborate the other slightly less than an exact match would. It costs nothing to standardize, which is why it's worth doing, not because any single instance is damaging.",
    },
    {
      question: "How often should I re-check?",
      answer:
        "Whenever a fact changes, and at least annually. The most common failure mode is a number that was true when written (a tool count, a customer count, a team size) and was updated in one place only. Any milestone announcement is a signal that every profile is now potentially stale.",
    },
    {
      question: "Can't I just search for my brand and read the results?",
      answer:
        "You can, and you should, but you'll read past your own inconsistencies, because you know what you meant. Mechanical comparison doesn't. The founding-year conflict and the number drift are exactly the things a human eye skips and a diff catches.",
    },
  ],

  changelog: [
    {
      date: "2026-08-22",
      change:
        "Initial release: name-variant detection across six sources, unit-paired number-conflict detection, year-conflict detection, thin-profile flagging, agreed-fact listing, and an explicit statement of the mechanical-only scope.",
    },
  ],

  relatedTools: [
    "ai-schema-checker",
    "organization-schema-generator",
    "geo-audit",
    "content-citability-scorer",
  ],

  notFor: [
    {
      text: "It doesn't fetch your profiles automatically. You paste them, which is what keeps it account-free and private.",
    },
    {
      text: "It compares extractable facts, not meaning or positioning. Semantic drift needs your judgment, and the side-by-side layout is there for it.",
    },
  ],
};

export default entityConsistencyChecker;
