---
title: "QR Code Error Correction Levels Explained: L, M, Q, and H"
description: "What QR code error correction levels L, M, Q, and H actually mean, how much damage each survives, and the real trade-off between logos, density, and reliability."
date: "2026-07-13"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
tool: "qr-code-generator"
category: "qr-tools"
tags: ["error correction", "qr codes", "how-it-works", "reliability"]
featured: true
---

Somewhere in the settings of every decent QR generator sits a little option labelled "error correction" with four choices: L, M, Q, and H. Most people leave it on the default and never think about it. But that single setting quietly decides whether your code survives a scratch, whether you can drop a logo in the middle, and how dense the code looks. Understanding it turns a mystery slider into a deliberate design decision.

## What error correction actually does

A QR code doesn't only store your data. It stores **redundant copies of that data**, encoded with a technique called Reed–Solomon error correction (the same maths used on CDs, DVDs, and spacecraft transmissions). This redundancy means a scanner can reconstruct the original message even when part of the code is unreadable, smudged, scratched, folded, or covered.

Think of it like sending a message with built-in spare parts. If some of the message gets destroyed in transit, the receiver uses the spares to rebuild it exactly. The more spares you include, the more damage you can survive, but the longer the message gets. That trade-off is the whole story of L, M, Q, and H. (If you want the surrounding context of modules and finder patterns, see [how QR codes actually work](/blog/how-qr-codes-actually-work).)

## The four levels

Each level recovers a different percentage of the code if it's damaged:

| Level | Name | Data recoverable | Redundancy cost |
|---|---|---|---|
| **L** | Low | ~7% | Smallest, densest code |
| **M** | Medium | ~15% | Slightly larger |
| **Q** | Quartile | ~25% | Larger still |
| **H** | High | ~30% | Largest, most robust |

The percentage is roughly how much of the code's area can be missing or corrupted while the scanner still reads the full message. At level H, nearly a third of the code can be obscured and it will still work, which sounds almost unbelievable until you remember it's paying for that with extra redundant data.

## The trade-off nobody explains clearly

Here's the catch, and it's the key insight: **more error correction means more data, which means a bigger, denser code for the same URL.**

That extra redundancy has to go somewhere. To fit it, the code either uses a higher version (a larger module grid) or packs modules more tightly. The result is a busier-looking code with smaller individual modules. And smaller modules are *harder* to scan when the code is printed small or viewed from a distance.

So there's a genuine tension:

- **Higher correction (H)** = survives more damage, but is denser, so each module is smaller at a given physical size.
- **Lower correction (L)** = cleaner, less dense code with larger modules, but almost no tolerance for damage.

Raising error correction is not automatically "safer." If you push to H *and* print the code tiny, you can end up with modules so small they scan *worse* than a level-M code would have. The right level depends on how the code will be used, which is also why [print size and scan distance](/blog/best-qr-code-size-for-print) can't be decided independently of this setting.

## Which level to choose

Here's practical guidance rather than a blanket "always use H":

**Use L or M for clean digital and controlled print.** If the code lives on a website, in a PDF, or on a crisp printed page that won't get handled roughly, low or medium correction keeps the code less dense and easier to scan at small sizes. M is a sensible everyday default.

**Use Q or H when the code faces real-world abuse.** Packaging that gets scuffed, outdoor signage exposed to weather, labels that get handled: the extra recovery is worth the density. Q is a solid middle ground. H is for the harshest conditions.

**Use H whenever you add a logo.** This is the big one. Placing a [logo in the centre of a QR code](/blog/how-to-add-a-logo-to-a-qr-code) covers real data modules, and it's error correction that rebuilds them. Level H's ~30% recovery budget is what lets a centred logo of around 20–25% of the area coexist with a reliable scan. With L or M, the same logo would likely break the code. Our [QR code with logo](/qr-code-with-logo) tool defaults to high correction for exactly this reason.

## A worked example

Say you're branding a code for product packaging with your logo in the middle.

- Set error correction to **H**. The logo will cover roughly a fifth of the code. H's recovery budget absorbs that loss.
- Keep the logo **clear of the three corner squares**: error correction can't save a covered finder pattern, because those aren't data, they're how the scanner *locates* the code.
- Because H makes the code denser, **print it large enough** that individual modules stay crisp. A dense code shrunk too far is the classic reason a "should-work" code fails.

Balance all three (correction level, logo size, and physical print size) and you get a branded code that shrugs off scuffs and scans first time.

## Common mistakes

- **Cranking to H and printing tiny.** Density plus small size equals tiny modules. Either raise the print size or drop to a lower level.
- **Assuming H protects a covered corner.** It doesn't. Finder patterns are structural, not data. A logo over a corner kills any code.
- **Using L with a logo.** Almost guaranteed failure, there's no recovery budget to rebuild what the logo hides.
- **Never testing.** Whatever level you choose, scan the final printed code on more than one phone before committing to a large run.

## Why our generator ships on M, not H

A note from the code: the default in our [QR code generator](/qr-code-generator) is level M, and that is deliberate. The comment beside that line calls it a sensible everyday default, because M buys 15% damage recovery without the density penalty described above. The studio then adjusts its advice as you design: add a logo and a recommendation engine kicks in, suggesting Q once the mark passes roughly 15% of the code's width and H past 20%, with a warning whenever your chosen level falls short of that. The [logo tool](/qr-code-with-logo) skips the negotiation and simply opens at H. The limit worth stating plainly: those thresholds are coverage heuristics, not a decode of your specific artwork, so an unusually shaped logo can still deserve a print test the maths did not demand.

## A dial, not a quality setting

Error correction is a dial between two goods: **damage tolerance** on one end and **a cleaner, less-dense, small-print-friendly code** on the other. Use L or M for clean, controlled uses where you want maximum scannability at small sizes. Step up to Q or H for rough real-world conditions, and always use H when a logo is involved, because that redundancy is precisely what rebuilds the modules your logo covers. Whatever you pick, match it to your print size and test on real devices.

Want to try different levels and see the density change live? Our free [QR code generator](/qr-code-generator) lets you switch correction levels and preview the result instantly. No sign-up, no watermark.

## Sources

- [QR code (Wikipedia)](https://en.wikipedia.org/wiki/QR_code), the L/M/Q/H recovery percentages
- [Reed–Solomon error correction (Wikipedia)](https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction)
