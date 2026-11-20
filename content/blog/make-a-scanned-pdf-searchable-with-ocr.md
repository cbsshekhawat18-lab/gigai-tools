---
title: "Make a Scanned PDF Searchable with OCR"
description: "A scanned PDF is just a picture of a page. You can't search or select it. The steps OCR adds a hidden text layer so Ctrl+F finally works, all in your browser."
date: "2026-07-18"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "ocr-pdf"
category: "pdf-tools"
tags: ["ocr pdf", "searchable pdf", "scanned pdf", "pdf tools", "privacy"]
featured: true
---

You scan a stack of contracts, save them as PDF, and file them away feeling organised. Three months later you need the one clause about renewal dates, and discover you can't search any of them. Nothing you type into the find box matches. That's because a scanned PDF isn't text at all: it's a photograph of a page wearing a `.pdf` extension.

OCR (Optical Character Recognition) is what turns that photograph back into words. This is what actually happens, and how to do it without uploading a single confidential file.

## Why a scan can't be searched

When a scanner or phone camera captures a page, it records pixels: light and dark dots that *look* like letters to your eyes but mean nothing to your computer. A PDF search only works when there's a real text layer underneath. Scanned PDFs have no such layer, so search finds nothing, you can't select a sentence to copy, and screen readers can't read it aloud.

OCR fixes this by *reading* the pixels. A recognition engine examines each shape, decides it's an "e" or a "7", and records not just the character but exactly where it sits on the page.

## What OCR adds, without changing how the page looks

The clever part is what happens next. A good OCR tool doesn't replace your scan or re-type it into a new document. Instead it lays an **invisible text layer** precisely over the original image:

- The scanned picture stays untouched: same look, same signatures, same coffee stains.
- Over it sits transparent, selectable text, positioned word by word.
- The result looks identical to your scan, but now behaves like a real document.

So Ctrl+F works. You can highlight and copy a paragraph. You can send it to someone whose screen reader can now read it. Visually, nothing changed. Functionally, everything did.

## How to make a scanned PDF searchable

The whole job takes four steps with our [OCR PDF tool](/ocr-pdf):

1. **Upload the scanned PDF.** Image-only scans and photographed pages are exactly what this is built for.
2. **Choose the language.** Picking the right one is the single biggest accuracy lever, an English model reading a French page produces gibberish.
3. **Run OCR.** A progress bar moves page by page while your device does the recognition. The first time you use a language, its model downloads once and is cached.
4. **Download the searchable PDF**, and copy the extracted plain text too, if you just want the words.

## Getting the best accuracy

OCR is only as good as the scan you feed it. A few habits make a huge difference:

- **Scan at 300 DPI or higher.** Letters need enough detail to be recognised. Screenshots and low-res captures read poorly.
- **Keep pages straight.** A tilted or skewed line confuses the engine, de-skew crooked pages first.
- **Match the language.** One document, one language setting. For genuinely bilingual pages, run it twice and keep the cleaner result.
- **Prefer print over handwriting.** OCR is built for typed and printed text. Cursive handwriting won't come out cleanly.

## The privacy angle

Most OCR happens on someone else's server, which means uploading your document to be read by a machine you don't control, a real problem for signed contracts, IDs or medical records. Our tool runs the recognition engine directly in your browser using WebAssembly. Your PDF never leaves your device. Only the open-source language model is downloaded *to* you.

That's the quiet advantage of in-browser OCR: your scan becomes searchable, and it never has to travel anywhere to get that way. Ready to try it? Head to the [OCR PDF tool](/ocr-pdf) and make that filing cabinet findable at last.

## Why the result looks identical to your scan

Because it is your scan. The tool renders each page at double resolution, lets a tesseract.js worker read the words and note the exact box each one occupies, and then rebuilds the PDF with the original page image untouched. The recognised words go into an invisible text layer positioned word by word over the image. Search, selection and copy all work, yet a printed copy is indistinguishable from the original. Mixed-language documents can stack recognition models, like `eng+deu` for English and German on the same page.

## Sources

- [tesseract.js](https://github.com/naptha/tesseract.js)
- [Optical character recognition (Wikipedia)](https://en.wikipedia.org/wiki/Optical_character_recognition)
- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
