# Contributing to GigAI Tools

Thanks for helping. GigAI Tools exists so people can work on their files without uploading them. Changes are judged against that first: a tool that works in the browser is better than one that needs a server, and a tool that needs a server says so before it sends anything.

## Before you write code

- **A bug:** open an issue with the tool, your browser and, if you can share it, a file that fails. A failing file is the most useful thing you can send.
- **A security problem:** do not open an issue. See [SECURITY.md](SECURITY.md).
- **A new tool:** open an issue first with what it does, who needs it and whether it can run in the browser. Check that no existing tool already does it.
- **A larger change** to the registry, the page generator or the backend: open an issue to agree on the approach before the pull request.

## Rules every change follows

1. **Browser first.** Process files in the browser. If a feature truly needs a server, the page says so before anything is sent, and the server deletes what it receives.
2. **Real claims only.** Tool copy and docs state what the code does, with numbers only where they are measured. No marketing words, no em-dashes in visible copy.
3. **One tool, one file of copy.** A tool's page text lives in its `config/tools/` entry and is written for that tool.
4. **Engines are testable.** Processing code goes in `lib/`, without React, with tests.
5. **Small client payloads.** Pass client components only the fields they render (`toToolCardData` and `toWorkspaceToolData` in `lib/utils.ts`).

## Stack

- Website: Next.js 15 (App Router, static export), React 19, TypeScript, Tailwind CSS v4, shadcn/ui.
- Engines: pdf.js, pdf-lib, ffmpeg.wasm, Transformers.js, tesseract.js, svgo and others, in `lib/`.
- Backend: FastAPI on Python 3.12 or later; the developer API on PostgreSQL; the task worker on Node 22.

## Development setup

```sh
npm install
npm run dev               # http://localhost:3000
npm run typecheck && npm test && npm run lint
```

The backend, if your change touches it:

```sh
cd backend
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
python -m pytest -q tests/test_cors_pinning.py
python tests/test_video_work_guards.py
```

The worker: `cd worker && npm ci && npm test`.

[docs/architecture.md](docs/architecture.md) explains the layout, and [docs/adding-a-tool.md](docs/adding-a-tool.md) the files a new tool needs.

## Generated files

`docs/tools/` is written by `npm run docs:tools` from the registry, and `lib/icons.generated.ts` by `node scripts/gen-icons.mjs`. Regenerate them; do not edit them by hand. CI checks that `docs/tools/` is current.

## Pull requests

- Keep each pull request to one topic, and link the issue it closes.
- Include tests: a bug fix comes with a test that fails without it.
- Run `npm run typecheck`, `npm test` and `npm run build` before pushing.
- For a change to a tool's interface, add a screenshot.
- You are responsible for every line you submit, however you wrote it.

## License

By contributing, you agree that your contribution is licensed under the [Apache License 2.0](LICENSE), the same as the project (inbound = outbound), or under AGPL-3.0-or-later if it changes `backend/app/pdf_repair/`. There is no CLA. You keep the copyright on your contributions.

## Conduct

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).
