# syntax=docker/dockerfile:1

# ── GigAI Tools backend ───────────────────────────────────────────────────────────
# Slim, production-ready image running the FastAPI app under uvicorn.
FROM python:3.12-slim AS runtime

# Keep Python lean and predictable in containers.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# curl serves the container health check. Nothing else is installed: PDF
# repair (app/pdf_repair, AGPL-3.0) is optional and not in this image, and
# /api/convert reports itself unavailable without LibreOffice.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first for better layer caching.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Application code.
COPY app ./app

# Run as a non-root user.
RUN useradd --create-home --uid 10001 appuser
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl --fail http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
