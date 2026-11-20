import type { Tool } from "@/types";

/**
 * Secret / API-key Scanner: pastes code, config or logs and flags exposed
 * credentials (AWS, Stripe, GitHub, OpenAI, database URLs, private keys…) with a
 * severity, line number and fix hint, plus a redacted copy to share. Pure
 * client-side regex. Nothing is uploaded. Honest scope: it's a heuristic that
 * can miss custom/obfuscated secrets or flag a lookalike; the UI says so.
 */
const secretScanner: Tool = {
  slug: "secret-scanner",
  title: "Secret Scanner",
  description:
    "Paste code, a.env file or logs and instantly flag exposed API keys, tokens, passwords and private keys, with a redacted copy to share. Private, in your browser.",
  category: "developer-tools",
  icon: "ShieldAlert",
  accent: "rose",
  status: "live",
  featured: false,
  createdAt: "2026-07-09",

  h1: "Secret & API-Key Scanner",
  tagline:
    "Catch a leaked AWS key, Stripe secret, GitHub token or database password before you commit or share it, scanned live in your browser, never uploaded.",
  longDescription:
    "Accidentally committing a secret is one of the most common, and most expensive, security mistakes. The GigAI Secret Scanner reads code, config files,.env files or log snippets you paste and flags anything that looks like a credential: AWS access keys, Stripe and OpenAI keys, GitHub and Slack tokens, Google API keys, private-key blocks, JWTs, database connection strings with passwords, and hard-coded password assignments. Each finding shows a severity, the line number, a masked preview and a short fix hint, and the tool produces a fully redacted copy you can safely paste into a bug report or share with a teammate. Everything runs locally in your browser, the exact place sensitive code should stay, so nothing is ever uploaded. It's a pattern-based heuristic, not a security audit, so it can miss cleverly hidden secrets. Always review the findings yourself.",

  ctaText: "Scan for secrets",

  keywords: [
    "secret scanner",
    "api key scanner",
    "find exposed api keys",
    "detect secrets in code",
    "check for leaked keys",
    "env file secret checker",
    "redact secrets",
    "scan code for passwords",
    "aws key detector",
    "hardcoded secret finder",
  ],

  seo: {
    title: "Secret & API-Key Scanner, Find Exposed Keys Free | GigAI Tools",
    description:
      "Paste code or a .env file and instantly detect exposed API keys, tokens, passwords and private keys. Get a redacted copy to share. Private, in-browser, no upload.",
  },

  features: [
    {
      icon: "ScanSearch",
      title: "Detects the keys that matter",
      description:
        "AWS, Stripe, OpenAI, Anthropic, GitHub, Slack, Google, Twilio, SendGrid and npm tokens, private-key blocks, JWTs and database URLs with passwords.",
    },
    {
      icon: "ListChecks",
      title: "Severity, line & fix hint",
      description:
        "Every finding is ranked high / medium / low, pinned to a line number, shown masked, and paired with a short remediation tip.",
    },
    {
      icon: "EyeOff",
      title: "One-click redacted copy",
      description:
        "Get a version with every detected secret replaced by [REDACTED], safe to drop into a bug report, gist or chat.",
    },
    {
      icon: "Lock",
      title: "Never leaves your browser",
      description:
        "The one tool where privacy is non-negotiable. Your code is scanned locally with the HTML/JS engine: nothing is uploaded or logged.",
    },
  ],

  benefits: [
    {
      title: "Catch leaks before they ship",
      description:
        "Run it over a diff, a config or a log paste before you commit, push or file a ticket, the cheapest possible place to catch an exposed key.",
    },
    {
      title: "Safe to share the result",
      description:
        "The redacted copy lets you hand a snippet to a colleague or paste a stack trace publicly without leaking the credentials inside it.",
    },
    {
      title: "No install, no account",
      description:
        "Unlike CLI scanners you have to set up, this is instant in any browser. Paste and read. Nothing to configure.",
    },
  ],

  howTo: [
    {
      title: "Paste your code or config",
      description:
        "Drop in a .env file, source code, a log snippet or any text. Scanning is instant and happens in your browser.",
    },
    {
      title: "Review the findings",
      description:
        "Each potential secret shows its type, severity, line number and a masked preview. Work through the high-severity ones first.",
    },
    {
      title: "Fix and rotate",
      description:
        "Move secrets to environment variables or a secrets manager, and rotate anything that was exposed: the fix hint tells you where.",
    },
    {
      title: "Share the redacted copy",
      description:
        "Need to share the snippet? Copy the redacted version, which replaces every detected secret with a placeholder.",
    },
  ],

  faq: [
    {
      question: "Is my code uploaded when I scan it?",
      answer:
        "No. The scanner runs entirely in your browser using JavaScript regex, your code, config and secrets never leave your device and nothing is stored or logged. That is all there is to it: sensitive code should stay local.",
    },
    {
      question: "Which secrets does it detect?",
      answer:
        "Common provider formats, AWS access keys, Stripe, OpenAI and Anthropic keys, GitHub and Slack tokens, Google API keys, Twilio, SendGrid, Mailgun and npm tokens, plus private-key blocks, JWTs, database connection strings with passwords, and hard-coded password/secret assignments.",
    },
    {
      question: "Can it miss a secret or flag something that isn't one?",
      answer:
        "Yes. It's a pattern-based heuristic, so it can miss custom, encoded or obfuscated secrets and occasionally flag a value that merely looks like a key. Treat it as a fast first pass, not a full security audit, and review findings yourself.",
    },
    {
      question: "What should I do if it finds a real secret?",
      answer:
        "Assume it's compromised: rotate or revoke it with the provider, remove it from your code and history, and load it from an environment variable or secrets manager instead. Each finding includes a short hint on where to rotate it.",
    },
    {
      question: "What is the redacted copy for?",
      answer:
        "It's your input with every detected secret replaced by [REDACTED], so you can safely paste the snippet into a bug report, a public gist or a chat without leaking the credentials.",
    },
  ],

  relatedTools: ["hash-generator", "password-generator", "jwt-decoder", "base64-decoder"],
};

export default secretScanner;
