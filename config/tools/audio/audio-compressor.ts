import type { Tool } from "@/types";

/**
 * Audio Compressor, the "make this file smaller" tool of the GigAI Audio
 * Toolkit. Where the MP3 Converter is about *format*, this one is squarely about
 * *weight*: drop any audio the browser can decode and squeeze the byte size down
 * by choosing a lower MP3 bitrate and, optionally, a lower sample rate: the two
 * levers that actually move file size. It re-encodes to a clean CBR MP3 entirely
 * on your device (Web Audio decode → optional offline resample → lamejs encode),
 * shows the exact original vs compressed size, and never uploads a byte. Copy is
 * written for the real queries, "compress audio online", "reduce audio file
 * size", "make mp3 smaller", "shrink wav for email", "lower audio bitrate", and
 * shares nothing with the converter, trimmer or normalizer text. No claim
 * outruns reality: MP3 is lossy, downsampling trades treble for size, and there
 * is no magic that shrinks a file without discarding something.
 */
const audioCompressor: Tool = {
  slug: "audio-compressor",
  title: "Audio Compressor",
  notFor: [
    { text: "It does not trim silence or cut the clip.", toolSlug: "audio-trimmer" },
    { text: "It is not a dynamics compressor for mixing - it reduces FILE size." },
  ],
  description:
    "Compress audio and reduce file size in your browser, lower the MP3 bitrate and sample rate to shrink a WAV, MP3, M4A, FLAC or OGG down to a fraction of its size. See the exact before/after weight, preview the waveform, then download. Nothing is uploaded.",
  category: "audio-tools",
  group: "Convert",
  icon: "Minimize2",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "Audio Compressor, Reduce Audio File Size Online, In Your Browser",
  tagline:
    "Shrink a heavy WAV, MP3, M4A or FLAC to a fraction of its size by picking a lower bitrate and sample rate. Real in-browser MP3 encoding with a waveform preview and an exact before/after byte readout: 100% local, never uploaded.",
  longDescription:
    "The GigAI Audio Compressor makes audio files smaller without sending them to a server. It targets the two settings that genuinely control file weight: the MP3 bitrate (how many kilobits per second of audio detail are kept) and the sample rate (how many times per second the waveform is measured). Drop a WAV, MP3, M4A/AAC, OGG or FLAC (anything your browser can decode) and it decodes with the Web Audio API, optionally resamples to a lower rate through an offline render, then re-encodes to a standard CBR MP3 in-browser with lamejs. Because MP3 is the near-universal delivery format and its bitrate maps almost linearly to size, this gives you a predictable, honest dial: 128 or 96 kbps for a podcast or voice memo that has to be tiny, 160–192 kbps for music you still want to sound good, and a matching sample rate, 44.1 kHz for music, 22.05 kHz for voice, 16 kHz when you truly just need it small. The moment you drop a file you see its waveform, duration, channels and current size, so you're compressing the right thing at the right settings rather than guessing. When it finishes you get the exact original and compressed byte counts side by side plus the percentage saved (not a vague 'optimized' badge) so you can confirm you hit your upload cap or email limit before downloading. Everything runs in the tab, which means confidential interviews, unreleased tracks and private voice notes never leave your device. Be honest with the trade: compression discards detail to save space, and downsampling removes high frequencies you can't get back. Compressing an already-lossy source (like an M4A) decodes and re-encodes, which can only lose a little more. Used well, a lossless WAV or FLAC down to a right-sized MP3, this is exactly the last step before you send audio anywhere. Close the tab and every byte is gone.",

  ctaText: "Compress audio",

  keywords: [
    "audio compressor",
    "compress audio",
    "reduce audio file size",
    "make audio smaller",
    "shrink audio file",
    "compress mp3",
    "make mp3 smaller",
    "lower audio bitrate",
    "reduce mp3 size",
    "compress wav",
    "audio file size reducer",
    "compress audio online free",
  ],

  seo: {
    title: "Audio Compressor: Reduce Audio File Size Online Free | GigAI Tools",
    description:
      "Free online audio compressor. Reduce audio file size by lowering the MP3 bitrate and sample rate: shrink WAV, MP3, M4A, FLAC and OGG with a waveform preview and exact before/after size. 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["WAV", "MP3", "M4A", "AAC", "OGG", "FLAC", "WEBM"],
    output: ["MP3"],
  },

  features: [
    {
      icon: "Minimize2",
      title: "Real size reduction, not a vague 'optimize'",
      description:
        "Lower the MP3 bitrate and sample rate, the two knobs that actually shrink a file, and watch the byte count drop. A heavy WAV routinely becomes a fraction of its size while staying perfectly listenable.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Bitrate control, 96–320 kbps",
      description:
        "Pick a constant bitrate: 96–128 kbps for the smallest voice files, 160–192 for music you still want clean, up to 320 when size is only a mild concern. Bitrate maps almost linearly to file weight.",
    },
    {
      icon: "AudioWaveform",
      title: "Sample-rate downsampling",
      description:
        "Drop from 48/44.1 kHz to 22.05 or 16 kHz for speech to save even more. It's an offline resample done on your device: ideal for podcasts and voice memos where treble detail doesn't matter.",
    },
    {
      icon: "Gauge",
      title: "Exact before / after size",
      description:
        "When it finishes you get the original bytes, the compressed bytes and the percentage saved side by side: the real delivery weight, so you can confirm you'll fit an upload cap before you download.",
    },
    {
      icon: "AudioLines",
      title: "Waveform preview before you commit",
      description:
        "See the source waveform, duration, channels and current size the instant you drop a file, so you're compressing the right audio at the right settings instead of shrinking blind.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, resampling and MP3 encoding all run on your device. Interviews, voice memos and unreleased tracks are never uploaded, stored or logged, there's no upload bar and no cloud copy.",
    },
  ],

  benefits: [
    {
      title: "Fit any upload or email limit",
      description:
        "Attachment caps, forum limits and platform ceilings reject big audio. Dial the bitrate down and a multi-megabyte WAV or MP3 slides comfortably under the limit: usually with the file still sounding fine.",
    },
    {
      title: "Predictable, honest control",
      description:
        "Bitrate is an explicit choice and the size readout confirms the result, so you land on the exact size you need instead of trusting a black box that picked a setting you can't see or verify.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server compressors make you upload first and trust them with the file. Here the audio never leaves your browser. No upload bar, nothing to trust with a private recording, and it's fast because there's no round trip.",
    },
    {
      title: "One small file that plays everywhere",
      description:
        "The output is a standard MP3, every phone, browser, car stereo and player reads it. Compress once and get a small, universally-playable file instead of a heavy source nothing wants to open.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag a WAV, MP3, M4A, OGG or FLAC file onto the workspace, or click to browse. It's read locally and you'll see its waveform, duration, channels and current size immediately.",
    },
    {
      title: "Choose a bitrate",
      description:
        "Pick a CBR bitrate from 96 to 320 kbps: lower is smaller. 128 is a strong all-round shrink, 96 for the tiniest voice files, 160–192 to keep music sounding good.",
    },
    {
      title: "Optionally lower the sample rate",
      description:
        "Keep the original rate for music, or downsample to 22.05 kHz (voice) or 16 kHz (smallest) to save more. Downsampling trims high frequencies you rarely hear in speech.",
    },
    {
      title: "Compress",
      description:
        "Press Compress audio. A progress bar tracks the resample and MP3 encode locally, quick for short clips, longer for big files. Nothing is uploaded at any point.",
    },
    {
      title: "Check the size & download",
      description:
        "Read the original vs compressed size and the percentage saved to confirm you hit your target, then download, or reset and re-run at a different setting for a different balance.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster / Creator",
      title: "Shrink an episode to upload fast",
      description:
        "A long WAV or high-bitrate export is slow to upload and eats hosting quota. Compress it to a 96–128 kbps MP3 at 22.05 kHz, a fraction of the size, still perfectly clear for speech, and it uploads in seconds.",
    },
    {
      audience: "Anyone emailing audio",
      title: "Get a big file under the attachment cap",
      description:
        "Email and chat apps reject audio over a few megabytes. Drop the file, pick 96 or 128 kbps, and the size readout confirms it now fits so it actually sends instead of bouncing.",
    },
    {
      audience: "Musician / Producer",
      title: "Make a lightweight demo copy",
      description:
        "Your session bounces a heavy master, but a demo for a group chat or playlist doesn't need lossless. Compress a clean 160–192 kbps MP3 that's small to share while still sounding musical.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Compress a private recording locally",
      description:
        "An interview, a medical note or a confidential voice memo shouldn't be uploaded to a stranger's compressor. Shrink it entirely in your browser so the audio never leaves the device.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. All decoding, resampling and MP3 encoding happen locally in your browser using the native Web Audio API and the in-browser lamejs encoder. Your file never leaves the tab. There's no upload step, nothing is stored or logged, and it's safe for private or confidential recordings. Close the tab and every byte is gone.",
    },
    {
      question: "How does it actually make the file smaller?",
      answer:
        "It moves the two settings that control file size: the MP3 bitrate (kilobits of audio detail kept per second) and the sample rate (how often the waveform is measured). Lowering either discards data, which is exactly how compression shrinks a file. Bitrate maps almost linearly to size, so halving it roughly halves the weight. Downsampling saves more on top by removing high frequencies.",
    },
    {
      question: "How small can I make my file?",
      answer:
        "It depends on the source length and your settings. As a rough guide, a one-minute clip at 128 kbps is about 1 MB, at 96 kbps about 0.7 MB, and lower still if you also downsample to 16 kHz. The tool shows the exact resulting bytes and the percentage saved, so you can dial the settings until you hit your target size.",
    },
    {
      question: "Will compressing reduce the quality?",
      answer:
        "Yes. Compression works by discarding detail, so lower settings sound less rich, and downsampling removes treble you can't recover. For speech the loss is usually inaudible even at 96 kbps / 22.05 kHz. For music, stay at 160–192 kbps and keep the original sample rate. Compressing an already-lossy source like an M4A re-encodes it, which can only lose a little more, never restore quality.",
    },
    {
      question: "What settings should I use for voice vs music?",
      answer:
        "For voice (podcasts, memos, audiobooks): 96–128 kbps and 22.05 or 16 kHz gives the smallest files with no meaningful loss. For music: 160–192 kbps and keep the original 44.1 kHz sample rate so instruments and cymbals stay clean. When in doubt, start at 128 kbps / original rate and check the size readout.",
    },
    {
      question: "Which formats can I compress?",
      answer:
        "Anything your browser can decode, commonly WAV, MP3, M4A/AAC, OGG, FLAC (on most browsers) and WEBM audio. If a file loads and shows a waveform, it will compress. The output is always a standard MP3, since that's the format that combines small size with universal playback. DRM-protected purchases and exotic raw codecs are the main exceptions.",
    },
    {
      question: "How large a file can I compress?",
      answer:
        "Because everything runs in your browser's memory, the ceiling is your device's RAM rather than a fixed upload limit. Songs, podcast segments and voice memos up to many minutes run comfortably on a typical laptop. A multi-hour recording can use significant memory and briefly pause the tab. For the longest files, trim first (see the Audio Trimmer) or compress in shorter sections.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's no install, no plugin, no sign-up and no watermark or audible tag on the output. Open the page, drop your audio, pick your settings, compress and download, the lamejs encoder loads automatically the first time and everything runs in the tab.",
    },
  ],

  tips: [
    "For speech-only content, 96–128 kbps at 22.05 kHz is usually indistinguishable from the original and a small fraction of the size.",
    "Bitrate roughly maps to size, halving the bitrate roughly halves the file, so it's your fastest lever when you need to hit an exact cap.",
    "Keep music at 44.1 kHz and 160–192 kbps. Downsampling music to 16 kHz makes it sound dull because it removes the highs.",
    "Compress from a lossless source (WAV or FLAC) when you can, re-compressing an existing MP3 or M4A only adds loss on top of loss.",
    "Watch the before/after readout: if you're still over your limit at 96 kbps, the file is probably just long. Trim it rather than pushing quality lower.",
  ],

  troubleshooting: [
    {
      problem: "My file wouldn't load or decode.",
      solution:
        "The compressor can only handle audio your browser can decode. Most WAV, MP3, M4A/AAC, OGG and (on most browsers) FLAC files work. A DRM-protected purchase, a raw/exotic codec or a corrupt file may not. Try re-exporting the source to WAV first, then compress that.",
    },
    {
      problem: "The file didn't get much smaller.",
      solution:
        "If the source is already a low-bitrate MP3, there's little left to remove: re-encoding it can even add a touch of size from headers. Compression saves the most on lossless WAV/FLAC sources. Also lower the sample rate for voice, and remember that a very long file stays large at any bitrate. Trim it if you need a dramatic cut.",
    },
    {
      problem: "The compressed audio sounds muffled or dull.",
      solution:
        "That usually means the sample rate was dropped too far for the content. 16 kHz is fine for speech but strips the highs from music. Re-run keeping the original sample rate and use a higher bitrate (160–192 kbps) for anything musical.",
    },
    {
      problem: "The tab got slow or ran out of memory on a very long file.",
      solution:
        "Resampling and encoding hold the decoded audio in memory, so a multi-hour recording on a low-memory device can strain the tab. Close other heavy tabs and try again. For the longest files, trim the audio first or compress in shorter sections.",
    },
  ],

  security:
    "Your audio is decoded, resampled and re-encoded entirely in your browser using the native Web Audio API and the in-browser lamejs MP3 encoder. Nothing is ever uploaded to a server, stored or logged, so you can safely compress interviews, voice memos and unreleased tracks. There's no upload step and no cloud copy. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, in-browser audio compression to MP3 with selectable 96–320 kbps CBR bitrates, native Web Audio decoding, a source waveform preview, an exact before/after size and percentage-saved readout, and one-click download.",
    },
    {
      date: "2026-06-26",
      change:
        "Added optional sample-rate downsampling (48/44.1 → 22.05 / 16 kHz) via an offline resample for much smaller voice files, plus clearer voice-vs-music guidance on the settings.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved memory handling on long files and added drag-and-drop plus reset-and-retry so you can re-compress at a new bitrate or sample rate without reloading the page.",
    },
  ],

  relatedTools: [
    "mp3-converter",
    "audio-trimmer",
    "audio-normalizer",
    "audio-cutter",
  ],
};

export default audioCompressor;
