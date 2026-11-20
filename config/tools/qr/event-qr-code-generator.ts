import type { Tool } from "@/types";

/**
 * Event QR Code Generator, a flagship, single-purpose micro-site over the QR
 * Studio (locked to the "calendar" content type). It turns an event's title,
 * location, start and end times and description into a scannable "add to
 * calendar" QR: point a phone camera at it and the OS offers to drop the event
 * straight into Apple Calendar or Google Calendar, with the reminder already
 * set. No re-typing a date, no "wait, was it 6 or 7pm?".
 *
 * Every string is written for the exact queries organizers, venues and couples
 * type when they want to print a save-the-date, a conference badge, a poster or
 * a wedding invite that a guest can add to their calendar in one tap.
 *
 * Honest boundary baked into the copy: the QR encodes a standard, self-contained
 * iCalendar (VEVENT) locally in the browser. It's a static code. It carries the
 * exact date and time you enter now, has no RSVP or attendance tracking, and
 * nothing is uploaded. Change the date later and you reprint the code.
 */
const eventQrCodeGenerator: Tool = {
  slug: "event-qr-code-generator",
  title: "Event QR Code Generator",
  description:
    "Turn any event into a scan-to-add-to-calendar QR code. Enter the title, place, start and end time, then let guests save it to Apple or Google Calendar in one tap. Brand it, add a logo, and export print-ready PNG, SVG or PDF: 100% in your browser.",
  category: "qr-tools",
  icon: "CalendarDays",
  accent: "violet",
  status: "live",
  createdAt: "2026-06-18",
  illustration: "calendar",

  h1: "Event QR Code Generator, Scan to Add to Calendar",
  tagline:
    "Type your event details once and get a QR code that drops the whole thing (title, location, date and time, reminder) straight into a guest's calendar with one scan. Brand it, add your logo, and print it on invites, badges and posters. Generated entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Event QR Code Generator turns a single event into a scannable code that iPhones and Android phones understand natively: a guest points their camera, taps the prompt, and the event lands in Apple Calendar or Google Calendar with the right date, time, location and description already filled in. No re-typing, no time-zone confusion, no forgetting to actually add it. Enter the event title, the venue or address, pick the start and end date-and-time (or flag it as an all-day event), and add a description with the agenda, dress code or parking notes. The tool builds a standards-compliant iCalendar VEVENT, the same.ics format your calendar app expects, and hands it to our desktop-grade QR Studio so you can make it look like the event, not like a generic square: brand colors or a gradient, rounded dot and finder-eye styles, your logo or monogram dropped in the centre, a printable 'Scan to add to calendar' frame, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so the pretty code on your save-the-date still scans on the first try under real venue lighting. Because everything (encoding, styling and export) happens locally in your browser, your event details are never sent to a server, stored or logged. It's a static code: it carries the exact date and time you enter, works offline once scanned, and needs no account, no RSVP list and no tracking, the honest trade-off being that if the date moves, you regenerate and reprint.",

  ctaText: "Create Event QR Code",

  keywords: [
    "event qr code generator",
    "calendar qr code",
    "save the date qr code",
    "qr code for events",
    "ics qr code",
    "conference qr code",
    "wedding qr code",
    "event invite qr code",
    "qr code with event details",
  ],

  seo: {
    title:
      "Event QR Code Generator, Scan to Add to Calendar (Free) | GigAI Tools",
    description:
      "Free event QR code generator. Enter your event title, location, date and time, and make a scan-to-add-to-calendar QR for invites, badges and posters. Add a logo and colors, export print-ready PNG, SVG or PDF. 100% in-browser, no signup.",
  },

  features: [
    {
      icon: "CalendarPlus",
      title: "One-tap add to calendar",
      description:
        "Encodes a standard iCalendar (VEVENT) that phone cameras read natively, so scanning offers an 'Add to Calendar' prompt, the event drops into Apple or Google Calendar with date, time, place and reminder already set.",
    },
    {
      icon: "Clock",
      title: "Start, end & all-day events",
      description:
        "Set precise start and end date-and-time, or flag an all-day event. The generated .ics carries both, so a guest's calendar blocks exactly the right slot instead of a vague reminder.",
    },
    {
      icon: "MapPin",
      title: "Location & description included",
      description:
        "Add the venue or full address plus a description (agenda, dress code, parking, a meeting link) and it all travels inside the event, tappable straight from the calendar entry.",
    },
    {
      icon: "Palette",
      title: "Brand it to the occasion",
      description:
        "Custom colors or a gradient, rounded dot and eye styles, and a printable 'Scan to add to calendar' frame so the code suits a wedding invite, a conference badge or a corporate poster.",
    },
    {
      icon: "Image",
      title: "Drop in your logo or monogram",
      description:
        "Place a company logo, festival mark or couple's monogram in the centre with a protected quiet zone, the tool auto-raises error correction so the code still scans cleanly.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF or vector EPS at up to 4096px, sharp on a save-the-date card, a lanyard badge, an A1 poster or a window decal.",
    },
  ],

  benefits: [
    {
      title: "Guests never forget the date",
      description:
        "A calendar entry with a reminder beats a date printed on a card that ends up in a drawer. One scan and the event is on their phone, buzzing an hour before. No manual entry, no wrong time.",
    },
    {
      title: "Zero typos on date and time",
      description:
        "Reading '7:30pm, Saturday 14 September, Hall B' off a poster invites mistakes. The QR transfers the exact start, end and location, so everyone's calendar agrees to the minute.",
    },
    {
      title: "Looks like part of the event",
      description:
        "With your colors, logo and a framed call-to-action, the code fits a wedding suite or a conference brand instead of looking like a black-and-white sticker slapped on at the end.",
    },
    {
      title: "Private by design",
      description:
        "Your event details are encoded locally in your browser and never leave your device. No account, no guest list uploaded, no server ever sees where or when your event is.",
    },
  ],

  howTo: [
    {
      title: "Enter the event details",
      description:
        "Type the event title, add the venue or address, and pick the start and end date-and-time. Add a description with the agenda, dress code or a link if you want it inside the calendar entry.",
    },
    {
      title: "Design and brand it",
      description:
        "Open the Design tab to set colors or a gradient and dot/eye styles, add a 'Scan to add to calendar' frame, and drop your logo or monogram into the centre from the Logo tab.",
    },
    {
      title: "Check it scans",
      description:
        "Watch the live scannability badge and preview. Test the on-screen code with your own phone camera and confirm the event lands in your calendar with the right details before you print.",
    },
    {
      title: "Download and place it",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling. Put it on the save-the-date, the invite, the badge, the poster or the event's landing page.",
    },
  ],

  formats: {
    input: ["Event title + date/time + location"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Wedding / Couple",
      title: "Save-the-date & invitation",
      description:
        "Add a scan-to-calendar QR to the save-the-date and the invite so guests block the day the moment they open it, ceremony time, venue and dress code travel inside, styled with your monogram.",
    },
    {
      audience: "Conference / Organizer",
      title: "Session & keynote badges",
      description:
        "Put a QR on posters, lanyards and the programme so attendees add each session, keynote or workshop to their calendar in one scan, with room and time already set. No app to install.",
    },
    {
      audience: "Business / Marketing",
      title: "Webinar & launch reminders",
      description:
        "Drop an event QR on the email footer, landing page or flyer for your webinar or product launch, so prospects add it to their calendar and actually show up, with your join link in the description.",
    },
    {
      audience: "Community / Venue",
      title: "Gigs, meetups & workshops",
      description:
        "Print a QR on the flyer or the door poster for a gig, class or meetup so passers-by save the next date instantly, complete with the address for their maps app to route to.",
    },
  ],

  troubleshooting: [
    {
      problem: "The event adds with the wrong time or time zone.",
      solution:
        "The event is encoded in the local time you enter, without a fixed time zone, so most calendars interpret it in the scanner's own local time, ideal for a physical event everyone attends in person. For an online event across time zones, state the time zone explicitly in the description (e.g. '3pm IST') so remote guests convert it correctly.",
    },
    {
      problem: "Scanning shows text instead of an 'Add to calendar' prompt.",
      solution:
        "Native calendar-QR support needs a recent OS and the built-in camera app, not a random scanner. On iPhone the camera surfaces an event banner. On some Androids you tap the decoded .ics text to open it. On older phones, the scan still reveals the event as readable text the guest can add manually.",
    },
    {
      problem: "The end time is before the start, or the event won't save.",
      solution:
        "Make sure the end date-and-time is after the start, and that both are filled for a timed event. If you only need a day marker, use the all-day option instead of a zero-length timed event, which some calendars reject.",
    },
    {
      problem: "The styled code on my invite won't scan.",
      solution:
        "Watch the live scan-test badge. Usual causes are low contrast (pale code on a busy photo), too small a quiet-zone margin, or a logo covering too much of the code. Raise contrast, keep the margin, shrink the logo, and set error correction to Q or H when using a logo.",
    },
  ],

  tips: [
    "Fill in the description with the agenda, dress code, parking or a video-call link. It all travels inside the calendar entry, so guests have everything without a separate email.",
    "For online or multi-time-zone events, spell out the time zone in the title or description (e.g. '2pm ET / 11am PT') so remote guests don't mis-convert.",
    "Bump error correction to Q or H (or add a logo. The tool does this for you) so the code still scans if the printed invite gets a fold, a scuff or a coffee ring.",
    "Keep strong contrast: a dark code on a light background scans far more reliably on an invitation than pale-on-pale or a code laid over a photo.",
    "Print one and scan it under the real lighting where it'll live (a dim venue, a glossy card, a backlit screen) then run the full print job.",
  ],

  security:
    "Your event title, location, dates and description are encoded into the QR entirely in your browser using the standard iCalendar (VEVENT) format. They are never uploaded, stored or logged, and there is no account or guest list on any server. The finished QR is a static, self-contained code: it carries the exact details you enter, works offline once scanned, and includes no RSVP, attendance tracking or analytics. If the event's date or venue changes, regenerate and reprint the code. That static nature is the trade-off for total privacy and codes that never expire.",

  faq: [
    {
      question: "How does an event QR code work?",
      answer:
        "The code stores your event as a standard iCalendar entry (a VEVENT, the same format as an.ics file) containing the title, location, start and end time and description. When a modern phone camera scans it, the operating system recognises the format and offers an 'Add to Calendar' prompt, so the whole event, with its reminder, drops into Apple Calendar or Google Calendar in one tap, with no manual typing.",
    },
    {
      question: "Will it add the event to both Apple Calendar and Google Calendar?",
      answer:
        "Yes. Because the code uses the universal iCalendar standard, iPhones add it to Apple Calendar and Android phones add it to Google Calendar (or whichever calendar is set as default). The guest doesn't need any special app, the built-in camera and calendar handle it. On older phones without native support, the scan still reveals the event details as text to add manually.",
    },
    {
      question: "Can I set a start and end time, or make it an all-day event?",
      answer:
        "Both. Pick a precise start and end date-and-time and the guest's calendar blocks exactly that slot with a reminder, or flag it as an all-day event for something like a festival day or a deadline. The generated iCalendar carries whichever you choose, so the entry looks right in every calendar app.",
    },
    {
      question: "What time zone does the event use?",
      answer:
        "The event is encoded in the local time you type, without a fixed time zone attached, so calendars interpret it in the scanner's own local time. That's exactly what you want for a physical event everyone attends in person. For an online event spanning time zones, name the time zone in the title or description (e.g. '6pm GMT') so remote guests convert it correctly.",
    },
    {
      question: "Can I add my logo and brand colors to the event QR?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to add to calendar' frame, and drop your logo, festival mark or a couple's monogram into the centre from the Logo tab. The live scannability check ensures your branding doesn't stop the code from scanning, and it auto-raises error correction when you add a logo.",
    },
    {
      question: "Is the event QR code dynamic: can I change the date later without reprinting?",
      answer:
        "No, and we're honest about it: this is a static QR that encodes the exact date, time and details you enter now, because the tool has no server or database to redirect through. If the date, venue or agenda changes, regenerate the code and reprint it. The upside is total privacy and a code that never expires: nothing is hosted, tracked or able to break later.",
    },
    {
      question: "Does scanning it track who's coming or count RSVPs?",
      answer:
        "No. This is purely an add-to-calendar convenience. It doesn't collect RSVPs, count scans, or record who added the event. There's no analytics and no guest list anywhere, because the code is self-contained and generated entirely in your browser. If you need RSVP tracking, pair the QR with a separate registration link inside the event description.",
    },
    {
      question: "What resolution should I export for printing an invite or poster?",
      answer:
        "For a save-the-date, invite or badge, export a PNG or PDF at 1024px or higher: the tool goes up to 4096px. For posters, banners or anything that may be resized, use the SVG or PDF export, which are vector and stay razor-sharp at any physical size, from a business card to an A1 poster.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release, locked calendar content form (title, location, start, end, description), standards-compliant iCalendar VEVENT payload, live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export up to 4096px.",
    },
    {
      date: "2026-06-24",
      change:
        "Added logo drop-in with auto error-correction bump, a 'Scan to add to calendar' frame with custom call-to-action label, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-06-30",
      change:
        "Improved all-day vs timed-event handling and clearer time-zone guidance for online events, plus refreshed troubleshooting for OS/version support on older phones.",
    },
  ],

  relatedTools: [
    "qr-code-generator",
    "wifi-qr-code-generator",
    "vcard-qr-code-generator",
    "qr-code-scanner",
    "barcode-generator",
  ],
};

export default eventQrCodeGenerator;
