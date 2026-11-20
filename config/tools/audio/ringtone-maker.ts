import type { Tool } from "@/types";

/**
 * Ringtone Maker, the fun, popular member of the GigAI Audio Toolkit. Drop a
 * song, drag a selection over a real waveform to grab the hook, cap it at a
 * ringtone-friendly length (up to ~40s), add a smooth fade-in and fade-out so
 * it never starts or ends with a jarring cut, preview just that clip, then
 * export an MP3 (universal) or an M4A/AAC (the container iPhone ringtones are
 * built from). Everything below is written for the exact things people search -
 * "make a ringtone from a song", "cut a 30 second clip for my ringtone",
 * "iphone ringtone m4r", with no string shared with the trimmer, fader, or any
 * video/image copy. The engine is honest: the trim and fade are pure native Web
 * Audio (fast, sample-accurate); MP3 uses a lazily-loaded encoder; M4A uses the
 * shared ffmpeg core that loads on demand ONLY when you pick M4A. Nothing ever
 * leaves the tab.
 */
const ringtoneMaker: Tool = {
  slug: "ringtone-maker",
  title: "Ringtone Maker",
  description:
    "Make a ringtone from any song in your browser. Drop an MP3, WAV, M4A or OGG, drag a selection over the waveform to grab the hook (up to ~40 seconds), add a smooth fade-in and fade-out, preview it, then download an MP3 or M4A/AAC. 100% private. Nothing is uploaded.",
  category: "audio-tools",
  group: "Edit",
  icon: "Bell",
  accent: "orange",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Ringtone Maker, Cut a Song into a Ringtone Online (MP3 & M4A)",
  tagline:
    "Turn any track into a phone-ready ringtone. Drop a song, drag over the waveform to grab the hook, cap it at a ringtone-friendly length, fade it in and out so it never clips, preview the clip, then download an MP3 or M4A: all in your browser, never uploaded.",
  longDescription:
    "The GigAI Ringtone Maker decodes your song locally with the browser's native Web Audio API the moment you drop it and paints a crisp waveform of the whole track, so you can find the hook by eye (the drop, the chorus, the exact line you want to hear when your phone rings) instead of guessing at timestamps. Drag a selection region right on the wave to mark the section, slide it to reposition, or pull an edge to fine-tune. A live readout shows your start, end and clip length. Because a ringtone should be short and punchy, the tool keeps you inside a phone-friendly window (roughly 40 seconds, long enough for a full hook, short enough that iOS and Android accept it) and warns you the moment a selection runs long. A ringtone that begins or ends on a hard cut sounds cheap, so a smooth fade-in and fade-out are built in: nudge them with sliders, watch the volume ramp overlay on the wave, and the clip eases in and out like a professionally cut tone. Press preview and only your finished ringtone plays back, fades and all, so you confirm it before you export. When it's right, download an MP3 (the universal ringtone format that works on Android, messaging apps and most tone slots) or an M4A/AAC, the container Apple ringtones are built from (you'll rename it to.m4r and drop it into your phone's tools for the final step). The trim and fade are sample-accurate native Web Audio, so there's no upload wait, no queue and no re-encode on the MP3 path beyond the single unavoidable one. Everything happens on your device: your music, whether it's a purchased track, a personal recording or an unreleased demo, is never uploaded, stored or logged. Close the tab and every byte is gone.",

  ctaText: "Make a ringtone",

  keywords: [
    "ringtone maker",
    "make a ringtone",
    "make a ringtone from a song",
    "ringtone maker online",
    "cut song for ringtone",
    "mp3 ringtone maker",
    "iphone ringtone maker",
    "m4r ringtone",
    "ringtone cutter",
    "30 second ringtone",
    "fade in fade out ringtone",
    "android ringtone maker",
    "custom ringtone from mp3",
    "browser ringtone maker",
  ],

  seo: {
    title: "Ringtone Maker: Cut a Song into an MP3 or M4A Ringtone Free | GigAI Tools",
    description:
      "Free online ringtone maker with a real waveform. Drop an MP3, WAV, M4A or OGG, drag to grab the hook (up to ~40s), add a smooth fade-in and fade-out, preview it, and download an MP3 or M4A/AAC ringtone, sample-accurate and 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: ["MP3", "M4A", "AAC"],
  },

  features: [
    {
      icon: "AudioWaveform",
      title: "Grab the hook on a real waveform",
      description:
        "Your song is decoded natively and drawn as a crisp waveform, so you drag a selection over the exact part you want (the drop, the chorus, the line) instead of scrubbing blindly through a slider.",
    },
    {
      icon: "Timer",
      title: "Ringtone-friendly length, enforced",
      description:
        "Ringtones need to be short. The tool keeps your clip inside a phone-friendly window (up to ~40 seconds) and warns you the instant a selection runs long, so what you export is a tone your phone will actually accept.",
    },
    {
      icon: "Waves",
      title: "Built-in fade-in and fade-out",
      description:
        "A ringtone that starts or ends on a hard cut sounds cheap. Add smooth fades with a slider and see the volume ramp overlaid on the wave, so your tone eases in and out like a professionally cut one.",
    },
    {
      icon: "PlayCircle",
      title: "Preview the finished tone",
      description:
        "Hear your exact ringtone, trimmed and faded, before you export, watching the playhead move through it, so you catch a clipped word or an early cut before you download rather than after.",
    },
    {
      icon: "Smartphone",
      title: "MP3 for Android, M4A for iPhone",
      description:
        "Export a universal MP3 that works on Android and messaging apps, or an M4A/AAC (the container Apple ringtones are built from) ready to rename to.m4r for the final step in your phone's tools.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, trimming, fading and encoding all run in your browser. Your songs, personal recordings and unreleased demos are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "A polished tone, not a rough cut",
      description:
        "Because you cut on a visible wave and fade both ends, your ringtone starts clean on the hook and eases out smoothly: the difference between a real tone and an obvious clip.",
    },
    {
      title: "Instant, with no upload wait",
      description:
        "The song is decoded on-device the moment you drop it and the trim and fade run locally, so there's no upload bar, no queue and no server round-trip: even for a full-length track.",
    },
    {
      title: "Works for both phones",
      description:
        "MP3 covers Android and most tone slots out of the box. M4A/AAC gives you the Apple-friendly container to rename to .m4r, so one tool covers whichever phone you're setting up.",
    },
    {
      title: "Private by design",
      description:
        "Nothing leaves the tab, so you can turn a personal recording, a voice clip or an unreleased demo into a ringtone without trusting your audio to anyone's server.",
    },
  ],

  howTo: [
    {
      title: "Drop your song",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It decodes locally in a moment and a waveform of the whole track appears with its length.",
    },
    {
      title: "Grab the hook",
      description:
        "Drag across the waveform to select the section you want. Slide it to reposition or pull an edge to resize: keep it inside the ~40-second window, and the readout shows your exact clip length.",
    },
    {
      title: "Add fades",
      description:
        "Set a short fade-in and fade-out with the sliders so the tone eases in and out. Watch the ramp overlay on the wave. A second or so at each end usually sounds best.",
    },
    {
      title: "Preview it",
      description:
        "Press preview to hear the finished, faded ringtone. Adjust the selection or fades until it starts on the beat and ends cleanly.",
    },
    {
      title: "Export MP3 or M4A",
      description:
        "Pick MP3 (universal, for Android) or M4A/AAC (for iPhone, rename to .m4r), then download. MP3 is near-instant native. M4A loads a small converter on demand the first time.",
    },
  ],

  useCases: [
    {
      audience: "Anyone with a phone",
      title: "Turn your favorite song into a ringtone",
      description:
        "Grab the hook from a track you love, fade it in and out, and export a tone that starts on the good part. No app install, no subscription, straight in the browser.",
    },
    {
      audience: "iPhone user",
      title: "Cut an M4A ready for .m4r",
      description:
        "Trim and fade the clip here, export M4A/AAC, then rename it to.m4r and add it as a ringtone in your phone's tools. The tricky cutting-and-fading part is done precisely and privately.",
    },
    {
      audience: "Parent / Gift-giver",
      title: "Make a fun personalised tone",
      description:
        "Cut a laugh, a catchphrase or a favorite line from a recording into a short faded tone to set as a contact ringtone, a quick, personal touch made entirely on your device.",
    },
    {
      audience: "Creator / Musician",
      title: "Ship a branded notification snippet",
      description:
        "Pull a signature few seconds from your own track, fade it, and export a tidy MP3 or AAC snippet to use as a notification or alert tone: sample-accurate and lossless-sourced.",
    },
  ],

  faq: [
    {
      question: "Is my music uploaded to a server?",
      answer:
        "No. Your song is decoded, trimmed, faded and encoded entirely in your browser using the native Web Audio API. It never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for purchased tracks, personal recordings and unreleased demos.",
    },
    {
      question: "How do I make a ringtone from a song?",
      answer:
        "Drop the song, drag across the waveform to select the hook (keep it inside the ~40-second window), add a short fade-in and fade-out so it eases in and out, preview it, then export an MP3 or M4A. That's the whole ringtone made. No account and no watermark.",
    },
    {
      question: "How do I set the ringtone on my iPhone?",
      answer:
        "Export the M4A/AAC option here, rename the downloaded file's extension from .m4a to .m4r, then add it as a ringtone in your phone's tools (for example via Finder/iTunes sync or GarageBand on the device). This tool does the precise trimming and fading. The last .m4r step happens on your phone because browsers can't install ringtones directly.",
    },
    {
      question: "How long can a ringtone be?",
      answer:
        "This tool keeps your clip inside a phone-friendly window of about 40 seconds, long enough for a full hook and comfortably within the limits iOS and Android accept (iPhone tones cap around 30–40 seconds). If your selection runs longer, the tool warns you so you can shorten it before exporting.",
    },
    {
      question: "MP3 or M4A, which should I pick?",
      answer:
        "Pick MP3 for Android phones, messaging apps and most general tone slots, it's universal and encodes instantly and natively. Pick M4A/AAC if you're setting up an iPhone, since Apple ringtones use that container. You'll rename it to.m4r for the final step. The M4A path loads a small converter on demand the first time you use it.",
    },
    {
      question: "Do the fades change the sound quality?",
      answer:
        "The fades are applied to the raw samples before encoding, so they're clean, smooth volume ramps with no artifacts. Any quality change comes only from the export format: MP3 and AAC are lossy and re-encode once (as any such export must), so choose a higher bitrate for music. The trim and fade themselves are sample-accurate.",
    },
    {
      question: "Will trimming and fading reduce quality?",
      answer:
        "The trim and fade are lossless, sample-accurate operations on the decoded audio. The single re-encode into MP3 or AAC on export is the only lossy step, and it's unavoidable for those formats: raise the bitrate for a richer tone. Your source is never re-compressed twice by this tool.",
    },
    {
      question: "Is there a length or size limit on the song I drop?",
      answer:
        "There's no hard limit on the input, but in-browser processing is memory-bound: a very long or very large file holds the whole decoded track in memory, so on a low-RAM device a huge file may run slowly or fail. Since a ringtone only needs a short slice, you can also trim the song shorter first if a big file struggles.",
    },
    {
      question: "Does it work on my phone or offline?",
      answer:
        "Yes. It runs in modern mobile browsers, which is handy for making a tone right on the device you'll use it on. Once the page has loaded, the MP3 path needs no network. The M4A converter downloads once on first use. Phones have less memory, so stick to shorter source clips on mobile.",
    },
  ],

  tips: [
    "Start your selection a touch before the hook and let the fade-in cover the lead-in. It sounds smoother than snapping straight onto the first note.",
    "A fade-in and fade-out of about one second each is the sweet spot for most tones: enough to avoid a hard cut without swallowing the hook.",
    "Aim for 20–30 seconds. It's plenty for a ringtone, plays nicely on both iOS and Android, and keeps the file small.",
    "Setting up an iPhone? Export M4A here, then rename the file to end in .m4r before adding it in your phone's tools.",
    "Preview after every tweak, a ringtone lives or dies on its first second, so make sure it lands right on the beat.",
  ],

  troubleshooting: [
    {
      problem: "My selection is too long / the tool says it's over the ringtone limit.",
      solution:
        "Ringtones need to be short. Drag an edge of the selection in until the clip length drops back inside the ~40-second window (aim for 20–30s). The live readout turns a warning color when you're over, so shorten until it clears.",
    },
    {
      problem: "The song won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively, often a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG. If it's an exotic format, convert it first with the Audio Converter, then make the ringtone from the result here.",
    },
    {
      problem: "The M4A export takes a moment the first time.",
      solution:
        "M4A/AAC uses a small in-browser converter that downloads once on first use, so the very first M4A export includes that one-time load. It's cached afterwards. If you only need Android, choose MP3 instead, it's fully native with no download.",
    },
    {
      problem: "The exported ringtone sounds slightly softer than the song.",
      solution:
        "MP3 and AAC are lossy, so a single re-encode is unavoidable, and the fades intentionally lower the volume at the very start and end. Raise the export bitrate for music, and keep the fades short if you want the hook at full volume as fast as possible.",
    },
  ],

  security:
    "Your song is decoded, trimmed, faded and encoded entirely in your browser using the native Web Audio API. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely turn purchased tracks, personal recordings and unreleased demos into ringtones. The trim and fade are lossless native operations. The MP3 encoder loads only when you choose MP3, and the M4A/AAC converter loads only when you choose M4A. There is no cloud copy and no upload step. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, drop-to-decode with a native Web Audio waveform, a draggable selection capped to a ringtone-friendly length, a finished-tone preview, and MP3 export with one-click download.",
    },
    {
      date: "2026-06-24",
      change:
        "Added built-in fade-in and fade-out with a live volume-ramp overlay on the wave, plus a warning when a selection runs past the ringtone length limit.",
    },
    {
      date: "2026-06-30",
      change:
        "Added M4A/AAC export (Apple-friendly, rename to .m4r) via the on-demand converter, a before/after size comparison on the result, and clearer iPhone/Android guidance.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-fade",
    "audio-cutter",
    "mp3-converter",
  ],
};

export default ringtoneMaker;
