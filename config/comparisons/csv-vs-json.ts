import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "csv-vs-json",
  a: "CSV",
  b: "JSON",
  title: "CSV vs JSON: Which Data Format Fits Your Job?",
  description:
    "CSV is a flat, compact table format that spreadsheets love. JSON is a nested, structured format that code and APIs love. How to do it they differ and when to reach for each.",
  accent: "amber",
  icon: "Braces",
  seo: {
    title: "CSV vs JSON: Tabular vs Nested Data, Which to Use (2026)",
    description:
      "CSV vs JSON compared: flat tables vs nested structure, file size, readability, spreadsheet vs API use, data types, and free converters to switch between them.",
    keywords: [
      "csv vs json",
      "json vs csv",
      "difference between csv and json",
      "when to use csv vs json",
      "csv or json for data",
      "convert csv to json",
    ],
    canonical: "/compare/csv-vs-json",
  },
  intro: [
    "CSV and JSON are two of the most common ways to move data around, and choosing between them comes down to one question: is your data a simple table, or does it have structure? CSV, comma-separated values, is a flat text format where each line is a row and each comma marks a column. It's compact, human-readable, and every spreadsheet on earth opens it. But it only really models a single flat table. The moment your data has nesting, lists inside records, or varying fields, CSV starts to strain.",
    "JSON (JavaScript Object Notation) is built for exactly that structure. It represents data as nested objects and arrays, so a record can contain lists, sub-objects and mixed fields naturally, and it distinguishes real data types (numbers, strings, booleans, null) rather than treating everything as text. That expressiveness is why JSON is the lingua franca of web APIs and configuration. The cost is that JSON is more verbose than CSV and less convenient to eyeball as a big table.",
    "So the two aren't really competitors so much as tools for different shapes of data. Below is a breakdown of how they differ, when each is clearly the right pick, and the honest verdict: with the free converters to move data either way.",
  ],
  dimensions: [
    {
      label: "Data shape",
      a: "Flat, tabular, rows and columns only.",
      b: "Hierarchical, nested objects and arrays of any depth.",
    },
    {
      label: "Data types",
      a: "Everything is text. Types must be inferred or parsed.",
      b: "Native types: string, number, boolean, null, array, object.",
    },
    {
      label: "File size",
      a: "Compact. No repeated keys, minimal syntax.",
      b: "Larger, field names repeat on every record.",
    },
    {
      label: "Human readability",
      a: "Easy to scan as a table. Hard once fields get complex.",
      b: "Clear for structured records. Noisier for big flat tables.",
    },
    {
      label: "Tooling",
      a: "Opens in Excel, Google Sheets and every data tool.",
      b: "Native to code, APIs, config. Parsed in every language.",
    },
    {
      label: "Nested / variable data",
      a: "Poor: awkward workarounds needed for lists or nesting.",
      b: "Excellent: handles nesting and varying fields cleanly.",
    },
    {
      label: "Best for",
      a: "Spreadsheets, bulk exports, tabular datasets, data entry.",
      b: "APIs, app config, structured records, code-to-code exchange.",
    },
  ],
  whenA: [
    "The data is a plain table: rows and columns with consistent fields.",
    "It's headed for a spreadsheet, a bulk import, or a data analyst.",
    "You want the smallest, simplest file and don't need nesting or types.",
    "Non-technical people need to open, read or edit it without special tools.",
  ],
  whenB: [
    "Records have nesting, lists, or fields that vary from one to the next.",
    "The data is exchanged with an API, an app, or between programs.",
    "You need real data types preserved (numbers stay numbers, booleans stay booleans).",
    "The structure matters more than being viewable as a flat grid.",
  ],
  verdict:
    "Use CSV when your data is a simple table headed for a spreadsheet or bulk import, it's smaller, simpler and universally openable. Use JSON when your data has structure, types or nesting, or when it's moving between programs and APIs, because that's exactly what JSON is built for. Flattening nested JSON into CSV loses information. Inflating a flat CSV into JSON just adds verbosity, so match the format to the shape of the data, and convert when the destination needs the other shape.",
  relatedToolSlugs: ["csv-to-json", "json-to-csv", "csv-to-excel", "json-formatter"],
  faq: [
    {
      question: "Is JSON better than CSV?",
      answer:
        "Neither is universally better. They suit different data shapes. JSON is better for structured, nested or typed data and for exchange between programs and APIs. CSV is better for flat tables headed to spreadsheets, where it's smaller and simpler. Pick by whether your data is a table (CSV) or a structure (JSON).",
    },
    {
      question: "Can I convert nested JSON to CSV?",
      answer:
        "You can, but it's lossy. CSV only models a flat table, so nested objects and arrays have to be flattened into extra columns or joined into single cells, which loses the original structure. It works fine for shallow JSON. For deeply nested data, expect to make compromises or keep the JSON as the source of truth.",
    },
    {
      question: "Why is my CSV file smaller than the equivalent JSON?",
      answer:
        "Because CSV writes each field name only once, in the header row, while JSON repeats every field name on every single record. For large tabular datasets that repetition adds up, making JSON noticeably larger. That compactness is one of CSV's main advantages for bulk tabular data.",
    },
    {
      question: "Does CSV keep data types like numbers and booleans?",
      answer:
        "No. In CSV everything is just text, so a number, a date and the word 'true' are all stored as plain strings and must be interpreted by whatever reads the file. JSON preserves real types (numbers stay numbers, booleans stay booleans) which is why code and APIs prefer it.",
    },
    {
      question: "Which should an API return, CSV or JSON?",
      answer:
        "JSON, in almost all cases. APIs exchange structured, typed data between programs, and JSON models that natively while being trivially parseable in every language. CSV shows up in APIs mainly for bulk tabular exports meant to be dropped straight into a spreadsheet or data pipeline.",
    },
  ],
  relatedComparisonSlugs: ["json-vs-xml", "yaml-vs-json"],
};

export default comparison;
