---
title: "JWT Explained: The Anatomy of a JSON Web Token"
description: "What a JWT really is, broken down part by part, the header, payload and signature, the exp and iat claims, and the security rules that keep tokens safe."
date: "2026-07-09"
updated: "2026-08-21"
author: "Chandrabhan Shekhawat"
category: "developer-tools"
tags: ["jwt", "authentication", "security", "tokens", "developer-tools"]
featured: true
---

You log in to a web app, and from then on the server somehow knows it's you on every request: without asking for your password again. Very often, the thing carrying that "it's still me" proof is a **JWT**, a JSON Web Token. If you've seen a long, cryptic string with two dots in it sitting in a request header or browser storage, you've seen one. This guide takes that string apart piece by piece so you understand exactly what's inside, what each part does, and where the security lines are drawn.

## What a JWT is (and isn't)

A JWT is a compact, self-contained way to represent **claims**, statements about a user or session, as a signed token that can be passed between parties. "Self-contained" is the key idea: the token itself carries the data (who you are, when it expires), so the server doesn't necessarily have to look anything up. It reads the token, checks the signature, and trusts the contents.

Two things a JWT is *not*:

- **It is not encrypted by default.** Anyone who has the token can read what's inside it. A standard JWT is *signed*, not hidden: more on why that distinction matters below.
- **It is not a session stored on the server.** Traditional sessions keep state on the server and hand the browser a meaningless ID. A JWT flips that: the state lives in the token.

## The three parts, and the two dots

A JWT is three Base64URL-encoded segments joined by dots:

```
xxxxx.yyyyy.zzzzz
```

Those segments are the **header**, the **payload**, and the **signature**, in that order. The two dots are how you spot a JWT at a glance and how a parser splits it. Let's take each in turn.

### Part 1: The header

The first segment, decoded, is a small JSON object describing the token itself:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- `alg` is the **algorithm** used to sign the token, here `HS256` (HMAC with SHA-256). It might instead be `RS256` (RSA) for public/private-key signing.
- `typ` simply declares the token type as `JWT`.

The header tells the receiver how to verify the signature later. It's Base64URL-encoded, which is why the raw first segment looks like gibberish, but it's trivially decodable, not secret.

### Part 2: The payload

The middle segment is where the interesting data lives, the **claims**. Decoded, it's another JSON object:

```json
{
  "sub": "user_4021",
  "name": "Ada Lovelace",
  "role": "admin",
  "iat": 1710720000,
  "exp": 1710723600
}
```

Some of these are **registered claims**, standard, reserved names the spec defines so different systems agree on their meaning:

- `sub` (subject). Who the token is about, usually a user ID.
- `iat` (issued-at). When the token was created, as a Unix timestamp (seconds since 1 January 1970).
- `exp` (expiration), when the token stops being valid, also a Unix timestamp. A verifier that sees `exp` in the past must reject the token.
- `iss` (issuer) and `aud` (audience): who created the token and who it's intended for.

Everything else (`name`, `role` above) is a **custom claim** the application adds for its own use. Because the payload is only Base64URL-encoded, **never put secrets in it**: passwords, API keys, or anything you wouldn't want the token holder to read. Assume the payload is public.

### Part 3: The signature

The third segment is what makes a JWT trustworthy. It's produced by taking the encoded header, the encoded payload, and a **secret key** known only to the server, and running them through the algorithm named in the header:

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

The signature guarantees **integrity**: if anyone changes a single character of the header or payload, the signature no longer matches, and verification fails. This is the whole security model. The server doesn't hide the claims. It makes them *tamper-evident*. You can read the token, but you can't forge a valid one without the secret, so you can't quietly promote yourself from `"role": "user"` to `"role": "admin"`.

## How verification actually works

When a request arrives with a JWT, the server:

1. Splits the token on the dots into its three parts.
2. Recomputes the signature over the received header and payload using its secret key.
3. Compares that to the signature in the token. If they don't match, the token is rejected.
4. Checks the claims. Is `exp` in the future? Is `iss` who we expect? Only then is the request trusted.

Because all of this uses data inside the token plus a secret the server already holds, no database lookup is strictly required, which is what makes JWTs fast and easy to scale across many servers.

## Reading a token yourself

Since the header and payload are just Base64URL-encoded JSON, you can decode any JWT and see exactly what it claims. That's invaluable when debugging: checking why a token is being rejected, confirming an expiry, or auditing what claims your auth system actually issues. Paste a token into our [JWT decoder](/jwt-decoder) and it splits the three parts and shows you the decoded header and payload instantly, right in your browser. For a step-by-step walkthrough, see our [how to decode a JWT](/how-to/how-to-decode-a-jwt) guide.

One important caveat: decoding is **not** verifying. A decoder shows you the contents but does not check the signature. Anyone can decode a token, which is exactly why you must never trust a JWT's claims without verifying the signature server-side.

## Security rules worth memorising

- **Always use HTTPS.** A JWT in transit over plain HTTP can be stolen and replayed by anyone watching the network.
- **Keep tokens short-lived.** Small `exp` windows limit the damage if a token leaks. Pair short access tokens with a separate refresh mechanism.
- **Never store secrets in the payload.** It's readable by design.
- **Validate the algorithm.** Historically, some libraries could be tricked into accepting a token that declared `"alg": "none"`. Always enforce the algorithm you expect rather than trusting the header blindly.
- **Store tokens carefully in the browser.** Where and how you keep a JWT affects its exposure to cross-site scripting. Treat it like the credential it is.

## Readable, but tamper-evident

A JWT is three Base64URL-encoded pieces (header, payload, signature) joined by dots. The header says how it's signed, the payload carries readable claims like `sub`, `iat`, and `exp`, and the signature makes the whole thing tamper-evident using a server-side secret. Understanding that the contents are *readable but not forgeable* is the single most important idea: it explains why you can decode a token freely, why you must never hide secrets in one, and why the server must always verify the signature.

Want to see what's inside a real token? Drop it into the [JWT decoder](/jwt-decoder). It runs entirely in your browser, so your token never leaves your device.

## Decode one safely, and what to never do

The [JWT decoder](/jwt-decoder) splits and Base64URL-decodes the header and payload in your browser and shows the timestamps as readable dates, which makes token debugging concrete: read the `exp`, check the algorithm, see the claims. Two safety rules built into how it works. It decodes locally, because a real token pasted into an uploading tool is a leaked credential. And it verifies nothing, by design: signature verification needs the secret, and the secret belongs on your server, never in a browser tool.

## Sources

- [RFC 7519 (JSON Web Token (JWT))](https://www.rfc-editor.org/rfc/rfc7519), the claim names and structure
- [RFC 7515 (JSON Web Signature (JWS))](https://www.rfc-editor.org/rfc/rfc7515). How the signature is computed
