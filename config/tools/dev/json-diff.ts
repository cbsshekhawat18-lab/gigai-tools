import type { Tool } from "@/types";

/**
 * JSON Diff, a *structural* JSON comparison tool. Unlike a plain text-diff, it
 * parses both sides and compares them by path, so reordered object keys, changed
 * indentation and whitespace never register as differences. It reports each leaf
 * as added / removed / changed / unchanged, counts them, and renders a unified,
 * color-coded view. All copy below is unique to JSON *comparison* (not
 * formatting) and written to rank for the queries developers actually search
 * when two JSON blobs "should be identical" but aren't.
 */
const jsonDiff: Tool = {
  slug: "json-diff",
  title: "JSON Diff",
  description:
    "Compare two JSON documents by structure, not text. Reordered keys and whitespace are ignored. You see added, removed and changed values by path with counts, all in your browser.",
  category: "developer-tools",
  icon: "GitCompareArrows",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "JSON Diff: Compare Two JSON Objects Online",
  tagline:
    "Paste two JSON documents and see a true semantic diff: added, removed and changed values by path, with reordered keys and whitespace ignored. Structure-aware, color-coded and 100% client-side.",
  longDescription:
    "The GigAI JSON Diff is a structural comparison tool for JSON that understands your data instead of just your bytes. Paste, drop or type an original document on the left and a new one on the right, and it parses both, walks them by path, and reports every leaf that was added, removed or changed, while values that merely moved to a different key order, or that differ only in indentation and whitespace, are correctly treated as equal. That is the core difference from a line-based text diff or a raw string compare: those flag a re-serialised or re-ordered payload as thousands of changes, while this tool shows you the handful that actually matter. You get a live summary with add / remove / change counts, a unified color-coded view keyed by dotted-and-bracketed paths (like `user.roles[2]` or `meta.tags.count`), and options to ignore object key order, ignore specific keys entirely (great for volatile fields like `updatedAt`, `id` or `_etag`), and treat whitespace-only string differences as equal. Everything runs locally with the browser's native JSON engine, so API responses, database rows, config snapshots and fixtures containing secrets or personal data are compared entirely on your machine and never uploaded, logged or seen by anyone.",

  ctaText: "Compare JSON",

  keywords: [
    "json diff",
    "json compare",
    "compare two json",
    "json difference checker",
    "semantic json diff",
    "json diff online",
    "compare json objects",
    "json diff ignore key order",
    "json structural diff",
    "diff json by path",
    "find json changes",
    "json compare tool",
  ],

  seo: {
    title: "JSON Diff, Compare Two JSON Documents Online | GigAI Tools",
    description:
      "Free structural JSON diff. Compare two JSON objects by path, reordered keys and whitespace ignored, added/removed/changed shown with counts. 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "GitCompareArrows",
      title: "Structural, not textual",
      description:
        "Both sides are parsed and compared by path, so a value that only moved to a different key position or was re-indented is reported as unchanged: only real differences surface.",
    },
    {
      icon: "ArrowUpDown",
      title: "Order-insensitive keys",
      description:
        "Object keys are matched by name, never by position. Two objects with the same fields in a different order compare as identical, exactly as JSON semantics say they should.",
    },
    {
      icon: "Filter",
      title: "Ignore keys you don't care about",
      description:
        "Exclude volatile fields like updatedAt, id, timestamp or _etag from the comparison so noisy, always-changing values never bury the differences that matter.",
    },
    {
      icon: "ListTree",
      title: "Path-keyed unified view",
      description:
        "Every difference is labelled with its exact dotted/bracketed path (user.roles[2], meta.count) so you can locate a change in a deeply nested document instantly.",
    },
    {
      icon: "Hash",
      title: "Live add / remove / change counts",
      description:
        "A summary strip updates as you type, tallying additions, removals and changes at a glance so you can confirm 'nothing changed' or quantify a drift in seconds.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Comparison uses the browser's native JSON engine on your device. No payload, config or database row is ever uploaded, stored or logged: close the tab and it's gone.",
    },
  ],

  benefits: [
    {
      title: "Stop drowning in false diffs",
      description:
        "A re-serialised or key-reordered API response looks like a total rewrite to a text diff. Structural comparison strips that noise and shows only the values that genuinely changed.",
    },
    {
      title: "Nail down flaky test snapshots",
      description:
        "When a snapshot test fails, ignore the volatile keys (ids, timestamps) and instantly see whether the payload actually regressed or just carried fresh throwaway fields.",
    },
    {
      title: "Audit config and infra drift",
      description:
        "Compare a known-good config against production to find exactly which settings drifted, by path, without eyeballing two walls of near-identical JSON.",
    },
    {
      title: "Private by design",
      description:
        "Because it runs locally, you can safely diff JSON containing tokens, PII or internal API shapes, none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Add both JSON documents",
      description:
        "Paste, drop a .json file or type into the left (original) and right (changed) editors. Or load the built-in sample pair to see a diff instantly.",
    },
    {
      title: "Tune the comparison",
      description:
        "Optionally ignore object key order (on by default), ignore whitespace-only string changes, and list any keys to exclude, like id or updatedAt.",
    },
    {
      title: "Read the diff by path",
      description:
        "Scan the summary counts, then the unified list: green for added, red for removed, amber for changed, each labelled with its exact path and old → new values.",
    },
    {
      title: "Copy or share",
      description:
        "Copy the diff report to paste into a PR or ticket, or share a link that reopens the tool with both documents and your options pre-loaded.",
    },
  ],

  formats: {
    input: ["JSON", "TXT"],
    output: ["Diff report (TXT)"],
  },

  useCases: [
    {
      audience: "Backend developer",
      title: "Diff two API responses",
      description:
        "Capture a response before and after a deploy, ignore volatile fields like requestId and timestamp, and see precisely which values the change actually altered.",
    },
    {
      audience: "QA / Test engineer",
      title: "Explain a snapshot failure",
      description:
        "When a JSON snapshot assertion fails on CI, drop both blobs in to find the real regression instead of scrolling a giant reordered text diff.",
    },
    {
      audience: "DevOps / SRE",
      title: "Catch config drift",
      description:
        "Compare a baseline Terraform, Kubernetes or app config export against the live one to pinpoint exactly which keys drifted in production.",
    },
    {
      audience: "Data engineer",
      title: "Validate a schema or export change",
      description:
        "Diff two exported records or schema documents to confirm a migration added only the intended fields and changed nothing it shouldn't have.",
    },
  ],

  troubleshooting: [
    {
      problem: "Two documents I think are identical show as different.",
      solution:
        "The difference is a real value change somewhere. Check the changed rows for the exact path and old → new values. If the only difference is trailing/leading whitespace inside strings, enable 'Ignore whitespace in strings'.",
    },
    {
      problem: "It reports huge numeric IDs as equal when they differ.",
      solution:
        "JSON.parse coerces numbers to 64-bit floats, so integers above 2^53−1 (Snowflake IDs, some ledger values) can collide after parsing. Store such IDs as strings in the source so they compare exactly as text.",
    },
    {
      problem: "Array items look 'changed' when they only moved.",
      solution:
        "Arrays are compared by index, because order is meaningful in JSON arrays. If your array is really an unordered set, sort both sides first (or model it as an object keyed by id) so positions line up.",
    },
    {
      problem: "One side won't parse.",
      solution:
        "The editor for the invalid side shows a precise error, usually a trailing comma, single quotes, or an unquoted key. Fix that side and the diff recomputes live. Both sides must be valid JSON to compare.",
    },
  ],

  tips: [
    "List volatile keys (id, updatedAt, timestamp, _etag) in 'Ignore keys' so a diff isn't buried under fields that always change.",
    "Keep 'Ignore key order' on when comparing API responses, most servers don't guarantee a stable key order.",
    "For unordered arrays, sort both sides before diffing so items match by content instead of position.",
    "Store big integer IDs as strings to avoid float precision collisions during comparison.",
    "Copy the diff report straight into a pull request or bug ticket to document exactly what changed.",
  ],

  security:
    "Both JSON documents are parsed and compared entirely in your browser using its native JSON engine. Nothing is uploaded to any server. No data is stored, logged or transmitted, so you can safely diff payloads containing tokens, keys or personal information. Close the tab and every trace is gone.",

  faq: [
    {
      question: "How is this different from a normal text diff?",
      answer:
        "A text diff compares characters line by line, so re-ordering object keys, changing indentation or re-serialising a payload shows up as a massive change even when the data is identical. JSON Diff parses both documents and compares them by path, so it reports only the values that genuinely differ (added, removed or changed) and ignores cosmetic differences entirely.",
    },
    {
      question: "Does it ignore the order of JSON keys?",
      answer:
        "Yes, by default. Object keys are matched by name, not position, because JSON object semantics treat key order as insignificant. Two objects with the same fields in a different order compare as equal. You can toggle this off if you specifically want to treat re-ordered keys as a difference.",
    },
    {
      question: "Can I exclude certain keys from the comparison?",
      answer:
        "Yes. Enter a comma-separated list of key names (like id, updatedAt or _etag) in the 'Ignore keys' field and any property with those names is skipped at every level of both documents. This is ideal for volatile fields that change on every request and would otherwise clutter the diff.",
    },
    {
      question: "How are arrays compared?",
      answer:
        "Arrays are compared by index, because order is meaningful in JSON arrays. Item 0 is compared to item 0, and so on. Extra trailing items count as added or removed. If your array is conceptually an unordered set, sort both sides first (or key the items by id) so equivalent elements line up.",
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. Both documents are parsed and compared locally in your browser with its built-in JSON engine. Your data never leaves your device, so there is nothing for us to store, log or see. It is safe to compare JSON containing secrets or personal information.",
    },
    {
      question: "What do the colors mean?",
      answer:
        "Green marks a path that exists only in the right (changed) document (an addition. Red marks a path present only in the left (original)) a removal. Amber marks a path present in both but with a different value, a change, shown as old → new. Unchanged paths are hidden by default so the differences stand out.",
    },
    {
      question: "Why do two large numbers compare as equal when they aren't?",
      answer:
        "JSON numbers are parsed as 64-bit floating point, so integers beyond 2^53−1 lose precision and can collide. This affects Snowflake IDs and similar large values. To compare them exactly, represent them as strings in the source JSON so they are compared as text rather than numbers.",
    },
    {
      question: "Can I share or save the diff?",
      answer:
        "Yes. You can copy a plain-text diff report to paste into a pull request, ticket or chat, or use the Share link button to generate a URL that reopens the tool with both documents and your comparison options pre-loaded. Nothing is stored server-side. The state travels inside the link itself.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: structural path-based diff with add/remove/change counts, order-insensitive keys, ignore-keys and ignore-whitespace options, unified color view, drag-drop import and shareable links.",
    },
    {
      date: "2026-06-28",
      change:
        "Added a copyable plain-text diff report, an unchanged-paths toggle, and keyboard shortcuts with an in-tool shortcuts helper.",
    },
  ],

  relatedTools: [
    "json-formatter",
    "json-to-typescript",
    "text-diff",
    "yaml-to-json",
  ],
};

export default jsonDiff;
