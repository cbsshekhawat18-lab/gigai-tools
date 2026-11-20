import type { Tool } from "@/types";

/**
 * Video to GIF: the flagship of the GigAI Video Toolkit. It transcodes a
 * dropped clip (or a trimmed range of it) into an animated GIF entirely in the
 * browser via FFmpeg compiled to WebAssembly, using a two-pass palette
 * (palettegen + paletteuse) for far cleaner color than a naive conversion.
 * Every string below is written for the exact queries people type when they
 * want a screen-recording, a product demo or a reaction clip turned into a
 * loopable GIF: nothing is shared with the other video/image copy, and no
 * claim outruns what the client-side WASM engine actually does. It is honest
 * about being slower and more memory-bound than a native encoder, and about the
 * fact that GIF is a large, 256-color format.
 */
const videoToGif: Tool = {
  slug: "video-to-gif",
  title: "Video to GIF",
  description:
    "Turn a video into a high-quality animated GIF right in your browser. Pick a start, duration, frame rate and width, get a two-pass palette for clean color, then preview and download. Nothing is uploaded.",
  category: "video-tools",
  group: "Convert",
  icon: "Film",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Video to GIF: Convert MP4, WebM & MOV to Animated GIF Online",
  tagline:
    "Drop an MP4, WebM, MOV or WebM clip, choose a start point and length, dial in frame rate and width, and get a clean, loopable animated GIF. A two-pass color palette keeps gradients and skin tones honest, and the whole conversion happens on your device, never uploaded.",
  longDescription:
    "GigAI Video to GIF converts short video clips into animated GIFs without a single upload. It runs FFmpeg compiled to WebAssembly directly in your browser: you drop an MP4, WebM, MOV or MKV, scrub to the moment you want, set a start time and duration, and pick a frame rate and output width, then the tool encodes a GIF using a proper two-pass palette (palettegen then paletteuse) so colors stay clean instead of the muddy, dithered mess a single-pass conversion produces. Because everything is local, a confidential product demo, an unreleased UI recording or a private reaction clip never leaves your machine. There is no server to store, log or leak it. The controls map exactly to the three levers that decide a GIF's size and smoothness: frame rate (higher is smoother but heavier), width (GIFs scale down beautifully and shrink fast), and clip length (GIF has no real compression across frames, so seconds cost megabytes). The tool is honest about the trade-offs the format forces on you: GIF is capped at 256 colors per frame and stores frames largely uncompressed, so a long or full-HD clip can balloon, for anything more than a few seconds you will usually want a smaller width and a modest frame rate. WebAssembly transcoding is also slower and more memory-bound than a native encoder, so the tool shows a live progress bar, warns before it chews through a very large file, and recommends keeping clips short. When you just want a shareable loop for a chat, a doc, a README, an email or a Slack thread, drop the clip, trim it, and download the GIF, all in the browser.",

  ctaText: "Convert to GIF",

  keywords: [
    "video to gif",
    "mp4 to gif",
    "convert video to gif",
    "webm to gif",
    "mov to gif",
    "video to gif converter",
    "make a gif from video",
    "animated gif from video",
    "gif maker online",
    "free video to gif",
    "clip to gif",
  ],

  seo: {
    title: "Video to GIF Converter, MP4/WebM/MOV to Animated GIF | GigAI Tools",
    description:
      "Free online video-to-GIF converter. Turn MP4, WebM or MOV clips into clean, loopable animated GIFs with two-pass palette color, adjustable fps, width, start and duration, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Palette",
      title: "Two-pass palette for clean color",
      description:
        "Instead of a muddy single-pass conversion, the encoder builds an optimized 256-color palette from your clip (palettegen) and then maps every frame to it (paletteuse), so gradients, skin tones and UI screenshots stay faithful.",
    },
    {
      icon: "Scissors",
      title: "Trim to the exact moment",
      description:
        "Set a start time and a duration, or drag the range on the timeline, so only the seconds you care about become a GIF, which is also the single biggest thing you can do to keep the file small.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Frame rate & width controls",
      description:
        "Tune fps for smoothness versus size and set an output width. Height scales automatically to preserve the aspect ratio. These are the two dials that decide how heavy the GIF lands.",
    },
    {
      icon: "Eye",
      title: "Preview before you download",
      description:
        "The finished GIF renders right in the tool with its exact file size, so you can confirm the loop looks right and lands at a shareable weight before you save or send it.",
    },
    {
      icon: "Repeat",
      title: "Clean, gapless loops",
      description:
        "Output loops infinitely by default: ideal for a README, a chat reaction, a Slack thread or an email where an autoplaying video isn't an option but a GIF just works.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "FFmpeg runs as WebAssembly on your device. Your clip is never uploaded, stored or logged: safe for unreleased product demos, internal UI recordings and private moments.",
    },
  ],

  benefits: [
    {
      title: "Share clips where video won't autoplay",
      description:
        "GitHub READMEs, docs, email, and many chat apps won't autoplay an MP4 but will happily loop a GIF. Convert once and your demo plays everywhere, instantly, with no player controls.",
    },
    {
      title: "Keep confidential footage private",
      description:
        "Unlike upload-based GIF makers, nothing leaves your device. An unreleased feature recording or an internal walkthrough is transcoded locally, so there is no third-party server that ever sees it.",
    },
    {
      title: "Control the size before you send",
      description:
        "Because you set width, fps and length yourself and see the final byte count, you can hit a target size deliberately. No re-uploading and re-exporting to squeeze under a chat or wiki limit.",
    },
    {
      title: "No install, no watermark, no sign-up",
      description:
        "Get palette-quality GIFs without desktop software, a login or a stamped-on logo: just a browser tab you can close when you're done.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, WebM, MOV or MKV onto the workspace, or click to browse. The clip is probed locally for its duration and dimensions. Nothing is uploaded.",
    },
    {
      title: "Choose the range",
      description:
        "Set a start time and a duration (or trim on the timeline) so only the seconds you want become a GIF. Shorter clips make dramatically smaller files.",
    },
    {
      title: "Set frame rate & width",
      description:
        "Pick an fps for smoothness versus size and an output width. Height scales automatically. Start around 12–15 fps and 480px, then adjust.",
    },
    {
      title: "Convert & preview",
      description:
        "Click Convert to GIF. FFmpeg loads once (a one-time download), a progress bar tracks the encode, and the finished GIF appears with its exact file size.",
    },
    {
      title: "Download or restart",
      description:
        "Save the GIF, or reset and tweak the width, fps or length to trade quality against size until it lands where you want it.",
    },
  ],

  formats: {
    input: ["MP4", "WebM", "MOV", "MKV"],
    output: ["GIF"],
  },

  useCases: [
    {
      audience: "Developer / OSS maintainer",
      title: "A looping demo for a README",
      description:
        "Turn a short screen recording of your CLI or app into a GIF that GitHub renders inline, so contributors see the feature move without leaving the repo, encoded locally so a pre-release build stays private.",
    },
    {
      audience: "Product / UX designer",
      title: "Show an interaction in a doc",
      description:
        "Convert a 3-second capture of a hover, transition or micro-interaction into a GIF you can drop into Notion, Figma comments or a spec, where an autoplaying loop reads instantly.",
    },
    {
      audience: "Support / Community",
      title: "Reproduce a bug visually",
      description:
        "Trim the exact moment a glitch happens and paste the GIF into a ticket, Slack thread or forum reply: clearer than words and lighter to load than an attached video.",
    },
    {
      audience: "Marketer / Social",
      title: "A reaction or teaser loop",
      description:
        "Clip a few punchy seconds from a longer video into a small, wide-compatible GIF for a chat, an email campaign or a social reply where GIFs outperform embedded video.",
    },
  ],

  troubleshooting: [
    {
      problem: "The GIF file is huge, tens of megabytes.",
      solution:
        "GIF stores frames with almost no cross-frame compression and is capped at 256 colors, so length and size add up fast. Cut the duration, lower the width (try 320–480px), and drop the frame rate (10–12 fps is plenty for most demos). Any one of those shrinks the file a lot.",
    },
    {
      problem: "It's taking a long time or the tab feels heavy.",
      solution:
        "WebAssembly FFmpeg is slower and more memory-bound than a native encoder, and long or high-resolution clips are the worst case. Keep clips to a few seconds, use a smaller width, and close other heavy tabs. Very large source files may exhaust the tab's memory. Trim first.",
    },
    {
      problem: "Colors look banded or slightly off.",
      solution:
        "GIF only allows 256 colors per frame, so smooth gradients and video with lots of subtle tones will band no matter what. The tool already uses a two-pass palette to make this as good as it can be. Reducing the width can sometimes help the palette concentrate on the important colors.",
    },
    {
      problem: "Nothing happens on the first click / there's a pause before progress.",
      solution:
        "The first conversion downloads the FFmpeg WebAssembly core (~31 MB) once, then caches it. Give it a moment on the first run. Subsequent conversions in the same session start immediately.",
    },
  ],

  tips: [
    "Trim aggressively first. Clip length is the biggest driver of GIF size, far more than fps or width.",
    "Start at 480px wide and 12–15 fps. GIFs scale down beautifully, so a smaller width is usually free quality-for-size.",
    "For screen recordings and UI, 10–12 fps often looks fine and cuts the size roughly in half versus 24 fps.",
    "If you need a small, shareable file for chat or a README, target width and length before touching fps.",
    "Convert on a machine with a bit of RAM headroom for longer clips. WASM transcoding is memory-bound.",
  ],

  security:
    "Your video is decoded and transcoded entirely in your browser using FFmpeg compiled to WebAssembly. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert unreleased product demos, internal recordings and private clips. The FFmpeg core is fetched once from this site (same-origin) and cached. Your media stays on your device. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The entire conversion runs locally in your browser using FFmpeg compiled to WebAssembly. Your clip never leaves your device, so there is nothing for us to store, log or see. It is safe to convert confidential recordings and unreleased demos.",
    },
    {
      question: "Why is the GIF so much bigger than my video?",
      answer:
        "GIF is an old format: it caps each frame at 256 colors and stores frames with almost no compression between them, so it is far less efficient than modern video codecs. A clip that is a few hundred KB as MP4 can be many megabytes as a GIF. The way to control this is to trim the length, reduce the width, and lower the frame rate, the tool exposes all three.",
    },
    {
      question: "How is this different from a naive online GIF maker?",
      answer:
        "It uses a two-pass palette (palettegen + paletteuse): FFmpeg first analyzes your clip to build an optimized 256-color palette, then maps every frame to it. That produces markedly cleaner color and less dithering than the single-pass conversion most quick converters use, and it does it without uploading your file.",
    },
    {
      question: "Is there a file-size or length limit?",
      answer:
        "There's no hard cap, but be realistic: WebAssembly FFmpeg is slower and more memory-bound than a native encoder, and GIF gets heavy fast. Very large source files can exhaust the browser tab's memory. As a loose guide keep source files under a few hundred MB and clips to a handful of seconds. Trim before converting and the tool stays responsive.",
    },
    {
      question: "Why is the first conversion slow to start?",
      answer:
        "The first time you convert, the browser downloads the FFmpeg WebAssembly core (about 31 MB) and caches it. That happens once per session before encoding begins. After that, conversions start immediately. A progress bar shows both the one-time engine load and the encode.",
    },
    {
      question: "What input formats can I convert?",
      answer:
        "Common web and camera formats work, MP4 (H.264), WebM, MOV and MKV among them. If a codec inside the container is unusual the encode may fail. Converting the source to MP4 first, or picking a different clip, usually resolves it.",
    },
    {
      question: "Does the GIF loop?",
      answer:
        "Yes. Output loops infinitely by default, which is exactly what you want for a README, a chat reaction or an email: the animation plays on its own with no controls and no autoplay restrictions to fight.",
    },
    {
      question: "What frame rate and width should I pick?",
      answer:
        "For most demos and screen recordings, 12–15 fps and a width around 480px is a sweet spot: smooth enough to read, small enough to share. Raise fps for fast motion, lower the width to shrink the file. Height always scales automatically to keep the aspect ratio.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, browser-side video-to-GIF via WebAssembly FFmpeg with a two-pass palette, adjustable start, duration, frame rate and width, live progress, in-tool preview and download. Nothing is uploaded.",
    },
    {
      date: "2026-06-24",
      change:
        "Added a timeline range selector for trimming, clearer size/length guidance, and a one-time engine-load note so the first conversion's pause is expected.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved memory handling for longer clips and sharpened the honest warnings around GIF size and WASM speed on large source files.",
    },
  ],

  relatedTools: [
    "gif-to-video",
    "video-compressor",
    "video-trimmer",
    "video-converter",
    "extract-video-frames",
  ],
};

export default videoToGif;
