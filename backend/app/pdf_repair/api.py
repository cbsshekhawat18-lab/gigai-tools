# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright 2026 Chandrabhan Shekhawat, Gigai Kripa Services.
# AGPL-3.0, not Apache-2.0, because this module uses PyMuPDF. See LICENSE here.
"""PDF text-repair endpoints (lossy-CMap text fix via render + OCR, any script).

POST /pdf-repair/jobs        multipart PDF -> {job_id}
GET  /pdf-repair/jobs/{id}   -> {status, page, pages} while working;
                                {status: "done", result} exactly once when done
GET  /pdf-repair/status      -> {enabled} so the UI only offers what exists

The upload is processed and deleted immediately (see the service docstring);
this API never persists a document.
"""

from __future__ import annotations

from fastapi import APIRouter, Form, HTTPException, UploadFile

from app.pdf_repair import service as pdf_repair

router = APIRouter(prefix="/pdf-repair", tags=["pdf-repair"])

MAX_BYTES = 30 * 1024 * 1024


@router.get("/status")
async def status() -> dict[str, object]:
    return {
        "enabled": pdf_repair.tesseract_available(),
        "maxBytes": MAX_BYTES,
        "langs": sorted(pdf_repair.installed_langs() - {"osd"}),
    }


@router.post("/jobs")
async def create_job(file: UploadFile, langs: str = Form("auto")) -> dict[str, str]:
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "PDF is larger than the 30 MB repair limit.")
    if not data.startswith(b"%PDF"):
        raise HTTPException(400, "That file is not a PDF.")
    if not pdf_repair.tesseract_available():
        raise HTTPException(503, "OCR is not available on this server right now.")
    try:
        job = pdf_repair.start_job(data, langs)
    except ValueError:
        raise HTTPException(400, "Invalid language selection.") from None
    return {"job_id": job.id}


@router.get("/jobs/{job_id}")
async def job_status(job_id: str) -> dict[str, object]:
    job = pdf_repair.get_job(job_id)
    if job is None:
        raise HTTPException(404, "Unknown or expired job.")
    if job.status == "done":
        result = pdf_repair.take_result(job_id)
        if result is None:
            raise HTTPException(410, "Result already collected.")
        return {"status": "done", "result": result}
    if job.status == "error":
        return {"status": "error", "error": job.error or "Repair failed."}
    return {"status": job.status, "page": job.page, "pages": job.pages, "langs": job.langs}
