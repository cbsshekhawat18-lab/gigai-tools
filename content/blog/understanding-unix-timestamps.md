---
title: "Understanding Unix Timestamps: Epoch Time, Seconds vs. Milliseconds, and Time Zones"
description: "A clear guide to Unix time: what the epoch is, why seconds and milliseconds trip people up, how time zones fit in, and the 2038 problem, with a free converter."
date: "2026-07-03"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["unix-time", "epoch", "timestamps", "timezones", "dates"]
featured: false
---

Sooner or later every developer meets a number like `1719792000` sitting in an API response where a date should be. That's a **Unix timestamp**, and it's one of the most useful, and most quietly confusing, conventions in computing. This guide explains what the number means, why some are ten digits and some are thirteen, how time zones do (and don't) enter the picture, and the famous 2038 problem. Paste any value into our [Unix timestamp converter](/unix-timestamp-converter) to turn it into a human-readable date as you read along.

## What a Unix timestamp is

A Unix timestamp counts the number of **seconds elapsed since the Unix epoch**, which is midnight UTC on **1 January 1970**. That's it. `0` is the epoch itself, and `1719792000` is roughly 54 years and change later. Because it's a single integer counting from a fixed moment, it has some lovely properties:

- **It's unambiguous.** There's exactly one instant in time for a given timestamp, everywhere on Earth.
- **It's easy to compare.** Which of two events happened first? Just compare the two integers. No date parsing required.
- **It's easy to do arithmetic on.** "One hour later" is `+3600`. "One day later" is `+86400`.

This is why timestamps are the lingua franca of logs, databases, APIs, and file systems. They store an instant without dragging along the messy human baggage of calendars and clocks.

## Seconds vs. milliseconds: the ten-digit / thirteen-digit trap

Here's the single most common bug with timestamps. Classic Unix time counts **seconds**, so a current timestamp is a **10-digit** number (as of the mid-2020s). But JavaScript, Java, and many other environments count **milliseconds** since the epoch, giving a **13-digit** number.

- Seconds: `1719792000`
- Milliseconds: `1719792000000`

If you feed a seconds value into something expecting milliseconds, you'll compute a date in 1970. Feed a milliseconds value into something expecting seconds and you'll land tens of thousands of years in the future. The quick sanity check: **10 digits is seconds, 13 digits is milliseconds** for any date near the present. When you're unsure which you're holding, drop it into the [Unix timestamp converter](/unix-timestamp-converter). If the result is a sensible date, you guessed the unit right.

## Where time zones fit in

This is the part that surprises people: **a Unix timestamp has no time zone.** It's always an absolute count of seconds from a UTC moment. The number `1719792000` is the same instant whether you're in Tokyo, London, or São Paulo.

Time zones only enter when you *convert the timestamp into a human-readable date*. That same instant is displayed as different wall-clock times depending on the viewer's zone:

| Time zone | Displayed date/time |
|---|---|
| UTC | 2024-07-01 00:00:00 |
| New York (UTC−4) | 2024-06-30 20:00:00 |
| Tokyo (UTC+9) | 2024-07-01 09:00:00 |

All three rows describe the *same* timestamp. This is why storing timestamps (or UTC datetimes) rather than local times is a golden rule: you keep one canonical instant and let each user's device render it in their zone. If you're wrestling with "what time will this actually run?" in a scheduler, the same principle applies, see [cron expression syntax explained](/blog/cron-expression-syntax-explained), where server time zones cause exactly this class of confusion.

## Reading and writing timestamps in code

Most languages make conversion straightforward once you respect the unit:

- **JavaScript:** `Date.now()` returns **milliseconds**. To get seconds, divide by 1000 and floor it: `Math.floor(Date.now() / 1000)`. To turn a seconds value back into a date, multiply first: `new Date(ts * 1000)`.
- **Python:** `time.time()` returns **seconds** (as a float). `datetime.fromtimestamp(ts, tz=timezone.utc)` gives you a proper UTC datetime.
- **SQL:** databases vary, some store native timestamp types, others store epoch integers. Know which before you compare or subtract.

The recurring theme: **always confirm whether your source is in seconds or milliseconds** before doing math. It's the one check that prevents the majority of timestamp bugs.

## The year 2038 problem

Older systems store the timestamp in a **signed 32-bit integer**. The largest value that holds is `2147483647`, which corresponds to **03:14:07 UTC on 19 January 2038**. One second later, the counter overflows and wraps around to a large negative number, interpreted as a date back in 1901.

It's a genuine concern for legacy embedded systems and old file formats, and it's the same *family* of problem as Y2K. The fix is already widespread: modern systems use **64-bit** timestamps, which won't overflow for roughly 292 billion years, comfortably longer than the age of the universe. If you're writing new code today, use 64-bit time types and the problem never touches you. It's worth knowing about mainly so you recognise the symptom (dates suddenly reading as 1901) if you ever meet an old system.

## Common uses you'll recognise

- **Log lines** almost always start with a timestamp so events can be ordered and correlated.
- **Cache expiry and tokens** store an "expires at" timestamp and compare it to "now."
- **`created_at` / `updated_at`** columns are the backbone of nearly every database table.
- **Rate limiting** works by comparing the current timestamp against a stored window.

## Convert without pasting into a random site

Timestamps tend to show up in exactly the material you should not paste into arbitrary websites: server logs, database rows, API payloads. The [Unix timestamp converter](/unix-timestamp-converter) does the conversion in your browser with plain Date arithmetic, handles seconds and milliseconds, and shows the result in UTC and your local zone side by side, since "which zone is this?" causes more timestamp bugs than the maths ever does. Nothing you paste leaves the page.

## Try it and build intuition

The fastest way to stop second-guessing timestamps is to convert a few. Open the [Unix timestamp converter](/unix-timestamp-converter), paste the current epoch value, and see the date. Add `86400` and watch it jump forward exactly one day. Try a 13-digit value to see the milliseconds behaviour. Once these feel natural, pair this knowledge with the rest of your toolkit, [hashing data with SHA-256](/blog/how-to-hash-data-with-sha-256) for integrity and [generating TypeScript types from JSON](/blog/generate-typescript-types-from-json) for the API responses those timestamps usually live inside. Small primitives, but they show up in nearly every system you'll ever build.
