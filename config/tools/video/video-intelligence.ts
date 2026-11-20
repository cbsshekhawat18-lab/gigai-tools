import type { Tool } from "@/types";

/**
 * Video Intelligence, a transcription + analysis workspace, not a one-shot
 * converter. Whisper runs on-device via transformers.js (WebGPU/WASM), so media
 * never leaves the browser.
 *
 * HONEST SCOPE, stated in the page copy rather than buried:
 *   • No summarisation and no chat. Both need a hosted language model, which
 *  would mean uploading the transcript, the opposite of the promise this
 *     site makes. We ship what can be done locally and say why the rest isn't
 *     here, instead of shipping panels that quietly send data away.
 *   • Speaker labels are assigned by the user. Whisper does not diarise, so we
 *     don't fabricate "Speaker 1 / Speaker 2".
 *  • Sections come from pauses and speaker changes, structural segmentation,
 *     described as such rather than as topic understanding.
 *   • Practical ceiling is short-to-medium clips; the UI warns past ~20 minutes.
 */
const videoIntelligence: Tool = {
  slug: "video-intelligence",
  title: "Video Intelligence",
  notFor: [
    { text: "It does not summarise or extract action items - transcription is deliberately local-only, and summarisation needs a language model. For client recordings, the disclosed hybrid tool does that.", toolSlug: "video-to-work" },
    { text: "It does not automatically tell speakers apart. Whisper has no diarisation. You label speakers yourself, and the tool never invents \"Speaker 1/2\" it can't verify." },
    { text: "It does not convert or re-time existing caption files.", toolSlug: "subtitle-converter" },
  ],
  description:
    "Transcribe video and audio in your browser, then edit, search, label speakers and export. Speech recognition runs on your device. Nothing is uploaded.",
  category: "video-tools",
  icon: "Sparkles",
  accent: "violet",
  processor: "convert",
  status: "live",
  featured: true,
  createdAt: "2026-08-03",

  h1: "Video Intelligence, Transcribe & Analyze in Your Browser",
  tagline:
    "Turn a recording into a searchable, editable transcript with speakers, sections, keywords and analytics, without uploading a single byte.",
  longDescription:
    "Most transcription services want your recording on their servers. That's fine for a podcast clip and a problem for a client call, an interview under embargo, a medical consult or anything covered by an NDA. GigAI Video Intelligence does the work where the file already is: in your browser. It runs OpenAI's Whisper model compiled to WebAssembly and WebGPU, so speech recognition happens on your own machine, and the audio never travels anywhere. The model downloads once (42MB for the fast English build, 145MB for the multilingual one) and is then cached, so later recordings start immediately and work offline. What you get is a workspace rather than a text dump: a player with frame stepping, loop selection and bookmarks. A transcript where every line is clickable to seek and double-clickable to edit. Speakers you name and assign, with speaking time, word counts and pace measured per person. Sections detected from pauses and speaker handovers. Keywords ranked by TF-IDF so the terms that actually carry the topic float up. Detected emails, links, amounts, dates and figures, each linked to the moment it was said, and analytics that are measured rather than guessed. Export to text, Markdown, HTML, SRT, VTT, CSV, JSON or XML, captions go through the same serialiser as our subtitle tools, so timings match exactly. Two things this deliberately does not do: it won't summarise and it won't chat about your video. Both need a hosted language model, which would mean sending your transcript to someone else's server, and that would break the only promise here worth keeping. You can record your screen or camera straight into the workspace, or bring an SRT, VTT or text file you already have and skip transcription entirely.",

  ctaText: "Open the workspace",

  keywords: [
    "video to text",
    "transcribe video",
    "video transcription",
    "audio to text",
    "free transcription tool",
    "transcribe without uploading",
    "private transcription",
    "offline transcription",
    "video transcript editor",
    "whisper in browser",
    "generate subtitles from video",
    "speaker labels transcript",
  ],

  seo: {
    title: "Video Intelligence: Transcribe Video in Your Browser, Free | GigAI Tools",
    description:
      "Transcribe video and audio free with Whisper running in your browser. Edit the transcript, label speakers, detect sections and keywords, export SRT/VTT/DOCX-ready text. Nothing uploaded, no sign-up.",
  },

  features: [
    {
      icon: "ShieldCheck",
      title: "The recording never leaves your device",
      description:
        "Whisper runs locally through WebAssembly and WebGPU. There is no upload step, no queue and no retention policy to trust, close the tab and nothing remains.",
    },
    {
      icon: "FileText",
      title: "A transcript you can actually work with",
      description:
        "Click any line to jump the player there, double-click to correct it, search across the whole thing, and bookmark moments with a keystroke. Long transcripts stay fast because only the visible rows are rendered.",
    },
    {
      icon: "Users",
      title: "Speakers you name, with real numbers",
      description:
        "Assign lines to speakers and get measured speaking time, share of conversation, word count and words per minute for each, then merge or rename them as you go.",
    },
    {
      icon: "Tags",
      title: "Keywords ranked, not just counted",
      description:
        "Terms are scored by TF-IDF, so a word concentrated in one part of the discussion outranks a verbal tic repeated throughout. Every keyword links to the moment it was said.",
    },
    {
      icon: "Monitor",
      title: "Record screen or camera in place",
      description:
        "Capture a tab, a window, your whole screen or your webcam straight into the workspace and transcribe it without saving a file first.",
    },
    {
      icon: "Download",
      title: "Eight export formats",
      description:
        "Text, Markdown, HTML, SRT, VTT, CSV, JSON and XML. Captions use the same serialiser as our subtitle tools, so timings line up exactly with what a player expects.",
    },
  ],

  benefits: [
    {
      title: "Safe for work you can't upload",
      description:
        "Client calls, interviews under embargo, HR conversations, medical or legal recordings, material where sending the file to a third party isn't an option.",
    },
    {
      title: "No account, no minutes, no tier",
      description:
        "Hosted transcription services meter you by the minute. This runs on your hardware, so there's nothing to meter and nothing to sign up for.",
    },
    {
      title: "Works offline once loaded",
      description:
        "After the one-time model download, transcription keeps working with no connection at all, useful on a plane or anywhere the network isn't trustworthy.",
    },
    {
      title: "Bring your own transcript",
      description:
        "Already have captions from somewhere else? Import the SRT, VTT or text file and use the whole workspace (editing, speakers, keywords, analytics, exports) with no model download.",
    },
  ],

  howTo: [
    {
      title: "Add your recording",
      description:
        "Drop in a video or audio file, record your screen or camera, or import a transcript you already have. Nothing is uploaded at any point.",
    },
    {
      title: "Transcribe",
      description:
        "Pick the fast English model or the multilingual one and start. The model downloads once, then runs on your device. Progress is shown throughout.",
    },
    {
      title: "Edit and label",
      description:
        "Correct any line by double-clicking it, name your speakers and assign lines to them, and bookmark the moments you'll want to find again.",
    },
    {
      title: "Export",
      description:
        "Save as text, Markdown, HTML, SRT, VTT, CSV, JSON or XML, whichever your next tool expects.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI", "MP3", "WAV", "M4A", "SRT", "VTT", "TXT"],
    output: ["TXT", "MD", "HTML", "SRT", "VTT", "CSV", "JSON", "XML"],
  },

  faq: [
    {
      question: "Is my video really not uploaded?",
      answer:
        "Correct. The speech model is downloaded to your browser and runs there, so the audio is processed on your own machine. You can confirm it yourself: open your browser's network tab and you'll see the model being fetched, but your media is never sent anywhere.",
    },
    {
      question: "How long can the video be?",
      answer:
        "Honestly, this suits clips rather than long recordings. On a machine with WebGPU expect several times faster than realtime. Without it, slower than realtime. The tool warns you past about 20 minutes rather than letting you start a job that would run for hours. For a long recording, trim the section you need first, or import an existing transcript.",
    },
    {
      question: "Why is there no AI summary or chat?",
      answer:
        "Because both would require sending your transcript to a hosted language model: someone else's server. That's exactly what this tool exists to avoid, so rather than quietly uploading your data behind an AI button, we left those features out and told you why. Everything here runs locally or not at all.",
    },
    {
      question: "Does it identify who is speaking?",
      answer:
        "Not automatically. Whisper transcribes speech but doesn't perform speaker diarisation, so we don't invent labels it has no basis for. You add speakers and assign lines yourself, and once you have, the tool measures each person's speaking time, share of the conversation, word count and pace.",
    },
    {
      question: "Which languages does it handle?",
      answer:
        "The fast model is English-only. The balanced and accurate models are multilingual and cover roughly 99 languages, detecting the language automatically.",
    },
    {
      question: "Can I use it for subtitles?",
      answer:
        "Yes: export as SRT or VTT. Those go through the same serialiser as our subtitle converter, so the timings are exactly what a player expects. You can refine timings afterwards in the subtitle tools.",
    },
  ],

  relatedTools: ["subtitle-converter", "extract-audio", "video-trimmer", "video-compressor"],
};

export default videoIntelligence;
