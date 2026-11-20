---
title: "Regex Cheat Sheet: Common Patterns and How to Test Them"
description: "A practical regular-expression reference, the core syntax, ready-to-use patterns for email, URLs, phone numbers and dates, plus how to test regex safely."
date: "2026-07-23"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["regex", "regular-expressions", "cheat-sheet", "pattern-matching", "developer-tools"]
featured: true
---

Regular expressions have a reputation for being write-once, read-never. But most of that fear comes from meeting a monstrous pattern with no grounding in the basics. In reality, regex is built from a small set of pieces, and once you know them, even a scary-looking pattern becomes readable. This is a practical cheat sheet: the core building blocks first, then a set of common, copy-ready patterns for real tasks, and finally the single most important habit, testing every pattern before you trust it.

## The building blocks

Regex is a tiny language for describing text patterns. Here are the pieces that make up the vast majority of everything you'll ever write.

### Character classes: what to match

- `.`, any single character (except a newline by default).
- `\d`: a digit, `0–9`. `\D`, any non-digit.
- `\w`, a "word" character: letters, digits, or underscore. `\W`, the opposite.
- `\s`: any whitespace (space, tab, newline). `\S`, non-whitespace.
- `[abc]`: any one of `a`, `b`, or `c`. `[a-z]`, any lowercase letter. `[^abc]`, anything *except* `a`, `b`, or `c`.

### Quantifiers: how many

- `*`, zero or more of the preceding item.
- `+`, one or more.
- `?`: zero or one (makes it optional).
- `{3}`, exactly three. `{2,4}`: between two and four. `{2,}`, two or more.

### Anchors, where

- `^`. Start of the string (or line).
- `$`, end of the string (or line).
- `\b`: a word boundary, the invisible edge between a word character and a non-word character. Great for matching whole words.

### Groups and alternation: structure

- `( )`: a **capturing group**, which bundles part of a pattern and remembers what it matched (useful for extraction and replacement).
- `(?: )`: a **non-capturing group**, same bundling without remembering.
- `|`, **or**: `cat|dog` matches either word.

### Escaping, matching literals

Characters like `.`, `*`, `+`, `?`, `(`, `)`, `[`, `]`, `$`, `^`, and `\` have special meaning. To match one literally, put a backslash in front: `\.` matches a real dot, `\$` matches a real dollar sign.

## Ready-to-use patterns

These are practical starting points for everyday validation and extraction. A crucial caveat up front: for things like email and URLs, there is no single "correct" regex. The official specifications are famously complex. The patterns below are pragmatic and cover the overwhelming majority of real input, which is usually what you actually want.

### Email address

```
^[\w.+-]+@[\w-]+\.[\w.-]+$
```

Read it left to right: one or more word characters (plus `.`, `+`, `-`) for the local part, then `@`, then a domain of word characters and hyphens, then a dot, then the rest of the domain. Good enough for validating a signup form. Don't try to enforce the full RFC by hand.

### URL (http/https)

```
^https?:\/\/[\w.-]+(\.[\w.-]+)+[\w\-._~:\/?#[\]@!$&'()*+,;=]*$
```

The `s?` makes the `s` optional so it matches both `http` and `https`. The trailing class allows the assorted characters that legally appear in a path or query string.

### Phone number (flexible, international-ish)

```
^\+?[\d\s().-]{7,15}$
```

Allows an optional leading `+`, then 7–15 characters made of digits, spaces, parentheses, dots, and hyphens. Deliberately loose, because phone formats vary wildly by country, validating them too strictly rejects legitimate numbers.

### Date (YYYY-MM-DD)

```
^\d{4}-\d{2}-\d{2}$
```

Four digits, a hyphen, two digits, a hyphen, two digits. Note this checks the *shape*, not validity: it'll happily accept `2026-13-40`. For real calendar validation, parse the date after the shape check.

### Hex colour

```
^#?([\da-fA-F]{3}|[\da-fA-F]{6})$
```

An optional `#`, then either three or six hexadecimal characters, matching both `#fff` and `#ffffff`.

### IPv4 address (shape)

```
^(\d{1,3}\.){3}\d{1,3}$
```

Three groups of 1–3 digits followed by a dot, then a final group. Again this checks structure, not that each octet is 0–255, pair it with a numeric range check if that matters.

### Strong password (structure via lookahead)

```
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
```

The `(?=...)` pieces are **lookaheads**. They assert "somewhere ahead there's a lowercase / uppercase / digit" without consuming characters. Combined, they require at least one of each and a minimum length of eight.

## Flags that change everything

Most regex engines let you attach flags that alter matching behaviour globally:

- `i`, **case-insensitive**, so `A` matches `a`.
- `g`, **global**, find all matches rather than just the first.
- `m`, **multiline**, so `^` and `$` match at each line break, not just the string edges.

Forgetting a flag is a common reason a pattern "doesn't work": if `Hello` won't match `hello`, you probably need the `i` flag.

## The one habit that saves you: test everything

Here's the truth about regex: nobody writes a non-trivial pattern correctly on the first try. The characters are dense, edge cases hide everywhere, and a pattern that looks right can quietly match too much or too little. The professionals aren't the ones who write perfect regex, they're the ones who **test relentlessly**.

The right workflow is to build a pattern incrementally against real sample text, watching what it matches and highlights as you go. Paste your pattern and a batch of test strings, the ones you want to match *and* the ones you want to reject, into our [regex tester](/regex-tester) and it shows you every match live as you type, so you can see the moment a change starts catching the wrong thing. Testing against your *rejection* cases matters as much as your acceptance cases. A pattern that matches valid emails is only half-tested until you confirm it also rejects the invalid ones.

Two more things worth watching for while you test:

- **Greedy vs lazy matching.** By default quantifiers are *greedy*, `.*` grabs as much as possible. Add a `?` to make them *lazy*: `.*?` grabs as little as possible. Getting this wrong is the classic reason a pattern swallows far more text than you intended.
- **Catastrophic backtracking.** Certain nested quantifier patterns can make an engine grind for seconds on a malicious input. If a pattern is mysteriously slow, this is often why, simplify the nesting.

## Composition, not memorisation

Regex isn't memorisation, it's composition: character classes for *what*, quantifiers for *how many*, anchors for *where*, and groups for *structure*. Keep the building blocks above within reach, adapt the ready-made patterns for email, URLs, dates, and the rest rather than reinventing them, and, above all, test every pattern against both matching and non-matching examples before you ship it.

Building a pattern right now? Paste it into the [regex tester](/regex-tester) with your sample text and watch the matches light up live, entirely in your browser.

## Test against your real strings, not the example ones

Every pattern here is a starting point. Your data is the exam. The [regex tester](/regex-tester) runs patterns live against text you paste, highlighting matches and groups as you type, locally. The habit that saves the most grief: paste a sample that includes the strings you must NOT match, because overmatching is the classic regex failure and it is invisible until you test the negative cases. Iterate there, then copy the survivor into your code.

## Sources

- [Regular expressions (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions)
- [Regular expression syntax cheat sheet (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet)
