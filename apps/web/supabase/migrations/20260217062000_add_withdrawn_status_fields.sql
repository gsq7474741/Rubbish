-- Add withdrawal fields to papers table
ALTER TABLE papers ADD COLUMN IF NOT EXISTS withdrawal_reason text;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz;

-- Drop existing status constraint if any (to allow 'withdrawn' value)
DO $$
BEGIN
  ALTER TABLE papers DROP CONSTRAINT IF EXISTS papers_status_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
