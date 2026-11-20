---
title: "How to Compress Files for Email: PDFs and Images Under 25 MB"
description: "Gmail and Outlook reject big attachments. The real size limits, plus step-by-step ways to shrink PDFs and images under 25 MB: nothing uploaded."
date: "2026-07-23"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "pdf-tools"
tags: ["email", "attachments", "compress-pdf", "image-compressor", "file-size"]
featured: true
---

The attachment looks fine on your screen. You hit send, and thirty seconds later the message bounces with *the file exceeds the maximum size*. It happens with a scanned contract, a folder of phone photos, a slide deck exported to PDF. This guide covers the actual attachment limits in Gmail and Outlook, and gives you clear, repeatable steps to bring both PDFs and images comfortably under 25 MB: all in your browser, with nothing uploaded to anyone's server.

## The real attachment limits (and the number nobody tells you)

Every mail provider caps how big an attachment can be. The headline numbers:

| Service | Sending limit | Notes |
| --- | --- | --- |
| Gmail | 25 MB | Files over 25 MB auto-convert to a Google Drive link |
| Outlook.com | 20 MB | 34 MB technical ceiling, but 20 MB is the practical cap |
| Microsoft 365 (work/school) | 20 MB default | Admins often lower this to 10 MB |
| Yahoo Mail | 25 MB | |
| Many corporate servers | 10 MB or 5 MB | The strictest limit in the chain wins |

Here's the catch almost nobody mentions: **attachments are Base64-encoded for transit, which inflates them by about 33%.** A file that reads "22 MB" on your disk travels as roughly 29 MB, which is why a "22 MB" attachment fails a 25 MB inbox.

So the honest target isn't the cap, it's the cap minus a third. Practical goals:

- **25 MB inbox → aim for about 18 MB** of actual file
- **20 MB inbox → aim for about 15 MB**
- **10 MB inbox → aim for about 7 MB**

And remember the smaller of the two limits (yours or the recipient's) is the one that matters. When in doubt, target the strictest case: **under 7 MB clears almost every inbox on earth.**

## Compressing PDFs for email

PDFs balloon for one reason: images. Scanned pages, photo-heavy brochures and slide exports are mostly pictures, and pictures are where the size lives. Live text and vector logos are already tiny.

The browser-based [Compress PDF tool](/compress-pdf) re-encodes each page's images at a quality level you choose and shows you the exact before-and-after size, so you can hit a target instead of guessing.

**Steps:**

1. Open [Compress PDF](/compress-pdf) and drop in your file. It stays on your device.
2. Start on **Medium**. For most scans this roughly halves the file while keeping pages clean on screen.
3. Read the reported new size. If you're still over target, step up to **High**.
4. Check two or three pages, not just the first, for softness or unreadable small text.
5. Download, and keep your original as the master copy.

A typical 30 MB scanned report drops under 8 MB on Medium: well within any 25 MB or even 10 MB limit.

One honest caveat: browser compression works by rasterising each page, so **live text becomes part of the image** and is no longer selectable or searchable. If the recipient needs to search or copy text, run the compressed file through the [OCR PDF tool](/ocr-pdf) afterward to add a searchable text layer back. And if a PDF is *mostly* text with few images, it won't shrink much, there's simply little to compress.

## Compressing images for email

Attaching photos straight off a phone is the number one cause of oversized emails. A single modern phone photo can be 4-8 MB, so five of them blow past 25 MB instantly.

Use the [Image Compressor](/image-compressor) to shrink JPGs and PNGs while keeping them sharp enough for the screen.

**Steps:**

1. Open [Image Compressor](/image-compressor) and add your photos (you can batch several at once).
2. Choose a target quality or size. For email, quality around 70-80% is usually indistinguishable from the original at normal viewing size.
3. Compare the before/after size and download.

Two extra levers that make a big difference:

- **Resize, don't just compress.** A photo doesn't need to be 6000 pixels wide to be viewed in an inbox. Dropping the dimensions with the [Image Resizer](/image-resizer) to around 1600-2000 px on the long edge slashes the file size on its own, before any quality trade-off.
- **Pick the right format.** Photographs belong in JPG, which is far smaller than PNG for the same picture. If you have screenshots or graphics saved as heavy PNGs, converting with [PNG to JPG](/png-to-jpg) can cut the size dramatically. (Keep PNG only when you need transparency or pixel-perfect text.)

If you're sending many photos to one person, consider combining them into a single compressed PDF with [JPG to PDF](/jpg-to-pdf), it's tidier than a dozen loose attachments and compresses well.

## Split vs compress: which one do you need?

Compression shrinks a file in place. Splitting breaks it into smaller pieces you send separately. They solve different problems.

| Your situation | Best move |
| --- | --- |
| Image-heavy PDF, must arrive as one attachment | **Compress** with [Compress PDF](/compress-pdf) |
| Genuinely huge PDF (hundreds of scanned pages) | **Split** first, then compress each part |
| Only a few pages actually matter to the recipient | **Extract** just those pages, then send |
| A pile of phone photos | **Compress and resize** the images |
| Must stay full print resolution | Skip email, share a cloud link |

When one document is simply too big to compress under the line, use the [Split PDF tool](/split-pdf) to break it into logical sections and send them as "Part 1 of 3," "Part 2 of 3," and so on. If only a handful of pages are relevant, it's cleaner to extract just those with [Extract PDF Pages](/extract-pdf-pages) than to send the whole thing.

There's also a clever trick for a stubborn, mostly-scanned PDF: convert it to images with [PDF to JPG](/pdf-to-jpg), then run those through the [Image Compressor](/image-compressor). Sometimes re-encoding at the image level squeezes out savings a single PDF pass leaves behind, useful when you need to hit a hard 5 MB or 10 MB corporate limit.

## Target-size cheat sheet

- **Leave 33% headroom.** For a 25 MB cap, aim for ~18 MB of real file. For 10 MB, aim for ~7 MB.
- **Under 7 MB is a safe universal target** that clears strict corporate servers too.
- **PDFs:** start at Medium in [Compress PDF](/compress-pdf), step up only if needed.
- **Photos:** resize to ~2000 px and compress to ~75% quality in [Image Compressor](/image-compressor).
- **Always verify** the output reads well before you send, and keep the originals.

## When email just isn't the right tool

Be honest with yourself about the file. Print-ready artwork, engineering drawings and high-resolution photo sets *need* their detail: compressing them enough to email would ruin them. For those, a shared cloud-drive link is the right answer, not a smaller attachment. Email is for documents people read, not files people need at full fidelity.

## Get it delivered

Nine times out of ten, a bounced attachment is a two-minute fix. Shrink a heavy PDF with the [Compress PDF tool](/compress-pdf) or lighten a batch of photos with the [Image Compressor](/image-compressor): both run entirely in your browser, so your files never leave your device and nothing is uploaded, stored, or seen by anyone but you. Aim for a third under the limit, check the result, and hit send with confidence.

## The binary search that hits your byte budget

When you give our [image compressor](/image-compressor) a KB target instead of a quality number, it runs a binary search: about eight trial encodes, homing in on the highest quality that still lands under your budget, keeping the best candidate and discarding the rest. If even minimum quality cannot reach the target (a huge photo aimed at a tiny cap), the tool reports the real result instead of pretending. The same honesty applies to [PDF compression](/compress-pdf): if re-encoding cannot beat your original, you get the original back.

## Sources

- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
- [PDF (Wikipedia)](https://en.wikipedia.org/wiki/PDF)
