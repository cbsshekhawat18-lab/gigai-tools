import type { Tool } from "@/types";

/**
 * Video Rotate, fix a sideways clip in the browser. Drop a video shot in the
 * wrong orientation, pick a quarter-turn (90° right, 180° flip, or 90° left),
 * preview the corrected frame, and export it: decoded and rewritten entirely
 * on-device by a self-hosted FFmpeg WebAssembly core. Copy is written for the
 * exact "my video is sideways / upside down" queries people search, and every
 * claim is scoped to what `operations.rotate` actually does: true quarter-turn
 * rotation, not a metadata flag some players ignore. Nothing here is shared with
 * the trimmer/compressor/converter copy.
 */
const videoRotate: Tool = {
  slug: "video-rotate",
  title: "Video Rotate",
  description:
    "Rotate a video online in your browser, turn a sideways or upside-down clip 90°, 180° or 270°, preview the fix, and download it baked in. No uploads, no account, no watermark.",
  category: "video-tools",
  group: "Edit",
  icon: "RotateCw",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-14",

  h1: "Rotate Video Online, Fix a Sideways or Upside-Down Clip, Free",
  tagline:
    "Drop an MP4, MOV, WebM or MKV, choose a 90° right, 180° or 90° left turn, preview the corrected frame, and export the video with the rotation baked into the pixels. Powered by FFmpeg compiled to WebAssembly, it runs 100% in your browser: your footage is never uploaded and the download carries no watermark.",
  longDescription:
    "The GigAI Video Rotate tool fixes the single most annoying camera mistake there is: a clip recorded in the wrong orientation. You shot it in portrait and it plays sideways. You held the phone upside down and every player renders it flipped. A screen recording came out landscape when it needed to be tall. Drop the file and it's probed locally, previewed in a real player, and rotated on-screen the instant you pick a turn (90° clockwise, a 180° half-turn, or 90° counter-clockwise) so you confirm the fix on the actual frame before committing. When you export, a self-hosted FFmpeg WebAssembly core re-encodes the video with the rotation written straight into the pixels, not left as a container flag that some apps honour and others silently ignore. That distinction matters: a truly rotated file looks right everywhere (in a browser, in a phone gallery, in an editor, in an email preview) because there's no orientation metadata left to misread. Because everything happens on your own machine, personal recordings, client footage and anything under NDA never leave the tab: no upload bar reaching for the cloud, no queue behind other people's jobs, no watermark stamped on your result. It's honest about the trade-offs, too. WASM FFmpeg is single-threaded and memory-bound, so it's slower than a desktop app and happiest with files up to roughly a few hundred megabytes, with a live progress bar showing exactly where the rotation stands the whole way through. Close the tab and every trace is gone.",

  ctaText: "Rotate video",

  keywords: [
    "rotate video online",
    "rotate video",
    "video rotator",
    "rotate video 90 degrees",
    "flip video online",
    "fix sideways video",
    "rotate mp4 online",
    "turn video upside down",
    "rotate video free no watermark",
    "rotate video in browser",
    "rotate video without uploading",
    "rotate mov online",
  ],

  seo: {
    title: "Rotate Video Online, Fix Sideways or Upside-Down Video Free (No Watermark) | GigAI Tools",
    description:
      "Free online video rotator: turn a sideways or upside-down clip 90°, 180° or 270° and download it with the rotation baked in. MP4, MOV, WebM & MKV: 100% in your browser, no uploads, no watermark.",
  },

  features: [
    {
      icon: "RotateCw",
      title: "True quarter-turn rotation",
      description:
        "Turn the frame 90° clockwise, 180° for a full half-turn, or 90° counter-clockwise. The dimensions swap correctly on the 90° turns, so a portrait clip that plays sideways ends up genuinely upright.",
    },
    {
      icon: "Eye",
      title: "Live preview before you commit",
      description:
        "The player rotates on-screen the moment you pick a turn, so you're deciding on the actual frame, not guessing which way 270° lands, before a single byte is re-encoded.",
    },
    {
      icon: "Anchor",
      title: "Baked into the pixels, not a flag",
      description:
        "The export writes the rotation into the video stream itself and strips the orientation metadata, so the file looks right in every player instead of relying on a container hint some apps ignore.",
    },
    {
      icon: "Gauge",
      title: "Honest live progress",
      description:
        "A determinate progress bar tracks the re-encode from start to finish, and a one-time note covers the first-run engine download. No spinner that leaves you wondering whether it hung.",
    },
    {
      icon: "Download",
      title: "Preview, size & one-click download",
      description:
        "Play the rotated result before you save it and see the file size next to the original, then download the clip. No sign-up, no email, no watermark.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "A self-hosted FFmpeg WebAssembly core does the rotation on your device. Your video is never uploaded, queued or stored, which makes it safe for personal, client and NDA footage alike.",
    },
  ],

  benefits: [
    {
      title: "A rotation that sticks everywhere",
      description:
        "Some tools just flip an orientation tag, so the clip looks fixed in one app and sideways in the next. This bakes the turn into the frames, so it reads correctly in browsers, galleries, editors and email previews alike.",
    },
    {
      title: "Keep private footage private",
      description:
        "The usual way to rotate a clip online is to hand it to a random server. Here the re-encode runs on your machine, so recordings of your family, your clients or anything confidential never leave the tab.",
    },
    {
      title: "No watermark, no account, no cap",
      description:
        "Free video rotators love to stamp a logo across your export or gate the download behind a sign-up. This one just gives you the corrected clip: clean, unbranded, and as often as you like.",
    },
    {
      title: "Nothing to install",
      description:
        "No desktop editor, no phone app, no FFmpeg command line to memorise. Open the page in any modern browser and the fix takes seconds. It even works offline once the engine has loaded.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM or MKV onto the workspace, or click to browse. It's read and probed locally: nothing is uploaded.",
    },
    {
      title: "Pick a turn",
      description:
        "Choose 90° right, 180°, or 90° left. The preview rotates on-screen straightaway so you can confirm the corrected orientation on the real frame.",
    },
    {
      title: "Rotate & preview",
      description:
        "Hit Rotate and watch the progress bar. When it finishes, the rotated clip plays back so you're sure the fix is right before you save.",
    },
    {
      title: "Download",
      description:
        "Download the corrected video, clean and watermark-free, with the rotation baked into the pixels so it looks right in every player.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI"],
    output: ["MP4", "WebM", "MKV"],
  },

  useCases: [
    {
      audience: "Anyone with a phone",
      title: "Fix a sideways phone clip",
      description:
        "You filmed something quickly and the phone recorded it in the wrong orientation. Turn it upright and re-export so it plays correctly wherever you send it, without the footage ever touching a server.",
    },
    {
      audience: "Content creator",
      title: "Re-orient for the platform",
      description:
        "A clip shot landscape needs to sit inside a portrait edit, or vice versa. Rotate it to the right orientation before it goes into the timeline, so nothing plays sideways in the final cut.",
    },
    {
      audience: "Support / IT",
      title: "Straighten a screen recording",
      description:
        "A recording captured from a rotated display or a mounted device came out turned. Rotate it to true upright so the walkthrough is actually readable for whoever you send it to.",
    },
    {
      audience: "Anyone archiving footage",
      title: "Permanently correct old videos",
      description:
        "Bake the right orientation into old family or archive clips so they stop showing up sideways in galleries and backups that ignore rotation metadata.",
    },
  ],

  troubleshooting: [
    {
      problem: "The first rotation takes a while before the progress bar moves.",
      solution:
        "The very first run downloads the FFmpeg WebAssembly engine (a one-time fetch that's then cached). You'll see a 'loading engine' note during that step. Subsequent rotations skip it and start immediately.",
    },
    {
      problem: "The preview looks right but the downloaded file is still sideways in another app.",
      solution:
        "That usually means the other app was reading an old orientation flag. This tool bakes the rotation into the frames and strips that flag, so re-download the corrected file. It should read upright everywhere. If a cached copy lingers, clear it and re-open the new file.",
    },
    {
      problem: "It slowed to a crawl or ran out of memory on a big file.",
      solution:
        "In-browser FFmpeg is single-threaded and works in your tab's memory, so very large or long high-bitrate clips are demanding. Keep inputs loosely under a few hundred megabytes. On a huge file, trim it shorter first or close other heavy tabs.",
    },
    {
      problem: "My video won't load or preview.",
      solution:
        "The player relies on codecs your browser can decode. Very unusual or professional/DRM-protected formats may not preview. Try a mainstream container like MP4 or WebM, or convert the file first with the Video Converter.",
    },
  ],

  tips: [
    "Pick the turn and watch the preview rotate before you commit, it's the fastest way to be sure 90° left versus right is landing the way you want.",
    "For a full upside-down clip, choose 180° once rather than two 90° turns: same result, one re-encode.",
    "A 90° turn swaps width and height, so a landscape clip becomes portrait (and vice versa). That's expected. The preview shows the new shape before you export.",
    "For the snappiest results, keep inputs under a few hundred megabytes. The first run also downloads the engine once, so give rotation #1 a moment.",
    "Need to crop the re-oriented frame or shorten it too? Rotate here first, then run the result through the Video Cropper or Video Trimmer.",
  ],

  security:
    "Your video is read, probed, previewed and rotated entirely in your browser using a self-hosted FFmpeg WebAssembly core. It is never uploaded to any server, queued, logged or stored. That makes the rotator safe for personal recordings, client footage and anything under NDA. There's no account and no watermark, and once the engine has loaded the tool keeps working offline. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The rotator runs a self-hosted build of FFmpeg compiled to WebAssembly, so reading, previewing and rotating all happen on your own device inside the browser tab. Your footage is never uploaded, queued behind other jobs, logged or stored, which is exactly why there's no upload bar reaching out to the cloud and no watermark on the result. It's safe for personal, client and confidential clips.",
    },
    {
      question: "How large a video can I rotate in the browser?",
      answer:
        "Because everything runs in your tab's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. As a loose rule, files up to roughly a few hundred megabytes are comfortable on a typical laptop. Very long or high-bitrate 4K clips can strain memory or slow down. If a big file struggles, trim it shorter first, and the tool shows a live progress bar so you always know where the rotation stands.",
    },
    {
      question: "Does this bake the rotation in, or just set an orientation flag?",
      answer:
        "It bakes it in. Many quick rotators only flip a metadata tag in the container, which some players honour and others ignore, so the clip looks fixed in one app and sideways in the next. This tool re-encodes the actual frames rotated and strips the orientation metadata, so the corrected file reads upright everywhere: browsers, phone galleries, editors and email previews alike.",
    },
    {
      question: "Does the rotated video have a watermark?",
      answer:
        "Never. The clip you download is your footage turned to the orientation you chose. No logo, no stamp, no overlay of any kind. There's also no sign-up, no email wall and no usage cap. Because the processing happens on your device, there's no per-file cost to us, so there's nothing to gate.",
    },
    {
      question: "Which video formats can I rotate?",
      answer:
        "The mainstream web and mobile containers: MP4, MOV, WebM, MKV and AVI, carrying common codecs like H.264, VP8/VP9 and their usual audio tracks. The output stays in a broadly compatible container. Exotic professional or DRM-protected formats may not preview or rotate, for those, convert the file to MP4 or WebM first with the Video Converter and then rotate the result.",
    },
    {
      question: "Will rotating reduce my video's quality?",
      answer:
        "Rotating is technically lossy because the frames are re-encoded turned, but it's visually faithful. You won't see a difference in normal viewing. The audio is carried through unchanged and the geometry is exact (a 90° turn swaps width and height cleanly, with no cropping or stretching). If you're chaining edits, rotate last to keep the number of re-encodes down.",
    },
    {
      question: "Why is the first rotation slower than the ones after it?",
      answer:
        "The first time you rotate a clip, the tool downloads the FFmpeg WebAssembly engine once and caches it, you'll see a brief 'loading engine' note while that happens. Every rotation after that skips the download and starts straight away. It's also why the tool can keep working offline once you've used it in a session.",
    },
    {
      question: "Can I flip or mirror the video as well as rotate it?",
      answer:
        "This tool does true quarter-turn rotation (90° clockwise, 180°, and 90° counter-clockwise) which fixes almost every 'sideways or upside-down' case. A 180° turn handles a fully inverted clip. It doesn't currently do a horizontal mirror (a left–right flip), which is a different transform. We'd rather be upfront about that than fake a button that mislabels a rotation as a mirror.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release, drag-and-drop input, scrubbable player, live on-screen preview of 90°/180°/270° turns, in-browser FFmpeg WebAssembly re-encode with the rotation baked into the pixels, live progress, preview and watermark-free download.",
    },
    {
      date: "2026-06-21",
      change:
        "Added orientation-metadata stripping so corrected files read upright in players that previously ignored the rotation flag, plus a clearer one-time engine-loading note on the first rotation.",
    },
    {
      date: "2026-06-28",
      change:
        "Improved probing for MOV/MKV sources and tightened large-file guidance so heavy clips warn before they start rather than mid-encode.",
    },
  ],

  relatedTools: [
    "video-trimmer",
    "video-cropper",
    "video-compressor",
    "video-converter",
  ],
};

export default videoRotate;
