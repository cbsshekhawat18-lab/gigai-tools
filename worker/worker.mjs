/**
 * GigAI Developer API - task worker.
 *
 * Node process that claims runnable tasks from Postgres (FOR UPDATE SKIP
 * LOCKED, so several workers could coexist), runs the engine, writes outputs
 * to the file store, and finalizes jobs (retention window, webhook queueing,
 * usage byte counters).
 *
 * Engines are the same libraries the browser tools use - pdf-lib here runs
 * the exact merge the /merge-pdf page runs. File BYTES are read and written;
 * they are never logged, never put in the database, never in error messages.
 *
 * Deploys as a single esbuild bundle: node worker.bundle.mjs
 * Env (the same file as the backend's): GIGAI_API_DSN,
 * GIGAI_API_FILES_DIR (default data/apifiles, relative to the working directory).
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

import { EngineError, checkInputFormat, engines } from "./engines.mjs";
import { assertPublicHost } from "./net-guard.mjs";
import { runAudit } from "./audit/index.mjs";
// Baked in at bundle time from the shared manifest - the same file the API
// validates against, so worker and gateway can never disagree.
import MANIFEST from "../backend/app/v1/engines.json";

const FILES_DIR = process.env.GIGAI_API_FILES_DIR || "data/apifiles";
const POLL_MS = 2000;
const IMPORT_TIMEOUT_MS = 60_000;

/** libpq "k=v k=v" DSN -> node-postgres config. */
function parseDsn(dsn) {
  const map = {};
  for (const part of (dsn || "").trim().split(/\s+/)) {
    const i = part.indexOf("=");
    if (i > 0) map[part.slice(0, i)] = part.slice(i + 1);
  }
  return {
    database: map.dbname, user: map.user, password: map.password,
    host: map.host || "127.0.0.1", port: Number(map.port || 5432),
  };
}

const dsn = process.env.GIGAI_API_DSN;
if (!dsn) { console.error("GIGAI_API_DSN is not set"); process.exit(1); }
const db = new pg.Pool({ ...parseDsn(dsn), max: 3 });

const filePath = (id) => path.join(FILES_DIR, id.replaceAll("/", ""));
const newId = (prefix) =>
  `${prefix}_${createHash("sha256").update(`${Math.random()}${process.hrtime.bigint()}`).digest("hex").slice(0, 24)}`;

async function saveOutput(client, { accountId, taskId, jobId, filename, mime, data }) {
  const id = newId("file");
  await mkdir(FILES_DIR, { recursive: true });
  await writeFile(filePath(id), data);
  await client.query(
    `INSERT INTO files (id, account_id, task_id, job_id, r2_key, filename, size, mime, sha256, kind, expires_at)
     VALUES ($1,$2,$3,$4,$1,$5,$6,$7,$8,'output', now() + interval '24 hours')`,
    [id, accountId, taskId, jobId, filename, data.length,
     mime, createHash("sha256").update(data).digest("hex")],
  );
  return { id, size: data.length };
}

/** Ordered input buffers for a task (order of input_names, then file id). */
async function loadInputs(client, task) {
  const { rows } = await client.query(
    `SELECT f.id, f.filename, f.size FROM files f
     JOIN tasks t ON t.id = f.task_id
     WHERE t.job_id = $1 AND t.name = ANY($2) AND f.deleted_at IS NULL
     ORDER BY array_position($2, t.name), f.id`,
    [task.job_id, task.input_names],
  );
  const inputs = [];
  for (const r of rows) inputs.push({ ...r, data: await readFile(filePath(r.id)) });
  return inputs;
}

/** Best-effort timeout: marks the task failed on deadline. (A CPU-bound
 * engine can't be preempted in-process; MemoryMax + Restart on the unit is
 * the real backstop.) */
function withTimeout(promise, seconds) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new EngineError("timeout", `The engine exceeded its ${seconds}s time limit.`)),
        seconds * 1000,
      );
    }),
  ]);
}

