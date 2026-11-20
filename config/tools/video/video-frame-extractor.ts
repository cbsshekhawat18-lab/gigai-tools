import type { Tool } from "@/types";

/**
 * Video Frame Extractor: the flagship of the GigAI Video Toolkit's Extract
 * group. Drop a clip and pull out still frames, either evenly at a chosen
 * frames-per-second sampling rate or at an exact list of timestamps, then
 * download the stills one at a time or bundled as a ZIP. Crucially this is a
 * NO-ffmpeg tool: frames are grabbed with a native `<video>` seek plus a
 * `<canvas>` draw, so it's effectively instant and never pulls the ~31 MB WASM
 * core. Every string below is written for the queries people actually type when
 * they want "frames out of a video": nothing here overlaps the gif/audio/
 * compress copy, and no claim outruns what a DOM `<video>` decode can do (it is
 * honest that seek granularity, DRM and exotic codecs are the real limits, not
 * a server).
 */
const videoFrameExtractor: Tool = {
  slug: "video-frame-extractor",
  title: "Video Frame Extractor",
  description:
    "Extract still frames from any video: sample evenly at a chosen frame rate or grab exact timestamps, then download the images or a ZIP. Runs instantly in your browser with no upload and no engine to load.",
  category: "video-tools",
  group: "Extract",
  icon: "Images",
  accent: "amber",
  status: "live",
  featured: true,
  createdAt: "2026-06-15",

  h1: "Video Frame Extractor, Export Still Frames from MP4, WebM & MOV",
  tagline:
    "Drop an MP4, WebM, MOV or MKV and pull out crisp still images, sample the whole clip at a frame rate you choose, or grab specific timestamps down to the second. Frames are decoded with your browser's own video engine and rendered to PNG or JPEG, so extraction is instant, private, and needs no plugin or upload.",
  longDescription:
    "Video Frame Extractor turns a video into a set of still images entirely on your device, and unlike most tools in a video toolkit, it never loads FFmpeg or any heavy engine. It works by loading your clip into a hidden HTML5 `<video>` element, seeking to each moment you want, and drawing that frame onto a `<canvas>` that's encoded to a PNG or JPEG. That's why it feels instant: there's no ~31 MB WebAssembly download and no transcoding pipeline, just the browser's native decoder doing exactly what it already does to play the video. You choose one of two modes. In frame-rate mode you set a sampling rate (say 1 frame per second, or 4) and the tool walks the whole clip grabbing evenly spaced stills, which is perfect for contact sheets, dataset creation or scrubbing a recording for the one moment that matters. In timestamp mode you type an exact list of times (in seconds, or mm:ss) and it grabs only those, ideal when you already know you want the frame at 0:03 and 0:17. Either way you preview every extracted frame in a responsive grid, download any single image, or bundle them all into a ZIP with one click. You also control the output format (PNG for pixel-perfect stills, JPEG for smaller files) and an optional max size that downscales the longest edge to keep a large batch light. Because everything runs locally, a confidential recording, an unreleased render or a private clip never leaves your machine. There is no server to store or see it. The tool is honest about its real limits: browser seek precision isn't frame-exact on every codec, so a requested time may land on the nearest decodable frame. Very high sampling rates on a long clip produce a lot of images and take proportionally longer, and DRM-protected or exotically-encoded files that your browser can't play also can't be sampled. For everything a browser can decode, though, it's the fastest, most private way to get stills out of a video.",

  ctaText: "Extract frames",

  keywords: [
    "video frame extractor",
    "extract frames from video",
    "video to images",
    "mp4 to png",
    "export video frames",
    "get frame from video",
    "video frame grabber",
    "screenshot every frame",
    "video to jpg frames",
    "save frames from video",
    "frame by frame extractor online",
    "video still image extractor",
  ],

  seo: {
    title:
      "Video Frame Extractor: Export Still Frames from MP4/WebM/MOV | GigAI Tools",
    description:
      "Free online video frame extractor. Pull still images from MP4, WebM or MOV by frame rate or exact timestamps, preview in a grid, and download PNG/JPEG or a ZIP. Instant, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Zap",
      title: "Instant. No engine to load",
      description:
        "Unlike heavier video tools, this one never downloads the ~31 MB FFmpeg core. Frames are grabbed with your browser's own `<video>` decoder and a canvas draw, so a batch of stills appears in seconds.",
    },
    {
      icon: "Gauge",
      title: "Sample by frame rate",
      description:
        "Set a frames-per-second rate (1, 2, 4 or more) and the tool walks the entire clip capturing evenly spaced stills. Great for contact sheets, review scrubbing and building image datasets.",
    },
    {
      icon: "Clock",
      title: "Grab exact timestamps",
      description:
        "Already know the moments you want? Type a list of times in seconds or mm:ss and get only those frames. No wading through a full sample when you just need 0:03 and 0:17.",
    },
    {
      icon: "Image",
      title: "PNG or JPEG, your call",
      description:
        "Export pixel-perfect PNG stills for editing, or JPEG for a much smaller batch. An optional max-size caps the longest edge so a big grab of frames stays manageable.",
    },
    {
      icon: "FileArchive",
      title: "Download one or ZIP them all",
      description:
        "Save any single frame from the preview grid, or bundle every extracted image into a single ZIP with one click. The archive is built in the browser, nothing round-trips a server.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, on your device",
      description:
        "Your video is decoded locally and never uploaded. Pull frames from an unreleased render, a confidential recording or a personal clip, close the tab and every frame and object URL is gone.",
    },
  ],

  benefits: [
    {
      title: "Faster than any transcoder for stills",
      description:
        "Because grabbing a frame is just a seek and a canvas draw, there's no WASM core to fetch and no transcode to wait on. For getting images out of a video, this is the quickest path there is.",
    },
    {
      title: "Exactly the frames you need",
      description:
        "Two modes cover both jobs: sweep the whole clip at a set rate for a contact sheet, or target precise timestamps when you already know the moment. No dumping thousands of frames you'll throw away.",
    },
    {
      title: "Keep private footage private",
      description:
        "Nothing is uploaded, so an unreleased cut, a medical recording or a client's video is sampled entirely on your machine, there's no third-party server that ever sees a single pixel.",
    },
    {
      title: "No install, no watermark, no sign-up",
      description:
        "Get clean PNG or JPEG stills without desktop software, an account, or a logo stamped on your images. Just a browser tab you can close when you're done.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, WebM, MOV or MKV onto the workspace, or click to browse. The clip is probed locally for its duration and dimensions: nothing is uploaded.",
    },
    {
      title: "Pick a mode",
      description:
        "Choose sampling by frame rate (evenly spaced stills across the whole clip) or by exact timestamps (a list of times you type). Switch anytime before extracting.",
    },
    {
      title: "Set format & options",
      description:
        "Pick PNG or JPEG, set your frame rate or timestamp list, and optionally cap the longest edge so a large batch of frames stays light.",
    },
    {
      title: "Extract & preview",
      description:
        "Click Extract frames. A progress bar tracks the grab and every frame appears in a preview grid with its timestamp, usually in just a few seconds.",
    },
    {
      title: "Download or ZIP",
      description:
        "Save any single frame, or download all of them as one ZIP. Reset to try a different rate, timestamps or format on the same clip.",
    },
  ],

  formats: {
    input: ["MP4", "WebM", "MOV", "MKV", "M4V", "OGV"],
    output: ["PNG", "JPEG", "ZIP"],
  },

  useCases: [
    {
      audience: "ML / Data engineer",
      title: "Build an image dataset from footage",
      description:
        "Sample a recording at a steady frame rate to generate a labelled set of stills for training or annotation, done locally, so proprietary or sensitive footage never leaves your machine.",
    },
    {
      audience: "Video editor / Colorist",
      title: "Pull reference stills for grading",
      description:
        "Grab exact frames at the timestamps you're matching, export as PNG to keep every pixel, and drop them straight into a grading or compositing reference board.",
    },
    {
      audience: "Support / QA",
      title: "Capture the exact frame a bug appears",
      description:
        "Type the timestamp where a glitch shows up and export that single still to attach to a ticket, clearer and lighter than an entire video, and precise to the moment.",
    },
    {
      audience: "Creator / Social",
      title: "Find the perfect thumbnail frame",
      description:
        "Sweep a clip at a low frame rate to see a contact sheet of candidate stills, then download the one that reads best as a cover image or post thumbnail.",
    },
  ],

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. Frames are extracted entirely in your browser: the clip is loaded into a hidden HTML5 video element, seeked, and drawn onto a canvas that's saved as PNG or JPEG. Nothing is uploaded, stored or logged: it's safe for confidential and unreleased footage.",
    },
    {
      question: "Why is this so fast when other video tools are slow?",
      answer:
        "This tool doesn't transcode, so it never loads the ~31 MB FFmpeg WebAssembly core that heavier tools (compress, GIF, audio) need. Grabbing a still is just a video seek plus a canvas draw using your browser's native decoder, the same thing it does to play the video, so extraction is effectively instant.",
    },
    {
      question: "What's the difference between frame-rate and timestamp mode?",
      answer:
        "Frame-rate mode samples the whole clip at a rate you set (e.g. 2 frames per second) to produce evenly spaced stills: good for contact sheets and datasets. Timestamp mode grabs only the exact times you type (in seconds or mm:ss), good when you already know the moments you want. Timestamps override the frame rate.",
    },
    {
      question: "How exact are the extracted frames?",
      answer:
        "The browser seeks to your requested time and returns the nearest frame it can decode there. On most modern MP4/WebM clips that's very close to frame-accurate, but seek precision depends on the codec's keyframe layout, so an odd file may land on a neighbouring frame. For most uses the difference is imperceptible.",
    },
    {
      question: "Is there a limit on how many frames I can extract?",
      answer:
        "There's no hard cap, but be sensible: a high sampling rate on a long clip produces a lot of images, and each one is decoded, drawn and held in memory until you download or reset. Extracting many thousands of high-resolution PNGs can get heavy for the browser tab. Use JPEG and a max-size cap for large batches, or target timestamps instead of a high fps.",
    },
    {
      question: "Should I choose PNG or JPEG?",
      answer:
        "PNG is lossless and pixel-perfect, best when the stills go into editing, grading or a dataset that shouldn't have compression artifacts. JPEG is much smaller, which matters for big batches or web use where a little compression is fine. You can also cap the longest edge to shrink every frame proportionally.",
    },
    {
      question: "Why won't a particular video load or produce frames?",
      answer:
        "The tool can only sample what your browser can play. DRM-protected video, or files using a codec your browser can't decode, won't load. The same clip would also fail to play in a normal video element. Converting the source to standard MP4 (H.264) first usually resolves it.",
    },
    {
      question: "Does it work on my phone?",
      answer:
        "Yes, in modern mobile browsers, and because there's no WASM engine to load, it's far lighter than transcoding tools. Very large videos or huge batches of frames still use more memory than a phone may have, so a desktop browser is more reliable for big jobs.",
    },
  ],

  tips: [
    "Use timestamp mode when you already know the moments you want, it's instant and avoids generating stills you'll only delete.",
    "For contact sheets, a low sampling rate like 1 fps gives a readable overview of a whole clip without an overwhelming number of images.",
    "Pick PNG when frames go into editing or a dataset. Switch to JPEG plus a max-size cap for large batches you'll share or upload elsewhere.",
    "Type timestamps as mm:ss (e.g. 1:23) or plain seconds (e.g. 83). Both are accepted, so use whichever you have on hand.",
    "Extracting thousands of frames? Do it on a desktop browser and prefer JPEG so the tab's memory isn't overwhelmed by the preview grid.",
  ],

  troubleshooting: [
    {
      problem: "The video won't load or the preview stays empty.",
      solution:
        "The tool can only sample what your browser can decode. If the clip is DRM-protected or uses an unusual codec, it also won't play in a normal video element. Convert the source to standard MP4 (H.264) first, then try again.",
    },
    {
      problem: "A grabbed frame looks slightly off from the time I asked for.",
      solution:
        "Browser seeking returns the nearest decodable frame, which depends on the codec's keyframe spacing. It's usually very close. If you need a specific instant, try a couple of neighbouring timestamps and pick the exact one from the preview grid.",
    },
    {
      problem: "The tab slows down or runs out of memory during a big batch.",
      solution:
        "Each extracted frame is decoded and held for preview until you reset. Lower the sampling rate, switch to JPEG, set a max-size cap, or use timestamp mode to grab only what you need: then download the ZIP and reset to free memory.",
    },
    {
      problem: "The ZIP is missing frames or the download didn't start.",
      solution:
        "The ZIP is assembled in the browser after extraction finishes, wait for the grid to fully populate before clicking Download all. If a browser blocked the download, check for a blocked-popup prompt and allow downloads from this site.",
    },
  ],

  security:
    "Your video is decoded and sampled entirely in your browser using the native HTML5 video and canvas APIs. It is never uploaded to any server, and no FFmpeg engine is ever loaded. Frames are drawn locally, previewed via in-memory object URLs, and (optionally) zipped on your device. Nothing is stored, logged or transmitted, so you can safely extract frames from confidential recordings, unreleased renders and personal clips. Close the tab and every frame and preview URL is released.",

  changelog: [
    {
      date: "2026-06-15",
      change:
        "Initial release, instant in-browser frame extraction via native `<video>` + canvas (no FFmpeg), with frame-rate and timestamp modes, PNG/JPEG output, a preview grid, per-frame download and one-click ZIP.",
    },
    {
      date: "2026-06-21",
      change:
        "Added a max-size cap to downscale large batches, mm:ss timestamp parsing, and clearer honesty about browser seek precision and DRM/codec limits.",
    },
    {
      date: "2026-06-28",
      change:
        "Improved memory handling and object-URL cleanup for very large frame grabs, and sharpened progress reporting across long clips.",
    },
  ],

  relatedTools: [
    "video-to-gif",
    "video-trimmer",
    "video-compressor",
    "extract-audio",
  ],
};

export default videoFrameExtractor;
