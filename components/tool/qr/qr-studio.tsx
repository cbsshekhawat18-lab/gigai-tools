"use client";

/**
 * QR Studio: the full ecosystem UI.
 *
 * Composes the content forms, customization panel, logo panel, live preview,
 * download menu, and (optionally) the batch panel into a premium, responsive,
 * dark-mode, keyboard-friendly two/three-column workspace. It owns the single
 * source of truth, a content type, a `QRFields` bag, and a `QRStyleConfig` -
 * and derives the payload from the engine on every change (debounced into the
 * preview so typing stays instant).
 *
 * Props let a page LOCK the content type (e.g. the Wi-Fi tool) and seed default
 * fields + styling, so each of the tool pages is a thin preset over this.
 */

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { accentStyle } from "@/lib/design";
import type { AccentKey } from "@/types";
import { buildPayload, type QRContentType, type QRFields } from "@/lib/qr/content";
import { DEFAULT_QR_STYLE, type QRStyleConfig } from "@/lib/qr/style";
import { SegmentedControl } from "@/components/tool/dev";
import { ContentForm, ContentFormHeader, contentFormFor, CONTENT_FORM_TYPES } from "./content-forms";
import { CustomizationPanel } from "./customization-panel";
import { LogoPanel } from "./logo-panel";
import {
  DEFAULT_SHAPE_STATE,
  ShapeControls,
  ShapeDownload,
  ShapePreview,
  type ShapeState,
} from "./shape-panel";
import { QrPreview } from "./qr-preview";
import { DownloadMenu } from "./download-menu";
import { BatchPanel } from "./batch-panel";
import { Section } from "./primitives";

/** Which left-column tab is active. */
type StudioTab = "content" | "design" | "logo" | "shape";

/** Props for {@link QRStudio}. */
export interface QRStudioProps {
  /** Content type to open on. Default "url". */
  contentType?: QRContentType;
  /** Prevent the type picker (single-purpose tools like Wi-Fi). */
  lockType?: boolean;
  /** Seed field values for the initial content type. */
  defaultFields?: QRFields;
  /** Seed style overrides (merged over {@link DEFAULT_QR_STYLE}). */
  defaultStyle?: Partial<QRStyleConfig>;
  /** Show the CSV → ZIP batch tab. Default false. */
  enableBatch?: boolean;
  /** Accent for icon tints (defaults to the QR-tools accent, indigo). */
  accent?: AccentKey;
  /** Base file name for downloads. */
  filename?: string;
}

