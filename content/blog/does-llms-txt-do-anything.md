---
title: "Does llms.txt Do Anything? An Honest Answer"
description: "llms.txt is widely recommended and thinly evidenced. Here is what the convention proposes, what the major AI operators actually document, and when it is still worth twenty minutes."
date: "2026-08-29"
author: "Chandrabhan Shekhawat"
tool: "llms-txt-generator"
category: "geo-tools"
tags: ["llms.txt", "ai crawlers", "seo myths", "documentation", "geo"]
featured: false
---

Short answer: less than its marketing suggests, and probably not what you are hoping. It is cheap, harmless, occasionally useful for a specific kind of site, and it is not a ranking lever. If you have twenty minutes, ship one. If you are choosing between llms.txt and fixing whether AI crawlers can reach your site at all, the choice is not close.

We build [an llms.txt generator](/llms-txt-generator), so this is an awkward article to write. It is also the one people actually need.

## What the convention proposes

llms.txt is a proposed standard, documented at [llmstxt.org](https://llmstxt.org/), for a Markdown file at your domain root. The format is an H1 with the site name, a blockquote summarizing what the site is, an optional detail paragraph, and H2 sections of links with short descriptive notes.

The intent is reasonable. A sitemap optimizes for completeness, llms.txt optimizes for curation, giving a machine reader a short, human-selected map of what matters. As a design, it is pleasant and the format is easy to produce.

## What the evidence supports

Here is the part usually skipped.

Read the published crawler documentation from the major operators: [OpenAI](https://platform.openai.com/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity](https://docs.perplexity.ai/guides/bots), and [Google](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers). They describe user agents, robots.txt handling, IP ranges and verification. None of them documents llms.txt as a retrieval or ranking input.

Google's own guidance on AI features has been consistent that its systems work from the crawled and indexed web, and Google representatives have repeatedly pushed back on llms.txt being used by Search or its AI features. It is not part of any documented pipeline.

Meanwhile the sites that appear most often as citations in AI answers overwhelmingly do not have an llms.txt. That is not proof of no effect, but it is the pattern you would expect if the effect were negligible.

So the honest position is: no major operator documents using it, and there is no public evidence of a ranking or retrieval benefit. Anyone telling you otherwise should be asked for their source.

## Where it genuinely helps

Two cases hold up.

**Documentation sites read by coding agents.** Some developer tools and agents fetch llms.txt deliberately when pointed at a docs domain, because a curated index is genuinely more useful to them than a sitemap. If you ship developer documentation, this is the strongest case.

**Your own retrieval systems.** If you are building RAG over your own site, a hand-curated entry point is useful regardless of what external crawlers do with it.

There is a third, softer benefit worth naming: writing one forces you to summarize your site in a sentence and choose the twenty pages that matter. That exercise improves your meta descriptions and your entity consistency whether or not anything reads the file.

## What it is not

It is not robots.txt. That comparison gets made constantly and it is badly wrong in both directions.

robots.txt is a decades-old standard, formalized as [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html), that every major crawler obeys and that genuinely controls access. Blocking GPTBot there actually stops GPTBot crawling.

llms.txt suggests content and grants nothing. Ignoring it carries no consequence for a crawler. If you only ever get one of the two files right, get robots.txt right, and use the [AI Crawler Access Checker](/ai-crawler-access-checker) to confirm what yours actually does.

## If you ship one, ship a good one

The common failure is dumping every URL into it. A 300-link file is a sitemap in Markdown and defeats the purpose. A model reading it gets no signal about what matters. Curate to a few dozen links, group them, and write a real note after each one, because the note is where the useful information is.

Our generator parses a sitemap directly, groups URLs by path segment, humanizes the slugs into titles and caps each section, so the output stays a map rather than an index. It also repeats the honesty note on the page itself, next to the button, which felt like the minimum standard for a tool whose main risk is being oversold.

## Priorities, in order

If your goal is AI visibility, spend your effort in this sequence. Confirm AI crawlers can reach you, at both the robots.txt and CDN layers. Confirm your content exists in the raw HTML without JavaScript. Make the content specific and quotable enough to be worth citing. Then, if there is time left and you have developer docs, add llms.txt.

Publishing the file first because it is the easiest thing on the list is the most common mistake in this category, and it feels like progress while changing nothing.

## Why we say this out loud

Being the tool that tells you its own output might not matter is a strange marketing position. It is also the only one consistent with publishing our scoring formulas everywhere else. A generator that hyped llms.txt while our citability scorer showed its arithmetic would be incoherent, and you would be right to trust neither. Take the file if you want it. Take the honesty regardless.

## Sources

- [llmstxt.org, the proposed convention](https://llmstxt.org/)
- [OpenAI bots and user agents](https://platform.openai.com/docs/bots)
- [Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity bots guide](https://docs.perplexity.ai/guides/bots)
- [Google crawlers, fetchers and user agents](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)
