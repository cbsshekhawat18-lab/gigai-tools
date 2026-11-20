# Server examples

Example configuration for running the backend and the task worker on one Linux
server with systemd, nginx and cron. They are starting points: replace the
placeholders before you use them.

| Placeholder | Meaning |
|---|---|
| `/opt/gigai-tools` | Where this repository is checked out |
| `gigai` | The system user the services run as |
| `example.com` | Your site's domain; `api.example.com` serves the developer API |
| `8000` | The port the backend listens on, on 127.0.0.1 only |

| File | Install as | What it does |
|---|---|---|
| `systemd/gigai-tools-api.service` | `/etc/systemd/system/` | Runs the FastAPI backend (`backend/`) with uvicorn |
| `systemd/gigai-api-worker.service` | `/etc/systemd/system/` | Runs the developer API task worker (`worker/worker.bundle.mjs`) |
| `nginx/api.conf` | `/etc/nginx/sites-available/` | `api.example.com`: proxies `/v1/` to the backend, nothing else |
| `nginx/poster-location.conf` | inside the site's `server {}` block | Proxies `/p/{slug}` poster pages to the backend |
| `bin/health.sh`, `cron/health.cron` | `/usr/local/bin/`, `/etc/cron.d/` | Restarts the backend or worker when either stops answering |
| `bin/pressure.sh`, `cron/pressure.cron` | `/usr/local/bin/`, `/etc/cron.d/` | Logs a warning before the disk fills or memory runs out |
| `cron/backup.cron` | `/etc/cron.d/` | Nightly `pg_dump` of the developer API database, kept 7 days |

Both services read their settings from `/opt/gigai-tools/backend/.env` (see
`.env.example` in the repository root). Restore a backup with:

```sh
gunzip -c /var/backups/gigai_api/gigai_api-N.sql.gz | sudo -u postgres psql -d gigai_api
```
