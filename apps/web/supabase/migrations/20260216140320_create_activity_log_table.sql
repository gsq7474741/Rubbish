
-- Create activity_log table for venue/paper activity feeds
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES venues(id),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_venue ON activity_log(venue_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id, created_at DESC);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity log is viewable by everyone" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Activity log is insertable by authenticated" ON activity_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
