import type { Tool } from "@/types";

/**
 * Live Video Tools (the Video Toolkit, Phase 8).
 *
 * The single import barrel for the `video-tools` category. Drop a tool file
 * under `config/tools/video/` and add its default export here; the platform
 * generates routes, metadata, JSON-LD, cards and search entries from it, and
 * `lib/video-tools/illustrations` supplies its branded artwork automatically
 * (seeded by the tool's `group`, falling back to its slug).
 *
 * Video tools run FFmpeg compiled to WebAssembly, loaded lazily and only on
 * demand, so nothing heavy ships at page load. Metadata, thumbnail and frame
 * tools skip FFmpeg entirely (native <video> + canvas), so they run instantly.
 */
import videoToWork from "./video-to-work";
import videoIntelligence from "./video-intelligence";
import videoCompressor from "./video-compressor";
import videoConverter from "./video-converter";
import subtitleConverter from "./subtitle-converter";
import videoTrimmer from "./video-trimmer";
import videoMerger from "./video-merger";
import videoSplitter from "./video-splitter";
import videoCrop from "./video-crop";
import videoRotate from "./video-rotate";
import videoSpeed from "./video-speed";
import videoLoop from "./video-loop";
import videoReverse from "./video-reverse";
import videoMute from "./video-mute";
import videoResizer from "./video-resizer";
import videoWatermark from "./video-watermark";
import extractAudio from "./extract-audio";
import videoToGif from "./video-to-gif";
import gifToVideo from "./gif-to-video";
import videoThumbnailGenerator from "./video-thumbnail-generator";
import videoFrameExtractor from "./video-frame-extractor";
import videoMetadata from "./video-metadata";
import videoPlayer from "./video-player";
import mp4ToWebm from "./mp4-to-webm";
import webmToMp4 from "./webm-to-mp4";
import movToMp4 from "./mov-to-mp4";
import aviToMp4 from "./avi-to-mp4";
import mkvToMp4 from "./mkv-to-mp4";

export const VIDEO_TOOLS: Tool[] = [
  videoToWork,
  videoIntelligence,
  videoCompressor,
  videoConverter,
  videoTrimmer,
  videoMerger,
  videoSplitter,
  videoCrop,
  videoRotate,
  videoSpeed,
  videoLoop,
  videoReverse,
  videoMute,
  videoResizer,
  videoWatermark,
  extractAudio,
  videoToGif,
  gifToVideo,
  videoThumbnailGenerator,
  videoFrameExtractor,
  videoMetadata,
  videoPlayer,
  mp4ToWebm,
  webmToMp4,
  movToMp4,
  aviToMp4,
  mkvToMp4,
  subtitleConverter,
];
