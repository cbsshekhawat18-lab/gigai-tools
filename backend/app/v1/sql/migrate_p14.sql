-- Supporter Poster Pages (Phase 1). A page = one owner's header details plus
-- up to 4 finished banner designs and, per banner, where the SUPPORTER's
-- photo/name go. Supporter photos never reach the server: poster_events holds
-- counters only (no IP, no names). Slug uniqueness is partial so a soft-deleted
-- page frees its slug.
CREATE TABLE IF NOT EXISTS poster_pages (
  id           text PRIMARY KEY,                       -- pg_ + 24 hex
  account_id   text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  slug         text NOT NULL,
  display_name text NOT NULL,
  designation  text NOT NULL DEFAULT '',
  area         text NOT NULL DEFAULT '',
  tagline      text NOT NULL DEFAULT '',
  org_name     text NOT NULL DEFAULT '',
  theme        jsonb NOT NULL DEFAULT '{}',             -- {primary, secondary}
  defaults     jsonb NOT NULL DEFAULT '{}',             -- supporter_label/area, announcement, slogans[], whatsapp_text
  lang         text NOT NULL DEFAULT 'hi',
  logo_bytes   integer NOT NULL DEFAULT 0,              -- 0 = no logo on disk
  status       text NOT NULL DEFAULT 'draft',           -- draft | live | paused
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS poster_pages_slug ON poster_pages(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS poster_pages_account ON poster_pages(account_id);

CREATE TABLE IF NOT EXISTS poster_banners (
  id          text PRIMARY KEY,                        -- bn_ + 24 hex, immutable per upload
  page_id     text NOT NULL REFERENCES poster_pages(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0,
  width       integer NOT NULL,                        -- stored HD variant, px
  height      integer NOT NULL,
  zones       jsonb NOT NULL DEFAULT '{"photos":[],"name":null}',  -- normalised 0..1 coords
  bytes_total integer NOT NULL DEFAULT 0,              -- preview + hd on disk
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS poster_banners_page ON poster_banners(page_id, sort_order);

CREATE TABLE IF NOT EXISTS poster_events (
  id         bigserial PRIMARY KEY,
  page_id    text NOT NULL REFERENCES poster_pages(id) ON DELETE CASCADE,
  banner_id  text,
  type       text NOT NULL,                            -- visit | download | share | copy
  day        date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS poster_events_page_day ON poster_events(page_id, day);

ALTER TABLE poster_pages   OWNER TO gigai_api;
ALTER TABLE poster_banners OWNER TO gigai_api;
ALTER TABLE poster_events  OWNER TO gigai_api;
