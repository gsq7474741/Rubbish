-- Editor invite codes table
CREATE TABLE IF NOT EXISTS editor_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES profiles(id),
  purpose text NOT NULL DEFAULT 'instant_publish',
  max_uses int DEFAULT 1,
  used_count int DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE editor_invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors can manage their venue codes"
  ON editor_invite_codes FOR ALL
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM venue_editors
      WHERE venue_editors.venue_id = editor_invite_codes.venue_id
      AND venue_editors.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read codes for verification"
  ON editor_invite_codes FOR SELECT
  USING (true);

-- Review assignments table (for blind review mode)
CREATE TABLE IF NOT EXISTS review_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id),
  assigned_by text NOT NULL DEFAULT 'system',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(paper_id, reviewer_id)
);

ALTER TABLE review_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviewers can see their assignments"
  ON review_assignments FOR SELECT
  USING (reviewer_id = auth.uid());

CREATE POLICY "System can manage assignments"
  ON review_assignments FOR ALL
  USING (true);
