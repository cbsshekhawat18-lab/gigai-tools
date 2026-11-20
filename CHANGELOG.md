# Changelog

GigAI Tools runs at [gigai.tools](https://gigai.tools), which is deployed from `main`. Each tool also keeps its own dated changelog in its `config/tools/` entry, shown on its page.

## 0.1.0 (2026-11-20)

The first public release of the code behind gigai.tools.

- **273 tools in 13 categories**, from the registry in `config/tools/`, with 9 workspaces that chain tools on one file and a generated [tool reference](docs/tools/index.md).
- **The backend** (`backend/`): Video to Work analysis, GigAI Verify, IconLab's AI composer, newsletter sign-up and the optional LibreOffice converter. Each feature stays off until its setting is present.
- **The developer API** (`backend/app/v1/`) with accounts, API keys, jobs, webhooks, site audits and poster pages, mounted when `GIGAI_API_JWT_SECRET` is set, and its **task worker** (`worker/`).
- **PDF repair** (`backend/app/pdf_repair/`) as an optional AGPL-3.0 module, off by default.
- **Settings instead of hard-coded values**: AdSense, Bing verification, the contact form endpoint and the Video to Work demo now come from `NEXT_PUBLIC_*` settings, so a fresh clone loads no ads or analytics. The cookie consent banner appears only when analytics or ads are configured.
- **No silent upload in Word to PDF and PDF to Word**: the server converter is tried only when `NEXT_PUBLIC_SERVER_CONVERT=true`.
- **The ffmpeg.wasm core is installed, not committed**: `scripts/copy-ffmpeg.mjs` copies it from `node_modules` on install and before each build.
- **Documentation** in `docs/`, example server files in `ops/`, and Docker files for the website and the backend.
