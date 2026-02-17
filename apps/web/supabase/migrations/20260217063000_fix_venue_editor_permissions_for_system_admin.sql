-- Drop old policies
DROP POLICY IF EXISTS "Venue editors can insert editors" ON venue_editors;
DROP POLICY IF EXISTS "Venue editors can delete editors" ON venue_editors;

-- Recreated: system_admin can also insert venue_editors
CREATE POLICY "Venue editors can insert editors"
ON venue_editors FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM venues
    WHERE venues.id = venue_id AND venues.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM venue_editors ve
    WHERE ve.venue_id = venue_editors.venue_id
    AND ve.user_id = auth.uid()
    AND ve.role IN ('editor', 'chief_editor')
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin'
  )
);

-- Recreated: system_admin can also delete venue_editors
CREATE POLICY "Venue editors can delete editors"
ON venue_editors FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM venues
    WHERE venues.id = venue_id AND venues.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM venue_editors ve
    WHERE ve.venue_id = venue_editors.venue_id
    AND ve.user_id = auth.uid()
    AND ve.role = 'chief_editor'
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'system_admin'
  )
);
