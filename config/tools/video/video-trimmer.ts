import type { Tool } from "@/types";

/**
 * Video Trimmer, the flagship of the GigAI video suite. Drop a clip, drag a
 * dual-handle timeline over a live filmstrip to set precise in/out points, and
 * export just the piece you want - decoded and rewritten entirely in the browser
 * by a self-hosted FFmpeg WebAssembly core. Every string below is written for
 * the exact queries people type when they need to cut a video without uploading
 * it to a stranger's server; nothing is shared with the compressor/converter
 * copy, and no claim outruns what the client-side engine actually does.
 */
const videoTrimmer: Tool = {
  slug: "video-trimmer",
  title: "Video Trimmer",
  description:
    "Cut and trim video online in your browser, drag a visual timeline to set exact start and end points, preview the selection, and download the clip. No uploads, no account, no watermark.",
  category: "video-tools",
  group: "Edit",
  icon: "Scissors",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-11",

  h1: "Video Trimmer: Cut & Trim Video Online, Free",
  tagline:
    "Drop an MP4, MOV, WebM or MKV, drag two handles across a live filmstrip to frame the exact moment, and export just that segment. Powered by FFmpeg compiled to WebAssembly, it runs 100% in your browser. Your footage is never uploaded, and the download carries no watermark.",
  longDescription:
    "The GigAI Video Trimmer is a proper in-browser cutting room for the one job that shouldn't require an account, an install or an upload: keeping the good part of a clip and dropping the rest. Drop a video and it probes the file locally, renders a scrubbable player and paints a filmstrip of real frames along the timeline so you can see what you're cutting. Two focusable handles set the in and out points down to a tenth of a second (drag them, nudge them with the arrow keys, or type exact timecodes) and the region outside your selection dims so the keep is obvious at a glance. When you export, a self-hosted FFmpeg WebAssembly core cuts the segment and hands it straight back as a download, then shows the trimmed size next to the original so you know exactly what you got. Because everything happens on your own machine, personal recordings, client footage and anything under NDA never leave the tab, there's no upload bar reaching out to the cloud, no queue behind other people's jobs, and no watermark stamped across your result. It's honest about the trade-offs, too: WASM FFmpeg is single-threaded and memory-bound, so it's slower than a desktop app and happiest with files up to roughly a few hundred megabytes. A live progress bar shows exactly where the cut stands the whole way through. Close the tab and every trace is gone.",

  ctaText: "Trim video",

  keywords: [
    "video trimmer",
    "trim video online",
    "cut video online",
    "video cutter",
    "trim mp4 online",
    "cut video free",
    "online video trimmer no watermark",
    "trim video in browser",
    "shorten video online",
    "clip video online",
    "cut mov online",
    "trim video without uploading",
  ],

  seo: {
    title: "Video Trimmer: Cut & Trim Video Online Free (No Watermark) | GigAI Tools",
    description:
      "Free online video trimmer: drag a visual timeline to set exact start/end points, preview and download your clip. MP4, MOV, WebM & MKV, 100% in your browser, no uploads, no watermark.",
  },

  features: [
    {
      icon: "Scissors",
      title: "Frame-accurate dual-handle timeline",
      description:
        "Drag two handles across a filmstrip of real video frames to set your in and out points to a tenth of a second. The area outside the selection dims so the part you're keeping is unmistakable.",
    },
    {
      icon: "Film",
      title: "Live filmstrip & scrubbable preview",
      description:
        "See thumbnails from your actual footage along the track and a full player above it, so you frame the cut on what the video shows. Not on a guess at the timecode.",
    },
    {
      icon: "Keyboard",
      title: "Keyboard-precise nudging",
      description:
        "Focus a handle and nudge it with the arrow keys (a second at a time, or a tenth with Shift) plus Home/End to snap to the edges. Landing on the exact frame doesn't require a steady mouse hand.",
    },
    {
      icon: "Gauge",
      title: "Honest live progress",
      description:
        "A determinate progress bar tracks the cut from start to finish, and a one-time note covers the first-run engine download. No spinner that leaves you wondering whether it hung.",
    },
    {
      icon: "Download",
      title: "Preview, size delta & one-click download",
      description:
        "Play the trimmed result before you save it and see the new file size next to the original, then download the clip. No sign-up, no email, no watermark.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "A self-hosted FFmpeg WebAssembly core does the cutting on your device. Your video is never uploaded, queued or stored, which makes it safe for personal, client and NDA footage alike.",
    },
  ],

  benefits: [
    {
      title: "Keep private footage private",
      description:
        "The usual way to trim a clip online is to hand it to a random server. Here the cut runs on your machine, so recordings of your family, your clients or anything confidential never leave the tab.",
    },
    {
      title: "No watermark, no account, no cap",
      description:
        "Free video cutters love to stamp a logo across your export or gate the download behind a sign-up. This one just gives you the clip, clean, unbranded, and as often as you like.",
    },
    {
      title: "Cut on what you can see",
      description:
        "A live player plus a filmstrip of real frames means you set the in and out points on the moment itself, not on a raw timecode you're squinting to translate.",
    },
    {
      title: "Nothing to install",
      description:
        "No desktop editor, no plugin, no FFmpeg command line to memorise. Open the page in any modern browser and you're cutting in seconds. It even works offline once the engine has loaded.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM or MKV onto the workspace, or click to browse. It's read and probed locally. Nothing is uploaded.",
    },
    {
      title: "Set your start & end",
      description:
        "Drag the two timeline handles across the filmstrip, or focus a handle and nudge it with the arrow keys, to frame the exact segment you want to keep. The rest of the clip dims out.",
    },
    {
      title: "Trim & preview",
      description:
        "Hit Trim and watch the progress bar. When it finishes, the trimmed clip plays back so you can confirm the cut is right before you save.",
    },
    {
      title: "Download",
      description:
        "Download the trimmed video, clean and watermark-free, and check the new size against the original right there on the result card.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI"],
    output: ["MP4", "WebM", "MKV"],
  },

  useCases: [
    {
      audience: "Content creator",
      title: "Grab a highlight clip",
      description:
        "Pull a tight 15-second moment out of a long screen recording or stream VOD for a short, without opening a heavyweight editor or uploading the whole session anywhere.",
    },
    {
      audience: "Marketer",
      title: "Cut an ad to length",
      description:
        "Trim a hero video down to the exact 6- or 15-second window a placement demands, previewing the frame it starts and ends on so the cut lands cleanly.",
    },
    {
      audience: "Teacher / Student",
      title: "Clip the relevant bit",
      description:
        "Keep only the two minutes of a lecture or demo that matter for a lesson or assignment, dropping the dead air on either side before you share it.",
    },
    {
      audience: "Anyone",
      title: "Trim a phone video before sending",
      description:
        "Chop the shaky start and the fumble at the end off a phone clip so it's shorter and lighter to text or email, without the footage ever touching a server.",
    },
  ],

  troubleshooting: [
    {
      problem: "The first trim is taking a while before the progress bar moves.",
      solution:
        "The very first run downloads the FFmpeg WebAssembly engine (a one-time fetch that's then cached). You'll see a 'loading engine' note during that step. Subsequent trims skip it and start cutting immediately.",
    },
    {
      problem: "It slowed to a crawl or ran out of memory on a big file.",
      solution:
        "In-browser FFmpeg is single-threaded and works in your tab's memory, so very large or long high-bitrate clips are demanding. Keep inputs loosely under a few hundred megabytes. On a huge file, trim a rough range first or use a shorter selection.",
    },
    {
      problem: "The cut starts or ends a fraction off where I set it.",
      solution:
        "For accurate boundaries the trimmer re-encodes around your exact in/out points rather than snapping to the nearest keyframe. If you need to fine-tune, focus a handle and nudge it with the arrow keys (Shift for tenth-of-a-second steps) and re-export.",
    },
    {
      problem: "My video won't load or preview.",
      solution:
        "The player relies on codecs your browser can decode. Very unusual or professional/DRM-protected formats may not preview. Try a mainstream container like MP4 or WebM, or convert the file first with the Video Converter.",
    },
  ],

  tips: [
    "Frame the cut in the player first, then fine-tune the handles: the filmstrip shows real frames so you can land on the exact moment.",
    "Focus a handle and use the arrow keys for precision: ← / → move a second, Shift + arrow moves a tenth of a second, Home/End snap to the edges.",
    "Trimming is one of the lightest operations, so it's the fastest way to shrink a video's size: a shorter clip is simply a smaller file.",
    "For the snappiest results, keep inputs under a few hundred megabytes. The first run also downloads the engine once, so give trim #1 a moment.",
    "Need a different container as well? Trim here first, then run the result through the Video Converter: cutting a shorter clip makes the conversion faster too.",
  ],

  security:
    "Your video is read, probed, previewed and trimmed entirely in your browser using a self-hosted FFmpeg WebAssembly core. It is never uploaded to any server, queued, logged or stored. That makes the trimmer safe for personal recordings, client footage and anything under NDA. There's no account and no watermark, and once the engine has loaded the tool keeps working offline. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The trimmer runs a self-hosted build of FFmpeg compiled to WebAssembly, so reading, previewing and cutting all happen on your own device inside the browser tab. Your footage is never uploaded, queued behind other jobs, logged or stored, which is exactly why there's no upload bar reaching out to the cloud and no watermark on the result. It's safe for personal, client and confidential clips.",
    },
    {
      question: "How large a video can I trim in the browser?",
      answer:
        "Because everything runs in your tab's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. As a loose rule, files up to roughly a few hundred megabytes are comfortable on a typical laptop. Very long or high-bitrate 4K clips can strain memory or slow down. If a big file struggles, trim a rough range first or keep the selection short, and the tool shows a live progress bar so you always know where the cut stands.",
    },
    {
      question: "Does the trimmed video have a watermark?",
      answer:
        "Never. The clip you download is your footage cut to your in and out points. No logo, no stamp, no overlay of any kind. There's also no sign-up, no email wall and no usage cap. Because the processing happens on your device, there's no per-file cost to us, so there's nothing to gate.",
    },
    {
      question: "Which video formats can I trim?",
      answer:
        "The mainstream web and mobile containers: MP4, MOV, WebM, MKV and AVI, carrying common codecs like H.264, VP8/VP9 and their usual audio tracks. The output stays in a broadly compatible container. Exotic professional or DRM-protected formats may not preview or trim, for those, convert the file to MP4 or WebM first with the Video Converter and then trim the result.",
    },
    {
      question: "Will trimming reduce my video's quality?",
      answer:
        "Trimming keeps the same footage, just less of it. To make the cut land exactly on the in and out points you set, the trimmer re-encodes the frames around those boundaries, which is technically lossy but visually faithful. You won't see a difference in normal viewing. The upside of that accuracy is that your clip starts and ends precisely where you asked, rather than snapping to the nearest keyframe.",
    },
    {
      question: "Why is the first trim slower than the ones after it?",
      answer:
        "The first time you cut a clip, the tool downloads the FFmpeg WebAssembly engine once and caches it: you'll see a brief 'loading engine' note while that happens. Every trim after that skips the download and starts cutting straight away. It's also why the tool can keep working offline once you've used it in a session.",
    },
    {
      question: "How precise can I set the start and end points?",
      answer:
        "Down to a tenth of a second. You can drag either handle along the filmstrip, or focus a handle and nudge it with the arrow keys (a full second per press, or a tenth of a second while holding Shift) with Home and End snapping to the clip's edges. The live player and the frame thumbnails let you set the boundaries on what you actually see.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's nothing to download, no plugin and no sign-up. Open the page in any modern browser (Chrome, Edge, Firefox or Safari), drop a clip in and cut. The FFmpeg engine is fetched once on first use and cached, after which trimming works on demand: including offline for a tool you've already opened.",
    },
  ],

  changelog: [
    {
      date: "2026-06-11",
      change:
        "Initial release, drag-and-drop input, scrubbable player, dual-handle timeline over a live filmstrip, frame-accurate in/out points, in-browser FFmpeg WebAssembly cutting, live progress, preview, before/after size and watermark-free download.",
    },
    {
      date: "2026-06-19",
      change:
        "Added keyboard-precise handle nudging (arrow keys, Shift for tenth-of-a-second steps, Home/End) and a clearer one-time engine-loading note on the first trim.",
    },
    {
      date: "2026-06-27",
      change:
        "Improved probing for MOV/MKV sources and tightened the large-file guidance so heavy clips warn before they start rather than mid-cut.",
    },
  ],

  relatedTools: [
    "video-compressor",
    "video-converter",
    "video-to-gif",
    "extract-audio",
    "mp4-to-webm",
  ],
};

export default videoTrimmer;
