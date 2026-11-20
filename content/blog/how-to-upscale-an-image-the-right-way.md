---
title: "How to Upscale an Image the Right Way"
description: "Enlarging a picture isn't only dragging a corner. The steps upscaling actually works, when it helps, and how to get the cleanest result from a small source."
date: "2026-07-10"
updated: "2026-08-09"
author: "Chandrabhan Shekhawat"
tool: "image-upscaler"
category: "image-tools"
tags: ["upscaling", "resolution", "how-to"]
featured: true
---

You have a photo that's too small for where you want to use it. Maybe it's a product shot that looks fine as a thumbnail but falls apart on a full-width banner. Enlarging it seems simple (just make it bigger) but do it carelessly and you get a soft, blocky mess. Done thoughtfully, upscaling can buy you the extra pixels you need without wrecking the image.

## What upscaling actually does

Every image is a grid of pixels. When you enlarge it, you're asking software to fill in a bigger grid than the one you started with. Those new pixels don't exist in the original, so they have to be **calculated** from their neighbours. How that calculation happens is the whole game.

- **Nearest-neighbour** just repeats pixels. Fast, but you get chunky, staircase edges.
- **Bilinear and bicubic** blend neighbouring pixels for smoother transitions: solid, predictable, and what most basic upscalers use.
- **Neural super-resolution** uses a trained model to reconstruct plausible detail. Much sharper results, with a caveat we'll come back to: it can invent things that were never there.

Our [image upscaler](/image-upscaler#workspace) uses the third approach, and I want to be precise about it because it's the part that determines what you should expect. It runs an **ESRGAN-slim** model through UpscalerJS and TensorFlow.js, a real neural super-resolution model, executing on your own machine via WebGL rather than on a server. Your image is processed in small overlapping tiles (64-pixel patches with a few pixels of padding) so a big photo doesn't exhaust your browser's memory, and the model weights are downloaded once and then cached for next time.

If that model can't load (an old browser, no WebGL, a flaky connection on first use) the tool doesn't fail. It quietly falls back to high-quality stepped resampling: repeated 2× canvas enlargements with smoothing at each step, which produces cleaner edges than one big jump. That path won't reconstruct detail the way the model does, but it always produces a usable file.

## Start from the best source you can find

The single biggest factor in a good enlargement is the quality of the input. Before you upscale:

1. **Hunt for the original.** A compressed copy pulled from a chat app or a website will already have lost detail. The camera original or the highest-resolution export you have will always upscale better.
2. **Skip the screenshots.** A screenshot of an image is a downscaled, re-compressed version. Find the real file instead.
3. **Fix problems first.** If the image needs [cropping](/crop-image), do that *before* upscaling so you're not spending model time on pixels you'll throw away.

There's a particular reason to care about JPEG artifacts here. A neural model has no way to know that the faint blocky ringing around an edge is compression damage rather than real texture, so it enlarges and sharpens the damage right along with everything else. Feeding it a clean source isn't only good practice. It's the difference between crisp detail and crisply rendered artifacts.

## Choose 2x when you can, 4x when you must

More enlargement isn't always better. Each original pixel has to stretch to cover more space, so fine detail spreads out and softens.

- **2x** doubles each dimension and is the safest choice. A 1000×1000 image becomes 2000×2000 while staying crisp.
- **4x** quadruples each dimension and reaches much bigger sizes, but expect a softer look, especially on already-imperfect sources.

A good habit: run both, put them side by side, and keep whichever looks right at the size you'll actually display it.

2x and 4x aren't the same model doing more work, either, they're two separately trained models, and the tool loads whichever one you pick. That's worth knowing because it means 4x isn't "2x applied twice". It's a model trained specifically for that jump, which is why running both and comparing is genuinely worth thirty seconds.

## Set honest expectations

This is where neural upscaling needs a more careful description than "it makes things sharper", because it does something subtler and you should know which parts to trust.

A model like ESRGAN has seen an enormous number of image pairs (the same picture small and large) and has learned what kinds of detail typically sit at the fine scale. When it enlarges your photo it is **reconstructing detail that is statistically plausible**, not recovering detail that was recorded. The distinction rarely matters for a product shot or a landscape, where plausible and true look identical. It matters a great deal elsewhere:

- It **won't** rescue a blurry or out-of-focus photo. Motion blur enlarged by a neural model becomes confidently rendered nonsense rather than honest blur.
- It **won't** reliably recover text or faces that were never captured clearly. It will produce *something* legible-looking, and that something may be wrong. Never upscale a licence plate, a serial number or a signature and then treat the result as evidence of what was there.
- It **will** give you a genuinely sharper, larger image for ordinary photographic subjects, well beyond what smoothing alone can do.

The old rule "upscaling adds pixels, not information" is still the right instinct. A neural model just makes the added pixels far more convincing, which is exactly why it deserves more scepticism, not less, on anything that matters.

## A quick workflow

1. Locate the highest-quality original.
2. Crop and clean it up first.
3. Upscale at 2x, check the result at full size.
4. Only reach for 4x if you genuinely need the extra dimensions.
5. Export as PNG for lossless detail, or WebP/JPG for a lighter web file.

Get those steps right and upscaling stops being a gamble: you'll know what the model is good at, where it's guessing, and which of those two you're relying on. That's a more useful thing to walk away with than a magic button.

Related reading: [enlarging photos without turning them blurry](/blog/enlarge-photos-without-turning-them-blurry) covers the same ground from the failure side, [upscaling for print vs web](/blog/upscaling-images-for-print-vs-web) is the one to read before sending anything to a printer, and if the source is small because it was badly compressed, [fixing a blurry or pixelated image](/blog/how-to-fix-a-blurry-or-pixelated-image) tackles that first.

## Sources

- [UpscalerJS](https://upscalerjs.com/), the library running the model in-browser
- [ESRGAN: Enhanced Super-Resolution Generative Adversarial Networks (arXiv:1809.00219)](https://arxiv.org/abs/1809.00219), the model architecture behind the upscaler
- [TensorFlow.js](https://www.tensorflow.org/js): the WebGL runtime executing it on your machine
- [Super-resolution imaging (Wikipedia)](https://en.wikipedia.org/wiki/Super-resolution_imaging): including the limits of what reconstruction can recover
