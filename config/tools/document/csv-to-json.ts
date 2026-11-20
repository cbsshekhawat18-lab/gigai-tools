import type { Tool } from "@/types";

/**
 * CSV to JSON: the flagship of the GigAI "Spreadsheets & CSV" group. It turns
 * spreadsheet exports and pasted delimited text into clean JSON entirely in the
 * browser: papaparse does the parsing (with delimiter sniffing and RFC-4180
 * quote handling) and the tool layers on a header toggle, opt-in type
 * inference, and a pretty/minified switch, streaming the result live into a
 * second editor pane. Every string below is written for the exact queries
 * people type when they need to feed a CSV into an API, a fixture, or a config
 * - nothing is shared with the SVG/JSON-formatter copy, and no claim outruns
 * what the client-side engine actually does.
 */
const csvToJson: Tool = {
  slug: "csv-to-json",
  title: "CSV to JSON",
  description:
    "Convert CSV to JSON in your browser. Paste or drop a.csv and get a clean array of objects or arrays with a header toggle, optional number/boolean type inference and pretty or minified output. Nothing is uploaded.",
  category: "document-tools",
  group: "Spreadsheets & CSV",
  icon: "Braces",
  accent: "amber",
  status: "live",
  featured: true,
  createdAt: "2026-06-11",

  h1: "CSV to JSON Converter, Turn CSV Into JSON Online",
  tagline:
    "Paste CSV or drop a spreadsheet export and watch it become clean JSON live. Choose an array of objects or arrays, toggle the header row, opt into number/boolean/null type inference, and switch between pretty and minified, all in your browser, never uploaded.",
  longDescription:
    "The GigAI CSV to JSON converter is a desktop-grade tool for reshaping delimited data into JSON without a script or a server round-trip. Paste CSV, drop a.csv exported from Excel, Google Sheets or a database, or import a file, and it parses the text with papaparse: automatically sniffing whether your fields are separated by commas, semicolons or tabs, and correctly handling quoted values, embedded commas and multi-line cells that trip up naive split-on-comma converters. The output streams live into a second editor as you type or change an option. Turn the header toggle on and every row becomes a JSON object keyed by your column names. Turn it off and each row becomes a plain array, which is handy for headerless data or when you want positional access. Because CSV is pure text, values arrive as strings by default: flip on type inference and the tool converts obvious numbers, true/false and empty cells into real JSON numbers, booleans and null, so the result drops straight into a typed API or a config file without a post-processing pass. A pretty/minified switch gives you 2-space-indented JSON for reading or a single-line payload for the smallest request body, and live badges show row and column counts plus the output size so you know exactly what you are shipping. Copy it to your clipboard, download it as a.json file, or share a link that reopens the tool with your data pre-loaded. Because everything runs client-side, customer exports, analytics dumps and internal datasets never leave your machine: close the tab and every trace is gone.",

  ctaText: "Convert to JSON",

  keywords: [
    "csv to json",
    "convert csv to json",
    "csv to json converter",
    "csv to json online",
    "csv to array of objects",
    "parse csv to json",
    "csv json converter",
    "excel csv to json",
    "csv to json array",
    "spreadsheet to json",
    "tsv to json",
    "csv to json with headers",
  ],

  seo: {
    title: "CSV to JSON Converter: Convert CSV to JSON Online | GigAI Tools",
    description:
      "Free online CSV to JSON converter. Paste or drop a CSV and get a clean array of objects or arrays with a header toggle, number/boolean type inference and pretty or minified output, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Braces",
      title: "Objects or arrays, your call",
      description:
        "With the header toggle on, each row becomes a JSON object keyed by your column names. Turn it off and every row is a plain array, ideal for headerless data or positional access.",
    },
    {
      icon: "WandSparkles",
      title: "Optional type inference",
      description:
        "CSV is all strings by default. Flip on inference and obvious numbers, true/false and empty cells become real JSON numbers, booleans and null: output that drops straight into a typed API.",
    },
    {
      icon: "ScanLine",
      title: "Automatic delimiter sniffing",
      description:
        "Comma, semicolon or tab, papaparse detects the separator for you and handles quoted values, embedded commas and multi-line cells that break naive split-on-comma converters.",
    },
    {
      icon: "SlidersHorizontal",
      title: "Pretty or minified output",
      description:
        "Switch between human-readable 2-space-indented JSON for reading and a single-line minified payload for the smallest possible request body: the result re-renders live.",
    },
    {
      icon: "Gauge",
      title: "Live row, column & size badges",
      description:
        "The moment you paste, badges show how many rows and columns were parsed and the exact size of the JSON output, so you know precisely what you are about to ship.",
    },
    {
      icon: "ShieldCheck",
      title: "100% client-side",
      description:
        "Parsing and conversion happen on your device. Customer exports, analytics dumps and internal datasets are never uploaded, stored or logged, close the tab and every trace is gone.",
    },
  ],

  benefits: [
    {
      title: "Feed CSV into any API",
      description:
        "Turn a spreadsheet export into an array of objects that a REST endpoint, a Postman request or a fetch() body accepts without you writing a one-off parsing script.",
    },
    {
      title: "Handles the CSV edge cases",
      description:
        "Quoted fields, values with commas inside them and multi-line cells are parsed correctly, the exact places a quick split(',') would silently corrupt your data.",
    },
    {
      title: "Typed output, not just strings",
      description:
        "Opt-in inference means your numbers are numbers and your booleans are booleans, so the JSON validates against a typed schema instead of failing on quoted strings.",
    },
    {
      title: "No install, no upload",
      description:
        "Get a robust CSV parser without wiring up papaparse in a project or pasting confidential data into a third-party server. It all runs locally in the tab.",
    },
  ],

  howTo: [
    {
      title: "Add your CSV",
      description:
        "Paste CSV into the left editor, drop a .csv file anywhere on the workspace, or click Import. A sample loads in one click if you just want to see it work.",
    },
    {
      title: "Set the shape",
      description:
        "Choose 'Array of objects' to key rows by the header row, or 'Array of arrays' for positional rows. The output re-converts live the instant you switch.",
    },
    {
      title: "Tune types & formatting",
      description:
        "Turn on type inference to convert numbers, booleans and blanks to real JSON values, and pick pretty (indented) or minified (single-line) output.",
    },
    {
      title: "Copy or download",
      description:
        "Copy the JSON to your clipboard, download it as a .json file, or share a link that reopens the tool with your data pre-loaded.",
    },
  ],

  formats: {
    input: ["CSV", "TSV", "TXT"],
    output: ["JSON"],
  },

  useCases: [
    {
      audience: "Backend developer",
      title: "Seed a database or fixture",
      description:
        "Convert a CSV of sample records into an array of objects to paste straight into a seed script, a test fixture or a JSON mock for a front end.",
    },
    {
      audience: "API integrator",
      title: "Build a request body",
      description:
        "Turn a spreadsheet a client sent you into a minified JSON array you can drop into a POST body or a Postman request without hand-editing every row.",
    },
    {
      audience: "Data analyst",
      title: "Reshape an export for a notebook",
      description:
        "Take a CSV export from a BI tool or a database and get typed JSON that loads cleanly into a JavaScript notebook, a config, or a charting library.",
    },
    {
      audience: "No-code builder",
      title: "Feed a JSON-only tool",
      description:
        "Convert a Google Sheets export to JSON so it drops into an automation, a static-site data file or a low-code platform that only accepts JSON.",
    },
  ],

  troubleshooting: [
    {
      problem: "My columns are all in one field / the split looks wrong.",
      solution:
        "The delimiter was mis-detected because the file is mostly one column or uses an unusual separator. Make sure the file is genuine CSV/TSV. Papaparse sniffs comma, semicolon and tab from the data, so a consistent delimiter throughout gives the cleanest result.",
    },
    {
      problem: "My numbers came out as strings like \"42\".",
      solution:
        "Type inference is off by default because CSV has no types. Turn on 'Infer types' to convert obvious numbers, true/false and empty cells into real JSON numbers, booleans and null.",
    },
    {
      problem: "A value like 007 or a phone number lost its leading zeros.",
      solution:
        "That happens when inference treats it as a number. If leading zeros or exact formatting matter (IDs, ZIP codes, phone numbers), turn 'Infer types' off so every value stays an exact string.",
    },
    {
      problem: "The first data row became my keys / a header row is missing.",
      solution:
        "The header toggle controls this. If your file has no header row, switch to 'Array of arrays' so each row becomes a positional array instead of being keyed by the first row.",
    },
  ],

  tips: [
    "Leave 'Infer types' off when values are identifiers, ZIP codes or phone numbers. It preserves leading zeros and exact formatting as strings.",
    "Use 'Array of arrays' for headerless data or when you want positional access. Use 'Array of objects' when column names should become keys.",
    "Pick minified output for the smallest API request body, and pretty output when a human needs to read or diff the result.",
    "Paste tab-separated data straight in, the delimiter sniffer detects tabs, so a TSV converts without any extra setting.",
    "Need to go the other way? Use the sibling JSON to CSV tool to turn an array of objects back into a spreadsheet-ready file.",
  ],

  security:
    "Your CSV is parsed and converted entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert customer exports, analytics dumps and internal datasets. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my CSV uploaded to a server?",
      answer:
        "No. All parsing and conversion happen locally in your browser using the papaparse engine. Your data never leaves your device, so there is nothing for us to store, log or see. It is safe to convert confidential exports and internal datasets.",
    },
    {
      question: "Does it output an array of objects or an array of arrays?",
      answer:
        "Both. You choose. With the header toggle on ('Array of objects') the first row becomes the keys and every subsequent row is an object. With it off ('Array of arrays') each row becomes a positional array, which is ideal for headerless data.",
    },
    {
      question: "Will my numbers and booleans stay strings?",
      answer:
        "By default yes, because CSV is pure text and keeping everything a string is the safest, lossless behaviour. Turn on 'Infer types' and the tool converts obvious numbers, true/false and empty cells into real JSON numbers, booleans and null.",
    },
    {
      question: "Can it handle semicolons or tab-separated (TSV) files?",
      answer:
        "Yes. The parser sniffs the delimiter from your data, so comma, semicolon and tab-separated files all convert without changing a setting. Paste a TSV straight in and it just works.",
    },
    {
      question: "Does it handle quoted fields and commas inside values?",
      answer:
        "Yes. papaparse follows RFC 4180, so quoted fields, commas inside quoted values and multi-line cells are parsed correctly: the exact cases where a quick split-on-comma would corrupt your data.",
    },
    {
      question: "Why did my ID or ZIP code lose its leading zeros?",
      answer:
        "That happens when type inference turns a value like 007 into the number 7. When leading zeros or exact formatting matter (IDs, ZIP codes, phone numbers) turn 'Infer types' off so every value is preserved as an exact string.",
    },
    {
      question: "Is there a size limit?",
      answer:
        "There is a generous guard so the browser tab stays responsive during live conversion. Typical exports of a few thousand rows are well within it. For an enormous file, convert it in chunks or minify the output to keep things snappy.",
    },
    {
      question: "How do I convert JSON back to CSV?",
      answer:
        "Use the sibling JSON to CSV tool. It takes an array of objects or arrays and produces a spreadsheet-ready CSV, with the same client-side, nothing-uploaded guarantee.",
    },
  ],

  changelog: [
    {
      date: "2026-06-11",
      change:
        "Initial release: client-side CSV to JSON with automatic delimiter sniffing, a header toggle for array-of-objects vs array-of-arrays, live conversion, pretty/minified output, row/column/size badges, copy, download, undo/redo and shareable links.",
    },
    {
      date: "2026-06-18",
      change:
        "Added opt-in type inference (numbers, booleans and empty→null) with a clear note that it is off by default to preserve leading zeros and exact string formatting.",
    },
    {
      date: "2026-06-26",
      change:
        "Improved TSV handling, added a curated set of sample CSVs and refined the row/column count badges for headerless data.",
    },
  ],

  relatedTools: [
    "json-to-csv",
    "csv-to-excel",
    "excel-to-csv",
    "json-formatter",
    "csv-viewer",
    "merge-pdf",
  ],
};

export default csvToJson;
