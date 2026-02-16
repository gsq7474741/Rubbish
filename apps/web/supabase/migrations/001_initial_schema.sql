-- ============================================================
-- 用户系统
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  institution TEXT,
  research_field TEXT,
  title TEXT,
  karma INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 子刊系统 (Venues)
-- ============================================================

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cover_image_url TEXT,
  logo_url TEXT,
  impact_factor NUMERIC DEFAULT 0,
  accepting_submissions BOOLEAN DEFAULT true,
  review_mode TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE venue_editors (
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor',
  PRIMARY KEY (venue_id, user_id)
);

-- ============================================================
-- 投稿系统 (Papers)
-- ============================================================

CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number SERIAL,
  venue_id UUID REFERENCES venues(id),
  author_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  abstract TEXT,
  keywords TEXT[],
  content_type TEXT NOT NULL,
  content_markdown TEXT,
  content_latex TEXT,
  latex_template TEXT DEFAULT 'rubber',
  latex_compile_status TEXT,
  latex_compile_log TEXT,
  latex_source_url TEXT,
  pdf_url TEXT,
  image_urls TEXT[],
  review_mode TEXT DEFAULT 'open',
  status TEXT DEFAULT 'submitted',
  decision TEXT,
  decision_at TIMESTAMPTZ,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  avg_rubbish_score NUMERIC(3,1) DEFAULT 0,
  avg_uselessness_score NUMERIC(3,1) DEFAULT 0,
  avg_entertainment_score NUMERIC(3,1) DEFAULT 0,
  hot_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE paper_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  institution TEXT,
  email TEXT,
  position INTEGER DEFAULT 0,
  is_corresponding BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (paper_id, position)
);

CREATE INDEX paper_authors_user_idx ON paper_authors(user_id);
CREATE INDEX paper_authors_paper_idx ON paper_authors(paper_id);

-- 全文搜索索引
CREATE INDEX papers_search_idx ON papers
  USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(abstract,'')));

-- ============================================================
-- 评审系统 (Reviews)
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  is_anonymous BOOLEAN DEFAULT false,
  rubbish_score INTEGER CHECK (rubbish_score BETWEEN 1 AND 10),
  uselessness_score INTEGER CHECK (uselessness_score BETWEEN 1 AND 10),
  entertainment_score INTEGER CHECK (entertainment_score BETWEEN 1 AND 10),
  summary TEXT,
  strengths TEXT,
  weaknesses TEXT,
  recommendation TEXT,
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rebuttals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 社区互动
-- ============================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  parent_id UUID REFERENCES comments(id),
  content TEXT NOT NULL,
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, target_type, target_id, emoji)
);

CREATE TABLE bookmarks (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, paper_id)
);

-- ============================================================
-- 成就系统
-- ============================================================

CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  condition_type TEXT,
  condition_value INTEGER
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ============================================================
-- 通知系统
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 举报系统
-- ============================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX reports_status_idx ON reports(status);
CREATE INDEX reports_target_idx ON reports(target_type, target_id);

-- ============================================================
-- 邀请码系统
-- ============================================================

CREATE TABLE invite_codes (
  code TEXT PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id),
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 中文搜索支持
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX papers_title_trgm_idx ON papers USING GIN (title gin_trgm_ops);
CREATE INDEX papers_abstract_trgm_idx ON papers USING GIN (abstract gin_trgm_ops);

-- ============================================================
-- 触发器: 评审提交/更新时自动刷新 papers 聚合评分
-- ============================================================

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

-- ============================================================
-- 触发器: 新用户注册时自动创建 profile
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RLS 策略
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read venues" ON venues FOR SELECT USING (true);

ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read papers" ON papers FOR SELECT USING (true);
CREATE POLICY "Author insert papers" ON papers FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author update papers" ON papers FOR UPDATE USING (auth.uid() = author_id);

ALTER TABLE paper_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read paper_authors" ON paper_authors FOR SELECT USING (true);
CREATE POLICY "Author manage paper_authors" ON paper_authors FOR ALL USING (
  EXISTS (SELECT 1 FROM papers WHERE papers.id = paper_authors.paper_id AND papers.author_id = auth.uid())
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviewer insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewer update own reviews" ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

ALTER TABLE rebuttals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rebuttals" ON rebuttals FOR SELECT USING (true);
CREATE POLICY "Author insert rebuttals" ON rebuttals FOR INSERT WITH CHECK (auth.uid() = author_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "User insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own votes" ON votes FOR ALL USING (auth.uid() = user_id);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Own reactions" ON reactions FOR ALL USING (auth.uid() = user_id);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read user_achievements" ON user_achievements FOR SELECT USING (true);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
