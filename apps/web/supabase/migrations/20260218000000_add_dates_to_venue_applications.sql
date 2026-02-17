-- Add date and location fields to venue_applications table
ALTER TABLE venue_applications ADD COLUMN IF NOT EXISTS deadline TEXT;
ALTER TABLE venue_applications ADD COLUMN IF NOT EXISTS submission_open TEXT;
ALTER TABLE venue_applications ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE venue_applications ADD COLUMN IF NOT EXISTS location TEXT;

-- Update the trigger function to pass new fields when application is approved
CREATE OR REPLACE FUNCTION handle_venue_application_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Create the venue
    INSERT INTO venues (name, slug, subtitle, description, review_mode, website, contact, created_by, accepting_submissions, deadline, submission_open, date, location)
    VALUES (
      NEW.name, NEW.slug, NEW.subtitle, NEW.description, NEW.review_mode, NEW.website, NEW.contact,
      NEW.applicant_id, true, NEW.deadline, NEW.submission_open, NEW.date, NEW.location
    );

    -- Add applicant as chief_editor of the new venue
    INSERT INTO venue_editors (venue_id, user_id, role)
    SELECT id, NEW.applicant_id, 'chief_editor'
    FROM venues WHERE slug = NEW.slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
