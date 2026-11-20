---
title: "How to Convert MOV to MP4 (From iPhone or QuickTime, Without Quality Loss)"
description: "Why your.MOV files won't play everywhere, and how to convert QuickTime MOV to MP4 in your browser. No upload, no re-encoding surprises, no quality loss."
date: "2026-07-05"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "mov-to-mp4"
category: "video-tools"
tags: ["mov", "mp4", "quicktime", "iphone", "conversion"]
featured: true
---

You record a video on your iPhone, drop it into a slideshow or a group chat, and someone replies "it won't play." The file is a `.MOV`, and that single letter difference from `.MP4` is why. This guide explains what MOV actually is, why it trips up so many apps, and how to convert it to MP4 cleanly, ideally without re-encoding at all, so you lose nothing.

## What a MOV file really is

MOV is a **container format**: Apple's QuickTime container, to be exact. A container is a wrapper that holds the actual video and audio streams together with metadata like timestamps and chapter markers. It is not, by itself, "how the video is compressed." That job belongs to the *codec* inside the container.

Here's the part that surprises people: most modern iPhone MOV files and most MP4 files hold the **same video codec**: usually H.264, or the newer HEVC (H.265). The picture data is often identical. What differs is the box it's packed in. If you want the deeper mechanics of containers versus codecs, we wrote a whole plain-English explainer on [video codecs and containers](/blog/video-codecs-and-containers-explained), it's worth ten minutes if you convert files often.

## Why MOV won't play everywhere

MP4 is the closest thing video has to a universal standard. Windows Media Player, Android, most web browsers, PowerPoint, and nearly every video editor open it without complaint. MOV is tied more tightly to Apple's ecosystem. It plays flawlessly on a Mac or iPhone, but on a Windows machine or an older Android phone it can throw a codec error, refuse to embed in a document, or upload as a broken thumbnail.

So the goal is almost never "make the video better": it's "make the same video open anywhere." That framing matters, because it changes *how* you should convert.

## The right way: change the container, not the picture

Since MOV and MP4 frequently share the same H.264 or HEVC video inside, the cleanest conversion just **repackages** the streams into an MP4 wrapper, a process called remuxing. No frames are decoded and re-encoded, so:

- There is **zero generation loss**. The pixels are copied byte-for-byte.
- It's dramatically **faster** than a full re-encode.
- The file size stays roughly the same.

Re-encoding (decoding every frame and compressing it again) is only necessary when the source codec genuinely isn't MP4-compatible, or when you deliberately want to shrink the file. Some desktop tools can remux when the source is already MP4-compatible H.264. Ours takes a different path, explained honestly below.

## How to convert MOV to MP4 in your browser

You don't need Handbrake, a desktop install, or an upload to a stranger's server. Here's the whole flow:

1. Open the [MOV to MP4 tool](/mov-to-mp4).
2. Drag your `.MOV` file onto the drop zone (or pick it from your device).
3. Let it process. It runs right in the browser tab, so nothing is uploaded.
4. Download the `.MP4`.

Because the work happens locally, your footage never leaves your device. That's a real advantage when the clip is personal, a family moment, a client's confidential recording, unreleased work. For more on why in-browser tools are genuinely private rather than just claiming to be, see [how browser-based video editing works](/blog/how-browser-based-video-editing-works).

## Converting from QuickTime on a Mac

If you're on a Mac and prefer to stay in QuickTime, there's a built-in path too, though it's clunkier and only offers fixed presets:

1. Open the clip in **QuickTime Player**.
2. Choose **File → Export As** and pick a resolution (e.g. 1080p).
3. QuickTime exports an `.mp4` (technically an `.m4v`/MP4 family file).

The catch: QuickTime's export **always re-encodes**, so you take a small quality hit and wait longer, even when a simple remux would have been lossless. It also caps you at Apple's preset resolutions. For a straight container swap with no quality loss, an in-browser converter is usually the better choice.

## Stopping the problem at the source (iPhone)

If you're tired of converting after the fact, you can tell your iPhone to record in a more compatible format from the start:

- Go to **Settings → Camera → Formats**.
- Choose **Most Compatible** instead of **High Efficiency**.

"Most Compatible" records H.264 in an MP4-friendly form, which sidesteps both the HEVC codec issues and, in many cases, the MOV-won't-open headache. The trade-off is larger files, since H.264 compresses less efficiently than HEVC. It's a fair deal if you constantly share clips with Windows and Android users.

## MOV vs MP4: which should you keep?

There's a longer breakdown in our [MOV vs MP4 comparison](/compare/mov-vs-mp4), but the short version:

| | MOV (QuickTime) | MP4 |
|---|---|---|
| Best for | Editing on a Mac, Apple ecosystem | Sharing, uploading, embedding anywhere |
| Compatibility | Excellent on Apple, patchy elsewhere | Near-universal |
| Typical codec | H.264 / HEVC | H.264 / HEVC |
| Quality | Identical to MP4 (same codec) | Identical to MOV (same codec) |

Keep MOV if you're editing on Apple hardware and want QuickTime's extra metadata. Convert to MP4 the moment the file needs to travel: to a Windows colleague, a web upload, a PowerPoint deck, or an Android phone.

## A few practical tips

- **Batch it if you can.** If you've got a folder of clips off a phone, convert them together rather than one at a time.
- **Watch for HEVC.** A very old target device might not play HEVC even inside an MP4. If a converted file still won't open on an ancient TV or app, you may need a genuine re-encode to H.264, that's the one case where quality-loss-free isn't possible.
- **Trim first, convert once.** If you only need part of the clip, cut it before converting so you're not encoding footage you'll throw away. Our [video merger](/video-merger) and trimming tools handle that upstream.

## A compatibility question, not a quality one

Converting MOV to MP4 is usually not a quality question at all, it's a compatibility one. The video inside is typically the same H.264 or HEVC stream. You're just repackaging it so the rest of the world can open it. Use a tool that remuxes rather than re-encodes when it can, keep the work on your own device for privacy, and reach for a full re-encode only when an old device genuinely can't handle the codec.

Ready to fix that stubborn `.MOV`? Drop it into the [MOV to MP4 converter](/mov-to-mp4): free, private, and no sign-up.

## Correction: what our converter really does

An earlier version of this article claimed our converter remuxes when the codec allows. Checking the shipped code, that was wrong, and I would rather correct it than let it stand: the [MOV to MP4 converter](/mov-to-mp4) always re-encodes to H.264 with AAC audio at a visually transparent quality level, and adds the faststart flag so the file starts playing before it finishes downloading. The upside of that choice is universality (HEVC-in-MOV from iPhones becomes plays-anywhere H.264). The honest cost is a re-encode. If you specifically need a lossless container swap of an H.264 MOV, desktop ffmpeg with stream copy is the right tool.

## Sources

- [Web video codec guide (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs)
- [Media container formats (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers)
