---
title: "How to Fix Invalid JSON Errors: The Complete Troubleshooting Guide"
description: "Trailing commas, single quotes, unescaped characters: the real reasons your JSON won't parse, and exactly how to find and fix each one, line by line."
date: "2026-07-04"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["json", "debugging", "troubleshooting", "validation", "developer-tools"]
featured: true
---

`SyntaxError: Unexpected token`. `Unexpected end of JSON input`. `Expecting ',' delimiter`. If you've spent any time working with APIs, config files, or data exports, you've stared at one of these messages and wondered where, exactly, your JSON went wrong. The frustrating part is that JSON errors are almost always tiny, a single stray character, but the error message rarely points you to the right spot. This guide covers every common cause, in order of how often it bites people, plus a reliable process for hunting the culprit down.

## First, understand what "invalid" means

JSON is strict on purpose. Unlike a human reading past a small typo, a parser refuses anything that doesn't match the specification exactly. There's no "close enough." A missing comma, a wrong quote character, or one extra bracket, and the entire document fails to parse. Not just the broken line. That all-or-nothing behaviour is why a 500-line file can be rejected because of a single character on line 3.

The useful part: because the rules are strict and finite, so is the list of things that can go wrong. Work through the causes below and you'll fix nearly every real-world case.

## Cause 1: Trailing commas (the number-one offender)

This is the single most common JSON error. A comma separates items, so there must be nothing after the final item:

```json
{
  "name": "Ada",
  "age": 36,
}
```

That comma after `36` is illegal in JSON. The same applies inside arrays: `[1, 2, 3,]` is invalid. This bites people constantly because trailing commas are perfectly *legal* in JavaScript and Python, so muscle memory betrays you the moment you switch to JSON.

**The fix:** remove the comma after the last item in every object and array. A formatter that reindents your document makes these stand out, because the dangling comma sits alone before a closing bracket.

## Cause 2: The wrong kind of quotes

JSON requires **double quotes** for both keys and string values. These are all invalid:

```json
{ 'name': 'Ada' }        // single quotes — no
{ name: "Ada" }          // unquoted key — no
{ "name": "Ada" }        // correct
```

Single quotes are the usual mistake, again because JavaScript object literals allow them. Unquoted keys are a close second, for the same reason. If you copied an object out of code and pasted it as JSON, this is very likely your problem.

**The fix:** wrap every key and every string value in double quotes. Numbers, booleans, and `null` stay unquoted.

## Cause 3: Smart quotes and hidden characters

Copy text from a word processor, an email, or a chat app and you may drag along **"curly" smart quotes** (`"` and `"`) instead of straight ones (`"`). They look almost identical but are entirely different characters, and JSON only accepts the straight version. Invisible characters, a stray non-breaking space, a zero-width space, or a byte-order mark (BOM) at the very start of the file, cause the same baffling failures where the JSON *looks* perfect but won't parse.

**The fix:** retype the quotes directly in a plain code editor rather than pasting from a rich-text source. If a file fails on line 1 with no visible reason, suspect a BOM or hidden character at the start and re-save it as plain UTF-8.

## Cause 4: Mismatched or missing brackets

Every `{` needs a matching `}`, and every `[` needs a matching `]`. Delete one by accident (or forget to close a nested object) and you'll typically get `Unexpected end of JSON input`, because the parser reaches the end still waiting for a bracket that never comes.

**The fix:** format the document and check that the indentation returns cleanly to the left margin at the end. If the last closing bracket sits indented, you're missing one. Most code editors also highlight the matching bracket when you place your cursor on one. Use that to trace pairs.

## Cause 5: Unescaped special characters in strings

Some characters have special meaning and must be **escaped** with a backslash inside a string. The two that catch people out most are the double quote and the backslash itself:

```json
{ "quote": "She said \"hello\"" }
{ "path": "C:\\Users\\ada" }
```

Literal line breaks inside a string are also illegal: a newline must be written as `\n`, not an actual carriage return in the middle of quoted text. If a value contains a Windows file path, an embedded quotation, or multi-line text, unescaped characters are the likely cause.

**The fix:** escape `"` as `\"`, escape `\` as `\\`, and replace real line breaks with `\n`.

## Cause 6: Wrong value types

JSON is fussy about what a value can be. A few things that *look* fine but aren't:

- **Comments.** Pure JSON has no `//` or `/* */` comments. If your config file has them, it isn't valid JSON (some tools accept "JSON with comments," but a strict parser won't).
- **`undefined`, `NaN`, `Infinity`.** None of these exist in JSON. Use `null` for a missing value.
- **Leading zeros or trailing decimals.** `007` and `5.` are invalid numbers.
- **Dates as bare text.** A date has to be a quoted string, e.g. `"2026-02-09"`, not a raw value.

## A reliable process for finding the error

When you don't know what's wrong, don't scan the whole file by eye. Do this instead:

1. **Run it through a validator.** Paste the document into our [JSON validator](/json-validator). It parses the whole thing and reports the exact line and column of the first error: turning a needle-in-a-haystack hunt into a one-click answer.
2. **Fix that first error, then re-check.** Because the parser stops at the first problem, there may be more than one. Fix, re-validate, repeat until it comes back clean.
3. **Format the result.** Once it's valid, reindent it in the [JSON formatter](/json-formatter) so you can confirm the structure is what you intended.

This validate-fix-reformat loop is far faster than staring at raw text, and it teaches you to recognise the patterns so you make the mistakes less often.

## Prevention beats debugging

A few habits stop most errors before they start:

- **Edit JSON in a code editor**, not a word processor, so smart quotes never sneak in.
- **Let a tool generate it** where possible: hand-written JSON is where typos breed.
- **Validate before you ship** any config or API payload, the same way you'd spell-check a document.

If you're regularly converting between formats and wondering whether JSON is even the right container for your data, our [CSV vs JSON](/compare/csv-vs-json) comparison lays out where each shines. And if the format itself still feels unfamiliar, start with our beginner's guide to [what JSON is and how to read it](/blog/what-is-json-and-how-to-read-it), which covers the structure the errors above all violate.

## It's almost always one of five things

Almost every "invalid JSON" error comes down to one of a handful of things: a trailing comma, the wrong quotes, an unescaped character, a mismatched bracket, or an illegal value type. Rather than hunting by eye, paste your document into a [JSON validator](/json-validator) to jump straight to the offending line, fix it, and re-check. It runs entirely in your browser, so even a sensitive payload never leaves your machine, and you'll have valid JSON in seconds instead of minutes.

## Paste, and read the pointer, not the whole file

The [JSON validator](/json-formatter) parses with the browser's own engine and points at the failing character, which is the difference between reading an error and hunting for one. In practice, misquoted keys and trailing commas cause most of the tickets this article covers, and both are one-keystroke fixes once located. The formatter also re-indents valid JSON, so minified API responses become readable before you debug them. Your data stays in the tab.

## Sources

- [RFC 8259 (JSON)](https://www.rfc-editor.org/rfc/rfc8259), why trailing commas and single quotes are invalid
- [ 32  (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
