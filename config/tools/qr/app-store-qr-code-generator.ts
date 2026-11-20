import type { Tool } from "@/types";

/**
 * App Store QR Code Generator, a flagship, single-purpose micro-site over the
 * QR Studio, locked to the "appStore" content type. It turns an Apple App Store
 * listing URL (apps.apple.com/…) into a scannable QR code that opens the app's
 * page straight in the App Store on iPhone and iPad, so a shopper can tap
 * "Get" in one move. Every string here is written for the exact queries an app
 * team, indie developer, agency or retailer types when they want a clean
 * "Scan to download on the App Store" code for a poster, packaging box, pitch
 * deck, TestFlight card, trade-show booth or product page.
 *
 * Honest boundary baked into the copy: this encodes the real App Store URL you
 * paste as a standard, static QR built locally in the browser. It is not a
 * dynamic, re-targetable link and it does not count scans or installs; it is a
 * permanent, private QR pointing at your listing. For a single code that sends
 * iPhone users to the App Store and Android users to Google Play, use the
 * companion App Download QR generator instead.
 */
const appStoreQrCodeGenerator: Tool = {
  slug: "app-store-qr-code-generator",
  title: "App Store QR Code Generator",
  description:
    "Turn your Apple App Store link into a scannable QR code that opens the App Store on iPhone and iPad, ready for a one-tap Get. Style it, add your app icon or logo, verify it scans, and export print-ready PNG, SVG, PDF or EPS. 100% in your browser: free, no signup, no watermark.",
  category: "qr-tools",
  icon: "Apple",
  accent: "sky",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",
  illustration: "appStore",

  h1: "App Store QR Code Generator, Scan to Download on iPhone & iPad",
  tagline:
    "Paste your apps.apple.com link and get a crisp, on-brand QR that opens your listing right in the App Store, one scan, one tap on Get. Drop in your app icon, verify it scans on a live test, and export razor-sharp PNG, SVG, PDF or EPS. No sign-up, no watermark, nothing uploaded.",
  longDescription:
    "The GigAI App Store QR Code Generator turns the App Store URL for your iOS app into a scannable QR code that takes an iPhone or iPad straight to your listing, where the visitor just taps Get to install. No searching the store, no typing a name that autocorrect mangles. Paste any apps.apple.com link (an app page, a specific in-app product, or a campaign link with your affiliate or analytics parameters) and the studio builds a clean, standards-compliant QR that iOS's built-in Camera app and every mainstream scanner read instantly. Then make it look like it belongs to your product: set your brand colors or a gradient, choose rounded or classic dot and eye shapes, tune the quiet-zone margin and corner radius, and drop your app icon into the centre: the tool recommends the right error-correction level so the code keeps scanning with your mark on top. A live preview renders as you type across desktop, mobile, dark and print modes, and a real-time validator runs an actual on-canvas decode plus a WCAG contrast check, so you know the code works before it goes on a box, a billboard or a pitch deck. When it's ready, export a lossless PNG, a true-vector SVG, or a print-ready PDF or EPS (from 256 up to 4096 pixels, including transparent PNG and SVG for overlays) or copy it straight to the clipboard. Everything (building the payload, styling, rendering, validating and exporting) happens locally in your browser, so your listing URL, campaign parameters and icon never leave your device.",

  ctaText: "Create App Store QR Code",

  keywords: [
    "app store qr code generator",
    "apple app store qr code",
    "ios app qr code",
    "scan to download app qr code",
    "app download qr code iphone",
    "qr code for app store link",
    "app store link to qr code",
    "app store qr code with logo",
    "testflight qr code",
    "app promo qr code",
    "qr code for ios app",
    "free app store qr code no watermark",
  ],

  seo: {
    title:
      "App Store QR Code Generator, Scan to Download iOS Apps (PNG/SVG/PDF) | GigAI Tools",
    description:
      "Free App Store QR code generator. Paste your apps.apple.com link and create a branded QR that opens your listing on iPhone and iPad for a one-tap Get. Add your app icon, verify it scans, export high-res PNG, SVG, PDF or EPS. 100% in-browser, no watermark.",
  },

  features: [
    {
      icon: "Apple",
      title: "Opens straight in the App Store",
      description:
        "Encodes your real apps.apple.com URL, so an iPhone or iPad lands on your listing where a single tap on Get installs the app. No store search, no mistyped app name, no wrong result.",
    },
    {
      icon: "Image",
      title: "Centre your app icon",
      description:
        "Place your app icon or brand logo in the middle with adjustable size, padding and a protect-area cut-out. The tool suggests the error-correction level so the QR stays reliably scannable with your mark on top.",
    },
    {
      icon: "ScanLine",
      title: "Live scan & contrast check",
      description:
        "A validator runs a genuine on-canvas decode and a WCAG contrast test as you design, warning you the instant a color, gradient or icon size would stop a phone reading the code, before it ships on a box or banner.",
    },
    {
      icon: "Palette",
      title: "On-brand styling",
      description:
        "Match your product with custom colors or a linear/radial gradient, rounded or classic dots and finder eyes, a tuned quiet-zone margin and corner radius, and an optional transparent background for overlays.",
    },
    {
      icon: "Download",
      title: "Print-ready, high-res exports",
      description:
        "Download PNG, true-vector SVG, or print-ready PDF or EPS, from 256 up to 4096 pixels (plus transparent PNG/SVG) sharp enough for a business card, packaging or a full-size booth wall. Copy to clipboard, too.",
    },
    {
      icon: "ShieldCheck",
      title: "Private & permanent",
      description:
        "The QR is built entirely in your browser and points at your static App Store link, so it never expires and needs no account. Your listing URL and campaign parameters are never uploaded.",
    },
  ],

  benefits: [
    {
      title: "More installs from the real world",
      description:
        "A scan-to-download code on a poster, box, flyer or slide removes every step between seeing your app and installing it. No store search, no typos, no losing people to a competing result.",
    },
    {
      title: "A code that looks like your product",
      description:
        "Your app icon, brand colors and dot shapes make the QR unmistakably yours, and the built-in decode test means you get that polish without gambling on whether iPhones can actually read it.",
    },
    {
      title: "Sharp from a sticker to a billboard",
      description:
        "Vector SVG, PDF and EPS scale to any physical size with crisp edges, and raster exports reach 4096px, so one code works on an app-insert card and on a trade-show backdrop.",
    },
    {
      title: "Free, private and never expires",
      description:
        "No account, no watermark, no subscription. Because the code is static and built on your device, it keeps working as long as your App Store listing is live, and your data never leaves the tab.",
    },
  ],

  howTo: [
    {
      title: "Copy your App Store link",
      description:
        "On your app's App Store page tap Share → Copy Link, or grab the apps.apple.com URL from App Store Connect or your marketing tools. Campaign, affiliate or analytics parameters are preserved.",
    },
    {
      title: "Paste it in",
      description:
        "Drop the link into the field and the QR builds and previews live. The guided form keeps the payload clean so iOS Camera and every scanner open your listing directly.",
    },
    {
      title: "Style and brand it",
      description:
        "Set your colors or a gradient, pick dot and eye shapes, adjust the margin, and centre your app icon. Watch the live scan-test and contrast badges confirm it still reads.",
    },
    {
      title: "Export or copy",
      description:
        "Download PNG, SVG, PDF or EPS at up to 4096px (or a transparent PNG/SVG for overlays) or copy the code straight to your clipboard to drop into a design.",
    },
  ],

  formats: {
    input: ["Apple App Store URL", "PNG logo", "SVG logo"],
    output: ["PNG", "SVG", "PDF", "EPS", "JPG", "WEBP"],
  },

  useCases: [
    {
      audience: "App developer / studio",
      title: "Launch and press assets",
      description:
        "Add a scan-to-install code to your landing page, pitch deck and press kit so reviewers, investors and early users reach the App Store listing in one tap from any screen or printout.",
    },
    {
      audience: "Product marketer",
      title: "Print, packaging & out-of-home",
      description:
        "Put a branded QR on flyers, posters, product boxes, receipts and in-store signage, matched to your app icon and colors, and export a vector PDF for print and a transparent PNG for the web.",
    },
    {
      audience: "Startup running a beta",
      title: "TestFlight & early-access cards",
      description:
        "Encode your public TestFlight or App Store link on a handout card at meetups and demo days so testers install without hunting through the store or copying a long URL by hand.",
    },
    {
      audience: "Event & retail teams",
      title: "Booth walls and shelf talkers",
      description:
        "Generate a high-resolution code for a trade-show backdrop or shelf tag so passers-by scan and download on the spot. Sized to 4096px so it stays crisp even at wall scale.",
    },
  ],

  troubleshooting: [
    {
      problem: "The QR opens Safari to a web page instead of the App Store app.",
      solution:
        "That's expected on the web, and on iPhone/iPad an apps.apple.com link opens the App Store app automatically. Make sure you pasted the full apps.apple.com URL for your listing (not a short marketing redirect that could be blocked), and test by scanning with the iOS Camera app, which hands the link to the App Store.",
    },
    {
      problem: "My branded, colored code won't scan.",
      solution:
        "Check the live scan-test badge. Usual causes are low contrast (light code on a light background), too small a quiet-zone margin, or an app icon covering too much of the code. Keep a dark code on a light background, hold the margin, shrink the icon, and set error correction to H when a logo is present.",
    },
    {
      problem: "The exported image looks blurry when printed.",
      solution:
        "Export a vector format (SVG, PDF or EPS) which scales to any physical size with no pixelation, or raise the raster size to 2048 or 4096px. A small PNG stretched to poster or packaging size will always look soft.",
    },
    {
      problem: "I need the same code to send Android users to Google Play too.",
      solution:
        "A single App Store QR only points to iOS. For one code that routes iPhone users to the App Store and Android users to Google Play, use the App Download QR Code Generator, which encodes a smart link for both platforms.",
    },
  ],

  tips: [
    "Use the App Store page's Share → Copy Link so you get the canonical apps.apple.com URL that opens the store app directly on iOS.",
    "Centring your app icon? Set error correction to H and keep the icon under ~25% of the width so the code stays reliably scannable.",
    "Export SVG or PDF for anything printed (vectors stay razor-sharp from a sticker to a booth wall) and reserve high-res PNG for screens.",
    "Keep a generous quiet-zone margin and a dark-on-light palette so iOS Camera locks onto the code fast, even on busy packaging.",
    "Add a short 'Scan to download on the App Store' caption near the code so people know what it does before they lift their phone.",
  ],

  security:
    "Every App Store QR code is built, styled, rendered and exported entirely in your browser using the canvas and Web APIs on your device. The apps.apple.com URL you paste (including any campaign, affiliate or analytics parameters) and any app icon or logo you add are never uploaded, logged or stored. There is no server round-trip and no account. Close the tab and nothing is retained.",

  faq: [
    {
      question: "How do I get my app's App Store link for the QR code?",
      answer:
        "Open your app's page in the App Store on iPhone, tap the Share button and choose Copy Link. That gives you the canonical apps.apple.com URL. You can also copy it from App Store Connect, from the 'View in App Store' link on the web, or from your marketing tools. Paste it into the field and the QR builds instantly. Any campaign or affiliate parameters on the link are preserved.",
    },
    {
      question: "Will scanning the code open the App Store app or a web page?",
      answer:
        "On an iPhone or iPad, scanning an apps.apple.com link with the built-in Camera app opens the App Store app directly on your listing, ready for a one-tap Get. On a desktop or a device without the App Store, the same link opens the web version of your listing in a browser. This is standard Apple behaviour. The URL you encode is the real listing link, so iOS routes it to the store automatically.",
    },
    {
      question: "Can I add my app icon or logo to the QR code?",
      answer:
        "Yes. Upload your app icon or brand logo and it's placed in the centre with adjustable size, padding, a protect-area cut-out and optional rounding. QR codes carry error-correction data that lets scanners rebuild the modules behind a centred mark, so the code still reads. The tool recommends the right error-correction level for your icon size and warns you live if the icon is getting too large.",
    },
    {
      question: "Does this code work for Android and Google Play too?",
      answer:
        "No, an App Store QR points only to your Apple App Store listing, so it's ideal when your audience is on iOS or when you want a dedicated iPhone/iPad code. If you need a single QR that sends iPhone users to the App Store and Android users to Google Play, use the App Download QR Code Generator, which encodes a smart link for both. Being honest: a plain QR can't detect the phone's platform on its own. That routing needs a link that handles both stores.",
    },
    {
      question: "Is the QR code static, and does it count scans or installs?",
      answer:
        "It's a static QR: your App Store URL is encoded directly into the pattern, so it's free, private, never expires and needs no account, but it doesn't track scans or installs and you can't change where it points after printing. If you need scan analytics or the ability to re-target the link later, encode a link you control (your own domain redirect or an App Store campaign link with analytics parameters) so the tracking lives on your side, not in the QR.",
    },
    {
      question: "Which format should I download, PNG, SVG, PDF or EPS?",
      answer:
        "Use PNG for screens and the web (transparent PNG to overlay on a colored section). Use SVG for the web when you want infinite scaling at a tiny file size. Use PDF or EPS for print and hand-off to a designer or print shop, since they stay crisp at any physical size. Note that EPS is a plain vector matrix and doesn't carry gradients, logos or custom shapes, export SVG or PDF if you need those preserved in vector form.",
    },
    {
      question: "What resolution should I use for a poster or packaging?",
      answer:
        "For print, export a vector format (SVG, PDF or EPS) whenever you can. It scales to any size with zero pixelation. If you need a raster image, use 1024px for small items like insert cards, and 2048–4096px for posters, packaging or booth walls. Avoid stretching a small PNG up to print size, which always looks blurry.",
    },
    {
      question: "Is my App Store link uploaded when I generate the QR code?",
      answer:
        "No. All building, styling, rendering, validating and exporting happen locally in your browser using the canvas and Web APIs. The apps.apple.com URL you paste, any campaign parameters, and any app icon or logo you add never leave your device: there's nothing for us to store, log or see.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release: paste an Apple App Store link and generate a branded, scannable QR that opens your listing on iPhone and iPad, with app-icon logo support and PNG/SVG/PDF/EPS/JPG/WEBP export up to 4096px.",
    },
    {
      date: "2026-06-25",
      change:
        "Added real-time scannability validation, an on-canvas decode plus a WCAG contrast check with live warnings, and transparent PNG/SVG exports for overlays.",
    },
    {
      date: "2026-06-29",
      change:
        "Added desktop/mobile/dark/print preview modes with zoom, copy-to-clipboard for PNG, and error-correction guidance tuned for centred app icons.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "qr-code-with-logo",
    "spotify-qr-code-generator",
    "qr-code-scanner",
  ],
};

export default appStoreQrCodeGenerator;
