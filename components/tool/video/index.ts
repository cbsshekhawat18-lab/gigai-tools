/**
 * Shared, client-only UI for browser-native video tools. These compose the dev
 * harness ({@link FileDropZone}, StatBadge, download, ErrorBanner) and probe /
 * thumbnail clips with a native `<video>` + canvas. No ffmpeg is loaded until a
 * tool actually runs. Build a tool from {@link VideoWorkspace} (dropzone →
 * options → run → progress → result) or drop to the primitives for custom
 * layouts.
 */

export {
  VideoDropzone,
  type VideoDropzoneProps,
} from "./video-dropzone";
export {
  VideoPlayer,
  type VideoPlayerProps,
} from "./video-player";
export {
  TrimTimeline,
  type TrimTimelineProps,
  type TrimRange,
} from "./trim-timeline";
export {
  FfmpegProgress,
  type FfmpegProgressProps,
} from "./ffmpeg-progress";
export {
  VideoResult,
  type VideoResultProps,
} from "./video-result";
export {
  VideoWorkspace,
  type VideoWorkspaceProps,
  type VideoWorkspaceRenderArgs,
} from "./video-workspace";
export {
  probeVideo,
  captureFrame,
  formatBytes,
  formatDuration,
  formatDelta,
  type VideoMeta,
} from "./media-utils";
