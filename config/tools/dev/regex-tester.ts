import type { Tool } from "@/types";

/**
 * Regex Tester, a live, visual regular-expression playground that highlights
 * every match in your test string as you type, breaks each match into its
 * numbered and named capture groups, previews a substitution, and ships with a
 * cheat-sheet and a library of ready-made patterns. All copy is unique to this
 * tool: the emphasis is on *seeing* what a pattern matches (highlighting +
 * group table + replace preview) rather than just returning true/false, and on
 * the fact that the whole thing runs on your machine with the browser's own
 * RegExp engine. The same one your JavaScript runs on in production.
 */
const regexTester: Tool = {
  slug: "regex-tester",
  title: "Regex Tester",
  description:
    "Build and debug regular expressions with live match highlighting. Toggle the g/i/m/s/u/y flags, watch every match light up in your test string, inspect numbered and named capture groups, preview a find-and-replace, and drop in ready-made patterns from a built-in library. 100% in-browser. Nothing is uploaded.",
  category: "developer-tools",
  icon: "Regex",
  accent: "indigo",
  status: "live",
  createdAt: "2026-06-24",

  h1: "Regex Tester & Debugger: Online",
  tagline:
    "Write a pattern and watch it match, live. Highlighted results in your test string, a full capture-group table with named groups and indices, a replace preview, a flag toolbar and a pattern library, all running on your browser's own RegExp engine.",
  longDescription:
    "A regular expression is only as trustworthy as the last string you tested it against, and mentally simulating a pattern character by character is where most regex bugs are born. This Regex Tester replaces that guesswork with a live picture: type a pattern and every match is highlighted directly inside your test text the instant you stop typing, so a greedy quantifier that swallows too much or an anchor that never fires is obvious at a glance rather than hidden behind a lonely 'no match'. Underneath the highlighting, a structured table breaks each match into its full value, its numbered capture groups, and any named groups (the `(?<year>\\d{4})` kind), together with the exact start index and length: the details you need when you're pulling fields out of a log line or a URL. A dedicated replace field previews the result of a substitution using `$1`, `$<name>` and `$&` backreferences so you can perfect a find-and-replace before you run it anywhere destructive. The flag toolbar exposes global, case-insensitive, multiline, dotAll, unicode and sticky as one-click toggles with plain-English tooltips, an inline cheat-sheet keeps the token syntax within reach, and a library of battle-tested patterns (email, URL, IPv4, UUID, hex color, slug and more) is one click from being inserted. Crucially, it uses the browser's native RegExp implementation, the very engine that runs your JavaScript, so what matches here is exactly what will match in your `String.matchAll` in production, and because it all happens in your tab, no pattern or test data is ever uploaded.",

  ctaText: "Test a regex",

  keywords: [
    "regex tester",
    "regular expression tester",
    "regex debugger",
    "online regex",
    "regex match highlighter",
    "regex replace preview",
    "javascript regex tester",
    "test regular expression online",
    "regex capture groups",
    "named capture groups regex",
    "regex cheat sheet",
    "regex101 alternative",
  ],

  seo: {
    title: "Regex Tester: Test & Debug Regular Expressions Online | GigAI Tools",
    description:
      "Free online regex tester with live match highlighting, capture-group and named-group breakdown, replace preview, flag toggles, a cheat-sheet and a pattern library. Runs on your browser's native RegExp engine: nothing uploaded.",
  },

  features: [
    {
      icon: "Highlighter",
      title: "Live match highlighting",
      description:
        "Every match is painted directly onto your test string as you type, overlapping colors for adjacent matches and a distinct tint for the active one, so you instantly see what a pattern grabs instead of guessing from a match count.",
    },
    {
      icon: "Table2",
      title: "Full capture-group table",
      description:
        "Each match expands into its numbered groups ($1, $2…) and any named groups like (?<name>…), with the exact start index and length, so pulling structured fields out of messy text becomes a copy-paste away.",
    },
    {
      icon: "Replace",
      title: "Live replace preview",
      description:
        "Type a replacement using $1, $<name> or $& backreferences and see the fully substituted output update in real time, perfect the find-and-replace here before you run it in an editor or a script.",
    },
    {
      icon: "ToggleLeft",
      title: "One-click flag toolbar",
      description:
        "Toggle g, i, m, s, u and y as buttons with plain-English tooltips (global, ignore-case, multiline, dotAll, unicode and sticky) and watch the results re-evaluate the moment you change one.",
    },
    {
      icon: "Library",
      title: "Ready-made pattern library",
      description:
        "Insert vetted patterns for email, URL, IPv4, UUID, hex color and URL slug with a single click, then tweak them against your own data, a fast, correct starting point instead of a Stack Overflow copy-paste.",
    },
    {
      icon: "BookOpen",
      title: "Built-in cheat-sheet",
      description:
        "A collapsible quick-reference lists anchors, character classes, quantifiers, groups and lookarounds with concrete examples, so you can learn or double-check syntax without leaving the tab.",
    },
  ],

  benefits: [
    {
      title: "See the match, not just a boolean",
      description:
        "Most regex debugging fails because you can't see where a pattern lands. Highlighting the matches inside the actual text turns an abstract expression into something you can literally read, so mistakes surface in seconds.",
    },
    {
      title: "Exactly the engine your code uses",
      description:
        "This tester runs the browser's native RegExp, the same implementation behind JavaScript's match, matchAll and replace. What matches here is what matches in your app, with no dialect surprises between the tool and production.",
    },
    {
      title: "From zero to a working pattern faster",
      description:
        "Start from a library pattern, adjust it while the highlighting and group table update live, and check the cheat-sheet inline. You spend your time refining a pattern instead of context-switching to docs.",
    },
    {
      title: "Private by construction",
      description:
        "Log lines, tokens and personal data often end up in the test string. Because everything runs in your browser tab, none of your patterns or sample text is ever transmitted, stored or logged.",
    },
  ],

  howTo: [
    {
      title: "Enter your pattern and flags",
      description:
        "Type a regular expression into the pattern field (no surrounding slashes needed) and click the flag buttons (g, i, m, s, u, y) to control how it matches. Or insert one from the pattern library to start.",
    },
    {
      title: "Paste your test string",
      description:
        "Drop the text you want to match into the test area: type it, paste it, or drag a.txt/.log file straight onto the pane. Matches highlight instantly as both fields change.",
    },
    {
      title: "Read the highlights and group table",
      description:
        "Scan the highlighted matches in your text, then open the match table to see every capture group, named group, index and length for each hit.",
    },
    {
      title: "Preview a replacement (optional)",
      description:
        "Type a replacement string with $1, $<name> or $& backreferences to see the substituted result update live, then copy the final output.",
    },
    {
      title: "Copy or share",
      description:
        "Copy the pattern, the replaced output, or share a link that reopens the exact pattern, flags and test string you're working on.",
    },
  ],

  formats: {
    input: ["Regular expression", "Test string", "Replacement string", ".txt", ".log"],
    output: ["Highlighted matches", "Capture-group table", "Replaced text", "Copied pattern"],
  },

  useCases: [
    {
      audience: "Backend & data engineers",
      title: "Extract fields from log lines",
      description:
        "Craft a pattern with named groups to pull timestamps, IPs and status codes out of raw logs, verify it against real samples with the highlighter, and lift the exact indices for downstream parsing.",
    },
    {
      audience: "Frontend developers",
      title: "Nail form-validation regexes",
      description:
        "Start from the email or URL library pattern, test it against tricky edge cases, and confirm it behaves identically to your JavaScript because it runs on the very same RegExp engine.",
    },
    {
      audience: "Writers & content teams",
      title: "Perfect a find-and-replace",
      description:
        "Preview a substitution with backreferences on a paragraph before committing it in an editor, so a bulk rewrite of dates, links or slugs does exactly what you intend the first time.",
    },
    {
      audience: "Students & the regex-curious",
      title: "Learn regex by watching it work",
      description:
        "Toggle a flag and watch the highlights shift, expand a group to see what it captured, and lean on the cheat-sheet: a hands-on way to build real intuition for how patterns behave.",
    },
  ],

  faq: [
    {
      question: "Which regex engine does this tester use?",
      answer:
        "It uses the browser's built-in RegExp object, the same ECMAScript engine that powers JavaScript's match, matchAll, test and replace. That's a deliberate choice: it means the results you see here match exactly what your JavaScript will do, with no translation layer or dialect drift. Note that some syntax from other flavours (PCRE, Python's re,.NET), such as possessive quantifiers or certain lookbehind features on older browsers, may not be available, because we run precisely what your browser supports and nothing more.",
    },
    {
      question: "Do I need to include the slashes and flags, like /foo/gi?",
      answer:
        "No. Type just the pattern itself, foo, into the pattern field, and set the flags using the g/i/m/s/u/y toggle buttons above the results. The tool assembles the RegExp for you. If you paste a full /foo/gi literal, remove the surrounding slashes and set the flags with the toggles instead.",
    },
    {
      question: "What do the g, i, m, s, u and y flags do?",
      answer:
        "g (global) finds all matches instead of stopping at the first. I (ignore case) makes matching case-insensitive. M (multiline) makes ^ and $ match at line breaks. S (dotAll) lets the dot match newline characters. U (unicode) enables full Unicode and \\p{…} property escapes, and y (sticky) anchors each match to the current position. The tester always evaluates globally internally so it can list every match, but the toggles still control i, m, s, u and the matching semantics.",
    },
    {
      question: "How do I use named capture groups?",
      answer:
        "Write a group as (?<name>…), for example (?<year>\\d{4})-(?<month>\\d{2}). Each named group appears in the match table under its name alongside the numbered groups, so you can see exactly what each one captured. In the replace field you can reference them with $<name>, e.g. $<month>/$<year>, and the preview updates live.",
    },
    {
      question: "How does the replace preview handle backreferences?",
      answer:
        "The replacement field follows the standard JavaScript String.replace rules: $1, $2 … insert numbered groups, $<name> inserts a named group, $& inserts the whole match, and $$ inserts a literal dollar sign. The preview applies your replacement across all matches (with the global flag) and shows the fully substituted text, so you can verify a find-and-replace before running it anywhere.",
    },
    {
      question: "Is my pattern or test data sent anywhere?",
      answer:
        "No. The entire tester runs as JavaScript inside your browser tab: the pattern, the test string and the replacement never leave your device, and there's no server call, logging or account. That's why it's safe to test regexes against real log lines, tokens or personal data here.",
    },
    {
      question: "Why does my pattern match nothing, or hang the page?",
      answer:
        "If nothing matches, check your flags first, case sensitivity (i) and multiline anchors (m) trip people up most, and confirm you didn't leave the slashes in. If the browser feels slow on a big test string, you may have hit catastrophic backtracking: nested quantifiers like (a+)+ can explode on certain inputs. Simplify the quantifiers or make them possessive-equivalent by anchoring, and test against a smaller sample first.",
    },
    {
      question: "Can I test against a large file?",
      answer:
        "Yes. You can paste a large body of text or drag a.txt/.log file onto the test pane. Matching is capped internally at a very high match count to stay responsive, and highlighting focuses on what's visible, so even sizeable inputs stay smooth. For extremely large files, test against a representative sample for the fastest feedback.",
    },
  ],

  tips: [
    "You don't type the slashes: enter foo, not /foo/g, and set g/i/m/s/u/y with the flag buttons.",
    "Use named groups (?<name>…) for readable extraction, then reference them in the replace field as $<name>.",
    "Add the u (unicode) flag to use \\p{…} property escapes like \\p{L} for any letter or \\p{Emoji} for emoji.",
    "If a quantifier grabs too much, make it lazy by adding ?,.*? instead of.*, and watch the highlight shrink.",
    "Share the link to hand a teammate the exact pattern, flags and test string. They all travel in the URL, never a server.",
  ],

  troubleshooting: [
    {
      problem: "'Invalid regular expression' appears as I type.",
      solution:
        "The pattern is only partially written: an unclosed group, class or quantifier. This is normal mid-edit. The error clears as soon as the expression is syntactically complete. If it persists, look for an unescaped special character (escape a literal dot as \\. and a literal slash as \\/), or an unbalanced ( or [.",
    },
    {
      problem: "The pattern matches in another tool but not here.",
      solution:
        "This tester runs the browser's ECMAScript RegExp, which differs from PCRE, Python or .NET flavours. Features like possessive quantifiers, recursion, or some lookbehind constructs may be unsupported. Rewrite using JavaScript-compatible syntax, and remember to enable the u flag for Unicode property escapes.",
    },
    {
      problem: "^ and $ only match the very start and end of my text.",
      solution:
        "By default ^ and $ anchor to the whole string, not each line. Turn on the m (multiline) flag so they match at every line break, which is what you usually want when scanning log lines or multi-line input.",
    },
    {
      problem: "The replace preview shows a literal $1 instead of the group.",
      solution:
        "Make sure your pattern actually contains a capturing group for that number. $1 needs a first ( … ) group. To output a literal dollar sign, write $$. For named references the syntax is $<name>, matching a (?<name>…) group in the pattern.",
    },
  ],

  security:
    "Your regular expression, test string and replacement are evaluated entirely inside your browser using the native RegExp engine: the same one that runs your JavaScript. Nothing is uploaded, stored or logged on our servers, so it's safe to test patterns against real log lines, tokens or personal data. Everything is discarded the moment you close the tab.",

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release: live match highlighting, g/i/m/s/u/y flag toolbar, capture-group table with named groups and indices, and a collapsible regex cheat-sheet.",
    },
    {
      date: "2026-06-27",
      change:
        "Added the live replace preview with $1/$<name>/$& backreferences and a one-click pattern library (email, URL, IPv4, UUID, hex color, slug).",
    },
    {
      date: "2026-06-30",
      change:
        "Added drag-and-drop/paste import for .txt/.log test data, shareable deep links carrying pattern, flags and text, plus keyboard shortcuts with an in-app reference.",
    },
  ],

  relatedTools: ["json-formatter", "url-encoder", "json-to-typescript", "base64-encoder"],
};

export default regexTester;
