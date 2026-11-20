import type { Tool } from "@/types";

/**
 * Video Crop, reframe a clip by drawing a crop box over a live preview or
 * snapping to an aspect-ratio preset, then export just that region. FFmpeg
 * compiled to WebAssembly does the cut entirely in the browser, so the footage
 * is never uploaded. Every string is written for the queries people type when
 * they need to crop a video (remove black bars, make it square/vertical, trim
 * the edges) without handing the file to a server. No copy is shared with the
 * trimmer/compressor/converter, and no claim outruns the client-side engine.
 */
const videoCrop: Tool = {
  slug: "video-crop",
  title: "Video Cropper",
  description:
    "Crop video online in your browser, drag a box over a live preview or pick an aspect preset (1:1, 9:16, 4:5, 16:9) to reframe the picture, then download the cropped clip. No uploads, no account, no watermark.",
  category: "video-tools",
  group: "Edit",
  icon: "Crop",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",

  h1: "Crop Video Online, Reframe & Cut the Edges, Free",
  tagline:
    "Drop an MP4, MOV, WebM or MKV, drag a crop box over a live preview (or snap to a 1:1, 9:16, 4:5 or 16:9 preset) and export just the region you framed. Powered by FFmpeg compiled to WebAssembly, it runs 100% in your browser: your footage is never uploaded, and the download carries no watermark.",
  longDescription:
    "The GigAI Video Cropper reframes a clip the way a good editor would, without the account, the install or the upload. Drop a video and it probes the file locally, shows it in a scrubbable player, and lays a draggable crop box over the picture. Push the box around, pull its handles to resize, or tap an aspect preset: square for a feed post, 9:16 for a Reel or Short, 4:5 for the tall in-feed slot, 16:9 to letterbox back to widescreen, and a dimmed overlay shows exactly what gets kept and what falls away. The readout tracks the crop in the video's real pixels the whole time, so a 1080-wide source crops to honest, even dimensions rather than a guess. When you export, a self-hosted FFmpeg WebAssembly core cuts precisely that rectangle and hands the result straight back as a download, with the new file size shown next to the original. Because every step happens on your own machine, personal recordings, client footage and anything under NDA never leave the tab, there's no upload bar reaching for the cloud, no queue behind other people's jobs, and no logo stamped across your result. It's honest about the trade-offs: WASM FFmpeg is single-threaded and memory-bound, so it's slower than a desktop app and happiest with files up to roughly a few hundred megabytes. A live progress bar shows where the crop stands the whole way through. Common jobs it nails: chopping black bars (pillarboxing or letterboxing) off a mismatched export, turning a landscape clip into a square or vertical one for social, tightening the frame onto a subject, and cutting a distracting edge out of a screen recording. Close the tab and every trace is gone.",

  ctaText: "Crop video",

  keywords: [
    "crop video online",
    "video cropper",
    "crop video free",
    "crop mp4 online",
    "crop video no watermark",
    "make video square online",
    "crop video to 9:16",
    "vertical video cropper",
    "remove black bars from video",
    "crop video in browser",
    "reframe video online",
    "crop video without uploading",
  ],

  seo: {
    title: "Crop Video Online, Free Video Cropper, No Watermark | GigAI Tools",
    description:
      "Free online video cropper: drag a crop box over a live preview or snap to 1:1, 9:16, 4:5 or 16:9, then download the reframed clip. MP4, MOV, WebM & MKV, 100% in your browser, no uploads, no watermark.",
  },

  features: [
    {
      icon: "Crop",
      title: "Draggable crop box over a live preview",
      description:
        "Drag the box to move it and pull its corners or edges to resize, right on top of your actual footage. A dimmed overlay masks everything outside the region so what you're keeping is unmistakable.",
    },
    {
      icon: "LayoutGrid",
      title: "One-tap aspect presets",
      description:
        "Snap the crop to 1:1 (square), 9:16 (Reels/Shorts), 4:5 (tall feed), 16:9 (widescreen), or stay free-form. Each preset centres a maximal box in that ratio so social exports fit the first time.",
    },
    {
      icon: "Ruler",
      title: "Real-pixel readout",
      description:
        "The crop is measured in the video's true resolution, not preview pixels, and snaps to even dimensions the encoder needs, so a crop off a 1920×1080 source lands on exact, valid output sizes.",
    },
    {
      icon: "Gauge",
      title: "Honest live progress",
      description:
        "A determinate progress bar tracks the crop from start to finish, with a one-time note for the first-run engine download. No spinner that leaves you guessing whether it stalled.",
    },
    {
      icon: "Download",
      title: "Preview, size delta & one-click download",
      description:
        "Play the cropped result before you save it and see the new file size next to the original, then download the clip. No sign-up, no email, no watermark.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "A self-hosted FFmpeg WebAssembly core does the cropping on your device. Your video is never uploaded, queued or stored, which keeps personal, client and NDA footage private.",
    },
  ],

  benefits: [
    {
      title: "Reframe for any platform in seconds",
      description:
        "Turn one landscape clip into a square, a 9:16 vertical or a 4:5 in-feed cut without opening a heavyweight editor. The presets do the aspect math and centre the box for you.",
    },
    {
      title: "Kill black bars and dead edges",
      description:
        "Pillarboxed or letterboxed export? Drag the box in to the real picture and crop the bars away, or tighten the frame onto your subject and drop a distracting edge.",
    },
    {
      title: "Keep private footage private",
      description:
        "The usual online cropper hands your file to a random server. Here the crop runs on your machine, so recordings of your family, your clients or anything confidential never leave the tab.",
    },
    {
      title: "No watermark, no account, no cap",
      description:
        "Free video croppers love to brand your export or gate the download behind a sign-up. This one just gives you the reframed clip: clean, unbranded, and as often as you like.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM or MKV onto the workspace, or click to browse. It's read and probed locally: nothing is uploaded.",
    },
    {
      title: "Frame the crop",
      description:
        "Drag the crop box over the preview and pull its handles to resize, or tap an aspect preset (1:1, 9:16, 4:5, 16:9) to snap to a ratio. The area outside the box dims so you see exactly what's kept.",
    },
    {
      title: "Crop & preview",
      description:
        "Hit Crop and watch the progress bar. When it finishes, the reframed clip plays back so you can confirm the composition before you save.",
    },
    {
      title: "Download",
      description:
        "Download the cropped video (clean and watermark-free) and check the new size against the original right there on the result card.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI"],
    output: ["MP4", "WebM", "MKV"],
  },

  useCases: [
    {
      audience: "Social creator",
      title: "Make a landscape clip vertical",
      description:
        "Snap to 9:16 and drag the box onto the action to turn a widescreen recording into a Reel- or Short-ready vertical, without re-shooting or firing up an editor.",
    },
    {
      audience: "Marketer",
      title: "Cut one master into every ratio",
      description:
        "Crop a single hero video to 1:1 for the feed and 4:5 for the tall placement, previewing each frame so the subject stays centred across every export.",
    },
    {
      audience: "Screen-recorder",
      title: "Trim the browser chrome away",
      description:
        "Crop the tabs, taskbar and desktop clutter out of a screen capture so only the app you're demoing is in frame, tighter, cleaner, and lighter to share.",
    },
    {
      audience: "Anyone",
      title: "Remove black bars",
      description:
        "Drag the box in past the pillarboxing or letterboxing on a mismatched clip and export just the real picture. No bars, no re-encode in a desktop app.",
    },
  ],

  troubleshooting: [
    {
      problem: "The first crop takes a while before the progress bar moves.",
      solution:
        "The very first run downloads the FFmpeg WebAssembly engine (a one-time fetch that's then cached). You'll see a 'loading engine' note during that step. Later crops skip it and start immediately.",
    },
    {
      problem: "It slowed to a crawl or ran out of memory on a big file.",
      solution:
        "In-browser FFmpeg is single-threaded and works in your tab's memory, so very large or long high-bitrate clips are demanding. Keep inputs loosely under a few hundred megabytes. On a huge file, trim it shorter first, then crop.",
    },
    {
      problem: "The output dimensions came out a pixel different from what I dragged.",
      solution:
        "Video encoders require even width and height, so the crop snaps each dimension to the nearest even number of source pixels. It's at most a one-pixel adjustment and keeps the file valid. The readout shows the exact size that will be written.",
    },
    {
      problem: "My video won't load or preview.",
      solution:
        "The player relies on codecs your browser can decode. Unusual professional or DRM-protected formats may not preview. Try a mainstream container like MP4 or WebM, or convert the file first with the Video Converter.",
    },
  ],

  tips: [
    "Tap an aspect preset first to lock the ratio, then drag the whole box to slide it over the part of the frame you want: the shape stays fixed.",
    "For social, 9:16 is Reels/Shorts/TikTok, 1:1 is a square feed post, and 4:5 is the tall in-feed slot that takes up the most screen.",
    "To strip black bars cleanly, switch to Free-form and pull each edge in until the box hugs the real picture.",
    "Cropping smaller also makes the file smaller: fewer pixels per frame means a lighter export, handy before you text or email a clip.",
    "Keep inputs under a few hundred megabytes for the snappiest crop. The first run also downloads the engine once, so give crop #1 a moment.",
  ],

  security:
    "Your video is read, probed, previewed and cropped entirely in your browser using a self-hosted FFmpeg WebAssembly core. It is never uploaded to any server, queued, logged or stored. That makes the cropper safe for personal recordings, client footage and anything under NDA. There's no account and no watermark, and once the engine has loaded the tool keeps working offline. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The cropper runs a self-hosted build of FFmpeg compiled to WebAssembly, so reading, previewing and cropping all happen on your own device inside the browser tab. Your footage is never uploaded, queued behind other jobs, logged or stored, which is why there's no upload bar reaching out to the cloud and no watermark on the result. It's safe for personal, client and confidential clips.",
    },
    {
      question: "How large a video can I crop in the browser?",
      answer:
        "Because everything runs in your tab's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. As a loose rule, files up to roughly a few hundred megabytes are comfortable on a typical laptop. Very long or high-bitrate 4K clips can strain memory or slow down. If a big file struggles, trim it shorter first and then crop, and the tool shows a live progress bar so you always know where the crop stands.",
    },
    {
      question: "Which aspect ratios can I crop to?",
      answer:
        "One-tap presets cover 1:1 (square), 9:16 (Reels/Shorts/TikTok), 4:5 (tall in-feed) and 16:9 (widescreen), or you can stay in Free-form and drag any rectangle you like. Each preset centres the largest box of that ratio that fits your video, then you slide it to frame the shot, so a social export lands on the right dimensions without doing the aspect math yourself.",
    },
    {
      question: "Does cropping reduce quality or add a watermark?",
      answer:
        "There's never a watermark. The clip you download is your footage reframed to the box you drew, with no logo, stamp or overlay. Cropping does re-encode the video to write the new frame size, which is technically lossy, but at sensible settings it's visually faithful and you won't notice a difference in normal viewing. Fewer pixels per frame usually makes the cropped file smaller, too.",
    },
    {
      question: "How do I remove black bars from a video?",
      answer:
        "Switch to Free-form and drag each edge of the crop box inward until it hugs the real picture, leaving the pillarboxing or letterboxing outside the box, then crop. The dimmed overlay shows exactly what falls away, so you can trim the bars right up to the frame without guessing at pixel values.",
    },
    {
      question: "Why is the first crop slower than the ones after it?",
      answer:
        "The first time you crop a clip, the tool downloads the FFmpeg WebAssembly engine once and caches it: you'll see a brief 'loading engine' note while that happens. Every crop after that skips the download and starts straight away. It's also why the tool can keep working offline once you've used it in a session.",
    },
    {
      question: "Which video formats can I crop?",
      answer:
        "The mainstream web and mobile containers: MP4, MOV, WebM, MKV and AVI, carrying common codecs like H.264, VP8/VP9 and their usual audio tracks. The output stays in a broadly compatible container. Exotic professional or DRM-protected formats may not preview or crop, for those, convert to MP4 or WebM first with the Video Converter, then crop the result.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's nothing to download, no plugin and no sign-up. Open the page in any modern browser (Chrome, Edge, Firefox or Safari), drop a clip in and crop. The FFmpeg engine is fetched once on first use and cached, after which cropping works on demand: including offline for a tool you've already opened.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, drag-and-drop input, scrubbable preview, draggable/resizable crop box with a dimmed overlay, real-pixel readout, in-browser FFmpeg WebAssembly cropping, live progress, preview, before/after size and watermark-free download.",
    },
    {
      date: "2026-06-23",
      change:
        "Added one-tap aspect presets (1:1, 9:16, 4:5, 16:9) that centre a maximal box in each ratio, plus a Free-form mode for arbitrary rectangles.",
    },
    {
      date: "2026-06-30",
      change:
        "Snapped output width/height to even source pixels for valid encodes and clarified the large-file guidance so heavy clips warn before they start rather than mid-crop.",
    },
  ],

  relatedTools: [
    "video-trimmer",
    "video-compressor",
    "video-converter",
    "video-to-gif",
  ],
};

export default videoCrop;
