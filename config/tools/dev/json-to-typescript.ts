import type { Tool } from "@/types";

/**
 * JSON → TypeScript: turn any JSON sample into clean, ready-to-paste
 * TypeScript interfaces or type aliases. All copy is unique to the
 * JSON-to-types workflow: superior union inference across array elements,
 * optional-from-null, readonly, export and naming controls, live in the
 * browser. Written to rank for the exact queries developers type when they
 * paste an API response and want types without writing them by hand.
 */
const jsonToTypescript: Tool = {
  slug: "json-to-typescript",
  title: "JSON to TypeScript",
  description:
    "Convert JSON to TypeScript interfaces or types instantly, with merged unions across array items, optional-from-null, readonly, export and naming controls, 100% in your browser.",
  category: "developer-tools",
  icon: "Braces",
  accent: "indigo",
  status: "live",
  createdAt: "2026-06-24",

  h1: "JSON to TypeScript, Generate Interfaces & Types Online",
  tagline:
    "Paste a JSON sample and get accurate TypeScript interfaces in real time. We merge types across every array element for inference no naive converter matches, and let you toggle interface vs type, readonly, export, optional-from-null and names, all client-side, nothing uploaded.",
  longDescription:
    "The GigAI JSON to TypeScript converter turns a sample of JSON (an API response, a config file, a fixture) into clean, idiomatic TypeScript you can paste straight into your codebase. It infers named interfaces for nested objects, arrays as element types, primitive unions for mixed values, and recognises when a field is sometimes null so it can mark it optional and union it with null. Its standout feature is deep union merging across array elements: instead of typing an array from its first item alone, it walks every element and merges their shapes, so a field that only appears on some records becomes optional and a value that is a string in one row and a number in another becomes `string | number`. That produces types that actually survive contact with real data. You control the output completely: emit `interface` or `type`, name the root, add a prefix or suffix to every generated name, make properties `readonly`, keep or drop the `export` keyword, and choose split interfaces or a single self-contained tree. Structurally identical objects are de-duplicated so repeated array items share one interface. Everything runs live as you type, entirely on your device using a dependency-free inference engine. No API response, token or schema is ever uploaded, stored or logged.",

  ctaText: "Convert to TypeScript",

  keywords: [
    "json to typescript",
    "json to interface",
    "json to type",
    "generate typescript from json",
    "json to ts",
    "typescript interface generator",
    "convert json to typescript",
    "json to typescript type",
    "quicktype alternative",
    "typescript from api response",
    "json schema to typescript",
    "infer typescript types",
  ],

  seo: {
    title:
      "JSON to TypeScript: Convert JSON to Interfaces & Types Online | GigAI Tools",
    description:
      "Free online JSON to TypeScript converter. Generate accurate interfaces or types with merged unions across array items, optional-from-null, readonly and export controls, 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "GitMerge",
      title: "Merged unions across arrays",
      description:
        "We infer array element types from every item, not just the first, fields present on some records become optional, and mixed values become precise unions like string | number instead of any.",
    },
    {
      icon: "Braces",
      title: "Interface or type, your call",
      description:
        "Emit named export interfaces for object shapes or switch the whole tree to type aliases in one click, matching your project's convention.",
    },
    {
      icon: "CircleSlash",
      title: "Optional from null",
      description:
        "When a value is null or missing in your sample, the property is marked optional with ?, so your types match how the API actually behaves.",
    },
    {
      icon: "Lock",
      title: "Readonly, export & naming",
      description:
        "Toggle readonly on every property, keep or drop the export keyword, rename the root, and add a prefix or suffix to every generated name.",
    },
    {
      icon: "Zap",
      title: "Live as you type",
      description:
        "Types regenerate on every keystroke with a smart debounce, so you refine your JSON and watch the interfaces update instantly. No convert button.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Inference runs on your device with a dependency-free engine. No JSON payload, token or schema is uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Types that match real data",
      description:
        "By merging every array element instead of guessing from the first, the generated interfaces model the nullable and optional fields your API actually returns, so the compiler catches bugs early.",
    },
    {
      title: "Skip the tedious typing",
      description:
        "Turn a pasted API response into ready interfaces in seconds instead of hand-writing nested shapes and second-guessing which fields are optional.",
    },
    {
      title: "Fits your codebase style",
      description:
        "Interface vs type, readonly, export on or off, and prefix/suffix naming mean the output drops in without reformatting to match your conventions.",
    },
    {
      title: "Private by design",
      description:
        "Because inference is local, you can safely convert responses containing internal shapes, tokens or PII, none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import JSON",
      description:
        "Paste a JSON sample into the left editor, drag a .json file onto it, or load a built-in example to try it instantly.",
    },
    {
      title: "Choose your output style",
      description:
        "Pick interface or type, name the root, and toggle readonly, export and optional-from-null to match your project.",
    },
    {
      title: "Refine and watch it update",
      description:
        "Edit the JSON and the TypeScript regenerates live. De-duplicated interfaces keep the output clean even with repeated array items.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the generated types, download them as a .ts file, or share a link that reopens the tool with your JSON pre-loaded.",
    },
  ],

  formats: {
    input: ["JSON", "TXT"],
    output: ["TS"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Type an API response",
      description:
        "Paste a payload from the network tab and get an interface for your fetch layer, with optional and union fields already inferred from the real shape.",
    },
    {
      audience: "Backend developer",
      title: "Share contracts across services",
      description:
        "Turn a sample event or DTO into a readonly interface you can drop into a shared types package, keeping producers and consumers in sync.",
    },
    {
      audience: "QA / Data engineer",
      title: "Model a data export",
      description:
        "Feed a multi-record JSON array in and let union merging surface the fields that are missing or differently typed across rows before they break a pipeline.",
    },
    {
      audience: "Student",
      title: "Learn TypeScript structural typing",
      description:
        "See how a JSON object maps to interfaces, how nesting becomes separate types, and how null turns into optional, with instant, editable feedback.",
    },
  ],

  troubleshooting: [
    {
      problem: "An array field came out as unknown[].",
      solution:
        "The array was empty in your sample, so there was nothing to infer from. Add at least one representative element and the element type will be generated. Include the fullest, most complete item so optional fields are captured.",
    },
    {
      problem: "A field I expected is missing from the interface.",
      solution:
        "It was absent from the object you pasted. Union merging only marks fields optional when they appear on some array elements and not others: a field that never appears anywhere can't be inferred. Paste a record that includes it.",
    },
    {
      problem: "The root came out as a type alias, not an interface.",
      solution:
        "When the top-level JSON is an array or a primitive rather than a plain object, a type alias is the correct representation. Wrap the value in an object, or switch the output mode to type if you prefer aliases throughout.",
    },
    {
      problem: "Numbers like 12345678901234567890 look wrong in a comment or sample.",
      solution:
        "JSON.parse coerces numbers to 64-bit floats, so integers above 2^53−1 lose precision when the sample is parsed. The generated type is still number. Keep such IDs as strings in your JSON to model them accurately.",
    },
  ],

  tips: [
    "Paste the fullest example array you have. Union merging across elements is what makes optional and mixed-type fields correct.",
    "Turn on readonly for API-response types so downstream code can't accidentally mutate fetched data.",
    "Add a prefix like I or a suffix like DTO to keep generated names from colliding with existing types.",
    "Press Ctrl/Cmd+Enter to re-run and Ctrl/Cmd+S to download the .ts file.",
    "Prefer type over interface when you want unions and aliases you can extend with intersections.",
  ],

  security:
    "Your JSON is parsed and converted entirely in your browser using a dependency-free inference engine. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely convert responses containing tokens, keys or personal data. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my JSON uploaded to a server?",
      answer:
        "No. All parsing and type inference happen locally in your browser. Your data never leaves your device, so there is nothing for us to store, log or see. It is safe to convert JSON containing secrets, internal shapes or personal information.",
    },
    {
      question: "How is this better than converting from the first array item?",
      answer:
        "Naive converters type an array from its first element and miss anything that varies. This tool walks every element and merges their shapes, so a field present on only some records becomes optional and a value that is a string in one item and a number in another becomes a string | number union. The result matches your real data instead of a lucky first row.",
    },
    {
      question: "Should I generate interfaces or types?",
      answer:
        "Both are valid. Interfaces are conventional for object shapes and can be merged and extended. Type aliases are better when you want unions, tuples or aliases you compose with intersections. Toggle the output mode to switch the entire tree between them in one click.",
    },
    {
      question: "How does it decide a property is optional?",
      answer:
        "Two ways. If a value is null (or absent) in your sample, the property is marked optional and, where relevant, unioned with null. And when you paste an array, a field that appears on some elements but not others is made optional automatically through union merging.",
    },
    {
      question: "Can I make the generated properties readonly?",
      answer:
        "Yes. Toggle Readonly and every property in every generated interface or type is prefixed with the readonly modifier: ideal for immutable API-response types where downstream code should never mutate the fetched object.",
    },
    {
      question: "How do nested objects and arrays get named?",
      answer:
        "Nested objects become their own named interface derived from the property key (PascalCased), and array element interfaces are singularised from the array's name. Structurally identical objects are de-duplicated so repeated array items share a single interface rather than generating near-duplicate types.",
    },
    {
      question: "What happens with an empty array or empty object?",
      answer:
        "An empty array becomes unknown[] because there is nothing to infer an element type from, and an empty object becomes Record<string, unknown>. Provide a populated sample to get concrete types.",
    },
    {
      question: "Does it handle big integers accurately?",
      answer:
        "The generated type for any JSON number is number. Note that JSON.parse itself coerces numbers to 64-bit floats, so integers above 2^53−1 lose precision when your sample is parsed. If you rely on such IDs, represent them as strings in the JSON.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: live JSON to TypeScript with interface/type output, root naming, readonly, export toggle, optional-from-null, prefix/suffix and de-duplicated nested interfaces.",
    },
    {
      date: "2026-06-28",
      change:
        "Added deep union merging across all array elements so optional and mixed-type fields are inferred from real data, plus curated examples and keyboard shortcuts.",
    },
    {
      date: "2026-07-01",
      change:
        "Refined naming (prefix/suffix, root rename) and added byte and interface-count stats with a shareable-link option.",
    },
  ],

  relatedTools: [
    "json-formatter",
    "jwt-decoder",
    "base64-encoder",
    "uuid-generator",
  ],
};

export default jsonToTypescript;
