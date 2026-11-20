---
title: "Cron Expression Syntax Explained (With Real Examples)"
description: "Understand cron expressions field by field (asterisks, ranges, steps, and the day-of-week gotcha) with copy-ready examples and a free visual cron generator."
date: "2026-07-07"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["cron", "scheduling", "linux", "devops", "automation"]
featured: false
---

Cron expressions look like someone leaned on the keyboard: `0 */6 * * 1-5`. But there's a tidy logic underneath, and once it clicks you'll be able to read and write schedules at a glance. This guide breaks the syntax down field by field, walks through the special characters, warns you about the one gotcha that trips up nearly everyone, and gives you a shelf of copy-ready examples. To build and preview expressions without guessing, keep our [cron generator](/cron-generator) open in another tab. It translates any expression into plain English as you type.

## The five fields

A standard cron expression has **five fields**, separated by spaces, each controlling one unit of time:

```
┌───────────── minute        (0–59)
│ ┌─────────── hour          (0–23)
│ │ ┌───────── day of month  (1–31)
│ │ │ ┌─────── month         (1–12)
│ │ │ │ ┌───── day of week   (0–6, Sunday = 0)
│ │ │ │ │
* * * * *
```

Read left to right: minute, hour, day-of-month, month, day-of-week. A job runs when **all** the fields match the current time. So `30 9 * * *` means "at minute 30 of hour 9, on every day, in every month, on every weekday". That is, 9:30 AM every day.

The whole trick is knowing what goes in each field, and that comes down to five special characters.

## The special characters

### Asterisk `*`, every value
An asterisk means "every value for this field." `* * * * *` runs every single minute. `0 * * * *` runs at minute 0 of every hour, i.e. once an hour, on the hour.

### Comma `,`, a list
Use commas to pick specific values. `0 8,12,18 * * *` runs at 8 AM, noon, and 6 PM. The field matches if the current time equals *any* item in the list.

### Hyphen `-`, a range
A hyphen defines an inclusive range. `0 9-17 * * *` runs at the top of every hour from 9 AM through 5 PM. `* * * * 1-5` restricts a job to Monday through Friday.

### Slash `/`: a step
A slash sets an interval. `*/15 * * * *` runs every 15 minutes (at:00,:15,:30,:45). You can combine it with a range: `0 9-17/2 * * *` runs every 2 hours between 9 AM and 5 PM. Read `*/15` as "starting at 0, every 15."

### Question mark and other extensions
Some schedulers (Quartz, and many cloud platforms) add a *sixth* field for seconds at the front, plus characters like `?`, `L` (last), and `#` (nth weekday). These are **not** part of classic Unix cron. Always check which dialect your platform uses before copying an expression from a tutorial, a six-field expression pasted into a five-field crontab will fail or behave unexpectedly.

## The gotcha that catches everyone

The day-of-month and day-of-week fields have a surprising relationship. When **both** are restricted (neither is `*`), most cron implementations treat them as an **OR**, not an AND. So `0 0 1 * 1` doesn't mean "the 1st of the month, but only if it's a Monday." It means "the 1st of the month **or** any Monday", which fires far more often than people expect.

The safe habit: leave one of those two fields as `*` unless you genuinely want the OR behaviour. If you need "the first Monday of the month," classic cron can't express it cleanly, you'd handle that condition inside your script instead. The [cron generator](/cron-generator) shows you the human-readable meaning of your expression, which makes this kind of mistake obvious before it hits production.

## A shelf of ready-to-use examples

| Expression | Runs |
|---|---|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *` | Every hour, on the hour |
| `0 0 * * *` | Every day at midnight |
| `0 9 * * 1-5` | 9:00 AM on weekdays |
| `30 3 * * 0` | 3:30 AM every Sunday |
| `0 0 1 * *` | Midnight on the 1st of each month |
| `0 0 1 1 *` | Midnight on New Year's Day |
| `*/15 9-17 * * 1-5` | Every 15 min, 9–5, weekdays |
| `0 22 * * 1-5` | 10 PM on weekdays |

Copy any of these, adjust one field at a time, and you'll internalise the pattern quickly.

## Getting the time zone right

Cron runs in the server's local time zone, not yours. A `0 9 * * *` job on a server set to UTC fires at 9 AM UTC, which might be the middle of the night for your users. Before you rely on a schedule, confirm the machine's time zone (`timedatectl` on Linux) or, on managed platforms, check whether the scheduler lets you specify one. Reasoning about "what time is it really?" is exactly where [Unix timestamps and time zones](/blog/understanding-unix-timestamps) become worth understanding, because epoch time sidesteps the ambiguity entirely.

## Practical tips for reliable jobs

- **Redirect output.** A bare `crontab` line that produces output can silently email the local user or fill logs. Append `>> /var/log/myjob.log 2>&1` so you can see what happened.
- **Use absolute paths.** Cron runs with a minimal environment and a bare `PATH`. Reference `/usr/bin/python3`, not `python3`, and don't assume your shell profile is loaded.
- **Avoid overlapping runs.** If a job might take longer than its interval, guard it with a lock (`flock`) so two copies don't run at once.
- **Test the expression first.** Paste it into the [cron generator](/cron-generator) and read the English description back. If it doesn't say what you meant, fix it before deploying.

## Read your expression back in plain English

The five fields become much less error-prone when something translates them for you. The [cron generator](/cron-generator) does the translation both directions in your browser: build an expression from dropdowns and read the plain-English description, or paste an existing one and check that what it says matches what you meant. The classic mistake it catches: day-of-month and day-of-week both set, which fires on either rather than both, surprising nearly everyone the first time.

## Wrapping up

Cron's syntax is compact but completely learnable: five fields, five special characters, one OR-behaviour gotcha, and a time-zone caveat. Once you can read `0 */6 * * 1-5` as "every 6 hours on weekdays" without pausing, scheduling stops being intimidating. Build your next expression visually with the [cron generator](/cron-generator), and if you're assembling a broader toolkit, the same fundamentals thinking applies to [hashing data with SHA-256](/blog/how-to-hash-data-with-sha-256) and [generating TypeScript types from JSON](/blog/generate-typescript-types-from-json): small, sharp tools that make everyday development smoother.
