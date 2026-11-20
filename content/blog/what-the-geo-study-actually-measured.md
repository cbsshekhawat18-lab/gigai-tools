---
title: "What the GEO Study Actually Measured"
description: "A 2024 research paper tested content edits across 10,000 queries and found which ones increased citation by generative engines. Here is what it found, and what it did not."
date: "2026-08-29"
author: "Chandrabhan Shekhawat"
tool: "content-citability-scorer"
category: "geo-tools"
tags: ["geo study", "ai citation", "research", "content optimization", "kdd 2024"]
featured: true
---

Almost every claim in Generative Engine Optimization is someone's opinion. One is not. In 2024 a team from Princeton, Georgia Tech, the Allen Institute for AI and IIT Delhi ran a controlled study on what actually increases a source's visibility in generative-engine answers, and published it at KDD. If you only read one thing about GEO, read the paper rather than the industry built on top of it.

The preprint is [GEO: Generative Engine Optimization](https://arxiv.org/abs/2311.09735), by Aggarwal, Murahari, Rajpurohit, Kalyan, Narasimhan and Deshpande.

## What they did

The researchers built a benchmark of roughly 10,000 queries spanning many domains and question types, assembled a generative-engine pipeline that retrieves sources and composes a cited answer, then applied a set of candidate content modifications to source pages and measured how each changed the visibility of that source in the resulting answers.

The important design choice is that the edits were applied to the *same* underlying content. This is not an observational study of which pages happen to rank. It is closer to an experiment, which is why it can support causal language that most GEO advice cannot.

Visibility was measured with position-adjusted metrics that account for how much of the answer a source contributed and how prominently, rather than a binary "cited or not".

## What increased visibility

Three content changes stood out consistently.

**Adding statistics.** Replacing qualitative claims with concrete quantitative ones. Not decorating a page with numbers, but stating the same fact numerically where a number exists.

**Adding quotations.** Including quotable, self-contained statements, including from relevant sources.

**Adding citations.** Linking outward to the sources a claim rests on.

Reported gains for the strongest interventions were in the range of roughly 30 to 40 percent relative visibility improvement on their benchmark, with the effect varying by domain. That variance matters and is often dropped when the finding gets repeated: the same edit does not pay equally everywhere.

## What did not work

Several tactics inherited from classic SEO did poorly. Keyword stuffing, in particular, did not help and in places hurt. Approaches that optimize for term matching rather than for the extractability of a claim are optimizing for the wrong retrieval mechanism.

This is the most useful negative result in the paper. It says the transfer from SEO to GEO is partial, and the parts that transfer worst are the parts that were already the least defensible.

## What the study does not say

It does not say these results generalize to every production system. The pipeline was a research construction. ChatGPT Search, Perplexity, Claude and Google's AI features are proprietary, change frequently, and were not the object of measurement.

It does not promise citation. It measures a relative shift in visibility across a benchmark, which is a different claim from "do this and you will be quoted".

It does not cover the technical layer at all. A page that no crawler can reach, or whose content only exists after JavaScript runs, is not in the retrieval set to begin with, and no amount of statistics-adding changes that.

Treat the paper as strong evidence about content, narrow in scope, and silent on infrastructure.

## How we implemented it, and why the formulas are on the page

Our [Content Citability Scorer](/content-citability-scorer) implements the three content factors directly. Fact density counts statistics per hundred words. Source citations counts outbound reference links per five hundred words. Quotability measures the share of sentences that are complete, standalone, liftable claims.

Three further factors are structural rather than from the study, and we label them that way on the page: whether the content opens with a direct answer, whether headings are phrased as questions, and whether sections stand alone. Those reflect how retrieval selects passages, not what the paper measured, and conflating the two would be dishonest.

Every sub-score prints its formula, the numbers it counted and the evidence it counted them from. That is a deliberate response to the state of this category. A score with no stated method cannot be checked, argued with, or acted on, and most GEO scores are exactly that. If we cannot state a factor as a one-line formula with visible inputs, we do not score it.

## Reading the research yourself

The paper is short and readable, and the benchmark methodology section is the part worth your time. It will also inoculate you against the version of these findings that circulates second-hand, which tends to drop the domain variance, drop the negative results, and upgrade "increased visibility on our benchmark" into "guaranteed citation".

## An evidence base worth having, and its edges

GEO advice divides cleanly into claims with a study behind them and claims without. Statistics, quotations and citations are on the first side. Almost everything else you will read, including some of our own structural recommendations, is on the second, and should be presented as reasoning rather than as findings. Knowing which is which is most of what separates useful guidance from confident noise.

## Sources

- [GEO: Generative Engine Optimization (Aggarwal et al., preprint)](https://arxiv.org/abs/2311.09735)
- [Large language model (Wikipedia)](https://en.wikipedia.org/wiki/Large_language_model)
- [Retrieval-augmented generation (Wikipedia)](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)
