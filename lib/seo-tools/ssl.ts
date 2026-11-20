/**
 * GigAI Tools, SSL / TLS engine (HONEST, paste-a-cert / learn mode).
 *
 * A browser cannot open a raw TLS socket to inspect a live certificate, and we
 * deliberately run no server to proxy that, so this engine does two honest
 * things instead:
 *
 *  1. `parseCertificate(pem)` extracts what is feasible from a pasted PEM
 *     certificate WITHOUT a heavy X.509/ASN.1 dependency: PEM structure, DER
 *     byte length, fingerprints (SHA-1/256 via Web Crypto), and any printable
 *     strings (CN / O / DNS SANs) recoverable from the DER. It is transparent
 *     that full field decoding (validity dates, key size) needs a proper ASN.1
 *     parser we intentionally keep out of the bundle.
 *  2. `sslChecklist()` returns an educational best-practice checklist so the
 *     tool teaches rather than fakes a live scan.
 */

/* ------------------------------ certificate ------------------------------- */

export interface CertFingerprints {
  sha1: string;
  sha256: string;
}

export interface ParsedCertificate {
  ok: true;
  /** The DER byte length of the decoded certificate. */
  derLength: number;
  fingerprints: CertFingerprints;
  /** Best-effort strings recovered from the DER (may include CN/O/SANs). */
  recoveredStrings: string[];
  /** DNS names found via SAN-style `*.example.com` / `example.com` patterns. */
  dnsNames: string[];
  /** Common Name candidates recovered heuristically. */
  commonNameCandidates: string[];
  /** Honest note about the limits of client-side parsing. */
  note: string;
}

export interface CertificateError {
  ok: false;
  error: { message: string };
}

export type ParseCertificateResult = ParsedCertificate | CertificateError;

const PEM_BODY_RE = /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/;

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s+/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bufferToHexColons(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += 1) parts.push((bytes[i] ?? 0).toString(16).padStart(2, "0"));
  return parts.join(":").toUpperCase();
}

/** Extract runs of printable ASCII (length ≥ 2) from a DER byte array. */
function recoverStrings(der: Uint8Array): string[] {
  const out: string[] = [];
  let current = "";
  for (let i = 0; i < der.length; i += 1) {
    const b = der[i] ?? 0;
    if (b >= 0x20 && b <= 0x7e) {
      current += String.fromCharCode(b);
    } else {
      if (current.length >= 2) out.push(current);
      current = "";
    }
  }
  if (current.length >= 2) out.push(current);
  // De-duplicate while preserving order.
  return [...new Set(out)];
}

/**
 * Parse a pasted PEM certificate as far as is feasible client-side. Returns
 * fingerprints + recovered identity strings, or a typed error for malformed
 * input. Honest by design about what full X.509 decoding would require.
 */
export async function parseCertificate(pem: string): Promise<ParseCertificateResult> {
  const match = PEM_BODY_RE.exec(pem);
  if (!match || !match[1]) {
    return {
      ok: false,
      error: {
        message:
          "No PEM certificate found. Paste a block starting with -----BEGIN CERTIFICATE----- and ending with -----END CERTIFICATE-----.",
      },
    };
  }

  let der: Uint8Array;
  try {
    der = base64ToBytes(match[1]);
  } catch {
    return { ok: false, error: { message: "The certificate body is not valid Base64." } };
  }
  if (der.length < 16) {
    return { ok: false, error: { message: "Decoded certificate is too short to be valid." } };
  }

  const derBuffer = der.buffer.slice(der.byteOffset, der.byteOffset + der.byteLength) as ArrayBuffer;
  const [sha1, sha256] = await Promise.all([
    crypto.subtle.digest("SHA-1", derBuffer),
    crypto.subtle.digest("SHA-256", derBuffer),
  ]);

  const strings = recoverStrings(der);
  const dnsNames = [
    ...new Set(
      strings.filter((s) => /^(\*\.)?([a-z0-9-]+\.)+[a-z]{2,}$/i.test(s.trim())),
    ),
  ];
  const commonNameCandidates = dnsNames.slice(0, 8);

  return {
    ok: true,
    derLength: der.length,
    fingerprints: {
      sha1: bufferToHexColons(sha1),
      sha256: bufferToHexColons(sha256),
    },
    recoveredStrings: strings,
    dnsNames,
    commonNameCandidates,
    note:
      "Fingerprints and recovered strings are exact, but full X.509 field decoding (validity dates, issuer chain, key size) needs an ASN.1 parser we intentionally keep out of the bundle. For a live TLS handshake check, use a server-side scanner. We run none by design.",
  };
}

