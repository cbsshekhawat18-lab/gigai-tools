---
description: The GigAI Tools backend, a FastAPI service for Video to Work analysis, GigAI Verify, IconLab's AI composer, PDF repair and the developer API. Endpoints, setup, settings and tests.
---

# The backend

`backend/` is a FastAPI service (Python 3.12 or later). The website works without it; it serves the few features a browser cannot do alone.

## Run it

```sh
cd backend
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env        # then fill in what you use
uvicorn app.main:app --reload  # http://localhost:8000/docs
```

## What it serves

| Path | Feature | Needs |
|---|---|---|
| `GET /api/health` | Health check | Nothing |
| `/api/video-work/*` | [Video to Work](../video-to-work.md): analysis, and retrieving a Loom, YouTube or Vimeo link | `ANTHROPIC_API_KEY` or `GROQ_API_KEY` for analysis; yt-dlp (installed) for links |
| `/api/v1/verify/*` | GigAI Verify, the AI-or-human text check for the browser extension | `ANTHROPIC_API_KEY`; the extension IDs in `VERIFY_EXTENSION_IDS` |
| `/api/iconlab/*` | IconLab's AI composer | `GROQ_API_KEY` |
| `/api/convert/*` | Word to PDF and PDF to Word on the server | LibreOffice on the server (not in the Docker image) |
| `/api/newsletter/*` | Newsletter sign-up | A writable `GIGAI_NEWSLETTER_DIR` |
| `/api/pdf-repair/*` | [PDF repair](pdf-repair.md) (AGPL-3.0, optional) | `PDF_REPAIR_ENABLED=true`, PyMuPDF and tesseract |
| `/v1/*` | [The developer API](developer-api.md) | `GIGAI_API_JWT_SECRET` and PostgreSQL |
| `/api/tools`, `/api/categories` | A small placeholder list, not the site's registry | Nothing |

A feature whose setting is missing answers with a clear "not configured" status, and the website says so on the tool page.

## Settings

The backend reads `backend/.env` (and `../.env`). [Configuration](../configuration.md#backend) lists every setting. Set `ENV=production` on a public server: it refuses to start when `CORS_ORIGIN_REGEX` is loose enough to admit any browser extension.

## Tests

```sh
pip install -r requirements-dev.txt
python -m pytest -q tests/test_cors_pinning.py   # CORS and origin pinning
python tests/test_video_work_guards.py           # Video to Work input guards
```

## Docker

```sh
docker build -t gigai-tools-api ./backend
docker run --rm -p 8000:8000 --env-file backend/.env gigai-tools-api
```

The image installs the Python requirements only. PDF repair and LibreOffice are not in it.
