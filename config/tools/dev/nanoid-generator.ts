import type { Tool } from "@/types";

/**
 * NanoID Generator, a desktop-grade generator for short, URL-safe,
 * cryptographically-strong unique IDs. It supports a live size slider,
 * alphabet presets (URL-safe, numeric, lowercase, hex, alphanumeric) and a
 * fully custom alphabet, bulk generation up to 1,000, per-row and bulk copy,
 * TXT/CSV export, session history and a real-time collision-probability
 * estimate. Copy is unique to Nano ID and its entropy/collision maths, written
 * to rank for the exact queries developers type when they need a compact ID
 * that isn't a 36-character UUID.
 */
const nanoidGenerator: Tool = {
  slug: "nanoid-generator",
  title: "NanoID Generator",
  description:
    "Generate secure, URL-safe Nano IDs in your browser with a live size slider, alphabet presets, a custom alphabet, bulk output up to 1,000 and a real-time collision-odds estimate. Nothing is uploaded.",
  category: "developer-tools",
  icon: "Hash",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "NanoID Generator, Secure, URL-Safe Short IDs Online",
  tagline:
    "Mint compact, collision-resistant Nano IDs instantly. Drag the size slider, pick or type an alphabet, generate up to 1,000 at once, and watch the collision probability update live, all client-side, nothing uploaded.",
  longDescription:
    "The GigAI NanoID Generator produces the same tiny, URL-safe, cryptographically-strong IDs as the popular `nanoid` library, but in a polished, keyboard-driven interface that runs entirely in your browser. A Nano ID is a modern alternative to the UUID: at the default 21 characters it packs roughly the same 126 bits of randomness as a UUID v4 into a shorter, cleaner string built from a URL-safe alphabet (A–Z, a–z, 0–9, plus `-` and `_`), so it drops straight into URLs, filenames, database keys and React `key` props with no encoding. This tool goes further than a bare generator: a live size slider from 2 to 64 characters, five ready-made alphabet presets (URL-safe default, numeric, lowercase, hex, alphanumeric) and a custom-alphabet field, bulk generation of 1 to 1,000 IDs at once, per-row and bulk copy, TXT and CSV export, a scrollable session history you can restore from, and (crucially) a real-time collision-probability estimate that recalculates from your chosen alphabet size, ID length and volume so you can pick parameters with confidence instead of guessing. Every ID is generated on your device using the Web Crypto random source. Nothing is sent to a server, stored or logged. Close the tab and every ID you made is gone.",

  ctaText: "Generate Nano IDs",

  keywords: [
    "nanoid generator",
    "nano id generator",
    "generate nanoid",
    "url-safe id generator",
    "short unique id generator",
    "nanoid online",
    "random id generator",
    "custom alphabet id",
    "nanoid vs uuid",
    "secure short id",
    "collision probability calculator",
  ],

  seo: {
    title: "NanoID Generator: Secure URL-Safe Short IDs Online | GigAI Tools",
    description:
      "Free online NanoID generator. Live size slider, alphabet presets and custom alphabets, bulk up to 1,000, copy/export, and a real-time collision-odds estimate, 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "SlidersHorizontal",
      title: "Live size slider",
      description:
        "Drag the length from 2 to 64 characters and every ID regenerates instantly, so you can dial in the shortest ID that still meets your uniqueness needs.",
    },
    {
      icon: "Type",
      title: "Presets + custom alphabet",
      description:
        "Choose URL-safe (default), numeric, lowercase, hex or alphanumeric, or type your own character set, deduplicated and validated as you go, for readable or domain-specific IDs.",
    },
    {
      icon: "Sigma",
      title: "Live collision-odds estimate",
      description:
        "A birthday-paradox calculator recomputes the probability of a collision from your alphabet size, length and volume in real time, so you size IDs with maths, not vibes.",
    },
    {
      icon: "Layers",
      title: "Bulk up to 1,000",
      description:
        "Generate a single ID or a batch of up to a thousand at once, each numbered, with per-row copy and one-click copy-all for seeding fixtures and databases.",
    },
    {
      icon: "Download",
      title: "Copy, export & history",
      description:
        "Copy any row or the whole batch, export to TXT or CSV, and restore any previous batch from an in-session history that never leaves your browser.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "IDs are minted on your device from the Web Crypto random source. Nothing is uploaded, stored or logged, safe for IDs that seed real production data.",
    },
  ],

  benefits: [
    {
      title: "Shorter than a UUID, just as unique",
      description:
        "At 21 characters a Nano ID carries ~126 bits of entropy (on par with a UUID v4) in a URL-safe string 40% shorter, so keys and links stay compact and clean.",
    },
    {
      title: "Right-size IDs with confidence",
      description:
        "The live collision estimate tells you when a 10-character numeric code is fine and when you need 21 URL-safe characters, replacing guesswork with a concrete probability.",
    },
    {
      title: "Drops in anywhere",
      description:
        "URL-safe output needs no percent-encoding, so the same ID works in a URL, a filename, an object key, a React list key and a database primary key unchanged.",
    },
    {
      title: "Private by design",
      description:
        "Because generation is local, you can freely mint IDs that will key sensitive records: none of them, and no seed, ever leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Set the length",
      description:
        "Drag the size slider (2–64) to the ID length you want. The default of 21 matches the entropy of a UUID v4 in a shorter string.",
    },
    {
      title: "Pick an alphabet",
      description:
        "Choose a preset (URL-safe, numeric, lowercase, hex or alphanumeric) or switch to Custom and type your own character set.",
    },
    {
      title: "Choose how many",
      description:
        "Generate one ID or a bulk batch of up to 1,000. Watch the collision-probability badge update as you change length, alphabet and count.",
    },
    {
      title: "Copy, export or restore",
      description:
        "Copy a single row or the whole batch, export as TXT or CSV, or reopen an earlier batch from the session history below the output.",
    },
  ],

  formats: {
    input: ["Options"],
    output: ["TXT", "CSV"],
  },

  useCases: [
    {
      audience: "Backend developer",
      title: "Database primary keys",
      description:
        "Generate URL-safe 21-character IDs as primary keys that are safe to expose in URLs and APIs, avoiding the length of UUIDs and the enumeration risk of auto-increment integers.",
    },
    {
      audience: "Frontend developer",
      title: "Stable React keys & DOM ids",
      description:
        "Mint a batch of short IDs for list `key` props, form field ids or client-side records that need a stable, unique handle without pulling a library into the bundle.",
    },
    {
      audience: "Product / Growth",
      title: "Short share codes & slugs",
      description:
        "Use a numeric or lowercase preset at a modest length to create human-friendly invite codes, referral slugs or short-link tokens, sizing them against the live collision odds.",
    },
    {
      audience: "QA / Data engineer",
      title: "Seed fixtures and test data",
      description:
        "Bulk-generate up to 1,000 IDs, export them as CSV, and load them into fixtures or a seed script to give every test record a realistic, unique identifier.",
    },
  ],

  troubleshooting: [
    {
      problem: "My IDs contain '-' or '_' and break something downstream.",
      solution:
        "The default URL-safe alphabet includes '-' and '_'. If your consumer rejects them (some filename or CLI contexts), switch to the alphanumeric, hex or lowercase preset, or type a custom alphabet without those characters.",
    },
    {
      problem: "The collision probability looks alarmingly high.",
      solution:
        "That's the birthday paradox doing its job. Shorten alphabets and lengths concentrate risk fast. Increase the ID length, use a larger alphabet (URL-safe or alphanumeric), or lower the volume: the estimate updates live so you can find a safe combination.",
    },
    {
      problem: "My custom alphabet produced shorter-looking variety than expected.",
      solution:
        "Duplicate characters in a custom alphabet are removed before generation, because repeats would bias the distribution and add no entropy. The effective alphabet size shown reflects the unique characters only.",
    },
    {
      problem: "I need cryptographically secure IDs. Are these safe?",
      solution:
        "Yes. Nano IDs are generated from the platform's Web Crypto secure random source, not Math.random. They are suitable as unguessable identifiers, though a dedicated token/password tool is better for secrets you must keep truly secret.",
    },
  ],

  tips: [
    "Stick with the 21-character URL-safe default when in doubt. It matches UUID v4 entropy in a shorter, cleaner string.",
    "Press Ctrl/Cmd+Enter to regenerate, Ctrl/Cmd+C to copy the whole batch, and Ctrl/Cmd+S to export.",
    "Watch the collision-odds badge before shipping short numeric codes, small alphabets need more length than you'd think.",
    "Use a custom alphabet without look-alike characters (0/O, 1/l/I) for codes people will read aloud or type by hand.",
    "Generate a CSV batch to seed a database or fixtures, then diff two exports to confirm you never reused an ID.",
  ],

  security:
    "Every Nano ID is generated entirely in your browser using the Web Crypto secure random source. Nothing is uploaded to any server. No ID, alphabet or seed is stored, logged or transmitted, so you can safely generate identifiers that will key real production or personal data. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is a Nano ID and how is it different from a UUID?",
      answer:
        "A Nano ID is a compact, URL-safe unique identifier. By default it is 21 characters drawn from a 64-character alphabet (A–Z, a–z, 0–9, '-', '_'), giving roughly 126 bits of randomness, about the same as a UUID v4, in a string that is around 40% shorter and needs no hyphens or encoding. UUIDs are a fixed 36-character format. Nano IDs let you choose the length and alphabet.",
    },
    {
      question: "Are these Nano IDs cryptographically secure?",
      answer:
        "Yes. They are generated from the browser's Web Crypto secure random source (the same primitive used for cryptographic randomness), not the biased Math.random. That makes them unguessable and suitable as public identifiers. For true secrets like session tokens or passwords, a dedicated tool with explicit entropy targets is still the better choice.",
    },
    {
      question: "How long should my Nano ID be?",
      answer:
        "It depends on your alphabet and how many IDs you'll create. The default 21 characters over the URL-safe alphabet is a safe general choice with negligible collision risk even at billions of IDs. For short codes over small alphabets (numeric or lowercase), use the live collision-probability estimate to pick a length whose odds are acceptable for your volume.",
    },
    {
      question: "Can I use my own alphabet?",
      answer:
        "Yes. Switch the preset to Custom and type any character set you like: for example, an unambiguous alphabet that omits look-alike characters (0/O, 1/l/I) for human-readable codes. Duplicate characters are removed automatically, and the tool shows the effective alphabet size and updates the collision estimate accordingly.",
    },
    {
      question: "What does the collision probability actually mean?",
      answer:
        "It's an estimate, using the birthday-paradox approximation, of the chance that at least two IDs in your chosen volume come out identical, given your alphabet size and ID length. A very small number (say 1 in a trillion) means collisions are effectively impossible for your use. A larger number is a signal to lengthen the ID or widen the alphabet.",
    },
    {
      question: "Is my data uploaded to a server?",
      answer:
        "No. All generation happens locally in your browser using Web Crypto. No IDs, options or seeds are ever sent to a server, stored or logged, so it is completely safe to generate identifiers that will key sensitive records: nothing leaves your device.",
    },
    {
      question: "How many Nano IDs can I generate at once?",
      answer:
        "From 1 to 1,000 in a single batch. Each ID is numbered and individually copyable, and you can copy the whole batch or export it as a TXT or CSV file, handy for seeding databases, fixtures or test data.",
    },
    {
      question: "Are Nano IDs URL-safe and filename-safe?",
      answer:
        "The default alphabet is URL-safe: it contains only characters that are valid in a URL path without percent-encoding, so IDs work directly in links, query strings and object keys. Note it includes '-' and '_'. If a specific filesystem or tool rejects those, switch to the alphanumeric or hex preset for maximum portability.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: live size slider, URL-safe/numeric/lowercase/hex/alphanumeric presets, custom alphabet, bulk 1–1,000, per-row and bulk copy, TXT/CSV export and session history.",
    },
    {
      date: "2026-06-28",
      change:
        "Added the real-time birthday-paradox collision-probability estimate driven by alphabet size, length and volume, plus keyboard shortcuts and an in-tool shortcuts helper.",
    },
    {
      date: "2026-07-02",
      change:
        "Custom-alphabet field now deduplicates characters and reports the effective alphabet size. Refined empty-state sample and dark-mode contrast.",
    },
  ],

  relatedTools: ["uuid-generator", "jwt-decoder", "base64-encoder", "json-formatter"],
};

export default nanoidGenerator;
