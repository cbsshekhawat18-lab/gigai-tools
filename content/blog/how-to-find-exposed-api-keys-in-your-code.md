---
title: "How to Find Exposed API Keys in Your Code (Before Someone Else Does)"
description: "One pasted.env file or rushed commit is all it takes to leak a live API key. The steps secrets end up in code, how to scan for them in seconds, and the habits that stop it happening again."
date: "2026-07-28"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["security", "api keys", "secret scanner", "git", "developer tools"]
tool: "secret-scanner"
featured: true
---

The worst part of leaking an API key is how ordinary the moment feels. Nobody leaks a key while doing something reckless. You leak it while pasting a config snippet into a support ticket at 6 p.m., or committing "quick fix" with `git add .`, or sharing a log file with a teammate because the bug only shows up in production.

I've done the ticket one. A payment integration was failing, I pasted the request logs into an issue, and twenty minutes later a colleague quietly pointed out that line 14 contained our live Stripe secret. We rotated it within the hour and nothing bad happened, but "nothing bad happened" was luck, not process.

That afternoon is why I care about secret scanning, and why this article exists. Finding exposed API keys is a solved problem. It takes seconds. Most people just never make it part of how they work.

## Why this keeps happening to careful people

Secrets leak because of a mismatch between how credentials look and how humans read.

A hard-coded password sitting in a config file is easy to spot. But a modern API key is a long random string, and long random strings are exactly what our eyes are worst at. Scan a 300-line diff and your brain smooths right over `sk_live_...`: it's just another blob of characters in a file full of them. The signal you're supposed to catch is designed, almost perfectly, to look like noise.

Then there's the copy-paste economy we all work in. Code moves constantly between places with very different privacy levels: your editor, a terminal, a git repo, a bug report, a gist, a chat thread, a screenshot. A string that was safe in your local `.env` file is one paste away from somewhere it shouldn't be. The file didn't change. The audience did.

And the cost of a miss is real. A leaked key isn't a theoretical risk you can get to next sprint. People who run honeypot experiments, deliberately publishing a fake AWS key to see what happens, consistently find automated bots trying it within minutes. Not days. Minutes. Public code is being watched by scrapers around the clock, and they're faster than your code review.

One more wrinkle that catches people out: **deleting a committed secret doesn't remove it.** Git remembers. If a key ever made it into a commit, it lives on in the history even after you delete the line, which is why the fix for a leaked key is always rotation, never deletion.

## The moments a scan is actually worth doing

You don't need to scan everything you type. There are a handful of specific moments where a ten-second check pays for itself:

- **Before pasting anything into a public or semi-public place**: an issue tracker, a forum post, a gist, a shared doc, a chat channel with fifty people in it.
- **Before your first push of a new project**, when the `.env` file exists but the `.gitignore` entry for it might not.
- **Before open-sourcing a private repo.** Code written "just for us" has a way of accumulating shortcuts.
- **After inheriting a codebase.** The previous team's habits are unknown, and old config files are where secrets go to hide.
- **When sharing logs.** Logs are the sneakiest source of all, because credentials get printed by frameworks and SDKs without you ever writing the line that does it.

If you recognize even two of those moments from the past month, you're the audience for this.

## How the scanner works

The [secret scanner](/secret-scanner) on GigAI Tools is deliberately simple to use: paste code, a config file, a `.env`, or a log snippet, and it flags anything that looks like a credential.

Under the hood it's pattern matching against the formats that real services use. Most API keys are not arbitrary strings, providers give them recognizable shapes and prefixes precisely so they can be identified. AWS access keys start with `AKIA`. Stripe live secrets start with `sk_live_`. GitHub tokens start with `ghp_` or `github_pat_`. OpenAI keys start with `sk-`. Private keys announce themselves with a `-----BEGIN PRIVATE KEY-----` block. Database connection strings put the password right in the URL. The scanner knows these shapes: for AWS, Stripe, GitHub, Slack, Google, Twilio, SendGrid, npm, JWTs, hard-coded password assignments, and more, and checks your text against all of them at once.

Each finding comes back with a severity rating, the line number, a masked preview of what was found, and a short hint about how to fix it. So instead of "something might be wrong somewhere," you get "line 14, high severity, Stripe live key, rotate it and move it to an environment variable."

Two details matter more than the detection list, though.

**First: everything runs in your browser.** Nothing you paste is uploaded anywhere. This isn't a nice-to-have for this particular tool, it's the entire point. A secret scanner that ships your secrets to a server to check them would be a punchline. The scan happens locally on your machine, works offline once the page is loaded, and your code never travels.

**Second: the redacted copy.** After a scan, one click gives you a version of your text with every detected secret replaced by `[REDACTED]`. This is the feature I use most, honestly. The reason secrets end up in bug reports is that sharing the *real* file is the path of least resistance. A redacted copy makes the safe version the easy version. Paste that into the ticket instead.

Compare that with the manual method: reading your own diff line by line, squinting at every long string, hoping you're sharper today than the person who pasted a Stripe key into a ticket. I've been both people. The scanner wins.

## Three real situations

