import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "h264-vs-h265",
  a: "H.264",
  b: "H.265 (HEVC)",
  title: "H.264 vs H.265 (HEVC): Which Video Codec Should You Use?",
  description:
    "H.265 halves file size at the same quality but needs more support and power, H.264 plays everywhere. Here's when each codec wins for video.",
  accent: "indigo",
  icon: "Binary",
  seo: {
    title: "H.264 vs H.265 (HEVC): Which Video Codec Wins? (2026)",
    description:
      "H.264 vs H.265 explained: file size, quality, device support and CPU cost, and exactly when to use each codec, plus how to convert video that won't play.",
    keywords: [
      "h264 vs h265",
      "h.264 vs hevc",
      "h265 vs h264",
      "hevc vs h264",
      "which video codec",
      "h264 or h265",
    ],
    canonical: "/compare/h264-vs-h265",
  },
  intro: [
    "H.264 and H.265 are video codecs: the methods that compress the video inside a file (like an MP4 or MOV). They're not file formats themselves. A single MP4 can contain either. Choosing between them is a trade-off between compatibility and efficiency.",
    "H.265, also called HEVC, is the newer codec. It roughly halves the file size of H.264 at the same visual quality, which is why phones and 4K cameras increasingly record in it. The cost is that it demands more processing power to encode and decode, and older devices, browsers and editors don't always support it, which is why an HEVC video sometimes 'won't play'.",
    "H.264 (AVC) is the older, universal workhorse. It's less efficient, so files are larger, but it plays on virtually everything with no compatibility worries and is fast to encode. Below is the breakdown, a clear rule for choosing, and the tools to convert a video to a compatible format when H.265 won't play.",
  ],
  dimensions: [
    {
      label: "File size / efficiency",
      a: "Larger, older, less efficient compression.",
      b: "About half the size at the same quality.",
    },
    {
      label: "Compatibility",
      a: "Universal: plays on virtually everything.",
      b: "Growing, but older devices/browsers often can't play it.",
    },
    {
      label: "Encoding / decoding power",
      a: "Light: fast and easy on any hardware.",
      b: "Heavier. Needs more CPU/GPU, especially to encode.",
    },
    {
      label: "Quality at low bitrate",
      a: "Good.",
      b: "Better. Keeps more detail when heavily compressed.",
    },
    {
      label: "Common use",
      a: "Web video, streaming, sharing, older devices.",
      b: "4K/HDR capture, storage-efficient recording.",
    },
    {
      label: "Best for",
      a: "Maximum compatibility and easy playback.",
      b: "Saving space when your devices support it.",
    },
  ],
  whenA: [
    "You need the video to play on any device, browser or platform.",
    "You're uploading or sharing widely and can't assume modern hardware.",
    "You want fast encoding on modest hardware.",
    "Compatibility matters more than saving storage.",
  ],
  whenB: [
    "You want to halve file size at the same quality for storage.",
    "You're capturing 4K/HDR where efficiency really pays off.",
    "Your devices and viewers all support HEVC.",
    "Bandwidth or disk space is the priority.",
  ],
  verdict:
    "Use H.264 for anything you need to share or that must simply play everywhere: it's the safe universal choice. Use H.265 (HEVC) to save space when you control the devices and they support it, like 4K recording and archival. When an HEVC video won't play somewhere, converting it to H.264 (in an MP4) is the standard fix.",
  relatedToolSlugs: ["video-converter", "video-compressor", "mov-to-mp4", "mp4-to-webm"],
  faq: [
    {
      question: "Is H.265 better than H.264?",
      answer:
        "For efficiency, yes, H.265 (HEVC) achieves the same quality at roughly half the file size. But it needs more processing power and isn't supported everywhere, so H.264 remains the more compatible choice for sharing.",
    },
    {
      question: "Why won't my H.265 (HEVC) video play?",
      answer:
        "The device, browser or app doesn't support HEVC decoding. Converting the video to H.264 (inside an MP4) makes it play almost everywhere, at the cost of a larger file.",
    },
    {
      question: "Is H.264 the same as MP4?",
      answer:
        "No. MP4 is a container (the file format), H.264 is a codec (how the video inside is compressed). An MP4 can hold H.264 or H.265 video, which is why two MP4s can behave differently.",
    },
    {
      question: "Which codec should I record in?",
      answer:
        "Record in H.265/HEVC to save storage if all your devices support it (great for 4K). If you'll share widely or edit on older software, H.264 avoids compatibility headaches.",
    },
  ],
  relatedComparisonSlugs: ["mp4-vs-webm", "mov-vs-mp4"],
};

export default comparison;