/** Debounce a fast-changing value so heavy renders don't run on every keypress. */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** The complete QR studio workspace. */
export function QRStudio({
  contentType = "url",
  lockType = false,
  defaultFields,
  defaultStyle,
  enableBatch = false,
  accent = "indigo",
  filename = "qr-code",
}: QRStudioProps) {
  const style0 = accentStyle(accent);

  const [type, setType] = React.useState<QRContentType>(contentType);
  const [fieldsByType, setFieldsByType] = React.useState<Partial<Record<QRContentType, QRFields>>>(
    () => (defaultFields ? { [contentType]: { ...defaultFields } } : {}),
  );
  const [style, setStyle] = React.useState<QRStyleConfig>(() => ({ ...DEFAULT_QR_STYLE, ...defaultStyle }));
  const [tab, setTab] = React.useState<StudioTab>("content");
  const [shape, setShape] = React.useState<ShapeState>(DEFAULT_SHAPE_STATE);
  const [showBatch, setShowBatch] = React.useState(false);

  // Memoized so the `?? {}` fallback can't mint a new object every render
  // (it feeds the payload useMemo's dependency array below).
  const fields = React.useMemo(() => fieldsByType[type] ?? {}, [fieldsByType, type]);

  const setField = React.useCallback(
    (key: string, value: string) => {
      setFieldsByType((prev) => ({ ...prev, [type]: { ...(prev[type] ?? {}), [key]: value } }));
    },
    [type],
  );

  const patchStyle = React.useCallback((patch: Partial<QRStyleConfig>) => {
    setStyle((s) => ({ ...s, ...patch }));
  }, []);

  const loadSample = React.useCallback(() => {
    const spec = contentFormFor(type);
    if (spec.sample) setFieldsByType((prev) => ({ ...prev, [type]: { ...spec.sample } }));
  }, [type]);

  // Live payload (instant, cheap) and a debounced style for the heavy render.
  const payload = React.useMemo(() => buildPayload(type, fields), [type, fields]);
  const debouncedPayload = useDebounced(payload, 180);
  const debouncedStyle = useDebounced(style, 180);

  const spec = contentFormFor(type);
  const hasContent = Boolean(payload);

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar: content-type picker + batch toggle */}
      {!lockType && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/60 p-2">
          <span className="px-1 text-sm font-medium text-muted-foreground">Type</span>
          <div className="flex flex-wrap gap-1">
            {CONTENT_FORM_TYPES.map((tp) => {
              const s = contentFormFor(tp);
              const active = tp === type;
              return (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setType(tp)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    active ? cn(style0.soft) : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon name={s.icon} size={13} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main grid: controls | preview+download */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        {/* LEFT - tabbed controls */}
        <div className="flex flex-col gap-3">
          <SegmentedControl<StudioTab>
            value={tab}
            onChange={setTab}
            ariaLabel="Editor section"
            options={[
              { value: "content", label: "Content", icon: "PenLine" },
              { value: "design", label: "Design", icon: "Palette" },
              { value: "logo", label: "Logo", icon: "ImagePlus" },
              { value: "shape", label: "Shape", icon: "Shapes" },
            ]}
          />

          {tab === "content" && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-start justify-between gap-2">
                <ContentFormHeader type={type} />
                {spec.sample && !hasContent && (
                  <button
                    type="button"
                    onClick={loadSample}
                    className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", style0.soft)}
                  >
                    <Icon name="Sparkles" size={13} /> Sample
                  </button>
                )}
              </div>
              <ContentForm type={type} values={fields} onChange={setField} />
            </div>
          )}

          {tab === "design" && <CustomizationPanel style={style} onChange={patchStyle} />}

          {tab === "logo" && (
            <Section title="Centre logo" icon="ImagePlus">
              <LogoPanel style={style} onChange={patchStyle} payload={payload} />
            </Section>
          )}

          {tab === "shape" && (
            <Section title="Shape QR" icon="Shapes">
              <ShapeControls state={shape} onChange={setShape} />
            </Section>
          )}
        </div>

        {/* RIGHT - sticky live preview + download */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            {tab === "shape" ? (
              <ShapePreview payload={debouncedPayload} style={debouncedStyle} state={shape} />
            ) : (
              <QrPreview payload={debouncedPayload} style={debouncedStyle} />
            )}
          </div>
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Icon name="Download" size={15} className={style0.text} />
              <span className="text-sm font-semibold text-foreground">Download</span>
            </div>
            {tab === "shape" ? (
              <ShapeDownload payload={payload} style={style} state={shape} filename={filename} />
            ) : (
              <DownloadMenu payload={payload} style={style} filename={filename} />
            )}
          </div>
        </div>
      </div>

      {/* Batch */}
      {enableBatch && (
        <div className="rounded-lg border border-border bg-card/50">
          <button
            type="button"
            onClick={() => setShowBatch((v) => !v)}
            aria-expanded={showBatch}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="Layers" size={16} className={style0.text} />
            <span className="text-sm font-semibold text-foreground">Bulk generate (CSV → ZIP)</span>
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Pro</span>
            <Icon name="ChevronDown" size={16} className={cn("ml-auto text-muted-foreground transition-transform", showBatch && "rotate-180")} />
          </button>
          {showBatch && (
            <div className="border-t border-border p-4">
              <BatchPanel style={style} contentType={lockType ? type : undefined} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
