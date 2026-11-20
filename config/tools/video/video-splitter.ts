import type { Tool } from "@/types";

/**
 * Video Splitter: one video in, many clips out. Drop a file, choose either
 * fixed-length chunks (every N seconds) or a list of custom start–end ranges,
 * and the tool re-encodes each segment locally with a self-hosted FFmpeg
 * WebAssembly core, then hands them back to download one by one or as a single
 * ZIP. Every string below is written for the exact "split video into parts"
 * queries people search, and none of it is shared with the trimmer, compressor
 * or converter copy: the trimmer keeps one piece; the splitter produces a set.
 */
const videoSplitter: Tool = {
  slug: "video-splitter",
  title: "Video Splitter",
  description:
    "Split a video into multiple clips online, cut into equal chunks every N seconds or by your own custom ranges, then download each part or grab them all in one ZIP. No uploads, no account, no watermark.",
  category: "video-tools",
  group: "Edit",
  icon: "Scissors",
  accent: "amber",
  status: "live",
  featured: false,
  createdAt: "2026-06-16",

  h1: "Video Splitter, Cut One Video Into Multiple Clips, Free",
  tagline:
    "Drop an MP4, MOV, WebM or MKV, split it into equal-length chunks or your own list of ranges, and download every segment separately or bundled into one ZIP. Powered by FFmpeg compiled to WebAssembly, it runs 100% in your browser. Your footage is never uploaded and the parts carry no watermark.",
  longDescription:
    "The GigAI Video Splitter is built for the moment a single file needs to become several: a long recording that should ship as bite-sized parts, a compilation you want broken back into its scenes, or a big clip that has to fit under a per-file upload cap. Drop a video and it probes the file locally, reads the exact duration, and lets you choose how to cut it. Pick a chunk length, say every 60 seconds, and it slices the whole clip into consecutive equal parts, telling you up front how many segments that will make. Or switch to custom ranges and type a list of start–end timecodes (1:00-2:30, 4:00-5:15, and so on) to carve out only the pieces you care about, in the order you list them. When you run it, a self-hosted FFmpeg WebAssembly core re-encodes each segment for a clean cut on the exact boundaries you set, no snapping to the nearest keyframe, and a live progress bar tracks the whole batch part by part. The results land as a tidy grid: preview any segment inline, download them individually, or pull the entire set down as a single ZIP built in your browser. Because every frame is read and written on your own machine, personal recordings, client footage and anything under NDA never leave the tab, there's no upload bar reaching out to a server, no queue behind other people's jobs, and no watermark stamped across a single part. It's honest about the trade-offs, too: WASM FFmpeg is single-threaded and memory-bound, so cutting many segments re-encodes each one and is slower than a desktop app, it's happiest with inputs up to roughly a few hundred megabytes and a sensible number of parts. Close the tab and every trace is gone.",

  ctaText: "Split video",

  keywords: [
    "video splitter",
    "split video online",
    "cut video into parts",
    "split video into segments",
    "split mp4 into clips",
    "divide video online",
    "split video by time",
    "video splitter no watermark",
    "split video in browser",
    "cut video into equal parts",
    "split video into multiple files",
    "chop video into clips",
  ],

  seo: {
    title:
      "Video Splitter. Split a Video Into Multiple Clips Online Free (No Watermark) | GigAI Tools",
    description:
      "Free online video splitter: cut one video into equal chunks or custom ranges and download each part or all of them as a ZIP. MP4, MOV, WebM & MKV, 100% in your browser, no uploads, no watermark.",
  },

  features: [
    {
      icon: "Scissors",
      title: "Equal chunks or custom ranges",
      description:
        "Split into consecutive equal-length parts by setting one chunk length, or list your own start–end timecodes to extract exactly the segments you want. The tool shows how many parts you'll get before you run it.",
    },
    {
      icon: "Layers",
      title: "Many clips from one file",
      description:
        "A single video becomes an ordered set of numbered parts, each cut cleanly on the boundaries you set. Every segment is a real, standalone file you can share, upload or edit on its own.",
    },
    {
      icon: "Archive",
      title: "Download each part or one ZIP",
      description:
        "Grab any single segment from the results grid, or bundle the whole set into one ZIP built right in your browser. No server round-trip, no per-file clicking through a dozen downloads.",
    },
    {
      icon: "Gauge",
      title: "Honest batch progress",
      description:
        "A determinate progress bar tracks the split part by part across the whole batch, and a one-time note covers the first-run engine download. No spinner that leaves you guessing whether it stalled.",
    },
    {
      icon: "Eye",
      title: "Preview before you save",
      description:
        "Play any produced segment inline to confirm it starts and ends where you meant before you download it or the full ZIP. No blind exports.",
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
      title: "Beat per-file upload caps",
      description:
        "When a platform won't take a file that big, split it into parts that each slip under the limit: without handing the original to a random server just to chop it up.",
    },
    {
      title: "No watermark, no account, no cap",
      description:
        "Free splitters love to stamp a logo on every part or gate the download behind a sign-up. This one just gives you the clips, clean, unbranded, and as many parts as you like.",
    },
    {
      title: "One in, many out: in one pass",
      description:
        "Cut a whole recording into equal chunks or a set of scenes in a single run, then take them individually or as one ZIP, instead of trimming the same file over and over.",
    },
    {
      title: "Nothing to install",
      description:
        "No desktop editor, no plugin, no FFmpeg command line to memorise. Open the page in any modern browser and you're splitting in seconds. It even works offline once the engine has loaded.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM or MKV onto the workspace, or click to browse. It's read and probed locally. Nothing is uploaded.",
    },
    {
      title: "Choose how to split",
      description:
        "Pick a chunk length to cut the whole clip into equal parts, or switch to custom ranges and type your own list of start–end timecodes to extract only the segments you want.",
    },
    {
      title: "Split & watch the batch",
      description:
        "Hit Split and follow the progress bar as each part is cut. The first run also fetches the FFmpeg engine once, so give segment #1 a moment.",
    },
    {
      title: "Preview & download",
      description:
        "Play any part to check the cut, then download segments one at a time or pull the whole set down as a single ZIP, clean and watermark-free.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI"],
    output: ["MP4", "WebM", "MKV", "ZIP"],
  },

  useCases: [
    {
      audience: "Content creator",
      title: "Chop a long video into shorts",
      description:
        "Slice a 20-minute recording into a series of one-minute chunks to schedule as separate shorts or reels, without opening a heavyweight editor or uploading the whole session anywhere.",
    },
    {
      audience: "Educator",
      title: "Break a lecture into chapters",
      description:
        "Split a single lecture capture into per-topic segments with custom ranges, so students can jump straight to the part they need instead of scrubbing one giant file.",
    },
    {
      audience: "Anyone hitting a size cap",
      title: "Split to fit an upload limit",
      description:
        "Cut a file that's too large for a chat app, email or portal into equal parts that each clear the limit, with the original never touching a server.",
    },
    {
      audience: "Editor",
      title: "Extract multiple scenes at once",
      description:
        "Pull several specific moments out of a master clip in one pass by listing their ranges, then download them together as a ZIP to drop straight into a project.",
    },
  ],

  troubleshooting: [
    {
      problem: "The first split is taking a while before the progress bar moves.",
      solution:
        "The very first run downloads the FFmpeg WebAssembly engine (a one-time fetch that's then cached). You'll see a 'loading engine' note during that step. Subsequent splits skip it and start cutting immediately.",
    },
    {
      problem: "It slowed to a crawl or ran out of memory on a big file with many parts.",
      solution:
        "In-browser FFmpeg is single-threaded and re-encodes each segment in your tab's memory, so a large clip cut into many parts is demanding. Keep inputs loosely under a few hundred megabytes, use a larger chunk length (fewer parts), or split a rough range first.",
    },
    {
      problem: "My custom ranges were rejected.",
      solution:
        "Enter one range per line or comma-separated as start-end, using seconds or M:SS / H:MM:SS timecodes, e.g. 1:00-2:30. Each end must be after its start, and both must fall inside the video's duration, the tool flags the entry it couldn't read.",
    },
    {
      problem: "A part starts or ends a fraction off where I set it.",
      solution:
        "For accurate boundaries each segment is re-encoded around your exact times rather than snapping to the nearest keyframe. Fine-tune the range and re-run. The extra accuracy is why the parts land where you asked instead of on a keyframe.",
    },
  ],

  tips: [
    "Not sure how many parts you'll get? Set a chunk length and the tool shows the part count before you run, nudge the length to land on a tidy number.",
    "Use custom ranges to pull out only the scenes you care about, in any order, list them start-end, one per line, using seconds or M:SS timecodes.",
    "Fewer, longer parts split faster than many short ones: every segment is re-encoded, so a big chunk length is the quickest way through a long clip.",
    "For the snappiest results keep inputs under a few hundred megabytes. The first run also downloads the engine once, so give split #1 a moment.",
    "Grab everything at once with the ZIP button. The archive is built in your browser, so it never leaves your device either.",
  ],

  security:
    "Your video is read, probed, previewed and split entirely in your browser using a self-hosted FFmpeg WebAssembly core, and the ZIP is bundled locally too: nothing is ever uploaded to any server, queued, logged or stored. That makes the splitter safe for personal recordings, client footage and anything under NDA. There's no account and no watermark, and once the engine has loaded the tool keeps working offline. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The splitter runs a self-hosted build of FFmpeg compiled to WebAssembly, so reading, previewing, cutting and even zipping the parts all happen on your own device inside the browser tab. Your footage is never uploaded, queued behind other jobs, logged or stored, which is exactly why there's no upload bar reaching out to the cloud and no watermark on any part. It's safe for personal, client and confidential clips.",
    },
    {
      question: "How do the two split modes work?",
      answer:
        "Equal chunks cut the whole video into consecutive parts of one length you choose. Set 60 seconds and a five-minute clip becomes five parts (the last one is whatever's left over). Custom ranges let you list specific start–end timecodes, and the tool extracts exactly those pieces in the order you write them, ignoring everything in between. Use chunks to divide the entire file evenly, and ranges to cherry-pick scenes.",
    },
    {
      question: "How large a video can I split in the browser?",
      answer:
        "Because everything runs in your tab's memory and each segment is re-encoded, the practical ceiling is your device's RAM and how many parts you ask for, not a fixed upload limit. As a loose rule, files up to roughly a few hundred megabytes split comfortably on a typical laptop. Very long or high-bitrate 4K clips, or splitting into dozens of parts, can strain memory or slow down. If a big job struggles, use a larger chunk length or split a rough range first. A live progress bar shows exactly where the batch stands.",
    },
    {
      question: "Can I download all the parts at once?",
      answer:
        "Yes. Every segment appears in a results grid where you can download any part on its own, and there's a single button that bundles the whole set into one ZIP. That archive is assembled right in your browser from the parts already on your device (it never round-trips to a server) so one click gets you everything without clicking through a dozen separate downloads.",
    },
    {
      question: "Do the split parts have a watermark?",
      answer:
        "Never. Each part is your footage cut to the boundaries you set. No logo, no stamp, no overlay of any kind, on any segment. There's also no sign-up, no email wall and no cap on how many parts you make. Because the processing happens on your device, there's no per-file cost to us, so there's nothing to gate.",
    },
    {
      question: "Which video formats can I split?",
      answer:
        "The mainstream web and mobile containers: MP4, MOV, WebM, MKV and AVI, carrying common codecs like H.264, VP8/VP9 and their usual audio tracks. Each part is written back in a broadly compatible container. Exotic professional or DRM-protected formats may not preview or split: for those, convert the file to MP4 or WebM first with the Video Converter and then split the result.",
    },
    {
      question: "Will splitting reduce quality?",
      answer:
        "Each part keeps the same footage, just a slice of it. To make every segment start and end exactly on the boundaries you set, the splitter re-encodes the frames around those cuts, which is technically lossy but visually faithful. You won't notice a difference in normal viewing. The upside of that accuracy is that your parts begin and end precisely where you asked, rather than snapping to the nearest keyframe.",
    },
    {
      question: "Why is the first split slower than the ones after it?",
      answer:
        "The first time you split a clip, the tool downloads the FFmpeg WebAssembly engine once and caches it: you'll see a brief 'loading engine' note while that happens. Every split after that skips the download and starts cutting straight away. It's also why the tool can keep working offline once you've used it in a session.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, drag-and-drop input, equal-chunk and custom-range split modes, in-browser FFmpeg WebAssembly cutting, live batch progress, inline segment preview, per-part download and one-click ZIP of the whole set, all watermark-free.",
    },
    {
      date: "2026-06-23",
      change:
        "Added a live part-count preview for chunk mode and friendlier timecode parsing for custom ranges (seconds, M:SS and H:MM:SS), with clearer flagging of the entry it couldn't read.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved probing for MOV/MKV sources and tightened large-batch guidance so heavy, many-part jobs warn before they start rather than mid-cut.",
    },
  ],

  relatedTools: [
    "video-trimmer",
    "video-compressor",
    "video-merger",
    "video-converter",
  ],
};

export default videoSplitter;
