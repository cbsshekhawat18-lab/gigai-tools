---
title: "Every AI Crawler User-Agent, and Whether to Allow It"
description: "A reference for the fifteen AI crawler tokens that decide your visibility in ChatGPT, Claude, Perplexity and Google, what each one actually does, and what blocking it costs you."
date: "2026-08-29"
author: "Chandrabhan Shekhawat"
tool: "ai-crawler-access-checker"
category: "geo-tools"
tags: ["ai crawlers", "robots.txt", "gptbot", "user agents", "geo"]
featured: true
---

There is no such thing as "the AI crawler". There are at least fifteen tokens from nine operators, they do three different jobs, and treating them as one decision is the most expensive mistake in AI-era robots.txt. OpenAI alone runs three bots, and blocking all three because you object to model training will quietly remove you from ChatGPT's cited answers, which is the part that sends traffic.

This is the reference table, organized by what each bot is for rather than who owns it.

## The three jobs, and why the distinction is the whole story

Every AI crawler does one of three things.

**Model training.** It collects pages that become training data for a future model. Blocking it means the next generation of that model has not read your site, so it is less likely to describe your product unprompted. This is a content-control decision with no direct traffic consequence.

**Search indexing.** It builds a retrieval index that an AI answer engine cites from. Blocking it removes you from those answers, and those answers carry links. This is a traffic decision.

**On-demand user fetch.** It fetches one page, right now, because a user asked the assistant about that URL or pasted your link into the chat. Blocking it means the assistant tells your prospective customer it cannot read your page.

A fourth category is not a crawler at all. `Google-Extended` and `Applebot-Extended` are control tokens: they do not fetch anything, they govern how an existing crawl may be used. Blocking them reduces no traffic and no crawl load.

## OpenAI: three tokens, three different outcomes

| Token | Job | What blocking costs |
|---|---|---|
| `GPTBot` | Training | Future OpenAI models do not learn from your site |
| `OAI-SearchBot` | Search index | You disappear from ChatGPT Search citations |
| `ChatGPT-User` | On-demand fetch | ChatGPT cannot read links users share |

If you want to opt out of training while staying citable, block `GPTBot` and allow the other two. OpenAI documents all three separately, and the [OpenAI bots page](https://platform.openai.com/docs/bots) publishes the IP ranges so you can verify a request is genuine rather than a spoofed user-agent.

## Anthropic: the same three-way split

`ClaudeBot` trains models. `Claude-SearchBot` indexes for Claude's web search. `Claude-User` fetches a page when a Claude user asks about it. Anthropic's [crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) covers how to control each.

## Perplexity: citation-first, so blocking hurts most

`PerplexityBot` indexes for the answer engine and `Perplexity-User` fetches on demand. Perplexity is unusually citation-forward, showing sources prominently, which makes a block here more visible as lost referral traffic than almost anywhere else. See the [Perplexity bots guide](https://docs.perplexity.ai/guides/bots).

## Google and Microsoft: where AI and classic search overlap

`Googlebot` is the ordinary crawler, and its index also feeds AI Overviews. Blocking it removes you from Google entirely, which is essentially never the intent. `Google-Extended` is the control token for Gemini training and grounding, and Google states it does not affect Search ranking. Both are covered in [Google's crawler overview](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers).

`Bingbot` deserves more attention than its name suggests. ChatGPT Search and Microsoft Copilot retrieve through Bing's index, so blocking Bingbot removes you from those answers even when every OpenAI token is allowed. Microsoft documents the crawler set in its [Bing webmaster help](https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0).

## Apple, Meta, ByteDance and Common Crawl

`Applebot-Extended` is a control token for training Apple's models, documented in [Apple's crawler article](https://support.apple.com/en-us/119829). It does not affect Siri or Spotlight results from the ordinary Applebot crawl. `meta-externalagent` collects training data for Meta's AI products. `Bytespider` is ByteDance's crawler and has a documented history of ignoring robots.txt, which is why many sites block it at the firewall rather than in a text file. `CCBot` builds the open [Common Crawl](https://commoncrawl.org/ccbot) dataset that many labs train on, so blocking it affects many models at once rather than one vendor's.

## What robots.txt can and cannot do

robots.txt is a request, formalized in [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html). The major operators document compliance and server logs generally bear that out. Three limits are worth stating plainly.

It governs future crawling only. It cannot remove your content from a model that already trained on it.

It is per-host. A policy on `example.com` does nothing for `blog.example.com`.

It sits below your CDN. If your firewall rejects AI crawlers before the request reaches your origin, your robots.txt never gets read at all, which is a situation many sites are in without knowing.

## Reading your own policy accurately

Group precedence in robots.txt is genuinely unintuitive: consecutive `User-agent` lines share one group, duplicate groups merge, the most specific token match wins, and on a specificity tie `Allow` beats `Disallow`. A file that looks permissive can block, and a file that looks restrictive can allow.

The [AI Crawler Access Checker](/ai-crawler-access-checker) applies those rules the way crawlers do and gives each of the fifteen tokens a verdict with the exact deciding line quoted, so you can check the reasoning rather than trust a badge. When you want to change the policy rather than read it, the [AI Robots.txt Generator](/ai-robots-txt-generator) writes a correct group per bot and shows the cost of each block before you ship it.

## Decide it once, deliberately

Most sites have never made this decision. They inherited a copy-pasted block from 2023 that predates `OAI-SearchBot` and `Claude-SearchBot` entirely, which means they are blocking citations they would have wanted while believing they only opted out of training. Whatever you choose, choose it per job, write it down in the file's comments, and verify the live file rather than the one in your repository.

## Sources

- [OpenAI bots and user agents](https://platform.openai.com/docs/bots)
- [Anthropic: does Anthropic crawl the web, and how can site owners block the crawler](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity bots guide](https://docs.perplexity.ai/guides/bots)
- [Google crawlers, fetchers and user agents](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- [Which crawlers does Bing use](https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0)
- [Applebot and Applebot-Extended (Apple Support)](https://support.apple.com/en-us/119829)
- [CCBot (Common Crawl)](https://commoncrawl.org/ccbot)
- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)
