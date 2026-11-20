---
title: "Video Codecs and Containers Explained (H.264, HEVC, VP9, AV1, MP4 vs MKV)"
description: "The difference between a codec and a container, in plain English (H.264, HEVC, VP9 and AV1 vs MP4, MKV and WebM) so you always pick the right export."
date: "2026-07-04"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "video-converter"
category: "video-tools"
tags: ["codecs", "containers", "h264", "hevc", "av1"]
featured: false
---

Almost every confusing thing about digital video comes down to one misunderstanding: people treat the file *extension* (`.mp4`, `.mkv`, `.webm`) as if it told them how the video is compressed. It doesn't. The extension names the **container**. The compression is done by the **codec** inside it. Once that distinction clicks, format errors, playback failures and export choices all start to make sense. Here's the whole thing in plain English.

## The lunchbox analogy

Think of a video file as a **lunchbox**:

- The **container** is the box itself: MP4, MKV, WebM, MOV. It defines how the contents are arranged and labelled: the video track, the audio track, subtitles, chapter markers, timestamps.
- The **codec** is *how the food is packed*. How the raw video is compressed to take up less space. H.264, HEVC, VP9 and AV1 are codecs.

A single container can hold different codecs, and a single codec can live in different containers. That's why two `.mp4` files can behave completely differently: same box, different contents. Understanding this is the key to using any [video converter](/video-converter) with confidence instead of guessing.

## Codecs: how the video is compressed

The codec is where the real engineering lives. It decides file size, quality, encoding speed and device compatibility. The four that matter today:

### H.264 (AVC): the universal default

Released in 2003 and still everywhere. **H.264 plays on virtually every device, browser and app ever made.** Its compression is no longer state of the art, so files are larger than newer codecs, but its unbeatable compatibility makes it the safe default for anything you need to *just work*. When in doubt, export H.264.

### HEVC (H.265), smaller files, licensing baggage

HEVC compresses roughly **40–50% smaller than H.264** at the same visual quality, which is why iPhones use it to fit 4K footage into reasonable space. The downsides: it's more demanding to decode (older devices struggle), and its patent-licensing situation has kept it off the open web. Great for storage and Apple devices, awkward for universal sharing.

### VP9: Google's royalty-free web codec

VP9 offers HEVC-class efficiency but is **royalty-free**, which is why YouTube leans on it and why it streams natively in browsers. You'll almost always find it inside a WebM container. If your target is the web and you want small files without licensing headaches, VP9 is a strong pick.

### AV1, the efficient future

AV1 is the newest of the bunch: royalty-free and **more efficient still than VP9 and HEVC**, often 30% smaller again. The catch is encoding speed, AV1 is slow and CPU-hungry to compress, and hardware decoding is only now becoming common. It's the codec streaming platforms are moving toward, but it's not yet the one you'd hand a random colleague.

Here's the quick comparison:

| Codec | Efficiency | Compatibility | Royalty-free | Best for |
|---|---|---|---|---|
| H.264 (AVC) | Baseline | Universal | No | Sharing, "just works" |
| HEVC (H.265) | High | Good (weaker on old devices) | No | Apple, 4K storage |
| VP9 | High | Good on modern browsers | Yes | Web streaming |
| AV1 | Highest | Growing | Yes | Future-proof streaming |

## Containers: how it's all packaged

The container matters less for quality but a lot for compatibility and features:

- **MP4**, the universal container. Plays everywhere, embeds in everything, uploads cleanly. It's the safe choice, and it happily holds H.264, HEVC or AV1. If you're picking between MP4 and WebM, our [MP4 vs WebM comparison](/compare/mp4-vs-webm) breaks down when each wins.
- **MKV (Matroska)**. A flexible open container that can hold almost any codec plus multiple audio tracks, subtitles and chapters. Beloved for archiving and movies, but not every app or phone opens it, so it's less ideal for casual sharing.
- **WebM**: a lean, open container built for the web, typically pairing VP9 or AV1 video with Opus audio. Perfect for websites, awkward for legacy software.
- **MOV**, Apple's QuickTime container, excellent inside the Apple ecosystem and common straight off an iPhone. See our guide on [converting MOV to MP4](/blog/how-to-convert-mov-to-mp4) for why it doesn't always travel well.

## Why this explains every "it won't play" error

When a video refuses to open, one of two things is usually true:

1. **The app doesn't recognise the container.** A player that only knows MP4 chokes on an MKV even if the video inside is plain H.264.
2. **The device can't decode the codec.** An old TV opens the MP4 container fine but has no idea how to play the AV1 stream inside it.

That's why swapping the container (remuxing) sometimes fixes playback instantly and sometimes doesn't: if the *codec* is the problem, you need a genuine re-encode, not just a new box. Knowing which is which saves you a lot of trial and error.

## How to actually choose when exporting

- **Sharing with anyone, anywhere?** H.264 inside MP4. Boring, bulletproof, correct 95% of the time.
- **Publishing on your own website?** VP9 or AV1 inside WebM for small files and fast loads, ideally with an MP4/H.264 fallback for older browsers.
- **Storing 4K footage on Apple gear?** HEVC inside MOV or MP4 to save space.
- **Archiving with subtitles and multiple audio tracks?** MKV.

A capable [video converter](/video-converter) lets you set both independently: pick the container for compatibility and the codec for the size-versus-quality trade-off you want.

## The size-vs-quality lever

One more concept ties it together: **bitrate**. Even with the same codec, a higher bitrate means more data per second, better quality, bigger file. Newer codecs let you drop the bitrate (and file size) while holding the same visual quality, which is the entire point of HEVC, VP9 and AV1. When you shrink a video, you're usually lowering bitrate or switching to a more efficient codec, the mechanics behind our [video compressor](/video-compressor).

## The container unpacks, the codec compresses

Container tells software how to *unpack* the file. Codec determines *how the video was compressed*, and therefore its size, quality and compatibility. H.264 in MP4 is the universal safe bet. HEVC, VP9 and AV1 trade broad compatibility for smaller files. MKV and WebM trade convenience for flexibility and openness. Keep the two concepts separate and you'll never be baffled by a format error again.

Ready to put it into practice? Set your container and codec deliberately in the [video converter](/video-converter). It runs in your browser, so your footage stays on your device.

## The pairings our tools choose for you

Our converters embody this article's advice in code: convert to MP4 and you get H.264 with AAC, the most universally decodable pairing. Convert to WebM and you get VP9 with Opus, the efficient royalty-free pair. We also set the MP4 faststart flag so the metadata sits at the front and playback starts before download finishes: a small container-level detail that matters exactly because, as this guide explains, the container is the part that decides how players read the file.

## Sources

- [Web video codec guide (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs)
- [Media container formats (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers)
