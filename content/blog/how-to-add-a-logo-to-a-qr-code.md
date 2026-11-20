---
title: "How to Add a Logo to a QR Code Without Breaking Scannability"
description: "Add your logo to a QR code the safe way. How big the logo can be, why error correction saves you, contrast rules, and how to test before you print."
date: "2026-07-05"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "qr-code-with-logo"
category: "qr-tools"
tags: ["branding", "logo", "qr codes", "design", "how-to"]
featured: true
---

A plain black-and-white QR code works perfectly, but it says nothing about who it belongs to. Drop a logo in the middle and suddenly it looks intentional, trustworthy, and on-brand, the difference between a code people ignore and one they actually scan. The catch is that a QR code is *data*, not decoration, and covering the wrong part with a logo can quietly stop it from working. This guide shows how to brand a code confidently while keeping every scan reliable.

## Why you can put a logo there at all

It seems reckless to slap an image over part of a machine-readable code, but it works because of a feature built into every QR code: **error correction**. When a code is generated, extra redundant data is woven in using Reed–Solomon maths, so a scanner can rebuild the message even if a chunk is missing. A logo simply covers some modules, and error correction reconstructs them from the redundant copies elsewhere in the grid.

That is all there is to it. Your logo isn't sitting in a special "safe zone", it's obscuring real data, and the code survives because it was designed to lose some data and still be read. Understanding this changes how you approach the design: the question isn't *whether* you can add a logo, but *how much* of the code you can afford to hide. Our [logo QR code generator](/qr-code-with-logo) handles the placement and correction automatically, but knowing the limits helps you push a design as far as it can safely go.

## The one setting that matters most: error correction level

QR codes come in four error-correction levels, and they determine your logo budget:

| Level | Data it can recover | Good for a logo? |
|---|---|---|
| L (Low) | ~7% | No, almost no room to spare |
| M (Medium) | ~15% | Small logos only |
| Q (Quartile) | ~25% | Comfortable for most logos |
| H (High) | ~30% | Best, maximum logo freedom |

For any code with a logo, use **level Q or H**. Level H can lose up to about 30% of the code and still scan, which gives you real breathing room for a centred logo. The trade-off is that higher correction adds more redundant data, making the code slightly denser. That's usually a fair price for a branded code that reads first time. If you want the deeper explanation of these levels and their trade-offs, we wrote a full [error correction levels guide](/blog/qr-code-error-correction-levels-explained).

## How big can the logo be?

The safe rule of thumb: keep the logo covering **no more than about 20–25% of the code's total area**, and never let it touch the three large corner squares (the finder patterns). Those corners are how a scanner locates and orients the code, cover one and the whole thing fails instantly, no matter how good your error correction is.

Practical guidance:

- **Centre it.** The middle of the grid is the safest place, furthest from the finder patterns and the timing lines.
- **Stay under a quarter of the area.** With level H, a logo occupying roughly 20–25% of the area is reliable. Go bigger and you're gambling.
- **Give the logo a small quiet margin.** A little padding of clean modules around the logo, or placing it on a solid backing shape, helps the scanner cleanly separate logo from data.

If you understand *why* these limits exist, it helps to know [how QR codes actually work](/blog/how-qr-codes-actually-work), the finder patterns and module grid are exactly what your logo must respect.

## Contrast is non-negotiable

Scanners read a QR code as dark modules on a light background. Anything that muddies that contrast hurts reliability:

- **Keep dark modules genuinely dark and the background genuinely light.** A dark code on a white or pale background is the gold standard. Light code on a dark background can work but is riskier and not all scanners handle it.
- **Avoid colour combinations with low contrast.** A pale grey on white, or two similar mid-tones, may look elegant on screen and fail completely on a printed poster under bad lighting.
- **Your logo's colours don't need to match the code's colours**, the logo sits in an area error correction can rebuild, but the *code modules themselves* must stay high-contrast.

## A simple, safe workflow

1. **Start with your destination.** A shorter URL means fewer modules, a less dense code, and more forgiveness for a logo. If your link is long, consider a tidier landing URL.
2. **Set error correction to H.** Give yourself the maximum recovery budget before you add anything.
3. **Add the logo, centred and modest.** Aim for around a fifth of the area, well clear of the corners.
4. **Keep strong contrast.** Dark code, light background, and don't tint the modules into oblivion.
5. **Export at high resolution.** For print, a crisp vector or a large PNG prevents the modules from blurring together.

Our [QR code with logo](/qr-code-with-logo) tool applies these defaults for you, so you can drop in an image and preview the result immediately.

## Test before you commit: always

This is the step people skip and regret. A branded code that looks perfect on your monitor can fail on paper. Before you print thousands of flyers or etch it onto packaging:

- **Scan it with more than one phone.** Try an older device and a newer one. Test the built-in camera app *and* a dedicated scanner if you can.
- **Test at the real size and distance.** A code that scans fine held close may fail across a room: sizing rules matter, and we cover them in [the best QR code size for print](/blog/best-qr-code-size-for-print).
- **Test in real lighting.** Screens are backlit and forgiving. A matte poster in a dim café is not.
- **Confirm the destination.** Make sure the code actually opens the page you intended, not a typo'd URL.

If a code refuses to scan after adding the logo, the fixes are almost always: raise the error correction to H, shrink the logo, increase contrast, or move the logo off a finder pattern.

## Three rules keep it scannable

A logo turns a generic square into a piece of branding people trust enough to scan, and you don't have to sacrifice reliability to get it. Respect three things and you'll be fine: use error correction level H, keep the logo under roughly a quarter of the area and clear of the corners, and maintain strong dark-on-light contrast. Then test on real devices before you print.

Ready to brand yours? Try the free [QR code with logo generator](/qr-code-with-logo) (no sign-up, no watermark) and preview a scannable, branded code in seconds.

## The guard rails behind the logo slider

Since I built the [logo tool](/qr-code-with-logo), a note on what it actually enforces. The logo size is clamped between 10% and 50% of the code's width, defaulting to 25%, and the protected area (which clears the modules directly behind your mark) is on by default. As you drag the slider, a live check compares the footprint against what your error-correction level can rebuild, roughly 10% of the width at level L rising to 30% at H, and tells you to shrink the logo or raise the level the moment you cross it. The tool also opens with error correction already set to H rather than the everyday M default. The limits are real, though: these warnings reason about coverage and contrast, they do not scan the world's phones for you, so the printed-proof test above still stands.

## Sources

- [QR code (Wikipedia)](https://en.wikipedia.org/wiki/QR_code)
- [Reed-Solomon error correction (Wikipedia)](https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction), the maths behind QR damage tolerance
