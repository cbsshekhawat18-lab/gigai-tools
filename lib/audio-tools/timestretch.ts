/**
 * GigAI Tools, WSOLA time-stretching (real pitch preservation).
 *
 * Web Audio has no time-stretch primitive. `AudioBufferSourceNode.playbackRate`
 * and a plain linear resample both change duration by *resampling*, which drags
 * pitch along with speed by exactly the same ratio. A 2× speed-up is an octave
 * up, every time. That is the tape/vinyl effect, and it is the wrong answer for
 * anyone speeding up a podcast or slowing down a lesson.
 *
 * This module implements WSOLA (Waveform Similarity Overlap-Add), which changes
 * duration by *re-timing* rather than resampling: overlapping grains of the
 * original are laid down at a new spacing, and each grain's read position is
 * nudged (within a small search window) to the offset whose waveform best
 * continues the previous grain. Because every sample is played back at its
 * original rate, pitch is preserved; because grains are aligned by waveform
 * similarity rather than dropped blindly, the result stays phase-coherent
 * instead of stuttering.
 *
 * Deliberately dependency-free and free of any Web Audio types: it operates on
 * plain `Float32Array` channel data, so it runs anywhere (browser, worker, Node)
 * and can be unit-tested without a browser.
 *
 * Honest limits, all inherent to WSOLA rather than to this implementation:
 *   • Extreme ratios (beyond roughly 0.5×–2×) grow audible warble.
 *  • Dense polyphonic music artifacts more than speech: speech is the case
 *     this is tuned for, and the case people actually use it for.
 *   • Sharp transients (drum hits) can smear slightly.
 */

/** Target grain length in seconds. ~46 ms suits speech and most music. */
const FRAME_SECONDS = 0.046;

/** How far (seconds) to hunt either side of the ideal read position. */
const SEARCH_SECONDS = 0.01;

/**
 * Stride between correlation taps. Comparing every 4th sample is ~4× faster and
 * costs nothing audible; we only need the *location* of the best match, and
 * waveform similarity is smooth at this scale.
 */
const CORRELATION_DECIMATION = 4;

/** Speeds within this of 1× are treated as "no change" (avoids pointless work). */
const UNITY_EPSILON = 1e-3;

/** Build a periodic Hann window of `size` samples. */
function hannWindow(size: number): Float32Array {
  const win = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / size));
  }
  return win;
}

/**
 * Downmix to a single Float32Array used only for alignment decisions.
 *
 * Correlating on a mono sum (rather than per channel) is both faster and more
 * correct: every channel then shares one grain offset, so the stereo image stays
 * phase-coherent. Aligning channels independently would smear the image.
 */
function monoMix(channels: Float32Array[], length: number): Float32Array {
  if (channels.length === 1) return channels[0]!;
  const mono = new Float32Array(length);
  const scale = 1 / channels.length;
  for (const ch of channels) {
    for (let i = 0; i < length; i++) mono[i] = mono[i]! + ch[i]! * scale;
  }
  return mono;
}

/**
 * Choose the read offset near `ideal` whose waveform best continues `template`.
 *
 * Plain (un-normalised) cross-correlation is the standard WSOLA similarity
 * measure: we want the single best-matching lag, and normalising by energy
 * changes which lag wins only in pathological cases while costing a square root
 * per candidate.
 */
function bestOffset(
  mono: Float32Array,
  template: Float32Array | null,
  ideal: number,
  searchRadius: number,
  maxStart: number,
): number {
  const clampStart = (v: number): number => (v < 0 ? 0 : v > maxStart ? maxStart : v);
  if (!template || template.length === 0) return clampStart(ideal);

  let bestPos = clampStart(ideal);
  let bestScore = -Infinity;

  const from = clampStart(ideal - searchRadius);
  const to = clampStart(ideal + searchRadius);

  for (let pos = from; pos <= to; pos += CORRELATION_DECIMATION) {
    let score = 0;
    for (let k = 0; k < template.length; k += CORRELATION_DECIMATION) {
      score += mono[pos + k]! * template[k]!;
    }
    if (score > bestScore) {
      bestScore = score;
      bestPos = pos;
    }
  }
  return bestPos;
}

/**
 * Time-stretch channel data by `factor` while preserving pitch.
 *
 * @param channels   one `Float32Array` per channel, all the same length
 * @param factor speed multiplier: 2 = twice as fast (half as long),
 *                   0.5 = half speed (twice as long)
 * @param sampleRate frames per second, used to size grains in real time
 * @returns          new channel arrays of length `round(inputLength / factor)`
 */
export function stretchChannels(
  channels: Float32Array[],
  factor: number,
  sampleRate: number,
): Float32Array[] {
  if (channels.length === 0) return [];
  const inLength = channels[0]!.length;
  const outLength = Math.max(1, Math.round(inLength / factor));

  // No meaningful change, or too little audio to grain: copy straight through.
  if (Math.abs(factor - 1) <= UNITY_EPSILON) {
    return channels.map((ch) => Float32Array.from(ch));
  }

  // Grain size adapts to very short clips so they still get real overlap-add.
  let frame = Math.round(FRAME_SECONDS * sampleRate);
  const maxFrame = (inLength >> 2) & ~1; // quarter of the input, forced even
  if (maxFrame >= 128 && frame > maxFrame) frame = maxFrame;
  frame = frame & ~1;

  // Below this there aren't enough samples for overlap-add to mean anything.
  if (frame < 128 || inLength < frame * 2) {
    return channels.map((ch) => {
      const out = new Float32Array(outLength);
      // Nearest-neighbour on a clip this short is inaudible either way.
      for (let i = 0; i < outLength; i++) {
        const src = Math.min(inLength - 1, Math.round(i * factor));
        out[i] = ch[src]!;
      }
      return out;
    });
  }

  const synthesisHop = frame >> 1; // 50% overlap - Hann sums to unity
  const analysisHop = Math.max(1, Math.round(synthesisHop * factor));
  const overlap = frame - synthesisHop;
  const searchRadius = Math.min(synthesisHop >> 1, Math.round(SEARCH_SECONDS * sampleRate));

  const win = hannWindow(frame);
  const mono = monoMix(channels, inLength);

  // Accumulate into padded buffers so the final grain can overhang the end.
  const padded = outLength + frame;
  const out = channels.map(() => new Float32Array(padded));
  const windowSum = new Float32Array(padded);

  // A grain must fit, and its follow-on template must be readable.
  const maxStart = Math.max(0, inLength - frame - overlap - 1);

  let template: Float32Array | null = null;
  let analysis = 0;
  let outPos = 0;

  while (outPos < outLength) {
    const start = bestOffset(mono, template, Math.round(analysis), searchRadius, maxStart);

    for (let ch = 0; ch < channels.length; ch++) {
      const src = channels[ch]!;
      const dst = out[ch]!;
      for (let i = 0; i < frame; i++) {
        dst[outPos + i]! += src[start + i]! * win[i]!;
      }
    }
    for (let i = 0; i < frame; i++) windowSum[outPos + i]! += win[i]!;

    // The next grain should continue from where this one's overlap region ends.
    template = mono.subarray(start + synthesisHop, start + synthesisHop + overlap);

    analysis += analysisHop;
    outPos += synthesisHop;
  }

  // Divide out the window envelope so the head/tail ramps don't fade.
  return out.map((dst) => {
    const trimmed = new Float32Array(outLength);
    for (let i = 0; i < outLength; i++) {
      const w = windowSum[i]!;
      trimmed[i] = w > 1e-6 ? dst[i]! / w : dst[i]!;
    }
    return trimmed;
  });
}
