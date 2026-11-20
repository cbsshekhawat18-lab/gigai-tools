---
title: "Convert PNG to JPG to Shrink File Size"
description: "A practical, step-by-step guide to converting PNG to JPG in your browser: including how to handle transparency, pick a quality, and keep the result sharp."
date: "2026-07-07"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "png-to-jpg"
category: "image-tools"
tags: ["png", "jpg", "convert", "how-to"]
featured: false
---

If you've got a PNG that's too big to email, too heavy for a web page, or just larger than it needs to be, converting it to JPG is usually the fastest fix. For photographs and screenshots, the savings are dramatic: often shrinking a multi-megabyte file to a few hundred kilobytes. Here's exactly how to do it, and how to make sure the result still looks good.

## Why JPG shrinks PNGs so effectively

PNG stores every pixel losslessly, which is expensive for detailed images. JPG uses lossy compression designed for photographic content, discarding detail your eye is unlikely to notice. On the right kind of image, that's the difference between 4 MB and 400 KB, with no visible change at a sensible quality setting.

The catch is that JPG can't store transparency. So before you convert, you need to decide what colour should fill any see-through areas of your PNG. That single choice is the whole trick.

## Step by step

Using our free [PNG to JPG converter](/png-to-jpg), the process takes seconds and runs entirely in your browser: your image is never uploaded.

1. **Add your PNG.** Drag it onto the drop zone, click to browse, or paste it straight from your clipboard after taking a screenshot.
2. **Choose the background fill.** This replaces any transparent pixels. Pick white to match a document, black for a dark interface, or enter a custom hex to match a brand colour.
3. **Set the quality.** Slide the quality control to balance file size against sharpness. Somewhere between 80 and 92 is the sweet spot for most images.
4. **Convert and review.** Press Convert and check the before/after panel. It shows the exact bytes and percentage saved.
5. **Download.** Save your JPG. Not quite right? Adjust the fill or quality and convert again instantly.

## Picking the right quality

The quality slider is where you control the trade-off, so it's worth understanding the ranges:

- **90–100**, Near-perfect fidelity. Best for images you'll print or where fine detail matters. Files are larger but still far below the PNG.
- **80–90**. The everyday sweet spot. Savings are large and artifacts are effectively invisible on screen.
- **60–80**. Aggressive. Good when size is critical and the image is a casual photo. Look closely at edges before committing.
- **Below 60**, Only for thumbnails or when you truly need the smallest possible file. Expect visible blockiness.

When in doubt, start at 88, look at the preview, and nudge from there.

## Handling transparency gracefully

The fill colour is the one decision that trips people up. A few guidelines:

- **Matching a white page?** Use pure white (`#ffffff`) so the image blends seamlessly.
- **Placing it on a dark UI?** Use black or a dark grey so there's no bright halo.
- **Unsure?** White is the safest default and reads cleanly almost everywhere.

Because you can see the result before downloading, there's no guesswork, if the fill looks wrong, change it and convert again.

## When you should *not* convert

Converting isn't always the answer. Keep the PNG if:

- It's a **logo or icon** that needs transparency on varied backgrounds.
- It's a **screenshot of text or a diagram** where crisp edges are essential. JPG will fuzz them.
- You'll **edit it repeatedly**, since JPG loses a little quality with every re-save.

For those cases, a PNG (or WebP for transparency plus small size) is the better home. Convert to JPG when the image is photographic, or when transparency simply doesn't matter.

## What happens to transparency

JPEG has no alpha channel, so a transparent PNG cannot stay transparent through this conversion. The tool handles it predictably: transparent regions are filled with white before encoding, which reads cleanly on documents and light pages. If your image needs its transparency (a logo going onto a coloured background, say), keep it as PNG and shrink it another way. For everything opaque, the MozJPEG encoder in your browser does the shrinking without your file going anywhere.

## The payoff

For the images JPG is built for (photos and screenshots) converting from PNG is one of the highest-value, lowest-effort optimizations available. It makes pages load faster, slips files under attachment limits, and frees up storage, all without noticeably touching how the image looks. Pick a fill, set a quality, and let the format do the heavy lifting.

## Sources

- [PNG Specification, Third Edition (W3C)](https://www.w3.org/TR/png-3/)
- [Image file type and format guide (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)