**The support ticket.** You're filing a bug with a vendor and they ask for your request and response logs. Paste the log into the scanner first. If it flags an authorization header or a session token, and logs very often contain both, use the redacted copy in the ticket. Total detour: about fifteen seconds.

**The first push.** You've built a prototype over a weekend and you're about to put it on GitHub. Paste your config files and anything with "settings" in the name into the scanner before that first `git push`. This is the highest-value scan there is, because *before* the push, a finding costs you a two-minute cleanup. After the push, it costs you key rotation plus the nagging question of who cloned the repo in between.

**The inherited project.** New job, old codebase. Run the obvious suspects through the scanner, `.env.example` files that turned out not to be examples, `config/` directories, deployment scripts, that one `notes.txt` in the repo root. Every long-lived codebase I've explored this way has produced at least one awkward discovery.

## Common mistakes

**Deleting the line and moving on.** Worth repeating: if a secret was ever committed, removing it in a new commit hides nothing. It's still in the history, still in every clone and fork. The only real fix is to revoke the key with the provider and issue a new one. Rewriting git history is possible, but treat it as cleanup, not as the remedy. Assume the key was seen.

**Trusting a private repo to stay private.** Repos get made public later, get forked, get cloned onto laptops, get connected to third-party services with read access. "It's private" is a description of today, not a guarantee about next year.

**Assuming the scanner replaces judgment.** It's a pattern-based tool, and honest about that. A secret with a custom format your company invented, or one split across two variables and concatenated at runtime, can slip through. The reverse happens too: a random-looking test string might get flagged when it's harmless. Treat findings as strong leads, not verdicts, and treat a clean scan as "nothing obvious," not "certified safe."

**Scanning the code but sharing the screenshot.** A screenshot of your terminal with a key visible leaks exactly as well as text does. It just skips every text-based check on the way out. If you screenshot config or logs, look at the image before it leaves your machine.

## Habits that make leaks rare

- Keep secrets in environment variables or a secrets manager, never in source. The scanner's fix hints push this way for a reason. It turns "don't leak the file" into "the file has nothing to leak."
- Add `.env` to `.gitignore` the moment you create it, not when you remember.
- Use different keys for development and production. A leaked test key should be an annoyance, not an incident.
- Rotate anything questionable immediately. Rotation is cheap. The following Tuesday's surprise invoice is not.
- Make scanning a reflex tied to sharing. Not "scan sometimes," but "scan whenever code or logs are about to leave my machine." Reflexes survive deadlines. Policies don't.

While you're tightening things up, two related reads: if your app hands out JWTs, it's worth understanding [what's actually inside them](/blog/jwt-explained-anatomy-of-a-json-web-token): they're encoded, not encrypted, and people mix that up constantly. And if you run a website, [HTTP security headers](/blog/http-security-headers-explained) are the same species of fix: small, boring, and disproportionately protective.

## Frequently asked questions

**Is it safe to paste real secrets into an online scanner?**
Into this one, yes. The scan runs entirely in your browser and nothing is uploaded, which you can verify by loading the page and then going offline before pasting. As a general rule, though, your instinct to ask that question is correct. Never paste live credentials into a tool that processes them on a server.

**What kinds of secrets does it catch?**
Keys and tokens with recognizable formats: AWS, Stripe, GitHub, Slack, Google, Twilio, SendGrid, npm and OpenAI keys, private-key blocks, JWTs, database URLs containing passwords, and hard-coded password assignments. The masked preview shows you exactly what matched and where.

**Can it scan my whole repository or my git history?**
No. It works on text you paste, so it's built for the share-and-commit moments rather than auditing years of history. For continuous repo-wide scanning, pair it with a scanner in your CI pipeline. The two cover different moments.

**I found a leaked key. What's the actual order of operations?**
Revoke or rotate the key with the provider first, that's the step that closes the door. Then update your app to read the new key from an environment variable, check the provider's usage logs for anything unfamiliar, and only then worry about tidying the repo.

**Does a clean scan mean my code is secure?**
It means no recognizable secrets were found in what you pasted. That's a narrower claim. Obfuscated or custom-format secrets can pass, and code can be insecure in plenty of ways that have nothing to do with credentials.

## What the scanner looks for

The [secret scanner](/secret-scanner) matches the known shapes of real credentials (provider-specific prefixes and lengths, the patterns services themselves publish) rather than just flagging every long string, which keeps the noise down when scanning code that is full of hashes and IDs. Crucially, the scan runs in your browser: pasting code into a scanner that uploads it would be handing your possible secrets to one more server, which is the exact problem you came to fix.

## The ten-second habit

Leaked keys aren't a talent problem. Careful, senior people leak them, because the mistake lives in the gap between "this text is on my machine" and "this text is somewhere else", and that gap gets crossed dozens of times a day without ceremony.

The fix is to put one small checkpoint at the crossing. Before code, config, or logs leave your machine, run them through the [secret scanner](/secret-scanner). It's free, it needs no account, nothing you paste goes anywhere, and the redacted copy means being safe is no longer slower than being sorry. And while you're thinking about credentials at all: if any password in your stack was invented by a human, the [password generator](/password-generator) will give you a better one in one click.

Fifteen seconds per share. That is the entire cost of never being the person in the post-incident meeting explaining how the key got out.
