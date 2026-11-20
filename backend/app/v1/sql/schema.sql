-- GigAI Tools Developer API - schema v1 (Phase 2 scope: accounts/keys/usage;
-- jobs/tasks/files/webhooks tables created now so Phase 3 is additive).
-- Applied to database gigai_api as role gigai_api.

CREATE TABLE IF NOT EXISTS accounts (
  id            text PRIMARY KEY,             -- acc_ + 24 hex
  email         text NOT NULL UNIQUE,
  email_verified_at timestamptz,
  password_hash text NOT NULL,                -- argon2id
  plan          text NOT NULL DEFAULT 'free',
  retention_default_s integer NOT NULL DEFAULT 3600,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE TABLE IF NOT EXISTS api_keys (
  id          text PRIMARY KEY,               -- key_ + 24 hex
  account_id  text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name        text NOT NULL,
  prefix      text NOT NULL,                  -- gk_live_ / gk_test_
  token_hash  text NOT NULL UNIQUE,           -- sha256 hex of the full token
  last4       text NOT NULL,
  scopes      text[] NOT NULL DEFAULT '{tools:run,jobs:read,jobs:write,webhooks:manage}',
  sandbox     boolean NOT NULL DEFAULT false,
  ip_allowlist text[],
  last_used_at timestamptz,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS api_keys_account ON api_keys(account_id);

CREATE TABLE IF NOT EXISTS plan_limits (
  plan              text PRIMARY KEY,
  tasks_per_month   integer NOT NULL,
  max_file_bytes    bigint  NOT NULL,
  rpm               integer NOT NULL,
  concurrent_jobs   integer NOT NULL,
  webhook_endpoints integer NOT NULL
);
INSERT INTO plan_limits VALUES ('free', 1000, 104857600, 60, 5, 10)
  ON CONFLICT (plan) DO NOTHING;

CREATE TABLE IF NOT EXISTS usage_counters (
  account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  period     text NOT NULL,                   -- YYYY-MM
  tasks_run  integer NOT NULL DEFAULT 0,
  bytes_in   bigint  NOT NULL DEFAULT 0,
  bytes_out  bigint  NOT NULL DEFAULT 0,
  PRIMARY KEY (account_id, period)
);

CREATE TABLE IF NOT EXISTS email_tokens (
  token      text PRIMARY KEY,
  account_id text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  purpose    text NOT NULL,                   -- verify | reset
  expires_at timestamptz NOT NULL
);

-- Phase 3 tables, created now so migrations stay additive.
CREATE TABLE IF NOT EXISTS jobs (
  id          text PRIMARY KEY,
  account_id  text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  tag         text,
  status      text NOT NULL DEFAULT 'waiting',
  retention_s integer NOT NULL DEFAULT 3600,
  webhook_url text,
  idempotency_key text,
  sandbox     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS jobs_idem
  ON jobs(account_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS jobs_account_created ON jobs(account_id, created_at DESC);

CREATE TABLE IF NOT EXISTS tasks (
  id          text PRIMARY KEY,
  job_id      text NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name        text NOT NULL,
  operation   text NOT NULL,
  options     jsonb NOT NULL DEFAULT '{}',
  input_names text[] NOT NULL DEFAULT '{}',
  status      text NOT NULL DEFAULT 'waiting',
  engine      text,
  duration_ms integer,
  error_code  text,
  error_message text,
  started_at  timestamptz,
  finished_at timestamptz,
  UNIQUE (job_id, name)
);
CREATE INDEX IF NOT EXISTS tasks_queue ON tasks(status) WHERE status = 'waiting';

CREATE TABLE IF NOT EXISTS files (
  id          text PRIMARY KEY,
  account_id  text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  task_id     text REFERENCES tasks(id) ON DELETE SET NULL,
  r2_key      text NOT NULL,
  filename    text NOT NULL,
  size        bigint,
  mime        text,
  sha256      text,
  expires_at  timestamptz NOT NULL,
  deleted_at  timestamptz,
  delete_verified_at timestamptz
);
CREATE INDEX IF NOT EXISTS files_expiry ON files(expires_at) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS webhooks (
  id          text PRIMARY KEY,
  account_id  text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  url         text NOT NULL,
  secret_hash text NOT NULL,
  events      text[] NOT NULL DEFAULT '{job.finished,job.failed}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id          bigserial PRIMARY KEY,
  webhook_id  text NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event       text NOT NULL,
  job_id      text,
  attempt     integer NOT NULL DEFAULT 0,
  status_code integer,
  next_retry_at timestamptz,
  delivered_at timestamptz
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         bigserial PRIMARY KEY,
  account_id text,
  actor      text NOT NULL,
  action     text NOT NULL,
  subject_id text,
  metadata   jsonb NOT NULL DEFAULT '{}',    -- metadata only, never file contents
  created_at timestamptz NOT NULL DEFAULT now()
);
