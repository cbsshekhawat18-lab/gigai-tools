---
title: "SVG Data URIs Explained: Inlining Vectors the Efficient Way"
description: "What an SVG data URI is, why URL-encoding beats base64 for vectors, and how to inline SVG into CSS and HTML without an extra request, plus when NOT to inline."
date: "2026-07-22"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "svg-to-data-uri"
category: "svg-tools"
tags: ["svg", "data-uri", "base64", "performance", "css"]
featured: false
---

A data URI lets you embed an entire file *inside* another file. No separate download, no extra HTTP request. For SVG, this is especially powerful, because a vector graphic is already just a short block of text. Inlining a small icon as a data URI means it paints the instant the stylesheet or HTML arrives, instead of waiting on its own round trip. But there's a right way and a wasteful way to do it, and the difference (base64 versus URL encoding) can change your file size by 30% or more. This guide explains what a data URI is, how to build one for SVG efficiently, and the cases where you should *not* inline at all.

## What a data URI actually is

A normal URL points somewhere: `url("/icons/check.svg")`. A data URI *is* the content, encoded into the URL string itself. Its anatomy:

```
data:[<media-type>][;base64],<encoded-data>
```

For SVG the media type is `image/svg+xml`, and the encoded data is your markup. Put together, a minimal example looks like:

```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'.../%3E
```

The browser reads that string, recognizes it as an image, decodes the markup, and renders it. Never touching the network. Anywhere a URL works (a CSS `background-image`, an `<img src>`, a `mask-image`), a data URI works too.

## Base64 vs. URL encoding. This is the important part

There are two ways to encode the SVG into the URI, and for vectors they are *not* equivalent.

**Base64** re-encodes the bytes into a compact alphabet. It's the default many tools reach for, and it always works:

```css
background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0i...");
```

The problem: base64 inflates data by roughly 33%. It also makes the string completely opaque. You can't read or tweak a color without re-encoding the whole thing. For binary formats like PNG that's an acceptable trade, but SVG is *text*, so base64 is the wrong tool.

**URL (percent) encoding** keeps the SVG mostly readable and, crucially, is usually *smaller* than base64 for SVG, because it only escapes the handful of characters that need it:

```css
background: url("data:image/svg+xml,%3Csvg xmlns='...'%3E...%3C/svg%3E");
```

For SVG, prefer URL encoding almost every time. It produces a leaner string and one you can eyeball. The broader base64-vs-raw trade-off is covered in [base64 vs binary](/compare/base64-vs-binary) if you want the general picture.

## The encoding rules that trip people up

URL-encoding SVG by hand fails in the same three ways for everyone:

1. **The `#` in hex colors.** `fill="#3366ff"` must become `%23...`, an unescaped `#` truncates the URI and silently breaks the whole image. This is the number-one cause of "my SVG data URI shows nothing."
2. **The namespace is mandatory.** The `xmlns='http://www.w3.org/2000/svg'` attribute *must* be present. Inline `<svg>` in HTML forgives its absence. A data URI does not.
3. **Quote nesting.** Use single quotes inside the SVG so the outer CSS `url("...")` can use doubles, and encode any stray `<`, `>`, and `%`.

Because these are easy to miss, don't hand-encode. Paste your markup into the [SVG to Data URI tool](/svg-to-data-uri). It URL-encodes correctly, handles the `#`, and gives you a paste-ready string. Going the other direction, when you've inherited a data URI and need to edit the actual shape or color, the [Data URI to SVG tool](/data-uri-to-svg) decodes it back into clean, editable markup.

## Where to use an inlined SVG

**In CSS backgrounds.** The classic case: small icons, dot grids, wave dividers embedded straight into a rule so they render on first paint. The full escaping and patterns walkthrough is in [using SVG as CSS backgrounds](/blog/using-svg-as-css-backgrounds).

**In `<img>` tags.** `<img src="data:image/svg+xml,...">` works, though for markup you control it's often simpler to inline the raw `<svg>` element directly into the HTML instead.

**In custom properties.** Storing icon data URIs in CSS variables (`--icon-x: url(...)`) gives you a lightweight, no-build icon system, swap the variable, swap the icon, no sprite sheet.

## When NOT to inline

Data URIs are a scalpel, not a hammer. Inlining the wrong things hurts performance instead of helping:

- **Large or complex SVGs.** A detailed illustration inlined into your CSS bloats the stylesheet, which every page then downloads, even pages that never show the graphic. Big or rarely-used SVGs belong in their own cacheable file.
- **Reused-everywhere graphics.** An external file is cached once and reused across every page. An inlined copy is re-sent inside every file that embeds it. If the same logo appears site-wide, an external SVG (or a sprite) usually wins.
- **Anything you'll update often.** Editing an inlined data URI means touching every file it lives in. An external file updates in one place.

The rule of thumb: **inline small, static, single-use SVGs** to save a request. **Externalize large, shared, or changing ones** to benefit from caching. A dot-grid background, inline it. A 40 KB detailed illustration used on one page, external file.

## Keep the payload small first

Whatever you inline rides inside another file, so trim it before encoding. Strip editor metadata and reduce coordinate precision so you're not baking a bloated Figma export into your CSS. The [SVG minifier](/svg-minifier) does this in one pass, and [how to reduce SVG file size](/blog/how-to-reduce-svg-file-size) explains the safe settings. A leaner SVG makes a leaner data URI, which makes a lighter stylesheet.

## Putting it together

The efficient workflow is short: optimize the SVG, URL-encode it (not base64) with the [SVG to Data URI tool](/svg-to-data-uri), and inline the result *only* if the graphic is small, static, and used in one place. Do that and you get a vector that paints instantly, scales perfectly, and edits as plain text, the request you didn't make being the fastest request of all.

## Round-tripping, both directions

Both directions of this conversion live here as tools: [SVG to data URI](/svg-to-data-uri) for inlining, and [data URI to SVG](/data-uri-to-svg) for the day you find a URI in a stylesheet and need the editable file back. The decoder tolerates the mess real stylesheets wrap around a URI (url() wrappers, quotes, charset markers) rather than demanding a pristine string. Every conversion is local string processing in your browser. Nothing is fetched or sent.

## Sources

- [SVG (MDN Web Docs)](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [SVGO](https://github.com/svg/svgo)
