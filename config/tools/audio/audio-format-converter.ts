import type { Tool } from "@/types";

/**
 * Audio Format Converter, the universal "any-to-any" hub of the GigAI Audio
 * Toolkit. Where the MP3 Converter is a one-target specialist, this tool is the
 * switchboard: drop any browser-decodable file and pick ANY target -
 * MP3, WAV, OGG, FLAC, M4A or AAC: with per-format quality controls. It routes
 * through the engine's {@link convertAudio}: WAV/MP3 targets stay fully native
 * (Web Audio decode + native WAV / lamejs MP3, no 31 MB download), while
 * OGG/FLAC/M4A/AAC targets decode natively then transcode through the shared
 * on-demand codec: loaded once, only when an exotic target is chosen.
 *
 * Every string is written for the cross-format queries people actually type -
 * "convert m4a to ogg", "wav to flac", "aac to wav", "flac to m4a online",
 * "change audio format in browser", and deliberately shares NOTHING with the
 * MP3-only, trimmer, recorder or normalizer copy. No claim outruns what browser
 * transcoding really does: honest about lossy vs. lossless, container vs. codec,
 * channel folding and the memory ceiling.
 */
const audioFormatConverter: Tool = {
  slug: "audio-format-converter",
  title: "Audio Format Converter",
  description:
    "Convert audio between any formats in your browser, MP3, WAV, OGG, FLAC, M4A and AAC, both ways. Drop a file, choose a target and quality, preview the waveform, then download. Everything runs locally. Nothing is uploaded.",
  category: "audio-tools",
  group: "Convert",
  icon: "RefreshCw",
  accent: "indigo",
  status: "live",
  featured: true,
  createdAt: "2026-06-11",

  h1: "Audio Format Converter, Convert Between MP3, WAV, OGG, FLAC, M4A & AAC In Your Browser",
  tagline:
    "One converter for every direction. Drop a file in any common format, pick the target you actually need (lossless WAV or FLAC, compact MP3 or AAC, open OGG or portable M4A) set the quality, and download. Real transcoding with a waveform preview, all on your device, never uploaded.",
  longDescription:
    "The GigAI Audio Format Converter is the universal switchboard of the toolkit: instead of locking you into a single output, it lets you convert between MP3, WAV, OGG, FLAC, M4A and AAC in any direction, right in the browser. Drop a file and choose where you want to go: a lossless WAV master for editing, a FLAC for archiving without quality loss, a compact MP3 or AAC for sharing, an OGG for open-source pipelines, or an M4A for the Apple ecosystem. The engine picks the cheapest path automatically: WAV and MP3 targets are produced entirely with native code, the Web Audio API decodes your source and the file is written as native PCM WAV or encoded to MP3 with lamejs, so those conversions are fast and carry no heavyweight download. When you choose OGG, FLAC, M4A or AAC, the source still decodes natively, and only then does an on-demand codec step in to bridge the encode. It loads a single time per session and, like everything else, runs locally on your machine. You stay in control of the trade-offs: lossy targets (MP3, AAC) expose a bitrate so you can dial size against fidelity, while lossless targets (WAV, FLAC) preserve every sample the decode recovered. The moment you drop a file you see its waveform, duration, sample rate and channel layout, so you're converting the right file with the right settings rather than guessing, and the result card shows the exact before/after byte size of your chosen format. Because decode and encode both happen in the tab, private material (interview recordings, unreleased mixes, confidential voice notes) never leaves your device. The tool is honest about what a converter can and can't do: it can rewrap and re-encode audio, fold surround down to the two channels most formats carry, and move between containers, but it can't resurrect detail a lossy source already discarded. When you need a specific format for a specific pipeline and don't want to upload a thing, this is the one converter that goes every direction. Close the tab and every byte is gone.",

  ctaText: "Convert audio",

  keywords: [
    "audio format converter",
    "convert audio online",
    "change audio format",
    "convert audio in browser",
    "audio transcoder",
    "free audio converter",
    "audio file converter",
    "convert audio between formats",
    "multi format audio converter",
  ],

  seo: {
    title:
      "Audio Format Converter, Convert MP3, WAV, OGG, FLAC, M4A & AAC | GigAI Tools",
    description:
      "Free universal audio converter. Convert between MP3, WAV, OGG, FLAC, M4A and AAC in any direction with quality controls and a waveform preview, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "RefreshCw",
      title: "Any format, any direction",
      description:
        "One tool for every route, MP3, WAV, OGG, FLAC, M4A and AAC, both to and from each other. No per-pair page hunting: drop a file, pick a target, convert.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Quality controls that match the target",
      description:
        "Lossy targets (MP3, AAC) expose a real bitrate so you tune size against fidelity. Lossless targets (WAV, FLAC) keep every decoded sample. The right controls appear per format.",
    },
    {
      icon: "Zap",
      title: "Native-first, download-free where it can be",
      description:
        "WAV and MP3 outputs are produced with the Web Audio API and lamejs alone. No heavyweight core to fetch. Only OGG/FLAC/M4A/AAC targets load an on-demand codec, once per session.",
    },
    {
      icon: "AudioLines",
      title: "Waveform & metadata preview",
      description:
        "See the source waveform plus its duration, sample rate and channel layout the instant you drop it, so you convert the right file at the right settings. Never blind.",
    },
    {
      icon: "Gauge",
      title: "Exact before / after size",
      description:
        "The result card reports the original bytes next to the converted bytes: the true weight of your chosen format, not a vague 'optimized' badge you have to trust.",
    },
    {
      icon: "ShieldCheck",
      title: "100% local, nothing uploaded",
      description:
        "Decoding and encoding run on your device. Interviews, unreleased mixes and private voice notes are never uploaded, stored or logged. There is no upload bar and no cloud copy.",
    },
  ],

  benefits: [
    {
      title: "Stop hunting for the exact pair",
      description:
        "Most converters make you find the one 'X to Y' page. This handles every combination of the six common formats in a single workspace, so whatever you have and whatever you need, it's the same three clicks.",
    },
    {
      title: "Lossless when you want it, small when you don't",
      description:
        "Archive to FLAC or bounce to WAV with zero added loss, or squeeze to MP3/AAC at a bitrate you choose. You decide the trade, the tool never quietly recompresses lossless audio behind your back.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server converters make you hand over the file and trust them with it first. Here the audio never leaves the browser, so there's no upload bar and nothing to trust with a sensitive recording.",
    },
    {
      title: "The right format for the pipeline",
      description:
        "Editors want WAV, the web loves OGG and AAC, Apple prefers M4A, archives want FLAC, everything plays MP3. Convert to exactly what the next step expects instead of fighting a codec it won't open.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag any decodable file (MP3, WAV, OGG, FLAC, M4A, AAC or other) onto the workspace, or click to browse. It's read locally and you'll see its waveform, duration and channels immediately.",
    },
    {
      title: "Choose the target format",
      description:
        "Pick where you're going: lossless WAV or FLAC, compact MP3 or AAC, open OGG, or portable M4A. The workspace tells you whether that target uses the fast native path or loads the on-demand codec.",
    },
    {
      title: "Set the quality",
      description:
        "For lossy targets (MP3, AAC) choose a bitrate to balance size against fidelity. Lossless targets have no bitrate. Every decoded sample is preserved as-is.",
    },
    {
      title: "Convert & check the size",
      description:
        "Press Convert. A progress bar tracks the encode locally, exotic targets briefly load the codec the first time only, then the result card shows the exact before/after size.",
    },
    {
      title: "Download or re-run",
      description:
        "Download your converted file, or reset and re-run to a different format or bitrate without reloading the page.",
    },
  ],

  formats: {
    input: ["MP3", "WAV", "OGG", "FLAC", "M4A", "AAC", "WEBM"],
    output: ["MP3", "WAV", "OGG", "FLAC", "M4A", "AAC"],
  },

  useCases: [
    {
      audience: "Editor / Producer",
      title: "Get a WAV or FLAC the DAW will accept",
      description:
        "Your source arrived as M4A or OGG but the editor wants uncompressed audio. Convert to a lossless WAV, or a smaller-but-lossless FLAC, so it drops straight into the session without a transcode surprise.",
    },
    {
      audience: "Web / App developer",
      title: "Ship OGG and AAC for the browser",
      description:
        "Cross-browser audio means serving open OGG alongside AAC/M4A. Convert one master into each delivery format locally, without a build step or an upload, and keep the bitrate you choose.",
    },
    {
      audience: "Archivist / Collector",
      title: "Re-encode a library to a single lossless format",
      description:
        "Mixed WAV and FLAC files are awkward to catalogue. Standardise everything to FLAC for compact, lossless archival. No quality loss versus WAV, and every file plays the same way.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Change a private recording's format locally",
      description:
        "A confidential interview or medical note needs a different format for the next tool, but shouldn't touch a stranger's server. Convert it entirely in the browser so the audio never leaves your device.",
    },
  ],

  troubleshooting: [
    {
      problem: "My file wouldn't load or decode.",
      solution:
        "The converter can only start from audio your browser can decode. Most WAV, MP3, M4A/AAC, OGG and (on most browsers) FLAC files work. A DRM-protected purchase, a raw/exotic codec or a corrupt file may not. Re-export the source to WAV first, then convert that to your target.",
    },
    {
      problem: "Converting to a lossy format made it sound slightly worse.",
      solution:
        "MP3 and AAC are lossy. Some detail is discarded to shrink the file, and starting from an already-lossy source compounds it a little. Pick a higher bitrate for the cleanest result, and convert from a lossless WAV or FLAC whenever you can rather than another compressed file.",
    },
    {
      problem: "An OGG/FLAC/M4A/AAC target took a moment to start the first time.",
      solution:
        "Those targets use an on-demand codec that downloads once per session before the first exotic conversion. After it's cached, subsequent conversions to those formats are quick. WAV and MP3 targets skip this entirely and are instant.",
    },
    {
      problem: "My output has fewer channels than the source.",
      solution:
        "Most delivery formats carry up to two channels, so surround sources are folded to stereo during conversion, expected for a standard listening or delivery file. Keep the original if you need more than two channels.",
    },
  ],

  tips: [
    "Going to WAV or MP3? Those are the native path. No codec download, so they're the fastest routes and great when you just need something universally playable.",
    "Archiving? FLAC is lossless like WAV but meaningfully smaller, ideal for storing a library without giving up a single sample.",
    "For lossy targets, 192 kbps is a safe all-rounder. Go to 256–320 for music you want near-transparent, or 128 for speech that has to stay small.",
    "Always convert from the highest-quality source you have, a lossless WAV or FLAC, because moving between two lossy formats can only add loss, never recover it.",
    "Watch the before/after size on the result card: if a lossy target is still too big, the file may simply be long. Trim it first rather than dropping to an unlistenable bitrate.",
  ],

  security:
    "Every conversion happens inside your browser. WAV and MP3 targets use the native Web Audio API plus the in-browser lamejs encoder with no extra download. OGG, FLAC, M4A and AAC targets add an on-demand codec that also runs entirely on your device. Nothing is ever uploaded to a server, stored or logged, so you can safely convert interviews, unreleased mixes and confidential recordings. There is no upload step and no cloud copy, close the tab and every byte is gone.",

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. All decoding and encoding happen locally in your browser. WAV and MP3 targets use the native Web Audio API and the in-browser lamejs encoder. OGG, FLAC, M4A and AAC targets add an on-demand codec that also runs on your device. Your file never leaves the tab. There's no upload step, nothing is stored or logged, and it's safe for private or confidential recordings.",
    },
    {
      question: "Which formats can I convert between?",
      answer:
        "You can convert any browser-decodable input (commonly MP3, WAV, OGG, FLAC, M4A/AAC and WEBM audio) to any of six output formats: MP3, WAV, OGG, FLAC, M4A and AAC. That means every direction is covered, whether you're going lossy-to-lossless, lossless-to-lossy, or swapping between two lossy or two lossless formats.",
    },
    {
      question: "What's the difference between the lossless and lossy targets?",
      answer:
        "WAV and FLAC are lossless. They preserve every sample the decode recovered, so no quality is lost (FLAC is simply a compressed, smaller way to store the same audio). MP3, AAC and OGG (Vorbis) are lossy. They discard some detail to shrink the file, which is why those targets let you pick a bitrate to balance size against fidelity.",
    },
    {
      question: "Will converting reduce the quality?",
      answer:
        "It depends on the direction. Converting to a lossless target (WAV or FLAC) keeps the quality of whatever the decode produced. Converting to a lossy target (MP3, AAC, OGG) always discards some data to shrink the file, usually inaudible from a high-quality source at a good bitrate, but re-encoding an already-lossy file can only lose a little more and never recover detail.",
    },
    {
      question: "Why do some conversions start instantly and others load a codec first?",
      answer:
        "The converter is native-first. WAV and MP3 outputs are produced entirely with the Web Audio API and lamejs, with no extra download, so they're instant. OGG, FLAC, M4A and AAC outputs need an on-demand codec to bridge the encode, which loads once the first time you convert to one of them: after that it's cached for the session.",
    },
    {
      question: "How large a file can I convert?",
      answer:
        "Because everything runs in your browser's memory, the practical ceiling is your device's RAM, not a fixed upload limit. Songs, podcast segments and voice memos up to many minutes run comfortably on a typical laptop. A multi-hour recording can use significant memory and briefly pause the tab. For the longest files, trim first or convert in shorter sections.",
    },
    {
      question: "Does it change the number of channels?",
      answer:
        "Only when it has to. Mono and stereo pass straight through, but most delivery formats carry at most two channels, so a surround source is folded down to stereo during conversion. That's the expected result for a standard listening or delivery file. Keep the original if you need more than two channels.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's no install, no plugin, no sign-up and no watermark or audible tag on the output. Open the page, drop your audio, pick a target and quality, convert, and download, the required encoder loads automatically the first time it's needed and everything runs in the tab.",
    },
  ],

  changelog: [
    {
      date: "2026-06-11",
      change:
        "Initial release, universal in-browser conversion between MP3, WAV, OGG, FLAC, M4A and AAC, with a native fast path for WAV/MP3 targets, an on-demand codec for exotic targets, a source waveform preview and an exact before/after size readout.",
    },
    {
      date: "2026-06-19",
      change:
        "Added per-format quality controls, a bitrate picker that appears only for lossy targets (MP3/AAC), plus a clearer native-vs-on-demand note so you know upfront whether a target loads the codec.",
    },
    {
      date: "2026-06-27",
      change:
        "Improved memory handling on long files, added drag-and-drop plus reset-and-retry so you can re-run to a different format or bitrate without reloading, and refined honest guidance on lossy vs. lossless routes.",
    },
  ],

  relatedTools: [
    "mp3-converter",
    "audio-trimmer",
    "audio-normalizer",
    "audio-recorder",
  ],
};

export default audioFormatConverter;
