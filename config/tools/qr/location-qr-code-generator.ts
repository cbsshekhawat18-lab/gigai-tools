import type { Tool } from "@/types";

/**
 * Location QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "geo" content type). It turns a latitude/longitude pair
 * into a scannable `geo:` QR that phones open directly in their native maps app,
 * dropping a pin exactly where you point it. No typing an address, no "it's the
 * grey building next to the bakery" directions. Every string here targets the
 * real queries people search when they want a printed pin for an event flyer,
 * a delivery gate, a trailhead sign, a real-estate board or a shop window.
 *
 * Honest boundary baked into the copy: the QR encodes the exact coordinates you
 * enter in the standard `geo:lat,lng` format locally in the browser. It is a
 * static pin, not a tracked/dynamic link: nothing is uploaded, and it opens
 * whichever maps app the scanning phone defaults to.
 */
const locationQrCodeGenerator: Tool = {
  slug: "location-qr-code-generator",
  title: "Location QR Code Generator",
  description:
    "Turn GPS coordinates into a scannable location QR code that opens a dropped pin in Google Maps or Apple Maps. Style it, add a logo, and download print-ready PNG, SVG or PDF: 100% in your browser.",
  category: "qr-tools",
  icon: "MapPin",
  accent: "emerald",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "geo",

  h1: "Location QR Code Generator: Scan to Open the Map Pin",
  tagline:
    "Enter a latitude and longitude once and get a QR code that opens your exact spot in the phone's native maps app: a dropped pin, ready for directions. Brand it, add a logo, and print it for flyers, venues, gates and trailheads, generated entirely in your browser and never uploaded.",
  longDescription:
    "The GigAI Location QR Code Generator turns a pair of GPS coordinates into a single scannable code that iPhones and Android phones open straight in their default maps app, point the camera, tap the banner, and a pin drops on the exact spot with 'Directions' one tap away. No dictating an address, no long links, no confusion about which of three identical entrances to use. Paste a latitude and longitude (from Google Maps' right-click, a phone's compass app, or a survey), add an optional label so the pin reads with a friendly name, and the tool builds the exact standard `geo:lat,lng?q=Label` payload that phone cameras understand. It then hands that payload to our desktop-grade QR Studio so the code looks like yours: custom colors or a gradient, rounded dot and eye styles, your logo or a small map marker dropped into the centre, a printable frame with a 'Scan for directions' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so a pretty pin still scans on the first try under real-world lighting. Because encoding, styling and export all happen locally in your browser, the coordinates you enter are never sent to a server, stored or logged: there's no account and nothing to track. This is a static geo pin: it encodes the coordinates you type, so a scanner is taken to that fixed point and can then choose walking, driving or transit directions in their own maps app of choice.",

  ctaText: "Generate Location QR Code",

  keywords: [
    "location qr code generator",
    "gps qr code generator",
    "qr code for location",
    "coordinates qr code",
    "geo qr code",
    "map qr code generator",
    "latitude longitude qr code",
    "qr code that opens google maps",
    "address qr code generator",
    "printable location qr code",
    "location qr code with logo",
  ],

  seo: {
    title:
      "Location QR Code Generator, Scan to Open Map Pin (Free, No Signup) | GigAI Tools",
    description:
      "Free location QR code generator. Enter GPS coordinates to make a scan-to-open map pin that launches Google Maps or Apple Maps, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser, coordinates never uploaded.",
  },

  features: [
    {
      icon: "MapPin",
      title: "Drops a pin at exact coordinates",
      description:
        "Encodes the standard geo: payload phone cameras read natively, so scanning opens a dropped pin at your precise latitude/longitude. Not a fuzzy address search that might land a block away.",
    },
    {
      icon: "Navigation",
      title: "Opens the native maps app",
      description:
        "The scan launches whichever maps app the phone defaults to (Google Maps, Apple Maps or another) with a 'Directions' button already there, so guests navigate in one more tap.",
    },
    {
      icon: "Tag",
      title: "Optional friendly pin label",
      description:
        "Add a name like 'Main Entrance' or 'North Gate' and it rides along in the payload, so the dropped pin reads with a human label instead of a bare set of numbers.",
    },
    {
      icon: "Palette",
      title: "Brand it to match",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan for directions' label so the code looks designed, not generic.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, warning you the instant a choice would make the pin hard to scan.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px: sharp enough for a flyer, a lawn sign, a shop window decal or a festival map.",
    },
  ],

  benefits: [
    {
      title: "No more 'you can't miss it' directions",
      description:
        "A dropped pin removes the guesswork of vague addresses, unmarked driveways and identical-looking entrances, scanners get the precise point and their own turn-by-turn directions.",
    },
    {
      title: "Perfect for places without a clean address",
      description:
        "Trailheads, festival gates, delivery docks, parking lots, farm stands and pop-up stalls often have no mailable address. Coordinates pin them exactly where an address can't.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, logo and a framed call-to-action, the code fits a real-estate board, event flyer or storefront instead of looking like a black-and-white afterthought.",
    },
    {
      title: "Private by design",
      description:
        "Your coordinates are encoded locally in your browser and never leave your device. No account, no upload, no server ever sees where the pin points.",
    },
  ],

  howTo: [
    {
      title: "Get your coordinates",
      description:
        "In Google Maps, right-click the exact spot and click the latitude/longitude to copy it, or read them from your phone's compass or a maps app. Paste latitude and longitude into the fields.",
    },
    {
      title: "Add an optional label",
      description:
        "Type a friendly name for the pin ('Reception', 'Trailhead Parking', '12 Oak St Rear Gate') so the dropped pin reads clearly. Leave it blank for a bare-coordinate pin.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Scan for directions' frame, and drop your logo or a map marker into the centre from the Logo tab.",
    },
    {
      title: "Check it scans, then download",
      description:
        "Watch the live scannability badge, test the on-screen code with your own phone, then export a high-resolution PNG or PDF for print, or an SVG for infinite scaling.",
    },
  ],

  formats: {
    input: ["Latitude + longitude", "Optional pin label"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Events / Weddings",
      title: "Venue pin on the invite",
      description:
        "Print the code on invitations, flyers and posters so guests scan straight to the exact venue entrance or car park. No address typos and no lost wedding guests circling the block.",
    },
    {
      audience: "Real estate",
      title: "Property location on signage",
      description:
        "Put the pin on a for-sale board or brochure so prospects open the precise lot in maps for a self-guided drive-by, even when the plot has no formal street number yet.",
    },
    {
      audience: "Retail / Delivery",
      title: "Find the right door or dock",
      description:
        "Mark the customer entrance, curbside pickup bay or loading dock so drivers and shoppers land at the correct point of a large building or business park, not the front reception.",
    },
    {
      audience: "Parks / Tourism",
      title: "Trailheads & points of interest",
      description:
        "Post codes at trailheads, viewpoints and info boards so hikers and visitors drop a pin for navigation and their return route, even where there's no street address at all.",
    },
  ],

  troubleshooting: [
    {
      problem: "The scan opens the wrong spot or a nearby address.",
      solution:
        "Double-check the coordinate order and signs: latitude comes first, then longitude, and southern latitudes (negative) or western longitudes (negative) must keep their minus sign. Copying from Google Maps preserves the correct order and signs automatically.",
    },
    {
      problem: "It opens a maps search instead of dropping a pin.",
      solution:
        "A pure geo: code drops a pin at the coordinates. If you want it to force a specific maps app or a named place search instead, use the Google Maps QR tool. This tool is intentionally app-neutral so it opens whichever maps app the scanner prefers.",
    },
    {
      problem: "The label shows but the pin is slightly off.",
      solution:
        "The pin always lands on the exact latitude/longitude. The label is just a name shown alongside it. If the point looks off, re-copy the coordinates from the precise spot. Even a few decimal places can shift the pin by tens of metres.",
    },
    {
      problem: "The code scans but nothing happens on an older phone.",
      solution:
        "Native geo: handling needs a recent OS and the built-in camera app, not a random scanner. On older devices, install a maps-aware QR reader, or the scanner can read the coordinates the scan reveals as plain text and paste them into any maps app.",
    },
  ],

  tips: [
    "Copy coordinates from Google Maps by right-clicking the exact spot and clicking the numbers. It keeps latitude/longitude order and minus signs correct so the pin lands right.",
    "Add a short label like 'Rear Gate' or 'Guest Parking' so the dropped pin is instantly recognisable, especially on large sites with several entrances.",
    "Bump error correction to Q or H (or add a logo. The tool does this for you) so the code still scans if a printed flyer gets creased, rained on or scuffed.",
    "Keep strong contrast: a dark code on a light background scans far more reliably outdoors and in low light than pale-on-pale or a busy photo behind it.",
    "Test the printed code under the real lighting where it'll live (a window decal in daylight, a lawn sign at dusk) before you commit to a full print run.",
  ],

  security:
    "The latitude and longitude you enter are encoded into the QR entirely in your browser using the standard geo: format. They are never uploaded, stored or logged, and there is no account. Remember that the finished QR is a static pin: it contains the exact coordinates you type, so anyone who scans the printed code is taken to that fixed point. It does not track scans or the scanner's location, and it does not report anything back to you. Place it where you intend those coordinates to be public, exactly as you would print an address.",

  faq: [
    {
      question: "How does a location QR code work?",
      answer:
        "The code stores a latitude and longitude in a standard text format (starting with 'geo:'). When a modern phone camera scans it, the operating system recognises that format and opens the coordinates in the default maps app, dropping a pin at the exact point with a 'Directions' button, so the scanner navigates there with no typing.",
    },
    {
      question: "Does it open Google Maps or Apple Maps?",
      answer:
        "Whichever the scanning phone prefers. A geo: code is app-neutral: iPhones typically open Apple Maps and most Android phones open Google Maps, but the phone honours the user's default. If you specifically need to force Google Maps or a named place search, use our Google Maps QR tool instead.",
    },
    {
      question: "Where do I get the latitude and longitude?",
      answer:
        "The easiest way is Google Maps on a computer: right-click the exact spot and click the coordinates that appear to copy them. On a phone, drop a pin and read the coordinates from the place card, or use a compass/GPS app. Paste latitude first, then longitude, keeping any minus signs.",
    },
    {
      question: "Are my coordinates uploaded or tracked anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. The coordinates are never sent to a server, stored or logged, there is no account, and the code itself doesn't track scans or the scanner's location: close the tab and no trace remains.",
    },
    {
      question: "Can I add a name or label to the pin?",
      answer:
        "Yes. Add an optional label like 'Main Entrance' or 'North Trailhead' and it's included in the payload so the dropped pin reads with that friendly name alongside the coordinates. Leave it blank and the scan simply drops an unnamed pin at the point.",
    },
    {
      question: "Will it work on both iPhone and Android?",
      answer:
        "Yes. Recent iPhones and Android phones read geo: QR codes with the built-in camera app and open the point in the default maps app. On older devices, users can install a maps-aware QR reader, or read the coordinates the scan reveals as text and paste them into any maps app.",
    },
    {
      question: "Can I change where the pin points later without reprinting?",
      answer:
        "No, and we're honest about that: this is a static QR that encodes the exact coordinates you type now, because the tool has no server or database to redirect through. If the location changes, regenerate the code and reprint it. The upside is total privacy. Nothing is hosted, redirected or tracked.",
    },
    {
      question: "Can I add my logo and brand colors to the location QR?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan for directions' frame, and drop your logo or a map marker into the centre from the Logo tab. The live scannability check keeps your branding from breaking the scan, and it auto-raises error correction when you add a logo.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, locked geo content form (latitude, longitude, optional label), standard geo:lat,lng?q= payload, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-25",
      change:
        "Added logo/map-marker drop-in with auto error-correction bump, a 'Scan for directions' frame with a custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Clarified coordinate order/sign guidance and app-neutral behaviour, and improved troubleshooting for older phones and off-by-a-decimal pin placement.",
    },
  ],

  relatedTools: [
    "google-maps-qr-code-generator",
    "qr-code-generator",
    "vcard-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default locationQrCodeGenerator;
