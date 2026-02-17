-- Add additional fields to venues table
ALTER TABLE venues ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS contact text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS instructions text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS deadline timestamptz;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS submission_open timestamptz;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS date text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS parent_venue_id uuid REFERENCES venues(id);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS paper_count integer DEFAULT 0;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS reviewer_count integer DEFAULT 0;
