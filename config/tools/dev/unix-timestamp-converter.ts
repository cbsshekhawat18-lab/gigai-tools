import type { Tool } from "@/types";

/**
 * Unix Timestamp Converter, a live, bidirectional epoch↔date workbench.
 * It ticks the current Unix time (seconds and milliseconds) in real time,
 * expands any timestamp into ISO 8601, UTC, browser-local, relative and
 * weekday renderings, and converts a date/ISO string back into an epoch -
 * auto-detecting seconds vs milliseconds. Every field is one-click copyable
 * and the whole thing runs in the browser. Copy is unique to epoch/timestamp
 * search intent and written to rank for the exact queries developers type when
 * a log line, cookie `exp` or database column hands them a raw number.
 */
const unixTimestampConverter: Tool = {
  slug: "unix-timestamp-converter",
  title: "Unix Timestamp Converter",
  description:
    "Convert Unix timestamps to human dates and back, with a live-ticking epoch clock, auto seconds/milliseconds detection, and ISO 8601, UTC, local and relative time, all in your browser.",
  category: "developer-tools",
  icon: "Timer",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "Unix Timestamp Converter: Epoch to Date & Date to Epoch",
  tagline:
    "Paste a Unix timestamp to read it as a full date, or paste a date to get the epoch back. The current epoch ticks live in seconds and milliseconds, seconds-vs-ms is detected automatically, and every field copies with one click. Nothing is uploaded.",
  longDescription:
    "The GigAI Unix Timestamp Converter is a desktop-grade epoch workbench that runs entirely in your browser. At the top a live clock counts the current Unix time in both seconds and milliseconds, ticking every frame so you can grab a fresh value the instant you need one. Drop any number into the converter and it decides for you whether it's seconds or milliseconds (a heuristic that treats values under 1e11 as seconds) then expands it into a full ISO 8601 string, a human-readable UTC rendering, the same moment in your browser's local timezone, a relative phrase like \"3 hours ago\", and the day of the week. Feed it a date instead (an ISO string, an RFC-style date, or anything JavaScript's Date can parse) and it hands back the epoch in seconds and milliseconds. Unlike most epoch tools we're honest about timezones: without a bundled tz database we render UTC and the viewer's own machine zone, and we say so, rather than pretending to convert to an arbitrary named zone. Every output field has its own copy button, the interpretation is shown explicitly so there's no ambiguity, and because it's all local, timestamps from your logs, auth tokens, database rows and cron jobs never leave your device.",

  ctaText: "Convert Timestamp",

  keywords: [
    "unix timestamp converter",
    "epoch converter",
    "epoch to date",
    "timestamp to date",
    "unix time converter",
    "epoch time",
    "convert timestamp to date",
    "milliseconds to date",
    "date to unix timestamp",
    "current unix timestamp",
    "iso 8601 converter",
    "epoch seconds milliseconds",
  ],

  seo: {
    title: "Unix Timestamp Converter: Epoch to Date & Back Online | GigAI Tools",
    description:
      "Free online Unix timestamp converter. Convert epoch to a human date (ISO 8601, UTC, local, relative) and dates back to epoch, with a live clock and auto seconds/ms detection, 100% in your browser.",
  },

  features: [
    {
      icon: "Timer",
      title: "Live-ticking epoch clock",
      description:
        "The current Unix time updates continuously in both seconds and milliseconds, so you can copy a fresh, exact 'now' value without reaching for a shell or a snippet.",
    },
    {
      icon: "WandSparkles",
      title: "Auto seconds vs milliseconds",
      description:
        "Paste a bare number and the tool detects whether it's epoch seconds or milliseconds automatically, then tells you which it assumed so there's never any doubt.",
    },
    {
      icon: "Globe",
      title: "ISO, UTC, local & relative",
      description:
        "Every timestamp expands into an ISO 8601 string, a full UTC rendering, the same instant in your browser's timezone, a relative phrase, and the weekday.",
    },
    {
      icon: "ArrowLeftRight",
      title: "Bidirectional conversion",
      description:
        "Go epoch-to-date or date-to-epoch in the same panel. Type an ISO or human date and get the timestamp back in both seconds and milliseconds instantly.",
    },
    {
      icon: "Copy",
      title: "Copy every field",
      description:
        "Each output (ISO, UTC, local, relative, seconds and milliseconds) has its own one-click copy button, so you grab exactly the format you need.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Conversion uses the browser's native Date and Intl engines on your device. No timestamp, log line or token is ever uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Read raw log timestamps instantly",
      description:
        "Turn a naked epoch from a log, cookie or database row into a readable date (with the weekday and a 'how long ago' phrase) without doing mental arithmetic.",
    },
    {
      title: "Never guess seconds vs milliseconds again",
      description:
        "The 1e11 heuristic and an explicit 'interpreted as' label mean a 10- vs 13-digit number is never mistaken, which is the single most common epoch bug.",
    },
    {
      title: "Grab an exact 'now' on demand",
      description:
        "The live clock gives you a precise current epoch in seconds or milliseconds to paste into a test, a token payload or a database seed in one click.",
    },
    {
      title: "Private by design",
      description:
        "Because everything runs locally, timestamps tied to auth sessions, audit logs or user data stay on your machine and are never transmitted.",
    },
  ],

  howTo: [
    {
      title: "Enter a timestamp or a date",
      description:
        "Type or paste a Unix timestamp (seconds or milliseconds) (or a date/ISO string) into the converter. You can also load the built-in sample to try it instantly.",
    },
    {
      title: "Read every rendering",
      description:
        "See the moment as ISO 8601, UTC, your local timezone, a relative phrase and the weekday. The tool shows exactly how it interpreted your input.",
    },
    {
      title: "Copy the format you need",
      description:
        "Click the copy button next to any field (ISO, UTC, local, relative, epoch seconds or epoch milliseconds) to put just that value on your clipboard.",
    },
    {
      title: "Grab the live 'now' when needed",
      description:
        "Copy the current Unix time straight from the ticking clock at the top, or share a link that reopens the tool with your value pre-loaded.",
    },
  ],

  formats: {
    input: ["Unix seconds", "Unix milliseconds", "ISO 8601", "Date string"],
    output: ["ISO 8601", "UTC", "Local", "Relative", "Unix seconds", "Unix milliseconds"],
  },

  useCases: [
    {
      audience: "Backend developer",
      title: "Decode a token or log epoch",
      description:
        "Paste an exp claim, a created_at column or a log timestamp to see the exact UTC and local time and how long ago it was, without leaving the browser.",
    },
    {
      audience: "SRE / DevOps",
      title: "Correlate incident timelines",
      description:
        "Convert epochs from different systems into a single UTC reference so alerts, deploys and log lines line up on one timeline during a postmortem.",
    },
    {
      audience: "QA engineer",
      title: "Build time-based test fixtures",
      description:
        "Grab a precise current epoch in milliseconds, or convert a target date to a timestamp, to seed deterministic fixtures and assert time-dependent behaviour.",
    },
    {
      audience: "Data analyst",
      title: "Interpret exported millisecond stamps",
      description:
        "Confirm whether an exported column is in seconds or milliseconds and read it as a human date before loading it into a report or a query.",
    },
  ],

  faq: [
    {
      question: "What is a Unix timestamp?",
      answer:
        "A Unix timestamp (also called epoch time) is the number of seconds that have elapsed since 00:00:00 UTC on 1 January 1970, not counting leap seconds. It's a compact, timezone-free way to represent an instant, which is why logs, databases and APIs use it. Many systems store it in milliseconds instead, giving a 13-digit rather than a 10-digit number.",
    },
    {
      question: "How do I know if my number is in seconds or milliseconds?",
      answer:
        "This tool detects it automatically: values with an absolute size under 1e11 are treated as seconds and larger ones as milliseconds, and it always shows which it assumed. As a rule of thumb, a 10-digit number is seconds and a 13-digit number is milliseconds. If a timestamp resolves to a date around the year 1970 when you expected today, it was almost certainly milliseconds read as seconds (or vice versa).",
    },
    {
      question: "Is my timestamp uploaded to a server?",
      answer:
        "No. All conversion happens locally in your browser using its native Date and Intl engines. Your timestamps and dates never leave your device, so there is nothing for us to store, log or see, it's safe to convert values from auth tokens, audit logs or user records.",
    },
    {
      question: "What timezone does the 'local' time use?",
      answer:
        "Local time is rendered in your browser's own timezone, the zone configured on the device you're using right now. Because the tool has no bundled timezone database, it shows UTC and your machine's local zone rather than converting to an arbitrary named zone. The UTC and ISO outputs are absolute and identical for everyone.",
    },
    {
      question: "Can I convert a date back into a Unix timestamp?",
      answer:
        "Yes. Enter an ISO 8601 string, an RFC-style date, or anything the browser's Date parser understands, and the tool returns the epoch in both seconds and milliseconds. It also tells you it interpreted the input as a date string rather than a raw number.",
    },
    {
      question: "How is relative time like '3 hours ago' calculated?",
      answer:
        "The relative phrase is computed against the current clock using the browser's Intl.RelativeTimeFormat, choosing the largest sensible unit (years, months, weeks, days, hours, minutes or seconds). Because it's relative to 'now', it updates if you reconvert later: the absolute ISO and UTC values never change.",
    },
    {
      question: "Does it handle negative timestamps and dates before 1970?",
      answer:
        "Yes. Negative epoch values represent instants before 1 January 1970 UTC and convert normally: for example, -86400 is 31 December 1969. Very large magnitudes are range-checked so you get a clear error instead of an invalid date.",
    },
    {
      question: "What's the difference between epoch seconds and milliseconds?",
      answer:
        "Both count from the same 1970 epoch. Milliseconds are simply 1000× the seconds value, giving finer resolution. Unix shell tools and many databases default to seconds, while JavaScript's Date.now(), Java and lots of APIs use milliseconds. Mixing them up shifts a date by a factor of about 31,000 years, so the tool always labels which unit it used.",
    },
  ],

  tips: [
    "A 10-digit number is almost always seconds. A 13-digit number is almost always milliseconds, the tool confirms which it used.",
    "Copy the live epoch straight from the ticking clock to paste an exact 'now' into a test or token payload.",
    "Use the ISO 8601 field for anything that must be timezone-unambiguous across machines and services.",
    "If a converted date lands near 1970, you likely pasted milliseconds as seconds (or the reverse): recheck the digit count.",
    "Share the link to reopen the tool with your timestamp pre-loaded when handing a value to a teammate.",
  ],

  troubleshooting: [
    {
      problem: "My timestamp resolves to a date in 1970.",
      solution:
        "You almost certainly pasted a milliseconds value that was read as seconds, or vice versa. Check the digit count (10 digits is seconds, 13 is milliseconds) and note the 'interpreted as' label. Adjust the value if the tool's automatic guess doesn't match your source system.",
    },
    {
      problem: "My date string won't parse.",
      solution:
        "The browser's Date parser is strict about some formats. Prefer full ISO 8601 like 2026-06-24T13:45:00Z. Ambiguous forms (bare 'DD/MM/YYYY', or a time with no date) may be rejected or misread. Add an explicit date and, ideally, a timezone offset.",
    },
    {
      problem: "The local time doesn't match my expected zone.",
      solution:
        "Local time reflects the timezone set on the device you're viewing from, not a chosen zone. If you need a specific zone, use the absolute UTC or ISO output as the source of truth. This tool intentionally only renders UTC and your machine's local zone.",
    },
  ],

  security:
    "Every timestamp and date is converted entirely in your browser using its native Date and Intl engines. Nothing is uploaded to any server. No values are stored, logged or transmitted, so you can safely convert epochs from tokens, audit logs or personal records. Close the tab and every trace is gone.",

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: live-ticking epoch clock (seconds + ms), bidirectional epoch↔date conversion with auto seconds/ms detection, and ISO 8601, UTC, local, relative and weekday renderings.",
    },
    {
      date: "2026-06-28",
      change:
        "Added per-field copy buttons, an explicit 'interpreted as' label, keyboard shortcuts and shareable links that pre-load your value.",
    },
    {
      date: "2026-07-01",
      change:
        "Refined seconds-vs-milliseconds heuristic messaging and improved error handling for out-of-range numbers and unparseable date strings.",
    },
  ],

  relatedTools: ["json-formatter", "jwt-decoder", "base64-encoder", "hash-generator"],
};

export default unixTimestampConverter;
