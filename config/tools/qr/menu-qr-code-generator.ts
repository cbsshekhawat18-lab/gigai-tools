import type { Tool } from "@/types";

/**
 * Menu QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "url" content type). It turns the web address of your
 * digital menu: a hosted PDF, an ordering page, a Linktree, a Google Doc or
 * your own site, into a scannable QR wrapped in a table-tent "Scan for Menu"
 * frame, so diners open the menu on their own phone the moment they sit down.
 * Every string here targets the exact queries restaurant, café, bar and food-
 * truck owners search when they want a contactless, no-app, print-and-place
 * menu code for their tables.
 *
 * Honest boundary baked into the copy: this encodes the menu LINK you already
 * host. It is a static QR built locally in the browser, not a hosted menu
 * builder and not a dynamic code you can re-point after printing. If the link
 * changes, regenerate and reprint. Nothing is uploaded.
 */
const menuQrCodeGenerator: Tool = {
  slug: "menu-qr-code-generator",
  title: "Menu QR Code Generator",
  description:
    "Turn your online menu link into a table-tent QR code with a 'Scan for Menu' frame. Diners open the menu on their own phone. No app, no touching. Brand it, add your logo, and download print-ready PNG, SVG or PDF. 100% in your browser.",
  category: "qr-tools",
  icon: "UtensilsCrossed",
  accent: "orange",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "menu-qr-code-generator",

  h1: "Menu QR Code Generator, Contactless Table Menus",
  tagline:
    "Paste the link to your online menu and get a QR code framed as a ready-to-print table tent that says 'Scan for Menu'. Guests open your menu on their own phone. No app, no shared laminated cards. Brand it with your colors and logo, verify it scans, and export print-ready PNG, SVG or PDF, all in your browser.",
  longDescription:
    "The GigAI Menu QR Code Generator makes the one thing every restaurant, café, bar and food truck actually needs at the table: a clean, branded QR code that opens your menu on the diner's own phone, wrapped in a printable table-tent frame with a clear 'Scan for Menu' call-to-action. You keep hosting the menu wherever it already lives: a PDF on your website, a Square or Toast ordering page, a Google Doc, a Linktree, an Instagram link or your own domain, and this tool encodes that exact link into a QR that any modern iPhone or Android camera opens with a tap, no app to download and nothing to touch but the guest's own screen. Then you make it yours in our desktop-grade QR Studio: match your brand colors or a warm gradient, choose rounded dots and eye shapes, drop your restaurant logo into the centre, and pick a 'Scan for Menu' frame styled for a folded table tent, a window decal or a counter sign. A live scannability check runs an actual decode plus a contrast test as you design, so a code that looks good on the mockup still scans on the first try under dim restaurant lighting. When it's ready, export a crisp PNG for a laminated card, a print-ready PDF for your print shop, a scalable SVG for signage of any size, or JPG/WEBP/EPS: up to 4096px. Because encoding, styling and export all happen locally in your browser, your menu link is never uploaded, logged or stored, and there is no account, no watermark and no monthly fee. One honest note: this builds a static QR that points at the menu link you enter now, so if you move the menu to a new address, regenerate the code and reprint the tents. The upside is total privacy and a code that never expires as long as your link stays live.",

  ctaText: "Create Menu QR Code",

  keywords: [
    "menu qr code generator",
    "qr code for menu",
    "restaurant qr code menu",
    "digital menu qr code",
    "scan for menu qr code",
    "contactless menu qr code",
    "table qr code menu",
    "qr code menu maker free",
    "cafe menu qr code",
    "food truck qr code menu",
    "pdf menu qr code",
    "restaurant table tent qr code",
  ],

  seo: {
    title:
      "Menu QR Code Generator, Free 'Scan for Menu' Table Codes (PNG/SVG/PDF) | GigAI Tools",
    description:
      "Free menu QR code generator for restaurants and cafés. Paste your online menu link to make a branded 'Scan for Menu' table-tent QR code, add your logo, verify it scans, and download print-ready PNG, SVG or PDF. 100% in-browser, no app, no watermark.",
  },

  features: [
    {
      icon: "UtensilsCrossed",
      title: "Table-tent 'Scan for Menu' frame",
      description:
        "Wrap the code in a print-ready frame with a clear 'Scan for Menu' call-to-action, tuned for a folded table tent, a counter sign or a window decal, so guests know instantly what to point their camera at.",
    },
    {
      icon: "Smartphone",
      title: "No app, no touching",
      description:
        "The menu opens on the diner's own phone with the built-in camera. No downloads, no logins, no shared laminated cards passed hand to hand. True contactless dining from a single scan.",
    },
    {
      icon: "Link",
      title: "Works with any menu you already host",
      description:
        "Encode a PDF on your site, a Toast or Square ordering page, a Google Doc, a Linktree, an Instagram link or your own domain. You keep the menu where it lives. The QR just points at it.",
    },
    {
      icon: "Palette",
      title: "Brand it to your restaurant",
      description:
        "Custom colors or a warm gradient, rounded dot and eye styles, and your logo dropped into the centre so the code matches your signage and menu design instead of looking like a generic square.",
    },
    {
      icon: "ScanLine",
      title: "Live scan & contrast check",
      description:
        "A real-time validator decodes the rendered code and checks WCAG contrast and quiet-zone as you design, warning you before a color or logo choice makes the tent fail under dim restaurant lighting.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF, EPS, JPG or WEBP at up to 4096px, sharp on a laminated tent, a A-board poster or a tiny sticker on the check presenter.",
    },
  ],

  benefits: [
    {
      title: "Faster table turns, fewer printed menus",
      description:
        "Guests browse the moment they sit down instead of waiting for a menu, and you stop reprinting laminated cards every time a price or special changes, update the hosted menu and every tent still points to it.",
    },
    {
      title: "Contactless and hygienic by default",
      description:
        "No menu is handled by dozens of diners a day. Each guest reads from their own phone, which is exactly what customers, staff and health inspectors prefer.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, logo and a 'Scan for Menu' frame, the tent fits a bistro, a speciality coffee bar or a fine-dining room instead of looking like a printout taped to the table.",
    },
    {
      title: "Private, free and no app to push",
      description:
        "No account, no watermark, no per-scan fee, and nothing installed by you or your guests. Your menu link is encoded locally in your browser and never leaves your device.",
    },
  ],

  howTo: [
    {
      title: "Host your menu and copy the link",
      description:
        "Put your menu online, a PDF, an ordering page, a Google Doc set to 'anyone with the link', a Linktree or a page on your site, then copy that web address.",
    },
    {
      title: "Paste the link",
      description:
        "Drop the menu URL into the field. The QR builds and previews live, and the tool auto-adds the https:// prefix so the code always opens the right page.",
    },
    {
      title: "Brand and frame it",
      description:
        "Set your colors or a gradient and dot/eye styles, drop your logo in the centre, and keep the 'Scan for Menu' table-tent frame, or edit the label to 'View Menu', 'Order Here', etc.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge and test the on-screen code with your own phone. Print one tent, scan it under your actual table lighting, then print the run.",
    },
    {
      title: "Download and place",
      description:
        "Export a high-resolution PDF or PNG for the print shop, or an SVG for large signage, then fold the tents onto tables, the counter, the door and the check presenter.",
    },
  ],

  formats: {
    input: ["Menu URL / link"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Restaurant",
      title: "One tent on every table",
      description:
        "Print a branded 'Scan for Menu' tent for each table so diners browse and pre-decide while they wait, and when you change the menu, you update the hosted file, not the tents.",
    },
    {
      audience: "Café / Coffee bar",
      title: "Counter and window menu",
      description:
        "Put a code on the counter and one in the window so passers-by and the queue can read the drinks and food list on their phone before they reach the till.",
    },
    {
      audience: "Bar / Pub",
      title: "Cocktail & drinks list",
      description:
        "Point the code at your seasonal cocktail PDF so you can rotate the list weekly without reprinting a single table card: just swap the hosted file.",
    },
    {
      audience: "Food truck / Pop-up",
      title: "Order-here board",
      description:
        "Stick a large-format code on the service window linked to your ordering page or menu, so a queue can browse and even order ahead from the pavement.",
    },
  ],

  troubleshooting: [
    {
      problem: "The code opens the wrong page or a 'file not found' error.",
      solution:
        "Re-copy the exact menu link and paste it in fresh, a truncated or expired share link is the usual cause. If your menu is a Google Doc or Drive PDF, set sharing to 'Anyone with the link', otherwise guests hit a sign-in wall.",
    },
    {
      problem: "The menu QR scans but the page is slow or hard to read on a phone.",
      solution:
        "The QR only opens the link. The reading experience is your hosted menu. Use a mobile-friendly page or a PDF that's readable at phone width. A giant desktop PDF forces guests to pinch-zoom. Consider a simple mobile menu page or a Linktree of sections.",
    },
    {
      problem: "The code won't scan on a dark or laminated table tent.",
      solution:
        "Keep a dark code on a light background with a generous quiet-zone margin, and avoid glossy lamination glare over the code. The live scannability check flags low contrast. If you added a logo, raise error correction to Q or H so it stays readable.",
    },
    {
      problem: "I want to change the menu link without reprinting all my tents.",
      solution:
        "This tool makes a static code, so the fix is to point it at a link you control and re-point that on your side: e.g. always encode 'yoursite.com/menu' and update what that page shows, or use a link-shortener you manage. Then the printed tents never need to change.",
    },
  ],

  tips: [
    "Encode a stable link you control (like yoursite.com/menu) rather than a long PDF share URL: then you can swap the menu behind it without ever reprinting a tent.",
    "Add your logo and bump error correction to Q or H so the code still scans if a tent gets a coffee ring, a scuff or a bit of lamination glare.",
    "Keep strong contrast and a clear quiet zone, a dark code on a light tent scans far more reliably than pale-on-pale or a code over a busy photo.",
    "Print one tent and scan it under the actual restaurant lighting before you run the whole batch. Screen tests can hide real-world glare and dimness.",
    "Make sure the menu page itself is mobile-friendly. The QR is only as good as the page it opens, and a pinch-to-zoom desktop PDF frustrates guests.",
  ],

  security:
    "Your menu link is encoded into the QR entirely in your browser. It is never uploaded, stored or logged, and there is no account. The finished code is a static QR that simply opens the URL you entered, so it contains no personal data about your diners and nothing about your business beyond the public menu link you chose to encode. Because it's static, it never expires as long as that link stays live. If you move the menu to a new address, regenerate the code and reprint the tents. Uploaded logos are read locally and never leave the tab.",

  faq: [
    {
      question: "How do I make a QR code for my restaurant menu?",
      answer:
        "Host your menu somewhere online (a PDF on your website, an ordering page, a Google Doc, a Linktree or your own menu page) then paste that link here. The tool encodes it into a QR code wrapped in a 'Scan for Menu' table-tent frame that you can brand with your colors and logo, then download as a print-ready PNG, PDF or SVG. Guests scan it with their phone camera and your menu opens instantly, no app needed.",
    },
    {
      question: "Do my customers need an app to scan the menu QR code?",
      answer:
        "No. Every modern iPhone (iOS 11+) and Android phone (Android 10+) reads QR codes with the built-in camera app, the guest just points the camera at the tent and taps the banner that appears. There is no app to download, no account to create and nothing to install. That's what makes it genuinely contactless and frictionless at the table.",
    },
    {
      question: "Can I update the menu without reprinting all the table tents?",
      answer:
        "Yes, if you plan the link right. This tool makes a static QR that opens the exact URL you enter, so the trick is to encode a stable address you control, like yoursite.com/menu or a link-shortener you manage, and change what that page shows on your side. Then you update the menu content without touching the printed tents. If you instead encode a specific PDF file and later move it, you'd need to regenerate and reprint.",
    },
    {
      question: "Is this menu QR code generator free, and is there a watermark?",
      answer:
        "It's completely free with no watermark, no signup and no per-scan or monthly fee. Generate, brand and download as many menu QR codes as you like. Because everything runs client-side in your browser, there's nothing to charge for and nothing to sign up to. You own the exported files outright.",
    },
    {
      question: "Can I add my restaurant's logo and colors to the menu QR code?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a warm gradient and rounded dot/eye styles, drop your logo into the centre from the Logo tab, and keep or re-label the 'Scan for Menu' frame. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo so it stays readable on a printed tent.",
    },
    {
      question: "What should I link the QR code to, a PDF, a website or an ordering page?",
      answer:
        "Any web link works. A hosted PDF is the quickest. A mobile-friendly menu page on your site reads best on a phone. An ordering page (Toast, Square, your own) lets guests order from the table. Whatever you choose, make sure it's public (set Google Docs/Drive to 'anyone with the link') and mobile-friendly, since the QR is only as good as the page it opens.",
    },
    {
      question: "What size and format should I export for printing table tents?",
      answer:
        "For a folded table tent, laminated card or counter sign, export a PDF or a PNG at 1024px or higher. The tool goes up to 4096px. For large signage, A-boards or window decals that may be resized, use the SVG export, which is vector and stays razor-sharp at any physical size. Always print one and scan it before running the full batch.",
    },
    {
      question: "Is my menu link or any customer data uploaded anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. Your menu link is never sent to a server, stored or logged, and the code contains no data about the diners who scan it. It simply opens the public menu URL you chose. There is no account and no tracking. Close the tab and nothing remains.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, menu-link QR generator locked to the URL encoder with automatic https:// prefixing, a 'Scan for Menu' table-tent frame, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-24",
      change:
        "Added centre-logo drop-in with automatic error-correction bump, editable frame label (Scan for Menu / View Menu / Order Here) and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Warm on-brand default styling for table tents, clearer guidance on stable menu links vs. direct PDF links, and improved troubleshooting for lamination glare and mobile-menu readability.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "wifi-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default menuQrCodeGenerator;
