---
title: "How to Hash Data with SHA-256: Checksums, MD5, and Salting Explained"
description: "Learn what hashing actually does, how SHA-256 and MD5 differ, how checksums verify downloads, and why salting matters, with a free in-browser hash generator."
date: "2026-07-05"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["hashing", "sha-256", "md5", "checksums", "security"]
featured: false
---

Hashing is one of those ideas that sounds arcane until you see it once, and then it's everywhere: the checksum next to a download link, the way a website stores your password without knowing it, the "fingerprint" of a file in a version-control commit. This guide walks through what a hash really is, how SHA-256 and MD5 differ, how to verify a download with a checksum, and why passwords need salt: with plenty of concrete detail you can act on. You can follow along with our [hash generator](/hash-generator), which computes hashes entirely in your browser so nothing you type is ever uploaded.

## What a hash function actually does

A **cryptographic hash function** takes any input (a word, a file, a gigabyte of video) and produces a fixed-length string of characters called a *digest*. Feed it the same input and you always get the same digest. Change a single byte and the digest changes completely.

Three properties make a hash useful:

- **Deterministic.** The same input always yields the same output. This is what lets two people independently verify they have the identical file.
- **Fixed length.** SHA-256 always outputs 256 bits (64 hexadecimal characters) whether you hashed the letter `a` or an entire novel.
- **One-way.** You cannot run the function backwards to recover the input from the digest. There's no "un-hash" button, and That is all there is to it.

Try it: hashing the single character `a` with SHA-256 gives `ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb`. Hashing `b` gives something entirely unrelated. This dramatic scattering, where a tiny input change produces a wildly different output, is called the **avalanche effect**, and it's exactly what you want.

## SHA-256 vs. MD5: which to use, and when

SHA-256 belongs to the SHA-2 family, published by the U.S. National Security Agency, and is the current default for anything security-sensitive. MD5, designed in the early 1990s, produces a shorter 128-bit digest and is *much* faster, but it's been cryptographically broken for two decades.

| | MD5 | SHA-256 |
|---|---|---|
| Digest length | 128 bits (32 hex chars) | 256 bits (64 hex chars) |
| Speed | Very fast | Fast |
| Collision resistance | Broken: collisions are trivial to generate | Strong, no practical collisions known |
| Safe for security? | No | Yes |
| Reasonable use today | Non-adversarial checksums, cache keys | Passwords, signatures, integrity |

A **collision** is when two different inputs produce the same digest. For MD5 this can now be done in seconds on a laptop, which means an attacker could craft a malicious file that matches the checksum of a legitimate one. That's why MD5 is fine for spotting accidental corruption but useless against a deliberate adversary. When the stakes are real, reach for SHA-256.

## Verifying a download with a checksum

Here's the most common everyday use of hashing. When you download an installer or an ISO, the publisher often lists a SHA-256 checksum on the page. After the download finishes, you hash your copy and compare.

1. Note the published checksum, for example `9f86d0…`.
2. Compute the SHA-256 hash of the file you downloaded.
3. Compare the two strings. If they match exactly, your copy is bit-for-bit identical to what the publisher released. If even one character differs, the file is corrupted or tampered with. Do not run it.

On the command line you'd use `shasum -a 256 file.iso` on macOS or `sha256sum file.iso` on Linux. If you'd rather not touch a terminal (or you're verifying a small text value rather than a huge file) paste it into the [hash generator](/hash-generator) and read the digest straight off the screen. Because it runs client-side, it works the same way `sha256sum` does, just without the upload.

## Encoding is not hashing (a common mix-up)

People often confuse hashing with encoding, but they solve opposite problems. **Encoding**: like Base64 or [URL percent-encoding](/url-encoder): is a *reversible* transformation meant to move data safely through a channel. Anyone can decode it. **Hashing** is deliberately *irreversible*. If a tutorial tells you to "hash" something so you can later "decode" it, that's a red flag: you can't decode a hash. Our comparison of [Base64 vs. binary](/compare/base64-vs-binary) digs into how encoding differs from raw representation, which is a useful companion to this idea.

## Why passwords need salt

Because hashing is deterministic, two users with the same password produce the same digest. That's a problem. An attacker who steals a database of password hashes can precompute the hashes of millions of common passwords (a *rainbow table*) and instantly match them against your users.

The defence is a **salt**: a unique, random value generated per user and combined with the password before hashing.

```
stored = hash(salt + password)
```

Now two users with the password `hunter2` have different stored values, because each has a different salt (which is stored alongside the hash, in the clear, that's fine). A precomputed rainbow table is useless, because the attacker would need a separate table for every salt.

A few essentials if you're building this for real:

- **Never write your own scheme in production.** Use a purpose-built password hashing algorithm like **bcrypt**, **scrypt**, or **Argon2**. These are deliberately *slow* and memory-hard, so an attacker can only test a handful of guesses per second instead of billions.
- **Plain SHA-256 is too fast for passwords.** Its speed is a feature for checksums and a liability for password storage, where slowness is protective.
- **Salt is not a secret**, but a **pepper** (a global secret added on top) can add defence in depth.

Understanding the salt concept is enough to know *why* your framework's auth library does what it does, which is often the difference between using it correctly and disabling the very protections that keep you safe.

## Where hashes show up once you start noticing

- **Version control.** Every Git commit is identified by a hash of its contents, which is how the tool detects even a one-character change.
- **Deduplication and caching.** Storage systems hash file contents to spot identical files, and CDNs use content hashes in filenames so a changed asset gets a fresh URL.
- **Digital signatures.** You sign the *hash* of a document, not the whole document, because the hash is small and fixed-length.
- **Data integrity.** Databases and backup tools store hashes to detect silent corruption over time.

## Hashing without your data leaving the page

Our [hash generator](/hash-generator) computes SHA-256 (and the rest of the SHA family) with the browser's built-in WebCrypto engine: native code, no library download, no upload. That architecture is the point for this task, since the things people hash (passwords to compare, file contents to verify, tokens) are usually the last things that should travel to a third-party server. Paste or drop, read the digest, close the tab. Nothing persists.

## Try it yourself

The fastest way to build intuition is to play. Open the [hash generator](/hash-generator), type a word, and watch the SHA-256 digest. Add one letter and see the whole thing change. Switch between SHA-256 and MD5 to compare lengths. If you're wiring hashing into a real project, pair this with our developer utilities like the [JSON formatter](/json-formatter) for inspecting API payloads, and read up on [how Unix timestamps work](/blog/understanding-unix-timestamps) and [cron expression syntax](/blog/cron-expression-syntax-explained): the other small primitives that quietly hold real systems together.
