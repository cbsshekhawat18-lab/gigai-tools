---
description: Run the GigAI Tools developer API (/v1) with accounts, API keys, jobs, webhooks and file retention on FastAPI and PostgreSQL, with its task worker. Database setup, endpoints and settings.
---

# The developer API

The developer API runs GigAI's file tools from code: you upload files, a job runs the tool on the server, and you download the result. On gigai.tools it lives at `https://api.gigai.tools/v1`, with accounts and keys at [gigai.tools/developers](https://gigai.tools/developers). This page is for running your own.

It has three parts:

- **The API** in `backend/app/v1/`, mounted by the backend at `/v1` when `GIGAI_API_JWT_SECRET` is set.
- **PostgreSQL** for accounts, keys, jobs, usage and the audit log. Files are not stored in the database.
- **The [task worker](worker.md)** in `worker/`, which picks up jobs and runs the engines.

## 1. Create the database

```sh
sudo -u postgres createuser gigai_api
sudo -u postgres createdb -O gigai_api gigai_api
cd backend/app/v1/sql
for f in schema.sql migrate_p3.sql migrate_p9.sql migrate_p11.sql migrate_p12.sql migrate_p13.sql migrate_p14.sql migrate_p15.sql; do
  sudo -u postgres psql -d gigai_api -f "$f"
done
```

Apply `schema.sql` first, then the migrations in number order, each once.

## 2. Configure

In `backend/.env`:

```sh
GIGAI_API_JWT_SECRET=<a long random string>
GIGAI_API_DSN=dbname=gigai_api user=gigai_api host=/var/run/postgresql
GIGAI_SITE_BASE=https://example.com           # links in account email
GIGAI_API_PUBLIC_BASE=https://api.example.com # signed download URLs
GIGAI_ADMIN_EMAILS=you@example.com            # accounts allowed into /v1/admin
```

Without `EMAIL_HOST`, `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD`, new accounts are verified automatically instead of by email. That suits a private install, not a public one.

## 3. Start the backend and the worker

Start the backend as in [The backend](backend.md), then the [worker](worker.md). Check `GET /v1/health`.

## Endpoints

The full reference is the OpenAPI file at `public/developers/openapi.yaml`, served on the site at `/developers/openapi.yaml`, and the live docs at `/docs` on your backend.

| Group | What it does |
|---|---|
| `/v1/auth/*` | Sign up, verify email, log in, reset a password |
| `/v1/keys` | Create, list and revoke API keys (`gk_live_...` and `gk_test_...`) |
| `/v1/tools` | The engine catalogue: every operation and its options, from `engines.json` |
| `/v1/jobs`, `/v1/tasks/*`, `/v1/files/*` | Run a job, wait for it, download its files |
| `/v1/webhooks` | Get a signed callback when a job finishes |
| `/v1/account/*` | Usage, job history and webhooks for the dashboard |
| `/v1/audit`, `/v1/agent/*` | Site audit, and the planner behind Ask GigAI |
| `/v1/poster/*` | Supporter poster pages |
| `/v1/admin/*` | Accounts, limits, suspension and the audit log, for admin accounts |

Send a key as `Authorization: Bearer <key>`. The [API clients](clients.md) do this for you.

## Files and retention

Job files are written to `GIGAI_API_FILES_DIR` (default `data/apifiles`) and deleted on each job's retention schedule by a sweeper that runs every minute. Downloads use signed, expiring URLs. Object storage is not built yet; files live on local disk.

## Limits

This is the API gigai.tools runs, on one server. It has no horizontal scaling, and its queue is a PostgreSQL table, which suits small installs. Plan limits are rows in the database, which admins change through `/v1/admin`.
