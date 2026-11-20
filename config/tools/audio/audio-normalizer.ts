import type { Tool } from "@/types";

/**
 * Audio Normalizer, the flagship of the GigAI Audio Toolkit and the showcase
 * for the native Web Audio engine. Drop a clip, pick a normalisation mode (peak
 * to maximise headroom, or RMS to lift perceived loudness) and a target ceiling,
 * and the tool re-levels the whole track entirely on-device, then shows the
 * before/after waveform side by side with a preview player and one-click WAV/MP3
 * download. Every string below is written for the specific queries people type
 * when a recording is "too quiet", "uneven volume", "needs to match loudness" -
 * nothing is shared with the video or image copy, and no claim outruns what a
 * single gain-based normaliser actually does (it is honest that peak/RMS
 * normalisation is not broadcast LUFS loudness matching and can't fix clipping
 * already baked into the source).
 */
const audioNormalizer: Tool = {
  slug: "audio-normalizer",
  title: "Audio Normalizer",
  category: "audio-tools",
  group: "Process",
  icon: "Gauge",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-14",

  description:
    "Normalize audio volume in your browser: lift a too-quiet recording to a clean target level with peak or RMS normalisation, compare the before/after waveform, then download WAV or MP3. Nothing is uploaded.",

  h1: "Audio Normalizer, Level Volume Online with Web Audio",
  tagline:
    "Drop a recording that's too quiet, too hot or all over the place and watch it settle to a clean, consistent level. Real peak and RMS normalisation with a before/after waveform, a live preview and lossless WAV or MP3 export: all in your browser, never uploaded.",
  longDescription:
    "The GigAI Audio Normalizer runs entirely on the native Web Audio engine your browser already ships with, so it can decode a clip, measure it, and re-level every sample without ever sending your audio to a server. Voice memos recorded across a room, interview tracks where one speaker is buried, podcast segments cut from different sessions, and songs exported too quiet all share the same problem, their level is wrong for where you need to play them, and reaching for a full DAW just to raise the volume is overkill. Drop your file, choose how to normalise (peak, which lifts the track so its single loudest moment just reaches your ceiling without clipping, or RMS, which raises the average energy so the whole thing feels louder), set a target in dBFS, and the tool computes the exact gain and applies it to the entire signal in one pass. When it finishes you get the original waveform above the normalised one, a preview player to confirm it sounds right, and the measured peak and RMS before and after, then download a lossless 16-bit WAV or an MP3 encoded locally in your browser. Because everything is client-side there is no upload wait and no privacy tradeoff: personal recordings, unreleased mixes and confidential interviews never leave your machine. Be honest about what normalisation is: it applies one gain factor to make a quiet track louder or a hot track safe. It is not multiband compression, it can't un-clip audio that was already recorded too hot, and peak/RMS targets are not the same as the broadcast LUFS loudness spec that streaming platforms measure. Close the tab and every sample is gone.",

  ctaText: "Normalize audio",

  keywords: [
    "audio normalizer",
    "normalize audio online",
    "normalize volume",
    "increase audio volume",
    "peak normalization",
    "rms normalization",
    "level audio volume",
    "normalize mp3",
    "normalize wav",
    "fix quiet recording",
  ],

  seo: {
    title: "Audio Normalizer, Normalize Volume Online Free | GigAI Tools",
    description:
      "Free online audio normalizer on the native Web Audio engine. Level a quiet or uneven recording with peak or RMS normalisation, compare the before/after waveform, and export WAV or MP3, 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC"],
    output: ["WAV", "MP3"],
  },

  features: [
    {
      icon: "Gauge",
      title: "Peak or RMS, your call",
      description:
        "Peak normalisation lifts the track so its loudest sample just kisses your ceiling: perfect for rescuing a quiet recording without clipping. RMS raises average energy so the whole clip feels louder. Pick the one that fits the job.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Set an exact dBFS target",
      description:
        "Aim at a precise ceiling: a common −1 dBFS for a safe max, −3 dBFS for streaming headroom, or wherever you need. The tool computes the gain to hit it and applies it to every sample in a single clean pass.",
    },
    {
      icon: "AudioLines",
      title: "Before / after waveform",
      description:
        "See the original envelope stacked above the normalised one, so the level change is obvious at a glance. Not a vague 'processed' badge. The shape is preserved. Only the amplitude scales.",
    },
    {
      icon: "PlayCircle",
      title: "Preview before you download",
      description:
        "The normalised result plays right in the page on a waveform player so you can confirm it sounds balanced and nothing distorts before you commit, the safety net a command line never gives you.",
    },
    {
      icon: "FileAudio",
      title: "Lossless WAV or local MP3",
      description:
        "Export a clean 16-bit PCM WAV to keep every sample for further editing, or an MP3 encoded entirely in your browser for a smaller share-ready file. No exotic codec loads for either.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, measuring and re-levelling all happen on your device with the native Web Audio engine. Voice memos, interviews and unreleased mixes are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Rescue a recording that's too quiet",
      description:
        "A voice memo taped across a room or an export that came out low is unusable at normal volume. Peak-normalise it to −1 dBFS and it lifts to full, clean level in one pass. No hunting through a DAW.",
    },
    {
      title: "Even out a batch to a shared level",
      description:
        "Segments cut from different sessions rarely match. Normalising each to the same target gets them into the same ballpark so listeners aren't reaching for the volume knob between clips.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server normalisers make you upload the file first and trust them with it. Here the audio never leaves your browser, so there's no upload bar and nothing to trust: safe for private or confidential recordings.",
    },
    {
      title: "Hear it before you keep it",
      description:
        "The before/after waveform and the preview player let you confirm the level is right and nothing clipped at your chosen target before you download. No re-doing a bad export.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It's decoded locally and you'll see its waveform, duration and channel layout immediately.",
    },
    {
      title: "Choose mode and target",
      description:
        "Pick Peak (maximise headroom without clipping) or RMS (lift perceived loudness), then set a target ceiling in dBFS. −1 is a safe default for a loud, clean result.",
    },
    {
      title: "Normalize",
      description:
        "Press Normalize. The whole track is re-levelled on your device in one fast pass. No engine download, no upload, no waiting on a server.",
    },
    {
      title: "Compare, preview & download",
      description:
        "Read the before/after peak and RMS, see both waveforms, play the preview to confirm it sounds right, then download a lossless WAV or a browser-encoded MP3, or start over with a different target.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster / Interviewer",
      title: "Level a quiet interview track",
      description:
        "One guest recorded far quieter than the host. Normalise the buried track up to a matching ceiling so both voices sit at a comfortable, consistent level before you mix.",
    },
    {
      audience: "Musician / Producer",
      title: "Bring a low export up to level",
      description:
        "A bounce came out several dB under where it should be. Peak-normalise it to −1 dBFS to get a full-scale, clean master reference without re-exporting from the session.",
    },
    {
      audience: "Content creator",
      title: "Match voiceover clips before editing",
      description:
        "Voiceover takes recorded on different days drift in level. Normalise each to the same RMS target so they cut together smoothly instead of jumping in loudness.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Boost a sensitive recording locally",
      description:
        "A confidential memo or a personal voice note that's too quiet shouldn't be uploaded to a stranger's server to be levelled. Do it entirely in your browser so nothing ever leaves the device.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. All decoding, measuring and re-levelling happen locally in your browser using the native Web Audio engine (AudioContext and OfflineAudioContext). Your file never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for personal, confidential or unreleased audio. MP3 export is encoded in your browser too, so even the download step reaches out to no server.",
    },
    {
      question: "What's the difference between peak and RMS normalisation?",
      answer:
        "Peak normalisation looks at the single loudest sample in the track and applies one gain so that peak just reaches your target ceiling. It maximises level without any clipping, which is ideal for lifting a quiet recording safely. RMS normalisation instead raises the average energy of the whole clip toward the target, so it feels louder overall. Because that can push transient peaks past the ceiling, the tool hard-limits them to prevent digital overflow. Use peak to rescue headroom, RMS to make something feel louder.",
    },
    {
      question: "Is this the same as LUFS loudness normalisation for streaming?",
      answer:
        "No, and it's important to be honest about that. Peak and RMS normalisation apply a single gain based on a simple amplitude measurement. Broadcast and streaming loudness targets (like −14 LUFS on many platforms) use a perceptual, frequency-weighted model averaged over time, which is a different and more involved measurement. This tool gets you a consistent, clean level fast and is perfect for rescuing quiet audio and roughly matching clips, but it is not a substitute for a dedicated LUFS meter when a platform mandates an exact integrated-loudness spec.",
    },
    {
      question: "Can normalising fix audio that's already distorted or clipped?",
      answer:
        "Unfortunately no. Normalisation only scales the volume up or down. It can't recover detail that was lost when audio was recorded or exported too hot and clipped. If the source is already distorted, turning it down makes it quieter but still distorted. Normalisation is for level, not repair. The fix for clipping is to re-record or re-export the source at a safer input level.",
    },
    {
      question: "Which formats can I normalise, and what do I get back?",
      answer:
        "You can drop anything your browser can decode, MP3, WAV, M4A/AAC, OGG and, on most browsers, FLAC. The output is a lossless 16-bit PCM WAV (which keeps every sample for further editing) or an MP3 encoded locally in your browser at your chosen bitrate. Neither export loads any heavyweight codec, so both are fast and fully on-device.",
    },
    {
      question: "Why should I export WAV while editing and only make an MP3 at the end?",
      answer:
        "MP3 is lossy: it discards some audio data to shrink the file, and that loss can't be recovered. If you're going to keep editing (trimming, merging, fading) normalise to a lossless WAV and keep it as your working master, then encode to MP3 only as the final delivery step so the loss is limited to a single pass. If this is your last step and you just need a small file to share, exporting MP3 directly is perfectly fine.",
    },
    {
      question: "How long a clip can I normalise in the browser?",
      answer:
        "Because everything runs in your browser's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. Songs, podcast segments and voice memos up to many minutes run comfortably on a typical laptop. Very long recordings (a multi-hour interview) hold every sample in memory and can briefly pause the tab while measuring and re-rendering. For the longest files, trimming down first keeps everything responsive.",
    },
    {
      question: "Will normalising change the sound other than the volume?",
      answer:
        "For peak mode, no, it's a single uniform gain, so the waveform's shape and tonal balance are identical, just scaled to a new level. RMS mode is also a uniform gain, but because it targets average energy it can drive peaks into the ceiling, where a hard limiter clamps them to prevent clipping. On already-loud material that limiting can be audible. If you want a completely transparent lift with no limiting, choose peak.",
    },
  ],

  tips: [
    "Start with Peak at −1 dBFS, it's the safe, transparent way to bring almost any quiet clip up to a full, clean level.",
    "Reach for RMS when a clip is loud enough at its peaks but still feels quiet overall (lots of dynamic range). It lifts the average, not just the loudest moment.",
    "Always play the preview before downloading, it's the fastest way to catch a target that pushed RMS material into audible limiting.",
    "Normalising several clips to the same target gets them close, but for a truly matched set, listen and nudge each one, perceived loudness isn't purely a number.",
    "Keep a lossless WAV as your master if you'll edit further. Only encode to MP3 as the final step to avoid compounding lossy generations.",
  ],

  troubleshooting: [
    {
      problem: "The output barely got louder.",
      solution:
        "Your source probably already peaks near the ceiling, so there's little headroom to gain in Peak mode. The loudest sample is already close to the target. If it still feels quiet, switch to RMS mode to lift the average energy, and check your target isn't set lower than the source's existing peak.",
    },
    {
      problem: "The normalised audio sounds distorted or pumped.",
      solution:
        "That usually means RMS mode drove the peaks into the hard limiter on already-loud material. Lower the target a few dB, or switch to Peak mode for a completely transparent gain with no limiting. If the distortion was in the original file, normalisation can't remove it: the source itself is clipped.",
    },
    {
      problem: "Nothing happened. It sounds the same.",
      solution:
        "If the track is effectively silent, there's nothing to normalise and the tool leaves it unchanged rather than amplifying noise to full scale. Otherwise the source may already be at your target level. Try a different mode or a slightly higher ceiling and compare the before/after peak and RMS readouts.",
    },
  ],

  security:
    "Your audio is decoded, measured and re-levelled entirely in your browser using the native Web Audio engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely normalise personal, confidential or unreleased recordings. WAV and MP3 export both happen on-device with no exotic codec download. There's no upload step and no cloud copy, so close the tab and every sample is gone.",

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release, native Web Audio peak and RMS normalisation with an exact dBFS target, a stacked before/after waveform, a preview player, measured before/after peak & RMS, and one-click lossless WAV download.",
    },
    {
      date: "2026-06-21",
      change:
        "Added in-browser MP3 export with a bitrate selector (encoded locally, no engine download), plus clearer honest guidance distinguishing peak/RMS normalisation from LUFS loudness targets.",
    },
    {
      date: "2026-06-28",
      change:
        "Refined the RMS hard-limiter behaviour to reduce audible pumping on hot material, improved the silent-track guard, and added drag-and-drop plus reset-and-retry to the workspace.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "mp3-converter",
    "audio-recorder",
    "audio-merger",
    "ringtone-maker",
  ],
};

export default audioNormalizer;
