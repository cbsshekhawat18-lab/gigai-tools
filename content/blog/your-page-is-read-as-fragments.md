---
title: "Your Page Isn't Read as a Page, It's Read as Fragments"
description: "Retrieval systems split your content into chunks and hand a model one piece at a time, without your headings or the paragraph above. Here is what that does to ordinary writing."
date: "2026-08-29"
author: "Chandrabhan Shekhawat"
tool: "retrieval-chunk-preview"
category: "geo-tools"
tags: ["rag", "chunking", "retrieval", "content structure", "geo"]
featured: true
---

Write this sentence in the middle of an article and nobody blinks: "It also supports transparency, which is why designers reach for it." In context it is perfectly clear. Retrieved on its own, which is how an AI system will actually encounter it, it is meaningless. There is no "it". The sentence names nothing.

That is the single most useful thing to understand about optimizing for AI, and it has almost nothing to do with keywords.

## How retrieval actually handles your content

When an AI answers using sources it was not trained on, it uses retrieval-augmented generation. The mechanics are well documented, including in the [Wikipedia overview of RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation), and the part that matters for writers is the preprocessing.

Documents are split before they are stored. A typical pipeline splits by heading section first, then, when a section exceeds the embedding window, into token windows of a few hundred tokens with a small overlap. Each chunk is embedded separately.

At query time the system finds the chunks whose embeddings match the question and passes only those to the model. Your introduction is not included. Your heading hierarchy is not included. The paragraph immediately above the retrieved chunk is not included, unless it happened to fall in the same window.

The model composes an answer from fragments, and can only quote what is inside them.

## The four ways a fragment fails

**It opens with a pronoun that has no antecedent.** "It", "this", "that", "they". The referent was in a different chunk.

**It references text that is not present.** "As mentioned above", "see below", "as we discussed earlier". A retrieved fragment has no above. These phrases convert a good paragraph into an unusable one.

**It never names its subject.** The section is about your product, but the product name appears only in the heading, and this chunk lost the heading.

**It is mostly boilerplate.** Navigation, related-post lists and link stacks become chunks too, and they compete with your real content for retrieval slots.

## The heading problem nobody expects

Heading-aware splitters attach the heading to the chunk. That works for the first window of a section. When a section is longer than the window, it gets split, and the second and third windows arrive with no heading at all.

This is why section length is a retrieval concern and not just a readability one. A 900-word section under a perfect heading becomes three chunks, two of which are unattributed prose. Keeping sections short enough to stay a single chunk, roughly 200 to 250 words, is the cheapest structural fix available.

## Seeing it is more persuasive than reading about it

We built the [Retrieval Chunk Preview](/retrieval-chunk-preview) because arguing about this in the abstract convinces nobody, including ourselves. It performs the same heading-then-token-window split, then renders every chunk in an isolated card, exactly as a model receives it, and flags the four failure modes above with the offending phrase quoted.

The output is one blunt line: how many of your chunks would be incomprehensible or weak if retrieved alone.

Run it on the article you are proudest of. The result is usually humbling in a specific way: the paragraphs that fail are frequently the best-written ones, because good prose flows, and flow means each sentence leans on the one before it.

## Writing that survives fragmentation

The fixes are unglamorous and mostly known.

Restate the subject instead of using a pronoun at the start of a section or paragraph. "WebP compresses photographs" rather than "It compresses photographs", even when the heading says WebP two lines up.

Delete every "as mentioned above". Search your content for "above", "below", "previously" and "as we discussed" and rewrite each hit.

Keep sections tight enough to stay one chunk, and restate the subject when a section genuinely must run long.

Keep link lists and related-content blocks out of the main content area so they do not become competing chunks.

None of this hurts human readers. It is standard technical-writing advice, because people skim and jump too. Fragmentation just makes the cost of ignoring it measurable.

## Useful for your own systems too

If you are building retrieval over your own documentation, this is a pre-ingestion check rather than a marketing exercise. A chunk that is incomprehensible to you on screen will be incomprehensible to your model when retrieved, and you will spend far longer debugging that as a mysterious answer-quality problem than as a content problem.

## The shift, stated plainly

Classic SEO asks whether your page is relevant to a query. Retrieval asks whether this specific fragment, alone, answers it. Those are different questions, and only the second one is affected by whether your third paragraph starts with the word "it". Once you have seen your own writing chopped up and read back to you without its context, you tend not to write the same way again.

## Sources

- [Retrieval-augmented generation (Wikipedia)](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)
- [GEO: Generative Engine Optimization (Aggarwal et al., preprint)](https://arxiv.org/abs/2311.09735)
- [Large language model (Wikipedia)](https://en.wikipedia.org/wiki/Large_language_model)
