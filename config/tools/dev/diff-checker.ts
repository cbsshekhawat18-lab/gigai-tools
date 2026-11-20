import type { Tool } from "@/types";

/**
 * Diff Checker: a desktop-grade text comparison tool. Paste an original and a
 * changed version and it produces a colored diff with line, word or character
 * granularity, unified or split (side-by-side) layouts, and ignore-whitespace /
 * ignore-case toggles. Added/removed counts, one-click copy, share links,
 * undo/redo and keyboard shortcuts round it out. All copy below is unique to
 * text diffing, written to rank for the queries people type when they need to
 * compare two blocks of text, code, JSON or prose fast, and privately.
 */
const diffChecker: Tool = {
  slug: "diff-checker",
  title: "Diff Checker",
  description:
    "Compare two texts side by side and highlight every added, removed and changed line, word or character, with unified or split view, ignore-whitespace and ignore-case, all in your browser.",
  category: "developer-tools",
  icon: "GitCompare",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-22",

  h1: "Diff Checker, Compare Text & Code Online",
  tagline:
    "Paste an original and a changed version and see exactly what moved: line, word or character diffs, unified or side-by-side, with ignore-whitespace and ignore-case. Instant, and nothing ever leaves your browser.",
  longDescription:
    "The GigAI Diff Checker is a desktop-grade text comparison tool that runs entirely in your browser. Drop two versions of anything: source code, JSON, a config file, a contract clause, a migration script or a paragraph of prose, and it highlights every insertion and deletion in color, the moment you stop typing. Switch granularity between line, word and character to zoom from 'which lines moved' down to 'which exact letters changed', and flip between a compact unified view and a true side-by-side split when you want the before and after aligned column-for-column. Noise-cancelling toggles let you ignore leading and trailing whitespace or ignore case, so a re-indent or a capitalisation change never masquerades as a real edit. A live counter tells you how many units were added and removed, you can copy the rendered diff or share a link that reopens both inputs, and full undo/redo plus real keyboard shortcuts keep you moving. Because the comparison happens locally with a battle-tested diff algorithm, your text (proprietary code, credentials, personal data, unreleased copy) is never uploaded, logged or seen by anyone. Close the tab and it's gone.",

  ctaText: "Compare Text",

  keywords: [
    "diff checker",
    "text diff",
    "compare text online",
    "code diff tool",
    "diff tool",
    "compare two texts",
    "online text comparison",
    "find difference between texts",
    "side by side diff",
    "word diff",
    "character diff",
    "text compare",
  ],

  seo: {
    title: "Diff Checker, Compare Text & Code Online (Side by Side) | GigAI Tools",
    description:
      "Free online diff checker. Compare two texts and highlight added, removed and changed lines, words or characters. Unified or side-by-side view, ignore whitespace & case: 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "Rows3",
      title: "Line, word or character diff",
      description:
        "Switch granularity on the fly: line mode for 'which rows changed', word mode for edits inside a sentence, and character mode to pinpoint a single flipped letter or digit.",
    },
    {
      icon: "Columns2",
      title: "Unified or split view",
      description:
        "Read a compact inline diff, or flip to a true side-by-side split that aligns the original and changed versions column-for-column so before and after line up.",
    },
    {
      icon: "Eraser",
      title: "Ignore whitespace & case",
      description:
        "Suppress noise from re-indentation, trailing spaces or capitalisation so a formatting pass never shows up as a real change, see only the edits that matter.",
    },
    {
      icon: "Sigma",
      title: "Live added / removed counts",
      description:
        "A running tally shows exactly how many lines, words or characters were inserted and deleted, updating the instant you stop typing. No Compare button to press.",
    },
    {
      icon: "Zap",
      title: "Instant, even on big pastes",
      description:
        "A debounced, cancellable engine keeps the tab responsive on large inputs, recomputing only the latest change so long documents diff smoothly.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Both versions are compared on your device with a proven diff algorithm. No source code, config or personal text is ever uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Spot the real change in seconds",
      description:
        "Color-coded insertions and deletions turn 'these two files look different somewhere' into an exact, at-a-glance answer, without eyeballing line by line.",
    },
    {
      title: "Cut review noise",
      description:
        "Ignore-whitespace and ignore-case strip out reformatting and casing churn, so a code review or contract redline focuses only on substantive edits.",
    },
    {
      title: "Zoom to the exact edit",
      description:
        "Drop from line to word to character granularity to find the single toggled boolean, changed digit or swapped word behind a failing test or a broken config.",
    },
    {
      title: "Private by design",
      description:
        "Because everything runs locally, you can safely compare text containing secrets, PII, unreleased copy or proprietary code: none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste both versions",
      description:
        "Put the original on the left and the changed version on the right, type, paste, drop a file onto either pane, or load the built-in sample to try it instantly.",
    },
    {
      title: "Choose granularity & view",
      description:
        "Pick line, word or character diff, then switch between unified (inline) and split (side-by-side) view depending on how much detail you want.",
    },
    {
      title: "Filter the noise",
      description:
        "Toggle Ignore whitespace and Ignore case to hide formatting-only or capitalisation-only differences and reveal just the meaningful edits.",
    },
    {
      title: "Read, copy or share",
      description:
        "Check the added/removed counts, copy the rendered diff, or share a link that reopens the tool with both inputs preloaded for a colleague.",
    },
  ],

  formats: {
    input: ["TXT", "Code", "JSON", "YAML", "CSV"],
    output: ["Diff", "TXT"],
  },

  useCases: [
    {
      audience: "Developer",
      title: "Review a code change without Git",
      description:
        "Paste an old and new function or config side by side to see exactly which lines and tokens changed, ignoring whitespace so a reformat doesn't drown out the real edit.",
    },
    {
      audience: "QA / SRE",
      title: "Compare config across environments",
      description:
        "Diff a staging config against production to catch the one flipped flag, changed host or missing key that explains why a deploy behaves differently.",
    },
    {
      audience: "Writer / Editor",
      title: "Redline a document revision",
      description:
        "Drop two drafts in and use word-level diff to see every added, removed or reworded phrase between versions of copy, a contract or documentation.",
    },
    {
      audience: "Data engineer",
      title: "Verify an export or transform",
      description:
        "Compare a data dump before and after a migration or cleanup to confirm only the intended rows and fields changed, down to the character.",
    },
  ],

  troubleshooting: [
    {
      problem: "Whitespace-only changes are cluttering the diff.",
      solution:
        "Turn on Ignore whitespace to collapse leading/trailing-space and indentation differences. If a reformat still shows up, switch to line mode first, then narrow to word mode once the big structural moves are clear.",
    },
    {
      problem: "The whole text shows as one giant change.",
      solution:
        "That usually means the two sides share almost no lines in common. Check you didn't paste the same version twice, or that line endings match. Try word or character mode to align the shared content more finely.",
    },
    {
      problem: "Character mode is slow on a very large paste.",
      solution:
        "Character-level diffing is the most expensive granularity. For big documents, start in line mode to locate the changed region, then copy just that region into a fresh compare for character detail.",
    },
    {
      problem: "A capitalisation change is flagged as an edit.",
      solution:
        "Enable Ignore case so 'Error' and 'error' are treated as identical. Combine it with Ignore whitespace to strip both casing and formatting noise in one pass.",
    },
  ],

  tips: [
    "Start in line mode to find which rows moved, then switch to word or character mode to see the exact edit inside them.",
    "Turn on Ignore whitespace before reviewing code that was reformatted, so re-indentation doesn't hide the real change.",
    "Use split view for aligned before/after reading, and unified view when you want a compact, copy-friendly inline diff.",
    "Press Ctrl/Cmd+Enter to force a recompute and Ctrl/Cmd+Backspace to clear both panes and start fresh.",
    "Share a link to send a colleague the exact two versions you're looking at, both inputs travel in the URL, nothing is uploaded.",
  ],

  security:
    "Both versions you paste are compared entirely in your browser with a client-side diff algorithm. They are never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely diff text containing secrets, credentials, personal data or unreleased code. Share links encode the inputs in the URL itself. If the content is sensitive, copy the diff instead. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my text uploaded to a server?",
      answer:
        "No. Both versions are compared locally in your browser using a client-side diff algorithm. Your text never leaves your device, so there is nothing for us to store, log or see. It is safe to compare code, config or documents containing secrets or personal information.",
    },
    {
      question: "What's the difference between line, word and character diff?",
      answer:
        "Line diff compares whole lines and is best for code and structured files. Word diff highlights individual words that changed within a line, which is ideal for prose and edits. Character diff pinpoints the exact letters or digits that differ (useful for a single flipped value) but is the most computationally expensive on large inputs.",
    },
    {
      question: "What does 'unified' versus 'split' view mean?",
      answer:
        "Unified (inline) view shows one combined stream with additions and deletions marked in place, compact and easy to copy. Split (side-by-side) view puts the original and the changed version in two aligned columns so you can read before and after column-for-column. You can switch between them at any time.",
    },
    {
      question: "How do I ignore formatting or indentation changes?",
      answer:
        "Turn on Ignore whitespace. It normalises leading and trailing spaces and indentation so a reformat or re-indent doesn't register as a change, letting you focus on substantive edits. Pair it with Ignore case to also treat differences in capitalisation as identical.",
    },
    {
      question: "Can it compare code, JSON or CSV, not just plain text?",
      answer:
        "Yes. The diff engine works on any text, so source code, JSON, YAML, CSV, logs and configuration all compare cleanly. Use line mode for structured files and ignore-whitespace to skip reformatting noise. For JSON specifically you can format both sides first to make the diff even cleaner.",
    },
    {
      question: "Is there a limit on how large the texts can be?",
      answer:
        "There is a generous guard so the tab stays responsive, and the engine debounces and cancels stale work so it keeps up as you type. Line mode handles large documents comfortably. Character mode is the most expensive, so for very big inputs locate the changed region in line mode first.",
    },
    {
      question: "Does it show how many changes there are?",
      answer:
        "Yes. A live counter reports how many units were added and removed, measured in whatever granularity you've selected (lines, words or characters) so you get both a visual highlight and an exact tally that updates as you edit.",
    },
    {
      question: "How does the share link work. Is it safe?",
      answer:
        "The share link encodes both inputs inside the URL itself, so opening it reconstructs the comparison locally with no server round-trip. Because the content lives in the link, avoid sharing links for sensitive text. Copy the rendered diff instead when privacy matters.",
    },
  ],

  changelog: [
    {
      date: "2026-06-22",
      change:
        "Initial release: live line/word/character diff, unified and split views, ignore-whitespace and ignore-case, added/removed counts, drag-drop import, undo/redo and shareable links.",
    },
    {
      date: "2026-06-28",
      change:
        "Added keyboard shortcuts with an in-tool helper, a swap-sides action, and a curated sample so the empty state is one click from a real comparison.",
    },
    {
      date: "2026-07-01",
      change:
        "Improved large-input performance with a cancellable debounced engine and refined split-view alignment for long, wrapped lines.",
    },
  ],

  relatedTools: ["json-diff", "json-formatter", "sql-formatter", "yaml-formatter"],
};

export default diffChecker;
