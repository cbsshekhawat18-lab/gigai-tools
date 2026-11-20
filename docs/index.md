---
description: GigAI Tools is an open-source collection of 273 free file and developer tools that run in your browser. Documentation for using, running and self-hosting it.
---

# GigAI Tools documentation

GigAI Tools is an open-source collection of 273 free file and developer tools that run in your browser: PDF, image, video, audio, QR, SVG, SEO and developer utilities. Most tools process your files on your own device, so nothing is uploaded. The few that need a server say so on the page and delete what they receive. It is the code behind [gigai.tools](https://gigai.tools).

The code is on GitHub: [cbsshekhawat18-lab/gigai-tools](https://github.com/cbsshekhawat18-lab/gigai-tools), under the Apache License 2.0.

## Use the tools

You do not need to install anything to use a tool. Open it on [gigai.tools](https://gigai.tools), drop in your file and download the result. Each tool page explains its steps, the formats it accepts and its limits.

- [All tools](tools/index.md): every tool by category, with what it does and where it runs.
- [What runs where](privacy-model.md): which tools use a server, and what that server keeps.

## Run it yourself

- [Quickstart](quickstart.md): the website on your machine in three commands.
- [The website](guides/website.md): develop, build and host the static site.
- [The backend](guides/backend.md): the FastAPI service for the features a browser cannot do alone.
- [The developer API](guides/developer-api.md): the `/v1` API with accounts, keys and jobs.
- [The task worker](guides/worker.md): the process that runs developer API jobs.
- [The fetch proxies](guides/fetch-proxies.md): how the tools that read a URL fetch it.
- [PDF repair](guides/pdf-repair.md): the optional OCR service and its AGPL licence.
- [API clients](guides/clients.md): the Node, Python and MCP clients for the developer API.
- [Self-hosting](self-hosting.md): everything on your own server, or with Docker.
- [Configuration](configuration.md): every setting.

## Build on it

- [Architecture](architecture.md): the registry, the pages, the engines and the backend.
- [Adding a tool](adding-a-tool.md): the files a new tool needs.
- [Video to Work](video-to-work.md) and [Video Intelligence](video-intelligence.md): how the two video analysis tools work.
- [FAQ](faq.md), [Contributing](contributing.md), [Security](security.md).
