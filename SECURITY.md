# Security policy

## Reporting a vulnerability

**Do not open a public issue, pull request or discussion for a security problem.**

Report it privately through GitHub: on this repository, open the **Security** tab and choose **Report a vulnerability**. If you cannot use GitHub, email hello@gigaikripaservices.com with "SECURITY" in the subject.

Please include:

- what the problem is and what an attacker could do with it;
- the steps, URL or request that shows it;
- the commit, release or live page you tested.

## What happens next

| Step | Target |
|---|---|
| Acknowledge your report | Within 3 working days |
| Confirm or rule it out, with a severity | Within 10 working days |
| Release a fix | As soon as practical, on a date we agree with you |
| Publish an advisory | When the fix is released |

Please keep the problem private until the fix is out, and for no longer than 90 days. We credit reporters in the advisory unless they would rather not be named.

## Supported versions

Security fixes go into the `main` branch and the live site, [gigai.tools](https://gigai.tools). There are no maintained release branches.

## What counts as a vulnerability

In scope:

- a file, URL or text sent to a tool that leaves the browser when the tool says it does not;
- the backend or the developer API keeping a file longer than it says, or exposing one account's files, keys or jobs to another;
- server-side request forgery through the fetch proxies, the worker's URL imports or webhooks;
- authentication, session or API-key flaws in `/v1`;
- cross-site scripting or injection in any page or tool.

Not in scope: your own deployment's configuration, denial of service by volume, missing hardening headers without a working attack, and problems in third-party dependencies that have their own advisory (we track those with Dependabot).

## What the code does by default

- The Node fetch proxy (`cloudflare/social-fetch/server.mjs`) and the task worker resolve every hostname and refuse private, loopback and cloud-metadata addresses, on every redirect. Webhook targets get the same check.
- The backend refuses to start with `ENV=production` and a CORS pattern loose enough to admit any browser extension.
- API keys and passwords are stored as hashes (Argon2 for passwords). The JWT secret has no default.
- On every pull request and every day, CI runs a secret scan that fails the check on a finding, and reports `npm audit` and `pip-audit` results. Dependabot opens weekly dependency update pull requests.
