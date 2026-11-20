import type { Tool } from "@/types";

/**
 * JSON Tree Viewer: an interactive, collapsible tree explorer for JSON.
 * The copy here is deliberately distinct from the JSON Formatter's: this tool is
 * about *navigating and understanding* a large, unfamiliar payload, expanding
 * only what you need, searching keys and values, and grabbing a JSONPath or a
 * node's value in one click, rather than re-formatting text. Nothing below is
 * shared with sibling dev-tool SEO copy.
 */
const jsonTreeViewer: Tool = {
  slug: "json-tree-viewer",
  title: "JSON Tree Viewer",
  description:
    "Explore JSON as an interactive, collapsible tree. Expand or collapse any branch, see type and array-length badges, search keys and values with live highlighting, and copy any node's value or its JSONPath in one click, all 100% in your browser.",
  category: "developer-tools",
  icon: "ListTree",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "JSON Tree Viewer, Explore & Navigate JSON Online",
  tagline:
    "Paste or drop a JSON file and browse it as a collapsible tree. Instant key/value search with next-prev jumping, type and length badges on every node, and one-click copy of any value or its JSONPath. Nothing is uploaded.",
  longDescription:
    "A raw JSON response can be thousands of lines of nested objects and arrays, perfectly valid, and almost impossible to read as flat text. The JSON Tree Viewer turns that wall of braces into a navigable outline: each object and array becomes a collapsible node you can open only where you need it, so a 5,000-line API payload starts as a single tidy summary and expands on demand. Every node is annotated with its value type and, for arrays and objects, how many items it holds, so you can gauge the shape of unfamiliar data before drilling in. A live search box matches both keys and values as you type, highlights every hit, and lets you jump between matches with the keyboard: invaluable when you're hunting for one field buried deep in a huge document. Click any leaf to copy its exact value, or copy the fully-qualified JSONPath (like $.data.items[3].id) to paste straight into code, a jq filter, or a bug report. Large documents stay smooth because collapsed branches don't render their children until you open them. Everything runs locally in your browser, the JSON you paste never touches a server, so it's safe for real, sensitive payloads.",

  ctaText: "View JSON Tree",

  keywords: [
    "json tree viewer",
    "json viewer online",
    "json tree explorer",
    "collapsible json viewer",
    "view json online",
    "json path finder",
    "jsonpath extractor",
    "browse json data",
    "json navigator",
    "expand collapse json",
    "search json keys values",
    "json inspector",
  ],

  seo: {
    title: "JSON Tree Viewer, Explore, Search & Copy JSONPath Online | GigAI Tools",
    description:
      "Free online JSON tree viewer. Paste or drop JSON to browse it as a collapsible tree, search keys and values, see type and length badges, and copy any value or its JSONPath, all in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "ListTree",
      title: "Collapsible, drill-down tree",
      description:
        "Objects and arrays render as expandable branches so a huge payload starts collapsed and clean. Open only the nodes you care about, or expand and collapse the whole tree with a single button.",
    },
    {
      icon: "Search",
      title: "Instant key + value search",
      description:
        "Type in the search box and every matching key and value lights up as you go. Jump between hits with next/previous, and the tree auto-expands to reveal each match wherever it's buried.",
    },
    {
      icon: "Tags",
      title: "Type & length badges",
      description:
        "Each node is labelled with its type (string, number, boolean, null, object or array) and objects and arrays show their child count, so you can read the shape of the data at a glance.",
    },
    {
      icon: "Route",
      title: "One-click JSONPath copy",
      description:
        "Click any node to copy its exact value, or copy its canonical JSONPath (e.g. $.items[2].name) ready to drop into code, a jq query, or a ticket. No more hand-counting nested brackets.",
    },
    {
      icon: "Gauge",
      title: "Handles large documents",
      description:
        "Collapsed branches skip rendering their children until you open them, so multi-megabyte JSON stays responsive instead of freezing the tab like a naive pretty-printer would.",
    },
    {
      icon: "Lock",
      title: "Entirely in your browser",
      description:
        "Parsing, searching and path extraction all happen client-side. Your JSON is never uploaded, stored or logged, safe to explore production data, tokens, and other sensitive payloads.",
    },
  ],

  benefits: [
    {
      title: "Understand unfamiliar APIs fast",
      description:
        "See the structure of a response you've never seen before in seconds (which fields exist, how deep it nests, and how many items each array holds) without scrolling a flat text dump.",
    },
    {
      title: "Grab the exact path you need",
      description:
        "Stop mis-counting brackets. Copy a precise JSONPath for any value and paste it straight into your accessor code, a jq filter, or a test assertion, exactly as it appears in the tree.",
    },
    {
      title: "Find one field in a haystack",
      description:
        "When a document has hundreds of keys, live search with next/previous jumping takes you to the value you want immediately instead of Ctrl-F-ing through pretty-printed text.",
    },
    {
      title: "Safe for real payloads",
      description:
        "Because nothing leaves your browser, you can inspect live production responses, config blobs, and other sensitive JSON that you'd never paste into a tool that phones home.",
    },
  ],

  howTo: [
    {
      title: "Add your JSON",
      description:
        "Paste JSON into the input, drag a .json file onto the pane, or load the built-in sample. It's parsed and rendered as a tree the moment it's valid.",
    },
    {
      title: "Expand and explore",
      description:
        "Click a node's caret to open just that branch, or use Expand all / Collapse all to reveal or fold the entire document. Type and length badges show what each node holds.",
    },
    {
      title: "Search for what matters",
      description:
        "Type a key or value into the search box. Every match is highlighted and the tree opens to show it. Press Enter or use the arrows to jump to the next and previous hits.",
    },
    {
      title: "Copy a value or its path",
      description:
        "Click any node to copy its value, or use the path button to copy the node's JSONPath. Both land on your clipboard ready to paste into code or a message.",
    },
    {
      title: "Share your view",
      description:
        "Use the share button to generate a link that reopens the exact JSON you're inspecting: the data travels in the URL fragment and still never touches a server.",
    },
  ],

  formats: {
    input: ["JSON", ".json", ".txt", "Pasted text"],
    output: ["Copied value", "JSONPath", "Formatted JSON"],
  },

  useCases: [
    {
      audience: "API & backend developers",
      title: "Inspect API responses",
      description:
        "Drop a raw endpoint response in and read its shape as a tree, confirm a nested field exists, check an array's length, and copy the JSONPath to wire it into your parsing code.",
    },
    {
      audience: "Frontend & mobile engineers",
      title: "Trace data into the UI",
      description:
        "Follow exactly where a value lives in a deeply nested payload before you write the selector, and copy the path so your component reads the right key the first time.",
    },
    {
      audience: "QA & data testers",
      title: "Verify payload structure",
      description:
        "Search for a field to confirm it's present and correctly typed, spot an unexpected null, and capture the precise JSONPath for a reproducible assertion or bug report.",
    },
    {
      audience: "DevOps & config wranglers",
      title: "Read big config blobs",
      description:
        "Open a sprawling config or Terraform state export as a collapsible outline, collapse the noise, and drill straight into the one section you need without losing your place.",
    },
  ],

  faq: [
    {
      question: "What does a JSON tree viewer do?",
      answer:
        "It parses your JSON and displays it as an interactive, collapsible tree instead of flat text. Each object and array is a node you can expand or collapse, every value shows its type, and arrays and objects show how many items they contain, making a large, deeply nested document far easier to read and navigate than a plain pretty-printed dump.",
    },
    {
      question: "How is this different from a JSON formatter?",
      answer:
        "A formatter re-indents your JSON as text so it's tidy to scroll. A tree viewer is about navigation: you fold away everything you don't care about, expand only the branch you need, search across keys and values, and copy a node's JSONPath. Use the formatter to clean up text you'll paste elsewhere. Use the tree viewer to understand and explore a large or unfamiliar payload.",
    },
    {
      question: "Can it search inside the JSON?",
      answer:
        "Yes. The search box matches both keys and values as you type, highlights every occurrence, and automatically expands the tree so hidden matches become visible. You can move between matches with next/previous, which is far faster than browser find on collapsed or pretty-printed text.",
    },
    {
      question: "What is a JSONPath and how do I copy one?",
      answer:
        "A JSONPath is a string that addresses one location in a JSON document, like $.data.items[0].id. Click a node's path button and the tool copies its canonical JSONPath to your clipboard, so you can paste it directly into accessor code, a jq expression, or a bug report without hand-counting nested keys and array indexes.",
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. Parsing, searching, and path extraction all run entirely in your browser with JavaScript. Your JSON is never transmitted, stored, or logged by us. That local-only design is exactly why it's safe to explore real production data, config files, and other sensitive payloads here.",
    },
    {
      question: "Can it handle very large JSON files?",
      answer:
        "Yes, within your browser's memory. Collapsed branches don't render their children until you open them, so opening a multi-megabyte document doesn't try to draw every node at once. Extremely large files can still be heavy: collapse sections you're done with, and use search to jump straight to what you need.",
    },
    {
      question: "Why won't my JSON load?",
      answer:
        "The input has to be valid JSON. Common causes are trailing commas, single quotes instead of double quotes, unquoted keys, or a stray comment. None of which are legal JSON. The tool shows the parse error with its line and column so you can fix it. Paste the value through a formatter first if you're unsure.",
    },
    {
      question: "Can I copy just one value out of the tree?",
      answer:
        "Yes. Click any leaf node to copy its exact value to the clipboard, a string, number, boolean, or the JSON text of a whole sub-object or array. You can copy a nested branch as its own valid JSON snippet without manually selecting the matching braces.",
    },
  ],

  tips: [
    "Collapse all first, then expand only the branch you're investigating, it's the fastest way to get your bearings in an unfamiliar payload.",
    "Search matches values too, not just keys, so you can find every place a specific id or status string appears across the whole document.",
    "Copy a node's JSONPath and paste it straight into a jq filter or your language's accessor to read the same value programmatically.",
    "Use the share link to hand a teammate the exact JSON you're looking at. It rides in the URL fragment, so the data still never hits a server.",
    "If a file is huge, keep sections collapsed and rely on search rather than expanding everything at once, which keeps the tree snappy.",
  ],

  troubleshooting: [
    {
      problem: "The tree won't render and shows a parse error.",
      solution:
        "Your input isn't valid JSON. Check for trailing commas, single quotes, unquoted keys, or comments: all illegal in strict JSON. The error banner points to the line and column. Fix that spot, or run the text through a JSON formatter first.",
    },
    {
      problem: "Search finds nothing even though the word is visible.",
      solution:
        "Search is case-insensitive but literal. Make sure you're not including surrounding quotes or brackets from the pretty-printed view. Try a shorter, distinctive fragment of the key or value you're looking for.",
    },
    {
      problem: "A very large file feels sluggish.",
      solution:
        "Collapse branches you're finished with and avoid Expand all on multi-megabyte documents. Because children render lazily, keeping most of the tree collapsed and using search to jump around stays fast.",
    },
    {
      problem: "The copied JSONPath doesn't work in my library.",
      solution:
        "JSONPath dialects vary slightly. This tool emits the common dot/bracket form ($.a.b[0]). Some libraries expect bracket-only ($['a']['b'][0]) or a different root token. Adjust the root or bracket style to match your query engine.",
    },
  ],

  security:
    "Your JSON is parsed, searched, and explored entirely inside your browser tab using JavaScript. Nothing is uploaded, stored, or logged on our servers. That local-only design is exactly why it's safe to inspect real production responses, configuration files, tokens, and other sensitive payloads here. When you share a view, the JSON travels in the URL fragment, which browsers never send to a server. Still, treat any link you create as containing the data itself and share it only with people you trust.",

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: collapsible JSON tree with per-node expand/collapse, expand-all and collapse-all, type and array/object length badges, and one-click copy of any node's value.",
    },
    {
      date: "2026-06-28",
      change:
        "Added live key-and-value search with match highlighting, next/previous jumping, and auto-expansion of the tree to reveal hidden matches.",
    },
    {
      date: "2026-07-01",
      change:
        "Added one-click JSONPath copy for any node, shareable deep links that carry the JSON in the URL fragment, drag-and-drop file import, and keyboard shortcuts with an in-app reference.",
    },
  ],

  relatedTools: ["json-formatter", "jwt-decoder", "base64-encoder", "uuid-generator"],
};

export default jsonTreeViewer;
