---
title: "Context Windows: Why AI Forgets What You Told It Ten Minutes Ago"
description: "AI chat doesn't have a memory. It has a window. Understanding how context windows work explains the forgetting, the mid-conversation drift, and how to work around both."
date: "2026-07-27"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "ai-tools"
tags: ["ai", "context window", "llm", "ai memory", "chatgpt"]
featured: false
---

Somewhere around message forty, every long AI conversation starts to feel haunted. The model that was following your instructions beautifully begins to drift. It forgets you asked for British spelling. It reintroduces the bug you fixed together an hour ago. It cheerfully contradicts something it told you at the start.

People describe this as the AI "getting tired" or "getting dumber," and I understand why, that's exactly what it looks like. But nothing is degrading. You're watching a very specific, very mechanical limit do its work: the context window.

## There is no memory. There's a window.

Here's the part that reframes everything: a language model doesn't *remember* your conversation at all. Every single time you send a message, the entire conversation (your messages, its replies, the hidden system instructions) gets bundled up and fed through the model again, from scratch. The model is like an actor handed the full script before every line, with no recollection of the previous take.

The context window is simply the maximum size of that script. It's measured in tokens: the text chunks I unpacked in [what is a token, exactly?](/blog/what-is-a-token-in-ai), and it's a hard limit. Current mainstream models offer windows from around 128,000 tokens up to a million or more, which sounds enormous. A 128k window is roughly a 300-page novel.

But conversations are greedier than they look. Every reply the model writes gets added to the script. Paste in a few documents, have a long back-and-forth, and you can burn through six figures of tokens without noticing. When the script outgrows the window, something has to go, and what goes is usually the *oldest* material. Your careful instructions from message one are the first thing shoved off the edge.

## Why "in the window" still doesn't mean "remembered well"

Here's the wrinkle the marketing pages skip: models don't use their whole window equally well. Research keeps finding a "lost in the middle" effect: information at the very start and very end of the context gets used reliably, while things buried in the middle of a huge pile get overlooked. A model can technically *hold* 500 pages and still whiff on a detail from page 250.

So a big context window is like a big desk. You can pile more paper on it, but that doesn't mean everything on it is getting read with equal attention. This is why "I pasted the entire codebase and it missed the obvious thing" is such a common complaint, and why the fix is usually pasting *less*, not more.

It also compounds the honesty problem. A model that has lost your earlier context won't say "I no longer have that." It fills the gap with something plausible, in the same confident tone as everything else: the exact failure mode worth building reflexes around, which is the whole argument of [using AI without losing your own judgment](/blog/how-to-use-ai-without-losing-your-judgment).

## Working with the window instead of against it

Once you accept that you're managing a fixed budget rather than talking to something with a memory, a few habits follow naturally.

**Start fresh more often than feels polite.** A new chat with a crisp two-paragraph summary of where things stand almost always beats message ninety of a decaying thread. You lose nothing: the model was going to forget anyway. You gain a clean window with your instructions right at the front, where they're used best.

**Restate what matters.** If a constraint is important (the tone, the format, the thing it must never do) repeat it in your latest message rather than trusting a copy from an hour ago. The end of the context is prime real estate. Use it.

**Feed sections, not archives.** Before pasting a 60-page document, pull out the part that matters. If it's a PDF, [extract just the text](/pdf-to-txt) or [the relevant pages](/extract-pdf-pages) instead of dumping the whole file. Smaller, relevant context is cheaper *and* more accurately used, it's one of the few genuine free lunches in working with AI.

**Know your actual usage.** The window fills faster than intuition suggests, especially with code or non-English text. Our [token counter](/token-counter) shows what percentage of each model's context window a given prompt consumes: pasting in your usual working document and seeing "34% of the window, before the conversation even starts" is a clarifying experience.

## Seeing your own usage instead of guessing

Numbers make this concrete. Paste your actual prompt into the [token counter](/token-counter) and look at the fraction of the window it occupies for the model you use. People are routinely surprised in both directions: a long-feeling email is often a few hundred tokens, while a pasted PDF chapter can quietly eat half the window before you have asked your question. The counts for OpenAI models come from the real tokenizer. For models whose tokenizers are not public, the tool labels its estimate as an estimate, which is the honesty I wish more tools practised.

## The bigger picture

Vendors are in an arms race over window sizes, and the numbers will keep climbing. But the fundamental shape of the thing won't change soon: a model is a script-reader with a size limit and no yesterday. "Memory" features in chat products are mostly clever bookkeeping, summaries and notes quietly re-inserted into the window on your behalf.

That's not a criticism. It's just the machine being what it is. The people who get the most out of AI aren't the ones with the biggest windows, they're the ones who write a good scene: the right context, the key instruction, nothing buried. Manage the desk, and the actor performs.

## Sources

- [Attention Is All You Need (Vaswani et al., 2017)](https://arxiv.org/abs/1706.03762), the transformer paper behind modern LLMs
- [Large language model (Wikipedia)](https://en.wikipedia.org/wiki/Large_language_model)
