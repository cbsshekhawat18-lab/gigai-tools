import type { Tool } from "@/types";

/**
 * Video Metadata Viewer: the "inspector" of the GigAI Video Toolkit. Drop a
 * clip and instantly read the facts every editor, uploader and QA engineer
 * keeps asking for: exact duration, pixel resolution, simplified aspect ratio,
 * file size and container/MIME type. It reads these straight from a throwaway
 * `<video>` element in the browser (no FFmpeg, no upload, effectively instant),
 * with an optional deep probe that loads the WASM core only if the user asks
 * for codec/bitrate/frame-rate. Every string is written for the real queries
 * people type; "what resolution is my video", "how long is this clip", "what
 * codec is inside", and nothing is shared with the compressor, converter or
 * GIF copy. It never claims to expose what the HTMLMediaElement API can't.
 */
const videoMetadata: Tool = {
  slug: "video-metadata",
  title: "Video Metadata Viewer",
  description:
    "Inspect any video in your browser, see exact duration, resolution, aspect ratio, file size and format the instant you drop it, with an optional deep probe for codec, bitrate and frame rate. Nothing is uploaded.",
  category: "video-tools",
  group: "Info",
  icon: "Info",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",

  h1: "Video Metadata Viewer: See Duration, Resolution & Format Online",
  tagline:
    "Drop a video and read its facts in a blink, exact duration, pixel resolution, simplified aspect ratio, file size and container type, pulled straight from your browser with no upload and no wait. Need codec, bitrate or frame rate? Opt into a deep probe and only then does the FFmpeg engine load.",
  longDescription:
    "The GigAI Video Metadata Viewer answers the questions you ask a file before you do anything with it: how long is it, how big is the frame, what's the aspect ratio, how many bytes, and what container is it in. It reads all of that instantly by loading your clip into a throwaway HTML5 `<video>` element and reading its intrinsic properties, the same trick a browser uses to size a player, so there's no FFmpeg download, no upload and no spinner for the basics. That makes it perfect for the split-second checks that come up constantly: confirming a client export is really 1920×1080 and not a stretched 1280×720, verifying a clip is under a platform's duration cap, or checking whether that MOV is actually 16:9 before you drop it on a timeline. Because the HTMLMediaElement API deliberately doesn't expose codec, bitrate or frame rate, those live behind an optional deep probe: one click that loads the single-threaded FFmpeg (WebAssembly) core once and parses its stream banner for the video/audio codec, overall bitrate and fps. We're honest about that tradeoff: basics are free and instant. The deep probe pulls the ~31 MB engine and is best-effort, since ffmpeg.wasm reports what it can parse from the container. Everything happens on your device, sensitive footage, unreleased cuts and personal recordings are never uploaded, stored or logged. Copy the full report as text or JSON for a bug ticket, a spec sheet or an automation, then close the tab and nothing remains.",

  ctaText: "Inspect video",

  keywords: [
    "video metadata viewer",
    "check video resolution",
    "video duration checker",
    "video aspect ratio checker",
    "what codec is my video",
    "video file info online",
    "inspect video online",
    "video properties viewer",
    "mp4 metadata viewer",
    "check video bitrate",
    "video frame rate checker",
    "browser video inspector",
  ],

  seo: {
    title: "Video Metadata Viewer. Check Resolution, Duration & Codec | GigAI Tools",
    description:
      "Free online video inspector. Drop a clip to see exact duration, resolution, aspect ratio, file size and format instantly: with an optional deep probe for codec, bitrate and fps. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Zap",
      title: "Instant, FFmpeg-free basics",
      description:
        "Duration, resolution, aspect ratio, size and MIME type are read from a native `<video>` element the moment you drop a file. No engine download, no upload, effectively zero wait.",
    },
    {
      icon: "Ratio",
      title: "Simplified aspect ratio",
      description:
        "See the frame as a clean '16:9' or '9:16' label, not just raw pixels, so you instantly know if a clip is landscape, portrait, square or an odd crop before it hits your timeline.",
    },
    {
      icon: "Search",
      title: "Optional deep probe",
      description:
        "Need codec, bitrate or frame rate? One click loads the FFmpeg (WebAssembly) core once and parses the stream banner for video/audio codec, overall bitrate and fps: kept opt-in so basics stay instant.",
    },
    {
      icon: "AudioLines",
      title: "Audio-track detection",
      description:
        "A best-effort check tells you whether the clip carries an audio track at all, handy for spotting silent screen recordings or muted exports before you wonder where the sound went.",
    },
    {
      icon: "Copy",
      title: "Copy as text or JSON",
      description:
        "Copy the whole report as a tidy human-readable block for a ticket or spec, or as structured JSON to drop straight into a script, a QA log or a spreadsheet.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Every byte is read on your device. Unreleased footage, personal recordings and confidential captures are never uploaded, stored or logged, the report exists only in your tab.",
    },
  ],

  benefits: [
    {
      title: "Answer the pre-flight questions fast",
      description:
        "Before you edit, upload or convert, you need to know a clip's duration, size and dimensions. Get all of it in the instant it loads instead of opening a heavy desktop app.",
    },
    {
      title: "No upload, no privacy tradeoff",
      description:
        "Server-side inspectors make you upload the whole file just to read its properties. Here the video never leaves your browser, so there's no upload bar and nothing to trust.",
    },
    {
      title: "Only pay for the engine when you need it",
      description:
        "The basics never touch FFmpeg. The ~31 MB WASM core loads solely if you opt into the deep codec/bitrate/fps probe, so the common case stays fast.",
    },
    {
      title: "Report-ready output",
      description:
        "Copy the findings as clean text or JSON to paste into a bug report, a delivery spec, a content calendar or an automated pipeline. No retyping numbers by hand.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM, MKV or other common clip onto the workspace, or click to browse. It's read locally. Nothing is uploaded.",
    },
    {
      title: "Read the instant report",
      description:
        "Duration, resolution, aspect ratio, file size, container/MIME type and best-effort audio detection appear immediately, straight from the browser.",
    },
    {
      title: "Run the deep probe (optional)",
      description:
        "Want codec, bitrate or frame rate? Click 'Deep probe', the FFmpeg engine loads once and parses the container for the extra fields.",
    },
    {
      title: "Copy or export",
      description:
        "Copy the full report as text or JSON for a ticket, spec or script, then drop in another clip to inspect the next one.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI", "M4V", "OGV"],
    output: ["Text report", "JSON"],
  },

  useCases: [
    {
      audience: "Editor / Post-production",
      title: "Verify a delivery before the timeline",
      description:
        "Confirm a client hand-off is genuinely 1920×1080 at 16:9 and the right length before you cut it in, catch a stretched or wrong-ratio export the moment it lands.",
    },
    {
      audience: "Creator / Uploader",
      title: "Check it fits the platform spec",
      description:
        "Reels want 9:16, a banner wants 16:9, an ad has a duration cap. Read the aspect ratio and duration up front so an upload doesn't get rejected or auto-cropped.",
    },
    {
      audience: "Developer / QA",
      title: "Attach exact specs to a bug report",
      description:
        "Grab the resolution, codec, bitrate and duration of a repro clip and paste them as JSON straight into a GitHub issue or Jira ticket. No guessing, no screenshots of a properties dialog.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Inspect sensitive footage locally",
      description:
        "Personal, medical or confidential recordings shouldn't be uploaded to a stranger's server just to read their properties. Inspect them entirely in your browser instead.",
    },
  ],

  troubleshooting: [
    {
      problem: "Codec, bitrate and fps show as blank.",
      solution:
        "Those fields aren't part of the instant read: the browser's HTMLMediaElement API doesn't expose them. Click 'Deep probe' to load the FFmpeg engine once and parse them from the container. If they're still blank, ffmpeg couldn't reliably read them from that particular file.",
    },
    {
      problem: "The deep probe is taking a moment.",
      solution:
        "The first deep probe loads the ~31 MB FFmpeg (WebAssembly) core, which is a one-time download per session. After that, probing another clip is fast. The basic fields never wait on this.",
    },
    {
      problem: "'Could not read this video's metadata' appeared.",
      solution:
        "Your browser couldn't decode that file's container to read even the basics: the format may be unsupported by the browser's media engine (some exotic codecs or corrupt headers). Try a more common container like MP4/WebM, or re-export the clip and inspect again.",
    },
    {
      problem: "Audio shows as 'unknown'.",
      solution:
        "Audio-track detection is best-effort and relies on non-standard browser hints that not every browser provides. When it can't tell for certain it says 'unknown' rather than guess: run the deep probe to confirm via the audio codec instead.",
    },
  ],

  tips: [
    "The basics are instant and FFmpeg-free, only click 'Deep probe' when you actually need codec, bitrate or fps, so you never pay the engine download for a quick check.",
    "Use the aspect-ratio label as a fast sanity check: '16:9' is landscape, '9:16' is a phone-shot vertical, '1:1' is square. A mismatch usually means a wrong or stretched export.",
    "Copy as JSON when you're pasting specs into a script, spreadsheet or bug tracker. Copy as text when a human is going to read it.",
    "Inspecting several deliverables? The engine loads once per session, so run the deep probe on the first clip and the rest are quick.",
    "If a screen recording seems silent, check the audio-track line before you re-record: it's often muted at capture, not broken.",
  ],

  security:
    "Your video is read entirely in your browser using a native `<video>` element for the basics and a self-hosted FFmpeg (WebAssembly) engine only if you opt into the deep probe. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely inspect personal, confidential or unreleased footage. The report exists only in your tab. Close it and every byte is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The basic metadata is read locally by loading your clip into a throwaway HTML5 `<video>` element, and the optional deep probe runs a self-hosted FFmpeg build compiled to WebAssembly, also entirely on your device. Your file never leaves your browser, nothing is stored or logged, and it's safe for personal or confidential footage.",
    },
    {
      question: "Why are the basics instant but the deep probe slower, and are there size limits?",
      answer:
        "Duration, resolution, aspect ratio, size and format are read directly from the browser's media engine, which is effectively instantaneous and needs no download. Codec, bitrate and fps aren't exposed by that API, so they require FFmpeg in WebAssembly, the first deep probe loads the ~31 MB core once per session and is single-threaded and memory-bound. Basics work on files of any size the browser can open. For the deep probe, keep inputs to a few hundred MB or the tab's memory can run short.",
    },
    {
      question: "Which fields do I get instantly, and which need the deep probe?",
      answer:
        "Instant (no FFmpeg): duration, pixel resolution, simplified aspect ratio, file size, container/MIME type and a best-effort audio-track check. Deep probe (loads FFmpeg): video codec, audio codec, overall bitrate and frame rate, parsed from the container and shown as best-effort.",
    },
    {
      question: "Why can't the browser show me the codec without FFmpeg?",
      answer:
        "The HTMLMediaElement API a browser gives web pages intentionally exposes only playback-oriented properties like duration and pixel dimensions. Not the internal codec, bitrate or frame rate. Reading those means actually parsing the container, which is what the FFmpeg deep probe does. It's an honest limitation of what browsers hand to a web page, not a missing feature.",
    },
    {
      question: "How accurate is the audio-track detection?",
      answer:
        "It's best-effort. Browsers don't offer a single reliable API for it, so the viewer uses non-standard hints (like Firefox's `mozHasAudio` or a WebKit decode counter) where available. When none are present it reports 'unknown' rather than guessing. The deep probe's audio codec is the definitive answer.",
    },
    {
      question: "Can I export the report?",
      answer:
        "Yes. Copy the full report as clean, human-readable text for a ticket or spec, or as structured JSON to drop straight into a script, QA log or spreadsheet. Both cover the instant fields plus any deep-probe fields you've fetched.",
    },
    {
      question: "What video formats can I inspect?",
      answer:
        "For the basics, anything the browser's media engine can open: commonly MP4, MOV, WebM, MKV, M4V, OGV and more. The deep probe uses FFmpeg, which recognizes a wider set of containers and codecs, so it can often read codec details even when the browser can't play the file.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's no install, no plugin, no sign-up and no watermark. Open the page, drop a video and read the report. FFmpeg only loads in the background if you choose the deep probe.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release: instant, FFmpeg-free readout of duration, resolution, aspect ratio, file size and MIME type via a native `<video>` probe, plus best-effort audio-track detection and copy-as-text/JSON.",
    },
    {
      date: "2026-06-23",
      change:
        "Added the optional deep probe: one click loads the self-hosted FFmpeg (WebAssembly) core once to parse video/audio codec, overall bitrate and frame rate from the container.",
    },
    {
      date: "2026-06-29",
      change:
        "Refined the simplified aspect-ratio labelling for odd encodes, clarified 'unknown' audio detection, and polished the copy/export and reset flow with drag-and-drop.",
    },
  ],

  relatedTools: [
    "video-compressor",
    "video-converter",
    "video-trimmer",
    "video-to-gif",
  ],
};

export default videoMetadata;
