/**
 * Desktop-grade harness for developer tools. Compose these to build a tool in
 * ~40-80 lines. Pure UI + hooks. No dependency on the engine layer.
 *
 * Fast path: use {@link TransformTool} (input→output) or {@link GeneratorTool}
 * (output-only). Drop to the individual primitives for custom layouts.
 */

export { CodePane, type CodePaneProps } from "./code-pane";
export {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarDivider,
  ToolbarSpacer,
  type ToolbarButtonProps,
} from "./toolbar";
export { CopyButton, type CopyButtonProps } from "./copy-button";
export {
  DownloadButton,
  download,
  type DownloadButtonProps,
  type Downloadable,
} from "./download-button";
export {
  useHistory,
  type History,
  type UseHistoryOptions,
} from "./use-history";
export {
  useShareState,
  encodeShare,
  decodeShare,
  type ShareState,
  type ShareResult,
} from "./use-share-state";
export {
  useShortcuts,
  isApplePlatform,
  modKeyLabel,
  type ShortcutMap,
  type UseShortcutsOptions,
} from "./use-shortcuts";
export {
  ShortcutsHelp,
  Kbd,
  type ShortcutHint,
  type ShortcutsHelpProps,
} from "./shortcuts-help";
export {
  FileDropZone,
  useFileDrop,
  type FileDropZoneProps,
  type UseFileDropOptions,
  type FileDropState,
} from "./file-drop";
export { ErrorBanner, type ErrorBannerProps } from "./error-banner";
export {
  OptionsBar,
  Field,
  SegmentedControl,
  Toggle,
  NumberStepper,
  SelectField,
  type SegmentOption,
  type SegmentedControlProps,
  type ToggleProps,
  type NumberStepperProps,
  type SelectFieldProps,
  type SelectOption,
} from "./options-bar";
export {
  ExamplesMenu,
  type Example,
  type ExamplesMenuProps,
} from "./examples-menu";
export { StatBadge, type StatBadgeProps } from "./stat-badge";
export {
  TransformTool,
  GeneratorTool,
  type TransformToolProps,
  type RunResult,
  type GeneratorToolProps,
  type GeneratedValue,
} from "./dev-tool-shell";
