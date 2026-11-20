---
title: "How to Tell Whether AI Crawlers Are Actually Reading Your Site"
description: "Allowing crawlers in robots.txt is permission, not proof. Your server access log is the only record of which AI bots arrived, what they fetched and what they got back."
date: "2026-08-29"
author: "Chandrabhan Shekhawat"
tool: "ai-crawler-log-analyzer"
category: "geo-tools"
tags: ["server logs", "ai crawlers", "analytics", "nginx", "geo"]
featured: false
---

Every article about AI visibility tells you to allow AI crawlers. Almost none tell you how to find out whether they came. That gap matters, because permission and arrival are different facts, and the difference is where most AI-visibility work quietly fails.

There is exactly one authoritative source for the answer, and it is already on your server.

## Why analytics cannot answer this

Google Analytics and similar tools work by running JavaScript in a visitor's browser. That script reports the pageview.

AI crawlers generally do not execute JavaScript. No script, no report. They are structurally invisible to analytics, not filtered out but never seen in the first place. If you have been checking GA4 for GPTBot traffic, you have been checking a tool that cannot observe it.

Server logs record every HTTP request regardless of what the client runs. That is why they are the ground truth here. Both [nginx](https://nginx.org/en/docs/http/ngx_http_log_module.html) and [Apache](https://httpd.apache.org/docs/current/logs.html) write them by default.

## What to look for

Find your access log, usually at `/var/log/nginx/access.log` or `/var/log/apache2/access.log`, and search it for the user-agent tokens: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Bingbot`, `CCBot` and the rest.

Four things are worth extracting, and only the first is obvious.

**Which bots appeared, and how often.** The absolute number matters less than the comparison. If Bingbot visits six thousand times and OAI-SearchBot twelve, that ratio is the finding.

**When each was last seen.** A crawler that stopped two months ago is a different problem from one that never came.

**What they fetched.** The top paths per bot reveal what a crawler thinks your site is about, and frequently that it is spending its budget on pages you do not care about.

**What status codes they received.** This is the one people skip. A bot with thousands of hits and a wall of 403s is being turned away, not served. High traffic with a low success rate looks like health in a naive count and is worse than no visits at all.

## Reading a month in your browser

Parsing this by hand with grep and awk works and is a reasonable first step. For a fuller picture we built the [AI Crawler Log Analyzer](/ai-crawler-log-analyzer), which reads an nginx or Apache log and reports per-bot counts, first and last seen, top paths, status-code health and a daily trend.

It runs entirely in your browser, and here that is a requirement rather than a feature. Access logs contain the IP address of every human who visited your site, which is personal data under GDPR and comparable regimes. Uploading a raw log to a third-party analyzer discloses your visitors' data to that third party. Our parser discards the IP column as it reads, so it is never stored or displayed, and no request carrying log data is ever made.

Paste your sitemap URLs alongside and it inverts the question, listing the pages no AI crawler has ever fetched. That list is usually more actionable than the list of pages they have.

## When the answer is zero

A month of logs with no AI crawler hits has three likely explanations, worth checking in order.

**The window predates AI crawling of your site.** Try a longer period before concluding anything.

**Something is blocking them.** Check robots.txt with the [AI Crawler Access Checker](/ai-crawler-access-checker), then check your CDN. Cloudflare blocks AI crawlers by default on newer zones, at the firewall, before robots.txt is read. That is the single most common cause of a permissive file and an empty log.

**A CDN is answering them.** If edge caching serves crawler requests, they never reach your origin and never appear in origin logs. Pull CDN logs for the real picture. This also means origin logs systematically undercount, and you should treat their numbers as a floor.

## Two honest caveats

User-agent strings can be spoofed by anyone. For measuring genuine crawler interest that rarely matters. For a security or blocking decision it does, and you should verify with reverse DNS against the operator's published IP ranges, which OpenAI, Google and others publish for exactly this purpose.

Custom log formats will not parse with standard tooling. If your `log_format` reorders or omits fields, export the default combined format instead, and check what proportion of lines a parser actually matched before trusting its totals.

## Close the loop after every change

The habit worth building is simple. When you change robots.txt or a CDN bot setting, note the date. Crawlers re-read robots.txt within about a day. A week later, pull the log and check whether the change had the effect you intended.

Without that loop you are optimizing against a model of your site rather than your site. With it, you find out that the policy you shipped and the behavior you got are not always the same thing, which is worth knowing early rather than after a quarter of assuming.

## Sources

- [nginx HTTP log module](https://nginx.org/en/docs/http/ngx_http_log_module.html)
- [Apache log files documentation](https://httpd.apache.org/docs/current/logs.html)
- [OpenAI bots and user agents](https://platform.openai.com/docs/bots)
- [Anthropic crawler documentation](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Cloudflare AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/)
