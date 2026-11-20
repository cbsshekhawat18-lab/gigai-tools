import type { Tool } from "@/types";

/**
 * Audio to MP3, a focused "Convert" landing built for the exact query people
 * type: "audio to mp3". Where the MP3 Converter frames the job around a format
 * matrix (wav to mp3, m4a to mp3…), this tool answers the plainer question -
 * "I have some audio, I need an MP3", and walks a first-timer through it: drop
 * the file, hear it, pick a quality, download. Every string is written fresh for
 * that intent and deliberately shares nothing with the mp3-converter, trimmer,
 * recorder or normalizer copy.
 *
 * Engine is identical and native-first: WAV/MP3 sources decode with the Web
 * Audio API and encode with lamejs (no 31 MB codec download); M4A/AAC/OGG/FLAC
 * and video-container audio decode natively and hand a lossless WAV to the
 * shared on-demand codec only when required. No claim outruns real browser
 * encoding: CBR, ≤2 channels, honest that lossy-to-lossy re-encoding cannot add
 * back detail, honest about device memory.
 */
const audioToMp3: Tool = {
  slug: "audio-to-mp3",
  title: "Audio to MP3",
  description:
    "Turn any audio file into an MP3, right in your browser. Drop a recording or track, listen to it, choose how good you want the MP3 to sound, and download. No upload, no account, nothing leaves your device.",
  category: "audio-tools",
  group: "Convert",
  icon: "FileAudio",
  accent: "rose",
  status: "live",
  featured: false,
  createdAt: "2026-06-19",

  h1: "Audio to MP3. Make an MP3 From Any Audio File, In Your Browser",
  tagline:
    "Have a recording or track and just need a plain MP3? Drop it here, play it to be sure it's the right one, pick how good you want it to sound, and download. It all happens on your device: nothing is uploaded.",
  longDescription:
    "Audio to MP3 does one thing and keeps it simple: it takes the audio you already have and gives you back an MP3 you can send, upload or play anywhere. You don't need to know what format your file is in or which codec it uses: if it's a voice memo, a song, a lecture recording, an exported clip or the sound pulled from a video, just drop it and the tool figures out how to read it. It plays back in a built-in player so you can confirm you've got the right file before you commit, and instead of asking you to memorise bitrate numbers it offers a small set of plain-language quality choices, from 'small enough to email' up to 'as close to the original as MP3 gets'. Press convert and the encode runs on your own machine: WAV and MP3 sources take a fast, download-free path using the browser's built-in audio decoding plus the lamejs encoder, while less common containers (M4A, AAC, OGG, FLAC, a WEBM's audio track) are decoded in-browser and finished by an on-demand codec that only loads the first time you need it. When it's done you see exactly how big the MP3 turned out next to the original, then download with one click. The reason to do it here rather than a website that makes you upload first is simple: your audio never leaves the tab, so a private interview, an unreleased mix or a personal voice note stays yours. Two honest notes worth keeping in mind. MP3 is a lossy format, so converting something already compressed can't restore quality it never had, and everything is held in your browser's memory, so extremely long recordings are limited by your device's RAM rather than by us.",

  ctaText: "Make an MP3",

  keywords: [
    "audio to mp3",
    "convert audio to mp3",
    "audio file to mp3",
    "make an mp3",
    "audio to mp3 converter",
    "turn audio into mp3",
    "sound to mp3",
    "recording to mp3",
    "audio to mp3 online free",
    "audio to mp3 in browser",
    "voice memo to mp3",
    "song to mp3",
  ],

  seo: {
    title: "Audio to MP3: Convert Any Audio File to MP3 Free | GigAI Tools",
    description:
      "Convert any audio file to MP3 online, free. Drop a recording or track, preview it, pick a quality and download, 100% in your browser, no upload, no account, nothing stored.",
  },

  formats: {
    input: ["WAV", "M4A", "AAC", "OGG", "FLAC", "WEBM", "MP3"],
    output: ["MP3"],
  },

  features: [
    {
      icon: "MousePointerClick",
      title: "Just drop it. No format to figure out",
      description:
        "You don't need to know if your file is WAV, M4A, OGG or something else. Drag it in and the tool reads whatever your browser can decode, then hands you an MP3. One box, one answer.",
    },
    {
      icon: "Play",
      title: "Hear it before you convert",
      description:
        "A built-in player lets you listen to the source right in the page, so you can be certain you've picked the correct file. No more converting the wrong take and finding out on download.",
    },
    {
      icon: "Sparkles",
      title: "Plain-language quality, not bitrate homework",
      description:
        "Instead of guessing what '160 kbps' means, choose from clear options like 'small enough to email' or 'best MP3 quality'. The exact bitrate is still shown for anyone who wants it.",
    },
    {
      icon: "Zap",
      title: "Fast, download-free for common files",
      description:
        "WAV and MP3 sources convert entirely with the browser's native decoding and the built-in lamejs encoder. No heavyweight engine to fetch. Only less common containers load a codec, once.",
    },
    {
      icon: "Scale",
      title: "See the real file size",
      description:
        "When it finishes you get the original size and the new MP3 size side by side: the honest weight of what you'll actually send or upload, not a vague 'done' with no numbers.",
    },
    {
      icon: "Lock",
      title: "Your audio never leaves the tab",
      description:
        "Everything runs on your device. There's no upload, no server copy and nothing logged, so a private recording, a demo mix or a personal note stays entirely with you.",
    },
  ],

  benefits: [
    {
      title: "Get a file everything can open",
      description:
        "MP3 is the one audio format that plays on every phone, browser, car, editor and old media player. Convert once and stop worrying whether the person on the other end can open it.",
    },
    {
      title: "No sign-up, no upload wait, no tracking",
      description:
        "Most 'audio to mp3' sites make you upload first and hope they delete it. Here there's nothing to upload and no account. You open the page and you're already working, privately.",
    },
    {
      title: "Right-size it for where it's going",
      description:
        "Emailing a voice memo, posting a podcast, sharing a demo, each wants a different size. The quality options let you land a file that fits the limit without sounding rough.",
    },
  ],

  howTo: [
    {
      title: "Drop in your audio",
      description:
        "Drag any audio file onto the page or click to browse. It's read locally and starts playing in the built-in player so you can confirm it's the one you meant.",
    },
    {
      title: "Pick how good you want it",
      description:
        "Choose a quality from 'small enough to email' up to 'best MP3 quality'. If you're unsure, the balanced option is a safe pick for almost anything.",
    },
    {
      title: "Make the MP3",
      description:
        "Press Make an MP3. A progress bar tracks the encode on your device. Common files finish quickly. An unusual format loads its codec once the first time.",
    },
    {
      title: "Download it",
      description:
        "Check the before-and-after size, then download your MP3. Want it smaller or crisper? Reset and run again at a different quality: nothing is re-uploaded.",
    },
  ],

  useCases: [
    {
      audience: "Student / Note-taker",
      title: "Turn a lecture or meeting recording into a portable MP3",
      description:
        "Your recorder saved a big WAV or an M4A that won't open in your player. Convert it to a modest-quality MP3 that's small, plays anywhere and is easy to file away or share with classmates.",
    },
    {
      audience: "Creator / Podcaster",
      title: "Deliver a clean MP3 from a raw recording",
      description:
        "A recording app handed you a format your host or editor dislikes. Drop it, pick a balanced quality and get an MP3 that uploads fast and plays on every device your audience uses.",
    },
    {
      audience: "Musician / Hobbyist",
      title: "Share a song without exporting a heavy master",
      description:
        "You want to text a track to a friend or post a demo, but the WAV is huge. Convert it to a high-quality MP3 that sounds great and is a fraction of the size. No DAW round-trip needed.",
    },
    {
      audience: "Privacy-minded person",
      title: "Convert a personal recording without uploading it",
      description:
        "A voice note, a therapy recording or a confidential interview shouldn't be handed to a random website. Do the whole conversion in your browser so the audio never leaves your machine.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded anywhere?",
      answer:
        "No. The entire conversion runs inside your browser on your own device. WAV and MP3 files use the browser's built-in audio decoding plus the lamejs encoder, and less common formats add an on-demand codec that also runs locally. Your file is never uploaded, stored or logged, so it's safe for private and confidential recordings, there's no upload step and no cloud copy.",
    },
    {
      question: "What kinds of audio files can I convert?",
      answer:
        "Effectively anything your browser can play, commonly WAV, M4A/AAC, OGG, FLAC (on most browsers), WEBM audio, and even existing MP3s you want to re-save at a different quality. If the file loads and plays in the built-in player, it will convert. The main exceptions are DRM-protected purchases and very unusual raw codecs. Re-export those to WAV first.",
    },
    {
      question: "Which quality should I choose?",
      answer:
        "For speech (voice memos, lectures, podcasts) the smaller options sound clean and keep the file tiny. For music, pick a higher quality so nothing feels dull. 'Balanced' is a reliable default for almost anything, and the tool shows the resulting file size so you can confirm before downloading.",
    },
    {
      question: "Will the MP3 sound as good as the original?",
      answer:
        "MP3 is a lossy format, so a little detail is always dropped to make the file smaller: from a high-quality source at the top setting the difference is usually inaudible. If your original is already a compressed file (like an M4A), converting it decodes and re-encodes, which can lose a touch more and can never add quality back, so choose a higher setting for those.",
    },
    {
      question: "Why do some files convert instantly and others load something first?",
      answer:
        "Common files take a fast native path: WAV and MP3 are decoded and encoded entirely with the browser and lamejs, with nothing extra to download. Less common containers like OGG, FLAC and M4A need a small on-demand codec to finish the job. It loads once the first time you convert one and is then reused for the rest of your session.",
    },
    {
      question: "How long a recording can I convert?",
      answer:
        "Because everything happens in your browser's memory, the limit is your device's RAM rather than a fixed upload cap. Songs, episodes and voice memos of many minutes are no problem on a typical laptop. A multi-hour recording can use a lot of memory and briefly pause the tab, for those, trim it first or convert in sections.",
    },
    {
      question: "Do I need to install anything or make an account?",
      answer:
        "No. There's no install, plugin, sign-up, watermark or audible tag on the result. Open the page, drop your audio, pick a quality, convert and download. The encoder loads automatically the first time and everything else runs right in the tab.",
    },
    {
      question: "Does it work on a phone or offline?",
      answer:
        "Yes. Once the page has loaded, the conversion needs no connection. It runs on your machine. It works in modern mobile browsers too, though phones have less memory and are slower, so stick to shorter clips on mobile for the smoothest results.",
    },
  ],

  tips: [
    "Not sure what to pick? Start with the balanced quality. It sounds good for both music and speech and is a sensible default for almost every file.",
    "For talking-only audio (voice memos, lectures, podcasts) the smaller quality settings are hard to tell apart from bigger ones and save a lot of space.",
    "Convert from the best source you have. A WAV or FLAC gives a cleaner MP3 than re-converting an already-compressed file, which can only lose more.",
    "Play the file in the built-in player before converting so you're certain it's the right take. It saves re-doing the whole thing after download.",
    "If the finished MP3 is still too big to send, the recording is probably just long. Trim it rather than dropping the quality to a rough level.",
  ],

  troubleshooting: [
    {
      problem: "My file won't load or play.",
      solution:
        "The tool can only read audio your browser can decode. Most WAV, MP3, M4A/AAC, OGG and (on most browsers) FLAC files work. A DRM-protected purchase, a raw/exotic codec or a corrupt file may not. Re-export the source to WAV first, then convert that.",
    },
    {
      problem: "The MP3 sounds a little duller than the original.",
      solution:
        "That's MP3 being lossy: some detail is discarded to shrink the file, and re-encoding an already-compressed source adds a touch more. Choose a higher quality setting, and where possible convert from a lossless WAV or FLAC rather than another compressed file.",
    },
    {
      problem: "A very long recording made the tab slow or run out of memory.",
      solution:
        "Converting holds the decoded audio in memory, so a multi-hour file on a low-memory device can strain the tab. Close other heavy tabs and retry. For the longest recordings, trim first or convert in shorter sections.",
    },
  ],

  security:
    "Your audio is decoded and re-encoded entirely inside your browser. Common WAV and MP3 files use the browser's native audio decoding and the built-in lamejs encoder. Less common formats add an on-demand codec that also runs locally on your device. Nothing is ever uploaded to a server, stored or logged, so private interviews, voice notes and unreleased tracks are safe to convert here. There's no upload step and no cloud copy: close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-19",
      change:
        "First release, a beginner-friendly 'audio to MP3' converter with drag-and-drop, an in-page player to preview the source, plain-language quality choices, native in-browser encoding via lamejs and a one-click download.",
    },
    {
      date: "2026-06-25",
      change:
        "Added on-demand support for M4A/AAC/OGG/FLAC and video-container audio, with a codec that loads only when a less common file needs it so WAV/MP3 conversions stay instant and download-free.",
    },
  ],

  relatedTools: ["mp3-converter", "audio-trimmer", "audio-recorder", "audio-merger"],
};

export default audioToMp3;