async function runImportUrl(client, task, limits) {
  let url = task.options.url;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), IMPORT_TIMEOUT_MS);
  let resp;
  try {
    // Follow redirects by hand so every hop passes the SSRF fence.
    for (let hop = 0; ; hop++) {
      if (hop > 5) throw new EngineError("download_failed", "Too many redirects.");
      await assertPublicHost(url);
      resp = await fetch(url, { signal: ctrl.signal, redirect: "manual" });
      if (resp.status >= 300 && resp.status < 400 && resp.headers.get("location")) {
        url = new URL(resp.headers.get("location"), url).href;
        continue;
      }
      break;
    }
  } catch (err) {
    if (err instanceof EngineError) { clearTimeout(timer); throw err; }
    throw new EngineError("download_failed", "The import URL could not be fetched.");
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) throw new EngineError("download_failed", `The import URL answered HTTP ${resp.status}.`);
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length > limits.max_file_bytes)
    throw new EngineError("file_too_large", `The fetched file (${buf.length} bytes) exceeds the ${limits.max_file_bytes}-byte limit.`);
  const name = task.options.filename
    || decodeURIComponent(new URL(url).pathname.split("/").pop() || "") || "import";
  return [{ filename: name.slice(0, 255), mime: resp.headers.get("content-type")?.split(";")[0] || null, data: buf }];
}

async function finalizeJobIfDone(client, jobId) {
  const { rows: [agg] } = await client.query(
    `SELECT count(*) FILTER (WHERE status NOT IN ('finished'))::int AS unfinished,
            count(*) FILTER (WHERE status = 'error')::int AS errored
     FROM tasks WHERE job_id = $1`, [jobId]);
  const failed = agg.errored > 0;
  if (agg.unfinished > 0 && !failed) return;

  if (failed) {
    await client.query(
      `UPDATE tasks SET status = 'cancelled' WHERE job_id = $1 AND status IN ('waiting','processing')`, [jobId]);
  }
  const { rows: [job] } = await client.query(
    `UPDATE jobs SET status = $2, finished_at = now()
     WHERE id = $1 AND finished_at IS NULL
     RETURNING id, account_id, tag, status, retention_s, sandbox, created_at, finished_at`,
    [jobId, failed ? "error" : "finished"]);
  if (!job) return; // another worker finalized it

  // Retention window starts now. retention 0 = one download or 60 seconds.
  await client.query(
    `UPDATE files SET expires_at = now() + greatest($2, 60) * interval '1 second'
     WHERE job_id = $1 AND deleted_at IS NULL`, [jobId, job.retention_s]);

  if (!job.sandbox) {
    const { rows: [bytes] } = await client.query(
      `SELECT coalesce(sum(size) FILTER (WHERE kind = 'import'), 0)::bigint AS b_in,
              coalesce(sum(size) FILTER (WHERE kind = 'output'), 0)::bigint AS b_out
       FROM files WHERE job_id = $1`, [jobId]);
    await client.query(
      `INSERT INTO usage_counters (account_id, period, bytes_in, bytes_out)
       VALUES ($1, to_char(now(), 'YYYY-MM'), $2, $3)
       ON CONFLICT (account_id, period) DO UPDATE
       SET bytes_in = usage_counters.bytes_in + EXCLUDED.bytes_in,
           bytes_out = usage_counters.bytes_out + EXCLUDED.bytes_out`,
      [job.account_id, bytes.b_in, bytes.b_out]);
  }

  const event = failed ? "job.failed" : "job.finished";
  const payload = {
    job: { id: job.id, tag: job.tag, status: job.status, sandbox: job.sandbox,
           created_at: job.created_at, finished_at: job.finished_at },
  };
  await client.query(
    `INSERT INTO webhook_deliveries (webhook_id, event, job_id, payload)
     SELECT id, $2, $3, $4 FROM webhooks
     WHERE account_id = $1 AND disabled_at IS NULL AND $2 = ANY(events)`,
    [job.account_id, event, job.id, JSON.stringify(payload)]);
  await client.query(
    `INSERT INTO audit_log (account_id, actor, action, subject_id, metadata)
     VALUES ($1, 'worker', $2, $3, '{}')`, [job.account_id, event, job.id]);
}

