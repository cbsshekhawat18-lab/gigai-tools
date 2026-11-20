import type { Tool } from "@/types";

/**
 * Video Reverse, play a clip backwards, picture and sound together, entirely in
 * the browser. Drop a video, hit reverse, and a self-hosted FFmpeg WebAssembly
 * core rewrites the frames (and the audio, unless the source is silent) in the
 * opposite order, then hands back a clean, watermark-free download beside a live
 * preview. Every string below targets the exact queries people type when they
 * want a boomerang, a rewind gag, a satisfying un-pour or a reverse-reveal -
 * nothing is shared with the trimmer/compressor/GIF copy, and no claim outruns
 * what single-threaded ffmpeg.wasm actually does. It is honest that a full
 * reverse buffers the clip in memory, so it favours shorter inputs.
 */
const videoReverse: Tool = {
  slug: "video-reverse",
  title: "Reverse Video",
  description:
    "Reverse a video online in your browser, play the footage and its audio backwards, preview the result, and download it. MP4, MOV, WebM and MKV, no uploads, no account, no watermark.",
  category: "video-tools",
  group: "Edit",
  icon: "Rewind",
  accent: "indigo",
  status: "live",
  featured: false,
  createdAt: "2026-06-16",

  h1: "Reverse Video Online: Play a Clip Backwards, Free",
  tagline:
    "Drop an MP4, MOV, WebM or MKV and get it back playing in reverse, frames and sound flipped end-to-end. Powered by FFmpeg compiled to WebAssembly, it runs 100% in your browser: your footage is never uploaded, and the download carries no watermark.",
  longDescription:
    "The GigAI Reverse Video tool does one playful, oddly-satisfying thing properly: it turns a clip around so the last frame becomes the first and time runs backwards. Drop a video and it's read and probed on your own machine. No upload bar, no queue. Choose whether to reverse the audio along with the picture (the default, for that classic backwards-talking effect) or keep it silent, then run it. A self-hosted FFmpeg WebAssembly core walks the frames in reverse order and, when there's a soundtrack, reverses the audio stream too, so a pour becomes an un-pour, a jump becomes a landing, and a countdown counts up. When it finishes, the reversed clip plays back in the workspace so you can confirm the effect before you save, and the download is your footage: clean, unbranded, and free. Because everything happens in your browser, personal recordings, client footage and anything private never leave the tab. There's no account, no email wall and nothing stored. It's honest about the trade-off, too: reversing needs the whole clip decoded and held in your tab's memory to play it back-to-front, so it's single-threaded, slower than a desktop editor, and happiest with shorter inputs up to roughly a couple hundred megabytes. A live progress bar shows exactly where the render stands the whole way through. Close the tab and every trace is gone.",

  ctaText: "Reverse video",

  keywords: [
    "reverse video",
    "reverse video online",
    "play video backwards",
    "video reverser",
    "reverse mp4 online",
    "reverse video free",
    "reverse video no watermark",
    "backwards video maker",
    "reverse video in browser",
    "reverse video with sound",
    "rewind video online",
    "boomerang video maker",
  ],

  seo: {
    title: "Reverse Video Online, Play a Clip Backwards Free (No Watermark) | GigAI Tools",
    description:
      "Free online video reverser: play any clip backwards with its audio, preview the result and download it. MP4, MOV, WebM & MKV, 100% in your browser, no uploads, no watermark.",
  },

  features: [
    {
      icon: "Rewind",
      title: "True end-to-end reverse",
      description:
        "Not a playback trick: the tool rewrites the frames in reverse order so the last frame becomes the first, giving you a real backwards video file you can share, loop or drop into an edit anywhere.",
    },
    {
      icon: "Volume2",
      title: "Reverse the sound too, or mute it",
      description:
        "Flip the audio along with the picture for the classic backwards-talk effect, or switch it off for a clean silent reverse. Your choice, one toggle, decided before you run.",
    },
    {
      icon: "Eye",
      title: "Preview before you save",
      description:
        "The reversed clip plays back in the workspace the moment it's done, so you can confirm the effect landed the way you wanted before committing to a download.",
    },
    {
      icon: "Gauge",
      title: "Honest live progress",
      description:
        "A determinate progress bar tracks the render start to finish, with a one-time note for the first-run engine download. No mystery spinner that leaves you guessing whether it stalled.",
    },
    {
      icon: "Download",
      title: "Clean, watermark-free download",
      description:
        "Save the reversed video with no logo, no stamp and no sign-up: just your footage, running backwards, in a broadly compatible container.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "A self-hosted FFmpeg WebAssembly core does the reversing on your device. Your video is never uploaded, queued or stored, which keeps personal, client and NDA footage private.",
    },
  ],

  benefits: [
    {
      title: "Keep the clip on your device",
      description:
        "Most online reversers make you hand the file to a stranger's server. Here the render runs on your own machine, so anything personal or confidential never leaves the browser tab.",
    },
    {
      title: "No watermark, no account, no cap",
      description:
        "Free reversers love to brand the export or gate the download behind a sign-up. This one just gives you the backwards clip: unmarked, and as many times as you like.",
    },
    {
      title: "Sound flips too",
      description:
        "Getting the audio to run backwards is where cheap tools fall over. This one reverses the soundtrack in step with the picture, so the effect is complete. Not a silent gimmick.",
    },
    {
      title: "Nothing to install",
      description:
        "No desktop editor, no plugin, no FFmpeg command line to memorise. Open the page in any modern browser and you're reversing in seconds. It even works offline once the engine has loaded.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM or MKV onto the workspace, or click to browse. It's read and probed locally. Nothing is uploaded.",
    },
    {
      title: "Choose the audio",
      description:
        "Leave 'Reverse audio too' on for the full backwards effect, or turn it off for a clean silent reverse. That's the only decision to make.",
    },
    {
      title: "Reverse & preview",
      description:
        "Hit Reverse and watch the progress bar. When it finishes, the backwards clip plays so you can check the effect before you save.",
    },
    {
      title: "Download",
      description:
        "Download the reversed video, clean and watermark-free, and compare the new size to the original right on the result card.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI"],
    output: ["MP4", "WebM", "MKV"],
  },

  useCases: [
    {
      audience: "Content creator",
      title: "Make a boomerang or rewind gag",
      description:
        "Reverse a jump, a pour or a reveal for a loop or a punchline, then post it straight to a short. No desktop editor, no upload to some random site first.",
    },
    {
      audience: "Marketer",
      title: "Un-build the product shot",
      description:
        "Play an assembly, an unboxing or a splash in reverse to make it feel deliberate and magical for an ad or a hero loop, framing the exact moment it lands.",
    },
    {
      audience: "Educator / Curious mind",
      title: "Watch a process backwards",
      description:
        "Flip a demo, an experiment or a motion clip to study how it un-happens, or to show cause and effect in reverse for a lesson.",
    },
    {
      audience: "Anyone",
      title: "Do the classic backwards-talk clip",
      description:
        "Reverse a short of yourself talking, keep the audio flipped, and share the eerie backwards-speech effect, with the whole thing rendered privately in your tab.",
    },
  ],

  troubleshooting: [
    {
      problem: "The first reverse waits a while before the progress bar moves.",
      solution:
        "The very first run downloads the FFmpeg WebAssembly engine (a one-time fetch that's then cached). You'll see a 'loading engine' note during that step. Every reverse after it skips the download and starts rendering right away.",
    },
    {
      problem: "It slowed down or ran out of memory on a long clip.",
      solution:
        "Reversing has to buffer the whole clip in memory to play it back-to-front, and in-browser FFmpeg is single-threaded, so long or high-bitrate 4K files are demanding. Trim the clip shorter first, then reverse the result, a shorter input reverses far faster.",
    },
    {
      problem: "The audio didn't reverse.",
      solution:
        "Check that 'Reverse audio too' is on and that the source actually has a soundtrack: a screen recording or muted export has no audio to flip. If the container has an unusual audio codec, convert to MP4 first and try again.",
    },
    {
      problem: "My video won't load or preview.",
      solution:
        "The player relies on codecs your browser can decode. Very unusual, professional or DRM-protected formats may not preview. Try a mainstream container like MP4 or WebM, or convert the file first with the Video Converter.",
    },
  ],

  tips: [
    "Reverse is memory-hungry because the whole clip is buffered. Trim to just the part you want to flip first, then reverse the shorter result for a much faster render.",
    "Leave 'Reverse audio too' on for the classic backwards-speech effect. Turn it off when you only want the visual and plan to add your own sound later.",
    "For a seamless boomerang, reverse a clip and play the original followed by the reversed copy, the motion bounces without a visible cut.",
    "Keep inputs under roughly a couple hundred megabytes for the snappiest results. The first run also downloads the engine once, so give reverse #1 a moment.",
    "Need a different container as well? Reverse here first, then run the result through the Video Converter: a shorter reversed clip converts faster too.",
  ],

  security:
    "Your video is read, probed, previewed and reversed entirely in your browser using a self-hosted FFmpeg WebAssembly core. It is never uploaded to any server, queued, logged or stored. That makes the reverser safe for personal recordings, client footage and anything under NDA. There's no account and no watermark, and once the engine has loaded the tool keeps working offline. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The reverser runs a self-hosted build of FFmpeg compiled to WebAssembly, so reading, previewing and reversing all happen on your own device inside the browser tab. Your footage is never uploaded, queued behind other jobs, logged or stored, which is exactly why there's no upload bar reaching out to the cloud and no watermark on the result. It's safe for personal, client and confidential clips.",
    },
    {
      question: "How long a video can I reverse in the browser?",
      answer:
        "Reversing is more memory-hungry than most operations because the whole clip has to be decoded and held in your tab's memory to play it back-to-front, so the practical ceiling is your device's RAM. As a loose rule, short clips up to roughly a couple hundred megabytes are comfortable on a typical laptop. Long or high-bitrate 4K videos can strain memory or slow right down. If a big file struggles, trim it shorter first and reverse the result. A live progress bar shows exactly where the render stands throughout.",
    },
    {
      question: "Does it reverse the audio too?",
      answer:
        "Yes, if you want it to. Leave 'Reverse audio too' switched on and the soundtrack is flipped in step with the picture: that's what produces the classic eerie backwards-speech effect. Turn it off for a clean silent reverse (useful when you'll add your own music later). If the source has no audio track, there's simply nothing to reverse and the output stays silent either way.",
    },
    {
      question: "Does the reversed video have a watermark?",
      answer:
        "Never. The clip you download is your footage played backwards. No logo, no stamp, no overlay of any kind. There's also no sign-up, no email wall and no usage cap. Because the processing happens on your device, there's no per-file cost to us, so there's nothing to gate.",
    },
    {
      question: "Which video formats can I reverse?",
      answer:
        "The mainstream web and mobile containers: MP4, MOV, WebM, MKV and AVI, carrying common codecs like H.264, VP8/VP9 and their usual audio tracks. The output stays in a broadly compatible container. Exotic professional or DRM-protected formats may not preview or reverse, for those, convert the file to MP4 or WebM first with the Video Converter and then reverse the result.",
    },
    {
      question: "Will reversing reduce my video's quality?",
      answer:
        "To rewrite the frames in the opposite order the reverser re-encodes the clip, which is technically lossy but visually faithful. You won't notice a difference in normal viewing. The one thing to know is that reversing is a full re-render rather than a copy, so it takes real time. The result is a proper backwards file, not a playback trick that only works in one player.",
    },
    {
      question: "Why is the first reverse slower than the ones after it?",
      answer:
        "The first time you reverse a clip, the tool downloads the FFmpeg WebAssembly engine once and caches it: you'll see a brief 'loading engine' note while that happens. Every reverse after that skips the download and starts rendering straight away. It's also why the tool can keep working offline once you've used it in a session.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's nothing to download, no plugin and no sign-up. Open the page in any modern browser (Chrome, Edge, Firefox or Safari), drop a clip in and reverse it. The FFmpeg engine is fetched once on first use and cached, after which reversing works on demand, including offline for a tool you've already opened.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, drag-and-drop input, in-browser FFmpeg WebAssembly reversing of both video and audio, optional audio-reverse toggle, live progress, preview, before/after size and watermark-free download.",
    },
    {
      date: "2026-06-22",
      change:
        "Added the 'Reverse audio too' toggle for a clean silent reverse, and clearer large-file guidance so long clips warn before they start rather than mid-render.",
    },
    {
      date: "2026-06-29",
      change:
        "Improved probing for MOV/MKV sources and a smoother first-run engine-loading note on the first reverse.",
    },
  ],

  relatedTools: [
    "video-trimmer",
    "video-compressor",
    "change-video-speed",
    "video-to-gif",
  ],
};

export default videoReverse;
