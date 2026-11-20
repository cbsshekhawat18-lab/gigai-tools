---
title: "How to Extract Text from a PDF (Including Scanned Ones with OCR)"
description: "Need the words out of a PDF? Learn how text extraction works, why some PDFs copy cleanly while scans give you nothing, and how OCR rescues the text from image-only documents."
date: "2026-07-22"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "document-tools"
tags: ["pdf", "text-extraction", "ocr", "how-to", "productivity"]
featured: true
---

You need the *words* out of a PDF, to quote a report, feed a document into another tool, translate it, or just stop retyping. Sometimes you highlight, copy, paste, and it works instantly. Other times you select the text and get nothing, or paste a jumble of gibberish. The difference isn't luck. It comes down to how the PDF was made. This guide explains the two kinds of PDF, how text extraction actually works, and how to pull clean text out of either one: including the stubborn scanned kind that needs OCR.

## The two kinds of PDF (and why it matters)

Every PDF is one of two species, and everything about text extraction follows from which one you have.

### Text-based (digital) PDFs

These were created digitally, exported from a word processor, a browser's "print to PDF," a design app, or a report generator. The actual characters are stored in the file as text. You can select them, copy them, and search them, because the words are genuinely *there* as data. Extracting text from these is fast, exact, and lossless.

### Image-based (scanned) PDFs

These came from a scanner, a photo, or a fax. Each page is essentially a **picture** of a document. To you it looks like text, but to the computer it's a flat image. There are no characters to select, only pixels arranged to *look* like letters. Try to copy from one of these and you'll get nothing, because there's nothing to copy. This is the single most common reason "I can't get the text out of this PDF."

The quick test: open the PDF, try to select a line of text with your cursor. If it highlights, it's text-based. If your selection just draws a box over a picture, it's a scan.

## How text extraction works on a normal PDF

For a text-based PDF, extraction reads the character data the file already stores and outputs it as plain text: usually a `.txt` file you can drop anywhere. It's the same information you'd get by selecting all and copying, but done cleanly for the whole document at once, without hunting page by page.

To do it without installing anything, open your file in our [PDF to text tool](/pdf-to-txt). It reads the PDF locally in your browser and hands you the extracted text. No upload, so even a confidential document stays on your device. That local-processing point matters for exactly the files people most want to extract from: contracts, records, and reports.

A couple of honest realities about extracting from digital PDFs:

- **Layout gets flattened.** Multi-column pages, tables, and sidebars are stored in a reading order that isn't always the visual one, so complex layouts can extract in a slightly scrambled sequence. Clean prose comes out clean. A dense financial table may need tidying.
- **What you see is what's stored.** If the original embedded odd characters or spacing, extraction faithfully reproduces them.

## When the PDF is a scan: enter OCR

If your PDF is image-based, plain extraction has nothing to grab, the words aren't data, they're pixels. This is where **OCR (Optical Character Recognition)** comes in. OCR is the technology that *looks at* the image of a page, recognizes the shapes as letters and words, and reconstructs the actual text. It's how a picture of a document becomes editable, searchable words.

The process, in plain terms:

1. OCR analyzes the page image and locates regions that contain text.
2. It identifies each character by its shape, assembling them into words and lines.
3. It outputs recognized text you can copy, search, and edit.

OCR is genuinely impressive but not magic. Its accuracy depends heavily on input quality: a crisp, straight, high-resolution scan of clean printed text recognizes almost perfectly, while a faint, skewed, or handwritten page produces more errors. Clear scans of standard fonts are the sweet spot. We go deeper into the mechanics in [free OCR for PDFs: how it works](/blog/free-ocr-for-pdfs-how-it-works), and if your document started life on paper, [extract text from a scanned document](/blog/extract-text-from-a-scanned-document) walks through that specific scenario end to end.

## Choosing your approach

- **Can you select text in the PDF?** Use plain extraction. Open it in [PDF to text](/pdf-to-txt) and you're done in seconds.
- **Is it a scan or photo (text won't highlight)?** You need OCR to recover the words first.
- **Not sure?** Try the selection test above. It takes two seconds and tells you exactly which path you're on.

## Getting the cleanest possible result

A few practical habits make extracted text far more usable:

- **Prefer the digital original if it exists.** If someone scanned a document they *also* have as a Word file or digital PDF, ask for that. It extracts perfectly, no OCR guesswork.
- **For scans, feed OCR the best image you can.** Higher resolution, good contrast, and a straight (not skewed) page dramatically improve accuracy. Straightening a crooked scan first pays off, see [fix a sideways or upside-down PDF](/blog/fix-a-sideways-or-upside-down-pdf).
- **Proofread OCR output.** Always skim recognized text for the classic slips, `0` versus `O`, `1` versus `l`, split or merged words: especially in numbers and names where an error costs the most.
- **Expect to reformat complex layouts.** Tables and multi-column pages often need light cleanup after extraction regardless of the method.

## Which job you have depends on how the PDF was made

Extracting text from a PDF is either trivial or a two-step job, and which one depends entirely on how the PDF was made. If the words are real text, plain extraction pulls them out instantly and exactly. If the PDF is a scan, the words are just pixels until OCR reads the image and reconstructs them, reliably for clean scans, with some proofreading for rough ones. Identify your PDF type first, and you'll always know the right tool to reach for.

Try it on your file now: open it in the [PDF to text tool](/pdf-to-txt) and see whether the text comes straight out. If it's a scan and nothing appears, read [what OCR is and how it turns scans into editable text](/blog/what-is-ocr-how-text-recognition-turns-scans-into-editable-text) for the next step.

## Which of the two engines your file needs

Our tooling mirrors this article's fork exactly. A born-digital PDF can go straight through [PDF to Word](/pdf-to-word), which reads the embedded text layer with pdf.js and hands you the words in an editable file: instant and exact. A scan has no text layer to read, so it goes to the [OCR tool](/ocr-pdf), where tesseract.js recognises the page image in your browser and returns the words plus a searchable copy. If you are unsure which you have, try selecting text in any viewer: if nothing selects, it is a scan, and OCR is the road.

## Sources

- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
- [PDF (Wikipedia)](https://en.wikipedia.org/wiki/PDF)
