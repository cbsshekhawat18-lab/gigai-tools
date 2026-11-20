# Trademarks

The code in this repository is open source under the [Apache License 2.0](LICENSE)
(and, for one folder, AGPL-3.0). The **GigAI** name, the **GigAI Tools** name and
the GigAI logo are trademarks of Gigai Kripa Services. They are not licensed under
either licence; Apache-2.0 section 6 says so explicitly.

## What you may do

- Use, change and run the code, including on a public website, under its licence.
- Say truthfully that your project is "based on GigAI Tools" or "a fork of GigAI Tools",
  with a link to this repository.
- Use the name to refer to this project, for example in an article or a comparison.

## What needs your own name and logo

A copy you run publicly, or distribute, must use its own name and logo, so people
can tell it apart from gigai.tools. It must not suggest that Gigai Kripa Services
runs, reviews or endorses it.

## Rebranding a fork

These files carry the GigAI name, logo or the gigai.tools address:

| Path | What to change |
|---|---|
| `config/constants.ts` (`SITE`) | Site name, tagline, domain, email, social handles |
| `config/seo.ts` | Organization and founder details in the structured data |
| `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico` | Browser icons |
| `public/brand/` | Logo files |
| `public/images/og-default.png`, `public/images/og/` | Social preview images |
| `public/images/blog/` | Blog cover art |
| `public/ai.txt`, `app/llms.txt/route.ts` | Descriptions for AI crawlers |
| `backend/app/v1/auth.py` | Account email template (logo, links) |
| `backend/app/core/config.py` (`APP_NAME`) | The backend's service name |

The tool and blog text names GigAI in many places. Search the repository for
`GigAI` and `gigai.tools` and replace what you publish.

Questions: <https://gigaikripaservices.com/contact/>
