-- Audit LLM layer: free-tier quota tracking and response cache. Plain
-- tables - the corpus itself ships as precomputed vectors in the worker
-- bundle (no server-side model, no pgvector needed at this corpus size).
CREATE TABLE IF NOT EXISTS llm_quota (
  provider text NOT NULL,
  day      date NOT NULL,
  requests integer NOT NULL DEFAULT 0,
  PRIMARY KEY (provider, day)
);
CREATE TABLE IF NOT EXISTS llm_cache (
  url_hash     text NOT NULL,
  finding_id   text NOT NULL,
  content_hash text NOT NULL,
  output       jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (url_hash, finding_id, content_hash)
);
ALTER TABLE llm_quota OWNER TO gigai_api;
ALTER TABLE llm_cache OWNER TO gigai_api;
