import type { Tool } from "@/types";

/**
 * Wi-Fi QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "wifi" content type). It turns a network name, password
 * and security type into a scannable Wi-Fi QR that phones join with one tap. No
 * typing a long password out loud to guests. Every string here is written for
 * the exact queries people search when they want to print a Wi-Fi code for a
 * café table tent, an Airbnb welcome card, a reception desk or a home office.
 *
 * Honest boundary baked into the copy: the QR encodes your real SSID/password
 * (WPA/WEP/open) in the standard `WIFI:` format locally in the browser. It is a
 * static credential card, not a "dynamic" code, and nothing is uploaded.
 */
const wifiQrCodeGenerator: Tool = {
  slug: "wifi-qr-code-generator",
  title: "WiFi QR Code Generator",
  description:
    "Create a scannable Wi-Fi QR code so guests join your network with one tap. No typing the password. Style it, add a logo, and download print-ready PNG, SVG or PDF. 100% in your browser.",
  category: "qr-tools",
  icon: "Wifi",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-14",
  illustration: "wifi",

  h1: "WiFi QR Code Generator, One-Tap Network Access",
  tagline:
    "Type your network name and password once and get a QR code that phones scan to join instantly. Brand it, add your logo, and print it for guests, cafés, offices and rentals, generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI WiFi QR Code Generator turns your Wi-Fi credentials into a single scannable code that iPhones and Android phones recognise natively: point the camera, tap the banner, and you're connected. No reading a 24-character password aloud, no typos, no re-sharing when someone new arrives. Enter your network name (SSID), choose the security type (WPA/WPA2/WPA3, WEP, or an open network with no password), type the password, and flag it if your SSID is hidden. The tool builds the exact standard `WIFI:T:WPA;S:...;P:...;;` payload that phone cameras understand, then hands it to our desktop-grade QR Studio so you can make it look like yours: custom colors or a gradient, rounded dot and eye styles, your café or company logo dropped in the centre, a printable frame with a 'Scan to connect' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so the pretty code still actually scans on the first try. Because everything (encoding, styling and export) happens locally in your browser, your Wi-Fi password is never sent to a server, stored or logged. This is a static credential card: it encodes the real password you enter, so anyone who scans the printed code can join, exactly like reading the password off a sticker (only faster and typo-free).",

  ctaText: "Generate Wi-Fi QR Code",

  keywords: [
    "wifi qr code generator",
    "wifi qr code",
    "qr code for wifi",
    "generate wifi qr code",
    "wifi password qr code",
    "scan to connect wifi",
    "qr code wifi password",
    "guest wifi qr code",
    "create wifi qr code free",
    "wifi qr code with logo",
    "printable wifi qr code",
    "wpa2 qr code",
  ],

  seo: {
    title: "WiFi QR Code Generator: Scan to Connect (Free, No Signup) | GigAI Tools",
    description:
      "Free WiFi QR code generator. Enter your SSID and password to make a scan-to-connect Wi-Fi QR code, add a logo and colors, and download print-ready PNG, SVG or PDF. Runs 100% in your browser: password never uploaded.",
  },

  features: [
    {
      icon: "Wifi",
      title: "One-tap scan-to-connect",
      description:
        "Encodes the standard WIFI: payload phone cameras read natively, so scanning shows a 'Join network?' banner. No manual password entry, no typos, no dictating a long passphrase.",
    },
    {
      icon: "ShieldCheck",
      title: "WPA/WPA2/WPA3, WEP or open",
      description:
        "Pick the security type your router uses. WPA covers WPA, WPA2 and WPA3 networks. Choose 'None' for an open guest network so scanners join without a password field.",
    },
    {
      icon: "Palette",
      title: "Brand it to match",
      description:
        "Custom foreground/background colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan to connect' label so the code looks designed, not generic.",
    },
    {
      icon: "Image",
      title: "Drop in your logo",
      description:
        "Add a café, hotel or company logo to the centre with adjustable size and a protected quiet zone, the tool auto-recommends higher error correction so it still scans.",
    },
    {
      icon: "ScanLine",
      title: "Live scannability check",
      description:
        "A real-time validator watches color contrast, quiet-zone margin and logo coverage as you design, warning you the instant a choice would make the code hard to scan.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp enough for a table tent, poster, business card or window decal.",
    },
  ],

  benefits: [
    {
      title: "Guests connect in seconds",
      description:
        "Stick the code on a table tent, welcome card or reception sign and visitors join by pointing their camera. No reading out a password letter by letter or spelling 'zero, capital O'.",
    },
    {
      title: "Zero typos on long passwords",
      description:
        "Modern routers ship 20+ character random passwords. A QR code transfers the exact string, so nobody mistypes an l for a 1 or drops a symbol and blames your Wi-Fi.",
    },
    {
      title: "Looks like part of your brand",
      description:
        "With your colors, logo and a framed call-to-action, the code fits a boutique hotel or café's collateral instead of looking like a black-and-white afterthought.",
    },
    {
      title: "Private by design",
      description:
        "Your SSID and password are encoded locally in your browser and never leave your device. No account, no upload, no server ever sees your network credentials.",
    },
  ],

  howTo: [
    {
      title: "Enter your network details",
      description:
        "Type your network name (SSID) exactly as it appears, choose the security type, and enter the password. Tick 'Hidden network' only if your SSID isn't broadcast.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Scan to connect' frame, and drop your logo into the centre from the Logo tab.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge and preview. Test the on-screen code with your own phone camera before you commit to a design or a print run.",
    },
    {
      title: "Download and print",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling. Place it where guests will see it, a table, a fridge, a reception desk or a welcome card.",
    },
  ],

  formats: {
    input: ["Wi-Fi SSID + password"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Café / Restaurant",
      title: "Table-tent guest Wi-Fi",
      description:
        "Print a branded 'Scan to connect' card for every table so customers get online without flagging down staff, and change it in seconds when you rotate the guest password.",
    },
    {
      audience: "Airbnb / Host",
      title: "Rental welcome card",
      description:
        "Add the Wi-Fi code to your welcome binder or a framed card on the counter so guests connect the moment they arrive, cutting the most common check-in question.",
    },
    {
      audience: "Office / Reception",
      title: "Visitor & meeting-room network",
      description:
        "Put a QR on the reception desk or in each meeting room so clients and contractors join the guest VLAN instantly, without IT reciting a password over the phone.",
    },
    {
      audience: "Home",
      title: "Fridge-door house Wi-Fi",
      description:
        "Stick a tidy, branded code on the fridge or by the router so family, house guests and the babysitter connect themselves instead of asking for the password.",
    },
  ],

  troubleshooting: [
    {
      problem: "The scan connects to the wrong network or fails.",
      solution:
        "Check the SSID matches your router exactly. It is case-sensitive and spaces count ('Cafe WiFi' ≠ 'Cafe WiFi'). Also confirm the security type: choosing WEP for a WPA network (or vice-versa) makes phones refuse to join.",
    },
    {
      problem: "My hidden network won't connect from the code.",
      solution:
        "Enable the 'Hidden network' toggle. Hidden SSIDs aren't broadcast, so the QR must include the hidden flag for phones to probe for and join them. Without it, some devices ignore the code.",
    },
    {
      problem: "The code scans but nothing pops up to join.",
      solution:
        "Native Wi-Fi QR support needs a recent OS (iOS 11+ / Android 10+) and the built-in camera app, not a random scanner. On older phones, install a Wi-Fi-aware QR reader, or the user can read the SSID/password shown after scanning as plain text.",
    },
    {
      problem: "Special characters in my password look wrong.",
      solution:
        "Semicolons, commas, colons, backslashes and quotes are escaped automatically to the Wi-Fi standard, so a password like 'p;a\\ss' encodes correctly. Type it exactly as your router shows it and don't pre-escape it yourself.",
    },
  ],

  tips: [
    "Set up a separate guest network on your router and generate the code for that. You share fast Wi-Fi without handing out the password to your main devices.",
    "Bump error correction to Q or H (or add a logo. The tool does this for you) so the code still scans if it gets a coffee ring or a scuff on a printed card.",
    "Keep strong contrast: a dark code on a light background scans far more reliably than pale-on-pale or a busy photo behind it.",
    "Test the printed code, not just the screen: print one, scan it under the actual lighting where it'll live, then run the batch.",
    "Rotating a public guest password monthly? Regenerate and reprint the card each time. The QR always carries whatever password you type now.",
  ],

  security:
    "Your network name and password are encoded into the QR entirely in your browser using the standard WIFI: format. They are never uploaded, stored or logged, and there is no account. Remember that the finished QR is a static credential: it contains the real password, so anyone who scans the printed code can join your network, exactly like reading it off a sticker. Print it where only the people you trust will see it, and use a dedicated guest network for anything public.",

  faq: [
    {
      question: "How does a Wi-Fi QR code work?",
      answer:
        "The code stores your network name, security type and password in a standard text format (starting with 'WIFI:'). When a modern phone camera scans it, the operating system recognises that format and offers a one-tap 'Join network?' prompt, so the phone types the password for the user automatically, with no chance of a typo.",
    },
    {
      question: "Is my Wi-Fi password uploaded anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. Your SSID and password are never sent to a server, stored, or logged. There is no account and nothing leaves your machine. Close the tab and no trace remains.",
    },
    {
      question: "Which security type should I choose: WPA, WEP or None?",
      answer:
        "Choose WPA for virtually all modern routers. The same 'WPA' option covers WPA, WPA2 and WPA3 networks. Pick WEP only for very old equipment that still uses it. Choose 'None' for a genuinely open network with no password, and the QR will omit the password field entirely.",
    },
    {
      question: "Will this work on both iPhone and Android?",
      answer:
        "Yes. iPhones on iOS 11 or later and Android phones on Android 10 or later read Wi-Fi QR codes with the built-in camera app and show a join prompt. On older devices, users can install a Wi-Fi-aware QR reader, or simply read the network name and password the scan reveals as text.",
    },
    {
      question: "Can I add my logo and brand colors to the Wi-Fi QR?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to connect' frame, and drop your logo into the centre from the Logo tab. The live scannability check ensures your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Is the Wi-Fi QR code dynamic: can I change the password later without reprinting?",
      answer:
        "No, and we're honest about that: this is a static QR that encodes the exact password you type now, because the tool has no server or database to redirect through. If you change your Wi-Fi password, regenerate the code and reprint it. The upside is total privacy: nothing is hosted or tracked.",
    },
    {
      question: "What resolution should I export for printing?",
      answer:
        "For a table tent, card or poster, export a PNG or PDF at 1024px or higher: the tool goes up to 4096px. For anything that may be resized (signage, large prints), use the SVG export, which is vector and stays razor-sharp at any size.",
    },
    {
      question: "Is it really free with no signup?",
      answer:
        "Yes. There's no account, no watermark and no limit: generate, brand and download as many Wi-Fi QR codes as you like. Because it all runs client-side, there's nothing to charge for and nothing to sign up to.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release, locked Wi-Fi content form (SSID, security, password, hidden), standard WIFI: payload with automatic special-character escaping, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-22",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Scan to connect' frame with custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved hidden-network handling and WEP/open-network guidance, plus clearer troubleshooting for OS/version support on older phones.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "vcard-qr-code-generator",
    "upi-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default wifiQrCodeGenerator;
