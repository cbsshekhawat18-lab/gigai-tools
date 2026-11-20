import type { Tool } from "@/types";

/**
 * Video Thumbnail Generator, the "Extract" flagship of the GigAI Video
 * Toolkit. Scrub to any moment in a clip and grab that exact frame as a crisp
 * PNG or JPG. Unlike the transcode tools, this NEVER loads the FFmpeg
 * WebAssembly core: it decodes the video with a native `<video>` element and
 * paints the current frame to a `<canvas>`, so a thumbnail comes back instantly
 * and the page stays light. Every string below is written for people searching
 * for "grab a frame / make a video thumbnail" specifically. None of it is
 * shared with the compress/convert/trim/gif copy, and no claim outruns what a
 * canvas capture actually does.
 */
const videoThumbnailGenerator: Tool = {
  slug: "video-thumbnail-generator",
  title: "Video Thumbnail Generator",
  description:
    "Grab a still frame from any video at the exact second you choose and save it as a PNG or JPG. Scrub, capture, download, instant, no upload, and no FFmpeg engine to wait on.",
  category: "video-tools",
  group: "Extract",
  icon: "Image",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",

  h1: "Video Thumbnail Generator, Grab a Frame as PNG or JPG Online",
  tagline:
    "Drop an MP4, MOV, WEBM or MKV, scrub to the exact frame you want, and capture it as a sharp PNG or JPG. It runs entirely in your browser with no FFmpeg download: the still comes back the instant you seek, and your video never leaves your device.",
  longDescription:
    "The Video Thumbnail Generator turns any moment of a video into a downloadable image. Point it at a clip and it plays and seeks locally using your browser's own video decoder. When you land on the frame you want, it paints that frame onto a hidden canvas and encodes it as a PNG (pixel-perfect, transparent-capable) or a JPG (smaller, quality-adjustable). Because none of this needs FFmpeg, there is no ~30 MB engine to load and no progress bar to watch. You seek, you see the frame, you download. Everything happens on your machine, so a private recording, an unreleased edit or a client's footage is never uploaded to a server. Use it to make a poster image for a video player, pull a thumbnail for a blog post or YouTube upload, grab a clean product still out of a demo reel, or snapshot a specific moment for documentation. You choose the format and, for JPG, the quality. You can optionally downscale the output so a 4K frame lands at a sensible size for the web. The tool is honest about its edges: the capture is exactly as large and sharp as the source frame (it can't invent detail a compressed video doesn't have), and a browser can only capture from formats it can natively decode, a frame from an exotic codec your browser won't play can't be grabbed here. For typical MP4/MOV/WEBM footage, though, it's about as fast and private as image capture gets: no account, no watermark, no upload.",

  ctaText: "Capture Frame",

  keywords: [
    "video thumbnail generator",
    "grab frame from video",
    "video to image",
    "extract frame from video",
    "screenshot from video",
    "video still capture",
    "make a video thumbnail",
    "mp4 to jpg",
    "poster image from video",
    "capture video frame online",
    "youtube thumbnail from video",
  ],

  seo: {
    title: "Video Thumbnail Generator: Grab a Frame as PNG or JPG | GigAI Tools",
    description:
      "Free online video thumbnail maker. Scrub to any second and capture that exact frame as PNG or JPG, instant, no FFmpeg download, nothing uploaded. Works on MP4, MOV, WEBM and MKV.",
  },

  features: [
    {
      icon: "Image",
      title: "PNG or JPG output",
      description:
        "Save the grabbed frame as a lossless PNG (crisp, supports transparency) or a JPG (smaller, with an adjustable quality slider): pick per job, whether you need a pristine still or a lightweight web thumbnail.",
    },
    {
      icon: "Zap",
      title: "Instant. No engine to load",
      description:
        "This tool never touches FFmpeg. It uses your browser's native video decoder and a canvas, so there's no ~30 MB WebAssembly download and no wait: seek to a frame and the capture is ready immediately.",
    },
    {
      icon: "MousePointerClick",
      title: "Frame-accurate scrubbing",
      description:
        "Drag the playhead or nudge the timestamp to land on the precise moment you want. The preview updates as you seek, so you capture the exact frame. Not a lucky guess a second away.",
    },
    {
      icon: "Ruler",
      title: "Optional downscaling",
      description:
        "Cap the longest side so a 4K frame comes out at a web-friendly size while keeping the aspect ratio (great for lightweight thumbnails) or leave it off to capture at full source resolution.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private",
      description:
        "The video is decoded entirely on your device and never uploaded. Grab frames from confidential footage, unreleased cuts or personal recordings: close the tab and nothing is left behind.",
    },
    {
      icon: "Download",
      title: "One-click download",
      description:
        "Preview the captured still full-size, confirm it's the frame you meant, then download it with a sensible filename derived from the source video. No sign-up, no watermark.",
    },
  ],

  benefits: [
    {
      title: "The exact frame, in a click",
      description:
        "Skip screen-recording a pause or fiddling in an editor. Scrub to the moment, capture, download. You get the true source frame, not a fuzzy screenshot of a scaled-down player.",
    },
    {
      title: "Faster than any transcoder",
      description:
        "Because it grabs frames with a canvas instead of FFmpeg, there's nothing to download and nothing to wait on. It's the quickest way to pull a still, especially for a handful of thumbnails.",
    },
    {
      title: "Private by design",
      description:
        "Nothing is uploaded, so you can snapshot a client's reel, an internal demo or a personal video without the file ever touching a third-party server.",
    },
    {
      title: "Web-ready without extra steps",
      description:
        "Choose JPG and a downscale cap to land a small, share-ready thumbnail, or PNG for a pristine poster with transparency support, the right image for the next place it's going.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WEBM or MKV onto the workspace, or click to browse. The clip is read locally and a preview player appears. Nothing is uploaded.",
    },
    {
      title: "Scrub to the frame",
      description:
        "Move the playhead or type a timestamp to land on the exact moment you want to capture. The preview follows your seek so you can see the frame before you grab it.",
    },
    {
      title: "Pick format & size",
      description:
        "Choose PNG or JPG (with a quality slider for JPG), and optionally cap the longest side to downscale the output. Defaults are tuned for a sharp, web-friendly still.",
    },
    {
      title: "Capture & download",
      description:
        "Press Capture Frame to grab the still instantly, review it full-size, then download it. Capture another frame or reset to start over with a different video anytime.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WEBM", "MKV", "M4V"],
    output: ["PNG", "JPG"],
  },

  useCases: [
    {
      audience: "Content creator",
      title: "Make a YouTube or blog thumbnail",
      description:
        "Find the most eye-catching moment in your video, grab it as a full-resolution PNG or JPG, and use it as your thumbnail or hero image. No editor round-trip, no upload.",
    },
    {
      audience: "Web developer",
      title: "Generate a video poster image",
      description:
        "Capture a representative frame to use as the `poster` on an HTML5 `<video>`, so the player shows a clean still before playback instead of a black box.",
    },
    {
      audience: "Product / marketing",
      title: "Pull a product still from a demo",
      description:
        "Grab a crisp frame of your product mid-demo for a landing page, deck or ad without a photoshoot, the exact pixels from the reel, downscaled for the web if you like.",
    },
    {
      audience: "Support / documentation",
      title: "Snapshot a moment for a doc or ticket",
      description:
        "Seek to the frame that shows the bug, the step or the detail, capture it as a PNG, and drop it straight into documentation or a bug report, locally, privately.",
    },
  ],

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The video is decoded and the frame is captured entirely in your browser using a native `<video>` element and a `<canvas>`. Nothing is uploaded, streamed or stored. The file's data stays on your device, which makes it safe for confidential, unreleased or personal footage.",
    },
    {
      question: "Do I have to wait for an FFmpeg engine to load?",
      answer:
        "No, and that's the point of this tool. Unlike the compress, convert or GIF tools, thumbnail capture doesn't use FFmpeg at all. There is no ~30 MB WebAssembly core to download and no progress bar: you seek to a frame and the capture is ready instantly.",
    },
    {
      question: "PNG or JPG, which should I choose?",
      answer:
        "Choose PNG for a lossless, pixel-perfect still that also supports transparency: ideal for posters, UI screenshots or anything you'll edit further. Choose JPG for a much smaller file when you're making a web thumbnail. You can dial the quality slider to trade size against sharpness.",
    },
    {
      question: "How large a video can I use?",
      answer:
        "Because capturing a frame only decodes and seeks (it doesn't transcode the whole file), it stays fast even on large videos, far lighter than FFmpeg-based tools. The real limit is whether your browser can decode the file and hold it while seeking. Multi-gigabyte files can be slow to seek on low-memory devices, but there's no full re-encode holding everything in memory.",
    },
    {
      question: "Will the thumbnail be as sharp as the original video?",
      answer:
        "The capture is exactly the source frame's pixels, so it's as sharp as the video is at that moment. It can't add detail a compressed or low-resolution video doesn't contain, and fast-motion frames may show natural motion blur. If you downscale, the aspect ratio is preserved and the image is resampled at high quality.",
    },
    {
      question: "Why can't it grab a frame from my file?",
      answer:
        "A browser can only capture from formats it can natively decode. Common MP4/MOV/WEBM footage works everywhere. A file using an exotic or unsupported codec that your browser won't play can't be captured here. If the video won't play in a normal browser tab, convert it first (try the Convert Video tool) and then grab the frame.",
    },
    {
      question: "Can I capture more than one frame?",
      answer:
        "Yes, capture a frame, download it, then just scrub to another moment and capture again. Each capture is instant, so pulling several thumbnails from one clip is quick. (For a whole grid of evenly-spaced frames at once, that's a different job than this single-frame grabber.)",
    },
    {
      question: "Is there a watermark, sign-up or resolution cap?",
      answer:
        "No. There's no account, no email wall and no watermark on the image. Captures come out at full source resolution unless you choose to downscale them yourself. The tool is free because it runs on your device, not ours.",
    },
  ],

  tips: [
    "Choose PNG when the still is headed into an editor or needs transparency. Choose JPG (and lower the quality a touch) when you just want a small web thumbnail.",
    "Nudge the timestamp a frame or two to dodge motion blur: the sharpest still is often on a moment where the subject is briefly still.",
    "Set a longest-side cap (e.g. 1280 px) to turn a 4K frame into a right-sized web thumbnail in one step, without a separate resize.",
    "For a video player poster, capture a frame a second or two in rather than the very first frame, which is often black or a fade-in.",
    "If a file won't load, play it in a normal browser tab first: if it won't play there either, convert it before capturing.",
  ],

  troubleshooting: [
    {
      problem: "The video won't load or the preview stays black.",
      solution:
        "Your browser can't decode that file's codec. Confirm it plays in a normal browser tab. If it doesn't, convert it to MP4 (H.264) with the Convert Video tool first, then capture the frame.",
    },
    {
      problem: "The captured frame looks soft or blurry.",
      solution:
        "The still is exactly as sharp as the source at that moment. It can't add detail that isn't in the video. Try scrubbing to a nearby frame with less motion, and avoid downscaling below the size you actually need.",
    },
    {
      problem: "Seeking is slow on a very large video.",
      solution:
        "Big files can be slow for the browser to seek within, especially on low-memory devices. Give it a moment after moving the playhead before capturing, or trim the clip down first with the Trim tool.",
    },
    {
      problem: "The download opened in a new tab instead of saving.",
      solution:
        "Some browsers preview images before saving. Right-click the previewed image and choose 'Save image as…', or use the download button and confirm your browser's download settings allow it.",
    },
  ],

  security:
    "Your video is decoded and the frame is captured entirely in your browser using a native `<video>` element and a `<canvas>`. It is never uploaded to any server, and this tool doesn't even load the FFmpeg engine. Your file's data stays on your device. Nothing is stored, logged or transmitted. That makes it safe to grab stills from confidential footage, unreleased edits and personal recordings. Close the tab and every trace is gone.",

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release: instant, FFmpeg-free frame capture to PNG or JPG with drag-and-drop, a scrubbable preview player, full-size result preview and one-click download.",
    },
    {
      date: "2026-06-23",
      change:
        "Added a JPG quality slider and an optional longest-side downscale cap for web-ready thumbnails, plus a live timestamp readout while scrubbing.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved seeking accuracy on variable-frame-rate clips, clearer messaging when a file's codec can't be decoded by the browser, and higher-quality resampling when downscaling.",
    },
  ],

  relatedTools: [
    "video-to-gif",
    "trim-video",
    "convert-video",
    "extract-audio",
  ],
};

export default videoThumbnailGenerator;
