---
title: "How to Split a PDF into Multiple Files"
description: "A clear, step-by-step walkthrough for breaking one PDF into several smaller documents (every page, or custom ranges) right in your browser, with nothing"
date: "2026-07-08"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "split-pdf"
category: "pdf-tools"
tags: ["split pdf", "pdf tools", "how-to", "privacy"]
featured: true
---

A single PDF often carries more than one job inside it: a contract with an appendix you need to send separately, a scanned pack of receipts, a report where only chapter three is relevant. Splitting that file into several smaller documents is one of the most common PDF tasks, and one of the easiest to do badly if you rely on screenshots or "print to PDF" tricks.

This guide shows the clean way to do it, page by page or range by range, without ever handing your document to a server.

## When splitting beats everything else

Reach for a split whenever you need **part of a document to stand on its own**:

- Emailing a client only the pages they asked for, not the whole file.
- Turning a merged batch of statements into one file per recipient.
- Separating a long study pack so each topic is its own document.
- Isolating the exact pages a form or portal will accept as a single upload.

Merging is the opposite operation, and cropping only trims the edges of a page. When the goal is *fewer pages per file*, splitting is the right tool.

## Two ways to split

There are really only two questions to answer: **how many files** do you want, and **which pages go in each one?**

### Every page

The simplest mode bursts your PDF into one single-page file per page. A 12-page document becomes 12 separate PDFs. This is ideal for bursting statements, payslips or scanned forms where each page is a self-contained record.

### Custom ranges

When you want to keep sections together, custom ranges give you precise control. You type the spans you want, for example:

- `1-3, 4-8, 9` produces three files: pages 1-3, pages 4-8, and page 9 on its own.
- A single number like `5` extracts just that page.
- Ranges are **1-based and inclusive**, so `4-4` and `4` mean the same thing.

Each comma-separated range becomes exactly one output file, so you always know how many documents you'll end up with before you click.

## Step by step

1. **Add your PDF.** Open the [Split PDF tool](/split-pdf) and drop in a single file. It is read directly by your browser, not sent anywhere, and every page renders as a thumbnail so you can see what you're working with.
2. **Pick a mode.** Choose *Every page* to make one file per page, or *Custom ranges* to define your own spans.
3. **Set your ranges** (ranges mode only). Type them against the thumbnail grid so you're never guessing at page numbers.
4. **Split.** The tool builds each smaller document locally, in a moment.
5. **Download.** Save each file, or grab the whole batch as a single ZIP.

## Why do it in the browser

Because the split happens entirely on your device with pdf-lib, three things are true at once:

- **It's private.** Your PDF never leaves your computer. Nothing is uploaded, stored or logged.
- **It's fast.** There's no queue and no round-trip, so even a large manual splits in seconds.
- **It's lossless.** Each output copies its pages over as-is, so text stays selectable and images keep their resolution. No watermark is ever added.

## A quick sanity check

Before you split, glance at the thumbnails and confirm your highest page number actually exists. If a range points past the end of the document, you'll see an "out of bounds" message rather than a broken file, the tool refuses to produce a mangled PDF, which is exactly what you want.

Once you have your pieces, you can always [merge them back together](/merge-pdf) or [compress the results](/compress-pdf) if any file feels heavy. Splitting is quick, unlimited and free, so experiment until the cut is exactly right.

## Sources

- [pdf-lib](https://github.com/Hopding/pdf-lib), each part is a fresh document receiving exact page copies
- [PDF (Wikipedia)](https://en.wikipedia.org/wiki/PDF)
