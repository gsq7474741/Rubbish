
CREATE OR REPLACE FUNCTION update_paper_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE papers SET
    review_count = (SELECT count(*) FROM reviews WHERE paper_id = COALESCE(NEW.paper_id, OLD.paper_id)),
    avg_rubbish_score = (SELECT ROUND(AVG(rubbish_score)::numeric, 1) FROM reviews WHERE paper_id = COALESCE(NEW.paper_id, OLD.paper_id)),
    avg_uselessness_score = (SELECT ROUND(AVG(uselessness_score)::numeric, 1) FROM reviews WHERE paper_id = COALESCE(NEW.paper_id, OLD.paper_id)),
    avg_entertainment_score = (SELECT ROUND(AVG(entertainment_score)::numeric, 1) FROM reviews WHERE paper_id = COALESCE(NEW.paper_id, OLD.paper_id)),
    updated_at = now()
  WHERE id = COALESCE(NEW.paper_id, OLD.paper_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_paper_review_stats();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'user_name',
    split_part(NEW.email, '@', 1)
  );

  -- Sanitize: keep only alphanumeric, underscore, hyphen
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g');

  -- Ensure not empty
  IF base_username = '' THEN
    base_username := 'user';
  END IF;

  final_username := base_username;

  -- Handle uniqueness: append random suffix if conflict
  LOOP
    BEGIN
      INSERT INTO public.profiles (id, username, display_name, avatar_url)
      VALUES (
        NEW.id,
        final_username,
        COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'name',
          NEW.raw_user_meta_data->>'display_name',
          split_part(NEW.email, '@', 1)
        ),
        COALESCE(
          NEW.raw_user_meta_data->>'avatar_url',
          NEW.raw_user_meta_data->>'picture'
        )
      );
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      suffix := suffix + 1;
      final_username := base_username || '_' || floor(random() * 9000 + 1000)::int;
      IF suffix > 10 THEN
        -- Fallback: use UUID fragment
        final_username := base_username || '_' || substr(replace(NEW.id::text, '-', ''), 1, 6);
        INSERT INTO public.profiles (id, username, display_name, avatar_url)
        VALUES (
          NEW.id,
          final_username,
          COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'display_name',
            split_part(NEW.email, '@', 1)
          ),
          COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture'
          )
        );
        RETURN NEW;
      END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
