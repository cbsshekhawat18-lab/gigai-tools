---
title: "Extract a Page Range from a PDF"
description: "Need just pages 5 to 12 of a long document? Learn how to pull an exact page range out of a PDF into its own clean file, inclusive, 1-based, and fully private."
date: "2026-07-10"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "split-pdf"
category: "pdf-tools"
tags: ["page range", "split pdf", "extract pages", "pdf tools"]
featured: false
---

Sometimes you don't want to break a whole document apart. You just want *one slice* of it. The signature block from a contract. The results section of a report. A single chapter from a textbook. Extracting a specific page range gives you a clean, standalone PDF containing exactly those pages and nothing else.

This guide is all about getting that range right the first time.

## Ranges, precisely

The single most common mistake with page ranges is an off-by-one error. It helps to fix two rules in your head:

- **Ranges are 1-based.** The first page is page 1, not page 0.
- **Ranges are inclusive.** `5-12` gives you pages 5, 6, 7, 8, 9, 10, 11 and 12: both ends included, eight pages total.

A single number is just a range where both ends match, so `7` and `7-7` both extract page seven on its own.

## Extracting a single range

The [Split PDF tool](/split-pdf) handles a page range as a special case of splitting: one range in, one file out.

1. Open the tool and drop in your PDF. It is read by your browser, not sent anywhere. Every page appears as a thumbnail.
2. Switch to **Custom ranges** mode.
3. Type your range, for example `5-12`.
4. Click split, and you'll get a single PDF containing just those pages.

Because the pages are rendered in front of you, you can confirm the range visually before you commit. If page 5 isn't where you thought it was, you'll spot it in the grid.

## Extracting several ranges at once

You're not limited to one slice. Comma-separate as many ranges as you like, and each becomes its own file:

- `1-2, 10-15, 30` gives you three files: the first two pages, pages 10 through 15, and page 30 alone.
- Ranges can even **overlap** if you need the same pages in more than one output, `1-5, 3-8` is perfectly valid.

This makes it easy to pull several named sections out of a long document in a single pass, without re-uploading or re-processing.

## What "extract" preserves

Pulling a range out doesn't alter the pages themselves. Each extracted page is copied across exactly as it appeared in the original:

- **Text stays selectable**. You can still search and copy from the new file.
- **Images keep their resolution**. Nothing is downscaled.
- **No watermark** is added, and the layout is untouched.

It's a structural operation, not a re-render, so the extracted range is indistinguishable from the same pages in the source document.

## Doing it privately

The extraction runs entirely in your browser with pdf-lib. Your PDF is never uploaded. The pages are copied into a new file on your own device, and when you close the tab, both the original and the output are gone. That matters when the range you're pulling is a signed agreement, a medical record or anything else you'd rather not send across the internet.

## One range, one clean document

Each range you type becomes its own new PDF, built by copying exactly those pages into a fresh document. Because the engine copies rather than re-renders, a range pulled from a 300-page manual is visually identical to those pages in the source, fonts and images included. Ranges that point past the last page are refused with a clear message instead of producing a broken file, and the whole operation happens on your device.

## Common questions

**What if my range runs past the end?** You'll get an "out of bounds" message instead of a broken file. Check the highest page number against the thumbnails: a `1-50` range needs at least 50 pages.

**Can I extract, then split further?** Absolutely. Extract the section you care about, then run that smaller file back through the tool if you need to divide it again.

**What about the leftover pages?** If you want everything *except* a range, deleting is cleaner than extracting, the [Delete PDF Pages tool](/delete-pdf-pages) removes the pages you don't want and keeps the rest. And if you extracted several ranges and later want them combined, the [Merge PDF tool](/merge-pdf) stitches them back into one.

Extracting a page range is a small operation with a big payoff: you get precisely the pages you need, in a clean file, with none of the noise, and none of the privacy trade-offs of uploading. Give it a try on the [Split PDF tool](/split-pdf).

## Sources

- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
- [PDF (Wikipedia)](https://en.wikipedia.org/wiki/PDF)
