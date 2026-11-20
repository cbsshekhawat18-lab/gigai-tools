---
description: The optional GigAI Tools PDF repair and OCR service (AGPL-3.0), which recovers text from PDFs with damaged fonts using PyMuPDF and tesseract. License, install and settings.
---

# PDF repair

Some PDFs show readable text but extract as garbage, because their fonts map characters wrongly. PDF to Excel detects this and offers to repair the text with OCR. The repair runs on the backend, in `backend/app/pdf_repair/`.

## License

This folder is licensed under the **GNU AGPL-3.0-or-later**, not Apache-2.0, because it uses PyMuPDF, which is AGPL-3.0. The rest of the repository stays Apache-2.0.

If you enable it on a server that other people use, AGPL-3.0 asks you to offer those users the source code of the backend as you run it, including your changes. Publishing your fork does that.

It is **off by default**. With `PDF_REPAIR_ENABLED` unset, the backend does not import it, and the backend runs under Apache-2.0 alone.

## Enable it

```sh
pip install -r backend/requirements-pdf-repair.txt   # adds PyMuPDF
sudo apt-get install tesseract-ocr                   # plus the tesseract-ocr-<lang> packages you need
```

Then set `PDF_REPAIR_ENABLED=true` in `backend/.env` and restart the backend. `GET /api/pdf-repair/status` reports whether tesseract was found and which languages it has.

## What it does with a file

The browser sends the PDF only after the user agrees to the notice. The backend writes it to a temporary file, runs OCR one job at a time, and deletes the file as soon as the job ends. The extracted text stays in memory for up to 20 minutes, for the browser to collect, and is then dropped.
