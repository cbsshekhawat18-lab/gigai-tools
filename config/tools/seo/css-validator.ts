import type { Tool } from "@/types";

/**
 * CSS Validator, the paste-first structural linter for the "Validators" group.
 *
 * You paste a stylesheet and it checks the things that actually break CSS in the
 * wild: unbalanced braces, unclosed rule blocks, empty rules, unterminated
 * comments and strings, and stray characters: each pinpointed to a line (and
 * column where we can). It is deliberately honest about scope: it is a fast
 * structural linter, not a full W3C property-and-value validator, and it runs
 * entirely in the browser with no network. Every line of copy below is unique to
 * CSS structure linting so the page ranks on its own terms rather than competing
 * with the HTML validator, sitemap validator or robots checker.
 */
const cssValidator: Tool = {
  slug: "css-validator",
  title: "CSS Validator",
  description:
    "Paste your CSS and instantly catch unbalanced braces, unclosed and empty rules, and unterminated comments or strings, each pinpointed to a line, 100% in your browser.",
  category: "seo-tools",
  group: "Validators",
  icon: "Paintbrush",
  accent: "violet",
  status: "live",
  createdAt: "2026-06-20",

  h1: "CSS Validator: Find Unbalanced Braces & Broken Rules",
  tagline:
    "Paste a stylesheet and get a line-numbered report of the structural mistakes that silently break CSS (mismatched braces, unclosed blocks, empty rules and unterminated comments) checked locally, with nothing uploaded.",
  longDescription:
    "The GigAI CSS Validator is a fast, structural linter for stylesheets: paste your CSS and it walks the source character by character to surface the mistakes that a browser silently swallows but that quietly break the rest of your styles. It counts braces to find unbalanced `{` and `}`, reports the exact block left unclosed, flags empty rule bodies that do nothing, and catches an unterminated `/* … */` comment or an open string literal that would otherwise eat everything after it. Each finding is tied to a line number, and a column where the analysis can pin one, so you jump straight to the fix instead of bisecting a minified blob by hand. It is deliberately honest about what it is: a structural and balance checker, not a full W3C validator that knows every property, unit and vendor prefix. That focus is the point: the overwhelming majority of “my CSS just stopped working” bugs are a single missing brace or a comment that never closed, and this catches those in the moment. Because it runs entirely in your browser with no network requests, you can safely lint unreleased design-system tokens, a client's proprietary theme or a half-built component sheet: nothing you paste is uploaded, logged or seen by anyone, and closing the tab erases it completely.",

  ctaText: "Validate CSS",

  keywords: [
    "css validator",
    "css linter",
    "validate css online",
    "check css syntax",
    "css brace checker",
    "unclosed css block",
    "css error checker",
    "online css validator",
    "css syntax checker",
    "missing brace css",
    "css structure checker",
    "free css validator",
  ],

  seo: {
    title: "CSS Validator. Check Braces & Syntax Online | GigAI Tools",
    description:
      "Free CSS validator and linter: paste your stylesheet to catch unbalanced braces, unclosed and empty rules, and unterminated comments or strings: each pinned to a line. Runs in your browser. Nothing is uploaded.",
  },

  features: [
    {
      icon: "Braces",
      title: "Brace-balance checking",
      description:
        "Walks the whole stylesheet counting { and }, so a single missing or extra brace (the number-one cause of a broken cascade) is caught and reported instead of silently swallowed.",
    },
    {
      icon: "ListEnd",
      title: "Unclosed & empty block detection",
      description:
        "Tells you exactly how many rule blocks were left open at the end of the file, and flags empty {} rules that add bytes and confusion without doing anything.",
    },
    {
      icon: "MessageSquareOff",
      title: "Comment & string awareness",
      description:
        "Understands /* comments */ and quoted strings, so braces inside them don't cause false alarms, and an unterminated comment or open string literal is caught precisely.",
    },
    {
      icon: "MapPin",
      title: "Line-numbered findings",
      description:
        "Every issue carries the line it occurs on (and a column where we can pin one), so you jump straight to the fault in even a large or minified stylesheet.",
    },
    {
      icon: "ShieldCheck",
      title: "Private, in-browser linting",
      description:
        "The parser is native JavaScript running on your device. No upload, no account, no logging. Lint proprietary themes and unreleased tokens with confidence.",
    },
    {
      icon: "Zap",
      title: "Instant, sample-ready",
      description:
        "Paste, drop a .css file, or load the built-in broken sample to see the linter in action. Results update as you type, with copy and download for the report.",
    },
  ],

  benefits: [
    {
      title: "Find the one broken brace fast",
      description:
        "When a stylesheet mysteriously stops applying below a certain point, it's almost always a missing } far above. This pinpoints it in seconds instead of a manual bisect.",
    },
    {
      title: "Clean up before you ship",
      description:
        "Empty rules and stray closing braces slip in during refactors. Catching them keeps your CSS lean and prevents a later editor from being confused by dead blocks.",
    },
    {
      title: "Honest about its scope",
      description:
        "It won't pretend to be a full property validator. Knowing it checks structure (not every value) means you trust its passes and never chase a phantom “error”.",
    },
    {
      title: "Safe for confidential styles",
      description:
        "Everything runs locally, so client theme files, design-system internals and unreleased component sheets never leave your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste or drop your CSS",
      description:
        "Copy a stylesheet, a single rule block, or a whole compiled bundle into the box, or drag a.css file onto it. You can also load the built-in broken sample to try it.",
    },
    {
      title: "Read the line-numbered findings",
      description:
        "The report groups results by kind (structure, blocks, comments and strings) with each error or warning tied to the line (and column where available) it occurs on.",
    },
    {
      title: "Fix from the top down",
      description:
        "Start with the first structural error: an early unclosed brace or comment cascades into everything below it, so fixing it often clears several downstream findings at once.",
    },
    {
      title: "Re-check until it's clean",
      description:
        "Paste the corrected CSS back in and confirm the report shows no errors. Copy or download the findings if you want to share them with a teammate.",
    },
  ],

  formats: {
    input: ["CSS", "Text", ".css file"],
    output: ["Validation report"],
  },

  useCases: [
    {
      audience: "Frontend developer",
      title: "Track down a broken cascade",
      description:
        "Paste a stylesheet whose lower rules stopped applying and let the brace counter point to the unclosed block above that's swallowing everything after it.",
    },
    {
      audience: "Design-system maintainer",
      title: "Sanity-check token and theme files",
      description:
        "Lint generated or hand-edited token sheets before publishing to catch an accidental empty rule or a stray brace introduced during a refactor.",
    },
    {
      audience: "Student / learner",
      title: "Understand a CSS syntax error",
      description:
        "See in plain language why a stylesheet is malformed (an unterminated comment, a missing brace) with the exact line, instead of a browser silently ignoring the rest.",
    },
    {
      audience: "Agency / freelancer",
      title: "Vet a client's stylesheet",
      description:
        "Quickly structurally validate a stylesheet you inherited, entirely offline, before you build on top of it or hand it back with a report.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says my CSS is valid but the browser ignores a rule.",
      solution:
        "This linter checks structure (balanced braces, closed blocks and comments) not whether every property name, value or unit is real. A rule with a typo'd property (e.g. color instead of color) is structurally fine but the browser drops it. Double-check the property spelling and value syntax against MDN.",
    },
    {
      problem: "I get an “unclosed block” error but my braces look balanced.",
      solution:
        "A brace hidden inside an unterminated /* comment */ or an open string can throw the count off. Fix the earliest comment/string error the report lists first, it's often the real cause, and the brace count usually resolves once that's closed.",
    },
    {
      problem: "It flags a brace inside content: \"{\" as unbalanced.",
      solution:
        "The linter tracks strings, so a brace inside matched quotes is ignored. If it still miscounts, check that the string is actually closed. A missing end quote makes everything after it look like string content and desyncs the parser.",
    },
    {
      problem: "Does it validate SCSS, Less or nested CSS?",
      solution:
        "It treats input as plain CSS. Modern native nesting and simple SCSS usually pass the brace/structure checks, but preprocessor-only syntax (variables, mixins, @-rules with unusual bodies) isn't understood: compile to CSS first for a meaningful check.",
    },
  ],

  tips: [
    "Fix the topmost error first: an early unclosed brace or comment cascades into a pile of misleading downstream findings.",
    "If the whole file reads as one giant block, look for a comment you opened with /* but never closed with */.",
    "Run it on your compiled/bundled CSS, not just source, to catch structural issues a build step may have introduced.",
    "Empty {} rules are harmless but noisy, delete them so future editors aren't left wondering what belonged there.",
    "For preprocessor code (SCSS/Less), compile to plain CSS first. This checks the CSS structure, not the preprocessor syntax.",
  ],

  security:
    "Your CSS is validated entirely in your browser with a native JavaScript parser. Nothing is uploaded, stored or logged. Proprietary themes, unreleased design tokens and client stylesheets stay on your device, and closing the tab erases every trace.",

  faq: [
    {
      question: "What does this CSS validator actually check?",
      answer:
        "It's a structural linter. It verifies that braces are balanced, that every rule block is closed, and that comments and string literals are terminated, and it flags empty {} rules and stray closing braces. Each finding is tied to a line number. It does not check every individual property name, value or unit, because those rarely break a whole stylesheet the way a missing brace does.",
    },
    {
      question: "Is this a full W3C CSS validator?",
      answer:
        "No, and it doesn't pretend to be. The W3C validator checks conformance of every property and value against the spec. This tool focuses on the structural mistakes that actually break stylesheets in practice (mismatched braces, unclosed blocks, unterminated comments and strings) and reports them instantly and privately in your browser. Use it for fast structural sanity checks. Use the W3C service when you need full spec conformance.",
    },
    {
      question: "Why did my stylesheet stop working below a certain point?",
      answer:
        "Almost always a missing closing brace. When a rule block is never closed, the browser keeps treating everything after it as part of that block (or discards it), so styles below silently stop applying. Paste the file here and the brace-balance check will point you to the unclosed block so you can add the } and restore the rest.",
    },
    {
      question: "Does it handle CSS comments and strings correctly?",
      answer:
        "Yes. The parser is aware of /* … */ comments and single- or double-quoted strings, so braces or semicolons inside them don't trigger false errors. It also specifically catches an unterminated comment or an unclosed string, which are common causes of a stylesheet appearing to “eat” everything after a point.",
    },
    {
      question: "Can I validate SCSS, Less or Tailwind output?",
      answer:
        "It reads input as plain CSS. Compiled Tailwind and other plain-CSS output validate perfectly. Native CSS nesting and simple SCSS often pass the structural checks too, but preprocessor-specific syntax (variables, mixins, unusual @-rules) isn't understood. For a meaningful check, compile your SCSS/Less to CSS first and paste that.",
    },
    {
      question: "Is my CSS uploaded anywhere?",
      answer:
        "No. All parsing happens locally in your browser using native JavaScript. There is no server call, no storage and no logging. It's safe to lint confidential client stylesheets, unreleased design-system tokens or internal theme files. Close the tab and everything you pasted is gone.",
    },
    {
      question: "What's the difference between an error and a warning here?",
      answer:
        "Errors are structural faults that break parsing: an unbalanced brace, an unclosed block, an unterminated comment or string. Warnings are things that are technically valid but worth cleaning up, such as an empty {} rule or a brace that opens with no selector before it. Fix errors first. Treat warnings as polish.",
    },
    {
      question: "Is there a limit on how much CSS I can paste?",
      answer:
        "You can paste large stylesheets. The linter is a single fast pass over the text, so even a big compiled bundle validates in an instant. There's a generous input ceiling to keep the browser responsive. For anything approaching that size, validate one stylesheet at a time.",
    },
  ],

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release, brace-balance checking, unclosed/empty block detection, comment and string awareness, and line-numbered findings, all in the browser.",
    },
    {
      date: "2026-06-26",
      change:
        "Added a grouped report (structure, blocks, comments & strings), an at-a-glance stats strip, a built-in broken sample and .css drag-and-drop.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined string/comment tracking to eliminate false brace-count errors and clarified the honest-scope note distinguishing structural linting from full W3C validation.",
    },
  ],

  relatedTools: [
    "html-validator",
    "sitemap-validator",
    "robots-txt-validator",
    "json-formatter",
  ],
};

export default cssValidator;
