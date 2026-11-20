---
title: "How to Optimize SVG for the Web: SVGO, Editor Cruft and Smaller Files"
description: "SVGs exported from design tools are full of hidden bloat. How to do it to clean them up with SVGO, strip editor metadata, and cut file size without changing how they look."
date: "2026-07-06"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "svg-optimizer"
category: "svg-tools"
tags: ["svg", "svgo", "optimization", "performance", "web"]
featured: false
---

An SVG straight out of Illustrator, Figma or Sketch is rarely ready for the web. It looks fine, but open the file in a text editor and you'll find a surprising amount of invisible baggage: editor namespaces, hidden metadata, empty groups, and coordinates written to fifteen decimal places. None of it changes a single pixel of the render. It just makes the file bigger and slower to parse. Optimising an SVG means removing that dead weight so you ship the drawing and nothing else.

## Why exported SVGs are so bloated

Design tools optimise for round-tripping (reopening the file later with every layer, guide and setting intact) not for delivery. So they pack in extras:

- **Editor metadata and namespaces**, like `<metadata>` blocks and `xmlns:sketch`, `xmlns:figma` or Adobe-specific attributes that only the source app ever reads.
- **Comments and XML declarations** you don't need at runtime.
- **Hyper-precise numbers**, such as `d="M 12.34567890123 45.6789012345 ..."`, where two or three decimals would be visually identical.
- **Redundant structure**, nested `<g>` groups wrapping a single shape, empty containers, and default attribute values that could simply be omitted.
- **IDs and classes** left over from the design file that the SVG itself never uses.

It is common for this cruft to make up **half the file or more**. Stripping it is pure profit: smaller downloads, faster parsing, and cleaner markup you can actually read.

## The fast path: run it through an optimiser

The quickest way to clean an SVG is to run it through the [SVG optimiser](/svg-optimizer). Paste or drop your file in, and it strips the metadata, collapses redundant groups, rounds down the numbers and hands you back a minified version: with a live before/after size so you can see exactly what you saved. Because it runs entirely in your browser, nothing is uploaded, which matters when the graphic is unreleased brand work. For a click-by-click version of this workflow, follow our [how to optimise an SVG](/how-to/how-to-optimize-an-svg) walkthrough.

If you only need to tidy one or two files before shipping, that is genuinely all you have to do. The rest of this guide is for when you want to understand *what* is being removed and how to bake optimisation into a build.

## What SVGO actually does

Most SVG optimisers, including ours, are built on **SVGO**, the standard open-source SVG optimiser. SVGO works as a chain of small, independent **plugins**, each responsible for one kind of cleanup. Understanding the important ones helps you optimise confidently instead of blindly.

### Safe-by-default plugins

These almost always help and rarely cause problems:

- `removeComments`, `removeMetadata`, `removeXMLProcInst`: delete comments, `<metadata>` and the `<?xml ...?>` declaration.
- `removeEditorsNSData`, strips the Illustrator/Sketch/Inkscape namespace clutter.
- `cleanupNumericValues` and `convertPathData`: round coordinates and rewrite path data more compactly.
- `collapseGroups` and `removeEmptyContainers`, flatten pointless nesting.
- `removeUselessStrokeAndFill`. Drop attributes that have no visible effect.

### Plugins to handle with care

A few optimisations can quietly break things, so know when to switch them off:

- `removeViewBox`, **usually disable this.** The `viewBox` is what lets an SVG scale responsively. Removing it can lock the graphic to a fixed size. (See [what an SVG is and why to use it](/blog/what-is-an-svg-and-why-use-it) for why `viewBox` is central to scalability.)
- `cleanupIds` / `removeUnknownsAndDefaults`: if your SVG is animated or its IDs are referenced by external CSS or JavaScript, mangling or removing IDs can break those hooks.
- Aggressive `convertShapeToPath` and `mergePaths`: fine for static icons, but they can interfere with elements you intend to animate individually.

The rule of thumb: for a plain static icon, optimise aggressively. For anything animated or scripted, optimise conservatively and check the result still works.

## Beyond SVGO: things you should do by hand

Automated tools handle the mechanical cleanup, but a few high-value wins are up to you.

### Design lean in the first place

The cheapest byte is the one you never draw. In your design tool, merge shapes you can, avoid unnecessary masks and clip paths, and expand text to outlines only when you truly need to. Outlined text is far heavier than a real `<text>` element.

### Use `currentColor` for icons

If an icon should adopt the surrounding text colour, set `fill="currentColor"` and delete the hardcoded fills. That removes attributes *and* makes the icon adapt to dark mode and hover states for free, one of the reasons SVG icons beat image files, as we discuss in [SVG vs icon fonts](/blog/svg-vs-icon-fonts-which-is-better).

### Gzip is already helping

Your server almost certainly serves SVGs with gzip or Brotli compression, and SVG's repetitive text compresses beautifully. Optimisation and compression stack: SVGO removes structural redundancy the compressor can't, then the compressor squeezes what remains. Don't skip optimising just because gzip exists.

## Automate it in your build

Optimising by hand is fine for a handful of assets, but a real project has dozens. Wire SVGO into your pipeline so every asset is cleaned automatically:

- **Command line:** `npx svgo --folder ./src/icons --output ./public/icons` cleans a whole directory in one pass.
- **Config file:** commit an `svgo.config.js` so your whole team shares the same plugin settings: including your decision to keep `viewBox`.
- **Bundlers:** loaders for Webpack and Vite can optimise SVGs at import time, so the version that ships is always the clean one.

If you also import SVGs as UI components, the same optimisation step pairs naturally with converting them to code, see [how to use SVG icons in React](/blog/how-to-use-svg-icons-in-react).

## How much can you expect to save?

For typical exported icons and illustrations, a 30–60% size reduction is normal, and heavily bloated files can shrink even more. On a page with a set of icons and a couple of illustrations, that adds up to real bytes off your load, with zero visible change to the artwork.

## Delete everything that doesn't paint a pixel

Optimising SVG is about deleting everything that doesn't paint a pixel (editor metadata, redundant groups, needless precision) while carefully preserving what makes SVG powerful, above all the `viewBox`. Run your files through the [SVG optimiser](/svg-optimizer) for a quick clean, reach for SVGO in your build to make it automatic, and design lean so there's less to strip in the first place. Cleaner SVGs load faster, read better, and are far easier to style and animate down the line.

## Our optimiser's default is deliberately cautious

The [SVG optimiser](/svg-optimizer) runs SVGO in a Web Worker with presets we tuned in a specific order of priority: never break the artwork first, save bytes second. That is why the default keeps the viewBox (removing it is SVGO's most notorious foot-gun, killing responsive scaling for a few saved bytes) and why the aggressive plugins sit behind an explicit choice. The before/after preview exists so you verify with your eyes, not our word, that the cheap bytes were actually free.

## Sources

- [SVGO](https://github.com/svg/svgo), the optimiser behind our SVG tool
- [SVG (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/SVG)
