import type { Tool } from "@/types";

/**
 * AAC Converter: the "Convert" tool that produces AAC (Advanced Audio Coding),
 * the modern successor to MP3 that sounds better at the same bitrate and is the
 * default audio codec for Apple devices, YouTube, streaming and most video
 * containers. Drop any audio the browser can decode (WAV, MP3, M4A, OGG, FLAC,
 * WEBM…), and it decodes natively then hands a lossless WAV to the shared,
 * on-demand ffmpeg core to encode a compact.aac file, all on your device,
 * nothing uploaded. Every string is written for real queries people type -
 * "convert wav to aac", "mp3 to aac", "audio to aac online", "make aac for
 * iphone", and shares no copy with the MP3 converter, trimmer, recorder or
 * normalizer. No claim outruns what browser encoding actually does: AAC is
 * lossy, exotic conversion loads a one-time codec, and memory is your device's.
 */
const aacConverter: Tool = {
  slug: "aac-converter",
  title: "AAC Converter",
  description:
    "Convert any audio to AAC in your browser, WAV, MP3, M4A, OGG, FLAC and more to a compact, high-efficiency.aac file that plays natively on iPhone, Android, YouTube and modern video apps. Preview the waveform, encode locally, then download. Nothing is uploaded.",
  category: "audio-tools",
  group: "Convert",
  icon: "FileAudio",
  accent: "rose",
  status: "live",
  featured: false,
  createdAt: "2026-06-19",

  h1: "AAC Converter, Convert Audio to AAC Online, In Your Browser",
  tagline:
    "Drop a WAV, MP3, M4A, OGG or FLAC file and get a compact, high-efficiency AAC, the codec that sounds cleaner than MP3 at the same bitrate and plays natively across Apple, Android and streaming. Waveform preview, exact before/after size, all in your browser, never uploaded.",
  longDescription:
    "The GigAI AAC Converter turns almost any audio your browser can decode into AAC, Advanced Audio Coding, the codec that succeeded MP3 and delivers noticeably better quality at the same bitrate. It's what iTunes, Apple Music, YouTube and virtually every modern video container reach for, so an.aac (or AAC-in-M4A) file is the safe choice when you want small size without the dated sound of low-bitrate MP3. Everything happens on your device: your file is decoded with the Web Audio API into a lossless intermediate, and only then does an on-demand codec (the shared ffmpeg core) load to encode the AAC. That codec is fetched once per session and only when you actually convert, so the page itself stays light. You drop a file and immediately see its waveform, duration, sample rate and channels, so you're encoding the right source at the right settings rather than guessing. When it finishes you get the exact original and AAC byte sizes side by side, the real delivery weight of the result, not a vague 'optimized' claim. Because nothing is uploaded, sensitive material (an interview, a rough mix, a confidential voice note) never leaves the tab. Be honest about the format: AAC is lossy, so converting an already-compressed source like MP3 decodes and re-encodes, which can only lose a hair more, never recover detail. When you start from a lossless WAV or FLAC you get AAC at its best. This is the tool you want when you need audio that's small, modern-sounding and ready for Apple, Android and video pipelines. Close the tab and every byte is gone.",

  ctaText: "Convert to AAC",

  keywords: [
    "aac converter",
    "convert to aac",
    "audio to aac",
    "wav to aac",
    "mp3 to aac",
    "flac to aac",
    "ogg to aac",
    "m4a to aac",
    "aac converter online",
    "browser aac encoder",
    "convert audio to aac free",
    "aac for iphone",
  ],

  seo: {
    title: "AAC Converter, Convert WAV, MP3, FLAC & More to AAC | GigAI Tools",
    description:
      "Free online AAC converter. Turn WAV, MP3, M4A, OGG and FLAC into a compact, high-efficiency AAC file that plays natively on iPhone, Android and YouTube, with a waveform preview and exact size readout, 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["WAV", "MP3", "M4A", "AAC", "OGG", "FLAC", "WEBM"],
    output: ["AAC"],
  },

  features: [
    {
      icon: "FileAudio",
      title: "Encode to modern, efficient AAC",
      description:
        "AAC sounds cleaner than MP3 at the same bitrate and is the audio codec behind Apple Music, YouTube and most video files. Convert once and get a small, modern-sounding file the whole ecosystem understands.",
    },
    {
      icon: "AudioLines",
      title: "Waveform preview before you commit",
      description:
        "The moment you drop a file you see its waveform plus duration, sample rate and channels, so you're encoding the right source at the right settings instead of converting blind.",
    },
    {
      icon: "Gauge",
      title: "Exact before / after size",
      description:
        "When it finishes you get the original bytes and the AAC bytes side by side, the real delivery weight of the result, not a vague badge that hides what actually changed.",
    },
    {
      icon: "Cpu",
      title: "On-demand codec, page stays light",
      description:
        "The AAC encoder loads only when you actually convert, once per session. Nothing heavy downloads just for opening the page, and the conversion still runs entirely on your device.",
    },
    {
      icon: "Smartphone",
      title: "Plays natively on Apple & Android",
      description:
        "AAC is a first-class citizen on iPhone, iPad, Mac, Android and modern browsers. No extra player, no codec pack, no 'unsupported format' surprise when you hand the file off.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding and encoding happen in your browser. Interviews, rough mixes and voice notes are never uploaded, stored or logged, there's no upload bar and no cloud copy of your audio.",
    },
  ],

  benefits: [
    {
      title: "Better quality per kilobyte than MP3",
      description:
        "AAC's encoder is more efficient, so at any given bitrate it generally sounds closer to the source than MP3. You keep more of the music (or the clarity of speech) for the same file size.",
    },
    {
      title: "The right format for Apple and video",
      description:
        "Apple's ecosystem and most video containers default to AAC. Deliver AAC and your audio drops straight in. No transcode step downstream, no compatibility grumbling from an editor or player.",
    },
    {
      title: "Small files without the dated sound",
      description:
        "When you need audio small enough to attach, stream or bundle, AAC hits a smaller size than a comparable-quality MP3, ideal for uploads, app assets and anything bandwidth-conscious.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server converters make you upload first and trust them with the file. Here the audio never leaves your browser, so there's no upload bar and nothing to hand a stranger with a private recording.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag a WAV, MP3, M4A, OGG, FLAC or other decodable file onto the workspace, or click to browse. It's read locally and you'll see its waveform, duration and channels immediately.",
    },
    {
      title: "Convert to AAC",
      description:
        "Press Convert to AAC. The first time in a session an on-demand codec loads, then a progress bar tracks the encode on your device: quick for short clips, longer for big lossless sources.",
    },
    {
      title: "Check the size & download",
      description:
        "Read the original vs AAC size to see exactly what changed, then download your.aac file, or reset and drop another file without reloading the page.",
    },
  ],

  useCases: [
    {
      audience: "Apple-ecosystem user",
      title: "Make an AAC that just works on iPhone and Mac",
      description:
        "You need audio that lands cleanly in Apple Music, Voice Memos or a Keynote without a transcode warning. Convert your source to AAC and it plays natively across every Apple device.",
    },
    {
      audience: "Video creator / Editor",
      title: "Prep an AAC audio track for a video pipeline",
      description:
        "Most video containers expect AAC audio. Encode your voiceover or music bed to AAC first so it drops straight into your editor or muxer without an extra conversion step.",
    },
    {
      audience: "Anyone sending audio",
      title: "Shrink audio smaller than MP3 at the same quality",
      description:
        "A heavy WAV or FLAC won't fit an upload or attachment. AAC gets it smaller than a comparable MP3 while keeping speech and music clean, a better small-file trade for modern targets.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Convert a private recording locally",
      description:
        "An interview, a rough demo or a confidential voice note shouldn't be uploaded to a stranger's converter. Do it entirely in your browser so the audio never leaves the device.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. Your file is decoded with the browser's Web Audio API and encoded to AAC by an on-demand codec that runs locally on your device. Nothing is uploaded, stored or logged, there's no upload step and no cloud copy, so it's safe for private interviews, rough mixes and confidential voice notes. Close the tab and every byte is gone.",
    },
    {
      question: "Why choose AAC over MP3?",
      answer:
        "AAC is the newer, more efficient codec: at the same bitrate it generally sounds closer to the original than MP3, and it's the native audio format for Apple devices, YouTube and most video containers. If you want small files that sound good and drop cleanly into modern pipelines, AAC is usually the better pick. MP3 still wins only on ultra-legacy hardware.",
    },
    {
      question: "Which formats can I convert to AAC?",
      answer:
        "Anything your browser can decode: commonly WAV, MP3, M4A, OGG, FLAC (on most browsers) and WEBM audio. If a file loads and shows a waveform, it will convert. DRM-protected purchases and truly exotic raw codecs are the main exceptions. Re-export those to WAV first, then convert that.",
    },
    {
      question: "Will converting to AAC reduce the quality?",
      answer:
        "AAC is a lossy format, so it discards some data to shrink the file. That's how it stays small. From a lossless WAV or FLAC the loss is usually inaudible, and AAC is more efficient than MP3 so it holds up well. Converting an already-compressed source (like MP3) decodes and re-encodes, which can only lose a little more and never recover detail, so start from a lossless master when you can.",
    },
    {
      question: "Why does the first conversion load a codec?",
      answer:
        "AAC encoding uses an on-demand codec (the shared ffmpeg core) rather than a built-in browser encoder. It loads once, only when you actually convert, and is cached for the rest of the session, so opening the page stays light and the encode itself still runs entirely on your machine.",
    },
    {
      question: "How large a file can I convert?",
      answer:
        "Because everything runs in your browser's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. Songs, podcast segments and voice memos up to many minutes run comfortably on a typical laptop. A multi-hour lossless recording can use significant memory and briefly pause the tab. For the longest files, trim first or convert in shorter sections.",
    },
    {
      question: "Is the output a .aac file or an .m4a?",
      answer:
        "This tool outputs a raw AAC stream as a .aac file. That plays on Apple devices, Android and modern browsers and drops into most video muxers directly. If a specific app insists on an .m4a wrapper, most tools (and many players) accept the .aac as-is. Otherwise you can wrap it into an M4A container in your editor.",
    },
    {
      question: "Does it work offline or on my phone?",
      answer:
        "Once the page and the on-demand codec have loaded, the conversion itself needs no network: the encode runs on your machine. It works on modern mobile browsers too, though phones have less memory and are slower, so stick to shorter clips on mobile for the smoothest experience.",
    },
  ],

  tips: [
    "Convert from a lossless source (WAV or FLAC) whenever possible, re-encoding an existing MP3 or M4A only adds a little more loss, it can't restore quality.",
    "AAC is the better small-file choice for anything headed to Apple devices, YouTube or a video editor. It beats a same-size MP3 on sound quality.",
    "The codec loads once per session on your first conversion. After that, subsequent AAC conversions in the same tab start right away.",
    "Check the before/after size readout, if the AAC still doesn't fit your target, the source is probably just long, so trim it (see the Audio Trimmer) rather than degrading the whole file.",
    "Keep your original lossless file as the archive master. Treat the AAC as a delivery copy so you can always re-encode later at different settings.",
  ],

  troubleshooting: [
    {
      problem: "My file wouldn't load or decode.",
      solution:
        "The converter can only handle audio your browser can decode. Most WAV, MP3, M4A, OGG and (on most browsers) FLAC files work. A DRM-protected purchase, a raw/exotic codec or a corrupt file may not. Try re-exporting the source to WAV first, then convert that to AAC.",
    },
    {
      problem: "The first conversion took a moment to start.",
      solution:
        "The AAC encoder is an on-demand codec that downloads once per session before the first conversion. That one-time load is normal. After it's cached, later AAC conversions in the same tab begin right away. The download runs locally and nothing about your file is uploaded.",
    },
    {
      problem: "The AAC sounds slightly worse than the original.",
      solution:
        "AAC is lossy, so some detail is discarded to shrink the file, and re-encoding an already-compressed source (like MP3) compounds it a touch. For the cleanest result, convert from a lossless WAV or FLAC rather than another compressed file.",
    },
    {
      problem: "The tab got slow or ran out of memory on a very long file.",
      solution:
        "Conversion holds the decoded audio in memory, so a multi-hour recording on a low-memory device can strain the tab. Close other heavy tabs and try again. For the longest files, trim the audio first (see the Audio Trimmer) or convert in shorter sections.",
    },
  ],

  security:
    "Your audio is decoded and re-encoded entirely in your browser: the Web Audio API decodes it and an on-demand codec (the shared ffmpeg core) encodes the AAC locally on your device. Nothing is ever uploaded to a server, stored or logged, so you can safely convert interviews, rough mixes and unreleased tracks. There's no upload step and no cloud copy. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-19",
      change:
        "Initial release, in-browser AAC conversion from WAV, MP3, M4A, OGG, FLAC and WEBM via native Web Audio decoding plus an on-demand codec, with a source waveform preview, an exact before/after size readout and one-click download.",
    },
    {
      date: "2026-06-25",
      change:
        "Added a clearer one-time codec-loading state so the page stays light until you convert, plus drag-and-drop and reset so you can encode another file without reloading.",
    },
  ],

  relatedTools: [
    "mp3-converter",
    "audio-trimmer",
    "audio-normalizer",
    "audio-recorder",
  ],
};

export default aacConverter;
