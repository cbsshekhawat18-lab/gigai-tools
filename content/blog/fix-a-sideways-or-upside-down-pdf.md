---
title: "Fix a Sideways or Upside-Down PDF"
description: "A page came out sideways or flipped after scanning. The reason it happens, exactly which turn to use, and how to correct it so it stays fixed."
date: "2026-07-07"
updated: "2026-07-29"
author: "Chandrabhan Shekhawat"
tool: "rotate-pdf"
category: "pdf-tools"
tags: ["sideways-pdf", "upside-down-pdf", "scanning", "fix"]
featured: false
---

Scanners and phone cameras are wonderful right up until they hand you a page lying on its side or standing on its head. The content is all there, it's just pointed the wrong way. The upside: this is one of the easiest PDF problems to fix, and you never need to re-scan anything.

## Why pages come out the wrong way

Orientation problems almost always start at capture:

- **Sheet-fed scanners** feed a page in whatever direction it was placed, so a landscape sheet often lands rotated 90°.
- **Phone photos** inherit the angle you were holding the device at: turn your wrist and the page tilts with it.
- **Duplex (two-sided) scanning** sometimes flips the back of each sheet, leaving alternate pages upside-down.

None of this damages the content. The pixels are fine. Only the *orientation flag* is wrong. Correcting it is a matter of turning the page and saving that turn.

## Diagnose the turn you need

Before you fix anything, work out which direction each problem page needs to go. Think of it in clockwise quarter-turns:

- Top edge is on the **right** → rotate **90°** clockwise.
- Top edge is on the **left** → rotate **270°** clockwise (the same as 90° the other way).
- Page is **completely flipped** → rotate **180°**.

A common mistake is reaching for 180° on a sideways page. Sideways is a *quarter* turn, not a half turn: 180° will just leave it sideways the other way. If in doubt, one click at a time and watch the preview.

## Fix it in the browser

1. Open the [Rotate PDF tool](/rotate-pdf) and drop in the file. It renders locally in your browser, nothing is uploaded.
2. For a whole document scanned the same wrong way, use **Rotate all**, one click of the right quarter-turn straightens every page at once.
3. For a mix (say, upside-down back pages from duplex scanning), click each affected page's own rotate control and leave the good pages alone.
4. Watch the thumbnails turn live, then press **Rotate PDF** and download the corrected file.

Because the tool writes the orientation into the file, the fix holds when you print, email or open it on another device.

## The upside-down duplex trick

Two-sided scans that flip every other page are the classic headache. Rather than turning pages one by one, look at the pattern: if pages 2, 4, 6… are all upside-down, rotate just those by 180°. The tool lets you target individual pages, so you can correct the flipped set and leave the rest untouched in a few clicks.

## Make sure it actually saves

If a page looks right in your reader but comes back sideways elsewhere, your viewer only rotated it *on screen*. The fix is to use a tool that writes the rotation into the document itself, every PDF page carries a `/Rotate` value in the standard, and saving that value is what makes the fix permanent. That's exactly what happens when you download from the Rotate PDF tool. The full explanation lives in [how to rotate a PDF and save it](/blog/how-to-rotate-a-pdf-and-save-it). The new file carries the correct orientation for everyone.

## Prevent it next time

- **Set your scanner's orientation** before a big batch. Most drivers have an "auto-rotate" or fixed-angle option.
- **Hold your phone with the page's top at the top** when snapping documents.
- **Rotate before you merge.** Straighten each source file first, then combine them, so the finished document reads consistently.

A sideways or flipped PDF looks broken but is trivial to repair. Pick the right quarter-turn, apply it to the pages that need it, and save. [Fix your sideways PDF now](/rotate-pdf) and it'll open upright everywhere.

## Sources

- [pdf-lib](https://github.com/Hopding/pdf-lib), the in-browser PDF engine these tools run on
- [PDF (Wikipedia)](https://en.wikipedia.org/wiki/PDF)
