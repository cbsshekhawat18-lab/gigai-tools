import type { HowTo } from "@/types";

const howto: HowTo = {
  slug: "how-to-convert-png-to-jpg",
  title: "How to Convert PNG to JPG (Free, Right in Your Browser)",
  description:
    "Turn a bulky PNG into a lightweight JPG in seconds. No software, no upload, no watermark. A clear step-by-step guide to converting PNG images to JPG.",
  accent: "amber",
  icon: "Image",
  toolSlug: "png-to-jpg",
  seo: {
    title: "How to Convert PNG to JPG Free (No Upload, No Watermark)",
    description:
      "Learn how to convert PNG to JPG in your browser: free, private and instant. Step-by-step, plus how to handle transparency and pick the right quality.",
    keywords: [
      "how to convert png to jpg",
      "png to jpg converter",
      "change png to jpg",
      "convert png to jpeg",
      "png to jpg free",
    ],
    canonical: "/how-to/how-to-convert-png-to-jpg",
  },
  intro: [
    "PNG is a fantastic format for logos, screenshots and anything that needs a transparent background, but that quality comes at a cost: PNG files are often several times larger than they need to be for photographs or web use. Converting a PNG to JPG applies smart lossy compression that can cut the file size by 70% or more, which makes pages load faster and files far easier to email or upload.",
    "The catch is that JPG doesn't support transparency, so any transparent areas in your PNG have to be filled with a solid color (usually white) during conversion. The guide below walks you through the whole thing using our free PNG to JPG converter, which runs entirely in your browser, your image never leaves your device, there's no sign-up, and the result carries no watermark.",
  ],
  steps: [
    {
      title: "Open the PNG to JPG converter",
      body: "Head to the PNG to JPG tool. It loads instantly in any modern browser and works on both desktop and mobile, there's nothing to install and no account to create.",
    },
    {
      title: "Add your PNG file",
      body: "Drag your PNG onto the drop zone, or click to browse and select it from your device. The image is decoded locally in your browser, so it is never uploaded to a server.",
    },
    {
      title: "Choose a background color for transparency",
      body: "Because JPG can't store transparency, any see-through pixels need a solid fill. White is the safe default for most images. Pick a color that matches where the image will be placed so the fill blends in cleanly.",
    },
    {
      title: "Set the JPG quality",
      body: "Higher quality means a sharper image and a larger file. Lower quality shrinks the file further with a small loss of detail. A setting around 80–90% is the sweet spot for most photos and screenshots.",
    },
    {
      title: "Convert the image",
      body: "Click Convert and the tool re-encodes your PNG as a JPG in a fraction of a second. You'll see the new JPG previewed alongside its file size so you can confirm it looks right before saving.",
    },
    {
      title: "Download your JPG",
      body: "Save the finished JPG straight to your device. It has no watermark and is ready to attach, upload or share. If the file is still larger than you'd like, run it again at a slightly lower quality.",
    },
  ],
  tips: [
    "Only convert to JPG when you don't need transparency: for logos and icons that sit on colored backgrounds, keeping the PNG (or using SVG) is usually better.",
    "JPG is ideal for photographs and complex images with lots of color gradients. It's a poor choice for sharp-edged graphics, text or line art, which can look fuzzy.",
    "If you'll edit the image again later, keep the original PNG: every JPG save re-compresses and slowly degrades quality.",
    "For web use, aim for the smallest file that still looks good at the size it'll be displayed. You rarely need a full-resolution image on a page.",
  ],
  faq: [
    {
      question: "Why does my PNG have a white background after converting to JPG?",
      answer:
        "JPG doesn't support transparency, so any transparent areas in the original PNG must be filled with a solid color when it's converted. White is the default, but you can choose a different fill color to match wherever the image will be placed.",
    },
    {
      question: "Will converting PNG to JPG reduce the image quality?",
      answer:
        "JPG uses lossy compression, so there's a small quality trade-off, but at a quality setting of 80–90% it's usually invisible to the eye. The upside is a much smaller file, which is the whole point of converting for web or email.",
    },
    {
      question: "Is it safe to convert PNG to JPG online?",
      answer:
        "With this tool, yes. The conversion happens entirely inside your browser, so your image is processed on your own device and never uploaded anywhere. Nothing is stored or logged, which makes it safe even for private images.",
    },
    {
      question: "Can I convert several PNG files to JPG at once?",
      answer:
        "This guide covers converting one image at a time for the best control over quality and background fill. For large batches you can repeat the quick process for each file, or use an image compressor to handle many images together.",
    },
    {
      question: "Should I use JPG or keep the PNG?",
      answer:
        "Keep the PNG if you need transparency or the image is a logo, icon or screenshot with sharp text and edges. Convert to JPG when it's a photograph or a large image where a smaller file matters more than pixel-perfect edges.",
    },
  ],
  relatedToolSlugs: ["jpg-to-png", "image-compressor", "image-resizer", "webp-converter"],
  relatedHowToSlugs: [],
};

export default howto;
