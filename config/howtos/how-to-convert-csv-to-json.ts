import type { HowTo } from "@/types";

const howto: HowTo = {
  slug: "how-to-convert-csv-to-json",
  title: "How to Convert CSV to JSON (Free, In Your Browser)",
  description:
    "Turn a spreadsheet or CSV export into a clean array of JSON objects, with the right headers as keys and correct data types. A step-by-step guide.",
  accent: "cyan",
  icon: "FileJson",
  toolSlug: "csv-to-json",
  seo: {
    title: "How to Convert CSV to JSON Online (Free, No Upload)",
    description:
      "Learn how to convert a CSV file to JSON in your browser, map headers to keys, handle delimiters and types, and export a clean JSON array. Free, private, step-by-step.",
    keywords: [
      "how to convert csv to json",
      "csv to json",
      "convert csv to json online",
      "csv to json array",
      "spreadsheet to json",
    ],
    canonical: "/how-to/how-to-convert-csv-to-json",
  },
  intro: [
    "CSV is perfect for spreadsheets but awkward for code: most APIs, config files and JavaScript apps expect JSON instead. Converting turns each row of your CSV into a JSON object, with the header row becoming the keys, so you get a clean array you can drop straight into a program or request body.",
    "The tricky parts are getting the delimiter right, deciding whether numbers and booleans should stay as text or be typed, and handling quoted fields that contain commas. This guide covers all of that using our free CSV-to-JSON converter, which runs entirely in your browser so your data never leaves your device.",
  ],
  steps: [
    {
      title: "Open the CSV to JSON converter",
      body: "Go to the CSV-to-JSON tool. It runs in the browser with nothing to install, and your file is processed locally. Nothing is uploaded.",
    },
    {
      title: "Paste or upload your CSV",
      body: "Drop in a .csv file exported from Excel, Google Sheets or a database, or paste the raw CSV text directly. Make sure the first row contains your column headers.",
    },
    {
      title: "Confirm the delimiter",
      body: "Most files use commas, but some use semicolons or tabs: common in European locales or TSV exports. Check the detected delimiter matches your data so columns split correctly.",
    },
    {
      title: "Check that the header row maps to keys",
      body: "The first row's values become the JSON property names. Verify the headers are clean (no stray spaces or duplicates) so you get sensible keys like \"email\" rather than \" Email \".",
    },
    {
      title: "Decide how to handle data types",
      body: "Choose whether numeric and boolean-looking values should be converted to real numbers and booleans, or kept as strings. Typed output is handier for code. String output preserves things like leading zeros in IDs and ZIP codes.",
    },
    {
      title: "Convert to JSON",
      body: "Run the conversion. Each row becomes an object keyed by your headers, and the whole file becomes a JSON array: formatted and ready to read.",
    },
    {
      title: "Copy or download the JSON",
      body: "Copy the result to your clipboard or download it as a .json file to use in your app, API request or data pipeline.",
    },
  ],
  tips: [
    "Keep leading zeros as strings: if you convert an ID or ZIP code like 00123 to a number it becomes 123 and you lose the zeros.",
    "Watch for fields that contain commas: they must be wrapped in double quotes in the CSV, otherwise the row splits into the wrong number of columns.",
    "Clean your headers before converting, trailing spaces or duplicate column names produce awkward or colliding JSON keys.",
    "If a value could be misread (a phone number, a version like 1.10), keep it as a string so the conversion doesn't reformat it.",
  ],
  faq: [
    {
      question: "How does CSV convert to JSON?",
      answer:
        "The header row becomes the object keys, and each subsequent row becomes one JSON object whose values are matched to those keys by column. All the objects are collected into a single JSON array.",
    },
    {
      question: "Will numbers stay as numbers or become strings?",
      answer:
        "That's your choice. Type conversion turns numeric and true/false values into real JSON numbers and booleans, which is convenient for code. Keeping everything as strings is safer for IDs, ZIP codes and anything with leading zeros.",
    },
    {
      question: "What if my CSV uses semicolons instead of commas?",
      answer:
        "That's common in spreadsheets from some locales. Set the delimiter to a semicolon (or tab, for TSV files) so the tool splits each row into the correct columns before building the JSON.",
    },
    {
      question: "Can it handle values that contain commas?",
      answer:
        "Yes, as long as those values are wrapped in double quotes in the CSV, which is the standard way to escape them. The parser treats a quoted field as a single value even if it contains commas or line breaks.",
    },
    {
      question: "Is my data uploaded to a server?",
      answer:
        "No. The conversion happens entirely in your browser, so your CSV never leaves your device. That makes it safe to convert files containing personal or sensitive data.",
    },
  ],
  relatedToolSlugs: [
    "json-to-csv",
    "json-formatter",
    "csv-to-excel",
    "json-validator",
  ],
  relatedHowToSlugs: [],
};

export default howto;
