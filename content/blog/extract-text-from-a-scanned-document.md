---
title: "Extract Text from a Scanned Document"
description: "Need the words out of a scan or photographed page: to quote, edit or reuse them? The steps to extract clean text from an image-only PDF without retyping a"
date: "2026-07-08"
updated: "2026-08-09"
author: "Chandrabhan Shekhawat"
tool: "ocr-pdf"
category: "pdf-tools"
tags: ["extract text", "ocr pdf", "scanned document", "copy text", "pdf tools"]
featured: false
---

Sometimes you don't want the whole document. You just want the words. A quotation from a photocopied article. The line items off a scanned invoice. A paragraph from a report someone sent as a picture instead of a file. Retyping it by hand is slow and error-prone. Extracting the text with OCR takes seconds.

This is a different goal from making a PDF searchable. There, you keep the scan and add a hidden text layer. Here, you want the **raw text pulled out** so you can paste it into a doc, a spreadsheet or an email. The upside: the same recognition step gives you both.

## When you want the text, not the file

Extracting text is the right move when:

- You need to **quote** an exact passage in an essay or report and want to avoid transcription typos.
- You're rebuilding a scanned table or list into an editable format.
- You want to **feed the words** into another tool: a translator, a search, a database.
- Someone sent a screenshot of text and you just need it as text.

In every case, the picture itself isn't the point. The characters inside it are.

## How to extract the text

Our [OCR PDF tool](/ocr-pdf) gives you the plain text alongside the searchable PDF, so a single run covers both needs:

1. **Add your scanned or photographed PDF.** It's read straight off your disk, there's no upload step.
2. **Select the document's language** so the engine loads the matching model.
3. **Run OCR** and watch it work through the pages.
4. **Copy the extracted text** straight from the results panel with one click, or download the searchable PDF if you want that too.

You paste the words wherever you need them. No retyping, no re-uploading, no waiting on a server.

### What's happening while that progress bar moves

I built this one, and the pipeline is worth understanding because it explains most of the quirks you'll hit. Three stages, all inside your browser tab:

1. **Rasterise.** Each page is painted to a canvas by pdf.js at twice its natural size. OCR accuracy is extremely sensitive to input resolution, which is why the default isn't 1×.
2. **Recognise.** A **tesseract.js** worker reads that canvas and returns not just words but each word's **bounding box**: where on the page it sits.
3. **Rebuild.** pdf-lib draws your original page image into a new PDF, then overlays every recognised word at its own coordinates using **PDF text render mode 3**: the mode that draws nothing at all. The words are genuinely there, selectable and searchable, and completely invisible. Your scan looks pixel-for-pixel like it always did.

That third stage is why the searchable PDF and the plain text come from a single pass: by the time we can position invisible words, we already have every word. And it's why the language model matters so much. Tesseract can only find words in a language it has loaded, and you can stack them (`eng+deu`) for a genuinely bilingual document.

## Cleaning up what you get

OCR is accurate but not magic, expect to tidy a little, especially on tricky scans. A few quick habits:

- **Read it once.** Scan for obvious slip-ups: "rn" read as "m", "0" as "O", a stray line break mid-sentence.
- **Fix layout, not every letter.** Recognition sometimes flattens columns or tables into a single stream. Reflow the structure. The words are usually right.
- **Watch punctuation.** Commas, quotes and decimals are the most commonly mangled characters, double-check numbers in invoices and figures.
- **Keep a copy of the original.** Always verify a critical quote or total against the source scan before you rely on it.

## Give the engine a fair chance

Extraction quality is set the moment you scan. To get clean text out, put clean input in:

- **Higher resolution wins.** Aim for 300 DPI. A crisp scan reads dramatically better than a phone snapshot taken at an angle.
- **Flatten and straighten pages** before OCR so lines of text run level.
- **Match the language exactly**, the wrong model turns readable text into nonsense.
- **Stick to printed text.** Handwriting, decorative fonts and faded thermal receipts are where accuracy drops.

## Private by default

Because our OCR runs in your browser, extracting text never means uploading your document. That matters when the scan is a payslip, a lease or a client record: the recognition happens on your machine, and the words come out on your machine too. Nothing is stored, and nothing is sent.

There's an honest cost to that choice, and you'll feel it: a long document takes noticeably longer than it would on a server farm, because the work is being done by your laptop rather than someone else's rack. The language model downloads once on first run, too. I think that's the right trade for documents like these (a payslip that never leaves your machine can't leak from a breach that never touches it) but you should know you're paying it in seconds rather than in privacy.

Next time a scan lands in your inbox and you need the words inside it, skip the retyping entirely, a minute of OCR beats twenty minutes of transcription and the typos you'd introduce doing it. If what you actually want is the scan itself made searchable rather than the words pulled out, [free OCR for PDFs explains that side](/blog/free-ocr-for-pdfs-how-it-works). If the scan is crooked to begin with, [straighten it first](/blog/fix-a-sideways-or-upside-down-pdf), level text lines measurably improve recognition.

## Sources

- [Tesseract.js](https://tesseract.projectnaptha.com/), the OCR engine, running as a WebAssembly worker
- [Tesseract OCR (Google)](https://github.com/tesseract-ocr/tesseract), the upstream engine and its language models
- [PDF.js (Mozilla)](https://mozilla.github.io/pdf.js/), page rasterisation
- [Optical character recognition (Wikipedia)](https://en.wikipedia.org/wiki/Optical_character_recognition)
