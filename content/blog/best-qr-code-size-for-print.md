---
title: "Best QR Code Size for Print: Scan-Distance Rules That Actually Work"
description: "How big should a QR code be for print? The simple 10:1 scan-distance rule, minimum sizes, quiet-zone margins, and resolution tips so every code scans first time."
date: "2026-07-19"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "qr-code-generator"
category: "qr-tools"
tags: ["print", "sizing", "qr codes", "design", "how-to"]
featured: true
---

The most common reason a printed QR code fails isn't a bad link or a broken generator. It's size. The code was printed too small for how far away people scan it, or crammed against other elements with no breathing room. Get the sizing right and codes scan instantly. Get it wrong and you've printed thousands of useless squares. This guide gives you concrete numbers and a rule you can apply to anything from a business card to a billboard.

## The one rule to remember: 10 to 1

The most useful sizing guideline in QR codes is the **10:1 distance-to-size ratio**:

> A QR code should be at least **1 unit wide for every 10 units of scanning distance.**

In plain terms: for every 10 cm (or inches) a person will stand from the code, make it at least 1 cm (or inch) wide. Scanning from 30 cm away? The code should be at least 3 cm across. Scanning a poster from 3 metres? You need roughly 30 cm. It scales linearly, and it's the single most reliable number to design around.

This ratio is a *minimum*, not a target. Going bigger than 10:1 only helps. It makes scanning faster and more forgiving of bad angles and poor lighting. Going *smaller* is where codes fail. When in doubt, size up.

## Real-world sizes by use

Applying the 10:1 rule to common formats gives you a handy cheat sheet:

| Where it lives | Typical scan distance | Minimum code size |
|---|---|---|
| Business card | ~10 cm | ~1 cm (but 2 cm is safer) |
| Flyer / brochure | ~30 cm | ~3 cm |
| Product packaging | ~20–30 cm | ~2–3 cm |
| Table tent / menu | ~30–40 cm | ~3–4 cm |
| Poster (indoor) | ~1–2 m | ~10–20 cm |
| Shop window | ~2–3 m | ~20–30 cm |
| Billboard | 10 m+ | 1 m+ |

A hard practical floor: **avoid printing any QR code smaller than about 2 cm (0.8 in) square**, even on a business card scanned up close. Below that, the individual modules get so small that ordinary print resolution and camera focus start to struggle. Two centimetres is a safe minimum for close-range printing.

## Don't forget the quiet zone

Size isn't only the code itself, it's the empty margin around it, called the **quiet zone**. QR codes need at least **four modules of blank space** on every side so scanners can tell where the code ends and the background begins.

Crowd a code right up against text, a border, or a busy photo and scanners hesitate or fail, even at the correct size. Give it clear, ideally white, breathing room. This margin is part of the code's structure, not optional decoration: it's built into [how QR codes actually work](/blog/how-qr-codes-actually-work), where the quiet zone helps the scanner lock on. When you plan layout, reserve space for the code *plus* its margin.

## Density changes everything

Two codes at the same physical size aren't equally easy to scan. A code holding a long URL, or one set to high error correction, has *more modules packed into the same square*, so each module is smaller. Smaller modules need either a bigger print size or a closer scan.

Two levers keep modules large and scannable:

- **Shorten your destination.** A concise URL means fewer modules and a cleaner, less dense code. If your link is long and full of tracking parameters, shorten it before generating.
- **Don't over-crank error correction for small prints.** Higher levels (Q, H) add redundant data and increase density. They're worth it for logos or rough conditions, but for a tiny clean print, a lower level keeps modules bigger. This is the balancing act we cover in [error correction levels explained](/blog/qr-code-error-correction-levels-explained).

The practical upshot: if a code must be small, keep the data short and the error correction modest so the modules stay large.

## Resolution and file format for print

A QR code can be the right physical size and still print badly if the file resolution is too low. Blurry, anti-aliased module edges confuse scanners.

- **Print at 300 DPI or higher.** At 300 DPI, a 3 cm code needs roughly 350×350 pixels or more. Never scale a small PNG up to fill a large space, you'll get soft, mushy modules.
- **Use vector (SVG) when you can.** A vector code stays razor-sharp at any size, which is ideal for large-format print like posters and banners. Our [QR code generator](/qr-code-generator) can export high-resolution files suitable for print.
- **Keep it pure black on white.** Maximum contrast reads best on paper. If you must add colour, keep the modules genuinely dark and the background genuinely light. Low contrast is a leading cause of print failures.

## Test at the real size and distance

This is the step that separates a successful print run from an expensive mistake. Before committing:

1. **Print a proof at the actual final size**. Not scaled on screen, physically printed on the real material.
2. **Scan it from the real distance** people will use, with more than one phone (an older and a newer device).
3. **Test in real lighting**, including the dim or glare-prone conditions of the actual location.
4. **Confirm the destination** opens the page you intended.

If it hesitates, the fix is almost always: make it bigger, add more quiet-zone margin, shorten the URL, or increase contrast. If you're branding the code, note that [adding a logo](/blog/how-to-add-a-logo-to-a-qr-code) interacts with all of this, a logo plus small print plus high density is the classic failure combo, so give branded codes extra size.

## Five numbers worth remembering

For print, size is the make-or-break variable. Apply the **10:1 rule** (1 unit of code for every 10 units of scan distance), never go below about **2 cm** for close-range prints, always leave a **four-module quiet zone**, keep the data short and contrast high so modules stay large, and print at **300 DPI or as vector**. Then test the real printed code at the real distance before the full run.

Ready to make a print-ready code? Use our free [QR code generator](/qr-code-generator) to export a high-resolution, scannable file. No sign-up, no watermark.

## What our print exports put in the file

A note from the code, since I built the export path: the SVG download from the [QR code generator](/qr-code-generator) is true vector, so it stays razor-sharp from business card to banner, and PNG can be rendered at up to 4096 pixels for big raster jobs. EPS is the interesting one. Instead of embedding a picture, it rebuilds the module matrix as plain PostScript rectangles and bakes a four-module quiet zone into the bounding box, which professional print pipelines appreciate. The honest limit: that EPS carries only your foreground and background colours on a clean grid. Gradients, styled dots, logos and frames are raster and SVG concepts, and they are deliberately left out rather than approximated. The PDF option centres a high-resolution raster on an A4 page, and the export size you choose sets how sharp that embedded image prints.

## Sources

- [QR code (Wikipedia)](https://en.wikipedia.org/wiki/QR_code)
- [Reed-Solomon error correction (Wikipedia)](https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction), the maths behind QR damage tolerance
