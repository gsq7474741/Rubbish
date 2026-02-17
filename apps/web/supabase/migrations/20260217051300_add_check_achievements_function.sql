CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id uuid)
RETURNS TABLE(achievement_id text, achievement_name text, achievement_icon text) AS $$
DECLARE
  rec RECORD;
  paper_cnt int;
  review_cnt int;
  comment_cnt int;
  certified_cnt int;
  too_good_cnt int;
  max_upvote int;
  venue_cnt int;
  total_venues int;
BEGIN
  -- Gather stats
  SELECT count(*) INTO paper_cnt FROM papers WHERE author_id = p_user_id;
  SELECT count(*) INTO review_cnt FROM reviews WHERE reviewer_id = p_user_id;
  SELECT count(*) INTO comment_cnt FROM comments WHERE user_id = p_user_id;
  SELECT count(*) INTO certified_cnt FROM papers WHERE author_id = p_user_id AND decision = 'certified_rubbish';
  SELECT count(*) INTO too_good_cnt FROM papers WHERE author_id = p_user_id AND decision = 'too_good';
  SELECT COALESCE(max(upvote_count), 0) INTO max_upvote FROM papers WHERE author_id = p_user_id;
  SELECT count(DISTINCT venue_id) INTO venue_cnt FROM papers WHERE author_id = p_user_id;
  SELECT count(*) INTO total_venues FROM venues;

  FOR rec IN SELECT * FROM achievements LOOP
    -- Skip if already unlocked
    IF EXISTS (SELECT 1 FROM user_achievements WHERE user_id = p_user_id AND user_achievements.achievement_id = rec.id) THEN
      CONTINUE;
    END IF;

    -- Check condition
    IF (rec.condition_type = 'paper_count' AND paper_cnt >= rec.condition_value)
       OR (rec.condition_type = 'review_count' AND review_cnt >= rec.condition_value)
       OR (rec.condition_type = 'comment_count' AND comment_cnt >= rec.condition_value)
       OR (rec.condition_type = 'certified_count' AND certified_cnt >= rec.condition_value)
       OR (rec.condition_type = 'too_good_count' AND too_good_cnt >= rec.condition_value)
       OR (rec.condition_type = 'upvote_single' AND max_upvote >= rec.condition_value)
       OR (rec.condition_type = 'venue_coverage' AND total_venues > 0 AND venue_cnt >= total_venues)
    THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (p_user_id, rec.id);
      achievement_id := rec.id;
      achievement_name := rec.name;
      achievement_icon := rec.icon;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
