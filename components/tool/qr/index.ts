/**
 * GigAI QR Studio: public component surface.
 *
 * Everything a tool page or the flagship generator needs. The two entry points
 * are {@link QRToolPage} (thin per-tool wrapper over a preset) and {@link QRStudio}
 * (the full workspace); the rest are the building blocks, exported for reuse and
 * for composing bespoke layouts.
 */

export { QRToolPage, type QRToolPreset, type QRToolPageProps } from "./qr-tool-page";
export { default as QRToolPageDefault } from "./qr-tool-page";
export { QRStudio, type QRStudioProps } from "./qr-studio";
export { QRScanner, type QRScannerProps } from "./qr-scanner";
export { QrPreview, type QrPreviewProps } from "./qr-preview";
export { DownloadMenu, type DownloadMenuProps } from "./download-menu";
export { BatchPanel, type BatchPanelProps } from "./batch-panel";
export { CustomizationPanel, type CustomizationPanelProps } from "./customization-panel";
export { LogoPanel, type LogoPanelProps } from "./logo-panel";
export {
  ContentForm,
  ContentFormHeader,
  contentFormFor,
  CONTENT_FORM_TYPES,
  CONTENT_FORM_SPECS,
  type ContentFormSpec,
  type ContentFieldSpec,
  type ContentFormProps,
  type FieldKind,
} from "./content-forms";
export { Section, ColorControl, Slider, ChipPicker, type ChipOption } from "./primitives";
