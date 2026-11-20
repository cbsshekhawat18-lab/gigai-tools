import type { Tool } from "@/types";

/**
 * Audio Reverse, flip a track so it plays backwards, end to first. Drop any
 * file the browser can decode, watch a real waveform paint instantly (no upload,
 * no WASM), preview the reversed result, then download a lossless WAV. The
 * reversal is a pure Web Audio sample-order flip, bit-for-bit the same samples,
 * just walked from the last frame to the first, so it's exact, instant and
 * entirely private. Every string below is written for what people actually
 * search ("reverse an audio clip", "play a song backwards", "backmasking",
 * "reversed cymbal swell") and shares no copy with the trimmer, converter or any
 * video/image tool.
 */
const audioReverse: Tool = {
  slug: "audio-reverse",
  title: "Audio Reverse",
  description:
    "Reverse audio in your browser: drop an MP3, WAV, M4A or OGG and it plays backwards, sample-for-sample. See the waveform, preview the reversed track, then download a lossless WAV. Instant, exact and 100% private. Nothing is uploaded.",
  category: "audio-tools",
  group: "Edit",
  icon: "Rewind",
  accent: "violet",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",

  h1: "Reverse Audio Online, Play MP3, WAV & M4A Backwards",
  tagline:
    "Drop a track and it flips end to first: a clean, sample-accurate reversal you can see on the waveform and hear before you save. No upload, no re-encoding artifacts, no account. The whole thing runs in your browser and downloads as a lossless WAV.",
  longDescription:
    "The GigAI Audio Reverse tool takes your track and plays it backwards by walking the samples from the very last frame to the very first: a true reversal, not a trick of playback speed. Because it decodes your file with the browser's native Web Audio API the instant you drop it, you see a real waveform of the source, preview the reversed output right in the tab, and download a lossless 16-bit WAV that is bit-for-bit the same audio, only mirrored in time. Reversing is one of the oldest and most creative moves in audio: a reversed cymbal makes the classic \"swell\" that rushes into a downbeat, a reversed vocal is the backmasking trick behind decades of hidden messages and eerie textures, and reversing a chopped word or riser gives you an instant transition or sound-design element. It's also a genuinely useful analysis tool, flip a phrase to hear whether that \"hidden lyric\" is really there, or reverse a sample twice to confirm a process is lossless. Every channel is handled independently, so stereo imaging is preserved (just mirrored), and there is no pitch change, no time-stretch and no quality loss on the WAV path: the reversal only reorders existing samples. All of this happens on your device: the file is decoded, reversed and encoded in the browser, so voice notes, unreleased stems and private recordings never touch a server. There's no upload bar, no queue, no watermark and no sign-up. Reverse it, listen, download, and if you want the effect on a specific section only, trim the clip first and reverse the piece.",

  ctaText: "Reverse audio",

  keywords: [
    "reverse audio",
    "reverse audio online",
    "play audio backwards",
    "reverse mp3",
    "reverse song online",
    "backwards audio",
    "audio reverser",
    "backmasking tool",
    "reverse a sound",
    "reverse wav",
    "reverse cymbal",
    "flip audio",
    "reversed vocal effect",
    "browser audio reverser",
  ],

  seo: {
    title: "Reverse Audio Online Free, Play MP3, WAV, M4A Backwards | GigAI Tools",
    description:
      "Free online audio reverser. Drop an MP3, WAV, M4A or OGG and it plays backwards, sample-for-sample. See the waveform, preview the reversed track and download a lossless WAV, instant, exact and 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: ["WAV"],
  },

  features: [
    {
      icon: "Rewind",
      title: "A true, sample-accurate reversal",
      description:
        "The track is flipped by walking its samples from the last frame to the first, a real reversal, not a slowed or scrubbed playback. Reverse it twice and you're back to the original, bit for bit.",
    },
    {
      icon: "AudioWaveform",
      title: "See it on a real waveform",
      description:
        "Your file decodes natively and paints as a crisp waveform, so you can watch the shape of the sound and confirm you loaded the right take before you flip it.",
    },
    {
      icon: "PlayCircle",
      title: "Preview before you download",
      description:
        "Hear the reversed result in the tab with a custom player and seekable waveform, so you catch the effect (a reversed swell, a backmasked line) before you ever save a file.",
    },
    {
      icon: "Headphones",
      title: "Stereo preserved, no quality loss",
      description:
        "Every channel is reversed independently, so stereo imaging is kept (just mirrored in time). There's no pitch shift, no time-stretch and no re-compression on the lossless WAV output.",
    },
    {
      icon: "Zap",
      title: "Instant and offline-friendly",
      description:
        "Reversal is pure Web Audio math. No WASM to fetch, no encoder to spin up beyond native WAV. It runs the moment your file decodes, with no upload wait and no server round-trip.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, reversing and encoding all happen in your browser. Unreleased stems, voice notes and personal clips are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Get the classic reverse effects in seconds",
      description:
        "Reversed cymbal swells, backwards vocals and rising risers are a drag-and-drop away. No DAW, no plugins, no install, just drop, flip and download.",
    },
    {
      title: "Exact and lossless",
      description:
        "The reversal only reorders samples that already exist, and WAV export re-compresses nothing, so the output is bit-for-bit the source played backwards: perfect for layering into a mix.",
    },
    {
      title: "No upload, no wait",
      description:
        "The file is decoded and reversed on your device, so even a long recording flips instantly with no upload bar, no queue and no account.",
    },
    {
      title: "Private by design",
      description:
        "Because nothing leaves the tab, you can reverse a confidential recording or an unreleased demo without trusting it to anyone else's server.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It decodes locally in a moment and a waveform of the whole track appears with its length and channel layout.",
    },
    {
      title: "Preview the reversed track",
      description:
        "Press preview to flip the audio in the browser and hear it backwards on a seekable player, confirm the swell, the backmasked line or the transition sounds the way you want.",
    },
    {
      title: "Reverse and download",
      description:
        "Run the reversal to produce a lossless WAV, check the output, and download it, or reset and drop a different file. To reverse just one section, trim the clip first and flip the piece.",
    },
  ],

  useCases: [
    {
      audience: "Producer / Beatmaker",
      title: "Reversed swells, risers and transitions",
      description:
        "Flip a cymbal, a piano chord or a vocal chop to build the classic sucked-in swell that rushes into a downbeat, or make a reverse riser to lead into a drop, then drop the lossless WAV into your DAW.",
    },
    {
      audience: "Content creator",
      title: "Backwards SFX and eerie textures",
      description:
        "Reverse a whoosh, a laugh or a spoken line for a glitchy, uncanny effect in a video, podcast sting or game. No editing suite required, straight in the browser.",
    },
    {
      audience: "Curious listener",
      title: "Check a backmasking claim",
      description:
        "Reverse a phrase to hear for yourself whether a supposed hidden message is really there, using the same technique that put those \"secret lyrics\" in the source in the first place.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Reverse sensitive audio locally",
      description:
        "Flip a confidential recording or an unreleased stem entirely on your device, so the material is never uploaded to a stranger's server to be processed.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. Your file is decoded, reversed and encoded entirely in your browser using the native Web Audio API. It never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for private voice notes, interviews and unreleased music.",
    },
    {
      question: "Is the reversal a real reverse or just backwards playback?",
      answer:
        "It's a real reversal. The tool rewrites the audio so its samples run from the last frame to the first, then encodes that as a new file, so the reversed track is a genuine, saveable audio file, not just a player scrubbing backwards. Reverse it twice and you get the exact original back.",
    },
    {
      question: "Does reversing change the pitch or speed?",
      answer:
        "No. Reversing only reorders the existing samples (it doesn't stretch or resample anything) so the pitch and tempo are identical to the source, just heard back to front. Individual sounds keep their attack and decay swapped, which is the effect you're after.",
    },
    {
      question: "Will I lose any quality?",
      answer:
        "Not on the WAV path. The reversal reuses the original samples with no re-compression, and WAV is a lossless container, so the output is bit-for-bit the source played backwards. Reversing a lossless file twice returns exactly the original bytes.",
    },
    {
      question: "Can I reverse just one part of the track?",
      answer:
        "This tool reverses the whole file so it's fast and predictable. To flip a single section, trim the clip to that region first with the Audio Trimmer, reverse the piece here, then merge it back with the Audio Merger, all in the browser.",
    },
    {
      question: "What can I drop, and what do I get back?",
      answer:
        "You can drop anything your browser can decode, MP3, WAV, M4A/AAC, OGG, FLAC, Opus and WebM audio. The reversed output is a lossless 16-bit WAV, which is ideal for layering into a DAW or feeding into another GigAI audio tool.",
    },
    {
      question: "Is there a length or size limit?",
      answer:
        "There's no hard limit, but in-browser processing is memory-bound: the whole decoded track is held in memory, so on a low-RAM device a very long or very large file may run slowly or fail. For big inputs, use a browser with more memory available or reverse the file in parts.",
    },
    {
      question: "Do I need to install anything or sign up?",
      answer:
        "No. There's no install, no plugin, no account and no watermark. Open the page, drop a file, preview it backwards, and download. The whole reverser runs client-side, and once the page is loaded it needs no network.",
    },
  ],

  tips: [
    "Chasing the classic swell? Reverse a cymbal crash or a sustained chord, then line its tail up with the downbeat in your DAW so it rushes in.",
    "Reverse a clip, layer it under the forward version, and you get a subtle doubled texture, great for pads and atmospheres.",
    "To reverse only a phrase, trim it out first with the Audio Trimmer, flip it here, then stitch it back with the Audio Merger.",
    "Checking backmasking? Use headphones and preview a couple of times: reversed speech is easy to mishear, so don't trust the first pass.",
    "Reverse twice to sanity-check a lossless workflow: a true reversal round-trips to the exact original samples.",
  ],

  troubleshooting: [
    {
      problem: "The file won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively, usually a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG, or convert it first with the Audio Converter and reverse the result here.",
    },
    {
      problem: "The reversed track sounds the same as the original.",
      solution:
        "Some sounds (steady tones, sustained pads, symmetric noise) are nearly time-symmetric, so their reverse is hard to distinguish. Try a clip with a clear attack and decay (a drum hit, a spoken word) to hear the effect plainly.",
    },
    {
      problem: "The tab is slow or ran out of memory on a big file.",
      solution:
        "In-browser audio holds the whole decoded track in RAM. Close other heavy tabs and retry. If it still struggles, the file is likely too large for this device, reverse it in parts, or use a machine with more memory.",
    },
  ],

  security:
    "Your audio is decoded, reversed and encoded entirely in your browser using the native Web Audio API. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely reverse confidential recordings, voice notes and unreleased music. The reversal only reorders existing samples and WAV export is a lossless, native operation, so there is no cloud copy and no upload step. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, drop-to-decode with a native Web Audio waveform, a true sample-accurate reversal (last frame to first), in-tab preview of the reversed track, and lossless WAV export with one-click download.",
    },
    {
      date: "2026-06-24",
      change:
        "Added a seekable preview player, before/after size on the result, per-channel reversal to preserve stereo imaging, and honest guidance on memory limits and time-symmetric sounds.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-merger",
    "audio-converter",
    "volume-booster",
  ],
};

export default audioReverse;
