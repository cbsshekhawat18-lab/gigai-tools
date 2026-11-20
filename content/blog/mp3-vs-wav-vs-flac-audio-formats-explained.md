---
title: "MP3 vs WAV vs FLAC: Audio Formats Explained"
description: "Lossy vs lossless, plain and simple. Understand MP3, WAV, and FLAC: what each one keeps, what it throws away, and which to use for music, editing, and archiving."
date: "2026-07-05"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "audio-format-converter"
category: "audio-tools"
tags: ["mp3", "wav", "flac", "lossless", "audio-formats"]
featured: true
---

Three formats cover almost everything a normal person does with audio: MP3, WAV, and FLAC. They exist because they answer three different questions, *how small can this be?*, *how simple can this be?*, and *how do I keep perfect quality without a huge file?* Pick the wrong one and you either waste gigabytes or throw away detail you can never get back. This guide sorts it out in plain terms.

## The one idea that explains all three: lossy vs lossless

Every audio format is either **lossy** or **lossless**, and that single distinction predicts almost everything else about it.

- **Lossless** formats keep every bit of the original recording. WAV and FLAC are lossless. If you convert a lossless file to another lossless format and back, you get a bit-for-bit identical file. Nothing is ever discarded.
- **Lossy** formats permanently delete parts of the audio that the encoder judges you're least likely to hear, to make the file dramatically smaller. MP3 is lossy. Once that data is gone, no conversion brings it back.

Neither is "better" in the abstract. Lossless is better for quality and editing. Lossy is better for size and portability. The whole game is matching the format to the job.

## WAV: the raw, uncompressed original

WAV is audio with essentially no compression: the closest thing to the raw signal your recorder captured. That gives it two defining traits:

- **Perfect quality, zero decode overhead.** Nothing is compressed, so nothing has to be reconstructed. This is why editing software, DAWs, and audio hardware love WAV.
- **Big files.** A stereo CD-quality WAV runs about 10 MB per minute, roughly 600 MB per hour. That size is the price of simplicity.

Use WAV when a file is a *working* file: recording, editing, layering, mastering. Its downside, size, matters less on your own drive than it does when sharing. For a deeper look at exactly when to reach for each, see [MP3 vs WAV](/compare/mp3-vs-wav).

## FLAC: lossless, but compressed

FLAC is the clever middle. It's fully lossless (bit-for-bit identical to the source) but it uses compression to shrink the file, typically to **40–60% of a WAV's size** with no quality loss whatsoever. Think of it like a ZIP file for audio: smaller on disk, but you unpack the exact original every time you play it.

The trade-offs are small but real:

- **Support isn't universal.** FLAC plays on most modern software and phones, but some old car stereos, cheap players, and certain apps still don't recognize it. MP3 remains the safer bet for maximum compatibility.
- **A tiny decode cost.** Playing FLAC requires decompressing on the fly. On any device made this decade, that's imperceptible.

FLAC is the right pick for **archiving your music library** and for **sharing lossless audio** without the bulk of WAV. If you're weighing it against uncompressed audio, [WAV vs FLAC](/compare/wav-vs-flac) covers the details of when the smaller lossless file wins.

## MP3: small, universal, lossy

MP3 is the format that made portable music possible. It discards data to hit small sizes and, at a good bitrate, most listeners can't tell it apart from the original. Its superpower is **compatibility**. If a device can play audio at all, it can almost certainly play an MP3.

- **Tiny files.** At 192–320 kbps, an MP3 is a fraction of a WAV's size.
- **Plays on everything**, from a decade-old phone to a rental car.
- **Lossy and irreversible.** Every time you re-encode an MP3, quality drops further. Never treat one as a master.

MP3 is ideal for **listening, sharing, and portability**. Not for editing or archiving. If you need the format-agnostic details of choosing a bitrate, we cover that in [how to convert audio to MP3](/blog/how-to-convert-audio-to-mp3).

## Side by side

| | MP3 | WAV | FLAC |
|---|---|---|---|
| Type | Lossy | Lossless | Lossless |
| Quality vs source | Slightly reduced | Identical | Identical |
| File size (per hour) | ~55 MB (192k) | ~600 MB | ~300 MB |
| Best for | Sharing, listening | Recording, editing | Archiving, lossless sharing |
| Compatibility | Universal | Universal | Very good, not universal |
| Reversible? | No. Data is gone | Yes | Yes |

## How to choose, in one line each

- **Recording or editing?** Use **WAV**. You want the raw, uncompressed working file, and size doesn't matter on your own drive.
- **Archiving a music collection or sending lossless audio?** Use **FLAC**. Perfect quality at roughly half the size.
- **Sharing, uploading, or listening on the go?** Use **MP3**. Small and plays everywhere.
- **Not sure the destination supports FLAC?** Default to **MP3** for safety.

## A workflow that respects your originals

The golden rule with audio is the same as with photos: **keep a lossless master, and make lossy copies from it. Never the other way around.**

1. Record and edit in **WAV**.
2. Archive the finished piece in **FLAC** to save space while staying lossless.
3. Export **MP3** copies for distribution.

That way you always have a pristine source to re-export from. Converting between all three is a single step with the [audio format converter](/audio-format-converter), which runs in your browser, so even your lossless masters never leave your device.

## Three jobs, three formats

MP3, WAV, and FLAC aren't rivals so much as three tools for three jobs. WAV is the raw working file, FLAC is the compact lossless archive, and MP3 is the universal share-anywhere copy. Understand lossy versus lossless, keep a lossless master, and you'll never accidentally throw away audio you can't get back.

Need to switch between them? The [audio format converter](/audio-format-converter) handles all three, free and privately in your browser.

## How our audio tools read and write these

A practical note from the code: our audio tools decode input with the browser's own `decodeAudioData`, which is why they accept whatever your browser can play (MP3, WAV, M4A, AAC, OGG) without a codec download. Processing happens on raw samples in an `OfflineAudioContext`, faster than real time. On the way out, WAV is written sample for sample, and MP3 is encoded by lamejs right in the tab. The one honest caveat built into that pipeline: decoding a lossy MP3 and re-encoding it stacks two generations of loss, so when we say "keep a lossless master," we are also describing what protects you when using our own tools.

## Sources

- [Web audio codec guide (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs)
- [FLAC (Xiph.Org Foundation)](https://xiph.org/flac/), the reference lossless encoder
