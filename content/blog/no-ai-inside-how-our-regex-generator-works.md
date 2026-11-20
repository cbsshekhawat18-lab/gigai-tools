---
title: "No AI Inside: How Our Regex Generator Actually Works"
description: "Our regex generator turns example strings into a working pattern with zero AI, and that's a feature, not a shortcut. A look under the hood, and an honest case for boring algorithms."
date: "2026-07-28"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["regex", "developer tools", "ai", "how it works", "algorithms"]
tool: "regex-generator"
featured: false
---

When we shipped our [regex generator](/regex-generator), a user emailed to ask which AI model it uses. Fair question; "paste examples, get a regex" sounds exactly like a product with a language model behind the curtain and an API bill in its future.

The answer surprised him: there's no AI in it at all. No model, no API call, no tokens. It's a deterministic algorithm running entirely in your browser tab. And the *why* behind that choice says a lot about when AI is the right tool, and when it very much isn't, so I thought it was worth writing up properly.

## What it actually does

You paste a handful of strings that should match (order IDs, log lines, product codes, whatever) and the generator works through a short ladder of strategies, taking the first one that fits:

**First, it checks the knowns.** A big share of real-world regex needs are the same twenty formats over and over: emails, URLs, IP addresses, UUIDs, dates, times, phone-ish numbers, hex colors. The generator tests your examples against a library of battle-tested patterns for these. If every example is, say, a valid ISO date, you get the proper ISO-date pattern: the careful kind that knows months stop at 12, not a naive `\d+-\d+-\d+`.

**If that fails, it reads the structure.** This is the interesting part. The algorithm splits each example into runs of character classes, letters, digits, and the literal separators between them. `INV-2026-0042` becomes *letters, hyphen, digits, hyphen, digits*. Then it lines the examples up and looks for what's stable and what varies. Same literal prefix everywhere? That's anchored as `INV-`. Digit run that's always four long? `\d{4}`. Sometimes three, sometimes five? `\d{3,5}`. The pattern falls out of the agreement between your examples.

**If the examples are too varied even for that**, it degrades honestly: you get a broad, safe pattern and the UI tells you it's a starting point to refine, rather than pretending to a precision it doesn't have.

**Finally (and this is the step I'd defend in court) it validates.** Whatever pattern comes out is executed against every example you gave. If anything doesn't match, you see it flagged, not hidden. The tool is structurally incapable of handing you a pattern that fails its own inputs.

## Why not just use AI?

We could have wired this to a language model. It would have demoed brilliantly. This is what it would have cost you, though, and this is really a checklist for evaluating *any* "AI-powered" utility:

**Determinism.** The algorithm gives the same examples the same answer, every time, forever. A model gives you a draw from a distribution, usually good, occasionally subtly off, never guaranteed repeatable. For a config-file one-liner that difference is cosmetic. For the regex guarding your input validation, it isn't.

**Verifiability.** An LLM writes regex the way it writes everything, [plausibly](/blog/why-ai-makes-things-up). Plausible regex is a special kind of dangerous: it looks right, matches your happy-path test, and then a month later you learn what it does with an edge case. Our generator's patterns are either from a vetted library or mechanically derived from your data, and always machine-checked against it. Nothing is "probably" right.

**Privacy.** The strings people paste into a regex tool are real data: order numbers, user IDs, fragments of production logs. With an AI backend, all of that ships to a third-party API. Here it never leaves the tab. There's nothing to trust, because there's nothing sent.

**Speed and cost.** Results appear as you type, offline if you like, free at any scale. No inference bill means no reason to ever meter, throttle, or upsell the feature.

None of this is anti-AI. I use language models constantly, and for *explaining* a gnarly regex someone else wrote, they're genuinely great. It's about fitting the tool to the job, the same calculus as [when to use AI and when to do it yourself](/blog/when-to-use-ai-and-when-to-do-it-yourself): AI earns its keep on open-ended problems with fuzzy inputs. Inferring structure from clean examples is the opposite of that: a bounded problem with a checkable answer. Using a trillion-parameter model there isn't ambitious. It's a rounding error away from using a chainsaw to sharpen a pencil.

## The honest limits

Symmetry demands the other half: the algorithm has real ceilings. It infers from what you show it: give it two examples and it may lock onto coincidences (both happened to start with "A", so the pattern demands an A). Five to ten varied examples work much better, including the weird ones. It can't read intent: if your examples don't reveal that letters can *sometimes* appear in the middle section, the pattern won't allow them. And genuinely irregular formats (free text, mixed legacy IDs from three merged systems) will get you that broad fallback pattern and an honest note, not a miracle.

For those cases, the workflow that actually works: generate the starting pattern, then take it to the [regex tester](/regex-tester) with a bigger sample of real data and tighten it by hand. (Keep the [cheat sheet](/blog/regex-cheat-sheet-with-common-patterns) open. Nobody remembers lookbehind syntax, and nobody should have to.)

## Where we do use models, and why not here

For the record, we are not anti-AI. We are anti-mismatch. This platform runs Whisper in the browser for transcription and offers one disclosed hosted-model analysis tool, because hearing speech and judging a screen recording are jobs where pattern recognition genuinely wins. A regex is the opposite kind of job: the output must be exact, verifiable and explainable, and a generator that can show you why every character is there beats one that produces plausible patterns you have to trust. Same platform, two different answers, one principle: pick the engine the job can be verified against.

## Sometimes the boring choice is the right one

"AI-powered" has become a synonym for "good" in software marketing, and it's worth pushing back on gently. Sometimes the best engineering decision is the boring one: a transparent algorithm that runs in milliseconds, explains itself, checks its own work, and never phones home. When you're choosing tools, don't ask whether there's AI inside. Ask whether the answer is *checkable*, and whether anyone bothered to check it.

Ours does, on every keystroke. No model required.

## Sources

- [Large language model (Wikipedia)](https://en.wikipedia.org/wiki/Large_language_model)
