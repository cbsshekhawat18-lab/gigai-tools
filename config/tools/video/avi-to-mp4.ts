import type { Tool } from "@/types";

/**
 * AVI to MP4, a single-purpose converter that rewraps and re-encodes a legacy
 * AVI (usually DivX/Xvid/MJPEG video with MP3 or PCM audio) into a modern,
 * universally playable H.264/AAC MP4 entirely in the browser via FFmpeg
 * (WebAssembly). AVI is a 1990s Microsoft container: it plays in old desktop
 * software but chokes in browsers, phones, `<video>` tags, social uploads and
 * most modern editors, which all expect MP4. This tool does a real transcode -
 * H.264 video, AAC audio, yuv420p pixels and +faststart for instant web
 * playback. Not a rename. All copy is written for the exact phrasing people
 * search when a stubborn AVI won't play, and nothing here overlaps the general
 * converter, the MP4-to-WebM tool, the compressor or the GIF copy. It is honest
 * that single-threaded ffmpeg.wasm is slower than a native encoder and that
 * large AVIs (which are often huge and lightly compressed) are memory-bound.
 */
const aviToMp4: Tool = {
  slug: "avi-to-mp4",
  title: "AVI to MP4",
  description:
    "Convert AVI to MP4 (H.264/AAC) in your browser: the universal format that plays on phones, browsers, social and editors. Real transcoding with web-ready faststart, preview and download. Nothing is uploaded.",
  category: "video-tools",
  group: "Convert",
  icon: "FileVideo",
  accent: "orange",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "AVI to MP4 Converter. Make Old AVI Files Play Everywhere, Free",
  tagline:
    "Turn a legacy AVI that won't open on your phone, browser or upload form into a clean, universal H.264 MP4. Real FFmpeg transcoding with web-ready faststart, an in-page preview, and a download, all on your device, never uploaded, no watermark, no sign-up.",
  longDescription:
    "This AVI-to-MP4 converter runs a full FFmpeg build compiled to WebAssembly directly in your browser and re-encodes your clip's video to H.264 and its audio to AAC inside an MP4 container: the format that virtually everything on earth can play. AVI is a legacy Microsoft container from the 1990s: the files inside it are usually DivX, Xvid or Motion-JPEG video paired with MP3 or raw PCM audio, and while old desktop players handle that fine, modern devices largely don't. Drop an AVI into a browser `<video>` tag, a phone's camera roll, an Instagram or WhatsApp upload, or a timeline in Premiere or CapCut, and you'll often get a black screen, a codec error, or silence. MP4 with H.264/AAC is the answer because it is the one combination that plays natively on iPhones, Android, every major browser, smart TVs, social platforms and essentially all editing software. This tool does a genuine transcode rather than a lazy rename: it decodes the AVI's stream, re-encodes the picture to H.264 with a yuv420p pixel format (the profile phones and browsers actually decode), converts the audio to AAC, and writes the MP4 with the moov atom moved to the front (`+faststart`) so it starts playing the instant it loads on the web instead of buffering the whole file first. Drop your AVI, click convert, and the tool works locally: it shows a determinate progress bar and plays the finished MP4 right in the page so you can confirm the picture and sound survived before you save. Because everything is client-side there is no upload wait and no privacy tradeoff: old family recordings, archived screen captures, ripped footage and internal clips never leave your machine, and there is no server to store, log or leak them. Be honest with yourself about speed: single-threaded WebAssembly FFmpeg is meaningfully slower than a native encoder, and AVIs are frequently large and only lightly compressed, so a short clip converts in seconds while a long or high-resolution file takes real time and leans on your browser tab's memory. When you have an AVI that simply won't play where you need it to, drop it here and get a modern MP4 back that just works, entirely in the browser.",

  ctaText: "Convert AVI to MP4",

  keywords: [
    "avi to mp4",
    "convert avi to mp4",
    "avi to mp4 converter",
    "avi to mp4 online free",
    "avi to h264",
    "avi converter online",
    "play avi on iphone",
    "avi won't play",
    "avi to mp4 browser",
    "divx to mp4",
    "xvid to mp4",
    "free avi to mp4",
  ],

  seo: {
    title: "AVI to MP4 Converter, Convert AVI to MP4 Online Free | GigAI Tools",
    description:
      "Free online AVI-to-MP4 converter. Re-encode legacy AVI (DivX/Xvid) to universal H.264/AAC MP4 with web-ready faststart and in-page preview: 100% in your browser, nothing uploaded, no watermark.",
  },

  features: [
    {
      icon: "FileVideo",
      title: "Real H.264/AAC MP4 output",
      description:
        "Your AVI's DivX/Xvid/MJPEG video is re-encoded to H.264 and its audio to AAC inside a proper MP4, a genuine transcode with yuv420p pixels, not a renamed.avi that still won't play.",
    },
    {
      icon: "Smartphone",
      title: "Plays everywhere",
      description:
        "MP4 with H.264/AAC is the one combination iPhones, Android, every major browser, smart TVs, social apps and editors decode natively, the exact reason an AVI wouldn't open in the first place.",
    },
    {
      icon: "Zap",
      title: "Web-ready faststart",
      description:
        "The MP4 is written with its moov atom moved to the front (+faststart), so it begins playing the instant it loads on a web page instead of buffering the whole file first.",
    },
    {
      icon: "Film",
      title: "Handles legacy codecs",
      description:
        "Old AVIs are usually DivX, Xvid or Motion-JPEG with MP3 or PCM audio. FFmpeg decodes those legacy streams and re-encodes them into the modern H.264/AAC stack cleanly.",
    },
    {
      icon: "Eye",
      title: "Preview before you download",
      description:
        "The finished MP4 plays right in the tool with its exact file size, so you can confirm the picture and audio came through before you save or share it.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "FFmpeg runs as WebAssembly on your device. Your AVI is never uploaded, stored or logged, safe for old personal recordings, archived footage and private captures.",
    },
  ],

  benefits: [
    {
      title: "Make a stubborn AVI finally play",
      description:
        "An AVI that shows a black screen or a codec error on your phone, in a browser or in an editor becomes a clean H.264 MP4 that opens on all of them: converted locally, without emailing it to yourself or hunting for an old player.",
    },
    {
      title: "Get it onto social and the web",
      description:
        "Instagram, WhatsApp, TikTok and most upload forms reject or mangle AVI. Transcode to MP4 on-device and hand them exactly the format they accept, with faststart so it streams instantly.",
    },
    {
      title: "Rescue old footage privately",
      description:
        "Unlike upload-based converters, nothing leaves your machine. A decades-old family AVI or an internal recording is re-encoded on-device, so no server ever sees your archive.",
    },
    {
      title: "No install, no watermark, no sign-up",
      description:
        "Get a real H.264/AAC MP4 without desktop software, a login or a stamped-on logo: just a browser tab you can close when you're done.",
    },
  ],

  howTo: [
    {
      title: "Drop your AVI",
      description:
        "Drag an AVI onto the workspace, or click to browse. The clip is probed locally for its duration and dimensions. Nothing is uploaded.",
    },
    {
      title: "Convert to MP4",
      description:
        "Click Convert AVI to MP4. FFmpeg loads once (a one-time download), then a progress bar tracks the H.264 encode as it runs on your device.",
    },
    {
      title: "Preview the result",
      description:
        "The finished MP4 plays right in the page with its exact file size, so you can confirm the picture and sound survived the transcode.",
    },
    {
      title: "Download or restart",
      description:
        "Save the MP4, or reset and drop another AVI to convert the next file in your batch.",
    },
  ],

  formats: {
    input: ["AVI"],
    output: ["MP4"],
  },

  useCases: [
    {
      audience: "Anyone with old footage",
      title: "Play a legacy AVI on a phone",
      description:
        "Convert a DivX/Xvid AVI from an old camcorder or download into an H.264 MP4 that opens straight from your iPhone or Android photos app. No obscure player, no upload to a random site.",
    },
    {
      audience: "Social / Content creator",
      title: "Get an AVI onto Instagram or TikTok",
      description:
        "Social platforms reject or garble AVI. Transcode to MP4 on-device and upload the format they actually accept, with faststart so it starts instantly on feed.",
    },
    {
      audience: "Video editor",
      title: "Import into a modern timeline",
      description:
        "Some editors choke on old AVI codecs. Re-encode to a clean H.264 MP4 so it drops into Premiere, DaVinci or CapCut without a transcode-on-import stall: done privately before the project even opens.",
    },
    {
      audience: "Archivist / IT",
      title: "Modernize an archive of AVIs",
      description:
        "Bring 1990s-2000s AVI recordings up to a future-proof MP4 that today's players and browsers decode natively, one file at a time, without any of the footage leaving the machine.",
    },
  ],

  troubleshooting: [
    {
      problem: "The conversion is slow.",
      solution:
        "Single-threaded WebAssembly FFmpeg is much slower than a native encoder, and AVIs are often large and lightly compressed, which makes them the heavy case. Trim to just the part you need first, close other heavy tabs, and expect real time for long or high-resolution files.",
    },
    {
      problem: "It ran out of memory or the tab crashed on a big AVI.",
      solution:
        "Uncompressed or very long AVIs can exhaust a browser tab's memory. Try converting on a desktop browser with more RAM, close other tabs, or split the AVI and convert it in parts. As a loose guide, keep source files under a few hundred MB.",
    },
    {
      problem: "The audio is missing in the MP4.",
      solution:
        "Some old AVIs carry an unusual or non-standard audio codec that couldn't be decoded to AAC. The video will still convert. If sound matters and dropped out, the source audio stream is likely the culprit. Try extracting or re-recording the audio separately.",
    },
    {
      problem: "Nothing happens on the first click / there's a pause before progress.",
      solution:
        "The first conversion downloads the FFmpeg WebAssembly core (~31 MB) once, then caches it. Give it a moment on the first run. Later conversions in the same session start immediately.",
    },
  ],

  tips: [
    "Trim to just the seconds you need before converting, encode time scales with length, so a shorter clip finishes far faster.",
    "AVIs are often big and lightly compressed, so the MP4 will usually come out much smaller, a nice bonus on top of the compatibility win.",
    "Convert on a desktop browser with a bit of RAM headroom. Large AVIs are memory-bound in single-threaded WASM.",
    "If you only need a smaller file rather than a format change, the Video Compressor gives you a direct quality dial instead.",
    "Keep the original AVI until you've previewed the MP4 and confirmed the picture and audio both survived.",
  ],

  security:
    "Your AVI is decoded and re-encoded to MP4 entirely in your browser using FFmpeg compiled to WebAssembly. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert old family recordings, archived footage and private captures. The FFmpeg core is fetched once from this site (same-origin) and cached. Your media stays on your device. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my AVI uploaded to a server?",
      answer:
        "No. The entire conversion runs locally in your browser using FFmpeg compiled to WebAssembly. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to convert private recordings and archived footage.",
    },
    {
      question: "What exactly does it output?",
      answer:
        "An MP4 container with the video re-encoded to H.264 and the audio to AAC, using a yuv420p pixel format and +faststart. That's the universal combination phones, browsers, social apps and editors decode natively: a genuine transcode, not a renamed AVI.",
    },
    {
      question: "Why won't my AVI play in the first place?",
      answer:
        "AVI is a 1990s container, usually holding DivX, Xvid or Motion-JPEG video with MP3 or PCM audio. Modern browsers, phones and social apps expect H.264/AAC MP4 and don't ship decoders for those legacy codecs, so you get a black screen, an error or no sound. Converting to MP4 fixes that.",
    },
    {
      question: "Will the MP4 be smaller than my AVI?",
      answer:
        "Usually much smaller. AVIs are often lightly compressed (or uncompressed) and bulky, while H.264 is far more efficient, so the MP4 typically comes out a fraction of the size. It isn't guaranteed for an already-compact source, but for most old AVIs it's a real bonus.",
    },
    {
      question: "Is there a file-size or length limit?",
      answer:
        "There's no hard cap, but be realistic: WebAssembly FFmpeg is slower and memory-bound, and AVIs tend to be large. Very big source files can exhaust the browser tab's memory. As a loose guide, keep source files under a few hundred MB and trim long clips before converting so the tool stays responsive.",
    },
    {
      question: "Why is the first conversion slow to start?",
      answer:
        "The first time you convert, the browser downloads the FFmpeg WebAssembly core (about 31 MB) and caches it. That happens once per session before encoding begins. After that, conversions start immediately. A progress bar shows both the one-time engine load and the encode.",
    },
    {
      question: "Does it keep the original quality?",
      answer:
        "It re-encodes to H.264 at a sensible quality target, so the result is visually very close to the source for typical footage. Because H.264 is far more efficient than legacy AVI codecs, you get near-identical picture at a much smaller size, but like any re-encode it isn't mathematically lossless.",
    },
    {
      question: "Can I convert other formats here too?",
      answer:
        "This tool is tuned specifically for AVI in and MP4 out. If your source is a MOV, MKV, WebM or something else, use the general Video Converter, which handles more containers and lets you pick the output format from a menu.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: browser-side AVI-to-MP4 conversion via WebAssembly FFmpeg, re-encoding video to H.264 and audio to AAC with yuv420p and +faststart, plus a live progress bar, in-page preview and download. Nothing is uploaded.",
    },
    {
      date: "2026-06-24",
      change:
        "Added a before/after size delta on the result and clearer guidance for legacy DivX/Xvid sources and non-standard audio streams.",
    },
    {
      date: "2026-06-29",
      change:
        "Sharpened the honest notes on single-threaded WASM encode speed and memory limits for large, lightly-compressed AVI files, and improved handling of missing-audio edge cases.",
    },
  ],

  relatedTools: [
    "video-converter",
    "mp4-to-webm",
    "video-compressor",
    "video-trimmer",
  ],
};

export default aviToMp4;
