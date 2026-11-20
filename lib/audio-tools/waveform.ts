/**
 * GigAI Tools: waveform peak extraction & rendering helpers.
 *
 * Reduces an {@link AudioBuffer} to a compact per-bucket peak array suitable for
 * drawing a waveform on a canvas or as an SVG path, plus a helper that turns
 * those peaks into an SVG path string. Pure math (no DOM, no audio graph) so
 * it's cheap and reusable across tools (trim UIs, players, previews).
 */

/**
 * Reduce `buffer` to `buckets` peak values in `[0, 1]`.
 *
 * Each bucket is the maximum absolute sample across the buffer window it covers,
 * mixed down across channels (so stereo shows a single combined envelope). The
 * result length equals `buckets` (or the frame count if the buffer is shorter).
 */
export function computePeaks(buffer: AudioBuffer, buckets: number): number[] {
  const n = buffer.length;
  const count = Math.max(1, Math.min(buckets, n));
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) channels.push(buffer.getChannelData(ch));

  const peaks = new Array<number>(count).fill(0);
  const step = n / count;
  for (let b = 0; b < count; b++) {
    const start = Math.floor(b * step);
    const end = Math.min(n, Math.floor((b + 1) * step));
    let peak = 0;
    for (let i = start; i < end; i++) {
      // Combined magnitude across channels for a single envelope.
      let mag = 0;
      for (const data of channels) {
        const a = Math.abs(data[i]!);
        if (a > mag) mag = a;
      }
      if (mag > peak) peak = mag;
    }
    peaks[b] = Math.min(1, peak);
  }
  return peaks;
}

/**
 * Build an SVG path `d` string for a symmetric (mirrored) waveform.
 *
 * Peaks are drawn as vertical bars centred on `height/2`, spanning the full
 * `width`. Suitable for `<path d={...} />`. `gap` (0..1) leaves a fraction of
 * each bar's slot empty for a "bars" look; 0 gives a continuous fill.
 *
 * @param peaks  0..1 magnitudes from {@link computePeaks}
 * @param width  target width in px
 * @param height target height in px
 * @param gap    inter-bar gap as a fraction of bar slot (default 0.3)
 */
export function peaksToPath(
  peaks: number[],
  width: number,
  height: number,
  gap = 0.3,
): string {
  if (peaks.length === 0 || width <= 0 || height <= 0) return "";
  const mid = height / 2;
  const slot = width / peaks.length;
  const barWidth = slot * (1 - Math.min(0.9, Math.max(0, gap)));
  const inset = (slot - barWidth) / 2;
  let d = "";
  for (let i = 0; i < peaks.length; i++) {
    const x = i * slot + inset;
    const h = Math.max(1, peaks[i]! * height); // min 1px so silence still shows
    const top = mid - h / 2;
    // A rounded-ish vertical bar as a simple rect subpath.
    d += `M${x.toFixed(2)},${top.toFixed(2)}h${barWidth.toFixed(2)}v${h.toFixed(2)}h${(-barWidth).toFixed(2)}z`;
  }
  return d;
}

/**
 * Convenience for canvas rendering: returns `{x, top, height}` bar rects for a
 * mirrored waveform, given peaks and target dimensions. Callers fill each rect.
 */
export function peaksToBars(
  peaks: number[],
  width: number,
  height: number,
  gap = 0.3,
): Array<{ x: number; top: number; width: number; height: number }> {
  const mid = height / 2;
  const slot = width / Math.max(1, peaks.length);
  const barWidth = slot * (1 - Math.min(0.9, Math.max(0, gap)));
  const inset = (slot - barWidth) / 2;
  return peaks.map((p, i) => {
    const h = Math.max(1, p * height);
    return { x: i * slot + inset, top: mid - h / 2, width: barWidth, height: h };
  });
}
