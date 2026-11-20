/**
 * "For [context]" landing pages at `/for/<slug>`.
 *
 * These target the highest-volume destination-specific transactional queries -
 * "resize image for Shopify", "compress image for WhatsApp", the commercial
 * intent class nothing else on the platform covers. The UNIQUE, non-thin value
 * of each page is the exact spec that destination needs (dimensions, max size,
 * format, aspect ratio) shown as a real specs table, plus platform-specific
 * tips. Each routes to the EXISTING tool that does the job.
 *
 * Deliberately covers destinations /solve does NOT (Shopify, LinkedIn, Amazon,
 * Etsy…), not Instagram/YouTube/passport which are already /solve pages.
 *
 * PURE DATA, client-safe. Tool slugs resolved by the SERVER page.
 * GLOBAL AUDIENCE: platform specs are worldwide; no region-specific framing.
 */
import type { AccentKey, FaqItem, HowToStep, IconName } from "@/types";

export const CONTEXT_GROUPS = [
  "Social media",
  "E-commerce",
  "Messaging",
  "Work & professional",
  "Website & web",
] as const;

export type ContextGroup = (typeof CONTEXT_GROUPS)[number];

/** One row of the destination's requirements table. */
export interface ContextSpec {
  label: string;
  value: string;
}

export interface ContextPage {
  slug: string;
  group: ContextGroup;
  /** The destination, e.g. "Shopify". */
  destination: string;
  /** Short card label. */
  label: string;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  icon: IconName;
  accent: AccentKey;
  /** Answer-first paragraph (~40–60 words) leading with the key spec. Speakable. */
  answer: string;
  intro: string;
  /** The requirements table: the unique, snippet-worthy value. */
  specs: ContextSpec[];
  steps: HowToStep[];
  /** Platform-specific tips. */
  tips: string[];
  primaryTool: string;
  tools: string[];
  /**
   * P5 spec-page fields: the moat is being demonstrably CURRENT. officialSource
   * links the platform's own documentation; lastVerified is shown on the page
   * and build warns when it ages past 180 days (see app/for/[slug]/page.tsx).
   * preset pre-configures the primary tool via query params, so the visitor
   * drops a file and gets a compliant output without touching a setting.
   */
  officialSource?: { label: string; url: string };
  lastVerified?: string;
  preset?: Record<string, string | number>;
  /** /solve problem slugs to cross-link. */
  relatedProblems: string[];
  /** Other /for slugs to cross-link. */
  relatedContexts: string[];
  faq: FaqItem[];
}

