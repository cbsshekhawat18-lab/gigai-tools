import type { Tool } from "@/types";

/**
 * MP3 Converter: the flagship "Convert" tool of the GigAI Audio Toolkit and the
 * showcase for the native-first audio engine. Drop any audio the browser can
 * decode (WAV, M4A/AAC, OGG, FLAC, WEBM… or even the audio track inside a video
 * container), pick a bitrate, and it re-encodes to a clean CBR MP3 entirely on
 * your device: WAV/MP3 sources take the fast native path (Web Audio decode →
 * lamejs encode, no 31 MB ffmpeg download), while exotic containers decode
 * natively and hand a lossless WAV to the shared ffmpeg core only when needed.
 * Every string below is written for the real queries people type: "convert wav
 * to mp3", "m4a to mp3 online", "make mp3 smaller", "compress audio for upload"
 * - and shares nothing with the trimmer, recorder or normalizer copy. No claim
 * outruns what browser encoding actually does (lamejs CBR, ≤2 channels, honest
 * about lossy-to-lossy re-encoding and memory limits).
 */
const mp3Converter: Tool = {
  slug: "mp3-converter",
  title: "MP3 Converter",
  description:
    "Convert any audio to MP3 in your browser, WAV, M4A, AAC, OGG, FLAC and more to a clean, universally-playable MP3 with a bitrate you choose. Preview the waveform, encode locally with lamejs, then download. Nothing is uploaded.",
  category: "audio-tools",
  group: "Convert",
  icon: "FileAudio",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-14",

  h1: "MP3 Converter, Convert Audio to MP3 Online, In Your Browser",
  tagline:
    "Drop a WAV, M4A, AAC, OGG or FLAC file and get a clean, universally-playable MP3 at the bitrate you pick. Real lamejs encoding with a waveform preview and an exact before/after size readout: all in your browser, never uploaded.",
  longDescription:
    "The GigAI MP3 Converter turns almost any audio your browser can decode into a standard MP3 without ever sending your file to a server. It's built native-first: WAV and MP3 sources are decoded with the Web Audio API and encoded to MP3 in-browser with lamejs, so there's no upload, no account and no heavyweight download for the everyday case. Exotic containers (M4A/AAC, OGG, FLAC, the audio inside a WEBM) are decoded natively too, and only then does an on-demand codec step in to bridge the gap, and only for that file. You choose a constant bitrate from 96 to 320 kbps, so you're in control of the size-versus-quality trade: 320 kbps for a near-transparent music file, 128–192 kbps for a podcast or voice memo that has to stay small, 96 kbps when you just need it to fit. The tool shows the source waveform and metadata the moment you drop a file, encodes with a live progress bar, then reports the exact original and MP3 byte sizes so you can see precisely what changed before you download. Because everything runs on your device, sensitive recordings (interviews, unreleased tracks, voice notes) never leave the tab. Be honest with yourself about the format: MP3 is lossy, so converting a compressed source (M4A → MP3) decodes and re-encodes, which can only lose a little more, never recover detail. When your source is a lossless WAV or FLAC and you want the smallest good-sounding delivery file, this is exactly the last step you want. Close the tab and every byte is gone.",

  ctaText: "Convert to MP3",

  keywords: [
    "mp3 converter",
    "convert to mp3",
    "wav to mp3",
    "m4a to mp3",
    "flac to mp3",
    "ogg to mp3",
    "aac to mp3",
    "mp3 converter online",
    "browser mp3 encoder",
    "compress audio to mp3",
    "convert audio to mp3 free",
  ],

  seo: {
    title: "MP3 Converter: Convert WAV, M4A, FLAC & More to MP3 | GigAI Tools",
    description:
      "Free online MP3 converter. Turn WAV, M4A, AAC, OGG and FLAC into a clean MP3 at the bitrate you choose, with a waveform preview and exact size readout: 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "FileAudio",
      title: "Convert almost anything to MP3",
      description:
        "Drop WAV, M4A, AAC, OGG, FLAC, WEBM or the audio out of most containers. If your browser can decode it, this can turn it into a standard MP3. No format lookup table, no guessing.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Pick your bitrate, 96–320 kbps",
      description:
        "You control the size-versus-quality dial with real CBR presets: 320 for near-transparent music, 192 for a balanced default, 128 or 96 when the file simply has to be small.",
    },
    {
      icon: "Zap",
      title: "Native-first, no heavyweight download",
      description:
        "WAV and MP3 sources decode with the Web Audio API and encode with lamejs, pure in-browser, no 31 MB engine to fetch. Only exotic containers pull in an on-demand codec, and only for that file.",
    },
    {
      icon: "AudioLines",
      title: "Waveform preview before you commit",
      description:
        "See the source waveform and its duration, sample rate and channels the instant you drop it, so you're converting the right file at the right settings. Not encoding blind.",
    },
    {
      icon: "Gauge",
      title: "Exact before / after size",
      description:
        "When it finishes you get the original bytes and the MP3 bytes side by side, the real delivery weight of your chosen bitrate, not a vague 'optimized' badge.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding and encoding happen on your device. Interviews, voice memos and unreleased tracks are never uploaded, stored or logged, there's no upload bar and no cloud copy.",
    },
  ],

  benefits: [
    {
      title: "One MP3 that plays everywhere",
      description:
        "MP3 is the most universally-supported audio format there is: every phone, browser, car stereo, DAW and old media player reads it. Convert once and stop fighting a codec nothing will open.",
    },
    {
      title: "Shrink audio to fit a limit",
      description:
        "A big WAV or FLAC won't attach to an email or fit an upload cap. Encoding to a 128–192 kbps MP3 routinely cuts the size many times over while still sounding clean for speech and most music.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server converters make you upload the file first and trust them with it. Here the audio never leaves your browser, so there's no upload bar and nothing to trust with a private recording.",
    },
    {
      title: "You choose the quality, not a preset you can't see",
      description:
        "Bitrate is an explicit choice with an honest label, and the size readout confirms the result, so you land on the exact balance you need instead of accepting whatever a black box picked.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag a WAV, M4A, AAC, OGG, FLAC or other decodable file onto the workspace, or click to browse. It's read locally and you'll see its waveform, duration and channels immediately.",
    },
    {
      title: "Pick a bitrate",
      description:
        "Choose a CBR bitrate from 96 to 320 kbps: 192 is a safe default, 320 for music you want near-transparent, 128 or 96 to keep the file small for upload or email.",
    },
    {
      title: "Convert",
      description:
        "Press Convert to MP3. A progress bar tracks the encode locally with lamejs: quick for short clips. Exotic inputs briefly load an on-demand codec the first time only.",
    },
    {
      title: "Check the size & download",
      description:
        "Read the original vs MP3 size to see exactly what changed, then download your MP3, or reset and re-run at a different bitrate if you want a different balance.",
    },
  ],

  formats: {
    input: ["WAV", "M4A", "AAC", "OGG", "FLAC", "WEBM", "MP3"],
    output: ["MP3"],
  },

  useCases: [
    {
      audience: "Musician / Producer",
      title: "Bounce a WAV or FLAC master to a shareable MP3",
      description:
        "Your session exports a lossless master, but the world wants an MP3. Encode a clean 256–320 kbps copy for demos, playlists and email without opening a DAW or uploading the track.",
    },
    {
      audience: "Podcaster / Creator",
      title: "Turn a recorded M4A into a small, clean MP3",
      description:
        "A phone or app recording lands as M4A/AAC that some platforms and editors dislike. Convert it to a 128–192 kbps MP3 that uploads fast and plays absolutely everywhere.",
    },
    {
      audience: "Anyone sharing audio",
      title: "Shrink a big audio file to fit an upload",
      description:
        "A heavy WAV won't attach to an email or fit a forum's cap. Drop it, pick 128 kbps, and get a fraction-of-the-size MP3 that still sounds fine for speech and most listening.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Convert a private recording locally",
      description:
        "An interview, a medical note or a confidential voice memo shouldn't be uploaded to a stranger's converter. Do it entirely in your browser so the audio never leaves the device.",
    },
  ],

  troubleshooting: [
    {
      problem: "My file wouldn't load or decode.",
      solution:
        "The converter can only handle audio your browser can decode. Most WAV, MP3, M4A/AAC, OGG and (on most browsers) FLAC files work. A DRM-protected purchase, a raw/exotic codec or a corrupt file may not. Try re-exporting the source to WAV first, then convert that to MP3.",
    },
    {
      problem: "The MP3 sounds slightly worse than the original.",
      solution:
        "MP3 is lossy. Some detail is discarded to shrink the file, and re-encoding an already-lossy source (like M4A) compounds it a little. Pick a higher bitrate (256 or 320 kbps) for the cleanest result, and where you can, convert from a lossless WAV/FLAC rather than another compressed file.",
    },
    {
      problem: "The tab got slow or ran out of memory on a very long file.",
      solution:
        "Encoding holds the decoded audio in memory, so a multi-hour recording on a low-memory device can strain the tab. Close other heavy tabs and try again. For the longest files, trim the audio first (see the Audio Trimmer) or convert in shorter sections.",
    },
    {
      problem: "My output is mono but the source was surround.",
      solution:
        "MP3 supports up to two channels, so anything beyond stereo is folded down during conversion. That's expected, for a standard listening file it's exactly what you want. Keep the original if you need more than two channels.",
    },
  ],

  tips: [
    "192 kbps is the sweet spot for most music and voice: start there and only go to 320 if you can genuinely hear the difference on your gear.",
    "For speech-only content (podcasts, voice memos, audiobooks) 128 kbps is usually indistinguishable and roughly a third smaller than 192.",
    "Convert from a lossless source (WAV or FLAC) whenever possible: re-encoding an existing MP3 or M4A only adds loss, it can't restore quality.",
    "WAV and MP3 inputs take the fast native path with no engine download. Only OGG/FLAC/M4A-style containers briefly load the on-demand codec the first time.",
    "Watch the before/after size readout: if a 128 kbps MP3 still doesn't fit your limit, the file may just be very long. Trim it rather than dropping the bitrate to unlistenable levels.",
  ],

  security:
    "Your audio is decoded and re-encoded entirely in your browser, WAV and MP3 sources use the native Web Audio API plus the in-browser lamejs encoder, and exotic containers add an on-demand codec that also runs locally. Nothing is ever uploaded to a server, stored or logged, so you can safely convert interviews, voice memos and unreleased tracks. There's no upload step and no cloud copy. Close the tab and every byte is gone.",

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. All decoding and MP3 encoding happen locally in your browser, WAV and MP3 sources use the native Web Audio API and the in-browser lamejs encoder, and exotic formats add an on-demand codec that also runs on your device. Your file never leaves the tab: there's no upload step, nothing is stored or logged, and it's safe for private or confidential recordings.",
    },
    {
      question: "Which formats can I convert to MP3?",
      answer:
        "Anything your browser can decode, commonly WAV, M4A/AAC, OGG, FLAC (on most browsers), WEBM audio and even existing MP3s you want to re-encode at a different bitrate. If a file loads and shows a waveform, it will convert. DRM-protected purchases and truly exotic raw codecs are the main exceptions. Re-export those to WAV first.",
    },
    {
      question: "What bitrate should I choose?",
      answer:
        "Bitrate trades quality for size. 320 kbps is near-transparent for music, 256 is an excellent high-quality default, 192 is the everyday sweet spot, and 128 or 96 keep files small: ideal for speech, podcasts and voice memos where the difference is hard to hear. The tool shows the exact resulting file size so you can confirm your choice.",
    },
    {
      question: "Will converting to MP3 reduce the quality?",
      answer:
        "MP3 is a lossy format, so encoding always discards some data to shrink the file, that's how it achieves its size. From a lossless WAV or FLAC at a high bitrate the loss is usually inaudible. Converting an already-compressed source like M4A decodes and re-encodes, which can only lose a little more and never recover detail, so pick a higher bitrate for those.",
    },
    {
      question: "Why do some files convert instantly while others load an engine first?",
      answer:
        "The converter is native-first. WAV and MP3 sources are decoded and encoded entirely with the Web Audio API and lamejs, with no extra download, so they're fast. Formats like OGG, FLAC and M4A need an on-demand codec to bridge the decode, which loads once the first time you convert one: after that it's cached for the session.",
    },
    {
      question: "How large a file can I convert?",
      answer:
        "Because everything runs in your browser's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. Songs, podcast segments and voice memos up to many minutes run comfortably on a typical laptop. A multi-hour recording can use significant memory and briefly pause the tab. For the longest files, trim first or convert in shorter sections.",
    },
    {
      question: "Does it work offline or on my phone?",
      answer:
        "Once the page (and, for exotic inputs, the on-demand codec) has loaded, the conversion itself needs no network. The encode runs on your machine. It works on modern mobile browsers too, though phones have less memory and are slower, so stick to shorter clips on mobile for the smoothest experience.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's no install, no plugin, no sign-up and no watermark or audible tag on the output. Open the page, drop your audio, pick a bitrate, convert, and download: the lamejs encoder loads automatically the first time and everything runs in the tab.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release, in-browser MP3 conversion via lamejs with selectable 96–320 kbps CBR bitrates, native Web Audio decoding, a source waveform preview, an exact before/after size readout and one-click download.",
    },
    {
      date: "2026-06-22",
      change:
        "Added on-demand exotic-input support (OGG/FLAC/M4A/AAC decode) that loads a codec only when needed, plus a clearer engine-loading state so native WAV/MP3 conversions stay instant and download-free.",
    },
    {
      date: "2026-06-29",
      change:
        "Refined bitrate labels with honest quality guidance, improved memory handling on long files, and added drag-and-drop plus reset-and-retry so you can re-encode at a new bitrate without reloading.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-recorder",
    "audio-normalizer",
    "audio-merger",
    "ringtone-maker",
  ],
};

export default mp3Converter;
