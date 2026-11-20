---
title: "How to Email a Large PDF"
description: "Bounced attachments are a productivity killer. Why mail servers reject big PDFs and four reliable ways to get yours delivered, starting with"
date: "2026-07-15"
updated: "2026-08-08"
author: "Chandrabhan Shekhawat"
tool: "compress-pdf"
category: "pdf-tools"
tags: ["compress-pdf", "email", "attachments", "productivity"]
featured: false
---

You attach the PDF, hit send, and moments later your message bounces back: *attachment too large*. It's one of the most common (and most avoidable) office frustrations. This guide explains the limits you're hitting and walks through the fastest ways to get a heavy PDF into someone's inbox.

## Why your PDF got rejected

Email wasn't designed to move large files. A few limits stack up against you:

- **Provider caps.** Gmail and Outlook.com cap attachments around 20-25 MB. Many corporate mail servers are stricter: often 10 MB or even 5 MB.
- **Encoding overhead.** Attachments are Base64-encoded for transit, which inflates them by roughly 33%. A 20 MB file travels as about 27 MB, so you hit the cap sooner than the file size suggests.
- **The recipient's limit, not just yours.** Even if your provider lets a big file out, the receiving server can reject it. The smaller of the two limits wins.

That's why a "22 MB" PDF fails a 25 MB inbox: after encoding, it's over the line.

## Option 1: Compress the PDF (usually the best fix)

If the file is a scan, a slide export or a photo-heavy brochure, compression is the cleanest solution: the recipient still gets one normal attachment, no links, no downloads.

Since I built the [Compress PDF tool](/compress-pdf), here's exactly what happens when you use it, including the part most converters leave out. Each page is rendered with PDF.js and re-encoded with **MozJPEG** (the same encoder behind Google's Squoosh) at a resolution and quality set by the level you choose. It all runs in your browser, so a confidential contract or a medical scan never travels to anyone's server just to get smaller.

Two things about that are worth stating plainly. First, because pages are re-rendered as images, **selectable text in the output becomes part of the page image**, perfectly readable, but no longer highlightable. On a scan that changes nothing (scans were images already). On a text-only PDF it's a real cost, and text-only files barely shrink anyway. Second, there's a guard in the code: if re-encoding ever produces a *bigger* file than you started with, the tool hands back your original untouched instead of pretending it saved you something.

Aim to land below the *encoded* threshold: if the cap is 10 MB, target roughly 7 MB of actual file to leave room for the 33% overhead.

## Option 2: Split the PDF into parts

If a document is genuinely huge, hundreds of scanned pages, compression alone may not be enough. [Split it into logical sections](/split-pdf) and send them as separate emails, or [pull out just the pages that matter](/extract-pdf-pages) and send those first. Clear subject lines like "Report, Part 1 of 3" keep things tidy for the recipient. Splitting has one advantage over compressing, too: it keeps every page at full quality with its text still selectable.

## Option 3: Use a shared link instead of an attachment

For files that are big *and* need to stay high-resolution (print artwork, detailed plans), upload to a cloud drive and paste a link. It sidesteps size limits entirely. The trade-off is that the recipient needs access and an internet connection to open it, and the file now lives on someone else's server.

## Option 4: Reduce before you even create the PDF

Prevention beats cure. When exporting from a design or office app, choose a screen or "smallest size" preset rather than print quality. Scanning? Scan at 150-200 DPI in grayscale for documents: plenty readable, a fraction of the size of 600 DPI colour.

## A quick decision guide

- **Image-heavy but must be one attachment?** Compress it.
- **Enormous and splittable?** Split, then compress each part.
- **Must stay print-quality?** Share a link.
- **Not created yet?** Export or scan at a lower setting from the start.

## Before you send

- Check both your limit and, if you know it, the recipient's.
- Leave headroom for the ~33% encoding overhead.
- Confirm the compressed file still reads well on a couple of pages.
- Keep the original master copy safe.

Nine times out of ten a single pass at Medium is the whole fix, and the bounce you were staring at five minutes ago quietly turns into a delivered message. If you need the same trick for images and other attachments, [this guide covers getting anything under 25 MB](/blog/how-to-compress-files-for-email-pdfs-and-images-under-25-mb). If you'd rather understand the compression dial itself before you touch it, start with [reducing PDF size without losing quality](/blog/reduce-pdf-size-without-losing-quality).

## Sources

- [Files you can attach in Gmail (Google Help)](https://support.google.com/mail/answer/6584)
- [RFC 2045 §6.8: Base64 Content-Transfer-Encoding](https://datatracker.ietf.org/doc/html/rfc2045#section-6.8), the 4:3 expansion behind the ~33% overhead
- [MozJPEG (Mozilla's JPEG encoder)](https://github.com/mozilla/mozjpeg), the encoder our compressor uses
- [PDF.js (Mozilla)](https://mozilla.github.io/pdf.js/): the renderer behind the page rasterisation
