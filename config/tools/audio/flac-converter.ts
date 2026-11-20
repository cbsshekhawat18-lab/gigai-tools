import type { Tool } from "@/types";

/**
 * FLAC Converter: the "Convert" tool for people who care about lossless.
 * Drop any audio the browser can decode (WAV, MP3, M4A/AAC, OGG, WEBM…) and it
 * re-encodes to FLAC (the Free Lossless Audio Codec) entirely on your device.
 * The heavy lifting is the shared ffmpeg.wasm core (~31 MB, loaded on demand the
 * first time you convert), fed a clean native-decoded WAV so the FLAC it writes
 * is a bit-exact, smaller-than-WAV archive of that audio. Every string is written
 * for real queries, "convert to flac", "wav to flac", "mp3 to flac", "lossless
 * audio converter", "compress wav without losing quality", and shares nothing
 * with the MP3 converter, trimmer, recorder or normalizer copy. No claim outruns
 * the truth: FLAC is lossless relative to what it's given, so a lossy MP3 source
 * can't be made lossless again; the tool is honest about that everywhere.
 */
const flacConverter: Tool = {
  slug: "flac-converter",
  title: "FLAC Converter",
  description:
    "Convert audio to FLAC, the free lossless codec, right in your browser. Turn WAV, MP3, M4A, AAC or OGG into a bit-perfect, smaller-than-WAV FLAC archive with a waveform preview and exact size readout. Nothing is uploaded.",
  category: "audio-tools",
  group: "Convert",
  icon: "FileAudio",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-19",

  h1: "FLAC Converter, Convert Audio to Lossless FLAC Online, In Your Browser",
  tagline:
    "Drop a WAV, MP3, M4A, AAC or OGG file and get a lossless FLAC: bit-perfect audio at a fraction of a WAV's size. Native decode, on-device ffmpeg encode, a waveform preview and an exact before/after size readout. Never uploaded.",
  longDescription:
    "The GigAI FLAC Converter turns almost any audio your browser can decode into FLAC (the Free Lossless Audio Codec) without your file ever touching a server. FLAC is the format archivists, audiophiles and mastering engineers reach for because it stores audio losslessly: every sample is preserved exactly, yet the file is typically 40–60% smaller than the equivalent uncompressed WAV. This converter decodes your source natively with the Web Audio API, hands the resulting bit-exact audio to an on-device ffmpeg engine, and writes a standard.flac file you can download in one click. Because FLAC is lossless, converting from a WAV, AIFF or another lossless master gives you a genuinely perfect, compressed copy, ideal for a music library, a backup, or delivering a master that a lossy MP3 would degrade. It's equally happy to package a lossy source: converting an MP3 or M4A to FLAC won't magically restore the detail those codecs discarded, but it gives you a lossless container that many hi-fi players, DAWs and streaming pipelines specifically require, and it won't lose anything further no matter how many times you re-open it. The workspace shows the source waveform, duration, sample rate and channels the instant you drop a file, encodes with a live progress bar, and then reports the exact original and FLAC byte sizes so you can see precisely how much smaller (from a WAV) (or larger (from an MP3)) the lossless version is before you commit. The ffmpeg core loads only when you actually convert, once per session, and everything runs in the tab: interviews, unreleased tracks and confidential recordings never leave your device. Close the tab and every byte is gone.",

  ctaText: "Convert to FLAC",

  keywords: [
    "flac converter",
    "convert to flac",
    "audio to flac",
    "wav to flac",
    "mp3 to flac",
    "m4a to flac",
    "aac to flac",
    "ogg to flac",
    "lossless audio converter",
    "flac converter online",
    "browser flac encoder",
    "convert wav to flac free",
  ],

  seo: {
    title: "FLAC Converter, Convert WAV, MP3, M4A & More to Lossless FLAC | GigAI Tools",
    description:
      "Free online FLAC converter. Turn WAV, MP3, M4A, AAC and OGG into a bit-perfect, smaller-than-WAV lossless FLAC, with a waveform preview and exact size readout, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "FileAudio",
      title: "Convert almost anything to FLAC",
      description:
        "Drop WAV, MP3, M4A, AAC, OGG, WEBM or the audio out of most containers. If your browser can decode it, this writes a standard, universally-readable.flac. No format lookup, no guessing.",
    },
    {
      icon: "ShieldCheck",
      title: "Truly lossless encoding",
      description:
        "FLAC preserves every sample exactly. No quality is discarded during compression. Convert a WAV or AIFF master and the FLAC is bit-for-bit identical audio, just packed into a much smaller file.",
    },
    {
      icon: "Minimize2",
      title: "Smaller than WAV, zero quality loss",
      description:
        "A FLAC is typically 40–60% smaller than the same uncompressed WAV while sounding identical. Archive a whole library or back up masters at roughly half the disk cost with nothing thrown away.",
    },
    {
      icon: "AudioLines",
      title: "Waveform preview before you commit",
      description:
        "See the source waveform plus its duration, sample rate and channels the moment you drop it, so you're converting the right file at the right resolution. Not encoding blind.",
    },
    {
      icon: "Gauge",
      title: "Exact before / after size",
      description:
        "When it finishes you get the original bytes and the FLAC bytes side by side (the real shrink from a WAV, or the honest growth from a lossy source) not a vague 'optimized' badge.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding and encoding both happen on your device. Interviews, voice memos and unreleased tracks are never uploaded, stored or logged, there's no upload bar and no cloud copy.",
    },
  ],

  benefits: [
    {
      title: "Perfect quality at half the size",
      description:
        "FLAC gives you every bit of a WAV master in a file that's usually 40–60% smaller. It's the format of choice for music libraries, backups and delivery when 'lossless but not huge' is the goal.",
    },
    {
      title: "The format hi-fi and studios ask for",
      description:
        "Audiophile players, mastering pipelines, distribution platforms and many DAWs specifically want FLAC for lossless delivery. Convert once and hand over exactly the file they expect.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server converters make you upload first and trust them with the file. Here the audio never leaves your browser, so there's no upload bar and nothing to trust with a private recording or unreleased track.",
    },
    {
      title: "A container that never degrades again",
      description:
        "Even from a lossy source, wrapping audio in FLAC means it won't lose anything further, re-open, re-copy and re-embed it as many times as you like with no generational quality drift.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag a WAV, MP3, M4A, AAC, OGG or other decodable file onto the workspace, or click to browse. It's read locally and you'll see its waveform, duration, sample rate and channels immediately.",
    },
    {
      title: "Preview the source",
      description:
        "Play back the waveform to confirm it's the right file and check the readout: a lossless source (WAV/AIFF) gives a truly perfect FLAC, a lossy one (MP3/M4A) gives a lossless container of already-compressed audio.",
    },
    {
      title: "Convert",
      description:
        "Press Convert to FLAC. The on-device ffmpeg core loads once the first time, then a progress bar tracks the lossless encode locally: nothing is uploaded at any point.",
    },
    {
      title: "Check the size & download",
      description:
        "Read the original vs FLAC size to see exactly how much smaller (from a WAV) or larger (from an MP3) the lossless file is, then download your.flac, or reset and drop another file.",
    },
  ],

  formats: {
    input: ["WAV", "MP3", "M4A", "AAC", "OGG", "WEBM", "FLAC"],
    output: ["FLAC"],
  },

  useCases: [
    {
      audience: "Audiophile / Collector",
      title: "Rip and archive a library in lossless FLAC",
      description:
        "You want a music collection that's bit-perfect but not the disk-hog WAV is. Convert your WAV rips to FLAC and store every track losslessly at roughly half the size, ready for any hi-fi player.",
    },
    {
      audience: "Musician / Mastering engineer",
      title: "Deliver a lossless master without the WAV bulk",
      description:
        "A client or distributor asks for lossless, but a full WAV is unwieldy to send. Encode the master to FLAC for a bit-identical delivery file that's far lighter to upload and store.",
    },
    {
      audience: "Podcaster / Archivist",
      title: "Preserve a recording in a future-proof format",
      description:
        "For long-term archival you want a lossless, open, widely-supported container. Convert your source to FLAC so the original quality is preserved exactly and the file opens decades from now.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Convert a private recording locally",
      description:
        "An interview, a medical note or a confidential voice memo shouldn't be uploaded to a stranger's converter. Encode it to FLAC entirely in your browser so the audio never leaves the device.",
    },
  ],

  troubleshooting: [
    {
      problem: "My FLAC is bigger than the MP3 I started with.",
      solution:
        "That's expected. FLAC is lossless, so it can't compress as aggressively as a lossy MP3, and it can only store the (already-reduced) audio the MP3 contained. Converting MP3 → FLAC gives you a lossless container, not smaller files or restored quality. Convert from a WAV or AIFF if your goal is a smaller-than-WAV lossless archive.",
    },
    {
      problem: "The file wouldn't load or decode.",
      solution:
        "The converter can only handle audio your browser can decode. Most WAV, MP3, M4A/AAC and OGG files work. A DRM-protected purchase, a raw/exotic codec or a corrupt file may not. Try re-exporting the source to WAV first, then convert that to FLAC.",
    },
    {
      problem: "Conversion paused while an engine loaded.",
      solution:
        "FLAC encoding uses an on-device ffmpeg core (~31 MB) that downloads once the first time you convert, then stays cached for the session. Subsequent conversions skip the wait. The core runs locally. Nothing about your audio is uploaded during or after the load.",
    },
    {
      problem: "The tab got slow or ran out of memory on a very long file.",
      solution:
        "Lossless encoding holds the decoded audio in memory, so a multi-hour, high-sample-rate recording on a low-memory device can strain the tab. Close other heavy tabs and try again. For the longest files, trim the audio first (see the Audio Trimmer) or convert in shorter sections.",
    },
  ],

  tips: [
    "Convert from a lossless source (WAV, AIFF or an existing FLAC) whenever you can: that's the only way the FLAC is genuinely bit-perfect audio.",
    "Expect a FLAC to be roughly 40–60% the size of the same WAV. The busier and noisier the audio, the less it compresses, so acoustic and spoken material shrinks most.",
    "Converting MP3 or M4A to FLAC is useful when a player or pipeline demands a lossless container, but it won't restore detail, and the FLAC will usually be larger than the MP3.",
    "The ffmpeg core loads once per session on your first conversion. After that every FLAC encode is download-free for the rest of the session.",
    "Watch the before/after size readout, from a WAV it confirms the space you saved, from a lossy source it warns you the file grew.",
  ],

  security:
    "Your audio is decoded natively with the Web Audio API and encoded to FLAC by an on-device ffmpeg core that runs entirely in your browser. Nothing is ever uploaded to a server, stored or logged: the ~31 MB core downloads once per session purely so the encode can run locally, and no audio data leaves the tab during or after that load. You can safely convert interviews, voice memos and unreleased tracks. There's no upload step and no cloud copy, and closing the tab discards every byte.",

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. All decoding and FLAC encoding happen locally in your browser. The source is decoded with the native Web Audio API and re-encoded by an on-device ffmpeg core. Your file never leaves the tab: there's no upload step, nothing is stored or logged, and it's safe for private or confidential recordings. The only download is the codec itself, loaded once so the work can run on your machine.",
    },
    {
      question: "What is FLAC and why convert to it?",
      answer:
        "FLAC is the Free Lossless Audio Codec: an open format that compresses audio without discarding any of it. Unlike MP3 or AAC, a FLAC preserves every sample exactly, so it's the go-to for music libraries, archival and lossless delivery. It's typically 40–60% smaller than the equivalent WAV, giving you perfect quality at roughly half the disk cost.",
    },
    {
      question: "Which formats can I convert to FLAC?",
      answer:
        "Anything your browser can decode, commonly WAV, MP3, M4A/AAC, OGG, WEBM audio, and even existing FLACs you want to re-encode. If a file loads and shows a waveform, it will convert. DRM-protected purchases and truly exotic raw codecs are the main exceptions. Re-export those to WAV first.",
    },
    {
      question: "If I convert an MP3 to FLAC, is it lossless again?",
      answer:
        "No, and this is the key honesty point. FLAC is lossless relative to what it's given, so converting an MP3 or M4A produces a lossless container of the already-compressed audio. The detail those lossy codecs discarded can't be recovered, and the FLAC will usually be larger than the MP3. Convert from a WAV or AIFF if you want a genuinely bit-perfect lossless file.",
    },
    {
      question: "Why is the FLAC larger than my original file?",
      answer:
        "Because your original was lossy. MP3, M4A and AAC throw away data to get small. FLAC keeps everything, so a lossless container of that audio is usually bigger than the lossy source. FLAC only comes out smaller when you start from an uncompressed source like WAV. There it's typically 40–60% of the size.",
    },
    {
      question: "How large a file can I convert?",
      answer:
        "Because everything runs in your browser's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. Songs, albums-worth of tracks and podcast segments run comfortably on a typical laptop. A multi-hour, high-sample-rate recording can use significant memory and briefly pause the tab. For the longest files, trim first or convert in shorter sections.",
    },
    {
      question: "Why does the first conversion take a moment to start?",
      answer:
        "FLAC encoding uses an on-device ffmpeg core (~31 MB) that loads once the first time you convert. After that it's cached for the session, so every subsequent FLAC encode starts immediately. The core runs entirely on your device: its download is code, never your audio, and nothing about your file is transmitted.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's no install, no plugin, no sign-up and no watermark or audible tag on the output. Open the page, drop your audio, convert, and download: the ffmpeg engine loads automatically the first time and everything runs in the tab.",
    },
  ],

  changelog: [
    {
      date: "2026-06-19",
      change:
        "Initial release: in-browser FLAC conversion via an on-device ffmpeg core, native Web Audio decoding, a source waveform preview, an exact before/after size readout and one-click download.",
    },
    {
      date: "2026-06-25",
      change:
        "Added clearer engine-loading state so the one-time ~31 MB core download is obvious, plus an honest lossless/lossy-source note that warns when a FLAC will be larger than a lossy input.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved memory handling on long, high-sample-rate files and added drag-and-drop plus reset so you can convert file after file without reloading the page.",
    },
  ],

  relatedTools: [
    "mp3-converter",
    "audio-trimmer",
    "audio-normalizer",
    "audio-recorder",
  ],
};

export default flacConverter;
