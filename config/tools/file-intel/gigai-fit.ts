import type { Tool } from "@/types";

/**
 * GigAI Fit, flagship. Named with the new brand from day one so the upcoming
 * GigAI → GigAI migration doesn't have to rewrite it.
 *
 * Positioning discipline, per the brand spec: Fit is "intelligent compression
 * routing and target-size optimisation", NOT "AI". No model is involved and the
 * copy never implies one; calling a binary search AI is exactly the kind of
 * claim that costs trust.
 *
 * The engines are the existing studios (image, PDF, video, audio). This page
 * describes the ROUTING and the SEARCH, which is the genuinely new part.
 */
const gigaiFit: Tool = {
  slug: "gigai-fit",
  title: "GigAI Fit",
  notFor: [
    { text: "It does not pick the format for archival quality - it optimises for hitting your size target." },
  ],
  description:
    "Tell GigAI the maximum size you need and it works out how to get there, images, PDFs, video and audio, all compressed in your browser.",
  category: "file-intelligence",
  icon: "Zap",
  accent: "violet",
  processor: "compress",
  status: "live",
  featured: true,
  serverSide: false,
  createdAt: "2026-08-12",

  h1: "GigAI Fit. Make Any File Fit a Target Size",
  tagline: "Make any file fit.",
  ctaText: "Make a file fit",
  titleNoun: "GigAI Fit",
  featuresHeading: "What GigAI Fit does",

  longDescription:
    "Every file-size problem is really the same problem: something has a limit, and your file is over it. The mail server rejects it at 25 MB, Discord stops at 10, the upload form says 2, and the advice you find online is to fiddle with a quality slider until something works. That means understanding codecs, bitrates, CRF values and chroma subsampling to answer a question that was never about any of those things. GigAI Fit turns it back into the question you actually had. Drop a file, type the size you need, and it works out the rest. First it identifies what the file really is: from its bytes, not its extension, because a.jpg that's secretly a PNG is a normal Tuesday. Then it routes the file to the right existing GigAI engine: images go to the image compressor, PDFs to PDF Studio, video to Video Studio, audio to Audio Studio. Nothing is reimplemented. The tools that already do this well do the work. What Fit adds is the search. It runs a binary search over that engine's own quality control, measuring the real output size each round and narrowing in on the highest quality that still fits under your target. Not the first setting that happens to fit: the best one that does. An image typically settles in six or seven encodes. Video gets a deliberately shorter search because each attempt is a full re-encode and nobody wants to wait ten minutes to save another 200 KB. And when your target simply isn't reachable, it says so rather than grinding the file into mush to claim success. A 48 MB photo will not become 500 KB and still be worth looking at, so Fit stops at the best practical result, shows you what that is, and lets you decide whether to accept it or pick a different number. Everything happens in your browser. The file is never uploaded, the original is never modified, and the result is a new file with a new name, so a compression you don't like costs you nothing.",

  keywords: [
    "compress file to size",
    "compress file to 1mb",
    "compress file to 2mb",
    "make file smaller online",
    "compress file for email",
    "compress video for whatsapp",
    "compress video for discord",
    "reduce file size online",
    "target size compressor",
    "compress to exact size",
    "shrink file to fit upload limit",
  ],

  tags: ["compress", "file-size", "flagship", "images", "pdf", "video", "audio"],
  fileTypes: ["jpg", "png", "webp", "pdf", "mp4", "mov", "mp3", "wav", "m4a"],
  audiences: ["business", "students", "freelancers", "developers"],

  seo: {
    title: "GigAI Fit. Make Any File Fit a Target Size (Free, In-Browser)",
    description:
      "Set a maximum size and GigAI Fit compresses your image, PDF, video or audio to meet it, choosing the best quality that fits. Free, private, nothing uploaded.",
  },

  features: [
    {
      icon: "Target",
      title: "You give the size, not the settings",
      description:
        "Type 2 MB, or pick Email, WhatsApp, Discord or Web. No quality sliders, no bitrate maths, no guessing which knob matters for which format.",
    },
    {
      icon: "Route",
      title: "Routes to the right engine automatically",
      description:
        "The file is identified from its actual bytes, then handed to the GigAI engine built for it: image, PDF, video or audio. Nothing here is a second-rate copy of a tool you already have.",
    },
    {
      icon: "Search",
      title: "Finds the best quality that fits",
      description:
        "A binary search over the engine's own quality control, measuring the real output each round. You get the highest quality that meets your limit, not the first setting that happens to squeeze under it.",
    },
    {
      icon: "CircleAlert",
      title: "Tells you when a target is impossible",
      description:
        "A 48 MB photo will not become a usable 500 KB. Rather than destroying it to claim success, Fit stops at the best practical result and shows you what that is.",
    },
    {
      icon: "GitCompare",
      title: "Shows exactly what it traded away",
      description:
        "Before and after size, resolution and bitrate, a measured quality verdict, and the list of every attempt it made to get there. No black box.",
    },
    {
      icon: "CloudOff",
      title: "Your file never leaves the browser",
      description:
        "Every attempt runs on your own device. The original is never modified and the result is a new file, a compression you dislike costs you nothing.",
    },
  ],

  benefits: [
    {
      title: "The upload just works",
      description:
        "Set the limit the form is asking for and send the file. No second attempt, no 'file too large' after a two-minute upload.",
    },
    {
      title: "You keep the quality you didn't need to lose",
      description:
        "Most people over-compress because they're guessing. Searching for the best fit means you give up exactly as much as the limit demands and no more.",
    },
    {
      title: "One place instead of four",
      description:
        "Image, PDF, video and audio all take the same path. You don't have to know which tool a given file belongs to.",
    },
  ],

  howTo: [
    {
      title: "Drop a file",
      description:
        "Images, PDFs, video or audio. It's identified from its bytes, not its extension, and inspected in your browser.",
    },
    {
      title: "Name your size",
      description: "Type a number and pick KB, MB or GB, or tap a preset for Email, WhatsApp, Discord or Web upload.",
    },
    {
      title: "Let it search",
      description:
        "Each attempt names the real setting it's trying and the size it produced. Cancel at any point. Nothing is committed until you download.",
    },
    {
      title: "Check the trade and download",
      description:
        "See the before/after, the measured quality verdict and exactly what changed. Then download the new file. Your original is untouched.",
    },
  ],

  formats: {
    input: ["JPG", "PNG", "WebP", "HEIC", "PDF", "MP4", "MOV", "WebM", "MP3", "WAV", "M4A", "FLAC"],
    output: ["JPG", "PDF", "MP4", "MP3"],
  },

  useCases: [
    {
      audience: "Anyone emailing a file",
      title: "Under the attachment limit",
      description:
        "Pick Email and the file comes back under 20 MB: comfortably inside the ~25 MB most mail servers enforce, rather than one kilobyte over it.",
    },
    {
      audience: "Anyone sharing video",
      title: "A clip that WhatsApp or Discord will accept",
      description:
        "Video is re-encoded at a higher CRF until it fits, with the search kept short because each attempt is a full re-encode.",
    },
    {
      audience: "Job applicants & students",
      title: "Portals with a hard size cap",
      description:
        "Application forms often cap a PDF at 1 or 2 MB with no explanation. Set the number the form demands and send it.",
    },
    {
      audience: "Web & content teams",
      title: "Images that don't slow a page down",
      description:
        "Set a per-image budget and get the best-looking version that stays inside it, with the resolution change stated explicitly.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says the target isn't reachable",
      solution:
        "That's an honest answer, not a failure. Past a point, more compression stops removing file size and starts removing the picture. Fit shows you the best practical result and its size, either accept that, or raise your target. For images, a much smaller target is usually reachable if you accept a lower resolution, which Fit already does automatically before giving up.",
    },
    {
      problem: "My PDF's text stopped being selectable",
      solution:
        "PDF compression here rasterises pages: that's what reliably shrinks a scanned or image-heavy PDF, and it's stated before you run it. If you need the text layer preserved, don't compress. Instead remove pages you don't need with Delete PDF Pages, or split the document.",
    },
    {
      problem: "My PNG came back as a JPG",
      solution:
        "Deliberate. PNG is lossless, so it has no quality dial to search. It cannot be driven to an arbitrary byte target. Hitting a specific size requires a lossy format, so Fit encodes JPEG and tells you the format changed. If you need PNG specifically, use the Image Compressor directly and accept whatever size results.",
    },
    {
      problem: "The video is taking a long time",
      solution:
        "Video re-encoding is genuinely slow in a browser, each attempt processes every frame. Fit runs at most three attempts for that reason. A shorter clip, or trimming it first with Video Trimmer, cuts the time proportionally.",
    },
    {
      problem: "It won't compress my Word document",
      solution:
        "A.docx is already a compressed ZIP, so there's very little to reclaim and the only real lever risks corrupting the file. Convert it to PDF first with Word to PDF, then bring the PDF back here. A PDF genuinely can be compressed to a target size.",
    },
  ],

  tips: [
    "Pick the preset for where the file is going: the numbers sit deliberately under each platform's published cap.",
    "Compressing an already-compressed file gives back very little. Start from the best original you have.",
    "If the target is missed, try raising it 20% before accepting heavy degradation. The curve is steep near the end.",
    "Trim a video before fitting it. Removing seconds is far cheaper in quality than removing bitrate.",
  ],

  security:
    "Every attempt runs inside your browser using the same GigAI engines the individual studios use. The file is never uploaded, nothing is stored and nothing is logged. Your original file is never modified: each attempt produces a new blob in memory, and the download is written under a new name, so an outcome you dislike costs you nothing. Intermediate attempts are released as the search proceeds rather than accumulating, and object URLs are revoked when you reset. You can disconnect from the network and compress anyway, which is the simplest way to confirm all of this for yourself.",

  faq: [
    {
      question: "How does GigAI Fit choose the compression settings?",
      answer:
        "It runs a binary search. Each round it encodes at a candidate quality setting, measures the real output size, and narrows the range, keeping the largest result that still fits your target, which is the highest quality that meets the limit. Images settle in six or seven attempts. Video is capped at three because each attempt is a full re-encode.",
    },
    {
      question: "Is this AI?",
      answer:
        "No, and we'd rather say so. GigAI Fit is intelligent routing and a measured search. It identifies the file, picks the right engine and optimizes towards your target. No model is involved. GigAI uses AI where AI genuinely helps and plain algorithms where they're better, and this is firmly the second kind.",
    },
    {
      question: "Is my file uploaded?",
      answer:
        "No. Identification, every compression attempt and the final output all happen in your browser. Nothing is transmitted, stored or logged, and you can run it with the network disconnected.",
    },
    {
      question: "What if my target size is impossible?",
      answer:
        "It stops and tells you. Past a certain point compression removes the content rather than the file size, so rather than handing back something unusable and calling it a success, Fit shows the best practical result, its actual size, and lets you accept it or choose a different target.",
    },
    {
      question: "Which file types work?",
      answer:
        "Images (JPG, PNG, WebP, HEIC and more), PDFs, video (MP4, MOV, WebM) and audio (MP3, WAV, M4A, FLAC). Office documents aren't compressed directly, they're already ZIP packages with little to reclaim, so Fit points you at converting them to PDF first, which genuinely can be compressed.",
    },
    {
      question: "Does it change my original file?",
      answer:
        "Never. The original is only ever read. Every attempt creates a new blob in memory and the download is saved under a new name, so nothing you do here can damage the file you started with.",
    },
  ],

  changelog: [
    { date: "2026-08-12", change: "GigAI Fit released: target-size search across image, PDF, video and audio engines." },
  ],

  relatedTools: ["image-compressor", "compress-pdf", "video-compressor", "assist"],
};

export default gigaiFit;
