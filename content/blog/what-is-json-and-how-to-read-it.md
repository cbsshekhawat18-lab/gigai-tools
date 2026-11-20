---
title: "What Is JSON and How to Read It: A Beginner's Guide"
description: "A plain-English guide to JSON: what it is, the six data types, how to read nested objects and arrays, and how to format messy JSON so it finally makes sense."
date: "2026-07-02"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["json", "beginners", "data-formats", "how-it-works", "developer-tools"]
featured: true
---

If you've ever opened an API response, a config file, or a `package.json` and been greeted by a wall of curly braces and quotation marks, you've met JSON. It looks intimidating at first, but JSON is one of the simplest data formats ever designed: deliberately so. Once you learn its half-dozen rules, you can read almost any JSON document at a glance. This guide walks you through exactly that, from the ground up.

## What JSON actually is

JSON stands for **JavaScript Object Notation**. It's a text format for storing and exchanging structured data, the digital equivalent of a filled-in form that both humans and computers can read. When your weather app fetches a forecast, when a website saves your settings, or when two servers talk to each other, there's a very good chance the message is written in JSON.

Despite the "JavaScript" in the name, JSON is language-independent. Python, Java, PHP, Ruby, Go, and virtually every other language can read and write it. That universality is exactly why it won: it's a neutral meeting point where any two systems can agree on how to shape their data.

A JSON document is just a text file, usually with a `.json` extension. There's no magic. You can open one in any text editor. The structure is what carries the meaning.

## The building blocks: keys and values

At its heart, JSON is made of **key–value pairs**. A key is a label. The value is the data attached to that label. Here's the smallest useful example:

```json
{
  "name": "Ada Lovelace",
  "age": 36,
  "isMathematician": true
}
```

Read it like a form: the field labelled `name` holds `"Ada Lovelace"`, the field labelled `age` holds `36`, and so on. A few rules to notice:

- The whole thing is wrapped in curly braces `{ }`. This is called an **object**.
- Every key is a string in **double quotes**. Single quotes are not allowed in JSON, which trips up a lot of newcomers.
- A colon `:` separates each key from its value.
- A comma `,` separates one pair from the next, but there's **no comma after the last pair**.

Those comma rules cause more headaches than anything else in JSON. If your data won't parse, a stray or missing comma is the first thing to check.

## The six data types you'll ever see

JSON has a small, fixed vocabulary of value types. Learn these six and you've learned the whole language:

- **String**, text in double quotes: `"hello"`.
- **Number**, an integer or decimal, no quotes: `42` or `3.14`. Negative numbers and scientific notation are fine.
- **Boolean**: the literal `true` or `false`, lowercase, no quotes.
- **Null**, the literal `null`, meaning "no value" or "empty on purpose."
- **Object**: a collection of key–value pairs in `{ }`, which can be nested inside other objects.
- **Array**, an ordered list in square brackets `[ ]`.

That's it. There are no dates, no comments, and no functions in pure JSON: a date is just a string like `"2026-01-15"` that your program agrees to interpret.

## Reading arrays

An **array** is a list of values in square brackets, separated by commas:

```json
{
  "skills": ["mathematics", "logic", "programming"],
  "scores": [98, 87, 91]
}
```

The order matters and is preserved. Arrays can hold any type. Including objects, which is where things get interesting:

```json
{
  "team": [
    { "name": "Grace", "role": "engineer" },
    { "name": "Katherine", "role": "mathematician" }
  ]
}
```

Here `team` is an array of two objects. To read it, work outward-in: `team` is a list. Each item in the list is an object with `name` and `role`. This pattern (an array of objects) is the single most common shape you'll meet in real-world APIs, so it's worth getting comfortable with.

## Reading nested data

Real JSON nests. Objects live inside objects, arrays live inside objects, and so on, sometimes several layers deep:

```json
{
  "user": {
    "id": 4021,
    "profile": {
      "displayName": "ada",
      "location": {
        "city": "London",
        "country": "UK"
      }
    }
  }
}
```

To find the city, you follow the path like a set of nested folders: `user` → `profile` → `location` → `city`. In most programming languages you'd write that as `user.profile.location.city`. The indentation is your map: each level of nesting is pushed one step to the right, so you can trace the hierarchy just by scanning the left edge.

That indentation only helps, though, if the JSON is *formatted*. And most JSON you encounter in the wild is not.

## Why raw JSON is so hard to read (and the fix)

Machines don't need whitespace, so JSON is often shipped **minified**, squashed onto a single line to save bytes:

```json
{"user":{"id":4021,"profile":{"displayName":"ada","location":{"city":"London","country":"UK"}}}}
```

That's the same data as the previous example, but nearly unreadable. The solution is to **pretty-print** it: add line breaks and consistent indentation so the structure becomes visible. Rather than doing that by hand, paste it into our [JSON formatter](/json-formatter), which reindents the whole document instantly, right in your browser. It turns a one-line jumble back into the neat, traceable tree you saw above.

Formatting does more than look nice. A good formatter reveals where a bracket is missing or a comma is out of place, because the indentation suddenly stops lining up. If your document won't format at all, it's almost certainly invalid, and that's where a [JSON validator](/json-validator) earns its keep, pointing you to the exact line and character where the syntax breaks. We wrote a companion guide on [how to fix invalid JSON errors](/blog/how-to-fix-invalid-json-errors) that walks through the most common culprits.

## A quick reading checklist

When a JSON document lands in front of you, run through this:

1. **Format it first.** Reindent so the structure is visible.
2. **Find the outermost bracket.** `{` means the top level is an object; `[` means it's a list.
3. **Follow the indentation** to see what's nested inside what.
4. **Trace the path** to the value you care about, level by level.
5. **Mind the types**, quotes mean string, no quotes mean number/boolean/null.

## JSON versus other formats

JSON isn't the only way to shape data. You'll also meet CSV (spreadsheet-style rows), XML (tag-based, older), and YAML (indentation-based config). Each has its place. If you're deciding between the two most common for tabular data, our comparison of [CSV vs JSON](/compare/csv-vs-json) breaks down when each one wins, CSV for flat tables, JSON for anything nested or hierarchical.

## Read from the outermost bracket inward

JSON only looks complex until you know its rules: objects in `{ }`, arrays in `[ ]`, double-quoted keys, six value types, and commas between items but never after the last one. Read from the outermost bracket inward, let the indentation guide you, and format anything minified before you try. With those habits, the wall of braces turns into a clear, readable map of exactly what the data means.

Got a messy blob to decode right now? Drop it into the [JSON formatter](/json-formatter) (free, private, and processed entirely in your browser) and watch it snap into shape.

## Format first, read second

Minified JSON is unreadable by design, so make formatting a reflex: paste anything into the [JSON formatter](/json-formatter) and the bracket structure this guide teaches becomes visible indentation. The formatter parses with the browser's own engine, so it doubles as a validity check. If it formats, it parses. Reading tip once formatted: collapse mentally from the outermost bracket inward, exactly as described above, and any document, however deep, becomes a set of small readable pieces.

## Sources

- [RFC 8259 (The JavaScript Object Notation (JSON) Data Interchange Format)](https://www.rfc-editor.org/rfc/rfc8259), the authoritative grammar
- [JSON (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
