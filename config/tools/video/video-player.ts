import type { Tool } from "@/types";

/**
 * Video Player, the "Info" corner of the GigAI video suite: a polished,
 * private, in-browser player for local files. It processes nothing and uploads
 * nothing. No FFmpeg core, no re-encode, no download of your footage anywhere.
 * You drop a clip and it plays, with a real chrome on top: variable speed, A→B
 * loop, Picture-in-Picture, fullscreen and single-frame stepping. The copy
 * below is written for the exact searches people run when a downloaded video
 * won't open, when they need to scrub a recording frame by frame, or when they
 * simply don't want a "player" that phones a file home. None of it is shared
 * with the trimmer/compressor copy, and every claim matches what a pure
 * client-side `<video>` element can actually do.
 */
const videoPlayer: Tool = {
  slug: "video-player",
  title: "Video Player",
  description:
    "A clean, private video player that runs in your browser, play any local MP4, WebM, MOV or MKV with variable speed, A→B loop, Picture-in-Picture, fullscreen and frame-by-frame stepping. Nothing is uploaded, nothing is processed.",
  category: "video-tools",
  group: "Info",
  icon: "Play",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-14",

  h1: "Video Player, Play Any Local Video in Your Browser, Free",
  tagline:
    "Drop an MP4, WebM, MOV or MKV and it just plays, with a proper player on top: 0.25×–4× speed, A→B loop, frame-by-frame stepping, Picture-in-Picture and fullscreen. It opens your file directly in the browser's own video engine, so nothing is uploaded, re-encoded or stored. Close the tab and it's gone.",
  longDescription:
    "The GigAI Video Player is the tool you reach for when you just need to watch, scrub or study a video file you already have, without installing a media player, without a codec pack, and without handing the file to a website that 'plays' it by uploading it first. Drop a clip and it opens instantly in the browser's native decoder, wrapped in a control layer that a bare <video> tag never gives you: a scrub bar with buffered range, click-to-seek and a draggable thumb. Playback speed from a slow-motion 0.25× up to a skim-friendly 4×. An A→B loop so you can rewatch one passage on repeat. Single-frame Step Back / Step Forward for pixel-level review. Picture-in-Picture to pop the video into a floating window while you work, and fullscreen with a full keyboard map. Because it is only a player, there is no FFmpeg WebAssembly core to download and no processing to wait on: the 31 MB engine the rest of the suite uses is never fetched here. Your file is read locally through an object URL, decoded by the same pipeline that plays video on every other site you visit, and never sent anywhere: no upload bar, no server queue, no telemetry on what you're watching. That makes it genuinely safe for private recordings, unreleased edits, medical or legal footage and anything under NDA. It's honest about its one real limit, too. It can only play what your browser can decode. Mainstream MP4/H.264, WebM/VP9 and similar open in every modern browser. Some MKV containers, ProRes, or unusual/DRM-protected codecs won't, and for those the honest fix is to run the file through the Video Converter first and play the result here.",

  ctaText: "Open a video",

  keywords: [
    "video player",
    "online video player",
    "play video in browser",
    "browser video player",
    "local video player",
    "play mp4 online",
    "play webm online",
    "play mkv in browser",
    "video player no upload",
    "private video player",
    "frame by frame video player",
    "slow motion video player online",
    "loop video player",
    "html5 video player",
  ],

  seo: {
    title: "Video Player: Play Local MP4, WebM, MOV & MKV in Your Browser | GigAI Tools",
    description:
      "Free private video player that runs entirely in your browser. Play any local video with variable speed, A→B loop, frame-by-frame stepping, Picture-in-Picture and fullscreen. No upload, no install, no processing.",
  },

  features: [
    {
      icon: "Gauge",
      title: "Variable playback speed (0.25×–4×)",
      description:
        "Slow a fast demo to a quarter speed to catch every detail, or skim a long recording at 2× or 4×. Pitch-preserved where the browser supports it, and one tap back to normal.",
    },
    {
      icon: "StepForward",
      title: "Frame-by-frame stepping",
      description:
        "Pause and nudge one frame at a time, forward or back, to land on the exact moment. Read a licence plate, catch a glitch, or check a cut. No re-encode, just precise seeking.",
    },
    {
      icon: "Repeat",
      title: "A→B loop",
      description:
        "Set an in and an out point and the player loops just that passage on repeat: perfect for practising a move, transcribing a line, or reviewing one beat of an edit without touching the file.",
    },
    {
      icon: "PictureInPicture2",
      title: "Picture-in-Picture & fullscreen",
      description:
        "Pop the video into a floating always-on-top window while you work in another tab, or go true fullscreen for a distraction-free watch. Both are one click or one keystroke away.",
    },
    {
      icon: "Keyboard",
      title: "Full keyboard control",
      description:
        "Space/K play-pause, ←/→ to seek, ↑/↓ for volume, comma/period to step frames, M to mute and F for fullscreen. Every control is reachable and labelled for keyboard and screen-reader users.",
    },
    {
      icon: "Lock",
      title: "Nothing uploaded, nothing processed",
      description:
        "Your file plays through the browser's own decoder via a local object URL. There's no FFmpeg core to fetch, no server, and no re-encode: it's a viewer, not a pipeline, so it's instant and private.",
    },
  ],

  benefits: [
    {
      title: "Truly private playback",
      description:
        "Most 'online video players' upload your file to play it. This one never does: the clip is decoded on your machine and never leaves the tab, which makes it safe for unreleased, confidential or NDA footage.",
    },
    {
      title: "No install, no codec pack",
      description:
        "Skip the desktop media player and the codec hunt. If your browser can decode the file, it opens here in a second, with a nicer, more precise control layer than a raw video element.",
    },
    {
      title: "Built for close review",
      description:
        "Slow motion, frame stepping and A→B loop turn a passive player into a study tool: rewatch one passage, step to a single frame, or crawl a fast sequence to see exactly what happened.",
    },
    {
      title: "Instant. No engine to load",
      description:
        "Unlike the editing tools in this suite, the player never downloads the 31 MB WebAssembly core. There's nothing to compile and nothing to wait on. Drop a file and it plays immediately.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, WebM, MOV or MKV onto the workspace, or click to browse. It opens locally in the browser's video engine: nothing is uploaded or converted.",
    },
    {
      title: "Play and control it",
      description:
        "Use the on-screen controls or the keyboard to play, scrub, and set the volume. Reach for the speed menu, A→B loop, frame-step and Picture-in-Picture buttons as you need them.",
    },
    {
      title: "Review closely, or watch full-screen",
      description:
        "Drop to slow motion and step frame by frame for detail, loop a passage to rewatch it, or hit fullscreen / Picture-in-Picture to watch it your way.",
    },
    {
      title: "Load another",
      description:
        "Done? Click Change video to swap in another file. Nothing is saved between clips, and closing the tab clears everything.",
    },
  ],

  formats: {
    input: ["MP4", "WebM", "MOV", "MKV", "M4V", "OGG"],
    output: [],
  },

  useCases: [
    {
      audience: "Editor / Reviewer",
      title: "Frame-check an export",
      description:
        "Pause on the exact frame a client flagged and step through it one frame at a time to confirm a cut, a flash frame, or a color pop: without opening a heavyweight NLE.",
    },
    {
      audience: "Learner / Musician",
      title: "Slow down and loop a passage",
      description:
        "Drop a tutorial to 0.5× or 0.25× and loop the four seconds that matter until the move or the lick is in your hands: all in a browser tab, on the file you already downloaded.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Watch a sensitive clip safely",
      description:
        "Open a private recording, an unreleased edit or NDA footage knowing it is decoded locally and never uploaded, the way a downloaded file simply won't open in an untrusted online 'player'.",
    },
    {
      audience: "Anyone",
      title: "Open a file that won't play",
      description:
        "When a downloaded video won't open in your desktop player for want of a codec, try it here, mainstream web formats play in the browser with no install and no codec pack to chase.",
    },
  ],

  troubleshooting: [
    {
      problem: "My video loads but shows a black screen or plays only audio.",
      solution:
        "The container opened but the browser can't decode that video codec (common with some MKV, ProRes or HEVC files). Convert the file to MP4/H.264 or WebM with the Video Converter and play the result here. Playback support is the browser's, not the tool's.",
    },
    {
      problem: "The file won't load at all.",
      solution:
        "It's likely an unsupported or DRM-protected format your browser can't open. Check it plays elsewhere, then convert it to a mainstream container (MP4 or WebM) first. Nothing about the file is uploaded during this check, it's read entirely on your device.",
    },
    {
      problem: "Picture-in-Picture is greyed out or does nothing.",
      solution:
        "Picture-in-Picture is a browser feature, not always available, some browsers (notably older or locked-down ones) disable it, and it can't start while the tab is fullscreen. Exit fullscreen and try again, or use fullscreen instead. The rest of the player works regardless.",
    },
    {
      problem: "Changing speed also changes the audio pitch.",
      solution:
        "The player asks the browser to preserve pitch, but a few browsers ignore that at extreme rates. At 0.25× or 4× a slight pitch shift can slip through: step the speed toward 1× a notch and the audio settles.",
    },
  ],

  tips: [
    "Pause first, then use comma / period (or the step buttons) to move one frame at a time, the cleanest way to land on an exact moment.",
    "Set the A→B loop around a short passage and drop the speed to 0.5× to drill a tricky move or transcribe a fast line of dialogue.",
    "Press F for fullscreen and Space to play/pause. The whole player is keyboard-driven, so you rarely need the mouse.",
    "Use Picture-in-Picture to keep a reference clip floating on top while you take notes or work in another tab.",
    "This is a viewer, not a converter, if a file refuses to play, run it through the Video Converter once and it'll open here every time after.",
  ],

  security:
    "Your video is opened through a local object URL and decoded by your browser's own video engine. It is never uploaded, streamed to a server, transcoded, logged or stored. Unlike the editing tools in this suite, the player never fetches the FFmpeg WebAssembly core, so there is no processing step at all: it is purely a viewer. That makes it safe for private recordings, unreleased edits and anything under NDA. There's no account and no tracking of what you watch, and closing the tab releases the file and clears every trace.",

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The player opens your file through a local object URL and hands it to the browser's built-in video decoder, the same one that plays video on every site you visit. Nothing is uploaded, streamed out, transcoded or stored, and there's no FFmpeg core fetched at all because there's no processing to do. It's a pure viewer, which is exactly why it's safe for private, unreleased or NDA footage.",
    },
    {
      question: "Which video formats can it play?",
      answer:
        "Whatever your browser can decode. In practice that means mainstream web and mobile formats (MP4/H.264, WebM (VP8/VP9), most MOV and M4V, and OGG) open reliably across modern browsers. Some MKV containers, ProRes, HEVC/H.265 and any DRM-protected file may not, because playback support comes from the browser, not from us. If a file won't open, convert it to MP4 or WebM with the Video Converter and it'll play here.",
    },
    {
      question: "Is there a file-size limit?",
      answer:
        "There's no upload limit because there's no upload. The file is played straight off your disk through an object URL, so it never has to fit in memory or squeeze through a network. Very large files stream fine. The only practical ceiling is your device being able to seek and decode smoothly, which is the same limit any local media player has.",
    },
    {
      question: "How does frame-by-frame stepping work?",
      answer:
        "Pause the video, then use the Step Back / Step Forward buttons (or the comma and period keys) to nudge playback by a single frame in either direction. Because it's only seeking (not re-encoding) it's instant and lossless. The exact frame size is estimated from the file's frame rate. On variable-frame-rate clips a step may land a hair off, but it's precise enough for review and to read fast detail.",
    },
    {
      question: "Can I loop just one part of the video?",
      answer:
        "Yes, that's the A→B loop. Set an A (start) point and a B (end) point and the player will replay only that section on repeat until you clear it. It's ideal for practising a move, transcribing a line, or reviewing a single beat of an edit. Nothing about the file changes. The loop is purely a playback behaviour.",
    },
    {
      question: "Why doesn't this need to 'load an engine' like the other tools?",
      answer:
        "The trimmer, compressor and converter actually rewrite your video, so they download a ~31 MB FFmpeg WebAssembly core to do the encoding. The player only watches (it asks the browser to decode and display the file, which every browser already can) so there's nothing to download and no wait. Drop a clip and it plays immediately, even offline.",
    },
    {
      question: "Does changing the speed re-encode or damage my file?",
      answer:
        "No. Speed, loop, frame-step and Picture-in-Picture are all playback controls layered on top of the browser's video element. They change how the file is shown, never the file itself. Your original stays exactly as it was on disk. There's no export, no re-encode and nothing written back.",
    },
    {
      question: "Do I need to install anything or sign in?",
      answer:
        "No install, no plugin, no codec pack and no account. Open the page in any modern browser (Chrome, Edge, Firefox or Safari), drop in a video, and play. Because there's no engine to fetch, it even works offline on a page you've already opened.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release, drag-and-drop local playback with a custom control layer: scrub bar with buffered range, variable speed (0.25×–4×), A→B loop, frame-by-frame stepping, Picture-in-Picture, fullscreen and full keyboard control. No upload, no engine, no processing.",
    },
    {
      date: "2026-06-21",
      change:
        "Added a speed menu with pitch preservation, keyboard frame-stepping (comma / period) and clearer, labelled controls for screen-reader users.",
    },
    {
      date: "2026-06-28",
      change:
        "Improved handling of files the browser can't decode, a clear, honest message now points to the Video Converter instead of failing silently.",
    },
  ],

  relatedTools: [
    "video-trimmer",
    "video-converter",
    "video-to-gif",
    "video-compressor",
  ],
};

export default videoPlayer;
