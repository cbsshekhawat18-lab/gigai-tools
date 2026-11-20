import type { Tool } from "@/types";

/**
 * SSL Certificate Checker (paste-a-cert / learn mode), group "Headers &
 * Security". A browser cannot open a raw TLS socket to a remote host, and we
 * deliberately run no server to proxy that handshake, so this tool is honest
 * about its shape: paste a PEM certificate and it recovers everything feasible
 * client-side (SHA-1/SHA-256 fingerprints via Web Crypto, DER byte length, the
 * DNS names / Common Name candidates recoverable from the DER), then pairs that
 * with a curated TLS/SSL best-practice checklist so the tool teaches instead of
 * faking a live scan. All copy below is unique to certificate inspection and
 * HTTPS hardening so the page ranks on its own merits.
 */
const sslChecker: Tool = {
  slug: "ssl-checker",
  title: "SSL Certificate Checker",
  description:
    "Paste a PEM/X.509 certificate to extract its SHA-1 & SHA-256 fingerprints, DNS names and identity strings, then work through a complete TLS/SSL hardening checklist: 100% in your browser, nothing uploaded.",
  category: "seo-tools",
  group: "Headers & Security",
  icon: "Lock",
  accent: "cyan",
  status: "live",
  featured: true,
  createdAt: "2026-06-18",

  h1: "SSL Certificate Checker, Inspect a PEM Cert & TLS Best-Practice Checklist",
  tagline:
    "Paste an X.509 certificate to read its fingerprints, DNS names and recovered identity strings, then run down a battle-tested TLS/SSL hardening checklist: all decoded locally in your browser, so private certs never leave your machine.",
  longDescription:
    "The GigAI SSL Certificate Checker is an honest, in-browser certificate inspector and HTTPS hardening companion. Paste a PEM block (the `-----BEGIN CERTIFICATE-----` … `-----END CERTIFICATE-----` text) and it decodes the Base64 to raw DER, computes exact SHA-1 and SHA-256 fingerprints with the browser's own Web Crypto engine, reports the DER byte length, and recovers the printable identity strings inside, surfacing the Subject Alternative Name DNS entries and Common Name candidates so you can confirm which hostnames a certificate actually covers. Because a web page has no way to open a TLS socket to a remote server, and we intentionally ship no backend to do it for you, the tool never pretends to run a live handshake: instead it gives you what the pasted certificate genuinely contains plus a curated, copy-ready TLS/SSL best-practice checklist covering chain completeness, expiry and renewal, SAN hostname matching, protocol and cipher strength, HSTS, OCSP stapling, key size and the HTTP→HTTPS redirect: each with the exact openssl or nmap command to verify it yourself. Everything runs on the certificate you paste, so it is safe for internal PKI, staging certificates and keys you would never send to a third-party scanner. Close the tab and every byte is gone.",

  ctaText: "Check a certificate",

  keywords: [
    "ssl checker",
    "ssl certificate checker",
    "pem certificate decoder",
    "x509 certificate parser",
    "certificate fingerprint sha256",
    "tls certificate inspector",
    "read pem certificate",
    "ssl fingerprint generator",
    "san dns names certificate",
    "tls best practices checklist",
    "https hardening",
    "decode certificate online",
  ],

  seo: {
    title: "SSL Certificate Checker, Decode a PEM Cert & TLS Checklist | GigAI Tools",
    description:
      "Free SSL certificate checker: paste a PEM/X.509 cert to get its SHA-1 & SHA-256 fingerprints, DNS/SAN names and identity strings, plus a full TLS hardening checklist. Runs in your browser, nothing uploaded.",
  },

  features: [
    {
      icon: "Fingerprint",
      title: "Exact SHA-1 & SHA-256 fingerprints",
      description:
        "The pasted PEM is decoded to raw DER and hashed with the browser's native Web Crypto, so the colon-separated SHA-1 and SHA-256 fingerprints match exactly what openssl and your certificate store report.",
    },
    {
      icon: "Globe",
      title: "Recovered DNS names & SAN hosts",
      description:
        "The tool pulls the printable strings out of the DER and highlights the Subject Alternative Name DNS entries and Common Name candidates, so you can confirm precisely which hostnames the certificate is meant to cover.",
    },
    {
      icon: "ListChecks",
      title: "Complete TLS/SSL hardening checklist",
      description:
        "A curated best-practice list, chain, expiry, SAN match, TLS 1.2+/1.3, strong ciphers with forward secrecy, HSTS, OCSP stapling, key strength and HTTP→HTTPS redirect, each with the exact command to verify it.",
    },
    {
      icon: "ShieldCheck",
      title: "Honest about live scanning",
      description:
        "No fake handshake. A browser can't open a TLS socket and we run no proxy, so the tool decodes what your pasted certificate actually contains and points you to the right server-side command for a live probe.",
    },
    {
      icon: "Lock",
      title: "Private by design, nothing uploaded",
      description:
        "Every byte is decoded and hashed locally in your browser, making it safe for internal PKI, staging certificates and material you'd never send to a third-party online scanner.",
    },
    {
      icon: "Copy",
      title: "Copy fingerprints, export a report",
      description:
        "Copy any fingerprint or DNS name with a click, load a real sample certificate to explore, and export the full parsed result plus checklist as a text report for a ticket or audit trail.",
    },
  ],

  benefits: [
    {
      title: "Confirm you pasted the right certificate",
      description:
        "Fingerprints and recovered hostnames let you match a PEM against what's deployed, pin a certificate, or verify a renewal is the intended cert before you roll it out.",
    },
    {
      title: "Harden HTTPS without memorising openssl",
      description:
        "The checklist turns a decade of TLS lore (SANs over CN, TLS 1.3, forward secrecy, HSTS preload, OCSP stapling) into concrete steps with the exact command for each, so nothing important slips.",
    },
    {
      title: "Inspect certificates you can't upload",
      description:
        "Internal, staging and client PKI certificates stay on your machine because parsing is 100% local. No third-party SSL scanner ever sees the bytes.",
    },
    {
      title: "Understand the limits, honestly",
      description:
        "You always know exactly what's exact (fingerprints, DER length, recovered strings) versus what needs a full ASN.1 parser or a live handshake. No guesswork, no fabricated fields.",
    },
  ],

  howTo: [
    {
      title: "Get the certificate in PEM form",
      description:
        "Export it from your host or fetch it with `openssl s_client -connect example.com:443 -showcerts`, or open the.pem/.crt/.cer file. You want the text block from -----BEGIN CERTIFICATE----- to -----END CERTIFICATE-----.",
    },
    {
      title: "Paste it into the checker",
      description:
        "Drop the PEM into the box (or use the sample). It's decoded and hashed instantly in your browser. Nothing is sent anywhere.",
    },
    {
      title: "Read the fingerprints & hostnames",
      description:
        "Confirm the SHA-256 fingerprint matches what you expect, and check the recovered DNS/SAN names cover every hostname the certificate must serve.",
    },
    {
      title: "Work through the TLS checklist",
      description:
        "Go down the hardening list and run the verify command beside each item against your live server to close any gaps the pasted certificate can't show.",
    },
  ],

  formats: {
    input: ["PEM certificate", "X.509"],
    output: ["Fingerprints", "DNS names", "Text report"],
  },

  useCases: [
    {
      audience: "DevOps / SRE",
      title: "Verify a renewal before deploy",
      description:
        "Paste the freshly issued certificate, confirm its SHA-256 fingerprint and SAN list are what you expect, then use the checklist to double-check chain order and stapling before pushing it to production.",
    },
    {
      audience: "Security engineer",
      title: "Audit an internal PKI certificate",
      description:
        "Inspect a certificate from an internal or air-gapped CA that must never touch a third-party scanner: fingerprints and hostnames are recovered entirely on your machine.",
    },
    {
      audience: "Web developer",
      title: "Debug an HTTPS misconfiguration",
      description:
        "Confirm the certificate you're serving actually lists the hostname in its SAN block, then walk the checklist to find the missing redirect, weak protocol or absent HSTS behind a browser warning.",
    },
    {
      audience: "IT / support",
      title: "Match a certificate to a fingerprint",
      description:
        "When a vendor or monitor reports a certificate by fingerprint, paste the PEM here to generate the same SHA-1/SHA-256 values and confirm you're looking at the identical certificate.",
    },
  ],

  troubleshooting: [
    {
      problem: "It says no PEM certificate was found.",
      solution:
        "Make sure you pasted the full block including the -----BEGIN CERTIFICATE----- and -----END CERTIFICATE----- lines. A bare.der/.crt binary or a private key won't work, export the certificate in PEM (Base64) form, e.g. `openssl x509 -inform der -in cert.der -out cert.pem`.",
    },
    {
      problem: "Why don't I see the expiry date, issuer or key size?",
      solution:
        "Those live in the certificate's ASN.1 structure, which needs a full X.509 parser we intentionally keep out of the bundle to stay small and fast. The fingerprints, DER length and recovered hostnames are exact. For validity dates and key size run `openssl x509 -noout -text -in cert.pem` locally.",
    },
    {
      problem: "Can it check a live website's certificate by URL?",
      solution:
        "No. A browser can't open a raw TLS socket to another host, and we run no server to do it for you. That's why this is a paste-a-cert tool. Grab the live cert with `openssl s_client -connect host:443 -showcerts` and paste it, or use a server-side scanner for a full handshake report.",
    },
    {
      problem: "The recovered strings include some odd fragments.",
      solution:
        "Recovered strings are printable byte runs pulled straight from the DER, so alongside real hostnames and org names you may see OIDs or encoding artefacts. The DNS names and Common Name lists are filtered to valid host patterns. Treat the raw strings as a best-effort peek, not a decoded field list.",
    },
  ],

  tips: [
    "Compare the SHA-256 fingerprint here against the one your monitoring or vendor reports to be certain you're inspecting the exact same certificate.",
    "Certificates now rely on the SAN list, not the legacy Common Name, confirm every hostname you serve appears in the recovered DNS names.",
    "Automate renewal with ACME (Let's Encrypt) so a certificate never expires unnoticed. The checklist's expiry item shows how to read the dates.",
    "Pair this with the Security Header Checker to verify your HSTS `max-age`, `includeSubDomains` and `preload` directives are set correctly.",
    "To grab a live server's certificate for pasting: `echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509`.",
  ],

  security:
    "Every certificate is decoded, hashed and inspected locally in your browser using its native Web Crypto and Base64 decoders: nothing you paste is ever uploaded, stored or logged. Internal PKI certificates, staging material and confidential hostnames stay on your device, and closing the tab erases them completely.",

  faq: [
    {
      question: "Can this SSL checker scan a live website by URL?",
      answer:
        "No, and it's honest about why. A web page cannot open a raw TLS socket to a remote server, and we deliberately run no backend to proxy that handshake, so there's nothing to fake. Instead you paste the certificate (grab it with `openssl s_client -connect host:443 -showcerts`) and the tool decodes everything feasible client-side, then hands you a checklist with the exact commands to probe the live server yourself.",
    },
    {
      question: "What certificate format do I paste?",
      answer:
        "PEM, the Base64 text block that starts with -----BEGIN CERTIFICATE----- and ends with -----END CERTIFICATE-----. That's what most hosts export and what `openssl x509` emits. If you only have a binary DER (.der/.cer), convert it first with `openssl x509 -inform der -in cert.der -out cert.pem`, then paste the result.",
    },
    {
      question: "Why can I see the fingerprints and hostnames but not the expiry date?",
      answer:
        "Fingerprints are a hash of the whole DER, and hostnames are recoverable as printable strings. Both are computed exactly in the browser. Validity dates, issuer, serial number and key size live inside the certificate's ASN.1 structure, which requires a full X.509 parser we intentionally keep out of the bundle for size and speed. For those fields run `openssl x509 -noout -text -in cert.pem` locally, nothing leaves your machine either way.",
    },
    {
      question: "How do I read a certificate's expiry and issuer myself?",
      answer:
        "Locally with openssl: `openssl x509 -noout -dates -issuer -subject -in cert.pem` prints notBefore/notAfter, the issuer and subject. For a live server, `echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates` shows the deployed certificate's validity window.",
    },
    {
      question: "Are the SHA-256 and SHA-1 fingerprints the same as openssl's?",
      answer:
        "Yes. The tool decodes the PEM to the identical DER bytes openssl uses and hashes them with the browser's Web Crypto, so the colon-separated SHA-256 and SHA-1 values match `openssl x509 -noout -fingerprint -sha256 -in cert.pem` (and the SHA-1 variant) exactly. That makes it reliable for pinning and for matching a certificate against a reported fingerprint.",
    },
    {
      question: "Is it safe to paste an internal or private certificate?",
      answer:
        "Yes. All parsing, hashing and string recovery happen entirely in your browser. No network request is made with the certificate data, and nothing is stored. That's precisely why the tool is paste-first: internal PKI, staging and air-gapped certificates that must never reach a third-party scanner can be inspected safely on your own machine. (You'd still never paste a private key anywhere, only the public certificate.)",
    },
    {
      question: "What does the TLS/SSL checklist cover?",
      answer:
        "The essentials of a hardened HTTPS setup: a complete, trusted certificate chain in the right order. A valid, unexpired certificate. The hostname present in the SAN list. TLS 1.2+ (ideally 1.3) with old protocols disabled. Strong AEAD ciphers with forward secrecy. HSTS. OCSP stapling. Adequate key strength (RSA ≥ 2048 or ECDSA P-256/384), and a full HTTP→HTTPS redirect. Each item includes the exact openssl, nmap or curl command to verify it.",
    },
    {
      question: "Why should I care about SANs versus the Common Name?",
      answer:
        "Modern browsers stopped trusting the legacy Common Name field years ago and now require the hostname to appear in the certificate's Subject Alternative Name (SAN) list. If a certificate serves a hostname that's only in the CN and not the SANs, users get a name-mismatch error. That's why the checker surfaces the recovered DNS/SAN names first, so you can confirm coverage at a glance.",
    },
  ],

  changelog: [
    {
      date: "2026-06-18",
      change:
        "Initial release: paste-a-PEM decoding with exact SHA-1/SHA-256 fingerprints via Web Crypto, DER length, recovered DNS/SAN names and Common Name candidates, plus the full TLS/SSL best-practice checklist.",
    },
    {
      date: "2026-06-24",
      change:
        "Added one-click copy for fingerprints and hostnames, a real sample certificate to explore, and a downloadable text report combining the parsed result with the hardening checklist.",
    },
    {
      date: "2026-06-30",
      change:
        "Refined the DNS-name filtering to reduce DER artefacts and clarified the honest note on what full X.509 decoding and a live handshake require.",
    },
  ],

  relatedTools: [
    "security-header-checker",
    "http-header-checker",
    "meta-tag-analyzer",
    "json-formatter",
    "url-encoder",
  ],
};

export default sslChecker;
