import type { Tool } from "@/types";

/**
 * WebP Converter: turns PNG/JPG into WebP (with a quality dial) and decodes
 * WebP back to PNG or JPG. Copy is unique to this tool and stays honest: WebP is
 * simply a more efficient container that usually yields smaller files at a
 * comparable look, and every conversion runs on the HTML canvas in the browser.
 */
const webpConverter: Tool = {
  slug: "webp-converter",
  title: "WebP Converter",
  description:
    "Convert PNG and JPG images to WebP for smaller, faster-loading files, and turn WebP back into PNG or JPG when you need wider compatibility. Free and in-browser.",
  category: "image-tools",
  icon: "Repeat2",
  accent: "indigo",
  processor: "convert",
  status: "live",
  featured: true,
  createdAt: "2026-07-02",

  h1: "WebP Converter: To & From WebP",
  tagline:
    "Switch between WebP and the formats everyone already supports. Encode PNG or JPG to a lean WebP, or decode a WebP file back to PNG or JPG, both directions, one tool.",
  longDescription:
    "WebP is Google's image format built for the modern web: at the same visual quality it usually produces files noticeably smaller than JPEG or PNG, which trims page weight and speeds up load times. The GigAI WebP Converter handles both directions. Point it at a PNG or JPG and pick a quality to get a compact WebP, or drop in a.webp that a design tool won't open and export a clean PNG (keeping transparency) or a JPG. Everything is encoded locally with the HTML canvas: your images are never uploaded, so conversion is instant and completely private.",

  ctaText: "Convert to WebP",

  keywords: [
    "webp converter",
    "convert to webp",
    "png to webp",
    "jpg to webp",
    "webp to png",
    "webp to jpg",
    "webp encoder",
    "image to webp online",
  ],

  seo: {
    title: "WebP Converter: Convert To & From WebP Free | GigAI Tools",
    description:
      "Convert PNG or JPG to WebP for smaller files, or decode WebP back to PNG or JPG. Free, private, in-browser: pick a quality, preview, and download instantly.",
  },

  features: [
    {
      icon: "ArrowLeftRight",
      title: "Both directions in one tool",
      description:
        "Encode PNG and JPG to WebP, or decode a WebP file back to PNG or JPG. Flip the direction with a single toggle. No separate tool to hunt for.",
    },
    {
      icon: "Feather",
      title: "Lighter files, same look",
      description:
        "WebP typically lands 25–35% smaller than a matching JPEG and far smaller than most PNGs, so pages ship fewer bytes without an obvious drop in quality.",
    },
    {
      icon: "Layers",
      title: "Transparency preserved",
      description:
        "Alpha channels survive the round trip: a transparent PNG becomes a transparent WebP, and decoding to PNG keeps the see-through areas intact.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Quality you control",
      description:
        "When encoding to WebP, a quality dial lets you tune the size-versus-fidelity balance and read the exact bytes saved before you download.",
    },
    {
      icon: "ShieldCheck",
      title: "Runs entirely on your device",
      description:
        "Encoding and decoding happen in your browser tab with the canvas API. No server, no upload, no account, and nothing left behind afterwards.",
    },
  ],

  benefits: [
    {
      title: "Speed up your website",
      description:
        "Swapping heavy JPEGs and PNGs for WebP is one of the highest-impact page-weight wins available, smaller images mean faster loads and better Core Web Vitals.",
    },
    {
      title: "Escape the WebP dead-end",
      description:
        "Downloaded a .webp that Photoshop, Word or an old CMS refuses to open? Decode it back to a universally accepted PNG or JPG in seconds.",
    },
    {
      title: "Honest, lossless-aware handling",
      description:
        "We don't oversell it: WebP is an efficient re-encode, not magic. When you decode to PNG the output is lossless. When you encode, you choose exactly how much to compress.",
    },
    {
      title: "No installs, no limits",
      description:
        "It's a web page, convert on a laptop, tablet or phone, as many images as you like, with no daily cap, watermark or sign-up wall.",
    },
  ],

  howTo: [
    {
      title: "Drop in your image",
      description:
        "Add a PNG, JPG or WebP by dragging it onto the drop zone, browsing your files, or pasting one straight from the clipboard.",
    },
    {
      title: "Pick a direction",
      description:
        "Choose 'To WebP' to encode a PNG/JPG, or 'From WebP' to decode a .webp file and select PNG or JPG as the target format.",
    },
    {
      title: "Tune and convert",
      description:
        "For WebP output, set the quality dial. Then press Convert to re-encode the image locally and see the before/after size.",
    },
    {
      title: "Download the result",
      description:
        "Save your converted file. Want a smaller WebP or a different target format? Adjust the controls and convert again, it's instant.",
    },
  ],

  formats: {
    input: ["PNG", "JPG", "JPEG", "WebP"],
    output: ["WebP", "PNG", "JPG"],
  },

  faq: [
    {
      question: "What is WebP and why would I use it?",
      answer:
        "WebP is an image format from Google designed for the web. It stores photos and graphics more efficiently than JPEG or PNG, so a WebP file is usually smaller at the same visual quality. Smaller images load faster, which improves page speed and search-ranking signals like Core Web Vitals, that's the main reason to convert to it.",
    },
    {
      question: "Do all browsers support WebP?",
      answer:
        "Yes, effectively all of them. Chrome, Edge, Firefox, Safari and every current mobile browser have supported WebP for years. The only place you may still hit trouble is very old software or legacy desktop apps, and for those you can simply decode the WebP back to PNG or JPG here.",
    },
    {
      question: "Is converting to WebP lossy or lossless?",
      answer:
        "It depends on the direction. Encoding a PNG or JPG to WebP uses lossy compression at the quality you choose, trading a little detail for a much smaller file. Decoding a WebP to PNG is lossless. The PNG keeps exactly the pixels the WebP contained. Decoding to JPG re-compresses, so PNG is the best pick when you want to preserve quality.",
    },
    {
      question: "Does WebP keep transparency?",
      answer:
        "It does. WebP supports an alpha channel just like PNG, so a transparent PNG converts to a transparent WebP with no white box behind it. If you later decode that WebP back to PNG, the transparency is preserved. Decoding to JPG flattens it onto a solid background because JPG has no alpha.",
    },
    {
      question: "How much smaller will my file get?",
      answer:
        "For photographs, WebP is commonly 25–35% smaller than an equivalent-quality JPEG, and it can be dramatically smaller than a PNG of the same photo. Flat graphics and icons vary more. The result panel always shows the original size, the new size and the exact percentage difference so you can judge each image.",
    },
    {
      question: "Are my images uploaded anywhere?",
      answer:
        "No. Both encoding and decoding run inside your browser using the canvas API. Your files are read, converted and saved entirely on your device. Nothing is sent to a server, stored or seen by us, which is why the tool works instantly and privately.",
    },
  ],

  relatedTools: [
    "image-compressor",
    "png-to-jpg",
    "jpg-to-png",
    "image-resizer",
  ],
};

export default webpConverter;
