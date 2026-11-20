---
title: "Lossy vs Lossless Image Formats"
description: "What lossy and lossless actually mean, why JPEG throws pixels away, why PNG never does, and how to pick the right format for photos, graphics and editing."
date: "2026-07-13"
updated: "2026-07-29"
author: "Chandrabhan Shekhawat"
tool: "jpg-to-png"
category: "image-tools"
tags: ["image formats", "compression", "jpeg", "png", "webp"]
featured: false
---

"Lossy" and "lossless" are two of the most useful words in image editing, and two of the most misunderstood. Get them straight and every decision about formats, quality sliders and conversions suddenly makes sense. Here's the plain-English version.

## Lossy: smaller, but some detail is gone

A **lossy** format shrinks a file by permanently discarding information it judges you won't miss. [JPEG](https://en.wikipedia.org/wiki/JPEG) is the classic example. When it compresses a photo, it splits the image into 8×8-pixel blocks and simplifies the colour and fine-detail data inside each one: exploiting the fact that human eyes notice brightness far more than subtle colour shifts. The result is dramatically smaller, often a tenth of the original size, but the discarded detail is gone forever.

The key phrase is *forever*. You can't undo lossy compression. And because each save runs the process again, repeatedly editing and re-saving a JPEG causes cumulative [**generation loss**](https://en.wikipedia.org/wiki/Generation_loss): soft edges, colour banding and blocky artifacts that pile up with every round trip.

Lossy formats include:

- **JPEG / JPG**, ideal for photographs.
- **WebP (lossy mode)**: smaller than JPEG at similar quality.
- **AVIF**, newer, even more efficient, still gaining support. ([Full three-way comparison here](/blog/avif-vs-webp-vs-jpeg-which-next-gen-image-format-wins).)

## Lossless: every pixel preserved

A **lossless** format compresses the file without throwing anything away. Decompress it and you get back the *exact* pixels you started with, bit for bit, the same guarantee ZIP makes for your documents. [PNG](https://en.wikipedia.org/wiki/PNG) is the everyday lossless format. It's larger than JPEG for photos, but it's perfect, and it stays perfect no matter how many times you save it.

Lossless formats include:

- **PNG**: the standard for graphics, screenshots and editing.
- **WebP (lossless mode)**: a smaller alternative to PNG on the web.
- **GIF**, lossless, but limited to 256 colours.

## The trade-off in one sentence

Lossy trades quality for size. Lossless trades size for quality. Neither is "better", they're built for different jobs.

## How to choose

Match the format to what the image is *for*:

1. **Displaying a photo?** Use a lossy format. JPEG or WebP will look great at a fraction of the size.
2. **Editing an image?** Use lossless. Work in PNG so repeated saves don't degrade it, then export to a lossy format at the end.
3. **Need transparency or sharp text?** Use PNG. It handles both cleanly where JPEG can't.
4. **Shipping to the web and size matters?** Consider WebP, which offers both modes and beats JPEG and PNG on size in most cases.

A small aside on quality sliders, since I ship one in our [compressor](/image-compressor): the number isn't a percentage of quality kept. It's a knob on how aggressively the encoder simplifies. That's why quality 80 usually looks identical to 100 at half the size, while the visible damage only starts much lower: the relationship between the slider and what you see is a curve, not a line.

## A common trap

Converting a lossy file to a lossless one does **not** restore lost quality. If you take a heavily compressed JPEG and save it as PNG, you get a large, pixel-perfect copy of an already-degraded image. The artifacts are baked in. What conversion *does* achieve is stopping any *further* loss, which is exactly why you convert to PNG *before* an editing session, not after.

If you're about to start editing, [turn your JPG into a lossless PNG](/jpg-to-png) first, do all your work, and only compress again when you're finished.

## The mental model

Picture lossy compression as summarising a book: quick to read, but you can't reconstruct the exact original words. Lossless is a photocopy: bulkier, but every word intact. Choose the summary when speed and size win, and the photocopy when fidelity matters. Once that distinction clicks, you'll never guess about image formats again.

## Sources

- [JPEG (Wikipedia)](https://en.wikipedia.org/wiki/JPEG)
- [PNG (Wikipedia)](https://en.wikipedia.org/wiki/PNG)
- [Generation loss (Wikipedia)](https://en.wikipedia.org/wiki/Generation_loss)
