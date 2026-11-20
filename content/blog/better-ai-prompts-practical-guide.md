---
title: "Better AI Prompts: A Practical Guide to Getting Useful Answers"
description: "The same AI can give you a vague, generic answer or a genuinely useful one, and the difference is almost always you. Here are the prompting habits that actually move the needle, with copy-paste templates."
date: "2026-07-27"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "ai-tools"
tool: "token-counter"
tags: ["ai", "prompting", "prompt engineering", "chatgpt", "productivity"]
featured: true
---

Two people ask the same AI the same kind of question. One gets a bland, hedge-everything answer they could've gotten from a search. The other gets something sharp, specific, and immediately useful.

The model is identical. The difference is the prompt.

"Prompt engineering" sounds like a job title, but the useful 90% of it is just a handful of habits. Here they are. No jargon, with templates you can steal.

## 1. Give it a role, a goal, and constraints

The most common weak prompt is a bare question: *"Write about email marketing."* The model has no idea who you are, what you want, or what "good" looks like, so it gives you the average of everything it's ever seen. Bland by design.

Instead, hand it three things:

- **Role**, who it should act as
- **Goal**, what you actually want and for whom
- **Constraints**, length, tone, format, what to avoid

> *"You're a copywriter for a small bakery. Write 3 subject lines for a Diwali sale email to existing customers. Warm, not salesy. Under 45 characters each."*

That prompt can't help but be more useful than "write about email marketing." Specificity is the entire game.

## 2. Show it an example (this is the big one)

If you want output in a particular style or format, *show* one instead of describing it. Models are pattern-matchers. Give them the pattern.

> *"Rewrite these product descriptions in this style. Example, Input: 'Blue cotton shirt.' Output: 'Everyday blue, in cotton that actually breathes.' Now do these five: …"*

One good example beats three paragraphs of instructions. Two examples are better still. This single trick fixes most "it didn't do what I wanted" complaints.

## 3. Ask for the exact format you want

Don't accept the shape it defaults to. Ask for a table, a bulleted list, JSON, a step-by-step, a tweet, a two-sentence summary, whatever you'll actually use next.

> *"Give me the answer as a markdown table with columns: Option, Pros, Cons, Best for."*

If you asked for structured data like JSON and want to be sure it's valid before you use it, drop the output into our [JSON formatter](/json-formatter), it'll catch a stray comma instantly. Need a tricky pattern instead of prose? A [regex generator](/regex-generator) often beats asking a chatbot to "write me a regex" and hoping.

## 4. Iterate, don't start over

Beginners throw away a near-miss and rewrite the whole prompt. Pros treat it like a conversation:

- *"Good, but make it shorter and drop the third point."*
- *"More concrete: add a real example for each."*
- *"That's too formal. Loosen it up."*

Each nudge steers the model without losing the good parts. Your first prompt is a starting point, not a one-shot.

## 5. Mind the context window

Every model can only "see" so much text at once, its **context window**, measured in tokens. Paste a 40-page document and the model may silently lose the start of it, which is why long conversations sometimes "forget" what you said earlier.

When you're working with big prompts, it helps to actually know your token count. Our free [token counter](/token-counter) shows it instantly, so you can trim before you hit the ceiling. If a document is too big, summarize it in chunks rather than dumping the whole thing and hoping. (For *why* tokens matter under the hood, see [how large language models work](/blog/how-large-language-models-work).)

## Three templates you can steal

**The rewrite:**
> *"Rewrite the text below to be [tone] and [length]. Keep the meaning. Here's an example of the style I want: [example]. Text: [paste]"*

**The explainer:**
> *"Explain [topic] to me like I'm smart but new to it. Use a real-world analogy, keep it under 200 words, and end with the one thing most people get wrong."*

**The critic:**
> *"Here's my [email / plan / code]. Point out the 3 biggest weaknesses and how to fix each. Be blunt. [paste]"*

## Check the size of what you are sending

Prompts fail quietly when they are bigger than you think. A pasted document plus your instructions can crowd out the model's working room, and the failure mode is not an error message but a shallower answer. Before sending something long, I run it through the [token counter](/token-counter): for OpenAI models it runs the genuine tokenizer so the number is exact, and for others it gives a clearly-labelled estimate. Knowing whether your prompt is two thousand tokens or twenty thousand changes how you structure it, and it is the difference between guessing and knowing.

## The mindset that ties it together

Great prompting isn't a secret incantation. It's just **communicating clearly**: the same skill that makes you good at briefing a colleague. Say who it's for, what good looks like, and what to avoid. Show an example. Ask for the format you need. Then refine.

And keep the golden rule in mind: a better prompt gets you a better *draft*, never a guaranteed *fact*. Prompting improves the quality. Your judgment still decides what's true, which is the whole point of [using AI without losing your own judgment](/blog/how-to-use-ai-without-losing-your-judgment).

## Sources

- [Byte pair encoding (Wikipedia)](https://en.wikipedia.org/wiki/Byte_pair_encoding), the algorithm real tokenizers run
- [gpt-tokenizer](https://github.com/niieani/gpt-tokenizer), the BPE implementation our token counter runs
