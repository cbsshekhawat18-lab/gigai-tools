import type { Tool } from "@/types";

/**
 * Video Loop, repeat a clip end-to-end N times into one longer, seamless file.
 * Drop a video, pick how many total plays you want, and a self-hosted FFmpeg
 * WebAssembly core stitches the repeats into a single download, entirely in the
 * browser. Every string is written for the "loop a video" / "repeat a video"
 * intent and shares no copy with the trimmer, compressor, GIF or audio tools;
 * the numbers stay honest to what `operations.loopVideo` actually does (it
 * re-encodes and concatenates on-device. No upload, no watermark).
 */
const videoLoop: Tool = {
  slug: "video-loop",
  title: "Video Loop",
  description:
    "Loop a video online, repeat any clip 2, 5, 10 or more times back-to-back into one longer file, then download it. No uploads, no account, no watermark.",
  category: "video-tools",
  group: "Edit",
  icon: "Repeat",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",

  h1: "Video Loop, Repeat a Video Online, Free",
  tagline:
    "Drop an MP4, MOV, WebM or MKV, choose how many times it should play, and export a single longer file with the clip repeated end-to-end. Built on FFmpeg compiled to WebAssembly, it runs 100% in your browser. Your footage is never uploaded and the download carries no watermark.",
  longDescription:
    "The GigAI Video Loop turns a short clip into a longer one by playing it through again and again: the thing you reach for when a 4-second animation needs to fill a 30-second slot, a background video should run without an obvious cut, or a demo has to repeat on a kiosk screen. Drop a video and it's probed locally so you can see its length. Pick a repeat count and the tool shows you the finished duration and a rough output size before you commit, so there are no surprises. When you run it, a self-hosted FFmpeg WebAssembly core concatenates the copies into one continuous file and hands it straight back as a download. No separate segments to join yourself, no queue, no logo stamped across the result. Because every frame is written on your own machine, private recordings, client footage and anything under NDA never leave the tab. It's honest about the trade-offs of doing real video work in a browser: WASM FFmpeg is single-threaded and memory-bound, and looping multiplies the length, so a big clip repeated many times becomes a large output that takes real time to encode, a live progress bar tracks the whole run and the copy nudges you toward sane counts. Loop a tiny clip a handful of times and it's quick. Ask for a 200 MB source ten times over and you're asking for a 2 GB export your tab has to hold. Close the tab and every trace is gone.",

  ctaText: "Loop video",

  keywords: [
    "loop video",
    "repeat video online",
    "video loop maker",
    "loop mp4 online",
    "repeat a video",
    "make a video loop",
    "loop video online free",
    "video looper no watermark",
    "repeat video back to back",
    "loop video in browser",
    "extend video by repeating",
    "seamless video loop online",
  ],

  seo: {
    title: "Video Loop: Repeat a Video Online Free (No Watermark) | GigAI Tools",
    description:
      "Free online video looper: repeat any clip 2–20+ times into one longer file and download it. MP4, MOV, WebM & MKV: 100% in your browser, no uploads, no account, no watermark.",
  },

  features: [
    {
      icon: "Repeat",
      title: "Repeat 2–20+ times in one file",
      description:
        "Set how many total plays you want and the tool stitches that many copies of your clip end-to-end into a single continuous video. No manual concatenation, no external editor.",
    },
    {
      icon: "Clock",
      title: "Live output length & size preview",
      description:
        "Before you run anything, see the finished duration (source length × plays) and a rough output size, so you can dial the count in against how big the export will get.",
    },
    {
      icon: "Infinity",
      title: "Seamless back-to-back joins",
      description:
        "Each repeat is concatenated frame-accurately onto the last, so the clip runs through again without a gap or a visible seam between passes.",
    },
    {
      icon: "Gauge",
      title: "Honest live progress",
      description:
        "A determinate progress bar tracks the encode from first frame to last, with a one-time note for the first-run engine download. No spinner that leaves you guessing.",
    },
    {
      icon: "Download",
      title: "Preview & one-click download",
      description:
        "Play the looped result before you save it, then download the single file. No sign-up, no email wall, and no watermark of any kind.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "A self-hosted FFmpeg WebAssembly core does the looping on your device. Your video is never uploaded, queued or stored, which keeps personal, client and NDA footage private.",
    },
  ],

  benefits: [
    {
      title: "Fill the time you need",
      description:
        "A short clip rarely lands on the exact length a slideshow slot, ad break or kiosk screen wants. Looping stretches it to fit by replaying it, instead of forcing you to re-shoot or slow it down.",
    },
    {
      title: "One file, not a pile of copies",
      description:
        "Rather than exporting the clip several times and joining them by hand, you get a single continuous video with the repeats already stitched together and ready to use.",
    },
    {
      title: "Private by construction",
      description:
        "The loop runs on your machine, so the footage never touches a server. That makes it safe for personal recordings, client work and confidential material alike.",
    },
    {
      title: "Nothing to install, no watermark",
      description:
        "No desktop editor, no plugin, no FFmpeg command line, and the download is clean, unbranded and uncapped. Open the page in any modern browser and loop.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM or MKV onto the workspace, or click to browse. It's read and probed locally. Nothing is uploaded.",
    },
    {
      title: "Choose how many plays",
      description:
        "Set the total number of times the clip should play. The tool shows the resulting length and a rough output size so you can trade the count against how big the file gets.",
    },
    {
      title: "Loop & preview",
      description:
        "Hit Loop and watch the progress bar. When it finishes, the looped video plays back so you can confirm it runs through cleanly before you save.",
    },
    {
      title: "Download",
      description:
        "Download the single looped file (clean and watermark-free) with the new size shown next to the original on the result card.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI"],
    output: ["MP4", "WebM", "MKV"],
  },

  useCases: [
    {
      audience: "Content creator",
      title: "Fill a background bed",
      description:
        "Loop a short ambient or animated clip so it runs under a talking-head or podcast video for the whole segment, without an obvious restart mid-frame.",
    },
    {
      audience: "Marketer",
      title: "Stretch a hero animation",
      description:
        "Repeat a 5-second product loop enough times to cover a 30-second placement or a booth screen, so the motion keeps playing without a hard cut back to the start.",
    },
    {
      audience: "Event / Kiosk operator",
      title: "Build a repeating display reel",
      description:
        "Turn a single demo clip into a longer file that plays over and over on a lobby screen or signage loop, so you don't have to rely on a player's own repeat setting.",
    },
    {
      audience: "Anyone",
      title: "Make a meme or reaction loop",
      description:
        "Take a funny two-second moment and repeat it a dozen times into one shareable clip that keeps looping the joke, ready to post anywhere.",
    },
  ],

  troubleshooting: [
    {
      problem: "The first loop takes a while before the progress bar moves.",
      solution:
        "The very first run downloads the FFmpeg WebAssembly engine (a one-time fetch that's then cached). You'll see a 'loading engine' note during that step. Later loops skip it and start encoding immediately.",
    },
    {
      problem: "It slowed down or ran out of memory on a big output.",
      solution:
        "Looping multiplies length, so a large clip repeated many times becomes a very large file that in-browser FFmpeg has to hold in your tab's memory. Lower the repeat count, or trim the clip shorter first, then loop the shorter version.",
    },
    {
      problem: "There's a tiny hitch where one repeat meets the next.",
      solution:
        "Loops join cleanly at the container level, but if the source's own first and last frames don't visually match, the boundary can read as a jump. For a truly seamless loop, start from a clip whose end flows back into its beginning, or trim it so it does.",
    },
    {
      problem: "My video won't load or preview.",
      solution:
        "The player relies on codecs your browser can decode. Very unusual or professional/DRM-protected formats may not preview. Try a mainstream container like MP4 or WebM, or convert the file first with the Video Converter.",
    },
  ],

  tips: [
    "Watch the output length as you change the count. The finished duration is simply your clip's length times the number of plays.",
    "Big source × many repeats = a big export your tab has to hold in memory. If it's sluggish, trim the clip shorter first, then loop the shorter version.",
    "For a seamless loop, start from a clip whose last frame flows back into its first. Otherwise the join between passes can read as a small jump.",
    "The first loop of a session downloads the engine once, so give loop #1 a moment. Every loop after that starts encoding right away.",
    "Only need it to repeat in a player, not as a file? A web <video loop> attribute does that for free, export a real looped file when you need it baked into one video.",
  ],

  security:
    "Your video is read, probed, previewed and looped entirely in your browser using a self-hosted FFmpeg WebAssembly core. It is never uploaded to any server, queued, logged or stored. That makes the looper safe for personal recordings, client footage and anything under NDA. There's no account and no watermark, and once the engine has loaded the tool keeps working offline. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The looper runs a self-hosted build of FFmpeg compiled to WebAssembly, so reading, previewing and stitching the repeats all happen on your own device inside the browser tab. Your footage is never uploaded, queued behind other jobs, logged or stored, which is exactly why there's no upload bar reaching out to the cloud and no watermark on the result. It's safe for personal, client and confidential clips.",
    },
    {
      question: "How many times can I loop a clip, and how big can the file be?",
      answer:
        "There's no hard cap on the repeat count, but there's a practical one: looping multiplies length, so the output is your source size times the number of plays, and the whole thing has to fit in your tab's memory while it encodes. A small clip looped a handful of times is quick. A few-hundred-megabyte source repeated ten times becomes a multi-gigabyte export that will be slow and may run out of memory. The tool shows the projected length and a rough size before you run, so you can keep the count sensible. If you need a very long result, trim or compress the source first.",
    },
    {
      question: "Does the looped video have a watermark?",
      answer:
        "Never. The file you download is your footage repeated to the count you chose. No logo, no stamp, no overlay of any kind. There's also no sign-up, no email wall and no usage cap. Because the processing happens on your device, there's no per-file cost to us, so there's nothing to gate.",
    },
    {
      question: "Will the loop be seamless?",
      answer:
        "The repeats are concatenated frame-accurately, so there's no gap or dropped frame between one pass and the next. Whether it looks seamless depends on your footage: if the clip's last frame flows naturally into its first, the join is invisible. If they're very different, your eye may catch the reset. For a perfect loop, start from a clip designed to loop, or trim it so its ends match.",
    },
    {
      question: "Why is the first loop slower than the ones after it?",
      answer:
        "The first time you loop a clip, the tool downloads the FFmpeg WebAssembly engine once and caches it, you'll see a brief 'loading engine' note while that happens. Every loop after that skips the download and starts encoding straight away. It's also why the tool keeps working offline once you've used it in a session.",
    },
    {
      question: "Does looping reduce quality?",
      answer:
        "To join the copies cleanly the tool re-encodes the video, which is technically lossy, but it's a single pass at faithful settings: in normal viewing you won't see a difference from the source. Each repeat is the same footage, so no repeat looks worse than the one before it. Quality is uniform across the whole looped file.",
    },
    {
      question: "Which video formats can I loop?",
      answer:
        "The mainstream web and mobile containers: MP4, MOV, WebM, MKV and AVI, carrying common codecs like H.264, VP8/VP9 and their usual audio tracks. The output stays in a broadly compatible container. Exotic professional or DRM-protected formats may not preview or loop, for those, convert the file to MP4 or WebM first with the Video Converter, then loop the result.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's nothing to download, no plugin and no sign-up. Open the page in any modern browser (Chrome, Edge, Firefox or Safari), drop a clip in, pick a count and loop. The FFmpeg engine is fetched once on first use and cached, after which looping works on demand: including offline for a tool you've already opened.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, drag-and-drop input, repeat-count control with live output length and rough size, in-browser FFmpeg WebAssembly concatenation, live progress, preview, before/after size and watermark-free download.",
    },
    {
      date: "2026-06-23",
      change:
        "Added a projected-duration and estimated-output-size readout that updates as you change the repeat count, plus a large-output warning before heavy runs.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved probing for MOV/MKV sources and clearer first-run engine-loading messaging on the initial loop.",
    },
  ],

  relatedTools: [
    "video-trimmer",
    "video-compressor",
    "video-converter",
    "video-to-gif",
  ],
};

export default videoLoop;
