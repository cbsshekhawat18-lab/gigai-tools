# GigAI Social Fetch

A small, stateless proxy that lets the SEO and GEO tools read a live URL, which a browser cannot fetch from another site because of CORS. It fetches the page and returns its HTML and response headers as JSON. It stores nothing.

It comes in two forms with the same JSON answer:

- [`worker.js`](./worker.js): a Cloudflare Worker, on Cloudflare's free tier, with no load on your own server.
- [`server.mjs`](./server.mjs): a Node 18+ service for your own server. It also checks every resolved address against private ranges and re-checks every redirect.

Before you deploy either, set `ALLOWED_ORIGINS` and `SITE_PREFIX` at the top of the file to your site's address.

## The Cloudflare Worker

```sh
cd cloudflare/social-fetch
npx wrangler login
npx wrangler deploy
```

`wrangler.toml` routes `gigai.tools/api/social-fetch` to the Worker. Change `pattern` to your domain, which must be a zone on your Cloudflare account. To use the Worker's own `https://gigai-social-fetch.<subdomain>.workers.dev` address instead, delete the `[[routes]]` block.

In the dashboard instead: **Workers & Pages → Create → Create Worker**, paste `worker.js`, deploy, then add a route under **Settings → Triggers**.

## The Node service

```sh
PORT=8787 node cloudflare/social-fetch/server.mjs
```

It listens on `127.0.0.1` only. Map `/api/social-fetch` on your site to it in your reverse proxy, and run it under systemd or a similar supervisor.

## Test it

```sh
curl "https://example.com/api/social-fetch?url=https://example.org" -H "Referer: https://example.com/" | head -c 300
# {"ok":true,"status":200,"finalUrl":"https://example.org/","headers":{...},"html":"<!doctype html>..."}
```

## Point the site at it

Set `NEXT_PUBLIC_INSPECTOR_PROXY` to `/api/social-fetch` (same-origin route) or to the `workers.dev` address, then rebuild the site. With it unset, the tools accept pasted HTML only.

## Safety

Both forms are internet-facing fetch endpoints, so they:

- fetch only `http` and `https` addresses;
- refuse `localhost`, private, link-local and cloud-metadata hosts;
- answer only requests from the allowed origins (Origin and Referer check);
- cap the response at 3 MB and the fetch at 12 seconds;
- keep no logs and store no page content.
