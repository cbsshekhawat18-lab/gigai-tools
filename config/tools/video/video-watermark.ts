import type { Tool } from "@/types";

/**
 * Video Watermark: stamp a text caption or a logo image onto a clip, entirely
 * in the browser. Drop a video, choose text or upload a PNG/SVG logo, pin it to
 * a corner or the centre, dial in the opacity, and burn it into a fresh file
 * with a self-hosted FFmpeg WebAssembly core. Every string below is written for
 * the queries people type when they want to brand or protect footage without
 * uploading it: nothing is copied from the trimmer/compressor/crop copy, and no
 * claim outruns what the client-side `drawtext`/`overlay` pipeline actually does.
 */
const videoWatermark: Tool = {
  slug: "video-watermark",
  title: "Add Watermark to Video",
  description:
    "Add a text or logo watermark to a video online, in your browser, position it in any corner or the centre, set the opacity, and download the branded clip. No uploads, no account, no second watermark of ours.",
  category: "video-tools",
  group: "Edit",
  icon: "Stamp",
  accent: "rose",
  status: "live",
  featured: true,
  createdAt: "2026-06-16",

  h1: "Add a Watermark to Video Online, Free, In Your Browser",
  tagline:
    "Drop an MP4, MOV, WebM or MKV, type a caption or upload your logo, pin it to a corner or the centre and dial in the opacity, then burn it into a clean download. Powered by FFmpeg compiled to WebAssembly, it runs 100% on your device: your footage is never uploaded, and the tool never adds a watermark of its own.",
  longDescription:
    "The GigAI Video Watermark tool brands and protects your footage the honest way, on your own machine, with nothing uploaded and no logo of ours stamped over your work. Drop a video and it probes and previews the file locally, then lets you overlay one of two kinds of mark. Choose text and you get a caption (your name, handle, URL or a © line) with control over the font size, color and how see-through it sits. Or upload a logo (PNG with transparency works best, plus JPG, WebP and SVG) and it's composited straight onto the picture. Either way you pin the mark to a corner or dead centre, drag the opacity from a faint ghost to a solid stamp, and see roughly where it lands on a live preview before you commit. When you export, a self-hosted FFmpeg WebAssembly core draws the overlay into every frame and re-encodes the clip, handing it back as a download with the new size shown next to the original. Because the whole pipeline runs in your browser tab, client footage, unreleased cuts and anything under NDA never leave your device, there's no upload bar reaching for the cloud, no queue behind other people's jobs, and, unlike most free watermarkers, no tool-branded stamp smuggled onto your result. It's honest about the trade-offs, too: WASM FFmpeg is single-threaded and memory-bound, so it's slower than a desktop app and happiest with files up to roughly a few hundred megabytes, and a text overlay uses the engine's bundled font rather than your system typefaces. A live progress bar shows exactly where the burn stands the whole way through, and closing the tab wipes every trace.",

  ctaText: "Add watermark",

  keywords: [
    "add watermark to video",
    "video watermark online",
    "watermark video free",
    "add logo to video",
    "watermark mp4 online",
    "put text on video",
    "brand video with logo",
    "video watermark no upload",
    "overlay logo on video",
    "add copyright to video",
    "watermark video in browser",
    "free video watermark no signup",
  ],

  seo: {
    title: "Add Watermark to Video Online, Free Text & Logo Watermarker | GigAI Tools",
    description:
      "Free online video watermarker: overlay a text caption or your logo, position it in any corner or the centre, set the opacity, and download. MP4, MOV, WebM & MKV: 100% in your browser, no uploads, no account.",
  },

  features: [
    {
      icon: "Type",
      title: "Text or logo overlay",
      description:
        "Stamp a caption (your name, handle, URL or a copyright line) or upload a logo image. Text mode adds font size, color and opacity control. Image mode composites a PNG, JPG, WebP or SVG straight onto the picture.",
    },
    {
      icon: "Move",
      title: "Corner or centre placement",
      description:
        "Pin the mark to any of the four corners or dead centre with a single click, and a live preview shows roughly where it will land before you burn it in. No guessing at coordinates.",
    },
    {
      icon: "Contrast",
      title: "Opacity you control",
      description:
        "Slide the watermark from a barely-there ghost that protects without distracting to a bold, unmistakable stamp. You choose how loudly the mark sits over your footage.",
    },
    {
      icon: "Gauge",
      title: "Honest live progress",
      description:
        "A determinate progress bar tracks the burn from start to finish, and a one-time note covers the first-run engine download. No endless spinner that leaves you wondering whether it stalled.",
    },
    {
      icon: "Download",
      title: "Preview, size delta & clean download",
      description:
        "Play the watermarked result before you save it and see the new file size next to the original, then download. No sign-up, no email, and no second watermark from us.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "A self-hosted FFmpeg WebAssembly core draws the overlay on your device. Your video and your logo are never uploaded, queued or stored, which makes it safe for personal, client and NDA footage alike.",
    },
  ],

  benefits: [
    {
      title: "Brand without leaking",
      description:
        "The usual way to watermark a clip online is to hand both the footage and your logo to a random server. Here the burn runs on your machine, so unreleased cuts, client work and confidential material never leave the tab.",
    },
    {
      title: "No watermark of ours, no account, no cap",
      description:
        "Free watermarkers love the irony of stamping their own logo onto your export or gating the download behind a sign-up. This one adds only the mark you asked for, cleanly, as often as you like.",
    },
    {
      title: "Protect and attribute in one pass",
      description:
        "A subtle overlay discourages re-uploads and casual theft while a corner logo or © line keeps your name on the work wherever the clip travels, deterrence and attribution from a single burn.",
    },
    {
      title: "Nothing to install",
      description:
        "No desktop editor, no plugin, no FFmpeg command line to memorise. Open the page in any modern browser and you're watermarking in seconds. It even keeps working offline once the engine has loaded.",
    },
  ],

  howTo: [
    {
      title: "Drop your video",
      description:
        "Drag an MP4, MOV, WebM or MKV onto the workspace, or click to browse. It's read and previewed locally: nothing is uploaded.",
    },
    {
      title: "Choose text or a logo",
      description:
        "Type your caption and set its size and color, or switch to logo mode and upload a PNG, JPG, WebP or SVG. A transparent PNG gives the cleanest badge.",
    },
    {
      title: "Position & set opacity",
      description:
        "Pin the mark to a corner or the centre and drag the opacity slider from a faint ghost to a solid stamp. The live preview shows roughly where it lands.",
    },
    {
      title: "Burn & preview",
      description:
        "Hit Add watermark and watch the progress bar. When it finishes, the branded clip plays back so you can confirm the mark before you save.",
    },
    {
      title: "Download",
      description:
        "Download the watermarked video, carrying only your mark, and check the new size against the original right there on the result card.",
    },
  ],

  formats: {
    input: ["MP4", "MOV", "WebM", "MKV", "AVI"],
    output: ["MP4", "WebM", "MKV"],
  },

  useCases: [
    {
      audience: "Content creator",
      title: "Stamp your handle on shorts",
      description:
        "Burn your @handle or channel name into the corner of a clip before you post it, so re-uploads still point back to you, without sending the raw file to a stranger's server first.",
    },
    {
      audience: "Freelancer / Agency",
      title: "Watermark client review cuts",
      description:
        "Overlay a semi-transparent 'DRAFT' or your studio logo on a work-in-progress edit before sharing it for approval, keeping unpaid or unreleased footage protected while it's out for review.",
    },
    {
      audience: "Photographer / Videographer",
      title: "Protect a portfolio reel",
      description:
        "Composite your logo onto a demo reel so screen-recorded copies still carry your brand, then swap the same overlay onto the delivered file at full opacity or remove it entirely.",
    },
    {
      audience: "Business / Marketer",
      title: "Brand a product demo",
      description:
        "Drop a corner logo onto a product walkthrough or webinar snippet so every clip that gets shared, embedded or re-cut keeps your name on screen. No editor licence required.",
    },
  ],

  troubleshooting: [
    {
      problem: "The first watermark is taking a while before the progress bar moves.",
      solution:
        "The very first run downloads the FFmpeg WebAssembly engine (a one-time fetch that's then cached). You'll see a 'loading engine' note during that step. Subsequent burns skip it and start immediately.",
    },
    {
      problem: "My logo's transparency turned into a solid box.",
      solution:
        "Use a PNG (or SVG) that actually carries an alpha channel: a JPG has no transparency, so its background shows as a rectangle. Export the logo as a transparent PNG and re-upload it. The tool preserves the alpha when it composites.",
    },
    {
      problem: "The text looks different from the font I use elsewhere.",
      solution:
        "Text overlays are drawn with the font bundled into the WebAssembly engine, not your system typefaces, so the exact letterforms may differ. If you need a specific brand font, render your wordmark as a transparent PNG and add it as a logo instead.",
    },
    {
      problem: "It slowed to a crawl or ran out of memory on a big file.",
      solution:
        "In-browser FFmpeg is single-threaded and works in your tab's memory, so long high-bitrate clips are demanding. Keep inputs loosely under a few hundred megabytes. On a huge file, trim or compress it first, then watermark the smaller result.",
    },
  ],

  tips: [
    "For attribution that survives cropping, place the mark near the centre or across a busy area rather than a corner a re-uploader can trim off.",
    "A transparent PNG at 60–80% opacity reads as a professional badge. Push it to full opacity only when you want the mark to be the point.",
    "Rendering your brand wordmark as a PNG and adding it as a logo gives you your exact font and colors, text mode uses the engine's built-in font.",
    "Watermark last in your pipeline: trim and compress first, then burn the mark onto the final, smallest version so the encode is faster.",
    "Keep inputs under a few hundred megabytes for the snappiest burn. The first run also downloads the engine once, so give watermark #1 a moment.",
  ],

  security:
    "Your video and your logo are read, previewed and watermarked entirely in your browser using a self-hosted FFmpeg WebAssembly core. Neither is ever uploaded to any server, queued, logged or stored. That makes the tool safe for personal recordings, client footage and anything under NDA. There's no account, and the only mark on your export is the one you added. We never stamp our own. Once the engine has loaded the tool keeps working offline, and closing the tab wipes every trace.",

  faq: [
    {
      question: "Is my video or logo uploaded to a server?",
      answer:
        "No. The watermarker runs a self-hosted build of FFmpeg compiled to WebAssembly, so reading, previewing and burning the overlay all happen on your own device inside the browser tab. Neither your footage nor your logo image is ever uploaded, queued behind other jobs, logged or stored, which is why there's no upload bar reaching out to the cloud. It's safe for personal, client and confidential clips.",
    },
    {
      question: "Does the tool add its own watermark to my video?",
      answer:
        "Never. The only mark on the clip you download is the text or logo you added yourself. There's no tool-branded stamp, no overlay we sneak on, no sign-up wall and no usage cap. Because the processing happens on your device, there's no per-file cost to us, so there's nothing to gate, a rarity among free watermarkers, which often stamp their own logo on your export.",
    },
    {
      question: "How large a video can I watermark in the browser?",
      answer:
        "Because everything runs in your tab's memory, the practical ceiling is your device's RAM rather than a fixed upload limit. As a loose rule, files up to roughly a few hundred megabytes are comfortable on a typical laptop. Very long or high-bitrate 4K clips can strain memory or slow down since the mark is drawn into every frame and the video is re-encoded. If a big file struggles, trim or compress it first and watermark the smaller result. A live progress bar always shows where the burn stands.",
    },
    {
      question: "What image formats can I use for a logo watermark?",
      answer:
        "PNG, JPG, WebP and SVG. A PNG (or SVG) with a transparent background gives the cleanest badge because its shape composites straight onto the picture. A JPG has no alpha channel, so its background will appear as a solid rectangle. For a brand mark, export a transparent PNG at a decent resolution and the tool preserves its edges and opacity when it overlays.",
    },
    {
      question: "Can I choose the font for a text watermark?",
      answer:
        "Text overlays are drawn with the font that's bundled into the WebAssembly engine, so you can set the size, color and opacity but not swap in an arbitrary system or brand typeface. If a specific font matters (a logotype, a licensed brand face) render that wordmark as a transparent PNG in your design tool and add it here as a logo watermark instead. That gives you pixel-exact control over the type.",
    },
    {
      question: "Will watermarking reduce my video's quality?",
      answer:
        "Drawing the overlay means the frames are re-encoded, which is technically lossy, but the tool targets a visually faithful encode: in normal viewing you won't spot a difference beyond the mark you added. The footage, resolution and frame rate are otherwise preserved. If you're chaining edits, watermark last so the clip is only re-encoded once at the end of your pipeline.",
    },
    {
      question: "Can I remove or move the watermark after downloading?",
      answer:
        "The burn is baked into the pixels of the exported file, so there's no hidden layer to toggle off later. The mark is part of the frames. To change its position, opacity or content, go back to your original (un-watermarked) video and export again with new settings. Keep that clean master around. It's the only way to re-watermark without stacking marks.",
    },
    {
      question: "Do I need to install anything or create an account?",
      answer:
        "No. There's nothing to download, no plugin and no sign-up. Open the page in any modern browser (Chrome, Edge, Firefox or Safari), drop a clip in, add your mark and export. The FFmpeg engine is fetched once on first use and cached, after which watermarking works on demand: including offline for a tool you've already opened.",
    },
  ],

  changelog: [
    {
      date: "2026-06-16",
      change:
        "Initial release, drag-and-drop input, live preview, text and logo watermark modes, corner/centre placement, opacity control, font size and color for text, in-browser FFmpeg WebAssembly burn, live progress, before/after size and a download that carries only your mark.",
    },
    {
      date: "2026-06-23",
      change:
        "Added a live placement preview that shows roughly where the mark lands, plus transparent-PNG alpha handling for logo overlays and clearer guidance on the bundled text font.",
    },
    {
      date: "2026-06-30",
      change:
        "Tightened large-file guidance so heavy clips warn before they start, and improved logo compositing so semi-transparent PNGs keep their edges cleanly.",
    },
  ],

  relatedTools: [
    "video-trimmer",
    "video-compressor",
    "video-crop",
    "video-converter",
  ],
};

export default videoWatermark;
