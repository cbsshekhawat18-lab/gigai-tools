---
title: "How to Resize a Video for Social Media (The Right Size for Every Platform)"
description: "The exact video dimensions and aspect ratios for Reels, TikTok, YouTube, Stories and feed posts, and how to resize a clip to each one without ugly black bars."
date: "2026-07-09"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "video-resizer"
category: "video-tools"
tags: ["social-media", "aspect-ratio", "reels", "tiktok", "resize"]
featured: true
---

The same 30-second clip can look sharp on one platform and get cropped through someone's face on another. That's because every social app expects a specific *shape*, and if you hand it the wrong one, the app crops or pads for you: rarely in a flattering way. The fix is to resize deliberately before you upload. Here's the exact size each platform wants and how to hit it cleanly.

## First: shape matters more than pixels

Before dimensions, understand aspect ratio, the *shape* of the frame. A **9:16** video is tall (portrait), **1:1** is square, and **16:9** is wide (landscape). Platforms are opinionated about which shape they favour:

- **Vertical 9:16** dominates the short-form world, Reels, TikTok, Shorts, and Stories.
- **Square 1:1** is a safe, compact middle ground for feed posts.
- **Horizontal 16:9** still rules standard YouTube and desktop viewing.

Get the shape right and the pixel dimensions almost follow automatically. Get it wrong and no amount of resizing saves you.

## The cheat sheet: dimensions per platform

Here are the sizes that upload cleanly and fill the frame today:

| Platform / surface | Aspect ratio | Recommended pixels |
|---|---|---|
| Instagram / TikTok / YouTube Reels & Shorts | 9:16 | 1080 × 1920 |
| Instagram / Facebook Stories | 9:16 | 1080 × 1920 |
| Instagram feed (portrait) | 4:5 | 1080 × 1350 |
| Instagram / Facebook feed (square) | 1:1 | 1080 × 1080 |
| YouTube (standard, landscape) | 16:9 | 1920 × 1080 |
| X / Twitter feed | 16:9 | 1920 × 1080 |
| LinkedIn feed | 1:1 or 4:5 | 1080 × 1080 / 1080 × 1350 |

Two rules of thumb: keep the long edge at **1080 px** for feed content (going higher rarely helps once the platform re-compresses it), and always aim to **fill** the frame rather than letterbox it.

## Resize vs. crop vs. black bars: know the difference

When you take a 16:9 landscape clip and need it as 9:16 vertical, you have three options, and they are not equal:

1. **Crop (fill the frame).** The tool zooms in and trims the sides, so the video fills the whole vertical frame. You lose the edges of the shot, but there are no bars and nothing looks broken. This is almost always what you want.
2. **Fit (letterbox).** The whole original is kept and padded with black bars top and bottom. Nothing is cut, but it looks amateurish and wastes screen space on mobile.
3. **Stretch.** The image is squished to fit. Never do this: faces go egg-shaped and it screams "mistake."

A good [video resizer](/video-resizer) lets you choose crop-to-fill and reposition the frame, so the important subject stays centred while the edges get trimmed. That single choice is the difference between a clip that looks native to the platform and one that looks reposted.

## How to resize a video, step by step

Using the [video resizer](/video-resizer), the flow is quick and stays entirely on your device:

1. Open the tool and drop in your clip.
2. Pick a target: either a preset like "Instagram Reel (9:16)" or a custom ratio.
3. Choose **crop to fill** and drag to reframe so your subject stays in shot.
4. Export and download the resized `.mp4`.

Because it runs in your browser, nothing uploads to a server, handy when you're resizing client work or unreleased content. We explain the privacy mechanics in [how browser-based video editing works](/blog/how-browser-based-video-editing-works).

## Shoot with resizing in mind

The easiest resize is the one you plan for. If you know a clip is going everywhere, two habits help enormously:

- **Shoot vertical if short-form is the priority.** You can crop a 9:16 down to 1:1 or 16:9 far more gracefully than you can invent vertical footage from a landscape shot.
- **Leave breathing room.** Frame your subject with a little space on all sides so a crop to a tighter ratio doesn't clip heads or captions.

If your captions or on-screen text sit too close to the edge, a crop will eat them. Keep text in the middle 80% of the frame: the "safe zone."

## Don't forget file size

Resizing changes dimensions, but platforms also care about file weight and will aggressively re-compress anything too large, often making it look worse. If your export is bulky, run it through a [video compressor](/video-compressor) before uploading so the platform's own compression has less to mangle. Smaller, correctly-sized files upload faster and survive the platform's processing with more of their quality intact.

## Quick platform-by-platform notes

- **Reels & TikTok:** 9:16, 1080 × 1920. Keep the crucial action off the very bottom, where the caption and UI buttons sit.
- **Stories:** same 9:16, but expect stickers and profile UI at top and bottom. Keep content central.
- **Instagram feed:** 4:5 portrait (1080 × 1350) takes up more vertical space in the scroll than square, so it tends to earn more attention.
- **YouTube:** stick to 16:9, 1920 × 1080, unless you're specifically making a Short.
- **Multi-platform posts:** export a vertical master, then create a 1:1 and a 16:9 crop from it rather than starting over.

## How the resize is actually done

Our [video resizer](/video-resizer) runs ffmpeg compiled to WebAssembly and applies a scale filter to every frame, then re-encodes to H.264 so the result plays anywhere a platform needs it to. Two consequences worth knowing: the work happens on your device (a long 4K clip will make a laptop fan speak up), and the output is a new encode, so start from your best-quality source rather than a file that has already been through one platform's compressor.

## Match the shape, fill the frame

Resizing for social media is really about matching each platform's expected *shape*, filling the frame with a smart crop rather than padding it with bars, and keeping your file size reasonable so the platform's compression doesn't ruin it. Nail those three things and the same footage looks purpose-built everywhere it lands.

Want to reshape a clip right now? Open the [video resizer](/video-resizer). Pick a platform preset, reframe, and download, all free and in your browser. For the theory behind the numbers, our sibling guide on [video codecs and containers](/blog/video-codecs-and-containers-explained) rounds out the picture.

## Sources

- [Image file type and format guide (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types)
