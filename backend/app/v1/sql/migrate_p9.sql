-- Interfaces build: roles, suspension, per-account limit overrides,
-- docs feedback. Additive as always.
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS suspended_at timestamptz;
-- Per-user overrides beat plan defaults, key by key: {"tasks_per_month": 5000}
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS limits_override jsonb NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS docs_feedback (
  id         bigserial PRIMARY KEY,
  page       text NOT NULL,
  helpful    boolean NOT NULL,
  comment    text,
  created_at timestamptz NOT NULL DEFAULT now()
);
