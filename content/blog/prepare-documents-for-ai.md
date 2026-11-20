---
title: "How to Prepare Your Files Before Handing Them to AI"
description: "Half of 'the AI got it wrong' is really 'the AI got fed something unreadable.' A practical pre-flight checklist for PDFs, scans, spreadsheets, and images, so the model works with clean input."
date: "2026-07-28"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "ai-tools"
tags: ["ai", "documents", "ocr", "pdf", "productivity"]
tool: "ocr-pdf"
featured: true
---

A relative of mine spent an evening arguing with a chatbot about her insurance policy. She'd uploaded the PDF, asked what it covered, and got answers that were vague, then wrong, then apologetic. Her conclusion: "AI is useless."

I opened the file. It was a scan: photographs of paper, essentially. There was no text in that PDF at all, just pictures of text. She'd handed the model a stack of images and asked it to read. Some tools handle that, and hers didn't. The model wasn't stupid. The input was.

I'd guess half of everyday "AI failed me" stories are actually input stories. Models are text engines, brilliant when they get clean text, lost when they get noise. Fortunately, preparing files properly takes minutes, and you can do all of it in the browser without installing anything.

## First, know what your PDF actually is

PDFs come in two secretly different species. A *digital* PDF (exported from Word, a website, an invoicing app) contains real text. You can select a sentence with your cursor. A *scanned* PDF contains only images of pages. They look identical. They behave completely differently when AI is involved.

The test takes two seconds: try to select and copy a line of text. If you can't (or you get gibberish) you have a scan.

For scans, run OCR first. [Our OCR tool](/ocr-pdf) reads the page images and rebuilds the file as a searchable PDF with a real text layer, right in your browser. (If you're curious how machines pull letters out of pixels at all, [How to do it OCR works](/blog/what-is-ocr-how-text-recognition-turns-scans-into-editable-text).) One honest caveat that applies to every OCR engine ever built: quality in, quality out. A crisp 300-DPI scan comes through nearly perfect. A tilted phone photo of a crumpled receipt will have errors. Skim the result before you trust it, an OCR error that turns a 7 into a 1 will sail straight into the AI's answer, because the model has no way of knowing the source was misread.

## Send less, get more

The counterintuitive rule of feeding documents to AI: smaller input usually means better output. Models have a fixed budget of attention, the [context window](/blog/context-windows-explained), and details buried in the middle of a 100-page dump genuinely get overlooked.

So don't upload the annual report to ask about one quarter:

- **Pull the relevant pages** with the [page extractor](/extract-pdf-pages), pages 12–18 instead of all 96.
- **Or strip the whole thing to plain text** with [PDF to text](/pdf-to-txt) and paste just the section you need. Plain text is the model's native food anyway. No layout weirdness, no columns read in the wrong order.

A bonus you can measure: pasting a focused excerpt instead of a full document can cut the token count by 90%. Drop your before-and-after into the [token counter](/token-counter) once and you'll never dump a full file again.

## Spreadsheets: give it CSV, not a screenshot

People screenshot Excel tables and paste the image into chat. Sometimes it works. But you're making the model squint at pixels when you could hand it structured data.

Convert the sheet to CSV with [Excel to CSV](/excel-to-csv) and paste the text. CSV keeps every value exact, costs a fraction of the tokens, and lets the model actually compute with the numbers rather than guess at them through an image. If the file has fifteen tabs, export the one that matters, the "send less" rule again.

## The step everyone skips: check what else is in the file

Here's the uncomfortable one. Files carry more than their visible content. PDFs have metadata, author names, company fields, sometimes full revision history. Photos carry EXIF data, including, on many phones, the GPS coordinates of where they were taken.

When you upload a file to an AI service, all of that goes along for the ride, subject to whatever that service's retention policy says, which, as I covered in [AI and your privacy](/blog/ai-and-your-privacy), you have probably not read. Before uploading anything sensitive:

- [Strip metadata from images](/remove-metadata), seconds, in your browser, nothing uploaded to us.
- [Check and clean PDF metadata](/blog/how-to-edit-or-remove-pdf-metadata) if the document has a history you'd rather not share.
- And redact *content* properly. Deleting a paragraph is redaction. Drawing a black rectangle over selectable text is not. The text is still there underneath, and a model will happily read it.

## The step most people skip

Before any model can reason about your scanned document, the words have to exist as text, and this is where preparation pays off most. Our [OCR tool](/ocr-pdf) runs tesseract.js in your browser: it reads each page image, recovers the words with their positions, and gives you a searchable PDF plus clean extracted text, all without the document leaving your machine. That last part matters doubly here, because documents headed for an AI assistant are often exactly the private ones (contracts, records, statements) you should not route through a second server just to make them readable.

## A 90-second pre-flight checklist

For anything that matters, this is the whole routine:

1. **Can I select the text?** If not → [OCR it](/ocr-pdf).
2. **Do I need the whole file?** Almost never → [extract pages](/extract-pdf-pages) or [convert to text](/pdf-to-txt).
3. **Is it a spreadsheet?** → [CSV](/excel-to-csv), not a screenshot.
4. **Is there anything in this file I wouldn't email to a stranger?** → clean [metadata](/remove-metadata) and redact for real.
5. **Then** write the actual question, and a specific question beats "summarize this," as covered in the [prompts guide](/blog/better-ai-prompts-practical-guide).

None of this is glamorous. It's the document equivalent of washing vegetables before cooking. But the difference in output is not subtle: clean, focused, text-first input turns the model from a vague paraphraser into something that quotes the right clause back at you with the page number. My relative's insurance question, asked again with an OCR'd file and just the coverage section pasted in, was answered correctly in one try.

The AI didn't get smarter that evening. The input did.

## Sources

- [tesseract.js](https://github.com/naptha/tesseract.js), in-browser OCR
- [Optical character recognition (Wikipedia)](https://en.wikipedia.org/wiki/Optical_character_recognition)
