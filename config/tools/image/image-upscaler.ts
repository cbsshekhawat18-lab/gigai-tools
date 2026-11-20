import type { Tool } from "@/types";

/**
 * AI Image Upscaler, enlarges images 2× or 4× with a real ESRGAN super-resolution
 * neural network (UpscalerJS + TensorFlow.js) running fully in the browser. The
 * trained model reconstructs plausible edge and texture detail rather than merely
 * stretching pixels. Weights download once on first use and are cached; if the
 * model can't load the engine falls back to high-quality canvas resampling. All
 * content is unique to upscaling and shares nothing with the other image tools.
 */
const imageUpscaler: Tool = {
  slug: "image-upscaler",
  title: "AI Image Upscaler",
  description:
    "Enlarge photos and graphics 2x or 4x in your browser with a real ESRGAN neural network that reconstructs sharp detail, free, private and nothing uploaded.",
  category: "image-tools",
  icon: "Maximize2",
  accent: "orange",
  processor: "upscale",
  status: "live",
  featured: true,
  createdAt: "2026-07-02",

  h1: "Upscale Images 2x & 4x",
  tagline:
    "Make small pictures bigger and sharper, a trained ESRGAN super-resolution model rebuilds edges and texture at 2x or 4x, right inside your browser.",
  longDescription:
    "The GigAI Image Upscaler enlarges your image to two or four times its original size using a real super-resolution neural network, an ESRGAN model powered by UpscalerJS and TensorFlow.js, that runs entirely inside your browser tab. Instead of naively stretching the pixels you already have, the trained model predicts and reconstructs the fine detail a larger image should contain, so edges come back crisp, textures stay believable and gradients stay smooth. Drop in a photo, product shot or logo, choose 2x or 4x, and download a larger, sharper file. No account, no watermark and nothing uploaded. The model weights download once on first use and are cached in your browser, so the first run takes a little longer while everything after is fast. It's genuine AI upscaling for moderate enlargements: it rebuilds plausible detail, but it can't recover information a low-quality or heavily blurred source never captured.",

  ctaText: "Upscale an image",

  keywords: [
    "image upscaler",
    "upscale image",
    "enlarge image online",
    "increase image resolution",
    "2x image upscaler",
    "4x image upscaler",
    "make image bigger",
    "photo enlarger",
    "resize image up",
  ],

  seo: {
    title: "AI Image Upscaler: Enlarge Images 2x & 4x Free | GigAI Tools",
    description:
      "Upscale images 2x or 4x online for free with a real ESRGAN super-resolution model that runs in your browser: reconstructs detail, nothing uploaded, no sign-up.",
  },

  features: [
    {
      icon: "Sparkles",
      title: "Real ESRGAN super-resolution",
      description:
        "A trained neural network reconstructs the detail a larger image should have: rebuilding edges and texture instead of simply stretching the pixels you started with.",
    },
    {
      icon: "ScanSearch",
      title: "Sharp edges, believable texture",
      description:
        "The model restores crisp lines and natural surface detail, so enlargements avoid the soft, staircased look you get from a plain nearest-neighbour or bilinear blow-up.",
    },
    {
      icon: "Ruler",
      title: "See the new dimensions",
      description:
        "Pick a factor and the tool shows the exact output resolution before you commit, an 800×600 photo becomes 1600×1200 at 2x or 3200×2400 at 4x.",
    },
    {
      icon: "Cpu",
      title: "Runs on your device",
      description:
        "Inference happens locally in your browser via TensorFlow.js. The model weights download once on first use, cache for next time, and your image never touches a server.",
    },
    {
      icon: "Blend",
      title: "Keeps transparency",
      description:
        "Upscale a PNG logo or cut-out and the alpha channel comes along, so transparent backgrounds stay transparent at the larger size.",
    },
  ],

  benefits: [
    {
      title: "Nothing leaves your device",
      description:
        "Upscaling runs entirely in your browser tab. The neural network loads and executes locally, your image is read, enlarged and downloaded on your own machine. Never uploaded, stored or seen by anyone.",
    },
    {
      title: "Rescue small source images",
      description:
        "Got a picture that's too small for a slide, a print or a hero banner? A 2x or 4x super-resolution pass rebuilds detail and gives you the pixel dimensions those layouts demand.",
    },
    {
      title: "Fast after the first run",
      description:
        "The model downloads and caches on your first upscale. Every run after that is quick. Try 2x and 4x back to back and keep whichever result looks best.",
    },
    {
      title: "Free with no catches",
      description:
        "No sign-up, no watermark and no daily cap. Upscale as many images as you like. The only practical limit is your device's memory and speed for very large outputs.",
    },
  ],

  howTo: [
    {
      title: "Add your image",
      description:
        "Drag a photo or graphic onto the drop zone, click to browse your files, or paste an image straight from your clipboard.",
    },
    {
      title: "Choose 2x or 4x",
      description:
        "Pick how much bigger you want it. The tool previews the exact output width and height so you know what you'll get before processing.",
    },
    {
      title: "Upscale with AI",
      description:
        "Hit Upscale to run the ESRGAN model locally. The first run downloads the model, so give it a moment. The before/after view then shows the original beside the sharper result.",
    },
    {
      title: "Download",
      description:
        "Save the enlarged file. If 4x looks too soft for a very low-quality source, drop back to 2x and run it again.",
    },
  ],

  formats: {
    input: ["JPG", "JPEG", "PNG", "WebP", "GIF", "BMP"],
    output: ["PNG", "JPG", "WebP"],
  },

  faq: [
    {
      question: "Is this a real AI super-resolution upscaler?",
      answer:
        "Yes. It runs a trained ESRGAN super-resolution neural network in your browser using UpscalerJS and TensorFlow.js. Rather than stretching the pixels you already have, the model predicts and reconstructs plausible fine detail for the larger image, which is why enlargements look sharper than a plain resize. If the model can't load (for example offline or on an unsupported device) the tool quietly falls back to high-quality resampling so you still get a result.",
    },
    {
      question: "How much can I enlarge my image?",
      answer:
        "You can choose 2x (double) or 4x (quadruple) each dimension. A 2x pass turns a 1000×1000 image into 2000×2000. 4x makes it 4000×4000. The model reconstructs detail best at these moderate factors: for the strongest result, start from the cleanest source you have, since a good input gives the network more to work with.",
    },
    {
      question: "Does anything get uploaded to a server?",
      answer:
        "No. The neural network runs entirely on your own device inside the browser tab, so your image is never uploaded, stored or transmitted. The only thing downloaded is the model's weights themselves, which happens once on first use and is then cached: safe to use even on confidential product photography.",
    },
    {
      question: "Why is the first upscale slower?",
      answer:
        "The first time you use the tool it downloads the ESRGAN model weights and initialises TensorFlow.js, which takes a few seconds. After that the model is cached in your browser, so subsequent upscales start much faster. Larger images and 4x also take longer than small images or 2x, since there are many more pixels for the network to reconstruct.",
    },
    {
      question: "Will upscaling fix a blurry or low-quality photo?",
      answer:
        "It helps, but there are limits. Super-resolution reconstructs plausible detail and can noticeably sharpen soft or slightly noisy images, but it can't recover information that was never captured: heavy motion blur, severe out-of-focus shots or unreadable text can't be fully restored. It's designed for moderate enlargement of reasonable-quality sources, not to magically rescue a badly damaged photo.",
    },
    {
      question: "Which output format should I pick, and does transparency survive?",
      answer:
        "The tool keeps your source format by default, so a transparent PNG stays a transparent PNG at the larger size. Choose PNG when you need lossless detail or an alpha channel, or JPG/WebP when you want a smaller file for the web. For photos headed to the web, WebP usually gives the best size-to-quality balance.",
    },
  ],

  relatedTools: [
    "image-resizer",
    "image-compressor",
    "crop-image",
  ],
};

export default imageUpscaler;
