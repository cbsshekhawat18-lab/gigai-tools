import type { Tool } from "@/types";

/**
 * Image QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "image" content type). It turns the URL of an image you
 * have ALREADY hosted somewhere (Google Drive, Dropbox, Imgur, an S3 bucket,
 * your own website, a CDN) into a scannable QR code that opens that picture in
 * the phone's browser. Every string here targets the exact queries people search
 * when they want a QR that shows a photo: a wedding gallery, a product shot, an
 * event flyer, an art print, a menu image.
 *
 * Honest boundary baked into the copy: this tool does NOT host, upload or store
 * your image. It encodes the link you paste, entirely in your browser, in the
 * standard way (a plain URL). You must host the image yourself and make the link
 * publicly viewable; the QR simply carries that link so scanning opens it.
 */
const imageQrCodeGenerator: Tool = {
  slug: "image-qr-code-generator",
  title: "Image QR Code Generator",
  description:
    "Turn a hosted image link into a scannable QR code that opens the photo full-screen on any phone. Brand it with colors and a logo, verify it scans, then download print-ready PNG, SVG, PDF or EPS. 100% in your browser: nothing uploaded.",
  category: "qr-tools",
  icon: "Image",
  accent: "violet",
  status: "live",
  createdAt: "2026-06-18",
  illustration: "image",

  h1: "Image QR Code Generator, Scan to Open a Photo",
  tagline:
    "Paste the link to an image you've already hosted and get a QR code that opens that picture full-screen when scanned. Style it with your colors and logo, prove it scans with a live decode test, and export razor-sharp PNG, SVG, PDF or EPS, all in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Image QR Code Generator turns the web address of a picture into a QR code that, when scanned, opens that image directly in the phone's browser, so a customer, guest or visitor sees your product shot, poster, gallery or artwork without you emailing a file or reading out a long link. Paste the direct URL of an image you have already uploaded somewhere public (your own website or CDN, an S3 or Cloudinary bucket, Imgur, Dropbox, Google Drive, GitHub) and the tool encodes exactly that link into a standard URL QR, then hands it to our desktop-grade QR Studio so you can make it look like yours: custom foreground and background colors or a gradient, rounded dot and eye shapes, a centred logo with automatic error-correction guidance, an optional printable frame with a 'Scan to view' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check runs a real jsQR decode on the rendered pixels and a WCAG contrast test as you design, so the pretty code still scans on the first try. Being clear about what this is: the QR points to your image's URL. It does not host, upload, store or shorten anything. The picture must live at a public, direct link you control, and if that link ever moves or is taken down, the code stops resolving (so use a stable host, and ideally your own domain, if the code is printed). Everything here (encoding, styling, validating and exporting) happens locally in your browser, so the link you paste is never sent to a server, logged or stored.",

  ctaText: "Generate Image QR Code",

  keywords: [
    "image qr code generator",
    "qr code for image",
    "qr code that opens a picture",
    "photo qr code generator",
    "qr code link to image",
    "picture qr code",
    "qr code for jpg",
    "qr code for png image",
    "scan qr to see photo",
    "image url qr code",
    "gallery qr code",
    "qr code with logo for image",
  ],

  seo: {
    title:
      "Image QR Code Generator, QR Code That Opens a Photo (Free, No Signup) | GigAI Tools",
    description:
      "Free image QR code generator. Paste a hosted image URL to make a QR code that opens the picture on any phone, add a logo and colors, verify it scans, and download PNG, SVG, PDF or EPS. Runs 100% in your browser: link never uploaded.",
  },

  features: [
    {
      icon: "Image",
      title: "Opens the picture on scan",
      description:
        "Encodes your hosted image's direct URL as a standard QR, so a phone camera opens the photo full-screen in its browser. No app, no file transfer, no reading out a long link.",
    },
    {
      icon: "Link",
      title: "Works with any image host",
      description:
        "Paste a direct link from your own site or CDN, S3, Cloudinary, Imgur, Dropbox, Google Drive or GitHub. The tool auto-adds https:// and encodes exactly what you give it.",
    },
    {
      icon: "Palette",
      title: "Brand it to match",
      description:
        "Custom colors or a gradient, rounded dot and eye styles, and an optional 'Scan to view' frame so the code looks like part of your poster, print or packaging, not a generic square.",
    },
    {
      icon: "Sparkles",
      title: "Drop in your logo",
      description:
        "Add a brand or watermark logo to the centre with adjustable size and a protected quiet zone, the tool auto-recommends higher error correction so it still scans cleanly.",
    },
    {
      icon: "ScanLine",
      title: "Live scan & contrast check",
      description:
        "A validator runs an actual jsQR decode on the rendered pixels plus a WCAG contrast test as you design, warning you the instant a color or logo choice would make the code unreadable.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: sharp enough for a gallery label, flyer, art print, sticker or product box.",
    },
  ],

  benefits: [
    {
      title: "Show a photo without sending a file",
      description:
        "Point a camera at the code and the image opens, ideal for gallery walls, product tags and event displays where you can't email everyone a picture or dictate a URL.",
    },
    {
      title: "One scan replaces a messy link",
      description:
        "Image URLs from cloud storage are long and full of tokens. A QR carries the exact string so nobody mistypes it, and it prints far smaller than the raw address ever could.",
    },
    {
      title: "Looks like part of your design",
      description:
        "With your colors, a logo and a framed 'Scan to view' call-to-action, the code fits an art print, product box or exhibition label instead of looking like a plain black square.",
    },
    {
      title: "Private by design",
      description:
        "The link is encoded locally in your browser and never uploaded, logged or stored. No account, no server round-trip. Only the image host ever sees a visitor when they scan.",
    },
  ],

  howTo: [
    {
      title: "Host the image and copy its link",
      description:
        "Upload your picture somewhere public (your site, a CDN, S3, Imgur, Dropbox or Drive) and copy the DIRECT image URL (the one ending in.jpg/.png/.webp, not a folder or preview page).",
    },
    {
      title: "Paste the image URL",
      description:
        "Drop the link into the field. The preview builds a scannable QR instantly. The tool adds https:// automatically if you leave the scheme off.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab for colors, a gradient and dot/eye shapes, add a 'Scan to view' frame, and drop your logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans, then download",
      description:
        "Watch the live scannability badge and test with your own phone. When it opens the image cleanly, export a high-res PNG/PDF for print or an SVG for infinite scaling.",
    },
  ],

  formats: {
    input: ["Hosted image URL"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Artist / Gallery",
      title: "Scan-to-view artwork",
      description:
        "Place a QR beside a print or on an exhibition label so visitors open a high-resolution image, detail shot or making-of photo on their own phone. No crowding the wall.",
    },
    {
      audience: "Seller / E-commerce",
      title: "Product photo on the box",
      description:
        "Print a QR on packaging or a hang-tag that opens a lifestyle or 'what's inside' image, giving shoppers a richer look than the label alone can show.",
    },
    {
      audience: "Events / Weddings",
      title: "Shared gallery or flyer",
      description:
        "Put a code on a table card or poster that opens the event flyer image or a shared photo, so guests see the full picture without you chasing everyone with a link.",
    },
    {
      audience: "Real estate / Property",
      title: "Floor plan or listing shot",
      description:
        "Add a QR to a yard sign or brochure that opens the floor-plan image or a hero listing photo, letting passers-by view it instantly on their phone.",
    },
  ],

  troubleshooting: [
    {
      problem: "Scanning shows a broken image or a download page, not the picture.",
      solution:
        "You likely used a share/preview link, not the direct image URL. On Google Drive or Dropbox, open the file and copy the DIRECT/raw image link (it should end in .jpg, .png or .webp). The image must also be set to public/anyone-with-the-link, or phones can't open it.",
    },
    {
      problem: "The code scanned once but now the image is gone.",
      solution:
        "The QR only points at your link. It doesn't host the picture. If the file was deleted, moved, or the host expired the URL (some image hosts rotate links), the code stops resolving. For printed codes, host on a stable location you control, ideally your own domain.",
    },
    {
      problem: "The image opens huge and users can't see all of it.",
      solution:
        "That's the host/browser showing the raw file. If you want a nicer, fitted view, link to a web page that displays the image (or a lightbox) instead of the raw file, the QR happily encodes any URL, including a gallery page you build.",
    },
    {
      problem: "My styled or logo'd code won't scan.",
      solution:
        "Check the live scan-test badge. Raise contrast (dark code on light background), keep a generous quiet-zone margin, shrink the logo, and set error correction to Q or H when a logo is present. The validator flags the exact issue as you design.",
    },
  ],

  tips: [
    "Link to the DIRECT image file (ending in.jpg/.png/.webp), not a folder, album or preview page, that's the difference between a photo opening and a login screen appearing.",
    "Host on something stable you control, your own domain or a paid CDN, if the code is printed. Free image hosts sometimes expire or rewrite links, which silently breaks the QR.",
    "Want a caption, title or multiple photos? Link to a simple web page that shows the image instead of the raw file, the QR encodes any URL just as happily.",
    "Using a centre logo? Set error correction to Q or H and keep the logo under ~25% of the width so the code stays reliably scannable.",
    "Export SVG or PDF for anything printed on packaging, prints or signage: vectors stay crisp at any size, from a hang-tag to a poster.",
  ],

  security:
    "Your image link is encoded into the QR entirely in your browser. It is never uploaded, stored or logged, and there is no account. Be clear about what this tool is: it does NOT host, store or upload your image. It only encodes the URL you paste. The picture lives wherever you already hosted it, and anyone who scans the code is sent to that link, so only publish images you're comfortable making publicly viewable. Because the QR is static and points at your URL, the code keeps working for as long as that link stays live: host it somewhere stable you control.",

  faq: [
    {
      question: "Does this tool host my image, or do I need to upload it somewhere first?",
      answer:
        "You need to host it yourself first. This tool does not upload, store or host images. It encodes a link you paste into a QR code. Put your picture somewhere public (your own website or CDN, an S3/Cloudinary bucket, Imgur, Dropbox, Google Drive, GitHub, etc.), copy its direct URL, and the QR will open that image when scanned. We're upfront about this because it means total privacy: nothing leaves your browser.",
    },
    {
      question: "What happens when someone scans an image QR code?",
      answer:
        "Their phone camera reads the URL stored in the code and opens it in the browser. If the link points at a direct image file, the picture is shown full-screen. If it points at a web page that displays the image, that page loads. There's no app to install, modern iPhone and Android cameras open the link automatically.",
    },
    {
      question: "Why does my QR open a Google Drive or Dropbox page instead of the image?",
      answer:
        "Because you likely used a share or preview link rather than the direct image link. Cloud services wrap files in a viewer page by default. Open the file and copy the DIRECT/raw image URL (it should end in .jpg, .png or .webp), and make sure sharing is set to 'anyone with the link', so the picture opens straight away.",
    },
    {
      question: "Can I add my logo and brand colors to the image QR?",
      answer:
        "Yes. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to view' frame, and drop your logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from reading, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Is the image QR code dynamic. Can I swap the picture later without reprinting?",
      answer:
        "The QR itself is static: it permanently encodes the exact URL you paste, because this tool has no server or database to redirect through. However, you can get 'change the image later' behaviour by pointing the QR at a stable link you control (a page or file path on your own domain) and swapping the image behind that link. Keep the URL the same and the printed code keeps working with the new picture.",
    },
    {
      question: "Will the code stop working if I delete or move the image?",
      answer:
        "Yes. The code only carries the link. It doesn't store the picture. If you delete the file, move it to a new URL, or your host expires the link, scanning will show a broken image or a 404. For anything printed, host the image somewhere stable you control (ideally your own domain) so the link stays live.",
    },
    {
      question: "What resolution should I export for printing?",
      answer:
        "For a label, flyer, hang-tag or poster, export a PNG or PDF at 1024px or higher: the tool goes up to 4096px. For anything that may be resized (packaging, signage, large prints), use the SVG or PDF export, which is vector and stays razor-sharp at any physical size.",
    },
    {
      question: "Is it really free with no signup or watermark?",
      answer:
        "Yes. There's no account, no watermark and no limit, generate, brand and download as many image QR codes as you like. Because everything runs client-side in your browser, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: locked image-URL content form with automatic https:// prefixing, live preview, and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-24",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Scan to view' frame with custom label, and the real-time jsQR decode + WCAG contrast scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Clearer direct-vs-preview link guidance for Google Drive/Dropbox and sharper troubleshooting for expired or moved image links.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "pdf-qr-code-generator",
    "video-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default imageQrCodeGenerator;
