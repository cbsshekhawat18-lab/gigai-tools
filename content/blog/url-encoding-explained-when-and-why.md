---
title: "URL Encoding Explained: When and Why to Percent-Encode"
description: "Understand URL percent-encoding, which characters need escaping, why spaces become %20, and the crucial difference between encoding a component and a full URL."
date: "2026-07-17"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["url-encoding", "percent-encoding", "web", "http", "query-strings"]
featured: false
---

You've seen it a thousand times: a link where a space became `%20`, an ampersand turned into `%26`, or a whole search query dissolved into a trail of percent signs. That's **URL encoding**, and understanding it saves you from a specific, maddening category of bug where links break, query parameters get truncated, or search terms come back wrong. This guide explains what percent-encoding is, which characters need it and why, and the single most important distinction, encoding a *component* versus a *full URL*. Follow along with the [URL encoder](/url-encoder) and [URL decoder](/url-decoder) to see any string transform in real time.

## Why URLs need encoding at all

A URL is a compact, structured string, and it uses certain characters as **structure**: `?` starts the query, `&` separates parameters, `=` splits key from value, `/` divides path segments, `#` marks a fragment. These are called *reserved* characters because they carry special meaning.

Now imagine one of your *data* values legitimately contains one of those characters. A search for `salt & pepper` includes an `&`. If you drop that straight into a query string:

```
https://example.com/search?q=salt & pepper&sort=asc
```

The browser or server can't tell your data's `&` from a real parameter separator. It reads `q=salt `, then a mystery parameter ` pepper`, then `sort=asc`. Your query is mangled. The space is a problem too: spaces aren't allowed in URLs at all.

**Percent-encoding** solves this by replacing any problematic character with a `%` followed by its two-digit hexadecimal byte value. The space becomes `%20`, the ampersand becomes `%26`, and now the structure is unambiguous:

```
https://example.com/search?q=salt%20%26%20pepper&sort=asc
```

The server decodes `%26` back into a literal `&` inside the value, and everything works.

## Which characters get encoded

Characters fall into three buckets:

- **Unreserved**: letters `A–Z a–z`, digits `0–9`, and `- _ . ~`. These are always safe and never need encoding.
- **Reserved**, `: / ? # [ ] @ ! $ & ' ( ) * + , ; =`. These have structural meaning and must be encoded when they appear as *data* rather than structure.
- **Everything else**: spaces, non-ASCII letters (accents, emoji, other scripts), and control characters. These are always encoded. Non-ASCII text is first turned into UTF-8 bytes, then each byte is percent-encoded, which is why a single accented character can become several `%XX` pairs.

A few you'll meet constantly:

| Character | Encoded |
|---|---|
| space | `%20` (or `+` in query strings) |
| `&` | `%26` |
| `=` | `%3D` |
| `?` | `%3F` |
| `#` | `%23` |
| `/` | `%2F` |

That space-becomes-`+` quirk trips people up: in the *query string* of form submissions, a space is often encoded as `+` instead of `%20`. Both decode back to a space in that context, but they aren't interchangeable everywhere. In a path segment, `+` stays a literal plus. When in doubt, run the string through the [URL encoder](/url-encoder) and see exactly what you get.

## The critical distinction: component vs. full URL

This is the part that causes real bugs. There are two levels of encoding, and using the wrong one breaks things.

**Encoding a component** means encoding a single *piece* of the URL (one query value, one path segment) where reserved characters must all be escaped because they're pure data. In JavaScript this is `encodeURIComponent()`. It encodes `&`, `=`, `?`, `/`, and the rest, because inside a single value none of those should keep their structural meaning.

**Encoding a full URL** means lightly encoding an already-assembled URL while *preserving* its structure. In JavaScript this is `encodeURI()`. It leaves `: / ? & =` alone because those are doing their structural job.

The rule of thumb:

- Building a URL from pieces? Encode **each piece** with component-level encoding, then join them with the reserved characters yourself.
- Cleaning up a complete URL that already has its structure? Use full-URL encoding.

Getting this backwards is the classic mistake. If you full-URL-encode a value that contains an `&`, the `&` survives unescaped and splits your parameter. If you component-encode an entire URL, every `/` and `?` gets escaped and the link stops working. When you're not sure which a given string needs, paste it into the [URL encoder](/url-encoder), toggle between the two modes, and the difference becomes obvious.

## Encoding is reversible, and that matters

Unlike [hashing](/blog/how-to-hash-data-with-sha-256), which is a one-way transformation, encoding is fully **reversible**: every encoded string can be decoded back to the original. That is all there is to it, the receiver decodes it to recover your exact data. Base64 works on the same reversible principle for binary data. Our comparison of [Base64 vs. binary](/compare/base64-vs-binary) is a useful companion if you're moving non-text data through URLs or APIs. Just remember: encoding is *not* encryption. Anyone can decode it. Never rely on URL encoding to hide sensitive values. Use the [URL decoder](/url-decoder) yourself and you'll see how trivially the original comes back.

## Practical tips

- **Encode at the boundary.** Encode values right when you build the URL, and decode right when you read them, don't let half-encoded strings float through your code.
- **Never double-encode.** Encoding an already-encoded string turns `%20` into `%2520`. If your spaces show up as `%2520` in the final URL, something encoded twice.
- **Let the platform do it.** Use your language's built-in functions (`encodeURIComponent`, `urllib.parse.quote`, etc.) rather than hand-rolling replacements. They handle UTF-8 and edge cases correctly.
- **Verify visually.** For quick checks or debugging a broken link, the [URL encoder](/url-encoder) and [URL decoder](/url-decoder) let you see exactly what's happening to each character.

## Try it on real strings, locally

The fastest way to build intuition here is to encode real strings and read the output. The [URL encoder](/url-encoder) runs the browser's own `encodeURIComponent`/`encodeURI` functions on your text, locally, with both modes side by side so the component-versus-full-URL distinction from this guide stops being abstract. Query strings often contain tokens and personal data, which is exactly why the tool does not send yours anywhere.

## Wrapping up

URL encoding exists to keep your *data* from being mistaken for the URL's *structure*. Learn which characters are reserved, remember that spaces become `%20` (or `+` in query strings), and above all keep the component-versus-full-URL distinction straight. That one idea prevents most encoding bugs. Try a few strings in the [URL encoder](/url-encoder), and while you're sharpening the fundamentals, [understanding Unix timestamps](/blog/understanding-unix-timestamps) and [hashing data with SHA-256](/blog/how-to-hash-data-with-sha-256) cover the other small primitives that quietly power the web.
