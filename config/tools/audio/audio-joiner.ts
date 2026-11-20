import type { Tool } from "@/types";

/**
 * Audio Joiner, stitch several clips into one continuous track, in the browser.
 *
 * Where the trimmer takes one file apart, the joiner puts many together: drop a
 * handful of songs, voice notes, verses or sound effects, drag them into the
 * order you want, hear the whole sequence back-to-back, then export one seamless
 * WAV or MP3. It's framed for the real jobs people search for; "put two songs
 * together", "combine voice memos into one file", "join podcast segments",
 * "make one long mix", and every string is written fresh for joining, sharing
 * nothing with the trimmer, cutter or converter copy. The join itself is native
 * Web Audio (`process.merge`, an exact end-to-end concat, no gaps, no re-encode
 * on the WAV path); the MP3 encoder is the only lazy load, and nothing is ever
 * uploaded.
 */
const audioJoiner: Tool = {
  slug: "audio-joiner",
  title: "Audio Joiner",
  description:
    "Join audio clips into one track in your browser. Drop several MP3, WAV, M4A or OGG files, reorder them, hear the whole sequence play through, then download one seamless WAV or MP3. Gap-free, lossless on the WAV path, and 100% private. Nothing is uploaded.",
  category: "audio-tools",
  group: "Edit",
  icon: "Link",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-17",

  h1: "Audio Joiner, Combine & Merge MP3, WAV, M4A Clips Online",
  tagline:
    "Drop several clips, drag them into the order you want, and they play back as one continuous track. Preview the whole sequence, then download a single seamless WAV or a compact MP3, gap-free, entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Audio Joiner takes the tracks you drop (two songs, ten voice memos, a set of podcast segments, a run of sound effects) decodes each one natively with the browser's Web Audio API, and joins them end-to-end into a single continuous file. Add files in any order and drag them up or down the list to sequence them exactly how you want. A running total shows the combined length before you commit. Because each clip is decoded on your device, there's no upload bar and no queue, even a dozen files stitch together in a moment. Press preview and the whole joined track plays back as one, so you catch a clip that's out of order or a jarring transition before you export, not after. When the sequence is right, download a lossless 16-bit WAV, bit-for-bit faithful to your sources and perfect for further editing, or a compact MP3 for sharing, uploading or setting as one long track. Clips at different sample rates or channel counts are reconciled automatically so the output is a single clean file. The join is gap-free by construction: Web Audio concatenates on exact sample boundaries, so there's no silence inserted between clips and no drift. And all of it happens in the tab: unreleased music, personal recordings, confidential interviews and private notes are never uploaded, stored or logged. No account, no watermark, no install, close the tab and every byte is gone.",

  ctaText: "Join audio",

  keywords: [
    "audio joiner",
    "join audio online",
    "merge mp3",
    "combine mp3 files",
    "join mp3 online",
    "put two songs together",
    "join podcast segments",
    "concatenate audio",
    "audio combiner",
    "browser audio joiner",
    "stitch audio clips",
  ],

  seo: {
    title: "Audio Joiner, Combine & Merge MP3, WAV, M4A Online Free | GigAI Tools",
    description:
      "Free online audio joiner. Drop several MP3, WAV, M4A or OGG clips, drag them into order, preview the whole sequence, and download one seamless WAV or MP3: gap-free, lossless on the WAV path, and 100% in your browser. Nothing is uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC", "OPUS", "WebM"],
    output: ["WAV", "MP3"],
  },

  features: [
    {
      icon: "Link",
      title: "Join clips end-to-end, gap-free",
      description:
        "Drop several files and they concatenate on exact sample boundaries. No silence inserted, no drift between clips, just one continuous track that flows straight from one into the next.",
    },
    {
      icon: "ListOrdered",
      title: "Reorder by dragging",
      description:
        "Add files in any order, then move each one up or down the list until the sequence is exactly right. A running total shows the combined length as you go.",
    },
    {
      icon: "PlayCircle",
      title: "Preview the whole sequence",
      description:
        "Hear the joined track play through as one before you export, so you catch a clip that's out of order or an abrupt transition while it's still easy to fix.",
    },
    {
      icon: "Blend",
      title: "Mixed formats reconciled automatically",
      description:
        "Clips at different sample rates or channel counts are decoded and combined into one clean output, join an MP3 to a WAV to a voice memo without worrying about the details.",
    },
    {
      icon: "FileAudio",
      title: "Lossless WAV or compact MP3",
      description:
        "Export a bit-perfect 16-bit WAV for further editing, or a small MP3 for sharing and uploading. WAV is written natively. The MP3 encoder loads only when you pick MP3.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Every clip is decoded, joined and encoded in your browser. Unreleased tracks, personal recordings and confidential interviews are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "One file out of many, in seconds",
      description:
        "Instead of chaining exports through a DAW, drop your clips, order them and download a single track. The whole join runs on-device with no upload wait and no queue.",
    },
    {
      title: "No gaps, no guesswork",
      description:
        "The concatenation is sample-exact, so clips butt together cleanly with no inserted silence and no timing drift, the join sounds like one recording, not a patchwork.",
    },
    {
      title: "Lossless when you need it",
      description:
        "The WAV path re-compresses nothing, so a joined track stays bit-for-bit faithful to your sources: ideal for dropping into a podcast edit, a DAW or another GigAI audio tool.",
    },
    {
      title: "Private by design",
      description:
        "Because nothing leaves the tab, you can combine sensitive material (a set of confidential notes, an unreleased demo, personal voice memos) without trusting it to a server.",
    },
  ],

  howTo: [
    {
      title: "Drop your clips",
      description:
        "Drag several MP3, WAV, M4A, OGG or FLAC files onto the workspace, or click to browse and multi-select. Each decodes locally in a moment and joins the list with its name and length.",
    },
    {
      title: "Put them in order",
      description:
        "Move each clip up or down the list until the sequence is exactly how you want it. Add more files at any time, or remove one you don't need, the combined length updates live.",
    },
    {
      title: "Preview the joined track",
      description:
        "Press preview to hear all the clips play through as a single continuous track, checking the order and the transitions before you export.",
    },
    {
      title: "Choose a format and join",
      description:
        "Pick lossless WAV or compact MP3 (and an MP3 bitrate if you like), then run the join: it's near-instant since it's native Web Audio, not a WASM re-encode.",
    },
    {
      title: "Download or start over",
      description:
        "Preview the finished file, check its size, and download it, or reset and build a different sequence from a new set of clips.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster / Editor",
      title: "Stitch segments into one episode",
      description:
        "Join an intro, the main recording, an ad read and an outro into a single continuous file, gap-free and lossless, ready to drop into your publishing tool.",
    },
    {
      audience: "Musician / DJ",
      title: "Chain tracks into one long mix",
      description:
        "Put two songs together back-to-back, or line up a run of tracks into a single continuous file for a set, a demo reel or an uninterrupted upload.",
    },
    {
      audience: "Anyone with a phone",
      title: "Combine voice memos into one file",
      description:
        "Merge a series of voice notes (a lecture recorded in parts, a set of reminders, a story told in pieces) into one file you can send or archive in a single share.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Assemble sensitive audio locally",
      description:
        "Combine confidential recordings, legal notes or unreleased demos entirely on your device, so nothing is ever uploaded to a stranger's server to be joined.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. Every clip is decoded, joined and encoded entirely in your browser using the native Web Audio API, nothing leaves your device. There's no upload step, nothing is stored or logged, and it's safe for private voice notes, interviews and unreleased music.",
    },
    {
      question: "Are there gaps of silence between the clips?",
      answer:
        "No. The join concatenates on exact sample boundaries, so each clip butts straight up against the next with no inserted silence and no timing drift. If a clip has silence at its own start or end, that's part of the file: trim it first with the Audio Trimmer if you want an even tighter join.",
    },
    {
      question: "Can I join files that are different formats or sample rates?",
      answer:
        "Yes. You can mix MP3, WAV, M4A, OGG, FLAC and more in one join. Each clip is decoded natively and the tool reconciles differing sample rates and channel counts into a single clean output, so you don't have to convert everything to match first.",
    },
    {
      question: "What do I get back, and is it lossless?",
      answer:
        "You export either a lossless 16-bit WAV or a compact MP3. The WAV path re-compresses nothing, so the joined track stays bit-for-bit faithful to your sources. MP3 is re-encoded once (as any MP3 export must be), so choose WAV when you plan to edit further and MP3 when you need a small, shareable file.",
    },
    {
      question: "How do I control the order of the clips?",
      answer:
        "Add files in any order, then move each one up or down the list until the sequence matches what you want. A running total of the combined length updates as you reorder, add or remove clips, and the preview plays them back in exactly that order.",
    },
    {
      question: "How many files can I join, and is there a size limit?",
      answer:
        "There's no hard limit, but in-browser joining is memory-bound: every clip is held decoded in memory and the combined track is built there too, so a very large batch on a low-RAM device may run slowly or fail. For big jobs, join in a few smaller passes, or work on the machine with the most memory.",
    },
    {
      question: "Does it work offline or on my phone?",
      answer:
        "Once the page has loaded, joining needs no network: the WAV path never downloads anything extra. It runs on modern mobile browsers too. Phones have less memory, so keep the batch smaller on mobile for the smoothest experience.",
    },
    {
      question: "Do I need to install anything or sign up?",
      answer:
        "No. There's no install, no plugin, no account and no watermark. Open the page, drop your clips, order them, and download. The whole joiner runs client-side.",
    },
  ],

  tips: [
    "Preview the whole sequence before exporting: it's the fastest way to catch a clip that landed out of order or a transition that jars.",
    "Choose WAV when you'll keep editing the joined track (it's lossless) and MP3 only when you need a small file to share or upload.",
    "Want tighter transitions? Trim the silence off the start and end of each clip with the Audio Trimmer first, then join the clean pieces here.",
    "Joining lots of clips? Reconciling everything to one sample rate is automatic, but a set that's already the same rate joins fastest.",
    "Big batch running slow? Close other heavy tabs (in-browser audio is memory-bound) or join in two or three smaller passes.",
  ],

  troubleshooting: [
    {
      problem: "One of the files won't load or shows a decode error.",
      solution:
        "The browser couldn't decode that codec natively, usually a niche or DRM-protected file. Swap in a standard MP3, WAV, M4A or OGG, or convert the odd one out with the Audio Converter first, then add the result to the join.",
    },
    {
      problem: "The clips joined in the wrong order.",
      solution:
        "Order is set by the list, not by when you dropped the files. Drag or move each clip up or down until the list reads top-to-bottom in the sequence you want, then preview to confirm before exporting.",
    },
    {
      problem: "The tab is slow or ran out of memory with lots of files.",
      solution:
        "In-browser joining holds every clip and the combined track in RAM. Close other heavy tabs and retry. If it still struggles, join in a few smaller passes, or work on a device with more memory.",
    },
    {
      problem: "The exported MP3 sounds slightly softer than the sources.",
      solution:
        "MP3 is lossy, so a single re-encode is unavoidable on that path. Raise the MP3 bitrate for music, or export WAV instead to keep the joined track bit-for-bit identical to your originals.",
    },
  ],

  security:
    "Every clip is decoded, joined and encoded entirely in your browser using the native Web Audio API: nothing is ever uploaded to any server. No file is stored, logged or transmitted, so you can safely combine confidential interviews, personal voice notes and unreleased music. WAV export is a lossless, native operation and the MP3 encoder is only loaded if you choose MP3. There is no cloud copy and no upload step. Close the tab and every byte is gone.",

  changelog: [
    {
      date: "2026-06-17",
      change:
        "Initial release. Drop multiple clips, decode each natively, join them end-to-end with a native Web Audio concat, and export a lossless WAV with one-click download.",
    },
    {
      date: "2026-06-24",
      change:
        "Added drag-to-reorder of the clip list with a live combined-length total, full-sequence preview, and compact MP3 export with a selectable bitrate (encoder lazy-loaded only when MP3 is chosen).",
    },
    {
      date: "2026-06-30",
      change:
        "Automatic reconciliation of mixed sample rates and channel counts, a before/after size readout on the result, and improved honest guidance and memory handling for large batches.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-cutter",
    "audio-converter",
    "mp3-converter",
  ],
};

export default audioJoiner;
