-- db/init.sql
CREATE TABLE IF NOT EXISTS links (
  code VARCHAR(8) PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMPTZ NULL
);

-- Index to quickly lookup codes (primary key sufficient).
