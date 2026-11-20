#!/bin/bash
# Five-minute watchdog for the backend and the task worker.
if ! curl -fsS -m 10 http://127.0.0.1:8000/v1/health >/dev/null 2>&1; then
  logger -t gigai-health "backend health check failed - restarting gigai-tools-api"
  systemctl restart gigai-tools-api
fi
if ! systemctl is-active --quiet gigai-api-worker; then
  logger -t gigai-health "worker inactive - restarting gigai-api-worker"
  systemctl restart gigai-api-worker
fi
