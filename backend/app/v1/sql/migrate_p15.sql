-- Poster pages Phase 2: a renamed page keeps answering on its old address for
-- 30 days (301 to the new slug). Rows cascade away with the page.
CREATE TABLE IF NOT EXISTS poster_slug_redirects (
  old_slug   text PRIMARY KEY,
  page_id    text NOT NULL REFERENCES poster_pages(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
ALTER TABLE poster_slug_redirects OWNER TO gigai_api;
