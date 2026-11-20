---
title: "How to Add Page Numbers to a PDF: Positions, Formats, and Ranges Explained"
description: "Add page numbers to a PDF the right way (choose position, format, starting number, and which pages to number) for reports, contracts, and long documents."
date: "2026-07-24"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "document-tools"
tags: ["pdf", "page-numbers", "document-formatting", "reports", "document-tools"]
featured: true
---

Page numbers are one of those details you only notice when they're missing. Try to discuss a forty-page contract over the phone without them ("the paragraph near the top of, uh, the page after the table") and you'll appreciate why every serious document has them. Adding page numbers to a PDF is quick, but doing it *well* means making a few deliberate choices: where they sit, how they're formatted, where the count starts, and which pages get numbered at all. This guide walks through each.

## Why number a PDF at all

The obvious reason is navigation, page numbers let people find and cite a specific spot. "See page 12" is unambiguous in a way that "somewhere in the middle" never is. But there's a second, quieter benefit: **completeness**. A numbered document, especially one that reads "Page 3 of 20," tells the reader nothing is missing. For a contract, a report, or a submission, that reassurance matters. If a page falls out of a printed stack or drops from a scan, the gap is obvious.

Many PDFs arrive without numbers, though: a merged bundle of separate files, an exported spreadsheet, a scanned stack. Those are exactly the documents that most need numbering, because they're long and assembled from parts.

## Choose the position

Where the number sits shapes how the document reads. The common placements each have a purpose:

- **Bottom-centre** is the classic, neutral choice. It's what most books and reports use, and it works for almost anything.
- **Bottom-right** suits documents that are read or flipped one-handed. The eye lands there naturally when turning a page.
- **Bottom-outer** (right on odd pages, left on even) is the polished choice for anything meant to be **printed double-sided and bound**, so the number always sits on the outer edge.
- **Top corners** are less common but useful when the bottom margin is busy with footnotes or a footer.

The one rule that matters everywhere: keep the number in the **margin**, clear of your actual content, so it never overlaps text or a table.

## Choose the format

"Page number" is more flexible than it sounds. Depending on the document, you might want:

- **A plain number**, `1`, `2`, `3`: clean and minimal.
- **"Page X"**, a touch more explicit.
- **"Page X of Y"**: the gold standard for formal documents, because it tells the reader the total and confirms nothing's missing. Ideal for contracts, reports, and anything official.
- **Roman numerals**, `i, ii, iii`, traditionally used for front matter (a preface or table of contents) before the main body switches to Arabic numerals.

Our [document page number tool](/document-page-number) lets you pick the format and position, so you can match the convention the document calls for rather than settling for whatever a default gives you.

## Choose the starting number and range

This is where careful documents separate themselves from careless ones, and it's the part people most often overlook.

### Skip the cover page
If your PDF opens with a title page or cover, you usually **don't** want a "1" stamped on it. Number from the *second* page, so the first page of real content reads as page 1. A tool that lets you set which page numbering begins on handles this cleanly.

### Set the starting value
Sometimes the PDF is one section of a larger work, chapter three of a manual that continues from page 47. In that case you want numbering to *start at 48*, not 1, so it fits the whole. Being able to set the starting number, not just "begin at 1," is what makes this possible.

### Number only a range
Occasionally you want numbers on just part of a document: the body but not the appendices, say. Selecting a page range lets you number exactly what should be numbered and leave the rest alone.

## A sensible workflow

Putting it together, a clean approach looks like this:

1. **Assemble the final document first.** Add page numbers *last*, after all merging, splitting, and reordering is done: otherwise the numbers won't match the final page order. If you're still arranging pages, our [document organizer](/document-organizer) lets you reorder, rotate, and delete pages so the sequence is settled before you number it.
2. **Decide the format** the document deserves: "Page X of Y" for anything formal, a plain number for casual use.
3. **Pick the position**, defaulting to bottom-centre or bottom-outer for bound printing.
4. **Set where numbering starts**: skip the cover, and set a custom starting value if this is a continuation.
5. **Preview a few pages**, including one with a dense footer or table, to confirm the numbers sit cleanly in the margin.

## Common mistakes to avoid

A few things quietly undermine otherwise good documents. **Numbering the cover** looks amateurish and throws every subsequent reference off by one. **Numbers overlapping content** happen when the margin is too tight: nudge them outward. **Numbering before finalising the page order** means renumbering later when you inevitably reorder. And **inconsistent numbering across a merged set**, different styles on different sections, makes an assembled document feel stitched together rather than whole.

## Finishing a professional document

Page numbers are usually one of the last steps in polishing a document for delivery, and they sit alongside other finishing touches. For a draft going out for review, a [watermark](/blog/how-to-add-a-watermark-to-a-pdf) marking its status pairs naturally with numbered pages. And if your document started life as a spreadsheet or a Markdown file, our guides on [converting Excel to PDF](/blog/how-to-convert-excel-to-pdf) and [converting Markdown to PDF](/blog/how-to-convert-markdown-to-pdf) cover getting it into PDF in the first place: after which numbering it is the natural next move.

## Four deliberate choices

Adding page numbers to a PDF is quick, but doing it properly is about four deliberate choices: the position (bottom-centre for most, bottom-outer for bound printing), the format ("Page X of Y" for formal documents), the starting point (skip the cover, set a custom start for continuations), and the range. Number the document *last*, after the page order is final, and preview a busy page to make sure the numbers sit cleanly in the margin. Small effort, and it turns a loose stack of pages into a document people can actually navigate and trust.

Ready to number a document? Open our [document page number tool](/document-page-number), free, in-browser, and no sign-up. Need to fix the page order first? Start in the [document organizer](/document-organizer).

## The numbering runs on your machine

Mechanically, the [page number tool](/document-page-number) opens your PDF with pdf-lib in the browser, draws each number as real text at the position and size you chose, and writes a fresh copy. The original file never leaves your device and never changes. Practical notes from the build: custom start values exist precisely for the continuation-document case above, and a range option means a cover page can stay clean without any manual page surgery.

## Sources

- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
- [PDF (Wikipedia)](https://en.wikipedia.org/wiki/PDF)
