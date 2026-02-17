
-- Add comment_type to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS comment_type text DEFAULT 'public_comment';

-- Add revision tracking to papers
ALTER TABLE papers ADD COLUMN IF NOT EXISTS revision_number integer DEFAULT 1;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS previous_version_id uuid REFERENCES papers(id);
