-- Phase 3 additive migration. Applied to gigai_api after schema.sql.

-- Webhook signatures require the raw signing secret (a hash cannot sign).
-- The secret is per-endpoint, random, and shown to the user once at create.
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS secret text;

-- Retries must re-send the exact original body.
ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}';

-- retention=0 semantics: delete on first successful download (or 60 s).
ALTER TABLE files ADD COLUMN IF NOT EXISTS downloaded_at timestamptz;
-- Job-level purge and export lookup without task joins.
ALTER TABLE files ADD COLUMN IF NOT EXISTS job_id text;
ALTER TABLE files ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'output';
CREATE INDEX IF NOT EXISTS files_job ON files(job_id) WHERE deleted_at IS NULL;
