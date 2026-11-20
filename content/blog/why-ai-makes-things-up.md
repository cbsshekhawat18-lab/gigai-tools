---
title: "Why AI Makes Things Up (It's Not Lying, It's Worse)"
description: "Hallucination isn't a glitch that better models will simply outgrow. It comes from how language models work. Here's the honest explanation, and the habits that catch fabrications before they cost you."
date: "2026-07-27"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "ai-tools"
tags: ["ai", "hallucinations", "llm", "ai accuracy", "fact checking"]
featured: true
---

A lawyer in a now-famous court case submitted a brief full of precedents that didn't exist. Not misremembered, *nonexistent*. The AI he used had invented case names, complete with convincing citations, and when he asked it to confirm they were real, it said yes.

Everyone laughed at the lawyer. But I think about him a lot, because what happened to him is the single most misunderstood behavior in AI, and the standard explanations ("it's buggy," "it lies") both miss what's actually going on. And if you miss what's going on, you can't protect yourself from it.

## It's not lying, because there's no truth inside to betray

Lying requires knowing the truth and choosing to say otherwise. A language model can't do that, because it doesn't contain a database of facts to consult in the first place. As I walked through in [how large language models work](/blog/how-large-language-models-work), a model is a pattern engine: given some text, it produces a statistically plausible continuation, one token at a time.

Read that again with cold eyes: *plausible*. Not *true*. Plausible.

Most of the time, plausible and true overlap, because the model absorbed a mountain of human writing and most human writing about, say, the boiling point of water is correct. Ask something well-covered by its training data and the most plausible continuation *is* the right answer. This overlap is so reliable for common questions that we start treating the model like a reference book.

Then you ask about something rare, recent, or specific (a niche court case, a small company's founding date, *your* situation) and the overlap disappears. The model doesn't switch into a different, dishonest mode. It does exactly what it always does: it produces the most plausible-sounding text. A citation with a realistic case name and page number is more plausible-*sounding* than "I don't know." So that's what you get.

That's why "hallucination" is almost too kind a word. The model isn't occasionally seeing things that aren't there. It's *always* generating. Reality just usually agrees with it.

## Why the fakes are so convincing

Fabrications would be harmless if they looked fabricated. They don't, for a mechanical reason: the model learned the *form* of authoritative text far better than the *facts* inside it. It has read millions of citations, so it knows precisely what a citation looks like, the italics, the volume numbers, the confident tone. Form is a pattern. Patterns are the one thing it's genuinely brilliant at.

So the made-up answer arrives wearing a perfectly tailored suit of credibility. There's no stammer, no hedging, no tell: the wrongness comes dressed exactly like the rightness, which is precisely why [the confident answer isn't the correct one](/blog/ai-myths-people-still-believe) is myth number one worth unlearning.

Worse, asking "are you sure?" doesn't verify anything. The model isn't re-checking a source, there's no source. It's generating a plausible response to being asked if it's sure, and "yes, I've confirmed those cases are real" is a very plausible thing for a text to say. The lawyer's double-check was theater performed by both parties.

## Where hallucination risk spikes

After enough time watching these models, you develop a feel for the danger zones:

- **Specifics that could be checked but can't be checked *by the model*:** citations, quotes, statistics, URLs, prices, dates, names. If it looks like a fact from a lookup table, be suspicious. There is no lookup table.
- **The edges of its knowledge:** niche topics, recent events, small entities. Less training data means the plausible and the true drift apart.
- **Questions that assume something false.** Ask "why did Company X acquire Company Y?" when no such deal happened, and the model will often supply reasons anyway: your premise was part of the pattern it continued.
- **Long chains of reasoning**, where one invented step quietly poisons everything after it.

And one modern twist: the risk isn't limited to chatbots anymore. AI summaries in search results and AI-written articles inherit the same failure mode, then get quoted by humans, then get scraped into the next model's training data. Fabrications are developing a life cycle.

## The design decision this forced on us

This failure mode is why most of this platform contains no AI at all. A file converter that guesses is worse than useless, so our converters are deterministic code, and where we do run a model we constrain it to jobs where fabrication is either impossible or visible. Whisper transcription in [Video Intelligence](/video-intelligence) maps audio to text on your machine. There is no open-ended generation for it to wander in. And our [video analysis tool](/video-to-work) shows findings with confidence levels rather than asserting them as facts, because a system that cannot say "I am not sure" will happily say something false with perfect fluency.

## The habits that actually protect you

None of this makes AI useless. I use it daily. It makes AI a *drafting* tool rather than a *reference* tool, and the habits follow from that:

**Split the output into claims and craft.** The wording, structure, and code are usually excellent. The embedded facts are unverified until proven otherwise. Edit accordingly.

**Verify anything you'd be embarrassed to repeat.** A fake statistic in your notes is harmless. In a client deck it's a small catastrophe. The five-minute check (paste the citation into a real search, click the URL, find the primary source) is the entire game. Our take on [when to trust AI and when to do it yourself](/blog/when-to-use-ai-and-when-to-do-it-yourself) is really about knowing which task you're in.

**Give it the source material.** The single best hallucination reducer available to ordinary users: don't ask the model what a document says, *hand it the document* and ask about that. Grounded questions ("summarize this text") hallucinate far less than open ones ("what does this law say?"). Get the text out of your files first, [OCR a scanned PDF](/ocr-pdf) or [extract the text layer](/pdf-to-txt), so you're pasting clean source rather than trusting recall.

**Prefer "I don't know" prompts.** Explicitly saying "if you're not certain, say so" doesn't fix the mechanism, but it measurably shifts the pattern toward admitting uncertainty. It's a nudge, not a guarantee.

The lawyer's mistake wasn't using AI. It was mistaking a plausibility engine for a truth engine: an easy mistake, because the plausibility engine speaks in the voice of a truth engine. Once you stop expecting truth and start expecting *drafts of truth*, the tool becomes what it always was: astonishingly useful, and never, ever the last step.

## Sources

- [Hallucination, artificial intelligence (Wikipedia)](https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence))
- [Attention Is All You Need (Vaswani et al., 2017)](https://arxiv.org/abs/1706.03762), the transformer paper behind modern LLMs
