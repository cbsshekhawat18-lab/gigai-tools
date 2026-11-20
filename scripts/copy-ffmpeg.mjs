/**
 * Copies the ffmpeg.wasm core from node_modules/@ffmpeg/core into
 * public/ffmpeg/, where lib/video-tools/ffmpeg.ts loads it same-origin.
 *
 * The core is GPL-2.0-or-later, so it is not committed to this Apache-2.0
 * repository: npm installs it, and this script (run on postinstall and before
 * every build) puts it where the site serves it. See THIRD_PARTY_NOTICES.md.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules", "@ffmpeg", "core", "dist", "umd");
const to = join(root, "public", "ffmpeg");

if (!existsSync(from)) {
  console.warn("copy-ffmpeg: @ffmpeg/core is not installed; the video tools will not load.");
  process.exit(0);
}
mkdirSync(to, { recursive: true });
for (const file of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) copyFileSync(join(from, file), join(to, file));
console.log("copy-ffmpeg: public/ffmpeg/ is ready.");
