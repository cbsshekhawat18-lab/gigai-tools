"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Full-report view for a GigAI Verify result handed off from the browser
 * extension.
 *
 * THE HANDOFF IS FRAGMENT-ONLY, AND DELIBERATELY SO. The extension encodes a
 * summary into `#r=`, the URL fragment, which browsers never transmit to the
 * server. On a statically exported site there is no server to receive it anyway,
 * but the choice matters regardless: it means a link to a report cannot leak
 * through access logs, referrer headers or a CDN cache.
 *
 * What travels: the verdict, the confidence, the content kind, the site's
 * hostname, the analysis mode, a timestamp, and the label/direction/family of
 * each signal. What does NOT travel: the page content, any excerpt, and the URL
 * of the thing that was checked.
 */

type Direction = "ai" | "human" | "neutral";

interface HandoffSignal {
  /** label */
  l: string;
  /** direction */
  d: Direction;
  /** family */
  f: string;
}

interface Handoff {
  /** verdict */
  v: string;
  /** confidence */
  c: string;
  /** kind */
  k: string;
  /** host */
  h: string;
  /** mode */
  m: string;
  /** createdAt (ms) */
  t: number;
  /** signals */
  s: HandoffSignal[];
}

const VERDICTS: Record<string, { label: string; description: string; tone: string }> = {
  "likely-human": {
    label: "Likely Human",
    description: "The available evidence is more consistent with human-created content.",
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  "likely-ai": {
    label: "Likely AI",
    description: "The available evidence is more consistent with AI-generated content.",
    tone: "text-blue-600 dark:text-blue-400",
  },
  "likely-ai-assisted": {
    label: "Likely AI-Assisted",
    description: "Evidence suggests AI involvement alongside human editing or contribution.",
    tone: "text-amber-600 dark:text-amber-400",
  },
  inconclusive: {
    label: "Inconclusive",
    description: "There isn't enough reliable evidence to determine the origin.",
    tone: "text-slate-600 dark:text-slate-400",
  },
};

const CONFIDENCE: Record<string, string> = {
  low: "Low confidence",
  moderate: "Moderate confidence",
  high: "High confidence",
};

const KIND: Record<string, string> = {
  page: "Web page",
  selection: "Selected text",
  image: "Image",
  video: "Video",
  pdf: "PDF document",
};

const FAMILY: Record<string, string> = {
  provenance: "Provenance",
  metadata: "Metadata",
  media: "Media",
  structure: "Structure",
  stylometry: "Writing style",
};

const DIRECTION_LABEL: Record<Direction, string> = {
  ai: "Points to AI",
  human: "Points to human",
  neutral: "Context only",
};

function decode(fragment: string): Handoff | null {
  try {
    const base64 = fragment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const parsed: unknown = JSON.parse(decodeURIComponent(escape(atob(padded))));

    if (typeof parsed !== "object" || parsed === null) return null;
    const candidate = parsed as Partial<Handoff>;
    if (typeof candidate.v !== "string" || !Array.isArray(candidate.s)) return null;

    return {
      v: candidate.v,
      c: typeof candidate.c === "string" ? candidate.c : "low",
      k: typeof candidate.k === "string" ? candidate.k : "page",
      h: typeof candidate.h === "string" ? candidate.h : "",
      m: typeof candidate.m === "string" ? candidate.m : "local",
      t: typeof candidate.t === "number" ? candidate.t : Date.now(),
      // Untrusted input from a URL; every field is coerced and length-capped
      // before it reaches the DOM.
      s: candidate.s
        .filter((item): item is HandoffSignal => typeof item === "object" && item !== null)
        .slice(0, 40)
        .map((item) => ({
          l: String(item.l ?? "").slice(0, 160),
          d: item.d === "ai" || item.d === "human" ? item.d : "neutral",
          f: String(item.f ?? "stylometry").slice(0, 40),
        })),
    };
  } catch {
    return null;
  }
}

export function VerifyReport() {
  const [result, setResult] = useState<Handoff | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const read = () => {
      const match = /[#&]r=([^&]+)/.exec(window.location.hash);
      setResult(match?.[1] ? decode(match[1]) : null);
      setChecked(true);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (!checked) return null;

  if (!result) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-foreground">No report loaded</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This page shows the full evidence view for a check made with the GigAI Verify browser
          extension. Run a check in the extension and choose{" "}
          <strong className="text-foreground">Full report</strong> to open it here.
        </p>
        <Link
          className="mt-5 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          href="/verify/extension"
        >
          Get GigAI Verify for Chrome
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">
          Checking a file instead of a page?{" "}
          <Link href="/gigai-verify" className="font-medium text-primary underline underline-offset-4">
            Use GigAI Verify on the web
          </Link>{" "}
          - no extension needed.
        </p>
      </div>
    );
  }

  const verdict = VERDICTS[result.v] ?? VERDICTS.inconclusive!;
  const counted = result.s.filter((signal) => signal.d !== "neutral");
  const families = Array.from(new Set(result.s.map((signal) => signal.f)));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">
            </span>
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${verdict.tone}`}>{verdict.label}</h2>
            <p className="text-sm font-medium text-muted-foreground">
              {CONFIDENCE[result.c] ?? "Low confidence"}
            </p>
          </div>
        </div>

        <p className="mt-4 text-base leading-relaxed text-foreground">{verdict.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Checked
            </dt>
            <dd className="mt-1 text-foreground">{KIND[result.k] ?? result.k}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Source
            </dt>
            <dd className="mt-1 break-words text-foreground">{result.h || "Not recorded"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mode
            </dt>
            <dd className="mt-1 text-foreground">
              {result.m === "local" ? "🔒 Local analysis" : "☁️ GigAI analysis"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Signals
            </dt>
            <dd className="mt-1 text-foreground">{counted.length} counted</dd>
          </div>
        </dl>
      </div>

      {families.map((family) => {
        const signals = result.s.filter((signal) => signal.f === family);
        if (signals.length === 0) return null;
        return (
          <div key={family} className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {FAMILY[family] ?? family}
            </h3>
            <ul className="mt-3 space-y-2.5">
              {signals.map((signal, index) => (
                <li key={`${family}-${index}`} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2 w-2 flex-none rounded-full ${
                      signal.d === "ai"
                        ? "bg-blue-500"
                        : signal.d === "human"
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                    }`}
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">{signal.l}</span>
                    <span className="block text-xs text-muted-foreground">
                      {DIRECTION_LABEL[signal.d]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
        <h3 className="text-sm font-semibold text-foreground">What this can&rsquo;t tell you</h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            AI detection is probabilistic and can produce false positives and false negatives. This
            is evidence, not proof of authorship.
          </li>
          <li>
            Signal labels are shown here; the excerpts and field values behind them stay in your
            browser and are not transmitted to this page.
          </li>
          <li>
            A result should never be used to accuse anyone. Treat it as a reason to look more
            closely.
          </li>
        </ul>
      </div>
    </div>
  );
}
