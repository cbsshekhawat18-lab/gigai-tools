-- Site Audit: queue, results (30-day expiry), and durable rate counters.
CREATE TABLE IF NOT EXISTS audits (
  id          text PRIMARY KEY,              -- aud_ + 24 hex (unguessable share id)
  url         text NOT NULL,
  max_pages   integer NOT NULL DEFAULT 25,
  status      text NOT NULL DEFAULT 'queued',-- queued | running | done | error
  -- Requester: an account id, or sha256(ip) for anonymous - never a raw IP.
  subject     text NOT NULL,
  progress    jsonb,
  result      jsonb,                         -- findings/scores only, never raw HTML
  error       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  started_at  timestamptz,
  finished_at timestamptz,
  expires_at  timestamptz
);
CREATE INDEX IF NOT EXISTS audits_queue ON audits(status, created_at) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS audits_expiry ON audits(expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS audit_ratelimit (
  subject text NOT NULL,                     -- account id or sha256(ip)
  day     date NOT NULL,
  count   integer NOT NULL DEFAULT 0,
  PRIMARY KEY (subject, day)
);
ALTER TABLE audits OWNER TO gigai_api;
ALTER TABLE audit_ratelimit OWNER TO gigai_api;
