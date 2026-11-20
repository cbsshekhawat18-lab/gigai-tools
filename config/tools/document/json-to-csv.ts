import type { Tool } from "@/types";

/**
 * JSON to CSV, the return-trip sibling of CSV to JSON in the GigAI
 * "Spreadsheets & CSV" group. It flattens an array of JSON objects into a
 * spreadsheet-ready CSV entirely in the browser: nested objects and arrays are
 * flattened into dotted/bracketed column keys, the union of every row's keys
 * becomes a stable header, and papaparse (`Papa.unparse`) does the RFC-4180
 * quoting so commas, quotes and newlines inside values are escaped correctly.
 * Every string below is written for the exact queries people type when they
 * need to turn an API response or a config array back into a spreadsheet -
 * nothing is shared with the CSV-to-JSON copy, and no claim outruns what the
 * client-side engine (which reuses `jsonToCsv`) actually does.
 */
const jsonToCsv: Tool = {
  slug: "json-to-csv",
  title: "JSON to CSV",
  description:
    "Convert JSON to CSV in your browser. Paste an array of objects and get a spreadsheet-ready CSV with a header row, automatic flattening of nested keys, and a choice of comma, semicolon or tab delimiter. Copy or download instantly. Nothing is uploaded.",
  category: "document-tools",
  group: "Spreadsheets & CSV",
  icon: "FileSpreadsheet",
  accent: "emerald",
  status: "live",
  featured: false,
  createdAt: "2026-06-14",

  h1: "JSON to CSV Converter: Turn JSON Into CSV Online",
  tagline:
    "Paste a JSON array of objects and watch it become a clean CSV live. Flatten nested objects into dotted columns, toggle the header row, and pick comma, semicolon or tab: then copy it or download a.csv, all in your browser and never uploaded.",
  longDescription:
    "The GigAI JSON to CSV converter is a desktop-grade tool for turning JSON, the shape almost every API returns, back into the CSV that spreadsheets, BI tools and analysts actually open. Paste an array of objects, drop a.json file, or import one, and it produces a spreadsheet-ready CSV the instant you type. Under the hood it reuses the same document engine as the rest of the suite: papaparse's `unparse` does the RFC-4180 quoting, so values containing commas, double quotes or embedded newlines are escaped correctly instead of silently splitting your columns. Real JSON is rarely flat, so the tool flattens nested structure before serialising: a `{ address: { city } }` becomes an `address.city` column and a `tags: [\"a\", \"b\"]` array becomes `tags.0` and `tags.1`, giving you one clean cell per leaf value. Because different objects in an array often carry different keys, the header is built from the union of every row's flattened keys. No column is dropped just because the first object happened not to have it, and missing values are written as empty cells rather than shifting your data. A header toggle lets you emit the column names or ship a headerless CSV for tools that expect raw rows, and a delimiter switch covers comma (classic CSV), semicolon (the European convention Excel expects in many locales) and tab (TSV) without changing your data. Live badges report the row and column counts and the exact output size, so you know precisely what you are shipping. Copy the CSV to your clipboard, download it as a.csv you can open straight in Excel or Google Sheets, or share a link that reopens the tool with your data pre-loaded. Everything runs client-side: API dumps, exported records and internal datasets never leave your machine, and closing the tab erases every trace.",

  ctaText: "Convert to CSV",

  keywords: [
    "json to csv",
    "convert json to csv",
    "json to csv converter",
    "json to csv online",
    "json array to csv",
    "json to excel csv",
    "flatten json to csv",
    "nested json to csv",
    "api response to csv",
    "json to spreadsheet",
    "json to tsv",
    "json to csv with headers",
  ],

  seo: {
    title: "JSON to CSV Converter: Convert JSON to CSV Online | GigAI Tools",
    description:
      "Free online JSON to CSV converter. Paste a JSON array of objects and get a spreadsheet-ready CSV with a header row, automatic flattening of nested keys and a comma/semicolon/tab delimiter choice, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "FileSpreadsheet",
      title: "Spreadsheet-ready output",
      description:
        "Paste an array of objects and get a CSV that opens straight in Excel, Google Sheets or Numbers, with proper RFC-4180 quoting so commas, quotes and newlines inside values never break your columns.",
    },
    {
      icon: "ListTree",
      title: "Flattens nested keys",
      description:
        "Nested objects and arrays are flattened into dotted, bracket-indexed columns (address.city, tags.0, tags.1) so every leaf value lands in its own cell instead of a dumped JSON blob.",
    },
    {
      icon: "Columns3",
      title: "Union-of-keys header",
      description:
        "When objects in the array carry different fields, the header is built from every row's keys combined. No column is dropped and missing values become empty cells, so nothing shifts out of line.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Comma, semicolon or tab",
      description:
        "Choose classic comma CSV, the semicolon convention many Excel locales expect, or tab-separated TSV, the delimiter changes without touching your data.",
    },
    {
      icon: "Gauge",
      title: "Live row, column & size badges",
      description:
        "The moment you paste, badges show how many rows and columns were produced and the exact size of the CSV output, so you know precisely what you are about to ship.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Conversion happens on your device. API dumps, exported records and internal datasets are never uploaded, stored or logged: close the tab and every trace is gone.",
    },
  ],

  benefits: [
    {
      title: "Get an API response into a spreadsheet",
      description:
        "Turn the JSON array an endpoint returns into a CSV an analyst can open in Excel or Sheets. No export script, no server round-trip, no copy-pasting cell by cell.",
    },
    {
      title: "Nested data becomes real columns",
      description:
        "Flattening means a value buried in address.city or tags.0 gets its own column, so the CSV is usable instead of a single cell full of stringified JSON.",
    },
    {
      title: "Handles ragged arrays cleanly",
      description:
        "Objects with different keys still line up: the union header keeps every field and writes blanks where a row lacks one, so your columns never drift.",
    },
    {
      title: "No install, no upload",
      description:
        "Get a robust JSON-to-CSV converter without wiring up papaparse in a project or pasting confidential data into a third-party site. It all runs locally in the tab.",
    },
  ],

  howTo: [
    {
      title: "Add your JSON",
      description:
        "Paste a JSON array of objects into the left editor, drop a .json file anywhere on the workspace, or click Import. A sample loads in one click if you just want to see it work.",
    },
    {
      title: "Flatten & set the header",
      description:
        "Leave flattening on to turn nested objects and arrays into dotted columns, and toggle the header row on for named columns or off for a raw, headerless CSV.",
    },
    {
      title: "Pick a delimiter",
      description:
        "Choose comma, semicolon or tab depending on what your spreadsheet or downstream tool expects. The CSV re-renders live the instant you switch.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the CSV to your clipboard, download it as a .csv file, or share a link that reopens the tool with your data pre-loaded.",
    },
  ],

  formats: {
    input: ["JSON"],
    output: ["CSV", "TSV"],
  },

  useCases: [
    {
      audience: "Data analyst",
      title: "Open an API dump in Excel",
      description:
        "Paste a JSON response from a REST endpoint and get a flattened CSV that loads straight into Excel or Google Sheets for filtering, pivots and charts.",
    },
    {
      audience: "Backend developer",
      title: "Export fixtures for review",
      description:
        "Turn an array of seed records or a JSON fixture into a CSV a non-technical teammate can open and comment on without touching the codebase.",
    },
    {
      audience: "Ops / analyst",
      title: "Feed a BI or import tool",
      description:
        "Convert a JSON export into the CSV shape a dashboard, CRM importer or billing tool expects, with the delimiter it requires, in one paste.",
    },
    {
      audience: "No-code builder",
      title: "Bridge a JSON-only source to a sheet",
      description:
        "Take JSON from an automation or webhook and produce a CSV your spreadsheet-based workflow or import step can actually accept.",
    },
  ],

  troubleshooting: [
    {
      problem: "My nested objects show up as one column of JSON text.",
      solution:
        "Make sure 'Flatten nested keys' is on. It expands objects and arrays into dotted columns (address.city, tags.0). With it off, a nested value is written as a compact JSON string in a single cell by design.",
    },
    {
      problem: "Some rows have blank cells I didn't expect.",
      solution:
        "That is the union-of-keys header working as intended: when objects in the array have different fields, every field becomes a column and rows that lack one get an empty cell so nothing shifts. Add the missing key to those objects if you want a value there.",
    },
    {
      problem: "Excel put my whole row in one cell.",
      solution:
        "Your locale's Excel likely expects a semicolon separator. Switch the delimiter to semicolon and re-download, or import the comma CSV via Excel's Data → From Text/CSV with the delimiter set explicitly.",
    },
    {
      problem: "It says the JSON must be an array.",
      solution:
        "CSV rows come from a top-level JSON array. Wrap a single object in an array ([ { … } ]) or point the tool at the array inside your payload, the converter reads an array of objects (or arrays), not a bare object.",
    },
  ],

  tips: [
    "Wrap a single object in an array ([ { … } ]) to get a one-row CSV. A bare object isn't a table.",
    "Turn the header row off when a downstream importer expects raw rows without column names.",
    "Pick the semicolon delimiter if Excel in your locale splits comma CSVs into one cell.",
    "Flattening uses dotted keys (address.city) and array indices (tags.0), rename those columns in your spreadsheet afterwards if you need friendlier headers.",
    "Need to go the other way? Use the sibling CSV to JSON tool to turn a spreadsheet back into an array of objects.",
  ],

  security:
    "Your JSON is flattened and converted to CSV entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert API responses, exported records and internal datasets. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my JSON uploaded to a server?",
      answer:
        "No. All flattening and conversion happen locally in your browser using the papaparse engine. Your data never leaves your device, so there is nothing for us to store, log or see. It is safe to convert confidential API responses and internal datasets.",
    },
    {
      question: "How are nested objects and arrays handled?",
      answer:
        "They are flattened into dotted, index-suffixed columns. A value at address.city becomes an address.city column and a tags array becomes tags.0, tags.1 and so on, so every leaf value gets its own cell. You can turn flattening off, in which case nested values are written as compact JSON strings in a single cell.",
    },
    {
      question: "What if my objects don't all have the same keys?",
      answer:
        "The header is built from the union of every row's keys, so no field is dropped. Rows that lack a given key get an empty cell for that column, which keeps every value under the right header instead of drifting.",
    },
    {
      question: "Can it output semicolon or tab-separated (TSV) files?",
      answer:
        "Yes. A delimiter switch lets you choose comma (classic CSV), semicolon (the convention many Excel locales expect) or tab (TSV). The delimiter changes the separator only: your values are untouched.",
    },
    {
      question: "Are commas, quotes and newlines inside values escaped correctly?",
      answer:
        "Yes. papaparse follows RFC 4180, so any value containing the delimiter, a double quote or a line break is quoted and escaped properly: the exact cases where a naive join would corrupt the CSV.",
    },
    {
      question: "Does it accept a JSON array of arrays, not just objects?",
      answer:
        "Yes. If the top-level array contains arrays, each inner array becomes a CSV row positionally. Arrays of objects are the common case and produce a named-column CSV. Arrays of arrays produce a positional one.",
    },
    {
      question: "Can I convert a single JSON object?",
      answer:
        "A CSV needs rows, which come from a top-level array. Wrap your object in an array, [ { … } ], to get a single-row CSV, or point the tool at the array field inside your payload.",
    },
    {
      question: "How do I convert CSV back to JSON?",
      answer:
        "Use the sibling CSV to JSON tool. It takes CSV or TSV and produces an array of objects or arrays, with the same client-side, nothing-uploaded guarantee.",
    },
  ],

  changelog: [
    {
      date: "2026-06-14",
      change:
        "Initial release, client-side JSON to CSV built on the shared papaparse engine, with a header toggle, a comma/semicolon/tab delimiter switch, live conversion, row/column/size badges, copy, download and shareable links.",
    },
    {
      date: "2026-06-20",
      change:
        "Added automatic flattening of nested objects and arrays into dotted, index-suffixed columns, plus a union-of-keys header so ragged arrays keep every field.",
    },
    {
      date: "2026-06-28",
      change:
        "Added a toggle to disable flattening (nested values kept as compact JSON strings) and refined the row/column badges for arrays of arrays.",
    },
  ],

  relatedTools: ["csv-to-json", "csv-to-excel", "excel-to-csv", "json-formatter"],
};

export default jsonToCsv;
