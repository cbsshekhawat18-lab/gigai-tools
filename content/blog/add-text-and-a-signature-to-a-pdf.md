---
title: "Add Text and a Signature to a PDF"
description: "How to fill in a PDF and sign it without printing, scanning or installing anything: plus how to make a signature stamp that looks clean, not blocky."
date: "2026-07-24"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "pdf-editor"
category: "pdf-tools"
tags: ["sign-pdf", "add-text", "signature", "forms"]
featured: false
---

The "print, sign, scan, email" ritual is one of the most avoidable chores in modern paperwork. If a PDF needs your details typed in and your signature at the bottom, you can do the whole thing on screen in about a minute, and the result usually looks *tidier* than a scan of a printout ever would.

## Adding text: filling a PDF that isn't "fillable"

Many forms arrive as flat PDFs with lines to write on but no interactive fields. That's fine. You don't need real form fields to type on them.

In our [PDF editor](/pdf-editor), choose the **text** tool and click where the value belongs. A text box appears. Type your entry, set its colour, and place it on the line. Repeat for each field.

A few things that make typed text look native to the page:

- **Match the size to the surrounding print.** Oversized text screams "added later."
- **Align to the baseline of the line**, not floating above it. Nudge the box so your text sits *on* the rule.
- **Use black** unless the form expects otherwise. Blue reads as "handwritten in pen," which some people prefer for a personal touch.
- **Leave a little breathing room** in tight boxes so characters don't collide with printed labels.

For dates, initials and checkbox ticks, the same text tool works: type an "X" or a "✓" and drop it in the box.

## Adding a signature: two honest options

There are two reliable ways to sign, and the right one depends on what you have.

### Option 1, Stamp a signature image

If you already have a picture of your signature, the **stamp** tool is the cleanest route. Upload the image, then drag a box on the page to size and place it.

The single biggest quality factor here is the file:

- **Use a transparent PNG.** A JPG always carries a solid rectangle, so your signature arrives inside an ugly white box that covers whatever's beneath it.
- **Scan or photograph on white paper**, then clean it up to a transparent PNG in an image editor before adding it.
- **Aim for ~600px wide.** That scales down crisply. A tiny image looks blocky when enlarged.

Once it's a clean transparent PNG, the same stamp can be reused on every document you sign.

### Option 2, Draw it with the pen

No signature image handy? Switch to the **pen** and draw directly on the page. On a touchscreen or trackpad you can get a passable signature in a few strokes. It won't match a scanned original exactly, but for informal approvals it's perfectly acceptable, and there's an **undo** if a stroke goes wrong.

## Putting it together on a contract

A typical signing flow looks like this:

1. Open the PDF and go to the signature page.
2. Use the **text** tool to fill your name, the date, and any other fields.
3. **Stamp** your signature image (or draw it) on the signature line.
4. **Highlight** any clause you want to flag before returning it, if needed.
5. **Export**: the marks flatten onto the page and a finished PDF downloads.

## Why this is private

Signatures and filled forms are personal, so it matters that the [PDF editor](/pdf-editor#workspace) runs entirely in your browser. Your document and your signature image never leave your device: there's no upload, no server copy, and nothing stored. When you close the tab, it's gone.

## Quick tips

- Add text and your signature **before** rotating or reordering pages, so nothing shifts.
- Keep a transparent-PNG signature saved somewhere handy, you'll reuse it constantly.
- Zoom to check alignment, then preview at 100% before exporting.
- For a genuinely private field you're covering, remember a rectangle *hides* rather than deletes the data underneath.

Sign it, fill it, send it. No printer required.

## A signature that cannot be peeled off

When the editor exports your signed document, the signature image and any text boxes are drawn into the page content, not attached on top of it. A reader sees one merged page, the same way ink and paper make one merged sheet. This is worth knowing when you send a signed agreement: with a flattened export there is no floating annotation for someone to select and delete in another editor. The untouched pages are copied through without re-rendering, so nothing else about the document shifts.

## Sources

- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
- [PDF (Wikipedia)](https://en.wikipedia.org/wiki/PDF)
