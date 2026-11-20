import type { HowTo } from "@/types";

const howto: HowTo = {
  slug: "how-to-resize-an-image-for-instagram",
  title: "How to Resize an Image for Instagram (Every Format)",
  description:
    "Get the exact Instagram dimensions for posts, stories and reels so nothing gets cropped, free, in your browser, no watermark. A clear step-by-step guide.",
  accent: "violet",
  icon: "Crop",
  toolSlug: "image-resizer",
  seo: {
    title: "How to Resize an Image for Instagram (Exact Sizes 2026)",
    description:
      "Learn how to resize an image for Instagram posts, stories and reels with the right dimensions, free and in your browser. Step-by-step, with every size.",
    keywords: [
      "how to resize image for instagram",
      "instagram image size",
      "instagram post dimensions",
      "resize photo for instagram",
      "instagram story size",
    ],
    canonical: "/how-to/how-to-resize-an-image-for-instagram",
  },
  intro: [
    "Instagram silently crops and compresses anything that doesn't match its preferred dimensions, which is why a photo that looked perfect on your camera roll suddenly loses its edges or turns soft in the feed. Resizing your image to Instagram's exact pixel sizes before you upload puts you back in control: the whole shot stays visible, it stays crisp, and it fills the frame the way you intended.",
    "The three sizes you'll use most are 1080×1080 for a square post, 1080×1350 for a portrait post (the tallest the feed allows, and the one that takes up the most screen), and 1080×1920 for stories and reels. The guide below resizes to any of these using our free image resizer, which runs entirely in your browser, your photo never leaves your device, there's no sign-up, and there's no watermark.",
  ],
  steps: [
    {
      title: "Open the image resizer",
      body: "Head to the Image Resizer tool. It loads instantly on desktop and mobile: nothing to install, no account required.",
    },
    {
      title: "Upload your photo",
      body: "Drag your image onto the drop zone or click to browse and select it. The photo is processed locally in your browser and is never uploaded to a server.",
    },
    {
      title: "Pick the right Instagram dimensions",
      body: "Enter the target size for your format: 1080×1080 for a square post, 1080×1350 for a portrait post, or 1080×1920 for a story or reel. Starting from a high-resolution original gives the sharpest result at these sizes.",
    },
    {
      title: "Match the aspect ratio to avoid stretching",
      body: "Instagram's sizes have fixed aspect ratios (1:1, 4:5 and 9:16). If your photo's shape doesn't match, crop it to the correct ratio first so the resize doesn't squash or stretch the image.",
    },
    {
      title: "Resize the image",
      body: "Apply the resize and the tool scales your photo to the exact pixel dimensions in an instant, previewing the result so you can confirm the framing looks right.",
    },
    {
      title: "Download the Instagram-ready image",
      body: "Save the resized photo to your device. It has no watermark and is sized precisely for Instagram, so it uploads without any surprise cropping or extra compression.",
    },
  ],
  tips: [
    "Portrait 1080×1350 is the highest-impact feed size. It occupies the most vertical space on a phone screen, so it stops the scroll better than a square.",
    "Always start from the highest-resolution version of your photo. Upscaling a small image to 1080px wide will look soft and pixelated.",
    "Keep important details away from the outer edges of stories and reels, Instagram's interface (profile icon, caption, buttons) overlaps the top and bottom of a 1080×1920 frame.",
    "Export as JPG for photographs to keep the file small. Use PNG only if your image contains sharp text or graphics that need to stay razor-sharp.",
  ],
  faq: [
    {
      question: "What is the best image size for an Instagram post?",
      answer:
        "1080×1350 pixels (a 4:5 portrait ratio) is the best all-round choice because it fills the most screen space in the feed. Use 1080×1080 for a classic square, and 1080×1920 for stories and reels.",
    },
    {
      question: "Why does Instagram crop or blur my photos?",
      answer:
        "Instagram crops anything that doesn't fit its supported aspect ratios and re-compresses large files on upload. Resizing to the exact dimensions beforehand (and matching the correct aspect ratio) prevents both the cropping and most of the quality loss.",
    },
    {
      question: "Does resizing reduce the quality of my image?",
      answer:
        "Scaling a large photo down to Instagram's sizes actually keeps it sharp, because you're reducing pixels rather than inventing them. Quality only suffers if you enlarge a small image beyond its original resolution.",
    },
    {
      question: "Should I resize before or after editing my photo?",
      answer:
        "Edit first, then resize as the final step before uploading. That way you apply filters and adjustments to the full-resolution image and only scale down once, avoiding repeated quality loss.",
    },
    {
      question: "Is it safe to resize my photos online?",
      answer:
        "With this tool, yes. The resizing happens entirely in your browser, so your photo stays on your own device and is never uploaded. Nothing is stored or logged, which makes it safe even for personal pictures.",
    },
  ],
  relatedToolSlugs: ["crop-image", "image-compressor", "png-to-jpg", "image-upscaler"],
  relatedHowToSlugs: [],
};

export default howto;
