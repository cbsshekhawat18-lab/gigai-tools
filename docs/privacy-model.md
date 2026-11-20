---
description: Which GigAI Tools run only in your browser, which read a URL through a fetch proxy, and which use the backend, with what each server part receives and keeps.
---

# What runs where

Of the 273 tools, 241 run only in your browser. Your file is read by code in the page and the result is made in the page; nothing about the file is sent anywhere. [All tools](tools/index.md) marks each tool.

## Tools that can read a URL (29)

The SEO and GEO tools that check a web page accept pasted HTML, which they analyse in your browser. If you enter a URL instead, the site's fetch proxy requests that page, returns it to your browser and keeps nothing. The proxy in this repository (`cloudflare/social-fetch`) only fetches public addresses: it refuses private and local network addresses and re-checks every redirect. [The fetch proxies](guides/fetch-proxies.md) explains how.

## Tools that use the backend for one part (3)

| Tool | What goes to the backend | What it keeps |
|---|---|---|
| Video to Work | The transcript, and a few chosen frames if the backend asks for them, for analysis; a video link, for retrieval. Transcription runs in the browser. | Nothing. A retrieved video is streamed back to the browser, then its temporary folder is deleted. |
| GigAI IconLab | The concept name and a description of up to 200 characters, when you use the optional AI composer. | Nothing. |
| PDF to Excel | The PDF, only if you choose OCR repair after the notice. | The file is deleted as soon as it is processed. The extracted text is held in memory for up to 20 minutes, for your browser to collect, then dropped. |

## Word to PDF and PDF to Word

Both convert in the browser. A self-hosted site whose backend has LibreOffice can set `NEXT_PUBLIC_SERVER_CONVERT=true`, and the tools then send the file to `/api/convert` first. gigai.tools does not enable it, so no file leaves the browser there.

## Outside the tools

- **GigAI Verify**, a browser extension, sends the text you choose to check to `/api/v1/verify`.
- **The developer API** (`/v1`) processes files on the server by design: you upload a file, a job runs, you download the result. Files are deleted on their retention schedule. See [The developer API](guides/developer-api.md).
- **Analytics and ads** load only on a site that configures them (`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_ADSENSE_CLIENT`). A fresh clone loads neither.
