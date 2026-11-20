import type { Tool } from "@/types";

/**
 * Cron Expression Generator, a visual crontab builder that turns per-field
 * controls (every / every-N / range / list, plus one-click presets) into a
 * standard 5-field cron expression, explains it in plain English via cronstrue,
 * and previews the next run times via cron-parser. It also parses a pasted
 * expression back into the builder. All copy is unique to cron scheduling and
 * written to rank for the exact queries developers type when a job won't fire.
 */
const cronGenerator: Tool = {
  slug: "cron-generator",
  title: "Cron Expression Generator",
  description:
    "Build and decode cron expressions visually. Pick presets or per-field rules, read a plain-English description, and preview the next 5 run times. Paste an expression to reverse it back. Runs entirely in your browser.",
  category: "developer-tools",
  icon: "Clock",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "Cron Expression Generator: Build & Explain Crontab Schedules",
  tagline:
    "Click together a schedule with plain-language controls and get a valid cron expression, an English description of exactly when it fires, and a preview of its next five run times, or paste an expression to reverse it back into the builder. 100% client-side.",
  longDescription:
    "The GigAI Cron Expression Generator is a two-way crontab editor that runs entirely in your browser. Start from a preset like every minute, hourly, nightly or the first of the month, or drive each of the five fields (minute, hour, day-of-month, month and day-of-week) with human controls for every value, every N units, a range or a specific list. As you build, the tool composes the 5-field expression, describes it in clear English (\"At 02:30 AM, only on Monday\") and shows the next five times it will actually run, so you can confirm the schedule before it ever hits a server. It works the other way too: paste an existing line from a crontab, Kubernetes CronJob, GitHub Actions workflow or a cloud scheduler and it parses it straight back into the builder with a live description and run preview, which makes decoding an inherited `*/15 3 * * 1-5` a five-second job instead of a guessing game. Unlike a static cheat-sheet, every change is validated live and mistakes surface with a precise error, so you never ship a schedule that quietly never fires. Because everything is computed locally with cronstrue and cron-parser, no expression, secret or job definition is uploaded, logged or seen by anyone, close the tab and it's gone.",

  ctaText: "Build a cron expression",

  keywords: [
    "cron expression generator",
    "crontab generator",
    "cron expression builder",
    "cron to english",
    "explain cron expression",
    "cron schedule builder",
    "cron next run time",
    "cron parser online",
    "crontab guru alternative",
    "cron every 15 minutes",
    "cron day of week",
    "cronjob schedule generator",
  ],

  seo: {
    title: "Cron Expression Generator & Explainer, Build Crontab Online | GigAI Tools",
    description:
      "Free visual cron expression generator. Build a crontab schedule from presets or per-field rules, read it in plain English, preview the next run times, and reverse-parse any expression, 100% in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "MousePointerClick",
      title: "Visual field builder",
      description:
        "Drive each of the five cron fields with plain controls (every value, every N units, a from-to range or a specific list) instead of memorising asterisks, slashes and commas.",
    },
    {
      icon: "Sparkles",
      title: "One-click presets",
      description:
        "Start from common schedules (every minute, every 5/15/30 minutes, hourly, daily, weekly, monthly and more) then fine-tune any field from there.",
    },
    {
      icon: "Languages",
      title: "Plain-English description",
      description:
        "Every expression is translated into a clear sentence like \"At 09:00 AM, Monday through Friday\", so you can confirm the intent at a glance before deploying it.",
    },
    {
      icon: "CalendarClock",
      title: "Next 5 run times",
      description:
        "See the exact next five moments the job will fire, computed with a real cron parser, so you catch a schedule that never triggers before it ever reaches production.",
    },
    {
      icon: "ArrowLeftRight",
      title: "Reverse-parse any expression",
      description:
        "Paste a line from a crontab, Kubernetes CronJob or CI workflow and it loads straight back into the builder with a live description and run preview.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Expressions are built, described and previewed locally with cronstrue and cron-parser. No schedule or job definition is ever uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Never ship a schedule that doesn't fire",
      description:
        "The live English description and next-run preview let you verify a job's timing before it goes near a server, catching the classic \"it silently never ran\" bug up front.",
    },
    {
      title: "Decode inherited cron in seconds",
      description:
        "Paste a cryptic expression a teammate left behind and read exactly what it means and when it runs next, without cross-referencing a cheat-sheet field by field.",
    },
    {
      title: "Learn cron by doing",
      description:
        "Watching the expression, sentence and run times update as you toggle controls builds real intuition for how the five fields interact: including the day-of-month vs day-of-week gotcha.",
    },
    {
      title: "Private by design",
      description:
        "Because everything is computed locally, you can safely work on schedules that reference internal jobs, hosts or environments, none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Pick a preset or open a field",
      description:
        "Click a preset like Every 15 minutes or Nightly to start, or expand a field (minute, hour, day, month, weekday) to set your own rule.",
    },
    {
      title: "Choose a rule per field",
      description:
        "For each field pick Every, Every N, Range or List and enter the values, the expression, description and run times update instantly.",
    },
    {
      title: "Read the description & preview",
      description:
        "Confirm the plain-English sentence matches your intent and scan the next five run times to be sure the job fires when you expect.",
    },
    {
      title: "Copy, or paste to reverse it",
      description:
        "Copy the finished expression into your crontab or CronJob, or paste an existing expression to load it back into the builder.",
    },
  ],

  formats: {
    input: ["Cron expression", "TXT"],
    output: ["Cron expression"],
  },

  useCases: [
    {
      audience: "DevOps engineer",
      title: "Author a Kubernetes CronJob schedule",
      description:
        "Build the exact `spec.schedule` for a CronJob visually, confirm it runs on weekdays only, and copy it in. No more redeploying to discover the timezone or weekday was off.",
    },
    {
      audience: "Backend developer",
      title: "Decode an inherited crontab line",
      description:
        "Paste a mystery entry like `*/10 9-17 * * 1-5` from a legacy server and instantly see it means every 10 minutes during business hours on weekdays, plus the next times it will fire.",
    },
    {
      audience: "Data engineer",
      title: "Schedule a nightly pipeline",
      description:
        "Set a job for 02:30 every night, verify against the run preview that it lands after the upstream export, and hand a validated expression to your orchestrator.",
    },
    {
      audience: "CI / release engineer",
      title: "Time a scheduled GitHub Actions workflow",
      description:
        "Craft the `on.schedule` cron for a nightly build or weekly cleanup and confirm the next runs before committing the workflow file.",
    },
  ],

  troubleshooting: [
    {
      problem: "My job runs on the wrong days when I set both day-of-month and weekday.",
      solution:
        "In standard cron, when both the day-of-month (field 3) and day-of-week (field 5) are restricted, they are OR-ed. The job runs if either matches, not both. Leave one as `*` unless you truly want the union.",
    },
    {
      problem: "The next run times look hours off.",
      solution:
        "Cron itself has no timezone. The preview here evaluates in UTC. If your server or scheduler uses local time, mentally offset the shown times, or set the timezone at the scheduler (many CronJob and cloud schedulers accept a timezone field).",
    },
    {
      problem: "My expression is rejected as invalid.",
      solution:
        "Check field count (standard cron is five fields separated by single spaces), that ranges read low-high (e.g. 1-5 not 5-1), and that steps use `*/N` or `start/N`. The error banner names the field that failed.",
    },
    {
      problem: "I used @daily / @hourly and it won't parse.",
      solution:
        "Named macros like @daily are shell-crontab extensions, not part of the 5-field syntax this builder targets. Use the equivalent explicit expression instead: for example `0 0 * * *` for daily at midnight.",
    },
  ],

  tips: [
    "Use `*/N` (e.g. `*/15`) for even intervals, but remember `*/40` in minutes fires at:00 and:40 then resets each hour. It is not a true 40-minute cadence.",
    "Set either day-of-month or day-of-week and leave the other as `*` to avoid the OR-match surprise when both are restricted.",
    "Scan the next-five-runs preview before copying, it's the fastest way to catch a schedule that would never actually fire.",
    "Paste an existing expression to reverse-engineer it into the builder, then tweak one field instead of rewriting the whole line.",
    "Cron has no timezone of its own, decide up front whether your scheduler interprets the expression as UTC or local time.",
  ],

  security:
    "Your cron expressions are built, described and previewed entirely in your browser using cronstrue and cron-parser: nothing is uploaded to any server. No schedule, job name or expression is stored, logged or transmitted, so you can safely work on internal jobs. Close the tab and every trace is gone.",

  faq: [
    {
      question: "What is a cron expression?",
      answer:
        "A cron expression is a compact string of five space-separated fields (minute, hour, day-of-month, month and day-of-week) that tells a scheduler when to run a job. For example, `0 9 * * 1-5` means 09:00 every weekday. This tool builds that string visually and explains what it means.",
    },
    {
      question: "How do I write 'every 15 minutes' in cron?",
      answer:
        "Use `*/15 * * * *`, the `*/15` in the minute field fires at minutes 0, 15, 30 and 45 of every hour. In this generator you can pick the Every 15 minutes preset, or choose Every N with N=15 in the minute field, and confirm it in the run-time preview.",
    },
    {
      question: "What does `*` mean in a cron expression?",
      answer:
        "An asterisk means \"every valid value\" for that field. `* * * * *` runs every minute; `0 * * * *` runs at the top of every hour. Restricting a field with a number, range or step narrows when the job fires.",
    },
    {
      question: "Why do day-of-month and day-of-week behave strangely together?",
      answer:
        "It's the most famous cron gotcha: when both field 3 (day-of-month) and field 5 (day-of-week) are set to something other than `*`, standard cron runs the job when either condition matches, not both. To target, say, the 1st of the month AND Mondays as an intersection, you generally can't in pure cron. Keep one field as `*`.",
    },
    {
      question: "Does cron support a timezone?",
      answer:
        "The classic 5-field syntax has no timezone: it's interpreted in whatever timezone the scheduler runs in. The next-run preview here uses UTC. Many modern schedulers (Kubernetes CronJobs, cloud schedulers) add a separate timezone setting. Set it there rather than in the expression.",
    },
    {
      question: "Can I paste an existing cron expression to understand it?",
      answer:
        "Yes. Paste any standard 5-field expression and the tool reverse-parses it into the visual builder, shows a plain-English description, and previews the next five run times, an instant way to decode a schedule someone else wrote.",
    },
    {
      question: "Is my cron expression sent to a server?",
      answer:
        "No. All building, describing and run-time calculation happen locally in your browser with cronstrue and cron-parser. Nothing you type is uploaded, stored or logged, so it's safe to work on schedules referencing internal jobs or hosts.",
    },
    {
      question: "What's the difference between `*/5` and `0/5`?",
      answer:
        "In the minute field both effectively fire every five minutes starting at 0, so `*/5` and `0/5` are equivalent. A non-zero start like `3/5` begins at minute 3 and then every five minutes (3, 8, 13, …). The builder's Every N control writes the standard `*/N` form.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, visual five-field builder (every / every-N / range / list), one-click presets, live plain-English description via cronstrue and next-5-runs preview via cron-parser, all client-side.",
    },
    {
      date: "2026-06-28",
      change:
        "Added reverse-parsing: paste any standard cron expression to load it back into the builder, plus copy and shareable-link support.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined error messages per field, added a day-of-month vs day-of-week warning, and improved the run-time preview formatting.",
    },
  ],

  relatedTools: [
    "unix-timestamp-converter",
    "json-formatter",
    "yaml-formatter",
    "jwt-decoder",
  ],
};

export default cronGenerator;
