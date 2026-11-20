---
title: "The Complete Guide to PDF Compression"
description: "How PDF compression actually works, the difference between lossy and lossless methods, what browser tools can and can't do, and how to choose the right level"
date: "2026-07-11"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "compress-pdf"
category: "pdf-tools"
tags: ["compress-pdf", "pdf", "compression", "guide"]
featured: false
---

PDF compression sounds like a single button, but under the hood there are several very different techniques doing very different jobs. Understanding them helps you pick the right approach, and set realistic expectations. This is the complete, honest guide.

## What's inside a PDF

A PDF is a container holding a mix of objects: text with embedded fonts, vector graphics, raster images, and metadata. Each type compresses differently:

- **Text and fonts** are stored efficiently and stream-compressed already. Little to gain.
- **Vector graphics** (logos, charts drawn as shapes) are compact by nature.
- **Raster images** (scans, photos, screenshots) are almost always the heavyweight, and the real target of compression.

If you remember one thing: **the images are where the size is.** A file's compressibility is decided mostly by how much of it is pictures.

## Lossless vs lossy compression

There are two broad families, and they answer different questions.

**Lossless** removes redundancy without discarding any information. The decompressed file is bit-for-bit identical. It includes stream compression, removing duplicate objects, and subsetting fonts to only the glyphs used. Savings are real but modest, typically 5-20%.

**Lossy** discards information your eyes are unlikely to miss: chiefly by re-encoding images as JPEGs at lower quality or downsampling their resolution. This is where the big numbers come from: 50%, 70%, sometimes more on scanned documents. The cost is that the loss is permanent and images soften as you push harder.

Most "shrink my PDF" moments call for lossy compression, because the images are the problem and lossless barely touches them.

## What browser-based compression can (and can't) do

Tools that run entirely in your browser: like the [Compress PDF tool](/compress-pdf). Use a pragmatic lossy approach: they render each page and re-encode it as an optimised JPEG at a quality and scale you choose. That's genuinely effective on image-heavy and scanned files, and it never uploads your document anywhere.

Being honest about the trade-offs:

- **Text becomes an image.** Because each page is rasterised, live text is flattened into the page picture and is no longer selectable or searchable. (You can add a text layer back afterwards with an OCR tool.)
- **Text-only PDFs won't shrink.** There are no big images to re-encode, so the saving is negligible. A good tool will simply return your original unchanged rather than making it bigger.
- **It's not server-grade structural optimisation.** Heavy desktop software can restructure objects and downsample selectively. Browser tools trade some of that finesse for total privacy and zero setup.

Knowing these limits up front means you're never surprised by the result.

## Choosing a compression level

Most tools offer Low / Medium / High, which really means "how much image quality am I willing to trade?"

- **Low**: high JPEG quality, sharp pages, a smaller but conservative saving. Good default for documents you'll read closely.
- **Medium**: the everyday sweet spot. Roughly halves many scans with pages that still look clean on screen.
- **High**, aggressive quality reduction for the smallest file. Reserve it for hard size limits, and check the output before sending.

The right move is empirical: try a level, read the reported before/after saving, and step up only if you must.

## A repeatable workflow

1. **Assess the file**. Is it mostly text (won't shrink much) or scans/images (will shrink a lot)?
2. **Keep the original** as a master. Always compress a copy.
3. **Start at Medium** and measure the saving.
4. **Verify** a few pages, not just the first, for softness.
5. **Add OCR afterwards** if you need searchable text back.

## Take only the savings you need

Good PDF compression isn't about the biggest number: it's about matching the method to the file and taking only the savings you need. Understand that images drive size, that lossy trades quality for space, and that browser tools swap a little polish for complete privacy, and you'll get the right result with no unpleasant surprises.

## The guarantee the tool makes

One promise is wired into the code: you can never end up with a bigger file. The compressor rasterises pages and re-encodes them with MozJPEG at the level you chose, then compares the result against your original. If the original was already lean (a pure-text PDF usually is), the tool hands you back the original bytes unchanged rather than a "compressed" file that grew. That comparison is the difference between a tool that optimises and a tool that merely processes.

## Sources

- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
- [PDF (Wikipedia)](https://en.wikipedia.org/wiki/PDF)
