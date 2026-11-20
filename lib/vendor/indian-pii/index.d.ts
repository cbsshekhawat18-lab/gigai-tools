import { a as Detector, b as DetectOptions, D as DetectionResult, M as MaskOptions } from './types-DPoomkix.js';
export { C as Category, S as Severity } from './types-DPoomkix.js';

/**
 * The full detector registry, ordered so that checksum-validated and longer,
 * more-specific detectors come first. On equal confidence this ordering decides
 * which detector wins the de-duplication pass in the engine.
 */
declare const detectors: Detector[];
/** Map of detector id → detector for O(1) lookup. */
declare const detectorMap: Map<string, Detector>;

/**
 * Scan `text` for Indian PII. Returns non-overlapping hits; where spans
 * overlap, the highest-confidence hit (checksum-validated beats structure-only)
 * is kept.
 *
 * @param text   The text to scan.
 * @param options.types         Restrict to these detector ids.
 * @param options.requireValid  Only return hits that pass real validation.
 * @param options.contextWindow Characters each side searched for a keyword.
 */
declare function detect(text: unknown, options?: DetectOptions): DetectionResult[];
/**
 * Strictly validate a single value against one detector type (checksum or
 * structure). Returns false for unknown types or non-string input — never
 * throws.
 */
declare function validate(type: string, value: unknown): boolean;
/**
 * Mask a single value using its detector's masking rule. Unknown types return
 * the input unchanged; non-string input returns "".
 */
declare function maskValue(type: string, value: unknown): string;
/**
 * Detect all PII in `text` and return a copy with each hit replaced by its
 * masked form. Accepts the same options as {@link detect} plus `maskChar`.
 */
declare function mask(text: unknown, options?: MaskOptions): string;

export { DetectOptions, DetectionResult, Detector, MaskOptions, detect, detectorMap, detectors, mask, maskValue, validate };
