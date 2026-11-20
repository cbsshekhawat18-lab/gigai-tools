---
description: Run GigAI Tools on your own machine. Clone the repository, install with npm and start the Next.js site; add the optional FastAPI backend in a second terminal.
---

# Quickstart

## 1. Run the website

You need Node 20 or later and git.

```sh
git clone https://github.com/cbsshekhawat18-lab/gigai-tools.git
cd gigai-tools
npm install
npm run dev
```

Open <http://localhost:3000>. Every tool that runs in the browser works now, with nothing else installed.

`npm install` also runs `scripts/copy-ffmpeg.mjs`, which copies the ffmpeg.wasm core out of `node_modules` into `public/ffmpeg/`. The video and audio tools load it from there. If you install with `--ignore-scripts`, run `node scripts/copy-ffmpeg.mjs` yourself.

## 2. Check it

```sh
npm run typecheck   # TypeScript, no output means no errors
npm test            # the engine tests (Vitest)
npm run lint
```

## 3. Build the static site

```sh
npm run build
```

The site is a static export: `out/` holds plain HTML, JavaScript and assets, and any static file host can serve it. [The website](guides/website.md) covers hosting it.

## 4. Add the backend (optional)

A few features need a server: Video to Work analysis, GigAI Verify, PDF repair, IconLab's AI composer and the developer API. In a second terminal, with Python 3.12 or later:

```sh
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend listens on <http://localhost:8000>, with interactive API docs at <http://localhost:8000/docs>. It starts with no settings; each feature that needs a key or a database stays off until you set it. [Configuration](configuration.md) lists them.

## What just happened

- The website came from the tool registry in `config/tools/`: one file per tool, turned into a static page each.
- Each tool's interface is in `modules/tools/`, and the code that does the work is in `lib/`. That code runs in your browser tab.
- The backend in `backend/` is a separate FastAPI service the site calls only for the features listed above.

[Architecture](architecture.md) explains each part.
