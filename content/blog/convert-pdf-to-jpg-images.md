---
title: "Convert PDF to JPG Images"
description: "How to turn every page of a PDF into a JPG image in your browser: choosing the right quality, keeping pages sharp, and downloading them all at once."
date: "2026-07-25"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "pdf-to-jpg"
category: "pdf-tools"
tags: ["pdf", "jpg", "convert", "how-to"]
featured: true
---

Sometimes a PDF is the wrong shape for the job. You want to drop a single page into an email, post it to social media, or embed it in a website where an image loads faster and looks native. The fix is to convert the PDF's pages into JPG images, one picture per page, and it takes only a few seconds.

## Why JPG is the everyday choice

JPG is the format the web was built on. It uses lossy compression tuned for photographic and mixed content, so a page that would be several megabytes as a lossless image often shrinks to a couple hundred kilobytes with no visible difference on screen. That makes JPG the right pick when you want files that are easy to share, quick to upload, and small enough to slip under attachment limits.

The trade-off is that JPG discards a little detail to save space. On most pages (text, photos, colour backgrounds) you'll never notice. Only very fine line art or crisp diagrams benefit from the lossless alternative, PNG.

## Converting step by step

Using our free [PDF to JPG converter](/pdf-to-jpg), the whole process runs inside your browser. Your document is never uploaded to a server.

1. **Add your PDF.** Drag a single file onto the drop zone, or click to browse and select one.
2. **Choose JPG.** Pick the JPG format in the output panel. PNG is there too if you need it, but JPG is the default for good reason.
3. **Set the quality.** Slide the quality control to balance sharpness against file size. Somewhere between 80 and 90 is the sweet spot for almost every page.
4. **Convert.** Each page is rendered to an image and shown as a thumbnail in a preview grid, so you can check the result before saving.
5. **Download.** Save a single page, or click Download all to bundle the whole set into one ZIP.

## Picking the right quality

The quality slider controls the trade-off, so it helps to know the ranges:

- **90–100**, Near-perfect fidelity, larger files. Use it when the images will be zoomed in or printed.
- **80–90**, The everyday sweet spot. Big savings with artifacts that are effectively invisible on screen.
- **60–80**, Aggressive. Fine for casual sharing where size matters more than pixel-perfection.
- **Below 60**, Only for thumbnails or when you truly need the smallest possible file.

When in doubt, start at 88, glance at the preview grid, and nudge from there.

## One image per page, in order

The converter produces exactly one image per page, numbered in sequence, `page-01`, `page-02`, and so on. That padding matters: it keeps the images sorted correctly in your file manager and in the ZIP, so a fifty-page report doesn't scramble itself into `page-1`, `page-10`, `page-2`.

If you only need one page (say, a single chart buried on page 14) convert the whole document anyway and download just that image from the preview. It's faster than hunting for a page-range tool.

## A note on text

Converting a page to JPG turns it into a flat picture. The text becomes part of the image, which means it's no longer selectable or searchable. That's exactly what you want for embedding a page as a graphic, but if you need editable text back, reach for a PDF-to-Word conversion instead.

## Private by default

Because rendering happens locally with pdf.js, nothing about your document leaves your device. No page, image or ZIP is stored or logged, and everything is discarded the moment you close the tab. That makes it safe for contracts, statements and anything else you'd rather not upload. Pick JPG, set a quality, and let the browser do the rest.

## The numbers behind the sharpness

The converter renders each page with pdf.js at double scale, which works out to roughly 150 DPI, and then encodes the result as JPEG. The quality level you pick maps to both the JPEG quality and the render scale, so "high" genuinely draws more pixels rather than just saving the same pixels less thriftily. When a document produces many images, the ZIP you download is assembled in your browser too. At no point does a page leave your machine.

## Sources

- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
- [PDF (Wikipedia)](https://en.wikipedia.org/wiki/PDF)
