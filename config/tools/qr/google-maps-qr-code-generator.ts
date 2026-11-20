import type { Tool } from "@/types";

/**
 * Google Maps QR Code Generator: a single-purpose micro-site over the QR
 * Studio (locked to the "googleMaps" content type). It turns a place name,
 * street address, or a pasted Google Maps link into a QR code that opens the
 * exact location in the Google Maps app or the browser, so anyone can tap
 * "Directions" and navigate straight to your door without typing an address.
 *
 * Honest boundary baked into the copy: the QR opens a Google Maps *search/URL*
 * (`https://www.google.com/maps/search/?api=1&query=...`, or your own pasted
 * maps link). It is a static link encoded locally in the browser: nothing is
 * uploaded, there is no redirect server, and it does not drop a private
 * custom-plotted pin unless you paste a Maps URL that already points to one.
 */
const googleMapsQrCodeGenerator: Tool = {
  slug: "google-maps-qr-code-generator",
  title: "Google Maps QR Code Generator",
  description:
    "Turn any address, place name or Google Maps link into a QR code that opens the location and one-tap directions in Google Maps. Brand it, add a logo, and download print-ready PNG, SVG or PDF, 100% in your browser.",
  category: "qr-tools",
  icon: "Map",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "googleMaps",

  h1: "Google Maps QR Code Generator: Scan for Directions",
  tagline:
    "Type an address or place, or paste a Google Maps link, and get a QR code that opens the exact spot in Google Maps with one-tap turn-by-turn directions. Style it, add your logo, and print it on flyers, signage, packaging or business cards: generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Google Maps QR Code Generator turns a location into a single scannable code that drops customers straight onto your pin in Google Maps: where the 'Directions' button is one tap away. Enter a business name, a full street address, a landmark, or paste a link you copied from Google Maps (a place page, a plus code, or a lat/long share link), and the tool builds a clean, standards-based Maps URL that opens natively in the Google Maps app on iPhone and Android, or in the browser on desktop. From there it hands the code to our desktop-grade QR Studio so it looks like part of your brand: custom colors or a gradient, rounded dot and eye styles, your logo dropped into the centre, a printable frame with a 'Scan for directions' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so a pretty code still scans on the first try from a real-estate sign across a parking lot. Because encoding, styling and export all happen locally in your browser, nothing about your location is sent to a server, stored or logged. No account, no watermark, no tracking. It is a static link: the QR carries whatever address or Maps URL you enter now, so if your storefront moves, you regenerate and reprint. That trade keeps it completely private and free, and it means the code works forever without any hosted redirect that could expire.",

  ctaText: "Generate Maps QR Code",

  keywords: [
    "google maps qr code generator",
    "qr code for google maps",
    "address qr code",
    "qr code for directions",
    "google maps location qr code",
    "map qr code",
    "scan for directions qr code",
    "business location qr code",
    "qr code for maps link",
    "create maps qr code free",
    "google maps qr code with logo",
  ],

  seo: {
    title:
      "Google Maps QR Code Generator, Scan for Directions (Free) | GigAI Tools",
    description:
      "Free Google Maps QR code generator. Enter an address, place or Maps link to make a scan-for-directions QR code, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Navigation",
      title: "Opens directions in one tap",
      description:
        "The code launches your exact spot in the Google Maps app on iPhone and Android, or the browser on desktop, where 'Directions' and turn-by-turn navigation are a single tap away.",
    },
    {
      icon: "Map",
      title: "Address, place or Maps link",
      description:
        "Type a business name or full street address, or paste a link you copied from Google Maps, a place page, a plus code, or a lat/long share link. The tool builds a clean, standard Maps URL either way.",
    },
    {
      icon: "Palette",
      title: "Brand it to match",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan for directions' label so the code looks designed, not generic.",
    },
    {
      icon: "Image",
      title: "Drop in your logo",
      description:
        "Add a store, agency or restaurant logo to the centre with adjustable size and a protected quiet zone: the tool auto-recommends higher error correction so it still scans.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, warning you the instant a choice would make the code hard to scan from a distance.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: sharp enough for a yard sign, storefront decal, flyer, menu or business card.",
    },
  ],

  benefits: [
    {
      title: "Customers never mistype your address",
      description:
        "Instead of copying a street name off a flyer into their phone, people point the camera and land on the right pin. No wrong 'Main St' three towns over, no typos, no lost walk-ins.",
    },
    {
      title: "Directions start instantly",
      description:
        "Because the code opens the Maps app directly on your location, the drive or walk to your door is one 'Directions' tap away, cutting the friction between seeing your ad and arriving.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, logo and a framed call-to-action, the code fits an estate agent's board, a café menu or event signage instead of looking like a generic black-and-white square.",
    },
    {
      title: "Private and free by design",
      description:
        "Your address or Maps link is encoded locally in your browser and never leaves your device. No account, no upload, no server, no tracking pixel following whoever scans it.",
    },
  ],

  howTo: [
    {
      title: "Enter your location",
      description:
        "Type a business name, a full street address, or a landmark, or paste a link you copied straight from Google Maps for a precise pin, plus code or lat/long spot.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Scan for directions' frame, and drop your logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge and preview, then test the on-screen code with your own phone camera to confirm it opens the correct location before you print.",
    },
    {
      title: "Download and print",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling on large signage. Put it wherever people decide to visit: a flyer, window, sign or menu.",
    },
  ],

  formats: {
    input: ["Address / place name", "Google Maps URL"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Estate agent / Realtor",
      title: "Yard signs & property flyers",
      description:
        "Print a 'Scan for directions' code on the board and the brochure so buyers driving past navigate straight to the viewing. No fumbling a listing address into their phone at the kerb.",
    },
    {
      audience: "Restaurant / Café / Retail",
      title: "Find-us on menus & storefront",
      description:
        "Add the code to takeaway menus, flyers and the window so first-time customers get one-tap directions to your door and can leave a review while they're on your Maps page.",
    },
    {
      audience: "Events & venues",
      title: "Get-to-the-venue signage",
      description:
        "Put a Maps QR on tickets, invites and wayfinding posters so attendees navigate to the exact entrance, car park or hall instead of a vague street name.",
    },
    {
      audience: "Delivery & packaging",
      title: "Reorder & visit-us inserts",
      description:
        "Print a code on packaging or leaflets that opens your store's Maps page, turning a delivery box into a route back to your physical location for the next purchase.",
    },
  ],

  troubleshooting: [
    {
      problem: "The QR opens the wrong place or a same-name business elsewhere.",
      solution:
        "A plain name can be ambiguous. Enter a full street address (with city and postcode), or, best of all, search your business in Google Maps, tap Share, copy the link, and paste that URL here so the code points at your exact verified pin.",
    },
    {
      problem: "I want it to open the Google Maps app, not the website.",
      solution:
        "On phones with the Google Maps app installed, the standard Maps URL this tool generates opens the app automatically. On desktop or a device without the app, it opens Maps in the browser, which is the correct fallback, there's no way to force-install an app from a QR.",
    },
    {
      problem: "The code scans but no location loads.",
      solution:
        "Check the address is spelled and formatted the way Google Maps expects, or paste a working Maps link instead. Also confirm the scanning device has internet: a Maps link needs a connection to load the map, unlike an offline Wi-Fi or text code.",
    },
    {
      problem: "My pasted Google Maps link is very long and clutters the code.",
      solution:
        "Long share URLs still encode fine, but denser codes need good print size and contrast. If a link is enormous, use a place name plus full address instead, or raise error correction and print larger so the extra data stays scannable.",
    },
  ],

  tips: [
    "For the most reliable pin, search your business in Google Maps, tap Share, and paste that link here. It beats a typed name for accuracy and opens the app directly.",
    "Include the city and postcode with any street address so scanners don't land on a same-named road in another town.",
    "Add a short 'Scan for directions' frame label so passers-by know what the code does before they raise their camera.",
    "Print large and high-contrast for outdoor or drive-by signage, a dark code on a light background scans from far further away than pale-on-pale.",
    "Moving premises? Regenerate and reprint, the QR carries the exact address or link you enter now, with no hosted redirect to update.",
  ],

  security:
    "Your address or Google Maps link is encoded into the QR entirely in your browser. It is never uploaded, stored or logged, and there is no account. The finished code is a static link to a public Google Maps location, so anyone who scans it can see and navigate to that place, exactly like reading the address off a sign. There is no redirect server or analytics between the scan and Google Maps, so nobody is tracked through the code, and it keeps working with no subscription to expire.",

  faq: [
    {
      question: "How does a Google Maps QR code work?",
      answer:
        "The code stores a standard Google Maps URL for your location. When a phone camera scans it, the operating system opens that link (launching the Google Maps app (if installed) or the browser) directly on your pin, where the 'Directions' button starts turn-by-turn navigation with one tap.",
    },
    {
      question: "Can I use a place name and address, or do I need a Maps link?",
      answer:
        "Either works. You can type a business name, a full street address, or a landmark and the tool builds a Google Maps search URL for it. For the most precise result, paste a link you copied from Google Maps (a place page, plus code or lat/long share link) so the code points at your exact verified pin.",
    },
    {
      question: "Will the QR open the Google Maps app or a website?",
      answer:
        "On phones with the Google Maps app installed, the standard URL this tool generates opens the app automatically. On desktop, or a device without the app, it opens Google Maps in the browser instead, the correct, universal fallback so the code works for everyone.",
    },
    {
      question: "Does it work on both iPhone and Android?",
      answer:
        "Yes. Any modern iPhone or Android phone reads the code with its built-in camera app and opens the Maps link. If Google Maps is installed it launches the app. Otherwise it opens in the phone's browser. No special scanner app is required.",
    },
    {
      question: "Can I add my logo and brand colors to the Maps QR?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan for directions' frame, and drop your logo into the centre from the Logo tab. The live scannability check makes sure your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Is the Maps QR code dynamic. Can I change the location later without reprinting?",
      answer:
        "No, and we're upfront about that: this is a static QR that encodes the exact address or Maps URL you enter now, because the tool has no server or database to redirect through. If your location changes, regenerate and reprint the code. The upside is total privacy and a link that never expires. Nothing is hosted or tracked.",
    },
    {
      question: "Is scanning the code tracked, and does anyone see who scanned it?",
      answer:
        "No. There is no redirect server, no analytics and no tracking between the scan and Google Maps: the code opens the Maps link directly. That means no scan counts or visitor data on our side, but also complete privacy for whoever scans it.",
    },
    {
      question: "Is it really free with no signup?",
      answer:
        "Yes. There's no account, no watermark and no limit, generate, brand and download as many Google Maps QR codes as you like. Because it all runs client-side, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, locked Google Maps content form (address / place / Maps URL), standard maps.google.com search URL output, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-24",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Scan for directions' frame with custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved handling of pasted Google Maps share links (place pages, plus codes, lat/long) and clearer guidance for picking an exact verified pin over an ambiguous place name.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "vcard-qr-code-generator",
    "wifi-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default googleMapsQrCodeGenerator;
