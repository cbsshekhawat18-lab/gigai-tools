/**
 * GigAI Tools: SVG optimization presets.
 *
 * Fifteen curated, destination-specific presets (each a mode + precision +
 * output shape), plus a local-first store for user-saved custom presets.
 * Persistence mirrors `lib/usage/store.ts`: namespaced key, guarded read/write
 * that tolerates quota/malformed data, and a CustomEvent so every mounted
 * component stays in sync.
 */

import type { OptimizeMode, CustomPlugins } from "./svgo-engine";
import type { ExportFormatId } from "./export-formats";

export const PRESET_KEY = "gt:svg-presets" as const;
export const PRESET_EVENT = "gt:svg-presets" as const;

/** The optimization settings a preset applies. */
export interface PresetOptions {
  mode: OptimizeMode;
  precision: number;
  pretty: boolean;
  multipass: boolean;
  /** Only meaningful when mode === "custom". */
  custom?: CustomPlugins;
}

export interface OptimizePreset {
  id: string;
  label: string;
  description: string;
  options: PresetOptions;
  /** Export format this destination usually wants. */
  exportFormat?: ExportFormatId;
  /** True for user-saved presets. */
  custom?: boolean;
}

/** The 15 built-in destination presets. */
export const BUILTIN_PRESETS: OptimizePreset[] = [
  {
    id: "general-web",
    label: "General Web",
    description: "Balanced defaults, smaller files with zero visual risk.",
    options: { mode: "smart", precision: 2, pretty: false, multipass: true },
    exportFormat: "svg",
  },
  {
    id: "website-icons",
    label: "Website Icons",
    description: "Tiny, crisp icons, aggressive rounding, viewBox kept.",
    options: { mode: "max", precision: 1, pretty: false, multipass: true },
    exportFormat: "svg",
  },
  {
    id: "react",
    label: "React",
    description: "Optimized then emitted as a typed React component.",
    options: { mode: "smart", precision: 2, pretty: false, multipass: true },
    exportFormat: "react",
  },
  {
    id: "react-native",
    label: "React Native",
    description: "react-native-svg components. No DOM-only features.",
    options: { mode: "safe", precision: 2, pretty: false, multipass: true },
    exportFormat: "react-native",
  },
  {
    id: "vue",
    label: "Vue",
    description: "Optimized then emitted as a Vue SFC.",
    options: { mode: "smart", precision: 2, pretty: false, multipass: true },
    exportFormat: "vue",
  },
  {
    id: "svelte",
    label: "Svelte",
    description: "Optimized then emitted as a Svelte component.",
    options: { mode: "smart", precision: 2, pretty: false, multipass: true },
    exportFormat: "svelte",
  },
  {
    id: "angular",
    label: "Angular",
    description: "Optimized then emitted as a standalone Angular component.",
    options: { mode: "smart", precision: 2, pretty: false, multipass: true },
    exportFormat: "angular",
  },
  {
    id: "flutter",
    label: "Flutter",
    description: "Conservative: flutter_svg ignores exotic features, so keep it simple.",
    options: { mode: "safe", precision: 2, pretty: false, multipass: true },
    exportFormat: "svg",
  },
  {
    id: "figma-export",
    label: "Figma Export",
    description: "Strips Figma's ids, metadata and wrapper groups.",
    options: { mode: "smart", precision: 2, pretty: false, multipass: true },
    exportFormat: "svg",
  },
  {
    id: "illustrator-export",
    label: "Illustrator Export",
    description: "Strips Adobe metadata, editor namespaces and comments.",
    options: { mode: "smart", precision: 2, pretty: false, multipass: true },
    exportFormat: "svg",
  },
  {
    id: "vscode-extension",
    label: "VS Code Extension",
    description: "Minimal monochrome icons at the smallest possible size.",
    options: { mode: "max", precision: 1, pretty: false, multipass: true },
    exportFormat: "svg",
  },
  {
    id: "wordpress",
    label: "WordPress",
    description: "Keeps ids and titles so themes and blocks can target them.",
    options: { mode: "safe", precision: 2, pretty: false, multipass: true },
    exportFormat: "inline-html",
  },
  {
    id: "max-compression",
    label: "Maximum Compression",
    description: "Every last byte: strips dimensions, titles and metadata.",
    options: { mode: "max", precision: 0, pretty: false, multipass: true },
    exportFormat: "svg",
  },
  {
    id: "safe-export",
    label: "Safe Export",
    description: "Nothing risky removed: ideal for SVGs you'll keep editing.",
    options: { mode: "safe", precision: 3, pretty: true, multipass: false },
    exportFormat: "svg",
  },
  {
    id: "email-safe",
    label: "Email Safe",
    description: "Conservative + inline HTML, email clients drop external refs.",
    options: { mode: "safe", precision: 2, pretty: false, multipass: true },
    exportFormat: "inline-html",
  },
];

/* ─────────────────────────── custom preset store ─────────────────────────── */

function canStore(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Read saved custom presets. Never throws; returns [] on any problem. */
export function readCustomPresets(): OptimizePreset[] {
  if (!canStore()) return [];
  try {
    const raw = window.localStorage.getItem(PRESET_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is OptimizePreset =>
        !!p && typeof p === "object" && typeof (p as OptimizePreset).id === "string" && !!(p as OptimizePreset).options,
    ).map((p) => ({ ...p, custom: true }));
  } catch {
    return [];
  }
}

/** Notify every mounted subscriber that presets changed. */
function emit(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent(PRESET_EVENT));
  } catch {
    /* ignore */
  }
}

function writeCustomPresets(list: OptimizePreset[]): void {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(PRESET_KEY, JSON.stringify(list));
    emit();
  } catch {
    /* quota or private mode, presets simply don't persist */
  }
}

/** Save (or overwrite) a custom preset by label. Returns the new list. */
export function saveCustomPreset(label: string, options: PresetOptions, exportFormat?: ExportFormatId): OptimizePreset[] {
  const name = label.trim();
  if (!name) return readCustomPresets();
  const id = `custom:${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const next = readCustomPresets().filter((p) => p.id !== id);
  next.push({ id, label: name, description: "Your saved settings.", options, exportFormat, custom: true });
  writeCustomPresets(next);
  return next;
}

/** Delete a custom preset by id. Returns the new list. */
export function deleteCustomPreset(id: string): OptimizePreset[] {
  const next = readCustomPresets().filter((p) => p.id !== id);
  writeCustomPresets(next);
  return next;
}

/** Subscribe to preset changes (same-tab CustomEvent + cross-tab storage). */
export function subscribePresets(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === PRESET_KEY) handler();
  };
  window.addEventListener(PRESET_EVENT, handler);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PRESET_EVENT, handler);
    window.removeEventListener("storage", onStorage);
  };
}
