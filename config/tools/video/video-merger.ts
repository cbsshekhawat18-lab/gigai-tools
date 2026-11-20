import type { Tool } from "@/types";

/**
 * Video Merger: join several clips into one continuous video, entirely in the
 * browser. Users add multiple files, drag the list to fix the running order,
 * and export a single MP4. Because inputs often differ in size, codec and frame
 * rate, the merge re-encodes each source to a common baseline (1280×720 / 30fps
 * / H.264 + AAC) via a self-hosted FFmpeg WebAssembly core so the seams line up
 * cleanly. Every string is written for the exact queries people type when they
 * want to stitch videos together without an upload, and none of it overlaps the
 * trimmer / compressor / to-gif / extract-audio copy.
 */
const videoMerger: Tool = {
  slug: "video-merger",
  title: "Video Merger",
  description:
    "Combine multiple videos into one online. Add your clips, drag to reorder, and merge into a single MP4. Handles mismatched sizes and formats by re-encoding to a common baseline. No uploads, no account, no watermark.",
  category: "video-tools",
  group: "Edit",
  icon: "Combine",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-14",

  h1: "Video Merger: Combine & Join Videos Online, Free",
  tagline:
    "Drop in as many MP4, MOV, WebM or MKV clips as you like, drag the list into the order you want, and stitch them into one continuous video. A self-hosted FFmpeg WebAssembly core does the joining on your device: nothing is uploaded, and the export carries no watermark.",
  longDescription:
    "The GigAI Video Merger does the one thing every ad-riddled 'combine video' site makes needlessly painful: it takes several clips and hands you back a single, seamless file: without an upload, an account, or a logo stamped across the result. Add your videos in any order, then drag the list up and down until the sequence is exactly right. A running total shows how many clips and roughly how long the finished video will be before you commit. When you merge, a self-hosted FFmpeg WebAssembly core re-encodes each source to a shared baseline (1280×720 at 30fps, H.264 video with AAC audio) and concatenates them into one MP4. That re-encode is the honest, reliable way to join clips that don't already match: phone footage next to a screen recording, a 4K intro before a 720p body, a silent clip after one with sound. A naive stream-copy concat would glitch or desync on mismatched inputs. Normalizing first is what makes the seams clean. Everything runs in your browser tab, so wedding footage, client cuts and anything under NDA never leave your machine: there's no upload bar reaching for the cloud, no queue behind other people's jobs, and no per-file paywall. It's candid about the trade-offs, too: WebAssembly FFmpeg is single-threaded and memory-bound, and because merging re-encodes every frame of every clip it's the heaviest operation in the suite: a live progress bar tracks the whole job, and the copy steers you toward keeping the combined footage to a sane length on a typical laptop. Close the tab and every trace is gone.",

  ctaText: "Merge videos",

  keywords: [
    "video merger",
    "combine videos online",
    "join videos online",
    "merge mp4 online",
    "video joiner",
    "concatenate videos",
    "stitch videos together",
    "merge videos free no watermark",
    "combine videos in browser",
    "join clips online",
    "merge mov online",
    "append videos online",
  ],

  seo: {
    title:
      "Video Merger: Combine & Join Videos Online Free (No Watermark) | GigAI Tools",
    description:
      "Free online video merger: add clips, drag to reorder, and combine into one MP4. Handles mismatched sizes & formats by re-encoding. 100% in your browser. No uploads, no account, no watermark.",
  },

  features: [
    {
      icon: "ListOrdered",
      title: "Drag-to-reorder clip list",
      description:
        "Add as many videos as you need, then drag each row up or down (or nudge it with the arrow buttons) until the running order is exactly right. Remove a clip in one click before you merge.",
    },
    {
      icon: "Layers",
      title: "Handles mismatched inputs",
      description:
        "Clips of different sizes, frame rates, codecs and containers still join cleanly. Each source is re-encoded to a common 1280×720 / 30fps / H.264 baseline so the seams don't glitch or desync.",
    },
    {
      icon: "Timer",
      title: "Live count & length preview",
      description:
        "See how many clips are queued and roughly how long the combined video will run before you start, so you can trim or drop a clip up front instead of after a long encode.",
    },
    {
      icon: "Gauge",
      title: "Honest progress on the heaviest job",
      description:
        "Merging re-encodes every frame of every clip, so it's the most demanding operation here. A determinate progress bar tracks the whole merge, with a one-time note for the first-run engine download.",
    },
    {
      icon: "Download",
      title: "Preview & one-click download",
      description:
        "Play the joined video right in the page before you save it, then download a single MP4. No sign-up, no email wall, no watermark of any kind.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "A self-hosted FFmpeg WebAssembly core does the merging on your device. Your clips are never uploaded, queued or stored, safe for personal, client and NDA footage alike.",
    },
  ],

  benefits: [
    {
      title: "Join clips that don't match",
      description:
        "The reason most quick merges fail is mismatched sources. This tool re-encodes each clip to a shared baseline first, so a 4K intro, a 720p body and a phone clip stitch together without stutters or audio drift.",
    },
    {
      title: "Keep your footage private",
      description:
        "The usual way to combine videos online is to hand every clip to a stranger's server. Here the whole merge runs on your machine, so raw footage of your family, your clients or anything confidential never leaves the tab.",
    },
    {
      title: "No watermark, no account, no cap",
      description:
        "Free joiners love to brand your export or gate the download behind a sign-up. This one just gives you the combined file, clean, unbranded, and as many times as you like.",
    },
    {
      title: "Nothing to install",
      description:
        "No desktop editor, no plugin, no FFmpeg concat command to memorise. Open the page in any modern browser, drop your clips in, and merge. It even works offline once the engine has loaded.",
    },
  ],

  howTo: [
    {
      title: "Add your clips",
      description:
        "Drag several MP4, MOV, WebM or MKV files onto the workspace, or click to browse and multi-select. Add more at any time. Each one is read and probed locally, never uploaded.",
    },
    {
      title: "Set the order",
      description:
        "Drag the rows to arrange the clips top-to-bottom in the sequence you want, or use the up/down buttons. Remove any clip you don't want with the trash button.",
    },
    {
      title: "Merge & preview",
      description:
        "Hit Merge and watch the progress bar as each clip is re-encoded and joined. When it finishes, the combined video plays back so you can confirm the order and seams before you save.",
    },
    {
      title: "Download",
      description:
        "Download the single merged MP4, clean and watermark-free, with the output size shown right on the result card.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI"],
    output: ["MP4"],
  },

  useCases: [
    {
      audience: "Content creator",
      title: "Build a video from parts",
      description:
        "Stitch an intro bumper, a main take and an outro card into one upload-ready file, reordering the pieces until the flow feels right, without opening a heavyweight editor.",
    },
    {
      audience: "Marketer",
      title: "Chain product clips into a reel",
      description:
        "Join several short product or testimonial shots, often filmed on different devices at different resolutions, into a single promo, letting the re-encode smooth over the format mismatch.",
    },
    {
      audience: "Event / Family",
      title: "Combine phone clips into one memory",
      description:
        "Merge a handful of phone videos from a trip, party or recital into one continuous keepsake to share, without any of the raw footage touching a server.",
    },
    {
      audience: "Teacher / Student",
      title: "Assemble a multi-part recording",
      description:
        "Join separate takes of a lesson, lab demo or presentation into a single file for upload, dropping or reordering segments before you export.",
    },
  ],

  troubleshooting: [
    {
      problem: "The merge is slow, or a big batch runs out of memory.",
      solution:
        "Merging is the heaviest operation here because it re-encodes every frame of every clip in a single-threaded, memory-bound WebAssembly engine. Keep the combined footage to a sane length on a typical laptop: compress or trim very large clips first, or merge in smaller batches and then join the results.",
    },
    {
      problem: "The first merge waits a while before the progress bar moves.",
      solution:
        "The very first run downloads the FFmpeg WebAssembly engine once and caches it, you'll see a 'loading engine' note during that step. Every merge after that skips the download and starts encoding straight away.",
    },
    {
      problem: "The audio and video drift apart at a join.",
      solution:
        "That happens when clips are stream-copied without normalizing. This tool re-encodes each source to a common frame rate and audio layout before joining precisely to avoid drift. If a specific clip still misbehaves, re-encode it on its own with the Video Compressor first, then add it back to the list.",
    },
    {
      problem: "A clip won't load or preview.",
      solution:
        "Previews rely on codecs your browser can decode. Very unusual, professional or DRM-protected formats may not load. Convert the offending clip to MP4 or WebM first with the Video Converter, then add it to the merge.",
    },
  ],

  tips: [
    "Get the order right before you merge: reordering is instant, but re-encoding after a long merge means paying for the whole job again.",
    "Clips are normalized to 1280×720 / 30fps, so mixing a 4K clip with a 720p one is fine. The output is a single, consistent MP4.",
    "Trim dead air off each clip with the Video Trimmer first: a shorter total runtime means a faster merge and a smaller final file.",
    "For a very large batch, merge in groups and then merge the groups. It keeps memory use manageable on a typical laptop.",
    "The first merge downloads the engine once, so give merge #1 a moment before the progress bar starts moving.",
  ],

  security:
    "Your clips are read, probed, previewed and merged entirely in your browser using a self-hosted FFmpeg WebAssembly core. They are never uploaded to any server, queued, logged or stored. That makes the merger safe for personal recordings, client footage and anything under NDA. There's no account and no watermark, and once the engine has loaded the tool keeps working offline. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Are my videos uploaded to a server?",
      answer:
        "No. The merger runs a self-hosted build of FFmpeg compiled to WebAssembly, so reading, previewing and joining every clip all happen on your own device inside the browser tab. Your footage is never uploaded, queued behind other jobs, logged or stored, which is exactly why there's no upload bar and no watermark on the result. It's safe for personal, client and confidential clips.",
    },
    {
      question: "How many clips can I merge, and how large?",
      answer:
        "There's no fixed count or upload limit. The practical ceiling is your device's memory. Because merging re-encodes every frame of every clip in a single-threaded WebAssembly engine, it's the heaviest operation in the suite, so combined runtime and total size matter more than the number of files. On a typical laptop a handful of short-to-medium clips is comfortable. For a big batch, merge in smaller groups and then join the results, and keep an eye on the live progress bar.",
    },
    {
      question: "Do the clips need to be the same size or format?",
      answer:
        "No: that's the point of this tool. Clips of different resolutions, frame rates, codecs and containers are each re-encoded to a common baseline (1280×720 at 30fps, H.264 video with AAC audio) before they're joined, so mismatched sources stitch together cleanly instead of glitching or desyncing at the seams. You can freely mix a phone clip, a screen recording and a 4K shot.",
    },
    {
      question: "Does the merged video have a watermark?",
      answer:
        "Never. The file you download is your clips joined in the order you set. No logo, no stamp, no overlay of any kind. There's also no sign-up, no email wall and no usage cap. Because the processing happens on your device, there's no per-file cost to us, so there's nothing to gate.",
    },
    {
      question: "Why does merging re-encode instead of just concatenating?",
      answer:
        "A raw stream-copy concat only works when every clip already shares the exact same codec, resolution, frame rate and audio layout, and real-world clips almost never do. Re-encoding each source to a shared baseline first is the reliable way to join mismatched footage without stutters, black frames or audio drift at the joins. The trade-off is that it's slower and more demanding than a plain copy, which is why the progress bar and large-file guidance are front and centre.",
    },
    {
      question: "What order will the clips appear in?",
      answer:
        "Exactly the top-to-bottom order shown in the list. Drag any row to move it, or use the up/down buttons, and the running count and estimated length update as you go. The final MP4 plays the clips in that sequence, one straight after another.",
    },
    {
      question: "Why is the first merge slower than the ones after it?",
      answer:
        "The first time you merge, the tool downloads the FFmpeg WebAssembly engine once and caches it, you'll see a brief 'loading engine' note while that happens. Every merge after that skips the download and starts encoding straight away, which is also why the tool can keep working offline once you've used it in a session.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's nothing to download, no plugin and no sign-up. Open the page in any modern browser (Chrome, Edge, Firefox or Safari), drop your clips in, set the order and merge. The FFmpeg engine is fetched once on first use and cached, after which merging works on demand, including offline for a tool you've already opened.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release: multi-file drag-and-drop input, drag-to-reorder clip list, in-browser FFmpeg WebAssembly merge with re-encode-to-baseline normalization, live count/length preview, determinate progress, preview and watermark-free MP4 download.",
    },
    {
      date: "2026-06-21",
      change:
        "Added up/down reorder buttons alongside drag, per-clip remove, and a running estimated-length total so you can prune the queue before a long merge.",
    },
    {
      date: "2026-06-28",
      change:
        "Improved probing for MOV/MKV sources and clearer large-batch guidance so heavy merges warn up front rather than stalling mid-encode.",
    },
  ],

  relatedTools: [
    "video-trimmer",
    "video-compressor",
    "video-to-gif",
    "extract-audio",
  ],
};

export default videoMerger;
