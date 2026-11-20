import type { Tool } from "@/types";

/**
 * Audio Waveform Generator, the "Info" flagship of the GigAI Audio Toolkit and
 * the showcase for turning sound into a picture. Drop a clip, tune the look
 * (color, background, bar style, gap, size, orientation) and the tool renders a
 * crisp waveform straight from the decoded samples, then hands back a
 * pixel-perfect PNG or an infinitely scalable SVG, both generated entirely
 * on-device. Every string below is written for the specific things people
 * actually search when they want a "waveform image", "audio soundwave picture",
 * "podcast cover waveform" or "SVG of a song". Nothing is shared with the
 * trimmer/converter copy, and no claim outruns what a pure peak-extraction
 * renderer does (it draws the amplitude envelope; it is not a spectrogram and
 * doesn't show frequency).
 */
const audioWaveform: Tool = {
  slug: "audio-waveform",
  title: "Audio Waveform Generator",
  category: "audio-tools",
  group: "Info",
  icon: "AudioWaveform",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  description:
    "Generate a waveform image from any audio in your browser. Pick colors, bar style and size, then download a transparent PNG or a scalable SVG. Your file is decoded on-device and never uploaded.",

  h1: "Audio Waveform Generator, Turn Sound Into a PNG or SVG",
  tagline:
    "Drop a track and watch it become a clean, customizable soundwave. Choose the color, background, bar shape, spacing and canvas size, preview it live, then export a crisp transparent PNG or an infinitely scalable SVG, all rendered from the real samples in your browser, never uploaded.",
  longDescription:
    "The GigAI Audio Waveform Generator reads the actual samples of your audio and draws its amplitude envelope as a shareable graphic: the wavy soundwave you see on podcast players, music teasers, voice-message bubbles and album art. It runs entirely on the native Web Audio engine your browser already ships with, so the file is decoded and measured on your device and the picture is composed locally: nothing is uploaded, nothing is stored. Drop an MP3, WAV, M4A, OGG or FLAC and the tool reduces it to a compact per-bucket peak envelope, then paints it to your spec: set the bar color (or feed it your brand hex), a solid or fully transparent background, mirrored bars or a filled shape, the gap between bars, the resolution (how many bars), and the exact output size and orientation. A live preview updates as you tweak, so you dial in the look before you ever export. When it's right, download a PNG at your chosen pixel dimensions (with a genuinely transparent background if you picked one, ready to drop onto any color) or an SVG that stays razor-sharp at any scale, perfect for a hero banner, a Figma layer, or a print piece. Because everything is client-side there's no upload wait and no privacy tradeoff: unreleased songs, private voice notes and confidential recordings never leave your machine. Be honest about what this is: it's an amplitude-envelope renderer, not a spectrogram. It shows how loud the audio is over time, not which frequencies are present, and it never plays back or alters your original audio in any way. Close the tab and every sample, and the image, is gone.",

  ctaText: "Generate waveform",

  keywords: [
    "audio waveform generator",
    "waveform image",
    "soundwave image",
    "audio to png",
    "audio to svg",
    "waveform svg",
    "waveform png",
    "make waveform picture",
    "soundwave art",
    "podcast waveform image",
    "song waveform",
    "transparent waveform png",
  ],

  seo: {
    title: "Audio Waveform Generator: Make a Waveform PNG or SVG | GigAI Tools",
    description:
      "Free online audio waveform generator on the native Web Audio engine. Turn any MP3, WAV or M4A into a customizable soundwave graphic. Pick colors, bar style and size, then export a transparent PNG or scalable SVG. 100% in your browser, nothing uploaded.",
  },

  formats: {
    input: ["MP3", "WAV", "M4A", "AAC", "OGG", "FLAC"],
    output: ["PNG", "SVG"],
  },

  features: [
    {
      icon: "Palette",
      title: "Your colors, your brand",
      description:
        "Set the waveform color from a swatch or paste an exact brand hex, choose a solid backdrop or a fully transparent one, and the preview updates instantly. Match a channel's palette or a slide deck in seconds.",
    },
    {
      icon: "AudioWaveform",
      title: "Mirrored bars or a filled shape",
      description:
        "Render classic centred bars for that music-player look, or a continuous filled envelope for something bolder. Tune the gap between bars from tight to airy to get exactly the density you want.",
    },
    {
      icon: "Ruler",
      title: "Exact size and resolution",
      description:
        "Pick the output width and height in pixels, portrait or landscape, and how many bars to draw. Low bar counts read as chunky and graphic. High counts capture fine detail. You control the trade-off.",
    },
    {
      icon: "ImageDown",
      title: "Transparent PNG export",
      description:
        "Download a raster PNG at your chosen dimensions with a genuinely transparent background when you pick one: ready to drop straight onto any color, video frame or thumbnail without a white box.",
    },
    {
      icon: "Shapes",
      title: "Infinitely scalable SVG",
      description:
        "Export the waveform as clean SVG vector paths that stay razor-sharp at any size, ideal for hero banners, Figma layers, print, or recoloring later in a design tool. No pixelation, ever.",
    },
    {
      icon: "ShieldCheck",
      title: "100% private, nothing uploaded",
      description:
        "Decoding, measuring and drawing all happen on your device with the native Web Audio engine. Unreleased tracks, voice notes and confidential recordings are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "A shareable soundwave in seconds",
      description:
        "Skip the DAW screenshot and the design app. Drop a clip, tweak the color and size, and download a clean waveform graphic ready for a post, a cover or a teaser. No editing skills required.",
    },
    {
      title: "Assets that match your design system",
      description:
        "Exact hex colors, transparent backgrounds and vector SVG mean the waveform slots straight into your brand, recolor it, scale it, or layer it over anything without a mismatched white box.",
    },
    {
      title: "No upload wait, no privacy tradeoff",
      description:
        "Server tools make you upload the audio first and trust them with it. Here the file never leaves your browser, so there's no upload bar and nothing to trust: safe for unreleased or confidential material.",
    },
    {
      title: "Pixel-perfect PNG or crisp vector SVG",
      description:
        "Need a fixed-size thumbnail? Export a PNG at exact dimensions. Need it to scale to a billboard? Export SVG. One tool covers both without re-rendering somewhere else.",
    },
  ],

  howTo: [
    {
      title: "Drop your audio",
      description:
        "Drag an MP3, WAV, M4A, OGG or FLAC onto the workspace, or click to browse. It's decoded locally and reduced to a peak envelope, you'll see the waveform appear immediately.",
    },
    {
      title: "Style the waveform",
      description:
        "Pick the bar color and background (including transparent), choose mirrored bars or a filled shape, set the gap between bars, and the resolution, how many bars to draw across the width.",
    },
    {
      title: "Set the output size",
      description:
        "Choose the width and height in pixels and the orientation. The live preview reflects the exact aspect ratio you'll download so there are no surprises.",
    },
    {
      title: "Download PNG or SVG",
      description:
        "Export a raster PNG at your chosen dimensions, or a scalable SVG for design work, both generated on-device. Tweak and re-export as many times as you like, or reset for a new file.",
    },
  ],

  useCases: [
    {
      audience: "Podcaster",
      title: "Waveform for an audiogram or cover",
      description:
        "Turn an episode clip into a branded soundwave graphic for the show cover, a social audiogram still, or a website hero: in your channel's exact colors, exported transparent to sit on any background.",
    },
    {
      audience: "Musician / Producer",
      title: "Teaser art for a new single",
      description:
        "Generate a striking waveform of a hook or drop as promo art for a release post. Export SVG so it scales from a story to a banner without ever going blurry.",
    },
    {
      audience: "Designer",
      title: "A vector soundwave for a layout",
      description:
        "Drop an audio asset and pull a clean SVG waveform straight into Figma or Illustrator as an editable layer, recolor, scale and mask it into a composition without hunting for stock art.",
    },
    {
      audience: "Privacy-conscious user",
      title: "Visualise a private recording locally",
      description:
        "Make a waveform image of a personal voice note or a confidential interview without uploading it anywhere: everything is decoded and drawn in your browser and nothing is retained.",
    },
  ],

  faq: [
    {
      question: "Is my audio uploaded to a server?",
      answer:
        "No. All decoding, measuring and drawing happen locally in your browser using the native Web Audio engine (AudioContext). Your file never leaves your device. There's no upload step, nothing is stored or logged, and it's safe for personal, confidential or unreleased audio. The PNG and SVG are composed on-device too, so even the export reaches out to no server. Close the tab and both the audio and the generated image are gone.",
    },
    {
      question: "What's the difference between exporting PNG and SVG?",
      answer:
        "PNG is a raster image, a fixed grid of pixels at the exact width and height you choose, ideal when you need a specific size (a thumbnail, a video frame, a social still) and want a genuinely transparent background you can drop onto any color. SVG is a vector. It stores the waveform as mathematical paths, so it stays perfectly crisp at any scale, from a favicon to a billboard, and can be recolored or edited later in a design tool. Use PNG for a ready-to-place image at a set size. Use SVG when you need it to scale or stay editable.",
    },
    {
      question: "Is this a spectrogram? Does it show frequency?",
      answer:
        "No, and it's important to be clear. This tool draws an amplitude waveform: the height of each bar reflects how loud the audio is at that moment in time. It does not analyze or display frequency content, so it's not a spectrogram or an FFT plot. If you need to see which pitches or frequencies are present, you'd want a dedicated spectrogram tool. If you want the familiar soundwave shape for design and sharing, this is exactly it.",
    },
    {
      question: "Can I use my exact brand color and a transparent background?",
      answer:
        "Yes. You can paste any hex color for the waveform bars, and you can set the background to a solid color or to fully transparent. When you choose transparent and export a PNG, the background is genuinely see-through (no white box) so the waveform drops cleanly onto any color, photo or video. The SVG export similarly omits a background rectangle when you pick transparent, leaving just the waveform paths.",
    },
    {
      question: "How many bars should I use, and does size matter?",
      answer:
        "The bar count controls detail: a low count (say 60–120) gives a chunky, graphic look that reads well at small sizes and on covers. A high count (400+) captures fine dynamics and suits wide banners. Output width and height set the final canvas: for PNG they're literal pixels, for SVG they define the aspect ratio and the coordinate space (it'll still scale infinitely). If bars look too crammed, lower the count or widen the canvas. If it looks too sparse, do the reverse.",
    },
    {
      question: "Which audio formats can I use as input?",
      answer:
        "Anything your browser can decode, MP3, WAV, M4A/AAC, OGG and, on most browsers, FLAC. The tool only reads the samples to measure the envelope. It never plays back, converts or alters your original file. If a rare or DRM-protected file won't decode, the browser will report it and you can convert it to WAV or MP3 first with our converter tools.",
    },
    {
      question: "How long a clip can I turn into a waveform?",
      answer:
        "Because everything runs in your browser's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. Songs, episodes and voice memos up to many minutes run comfortably on a typical laptop. Very long recordings hold every sample in memory while the envelope is measured and can briefly pause the tab. For the longest files, trim down first or use a lower bar count to keep everything responsive. The output image size has no effect on how long the audio can be.",
    },
    {
      question: "Does generating a waveform change my audio file?",
      answer:
        "Never. The tool only reads your audio to measure its loudness envelope and draw a picture. It produces a separate PNG or SVG and leaves your original file completely untouched. There's no re-encode, no quality loss, and nothing written back to the source. The only thing you download is the image.",
    },
  ],

  tips: [
    "Paste your exact brand hex for the bars and set the background to transparent, you'll get a PNG that drops onto any color, photo or video with no white box.",
    "For covers and small thumbnails, use a lower bar count (around 80–120) so the shape stays bold and legible instead of turning into a dense smear.",
    "Export SVG whenever you'll scale or recolor later. It stays razor-sharp at any size and opens as editable paths in Figma or Illustrator.",
    "Widen the canvas rather than cranking the bar count if bars look crammed. A wider image at the same count reads cleaner than a narrow, overcrowded one.",
    "The mirrored-bars style suits music players and audiograms. The filled shape reads bolder on large hero art. Try both in the live preview before exporting.",
  ],

  troubleshooting: [
    {
      problem: "The waveform looks flat or nearly empty.",
      solution:
        "The source is probably very quiet or near-silent, so its peaks barely reach the top of the canvas. That's an accurate picture of a low-level recording. If you want a fuller shape for design purposes, normalise the audio first with our Audio Normalizer, then generate the waveform from the louder version.",
    },
    {
      problem: "The bars look crammed together or blurry in the PNG.",
      solution:
        "Too many bars for the width, or a small export size. Lower the bar count, increase the gap, or widen the output. For a graphic that must stay crisp at any size, export SVG instead of PNG: vectors never pixelate.",
    },
    {
      problem: "The PNG has a white background instead of transparent.",
      solution:
        "The background is set to a solid color. Switch the background option to Transparent and re-export the PNG: the backdrop will be genuinely see-through. Note that JPEG can't hold transparency, which is why this tool exports PNG (raster) and SVG (vector) only.",
    },
    {
      problem: "My file won't load.",
      solution:
        "The browser couldn't decode that format. It may be a rare codec or a DRM-protected file. Convert it to WAV or MP3 first using our converter tools, then drop the converted file here to generate the waveform.",
    },
  ],

  security:
    "Your audio is decoded, measured and drawn entirely in your browser using the native Web Audio engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely visualise personal, confidential or unreleased recordings. The PNG and SVG are composed on-device with no exotic codec download and no cloud copy. The tool only reads your file to measure its envelope and never alters or plays it. Close the tab and every sample, and the generated image, is gone.",

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: native Web Audio peak extraction with a live-preview waveform, customizable bar color, background, gap and resolution, and one-click transparent PNG export at a chosen size.",
    },
    {
      date: "2026-06-24",
      change:
        "Added scalable SVG export (vector paths, optional transparent background), a filled-shape style alongside mirrored bars, and portrait/landscape orientation with exact width/height controls.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved the transparent-PNG compositing, added a brand-hex color input with swatches, and refined drag-and-drop plus reset-and-retry in the workspace.",
    },
  ],

  relatedTools: [
    "audio-trimmer",
    "audio-normalizer",
    "mp3-converter",
    "audio-recorder",
  ],
};

export default audioWaveform;
