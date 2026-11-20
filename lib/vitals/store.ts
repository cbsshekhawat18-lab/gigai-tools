/**
 * Local-first WEB-VITALS monitoring, real-user Core Web Vitals measured on
 * THIS device and stored in localStorage. No beacon, no server, no third
 * party: the visitor's performance data is theirs, surfaced in /workspace as
 * "Performance on this device". (The spec's monitoring dashboard, done the
 * privacy-first way a static export allows.)
 *
 * Per metric we keep a small ring buffer of recent samples and report the P75
 * (the industry-standard CWV aggregation) plus a rating using Google's
 * published thresholds.
 */

export const VITALS_KEY = "gt:vitals" as const;
export const VITALS_EVENT = "gt:vitals" as const;

export type MetricName = "LCP" | "CLS" | "INP" | "TTFB" | "FCP";

interface Sample {
  /** Metric value (ms; CLS is unitless). */
  v: number;
  /** Epoch ms when captured. */
  at: number;
  /** Pathname where it was captured. */
  p: string;
}

type VitalsMap = Partial<Record<MetricName, Sample[]>>;

/** Ring-buffer size per metric. */
const MAX_SAMPLES = 40;

/** Google's "good" / "poor" thresholds per metric (ms; CLS unitless). */
export const THRESHOLDS: Record<MetricName, [good: number, poor: number]> = {
  LCP: [2500, 4000],
  CLS: [0.1, 0.25],
  INP: [200, 500],
  TTFB: [800, 1800],
  FCP: [1800, 3000],
};

export type Rating = "good" | "needs-improvement" | "poor";

export function rate(metric: MetricName, value: number): Rating {
  const [good, poor] = THRESHOLDS[metric];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

/* ── plumbing ────────────────────────────────────────────────────────────── */

function emit(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(VITALS_EVENT));
  } catch {
    /* non-fatal */
  }
}

function read(): VitalsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VITALS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: VitalsMap = {};
    for (const [name, samples] of Object.entries(parsed as Record<string, unknown>)) {
      if (!Array.isArray(samples)) continue;
      const clean = samples.filter(
        (s): s is Sample =>
          !!s &&
          typeof s === "object" &&
          typeof (s as Sample).v === "number" &&
          typeof (s as Sample).at === "number",
      );
      if (clean.length) out[name as MetricName] = clean.slice(-MAX_SAMPLES);
    }
    return out;
  } catch {
    return {};
  }
}

/* ── recording ───────────────────────────────────────────────────────────── */

/** Record one metric sample (called by the vitals tracker island). */
export function recordVital(name: MetricName, value: number): void {
  if (typeof window === "undefined" || !Number.isFinite(value)) return;
  try {
    const map = read();
    const list = map[name] ?? [];
    list.push({
      v: Math.round(value * 1000) / 1000,
      at: Date.now(),
      p: window.location.pathname,
    });
    map[name] = list.slice(-MAX_SAMPLES);
    window.localStorage.setItem(VITALS_KEY, JSON.stringify(map));
    emit();
  } catch {
    /* quota / privacy mode, non-fatal */
  }
}

/* ── reads ───────────────────────────────────────────────────────────────── */

export interface VitalSummary {
  name: MetricName;
  /** P75 of the stored samples (the CWV standard aggregate). */
  p75: number;
  rating: Rating;
  samples: number;
}

export function getVitalsSummary(): VitalSummary[] {
  const map = read();
  const out: VitalSummary[] = [];
  for (const name of ["LCP", "INP", "CLS", "TTFB"] as const) {
    const samples = map[name];
    if (!samples || samples.length === 0) continue;
    const sorted = samples.map((s) => s.v).sort((a, b) => a - b);
    const p75 = sorted[Math.min(Math.floor(sorted.length * 0.75), sorted.length - 1)]!;
    out.push({ name, p75, rating: rate(name, p75), samples: samples.length });
  }
  return out;
}

export function clearVitals(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(VITALS_KEY);
    emit();
  } catch {
    /* non-fatal */
  }
}

export function subscribeVitals(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === VITALS_KEY) handler();
  };
  window.addEventListener(VITALS_EVENT, handler);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(VITALS_EVENT, handler);
    window.removeEventListener("storage", onStorage);
  };
}
