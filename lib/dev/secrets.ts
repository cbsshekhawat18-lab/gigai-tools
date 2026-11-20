/**
 * Secret / API-key scanner, pure client-side detection of exposed credentials
 * in pasted code, config or logs. Everything is plain regex over the text in the
 * browser; nothing is uploaded. Rules cover the common provider key formats plus
 * a couple of context-based catches (assignments, connection strings).
 *
 * This is a HELPFUL heuristic, not a security guarantee: it will miss custom or
 * obfuscated secrets and can occasionally flag a lookalike. Always review
 * findings yourself. The UI states this plainly.
 */

export type Severity = "high" | "medium" | "low";

export interface SecretRule {
  id: string;
  label: string;
  severity: Severity;
  /** Global regex. The whole match (or capture group 1, if present) is the secret. */
  regex: RegExp;
  /** Short remediation hint. */
  note: string;
}

export interface SecretFinding {
  ruleId: string;
  label: string;
  severity: Severity;
  /** 1-based line number of the match. */
  line: number;
  /** The matched secret text (the sensitive part). */
  match: string;
  /** A masked preview safe to display, e.g. "AKIA…QXMP". */
  masked: string;
  note: string;
}

/**
 * The rule set. Ordered high→low so the most dangerous matches are found first
 * and (via span de-duplication) win over broader generic rules on the same text.
 */
export const SECRET_RULES: SecretRule[] = [
  { id: "private-key", label: "Private key block", severity: "high", note: "Never commit private keys. Rotate it and store in a secrets manager.", regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----/g },
  { id: "aws-access-key", label: "AWS access key ID", severity: "high", note: "Rotate the key pair in IAM immediately and remove it from source.", regex: /\b(?:AKIA|ASIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA)[0-9A-Z]{16}\b/g },
  { id: "aws-secret", label: "AWS secret access key", severity: "high", note: "Rotate in IAM. Use environment variables or a secrets manager instead.", regex: /aws_secret_access_key\s*[=:]\s*['"]?([A-Za-z0-9/+]{40})['"]?/gi },
  { id: "github-token", label: "GitHub token", severity: "high", note: "Revoke it in GitHub → Settings → Developer settings, then rotate.", regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{22,}\b/g },
  { id: "openai-key", label: "OpenAI API key", severity: "high", note: "Revoke it in the OpenAI dashboard and issue a new one.", regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { id: "anthropic-key", label: "Anthropic API key", severity: "high", note: "Revoke it in the Anthropic console and rotate.", regex: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { id: "stripe-secret", label: "Stripe secret key", severity: "high", note: "Roll the key in the Stripe dashboard now. It can move money.", regex: /\b(?:sk|rk)_live_[A-Za-z0-9]{20,}\b/g },
  { id: "stripe-test", label: "Stripe test key", severity: "medium", note: "Test keys are low-risk but still shouldn't be committed.", regex: /\b(?:sk|rk)_test_[A-Za-z0-9]{20,}\b/g },
  { id: "google-api-key", label: "Google API key", severity: "high", note: "Restrict or regenerate the key in the Google Cloud console.", regex: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: "slack-token", label: "Slack token", severity: "high", note: "Revoke it in your Slack app settings and rotate.", regex: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g },
  { id: "slack-webhook", label: "Slack webhook URL", severity: "medium", note: "Regenerate the incoming-webhook URL in Slack.", regex: /https:\/\/hooks\.slack\.com\/services\/T[0-9A-Za-z_/-]{20,}/g },
  { id: "google-oauth", label: "Google OAuth client secret", severity: "high", note: "Reset the client secret in the Google Cloud console.", regex: /\bGOCSPX-[A-Za-z0-9_-]{20,}\b/g },
  { id: "twilio-key", label: "Twilio API key / SID", severity: "high", note: "Rotate the Twilio credential in the console.", regex: /\b(?:SK|AC)[0-9a-fA-F]{32}\b/g },
  { id: "sendgrid-key", label: "SendGrid API key", severity: "high", note: "Delete and recreate the key in SendGrid.", regex: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/g },
  { id: "mailgun-key", label: "Mailgun API key", severity: "high", note: "Rotate the key in the Mailgun dashboard.", regex: /\bkey-[0-9a-f]{32}\b/g },
  { id: "npm-token", label: "npm access token", severity: "high", note: "Revoke it with `npm token revoke` and issue a new one.", regex: /\bnpm_[A-Za-z0-9]{36}\b/g },
  { id: "db-url", label: "Database URL with credentials", severity: "high", note: "Move the connection string to an environment variable.", regex: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/[^:@\s/]+:[^@\s/]+@[^\s'"]+/g },
  { id: "jwt", label: "JSON Web Token (JWT)", severity: "medium", note: "If this is a live token, it may grant access. Treat as sensitive.", regex: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
  { id: "generic-secret", label: "Hard-coded secret / password", severity: "medium", note: "Load secrets from environment variables, not source code.", regex: /(?:password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key|client[_-]?secret|auth[_-]?token)\s*[=:]\s*['"]([^'"\s]{8,})['"]/gi },
];

/** Mask a secret for safe display: keep a little head/tail, hide the middle. */
export function maskSecret(secret: string): string {
  const s = secret.trim();
  if (s.length <= 8) return "•".repeat(s.length);
  const head = s.slice(0, 4);
  const tail = s.slice(-4);
  return `${head}…${tail}`;
}

/** 1-based line number for a character index in `text`. */
function lineAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === "\n") line++;
  }
  return line;
}

/** Severity ordering for sorting (high first). */
const SEVERITY_ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

/**
 * Scan text for exposed secrets. Returns findings sorted by severity then line.
 * Overlapping matches from broader rules are dropped so each secret is reported
 * once by its most specific rule.
 */
export function scanSecrets(text: string): SecretFinding[] {
  if (!text.trim()) return [];

  const claimed: { start: number; end: number }[] = [];
  const findings: SecretFinding[] = [];

  for (const rule of SECRET_RULES) {
    rule.regex.lastIndex = 0;
    for (const m of text.matchAll(rule.regex)) {
      const full = m[0];
      const secret = m[1] ?? full; // capture group is the sensitive part when present
      const start = (m.index ?? 0) + (m[1] ? full.indexOf(m[1]) : 0);
      const end = start + secret.length;

      // Skip if this span overlaps an already-reported (more specific) finding.
      if (claimed.some((c) => start < c.end && end > c.start)) continue;
      claimed.push({ start, end });

      findings.push({
        ruleId: rule.id,
        label: rule.label,
        severity: rule.severity,
        line: lineAt(text, start),
        match: secret,
        masked: maskSecret(secret),
        note: rule.note,
      });
    }
  }

  return findings.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.line - b.line,
  );
}

/** Replace every detected secret in `text` with a placeholder, safe to share. */
export function redactSecrets(text: string, findings: SecretFinding[]): string {
  // Replace longest matches first so shorter overlapping spans don't corrupt.
  const uniques = [...new Set(findings.map((f) => f.match))].sort((a, b) => b.length - a.length);
  let out = text;
  for (const secret of uniques) {
    out = out.split(secret).join("[REDACTED]");
  }
  return out;
}

/** Count findings by severity. */
export function summarize(findings: SecretFinding[]): Record<Severity, number> {
  return findings.reduce(
    (acc, f) => {
      acc[f.severity]++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 } as Record<Severity, number>,
  );
}
