---
title: "How to Extract Audio From a Video: Save the Sound as MP3"
description: "Pull the audio out of any video and save it as an MP3. A clear guide to how audio extraction works, choosing a format and quality, and doing it privately in your browser."
date: "2026-07-18"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "video-tools"
tool: "extract-audio"
tags: ["audio", "mp3", "video", "extraction", "how-it-works"]
featured: false
---

Sometimes you only want the sound. A lecture you recorded, a song from a performance clip, a podcast episode that was published as a video, the audio from an interview you need to transcribe: in every case, the video is just carrying the part you actually need. Extracting that audio turns a heavy video file into a light, playable MP3 you can drop on your phone, feed to a transcriber, or listen to with the screen off. How to do it audio extraction works, how to choose the right format and quality, and how to do it without uploading your video anywhere. For the step-by-step version, our [how-to-extract-audio-from-a-video walkthrough](/how-to/how-to-extract-audio-from-a-video) covers it click by click.

## What "extracting audio" actually does

A video file is really two streams bundled together in a container: the video (the pictures) and the audio (the sound). Extracting audio simply pulls out that audio stream and saves it as a standalone file. The pictures are discarded. The sound is kept.

Because the audio track is only a fraction of a video's size, an extracted audio file is dramatically smaller than the original. A 200 MB video might yield an audio file of just a few megabytes, same sound, a tiny fraction of the weight.

There are two ways the extraction can happen, and the difference affects quality:

- **Copying the audio stream directly** keeps the sound exactly as it was in the video. No quality loss at all. This is possible when the target format matches what's already inside the video.
- **Re-encoding to a new format** (for example, converting the video's audio to MP3) runs the sound through a new compression pass. It's still high quality, but it's a fresh encode rather than a perfect copy.

## Which audio format should you choose?

The right format depends on what you'll do with the file.

### MP3, the universal default
**MP3** plays on everything, every phone, car stereo, player and app. It's compressed, so the file is small, and at a decent bitrate the quality is more than good enough for speech and most music. For sharing, listening on the go, or transcription, MP3 is almost always the right answer.

### WAV, uncompressed, for editing
**WAV** is uncompressed, so it's large but lossless. Choose it only if you're going to edit the audio further in software and want the maximum-quality source to work from.

### AAC / M4A, efficient and modern
**AAC** is what many videos already use internally. It's more efficient than MP3 at the same quality and is well supported on Apple devices. If your video's audio is already AAC, keeping it as AAC can be a direct copy with no re-encode.

For most people, most of the time: **pick MP3.** It's the one that just works everywhere.

## Picking a quality (bitrate)

If you're saving as MP3, you'll usually choose a bitrate:

| Bitrate | Best for |
|---|---|
| 128 kbps | Speech, podcasts, transcription, small files |
| 192 kbps | A good all-round balance for music |
| 256–320 kbps | Music where quality matters most |

A key point: you can't create quality that wasn't in the video to begin with. If the original recording was modest, exporting at 320 kbps won't improve it: it'll just make a bigger file. Match the bitrate to the content: lower for spoken word, higher for music you care about.

## A simple extraction workflow

1. **Add your video** to the [extract-audio tool](/extract-audio). Because it runs locally, there's no upload: even a large video is ready right away.
2. **Trim first if you only want part of it.** Just need one song or one quote? [Trim the video](/video-trimmer) to that section before extracting, so you're not carrying audio you'll only delete.
3. **Choose your format.** MP3 for almost everything. WAV if you're going to edit further.
4. **Set the quality** if prompted, 128 kbps for speech, 192 kbps or higher for music.
5. **Export and save** the audio to your device.

## Doing it privately, in your browser

The whole extraction can happen on your own device. Our [extract-audio tool](/extract-audio) runs in the browser using WebAssembly, so your video is never uploaded to a server. That matters when the footage is a private recording, an interview, or unreleased material. You don't want it sitting on a stranger's machine just to pull out the sound. It's the same client-side, verifiable model we describe in [Are online PDF and image tools safe?](/blog/are-online-pdf-and-image-tools-safe): open developer tools, watch the Network tab, and you'll see your file never leaves the page.

The trade-off is the familiar one for in-browser processing, the work uses your device's processor and memory, so a very long video takes a little longer to process than it would on a powerful server. Since audio extraction is lighter than full video re-encoding, this is rarely a problem in practice.

## Common uses for extracted audio

- **Transcription.** Most transcription tools want an audio file, not a video. Extract to MP3 first for a smaller, faster upload.
- **Listening on the go.** Turn a recorded talk or a video podcast into an MP3 for your phone and listen with the screen off.
- **Editing.** Pull the audio into an editor to clean it up, add it to another project, or [normalize the volume](/audio-normalizer) so it's consistent.
- **Saving a snippet.** Grab one quote or one section, [trim first](/video-trimmer), then extract just that piece.

## Keep the sound, drop the weight

Extracting audio takes a heavy video and gives you back the light, portable sound inside it. Choose MP3 for near-universal compatibility, match the bitrate to whether it's speech or music, and trim to the section you want before extracting. Do it in a [browser-based extractor](/extract-audio) and your video never leaves your device. No upload, no account. From there, a few megabytes of MP3 is easy to share, transcribe, or listen to anywhere.

## The encoder settings we chose for you

Under the hood, the [audio extractor](/extract-audio) runs ffmpeg compiled to WebAssembly and encodes MP3 with the LAME encoder in variable-bitrate mode at its second-highest quality setting, a deliberate choice: VBR spends bits where the audio is complex and saves them where it is simple, which suits speech and music alike without you having to pick a number. Prefer an untouched copy? The WAV option writes uncompressed PCM. Either way the video never uploads. The extraction happens on your machine.

## Sources

- [Web audio codec guide (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs)
- [Web Audio API (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
