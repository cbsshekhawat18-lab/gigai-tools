import type { Tool } from "@/types";

/**
 * Audio Cutter: the "remove the middle" companion to the Audio Trimmer. Where
 * the trimmer keeps a selected region and throws the rest away, the cutter does
 * the inverse: drag a selection over the waveform and it deletes that span, then
 * stitches the audio on either side back together into one seamless clip. This
 * is the tool people reach for to cut out a cough, a dead-air gap, an "um", a
 * whole verse, a phone-ring interruption or an ad break: without re-recording.
 * Everything is native Web Audio: the file is decoded, cut on exact frame
 * boundaries and re-joined in the tab, then exported as a lossless WAV or a
 * compact MP3. Nothing is uploaded, and no string here is shared with the
 * trimmer, the merger or any other tool.
 */
const audioCutter: Tool = {
  slug: "audio-cutter",
  title: "Audio Cutter",
  description:
    "Cut a section out of the middle of an audio file in your browser. Drop an MP3, WAV, M4A or OGG, drag a selection over the real waveform to mark the part to delete, and the audio before and after is joined into one seamless clip. Download a lossless WAV or compact MP3. Sample-accurate and 100% private. Nothing is uploaded.",
  category: "audio-tools",
  group: "Edit",
  icon: "Scissors",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Audio Cutter: Remove a Section from MP3, WAV or M4A Online",
  tagline:
    "Drop a track, drag a selection over the waveform, and cut that span straight out, the audio before and after snaps together into one clean clip. Delete a cough, a gap, an ad break or a whole verse, sample-accurate and entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Audio Cutter is built for one job the trimmer isn't: removing a chunk from the middle of a recording and closing the gap. Drop a file and it decodes with the browser's native Web Audio API, painting a crisp waveform of the whole track. Drag a selection region over the part you want gone (the flubbed line, the dead-air pause, the doorbell, the sponsor read, an entire section) and the cutter deletes exactly those samples and joins what's left on either side into a single continuous clip. Because you can see the audio, you place the cut where the sound actually is: on a breath, between words, at the edge of a beat, so the join lands cleanly instead of chopping mid-syllable. A live readout shows exactly what you're removing and how long the remaining audio will be, and you can preview the cut result, the before and after already stitched together, before you commit, so you catch a rough seam or a clipped word up front. When it sounds right, export a lossless 16-bit WAV (bit-for-bit accurate everywhere except the removed span, perfect for further editing) or a compact MP3 for sharing. The cut is sample-accurate (Web Audio splices on exact frame boundaries, not rounded seconds) and it all happens on your device: the file is decoded, cut, re-joined and encoded in the tab, so interviews, voice notes, lecture recordings and unreleased music never touch a server. WAV is written natively and the MP3 encoder loads only if you pick MP3, so a quick cut never pulls a heavyweight download. No upload wait, no account, no watermark, close the tab and every byte is gone.",

  ctaText: "Cut audio",

  keywords: [
    "audio cutter",
    "cut out section of audio",
    "remove part of mp3",
    "delete section from audio",
    "cut middle of audio",
    "remove silence from recording",
    "cut out a section mp3",
    "mp3 section remover",
    "erase part of audio online",
    "waveform audio cutter",
    "browser audio cutter",
    "cut audio online free",
    "remove ad break from podcast",
    "delete a clip from wav",
  ],

  seo: {
    title: "Audio Cutter, Remove a Section from MP3, WAV, M4A Online | GigAI Tools",
    description:
      "Free online audio cutter that removes a section from the middle of a file. Drop an MP3, WAV, M4A or OGG, drag a selection over the waveform to delete that span, and the rest is joined seamlessly. Download a lossless WAV or compact MP3. Sample-accurate, 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: ["WAV", "MP3"],
  },

  features: [
    {
      icon: "Scissors",
      title: "Delete a section and close the gap",
      description:
        "Drag a region over the part you want gone and the cutter removes exactly those samples, then joins the audio on either side into one continuous clip. No leftover silence where the cut was.",
    },
    {
      icon: "AudioWaveform",
      title: "Cut on a real waveform",
      description:
        "Your track is decoded natively and drawn as a crisp waveform, so you delete where the sound actually is (a cough, a pause, the edge of a word) instead of guessing at timestamps.",
    },
    {
      icon: "MousePointerClick",
      title: "Slide and fine-tune the cut",
      description:
        "Drag across the wave to mark the span, grab its body to slide it, or pull either edge to adjust. Focus it and nudge with the arrow keys to land the cut boundaries frame by frame.",
    },
    {
      icon: "PlayCircle",
      title: "Preview the joined result",
      description:
        "Hear the audio already stitched together (before plus after) before you export, so you catch a rough seam or a clipped word up front, not after downloading.",
    },
    {
      icon: "Crosshair",
      title: "Sample-accurate splice",
      description:
        "Web Audio cuts and re-joins on exact frame boundaries, not rounded seconds, so the removed span lands precisely and the join is clean, with no drift and no artifacts on the WAV path.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, cutting, joining and encoding all run in your browser. Interviews, voice notes, lecture recordings and unreleased tracks are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Fix a recording without re-recording it",
      description:
        "Cut out the mistake, the interruption or the dead air and keep everything else. A visible waveform means the join lands on the actual sound, so the take stays usable.",
    },
    {
      title: "Instant, with no upload wait",
      description:
        "The file is decoded locally the moment you drop it and the cut runs on-device, so there's no upload bar, no queue and no server round-trip, even for long recordings.",
    },
    {
      title: "Lossless everywhere you kept",
      description:
        "The WAV path re-encodes nothing that survives the cut, the audio on either side of the removed span is bit-for-bit identical to the source, ideal for a DAW or podcast edit.",
    },
    {
      title: "Private by design",
      description:
        "Because nothing leaves the tab, you can safely cut sensitive material (a confidential interview, a medical note, an unreleased demo) without trusting it to anyone.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It decodes locally in a moment and a waveform of the whole track appears with its length and channel layout.",
    },
    {
      title: "Select the part to remove",
      description:
        "Drag across the waveform to draw a selection over the span you want deleted. Slide it to reposition, pull an edge to resize, or focus it and use the arrow keys to nudge the boundaries frame by frame.",
    },
    {
      title: "Preview the join",
      description:
        "Press preview to hear the result with that span removed and the rest stitched together. Adjust the handles until the seam is clean and no word is clipped.",
    },
    {
      title: "Choose a format and cut",
      description:
        "Pick lossless WAV or compact MP3 (and an MP3 bitrate if you like), then run the cut, it's near-instant since it's native Web Audio, not a WASM re-encode.",
    },
    {
      title: "Download or start over",
      description:
        "Preview the finished clip, check the before/after size, and download it, or reset and remove a different span from the same file.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster / Editor",
      title: "Cut an ad break or a flub",
      description:
        "Remove a mid-episode sponsor read, a false start or a tangent that didn't land: drag over it on the waveform, join the rest, and export a WAV straight into your edit.",
    },
    {
      audience: "Student / Note-taker",
      title: "Trim dead air out of a lecture",
      description:
        "Delete the long silence while a slide loaded or the room settled, so the recording plays back tight without you re-listening through the gaps.",
    },
    {
      audience: "Musician / Producer",
      title: "Drop a bad bar out of a take",
      description:
        "Cut a muffed bar or a stray count-in out of an otherwise good take and splice the rest together, sample-accurate, then export a lossless WAV for your DAW.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Redact a section locally",
      description:
        "Remove a name, an address or a confidential aside from a recording entirely on your device, so the sensitive audio is never uploaded to a stranger's server to be edited out.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. Your file is decoded, cut, re-joined and encoded entirely in your browser using the native Web Audio API. It never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for private interviews, voice notes or unreleased music.",
    },
    {
      question: "How is this different from the Audio Trimmer?",
      answer:
        "The trimmer keeps the region you select and discards everything else, it's for grabbing a clip. The cutter is the opposite: it deletes the region you select and joins the audio before and after into one clip, so it's for removing something from the middle without losing the rest.",
    },
    {
      question: "How accurate is the cut, and is the join clean?",
      answer:
        "It's sample-accurate. Web Audio splices on exact frame boundaries rather than rounded seconds, so the removed span and the seam land precisely where you drag the handles. On the WAV path the surviving audio isn't re-encoded at all, so everything you kept is bit-for-bit identical to the source.",
    },
    {
      question: "What formats can I cut, and what do I get back?",
      answer:
        "You can drop anything your browser can decode: MP3, WAV, M4A/AAC, OGG, FLAC, Opus and WebM audio. You export either a lossless 16-bit WAV (great for further editing) or a compact MP3 (great for sharing). WAV is written natively. The MP3 encoder loads only if you choose MP3.",
    },
    {
      question: "Will cutting reduce the quality?",
      answer:
        "Not on the WAV path, the audio on both sides of the cut is a clean, lossless copy of the original samples. If you export MP3, the whole clip is re-encoded once (as any MP3 export must be), so pick a higher bitrate for music. When you plan to edit further, choose WAV to keep it pristine.",
    },
    {
      question: "Can I remove more than one section?",
      answer:
        "Each pass removes one selected span. To cut several places, remove the first section and download the result, then drop that file back in and cut the next, because every pass is lossless on the WAV path, chaining cuts doesn't degrade the audio.",
    },
    {
      question: "Is there a length or size limit?",
      answer:
        "There's no hard limit, but in-browser processing is memory-bound: very long or very large files hold the whole decoded track in memory, so on a low-RAM device a huge file may run slowly or fail. For big inputs, cut on the device with the most memory, or split the file into parts first.",
    },
    {
      question: "Does it work offline or on my phone?",
      answer:
        "Once the page has loaded, cutting needs no network, the WAV path never downloads anything extra. It runs on modern mobile browsers too. Phones have less memory, so stick to shorter recordings on mobile for the smoothest experience.",
    },
  ],

  tips: [
    "Place the cut on a breath or a gap between words so the join sounds natural: preview it a couple of times and nudge the handles a frame at a time until the seam disappears.",
    "Removing dead air? Drag the selection to cover the whole silence including its very start and end, so no faint tail is left behind after the join.",
    "Choose WAV when you'll keep editing or chain more cuts (it's lossless) and MP3 only when you need a small file to share.",
    "Drag the middle of the selection to slide the whole span without changing its length, handy for lining a fixed-length cut up with a passage.",
    "Need to remove several sections? Cut, download, re-drop and cut again: each WAV pass is lossless, so the audio doesn't degrade.",
  ],

  troubleshooting: [
    {
      problem: "The file won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively, most often a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG. If it's an exotic format, convert it first with the Audio Converter, then cut the result here.",
    },
    {
      problem: "The join has an audible click or pop at the seam.",
      solution:
        "A click usually means the cut landed mid-waveform where the level jumps. Nudge a handle a frame or two so both sides meet near a zero-crossing (a breath or gap between words is ideal) and preview again until the seam is clean.",
    },
    {
      problem: "My selection is empty or the cut button does nothing.",
      solution:
        "You need a region with length to remove, drag across the waveform so the start and end are apart. The live readout should show a non-zero 'removing' duration before you run.",
    },
    {
      problem: "The tab is slow or ran out of memory on a big file.",
      solution:
        "In-browser audio holds the whole decoded track in RAM. Close other heavy tabs and retry. If it still struggles, the file is likely too large for this device: split it into parts first, or cut on a machine with more memory.",
    },
  ],

  security:
    "Your audio is decoded, cut, re-joined and encoded entirely in your browser using the native Web Audio API. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely cut confidential interviews, voice notes and unreleased music. WAV export is a lossless, native operation and the MP3 encoder is only loaded if you choose MP3. There is no cloud copy and no upload step. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: drop-to-decode with a native Web Audio waveform, a draggable selection region to delete a span and join the rest sample-accurately, and lossless WAV export with one-click download.",
    },
    {
      date: "2026-06-24",
      change:
        "Added a preview of the joined result before export, compact MP3 export with a selectable bitrate (encoder lazy-loaded only when MP3 is chosen), and a live removing/remaining readout.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the seam handling and selection UX (slide-to-move, edge fine-tuning, keyboard nudging), added a before/after size comparison on the result, and improved memory guidance for large files.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-merger",
    "audio-converter",
    "audio-recorder",
  ],
};

export default audioCutter;
