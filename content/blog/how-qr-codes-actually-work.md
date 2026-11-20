---
title: "How QR Codes Actually Work: Modules, Finder Patterns, and Data Explained"
description: "A clear, non-technical look at how QR codes actually work, the black-and-white grid, the three big corner squares, and how a phone turns pixels into a link."
date: "2026-07-02"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "qr-code-generator"
category: "qr-tools"
tags: ["how-it-works", "qr codes", "encoding", "technology"]
featured: true
---

A QR code looks like static, a chaotic square of black and white specks. But there is nothing random about it. Every one of those specks is placed by rules, and once you understand the rules, the "magic" of pointing your phone at a poster and instantly opening a website stops being mysterious. This is a plain-language tour of what is actually inside that little square, and why it can be scanned upside down, from an angle, or with a coffee stain across the corner and still work.

## The grid: it's all modules

The first thing to know is that a QR code is a grid of squares called **modules**. Each module is either dark or light. That's it. There is no colour information, no shading, no hidden layers. The entire message is encoded in the pattern of dark and light squares, the same way any digital file is ultimately ones and zeroes.

The size of the grid is measured in modules per side, and it comes in fixed steps called **versions**. Version 1 is a 21×21 grid. Each step up adds four modules to each side: version 2 is 25×25, version 3 is 29×29, all the way up to version 40 at a dense 177×177. The more data you want to store, the bigger the version the code needs. This is why a QR code holding a long URL looks visibly "busier" than one holding a short one. It literally has more modules to work with. When you [generate a QR code](/qr-code-generator), the tool automatically picks the smallest version that fits your data, so you never see this choice, but it's happening behind the scenes.

## The three big squares: finder patterns

Look at any QR code and you'll notice three identical large squares in three of the four corners: a solid dark square inside a ring. These are **finder patterns**, and they are the single most important part of the design.

Their job is orientation. A scanner doesn't know which way up your phone is holding the code, whether it's tilted, or how far away it is. But those three big squares have a very specific dark-light-dark-light-dark ratio (1:1:3:1:1) that almost never occurs by accident in a real-world scene. The camera software sweeps the image looking for that ratio, finds it in three spots, and instantly knows: *there's a QR code here, and these three points define three of its corners.*

Three corners is enough to work out the fourth, calculate the tilt, and mathematically "flatten" the image back into a clean square, even if you photographed it at 30 degrees. This is why QR codes are so forgiving of bad angles and awkward lighting. The finder patterns do the heavy lifting before a single byte of data is read.

## Timing, alignment, and quiet zones

A few other structural features keep everything lined up:

- **Timing patterns** are the dashed lines of alternating dark and light modules that run between the finder patterns. They act like a ruler, telling the scanner exactly where each row and column of the grid falls, so it can count modules accurately even in a slightly warped photo.
- **Alignment patterns** are the smaller square rings you'll see scattered through larger codes. They correct for distortion in the middle of the grid, where finder patterns alone aren't enough.
- The **quiet zone** is the empty margin of blank space around the whole code. It needs to be at least four modules wide. Crowd a QR code right up against text or a busy background and scanners struggle to tell where the code ends: a common reason a design "just won't scan."

That last point matters a lot in real print work, which is why [sizing and margins deserve their own guide](/blog/best-qr-code-size-for-print).

## Turning a link into dots: encoding

So how does "https://example.com" become a pattern? In stages.

First, the text is converted into a stream of bits using an **encoding mode**. QR codes have several modes optimised for different content: a numeric mode (most efficient, digits only), an alphanumeric mode (digits, uppercase letters, and a few symbols: perfect for many URLs), and a byte mode (any character, including lowercase and international text). The code stores which mode it used and how many characters follow, then the data itself.

That bitstream is then laid into the grid in a specific zig-zag order, filling modules from the bottom-right corner upward and snaking across, skipping over the finder patterns and other reserved areas. Finally, a **mask** is applied: a mathematical pattern XORed over the data to break up large blank areas and long runs of identical modules, which would otherwise confuse scanners. The encoder tries several masks and keeps whichever produces the most balanced, scannable result.

## Why a damaged code still scans: error correction

Here's the genuinely clever part. A QR code doesn't just store your data. It stores *extra* data using Reed–Solomon error correction, the same family of maths used on CDs and in deep-space communication. This redundancy lets a scanner reconstruct the original message even when part of the code is missing or unreadable.

There are four levels of protection (L, M, Q, and H) recovering roughly 7%, 15%, 25%, and 30% of the code respectively. This is exactly why you can [place a logo in the middle of a QR code](/blog/how-to-add-a-logo-to-a-qr-code) without breaking it: the logo covers modules that error correction can simply rebuild from the redundant data. It's also why a code survives a scratch, a fold, or a smudge. If you want the full breakdown of when to raise or lower this level, we cover it in [error correction levels explained](/blog/qr-code-error-correction-levels-explained).

## Putting it together in one scan

When you point a camera at a QR code, all of this happens in a fraction of a second:

1. The software spots the three finder patterns and locks onto the code.
2. It uses those points plus the timing and alignment patterns to correct for tilt and distortion.
3. It reads every module as a dark or light bit.
4. It removes the mask, reassembles the bitstream, and runs error correction to fix any damaged sections.
5. It decodes the mode and character count, and out comes your original text, a URL, some plain text, Wi-Fi details, whatever was stored.

The phone then acts on it, usually by offering to open the link. If you're ever curious what a mystery code contains before you trust it, you can paste an image into a [QR code decoder](/qr-code-decoder) and read the raw contents safely.

## Generation and reading are two different crafts

Building our QR tools taught me that writing and reading codes share a spec but almost no code. The [generator](/qr-code-generator) wraps a rendering engine (qr-code-styling) that quietly makes the decisions described above: it picks the smallest version that fits your data and applies the masking rules, so you never see either choice. The [scanner](/qr-code-scanner) is a different library entirely, a decoder called jsQR that does the finder-pattern hunt and the Reed-Solomon repair on real pixels. One detail I like: our decoder attempts both polarities, so it can read a light-on-dark code that many phone camera apps give up on. The honest limits: it reads one code per image, and it wants a reasonably flat, sharp photo. A blurry snapshot of a curved bottle defeats the geometry long before error correction gets a chance to help.

## Why the anatomy matters when you build one

A QR code is not a picture of a link: it's a self-correcting, self-orienting data grid with built-in redundancy, designed so a cheap camera can read it in poor conditions. Understanding the pieces (modules, finder patterns, encoding, error correction) makes you far better at *making* them: you'll know why margins matter, why a logo doesn't have to break anything, and why some codes look denser than others.

Ready to make one? Try our free [QR code generator](/qr-code-generator). It handles all the version, mask, and error-correction decisions for you, so you just type your link and download a clean, scannable code.

## Sources

- [QR code (Wikipedia)](https://en.wikipedia.org/wiki/QR_code), modules, finder patterns and versions
- [Reed–Solomon error correction (Wikipedia)](https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction)
