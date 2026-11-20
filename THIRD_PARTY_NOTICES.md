# Third-party notices

GigAI Tools is licensed under the Apache License 2.0 (see [LICENSE](LICENSE)). It depends on open-source packages with their own licenses. The full list of npm and Python dependencies is in `package-lock.json`, `worker/package-lock.json` and `backend/requirements*.txt`; most are MIT, Apache-2.0, ISC or BSD. This file lists the components whose license asks for notice, or that are not under a permissive license.

## Shipped in this repository

| Component | Where | License |
|---|---|---|
| pdf.js character maps and standard fonts | `public/pdfjs/` | Apache-2.0; the fonts carry the Foxit and Liberation licenses in `public/pdfjs/standard_fonts/` |
| indian-pii | `lib/vendor/indian-pii/` | MIT (`lib/vendor/indian-pii/LICENSE`) |
| GNU AGPL-3.0 text | `backend/app/pdf_repair/LICENSE` | The license of that folder |

## Installed by npm, not committed

| Component | Version | License | Notes |
|---|---|---|---|
| ffmpeg.wasm core (`@ffmpeg/core`) | 0.12.10 | GPL-2.0-or-later | Copied into `public/ffmpeg/` by `scripts/copy-ffmpeg.mjs` and served to the browser as a separate program. Source: <https://github.com/ffmpegwasm/ffmpeg.wasm> |
| `@breezystack/lamejs` (MP3 encoder) | 1.2.7 | LGPL-3.0 | Bundled into the site's JavaScript. Its source is the npm package; this repository's source is public |
| heic2any | 0.0.4 | MIT | Includes libheif, which is LGPL-3.0 |
| jszip | 3.10.1 | MIT or GPL-3.0-or-later | Used under MIT |
| DOMPurify | 3.4.11 | MPL-2.0 or Apache-2.0 | Used under Apache-2.0 |
| sharp and libvips (`@img/sharp-*`) | | Apache-2.0; libvips is LGPL-3.0 | Pulled in by Next.js and used by the task worker |

## Downloaded at run time, not shipped

| Component | Used by | License |
|---|---|---|
| Whisper speech-to-text models (`Xenova/whisper-*`, from Hugging Face) | Video Intelligence, Video to Work | MIT |
| `Xenova/all-MiniLM-L6-v2` embeddings | Video to Work context | Apache-2.0 |
| tesseract.js core and language data (from jsDelivr) | OCR tools | Apache-2.0 |

## Optional backend components

| Component | Used by | License |
|---|---|---|
| PyMuPDF | `backend/app/pdf_repair/` (off by default) | AGPL-3.0 |
| tesseract OCR | `backend/app/pdf_repair/` | Apache-2.0 |
| LibreOffice | `/api/convert` (off unless you install it) | MPL-2.0 |
| psycopg | Developer API | LGPL-3.0 (used as a library) |
| yt-dlp | Video to Work link retrieval | Unlicense |

## Fonts

The site uses IBM Plex Sans and IBM Plex Mono through `next/font/google`, under the SIL Open Font License 1.1.
