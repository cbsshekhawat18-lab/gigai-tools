import type { Tool } from "@/types";

/**
 * Audio Splitter: cut one recording into many. Drop a file, choose how to
 * carve it up (fixed-length chunks, hand-picked time ranges, or automatically
 * on the gaps of silence), and get back a numbered set of clips you can grab one
 * at a time or as a single ZIP. Built on the native Web Audio `split` engine:
 * every piece is a sample-accurate slice of the decoded buffer, exported as a
 * lossless WAV, with nothing ever leaving the tab. All copy below is unique to
 * the splitter (no string is shared with the trimmer, cutter or converter) and
 * targets the real searches people make: "split an MP3 into parts", "chop a long
 * recording by silence", "break a mixtape into tracks", "cut audio every 30
 * seconds".
 */
const audioSplitter: Tool = {
  slug: "audio-splitter",
  title: "Audio Splitter",
  description:
    "Split one audio file into multiple clips in your browser: by fixed-length chunks, by your own time ranges, or automatically on silence. Preview each part on its waveform, then download them individually or as a single ZIP. Sample-accurate, lossless WAV output, and 100% private. Nothing is uploaded.",
  category: "audio-tools",
  group: "Edit",
  icon: "SplitSquareHorizontal",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Audio Splitter: Split MP3, WAV & M4A Into Parts Online",
  tagline:
    "Turn one long recording into a tidy set of clips. Split by equal chunks, by exact time ranges you type, or automatically on the silences between sections, preview every part on its own waveform, then download them one by one or as a single ZIP. Sample-accurate, lossless, and entirely in your browser.",
  longDescription:
    "The GigAI Audio Splitter takes a single file and breaks it into as many separate clips as you need, without ever uploading a byte. Drop an MP3, WAV, M4A, OGG or FLAC and the browser decodes it natively into a waveform. From there you pick a strategy. Fixed-length mode carves the track into equal chunks (every 30 seconds, every 5 minutes, whatever you set) with the final piece holding the remainder, which is perfect for beating a size cap or slicing a long lecture into study-sized pieces. Ranges mode lets you type exact start and end timestamps for each clip you want, so you can pull out just the three songs, three chapters or three answers that matter and ignore the rest. Silence mode listens for the quiet gaps between spoken sections or between tracks on a mixtape and splits there automatically, with an adjustable silence threshold and minimum-gap length so you can tune it to a noisy room or a clean studio take. Whichever mode you use, each resulting part is a sample-accurate slice of the original samples (Web Audio cuts on exact frame boundaries, not rounded seconds) and every clip is exported as a lossless 16-bit WAV. Preview any part on its own mini waveform before you commit, download the ones you want individually, or grab the whole set as a single ZIP (the ZIP builder is loaded only when you ask for it). Because decoding, splitting and encoding all run on your device, long interviews, unreleased albums, confidential recordings and personal voice notes are split privately. There is no upload wait, no queue, no account and no watermark. Close the tab and every part disappears with it.",

  ctaText: "Split audio",

  keywords: [
    "audio splitter",
    "split audio online",
    "split mp3 into parts",
    "split audio by silence",
    "split wav file",
    "cut audio into pieces",
    "chop audio into clips",
    "split audio every 30 seconds",
    "break mp3 into tracks",
    "divide audio file",
    "audio file splitter",
    "split m4a",
    "browser audio splitter",
    "split long recording",
  ],

  seo: {
    title: "Audio Splitter. Split MP3, WAV, M4A Into Parts Free | GigAI Tools",
    description:
      "Free online audio splitter. Split one MP3, WAV, M4A, OGG or FLAC into multiple clips by fixed-length chunks, custom time ranges, or automatically on silence, preview each part and download individually or as a ZIP. Sample-accurate, lossless, 100% in your browser.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: ["WAV", "ZIP"],
  },

  features: [
    {
      icon: "Timer",
      title: "Split into equal chunks",
      description:
        "Set a length (every 30 seconds, every 5 minutes) and the splitter carves the track into equal pieces, with the last part holding whatever's left. Ideal for size caps and study-sized segments.",
    },
    {
      icon: "ListOrdered",
      title: "Split by your own time ranges",
      description:
        "Type start and end timestamps for exactly the clips you want. Pull three songs, three chapters or three answers out of one long file and leave the rest behind. Nothing else gets exported.",
    },
    {
      icon: "AudioLines",
      title: "Auto-split on silence",
      description:
        "Let the tool find the quiet gaps between spoken sections or tracks and split there. An adjustable threshold and minimum-gap length tune it to a noisy room or a clean studio take.",
    },
    {
      icon: "Crosshair",
      title: "Sample-accurate slices",
      description:
        "Every part is cut on exact frame boundaries by native Web Audio, not rounded seconds, so a track boundary lands precisely where it should, with no drift between the pieces.",
    },
    {
      icon: "PlayCircle",
      title: "Preview each part before you save",
      description:
        "Every resulting clip gets its own mini waveform and player, so you can hear a part, confirm it starts and ends cleanly, and only keep the ones you actually want.",
    },
    {
      icon: "Archive",
      title: "Download singly or as one ZIP",
      description:
        "Grab any individual clip as a lossless WAV, or download the whole numbered set as a single ZIP. The ZIP builder is loaded only when you ask, a simple split never fetches it.",
    },
  ],

  benefits: [
    {
      title: "One file in, a tidy set of clips out",
      description:
        "Instead of trimming the same recording over and over, describe every cut once and get a numbered, ready-to-share set back in a single pass: individually or zipped.",
    },
    {
      title: "Instant and upload-free",
      description:
        "The file is decoded locally the moment you drop it and every slice runs on-device, so there's no upload bar, no processing queue and no server round-trip, even for hour-long recordings.",
    },
    {
      title: "Lossless parts, ready to reuse",
      description:
        "Each clip is a clean WAV slice of the original samples with no re-compression, so the pieces drop straight into a DAW, a podcast edit or another GigAI audio tool.",
    },
    {
      title: "Private by design",
      description:
        "Because nothing leaves the tab, you can split confidential interviews, medical notes or an unreleased album without handing the full recording to a stranger's server.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It decodes locally in a moment and a waveform of the whole track appears with its length and channel layout.",
    },
    {
      title: "Choose how to split",
      description:
        "Pick a strategy: equal chunks of a length you set, custom start/end ranges you type in, or automatic splitting on the silences between sections, with a threshold and minimum-gap you can tune.",
    },
    {
      title: "Split and preview the parts",
      description:
        "Run the split and each piece appears with its own mini waveform and player. Play any part to confirm it starts and ends where you expect before you save anything.",
    },
    {
      title: "Download the clips you want",
      description:
        "Grab individual parts as lossless WAV files, or download the whole numbered set as a single ZIP archive: then reset to split the same file a different way.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster / Interviewer",
      title: "Break one recording into segments",
      description:
        "Split a long interview on its silent pauses to get each question-and-answer as its own clip, or type ranges to pull the three best moments out for social cuts, all as clean WAVs.",
    },
    {
      audience: "Student / Lecturer",
      title: "Chunk a lecture for study",
      description:
        "Carve a two-hour recording into ten-minute pieces you can revisit topic by topic, or beat an upload size cap by splitting the file into evenly sized parts before sending it on.",
    },
    {
      audience: "Musician / DJ",
      title: "Split a mix or mixtape into tracks",
      description:
        "Auto-split a continuous DJ set on the gaps between songs, or type in the timestamps you noted while listening, and get each track back as an individual lossless file.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Divide sensitive audio locally",
      description:
        "Split a confidential recording or a legal note into the parts you need to share, entirely on your own device, so the full file is never uploaded to anyone's server.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. Your file is decoded, split and encoded entirely in your browser using the native Web Audio API. It never leaves your device. There's no upload step, nothing is stored or logged, and even the ZIP is built locally, so it's safe for private interviews, unreleased music and confidential recordings.",
    },
    {
      question: "How do the three split modes differ?",
      answer:
        "Fixed-length carves the track into equal chunks of a duration you set, with the last part holding the remainder. Ranges lets you type exact start and end timestamps for each clip you want and ignores everything else. Silence listens for quiet gaps between sections and splits there automatically, using a threshold and minimum-gap length you can adjust.",
    },
    {
      question: "How accurate are the split points?",
      answer:
        "They're sample-accurate. Web Audio slices on exact frame boundaries rather than rounded seconds, so each part starts and ends precisely where you set it (or where a silence gap is detected). There's no re-encoding on the way out. Every clip is a lossless WAV of the original samples.",
    },
    {
      question: "What formats can I split, and what do I get back?",
      answer:
        "You can drop anything your browser can decode: MP3, WAV, M4A/AAC, OGG, FLAC, Opus and WebM audio. Each resulting part is exported as a lossless 16-bit WAV. You can download parts individually or as a single ZIP archive of the whole set.",
    },
    {
      question: "Silence splitting gave me too many or too few pieces. How do I fix it?",
      answer:
        "Tune the two silence controls. Raise the silence threshold (toward 0 dB) if a noisy background is being treated as sound and the tool won't split. Lower it for a very quiet source. Increase the minimum-gap length so short breaths and pauses inside a sentence aren't mistaken for real section breaks, or shorten it to catch tighter gaps.",
    },
    {
      question: "Is there a limit on how big or long the file can be?",
      answer:
        "There's no hard limit, but in-browser processing is memory-bound: the whole decoded track plus every resulting clip is held in memory, so a very long or very large file on a low-RAM device may run slowly or fail. For huge inputs, split into fewer, larger parts, or work on the device with the most memory available.",
    },
    {
      question: "Can I download only some of the parts?",
      answer:
        "Yes. After splitting, each part has its own download button, so you can grab just the clips you want and skip the rest. When you'd rather keep everything, one button downloads the entire numbered set as a single ZIP.",
    },
    {
      question: "Does it work offline or on my phone?",
      answer:
        "Once the page has loaded, splitting needs no network, the WAV output never downloads anything extra, and the ZIP builder is fetched only if you request a ZIP. It runs on modern mobile browsers too. Phones have less memory, so favour fewer parts and shorter files on mobile.",
    },
  ],

  tips: [
    "Not sure where the breaks are? Start with silence mode, then nudge the threshold and minimum-gap until the number of parts matches the sections you can hear.",
    "For a hard size cap, use fixed-length mode and set the chunk length so each WAV lands comfortably under the limit: remember WAV is larger than MP3.",
    "In ranges mode, type timestamps as you listen elsewhere. Overlapping ranges are fine, and you can leave gaps you don't care about entirely unexported.",
    "Preview every part before downloading: it's the quickest way to catch a split that lands mid-word or mid-beat and adjust before you save.",
    "Splitting a lot of parts on a phone? Download the ZIP rather than tapping each file, and close other heavy tabs so memory stays free.",
  ],

  troubleshooting: [
    {
      problem: "The file won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively: often a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG. If it's exotic, convert it first with the Audio Converter, then split the result here.",
    },
    {
      problem: "Silence mode returns just one part (no splits) or way too many.",
      solution:
        "Adjust the two controls: raise the threshold if background noise stops it splitting, and increase the minimum-gap so pauses inside sentences aren't counted. Lower both if a clean, quiet recording isn't splitting where you expect.",
    },
    {
      problem: "The ZIP or a big split is slow or ran out of memory.",
      solution:
        "In-browser audio holds the whole track and every clip in RAM. Split into fewer parts, close other heavy tabs, or download clips individually instead of building a large ZIP. On a low-RAM device, a very large file may simply be too big to split in one pass.",
    },
    {
      problem: "A part starts or ends mid-word.",
      solution:
        "For silence mode, lengthen the minimum-gap so only real section breaks trigger a split. For ranges mode, adjust the timestamps a fraction. Preview each part to confirm the boundaries before downloading.",
    },
  ],

  security:
    "Your audio is decoded, split and encoded entirely in your browser using the native Web Audio API. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely split confidential interviews, voice notes and unreleased music. Every part is a lossless, native WAV slice. The ZIP archive is assembled locally and its builder is only loaded when you request a ZIP. There is no cloud copy and no upload step. Close the tab and every part is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: drop-to-decode with a native Web Audio waveform, fixed-length and custom-range splitting into sample-accurate lossless WAV parts, per-part preview, and individual downloads.",
    },
    {
      date: "2026-06-24",
      change:
        "Added automatic split-on-silence with adjustable threshold and minimum-gap controls, plus a one-click ZIP download of the whole set (the ZIP builder is lazy-loaded only when requested).",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the parts list with per-clip mini waveforms and duration readouts, improved honest guidance for silence tuning, and hardened memory handling for large files and many-part splits.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-cutter",
    "audio-merger",
    "audio-converter",
    "silence-remover",
  ],
};

export default audioSplitter;
