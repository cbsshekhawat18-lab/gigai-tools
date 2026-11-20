---
title: "How to Optimise Images for a Faster Website (Compress + Convert to WebP)"
description: "Images are usually 50%+ of page weight. Learn the resize, compress and convert-to-WebP workflow that speeds up your site and lifts Core Web Vitals."
date: "2026-07-08"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "image-tools"
tags: ["performance", "core-web-vitals", "webp", "image-optimization", "page-speed"]
featured: true
---

Images are almost always the heaviest thing on a web page. On a typical site they account for **more than half of the total bytes downloaded**, often more than your HTML, CSS and JavaScript combined. That makes image optimisation the single highest-leverage speed improvement most sites can make. Fix your images and everything feels faster: pages paint sooner, mobile users on slow connections stop bouncing, and your Core Web Vitals scores climb.

This is the complete workflow, in the order that actually matters. Get these three steps right (**resize, compress, convert**) and you'll ship a fraction of the bytes with no visible loss in quality.

## Why heavy images hurt more than you think

An oversized image doesn't just take longer to download. It causes three separate problems:

1. **Slow paint.** Your hero image or the first big photo a visitor sees is frequently the *largest element on the page*. Google measures how long that takes to appear as **Largest Contentful Paint (LCP)**: one of the three Core Web Vitals. A 2 MB banner can single-handedly wreck your LCP on mobile.
2. **Layout shift.** If the browser doesn't know an image's dimensions ahead of time, content jumps around as pictures load. That's measured as **Cumulative Layout Shift (CLS)**, and it's infuriating for users trying to tap a button.
3. **Wasted bandwidth.** Serving a 4000-pixel-wide photo into a 600-pixel slot means the browser downloads roughly 40× more pixels than it displays, then throws most of them away. Every one of those bytes cost your visitor time and data.

The upside: all three are fixable in a few minutes per image, with no Photoshop, paid CDN or build pipeline. You can do the whole thing in your browser.

## The three-step workflow (in the right order)

Order matters here. Doing these steps out of sequence wastes effort, so follow them top to bottom.

### Step 1, Resize to the real display size

This is the step most people skip, and it's the biggest win of all. There is no point serving a 4000×3000 photo if it's displayed in an 800-pixel-wide column.

Figure out the largest size an image is *actually shown* at, then add a little headroom for high-density (Retina) screens, roughly **2× the CSS display width**. So an image shown at 600px wide should be exported at around 1200px wide, and no larger.

Use the [image resizer](/image-resizer) to set exact pixel dimensions before you do anything else. Resizing first means every later step operates on a smaller image, which makes them faster and more effective. A single resize often cuts file size by 70–90% on its own, before you've touched compression or format.

### Step 2, Compress to strip the waste

Once the dimensions are right, squeeze out the redundant data. Most photos straight from a camera or a design tool carry far more quality than the human eye can detect on a screen, plus metadata you don't need.

Run the file through the [image compressor](/image-compressor) and watch the before/after size it reports. For photographs, you can usually drop a surprising amount of file size before any difference becomes visible. Compress, glance at the result at full size, and if it still looks clean, you're done. Because it runs locally, you can iterate on the setting instantly with no uploads.

### Step 3: Convert to WebP for the final saving

With the image resized and compressed, re-encode it as **WebP**, a modern format that's typically **25–35% smaller than an equivalent JPG**, and dramatically smaller than PNG, at the same visual quality. Every current browser supports it.

Drop your file into the [WebP converter](/webp-converter), start around quality 80, and compare the size. This is the final polish on top of the work you've already done. If you have logos, icons or screenshots with sharp edges and flat colour, WebP helps there too, and for those, keeping a PNG source and converting is often better than forcing them through JPG.

## Which format for which image?

Format choice is where a lot of savings hide. Here's a quick reference:

| Image type | Best delivery format | Why |
|---|---|---|
| Photographs, hero banners | WebP (fallback JPG) | Smallest size for complex, continuous-tone images |
| Logos, icons, flat graphics | WebP (fallback PNG) | Keeps sharp edges. Supports transparency |
| Screenshots with text | WebP or PNG | Avoids the fuzzy artefacts JPG adds to text |
| Anything needing transparency | WebP or PNG | JPG cannot store an alpha channel |

