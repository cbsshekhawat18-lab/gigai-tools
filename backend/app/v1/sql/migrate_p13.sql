-- Ask GigAI agent endpoints: daily plan quota + opt-in learning data.
-- Learning rows hold goal/plan/outcome JSON only - never file contents;
-- the /ask UI shows the exact JSON before anything is sent (default off).
CREATE TABLE IF NOT EXISTS agent_ratelimit (
  subject text NOT NULL,
  day     date NOT NULL,
  count   integer NOT NULL DEFAULT 0,
  PRIMARY KEY (subject, day)
);
CREATE TABLE IF NOT EXISTS agent_learning (
  id         text PRIMARY KEY,
  account_id text NOT NULL,
  goal       text NOT NULL,
  plan       jsonb NOT NULL,
  outcomes   jsonb NOT NULL,
  edited     boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE agent_ratelimit OWNER TO gigai_api;
ALTER TABLE agent_learning OWNER TO gigai_api;
