# SPDX-License-Identifier: AGPL-3.0-or-later
"""PDF repair and OCR (/api/pdf-repair).

This package is licensed under AGPL-3.0-or-later, not Apache-2.0 like the rest
of the repository, because it uses PyMuPDF (AGPL-3.0). It is optional: the
backend mounts it only when PDF_REPAIR_ENABLED is true. If you run it on a
public server, AGPL-3.0 requires you to offer your users the source of the
backend as you run it.
"""
