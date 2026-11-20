# GigAI Tools backend

A FastAPI service (Python 3.12 or later) for the few GigAI Tools features a browser cannot do alone: Video to Work analysis, GigAI Verify, IconLab's AI composer, the newsletter, the optional LibreOffice converter, [PDF repair](app/pdf_repair/) (AGPL-3.0, optional) and the developer API (`app/v1/`).

```sh
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env        # then fill in what you use
uvicorn app.main:app --reload  # http://localhost:8000/docs
```

It starts with no settings; each feature stays off until its setting is present.

| Path | What is there |
|---|---|
| `app/main.py` | The app: CORS, the `/api` router, and `/v1` when `GIGAI_API_JWT_SECRET` is set |
| `app/api/` | The `/api` routes |
| `app/services/` | Their logic: Video to Work, link retrieval, Verify, IconLab, conversion |
| `app/core/config.py` | Every setting, with its default |
| `app/v1/` | The developer API, its engine catalogue (`engines.json`) and its SQL (`sql/`) |
| `app/pdf_repair/` | PDF repair and OCR, AGPL-3.0, mounted when `PDF_REPAIR_ENABLED=true` |
| `tests/` | `pytest -q tests/test_cors_pinning.py` and `python tests/test_video_work_guards.py` |

Full guides: [the backend](../docs/guides/backend.md), [the developer API](../docs/guides/developer-api.md), [PDF repair](../docs/guides/pdf-repair.md) and [configuration](../docs/configuration.md).
