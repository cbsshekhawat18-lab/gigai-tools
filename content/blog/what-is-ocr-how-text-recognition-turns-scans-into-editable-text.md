---
title: "What Is OCR? How Text Recognition Turns Scans into Editable Text"
description: "A plain-English guide to OCR: what optical character recognition is, how it reads a scan, why accuracy varies, where it's used, and how to run it privately."
date: "2026-07-21"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "pdf-tools"
tags: ["ocr", "optical character recognition", "text recognition", "scanned documents", "beginners"]
featured: true
---

You take a photo of a page, or scan a receipt, and your computer treats it as a picture. You can see the words perfectly well, but the machine can't. Try to search it, copy a line, or paste it into an email, and nothing happens, because to the computer, that "text" is just a grid of coloured dots.

OCR is the technology that closes that gap. It looks at the picture, recognises the letters inside it, and hands you back real, editable text. If you've ever wondered what's actually happening when a tool "reads" your scan, this is the beginner's guide.

## What OCR actually means

OCR stands for **Optical Character Recognition**. Break the name apart and it explains itself:

- **Optical**. It works from an image (a scan, a photo, a screenshot).
- **Character**: its job is to identify individual letters, digits and symbols.
- **Recognition**. It decides which character each shape represents.

The input is pixels. The output is text. An image of the word "invoice" becomes the seven characters `i-n-v-o-i-c-e` that you can search, select, edit and reflow. That single transformation is what makes decades of paper archives usable on a computer.

## Why a scan isn't already text

It helps to understand the problem OCR solves. When a camera or scanner captures a page, it stores brightness values for millions of dots. Your eyes assemble those dots into letters automatically, but the file itself holds no letters, only the dots. There's nothing underneath saying "this region is the letter A."

That's why a scanned PDF or a photographed document behaves so differently from one you typed:

- **Search finds nothing**, because there's no text to match.
- **You can't select or copy** a sentence. There are no words to grab.
- **Screen readers stay silent**, since there's nothing for them to read aloud.
- **Translation and analysis tools** have no input to work with.

OCR restores all of that by figuring out what the dots spell.

## How text recognition works, step by step

Modern OCR isn't one magic action: it's a short pipeline. Knowing the stages helps you understand why some scans read beautifully and others come out garbled.

1. **Preprocessing.** The engine cleans up the image first: straightening a tilted page (de-skewing), boosting contrast, and reducing speckles so faint marks don't get mistaken for punctuation. Better input here means better results everywhere after.
2. **Layout analysis.** It finds where the text actually is, separating columns, paragraphs, headings and images, then breaking the page into lines and lines into individual character shapes.
3. **Character recognition.** This is the heart of it. Each shape is compared against what the engine has learned letters look like. Older systems matched templates. Today's engines use trained models (neural networks) that recognise characters even across different fonts and sizes.
4. **Post-processing.** Raw guesses get sanity-checked against a dictionary and language rules. If the engine reads "recognized" but the letters were ambiguous, a language model nudges an unlikely `rec0gnized` back to the real word. This is why choosing the correct language matters so much.

The end product is text plus, crucially, the **position** of every word, which is what lets a tool drop an invisible, searchable text layer exactly over your original scan.

## How accurate is OCR, really?

Accuracy is usually described as **character accuracy** (what fraction of individual letters are correct) or **word accuracy** (what fraction of whole words are right). On a clean, printed page, good engines routinely exceed 98–99% character accuracy. But that number swings hard depending on the input.

This is what pushes accuracy up or down:

| Factor | Reads well | Reads poorly |
| --- | --- | --- |
| Resolution | 300 DPI or higher | Low-res phone snaps, small screenshots |
| Text type | Printed, standard fonts | Handwriting, decorative or script fonts |
| Page angle | Straight, flat | Skewed, curled, photographed on an angle |
| Contrast | Crisp black on white | Faded thermal receipts, grey-on-grey |
| Language match | Correct language selected | Wrong language model loaded |

The single biggest lever most people control is the scan itself. Feed OCR a sharp, straight, high-resolution page and it will reward you. Feed it a dim, tilted photo and even the best engine struggles. Selecting the right language runs a close second, an English model reading a French page produces confident nonsense.

## Where OCR is used every day

You've almost certainly relied on OCR without noticing. Common uses include:

- **Digitising paper archives** so old contracts, records and books become searchable.
- **Data entry**, pulling totals and line items off scanned invoices and receipts instead of retyping.
- **Accessibility**, giving screen readers real text to voice for people with visual impairments.
- **Search and organisation**, so a filing cabinet of scans becomes something you can actually find things in.
- **Everyday capture**, snapping a business card, a whiteboard, or a page of a book and getting the words out.

Anywhere text is trapped inside an image, OCR is the way out.

## The honest limits

OCR is genuinely useful, but it isn't perfect, and it helps to know where it stops:

- **It's not a transcriptionist for handwriting.** Cursive and casual notes are still very hard. OCR is built for printed and typed text.
- **It can mangle layout.** Complex tables and multi-column pages sometimes flatten into a single stream of text, even when the words themselves are right.
- **Look-alikes trip it up.** The digit `0` versus letter `O`, `1` versus `l`, and `rn` versus `m` are classic errors: always double-check numbers on anything financial.
- **Garbage in, garbage out.** No engine can invent detail that the scan didn't capture. A blurry original stays a blurry read.

The practical takeaway: OCR does the heavy lifting in seconds, but on important documents you should still read the result and verify critical figures against the original.

## Running OCR privately, right in your browser

Traditionally, OCR meant uploading your document to a remote server to be read, a real concern when the scan is a contract, an ID or a medical note. It doesn't have to work that way. Our [OCR PDF tool](/ocr-pdf) runs the recognition engine directly in your browser, so the file never leaves your device. It rasterises each page, reads the characters locally, and gives you back both a searchable PDF and the extracted plain text. The only thing that downloads is the open-source language model, *to* you, not the other way around.

A typical run is four steps: add your scanned PDF (it stays on your device), pick the language, run the recognition, then download the searchable file or copy the text. If your source is a stack of photos instead, convert them first and OCR the result. And once your document is real text, the rest of your workflow opens up. You can [convert the PDF to editable Word](/pdf-to-word) to rework it, or [turn PDF pages into JPG images](/pdf-to-jpg) when you need the pages as pictures.

**Ready to see text recognition in action?** Drop a scan into the [OCR PDF tool](/ocr-pdf) and watch your browser turn a picture of a page back into words. No uploads, no sign-up, nothing stored.

## The version of this that runs in a tab

Everything this article describes now runs client-side: our [OCR tool](/ocr-pdf) rasterises each page with pdf.js, hands the image to tesseract.js (a full OCR engine compiled for the browser), and gets back words with positions, confidence and all. The first run downloads the recognition model once. After that it is cached. Accuracy follows scan quality exactly as described above, which is why the tool renders pages at double resolution before recognition: more pixels per letter is the cheapest accuracy upgrade there is.

## Sources

- [tesseract.js](https://github.com/naptha/tesseract.js)
- [Optical character recognition (Wikipedia)](https://en.wikipedia.org/wiki/Optical_character_recognition)
- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
