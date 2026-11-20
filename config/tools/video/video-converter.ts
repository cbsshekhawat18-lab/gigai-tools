import type { Tool } from "@/types";

/**
 * Video Converter, the format-changer of the GigAI Video Toolkit. Drop a clip,
 * pick a target container (MP4, WebM, MOV, AVI, MKV or GIF), and the tool
 * transcodes it entirely on-device with the same FFmpeg (WebAssembly) engine the
 * rest of the toolkit uses. MP4 output gets a real quality control (H.264 CRF)
 * because it re-encodes through libx264; other targets use each format's sensible
 * codec defaults. Copy is written for the exact phrasings people search when a
 * file "won't play", "wrong format for my editor" or "needs to be WebM for the
 * web": nothing here is shared with the compressor, trimmer or GIF copy, and no
 * claim outruns what single-threaded ffmpeg.wasm actually delivers (honest about
 * being slower than native and memory-bound).
 */
const videoConverter: Tool = {
  slug: "video-converter",
  title: "Video Converter",
  description:
    "Convert video between MP4, WebM, MOV, AVI, MKV and GIF in your browser with FFmpeg. Pick a target format, tune MP4 quality, preview the result and download. Nothing is uploaded.",
  category: "video-tools",
  group: "Convert",
  icon: "RefreshCw",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-14",

  h1: "Video Converter, Change Video Format Online with FFmpeg",
  tagline:
    "Turn any clip into the format you actually need. Convert between MP4, WebM, MOV, AVI, MKV and GIF with real FFmpeg transcoding, a target-format picker, an MP4 quality control and a preview player: all in your browser, never uploaded.",
  longDescription:
    "The GigAI Video Converter runs a full FFmpeg build compiled to WebAssembly right inside your browser tab, so it can re-container and re-encode a video without ever sending your footage to a server. Formats are the quiet reason a video refuses to cooperate: a phone's.MOV won't drop into a Windows editor, a.MKV won't play in Safari, a site demands WebM, and a design tool only takes MP4 or GIF. Drop your file, choose the target format from the picker, and the tool transcodes with the right codec pipeline for each container (H.264/AAC for MP4, MOV and MKV, VP9/Opus for WebM, and a palette-optimized encode for GIF) with faststart enabled on MP4/MOV so it plays and streams the instant it loads. When you convert to MP4 you also get a genuine quality control mapped to the H.264 CRF, so you can keep it visually clean or trade some detail for a smaller file. The other targets use each format's proven defaults. The result plays right in the page before you download, so you can confirm the picture and audio survived the round-trip. Everything is client-side, so there's no upload wait and no privacy tradeoff, personal recordings, unreleased footage and confidential captures never leave your machine. Be honest with yourself about the engine: WebAssembly FFmpeg is meaningfully slower than a native converter and it's memory-bound, so a short clip converts in seconds while a large one takes real time behind a determinate progress bar. GIF output in particular balloons fast, so it's best kept to short clips. Close the tab and every byte is gone.",

  ctaText: "Convert video",

  keywords: [
    "video converter",
    "convert video online",
    "convert to webm",
    "change video format",
    "ffmpeg online converter",
    "browser video converter",
    "convert video without uploading",
  ],

  seo: {
    title: "Video Converter: Convert MP4, WebM, MOV, MKV, GIF Online | GigAI Tools",
    description:
      "Free online video converter powered by FFmpeg. Convert between MP4, WebM, MOV, AVI, MKV and GIF, tune MP4 quality, preview and download, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "RefreshCw",
      title: "Six formats, one picker",
      description:
        "Convert to MP4, WebM, MOV, AVI, MKV or GIF from the same clip. Pick the target you need and the converter selects the correct codec pipeline for that container automatically.",
    },
    {
      icon: "Cpu",
      title: "Real FFmpeg, in your browser",
      description:
        "A full FFmpeg build compiled to WebAssembly does the transcode with libx264/AAC, VP9/Opus and palette-based GIF, the same engine desktop converters use, with no upload, account or install.",
    },
    {
      icon: "SlidersHorizontal",
      title: "MP4 quality control",
      description:
        "When you convert to MP4 you get a plain-English quality dial mapped to the H.264 CRF, from near-lossless to compact, so you can balance clarity against file size instead of guessing.",
    },
    {
      icon: "Zap",
      title: "Web-ready output",
      description:
        "MP4 and MOV are written with faststart so they play and stream the instant they load, and WebM comes out VP9/Opus for modern browsers. No re-muxing later just to put it online.",
    },
    {
      icon: "PlayCircle",
      title: "Preview before you download",
      description:
        "The converted result plays right in the page so you can confirm the picture and audio came through cleanly before you commit: the sanity check a command line never gives you.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Conversion happens on your device with a self-hosted engine. Personal recordings, unreleased footage and confidential captures are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Make the file your app will accept",
      description:
        "Editors, browsers, upload forms and design tools each demand specific containers. One pass here turns a stubborn .MOV or .MKV into the MP4, WebM or GIF the app will actually take.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server converters make you upload the whole file first and trust them with it. Here the video never leaves your browser, so there's no upload bar and nothing to hand over.",
    },
    {
      title: "Control quality where it counts",
      description:
        "MP4 conversion exposes a real H.264 quality dial and a preview player, so you can keep it crisp or shrink it deliberately, and confirm the result before downloading.",
    },
    {
      title: "Broadly-compatible results",
      description:
        "MP4 comes out H.264/AAC with faststart and WebM as VP9/Opus: mainstream, well-supported codecs that play across phones, browsers and editors instead of a niche format you'll fight.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM, MKV, AVI or other common video onto the workspace, or click to browse. It's read locally and you'll see its size, duration and dimensions right away.",
    },
    {
      title: "Pick the target format",
      description:
        "Choose MP4, WebM, MOV, AVI, MKV or GIF from the picker. If you're converting to MP4, set the quality dial. The first run loads the FFmpeg engine once, a one-time moment.",
    },
    {
      title: "Convert",
      description:
        "Press Convert. A determinate progress bar tracks the transcode locally, quick for short clips, longer for large ones since this is WebAssembly, not native code.",
    },
    {
      title: "Preview & download",
      description:
        "Play the converted result to confirm it looks and sounds right, then download the new file, or reset and try a different format or quality.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI", "M4V", "GIF"],
    output: ["MP4", "WebM", "MOV", "AVI", "MKV", "GIF"],
  },

  useCases: [
    {
      audience: "Video editor",
      title: "Get a phone .MOV into your timeline",
      description:
        "An iPhone .MOV or a camera .MKV can choke a Windows or older editor. Convert it to a clean H.264 MP4 first so it imports, scrubs and renders without fighting the codec.",
    },
    {
      audience: "Web developer",
      title: "Produce a WebM for the browser",
      description:
        "Background loops and inline clips are lighter and more compatible as WebM. Convert an MP4 source to VP9/Opus WebM to serve modern browsers efficiently without a build step.",
    },
    {
      audience: "Designer / Marketer",
      title: "Turn a clip into a shareable GIF",
      description:
        "Need a soundless loop for a doc, chat or README? Convert a short clip to a palette-optimized GIF that plays everywhere, right in the browser and without a watermark.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Re-format sensitive footage locally",
      description:
        "Personal, medical or confidential recordings shouldn't be uploaded to a stranger's converter. Change the format entirely in your browser so nothing ever leaves the device.",
    },
  ],

  troubleshooting: [
    {
      problem: "The conversion is taking a long time.",
      solution:
        "That's expected for large or long clips. This is FFmpeg compiled to WebAssembly, which is slower than a native app and memory-bound. Keep the tab focused and watch the progress bar. For very large files, trim or downscale the source first, and remember GIF output is the heaviest.",
    },
    {
      problem: "The tab ran out of memory or the convert failed on a big file.",
      solution:
        "WASM has a memory ceiling. Close other heavy tabs and try again. If it still fails the file is likely too large for in-browser transcoding, shorten it or use a lower-resolution source. As a loose guide, keep inputs under a few hundred MB.",
    },
    {
      problem: "My GIF came out huge or choppy.",
      solution:
        "GIF is an old, uncompressed-ish format that balloons with length, size and frame rate. Convert a short clip (a few seconds) rather than a full video. For anything longer, MP4 or WebM will be far smaller and smoother.",
    },
    {
      problem: "The converted file won't open in my player.",
      solution:
        "Some players are picky about containers. MP4 (H.264/AAC) is the safest, most universal choice, convert to that if a WebM, MKV or MOV won't open, and it should play virtually everywhere.",
    },
  ],

  tips: [
    "When in doubt, convert to MP4. H.264/AAC with faststart is the most widely-playable output across phones, browsers and editors.",
    "Only GIF and MP4 balloon or shrink dramatically with settings. For MP4, use the quality dial to trade a little detail for a much smaller file.",
    "The FFmpeg engine loads once per session on your first convert. After that, subsequent conversions skip straight to transcoding.",
    "Keep GIF conversions to a few seconds. The format has no real inter-frame compression, so length and resolution blow the size up fast.",
    "Always play the preview before downloading, it's the quickest way to catch audio that dropped or a format your target app still won't accept.",
  ],

  security:
    "Your video is read and transcoded entirely in your browser using a self-hosted FFmpeg (WebAssembly) engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert personal, confidential or unreleased footage. There's no upload step and no cloud copy. Close the tab and every byte is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. All decoding and re-encoding happen locally in your browser using a self-hosted FFmpeg build compiled to WebAssembly. Your file never leaves your device: there's no upload step, nothing is stored or logged, and it's safe for personal or confidential footage.",
    },
    {
      question: "Which formats can I convert between?",
      answer:
        "You can drop common inputs (MP4, MOV, WebM, MKV, AVI, M4V and more) and convert to MP4, WebM, MOV, AVI, MKV or GIF. MP4 uses H.264/AAC with faststart, WebM uses VP9/Opus, and GIF is palette-optimized. MP4 is the most universally-playable target if you're unsure.",
    },
    {
      question: "Why is conversion slower than a desktop app, and are there size limits?",
      answer:
        "Because this runs FFmpeg in WebAssembly inside your browser rather than as native code, and it's single-threaded and memory-bound. A short clip converts in seconds. A large one takes real time behind a determinate progress bar. As a loose guide, keep inputs under a few hundred MB. Very large files can exhaust the tab's memory, in which case trim or downscale the source first. The upside is total privacy: nothing is uploaded.",
    },
    {
      question: "Can I control the quality?",
      answer:
        "When you convert to MP4 there's a plain-English quality dial mapped to the H.264 CRF, so you can keep it near-lossless or trade detail for a smaller file. Other targets (WebM, MOV, MKV, AVI, GIF) use each format's proven codec defaults. The preview player lets you confirm the result either way before downloading.",
    },
    {
      question: "Does converting reduce quality?",
      answer:
        "Any re-encode is lossy to some degree, but at the default and higher settings the difference is usually hard to notice. For MP4, keep the quality dial high to preserve detail. GIF is the exception: it's a limited format, so expect visible banding and a bigger file on anything but short clips.",
    },
    {
      question: "Why did my GIF come out so large?",
      answer:
        "GIF has no real inter-frame compression, so size scales with duration, resolution and frame rate and grows fast. Convert only short clips to GIF. For longer or higher-quality loops, MP4 or WebM will be dramatically smaller and smoother while still playing everywhere.",
    },
    {
      question: "Does it work offline or on my phone?",
      answer:
        "Once the page and the FFmpeg engine have loaded, the conversion itself needs no network. It runs on modern mobile browsers too, though phones have less memory and are slower, so stick to shorter clips on mobile for the best experience.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's no install, no plugin, no sign-up and no watermark. Open the page, drop a video, pick a format, convert, and download, the FFmpeg engine loads automatically in the background the first time you run it.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release: in-browser transcoding via self-hosted FFmpeg (WebAssembly) with a target-format picker (MP4, WebM, MOV, AVI, MKV, GIF), correct codec pipeline per container, a preview player and one-click download.",
    },
    {
      date: "2026-06-21",
      change:
        "Added a real H.264 quality dial for MP4 output mapped to CRF, faststart on MP4/MOV for instant web playback, and a clearer one-time engine-loading state with a determinate progress bar.",
    },
    {
      date: "2026-06-29",
      change:
        "Improved GIF guidance and memory handling for large files, refined per-format defaults for cleaner output, and added drag-and-drop plus reset-and-retry to the workspace.",
    },
  ],

  relatedTools: [
    "video-compressor",
    "video-to-gif",
    "video-trimmer",
    "video-resizer",
  ],
};

export default videoConverter;
