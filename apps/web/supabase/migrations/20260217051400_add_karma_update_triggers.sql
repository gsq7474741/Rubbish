CREATE OR REPLACE FUNCTION update_karma_on_vote()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id uuid;
  karma_delta int;
BEGIN
  -- Determine the owner of the voted target
  IF NEW.target_type = 'paper' THEN
    SELECT author_id INTO target_user_id FROM papers WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'review' THEN
    SELECT reviewer_id INTO target_user_id FROM reviews WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'comment' THEN
    SELECT user_id INTO target_user_id FROM comments WHERE id = NEW.target_id;
  END IF;

  IF target_user_id IS NULL THEN RETURN NEW; END IF;

  -- Don't give karma for self-votes
  IF target_user_id = NEW.user_id THEN RETURN NEW; END IF;

  IF TG_OP = 'INSERT' THEN
    karma_delta := NEW.value; -- +1 or -1
  ELSIF TG_OP = 'UPDATE' THEN
    karma_delta := NEW.value - OLD.value; -- e.g. from -1 to +1 = +2
  ELSIF TG_OP = 'DELETE' THEN
    karma_delta := -OLD.value; -- undo
    target_user_id := NULL;
    IF OLD.target_type = 'paper' THEN
      SELECT author_id INTO target_user_id FROM papers WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'review' THEN
      SELECT reviewer_id INTO target_user_id FROM reviews WHERE id = OLD.target_id;
    ELSIF OLD.target_type = 'comment' THEN
      SELECT user_id INTO target_user_id FROM comments WHERE id = OLD.target_id;
    END IF;
    IF target_user_id IS NULL OR target_user_id = OLD.user_id THEN RETURN OLD; END IF;
  END IF;

  UPDATE profiles SET karma = karma + karma_delta WHERE id = target_user_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_karma_on_vote ON votes;
CREATE TRIGGER trg_karma_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_karma_on_vote();

-- Give karma for submitting papers (+5) and reviews (+3)
CREATE OR REPLACE FUNCTION karma_on_paper_submit()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET karma = karma + 5 WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_karma_paper ON papers;
CREATE TRIGGER trg_karma_paper
  AFTER INSERT ON papers
  FOR EACH ROW EXECUTE FUNCTION karma_on_paper_submit();

CREATE OR REPLACE FUNCTION karma_on_review_submit()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET karma = karma + 3 WHERE id = NEW.reviewer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_karma_review ON reviews;
CREATE TRIGGER trg_karma_review
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION karma_on_review_submit();
