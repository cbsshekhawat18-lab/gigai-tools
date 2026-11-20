import type { Tool } from "@/types";

/**
 * Audio Metadata Viewer: the "read-only" companion to the GigAI Audio Toolkit.
 * Drop any browser-decodable clip and it reports the facts that actually matter
 * before you edit or convert: exact duration (measured from the decoded buffer,
 * not the container header), sample rate, channel layout, file size, MIME type,
 * detected format, and an HONEST estimated average bitrate derived from
 * bytes ÷ duration. Everything below is written for the specific queries people
 * type when they need to "check audio properties", "see sample rate", "find the
 * bitrate of an mp3" or "why won't this file import": nothing is shared with the
 * edit/convert copy, and no claim outruns what a pure Web Audio probe can do (it
 * is explicit that the bitrate is an estimate and that some container tags: ID3,
 * artist/title. Are not exposed by decodeAudioData).
 */
const audioMetadata: Tool = {
  slug: "audio-metadata",
  title: "Audio Metadata Viewer",
  category: "audio-tools",
  group: "Info",
  icon: "Info",
  accent: "rose",
  status: "live",
  featured: false,
  createdAt: "2026-06-19",

  description:
    "Inspect any audio file in your browser, exact duration, sample rate, channels, file size, format and an estimated bitrate, read on-device with the native Web Audio engine. Nothing is uploaded.",

  h1: "Audio Metadata Viewer. Check Audio Properties Online",
  tagline:
    "Drop an MP3, WAV, M4A, OGG or FLAC and instantly read its real duration, sample rate, channel layout, size, format and estimated bitrate: decoded on your device, never uploaded, with a waveform and preview player so you can see and hear exactly what you have.",
  longDescription:
    "The GigAI Audio Metadata Viewer answers the question you keep needing before you edit, convert or upload a clip: what actually is this file? Instead of guessing from a filename or opening a full audio editor, drop the file and the tool decodes it locally with the browser's native Web Audio engine and reports the exact duration measured from the decoded samples (so a mislabelled or variable-bitrate file still shows the truth), the sample rate in kHz, the channel layout (mono, stereo or more), the on-disk size, the MIME type the OS attached, the format detected from that type and the extension, and an estimated average bitrate computed from file bytes divided by duration. A waveform and a preview player sit alongside the numbers so you can confirm at a glance that the file is what you expect and isn't silent or truncated. This is the fastest way to check why a clip won't fit a platform's requirements, a podcast host wanting a specific sample rate, a game engine that only accepts mono, a form that rejects anything over a size cap: without uploading a private recording to a stranger's server to find out. Everything runs client-side, so there's no upload wait and no privacy tradeoff, and you can copy any value or the whole report to paste into a ticket, a spec sheet or a message. Be honest about the limits of a pure Web Audio probe: the bitrate is an ESTIMATE (average bytes over time, not the container's declared or per-frame value, and meaningless for uncompressed WAV where it simply reflects the raw PCM rate), and container-level tags like ID3 title/artist/album art aren't exposed by the decode API. This tool reports the audio's technical shape, not its embedded text metadata. Close the tab and nothing was ever stored.",

  ctaText: "Inspect audio",

  keywords: [
    "audio metadata viewer",
    "check audio properties",
    "audio file info",
    "see sample rate",
    "find audio bitrate",
    "mp3 bitrate checker",
    "audio duration checker",
    "check channels mono stereo",
    "audio format detector",
    "online audio inspector",
    "wav sample rate",
    "audio properties online",
  ],

  seo: {
    title: "Audio Metadata Viewer. Check Audio Properties Online | GigAI Tools",
    description:
      "Free online audio metadata viewer on the native Web Audio engine. Read exact duration, sample rate, channels, size, format and estimated bitrate for any MP3, WAV, M4A, OGG or FLAC: 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC"],
    output: ["Copy / text report"],
  },

  features: [
    {
      icon: "Timer",
      title: "Exact decoded duration",
      description:
        "The length is measured from the decoded audio samples, not read from a header, so a variable-bitrate or mislabelled file shows its true duration down to the millisecond, not the container's rough guess.",
    },
    {
      icon: "AudioWaveform",
      title: "Sample rate & channel layout",
      description:
        "See the precise sample rate in kHz and whether the file is mono, stereo or multichannel, the two facts platforms and game engines most often gate on before they'll accept an upload.",
    },
    {
      icon: "Gauge",
      title: "Estimated average bitrate",
      description:
        "Get a ballpark bitrate computed from file size over duration: useful for spotting a suspiciously low-quality MP3 at a glance. It's labelled clearly as an estimate, never dressed up as a container-reported value.",
    },
    {
      icon: "FileAudio",
      title: "Format, MIME type & size",
      description:
        "Read the detected format, the raw MIME type the OS attached, and the exact file size in a human-friendly and byte-precise form: everything you need to fill in a spec sheet or debug a rejected upload.",
    },
    {
      icon: "AudioLines",
      title: "Waveform & preview player",
      description:
        "A waveform and an in-page player sit next to the numbers so you can confirm the file isn't silent or truncated and actually sounds like what the metadata claims, a sanity check the raw figures can't give you.",
    },
    {
      icon: "Copy",
      title: "Copy any value or the whole report",
      description:
        "Copy a single field or the full metadata report as clean text to paste straight into a ticket, a delivery spec or a message. No retyping numbers by hand.",
    },
  ],

  benefits: [
    {
      title: "Know a file before you edit or convert it",
      description:
        "Checking sample rate, channels and duration first means you pick the right tool and settings straight away. No re-doing a conversion because the source wasn't what the filename suggested.",
    },
    {
      title: "Debug a rejected upload in seconds",
      description:
        "When a platform bounces a file for being the wrong rate, too many channels or over a size cap, this shows you exactly which property is off so you know precisely what to fix.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server-side inspectors make you upload the file first. Here the audio is decoded in your browser and never leaves the device, so it's safe to inspect private, confidential or unreleased recordings.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It's read and decoded entirely on your device. Nothing is uploaded.",
    },
    {
      title: "Read the metadata",
      description:
        "Instantly see the exact duration, sample rate, channel layout, file size, MIME type, detected format and estimated average bitrate laid out clearly.",
    },
    {
      title: "Confirm with the waveform & preview",
      description:
        "Glance at the waveform and play the file in the built-in player to make sure it isn't silent or truncated and matches what the numbers say.",
    },
    {
      title: "Copy what you need",
      description:
        "Copy any single value or the full report as text to drop into a spec, a ticket or a message, then reset and inspect the next file.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster",
      title: "Check a file meets host requirements",
      description:
        "Your host wants a specific sample rate and stereo layout. Confirm the export matches before uploading, instead of finding out after the platform rejects or re-encodes it.",
    },
    {
      audience: "Game / app developer",
      title: "Verify an asset is mono at the right rate",
      description:
        "An engine only accepts mono clips at a fixed sample rate. Drop each sound effect to confirm the channel count and rate before it goes into the build.",
    },
    {
      audience: "Content creator",
      title: "Spot a low-quality source before publishing",
      description:
        "An estimated bitrate that's far lower than expected flags a file that was already compressed hard: catch it now rather than after it's baked into your final video.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Inspect a sensitive recording locally",
      description:
        "A confidential voice note shouldn't be uploaded to a stranger's server just to read its properties. Decode it in your browser so nothing ever leaves the device.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. The file is read and decoded entirely in your browser using the native Web Audio engine (AudioContext / decodeAudioData). Nothing is uploaded, stored or logged, so it's completely safe to inspect personal, confidential or unreleased recordings. The waveform and preview player are generated on-device too. There is no server round-trip at any point.",
    },
    {
      question: "Why is the bitrate labelled an 'estimate'?",
      answer:
        "A pure Web Audio probe reads the decoded audio (duration, sample rate, channels) but doesn't parse the container's declared bitrate. So the bitrate shown here is computed as file bytes × 8 ÷ duration ÷ 1000: an honest average, not a container-reported or per-frame figure. For a constant-bitrate MP3 it will land very close to the real value. For variable-bitrate files it reflects the true average, and for uncompressed WAV it simply mirrors the raw PCM data rate rather than any 'compression quality'. Treat it as a reliable ballpark, not a spec-exact number.",
    },
    {
      question: "Why is the duration different from what my file browser shows?",
      answer:
        "This tool measures duration from the actual decoded samples, which is authoritative. Some file browsers and players estimate length from a header, and that estimate can be wrong for variable-bitrate MP3s, streamed downloads or files with damaged headers. If the two disagree, the decoded value shown here is the one that reflects how long the audio really plays.",
    },
    {
      question: "Can it show ID3 tags like title, artist and album art?",
      answer:
        "No, and it's important to be upfront about that. The Web Audio decode API exposes the audio's technical shape (duration, sample rate, channels) but not the container's text tags. Reading ID3v2 or Vorbis comments requires parsing the file bytes separately, which this tool doesn't do. It reports what the audio is, not the embedded metadata text or artwork.",
    },
    {
      question: "Which files can I inspect?",
      answer:
        "Anything your browser can decode, MP3, WAV, M4A/AAC, OGG and, on most modern browsers, FLAC. If a format isn't natively decodable in your browser you'll see a friendly message rather than metadata. In practice the common formats people carry around all work.",
    },
    {
      question: "Is there a file-size limit?",
      answer:
        "Because everything runs in your browser's memory, the practical ceiling is your device's RAM rather than a fixed upload cap. Songs, podcast episodes and voice memos are straightforward. A very long recording, a multi-hour interview, holds every decoded sample in memory and may briefly pause the tab while it decodes. For the very largest files that's the only thing to watch.",
    },
    {
      question: "Does inspecting a file change or re-encode it?",
      answer:
        "No. This is a read-only tool: it decodes the file to measure its properties and draw the waveform, but it never modifies, re-encodes or writes anything back. Your original file is untouched. The only thing you can take away is the copied text report.",
    },
    {
      question: "Can I copy the results to paste elsewhere?",
      answer:
        "Yes. You can copy any individual value or the entire metadata report as clean, formatted text: ready to paste into a support ticket, a delivery spec, a spreadsheet or a message without retyping anything by hand.",
    },
  ],

  tips: [
    "Inspect a file first when a platform keeps rejecting it, the property that's out of spec (rate, channels or size) is usually obvious at a glance.",
    "Treat the bitrate as an average: a value far below what you expected is a strong sign the source was already compressed hard.",
    "For WAV, ignore the bitrate 'quality' reading. It just reflects the raw PCM data rate, not any lossy compression setting.",
    "Trust the decoded duration over your file browser's number, especially for variable-bitrate MP3s where headers can lie.",
    "Play the preview before trusting the metadata: a file can report a valid duration while actually being silent or truncated.",
  ],

  troubleshooting: [
    {
      problem: "It says the file couldn't be decoded.",
      solution:
        "Your browser can't natively decode that particular format or the file is corrupt. Try it in a Chromium-based browser (which decodes the widest range), or first convert it to WAV or MP3 with the converter tools, then inspect the result.",
    },
    {
      problem: "The bitrate looks wrong or unusually high.",
      solution:
        "Remember it's an estimate from size ÷ duration. For uncompressed WAV it's naturally very high because the data is raw PCM. For compressed files a variable bitrate will show as an average, which can differ from the peak or the header's nominal value, that's expected.",
    },
    {
      problem: "No title, artist or cover art is shown.",
      solution:
        "This tool reads technical audio properties, not container text tags. ID3 and Vorbis comment metadata isn't exposed by the browser's decode API, so it isn't displayed here: that's a deliberate limit, not a bug.",
    },
  ],

  security:
    "Your audio is read and decoded entirely in your browser using the native Web Audio engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, and the file itself is never modified: this is a strictly read-only probe. The waveform and preview are generated on-device with no exotic codec download, so you can safely inspect personal, confidential or unreleased recordings. Close the tab and nothing about the file remains.",

  changelog: [
    {
      date: "2026-06-19",
      change:
        "Initial release: native Web Audio metadata probe reporting exact decoded duration, sample rate, channel layout, size, MIME type, detected format and an honest estimated average bitrate, with a waveform and preview player.",
    },
    {
      date: "2026-06-24",
      change:
        "Added copy-to-clipboard for individual values and a full text report, plus clearer honest labelling distinguishing the estimated bitrate from a container-reported value.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved the friendly undecodable-file message, refined format detection from MIME and extension, and added drag-and-drop with reset-and-inspect-again to the workspace.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "mp3-converter",
    "audio-normalizer",
    "wav-converter",
  ],
};

export default audioMetadata;
