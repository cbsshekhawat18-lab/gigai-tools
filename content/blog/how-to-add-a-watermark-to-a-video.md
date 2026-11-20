---
title: "How to Add a Watermark to a Video: Brand and Protect Your Clips"
description: "Add a logo or text watermark to a video to brand it and discourage reuse. A practical guide to placement, opacity, sizing and doing it privately in your browser."
date: "2026-07-23"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "video-tools"
tool: "video-watermark"
tags: ["watermark", "branding", "video", "logo", "how-it-works"]
featured: false
---

A watermark is a small mark (a logo, a handle, or a line of text) laid over your video so that wherever the clip travels, your name travels with it. Creators use watermarks to build recognition, businesses use them to brand demos and tutorials, and everyone uses them to make casual re-uploading of their footage a little less appealing. Adding one is simple, but a few decisions separate a clean, professional watermark from one that distracts from the video or gets cropped off the moment someone reposts it. The steps to do it well, and how to do it without uploading your footage anywhere.

## What a watermark does, and what it doesn't

Set expectations honestly up front:

- **A watermark brands your work.** It ties the video to you or your business every time it's viewed, which is the main reason to add one.
- **A watermark discourages casual theft.** A visible mark makes lazy re-uploading less attractive, because your name is baked into the frame.
- **A watermark does not make a video impossible to steal.** A determined person can crop, blur, or cover it. Think of it as a deterrent and a branding tool, not DRM. That realism is worth keeping in mind so you don't over-invest in an "unbeatable" mark that just ruins your own video's look.

## Logo vs. text watermark

There are two kinds, and you might use either, or both.

### Logo watermark
An image (usually your logo) placed as a semi-transparent overlay. This is the professional standard for brands and creators with a recognisable mark. Use a **PNG with a transparent background** so only the logo shows, not a rectangle around it. If your logo is currently a JPG on a solid background, our guide on getting a [transparent PNG from a JPG](/blog/from-jpg-to-a-transparent-png-what-you-need-to-know) walks through it.

### Text watermark
Your handle, website, or name typed directly onto the video. It's fast, needs no image file, and is perfect when you don't have a logo or just want a clear "@yourname" in the corner.

## The four decisions that make a watermark look good

When you [add a watermark to a video](/video-watermark), four choices do all the work.

### 1. Placement
Corners are the classic choice. The bottom-right is the most common, staying out of the way of the action. A corner is unobtrusive but *is* the easiest spot for someone to crop out. If deterrence matters more than subtlety, place the mark closer to the centre or over important content, where removing it damages the video. Many creators split the difference and keep it in a corner for cleanliness.

### 2. Opacity
This is the setting people get wrong most often. A watermark at full opacity fights the video for attention. One that's barely visible does nothing. **Somewhere around 40–70% opacity** is usually the sweet spot, clearly present, but not distracting. Preview it against the busiest and darkest parts of your footage, since a mark that's readable on a bright scene can vanish on a dark one.

### 3. Size
Big enough to read, small enough to ignore. A watermark that spans a third of the frame is obnoxious. One that's a handful of pixels is pointless. Scale it to a small but legible fraction of the frame, and remember that if the video will be watched on phones, the mark needs to survive being shrunk to a small screen.

### 4. Contrast
A dark logo disappears on dark footage. A white one vanishes on a bright sky. A subtle outline, a soft shadow, or a mark that works in both light and dark helps it stay visible across varied scenes. If your footage is consistent, match the watermark colour to sit against it cleanly.

## A simple watermarking workflow

1. **Prepare your mark.** For a logo, have a transparent PNG ready. For text, decide the exact handle or URL.
2. **Trim first if needed.** If you're only watermarking one section to share, [trim the clip](/video-trimmer) before adding the mark so you're only processing what you'll use.
3. **Add the watermark** in the [video watermark tool](/video-watermark) and position it, corner for clean, central for harder-to-remove.
4. **Dial in opacity and size.** Preview against the brightest and darkest parts of the footage and adjust until it's present but not distracting.
5. **Export**, then [compress if needed](/video-compressor) to hit an upload size limit for your platform.

## Where the watermark fits in your video workflow

Watermarking usually comes near the end, after you've cut the clip to shape, but before you shrink it for delivery. A sensible order:

- **[Trim](/video-trimmer)** to the part worth sharing.
- **Watermark** the trimmed clip so your brand rides along.
- **[Compress](/blog/how-to-compress-a-video-in-your-browser)** to meet a platform's size limit.
- Optionally **[convert to WebM](/mp4-to-webm)** if it's headed to a website you control.

Doing it in that order means you're only ever watermarking and compressing footage you're actually keeping.

## Doing it privately, in your browser

The whole process can happen on your own device. Our [video watermark tool](/video-watermark) runs in the browser using WebAssembly, so your footage and your logo are never uploaded to a server. That matters for unreleased content, client work, or any clip you're not ready to hand off, the same client-side, verifiable model we describe in [Are online PDF and image tools safe?](/blog/are-online-pdf-and-image-tools-safe). Open developer tools, watch the Network tab, and your files never leave the page.

The trade-off is the usual one for in-browser video work: because the re-encode happens on your hardware, a long or high-resolution clip takes real time and memory. For the short, share-ready clips most watermarking is for, a modern laptop or phone handles it comfortably.

## Present, but never distracting

A good watermark is present but not distracting: a transparent-PNG logo or a clean line of text, placed thoughtfully, at moderate opacity, sized to stay legible even on a phone. It brands your work and discourages lazy reuse, while being honest that no visible mark is theft-proof. Add it after trimming and before compressing, and do it in a [browser-based watermark tool](/video-watermark) so your footage and your logo stay entirely on your device.

## How the mark is applied

The [video watermark tool](/video-watermark) runs ffmpeg in your browser and supports both approaches from this guide: a text watermark drawn by ffmpeg's drawtext filter, or an image (your transparent-PNG logo) composited by the overlay filter, with corner and centre positioning handled by coordinate expressions so the margin stays consistent regardless of resolution. The video is re-encoded with the mark burned into the frames, which is precisely what makes it persistent, and the whole render happens on your device.

## Sources

- [Image file type and format guide (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)
