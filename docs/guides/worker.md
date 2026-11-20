---
description: The GigAI Tools task worker, a Node process that runs developer API jobs from a PostgreSQL queue with sharp, svgo, pdf.js and pdf-lib. Build, test, run and settings.
---

# The task worker

`worker/` runs the jobs that the [developer API](developer-api.md) queues. It is a Node 22 program, built into one file with esbuild.

## How it works

1. The API writes a job and its tasks to PostgreSQL.
2. The worker claims the next task with `SELECT ... FOR UPDATE SKIP LOCKED`, so several workers never take the same task.
3. It runs the task's engine from `worker/engines.mjs`: PDF (pdf-lib, pdf.js), image (sharp), SVG (svgo), QR, text and data conversions, and the site audit in `worker/audit/`.
4. It writes the output files to `GIGAI_API_FILES_DIR`, records usage, and sends the job's webhooks.

The engines it offers are listed in `backend/app/v1/engines.json`, the same file the API and the website read. A job that fetches a URL goes through `worker/net-guard.mjs`, which resolves every hostname and refuses private, loopback and cloud-metadata addresses, on every redirect.

## Build, test, run

```sh
cd worker
npm ci
npm test            # node --test: the engine golden tests and the site-audit tests
npm run build       # writes worker.bundle.mjs
```

Run it with the backend's settings, from the backend's folder, so relative paths such as `data/apifiles` point at the same files:

```sh
cd backend
set -a; . ./.env; set +a
node ../worker/worker.bundle.mjs
```

It exits at once if `GIGAI_API_DSN` is not set. `sharp`, `svgo` and `@napi-rs/canvas` stay outside the bundle because they are native or load files at run time; `npm ci` in `worker/` installs them where the worker runs. [`ops/systemd/gigai-api-worker.service`](https://github.com/cbsshekhawat18-lab/gigai-tools/blob/main/ops/systemd/gigai-api-worker.service) is an example unit.

## Settings

| Setting | Default | What it does |
|---|---|---|
| `GIGAI_API_DSN` | (required) | The developer API database |
| `GIGAI_API_FILES_DIR` | `data/apifiles` | Where job files are written |
| `GIGAI_PDFJS_ASSETS` | (unset) | Folder with pdf.js `cmaps/` and `standard_fonts/`, for PDF text extraction |
| `GIGAI_OCR_BASE` | `http://127.0.0.1:8000/api/pdf-repair` | The [PDF repair](pdf-repair.md) service, for OCR jobs |
| `GIGAI_AUDIT_GROQ_KEY`, `GIGAI_AUDIT_GEMINI_KEY` | (unset) | Optional models for the site audit's written summary |
