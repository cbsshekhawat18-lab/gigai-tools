import type { Tool } from "@/types";

/**
 * Audio Silence Remover: tighten a recording by stripping the dead air.
 *
 * Drop a track, and the native Web Audio engine decodes it instantly and scans
 * for silent gaps using a loudness threshold you control (in dBFS) and a minimum
 * gap length (so a natural breath isn't mistaken for dead air). The kept, loud
 * segments are highlighted on a real waveform and stitched together into a
 * tighter clip you can preview and download as a lossless WAV or a compact MP3.
 * Everything runs on-device: detection, cutting and encoding all happen in the
 * tab, so podcast takes, voice memos and interview recordings are never
 * uploaded. The copy below targets the exact searches people run, "remove
 * silence from audio", "cut dead air from a podcast", "trim gaps from a voice
 * recording", and shares no strings with the trimmer, normalizer or video
 * tools. Honest by design: this removes long silent gaps, it is not a noise
 * gate for continuous hiss, and MP3 export is a single lossy re-encode.
 */
const audioSilenceRemover: Tool = {
  slug: "audio-silence-remover",
  title: "Audio Silence Remover",
  description:
    "Remove silent gaps and dead air from a recording in your browser. Drop an MP3, WAV, M4A or OGG, tune the silence threshold and minimum gap length, see the kept segments on a real waveform, preview the tighter result, then download a lossless WAV or compact MP3: 100% private, nothing uploaded.",
  category: "audio-tools",
  group: "Edit",
  icon: "Eraser",
  accent: "rose",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",

  h1: "Audio Silence Remover, Cut Dead Air & Gaps Online",
  tagline:
    "Drop a recording and the waveform paints instantly. Set how quiet counts as silence and how long a gap has to be, watch the kept segments light up, preview the tightened result, then download a lossless WAV or a small MP3, all in your browser, never uploaded.",
  longDescription:
    "The GigAI Audio Silence Remover decodes your file with the browser's native Web Audio API the moment you drop it, draws a crisp waveform of the whole take, then scans for silent stretches using two controls you actually understand: a threshold in dBFS that sets how quiet a passage must be to count as silence, and a minimum-gap length so a natural pause or breath isn't treated as dead air. As you drag those controls the detection re-runs on-device and the waveform lights up the loud segments it will keep, with a live readout of how many gaps were found and how much time you're about to reclaim. It's built for the real jobs people do: cutting the long silences out of a podcast take, tightening a rambling voice memo, removing the dead space between takes in a rehearsal recording, or shrinking a lecture where the speaker paused a lot. Two details do most of the work in making the result sound edited rather than chopped. A breathing-room control keeps a margin either side of every kept segment, because speech ramps up over a few tens of milliseconds and cutting exactly on the threshold shears the start off each word. And every join is crossfaded over a few milliseconds, which is what stops the cuts from clicking, butt-joining two unrelated waveforms steps the signal, and a step is an audible click. Detection itself measures loudness as RMS over short windows, the way a level meter does, so a single stray click in an otherwise silent passage no longer keeps the whole gap. When it looks right, preview the stitched result, then download a lossless 16-bit WAV (bit-for-bit accurate on every kept sample, ideal for further editing) or a compact MP3 for sharing: WAV is written natively and the MP3 encoder loads only if you pick MP3, so a simple silence trim never triggers a heavyweight download. All of it happens on your device: the file is decoded, scanned, cut and encoded in the tab, so confidential interviews, unreleased demos and personal voice notes never touch a server. There's no upload wait, no account and no watermark. This is honest gap removal. It deletes long silent spans and joins what's left. It is not a noise gate that ducks continuous background hiss, and it won't invent audio that was never recorded. Close the tab and every byte is gone.",

  ctaText: "Remove silence",

  keywords: [
    "remove silence from audio",
    "audio silence remover",
    "cut dead air",
    "remove gaps from audio",
    "trim silence online",
    "silence remover mp3",
    "remove pauses from recording",
    "podcast silence remover",
    "cut silence from voice recording",
    "auto trim silence",
    "shorten audio gaps",
    "browser silence remover",
  ],

  seo: {
    title: "Audio Silence Remover: Cut Dead Air & Gaps Online Free | GigAI Tools",
    description:
      "Free online audio silence remover. Drop an MP3, WAV, M4A or OGG, set the silence threshold and minimum gap, see kept segments on a waveform, preview the tighter clip, and download a lossless WAV or MP3: sample-accurate and 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: ["WAV", "MP3"],
  },

  features: [
    {
      icon: "SlidersHorizontal",
      title: "Threshold you control, in dBFS",
      description:
        "Set exactly how quiet a passage has to be before it counts as silence. Raise it to catch soft room tone, lower it to only cut true dead air. The detection re-runs instantly as you adjust.",
    },
    {
      icon: "Timer",
      title: "Keep natural pauses",
      description:
        "A minimum-gap control means short breaths and beats between words survive, while only silences longer than your chosen length get removed, so speech stays natural, not choppy.",
    },
    {
      icon: "AudioWaveform",
      title: "See what gets kept",
      description:
        "The loud segments the tool will keep are highlighted on a real waveform, with a live count of gaps found and seconds reclaimed, so you tune the cut by eye before you commit.",
    },
    {
      icon: "PlayCircle",
      title: "Preview before you export",
      description:
        "Hear the stitched, tightened result in the built-in player so you catch a clipped word or an over-aggressive cut before downloading. Not after.",
    },
    {
      icon: "FileAudio",
      title: "Lossless WAV or compact MP3",
      description:
        "Export a bit-perfect 16-bit WAV of the kept audio for further editing, or a small MP3 for sharing. WAV is native and instant. The MP3 encoder loads only when you choose MP3.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, silence detection, cutting and encoding all run in your browser. Interviews, voice notes and unreleased takes are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Tighter recordings in one pass",
      description:
        "Instead of hunting for every gap by hand, one scan finds and removes them all, turning a rambling take into a tight edit in seconds, with every join crossfaded so the cuts don't click.",
    },
    {
      title: "Tune it by eye and ear",
      description:
        "The highlighted waveform plus a live gap count and time-saved readout let you dial the threshold and gap length until the cut is exactly as tight as you want. No guessing.",
    },
    {
      title: "Lossless when you keep editing",
      description:
        "The WAV path keeps your audio at full quality with no re-compression. Every kept sample is untouched apart from a few-millisecond crossfade at each join, which is there to stop the cuts clicking.",
    },
    {
      title: "Private by design",
      description:
        "Because nothing leaves the tab, you can strip silence from a confidential interview or an unreleased demo without trusting it to anyone's server.",
    },
  ],

  howTo: [
    {
      title: "Drop your recording",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It decodes locally in a moment and a waveform of the whole take appears with its length and channel layout.",
    },
    {
      title: "Set the silence rules",
      description:
        "Adjust the threshold (how quiet counts as silence, in dBFS) and the minimum gap length (how long a silence must be before it's removed). The kept segments highlight on the waveform as you tune.",
    },
    {
      title: "Preview the tightened clip",
      description:
        "Press preview to hear the stitched result. If a word got clipped, raise the breathing-room slider first, then try a lower threshold or a longer minimum gap. If too much dead air survives, do the opposite.",
    },
    {
      title: "Choose a format and run",
      description:
        "Pick lossless WAV or compact MP3 (and an MP3 bitrate if you like), then remove the silence, it's near-instant native Web Audio, not a WASM re-encode.",
    },
    {
      title: "Download or start over",
      description:
        "Check the before/after length and size, download the tighter clip, or reset and try different settings on the same file.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster / Editor",
      title: "Cut dead air between takes",
      description:
        "Strip the long silences and mid-take pauses out of a raw recording before you edit, so you start your session with a tight timeline instead of scrubbing past empty space.",
    },
    {
      audience: "Student / Note-taker",
      title: "Shrink a pause-heavy lecture",
      description:
        "Remove the gaps where the speaker paused to write or think, turning a long recording into a shorter, denser listen you can get through faster.",
    },
    {
      audience: "Voice-over artist",
      title: "Tighten a voice memo or narration",
      description:
        "Clean the dead space off the front, back and middle of a spoken take so the delivery feels tight, then export a lossless WAV for the mix.",
    },
    {
      audience: "Privacy-conscious user",
      title: "De-silence sensitive audio locally",
      description:
        "Trim the gaps out of a confidential interview or a private recording entirely on your device, so the material is never uploaded to a stranger's server.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. Your file is decoded, scanned for silence, cut and encoded entirely in your browser using the native Web Audio API. It never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for private voice notes, interviews or unreleased material.",
    },
    {
      question: "How does the tool decide what counts as silence?",
      answer:
        "Two controls you set. The threshold (in dBFS) is the loudness floor: any passage quieter than it is considered silent. The minimum-gap length is how long that quiet has to last before it's removed, so a short breath survives but a two-second pause is cut. Only spans that are both quiet enough and long enough get removed.",
    },
    {
      question: "Will it make my speech sound choppy?",
      answer:
        "Not if you tune the minimum gap sensibly. Keeping a slightly longer minimum gap (say 0.4–0.6 seconds) preserves the natural micro-pauses in speech so the result still breathes. If it sounds too tight, raise the minimum gap or lower the threshold. The highlighted waveform and preview let you dial it in before exporting.",
    },
    {
      question: "Is this a noise gate or a noise remover?",
      answer:
        "No: it's honest about what it does. It removes long silent gaps and joins the loud segments. It does not duck or clean continuous background noise like hiss, hum or fan noise. If a recording has loud constant background, that noise counts as 'not silence' and stays. For hiss reduction you'd need a dedicated denoiser.",
    },
    {
      question: "What formats can I use, and what do I get back?",
      answer:
        "You can drop anything your browser can decode: MP3, WAV, M4A/AAC, OGG, FLAC, Opus and WebM audio. You export either a lossless 16-bit WAV (great for further editing) or a compact MP3 (great for sharing). WAV is written natively. The MP3 encoder loads only if you choose MP3.",
    },
    {
      question: "Does removing silence lower the quality?",
      answer:
        "Essentially no. On the WAV path there is no re-compression at all: the silent gaps are deleted and the kept audio is copied through untouched, with one deliberate exception, a crossfade of roughly six milliseconds at each join. That crossfade is what prevents an audible click where two unrelated waveforms meet, so those few milliseconds per cut are altered on purpose. Everything else is identical to your source. If you export MP3, the kept audio is re-encoded once (as any MP3 export must be), so pick a higher bitrate for music-quality material, or choose WAV to stay pristine.",
    },
    {
      question: "Is there a length or size limit?",
      answer:
        "There's no hard limit, but in-browser processing is memory-bound: a very long or large file holds the whole decoded track in memory while it's scanned and rebuilt, so on a low-RAM device a huge file may run slowly or fail. For big inputs, use the browser with the most memory, or split the file first.",
    },
    {
      question: "Do I need to install anything or sign up?",
      answer:
        "No. There's no install, no plugin, no account and no watermark. Open the page, drop a file, set your thresholds, and download. The whole silence remover runs client-side, and it works offline once the page has loaded on the WAV path.",
    },
  ],

  tips: [
    "Start with a moderate threshold and a 0.4–0.6s minimum gap, then tighten from there, it's easier to remove more than to recover a word you clipped.",
    "Watch the gap count and time-saved readout: if it barely changes when you nudge the threshold, your recording's silence is either much quieter or much louder than you expected.",
    "Keeping natural micro-pauses makes speech sound human, raise the minimum gap if the preview feels rushed or breathless.",
    "For music or noisy rooms, lower the threshold so only true dead air is cut. Constant background will otherwise count as 'not silent' and stay anyway.",
    "Export WAV while you're still editing (it's lossless), and only switch to MP3 for the final share-ready file.",
  ],

  troubleshooting: [
    {
      problem: "Nothing was removed / no gaps were found.",
      solution:
        "Either the recording has no silence long enough to qualify, or its quiet parts are still above your threshold. Raise the threshold (a less negative dBFS value) so softer passages count as silence, or lower the minimum-gap length so shorter pauses are removed.",
    },
    {
      problem: "It cut too much and clipped words.",
      solution:
        "The threshold is too high or the minimum gap too short, so speech tails and breaths were treated as silence. Lower the threshold toward a more negative dBFS value and raise the minimum gap. Re-check the highlighted waveform and preview before exporting.",
    },
    {
      problem: "The file won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively, usually a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG, or convert it first with the Audio Converter and then remove silence from the result here.",
    },
    {
      problem: "The tab is slow or ran out of memory on a big file.",
      solution:
        "In-browser audio holds the whole decoded track in RAM while it scans and rebuilds. Close other heavy tabs and retry. If it still struggles, split the file into parts first, or run it on a machine with more memory.",
    },
  ],

  security:
    "Your audio is decoded, scanned for silence, cut and encoded entirely in your browser using the native Web Audio API. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely de-silence confidential interviews, voice notes and unreleased recordings. WAV export is a lossless, native operation and the MP3 encoder is only loaded if you choose MP3. There is no cloud copy and no upload step. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, drop-to-decode with a native Web Audio waveform, dBFS threshold and minimum-gap controls, kept-segment highlighting, stitched preview, and lossless WAV export with one-click download.",
    },
    {
      date: "2026-06-24",
      change:
        "Added compact MP3 export with a selectable bitrate (encoder lazy-loaded only when MP3 is chosen), plus a live gap count and time-saved readout that updates as you tune the controls.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved silence-detection responsiveness on longer files, added a before/after length and size comparison on the result, and sharpened the honest guidance on gap removal versus noise gating.",
    },
    {
      date: "2026-08-09",
      change:
        "Three quality fixes to how cuts are made. Joins are now crossfaded over a few milliseconds, so removed gaps no longer leave an audible click where two waveforms meet. A new breathing-room control keeps a margin around each kept segment so word onsets aren't sheared off. And detection now measures loudness as RMS over short windows rather than sample by sample, so a lone click in a silent passage no longer keeps the entire gap.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-cutter",
    "audio-splitter",
    "audio-normalizer",
  ],
};

export default audioSilenceRemover;