The pattern is simple: **WebP is your delivery format for almost everything**, with JPG or PNG kept as the source and as a safety-net fallback.

## Serve WebP safely with a fallback

Even though support is universal on modern browsers, the professional habit is to let the browser choose. The `<picture>` element does this automatically:

```html
<picture>
  <source srcset="/img/hero.webp" type="image/webp">
  <img src="/img/hero.jpg" alt="Product hero"
       width="1200" height="600" loading="lazy">
</picture>
```

Notice the extras on the `<img>` tag. They matter as much as the format:

- **`width` and `height`** let the browser reserve the right space immediately, which kills layout shift (protecting your CLS score).
- **`loading="lazy"`** tells the browser to skip below-the-fold images until the user scrolls near them, so they don't compete with your critical content. Leave it *off* your hero/LCP image, though. You want that one to load as early as possible.

## The Core Web Vitals payoff

How to do it the workflow maps directly onto the metrics Google uses for ranking and page-experience signals:

- **LCP (loading):** Resizing and converting your hero image is often the fastest way to pull LCP under the 2.5-second target. A lighter largest element paints sooner.
- **CLS (stability):** Setting explicit `width` and `height` on every image stops the page from jumping as they load.
- **INP (interactivity):** Fewer and lighter image bytes free up bandwidth and main-thread time, so the page becomes tappable sooner.

For a typical content or e-commerce page, applying all three steps commonly cuts total image weight by well over half, and that reduction tends to show up directly in your LCP, because the largest element on the page is so often an image.

## An honest note on browser-based optimisation

Doing this in the browser is genuinely great for privacy and speed: nothing is uploaded, there's no queue, no account, and you can iterate on quality in real time. But be clear-eyed about the trade-offs:

- **It's manual.** For a handful of important images (your hero, your top product shots, your blog headers) hand-optimising is perfect and gives you full control. For a site generating *thousands* of images automatically, you'll eventually want an automated pipeline or an image CDN that resizes and converts on the fly.
- **It doesn't set caching or `srcset` for you.** These tools produce the optimised file. Wiring up responsive `srcset`, lazy loading and cache headers is still your job in the page template.
- **Keep your originals.** WebP is a *delivery* format. Always keep the full-resolution PNG or JPG master as your source of truth and generate WebP copies from it.

Used on the images that actually matter, this workflow gets you most of the benefit for a fraction of the effort.

## Your image-optimisation checklist

Copy this and run through it for each important image on your site:

- [ ] **Resize** to no more than ~2× its display width using the [image resizer](/image-resizer)
- [ ] **Compress** to strip excess quality and metadata with the [image compressor](/image-compressor)
- [ ] **Convert** the final file to WebP (quality ~80) using the [WebP converter](/webp-converter)
- [ ] Add explicit `width` and `height` attributes in your HTML
- [ ] Add `loading="lazy"` to below-the-fold images (never the hero)
- [ ] Serve WebP with a JPG/PNG fallback via `<picture>`
- [ ] Keep the original high-res file as your master

## The pipeline we run on our own images

This site practises what this post preaches, with the same engines you can use: MozJPEG for photographic JPEGs, libwebp for the WebP copies, OxiPNG losslessly squeezing every PNG. All three run as WASM in the [image compressor](/image-compressor) and [WebP converter](/webp-converter). One workflow note from experience: resize FIRST with the [image resizer](/image-resizer) (pica's Lanczos filter), then compress. Compressing pixels you are about to throw away wastes both time and quality budget.

## Start with your heaviest image

You don't have to optimise your whole library today. Open your browser's DevTools, go to the **Network** tab, filter by images and sort by size, then fix the biggest offender first. Resize it, [compress it](/image-compressor), [convert it to WebP](/webp-converter), and re-check your page. That one change on your hero image often moves your LCP more than everything else combined.

Everything runs entirely in your browser, so nothing is uploaded and there's nothing to install. Grab your slowest page's biggest image and put it through the [image resizer](/image-resizer) now: you'll usually see the file shrink by 80% or more before you've even reached the compression step.

## Sources

- [Image file type and format guide (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)