export const CONTEXT_PAGES: ContextPage[] = [
  /* ── Social media ────────────────────────────────────────────────────────── */
  {
    slug: "resize-image-for-linkedin",
    group: "Social media",
    destination: "LinkedIn",
    label: "LinkedIn image sizes",
    h1: "Resize an Image for LinkedIn",
    seoTitle: "LinkedIn Image Sizes 2026 + Free Resize Tool (Profile, Banner, Post)",
    seoDescription:
      "The exact LinkedIn image sizes (profile photo 400×400, banner 1584×396, shared post 1200×627) plus a free tool to crop and resize to fit. Private, in-browser.",
    keywords: [
      "linkedin image size",
      "linkedin banner size",
      "linkedin profile photo size",
      "resize image for linkedin",
      "linkedin post image size",
    ],
    icon: "Linkedin",
    accent: "sky",
    answer:
      "For LinkedIn, use 400×400px for your profile photo, 1584×396px for the background banner, and 1200×627px for a shared post or link image. Crop to the right aspect ratio first, then resize to those pixels so nothing important gets cut off. Our Crop and Resize tools do both in your browser.",
    intro:
      "Get your LinkedIn images crisp and correctly framed (profile, banner and posts) with the exact recommended dimensions.",
    specs: [
      { label: "Profile photo", value: "400 × 400 px (square, min 268×268)" },
      { label: "Background banner", value: "1584 × 396 px (4:1)" },
      { label: "Shared post / link image", value: "1200 × 627 px (1.91:1)" },
      { label: "Company logo", value: "300 × 300 px" },
    ],
    steps: [
      { title: "Pick the placement", description: "Profile 400×400, banner 1584×396, or shared post 1200×627: choose what you're updating." },
      { title: "Crop to the aspect ratio", description: "Use Crop Image to match the ratio (1:1 for profile, 4:1 for banner) so your subject sits inside the frame." },
      { title: "Resize to the exact pixels", description: "Set the target dimensions in Image Resizer so LinkedIn doesn't upscale a soft version." },
      { title: "Compress and upload", description: "Run a light compression so it uploads fast without visible quality loss." },
    ],
    tips: [
      "Keep your face centred and filling the frame in the profile photo. It displays as a small circle.",
      "The banner is heavily cropped on mobile. Keep key text and logos in the middle third.",
      "Link previews use 1200×627: set that image on your page's Open Graph tags so shared links look right.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["image-too-large", "make-a-favicon"],
    relatedContexts: ["resize-image-for-facebook", "resize-image-for-twitter"],
    faq: [
      { question: "What size is a LinkedIn banner?", answer: "1584×396 pixels, a 4:1 ratio. Keep important text and logos centred, since the edges are cropped differently on mobile and desktop." },
      { question: "What's the best LinkedIn profile photo size?", answer: "400×400 pixels (square). LinkedIn displays it as a circle, so centre your face and leave a little margin around it." },
    ],
  },
  {
    slug: "resize-image-for-facebook",
    group: "Social media",
    destination: "Facebook",
    label: "Facebook image sizes",
    h1: "Resize an Image for Facebook",
    seoTitle: "Facebook Image Sizes + Free Resize Tool (Cover, Post, Profile)",
    seoDescription:
      "The right Facebook image sizes (cover 820×312, shared post 1200×630, profile 320×320) with a free tool to crop and resize to fit. Private, in your browser.",
    keywords: [
      "facebook image size",
      "facebook cover photo size",
      "resize image for facebook",
      "facebook post size",
      "facebook profile picture size",
    ],
    icon: "Facebook",
    accent: "indigo",
    answer:
      "For Facebook, use 820×312px for a page cover photo, 1200×630px for a shared post or link image, and at least 320×320px for a profile picture. Crop to the ratio each placement needs, then resize to those pixels so Facebook doesn't crop or blur your image.",
    intro:
      "Cover photos, posts and profile pictures, the exact Facebook dimensions so your images display sharp and uncropped.",
    specs: [
      { label: "Page cover photo", value: "820 × 312 px (desktop)" },
      { label: "Shared post / link image", value: "1200 × 630 px (1.91:1)" },
      { label: "Profile picture", value: "320 × 320 px+ (square)" },
      { label: "Story", value: "1080 × 1920 px (9:16)" },
    ],
    steps: [
      { title: "Choose the placement", description: "Cover 820×312, post 1200×630, profile 320×320, or story 1080×1920." },
      { title: "Crop to the aspect ratio", description: "Match the ratio with Crop Image so the subject isn't chopped by Facebook's automatic crop." },
      { title: "Resize to the pixels", description: "Set the exact dimensions in Image Resizer for a crisp upload." },
      { title: "Compress and post", description: "Lightly compress so it loads fast. Facebook re-compresses, so start from a clean, correctly-sized image." },
    ],
    tips: [
      "The cover photo displays differently on mobile and desktop. Keep key content away from the edges.",
      "For link posts, set a 1200×630 Open Graph image on your site so shares show the right picture.",
      "Facebook aggressively compresses images. Uploading at the exact size (not larger) keeps quality highest.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["image-too-large", "resize-for-instagram"],
    relatedContexts: ["resize-image-for-linkedin", "resize-image-for-twitter"],
    faq: [
      { question: "What size is a Facebook cover photo?", answer: "820×312 pixels on desktop. Because it's cropped differently on mobile, keep important text and faces in the central area." },
      { question: "What size should a Facebook post image be?", answer: "1200×630 pixels (1.91:1) for shared links and posts: the same size works as your page's Open Graph image." },
    ],
  },
  {
    slug: "resize-image-for-twitter",
    group: "Social media",
    destination: "X (Twitter)",
    label: "X / Twitter image sizes",
    h1: "Resize an Image for X (Twitter)",
    seoTitle: "X (Twitter) Image Sizes + Free Resize Tool (Header, Post, Profile)",
    seoDescription:
      "The right X/Twitter image sizes (header 1500×500, post 1600×900, profile 400×400) with a free tool to crop and resize to fit. Private, in your browser.",
    keywords: [
      "twitter image size",
      "x header size",
      "twitter banner size",
      "resize image for twitter",
      "twitter post image size",
    ],
    icon: "Twitter",
    accent: "cyan",
    answer:
      "For X (Twitter), use 1500×500px for the header/banner, 1600×900px (16:9) for an in-post image, and 400×400px for the profile photo. Crop to each ratio first, then resize to the pixels so your image isn't awkwardly cropped in the timeline.",
    intro:
      "Header, posts and profile: the exact X (Twitter) dimensions so your images look sharp and frame correctly.",
    specs: [
      { label: "Header / banner", value: "1500 × 500 px (3:1)" },
      { label: "In-post image", value: "1600 × 900 px (16:9)" },
      { label: "Profile photo", value: "400 × 400 px (square)" },
    ],
    steps: [
      { title: "Choose the placement", description: "Header 1500×500, in-post 1600×900, or profile 400×400." },
      { title: "Crop to the aspect ratio", description: "Use Crop Image for the right ratio (3:1 header, 16:9 post, 1:1 profile)." },
      { title: "Resize to the pixels", description: "Set the exact dimensions in Image Resizer for a crisp result." },
      { title: "Compress and post", description: "Lightly compress so it uploads quickly without visible loss." },
    ],
    tips: [
      "The header is overlapped by your profile photo and text on the lower-left. Keep that corner clear.",
      "Single in-post images show best at 16:9. Portrait images get cropped in the timeline preview.",
      "Profile photos display as a circle, so centre the subject.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["image-too-large", "resize-for-instagram"],
    relatedContexts: ["resize-image-for-linkedin", "resize-image-for-facebook"],
    faq: [
      { question: "What size is an X (Twitter) header?", answer: "1500×500 pixels (3:1). Your profile photo and name overlap the lower-left, so keep that area free of important detail." },
      { question: "What's the best image size for a tweet?", answer: "1600×900 pixels (16:9) displays cleanly in the timeline without cropping." },
    ],
  },
  {
    slug: "resize-image-for-pinterest",
    group: "Social media",
    destination: "Pinterest",
    label: "Pinterest pin sizes",
    h1: "Resize an Image for Pinterest",
    seoTitle: "Pinterest Pin Size + Free Resize Tool (2:3 Ratio, 1000×1500)",
    seoDescription:
      "The ideal Pinterest pin size is 1000×1500px (2:3). Crop and resize any image to the perfect vertical pin in your browser, free and private, no sign-up.",
    keywords: [
      "pinterest pin size",
      "pinterest image size",
      "resize image for pinterest",
      "pinterest aspect ratio",
      "2:3 pin size",
    ],
    icon: "Image",
    accent: "rose",
    answer:
      "The ideal Pinterest pin is 1000×1500px, a 2:3 vertical ratio that fills the feed and gets the most visibility. Crop your image to 2:3 first, then resize to 1000×1500. Taller pins can be cut off, so stick to the 2:3 ratio. Our Crop and Resize tools do it in your browser.",
    intro:
      "Vertical pins win on Pinterest. Get the 2:3 ratio and the right pixels so your pin fills the feed.",
    specs: [
      { label: "Standard pin", value: "1000 × 1500 px (2:3)" },
      { label: "Aspect ratio", value: "2:3 (avoid taller. It gets cropped)" },
      { label: "Board cover", value: "600 × 600 px (square)" },
    ],
    steps: [
      { title: "Crop to 2:3", description: "Use Crop Image to set a 2:3 vertical ratio, the shape Pinterest favours." },
      { title: "Resize to 1000×1500", description: "Set those pixels in Image Resizer for a sharp, feed-filling pin." },
      { title: "Compress and upload", description: "Lightly compress so it loads fast. Keep it sharp for the tall format." },
    ],
    tips: [
      "Vertical 2:3 pins take up more screen space and typically get more saves than square or landscape.",
      "Avoid ratios taller than 2:3. The extra height gets cropped in the feed.",
      "Put any text overlay in the top two-thirds, where it's visible before a user taps in.",
    ],
    primaryTool: "crop-image",
    tools: ["crop-image", "image-resizer", "image-compressor"],
    relatedProblems: ["resize-for-instagram", "image-too-large"],
    relatedContexts: ["resize-image-for-facebook", "resize-image-for-etsy"],
    faq: [
      { question: "What is the best Pinterest pin size?", answer: "1000×1500 pixels, a 2:3 vertical ratio. It fills the feed and tends to get the most engagement. Avoid taller pins, which get cropped." },
      { question: "What aspect ratio does Pinterest use?", answer: "2:3 for standard pins. Square (1:1) works but takes less space. Anything taller than 2:3 is cropped in the feed." },
    ],
  },
  {
    slug: "resize-image-for-discord",
    group: "Social media",
    destination: "Discord",
    label: "Discord image sizes",
    h1: "Resize an Image for Discord",
    seoTitle: "Discord Image Sizes + Free Resize Tool (Avatar, Server Icon, Emoji)",
    seoDescription:
      "The right Discord sizes (avatar 128×128, server icon 512×512, custom emoji 128×128 under 256KB) with a free tool to resize and compress in your browser.",
    keywords: [
      "discord avatar size",
      "discord server icon size",
      "discord emoji size",
      "resize image for discord",
      "discord banner size",
    ],
    icon: "MessageSquare",
    accent: "violet",
    answer:
      "For Discord, use 128×128px for your avatar (displayed small, so keep it simple), 512×512px for a server icon, and 128×128px under 256KB for a custom emoji. Resize to the exact pixels and compress emoji under the size limit. Our Resize and Compress tools do it in your browser.",
    intro:
      "Avatars, server icons and custom emoji, the right Discord dimensions and the size limits that trip people up.",
    specs: [
      { label: "User avatar", value: "128 × 128 px (displays small)" },
      { label: "Server icon", value: "512 × 512 px" },
      { label: "Custom emoji", value: "128 × 128 px, under 256 KB" },
      { label: "Server banner", value: "960 × 540 px (16:9)" },
    ],
    steps: [
      { title: "Pick what you're making", description: "Avatar 128×128, server icon 512×512, emoji 128×128, or banner 960×540." },
      { title: "Crop square (or 16:9 for banner)", description: "Use Crop Image so the subject fills the frame: avatars and icons are circles/rounded." },
      { title: "Resize to the pixels", description: "Set the exact size in Image Resizer." },
      { title: "Compress emoji under 256KB", description: "Custom emoji must be under 256KB: run Compress if yours is over." },
    ],
    tips: [
      "Avatars display tiny: a bold, simple image reads far better than a detailed one.",
      "Custom emoji have a hard 256KB limit. A transparent PNG usually fits after compression.",
      "Use a transparent background so emoji and icons sit cleanly on any theme.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["make-a-favicon"],
    relatedContexts: ["resize-image-for-twitter", "compress-image-for-whatsapp"],
    faq: [
      { question: "What size is a Discord emoji?", answer: "128×128 pixels and under 256KB. Discord resizes it down in chat, but a transparent PNG at that size and limit looks cleanest." },
      { question: "What size is a Discord server icon?", answer: "512×512 pixels. It's displayed as a rounded square, so centre the subject and keep detail away from the corners." },
    ],
  },
  {
    slug: "compress-image-for-whatsapp",
    group: "Messaging",
    destination: "WhatsApp",
    label: "Image for WhatsApp",
    h1: "Compress an Image for WhatsApp",
    seoTitle: "Compress an Image for WhatsApp (Keep Quality), Free & Private",
    seoDescription:
      "WhatsApp compresses images hard. Resize and lightly compress first so your photo still looks sharp after sending, or send full quality as a document. Free, in-browser.",
    keywords: [
      "compress image for whatsapp",
      "whatsapp image size",
      "whatsapp dp size",
      "send image without losing quality whatsapp",
      "whatsapp status image size",
    ],
    icon: "MessageCircle",
    accent: "emerald",
    answer:
      "WhatsApp re-compresses every photo you send, which is why images arrive softer. To keep quality, resize to around 1600px on the long edge and compress lightly yourself before sending, or send the photo as a document to bypass WhatsApp's compression entirely. Both approaches start in your browser.",
    intro:
      "Tired of blurry WhatsApp photos? Prep the image the right way, or send it as a document to keep full quality.",
    specs: [
      { label: "Recommended long edge", value: "~1600 px (WhatsApp caps large images)" },
      { label: "Profile photo (DP)", value: "640 × 640 px (min 192×192)" },
      { label: "Status image", value: "1080 × 1920 px (9:16)" },
      { label: "Keep full quality", value: "Send as a document, not a photo" },
    ],
    steps: [
      { title: "Resize to a sensible size", description: "Set the long edge to about 1600px in Image Resizer: WhatsApp shrinks anything much bigger anyway." },
      { title: "Compress lightly yourself", description: "A gentle compression you control looks better than WhatsApp's aggressive one." },
      { title: "For a DP, crop square", description: "Crop to 640×640 for a clean profile photo." },
      { title: "Or send as a document", description: "To keep full resolution, attach the image as a document instead of a photo, WhatsApp won't re-compress it." },
    ],
    tips: [
      "Sending as a 'document' bypasses WhatsApp's compression, so the recipient gets your exact file.",
      "WhatsApp compresses large photos hard, resizing to ~1600px first avoids a double, ugly compression.",
      "For a status, use 1080×1920 (9:16) and keep text away from the very top and bottom.",
    ],
    primaryTool: "image-compressor",
    tools: ["image-compressor", "image-resizer", "crop-image", "webp-converter"],
    relatedProblems: ["image-too-large", "email-attachment-too-large"],
    relatedContexts: ["compress-image-for-website", "resize-image-for-facebook"],
    faq: [
      { question: "How do I send a photo on WhatsApp without losing quality?", answer: "Send it as a document rather than a photo, WhatsApp compresses photos but leaves documents untouched, so the recipient gets your exact file." },
      { question: "Why do my WhatsApp photos look blurry?", answer: "WhatsApp re-compresses every sent photo. Resizing to ~1600px and compressing lightly yourself first avoids the worst of the quality loss." },
    ],
  },

  /* ── E-commerce ──────────────────────────────────────────────────────────── */
  {
    slug: "resize-image-for-shopify",
    group: "E-commerce",
    destination: "Shopify",
    label: "Shopify product images",
    h1: "Resize an Image for Shopify",
    seoTitle: "Shopify Product Image Size + Free Resize Tool (2048×2048)",
    seoDescription:
      "Shopify recommends square product images at 2048×2048px. Crop to square, resize and compress for fast-loading, zoomable product photos, free, in your browser.",
    keywords: [
      "shopify image size",
      "shopify product image size",
      "resize image for shopify",
      "shopify photo dimensions",
      "shopify image resolution",
    ],
    icon: "ShoppingBag",
    accent: "emerald",
    answer:
      "Shopify recommends square product images at 2048×2048px, which enables zoom and looks consistent across your store. Crop to a 1:1 square, resize to 2048×2048, and compress so pages still load fast. Shopify accepts JPG, PNG and WebP up to 20 megapixels. Our tools do each step in your browser.",
    intro:
      "Consistent, zoomable Shopify product photos start with the right square size, and a compress step so the store stays fast.",
    specs: [
      { label: "Recommended size", value: "2048 × 2048 px (square, enables zoom)" },
      { label: "Aspect ratio", value: "1:1 (square, for a consistent grid)" },
      { label: "Max resolution", value: "20 megapixels (up to 4472×4472)" },
      { label: "Formats", value: "JPG, PNG, WebP" },
    ],
    steps: [
      { title: "Crop to a square", description: "Use Crop Image to make each product photo 1:1 so your collection grid stays uniform." },
      { title: "Resize to 2048×2048", description: "Set those pixels in Image Resizer, big enough for Shopify's zoom, not wastefully large." },
      { title: "Compress for speed", description: "Compress or convert to WebP so product pages load fast. Image weight is a top speed factor." },
    ],
    tips: [
      "Square 2048×2048 is the sweet spot: large enough for zoom, uniform across the grid, not so huge it slows the page.",
      "Use the same background and framing for every product so the collection looks professional.",
      "WebP is smaller than JPG at the same quality and is fully supported by Shopify, great for store speed.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["image-too-large"],
    relatedContexts: ["resize-image-for-amazon", "resize-image-for-etsy"],
    faq: [
      { question: "What size should Shopify product images be?", answer: "Square at 2048×2048 pixels. That resolution enables zoom, keeps your grid uniform, and stays reasonable for page speed once compressed." },
      { question: "What image format is best for Shopify?", answer: "WebP for the smallest size at good quality (fully supported), or JPG for photos. Use PNG only when you need transparency." },
    ],
  },
  {
    slug: "resize-image-for-amazon",
    group: "E-commerce",
    destination: "Amazon",
    label: "Amazon product images",
    h1: "Resize an Image for Amazon",
    seoTitle: "Amazon Product Image Size & Requirements + Free Resize Tool",
    seoDescription:
      "Amazon needs product images at least 1000px on the longest side (for zoom), on a pure white background, with the product filling 85% of the frame. Resize and prep free.",
    keywords: [
      "amazon image size",
      "amazon product image requirements",
      "resize image for amazon",
      "amazon main image white background",
      "amazon listing image size",
    ],
    icon: "Package",
    accent: "amber",
    answer:
      "Amazon requires product images at least 1000px on the longest side to enable zoom (1600px+ recommended), with the product filling about 85% of the frame. The main image must be on a pure white background (RGB 255,255,255). Crop, resize and compress: all in your browser.",
    intro:
      "Meet Amazon's strict main-image rules (1000px+, pure white background, product filling the frame) so your listing qualifies for zoom.",
    specs: [
      { label: "Minimum longest side", value: "1000 px (enables zoom. 1600px+ better)" },
      { label: "Main image background", value: "Pure white (RGB 255,255,255)" },
      { label: "Product coverage", value: "~85% of the frame" },
      { label: "Format", value: "JPG (preferred), PNG, max 10000px" },
    ],
    steps: [
      { title: "Use a clean white backdrop", description: "Shoot or place the product on a pure-white background for the main image, as Amazon requires." },
      { title: "Crop so the product fills ~85%", description: "Crop tight so the product occupies most of the frame, as Amazon requires." },
      { title: "Resize to 1600px+", description: "Set the longest side to at least 1000px (1600px+ recommended) so zoom activates." },
      { title: "Compress and upload", description: "Compress to a reasonable size while keeping it sharp for zoom." },
    ],
    tips: [
      "The main image must be a pure-white background with no text, logos or props: those get listings suppressed.",
      "Images under 1000px on the longest side don't get the zoom feature, which reduces conversions.",
      "Additional (secondary) images can show lifestyle shots and infographics. Only the main image is strict.",
    ],
    primaryTool: "crop-image",
    tools: ["crop-image", "image-resizer", "image-compressor"],
    relatedProblems: ["image-too-large"],
    relatedContexts: ["resize-image-for-shopify", "resize-image-for-ebay"],
    faq: [
      { question: "What are Amazon's main image requirements?", answer: "At least 1000px on the longest side (for zoom), a pure-white background, the product filling about 85% of the frame, and no text, logos or extra props." },
      { question: "Why isn't zoom working on my Amazon listing?", answer: "The image is under 1000px on its longest side. Resize it to 1000px+ (1600px is a safe target) and zoom will activate." },
    ],
  },
  {
    slug: "resize-image-for-etsy",
    group: "E-commerce",
    destination: "Etsy",
    label: "Etsy listing images",
    h1: "Resize an Image for Etsy",
    seoTitle: "Etsy Listing Image Size + Free Resize Tool (2000px, 4:3)",
    seoDescription:
      "Etsy recommends listing images at least 2000px on the shortest side, ideally a 4:3 landscape thumbnail. Crop, resize and compress your photos free, in your browser.",
    keywords: [
      "etsy image size",
      "etsy listing photo size",
      "resize image for etsy",
      "etsy thumbnail ratio",
      "etsy photo dimensions",
    ],
    icon: "ShoppingBag",
    accent: "orange",
    answer:
      "Etsy recommends listing photos at least 2000px on the shortest side for crisp zoom, and a 4:3 landscape ratio for the thumbnail (which crops other ratios). Crop your main photo to 4:3, resize so the short side is 2000px+, and compress. Our tools do each step in your browser.",
    intro:
      "Sharp, zoomable Etsy photos with a thumbnail that isn't awkwardly cropped: the right size and ratio make the difference.",
    specs: [
      { label: "Recommended size", value: "2000 px+ on the shortest side" },
      { label: "Thumbnail ratio", value: "4:3 landscape (others get cropped)" },
      { label: "Max file size", value: "Under ~20 MB per image" },
      { label: "Formats", value: "JPG, PNG" },
    ],
    steps: [
      { title: "Crop the main photo to 4:3", description: "Etsy crops the thumbnail to 4:3 landscape: crop it yourself so nothing important is lost." },
      { title: "Resize to 2000px+ short side", description: "Set the shortest side to at least 2000px in Image Resizer so zoom looks crisp." },
      { title: "Brighten and clean up", description: "A plain or lifestyle background helps. Crop out distracting clutter if needed." },
      { title: "Compress and upload", description: "Compress so it stays under the size limit while keeping detail for zoom." },
    ],
    tips: [
      "Make your first photo a clean 4:3 shot. It becomes the thumbnail that decides whether shoppers click.",
      "Large images (2000px+) look best with Etsy's zoom, which buyers rely on for handmade and vintage detail.",
      "Use all photo slots: main product, scale, detail, and in-use shots convert better than one angle.",
    ],
    primaryTool: "crop-image",
    tools: ["crop-image", "image-resizer", "image-compressor"],
    relatedProblems: ["image-too-large"],
    relatedContexts: ["resize-image-for-shopify", "resize-image-for-pinterest"],
    faq: [
      { question: "What size should Etsy photos be?", answer: "At least 2000px on the shortest side for crisp zoom. Crop your main photo to 4:3 landscape so the thumbnail isn't cropped awkwardly." },
      { question: "What ratio does Etsy use for thumbnails?", answer: "4:3 landscape. Photos in other ratios get cropped to fit, so frame your first image with that in mind." },
    ],
  },
  {
    slug: "resize-image-for-ebay",
    group: "E-commerce",
    destination: "eBay",
    label: "eBay listing images",
    h1: "Resize an Image for eBay",
    seoTitle: "eBay Image Size + Free Resize Tool (1600px, Zoom Requirement)",
    seoDescription:
      "eBay recommends listing photos at 1600px on the longest side to enable zoom (min 500px). Crop, resize and compress your product photos free, in your browser.",
    keywords: [
      "ebay image size",
      "ebay photo requirements",
      "resize image for ebay",
      "ebay listing image size",
      "ebay zoom image size",
    ],
    icon: "Tag",
    accent: "sky",
    answer:
      "eBay recommends listing photos at 1600px on the longest side to enable zoom and enlarge (the minimum is 500px). Crop out clutter, resize the longest side to 1600px, and compress. eBay allows up to 12 photos per listing, so use several angles. Our tools do each step in your browser.",
    intro:
      "Get eBay's zoom feature and sharp listing photos, the right longest-side size plus a clean crop is all it takes.",
    specs: [
      { label: "Recommended longest side", value: "1600 px (enables zoom)" },
      { label: "Minimum longest side", value: "500 px" },
      { label: "Photos per listing", value: "Up to 12 (free)" },
      { label: "Formats", value: "JPG, PNG" },
    ],
    steps: [
      { title: "Crop out the clutter", description: "Crop tight so the item fills the frame, on a plain background where possible." },
      { title: "Resize to 1600px long side", description: "Set the longest side to 1600px in Image Resizer so zoom and enlarge work." },
      { title: "Use multiple angles", description: "eBay allows up to 12 photos: prep front, back, detail and any flaws honestly." },
      { title: "Compress and upload", description: "Compress to a reasonable size while keeping detail sharp for zoom." },
    ],
    tips: [
      "Photos with the longest side at 1600px+ unlock eBay's zoom, which buyers use to inspect condition.",
      "A plain, well-lit background makes used items look trustworthy: remove distracting clutter.",
      "Show genuine flaws in extra photos. It reduces disputes and returns.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["image-too-large"],
    relatedContexts: ["resize-image-for-amazon", "resize-image-for-shopify"],
    faq: [
      { question: "What size should eBay photos be?", answer: "1600px on the longest side to enable zoom (the minimum is 500px). Larger, sharper photos help buyers judge condition and reduce returns." },
      { question: "How many photos can I add to an eBay listing?", answer: "Up to 12 free per listing. Use them for multiple angles, close-ups of detail, and honest shots of any flaws." },
    ],
  },
  {
    slug: "resize-image-for-wordpress",
    group: "Website & web",
    destination: "WordPress",
    label: "WordPress images",
    h1: "Resize an Image for WordPress",
    seoTitle: "Resize & Compress Images for WordPress, Free (Faster Pages)",
    seoDescription:
      "Big images slow WordPress sites. Resize to the display width (1200–2048px), compress and convert to WebP for fast pages and better SEO: free, in your browser.",
    keywords: [
      "resize image for wordpress",
      "wordpress image size",
      "compress image for wordpress",
      "wordpress featured image size",
      "wordpress webp",
    ],
    icon: "Globe",
    accent: "indigo",
    answer:
      "Uploading full-resolution photos is the top cause of slow WordPress sites. Resize each image to the width it actually displays at (usually 1200–2048px), compress it, and convert to WebP for the smallest size. A featured image of 1200×628px works well. Our Resize, Compress and WebP tools do it in your browser.",
    intro:
      "Faster WordPress pages start before upload: resize to display size, compress, and use WebP, better speed and SEO.",
    specs: [
      { label: "Content image width", value: "1200–2048 px (match your theme)" },
      { label: "Featured image", value: "1200 × 628 px (also used for sharing)" },
      { label: "Best format", value: "WebP (smaller than JPG/PNG at same quality)" },
      { label: "Target file size", value: "Under ~150 KB where possible" },
    ],
    steps: [
      { title: "Resize to the display width", description: "Set the width to what your theme actually shows (often 1200–2048px), uploading a 6000px phone photo just slows the page." },
      { title: "Compress the image", description: "Run Image Compressor so each image is light without visible quality loss." },
      { title: "Convert to WebP", description: "WebP is markedly smaller than JPG/PNG at the same quality and is supported everywhere modern." },
      { title: "Upload the optimized file", description: "Add the resized, compressed WebP to your media library, pages load faster and Core Web Vitals improve." },
    ],
    tips: [
      "Image weight is usually the biggest slowdown on WordPress, fixing it improves Core Web Vitals and SEO.",
      "Resize before upload. Relying only on the theme to scale still ships the giant original to visitors.",
      "The featured image (1200×628) doubles as the social share image via Open Graph.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "image-compressor", "webp-converter", "crop-image"],
    relatedProblems: ["image-too-large", "convert-webp-to-jpg", "audit-page-seo"],
    relatedContexts: ["compress-image-for-website", "resize-image-for-shopify"],
    faq: [
      { question: "What size should images be for WordPress?", answer: "Resize to the width they actually display at, usually 1200–2048px for content, 1200×628 for a featured image. Uploading full-resolution photos just slows the site." },
      { question: "Should I use WebP on WordPress?", answer: "Yes: WebP is significantly smaller than JPG/PNG at the same quality and speeds up your pages, which helps Core Web Vitals and SEO." },
    ],
  },
  {
    slug: "compress-image-for-website",
    group: "Website & web",
    destination: "a website",
    label: "Images for the web",
    h1: "Compress an Image for a Website",
    seoTitle: "Compress Images for a Website, Free, for Faster Pages",
    seoDescription:
      "Heavy images slow websites and hurt SEO. Resize to display size, compress under ~100KB, and convert to WebP for fast-loading pages, free and private, in your browser.",
    keywords: [
      "compress image for website",
      "optimize images for web",
      "image size for website",
      "web image compression",
      "webp for website",
    ],
    icon: "Gauge",
    accent: "emerald",
    answer:
      "To speed up a website, optimize each image: resize it to the exact size it displays at, compress it toward roughly 100KB, and serve WebP for the smallest file at good quality. Images are usually a page's heaviest asset, so this directly improves load time and Core Web Vitals. Our tools do each step in your browser.",
    intro:
      "Images are the biggest thing slowing most pages. Resize, compress and WebP them so your site loads fast and ranks better.",
    specs: [
      { label: "Target size", value: "Under ~100–200 KB per image" },
      { label: "Dimensions", value: "Match the display size (don't ship 4000px)" },
      { label: "Best format", value: "WebP (or AVIF) for photos and graphics" },
      { label: "Bonus", value: "Lazy-load below-the-fold images" },
    ],
    steps: [
      { title: "Resize to display size", description: "Set the pixels to what the browser actually renders: a hero at 1600px wide, thumbnails much smaller." },
      { title: "Compress toward ~100KB", description: "Use Image Compressor to trim weight. Most photos reach ~100KB with no visible loss." },
      { title: "Convert to WebP", description: "WebP is 25–35% smaller than JPG/PNG at the same quality, the single biggest easy win for speed." },
      { title: "Ship and measure", description: "Upload the optimized images and check your page speed and Core Web Vitals improve." },
    ],
    tips: [
      "Images are typically the heaviest part of a page, optimizing them beats almost any other speed tweak.",
      "Never ship a 4000px photo into a 600px slot. The browser downloads the whole thing then shrinks it.",
      "Serve WebP (with a JPG fallback if you support very old browsers) and lazy-load anything below the fold.",
    ],
    primaryTool: "image-compressor",
    tools: ["image-compressor", "image-resizer", "webp-converter", "crop-image"],
    relatedProblems: ["image-too-large", "convert-webp-to-jpg", "audit-page-seo"],
    relatedContexts: ["resize-image-for-wordpress", "resize-image-for-shopify"],
    faq: [
      { question: "How small should website images be?", answer: "Aim for under ~100–200KB each. Resize to the display size and compress. Most photos hit that with no visible quality loss." },
      { question: "What's the best image format for the web?", answer: "WebP (or AVIF): both are much smaller than JPG/PNG at the same quality, which speeds up pages and helps SEO." },
    ],
  },

  /* ── Social media (batch 2) ──────────────────────────────────────────────── */
  {
    slug: "resize-image-for-youtube-banner",
    group: "Social media",
    destination: "YouTube",
    label: "YouTube channel banner",
    h1: "Resize an Image for a YouTube Banner",
    seoTitle: "YouTube Banner Size + Free Resize Tool (2560×1440, Safe Area)",
    seoDescription:
      "The YouTube channel banner is 2560×1440px, but only the central 1546×423 'safe area' shows on all devices. Crop and resize your banner to fit, free, in your browser.",
    keywords: [
      "youtube banner size",
      "youtube channel art size",
      "2560x1440 banner",
      "youtube banner safe area",
      "resize youtube banner",
    ],
    icon: "Youtube",
    accent: "rose",
    answer:
      "A YouTube channel banner should be 2560×1440px, but only the central 1546×423px 'safe area' is guaranteed to show on every device (TV, desktop, mobile). Keep your logo and text inside that safe zone, then export at 2560×1440 under 6MB. Our Crop and Resize tools do it in your browser.",
    intro:
      "The YouTube banner shows differently on TV, desktop and phone, get the full size right and keep your text in the safe area.",
    specs: [
      { label: "Full banner size", value: "2560 × 1440 px (16:9)" },
      { label: "Safe area (all devices)", value: "1546 × 423 px (centred)" },
      { label: "Max file size", value: "6 MB" },
      { label: "Channel profile photo", value: "800 × 800 px" },
    ],
    steps: [
      { title: "Design at 2560×1440", description: "Build the full banner at this size, it's what TVs and wide desktops display." },
      { title: "Keep text in the safe area", description: "Put your logo, name and key text inside the central 1546×423px zone so mobile doesn't crop them." },
      { title: "Resize and check the size", description: "Export at 2560×1440 and keep it under 6MB with Image Compressor if needed." },
      { title: "Upload and preview", description: "Preview across devices in YouTube's uploader before saving." },
    ],
    tips: [
      "Only the 1546×423 centre is visible on all devices. Everything outside can be cropped on mobile.",
      "The right side is often covered by nothing on desktop but shows on TV. Keep it clean.",
      "Match your banner, profile photo and thumbnails for a consistent channel brand.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["youtube-thumbnail", "image-too-large"],
    relatedContexts: ["resize-image-for-twitch", "resize-image-for-tiktok"],
    faq: [
      { question: "What size is a YouTube banner?", answer: "2560×1440 pixels, but only the central 1546×423px safe area shows on every device. Keep text and logos inside that zone." },
      { question: "Why is my YouTube banner getting cropped?", answer: "Different devices show different amounts of the 2560×1440 image. Only the 1546×423 centre is safe. Put important content there." },
    ],
  },
  {
    slug: "resize-image-for-tiktok",
    group: "Social media",
    destination: "TikTok",
    label: "TikTok sizes",
    h1: "Resize an Image or Video for TikTok",
    seoTitle: "TikTok Size + Free Resize Tool (1080×1920, 9:16)",
    seoDescription:
      "TikTok is vertical 9:16, 1080×1920px for full-screen content and a 200×200 profile photo. Crop and resize your image to fit the feed: free, in your browser.",
    keywords: [
      "tiktok size",
      "resize image for tiktok",
      "tiktok profile picture size",
      "tiktok photo size",
    ],
    icon: "Music2",
    accent: "violet",
    answer:
      "TikTok is fully vertical: 1080×1920px (9:16) fills the screen for images and video covers, and the profile photo is 200×200px. Crop to 9:16 so nothing important sits under the on-screen buttons on the right and bottom. Our Crop and Resize tools set it up in your browser.",
    intro:
      "TikTok is vertical-first. Get the 9:16 frame right and keep your subject clear of the UI overlay.",
    specs: [
      { label: "Full-screen image / cover", value: "1080 × 1920 px (9:16)" },
      { label: "Aspect ratio", value: "9:16 (vertical)" },
      { label: "Profile photo", value: "200 × 200 px (displays small)" },
    ],
    steps: [
      { title: "Crop to 9:16", description: "Use Crop Image for a 1080×1920 vertical frame, the shape TikTok fills." },
      { title: "Keep clear of the UI", description: "The right side (buttons) and bottom (caption) are overlaid. Keep key content centred and higher up." },
      { title: "Resize and export", description: "Set 1080×1920 in Image Resizer and compress lightly for a fast upload." },
    ],
    tips: [
      "The right-hand icons and bottom caption cover part of the frame. Keep faces and text away from those edges.",
      "A bold, simple profile photo reads best since it displays very small.",
      "Vertical 9:16 is essential. Square or landscape gets letterboxed and looks unprofessional.",
    ],
    primaryTool: "crop-image",
    tools: ["crop-image", "image-resizer", "image-compressor"],
    relatedProblems: ["resize-for-instagram", "image-too-large"],
    relatedContexts: ["resize-image-for-youtube-banner", "resize-image-for-pinterest", "tiktok-video-size"],
    faq: [
      { question: "What size is TikTok?", answer: "1080×1920 pixels, a 9:16 vertical ratio, for full-screen content. The profile photo is 200×200px." },
      { question: "What aspect ratio does TikTok use?", answer: "9:16 vertical. Square or landscape images get letterboxed, so crop to 9:16 to fill the screen." },
    ],
  },
  {
    slug: "resize-image-for-twitch",
    group: "Social media",
    destination: "Twitch",
    label: "Twitch sizes",
    h1: "Resize an Image for Twitch",
    seoTitle: "Twitch Image Sizes + Free Resize Tool (Banner, Panels, Offline)",
    seoDescription:
      "The right Twitch sizes (profile banner 1200×480, offline screen 1920×1080, profile 256×256, panels 320×100) with a free tool to crop and resize. In your browser.",
    keywords: [
      "twitch banner size",
      "twitch panel size",
      "twitch offline screen size",
      "resize image for twitch",
      "twitch profile picture size",
    ],
    icon: "Twitch",
    accent: "indigo",
    answer:
      "For Twitch, use 1200×480px for the profile banner, 1920×1080px for the offline/video screen, 256×256px for the profile picture, and about 320×100px for channel panels. Crop and resize each to its exact size for a clean, professional channel. Our tools do it in your browser.",
    intro:
      "Banner, offline screen, profile and panels, the exact Twitch dimensions so your channel looks polished.",
    specs: [
      { label: "Profile banner", value: "1200 × 480 px" },
      { label: "Offline / video screen", value: "1920 × 1080 px (16:9)" },
      { label: "Profile picture", value: "256 × 256 px" },
      { label: "Channel panel", value: "320 × 100 px (width fixed)" },
    ],
    steps: [
      { title: "Pick the element", description: "Banner 1200×480, offline screen 1920×1080, profile 256×256, or a panel 320px wide." },
      { title: "Crop to the ratio", description: "Match each element's shape with Crop Image so nothing important is cut." },
      { title: "Resize to the pixels", description: "Set the exact size in Image Resizer for a crisp result." },
      { title: "Compress and upload", description: "Compress so assets load fast without visible quality loss." },
    ],
    tips: [
      "Panels are a fixed 320px wide, design them to that width so text stays sharp.",
      "The offline screen (1920×1080) is prime real estate. Add your schedule and socials there.",
      "Keep a consistent color scheme across banner, panels and profile for a branded channel.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["image-too-large", "make-a-favicon"],
    relatedContexts: ["resize-image-for-youtube-banner", "resize-image-for-discord"],
    faq: [
      { question: "What size is a Twitch banner?", answer: "The profile banner is 1200×480 pixels. The offline/video screen is 1920×1080, and the profile picture is 256×256." },
      { question: "What size are Twitch panels?", answer: "About 320×100 pixels: the width is fixed at 320px, so design to that so your panel text stays crisp." },
    ],
  },
  {
    slug: "resize-image-for-reddit",
    group: "Social media",
    destination: "Reddit",
    label: "Reddit sizes",
    h1: "Resize an Image for Reddit",
    seoTitle: "Reddit Image Sizes + Free Resize Tool (Banner, Post, Icon)",
    seoDescription:
      "The right Reddit sizes (community banner 1920×384, community icon 256×256, and posts up to 1200px wide) with a free tool to crop and resize. Private, in your browser.",
    keywords: [
      "reddit banner size",
      "reddit image size",
      "subreddit banner size",
      "resize image for reddit",
      "reddit icon size",
    ],
    icon: "MessageSquare",
    accent: "orange",
    answer:
      "For Reddit, a community banner is 1920×384px, the community icon is 256×256px, and post images display best up to 1200px wide. Crop the banner to its wide ratio and resize each element to its exact size. Our Crop and Resize tools do it in your browser.",
    intro:
      "Community banner, icon and post images, the right Reddit dimensions so your subreddit and posts look sharp.",
    specs: [
      { label: "Community banner", value: "1920 × 384 px (desktop)" },
      { label: "Community icon", value: "256 × 256 px" },
      { label: "Post image", value: "Up to 1200 px wide" },
    ],
    steps: [
      { title: "Pick the element", description: "Community banner 1920×384, icon 256×256, or a post image up to 1200px wide." },
      { title: "Crop to the ratio", description: "The banner is very wide: crop to it so key content isn't lost on mobile." },
      { title: "Resize and compress", description: "Set the exact pixels in Image Resizer and compress for a fast load." },
    ],
    tips: [
      "The banner is much shorter on mobile. Keep important content centred.",
      "Post images over 1200px wide are downscaled. Export at ~1200 for the sharpest display.",
      "A simple, recognisable icon helps your community stand out in feeds.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["image-too-large", "make-a-favicon"],
    relatedContexts: ["resize-image-for-discord", "resize-image-for-twitch"],
    faq: [
      { question: "What size is a Reddit banner?", answer: "A community (subreddit) banner is 1920×384 pixels on desktop. Keep key content centred, as it's cropped shorter on mobile." },
      { question: "What size should Reddit post images be?", answer: "Up to 1200px wide displays best. Larger images are downscaled. The community icon is 256×256." },
    ],
  },

  /* ── Messaging (batch 2) ─────────────────────────────────────────────────── */
  {
    slug: "resize-image-for-telegram",
    group: "Messaging",
    destination: "Telegram",
    label: "Telegram sizes",
    h1: "Resize an Image for Telegram",
    seoTitle: "Telegram Image Sizes + Free Resize Tool (Profile, Channel)",
    seoDescription:
      "Telegram profile and channel photos are 512×512px (square). Crop and resize your image to a clean square for a crisp Telegram avatar: free and private, in your browser.",
    keywords: [
      "telegram profile picture size",
      "telegram channel photo size",
      "resize image for telegram",
      "telegram avatar size",
      "telegram image size",
    ],
    icon: "Send",
    accent: "sky",
    answer:
      "Telegram profile pictures and channel/group photos are 512×512px (square). Telegram displays them as a circle, so crop to a square and centre your subject before resizing to 512×512. Our Crop and Resize tools do it in your browser. No upload.",
    intro:
      "Profile, channel and group photos: get the clean 512×512 square that Telegram displays as a crisp circle.",
    specs: [
      { label: "Profile / channel photo", value: "512 × 512 px (square)" },
      { label: "Display shape", value: "Circle (centre your subject)" },
      { label: "Shared photo long edge", value: "~1280 px (Telegram compresses larger)" },
    ],
    steps: [
      { title: "Crop to a square", description: "Use Crop Image for a 1:1 square and centre your subject, it's shown as a circle." },
      { title: "Resize to 512×512", description: "Set those pixels in Image Resizer for a crisp avatar." },
      { title: "Compress and upload", description: "Compress lightly. Telegram re-compresses shared photos, so start clean." },
    ],
    tips: [
      "Profile photos display as a circle. Keep faces and logos centred with a little margin.",
      "To send a photo at full quality, attach it as a file rather than a compressed photo.",
      "Keep channel branding consistent with your other platforms.",
    ],
    primaryTool: "crop-image",
    tools: ["crop-image", "image-resizer", "image-compressor"],
    relatedProblems: ["image-too-large", "email-attachment-too-large"],
    relatedContexts: ["compress-image-for-whatsapp", "resize-image-for-discord"],
    faq: [
      { question: "What size is a Telegram profile picture?", answer: "512×512 pixels (square). Telegram shows it as a circle, so centre your subject and leave a little margin." },
      { question: "How do I send a Telegram photo without losing quality?", answer: "Attach it as a file instead of a compressed photo, Telegram won't re-compress files, so the recipient gets your exact image." },
    ],
  },

  /* ── Work & professional ─────────────────────────────────────────────────── */
  {
    slug: "resize-image-for-google-business",
    group: "Work & professional",
    destination: "Google Business Profile",
    label: "Google Business photos",
    h1: "Resize an Image for a Google Business Profile",
    seoTitle: "Google Business Profile Image Sizes + Free Resize Tool",
    seoDescription:
      "Google Business Profile wants a 720×720 logo, a 1080×608 cover, and post photos at 1200×900 (min 720×720). Crop and resize to fit for a polished listing: free, in-browser.",
    keywords: [
      "google business profile image size",
      "google my business photo size",
      "resize image for google business",
      "gbp cover photo size",
      "google business logo size",
    ],
    icon: "Store",
    accent: "emerald",
    answer:
      "Google Business Profile recommends a 720×720px logo, a 1080×608px cover photo (16:9), and post/gallery photos at 1200×900px, with a 720×720px minimum. Crop each to its ratio and resize so your listing looks sharp on Search and Maps. Our tools do it in your browser.",
    intro:
      "Logo, cover and post photos, the right Google Business sizes so your listing looks professional on Search and Maps.",
    specs: [
      { label: "Logo", value: "720 × 720 px (square, min 250×250)" },
      { label: "Cover photo", value: "1080 × 608 px (16:9)" },
      { label: "Post / gallery photo", value: "1200 × 900 px (4:3, min 720×720)" },
      { label: "Format", value: "JPG or PNG" },
    ],
    steps: [
      { title: "Pick the placement", description: "Logo 720×720, cover 1080×608, or a post/gallery photo 1200×900." },
      { title: "Crop to the ratio", description: "Square for the logo, 16:9 for the cover, 4:3 for posts. Crop so nothing key is lost." },
      { title: "Resize to the pixels", description: "Set the exact size in Image Resizer. Stay above the 720×720 minimum." },
      { title: "Compress and upload", description: "Compress so photos load fast on Search and Maps." },
    ],
    tips: [
      "Real, well-lit photos of your business, staff and products build far more trust than stock images.",
      "The cover photo is what Google often shows first. Make it your strongest shot.",
      "Keep the logo simple and centred. It appears small next to your business name.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["image-too-large", "make-a-favicon"],
    relatedContexts: ["resize-image-for-linkedin", "compress-image-for-website"],
    faq: [
      { question: "What size photos does Google Business Profile use?", answer: "A 720×720 logo, a 1080×608 cover (16:9), and post/gallery photos at 1200×900 (4:3), with a 720×720 minimum for uploads." },
      { question: "What makes a good Google Business photo?", answer: "Real, well-lit shots of your storefront, team and products at the recommended sizes. They build trust and are shown on Search and Maps." },
    ],
  },
  {
    slug: "resize-image-for-zoom-background",
    group: "Work & professional",
    destination: "Zoom",
    label: "Zoom virtual background",
    h1: "Resize an Image for a Zoom Background",
    seoTitle: "Zoom Virtual Background Size + Free Resize Tool (1920×1080)",
    seoDescription:
      "A Zoom virtual background should be 1920×1080px (16:9) to fill the frame crisply. Crop and resize any photo to a clean HD background: free and private, in your browser.",
    keywords: [
      "zoom background size",
      "zoom virtual background dimensions",
      "resize image for zoom background",
      "1920x1080 zoom background",
      "zoom background resolution",
    ],
    icon: "Video",
    accent: "cyan",
    answer:
      "A Zoom virtual background should be 1920×1080px, a 16:9 ratio that fills the video frame crisply (the minimum is 1280×720). Crop your image to 16:9 and resize to 1920×1080 so it isn't stretched or cropped on the call. Our Crop and Resize tools do it in your browser.",
    intro:
      "Get a crisp, professional Zoom background that fills the frame: the right 16:9 size stops it stretching or blurring.",
    specs: [
      { label: "Recommended size", value: "1920 × 1080 px (16:9)" },
      { label: "Minimum", value: "1280 × 720 px" },
      { label: "Aspect ratio", value: "16:9 (matches the video frame)" },
      { label: "Format", value: "JPG or PNG" },
    ],
    steps: [
      { title: "Crop to 16:9", description: "Use Crop Image for a 16:9 frame so the background matches Zoom's video shape." },
      { title: "Resize to 1920×1080", description: "Set those pixels in Image Resizer for a crisp, full-frame background." },
      { title: "Compress and use it", description: "Compress lightly so it loads quickly, then set it in Zoom's background settings." },
    ],
    tips: [
      "16:9 at 1920×1080 matches the webcam frame, so the image isn't stretched or cropped.",
      "Choose an image that isn't too busy: a calm background keeps you the focus.",
      "Mirror any text in the image, since Zoom can flip your self-view.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor"],
    relatedProblems: ["image-too-large"],
    relatedContexts: ["resize-image-for-powerpoint", "resize-image-for-google-business"],
    faq: [
      { question: "What size should a Zoom background be?", answer: "1920×1080 pixels (16:9) is ideal. The minimum is 1280×720. That ratio matches the video frame so the image fills it without stretching." },
      { question: "Why does my Zoom background look stretched?", answer: "It isn't 16:9. Crop it to a 16:9 ratio and resize to 1920×1080 so it matches the webcam frame exactly." },
    ],
  },
  {
    slug: "resize-image-for-powerpoint",
    group: "Work & professional",
    destination: "PowerPoint",
    label: "Presentation slides",
    h1: "Resize an Image for PowerPoint",
    seoTitle: "Image Size for PowerPoint & Slides + Free Resize Tool (16:9)",
    seoDescription:
      "Modern slides are 1920×1080px (16:9). Resize a full-slide image to that, and compress photos so your deck isn't a huge file. Free and private, in your browser.",
    keywords: [
      "image size for powerpoint",
      "powerpoint slide size",
      "resize image for slides",
      "16:9 slide size",
      "compress powerpoint images",
    ],
    icon: "Presentation",
    accent: "amber",
    answer:
      "Modern PowerPoint and Google Slides are 16:9 widescreen, 1920×1080px. Resize a full-slide background image to 1920×1080, and compress your photos so the whole deck doesn't balloon into a huge file that's slow to open and email. Our Resize and Compress tools do it in your browser.",
    intro:
      "Full-slide images at the right size, and a lighter deck that emails easily: the two things that keep presentations sharp.",
    specs: [
      { label: "Widescreen slide (16:9)", value: "1920 × 1080 px" },
      { label: "Standard slide (4:3)", value: "1024 × 768 px (older decks)" },
      { label: "Per-image target", value: "Compress so the deck stays light" },
      { label: "Format", value: "JPG for photos, PNG for graphics" },
    ],
    steps: [
      { title: "Match the slide ratio", description: "Modern decks are 16:9, resize a full-slide image to 1920×1080. Use 1024×768 only for old 4:3 decks." },
      { title: "Resize before inserting", description: "Set the pixels in Image Resizer so you're not embedding a 6000px photo into a slide." },
      { title: "Compress the images", description: "Compress each photo so the whole presentation stays small enough to email." },
    ],
    tips: [
      "Inserting full-resolution phone photos is why decks become 50MB+, resize and compress first.",
      "Use PNG for charts, logos and screenshots (crisp edges) and JPG for photographs.",
      "A 16:9 full-slide image should be exactly 1920×1080 so it fills without stretching.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "image-compressor", "crop-image", "webp-converter"],
    relatedProblems: ["image-too-large", "email-attachment-too-large"],
    relatedContexts: ["resize-image-for-zoom-background", "compress-image-for-website"],
    faq: [
      { question: "What size should images be for PowerPoint?", answer: "For a full-slide image on a modern 16:9 deck, 1920×1080 pixels. Resize before inserting so you don't bloat the file with oversized photos." },
      { question: "Why is my PowerPoint file so big?", answer: "Usually full-resolution images. Resize each to the size it displays at and compress them, the deck shrinks dramatically without visible quality loss." },
    ],
  },
  {
    slug: "resize-image-for-github",
    group: "Work & professional",
    destination: "GitHub",
    label: "GitHub images",
    h1: "Resize an Image for GitHub",
    seoTitle: "GitHub Image Sizes + Free Resize Tool (Avatar, Social Preview)",
    seoDescription:
      "GitHub uses a 460×460 avatar and a 1280×640 social preview (og:image) for repos. Crop and resize to fit so your profile and shared repo links look sharp. Free, in-browser.",
    keywords: [
      "github avatar size",
      "github social preview size",
      "github profile picture size",
      "resize image for github",
      "github og image size",
    ],
    icon: "Github",
    accent: "violet",
    answer:
      "GitHub uses a 460×460px avatar (displayed smaller, so keep it simple) and a 1280×640px social preview image for repositories: the picture shown when a repo link is shared. Crop to a square for the avatar and 2:1 for the social preview, then resize. Our tools do it in your browser.",
    intro:
      "Profile avatar and repo social preview: the right GitHub sizes so your profile and shared links look professional.",
    specs: [
      { label: "Profile avatar", value: "460 × 460 px (square, displays small)" },
      { label: "Repo social preview", value: "1280 × 640 px (2:1, min 640×320)" },
      { label: "Format", value: "PNG or JPG, under 1 MB (social preview)" },
    ],
    steps: [
      { title: "Pick what you're setting", description: "A profile avatar (square) or a repository social preview (2:1)." },
      { title: "Crop to the ratio", description: "1:1 for the avatar, 2:1 for the social preview, with Crop Image." },
      { title: "Resize to the pixels", description: "460×460 for the avatar, 1280×640 for the social preview, in Image Resizer." },
      { title: "Compress and upload", description: "Keep the social preview under ~1MB with Image Compressor." },
    ],
    tips: [
      "The social preview (1280×640) is what shows when someone shares your repo on social or chat. Make it clear and branded.",
      "Avatars display small. A simple mark or clear photo reads best.",
      "Set a social preview on important repos so links don't share as a blank card.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor", "png-to-jpg"],
    relatedProblems: ["make-a-favicon", "image-too-large"],
    relatedContexts: ["resize-image-for-linkedin", "compress-image-for-website"],
    faq: [
      { question: "What size is a GitHub social preview?", answer: "1280×640 pixels (2:1), under about 1MB. It's the image shown when your repository link is shared on social media or chat." },
      { question: "What size is a GitHub avatar?", answer: "460×460 pixels (square). It's displayed much smaller, so a simple, high-contrast image reads best." },
    ],
  },
  {
    slug: "resize-image-for-email-signature",
    group: "Work & professional",
    destination: "an email signature",
    label: "Email signature image",
    h1: "Resize an Image for an Email Signature",
    seoTitle: "Email Signature Image Size + Free Resize Tool (Logo & Photo)",
    seoDescription:
      "Keep email signature images small: ~300–400px wide, well under 100KB, hosted not embedded. Resize and compress your logo or photo to load fast, free, in your browser.",
    keywords: [
      "email signature image size",
      "email signature logo size",
      "resize image for email signature",
      "signature photo size",
      "email signature dimensions",
    ],
    icon: "Mail",
    accent: "rose",
    answer:
      "An email signature image should be small: about 300–400px wide (100–150px tall for a logo) and well under 100KB, so it loads instantly and doesn't bloat every email. Resize to the display width and compress hard. Host the image and link to it rather than embedding a huge file. Our tools do it in your browser.",
    intro:
      "A crisp, tiny signature logo or photo that loads instantly: resize and compress so it never slows an email down.",
    specs: [
      { label: "Logo width", value: "~300–400 px (100–150 px tall)" },
      { label: "Headshot", value: "~100–150 px square" },
      { label: "File size", value: "Well under 100 KB" },
      { label: "Format", value: "PNG (logo) or JPG (photo)" },
    ],
    steps: [
      { title: "Resize small", description: "Set the width to ~300–400px for a logo, or ~100–150px for a headshot, in Image Resizer." },
      { title: "Compress hard", description: "Signatures repeat on every email, compress well under 100KB so they never slow things down." },
      { title: "Use the right format", description: "PNG keeps a logo crisp with transparency. JPG is smaller for a photo." },
    ],
    tips: [
      "Host the image on your site or a service and link to it, embedding large images bloats every message.",
      "Keep it small. Oversized signature images are a common reason emails feel slow or get flagged.",
      "A transparent PNG logo sits cleanly on both light and dark email themes.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "image-compressor", "png-to-jpg"],
    relatedProblems: ["image-too-large", "make-a-favicon"],
    relatedContexts: ["resize-image-for-linkedin", "compress-image-for-website"],
    faq: [
      { question: "What size should an email signature image be?", answer: "About 300–400px wide for a logo (100–150px for a headshot) and well under 100KB, so it loads instantly and doesn't bloat every email." },
      { question: "Should I embed or link the signature image?", answer: "Link to a hosted image where possible. Embedding large images adds weight to every message and can trip spam filters." },
    ],
  },
  /* ── P5-GLOBAL spec pages (added 2026-08-21; every spec verified against the
        platform's current documentation on that date - see officialSource) ── */
  {
    slug: "instagram-reel-size",
    group: "Social media",
    destination: "Instagram Reels",
    label: "Instagram Reel size",
    h1: "Instagram Reel Size and Dimensions",
    seoTitle: "Instagram Reel Size 2026: 1080×1920, 9:16 + Free Resize Tool",
    seoDescription:
      "Instagram Reels are 1080×1920 pixels at 9:16. The exact video spec, safe zones for text, and a free in-browser tool to resize any clip to fit.",
    keywords: [
      "instagram reel size",
      "instagram reel dimensions",
      "reel aspect ratio",
      "instagram reel resolution",
      "resize video for reels",
    ],
    icon: "Clapperboard",
    accent: "rose",
    answer:
      "An Instagram Reel is 1080 × 1920 pixels at a 9:16 vertical aspect ratio. Reels can run up to 90 seconds from the composer (longer uploads become regular videos), and MP4 with H.264 video is the safest format. Resize any landscape clip to 9:16 in your browser before you post.",
    intro:
      "Reels fill the whole phone screen, so a landscape upload gets letterboxed and looks amateur. Here is the exact spec, what Instagram crops, and a private in-browser resizer.",
    specs: [
      { label: "Resolution", value: "1080 × 1920 px (minimum 720 × 1280)" },
      { label: "Aspect ratio", value: "9:16 vertical (cover shows as 4:5 in the grid)" },
      { label: "Format", value: "MP4 (H.264 + AAC) or MOV" },
      { label: "Frame rate", value: "30 fps standard, 60 fps supported" },
      { label: "Safe zones", value: "Keep text out of the top ~14% and bottom ~35% (UI overlays)" },
    ],
    steps: [
      { title: "Drop your clip into the Video Resizer", description: "It loads locally. Nothing uploads. Pick the 9:16 · 1080×1920 output." },
      { title: "Check the framing", description: "Vertical crop from landscape loses the sides - make sure the subject stays centred." },
      { title: "Export and post", description: "Download the MP4 and upload it to Instagram as a Reel." },
    ],
    tips: [
      "Instagram compresses aggressively. Start from the highest-quality source you have rather than re-exporting an already-compressed download.",
      "The grid preview crops your 9:16 Reel to 4:5, so keep the subject in the central square when the cover matters.",
      "Text near the bottom third gets covered by the caption and action buttons - the safe-zone row in the table is the difference between readable and hidden.",
    ],
    primaryTool: "video-resizer",
    tools: ["video-resizer", "video-compressor", "video-trimmer", "video-converter"],
    relatedProblems: ["resize-for-instagram", "compress-video-for-whatsapp"],
    relatedContexts: ["tiktok-video-size", "resize-image-for-facebook", "spotify-canvas-size"],
    officialSource: { label: "Instagram Help Center", url: "https://help.instagram.com/1038071743007909" },
    lastVerified: "2026-08-21",
    faq: [
      {
        question: "Why does my Reel look blurry after uploading?",
        answer:
          "Instagram re-encodes every upload, and starting from a low-bitrate or already-compressed file compounds the loss. Export at 1080×1920 with a generous bitrate, upload over Wi-Fi, and check that 'Upload at highest quality' is on in your Instagram data-usage settings.",
      },
      {
        question: "Can I post a landscape video as a Reel?",
        answer:
          "You can, but Instagram pillarboxes it with blurred bars and the algorithm favours full-frame vertical video. Cropping to 9:16 with the subject centred almost always performs better than posting 16:9 as-is.",
      },
      {
        question: "Is the Reel cover a different size?",
        answer:
          "The cover you pick displays at 9:16 in the Reels feed but is cropped to 4:5 on your profile grid and 1:1 in some placements, so keep the important part of the cover in the middle of the frame.",
      },
    ],
  },
  {
    slug: "tiktok-video-size",
    group: "Social media",
    destination: "TikTok",
    label: "TikTok video size",
    h1: "TikTok Video Size, Dimensions and Upload Limits",
    seoTitle: "TikTok Video Size 2026: 1080×1920, 9:16, Upload Limits + Free Tool",
    seoDescription:
      "TikTok videos are 1080×1920 at 9:16, capped at about 72MB on Android, 288MB on iOS and much larger on the web uploader. Exact specs plus a free in-browser resizer and compressor.",
    keywords: [
      "tiktok video size",
      "tiktok video dimensions",
      "tiktok aspect ratio",
      "tiktok file size limit",
      "tiktok upload requirements",
    ],
    icon: "Music",
    accent: "cyan",
    answer:
      "TikTok videos are 1080 × 1920 pixels at 9:16 - the app caps playback at 1080p, so 4K gets downscaled. File-size limits depend on how you upload: roughly 72MB from Android, 287MB from iOS, and far larger through the web uploader. MP4 or MOV with H.264 is the safe choice.",
    intro:
      "TikTok's limits are method-dependent, which is why the same clip can fail from your phone and succeed from the browser. The full spec, and the in-browser tools to hit it.",
    specs: [
      { label: "Resolution", value: "1080 × 1920 px (playback caps at 1080p. 4K is downscaled)" },
      { label: "Aspect ratio", value: "9:16 vertical (1:1 and 16:9 accepted but letterboxed)" },
      { label: "File size (Android app)", value: "~72 MB" },
      { label: "File size (iOS app)", value: "~287 MB" },
      { label: "File size (web upload)", value: "much larger - use tiktok.com for big files" },
      { label: "Format", value: "MP4 or MOV (H.264 + AAC)" },
      { label: "Length", value: "up to 10 min recorded in-app. Longer uploads allowed for some accounts" },
    ],
    steps: [
      { title: "Resize to 9:16", description: "Drop the clip in the Video Resizer and pick 1080×1920. Everything runs locally." },
      { title: "Compress if the app rejects it", description: "Android's ~72MB cap is easy to hit - the Video Compressor gets a minute of 1080p well under it." },
      { title: "Upload from the right place", description: "Big file that survives compression poorly? Upload via tiktok.com in a browser instead of the app." },
    ],
    tips: [
      "The Android/iOS caps are why a clip that posts fine from an iPhone fails on Android - compress once and it posts everywhere.",
      "TikTok's own compressor is harsher than doing it yourself: a clip you compress to ~50MB usually looks better after TikTok than a 250MB original does.",
      "Keep captions and stickers away from the right edge and bottom bar, where TikTok's UI sits.",
    ],
    primaryTool: "video-resizer",
    tools: ["video-resizer", "video-compressor", "video-trimmer", "video-to-gif"],
    relatedProblems: ["compress-video-for-whatsapp", "trim-a-video"],
    relatedContexts: ["instagram-reel-size", "spotify-canvas-size", "resize-image-for-tiktok"],
    officialSource: { label: "TikTok Help Center", url: "https://support.tiktok.com/en/using-tiktok/creating-videos" },
    lastVerified: "2026-08-21",
    faq: [
      {
        question: "Why is my TikTok blurry after upload?",
        answer:
          "TikTok re-encodes everything and enables data-saver playback for some viewers. Start at 1080×1920 with a healthy bitrate, turn on 'Allow high-quality uploads' in the app's upload settings, and avoid re-exporting downloads of downloads.",
      },
      {
        question: "Does TikTok accept 4K?",
        answer:
          "It accepts the upload but downscales playback to 1080p, so you gain nothing except a bigger file that is more likely to hit the app's size cap. Export at 1080×1920 instead.",
      },
      {
        question: "What is the maximum length?",
        answer:
          "Recording inside the app caps at 10 minutes. Pre-recorded uploads can be longer (TikTok has been extending this for eligible accounts, with up to 60-minute uploads in testing). For reach, shorter still wins - the limit is rarely the constraint that matters.",
      },
    ],
  },
  {
    slug: "spotify-canvas-size",
    group: "Work & professional",
    destination: "Spotify Canvas",
    label: "Spotify Canvas size",
    h1: "Spotify Canvas Size and Requirements",
    seoTitle: "Spotify Canvas Size: 9:16 Video, 3-8 Seconds + Free Resize Tool",
    seoDescription:
      "A Spotify Canvas is a 9:16 looping video, 720×1280 to 1080×1920, exactly 3-8 seconds, MP4 or JPG. The full spec and free in-browser tools to trim and resize yours.",
    keywords: [
      "spotify canvas size",
      "spotify canvas dimensions",
      "spotify canvas requirements",
      "spotify canvas video specs",
      "how long is a spotify canvas",
    ],
    icon: "Music",
    accent: "emerald",
    answer:
      "A Spotify Canvas is a vertical 9:16 looping video between 720 × 1280 and 1080 × 1920 pixels, lasting 3 to 8 seconds, uploaded as MP4 (or a JPG still). Anything shorter than 3 seconds or longer than 8 is rejected, so trim first, then resize - both run in your browser here.",
    intro:
      "Canvas is the 8-second loop behind your track in the Spotify app. The duration rule is strict and the aspect ratio is non-negotiable - here is the exact spec and the two-step local workflow.",
    specs: [
      { label: "Aspect ratio", value: "9:16 vertical, exactly" },
      { label: "Resolution", value: "720 × 1280 minimum, 1080 × 1920 recommended" },
      { label: "Duration", value: "3 to 8 seconds - outside that range the upload is rejected" },
      { label: "Format", value: "MP4 video (no audio track needed) or JPG still" },
      { label: "Where to upload", value: "Spotify for Artists → your release → Add Canvas" },
    ],
    steps: [
      { title: "Trim to 3-8 seconds", description: "Cut the loopable moment in the Video Trimmer - frame-accurate, in your browser." },
      { title: "Resize to 9:16", description: "Make it 1080×1920 in the Video Resizer if the source is landscape or square." },
      { title: "Upload in Spotify for Artists", description: "Add it to the track from the release page. It loops automatically." },
    ],
    tips: [
      "Pick a moment that loops without a visible jump - the end frame should flow back into the start frame.",
      "Canvas has no audio, so motion has to carry it. Slow, hypnotic movement outperforms fast cuts at this size.",
      "One Canvas per track: if you A/B test, change it between release-promo pushes rather than mid-campaign.",
    ],
    primaryTool: "video-trimmer",
    tools: ["video-trimmer", "video-resizer", "video-compressor", "video-converter"],
    relatedProblems: ["trim-a-video", "video-to-gif"],
    relatedContexts: ["instagram-reel-size", "tiktok-video-size"],
    officialSource: { label: "Spotify for Artists", url: "https://support.spotify.com/us/artists/article/canvas-guidelines/" },
    lastVerified: "2026-08-21",
    faq: [
      {
        question: "Why was my Canvas rejected?",
        answer:
          "The two usual causes are duration (it must be 3 to 8 seconds - not 2.9, not 8.5) and aspect ratio (exactly 9:16). Trim first, resize second, and re-export as MP4. Screen recordings with odd dimensions are the most common silent failure.",
      },
      {
        question: "Does a Canvas need sound?",
        answer:
          "No - Canvas never plays audio. If your export has an audio track it is simply ignored, but stripping it makes the file smaller and the upload faster.",
      },
      {
        question: "Can I use a still image?",
        answer:
          "Yes, a JPG in the same 9:16 shape works and displays as a static Canvas. A subtle loop almost always holds attention better, but a sharp still beats a janky loop.",
      },
    ],
  },
  {
    slug: "kindle-ebook-cover-size",
    group: "E-commerce",
    destination: "Kindle (KDP)",
    label: "Kindle cover size",
    h1: "Kindle eBook Cover Size for KDP",
    seoTitle: "Kindle Cover Size: 1600×2560, 1.6:1 Ratio + Free Resize Tool (KDP)",
    seoDescription:
      "Amazon KDP wants ebook covers at 2560×1600 (1.6:1), JPEG, under 50MB, ideally 300ppi. The exact requirements and a free private tool to resize yours to spec.",
    keywords: [
      "kindle cover size",
      "kdp ebook cover dimensions",
      "kindle ebook cover requirements",
      "amazon book cover size",
      "kdp cover pixels",
    ],
    icon: "BookOpen",
    accent: "amber",
    answer:
      "Amazon KDP's ideal ebook cover is 1600 pixels wide by 2560 pixels tall - a strict 1.6:1 height-to-width ratio - as a JPEG under 50MB in sRGB. The minimum is 1000px on the longest side, but at that size Amazon warns about quality on HD devices. Resize to the exact spec in your browser below.",
    intro:
      "KDP enforces the ratio and warns on low resolution, and a cover that fails review delays the whole release. The exact numbers, and a resizer preset that hits them first try.",
    specs: [
      { label: "Ideal size", value: "1600 × 2560 px (width × height)" },
      { label: "Aspect ratio", value: "1.6:1 (height ÷ width), enforced" },
      { label: "Minimum", value: "1000 px on the longest side (2560 recommended for HD screens)" },
      { label: "Format", value: "JPEG preferred (TIFF accepted)" },
      { label: "File size", value: "under 50 MB" },
      { label: "Colour profile", value: "sRGB, no transparency" },
    ],
    steps: [
      { title: "Resize to 1600×2560", description: "The button below opens the Image Resizer with the KDP preset already filled in - just drop your artwork." },
      { title: "Check the crop", description: "If your art isn't 1.6:1, crop deliberately rather than letting the resize squash it." },
      { title: "Export as JPEG and upload to KDP", description: "Keep it under 50MB (a 1600×2560 JPEG almost always is) and upload on the Kindle eBook Content page." },
    ],
    tips: [
      "Design for the thumbnail: on a search-results page your cover renders about 100px tall, so the title must survive extreme shrinking.",
      "Amazon flags up-scaled artwork - starting from a small image and enlarging it triggers the quality warning even at the right pixel count.",
      "Paperback covers are a different spec entirely (trim size + spine + bleed as one PDF). This page is the EBOOK cover only.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor", "image-upscaler"],
    relatedProblems: ["image-too-large", "enlarge-a-blurry-photo"],
    relatedContexts: ["resize-image-for-etsy", "resize-image-for-amazon", "google-ads-image-sizes"],
    officialSource: { label: "KDP cover guidelines", url: "https://kdp.amazon.com/en_US/help/topic/G200645690" },
    lastVerified: "2026-08-21",
    preset: { w: 1600, h: 2560 },
    faq: [
      {
        question: "Is it 2560×1600 or 1600×2560?",
        answer:
          "The cover is portrait: 1600 pixels WIDE and 2560 pixels TALL. Amazon's documentation phrases it as '2560 pixels in height', which regularly gets transcribed backwards - a landscape 2560×1600 upload fails the ratio check.",
      },
      {
        question: "Why does KDP warn about my cover's quality?",
        answer:
          "Usually the source was upscaled or below the recommended resolution. Use original artwork at 2560px tall where possible. If all you have is smaller, our upscaler can help, but a genuinely sharp source always beats reconstruction.",
      },
      {
        question: "Does the 50MB limit matter in practice?",
        answer:
          "Rarely - a 1600×2560 JPEG at high quality is typically 1-4MB. You would only hit 50MB with an uncompressed TIFF, in which case export as JPEG instead.",
      },
    ],
  },
  {
    slug: "google-ads-image-sizes",
    group: "Website & web",
    destination: "Google Ads",
    label: "Google Ads image sizes",
    h1: "Google Ads Image Sizes for Responsive Display Ads",
    seoTitle: "Google Ads Image Sizes: 1200×628, 1200×1200 + Free Resize Tool",
    seoDescription:
      "Responsive display ads need a 1200×628 landscape (1.91:1) and a 1200×1200 square image, JPG or PNG under 5MB, plus logos. Every required size and a free tool to hit them.",
    keywords: [
      "google ads image sizes",
      "responsive display ad sizes",
      "google display ad image requirements",
      "1200x628 ad image",
      "google ads logo size",
    ],
    icon: "Megaphone",
    accent: "sky",
    answer:
      "A responsive display ad needs at least one landscape image at 1200 × 628 (1.91:1, minimum 600×314) and one square at 1200 × 1200 (minimum 300×300), as JPG or PNG under 5MB each. Add a 1200×1200 square logo (and optionally a 512×128 landscape logo) and Google assembles the rest.",
    intro:
      "Google assembles responsive display ads from the assets you upload, and missing a required shape blocks the whole ad group. Here is every required and optional size, and a resizer preset for the big one.",
    specs: [
      { label: "Landscape image (required)", value: "1200 × 628 px, 1.91:1 (min 600 × 314)" },
      { label: "Square image (required)", value: "1200 × 1200 px, 1:1 (min 300 × 300)" },
      { label: "Portrait image (optional)", value: "1200 × 1500 px (min 320 × 400)" },
      { label: "Square logo", value: "1200 × 1200 px (min 128 × 128)" },
      { label: "Landscape logo (optional)", value: "1200 × 300 px, 4:1 (min 512 × 128)" },
      { label: "File size / format", value: "JPG or PNG, up to 5120 KB each. No animation" },
      { label: "How many", value: "up to 15 images and 5 logos per ad" },
    ],
    steps: [
      { title: "Resize the landscape asset", description: "The button below opens the Image Resizer preset to 1200×628. Drop your creative in." },
      { title: "Make the square from the same creative", description: "Re-crop to 1:1 rather than squashing - the Crop tool keeps it honest, then resize to 1200×1200." },
      { title: "Compress under 5MB", description: "PNGs of photos blow past 5120KB easily - the compressor gets them under with no visible loss." },
    ],
    tips: [
      "Text overlays get cropped unpredictably across placements - Google's own guidance is to keep text under 20% of the image and let the headline assets carry the words.",
      "Upload both required shapes from the start: an ad group with only a landscape image serves to far fewer placements.",
      "The 5120KB limit is per file. A photographic PNG is the usual offender - export photos as JPG and keep PNG for flat graphics and logos.",
    ],
    primaryTool: "image-resizer",
    tools: ["image-resizer", "crop-image", "image-compressor", "png-to-jpg"],
    relatedProblems: ["image-too-large", "compress-image-to-target-size"],
    relatedContexts: ["resize-image-for-linkedin", "resize-image-for-facebook", "kindle-ebook-cover-size"],
    officialSource: { label: "Google Ads Help", url: "https://support.google.com/google-ads/answer/13676244" },
    lastVerified: "2026-08-21",
    preset: { w: 1200, h: 628 },
    faq: [
      {
        question: "Why was my image asset rejected?",
        answer:
          "The usual reasons: wrong aspect ratio (the uploader crops, but badly off-ratio sources fail), file over 5120KB, or too much overlaid text. Resize to the exact recommended pixels first and rejections mostly disappear.",
      },
      {
        question: "Do I really need the square version?",
        answer:
          "Yes - landscape and square are both required for responsive display ads. Without the square, Google cannot fill square and mobile placements and your reach drops sharply.",
      },
      {
        question: "What about classic banner sizes like 300×250?",
        answer:
          "Those apply to manually-uploaded display ads, which are a separate format. Responsive display ads - the default and Google's recommendation - only need the asset sizes in the table above.",
      },
    ],
  },

];

/* ── Pure helpers (client-safe) ────────────────────────────────────────────── */

export function getContextBySlug(slug: string): ContextPage | undefined {
  return CONTEXT_PAGES.find((c) => c.slug === slug);
}

export function getAllContexts(): ContextPage[] {
  return CONTEXT_PAGES;
}

export function getContextsByGroup(): { group: ContextGroup; contexts: ContextPage[] }[] {
  return CONTEXT_GROUPS.map((group) => ({
    group,
    contexts: CONTEXT_PAGES.filter((c) => c.group === group),
  })).filter((g) => g.contexts.length > 0);
}

export function getRelatedContexts(context: ContextPage): ContextPage[] {
  return context.relatedContexts
    .map((slug) => getContextBySlug(slug))
    .filter((c): c is ContextPage => Boolean(c));
}
