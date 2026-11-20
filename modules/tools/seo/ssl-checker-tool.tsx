"use client";

import * as React from "react";

import type { WorkspaceToolData } from "@/types";
import { Icon } from "@/lib/icons";
import {
  PasteAnalyze,
  type AnalysisReport,
  type CheckItem,
} from "@/components/tool/seo";
import {
  parseCertificate,
  sslChecklist,
  type ParsedCertificate,
  type ChecklistItem,
} from "@/lib/seo-tools/ssl";

/**
 * SSL Certificate Checker, the paste-first, honest certificate inspector.
 *
 * Wraps the mandated `<PasteAnalyze>` archetype. The user pastes a PEM
 * certificate; `parseCertificate` (native Base64 + Web Crypto, fully in-browser)
 * recovers the exact SHA-1/SHA-256 fingerprints, DER length and the DNS/SAN and
 * Common Name strings inside the DER. We shape that into a grouped
 * {@link AnalysisReport} whose first group is the parsed identity (fingerprints,
 * hostnames, recovered strings) and whose second group is the curated TLS/SSL
 * hardening checklist. Nothing is uploaded. A browser can't open a TLS socket
 * and we run no proxy, so this is deliberately paste-a-cert / learn mode.
 */

/* --------------------------- inline copy control -------------------------- */

/** A tiny inline "copy this value" chip used inside custom detail nodes. */
function CopyChip({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure context / permissions): fail silently.
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied to clipboard" : `Copy ${label ?? "value"}`} title={copied ? "Copied to clipboard" : `Copy ${label ?? "value"}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon name={copied ? "Check" : "Copy"} size={11} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ----------------------------- detail panels ------------------------------ */

/** A monospace value row with a copy chip; used for the two fingerprints. */
function FingerprintRow({ algo, value }: { algo: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-2 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {algo}
        </span>
        <CopyChip value={value} label={`${algo} fingerprint`} />
      </div>
      <code className="min-w-0 break-all font-mono text-xs text-foreground">{value}</code>
    </div>
  );
}

/** The parsed-identity panel: DER length + both fingerprints. */
function IdentityPanel({ cert }: { cert: ParsedCertificate }) {
  return (
    <div className="mt-1 rounded-lg border border-border bg-muted/20 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon name="FileDigit" size={13} />
        Decoded {cert.derLength.toLocaleString()} DER bytes and hashed them locally with Web Crypto.
      </div>
      <FingerprintRow algo="SHA-256" value={cert.fingerprints.sha256} />
      <FingerprintRow algo="SHA-1" value={cert.fingerprints.sha1} />
    </div>
  );
}

/** DNS/SAN hostname chips, each individually copyable. */
function HostnamesPanel({ names }: { names: string[] }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {names.map((name) => (
        <span
          key={name}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 py-1 pl-2 pr-1 text-xs"
        >
          <code className="font-mono text-foreground">{name}</code>
          <CopyChip value={name} label="hostname" />
        </span>
      ))}
    </div>
  );
}

/** A capped, scrollable dump of the raw printable strings recovered from DER. */
function RecoveredStringsPanel({ strings }: { strings: string[] }) {
  const capped = strings.slice(0, 60);
  return (
    <div className="mt-1">
      <div className="max-h-52 overflow-auto rounded-lg border border-border bg-muted/20 p-2">
        <ul className="flex flex-col gap-0.5">
          {capped.map((s, i) => (
            <li key={`${i}-${s}`} className="font-mono text-[11px] leading-relaxed text-foreground/80">
              {s}
            </li>
          ))}
        </ul>
      </div>
      {strings.length > capped.length ? (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Showing the first {capped.length} of {strings.length.toLocaleString()} recovered strings.
        </p>
      ) : null}
    </div>
  );
}

