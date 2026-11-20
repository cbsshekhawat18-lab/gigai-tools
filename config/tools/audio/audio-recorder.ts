import type { Tool } from "@/types";

/**
 * Audio Recorder: the flagship "Record" tool of the GigAI Audio Toolkit and the
 * showcase for the browser's native capture stack (getUserMedia + MediaRecorder,
 * with the Web Audio API decoding and re-encoding the take). Hit record, watch a
 * live level meter and a running timer, then trim the dead air off the ends with
 * a draggable waveform and export a clean WAV or MP3: all on your own device.
 *
 * Every string is written for the specific things people search when they want
 * to "record my voice online", "record a voiceover in the browser", "voice
 * recorder no download", or "record mic to MP3": nothing is shared with the
 * trimmer, converter or merger copy, and no claim outruns what MediaRecorder +
 * Web Audio actually deliver (honest about the mic permission prompt, about
 * capture being local, and about WAV being uncompressed / large).
 */
const audioRecorder: Tool = {
  slug: "audio-recorder",
  title: "Audio Recorder",
  description:
    "Record from your microphone right in the browser: live level meter and timer, trim the ends on a waveform, then export a clean WAV or MP3. Nothing is uploaded. Your audio never leaves your device.",
  category: "audio-tools",
  group: "Record",
  icon: "Mic",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-14",

  h1: "Audio Recorder, Record Your Microphone Online, Export WAV or MP3",
  tagline:
    "Tap record and capture your voice straight in the browser: a live level meter and timer show you're being heard, a draggable waveform lets you trim the silent ends, and one click exports a clean WAV or MP3. No app, no account, and the recording never leaves your device.",
  longDescription:
    "The GigAI Audio Recorder turns your browser tab into a proper voice recorder using the microphone capture your device already ships with: getUserMedia and MediaRecorder handle the capture, and the native Web Audio engine decodes and re-encodes the take, so nothing is ever uploaded. Press record and you get the feedback a real recorder gives you: a live input-level ring that reacts to your voice so you can see the mic is actually picking you up, and a running timer counting the take. Pause and resume as many times as you need, then stop. What you record almost always has a little dead air at the front and back, you fumbling for the button, so the recorder drops you into a waveform where you can drag a selection over just the part you want to keep and preview it before you commit. When it sounds right, export: a lossless WAV for editing and archiving, or an MP3 (choose the bitrate) when you need a small, shareable file. Because capture, trimming and encoding all happen locally, there's no upload wait and no privacy tradeoff: a voice memo, a voiceover, a song idea or a confidential note is captured and processed entirely on your machine, and your browser asks permission before the mic is ever used. Be honest about the medium: the browser records into whatever compressed container it natively supports (usually WebM/Opus, or MP4/AAC on Safari), and we decode that and re-encode to your chosen WAV or MP3 on export. WAV is uncompressed so long takes make large files, which is exactly why the MP3 option is there. Close the tab and the recording is gone.",

  ctaText: "Start recording",

  keywords: [
    "audio recorder",
    "voice recorder online",
    "record voice online",
    "record microphone in browser",
    "online mic recorder",
    "record voiceover online",
    "record audio to mp3",
    "browser voice recorder",
    "record wav online",
    "free online voice recorder",
    "record and trim audio",
    "no download voice recorder",
  ],

  seo: {
    title: "Audio Recorder: Record Your Mic Online, Export WAV/MP3 | GigAI Tools",
    description:
      "Free online voice recorder. Record from your microphone in the browser with a live level meter and timer, trim the ends on a waveform, and export WAV or MP3, 100% on your device, nothing uploaded.",
  },

  features: [
    {
      icon: "Mic",
      title: "One-tap microphone capture",
      description:
        "Uses your browser's own recording stack (getUserMedia + MediaRecorder) to capture your mic. No plugin, no install, no account. Your browser asks permission first, and you're recording in a tap.",
    },
    {
      icon: "Activity",
      title: "Live level meter and timer",
      description:
        "A reactive input-level ring pulses with your voice so you can confirm the mic is being heard, while a running timer tracks the take: the feedback a real recorder gives you, in the tab.",
    },
    {
      icon: "Pause",
      title: "Pause, resume, then stop",
      description:
        "Gather your thoughts mid-take: pause the recording and pick it back up whenever you're ready. The timer banks the paused time so the final length is exactly what you captured.",
    },
    {
      icon: "Scissors",
      title: "Trim the dead air on a waveform",
      description:
        "Every take has fumble at the front and back. Drag a selection over just the part you want on a crisp waveform, preview it, and export only that. No separate editor needed.",
    },
    {
      icon: "FileAudio",
      title: "Export WAV or MP3",
      description:
        "Download a lossless WAV for editing and archiving, or a compact MP3 (pick the bitrate) for sharing. The decode-and-encode runs natively on your device. No heavyweight engine to load.",
    },
    {
      icon: "ShieldCheck",
      title: "100% local, nothing uploaded",
      description:
        "Capture, trimming and encoding all happen in your browser. A voice memo, voiceover or confidential note is never streamed to a server, stored or logged, close the tab and it's gone.",
    },
  ],

  benefits: [
    {
      title: "Record anywhere, no software",
      description:
        "No app to install, no account to make, no upload to wait on. Open the page on a laptop or phone, allow the mic, and you're capturing audio in seconds: then walking away with a file.",
    },
    {
      title: "Private by design",
      description:
        "Because the recording is captured and encoded on your own device and never leaves it, you can safely record something personal, unreleased or confidential, there's nothing to trust a server with.",
    },
    {
      title: "Clean takes without an editor",
      description:
        "The built-in trim step means you don't have to open a DAW just to shave the silence off the ends. Select, preview, export, a shareable clip that starts and ends exactly where you want.",
    },
    {
      title: "The right format for the job",
      description:
        "Keep a lossless WAV as your master for later editing, or drop to MP3 when you need a small file to email, attach to a ticket, or hand to someone, your choice, at export.",
    },
  ],

  howTo: [
    {
      title: "Allow the microphone",
      description:
        "Press the record button. Your browser asks for microphone permission the first time. Allow it. The request is between you and your browser, and the audio stays on your device.",
    },
    {
      title: "Record your take",
      description:
        "Watch the level meter react to your voice and the timer count up. Pause and resume as needed to collect your thoughts, then press stop when you're done.",
    },
    {
      title: "Trim the ends",
      description:
        "Your take appears as a waveform. Drag a selection over just the part you want to keep, cutting the fumble off the front and back, and preview it to be sure.",
    },
    {
      title: "Export WAV or MP3",
      description:
        "Choose lossless WAV or a compact MP3 (set the bitrate), then download. Or start over to record a fresh take: nothing is kept once you leave.",
    },
  ],

  formats: {
    input: ["Microphone"],
    output: ["WAV", "MP3"],
  },

  useCases: [
    {
      audience: "Creator / Voice artist",
      title: "Record a quick voiceover or narration",
      description:
        "Capture a voiceover for a video, a narration for slides, or a scratch vocal without opening a DAW, record, trim the ends, and export a clean WAV to drop into your edit.",
    },
    {
      audience: "Student / Professional",
      title: "Capture a voice memo or note",
      description:
        "Record a spoken note, a reminder, or an idea before it's gone. Trim it tight and export an MP3 small enough to email yourself or attach to a doc, all without leaving the browser.",
    },
    {
      audience: "Musician / Podcaster",
      title: "Grab a song idea or a take",
      description:
        "Hum a melody, lay down a rough take, or record a podcast intro on the spot. Keep the lossless WAV as a master so you lose nothing when you build on it later.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Record something sensitive, locally",
      description:
        "A confidential statement, a personal message or private audio shouldn't be uploaded to a stranger's server to be recorded. Capture and export it entirely in your own browser.",
    },
  ],

  troubleshooting: [
    {
      problem: "The browser won't let me use the microphone.",
      solution:
        "Recording needs your permission. If you dismissed or blocked the prompt, open your browser's site settings for this page, set the microphone to Allow, and try again. Mic capture also generally requires a secure (https) page.",
    },
    {
      problem: "The level meter isn't moving while I talk.",
      solution:
        "Check that the right microphone is selected in your operating system's sound settings and that it isn't muted, then reload and grant permission again. On a laptop, an external mic or headset can override the built-in one. Pick the device you're actually speaking into.",
    },
    {
      problem: "My exported WAV file is really large.",
      solution:
        "WAV is uncompressed, so its size grows steadily with length: that's the tradeoff for lossless quality. If you need a small, shareable file, export MP3 instead (and pick a lower bitrate). Keep WAV only when you plan to edit or archive the master.",
    },
    {
      problem: "Recording isn't available at all.",
      solution:
        "A few older or locked-down browsers don't expose microphone recording (MediaRecorder/getUserMedia). Update to a current version of Chrome, Edge, Firefox or Safari, make sure you're on an https page, and confirm no policy or extension is blocking mic access.",
    },
  ],

  tips: [
    "Do a two-second test first: watch the level ring react to your voice before the real take, so you know the mic is picked up and roughly how loud you are.",
    "Aim for the meter to move well but not peg to the top: a little headroom keeps the recording clean and avoids clipping on loud words.",
    "Use pause/resume to skip a cough or collect your thoughts instead of stopping: the timer only counts the audio you actually keep.",
    "Trim generously: cutting the fumble off the front and back is the single biggest thing that makes a recording sound intentional.",
    "Export WAV when you'll edit later and MP3 when you'll share now. You can always re-record and grab the other format in a moment.",
  ],

  security:
    "Your recording is captured, trimmed and encoded entirely in your browser using your device's native microphone stack (getUserMedia + MediaRecorder) and the Web Audio engine. It is never uploaded to any server. Your browser asks permission before the microphone is used, and the audio is never streamed, stored or logged. There's no upload step and no cloud copy. Close the tab and the recording is gone, which is exactly what you want for anything personal or confidential.",

  faq: [
    {
      question: "Is my recording uploaded or is everything done in the browser?",
      answer:
        "Everything is done in your browser. Capture uses your device's own microphone stack (getUserMedia + MediaRecorder), and the trim and the WAV/MP3 encode run natively in the Web Audio engine on your machine. Nothing is ever streamed to a server, stored or logged, there's no upload step, and the recording is gone the moment you close the tab. That's what makes it safe for personal or confidential audio.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's no app, no browser plugin, no sign-up and no watermark. Open the page, allow the microphone when your browser asks, record, trim, and download. It works on modern desktop and mobile browsers alike.",
    },
    {
      question: "Why does it ask for microphone permission?",
      answer:
        "Browsers require your explicit permission before any page can use the mic, that's a privacy protection, and a good one. The prompt is between you and your browser. Granting it doesn't send your audio anywhere, it just lets this page capture from the microphone you choose. You can revoke it any time in your browser's site settings.",
    },
    {
      question: "What formats can I export, and which should I pick?",
      answer:
        "You can export a lossless WAV or a compressed MP3. Choose WAV when you'll edit or archive the recording. It keeps every bit of quality, but the file is larger. Choose MP3 (and set the bitrate) when you need a small file to share, email or attach. Higher bitrates sound better and weigh more.",
    },
    {
      question: "Why is my WAV file so much bigger than an MP3?",
      answer:
        "WAV stores audio uncompressed, so its size is roughly fixed per second regardless of content, that's the price of being lossless. MP3 throws away data you're unlikely to hear to shrink the file dramatically. For a long take that you only need to share, MP3 is usually the better call. Keep WAV for masters you'll edit.",
    },
    {
      question: "Can I pause and resume, or only record in one go?",
      answer:
        "You can pause and resume as many times as you like within a take. The timer banks the paused time, so the final recording is a continuous clip of exactly the audio you captured, handy for skipping a cough or gathering your thoughts without starting over.",
    },
    {
      question: "How do I get rid of the silence at the start and end?",
      answer:
        "After you stop, your take is shown as a waveform. Drag a selection over just the part you want to keep, the silence and fumble at the front and back fall outside it, preview to confirm, and export only that selection. No separate editor is needed.",
    },
    {
      question: "Does it work on my phone?",
      answer:
        "Yes, on current mobile browsers that support microphone recording. Allow the mic when prompted, record, trim and export just like on desktop. Note that on Safari the browser captures into MP4/AAC internally, which we decode and re-encode to your chosen WAV or MP3 on export.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release, in-browser microphone recording via getUserMedia + MediaRecorder, a live input-level meter and running timer, and one-click export to lossless WAV, all processed locally with nothing uploaded.",
    },
    {
      date: "2026-06-21",
      change:
        "Added a post-record waveform trim step (drag a selection, preview, keep only what you want) and pause/resume during a take, with the timer banking paused time.",
    },
    {
      date: "2026-06-28",
      change:
        "Added MP3 export with a selectable bitrate alongside WAV, clearer microphone-permission and unsupported-browser messaging, and a start-over-and-re-record flow.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-normalizer",
    "audio-merger",
    "mp3-converter",
    "ringtone-maker",
  ],
};

export default audioRecorder;
