---
description: Self-host GigAI Tools - the static site on any host or nginx, the FastAPI backend with systemd, the developer API with PostgreSQL and its worker, or the site and backend with Docker.
---

# Self-hosting

Run as much or as little as you need:

| You want | You need |
|---|---|
| The browser tools | The static site only |
| Video to Work, GigAI Verify, IconLab's composer | The site and the backend |
| Tools that read a URL | The site and a [fetch proxy](guides/fetch-proxies.md) |
| The developer API | The backend, PostgreSQL and the worker |

## 1. The static site

```sh
cp .env.example .env    # set NEXT_PUBLIC_SITE_URL, and NEXT_PUBLIC_API_URL if you run the backend
npm ci
npm run build
```

Serve `out/` from any static host. On your own nginx, use the rules in `ops/nginx/static-site.conf`: `slug.html` for `/slug`, `.mjs` as JavaScript, and long caching for `/_next/static/`. [The website](guides/website.md) explains why each rule matters.

## 2. The backend

On a Linux server with Python 3.12 or later:

```sh
cd /opt/gigai-tools/backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp ../.env.example .env    # set ENV=production and CORS_ORIGINS=https://example.com
```

Install `ops/systemd/gigai-tools-api.service` (it runs uvicorn on `127.0.0.1:8000`), then route `/api/` on your site to it. Check `GET /api/health`.

## 3. The developer API and the worker

Create the database and set `GIGAI_API_JWT_SECRET` as [The developer API](guides/developer-api.md) shows. Build the worker (`cd worker && npm ci && npm run build`) and install `ops/systemd/gigai-api-worker.service`. `ops/nginx/api.conf` serves `/v1/` on `api.example.com`.

`ops/` also has a health watchdog, a disk and memory warning, and a nightly database backup; [its README](https://github.com/cbsshekhawat18-lab/gigai-tools/blob/main/ops/README.md) lists where each file goes. Every file there uses placeholders (`/opt/gigai-tools`, `example.com`, the user `gigai`); replace them with yours.

## Docker

The repository has a Dockerfile for the website (Node builds the export, nginx serves it) and one for the backend, plus a `docker-compose.yml` that runs both:

```sh
cp .env.example backend/.env   # then fill in what you use
docker compose up --build
```

The website is on <http://localhost:8080> and the backend on <http://localhost:8000/docs>. The compose file does not run PostgreSQL or the worker; add them to use the developer API. The backend image leaves out PDF repair and LibreOffice.

Pass website settings as build arguments, because they are baked in at build time:

```sh
docker build -t gigai-tools-web --build-arg NEXT_PUBLIC_SITE_URL=https://example.com .
```

## Before you go public

- Use your own name and logo. [TRADEMARKS.md](https://github.com/cbsshekhawat18-lab/gigai-tools/blob/main/TRADEMARKS.md) lists the files to change.
- Set `ENV=production` and an exact `CORS_ORIGINS` on the backend.
- If you enable PDF repair, read its [licence note](guides/pdf-repair.md#licence).
