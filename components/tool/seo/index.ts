/**
 * SEO-specific tool UI. Built on top of the dev harness (components/tool/dev)
 * - CodePane, Toolbar, CopyButton, download, options controls, StatBadge, and
 * consumes the engine layer (lib/seo-tools) via props. Two workhorses cover the
 * two tool shapes: {@link GeneratorWithPreview} (form → live code + preview) and
 * {@link PasteAnalyze} (paste/drop → structured report). The rest are the
 * building blocks those shells and individual tools compose.
 */

export {
  SerpPreview,
  type SerpPreviewProps,
  type SerpDevice,
} from "./serp-preview";
export {
  SocialCardPreview,
  type SocialCardPreviewProps,
  type SocialCardData,
  type SocialPlatform,
  type TwitterCardType,
} from "./social-card-preview";
export {
  SchemaForm,
  type SchemaFormProps,
  type FieldSpec,
  type FieldValue,
  type SchemaValues,
} from "./schema-form";
export {
  GeneratorWithPreview,
  type GeneratorWithPreviewProps,
} from "./generator-with-preview";
export {
  PasteAnalyze,
  type PasteAnalyzeProps,
  type AnalysisReport,
} from "./paste-analyze";
export { ShareReport, type ShareReportProps } from "./share-report";
export { UrlPrefillBar, useDeepLinkUrl, type UrlPrefillBarProps } from "./url-prefill-bar";
export {
  ScorePanel,
  CheckList,
  gradeForScore,
  type ScorePanelProps,
  type CheckListProps,
  type CheckItem,
  type CheckStatus,
  type Grade,
} from "./report";
