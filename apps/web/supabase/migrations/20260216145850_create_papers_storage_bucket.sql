
-- Create storage bucket for paper files (PDF, supplementary, images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'papers',
  'papers',
  true,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/zip', 'application/x-tar', 'application/gzip']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/zip', 'application/x-tar', 'application/gzip'];

-- RLS: Anyone can read public files
CREATE POLICY "Public read access for papers bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'papers');

-- RLS: Authenticated users can upload to their own folder
CREATE POLICY "Authenticated users can upload to papers bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'papers'
  AND auth.role() = 'authenticated'
);

-- RLS: Users can update their own files
CREATE POLICY "Users can update own files in papers bucket"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'papers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Users can delete their own files
CREATE POLICY "Users can delete own files in papers bucket"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'papers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
