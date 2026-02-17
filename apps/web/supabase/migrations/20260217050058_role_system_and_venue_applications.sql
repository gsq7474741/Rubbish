-- 1. Add role to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Roles: 'user' | 'venue_editor' | 'content_admin' | 'system_admin'
-- user: 普通用户，可投稿、评论、评审
-- venue_editor: venue 编辑，管理特定 venue
-- content_admin: 内容管理员，审核 venue 申请
-- system_admin: 系统管理员，管理用户角色

-- 2. Create venue_applications table
CREATE TABLE IF NOT EXISTS venue_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  description TEXT,
  review_mode TEXT NOT NULL DEFAULT 'open',
  website TEXT,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_venue_applications_status ON venue_applications(status);
CREATE INDEX idx_venue_applications_applicant ON venue_applications(applicant_id);

-- 3. Drop previous venue INSERT policy and create new ones
DROP POLICY IF EXISTS "Authenticated users can create venues" ON venues;
DROP POLICY IF EXISTS "Venue editors can update venues" ON venues;

-- Only content_admin and system_admin can directly create venues
CREATE POLICY "Admins can create venues"
ON venues FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('content_admin', 'system_admin'))
);

-- Venue editors and admins can update venues
CREATE POLICY "Venue editors and admins can update venues"
ON venues FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('content_admin', 'system_admin'))
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM venue_editors
    WHERE venue_editors.venue_id = venues.id
    AND venue_editors.user_id = auth.uid()
  )
);

-- 4. RLS for venue_applications
ALTER TABLE venue_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved applications (for transparency)
CREATE POLICY "Public read approved applications"
ON venue_applications FOR SELECT
USING (status = 'approved');

-- Users can read their own applications
CREATE POLICY "Users can read own applications"
ON venue_applications FOR SELECT
USING (applicant_id = auth.uid());

-- Content admins can read all applications
CREATE POLICY "Content admins can read all applications"
ON venue_applications FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('content_admin', 'system_admin'))
);

-- Any authenticated user can submit an application
CREATE POLICY "Users can create applications"
ON venue_applications FOR INSERT
WITH CHECK (applicant_id = auth.uid());

-- Content admins can update applications (approve/reject)
CREATE POLICY "Content admins can update applications"
ON venue_applications FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('content_admin', 'system_admin'))
);

-- 5. Allow system_admin to update profiles.role
CREATE POLICY "System admins can update profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'system_admin')
);

-- 6. Trigger: when venue application is approved, create the venue and add applicant as editor
CREATE OR REPLACE FUNCTION handle_venue_application_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Create the venue
    INSERT INTO venues (name, slug, subtitle, description, review_mode, website, contact, created_by, accepting_submissions)
    VALUES (
      NEW.name, NEW.slug, NEW.subtitle, NEW.description, NEW.review_mode, NEW.website, NEW.contact,
      NEW.applicant_id, true
    );

    -- Add applicant as chief_editor of the new venue
    INSERT INTO venue_editors (venue_id, user_id, role)
    SELECT id, NEW.applicant_id, 'chief_editor'
    FROM venues WHERE slug = NEW.slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_venue_application_approved ON venue_applications;
CREATE TRIGGER on_venue_application_approved
AFTER UPDATE ON venue_applications
FOR EACH ROW EXECUTE FUNCTION handle_venue_application_approved();
