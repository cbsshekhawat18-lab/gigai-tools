import type { Tool } from "@/types";

/**
 * Mute Video: strip the audio track out of a clip and hand back a silent,
 * watermark-free video, entirely in the browser. Drop a file, hit mute, and a
 * self-hosted FFmpeg WebAssembly core copies the video stream untouched while
 * dropping the sound, so the render is fast (no re-encode of the picture) and
 * lossless for the frames you keep. Every string below targets the exact
 * queries people type when they want to silence a screen recording, kill
 * background chatter before a re-voiceover, or ship a quietly-looping hero clip
 * - nothing is shared with the reverse/trimmer/compressor copy, and no claim
 * outruns what a stream-copy mute actually does.
 */
const videoMute: Tool = {
  slug: "video-mute",
  title: "Mute Video",
  description:
    "Mute a video online in your browser, remove the audio track, preview the silent result, and download it. MP4, MOV, WebM and MKV, no uploads, no account, no watermark, and the picture stays untouched.",
  category: "video-tools",
  group: "Edit",
  icon: "VolumeX",
  accent: "sky",
  status: "live",
  featured: false,
  createdAt: "2026-06-14",

  h1: "Mute Video Online, Remove the Audio Track, Free",
  tagline:
    "Drop an MP4, MOV, WebM or MKV and get a clean silent copy back, the soundtrack stripped, the picture untouched. Powered by FFmpeg compiled to WebAssembly, it runs 100% in your browser: your footage is never uploaded, and the download carries no watermark.",
  longDescription:
    "The GigAI Mute Video tool does one everyday, genuinely-useful thing properly: it removes the audio from a clip and gives you back a silent version, with the picture bit-for-bit intact. Drop a video and it's read and probed on your own machine. No upload bar, no queue. Hit mute and a self-hosted FFmpeg WebAssembly core copies the video stream verbatim while discarding every audio track, so nothing about the image is re-encoded, degraded or resized: you get exactly the frames you started with, just quiet. Because it's a stream copy rather than a full re-render, muting is one of the fastest operations here, most clips finish in a fraction of the time compression or reversing would take, even on a laptop. When it's done, the silent clip plays back in the workspace so you can confirm there's no sound before you save, and the download is your footage, clean, unbranded, and free. Everything happens in your browser, so personal recordings, meeting captures, screen grabs and NDA footage never leave the tab. There's no account, no email wall and nothing stored. It's honest about the trade-off, too: single-threaded WASM still has to demux and remux the container, so very large files take proportionally longer and are bounded by your tab's memory. A live progress bar shows exactly where the mute stands the whole way. Close the tab and every trace is gone.",

  ctaText: "Mute video",

  keywords: [
    "mute video",
    "mute video online",
    "remove audio from video",
    "silence video",
    "strip audio from video",
    "mute mp4 online",
    "video muter",
    "mute video free",
    "mute video no watermark",
    "remove sound from video",
    "delete audio track from video",
    "mute video in browser",
  ],

  seo: {
    title: "Mute Video Online: Remove the Audio Track Free (No Watermark) | GigAI Tools",
    description:
      "Free online video muter: strip the audio out of any clip, preview the silent result and download it. MP4, MOV, WebM & MKV: 100% in your browser, no uploads, no watermark, picture untouched.",
  },

  features: [
    {
      icon: "VolumeX",
      title: "Removes every audio track",
      description:
        "Not a volume-down trick: the tool drops the sound streams entirely, so the exported file is genuinely silent, with no residual soundtrack, hidden second track or muted-but-present audio to surprise you later.",
    },
    {
      icon: "Copy",
      title: "Picture stays lossless",
      description:
        "The video stream is copied verbatim rather than re-encoded, so your frames come back bit-for-bit identical. No quality drop, no resize, no color shift. Only the audio is gone.",
    },
    {
      icon: "Zap",
      title: "Fast. No full re-render",
      description:
        "Because it's a stream copy, muting skips the slow picture re-encode that compression and reversing need. Most clips finish in a fraction of the time, even for long or high-resolution footage.",
    },
    {
      icon: "Eye",
      title: "Preview before you save",
      description:
        "The silent clip plays back in the workspace the moment it's done, so you can confirm there's genuinely no sound before committing to a download.",
    },
    {
      icon: "Download",
      title: "Clean, watermark-free download",
      description:
        "Save the muted video with no logo, no stamp and no sign-up, just your footage, minus the audio, in the same broadly compatible container it came in.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "A self-hosted FFmpeg WebAssembly core does the muting on your device. Your video is never uploaded, queued or stored, which keeps personal, client and NDA footage private.",
    },
  ],

  benefits: [
    {
      title: "Keep the clip on your device",
      description:
        "Most online muters make you hand the file to a stranger's server. Here the render runs on your own machine, so anything personal or confidential (a recorded call, a captured screen) never leaves the browser tab.",
    },
    {
      title: "No watermark, no account, no cap",
      description:
        "Free muters love to brand the export or gate the download behind a sign-up. This one just gives you the silent clip, unmarked, and as many times as you like.",
    },
    {
      title: "The picture isn't touched",
      description:
        "Cheap tools re-encode the whole file just to drop the sound, softening the image on the way. This one copies the video stream, so muting costs you nothing in quality. The frames are identical.",
    },
    {
      title: "Nothing to install",
      description:
        "No desktop editor, no plugin, no FFmpeg command line to memorise. Open the page in any modern browser and you're muting in seconds. It even works offline once the engine has loaded.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM or MKV onto the workspace, or click to browse. It's read and probed locally. Nothing is uploaded.",
    },
    {
      title: "Mute it",
      description:
        "Hit Mute video and watch the progress bar. The audio streams are dropped while the picture is copied straight through, so it's quick.",
    },
    {
      title: "Preview & download",
      description:
        "When it finishes, the silent clip plays so you can confirm there's no sound, then download it (clean and watermark-free) and compare the size to the original on the result card.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI"],
    output: ["MP4", "MOV", "WebM", "MKV"],
  },

  useCases: [
    {
      audience: "Content creator",
      title: "Silence a clip before a voiceover",
      description:
        "Strip the original camera audio (the room noise, the wind, your own mutter) so you can lay a clean narration or a music bed over the silent footage in your editor.",
    },
    {
      audience: "Marketer",
      title: "Ship a quietly-autoplaying hero video",
      description:
        "Background loops on landing pages should never blast sound. Mute the clip once here and embed a genuinely silent file, rather than relying on a muted attribute a browser might ignore.",
    },
    {
      audience: "Privacy-conscious sharer",
      title: "Remove overheard conversation",
      description:
        "A screen recording or phone clip often captures voices you didn't mean to share. Drop the whole audio track before you post, entirely on your own device.",
    },
    {
      audience: "Anyone",
      title: "Quiet a screen or gameplay recording",
      description:
        "Kill the notification pings, the mic bleed or the game audio on a capture so the visual stands alone: ready to caption, GIF or drop into a montage.",
    },
  ],

  troubleshooting: [
    {
      problem: "The first mute waits a while before the progress bar moves.",
      solution:
        "The very first run downloads the FFmpeg WebAssembly engine (a one-time fetch that's then cached). You'll see a 'loading engine' note during that step. Every mute after it skips the download and starts almost immediately.",
    },
    {
      problem: "The exported file still seems to have sound.",
      solution:
        "Make sure you're playing the downloaded muted copy, not the original. If you scrubbed the source before running, re-check the result card's file. Very unusual containers with multiple exotic audio tracks are rare. Convert to MP4 first and mute again if one slips through.",
    },
    {
      problem: "A big file took longer than expected.",
      solution:
        "Muting copies the picture without re-encoding, but single-threaded WASM still has to demux and remux the container, so very large or long files scale up in time and are bounded by your tab's memory. It's still far faster than a full re-render like compression.",
    },
    {
      problem: "My video won't load or preview.",
      solution:
        "The player relies on codecs your browser can decode. Very unusual, professional or DRM-protected formats may not preview. Try a mainstream container like MP4 or WebM, or convert the file first with the Video Converter.",
    },
  ],

  tips: [
    "Muting is a stream copy, so the picture is untouched: mute first, then compress or trim the silent result if you also need those, to avoid re-encoding twice.",
    "Only need the sound on its own? Use Extract Audio to pull the track out before you mute the video, so you keep both a silent clip and a clean audio file.",
    "Muting is one of the fastest operations here because the frames aren't re-encoded, even long clips finish quickly once the engine has loaded.",
    "Planning a voiceover? Mute the raw footage first so there's no original audio bleeding under your narration in the editor.",
    "For an autoplaying web video, embed a truly muted file rather than trusting the muted HTML attribute, some browsers and social players re-enable sound.",
  ],

  security:
    "Your video is read, probed, previewed and muted entirely in your browser using a self-hosted FFmpeg WebAssembly core. It is never uploaded to any server, queued, logged or stored. The picture stream is copied without re-encoding, and the audio is dropped locally, which makes the muter safe for personal recordings, captured calls, screen grabs and anything under NDA. There's no account and no watermark, and once the engine has loaded the tool keeps working offline. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The muter runs a self-hosted build of FFmpeg compiled to WebAssembly, so reading, previewing and muting all happen on your own device inside the browser tab. Your footage is never uploaded, queued behind other jobs, logged or stored, which is exactly why there's no upload bar reaching out to the cloud and no watermark on the result. It's safe for personal, client and confidential clips, including recorded calls and screen captures.",
    },
    {
      question: "Does muting reduce my video's quality?",
      answer:
        "No. Muting copies the video stream verbatim rather than re-encoding it, so the frames you download are bit-for-bit identical to the source: same resolution, same bitrate, same colors. The only thing that changes is that the audio track is dropped. That's also why muting is so much faster than compression or reversing: there's no slow picture re-render involved, just a demux-and-remux of the container.",
    },
    {
      question: "How large a video can I mute in the browser?",
      answer:
        "Because the picture isn't re-encoded, muting is light on CPU, but single-threaded WASM still has to read and rewrite the container, and it works within your tab's available memory. On a typical laptop, clips up to a few hundred megabytes are comfortable, and even long files mute far quicker than they would compress. A live progress bar shows exactly where the mute stands, and if a very large file struggles you can trim it first and mute the shorter result.",
    },
    {
      question: "Does the muted video have a watermark?",
      answer:
        "Never. The clip you download is your footage minus its audio. No logo, no stamp, no overlay of any kind. There's also no sign-up, no email wall and no usage cap. Because the processing happens on your device, there's no per-file cost to us, so there's nothing to gate.",
    },
    {
      question: "Which video formats can I mute?",
      answer:
        "The mainstream web and mobile containers: MP4, MOV, WebM, MKV and AVI, carrying common codecs like H.264, VP8/VP9 and their usual audio tracks. The muted output stays in a broadly compatible container. Exotic professional or DRM-protected formats may not preview or process: for those, convert the file to MP4 or WebM first with the Video Converter and then mute the result.",
    },
    {
      question: "Can I get the removed audio back separately?",
      answer:
        "Not from the muted file itself. Once the audio is dropped, the silent copy has no soundtrack to recover. If you want to keep the sound, run Extract Audio on the original first to save the track as MP3 or WAV, then mute the video. That way you end up with both a clean silent clip and a standalone audio file, and you can recombine or re-voice them however you like.",
    },
    {
      question: "Why is the first mute slower than the ones after it?",
      answer:
        "The first time you mute a clip, the tool downloads the FFmpeg WebAssembly engine once and caches it: you'll see a brief 'loading engine' note while that happens. Every mute after that skips the download and starts almost immediately, since the mute itself is a quick stream copy. Caching the engine is also why the tool can keep working offline once you've used it in a session.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's nothing to download, no plugin and no sign-up. Open the page in any modern browser (Chrome, Edge, Firefox or Safari), drop a clip in and mute it. The FFmpeg engine is fetched once on first use and cached, after which muting works on demand: including offline for a tool you've already opened.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release, drag-and-drop input, in-browser FFmpeg WebAssembly muting via lossless video stream-copy, live progress, silent preview, before/after size and watermark-free download.",
    },
    {
      date: "2026-06-21",
      change:
        "Faster remux path and a clearer first-run engine-loading note so the mute starts sooner after the one-time download.",
    },
    {
      date: "2026-06-28",
      change:
        "Improved probing for MOV/MKV sources and better handling of clips carrying multiple audio tracks so every track is dropped in a single pass.",
    },
  ],

  relatedTools: [
    "extract-audio",
    "video-compressor",
    "video-trimmer",
    "video-reverse",
  ],
};

export default videoMute;
