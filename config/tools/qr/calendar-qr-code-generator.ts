import type { Tool } from "@/types";

/**
 * Calendar Event QR Code Generator, a flagship, single-purpose micro-site over
 * the QR Studio (locked to the "calendar" content type). It turns an event's
 * title, date/time and location into a scannable QR that, when scanned, offers
 * to add the event straight to the phone's calendar, so a save-the-date card,
 * a wedding invite, a webinar flyer or a conference badge becomes a one-tap
 * "Add to calendar" instead of a manual typing chore.
 *
 * Every string is written for the exact queries people search when they want a
 * printable event QR: save-the-dates, recurring meet-ups, workshops, launches.
 *
 * Honest boundary baked into the copy: the QR encodes one standard iCalendar
 * VEVENT locally in the browser (a static snapshot of the date/time/place you
 * type). It is not a live feed, if the event moves, you regenerate and reprint.
 * True recurrence rules (RRULE) and reminders are set inside the calendar app
 * after the event is added; we are explicit about that rather than faking it.
 */
const calendarQrCodeGenerator: Tool = {
  slug: "calendar-qr-code-generator",
  title: "Calendar QR Code Generator",
  description:
    "Turn any event into a scan-to-add-to-calendar QR code. Enter the title, date, time and place, brand it with your colors and logo, and download print-ready PNG, SVG or PDF. 100% in your browser.",
  category: "qr-tools",
  icon: "Calendar",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",
  illustration: "calendar",

  h1: "Calendar QR Code Generator, Scan to Save the Date",
  tagline:
    "Type an event's name, date, time and location once and get a QR code that drops it straight into anyone's calendar. Perfect for save-the-dates, launches, webinars and recurring meet-ups, brand it, add a logo, and print it. Built entirely in your browser, never uploaded.",
  longDescription:
    "The GigAI Calendar QR Code Generator encodes a complete calendar event into a single scannable code so that anyone who points their phone camera at it is offered a one-tap 'Add to calendar': with the title, start and end time, and location already filled in. No dictating a date across a room, no attendee mistyping '7pm' as '7am', no 'wait, was it the 12th or the 21st?'. You enter the event title, choose a start (and optional end) with a real date-and-time picker, add the venue and any description or agenda, and, if it's an all-day affair like a wedding or a festival, flag it as all-day. The tool builds the exact standard iCalendar VEVENT (BEGIN:VEVENT … END:VEVENT) that phones understand, then hands it to our desktop-grade QR Studio so the code looks like the invitation it belongs to: custom colors or a gradient tuned to your theme, rounded dot and eye styles, your monogram, brand or event logo dropped in the centre, a printable frame with a 'Scan to save the date' call-to-action, and export to crisp PNG, transparent PNG, scalable SVG, print-ready PDF, JPG, WEBP or vector EPS at up to 4096px. A live scannability check watches contrast, quiet-zone and logo coverage as you design, so a beautiful code still scans on the first try from a printed card. Because encoding, styling and export all happen locally in your browser, nothing about your event is uploaded, stored or tracked. There is no account. One honest note we design around: the QR carries a static snapshot of the details you type, so if the date or venue changes you regenerate and reprint, and repeat/recurring events add one instance that scanners can then set to repeat inside their own calendar app.",

  ctaText: "Generate Event QR Code",

  keywords: [
    "calendar qr code generator",
    "event qr code",
    "add to calendar qr code",
    "qr code for calendar event",
    "ical qr code generator",
    "scan to add to calendar",
    "vevent qr code",
    "wedding save the date qr code",
    "recurring event qr code",
    "printable event qr code",
  ],

  seo: {
    title: "Calendar QR Code Generator: Scan to Add Event (Free, No Signup) | GigAI Tools",
    description:
      "Free calendar event QR code generator. Enter a title, date, time and location to make a scan-to-add-to-calendar QR, brand it with a logo and colors, and download print-ready PNG, SVG or PDF. 100% in-browser: nothing uploaded.",
  },

  features: [
    {
      icon: "CalendarPlus",
      title: "One-tap add to calendar",
      description:
        "Encodes a standard iCalendar VEVENT that phones read natively, so scanning offers 'Add to calendar' with the title, time and place pre-filled. No manual entry, no wrong dates.",
    },
    {
      icon: "Clock",
      title: "Precise start, end & all-day",
      description:
        "Set exact start and end times with a proper date-time picker, or flag an all-day event like a wedding or festival, and the QR encodes it correctly for every calendar app.",
    },
    {
      icon: "MapPin",
      title: "Location & agenda built in",
      description:
        "Add the venue and a description or agenda. Scanners get a calendar entry they can tap to open in Maps and read the details, not just a bare title on a date.",
    },
    {
      icon: "Palette",
      title: "Match the invitation",
      description:
        "Custom colors or a gradient, rounded dot and eye styles, and a printable frame with a 'Scan to save the date' label so the code fits your invite instead of clashing with it.",
    },
    {
      icon: "Image",
      title: "Add a logo or monogram",
      description:
        "Drop a brand mark, event logo or couple's monogram into the centre with a protected quiet zone, the tool auto-raises error correction so it still scans reliably.",
    },
    {
      icon: "Download",
      title: "Print-ready exports",
      description:
        "Download PNG, transparent PNG, scalable SVG, print-ready PDF, JPG, WEBP or vector EPS up to 4096px, sharp on a save-the-date card, flyer, badge, poster or email footer.",
    },
  ],

  benefits: [
    {
      title: "Nobody misses the date",
      description:
        "One scan lands the event in a guest's own calendar with a reminder they can set, far more reliable than hoping they copy a date off a card into their phone by hand.",
    },
    {
      title: "Zero mistyped times or venues",
      description:
        "The QR transfers the exact title, date, time and location, so no attendee turns up an hour early, a day late, or at last year's venue because they fat-fingered the details.",
    },
    {
      title: "Looks like part of the invite",
      description:
        "With your colors, a logo or monogram and a framed call-to-action, the code belongs on a wedding suite, launch flyer or conference badge instead of looking bolted on.",
    },
    {
      title: "Private by design",
      description:
        "Your event details are encoded locally in your browser and never leave your device. No account, no upload, and no server ever learns who's hosting what, when or where.",
    },
  ],

  howTo: [
    {
      title: "Enter the event details",
      description:
        "Type the event title, pick the start (and optional end) with the date-and-time picker, and add the location. Flag it all-day for weddings, festivals or launch days.",
    },
    {
      title: "Add a description or agenda",
      description:
        "Drop in a note, dress code, agenda or dial-in details so the calendar entry carries context. Everything a guest needs sits inside the event once they add it.",
    },
    {
      title: "Brand and check it",
      description:
        "Open the Design tab for colors, dot/eye styles and a 'Scan to save the date' frame, add your logo, then watch the live scannability badge and test the on-screen code.",
    },
    {
      title: "Download and share",
      description:
        "Export a high-resolution PNG or PDF for print, or an SVG for infinite scaling, then place it on the invite, flyer, badge, email or slide where guests will scan it.",
    },
  ],

  formats: {
    input: ["Event title + date/time + location"],
    output: ["PNG", "SVG", "PDF", "JPG", "WEBP", "EPS"],
  },

  useCases: [
    {
      audience: "Couples / Weddings",
      title: "Save-the-date & invitation suite",
      description:
        "Add a scan-to-save QR to the save-the-date and invite so guests drop the ceremony straight into their calendar with the venue attached, style it to match your theme and monogram.",
    },
    {
      audience: "Marketing / SaaS",
      title: "Product launch & webinar flyer",
      description:
        "Put the QR on the launch poster, webinar landing card or slide so prospects add the session in one tap and get their own reminder. No relying on 'add to calendar' email links.",
    },
    {
      audience: "Community / Clubs",
      title: "Recurring meet-up card",
      description:
        "Print one card for a weekly class, run club or user group. Each scanner adds the next session and can set it to repeat in their own app, so the flyer stays useful all season.",
    },
    {
      audience: "Events / Conferences",
      title: "Badge & signage sessions",
      description:
        "Give each session or booth a QR on the badge, program or signage so attendees fill their agenda by scanning, instead of copying a grid of times into their phones by hand.",
    },
  ],

  troubleshooting: [
    {
      problem: "The event adds at the wrong time or in the wrong time zone.",
      solution:
        "Times are encoded from the date-time you pick and normalised to a standard UTC form calendars convert back to the scanner's local zone. If a guest is in another country, double-check the hour you entered is the intended local start time, and add the time zone to the description as a fallback.",
    },
    {
      problem: "Scanning shows text instead of an 'Add to calendar' prompt.",
      solution:
        "Native calendar-QR support needs a recent OS and the built-in camera app rather than a random scanner. On older phones the scan reveals the event as iCalendar text. Users can still read the title, date and place, or open it in a QR reader that understands calendar events.",
    },
    {
      problem: "My all-day event shows a start and end time I didn't want.",
      solution:
        "Turn on the all-day toggle. All-day mode encodes DATE-only values (no clock), so a wedding or festival spans whole days without a stray 12:00 start. Leave it off only when the exact hour matters.",
    },
    {
      problem: "The end time is missing or the event has no duration.",
      solution:
        "If you leave the end blank, the code uses the start as the end so it stays valid. For a session with a real length, set the end explicitly so guests see the full block reserved in their calendar.",
    },
  ],

  tips: [
    "For recurring events, encode the next occurrence, then tell guests they can set it to repeat in their own calendar app: a static QR can't carry a live recurrence rule, so this keeps the card honest and reusable.",
    "Put the time zone and a short 'add to your calendar' instruction near the code on international invites, so remote guests interpret the hour correctly and know to scan.",
    "Bump error correction to Q or H (or add a logo. The tool does it for you) so the code still scans after a fold, a scuff or a coffee ring on a printed save-the-date.",
    "Keep strong contrast: a dark code on a light card scans far more reliably than pale-on-pale or a code sitting on a busy background photo.",
    "Print a proof and scan it under the real lighting where it'll live before you order the full run of invites, flyers or badges.",
  ],

  security:
    "Your event title, dates, location and description are encoded into the QR entirely in your browser as a standard iCalendar VEVENT. Nothing is uploaded, stored or logged, and there is no account. Because the code is a static snapshot, it contains the exact details you type, so anyone who scans a printed card can add that event to their calendar. If the date or venue changes, regenerate and reprint, and avoid putting sensitive access details (like a private dial-in) on a code that will be seen publicly.",

  faq: [
    {
      question: "How does a calendar QR code work?",
      answer:
        "The code stores your event as a standard iCalendar entry (a VEVENT, beginning with 'BEGIN:VEVENT') that includes the title, start and end time, and location. When a modern phone camera scans it, the operating system recognises the format and offers a one-tap 'Add to calendar', so the event lands in the scanner's own calendar, ready for them to set a reminder.",
    },
    {
      question: "Can I make a recurring or weekly event QR code?",
      answer:
        "You can encode the next occurrence of a repeating event, and it's perfect for a reusable meet-up card. We're honest that a static QR can't carry a live recurrence rule (RRULE) that every app respects, so the reliable pattern is: encode the next session, and let each guest set it to repeat inside their own calendar app after adding it.",
    },
    {
      question: "Will the event be added in the right time zone?",
      answer:
        "The time you pick is normalised to a standard universal form that calendar apps convert to each scanner's local time zone. That's ideal for a global audience. For a mixed-timezone invite, also write the intended time zone into the description so there's no ambiguity for anyone reading it.",
    },
    {
      question: "Does it work on both iPhone and Android?",
      answer:
        "Yes. Recent iPhones and Android phones read calendar QR codes with the built-in camera app and show an 'Add to calendar' prompt. On older devices the scan reveals the event as iCalendar text, so users can still read the title, date and place or open it in a calendar-aware QR reader.",
    },
    {
      question: "How do I make an all-day event, like a wedding or festival?",
      answer:
        "Turn on the all-day toggle. The QR then encodes date-only values with no clock time, so the event spans whole days in every calendar without a misleading start hour. Leave the toggle off when the exact start and end time matter, such as a webinar or a dinner.",
    },
    {
      question: "Is my event data uploaded or stored anywhere?",
      answer:
        "No. The QR is generated entirely in your browser on your own device. The title, dates, location and description are never sent to a server, stored, or logged: there's no account and nothing leaves your machine. Close the tab and no trace remains.",
    },
    {
      question: "Can I add my logo, monogram and brand colors?",
      answer:
        "Absolutely. Use the Design tab for custom colors or a gradient and rounded dot/eye styles, add a 'Scan to save the date' frame, and drop your logo or monogram into the centre from the Logo tab. The live scannability check makes sure the branding doesn't stop the code from scanning, and it raises error correction automatically when you add a logo.",
    },
    {
      question: "What should I export for a printed invitation?",
      answer:
        "For a save-the-date card, flyer or badge, export a PNG or PDF at 1024px or higher: the tool goes up to 4096px. For anything that may be resized, such as large signage, use the SVG export: it's vector and stays razor-sharp at any size.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: locked calendar content form (title, location, start, end, description) building a standard iCalendar VEVENT, with live preview and print-ready PNG/SVG/PDF/JPG/WEBP/EPS export.",
    },
    {
      date: "2026-06-25",
      change:
        "Added all-day event support (DATE-only encoding), a 'Scan to save the date' frame with custom call-to-action label, logo/monogram drop-in with automatic error-correction bump, and the real-time contrast + quiet-zone scannability check.",
    },
    {
      date: "2026-07-01",
      change:
        "Clearer guidance for recurring events and cross-time-zone invites, plus improved troubleshooting for older-phone calendar-QR support.",
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

export default calendarQrCodeGenerator;
