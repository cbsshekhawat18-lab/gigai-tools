import type { Tool } from "@/types";

/**
 * Video Resizer, change a clip's resolution (scale it up or, far more often,
 * down) entirely in the browser with a self-hosted FFmpeg (WebAssembly) core.
 * Pick a preset (1080p / 720p / 480p / 360p) or type a custom width/height,
 * keep the aspect ratio locked, choose how the frame fits when the target
 * shape differs (fit-and-pad, fill-and-crop, or stretch), then re-encode and
 * download. Every string is written for the real queries people type when a
 * video is the wrong SIZE for a platform, a slide, an email cap or an old
 * device (not shared with the compressor, crop or GIF copy) and no claim
 * outruns what single-threaded ffmpeg.wasm actually does (slower than native,
 * memory-bound, honest about it).
 */
const videoResizer: Tool = {
  slug: "video-resizer",
  title: "Video Resizer",
  description:
    "Resize video resolution in your browser with FFmpeg: scale MP4, MOV, WebM and MKV to 1080p, 720p, 480p or a custom width and height, lock the aspect ratio or fit-and-pad, then download. Nothing is uploaded.",
  category: "video-tools",
  group: "Edit",
  icon: "Scaling",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",

  h1: "Video Resizer, Change Video Resolution Online with FFmpeg",
  tagline:
    "Scale a clip to 1080p, 720p, 480p or any exact width and height you type. Lock the aspect ratio so nothing stretches, or fit-and-pad it into a new shape, real FFmpeg re-encoding with a live preview, right in your browser and never uploaded.",
  longDescription:
    "The GigAI Video Resizer runs a full FFmpeg build compiled to WebAssembly directly inside your browser tab, so it can re-scale a video's resolution without ever sending your footage to a server. Downscaling is the everyday job: a 4K phone recording is overkill for a 720p upload cap, a 1080p screen capture is heavier than a support ticket needs, and an old device or embedded player only wants 480p. Drop your file and either tap a preset height (2160p, 1440p, 1080p, 720p, 480p, 360p) or type a custom width and height. Keep 'Lock aspect ratio' on and you only need one dimension: the other is computed for you and the encoder snaps it to an even number so H.264 stays happy. When your target shape differs from the source (say, squeezing a widescreen clip into a square slot), choose a fit mode: Contain letterboxes the whole picture with padding so nothing is cut, Cover fills the frame and trims the overflow, and Stretch forces the exact box even if it distorts. The tool transcodes to a broadly-compatible H.264/AAC MP4 (WebM stays WebM) with faststart for instant web playback, then hands you a preview player and the exact output size before you download. Because everything is client-side there's no upload wait and no privacy tradeoff: personal, confidential or unreleased footage never leaves your machine. Be honest with yourself about the engine: WebAssembly FFmpeg is meaningfully slower than a native app and it is memory-bound, so a short clip is quick while a large 4K source takes real time and a determinate progress bar keeps you posted. Close the tab and every byte is gone.",

  ctaText: "Resize video",

  keywords: [
    "video resizer",
    "resize video online",
    "change video resolution",
    "scale video",
    "downscale video",
    "resize mp4",
    "convert 4k to 1080p",
    "1080p to 720p",
    "make video smaller resolution",
    "video resolution converter",
    "resize video keep aspect ratio",
    "browser video resizer",
  ],

  seo: {
    title: "Video Resizer, Change Video Resolution Online Free | GigAI Tools",
    description:
      "Free online video resizer powered by FFmpeg. Scale MP4, MOV, WebM and MKV to 1080p, 720p, 480p or a custom size, lock the aspect ratio or fit-and-pad: 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Scaling",
      title: "Presets or an exact custom size",
      description:
        "Tap a standard height (2160p, 1440p, 1080p, 720p, 480p or 360p) or type your own width and height in pixels when you need to hit a precise box.",
    },
    {
      icon: "Lock",
      title: "Aspect-ratio lock",
      description:
        "Leave the ratio locked and set just one dimension. The other is computed from your source so the picture never looks squashed or stretched. Unlock it only when you deliberately want a new shape.",
    },
    {
      icon: "LayoutGrid",
      title: "Three fit modes for shape changes",
      description:
        "When the target shape differs, choose Contain (letterbox, keep everything), Cover (fill the frame, trim the edges) or Stretch (force the exact box): each is explained inline so you pick with intent.",
    },
    {
      icon: "Cpu",
      title: "Real FFmpeg, in your browser",
      description:
        "A full FFmpeg build compiled to WebAssembly rescales with the same libswscale filters desktop tools use, encodes H.264/AAC and even-snaps dimensions for you. No upload, no account, no install.",
    },
    {
      icon: "CirclePlay",
      title: "Preview before you download",
      description:
        "The resized result plays right in the page so you can confirm the framing, sharpness and any padding look right before you commit, the check a command line never gives you.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Rescaling happens on your device with a self-hosted engine. Personal recordings, unreleased footage and confidential captures are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Fit any platform's resolution rules",
      description:
        "Uploaders, ad networks, LMS players and embeds all have a max (or preferred) resolution. Downscale in one pass so your clip is accepted and plays smoothly instead of being rejected or re-encoded badly.",
    },
    {
      title: "Lighter files as a side effect",
      description:
        "Fewer pixels means fewer bytes. Going 4K → 1080p or 1080p → 720p usually cuts the file size substantially on its own, which is often all you need before an upload or an email.",
    },
    {
      title: "Never stretch or squash by accident",
      description:
        "The aspect lock and the fit modes make distortion a deliberate choice, not a mistake. You always know whether the picture is padded, cropped or forced.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server resizers make you upload the big file first and trust them with it. Here the video never leaves your browser, so there's no upload bar and nothing to trust.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM, MKV or other common video onto the workspace, or click to browse. It's read locally and you'll see its size, duration and current resolution immediately.",
    },
    {
      title: "Pick a size",
      description:
        "Tap a preset height or type a custom width and height. With the aspect ratio locked you only need one dimension, the other fills in automatically.",
    },
    {
      title: "Choose a fit (if the shape changes)",
      description:
        "If your target isn't the source's shape, pick Contain, Cover or Stretch. The first run loads the FFmpeg engine once, a one-time moment.",
    },
    {
      title: "Resize & download",
      description:
        "Press Resize and watch the determinate progress bar. Play the preview to confirm it looks right, read the output size, then download, or reset and try another target.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI", "M4V"],
    output: ["MP4", "WebM"],
  },

  useCases: [
    {
      audience: "Creator / Marketer",
      title: "Match a platform's resolution",
      description:
        "A shot-in-4K reel or a 1080p promo needs to be 720p for a size cap or a faster upload. Drop to the target height in one pass, aspect intact, and ship it.",
    },
    {
      audience: "Developer / QA",
      title: "Shrink a screen recording's resolution",
      description:
        "A 4K screen capture of a repro is enormous. Scale it to 720p so it drops cleanly into a GitHub issue or a Jira ticket without blowing the attachment limit.",
    },
    {
      audience: "Educator / Presenter",
      title: "Fit a clip into a slide or an old player",
      description:
        "Legacy classroom hardware and embedded LMS players choke on high-res video. Downscale to 480p so it plays smoothly where the big file simply stutters.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Rescale sensitive footage locally",
      description:
        "Personal, medical or confidential recordings shouldn't be uploaded to a stranger's server just to change resolution. Do it entirely in your browser so nothing ever leaves the device.",
    },
  ],

  troubleshooting: [
    {
      problem: "The resized video has black bars around it.",
      solution:
        "That's the Contain fit padding your clip into a target shape that doesn't match the source. Switch to Cover to fill the frame (it trims the overflow instead), or leave the aspect ratio locked and set only one dimension so the output keeps the original shape and needs no padding.",
    },
    {
      problem: "The picture looks stretched or squashed.",
      solution:
        "You likely have the aspect lock off with a mismatched width/height, or you chose Stretch. Turn 'Lock aspect ratio' back on and set just one dimension, or pick Contain / Cover so the true proportions are preserved.",
    },
    {
      problem: "It's taking a long time on my 4K video.",
      solution:
        "Expected. This is FFmpeg compiled to WebAssembly, which is slower than native and memory-bound, and rescaling a high-resolution source is heavy. Keep the tab focused, watch the progress bar, and for very large files trim the clip's length first or choose a smaller target.",
    },
    {
      problem: "The tab ran out of memory on a large file.",
      solution:
        "WASM has a memory ceiling. Close other heavy tabs and retry. If it still fails the source is likely too large for in-browser encoding: shorten it first or start from a lower-resolution copy. As a loose guide, keep inputs under a few hundred MB.",
    },
  ],

  tips: [
    "Downscaling is what you almost always want: set a preset height at or below your source's and let the width follow automatically.",
    "Keep 'Lock aspect ratio' on for the cleanest result. Only turn it off when you truly need to reshape the frame.",
    "Choose Cover when you must fill an exact box and can lose a little from the edges. Choose Contain when nothing may be cut and padding is acceptable.",
    "Upscaling (going higher than the source) won't add real detail. It just enlarges existing pixels, so expect softness.",
    "The FFmpeg engine loads once per session on your first resize. After that, subsequent runs skip straight to encoding.",
  ],

  security:
    "Your video is read and re-encoded entirely in your browser using a self-hosted FFmpeg (WebAssembly) engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely resize personal, confidential or unreleased footage. There's no upload step and no cloud copy. Close the tab and every byte is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. All decoding and re-encoding happen locally in your browser using a self-hosted FFmpeg build compiled to WebAssembly. Your file never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for personal or confidential footage.",
    },
    {
      question: "Why is resizing slower than a desktop app, and are there size limits?",
      answer:
        "Because this runs FFmpeg in WebAssembly inside your browser rather than as native code, and it's single-threaded and memory-bound. A short or low-resolution clip rescales in seconds. A large 4K source takes real time, and a determinate progress bar keeps you posted. As a loose guide, keep inputs under a few hundred MB. Very large files can exhaust the tab's memory, in which case trim or downscale the source first. The upside is total privacy: nothing is uploaded.",
    },
    {
      question: "Will resizing keep my video's aspect ratio?",
      answer:
        "Yes, if you keep 'Lock aspect ratio' on. Set one dimension and the other is computed from your source, so the picture keeps its true proportions. If your target shape differs from the source, the fit modes decide what happens: Contain letterboxes with padding, Cover fills and trims the edges, and Stretch forces the exact box even if it distorts.",
    },
    {
      question: "Can I make a video a higher resolution than it is?",
      answer:
        "You can enter a larger size, but upscaling can't invent detail that isn't in the source. It just enlarges the existing pixels, so the result looks softer or blockier than a true high-res original. Resizing is genuinely useful for downscaling. Treat upscaling as a last resort.",
    },
    {
      question: "What formats can I resize, and what do I get back?",
      answer:
        "You can drop common video formats, MP4, MOV, WebM, MKV, AVI, M4V and more. An MP4-family input comes back as a broadly-compatible H.264/AAC MP4 with faststart. A WebM input stays WebM. Dimensions are snapped to even numbers automatically because the encoders require it.",
    },
    {
      question: "Does resizing also make the file smaller?",
      answer:
        "Usually, yes. Fewer pixels means fewer bytes, so downscaling from 4K to 1080p or 1080p to 720p typically cuts the file size a lot on its own. If your goal is purely a smaller file at the same resolution, reach for the Video Compressor instead. If you need both, resize first, then compress.",
    },
    {
      question: "What's the difference between Contain, Cover and Stretch?",
      answer:
        "They only matter when your target shape differs from the source. Contain shrinks the whole picture to fit inside the box and pads the leftover space (black bars), keeping everything visible. Cover scales up until the box is full and trims whatever overflows, so no bars but you lose some edges. Stretch ignores proportions and forces the exact width and height, which can distort. When the aspect ratio is locked, none of these apply because the output already matches the source shape.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's no install, no plugin, no sign-up and no watermark. Open the page, drop a video, choose a size, and download, the FFmpeg engine loads automatically in the background the first time you run it.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, in-browser resolution scaling via self-hosted FFmpeg (WebAssembly), standard height presets, custom width/height, an aspect-ratio lock, a preview player and one-click download of a faststart MP4.",
    },
    {
      date: "2026-06-23",
      change:
        "Added the three fit modes (Contain / Cover / Stretch) for changing a clip's shape, with inline explanations, plus automatic even-dimension snapping and a clearer one-time engine-loading state.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the presets to compute width from the source when the ratio is locked, improved memory handling and honest guidance for large 4K files, and added drag-and-drop plus reset-and-retry to the workspace.",
    },
  ],

  relatedTools: [
    "video-compressor",
    "video-crop",
    "video-converter",
    "video-trimmer",
  ],
};

export default videoResizer;
