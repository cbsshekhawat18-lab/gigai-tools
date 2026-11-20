import type { Tool } from "@/types";

/**
 * Crop Image, an interactive cropper that overlays a draggable selection
 * rectangle on a live preview. Aspect presets (1:1, 4:5, 16:9, free) lock the
 * ratio while you frame the shot; the engine then cuts the chosen region out
 * at full resolution, entirely in the browser. All copy is unique to cropping.
 */
const cropImage: Tool = {
  slug: "crop-image",
  title: "Crop Image",
  notFor: [
    { text: "It does not scale the image - what you keep stays at original resolution.", toolSlug: "image-resizer" },
    { text: "It does not compress.", toolSlug: "image-compressor" },
  ],
  description:
    "Cut an image down to the exact part you want. Drag a crop box, snap to a ratio like 1:1 or 16:9, and export the trimmed area: free, private, in your browser.",
  category: "image-tools",
  icon: "Crop",
  accent: "amber",
  processor: "crop",
  status: "live",
  createdAt: "2026-07-02",

  h1: "Crop Images Online, Any Ratio",
  tagline:
    "Frame the shot with a draggable crop box, lock it to 1:1, 4:5 or 16:9, and cut out exactly the region you want. No upload, no watermark.",
  longDescription:
    "The GigAI Crop Image tool puts a live selection rectangle over your photo so you can trim away everything outside the frame. Drag the box to reposition it, pull the corner handles to resize, or nudge it a pixel at a time with the arrow keys. Snap to a ready-made aspect preset for square avatars, portrait posts and widescreen banners, or switch to Free to crop to any shape at all. When it looks right, the tool slices out just that region at full resolution and hands you a clean file to download. Everything runs on the HTML canvas inside your own tab, so the picture never leaves your device and the crop is instant even on large images.",

  ctaText: "Crop an image",

  keywords: [
    "crop image",
    "image cropper online",
    "crop photo",
    "crop to square",
    "aspect ratio crop",
    "crop picture free",
    "trim image edges",
    "16:9 crop tool",
    "profile picture crop",
  ],

  seo: {
    title: "Crop Image Online: Free Photo Cropper, Any Ratio | GigAI Tools",
    description:
      "Crop photos online free with a draggable box and 1:1, 4:5 and 16:9 presets. Trim edges, frame the subject, export full-resolution: private, no upload, no sign-up.",
  },

  features: [
    {
      icon: "Move",
      title: "Draggable crop box",
      description:
        "Grab the selection to slide it into place, then pull the corner handles to resize. A dark overlay dims everything you're about to trim away.",
    },
    {
      icon: "RectangleHorizontal",
      title: "Aspect-ratio presets",
      description:
        "Lock the frame to 1:1, 4:5 or 16:9 for avatars, portrait posts and banners, or pick Free to crop to any shape you like.",
    },
    {
      icon: "Keyboard",
      title: "Pixel-perfect with arrow keys",
      description:
        "Select a handle and nudge the crop one pixel at a time. Hold Shift to jump ten pixels for fast, precise framing without the mouse.",
    },
    {
      icon: "ScanEye",
      title: "Live selection readout",
      description:
        "See the exact crop width, height and position update as you drag, so you always know the final pixel dimensions before you export.",
    },
    {
      icon: "Maximize2",
      title: "Full-resolution output",
      description:
        "The crop is mapped back onto the original pixels, so a small on-screen box still exports at the source image's true resolution. No quality lost to preview scaling.",
    },
  ],

  benefits: [
    {
      title: "Nothing is uploaded",
      description:
        "Your image is decoded and cropped locally with the canvas API. It's never sent to a server, stored, or seen by anyone but you.",
    },
    {
      title: "Built for social sizes",
      description:
        "The presets match the ratios feeds actually use, so a portrait 4:5 post or a square profile photo fits perfectly the first time.",
    },
    {
      title: "Format stays intact",
      description:
        "Crop a PNG and keep its transparency. Crop a JPG and keep JPG. The tool exports in the source format so nothing else about the file changes.",
    },
    {
      title: "Fast and free, always",
      description:
        "There's no queue, no account and no daily cap. Crop one image or fifty in a row: each one is processed the instant you hit the button.",
    },
  ],

  howTo: [
    {
      title: "Load your image",
      description:
        "Drop a JPG, PNG or WebP onto the canvas, click to browse your files, or paste an image straight from the clipboard.",
    },
    {
      title: "Choose a ratio",
      description:
        "Pick a preset (1:1, 4:5 or 16:9) to lock the crop box to that shape, or leave it on Free to frame the region however you want.",
    },
    {
      title: "Position the box",
      description:
        "Drag the selection to move it and pull the handles to resize. Fine-tune with the arrow keys, watching the live width × height readout.",
    },
    {
      title: "Crop and download",
      description:
        "Hit Crop image to cut out the selection at full resolution, then download the result. Not quite right? Reframe and crop again in seconds.",
    },
  ],

  formats: {
    input: ["JPG", "JPEG", "PNG", "WebP", "GIF", "BMP"],
    output: ["PNG", "JPG", "WebP"],
  },

  faq: [
    {
      question: "Will cropping shrink my image's file size?",
      answer:
        "Usually yes, because you're keeping fewer pixels. Trimming away the outer region means less image data to store, so a tight crop of a large photo often lands noticeably smaller. If you also want to reduce quality-based weight, run the cropped file through the compressor afterwards.",
    },
    {
      question: "What do the aspect presets 1:1, 4:5 and 16:9 mean?",
      answer:
        "They fix the shape of the crop box. 1:1 is a perfect square (great for profile pictures and grid posts), 4:5 is the tall portrait shape feeds favour, and 16:9 is widescreen for banners, thumbnails and video-style covers. Free lets you drag the box to any proportions at all.",
    },
    {
      question: "Does cropping reduce the quality of the pixels I keep?",
      answer:
        "No. Cropping doesn't resample or re-scale the part you keep. It simply cuts that region out of the original at its native resolution. The pixels inside your selection are copied across untouched, so the kept area looks identical to the source.",
    },
    {
      question: "Can I crop to an exact pixel size?",
      answer:
        "You can get pixel-precise using the keyboard. Select the crop box or a handle and use the arrow keys to move or resize one pixel at a time, holding Shift to step in tens. The live readout shows the exact width and height so you can dial in the numbers you need.",
    },
    {
      question: "Is transparency preserved when I crop a PNG?",
      answer:
        "Yes. The tool exports in your source format, so cropping a transparent PNG produces another transparent PNG with the alpha channel intact. Cropping a JPG keeps it a JPG, since JPG has no transparency to preserve.",
    },
    {
      question: "Are my photos uploaded anywhere?",
      answer:
        "Never. The entire crop happens inside your browser tab on the HTML canvas. The image is read, trimmed and saved locally. Because nothing is sent to a server, there is nothing for us to store, log or share.",
    },
  ],

  relatedTools: [
    "image-resizer",
    "image-compressor",
    "png-to-jpg",
  ],
};

export default cropImage;
