---
description: Every GigAI Tools setting - the NEXT_PUBLIC website build settings, the FastAPI backend, the developer API, account email and the task worker - with defaults and what each turns on.
---

# Configuration

All settings are environment variables. [`.env.example`](https://github.com/cbsshekhawat18-lab/gigai-tools/blob/main/.env.example) lists them with placeholders. Copy it to `.env` for the website build and to `backend/.env` for the backend and the worker. A feature whose setting is empty stays off and says so.

## Website build

`NEXT_PUBLIC_*` values are baked into the static export at build time. Rebuild after changing one.

| Setting | Default | What it does |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://gigai.tools` | Your domain: canonical links, sitemap, structured data |
| `NEXT_PUBLIC_API_URL` | `NEXT_PUBLIC_SITE_URL` + `/api` | The backend's `/api` base. When no backend answers there, the tools that need it say the feature is unavailable |
| `NEXT_PUBLIC_GA4_ID` | (unset) | Google Analytics 4; nothing loads when unset |
| `NEXT_PUBLIC_GSC_VERIFICATION` | (unset) | Google Search Console verification token |
| `NEXT_PUBLIC_BING_VERIFICATION` | (unset) | Bing Webmaster Tools verification token |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | (unset) | AdSense publisher ID (`ca-pub-...`); no ads load until it is set |
| `NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY`, `_IN_ARTICLE`, `_IN_FEED`, `_MULTIPLEX` | (unset) | The four ad unit IDs |
| `NEXT_PUBLIC_LEADS_ENDPOINT` | (unset) | Where the contact form POSTs. Unset, the form points visitors at the site's email |
| `NEXT_PUBLIC_INSPECTOR_PROXY` | (unset) | The JSON [fetch proxy](guides/fetch-proxies.md) for tools that read a URL |
| `NEXT_PUBLIC_VTW_DEMO_SAMPLE` | (unset) | URL of a Video to Work demo recording; unset hides the demo button |
| `NEXT_PUBLIC_SERVER_CONVERT` | (unset) | `true` only if the backend has LibreOffice: Word to PDF and PDF to Word then try `/api/convert` first |

## Backend

Read from `backend/.env` by `backend/app/core/config.py`. Names are case-insensitive.

| Setting | Default | What it does |
|---|---|---|
| `ENV` | `development` | `production` turns on the CORS pinning check at start-up |
| `CORS_ORIGINS` | `http://localhost:3000,https://gigai.tools` | Origins allowed to call the backend from a browser, comma-separated |
| `VERIFY_EXTENSION_IDS` | (empty) | Browser-extension IDs allowed to call GigAI Verify |
| `CORS_ORIGIN_REGEX` | (empty) | Leave empty; production refuses a pattern loose enough to admit any extension |
| `MAX_UPLOAD_MB` | `25` | Upload limit for `/api/convert` |
| `ANTHROPIC_API_KEY` | (empty) | Video to Work analysis and GigAI Verify with Anthropic models |
| `VIDEO_WORK_MODEL`, `VERIFY_MODEL` | `claude-opus-5` | The Anthropic model each uses |
| `GROQ_API_KEY` | (empty) | Video to Work's fallback model, and IconLab's AI composer |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | The Groq model |
| `VIDEO_FETCH_ENABLED` | `true` | Retrieve Loom, YouTube and Vimeo links with yt-dlp; `false` keeps uploads only |
| `VIDEO_FETCH_MAX_MB`, `VIDEO_FETCH_MAX_MINUTES`, `VIDEO_FETCH_CONCURRENCY` | `600`, `90`, `2` | Limits for retrieved videos |
| `VERIFY_MAX_TEXT_CHARS`, `VERIFY_CONCURRENCY` | `200000`, `4` | Limits for GigAI Verify |
| `PDF_REPAIR_ENABLED` | `false` | Mount [PDF repair](guides/pdf-repair.md) (AGPL-3.0, needs PyMuPDF and tesseract) |
| `GIGAI_NEWSLETTER_DIR` | `data` | Where newsletter sign-ups are stored |

## Developer API

Read by `backend/app/v1/`. The API is mounted only when `GIGAI_API_JWT_SECRET` is set.

| Setting | Default | What it does |
|---|---|---|
| `GIGAI_API_JWT_SECRET` | (required) | Signs dashboard sessions and download links. Use a long random string |
| `GIGAI_API_DSN` | `dbname=gigai_api user=gigai_api host=/var/run/postgresql` | The PostgreSQL database |
| `GIGAI_SITE_BASE` | `https://gigai.tools` | Your site's address, for links in account email and poster pages |
| `GIGAI_API_PUBLIC_BASE` | `https://gigai.tools` | Base of signed file-download URLs |
| `GIGAI_API_FILES_DIR` | `data/apifiles` | Where job files are written |
| `GIGAI_POSTER_DIR` | `data/poster` | Poster page images |
| `GIGAI_POSTER_MAX_PAGES`, `GIGAI_POSTER_MAX_TOTAL_MB` | `3`, `400` | Poster page limits per account and in total |
| `GIGAI_TOOLS_ROOT` | `../out` | The website's static export; poster pages reuse its HTML shell |
| `GIGAI_ADMIN_EMAILS` | (empty) | Accounts allowed into `/v1/admin`, comma-separated |
| `GIGAI_ALLOW_LOOPBACK_WEBHOOKS` | (unset) | Lets webhooks reach local addresses, for testing only |
| `GIGAI_AGENT_GROQ_KEY`, `GIGAI_AGENT_GEMINI_KEY` | (unset) | Models for the Ask GigAI planner (falls back to the audit keys) |
| `GIGAI_AUDIT_GROQ_KEY`, `GIGAI_AUDIT_GEMINI_KEY` | (unset) | Models for the site audit's written summary |

### Account email

| Setting | Default | What it does |
|---|---|---|
| `EMAIL_HOST`, `EMAIL_PORT` | (empty), `587` | SMTP server for verification and password-reset mail (STARTTLS) |
| `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | (empty) | SMTP login; also the sender address |

With no mail settings, new accounts are verified automatically.

## Task worker

The [worker](guides/worker.md) reads the backend's file.

| Setting | Default | What it does |
|---|---|---|
| `GIGAI_API_DSN` | (required) | The developer API database |
| `GIGAI_API_FILES_DIR` | `data/apifiles` | Where job files are written |
| `GIGAI_PDFJS_ASSETS` | (unset) | Folder with pdf.js `cmaps/` and `standard_fonts/` |
| `GIGAI_OCR_BASE` | `http://127.0.0.1:8000/api/pdf-repair` | The PDF repair service, for OCR jobs |
