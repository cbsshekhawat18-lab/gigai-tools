import type { Tool } from "@/types";

/**
 * WebM to MP4: the mirror of the MP4-to-WebM tool. It transcodes a VP8/VP9
 * WebM into a widely compatible H.264 MP4 entirely in the browser via FFmpeg
 * compiled to WebAssembly. WebM is web-native but stubborn everywhere else:
 * iPhones, iMovie, Premiere, PowerPoint, WhatsApp, most TVs and countless
 * upload forms simply refuse it. MP4/H.264 is the format that actually plays
 * everywhere. Every string below is written for the exact queries people type
 * when a downloaded .webm, a screen recording or an OBS capture won't open on
 * their phone or in their editor; none of it is shared with the MP4-to-WebM,
 * general-converter, compressor or GIF copy. It is honest that H.264 encoding
 * in single-threaded ffmpeg.wasm is slower than a native tool and that MP4 is a
 * lossy re-encode of an already-lossy source.
 */
const webmToMp4: Tool = {
  slug: "webm-to-mp4",
  title: "WebM to MP4",
  description:
    "Convert WebM to MP4 (H.264) in your browser, the universally compatible format that plays on iPhones, in editors and on social. Preview the result and download. Nothing is uploaded.",
  category: "video-tools",
  group: "Convert",
  icon: "FileVideo",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-23",

  h1: "WebM to MP4 Converter: Make Any WebM Play Everywhere, Free",
  tagline:
    "Turn a stubborn WebM into an H.264 MP4 that opens on iPhones, in iMovie and Premiere, on social and in slide decks. Real FFmpeg transcoding with an in-page preview, all on your device, never uploaded, no watermark, no sign-up.",
  longDescription:
    "This WebM-to-MP4 converter runs a full FFmpeg build compiled to WebAssembly directly in your browser and re-encodes your clip's VP8/VP9 video to H.264 and its Vorbis/Opus audio to AAC inside an MP4 container, the format that plays essentially everywhere. WebM is wonderful on the open web, but the moment you leave the browser it turns into a headache: iPhones and iPads won't open it from the Files app, iMovie, Premiere, Final Cut and DaVinci often reject or misread it, PowerPoint and Keynote can't embed it, WhatsApp and many messaging apps refuse it, smart TVs choke on it, and a huge share of upload forms and video platforms accept only MP4. Converting to H.264 MP4 fixes all of that in one step, because H.264 is the most broadly supported video codec ever shipped: decoded in hardware on virtually every phone, laptop, TV and console made in the last decade. Drop your WebM, and the tool transcodes locally with a sane quality target, shows a determinate progress bar, then plays the finished MP4 right in the page so you can confirm the picture and sound survived before you download. Because everything is client-side there's no upload wait and no privacy tradeoff: a screen recording, a downloaded clip, an unreleased capture or a private moment never leaves your machine, and there's no server to store, log or leak it. Be honest with yourself about two things. First, this is a re-encode, not a rewrap: WebM's VP9 and MP4's H.264 are different codecs, so the pixels are decoded and re-compressed, and going from one lossy format to another can shed a little detail, the tool uses a quality-preserving default so the difference is usually invisible. Second, H.264 encoding in single-threaded WebAssembly is slower than a native encoder, so a short clip converts in seconds while a long or high-resolution one takes real time behind the progress bar. When your target is anything outside a modern browser (a phone, an editor, a slide deck, a social upload or a client who 'just needs an MP4') drop the WebM and get a clean, universally playable MP4 back, entirely in the browser.",

  ctaText: "Convert to MP4",

  keywords: [
    "webm to mp4",
    "convert webm to mp4",
    "webm to mp4 converter",
    "webm to h264",
    "webm to mp4 online",
    "webm to mp4 free",
    "vp9 to mp4",
    "change webm to mp4",
    "webm to mp4 browser",
    "webm to mp4 for iphone",
    "webm to mp4 no upload",
    "webm file to mp4",
  ],

  seo: {
    title: "WebM to MP4 Converter, Transcode WebM to H.264 Online | GigAI Tools",
    description:
      "Free online WebM-to-MP4 converter. Re-encode VP8/VP9 WebM to universally compatible H.264/AAC MP4 with an in-page preview, 100% in your browser, nothing uploaded, no watermark.",
  },

  features: [
    {
      icon: "Globe",
      title: "Plays virtually everywhere",
      description:
        "H.264 MP4 is the most broadly supported video codec ever shipped: hardware-decoded on almost every phone, laptop, TV, console and editor made in the last decade. Convert once and the awkward WebM finally opens where you need it.",
    },
    {
      icon: "FileVideo",
      title: "True H.264/AAC MP4 output",
      description:
        "Your WebM's VP8/VP9 video is re-encoded to H.264 and its Vorbis/Opus audio to AAC inside a real MP4 container, an actual transcode a phone and an editor accept, not a renamed file that still fails to open.",
    },
    {
      icon: "Smartphone",
      title: "iPhone & editor friendly",
      description:
        "The one-two punch WebM fails at: the result imports into iMovie, Premiere, Final Cut and DaVinci, saves to an iPhone's camera roll, and embeds in Keynote or PowerPoint without a codec error.",
    },
    {
      icon: "Eye",
      title: "Preview before you download",
      description:
        "The finished MP4 plays right in the tool with its exact file size, so you can confirm the picture and audio survived the round-trip before you save, send or upload it.",
    },
    {
      icon: "Zap",
      title: "One-click, no options to fumble",
      description:
        "No codec menus or bitrate math, the tool targets a quality-preserving H.264 encode by default, so you drop the WebM and get a clean, playable MP4 without guessing at settings.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "FFmpeg runs as WebAssembly on your device. Your WebM is never uploaded, stored or logged, safe for screen recordings, downloaded clips, unreleased footage and private moments.",
    },
  ],

  benefits: [
    {
      title: "Open a WebM your phone or editor rejected",
      description:
        "iPhones, iMovie, Premiere, PowerPoint and countless apps refuse WebM outright. One local conversion to H.264 MP4 makes the exact same footage open, import and save wherever you actually need it.",
    },
    {
      title: "Satisfy an MP4-only upload",
      description:
        "Social platforms, LMS portals, ad networks and client hand-offs frequently accept only MP4. Transcode on-device and hand over precisely the format they want. No third-party converter in the loop.",
    },
    {
      title: "Keep your footage private",
      description:
        "Unlike upload-based converters, nothing leaves your device. A downloaded clip, a screen capture or an unreleased recording is transcoded on-device, so there's no server that ever sees it.",
    },
    {
      title: "No install, no watermark, no sign-up",
      description:
        "Get a real H.264/AAC MP4 without desktop software, a login or a stamped-on logo. Just a browser tab you can close when you're done.",
    },
  ],

  howTo: [
    {
      title: "Drop your WebM",
      description:
        "Drag a.webm onto the workspace, or click to browse. The clip is probed locally for its duration and dimensions. Nothing is uploaded.",
    },
    {
      title: "Convert",
      description:
        "Click Convert to MP4. FFmpeg loads once (a one-time download), then re-encodes the video to H.264 and audio to AAC with a live progress bar.",
    },
    {
      title: "Preview the result",
      description:
        "The finished MP4 plays right in the page with its exact file size, so you can confirm the picture and sound came through cleanly.",
    },
    {
      title: "Download or restart",
      description:
        "Save the MP4, or reset and drop another WebM. The output is a standard H.264 MP4 ready for phones, editors, decks and uploads.",
    },
  ],

  formats: {
    input: ["WebM"],
    output: ["MP4"],
  },

  useCases: [
    {
      audience: "iPhone / mobile user",
      title: "Get a WebM onto your phone",
      description:
        "A clip you downloaded or recorded won't open on iOS or save to the camera roll because it's WebM. Convert it to H.264 MP4 and it plays in Photos, imports into iMovie and shares like any normal video, done locally so nothing leaves your machine.",
    },
    {
      audience: "Video editor / creator",
      title: "Import an OBS or screen capture",
      description:
        "Screen recorders and OBS often output WebM that Premiere, Final Cut or DaVinci refuse or misread. Transcode to MP4 first and it drops onto the timeline cleanly with correct audio and duration.",
    },
    {
      audience: "Presenter / marketer",
      title: "Embed a clip in a slide deck",
      description:
        "PowerPoint and Keynote can't embed WebM. Convert the clip to MP4 and it drops straight into a slide, plays inline during the talk, and travels with the deck to anyone's machine.",
    },
    {
      audience: "Anyone facing an upload form",
      title: "Meet an MP4-only requirement",
      description:
        "A social platform, LMS or client submission accepts only MP4. Re-encode your WebM on-device and upload exactly the format it asks for. No round-trip through a third-party server.",
    },
  ],

  troubleshooting: [
    {
      problem: "The conversion is slow.",
      solution:
        "H.264 is encoded in single-threaded WebAssembly, which is slower than a native tool. Long or high-resolution clips are the worst case. Trim to just the part you need first, close other heavy tabs, and expect real time for anything more than a few seconds. A short clip converts in seconds.",
    },
    {
      problem: "The MP4 looks slightly softer than the WebM.",
      solution:
        "This is a re-encode between two different lossy codecs (VP9 → H.264), so a little detail can be lost, that's inherent to any WebM-to-MP4 conversion, not a bug. The tool uses a quality-preserving default, so on most footage the difference is invisible. Grainy or fast-motion clips are the most likely to show it.",
    },
    {
      problem: "The MP4 has no sound.",
      solution:
        "If the source WebM had no audio track, the MP4 won't either. If it did but the output is silent, the source's audio codec may be unusual. Re-exporting the original with standard Opus/Vorbis audio, or muxing the audio separately, usually resolves it.",
    },
    {
      problem: "Nothing happens on the first click / there's a pause before progress.",
      solution:
        "The first conversion downloads the FFmpeg WebAssembly core (~31 MB) once, then caches it. Give it a moment on the first run. Later conversions in the same session start immediately.",
    },
  ],

  tips: [
    "Trim to just the seconds you need before converting: H.264 encode time scales with length, so a shorter clip finishes far faster.",
    "Keep the MP4 as your 'universal' copy: it plays on phones, in editors, on TVs and in slide decks where WebM won't.",
    "If you only need the footage on a modern website, you may not need to convert at all: WebM is web-native and often smaller there.",
    "For a silent clip, muting the source before converting shaves the AAC audio bytes from the MP4.",
    "Convert on a machine with a little CPU headroom. Single-threaded WASM H.264 is the heaviest part of the pipeline.",
  ],

  security:
    "Your WebM is decoded and re-encoded to MP4 entirely in your browser using FFmpeg compiled to WebAssembly. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert screen recordings, downloaded clips, unreleased footage and private moments. The FFmpeg core is fetched once from this site (same-origin) and cached. Your media stays on your device. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my WebM uploaded to a server?",
      answer:
        "No. The entire conversion runs locally in your browser using FFmpeg compiled to WebAssembly. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to convert confidential recordings and downloaded clips.",
    },
    {
      question: "What exactly does it output?",
      answer:
        "An MP4 container with the video re-encoded to H.264 and the audio to AAC: the codec pair that plays on virtually every phone, laptop, TV, editor and upload form. It's a genuine transcode, not a renamed WebM, so it opens where WebM was rejected.",
    },
    {
      question: "Will I lose quality converting WebM to MP4?",
      answer:
        "A little is possible. WebM's VP9 and MP4's H.264 are different lossy codecs, so the video is decoded and re-compressed, going from one lossy format to another can shed some detail. The tool uses a quality-preserving default, so on most footage the difference is invisible. Grainy or fast-motion clips are the most likely to show it.",
    },
    {
      question: "Why won't my WebM just play on my iPhone or in my editor?",
      answer:
        "WebM (VP8/VP9) is designed for the open web and isn't part of the codec set Apple devices, most editors, PowerPoint and many apps support. They're built around H.264/MP4, which is why converting fixes the problem. The pixels are the same, but the container and codec are ones those tools actually accept.",
    },
    {
      question: "Is there a file-size or length limit?",
      answer:
        "There's no hard cap, but be realistic: WebAssembly FFmpeg is slower and memory-bound, and H.264 encoding is CPU-heavy. Very large source files can exhaust the browser tab's memory. As a loose guide, keep source files under a few hundred MB and trim long clips before converting so the tool stays responsive.",
    },
    {
      question: "Why is the first conversion slow to start?",
      answer:
        "The first time you convert, the browser downloads the FFmpeg WebAssembly core (about 31 MB) and caches it. That happens once per session before encoding begins. After that, conversions start immediately. A progress bar shows both the one-time engine load and the encode.",
    },
    {
      question: "Can I convert other formats to MP4 here?",
      answer:
        "This tool is tuned specifically for WebM in. If your source is a MOV, MKV or AVI, use the general Video Converter, which handles more containers and lets you pick MP4 (or other targets) from a format menu.",
    },
    {
      question: "Will the MP4 be bigger than my WebM?",
      answer:
        "Sometimes. VP9 (WebM) is often a bit more efficient than H.264 at the same quality, so an MP4 can land a little larger than the WebM it came from. That's usually a fair trade for universal playback. If size matters, run the result through the Video Compressor afterward.",
    },
  ],

  changelog: [
    {
      date: "2026-06-23",
      change:
        "Initial release: browser-side WebM-to-MP4 conversion via WebAssembly FFmpeg, re-encoding video to H.264 and audio to AAC, with a live progress bar, in-page preview and download. Nothing is uploaded.",
    },
    {
      date: "2026-06-27",
      change:
        "Added a before/after size delta on the result and clearer honest guidance that this is a re-encode between two lossy codecs, not a lossless rewrap.",
    },
    {
      date: "2026-06-30",
      change:
        "Sharpened the compatibility copy around iPhones, editors and slide decks, and improved memory handling for larger source files.",
    },
  ],

  relatedTools: [
    "mp4-to-webm",
    "video-converter",
    "video-compressor",
    "video-to-gif",
  ],
};

export default webmToMp4;
