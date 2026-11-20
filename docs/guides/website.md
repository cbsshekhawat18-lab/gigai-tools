---
description: Develop, test, build and host the GigAI Tools website, a Next.js 15 static export. Commands, build settings, and how to serve the out/ folder from any static host or nginx.
---

# The website

The website is a Next.js 15 app (App Router, React 19, TypeScript, Tailwind CSS v4) built as a static export. Every page is plain HTML in `out/`; there is no Node server in production.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Installs dependencies and copies the ffmpeg.wasm core into `public/ffmpeg/` |
| `npm run dev` | Development server on <http://localhost:3000> |
| `npm run build` | Static export into `out/` (copies the ffmpeg core first) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest: the engine tests in `lib/**/__tests__/` |
| `npm run lint` | ESLint through `next lint` |
| `npm run format` | Prettier |
| `npm run docs:tools` | Regenerates the [tool reference](../tools/index.md) from the registry |

The build fetches the IBM Plex fonts from Google Fonts, so it needs network access. It reads `git log` to date each page in the sitemap by its last change; without a git checkout, pages get a fixed fallback date instead.

## Settings

The site reads `NEXT_PUBLIC_*` settings from `.env` at build time and bakes them into the HTML. Change one, and rebuild. The ones you will most likely set:

- `NEXT_PUBLIC_SITE_URL`: your domain, used in canonical links, the sitemap and structured data.
- `NEXT_PUBLIC_API_URL`: where the [backend](backend.md)'s `/api` lives, if you run it.

Analytics, search verification, AdSense and the contact form endpoint are off unless set. [Configuration](../configuration.md) lists every setting.

## Hosting the static site

Upload `out/` to any static host. Two rules matter:

1. **Clean URLs.** The export writes `/merge-pdf.html` for the page `/merge-pdf`. The host must serve `slug.html` for `/slug`. Most static hosts do; with nginx, use `try_files $uri $uri.html $uri/index.html =404;`.
2. **Module workers.** pdf.js and ONNX Runtime load `.mjs` files as JavaScript modules. Serve `.mjs` as `application/javascript`, including under `/_next/static/`.

[`ops/nginx/static-site.conf`](https://github.com/cbsshekhawat18-lab/gigai-tools/blob/main/ops/nginx/static-site.conf) has both rules, plus caching for hashed assets and the service worker. The website [Dockerfile](../self-hosting.md#docker) uses it.

## The service worker

`public/sw.js` caches the site for offline use. When a deploy removes old build files, raise `VERSION` in `sw.js`, so browsers drop pages that point at files that no longer exist.
