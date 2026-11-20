---
title: "Keep Fonts and Layout When Exporting to PDF"
description: "Fonts substituted, tables shifted, spacing off? The steps to make your Word-to-PDF export match the original document exactly."
date: "2026-07-25"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "word-to-pdf"
category: "pdf-tools"
tags: ["fonts", "layout", "docx to pdf", "typography"]
featured: false
---

The most common complaint about converting Word to PDF isn't that it fails, it's that the result looks *slightly wrong*. A heading is in the wrong typeface, a table nudges to a new page, the spacing feels off. Almost always, the cause is fonts. The steps to make an exported PDF match your document faithfully.

## Why fonts get substituted

A PDF can either **embed** the fonts it uses or merely *reference* them by name. When a font isn't embedded, the viewer (or the conversion engine) has to find a font with the same name installed locally. If it can't, it substitutes the closest match it has.

That substitute rarely has identical letter widths, so text takes up a different amount of space, and everything downstream shifts. A single missing font can cascade into moved tables, changed line counts and altered page breaks. Fix the font problem and most "layout" problems disappear with it.

## Fix #1: Embed fonts in the Word file

This is the single most effective step. In Word:

1. Go to **File → Options → Save**.
2. Tick **Embed fonts in the file**.
3. For a smaller file, also tick **Embed only the characters used**.
4. Save, then convert.

Now your distinctive fonts travel *inside* the document, so the converter uses the real thing instead of guessing.

## Fix #2: Prefer widely-available fonts

If you can't embed, or you want maximum portability, design with fonts that are almost universally present: **Arial, Helvetica, Times New Roman, Calibri, Georgia, Courier New**. They render consistently across engines because everyone already has them. Save the exotic display font for the logo, not the body text.

## Fix #3: Lock down page geometry before exporting

Fonts aside, a few document settings decide whether your layout survives:

- **Page size.** Set A4 or Letter deliberately in Word (`Layout → Size`). The PDF inherits it. A mismatch here reflows everything.
- **Margins.** Fixed margins keep line lengths stable, which keeps line and page counts stable.
- **Explicit page breaks.** Use `Ctrl+Enter` for intentional breaks instead of pressing Enter repeatedly: manual breaks survive conversion. Stacks of empty paragraphs don't.
- **Table widths.** Set tables to a fixed width rather than "auto-fit to window," so they don't resize during rendering.

## Fix #4: Match the converter to the document

Here is the honest version, because I maintain the converter and would rather you hear its limits from me. The [Word to PDF converter](/word-to-pdf) runs entirely in your browser: it reads your .docx with the mammoth library, lays the content out, and writes the result to PDF with jsPDF. Nothing is uploaded, which is exactly what you want for contracts and private letters. The trade is fidelity: headings, lists, tables and images come across, but the page is written as a rendered image, so the finished PDF's text is not selectable, and intricate multi-column layouts or unusual fonts are approximated rather than reproduced.

For a letter, CV or invoice that trade is fine. For a layout-critical document, use the layout engine you already own: Word's own File, Save As, PDF (or Export in LibreOffice and Google Docs) reproduces every kerning pair because it is the same engine that drew the page. Use the browser tool when privacy matters most. Use the native exporter when the layout does.

## A quick pre-flight checklist

Before you export anything layout-sensitive:

- Embedded fonts? ✅
- Standard fonts for body text? ✅
- Page size set to A4 or Letter? ✅
- Tables set to fixed width? ✅
- Manual page breaks, not stacked empty lines? ✅

Run that list once and it becomes second nature. Do it, then [export your document to PDF](/word-to-pdf), and the file you download will look exactly like the one you wrote, on every screen it lands on.

## Sources

- [mammoth.js](https://github.com/mwilliamson/mammoth.js), reads the .docx structure in your browser
- [jsPDF](https://github.com/parallax/jsPDF), writes the PDF on your device
- [Save or convert to PDF (Microsoft Support)](https://support.microsoft.com/en-us/office/save-or-convert-to-pdf-or-xps-in-office-desktop-apps-d85416c5-7d77-4fd6-a216-6f4bf7c7c110), Word's own exporter, for layout-critical files
