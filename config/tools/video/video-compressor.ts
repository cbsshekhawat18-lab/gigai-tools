import type { Tool } from "@/types";

/**
 * Video Compressor, the flagship of the GigAI Video Toolkit and the showcase
 * for the in-browser FFmpeg (WebAssembly) engine. Drop a clip, choose a quality
 * target (an intuitive slider that maps to an H.264 CRF, plus an optional
 * target-size hint), and the tool re-encodes it entirely on your device, then
 * reports the exact before/after bytes and the percentage saved beside a live
 * preview. Every string below is written for the specific queries people type
 * when a phone recording, screen capture or export is "too big to email / too
 * big for Discord / too big to upload". Nothing is shared with the image or
 * SVG copy, and no claim outruns what single-threaded ffmpeg.wasm actually does
 * (it is honest about being slower than native and memory-bound).
 */
const videoCompressor: Tool = {
  slug: "video-compressor",
  title: "Video Compressor",
  notFor: [
    { text: "It does not change the frame size - 1080p stays 1080p.", toolSlug: "video-resizer" },
    { text: "It does not cut the clip shorter.", toolSlug: "video-trimmer" },
  ],
  description:
    "Compress video in your browser with FFmpeg, shrink MP4, MOV, WebM and MKV files with a simple quality slider, see the exact bytes and percentage saved next to a live preview, then download. Nothing is uploaded.",
  category: "video-tools",
  group: "Optimize",
  icon: "Minimize2",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-11",

  h1: "Video Compressor: Shrink MP4 & MOV Online with FFmpeg",
  tagline:
    "Drop a video that's too big to email, upload or share and watch it shrink. Real FFmpeg H.264 compression with a plain-English quality slider, an exact before/after size meter and a side-by-side preview so you can confirm it still looks great: all in your browser, never uploaded.",
  longDescription:
    "The GigAI Video Compressor runs a full FFmpeg build compiled to WebAssembly directly inside your browser tab, so it can re-encode a video and cut its file size without ever sending your footage to a server. Phone recordings, screen captures, drone clips and platform exports are almost always heavier than they need to be (bitrates are set for capture, not for sharing) which is why a 90-second clip can refuse to attach to an email or blow past a chat app's upload limit. Drop your file, drag one quality slider (it maps to a proven H.264 CRF, from near-lossless to aggressively small), and optionally punch in a rough target size to guide your choice. The tool transcodes to a broadly-compatible H.264/AAC MP4 with faststart enabled for instant web playback. When it finishes you get the original size, the compressed size, the exact percentage saved and a preview player, so you can confirm the quality holds before you download. Because everything is client-side there is no upload wait and no privacy tradeoff, sensitive recordings, unreleased footage and personal videos never leave your machine. Be honest with yourself about the engine: WebAssembly FFmpeg is meaningfully slower than a native app and it's memory-bound, so a short clip is nearly instant while a large one takes real time and a determinate progress bar keeps you informed the whole way. Close the tab and every byte is gone.",

  ctaText: "Compress video",

  keywords: [
    "video compressor",
    "compress video online",
    "reduce video file size",
    "shrink mp4",
    "compress mp4 online",
    "make video smaller",
    "compress video for email",
    "compress video for discord",
    "ffmpeg online",
    "browser video compressor",
    "compress mov",
    "reduce video size without losing quality",
  ],

  seo: {
    title: "Video Compressor: Compress MP4 & MOV Online Free | GigAI Tools",
    description:
      "Free online video compressor powered by FFmpeg. Shrink MP4, MOV, WebM and MKV with a simple quality slider, see the exact size saved next to a live preview, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Cpu",
      title: "Real FFmpeg, in your browser",
      description:
        "A full FFmpeg build compiled to WebAssembly re-encodes your clip with H.264 (libx264) and AAC, the same codec pipeline desktop tools use, with no upload, no account and no install.",
    },
    {
      icon: "SlidersHorizontal",
      title: "One plain-English quality slider",
      description:
        "Skip the CRF/bitrate jargon. Drag from 'smallest file' to 'best quality' and the tool picks the right H.264 CRF for you. The exact value is shown for anyone who wants it.",
    },
    {
      icon: "Target",
      title: "Target-size hint",
      description:
        "Type a rough size you need to hit (for an email cap, a chat upload or an LMS limit) and get a live estimate of where the slider should land so you're not compressing blind.",
    },
    {
      icon: "Gauge",
      title: "Exact before / after meter",
      description:
        "See the original bytes, the compressed bytes and the precise percentage saved the moment it finishes, the real shipping weight, not a vague 'optimized' badge.",
    },
    {
      icon: "PlayCircle",
      title: "Preview before you download",
      description:
        "The compressed result plays right in the page so you can confirm the quality holds and the audio is intact before you commit, the safety net a command line never gives you.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Encoding happens on your device with a self-hosted engine. Personal recordings, unreleased footage and confidential screen captures are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Get under the upload limit",
      description:
        "Email attachments, chat apps, LMS uploads and forums all cap file size. A single pass here routinely halves a clip (often much more) so the file finally attaches or uploads.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server compressors make you upload the big file first and trust them with it. Here the video never leaves your browser, so there's no upload bar and nothing to trust.",
    },
    {
      title: "See it still looks good, first",
      description:
        "The side-by-side size meter and the preview player let you confirm the quality survived at your chosen setting before you download. No re-doing a bad export.",
    },
    {
      title: "Universally playable output",
      description:
        "Output is H.264/AAC MP4 with faststart, which plays on virtually every phone, browser and editor and streams instantly on the web. Not a niche codec you'll fight later.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM, MKV or other common video onto the workspace, or click to browse. It's read locally and you'll see its size, duration and dimensions immediately.",
    },
    {
      title: "Set the quality",
      description:
        "Drag the quality slider toward 'smaller file' or 'best quality'. Optionally enter a target size to see where to aim. The first run loads the FFmpeg engine once (a one-time moment).",
    },
    {
      title: "Compress",
      description:
        "Press Compress. A determinate progress bar tracks the encode locally, quick for short clips, longer for large ones since this is WebAssembly, not native.",
    },
    {
      title: "Check the result & download",
      description:
        "Read the original vs compressed size and the exact percentage saved, play the preview to confirm quality, then download the MP4, or start over with a new setting.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI", "M4V"],
    output: ["MP4"],
  },

  useCases: [
    {
      audience: "Anyone sharing a clip",
      title: "Fit a video into an email or chat",
      description:
        "A 25 MB phone clip won't attach to a 20 MB email cap, and Discord or WhatsApp bounce big uploads. Compress it down until it fits, then send it without a cloud link.",
    },
    {
      audience: "Creator / Marketer",
      title: "Lighten a video before upload",
      description:
        "Trim the bitrate on a screen recording or promo before it goes to a site, an ad platform or a course, smaller uploads finish faster and pages load quicker.",
    },
    {
      audience: "Developer / QA",
      title: "Shrink a screen-capture for a bug report",
      description:
        "Screen recordings of a repro are huge. Compress the capture so it drops cleanly into a GitHub issue, a Jira ticket or Slack under the attachment limit.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Compress sensitive footage locally",
      description:
        "Personal, medical or confidential recordings shouldn't be uploaded to a stranger's server to be shrunk. Do it entirely in your browser so nothing ever leaves the device.",
    },
  ],

  troubleshooting: [
    {
      problem: "It's taking a long time on my video.",
      solution:
        "That's expected for large or long clips. This is FFmpeg compiled to WebAssembly, which is slower than a native app and memory-bound. Keep the tab focused, watch the progress bar, and for very large files try a lower-quality (smaller) setting or trim/split the clip first.",
    },
    {
      problem: "The tab ran out of memory or the encode failed on a big file.",
      solution:
        "WASM has a memory ceiling. Close other heavy tabs, try again, and if it still fails the file is likely too large for in-browser encoding, reduce its length first or use a smaller-resolution source. As a loose guide, keep inputs under a few hundred MB.",
    },
    {
      problem: "The output barely got smaller.",
      solution:
        "Your source may already be efficiently encoded, or you chose a high-quality setting. Drag the slider toward 'smaller file' and re-run. If it's still close, the video is near its practical floor at watchable quality.",
    },
    {
      problem: "The compressed video looks softer than the original.",
      solution:
        "Some quality loss is the whole point of compression, you're trading detail for size. Nudge the slider back toward 'best quality' and re-run until the preview looks right. Find the balance where it's small enough but still clean.",
    },
  ],

  tips: [
    "Start in the middle of the slider (it targets a visually-clean CRF) then only push toward 'smaller' if you still need to fit a limit.",
    "Use the target-size hint to aim: enter your email or upload cap and let it guide where the slider lands so you don't over- or under-compress.",
    "The FFmpeg engine loads once per session on your first compress. After that, subsequent runs skip straight to encoding.",
    "For a clip that's mostly too long rather than too heavy, trimming or splitting it first often beats compressing the whole thing hard.",
    "Always play the preview before downloading, it's the fastest way to catch a setting that went too aggressive on motion or text.",
  ],

  security:
    "Your video is read and re-encoded entirely in your browser using a self-hosted FFmpeg (WebAssembly) engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely compress personal, confidential or unreleased footage. There's no upload step and no cloud copy. Close the tab and every byte is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. All decoding and re-encoding happen locally in your browser using a self-hosted FFmpeg build compiled to WebAssembly. Your file never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for personal or confidential footage.",
    },
    {
      question: "Why is compression slower than a desktop app, and are there size limits?",
      answer:
        "Because this runs FFmpeg in WebAssembly inside your browser rather than as native code, and it's single-threaded and memory-bound. A short clip encodes in seconds. A large one takes real time, and a determinate progress bar keeps you posted. As a loose guide, keep inputs under a few hundred MB. Very large files can exhaust the tab's memory, in which case trim or downscale the source first. The upside is total privacy: nothing is uploaded.",
    },
    {
      question: "How much smaller will my video get?",
      answer:
        "It depends heavily on the source and your quality setting, but clips straight off a phone, screen recorder or camera commonly shrink by half or more because their capture bitrate is higher than sharing needs. The before/after meter shows the exact bytes and percentage saved for your file, so you never have to guess.",
    },
    {
      question: "Will compressing reduce the quality?",
      answer:
        "Compression trades some visual detail for a smaller file: that's how it works. The quality slider lets you control the tradeoff, and the preview player lets you check the result before downloading. At the middle-to-high settings the difference is usually hard to notice. Push toward 'smaller file' only when you need to hit a strict limit.",
    },
    {
      question: "What formats can I compress, and what do I get back?",
      answer:
        "You can drop common video formats, MP4, MOV, WebM, MKV, AVI, M4V and more. The output is a broadly-compatible H.264/AAC MP4 with faststart enabled, so it plays on virtually every phone, browser and editor and streams instantly online.",
    },
    {
      question: "Can I hit a specific target file size?",
      answer:
        "There's a target-size hint: enter the size you need to fit (say, an email or chat cap) and the tool estimates where the quality slider should land. Because true two-pass bitrate targeting is heavy in the browser, treat it as a smart starting point. Run it, read the exact result, and nudge the slider if you need to.",
    },
    {
      question: "Does it work offline or on my phone?",
      answer:
        "Once the page and the FFmpeg engine have loaded, the compression itself needs no network. It runs on modern mobile browsers too, though phones have less memory and are slower, so stick to shorter clips on mobile for the best experience.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's no install, no plugin, no sign-up and no watermark. Open the page, drop a video, compress, and download, the FFmpeg engine loads automatically in the background the first time you run it.",
    },
  ],

  changelog: [
    {
      date: "2026-06-11",
      change:
        "Initial release: in-browser H.264 compression via self-hosted FFmpeg (WebAssembly), a plain-English quality slider mapped to CRF, exact before/after byte + percentage-saved meter, a preview player, and one-click download of a faststart MP4.",
    },
    {
      date: "2026-06-19",
      change:
        "Added the target-size hint that estimates a starting quality from a size you need to hit, plus a clearer one-time engine-loading state and a determinate progress bar during the encode.",
    },
    {
      date: "2026-06-27",
      change:
        "Improved memory handling and honest guidance for large files, refined the CRF mapping for cleaner mid-range output, and added drag-and-drop plus reset-and-retry to the workspace.",
    },
  ],

  relatedTools: [
    "video-converter",
    "video-trimmer",
    "video-resizer",
    "video-to-gif",
    "compress-gif",
  ],
};

export default videoCompressor;
