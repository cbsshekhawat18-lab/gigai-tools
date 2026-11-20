import type { Tool } from "@/types";

/**
 * Audio Player: the "Info" / listening flagship of the GigAI Audio Toolkit.
 *
 * A pure, private in-browser player: drop a track and a real waveform paints
 * instantly, then play it with click-to-seek, variable speed, full loop, and an
 * A–B repeat loop for drilling a single passage. There is NO upload, NO export
 * and NO processing: the file is decoded locally for the waveform and streamed
 * straight to the browser's audio engine, so nothing is re-encoded and nothing
 * leaves the tab. Every string below is written for what people actually search
 * ("play an audio file without uploading", "loop a section of a song", "slow
 * down audio to transcribe", "A-B repeat player") and is not shared with any
 * other tool's copy.
 */
const audioPlayer: Tool = {
  slug: "audio-player",
  title: "Audio Player",
  description:
    "A clean, private audio player for your browser: drop an MP3, WAV, M4A or OGG and a real waveform paints instantly. Click to seek, change speed, loop the whole track, or set an A–B repeat to drill one passage. Nothing is uploaded, nothing is processed, nothing leaves the tab.",
  category: "audio-tools",
  group: "Info",
  icon: "Play",
  accent: "rose",
  status: "live",
  featured: false,
  createdAt: "2026-06-18",

  h1: "Audio Player: Play, Loop & Slow Down Audio Online, Privately",
  tagline:
    "Drop a track and a real waveform paints in an instant. Click anywhere to seek, dial the speed up or down, loop the whole file, or drag out an A–B region to repeat a single passage on a loop: all in your browser, with nothing uploaded and nothing re-encoded.",
  longDescription:
    "The GigAI Audio Player is a listening tool, not an editor: it decodes your file locally with the browser's native Web Audio API to draw a crisp waveform, then hands playback straight to the browser's audio engine so the sound you hear is the untouched original. No upload, no export, no re-encoding. Click or tap anywhere on the wave to seek, watch a live playhead track the position, and read the exact current and total time. Because you can see the audio, you can jump to the drop, the chorus or the moment someone starts speaking without scrubbing blind. When you need to study a passage (a guitar lick to learn, a fast line of dialogue to transcribe, a language phrase to shadow) drag an A and a B point onto the waveform and the player loops just that region endlessly until you clear it. Pair that with variable speed (from a slow 0.5× for transcription up to 2× to skim) and you have a practice-and-review player that most desktop apps charge for. There is deliberately no download button and no processing step here: the whole point is a fast, private way to listen, loop and slow down audio that you don't want to send anywhere. The file is opened in the tab, played on your device, and discarded the moment you close it: ideal for confidential recordings, unreleased demos, interview tapes and personal voice notes. No account, no install, no watermark, no queue.",

  ctaText: "Open a track",

  keywords: [
    "audio player",
    "online audio player",
    "play audio in browser",
    "play mp3 without uploading",
    "loop audio online",
    "a-b repeat player",
    "ab loop player",
    "slow down audio online",
    "change audio speed",
    "waveform audio player",
    "private audio player",
    "loop a section of a song",
    "audio speed controller",
    "browser mp3 player",
  ],

  seo: {
    title: "Audio Player, Play, Loop & Slow Down MP3/WAV Online Free | GigAI Tools",
    description:
      "Free online audio player with a real waveform. Drop an MP3, WAV, M4A or OGG, click to seek, change speed, loop the whole track, or set an A–B repeat to drill one passage. 100% in your browser. Nothing is uploaded or re-encoded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: [],
  },

  features: [
    {
      icon: "AudioWaveform",
      title: "See the sound as you play",
      description:
        "Your track is decoded locally and drawn as a crisp waveform, so you can spot the intro, the drop or the moment speech starts and jump straight there instead of scrubbing blind.",
    },
    {
      icon: "MousePointerClick",
      title: "Click anywhere to seek",
      description:
        "Tap or click any point on the wave to jump there, with a live playhead tracking playback and an exact current / total time readout, precise navigation on desktop, tablet and phone.",
    },
    {
      icon: "Repeat",
      title: "A–B repeat one passage",
      description:
        "Set an A point and a B point on the waveform and the player loops only that region, over and over, until you clear it, perfect for learning a riff, a line or a phrase.",
    },
    {
      icon: "Gauge",
      title: "Variable playback speed",
      description:
        "Slow the audio to 0.5× to catch every word for transcription, or push it to 2× to skim a long recording, the pitch shifts with speed, exactly like a tape machine.",
    },
    {
      icon: "RefreshCw",
      title: "Loop the whole track",
      description:
        "Flip on full-track loop for background practice, ambient playback or a beat you want running on repeat while you work. No need to hit play again at the end.",
    },
    {
      icon: "ShieldCheck",
      title: "Nothing uploaded, nothing altered",
      description:
        "The file is opened and played entirely in your browser and never re-encoded or exported. It isn't sent to a server, stored or logged, so private recordings stay private.",
    },
  ],

  benefits: [
    {
      title: "A practice player without the price tag",
      description:
        "A–B looping plus slow-down speed is exactly what musicians and language learners buy dedicated apps for. Here it's free, instant and works on any device with a browser.",
    },
    {
      title: "Truly private listening",
      description:
        "Because the file is only decoded for the waveform and played locally, you can safely open a confidential interview, a legal recording or an unreleased demo without uploading it anywhere.",
    },
    {
      title: "No re-encoding, no quality loss",
      description:
        "This is a player, not a converter. It never re-compresses your audio, so what you hear is bit-for-bit the file you dropped, at full original fidelity.",
    },
    {
      title: "Nothing to install",
      description:
        "Skip the desktop media app, the plugin and the sign-up. Open the page, drop a file, and you're listening, with the tab clearing every trace when you close it.",
    },
  ],

  howTo: [
    {
      title: "Open your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the player, or click to browse. It decodes locally in a moment and a waveform of the whole track appears with its length and channel layout.",
    },
    {
      title: "Play and seek",
      description:
        "Press play (or Space) and click anywhere on the waveform to jump to that spot. A live playhead and a current / total time readout keep you oriented.",
    },
    {
      title: "Set an A–B loop (optional)",
      description:
        "Drag across the waveform to mark an A point and a B point. The player then repeats only that region on a loop, nudge the handles to tighten it, or clear it to play the whole track again.",
    },
    {
      title: "Adjust speed and loop",
      description:
        "Slow the audio down to catch detail or speed it up to skim, and toggle whole-track loop for continuous playback. Nothing is exported, it's all live playback.",
    },
  ],

  useCases: [
    {
      audience: "Musician / Learner",
      title: "Learn a riff or solo by ear",
      description:
        "Set an A–B loop around the tricky bar, drop the speed to 0.5×, and drill it until it's under your fingers: then nudge the tempo back up as it clicks.",
    },
    {
      audience: "Transcriber / Journalist",
      title: "Slow down speech to transcribe",
      description:
        "Play an interview at 0.75× so you catch every word, click the waveform to re-hear a mumbled phrase, and A–B loop a hard section without re-scrubbing each time.",
    },
    {
      audience: "Language learner",
      title: "Shadow a phrase on repeat",
      description:
        "Loop a single sentence from a lesson or podcast and play it back slowly, again and again, to mimic the rhythm and pronunciation until it's natural.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Review a sensitive recording",
      description:
        "Open a confidential voice memo, legal recording or unreleased track and listen through it entirely on your device, it's never uploaded to anyone's server just to press play.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. The file is decoded locally to draw the waveform and then played straight through your browser's audio engine. It never leaves your device, isn't stored or logged, and is discarded when you close the tab. That makes it safe for confidential interviews, voice notes and unreleased music.",
    },
    {
      question: "Does this player change or re-encode my file?",
      answer:
        "No. It's a listening tool, not a converter or editor. Your audio is played back untouched at full original quality, there's no re-compression, no export and no download button, because nothing about the file is altered.",
    },
    {
      question: "How does A–B repeat work?",
      answer:
        "Drag across the waveform to place an A point and a B point. The player then loops only the audio between them, over and over, so you can drill a riff, a line of dialogue or a phrase. Nudge the handles to tighten the region, or clear the loop to play the whole track again.",
    },
    {
      question: "Can I slow audio down without changing the pitch?",
      answer:
        "Not in this player: changing the speed shifts the pitch with it, exactly like slowing a tape. That's ideal for transcription and casual practice. If you specifically need to slow audio while keeping the original pitch, use the Audio Speed Changer with its pitch-preserve option (which is an approximate time-stretch, not a true one).",
    },
    {
      question: "What formats can I play?",
      answer:
        "Anything your browser can decode natively, MP3, WAV, M4A/AAC, OGG, FLAC, Opus and WebM audio. Support varies a little between browsers. If a file won't open, it's usually a niche or DRM-protected codec. Convert it first with the Audio Converter and it'll play here.",
    },
    {
      question: "Can I download or trim the audio here?",
      answer:
        "No. By design. This is purely a player, so there's no export or editing. To cut a clip use the Audio Trimmer, to change the format use the Audio Converter, and to adjust speed as a saved file use the Audio Speed Changer. This tool just lets you listen, loop and study.",
    },
    {
      question: "Is there a length or size limit?",
      answer:
        "There's no hard limit, but drawing the waveform decodes the whole track into memory, so a very large file may take a moment to open or strain a low-RAM device. Playback itself is light. It's the initial waveform decode that's memory-bound. On phones, stick to reasonably sized files for the smoothest experience.",
    },
    {
      question: "Does it work offline and on mobile?",
      answer:
        "Yes. Once the page has loaded it needs no network to play your files, and it runs on modern mobile browsers with the same click-to-seek, speed, loop and A–B controls. Phones have less memory, so very long files may open more slowly there.",
    },
  ],

  tips: [
    "Combine a tight A–B loop with 0.5× speed to learn a fast passage, loop it slow until it's clean, then step the speed back up toward 1×.",
    "Click directly on the waveform to jump to a spot rather than dragging the whole track. It's faster and lands exactly where you point.",
    "Setting a new A point clears the old loop, so you can walk an A–B region through a track section by section without resetting anything.",
    "Use whole-track loop for background practice or ambience, and A–B loop when you're drilling one specific part: they're different tools for different jobs.",
    "If a big file feels slow to open, close other heavy tabs first: it's the one-time waveform decode, not playback, that uses the memory.",
  ],

  troubleshooting: [
    {
      problem: "The file won't open or shows a decode error.",
      solution:
        "Your browser couldn't decode that codec: usually a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG. For an exotic format, convert it first with the Audio Converter and it will play here.",
    },
    {
      problem: "The A–B loop won't set, or nothing repeats.",
      solution:
        "You need an A and a B point that are apart, drag across the waveform so the region has real length. A zero-width selection has nothing to loop, so the readout should show a non-zero region before repeat kicks in.",
    },
    {
      problem: "Slowing the audio down also lowers its pitch.",
      solution:
        "That's expected. This player changes speed like a tape machine, so pitch moves with it. If you need slow playback that keeps the original pitch, use the Audio Speed Changer's pitch-preserve mode instead.",
    },
    {
      problem: "A large file is slow to open or the tab feels heavy.",
      solution:
        "Drawing the waveform decodes the whole track into memory. Close other heavy tabs and retry. If it still struggles the file is likely too large for this device's RAM. Playback of shorter files stays smooth.",
    },
  ],

  security:
    "Your audio is opened and played entirely in your browser: it is decoded locally only to draw the waveform, then streamed to the browser's audio engine untouched. Nothing is uploaded, re-encoded, exported, stored or logged, so you can safely play confidential interviews, voice notes and unreleased music. There is no server copy and no download step, close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, drop-to-decode with a native Web Audio waveform, click-to-seek playback, a live playhead and current / total time readout, whole-track loop, and variable playback speed. No upload, no export.",
    },
    {
      date: "2026-06-24",
      change:
        "Added A–B repeat: drag out a region on the waveform to loop just that passage, with keyboard-nudgeable handles and a one-click clear, plus a finer speed selector for transcription and practice.",
    },
    {
      date: "2026-06-30",
      change:
        "Polished the mobile touch targets, added a keyboard-first control row (play, loop, speed, A–B) with AA-contrast focus rings, and improved honest guidance for large-file decoding.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-speed-changer",
    "audio-recorder",
    "mp3-converter",
  ],
};

export default audioPlayer;
