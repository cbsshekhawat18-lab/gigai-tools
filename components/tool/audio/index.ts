/**
 * Shared, client-only UI for browser-native audio tools. These compose the dev
 * harness ({@link FileDropZone}, StatBadge, download, ErrorBanner) and decode /
 * draw clips with the native Web Audio API. No ffmpeg is loaded until a tool
 * actually runs an exotic conversion. Build a tool from {@link AudioWorkspace}
 * (dropzone → options → run → progress → result) or drop to the primitives
 * (Waveform, AudioPlayer, AudioRecorder) for custom layouts.
 */

export { AudioDropzone, type AudioDropzoneProps } from "./audio-dropzone";
export {
  Waveform,
  type WaveformProps,
  type WaveSelection,
} from "./waveform";
export { AudioPlayer, type AudioPlayerProps } from "./audio-player";
export { AudioRecorder, type AudioRecorderProps } from "./audio-recorder";
export { AudioResult, type AudioResultProps } from "./audio-result";
export {
  AudioWorkspace,
  type AudioWorkspaceProps,
  type AudioWorkspaceRenderArgs,
  type AudioRunHooks,
  type AudioRunResult,
} from "./audio-workspace";
export {
  decodeAudio,
  probeAudio,
  computePeaks,
  getAudioContext,
  isAudioSupported,
  describeAudio,
  formatBytes,
  formatDuration,
  formatDelta,
  type AudioMeta,
  type Peaks,
} from "./audio-utils";
