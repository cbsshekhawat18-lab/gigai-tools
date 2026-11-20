---
title: "Why AI Crawlers Don't Run JavaScript, and What That Costs You"
description: "Googlebot renders your page. GPTBot, ClaudeBot and PerplexityBot generally do not. Here is how to measure the gap between what users see and what AI systems receive."
date: "2026-08-29"
author: "Chandrabhan Shekhawat"
tool: "js-rendering-checker"
category: "geo-tools"
tags: ["javascript seo", "rendering", "ai crawlers", "spa", "geo"]
featured: false
---

A page can rank perfectly well in Google and be almost entirely blank to every AI system that looks at it. That is not a contradiction. Googlebot renders JavaScript in a headless browser. The AI crawlers generally fetch the raw HTML response and parse what is there. If your content arrives as an empty div plus a bundle, Google sees your article and ChatGPT sees nothing.

## Rendering is expensive, and most crawlers skip it

Google invested years in a rendering pipeline because it had to: a large share of the web became client-rendered. Google documents the two-pass process in its [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) guide, including the fact that rendering can be deferred.

Running a browser per URL costs orders of magnitude more CPU and memory than fetching bytes. Crawlers built for collecting training data or maintaining a retrieval index have not generally made that investment. The published documentation for the major AI crawlers describes fetching and respecting robots.txt. None of it promises JavaScript execution.

So the safe assumption, until an operator documents otherwise, is that what you serve in the initial HTML response is what AI systems get.

## What this looks like in practice

The classic failure is a single-page application whose root element is empty in the source. Your framework hydrates it in the browser, the user sees a complete page, and the raw response contains a handful of words of chrome.

Subtler cases are more common and easier to miss. An FAQ accordion that fetches its answers after mount. Product specifications loaded from an API on scroll. A "read more" section that exists only after a click. Tabbed content where only the first tab is server-rendered. In each case the page looks complete to you and to Google, and the specific content you most want quoted is the part that never reaches an AI crawler.

There is also the hydration payload problem. Frameworks often ship their data as serialized JSON inside a script tag, which the browser turns into your visible page. Some crawlers can salvage obvious strings from that. None do so reliably, and you should not build on maybe.

## How to measure it rather than guess

Open your page's source with view-source, not the DevTools Elements panel. Elements shows the rendered DOM after JavaScript has run, which is precisely the misleading view this problem hides behind. View-source shows the bytes.

Then count. The question is not "does the page look right" but "how many words of real content exist before any script executes". The [JS Rendering Checker](/js-rendering-checker) fetches the raw HTML without executing anything, reports that word count, and flags framework markers such as Next.js flight data, Nuxt payloads, Angular version attributes and empty SPA mount points, quoting the marker it found as evidence.

For an exact answer rather than a signal, paste the rendered DOM alongside it. One console command, `copy(document.documentElement.outerHTML)`, captures what your browser actually built. The tool diffs the two and lists, sentence by sentence, the content that exists only after hydration. That list is the precise cost of your rendering strategy.

## Fixing it does not mean abandoning your framework

Server-side rendering, static generation and pre-rendering all pass this test. Next.js, Nuxt, SvelteKit and Astro in their server-rendering modes emit real HTML. The same frameworks in pure client mode do not. The fix is a configuration and architecture decision, not a rewrite.

Prioritize by what you want cited. Marketing chrome, cookie banners and personalization can stay client-side without any loss. Your documentation, FAQ answers, pricing details and product descriptions should be in the initial response.

Be wary of treating `noscript` content as a solution. It is a fallback for humans with scripting disabled, and its presence usually signals that someone already knew about this problem.

## A check worth running before you migrate

The cheapest moment to catch this is before a framework migration ships. Fetch the raw HTML of a prototype page and compare the word count against the current site. A rendering regression discovered in a diff costs an afternoon. The same regression discovered through a slow decline in AI citations costs months, and is nearly impossible to attribute correctly after the fact.

If the count drops, you have not lost a ranking yet. You have lost the ability to be quoted, and that shows up in a channel most analytics setups are not watching.

## The gap that ordinary SEO tools will not show you

Most SEO auditing runs on a rendered DOM, because it was built to model Googlebot. That is the right model for Google and the wrong one for everyone else in the retrieval business. Until AI crawlers publish rendering guarantees, treat the raw response as your real surface area, and measure it deliberately rather than assuming your framework handled it.

## Sources

- [JavaScript SEO basics (Google Search Central)](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [OpenAI bots and user agents](https://platform.openai.com/docs/bots)
- [Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity bots guide](https://docs.perplexity.ai/guides/bots)
- [Web crawler (Wikipedia)](https://en.wikipedia.org/wiki/Web_crawler)
