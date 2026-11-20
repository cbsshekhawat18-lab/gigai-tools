---
title: "Upscaling Images for Print vs Web"
description: "Print and screens demand completely different pixel counts. The steps to work out the size you actually need and how upscaling fits each medium."
date: "2026-07-16"
updated: "2026-07-29"
author: "Chandrabhan Shekhawat"
tool: "image-upscaler"
category: "image-tools"
tags: ["print", "web", "resolution", "dpi"]
featured: false
---

The right size for an image depends entirely on where it's going. A picture that's gloriously oversized for a web page can be far too small for a poster, and one sized for print can be needlessly heavy on a website. Before you enlarge anything, it pays to understand what each medium actually asks for.

## The core difference: DPI vs pixels

Screens and printers measure detail differently.

- **The web thinks in pixels.** A browser doesn't care about DPI. It cares how many pixels wide your image is versus the space it fills. A 1920-pixel-wide image comfortably fills most full-width layouts.
- **Print thinks in density.** Printers pack pixels into physical inches, [dots per inch](https://en.wikipedia.org/wiki/Dots_per_inch), typically at **300 DPI** for crisp photos viewed at arm's length. So the physical size you want, multiplied by 300, tells you the pixels you need.

One myth worth killing while we're here: changing the "DPI" number saved inside a file does nothing to its quality. DPI is just an instruction to the printer about how densely to lay the same pixels down. What matters is whether you *have* enough pixels for the physical size, which is pure arithmetic.

## Working out the pixels you need

For **print**, multiply the printed dimensions by your target DPI:

- A 4×6 inch photo at 300 DPI needs **1200 × 1800** pixels.
- An 8×10 print at 300 DPI needs **2400 × 3000** pixels.
- An A4 page (roughly 8.27 × 11.69 in) at 300 DPI needs about **2480 × 3508** pixels.

(Large-format posters are the exception: viewed from across a room, 150 DPI or even less looks fine, which is why billboard images aren't gigapixel files.)

For **web**, match common display widths instead:

- Thumbnails: 300–500 px wide.
- In-article images: 800–1200 px wide.
- Full-width hero banners: 1600–2000 px wide.

Once you know the target, you know whether you even need to upscale, and by how much.

## When upscaling earns its keep

If your source falls short of the numbers above, a 2x or 4x pass with our [image upscaler](/image-upscaler#workspace) can close the gap. A 1200×900 photo that's fine for the web but too small for an 8×10 print becomes 2400×1800 at 2x, right in the ballpark for a quality print. (The tool runs an ESRGAN neural network in your browser rather than a plain stretch, [here's the difference that makes](/blog/enlarge-photos-without-turning-them-blurry).)

The medium changes how forgiving that enlargement is:

- **Screens are forgiving.** Viewers sit back, and a touch of softness from a 2x web upscale is rarely noticed.
- **Print is unforgiving.** Held close and lit brightly, prints reveal every soft edge, so aim for genuine 300 DPI and lean toward a modest 2x rather than a stretched 4x.

## Format choices by medium

Where the image ends up should decide its format:

- **Print:** export as **PNG** or another lossless format that preserves every pixel. Compression artefacts that hide on a screen show up badly on paper.
- **Web:** favour **WebP** for the best size-to-quality ratio, or **JPG** for universal support. Lighter files load faster and help your page's [Core Web Vitals](https://web.dev/articles/vitals).

## A practical routine

1. Decide the destination, screen or paper, and the exact size.
2. Calculate the pixels required (physical size × 300 for print. Display width for web).
3. Compare against your source. If it's short, upscale by the smallest factor that reaches the target.
4. Export in the format that suits the medium: lossless for print, efficient for web.
5. For print, order a small test before committing to a large run.

Get the arithmetic right first and upscaling becomes a precise tool rather than a guess. You'll enlarge exactly as much as the medium demands. No blurry prints, no bloated web pages.

## Sources

- [Dots per inch (Wikipedia)](https://en.wikipedia.org/wiki/Dots_per_inch)
- [Web Vitals (web.dev)](https://web.dev/articles/vitals)
