---
title: "SVG Gradients and Patterns Guide: Linear, Radial, and Seamless Tiles"
description: "A practical guide to SVG gradients and patterns: how linearGradient, radialGradient, and the pattern element actually work, with tips for smooth stops, banding, and reusable fills."
date: "2026-07-12"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "svg-gradient-generator"
category: "svg-tools"
tags: ["svg", "gradients", "patterns", "css", "design"]
featured: false
---

Gradients and patterns are what make flat vector art feel designed rather than drafted. In SVG, both live inside a `<defs>` block and get applied by reference, a small mental shift if you're used to CSS gradients, but far more powerful once it clicks. Unlike a CSS gradient, an SVG gradient is a first-class object you can reuse across many shapes, animate, and export as a standalone asset. This guide covers the three building blocks (linear gradients, radial gradients, and tiling patterns) with the practical details that separate a clean result from a banded, blurry one.

## The core idea: define once, reference by id

Every SVG gradient or pattern is declared inside `<defs>`, given an `id`, and then pulled into a shape's `fill` (or `stroke`) with `url(#that-id)`:

```xml
<defs>
  <linearGradient id="sunset">
    <stop offset="0%" stop-color="#ff8a00"/>
    <stop offset="100%" stop-color="#e52e71"/>
  </linearGradient>
</defs>
<rect width="300" height="150" fill="url(#sunset)"/>
```

That indirection is the whole trick. Define `#sunset` once and every rectangle, circle, or path that references it shares the same fill, change the stops in one place and everything updates. The [SVG gradient generator](/svg-gradient-generator) lets you build these visually and copies out the exact `<defs>` markup, which saves you hand-tuning offsets.

## Linear gradients

A `<linearGradient>` blends colors along a straight line. The direction is set by `x1,y1` → `x2,y2`, which default to a left-to-right horizontal sweep. For a diagonal:

```xml
<linearGradient id="diag" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%"  stop-color="#4f46e5"/>
  <stop offset="100%" stop-color="#06b6d4"/>
</linearGradient>
```

The coordinates are in *object bounding box* units by default (0 to 1 across the shape), so the same gradient adapts to any element it fills. Three details worth knowing:

- **More than two stops** create multi-color blends. Add a `<stop offset="50%">` to route the gradient through a third hue.
- **`stop-opacity`** lets a color fade to transparent, the foundation of soft vignettes and fade-out edges.
- **`spreadMethod`** (`pad`, `reflect`, `repeat`) controls what happens beyond the gradient's line, useful for striped effects.

### Avoiding banding

The most common gradient complaint is *banding*, visible steps instead of a smooth blend, especially across a wide area or between two similar colors. SVG gradients are computed continuously, so banding is usually a display or export issue rather than the markup. Two fixes: make sure you're not exporting the gradient to a low-bit-depth raster (keep it as vector SVG and it stays smooth), and if you must rasterize, add a barely-visible noise texture on top to break up the steps. Blending between colors that differ in hue as well as lightness also bands far less than a light-to-dark ramp of the same hue.

## Radial gradients

A `<radialGradient>` blends outward from a center point, perfect for spotlights, orbs, and soft glows:

```xml
<radialGradient id="glow" cx="50%" cy="50%" r="50%">
  <stop offset="0%"  stop-color="#fef08a"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
```

`cx`/`cy` set the center and `r` the radius. The optional `fx`/`fy` move the *focal* point to create an off-center highlight, like light hitting a sphere. Radial gradients that fade to `stop-opacity="0"` are how you build the soft, blurred glows behind cards and hero elements without a single blur filter, cheaper to render and infinitely scalable.

## Patterns: seamless tiling

A `<pattern>` is a small tile that repeats to fill a shape. You define the tile's size with `width`/`height` in `patternUnits="userSpaceOnUse"`, draw the repeating unit inside it, and reference it like any fill:

```xml
<defs>
  <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="4" cy="4" r="2" fill="#cbd5e1"/>
  </pattern>
</defs>
<rect width="400" height="200" fill="url(#dots)"/>
```

The magic (and the difficulty) is making the tile *seamless*, so no grid lines show where copies meet. The rule: any shape that crosses the tile's edge must reappear on the opposite edge. A dot centered at the corner should be drawn at all four corners (or offset so it never touches an edge). Getting this right by hand is fiddly, which is exactly why the [SVG pattern generator](/svg-pattern-generator) exists. It produces correctly-wrapped tiles (dots, grids, stripes, waves, crosshatch) that repeat perfectly, and hands you the markup.

Patterns can also *contain* gradients, fill the tile's shapes with a `url(#gradient)` and you get a textured, shaded background that's still a few hundred bytes and razor-sharp at any zoom.

## Using them in CSS

Once you've built a gradient or pattern, you'll often want it as a page background rather than a shape fill. The move is to wrap the whole SVG (defs + a filled `<rect>`) into a data URI and use it in `background-image`. The escaping rules, encoding `#`, keeping the `xmlns`, single-vs-double quotes: are covered in detail in [using SVG as CSS backgrounds](/blog/using-svg-as-css-backgrounds). The short version: paste your finished SVG into the [SVG to CSS converter](/svg-to-css) and it returns a ready property.

## Keep it lean

Gradients and patterns add markup fast, multiple stops, a `<defs>` block, repeated shapes in a tile. Before shipping, run the file through an optimizer to trim coordinate precision and strip editor metadata. The guide on [reducing SVG file size](/blog/how-to-reduce-svg-file-size) explains which settings are safe. A tidy gradient background is often smaller than the JPEG you'd otherwise use, and it never bands from compression.

## From playground to production

The fastest way to internalise this syntax is to manipulate it live: the [gradient generator](/svg-gradient-generator) lets you drag stops and angles and watch the markup update, then hands you SVG or CSS to paste. I built it because gradient syntax is the kind of thing you understand instantly when you can see cause and effect, and forget instantly when you only read about it. The generated markup is plain standard SVG with no library dependency.

## Bringing it together

The workflow that works: design the color ramp in the [gradient generator](/svg-gradient-generator), build any repeating texture in the [pattern generator](/svg-pattern-generator), combine them if you want shaded tiles, optimize, then inline via [SVG to CSS](/svg-to-css). You end up with backgrounds and fills that are tiny, editable as plain text, and perfectly crisp on every display. The kind of detail that makes an interface feel considered rather than default.

## Sources

- [SVG (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [SVGO](https://github.com/svg/svgo)
