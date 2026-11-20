---
title: "Cloudflare Blocks AI Crawlers by Default: How to Check and Fix It"
description: "Cloudflare now blocks AI crawlers at the firewall for new zones, before robots.txt is ever read. Here is why a permissive robots.txt proves nothing, and exactly where to look."
date: "2026-08-29"
author: "Chandrabhan Shekhawat"
tool: "ai-crawler-access-checker"
category: "geo-tools"
tags: ["cloudflare", "ai crawlers", "robots.txt", "cdn", "geo"]
featured: true
---

Your robots.txt can allow every AI crawler in existence and none of them will reach your site. That is not a paradox, it is an ordering problem: a CDN decides whether to answer a request before your server ever sees it, so a firewall rule blocking AI bots takes effect while your robots.txt sits unread on the origin.

In 2024 Cloudflare shipped a one-click control for exactly this, and in 2025 it began enabling AI-crawler blocking by default for new zones. The result is a large population of sites that have opted out of AI visibility without anyone editing a file or making a decision.

## Why robots.txt cannot tell you

robots.txt is a voluntary protocol. A compliant crawler fetches `/robots.txt`, reads the rules, and honors them. Every step of that assumes the crawler can reach your origin.

Firewall and bot-management rules operate a layer earlier. The request arrives at the edge, gets matched against a rule, and is answered with a block. From the crawler's perspective the site is unreachable or forbidden. From your perspective the robots.txt is perfect. Both are true at once, which is what makes this failure mode so persistent.

The practical consequence: a green result from any robots.txt checker is necessary but not sufficient. It tells you the policy you wrote. It says nothing about the policy your CDN is enforcing.

## What changed at Cloudflare

Cloudflare introduced a single-click block for AI scrapers and crawlers, described in its own announcement of [blocking AI bots with one click](https://blog.cloudflare.com/declaring-your-aindependence-block-ai-bots-scrapers-and-crawlers-with-a-single-click/). It later moved toward enabling this by default for newly created zones, and now groups the controls under a dedicated [AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/) feature.

There is a second mechanism worth knowing about, because it is easier to miss. Cloudflare can serve a managed robots.txt that injects its own directives above yours. When that is on, the file crawlers fetch is not the file in your repository. You can have `Allow: /` for GPTBot in source control and `Disallow: /` in the served response.

## How to check, in order

**Look at the served file, not your repository.** Fetch `https://yourdomain.com/robots.txt` and read what comes back. If it contains directives you did not write, or `Content-Signal` lines, something upstream is editing it.

**Check the response headers.** A `server: cloudflare` header or a `cf-cache-status` header confirms you are behind Cloudflare. That does not prove blocking is on, but it tells you there is a layer that can block.

**Open the dashboard.** This is the only authoritative answer. In Cloudflare, go to Security, then Bots, and review the AI-crawler controls, plus the managed robots.txt setting. No external tool can read your dashboard state for you, and any tool claiming to has guessed.

**Confirm with your logs.** Your server's access log is the ground truth for whether crawlers arrive. If robots.txt is permissive, the dashboard looks fine, and your log still shows zero AI crawler hits over a month, something between the internet and your origin is still saying no.

## The honest limits of automated checking

We built the [AI Crawler Access Checker](/ai-crawler-access-checker) to compute per-bot verdicts from robots.txt and to flag Cloudflare from response evidence. It is worth being precise about what that flag can and cannot establish.

When the fetch exposes response headers, the tool reports Cloudflare from the headers and tells you which settings can override your file. When it can only retrieve the file body, it says the firewall check could not run, rather than reporting no Cloudflare found. That distinction matters more than it might appear: on the single most consequential check in the tool, a confident false negative would be worse than no answer. Absence of evidence is not evidence of absence, and a tool that blurs the two is not one you should trust with the rest of its output either.

The in-file signals are still checked in both cases, so a managed robots.txt section or a Content-Signal line is caught either way.

## If you find yourself blocked

Decide what you actually want first, because the default is a blunt instrument. Blocking training crawlers while allowing search and on-demand fetchers is a coherent, common position: models do not train on your content, but ChatGPT, Claude and Perplexity can still cite and link you. The default AI-bot block does not draw that line for you.

Once you know the policy, set it in both places. Adjust the CDN rules to match, then write the corresponding robots.txt so your intent is documented where anyone can read it. The [AI Robots.txt Generator](/ai-robots-txt-generator) produces a correct group per token and states what each block costs before you ship it.

Then verify from outside. Re-fetch the live file, and check your access log a week later to confirm the crawlers you allowed are actually arriving. Permission and arrival are different facts, and only the log knows the second one.

## Two layers, one policy

The lesson generalizes beyond Cloudflare. Any CDN, WAF or bot-management product can enforce a crawl policy your origin never sees. If you take AI visibility seriously, you now have two places where that policy lives, and they drift apart silently. Check both, and treat any tool that only reads robots.txt, including ours, as answering half the question.

## Sources

- [Cloudflare: block AI bots, scrapers and crawlers with a single click](https://blog.cloudflare.com/declaring-your-aindependence-block-ai-bots-scrapers-and-crawlers-with-a-single-click/)
- [Cloudflare AI Crawl Control documentation](https://developers.cloudflare.com/ai-crawl-control/)
- [Cloudflare bot concepts](https://developers.cloudflare.com/bots/concepts/bot/)
- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)
- [nginx HTTP log module (for reading access logs)](https://nginx.org/en/docs/http/ngx_http_log_module.html)
