import type { Tool } from "@/types";

/**
 * MKV to MP4: a single-purpose converter that turns a Matroska (.mkv) file
 * into a broadly-playable MP4, entirely in the browser via FFmpeg
 * (WebAssembly). MKV is a flexible container beloved by rippers and archivists,
 * but it won't play in many phones, TVs, editors, messengers or a plain
 * `<video>` tag: MP4 will. Crucially, most MKVs already hold H.264 video and
 * AAC audio, so the conversion is usually a fast REMUX (a container swap, no
 * re-encode) that finishes in seconds without touching quality; only when the
 * inner codecs aren't MP4-friendly does it fall back to a real re-encode.
 *
 * All copy below is written for the exact phrasing people search when they have
 * an MKV that "won't play" and need an MP4. Nothing is shared with the general
 * converter, the MP4-to-WebM tool, the compressor or the GIF copy. It is honest
 * that a remux is lossless and quick while a re-encode is slower and CPU-bound,
 * that browsers can't decode every exotic MKV codec (some Blu-ray audio, 10-bit
 * HEVC), and that nothing is ever uploaded.
 */
const mkvToMp4: Tool = {
  slug: "mkv-to-mp4",
  title: "MKV to MP4",
  description:
    "Convert MKV to MP4 in your browser, usually a fast, lossless remux that just swaps the container so your video plays on phones, TVs, editors and the web. Nothing is uploaded.",
  category: "video-tools",
  group: "Convert",
  icon: "FileVideo",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "MKV to MP4 Converter, Fast, Lossless, Online & Free",
  tagline:
    "Make that MKV finally play everywhere. Most files convert by a quick, lossless remux (no quality loss, no re-encode, no watermark) and it all happens on your device, never uploaded.",
  longDescription:
    "This MKV-to-MP4 converter runs a full FFmpeg build compiled to WebAssembly right in your browser and turns a Matroska (.mkv) file into an MP4 that actually plays where you need it. MKV is a wonderfully flexible container (it's what rippers, encoders and archivists reach for because it can hold almost anything) but that flexibility is exactly why it trips up so much of the real world: iPhones and many Android players, smart TVs, QuickTime, a lot of video editors, most messengers, and a plain HTML `<video>` tag either refuse it outright or play the video with no sound. MP4 is the opposite: it's the universal, boring, works-everywhere container. Here's The upside the upload sites gloss over: the overwhelming majority of MKVs already carry H.264 video and AAC audio inside them, and MP4 is happy to hold exactly those streams. So most conversions are a REMUX, the tool copies the existing video and audio streams straight into an MP4 shell without decoding or re-encoding a single frame. That's lossless (the picture and sound are bit-for-bit identical), it's fast (a full movie can finish in seconds), and it produces a file roughly the same size as the source. If the inner codecs aren't MP4-friendly. Say the audio is FLAC, Vorbis or an unusual track, or the video is a format MP4 can't carry. You can switch to a full re-encode to H.264/AAC for maximum compatibility, at the cost of time and a small quality hit. Everything is client-side, so there's no upload wait and no privacy tradeoff: ripped discs, downloaded recordings, camera dumps and unreleased footage never leave your machine, and there's no server to store, log or leak them. Be honest about the edges: WebAssembly FFmpeg is single-threaded and memory-bound, so a re-encode of a long or high-resolution clip takes real time, and browsers can't handle every exotic MKV codec (some Blu-ray audio formats and certain 10-bit HEVC streams may not survive). But for the common case, an MKV that just won't play, drop it in and get a clean, universal MP4 back in seconds, entirely in the browser.",

  ctaText: "Convert to MP4",

  keywords: [
    "mkv to mp4",
    "convert mkv to mp4",
    "mkv to mp4 converter",
    "mkv to mp4 online free",
    "matroska to mp4",
    "mkv to mp4 no upload",
    "remux mkv to mp4",
    "mkv won't play convert",
    "mkv to mp4 browser",
    "free mkv to mp4",
    "mkv to mp4 lossless",
    "change mkv to mp4",
  ],

  seo: {
    title: "MKV to MP4 Converter: Fast Lossless Remux Online | GigAI Tools",
    description:
      "Free online MKV-to-MP4 converter. Most files convert by a fast, lossless remux (just a container swap, no quality loss) so your video plays everywhere. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Zap",
      title: "Fast, lossless remux",
      description:
        "Most MKVs already hold H.264 + AAC, so the tool copies those streams straight into an MP4 shell. No re-encode, no quality loss, and a full movie can finish in seconds.",
    },
    {
      icon: "Globe",
      title: "Plays everywhere MKV won't",
      description:
        "MP4 is the universal container: iPhones, Android, smart TVs, QuickTime, editors, messengers and a plain <video> tag all accept it, where MKV so often gets rejected or plays silent.",
    },
    {
      icon: "RefreshCw",
      title: "Re-encode fallback for odd codecs",
      description:
        "If the inner audio or video isn't MP4-friendly (FLAC, Vorbis, an exotic track), switch to a full H.264/AAC re-encode for maximum compatibility, at the cost of time.",
    },
    {
      icon: "Eye",
      title: "Preview before you download",
      description:
        "The finished MP4 plays right in the tool with its exact file size, so you can confirm the picture and audio survived before you save or share it.",
    },
    {
      icon: "Feather",
      title: "Same size, same quality",
      description:
        "A remux keeps the original streams bit-for-bit, so the MP4 is roughly the same size as the MKV and looks and sounds identical: you're only changing the wrapper.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "FFmpeg runs as WebAssembly on your device. Your MKV is never uploaded, stored or logged, safe for ripped discs, private recordings and unreleased footage.",
    },
  ],

  benefits: [
    {
      title: "Get a file that just plays",
      description:
        "An MKV that iOS, your TV or your editor refuses becomes a plain MP4 that opens everywhere, usually in seconds, because most files only need a container swap, not a re-encode.",
    },
    {
      title: "Keep every pixel of quality",
      description:
        "Because the common path is a lossless remux, the video and audio are copied untouched. You get MP4 compatibility with zero generational quality loss, something upload converters that always re-encode can't promise.",
    },
    {
      title: "Keep your footage private",
      description:
        "Nothing leaves your device. A ripped disc, a downloaded recording or an internal capture is converted on-device, so there's no server that ever sees your file.",
    },
    {
      title: "No install, no watermark, no sign-up",
      description:
        "Get a real MP4 without desktop software like HandBrake or VLC, without a login, and without a logo stamped on your video: just a browser tab you can close when you're done.",
    },
  ],

  howTo: [
    {
      title: "Drop your MKV",
      description:
        "Drag a.mkv file onto the workspace, or click to browse. It's probed locally for duration and dimensions: nothing is uploaded.",
    },
    {
      title: "Pick a mode",
      description:
        "Leave it on the fast, lossless remux (best for the usual H.264/AAC MKV), or switch to full re-encode if the file has an unusual codec or won't remux cleanly.",
    },
    {
      title: "Convert & preview",
      description:
        "Click Convert to MP4. FFmpeg loads once (a one-time download), a progress bar tracks the work, and the finished MP4 plays right in the page.",
    },
    {
      title: "Download or restart",
      description:
        "Save the MP4, or reset and try the other mode if the remux couldn't carry a track and you'd rather re-encode for full compatibility.",
    },
  ],

  formats: {
    input: ["MKV"],
    output: ["MP4"],
  },

  useCases: [
    {
      audience: "Movie & TV ripper",
      title: "Play a ripped MKV on an iPhone or TV",
      description:
        "Discs and downloads land as MKV, which iOS and many smart TVs won't touch. Remux to MP4 locally in seconds, lossless, so it plays on the couch or the phone without a media-server workaround.",
    },
    {
      audience: "Video editor",
      title: "Import footage your NLE rejects",
      description:
        "Premiere, Final Cut and many editors don't like MKV. Convert to MP4 first, usually a fast remux that preserves the original quality, so the clip drops straight onto the timeline.",
    },
    {
      audience: "Anyone sharing a clip",
      title: "Send a video that opens for everyone",
      description:
        "Messengers and phones often choke on MKV. Hand people an MP4 instead and it previews and plays inline. No 'unsupported format' and no missing audio.",
    },
    {
      audience: "Web developer",
      title: "A <video> source that works",
      description:
        "Browsers won't stream MKV in a <video> tag. Convert to MP4 (H.264/AAC) so a hero clip or embedded demo plays natively, encoded on-device, so a pre-launch asset stays private.",
    },
  ],

  troubleshooting: [
    {
      problem: "The MP4 plays but has no sound.",
      solution:
        "The remux copied an audio codec MP4 can carry, but that MKV's audio was likely FLAC, Vorbis or another non-MP4 track that couldn't be copied as-is. Reset and switch to the full re-encode mode. It transcodes audio to AAC, which MP4 always supports.",
    },
    {
      problem: "The remux failed or the video won't play.",
      solution:
        "The MKV's video codec probably can't live in an MP4 container (some 10-bit HEVC or exotic streams). Switch to re-encode mode to transcode the video to H.264, which every MP4 player understands. It's slower but far more compatible.",
    },
    {
      problem: "The re-encode is slow.",
      solution:
        "Re-encoding runs H.264 in single-threaded WebAssembly, which is much slower than a native tool. Long or high-resolution files are the worst case. If your MKV is a standard H.264/AAC file, use the remux mode instead: it copies streams and finishes in seconds.",
    },
    {
      problem: "Nothing happens on the first click, or there's a pause before progress.",
      solution:
        "The first conversion downloads the FFmpeg WebAssembly core (~31 MB) once, then caches it. Give it a moment on the first run. Later conversions in the same session start immediately.",
    },
  ],

  tips: [
    "Try the fast remux first. Most MKVs are already H.264/AAC, so it converts losslessly in seconds. Only fall back to re-encode if a track won't carry over.",
    "A remux keeps the original quality and size. A re-encode is your compatibility safety net when the remux plays silent or fails.",
    "If you only need a clip, trim the MKV first (the Video Trimmer): a shorter file re-encodes far faster if you do need that mode.",
    "For very large discs, close other heavy tabs before converting: WebAssembly FFmpeg is memory-bound and a full movie is a lot to hold at once.",
    "Keep the original MKV until you've confirmed the MP4 plays with sound. Then you can safely delete the source.",
  ],

  security:
    "Your MKV is converted to MP4 entirely in your browser using FFmpeg compiled to WebAssembly. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert ripped discs, private recordings and unreleased footage. The FFmpeg core is fetched once from this site (same-origin) and cached. Your media stays on your device. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my MKV uploaded to a server?",
      answer:
        "No. The entire conversion runs locally in your browser using FFmpeg compiled to WebAssembly. Your file never leaves your device, so there is nothing for us to store, log or see, it's safe to convert ripped discs, private recordings and confidential footage.",
    },
    {
      question: "Does converting MKV to MP4 lose quality?",
      answer:
        "Usually not. Most MKVs already contain H.264 video and AAC audio, so the tool remuxes. It copies those exact streams into an MP4 container without re-encoding. That's lossless: the picture and sound are bit-for-bit identical to the source. Quality is only affected if you use the re-encode mode, which is needed for MKVs with codecs MP4 can't carry.",
    },
    {
      question: "Why is my MKV so much faster to convert than I expected?",
      answer:
        "Because a remux isn't really 'converting' the video, it's swapping the wrapper. When the MKV's streams are already MP4-compatible (the common case), FFmpeg just copies them, so even a full-length movie can finish in seconds. A real re-encode, by contrast, decodes and re-compresses every frame and takes much longer.",
    },
    {
      question: "The MP4 has no sound, what happened?",
      answer:
        "The video remuxed fine but the audio was a codec MP4 can't hold as-is (often FLAC or Vorbis). Switch to the full re-encode mode: it transcodes the audio to AAC, which MP4 always supports, so the sound comes through.",
    },
    {
      question: "Is there a file-size or length limit?",
      answer:
        "There's no hard cap, and a remux is light on memory since it isn't decoding video, so even large movies usually remux fine. A re-encode is heavier: WebAssembly FFmpeg is single-threaded and memory-bound, so very large files can strain the browser tab. As a loose guide, remux freely. For re-encodes, keep sources under a few hundred MB or trim first.",
    },
    {
      question: "Why is the first conversion slow to start?",
      answer:
        "The first time you convert, the browser downloads the FFmpeg WebAssembly core (about 31 MB) and caches it. That happens once per session before work begins. After that, conversions start immediately. A progress bar shows both the one-time engine load and the conversion.",
    },
    {
      question: "Will every MKV convert?",
      answer:
        "Almost all of them. The common H.264/AAC case remuxes instantly, and the re-encode fallback handles most other codecs. The exceptions are genuinely exotic streams, certain Blu-ray audio formats or unusual 10-bit HEVC video, that the WebAssembly build may not decode. If a file won't convert either way, its codec is likely outside what runs in a browser.",
    },
    {
      question: "How is this different from the general Video Converter?",
      answer:
        "This tool is tuned specifically for the MKV-to-MP4 path and defaults to the fast, lossless remux most MKVs only need. If your source is a MOV, WebM or AVI, or you want to target a format other than MP4, use the general Video Converter, which offers a full format menu.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, browser-side MKV-to-MP4 conversion via WebAssembly FFmpeg, with a fast lossless remux mode (stream copy) plus a full H.264/AAC re-encode fallback, a live progress bar, in-page preview and download. Nothing is uploaded.",
    },
    {
      date: "2026-06-24",
      change:
        "Made the lossless remux the default and added clearer guidance for the silent-audio case (FLAC/Vorbis tracks) that needs the re-encode fallback.",
    },
    {
      date: "2026-06-29",
      change:
        "Sharpened honest limits around exotic MKV codecs (some Blu-ray audio and 10-bit HEVC) and improved memory handling so full-length movies remux more reliably.",
    },
  ],

  relatedTools: [
    "video-converter",
    "mp4-to-webm",
    "video-compressor",
    "video-trimmer",
  ],
};

export default mkvToMp4;
