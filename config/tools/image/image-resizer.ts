import type { Tool } from "@/types";

/**
 * Image Resizer, resize to exact pixel dimensions with an optional
 * aspect-ratio lock, plus one-click social presets. Copy is unique to resizing
 * and honest: pixels are resampled with the high-quality canvas smoothing path,
 * entirely in the browser, so nothing is uploaded.
 */
const imageResizer: Tool = {
  slug: "image-resizer",
  title: "Image Resizer",
  notFor: [
    { text: "It does not reduce file size at the same dimensions - resizing smaller shrinks bytes as a side effect, but for same-size compression use the compressor.", toolSlug: "image-compressor" },
    { text: "It does not crop - the whole frame is kept, scaled.", toolSlug: "crop-image" },
  ],
  description:
    "Resize any image to exact pixel dimensions with an optional aspect-ratio lock and ready-made social presets, free and fully in your browser.",
  category: "image-tools",
  icon: "Scaling",
  accent: "emerald",
  processor: "resize",
  status: "live",
  featured: true,
  createdAt: "2026-07-02",

  h1: "Resize Images Online, Exact Pixels or %",
  tagline:
    "Set the exact width and height you need, keep the proportions locked, or snap to a social-media preset: with a clean high-quality resample and a live before/after view.",
  longDescription:
    "The GigAI Image Resizer scales your photos and graphics to any dimension you type, using the browser's high-quality canvas resampler for smooth, artefact-free results. Lock the aspect ratio to avoid stretching, or unlock it to force an exact frame. One-click presets cover the sizes that actually matter: Instagram square and story, a Facebook cover, an X/Twitter header, a YouTube thumbnail and a 1080p desktop wallpaper, so you never have to memorise pixel counts again. Everything runs locally in your tab: your image is never uploaded, and the result panel shows the original and new dimensions along with the exact scale factor applied.",

  ctaText: "Resize an image",

  keywords: [
    "image resizer",
    "resize image",
    "resize photo online",
    "change image dimensions",
    "resize image to exact pixels",
    "image size for instagram",
    "youtube thumbnail size",
    "scale image online",
  ],

  seo: {
    title: "Image Resizer, Resize Photos to Exact Pixels Free | GigAI Tools",
    description:
      "Resize images online to exact width and height, lock the aspect ratio, or use Instagram, YouTube and Facebook presets. Private, no upload, no sign-up, free.",
  },

  features: [
    {
      icon: "Ruler",
      title: "Exact width & height",
      description:
        "Type the precise pixel dimensions you need. The resizer renders to that size on the spot. No rounding surprises, no guesswork.",
    },
    {
      icon: "Link2",
      title: "Aspect-ratio lock",
      description:
        "Keep the lock on and one field updates the other automatically, so your image scales in proportion and never looks squashed.",
    },
    {
      icon: "LayoutGrid",
      title: "Social-media presets",
      description:
        "Snap to an Instagram post, story, Facebook cover, X header, YouTube thumbnail or 1080p wallpaper with a single click.",
    },
    {
      icon: "Wand2",
      title: "High-quality resample",
      description:
        "Both enlarging and shrinking use the canvas's high-quality smoothing, keeping edges clean and colors smooth at the new size.",
    },
    {
      icon: "ArrowLeftRight",
      title: "Scale factor readout",
      description:
        "The result panel spells out the old and new dimensions and the exact percentage you scaled by, so you know what happened.",
    },
  ],

  benefits: [
    {
      title: "Fit any platform's spec",
      description:
        "Upload requirements differ everywhere, profile photos, banners, marketplace listings. Dial in the exact size a form demands and pass validation the first time.",
    },
    {
      title: "No stretching, no distortion",
      description:
        "The aspect lock does the maths for you, so portraits stay portraits and logos keep their shape instead of warping to fill a box.",
    },
    {
      title: "Private and instant",
      description:
        "Resizing happens in your browser with the canvas API. Your file is never sent anywhere, and even large images render in a moment.",
    },
    {
      title: "Nothing to install",
      description:
        "It's a web page that works the same on a phone, tablet or laptop. No app, no plugin and no account to create first.",
    },
  ],

  howTo: [
    {
      title: "Drop in your image",
      description:
        "Drag a JPG, PNG or WebP onto the workspace, click to browse your files, or paste one directly from the clipboard.",
    },
    {
      title: "Choose a size",
      description:
        "Type an exact width and height, or click a social preset. Leave the aspect-ratio lock on to keep proportions intact.",
    },
    {
      title: "Resize",
      description:
        "Press Resize to resample the image locally. The before/after view shows the original and new dimensions side by side.",
    },
    {
      title: "Download",
      description:
        "Save the resized image straight to your device. Need another size? Change the numbers and resize again, it's instant.",
    },
  ],

  formats: {
    input: ["JPG", "JPEG", "PNG", "WebP", "GIF", "BMP"],
    output: ["PNG", "JPG", "WebP"],
  },

  faq: [
    {
      question: "Will resizing make my image blurry?",
      answer:
        "Shrinking an image almost always looks crisp, because you're throwing pixels away, not inventing them. Enlarging is harder: the resizer uses high-quality smoothing to keep the result clean, but no resampler can add detail that was never captured, so a large upscale will look softer. For gentler 2× or 4× enlargements our upscaler is a better fit.",
    },
    {
      question: "What does the aspect-ratio lock actually do?",
      answer:
        "With the lock on, the width and height stay tied to the image's original proportions: change one and the other follows automatically. That prevents the stretched or squashed look you get when the ratio is wrong. Turn the lock off when you deliberately need a non-proportional size, such as forcing a square crop-to-fit frame.",
    },
    {
      question: "Which social-media presets are included?",
      answer:
        "One click covers the sizes people ask for most: an Instagram square post (1080×1080), an Instagram/Facebook story (1080×1920), a Facebook cover (820×312), an X/Twitter header (1500×500), a YouTube thumbnail (1280×720) and a 1080p desktop wallpaper (1920×1080). You can always tweak the numbers afterwards.",
    },
    {
      question: "Does resizing change the file format or size?",
      answer:
        "The resizer keeps your original format where it can and outputs PNG, JPG or WebP. Making an image smaller in pixels usually makes the file smaller in bytes too. Enlarging usually makes it bigger. If your goal is a smaller download rather than smaller dimensions, run the result through our image compressor.",
    },
    {
      question: "Is there a limit on image size?",
      answer:
        "There's no artificial cap. The only real limit is your device's memory, because the full image is held in the browser while it's redrawn. Very large photos on a low-memory phone can be slow, but typical images resize instantly.",
    },
    {
      question: "Are my images uploaded anywhere?",
      answer:
        "No. Every resize runs on an HTML canvas inside your browser tab. The image is read, resampled and downloaded on your own device. It never travels to a server, so there's nothing for anyone to store or see.",
    },
  ],

  relatedTools: ["image-compressor", "crop-image", "webp-converter", "jpg-to-png"],
};

export default imageResizer;
