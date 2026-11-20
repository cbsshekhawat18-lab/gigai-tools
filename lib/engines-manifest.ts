import path from "node:path";

/**
 * The developer API's engine manifest. One file, read by the backend
 * (app/v1/tools.py), the task worker and, at build time, this site.
 */
export const ENGINES_MANIFEST = path.join(process.cwd(), "backend", "app", "v1", "engines.json");
