---
title: "Open Graph Tags: The Complete Guide"
description: "Open Graph tags control how your links look when shared on Facebook, LinkedIn, WhatsApp and Slack. Learn every og: tag, the ideal image size, and how to test them."
date: "2026-07-12"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "seo-tools"
tags: ["open-graph", "social-sharing", "og-tags", "link-previews", "social-seo"]
featured: true
---

Paste a link into Slack, LinkedIn, WhatsApp, or Facebook and something appears: a title, a snippet of text, and (if you're lucky) a large, eye-catching image. That preview card can be the difference between a link people click and a bare blue URL they scroll past. It isn't magic or luck. It's controlled by Open Graph tags, a small set of `<meta>` elements you put in your page's `<head>`. This guide covers every tag that matters, the exact image specs, and how to test your cards before they go live.

## What Open Graph is

The Open Graph protocol was introduced by Facebook in 2010 to let any web page describe itself as a rich object in a social feed. Instead of each platform guessing at your title and scraping a random image, you *tell* them exactly what to show. Today it's the de facto standard: Facebook, LinkedIn, WhatsApp, Slack, Discord, Pinterest, iMessage, and most messaging apps all read Open Graph tags to build their link previews.

The tags are ordinary `<meta>` elements, but note the small difference from SEO meta tags. Open Graph uses `property` rather than `name`:

```html
<meta property="og:title" content="Your headline here">
```

That `property="og:..."` naming is required. A tag written as `<meta name="og:title">` will be silently ignored.

## The required Open Graph tags

Four tags form the backbone of every good card. Skip any of these and platforms fall back to guessing.

### og:title
The headline of your card. It can differ from your SEO `<title>`, here you're optimizing for a social feed, so make it punchy and curiosity-driven rather than keyword-led.

```html
<meta property="og:title" content="Compress Any PDF Free - No Upload, No Sign-Up">
```

### og:description
A short line beneath the title, roughly two to four sentences' worth (around 2–4 lines render before truncation). Sell the click.

```html
<meta property="og:description" content="Shrink PDFs right in your browser and keep them private. Free, instant, no watermark.">
```

### og:image
The most important tag by far. The image is what stops the scroll. A card without one shares as a small, dull link. A card with a strong image commands attention. We'll cover the exact specs below.

```html
<meta property="og:image" content="https://example.com/share-card.png">
```

### og:url
The canonical URL of the page. This tells platforms which page the share belongs to and consolidates share counts and engagement onto one address even when the link has tracking parameters.

```html
<meta property="og:url" content="https://example.com/compress-pdf">
```

## Recommended supporting tags

Beyond the core four, a few tags sharpen the result:

- **`og:type`**, usually `website` for pages or `article` for blog posts. `article` unlocks extra properties like `article:published_time` and `article:author`.
- **`og:site_name`**, your brand name, shown as a small label on the card.
- **`og:locale`**: the content's language and region, e.g. `en_US`.
- **`og:image:width`** and **`og:image:height`**. Declaring the image dimensions lets platforms render the card correctly on first crawl instead of showing a blank while they fetch and measure the image.
- **`og:image:alt`**: accessible alt text describing the image for screen readers.

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="GigAI Tools">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Screenshot of the PDF compressor in a browser">
```

## Getting the image right

This is where most cards fail. The rules:

- **Dimensions: 1200 × 630 pixels.** This 1.91:1 ratio is the standard large-format card size across Facebook, LinkedIn, and Slack. It fills the whole card without cropping.
- **Minimum 600 × 315.** Below this, platforms downgrade you to the small thumbnail layout, which is far less clickable.
- **Keep it under ~5 MB** (some platforms cap lower). A heavy image can time out during crawl and fail to appear.
- **Use an absolute URL.** `og:image` must be a full `https://` URL, not a relative path, the platform's crawler isn't on your site and can't resolve `/images/card.png`.
- **Put important content in the center.** Some surfaces crop the edges. Keep text and logos away from the border.
- **Design for tiny sizes.** Your card will often appear thumbnail-sized in a chat. Big, legible text and a clear focal point beat a busy layout.

## X (Twitter) Cards: the close cousin

X uses its own **Twitter Card** tags, which overlap heavily with Open Graph. The useful part: X will fall back to your Open Graph tags if Twitter-specific ones are missing. But adding a couple of explicit tags gives you control over the large-image format:

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Compress Any PDF Free">
<meta name="twitter:image" content="https://example.com/share-card.png">
```

Note that Twitter Cards use `name`, not `property`. Because there are enough small differences to trip over, it's worth generating these separately with a dedicated [Twitter card generator](/twitter-card-generator) rather than hand-editing.

## Test before you ship

Open Graph tags fail silently. You won't see a broken card on your own page, only when someone shares it. So test proactively:

1. **Use each platform's debugger.** Facebook's Sharing Debugger, LinkedIn's Post Inspector, and X's card validator all fetch your page and show exactly how the card will render, plus any errors.
2. **Force a re-scrape when you change tags.** Platforms aggressively cache your Open Graph data. If you update a card and still see the old preview, use the platform's debugger to clear its cache and re-fetch. Otherwise the stale card can linger for days.
3. **Check on real devices.** A card that looks great on desktop can crop awkwardly in a mobile chat thread.

## The fastest way to do this right

Hand-writing a dozen `og:` tags with the correct `property` naming, absolute image URLs, and matching Twitter Cards is fiddly and easy to get subtly wrong. The [open graph generator](/open-graph-generator) builds a complete, correctly-formatted set from a simple form (title, description, image, URL, type, and the supporting tags) so you can paste it straight into your `<head>` and know the syntax is right.

Open Graph is part of the broader `<head>` picture. If you're setting up a page from scratch, it fits alongside your SEO meta tags, see our [complete guide to meta tags](/blog/meta-tags-explained-a-complete-guide) for how the whole head block comes together, and pair your cards with a compelling [meta description](/blog/how-to-write-meta-descriptions-that-get-clicks) so both your search and social snippets pull their weight.

## Debug the tags a platform actually sees

When a share preview looks wrong, the question is never just "what did I write" but "what does the platform see, and what is it caching." Our [social share inspector](/social-share-inspector) parses the tags from pasted HTML and renders the preview per platform, with the image-size and cache pitfalls this guide lists surfaced as concrete diagnostics. Paste-first matters here too: it works on staging pages and unpublished drafts that no crawling debugger can reach.

## Quick checklist

Before publishing any page you want shared:

- `og:title`, `og:description`, `og:image`, and `og:url` all present.
- `og:image` is an **absolute** URL, **1200 × 630**, under the size cap.
- `og:type` and `og:site_name` set.
- Twitter Card tags added for `summary_large_image`.
- Card tested in at least one platform debugger.
- Re-scraped after any change so the cache updates.

Get these six things right and every link you share turns into a polished card that earns clicks. The cheapest social reach there is.
