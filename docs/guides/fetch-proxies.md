---
description: How the GigAI Tools SEO and GEO tools read a live URL through a stateless fetch proxy, as a Cloudflare Worker or a Node service, and how to deploy it with SSRF protection.
---

# The fetch proxies

A browser cannot read another site's page directly: CORS blocks it. The SEO and GEO tools that check a live URL therefore ask a small proxy to fetch the page and hand it back. The proxy stores nothing. Pasted HTML never reaches it.

## The JSON proxy: `cloudflare/social-fetch`

This repository has one proxy in two forms, with the same behaviour:

- `worker.js`, a Cloudflare Worker (free tier, no server of your own).
- `server.mjs`, a Node 18+ service for your own server, on `127.0.0.1:$PORT` (default 8787) behind a reverse proxy.

Both answer `GET /?url=<address>` with JSON: `ok`, `status`, `finalUrl`, `redirected`, the response `headers` and the `html`. Both refuse (403) requests that come from neither an origin in `ALLOWED_ORIGINS` nor a page under `SITE_PREFIX`, set at the top of each file; edit both for your domain. Both cap a response at 3 MB and a fetch at 12 seconds. `server.mjs` also resolves each hostname and refuses private and local addresses, and follows redirects one at a time (at most 5), checking each.

Point the site at it with `NEXT_PUBLIC_INSPECTOR_PROXY`, for example `/api/social-fetch` when your reverse proxy maps that path to `server.mjs`, then rebuild the site. [`cloudflare/social-fetch/README.md`](https://github.com/cbsshekhawat18-lab/gigai-tools/blob/main/cloudflare/social-fetch/README.md) covers the Worker deploy.

## The plain-text proxy: `/api/fetch`

`lib/seo-tools/fetch-url.ts` tries the JSON proxy first and falls back to a same-origin `/api/fetch?url=<address>`, which returns the page body as text. The News Sitemap Generator uses `/api/fetch` directly.

The `/api/fetch` service that gigai.tools runs is not in this repository yet. Without it, those requests fail with a readable message and the tools still accept pasted input. With the JSON proxy configured, every tool except the News Sitemap Generator can read a URL.

## Without a proxy

Every SEO and GEO tool works on pasted HTML with no proxy at all. Only the "enter a URL" option needs one.
