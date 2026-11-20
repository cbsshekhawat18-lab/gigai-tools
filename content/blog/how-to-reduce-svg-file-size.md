---
title: "How to Reduce SVG File Size: Minify, Trim Precision, and Strip the Cruft"
description: "SVG exports from Figma and Illustrator are often bloated with metadata and 6-decimal coordinates. The steps to shrink them (minifying, cutting precision, and cleaning paths) without losing quality."
date: "2026-07-08"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "svg-minifier"
category: "svg-tools"
tags: ["svg", "minify", "optimize", "performance", "precision"]
featured: false
---

An SVG that leaves a design tool is almost never as small as it should be. A simple icon that ought to weigh 400 bytes routinely ships at 3–4 KB, padded out with editor metadata, invisible layers, and coordinates specified to six decimal places no screen could ever resolve. Because SVGs are frequently inlined into HTML or CSS (where every byte is downloaded on every page) that bloat compounds fast. This guide covers the specific, safe ways to cut an SVG down, roughly in order of how much they save.

## First, see what you're dealing with

Open the SVG in a text editor before you optimize. A typical Figma or Illustrator export looks something like this near the top:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<metadata>...tool version, license, timestamps...</metadata>
<g id="Layer_1" data-name="Layer 1">
<path d="M12.000000,2.000000 C6.477000,2.000000..."/>
```

Almost everything in that snippet except the `<svg>` tag and the `<path>` geometry is removable. The savings below come from cutting exactly this kind of thing.

## 1. Strip metadata and editor junk (biggest, safest win)

Design tools embed a lot you never see: `<metadata>` blocks, XML comments, editor namespaces (`sodipodi:`, `inkscape:`, `xmlns:xlink` when unused), `<title>`/`<desc>` you didn't write, and `id`/`data-name` attributes on every layer. None of it affects how the SVG renders. Removing it is completely lossless and often accounts for a third to half of the file. This is the first thing the [SVG minifier](/svg-minifier) does, and it's the single highest-return step.

One caveat: if the SVG is an *accessible* graphic where a real `<title>` provides the accessible name, keep that. Strip the auto-generated junk, not the meaningful semantics.

## 2. Reduce coordinate precision (the sneaky big one)

This is where the surprising savings hide. A path coordinate like `12.000000` carries five useless zeros. Even `12.34567` is overkill, for an icon drawn in a 24-unit viewBox, two decimal places is imperceptible, and often you can round to one. Every digit you drop is a byte saved, multiplied across hundreds of path points.

Precision is a slider, not a switch. The right value depends on the graphic:

- **Icons and UI glyphs** in a small viewBox: 1–2 decimals is plenty.
- **Detailed illustrations** with fine curves: 2–3 decimals to be safe.
- **Anything you'll scale to poster size**: keep a little more headroom.

The trick is to reduce precision, then eyeball the result at the largest size you'll actually use. If nothing visibly shifts, you rounded correctly. Both the [SVG minifier](/svg-minifier) and the more thorough [SVG optimizer](/svg-optimizer) expose this control: the optimizer lets you tune it per-run so you can find the point just before quality drops.

## 3. Simplify and merge paths

Traced or heavily-edited SVGs sometimes contain far more points than the curve needs, or several separate paths that share a fill and could be one. A good optimizer will merge adjacent paths, collapse redundant points, and convert absolute coordinates to relative ones (relative coordinates are usually shorter strings). These transforms are geometry-aware and, within reason, visually lossless. The [SVG optimizer](/svg-optimizer) is the tool to reach for when a minify pass alone hasn't done enough. It applies these structural cleanups on top of the byte-level trimming.

## 4. Move inline styles to attributes (or vice versa)

`fill="#333"` is shorter than `style="fill:#333"`. Design tools love the verbose `style=` form. Converting simple styles to presentation attributes shaves a bit off, and consolidating repeated fills into a parent `<g>` shaves more. This is a smaller win than precision, but it's free and lossless, and the optimizer handles it automatically.

## 5. Collapse whitespace and newlines

For SVGs you're inlining into HTML or a data URI, the indentation and line breaks are pure overhead. Minifying to a single line removes them. (If a human still needs to read the file, keep a pretty source and minify only the shipped copy. The [SVG prettifier](/svg-prettifier) can re-expand it whenever you need to edit.)

## What NOT to do

Optimization has a floor, and pushing past it costs you quality:

- **Don't crush precision so hard that curves get visibly angular.** Below ~1 decimal, small icons can lose their smooth corners.
- **Don't strip a `viewBox`**. It's what makes the SVG scale responsively. Removing `width`/`height` is often fine (it lets CSS size it), but the `viewBox` must stay.
- **Don't remove `<title>` if it's the accessible name** for an interactive or informative graphic.
- **Don't gzip and call it done.** Server gzip helps, but it compresses redundancy. It can't invent structure the way path-merging does. Optimize the source *and* let the server gzip. They stack.

## A realistic workflow

Here's the sequence that gets the most out of a file with the least risk:

1. Run the export through the [SVG minifier](/svg-minifier) first. It strips metadata, trims precision to a sensible default, and collapses whitespace in one pass. For many icons this is all you need.
2. If it's still heavier than you'd like, send it through the [SVG optimizer](/svg-optimizer) with a slightly more aggressive precision setting and path-merging enabled.
3. Check the result at full size. Everything runs in your browser, so you can iterate on precision instantly with nothing uploaded.
4. If you're inlining the result, follow up with [using SVG as CSS backgrounds](/blog/using-svg-as-css-backgrounds) for the data-URI escaping details, or see the step-by-step [how to optimize an SVG](/how-to/how-to-optimize-an-svg) walkthrough.

## What to expect

A typical Figma icon export drops from ~3 KB to well under 1 KB (often a 60–70% reduction) with zero visible change. Detailed illustrations vary more, but a halving is common. Multiply that across an icon set or a page full of inline SVGs and it's a real, free performance win: fewer bytes on every request, sharper than any raster, and still fully editable text.

## Where the optimiser runs, and why that matters

The [SVG minifier](/svg-minifier) runs SVGO, the same optimiser build pipelines use, but inside a Web Worker in your tab. Pure JavaScript, no DOM, no server. The worker detail is not trivia: a complex SVG can take a moment to optimise, and doing it off the main thread keeps the page responsive while it happens. Your artwork never uploads, which matters when the SVG is an unreleased logo or client work under NDA.

## Sources

- [SVG (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [SVGO](https://github.com/svg/svgo)