/** One checklist item rendered as its detail node: the "how" + verify command. */
function ChecklistDetail({ item }: { item: ChecklistItem }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm text-muted-foreground">{item.detail}</p>
      <div className="flex items-start gap-1.5 rounded-md border border-border bg-muted/20 p-2">
        <Icon name="Terminal" size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 break-words font-mono text-[11px] leading-relaxed text-foreground/80">
          {item.how}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------- analysis -------------------------------- */

/** The static TLS/SSL hardening checklist, as info checks in one group. */
function checklistChecks(): CheckItem[] {
  return sslChecklist().map((item) => ({
    id: item.id,
    status: "info" as const,
    label: item.title,
    detail: <ChecklistDetail item={item} />,
    group: "TLS/SSL hardening checklist",
  }));
}

/**
 * Parse a pasted PEM into the structured report PasteAnalyze renders. Async
 * because fingerprinting uses `crypto.subtle.digest`. Throws a precise message
 * on malformed input so the error banner is useful.
 */
async function analyzeCertificate(input: string): Promise<AnalysisReport> {
  const trimmed = input.trim();

  // Empty input → show just the learn-mode checklist so the tool is still
  // useful before anything is pasted.
  if (!trimmed) {
    return {
      summary: (
        <span>
          Paste a PEM certificate above to decode its fingerprints and hostnames. The TLS/SSL
          hardening checklist below applies to every HTTPS site.
        </span>
      ),
      checks: checklistChecks(),
    };
  }

  const parsed = await parseCertificate(trimmed);
  if (!parsed.ok) {
    // Surface the engine's precise message via the error banner.
    throw new Error(parsed.error.message);
  }

  const identityChecks: CheckItem[] = [];

  identityChecks.push({
    id: "fingerprints",
    status: "pass",
    label: "Certificate fingerprints (exact)",
    detail: <IdentityPanel cert={parsed} />,
    group: "Parsed certificate",
  });

  if (parsed.dnsNames.length > 0) {
    identityChecks.push({
      id: "hostnames",
      status: "pass",
      label: `Recovered DNS / SAN names (${parsed.dnsNames.length})`,
      detail: <HostnamesPanel names={parsed.dnsNames} />,
      group: "Parsed certificate",
    });
  } else {
    identityChecks.push({
      id: "hostnames",
      status: "warn",
      label: "No DNS / SAN names recovered",
      detail:
        "No hostname-shaped strings were found in the DER. The certificate may encode names in a form this heuristic can't recover: decode fully with `openssl x509 -noout -text` to read the SAN block.",
      group: "Parsed certificate",
    });
  }

  identityChecks.push({
    id: "recovered",
    status: "info",
    label: `Recovered strings (${parsed.recoveredStrings.length})`,
    detail: <RecoveredStringsPanel strings={parsed.recoveredStrings} />,
    group: "Parsed certificate",
  });

  identityChecks.push({
    id: "limits",
    status: "info",
    label: "What client-side parsing can't show",
    detail: parsed.note,
    group: "Parsed certificate",
  });

  return {
    summary: (
      <span>
        Decoded a valid PEM certificate ({parsed.derLength.toLocaleString()} DER bytes).
        Fingerprints and hostnames below are exact; validity dates and key size need a full X.509
        parser or a live handshake.
      </span>
    ),
    checks: [...identityChecks, ...checklistChecks()],
  };
}

/* ----------------------------------- tool --------------------------------- */

/**
 * A real, well-known root certificate (ISRG Root X1, Let's Encrypt) so the
 * sample decodes to genuine fingerprints and recovered strings the user can
 * verify against public sources.
 */
const SAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbW
nOlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynT
nmN/E4CTF1kBoszTIici3IPcSG0v5zXFmQTS+dNvJ/bV8xL4qU9AJnkTIvKw8+Ec
9CJIMXTVXfNv/N/z+g/ISKPdg5Ci4wPS/tSXhFPmTNAB2G3+FpX+D+B2W8j2VkP
ObTAxAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MB0G
A1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkqhkiG9w0BAQsFAAOCAgEA
VR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZLubhzEFnTIZd+50xx+7LS
YK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ3BebYhtF8GaV0nxvwuo7
7x/sy610Fk8Rgl0O6D0dyd0BAAWjHnbeF+B4jTuKS42R9pKU/HTgVBLJX+Ptp5aY
example
-----END CERTIFICATE-----`;

export default function SslCheckerTool({ tool }: { tool: WorkspaceToolData }) {
  return (
    <section aria-label={tool.title}>
      <PasteAnalyze
        analyze={analyzeCertificate}
        inputLabel="Paste a PEM certificate"
        placeholder="-----BEGIN CERTIFICATE-----&#10;…&#10;-----END CERTIFICATE-----"
        sample={SAMPLE_PEM}
        emptyTitle="Paste a PEM certificate to inspect it"
        emptyHint="Grab a live server's cert with `openssl s_client -connect example.com:443 -showcerts`, or open a.pem/.crt file, and paste the -----BEGIN CERTIFICATE----- block here. It's decoded and fingerprinted locally in your browser. Nothing is uploaded. A browser can't run a live TLS handshake and we deliberately run no server for it, so this is paste-a-cert / learn mode. The TLS/SSL hardening checklist below applies even before you paste."
        emptyIcon="ShieldCheck"
        accept=".pem,.crt,.cer,.txt"
      />
    </section>
  );
}
