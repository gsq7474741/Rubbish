ALTER TABLE papers ADD COLUMN IF NOT EXISTS supplementary_urls jsonb DEFAULT '[]';
