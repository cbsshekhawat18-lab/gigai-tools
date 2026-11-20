import type { Tool } from "@/types";

/**
 * Audio Trimmer: the flagship of the GigAI Audio Toolkit and the showcase for
 * the native Web Audio engine. Drop a track, and a real waveform paints
 * instantly (no upload, no WASM); drag a selection region over it to pick the
 * exact slice to keep, scrub-preview just that region, then export a clean
 * lossless WAV or a compact MP3. Everything below is written for the specific
 * things people actually search, "cut the start off an MP3", "grab a 30-second
 * clip", "make a ringtone", "trim a voice note", and no string is shared with
 * the video or image copy. The engine is honest: trimming and WAV export are
 * pure Web Audio (fast, exact, sample-accurate); MP3 export uses a lazily-loaded
 * encoder; nothing ever leaves the tab.
 */
const audioTrimmer: Tool = {
  slug: "audio-trimmer",
  title: "Audio Trimmer",
  description:
    "Trim audio in your browser with a real waveform: drop an MP3, WAV, M4A or OGG, drag a selection to keep exactly the part you want, preview it, then download a lossless WAV or a compact MP3. Sample-accurate and 100% private. Nothing is uploaded.",
  category: "audio-tools",
  group: "Edit",
  icon: "Scissors",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-14",

  h1: "Audio Trimmer: Cut & Crop MP3, WAV and M4A Online",
  tagline:
    "Drop a track and a real waveform paints in an instant. Drag a selection over it to keep exactly the part you want, hear just that region before you commit, then download a lossless WAV or a small MP3, sample-accurate, entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Audio Trimmer decodes your file with the browser's native Web Audio API the moment you drop it, draws a crisp waveform of the whole track, and lets you drag a selection region directly on that wave to mark the slice you want to keep. Because you can see the audio, you cut where the sound actually is (the downbeat, the first word, the end of the chorus) instead of guessing at timestamps in a text box. Drag the body of the selection to slide it, grab either edge to fine-tune, or nudge it a frame at a time with the arrow keys. A live readout shows your start, end and the exact length you're keeping. Hit preview and only the selected region plays back, so you confirm the cut before you export. When it's right, download a lossless 16-bit WAV (bit-for-bit accurate, ideal for further editing) or a compact MP3 for sharing and ringtones. WAV is written natively and the MP3 encoder is loaded only if you choose MP3, so there's never a heavyweight download for a simple trim. All of this happens on your device: the file is decoded, cut and encoded in the tab, so voice notes, unreleased music, interview recordings and private clips never touch a server. The trim itself is sample-accurate (Web Audio slices on exact frame boundaries, not rounded seconds) and there's no upload wait, no account and no watermark. Close the tab and every byte is gone.",

  ctaText: "Trim audio",

  keywords: [
    "audio trimmer",
    "trim audio online",
    "cut audio",
    "crop mp3",
    "trim mp3 online",
    "cut mp3 online",
    "mp3 cutter",
    "trim wav",
    "cut m4a",
    "waveform audio editor",
    "browser audio trimmer",
    "trim voice recording",
  ],

  seo: {
    title: "Audio Trimmer: Cut & Trim MP3, WAV, M4A Online Free | GigAI Tools",
    description:
      "Free online audio trimmer with a real waveform. Drop an MP3, WAV, M4A or OGG, drag a selection to cut exactly the part you want, preview it, and download a lossless WAV or compact MP3: sample-accurate and 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: ["WAV", "MP3"],
  },

  features: [
    {
      icon: "AudioWaveform",
      title: "Cut on a real waveform",
      description:
        "Your track is decoded natively and drawn as a crisp waveform, so you set the start and end where the sound actually is (a beat, a breath, a word) instead of guessing at numbers.",
    },
    {
      icon: "MousePointerClick",
      title: "Drag, slide and fine-tune the region",
      description:
        "Drag across the wave to create a selection, grab its body to slide it, or pull either edge to adjust. Focus it and nudge with the arrow keys for frame-level precision.",
    },
    {
      icon: "PlayCircle",
      title: "Preview just the selection",
      description:
        "Hear only the part you're keeping before you export. A live playhead tracks the region so you catch a clipped word or a missed beat before you download, not after.",
    },
    {
      icon: "Crosshair",
      title: "Sample-accurate cuts",
      description:
        "Web Audio slices on exact frame boundaries, not rounded seconds, so the start and end land precisely where you set them, with no drift and no re-encoding artifacts on the WAV path.",
    },
    {
      icon: "FileAudio",
      title: "Lossless WAV or compact MP3",
      description:
        "Export a bit-perfect 16-bit WAV for further editing, or a small MP3 for sharing and ringtones. WAV is native. The MP3 encoder loads only when you pick MP3.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, trimming and encoding all run in your browser. Voice notes, interviews, unreleased tracks and personal clips are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "See the audio, cut it right the first time",
      description:
        "A visible waveform means you place the cut on the actual sound, not a guessed timestamp, so the clip starts clean and ends where it should, no repeated exports.",
    },
    {
      title: "Instant, with no upload wait",
      description:
        "The file is decoded locally the moment you drop it and the trim runs on-device, so there's no upload bar, no queue and no server round-trip: even for long recordings.",
    },
    {
      title: "Lossless when you need it",
      description:
        "The WAV path is bit-for-bit accurate with no re-compression, so a trimmed clip is perfect for layering into a DAW, a podcast edit or another GigAI audio tool.",
    },
    {
      title: "Private by design",
      description:
        "Because nothing leaves the tab, you can safely trim sensitive material (a confidential interview, a medical note, an unreleased demo) without trusting it to anyone.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It decodes locally in a moment and a waveform of the whole track appears with its length and channel layout.",
    },
    {
      title: "Select the part to keep",
      description:
        "Drag across the waveform to draw a selection region. Slide it to reposition, pull an edge to resize, or focus it and use the arrow keys to nudge the start and end frame by frame.",
    },
    {
      title: "Preview the cut",
      description:
        "Press preview to hear only the selected region, watching the playhead move through it. Adjust the handles until the clip starts and ends exactly where you want.",
    },
    {
      title: "Choose a format and trim",
      description:
        "Pick lossless WAV or compact MP3 (and an MP3 bitrate if you like), then run the trim, it's near-instant since it's native Web Audio, not a WASM re-encode.",
    },
    {
      title: "Download or start over",
      description:
        "Preview the finished clip, check the before/after size, and download it, or reset and grab a different region from the same file.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster / Creator",
      title: "Grab a clean clip or pull-quote",
      description:
        "Lift a 30-second highlight from an episode or a soundbite from an interview, cut on the waveform so it starts on the word and ends on the beat, then export a WAV for your editor.",
    },
    {
      audience: "Anyone with a phone",
      title: "Make a ringtone or trim a voice note",
      description:
        "Crop a song down to the hook for a ringtone, or shave the silence off the front and back of a voice memo before you send it. No app install, straight in the browser.",
    },
    {
      audience: "Musician / Producer",
      title: "Slice a loop or a sample",
      description:
        "Pull a bar-perfect loop or a one-shot out of a longer take. Sample-accurate boundaries and a lossless WAV export mean it drops cleanly into your DAW.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Trim sensitive audio locally",
      description:
        "Cut a confidential recording, a legal note or an unreleased demo entirely on your device, so the material is never uploaded to a stranger's server to be edited.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. Your file is decoded, trimmed and encoded entirely in your browser using the native Web Audio API. It never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for private voice notes, interviews or unreleased music.",
    },
    {
      question: "How accurate is the trim?",
      answer:
        "It's sample-accurate. Web Audio slices on exact frame boundaries rather than rounded seconds, so the start and end land precisely where you drag the handles. On the WAV path there's no re-encoding at all, so the kept region is bit-for-bit identical to the source.",
    },
    {
      question: "What formats can I trim, and what do I get back?",
      answer:
        "You can drop anything your browser can decode: MP3, WAV, M4A/AAC, OGG, FLAC, Opus and WebM audio. You export either a lossless 16-bit WAV (great for further editing) or a compact MP3 (great for sharing and ringtones). WAV is written natively. The MP3 encoder loads only if you choose MP3.",
    },
    {
      question: "Will trimming reduce the quality?",
      answer:
        "Not on the WAV path, it's a clean, lossless cut of the original samples. If you export MP3, the audio is re-encoded once (as any MP3 export must be), so pick a higher bitrate for music. When you plan to edit further, choose WAV to keep it pristine.",
    },
    {
      question: "How do I select exactly the region I want?",
      answer:
        "Drag across the waveform to draw a selection, then drag its body to slide it or pull either edge to resize. For fine control, click the region to focus it and use the arrow keys (a small nudge per press, a larger one with Shift, or a frame with Alt) while the live readout shows your start, end and length.",
    },
    {
      question: "Can I make a ringtone with this?",
      answer:
        "Yes. Crop a song down to the section you want on the waveform, preview it, then export an MP3 (or WAV). For iPhone ringtones you'll typically convert that clip to M4R in your phone's tools. The trim itself, the hard part, is done here, precisely and privately.",
    },
    {
      question: "Is there a length or size limit?",
      answer:
        "There's no hard limit, but in-browser processing is memory-bound: very long or very large files hold the whole decoded track in memory, so on a low-RAM device a huge file may run slowly or fail. For big inputs, trim in the browser you have the most memory on, or cut the file into parts first.",
    },
    {
      question: "Does it work offline or on my phone?",
      answer:
        "Once the page has loaded, trimming needs no network: the WAV path never downloads anything extra. It runs on modern mobile browsers too. Phones have less memory, so stick to shorter clips on mobile for the smoothest experience.",
    },
    {
      question: "Do I need to install anything or sign up?",
      answer:
        "No. There's no install, no plugin, no account and no watermark. Open the page, drop a file, drag a selection, and download. The whole trimmer runs client-side.",
    },
  ],

  tips: [
    "Zoom your ears in: preview the selection a couple of times and nudge the handles a frame at a time so the clip starts on the sound, not in the silence before it.",
    "Choose WAV when you'll keep editing (it's lossless) and MP3 only when you need a small file to share or set as a ringtone.",
    "Drag the middle of the selection to slide the whole region without changing its length, which is handy for moving a fixed-length clip to the perfect spot.",
    "For a clean fade-free cut, land the end handle just after a beat or the tail of a word so it doesn't chop mid-sound.",
    "Large file running slow? Close other heavy tabs, in-browser audio is memory-bound, or trim it in halves.",
  ],

  troubleshooting: [
    {
      problem: "The file won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively: most often a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG. If it's an exotic format, convert it first with the Audio Converter, then trim the result here.",
    },
    {
      problem: "My selection is empty or the trim button does nothing.",
      solution:
        "You need a region with length: drag across the waveform so the start and end are apart (a zero-width selection has nothing to keep). The live readout should show a non-zero 'keeping' duration before you run.",
    },
    {
      problem: "The tab is slow or ran out of memory on a big file.",
      solution:
        "In-browser audio holds the whole decoded track in RAM. Close other heavy tabs and retry. If it still struggles, the file is likely too large for this device. Split it into parts first, or trim on a machine with more memory.",
    },
    {
      problem: "The exported MP3 sounds slightly softer than the source.",
      solution:
        "MP3 is lossy, so a single re-encode is unavoidable on that path. Raise the MP3 bitrate for music, or export WAV instead to keep the trimmed clip bit-for-bit identical to the original.",
    },
  ],

  security:
    "Your audio is decoded, trimmed and encoded entirely in your browser using the native Web Audio API. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely trim confidential interviews, voice notes and unreleased music. WAV export is a lossless, native operation and the MP3 encoder is only loaded if you choose MP3. There is no cloud copy and no upload step. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release: drop-to-decode with a native Web Audio waveform, a draggable selection region for sample-accurate trimming, region-only preview, and lossless WAV export with one-click download.",
    },
    {
      date: "2026-06-21",
      change:
        "Added compact MP3 export with a selectable bitrate (encoder lazy-loaded only when MP3 is chosen), a live start/end/length readout, and keyboard nudging of the selection handles for frame-level precision.",
    },
    {
      date: "2026-06-29",
      change:
        "Refined the waveform selection UX (slide-to-move, edge fine-tuning), added a before/after size comparison on the result, and improved honest guidance and memory handling for large files.",
    },
  ],

  relatedTools: [
    "audio-cutter",
    "audio-merger",
    "audio-converter",
    "mp3-converter",
    "volume-booster",
    "audio-recorder",
  ],
};

export default audioTrimmer;
