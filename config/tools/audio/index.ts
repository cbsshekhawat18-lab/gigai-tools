import type { Tool } from "@/types";

/**
 * Live Audio Tools (the Audio Toolkit, Phase 9).
 *
 * The single import barrel for the `audio-tools` category. Drop a tool file
 * under `config/tools/audio/` and add its default export here; the platform
 * generates routes, metadata, JSON-LD, cards and search entries from it, and
 * `lib/audio-tools/illustrations` supplies its branded artwork automatically
 * (seeded by the tool's `group`, falling back to its slug).
 *
 * Audio tools favour the native Web Audio API (AudioContext / OfflineAudioContext
 * / decodeAudioData) and MediaRecorder for everything they can, trimming,
 * merging, volume, speed, reverse, fade, normalisation, silence removal,
 * waveform rendering, recording and WAV export, which is fast, needs no WASM
 * and never uploads. MP3 export uses lamejs (lazy-imported), and only the exotic
 * container conversions (ogg / flac / m4a / aac) reach for the shared FFmpeg
 * WASM engine, loaded lazily and solely when such a conversion actually runs.
 *
 * The full toolkit, in internal-linking order.
 */
import audioTrimmer from "./audio-trimmer";
import audioCutter from "./audio-cutter";
import audioMerger from "./audio-merger";
import audioJoiner from "./audio-joiner";
import audioSplitter from "./audio-splitter";
import audioVolumeBooster from "./audio-volume-booster";
import audioSpeedChanger from "./audio-speed-changer";
import audioReverse from "./audio-reverse";
import audioFade from "./audio-fade";
import audioNormalizer from "./audio-normalizer";
import audioSilenceRemover from "./audio-silence-remover";
import ringtoneMaker from "./ringtone-maker";
import audioCompressor from "./audio-compressor";
import mp3Converter from "./mp3-converter";
import audioToMp3 from "./audio-to-mp3";
import wavConverter from "./wav-converter";
import oggConverter from "./ogg-converter";
import flacConverter from "./flac-converter";
import m4aConverter from "./m4a-converter";
import aacConverter from "./aac-converter";
import audioFormatConverter from "./audio-format-converter";
import audioRecorder from "./audio-recorder";
import audioPlayer from "./audio-player";
import audioMetadata from "./audio-metadata";
import audioWaveform from "./audio-waveform";

export const AUDIO_TOOLS: Tool[] = [
  audioTrimmer,
  audioCutter,
  audioMerger,
  audioJoiner,
  audioSplitter,
  audioVolumeBooster,
  audioSpeedChanger,
  audioReverse,
  audioFade,
  audioNormalizer,
  audioSilenceRemover,
  ringtoneMaker,
  audioCompressor,
  mp3Converter,
  audioToMp3,
  wavConverter,
  oggConverter,
  flacConverter,
  m4aConverter,
  aacConverter,
  audioFormatConverter,
  audioRecorder,
  audioPlayer,
  audioMetadata,
  audioWaveform,
];
