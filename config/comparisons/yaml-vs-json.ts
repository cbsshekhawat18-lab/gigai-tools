import type { Comparison } from "@/types";

const comparison: Comparison = {
  slug: "yaml-vs-json",
  a: "YAML",
  b: "JSON",
  title: "YAML vs JSON: Which Is Better for Config and Data?",
  description:
    "YAML is human-friendly with comments and clean indentation, ideal for config. JSON is strict, ubiquitous and data-exchange-ready. Here's when each wins, and the gotchas.",
  accent: "emerald",
  icon: "FileCog",
  seo: {
    title: "YAML vs JSON: Config vs Data Exchange Compared (2026)",
    description:
      "YAML vs JSON explained: comments, readability, indentation vs braces, the YAML gotchas, when JSON is safer, and formatters for both formats.",
    keywords: [
      "yaml vs json",
      "json vs yaml",
      "difference between yaml and json",
      "yaml or json for config",
      "is yaml better than json",
      "yaml gotchas",
    ],
    canonical: "/compare/yaml-vs-json",
  },
  intro: [
    "YAML and JSON are close cousins, in fact every JSON document is valid YAML, but they're tuned for different jobs. JSON is a strict, minimal data-interchange format: braces, brackets, quotes and commas, no comments, no ambiguity. That rigidity makes it perfect for machines exchanging data and awkward for humans hand-editing large config files. YAML was designed to fix the human side: it replaces JSON's punctuation with indentation, allows comments, and reads more like a clean outline than code.",
    "For configuration: the files people open and edit by hand, like CI pipelines, Kubernetes manifests and app settings: YAML's readability and comments are a genuine advantage, which is why so much of the DevOps world runs on it. But that friendliness comes with sharp edges. YAML's reliance on indentation makes whitespace mistakes easy and hard to spot, and its 'helpful' type inference has famous gotchas (the 'Norway problem', where the country code `NO` is read as the boolean `false`, and versions like `1.10` silently becoming `1.1`).",
    "JSON, by contrast, is boring in the best way: strict, unambiguous, everywhere, and the default for APIs and program-to-program data exchange. Below is a clear breakdown, the situations where each is the right tool, and an honest verdict, with formatters for both.",
  ],
  dimensions: [
    {
      label: "Primary use",
      a: "Human-edited configuration files.",
      b: "Machine data exchange (APIs, program-to-program).",
    },
    {
      label: "Comments",
      a: "Supported, annotate config with # comments.",
      b: "Not supported. No comments allowed at all.",
    },
    {
      label: "Readability",
      a: "Clean, indentation-based, outline-like. Easy for humans.",
      b: "Punctuation-heavy braces and brackets. Dense for humans.",
    },
    {
      label: "Syntax strictness",
      a: "Lenient but whitespace-sensitive. Easy to mis-indent.",
      b: "Strict and unambiguous. Errors are obvious.",
    },
    {
      label: "Type gotchas",
      a: "Aggressive inference causes surprises (NO→false, 1.10→1.1).",
      b: "No surprises. Types are explicit and literal.",
    },
    {
      label: "Ubiquity / tooling",
      a: "Common in DevOps/config. Parser support more varied.",
      b: "Universal, every language parses it natively and fast.",
    },
    {
      label: "Relationship",
      a: "A superset: valid JSON is also valid YAML.",
      b: "A strict subset of what YAML allows.",
    },
  ],
  whenA: [
    "The file is edited by humans: CI pipelines, Kubernetes, app or tool config.",
    "You want inline comments to explain settings to your team.",
    "Readability and clean structure matter more than machine-exchange strictness.",
    "The config is long and nested, where YAML's indentation stays legible.",
  ],
  whenB: [
    "Data is exchanged between programs or over an API.",
    "You need strict, unambiguous parsing with no type-inference surprises.",
    "Maximum tooling support and parsing speed across every language matter.",
    "The data is generated and consumed by machines, not hand-edited.",
  ],
  verdict:
    "Use YAML for configuration that humans read and edit. Its comments and clean indentation are worth a lot, which is why DevOps tooling standardised on it, but stay alert to its whitespace and type-inference gotchas by quoting ambiguous values and validating before you ship. Use JSON for data exchanged between programs and over APIs, where its strictness, universal support and lack of surprises are exactly what you want. When you need both, remember every JSON file is already valid YAML, so converting from JSON to YAML is trivial.",
  relatedToolSlugs: ["yaml-formatter", "json-formatter", "json-validator", "json-to-csv"],
  faq: [
    {
      question: "Is YAML better than JSON?",
      answer:
        "For human-edited configuration, YAML is usually nicer. It supports comments and reads more cleanly thanks to indentation. For machine data exchange, JSON is better because it's strict, unambiguous and parsed natively everywhere. The right answer depends on whether a person or a program is the main reader.",
    },
    {
      question: "Why can't JSON have comments?",
      answer:
        "JSON was deliberately kept minimal as a pure data-interchange format, and the spec omits comments so that files can't carry directives or notes that different parsers might treat inconsistently. If you need annotated config, that's a strong reason to prefer YAML, which supports comments natively.",
    },
    {
      question: "What are the YAML gotchas I should watch for?",
      answer:
        "The big ones stem from YAML's type inference. Unquoted values like the country code NO can be read as the boolean false (the 'Norway problem'), version strings like 1.10 can collapse to 1.1, and leading zeros or dates can be misread. The fix is simple: quote any value whose type you care about, and validate the parsed result.",
    },
    {
      question: "Is every JSON file valid YAML?",
      answer:
        "Yes. YAML is a superset of JSON, so any valid JSON document is also valid YAML and most YAML parsers will read it directly. The reverse isn't true (YAML's comments, indentation style and extra features aren't valid JSON) so converting YAML to JSON can drop comments and require reformatting.",
    },
    {
      question: "Which should I use for a Kubernetes or CI config file?",
      answer:
        "YAML: it's the de facto standard for Kubernetes manifests, CI pipelines and most modern DevOps config precisely because it's human-readable and supports comments. Just be disciplined about indentation and quote ambiguous values, since a stray space or an unquoted NO can change the meaning of the file.",
    },
  ],
  relatedComparisonSlugs: ["json-vs-xml", "csv-vs-json"],
};

export default comparison;
