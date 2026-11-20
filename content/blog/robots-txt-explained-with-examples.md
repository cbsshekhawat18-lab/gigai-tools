---
title: "Robots.txt Explained (With Real Examples)"
description: "Understand robots.txt: how it controls crawlers, the exact syntax for User-agent, Disallow and Allow, common templates, and the mistakes that can deindex your site."
date: "2026-07-24"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "seo-tools"
tags: ["robots-txt", "crawling", "crawl-control", "technical-seo", "search-engines"]
featured: true
---

`robots.txt` is one of the smallest files on your website and one of the easiest to get catastrophically wrong. It's a plain text file at your site root that tells search-engine crawlers which parts of your site they may and may not visit. Used correctly, it keeps crawlers focused on your valuable pages and away from clutter. Used carelessly, a single line can block Google from your entire site. This guide explains exactly how robots.txt works, with copy-ready examples and a clear list of the traps to avoid.

## What robots.txt is (and isn't)

When a well-behaved crawler arrives at your site, the first thing it does is fetch `https://yoursite.com/robots.txt`. That file, written in the Robots Exclusion Protocol, tells the crawler which URL paths it's allowed to request. It's a set of instructions crawlers voluntarily follow.

That word (*voluntarily*) matters, and it leads to the single most misunderstood thing about robots.txt:

**Robots.txt controls crawling, not indexing, and it is not a security tool.** Reputable crawlers (Googlebot, Bingbot) obey it. Malicious bots and scrapers ignore it entirely. And crucially, blocking a page in robots.txt does *not* reliably keep it out of Google's index, if other sites link to that URL, Google can still list it (usually without a description, showing "No information is available for this page"). If you truly need a page kept out of search results, use a `noindex` meta tag instead, and don't block the page in robots.txt, or the crawler can't see the `noindex` in the first place. Never put private data behind robots.txt. That file is publicly readable by anyone.

## The syntax, line by line

A robots.txt file is made of *groups*. Each group starts with one or more `User-agent` lines naming which crawler it applies to, followed by rules.

### User-agent
Names the crawler the rules apply to. `*` means "all crawlers."

```
User-agent: *
```

You can also target specific bots by name, e.g. `User-agent: Googlebot`.

### Disallow
Blocks the crawler from a path. The path is matched from the start of the URL.

```
Disallow: /admin/
```

This blocks anything under `/admin/`. A bare `Disallow: /` blocks the *entire site*: the nuclear option.

### Allow
Carves an exception out of a broader `Disallow`. Useful when you block a folder but want one file inside it crawled.

```
Disallow: /private/
Allow: /private/public-report.pdf
```

### Sitemap
Points crawlers to your XML sitemap. This line is independent of any group and can go anywhere in the file: it's the recommended way to advertise your sitemap.

```
Sitemap: https://example.com/sitemap.xml
```

### Wildcards
`*` matches any sequence of characters and `$` matches the end of a URL:

```
Disallow: /*.pdf$       # block all URLs ending in .pdf
Disallow: /*?sort=      # block any URL containing ?sort=
```

## Real-world examples

### Allow everything (the most common)
For a typical site with nothing to hide, the simplest healthy robots.txt allows full crawling and points to the sitemap:

```
User-agent: *
Disallow:

Sitemap: https://example.com/sitemap.xml
```

An empty `Disallow:` explicitly permits everything. (If you want to allow all crawling, this (not an empty file) is the clearest way to say so.)

### Block admin and utility areas
Keep crawlers out of pages that waste crawl budget and never belong in search:

```
User-agent: *
Disallow: /admin/
Disallow: /cart/
Disallow: /checkout/
Disallow: /search
Disallow: /*?

Sitemap: https://example.com/sitemap.xml
```

Here `/*?` blocks URLs with query strings: useful for stopping crawlers from wandering through endless filter and sort combinations.

### Different rules for different bots
```
User-agent: Googlebot
Disallow: /no-google/

User-agent: *
Disallow: /private/

Sitemap: https://example.com/sitemap.xml
```

Googlebot follows only the group that names it. All other bots follow the `*` group.

### Block a staging site entirely
The one time `Disallow: /` is correct, on a development or staging domain you never want indexed:

```
User-agent: *
Disallow: /
```

Just be certain this file never gets copied to production. Which brings us to the mistakes.

## The mistakes that hurt

Because robots.txt is so terse, a tiny error has an outsized blast radius.

- **The accidental site-wide block.** `Disallow: /` on your live site tells every crawler to stay out, and traffic collapses. This most often happens when a staging robots.txt gets deployed to production. After any launch or migration, check your live robots.txt first.
- **Blocking CSS and JavaScript.** Old advice said to hide these files. Don't. Google renders pages like a browser, and if it can't fetch your CSS and JS, it can't see your layout, which can hurt rankings, especially for mobile-friendliness. Leave your assets crawlable.
- **Using robots.txt to hide a page from search.** As covered above, blocking crawl doesn't guarantee de-indexing and can actually *prevent* your `noindex` from being seen. Use `noindex` for that job.
- **Blocking your sitemap's own URLs.** Listing pages in your sitemap while blocking them in robots.txt is contradictory and generates Search Console errors. Keep the two consistent, see [how to create an XML sitemap](/blog/how-to-create-an-xml-sitemap) for the pairing.
- **Case and trailing-slash slips.** Paths are case-sensitive and prefix-matched. `Disallow: /Admin` won't block `/admin`. Precision matters.
- **Wrong location.** The file must sit at the root, `https://example.com/robots.txt`, and nowhere else. Crawlers only look there.

## Create and check yours safely

Given how one character can deindex a site, generating and validating robots.txt beats hand-editing. Build a correct file, with your disallow rules and sitemap line, using the [robots.txt generator](/robots-txt-generator), which keeps the syntax clean and the sitemap reference in place.

Then, before and after you deploy, **test it**. Paste your file into the [robots.txt validator](/robots-txt-validator) to catch syntax errors and confirm that the paths you *think* you're blocking are actually blocked, and, just as important, that you're not accidentally blocking pages you want crawled. Google Search Console also offers a robots.txt report showing the live file Google has fetched, which is the definitive check for what's really in effect.

## A crawling directive, nothing more

Robots.txt is a small file with large consequences. It steers crawlers toward what matters and away from clutter, and it advertises your sitemap, but it's a crawling directive, not an indexing or security control. Keep it simple, keep CSS and JS crawlable, use `noindex` (not robots.txt) to hide pages from search, and always validate before you ship. Generate a clean file with the [robots.txt generator](/robots-txt-generator), verify it with the [robots.txt validator](/robots-txt-validator), and pair it with a tidy sitemap and solid [meta tags](/blog/meta-tags-explained-a-complete-guide) for a technical foundation that helps rather than hurts.

## Validate before you deploy, not after

One wrong character in this file can deindex a site, which is why we ship both halves of the workflow: the [generator](/robots-txt-generator) writes clean syntax from choices you click, and the [validator](/robots-txt-validator) reads an existing file and tells you which paths are actually blocked for which agents. The check that matters most: confirm you have not blocked CSS or JS directories, since Google renders pages and needs them, and a decorative-looking Disallow can quietly cost rankings.

## Sources

- [RFC 9309 (Robots Exclusion Protocol)](https://www.rfc-editor.org/rfc/rfc9309), robots.txt finally standardised
- [How Google interprets the robots.txt specification](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
