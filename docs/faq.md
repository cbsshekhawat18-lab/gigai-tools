---
description: Answers about GigAI Tools - whether files are uploaded, using it without the backend, licenses, the developer API, forking and rebranding, and how to report a problem.
---

# FAQ

## What is GigAI Tools?

An open-source collection of 273 free file and developer tools that run in your browser: PDF, image, video, audio, QR, SVG, SEO and developer utilities. It is the code behind [gigai.tools](https://gigai.tools).

## Are my files uploaded?

For 241 of the 273 tools, no: the engine runs in your browser and the file never leaves it. 29 SEO and GEO tools fetch a URL through a proxy when you give them one, and 3 tools use the backend for one part. [What runs where](privacy-model.md) lists them and what the server keeps.

## Does it work offline?

After a tool has loaded once, most browser tools keep working offline, because the service worker caches the site. Tools that download a model on first use (speech to text, OCR) need the network that first time.

## Can I run it without the backend?

Yes. The browser tools need only the static site. Video to Work analysis, GigAI Verify, IconLab's AI composer, PDF repair and the developer API need the backend, and say so when it is missing.

## Which license is it under?

The Apache License 2.0, except `backend/app/pdf_repair/`, which is AGPL-3.0-or-later because it uses PyMuPDF. That folder is optional and off by default. Third-party components are listed in [THIRD_PARTY_NOTICES.md](https://github.com/cbsshekhawat18-lab/gigai-tools/blob/main/THIRD_PARTY_NOTICES.md).

## Can I use it for my own site?

Yes, under the license. A copy you run publicly must use its own name and logo, not GigAI's. [TRADEMARKS.md](https://github.com/cbsshekhawat18-lab/gigai-tools/blob/main/TRADEMARKS.md) lists the files to change.

## Is the developer API production-ready?

It runs gigai.tools' API today, on one server with PostgreSQL. It has no horizontal scaling, its queue is a database table, and files are stored on local disk. That suits small installs.

## Why is ffmpeg not in the repository?

The ffmpeg.wasm core is GPL-2.0-or-later, so it is not committed to this Apache-2.0 repository. npm installs it, and `scripts/copy-ffmpeg.mjs` copies it into `public/ffmpeg/` when you install and before each build.

## How do I report a bug?

Open an [issue](https://github.com/cbsshekhawat18-lab/gigai-tools/issues/new/choose) with the tool, your browser and, if you can share it, a file that fails. Report security problems privately: see [Security](security.md).
