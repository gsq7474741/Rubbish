
-- Allow authenticated users to create venues (they become the creator)
CREATE POLICY "Authenticated users can create venues"
ON venues FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Venue editors (or creator) can update their venues
CREATE POLICY "Venue editors can update venues"
ON venues FOR UPDATE
USING (
  auth.uid() = created_by
  OR EXISTS (
    SELECT 1 FROM venue_editors
    WHERE venue_editors.venue_id = venues.id
    AND venue_editors.user_id = auth.uid()
  )
);

-- Venue creator or existing editors can add new editors
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
);

-- Venue creator or chief editors can remove editors
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
);
