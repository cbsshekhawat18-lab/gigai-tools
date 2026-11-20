import type { Tool } from "@/types";

/**
 * Event Schema Generator, a dedicated, single-type structured-data builder for
 * schema.org/Event. It turns event details (dates, venue or virtual location,
 * organizer, performer, tickets/offers, status and attendance mode) into valid
 * JSON-LD, live, with an inline required/recommended validity check for Google's
 * event rich result and a copy-ready `<script type="application/ld+json">` block.
 * Everything runs on `lib/seo-tools/schema.ts` in the browser. No event data is
 * ever uploaded. Copy is unique to event markup and written to rank for the exact
 * queries people type when they want their event to show in Google Search and
 * the events experience.
 */
const eventSchemaGenerator: Tool = {
  slug: "event-schema-generator",
  title: "Event Schema Generator",
  description:
    "Generate valid Event JSON-LD structured data (dates, venue or virtual location, organizer, performer and ticket offers) with a live rich-results validity check and a copy-ready script tag. 100% in your browser.",
  category: "seo-tools",
  group: "Schema",
  icon: "CalendarDays",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "Event Schema Generator, JSON-LD Structured Data for Event Rich Results",
  tagline:
    "Enter your event's dates, location and tickets once and get valid schema.org Event JSON-LD instantly. We check the required and recommended properties Google needs for the event rich result, then hand you the exact <script> tag to paste, all in your browser, nothing uploaded.",
  longDescription:
    "The GigAI Event Schema Generator builds schema.org/Event structured data as JSON-LD, the format Google explicitly recommends, so concerts, conferences, webinars, workshops, festivals, screenings and meetups become eligible for the event rich result in Search and the Google events experience. Fill a form tailored to exactly the fields Google reads for events: name, description, a start date and time (and an optional end), the venue name and postal address for in-person events, or a virtual URL for online events. Add an organizer, a performer, an image, and a ticket offer with price, currency, availability and a valid-from date. Choose an event status (scheduled, cancelled, postponed, rescheduled or moved online) and an attendance mode (offline, online or mixed), the generator expands your shorthand into the full schema.org URLs Google expects. What sets this apart from a generic schema builder is the built-in validity check: every property is graded against Google's required and recommended set for events, so you see at a glance whether your markup qualifies and precisely which fields are still missing. Dates are emitted in ISO 8601 with the timezone the datetime input provides, empty fields are stripped automatically, and the output updates live as you type. When you're done, copy the ready-to-paste `<script type=\"application/ld+json\">` block or download the raw JSON, and share a link that reopens the tool with your event pre-filled. Because generation and validation happen entirely on your device using the browser's own JSON engine, unannounced dates, internal ticket prices and venue details never leave your machine. There is nothing for us to store, log or see.",

  ctaText: "Generate event schema",

  keywords: [
    "event schema generator",
    "event json-ld generator",
    "event structured data",
    "schema.org event generator",
    "event rich results markup",
    "google event schema",
    "virtual event schema",
    "eventAttendanceMode schema",
    "eventStatus schema generator",
    "concert schema markup",
    "webinar schema generator",
    "ticket offer schema",
  ],

  seo: {
    title:
      "Event Schema Generator, Free Event JSON-LD Structured Data | GigAI Tools",
    description:
      "Free Event schema generator: build valid schema.org/Event JSON-LD with dates, venue or virtual location, organizer, performer and ticket offers. Live rich-results validity check, copy-ready script tag: 100% in your browser.",
  },

  features: [
    {
      icon: "CalendarClock",
      title: "Every event field Google reads",
      description:
        "Name, description, start and end date-time, venue name and postal address, virtual URL, image, organizer, performer and a full ticket offer, all in one focused form built for schema.org/Event.",
    },
    {
      icon: "ShieldCheck",
      title: "Live rich-results validity check",
      description:
        "Each property is graded against Google's required and recommended set for events, so you instantly see whether your markup qualifies for the event rich result and what's still missing.",
    },
    {
      icon: "Globe2",
      title: "In-person, virtual or hybrid",
      description:
        "Set the attendance mode to offline, online or mixed (add a venue address, a virtual URL, or both) and the generator emits the right location plus the eventAttendanceMode Google expects.",
    },
    {
      icon: "CircleAlert",
      title: "Status & enum expansion",
      description:
        "Mark an event scheduled, cancelled, postponed, rescheduled or moved online. Shorthands like 'EventCancelled' and 'OnlineEventAttendanceMode' expand to full schema.org URLs automatically.",
    },
    {
      icon: "Code2",
      title: "Copy the exact script tag",
      description:
        "Get a ready-to-paste `<script type=\"application/ld+json\">` block, or download the raw JSON, dates normalised to ISO 8601, empty fields stripped, no hand-editing braces.",
    },
    {
      icon: "Lock",
      title: "100% in your browser",
      description:
        "Markup is built with the browser's native JSON engine on your device. Unannounced dates, ticket prices and venue details are never uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Win the event rich result without hand-writing JSON",
      description:
        "The dated, expandable event listing Google shows depends on correct Event structured data. The generator produces it cleanly so you skip the syntax slips that silently disqualify a page.",
    },
    {
      title: "Know your markup is valid before you publish",
      description:
        "The inline check flags missing required properties (name, startDate, a location or virtual URL) as errors and recommended ones as warnings, so you fix eligibility in the tool, not later in Search Console.",
    },
    {
      title: "Handle virtual and hybrid events correctly",
      description:
        "Online events need a VirtualLocation URL and the online attendance mode. Hybrid events need both a physical place and a virtual URL. The tool wires the right shape so remote-first events still qualify.",
    },
    {
      title: "Safe for unannounced event data",
      description:
        "Because everything runs locally, you can build markup with a not-yet-public date, internal ticket pricing or a private venue without any of it leaving your machine.",
    },
  ],

  howTo: [
    {
      title: "Enter the event basics",
      description:
        "Give the event a name, a start date and time, and a short description. Load the example first if you want a realistic, fully-valid starting point.",
    },
    {
      title: "Set the location or go virtual",
      description:
        "Choose the attendance mode, then add a venue name and postal address for in-person events, a virtual URL for online events, or both for a hybrid event.",
    },
    {
      title: "Add organizer, tickets & status",
      description:
        "Fill in the organizer and performer, add a ticket offer with price, currency, availability and offer URL, and pick an event status. Watch the JSON-LD update live.",
    },
    {
      title: "Read the validity check & copy",
      description:
        "Green means eligible. Warnings point to recommended fields, errors flag anything mandatory that's missing. Copy the `<script>` block (or download the JSON) and paste it into the event page.",
    },
    {
      title: "Confirm in Google's Rich Results Test",
      description:
        "Paste the same markup into Google's Rich Results Test to confirm event eligibility on Google's own live checker before publishing.",
    },
  ],

  formats: {
    input: ["Form"],
    output: ["JSON-LD", "HTML"],
  },

  useCases: [
    {
      audience: "Event organizer",
      title: "Get a conference into Google's event listings",
      description:
        "Build Event markup with dates, venue address, organizer and a ticket offer so the conference is eligible for the dated, ticket-linked event rich result.",
    },
    {
      audience: "Marketer running webinars",
      title: "Mark up virtual events correctly",
      description:
        "Set the online attendance mode with a VirtualLocation URL so a webinar or livestream qualifies for Google's events experience without a physical venue.",
    },
    {
      audience: "Venue or promoter",
      title: "Publish concerts and screenings",
      description:
        "Emit Event JSON-LD with a performer, price range and start time for each show, and update the status to cancelled or rescheduled if plans change.",
    },
    {
      audience: "Community / meetup host",
      title: "Standardise recurring meetup markup",
      description:
        "Share a pre-filled link so every organizer emits the same Event shape: consistent structured data Google can trust across a series.",
    },
  ],

  troubleshooting: [
    {
      problem: "The check shows an error for startDate or location.",
      solution:
        "Google requires an event name, a startDate, and a location, either a physical Place (venue name + address) or, for online events, a VirtualLocation URL. Fill the missing one and the error clears.",
    },
    {
      problem: "My virtual event isn't recognised as online.",
      solution:
        "Set the attendance mode to Online and provide a virtual URL. The generator emits eventAttendanceMode as OnlineEventAttendanceMode and a VirtualLocation so Google treats it as a remote event.",
    },
    {
      problem: "The status shows as a plain word, not a URL.",
      solution:
        "Pick a status like 'EventCancelled' or 'EventRescheduled' and the generator expands it to the full https://schema.org/… value Google expects. You can also paste the full URL directly.",
    },
    {
      problem: "Google's test flags an issue this tool didn't.",
      solution:
        "This is a pragmatic linter for required/recommended properties, not a full schema.org shape validator. Always confirm with Google's Rich Results Test. It adds Google-specific event eligibility rules on top of valid JSON-LD.",
    },
  ],

  tips: [
    "Always include a start date with a time and timezone: Google uses it to show the event's date and to sort listings.",
    "For a hybrid event, provide both a physical venue address and a virtual URL, and set the attendance mode to Mixed (Offline + Online).",
    "Never delete a cancelled event's page or its markup. Keep it live and set eventStatus to EventCancelled so Google can show the cancellation.",
    "If the date or venue changes, update startDate/location and set eventStatus to EventRescheduled or EventMovedOnline rather than creating a new page.",
    "After copying, run the markup through Google's Rich Results Test. Passing this tool's check is necessary, but Google adds its own eligibility rules.",
  ],

  security:
    "Your event data is generated and validated entirely in your browser using its native JSON engine. Nothing is uploaded to any server. No dates, ticket prices, organizer names or venue details are stored, logged or transmitted, so you can safely build markup for unannounced or private events. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is Event schema and why do I need it?",
      answer:
        "Event schema is schema.org/Event structured data that describes an event (its name, dates, location and tickets) in a machine-readable way. Search engines read it to show the event rich result: a dated, often expandable listing with the time, place and a link to buy tickets. Correct markup makes your event eligible for this enhanced treatment in Google Search and the events experience.",
    },
    {
      question: "Which fields are required for the event rich result?",
      answer:
        "Google requires an event name, a startDate, and a location. For in-person events the location is a Place with a name and postal address. For online events it's a VirtualLocation with a URL. Recommended additions like endDate, an image, an organizer, a performer and an offer (tickets) improve eligibility. This tool's validity check flags the required ones as errors and the recommended ones as warnings.",
    },
    {
      question: "How do I mark up a virtual or online event?",
      answer:
        "Set the attendance mode to Online and provide a virtual URL. The generator emits eventAttendanceMode as OnlineEventAttendanceMode and a VirtualLocation object with that URL, which is exactly how Google identifies a remote event. For a hybrid event, use the Mixed mode and supply both a physical venue address and a virtual URL.",
    },
    {
      question: "How should I handle a cancelled or postponed event?",
      answer:
        "Keep the event page and its markup live, and set eventStatus accordingly: EventCancelled, EventPostponed, EventRescheduled, or EventMovedOnline. Google uses eventStatus to display the change. Removing the page or the markup means Google can't communicate the cancellation, so update rather than delete.",
    },
    {
      question: "What date format does the markup use?",
      answer:
        "Dates are emitted in ISO 8601, for example 2026-09-15T09:00 for a start time. The date-and-time inputs produce this format for you, including the local offset the browser provides. Always give a time, not just a date, so Google can show and sort your event precisely.",
    },
    {
      question: "Where do I put the generated script tag?",
      answer:
        "Paste the `<script type=\"application/ld+json\">` block into the HTML of the specific event's page, the `<head>` or anywhere in the `<body>` works for Google. In a CMS, add it via a custom-HTML block, a theme template or a plugin field. Put each event's markup on its own page, and use one Event object per event.",
    },
    {
      question: "Does this guarantee my event gets a rich result?",
      answer:
        "No tool can guarantee a rich result, Google decides whether and when to show one based on markup validity, content quality and its own eligibility rules. What this tool guarantees is syntactically valid Event JSON-LD with the required properties present, which is the prerequisite. Confirm final eligibility with Google's Rich Results Test.",
    },
    {
      question: "Is my event data sent anywhere?",
      answer:
        "No. All generation and validation happen locally in your browser using its built-in JSON engine. Your dates, ticket prices, organizer names and venue details never leave your device: there's nothing for us to upload, store or log. It's safe to build markup for unannounced or private events.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, dedicated Event JSON-LD generator with dates, venue address, virtual URL, organizer, performer and ticket offer, a live required/recommended validity check, copy-ready script tag, download, example preset, undo/redo and share links.",
    },
    {
      date: "2026-06-27",
      change:
        "Added eventStatus (scheduled, cancelled, postponed, rescheduled, moved online) and eventAttendanceMode (offline, online, mixed) with automatic expansion to full schema.org URLs, plus a minified-output toggle.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined the validity report to distinguish physical vs. virtual location requirements and added a link to Google's Rich Results Test for final confirmation.",
    },
  ],

  relatedTools: [
    "schema-generator",
    "meta-tag-generator",
    "google-serp-preview",
    "json-formatter",
    "url-encoder",
  ],
};

export default eventSchemaGenerator;
