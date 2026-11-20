---
title: "FAQ Schema: A Practical Guide to Winning Rich Results"
description: "How FAQ schema works, when Google still shows it, and exactly how to build valid FAQPage JSON-LD that qualifies your pages for expanded, question-and-answer search results."
date: "2026-07-05"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "faq-schema-generator"
category: "seo-tools"
tags: ["faq schema", "rich results", "structured data", "json-ld", "schema.org"]
featured: false
---

Structured data is how you translate a human-readable page into something a search engine can understand with certainty. FAQ schema is one of the most approachable pieces of it: a small block of code that tells Google, "these exact questions have these exact answers on this page." Get it right and your listing can expand into a stack of collapsible questions right in the search results, taking up more space, answering intent instantly, and pushing competitors further down the page.

## What FAQ schema is

FAQ schema is a specific type of [structured data](/schema-generator) that uses the `FAQPage` type from Schema.org's vocabulary. You add it to a page that genuinely contains a list of questions and their answers. Search engines read it to confirm the page's format, and, when they choose to, display those Q&As directly beneath your normal blue-link result.

The result is a **rich result**: a standard listing enhanced with extra, structured detail. For an FAQ page, that means expandable questions the searcher can tap open without leaving the results page.

## A word of honesty about visibility

Here's the important caveat most guides skip: in 2023 Google narrowed FAQ rich results so they generally show only for **well-known, authoritative government and health sites**. For most commercial and personal sites, the FAQ rich result no longer appears in Google as it once did.

So why bother? Because valid FAQ schema still earns its keep:

- **Other engines and surfaces** (including Bing and various AI answer tools) still read and use it.
- **It's future-proofing.** Eligibility criteria change. Having clean, valid markup means you qualify the moment your page or your niche does.
- **It clarifies your content for machines**, which increasingly matters as AI-driven search extracts direct answers from pages. Structured Q&A is exactly the shape these systems want.

We'd rather tell you the real state of play than overpromise a blue-chip rich result you may not get. FAQ schema is worth adding as part of a solid structured-data foundation, just don't add it *expecting* the expandable snippet on a brand-new site.

## Anatomy of FAQPage JSON-LD

Google recommends JSON-LD, a script block that lives in your page's HTML but stays cleanly separated from the visible content. A minimal, valid example:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does shipping take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard shipping takes 3 to 5 business days within the country."
      }
    },
    {
      "@type": "Question",
      "name": "Can I return an item?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Returns are accepted within 30 days of delivery in original condition."
      }
    }
  ]
}
```

Every `Question` needs a `name` (the question text) and exactly one `acceptedAnswer` with a `text` value (the answer). That is the entire structure. Nesting it by hand for a dozen questions is where typos creep in (a missing comma or bracket invalidates the entire block) so our [FAQ schema generator](/faq-schema-generator) lets you type questions and answers in a form and outputs correct JSON-LD you can paste straight into your `<head>`.

## The rules Google actually enforces

If you want your FAQ schema to be eligible (now or later), follow these:

1. **The Q&A must be visible on the page.** Never mark up questions and answers that a user can't see. Hidden or invented content is a guidelines violation.
2. **Use it for genuine FAQs**, not to smuggle in promotional copy or a whole article split into fake questions.
3. **The full answer belongs in `text`.** You can include basic HTML (links, lists, bold) in the answer text, but the marked-up answer must match what's on the page.
4. **One `FAQPage` per page**, and don't use it on pages where users can submit their own answers (that's `QAPage`, a different type).
5. **Don't duplicate** the same FAQ block across many URLs.

Violating these doesn't just fail to earn a rich result. It can flag your structured data as spammy, which is worse than having none.

## FAQ vs. HowTo vs. QAPage

It's easy to reach for the wrong type. A quick guide:

- **FAQPage**, a list of questions *you* ask and answer. Fixed, editorial content.
- **QAPage**, a single question with community-submitted answers, like a forum thread. Users provide the answers.
- **HowTo**, sequential steps to complete a task, not a Q&A at all.

Pick the type that honestly describes the page. Search engines cross-check the markup against the visible content, so misdeclaring the type undermines trust in all your structured data.

## Build it, then validate it

Never ship structured data you haven't tested. Invalid JSON-LD is silently ignored, so a syntax slip means all your effort does nothing. The workflow that never bites you:

1. Draft your questions and answers as visible content on the page first.
2. Generate the matching JSON-LD with the [FAQ schema generator](/faq-schema-generator).
3. Paste it into the page and run it through a validator to confirm it parses and has no errors or warnings.
4. Optionally check it in Google's Rich Results Test to see current eligibility.

FAQ schema is one piece of a wider structured-data strategy. Once you're comfortable with it, the same principles extend to product, article, breadcrumb, and organisation markup. All of which you can build with our broader [schema generator](/schema-generator). Marking up your key page types is one of the most durable investments you can make as search shifts toward machine-read, answer-first results.

## Still worth adding, for different reasons now

FAQ schema is easy to add and genuinely useful, as long as you understand its current reality. The expandable rich result is now reserved mostly for authoritative sites, but valid `FAQPage` markup still feeds other engines and AI answer tools, future-proofs your eligibility, and makes your content unambiguous to machines. Keep the Q&A visible, keep it honest, generate clean JSON-LD with the [FAQ schema generator](/faq-schema-generator), and always validate before you publish. That is the entire game.

## Generate it without hand-writing JSON

Hand-writing JSON-LD is where most FAQ markup breaks (a stray comma, an unescaped quote in an answer), so the [FAQ schema generator](/faq-schema-generator) takes the questions and answers as plain text and emits the `FAQPage` JSON-LD for you, valid by construction. Pair it with the [JSON-LD validator](/jsonld-validator) after you paste it into your template, because template engines have a talent for re-breaking valid markup. Both tools run entirely in your browser.

## Sources

- [FAQPage structured data (Google Search Central)](https://developers.google.com/search/docs/appearance/structured-data/faqpage), including the 2023 narrowing of the rich result
- [FAQPage (Schema.org)](https://schema.org/FAQPage)
