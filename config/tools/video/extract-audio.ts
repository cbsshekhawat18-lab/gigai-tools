import type { Tool } from "@/types";

/**
 * Extract Audio from Video, the flagship of the GigAI Video Toolkit's Audio
 * group. Drop any common video file and rip its audio track to MP3, WAV, AAC,
 * M4A or OGG, entirely in the browser via FFmpeg compiled to WebAssembly. The
 * WASM core is lazy-loaded only when you press Extract, so nothing heavy ships
 * at page load. Every string below is written for the exact queries people
 * type when they want "just the audio" out of an MP4/MOV/WEBM: nothing here is
 * shared with the compress/convert/trim copy, and no claim outruns what the
 * single-threaded client-side engine actually does.
 */
const extractAudio: Tool = {
  slug: "extract-audio",
  title: "Extract Audio from Video",
  description:
    "Pull the audio track out of any video and save it as MP3, WAV, AAC, M4A or OGG, right in your browser. Drop an MP4, MOV or WEBM, pick a format, preview and download. Nothing is uploaded.",
  category: "video-tools",
  group: "Audio",
  icon: "Music",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-12",

  h1: "Extract Audio from Video: Video to MP3, WAV & AAC Online",
  tagline:
    "Drop an MP4, MOV, WEBM or MKV and rip its audio track to MP3, WAV, AAC, M4A or OGG. A real FFmpeg engine runs entirely in your browser (with a live progress bar and an in-page audio preview) so your video never leaves your device.",
  longDescription:
    "Extract Audio from Video is a browser-native audio ripper built on FFmpeg compiled to WebAssembly. Point it at a video and it demuxes the audio stream and re-encodes it to the format you choose, MP3 for universal compatibility, WAV for lossless editing, AAC or M4A for Apple-friendly quality-per-byte, or OGG Vorbis for open-format smallness. Because the whole pipeline runs on your own machine, a lecture recording, an unreleased track, a client's interview or a private voice memo is never uploaded to a server. The FFmpeg core is fetched from this site the moment you press Extract and everything after that happens locally. Drop your file (MP4, MOV, WEBM, MKV, AVaudio-bearing formats and more), choose an output format, and watch a real progress bar as FFmpeg transcodes. When it finishes you get an inline player to check the result before you download, plus the exact output size. The tool is honest about its limits: WebAssembly transcoding is slower than a native desktop app and holds the file in memory, so it shines on typical clips and gets sluggish on multi-gigabyte movies, for those, trim first or expect a wait. No account, no watermark, no upload, no size games: just your video in, an audio file out, on your device.",

  ctaText: "Extract Audio",

  keywords: [
    "extract audio from video",
    "video to mp3",
    "video to audio converter",
    "mp4 to mp3",
    "rip audio from video",
    "mov to mp3",
    "webm to mp3",
    "convert video to audio online",
    "video to wav",
    "video to aac",
    "get audio from video",
    "online audio extractor",
  ],

  seo: {
    title: "Extract Audio from Video, Video to MP3, WAV, AAC Online | GigAI Tools",
    description:
      "Free online audio extractor. Rip the audio track from MP4, MOV, WEBM or MKV to MP3, WAV, AAC, M4A or OGG, with a live progress bar and preview. 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Music",
      title: "Five output formats",
      description:
        "Save the extracted track as MP3 (universal), WAV (lossless, edit-ready), AAC or M4A (great quality-per-byte for Apple), or OGG Vorbis (small, open): pick per job, not per tool.",
    },
    {
      icon: "Cpu",
      title: "Real FFmpeg, in your browser",
      description:
        "Uses the same FFmpeg engine desktop apps rely on, compiled to WebAssembly and run client-side. No install, no command line, no upload: the core loads only when you press Extract.",
    },
    {
      icon: "Waves",
      title: "Preview before you save",
      description:
        "When extraction finishes, an inline audio player lets you confirm the track sounds right (start, end and quality) before you download a single byte.",
    },
    {
      icon: "Gauge",
      title: "Honest live progress",
      description:
        "A real progress bar reflects FFmpeg's actual work, with a one-time note while the engine loads on first run, so you always know it's moving and never wonder if the tab froze.",
    },
    {
      icon: "FileAudio2",
      title: "Sensible, quality encodes",
      description:
        "MP3 rips at a high-quality VBR setting, AAC/M4A at 192 kbps, WAV as 16-bit PCM and OGG at a balanced quality target, good defaults so the output sounds like the source, not a compressed copy.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private",
      description:
        "Your video is processed entirely on your device and never uploaded. Rip audio from confidential interviews, unreleased music or personal recordings, close the tab and every trace is gone.",
    },
  ],

  benefits: [
    {
      title: "Get just the audio, fast",
      description:
        "Skip the desktop install and the sketchy 'converter' sites. Drop a video, pick a format, download the audio. The whole loop is a few clicks and it happens on your machine.",
    },
    {
      title: "Keep private footage private",
      description:
        "Because nothing is uploaded, you can pull audio from a client interview, a medical recording or an unreleased mix without it ever touching a third-party server.",
    },
    {
      title: "Right format for the next step",
      description:
        "Choose WAV when you're editing in a DAW, MP3 when you just need something that plays everywhere, or AAC/M4A for Apple devices. No lossy round-trips you didn't ask for.",
    },
    {
      title: "No account, no watermark, no catch",
      description:
        "There's no sign-up, no length cap traded for an email, and no audio watermark stamped on the result. The tool is free because it runs on your hardware, not ours.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WEBM or MKV onto the workspace, or click to browse. The tool probes it locally and shows the name, size and duration. Nothing is uploaded.",
    },
    {
      title: "Pick an output format",
      description:
        "Choose MP3, WAV, AAC, M4A or OGG. If you're not sure, MP3 plays everywhere. Pick WAV when you'll edit the audio afterward and want it lossless.",
    },
    {
      title: "Extract",
      description:
        "Press Extract Audio. On the first run the FFmpeg engine loads once (a brief wait), then a live progress bar tracks the transcode as it works on your device.",
    },
    {
      title: "Preview & download",
      description:
        "Play the result in the built-in audio player to confirm it sounds right, check the output size, then download the file. Start over anytime to rip a different clip.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WEBM", "MKV", "AVI", "M4V"],
    output: ["MP3", "WAV", "AAC", "M4A", "OGG"],
  },

  useCases: [
    {
      audience: "Podcaster / Creator",
      title: "Turn a video interview into a podcast",
      description:
        "Recorded on Zoom or a camera and only need the sound? Extract the audio to MP3 or WAV and drop it straight into your editing timeline. No re-recording, no upload.",
    },
    {
      audience: "Musician",
      title: "Pull a reference track from a clip",
      description:
        "Rip audio from a live-performance or rehearsal video to WAV so you can study, sample-check or master it in your DAW without transcoding losses.",
    },
    {
      audience: "Student / Researcher",
      title: "Keep a lecture as listen-anywhere audio",
      description:
        "Extract a recorded class or talk to MP3 so it plays on any phone offline for the commute, smaller than the video and private, since the file never leaves your laptop.",
    },
    {
      audience: "Video editor",
      title: "Separate the audio stem",
      description:
        "Grab the audio track from a rough cut to clean, mix or transcribe it elsewhere, then bring it back, a quick demux without opening the whole project.",
    },
  ],

  faq: [
    {
      question: "Is my video uploaded to a server?",
      answer:
        "No. The extraction runs entirely in your browser using FFmpeg compiled to WebAssembly. The only thing fetched is the FFmpeg engine itself (from this site), and it loads on the first run. Your video is read and processed locally, so there is nothing for us to store, log or see: safe for confidential and unreleased material.",
    },
    {
      question: "Which format should I choose, MP3, WAV, AAC, M4A or OGG?",
      answer:
        "MP3 is the safe default: it plays on virtually everything and stays small. Pick WAV when you'll edit the audio in a DAW and want lossless quality (the files are large). AAC and M4A give better quality-per-byte than MP3 and suit Apple devices. OGG Vorbis is an efficient open format. All of them are extracted at sensible, high-quality settings.",
    },
    {
      question: "How large a video can I process, and why does it slow down?",
      answer:
        "Because everything runs in the browser via WebAssembly (single-threaded, holding the file in memory), it is slower than a native desktop app and memory-bound. Typical clips up to a few hundred MB work well. Multi-gigabyte movies can be slow or hit memory limits. For very large files, trim the part you need first, close other heavy tabs, or expect a wait: the progress bar shows real movement throughout.",
    },
    {
      question: "Will extracting change the audio quality?",
      answer:
        "Extracting to WAV is lossless PCM. MP3, AAC, M4A and OGG are lossy formats, so the tool re-encodes at high-quality settings (VBR for MP3, 192 kbps for AAC/M4A) that sound very close to the source. If the original video's audio was already low quality, extraction can't add detail that wasn't there. It faithfully carries over what's in the file.",
    },
    {
      question: "Why is there a wait the first time I click Extract?",
      answer:
        "The FFmpeg WebAssembly core (around 30 MB) is loaded on demand the first time you extract, so page load stays fast. That one-time load is shown as an engine-loading note. After it, subsequent extractions in the same session skip straight to processing.",
    },
    {
      question: "What if my video has no audio track?",
      answer:
        "If the file contains no audio stream, there's nothing to extract and the tool will report that rather than produce an empty file. Check that the source actually has sound, some screen recordings and silent clips ship without an audio track.",
    },
    {
      question: "Does it work on my phone?",
      answer:
        "It runs in modern mobile browsers, but WebAssembly video processing is heavy and phones have less memory, so large files may be slow or fail. For big videos, a desktop browser is far more reliable. Small clips are usually fine on a recent phone.",
    },
    {
      question: "Is there a watermark, sign-up or length limit?",
      answer:
        "No. There's no account, no email wall, no audio watermark and no artificial length cap. The tool is free because it uses your device's resources. The only real limit is your browser's memory on very large files.",
    },
  ],

  tips: [
    "Pick WAV if the audio is headed into a DAW or editor: it's lossless. Use MP3 when you just need something that plays anywhere and stays small.",
    "For a multi-gigabyte movie, trim the section you need first (in the Trim tool) so the extractor has far less to chew through.",
    "Close other memory-heavy tabs before extracting a large file: WebAssembly holds the video in memory and a crowded tab set can push it over the edge.",
    "Use the built-in player to spot-check the start and end of the track before downloading, especially for long recordings.",
    "AAC or M4A gives noticeably better quality than MP3 at the same size if your target devices are Apple.",
  ],

  troubleshooting: [
    {
      problem: "Extraction is very slow or the tab becomes unresponsive.",
      solution:
        "WebAssembly transcoding is CPU- and memory-bound. Try a smaller or trimmed file, close other heavy tabs, and use a desktop browser rather than a phone. The progress bar confirms it's still working even when it's slow.",
    },
    {
      problem: "It says the video has no audio track / the output is silent.",
      solution:
        "The source likely has no audio stream (common with silent screen recordings). Confirm the original video actually plays sound in a media player. If it doesn't, there's nothing to extract.",
    },
    {
      problem: "The extraction failed or the browser ran out of memory.",
      solution:
        "The file is probably too large for in-browser processing. Trim it to just the part you need first, or extract on a machine with more RAM. Very large MKV/MOV files are the usual culprit.",
    },
    {
      problem: "The engine takes a while to load on the first click.",
      solution:
        "That's the one-time FFmpeg WebAssembly core download (~30 MB), it's expected and only happens once per session. After it loads, further extractions start immediately.",
    },
  ],

  security:
    "Your video is read and processed entirely in your browser using FFmpeg compiled to WebAssembly. It is never uploaded to any server. The only network request is fetching the FFmpeg engine from this site on first use. Your file's data stays on your device. Nothing is stored, logged or transmitted, so you can safely rip audio from confidential interviews, unreleased music and personal recordings. Close the tab and every trace is gone.",

  changelog: [
    {
      date: "2026-06-12",
      change:
        "Initial release, in-browser audio extraction to MP3, WAV, AAC, M4A and OGG via FFmpeg WebAssembly, with drag-and-drop, a live progress bar, an inline audio preview and one-click download.",
    },
    {
      date: "2026-06-19",
      change:
        "Added an inline player to audition the result before download, honest engine-loading and size warnings for large files, and higher-quality default encode settings per format.",
    },
    {
      date: "2026-06-26",
      change:
        "Improved the no-audio-track message, refined progress reporting on long clips, and tightened memory handling so bigger videos are less likely to fail mid-extract.",
    },
  ],

  relatedTools: [
    "video-intelligence",
    "compress-video",
    "convert-video",
    "trim-video",
    "video-to-gif",
    "mute-video",
  ],
};

export default extractAudio;