/* ------------------------------- checklist -------------------------------- */

export interface ChecklistItem {
  id: string;
  title: string;
  detail: string;
  /** How to verify it yourself. */
  how: string;
}

/**
 * An educational TLS/SSL best-practice checklist. This is "learn mode": it does
 * not scan anything. It documents what a correct HTTPS setup looks like so the
 * tool is useful and honest without pretending to run a live probe.
 */
export function sslChecklist(): ChecklistItem[] {
  return [
    {
      id: "valid-chain",
      title: "Complete, trusted certificate chain",
      detail: "The server must send the leaf certificate plus all intermediates, ordered leaf → intermediate.",
      how: "Run `openssl s_client -connect example.com:443 -showcerts` and confirm the chain resolves to a trusted root.",
    },
    {
      id: "not-expired",
      title: "Certificate is within its validity window",
      detail: "notBefore ≤ now ≤ notAfter. Renew well before expiry. Automate with ACME (Let's Encrypt).",
      how: "`echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates`.",
    },
    {
      id: "hostname-match",
      title: "Hostname matches a SAN entry",
      detail: "Modern clients ignore the legacy CN and require the hostname in the Subject Alternative Name list.",
      how: "Inspect the SAN block: `openssl x509 -noout -text | grep -A1 'Subject Alternative Name'`.",
    },
    {
      id: "strong-protocol",
      title: "TLS 1.2+ only (disable TLS 1.0/1.1 and SSLv3)",
      detail: "Old protocols are insecure and fail PCI compliance. Prefer TLS 1.3 where possible.",
      how: "Test with `nmap --script ssl-enum-ciphers -p 443 example.com` or an external SSL Labs scan.",
    },
    {
      id: "strong-ciphers",
      title: "Strong cipher suites, forward secrecy",
      detail: "Prefer ECDHE key exchange and AEAD ciphers (AES-GCM, ChaCha20-Poly1305). Drop RC4/3DES/CBC-only.",
      how: "Review the negotiated cipher in the s_client output. Audit the full list with ssl-enum-ciphers.",
    },
    {
      id: "hsts",
      title: "HSTS enabled",
      detail: "Send `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` to force HTTPS.",
      how: "Use the Security Headers tool here. Paste your response headers and check the HSTS grade.",
    },
    {
      id: "ocsp-stapling",
      title: "OCSP stapling on",
      detail: "Stapling lets the server prove the cert isn't revoked without the client making a separate OCSP call.",
      how: "`openssl s_client -connect example.com:443 -status` and look for `OCSP Response Status: successful`.",
    },
    {
      id: "key-size",
      title: "Adequate key strength",
      detail: "RSA ≥ 2048-bit (2048/3072) or ECDSA P-256/P-384. Avoid 1024-bit keys and SHA-1 signatures.",
      how: "`openssl x509 -noout -text` and read the Public-Key and Signature Algorithm lines.",
    },
    {
      id: "redirect",
      title: "HTTP → HTTPS redirect",
      detail: "All plain-HTTP requests should 301-redirect to HTTPS so no content loads insecurely.",
      how: "`curl -sI http://example.com` and confirm a 301/308 to the https:// URL.",
    },
  ];
}
