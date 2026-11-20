import type { Tool } from "@/types";

/**
 * JWT Decoder: a jwt.io-style token inspector that runs entirely in the browser.
 * Copy is unique to this tool: the emphasis is that decoding a JWT reveals its
 * contents without proving they're trustworthy, that verification is optional and
 * local, and that no token ever leaves the tab. Nothing here is shared with other
 * dev tools' SEO copy.
 */
const jwtDecoder: Tool = {
  slug: "jwt-decoder",
  title: "JWT Decoder",
  description:
    "Decode and inspect any JSON Web Token instantly. Read the header, payload and signature, see when it was issued and expires, and optionally verify an HS256 signature. 100% in-browser. Your token never leaves your device.",
  category: "developer-tools",
  icon: "KeyRound",
  accent: "violet",
  status: "live",
  featured: true,
  createdAt: "2026-06-20",

  h1: "JWT Decoder & Verifier",
  tagline:
    "Paste a JSON Web Token and read it like jwt.io, color-coded header, payload and signature, human-readable expiry, and optional local HS256 verification. Nothing is uploaded.",
  longDescription:
    "A JSON Web Token (JWT) packs three Base64URL-encoded parts (a header, a payload of claims, and a signature) into one compact string that services pass around for authentication and authorization. This JWT Decoder splits the token and pretty-prints the header and payload as formatted JSON, then translates the time-based claims (iat, exp, nbf) into readable dates and a live 'valid for' or 'expired' badge, so you can debug an auth flow at a glance. Because a decoded token is just data, anyone can read it, signature verification is separate and opt-in: paste your HS256 secret and the tool re-computes the HMAC with the Web Crypto API right in your browser to confirm the token is genuine. Every byte stays on your machine. There is no server round-trip, no logging, and no account, which matters because tokens often carry live session credentials you should never paste into a website that phones home.",

  ctaText: "Decode JWT",

  keywords: [
    "jwt decoder",
    "decode jwt",
    "jwt debugger",
    "jwt viewer",
    "json web token decoder",
    "jwt parser online",
    "verify jwt signature",
    "hs256 verify",
    "jwt expiry checker",
    "decode jwt payload",
  ],

  seo: {
    title: "JWT Decoder, Decode & Verify JSON Web Tokens Free | GigAI Tools",
    description:
      "Free online JWT decoder and debugger. Paste a JSON Web Token to read its header, payload and signature, check the expiry, and verify HS256 signatures: all in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Columns3",
      title: "Three color-coded panes",
      description:
        "Header, payload and signature are split into distinct, syntax-tinted panels (exactly like jwt.io) so the structure of the token is obvious at a glance and each part is copyable on its own.",
    },
    {
      icon: "CalendarClock",
      title: "Human-readable timestamps",
      description:
        "The iat, exp and nbf claims are decoded from raw epoch seconds into full local and UTC dates plus a relative phrase like 'expires in 42 minutes', so you never have to convert Unix time by hand.",
    },
    {
      icon: "BadgeCheck",
      title: "Live expiry & validity badge",
      description:
        "A prominent status pill shows whether the token is valid, not-yet-valid, or already expired, recomputed against the current time the moment you paste, with the exact seconds remaining.",
    },
    {
      icon: "ShieldCheck",
      title: "Optional HS256 verification",
      description:
        "Drop in your shared secret and the tool re-signs the header and payload with HMAC-SHA256 via Web Crypto to confirm the signature matches, a genuine cryptographic check, done locally.",
    },
    {
      icon: "Lock",
      title: "Nothing leaves your browser",
      description:
        "Decoding and verification run 100% client-side. Your token and secret are never transmitted, stored or logged, which is essential when the token is a live session credential.",
    },
    {
      icon: "Zap",
      title: "Instant, keyboard-first",
      description:
        "Decoding is live as you type or paste. No submit button. Drag a.jwt/.txt file in, paste from the clipboard, copy any part, share a deep link, and drive it all from the keyboard.",
    },
  ],

  benefits: [
    {
      title: "Debug auth flows in seconds",
      description:
        "Stop squinting at opaque token strings. See the issuer, subject, scopes and audience in clean JSON and immediately spot a missing claim, a wrong 'aud', or a token that expired minutes ago.",
    },
    {
      title: "Safe for real credentials",
      description:
        "Unlike most online decoders, this one never sends your token anywhere. That means you can safely inspect production access tokens without leaking a live session to a third-party server.",
    },
    {
      title: "Honest about what decoding proves",
      description:
        "Decoding is not verification. Anyone can read a JWT's claims. We make that distinction explicit and give you a real, local signature check so you know when a token is actually authentic.",
    },
    {
      title: "No sign-up, no limits",
      description:
        "It's a single web page. Decode as many tokens as you like on any device, with no daily cap, no watermark and no account wall between you and the answer.",
    },
  ],

  howTo: [
    {
      title: "Paste your token",
      description:
        "Drop a JWT into the input. Paste it, drag a.txt/.jwt file onto the pane, or load the sample token to see how it works. Decoding starts instantly.",
    },
    {
      title: "Read the three parts",
      description:
        "The header shows the algorithm and type, the payload lists every claim as formatted JSON, and the signature is shown raw. Time claims are expanded into readable dates automatically.",
    },
    {
      title: "Check the status",
      description:
        "Glance at the validity badge to see whether the token is active or expired and exactly how long it has left, plus its issued-at and not-before times.",
    },
    {
      title: "Verify the signature (optional)",
      description:
        "For an HS256 token, expand the verifier, type your shared secret, and confirm whether the signature is valid, computed locally with Web Crypto.",
    },
    {
      title: "Copy or share",
      description:
        "Copy the header, payload or full decoded output with one click, or generate a share link that reopens the exact token you're inspecting.",
    },
  ],

  formats: {
    input: ["JWT", "JWS", "Base64URL token", ".txt", ".jwt"],
    output: ["JSON", "Decoded claims", "Copied text"],
  },

  useCases: [
    {
      audience: "Backend developers",
      title: "Inspect API access tokens",
      description:
        "Confirm the scopes, audience and expiry your identity provider is minting, and reproduce a '401' by spotting a stale 'exp': without pasting a live token into an untrusted site.",
    },
    {
      audience: "Frontend & mobile engineers",
      title: "Debug login and refresh flows",
      description:
        "See exactly what a token carries after sign-in, verify the 'sub' matches the logged-in user, and check whether an access token has already expired before you blame the network layer.",
    },
    {
      audience: "QA & security testers",
      title: "Validate token hardening",
      description:
        "Check that tokens set sensible lifetimes and 'nbf' windows, confirm the signing algorithm is what you expect, and verify HS256 signatures against a test secret during pen-testing.",
    },
    {
      audience: "Support & DevOps",
      title: "Triage auth incidents fast",
      description:
        "When a customer reports 'logged out randomly', paste their token to read the expiry and issued-at claims and turn a vague report into a precise timing answer in seconds.",
    },
  ],

  faq: [
    {
      question: "What does a JWT decoder actually do?",
      answer:
        "A JWT is three Base64URL-encoded pieces joined by dots: a header, a payload of claims, and a signature. A decoder splits the token and Base64URL-decodes the header and payload back into readable JSON so you can see what's inside, the issuer, subject, scopes, expiry and any custom claims. This tool also translates the time-based claims into human dates and can optionally verify the signature.",
    },
    {
      question: "Is decoding a JWT the same as verifying it?",
      answer:
        "No, and this is the most important thing to understand. Decoding just reveals the claims. Anyone who has the token can read them, because the payload is only encoded, not encrypted. Verifying means checking the signature with the signing key to prove the token is authentic and unmodified. This tool decodes every token but only verifies when you supply the secret (for HS256) so it can recompute the signature.",
    },
    {
      question: "Is it safe to paste my token here?",
      answer:
        "Yes. Everything happens inside your browser tab using JavaScript and the Web Crypto API: your token and any secret you enter are never uploaded, stored or logged by us. That local-only design is exactly why it's safe to inspect real, live tokens here when it wouldn't be on a decoder that sends data to a server.",
    },
    {
      question: "How do I verify a JWT signature?",
      answer:
        "For an HS256 token, expand the signature verifier and paste the shared secret the token was signed with. The tool re-computes the HMAC-SHA256 of the header and payload and compares it to the token's signature, then tells you whether it matches. Verification runs locally with Web Crypto. Note that HS256 uses a symmetric secret. RS256/ES256 tokens are signed with a private key and are shown as decoded but not verified here.",
    },
    {
      question: "Why does the tool say my token is expired?",
      answer:
        "The 'exp' claim is a Unix timestamp marking when the token stops being valid. The tool compares it to your device's current clock and shows 'expired' with how long ago it lapsed. If a token you believe is fresh reads as expired, check that your system clock is correct. A skewed clock is a common cause of confusing auth failures.",
    },
    {
      question: "What do iat, exp and nbf mean?",
      answer:
        "These are standard registered claims. 'iat' (issued at) is when the token was created, 'exp' (expiration) is when it becomes invalid, and 'nbf' (not before) is the earliest time it may be used. All three are Unix timestamps in seconds. The decoder expands each into a full local and UTC date plus a relative phrase so you don't have to convert epoch time yourself.",
    },
    {
      question: "Can it decode expired or unsigned tokens?",
      answer:
        "Yes. Decoding is purely structural, so an expired token decodes exactly the same, you'll just see the 'expired' badge. Unsigned tokens (algorithm 'none', with an empty signature part) also decode fine. The signature pane will simply show that there is no signature to verify.",
    },
    {
      question: "Do you support RS256 and other algorithms?",
      answer:
        "The decoder reads tokens signed with any algorithm and shows you which one from the header's 'alg' field. Signature verification in this tool is currently HS256 only, because HS256 uses a single shared secret you can paste. RS256 and ES256 are verified with a public key and are on our roadmap. For now those tokens decode fully but aren't cryptographically checked here.",
    },
  ],

  tips: [
    "The payload is only encoded, not encrypted. Never store anything secret in a JWT claim, because anyone with the token can read it in a decoder like this one.",
    "If verification fails on a token you trust, check for a trailing newline or whitespace when you copied the secret, and confirm the secret is the raw signing key, not a Base64 wrapping of it.",
    "A token can be perfectly valid by signature yet expired by time, always read the validity badge, not just the verifier result.",
    "Use the share link to hand a teammate the exact token you're looking at. The token travels in the URL fragment, so it still never touches a server.",
    "When comparing two tokens, decode one, copy its payload, then paste the next, the copy buttons make diffing claims by eye much faster.",
  ],

  troubleshooting: [
    {
      problem: "'A JWT must have 2 or 3 dot-separated parts' error.",
      solution:
        "You've likely pasted a partial token or an extra fragment. A JWT looks like xxxxx.yyyyy.zzzzz. Make sure you copied the whole string with both dots and no surrounding quotes, and that a 'Bearer ' prefix wasn't included.",
    },
    {
      problem: "The header or payload won't decode as JSON.",
      solution:
        "This usually means a character was mangled in transit, a '+' turned into a space, or the string got line-wrapped. Re-copy the token in one piece. The tool already handles Base64URL padding, so you don't need to add '=' characters yourself.",
    },
    {
      problem: "HS256 verification says invalid but the secret is right.",
      solution:
        "Confirm the token's 'alg' is actually HS256 (an RS256 token can't be verified with a shared secret), and check the secret has no hidden trailing whitespace. Also ensure it's the exact raw key used server-side, byte for byte.",
    },
    {
      problem: "Timestamps look wrong or off by hours.",
      solution:
        "The dates are computed from your device clock and shown in both UTC and your local zone. A machine with an incorrect clock or timezone will make a valid token appear expired or not-yet-valid, sync your system time and re-decode.",
    },
  ],

  security:
    "Your JWT and any secret you enter are processed entirely in your browser with JavaScript and the Web Crypto API. Nothing is uploaded, stored, or logged on our servers, which is precisely why it's safe to inspect real, live tokens here. Note that decoding a token only reveals its contents. It does not prove the token is authentic. Treat any token you paste as a live credential and clear it when you're done.",

  changelog: [
    {
      date: "2026-06-20",
      change:
        "Initial release: three-pane header/payload/signature view, human-readable iat/exp/nbf, live validity badge, and local HS256 signature verification.",
    },
    {
      date: "2026-06-26",
      change:
        "Added drag-and-drop and paste import for .jwt/.txt files, per-part copy buttons, and shareable deep links that carry the token in the URL fragment.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the expiry badge to show precise seconds remaining, surfaced 'not before' warnings, and added keyboard shortcuts with an in-app reference.",
    },
  ],

  relatedTools: [
    "base64-encode-decode",
    "unix-timestamp-converter",
    "hash-generator",
    "url-encode-decode",
    "json-formatter",
  ],
};

export default jwtDecoder;
