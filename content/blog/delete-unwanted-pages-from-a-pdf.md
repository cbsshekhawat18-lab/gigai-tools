---
title: "Delete Unwanted Pages from a PDF"
description: "A practical guide to removing the wrong, extra or confidential pages from a PDF using a visual thumbnail grid, with nothing uploaded and at least one page"
date: "2026-07-22"
updated: "2026-08-09"
author: "Chandrabhan Shekhawat"
tool: "delete-pdf-pages"
category: "pdf-tools"
tags: ["delete pdf pages", "pdf tools", "how-to", "privacy"]
featured: true
---

Almost every PDF has a page you wish weren't there. A cover sheet you didn't need, an internal note that slipped into a client copy, a duplicate someone scanned twice. Deleting those pages sounds trivial, yet most people end up re-exporting the whole document or, worse, sending it out with the unwanted page still attached.

There's a cleaner way: pick the pages you don't want off a visual grid and let the tool rebuild the file from only the pages you keep.

## Why delete rather than re-create

You *could* reprint or re-export a document to drop a page, but that route has real downsides. Print-to-PDF often flattens selectable text into an image, bloats the file, and can shift your formatting. Re-exporting from the original source assumes you still have it, and that the page you want gone even exists there.

Deleting pages directly avoids all of that. The pages you keep are copied across untouched, so text stays searchable and images keep their resolution. Only the pages you tick disappear.

## Delete by sight, not by number

The trap with page-number-based editors is that you have to *know* the numbers. Is the duplicate on page 7 or page 8? Was the confidential note the second page or the third?

A thumbnail grid removes the guesswork. You see each page as it really looks, tick the ones to remove, and confirm your choice before anything happens. That single change (selecting by sight) prevents the most common deletion mistake: cutting the wrong page.

## Step by step

1. **Add one PDF.** Open the [Delete PDF Pages tool](/delete-pdf-pages) and drop in your file: it's read locally, not uploaded. Every page renders as a numbered thumbnail.
2. **Tick the pages to remove.** Click each unwanted page. It highlights to show it's marked. Clicking again keeps it. Select as many as you need.
3. **Review your selection.** The summary tells you how many pages you're deleting and how many will remain. Unticked pages are the ones you'll download.
4. **Delete.** Press *Delete Pages*. The tool rebuilds the document from only the kept pages, in their original order.
5. **Download.** Save your trimmed PDF. Want to try a different cut? Start over and reselect.

## The one page you can't delete

A PDF has to contain at least one page, so the tool will stop you if your selection would empty the document. This isn't a limitation to fight: it's a guardrail, and it's a literal check in the code: if the pages you've ticked add up to the whole document, it refuses and says so rather than handing you a zero-page file that half the readers in the world can't open.

If you genuinely want to keep only one or two pages, deleting everything else is the slow way round. Reach for [extracting](/extract-pdf-pages) instead: pull out just the pages you want and leave the original alone.

## What "delete" actually means here

Worth knowing, because it explains why this is safe. Nothing is erased from your file. The tool works out which pages you *kept*, creates a brand-new empty PDF, and copies those pages into it in their original order: the same `copyPages` operation that powers a lossless merge. Your original file on disk is never modified. You get a separate `-edited.pdf` alongside it.

Two consequences follow, both useful:

- **The kept pages are untouched.** They're structurally copied, not re-rendered, so text stays selectable, vectors stay sharp and a 300-DPI scan is still 300 DPI. There is no quality setting because there's no re-encoding step.
- **Nothing is destructive.** Cut the wrong page and the fix is to start over from the original you still have. That's also why the tool doesn't need an undo button.

## Common jobs this solves

- **Removing an internal page** before a document leaves the building.
- **Dropping a duplicate** that a scanner captured twice.
- **Cutting a rejected draft** out of a merged submission.
- **Deleting a blank separator sheet** from a batch scan.

## Do it privately

Because the whole process runs in your browser with pdf-lib, your PDF never leaves your device. Nothing is uploaded, stored or logged, and no watermark is ever added. Close the tab and every trace of the file is gone.

That matters most in exactly the case people reach for this tool: removing an internal comment, a salary line or a draft page before a document goes to a client. Sending that document to a server to have the sensitive page removed would rather defeat the purpose.

**One caveat if the page you're deleting is confidential:** removing it from the copy you send is the right move, but remember the original still contains it, and so does every copy you've already shared. Deleting a page changes the file, not the history.

Once your document is trimmed, you can [merge it](/merge-pdf) with others or [reorder what's left](/reorder-pdf-pages) so the final file reads exactly the way you intended. Trimming a PDF should take about a minute and cost nothing, [tidy yours](/delete-pdf-pages) until only the pages that matter remain. If your goal is specifically to strip blank separator sheets from a batch scan, [removing blank or extra pages](/blog/remove-blank-or-extra-pdf-pages) covers that case directly.

## Sources

- [pdf-lib](https://pdf-lib.js.org/): the library doing the page copy
- [PDF 2.0 (ISO 32000-2) overview (PDF Association)](https://pdfa.org/resource/iso-32000-2-pdf-2-0/): the page-tree structure being rebuilt
- [PDF.js (Mozilla)](https://mozilla.github.io/pdf.js/), renders the page thumbnails you select from
