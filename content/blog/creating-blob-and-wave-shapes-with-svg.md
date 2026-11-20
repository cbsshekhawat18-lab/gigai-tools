---
title: "Creating Blob and Wave Shapes with SVG for Modern UI"
description: "Organic blobs and section-divider waves are everywhere in modern web design. The steps they're built with SVG paths, how to generate them, and how to use them without hurting performance."
date: "2026-07-19"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "svg-blob-generator"
category: "svg-tools"
tags: ["svg", "blobs", "waves", "ui-design", "shapes"]
featured: false
---

Somewhere around the late 2010s, the sharp rectangles of flat design started to soften. Landing pages sprouted organic **blobs** behind product shots, and flat section dividers gave way to flowing **waves** that let one colored band melt into the next. Both effects are pure SVG, a single curved `<path>` doing all the work, which is why they scale perfectly, weigh almost nothing, and can be recolored with one attribute. This guide explains how these shapes are actually constructed, how to generate them quickly, and how to drop them into a real layout without the usual pitfalls.

## Why SVG is the right tool for organic shapes

You could fake a blob with a heavily rounded `border-radius` or a wave with a background image, but both fall short. `border-radius` can't do genuinely irregular, hand-drawn curves. A raster wave image blurs on high-density screens and ships extra kilobytes. An SVG path does neither: it's a mathematical curve that stays crisp at any size, colors with a single `fill`, and, because it's text, inlines straight into your HTML with no extra request. That combination is why blobs and waves became a design staple rather than a passing trick.

## How a blob is built

A blob is one closed `<path>` made of **cubic Bézier curves**. Instead of straight line segments, each segment bends according to two control points, and stringing several together around a center produces a smooth, lumpy, closed shape:

```xml
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path fill="#7c3aed" d="M52,-58C66,-46,74,-27,76,-6C77,15,72,37,58,52C44,66,22,72,-1,73C-24,74,-48,70,-63,55C-77,40,-82,15,-77,-8C-71,-31,-56,-52,-37,-64C-18,-76,7,-79,28,-73C..."/>
</svg>
```

That soup of numbers is the reason nobody writes blobs by hand. The shape is defined by how far each point sits from the center and how the control points curve between them, tweak those and you get a rounder or more jagged blob. The [SVG blob generator](/svg-blob-generator) lets you dial in the number of points, the irregularity, and the color, then regenerates the path with a click. Each roll gives a different organic shape, so you can keep going until one feels right and copy the markup.

## How a wave is built

A wave divider is the same idea flattened into a band. It's a path that traces a smooth curve across the top (or bottom) of a rectangle and closes off the remaining area, so the filled region has one wavy edge:

```xml
<svg viewBox="0 0 1440 120" preserveAspectRatio="none">
  <path fill="#0ea5e9" d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,48 L1440,120 L0,120 Z"/>
</svg>
```

Two details make waves work as full-width dividers. First, `preserveAspectRatio="none"` lets the SVG stretch horizontally to any screen width without distorting the height: essential for a divider that must span the viewport. Second, the wave's fill color should match the section *below* it, so the curve reads as the upper section flowing into the lower one. The [SVG wave generator](/svg-wave-generator) handles the amplitude, frequency, and flip (top vs. bottom edge), and outputs a stretch-ready path: far faster than nudging control points by hand.

## Dropping them into a layout

### Blobs behind content

Place the blob absolutely, behind your content, and let it bleed off the edge:

```css
.hero { position: relative; }
.hero .blob {
  position: absolute; inset: auto -10% -10% auto;
  width: 40%; z-index: 0;
}
.hero .content { position: relative; z-index: 1; }
```

Keep the blob subtle (a soft accent color, low contrast) so it decorates without competing with the text on top. Blobs work beautifully as a backdrop for a floating product screenshot or an avatar.

### Waves as section dividers

Sit the wave SVG at the boundary between two colored sections, full width, with `display:block` to kill the inline-element gap:

```css
.wave { display: block; width: 100%; height: 120px; }
```

Because it stretches with `preserveAspectRatio="none"`, one path covers every screen size from phone to ultrawide. Flip it vertically for a bottom divider and you've bookended a section with matching curves.

## Recoloring and theming

Since a blob or wave is a single-fill path, theming is trivial. Give the path `fill="currentColor"` and it inherits the surrounding text color, so a dark-mode switch recolors it for free. Or store a couple of variants and swap them. This is a genuine advantage over raster shapes, which you'd have to re-export for every color.

## Performance and accessibility notes

These shapes are cheap, but a few habits keep them clean:

- **Inline decorative shapes, and mark them `aria-hidden="true"`.** A blob or wave carries no information for a screen reader, so hide it from the accessibility tree.
- **Optimize the path.** Generators can emit high-precision coordinates you don't need. Run the output through the [SVG minifier](/svg-minifier) to trim decimals and drop metadata: see [reducing SVG file size](/blog/how-to-reduce-svg-file-size) for the safe settings. A blob path often halves.
- **Don't over-animate.** A slowly morphing blob is a lovely touch, but stacking many animated SVGs can tax lower-end devices. Use motion sparingly and respect `prefers-reduced-motion`.

## Using them as CSS backgrounds

If you'd rather not add markup to your HTML, both shapes work as CSS backgrounds via a data URI. Wrap the SVG, escape it correctly, and set it as `background-image`: the full escaping walkthrough is in [using SVG as CSS backgrounds](/blog/using-svg-as-css-backgrounds), and the [SVG to CSS tool](/svg-to-css) generates the property for you. This is handy for waves you want to sit behind content without an extra DOM node.

## One path, endless shapes

Blobs and waves look like fussy custom illustration, but they're just single SVG paths, scalable, tiny, and recolorable with one attribute. Generate the shape you want in the [blob generator](/svg-blob-generator) or [wave generator](/svg-wave-generator), optimize it, and inline or background it into your layout. You get the soft, modern, organic look that flat rectangles can't, with none of the weight or blur of a raster image.

## What the generator hands you

Everything the [blob generator](/svg-blob-generator) produces is a single `<path>` element: one `d` attribute describing the whole organic shape. That is the entire trick, and it is why the output is tiny, scales to any size, and recolours with one `fill` change. Randomise until a shape feels right, then take the markup. There is no runtime, no script and no dependency in what you paste.

## Sources

- [Web audio codec guide (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs)
- [Web Audio API (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
