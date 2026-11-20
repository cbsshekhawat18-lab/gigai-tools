import type { Tool } from "@/types";

/**
 * UUID Generator, a developer-tools "product" page. All copy is unique to
 * identifier generation and kept honest: v4 UUIDs come from the browser's
 * cryptographically-secure `crypto.randomUUID`, v7 is assembled per the RFC 9562
 * layout (48-bit millisecond timestamp + random bits), and the nil UUID is the
 * canonical all-zero value. Nothing is generated or logged on a server.
 */
const uuidGenerator: Tool = {
  slug: "uuid-generator",
  title: "UUID Generator",
  description:
    "Generate secure UUIDs instantly, random v4, time-ordered v7, or the nil UUID. Bulk-generate up to 1,000, copy or export as TXT/CSV, all in your browser.",
  category: "developer-tools",
  icon: "Fingerprint",
  accent: "violet",
  status: "live",
  createdAt: "2026-06-20",

  h1: "UUID Generator, v4, v7 & Nil",
  tagline:
    "Cryptographically-secure, RFC 9562-compliant UUIDs generated locally. Pick a version, generate one or a thousand, and copy or export in a click.",
  longDescription:
    "The GigAI UUID Generator produces universally unique identifiers on demand, the random version 4 that powers most databases and APIs, the newer time-ordered version 7 that sorts by creation time for far friendlier database indexes, and the canonical nil UUID for placeholders and defaults. Generate a single value or up to 1,000 at once, switch to uppercase, strip the hyphens for compact storage, then copy them all or export a clean TXT or CSV file. Every UUID is created inside your browser using the Web Crypto API (`crypto.randomUUID` and `getRandomValues`), so the values are cryptographically random and never travel to a server. They are yours the instant they appear.",

  ctaText: "Generate a UUID",

  keywords: [
    "uuid generator",
    "generate uuid",
    "uuid v4 generator",
    "uuid v7 generator",
    "guid generator",
    "random uuid",
    "bulk uuid generator",
    "nil uuid",
    "uuid online",
    "unique id generator",
    "rfc 9562 uuid",
    "time ordered uuid",
  ],

  seo: {
    title: "UUID Generator, v4, v7 & Nil UUIDs (Free, Bulk) | GigAI Tools",
    description:
      "Free online UUID generator. Create secure random v4, time-ordered v7 or nil UUIDs, bulk-generate up to 1,000, and export as TXT or CSV. Runs entirely in your browser. No upload, no sign-up.",
  },

  features: [
    {
      icon: "Shuffle",
      title: "Version 4 (random)",
      description:
        "The universal default: 122 bits of cryptographically-secure randomness from the browser's Web Crypto engine. Collision-proof in practice and supported by every language, database and framework.",
    },
    {
      icon: "Clock",
      title: "Version 7 (time-ordered)",
      description:
        "A 48-bit millisecond timestamp followed by random bits, so IDs sort lexically by creation time. Ideal as a primary key, sequential inserts keep B-tree indexes tight and avoid page-split churn.",
    },
    {
      icon: "Layers",
      title: "Bulk generation, 1–1,000",
      description:
        "Need a batch for seeding a table or a load test? Set the count with the stepper and get up to a thousand unique identifiers at once, each on its own copyable row.",
    },
    {
      icon: "CaseUpper",
      title: "Uppercase & hyphen control",
      description:
        "Toggle uppercase for systems that expect GUID casing, or drop the hyphens for compact 32-character storage. Formatting updates the whole batch live. No regenerating.",
    },
    {
      icon: "FileDown",
      title: "Copy all or export TXT / CSV",
      description:
        "Copy the entire batch to your clipboard, or download a newline-delimited TXT or a single-column CSV ready to import into a spreadsheet, seed script or database.",
    },
    {
      icon: "History",
      title: "Session history",
      description:
        "Each regeneration is kept in a scrollable history so you can grab a value you generated a moment ago without losing your current batch.",
    },
  ],

  benefits: [
    {
      title: "Genuinely random & private",
      description:
        "Values come from `crypto.randomUUID` and `crypto.getRandomValues` inside your tab. There is no server round-trip, no logging and no way for anyone (including us) to see the IDs you create.",
    },
    {
      title: "The right version for the job",
      description:
        "We explain v4 versus v7 in plain terms so you can pick correctly: v4 for general-purpose uniqueness, v7 when you want database-friendly, time-sortable keys.",
    },
    {
      title: "Fewer clicks than any competitor",
      description:
        "A UUID is already on screen when the page loads. Changing version, count or formatting updates instantly. No 'submit', no page reload, no ads between you and the result.",
    },
    {
      title: "RFC 9562 compliant",
      description:
        "Both the version and variant bits are set exactly as the specification requires, so the identifiers validate against any conforming UUID library or database column type.",
    },
  ],

  howTo: [
    {
      title: "Choose a version",
      description:
        "Pick v4 for random identifiers, v7 for time-ordered database keys, or nil for the all-zero placeholder. A sample is generated the moment the page opens.",
    },
    {
      title: "Set the count",
      description:
        "Leave it at 1 for a single value, or use the stepper to generate up to 1,000 at once for seeding, testing or migrations.",
    },
    {
      title: "Format to taste",
      description:
        "Flip on uppercase for GUID-style casing, or turn off hyphens for a compact 32-character form. The whole batch reformats live.",
    },
    {
      title: "Generate & grab",
      description:
        "Hit Generate for a fresh batch, then copy a single row, copy all, or export a TXT or CSV file to use anywhere.",
    },
  ],

  formats: {
    input: [],
    output: ["UUID v4", "UUID v7", "Nil UUID", "TXT", "CSV"],
  },

  useCases: [
    {
      audience: "Backend developers",
      title: "Primary keys & correlation IDs",
      description:
        "Grab a v7 UUID for a new table's primary key to keep inserts sequential, or a v4 for a request/trace correlation ID that's safe to expose in logs and headers.",
    },
    {
      audience: "QA & test engineers",
      title: "Seed data & load tests",
      description:
        "Bulk-generate hundreds of unique identifiers, export them as CSV, and feed them straight into fixtures, mock records or a load-testing script.",
    },
    {
      audience: "Data & DevOps teams",
      title: "Migrations & idempotency keys",
      description:
        "Mint stable identifiers for a migration mapping table, or a batch of idempotency keys for a message queue, reproducibly and without leaving the browser.",
    },
    {
      audience: "Frontend & mobile developers",
      title: "Client-side entity IDs",
      description:
        "Assign an offline-first record its own ID before it ever reaches the server, so optimistic UI updates and later syncs never collide.",
    },
  ],

  faq: [
    {
      question: "What is a UUID and how unique is it really?",
      answer:
        "A UUID (Universally Unique Identifier), also called a GUID, is a 128-bit value written as 32 hexadecimal digits in the pattern 8-4-4-4-12. A version 4 UUID contains 122 random bits, giving roughly 5.3 × 10³⁶ possibilities. In practical terms you could generate a billion a second for a century and the odds of a single collision would still be negligible, which is why UUIDs are safe to create independently on many machines without coordination.",
    },
    {
      question: "Should I use UUID v4 or v7?",
      answer:
        "Use v4 when you just need a random, unpredictable identifier, API keys' cousins, correlation IDs, general-purpose uniqueness. Use v7 when the UUID will be a database primary key: because v7 begins with a millisecond timestamp, new rows insert in roughly ascending order, which keeps B-tree indexes compact and avoids the random-write fragmentation that plagues v4 keys. The trade-off is that v7 leaks the creation time and is loosely guessable in sequence, so don't use it where unpredictability is a security requirement.",
    },
    {
      question: "Are these UUIDs cryptographically secure?",
      answer:
        "Yes. Version 4 values use the browser's native `crypto.randomUUID`, and version 7 fills its random bits with `crypto.getRandomValues`. Both are backed by a cryptographically-secure pseudo-random number generator (CSPRNG). That's meaningfully stronger than tools that fall back on `Math.random`, which is not suitable for anything security-adjacent.",
    },
    {
      question: "Are the UUIDs sent to or stored on a server?",
      answer:
        "No. Generation happens entirely in your browser tab using the Web Crypto API. The values are never uploaded, logged or stored by us, refresh the page and they're gone unless you copied or exported them.",
    },
    {
      question: "What is the nil UUID for?",
      answer:
        "The nil UUID is the special all-zero value, 00000000-0000-0000-0000-000000000000. It's the conventional 'empty' or 'unset' UUID, useful as a database default, a placeholder in tests, or a sentinel meaning 'no identifier assigned yet'.",
    },
    {
      question: "What's the difference between a UUID and a GUID?",
      answer:
        "None in substance. GUID (Globally Unique Identifier) is Microsoft's name for the same 128-bit standard. Some Microsoft systems display GUIDs in uppercase and sometimes wrapped in braces. Toggle uppercase here if a.NET or SQL Server context expects that casing. The bytes are identical either way.",
    },
    {
      question: "Can I generate UUIDs in bulk and export them?",
      answer:
        "Yes. Set the count up to 1,000 with the stepper, generate, and then either copy the whole batch or download it as a plain-text file (one UUID per line) or a CSV with a single 'uuid' column that imports cleanly into spreadsheets and seed scripts.",
    },
    {
      question: "Should I store UUIDs with or without hyphens?",
      answer:
        "It depends on your column type. Native UUID types (as in PostgreSQL) accept the standard hyphenated form and store it compactly regardless. If you're storing the text in a fixed CHAR column or a key-value store, the 32-character hyphen-free form saves four bytes each. Use the hyphens toggle to match whatever your schema expects.",
    },
  ],

  tips: [
    "Reach for v7 as a database primary key: its time-ordered prefix keeps index inserts sequential, which is dramatically faster to write than random v4 keys at scale.",
    "Prefer a native UUID column type (e.g. PostgreSQL `uuid`) over storing UUIDs as text: it's smaller, indexed better, and validates the format for you.",
    "Never use a UUID as a security token on its own. v4 is unguessable but v7 exposes creation time and ordering. For auth, pair the ID with a real secret.",
    "Generating seed data? Bulk-create the batch, export as CSV, and import it directly, far faster than pasting one value at a time.",
    "Keep hyphens on unless a specific storage format demands otherwise. The canonical form is what most libraries and validators expect by default.",
  ],

  troubleshooting: [
    {
      problem: "My database rejects the UUID as an invalid format.",
      solution:
        "Most UUID column types expect the canonical hyphenated form. Turn the hyphens toggle back on, and turn off uppercase unless your driver specifically accepts it, some strict parsers only accept lowercase.",
    },
    {
      problem: "The v7 UUIDs I generated aren't perfectly sorted.",
      solution:
        "v7 orders by millisecond, so many IDs created within the same millisecond share a timestamp prefix and their order among each other is random. That's expected and fine for indexing. The ordering is monotonic across milliseconds, not within one.",
    },
    {
      problem: "Copy all didn't work.",
      solution:
        "Clipboard access needs a secure context and can be blocked by browser permissions. If a copy is refused, use the per-row copy button or the TXT/CSV export instead, which download without needing clipboard access.",
    },
    {
      problem: "I asked for more than 1,000 UUIDs.",
      solution:
        "The count is capped at 1,000 per batch to keep the page responsive. Generate again for another batch, or export each batch and concatenate the files if you need a larger set.",
    },
  ],

  security:
    "Every UUID is generated locally with the Web Crypto API (`crypto.randomUUID` and `crypto.getRandomValues`) inside your browser tab. Nothing is transmitted to, generated by, or logged on a server, the identifiers exist only on your device until you copy or export them.",

  changelog: [
    {
      date: "2026-06-20",
      change: "Launched the UUID Generator with v4, v7 and nil support, bulk generation up to 1,000, uppercase and hyphen toggles, per-row copy, copy-all, and TXT/CSV export.",
    },
    {
      date: "2026-06-24",
      change: "Added session history so you can retrieve previously generated batches, plus keyboard shortcuts and a shortcuts helper.",
    },
    {
      date: "2026-06-28",
      change: "Formatting (uppercase / hyphens) now updates the current batch live instead of requiring a regenerate.",
    },
  ],

  relatedTools: ["nanoid-generator", "password-generator", "hash-generator"],
};

export default uuidGenerator;
