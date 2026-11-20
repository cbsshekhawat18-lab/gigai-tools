import type { Tool } from "@/types";

/**
 * Audio Fade. Add a smooth fade-in and/or fade-out to any track, entirely in
 * the browser. Drop a file, a real waveform paints instantly, drag the fade
 * lengths (or type them), and a live overlay shows exactly where the volume
 * ramps up at the head and eases down at the tail. Preview the faded result,
 * then export a lossless WAV or a compact MP3. The copy targets the real
 * searches: "add fade out to a song", "smooth the abrupt end of a voice note",
 * "fade in an intro", "remove the click at the start of a loop", and shares no
 * string with the trimmer, converter or other audio tools. Fading and WAV
 * export are pure native Web Audio (fast, sample-accurate, no WASM); the MP3
 * encoder loads only if MP3 is chosen; nothing ever leaves the tab.
 */
const audioFade: Tool = {
  slug: "audio-fade",
  title: "Audio Fade In / Out",
  description:
    "Add a smooth fade-in and fade-out to audio in your browser with a live waveform. Drop an MP3, WAV, M4A or OGG, set the fade lengths, watch the volume ramp painted right on the wave, preview it, then download a lossless WAV or a compact MP3. Sample-accurate and 100% private. Nothing is uploaded.",
  category: "audio-tools",
  group: "Edit",
  icon: "AudioWaveform",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Audio Fade In & Fade Out, Smooth MP3, WAV and M4A Online",
  tagline:
    "Drop a track and a real waveform appears. Set a fade-in at the head and a fade-out at the tail (the volume ramp is drawn right on the wave) hear it before you commit, then download a lossless WAV or a small MP3. Sample-accurate, entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Audio Fade tool decodes your file locally with the browser's native Web Audio API and paints a crisp waveform the instant you drop it. Set how long the sound should ease in at the start and ease out at the end (drag the handles on the wave or type exact seconds) and a translucent ramp overlay shows precisely where the volume rises from silence and falls back to it, so you shape the curve by eye instead of guessing at numbers. A live readout keeps your fade-in and fade-out lengths in view and warns if they'd overlap on a short clip. Press preview and you hear the fully faded result, watching the playhead sweep the wave, so a jarring cut or a too-quick ramp is caught before you export rather than after. When it sounds right, download a lossless 16-bit WAV (bit-for-bit accurate outside the fade regions and ideal for further editing) or a compact MP3 for sharing. WAV is written natively and the MP3 encoder is loaded only if you pick MP3, so a simple fade never pulls a heavyweight download. Every step runs on your device: the file is decoded, faded and encoded in the tab, so intros, outros, voice notes, loops and unreleased music never touch a server. You also choose the shape of the fade, which matters more than it sounds. A straight amplitude ramp is not a straight ramp to the ear: loudness is roughly logarithmic, so a linear fade-out seems to hold full volume and then fall off a cliff at the very end. The default \"Smooth\" setting uses an equal-power curve that holds a steady perceived loudness the whole way through, which is what people actually mean by a fade. \"Gentle\" starts soft and falls away faster for a long music tail. \"Linear\" keeps the old straight ramp if you want it. Every shape is applied sample-by-sample on exact frame boundaries. No re-compression on the WAV path, no upload wait, no account, no watermark. Close the tab and every byte is gone.",

  ctaText: "Add fade",

  keywords: [
    "audio fade",
    "fade in audio online",
    "fade out audio online",
    "add fade to mp3",
    "fade out mp3",
    "fade in fade out",
    "smooth audio ending",
    "audio fader",
    "fade wav",
    "fade song ending",
    "remove abrupt audio end",
    "waveform fade editor",
    "browser audio fade",
    "fade voice recording",
  ],

  seo: {
    title:
      "Audio Fade In / Out: Add Fades to MP3, WAV, M4A Online Free | GigAI Tools",
    description:
      "Free online audio fade tool with a live waveform. Drop an MP3, WAV, M4A or OGG, set a fade-in and fade-out, see the volume ramp painted on the wave, preview it, and download a lossless WAV or compact MP3, sample-accurate and 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: ["WAV", "MP3"],
  },

  features: [
    {
      icon: "AudioWaveform",
      title: "See the fade on the waveform",
      description:
        "Your track is decoded natively and drawn as a real waveform with a translucent ramp overlay, so you can see exactly where the volume rises in at the head and eases out at the tail.",
    },
    {
      icon: "MoveHorizontal",
      title: "Drag or type the fade lengths",
      description:
        "Pull the fade-in handle from the left and the fade-out handle from the right, or type exact seconds. A live readout keeps both lengths in view and flags an overlap on short clips.",
    },
    {
      icon: "PlayCircle",
      title: "Preview the faded result",
      description:
        "Hear the full track with the fades applied before you export, watching the playhead sweep the wave, so a too-abrupt ramp or a clipped intro is caught up front, not after downloading.",
    },
    {
      icon: "Crosshair",
      title: "Sample-accurate, lossless outside the fade",
      description:
        "Fades are applied frame-by-frame with the native Web Audio engine. On the WAV path there's no re-encoding at all: everything outside the two ramps is bit-for-bit identical to the source.",
    },
    {
      icon: "FileAudio",
      title: "Lossless WAV or compact MP3",
      description:
        "Export a bit-perfect 16-bit WAV for further editing, or a small MP3 for sharing. WAV is written natively. The MP3 encoder loads only when you actually choose MP3.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, fading and encoding all run in your browser. Intros, outros, voice notes and unreleased tracks are never uploaded, stored or logged anywhere.",
    },
  ],

  benefits: [
    {
      title: "Kill the abrupt start and end",
      description:
        "A hard cut at the top or a jarring stop at the end sounds amateur. A short fade smooths both so the track opens and closes cleanly, and you can see and hear it before you commit.",
    },
    {
      title: "Instant, with no upload wait",
      description:
        "The file is decoded locally the moment you drop it and the fade runs on-device, so there's no upload bar, no queue and no server round-trip, even for long recordings.",
    },
    {
      title: "Lossless where it counts",
      description:
        "Only the two ramp regions are altered. The rest of the WAV export is bit-for-bit identical to the original, so a faded clip drops cleanly into a DAW, a podcast edit or another GigAI audio tool.",
    },
    {
      title: "Private by design",
      description:
        "Because nothing leaves the tab, you can safely fade sensitive material (a confidential interview, an unreleased demo, a personal message) without trusting it to anyone's server.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It decodes locally in a moment and a waveform of the whole track appears with its length and channel layout.",
    },
    {
      title: "Set the fade-in and fade-out",
      description:
        "Drag the handle in from the left for a fade-in and in from the right for a fade-out, or type the exact number of seconds for each. The ramp overlay updates live on the waveform.",
    },
    {
      title: "Preview the result",
      description:
        "Press preview to hear the whole track with both fades applied, watching the playhead move through the ramps. Adjust the lengths until the opening and ending feel right.",
    },
    {
      title: "Choose a format and apply",
      description:
        "Pick lossless WAV or compact MP3 (and an MP3 bitrate if you like), then run the fade, it's near-instant since it's native Web Audio, not a WASM re-encode.",
    },
    {
      title: "Download or start over",
      description:
        "Preview the finished audio, check the before/after size, and download it, or reset and try different fade lengths on the same file.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster / Creator",
      title: "Smooth the intro and outro",
      description:
        "Fade the theme music in under your first words and fade the bed out at the end so the episode opens and closes cleanly, without an abrupt cut, export a WAV straight into your editor.",
    },
    {
      audience: "Musician / Producer",
      title: "Fade the ending of a track",
      description:
        "Give a song or a live take a proper fade-out instead of a hard stop, or fade a loop in to hide the seam. Sample-accurate ramps and a lossless WAV keep it clean for the DAW.",
    },
    {
      audience: "Anyone with a phone",
      title: "Polish a voice note or clip",
      description:
        "Soften the click at the start of a recording or the sudden stop at the end before you send it. No app install, straight in the browser, done in seconds.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Fade sensitive audio locally",
      description:
        "Add a clean fade to a confidential recording or an unreleased demo entirely on your device, so the material is never uploaded to a stranger's server just to be polished.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. Your file is decoded, faded and encoded entirely in your browser using the native Web Audio API. It never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for private voice notes, interviews or unreleased music.",
    },
    {
      question: "What kind of fade curve does it use?",
      answer:
        "The fades are linear, the volume rises evenly from silence to full at the head, and falls evenly back to silence at the tail. Linear ramps are clean and predictable for most music and speech. For a longer, more gradual tail simply lengthen the fade-out.",
    },
    {
      question: "Can I add just a fade-in, just a fade-out, or both?",
      answer:
        "Any combination. Set one length to zero to skip that side, or give both a duration to fade in and out. If the two fades would overlap on a very short clip, the tool warns you so you can shorten one.",
    },
    {
      question: "What formats can I use, and what do I get back?",
      answer:
        "You can drop anything your browser can decode: MP3, WAV, M4A/AAC, OGG, FLAC, Opus and WebM audio. You export either a lossless 16-bit WAV (great for further editing) or a compact MP3 (great for sharing). WAV is written natively. The MP3 encoder loads only if you choose MP3.",
    },
    {
      question: "Will fading reduce the quality?",
      answer:
        "Not on the WAV path. Only the two ramp regions are scaled in volume, and everything else is bit-for-bit identical to the source. If you export MP3, the audio is re-encoded once (as any MP3 export must be), so choose a higher bitrate for music.",
    },
    {
      question: "Is there a length or size limit?",
      answer:
        "There's no hard limit, but in-browser processing is memory-bound: very long or large files hold the whole decoded track in memory, so on a low-RAM device a huge file may run slowly or fail. For big inputs, use the browser with the most memory, or trim the file into parts first.",
    },
    {
      question: "Does it work offline or on my phone?",
      answer:
        "Once the page has loaded, fading needs no network: the WAV path never downloads anything extra. It runs on modern mobile browsers too. Phones have less memory, so stick to shorter clips on mobile for the smoothest experience.",
    },
    {
      question: "Do I need to install anything or sign up?",
      answer:
        "No. There's no install, no plugin, no account and no watermark. Open the page, drop a file, set your fades, and download: the whole tool runs client-side.",
    },
  ],

  tips: [
    "A short fade-in of 0.05–0.2 s is usually enough to kill a click or pop at the very start of a recording without softening the attack.",
    "For a musical ending, a 2–5 second fade-out feels natural. Make it longer for an ambient, drawn-out tail.",
    "Choose WAV when you'll keep editing (only the ramps are touched, the rest is lossless) and MP3 only when you need a small file to share.",
    "Preview after every change: the ear catches a fade that's too fast or too slow far better than the number does.",
    "On a very short clip, keep the fade-in plus fade-out shorter than the whole track, or the two ramps will meet and the middle will dip.",
  ],

  troubleshooting: [
    {
      problem: "The file won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively: most often a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG. If it's an exotic format, convert it first with the Audio Converter, then fade the result here.",
    },
    {
      problem: "My fades overlap and the middle of the clip gets quiet.",
      solution:
        "On a short track a long fade-in plus a long fade-out can meet in the middle, dipping the volume where they cross. Shorten one or both fades so their total is comfortably less than the clip length: the readout warns you when they'd overlap.",
    },
    {
      problem: "The tab is slow or ran out of memory on a big file.",
      solution:
        "In-browser audio holds the whole decoded track in RAM. Close other heavy tabs and retry. If it still struggles, the file is likely too large for this device. Split it into parts first, or fade on a machine with more memory.",
    },
    {
      problem: "The exported MP3 sounds slightly softer than the source.",
      solution:
        "MP3 is lossy, so a single re-encode is unavoidable on that path. Raise the MP3 bitrate for music, or export WAV instead to keep everything outside the fades bit-for-bit identical to the original.",
    },
  ],

  security:
    "Your audio is decoded, faded and encoded entirely in your browser using the native Web Audio API. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely fade confidential interviews, voice notes and unreleased music. WAV export is a lossless, native operation and only the two fade regions are altered. The MP3 encoder is loaded solely if you choose MP3. There is no cloud copy and no upload step. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, drop-to-decode with a native Web Audio waveform, draggable fade-in and fade-out lengths with a live ramp overlay, faded preview, and lossless WAV export with one-click download.",
    },
    {
      date: "2026-06-24",
      change:
        "Added compact MP3 export with a selectable bitrate (encoder lazy-loaded only when MP3 is chosen), numeric second inputs alongside the drag handles, and an overlap warning for short clips.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the ramp overlay and handle UX, added a before/after size comparison on the result, and improved honest guidance and memory handling for large files.",
    },
    {
      date: "2026-08-09",
      change:
        "Added selectable fade shapes: Smooth (equal-power, now the default), Linear and Gentle. Fades were previously always a straight amplitude ramp, which sounds like it holds full volume and then drops away suddenly, because loudness is roughly logarithmic rather than linear.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-normalizer",
    "audio-merger",
    "mp3-converter",
  ],
};

export default audioFade;
