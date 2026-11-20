import type { Tool } from "@/types";

/**
 * Subtitle Converter & Retimer: convert SRT ↔ WebVTT and shift caption timing
 * to fix out-of-sync audio, entirely in the browser. Pure string processing: no
 * upload, no ML, no ffmpeg. The safe, verifiable core of "working with captions"
 * (the transcribe-and-burn pipeline needs a large model + ffmpeg libass).
 */
const subtitleConverter: Tool = {
  slug: "subtitle-converter",
  title: "Subtitle Converter",
  description:
    "Convert subtitles between SRT and WebVTT and shift the timing to fix out-of-sync captions: instantly, in your browser. Nothing uploaded, no sign-up.",
  category: "video-tools",
  icon: "Captions",
  accent: "cyan",
  status: "live",
  featured: false,
  createdAt: "2026-07-10",

  h1: "Subtitle Converter & Retimer (SRT ↔ VTT)",
  tagline:
    "Convert between SRT and WebVTT, and nudge every caption earlier or later to fix subtitles that drifted out of sync: all in your browser, nothing uploaded.",
  longDescription:
    "Web video players want WebVTT, most editors export SRT, and captions are forever a second or two out of sync. The GigAI Subtitle Converter fixes all three in one place. Paste or upload an SRT or VTT file and it detects the format automatically, then converts to whichever you need, handling the small-but-annoying differences, like SRT using a comma before the milliseconds and VTT using a dot, plus the WEBVTT header and cue numbering. If the captions are out of sync with the audio, enter an offset in seconds (positive to push them later, negative to pull them earlier) and every timestamp shifts together. A clean-up option sorts the cues by start time and renumbers them. Everything runs as plain text processing in your browser, so your subtitle file, which may contain an unreleased script, is never uploaded.",

  ctaText: "Convert subtitles",

  keywords: [
    "subtitle converter",
    "srt to vtt",
    "vtt to srt",
    "convert srt to vtt",
    "subtitle timing shift",
    "fix out of sync subtitles",
    "resync subtitles",
    "srt vtt converter",
    "shift subtitle timing",
    "webvtt converter",
  ],

  seo: {
    title: "Subtitle Converter & Retimer (SRT ↔ VTT), Free & Private | GigAI Tools",
    description:
      "Convert subtitles between SRT and WebVTT and shift timing to fix out-of-sync captions. Free, private and in your browser: nothing uploaded, no sign-up.",
  },

  features: [
    {
      icon: "ArrowRightLeft",
      title: "SRT ↔ WebVTT both ways",
      description:
        "Auto-detects the input format and converts to the other, handling the comma-vs-dot milliseconds, the WEBVTT header and cue numbering.",
    },
    {
      icon: "Clock",
      title: "Fix out-of-sync captions",
      description:
        "Enter an offset in seconds (positive to delay, negative to advance) and every caption shifts together so the timing lines up again.",
    },
    {
      icon: "ListOrdered",
      title: "Clean up automatically",
      description:
        "Sort captions by start time and renumber them in one pass, tidying up files that were edited by hand.",
    },
    {
      icon: "Lock",
      title: "Never uploaded",
      description:
        "Subtitle files can contain unreleased scripts. This processes them as plain text in your browser: nothing leaves your device.",
    },
  ],

  benefits: [
    {
      title: "Make captions work on the web",
      description:
        "HTML5 video and most streaming players need WebVTT. Convert your SRT export in a click, ready to drop into a <track> element.",
    },
    {
      title: "Rescue drifted subtitles",
      description:
        "When captions run ahead of or behind the audio, a single offset re-syncs the whole file. No editing each line by hand.",
    },
    {
      title: "Instant and free",
      description:
        "No account, no watermark, no upload queue. Paste, adjust, download: as many files as you like.",
    },
  ],

  howTo: [
    {
      title: "Paste or upload your subtitles",
      description:
        "Drop in an .srt or .vtt file, or paste the text. The format is detected automatically.",
    },
    {
      title: "Pick the target format",
      description:
        "Choose WebVTT (for web players) or SRT (for editors and most media players).",
    },
    {
      title: "Shift the timing if needed",
      description:
        "If captions are out of sync, enter an offset in seconds, positive to delay them, negative to advance them.",
    },
    {
      title: "Copy or download",
      description:
        "Grab the converted, retimed file. Sort & renumber tidies everything up before you export.",
    },
  ],

  formats: {
    input: ["SRT", "VTT"],
    output: ["SRT", "VTT"],
  },

  faq: [
    {
      question: "What's the difference between SRT and VTT?",
      answer:
        "They're nearly the same caption format. WebVTT adds a WEBVTT header, uses a dot before the milliseconds (00:00:01.000), and supports styling. SRT uses a comma (00:00:01,000) and numbered cues. Web players need VTT. Most editors and media players use SRT.",
    },
    {
      question: "How do I fix subtitles that are out of sync?",
      answer:
        "Enter an offset in seconds. A positive value pushes every caption later (use it when subtitles appear too early). A negative value pulls them earlier (when they lag the audio). The whole file shifts together.",
    },
    {
      question: "Does it change the caption text?",
      answer:
        "No, only the format and timing. The wording of every caption is preserved exactly, including line breaks.",
    },
    {
      question: "Is my subtitle file uploaded?",
      answer:
        "No. Conversion and retiming are plain text operations that run entirely in your browser, so your file, which may contain an unreleased script, never leaves your device.",
    },
    {
      question: "Can it transcribe audio into subtitles?",
      answer:
        "Not this tool. It converts and retimes existing subtitle files. Automatic transcription needs a large speech-recognition model. This focuses on doing the conversion and sync reliably and instantly.",
    },
  ],

  relatedTools: ["video-intelligence", "video-converter", "video-trimmer", "extract-audio"],
};

export default subtitleConverter;
