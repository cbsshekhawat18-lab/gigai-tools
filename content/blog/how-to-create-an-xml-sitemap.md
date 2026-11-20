---
title: "How to Create an XML Sitemap (and Why You Need One)"
description: "A practical guide to XML sitemaps: what they do for indexing, the exact structure, what to include and exclude, and how to submit yours to Google Search Console."
date: "2026-07-16"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "seo-tools"
tags: ["xml-sitemap", "indexing", "crawling", "search-console", "technical-seo"]
featured: true
---

An XML sitemap is a file that hands search engines a clean, complete list of the pages you want them to find. It doesn't guarantee rankings, and it isn't a substitute for good internal linking, but it's one of the simplest, highest-value technical files you can add to a site. For anything larger than a handful of pages, a sitemap is how you make sure nothing important gets missed during crawling. This guide explains exactly what a sitemap is, how it's structured, what belongs in it, and how to create and submit one.

## What an XML sitemap actually does

Search engines discover pages primarily by following links. That works well for pages linked from your homepage, but it leaves gaps: deep pages buried several clicks down, new pages that nothing links to yet, or content on a large site where the crawler simply hasn't reached every corner. An XML sitemap closes those gaps by giving crawlers a direct, authoritative list of your URLs in one place.

Just as important is what a sitemap communicates *about* each URL: when it was last modified, so the crawler knows what's worth re-checking. On a big site, that hint helps search engines spend their limited crawl budget on the pages that actually changed rather than re-crawling static ones.

Two honest clarifications up front:

- **A sitemap is a suggestion, not a command.** Listing a URL doesn't force Google to index it. Google decides what to index based on quality and its own judgment. The sitemap just ensures your pages are *discovered*.
- **Small sites can survive without one**, but there's no downside to having a sitemap, and real upside as you grow. Google explicitly recommends one for larger sites, new sites with few external links, and sites with lots of media or isolated pages.

## What an XML sitemap looks like

Under the hood, a sitemap is a plain XML file following a shared schema. Here's a minimal, valid example:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-05-01</lastmod>
  </url>
  <url>
    <loc>https://example.com/compress-pdf</loc>
    <lastmod>2026-04-18</lastmod>
  </url>
</urlset>
```

The elements you'll use:

- **`<loc>`** (required), the full, absolute URL of the page. It must be the canonical version, use the correct protocol (https), and match exactly how the page is served.
- **`<lastmod>`**, the date the page last changed, in W3C format (`YYYY-MM-DD`). Genuinely useful *if it's accurate*. Setting every page's `lastmod` to today just so pages look fresh trains Google to ignore the field. Only update it when the content really changed.
- **`<changefreq>` and `<priority>`**: legacy hints for how often a page changes and its relative importance. Google has stated it largely ignores both, so don't spend effort tuning them. They're harmless to include but not worth agonizing over.

## What to include, and what to leave out

The golden rule: **your sitemap should list only the canonical, indexable pages you want in search results.** A sitemap full of URLs that redirect, return errors, or are blocked from indexing sends mixed signals and reduces trust in the file.

Include:
- Canonical URLs of pages you want indexed.
- Important content: key landing pages, articles, product pages.

Exclude:
- Pages with a `noindex` tag. Never list a page you're actively trying to keep out of search.
- Non-canonical duplicates (only the canonical belongs in the sitemap).
- Redirecting URLs (3xx) and error pages (4xx/5xx).
- URLs blocked in robots.txt, see [robots.txt explained with examples](/blog/robots-txt-explained-with-examples) for how crawl-blocking and sitemaps interact.
- Utility pages with no search value (login, cart, thank-you pages).

## The limits you need to know

The sitemap protocol has hard caps:

- **50,000 URLs** per sitemap file, and
- **50 MB uncompressed** per file.

Hit either limit and you split your URLs across multiple sitemaps, then list all of them in a **sitemap index file**, a sitemap of sitemaps:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-1.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-2.xml</loc>
  </sitemap>
</sitemapindex>
```

Most sites never approach 50,000 URLs, so a single file is usually plenty.

## How to create your sitemap

You have a few options depending on your setup:

**Generate one instantly.** For most sites the fastest route is our [XML sitemap generator](/xml-sitemap-generator). Give it your URLs and it produces a valid, correctly-formatted file you can upload straight to your site root. For a step-by-step walkthrough including submission, follow our guide on [how to generate an XML sitemap](/how-to/how-to-generate-an-xml-sitemap).

**Let your CMS do it.** Platforms like WordPress (via Yoast or Rank Math), Shopify, Squarespace, and Next.js can generate and auto-update a sitemap for you. If you're on one of these, check whether a sitemap already exists at `/sitemap.xml` before making one by hand.

**Hand-write it** only for very small or static sites where you can maintain the file yourself, and even then, validating the output matters.

Whichever route you take, **validate before submitting.** A single malformed URL or a stray character can break parsing. Confirm the file opens cleanly and every `<loc>` is an absolute, canonical, live URL.

## Submitting your sitemap

Creating the file is only half the job. You need to tell search engines where it is.

1. **Upload it to your site root**, typically at `https://example.com/sitemap.xml`.
2. **Reference it in robots.txt.** Add a line like `Sitemap: https://example.com/sitemap.xml` to your robots file. Crawlers check robots.txt automatically, so this ensures discovery even without manual submission. You can add this line with the [robots.txt generator](/robots-txt-generator).
3. **Submit it in Google Search Console.** Under *Indexing → Sitemaps*, enter your sitemap URL and submit. Search Console then shows how many URLs it discovered, how many were indexed, and any errors, your feedback loop for fixing problems.
4. **Do the same in Bing Webmaster Tools** if Bing traffic matters to you.

After submission, watch the Sitemaps report over the following days. If Google reports errors (unreachable URLs, invalid format, or URLs blocked by robots.txt) fix them and resubmit.

## Low effort, no downside

An XML sitemap is a low-effort, no-downside file that makes your site easier and faster to crawl completely. Keep it clean (canonical, indexable, live URLs only) reference it in robots.txt, submit it in Search Console, and keep `lastmod` honest. Generate a valid file in seconds with the [XML sitemap generator](/xml-sitemap-generator), then let the [step-by-step how-to](/how-to/how-to-generate-an-xml-sitemap) walk you through submission. Pair it with well-formed [meta tags](/blog/meta-tags-explained-a-complete-guide) and a sensible robots.txt and you've covered the core technical foundation that lets your content actually get found.

## Generate, then read what it made

The [sitemap generator](/xml-sitemap-generator) emits the exact structure this guide describes and keeps the file honest by construction: canonical URL entries with optional lastmod, no styling, no extras that crawlers ignore. Generation happens in your browser from the URL list you provide. After you upload the result, read it back once in the raw: the top mistakes we see are a sitemap referencing http where the site serves https, and staging URLs left in from a test run.

## Sources

- [sitemaps.org protocol](https://www.sitemaps.org/protocol.html): the format itself
- [Build and submit a sitemap (Google Search Central)](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
