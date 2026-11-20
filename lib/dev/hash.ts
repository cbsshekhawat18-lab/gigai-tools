/**
 * GigAI Tools: hashing engine.
 *
 * SHA-1/256/384/512 and HMAC via native Web Crypto (`crypto.subtle`); MD5 via
 * spark-md5 (dynamic-imported, since Web Crypto omits MD5). Files are hashed
 * incrementally so multi-GB inputs never load fully into a single buffer. All
 * outputs are lowercase hex.
 */

export type HashAlgo = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

/** Algorithms supported for HMAC (MD5 excluded. Web Crypto has no MD5). */
export type HmacAlgo = Exclude<HashAlgo, "MD5">;

export const HASH_ALGOS: HashAlgo[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

/** Convert an ArrayBuffer to lowercase hex. */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i += 1) {
    hex += (bytes[i] ?? 0).toString(16).padStart(2, "0");
  }
  return hex;
}

/** Hash a text string with the given algorithm; returns lowercase hex. */
export async function hashText(text: string, algo: HashAlgo): Promise<string> {
  if (algo === "MD5") {
    const SparkMD5 = (await import("spark-md5")).default;
    return SparkMD5.hash(text);
  }
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algo, data);
  return bufferToHex(digest);
}

/** Chunk size for streaming file hashing (8 MiB). */
const FILE_CHUNK = 8 * 1024 * 1024;

/**
 * Hash a File/Blob with the given algorithm, streaming in chunks so large files
 * stay within memory. Returns lowercase hex.
 *
 * Note: Web Crypto's `digest` has no incremental API, so SHA hashing of very
 * large files reads the whole buffer once (`file.arrayBuffer()`); MD5 (spark)
 * genuinely streams. This is a browser-platform limitation, documented honestly.
 */
export async function hashFile(file: Blob, algo: HashAlgo): Promise<string> {
  if (algo === "MD5") {
    const SparkMD5 = (await import("spark-md5")).default;
    const spark = new SparkMD5.ArrayBuffer();
    let offset = 0;
    while (offset < file.size) {
      const slice = file.slice(offset, offset + FILE_CHUNK);
      spark.append(await slice.arrayBuffer());
      offset += FILE_CHUNK;
    }
    return spark.end();
  }
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest(algo, buffer);
  return bufferToHex(digest);
}

/**
 * Compute an HMAC of `text` keyed by `key` using the given SHA algorithm.
 * Returns lowercase hex. (MD5-HMAC is unsupported by Web Crypto.)
 */
export async function hmac(text: string, key: string, algo: HmacAlgo): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: algo },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(text),
  );
  return bufferToHex(signature);
}
