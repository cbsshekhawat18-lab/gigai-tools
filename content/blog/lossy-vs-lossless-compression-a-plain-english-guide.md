---
title: "Lossy vs Lossless Compression: A Plain-English Guide"
description: "What lossy and lossless compression really do to your files, with concrete JPEG, PNG and WebP examples, plus a simple way to choose the right one every time."
date: "2026-07-17"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "image-tools"
tags: ["compression", "lossy", "lossless", "jpeg", "png", "webp"]
featured: true
---

Every time you save an image or shrink a file, one quiet decision is happening in the background: does the software keep every pixel exactly, or does it throw some away to make the file smaller? That single choice, lossless versus lossy compression, decides whether your photo stays razor-sharp, how small it gets, and whether you can safely edit it again next week.

This guide skips the maths and explains what actually happens to your files, with real examples you can reproduce, so you always know which one you want.

## What "compression" even means

Compression is just a way of storing the same picture using fewer bytes. There are two fundamentally different ways to do it.

**Lossless compression** packs the data more cleverly without deleting anything. Decompress the file and you get back the *exact* original: every pixel, bit for bit. Think of it like folding a fitted sheet neatly instead of balling it up: it takes less room, but nothing is missing when you unfold it.

**Lossy compression** goes further. It permanently discards information the format decides your eye won't miss: subtle colour shifts, fine gradients, detail in busy areas. The file gets *dramatically* smaller, but the discarded detail is gone for good. It's less like folding the sheet and more like summarising a long email: quick and compact, but you can't reconstruct the original word for word.

Neither is "better." They're tools for different jobs.

## A concrete example

Take a typical 12-megapixel phone photo, a beach scene, roughly 8 MB straight off the camera. This is what happens when you compress it three ways:

| Method | Format | Rough size | Quality |
| --- | --- | --- | --- |
| Lossless | PNG | ~9–14 MB | Pixel-perfect, often *bigger* than the original JPEG |
| Lossy (high) | JPEG at ~90% | ~1.5 MB | Visually identical on screen |
| Lossy (aggressive) | JPEG at ~60% | ~300 KB | Fine at small sizes. Blocky if you zoom in |
| Lossy | WebP at ~80% | ~250 KB | Same look as the 1.5 MB JPEG, far smaller |

Two things jump out. First, lossless PNG can be *larger* than a lossy JPEG for a photograph, because photos are full of the fine detail lossless has to preserve faithfully. Second, lossy compression buys enormous size savings with no visible cost, right up until you push it too far.

## Why lossy has a hidden catch

The savings are real, but so is the trade-off, and it hides in two places.

**It's permanent.** Once JPEG discards detail, no tool can bring it back. Saving that JPEG as a PNG afterwards gives you a large, pixel-perfect copy of an *already-degraded* image. The artifacts are baked in.

**It compounds.** Every time you open a JPEG, edit it, and save again, the lossy process runs *again* on an already-lossy file. This is called generation loss: edges soften, colours band, and blocky artifacts creep in with each round trip. Do it ten times and a crisp photo turns to mush.

Lossless has neither problem. Save a PNG a hundred times and the hundredth copy is identical to the first.

## When each one matters

Match the method to what the image is *for*.

### Reach for lossy when

- **You're displaying a finished photo.** Websites, social posts, email attachments: a JPEG or WebP at 80–90% looks perfect and loads fast. This is exactly what an [image compressor](/image-compressor) is built for: it applies lossy compression intelligently and shows you the before/after so you can dial in the size you want.
- **File size is the priority.** Getting under an email limit, speeding up a page, freeing storage. Lossy is how you get 10x smaller.
- **The image is photographic.** Continuous tones and gradients are where lossy shines and its artifacts hide best.

### Reach for lossless when

- **You'll edit the image again.** Work in PNG (or another lossless format) so repeated saves don't degrade it, then export to a lossy format once, at the very end.
- **You have sharp edges or text.** Screenshots, logos, diagrams and UI mockups have hard lines that lossy compression smears into fuzzy halos. Lossless keeps them crisp.
- **You need transparency.** PNG preserves transparent areas perfectly. Classic JPEG can't store transparency at all.

## The best of both: modern formats

You don't always have to pick a side. [WebP](/webp-converter) supports *both* a lossy mode (smaller than JPEG at the same quality) and a lossless mode (smaller than PNG), which is why it's become the default for fast websites. Convert a photo to lossy WebP and you often cut 25–35% off an already-optimised JPEG with no visible difference.

The one thing to remember: converting *between* formats doesn't undo past damage. If you [convert a PNG to JPG](/png-to-jpg) to shrink a file, that's a smart lossy save, but if that PNG was made from a battered JPEG, the artifacts are still there. Start from the best-quality original you have.

## A simple rule of thumb

If you're unsure, ask one question: **Am I finished with this image, or will I touch it again?**

1. **Finished, going out into the world?** Compress it with lossy, smaller and faster, no downside for display.
2. **Still working on it?** Keep it lossless until the very last export.
3. **Sharp text, a logo, or transparency involved?** Stay lossless (PNG), or use lossless WebP for the web.

That's genuinely all there is to it. Once the finished-versus-working question becomes a habit, every quality slider and format menu stops being a mystery.

## Both kinds, live, on your own files

You can feel this article's distinction directly in our tools: run a PNG through the [compressor](/image-compressor) as JPEG and watch bytes vanish along with some fidelity (lossy). Run the same PNG through PNG output and OxiPNG squeezes it with every pixel intact (lossless). The PDF side mirrors it: [structural edits](/merge-pdf) are lossless because pages are copied, while [PDF compression](/compress-pdf) is lossy because images are re-encoded. Same file, both philosophies, zero uploads.

## Try it yourself

The fastest way to *feel* the difference is to run one photo through both. Take any JPEG, [compress it](/image-compressor) at a few different quality levels and watch the file size drop, then convert a screenshot to JPG and notice how the text edges soften. Everything runs entirely in your browser. Your files are never uploaded, stored, or seen by anyone. Play with the sliders, compare the previews, and the lossy-versus-lossless distinction will click for good.
