---
title: "When to Use AI, and When to Just Do It Yourself"
description: "The useful question isn't 'how do I use AI': it's 'should I, this time?' A practical, honest guide to knowing when a chatbot saves you and when it quietly wastes your time."
date: "2026-07-27"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "ai-tools"
tags: ["ai", "productivity", "using ai", "workflow", "decision making"]
featured: false
---

Everyone's busy answering "how do I use AI for this?" Almost nobody stops on the better question, which is: *should I, this time?*

Because the hype skips over, sometimes the AI genuinely saves you twenty minutes, and sometimes it hands you a plausible-looking mess that takes you thirty minutes to fix, and the annoying part is that both feel identical in the first ten seconds. So you need a way to tell them apart *before* you commit.

I've landed on a rough rule after a lot of trial and error. It's not scientific. It just works.

## Reach for AI when the cost of "a bit wrong" is low

The best AI tasks share a shape: the answer is mostly about language, and being slightly off doesn't hurt you.

Rewriting an email so it sounds warmer. Turning bullet points into a first draft. Summarizing a long thread. Explaining a concept you're trying to wrap your head around. Coming up with ten name ideas so you can reject nine of them. Getting past the blank page when you know roughly what you want but can't start.

In all of these, "good enough and fast" beats "perfect and slow," and if the AI is a little off, you'll catch it instantly because you're the expert on what you meant. This is where it earns its keep. Honestly, half the value of AI is just defeating the blank page. The draft it gives you is often bad, but a bad draft you can fix beats a blinking cursor you can't.

## Do it yourself when being wrong is expensive, or when the point is that you learn

Now flip it. The moment the task needs to be *correct* rather than just *convincing*, the calculus changes.

Anything with real facts, numbers, names, dates, or citations, you're now the fact-checker for a confident guesser, and that job can eat more time than just writing it yourself. Anything legal, medical, financial, or safety-related. Use AI to understand your options if you like, but the final call shouldn't be outsourced to autocomplete. And code you don't understand is a trap dressed as a shortcut. It runs until the day it doesn't, and then you're debugging something you never actually read.

There's a second category people forget: **things where the whole point is that you get better at them.** If you're trying to become a stronger writer, letting AI write everything is like going to the gym and having a robot lift the weights. You'll have great-looking output and weaker muscles. Use it to go faster on things you've already mastered. Be stingy about using it on the things you're actively trying to learn.

A test I keep coming back to: *if this answer were quietly wrong, who'd get hurt, and how much?* The higher that number, the more it's a do-it-yourself job, or at least a check-everything job.

## And sometimes the right tool isn't "AI" at all

This is the part that gets lost in the noise. A lot of what people now reflexively ask a chatbot to do is better handled by a small, boring tool that just does the thing. No guessing involved.

Need a valid regular expression? A [regex generator](/regex-generator) gives you one that actually works, instead of a chatbot's confident-but-broken attempt. Wrangling messy JSON? A [JSON formatter](/json-formatter) will format and validate it in a second, with no chance of it inventing a field. Want your prompt to fit a model's context window? Check the [token count](/token-counter) directly rather than asking the AI to estimate it. Deterministic tools don't hallucinate. When one exists for your job, it usually beats asking a language model to fake it.

That's actually the whole idea behind [GigAI Smart Assist](/assist): you describe the goal, and it quietly routes you to the right real tool and runs it in your browser. No mystique, no "powered by AI!" banner, just the job done. The best version of "using AI" often looks like *not* using a chatbot at all.

## The test we apply before adding AI to a tool

Every time we consider adding AI to this platform, one question decides it: does a model make the result more correct, or just more impressive-sounding? Converting files, splitting PDFs, generating QR codes: deterministic code wins, every time, because the right answer is defined. Transcribing speech: a model wins, because no hand-written rules can hear. Analysing a screen recording for issues: a model helps but must show its confidence, so ours does. That question generalises to your own work. Where correctness is defined, do it yourself or use plain software. Where pattern recognition is the job, let the model in.

## A thirty-second gut check

Before you open a chat window, run through this:

- Is this about **language** (rewrite, summarize, explain, brainstorm) or about **truth** (facts, numbers, decisions)? Language → good fit. Truth → be careful.
- If it's wrong, **who pays**? Low stakes → go. High stakes → verify everything or do it yourself.
- Is the point that **I learn this**? If yes, do more of it by hand.
- Is there a **plain tool** that does this without guessing? If yes, use that instead.

None of this is anti-AI. I use it every day. It's just that "use AI for everything" is a worse strategy than "use AI for the right things," and the gap between those two people (a year from now) is going to be enormous.

Fast where speed helps. Careful where truth matters. Your own hands on the things you want to stay good at. That is the entire game.

---

*If you're still forming your mental model of these tools, the two worth reading next are [how large language models actually work](/blog/how-large-language-models-work) and [how to use AI without losing your own judgment](/blog/how-to-use-ai-without-losing-your-judgment).*

## Sources

- [Large language model (Wikipedia)](https://en.wikipedia.org/wiki/Large_language_model)
