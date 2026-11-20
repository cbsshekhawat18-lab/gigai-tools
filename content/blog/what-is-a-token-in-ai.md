---
title: "What Is a Token, Exactly? The Tiny Unit AI Bills You By"
description: "Every AI model reads, thinks, and charges in tokens. Not words. This is what a token actually is, why 'how many tokens is this?' is weirdly hard to answer, and how to check before you pay."
date: "2026-07-27"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "ai-tools"
tags: ["ai", "tokens", "llm", "api costs", "chatgpt"]
tool: "token-counter"
featured: true
---

The first time I saw an OpenAI invoice, I did what everyone does: I opened a word counter, pasted in my prompts, and tried to make the math work. It didn't. The bill was measured in something called tokens, and tokens, it turns out, are not words. They're not characters either. They're something stranger, and once you understand them, a lot of confusing AI behavior suddenly makes sense.

## A token is a chunk of text the model actually sees

Language models never see your sentence the way you wrote it. Before anything happens, your text runs through a *tokenizer*, a piece of software that chops it into pieces from a fixed vocabulary the model learned during training. Common words usually survive as one piece: "the", "house", "running". Rarer words get split: "tokenization" might become "token" + "ization". An unusual name, a typo, or a chemical formula might shatter into five or six fragments.

The model then does all of its reading and writing in these chunks. When people say a model "predicts the next word," the honest version is that it predicts the next *token*. (If you want the full plain-English picture of what happens after tokenization, I wrote it up in [how large language models work](/blog/how-large-language-models-work).)

The rough rule of thumb for English: one token is about four characters, or about three-quarters of a word. A thousand words of ordinary prose lands somewhere around 1,300–1,400 tokens. But it's genuinely rough, and The reason.

## Why the count is so hard to guess

Tokenizers were built by compressing enormous piles of text, so they reflect what's common in that text. That leads to some counterintuitive results:

- **Code is expensive.** Indentation, brackets, and variable names split into lots of small pieces. A short Python file can cost more tokens than a longer email.
- **Other languages are expensive.** Tokenizers trained mostly on English need more fragments to represent Japanese, Hindi, or Arabic. The same sentence can cost two or three times the tokens of its English translation.
- **Numbers are weird.** "2026" might be one token and "20261" might be two. Long IDs and hashes are brutal.
- **Spaces count.** " hello" (with a leading space) and "hello" are different tokens. Formatting isn't free.

And every model family draws the lines differently. GPT-4o uses a vocabulary called o200k. Older GPT models used cl100k. Claude and Gemini use their own tokenizers that aren't public. The same paragraph gets a different count everywhere it goes.

## Why you should care (even if you never touch an API)

Tokens explain three everyday AI frustrations.

**Cost.** Every API bills per token, both for what you send and what the model writes back. A "quick" script that stuffs a whole document into every request can quietly cost ten times what it needs to. Reply length matters too. Output tokens are usually priced higher than input.

**Limits.** The model's memory, its context window, is measured in tokens, not pages. When a chat "forgets" your earlier instructions, you've usually just scrolled out of the window. That's a big enough topic that it deserves its own explanation, but the short version is: everything you paste competes for the same fixed budget.

**Odd failures.** Ever asked a model to count the letters in a word, or reverse a string, and watched it fail at something a child can do? It's because the model never saw the letters. It saw tokens. "Strawberry" isn't s-t-r-a-w-b-e-r-r-y to a model. It's two or three opaque chunks. Some famous "AI is dumb" examples are really just tokenization artifacts.

## How to actually count them

Guessing with "characters divided by four" is fine for napkin math and wrong the moment money is involved. The proper way is to run the real tokenizer.

That's what our [LLM token counter](/token-counter) does: paste any prompt, system message, or document, and it runs OpenAI's actual BPE tokenizer in your browser for an exact count, side by side with clearly-labelled estimates for Claude and Gemini (their tokenizers aren't public, so anyone claiming "exact" counts for them is bluffing). It also shows what the input would cost per model and how much of each context window you're using: useful for spotting "this prompt is 40% of the window before the model even answers."

One detail I appreciate as the person who built it to work this way: everything runs locally. Your prompt never leaves your device, which matters more than people think. Prompts are full of the exact confidential material we discussed in [AI and your privacy](/blog/ai-and-your-privacy).

## How our own counter counts

A confession that doubles as a lesson: when I built the [token counter](/token-counter), I learned that "counting tokens" means different things per vendor. For OpenAI models the tool runs the real byte-pair-encoding tokenizer (the same o200k vocabulary the models use), so those counts are exact. Anthropic and Google have not published their tokenizers, so for Claude and Gemini the tool says so and shows a calibrated estimate instead. If a tool ever shows you one universal "token count" with no model named, treat it as a rough guide, because there is no such thing as a universal token.

## A few habits that pay for themselves

- **Trim the ritual politeness from API prompts.** "Hello! I hope you're doing well. I was wondering if you could possibly..." is real money at scale. (In chat apps, type however you like.)
- **Don't paste the whole document when a section will do.** Shorter context isn't only cheaper: models genuinely answer better when the relevant part isn't buried.
- **Check before you build.** If you're wiring AI into a product, count the tokens of a realistic request *before* you multiply by a million users. It's a two-minute check that has saved people from some very creative invoices.
- **Watch the output.** If you only need a yes/no or a JSON field, say so. Unbounded "explain in detail" replies are where budgets go to die.

Tokens are one of those concepts that sounds like trivia until the first time it costs you something, a truncated answer, a forgotten instruction, a surprising bill. Ten minutes with a [token counter](/token-counter) and a few of your own real prompts will teach you more about how these models see text than any diagram can.

## Sources

- [Byte pair encoding (Wikipedia)](https://en.wikipedia.org/wiki/Byte_pair_encoding), the algorithm real tokenizers run
- [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer), the BPE implementation our token counter runs
- [Attention Is All You Need (Vaswani et al., 2017)](https://arxiv.org/abs/1706.03762), the transformer paper behind modern LLMs
