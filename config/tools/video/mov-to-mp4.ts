import type { Tool } from "@/types";

/**
 * MOV to MP4: a single-purpose converter that transcodes a QuickTime.mov
 * (the format iPhones, Macs and many cameras record) into a universally
 * compatible H.264/AAC MP4 entirely in the browser via FFmpeg (WebAssembly).
 * MOV is a fine capture container but a poor sharing one: plenty of Windows
 * players, upload forms, editors and messaging apps choke on it, while MP4
 * plays essentially everywhere. Every string below is written for the exact
 * phrasings people type when an iPhone or camera clip won't upload or play -
 * nothing is shared with the MP4-to-WebM, GIF or general-converter copy, and no
 * claim outruns what single-threaded ffmpeg.wasm actually does. It is honest
 * that this is a real re-encode (not a rename), that WASM is slower than a
 * native encoder, and that nothing is ever uploaded.
 */
const movToMp4: Tool = {
  slug: "mov-to-mp4",
  title: "MOV to MP4",
  description:
    "Convert MOV (QuickTime) to MP4 in your browser, a universally compatible H.264/AAC file that plays and uploads everywhere. Real FFmpeg transcoding, in-page preview, one-click download. Nothing is uploaded.",
  category: "video-tools",
  group: "Convert",
  icon: "FileVideo",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "MOV to MP4 Converter, Turn QuickTime Video into MP4 Online, Free",
  tagline:
    "Drop an iPhone, Mac or camera.mov and get back a clean H.264/AAC MP4 that plays and uploads everywhere. Real FFmpeg transcoding with faststart for instant playback: all on your device, never uploaded, no watermark, no sign-up.",
  longDescription:
    "This MOV-to-MP4 converter runs a full FFmpeg build compiled to WebAssembly directly in your browser and re-encodes your QuickTime clip's video to H.264 and its audio to AAC inside an MP4 container, the format that plays and uploads virtually everywhere. MOV is what an iPhone, a Mac screen recording or many DSLR and mirrorless cameras hand you: excellent for capture, but awkward for sharing. Windows Media Player and plenty of desktop players stutter or refuse it, some editors and CMS uploaders reject the container outright, and messaging apps often won't preview it. MP4 is the safe lingua franca (every browser, phone, editor, projector and upload form takes it) so converting once ends the ritual of a clip that plays fine on your Mac but breaks the moment you send it. The tool writes the MP4 with `-movflags +faststart`, which moves the index to the front of the file so it starts playing before it has fully downloaded, exactly what you want for the web, email and streaming previews. It also normalizes the pixel format to yuv420p, the profile that keeps H.264 playable on the widest set of hardware decoders instead of only in the app you recorded with. Because everything is client-side there is no upload wait and no privacy tradeoff: personal videos, unreleased footage and confidential screen recordings never leave your machine, and there is no server to store, log or leak them. Drop the MOV, watch a determinate progress bar track the re-encode, and the finished MP4 plays right in the page so you can confirm the picture and audio survived before you download. Be honest with yourself about the cost: this is a genuine re-encode, not a rename, so H.264 in single-threaded WebAssembly is noticeably slower than a native encoder: a short clip converts in seconds while a long or 4K one takes real time behind the progress bar. When your problem is simply that a.mov won't play, won't upload, or won't preview where you need it, drop it here and get a clean, compatible MP4 back, entirely in the browser.",

  ctaText: "Convert to MP4",

  keywords: [
    "mov to mp4",
    "convert mov to mp4",
    "mov to mp4 converter",
    "quicktime to mp4",
    "iphone mov to mp4",
    "mov to mp4 online free",
    "change mov to mp4",
    "mov file to mp4",
    "convert quicktime video",
    "mov to mp4 browser",
    "free mov to mp4",
    "mac mov to mp4",
  ],

  seo: {
    title: "MOV to MP4 Converter: Convert QuickTime to MP4 Online | GigAI Tools",
    description:
      "Free online MOV-to-MP4 converter. Re-encode iPhone, Mac and camera QuickTime.mov files to universally compatible H.264/AAC MP4 with faststart and in-page preview: 100% in your browser, nothing uploaded, no watermark.",
  },

  features: [
    {
      icon: "FileVideo",
      title: "True H.264/AAC MP4 output",
      description:
        "Your MOV's video is re-encoded to H.264 and its audio to AAC inside a proper MP4 container, a genuine transcode that plays on the widest set of players, phones and editors, not just a renamed.mov.",
    },
    {
      icon: "Zap",
      title: "Faststart for instant playback",
      description:
        "The MP4 is written with +faststart, moving its index to the front so it begins playing before the whole file downloads: ideal for the web, email previews and streaming.",
    },
    {
      icon: "Globe",
      title: "Plays and uploads everywhere",
      description:
        "MP4 is the format Windows players, messaging apps, CMS uploaders and editors all accept, convert once and stop fighting a.mov that only works on your Mac.",
    },
    {
      icon: "MonitorSmartphone",
      title: "Broad-compatibility pixel format",
      description:
        "Output is normalized to yuv420p, the H.264 profile hardware decoders and older devices handle best, so the MP4 doesn't play only in the app you recorded it with.",
    },
    {
      icon: "Eye",
      title: "Preview before you download",
      description:
        "The finished MP4 plays right in the tool with its exact file size, so you can confirm the picture and sound survived the round-trip before you save or send it.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "FFmpeg runs as WebAssembly on your device. Your MOV is never uploaded, stored or logged: safe for personal videos, unreleased footage and private screen recordings.",
    },
  ],

  benefits: [
    {
      title: "Fix a clip that won't upload or play",
      description:
        "An iPhone or Mac.mov that a Windows PC, a web form or a messaging app rejects becomes an MP4 that just works. No more re-recording or asking someone to switch players.",
    },
    {
      title: "Hand editors and platforms what they expect",
      description:
        "Many editors, CMSs and social uploaders assume MP4. Convert on-device and give them exactly the container they want, without a round-trip through a third-party server.",
    },
    {
      title: "Keep your footage private",
      description:
        "Unlike upload-based converters, nothing leaves your device. A personal video, an unreleased capture or a confidential screen recording is transcoded locally. There is no server that ever sees it.",
    },
    {
      title: "No install, no watermark, no sign-up",
      description:
        "Get a real H.264/AAC MP4 without desktop software, a login or a stamped-on logo. Just a browser tab you can close when you're done.",
    },
  ],

  howTo: [
    {
      title: "Drop your MOV",
      description:
        "Drag a QuickTime.mov onto the workspace, or click to browse. The clip is probed locally for its duration and dimensions. Nothing is uploaded.",
    },
    {
      title: "Convert to MP4",
      description:
        "Click Convert to MP4. FFmpeg loads once (a one-time download), then re-encodes the video to H.264 and audio to AAC with faststart, tracked by a live progress bar.",
    },
    {
      title: "Preview the result",
      description:
        "The finished MP4 plays right in the page with its exact file size, so you can confirm the picture and audio came through cleanly.",
    },
    {
      title: "Download or restart",
      description:
        "Save the MP4, or reset and drop another clip. Everything stays in the browser from start to finish.",
    },
  ],

  formats: {
    input: ["MOV"],
    output: ["MP4"],
  },

  useCases: [
    {
      audience: "iPhone / Mac user",
      title: "Send a clip that plays on Windows",
      description:
        "Convert an iPhone or Mac screen-recording.mov into an MP4 so a friend, colleague or client on Windows can open it in any player: encoded locally so a personal video stays private.",
    },
    {
      audience: "Video editor",
      title: "Import into an MP4-only timeline",
      description:
        "Some editors and older projects assume MP4. Transcode a camera .mov on-device to a broadly compatible H.264 MP4 you can drop straight onto the timeline without a codec fight.",
    },
    {
      audience: "Social / Marketing",
      title: "Meet an upload form that rejects MOV",
      description:
        "When a social platform, ad manager or CMS won't take .mov, convert your QuickTime capture to MP4 in the browser and upload exactly the format it expects.",
    },
    {
      audience: "Support / Teams",
      title: "Share a screen recording that previews",
      description:
        "A macOS screen capture is a .mov that many chat apps won't preview. Turn it into an MP4 with faststart so it plays inline the moment your teammate opens it.",
    },
  ],

  troubleshooting: [
    {
      problem: "The conversion is slow.",
      solution:
        "This is a real H.264 re-encode, not a rename, and single-threaded WebAssembly FFmpeg is meaningfully slower than a native encoder. Long clips and 4K footage are the worst case. Trim to just the part you need first, close other heavy tabs, and expect real time for anything more than a few seconds.",
    },
    {
      problem: "The MP4 is larger than my MOV.",
      solution:
        "Most iPhone and camera MOVs are already H.264 or HEVC, so re-encoding to H.264 can occasionally land a touch larger depending on the source bitrate. If size matters more than pure compatibility, run the result through the Video Compressor to bring it down with a quality dial.",
    },
    {
      problem: "The audio is missing or out of sync.",
      solution:
        "If the source used an unusual audio codec the AAC re-encode can occasionally drift. Try a different clip, or if the source is HEVC/ProRes, note that these heavy codecs stress the WASM engine: trimming to a shorter range first usually resolves both sync and memory issues.",
    },
    {
      problem: "Nothing happens on the first click / there's a pause before progress.",
      solution:
        "The first conversion downloads the FFmpeg WebAssembly core (~31 MB) once, then caches it. Give it a moment on the first run. Later conversions in the same session start immediately.",
    },
  ],

  tips: [
    "Trim to just the seconds you need before converting: encode time scales with length, so a shorter clip finishes far faster.",
    "MP4 is the safe choice for sharing. Keep the original .mov only if you specifically need the QuickTime container for a Mac-native workflow.",
    "If the result is bigger than you'd like, send it through the Video Compressor afterward to trade a little quality for a smaller file.",
    "4K and HEVC/ProRes MOVs are the heaviest to transcode in the browser, convert on a machine with some CPU and RAM headroom.",
    "Convert one clip at a time. Single-threaded WASM handles a single re-encode best rather than several at once.",
  ],

  security:
    "Your MOV is decoded and re-encoded to MP4 entirely in your browser using FFmpeg compiled to WebAssembly. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert personal videos, unreleased footage and private screen recordings. The FFmpeg core is fetched once from this site (same-origin) and cached. Your media stays on your device. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my MOV uploaded to a server?",
      answer:
        "No. The entire conversion runs locally in your browser using FFmpeg compiled to WebAssembly. Your file never leaves your device, so there is nothing for us to store, log or see. It is safe to convert personal videos and confidential recordings.",
    },
    {
      question: "What exactly does it output?",
      answer:
        "An MP4 container with the video re-encoded to H.264 and the audio to AAC, at a broadly compatible yuv420p pixel format and with +faststart so it begins playing before it fully downloads. It's a genuine transcode, not a renamed .mov, so it plays as a real MP4 everywhere.",
    },
    {
      question: "Isn't a MOV basically the same as an MP4? Why re-encode?",
      answer:
        "They're related containers and can even hold the same H.264 stream, but they aren't interchangeable in practice: many players, editors and upload forms accept MP4 but choke on MOV. A proper re-encode to H.264/AAC MP4 guarantees the widest compatibility rather than gambling on a container swap that some tools still reject.",
    },
    {
      question: "Why is the conversion slow?",
      answer:
        "This is a real re-encode, and it runs H.264 in single-threaded WebAssembly, which is meaningfully slower than a native encoder. A short clip converts in seconds. A long or 4K one takes real time behind the progress bar. Trimming first is the best way to speed it up.",
    },
    {
      question: "Is there a file-size or length limit?",
      answer:
        "There's no hard cap, but be realistic: WebAssembly FFmpeg is slower and memory-bound. Very large source files (especially 4K or HEVC/ProRes MOVs) can exhaust the browser tab's memory. As a loose guide, keep source files under a few hundred MB and trim long clips before converting so the tool stays responsive.",
    },
    {
      question: "Why is the first conversion slow to start?",
      answer:
        "The first time you convert, the browser downloads the FFmpeg WebAssembly core (about 31 MB) and caches it. That happens once per session before encoding begins. After that, conversions start immediately. A progress bar shows both the one-time engine load and the encode.",
    },
    {
      question: "Will the MP4 be smaller than my MOV?",
      answer:
        "Not necessarily. Most MOVs are already H.264 or HEVC, so the goal here is compatibility, not compression: the result is sometimes slightly larger depending on the source bitrate. If you want it smaller, run the MP4 through the Video Compressor afterward, which gives you a quality-versus-size dial.",
    },
    {
      question: "Can I convert other formats here?",
      answer:
        "This tool is tuned specifically for MOV in and MP4 out. If your source is a WebM, MKV or something else, or you want a different target, use the general Video Converter, which handles more containers and lets you pick the output from a format menu.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release: browser-side MOV-to-MP4 conversion via WebAssembly FFmpeg, re-encoding video to H.264 and audio to AAC with +faststart, plus a live progress bar, in-page preview and download. Nothing is uploaded.",
    },
    {
      date: "2026-06-25",
      change:
        "Normalized output to the yuv420p pixel format for broader hardware playback, and added a before/after size delta on the result.",
    },
    {
      date: "2026-06-30",
      change:
        "Sharpened the honest guidance around WASM re-encode speed on 4K and HEVC/ProRes sources, and improved memory handling for larger MOV files.",
    },
  ],

  relatedTools: [
    "video-converter",
    "video-compressor",
    "mp4-to-webm",
    "video-trimmer",
  ],
};

export default movToMp4;
