---
title: "How to Convert Audio to MP3 (And Pick the Right Bitrate)"
description: "Convert any audio file to MP3 in your browser, plus a plain-English guide to bitrate, so you get small files without wrecking the sound."
date: "2026-07-03"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "mp3-converter"
category: "audio-tools"
tags: ["mp3", "convert", "bitrate", "audio", "how-to"]
featured: true
---

MP3 has outlived nearly every format it was supposed to lose to. It plays on everything (old car stereos, cheap Bluetooth speakers, gym equipment, a decade-old phone in a drawer) and that universal support is exactly why people still convert to it. If you have a WAV, M4A, FLAC, OGG, or AAC file that won't cooperate with some device or upload form, turning it into an MP3 usually makes the problem disappear.

This guide covers how to do the conversion in your browser, and then the part most tutorials skip: how to choose a bitrate so your file is small *and* sounds good.

## Why convert to MP3 at all

There are really only three reasons, and it helps to know which one is yours before you start:

- **Compatibility.** A device or website rejects your file. MP3 is the safest common denominator.
- **File size.** A WAV recording of a one-hour meeting can be 600 MB. The same audio as a reasonable MP3 might be 55 MB: small enough to email or upload without a fight.
- **Consistency.** You have a folder of mixed formats and want everything in one tidy, predictable type.

If your goal is archival quality (a master recording you'll edit later) MP3 is the wrong choice, because it throws data away permanently. For that, keep a lossless copy. We break down that trade-off in [MP3 vs WAV vs FLAC](/blog/mp3-vs-wav-vs-flac-audio-formats-explained). But for listening, sharing, and everyday portability, MP3 is hard to beat.

## Converting in your browser

You don't need to install software or hand your files to a server. The [MP3 converter](/mp3-converter) runs entirely in your browser tab, so the audio never leaves your device.

1. Open the [audio to MP3](/audio-to-mp3) tool and drop your file in, WAV, M4A, AAC, OGG, FLAC, and more are accepted.
2. Pick a bitrate (see the next section. This is the one decision that matters).
3. Let it encode. The work happens locally using WebAssembly, so there's no upload wait and no queue.
4. Download the finished MP3.

Because nothing is transmitted, this is safe to use on voice memos, private recordings, or anything you'd rather not upload to a stranger's server. If you're curious why in-browser tools are more private by design, we explain the architecture in [Are online tools safe?](/blog/are-online-pdf-and-image-tools-safe).

## Bitrate, explained without the jargon

Bitrate is how much data the MP3 uses to describe each second of audio, measured in kilobits per second (kbps). More kbps means more detail preserved and a larger file. Fewer kbps means a smaller file and, past a point, audible damage, a hollow, swirly, or "underwater" quality on cymbals and voices.

Here's the practical map:

| Bitrate | Sounds like | Best for | Rough size (per minute) |
|---|---|---|---|
| 320 kbps | Near-transparent | Music you care about | ~2.4 MB |
| 256 kbps | Excellent | General music listening | ~1.9 MB |
| 192 kbps | Very good | Podcasts, everyday music | ~1.4 MB |
| 128 kbps | Acceptable | Casual listening, tight size limits | ~1.0 MB |
| 96 kbps or lower | Noticeably degraded | Spoken word only | ~0.7 MB |

A few honest rules of thumb:

- **Music: use 256 or 320 kbps.** Most people can't reliably tell 320 kbps from the original in a blind test, so there's no reason to go higher, and no such thing as a "512 kbps MP3" that's better.
- **Podcasts and voice: 128 kbps is plenty**, and 96 kbps mono is fine for pure speech. Voice has far less to preserve than a full mix, so you save a lot of space with no real loss.
- **Never re-encode upward.** Converting a 128 kbps MP3 to 320 kbps does not add quality back: the detail is already gone. You just get a bigger file of the same lossy audio.

## Mono vs stereo, and sample rate

Two smaller settings can shrink your file further without hurting anything, *if* they fit the content:

- **Mono** collapses two channels into one. For a solo voice recording (an interview, a lecture, a voice memo) mono halves the data with no meaningful loss, since there's no stereo image to preserve. Keep **stereo** for music and anything with left-right movement.
- **Sample rate** (like 44.1 kHz or 48 kHz) rarely needs changing. Leave it at the source's rate unless you have a specific reason. Dropping it too low dulls the high end.

## A quick workflow that always works

When you're unsure, this sequence gives a good result almost every time:

1. Start at **192 kbps stereo** for music, or **128 kbps mono** for voice.
2. Listen back on the device you'll actually use, earbuds, car, laptop speakers.
3. If it sounds thin or swirly on the parts you care about, bump the bitrate one step up and re-encode *from the original*, never from the MP3 you just made.

The "re-encode from the original" point is the one people get wrong most, so it's worth repeating: always keep your source file until you're happy, because every MP3 pass loses a little more.

## Trimming or fixing before you convert

Conversion is often step two. If you also want to cut the file down or clean it up first, a few sibling tools pair naturally with MP3 export:

- Cut a clip or grab a highlight, then export, handy when [making a ringtone from a song](/blog/how-to-make-a-ringtone-from-any-song).
- Even out volume swings first with an [audio normalizer](/audio-normalizer) so quiet passages aren't lost after compression: see [how to normalize loudness](/blog/how-to-normalize-audio-loudness).
- Recorded something with long gaps? [Remove the silence](/blog/how-to-remove-silence-from-audio) before encoding so you're not spending bitrate on nothing.

## Match the bitrate to the content

Converting audio to MP3 is a two-part decision: get the file into the format everything can play, and pick a bitrate that matches the content. Use 256–320 kbps for music, 128 kbps (mono) for voice, and always keep your original until you've confirmed the result sounds right. Do that, and you get files that are small, universally playable, and still sound the way you meant them to.

Ready to convert? Drop a file into the [MP3 converter](/mp3-converter). It's free, runs in your browser, and never uploads your audio.

## What happens in the tab when you convert

The [MP3 converter](/audio-to-mp3) decodes with your browser's own audio engine, so anything your browser can play is valid input, then encodes with lamejs, an MP3 encoder running as JavaScript in the tab. Nothing uploads at any point. One consequence worth planning around: if your source is already lossy (another MP3, an AAC), converting stacks a second generation of loss, so convert from the most original copy you have rather than from a previous conversion.

## Sources

- [Web audio codec guide (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs)
- [Web Audio API (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
