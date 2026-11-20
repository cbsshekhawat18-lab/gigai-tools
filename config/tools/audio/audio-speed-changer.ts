import type { Tool } from "@/types";

/**
 * Audio Speed Changer: the GigAI Audio Toolkit's tempo tool. Drop a track, a
 * real waveform paints instantly (native Web Audio, no upload, no WASM), then a
 * single slider stretches or compresses it anywhere from a slow 0.5× to a brisk
 * 2×. A live readout shows the new duration before you commit, you preview the
 * sped-up result in the tab, and you export a lossless WAV or a compact MP3.
 *
 * The copy below is written for what people actually search, "speed up a song",
 * "slow down audio to learn a solo", "make a voice note play faster", "2x an
 * audiobook", and shares no string with the trimmer, converter or any video /
 * image tool. Two real engines: "keep pitch" (the default) runs genuine WSOLA
 * time-stretching, so duration changes while pitch stays put; switching it off
 * does a fast linear resample where pitch rises and falls with speed (the
 * classic tape / vinyl effect). Web Audio has no time-stretch primitive, so it
 * is implemented in lib/audio-tools/timestretch. Nothing leaves the tab.
 */
const audioSpeedChanger: Tool = {
  slug: "audio-speed-changer",
  title: "Audio Speed Changer",
  description:
    "Speed up or slow down audio in your browser with a real waveform: drop an MP3, WAV, M4A or OGG, drag a slider from 0.5× to 2×, optionally keep the pitch, preview the result, then download a lossless WAV or a compact MP3. 100% private. Nothing is uploaded.",
  category: "audio-tools",
  group: "Edit",
  icon: "Gauge",
  accent: "rose",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",

  h1: "Audio Speed Changer, Speed Up or Slow Down MP3 & WAV Online",
  tagline:
    "Drop a track and a real waveform paints in an instant. Drag a single slider to stretch it slower or push it faster, anywhere from 0.5× to 2×, keep the pitch if you like, hear the result before you commit, then download a lossless WAV or a small MP3. Entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Audio Speed Changer decodes your file with the browser's native Web Audio API the moment you drop it, paints a crisp waveform of the whole track, and gives you one clean control: a speed slider from 0.5× (half as fast, twice as long) up to 2× (twice as fast, half as long), with handy presets for the common ratios. As you drag, a live readout shows the target speed and the exact new duration, so you know before you run whether that 12-minute lecture becomes a tight 8 minutes at 1.5× or that tricky guitar lick slows to a learnable crawl at 0.6×. \"Keep pitch\" is on by default and it does the real thing: a WSOLA time-stretch that lays overlapping grains of your audio down at a new spacing, aligning each one to the waveform it follows, so the track genuinely gets shorter or longer while every voice and note stays at its original pitch. A lecture at 1.5× is the same speaker talking faster, not a chipmunk. Web Audio has no time-stretch primitive: a browser's playbackRate is just a resample in disguise, which is why so many online speed tools quietly shift pitch even with the box ticked, so we implemented one. Turn it off and you get the fast linear resample instead: the same physics as speeding up a tape or slowing a record, ideal when you actually want that effect. Beyond roughly 0.5×–2× the stretch can add mild warble, and dense music artifacts more than speech. Preview the processed audio right in the tab, then export a lossless 16-bit WAV (ideal for further editing) or a compact MP3 for sharing. WAV is written natively and the MP3 encoder loads only if you choose MP3, so a simple speed change never pulls a heavyweight download. Everything happens on your device: voice notes, lecture recordings, unreleased demos and private audio are decoded, retimed and encoded in the tab and never touch a server. No upload wait, no account, no watermark. Close the tab and every byte is gone.",

  ctaText: "Change speed",

  keywords: [
    "audio speed changer",
    "speed up audio online",
    "slow down audio",
    "change audio tempo",
    "speed up mp3",
    "slow down mp3",
    "speed up a song online",
    "slow down music to learn",
    "audio tempo changer",
    "make audio faster",
    "playback speed changer",
    "change speed keep pitch",
    "slow down song without changing pitch",
    "browser audio speed tool",
  ],

  seo: {
    title:
      "Audio Speed Changer: Speed Up or Slow Down MP3 & WAV Online Free | GigAI Tools",
    description:
      "Free online audio speed changer with a real waveform. Drop an MP3, WAV, M4A or OGG, drag a slider from 0.5× to 2×, optionally keep the pitch, preview the result, and download a lossless WAV or compact MP3: 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: ["WAV", "MP3"],
  },

  features: [
    {
      icon: "Gauge",
      title: "One slider, 0.5× to 2×",
      description:
        "Drag a single control, or tap a preset, to stretch a track slower or push it faster. A live readout shows the target speed and the exact new duration before you commit.",
    },
    {
      icon: "AudioWaveform",
      title: "See it on a real waveform",
      description:
        "Your file is decoded natively and drawn as a crisp waveform, so you're retiming a track you can actually see. Not a hidden file behind a progress bar.",
    },
    {
      icon: "Music",
      title: "Keep the pitch, or don't",
      description:
        "Keep pitch is on by default, a real WSOLA time-stretch, so speech and music hold their original key at any speed. Switch it off for the classic tape / vinyl effect where pitch moves with speed.",
    },
    {
      icon: "PlayCircle",
      title: "Preview before you export",
      description:
        "Hear the retimed audio right in the tab with a custom player, so you confirm the pace and pitch feel right before you download a single file.",
    },
    {
      icon: "FileAudio",
      title: "Lossless WAV or compact MP3",
      description:
        "Export a bit-perfect 16-bit WAV for further editing, or a small MP3 for sharing. WAV is native. The MP3 encoder loads only when you pick MP3.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, retiming and encoding all run in your browser. Lecture recordings, voice notes and unreleased tracks are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Know the new length before you run",
      description:
        "The live duration readout means no guesswork. You can dial 1.5× and see a 12-minute recording become 8 minutes instantly, then adjust to hit the pace you want.",
    },
    {
      title: "Instant, with no upload wait",
      description:
        "The file is decoded locally the moment you drop it and the speed change runs on-device, so there's no upload bar, no queue and no server round-trip.",
    },
    {
      title: "Two honest modes",
      description:
        "Two genuinely different engines, not one with a checkbox: real time-stretching for a natural result, or a fast pitch-follows-speed resample for effects: with a clear note on what each actually does.",
    },
    {
      title: "Private by design",
      description:
        "Because nothing leaves the tab, you can safely retime sensitive material (a confidential interview, a medical note, an unreleased demo) without trusting it to anyone.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It decodes locally in a moment and a waveform of the whole track appears with its length and channel layout.",
    },
    {
      title: "Set the speed",
      description:
        "Drag the slider or tap a preset between 0.5× and 2×. Watch the live readout show the new speed and the exact resulting duration as you move it.",
    },
    {
      title: "Choose pitch behaviour",
      description:
        "“Keep pitch” starts on, which is what you want for speech, lectures and practice. Switch it off for the classic tape effect where pitch moves with speed.",
    },
    {
      title: "Preview the result",
      description:
        "Press process to build the retimed audio, then play it back in the tab to check the pace and tone feel right before you download.",
    },
    {
      title: "Download or start over",
      description:
        "Pick WAV or MP3, check the before/after size, and download, or reset the speed and try a different ratio on the same file.",
    },
  ],

  useCases: [
    {
      audience: "Student / Listener",
      title: "Speed up a lecture or audiobook",
      description:
        "Push a recorded lecture or an audiobook to 1.25× or 1.5× to save time, keep pitch on so the speaker still sounds natural, and export a compact MP3 for your phone.",
    },
    {
      audience: "Musician / Learner",
      title: "Slow a solo down to learn it",
      description:
        "Drop a fast passage to 0.6× so you can hear every note. Use the default mode to lower the pitch with the tempo like a slowed record, or keep pitch to practice at the original key.",
    },
    {
      audience: "Creator / Editor",
      title: "Fit audio to a fixed slot",
      description:
        "Nudge a voiceover or a music bed a little faster or slower so it lands exactly in a video slot, previewing until the pace matches, then export a lossless WAV for the timeline.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Retime sensitive audio locally",
      description:
        "Slow a confidential interview for transcription, or speed a long note to skim it, entirely on your device, so the material is never uploaded to a stranger's server.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. Your file is decoded, retimed and encoded entirely in your browser using the native Web Audio API. It never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for private voice notes, lectures or unreleased music.",
    },
    {
      question: "Does changing the speed change the pitch?",
      answer:
        "By default, no. “Keep pitch” is on out of the box and performs a real time-stretch, so a track sped up to 1.5× keeps every voice and note at its original pitch. Turn “keep pitch” off and the answer becomes yes: the tool then does a fast linear resample, so speeding up raises the pitch and slowing down lowers it, exactly like a tape or a record.",
    },
    {
      question: "How does “keep pitch” actually work?",
      answer:
        "It uses WSOLA, Waveform Similarity Overlap-Add. Short overlapping grains of your audio are laid down at a new spacing to change the duration, and each grain's read position is nudged slightly to the offset that best continues the previous one, which keeps the waveform coherent instead of stuttering. Because every sample still plays at its original rate, pitch is untouched. It is a well-established technique rather than a browser trick: Web Audio has no time-stretch primitive, so this is implemented directly. Speech holds up excellently. Dense music can pick up mild warble past roughly 0.5×–2×.",
    },
    {
      question: "What speed range can I use?",
      answer:
        "Anywhere from 0.5× (half speed, twice as long) to 2× (double speed, half as long), with presets for the common ratios like 0.75×, 1.25× and 1.5×. The engine clamps to that range so the result stays usable and the file size stays sane.",
    },
    {
      question: "What formats can I use, and what do I get back?",
      answer:
        "You can drop anything your browser can decode, MP3, WAV, M4A/AAC, OGG, FLAC, Opus and WebM audio. You export either a lossless 16-bit WAV (great for further editing) or a compact MP3 (great for sharing). WAV is written natively. The MP3 encoder loads only if you choose MP3.",
    },
    {
      question: "Will the speed change reduce the quality?",
      answer:
        "The WAV path is a clean resample of the original samples with no lossy re-compression. If you export MP3, the audio is re-encoded once (as any MP3 export must be), so pick a higher bitrate for music. When you'll keep editing, choose WAV to keep it pristine.",
    },
    {
      question: "Is there a length or size limit?",
      answer:
        "There's no hard limit, but in-browser processing is memory-bound: the whole decoded track is held in memory, so on a low-RAM device a very long or very large file may run slowly or fail. For big inputs, use the browser with the most memory, or trim the file into parts first with the Audio Trimmer.",
    },
    {
      question: "Do I need to install anything or sign up?",
      answer:
        "No. There's no install, no plugin, no account and no watermark. Open the page, drop a file, set the speed, and download. The whole tool runs client-side.",
    },
  ],

  tips: [
    "For skimming speech, 1.25× to 1.5× with “keep pitch” on sounds completely natural. Push past 1.75× only when you already know the material.",
    "To learn a musical part, slow to 0.6×–0.75×. Leave pitch-follow on to hear it in a lower key, or keep pitch to practice at the original key.",
    "Watch the live duration readout to hit an exact target length, nudge the slider until the new duration matches your slot.",
    "Export WAV when you'll keep editing (it's lossless) and MP3 only when you need a small file to share.",
    "Big file running slow? Close other heavy tabs (in-browser audio is memory-bound) or trim it shorter first.",
  ],

  troubleshooting: [
    {
      problem: "The file won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively: most often a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG. If it's an exotic format, convert it first with the Audio Converter, then change its speed here.",
    },
    {
      problem: "Slowed-down or sped-up music sounds a bit artifacty.",
      solution:
        "Time-stretching trades a little smoothness for holding the pitch, and the trade gets steeper at extreme ratios, dense music and sharp transients show it first. Keep changes within roughly 0.5×–2× for the cleanest result, or turn “keep pitch” off if the classic tape effect is acceptable for your use.",
    },
    {
      problem: "The tab is slow or ran out of memory on a big file.",
      solution:
        "In-browser audio holds the whole decoded track in RAM, and slowing down makes an even longer buffer. Close other heavy tabs and retry. If it still struggles, trim the file shorter first or use a machine with more memory.",
    },
    {
      problem: "The exported MP3 sounds slightly softer than the source.",
      solution:
        "MP3 is lossy, so a single re-encode is unavoidable on that path. Raise the MP3 bitrate for music, or export WAV instead to keep the retimed audio as clean as the resample allows.",
    },
  ],

  security:
    "Your audio is decoded, retimed and encoded entirely in your browser using the native Web Audio API. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely change the speed of confidential interviews, lecture recordings and unreleased music. WAV export is a lossless, native operation and the MP3 encoder is only loaded if you choose MP3. There is no cloud copy and no upload step. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, drop-to-decode with a native Web Audio waveform, a 0.5×–2× speed slider with a live new-duration readout, in-tab preview, and lossless WAV export with one-click download.",
    },
    {
      date: "2026-06-24",
      change:
        "Added an optional “keep pitch” mode (offline resampler render), quick speed presets, and compact MP3 export with a selectable bitrate (encoder lazy-loaded only when MP3 is chosen).",
    },
    {
      date: "2026-06-30",
      change:
        "Added a before/after size comparison on the result, tightened honest guidance on pitch-preservation limits, and improved memory handling and abort behaviour for long recordings.",
    },
    {
      date: "2026-08-09",
      change:
        "“Keep pitch” now performs a real WSOLA time-stretch and is on by default. It previously rendered through AudioBufferSourceNode.playbackRate, which is itself a resample. It shifted pitch by exactly the same ratio as leaving the option off, so the setting had no audible effect. Speeding up speech now genuinely keeps the speaker's voice at its original pitch.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-normalizer",
    "mp3-converter",
    "audio-recorder",
  ],
};

export default audioSpeedChanger;