async function claimAndRun() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const { rows: [task] } = await client.query(
      `WITH runnable AS (
         SELECT t.id FROM tasks t
         JOIN jobs j ON j.id = t.job_id
         WHERE t.status = 'waiting' AND j.status IN ('waiting','processing')
           AND NOT EXISTS (
             SELECT 1 FROM unnest(t.input_names) AS dep(name)
             JOIN tasks d ON d.job_id = t.job_id AND d.name = dep.name
             WHERE d.status <> 'finished')
         ORDER BY t.id
         FOR UPDATE OF t SKIP LOCKED
         LIMIT 1)
       UPDATE tasks SET status = 'processing', started_at = now()
       WHERE id IN (SELECT id FROM runnable)
       RETURNING id, job_id, name, operation, options, input_names`);
    await client.query("COMMIT");
    if (!task) return false;

    const { rows: [job] } = await client.query(
      `SELECT j.account_id, j.sandbox, p.max_file_bytes
       FROM jobs j JOIN accounts a ON a.id = j.account_id
       JOIN plan_limits p ON p.plan = a.plan WHERE j.id = $1`, [task.job_id]);
    const limits = { max_file_bytes: job.sandbox ? Math.min(job.max_file_bytes, 10 * 1024 * 1024) : Number(job.max_file_bytes) };
    await client.query(`UPDATE jobs SET status = 'processing' WHERE id = $1 AND status = 'waiting'`, [task.job_id]);

    const t0 = Date.now();
    try {
      let outputs = [];
      if (task.operation === "import/url") {
        outputs = await runImportUrl(client, task, limits);
      } else if (task.operation === "export/url") {
        outputs = []; // the API composes signed URLs from the input tasks' files
      } else if (engines[task.operation]) {
        const spec = MANIFEST[task.operation];
        const inputs = spec.no_input ? [] : await loadInputs(client, task);
        if (!spec.no_input) {
          if (!inputs.length) throw new EngineError("input_missing", "The input tasks produced no files.");
          for (const input of inputs) {
            if (input.size > spec.max_input_bytes)
              throw new EngineError("file_too_large",
                `'${input.filename}' (${input.size} bytes) exceeds this tool's ${spec.max_input_bytes}-byte limit.`);
            checkInputFormat(input, spec.input_formats);
          }
        }
        outputs = await withTimeout(engines[task.operation](inputs, task.options), spec.timeout_s);
      } else {
        throw new EngineError("engine_unavailable", `No engine for '${task.operation}' in this worker build.`);
      }
      for (const out of outputs) {
        await saveOutput(client, {
          accountId: job.account_id, taskId: task.id, jobId: task.job_id,
          filename: out.filename, mime: out.mime, data: out.data,
        });
      }
      await client.query(
        `UPDATE tasks SET status = 'finished', finished_at = now(), engine = $2, duration_ms = $3 WHERE id = $1`,
        [task.id, task.operation, Date.now() - t0]);
    } catch (err) {
      const code = err instanceof EngineError ? err.code : "engine_failed";
      const msg = err instanceof EngineError ? err.message : "The engine failed unexpectedly.";
      await client.query(
        `UPDATE tasks SET status = 'error', finished_at = now(), duration_ms = $4,
           error_code = $2, error_message = $3 WHERE id = $1`,
        [task.id, code, msg.slice(0, 500), Date.now() - t0]);
    }
    await finalizeJobIfDone(client, task.job_id);
    return true;
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch { /* not in tx */ }
    console.error("worker loop error:", err.message);
    return false;
  } finally {
    client.release();
  }
}

/* ---------------- site audits: own queue, concurrency 2 ---------------- */

const AUDIT_CONCURRENCY = 2;
let auditsInFlight = 0;

async function claimAudit() {
  if (auditsInFlight >= AUDIT_CONCURRENCY) return false;
  const { rows: [audit] } = await db.query(
    `UPDATE audits SET status = 'running', started_at = now()
     WHERE id = (SELECT id FROM audits WHERE status = 'queued'
                 ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED)
     RETURNING id, url, max_pages`);
  if (!audit) return false;
  auditsInFlight++;
  // Detached on purpose: an audit takes up to 60 s and must not block the
  // file-task loop; the in-flight counter is the concurrency gate.
  void (async () => {
    try {
      const result = await runAudit(audit.url, {
        db,
        maxPages: audit.max_pages ?? 25,
        budgetMs: 60_000,
        onProgress: (p) => {
          void db.query(`UPDATE audits SET progress = $2 WHERE id = $1`,
            [audit.id, JSON.stringify(p)]).catch(() => {});
        },
      });
      await db.query(
        `UPDATE audits SET status = 'done', result = $2, finished_at = now(),
                expires_at = now() + interval '30 days' WHERE id = $1`,
        [audit.id, JSON.stringify(result)]);
    } catch (err) {
      await db.query(
        `UPDATE audits SET status = 'error', error = $2, finished_at = now(),
                expires_at = now() + interval '7 days' WHERE id = $1`,
        [audit.id, String(err?.message ?? err).slice(0, 300)]).catch(() => {});
    } finally {
      auditsInFlight--;
    }
  })();
  return true;
}

console.log(`gigai-api-worker up (files: ${FILES_DIR}, engines: ${Object.keys(engines).join(", ")})`);
for (;;) {
  let didWork = false;
  try { didWork = await claimAndRun(); } catch (e) { console.error(e.message); }
  try { didWork = (await claimAudit()) || didWork; } catch (e) { console.error("audit claim:", e.message); }
  if (!didWork) await new Promise((r) => setTimeout(r, POLL_MS));
}
