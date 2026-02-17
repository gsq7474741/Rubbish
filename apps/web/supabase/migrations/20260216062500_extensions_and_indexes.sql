
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX papers_title_trgm_idx ON papers USING GIN (title gin_trgm_ops);
CREATE INDEX papers_abstract_trgm_idx ON papers USING GIN (abstract gin_trgm_ops);
