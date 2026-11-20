"""GigAI Developer API v1 - aggregate router. Mounted at /v1 in main.py.

Importing this module also starts the two background threads that Phase 3
needs: the file-retention sweeper and the webhook dispatcher. Both are
daemon threads owned by the gunicorn worker process.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.v1 import admin, agent, audit, auth, dash, files, jobs, keys, poster, tools, webhooks
from app.v1.storage import start_sweeper
from app.v1.webhooks import start_dispatcher

v1_router = APIRouter()
v1_router.include_router(auth.router)
v1_router.include_router(auth.account_router)
v1_router.include_router(dash.dash_router)
v1_router.include_router(dash.feedback_router)
v1_router.include_router(admin.admin_router)
v1_router.include_router(keys.router)
v1_router.include_router(tools.tools_router)
v1_router.include_router(jobs.jobs_router)
v1_router.include_router(files.files_router)
v1_router.include_router(webhooks.webhooks_router)
v1_router.include_router(audit.audit_router)
v1_router.include_router(agent.agent_router)
v1_router.include_router(poster.poster_router)

start_sweeper()
start_dispatcher()


@v1_router.get("/health")
async def health():
    return {"ok": True, "version": "v1", "phase": 3}
