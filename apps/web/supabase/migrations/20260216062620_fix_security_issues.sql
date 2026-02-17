
ALTER TABLE venue_editors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read venue_editors" ON venue_editors FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION increment_view_count(paper_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.papers SET view_count = view_count + 1 WHERE id = paper_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_comment_count(p_paper_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.papers SET comment_count = comment_count + 1 WHERE id = p_paper_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
