import type { Tool } from "@/types";

/**
 * Audio Merger, combine several audio files into one continuous track, in the
 * browser. Drop a batch of clips, drag the rows to set the running order, then
 * join them end-to-end (or blend the seams with an optional crossfade) and
 * export a single lossless WAV or a compact MP3. Every clip is decoded with the
 * native Web Audio API on your device; nothing is uploaded. The copy below is
 * written for the exact searches people run, "join two mp3 files", "merge
 * audio online", "combine voice memos into one file", "stitch podcast segments"
 * - and shares no string with the trimmer, converter or any other tool. The
 * engine is honest about what merging means: sequential joins are lossless and
 * sample-accurate on the WAV path; a crossfade blends the overlap with linear
 * gain ramps; MP3 output re-encodes once (as any MP3 must).
 */
const audioMerger: Tool = {
  slug: "audio-merger",
  title: "Audio Merger",
  description:
    "Merge multiple audio files into one in your browser. Drop MP3, WAV, M4A or OGG clips, drag to set the order, add an optional crossfade to smooth the joins, then download a single lossless WAV or compact MP3. 100% private. Nothing is uploaded.",
  category: "audio-tools",
  group: "Edit",
  icon: "Combine",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "Audio Merger: Combine & Join MP3, WAV and M4A Files Online",
  tagline:
    "Drop a stack of clips, drag them into the order you want, and join them into one continuous track: with an optional crossfade to melt the seams. Preview the result, then download a lossless WAV or a compact MP3. Runs entirely in your browser. No clip is ever uploaded.",
  longDescription:
    "The GigAI Audio Merger stitches several separate recordings into a single file without a server in the loop. Drop in a batch of clips (voice memos, podcast segments, song sections, sound effects, chapter recordings) and each one is decoded locally with the browser's native Web Audio API, its length and channel layout read on the spot. The clips appear as a reorderable list: drag a row up or down, move it with the keyboard, or remove it, and the live running total updates so you always know how long the finished track will be. Join them end-to-end for a clean, gapless splice, or turn on a crossfade and each clip fades out as the next fades in over an overlap you choose, so the transitions breathe instead of clicking. Because the merge runs on your device, there's no upload bar and no queue, even a dozen clips join in a moment. When it sounds right, export a lossless 16-bit WAV (bit-for-bit on the sequential path, ideal for further editing in a DAW) or a compact MP3 for sharing and playback. WAV is written natively and the MP3 encoder is fetched only if you pick MP3, so a simple join never pulls a heavyweight download. Clips at different sample rates or channel counts are reconciled automatically. Mono is laid across both stereo sides so nothing goes silent on one channel, and the output takes the widest channel layout in the set. All of it is private by construction: the files are decoded, mixed and encoded in the tab, so confidential interviews, unreleased music and personal voice notes never leave your machine. No account, no watermark, no install, close the tab and every byte is gone.",

  ctaText: "Merge audio",

  keywords: [
    "audio merger",
    "merge audio online",
    "join audio files",
    "combine mp3",
    "join mp3 files",
    "merge mp3 online",
    "combine audio files",
    "merge wav files",
    "join m4a",
    "crossfade audio",
    "combine voice memos",
    "stitch podcast segments",
  ],

  seo: {
    title: "Audio Merger: Combine & Join MP3, WAV, M4A Files Online Free | GigAI Tools",
    description:
      "Free online audio merger. Drop MP3, WAV, M4A or OGG clips, drag to reorder, add an optional crossfade, then download one lossless WAV or compact MP3, combined 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: ["WAV", "MP3"],
  },

  features: [
    {
      icon: "ListOrdered",
      title: "Drag to set the running order",
      description:
        "Every clip you drop becomes a reorderable row. Drag one up or down, nudge it with the keyboard, or remove it: a live total shows exactly how long the merged track will run.",
    },
    {
      icon: "Combine",
      title: "Gapless joins or a smooth crossfade",
      description:
        "Splice the clips end-to-end for a clean, gapless join, or turn on a crossfade and each clip fades out as the next fades in over an overlap you choose. No clicks at the seams.",
    },
    {
      icon: "Waypoints",
      title: "Mismatched clips reconciled for you",
      description:
        "Mixing mono and stereo, or clips of different lengths? Mono is laid across both channels so nothing goes silent, and the output adopts the widest channel layout in the set.",
    },
    {
      icon: "PlayCircle",
      title: "Preview before you export",
      description:
        "Hear the full combined track on a waveform player first, so you catch an out-of-order clip or a jarring transition before you download. Not after.",
    },
    {
      icon: "FileAudio",
      title: "Lossless WAV or compact MP3",
      description:
        "Export a bit-perfect 16-bit WAV for further editing, or a small MP3 for sharing. WAV is native. The MP3 encoder loads only when you pick MP3, so a simple join stays lightweight.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, merging and encoding all happen in your browser. Voice notes, interview parts, unreleased tracks and personal clips are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "One file out of many, in seconds",
      description:
        "Combine a whole batch of clips into a single track without waiting on an upload or a queue. The join runs on your device the moment you press merge.",
    },
    {
      title: "Transitions that don't click",
      description:
        "A crossfade blends the tail of each clip into the head of the next with smooth gain ramps, so segment boundaries feel intentional instead of abrupt.",
    },
    {
      title: "Lossless when it matters",
      description:
        "The sequential WAV path is bit-for-bit accurate with no re-compression, so a merged file drops cleanly into a DAW, a podcast edit or another GigAI audio tool.",
    },
    {
      title: "Private by design",
      description:
        "Because nothing leaves the tab, you can safely combine sensitive material (a confidential interview split into parts, an unreleased demo) without trusting it to a server.",
    },
  ],

  howTo: [
    {
      title: "Drop your clips",
      description:
        "Drag several MP3, WAV, M4A, OGG or FLAC files onto the workspace, or click to browse and pick a batch. Each one decodes locally and appears as a row with its length.",
    },
    {
      title: "Set the order",
      description:
        "Drag the rows into the sequence you want, or move them with the keyboard. Remove any clip you don't need. The running total shows how long the merged track will be.",
    },
    {
      title: "Choose the join style",
      description:
        "Leave it gapless for a clean splice, or turn on the crossfade and pick an overlap length so each clip fades into the next. Then pick lossless WAV or compact MP3.",
    },
    {
      title: "Merge and preview",
      description:
        "Run the merge (it's near-instant since it's native Web Audio) then play the combined track on the waveform to confirm the order and the transitions.",
    },
    {
      title: "Download or start over",
      description:
        "Download the single merged file, or reset and rearrange the clips to try a different order or a different crossfade.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster / Creator",
      title: "Stitch segments into one episode",
      description:
        "Join an intro, the main recording, an ad read and an outro into a single continuous file, with a short crossfade at each seam so the joins feel produced, not spliced.",
    },
    {
      audience: "Musician / Producer",
      title: "Chain song sections or a mixtape",
      description:
        "Combine an intro, verse, chorus and outro into one track, or crossfade a set of songs into a seamless mix: then export a lossless WAV to keep working in your DAW.",
    },
    {
      audience: "Anyone with a phone",
      title: "Combine voice memos into one file",
      description:
        "Merge a handful of voice notes or dictation clips into a single recording to share or archive, without installing an app, drag them into order and download.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Assemble sensitive recordings locally",
      description:
        "Join the parts of a confidential interview or a legal statement entirely on your device, so the combined material is never uploaded to a stranger's server.",
    },
  ],

  faq: [
    {
      question: "Are my audio files uploaded to a server?",
      answer:
        "No. Every clip is decoded, merged and encoded entirely in your browser using the native Web Audio API: nothing leaves your device. There's no upload step, nothing is stored or logged, and it's safe for private voice notes, interview parts and unreleased music.",
    },
    {
      question: "How many files can I merge at once?",
      answer:
        "There's no fixed cap on the number of clips. You can add as many rows as you like. The practical limit is memory: in-browser merging holds every decoded clip plus the combined result in RAM, so a very large total may run slowly or fail on a low-RAM device. For huge batches, merge in a couple of passes.",
    },
    {
      question: "What's the difference between a gapless join and a crossfade?",
      answer:
        "A gapless join splices the clips end-to-end with no overlap: clean and sample-accurate. A crossfade overlaps the end of one clip with the start of the next, fading one down as the other comes up over a length you choose, so the transition is smooth. Use gapless for spoken segments and crossfade for music or to soften abrupt cuts.",
    },
    {
      question: "Can I merge clips with different sample rates or channel counts?",
      answer:
        "Yes. Mono clips are laid across both stereo sides so they stay centred rather than silent on one channel, and the output takes the widest channel layout in the batch. Clips are joined at the first clip's sample rate. For the most predictable result, use sources that already share a sample rate, or run them through the Audio Converter first.",
    },
    {
      question: "Will merging reduce the quality?",
      answer:
        "Not on the WAV path: a sequential join is a lossless copy of the original samples, and even a crossfade only touches the overlapping region. If you export MP3, the combined track is re-encoded once (as any MP3 export must be), so choose a higher bitrate for music. When you'll keep editing, export WAV to stay pristine.",
    },
    {
      question: "What formats can I merge, and what do I get back?",
      answer:
        "You can drop anything your browser can decode (MP3, WAV, M4A/AAC, OGG, FLAC, Opus and WebM audio) and mix formats freely in one batch. You export a single lossless 16-bit WAV (great for further editing) or a compact MP3 (great for sharing). WAV is written natively. The MP3 encoder loads only if you choose MP3.",
    },
    {
      question: "Does it work offline or on my phone?",
      answer:
        "Once the page has loaded, merging needs no network: the WAV path never downloads anything extra. It runs on modern mobile browsers too, though phones have less memory, so keep the batch smaller on mobile for the smoothest experience.",
    },
    {
      question: "Do I need to install anything or sign up?",
      answer:
        "No. There's no install, no plugin, no account and no watermark. Open the page, drop your clips, drag them into order, and download the merged file: the whole tool runs client-side.",
    },
  ],

  tips: [
    "Drag the rows to audition orders quickly, the running total updates live, so you can balance the length before you even merge.",
    "Use a short crossfade (around half a second to a second) to soften a hard cut between spoken segments. Use a longer one to blend music tracks into a mix.",
    "Export WAV when you'll keep editing, it's lossless, and MP3 only when you need a small file to share or upload.",
    "Match sample rates for the most predictable result: if one clip sounds pitched, convert it to the same rate as the others first, then merge.",
    "Merging a large batch and it slows down? Close other heavy tabs, in-browser audio is memory-bound, or combine the clips in two passes.",
  ],

  troubleshooting: [
    {
      problem: "One of the files won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively, most often a niche or DRM-protected file. Try a standard MP3, WAV, M4A or OGG. If it's exotic, convert it first with the Audio Converter, then add the result to the merge.",
    },
    {
      problem: "A crossfade sounds like it drops out or gets quiet in the middle.",
      solution:
        "The overlap is longer than one of the clips, so the fades run past its edges. Shorten the crossfade length, or make sure each clip is longer than the overlap you set, the tool caps the overlap to the shorter clip, but a very short clip leaves little to blend.",
    },
    {
      problem: "The merged track has silence or a pitch shift on some clips.",
      solution:
        "That usually means mismatched sample rates. Clips are joined at the first clip's rate, so a source recorded at a different rate can play back off-pitch. Convert the odd clips to a common sample rate first, then merge.",
    },
    {
      problem: "The tab is slow or ran out of memory on a big batch.",
      solution:
        "In-browser merging holds every decoded clip plus the result in RAM. Close other heavy tabs and retry. If it still struggles, merge the batch in two passes, or combine on a machine with more memory.",
    },
  ],

  security:
    "Your audio is decoded, merged and encoded entirely in your browser using the native Web Audio API. No clip is ever uploaded to any server. Nothing is stored, logged or transmitted, so you can safely combine confidential interview parts, voice notes and unreleased music. The sequential WAV path is a lossless, native operation and the MP3 encoder is loaded only if you choose MP3. There is no cloud copy and no upload step. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: drop a batch of clips, decode each natively, drag rows to set the order, splice them end-to-end losslessly, preview the combined track, and export a WAV with one-click download.",
    },
    {
      date: "2026-06-24",
      change:
        "Added an optional crossfade with a selectable overlap length (linear gain ramps at each seam), a live running-total duration, keyboard reordering, and compact MP3 export with a selectable bitrate (encoder lazy-loaded only when MP3 is chosen).",
    },
    {
      date: "2026-06-30",
      change:
        "Reconciled mismatched channel layouts (mono spread across stereo, widest layout wins), added a before/after size readout on the result, and improved honest guidance and memory handling for large batches.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-cutter",
    "audio-converter",
    "mp3-converter",
  ],
};

export default audioMerger;
