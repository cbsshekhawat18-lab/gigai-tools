import type { HowTo } from "@/types";

const howto: HowTo = {
  slug: "how-to-decode-a-jwt",
  title: "How to Decode a JWT (Read Its Header & Payload)",
  description:
    "Paste a JSON Web Token and read its header and claims in plain JSON, inspect the algorithm, expiry and scopes while debugging auth. A safe, browser-only guide.",
  accent: "sky",
  icon: "KeyRound",
  toolSlug: "jwt-decoder",
  seo: {
    title: "How to Decode a JWT and Read Its Claims (Free, Private)",
    description:
      "Learn how to decode a JSON Web Token. Read the header and payload, check exp, iss and scopes, and understand the signature. Free, runs in your browser, nothing logged.",
    keywords: [
      "how to decode a jwt",
      "decode jwt",
      "jwt decoder",
      "read jwt payload",
      "inspect json web token",
    ],
    canonical: "/how-to/how-to-decode-a-jwt",
  },
  intro: [
    "A JSON Web Token (JWT) is three Base64URL-encoded parts separated by dots: a header, a payload of claims, and a signature. It looks like random text, but the first two parts are just encoded JSON, not encrypted, so anyone can decode and read them. That's exactly what you do when debugging why a token is rejected, expired or missing a scope.",
    "Decoding a JWT means reversing that Base64URL encoding to reveal the header (which algorithm signed it) and the payload (who it's for, when it expires, what it can do). This guide shows how, using our JWT decoder that runs entirely in your browser: your token is never sent anywhere, so it's safe to inspect real access tokens.",
  ],
  steps: [
    {
      title: "Open the JWT decoder",
      body: "Go to the JWT decoder tool. It runs entirely in your browser, so nothing you paste is uploaded, logged or stored.",
    },
    {
      title: "Paste your token",
      body: "Copy the full token (the long string in the form xxxxx.yyyyy.zzzzz) and paste it in. Include all three segments and both dots so it decodes correctly.",
    },
    {
      title: "Read the decoded header",
      body: "The header decodes to JSON showing the signing algorithm (alg, e.g. HS256 or RS256) and the token type (typ). This tells you how the signature was produced and how it should be verified.",
    },
    {
      title: "Inspect the payload claims",
      body: "The payload reveals the claims, sub (subject/user), iss (issuer), aud (audience), scopes or roles, plus timestamps. This is where you find who the token represents and what it's allowed to do.",
    },
    {
      title: "Check the expiry and timing claims",
      body: "Look at exp (expiry), iat (issued-at) and nbf (not-before), which are Unix timestamps. If exp is in the past, the token is expired: the most common reason an otherwise valid token is rejected.",
    },
    {
      title: "Note the signature (but verify separately)",
      body: "The third segment is the signature. Decoding doesn't verify it. Proving the token is authentic and untampered requires the signing secret or public key, which you'd check server-side, not in a decoder.",
    },
  ],
  tips: [
    "A JWT is encoded, not encrypted. Never put anything secret in the payload, because anyone holding the token can read every claim.",
    "The exp, iat and nbf claims are Unix timestamps in seconds. Convert them to a readable date to confirm whether a token is currently valid.",
    "Decoding tells you what a token says. It does not tell you the token is genuine. Only signature verification with the correct key proves authenticity.",
    "If a valid-looking token is rejected, check exp first, then aud and iss. A mismatched audience or issuer is a frequent cause.",
  ],
  faq: [
    {
      question: "Is decoding a JWT the same as verifying it?",
      answer:
        "No. Decoding just Base64URL-decodes the header and payload so you can read them. Anyone can do it. Verifying checks the signature against the signing key to prove the token is authentic and unmodified, which requires the secret or public key.",
    },
    {
      question: "Is it safe to paste a real token into a decoder?",
      answer:
        "With this tool, yes. It decodes entirely in your browser and never transmits or stores your token. Be cautious with online decoders that send tokens to a server, since a live access token is effectively a password.",
    },
    {
      question: "Why can I read the payload without a key?",
      answer:
        "Because a standard JWT is signed, not encrypted. The signature guarantees integrity, but the header and payload are only Base64URL-encoded, so they're plainly readable. That's why you should never store secrets in the claims.",
    },
    {
      question: "How do I tell if a JWT is expired?",
      answer:
        "Look at the exp claim in the payload, it's a Unix timestamp. If that moment is in the past, the token has expired. Servers reject expired tokens, so this is the first thing to check when authentication fails.",
    },
    {
      question: "What do sub, iss and aud mean?",
      answer:
        "They're standard claims: sub is the subject (usually the user the token represents), iss is the issuer that created the token, and aud is the intended audience or recipient. Mismatched iss or aud values are a common cause of rejected tokens.",
    },
  ],
  relatedToolSlugs: [
    "base64-decoder",
    "base64-encoder",
    "json-formatter",
    "hash-generator",
  ],
  relatedHowToSlugs: [],
};

export default howto;
