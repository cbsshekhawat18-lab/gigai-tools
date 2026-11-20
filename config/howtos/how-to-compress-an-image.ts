import type { HowTo } from "@/types";

const howto: HowTo = {
  slug: "how-to-compress-an-image",
  title: "How to Compress an Image (Without Losing Quality)",
  description:
    "Shrink JPG, PNG and WebP files for faster pages and smaller uploads. Keep them sharp by balancing quality, format and dimensions. A practical step-by-step guide.",
  accent: "orange",
  icon: "ImageDown",
  toolSlug: "image-compressor",
  seo: {
    title: "How to Compress an Image Without Losing Quality (Free)",
    description:
      "Learn how to compress JPG, PNG and WebP images in your browser: cut file size for faster pages and smaller uploads while keeping them sharp. Free, private, step-by-step.",
    keywords: [
      "how to compress an image",
      "compress image",
      "reduce image file size",
      "compress jpg",
      "compress png",
      "image compressor",
    ],
    canonical: "/how-to/how-to-compress-an-image",
  },
  intro: [
    "Large images are the number-one cause of slow web pages and rejected uploads. A photo straight from a phone or camera can weigh several megabytes, most of which is invisible detail your viewers never notice. Compressing it strips that redundancy, often cutting the file size by 60–90% with no visible loss of quality.",
    "The trick is balancing three levers (quality, format and dimensions) so the image stays sharp where it counts. This guide walks through each using our free image compressor, which runs entirely in your browser: your photos are processed locally and never uploaded, so it's fast and private.",
  ],
  steps: [
    {
      title: "Open the image compressor",
      body: "Head to the image compressor tool. It runs in your browser with nothing to install, and your images stay on your own device throughout.",
    },
    {
      title: "Add your images",
      body: "Drag one or several images onto the upload area, or click to browse. It handles JPG, PNG and WebP, so you can compress photos and graphics in the same batch.",
    },
    {
      title: "Resize before compressing if it's oversized",
      body: "If the image is far larger than it will ever be displayed, say a 6000px photo used at 1200px wide, reduce its dimensions first. Fewer pixels is the single biggest size saving you can make.",
    },
    {
      title: "Choose the right format",
      body: "Use JPG for photographs, PNG when you need transparency or crisp text and lines, and WebP for the best size-to-quality ratio on the modern web. The right format can beat any quality setting.",
    },
    {
      title: "Adjust the quality level",
      body: "For JPG and WebP, lower the quality slider and watch the preview. A setting around 75–85% typically removes most of the file weight while staying visually indistinguishable from the original.",
    },
    {
      title: "Compress and compare",
      body: "Run the compression and check the before-and-after size and preview. If the result still looks perfect, push the quality a little lower. If you see artefacts, ease it back up.",
    },
    {
      title: "Download the optimized image",
      body: "Download the smaller file (or the whole batch) ready to upload, email or embed on a page. It carries no watermark and keeps the format you chose.",
    },
  ],
  tips: [
    "Resizing beats quality tweaks: an image displayed at 800px wide gains nothing from being stored at 4000px, and shrinking the dimensions saves the most bytes.",
    "WebP usually produces the smallest files at a given quality. Use it wherever your audience's browsers support it, which today is nearly universal.",
    "Compress from the original, not from an already-compressed copy. Re-compressing a JPG repeatedly stacks up artefacts.",
    "Strip EXIF metadata (camera model, location, timestamps) during compression to shave extra bytes and protect privacy on images you publish.",
  ],
  faq: [
    {
      question: "Can I compress an image without losing quality?",
      answer:
        "You can compress with no visible loss. Lossless formats like PNG can be optimized with zero quality change, and for JPG or WebP a quality of around 80% removes most of the file size while staying indistinguishable to the eye at normal viewing sizes.",
    },
    {
      question: "Which format gives the smallest file?",
      answer:
        "WebP generally produces the smallest files at a given quality, followed by JPG for photos. PNG files are larger but are the right choice when you need transparency or perfectly crisp text and line art.",
    },
    {
      question: "Should I resize or compress?",
      answer:
        "Do both, and resize first. If an image is larger in pixels than it will ever be shown, cutting the dimensions is the biggest single saving. Then compression trims what's left. Resizing an oversized image often matters more than the quality slider.",
    },
    {
      question: "Is JPG or PNG better for compressing photos?",
      answer:
        "JPG (or WebP) is far better for photographs: its lossy compression handles smooth gradients and detail efficiently. PNG is best reserved for graphics, screenshots, logos and anything needing transparency.",
    },
    {
      question: "Are my images uploaded to a server?",
      answer:
        "No. Compression runs entirely in your browser on your own device, so your images never leave your computer. That keeps it fast and safe even for private photos.",
    },
  ],
  relatedToolSlugs: [
    "image-resizer",
    "webp-converter",
    "png-to-jpg",
    "compress-pdf",
  ],
  relatedHowToSlugs: [],
};

export default howto;
